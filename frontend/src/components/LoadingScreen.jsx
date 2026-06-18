// eslint-disable-next-line no-unused-vars
import React from 'react';

export default function LoadingScreen({ title = 'Loading', subtitle = 'Preparing your experience...' }) {
  return (
    <div className="loader-shell" role="status" aria-live="polite">
      <div className="loader-mark" aria-hidden="true">
        <div className="loader-ring"></div>
        <div className="loader-core"></div>
      </div>
      <h2>{title}</h2>
      <p>{subtitle}</p>
      <div className="loader-line" aria-hidden="true">
        <span></span>
      </div>
    </div>
  );
}
