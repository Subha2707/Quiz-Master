// eslint-disable-next-line no-unused-vars
import React from 'react';

export default function LoadingScreen({ title = 'Loading', subtitle = 'Preparing your experience...' }) {
  return (
    <div className="loader-shell" role="status" aria-live="polite">
      <div className="loader-orbit" aria-hidden="true">
        <span></span>
        <span></span>
        <span></span>
      </div>
      <h2>{title}</h2>
      <p>{subtitle}</p>
      <div className="loader-dots" aria-hidden="true">
        <i></i>
        <i></i>
        <i></i>
      </div>
    </div>
  );
}
