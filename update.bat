@echo off
echo 🚀 Обновляем проект в GitHub...
git add .
git commit -m "Авто-обновление: %date% %time%"
git push
echo ✅ Готово! Проект обновлён.
pause