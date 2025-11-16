import React from 'react';
import { AppProvider, useApp } from './contexts/AppContext.jsx';
import LoginPage from './components/LoginPage';
import OrderTypePage from './components/OrderTypePage';
import DeliveryAddressPage from './components/DeliveryAddressPage';
import MenuPage from './components/MenuPage';
import PaymentPage from './components/PaymentPage';
import ReceiptPage from './components/ReceiptPage';
import UserProfilePage from './components/UserProfilePage';
import CartSidebar from './components/CartSidebar';

function AppContent() {
  console.log('🚀 Restaurant Billing System - AppContent rendering...');

  try {
    const { state } = useApp();
    const { currentPage, loading, user } = state;

    console.log('🚀 App state:', { currentPage, loading, user: user ? 'authenticated' : 'not authenticated' });

    if (loading) {
      console.log('🚀 Showing loading screen...');
      return (
        <div style={{
          minHeight: '100vh',
          backgroundColor: '#fef2f2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Arial, sans-serif'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '64px',
              height: '64px',
              margin: '0 auto 1.5rem',
              border: '4px solid #fecaca',
              borderTop: '4px solid #ef4444',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>
              🍽️ Restaurant System
            </h2>
            <p style={{ color: '#6b7280' }}>Loading your dining experience...</p>
            <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginTop: '0.5rem' }}>
              Connecting to Firebase...
            </p>
          </div>
        </div>
      );
    }

    // Authentication guard - redirect to login if not authenticated
    const isAuthenticated = user !== null;
    const protectedPages = ['orderType', 'deliveryAddress', 'menu', 'payment', 'receipt', 'profile'];

    if (!isAuthenticated && protectedPages.includes(currentPage)) {
      return <LoginPage />;
    }

    const renderCurrentPage = () => {
      switch (currentPage) {
        case 'login':
          return <LoginPage />;
        case 'orderType':
          return isAuthenticated ? <OrderTypePage /> : <LoginPage />;
        case 'deliveryAddress':
          return isAuthenticated ? <DeliveryAddressPage /> : <LoginPage />;
        case 'menu':
          return isAuthenticated ? <MenuPage /> : <LoginPage />;
        case 'payment':
          return isAuthenticated ? <PaymentPage /> : <LoginPage />;
        case 'receipt':
          return isAuthenticated ? <ReceiptPage /> : <LoginPage />;
        case 'profile':
          return isAuthenticated ? <UserProfilePage /> : <LoginPage />;
        default:
          console.log('🚀 Defaulting to login page');
          return <LoginPage />;
      }
    };

    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
        {renderCurrentPage()}
        {isAuthenticated && <CartSidebar />}
      </div>
    );
  } catch (error) {
    console.error('🚨 Error in AppContent:', error);
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#fef2f2',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '8px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          maxWidth: '400px',
          width: '100%',
          textAlign: 'center'
        }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#dc2626', marginBottom: '1rem' }}>
            🍽️ System Error
          </h1>
          <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
            Restaurant billing system encountered an error.
          </p>
          <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '1rem' }}>
            {error.message}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: '#dc2626',
              color: 'white',
              padding: '0.5rem 1.5rem',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={e => e.target.style.backgroundColor = '#b91c1c'}
            onMouseOut={e => e.target.style.backgroundColor = '#dc2626'}
          >
            Restart System
          </button>
        </div>
      </div>
    );
  }
}

function App() {
  console.log('🚀 Restaurant Billing System - App component rendering...');

  try {
    return (
      <AppProvider>
        <AppContent />
      </AppProvider>
    );
  } catch (error) {
    console.error('🚨 Error in Restaurant App:', error);
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#fef2f2',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '8px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          maxWidth: '400px',
          width: '100%',
          textAlign: 'center'
        }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#dc2626', marginBottom: '1rem' }}>
            🍽️ System Error
          </h1>
          <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
            Failed to initialize restaurant system.
          </p>
          <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '1rem' }}>
            {error.message}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: '#dc2626',
              color: 'white',
              padding: '0.5rem 1.5rem',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Restart System
          </button>
        </div>
      </div>
    );
  }
}

export default App;
