// Firebase service for Restaurant Billing System
import { db, auth, COLLECTIONS } from '../config/firebase';
import {
  collection,
  addDoc,
  setDoc,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  onSnapshot,
  increment
} from 'firebase/firestore';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { googleProvider } from '../config/firebase';

export class RestaurantBillingService {
  constructor() {
    this.db = db;
    this.auth = auth;
  }

  // ==================== AUTHENTICATION ====================

  // Google Sign In
  async signInWithGoogle() {
    try {
      const result = await signInWithPopup(this.auth, googleProvider);
      const user = result.user;

      // Create or update user profile
      await this.createUserProfile(user);
      return user;
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    }
  }

  // Create user profile with role
  async createUserProfile(user, role = 'customer') {
    try {
      const userRef = doc(this.db, COLLECTIONS.CUSTOMERS, user.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        const userData = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          role: role, // customer, staff, admin, owner
          phoneNumber: user.phoneNumber || '',
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
          isActive: true,
          preferences: {
            notifications: true,
            language: 'en'
          }
        };

        await setDoc(userRef, userData);
        return userData;
      } else {
        // Update last login
        await updateDoc(userRef, {
          lastLogin: serverTimestamp()
        });
        return userDoc.data();
      }
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  }

  // Sign out user
  async signOutUser() {
    try {
      await signOut(this.auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }

  // Get current authenticated user
  getCurrentUser() {
    return this.auth.currentUser;
  }

  // Check if user is authenticated
  isAuthenticated() {
    return this.auth.currentUser !== null;
  }

  // Create user with email and password
  async createUser(email, password, displayName, phoneNumber) {
    try {
      const result = await createUserWithEmailAndPassword(this.auth, email, password);
      const user = result.user;

      // Update user profile with display name
      if (displayName) {
        await updateProfile(user, { displayName });
      }

      // Create user profile in Firestore
      await this.createUserProfile({
        ...user,
        displayName: displayName || user.displayName,
        phoneNumber: phoneNumber || ''
      });

      return user;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // Sign in user with email and password
  async signInUser(email, password) {
    try {
      const result = await signInWithEmailAndPassword(this.auth, email, password);
      const user = result.user;

      // Update last login
      await this.createUserProfile(user); // This will update lastLogin if user exists

      return user;
    } catch (error) {
      console.error('Error signing in user:', error);
      throw error;
    }
  }

  // Reset password
  async resetPassword(email) {
    try {
      await sendPasswordResetEmail(this.auth, email);
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw error;
    }
  }

  // ==================== FAVORITES MANAGEMENT ====================

  // Add item to favorites
  async addToFavorites(itemId) {
    try {
      const userId = this.getCurrentUser()?.uid;
      if (!userId) throw new Error('User not authenticated');

      // Convert itemId to string for Firebase document ID
      const itemIdString = String(itemId);

      const favRef = doc(this.db, COLLECTIONS.CUSTOMERS, userId, 'favorites', itemIdString);
      await setDoc(favRef, {
        itemId: itemIdString,
        originalItemId: itemId, // Keep original for reference
        addedAt: serverTimestamp()
      });

      console.log('✅ Added to favorites:', itemIdString);
    } catch (error) {
      console.error('Error adding to favorites:', error);
      throw error;
    }
  }

  // Remove item from favorites
  async removeFromFavorites(itemId) {
    try {
      const userId = this.getCurrentUser()?.uid;
      if (!userId) throw new Error('User not authenticated');

      // Convert itemId to string for Firebase document ID
      const itemIdString = String(itemId);

      const favRef = doc(this.db, COLLECTIONS.CUSTOMERS, userId, 'favorites', itemIdString);
      await deleteDoc(favRef);

      console.log('✅ Removed from favorites:', itemIdString);
    } catch (error) {
      console.error('Error removing from favorites:', error);
      throw error;
    }
  }

  // Get user's favorites
  async getFavorites() {
    try {
      const userId = this.getCurrentUser()?.uid;
      if (!userId) return [];

      const favCollection = collection(this.db, COLLECTIONS.CUSTOMERS, userId, 'favorites');
      const snapshot = await getDocs(favCollection);

      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          itemId: data.originalItemId || data.itemId, // Use original ID if available, fallback to string
          itemIdString: doc.id, // Document ID (always string)
          ...data
        };
      });
    } catch (error) {
      console.error('Error getting favorites:', error);
      return [];
    }
  }

  // Check if item is in favorites
  async isFavorite(itemId) {
    try {
      const userId = this.getCurrentUser()?.uid;
      if (!userId) return false;

      // Convert itemId to string for Firebase document ID
      const itemIdString = String(itemId);

      const favRef = doc(this.db, COLLECTIONS.CUSTOMERS, userId, 'favorites', itemIdString);
      const favSnap = await getDoc(favRef);

      return favSnap.exists();
    } catch (error) {
      console.error('Error checking favorite status:', error);
      return false;
    }
  }

  // Get user's order history
  async getOrderHistory() {
    try {
      const userId = this.getCurrentUser()?.uid;
      if (!userId) {
        console.log('❌ No user authenticated for order history');
        return [];
      }

      console.log('🔍 Getting order history for user:', userId);

      // Try with a simpler query first (no orderBy) to avoid index issues
      const q = query(
        collection(this.db, COLLECTIONS.ORDERS),
        where('userId', '==', userId),
        limit(20)
      );

      const snapshot = await getDocs(q);
      const orders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Sort by createdAt client-side to avoid Firebase index requirements
      orders.sort((a, b) => {
        const aTime = a.createdAt?.seconds || 0;
        const bTime = b.createdAt?.seconds || 0;
        return bTime - aTime; // Descending order
      });

      console.log('✅ Order history retrieved:', orders.length, 'orders');
      return orders;
    } catch (error) {
      console.error('Error getting order history:', error);
      return [];
    }
  }

  // Calculate total spent by user
  async getTotalSpent() {
    try {
      const orders = await this.getOrderHistory();
      const totalSpent = orders.reduce((total, order) => {
        // Use order.total, fallback to order.finalTotal or 0
        const orderAmount = order.total || order.finalTotal || 0;
        return total + orderAmount;
      }, 0);

      console.log('💰 Total spent calculated:', totalSpent, 'from', orders.length, 'orders');
      return totalSpent;
    } catch (error) {
      console.error('Error calculating total spent:', error);
      return 0;
    }
  }

  // ==================== ORDER MANAGEMENT ====================

  // Create order
  async createOrder(orderData) {
    try {
      const userId = this.getCurrentUser()?.uid;
      console.log('🆕 Creating order for user:', userId);
      console.log('📋 Order data userId from PaymentPage:', orderData.userId);

      const order = {
        ...orderData,
        userId: userId || orderData.userId, // Use authenticated user ID first, fallback to provided
        orderNumber: this.generateOrderNumber(),
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      console.log('💾 Final order to save:', { ...order, createdAt: 'ServerTimestamp' });

      const docRef = await addDoc(collection(this.db, COLLECTIONS.ORDERS), order);
      console.log('✅ Order saved with ID:', docRef.id);

      return { id: docRef.id, ...order };
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  // Get orders with real-time updates
  subscribeToOrders(callback, status = null) {
    try {
      let q = query(
        collection(this.db, COLLECTIONS.ORDERS),
        orderBy('createdAt', 'desc'),
        limit(50)
      );

      if (status) {
        q = query(
          collection(this.db, COLLECTIONS.ORDERS),
          where('status', '==', status),
          orderBy('createdAt', 'desc'),
          limit(50)
        );
      }

      return onSnapshot(q, (snapshot) => {
        const orders = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        callback(orders);
      });
    } catch (error) {
      console.error('Error subscribing to orders:', error);
      throw error;
    }
  }

  // Update order status
  async updateOrderStatus(orderId, status, notes = '') {
    try {
      const orderRef = doc(this.db, COLLECTIONS.ORDERS, orderId);
      await updateDoc(orderRef, {
        status: status,
        statusNotes: notes,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }

  // Save order (wrapper for createOrder to match PaymentPage expectations)
  async saveOrder(orderData) {
    try {
      return await this.createOrder(orderData);
    } catch (error) {
      console.error('Error saving order:', error);
      throw error;
    }
  }

  // ==================== PAYMENT PROCESSING ====================

  // Process payment
  async processPayment(paymentData) {
    try {
      const payment = {
        ...paymentData,
        status: 'completed',
        processedAt: serverTimestamp(),
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(this.db, COLLECTIONS.PAYMENTS), payment);
      return { id: docRef.id, ...payment };
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  }

  // Save payment (wrapper for processPayment to match PaymentPage expectations)
  async savePayment(paymentData) {
    try {
      return await this.processPayment(paymentData);
    } catch (error) {
      console.error('Error saving payment:', error);
      throw error;
    }
  }

  // ==================== ANALYTICS ====================

  // Get daily sales
  async getDailySales(date) {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const q = query(
        collection(this.db, COLLECTIONS.ORDERS),
        where('createdAt', '>=', startOfDay),
        where('createdAt', '<=', endOfDay),
        where('status', '==', 'completed')
      );

      const snapshot = await getDocs(q);
      const orders = snapshot.docs.map(doc => doc.data());

      const totalSales = orders.reduce((sum, order) => sum + order.total, 0);
      const totalOrders = orders.length;

      return {
        date,
        totalSales,
        totalOrders,
        orders
      };
    } catch (error) {
      console.error('Error getting daily sales:', error);
      throw error;
    }
  }

  // ==================== HELPER METHODS ====================

  // Generate unique order number
  generateOrderNumber() {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ORD${timestamp}${random}`;
  }

  // Get user profile
  async getUserProfile(userId) {
    try {
      const userRef = doc(this.db, COLLECTIONS.CUSTOMERS, userId);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        return { id: userDoc.id, ...userDoc.data() };
      }
      return null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const restaurantService = new RestaurantBillingService();
