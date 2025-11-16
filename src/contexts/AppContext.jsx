import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { auth } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { restaurantService } from '../services/restaurantService';

// Initial state
const initialState = {
  user: null,
  userProfile: null,
  loading: true,
  currentPage: 'login',
  orderType: '',
  deliveryAddress: '',
  deliveryCoordinates: null,
  cart: [],
  selectedCategory: 'all',
  paymentMethod: '',
  discount: 0,
  splitCount: 1,
  tableNumber: null,
  orderId: null,
  isCartOpen: false
};

// Action types
const actionTypes = {
  SET_USER: 'SET_USER',
  SET_LOADING: 'SET_LOADING',
  SET_CURRENT_PAGE: 'SET_CURRENT_PAGE',
  SET_ORDER_TYPE: 'SET_ORDER_TYPE',
  SET_DELIVERY_ADDRESS: 'SET_DELIVERY_ADDRESS',
  SET_DELIVERY_COORDINATES: 'SET_DELIVERY_COORDINATES',
  ADD_TO_CART: 'ADD_TO_CART',
  REMOVE_FROM_CART: 'REMOVE_FROM_CART',
  UPDATE_CART_QUANTITY: 'UPDATE_CART_QUANTITY',
  CLEAR_CART: 'CLEAR_CART',
  SET_SELECTED_CATEGORY: 'SET_SELECTED_CATEGORY',
  SET_PAYMENT_METHOD: 'SET_PAYMENT_METHOD',
  SET_DISCOUNT: 'SET_DISCOUNT',
  SET_SPLIT_COUNT: 'SET_SPLIT_COUNT',
  SET_TABLE_NUMBER: 'SET_TABLE_NUMBER',
  SET_ORDER_ID: 'SET_ORDER_ID',
  TOGGLE_CART: 'TOGGLE_CART',
  LOGOUT_USER: 'LOGOUT_USER',
  SET_USER_PROFILE: 'SET_USER_PROFILE'
};

// Reducer function
function appReducer(state, action) {
  switch (action.type) {
    case actionTypes.SET_USER:
      return { ...state, user: action.payload };

    case actionTypes.SET_LOADING:
      return { ...state, loading: action.payload };

    case actionTypes.SET_CURRENT_PAGE:
      return { ...state, currentPage: action.payload };

    case actionTypes.SET_ORDER_TYPE:
      return { ...state, orderType: action.payload };

    case actionTypes.SET_DELIVERY_ADDRESS:
      return { ...state, deliveryAddress: action.payload };

    case actionTypes.SET_DELIVERY_COORDINATES:
      return { ...state, deliveryCoordinates: action.payload };

    case actionTypes.ADD_TO_CART:
      const existingItemIndex = state.cart.findIndex(item => item.id === action.payload.id);
      if (existingItemIndex > -1) {
        const updatedCart = [...state.cart];
        updatedCart[existingItemIndex].quantity += 1;
        return { ...state, cart: updatedCart };
      }
      return { ...state, cart: [...state.cart, { ...action.payload, quantity: 1 }] };

    case actionTypes.REMOVE_FROM_CART:
      return {
        ...state,
        cart: state.cart.filter(item => item.id !== action.payload)
      };

    case actionTypes.UPDATE_CART_QUANTITY:
      const { itemId, quantity } = action.payload;
      if (quantity <= 0) {
        return {
          ...state,
          cart: state.cart.filter(item => item.id !== itemId)
        };
      }
      return {
        ...state,
        cart: state.cart.map(item =>
          item.id === itemId ? { ...item, quantity } : item
        )
      };

    case actionTypes.CLEAR_CART:
      return { ...state, cart: [] };

    case actionTypes.SET_SELECTED_CATEGORY:
      return { ...state, selectedCategory: action.payload };

    case actionTypes.SET_PAYMENT_METHOD:
      return { ...state, paymentMethod: action.payload };

    case actionTypes.SET_DISCOUNT:
      return { ...state, discount: action.payload };

    case actionTypes.SET_SPLIT_COUNT:
      return { ...state, splitCount: action.payload };

    case actionTypes.SET_TABLE_NUMBER:
      return { ...state, tableNumber: action.payload };

    case actionTypes.SET_ORDER_ID:
      return { ...state, orderId: action.payload };

    case actionTypes.TOGGLE_CART:
      return { ...state, isCartOpen: !state.isCartOpen };

    case actionTypes.LOGOUT_USER:
      // Reset state to initial values except loading
      return {
        ...initialState,
        loading: false,
        user: null,
        currentPage: 'login'
      };

    case actionTypes.SET_USER_PROFILE:
      return { ...state, userProfile: action.payload };

    default:
      return state;
  }
}

