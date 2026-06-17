require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const Groq = require('groq-sdk');
const fs = require('fs');
const path = require('path');
const dns = require('dns');


// Models
const User = require('./models/User');
const Quiz = require('./models/Quiz');
const Question = require('./models/Question');
const Result = require('./models/Result');




const app = express();
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://quiz-master-application.netlify.app"
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true
  })
);
app.use(express.json());

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  dest: uploadDir,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'text/plain', 'text/csv', 'application/json'];
    const allowedExtensions = ['.pdf', '.txt', '.csv', '.json'];
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(ext)) {
      cb(null, true);
      return;
    }

    cb(new Error('Only PDF, TXT, CSV, and JSON files are supported'));
  }
});

// Database Connection
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI_STANDARD || 
                  process.env.MONGO_URI || 
                  process.env.MONGO_URL || 
                  process.env.MONGOURL || 
                  process.env.MONGODB_URI;
const MONGO_DB_NAME = process.env.MONGO_DB_NAME || 'quiz-platform';
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';
const MAIN_ADMIN_EMAIL = 'deysubhadip66@gmail.com';

if (process.env.MONGO_DNS_SERVERS) {
  dns.setServers(process.env.MONGO_DNS_SERVERS.split(',').map(server => server.trim()).filter(Boolean));
} else {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
}

const isPlaceholderUri = (uri) => {
  if (!uri) return true;
  const normalized = uri.toLowerCase();
  return normalized.includes('your_mongodb_atlas_cluster_link_here') || 
         normalized.includes('your_mongodb_connection_string') ||
         normalized.includes('placeholder');
};

if (MONGO_URI && !isPlaceholderUri(MONGO_URI)) {
  mongoose.connect(MONGO_URI, {
    dbName: MONGO_DB_NAME,
    serverSelectionTimeoutMS: 15000
  })
    .then(() => console.log("MongoDB connected successfully!"))
    .catch(err => {
      console.error("MongoDB connection error:", err.message);
      if (err.code === 'ECONNREFUSED' || err.syscall === 'querySrv') {
        console.error("MongoDB DNS lookup failed. Try another network/DNS, or set MONGO_DNS_SERVERS=8.8.8.8,1.1.1.1 in backend/.env.");
      }
    });
} else {
  console.log("Waiting for MongoDB URI in .env");
}

const requireDatabase = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ error: 'Database is not connected. Add MONGO_URI to backend/.env and restart the server.' });
  }
  next();
};

const authMiddleware = (req, res, next) => {

  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'secret'
    );

    req.user = decoded;

    next();

  } catch {

    return res.status(401).json({ error: 'Invalid token' });
  }
};

const adminOnly = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (user?.email === MAIN_ADMIN_EMAIL && user.role !== 'ADMIN') {
      user.role = 'ADMIN';
      await user.save();
    }

    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied. Admins only.' });
    }
    next();
  } catch (err) {
    res.status(500).json({ error: 'Server error checking privileges' });
  }
};

const mainAdminOnly = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.email !== MAIN_ADMIN_EMAIL) {
      return res.status(403).json({ error: 'Only the main admin can manage admin access.' });
    }
    next();
  } catch (err) {
    res.status(500).json({ error: 'Server error checking main admin privileges' });
  }
};


const isValidEmailFormat = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const hasMailExchange = async (email) => {
  const domain = email.split('@')[1];
  try {
    const records = await dns.promises.resolveMx(domain);
    return records.length > 0;
  } catch {
    return false;
  }
};


const getGroqClient = () => {
  if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'your_groq_api_key_here') {
    return null;
  }

  return new Groq({ apiKey: process.env.GROQ_API_KEY });
};

const extractJsonArray = (content) => {
  if (!content) {
    throw new Error('AI returned an empty response');
  }

  const cleaned = content
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();
  const start = cleaned.indexOf('[');
  const end = cleaned.lastIndexOf(']');

  if (start === -1 || end === -1 || end <= start) {
    throw new Error('AI response did not contain a JSON array');
  }

  return JSON.parse(cleaned.slice(start, end + 1));
};

