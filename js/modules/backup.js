import { StorageManager } from '../utils/storage.js';
import { Helpers } from '../utils/helpers.js';

export class BackupManager {
    constructor() {
        this.history = StorageManager.get('e-zachetka-backup-history') || [];
    }

    createBackup(comment = 'Резервная копия', includeData = {
        students: true,
        subjects: true, 
        grades: true,
        users: true,
        settings: true
    }, createdBy = null) {
        
        const appData = StorageManager.getAppData();
        const backupData = {
            metadata: {
                version: '2.0.0',
                created: new Date().toISOString(),
                createdBy: createdBy || 'Неизвестный пользователь',
                comment: comment,
                included: includeData
            },
            data: {
                students: includeData.students ? appData.students : [],
                subjects: includeData.subjects ? appData.subjects : [],
                grades: includeData.grades ? appData.grades : [],
                users: includeData.users ? appData.users : [],
                system: includeData.settings ? appData.system : {}
            }
        };

        // Обновляем время последнего бэкапа
        if (includeData.settings) {
            appData.system.lastBackup = new Date().toISOString();
            StorageManager.saveAppData(appData);
        }

        const dataStr = JSON.stringify(backupData, null, 2);
        this.addToHistory(comment, dataStr.length, createdBy);

        return {
            data: backupData,
            string: dataStr,
            size: dataStr.length
        };
    }

    addToHistory(comment, size, createdBy) {
        this.history.unshift({
            id: Helpers.generateId(),
            timestamp: new Date().toISOString(),
            comment: comment,
            size: size,
            createdBy: createdBy || 'Неизвестный пользователь'
        });

        // Храним только последние 10 записей
        if (this.history.length > 10) {
            this.history.pop();
        }

        StorageManager.set('e-zachetka-backup-history', this.history);
    }

    getBackupHistory() {
        return this.history;
    }

    downloadBackup(backupData, filename) {
        const blob = new Blob([backupData.string], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        return true;
    }

    restoreBackup(backupFile) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                try {
                    const backupData = JSON.parse(e.target.result);
                    
                    if (!backupData.metadata || !backupData.data) {
                        reject(new Error('Неверный формат файла резервной копии'));
                        return;
                    }

                    // Восстанавливаем данные
                    const restoredData = {
                        ...backupData.data,
                        system: {
                            ...backupData.data.system,
                            lastBackup: new Date().toISOString()
                        }
                    };

                    if (StorageManager.saveAppData(restoredData)) {
                        resolve({
                            success: true,
                            message: 'Данные успешно восстановлены',
                            metadata: backupData.metadata
                        });
                    } else {
                        reject(new Error('Ошибка при сохранении восстановленных данных'));
                    }
                    
                } catch (error) {
                    reject(new Error('Не удалось прочитать файл резервной копии'));
                }
            };
            
            reader.onerror = () => reject(new Error('Ошибка чтения файла'));
            reader.readAsText(backupFile);
        });
    }

    getSystemStatistics() {
        const appData = StorageManager.getAppData();
        const storageUsage = JSON.stringify(appData).length / 1024; // KB
        
        return {
            storageUsage: storageUsage.toFixed(1),
            totalStudents: appData.students.length,
            totalSubjects: appData.subjects.length,
            totalGrades: appData.grades.length,
            totalUsers: appData.users.length,
            lastBackup: appData.system.lastBackup,
            totalBackups: this.history.length,
            systemVersion: '2.0.0'
        };
    }

    exportSystemLogs() {
        const stats = this.getSystemStatistics();
        const logs = {
            metadata: {
                exported: new Date().toISOString(),
                systemVersion: stats.systemVersion
            },
            statistics: stats,
            backupHistory: this.history,
            system: StorageManager.getAppData().system
        };
        
        const dataStr = JSON.stringify(logs, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `system-logs-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        return true;
    }
}