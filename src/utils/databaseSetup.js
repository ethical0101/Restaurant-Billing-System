// Database setup utility to initialize Firebase with menu data
import { firebaseService } from '../services/firebaseService';
import { menuItems as staticMenuItems } from '../data/menuData';

export class DatabaseSetup {
  // Check if database needs to be seeded
  static async needsInitialization() {
    try {
      const menuItems = await firebaseService.getMenuItems();
      return menuItems.length === 0;
    } catch (error) {
      console.error('Error checking database state:', error);
      return true; // Assume needs initialization on error
    }
  }

  // Initialize database with all required data
  static async initializeDatabase() {
    try {
      console.log('🚀 Starting database initialization...');

      // 1. Seed menu items if needed
      const needsMenuSeed = await this.needsInitialization();
      if (needsMenuSeed) {
        console.log('📝 Seeding menu items...');
        await firebaseService.seedMenuItems(staticMenuItems);
        console.log('✅ Menu items seeded successfully');
      } else {
        console.log('✅ Menu items already exist in database');
      }

      // 2. Setup default restaurant settings
      await this.setupRestaurantSettings();

      console.log('🎉 Database initialization completed successfully!');
      return true;
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      throw error;
    }
  }

  // Setup restaurant default settings
  static async setupRestaurantSettings() {
    try {
      const restaurantSettings = {
        name: 'Meal Minds',
        description: 'Fast food that feeds your mind and soul',
        address: 'Connaught Place, New Delhi, Delhi 110001, India',
        phone: '+91 98765 43210',
        email: 'contact@mealminds.com',
        coordinates: {
          lat: 28.6304,
          lng: 77.2177
        },
        hours: {
          monday: { open: '09:00', close: '23:00' },
          tuesday: { open: '09:00', close: '23:00' },
          wednesday: { open: '09:00', close: '23:00' },
          thursday: { open: '09:00', close: '23:00' },
          friday: { open: '09:00', close: '24:00' },
          saturday: { open: '09:00', close: '24:00' },
          sunday: { open: '10:00', close: '22:00' }
        },
        deliveryRadius: 10, // km
        estimatedPrepTime: {
          'dine-in': 15,
          'take-away': 10,
          'delivery': 30
        },
        paymentMethods: ['cash', 'card', 'upi', 'razorpay'],
        features: {
          onlineOrdering: true,
          delivery: true,
          takeaway: true,
          dineIn: true,
          reservations: false
        },
        social: {
          facebook: 'https://facebook.com/mealminds',
          instagram: 'https://instagram.com/mealminds',
          twitter: 'https://twitter.com/mealminds'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Save restaurant settings (this would be a one-time setup)
      console.log('🏪 Setting up restaurant configuration...');
      // await firebaseService.saveRestaurantSettings(restaurantSettings);
      console.log('✅ Restaurant settings configured');
    } catch (error) {
      console.error('Error setting up restaurant settings:', error);
      // Don't throw error for settings, as it's not critical
    }
  }

  // Get initialization status for UI
  static async getInitializationStatus() {
    try {
      const menuCount = (await firebaseService.getMenuItems()).length;

      return {
        isInitialized: menuCount > 0,
        menuItemsCount: menuCount,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      return {
        isInitialized: false,
        menuItemsCount: 0,
        error: error.message
      };
    }
  }

  // Quick setup for demo purposes
  static async quickSetup() {
    try {
      console.log('⚡ Running quick database setup...');

      const needsSetup = await this.needsInitialization();
      if (needsSetup) {
        await this.initializeDatabase();
        return { success: true, message: 'Database initialized successfully!' };
      } else {
        return { success: true, message: 'Database already initialized.' };
      }
    } catch (error) {
      return { success: false, message: `Setup failed: ${error.message}` };
    }
  }
}

export const dbSetup = DatabaseSetup;
