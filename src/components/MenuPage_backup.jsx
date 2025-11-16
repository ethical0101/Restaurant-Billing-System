import React, { useState, useEffect, useContext } from 'react';
import { AppContext, actionTypes } from '../contexts/AppContext';
import { ArrowLeft, Plus, Minus, ShoppingCart, Search, Filter, User, Loader, Clock, Star } from 'lucide-react';
import { firebaseService } from '../config/firebase';
import { menuData } from '../data/menuData';

const MenuPage = () => {
  const { state, dispatch } = useContext(AppContext);
  const { orderType, tableNumber, cart, user } = state;
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load menu data from Firebase
  const loadMenuData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to get from Firebase first
      const firebaseItems = await firebaseService.getMenuItems();

      if (firebaseItems && firebaseItems.length > 0) {
        console.log('✅ Loaded menu items from Firebase:', firebaseItems.length);
        setMenuItems(firebaseItems);
      } else {
        console.log('ℹ️ No items in Firebase, using local data and seeding...');
        // Fallback to local data and seed Firebase
        setMenuItems(menuData);

        // Seed Firebase with local data
        try {
          await firebaseService.seedMenuItems(menuData);
          console.log('✅ Successfully seeded Firebase with local menu data');
        } catch (seedError) {
          console.warn('⚠️ Could not seed Firebase:', seedError.message);
        }
      }
    } catch (err) {
      console.error('❌ Error loading menu data:', err);
      setError('Failed to load menu items. Using offline menu.');
      setMenuItems(menuData); // Fallback to local data
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMenuData();
  }, []);

  // Get unique categories
  const categories = ['all', ...new Set(menuItems.map(item => item.category))];

  // Filter items based on search and category
  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Calculate cart totals
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  const handleAddToCart = (item) => {
    dispatch({ type: actionTypes.ADD_TO_CART, payload: item });
  };

  const handleUpdateQuantity = (itemId, newQuantity) => {
    dispatch({
      type: actionTypes.UPDATE_CART_QUANTITY,
      payload: { itemId, quantity: newQuantity }
    });
  };

  const handleViewCart = () => {
    dispatch({ type: actionTypes.TOGGLE_CART });
  };

  const handleBack = () => {
    if (orderType === 'delivery') {
      dispatch({ type: actionTypes.SET_CURRENT_PAGE, payload: 'deliveryAddress' });
    } else {
      dispatch({ type: actionTypes.SET_CURRENT_PAGE, payload: 'orderType' });
    }
  };

  const getOrderTypeTitle = () => {
    switch (orderType) {
      case 'dine-in': return `Dine In - Table ${tableNumber}`;
      case 'take-away': return 'Take Away';
      case 'delivery': return 'Delivery';
      default: return 'Menu';
    }
  };

  const getItemQuantityInCart = (itemId) => {
    const cartItem = cart.find(item => item.id === itemId);
    return cartItem ? cartItem.quantity : 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 text-lg">Loading delicious menu items...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center bg-white rounded-lg shadow-lg p-8 max-w-md mx-4">
            <div className="text-red-500 text-6xl mb-4">😔</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Oops! Something went wrong</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={loadMenuData}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      {!loading && !error && (
        <>
          {/* Header */}
          <div className="bg-white shadow-lg sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 py-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleBack}
                    className="flex items-center gap-2 text-gray-600 hover:text-orange-500 transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    Back
                  </button>
                  <h2 className="text-2xl font-bold text-orange-500">{getOrderTypeTitle()}</h2>
                </div>

                <div className="flex items-center gap-3">
                  {/* User Info */}
                  {user && (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => dispatch({ type: actionTypes.SET_CURRENT_PAGE, payload: 'profile' })}
                        className="flex items-center gap-2 text-gray-600 hover:text-orange-500 transition-colors px-3 py-2 rounded-lg hover:bg-gray-50"
                        title="View Profile"
                      >
                        <User className="w-5 h-5" />
                        <span className="hidden md:inline">{user.name}</span>
                      </button>
                    </div>
                  )}

                  {/* Cart Icon */}
                  {cartItemCount > 0 && (
                    <button
                      onClick={handleViewCart}
                      className="relative bg-orange-500 text-white p-3 rounded-full hover:bg-orange-600 transition-colors"
                    >
                      <ShoppingCart className="w-6 h-6" />
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                        {cartItemCount}
                      </span>
                    </button>
                  )}
                </div>
              </div>

              {/* Search and Filter Bar */}
              <div className="mt-4 flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search for dishes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-gray-400" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items Grid */}
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredItems.map((item) => {
                const quantityInCart = getItemQuantityInCart(item.id);
                return (
                  <div key={item.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden group">
                    <div className="relative">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 left-3 bg-orange-500 text-white px-2 py-1 rounded-full text-sm font-bold">
                        ₹{item.price}
                      </div>
                      {item.isPopular && (
                        <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                          <Star className="w-3 h-3 fill-current" />
                          Popular
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <h3 className="text-lg font-bold text-gray-800 mb-2">{item.name}</h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>

                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Clock className="w-4 h-4" />
                          <span>{item.prepTime} mins</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm font-medium">{item.rating}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        {quantityInCart > 0 ? (
                          <div className="flex items-center gap-3 bg-red-50 rounded-lg p-2">
                            <button
                              onClick={() => handleUpdateQuantity(item.id, quantityInCart - 1)}
                              className="w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="font-bold text-orange-500 min-w-[20px] text-center">{quantityInCart}</span>
                            <button
                              onClick={() => handleUpdateQuantity(item.id, quantityInCart + 1)}
                              className="w-8 h-8 bg-orange-500 hover:bg-orange-600 text-white rounded-full flex items-center justify-center transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleAddToCart(item)}
                            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors transform hover:scale-105"
                          >
                            <Plus className="w-4 h-4" />
                            Add
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredItems.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No items found matching your search.</p>
              </div>
            )}
          </div>

          {/* Floating Cart Summary */}
          {cartItemCount > 0 && (
            <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white rounded-full px-6 py-3 shadow-lg cursor-pointer hover:bg-orange-600 transition-colors z-30"
                 onClick={handleViewCart}>
              <div className="flex items-center gap-3">
                <ShoppingCart className="w-5 h-5" />
                <span className="font-semibold">{cartItemCount} items • ₹{cartTotal.toFixed(2)}</span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MenuPage;
