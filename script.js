// Система пользователей и авторизации
let currentUser = null;

// Единое хранилище данных
let appData = {
    students: [],
    subjects: [],
    grades: [],
    users: [
        {
            id: 1,
            username: 'prepod',
            password: '123456',
            name: 'Иванова Мария Петровна',
            role: 'teacher',
            subjects: ['Математика', 'Физика']
        },
        {
            id: 2,
            username: 'admin',
            password: 'admin123',
            name: 'Администратор Системы',
            role: 'admin',
            subjects: []
        }
    ],
    system: {
        lastBackup: null,
        totalLogins: 0,
        created: new Date().toISOString()
    }
};

// Функции авторизации
function login() {
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    const role = document.getElementById('loginRole').value;

    const user = appData.users.find(u => 
        u.username === username && 
        u.password === password && 
        u.role === role
    );

    if (user) {
        currentUser = user;
        appData.system.totalLogins++;
        
        // Показываем основной интерфейс
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('mainApp').style.display = 'block';
        
        // Обновляем информацию о пользователе
        document.getElementById('currentUser').textContent = user.name;
        document.getElementById('currentRole').textContent = 
            user.role === 'admin' ? 'Администратор' : 'Преподаватель';
        
        // Показываем панель админа если нужно
        if (user.role === 'admin') {
            document.getElementById('adminPanel').style.display = 'block';
        }
        
        // Загружаем данные и обновляем интерфейс
        loadData();
        updateSelects();
        displayStudents();
        updateTeacherSelect();
        
        console.log(`Вход выполнен: ${user.name} (${user.role})`);
    } else {
        alert('Неверный логин, пароль или роль!');
    }
}

function logout() {
    currentUser = null;
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('mainApp').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'none';
    
    // Очищаем поля ввода
    document.getElementById('loginPassword').value = '';
}

function updateTeacherSelect() {
    const select = document.getElementById('subjectTeacher');
    select.innerHTML = '<option value="">Выберите преподавателя</option>';
    
    appData.users
        .filter(user => user.role === 'teacher')
        .forEach(teacher => {
            const option = document.createElement('option');
            option.value = teacher.id;
            option.textContent = teacher.name;
            if (currentUser && currentUser.id === teacher.id) {
                option.selected = true;
            }
            select.appendChild(option);
        });
}

