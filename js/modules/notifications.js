import { StorageManager } from '../utils/storage.js';
import { Helpers } from '../utils/helpers.js';

export class NotificationsManager {
    constructor() {
        this.notifications = StorageManager.get('e-zachetka-notifications') || [];
        this.settings = StorageManager.get('e-zachetka-notification-settings') || {
            enableDeadlineNotifications: true,
            enableGradeNotifications: true,
            enableDebtNotifications: true,
            deadlineDays: 7
        };
    }

    getAllNotifications() {
        return this.notifications;
    }

    addNotification(type, title, message, studentId = null, subjectId = null) {
        const notification = {
            id: Helpers.generateId(),
            type: type,
            title: title,
            message: message,
            studentId: studentId,
            subjectId: subjectId,
            date: new Date().toISOString(),
            read: false
        };

        this.notifications.unshift(notification);
        this.saveNotifications();
        this.updateBadge();
        
        return notification.id;
    }

    markAsRead(id) {
        const notification = this.notifications.find(n => n.id === id);
        if (notification) {
            notification.read = true;
            this.saveNotifications();
            this.updateBadge();
            return true;
        }
        return false;
    }

    markAllAsRead() {
        this.notifications.forEach(notification => {
            notification.read = true;
        });
        this.saveNotifications();
        this.updateBadge();
        return true;
    }

    deleteNotification(id) {
        this.notifications = this.notifications.filter(n => n.id !== id);
        this.saveNotifications();
        this.updateBadge();
        return true;
    }

    clearAllNotifications() {
        this.notifications = [];
        this.saveNotifications();
        this.updateBadge();
        return true;
    }

    saveNotifications() {
        return StorageManager.set('e-zachetka-notifications', this.notifications);
    }

    updateBadge() {
        const unreadCount = this.notifications.filter(n => !n.read).length;
        const badge = document.getElementById('notificationBadgeNav');
        
        if (badge) {
            badge.textContent = unreadCount;
            badge.style.display = unreadCount > 0 ? 'inline-block' : 'none';
        }
    }

    getUnreadCount() {
        return this.notifications.filter(n => !n.read).length;
    }

    getRecentNotifications(limit = 5) {
        return this.notifications.slice(0, limit);
    }

    groupNotificationsByDate() {
        const grouped = {};
        
        this.notifications.forEach(notification => {
            const date = new Date(notification.date).toDateString();
            if (!grouped[date]) {
                grouped[date] = [];
            }
            grouped[date].push(notification);
        });
        
        return grouped;
    }

    formatNotificationDate(dateString) {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (date.toDateString() === today.toDateString()) {
            return 'Сегодня';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Вчера';
        } else {
            return date.toLocaleDateString('ru-RU', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
    }

    getNotificationIcon(type) {
        const icons = {
            'success': '✓',
            'warning': '⚠',
            'danger': '🚨',
            'info': 'ℹ'
        };
        return icons[type] || '📢';
    }

    getNotificationBadgeClass(type) {
        const classes = {
            'success': 'bg-success',
            'warning': 'bg-warning',
            'danger': 'bg-danger',
            'info': 'bg-info'
        };
        return classes[type] || 'bg-secondary';
    }

    // Методы для проверки и создания системных уведомлений
    checkDeadlines(calendarManager) {
        const upcomingDeadlines = calendarManager.getUpcomingDeadlines(this.settings.deadlineDays);
        
        upcomingDeadlines.forEach(deadline => {
            const daysLeft = Math.ceil((new Date(deadline.date) - new Date()) / (1000 * 60 * 60 * 24));
            
            if (daysLeft <= 3) {
                this.addNotification(
                    'danger',
                    '⚠️ Срочный дедлайн',
                    `"${deadline.title}" - осталось ${daysLeft} ${this.getDayText(daysLeft)}`,
                    null,
                    null
                );
            } else if (daysLeft <= 7) {
                this.addNotification(
                    'warning',
                    '📅 Приближается дедлайн',
                    `"${deadline.title}" - через ${daysLeft} ${this.getDayText(daysLeft)}`,
                    null,
                    null
                );
            }
        });
    }

    checkStudentDebts(reportsManager) {
        const studentsWithDebts = reportsManager.findStudentsWithDebts();
        
        if (studentsWithDebts.length > 0) {
            this.addNotification(
                'warning',
                '📚 Академические долги',
                `Найдено ${studentsWithDebts.length} студентов с незакрытыми предметами`,
                null,
                null
            );
        }
    }

    getDayText(days) {
        if (days === 1) return 'день';
        if (days >= 2 && days <= 4) return 'дня';
        return 'дней';
    }

    getSettings() {
        return this.settings;
    }

    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        StorageManager.set('e-zachetka-notification-settings', this.settings);
        return true;
    }
}