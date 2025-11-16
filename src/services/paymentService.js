// Payment service for Razorpay integration
export class PaymentService {
  constructor() {
    // Test Razorpay key for development/testing
    // For production, this should be moved to environment variables
    this.razorpayKey = 'rzp_test_1DP5mmOlF5G5ag'; // Razorpay test key (public)

    // Log test mode info
    console.log('🧪 Razorpay Test Mode Enabled');
    console.log('📝 Test Card: 4111111111111111 | Expiry: 12/25 | CVV: 123');
    console.log('💰 Test UPI: success@razorpay');
  }

  // Load Razorpay script dynamically
  loadRazorpayScript() {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  // Create Razorpay order
  async createOrder(orderData) {
    try {
      // This would typically call your backend API to create a Razorpay order
      // For now, returning mock order data
      return {
        id: `order_${Date.now()}`,
        amount: orderData.amount * 100, // Razorpay expects amount in paise
        currency: 'INR',
        receipt: `receipt_${Date.now()}`
      };
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  // Process payment with Razorpay
  async processPayment(orderData, userDetails, onSuccess, onFailure) {
    try {
      const isScriptLoaded = await this.loadRazorpayScript();
      if (!isScriptLoaded) {
        throw new Error('Razorpay SDK failed to load');
      }

      const order = await this.createOrder(orderData);

      const options = {
        key: this.razorpayKey,
        amount: order.amount,
        currency: order.currency,
        name: 'Meal Minds',
        description: `Order #${orderData.orderId}`,
        order_id: order.id,
        handler: (response) => {
          // Payment successful
          onSuccess({
            paymentId: response.razorpay_payment_id,
            orderId: response.razorpay_order_id,
            signature: response.razorpay_signature
          });
        },
        prefill: {
          name: userDetails.name || 'Customer',
          email: userDetails.email || '',
          contact: userDetails.phone || ''
        },
        theme: {
          color: '#e74c3c'
        },
        modal: {
          ondismiss: () => {
            onFailure('Payment cancelled by user');
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      console.error('Payment processing error:', error);
      onFailure(error.message);
    }
  }

  // Verify payment (would typically be done on backend)
  async verifyPayment(paymentData) {
    try {
      // This would call your backend to verify the payment
      // For now, returning success
      return { verified: true };
    } catch (error) {
      console.error('Payment verification error:', error);
      throw error;
    }
  }
}

export const paymentService = new PaymentService();
