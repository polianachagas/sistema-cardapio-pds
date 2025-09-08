import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

/**
 * Firebase Admin SDK Configuration
 * Initializes Firebase services for server-side operations
 */
class FirebaseConfig {
  private static instance: FirebaseConfig;
  private initialized = false;

  private constructor() {}

  static getInstance(): FirebaseConfig {
    if (!FirebaseConfig.instance) {
      FirebaseConfig.instance = new FirebaseConfig();
    }
    return FirebaseConfig.instance;
  }

  /**
   * Initialize Firebase Admin SDK
   */
  initialize(): void {
    if (this.initialized) {
      console.log('Firebase Admin already initialized');
      return;
    }

    try {
      // Check if we have service account credentials
      const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
      const projectId = process.env.FIREBASE_PROJECT_ID;

      if (!projectId) {
        throw new Error('FIREBASE_PROJECT_ID environment variable is required');
      }

      let credential;

      if (serviceAccountKey) {
        // Parse service account key from environment variable
        const serviceAccount = JSON.parse(serviceAccountKey);
        credential = admin.credential.cert(serviceAccount);
      } else {
        // Use default credentials (useful for Google Cloud Platform)
        credential = admin.credential.applicationDefault();
      }

      // Initialize Firebase Admin
      admin.initializeApp({
        credential,
        projectId,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET || `${projectId}.appspot.com`
      });

      this.initialized = true;
      console.log('🔥 Firebase Admin SDK initialized successfully');

    } catch (error) {
      console.error('❌ Error initializing Firebase Admin SDK:', error);
      throw error;
    }
  }

  /**
   * Get Firestore database instance
   */
  getFirestore() {
    if (!this.initialized) {
      this.initialize();
    }
    return getFirestore();
  }

  /**
   * Get Cloud Storage instance
   */
  getStorage() {
    if (!this.initialized) {
      this.initialize();
    }
    return getStorage();
  }

  /**
   * Get Firebase Admin instance
   */
  getAdmin() {
    if (!this.initialized) {
      this.initialize();
    }
    return admin;
  }
}

// Export singleton instance
export const firebaseConfig = FirebaseConfig.getInstance();

// Export convenient getters
export const db = firebaseConfig.getFirestore();
export const storage = firebaseConfig.getStorage();
export const adminApp = firebaseConfig.getAdmin();

// Auto-initialize on import
firebaseConfig.initialize();
