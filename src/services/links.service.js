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
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { normalizeUrl, getDomain, getFaviconUrl } from '../utils/url';
import { encryptUrl, decryptUrl } from '../utils/encryption';

export const linksService = {
  /**
   * Create a new link
   */
  async createLink(userId, linkData) {
    const linksRef = collection(db, 'users', userId, 'links');
    
    const normalizedUrl = normalizeUrl(linkData.url);
    const domain = getDomain(linkData.url);
    const faviconUrl = linkData.faviconUrl || getFaviconUrl(linkData.url);

    const encryptedUrl = await encryptUrl(linkData.url, userId);

    const newLink = {
      url: encryptedUrl,
      normalizedUrl,
      title: linkData.title || domain,
      description: linkData.description || '',
      domain,
      faviconUrl,
      thumbnailUrl: linkData.thumbnailUrl || null,
      category: linkData.category || null,
      tags: linkData.tags || [],
      collectionId: linkData.collectionId || null,
      isFavorite: false,
      status: 'unread',
      notes: linkData.notes || '',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      lastOpenedAt: null,
    };

    const docRef = await addDoc(linksRef, newLink);
    
    const decryptedUrl = await decryptUrl(encryptedUrl, userId);
    return { id: docRef.id, ...newLink, url: decryptedUrl };
  },

  /**
   * Get all links for a user
   */
  async getLinks(userId, sortBy = 'newest') {
    const linksRef = collection(db, 'users', userId, 'links');
    
    let sortField = 'createdAt';
    let sortDirection = 'desc';

    if (sortBy === 'oldest') {
      sortDirection = 'asc';
    } else if (sortBy === 'title') {
      sortField = 'title';
      sortDirection = 'asc';
    } else if (sortBy === 'recently-opened') {
      sortField = 'lastOpenedAt';
      sortDirection = 'desc';
    }

    const q = query(linksRef, orderBy(sortField, sortDirection));
    const snapshot = await getDocs(q);

    const links = await Promise.all(
      snapshot.docs.map(async (docSnap) => {
        const data = docSnap.data();
        const decryptedUrl = await decryptUrl(data.url, userId);
        return {
          id: docSnap.id,
          ...data,
          url: decryptedUrl,
        };
      })
    );

    return links;
  },

  /**
   * Get a single link by ID
   */
  async getLink(userId, linkId) {
    const linkRef = doc(db, 'users', userId, 'links', linkId);
    const snapshot = await getDoc(linkRef);
    
    if (!snapshot.exists()) {
      throw new Error('Link tidak ditemukan');
    }

    const data = snapshot.data();
    const decryptedUrl = await decryptUrl(data.url, userId);

    return {
      id: snapshot.id,
      ...data,
      url: decryptedUrl,
    };
  },

  /**
   * Check for duplicate link by normalized URL
   */
  async checkDuplicate(userId, url) {
    const normalizedUrl = normalizeUrl(url);
    const linksRef = collection(db, 'users', userId, 'links');
    const q = query(linksRef, where('normalizedUrl', '==', normalizedUrl));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return null;
    }

    const data = snapshot.docs[0].data();
    const decryptedUrl = await decryptUrl(data.url, userId);
    return {
      id: snapshot.docs[0].id,
      ...data,
      url: decryptedUrl,
    };
  },

  /**
   * Update a link
   */
  async updateLink(userId, linkId, updates) {
    const linkRef = doc(db, 'users', userId, 'links', linkId);

    const updateData = {
      ...updates,
      updatedAt: Timestamp.now(),
    };

    if (updates.url) {
      updateData.url = await encryptUrl(updates.url, userId);
    }

    await updateDoc(linkRef, updateData);
    return await this.getLink(userId, linkId);
  },

  /**
   * Delete a link
   */
  async deleteLink(userId, linkId) {
    const linkRef = doc(db, 'users', userId, 'links', linkId);
    await deleteDoc(linkRef);
  },

  /**
   * Update last opened time
   */
  async updateLastOpened(userId, linkId) {
    const linkRef = doc(db, 'users', userId, 'links', linkId);
    await updateDoc(linkRef, {
      lastOpenedAt: Timestamp.now(),
    });
  },

  /**
   * Get links by collection
   */
  async getLinksByCollection(userId, collectionId) {
    const linksRef = collection(db, 'users', userId, 'links');
    const q = query(linksRef, where('collectionId', '==', collectionId));
    const snapshot = await getDocs(q);

    const links = await Promise.all(
      snapshot.docs.map(async (docSnap) => {
        const data = docSnap.data();
        const decryptedUrl = await decryptUrl(data.url, userId);
        return {
          id: docSnap.id,
          ...data,
          url: decryptedUrl,
        };
      })
    );

    return links;
  },

  /**
   * Get favorite links
   */
  async getFavoriteLinks(userId) {
    const linksRef = collection(db, 'users', userId, 'links');
    const q = query(linksRef, where('isFavorite', '==', true));
    const snapshot = await getDocs(q);

    const links = await Promise.all(
      snapshot.docs.map(async (docSnap) => {
        const data = docSnap.data();
        const decryptedUrl = await decryptUrl(data.url, userId);
        return {
          id: docSnap.id,
          ...data,
          url: decryptedUrl,
        };
      })
    );

    return links;
  },
};
