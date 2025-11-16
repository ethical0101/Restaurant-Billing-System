import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../contexts/AppContext.jsx';
import { firebaseService } from '../services/firebaseService';
import { ArrowLeft, ShoppingCart, Plus, Minus, Search, LogOut, User, Loader } from 'lucide-react';

const MenuPage = () => {
  const { state, dispatch, actionTypes, logout } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { selectedCategory, cart, orderType, tableNumber } = state;

  // Load menu items and categories from Firebase
  useEffect(() => {
    loadMenuData();
  }, []);

  const loadMenuData = async () => {
    try {
      setLoading(true);
      setError('');

      // Load menu items and categories from Firebase
      const [items, cats] = await Promise.all([
        firebaseService.getMenuItems(),
        firebaseService.getMenuCategories()
      ]);

      if (items.length === 0) {
        // If no items in database, seed with initial data
        console.log('No menu items found, seeding database...');
        await seedInitialData();
        return;
      }

      setMenuItems(items);
      
      // Add "All" category at the beginning
      setCategories([
        { id: 'all', name: 'All Items', icon: '🍽️' },
        ...cats
      ]);

    } catch (error) {
      console.error('Error loading menu data:', error);
      setError('Failed to load menu items. Please try again.');
      
      // Fallback to static data if Firebase fails
      const { menuItems: staticItems, categories: staticCats } = await import('../data/menuData');
      setMenuItems(staticItems);
      setCategories([{ id: 'all', name: 'All Items', icon: '🍽️' }, ...staticCats]);
    } finally {
      setLoading(false);
    }
  };

  const seedInitialData = async () => {
    try {
      // Import static data for seeding
      const { menuItems: staticItems } = await import('../data/menuData');
      
      // Seed database with initial items
      await firebaseService.seedMenuItems(staticItems);
      
      // Reload data after seeding
      await loadMenuData();
    } catch (error) {
      console.error('Error seeding initial data:', error);
      setError('Failed to initialize menu data.');
    }
  };

  // Filter menu items based on category and search query
  const filteredItems = useMemo(() => {
    let items = selectedCategory === 'all'
      ? menuItems
      : menuItems.filter(item => item.category === selectedCategory);

    if (searchQuery) {
      items = items.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.desc.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return items;
  }, [selectedCategory, searchQuery, menuItems]); // Add menuItems dependency

  // Calculate cart total and item count
  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCategorySelect = (categoryId) => {
    dispatch({ type: actionTypes.SET_SELECTED_CATEGORY, payload: categoryId });
  };

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
              {state.user && (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => dispatch({ type: actionTypes.SET_CURRENT_PAGE, payload: 'profile' })}
                    className="flex items-center gap-2 text-gray-600 hover:text-orange-500 transition-colors px-3 py-2 rounded-lg hover:bg-gray-50"
                    title="View Profile"
                  >
                    <User className="w-4 h-4" />
                    <span className="text-sm font-medium hidden sm:inline">
                      {state.user.displayName || state.user.email?.split('@')[0] || 'Profile'}
                    </span>
                  </button>
                  <button
                    onClick={logout}
                    className="flex items-center gap-1 text-gray-500 hover:text-red-500 transition-colors text-sm px-2 py-1 rounded"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </div>
              )}

              <button
                onClick={handleViewCart}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors relative"
              >
                <ShoppingCart className="w-5 h-5" />
                View Cart ({cartItemCount})
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-yellow-400 text-red-800 text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search menu items..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Category Buttons */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategorySelect(category.id)}
              className={`px-6 py-2 rounded-full whitespace-nowrap transition-all duration-200 ${
                selectedCategory === category.id
                  ? 'bg-red-500 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-red-50 hover:text-red-500'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Menu Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => {
            const quantityInCart = getItemQuantityInCart(item.id);

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:scale-[1.02]"
              >
                {/* Item Icon */}
                <div className="bg-gray-50 p-6 text-center">
                  <div className="text-4xl mb-2">{item.icon}</div>
                </div>

                {/* Item Details */}
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">{item.name}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.desc}</p>
                  <p className="text-xs text-gray-500 mb-4">{item.nutrition}</p>

                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-red-500">₹{item.price}</span>

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
