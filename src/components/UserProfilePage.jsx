import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { restaurantService } from '../services/restaurantService';
import { menuItems as localMenuItems } from '../data/menuData';
import { ArrowLeft, User, Calendar, Package, Heart, Star, Clock, MapPin, Phone, Mail, LogOut, ShoppingCart } from 'lucide-react';

const UserProfilePage = () => {
  const { state, dispatch, actionTypes } = useApp();
  const { user, userProfile } = state;
  const [orders, setOrders] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [favoriteItems, setFavoriteItems] = useState([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      setLoading(true);

      // Load user orders, favorites and total spent using our service methods
      const [userOrders, userFavorites, userTotalSpent] = await Promise.all([
        restaurantService.getOrderHistory(),
        restaurantService.getFavorites(),
        restaurantService.getTotalSpent()
      ]);

      console.log('✅ User orders loaded:', userOrders.length, 'orders');
      console.log('📋 Orders data:', userOrders);
      console.log('❤️ User favorites loaded:', userFavorites.length, 'favorites');
      console.log('🔖 Favorites data:', userFavorites);
      console.log('💰 Total spent loaded:', userTotalSpent);

      setOrders(userOrders);
      setFavorites(userFavorites);
      setTotalSpent(userTotalSpent);

      // Get the actual menu items that are favorited
      const favItemIds = userFavorites.map(fav => fav.itemId);
      console.log('🔍 Extracted favorite item IDs:', favItemIds);
      console.log('📋 Local menu items sample:', localMenuItems.slice(0, 3));

      // Handle both string and number IDs by converting to numbers for comparison
      const favItems = localMenuItems.filter(item => {
        return favItemIds.some(favId => {
          // Convert both to numbers for comparison
          const numFavId = typeof favId === 'string' ? parseInt(favId) : favId;
          return numFavId === item.id;
        });
      });
      console.log('✅ Matched favorite items:', favItems);
      setFavoriteItems(favItems);

    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await restaurantService.signOutUser();
      dispatch({ type: actionTypes.SET_USER, payload: null });
      dispatch({ type: actionTypes.SET_CURRENT_PAGE, payload: 'login' });
    } catch (error) {
      console.error('Error signing out:', error);
      alert('Failed to sign out');
    }
  };

  const handleRemoveFavorite = async (itemId) => {
    try {
      await restaurantService.removeFromFavorites(itemId);
      setFavorites(prev => prev.filter(fav => fav.itemId !== itemId));
      setFavoriteItems(prev => prev.filter(item => item.id !== itemId));
    } catch (error) {
      console.error('Error removing favorite:', error);
      alert('Failed to remove favorite');
    }
  };

  const handleAddToCart = (item) => {
    dispatch({ type: actionTypes.ADD_TO_CART, payload: item });
    alert(`${item.name} added to cart!`);
  };

  const handleBack = () => {
    dispatch({ type: actionTypes.SET_CURRENT_PAGE, payload: 'menu' });
  };

  const formatDate = (timestamp) => {
    try {
      let date;

      if (timestamp && timestamp.toDate) {
        // Firebase Timestamp object
        date = timestamp.toDate();
      } else if (timestamp && timestamp.seconds) {
        // Firebase Timestamp in seconds format
        date = new Date(timestamp.seconds * 1000);
      } else if (timestamp) {
        // Regular date string or number
        date = new Date(timestamp);
      } else {
        return 'Date unavailable';
      }

      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Date unavailable';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'confirmed': return 'text-blue-600 bg-blue-100';
      case 'preparing': return 'text-yellow-600 bg-yellow-100';
      case 'ready': return 'text-purple-600 bg-purple-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <User className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Please log in to view your profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-lg">
        <div className="max-w-4xl px-4 py-4 mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-gray-600 transition-colors hover:text-orange-500"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Menu
              </button>
              <h1 className="text-2xl font-bold text-orange-500">My Profile</h1>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 transition-colors rounded-lg hover:text-red-500 hover:bg-red-50"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl px-4 py-6 mx-auto">
        {/* Profile Header */}
        <div className="p-6 mb-6 bg-white shadow-lg rounded-2xl">
          <div className="flex items-center gap-6">
            <div className="flex items-center justify-center w-20 h-20 bg-orange-500 rounded-full">
              <User className="w-10 h-10 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-800">{userProfile?.displayName || user.displayName || 'Food Lover'}</h2>
              <div className="flex items-center gap-4 mt-2 text-gray-600">
                <div className="flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">{user.email}</span>
                </div>
                {userProfile?.phoneNumber && (
                  <div className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    <span className="text-sm">{userProfile.phoneNumber}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Member since</div>
              <div className="font-semibold">{formatDate(userProfile?.createdAt || user.metadata?.creationTime)}</div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 pt-6 mt-6 border-t border-gray-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500">{orders.length}</div>
              <div className="text-sm text-gray-600">Total Orders</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500">₹{totalSpent.toFixed(2)}</div>
              <div className="text-sm text-gray-600">Total Spent</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500">{favorites.length}</div>
              <div className="text-sm text-gray-600">Favorite Items</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="overflow-hidden bg-white shadow-lg rounded-2xl">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('orders')}
                className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                  activeTab === 'orders'
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-600 hover:text-orange-500'
                }`}
              >
                <Package className="inline w-5 h-5 mr-2" />
                Order History
              </button>
              <button
                onClick={() => setActiveTab('favorites')}
                className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                  activeTab === 'favorites'
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-600 hover:text-orange-500'
                }`}
              >
                <Heart className="inline w-5 h-5 mr-2" />
                Favorites
              </button>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="py-8 text-center">
                <div className="w-8 h-8 mx-auto mb-4 border-4 border-orange-500 rounded-full animate-spin border-t-transparent"></div>
                <p className="text-gray-600">Loading your data...</p>
              </div>
            ) : (
              <>
                {/* Orders Tab */}
                {activeTab === 'orders' && (
                  <div className="space-y-4">
                    {orders.length === 0 ? (
                      <div className="py-8 text-center">
                        <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <p className="text-gray-600">No orders yet. Start ordering to see your history!</p>
                      </div>
                    ) : (
                      orders.map((order) => (
                        <div key={order.id} className="p-4 transition-shadow border border-gray-200 rounded-lg hover:shadow-md">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="text-lg font-semibold text-gray-800">
                                Order #{order.orderNumber || order.id.slice(-6)}
                              </div>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                {order.status || 'Completed'}
                              </span>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-orange-500">₹{order.total}</div>
                              <div className="flex items-center gap-1 text-sm text-gray-500">
                                <Clock className="w-3 h-3" />
                                {formatDate(order.createdAt)}
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Type: </span>
                              <span className="font-medium capitalize">{order.orderType}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Items: </span>
                              <span className="font-medium">{order.items?.length || 0} items</span>
                            </div>
                          </div>

                          {order.orderType === 'delivery' && order.deliveryAddress && (
                            <div className="mt-2 text-sm">
                              <span className="flex items-center gap-1 text-gray-600">
                                <MapPin className="w-3 h-3" />
                                Delivered to:
                              </span>
                              <span className="ml-4 font-medium">{order.deliveryAddress}</span>
                            </div>
                          )}

                          {order.items && order.items.length > 0 && (
                            <div className="pt-3 mt-3 border-t border-gray-100">
                              <div className="mb-2 text-sm text-gray-600">Items ordered:</div>
                              <div className="grid grid-cols-2 gap-2">
                                {order.items.slice(0, 4).map((item, index) => (
                                  <div key={index} className="text-sm">
                                    <span className="font-medium">{item.name}</span>
                                    <span className="text-gray-500"> x{item.quantity}</span>
                                  </div>
                                ))}
                                {order.items.length > 4 && (
                                  <div className="text-sm text-gray-500">
                                    +{order.items.length - 4} more items
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Favorites Tab */}
                {activeTab === 'favorites' && (
                  <div className="space-y-4">
                    {favoriteItems.length === 0 ? (
                      <div className="py-8 text-center">
                        <Heart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <p className="text-gray-600">No favorites yet. Add items to favorites from the menu!</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {favoriteItems.map((item) => (
                          <div key={item.id} className="p-4 transition-shadow bg-white border border-gray-200 rounded-lg hover:shadow-md">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center justify-center w-16 h-16 rounded-lg bg-gradient-to-br from-orange-100 to-orange-50">
                                <span className="text-2xl">{item.icon}</span>
                              </div>
                              <div className="flex-1">
                                <h3 className="font-semibold text-gray-800">{item.name}</h3>
                                <p className="mb-2 text-sm text-gray-600">{item.desc}</p>
                                <div className="flex items-center justify-between">
                                  <span className="text-lg font-bold text-orange-500">₹{item.price}</span>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => handleAddToCart(item)}
                                      className="flex items-center gap-1 px-3 py-1 text-sm text-white transition-colors bg-orange-500 rounded-lg hover:bg-orange-600"
                                    >
                                      <ShoppingCart className="w-4 h-4" />
                                      Add to Cart
                                    </button>
                                    <button
                                      onClick={() => handleRemoveFavorite(item.id)}
                                      className="p-1 text-red-500 transition-colors rounded hover:text-red-600"
                                      title="Remove from favorites"
                                    >
                                      <Heart className="w-4 h-4 fill-current" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