// Функции панели администратора
function showUserManagement() {
    const content = document.getElementById('adminContent');
    
    content.innerHTML = `
        <div class="admin-panel">
            <h3>👥 Управление пользователями</h3>
            <button onclick="showAddUserForm()" class="add-user-btn">➕ Добавить пользователя</button>
            
            <div class="user-list">
                ${appData.users.map(user => `
                    <div class="user-item">
                        <div>
                            <strong>${user.name}</strong><br>
                            <small>Логин: ${user.username} | Роль: ${user.role}</small>
                            ${user.subjects.length > 0 ? `<br><small>Предметы: ${user.subjects.join(', ')}</small>` : ''}
                        </div>
                        <div class="user-actions">
                            <button onclick="editUser(${user.id})" class="edit-btn">✏️</button>
                            ${user.id !== currentUser.id ? 
                                `<button onclick="deleteUser(${user.id})" class="delete-btn">🗑️</button>` : 
                                ''
                            }
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function showAddUserForm() {
    const content = document.getElementById('adminContent');
    
    content.innerHTML = `
        <div class="admin-panel">
            <h3>➕ Добавить пользователя</h3>
            <div class="form-group">
                <input type="text" id="newUserName" placeholder="ФИО" class="form-input">
                <input type="text" id="newUserLogin" placeholder="Логин" class="form-input">
                <input type="password" id="newUserPassword" placeholder="Пароль" class="form-input">
            </div>
            <div class="form-group">
                <select id="newUserRole" class="form-select">
                    <option value="teacher">Преподаватель</option>
                    <option value="admin">Администратор</option>
                </select>
                <input type="text" id="newUserSubjects" placeholder="Предметы (через запятую)" class="form-input">
            </div>
            <div class="form-group">
                <button onclick="addNewUser()" class="save-btn">💾 Сохранить</button>
                <button onclick="showUserManagement()" class="cancel-btn">❌ Отмена</button>
            </div>
        </div>
    `;
}

function addNewUser() {
    const name = document.getElementById('newUserName').value;
    const username = document.getElementById('newUserLogin').value;
    const password = document.getElementById('newUserPassword').value;
    const role = document.getElementById('newUserRole').value;
    const subjectsInput = document.getElementById('newUserSubjects').value;
    
    if (!name || !username || !password) {
        alert('Заполните все обязательные поля!');
        return;
    }
    
    // Проверяем, нет ли уже такого логина
    if (appData.users.find(u => u.username === username)) {
        alert('Пользователь с таким логином уже существует!');
        return;
    }
    
    const newUser = {
        id: Date.now(),
        name: name,
        username: username,
        password: password,
        role: role,
        subjects: subjectsInput ? subjectsInput.split(',').map(s => s.trim()) : []
    };
    
    appData.users.push(newUser);
    saveData();
    showUserManagement();
    alert('Пользователь успешно добавлен!');
}

function editUser(userId) {
    const user = appData.users.find(u => u.id === userId);
    if (!user) return;
    
    const content = document.getElementById('adminContent');
    
    content.innerHTML = `
        <div class="admin-panel">
            <h3>✏️ Редактировать пользователя</h3>
            <div class="form-group">
                <input type="text" id="editUserName" value="${user.name}" class="form-input">
                <input type="text" id="editUserLogin" value="${user.username}" class="form-input">
                <input type="password" id="editUserPassword" placeholder="Новый пароль (оставьте пустым чтобы не менять)" class="form-input">
            </div>
            <div class="form-group">
                <select id="editUserRole" class="form-select">
                    <option value="teacher" ${user.role === 'teacher' ? 'selected' : ''}>Преподаватель</option>
                    <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Администратор</option>
                </select>
                <input type="text" id="editUserSubjects" value="${user.subjects.join(', ')}" placeholder="Предметы (через запятую)" class="form-input">
            </div>
            <div class="form-group">
                <button onclick="updateUser(${user.id})" class="save-btn">💾 Сохранить</button>
                <button onclick="showUserManagement()" class="cancel-btn">❌ Отмена</button>
            </div>
        </div>
    `;
}

function updateUser(userId) {
    const user = appData.users.find(u => u.id === userId);
    if (!user) return;
    
    const name = document.getElementById('editUserName').value;
    const username = document.getElementById('editUserLogin').value;
    const password = document.getElementById('editUserPassword').value;
    const role = document.getElementById('editUserRole').value;
    const subjectsInput = document.getElementById('editUserSubjects').value;
    
    if (!name || !username) {
        alert('Заполните обязательные поля!');
        return;
    }
    
    // Проверяем, нет ли другого пользователя с таким логином
    const existingUser = appData.users.find(u => u.username === username && u.id !== userId);
    if (existingUser) {
        alert('Пользователь с таким логином уже существует!');
        return;
    }
    
    // Обновляем данные
    user.name = name;
    user.username = username;
    user.role = role;
    user.subjects = subjectsInput ? subjectsInput.split(',').map(s => s.trim()) : [];
    
    // Обновляем пароль только если введён новый
    if (password) {
        user.password = password;
    }
    
    saveData();
    showUserManagement();
    alert('Пользователь успешно обновлён!');
}

function deleteUser(userId) {
    if (confirm('Вы уверены, что хотите удалить этого пользователя?')) {
        appData.users = appData.users.filter(u => u.id !== userId);
        saveData();
        showUserManagement();
    }
}

function showBackupManagement() {
    const content = document.getElementById('adminContent');
    
    content.innerHTML = `
        <div class="admin-panel">
            <h3>💾 Управление резервными копиями</h3>
            
            <div class="backup-item">
                <h4>Создать резервную копию</h4>
                <p>Создайте полную резервную копию всех данных системы.</p>
                <button onclick="createBackup()" class="backup-btn">📁 Создать бэкап</button>
            </div>
            
            <div class="backup-item">
                <h4>Восстановление данных</h4>
                <p>Восстановите систему из ранее созданной резервной копии.</p>
                <input type="file" id="restoreFile" accept=".json">
                <button onclick="restoreBackup()" class="restore-btn">🔄 Восстановить</button>
            </div>
            
            <div class="backup-item">
                <h4>Информация о системе</h4>
                <div class="system-stats">
                    <div class="system-stat">
                        <div class="stat-number">${appData.system.totalLogins}</div>
                        <div class="stat-label">Всего входов</div>
                    </div>
                    <div class="system-stat">
                        <div class="stat-number">${appData.students.length}</div>
                        <div class="stat-label">Студентов</div>
                    </div>
                    <div class="system-stat">
                        <div class="stat-number">${appData.users.length}</div>
                        <div class="stat-label">Пользователей</div>
                    </div>
                    <div class="system-stat">
                        <div class="stat-number">${appData.grades.length}</div>
                        <div class="stat-label">Оценок</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function showSystemStats() {
    const content = document.getElementById('adminContent');
    
    const stats = calculateStatistics();
    const storageUsage = JSON.stringify(appData).length / 1024; // KB
    
    content.innerHTML = `
        <div class="admin-panel">
            <h3>📈 Системная статистика</h3>
            
            <div class="system-stats">
                <div class="system-stat">
                    <div class="stat-number">${appData.system.totalLogins}</div>
                    <div class="stat-label">Всего входов</div>
                </div>
                <div class="system-stat">
                    <div class="stat-number">${storageUsage.toFixed(1)} KB</div>
                    <div class="stat-label">Использовано памяти</div>
                </div>
                <div class="system-stat">
                    <div class="stat-number">${new Date(appData.system.created).toLocaleDateString()}</div>
                    <div class="stat-label">Система создана</div>
                </div>
            </div>
            
            <h4>Активность пользователей</h4>
            <div class="user-list">
                ${appData.users.map(user => `
                    <div class="user-item">
                        <div>
                            <strong>${user.name}</strong><br>
                            <small>Роль: ${user.role} | Логин: ${user.username}</small>
                        </div>
                        <div class="user-actions">
                            <span class="role-badge">${user.subjects.length} предметов</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function createBackup() {
    const backupData = {
        ...appData,
        system: {
            ...appData.system,
            lastBackup: new Date().toISOString()
        }
    };
    
    const dataStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `e-zachetka-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    alert('Резервная копия создана успешно!');
}

function restoreBackup() {
    const fileInput = document.getElementById('restoreFile');
    const file = fileInput.files[0];
    
    if (!file) {
        alert('Выберите файл для восстановления!');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const backupData = JSON.parse(e.target.result);
            
            if (confirm('Восстановить данные из резервной копии? Текущие данные будут заменены.')) {
                appData = backupData;
                saveData();
                location.reload(); // Перезагружаем страницу для применения изменений
            }
        } catch (error) {
            alert('Ошибка при чтении файла резервной копии!');
        }
    };
    reader.readAsText(file);
}

// Основные функции приложения
function migrateOldData(savedData) {
    if (savedData.students && !savedData.users) {
        return {
            ...savedData,
            users: [
                {
                    id: 1,
                    username: 'prepod',
                    password: '123456',
                    name: 'Иванова Мария Петровна',
                    role: 'teacher',
                    subjects: ['Математика', 'Физика']
                },
                {
                    id: 2,
                    username: 'admin',
                    password: 'admin123',
                    name: 'Администратор Системы',
                    role: 'admin',
                    subjects: []
                }
            ],
            system: {
                lastBackup: null,
                totalLogins: 0,
                created: new Date().toISOString()
            }
        };
    }
    return savedData;
}

function loadData() {
    const saved = localStorage.getItem('e-zachetka-data');
    if (saved) {
        const savedData = JSON.parse(saved);
        const migratedData = migrateOldData(savedData);
        
        appData = migratedData;
        
        updateSelects();
        displayStudents();
        updateTeacherSelect();
    }
}

function saveData() {
    localStorage.setItem('e-zachetka-data', JSON.stringify(appData));
    alert('Данные сохранены!');
}

function exportData() {
    const dataStr = JSON.stringify(appData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'e-zachetka-export.json';
    a.click();
    
    URL.revokeObjectURL(url);
}

// Функции для работы со студентами и предметами
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

function addSubject() {
    const name = document.getElementById('subjectName').value.trim();
    const teacherId = parseInt(document.getElementById('subjectTeacher').value);
    
    if (!name) {
        alert('Введите название предмета!');
        return;
    }
    
    const teacher = appData.users.find(u => u.id === teacherId);
    
    const subject = {
        id: Date.now(),
        name: name,
        teacherId: teacherId,
        teacherName: teacher ? teacher.name : 'Не назначен'
    };
    
    appData.subjects.push(subject);
    updateSelects();
    clearInputs(['subjectName']);
    
    if (teacher && !teacher.subjects.includes(name)) {
        teacher.subjects.push(name);
        saveData();
    }
}

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
        date: new Date().toLocaleDateString(),
        teacherId: currentUser ? currentUser.id : null
    };
    
    appData.grades.push(grade);
    displayStudents();
}

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
        option.textContent = `${subject.name} (${subject.teacherName})`;
        subjectSelect.appendChild(option);
    });
}

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

