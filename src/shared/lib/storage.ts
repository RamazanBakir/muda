export const storage = {
    get: <T>(key: string, defaultValue: T): T => {
        if (typeof window === "undefined") return defaultValue;
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.warn(`Error reading ${key} from localStorage`, e);
            return defaultValue;
        }
    },
    set: <T>(key: string, value: T): void => {
        if (typeof window === "undefined") return;
        try {
            window.localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.warn(`Error writing ${key} to localStorage`, e);
        }
    },
    remove: (key: string): void => {
        if (typeof window === "undefined") return;
        try {
            window.localStorage.removeItem(key);
        } catch (e) {
            console.warn(`Error removing ${key} from localStorage`, e);
        }
    },
};
