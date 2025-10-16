// Электронная зачётка - Полная версия с Bootstrap
// ==============================================

// Глобальные переменные
let currentUser = null;
let currentTab = 'dashboard';

// Основные данные приложения
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

// Система уведомлений
let notifications = [];
let calendarEvents = [];

// Настройки
let notificationSettings = {
    enableDeadlineNotifications: true,
    enableGradeNotifications: true,
    enableDebtNotifications: true,
    deadlineDays: 7
};

let exportSettings = {
    includePersonalData: true,
    includeGrades: true,
    includeStatistics: true,
    dateFormat: 'ru-RU',
    fileFormat: 'xlsx'
};

// ==============================================
// СИСТЕМА АВТОРИЗАЦИИ
// ==============================================

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
        
        // Обновляем навигацию
        document.getElementById('currentUserNav').textContent = user.name;
        document.getElementById('currentRoleNav').textContent = user.role === 'admin' ? 'Админ' : 'Преподаватель';
        document.getElementById('currentUserEmail').textContent = user.username;
        
        // Показываем админ-меню если нужно
        if (user.role === 'admin') {
            document.getElementById('adminNavItem').style.display = 'block';
        }
        
        // Загружаем данные и показываем дашборд
        loadData();
        showTab('dashboard');
        
        addNotification('success', 'Вход выполнен', `Добро пожаловать, ${user.name}!`);
    } else {
        showAlert('Ошибка входа', 'Неверный логин, пароль или роль!', 'danger');
    }
}

function logout() {
    if (confirm('Вы уверены, что хотите выйти?')) {
        currentUser = null;
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('mainApp').style.display = 'none';
        document.getElementById('adminNavItem').style.display = 'none';
        
        // Очищаем поля ввода
        document.getElementById('loginPassword').value = '';
    }
}

// ==============================================
// СИСТЕМА ВКЛАДОК
// ==============================================

function showTab(tabName) {
    // Скрываем все вкладки
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.style.display = 'none';
    });
    
    // Убираем активный класс со всех ссылок
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Показываем выбранную вкладку
    const targetTab = document.getElementById(tabName + 'Tab');
    if (targetTab) {
        targetTab.style.display = 'block';
    }
    
    // Добавляем активный класс к соответствующей ссылке
    const activeLink = document.querySelector(`[onclick="showTab('${tabName}')"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
    
    currentTab = tabName;
    
    // Загружаем контент вкладки если нужно
    loadTabContent(tabName);
}

function loadTabContent(tabName) {
    switch(tabName) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'students':
            loadStudentsTab();
            break;
        case 'subjects':
            loadSubjectsTab();
            break;
        case 'grades':
            loadGradesTab();
            break;
        case 'calendar':
            loadCalendarTab();
            break;
        case 'reports':
            loadReportsTab();
            break;
        case 'notifications':
            loadNotificationsTab();
            break;
        case 'users':
            if (currentUser?.role === 'admin') {
                loadUsersTab();
            }
            break;
        case 'backup':
            if (currentUser?.role === 'admin') {
                loadBackupTab();
            }
            break;
        case 'settings':
            loadSettingsTab();
            break;
    }
}

// ==============================================
// ДАШБОРД
// ==============================================

function loadDashboard() {
    // Обновляем статистику
    const stats = calculateStatistics();
    
    document.getElementById('statStudents').textContent = stats.totalStudents;
    document.getElementById('statSubjects').textContent = stats.totalSubjects;
    document.getElementById('statGrades').textContent = stats.totalGrades;
    document.getElementById('statAverage').textContent = stats.averageGrade;
    
    // Обновляем дату
    document.getElementById('currentDate').textContent = new Date().toLocaleDateString('ru-RU', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    // Загружаем последние уведомления
    loadRecentNotifications();
    
    // Загружаем ближайшие события
    loadUpcomingEvents();
}

function loadRecentNotifications() {
    const container = document.getElementById('recentNotifications');
    const recentNotifications = notifications.slice(0, 3);
    
    if (recentNotifications.length === 0) {
        container.innerHTML = '<p class="text-muted text-center">Уведомлений нет</p>';
        return;
    }
    
    container.innerHTML = recentNotifications.map(notification => `
        <div class="notification-item ${notification.type} mb-2">
            <div class="d-flex justify-content-between align-items-start">
                <div class="flex-grow-1">
                    <h6 class="mb-1">${notification.title}</h6>
                    <p class="mb-0 small text-muted">${notification.message}</p>
                </div>
                <small class="text-muted ms-2">${new Date(notification.date).toLocaleDateString()}</small>
            </div>
        </div>
    `).join('');
}

function loadUpcomingEvents() {
    const container = document.getElementById('upcomingEvents');
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    
    const upcomingEvents = calendarEvents
        .filter(event => {
            const eventDate = new Date(event.date);
            return eventDate >= today && eventDate <= nextWeek;
        })
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 5);
    
    if (upcomingEvents.length === 0) {
        container.innerHTML = '<p class="text-muted text-center">Событий на ближайшую неделю нет</p>';
        return;
    }
    
    container.innerHTML = upcomingEvents.map(event => `
        <div class="d-flex justify-content-between align-items-center border-bottom pb-2 mb-2">
            <div>
                <h6 class="mb-1">${event.title}</h6>
                <small class="text-muted">${event.subjectName || ''} ${event.group ? `• ${event.group}` : ''}</small>
            </div>
            <div class="text-end">
                <div class="fw-bold">${new Date(event.date).toLocaleDateString()}</div>
                <small class="text-muted">${event.time || 'Весь день'}</small>
            </div>
        </div>
    `).join('');
}

// ==============================================
// СТУДЕНТЫ
// ==============================================

function loadStudentsTab() {
    const container = document.getElementById('studentsTab');
    
    container.innerHTML = `
        <div class="row">
            <div class="col-12">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h2 class="h3 mb-0">
                        <i class="bi bi-people me-2 text-primary"></i>Управление студентами
                    </h2>
                    <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addStudentModal">
                        <i class="bi bi-person-plus me-1"></i>Добавить студента
                    </button>
                </div>
            </div>
        </div>
        
        <div class="row">
            <div class="col-12">
                <div class="card shadow">
                    <div class="card-body">
                        <div class="table-responsive">
                            <div id="studentsListContainer"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Модальное окно добавления студента -->
        <div class="modal fade" id="addStudentModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Добавить студента</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="addStudentForm">
                            <div class="mb-3">
                                <label for="studentName" class="form-label">ФИО студента</label>
                                <input type="text" class="form-control" id="studentName" required>
                            </div>
                            <div class="mb-3">
                                <label for="studentGroup" class="form-label">Группа</label>
                                <input type="text" class="form-control" id="studentGroup" required>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Отмена</button>
                        <button type="button" class="btn btn-primary" onclick="addStudent()">Добавить</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    displayStudents();
}

function addStudent() {
    const name = document.getElementById('studentName').value.trim();
    const group = document.getElementById('studentGroup').value.trim();
    
    if (!name || !group) {
        showAlert('Ошибка', 'Заполните все поля!', 'warning');
        return;
    }
    
    const student = {
        id: Date.now(),
        name: name,
        group: group
    };
    
    appData.students.push(student);
    saveData();
    
    // Закрываем модальное окно
    const modal = bootstrap.Modal.getInstance(document.getElementById('addStudentModal'));
    modal.hide();
    
    // Очищаем форму
    document.getElementById('addStudentForm').reset();
    
    // Обновляем список
    displayStudents();
    
    addNotification('success', 'Студент добавлен', `Студент ${name} добавлен в группу ${group}`);
}

function displayStudents() {
    const container = document.getElementById('studentsListContainer');
    
    if (appData.students.length === 0) {
        container.innerHTML = `
            <div class="text-center py-5">
                <i class="bi bi-people display-1 text-muted"></i>
                <h4 class="text-muted mt-3">Студенты не добавлены</h4>
                <p class="text-muted">Добавьте первого студента чтобы начать работу</p>
            </div>
        `;
        return;
    }
    
    let html = `
        <table class="table table-hover">
            <thead>
                <tr>
                    <th>ФИО</th>
                    <th>Группа</th>
                    <th>Количество оценок</th>
                    <th>Средний балл</th>
                    <th>Действия</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    appData.students.forEach(student => {
        const studentGrades = appData.grades.filter(g => g.studentId === student.id);
        const numericGrades = studentGrades
            .map(g => parseInt(g.grade))
            .filter(g => !isNaN(g));
        const avgScore = numericGrades.length > 0 ? 
            (numericGrades.reduce((a, b) => a + b, 0) / numericGrades.length).toFixed(2) : 'нет';
        
        html += `
            <tr>
                <td>
                    <i class="bi bi-person-circle me-2 text-primary"></i>
                    <strong>${student.name}</strong>
                </td>
                <td>
                    <span class="badge bg-secondary">${student.group}</span>
                </td>
                <td>
                    <span class="badge bg-info">${studentGrades.length}</span>
                </td>
                <td>
                    <span class="badge ${avgScore >= 4 ? 'bg-success' : avgScore >= 3 ? 'bg-warning' : 'bg-danger'}">
                        ${avgScore}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="viewStudentDetails(${student.id})">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteStudent(${student.id})">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    html += `
            </tbody>
        </table>
    `;
    
    container.innerHTML = html;
}

function deleteStudent(studentId) {
    if (confirm('Удалить студента и все его оценки?')) {
        appData.students = appData.students.filter(s => s.id !== studentId);
        appData.grades = appData.grades.filter(g => g.studentId !== studentId);
        saveData();
        displayStudents();
        
        addNotification('info', 'Студент удалён', 'Студент и все его оценки удалены из системы');
    }
}

function viewStudentDetails(studentId) {
    const student = appData.students.find(s => s.id === studentId);
    if (!student) return;
    
    const studentGrades = appData.grades.filter(g => g.studentId === studentId);
    
    let html = `
        <div class="modal fade" id="studentDetailsModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="bi bi-person-circle me-2"></i>${student.name}
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row mb-4">
                            <div class="col-md-6">
                                <p><strong>Группа:</strong> <span class="badge bg-primary">${student.group}</span></p>
                            </div>
                            <div class="col-md-6">
                                <p><strong>Всего оценок:</strong> <span class="badge bg-info">${studentGrades.length}</span></p>
                            </div>
                        </div>
                        
                        <h6>Оценки:</h6>
                        <div class="table-responsive">
                            <table class="table table-sm">
                                <thead>
                                    <tr>
                                        <th>Предмет</th>
                                        <th>Оценка</th>
                                        <th>Дата</th>
                                    </tr>
                                </thead>
                                <tbody>
    `;
    
    studentGrades.forEach(grade => {
        const subject = appData.subjects.find(s => s.id === grade.subjectId);
        const gradeClass = getGradeClass(grade.grade);
        
        html += `
            <tr>
                <td>${subject ? subject.name : 'Неизвестный предмет'}</td>
                <td><span class="badge ${gradeClass}">${grade.grade}</span></td>
                <td>${grade.date}</td>
            </tr>
        `;
    });
    
    html += `
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Добавляем модальное окно в DOM и показываем
    document.body.insertAdjacentHTML('beforeend', html);
    const modal = new bootstrap.Modal(document.getElementById('studentDetailsModal'));
    modal.show();
    
    // Удаляем модальное окно после закрытия
    document.getElementById('studentDetailsModal').addEventListener('hidden.bs.modal', function() {
        this.remove();
    });
}

// ==============================================
// ПРЕДМЕТЫ
// ==============================================

