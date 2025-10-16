import { StorageManager } from '../utils/storage.js';
import { Validator } from '../utils/validation.js';
import { Helpers } from '../utils/helpers.js';
import { ATTENDANCE_STATUS } from '../utils/constants.js';

export class AttendanceManager {
    constructor() {
        this.records = StorageManager.get('e-zachetka-attendance') || [];
        this.appData = StorageManager.getAppData();
    }

    getAllRecords() {
        return this.records;
    }

    markAttendance(eventId, studentId, status, reason = '', gradeValue = null) {
        if (!eventId || !studentId || !status) {
            Helpers.showAlert('Ошибка', 'Заполните обязательные поля!', 'warning');
            return false;
        }

        // Удаляем существующую запись
        this.records = this.records.filter(record => 
            !(record.studentId === studentId && record.eventId === eventId)
        );

        const record = {
            id: Helpers.generateId(),
            studentId: studentId,
            eventId: eventId,
            date: new Date().toISOString().split('T')[0],
            status: status,
            reason: reason,
            recordedAt: new Date().toISOString()
        };

        this.records.push(record);
        this.saveRecords();

        // Если студент присутствовал и указана оценка - выставляем её
        if (status === ATTENDANCE_STATUS.PRESENT && gradeValue) {
            // Находим предмет по событию (нужно будет доработать связь событий с предметами)
            const event = this.appData.calendarEvents?.find(e => e.id === eventId);
            if (event) {
                // Здесь нужно доработать логику связывания события с предметом
                console.log('Would add grade:', { studentId, gradeValue, event });
            }
        }

        return true;
    }

    saveRecords() {
        return StorageManager.set('e-zachetka-attendance', this.records);
    }

    getRecordsByEvent(eventId) {
        return this.records.filter(record => record.eventId === eventId);
    }

    getRecordsByStudent(studentId) {
        return this.records.filter(record => record.studentId === studentId);
    }

    getRecentRecords(limit = 15) {
        return this.records
            .sort((a, b) => new Date(b.recordedAt) - new Date(a.recordedAt))
            .slice(0, limit);
    }

    getAttendanceStatistics() {
        const totalEvents = [...new Set(this.records.map(r => r.eventId))].length;
        const totalRecords = this.records.length;
        
        const statusCounts = {
            [ATTENDANCE_STATUS.PRESENT]: this.records.filter(r => r.status === ATTENDANCE_STATUS.PRESENT).length,
            [ATTENDANCE_STATUS.ABSENT]: this.records.filter(r => r.status === ATTENDANCE_STATUS.ABSENT).length,
            [ATTENDANCE_STATUS.ILLNESS]: this.records.filter(r => r.status === ATTENDANCE_STATUS.ILLNESS).length,
            [ATTENDANCE_STATUS.REASON]: this.records.filter(r => r.status === ATTENDANCE_STATUS.REASON).length
        };

        return {
            totalEvents,
            totalRecords,
            statusCounts
        };
    }

    findStudentsForRetake() {
        return this.records
            .filter(record => record.status === ATTENDANCE_STATUS.ABSENT)
            .map(record => {
                const student = this.appData.students.find(s => s.id === record.studentId);
                const event = this.appData.calendarEvents?.find(e => e.id === record.eventId);
                return { student, event, record };
            })
            .filter(item => item.student && item.event);
    }
}