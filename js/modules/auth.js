import { StorageManager } from '../utils/storage.js';
import { Validator } from '../utils/validation.js';
import { Helpers } from '../utils/helpers.js';

export class AuthManager {
    constructor() {
        this.currentUser = null;
        this.appData = StorageManager.getAppData();
    }

    login(username, password, role) {
        if (!Validator.isNotEmpty(username) || !Validator.isNotEmpty(password)) {
            Helpers.showAlert('Ошибка', 'Заполните все поля!', 'warning');
            return false;
        }

        const user = this.appData.users.find(u => 
            u.username === username && 
            u.password === password && 
            u.role === role
        );

        if (user) {
            this.currentUser = user;
            this.appData.system.totalLogins++;
            StorageManager.saveAppData(this.appData);
            return true;
        }

        Helpers.showAlert('Ошибка входа', 'Неверный логин, пароль или роль!', 'danger');
        return false;
    }

    logout() {
        this.currentUser = null;
        return true;
    }

    getCurrentUser() {
        return this.currentUser;
    }
}