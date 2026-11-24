const DB_NAME = 'mab.asset.storage';
const DB_VERSION = 1;
const STORE_NAME = 'images';

export class AssetStore {
  constructor() {
    this.dbPromise = null;
  }

  open() {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = () => {
        const db = request.result;

        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    return this.dbPromise;
  }

  async saveImage(file) {
    const db = await this.open();
    const id = crypto.randomUUID();

    const record = {
      id,
      name: file.name,
      type: file.type,
      size: file.size,
      blob: file
    };

    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).put(record);
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });

    return {
      id,
      name: file.name,
      type: file.type,
      size: file.size
    };
  }

  async getImage(id) {
    const db = await this.open();

    return new Promise((resolve, reject) => {
      const request = db.transaction(STORE_NAME, 'readonly')
        .objectStore(STORE_NAME)
        .get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async listImages() {
    const db = await this.open();

    return new Promise((resolve, reject) => {
      const request = db.transaction(STORE_NAME, 'readonly')
        .objectStore(STORE_NAME)
        .getAll();

      request.onsuccess = () => {
        resolve((request.result || []).map(({ id, name, type, size }) => ({
          id, name, type, size
        })));
      };

      request.onerror = () => reject(request.error);
    });
  }

  async deleteImage(id) {
    if (!id) return;

    const db = await this.open();

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).delete(id);
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
  }
}
