import React, { useState, useEffect, useContext } from 'react';
import { useApp } from '../contexts/AppContext';
import { ArrowLeft, Plus, Minus, ShoppingCart, Search, Filter, User, Loader, Clock, Star, Heart } from 'lucide-react';
import { menuItems as localMenuItems, categories as localCategories } from '../data/menuData';
import { restaurantService } from '../services/restaurantService';

const MenuPage = () => {
  const { state, dispatch, actionTypes } = useApp();
  const { orderType, tableNumber, cart, user } = state;
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [menuItems, setMenuItems] = useState(localMenuItems || []);
  const [loading, setLoading] = useState(false); // No loading needed for local data
  const [favorites, setFavorites] = useState([]);

  // Initialize menu data immediately from local data
  useEffect(() => {
    console.log('✅ Loading menu items from local data:', localMenuItems.length);
    setMenuItems(localMenuItems || []);
  }, []);

  // Load user favorites
  useEffect(() => {
    if (user) {
      loadFavorites();
    }
  }, [user]);

  const loadFavorites = async () => {
    try {
      const userFavorites = await restaurantService.getFavorites();
      console.log('🍔 MenuPage - Raw favorites from Firebase:', userFavorites);
      const favIds = userFavorites.map(fav => fav.itemId);
      console.log('🍔 MenuPage - Extracted favorite IDs:', favIds);
      setFavorites(favIds);
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  // Toggle favorite status
  const handleToggleFavorite = async (itemId) => {
    if (!user) {
      alert('Please sign in to add favorites');
      return;
    }

    try {
      // Check if item is favorite using flexible comparison
      const isFav = favorites.some(favId => {
        const numFavId = typeof favId === 'string' ? parseInt(favId) : favId;
        return numFavId === itemId;
      });

      console.log('🔄 Toggling favorite for item:', itemId, 'Current state:', isFav);

      if (isFav) {
        await restaurantService.removeFromFavorites(itemId);
        setFavorites(prev => prev.filter(id => {
          const numId = typeof id === 'string' ? parseInt(id) : id;
          return numId !== itemId;
        }));
      } else {
        await restaurantService.addToFavorites(itemId);
        setFavorites(prev => [...prev, itemId]);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      alert('Failed to update favorites');
    }
  };

  // Helper function to check if item is favorite with type-safe comparison
  const isItemFavorite = (itemId) => {
    return favorites.some(favId => {
      const numFavId = typeof favId === 'string' ? parseInt(favId) : favId;
      return numFavId === itemId;
    });
  };

  // Get unique categories (with null check)
  const categories = ['all', ...new Set((menuItems || []).map(item => item.category))];

  // Filter items based on search and category (with null check)
  const filteredItems = (menuItems || []).filter(item => {
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

      {/* Main Content */}
      {!loading && (
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
                      <div className="w-full h-48 bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center">
                        <span className="text-6xl group-hover:scale-110 transition-transform duration-300">
                          {item.icon}
                        </span>
                      </div>
                      <div className="absolute top-3 left-3 bg-orange-500 text-white px-2 py-1 rounded-full text-sm font-bold">
                        ₹{item.price}
                      </div>
                      {/* Favorites Heart Button */}
                      <button
                        onClick={() => handleToggleFavorite(item.id)}
                        className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-200 ${
                          isItemFavorite(item.id)
                            ? 'bg-red-500 text-white scale-110'
                            : 'bg-white text-gray-400 hover:text-red-500 hover:bg-red-50'
                        }`}
                        title={isItemFavorite(item.id) ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        <Heart className={`w-4 h-4 ${isItemFavorite(item.id) ? 'fill-current' : ''}`} />
                      </button>
                      {item.isPopular && (
                        <div className="absolute top-14 right-3 bg-red-500 text-white px-2 py-1 rounded-full text-sm font-bold flex items-center gap-1">
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
