function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
    });
}

// IndexedDB helper functions
const DB_NAME = 'tts_cache_db';
const STORE_NAME = 'audio_cache';
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        
        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };
    });
}

async function getFromIndexedDB(key: string): Promise<string | null> {
    try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.get(key);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result || null);
        });
    } catch (error) {
        console.warn('IndexedDB read failed:', error);
        return null;
    }
}

async function setToIndexedDB(key: string, value: string): Promise<void> {
    try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.put(value, key);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve();
        });
    } catch (error) {
        console.warn('IndexedDB write failed:', error);
        throw error;
    }
}

async function deleteFromIndexedDB(key: string): Promise<void> {
    try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME], "readwrite");
            const store = transaction.objectStore(STORE_NAME);
            const request = store.delete(key);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve();
        });
    } catch (error) {
        console.warn("IndexedDB delete failed:", error);
    }
}

export type AudioSpeed = "slow" | "normal" | "fast";

const SPEED_TO_RATE: Record<AudioSpeed, number> = {
    slow: 0.8,
    normal: 1.0,
    fast: 1.25,
};

export function getPlaybackRate(speed: AudioSpeed): number {
    return SPEED_TO_RATE[speed];
}

export async function deleteAudioCacheForCard(cardId: string, lang = "en"): Promise<void> {
    const cacheKey = `tts_${lang}_${cardId}`;
    localStorage.removeItem(cacheKey);
    await deleteFromIndexedDB(cacheKey);
}

export async function getAudioUrlForCard(cardId: string, text: string, lang = "en") {
    const cacheKey = `tts_${lang}_${cardId}`;
    
    // Try localStorage first (faster)
    const cachedLocal = localStorage.getItem(cacheKey);
    if (cachedLocal) return cachedLocal;
    
    // Try IndexedDB as fallback
    const cachedIndexed = await getFromIndexedDB(cacheKey);
    if (cachedIndexed) return cachedIndexed;

    // Fetch from API if not cached
    const response = await fetch(`/api/tts?q=${encodeURIComponent(text)}&lang=${lang}`);
    if (!response.ok) throw new Error("TTS fetch failed");

    const blob = await response.blob();
    const base64 = await blobToBase64(blob);
    
    // Try localStorage first
    try {
        localStorage.setItem(cacheKey, base64);
        return base64;
    } catch (error) {
        // If quota exceeded, use IndexedDB as fallback
        if (error instanceof DOMException && error.name === 'QuotaExceededError') {
            console.warn('localStorage quota exceeded, using IndexedDB for caching');
            try {
                await setToIndexedDB(cacheKey, base64);
                return base64;
            } catch (indexedError) {
                console.warn('IndexedDB storage also failed, continuing without cache:', indexedError);
                // Still return the audio even if caching fails
                return base64;
            }
        } else {
            throw error;
        }
    }
}

export async function playCardAudio(cardId: string, text: string, lang = "en", playbackRate = 1) {
    const base64Url = await getAudioUrlForCard(cardId, text, lang);
    const audio = new Audio(base64Url);
    audio.playbackRate = playbackRate;
    await audio.play();
}
