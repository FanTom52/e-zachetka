// Хранилище данных
let appData = {
    students: [],
    subjects: [],
    grades: []
};

// Загрузка при старте
window.onload = function() {
    loadData();
    updateSelects();
    displayStudents();
};

// Добавление студента
function addStudent() {
    const name = document.getElementById('studentName').value.trim();
    const group = document.getElementById('studentGroup').value.trim();
    
    if (!name || !group) {
        alert('Заполните все поля!');
        return;
    }
    
    const student = {
        id: Date.now(),
        name: name,
        group: group
    };
    
    appData.students.push(student);
    updateSelects();
    displayStudents();
    clearInputs(['studentName', 'studentGroup']);
}

// Добавление предмета
function addSubject() {
    const name = document.getElementById('subjectName').value.trim();
    
    if (!name) {
        alert('Введите название предмета!');
        return;
    }
    
    const subject = {
        id: Date.now(),
        name: name
    };
    
    appData.subjects.push(subject);
    updateSelects();
    clearInputs(['subjectName']);
}

// Выставление оценки
function addGrade() {
    const studentId = parseInt(document.getElementById('studentSelect').value);
    const subjectId = parseInt(document.getElementById('subjectSelect').value);
    const gradeValue = document.getElementById('gradeSelect').value;
    
    if (!studentId || !subjectId) {
        alert('Выберите студента и предмет!');
        return;
    }
    
    const grade = {
        id: Date.now(),
        studentId: studentId,
        subjectId: subjectId,
        grade: gradeValue,
        date: new Date().toLocaleDateString()
    };
    
    appData.grades.push(grade);
    displayStudents();
}

// Обновление выпадающих списков
function updateSelects() {
    const studentSelect = document.getElementById('studentSelect');
    const subjectSelect = document.getElementById('subjectSelect');
    
    studentSelect.innerHTML = '<option value="">Выберите студента</option>';
    subjectSelect.innerHTML = '<option value="">Выберите предмет</option>';
    
    appData.students.forEach(student => {
        const option = document.createElement('option');
        option.value = student.id;
        option.textContent = `${student.name} (${student.group})`;
        studentSelect.appendChild(option);
    });
    
    appData.subjects.forEach(subject => {
        const option = document.createElement('option');
        option.value = subject.id;
        option.textContent = subject.name;
        subjectSelect.appendChild(option);
    });
}

// Отображение студентов и оценок
function displayStudents() {
    const container = document.getElementById('studentsList');
    container.innerHTML = '';
    
    if (appData.students.length === 0) {
        container.innerHTML = '<p>Студенты не добавлены</p>';
        return;
    }
    
    appData.students.forEach(student => {
        const studentCard = document.createElement('div');
        studentCard.className = 'student-card';
        
        const studentGrades = appData.grades.filter(grade => grade.studentId === student.id);
        
        studentCard.innerHTML = `
            <div class="student-header">
                <span class="student-name">${student.name}</span>
                <span class="student-group">${student.group}</span>
                <button class="delete-btn" onclick="deleteStudent(${student.id})">🗑️</button>
            </div>
            <div class="grades-list">
                ${studentGrades.map(grade => {
                    const subject = appData.subjects.find(s => s.id === grade.subjectId);
                    const gradeClass = getGradeClass(grade.grade);
                    return `
                        <div class="grade-item ${gradeClass}">
                            <span>${subject ? subject.name : 'Неизвестный предмет'}</span>
                            <span>
                                <strong>${grade.grade}</strong>
                                <button class="delete-btn" onclick="deleteGrade(${grade.id})">×</button>
                            </span>
                        </div>
                    `;
                }).join('')}
                ${studentGrades.length === 0 ? '<p>Оценок нет</p>' : ''}
            </div>
        `;
        
        container.appendChild(studentCard);
    });
}

// Получение класса для стилизации оценки
function getGradeClass(grade) {
    if (grade === '5') return 'grade-excellent';
    if (grade === '4') return 'grade-good';
    if (grade === '3') return 'grade-satisfactory';
    if (grade === '2') return 'grade-unsatisfactory';
    if (grade === 'зачёт') return 'grade-excellent';
    if (grade === 'незачёт') return 'grade-unsatisfactory';
    return '';
}

// Удаление студента
function deleteStudent(studentId) {
    if (confirm('Удалить студента и все его оценки?')) {
        appData.students = appData.students.filter(s => s.id !== studentId);
        appData.grades = appData.grades.filter(g => g.studentId !== studentId);
        updateSelects();
        displayStudents();
    }
}

// Удаление оценки
function deleteGrade(gradeId) {
    appData.grades = appData.grades.filter(g => g.id !== gradeId);
    displayStudents();
}

// Очистка полей ввода
function clearInputs(ids) {
    ids.forEach(id => {
        document.getElementById(id).value = '';
    });
}

