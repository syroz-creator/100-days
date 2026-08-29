import { CheckpointPhoto, FormRecording, PoseType } from '../types';

const DB_NAME = '100_DAYS_PHOTO_DB';
const DB_VERSION = 2;
const PHOTO_STORE_NAME = 'checkpoint_photos';
const RECORDING_STORE_NAME = 'form_recordings';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this browser.'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(PHOTO_STORE_NAME)) {
        const store = db.createObjectStore(PHOTO_STORE_NAME, { keyPath: 'id' });
        store.createIndex('programDay', 'programDay', { unique: false });
        store.createIndex('pose', 'pose', { unique: false });
      }
      if (!db.objectStoreNames.contains(RECORDING_STORE_NAME)) {
        const store = db.createObjectStore(RECORDING_STORE_NAME, { keyPath: 'id' });
        store.createIndex('exerciseId', 'exerciseId', { unique: false });
        store.createIndex('date', 'date', { unique: false });
      }
    };
  });
}

export async function savePhotoToIDB(photo: CheckpointPhoto): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([PHOTO_STORE_NAME], 'readwrite');
    const store = transaction.objectStore(PHOTO_STORE_NAME);
    const request = store.put(photo);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getPhotosFromIDB(): Promise<CheckpointPhoto[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([PHOTO_STORE_NAME], 'readonly');
      const store = transaction.objectStore(PHOTO_STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('Could not read from IndexedDB, returning empty photos array', err);
    return [];
  }
}

export async function getPhotoByDayAndPose(programDay: number, pose: PoseType): Promise<CheckpointPhoto | null> {
  const photos = await getPhotosFromIDB();
  return photos.find((p) => p.programDay === programDay && p.pose === pose) || null;
}

export async function deletePhotoFromIDB(photoId: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([PHOTO_STORE_NAME], 'readwrite');
    const store = transaction.objectStore(PHOTO_STORE_NAME);
    const request = store.delete(photoId);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function clearAllPhotosFromIDB(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([PHOTO_STORE_NAME], 'readwrite');
    const store = transaction.objectStore(PHOTO_STORE_NAME);
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function saveRecordingToIDB(recording: FormRecording): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([RECORDING_STORE_NAME], 'readwrite');
    const store = transaction.objectStore(RECORDING_STORE_NAME);
    const request = store.put(recording);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getRecordingsFromIDB(): Promise<FormRecording[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([RECORDING_STORE_NAME], 'readonly');
      const store = transaction.objectStore(RECORDING_STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('Could not read form recordings from IndexedDB', err);
    return [];
  }
}

export async function deleteRecordingFromIDB(recordingId: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([RECORDING_STORE_NAME], 'readwrite');
    const store = transaction.objectStore(RECORDING_STORE_NAME);
    const request = store.delete(recordingId);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function clearAllRecordingsFromIDB(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([RECORDING_STORE_NAME], 'readwrite');
    const store = transaction.objectStore(RECORDING_STORE_NAME);
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Compress image helper before saving
export function compressImage(file: File, maxWidth = 1200, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = (e) => reject(e);
    };
    reader.onerror = (e) => reject(e);
  });
}
