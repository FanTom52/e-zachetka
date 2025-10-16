// deploy.js - автоматическая отправка в GitHub
const { exec } = require('child_process');
const fs = require('fs');

console.log('🚀 Начинаем деплой в GitHub...');

// Проверяем, есть ли изменения
exec('git status --porcelain', (error, stdout) => {
    if (error) {
        console.error('❌ Ошибка:', error);
        return;
    }

    if (stdout) {
        console.log('📁 Обнаружены изменения:');
        console.log(stdout);
        
        // Добавляем все файлы
        exec('git add .', (addError) => {
            if (addError) {
                console.error('❌ Ошибка при добавлении файлов:', addError);
                return;
            }
            
            console.log('✅ Файлы добавлены');
            
            // Создаём коммит
            const commitMessage = `Авто-обновление: ${new Date().toLocaleString()}`;
            exec(`git commit -m "${commitMessage}"`, (commitError) => {
                if (commitError) {
                    console.error('❌ Ошибка при коммите:', commitError);
                    return;
                }
                
                console.log('✅ Коммит создан');
                
                // Отправляем в GitHub
                exec('git push origin main', (pushError) => {
                    if (pushError) {
                        console.error('❌ Ошибка при отправке:', pushError);
                        return;
                    }
                    
                    console.log('🎉 Успешно отправлено в GitHub!');
                });
            });
        });
    } else {
        console.log('ℹ️ Изменений нет, ничего не отправляем');
    }
});