// Сохранение данных
function saveData() {
    localStorage.setItem('e-zachetka-data', JSON.stringify(appData));
    alert('Данные сохранены!');
}

// Загрузка данных
function loadData() {
    const saved = localStorage.getItem('e-zachetka-data');
    if (saved) {
        appData = JSON.parse(saved);
        updateSelects();
        displayStudents();
        alert('Данные загружены!');
    }
}

// Экспорт данных
function exportData() {
    const dataStr = JSON.stringify(appData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'e-zachetka-backup.json';
    a.click();
    
    URL.revokeObjectURL(url);
}

// Импорт данных
document.getElementById('fileInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            appData = importedData;
            updateSelects();
            displayStudents();
            alert('Данные импортированы!');
        } catch (error) {
            alert('Ошибка при чтении файла!');
        }
    };
    reader.readAsText(file);
});

// Функции для статистики и отчётов
function showStatistics() {
    const container = document.getElementById('statisticsContainer');
    
    const stats = calculateStatistics();
    
    container.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-number">${stats.totalStudents}</div>
                <div class="stat-label">Всего студентов</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${stats.totalSubjects}</div>
                <div class="stat-label">Предметов</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${stats.totalGrades}</div>
                <div class="stat-label">Всего оценок</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${stats.averageGrade}</div>
                <div class="stat-label">Средний балл</div>
            </div>
        </div>
        
        <div class="chart-container">
            <h3>Распределение оценок</h3>
            ${renderGradeChart(stats.gradeDistribution)}
        </div>
        
        <div class="chart-container">
            <h3>Успеваемость по группам</h3>
            ${renderGroupStats(stats.groupStats)}
        </div>
    `;
}

function calculateStatistics() {
    const totalStudents = appData.students.length;
    const totalSubjects = appData.subjects.length;
    const totalGrades = appData.grades.length;
    
    // Распределение оценок
    const gradeDistribution = {
        '5': 0, '4': 0, '3': 0, '2': 0,
        'зачёт': 0, 'незачёт': 0
    };
    
    let totalNumericGrades = 0;
    let sumNumericGrades = 0;
    
    appData.grades.forEach(grade => {
        if (gradeDistribution.hasOwnProperty(grade.grade)) {
            gradeDistribution[grade.grade]++;
        }
        
        // Считаем средний балл только для числовых оценок
        const numericGrade = parseInt(grade.grade);
        if (!isNaN(numericGrade)) {
            totalNumericGrades++;
            sumNumericGrades += numericGrade;
        }
    });
    
    const averageGrade = totalNumericGrades > 0 ? (sumNumericGrades / totalNumericGrades).toFixed(2) : '0.00';
    
    // Статистика по группам
    const groupStats = {};
    appData.students.forEach(student => {
        if (!groupStats[student.group]) {
            groupStats[student.group] = {
                studentCount: 0,
                gradeCount: 0,
                totalScore: 0
            };
        }
        groupStats[student.group].studentCount++;
        
        // Считаем оценки для группы
        const groupGrades = appData.grades.filter(g => g.studentId === student.id);
        groupStats[student.group].gradeCount += groupGrades.length;
        
        groupGrades.forEach(grade => {
            const numericGrade = parseInt(grade.grade);
            if (!isNaN(numericGrade)) {
                groupStats[student.group].totalScore += numericGrade;
            }
        });
    });
    
    return {
        totalStudents,
        totalSubjects,
        totalGrades,
        averageGrade,
        gradeDistribution,
        groupStats
    };
}

function renderGradeChart(distribution) {
    let html = '<div class="stats-grid">';
    
    Object.entries(distribution).forEach(([grade, count]) => {
        if (count > 0) {
            const total = Object.values(distribution).reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
            
            let gradeLabel = grade;
            if (grade === '5') gradeLabel = '5 (Отл)';
            else if (grade === '4') gradeLabel = '4 (Хор)';
            else if (grade === '3') gradeLabel = '3 (Удов)';
            else if (grade === '2') gradeLabel = '2 (Неуд)';
            
            html += `
                <div class="stat-card">
                    <div class="stat-number">${count}</div>
                    <div class="stat-label">${gradeLabel}</div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${percentage}%"></div>
                    </div>
                    <small>${percentage}%</small>
                </div>
            `;
        }
    });
    
    html += '</div>';
    return html;
}

function renderGroupStats(groupStats) {
    let html = '<div class="stats-grid">';
    
    Object.entries(groupStats).forEach(([group, stats]) => {
        const avgScore = stats.gradeCount > 0 ? (stats.totalScore / stats.gradeCount).toFixed(2) : 0;
        
        html += `
            <div class="stat-card">
                <div class="stat-number">${stats.studentCount}</div>
                <div class="stat-label">${group}</div>
                <div>Оценок: ${stats.gradeCount}</div>
                <div>Средний: ${avgScore}</div>
            </div>
        `;
    });
    
    html += '</div>';
    return html;
}

function generateReport() {
    const stats = calculateStatistics();
    
    const reportContent = `
        <h3>📊 Общий отчёт по успеваемости</h3>
        <p><strong>Дата формирования:</strong> ${new Date().toLocaleDateString()}</p>
        
        <table class="report-table">
            <tr><th>Показатель</th><th>Значение</th></tr>
            <tr><td>Всего студентов</td><td>${stats.totalStudents}</td></tr>
            <tr><td>Всего предметов</td><td>${stats.totalSubjects}</td></tr>
            <tr><td>Всего оценок</td><td>${stats.totalGrades}</td></tr>
            <tr><td>Средний балл</td><td>${stats.averageGrade}</td></tr>
        </table>
        
        <h4>Распределение оценок</h4>
        <table class="report-table">
            <tr><th>Оценка</th><th>Количество</th><th>Процент</th></tr>
            ${Object.entries(stats.gradeDistribution)
                .filter(([_, count]) => count > 0)
                .map(([grade, count]) => {
                    const total = Object.values(stats.gradeDistribution).reduce((a, b) => a + b, 0);
                    const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
                    return `<tr><td>${grade}</td><td>${count}</td><td>${percentage}%</td></tr>`;
                }).join('')}
        </table>
        
        <h4>Список студентов</h4>
        <table class="report-table">
            <tr><th>ФИО</th><th>Группа</th><th>Количество оценок</th><th>Средний балл</th></tr>
            ${appData.students.map(student => {
                const studentGrades = appData.grades.filter(g => g.studentId === student.id);
                const numericGrades = studentGrades
                    .map(g => parseInt(g.grade))
                    .filter(g => !isNaN(g));
                const avgScore = numericGrades.length > 0 ? 
                    (numericGrades.reduce((a, b) => a + b, 0) / numericGrades.length).toFixed(2) : 'нет';
                
                return `<tr>
                    <td>${student.name}</td>
                    <td>${student.group}</td>
                    <td>${studentGrades.length}</td>
                    <td>${avgScore}</td>
                </tr>`;
            }).join('')}
        </table>
    `;
    
    document.getElementById('reportContent').innerHTML = reportContent;
    document.getElementById('reportModal').style.display = 'block';
}

function showStudentProgress() {
    let html = '<h3>👨‍🎓 Успеваемость по студентам</h3>';
    
    appData.students.forEach(student => {
        const studentGrades = appData.grades.filter(g => g.studentId === student.id);
        const numericGrades = studentGrades
            .map(g => parseInt(g.grade))
            .filter(g => !isNaN(g));
        const avgScore = numericGrades.length > 0 ? 
            (numericGrades.reduce((a, b) => a + b, 0) / numericGrades.length).toFixed(2) : 'нет оценок';
        
        const excellentCount = studentGrades.filter(g => g.grade === '5' || g.grade === 'зачёт').length;
        const goodCount = studentGrades.filter(g => g.grade === '4').length;
        const satisfactoryCount = studentGrades.filter(g => g.grade === '3').length;
        const unsatisfactoryCount = studentGrades.filter(g => g.grade === '2' || g.grade === 'незачёт').length;
        
        html += `
            <div class="student-card">
                <div class="student-header">
                    <span class="student-name">${student.name}</span>
                    <span class="student-group">${student.group}</span>
                    <span class="stat-number">${avgScore}</span>
                </div>
                <div class="stats-grid" style="grid-template-columns: repeat(4, 1fr); margin: 10px 0;">
                    <div class="stat-card" style="border-left-color: #28a745;">
                        <div class="stat-number">${excellentCount}</div>
                        <div class="stat-label">Отлично</div>
                    </div>
                    <div class="stat-card" style="border-left-color: #17a2b8;">
                        <div class="stat-number">${goodCount}</div>
                        <div class="stat-label">Хорошо</div>
                    </div>
                    <div class="stat-card" style="border-left-color: #ffc107;">
                        <div class="stat-number">${satisfactoryCount}</div>
                        <div class="stat-label">Удовл.</div>
                    </div>
                    <div class="stat-card" style="border-left-color: #dc3545;">
                        <div class="stat-number">${unsatisfactoryCount}</div>
                        <div class="stat-label">Неудовл.</div>
                    </div>
                </div>
            </div>
        `;
    });
    
    document.getElementById('statisticsContainer').innerHTML = html;
}

function closeModal() {
    document.getElementById('reportModal').style.display = 'none';
}

function printReport() {
    const reportContent = document.getElementById('reportContent').innerHTML;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
            <head>
                <title>Отчёт по успеваемости</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    table { width: 100%; border-collapse: collapse; margin: 10px 0; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; }
                    h3, h4 { color: #333; }
                </style>
            </head>
            <body>
                <h2>📊 Отчёт по успеваемости</h2>
                <p><strong>Техникум информационных технологий</strong></p>
                ${reportContent}
            </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}