const normalizeQuestions = (questions, expectedCount) => {
  if (!Array.isArray(questions)) {
    throw new Error('AI response must be a JSON array');
  }

  return questions.slice(0, expectedCount).map((q, index) => {
    const options = Array.isArray(q.options) ? q.options.slice(0, 4).map(String) : [];
    const correctOptionIndex = Number(q.correctOptionIndex);

    if (!q.questionText || options.length !== 4 || !Number.isInteger(correctOptionIndex) || correctOptionIndex < 0 || correctOptionIndex > 3) {
      throw new Error(`Invalid AI question format at item ${index + 1}`);
    }

    return {
      questionText: String(q.questionText).trim(),
      options,
      correctOptionIndex,
      section: q.section ? String(q.section).trim() : undefined
    };
  });
};

// ---------------------------------------------------------
// AUTHENTICATION ROUTES
// ---------------------------------------------------------

app.post('/api/auth/register', requireDatabase, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Name, email and password are required'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({
      email: normalizedEmail
    });

    if (existingUser) {
      return res.status(400).json({
        message: 'User already exists'
      });
    }

    const salt = await bcrypt.genSalt(10);

    const passwordHash = await bcrypt.hash(
      password,
      salt
    );

    const newUser = new User({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role:
        normalizedEmail === MAIN_ADMIN_EMAIL
          ? 'ADMIN'
          : 'USER'
    });

    await newUser.save();

    const token = jwt.sign(
      {
        id: newUser._id,
        role: newUser.role
      },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1d' }
    );

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });

  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }
});


