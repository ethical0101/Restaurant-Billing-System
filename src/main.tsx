import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';

console.log('🚀 main.tsx is executing...');
console.log('🚀 DOM root element:', document.getElementById('root'));

try {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('Root element not found!');
  }

  console.log('🚀 Creating React root...');
  const root = createRoot(rootElement);

  console.log('🚀 Rendering App...');
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );

  console.log('🚀 App rendered successfully!');
} catch (error) {
  console.error('🚨 Error in main.tsx:', error);
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  document.body.innerHTML = `
    <div style="padding: 20px; background: #fee; color: #c00; font-family: monospace;">
      <h1>Startup Error</h1>
      <p>Error: ${errorMessage}</p>
      <p>Check console for details.</p>
    </div>
  `;
}
