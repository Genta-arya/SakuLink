import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';

export const collectionsService = {
  /**
   * Create a new collection
   */
  async createCollection(userId, collectionData) {
    const collectionsRef = collection(db, 'users', userId, 'collections');

    const newCollection = {
      name: collectionData.name,
      description: collectionData.description || '',
      color: collectionData.color || null,
      icon: collectionData.icon || null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(collectionsRef, newCollection);
    return { id: docRef.id, ...newCollection };
  },

  /**
   * Get all collections for a user
   */
  async getCollections(userId) {
    const collectionsRef = collection(db, 'users', userId, 'collections');
    const snapshot = await getDocs(collectionsRef);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  },

  /**
   * Get a single collection by ID
   */
  async getCollection(userId, collectionId) {
    const collectionRef = doc(db, 'users', userId, 'collections', collectionId);
    const snapshot = await getDoc(collectionRef);

    if (!snapshot.exists()) {
      throw new Error('Koleksi tidak ditemukan');
    }

    return {
      id: snapshot.id,
      ...snapshot.data(),
    };
  },

  /**
   * Update a collection
   */
  async updateCollection(userId, collectionId, updates) {
    const collectionRef = doc(db, 'users', userId, 'collections', collectionId);

    const updateData = {
      ...updates,
      updatedAt: Timestamp.now(),
    };

    await updateDoc(collectionRef, updateData);
    return await this.getCollection(userId, collectionId);
  },

  /**
   * Delete a collection (does NOT delete links in it)
   */
  async deleteCollection(userId, collectionId) {
    const collectionRef = doc(db, 'users', userId, 'collections', collectionId);
    await deleteDoc(collectionRef);
  },

  /**
   * Check if collection name already exists
   */
  async checkCollectionNameExists(userId, name) {
    const collectionsRef = collection(db, 'users', userId, 'collections');
    const q = query(collectionsRef, where('name', '==', name));
    const snapshot = await getDocs(q);

    return !snapshot.empty;
  },
};