function getGradeClass(grade) {
    if (grade === '5') return 'grade-excellent';
    if (grade === '4') return 'grade-good';
    if (grade === '3') return 'grade-satisfactory';
    if (grade === '2') return 'grade-unsatisfactory';
    if (grade === 'зачёт') return 'grade-excellent';
    if (grade === 'незачёт') return 'grade-unsatisfactory';
    return '';
}

function deleteStudent(studentId) {
    if (confirm('Удалить студента и все его оценки?')) {
        appData.students = appData.students.filter(s => s.id !== studentId);
        appData.grades = appData.grades.filter(g => g.studentId !== studentId);
        updateSelects();
        displayStudents();
        saveData();
    }
}

function deleteGrade(gradeId) {
    appData.grades = appData.grades.filter(g => g.id !== gradeId);
    displayStudents();
    saveData();
}

function clearInputs(ids) {
    ids.forEach(id => {
        document.getElementById(id).value = '';
    });
}

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
        
        const numericGrade = parseInt(grade.grade);
        if (!isNaN(numericGrade)) {
            totalNumericGrades++;
            sumNumericGrades += numericGrade;
        }
    });
    
    const averageGrade = totalNumericGrades > 0 ? (sumNumericGrades / totalNumericGrades).toFixed(2) : '0.00';
    
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
        <p><strong>Преподаватель:</strong> ${currentUser ? currentUser.name : 'Не авторизован'}</p>
        
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

