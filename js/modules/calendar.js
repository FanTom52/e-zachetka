import { StorageManager } from '../utils/storage.js';
import { Validator } from '../utils/validation.js';
import { Helpers } from '../utils/helpers.js';

export class CalendarManager {
    constructor() {
        this.events = StorageManager.get('e-zachetka-calendar-events') || [];
    }

    getAllEvents() {
        return this.events;
    }

    getEventById(id) {
        return this.events.find(event => event.id === id);
    }

    addEvent(title, type, date, time = '', description = '', group = '', createdBy = null) {
        if (!Validator.isNotEmpty(title) || !Validator.isDateValid(date)) {
            Helpers.showAlert('Ошибка', 'Заполните название и дату события!', 'warning');
            return false;
        }

        const event = {
            id: Helpers.generateId(),
            title: title.trim(),
            type: type,
            date: date,
            time: time,
            description: description.trim(),
            group: group,
            created: new Date().toISOString(),
            createdBy: createdBy
        };

        this.events.push(event);
        
        if (this.saveEvents()) {
            Helpers.showAlert('Успех', `Событие "${title}" добавлено в календарь`, 'success');
            return true;
        }
        
        return false;
    }

    deleteEvent(id) {
        const eventIndex = this.events.findIndex(event => event.id === id);
        if (eventIndex === -1) return false;

        this.events.splice(eventIndex, 1);
        return this.saveEvents();
    }

    updateEvent(id, updates) {
        const eventIndex = this.events.findIndex(event => event.id === id);
        if (eventIndex === -1) return false;

        this.events[eventIndex] = { 
            ...this.events[eventIndex], 
            ...updates,
            updatedAt: new Date().toISOString()
        };
        
        return this.saveEvents();
    }

    saveEvents() {
        return StorageManager.set('e-zachetka-calendar-events', this.events);
    }

    getEventsForDate(date) {
        const dateStr = new Date(date).toISOString().split('T')[0];
        return this.events.filter(event => event.date.startsWith(dateStr));
    }

    getUpcomingEvents(days = 7) {
        const today = new Date();
        const futureDate = new Date(today);
        futureDate.setDate(today.getDate() + days);

        return this.events
            .filter(event => {
                const eventDate = new Date(event.date);
                return eventDate >= today && eventDate <= futureDate;
            })
            .sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    getUpcomingDeadlines(days = 7) {
        const today = new Date();
        const futureDate = new Date(today);
        futureDate.setDate(today.getDate() + days);

        return this.events
            .filter(event => event.type === 'deadline')
            .filter(event => {
                const eventDate = new Date(event.date);
                return eventDate >= today && eventDate <= futureDate;
            })
            .sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    getEventAlertClass(type) {
        const classes = {
            'lesson': 'alert-info',
            'deadline': 'alert-danger',
            'exam': 'alert-warning',
            'meeting': 'alert-primary',
            'other': 'alert-secondary'
        };
        return classes[type] || 'alert-secondary';
    }

    getEventBadgeClass(type) {
        const classes = {
            'lesson': 'bg-info',
            'exam': 'bg-warning',
            'meeting': 'bg-primary',
            'deadline': 'bg-danger',
            'other': 'bg-secondary'
        };
        return classes[type] || 'bg-secondary';
    }
}