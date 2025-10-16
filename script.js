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