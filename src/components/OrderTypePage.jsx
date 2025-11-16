import React from 'react';
import { useApp } from '../contexts/AppContext.jsx';
import { ShoppingBag, Truck, UtensilsCrossed, ArrowLeft } from 'lucide-react';

const OrderTypePage = () => {
  const { dispatch, actionTypes } = useApp();

  const orderTypes = [
    {
      type: 'dine-in',
      icon: <UtensilsCrossed className="w-12 h-12 text-red-500" />,
      title: 'Dine In',
      description: 'Enjoy your meal in our restaurant'
    },
    {
      type: 'take-away',
      icon: <ShoppingBag className="w-12 h-12 text-red-500" />,
      title: 'Take Away',
      description: 'Pick up your order'
    },
    {
      type: 'delivery',
      icon: <Truck className="w-12 h-12 text-red-500" />,
      title: 'Delivery',
      description: 'Get your food delivered'
    }
  ];

  const handleOrderTypeSelect = (orderType) => {
    dispatch({ type: actionTypes.SET_ORDER_TYPE, payload: orderType });

    if (orderType === 'delivery') {
      dispatch({ type: actionTypes.SET_CURRENT_PAGE, payload: 'deliveryAddress' });
    } else if (orderType === 'dine-in') {
      // Generate random table number for dine-in
      const tableNumber = Math.floor(Math.random() * 20) + 1;
      dispatch({ type: actionTypes.SET_TABLE_NUMBER, payload: tableNumber });
      dispatch({ type: actionTypes.SET_CURRENT_PAGE, payload: 'menu' });
    } else {
      dispatch({ type: actionTypes.SET_CURRENT_PAGE, payload: 'menu' });
    }
  };

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-4xl font-bold text-red-500">Select Your Order Type</h2>
          <p className="text-lg text-gray-600">Choose how you'd like to enjoy your meal</p>
        </div>

        <div className="grid max-w-4xl grid-cols-1 gap-8 mx-auto md:grid-cols-3">
          {orderTypes.map((option) => (
            <div
              key={option.type}
              onClick={() => handleOrderTypeSelect(option.type)}
              className="p-8 transition-all duration-300 transform bg-white border-2 border-transparent shadow-lg cursor-pointer rounded-2xl hover:shadow-xl hover:scale-105 hover:border-red-500"
            >
              <div className="text-center">
                <div className="flex justify-center mb-6">
                  {option.icon}
                </div>
                <h3 className="mb-3 text-2xl font-bold text-red-500">{option.title}</h3>
                <p className="text-lg text-gray-600">{option.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderTypePage;