function loadSubjectsTab() {
    const container = document.getElementById('subjectsTab');
    
    container.innerHTML = `
        <div class="row">
            <div class="col-12">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h2 class="h3 mb-0">
                        <i class="bi bi-book me-2 text-success"></i>Управление предметами
                    </h2>
                    <button class="btn btn-success" data-bs-toggle="modal" data-bs-target="#addSubjectModal">
                        <i class="bi bi-journal-plus me-1"></i>Добавить предмет
                    </button>
                </div>
            </div>
        </div>
        
        <div class="row">
            <div class="col-12">
                <div class="card shadow">
                    <div class="card-body">
                        <div class="table-responsive">
                            <div id="subjectsListContainer"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Модальное окно добавления предмета -->
        <div class="modal fade" id="addSubjectModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Добавить предмет</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="addSubjectForm">
                            <div class="mb-3">
                                <label for="subjectName" class="form-label">Название предмета</label>
                                <input type="text" class="form-control" id="subjectName" required>
                            </div>
                            <div class="mb-3">
                                <label for="subjectTeacher" class="form-label">Преподаватель</label>
                                <select class="form-select" id="subjectTeacher" required>
                                    <option value="">Выберите преподавателя</option>
                                </select>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Отмена</button>
                        <button type="button" class="btn btn-success" onclick="addSubject()">Добавить</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Заполняем список преподавателей
    updateTeacherSelect();
    displaySubjects();
}

function updateTeacherSelect() {
    const select = document.getElementById('subjectTeacher');
    if (!select) return;
    
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

function addSubject() {
    const name = document.getElementById('subjectName').value.trim();
    const teacherId = parseInt(document.getElementById('subjectTeacher').value);
    
    if (!name || !teacherId) {
        showAlert('Ошибка', 'Заполните все поля!', 'warning');
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
    saveData();
    
    // Закрываем модальное окно
    const modal = bootstrap.Modal.getInstance(document.getElementById('addSubjectModal'));
    modal.hide();
    
    // Очищаем форму
    document.getElementById('addSubjectForm').reset();
    
    // Обновляем список
    displaySubjects();
    
    addNotification('success', 'Предмет добавлен', `Предмет "${name}" добавлен в систему`);
}

function displaySubjects() {
    const container = document.getElementById('subjectsListContainer');
    
    if (appData.subjects.length === 0) {
        container.innerHTML = `
            <div class="text-center py-5">
                <i class="bi bi-book display-1 text-muted"></i>
                <h4 class="text-muted mt-3">Предметы не добавлены</h4>
                <p class="text-muted">Добавьте первый предмет чтобы начать работу</p>
            </div>
        `;
        return;
    }
    
    let html = `
        <table class="table table-hover">
            <thead>
                <tr>
                    <th>Название предмета</th>
                    <th>Преподаватель</th>
                    <th>Количество оценок</th>
                    <th>Действия</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    appData.subjects.forEach(subject => {
        const subjectGrades = appData.grades.filter(g => g.subjectId === subject.id);
        
        html += `
            <tr>
                <td>
                    <i class="bi bi-journal-text me-2 text-success"></i>
                    <strong>${subject.name}</strong>
                </td>
                <td>${subject.teacherName}</td>
                <td>
                    <span class="badge bg-info">${subjectGrades.length}</span>
                </td>
                <td>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteSubject(${subject.id})">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    html += `
            </tbody>
        </table>
    `;
    
    container.innerHTML = html;
}

function deleteSubject(subjectId) {
    if (confirm('Удалить предмет и все связанные оценки?')) {
        appData.subjects = appData.subjects.filter(s => s.id !== subjectId);
        appData.grades = appData.grades.filter(g => g.subjectId !== subjectId);
        saveData();
        displaySubjects();
        
        addNotification('info', 'Предмет удалён', 'Предмет и все связанные оценки удалены из системы');
    }
}

// ==============================================
// ОЦЕНКИ
// ==============================================

function loadGradesTab() {
    const container = document.getElementById('gradesTab');
    
    container.innerHTML = `
        <div class="row">
            <div class="col-12">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h2 class="h3 mb-0">
                        <i class="bi bi-pencil-square me-2 text-info"></i>Выставление оценок
                    </h2>
                </div>
            </div>
        </div>
        
        <div class="row">
            <div class="col-md-6">
                <div class="card shadow">
                    <div class="card-header">
                        <h5 class="card-title mb-0">Выставить оценку</h5>
                    </div>
                    <div class="card-body">
                        <form id="addGradeForm">
                            <div class="mb-3">
                                <label for="gradeStudentSelect" class="form-label">Студент</label>
                                <select class="form-select" id="gradeStudentSelect" required>
                                    <option value="">Выберите студента</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label for="gradeSubjectSelect" class="form-label">Предмет</label>
                                <select class="form-select" id="gradeSubjectSelect" required>
                                    <option value="">Выберите предмет</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label for="gradeSelect" class="form-label">Оценка</label>
                                <select class="form-select" id="gradeSelect" required>
                                    <option value="5">5 (Отлично)</option>
                                    <option value="4">4 (Хорошо)</option>
                                    <option value="3">3 (Удовлетворительно)</option>
                                    <option value="2">2 (Неудовлетворительно)</option>
                                    <option value="зачёт">Зачёт</option>
                                    <option value="незачёт">Незачёт</option>
                                </select>
                            </div>
                            <button type="button" class="btn btn-primary w-100" onclick="addGrade()">
                                <i class="bi bi-check-circle me-1"></i>Выставить оценку
                            </button>
                        </form>
                    </div>
                </div>
            </div>
            
            <div class="col-md-6">
                <div class="card shadow">
                    <div class="card-header">
                        <h5 class="card-title mb-0">Последние оценки</h5>
                    </div>
                    <div class="card-body">
                        <div id="recentGradesContainer"></div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Заполняем выпадающие списки
    updateGradeSelects();
    displayRecentGrades();
}

function updateGradeSelects() {
    const studentSelect = document.getElementById('gradeStudentSelect');
    const subjectSelect = document.getElementById('gradeSubjectSelect');
    
    if (!studentSelect || !subjectSelect) return;
    
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

function addGrade() {
    const studentId = parseInt(document.getElementById('gradeStudentSelect').value);
    const subjectId = parseInt(document.getElementById('gradeSubjectSelect').value);
    const gradeValue = document.getElementById('gradeSelect').value;
    
    if (!studentId || !subjectId) {
        showAlert('Ошибка', 'Выберите студента и предмет!', 'warning');
        return;
    }
    
    const student = appData.students.find(s => s.id === studentId);
    const subject = appData.subjects.find(s => s.id === subjectId);
    
    const grade = {
        id: Date.now(),
        studentId: studentId,
        subjectId: subjectId,
        grade: gradeValue,
        date: new Date().toLocaleDateString('ru-RU'),
        teacherId: currentUser ? currentUser.id : null
    };
    
    appData.grades.push(grade);
    saveData();
    
    // Очищаем форму
    document.getElementById('addGradeForm').reset();
    
    // Обновляем списки
    updateGradeSelects();
    displayRecentGrades();
    
    addNotification('success', 'Оценка выставлена', 
        `Студенту ${student.name} по предмету "${subject.name}" выставлена оценка: ${gradeValue}`);
}

function displayRecentGrades() {
    const container = document.getElementById('recentGradesContainer');
    const recentGrades = appData.grades
        .sort((a, b) => b.id - a.id)
        .slice(0, 10);
    
    if (recentGrades.length === 0) {
        container.innerHTML = '<p class="text-muted text-center">Оценок пока нет</p>';
        return;
    }
    
    let html = '';
    
    recentGrades.forEach(grade => {
        const student = appData.students.find(s => s.id === grade.studentId);
        const subject = appData.subjects.find(s => s.id === grade.subjectId);
        const gradeClass = getGradeClass(grade.grade);
        
        if (student && subject) {
            html += `
                <div class="d-flex justify-content-between align-items-center border-bottom pb-2 mb-2">
                    <div>
                        <h6 class="mb-1">${student.name}</h6>
                        <small class="text-muted">${subject.name}</small>
                    </div>
                    <div class="text-end">
                        <span class="badge ${gradeClass} fs-6">${grade.grade}</span>
                        <div><small class="text-muted">${grade.date}</small></div>
                    </div>
                </div>
            `;
        }
    });
    
    container.innerHTML = html;
}

// ==============================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ==============================================

function getGradeClass(grade) {
    if (grade === '5' || grade === 'зачёт') return 'bg-success';
    if (grade === '4') return 'bg-info';
    if (grade === '3') return 'bg-warning';
    if (grade === '2' || grade === 'незачёт') return 'bg-danger';
    return 'bg-secondary';
}

function showAlert(title, message, type) {
    // Создаём уведомление Bootstrap
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        <strong>${title}</strong> ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    // Добавляем в начало контейнера
    const container = document.querySelector('.container-fluid');
    container.insertBefore(alertDiv, container.firstChild);
    
    // Автоматически скрываем через 5 секунд
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
}

// ==============================================
// СИСТЕМА УВЕДОМЛЕНИЙ
// ==============================================

function addNotification(type, title, message, studentId = null, subjectId = null) {
    const notification = {
        id: Date.now(),
        type: type,
        title: title,
        message: message,
        studentId: studentId,
        subjectId: subjectId,
        date: new Date().toISOString(),
        read: false
    };
    
    notifications.unshift(notification);
    saveNotifications();
    updateNotificationBadge();
}

function saveNotifications() {
    localStorage.setItem('e-zachetka-notifications', JSON.stringify(notifications));
}

function loadNotifications() {
    const saved = localStorage.getItem('e-zachetka-notifications');
    if (saved) {
        notifications = JSON.parse(saved);
        updateNotificationBadge();
    }
}

function updateNotificationBadge() {
    const unreadCount = notifications.filter(n => !n.read).length;
    const badge = document.getElementById('notificationBadgeNav');
    
    if (badge) {
        badge.textContent = unreadCount;
        badge.style.display = unreadCount > 0 ? 'inline-block' : 'none';
    }
}

// ==============================================
// СИСТЕМА КАЛЕНДАРЯ
// ==============================================

function loadCalendarEvents() {
    const saved = localStorage.getItem('e-zachetka-calendar-events');
    if (saved) {
        calendarEvents = JSON.parse(saved);
    }
}

function saveCalendarEvents() {
    localStorage.setItem('e-zachetka-calendar-events', JSON.stringify(calendarEvents));
}

// ==============================================
// СИСТЕМА ДАННЫХ
// ==============================================

function migrateOldData(savedData) {
    if (savedData.students && !savedData.users) {
        return {
            ...savedData,
            users: appData.users,
            system: appData.system
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
        
        // Обновляем интерфейс
        if (currentTab === 'dashboard') {
            loadDashboard();
        }
    }
    
    // Загружаем дополнительные данные
    loadNotifications();
    loadCalendarEvents();
    loadNotificationSettings();
    loadExportSettings();
}

function saveData() {
    localStorage.setItem('e-zachetka-data', JSON.stringify(appData));
}

// ==============================================
// СТАТИСТИКА
// ==============================================

function calculateStatistics() {
    const totalStudents = appData.students.length;
    const totalSubjects = appData.subjects.length;
    const totalGrades = appData.grades.length;
    
    let totalNumericGrades = 0;
    let sumNumericGrades = 0;
    
    appData.grades.forEach(grade => {
        const numericGrade = parseInt(grade.grade);
        if (!isNaN(numericGrade)) {
            totalNumericGrades++;
            sumNumericGrades += numericGrade;
        }
    });
    
    const averageGrade = totalNumericGrades > 0 ? (sumNumericGrades / totalNumericGrades).toFixed(2) : '0.00';
    
    return {
        totalStudents,
        totalSubjects,
        totalGrades,
        averageGrade
    };
}

// ==============================================
// ЗАГРУЗКА НАСТРОЕК
// ==============================================

function loadNotificationSettings() {
    const saved = localStorage.getItem('e-zachetka-notification-settings');
    if (saved) {
        notificationSettings = JSON.parse(saved);
    }
}

function loadExportSettings() {
    const saved = localStorage.getItem('e-zachetka-export-settings');
    if (saved) {
        exportSettings = JSON.parse(saved);
    }
}

// ==============================================
// ЗАГРУЗКА ПРИЛОЖЕНИЯ
// ==============================================

// Временные функции для нереализованных вкладок
function loadCalendarTab() {
    const container = document.getElementById('calendarTab');
    
    container.innerHTML = `
        <div class="row">
            <div class="col-12">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h2 class="h3 mb-0">
                        <i class="bi bi-calendar me-2 text-primary"></i>Календарь занятий
                    </h2>
                    <div>
                        <button class="btn btn-outline-primary me-2" onclick="showTodaySchedule()">
                            <i class="bi bi-calendar-day me-1"></i>Сегодня
                        </button>
                        <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addEventModal">
                            <i class="bi bi-plus-circle me-1"></i>Добавить событие
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div class="row mb-4">
            <div class="col-12">
                <div class="card shadow">
                    <div class="card-header bg-white">
                        <div class="d-flex justify-content-between align-items-center">
                            <h5 class="mb-0" id="calendarTitle">Загрузка...</h5>
                            <div>
                                <button class="btn btn-sm btn-outline-secondary" onclick="previousMonth()">
                                    <i class="bi bi-chevron-left"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-secondary mx-2" onclick="goToToday()">
                                    Сегодня
                                </button>
                                <button class="btn btn-sm btn-outline-secondary" onclick="nextMonth()">
                                    <i class="bi bi-chevron-right"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="card-body">
                        <div id="calendarContainer"></div>
                    </div>
                </div>
            </div>
        </div>

        <div class="row">
            <div class="col-md-6">
                <div class="card shadow">
                    <div class="card-header bg-white">
                        <h5 class="mb-0">
                            <i class="bi bi-clock me-2 text-warning"></i>Ближайшие дедлайны
                        </h5>
                    </div>
                    <div class="card-body">
                        <div id="upcomingDeadlines"></div>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card shadow">
                    <div class="card-header bg-white">
                        <h5 class="mb-0">
                            <i class="bi bi-list-ul me-2 text-info"></i>Ближайшие события
                        </h5>
                    </div>
                    <div class="card-body">
                        <div id="upcomingEventsList"></div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Модальное окно добавления события -->
        <div class="modal fade" id="addEventModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Добавить событие</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="addEventForm">
                            <div class="mb-3">
                                <label for="eventTitle" class="form-label">Название события</label>
                                <input type="text" class="form-control" id="eventTitle" required>
                            </div>
                            <div class="mb-3">
                                <label for="eventType" class="form-label">Тип события</label>
                                <select class="form-select" id="eventType" required>
                                    <option value="lesson">Занятие</option>
                                    <option value="deadline">Дедлайн сдачи</option>
                                    <option value="exam">Экзамен</option>
                                    <option value="meeting">Совещание</option>
                                    <option value="other">Другое</option>
                                </select>
                            </div>
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="eventDate" class="form-label">Дата</label>
                                        <input type="date" class="form-control" id="eventDate" required>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="eventTime" class="form-label">Время (необязательно)</label>
                                        <input type="time" class="form-control" id="eventTime">
                                    </div>
                                </div>
                            </div>
                            <div class="mb-3">
                                <label for="eventDescription" class="form-label">Описание</label>
                                <textarea class="form-control" id="eventDescription" rows="3"></textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Отмена</button>
                        <button type="button" class="btn btn-primary" onclick="addCalendarEvent()">Добавить</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Инициализация календаря
    initCalendar();
    loadUpcomingDeadlines();
    loadUpcomingEventsSidebar();
}

let currentCalendarDate = new Date();

function initCalendar() {
    showCalendar();
    // Устанавливаем сегодняшнюю дату в форму
    document.getElementById('eventDate').valueAsDate = new Date();
}

function showCalendar() {
    const container = document.getElementById('calendarContainer');
    const title = document.getElementById('calendarTitle');
    
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();
    
    const monthNames = [
        'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
        'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ];
    
    title.textContent = `${monthNames[month]} ${year}`;
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDay.getDay();
    const adjustedFirstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    
    let calendarHTML = `
        <div class="calendar-grid">
            <div class="calendar-weekday bg-primary text-white">Пн</div>
            <div class="calendar-weekday bg-primary text-white">Вт</div>
            <div class="calendar-weekday bg-primary text-white">Ср</div>
            <div class="calendar-weekday bg-primary text-white">Чт</div>
            <div class="calendar-weekday bg-primary text-white">Пт</div>
            <div class="calendar-weekday bg-primary text-white">Сб</div>
            <div class="calendar-weekday bg-primary text-white">Вс</div>
    `;
    
    // Пустые ячейки перед первым днем месяца
    for (let i = 0; i < adjustedFirstDayOfWeek; i++) {
        const prevMonthDay = new Date(year, month, -i);
        calendarHTML += `<div class="calendar-day other-month">${prevMonthDay.getDate()}</div>`;
    }
    
    // Дни месяца
    const today = new Date();
    for (let day = 1; day <= lastDay.getDate(); day++) {
        const currentDate = new Date(year, month, day);
        const isToday = currentDate.toDateString() === today.toDateString();
        const dayEvents = getEventsForDate(currentDate);
        const hasEvents = dayEvents.length > 0;
        const hasDeadlines = dayEvents.some(event => event.type === 'deadline');
        
        let dayClass = 'calendar-day';
        if (isToday) dayClass += ' today';
        if (hasEvents) dayClass += ' has-events';
        if (hasDeadlines) dayClass += ' has-deadlines';
        
        calendarHTML += `
            <div class="${dayClass}" onclick="showDayEvents('${currentDate.toISOString()}')">
                <div class="day-number">${day}</div>
                ${hasEvents ? 
                    `<div class="calendar-event-dots">
                        ${hasDeadlines ? '<span class="event-dot deadline-dot"></span>' : ''}
                        <span class="event-dot event-dot-default"></span>
                    </div>` 
                    : ''}
            </div>
        `;
    }
    
    calendarHTML += `</div>`;
    container.innerHTML = calendarHTML;
}

function previousMonth() {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
    showCalendar();
}

function nextMonth() {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
    showCalendar();
}

function goToToday() {
    currentCalendarDate = new Date();
    showCalendar();
}

function getEventsForDate(date) {
    const dateStr = date.toISOString().split('T')[0];
    return calendarEvents.filter(event => event.date.startsWith(dateStr));
}

function showDayEvents(dateString) {
    const date = new Date(dateString);
    const events = getEventsForDate(date);
    
    let eventsHTML = '';
    
    if (events.length === 0) {
        eventsHTML = '<p class="text-muted">На эту дату событий нет</p>';
    } else {
        eventsHTML = events.map(event => `
            <div class="alert ${getEventAlertClass(event.type)} mb-2">
                <div class="d-flex justify-content-between align-items-start">
                    <div>
                        <h6 class="alert-heading mb-1">${event.title}</h6>
                        <p class="mb-1 small">${event.time || 'Весь день'}</p>
                        ${event.description ? `<p class="mb-0 small">${event.description}</p>` : ''}
                    </div>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteCalendarEvent(${event.id})">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    // Показываем модальное окно с событиями дня
    const modalHTML = `
        <div class="modal fade" id="dayEventsModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">События на ${date.toLocaleDateString('ru-RU')}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        ${eventsHTML}
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Закрыть</button>
                        <button type="button" class="btn btn-primary" onclick="showAddEventFormForDate('${dateString}')">
                            Добавить событие
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const modal = new bootstrap.Modal(document.getElementById('dayEventsModal'));
    modal.show();
    
    // Удаляем модальное окно после закрытия
    document.getElementById('dayEventsModal').addEventListener('hidden.bs.modal', function() {
        this.remove();
    });
}

function getEventAlertClass(type) {
    const classes = {
        'lesson': 'alert-info',
        'deadline': 'alert-danger',
        'exam': 'alert-warning',
        'meeting': 'alert-primary',
        'other': 'alert-secondary'
    };
    return classes[type] || 'alert-secondary';
}

function showAddEventFormForDate(dateString) {
    // Закрываем текущее модальное окно
    const currentModal = bootstrap.Modal.getInstance(document.getElementById('dayEventsModal'));
    currentModal.hide();
    
    // Устанавливаем дату и открываем форму добавления
    document.getElementById('eventDate').value = dateString.split('T')[0];
    const modal = new bootstrap.Modal(document.getElementById('addEventModal'));
    modal.show();
}

function addCalendarEvent() {
    const title = document.getElementById('eventTitle').value.trim();
    const type = document.getElementById('eventType').value;
    const date = document.getElementById('eventDate').value;
    const time = document.getElementById('eventTime').value;
    const description = document.getElementById('eventDescription').value.trim();
    
    if (!title || !date) {
        showAlert('Ошибка', 'Заполните название и дату события!', 'warning');
        return;
    }
    
    const event = {
        id: Date.now(),
        title: title,
        type: type,
        date: date,
        time: time,
        description: description,
        created: new Date().toISOString(),
        createdBy: currentUser ? currentUser.id : null
    };
    
    calendarEvents.push(event);
    saveCalendarEvents();
    
    // Закрываем модальное окно
    const modal = bootstrap.Modal.getInstance(document.getElementById('addEventModal'));
    modal.hide();
    
    // Очищаем форму
    document.getElementById('addEventForm').reset();
    document.getElementById('eventDate').valueAsDate = new Date();
    
    // Обновляем интерфейс
    showCalendar();
    loadUpcomingDeadlines();
    loadUpcomingEventsSidebar();
    
    addNotification('success', 'Событие добавлено', `Событие "${title}" добавлено в календарь`);
}

function deleteCalendarEvent(eventId) {
    if (confirm('Удалить это событие?')) {
        calendarEvents = calendarEvents.filter(e => e.id !== eventId);
        saveCalendarEvents();
        
        // Закрываем модальное окно и обновляем календарь
        const modal = bootstrap.Modal.getInstance(document.getElementById('dayEventsModal'));
        modal.hide();
        
        showCalendar();
        loadUpcomingDeadlines();
        loadUpcomingEventsSidebar();
    }
}

function loadUpcomingDeadlines() {
    const container = document.getElementById('upcomingDeadlines');
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    
    const upcomingDeadlines = calendarEvents
        .filter(event => event.type === 'deadline')
        .filter(event => {
            const eventDate = new Date(event.date);
            return eventDate >= today && eventDate <= nextWeek;
        })
        .sort((a, b) => new Date(a.date) - new Date(b.date));
    
    if (upcomingDeadlines.length === 0) {
        container.innerHTML = '<p class="text-muted text-center">Дедлайнов на ближайшую неделю нет</p>';
        return;
    }
    
    container.innerHTML = upcomingDeadlines.map(event => {
        const eventDate = new Date(event.date);
        const daysLeft = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24));
        
        return `
            <div class="border-start border-${daysLeft <= 1 ? 'danger' : daysLeft <= 3 ? 'warning' : 'success'} border-3 ps-3 mb-3">
                <h6 class="mb-1">${event.title}</h6>
                <p class="mb-1 small text-muted">${eventDate.toLocaleDateString('ru-RU')}</p>
                <span class="badge bg-${daysLeft <= 1 ? 'danger' : daysLeft <= 3 ? 'warning' : 'success'}">
                    ${daysLeft} ${getDayText(daysLeft)}
                </span>
            </div>
        `;
    }).join('');
}

function loadUpcomingEventsSidebar() {
    const container = document.getElementById('upcomingEventsList');
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    
    const upcomingEvents = calendarEvents
        .filter(event => event.type !== 'deadline')
        .filter(event => {
            const eventDate = new Date(event.date);
            return eventDate >= today && eventDate <= nextWeek;
        })
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 5);
    
    if (upcomingEvents.length === 0) {
        container.innerHTML = '<p class="text-muted text-center">Событий на ближайшую неделю нет</p>';
        return;
    }
    
    container.innerHTML = upcomingEvents.map(event => {
        const eventDate = new Date(event.date);
        
        return `
            <div class="d-flex justify-content-between align-items-center border-bottom pb-2 mb-2">
                <div>
                    <h6 class="mb-1 small">${event.title}</h6>
                    <small class="text-muted">${eventDate.toLocaleDateString('ru-RU')}</small>
                </div>
                <span class="badge ${getEventBadgeClass(event.type)}">${getEventTypeShortName(event.type)}</span>
            </div>
        `;
    }).join('');
}

function getEventBadgeClass(type) {
    const classes = {
        'lesson': 'bg-info',
        'exam': 'bg-warning',
        'meeting': 'bg-primary',
        'other': 'bg-secondary'
    };
    return classes[type] || 'bg-secondary';
}

function getEventTypeShortName(type) {
    const names = {
        'lesson': 'Занятие',
        'exam': 'Экзамен',
        'meeting': 'Встреча',
        'other': 'Событие'
    };
    return names[type] || 'Событие';
}

function getDayText(days) {
    if (days === 1) return 'день';
    if (days >= 2 && days <= 4) return 'дня';
    return 'дней';
}

function showTodaySchedule() {
    const today = new Date();
    const events = getEventsForDate(today);
    
    if (events.length === 0) {
        showAlert('Сегодня', 'На сегодня событий нет!', 'info');
        return;
    }
    
    let scheduleHTML = `
        <h6>Расписание на ${today.toLocaleDateString('ru-RU')}:</h6>
        ${events.map(event => `
            <div class="alert ${getEventAlertClass(event.type)} mb-2">
                <h6 class="mb-1">${event.title}</h6>
                <p class="mb-1">${event.time || 'Весь день'}</p>
                ${event.description ? `<p class="mb-0 small">${event.description}</p>` : ''}
            </div>
        `).join('')}
    `;
    
    // Показываем в модальном окне
    const modalHTML = `
        <div class="modal fade" id="todayScheduleModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="bi bi-calendar-day me-2"></i>Сегодняшнее расписание
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        ${scheduleHTML}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const modal = new bootstrap.Modal(document.getElementById('todayScheduleModal'));
    modal.show();
    
    document.getElementById('todayScheduleModal').addEventListener('hidden.bs.modal', function() {
        this.remove();
    });
}

function loadReportsTab() {
    const container = document.getElementById('reportsTab');
    
    container.innerHTML = `
        <div class="row">
            <div class="col-12">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h2 class="h3 mb-0">
                        <i class="bi bi-graph-up me-2 text-success"></i>Отчёты и аналитика
                    </h2>
                </div>
            </div>
        </div>

        <div class="row mb-4">
            <div class="col-xl-3 col-md-6 mb-4">
                <div class="card card-hover border-start border-success border-4 h-100">
                    <div class="card-body text-center">
                        <i class="bi bi-table display-4 text-success mb-3"></i>
                        <h5>Ведомость успеваемости</h5>
                        <p class="text-muted">Полная ведомость по всем группам</p>
                        <button class="btn btn-success" onclick="generateGradeSheet()">
                            <i class="bi bi-download me-1"></i>Скачать
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="col-xl-3 col-md-6 mb-4">
                <div class="card card-hover border-start border-primary border-4 h-100">
                    <div class="card-body text-center">
                        <i class="bi bi-person display-4 text-primary mb-3"></i>
                        <h5>Индивидуальные ведомости</h5>
                        <p class="text-muted">Отчёты по каждому студенту</p>
                        <button class="btn btn-primary" onclick="showStudentReportSelection()">
                            <i class="bi bi-person-lines-fill me-1"></i>Выбрать
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="col-xl-3 col-md-6 mb-4">
                <div class="card card-hover border-start border-warning border-4 h-100">
                    <div class="card-body text-center">
                        <i class="bi bi-exclamation-triangle display-4 text-warning mb-3"></i>
                        <h5>Отчёт по долгам</h5>
                        <p class="text-muted">Студенты с незакрытыми предметами</p>
                        <button class="btn btn-warning" onclick="generateDebtsReport()">
                            <i class="bi bi-eye me-1"></i>Просмотреть
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="col-xl-3 col-md-6 mb-4">
                <div class="card card-hover border-start border-info border-4 h-100">
                    <div class="card-body text-center">
                        <i class="bi bi-gear display-4 text-info mb-3"></i>
                        <h5>Настройки экспорта</h5>
                        <p class="text-muted">Форматы и параметры выгрузки</p>
                        <button class="btn btn-info" onclick="showExportSettingsModal()">
                            <i class="bi bi-sliders me-1"></i>Настроить
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div class="row">
            <div class="col-12">
                <div class="card shadow">
                    <div class="card-header bg-white">
                        <h5 class="mb-0">Статистика успеваемости</h5>
                    </div>
                    <div class="card-body">
                        <div id="reportsStatistics"></div>
                    </div>
                </div>
            </div>
        </div>

        <div class="row mt-4">
            <div class="col-12">
                <div class="card shadow">
                    <div class="card-header bg-white">
                        <h5 class="mb-0">Результаты отчётов</h5>
                    </div>
                    <div class="card-body">
                        <div id="reportsOutput"></div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Модальное окно выбора студента -->
        <div class="modal fade" id="studentReportModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Выберите студента</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="list-group" id="studentReportList"></div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Модальное окно настроек экспорта -->
        <div class="modal fade" id="exportSettingsModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Настройки экспорта</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-3">
                            <label class="form-label">Включать в отчёт:</label>
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="exportPersonal" checked>
                                <label class="form-check-label" for="exportPersonal">Персональные данные</label>
                            </div>
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="exportGrades" checked>
                                <label class="form-check-label" for="exportGrades">Оценки</label>
                            </div>
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="exportStats" checked>
                                <label class="form-check-label" for="exportStats">Статистику</label>
                            </div>
                        </div>
                        <div class="mb-3">
                            <label for="exportFormat" class="form-label">Формат файла:</label>
                            <select class="form-select" id="exportFormat">
                                <option value="excel">Excel (.xlsx)</option>
                                <option value="csv">CSV (.csv)</option>
                                <option value="pdf">PDF (.pdf)</option>
                            </select>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Закрыть</button>
                        <button type="button" class="btn btn-primary" onclick="saveExportSettings()">Сохранить</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    loadReportsStatistics();
    loadExportSettingsToForm();
}

function loadReportsStatistics() {
    const container = document.getElementById('reportsStatistics');
    const stats = calculateStatistics();
    
    container.innerHTML = `
        <div class="row text-center">
            <div class="col-md-3 mb-3">
                <div class="card bg-light">
                    <div class="card-body">
                        <h3 class="text-primary">${stats.totalStudents}</h3>
                        <p class="mb-0 text-muted">Студентов</p>
                    </div>
                </div>
            </div>
            <div class="col-md-3 mb-3">
                <div class="card bg-light">
                    <div class="card-body">
                        <h3 class="text-success">${stats.totalSubjects}</h3>
                        <p class="mb-0 text-muted">Предметов</p>
                    </div>
                </div>
            </div>
            <div class="col-md-3 mb-3">
                <div class="card bg-light">
                    <div class="card-body">
                        <h3 class="text-info">${stats.totalGrades}</h3>
                        <p class="mb-0 text-muted">Оценок</p>
                    </div>
                </div>
            </div>
            <div class="col-md-3 mb-3">
                <div class="card bg-light">
                    <div class="card-body">
                        <h3 class="text-warning">${stats.averageGrade}</h3>
                        <p class="mb-0 text-muted">Средний балл</p>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="row mt-4">
            <div class="col-md-6">
                <h6>Распределение оценок:</h6>
                <div id="gradeDistributionChart"></div>
            </div>
            <div class="col-md-6">
                <h6>Успеваемость по группам:</h6>
                <div id="groupPerformanceChart"></div>
            </div>
        </div>
    `;

    renderGradeDistribution();
    renderGroupPerformance();
}

function renderGradeDistribution() {
    const container = document.getElementById('gradeDistributionChart');
    const distribution = calculateGradeDistribution();
    
    let html = '';
    Object.entries(distribution).forEach(([grade, count]) => {
        if (count > 0) {
            const total = Object.values(distribution).reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
            
            html += `
                <div class="mb-2">
                    <div class="d-flex justify-content-between">
                        <span>${getGradeLabel(grade)}</span>
                        <span>${count} (${percentage}%)</span>
                    </div>
                    <div class="progress" style="height: 8px;">
                        <div class="progress-bar ${getGradeProgressClass(grade)}" 
                             style="width: ${percentage}%"></div>
                    </div>
                </div>
            `;
        }
    });
    
    container.innerHTML = html || '<p class="text-muted">Нет данных</p>';
}

function calculateGradeDistribution() {
    const distribution = {
        '5': 0, '4': 0, '3': 0, '2': 0,
        'зачёт': 0, 'незачёт': 0
    };
    
    appData.grades.forEach(grade => {
        if (distribution.hasOwnProperty(grade.grade)) {
            distribution[grade.grade]++;
        }
    });
    
    return distribution;
}

function getGradeLabel(grade) {
    const labels = {
        '5': '5 (Отлично)',
        '4': '4 (Хорошо)',
        '3': '3 (Удовлетворительно)',
        '2': '2 (Неудовлетворительно)',
        'зачёт': 'Зачёт',
        'незачёт': 'Незачёт'
    };
    return labels[grade] || grade;
}

function getGradeProgressClass(grade) {
    const classes = {
        '5': 'bg-success',
        '4': 'bg-info',
        '3': 'bg-warning',
        '2': 'bg-danger',
        'зачёт': 'bg-success',
        'незачёт': 'bg-danger'
    };
    return classes[grade] || 'bg-secondary';
}

function renderGroupPerformance() {
    const container = document.getElementById('groupPerformanceChart');
    const groupStats = calculateGroupStatistics();
    
    if (Object.keys(groupStats).length === 0) {
        container.innerHTML = '<p class="text-muted">Нет данных по группам</p>';
        return;
    }
    
    let html = '';
    Object.entries(groupStats).forEach(([group, stats]) => {
        html += `
            <div class="mb-3">
                <div class="d-flex justify-content-between mb-1">
                    <strong>${group}</strong>
                    <span>Средний: ${stats.averageScore}</span>
                </div>
                <div class="d-flex justify-content-between small text-muted">
                    <span>Студентов: ${stats.studentCount}</span>
                    <span>Оценок: ${stats.gradeCount}</span>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function calculateGroupStatistics() {
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
        
        const studentGrades = appData.grades.filter(g => g.studentId === student.id);
        groupStats[student.group].gradeCount += studentGrades.length;
        
        studentGrades.forEach(grade => {
            const numericGrade = parseInt(grade.grade);
            if (!isNaN(numericGrade)) {
                groupStats[student.group].totalScore += numericGrade;
            }
        });
    });
    
    // Рассчитываем средний балл для каждой группы
    Object.keys(groupStats).forEach(group => {
        const stats = groupStats[group];
        stats.averageScore = stats.gradeCount > 0 ? 
            (stats.totalScore / stats.gradeCount).toFixed(2) : '0.00';
    });
    
    return groupStats;
}

function generateGradeSheet() {
    const output = document.getElementById('reportsOutput');
    output.innerHTML = `
        <div class="alert alert-info">
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <h6 class="alert-heading">Ведомость успеваемости</h6>
                    <p class="mb-0">Формирование полной ведомости...</p>
                </div>
                <div class="spinner-border spinner-border-sm" role="status"></div>
            </div>
        </div>
    `;
    
    setTimeout(() => {
        const data = prepareGradeSheetData();
        showReportPreview(data, 'gradeSheet');
        
        output.innerHTML = `
            <div class="alert alert-success">
                <h6 class="alert-heading">Ведомость сформирована!</h6>
                <p class="mb-0">Ведомость успеваемости готова к просмотру и печати.</p>
            </div>
        `;
    }, 1500);
}

function showStudentReportSelection() {
    const container = document.getElementById('studentReportList');
    
    if (appData.students.length === 0) {
        showAlert('Ошибка', 'Нет студентов для формирования отчёта', 'warning');
        return;
    }
    
    container.innerHTML = appData.students.map(student => `
        <a href="#" class="list-group-item list-group-item-action" onclick="generateStudentReport(${student.id})">
            <div class="d-flex w-100 justify-content-between">
                <h6 class="mb-1">${student.name}</h6>
                <small class="text-muted">${student.group}</small>
            </div>
        </a>
    `).join('');
    
    const modal = new bootstrap.Modal(document.getElementById('studentReportModal'));
    modal.show();
}

function generateStudentReport(studentId) {
    const student = appData.students.find(s => s.id === studentId);
    if (!student) return;
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('studentReportModal'));
    modal.hide();
    
    const output = document.getElementById('reportsOutput');
    output.innerHTML = `
        <div class="alert alert-info">
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <h6 class="alert-heading">Формирование отчёта</h6>
                    <p class="mb-0">Студент: ${student.name}</p>
                </div>
                <div class="spinner-border spinner-border-sm" role="status"></div>
            </div>
        </div>
    `;
    
    setTimeout(() => {
        const data = prepareStudentReportData(studentId);
        showReportPreview(data, 'studentReport');
        
        output.innerHTML = `
            <div class="alert alert-success">
                <h6 class="alert-heading">Отчёт сформирован!</h6>
                <p class="mb-0">Индивидуальная ведомость студента ${student.name} готова.</p>
            </div>
        `;
    }, 1500);
}

function generateDebtsReport() {
    const output = document.getElementById('reportsOutput');
    const studentsWithDebts = findStudentsWithDebts();
    
    if (studentsWithDebts.length === 0) {
        output.innerHTML = `
            <div class="alert alert-success">
                <h6 class="alert-heading">Долгов нет!</h6>
                <p class="mb-0">Все студенты имеют оценки по всем предметам.</p>
            </div>
        `;
        return;
    }
    
    let html = `
        <div class="alert alert-warning">
            <h6 class="alert-heading">Отчёт по академическим долгам</h6>
            <p class="mb-0">Найдено ${studentsWithDebts.length} студентов с долгами</p>
        </div>
        
        <div class="table-responsive">
            <table class="table table-sm">
                <thead>
                    <tr>
                        <th>Студент</th>
                        <th>Группа</th>
                        <th>Количество долгов</th>
                        <th>Предметы</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    studentsWithDebts.forEach(({ student, debtSubjects }) => {
        html += `
            <tr>
                <td>${student.name}</td>
                <td><span class="badge bg-secondary">${student.group}</span></td>
                <td><span class="badge bg-danger">${debtSubjects.length}</span></td>
                <td>${debtSubjects.map(s => s.name).join(', ')}</td>
            </tr>
        `;
    });
    
    html += `
                </tbody>
            </table>
        </div>
        
        <button class="btn btn-outline-primary mt-2" onclick="exportDebtsReport()">
            <i class="bi bi-download me-1"></i>Экспортировать в Excel
        </button>
    `;
    
    output.innerHTML = html;
}

function findStudentsWithDebts() {
    const studentsWithDebts = [];
    
    appData.students.forEach(student => {
        const studentGrades = appData.grades.filter(g => g.studentId === student.id);
        const gradedSubjects = new Set(studentGrades.map(g => g.subjectId));
        const debtSubjects = appData.subjects.filter(s => !gradedSubjects.has(s.id));
        
        if (debtSubjects.length > 0) {
            studentsWithDebts.push({
                student: student,
                debtSubjects: debtSubjects
            });
        }
    });
    
    return studentsWithDebts;
}

function exportDebtsReport() {
    const studentsWithDebts = findStudentsWithDebts();
    
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
    csvContent += "Отчёт по академическим долгам\r\n";
    csvContent += `Сгенерировано: ${new Date().toLocaleDateString()}\r\n`;
    csvContent += "\r\n";
    csvContent += "Студент;Группа;Количество долгов;Предметы\r\n";
    
    studentsWithDebts.forEach(({ student, debtSubjects }) => {
        csvContent += `${student.name};${student.group};${debtSubjects.length};"${debtSubjects.map(s => s.name).join(', ')}"\r\n`;
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `долги_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showAlert('Успех', 'Отчёт по долгам экспортирован в CSV', 'success');
}

function showExportSettingsModal() {
    const modal = new bootstrap.Modal(document.getElementById('exportSettingsModal'));
    modal.show();
}

function loadExportSettingsToForm() {
    document.getElementById('exportPersonal').checked = exportSettings.includePersonalData;
    document.getElementById('exportGrades').checked = exportSettings.includeGrades;
    document.getElementById('exportStats').checked = exportSettings.includeStatistics;
    document.getElementById('exportFormat').value = exportSettings.fileFormat;
}

function saveExportSettings() {
    exportSettings.includePersonalData = document.getElementById('exportPersonal').checked;
    exportSettings.includeGrades = document.getElementById('exportGrades').checked;
    exportSettings.includeStatistics = document.getElementById('exportStats').checked;
    exportSettings.fileFormat = document.getElementById('exportFormat').value;
    
    localStorage.setItem('e-zachetka-export-settings', JSON.stringify(exportSettings));
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('exportSettingsModal'));
    modal.hide();
    
    showAlert('Успех', 'Настройки экспорта сохранены', 'success');
}

function loadNotificationsTab() {
    const container = document.getElementById('notificationsTab');
    
    container.innerHTML = `
        <div class="row">
            <div class="col-12">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h2 class="h3 mb-0">
                        <i class="bi bi-bell me-2 text-warning"></i>Система уведомлений
                    </h2>
                    <div>
                        <button class="btn btn-outline-warning me-2" onclick="checkAllNotifications()">
                            <i class="bi bi-check-all me-1"></i>Отметить все прочитанными
                        </button>
                        <button class="btn btn-warning" onclick="clearAllNotifications()">
                            <i class="bi bi-trash me-1"></i>Очистить все
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div class="row mb-4">
            <div class="col-md-8">
                <div class="card shadow">
                    <div class="card-header bg-white">
                        <h5 class="mb-0">Все уведомления</h5>
                    </div>
                    <div class="card-body">
                        <div id="notificationsListContainer">
                            <div class="text-center py-4">
                                <div class="spinner-border text-warning" role="status"></div>
                                <p class="mt-2 text-muted">Загрузка уведомлений...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="col-md-4">
                <div class="card shadow">
                    <div class="card-header bg-white">
                        <h5 class="mb-0">Настройки уведомлений</h5>
                    </div>
                    <div class="card-body">
                        <form id="notificationSettingsForm">
                            <div class="mb-3">
                                <label class="form-label fw-bold">Типы уведомлений:</label>
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" id="notifyDeadlines" checked>
                                    <label class="form-check-label" for="notifyDeadlines">
                                        Дедлайны и сроки сдачи
                                    </label>
                                </div>
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" id="notifyGrades" checked>
                                    <label class="form-check-label" for="notifyGrades">
                                        Новые оценки
                                    </label>
                                </div>
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" id="notifyDebts">
                                    <label class="form-check-label" for="notifyDebts">
                                        Академические долги
                                    </label>
                                </div>
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" id="notifySystem" checked>
                                    <label class="form-check-label" for="notifySystem">
                                        Системные уведомления
                                    </label>
                                </div>
                            </div>
                            
                            <div class="mb-3">
                                <label for="deadlineDays" class="form-label">
                                    Напоминать о дедлайнах за (дней):
                                </label>
                                <input type="number" class="form-control" id="deadlineDays" min="1" max="30" value="7">
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label fw-bold">Способ получения:</label>
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" id="notifyInApp" checked disabled>
                                    <label class="form-check-label" for="notifyInApp">
                                        В приложении
                                    </label>
                                </div>
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" id="notifyEmail">
                                    <label class="form-check-label" for="notifyEmail">
                                        По электронной почте
                                    </label>
                                </div>
                            </div>
                            
                            <button type="button" class="btn btn-warning w-100" onclick="saveNotificationSettings()">
                                <i class="bi bi-check-circle me-1"></i>Сохранить настройки
                            </button>
                        </form>
                    </div>
                </div>
                
                <div class="card shadow mt-4">
                    <div class="card-header bg-white">
                        <h5 class="mb-0">Быстрые действия</h5>
                    </div>
                    <div class="card-body">
                        <button class="btn btn-outline-primary w-100 mb-2" onclick="checkDeadlines()">
                            <i class="bi bi-search me-1"></i>Проверить дедлайны
                        </button>
                        <button class="btn btn-outline-success w-100 mb-2" onclick="checkStudentDebts()">
                            <i class="bi bi-exclamation-triangle me-1"></i>Найти долги
                        </button>
                        <button class="btn btn-outline-info w-100" onclick="generateWeeklyReport()">
                            <i class="bi bi-graph-up me-1"></i>Еженедельный отчёт
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Загружаем уведомления и настройки
    setTimeout(() => {
        loadNotificationsList();
        loadNotificationSettingsToForm();
    }, 500);
}

function loadNotificationsList() {
    const container = document.getElementById('notificationsListContainer');
    
    if (notifications.length === 0) {
        container.innerHTML = `
            <div class="text-center py-5">
                <i class="bi bi-bell-slash display-1 text-muted"></i>
                <h4 class="text-muted mt-3">Уведомлений нет</h4>
                <p class="text-muted">Здесь будут появляться важные уведомления системы</p>
                <button class="btn btn-primary mt-2" onclick="checkDeadlines()">
                    <i class="bi bi-search me-1"></i>Проверить наличие проблем
                </button>
            </div>
        `;
        return;
    }
    
    // Группируем уведомления по дате
    const groupedNotifications = groupNotificationsByDate(notifications);
    
    let html = '';
    
    Object.entries(groupedNotifications).forEach(([date, dayNotifications]) => {
        html += `
            <div class="mb-4">
                <h6 class="text-muted border-bottom pb-2 mb-3">${formatNotificationDate(date)}</h6>
                <div class="notifications-day-list">
        `;
        
        dayNotifications.forEach(notification => {
            const icon = getNotificationIcon(notification.type);
            const badgeClass = getNotificationBadgeClass(notification.type);
            
            html += `
                <div class="notification-item ${notification.read ? 'read' : 'unread'} mb-3">
                    <div class="d-flex">
                        <div class="notification-icon me-3">
                            <span class="badge ${badgeClass} fs-6">${icon}</span>
                        </div>
                        <div class="notification-content flex-grow-1">
                            <div class="d-flex justify-content-between align-items-start mb-1">
                                <h6 class="notification-title mb-0">${notification.title}</h6>
                                <small class="text-muted">${formatNotificationTime(notification.date)}</small>
                            </div>
                            <p class="notification-message text-muted mb-2">${notification.message}</p>
                            <div class="notification-actions">
                                ${notification.studentId ? `
                                    <button class="btn btn-sm btn-outline-primary me-1" 
                                            onclick="viewStudentFromNotification(${notification.studentId})">
                                        <i class="bi bi-eye me-1"></i>Посмотреть студента
                                    </button>
                                ` : ''}
                                <button class="btn btn-sm btn-outline-danger" 
                                        onclick="deleteNotification(${notification.id})">
                                    <i class="bi bi-trash me-1"></i>Удалить
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += `
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function groupNotificationsByDate(notifications) {
    const grouped = {};
    
    notifications.forEach(notification => {
        const date = new Date(notification.date).toDateString();
        if (!grouped[date]) {
            grouped[date] = [];
        }
        grouped[date].push(notification);
    });
    
    return grouped;
}

function formatNotificationDate(dateString) {
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

function formatNotificationTime(dateString) {
    return new Date(dateString).toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getNotificationIcon(type) {
    const icons = {
        'success': '✓',
        'warning': '⚠',
        'danger': '🚨',
        'info': 'ℹ'
    };
    return icons[type] || '📢';
}

function getNotificationBadgeClass(type) {
    const classes = {
        'success': 'bg-success',
        'warning': 'bg-warning',
        'danger': 'bg-danger',
        'info': 'bg-info'
    };
    return classes[type] || 'bg-secondary';
}

function viewStudentFromNotification(studentId) {
    viewStudentDetails(studentId);
    // Помечаем связанные уведомления как прочитанные
    notifications.forEach(notification => {
        if (notification.studentId === studentId) {
            notification.read = true;
        }
    });
    saveNotifications();
    updateNotificationBadge();
}

function deleteNotification(notificationId) {
    notifications = notifications.filter(n => n.id !== notificationId);
    saveNotifications();
    updateNotificationBadge();
    loadNotificationsList();
    
    showAlert('Успех', 'Уведомление удалено', 'success');
}

function checkAllNotifications() {
    notifications.forEach(notification => {
        notification.read = true;
    });
    saveNotifications();
    updateNotificationBadge();
    loadNotificationsList();
    
    showAlert('Успех', 'Все уведомления помечены как прочитанные', 'success');
}

function clearAllNotifications() {
    if (notifications.length === 0) {
        showAlert('Информация', 'Нет уведомлений для очистки', 'info');
        return;
    }
    
    if (confirm('Вы уверены, что хотите удалить все уведомления?')) {
        notifications = [];
        saveNotifications();
        updateNotificationBadge();
        loadNotificationsList();
        
        showAlert('Успех', 'Все уведомления удалены', 'success');
    }
}

function loadNotificationSettingsToForm() {
    document.getElementById('notifyDeadlines').checked = notificationSettings.enableDeadlineNotifications;
    document.getElementById('notifyGrades').checked = notificationSettings.enableGradeNotifications;
    document.getElementById('notifyDebts').checked = notificationSettings.enableDebtNotifications;
    document.getElementById('notifySystem').checked = true; // Всегда включено
    document.getElementById('deadlineDays').value = notificationSettings.deadlineDays;
    document.getElementById('notifyEmail').checked = false; // Пока не реализовано
}

function saveNotificationSettings() {
    notificationSettings.enableDeadlineNotifications = document.getElementById('notifyDeadlines').checked;
    notificationSettings.enableGradeNotifications = document.getElementById('notifyGrades').checked;
    notificationSettings.enableDebtNotifications = document.getElementById('notifyDebts').checked;
    notificationSettings.deadlineDays = parseInt(document.getElementById('deadlineDays').value) || 7;
    
    localStorage.setItem('e-zachetka-notification-settings', JSON.stringify(notificationSettings));
    
    showAlert('Успех', 'Настройки уведомлений сохранены', 'success');
}

function checkDeadlines() {
    const container = document.getElementById('notificationsListContainer');
    
    container.innerHTML = `
        <div class="alert alert-info">
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <h6 class="alert-heading">Проверка дедлайнов</h6>
                    <p class="mb-0">Ищем студентов с приближающимися сроками сдачи...</p>
                </div>
                <div class="spinner-border spinner-border-sm" role="status"></div>
            </div>
        </div>
    `;
    
    setTimeout(() => {
        performDeadlineCheck();
        loadNotificationsList();
    }, 2000);
}

function performDeadlineCheck() {
    let issuesFound = false;
    
    // Проверяем студентов без оценок
    appData.students.forEach(student => {
        const studentGrades = appData.grades.filter(g => g.studentId === student.id);
        const studentSubjects = new Set(studentGrades.map(g => g.subjectId));
        const allSubjects = new Set(appData.subjects.map(s => s.id));
        
        // Находим предметы без оценок
        const subjectsWithoutGrades = [...allSubjects].filter(subjectId => 
            !studentSubjects.has(subjectId)
        );
        
        if (subjectsWithoutGrades.length > 0) {
            issuesFound = true;
            const subjectNames = subjectsWithoutGrades.map(subjectId => {
                const subject = appData.subjects.find(s => s.id === subjectId);
                return subject ? subject.name : 'Неизвестный предмет';
            }).join(', ');
            
            addNotification(
                'warning',
                `📚 Отсутствуют оценки`,
                `Студент ${student.name} не имеет оценок по предметам: ${subjectNames}`,
                student.id
            );
        }
    });
    
    if (!issuesFound) {
        addNotification('success', '✅ Всё в порядке', 'Все студенты имеют оценки по всем предметам');
    }
}

function checkStudentDebts() {
    const studentsWithDebts = findStudentsWithDebts();
    
    if (studentsWithDebts.length === 0) {
        addNotification('success', '✅ Долгов нет', 'Все студенты закрыли все предметы');
        return;
    }
    
    studentsWithDebts.forEach(({ student, debtSubjects }) => {
        addNotification(
            'danger',
            '⚠️ Академический долг',
            `Студент ${student.name} имеет ${debtSubjects.length} незакрытых предметов`,
            student.id
        );
    });
    
    loadNotificationsList();
}

function generateWeeklyReport() {
    const stats = calculateStatistics();
    const studentsWithDebts = findStudentsWithDebts();
    
    addNotification(
        'info',
        '📊 Еженедельный отчёт',
        `Статистика за неделю: ${stats.totalStudents} студентов, ${stats.totalGrades} оценок, ${studentsWithDebts.length} долгов`
    );
    
    loadNotificationsList();
}

function loadUsersTab() {
    if (currentUser?.role !== 'admin') {
        document.getElementById('usersTab').innerHTML = `
            <div class="alert alert-danger">
                <h4 class="alert-heading">Доступ запрещён</h4>
                <p class="mb-0">Эта функция доступна только администраторам системы.</p>
            </div>
        `;
        return;
    }

    const container = document.getElementById('usersTab');
    
    container.innerHTML = `
        <div class="row">
            <div class="col-12">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h2 class="h3 mb-0">
                        <i class="bi bi-people me-2 text-primary"></i>Управление пользователями
                    </h2>
                    <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addUserModal">
                        <i class="bi bi-person-plus me-1"></i>Добавить пользователя
                    </button>
                </div>
            </div>
        </div>

        <div class="row">
            <div class="col-12">
                <div class="card shadow">
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-hover">
                                <thead class="table-light">
                                    <tr>
                                        <th>Пользователь</th>
                                        <th>Логин</th>
                                        <th>Роль</th>
                                        <th>Предметы</th>
                                        <th>Статус</th>
                                        <th>Действия</th>
                                    </tr>
                                </thead>
                                <tbody id="usersListContainer">
                                    <tr>
                                        <td colspan="6" class="text-center py-4">
                                            <div class="spinner-border text-primary" role="status"></div>
                                            <p class="mt-2 text-muted">Загрузка пользователей...</p>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Модальное окно добавления пользователя -->
        <div class="modal fade" id="addUserModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Добавить пользователя</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="addUserForm">
                            <div class="mb-3">
                                <label for="newUserName" class="form-label">ФИО</label>
                                <input type="text" class="form-control" id="newUserName" required>
                            </div>
                            <div class="mb-3">
                                <label for="newUserLogin" class="form-label">Логин</label>
                                <input type="text" class="form-control" id="newUserLogin" required>
                            </div>
                            <div class="mb-3">
                                <label for="newUserPassword" class="form-label">Пароль</label>
                                <input type="password" class="form-control" id="newUserPassword" required>
                            </div>
                            <div class="mb-3">
                                <label for="newUserRole" class="form-label">Роль</label>
                                <select class="form-select" id="newUserRole" required>
                                    <option value="teacher">Преподаватель</option>
                                    <option value="admin">Администратор</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label for="newUserSubjects" class="form-label">Предметы (через запятую)</label>
                                <input type="text" class="form-control" id="newUserSubjects" 
                                       placeholder="Математика, Физика, Информатика">
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Отмена</button>
                        <button type="button" class="btn btn-primary" onclick="addNewUser()">Добавить</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Модальное окно редактирования пользователя -->
        <div class="modal fade" id="editUserModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Редактировать пользователя</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body" id="editUserModalBody">
                        <!-- Контент будет добавляться динамически -->
                    </div>
                </div>
            </div>
        </div>
    `;

    setTimeout(() => {
        loadUsersList();
    }, 500);
}

function loadUsersList() {
    const container = document.getElementById('usersListContainer');
    
    if (appData.users.length === 0) {
        container.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-5">
                    <i class="bi bi-people display-1 text-muted"></i>
                    <h4 class="text-muted mt-3">Пользователи не найдены</h4>
                    <p class="text-muted">Добавьте первого пользователя системы</p>
                </td>
            </tr>
        `;
        return;
    }
    
    let html = '';
    
    appData.users.forEach(user => {
        const isCurrentUser = currentUser && user.id === currentUser.id;
        const roleBadge = user.role === 'admin' ? 
            '<span class="badge bg-danger">Администратор</span>' : 
            '<span class="badge bg-primary">Преподаватель</span>';
        
        const statusBadge = isCurrentUser ? 
            '<span class="badge bg-success">Online</span>' : 
            '<span class="badge bg-secondary">Offline</span>';
        
        html += `
            <tr>
                <td>
                    <div class="d-flex align-items-center">
                        <i class="bi bi-person-circle me-2 text-primary fs-5"></i>
                        <div>
                            <strong>${user.name}</strong>
                            ${isCurrentUser ? '<small class="text-muted d-block">(Вы)</small>' : ''}
                        </div>
                    </div>
                </td>
                <td>${user.username}</td>
                <td>${roleBadge}</td>
                <td>
                    ${user.subjects.length > 0 ? 
                        `<small>${user.subjects.slice(0, 2).join(', ')}${user.subjects.length > 2 ? '...' : ''}</small>` : 
                        '<span class="text-muted">нет</span>'
                    }
                </td>
                <td>${statusBadge}</td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" onclick="editUser(${user.id})" 
                                ${isCurrentUser ? 'disabled' : ''}>
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-outline-danger" onclick="deleteUser(${user.id})"
                                ${isCurrentUser ? 'disabled' : ''}>
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    container.innerHTML = html;
}

function addNewUser() {
    const name = document.getElementById('newUserName').value.trim();
    const username = document.getElementById('newUserLogin').value.trim();
    const password = document.getElementById('newUserPassword').value;
    const role = document.getElementById('newUserRole').value;
    const subjectsInput = document.getElementById('newUserSubjects').value.trim();
    
    if (!name || !username || !password) {
        showAlert('Ошибка', 'Заполните все обязательные поля!', 'warning');
        return;
    }
    
    // Проверяем, нет ли уже такого логина
    if (appData.users.find(u => u.username === username)) {
        showAlert('Ошибка', 'Пользователь с таким логином уже существует!', 'danger');
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
    
    // Закрываем модальное окно
    const modal = bootstrap.Modal.getInstance(document.getElementById('addUserModal'));
    modal.hide();
    
    // Очищаем форму
    document.getElementById('addUserForm').reset();
    
    // Обновляем список
    loadUsersList();
    
    addNotification('success', 'Пользователь добавлен', `Пользователь ${name} добавлен в систему`);
}

function editUser(userId) {
    const user = appData.users.find(u => u.id === userId);
    if (!user) return;
    
    const modalBody = document.getElementById('editUserModalBody');
    
    modalBody.innerHTML = `
        <form id="editUserForm">
            <div class="mb-3">
                <label for="editUserName" class="form-label">ФИО</label>
                <input type="text" class="form-control" id="editUserName" value="${user.name}" required>
            </div>
            <div class="mb-3">
                <label for="editUserLogin" class="form-label">Логин</label>
                <input type="text" class="form-control" id="editUserLogin" value="${user.username}" required>
            </div>
            <div class="mb-3">
                <label for="editUserPassword" class="form-label">Новый пароль</label>
                <input type="password" class="form-control" id="editUserPassword" 
                       placeholder="Оставьте пустым, чтобы не менять">
            </div>
            <div class="mb-3">
                <label for="editUserRole" class="form-label">Роль</label>
                <select class="form-select" id="editUserRole" required>
                    <option value="teacher" ${user.role === 'teacher' ? 'selected' : ''}>Преподаватель</option>
                    <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Администратор</option>
                </select>
            </div>
            <div class="mb-3">
                <label for="editUserSubjects" class="form-label">Предметы (через запятую)</label>
                <input type="text" class="form-control" id="editUserSubjects" 
                       value="${user.subjects.join(', ')}">
            </div>
        </form>
        <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Отмена</button>
            <button type="button" class="btn btn-primary" onclick="updateUser(${user.id})">Сохранить</button>
        </div>
    `;
    
    const modal = new bootstrap.Modal(document.getElementById('editUserModal'));
    modal.show();
}

function updateUser(userId) {
    const user = appData.users.find(u => u.id === userId);
    if (!user) return;
    
    const name = document.getElementById('editUserName').value.trim();
    const username = document.getElementById('editUserLogin').value.trim();
    const password = document.getElementById('editUserPassword').value;
    const role = document.getElementById('editUserRole').value;
    const subjectsInput = document.getElementById('editUserSubjects').value.trim();
    
    if (!name || !username) {
        showAlert('Ошибка', 'Заполните обязательные поля!', 'warning');
        return;
    }
    
    // Проверяем, нет ли другого пользователя с таким логином
    const existingUser = appData.users.find(u => u.username === username && u.id !== userId);
    if (existingUser) {
        showAlert('Ошибка', 'Пользователь с таким логином уже существует!', 'danger');
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
    
    // Закрываем модальное окно
    const modal = bootstrap.Modal.getInstance(document.getElementById('editUserModal'));
    modal.hide();
    
    // Обновляем список
    loadUsersList();
    
    addNotification('success', 'Пользователь обновлён', `Данные пользователя ${name} обновлены`);
}

function deleteUser(userId) {
    const user = appData.users.find(u => u.id === userId);
    if (!user) return;
    
    if (confirm(`Вы уверены, что хотите удалить пользователя "${user.name}"?`)) {
        appData.users = appData.users.filter(u => u.id !== userId);
        saveData();
        loadUsersList();
        
        addNotification('info', 'Пользователь удалён', `Пользователь ${user.name} удалён из системы`);
    }
}

function loadBackupTab() {
    if (currentUser?.role !== 'admin') {
        document.getElementById('backupTab').innerHTML = `
            <div class="alert alert-danger">
                <h4 class="alert-heading">Доступ запрещён</h4>
                <p class="mb-0">Эта функция доступна только администраторам системы.</p>
            </div>
        `;
        return;
    }

    const container = document.getElementById('backupTab');
    
    container.innerHTML = `
        <div class="row">
            <div class="col-12">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h2 class="h3 mb-0">
                        <i class="bi bi-cloud-arrow-down me-2 text-info"></i>Резервные копии
                    </h2>
                    <button class="btn btn-info" onclick="createBackup()">
                        <i class="bi bi-cloud-arrow-up me-1"></i>Создать резервную копию
                    </button>
                </div>
            </div>
        </div>

        <div class="row">
            <div class="col-md-6 mb-4">
                <div class="card shadow">
                    <div class="card-header bg-white">
                        <h5 class="mb-0">
                            <i class="bi bi-download me-2 text-success"></i>Создание резервной копии
                        </h5>
                    </div>
                    <div class="card-body">
                        <p class="text-muted">
                            Создайте полную резервную копию всех данных системы. 
                            Файл будет сохранён в формате JSON.
                        </p>
                        
                        <div class="mb-3">
                            <label for="backupComment" class="form-label">Комментарий к резервной копии:</label>
                            <textarea class="form-control" id="backupComment" rows="2" 
                                      placeholder="Описание изменений или причина создания бэкапа..."></textarea>
                        </div>
                        
                        <div class="mb-3">
                            <label class="form-label fw-bold">Включить в резервную копию:</label>
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="backupStudents" checked>
                                <label class="form-check-label" for="backupStudents">
                                    Данные студентов
                                </label>
                            </div>
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="backupSubjects" checked>
                                <label class="form-check-label" for="backupSubjects">
                                    Данные предметов
                                </label>
                            </div>
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="backupGrades" checked>
                                <label class="form-check-label" for="backupGrades">
                                    Оценки
                                </label>
                            </div>
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="backupUsers" checked>
                                <label class="form-check-label" for="backupUsers">
                                    Пользователей
                                </label>
                            </div>
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="backupSettings" checked>
                                <label class="form-check-label" for="backupSettings">
                                    Настройки системы
                                </label>
                            </div>
                        </div>
                        
                        <button class="btn btn-success w-100" onclick="createCustomBackup()">
                            <i class="bi bi-file-earmark-arrow-down me-1"></i>Создать выборочную копию
                        </button>
                    </div>
                </div>
                
                <div class="card shadow mt-4">
                    <div class="card-header bg-white">
                        <h5 class="mb-0">
                            <i class="bi bi-upload me-2 text-primary"></i>Восстановление данных
                        </h5>
                    </div>
                    <div class="card-body">
                        <p class="text-muted">
                            Восстановите систему из ранее созданной резервной копии.
                        </p>
                        
                        <div class="mb-3">
                            <label for="restoreFile" class="form-label">Выберите файл резервной копии:</label>
                            <input type="file" class="form-control" id="restoreFile" accept=".json,.backup">
                        </div>
                        
                        <div class="alert alert-warning">
                            <i class="bi bi-exclamation-triangle me-2"></i>
                            <strong>Внимание!</strong> Восстановление данных перезапишет текущие данные системы.
                        </div>
                        
                        <button class="btn btn-primary w-100" onclick="restoreBackup()">
                            <i class="bi bi-arrow-clockwise me-1"></i>Восстановить из резервной копии
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="col-md-6">
                <div class="card shadow">
                    <div class="card-header bg-white">
                        <h5 class="mb-0">
                            <i class="bi bi-graph-up me-2 text-warning"></i>Статистика системы
                        </h5>
                    </div>
                    <div class="card-body">
                        <div id="systemStatsContainer">
                            <div class="text-center py-3">
                                <div class="spinner-border text-warning" role="status"></div>
                                <p class="mt-2 text-muted">Загрузка статистики...</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="card shadow mt-4">
                    <div class="card-header bg-white">
                        <h5 class="mb-0">
                            <i class="bi bi-shield-check me-2 text-success"></i>Безопасность данных
                        </h5>
                    </div>
                    <div class="card-body">
                        <div class="mb-3">
                            <h6>Рекомендации по резервному копированию:</h6>
                            <ul class="small text-muted">
                                <li>Создавайте резервные копии перед крупными обновлениями</li>
                                <li>Храните копии в разных местах (локально и в облаке)</li>
                                <li>Регулярно проверяйте целостность резервных копий</li>
                                <li>Используйте описательные комментарии для копий</li>
                            </ul>
                        </div>
                        
                        <div class="mb-3">
                            <h6>Автоматическое резервное копирование:</h6>
                            <div class="form-check form-switch">
                                <input class="form-check-input" type="checkbox" id="autoBackup">
                                <label class="form-check-label" for="autoBackup">
                                    Создавать автоматические копии при выходе
                                </label>
                            </div>
                        </div>
                        
                        <button class="btn btn-outline-secondary w-100" onclick="showBackupHistory()">
                            <i class="bi bi-clock-history me-1"></i>История резервного копирования
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Модальное окно истории бэкапов -->
        <div class="modal fade" id="backupHistoryModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">История резервного копирования</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div id="backupHistoryContent"></div>
                    </div>
                </div>
            </div>
        </div>
    `;

    setTimeout(() => {
        loadSystemStats();
    }, 500);
}

function loadSystemStats() {
    const container = document.getElementById('systemStatsContainer');
    const stats = calculateStatistics();
    const storageUsage = JSON.stringify(appData).length / 1024; // KB
    
    const backupHistory = JSON.parse(localStorage.getItem('e-zachetka-backup-history') || '[]');
    
    container.innerHTML = `
        <div class="system-stats-grid">
            <div class="system-stat-item">
                <div class="system-stat-icon text-primary">
                    <i class="bi bi-database"></i>
                </div>
                <div class="system-stat-info">
                    <div class="system-stat-value">${storageUsage.toFixed(1)} KB</div>
                    <div class="system-stat-label">Использовано памяти</div>
                </div>
            </div>
            
            <div class="system-stat-item">
                <div class="system-stat-icon text-success">
                    <i class="bi bi-people"></i>
                </div>
                <div class="system-stat-info">
                    <div class="system-stat-value">${stats.totalStudents}</div>
                    <div class="system-stat-label">Студентов</div>
                </div>
            </div>
            
            <div class="system-stat-item">
                <div class="system-stat-icon text-info">
                    <i class="bi bi-journal-text"></i>
                </div>
                <div class="system-stat-info">
                    <div class="system-stat-value">${stats.totalSubjects}</div>
                    <div class="system-stat-label">Предметов</div>
                </div>
            </div>
            
            <div class="system-stat-item">
                <div class="system-stat-icon text-warning">
                    <i class="bi bi-pencil-square"></i>
                </div>
                <div class="system-stat-info">
                    <div class="system-stat-value">${stats.totalGrades}</div>
                    <div class="system-stat-label">Оценок</div>
                </div>
            </div>
        </div>
        
        <div class="mt-4">
            <h6>Информация о системе:</h6>
            <div class="row small text-muted">
                <div class="col-6">
                    <div>Версия системы:</div>
                    <div>Последний бэкап:</div>
                    <div>Всего бэкапов:</div>
                </div>
                <div class="col-6">
                    <div><strong>2.0.0</strong></div>
                    <div><strong>${appData.system.lastBackup ? new Date(appData.system.lastBackup).toLocaleDateString() : 'никогда'}</strong></div>
                    <div><strong>${backupHistory.length}</strong></div>
                </div>
            </div>
        </div>
        
        <div class="mt-3 p-3 bg-light rounded">
            <h6 class="mb-2">Состояние данных:</h6>
            <div class="progress mb-2" style="height: 8px;">
                <div class="progress-bar bg-success" style="width: 95%"></div>
            </div>
            <small class="text-muted">Целостность данных: отличная</small>
        </div>
    `;
}

function createBackup() {
    const backupData = {
        metadata: {
            version: '2.0.0',
            created: new Date().toISOString(),
            createdBy: currentUser ? currentUser.name : 'Неизвестный пользователь',
            comment: 'Полная резервная копия системы'
        },
        data: appData
    };
    
    // Обновляем время последнего бэкапа
    appData.system.lastBackup = new Date().toISOString();
    saveData();
    
    const dataStr = JSON.stringify(backupData, null, 2);
    downloadBackupFile(dataStr, 'full-backup');
    
    // Сохраняем в историю
    saveToBackupHistory('Полная резервная копия', dataStr.length);
    
    showAlert('Успех', 'Полная резервная копия создана и скачана', 'success');
    addNotification('success', 'Резервная копия создана', 'Создана полная резервная копия системы');
}

function createCustomBackup() {
    const comment = document.getElementById('backupComment').value.trim() || 'Выборочная резервная копия';
    const includeStudents = document.getElementById('backupStudents').checked;
    const includeSubjects = document.getElementById('backupSubjects').checked;
    const includeGrades = document.getElementById('backupGrades').checked;
    const includeUsers = document.getElementById('backupUsers').checked;
    const includeSettings = document.getElementById('backupSettings').checked;
    
    const backupData = {
        metadata: {
            version: '2.0.0',
            created: new Date().toISOString(),
            createdBy: currentUser ? currentUser.name : 'Неизвестный пользователь',
            comment: comment,
            included: {
                students: includeStudents,
                subjects: includeSubjects,
                grades: includeGrades,
                users: includeUsers,
                settings: includeSettings
            }
        },
        data: {
            students: includeStudents ? appData.students : [],
            subjects: includeSubjects ? appData.subjects : [],
            grades: includeGrades ? appData.grades : [],
            users: includeUsers ? appData.users : [],
            system: includeSettings ? appData.system : {}
        }
    };
    
    const dataStr = JSON.stringify(backupData, null, 2);
    const fileName = `selective-backup-${new Date().toISOString().split('T')[0]}`;
    
    downloadBackupFile(dataStr, fileName);
    
    // Сохраняем в историю
    saveToBackupHistory(comment, dataStr.length);
    
    showAlert('Успех', 'Выборочная резервная копия создана и скачана', 'success');
    addNotification('success', 'Резервная копия создана', `Создана резервная копия: ${comment}`);
}

function downloadBackupFile(dataStr, baseName) {
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${baseName}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
}

function saveToBackupHistory(comment, size) {
    const history = JSON.parse(localStorage.getItem('e-zachetka-backup-history') || '[]');
    
    history.unshift({
        id: Date.now(),
        timestamp: new Date().toISOString(),
        comment: comment,
        size: size,
        createdBy: currentUser ? currentUser.name : 'Неизвестный пользователь'
    });
    
    // Храним только последние 10 записей
    if (history.length > 10) {
        history.pop();
    }
    
    localStorage.setItem('e-zachetka-backup-history', JSON.stringify(history));
}

function restoreBackup() {
    const fileInput = document.getElementById('restoreFile');
    const file = fileInput.files[0];
    
    if (!file) {
        showAlert('Ошибка', 'Выберите файл резервной копии!', 'warning');
        return;
    }
    
    if (!confirm('ВНИМАНИЕ! Это действие перезапишет все текущие данные. Продолжить?')) {
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const backupData = JSON.parse(e.target.result);
            
            // Проверяем структуру файла
            if (!backupData.metadata || !backupData.data) {
                throw new Error('Неверный формат файла резервной копии');
            }
            
            // Восстанавливаем данные
            appData = backupData.data;
            appData.system.lastBackup = new Date().toISOString();
            
            saveData();
            
            // Очищаем файловый input
            fileInput.value = '';
            
            showAlert('Успех', 'Данные успешно восстановлены из резервной копии', 'success');
            addNotification('success', 'Данные восстановлены', 'Система восстановлена из резервной копии');
            
            // Перезагружаем интерфейс
            setTimeout(() => {
                location.reload();
            }, 2000);
            
        } catch (error) {
            console.error('Ошибка восстановления:', error);
            showAlert('Ошибка', 'Не удалось восстановить данные. Проверьте файл.', 'danger');
        }
    };
    reader.readAsText(file);
}

function showBackupHistory() {
    const history = JSON.parse(localStorage.getItem('e-zachetka-backup-history') || '[]');
    const content = document.getElementById('backupHistoryContent');
    
    if (history.length === 0) {
        content.innerHTML = `
            <div class="text-center py-4">
                <i class="bi bi-clock-history display-1 text-muted"></i>
                <h4 class="text-muted mt-3">История пуста</h4>
                <p class="text-muted">Здесь будет отображаться история резервного копирования</p>
            </div>
        `;
    } else {
        content.innerHTML = `
            <div class="table-responsive">
                <table class="table table-sm">
                    <thead>
                        <tr>
                            <th>Дата</th>
                            <th>Комментарий</th>
                            <th>Размер</th>
                            <th>Пользователь</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${history.map(backup => `
                            <tr>
                                <td>${new Date(backup.timestamp).toLocaleString('ru-RU')}</td>
                                <td>${backup.comment}</td>
                                <td>${(backup.size / 1024).toFixed(1)} KB</td>
                                <td>${backup.createdBy}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }
    
    const modal = new bootstrap.Modal(document.getElementById('backupHistoryModal'));
    modal.show();
}

function loadSettingsTab() {
    const container = document.getElementById('settingsTab');
    
    container.innerHTML = `
        <div class="row">
            <div class="col-12">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h2 class="h3 mb-0">
                        <i class="bi bi-sliders me-2 text-secondary"></i>Настройки системы
                    </h2>
                    <button class="btn btn-secondary" onclick="saveAllSettings()">
                        <i class="bi bi-check-circle me-1"></i>Сохранить все настройки
                    </button>
                </div>
            </div>
        </div>

        <div class="row">
            <div class="col-lg-4 mb-4">
                <div class="card shadow">
                    <div class="card-header bg-white">
                        <h5 class="mb-0">
                            <i class="bi bi-person me-2 text-primary"></i>Настройки профиля
                        </h5>
                    </div>
                    <div class="card-body">
                        <form id="profileSettingsForm">
                            <div class="mb-3">
                                <label for="profileName" class="form-label">ФИО</label>
                                <input type="text" class="form-control" id="profileName" 
                                       value="${currentUser ? currentUser.name : ''}">
                            </div>
                            <div class="mb-3">
                                <label for="profileLogin" class="form-label">Логин</label>
                                <input type="text" class="form-control" id="profileLogin" 
                                       value="${currentUser ? currentUser.username : ''}" readonly>
                                <div class="form-text">Логин нельзя изменить</div>
                            </div>
                            <div class="mb-3">
                                <label for="profilePassword" class="form-label">Новый пароль</label>
                                <input type="password" class="form-control" id="profilePassword" 
                                       placeholder="Оставьте пустым, чтобы не менять">
                            </div>
                            <div class="mb-3">
                                <label for="profilePasswordConfirm" class="form-label">Подтверждение пароля</label>
                                <input type="password" class="form-control" id="profilePasswordConfirm" 
                                       placeholder="Повторите новый пароль">
                            </div>
                        </form>
                    </div>
                </div>
                
                <div class="card shadow mt-4">
                    <div class="card-header bg-white">
                        <h5 class="mb-0">
                            <i class="bi bi-palette me-2 text-info"></i>Внешний вид
                        </h5>
                    </div>
                    <div class="card-body">
                        <div class="mb-3">
                            <label class="form-label">Тема оформления:</label>
                            <div class="d-grid gap-2">
                                <button type="button" class="btn btn-outline-dark active" onclick="changeTheme('light')">
                                    <i class="bi bi-sun me-2"></i>Светлая тема
                                </button>
                                <button type="button" class="btn btn-outline-light" onclick="changeTheme('dark')">
                                    <i class="bi bi-moon me-2"></i>Тёмная тема
                                </button>
                            </div>
                        </div>
                        
                        <div class="mb-3">
                            <label class="form-label">Плотность интерфейса:</label>
                            <select class="form-select" id="uiDensity">
                                <option value="comfortable">Комфортная</option>
                                <option value="compact">Компактная</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="col-lg-4 mb-4">
                <div class="card shadow">
                    <div class="card-header bg-white">
                        <h5 class="mb-0">
                            <i class="bi bi-bell me-2 text-warning"></i>Уведомления
                        </h5>
                    </div>
                    <div class="card-body">
                        <div class="mb-3">
                            <label class="form-label fw-bold">Типы уведомлений:</label>
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="settingsNotifyGrades" checked>
                                <label class="form-check-label" for="settingsNotifyGrades">
                                    Новые оценки и изменения
                                </label>
                            </div>
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="settingsNotifyDeadlines" checked>
                                <label class="form-check-label" for="settingsNotifyDeadlines">
                                    Напоминания о дедлайнах
                                </label>
                            </div>
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="settingsNotifySystem">
                                <label class="form-check-label" for="settingsNotifySystem">
                                    Системные уведомления
                                </label>
                            </div>
                        </div>
                        
                        <div class="mb-3">
                            <label for="notifySound" class="form-label">Звук уведомлений:</label>
                            <select class="form-select" id="notifySound">
                                <option value="default">По умолчанию</option>
                                <option value="none">Без звука</option>
                                <option value="chime">Мелодия</option>
                                <option value="bell">Колокольчик</option>
                            </select>
                        </div>
                        
                        <div class="mb-3">
                            <label class="form-check-label fw-bold">Показывать уведомления:</label>
                            <div class="form-check">
                                <input class="form-check-input" type="radio" name="notifyDisplay" id="notifyToast" checked>
                                <label class="form-check-label" for="notifyToast">
                                    Всплывающие сообщения
                                </label>
                            </div>
                            <div class="form-check">
                                <input class="form-check-input" type="radio" name="notifyDisplay" id="notifyBadge">
                                <label class="form-check-label" for="notifyBadge">
                                    Только бейджи
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="card shadow mt-4">
                    <div class="card-header bg-white">
                        <h5 class="mb-0">
                            <i class="bi bi-safe me-2 text-success"></i>Безопасность
                        </h5>
                    </div>
                    <div class="card-body">
                        <div class="mb-3">
                            <label class="form-check-label fw-bold">Настройки сессии:</label>
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="autoLogout">
                                <label class="form-check-label" for="autoLogout">
                                    Автоматический выход после 30 минут неактивности
                                </label>
                            </div>
                        </div>
                        
                        <div class="mb-3">
                            <label for="passwordStrength" class="form-label">Требования к паролю:</label>
                            <select class="form-select" id="passwordStrength">
                                <option value="low">Низкие (6+ символов)</option>
                                <option value="medium" selected>Средние (8+ символов, цифры)</option>
                                <option value="high">Высокие (10+ символов, цифры, спецсимволы)</option>
                            </select>
                        </div>
                        
                        <button class="btn btn-outline-warning w-100" onclick="showSessionHistory()">
                            <i class="bi bi-clock-history me-1"></i>История сессий
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="col-lg-4 mb-4">
                <div class="card shadow">
                    <div class="card-header bg-white">
                        <h5 class="mb-0">
                            <i class="bi bi-gear me-2 text-secondary"></i>Системные настройки
                        </h5>
                    </div>
                    <div class="card-body">
                        <div class="mb-3">
                            <label for="language" class="form-label">Язык интерфейса:</label>
                            <select class="form-select" id="language">
                                <option value="ru" selected>Русский</option>
                                <option value="en">English</option>
                            </select>
                        </div>
                        
                        <div class="mb-3">
                            <label for="dateFormat" class="form-label">Формат даты:</label>
                            <select class="form-select" id="dateFormat">
                                <option value="ru-RU" selected>ДД.ММ.ГГГГ (русский)</option>
                                <option value="en-US">ММ/ДД/ГГГГ (международный)</option>
                            </select>
                        </div>
                        
                        <div class="mb-3">
                            <label for="timeFormat" class="form-label">Формат времени:</label>
                            <select class="form-select" id="timeFormat">
                                <option value="24" selected>24-часовой</option>
                                <option value="12">12-часовой</option>
                            </select>
                        </div>
                        
                        <div class="mb-3">
                            <label class="form-check-label fw-bold">Экспорт данных:</label>
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="exportIncludeMeta" checked>
                                <label class="form-check-label" for="exportIncludeMeta">
                                    Включать метаданные
                                </label>
                            </div>
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="exportCompress">
                                <label class="form-check-label" for="exportCompress">
                                    Сжимать файлы экспорта
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="card shadow mt-4">
                    <div class="card-header bg-white">
                        <h5 class="mb-0">
                            <i class="bi bi-tools me-2 text-danger"></i>Опасная зона
                        </h5>
                    </div>
                    <div class="card-body">
                        <div class="mb-3">
                            <button class="btn btn-outline-danger w-100 mb-2" onclick="clearAllData()">
                                <i class="bi bi-eraser me-1"></i>Очистить все данные
                            </button>
                            <small class="text-muted">Удаляет всех студентов, предметы и оценки</small>
                        </div>
                        
                        <div class="mb-3">
                            <button class="btn btn-outline-warning w-100 mb-2" onclick="resetSettings()">
                                <i class="bi bi-arrow-counterclockwise me-1"></i>Сбросить настройки
                            </button>
                            <small class="text-muted">Восстанавливает настройки по умолчанию</small>
                        </div>
                        
                        <div class="mb-3">
                            <button class="btn btn-outline-info w-100" onclick="exportSystemLogs()">
                                <i class="bi bi-file-text me-1"></i>Экспорт логов системы
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Модальное окно истории сессий -->
        <div class="modal fade" id="sessionHistoryModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">История сессий</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div id="sessionHistoryContent"></div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Загружаем текущие настройки в форму
    setTimeout(() => {
        loadCurrentSettings();
    }, 500);
}

function loadCurrentSettings() {
    // Загружаем настройки уведомлений
    document.getElementById('settingsNotifyGrades').checked = notificationSettings.enableGradeNotifications;
    document.getElementById('settingsNotifyDeadlines').checked = notificationSettings.enableDeadlineNotifications;
    document.getElementById('settingsNotifySystem').checked = true;
    
    // Загружаем настройки экспорта
    document.getElementById('exportIncludeMeta').checked = exportSettings.includeStatistics;
    document.getElementById('exportCompress').checked = false;
    
    // Загружаем другие настройки из localStorage
    const theme = localStorage.getItem('e-zachetka-theme') || 'light';
    changeTheme(theme, false);
    
    const uiDensity = localStorage.getItem('e-zachetka-ui-density') || 'comfortable';
    document.getElementById('uiDensity').value = uiDensity;
    
    const language = localStorage.getItem('e-zachetka-language') || 'ru';
    document.getElementById('language').value = language;
    
    const dateFormat = localStorage.getItem('e-zachetka-date-format') || 'ru-RU';
    document.getElementById('dateFormat').value = dateFormat;
    
    const timeFormat = localStorage.getItem('e-zachetka-time-format') || '24';
    document.getElementById('timeFormat').value = timeFormat;
}

function saveAllSettings() {
    // Сохраняем настройки профиля
    if (currentUser) {
        const newName = document.getElementById('profileName').value.trim();
        const newPassword = document.getElementById('profilePassword').value;
        const confirmPassword = document.getElementById('profilePasswordConfirm').value;
        
        if (newName && newName !== currentUser.name) {
            currentUser.name = newName;
            document.getElementById('currentUserNav').textContent = newName;
        }
        
        if (newPassword) {
            if (newPassword !== confirmPassword) {
                showAlert('Ошибка', 'Пароли не совпадают!', 'danger');
                return;
            }
            if (newPassword.length < 6) {
                showAlert('Ошибка', 'Пароль должен содержать минимум 6 символов', 'danger');
                return;
            }
            currentUser.password = newPassword;
        }
    }
    
    // Сохраняем настройки уведомлений
    notificationSettings.enableGradeNotifications = document.getElementById('settingsNotifyGrades').checked;
    notificationSettings.enableDeadlineNotifications = document.getElementById('settingsNotifyDeadlines').checked;
    localStorage.setItem('e-zachetka-notification-settings', JSON.stringify(notificationSettings));
    
    // Сохраняем другие настройки
    const uiDensity = document.getElementById('uiDensity').value;
    localStorage.setItem('e-zachetka-ui-density', uiDensity);
    
    const language = document.getElementById('language').value;
    localStorage.setItem('e-zachetka-language', language);
    
    const dateFormat = document.getElementById('dateFormat').value;
    localStorage.setItem('e-zachetka-date-format', dateFormat);
    
    const timeFormat = document.getElementById('timeFormat').value;
    localStorage.setItem('e-zachetka-time-format', timeFormat);
    
    // Сохраняем настройки экспорта
    exportSettings.includeStatistics = document.getElementById('exportIncludeMeta').checked;
    localStorage.setItem('e-zachetka-export-settings', JSON.stringify(exportSettings));
    
    // Сохраняем данные
    saveData();
    
    showAlert('Успех', 'Все настройки сохранены', 'success');
    addNotification('success', 'Настройки обновлены', 'Настройки системы успешно сохранены');
}

function changeTheme(theme, save = true) {
    const html = document.documentElement;
    const lightBtn = document.querySelector('button[onclick="changeTheme(\'light\')"]');
    const darkBtn = document.querySelector('button[onclick="changeTheme(\'dark\')"]');
    
    // Сбрасываем активные классы
    if (lightBtn) lightBtn.classList.remove('active');
    if (darkBtn) darkBtn.classList.remove('active');
    
    if (theme === 'dark') {
        html.setAttribute('data-bs-theme', 'dark');
        if (darkBtn) darkBtn.classList.add('active');
    } else {
        html.setAttribute('data-bs-theme', 'light');
        if (lightBtn) lightBtn.classList.add('active');
    }
    
    if (save) {
        localStorage.setItem('e-zachetka-theme', theme);
    }
}

function showSessionHistory() {
    const content = document.getElementById('sessionHistoryContent');
    const sessionHistory = JSON.parse(localStorage.getItem('e-zachetka-session-history') || '[]');
    
    if (sessionHistory.length === 0) {
        content.innerHTML = `
            <div class="text-center py-3">
                <i class="bi bi-clock-history text-muted display-6"></i>
                <p class="text-muted mt-2">История сессий пуста</p>
            </div>
        `;
    } else {
        content.innerHTML = `
            <div class="list-group">
                ${sessionHistory.slice(0, 10).map(session => `
                    <div class="list-group-item">
                        <div class="d-flex w-100 justify-content-between">
                            <h6 class="mb-1">${session.action}</h6>
                            <small class="text-muted">${new Date(session.timestamp).toLocaleString('ru-RU')}</small>
                        </div>
                        <p class="mb-1 small">${session.details}</p>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    const modal = new bootstrap.Modal(document.getElementById('sessionHistoryModal'));
    modal.show();
}

function clearAllData() {
    if (!confirm('ВНИМАНИЕ! Это действие удалит ВСЕ данные системы. Это действие нельзя отменить. Продолжить?')) {
        return;
    }
    
    if (!confirm('Вы уверены? Будут удалены все студенты, предметы, оценки и настройки.')) {
        return;
    }
    
    // Сохраняем только пользователей и системные настройки
    const users = appData.users;
    const system = appData.system;
    
    appData = {
        students: [],
        subjects: [],
        grades: [],
        users: users,
        system: {
            ...system,
            totalLogins: system.totalLogins,
            lastBackup: new Date().toISOString()
        }
    };
    
    // Очищаем другие данные
    notifications = [];
    calendarEvents = [];
    
    saveData();
    saveNotifications();
    saveCalendarEvents();
    
    showAlert('Успех', 'Все данные очищены', 'success');
    addNotification('warning', 'Данные очищены', 'Все студенты, предметы и оценки удалены из системы');
    
    // Перезагружаем интерфейс
    setTimeout(() => {
        location.reload();
    }, 2000);
}

function resetSettings() {
    if (!confirm('Сбросить все настройки к значениям по умолчанию?')) {
        return;
    }
    
    // Сбрасываем настройки
    localStorage.removeItem('e-zachetka-notification-settings');
    localStorage.removeItem('e-zachetka-export-settings');
    localStorage.removeItem('e-zachetka-theme');
    localStorage.removeItem('e-zachetka-ui-density');
    localStorage.removeItem('e-zachetka-language');
    localStorage.removeItem('e-zachetka-date-format');
    localStorage.removeItem('e-zachetka-time-format');
    
    // Восстанавливаем настройки по умолчанию
    notificationSettings = {
        enableDeadlineNotifications: true,
        enableGradeNotifications: true,
        enableDebtNotifications: true,
        deadlineDays: 7
    };
    
    exportSettings = {
        includePersonalData: true,
        includeGrades: true,
        includeStatistics: true,
        dateFormat: 'ru-RU',
        fileFormat: 'xlsx'
    };
    
    showAlert('Успех', 'Настройки сброшены к значениям по умолчанию', 'success');
    addNotification('info', 'Настройки сброшены', 'Все настройки восстановлены к значениям по умолчанию');
    
    // Перезагружаем настройки
    setTimeout(() => {
        loadCurrentSettings();
    }, 1000);
}

function exportSystemLogs() {
    const logs = {
        metadata: {
            exported: new Date().toISOString(),
            user: currentUser ? currentUser.name : 'Неизвестный пользователь'
        },
        statistics: calculateStatistics(),
        system: appData.system,
        settings: {
            notifications: notificationSettings,
            export: exportSettings
        }
    };
    
    const dataStr = JSON.stringify(logs, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `system-logs-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    
    showAlert('Успех', 'Логи системы экспортированы', 'info');
}

// ==============================================
// СИСТЕМА ОТЧЁТОВ И ЭКСПОРТА
// ==============================================

function prepareGradeSheetData() {
    const stats = calculateStatistics();
    
    let html = `
        <div class="report-header text-center mb-4">
            <h2 class="report-title">ВЕДОМОСТЬ УСПЕВАЕМОСТИ</h2>
            <p class="report-subtitle">Техникум информационных технологий</p>
            <div class="report-meta">
                <div>Дата формирования: ${new Date().toLocaleDateString('ru-RU')}</div>
                <div>Преподаватель: ${currentUser ? currentUser.name : 'Не указан'}</div>
            </div>
        </div>
        
        <div class="report-stats mb-4">
            <div class="row text-center">
                <div class="col-3">
                    <div class="report-stat">
                        <div class="report-stat-number">${stats.totalStudents}</div>
                        <div class="report-stat-label">Студентов</div>
                    </div>
                </div>
                <div class="col-3">
                    <div class="report-stat">
                        <div class="report-stat-number">${stats.totalSubjects}</div>
                        <div class="report-stat-label">Предметов</div>
                    </div>
                </div>
                <div class="col-3">
                    <div class="report-stat">
                        <div class="report-stat-number">${stats.totalGrades}</div>
                        <div class="report-stat-label">Оценок</div>
                    </div>
                </div>
                <div class="col-3">
                    <div class="report-stat">
                        <div class="report-stat-number">${stats.averageGrade}</div>
                        <div class="report-stat-label">Средний балл</div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Таблица по группам
    const groups = [...new Set(appData.students.map(s => s.group))];
    
    groups.forEach(group => {
        const groupStudents = appData.students.filter(s => s.group === group);
        
        html += `
            <h4 class="mt-4 mb-3">Группа: ${group}</h4>
            <div class="table-responsive">
                <table class="table table-bordered report-table">
                    <thead class="table-light">
                        <tr>
                            <th>ФИО студента</th>
                            ${appData.subjects.map(subject => 
                                `<th class="text-center">${subject.name}</th>`
                            ).join('')}
                            <th class="text-center">Средний балл</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        groupStudents.forEach(student => {
            const studentGrades = appData.grades.filter(g => g.studentId === student.id);
            const numericGrades = studentGrades
                .map(g => parseInt(g.grade))
                .filter(g => !isNaN(g));
            const avgScore = numericGrades.length > 0 ? 
                (numericGrades.reduce((a, b) => a + b, 0) / numericGrades.length).toFixed(2) : '-';
            
            html += `
                <tr>
                    <td><strong>${student.name}</strong></td>
            `;
            
            // Оценки по предметам
            appData.subjects.forEach(subject => {
                const grade = studentGrades.find(g => g.subjectId === subject.id);
                const gradeValue = grade ? grade.grade : '';
                const gradeClass = getGradeClass(gradeValue);
                
                html += `<td class="text-center ${gradeClass}">${gradeValue}</td>`;
            });
            
            html += `<td class="text-center"><strong>${avgScore}</strong></td>`;
            html += `</tr>`;
        });
        
        html += `
                    </tbody>
                </table>
            </div>
        `;
    });
    
    return html;
}

function prepareStudentReportData(studentId) {
    const student = appData.students.find(s => s.id === studentId);
    if (!student) return '<p>Студент не найден</p>';
    
    const studentGrades = appData.grades.filter(g => g.studentId === studentId);
    const stats = calculateStudentStatistics(studentId);
    
    let html = `
        <div class="report-header text-center mb-4">
            <h2 class="report-title">ИНДИВИДУАЛЬНАЯ ВЕДОМОСТЬ УСПЕВАЕМОСТИ</h2>
            <p class="report-subtitle">Техникум информационных технологий</p>
            <div class="report-meta">
                <div>Студент: <strong>${student.name}</strong></div>
                <div>Группа: <strong>${student.group}</strong></div>
                <div>Дата формирования: ${new Date().toLocaleDateString('ru-RU')}</div>
            </div>
        </div>
        
        <div class="report-stats mb-4">
            <div class="row text-center">
                <div class="col-3">
                    <div class="report-stat">
                        <div class="report-stat-number">${stats.totalGrades}</div>
                        <div class="report-stat-label">Всего оценок</div>
                    </div>
                </div>
                <div class="col-3">
                    <div class="report-stat">
                        <div class="report-stat-number">${stats.averageGrade}</div>
                        <div class="report-stat-label">Средний балл</div>
                    </div>
                </div>
                <div class="col-3">
                    <div class="report-stat">
                        <div class="report-stat-number">${stats.excellentCount}</div>
                        <div class="report-stat-label">Отлично</div>
                    </div>
                </div>
                <div class="col-3">
                    <div class="report-stat">
                        <div class="report-stat-number">${stats.unsatisfactoryCount}</div>
                        <div class="report-stat-label">Неудовл.</div>
                    </div>
                </div>
            </div>
        </div>
        
        <h4 class="mb-3">Оценки по предметам</h4>
        <div class="table-responsive">
            <table class="table table-bordered report-table">
                <thead class="table-light">
                    <tr>
                        <th>Предмет</th>
                        <th>Преподаватель</th>
                        <th class="text-center">Оценка</th>
                        <th class="text-center">Дата</th>
                        <th class="text-center">Статус</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    appData.subjects.forEach(subject => {
        const grade = studentGrades.find(g => g.subjectId === subject.id);
        const gradeValue = grade ? grade.grade : '-';
        const gradeClass = getGradeClass(gradeValue);
        const status = gradeValue === '-' ? 
            '<span class="badge bg-danger">Не сдано</span>' : 
            (gradeValue === '5' || gradeValue === 'зачёт' ? 
                '<span class="badge bg-success">Сдано</span>' : 
                '<span class="badge bg-warning">Сдано</span>');
        
        html += `
            <tr>
                <td>${subject.name}</td>
                <td>${subject.teacherName}</td>
                <td class="text-center ${gradeClass}"><strong>${gradeValue}</strong></td>
                <td class="text-center">${grade ? grade.date : '-'}</td>
                <td class="text-center">${status}</td>
            </tr>
        `;
    });
    
    html += `
                </tbody>
            </table>
        </div>
        
        <div class="row mt-4">
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header">
                        <h5 class="card-title mb-0">Статистика оценок</h5>
                    </div>
                    <div class="card-body">
                        <div class="mb-2">
                            <span class="badge bg-success me-2">Отлично</span>
                            <span class="float-end">${stats.excellentCount}</span>
                        </div>
                        <div class="mb-2">
                            <span class="badge bg-info me-2">Хорошо</span>
                            <span class="float-end">${stats.goodCount}</span>
                        </div>
                        <div class="mb-2">
                            <span class="badge bg-warning me-2">Удовлетворительно</span>
                            <span class="float-end">${stats.satisfactoryCount}</span>
                        </div>
                        <div class="mb-0">
                            <span class="badge bg-danger me-2">Неудовлетворительно</span>
                            <span class="float-end">${stats.unsatisfactoryCount}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header">
                        <h5 class="card-title mb-0">Прогресс обучения</h5>
                    </div>
                    <div class="card-body">
                        <div class="mb-2">
                            <small class="text-muted">Пройдено предметов:</small>
                            <div class="float-end">
                                <strong>${stats.totalGrades}</strong> из <strong>${appData.subjects.length}</strong>
                            </div>
                        </div>
                        <div class="progress mb-3" style="height: 10px;">
                            <div class="progress-bar bg-success" 
                                 style="width: ${(stats.totalGrades / appData.subjects.length) * 100}%">
                            </div>
                        </div>
                        <div class="text-center">
                            <small class="text-muted">
                                ${((stats.totalGrades / appData.subjects.length) * 100).toFixed(1)}% завершено
                            </small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    return html;
}

function calculateStudentStatistics(studentId) {
    const studentGrades = appData.grades.filter(g => g.studentId === studentId);
    
    const excellentCount = studentGrades.filter(g => g.grade === '5' || g.grade === 'зачёт').length;
    const goodCount = studentGrades.filter(g => g.grade === '4').length;
    const satisfactoryCount = studentGrades.filter(g => g.grade === '3').length;
    const unsatisfactoryCount = studentGrades.filter(g => g.grade === '2' || g.grade === 'незачёт').length;
    
    const numericGrades = studentGrades
        .map(g => parseInt(g.grade))
        .filter(g => !isNaN(g));
    const averageGrade = numericGrades.length > 0 ? 
        (numericGrades.reduce((a, b) => a + b, 0) / numericGrades.length).toFixed(2) : '0.00';
    
    return {
        totalGrades: studentGrades.length,
        averageGrade: averageGrade,
        excellentCount: excellentCount,
        goodCount: goodCount,
        satisfactoryCount: satisfactoryCount,
        unsatisfactoryCount: unsatisfactoryCount
    };
}

function showReportPreview(data, type) {
    const modalHTML = `
        <div class="modal fade" id="reportPreviewModal" tabindex="-1">
            <div class="modal-dialog modal-xl">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="bi bi-eye me-2"></i>Предпросмотр отчёта
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="report-preview-container" style="max-height: 70vh; overflow-y: auto;">
                            ${data}
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                            <i class="bi bi-x me-1"></i>Закрыть
                        </button>
                        <button type="button" class="btn btn-success" onclick="printReport()">
                            <i class="bi bi-printer me-1"></i>Печать
                        </button>
                        <button type="button" class="btn btn-primary" onclick="downloadReport('${type}')">
                            <i class="bi bi-download me-1"></i>Скачать PDF
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Удаляем старый модал если есть
    const oldModal = document.getElementById('reportPreviewModal');
    if (oldModal) {
        oldModal.remove();
    }
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const modal = new bootstrap.Modal(document.getElementById('reportPreviewModal'));
    modal.show();
}

function printReport() {
    const previewContent = document.querySelector('.report-preview-container').innerHTML;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Печать отчёта</title>
            <meta charset="utf-8">
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    margin: 20px; 
                    font-size: 12px;
                }
                .report-table { 
                    width: 100%; 
                    border-collapse: collapse; 
                    margin: 10px 0; 
                    font-size: 11px;
                }
                .report-table th, .report-table td { 
                    border: 1px solid #000; 
                    padding: 6px 4px; 
                    text-align: left; 
                }
                .report-table th { 
                    background-color: #f8f9fa; 
                    font-weight: bold;
                }
                .report-header { 
                    text-align: center; 
                    margin-bottom: 20px; 
                    border-bottom: 2px solid #333;
                    padding-bottom: 15px;
                }
                .report-title { 
                    font-size: 16px; 
                    font-weight: bold; 
                    margin-bottom: 5px;
                }
                .report-subtitle {
                    font-size: 12px;
                    color: #666;
                    margin-bottom: 10px;
                }
                .report-meta {
                    font-size: 10px;
                    color: #888;
                }
                .report-stats {
                    margin: 15px 0;
                }
                .report-stat {
                    text-align: center;
                    padding: 10px;
                }
                .report-stat-number {
                    font-size: 18px;
                    font-weight: bold;
                    color: #007bff;
                }
                .report-stat-label {
                    font-size: 10px;
                    color: #666;
                }
                @media print {
                    body { margin: 0; }
                    .btn { display: none !important; }
                }
                .bg-success { background-color: #d4edda !important; }
                .bg-info { background-color: #d1ecf1 !important; }
                .bg-warning { background-color: #fff3cd !important; }
                .bg-danger { background-color: #f8d7da !important; }
                .table-light { background-color: #f8f9fa !important; }
            </style>
        </head>
        <body>
            ${previewContent}
            <div class="text-center mt-4 text-muted" style="font-size: 10px;">
                Отчёт сгенерирован: ${new Date().toLocaleString('ru-RU')}
            </div>
        </body>
        </html>
    `);
    printWindow.document.close();
    
    // Даем время на загрузку стилей
    setTimeout(() => {
        printWindow.print();
        // Не закрываем окно сразу, даем пользователю возможность отменить печать
    }, 500);
}

function downloadReport(type) {
    const previewContent = document.querySelector('.report-preview-container').innerHTML;
    
    // Создаем HTML файл для скачивания
    const fullHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Отчёт по успеваемости</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    margin: 25px; 
                    font-size: 14px;
                }
                .report-table { 
                    width: 100%; 
                    border-collapse: collapse; 
                    margin: 15px 0; 
                }
                .report-table th, .report-table td { 
                    border: 1px solid #dee2e6; 
                    padding: 8px 6px; 
                    text-align: left; 
                }
                .report-table th { 
                    background-color: #f8f9fa; 
                    font-weight: bold;
                }
                .report-header { 
                    text-align: center; 
                    margin-bottom: 30px; 
                    border-bottom: 2px solid #333;
                    padding-bottom: 20px;
                }
                .report-title { 
                    font-size: 24px; 
                    font-weight: bold; 
                    margin-bottom: 10px;
                }
                .report-stats {
                    margin: 20px 0;
                }
                .bg-success { background-color: #d4edda !important; }
                .bg-info { background-color: #d1ecf1 !important; }
                .bg-warning { background-color: #fff3cd !important; }
                .bg-danger { background-color: #f8d7da !important; }
            </style>
        </head>
        <body>
            ${previewContent}
            <div class="text-center mt-5 text-muted" style="font-size: 12px;">
                Отчёт сгенерирован в системе "Электронная зачётка" - ${new Date().toLocaleString('ru-RU')}
            </div>
        </body>
        </html>
    `;
    
    const blob = new Blob([fullHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    
    const fileName = type === 'gradeSheet' ? 
        `ведомость_успеваемости_${new Date().toISOString().split('T')[0]}.html` :
        `индивидуальная_ведомость_${new Date().toISOString().split('T')[0]}.html`;
    
    a.href = url;
    a.download = fileName;
    a.click();
    
    URL.revokeObjectURL(url);
    
    // Показываем уведомление
    const modal = bootstrap.Modal.getInstance(document.getElementById('reportPreviewModal'));
    modal.hide();
    
    showAlert('Успех', `Отчёт сохранён как "${fileName}"`, 'success');
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    console.log('Электронная зачётка загружена!');
    
    // Автоматически заполняем тестовые данные для демонстрации
    document.getElementById('loginUsername').value = 'prepod';
    document.getElementById('loginPassword').value = '123456';
});