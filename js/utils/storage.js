import { STORAGE_KEYS } from './constants.js';

export class StorageManager {
    static get(key) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error(`Error reading from localStorage ${key}:`, error);
            return null;
        }
    }

    static set(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error(`Error writing to localStorage ${key}:`, error);
            return false;
        }
    }

    static getAppData() {
        return this.get(STORAGE_KEYS.APP_DATA) || {
            students: [],
            subjects: [],
            grades: [],
            users: [],
            system: { totalLogins: 0, created: new Date().toISOString() }
        };
    }

    static saveAppData(data) {
        return this.set(STORAGE_KEYS.APP_DATA, data);
    }
}