import { StorageManager } from '../utils/storage.js';
import { Helpers } from '../utils/helpers.js';

export class SettingsManager {
    constructor() {
        this.settings = {
            notifications: StorageManager.get('e-zachetka-notification-settings') || {
                enableDeadlineNotifications: true,
                enableGradeNotifications: true,
                enableDebtNotifications: true,
                deadlineDays: 7
            },
            export: StorageManager.get('e-zachetka-export-settings') || {
                includePersonalData: true,
                includeGrades: true,
                includeStatistics: true,
                dateFormat: 'ru-RU',
                fileFormat: 'xlsx'
            },
            ui: {
                theme: localStorage.getItem('e-zachetka-theme') || 'light',
                density: localStorage.getItem('e-zachetka-ui-density') || 'comfortable',
                language: localStorage.getItem('e-zachetka-language') || 'ru',
                dateFormat: localStorage.getItem('e-zachetka-date-format') || 'ru-RU',
                timeFormat: localStorage.getItem('e-zachetka-time-format') || '24'
            },
            security: {
                autoLogout: localStorage.getItem('e-zachetka-auto-logout') === 'true',
                passwordStrength: localStorage.getItem('e-zachetka-password-strength') || 'medium'
            }
        };
    }

    getAllSettings() {
        return this.settings;
    }

    updateNotificationSettings(newSettings) {
        this.settings.notifications = { ...this.settings.notifications, ...newSettings };
        StorageManager.set('e-zachetka-notification-settings', this.settings.notifications);
        return true;
    }

    updateExportSettings(newSettings) {
        this.settings.export = { ...this.settings.export, ...newSettings };
        StorageManager.set('e-zachetka-export-settings', this.settings.export);
        return true;
    }

    updateUISettings(newSettings) {
        this.settings.ui = { ...this.settings.ui, ...newSettings };
        
        // Сохраняем в localStorage
        Object.keys(newSettings).forEach(key => {
            localStorage.setItem(`e-zachetka-${key}`, newSettings[key]);
        });
        
        // Применяем изменения
        this.applyUISettings();
        return true;
    }

    updateSecuritySettings(newSettings) {
        this.settings.security = { ...this.settings.security, ...newSettings };
        
        Object.keys(newSettings).forEach(key => {
            localStorage.setItem(`e-zachetka-${key}`, newSettings[key].toString());
        });
        
        return true;
    }

    applyUISettings() {
        // Применяем тему
        const html = document.documentElement;
        html.setAttribute('data-bs-theme', this.settings.ui.theme);

        // Применяем язык (будущая функциональность)
        if (this.settings.ui.language !== 'ru') {
            console.log('Language change to:', this.settings.ui.language);
            // Здесь будет логика смены языка
        }

        // Применяем плотность интерфейса
        if (this.settings.ui.density === 'compact') {
            document.body.classList.add('compact-ui');
        } else {
            document.body.classList.remove('compact-ui');
        }
    }

    changeTheme(theme) {
        this.updateUISettings({ theme: theme });
        Helpers.showAlert('Успех', `Тема изменена на ${theme === 'dark' ? 'тёмную' : 'светлую'}`, 'success');
    }

    resetToDefaults() {
        // Сбрасываем все настройки
        const defaultSettings = {
            notifications: {
                enableDeadlineNotifications: true,
                enableGradeNotifications: true,
                enableDebtNotifications: true,
                deadlineDays: 7
            },
            export: {
                includePersonalData: true,
                includeGrades: true,
                includeStatistics: true,
                dateFormat: 'ru-RU',
                fileFormat: 'xlsx'
            },
            ui: {
                theme: 'light',
                density: 'comfortable',
                language: 'ru',
                dateFormat: 'ru-RU',
                timeFormat: '24'
            },
            security: {
                autoLogout: false,
                passwordStrength: 'medium'
            }
        };

        this.settings = defaultSettings;
        
        // Очищаем localStorage от настроек
        const keysToRemove = [
            'e-zachetka-notification-settings',
            'e-zachetka-export-settings',
            'e-zachetka-theme',
            'e-zachetka-ui-density', 
            'e-zachetka-language',
            'e-zachetka-date-format',
            'e-zachetka-time-format',
            'e-zachetka-auto-logout',
            'e-zachetka-password-strength'
        ];

        keysToRemove.forEach(key => localStorage.removeItem(key));

        // Применяем настройки по умолчанию
        this.applyUISettings();
        
        return true;
    }

    exportSettings() {
        const exportData = {
            metadata: {
                exported: new Date().toISOString(),
                version: '2.0.0'
            },
            settings: this.settings
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `settings-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        return true;
    }

    importSettings(settingsFile) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                try {
                    const importedData = JSON.parse(e.target.result);
                    
                    if (!importedData.settings) {
                        reject(new Error('Неверный формат файла настроек'));
                        return;
                    }

                    // Применяем импортированные настройки
                    this.settings = importedData.settings;
                    
                    // Сохраняем в localStorage
                    this.updateNotificationSettings(this.settings.notifications);
                    this.updateExportSettings(this.settings.export);
                    this.updateUISettings(this.settings.ui);
                    this.updateSecuritySettings(this.settings.security);

                    resolve({
                        success: true,
                        message: 'Настройки успешно импортированы'
                    });
                    
                } catch (error) {
                    reject(new Error('Не удалось прочитать файл настроек'));
                }
            }.bind(this);
            
            reader.onerror = () => reject(new Error('Ошибка чтения файла'));
            reader.readAsText(settingsFile);
        });
    }

    getSystemInfo() {
        return {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            cookiesEnabled: navigator.cookieEnabled,
            javaEnabled: navigator.javaEnabled ? navigator.javaEnabled() : false,
            screenResolution: `${screen.width}x${screen.height}`,
            colorDepth: screen.colorDepth,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            localStorageSize: this.calculateLocalStorageSize(),
            performance: {
                memory: performance.memory ? {
                    used: Math.round(performance.memory.usedJSHeapSize / 1048576),
                    total: Math.round(performance.memory.totalJSHeapSize / 1048576)
                } : null,
                timing: performance.timing ? {
                    loadTime: performance.timing.loadEventEnd - performance.timing.navigationStart
                } : null
            }
        };
    }

    calculateLocalStorageSize() {
        let total = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                total += localStorage[key].length;
            }
        }
        return (total / 1024).toFixed(2) + ' KB';
    }
}