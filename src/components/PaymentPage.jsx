import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext.jsx';
import { paymentService } from '../services/paymentService';
import { restaurantService } from '../services/restaurantService';
import { ArrowLeft, CreditCard, Smartphone, Banknote, Users, Percent } from 'lucide-react';

const PaymentPage = () => {
  const { state, dispatch, actionTypes } = useApp();
  const { cart, paymentMethod, discount, splitCount } = state;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [discountInput, setDiscountInput] = useState('');
  const [splitInput, setSplitInput] = useState('1');

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountAmount = Math.min(discount, cartTotal);
  const finalTotal = Math.max(0, cartTotal - discountAmount);
  const splitAmount = finalTotal / splitCount;

  useEffect(() => {
    setSplitInput(splitCount.toString());
  }, [splitCount]);

  const paymentOptions = [
    {
      id: 'upi',
      title: 'UPI Payment',
      icon: <Smartphone className="w-8 h-8" />,
      description: 'Pay using UPI apps like PhonePe, Google Pay'
    },
    {
      id: 'card',
      title: 'Card Payment',
      icon: <CreditCard className="w-8 h-8" />,
      description: 'Credit or Debit Card'
    },
    {
      id: 'cash',
      title: 'Cash Payment',
      icon: <Banknote className="w-8 h-8" />,
      description: 'Pay with cash at counter/delivery'
    }
  ];

  const handlePaymentMethodSelect = (method) => {
    dispatch({ type: actionTypes.SET_PAYMENT_METHOD, payload: method });
  };

  const handleDiscountChange = (e) => {
    const value = e.target.value;
    setDiscountInput(value);
    const numValue = parseFloat(value) || 0;
    dispatch({ type: actionTypes.SET_DISCOUNT, payload: numValue });
  };

  const handleSplitCountChange = (e) => {
    const value = e.target.value;
    setSplitInput(value);
    const numValue = Math.max(1, parseInt(value) || 1);
    dispatch({ type: actionTypes.SET_SPLIT_COUNT, payload: numValue });
  };

  const handleConfirmPayment = async () => {
    if (!paymentMethod) {
      setError('Please select a payment method');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Generate order ID
      const orderId = `MMA${Date.now()}`;
      dispatch({ type: actionTypes.SET_ORDER_ID, payload: orderId });

      // Prepare order data for Firebase
      const orderData = {
        orderId,
        userId: state.user?.uid || 'guest',
        userEmail: state.user?.email || '',
        items: cart,
        orderType: state.orderType,
        deliveryAddress: state.deliveryAddress,
        paymentMethod,
        subtotal: cartTotal,
        discount: discountAmount,
        total: finalTotal,
        splitCount,
        tableNumber: state.tableNumber,
        status: 'pending'
      };

      if (paymentMethod === 'cash') {
        // For cash payment, save order to Firebase and proceed to receipt
        try {
          const firebaseOrderId = await restaurantService.saveOrder(orderData);
          console.log('Order saved to Firebase:', firebaseOrderId);

          // Save payment record
          await restaurantService.savePayment({
            orderId,
            firebaseOrderId,
            paymentMethod: 'cash',
            amount: finalTotal,
            status: 'pending',
            paymentId: null
          });

          dispatch({ type: actionTypes.SET_CURRENT_PAGE, payload: 'receipt' });
        } catch (dbError) {
          console.error('Error saving to database:', dbError);
          // Still proceed to receipt even if DB save fails
          setError('Order placed but may not be saved to database');
          dispatch({ type: actionTypes.SET_CURRENT_PAGE, payload: 'receipt' });
        }
      } else if (paymentMethod === 'upi' || paymentMethod === 'card') {
        // For UPI/Card payments, use Razorpay
        const razorpayOrderData = {
          orderId,
          amount: finalTotal,
          items: cart,
          orderType: state.orderType,
          deliveryAddress: state.deliveryAddress
        };

        const userDetails = {
          name: state.user?.displayName || 'Customer',
          email: state.user?.email || '',
          phone: state.user?.phoneNumber || ''
        };

        await paymentService.processPayment(
          razorpayOrderData,
          userDetails,
          async (response) => {
            // Payment successful - save to Firebase
            try {
              const firebaseOrderId = await restaurantService.saveOrder({
                ...orderData,
                status: 'paid'
              });

              // Save payment record
              await restaurantService.savePayment({
                orderId,
                firebaseOrderId,
                paymentMethod,
                amount: finalTotal,
                status: 'completed',
                paymentId: response.paymentId,
                razorpayOrderId: response.orderId,
                signature: response.signature
              });

              console.log('Payment successful and order saved:', response);
              dispatch({ type: actionTypes.SET_CURRENT_PAGE, payload: 'receipt' });
            } catch (dbError) {
              console.error('Payment successful but database error:', dbError);
              // Still proceed to receipt
              dispatch({ type: actionTypes.SET_CURRENT_PAGE, payload: 'receipt' });
            }
          },
          (error) => {
            // Payment failed
            setError(`Payment failed: ${error}`);
          }
        );
      }
    } catch (error) {
      setError(`Payment error: ${error.message}`);
    }

    setLoading(false);
  };

  const handleBack = () => {
    dispatch({ type: actionTypes.SET_CURRENT_PAGE, payload: 'menu' });
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">Your cart is empty</p>
          <button
            onClick={handleBack}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-4 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-red-500 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Menu
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6">
            <h2 className="text-2xl font-bold mb-2">Payment Options</h2>
            <p className="text-red-100">Choose your preferred payment method</p>
          </div>

          <div className="p-6">
            {/* Order Summary */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Summary</h3>
              <div className="space-y-2">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <span className="text-gray-600">{item.name} × {item.quantity}</span>
                    <span className="font-semibold">₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Subtotal</span>
                    <span>₹{cartTotal.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between items-center text-green-600">
                      <span>Discount</span>
                      <span>-₹{discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-xl font-bold text-red-500 border-t border-gray-200 pt-2 mt-2">
                    <span>Total</span>
                    <span>₹{finalTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Methods</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {paymentOptions.map((option) => (
                  <div
                    key={option.id}
                    onClick={() => handlePaymentMethodSelect(option.id)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                      paymentMethod === option.id
                        ? 'border-red-500 bg-red-50 ring-2 ring-red-200'
                        : 'border-gray-200 hover:border-red-300 hover:bg-red-50'
                    }`}
                  >
                    <div className="text-center">
                      <div className="flex justify-center text-red-500 mb-3">
                        {option.icon}
                      </div>
                      <h4 className="font-semibold text-gray-800 mb-2">{option.title}</h4>
                      <p className="text-sm text-gray-600">{option.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Details */}
            {paymentMethod && (
              <div className="bg-blue-50 rounded-lg p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-blue-500">
                    {paymentOptions.find(opt => opt.id === paymentMethod)?.icon}
                  </div>
                  <h4 className="text-lg font-semibold text-gray-800">
                    {paymentOptions.find(opt => opt.id === paymentMethod)?.title}
                  </h4>
                </div>

                {paymentMethod === 'upi' && (
                  <div className="text-center">
                    <div className="bg-white p-4 rounded-lg inline-block mb-4">
                      <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-gray-500">QR Code</span>
                      </div>
                    </div>
                    <p className="text-gray-600">Scan QR code or pay using UPI ID: mealminds@upi</p>
                    <p className="font-semibold text-blue-600 mt-2">Amount: ₹{finalTotal.toFixed(2)}</p>
                  </div>
                )}

                {paymentMethod === 'card' && (
                  <div className="text-center">
                    <CreditCard className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                    <p className="text-gray-600">You will be redirected to secure payment gateway</p>
                    <p className="font-semibold text-blue-600 mt-2">Amount: ₹{finalTotal.toFixed(2)}</p>
                  </div>
                )}

                {paymentMethod === 'cash' && (
                  <div className="text-center">
                    <Banknote className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <p className="text-gray-600">
                      {state.orderType === 'delivery' ? 'Pay cash on delivery' : 'Pay at the counter'}
                    </p>
                    <p className="font-semibold text-green-600 mt-2">Amount: ₹{finalTotal.toFixed(2)}</p>
                  </div>
                )}
              </div>
            )}

            {/* Bill Splitting */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-purple-50 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Users className="w-6 h-6 text-purple-500" />
                  <h4 className="text-lg font-semibold text-gray-800">Bill Splitting</h4>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-600">Split among</span>
                  <input
                    type="number"
                    min="1"
                    value={splitInput}
                    onChange={handleSplitCountChange}
                    className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center"
                  />
                  <span className="text-gray-600">people</span>
                </div>
                {splitCount > 1 && (
                  <p className="mt-3 text-purple-600 font-semibold">
                    Each person pays: ₹{splitAmount.toFixed(2)}
                  </p>
                )}
              </div>

              <div className="bg-orange-50 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Percent className="w-6 h-6 text-orange-500" />
                  <h4 className="text-lg font-semibold text-gray-800">Discount</h4>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-600">₹</span>
                  <input
                    type="number"
                    min="0"
                    max={cartTotal}
                    value={discountInput}
                    onChange={handleDiscountChange}
                    placeholder="0"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                {discount > 0 && (
                  <p className="mt-3 text-orange-600 font-semibold">
                    Total after discount: ₹{finalTotal.toFixed(2)}
                  </p>
                )}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-700">
                {error}
              </div>
            )}

            {/* Confirm Payment Button */}
            <button
              onClick={handleConfirmPayment}
              disabled={loading || !paymentMethod}
              className="w-full bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-semibold py-4 px-6 rounded-lg transition-colors transform hover:scale-[1.02] flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  Confirm Payment - ₹{finalTotal.toFixed(2)}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
