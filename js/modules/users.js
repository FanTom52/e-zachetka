import { StorageManager } from '../utils/storage.js';
import { Validator } from '../utils/validation.js';
import { Helpers } from '../utils/helpers.js';
import { USER_ROLES } from '../utils/constants.js';

export class UsersManager {
    constructor() {
        this.appData = StorageManager.getAppData();
    }

    getAllUsers() {
        return this.appData.users;
    }

    getUserById(id) {
        return this.appData.users.find(user => user.id === id);
    }

    getUserByUsername(username) {
        return this.appData.users.find(user => user.username === username);
    }

    addUser(name, username, password, role, subjects = []) {
        if (!Validator.isNotEmpty(name) || !Validator.isNotEmpty(username) || !Validator.isNotEmpty(password)) {
            Helpers.showAlert('Ошибка', 'Заполните все обязательные поля!', 'warning');
            return false;
        }

        if (!Validator.isStrongPassword(password)) {
            Helpers.showAlert('Ошибка', 'Пароль должен содержать минимум 6 символов, включая заглавные буквы и цифры', 'warning');
            return false;
        }

        if (this.getUserByUsername(username)) {
            Helpers.showAlert('Ошибка', 'Пользователь с таким логином уже существует!', 'danger');
            return false;
        }

        const newUser = {
            id: Helpers.generateId(),
            name: name.trim(),
            username: username.trim(),
            password: password,
            role: role,
            subjects: Array.isArray(subjects) ? subjects : subjects.split(',').map(s => s.trim()).filter(s => s),
            createdAt: new Date().toISOString(),
            isActive: true
        };

        this.appData.users.push(newUser);
        
        if (StorageManager.saveAppData(this.appData)) {
            Helpers.showAlert('Успех', `Пользователь ${name} добавлен в систему`, 'success');
            return true;
        }
        
        return false;
    }

    updateUser(id, updates) {
        const userIndex = this.appData.users.findIndex(user => user.id === id);
        if (userIndex === -1) return false;

        // Проверяем уникальность логина
        if (updates.username) {
            const existingUser = this.appData.users.find(
                user => user.username === updates.username && user.id !== id
            );
            if (existingUser) {
                Helpers.showAlert('Ошибка', 'Пользователь с таким логином уже существует!', 'danger');
                return false;
            }
        }

        // Если обновляется пароль, проверяем его силу
        if (updates.password && !Validator.isStrongPassword(updates.password)) {
            Helpers.showAlert('Ошибка', 'Пароль должен содержать минимум 6 символов, включая заглавные буквы и цифры', 'warning');
            return false;
        }

        this.appData.users[userIndex] = { 
            ...this.appData.users[userIndex], 
            ...updates,
            updatedAt: new Date().toISOString()
        };
        
        return StorageManager.saveAppData(this.appData);
    }

    deleteUser(id, currentUserId) {
        if (id === currentUserId) {
            Helpers.showAlert('Ошибка', 'Нельзя удалить собственный аккаунт!', 'danger');
            return false;
        }

        const user = this.getUserById(id);
        if (!user) return false;

        this.appData.users = this.appData.users.filter(u => u.id !== id);
        
        if (StorageManager.saveAppData(this.appData)) {
            Helpers.showAlert('Удалено', `Пользователь ${user.name} удалён из системы`, 'info');
            return true;
        }
        
        return false;
    }

    changeUserPassword(id, newPassword) {
        if (!Validator.isStrongPassword(newPassword)) {
            Helpers.showAlert('Ошибка', 'Пароль должен содержать минимум 6 символов, включая заглавные буквы и цифры', 'warning');
            return false;
        }

        return this.updateUser(id, { password: newPassword });
    }

    getTeachers() {
        return this.appData.users.filter(user => user.role === USER_ROLES.TEACHER);
    }

    getAdmins() {
        return this.appData.users.filter(user => user.role === USER_ROLES.ADMIN);
    }

    getUserRoleBadge(role) {
        return role === USER_ROLES.ADMIN ? 
            '<span class="badge bg-danger">Администратор</span>' : 
            '<span class="badge bg-primary">Преподаватель</span>';
    }

    validateUserAccess(currentUser, targetUserId, action = 'view') {
        if (!currentUser) return false;

        // Админы могут всё
        if (currentUser.role === USER_ROLES.ADMIN) return true;

        // Преподаватели могут просматривать только себя
        if (action === 'view' && currentUser.id === targetUserId) return true;

        return false;
    }
}