// Инициализация при загрузке страницы
window.onload = function() {
    updateTeacherSelect();
    
    // Автоматически заполняем тестовые данные для демонстрации
    document.getElementById('loginUsername').value = 'prepod';
    document.getElementById('loginPassword').value = '123456';
};

// Мобильные функции
function toggleMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
}

function scrollToSection(section) {
    const sections = {
        'students': 'section:nth-child(4)',
        'subjects': 'section:nth-child(3)',
        'grades': 'section:nth-child(5)',
        'stats': 'section:nth-child(6)'
    };
    
    const element = document.querySelector(sections[section]);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        toggleMobileMenu(); // Закрываем меню после выбора
    }
}

// Определяем мобильное устройство
function isMobileDevice() {
    return window.innerWidth <= 768;
}

// Адаптируем интерфейс при загрузке и изменении размера
function adaptInterface() {
    if (isMobileDevice()) {
        document.body.classList.add('mobile');
        console.log('Мобильный интерфейс активирован');
    } else {
        document.body.classList.remove('mobile');
    }
}

// Слушаем изменение размера окна
window.addEventListener('resize', adaptInterface);

// Добавляем в конец window.onload
window.onload = function() {
    updateTeacherSelect();
    
    // Автоматически заполняем тестовые данные для демонстрации
    document.getElementById('loginUsername').value = 'prepod';
    document.getElementById('loginPassword').value = '123456';
    
    // Адаптируем интерфейс
    adaptInterface();
};