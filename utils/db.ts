import { GalleryImage } from '../types';

const DB_NAME = 'MadabaSchoolDB';
const STORE_NAME = 'gallery';
const DB_VERSION = 1;

export const db = {
  open: (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };

      request.onsuccess = (event) => {
        resolve((event.target as IDBOpenDBRequest).result);
      };

      request.onerror = (event) => {
        reject((event.target as IDBOpenDBRequest).error);
      };
    });
  },

  getAllImages: async (): Promise<GalleryImage[]> => {
    const dbInstance = await db.open();
    return new Promise((resolve, reject) => {
      const transaction = dbInstance.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        // Sort by dateAdded (newest first) - simplistic approach
        const result = request.result as GalleryImage[];
        resolve(result.reverse()); 
      };
      request.onerror = () => reject(request.error);
    });
  },

  addImage: async (image: GalleryImage): Promise<void> => {
    const dbInstance = await db.open();
    return new Promise((resolve, reject) => {
      const transaction = dbInstance.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.add(image);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  deleteImage: async (id: string): Promise<void> => {
    const dbInstance = await db.open();
    return new Promise((resolve, reject) => {
      const transaction = dbInstance.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },
  
  clearGallery: async (): Promise<void> => {
      const dbInstance = await db.open();
      return new Promise((resolve, reject) => {
        const transaction = dbInstance.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.clear();
  
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
  }
};
