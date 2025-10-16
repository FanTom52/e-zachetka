import { StorageManager } from '../utils/storage.js';

export class SubjectsManager {
    constructor() {
        this.appData = StorageManager.getAppData();
    }

    getAllSubjects() {
        return this.appData.subjects;
    }
}