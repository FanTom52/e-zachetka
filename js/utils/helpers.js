import { ATTENDANCE_STATUS } from './constants.js';

export class Helpers {
    static generateId() {
        return Date.now() + Math.random().toString(36).substr(2, 9);
    }

    static getGradeClass(grade) {
        if (grade === '5' || grade === 'зачёт') return 'bg-success';
        if (grade === '4') return 'bg-info';
        if (grade === '3') return 'bg-warning';
        if (grade === '2' || grade === 'незачёт') return 'bg-danger';
        return 'bg-secondary';
    }

    static getAttendanceStatusBadge(status) {
        const badges = {
            [ATTENDANCE_STATUS.PRESENT]: '<span class="badge bg-success"><i class="bi bi-check-lg me-1"></i>Присутствовал</span>',
            [ATTENDANCE_STATUS.ABSENT]: '<span class="badge bg-danger"><i class="bi bi-x-lg me-1"></i>Отсутствовал</span>',
            [ATTENDANCE_STATUS.ILLNESS]: '<span class="badge bg-warning"><i class="bi bi-plus-circle me-1"></i>Болезнь</span>',
            [ATTENDANCE_STATUS.REASON]: '<span class="badge bg-info"><i class="bi bi-file-text me-1"></i>Уважительная причина</span>'
        };
        return badges[status] || '<span class="badge bg-secondary">Неизвестно</span>';
    }

    static showAlert(title, message, type = 'info') {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.innerHTML = `
            <strong>${title}</strong> ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        const container = document.querySelector('.container-fluid');
        if (container) {
            container.insertBefore(alertDiv, container.firstChild);
        }
        
        setTimeout(() => {
            if (alertDiv.parentNode) alertDiv.remove();
        }, 5000);
    }

    static formatDate(date) {
        return new Date(date).toLocaleDateString('ru-RU');
    }
}