// Create context
export const AppContext = createContext();

// Export action types
export { actionTypes };

// Provider component
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Auth state listener for Restaurant System
  useEffect(() => {
    console.log('🔥 Setting up Firebase auth listener for Restaurant System...');
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('🔥 Auth state changed:', user ? 'User logged in' : 'No user');
      dispatch({ type: actionTypes.SET_USER, payload: user });

      // Handle authentication-based navigation
      if (user) {
        // User is logged in
        console.log('🔥 User is logged in, loading profile...');
        try {
          const userProfile = await restaurantService.getUserProfile(user.uid);
          dispatch({ type: actionTypes.SET_USER_PROFILE, payload: userProfile });

          // If user is on login page, redirect to order type page
          if (state.currentPage === 'login') {
            console.log('🔥 Redirecting from login to menu...');
            dispatch({ type: actionTypes.SET_CURRENT_PAGE, payload: 'menu' });
          }
        } catch (error) {
          console.error('❌ Error loading user profile:', error);
        }
      } else {
        // User is not logged in
        console.log('🔥 No user, redirecting to login...');
        dispatch({ type: actionTypes.SET_USER_PROFILE, payload: null });

        // Redirect to login page if on protected pages
        const protectedPages = ['orderType', 'deliveryAddress', 'menu', 'payment', 'receipt'];
        if (protectedPages.includes(state.currentPage)) {
          console.log('🔥 Redirecting to login from protected page...');
          dispatch({ type: actionTypes.SET_CURRENT_PAGE, payload: 'login' });
        }
      }

      // Set loading to false after all async operations complete
      console.log('🔥 Setting loading to false');
      dispatch({ type: actionTypes.SET_LOADING, payload: false });
    });

    return () => unsubscribe();
  }, [state.currentPage]); // Add currentPage as dependency

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('restaurantCart');
    if (savedCart) {
      try {
        const cartItems = JSON.parse(savedCart);
        cartItems.forEach(item => {
          dispatch({ type: actionTypes.ADD_TO_CART, payload: item });
        });
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever cart changes
  useEffect(() => {
    try {
      localStorage.setItem('restaurantCart', JSON.stringify(state.cart));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [state.cart]);

  // Helper functions for Restaurant System
  const logout = async () => {
    try {
      await restaurantService.signOutUser();
      dispatch({ type: actionTypes.LOGOUT_USER });
      localStorage.removeItem('restaurantCart');
      // Explicitly navigate to login page
      dispatch({ type: actionTypes.SET_CURRENT_PAGE, payload: 'login' });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const addToFavorites = async (itemId) => {
    if (state.user) {
      try {
        // This would be implemented in the restaurant service
        console.log('Adding item to favorites:', itemId);
        // await restaurantService.addToFavorites(state.user.uid, itemId);
        // Refresh user profile
        // const userProfile = await restaurantService.getUserProfile(state.user.uid);
        // dispatch({ type: actionTypes.SET_USER_PROFILE, payload: userProfile });
      } catch (error) {
        console.error('Error adding to favorites:', error);
      }
    }
  };

  const contextValue = {
    state,
    dispatch,
    actionTypes,
    logout,
    addToFavorites
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

// Custom hook to use context
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
