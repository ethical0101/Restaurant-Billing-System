import React from 'react';
import { useApp } from '../contexts/AppContext.jsx';
import { UtensilsCrossed, Calendar, CreditCard, MapPin, Hash, Users, ArrowLeft, Printer } from 'lucide-react';

const ReceiptPage = () => {
  const { state, dispatch, actionTypes } = useApp();
  const {
    cart,
    orderType,
    deliveryAddress,
    paymentMethod,
    discount,
    splitCount,
    tableNumber,
    orderId
  } = state;

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountAmount = Math.min(discount, cartTotal);
  const finalTotal = Math.max(0, cartTotal - discountAmount);

  const handlePrintReceipt = () => {
    window.print();
  };

  const handleBackToMenu = () => {
    dispatch({ type: actionTypes.CLEAR_CART });
    dispatch({ type: actionTypes.SET_DISCOUNT, payload: 0 });
    dispatch({ type: actionTypes.SET_SPLIT_COUNT, payload: 1 });
    dispatch({ type: actionTypes.SET_PAYMENT_METHOD, payload: '' });
    dispatch({ type: actionTypes.SET_CURRENT_PAGE, payload: 'menu' });
  };

  const getOrderTypeDisplay = () => {
    switch (orderType) {
      case 'dine-in': return 'Dine In';
      case 'take-away': return 'Take Away';
      case 'delivery': return 'Delivery';
      default: return '';
    }
  };

  const getPaymentMethodDisplay = () => {
    switch (paymentMethod) {
      case 'upi': return 'UPI Payment';
      case 'card': return 'Card Payment';
      case 'cash': return 'Cash Payment';
      default: return paymentMethod;
    }
  };

  const currentDate = new Date();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <div className="mb-6 print:hidden">
          <button
            onClick={handleBackToMenu}
            className="flex items-center gap-2 text-gray-600 hover:text-red-500 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Menu
          </button>
        </div>

        {/* Receipt */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
              <UtensilsCrossed className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Meal Minds</h1>
            <p className="text-red-100">Fast Food Restaurant</p>
            <p className="text-red-100 text-sm mt-2">Order Receipt</p>
          </div>

          {/* Receipt Details */}
          <div className="p-8">
            {/* Order Info */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Date & Time</span>
                </div>
                <p className="font-semibold">{currentDate.toLocaleString()}</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Order ID</span>
                </div>
                <p className="font-semibold">{orderId || 'N/A'}</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <UtensilsCrossed className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Order Type</span>
                </div>
                <p className="font-semibold">{getOrderTypeDisplay()}</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Payment Method</span>
                </div>
                <p className="font-semibold">{getPaymentMethodDisplay()}</p>
              </div>
            </div>

            {/* Additional Info */}
            {tableNumber && orderType === 'dine-in' && (
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <UtensilsCrossed className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-blue-600 font-medium">Table Information</span>
                </div>
                <p className="text-blue-800 font-semibold">Table No: {tableNumber}</p>
              </div>
            )}

            {deliveryAddress && orderType === 'delivery' && (
              <div className="bg-green-50 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600 font-medium">Delivery Address</span>
                </div>
                <p className="text-green-800">{deliveryAddress}</p>
              </div>
            )}

            {/* Order Items */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                Order Items
              </h3>
              <div className="space-y-3">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between items-center py-2">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{item.icon}</span>
                      <div>
                        <p className="font-medium text-gray-800">{item.name}</p>
                        <p className="text-sm text-gray-600">₹{item.price} × {item.quantity}</p>
                      </div>
                    </div>
                    <p className="font-semibold text-gray-800">₹{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="border-t border-gray-200 pt-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">₹{cartTotal.toFixed(2)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between items-center text-green-600">
                    <span>Discount</span>
                    <span className="font-semibold">-₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between items-center text-xl">
                    <span className="font-bold text-gray-800">Total</span>
                    <span className="font-bold text-red-500">₹{finalTotal.toFixed(2)}</span>
                  </div>
                </div>

                {splitCount > 1 && (
                  <div className="bg-purple-50 rounded-lg p-4 mt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-4 h-4 text-purple-500" />
                      <span className="text-sm text-purple-600 font-medium">Bill Split</span>
                    </div>
                    <p className="text-purple-800">
                      Split among {splitCount} people: <span className="font-semibold">₹{(finalTotal / splitCount).toFixed(2)}</span> each
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Thank You Message */}
            <div className="text-center mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-xl font-bold text-red-500 mb-2">Thank You!</h3>
              <p className="text-gray-600">We appreciate your business</p>
              <p className="text-sm text-gray-500 mt-2">Please visit us again</p>
            </div>
          </div>

          {/* Print Button */}
          <div className="p-6 bg-gray-50 border-t border-gray-200 print:hidden">
            <button
              onClick={handlePrintReceipt}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Printer className="w-5 h-5" />
              Print Receipt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptPage;
