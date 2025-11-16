import React from 'react';

function TestComponent() {
  console.log('🧪 TestComponent is rendering...');

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f0f9ff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '32px',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        maxWidth: '400px',
        width: '100%',
        textAlign: 'center'
      }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: 'bold',
          color: '#059669',
          marginBottom: '16px'
        }}>✅ React Test</h1>
        <p style={{
          color: '#6b7280',
          marginBottom: '16px'
        }}>If you can see this, React is working!</p>
        <p style={{
          fontSize: '14px',
          color: '#9ca3af'
        }}>Basic React component rendered successfully.</p>
        <button
          onClick={() => console.log('Button clicked!')}
          style={{
            backgroundColor: '#059669',
            color: 'white',
            padding: '8px 16px',
            border: 'none',
            borderRadius: '4px',
            marginTop: '16px',
            cursor: 'pointer'
          }}
        >
          Test Button
        </button>
      </div>
    </div>
  );
}

export default TestComponent;
