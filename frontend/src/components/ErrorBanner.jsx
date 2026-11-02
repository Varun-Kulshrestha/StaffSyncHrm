import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function ErrorBanner({ message }) {
  if (!message) return null;

  return (
    <div data-testid="error-banner" id="error-banner" className="error-banner">
      <AlertCircle size={20} style={{ flexShrink: 0 }} />
      <span>{message}</span>
    </div>
  );
}
