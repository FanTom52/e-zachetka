import { StorageManager } from '../utils/storage.js';
import { Validator } from '../utils/validation.js';
import { Helpers } from '../utils/helpers.js';

export class StudentsManager {
    constructor() {
        this.appData = StorageManager.getAppData();
    }

    getAllStudents() {
        return this.appData.students;
    }

    addStudent(name, group) {
        if (!Validator.isNotEmpty(name) || !Validator.isNotEmpty(group)) {
            Helpers.showAlert('Ошибка', 'Заполните все поля!', 'warning');
            return false;
        }

        const student = {
            id: Helpers.generateId(),
            name: name.trim(),
            group: group.trim(),
            createdAt: new Date().toISOString()
        };

        this.appData.students.push(student);
        
        if (StorageManager.saveAppData(this.appData)) {
            Helpers.showAlert('Успех', `Студент ${name} добавлен в группу ${group}`, 'success');
            return true;
        }
        
        return false;
    }

    deleteStudent(id) {
        this.appData.students = this.appData.students.filter(s => s.id !== id);
        this.appData.grades = this.appData.grades.filter(g => g.studentId !== id);
        
        if (StorageManager.saveAppData(this.appData)) {
            Helpers.showAlert('Удалено', 'Студент и все его оценки удалены', 'info');
            return true;
        }
        
        return false;
    }
}