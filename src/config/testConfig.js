// Test configuration for Razorpay payments
// This file contains test credentials and testing information

export const TEST_CONFIG = {
  // Test Razorpay Key (This is a sample public test key)
  RAZORPAY_TEST_KEY: 'rzp_test_1DP5mmOlF5G5ag',

  // Test payment details for development
  TEST_PAYMENTS: {
    SUCCESS: {
      card: '4111111111111111', // Test Visa card
      expiry: '12/25',
      cvv: '123',
      name: 'Test User'
    },
    UPI: {
      upiId: 'test@paytm', // Test UPI ID
      description: 'Use this for testing UPI payments'
    }
  },

  // Test scenarios
  TEST_SCENARIOS: {
    SUCCESS: 'Use card number 4111111111111111 with any future expiry and any 3-digit CVV',
    FAILURE: 'Use card number 4000000000000002 to simulate payment failure',
    NETWORK_ERROR: 'Use card number 4000000000000119 to simulate network error'
  },

  // Important notes for testing
  NOTES: [
    '🔹 This is using Razorpay TEST mode - no real money will be charged',
    '🔹 Test card: 4111111111111111 (Visa)',
    '🔹 Use any future date for expiry (e.g., 12/25)',
    '🔹 Use any 3-digit CVV (e.g., 123)',
    '🔹 Test UPI: success@razorpay',
    '🔹 All payments in test mode will show as successful but are not real transactions',
    '🔹 For production, replace with your actual Razorpay Live API key'
  ]
};

// Function to log test payment info
export const logTestPaymentInfo = () => {
  console.log('🧪 RAZORPAY TEST MODE ENABLED');
  console.log('📝 Test Payment Details:');
  console.log('💳 Card Number: 4111111111111111');
  console.log('📅 Expiry: Any future date (e.g., 12/25)');
  console.log('🔒 CVV: Any 3 digits (e.g., 123)');
  console.log('💰 UPI: success@razorpay');
  console.log('⚠️  Note: No real money will be charged in test mode');
};
