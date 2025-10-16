import { StorageManager } from '../utils/storage.js';

export class GradesManager {
    constructor() {
        this.appData = StorageManager.getAppData();
    }

    getAllGrades() {
        return this.appData.grades;
    }

    calculateOverallStatistics() {
        return {
            totalStudents: this.appData.students.length,
            totalSubjects: this.appData.subjects.length,
            totalGrades: this.appData.grades.length,
            averageGrade: '0.00'
        };
    }
}