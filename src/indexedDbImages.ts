import type { ExchangeKey } from "./exchangeConfigs";

export type StoredImage = {
  id: number;
  name: string;
  blob: Blob;
  exchangeId: ExchangeKey;
};

const DB_NAME = "image-generator-db";
const STORE_NAME = "background-images";
const DB_VERSION = 3;
const EXCHANGE_INDEX = "by-exchange-id";

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      const transaction = request.transaction;
      let store: IDBObjectStore;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        store = db.createObjectStore(STORE_NAME, {
          keyPath: "id",
          autoIncrement: true,
        });
      } else {
        store = transaction!.objectStore(STORE_NAME);
      }

      if (!store.indexNames.contains(EXCHANGE_INDEX)) {
        store.createIndex(EXCHANGE_INDEX, "exchangeId", { unique: false });
      }

      const cursorRequest = store.openCursor();
      cursorRequest.onsuccess = () => {
        const cursor = cursorRequest.result;

        if (!cursor) {
          return;
        }

        const value = cursor.value as Partial<StoredImage>;
        const rawExchangeId = (value as { exchangeId?: string }).exchangeId;
        const migratedExchangeId =
          rawExchangeId === "bybit"
            ? "weex"
            : rawExchangeId === "binance"
              ? "bingx"
              : rawExchangeId;

        if (!migratedExchangeId) {
          cursor.update({
            ...value,
            exchangeId: "weex",
          });
        } else if (migratedExchangeId !== rawExchangeId) {
          cursor.update({
            ...value,
            exchangeId: migratedExchangeId,
          });
        }

        cursor.continue();
      };

      cursorRequest.onerror = () => {
        reject(cursorRequest.error);
      };
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getStoredImages(exchangeId: ExchangeKey): Promise<StoredImage[]> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);

    if (!store.indexNames.contains(EXCHANGE_INDEX)) {
      const fallbackRequest = store.getAll();
      fallbackRequest.onsuccess = () => {
        const result = (fallbackRequest.result as StoredImage[]).filter(
          (image) => image.exchangeId === exchangeId
        );
        resolve(result);
      };
      fallbackRequest.onerror = () => reject(fallbackRequest.error);
      return;
    }

    const index = store.index(EXCHANGE_INDEX);
    const request = index.getAll(exchangeId);

    request.onsuccess = () => {
      resolve(request.result as StoredImage[]);
    };

    request.onerror = () => reject(request.error);
  });
}

export async function addStoredImage(file: File, exchangeId: ExchangeKey): Promise<number> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    const request = store.add({
      name: file.name,
      blob: file,
      exchangeId,
    });

    request.onsuccess = () => resolve(request.result as number);
    request.onerror = () => reject(request.error);
  });
}

export async function deleteStoredImage(id: number): Promise<void> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}
