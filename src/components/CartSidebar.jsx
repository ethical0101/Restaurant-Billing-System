import React from 'react';
import { useApp } from '../contexts/AppContext.jsx';
import { X, Plus, Minus, ShoppingCart, CreditCard } from 'lucide-react';

const CartSidebar = () => {
  const { state, dispatch, actionTypes } = useApp();
  const { cart, isCartOpen } = state;

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleClose = () => {
    dispatch({ type: actionTypes.TOGGLE_CART });
  };

  const handleUpdateQuantity = (itemId, newQuantity) => {
    dispatch({
      type: actionTypes.UPDATE_CART_QUANTITY,
      payload: { itemId, quantity: newQuantity }
    });
  };

  const handleProceedToCheckout = () => {
    if (cart.length === 0) return;

    dispatch({ type: actionTypes.SET_CURRENT_PAGE, payload: 'payment' });
    dispatch({ type: actionTypes.TOGGLE_CART });
  };

  if (!isCartOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={handleClose}
      />

      {/* Sidebar */}
      <div className="fixed top-0 right-0 w-full max-w-md h-full bg-white shadow-2xl z-50 transform transition-transform duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-red-500 to-red-600 text-white">
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-6 h-6" />
            <h3 className="text-xl font-bold">Your Cart</h3>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-red-600/50 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Your cart is empty</p>
              <p className="text-gray-400 text-sm">Add items from the menu to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl">{item.icon}</div>

                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800">{item.name}</h4>
                    <p className="text-red-500 font-bold">₹{(item.price * item.quantity).toFixed(2)}</p>
                  </div>

                  <div className="flex items-center gap-3 bg-white rounded-lg p-2">
                    <button
                      onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="font-bold text-gray-800 min-w-[20px] text-center">{item.quantity}</span>
                    <button
                      onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Items ({cartItemCount})</span>
                <span className="font-semibold">₹{cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-lg font-bold text-red-500">
                <span>Total</span>
                <span>₹{cartTotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleProceedToCheckout}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors transform hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              <CreditCard className="w-5 h-5" />
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartSidebar;