app.post('/api/auth/login', requireDatabase, async (req, res) => {
  try {

    const { email, password } = req.body;

    const user = await User.findOne({
      email: email.toLowerCase().trim()
    });

    if (!user) {
      return res.status(400).json({
        message: 'Invalid credentials'
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!isMatch) {
      return res.status(400).json({
        message: 'Invalid credentials'
      });
    }

    if (
      user.email === MAIN_ADMIN_EMAIL &&
      user.role !== 'ADMIN'
    ) {
      user.role = 'ADMIN';
      await user.save();
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role
      },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }
});

app.post('/api/auth/forgot-password', requireDatabase, async (req, res) => {
  try {

    const { email } = req.body;

    const user = await User.findOne({
      email: email.toLowerCase().trim()
    });

    if (!user) {
      return res.status(400).json({
        message: 'User not found'
      });
    }

    const code = String(
      Math.floor(
        100000 + Math.random() * 900000
      )
    );

    user.resetCode = code;

    await user.save();

    res.json({
      message: 'Verification code generated',
      devCode: code
    });

  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }
});

app.post('/api/auth/verify-reset-code', requireDatabase, async (req, res) => {
  try {

    const { email, code } = req.body;

    const user = await User.findOne({
      email: email.toLowerCase().trim()
    });

    if (!user) {
      return res.status(400).json({
        message: 'User not found'
      });
    }

    if (user.resetCode !== code) {
      return res.status(400).json({
        message: 'Invalid verification code'
      });
    }

    res.json({
      message: 'Code verified successfully'
    });

  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }
});

app.post('/api/auth/reset-password', requireDatabase, async (req, res) => {
  try {

    const {
      email,
      code,
      password
    } = req.body;

    const user = await User.findOne({
      email: email.toLowerCase().trim()
    });

    if (!user) {
      return res.status(400).json({
        message: 'User not found'
      });
    }

    if (user.resetCode !== code) {
      return res.status(400).json({
        message: 'Invalid verification code'
      });
    }

    const salt = await bcrypt.genSalt(10);

    user.passwordHash =
      await bcrypt.hash(
        password,
        salt
      );

    user.resetCode = undefined;

    await user.save();

    res.json({
      message: 'Password reset successful'
    });

  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }
});

// ---------------------------------------------------------
// ADMIN ACCESS ROUTES
// ---------------------------------------------------------

app.get('/api/admin/users', requireDatabase, authMiddleware, mainAdminOnly, async (req, res) => {
  try {
    const users = await User.find({}, 'name email role createdAt').sort({ createdAt: -1 }).lean();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/admin/users/:id/role', requireDatabase, authMiddleware, mainAdminOnly, async (req, res) => {
  try {
    const { role } = req.body;
    if (!['USER', 'ADMIN'].includes(role)) {
      return res.status(400).json({ error: 'Role must be USER or ADMIN' });
    }

    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (targetUser.email === MAIN_ADMIN_EMAIL && role !== 'ADMIN') {
      return res.status(400).json({ error: 'The main admin role cannot be removed.' });
    }

    targetUser.role = role;
    await targetUser.save();

    res.json({
      message: 'Admin access updated successfully',
      user: { id: targetUser._id, name: targetUser.name, email: targetUser.email, role: targetUser.role }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------
// AI GENERATION ROUTES
// ---------------------------------------------------------

// Generate from Prompt
app.post('/api/quizzes/generate', requireDatabase, authMiddleware, adminOnly, async (req, res) => {
  try {
    const groq = getGroqClient();
    if (!groq) return res.status(500).json({ error: "Groq API key missing in .env" });

    const {
      title,
      durationMinutes,
      negativeMarkingWeight = 0,
      prompt,
      numQuestions,
      sections,
      createdBy
    } = req.body;

    const totalQuestions = Number(numQuestions);
    if (!title || !prompt || !Number.isInteger(totalQuestions) || totalQuestions < 1) {
      return res.status(400).json({ error: "Title, prompt, and a valid number of questions are required" });
    }

    const sectionInstruction = sections
      ? `Respect this section plan: ${sections}. Include a "section" field for each question.`
      : `Infer useful sections from the prompt when appropriate.`;

    const systemPrompt = `You are an expert quiz generator. Generate exactly ${totalQuestions} multiple-choice questions based on the user's topic and instructions.
    ${sectionInstruction}
    Format the output STRICTLY as a JSON array of objects. 
    Each object must have: 
    - "questionText" (string)
    - "options" (array of 4 strings)
    - "correctOptionIndex" (integer 0-3)
    - "section" (string, optional).
    Do not output any markdown formatting like \`\`\`json, just the raw JSON array.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      model: GROQ_MODEL,
      temperature: 0.5,
    });

    const aiOutput = chatCompletion.choices[0]?.message?.content;
    const generatedQuestions = normalizeQuestions(extractJsonArray(aiOutput), totalQuestions);

    // Save Quiz to DB
    const newQuiz = new Quiz({
      title: title.trim(),
      description: prompt,
      durationMinutes: Number(durationMinutes) || 30,
      negativeMarkingWeight: Number(negativeMarkingWeight) || 0,
      createdBy: req.user.id
    });
    await newQuiz.save();

    // Attach Quiz ID and Save Questions
    const questionsToInsert = generatedQuestions.map(q => ({ ...q, quizId: newQuiz._id }));
    await Question.insertMany(questionsToInsert);

    res.status(201).json({ message: "Quiz generated successfully", quizId: newQuiz._id, questionsCreated: questionsToInsert.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Bulk Upload & Generate from File
app.post('/api/upload-questions', requireDatabase, authMiddleware, adminOnly, upload.single('file'), async (req, res) => {
  let uploadedPath;
  try {
    uploadedPath = req.file?.path;
    const groq = getGroqClient();
    if (!groq) return res.status(500).json({ error: "Groq API key missing in .env" });
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    let extractedText = "";
    const ext = path.extname(req.file.originalname).toLowerCase();

    // Basic PDF parsing
    if (req.file.mimetype === 'application/pdf' || ext === '.pdf') {
      const dataBuffer = fs.readFileSync(req.file.path);
      const data = await pdfParse(dataBuffer);
      extractedText = data.text;
    } else {
      // Treat as plain text
      extractedText = fs.readFileSync(req.file.path, 'utf8');
    }

    if (!extractedText.trim()) {
      return res.status(400).json({ error: "Could not read any text from the uploaded file" });
    }

    const numQuestions = Number(req.body.numQuestions) || 10;
    const durationMinutes = Number(req.body.durationMinutes) || 30;
    const negativeMarkingWeight = Number(req.body.negativeMarkingWeight) || 0;
    const title = req.body.title || `Quiz from File: ${req.file.originalname}`;

    const systemPrompt = `You are an expert quiz generator. Read the following text and generate exactly ${numQuestions} multiple-choice questions based only on the file content.
    Format the output STRICTLY as a JSON array of objects. 
    Each object must have: 
    - "questionText" (string)
    - "options" (array of 4 strings)
    - "correctOptionIndex" (integer 0-3).
    Do not output any markdown formatting like \`\`\`json, just the raw JSON array.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: extractedText.substring(0, 4000) }
      ],
      model: GROQ_MODEL,
      temperature: 0.2,
    });

    const aiOutput = chatCompletion.choices[0]?.message?.content;
    const generatedQuestions = normalizeQuestions(extractJsonArray(aiOutput), numQuestions);

    // Create a generic quiz for these uploaded questions
    const newQuiz = new Quiz({ title, description: `Generated from uploaded file: ${req.file.originalname}`, durationMinutes, negativeMarkingWeight, createdBy: req.user.id });
    await newQuiz.save();

    const questionsToInsert = generatedQuestions.map(q => ({ ...q, quizId: newQuiz._id }));
    await Question.insertMany(questionsToInsert);

    res.status(201).json({ message: "Questions uploaded and parsed successfully", quizId: newQuiz._id, questionsCreated: questionsToInsert.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  } finally {
    if (uploadedPath && fs.existsSync(uploadedPath)) {
      fs.unlinkSync(uploadedPath);
    }
  }
});
app.get(
  '/api/results/leaderboard',
  requireDatabase,
  async (req, res) => {

    try {

      const results = await Result.find()

        .populate('userId', 'name')
        .sort({ score: -1 })

        .limit(20);

      const leaderboard = await Promise.all(

        results.map(async (r) => {

          const totalQuestions =
            await Question.countDocuments({
              quizId: r.quizId
            });

          return {

            _id: r._id,

            name:
              r.userId?.name || 'Unknown',

            score: r.score,

            accuracy:
              totalQuestions > 0

                ? Math.round(
                    (r.score / totalQuestions)
                    * 100
                  )

                : 0
          };
        })
      );

      res.json(leaderboard);

    } catch (err) {

      res.status(500).json({
        error: err.message
      });
    }
  }
);

app.get(
  '/api/results/my-stats',
  requireDatabase,
  authMiddleware,
  async (req, res) => {

    try {

      const results = await Result.find({
        userId: req.user.id
      });

      let totalAccuracy = 0;

      for (const r of results) {

        const totalQuestions =
          await Question.countDocuments({
            quizId: r.quizId
          });

        const accuracy =
          totalQuestions > 0

            ? (r.score / totalQuestions) * 100

            : 0;

        totalAccuracy += accuracy;
      }

      const quizzesTaken =
        results.length;

      const averageScore =
        quizzesTaken > 0

          ? Math.round(
              totalAccuracy /
              quizzesTaken
            )

          : 0;

      // RANKING

      const allResults =
        await Result.find();

      const sorted =
        [...allResults].sort(
          (a, b) => b.score - a.score
        );

      const userRank =
        sorted.findIndex(

          r =>
            r.userId.toString() ===
            req.user.id

        ) + 1;

      res.json({

        quizzesTaken,

        averageScore,

        rank:
          userRank > 0
            ? userRank
            : '-',

        streak:
          quizzesTaken
      });

    } catch (err) {

      console.error(err);

      res.status(500).json({

        error: err.message
      });
    }
  }
);


// Get Quizzes
app.get('/api/quizzes', requireDatabase, async (req, res) => {
  try {
    const quizzes = await Quiz.find({ isActive: true }).sort({ createdAt: -1 }).lean();
    const quizzesWithCount = await Promise.all(quizzes.map(async (quiz) => {
      const questionCount = await Question.countDocuments({ quizId: quiz._id });
      return { ...quiz, questionCount };
    }));
    res.json(quizzesWithCount);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/quizzes/:id', requireDatabase, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ error: "Quiz not found" });
    res.json(quiz);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/quizzes/:id/questions', requireDatabase, async (req, res) => {
  try {
    const questions = await Question.find({ quizId: req.params.id }).sort({ createdAt: 1 });
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post(
  '/api/quizzes/:id/submit',
  requireDatabase,
  authMiddleware,
  async (req, res) => {

    try {

      const { answers, startTime, endTime } = req.body;
      const quizId = req.params.id;
      const userId = req.user.id;

      const questions = await Question.find({
        quizId
      });

      let score = 0;
      let correct = 0;

      const formattedAnswers = [];

      questions.forEach((q) => {

        const selected = answers[q._id];

        console.log({
          question: q.questionText,
          selected,
          correct: q.correctOptionIndex,
          matched:
            Number(selected) ===
            Number(q.correctOptionIndex)
        });

        formattedAnswers.push({
          questionId: q._id,
          selectedOptionIndex: selected
        });

        if (Number(selected) === Number(q.correctOptionIndex)){
          score += 1;
          correct++;
        }
      });

      const result = new Result({
        userId,
        quizId,
        startTime,
        endTime,
        score,
        answers: formattedAnswers
      });

      console.log("FINAL SCORE:", score);
      await result.save();

      const accuracy =
        questions.length > 0
          ? Math.round(
              (correct / questions.length) * 100
            )
          : 0;

      res.json({
        message: 'Quiz submitted successfully',
        score,
        accuracy,
        totalQuestions: questions.length
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({
        error: err.message
      });
    }
  }
);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
