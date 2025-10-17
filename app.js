// Электронная зачётка - Расширенная версия
class EZachetkaApp {
    constructor() {
        this.currentUser = null;
        this.currentTab = 'dashboard';
        this.appData = this.loadData();
        this.init();
    }

    init() {
        this.setupDefaultUsers();
        this.checkAuthState();
        this.updateNotificationBadge();
        console.log('Электронная зачётка инициализирована!');
    }

    // Проверка состояния авторизации
    checkAuthState() {
        const savedUser = localStorage.getItem('e-zachetka-currentUser');
        if (savedUser) {
            try {
                this.currentUser = JSON.parse(savedUser);
                this.showMainApp();
            } catch (error) {
                console.error('Ошибка восстановления сессии:', error);
                this.clearAuthState();
            }
        }
    }

    // Показать основное приложение
    showMainApp() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('mainApp').style.display = 'block';
    
    // Обновляем навигацию в зависимости от роли
    this.updateNavigationForRole();
    
    document.getElementById('currentUserNav').textContent = this.currentUser.name;
    document.getElementById('currentRoleNav').textContent = this.getRoleDisplayName(this.currentUser.role);
    document.getElementById('currentUserEmail').textContent = this.currentUser.username;
    
    this.loadDashboard();
    this.showTab('dashboard');
    }

    // Сохранить состояние авторизации
    saveAuthState() {
        if (this.currentUser) {
            localStorage.setItem('e-zachetka-currentUser', JSON.stringify(this.currentUser));
        }
    }

    // Очистить состояние авторизации
    clearAuthState() {
        localStorage.removeItem('e-zachetka-currentUser');
        this.currentUser = null;
    }

    // Система хранения данных
    loadData() {
        try {
            const saved = localStorage.getItem('e-zachetka-data');
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
        }
        
        return {
            students: [],
            subjects: [],
            grades: [],
            users: [],
            system: { totalLogins: 0, created: new Date().toISOString() }
        };
    }

    saveData() {
        try {
            localStorage.setItem('e-zachetka-data', JSON.stringify(this.appData));
            return true;
        } catch (error) {
            console.error('Ошибка сохранения данных:', error);
            this.showAlert('Ошибка', 'Не удалось сохранить данные', 'danger');
            return false;
        }
    }

    setupDefaultUsers() {
    if (this.appData.users.length === 0) {
        this.appData.users = [
            {
                id: this.generateId(),
                username: 'prepod',
                password: '123456',
                name: 'Иванова Мария Петровна',
                role: 'teacher', // ← ПРЕПОДАВАТЕЛЬ
                subjects: ['Математика', 'Физика'],
                disabled: false,
                createdAt: new Date().toISOString()
            },
            {
                id: this.generateId(),
                username: 'admin',
                password: 'admin123',
                name: 'Администратор Системы',
                role: 'admin', // ← АДМИНИСТРАТОР
                subjects: [],
                disabled: false,
                createdAt: new Date().toISOString()
            },
            {
                id: this.generateId(), 
                username: 'student1',
                password: '123456',
                name: 'Петров Иван Сергеевич',
                role: 'student', // ← СТУДЕНТ
                studentId: null,
                group: 'ИТ-21',
                disabled: false,
                createdAt: new Date().toISOString()
            },
            {
                id: this.generateId(), 
                username: 'student2',
                password: '123456',
                name: 'Сидорова Анна Владимировна',
                role: 'student', // ← СТУДЕНТ
                studentId: null,
                group: 'ИТ-21',
                disabled: false,
                createdAt: new Date().toISOString()
            },
            {
                id: this.generateId(), 
                username: 'student3',
                password: '123456',
                name: 'Козлов Дмитрий Александрович',
                role: 'student', // ← СТУДЕНТ
                studentId: null,
                group: 'ИТ-22',
                disabled: false,
                createdAt: new Date().toISOString()
            }
        ];
        this.saveData();
    }
    }

    generateId() {
        return Date.now() + Math.random().toString(36).substr(2, 9);
    }

    showAlert(title, message, type = 'info') {
        try {
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
        } catch (error) {
            console.error('Ошибка показа уведомления:', error);
        }
    }

    // Система авторизации
    login(username, password) {
    console.log('Метод login вызван с:', username, password);
    
    if (!username || !password) {
        this.showAlert('Ошибка', 'Заполните все поля!', 'warning');
        return false;
    }

    // Ищем пользователя по логину и паролю (без проверки роли)
    const user = this.appData.users.find(u => 
        u.username === username && 
        u.password === password &&
        !u.disabled
    );

    console.log('Найден пользователь:', user);

    if (user) {
        // Записываем время входа
        user.lastLogin = new Date().toISOString();
        
        // Для студента находим соответствующую запись в students
        if (user.role === 'student') {
    console.log('Обработка студента:', user.name);
    
    // Ищем или создаём запись студента
    let studentRecord = this.appData.students.find(s => 
        s.name === user.name
    );
    
    if (!studentRecord) {
        console.log('Создаём запись студента в базе');
        studentRecord = {
            id: this.generateId(),
            name: user.name,
            group: user.group || 'Не указана',
            createdAt: new Date().toISOString()
        };
        this.appData.students.push(studentRecord);
        this.saveData();
        console.log('Создана запись студента:', studentRecord);
    }
    
    user.studentId = studentRecord.id;
    console.log('Student ID установлен:', user.studentId);
    }
        
        this.currentUser = user;
        this.appData.system.totalLogins++;
        this.saveData();
        this.saveAuthState();
        this.showMainApp();
        console.log('Вход успешен, пользователь:', this.currentUser);
        return true;
    }

    this.showAlert('Ошибка входа', 'Неверный логин или пароль!', 'danger');
    return false;
    }

    logout() {
        this.clearAuthState(); // Очищаем авторизацию
        this.currentUser = null;
        return true;
    }

    // Система вкладок
    showTab(tabName) {
        try {
            document.querySelectorAll('.tab-content').forEach(tab => {
                tab.style.display = 'none';
            });
            
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
            });
            
            const targetTab = document.getElementById(tabName + 'Tab');
            if (targetTab) {
                targetTab.style.display = 'block';
            }
            
            const activeLink = document.querySelector(`[onclick="showTab('${tabName}')"]`);
            if (activeLink) {
                activeLink.classList.add('active');
            }
            
            this.currentTab = tabName;
            this.loadTabContent(tabName);
        } catch (error) {
            console.error('Ошибка переключения вкладки:', error);
        }
    }

    loadTabContent(tabName) {
        try {
            switch(tabName) {
                case 'dashboard':
                    this.loadDashboard();
                    break;
                case 'students':
                    this.loadStudentsTab();
                    break;
                case 'subjects':
                    this.loadSubjectsTab();
                    break;
                case 'grades':
                    this.loadGradesTab();
                    break;
                case 'attendance':
                    this.loadAttendanceTab();
                    break;
                case 'calendar': 
                    this.loadCalendarTab();
                    break;
                case 'reports': 
                    this.loadReportsTab();
                    break;
                case 'users': 
                    this.loadUsersTab();
                    break;
                case 'mygrades': 
                    this.loadMyGradesTab();
                    break;
                case 'myattendance':
                    this.loadMyAttendanceTab();
                    break;
                case 'notifications':
                    this.loadNotificationsTab();
                    break;
                case 'groups':
                    this.loadGroupsTab();
                    break;
                case 'students-management':
                    this.loadStudentsManagementTab();
                    break;
                case 'teachers-management':
                    this.loadTeachersManagementTab();
                    break;
                default:
                    const container = document.getElementById(tabName + 'Tab');
                    if (container) {
                        container.innerHTML = this.getDevelopmentMessage();
                    }
            }
        } catch (error) {
            console.error(`Ошибка загрузки вкладки ${tabName}:`, error);
            this.showAlert('Ошибка', 'Не удалось загрузить раздел', 'danger');
        }
    }

    getDevelopmentMessage() {
        return `
            <div class="text-center py-5">
                <i class="bi bi-tools display-1 text-muted"></i>
                <h4 class="text-muted mt-3">Раздел в разработке</h4>
                <p class="text-muted">Этот функционал будет доступен в следующем обновлении</p>
            </div>
        `;
    }

    // ДАШБОРД
    loadDashboard() {
    try {
        const stats = this.calculateStatistics();
        
        if (document.getElementById('statStudents')) {
            // Для студентов показываем только их статистику
            if (this.currentUser.role === 'student') {
                const studentStats = this.getStudentStatistics(this.currentUser.studentId);
                const studentSubjectsCount = new Set(
                    this.appData.grades
                        .filter(g => g.studentId === this.currentUser.studentId)
                        .map(g => g.subjectId)
                ).size;
                
                document.getElementById('statStudents').textContent = '1'; // Сам студент
                document.getElementById('statSubjects').textContent = studentSubjectsCount;
                document.getElementById('statGrades').textContent = studentStats.totalGrades;
                document.getElementById('statAverage').textContent = studentStats.averageGrade;
                
                // ОБНОВЛЯЕМ ЗАГОЛОВКИ ДЛЯ СТУДЕНТА
                document.querySelector('.card.border-start-border-primary .text-xs').textContent = 'Мой статус';
                document.querySelector('.card.border-start-border-success .text-xs').textContent = 'Изучаю предметов';
                document.querySelector('.card.border-start-border-info .text-xs').textContent = 'Мои оценки';
                document.querySelector('.card.border-start-border-warning .text-xs').textContent = 'Мой средний балл';
                
            } else {
                // Для преподавателей и админов - полная статистика
                document.getElementById('statStudents').textContent = stats.totalStudents;
                document.getElementById('statSubjects').textContent = stats.totalSubjects;
                document.getElementById('statGrades').textContent = stats.totalGrades;
                document.getElementById('statAverage').textContent = stats.averageGrade;
                
                // ВОЗВРАЩАЕМ СТАНДАРТНЫЕ ЗАГОЛОВКИ
                document.querySelector('.card.border-start-border-primary .text-xs').textContent = 'Студентов';
                document.querySelector('.card.border-start-border-success .text-xs').textContent = 'Предметов';
                document.querySelector('.card.border-start-border-info .text-xs').textContent = 'Оценок';
                document.querySelector('.card.border-start-border-warning .text-xs').textContent = 'Средний балл';
            }
            
            document.getElementById('currentDate').textContent = new Date().toLocaleDateString('ru-RU', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }

        // ОБНОВЛЯЕМ БЫСТРЫЕ ДЕЙСТВИЯ
        this.loadQuickActions();
        this.loadRecentNotifications();
        this.loadUpcomingEvents();
    } catch (error) {
        console.error('Ошибка загрузки дашборда:', error);
    }
}

// ДОБАВЬ этот новый метод для быстрых действий:
loadDashboard() {
    try {
        const stats = this.calculateStatistics();
        const isStudent = this.currentUser.role === 'student';
        
        // Для студентов показываем только их статистику
        const studentStats = isStudent ? this.getStudentStatistics(this.currentUser.studentId) : null;
        const studentSubjectsCount = isStudent ? new Set(
            this.appData.grades
                .filter(g => g.studentId === this.currentUser.studentId)
                .map(g => g.subjectId)
        ).size : 0;

        const dashboardHTML = `
            <div class="row">
                <div class="col-12 mb-4">
                    <div class="d-flex justify-content-between align-items-center">
                        <h2 class="h3 mb-0">
                            <i class="bi bi-speedometer2 me-2 text-primary"></i>
                            ${isStudent ? 'Моя зачётная книжка' : 'Главная панель'}
                        </h2>
                        <div class="text-muted" id="currentDate">${new Date().toLocaleDateString('ru-RU', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}</div>
                    </div>
                </div>
            </div>

            <!-- Статистика -->
            <div class="row mb-4">
                <div class="col-xl-3 col-md-6 mb-4">
                    <div class="card border-start border-primary border-4 shadow h-100 py-2">
                        <div class="card-body">
                            <div class="row no-gutters align-items-center">
                                <div class="col me-2">
                                    <div class="text-xs fw-bold text-primary text-uppercase mb-1">
                                        ${isStudent ? 'Мой статус' : 'Студентов'}
                                    </div>
                                    <div class="h5 mb-0 fw-bold text-gray-800">
                                        ${isStudent ? '1' : stats.totalStudents}
                                    </div>
                                </div>
                                <div class="col-auto">
                                    <i class="bi bi-people fs-1 text-gray-300"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-xl-3 col-md-6 mb-4">
                    <div class="card border-start border-success border-4 shadow h-100 py-2">
                        <div class="card-body">
                            <div class="row no-gutters align-items-center">
                                <div class="col me-2">
                                    <div class="text-xs fw-bold text-success text-uppercase mb-1">
                                        ${isStudent ? 'Изучаю предметов' : 'Предметов'}
                                    </div>
                                    <div class="h5 mb-0 fw-bold text-gray-800">
                                        ${isStudent ? studentSubjectsCount : stats.totalSubjects}
                                    </div>
                                </div>
                                <div class="col-auto">
                                    <i class="bi bi-book fs-1 text-gray-300"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-xl-3 col-md-6 mb-4">
                    <div class="card border-start border-info border-4 shadow h-100 py-2">
                        <div class="card-body">
                            <div class="row no-gutters align-items-center">
                                <div class="col me-2">
                                    <div class="text-xs fw-bold text-info text-uppercase mb-1">
                                        ${isStudent ? 'Мои оценки' : 'Оценок'}
                                    </div>
                                    <div class="h5 mb-0 fw-bold text-gray-800">
                                        ${isStudent ? studentStats.totalGrades : stats.totalGrades}
                                    </div>
                                </div>
                                <div class="col-auto">
                                    <i class="bi bi-pencil-square fs-1 text-gray-300"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-xl-3 col-md-6 mb-4">
                    <div class="card border-start border-warning border-4 shadow h-100 py-2">
                        <div class="card-body">
                            <div class="row no-gutters align-items-center">
                                <div class="col me-2">
                                    <div class="text-xs fw-bold text-warning text-uppercase mb-1">
                                        ${isStudent ? 'Мой средний балл' : 'Средний балл'}
                                    </div>
                                    <div class="h5 mb-0 fw-bold text-gray-800">
                                        ${isStudent ? studentStats.averageGrade : stats.averageGrade}
                                    </div>
                                </div>
                                <div class="col-auto">
                                    <i class="bi bi-graph-up fs-1 text-gray-300"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Быстрые действия и уведомления -->
            <div class="row">
                <div class="col-lg-8 mb-4">
                    <div class="card shadow">
                        <div class="card-header bg-white py-3">
                            <h5 class="card-title mb-0">
                                <i class="bi bi-lightning me-2 text-warning"></i>
                                ${isStudent ? 'Мои действия' : 'Быстрые действия'}
                            </h5>
                        </div>
                        <div class="card-body">
                            <div class="row g-3">
                                ${isStudent ? `
                                    <!-- ДЕЙСТВИЯ ДЛЯ СТУДЕНТА -->
                                    <div class="col-sm-6 col-md-4">
                                        <button class="btn btn-outline-primary w-100 h-100 py-3" onclick="showTab('mygrades')">
                                            <i class="bi bi-journal-check fs-4 d-block mb-2"></i>
                                            Мои оценки
                                        </button>
                                    </div>
                                    <div class="col-sm-6 col-md-4">
                                        <button class="btn btn-outline-success w-100 h-100 py-3" onclick="showTab('myattendance')">
                                            <i class="bi bi-clipboard-check fs-4 d-block mb-2"></i>
                                            Моя посещаемость
                                        </button>
                                    </div>
                                    <div class="col-sm-6 col-md-4">
                                        <button class="btn btn-outline-info w-100 h-100 py-3" onclick="showTab('calendar')">
                                            <i class="bi bi-calendar fs-4 d-block mb-2"></i>
                                            Расписание
                                        </button>
                                    </div>
                                ` : `
                                    <!-- ДЕЙСТВИЯ ДЛЯ ПРЕПОДАВАТЕЛЕЙ И АДМИНОВ -->
                                    <div class="col-sm-6 col-md-3">
                                        <button class="btn btn-outline-primary w-100 h-100 py-3" onclick="showTab('students')">
                                            <i class="bi bi-person-plus fs-4 d-block mb-2"></i>
                                            Добавить студента
                                        </button>
                                    </div>
                                    <div class="col-sm-6 col-md-3">
                                        <button class="btn btn-outline-success w-100 h-100 py-3" onclick="showTab('subjects')">
                                            <i class="bi bi-journal-plus fs-4 d-block mb-2"></i>
                                            Добавить предмет
                                        </button>
                                    </div>
                                    <div class="col-sm-6 col-md-3">
                                        <button class="btn btn-outline-info w-100 h-100 py-3" onclick="showTab('grades')">
                                            <i class="bi bi-pen fs-4 d-block mb-2"></i>
                                            Выставить оценку
                                        </button>
                                    </div>
                                    <div class="col-sm-6 col-md-3">
                                        <button class="btn btn-outline-warning w-100 h-100 py-3" onclick="showTab('reports')">
                                            <i class="bi bi-printer fs-4 d-block mb-2"></i>
                                            Создать отчёт
                                        </button>
                                    </div>
                                `}
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-lg-4 mb-4">
                    <div class="card shadow">
                        <div class="card-header bg-white py-3">
                            <h5 class="card-title mb-0">
                                <i class="bi bi-bell me-2 text-danger"></i>Последние уведомления
                            </h5>
                        </div>
                        <div class="card-body">
                            <div id="recentNotifications">
                                <p class="text-muted text-center">Уведомлений нет</p>
                            </div>
                            <div class="text-center mt-3">
                                <button class="btn btn-sm btn-outline-secondary" onclick="showTab('notifications')">
                                    Все уведомления
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Ближайшие события -->
            <div class="row">
                <div class="col-12">
                    <div class="card shadow">
                        <div class="card-header bg-white py-3">
                            <h5 class="card-title mb-0">
                                <i class="bi bi-calendar-check me-2 text-success"></i>Ближайшие события
                            </h5>
                        </div>
                        <div class="card-body">
                            <div id="upcomingEvents">
                                <p class="text-muted text-center">Событий на ближайшую неделю нет</p>
                            </div>
                            <div class="text-center mt-3">
                                <button class="btn btn-sm btn-outline-primary" onclick="showTab('calendar')">
                                    <i class="bi bi-calendar me-1"></i>Весь календарь
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('dashboardTab').innerHTML = dashboardHTML;
        
        // Загружаем уведомления и события
        this.loadRecentNotifications();
        this.loadUpcomingEvents();
        
    } catch (error) {
        console.error('Ошибка загрузки дашборда:', error);
    }
    }

    calculateStatistics() {
        try {
            const totalStudents = this.appData.students.length;
            const totalSubjects = this.appData.subjects.length;
            const totalGrades = this.appData.grades.length;
            
            // Рассчитываем средний балл
            let totalScore = 0;
            let count = 0;
            
            this.appData.grades.forEach(grade => {
                const numGrade = parseInt(grade.grade);
                if (!isNaN(numGrade)) {
                    totalScore += numGrade;
                    count++;
                }
            });
            
            const averageGrade = count > 0 ? (totalScore / count).toFixed(2) : '0.00';
            
            return {
                totalStudents,
                totalSubjects,
                totalGrades,
                averageGrade
            };
        } catch (error) {
            console.error('Ошибка расчета статистики:', error);
            return {
                totalStudents: 0,
                totalSubjects: 0,
                totalGrades: 0,
                averageGrade: '0.00'
            };
        }
    }

    loadRecentNotifications() {
    try {
        const container = document.getElementById('recentNotifications');
        
        if (this.currentUser.role === 'student') {
            // УВЕДОМЛЕНИЯ ДЛЯ СТУДЕНТОВ
            const studentNotifications = [];
            const studentGrades = this.appData.grades.filter(g => g.studentId === this.currentUser.studentId);
            const studentAttendance = this.appData.attendanceEvents ? 
                this.appData.attendanceEvents.flatMap(event => 
                    event.records.filter(r => r.studentId === this.currentUser.studentId)
                ) : [];
            
            // Последние оценки
            const recentGrades = studentGrades.slice(-3).reverse();
            recentGrades.forEach(grade => {
                const subject = this.appData.subjects.find(s => s.id === grade.subjectId);
                studentNotifications.push({
                    type: 'info',
                    title: 'Новая оценка',
                    message: `По предмету "${subject?.name || 'Неизвестный'}": ${grade.grade}`,
                    date: new Date(grade.date || grade.id)
                });
            });
            
            // Последние отметки посещаемости
            const recentAttendance = studentAttendance.slice(-2).reverse();
            recentAttendance.forEach(record => {
                const event = this.appData.attendanceEvents.find(e => 
                    e.records.some(r => r.studentId === this.currentUser.studentId)
                );
                const subject = event ? this.appData.subjects.find(s => s.id === event.subjectId) : null;
                
                const statusText = record.status === 'present' ? 'присутствовали' : 
                                 record.status === 'absent' ? 'отсутствовали' : 'уважительная причина';
                
                studentNotifications.push({
                    type: record.status === 'present' ? 'success' : 'warning',
                    title: 'Отметка посещаемости',
                    message: `На ${subject?.name || 'мероприятии'} вы ${statusText}`,
                    date: new Date(record.markedAt)
                });
            });
            
            // Общие уведомления для студентов
            studentNotifications.push({
                type: 'info',
                title: 'Добро пожаловать!',
                message: 'Используйте разделы "Мои оценки" и "Моя посещаемость" для просмотра ваших данных',
                date: new Date()
            });
            
            if (studentNotifications.length === 0) {
                container.innerHTML = '<p class="text-muted text-center">Уведомлений нет</p>';
                return;
            }
            
            container.innerHTML = studentNotifications.map(notification => `
                <div class="notification-item ${notification.type} mb-2">
                    <div class="d-flex justify-content-between align-items-start">
                        <div class="flex-grow-1">
                            <h6 class="mb-1">${notification.title}</h6>
                            <p class="mb-0 small text-muted">${notification.message}</p>
                        </div>
                        <small class="text-muted ms-2">${notification.date.toLocaleDateString()}</small>
                    </div>
                </div>
            `).join('');
            
        } else {
            // УВЕДОМЛЕНИЯ ДЛЯ ПРЕПОДАВАТЕЛЕЙ И АДМИНОВ (старый код)
            const notifications = [
                { type: 'info', title: 'Добро пожаловать!', message: 'Система готова к работе', date: new Date() },
                { type: 'success', title: 'Статистика', message: `Всего студентов: ${this.appData.students.length}`, date: new Date() }
            ];
            
            if (notifications.length === 0) {
                container.innerHTML = '<p class="text-muted text-center">Уведомлений нет</p>';
                return;
            }
            
            container.innerHTML = notifications.map(notification => `
                <div class="notification-item ${notification.type} mb-2">
                    <div class="d-flex justify-content-between align-items-start">
                        <div class="flex-grow-1">
                            <h6 class="mb-1">${notification.title}</h6>
                            <p class="mb-0 small text-muted">${notification.message}</p>
                        </div>
                        <small class="text-muted ms-2">${notification.date.toLocaleDateString()}</small>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Ошибка загрузки уведомлений:', error);
    }
    }

    loadUpcomingEvents() {
    try {
        const container = document.getElementById('upcomingEvents');
        const isStudent = this.currentUser.role === 'student';
        
        if (!this.appData.calendarEvents || this.appData.calendarEvents.length === 0) {
            container.innerHTML = '<p class="text-muted text-center">Событий на ближайшую неделю нет</p>';
            return;
        }
        
        const today = new Date();
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);
        
        let upcomingEvents = this.appData.calendarEvents
            .filter(event => {
                const eventDate = new Date(event.date);
                return eventDate >= today && eventDate <= nextWeek;
            });
        
        // Если это студент, фильтруем события по его группе
        if (isStudent) {
            upcomingEvents = upcomingEvents.filter(event => 
                event.group === this.currentUser.group || 
                !event.group || 
                event.group === ''
            );
        }
        
        upcomingEvents = upcomingEvents
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .slice(0, 5); // Показываем только 5 ближайших
        
        if (upcomingEvents.length === 0) {
            container.innerHTML = '<p class="text-muted text-center">Событий на ближайшую неделю нет</p>';
            return;
        }
        
        const typeLabels = {
            'exam': 'Экзамен',
            'test': 'Зачёт',
            'consultation': 'Консультация',
            'practice': 'Практика', 
            'thesis': 'ВКР'
        };
        
        container.innerHTML = upcomingEvents.map(event => {
            const eventDate = new Date(event.date);
            const subject = this.appData.subjects.find(s => s.id === event.subjectId);
            
            return `
                <div class="d-flex justify-content-between align-items-center border-bottom pb-2 mb-2">
                    <div>
                        <h6 class="mb-1">${event.title}</h6>
                        <small class="text-muted">
                            <span class="badge bg-secondary me-1">${typeLabels[event.type]}</span>
                            ${subject ? `• ${subject.name}` : ''}
                            ${event.group ? `• ${event.group}` : ''}
                        </small>
                    </div>
                    <div class="text-end">
                        <div class="fw-bold">${eventDate.toLocaleDateString()}</div>
                        <small class="text-muted">${eventDate.toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit'})}</small>
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Ошибка загрузки событий:', error);
    }
}

    // СТУДЕНТЫ
    loadStudentsTab() {
        try {
            const container = document.getElementById('studentsTab');
            const students = this.appData.students;
            
            let html = `
                <div class="row">
                    <div class="col-12">
                        <div class="d-flex justify-content-between align-items-center mb-4">
                            <h2 class="h3 mb-0">
                                <i class="bi bi-people me-2 text-primary"></i>Управление студентами
                            </h2>
                            <button class="btn btn-primary" onclick="app.showAddStudentModal()">
                                <i class="bi bi-person-plus me-1"></i>Добавить студента
                            </button>
                        </div>
                    </div>
                </div>
            `;

            if (students.length === 0) {
                html += this.getEmptyState('students', 'bi-people', 'Студенты не добавлены', 'Добавьте первого студента чтобы начать работу');
            } else {
                html += this.renderStudentsTable(students);
            }

            container.innerHTML = html;
        } catch (error) {
            console.error('Ошибка загрузки вкладки студентов:', error);
            this.showAlert('Ошибка', 'Не удалось загрузить список студентов', 'danger');
        }
    }

    getEmptyState(type, icon, title, message) {
        return `
            <div class="text-center py-5">
                <i class="bi ${icon} display-1 text-muted"></i>
                <h4 class="text-muted mt-3">${title}</h4>
                <p class="text-muted">${message}</p>
            </div>
        `;
    }

    renderStudentsTable(students) {
        let html = `
            <div class="card shadow">
                <div class="card-body">
                    <div class="table-responsive">
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

        students.forEach(student => {
            const stats = this.getStudentStatistics(student.id);
            const gradeClass = stats.averageGrade >= 4 ? 'bg-success' : stats.averageGrade >= 3 ? 'bg-warning' : 'bg-danger';
            
            html += `
                <tr>
                    <td>
                        <i class="bi bi-person-circle me-2 text-primary"></i>
                        <strong>${student.name}</strong>
                    </td>
                    <td><span class="badge bg-secondary">${student.group}</span></td>
                    <td><span class="badge bg-info">${stats.totalGrades}</span></td>
                    <td>
                        <span class="badge ${gradeClass}">${stats.averageGrade}</span>
                    </td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary me-1" onclick="app.viewStudentDetails('${student.id}')">
                            <i class="bi bi-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="app.deleteStudent('${student.id}')">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });

        html += `
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        return html;
    }

    getStudentStatistics(studentId) {
        try {
            const studentGrades = this.appData.grades.filter(g => g.studentId === studentId);
            
            // Подсчитываем только числовые оценки
            const numericGrades = studentGrades
                .map(g => {
                    const num = parseInt(g.grade);
                    return isNaN(num) ? null : num;
                })
                .filter(g => g !== null);
            
            const averageGrade = numericGrades.length > 0 
                ? (numericGrades.reduce((a, b) => a + b, 0) / numericGrades.length).toFixed(2) 
                : '0.00';
            
            return {
                totalGrades: studentGrades.length,
                averageGrade,
                numericGradesCount: numericGrades.length
            };
        } catch (error) {
            console.error('Ошибка расчета статистики студента:', error);
            return {
                totalGrades: 0,
                averageGrade: '0.00',
                numericGradesCount: 0
            };
        }
    }

    showAddStudentModal() {
        try {
            const modalHTML = `
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
                                <button type="button" class="btn btn-primary" onclick="app.addStudent()">Добавить</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            const oldModal = document.getElementById('addStudentModal');
            if (oldModal) oldModal.remove();
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            const modal = new bootstrap.Modal(document.getElementById('addStudentModal'));
            modal.show();
        } catch (error) {
            console.error('Ошибка показа модального окна:', error);
            this.showAlert('Ошибка', 'Не удалось открыть форму добавления', 'danger');
        }
    }

    addStudent() {
        try {
            const name = document.getElementById('studentName')?.value.trim();
            const group = document.getElementById('studentGroup')?.value.trim();
            
            if (!name || !group) {
                this.showAlert('Ошибка', 'Заполните все поля!', 'warning');
                return;
            }

            const student = {
                id: this.generateId(),
                name: name,
                group: group,
                createdAt: new Date().toISOString()
            };

            this.appData.students.push(student);
            
            if (this.saveData()) {
                const modal = bootstrap.Modal.getInstance(document.getElementById('addStudentModal'));
                if (modal) modal.hide();
                
                this.showAlert('Успех', `Студент ${name} добавлен в группу ${group}`, 'success');
                this.loadStudentsTab();
            }
        } catch (error) {
            console.error('Ошибка добавления студента:', error);
            this.showAlert('Ошибка', 'Не удалось добавить студента', 'danger');
        }
    }

    deleteStudent(id) {
        try {
            if (confirm('Удалить студента и все его оценки?')) {
                this.appData.students = this.appData.students.filter(s => s.id !== id);
                this.appData.grades = this.appData.grades.filter(g => g.studentId !== id);
                
                if (this.saveData()) {
                    this.showAlert('Удалено', 'Студент и все его оценки удалены', 'info');
                    this.loadStudentsTab();
                }
            }
        } catch (error) {
            console.error('Ошибка удаления студента:', error);
            this.showAlert('Ошибка', 'Не удалось удалить студента', 'danger');
        }
    }

    viewStudentDetails(studentId) {
        try {
            const student = this.appData.students.find(s => s.id === studentId);
            if (!student) {
                this.showAlert('Ошибка', 'Студент не найден', 'warning');
                return;
            }

            const stats = this.getStudentStatistics(studentId);
            const grades = this.appData.grades.filter(g => g.studentId === studentId);
            
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
                                        <p><strong>Всего оценок:</strong> <span class="badge bg-info">${stats.totalGrades}</span></p>
                                    </div>
                                </div>
                                
                                <h6>Оценки:</h6>
            `;

            if (grades.length === 0) {
                html += '<p class="text-muted">Оценок пока нет</p>';
            } else {
                html += `
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
                
                grades.forEach(grade => {
                    const subject = this.appData.subjects.find(s => s.id === grade.subjectId);
                    const gradeClass = this.getGradeClass(grade.grade);
                    
                    html += `
                        <tr>
                            <td>${subject ? subject.name : 'Неизвестный предмет'}</td>
                            <td><span class="badge ${gradeClass}">${grade.grade}</span></td>
                            <td>${grade.date || 'Не указана'}</td>
                        </tr>
                    `;
                });
                
                html += `
                            </tbody>
                        </table>
                    </div>
                `;
            }

            html += `
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            const oldModal = document.getElementById('studentDetailsModal');
            if (oldModal) oldModal.remove();
            
            document.body.insertAdjacentHTML('beforeend', html);
            const modal = new bootstrap.Modal(document.getElementById('studentDetailsModal'));
            modal.show();
            
            document.getElementById('studentDetailsModal').addEventListener('hidden.bs.modal', function() {
                this.remove();
            });
        } catch (error) {
            console.error('Ошибка показа деталей студента:', error);
            this.showAlert('Ошибка', 'Не удалось загрузить данные студента', 'danger');
        }
    }

    getGradeClass(grade) {
        if (grade === '5' || grade === 'зачёт') return 'bg-success';
        if (grade === '4') return 'bg-info';
        if (grade === '3') return 'bg-warning';
        if (grade === '2' || grade === 'незачёт') return 'bg-danger';
        return 'bg-secondary';
    }

    // ПРЕДМЕТЫ
    loadSubjectsTab() {
        try {
            const container = document.getElementById('subjectsTab');
            const subjects = this.appData.subjects;
            
            let html = `
                <div class="row">
                    <div class="col-12">
                        <div class="d-flex justify-content-between align-items-center mb-4">
                            <h2 class="h3 mb-0">
                                <i class="bi bi-book me-2 text-success"></i>Управление предметами
                            </h2>
                            <button class="btn btn-success" onclick="app.showAddSubjectModal()">
                                <i class="bi bi-journal-plus me-1"></i>Добавить предмет
                            </button>
                        </div>
                    </div>
                </div>
            `;

            if (subjects.length === 0) {
                html += this.getEmptyState('subjects', 'bi-book', 'Предметы не добавлены', 'Добавьте первый предмет чтобы начать работу');
            } else {
                html += this.renderSubjectsTable(subjects);
            }

            container.innerHTML = html;
        } catch (error) {
            console.error('Ошибка загрузки вкладки предметов:', error);
            this.showAlert('Ошибка', 'Не удалось загрузить список предметов', 'danger');
        }
    }

    renderSubjectsTable(subjects) {
        let html = `
            <div class="card shadow">
                <div class="card-body">
                    <div class="table-responsive">
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

        subjects.forEach(subject => {
            const subjectGrades = this.appData.grades.filter(g => g.subjectId === subject.id);
            
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
                        <button class="btn btn-sm btn-outline-danger" onclick="app.deleteSubject('${subject.id}')">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });

        html += `
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        return html;
    }

    showAddSubjectModal() {
        try {
            const modalHTML = `
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
                                        <input type="text" class="form-control" id="subjectTeacher" value="${this.currentUser?.name || ''}" readonly>
                                    </div>
                                </form>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Отмена</button>
                                <button type="button" class="btn btn-success" onclick="app.addSubject()">Добавить</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            const oldModal = document.getElementById('addSubjectModal');
            if (oldModal) oldModal.remove();
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            const modal = new bootstrap.Modal(document.getElementById('addSubjectModal'));
            modal.show();
        } catch (error) {
            console.error('Ошибка показа модального окна предмета:', error);
            this.showAlert('Ошибка', 'Не удалось открыть форму добавления', 'danger');
        }
    }

    addSubject() {
        try {
            const name = document.getElementById('subjectName')?.value.trim();
            const teacher = document.getElementById('subjectTeacher')?.value.trim();
            
            if (!name) {
                this.showAlert('Ошибка', 'Введите название предмета!', 'warning');
                return;
            }

            const subject = {
                id: this.generateId(),
                name: name,
                teacherName: teacher,
                teacherId: this.currentUser?.id,
                createdAt: new Date().toISOString()
            };

            this.appData.subjects.push(subject);
            
            if (this.saveData()) {
                const modal = bootstrap.Modal.getInstance(document.getElementById('addSubjectModal'));
                if (modal) modal.hide();
                
                this.showAlert('Успех', `Предмет "${name}" добавлен в систему`, 'success');
                this.loadSubjectsTab();
            }
        } catch (error) {
            console.error('Ошибка добавления предмета:', error);
            this.showAlert('Ошибка', 'Не удалось добавить предмет', 'danger');
        }
    }

    deleteSubject(id) {
        try {
            if (confirm('Удалить предмет и все связанные оценки?')) {
                this.appData.subjects = this.appData.subjects.filter(s => s.id !== id);
                this.appData.grades = this.appData.grades.filter(g => g.subjectId !== id);
                
                if (this.saveData()) {
                    this.showAlert('Удалено', 'Предмет и все связанные оценки удалены', 'info');
                    this.loadSubjectsTab();
                }
            }
        } catch (error) {
            console.error('Ошибка удаления предмета:', error);
            this.showAlert('Ошибка', 'Не удалось удалить предмет', 'danger');
        }
    }

    // ОЦЕНКИ - исправленная версия
    loadGradesTab() {
    try {
        const container = document.getElementById('gradesTab');
        const currentSemester = this.getCurrentSemester();
        
        container.innerHTML = `
            <div class="row">
                <div class="col-12">
                    <div class="d-flex justify-content-between align-items-center mb-4">
                        <h2 class="h3 mb-0">
                            <i class="bi bi-pencil-square me-2 text-info"></i>Выставление оценок
                            <small class="text-muted fs-6 ms-2">${currentSemester}</small>
                        </h2>
                        <div class="btn-group" role="group">
                            <input type="radio" class="btn-check" name="gradeMode" id="massMode" autocomplete="off" checked>
                            <label class="btn btn-outline-info" for="massMode" onclick="app.showMassGradeMode()">
                                <i class="bi bi-people me-1"></i>Массовое выставление
                            </label>
                            
                            <input type="radio" class="btn-check" name="gradeMode" id="singleMode" autocomplete="off">
                            <label class="btn btn-outline-info" for="singleMode" onclick="app.showSingleGradeMode()">
                                <i class="bi bi-person me-1"></i>Одному студенту
                            </label>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Контейнер для форм будет меняться -->
            <div id="gradeFormContainer">
                ${this.renderMassGradeForm()}
            </div>
            
            <!-- Все оценки -->
            <div class="row mt-4">
                <div class="col-12">
                    <div class="card shadow">
                        <div class="card-header">
                            <h5 class="card-title mb-0">
                                <i class="bi bi-list-check me-2"></i>Все оценки
                                <small class="text-muted ms-2">${currentSemester}</small>
                            </h5>
                        </div>
                        <div class="card-body">
                            <div id="allGradesContainer">
                                ${this.renderAllGrades()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Ошибка загрузки вкладки оценок:', error);
        this.showAlert('Ошибка', 'Не удалось загрузить раздел оценок', 'danger');
    }
}

// РЕНДЕРИНГ ФОРМЫ МАССОВОГО ВЫСТАВЛЕНИЯ
renderMassGradeForm() {
    return `
        <div class="row">
            <div class="col-12">
                <div class="card shadow">
                    <div class="card-header">
                        <h5 class="card-title mb-0">
                            <i class="bi bi-people me-2 text-info"></i>Массовое выставление оценок
                        </h5>
                    </div>
                    <div class="card-body">
                        <form id="massGradeForm">
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="massGradeGroup" class="form-label">Группа *</label>
                                        <select class="form-select" id="massGradeGroup" required onchange="app.updateMassGradeStudents()">
                                            <option value="">Выберите группу</option>
                                            ${this.getExistingGroups().map(group => 
                                                `<option value="${group}">${group}</option>`
                                            ).join('')}
                                        </select>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="massGradeSubject" class="form-label">Предмет *</label>
                                        <select class="form-select" id="massGradeSubject" required onchange="app.updateMassGradeStudents()">
                                            <option value="">Выберите предмет</option>
                                            ${this.appData.subjects.map(subject => 
                                                `<option value="${subject.id}">${subject.name}</option>`
                                            ).join('')}
                                        </select>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="mb-3">
                                <label for="massGradeDate" class="form-label">Дата выставления *</label>
                                <input type="date" class="form-control" id="massGradeDate" value="${new Date().toISOString().split('T')[0]}" required>
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label">Оценки для студентов:</label>
                                <div class="alert alert-info">
                                    <i class="bi bi-info-circle me-2"></i>
                                    Выберите индивидуальные оценки для каждого студента
                                </div>
                                <div id="massGradeStudentsList" class="border rounded p-3" style="max-height: 400px; overflow-y: auto;">
                                    <p class="text-muted text-center mb-0">Выберите группу и предмет для отображения студентов</p>
                                </div>
                            </div>
                            
                            <button type="button" class="btn btn-info w-100" onclick="app.addMassGrades()">
                                <i class="bi bi-check-circle me-1"></i>Выставить оценки группе
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// РЕНДЕРИНГ ФОРМЫ ИНДИВИДУАЛЬНОГО ВЫСТАВЛЕНИЯ
renderSingleGradeForm() {
    return `
        <div class="row">
            <div class="col-12">
                <div class="card shadow">
                    <div class="card-header">
                        <h5 class="card-title mb-0">
                            <i class="bi bi-person me-2 text-primary"></i>Выставление оценки одному студенту
                        </h5>
                    </div>
                    <div class="card-body">
                        <form id="singleGradeForm">
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="singleStudentSelect" class="form-label">Студент *</label>
                                        <select class="form-select" id="singleStudentSelect" required>
                                            <option value="">Выберите студента</option>
                                            ${this.appData.students.map(student => 
                                                `<option value="${student.id}">${student.name} (${student.group})</option>`
                                            ).join('')}
                                        </select>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="singleSubjectSelect" class="form-label">Предмет *</label>
                                        <select class="form-select" id="singleSubjectSelect" required>
                                            <option value="">Выберите предмет</option>
                                            ${this.appData.subjects.map(subject => 
                                                `<option value="${subject.id}">${subject.name}</option>`
                                            ).join('')}
                                        </select>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="singleGradeSelect" class="form-label">Оценка *</label>
                                        <select class="form-select" id="singleGradeSelect" required>
                                            <option value="5">5 (Отлично)</option>
                                            <option value="4">4 (Хорошо)</option>
                                            <option value="3">3 (Удовлетворительно)</option>
                                            <option value="2">2 (Неудовлетворительно)</option>
                                            <option value="зачёт">Зачёт</option>
                                            <option value="незачёт">Незачёт</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="singleGradeDate" class="form-label">Дата *</label>
                                        <input type="date" class="form-control" id="singleGradeDate" value="${new Date().toISOString().split('T')[0]}" required>
                                    </div>
                                </div>
                            </div>
                            
                            <button type="button" class="btn btn-primary w-100" onclick="app.addSingleGrade()">
                                <i class="bi bi-check-circle me-1"></i>Выставить оценку
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ПЕРЕКЛЮЧЕНИЕ РЕЖИМОВ
showMassGradeMode() {
    const container = document.getElementById('gradeFormContainer');
    if (container) {
        container.innerHTML = this.renderMassGradeForm();
    }
}

showSingleGradeMode() {
    const container = document.getElementById('gradeFormContainer');
    if (container) {
        container.innerHTML = this.renderSingleGradeForm();
    }
}

    renderAllGrades() {
    try {
        // Добавим фильтры по семестрам и курсам
        const semesters = this.getAllSemesters();
        const courses = this.getAllCourses();
        
        let html = `
            <!-- Фильтры -->
            <div class="row mb-4">
                <div class="col-md-4">
                    <label for="gradeSemesterFilter" class="form-label small text-muted">Семестр</label>
                    <select class="form-select" id="gradeSemesterFilter" onchange="app.filterAllGrades()">
                        <option value="all">Все семестры</option>
                        ${semesters.map(semester => 
                            `<option value="${semester}">${semester}</option>`
                        ).join('')}
                    </select>
                </div>
                <div class="col-md-4">
                    <label for="gradeCourseFilter" class="form-label small text-muted">Курс</label>
                    <select class="form-select" id="gradeCourseFilter" onchange="app.filterAllGrades()">
                        <option value="all">Все курсы</option>
                        ${courses.map(course => 
                            `<option value="${course}">${course} курс</option>`
                        ).join('')}
                    </select>
                </div>
                <div class="col-md-4">
                    <label for="gradeSubjectFilter" class="form-label small text-muted">Предмет</label>
                    <select class="form-select" id="gradeSubjectFilter" onchange="app.filterAllGrades()">
                        <option value="all">Все предметы</option>
                        ${this.appData.subjects.map(subject => 
                            `<option value="${subject.id}">${subject.name}</option>`
                        ).join('')}
                    </select>
                </div>
            </div>
        `;

        if (this.appData.grades.length === 0) {
            html += '<p class="text-muted text-center py-4">Оценок пока нет</p>';
        } else {
            html += `
                <div class="table-responsive">
                    <table class="table table-sm table-hover">
                        <thead>
                            <tr>
                                <th>Студент</th>
                                <th>Группа</th>
                                <th>Предмет</th>
                                <th>Оценка</th>
                                <th>Дата</th>
                                <th>Семестр</th>
                                <th>Курс</th>
                                <th>Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.appData.grades.map(grade => {
                                const student = this.appData.students.find(s => s.id === grade.studentId);
                                const subject = this.appData.subjects.find(s => s.id === grade.subjectId);
                                const studentCourse = student ? this.getCurrentCourse(student.group) : '?';
                                
                                if (!student || !subject) return '';
                                
                                return `
                                    <tr>
                                        <td>
                                            <i class="bi bi-person-circle me-1 text-primary"></i>
                                            ${student.name}
                                        </td>
                                        <td><span class="badge bg-info">${student.group}</span></td>
                                        <td>${subject.name}</td>
                                        <td><span class="badge ${this.getGradeClass(grade.grade)}">${grade.grade}</span></td>
                                        <td><small class="text-muted">${grade.date || 'Не указана'}</small></td>
                                        <td><small class="text-muted">${grade.semester || 'Не указан'}</small></td>
                                        <td><span class="badge bg-secondary">${studentCourse} курс</span></td>
                                        <td>
                                            <button class="btn btn-sm btn-outline-danger" onclick="app.deleteGrade('${grade.id}')">
                                                <i class="bi bi-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        }
        
        return html;
    } catch (error) {
        console.error('Ошибка рендеринга оценок:', error);
        return '<p class="text-danger text-center">Ошибка загрузки оценок</p>';
    }
}

// ФИЛЬТРАЦИЯ ВСЕХ ОЦЕНОК
filterAllGrades() {
    try {
        const semesterFilter = document.getElementById('gradeSemesterFilter')?.value;
        const courseFilter = document.getElementById('gradeCourseFilter')?.value;
        const subjectFilter = document.getElementById('gradeSubjectFilter')?.value;
        
        let filteredGrades = [...this.appData.grades]; // Создаем копию массива
        
        // Фильтр по семестру
        if (semesterFilter && semesterFilter !== 'all') {
            filteredGrades = filteredGrades.filter(grade => grade.semester === semesterFilter);
        }
        
        // Фильтр по курсу
        if (courseFilter && courseFilter !== 'all') {
            const courseNum = parseInt(courseFilter);
            filteredGrades = filteredGrades.filter(grade => {
                // Находим студента для определения курса
                const student = this.appData.students.find(s => s.id === grade.studentId);
                if (!student) return false;
                
                const studentCourse = this.getCurrentCourse(student.group);
                return studentCourse === courseNum;
            });
        }
        
        // Фильтр по предмету
        if (subjectFilter && subjectFilter !== 'all') {
            filteredGrades = filteredGrades.filter(grade => grade.subjectId === subjectFilter);
        }
        
        // Обновляем отображение только таблицы, без фильтров
        this.renderFilteredGradesTable(filteredGrades);
        
    } catch (error) {
        console.error('Ошибка фильтрации оценок:', error);
    }
}

// ОТДЕЛЬНЫЙ МЕТОД ДЛЯ ОТОБРАЖЕНИЯ ОТФИЛЬТРОВАННЫХ ОЦЕНОК
renderFilteredGradesTable(grades) {
    const tableBody = document.querySelector('#allGradesContainer tbody');
    if (!tableBody) return;
    
    if (grades.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center text-muted py-4">
                    <i class="bi bi-search display-6"></i>
                    <p class="mt-2">Оценки не найдены</p>
                    <small>Попробуйте изменить параметры фильтрации</small>
                </td>
            </tr>
        `;
        return;
    }
    
    tableBody.innerHTML = grades.map(grade => {
        const student = this.appData.students.find(s => s.id === grade.studentId);
        const subject = this.appData.subjects.find(s => s.id === grade.subjectId);
        
        if (!student || !subject) return '';
        
        const studentCourse = this.getCurrentCourse(student.group);
        
        return `
            <tr>
                <td>
                    <i class="bi bi-person-circle me-1 text-primary"></i>
                    ${student.name}
                </td>
                <td><span class="badge bg-info">${student.group}</span></td>
                <td>${subject.name}</td>
                <td><span class="badge ${this.getGradeClass(grade.grade)}">${grade.grade}</span></td>
                <td><small class="text-muted">${grade.date || 'Не указана'}</small></td>
                <td><small class="text-muted">${grade.semester || 'Не указан'}</small></td>
                <td><span class="badge bg-secondary">${studentCourse} курс</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-danger" onclick="app.deleteGrade('${grade.id}')">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

    addGrade() {
    try {
        // Проверка наличия студентов и предметов
        if (this.appData.students.length === 0) {
            this.showAlert('Ошибка', 'Сначала добавьте студентов!', 'warning');
            return;
        }

        if (this.appData.subjects.length === 0) {
            this.showAlert('Ошибка', 'Сначала добавьте предметы!', 'warning');
            return;
        }

        const studentSelect = document.getElementById('gradeStudentSelect');
        const subjectSelect = document.getElementById('gradeSubjectSelect');
        const gradeSelect = document.getElementById('gradeSelect');
        
        if (!studentSelect || !subjectSelect || !gradeSelect) {
            this.showAlert('Ошибка', 'Форма не найдена!', 'danger');
            return;
        }

        const studentId = studentSelect.value;
        const subjectId = subjectSelect.value;
        const gradeValue = gradeSelect.value;
        
        if (!studentId || !subjectId || !gradeValue) {
            this.showAlert('Ошибка', 'Выберите студента, предмет и оценку!', 'warning');
            return;
        }

        // Ищем студента и предмет
        const student = this.appData.students.find(s => s.id === studentId);
        const subject = this.appData.subjects.find(s => s.id === subjectId);

        if (!student) {
            this.showAlert('Ошибка', 'Студент не найден!', 'danger');
            return;
        }

        if (!subject) {
            this.showAlert('Ошибка', 'Предмет не найден!', 'danger');
            return;
        }

        const grade = {
            id: this.generateId(),
            studentId: studentId,
            subjectId: subjectId,
            grade: gradeValue,
            date: new Date().toLocaleDateString('ru-RU'),
            teacherId: this.currentUser ? this.currentUser.id : null
        };

        this.appData.grades.push(grade);
        
        if (this.saveData()) {
            document.getElementById('addGradeForm').reset();
            
            // СОЗДАЁМ УВЕДОМЛЕНИЕ О НОВОЙ ОЦЕНКЕ
            this.createGradeNotification(grade);
            
            this.showAlert('Успех', 
                `Студенту ${student.name} по предмету "${subject.name}" выставлена оценка: ${gradeValue}`, 
                'success');
            
            // ОБНОВЛЯЕМ ОТОБРАЖЕНИЕ (один раз!)
            this.updateGradesDisplay();
        }
    } catch (error) {
        console.error('Ошибка добавления оценки:', error);
        this.showAlert('Ошибка', 'Не удалось добавить оценку', 'danger');
    }
    }

    deleteGrade(gradeId) {
    try {
        if (confirm('Удалить эту оценку?')) {
            // ИСПРАВЛЕННАЯ СТРОКА - используем строгое сравнение
            this.appData.grades = this.appData.grades.filter(g => g.id !== gradeId);
            
            if (this.saveData()) {
                this.showAlert('Удалено', 'Оценка удалена', 'info');
                // ОБНОВЛЯЕМ ОТОБРАЖЕНИЕ
                this.updateGradesDisplay();
            }
        }
    } catch (error) {
        console.error('Ошибка удаления оценки:', error);
        this.showAlert('Ошибка', 'Не удалось удалить оценку', 'danger');
    }
    }

    updateGradesDisplay() {
    try {
        // Обновляем отображение на всех вкладках, где есть данные об оценках
        if (this.currentTab === 'grades') {
            this.loadGradesTab();
        }
        if (this.currentTab === 'dashboard') {
            this.loadDashboard();
        }
        if (this.currentTab === 'students') {
            this.loadStudentsTab();
        }
        if (this.currentTab === 'mygrades' && this.currentUser.role === 'student') {
            this.loadMyGradesTab();
        }
    } catch (error) {
        console.error('Ошибка обновления отображения оценок:', error);
    }
    }

    // МАССОВОЕ ВЫСТАВЛЕНИЕ ОЦЕНОК
showMassGradeModal() {
    // Эта функция теперь не нужна, так как форма встроена в основную вкладку
    this.showAlert('Информация', 'Форма массового выставления оценок доступна выше', 'info');
}

updateMassGradeStudents() {
    try {
        const group = document.getElementById('massGradeGroup')?.value;
        const subjectId = document.getElementById('massGradeSubject')?.value;
        const container = document.getElementById('massGradeStudentsList');
        
        if (!container) return;
        
        if (!group || !subjectId) {
            container.innerHTML = '<p class="text-muted text-center mb-0">Выберите группу и предмет для отображения студентов</p>';
            return;
        }
        
        const studentsInGroup = this.appData.students.filter(s => s.group === group);
        const subject = this.appData.subjects.find(s => s.id === subjectId);
        
        if (studentsInGroup.length === 0) {
            container.innerHTML = '<p class="text-muted text-center mb-0">В этой группе нет студентов</p>';
            return;
        }
        
        if (!subject) {
            container.innerHTML = '<p class="text-muted text-center mb-0">Предмет не найден</p>';
            return;
        }
        
        let html = `
            <div class="students-grading-list">
                <div class="table-responsive">
                    <table class="table table-sm">
                        <thead>
                            <tr>
                                <th>Студент</th>
                                <th>Текущая оценка</th>
                                <th>Новая оценка</th>
                            </tr>
                        </thead>
                        <tbody>
        `;
        
        studentsInGroup.forEach(student => {
            // Ищем существующую оценку
            const existingGrade = this.appData.grades.find(g => 
                g.studentId === student.id && g.subjectId === subjectId
            );
            
            html += `
                <tr>
                    <td>
                        <i class="bi bi-person-circle me-2 text-primary"></i>
                        ${student.name}
                    </td>
                    <td>
                        ${existingGrade ? 
                            `<span class="badge ${this.getGradeClass(existingGrade.grade)}">${existingGrade.grade}</span>` : 
                            '<span class="text-muted">Нет оценки</span>'
                        }
                    </td>
                    <td>
                        <select class="form-select form-select-sm student-grade-select" data-student-id="${student.id}">
                            <option value="">-- Выберите оценку --</option>
                            <option value="5">5 (Отлично)</option>
                            <option value="4">4 (Хорошо)</option>
                            <option value="3">3 (Удовлетворительно)</option>
                            <option value="2">2 (Неудовлетворительно)</option>
                            <option value="зачёт">Зачёт</option>
                            <option value="незачёт">Незачёт</option>
                        </select>
                    </td>
                </tr>
            `;
        });
        
        html += `
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        container.innerHTML = html;
        
    } catch (error) {
        console.error('Ошибка обновления списка студентов:', error);
    }
}

addMassGrades() {
    try {
        const group = document.getElementById('massGradeGroup')?.value;
        const subjectId = document.getElementById('massGradeSubject')?.value;
        const date = document.getElementById('massGradeDate')?.value || new Date().toLocaleDateString('ru-RU');
        
        if (!group || !subjectId) {
            this.showAlert('Ошибка', 'Выберите группу и предмет!', 'warning');
            return;
        }
        
        const studentsInGroup = this.appData.students.filter(s => s.group === group);
        const subject = this.appData.subjects.find(s => s.id === subjectId);
        const currentSemester = this.getCurrentSemester();
        
        if (studentsInGroup.length === 0) {
            this.showAlert('Ошибка', 'В выбранной группе нет студентов!', 'warning');
            return;
        }
        
        if (!subject) {
            this.showAlert('Ошибка', 'Предмет не найден!', 'danger');
            return;
        }
        
        // Собираем оценки для каждого студента
        const gradeSelects = document.querySelectorAll('.student-grade-select');
        let gradesToAdd = [];
        
        gradeSelects.forEach(select => {
            const studentId = select.getAttribute('data-student-id');
            const gradeValue = select.value;
            
            if (gradeValue) {
                gradesToAdd.push({
                    studentId,
                    gradeValue
                });
            }
        });
        
        if (gradesToAdd.length === 0) {
            this.showAlert('Ошибка', 'Выберите хотя бы одну оценку для студентов!', 'warning');
            return;
        }
        
        let addedCount = 0;
        let updatedCount = 0;
        
        // Выставляем оценки
        gradesToAdd.forEach(({ studentId, gradeValue }) => {
            const student = this.appData.students.find(s => s.id === studentId);
            if (!student) return;
            
            // Ищем существующую оценку за текущий семестр
            const existingGradeIndex = this.appData.grades.findIndex(g => 
                g.studentId === studentId && 
                g.subjectId === subjectId &&
                g.semester === currentSemester
            );
            
            const grade = {
                id: existingGradeIndex !== -1 ? this.appData.grades[existingGradeIndex].id : this.generateId(),
                studentId: studentId,
                subjectId: subjectId,
                grade: gradeValue,
                date: date,
                semester: currentSemester,
                course: this.getCurrentCourse(student.group),
                teacherId: this.currentUser?.id,
                createdAt: existingGradeIndex !== -1 ? this.appData.grades[existingGradeIndex].createdAt : new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            if (existingGradeIndex !== -1) {
                // Обновляем существующую оценку
                this.appData.grades[existingGradeIndex] = grade;
                updatedCount++;
                
                // Создаем уведомление об изменении оценки
                this.createGradeNotification(grade, true);
            } else {
                // Добавляем новую оценку
                this.appData.grades.push(grade);
                addedCount++;
                
                // Создаем уведомление о новой оценке
                this.createGradeNotification(grade);
            }
        });
        
        if (this.saveData()) {
            let message = `Оценки успешно выставлены! `;
            if (addedCount > 0) message += `Добавлено новых оценок: ${addedCount}. `;
            if (updatedCount > 0) message += `Обновлено оценок: ${updatedCount}.`;
            
            this.showAlert('Успех', message, 'success');
            
            // Обновляем отображение
            this.updateMassGradeStudents();
            this.updateGradesDisplay();
        }
        
    } catch (error) {
        console.error('Ошибка массового выставления оценок:', error);
        this.showAlert('Ошибка', 'Не удалось выставить оценки', 'danger');
    }
}

addSingleGrade() {
    try {
        const studentId = document.getElementById('singleStudentSelect')?.value;
        const subjectId = document.getElementById('singleSubjectSelect')?.value;
        const gradeValue = document.getElementById('singleGradeSelect')?.value;
        const date = document.getElementById('singleGradeDate')?.value || new Date().toLocaleDateString('ru-RU');
        
        if (!studentId || !subjectId || !gradeValue) {
            this.showAlert('Ошибка', 'Заполните все поля!', 'warning');
            return;
        }

        const student = this.appData.students.find(s => s.id === studentId);
        const subject = this.appData.subjects.find(s => s.id === subjectId);

        if (!student) {
            this.showAlert('Ошибка', 'Студент не найден!', 'danger');
            return;
        }

        if (!subject) {
            this.showAlert('Ошибка', 'Предмет не найден!', 'danger');
            return;
        }

        // Ищем существующую оценку за тот же семестр
        const existingGradeIndex = this.appData.grades.findIndex(g => 
            g.studentId === studentId && 
            g.subjectId === subjectId &&
            g.semester === this.getCurrentSemester() // Добавим проверку по семестру
        );
        
        const grade = {
            id: existingGradeIndex !== -1 ? this.appData.grades[existingGradeIndex].id : this.generateId(),
            studentId: studentId,
            subjectId: subjectId,
            grade: gradeValue,
            date: date,
            semester: this.getCurrentSemester(), // Добавляем семестр
            course: this.getCurrentCourse(student.group), // Добавляем курс
            teacherId: this.currentUser?.id,
            createdAt: existingGradeIndex !== -1 ? this.appData.grades[existingGradeIndex].createdAt : new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        if (existingGradeIndex !== -1) {
            // Обновляем существующую оценку
            this.appData.grades[existingGradeIndex] = grade;
            this.showAlert('Обновлено', 
                `Оценка студенту ${student.name} по предмету "${subject.name}" обновлена: ${gradeValue}`, 
                'info');
        } else {
            // Добавляем новую оценку
            this.appData.grades.push(grade);
            this.showAlert('Успех', 
                `Студенту ${student.name} по предмету "${subject.name}" выставлена оценка: ${gradeValue}`, 
                'success');
        }
        
        if (this.saveData()) {
            document.getElementById('singleGradeForm').reset();
            document.getElementById('singleGradeDate').value = new Date().toISOString().split('T')[0];
            
            // Создаем уведомление
            this.createGradeNotification(grade, existingGradeIndex !== -1);
            
            this.updateGradesDisplay();
        }
    } catch (error) {
        console.error('Ошибка добавления оценки:', error);
        this.showAlert('Ошибка', 'Не удалось добавить оценку', 'danger');
    }
}

// УВЕДОМЛЕНИЕ О МАССОВОМ ВЫСТАВЛЕНИИ ОЦЕНОК
createMassGradeNotification(group, subjectName, gradeValue, studentCount) {
    this.createNotification({
        type: 'grade',
        title: 'Массовое выставление оценок',
        message: `Преподаватель ${this.currentUser?.name} выставил оценку "${gradeValue}" по предмету "${subjectName}" для группы ${group} (${studentCount} студентов)`,
        group: group,
        priority: 'normal'
    });
}

// ОБНОВЛЕННЫЙ МЕТОД ДЛЯ ИНДИВИДУАЛЬНОГО ВЫСТАВЛЕНИЯ
addGrade() {
    try {
        const studentId = document.getElementById('gradeStudentSelect')?.value;
        const subjectId = document.getElementById('gradeSubjectSelect')?.value;
        const gradeValue = document.getElementById('gradeSelect')?.value;
        const date = document.getElementById('gradeDate')?.value || new Date().toLocaleDateString('ru-RU');
        
        if (!studentId || !subjectId || !gradeValue) {
            this.showAlert('Ошибка', 'Выберите студента, предмет и оценку!', 'warning');
            return;
        }

        const student = this.appData.students.find(s => s.id === studentId);
        const subject = this.appData.subjects.find(s => s.id === subjectId);

        if (!student) {
            this.showAlert('Ошибка', 'Студент не найден!', 'danger');
            return;
        }

        if (!subject) {
            this.showAlert('Ошибка', 'Предмет не найден!', 'danger');
            return;
        }

        const grade = {
            id: this.generateId(),
            studentId: studentId,
            subjectId: subjectId,
            grade: gradeValue,
            date: date,
            teacherId: this.currentUser?.id,
            createdAt: new Date().toISOString()
        };

        this.appData.grades.push(grade);
        
        if (this.saveData()) {
            document.getElementById('addGradeForm').reset();
            document.getElementById('gradeDate').value = new Date().toISOString().split('T')[0];
            
            // Создаем уведомление
            this.createGradeNotification(grade);
            
            this.showAlert('Успех', 
                `Студенту ${student.name} по предмету "${subject.name}" выставлена оценка: ${gradeValue}`, 
                'success');
            
            this.updateGradesDisplay();
        }
    } catch (error) {
        console.error('Ошибка добавления оценки:', error);
        this.showAlert('Ошибка', 'Не удалось добавить оценку', 'danger');
    }
}

    // ЗАЧЁТНЫЕ МЕРОПРИЯТИЯ - ТОЛЬКО ЗАЧЁТНЫЕ СОБЫТИЯ
loadAttendanceTab() {
    try {
        const container = document.getElementById('attendanceTab');
        
        container.innerHTML = `
            <div class="row">
                <div class="col-12">
                    <div class="d-flex justify-content-between align-items-center mb-4">
                        <h2 class="h3 mb-0">
                            <i class="bi bi-clipboard-check me-2 text-success"></i>Зачётные мероприятия
                        </h2>
                        <button class="btn btn-success" onclick="app.showMarkAttendanceModal()">
                            <i class="bi bi-check-square me-1"></i>Зачесть мероприятие
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="row mb-4">
    <div class="col-md-3">
        <div class="card border-start border-success border-4">
            <div class="card-body">
                <div class="d-flex align-items-center">
                    <div class="flex-grow-1">
                        <div class="text-muted small">Всего зачётов</div>
                        <div class="h4 mb-0">${this.getAttendanceStats().totalEvents}</div>
                    </div>
                    <i class="bi bi-journal-check fs-1 text-success"></i>
                </div>
            </div>
        </div>
    </div>
    <div class="col-md-3">
        <div class="card border-start border-primary border-4">
            <div class="card-body">
                <div class="d-flex align-items-center">
                    <div class="flex-grow-1">
                        <div class="text-muted small">Присутствовало</div>
                        <div class="h4 mb-0">${this.getAttendanceStats().attendanceRate}%</div>
                    </div>
                    <i class="bi bi-person-check fs-1 text-primary"></i>
                </div>
            </div>
        </div>
    </div>
    <div class="col-md-3">
        <div class="card border-start border-warning border-4">
            <div class="card-body">
                <div class="d-flex align-items-center">
                    <div class="flex-grow-1">
                        <div class="text-muted small">Отсутствовало</div>
                        <div class="h4 mb-0">${this.getAttendanceStats().absentCount}</div>
                    </div>
                    <i class="bi bi-person-x fs-1 text-warning"></i>
                </div>
            </div>
        </div>
    </div>
    <div class="col-md-3">
        <div class="card border-start border-info border-4">
            <div class="card-body">
                <div class="d-flex align-items-center">
                    <div class="flex-grow-1">
                        <div class="text-muted small">Уважительные</div>
                        <div class="h4 mb-0">${this.getAttendanceStats().excusedCount}</div>
                    </div>
                    <i class="bi bi-clipboard-plus fs-1 text-info"></i>
                </div>
            </div>
        </div>
    </div>
</div>
            
            <div class="row">
                <div class="col-12">
                    <div class="card shadow">
                        <div class="card-header">
                            <h5 class="card-title mb-0">
                                <i class="bi bi-list-check me-2"></i>Зачётные мероприятия
                            </h5>
                        </div>
                        <div class="card-body">
                            ${this.renderRecentAttendanceEvents()}
                        </div>
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Ошибка загрузки вкладки зачётных мероприятий:', error);
        this.showAlert('Ошибка', 'Не удалось загрузить раздел зачётных мероприятий', 'danger');
    }
}

getAttendanceStats() {
    if (!this.appData.attendanceEvents) {
        this.appData.attendanceEvents = [];
    }
    
    const totalEvents = this.appData.attendanceEvents.length;
    let totalStudents = 0;
    let presentStudents = 0;
    let absentStudents = 0;
    let excusedStudents = 0;
    
    this.appData.attendanceEvents.forEach(event => {
        if (event.records) {
            totalStudents += event.records.length;
            presentStudents += event.records.filter(r => r.status === 'present').length;
            absentStudents += event.records.filter(r => r.status === 'absent').length;
            excusedStudents += event.records.filter(r => r.status === 'excused').length;
        }
    });
    
    const attendanceRate = totalStudents > 0 ? Math.round((presentStudents / totalStudents) * 100) : 0;
    
    return {
        totalEvents,
        attendanceRate,
        absentCount: absentStudents,
        excusedCount: excusedStudents
    };
}

renderRecentAttendanceEvents() {
    if (!this.appData.attendanceEvents || this.appData.attendanceEvents.length === 0) {
        return `
            <div class="text-center py-5">
                <i class="bi bi-journal-check display-1 text-muted"></i>
                <h4 class="text-muted mt-3">Зачётные мероприятия не проводились</h4>
                <p class="text-muted">Добавьте первое зачётное мероприятие (экзамен, зачёт, защиту ВКР)</p>
                <button class="btn btn-success mt-3" onclick="app.showMarkAttendanceModal()">
                    <i class="bi bi-check-square me-1"></i>Добавить мероприятие
                </button>
            </div>
        `;
    }
    
    const recentEvents = [...this.appData.attendanceEvents]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 10);
    
    let html = `
        <div class="table-responsive">
            <table class="table table-hover">
                <thead>
                    <tr>
                        <th>Дата</th>
                        <th>Тип мероприятия</th>
                        <th>Предмет</th>
                        <th>Группа</th>
                        <th>Присутствовало</th>
                        <th>Посещаемость</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    recentEvents.forEach(event => {
        const subject = this.appData.subjects.find(s => s.id === event.subjectId);
        const totalStudents = event.records ? event.records.length : 0;
        const presentStudents = event.records ? event.records.filter(r => r.status === 'present').length : 0;
        const attendancePercent = totalStudents > 0 ? Math.round((presentStudents / totalStudents) * 100) : 0;
        
        const typeLabels = {
            'exam': 'Экзамен',
            'test': 'Зачёт',
            'diff_test': 'Диф. зачёт',
            'thesis_defense': 'Защита ВКР',
            'qualification_exam': 'Квалиф. экзамен'
        };
        
        html += `
            <tr>
                <td>${new Date(event.date).toLocaleDateString('ru-RU')}</td>
                <td>
                    <span class="badge bg-primary">${typeLabels[event.type]}</span>
                </td>
                <td>${subject ? subject.name : 'Не указан'}</td>
                <td>${event.group || 'Не указана'}</td>
                <td>${presentStudents}/${totalStudents}</td>
                <td>
                    <span class="badge ${attendancePercent >= 80 ? 'bg-success' : attendancePercent >= 60 ? 'bg-warning' : 'bg-danger'}">
                        ${attendancePercent}%
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="app.viewAttendanceDetails('${event.id}')">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="app.deleteAttendanceEvent('${event.id}')">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    html += `
                </tbody>
            </table>
        </div>
    `;
    
    return html;
}

showMarkAttendanceModal() {
    if (this.appData.students.length === 0) {
        this.showAlert('Ошибка', 'Сначала добавьте студентов!', 'warning');
        return;
    }
    
    if (this.appData.subjects.length === 0) {
        this.showAlert('Ошибка', 'Сначала добавьте предметы!', 'warning');
        return;
    }
    
    const modalHTML = `
        <div class="modal fade" id="markAttendanceModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Зачётное мероприятие</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="markAttendanceForm">
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="attendanceType" class="form-label">Тип мероприятия *</label>
                                        <select class="form-select" id="attendanceType" required>
                                            <option value="exam">Экзамен</option>
                                            <option value="test">Зачёт</option>
                                            <option value="diff_test">Дифференцированный зачёт</option>
                                            <option value="thesis_defense">Защита ВКР</option>
                                            <option value="qualification_exam">Квалификационный экзамен</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="attendanceDate" class="form-label">Дата проведения *</label>
                                        <input type="date" class="form-control" id="attendanceDate" required>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="attendanceSubject" class="form-label">Предмет *</label>
                                        <select class="form-select" id="attendanceSubject" required>
                                            <option value="">Выберите предмет</option>
                                            ${this.appData.subjects.map(subject => 
                                                `<option value="${subject.id}">${subject.name}</option>`
                                            ).join('')}
                                        </select>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="attendanceGroup" class="form-label">Группа *</label>
                                        <select class="form-select" id="attendanceGroup" required>
                                            <option value="">Выберите группу</option>
                                            ${[...new Set(this.appData.students.map(s => s.group))].map(group => 
                                                `<option value="${group}">${group}</option>`
                                            ).join('')}
                                        </select>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label">Результаты студентов:</label>
                                <div class="alert alert-info">
                                    <i class="bi bi-info-circle me-2"></i>
                                    Отметьте результаты сдачи зачётного мероприятия
                                </div>
                                <div id="studentsAttendanceList" class="border rounded p-3" style="max-height: 400px; overflow-y: auto;">
                                    ${this.renderStudentsAttendanceList()}
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Отмена</button>
                        <button type="button" class="btn btn-success" onclick="app.saveAttendance()">
                            <i class="bi bi-check-lg me-1"></i>Зачесть мероприятие
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    const oldModal = document.getElementById('markAttendanceModal');
    if (oldModal) oldModal.remove();
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Устанавливаем сегодняшнюю дату по умолчанию
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('attendanceDate').value = today;
    
    // Обновляем список студентов при выборе группы
    document.getElementById('attendanceGroup').addEventListener('change', (e) => {
        this.updateStudentsAttendanceList(e.target.value);
    });
    
    const modal = new bootstrap.Modal(document.getElementById('markAttendanceModal'));
    modal.show();
}

renderStudentsAttendanceList(groupFilter = '') {
    let students = this.appData.students;
    if (groupFilter) {
        students = students.filter(s => s.group === groupFilter);
    }
    
    if (students.length === 0) {
        return '<p class="text-muted text-center">Выберите группу для отображения студентов</p>';
    }
    
    return students.map(student => `
        <div class="d-flex justify-content-between align-items-center mb-2 p-2 border-bottom">
            <div>
                <i class="bi bi-person-circle me-2 text-primary"></i>
                <strong>${student.name}</strong>
                <small class="text-muted ms-2">${student.group}</small>
            </div>
            <div class="btn-group btn-group-sm" role="group">
                <input type="radio" class="btn-check" name="attendance_${student.id}" id="present_${student.id}" value="present" checked>
                <label class="btn btn-outline-success" for="present_${student.id}">Присут.</label>
                
                <input type="radio" class="btn-check" name="attendance_${student.id}" id="absent_${student.id}" value="absent">
                <label class="btn btn-outline-danger" for="absent_${student.id}">Отсут.</label>
                
                <input type="radio" class="btn-check" name="attendance_${student.id}" id="excused_${student.id}" value="excused">
                <label class="btn btn-outline-info" for="excused_${student.id}">Уваж.</label>
            </div>
        </div>
    `).join('');
}

updateStudentsAttendanceList(group) {
        const container = document.getElementById('studentsAttendanceList');
        if (container) {
            container.innerHTML = this.renderStudentsAttendanceList(group);
        }
    }

saveAttendance() {
    try {
        const type = document.getElementById('attendanceType')?.value;
        const date = document.getElementById('attendanceDate')?.value;
        const subjectId = document.getElementById('attendanceSubject')?.value;
        const group = document.getElementById('attendanceGroup')?.value;
        
        if (!type || !date || !subjectId || !group) {
            this.showAlert('Ошибка', 'Заполните все обязательные поля!', 'warning');
            return;
        }
        
        // Собираем данные о ПРИСУТСТВИИ студентов
        const records = [];
        const studentsInGroup = this.appData.students.filter(s => s.group === group);
        
        studentsInGroup.forEach(student => {
            const statusElement = document.querySelector(`input[name="attendance_${student.id}"]:checked`);
            if (statusElement) {
                records.push({
                    studentId: student.id,
                    status: statusElement.value, // present, absent, excused
                    markedAt: new Date().toISOString()
                });
            }
        });
        
        if (records.length === 0) {
            this.showAlert('Ошибка', 'Отметьте присутствие хотя бы одного студента!', 'warning');
            return;
        }
        
        const attendanceEvent = {
            id: this.generateId(),
            type: type,
            date: date,
            subjectId: subjectId,
            group: group,
            records: records,
            teacherId: this.currentUser?.id,
            createdAt: new Date().toISOString()
        };
        
        if (!this.appData.attendanceEvents) {
            this.appData.attendanceEvents = [];
        }
        
        this.appData.attendanceEvents.push(attendanceEvent);
        
        if (this.saveData()) {
            const modal = bootstrap.Modal.getInstance(document.getElementById('markAttendanceModal'));
            if (modal) modal.hide();

            this.createAttendanceNotification(attendanceEvent);
            
            this.showAlert('Успех', 'Присутствие на зачётном мероприятии сохранено!', 'success');
            this.loadAttendanceTab();
        }
    } catch (error) {
        console.error('Ошибка сохранения присутствия:', error);
        this.showAlert('Ошибка', 'Не удалось сохранить присутствие', 'danger');
    }
}

viewAttendanceDetails(eventId) {
    const event = this.appData.attendanceEvents.find(e => e.id === eventId);
    if (!event) return;
    
    const subject = this.appData.subjects.find(s => s.id === event.subjectId);
    const typeLabels = {
        'exam': 'Экзамен',
        'test': 'Зачёт',
        'diff_test': 'Дифференцированный зачёт',
        'thesis_defense': 'Защита ВКР',
        'qualification_exam': 'Квалификационный экзамен'
    };
    
    const statusLabels = {
        'present': 'Присутствовал',
        'absent': 'Отсутствовал',
        'excused': 'Уважительная причина'
    };
    
    const statusColors = {
        'present': 'success',
        'absent': 'danger',
        'excused': 'info'
    };
    
    let html = `
        <div class="modal fade" id="attendanceDetailsModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="bi bi-journal-check me-2"></i>Присутствие на зачётном мероприятии
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row mb-4">
                            <div class="col-md-6">
                                <p><strong>Тип мероприятия:</strong> <span class="badge bg-primary">${typeLabels[event.type]}</span></p>
                                <p><strong>Дата проведения:</strong> ${new Date(event.date).toLocaleDateString('ru-RU')}</p>
                                <p><strong>Предмет:</strong> ${subject ? subject.name : 'Не указан'}</p>
                            </div>
                            <div class="col-md-6">
                                <p><strong>Группа:</strong> <span class="badge bg-secondary">${event.group}</span></p>
                                <p><strong>Преподаватель:</strong> ${this.currentUser?.name || 'Не указан'}</p>
                            </div>
                        </div>
                        
                        <h6>Присутствие студентов:</h6>
                        <div class="table-responsive">
                            <table class="table table-sm">
                                <thead>
                                    <tr>
                                        <th>Студент</th>
                                        <th>Статус</th>
                                        <th>Время отметки</th>
                                    </tr>
                                </thead>
                                <tbody>
    `;
    
    event.records.forEach(record => {
        const student = this.appData.students.find(s => s.id === record.studentId);
        if (student) {
            html += `
                <tr>
                    <td>
                        <i class="bi bi-person-circle me-1 text-primary"></i>
                        ${student.name}
                    </td>
                    <td>
                        <span class="badge bg-${statusColors[record.status]}">
                            ${statusLabels[record.status]}
                        </span>
                    </td>
                    <td>
                        <small class="text-muted">
                            ${new Date(record.markedAt).toLocaleString('ru-RU')}
                        </small>
                    </td>
                </tr>
            `;
        }
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
    
    const oldModal = document.getElementById('attendanceDetailsModal');
    if (oldModal) oldModal.remove();
    
    document.body.insertAdjacentHTML('beforeend', html);
    const modal = new bootstrap.Modal(document.getElementById('attendanceDetailsModal'));
    modal.show();
}

deleteAttendanceEvent(eventId) {
    try {
        if (confirm('Удалить это зачётное мероприятие и все записи о присутствии?')) {
            this.appData.attendanceEvents = this.appData.attendanceEvents.filter(e => e.id !== eventId);
            
            if (this.saveData()) {
                this.showAlert('Удалено', 'Зачётное мероприятие удалено', 'info');
                this.loadAttendanceTab();
            }
        }
    } catch (error) {
        console.error('Ошибка удаления мероприятия:', error);
        this.showAlert('Ошибка', 'Не удалось удалить мероприятие', 'danger');
    }
}

// КАЛЕНДАРЬ
loadCalendarTab() {
    try {
        const container = document.getElementById('calendarTab');
        const currentDate = new Date();
        const isStudent = this.currentUser.role === 'student';
        
        container.innerHTML = `
            <div class="row">
                <div class="col-12">
                    <div class="d-flex justify-content-between align-items-center mb-4">
                        <h2 class="h3 mb-0">
                            <i class="bi bi-calendar me-2 text-primary"></i>
                            ${isStudent ? 'Моё расписание' : 'Календарь мероприятий'}
                        </h2>
                        <div>
                            <button class="btn btn-outline-secondary me-2" onclick="app.prevMonth()">
                                <i class="bi bi-chevron-left"></i>
                            </button>
                            <span id="currentMonth" class="fw-bold fs-5">${this.getMonthYearString(currentDate)}</span>
                            <button class="btn btn-outline-secondary ms-2" onclick="app.nextMonth()">
                                <i class="bi bi-chevron-right"></i>
                            </button>
                            ${!isStudent ? `
                                <button class="btn btn-primary ms-3" onclick="app.showAddEventModal()">
                                    <i class="bi bi-plus-circle me-1"></i>Добавить событие
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
            
            ${!isStudent ? `
                <div class="row mb-3">
                    <div class="col-12">
                        <div class="card">
                            <div class="card-body">
                                <div class="d-flex flex-wrap gap-2">
                                    <span class="badge bg-danger">Экзамен</span>
                                    <span class="badge bg-primary">Зачёт</span>
                                    <span class="badge bg-success">Консультация</span>
                                    <span class="badge bg-warning">Практика</span>
                                    <span class="badge bg-info">ВКР</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ` : ''}
            
            <div class="row">
                <div class="col-12">
                    <div id="calendarContainer">
                        ${this.renderCalendar(currentDate)}
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Ошибка загрузки календаря:', error);
        this.showAlert('Ошибка', 'Не удалось загрузить календарь', 'danger');
    }
}

getMonthYearString(date) {
    const months = [
        'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
        'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
}

renderCalendar(date) {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    let html = `
        <div class="calendar-grid">
            <div class="calendar-header-day bg-light text-center fw-bold py-2">Пн</div>
            <div class="calendar-header-day bg-light text-center fw-bold py-2">Вт</div>
            <div class="calendar-header-day bg-light text-center fw-bold py-2">Ср</div>
            <div class="calendar-header-day bg-light text-center fw-bold py-2">Чт</div>
            <div class="calendar-header-day bg-light text-center fw-bold py-2">Пт</div>
            <div class="calendar-header-day bg-light text-center fw-bold py-2">Сб</div>
            <div class="calendar-header-day bg-light text-center fw-bold py-2">Вс</div>
    `;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isStudent = this.currentUser.role === 'student';
    
    for (let i = 0; i < 42; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        
        const isCurrentMonth = currentDate.getMonth() === date.getMonth();
        const isToday = currentDate.getTime() === today.getTime();
        const dayEvents = this.getEventsForDate(currentDate, isStudent);
        
        let dayClass = 'calendar-day';
        if (!isCurrentMonth) dayClass += ' other-month';
        if (isToday) dayClass += ' today';
        if (dayEvents.length > 0) dayClass += ' has-events';
        
        html += `
            <div class="${dayClass}" onclick="app.showDayEvents('${currentDate.toISOString()}', ${isStudent})">
                <div class="day-number">${currentDate.getDate()}</div>
                ${this.renderEventDots(dayEvents)}
            </div>
        `;
    }
    
    html += `</div>`;
    return html;
}

getEventsForDate(date, isStudent = false) {
    if (!this.appData.calendarEvents) {
        this.appData.calendarEvents = [];
    }
    
    const dateStr = date.toISOString().split('T')[0];
    let events = this.appData.calendarEvents.filter(event => 
        event.date.startsWith(dateStr)
    );
    
    // Если это студент, фильтруем события только по его группе
    if (isStudent && this.currentUser.role === 'student') {
        events = events.filter(event => 
            event.group === this.currentUser.group || 
            !event.group || // События без группы видны всем
            event.group === ''
        );
    }
    
    return events;
}

renderEventDots(events) {
    if (events.length === 0) return '';
    
    const typeColors = {
        'exam': 'danger',
        'test': 'primary', 
        'consultation': 'success',
        'practice': 'warning',
        'thesis': 'info'
    };
    
    let dots = '<div class="calendar-event-dots">';
    events.slice(0, 3).forEach(event => {
        dots += `<span class="event-dot bg-${typeColors[event.type]}" title="${event.title}"></span>`;
    });
    if (events.length > 3) {
        dots += `<span class="event-dot-more">+${events.length - 3}</span>`;
    }
    dots += '</div>';
    
    return dots;
}

showAddEventModal() {
    // Проверяем, что пользователь не студент
    if (this.currentUser.role === 'student') {
        this.showAlert('Ошибка доступа', 'Студенты не могут создавать события', 'warning');
        return;
    }
    const modalHTML = `
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
                                    <option value="exam">Экзамен</option>
                                    <option value="test">Зачёт</option>
                                    <option value="consultation">Консультация</option>
                                    <option value="practice">Практика</option>
                                    <option value="thesis">ВКР</option>
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
                                <label for="eventSubject" class="form-label">Предмет</label>
                                <select class="form-select" id="eventSubject">
                                    <option value="">Выберите предмет</option>
                                    ${this.appData.subjects.map(subject => 
                                        `<option value="${subject.id}">${subject.name}</option>`
                                    ).join('')}
                                </select>
                            </div>
                            <div class="mb-3">
                                <label for="eventGroup" class="form-label">Группа</label>
                                <input type="text" class="form-control" id="eventGroup" placeholder="Например: ИТ-21">
                            </div>
                            <div class="mb-3">
                                <label for="eventDescription" class="form-label">Описание</label>
                                <textarea class="form-control" id="eventDescription" rows="3"></textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Отмена</button>
                        <button type="button" class="btn btn-primary" onclick="app.addCalendarEvent()">Добавить</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    const oldModal = document.getElementById('addEventModal');
    if (oldModal) oldModal.remove();
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Устанавливаем сегодняшнюю дату по умолчанию
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('eventDate').value = today;
    
    const modal = new bootstrap.Modal(document.getElementById('addEventModal'));
    modal.show();
}

addCalendarEvent() {
    try {
        const title = document.getElementById('eventTitle')?.value.trim();
        const type = document.getElementById('eventType')?.value;
        const date = document.getElementById('eventDate')?.value;
        const time = document.getElementById('eventTime')?.value;
        const subjectId = document.getElementById('eventSubject')?.value;
        const group = document.getElementById('eventGroup')?.value.trim();
        const description = document.getElementById('eventDescription')?.value.trim();
        
        if (!title || !type || !date) {
            this.showAlert('Ошибка', 'Заполните обязательные поля!', 'warning');
            return;
        }

        // Создаем полную дату с временем
        let fullDate = date;
        if (time) {
            fullDate += `T${time}`;
        }

        const event = {
            id: this.generateId(),
            title: title,
            type: type,
            date: fullDate,
            subjectId: subjectId || null,
            group: group || '',
            description: description || '',
            teacherId: this.currentUser?.id,
            createdAt: new Date().toISOString()
        };

        if (!this.appData.calendarEvents) {
            this.appData.calendarEvents = [];
        }
        
        this.appData.calendarEvents.push(event);
        
        if (this.saveData()) {
            const modal = bootstrap.Modal.getInstance(document.getElementById('addEventModal'));
            if (modal) modal.hide();

            this.createCalendarEventNotification(event);
            
            this.showAlert('Успех', 'Событие добавлено в календарь', 'success');
            this.loadCalendarTab();
        }
    } catch (error) {
        console.error('Ошибка добавления события:', error);
        this.showAlert('Ошибка', 'Не удалось добавить событие', 'danger');
    }
}

showDayEvents(dateString, isStudent = false) {
    const date = new Date(dateString);
    const events = this.getEventsForDate(date, isStudent);
    
    if (events.length === 0) {
        this.showAlert('Информация', 'На эту дату событий нет', 'info');
        return;
    }

    let html = `
        <div class="modal fade" id="dayEventsModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="bi bi-calendar-date me-2"></i>
                            События на ${date.toLocaleDateString('ru-RU')}
                            ${isStudent ? ' (моя группа)' : ''}
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="list-group">
    `;
    
    const typeLabels = {
        'exam': 'Экзамен',
        'test': 'Зачёт',
        'consultation': 'Консультация', 
        'practice': 'Практика',
        'thesis': 'ВКР'
    };
    
    const typeColors = {
        'exam': 'danger',
        'test': 'primary',
        'consultation': 'success',
        'practice': 'warning', 
        'thesis': 'info'
    };
    
    events.forEach(event => {
        const subject = this.appData.subjects.find(s => s.id === event.subjectId);
        const eventDate = new Date(event.date);
        
        html += `
            <div class="list-group-item">
                <div class="d-flex justify-content-between align-items-start">
                    <div class="flex-grow-1">
                        <div class="d-flex align-items-center mb-2">
                            <span class="badge bg-${typeColors[event.type]} me-2">${typeLabels[event.type]}</span>
                            <h6 class="mb-0">${event.title}</h6>
                        </div>
                        ${event.time ? `<p class="mb-1"><small><i class="bi bi-clock me-1"></i>${eventDate.toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit'})}</small></p>` : ''}
                        ${subject ? `<p class="mb-1"><small><i class="bi bi-book me-1"></i>${subject.name}</small></p>` : ''}
                        ${event.group ? `<p class="mb-1"><small><i class="bi bi-people me-1"></i>${event.group}</small></p>` : ''}
                        ${event.description ? `<p class="mb-0 mt-2">${event.description}</p>` : ''}
                    </div>
                    ${!isStudent ? `
                        <button class="btn btn-sm btn-outline-danger ms-2" onclick="app.deleteCalendarEvent('${event.id}')">
                            <i class="bi bi-trash"></i>
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    });
    
    html += `
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    const oldModal = document.getElementById('dayEventsModal');
    if (oldModal) oldModal.remove();
    
    document.body.insertAdjacentHTML('beforeend', html);
    const modal = new bootstrap.Modal(document.getElementById('dayEventsModal'));
    modal.show();
}

deleteCalendarEvent(eventId) {
    try {
        if (confirm('Удалить это событие?')) {
            this.appData.calendarEvents = this.appData.calendarEvents.filter(e => e.id !== eventId);
            
            if (this.saveData()) {
                this.showAlert('Удалено', 'Событие удалено', 'info');
                
                // Закрываем модальное окно и перезагружаем календарь
                const modal = bootstrap.Modal.getInstance(document.getElementById('dayEventsModal'));
                if (modal) modal.hide();
                
                this.loadCalendarTab();
            }
        }
    } catch (error) {
        console.error('Ошибка удаления события:', error);
        this.showAlert('Ошибка', 'Не удалось удалить событие', 'danger');
    }
}

prevMonth() {
    const currentMonthElem = document.getElementById('currentMonth');
    if (!currentMonthElem) return;
    
    const currentText = currentMonthElem.textContent;
    const [month, year] = currentText.split(' ');
    const months = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
    const currentMonthIndex = months.indexOf(month);
    const currentYear = parseInt(year);
    
    let newMonth = currentMonthIndex - 1;
    let newYear = currentYear;
    
    if (newMonth < 0) {
        newMonth = 11;
        newYear--;
    }
    
    const newDate = new Date(newYear, newMonth, 1);
    this.loadCalendarForMonth(newDate);
}

nextMonth() {
    const currentMonthElem = document.getElementById('currentMonth');
    if (!currentMonthElem) return;
    
    const currentText = currentMonthElem.textContent;
    const [month, year] = currentText.split(' ');
    const months = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
    const currentMonthIndex = months.indexOf(month);
    const currentYear = parseInt(year);
    
    let newMonth = currentMonthIndex + 1;
    let newYear = currentYear;
    
    if (newMonth > 11) {
        newMonth = 0;
        newYear++;
    }
    
    const newDate = new Date(newYear, newMonth, 1);
    this.loadCalendarForMonth(newDate);
}

loadCalendarForMonth(date) {
    document.getElementById('currentMonth').textContent = this.getMonthYearString(date);
    document.getElementById('calendarContainer').innerHTML = this.renderCalendar(date);
}

// СИСТЕМА ОТЧЁТОВ
loadReportsTab() {
    try {
        const container = document.getElementById('reportsTab');
        
        container.innerHTML = `
            <div class="row">
                <div class="col-12">
                    <div class="d-flex justify-content-between align-items-center mb-4">
                        <h2 class="h3 mb-0">
                            <i class="bi bi-graph-up me-2 text-info"></i>Система отчётов
                        </h2>
                    </div>
                </div>
            </div>

            <div class="row">
                <div class="col-md-4 mb-4">
                    <div class="card card-hover h-100" onclick="app.generatePerformanceReport()">
                        <div class="card-body text-center">
                            <i class="bi bi-journal-text display-4 text-primary mb-3"></i>
                            <h5 class="card-title">Отчёт по успеваемости</h5>
                            <p class="card-text text-muted">Ведомость оценок по группам и предметам</p>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-4 mb-4">
                    <div class="card card-hover h-100" onclick="app.generateAttendanceReport()">
                        <div class="card-body text-center">
                            <i class="bi bi-clipboard-data display-4 text-success mb-3"></i>
                            <h5 class="card-title">Отчёт по посещаемости</h5>
                            <p class="card-text text-muted">Статистика зачётных мероприятий</p>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-4 mb-4">
                    <div class="card card-hover h-100" onclick="app.showAcademicTranscriptModal()">
                        <div class="card-body text-center">
                            <i class="bi bi-file-earmark-person display-4 text-warning mb-3"></i>
                            <h5 class="card-title">Академическая справка</h5>
                            <p class="card-text text-muted">Индивидуальная справка для студента</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="row">
                <div class="col-md-6 mb-4">
                    <div class="card card-hover h-100" onclick="app.generateSubjectReport()">
                        <div class="card-body text-center">
                            <i class="bi bi-book display-4 text-danger mb-3"></i>
                            <h5 class="card-title">Отчёт по предмету</h5>
                            <p class="card-text text-muted">Статистика успеваемости по предмету</p>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-6 mb-4">
                    <div class="card card-hover h-100" onclick="app.generateGroupReport()">
                        <div class="card-body text-center">
                            <i class="bi bi-people display-4 text-info mb-3"></i>
                            <h5 class="card-title">Отчёт по группе</h5>
                            <p class="card-text text-muted">Полная статистика по учебной группе</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Ошибка загрузки вкладки отчётов:', error);
        this.showAlert('Ошибка', 'Не удалось загрузить раздел отчётов', 'danger');
    }
}

// ОТЧЁТ ПО УСПЕВАЕМОСТИ
generatePerformanceReport() {
    try {
        const modalHTML = `
            <div class="modal fade" id="performanceReportModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Отчёт по успеваемости</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="performanceReportForm">
                                <div class="mb-3">
                                    <label for="reportGroup" class="form-label">Группа</label>
                                    <select class="form-select" id="reportGroup">
                                        <option value="">Все группы</option>
                                        ${[...new Set(this.appData.students.map(s => s.group))].map(group => 
                                            `<option value="${group}">${group}</option>`
                                        ).join('')}
                                    </select>
                                </div>
                                <div class="mb-3">
                                    <label for="reportSubject" class="form-label">Предмет</label>
                                    <select class="form-select" id="reportSubject">
                                        <option value="">Все предметы</option>
                                        ${this.appData.subjects.map(subject => 
                                            `<option value="${subject.id}">${subject.name}</option>`
                                        ).join('')}
                                    </select>
                                </div>
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label for="reportDateFrom" class="form-label">Дата с</label>
                                            <input type="date" class="form-control" id="reportDateFrom">
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label for="reportDateTo" class="form-label">Дата по</label>
                                            <input type="date" class="form-control" id="reportDateTo">
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Отмена</button>
                            <button type="button" class="btn btn-primary" onclick="app.showPerformanceReport()">
                                <i class="bi bi-eye me-1"></i>Просмотреть
                            </button>
                            <button type="button" class="btn btn-success" onclick="app.exportPerformanceReport()">
                                <i class="bi bi-download me-1"></i>Экспорт PDF
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        const modal = new bootstrap.Modal(document.getElementById('performanceReportModal'));
        modal.show();
        
        // Очистка при закрытии
        document.getElementById('performanceReportModal').addEventListener('hidden.bs.modal', function() {
            this.remove();
        });
    } catch (error) {
        console.error('Ошибка создания отчёта:', error);
        this.showAlert('Ошибка', 'Не удалось создать отчёт', 'danger');
    }
}

showPerformanceReport() {
    try {
        const group = document.getElementById('reportGroup')?.value;
        const subjectId = document.getElementById('reportSubject')?.value;
        const dateFrom = document.getElementById('reportDateFrom')?.value;
        const dateTo = document.getElementById('reportDateTo')?.value;
        
        let students = this.appData.students;
        if (group) {
            students = students.filter(s => s.group === group);
        }
        
        let grades = this.appData.grades;
        if (subjectId) {
            grades = grades.filter(g => g.subjectId === subjectId);
        }
        if (dateFrom) {
            grades = grades.filter(g => new Date(g.date) >= new Date(dateFrom));
        }
        if (dateTo) {
            grades = grades.filter(g => new Date(g.date) <= new Date(dateTo));
        }
        
        const reportData = this.generatePerformanceReportData(students, grades);
        this.showReportModal('Отчёт по успеваемости', reportData);
        
    } catch (error) {
        console.error('Ошибка показа отчёта:', error);
        this.showAlert('Ошибка', 'Не удалось сформировать отчёт', 'danger');
    }
}

generatePerformanceReportData(students, grades) {
    const subject = this.appData.subjects.find(s => s.id === document.getElementById('reportSubject')?.value);
    const group = document.getElementById('reportGroup')?.value;
    
    let html = `
        <div class="report-preview-container">
            <div class="report-header">
                <div class="report-title">ВЕДОМОСТЬ УСПЕВАЕМОСТИ</div>
                <div class="report-subtitle">${subject ? `По предмету: ${subject.name}` : 'По всем предметам'} ${group ? ` | Группа: ${group}` : ''}</div>
                <div class="report-meta">
                    <span>Дата формирования: ${new Date().toLocaleDateString('ru-RU')}</span>
                    <span>Преподаватель: ${this.currentUser?.name || 'Не указан'}</span>
                </div>
            </div>
            
            <div class="report-stats mb-4">
                <div class="row">
                    <div class="col-3">
                        <div class="report-stat">
                            <div class="report-stat-number">${students.length}</div>
                            <div class="report-stat-label">Студентов</div>
                        </div>
                    </div>
                    <div class="col-3">
                        <div class="report-stat">
                            <div class="report-stat-number">${grades.length}</div>
                            <div class="report-stat-label">Оценок</div>
                        </div>
                    </div>
                    <div class="col-3">
                        <div class="report-stat">
                            <div class="report-stat-number">${this.calculateAverageGrade(grades)}</div>
                            <div class="report-stat-label">Средний балл</div>
                        </div>
                    </div>
                    <div class="col-3">
                        <div class="report-stat">
                            <div class="report-stat-number">${this.calculateSuccessRate(grades)}%</div>
                            <div class="report-stat-label">Успеваемость</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="table-responsive">
                <table class="table table-bordered report-table">
                    <thead>
                        <tr>
                            <th>№</th>
                            <th>ФИО студента</th>
                            <th>Группа</th>
                            <th>Кол-во оценок</th>
                            <th>Средний балл</th>
                            <th>Последняя оценка</th>
                        </tr>
                    </thead>
                    <tbody>
    `;
    
    students.forEach((student, index) => {
        const studentGrades = grades.filter(g => g.studentId === student.id);
        const studentStats = this.getStudentStatistics(student.id);
        const lastGrade = studentGrades.length > 0 ? studentGrades[studentGrades.length - 1] : null;
        
        html += `
            <tr>
                <td>${index + 1}</td>
                <td>${student.name}</td>
                <td>${student.group}</td>
                <td>${studentGrades.length}</td>
                <td>${studentStats.averageGrade}</td>
                <td>${lastGrade ? `<span class="badge ${this.getGradeClass(lastGrade.grade)}">${lastGrade.grade}</span>` : '-'}</td>
            </tr>
        `;
    });
    
    html += `
                    </tbody>
                </table>
            </div>
            
            <div class="mt-4 pt-4 border-top">
                <div class="row">
                    <div class="col-md-6">
                        <p><strong>Преподаватель:</strong> _________________</p>
                    </div>
                    <div class="col-md-6 text-end">
                        <p><strong>Дата:</strong> _________________</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    return html;
}

calculateAverageGrade(grades) {
    const numericGrades = grades
        .map(g => parseInt(g.grade))
        .filter(g => !isNaN(g));
    
    return numericGrades.length > 0 ? (numericGrades.reduce((a, b) => a + b, 0) / numericGrades.length).toFixed(2) : '0.00';
}

calculateSuccessRate(grades) {
    const passedGrades = grades.filter(g => {
        const grade = g.grade;
        return grade === '5' || grade === '4' || grade === '3' || grade === 'зачёт';
    });
    
    return grades.length > 0 ? Math.round((passedGrades.length / grades.length) * 100) : 0;
}

showReportModal(title, content) {
    const modalHTML = `
        <div class="modal fade" id="reportViewModal" tabindex="-1">
            <div class="modal-dialog modal-xl">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">${title}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        ${content}
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Закрыть</button>
                        <button type="button" class="btn btn-primary" onclick="app.printReport()">
                            <i class="bi bi-printer me-1"></i>Печать
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    const oldModal = document.getElementById('reportViewModal');
    if (oldModal) oldModal.remove();
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const modal = new bootstrap.Modal(document.getElementById('reportViewModal'));
    modal.show();
}

printReport() {
    window.print();
}

// ОТЧЁТ ПО ПОСЕЩАЕМОСТИ
generateAttendanceReport() {
    try {
        if (!this.appData.attendanceEvents || this.appData.attendanceEvents.length === 0) {
            this.showAlert('Информация', 'Нет данных о зачётных мероприятиях', 'info');
            return;
        }
        
        let html = `
            <div class="report-preview-container">
                <div class="report-header">
                    <div class="report-title">ОТЧЁТ ПО ПОСЕЩАЕМОСТИ</div>
                    <div class="report-subtitle">Зачётные мероприятия</div>
                    <div class="report-meta">
                        <span>Дата формирования: ${new Date().toLocaleDateString('ru-RU')}</span>
                        <span>Период: за весь период</span>
                    </div>
                </div>
                
                <div class="report-stats mb-4">
                    <div class="row">
                        <div class="col-3">
                            <div class="report-stat">
                                <div class="report-stat-number">${this.appData.attendanceEvents.length}</div>
                                <div class="report-stat-label">Мероприятий</div>
                            </div>
                        </div>
                        <div class="col-3">
                            <div class="report-stat">
                                <div class="report-stat-number">${this.getAttendanceStats().attendanceRate}%</div>
                                <div class="report-stat-label">Посещаемость</div>
                            </div>
                        </div>
                        <div class="col-3">
                            <div class="report-stat">
                                <div class="report-stat-number">${this.getAttendanceStats().absentCount}</div>
                                <div class="report-stat-label">Пропусков</div>
                            </div>
                        </div>
                        <div class="col-3">
                            <div class="report-stat">
                                <div class="report-stat-number">${this.getAttendanceStats().excusedCount}</div>
                                <div class="report-stat-label">Уважительных</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="table-responsive">
                    <table class="table table-bordered report-table">
                        <thead>
                            <tr>
                                <th>Дата</th>
                                <th>Тип мероприятия</th>
                                <th>Предмет</th>
                                <th>Группа</th>
                                <th>Присутствовало</th>
                                <th>Посещаемость</th>
                            </tr>
                        </thead>
                        <tbody>
        `;
        
        const typeLabels = {
            'exam': 'Экзамен',
            'test': 'Зачёт',
            'diff_test': 'Диф. зачёт',
            'thesis_defense': 'Защита ВКР',
            'qualification_exam': 'Квалиф. экзамен'
        };
        
        this.appData.attendanceEvents
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .forEach(event => {
                const subject = this.appData.subjects.find(s => s.id === event.subjectId);
                const totalStudents = event.records ? event.records.length : 0;
                const presentStudents = event.records ? event.records.filter(r => r.status === 'present').length : 0;
                const attendancePercent = totalStudents > 0 ? Math.round((presentStudents / totalStudents) * 100) : 0;
                
                html += `
                    <tr>
                        <td>${new Date(event.date).toLocaleDateString('ru-RU')}</td>
                        <td>${typeLabels[event.type]}</td>
                        <td>${subject ? subject.name : 'Не указан'}</td>
                        <td>${event.group}</td>
                        <td>${presentStudents}/${totalStudents}</td>
                        <td>${attendancePercent}%</td>
                    </tr>
                `;
            });
        
        html += `
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
        this.showReportModal('Отчёт по посещаемости', html);
        
    } catch (error) {
        console.error('Ошибка создания отчёта по посещаемости:', error);
        this.showAlert('Ошибка', 'Не удалось создать отчёт', 'danger');
    }
}

// АКАДЕМИЧЕСКАЯ СПРАВКА
showAcademicTranscriptModal() {
    try {
        const modalHTML = `
            <div class="modal fade" id="academicTranscriptModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Академическая справка</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="academicTranscriptForm">
                                <div class="mb-3">
                                    <label for="transcriptStudent" class="form-label">Студент</label>
                                    <select class="form-select" id="transcriptStudent" required>
                                        <option value="">Выберите студента</option>
                                        ${this.appData.students.map(student => 
                                            `<option value="${student.id}">${student.name} (${student.group})</option>`
                                        ).join('')}
                                    </select>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Отмена</button>
                            <button type="button" class="btn btn-primary" onclick="app.generateAcademicTranscript()">
                                <i class="bi bi-eye me-1"></i>Сформировать
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        const modal = new bootstrap.Modal(document.getElementById('academicTranscriptModal'));
        modal.show();
        
    } catch (error) {
        console.error('Ошибка создания справки:', error);
        this.showAlert('Ошибка', 'Не удалось создать форму справки', 'danger');
    }
}

generateAcademicTranscript() {
    try {
        const studentId = document.getElementById('transcriptStudent')?.value;
        if (!studentId) {
            this.showAlert('Ошибка', 'Выберите студента!', 'warning');
            return;
        }
        
        const student = this.appData.students.find(s => s.id === studentId);
        if (!student) {
            this.showAlert('Ошибка', 'Студент не найден!', 'danger');
            return;
        }
        
        const studentGrades = this.appData.grades.filter(g => g.studentId === studentId);
        const studentStats = this.getStudentStatistics(studentId);
        
        let html = `
            <div class="report-preview-container">
                <div class="report-header text-center">
                    <div class="report-title">АКАДЕМИЧЕСКАЯ СПРАВКА</div>
                    <div class="report-subtitle">об успеваемости студента</div>
                </div>
                
                <div class="row mb-4">
                    <div class="col-md-6">
                        <p><strong>ФИО студента:</strong> ${student.name}</p>
                        <p><strong>Группа:</strong> ${student.group}</p>
                    </div>
                    <div class="col-md-6">
                        <p><strong>Дата формирования:</strong> ${new Date().toLocaleDateString('ru-RU')}</p>
                        <p><strong>Средний балл:</strong> <span class="badge bg-primary">${studentStats.averageGrade}</span></p>
                    </div>
                </div>
                
                <h6>Оценки по предметам:</h6>
                <div class="table-responsive">
                    <table class="table table-bordered report-table">
                        <thead>
                            <tr>
                                <th>Предмет</th>
                                <th>Оценки</th>
                                <th>Преподаватель</th>
                                <th>Даты</th>
                            </tr>
                        </thead>
                        <tbody>
        `;
        
        // Группируем оценки по предметам
        const gradesBySubject = {};
        studentGrades.forEach(grade => {
            const subject = this.appData.subjects.find(s => s.id === grade.subjectId);
            if (subject) {
                if (!gradesBySubject[subject.id]) {
                    gradesBySubject[subject.id] = {
                        subject: subject,
                        grades: []
                    };
                }
                gradesBySubject[subject.id].grades.push(grade);
            }
        });
        
        Object.values(gradesBySubject).forEach(({ subject, grades }) => {
            const gradeList = grades.map(g => 
                `<span class="badge ${this.getGradeClass(g.grade)} me-1">${g.grade}</span>`
            ).join('');
            
            const dates = grades.map(g => g.date).join(', ');
            
            html += `
                <tr>
                    <td>${subject.name}</td>
                    <td>${gradeList}</td>
                    <td>${subject.teacherName}</td>
                    <td><small>${dates}</small></td>
                </tr>
            `;
        });
        
        html += `
                        </tbody>
                    </table>
                </div>
                
                <div class="mt-4 pt-4 border-top">
                    <div class="row">
                        <div class="col-md-6">
                            <p><strong>Куратор:</strong> _________________</p>
                        </div>
                        <div class="col-md-6 text-end">
                            <p><strong>М.П.</strong></p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.showReportModal(`Академическая справка - ${student.name}`, html);
        
        // Закрываем модальное окно выбора студента
        const modal = bootstrap.Modal.getInstance(document.getElementById('academicTranscriptModal'));
        if (modal) modal.hide();
        
    } catch (error) {
        console.error('Ошибка создания академической справки:', error);
        this.showAlert('Ошибка', 'Не удалось создать справку', 'danger');
    }
}

// ОТЧЁТ ПО ПРЕДМЕТУ
generateSubjectReport() {
    try {
        const modalHTML = `
            <div class="modal fade" id="subjectReportModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Отчёт по предмету</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="subjectReportForm">
                                <div class="mb-3">
                                    <label for="subjectReportSelect" class="form-label">Предмет</label>
                                    <select class="form-select" id="subjectReportSelect" required>
                                        <option value="">Выберите предмет</option>
                                        ${this.appData.subjects.map(subject => 
                                            `<option value="${subject.id}">${subject.name}</option>`
                                        ).join('')}
                                    </select>
                                </div>
                                <div class="mb-3">
                                    <label for="subjectReportGroup" class="form-label">Группа (опционально)</label>
                                    <select class="form-select" id="subjectReportGroup">
                                        <option value="">Все группы</option>
                                        ${[...new Set(this.appData.students.map(s => s.group))].map(group => 
                                            `<option value="${group}">${group}</option>`
                                        ).join('')}
                                    </select>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Отмена</button>
                            <button type="button" class="btn btn-primary" onclick="app.showSubjectReport()">
                                <i class="bi bi-eye me-1"></i>Сформировать
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        const modal = new bootstrap.Modal(document.getElementById('subjectReportModal'));
        modal.show();
        
    } catch (error) {
        console.error('Ошибка создания отчёта по предмету:', error);
        this.showAlert('Ошибка', 'Не удалось создать отчёт', 'danger');
    }
}

showSubjectReport() {
    try {
        const subjectId = document.getElementById('subjectReportSelect')?.value;
        const group = document.getElementById('subjectReportGroup')?.value;
        
        if (!subjectId) {
            this.showAlert('Ошибка', 'Выберите предмет!', 'warning');
            return;
        }
        
        const subject = this.appData.subjects.find(s => s.id === subjectId);
        if (!subject) {
            this.showAlert('Ошибка', 'Предмет не найден!', 'danger');
            return;
        }
        
        let students = this.appData.students;
        if (group) {
            students = students.filter(s => s.group === group);
        }
        
        const subjectGrades = this.appData.grades.filter(g => g.subjectId === subjectId);
        const subjectAttendance = this.appData.attendanceEvents ? 
            this.appData.attendanceEvents.filter(e => e.subjectId === subjectId) : [];
        
        let html = `
            <div class="report-preview-container">
                <div class="report-header">
                    <div class="report-title">ОТЧЁТ ПО ПРЕДМЕТУ</div>
                    <div class="report-subtitle">${subject.name} ${group ? ` | Группа: ${group}` : ''}</div>
                    <div class="report-meta">
                        <span>Дата формирования: ${new Date().toLocaleDateString('ru-RU')}</span>
                        <span>Преподаватель: ${subject.teacherName}</span>
                    </div>
                </div>
                
                <div class="report-stats mb-4">
                    <div class="row">
                        <div class="col-3">
                            <div class="report-stat">
                                <div class="report-stat-number">${students.length}</div>
                                <div class="report-stat-label">Студентов</div>
                            </div>
                        </div>
                        <div class="col-3">
                            <div class="report-stat">
                                <div class="report-stat-number">${subjectGrades.length}</div>
                                <div class="report-stat-label">Оценок</div>
                            </div>
                        </div>
                        <div class="col-3">
                            <div class="report-stat">
                                <div class="report-stat-number">${this.calculateAverageGrade(subjectGrades)}</div>
                                <div class="report-stat-label">Средний балл</div>
                            </div>
                        </div>
                        <div class="col-3">
                            <div class="report-stat">
                                <div class="report-stat-number">${subjectAttendance.length}</div>
                                <div class="report-stat-label">Зачётов</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <h6>Успеваемость студентов:</h6>
                <div class="table-responsive mb-4">
                    <table class="table table-bordered report-table">
                        <thead>
                            <tr>
                                <th>Студент</th>
                                <th>Группа</th>
                                <th>Оценки</th>
                                <th>Средний балл</th>
                                <th>Статус</th>
                            </tr>
                        </thead>
                        <tbody>
        `;
        
        students.forEach(student => {
            const studentGrades = subjectGrades.filter(g => g.studentId === student.id);
            const studentStats = this.getStudentStatistics(student.id);
            const gradeList = studentGrades.map(g => 
                `<span class="badge ${this.getGradeClass(g.grade)} me-1">${g.grade}</span>`
            ).join('');
            
            const status = studentGrades.length > 0 ? 
                '<span class="badge bg-success">Оценен</span>' : 
                '<span class="badge bg-warning">Нет оценок</span>';
            
            html += `
                <tr>
                    <td>${student.name}</td>
                    <td>${student.group}</td>
                    <td>${gradeList || '-'}</td>
                    <td>${studentStats.averageGrade}</td>
                    <td>${status}</td>
                </tr>
            `;
        });
        
        html += `
                        </tbody>
                    </table>
                </div>
                
                <h6>Зачётные мероприятия:</h6>
                <div class="table-responsive">
                    <table class="table table-bordered report-table">
                        <thead>
                            <tr>
                                <th>Дата</th>
                                <th>Тип</th>
                                <th>Группа</th>
                                <th>Присутствовало</th>
                                <th>Посещаемость</th>
                            </tr>
                        </thead>
                        <tbody>
        `;
        
        const typeLabels = {
            'exam': 'Экзамен',
            'test': 'Зачёт',
            'diff_test': 'Диф. зачёт',
            'thesis_defense': 'Защита ВКР',
            'qualification_exam': 'Квалиф. экзамен'
        };
        
        subjectAttendance.forEach(event => {
            const totalStudents = event.records ? event.records.length : 0;
            const presentStudents = event.records ? event.records.filter(r => r.status === 'present').length : 0;
            const attendancePercent = totalStudents > 0 ? Math.round((presentStudents / totalStudents) * 100) : 0;
            
            html += `
                <tr>
                    <td>${new Date(event.date).toLocaleDateString('ru-RU')}</td>
                    <td>${typeLabels[event.type]}</td>
                    <td>${event.group}</td>
                    <td>${presentStudents}/${totalStudents}</td>
                    <td>${attendancePercent}%</td>
                </tr>
            `;
        });
        
        if (subjectAttendance.length === 0) {
            html += `
                <tr>
                    <td colspan="5" class="text-center text-muted">Нет данных о зачётных мероприятиях</td>
                </tr>
            `;
        }
        
        html += `
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
        this.showReportModal(`Отчёт по предмету - ${subject.name}`, html);
        
        // Закрываем модальное окно
        const modal = bootstrap.Modal.getInstance(document.getElementById('subjectReportModal'));
        if (modal) modal.hide();
        
    } catch (error) {
        console.error('Ошибка показа отчёта по предмету:', error);
        this.showAlert('Ошибка', 'Не удалось сформировать отчёт', 'danger');
    }
}

// ОТЧЁТ ПО ГРУППЕ
generateGroupReport() {
    try {
        const modalHTML = `
            <div class="modal fade" id="groupReportModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Отчёт по группе</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="groupReportForm">
                                <div class="mb-3">
                                    <label for="groupReportSelect" class="form-label">Группа</label>
                                    <select class="form-select" id="groupReportSelect" required>
                                        <option value="">Выберите группу</option>
                                        ${[...new Set(this.appData.students.map(s => s.group))].map(group => 
                                            `<option value="${group}">${group}</option>`
                                        ).join('')}
                                    </select>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Отмена</button>
                            <button type="button" class="btn btn-primary" onclick="app.showGroupReport()">
                                <i class="bi bi-eye me-1"></i>Сформировать
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        const modal = new bootstrap.Modal(document.getElementById('groupReportModal'));
        modal.show();
        
    } catch (error) {
        console.error('Ошибка создания отчёта по группе:', error);
        this.showAlert('Ошибка', 'Не удалось создать отчёт', 'danger');
    }
}

showGroupReport() {
    try {
        const group = document.getElementById('groupReportSelect')?.value;
        
        if (!group) {
            this.showAlert('Ошибка', 'Выберите группу!', 'warning');
            return;
        }
        
        const students = this.appData.students.filter(s => s.group === group);
        const groupGrades = this.appData.grades.filter(g => {
            const student = this.appData.students.find(s => s.id === g.studentId);
            return student && student.group === group;
        });
        
        const groupAttendance = this.appData.attendanceEvents ? 
            this.appData.attendanceEvents.filter(e => e.group === group) : [];
        
        // Рассчитываем статистику по предметам
        const subjectStats = {};
        this.appData.subjects.forEach(subject => {
            const subjectGrades = groupGrades.filter(g => g.subjectId === subject.id);
            if (subjectGrades.length > 0) {
                subjectStats[subject.id] = {
                    subject: subject,
                    grades: subjectGrades,
                    average: this.calculateAverageGrade(subjectGrades),
                    count: subjectGrades.length
                };
            }
        });
        
        let html = `
            <div class="report-preview-container">
                <div class="report-header">
                    <div class="report-title">ОТЧЁТ ПО УЧЕБНОЙ ГРУППЕ</div>
                    <div class="report-subtitle">Группа: ${group}</div>
                    <div class="report-meta">
                        <span>Дата формирования: ${new Date().toLocaleDateString('ru-RU')}</span>
                        <span>Количество студентов: ${students.length}</span>
                    </div>
                </div>
                
                <div class="report-stats mb-4">
                    <div class="row">
                        <div class="col-3">
                            <div class="report-stat">
                                <div class="report-stat-number">${students.length}</div>
                                <div class="report-stat-label">Студентов</div>
                            </div>
                        </div>
                        <div class="col-3">
                            <div class="report-stat">
                                <div class="report-stat-number">${groupGrades.length}</div>
                                <div class="report-stat-label">Оценок</div>
                            </div>
                        </div>
                        <div class="col-3">
                            <div class="report-stat">
                                <div class="report-stat-number">${this.calculateAverageGrade(groupGrades)}</div>
                                <div class="report-stat-label">Средний балл</div>
                            </div>
                        </div>
                        <div class="col-3">
                            <div class="report-stat">
                                <div class="report-stat-number">${Object.keys(subjectStats).length}</div>
                                <div class="report-stat-label">Предметов</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <h6>Успеваемость по предметам:</h6>
                <div class="table-responsive mb-4">
                    <table class="table table-bordered report-table">
                        <thead>
                            <tr>
                                <th>Предмет</th>
                                <th>Преподаватель</th>
                                <th>Кол-во оценок</th>
                                <th>Средний балл</th>
                                <th>Успеваемость</th>
                            </tr>
                        </thead>
                        <tbody>
        `;
        
        Object.values(subjectStats).forEach(({ subject, grades, average, count }) => {
            const successRate = this.calculateSuccessRate(grades);
            
            html += `
                <tr>
                    <td>${subject.name}</td>
                    <td>${subject.teacherName}</td>
                    <td>${count}</td>
                    <td>${average}</td>
                    <td>
                        <div class="progress" style="height: 8px;">
                            <div class="progress-bar ${successRate >= 80 ? 'bg-success' : successRate >= 60 ? 'bg-warning' : 'bg-danger'}" 
                                 style="width: ${successRate}%"></div>
                        </div>
                        <small>${successRate}%</small>
                    </td>
                </tr>
            `;
        });
        
        html += `
                        </tbody>
                    </table>
                </div>
                
                <h6>Рейтинг студентов:</h6>
                <div class="table-responsive mb-4">
                    <table class="table table-bordered report-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Студент</th>
                                <th>Кол-во оценок</th>
                                <th>Средний балл</th>
                                <th>Статус</th>
                            </tr>
                        </thead>
                        <tbody>
        `;
        
        // Сортируем студентов по среднему баллу
        const sortedStudents = students.map(student => {
            const stats = this.getStudentStatistics(student.id);
            return { student, stats };
        }).sort((a, b) => parseFloat(b.stats.averageGrade) - parseFloat(a.stats.averageGrade));
        
        sortedStudents.forEach(({ student, stats }, index) => {
            const rankClass = index === 0 ? 'table-success' : 
                            index === 1 ? 'table-info' : 
                            index === 2 ? 'table-warning' : '';
            
            html += `
                <tr class="${rankClass}">
                    <td>${index + 1}</td>
                    <td>${student.name}</td>
                    <td>${stats.totalGrades}</td>
                    <td><strong>${stats.averageGrade}</strong></td>
                    <td>
                        ${parseFloat(stats.averageGrade) >= 4.5 ? '🎓 Отличник' :
                          parseFloat(stats.averageGrade) >= 4.0 ? '📚 Хорошист' :
                          parseFloat(stats.averageGrade) >= 3.0 ? '✅ Успевающий' : '⚠️ Нужна помощь'}
                    </td>
                </tr>
            `;
        });
        
        html += `
                        </tbody>
                    </table>
                </div>
                
                <h6>Зачётные мероприятия:</h6>
                <div class="table-responsive">
                    <table class="table table-bordered report-table">
                        <thead>
                            <tr>
                                <th>Дата</th>
                                <th>Предмет</th>
                                <th>Тип</th>
                                <th>Присутствовало</th>
                                <th>Посещаемость</th>
                            </tr>
                        </thead>
                        <tbody>
        `;
        
        const typeLabels = {
            'exam': 'Экзамен',
            'test': 'Зачёт',
            'diff_test': 'Диф. зачёт',
            'thesis_defense': 'Защита ВКР',
            'qualification_exam': 'Квалиф. экзамен'
        };
        
        groupAttendance.forEach(event => {
            const subject = this.appData.subjects.find(s => s.id === event.subjectId);
            const totalStudents = event.records ? event.records.length : 0;
            const presentStudents = event.records ? event.records.filter(r => r.status === 'present').length : 0;
            const attendancePercent = totalStudents > 0 ? Math.round((presentStudents / totalStudents) * 100) : 0;
            
            html += `
                <tr>
                    <td>${new Date(event.date).toLocaleDateString('ru-RU')}</td>
                    <td>${subject ? subject.name : 'Не указан'}</td>
                    <td>${typeLabels[event.type]}</td>
                    <td>${presentStudents}/${totalStudents}</td>
                    <td>${attendancePercent}%</td>
                </tr>
            `;
        });
        
        if (groupAttendance.length === 0) {
            html += `
                <tr>
                    <td colspan="5" class="text-center text-muted">Нет данных о зачётных мероприятиях</td>
                </tr>
            `;
        }
        
        html += `
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
        this.showReportModal(`Отчёт по группе - ${group}`, html);
        
        // Закрываем модальное окно
        const modal = bootstrap.Modal.getInstance(document.getElementById('groupReportModal'));
        if (modal) modal.hide();
        
    } catch (error) {
        console.error('Ошибка показа отчёта по группе:', error);
        this.showAlert('Ошибка', 'Не удалось сформировать отчёт', 'danger');
    }
}

// ЭКСПОРТ В PDF
exportPerformanceReport() {
    try {
        // Собираем данные для экспорта
        const group = document.getElementById('reportGroup')?.value;
        const subjectId = document.getElementById('reportSubject')?.value;
        const dateFrom = document.getElementById('reportDateFrom')?.value;
        const dateTo = document.getElementById('reportDateTo')?.value;
        
        let students = this.appData.students;
        if (group) {
            students = students.filter(s => s.group === group);
        }
        
        let grades = this.appData.grades;
        if (subjectId) {
            grades = grades.filter(g => g.subjectId === subjectId);
        }
        if (dateFrom) {
            grades = grades.filter(g => new Date(g.date) >= new Date(dateFrom));
        }
        if (dateTo) {
            grades = grades.filter(g => new Date(g.date) <= new Date(dateTo));
        }
        
        const reportData = this.generatePerformanceReportData(students, grades);
        
        // Создаём новое окно для печати
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Отчёт по успеваемости</title>
                <style>
                    body { font-family: "Times New Roman", Times, serif; margin: 20px; }
                    .report-header { border-bottom: 2px double #333; padding-bottom: 20px; margin-bottom: 30px; }
                    .report-title { font-size: 18px; font-weight: bold; text-align: center; margin-bottom: 10px; }
                    .report-subtitle { text-align: center; margin-bottom: 15px; }
                    .report-meta { display: flex; justify-content: space-between; font-size: 12px; }
                    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    th, td { border: 1px solid #333; padding: 8px; text-align: left; }
                    th { background-color: #f5f5f5; font-weight: bold; }
                    .badge { padding: 2px 6px; border-radius: 3px; font-size: 12px; }
                    .bg-success { background-color: #d4edda !important; }
                    .bg-warning { background-color: #fff3cd !important; }
                    .bg-danger { background-color: #f8d7da !important; }
                    .bg-info { background-color: #d1ecf1 !important; }
                    @media print {
                        body { margin: 0; }
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                ${reportData}
                <div class="no-print" style="margin-top: 20px; text-align: center;">
                    <button onclick="window.print()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">
                        Печать
                    </button>
                    <button onclick="window.close()" style="padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">
                        Закрыть
                    </button>
                </div>
            </body>
            </html>
        `);
        printWindow.document.close();
        
        this.showAlert('Успех', 'Отчёт открыт в новом окне для печати', 'success');
        
    } catch (error) {
        console.error('Ошибка экспорта отчёта:', error);
        this.showAlert('Ошибка', 'Не удалось экспортировать отчёт', 'danger');
    }
}

// УПРАВЛЕНИЕ ПОЛЬЗОВАТЕЛЯМИ
loadUsersTab() {
    try {
        const container = document.getElementById('usersTab');
        const users = this.appData.users.filter(u => u.role !== 'system');
        
        container.innerHTML = `
            <div class="row">
                <div class="col-12">
                    <div class="d-flex justify-content-between align-items-center mb-4">
                        <h2 class="h3 mb-0">
                            <i class="bi bi-people-fill me-2 text-warning"></i>Управление пользователями
                        </h2>
                        <button class="btn btn-warning" onclick="app.showAddUserModal()">
                            <i class="bi bi-person-plus me-1"></i>Добавить пользователя
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="row mb-4">
                <div class="col-md-3">
                    <div class="card border-start border-primary border-4">
                        <div class="card-body">
                            <div class="d-flex align-items-center">
                                <div class="flex-grow-1">
                                    <div class="text-muted small">Всего пользователей</div>
                                    <div class="h4 mb-0">${users.length}</div>
                                </div>
                                <i class="bi bi-people fs-1 text-primary"></i>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card border-start border-success border-4">
                        <div class="card-body">
                            <div class="d-flex align-items-center">
                                <div class="flex-grow-1">
                                    <div class="text-muted small">Преподавателей</div>
                                    <div class="h4 mb-0">${users.filter(u => u.role === 'teacher').length}</div>
                                </div>
                                <i class="bi bi-person-check fs-1 text-success"></i>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card border-start border-info border-4">
                        <div class="card-body">
                            <div class="d-flex align-items-center">
                                <div class="flex-grow-1">
                                    <div class="text-muted small">Администраторов</div>
                                    <div class="h4 mb-0">${users.filter(u => u.role === 'admin').length}</div>
                                </div>
                                <i class="bi bi-gear fs-1 text-info"></i>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card border-start border-warning border-4">
                        <div class="card-body">
                            <div class="d-flex align-items-center">
                                <div class="flex-grow-1">
                                    <div class="text-muted small">Активных</div>
                                    <div class="h4 mb-0">${users.filter(u => !u.disabled).length}</div>
                                </div>
                                <i class="bi bi-person-check fs-1 text-warning"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="row">
                <div class="col-12">
                    <div class="card shadow">
                        <div class="card-header">
                            <h5 class="card-title mb-0">
                                <i class="bi bi-list-ul me-2"></i>Список пользователей
                            </h5>
                        </div>
                        <div class="card-body">
                            ${this.renderUsersTable(users)}
                        </div>
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Ошибка загрузки вкладки пользователей:', error);
        this.showAlert('Ошибка', 'Не удалось загрузить раздел пользователей', 'danger');
    }
}

renderUsersTable(users) {
    if (users.length === 0) {
        return `

            <!-- Фильтры -->
        <div class="row mb-3">
            <div class="col-md-4">
                <select class="form-select" onchange="app.filterUsersByRole(this.value)">
                    <option value="all">Все роли</option>
                    <option value="student">Студенты</option>
                    <option value="teacher">Преподаватели</option>
                    <option value="admin">Администраторы</option>
                </select>
            </div>
            <div class="col-md-4">
                <select class="form-select" onchange="app.filterUsersByGroup(this.value)">
                    <option value="all">Все группы</option>
                    ${this.getExistingGroups().map(group => 
                        `<option value="${group}">${group}</option>`
                    ).join('')}
                </select>
            </div>
            <div class="col-md-4">
                <select class="form-select" onchange="app.filterUsersByStatus(this.value)">
                    <option value="all">Все статусы</option>
                    <option value="active">Активные</option>
                    <option value="inactive">Неактивные</option>
                </select>
            </div>
        </div>
        
        <!-- Таблица -->
        ${this.renderUsersList(users)}

            <div class="text-center py-5">
                <i class="bi bi-people display-1 text-muted"></i>
                <h4 class="text-muted mt-3">Пользователи не найдены</h4>
                <p class="text-muted">Добавьте первого пользователя в систему</p>
                <button class="btn btn-warning mt-3" onclick="app.showAddUserModal()">
                    <i class="bi bi-person-plus me-1"></i>Добавить пользователя
                </button>
            </div>
        `;
    }
    
    let html = `
        <div class="table-responsive">
            <table class="table table-hover users-table">
                <thead>
                    <tr>
                        <th>Пользователь</th>
                        <th>Логин</th>
                        <th>Роль</th>
                        <th>Предметы/Группа</th>
                        <th>Статус</th>
                        <th>Последний вход</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    users.forEach(user => {
        // ИСПРАВЛЕННЫЙ БЛОК - правильное отображение роли
        const roleBadge = user.role === 'admin' ? 
            '<span class="badge bg-danger">Администратор</span>' : 
            user.role === 'teacher' ? 
            '<span class="badge bg-primary">Преподаватель</span>' :
            '<span class="badge bg-success">Студент</span>';
        
        const statusBadge = user.disabled ? 
            '<span class="badge bg-secondary">Неактивен</span>' : 
            '<span class="badge bg-success">Активен</span>';
        
        // ИСПРАВЛЕННЫЙ БЛОК - для студентов показываем группу, для преподавателей - предметы
        const infoColumn = user.role === 'student' ? 
            (user.group ? `<span class="badge bg-info">${user.group}</span>` : '<small class="text-muted">Группа не указана</small>') :
            (user.subjects && user.subjects.length > 0 ? 
                user.subjects.slice(0, 2).join(', ') + (user.subjects.length > 2 ? '...' : '') : 
                '<small class="text-muted">Предметы не назначены</small>');
        
        html += `
            <tr class="${user.disabled ? 'table-secondary' : ''}">
                <td>
                    <div class="d-flex align-items-center">
                        <i class="bi bi-person-circle me-3 fs-4 text-primary"></i>
                        <div>
                            <strong>${user.name}</strong>
                            ${user.id === this.currentUser?.id ? '<span class="badge bg-info ms-2">Вы</span>' : ''}
                        </div>
                    </div>
                </td>
                <td>${user.username}</td>
                <td>${roleBadge}</td>
                <td>
                    ${infoColumn}
                    ${user.role !== 'student' && user.subjects && user.subjects.length > 2 ? 
                        `<br><small class="text-primary">+${user.subjects.length - 2} еще</small>` : ''}
                </td>
                <td>${statusBadge}</td>
                <td>
                    <small class="text-muted">
                        ${user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('ru-RU') : 'Никогда'}
                    </small>
                </td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" onclick="app.editUser('${user.id}')" ${user.id === this.currentUser?.id ? 'disabled' : ''}>
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-outline-${user.disabled ? 'success' : 'warning'}" onclick="app.toggleUserStatus('${user.id}')" ${user.id === this.currentUser?.id ? 'disabled' : ''}>
                            <i class="bi bi-${user.disabled ? 'check' : 'pause'}"></i>
                        </button>
                        <button class="btn btn-outline-danger" onclick="app.deleteUser('${user.id}')" ${user.id === this.currentUser?.id ? 'disabled' : ''}>
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    html += `
                </tbody>
            </table>
        </div>
    `;
    
    return html;
}

showAddUserModal() {
    const modalHTML = `
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
                                <label for="userName" class="form-label">ФИО *</label>
                                <input type="text" class="form-control" id="userName" required>
                            </div>
                            <div class="mb-3">
                                <label for="userUsername" class="form-label">Логин *</label>
                                <input type="text" class="form-control" id="userUsername" required>
                                <div class="form-text">Логин должен быть уникальным</div>
                            </div>
                            <div class="mb-3">
                                <label for="userPassword" class="form-label">Пароль *</label>
                                <input type="password" class="form-control" id="userPassword" required minlength="6">
                                <div class="form-text">Минимум 6 символов</div>
                            </div>
                            <div class="mb-3">
                                <label for="userRole" class="form-label">Роль *</label>
                                <select class="form-select" id="userRole" required onchange="app.toggleStudentFields()">
                                    <option value="student">Студент</option>
                                    <option value="teacher">Преподаватель</option>
                                    <option value="admin">Администратор</option>
                                </select>
                            </div>
                            
                            <!-- ПОЛЕ ДЛЯ СТУДЕНТА - ИСПРАВЛЕННЫЙ БЛОК -->
                            <div class="mb-3" id="studentGroupField" style="display: none;">
                                <label for="userGroup" class="form-label">Группа *</label>
                                <select class="form-select" id="userGroup" required>
                                    <option value="">Выберите группу</option>
                                    ${this.getExistingGroups().map(group => 
                                        `<option value="${group}">${group}</option>`
                                    ).join('')}
                                    <option value="new">+ Создать новую группу</option>
                                </select>
                            </div>
                            <div class="mb-3" id="newGroupField" style="display: none;">
                                <label for="newGroupName" class="form-label">Название новой группы</label>
                                <input type="text" class="form-control" id="newGroupName" placeholder="Например: ИТ-21">
                            </div>
                            
                            <!-- ПОЛЕ ДЛЯ ПРЕПОДАВАТЕЛЯ -->
                            <div class="mb-3" id="teacherSubjectsField">
                                <label for="userSubjects" class="form-label">Предметы (для преподавателя)</label>
                                <select class="form-select" id="userSubjects" multiple>
                                    ${this.appData.subjects.map(subject => 
                                        `<option value="${subject.name}">${subject.name}</option>`
                                    ).join('')}
                                </select>
                                <div class="form-text">Удерживайте Ctrl для выбора нескольких предметов</div>
                            </div>
                            
                            <div class="mb-3 form-check">
                                <input type="checkbox" class="form-check-input" id="userActive" checked>
                                <label class="form-check-label" for="userActive">Активный пользователь</label>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Отмена</button>
                        <button type="button" class="btn btn-warning" onclick="app.addUser()">
                            <i class="bi bi-person-plus me-1"></i>Добавить
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    const oldModal = document.getElementById('addUserModal');
    if (oldModal) oldModal.remove();
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Добавляем обработчик изменения выбора группы
    document.getElementById('userGroup')?.addEventListener('change', function(e) {
        if (e.target.value === 'new') {
            document.getElementById('newGroupField').style.display = 'block';
        } else {
            document.getElementById('newGroupField').style.display = 'none';
        }
    });
    
    const modal = new bootstrap.Modal(document.getElementById('addUserModal'));
    modal.show();
    
    
    this.toggleStudentFields();
}


toggleStudentFields() {
    const roleSelect = document.getElementById('userRole');
    const studentGroupField = document.getElementById('studentGroupField');
    const teacherSubjectsField = document.getElementById('teacherSubjectsField');
    
    if (!roleSelect || !studentGroupField || !teacherSubjectsField) return;
    
    const role = roleSelect.value;
    
    if (role === 'student') {
        studentGroupField.style.display = 'block';
        teacherSubjectsField.style.display = 'none';
    } else {
        studentGroupField.style.display = 'none';
        teacherSubjectsField.style.display = 'block';
    }
}



getExistingGroups() {
    // Берем группы из студентов
    const studentGroups = [...new Set(this.appData.students.map(s => s.group))].filter(g => g);
    
    // Берем группы из пользователей-студентов
    const userGroups = [...new Set(this.appData.users
        .filter(u => u.role === 'student' && u.group)
        .map(u => u.group)
    )].filter(g => g);
    
    // Берем группы из коллекции групп (если она есть)
    const definedGroups = this.appData.groups ? 
        this.appData.groups.map(g => g.name).filter(g => g) : [];
    
    // Объединяем все источники и убираем дубликаты
    const allGroups = [...new Set([...studentGroups, ...userGroups, ...definedGroups])];
    
    return allGroups.sort();
}

addUser() {
    try {
        const name = document.getElementById('userName')?.value.trim();
        const username = document.getElementById('userUsername')?.value.trim();
        const password = document.getElementById('userPassword')?.value;
        const role = document.getElementById('userRole')?.value;
        const active = document.getElementById('userActive')?.checked;
        
        let group = '';
        let subjects = [];
        
        if (role === 'student') {
            // Обработка группы для студента
            const groupSelect = document.getElementById('userGroup')?.value;
            if (groupSelect === 'new') {
                group = document.getElementById('newGroupName')?.value.trim();
            } else {
                group = groupSelect;
            }
            
            if (!group) {
                this.showAlert('Ошибка', 'Выберите или создайте группу для студента!', 'warning');
                return;
            }
        } else {
            // Обработка предметов для преподавателя
            const subjectsSelect = document.getElementById('userSubjects');
            subjects = Array.from(subjectsSelect.selectedOptions).map(option => option.value);
        }
        
        if (!name || !username || !password) {
            this.showAlert('Ошибка', 'Заполните обязательные поля!', 'warning');
            return;
        }
        
        if (password.length < 6) {
            this.showAlert('Ошибка', 'Пароль должен содержать минимум 6 символов!', 'warning');
            return;
        }
        
        // Проверяем уникальность логина
        const existingUser = this.appData.users.find(u => u.username === username);
        if (existingUser) {
            this.showAlert('Ошибка', 'Пользователь с таким логином уже существует!', 'danger');
            return;
        }
        
        const user = {
            id: this.generateId(),
            name: name,
            username: username,
            password: password,
            role: role,
            subjects: subjects,
            group: role === 'student' ? group : undefined,
            disabled: !active,
            createdAt: new Date().toISOString(),
            createdBy: this.currentUser?.id
        };
        
        // Для студента создаём соответствующую запись в students
        if (role === 'student') {
            const studentRecord = {
                id: this.generateId(),
                name: name,
                group: group,
                createdAt: new Date().toISOString()
            };
            this.appData.students.push(studentRecord);
            user.studentId = studentRecord.id;
        }
        
        this.appData.users.push(user);
        
        if (this.saveData()) {
            const modal = bootstrap.Modal.getInstance(document.getElementById('addUserModal'));
            if (modal) modal.hide();
            
            this.showAlert('Успех', `Пользователь ${name} добавлен в систему`, 'success');
            this.loadUsersTab();
        }
    } catch (error) {
        console.error('Ошибка добавления пользователя:', error);
        this.showAlert('Ошибка', 'Не удалось добавить пользователя', 'danger');
    }
}

editUser(userId) {
    try {
        const user = this.appData.users.find(u => u.id === userId);
        if (!user) {
            this.showAlert('Ошибка', 'Пользователь не найден!', 'danger');
            return;
        }
        
        const modalHTML = `
            <div class="modal fade" id="editUserModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Редактировать пользователя</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="editUserForm">
                                <div class="mb-3">
                                    <label for="editUserName" class="form-label">ФИО *</label>
                                    <input type="text" class="form-control" id="editUserName" value="${user.name}" required>
                                </div>
                                <div class="mb-3">
                                    <label for="editUserUsername" class="form-label">Логин *</label>
                                    <input type="text" class="form-control" id="editUserUsername" value="${user.username}" required>
                                </div>
                                <div class="mb-3">
                                    <label for="editUserPassword" class="form-label">Новый пароль</label>
                                    <input type="password" class="form-control" id="editUserPassword" placeholder="Оставьте пустым, чтобы не менять">
                                    <div class="form-text">Минимум 6 символов</div>
                                </div>
                                <div class="mb-3">
                                    <label for="editUserRole" class="form-label">Роль *</label>
                                    <select class="form-select" id="editUserRole" required onchange="app.toggleEditStudentFields()">
                                        <option value="student" ${user.role === 'student' ? 'selected' : ''}>Студент</option>
                                        <option value="teacher" ${user.role === 'teacher' ? 'selected' : ''}>Преподаватель</option>
                                        <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Администратор</option>
                                    </select>
                                </div>
                                <div class="mb-3" id="editStudentGroupField" style="${user.role === 'student' ? 'display: block;' : 'display: none;'}">
                                    <label for="editUserGroup" class="form-label">Группа *</label>
                                    <select class="form-select" id="editUserGroup" required>
                                        <option value="">Выберите группу</option>
                                        ${this.getExistingGroups().map(group => 
                                            `<option value="${group}" ${user.group === group ? 'selected' : ''}>${group}</option>`
                                        ).join('')}
                                        <option value="new">+ Создать новую группу</option>
                                    </select>
                                </div>
                                <div class="mb-3" id="editNewGroupField" style="display: none;">
                                    <label for="editNewGroupName" class="form-label">Название новой группы</label>
                                    <input type="text" class="form-control" id="editNewGroupName" placeholder="Например: ИТ-21">
                                </div>
                                <div class="mb-3" id="editTeacherSubjectsField" style="${user.role !== 'student' ? 'display: block;' : 'display: none;'}">
                                    <label for="editUserSubjects" class="form-label">Предметы (для преподавателя)</label>
                                    <select class="form-select" id="editUserSubjects" multiple>
                                        ${this.appData.subjects.map(subject => 
                                            `<option value="${subject.name}" ${user.subjects && user.subjects.includes(subject.name) ? 'selected' : ''}>
                                                ${subject.name}
                                            </option>`
                                        ).join('')}
                                    </select>
                                </div>
                                <div class="mb-3 form-check">
                                    <input type="checkbox" class="form-check-input" id="editUserActive" ${!user.disabled ? 'checked' : ''}>
                                    <label class="form-check-label" for="editUserActive">Активный пользователь</label>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Отмена</button>
                            <button type="button" class="btn btn-warning" onclick="app.updateUser('${user.id}')">
                                <i class="bi bi-check-lg me-1"></i>Сохранить
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        const oldModal = document.getElementById('editUserModal');
        if (oldModal) oldModal.remove();
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Добавляем обработчики
        document.getElementById('editUserGroup')?.addEventListener('change', function(e) {
            if (e.target.value === 'new') {
                document.getElementById('editNewGroupField').style.display = 'block';
            } else {
                document.getElementById('editNewGroupField').style.display = 'none';
            }
        });
        
        const modal = new bootstrap.Modal(document.getElementById('editUserModal'));
        modal.show();
        
    } catch (error) {
        console.error('Ошибка редактирования пользователя:', error);
        this.showAlert('Ошибка', 'Не удалось открыть форму редактирования', 'danger');
    }
}


toggleEditStudentFields() {
    const role = document.getElementById('editUserRole')?.value;
    const studentGroupField = document.getElementById('editStudentGroupField');
    const teacherSubjectsField = document.getElementById('editTeacherSubjectsField');
    
    if (role === 'student') {
        studentGroupField.style.display = 'block';
        teacherSubjectsField.style.display = 'none';
    } else {
        studentGroupField.style.display = 'none';
        teacherSubjectsField.style.display = 'block';
    }
}

updateUser(userId) {
    try {
        const user = this.appData.users.find(u => u.id === userId);
        if (!user) {
            this.showAlert('Ошибка', 'Пользователь не найден!', 'danger');
            return;
        }
        
        const name = document.getElementById('editUserName')?.value.trim();
        const username = document.getElementById('editUserUsername')?.value.trim();
        const newPassword = document.getElementById('editUserPassword')?.value;
        const role = document.getElementById('editUserRole')?.value;
        const active = document.getElementById('editUserActive')?.checked;
        
        let group = user.group;
        let subjects = user.subjects || [];
        
        if (role === 'student') {
            // Обработка группы для студента
            const groupSelect = document.getElementById('editUserGroup')?.value;
            if (groupSelect === 'new') {
                group = document.getElementById('editNewGroupName')?.value.trim();
            } else {
                group = groupSelect;
            }
            
            if (!group) {
                this.showAlert('Ошибка', 'Выберите или создайте группу для студента!', 'warning');
                return;
            }
        } else {
            // Обработка предметов для преподавателя/админа
            const subjectsSelect = document.getElementById('editUserSubjects');
            subjects = Array.from(subjectsSelect.selectedOptions).map(option => option.value);
            group = undefined; // Убираем группу у не-студентов
        }
        
        if (!name || !username) {
            this.showAlert('Ошибка', 'Заполните обязательные поля!', 'warning');
            return;
        }
        
        // Проверяем уникальность логина (исключая текущего пользователя)
        const existingUser = this.appData.users.find(u => u.username === username && u.id !== userId);
        if (existingUser) {
            this.showAlert('Ошибка', 'Пользователь с таким логином уже существует!', 'danger');
            return;
        }
        
        // Обновляем данные пользователя
        user.name = name;
        user.username = username;
        user.role = role;
        user.subjects = subjects;
        user.group = group;
        user.disabled = !active;
        user.updatedAt = new Date().toISOString();
        user.updatedBy = this.currentUser?.id;
        
        // Обновляем пароль, если указан новый
        if (newPassword && newPassword.length >= 6) {
            user.password = newPassword;
        } else if (newPassword && newPassword.length > 0) {
            this.showAlert('Ошибка', 'Пароль должен содержать минимум 6 символов!', 'warning');
            return;
        }
        
        // Обновляем запись студента если роль изменилась на студента
        if (role === 'student') {
            let studentRecord = this.appData.students.find(s => s.id === user.studentId);
            if (!studentRecord) {
                // Создаём новую запись студента
                studentRecord = {
                    id: this.generateId(),
                    name: name,
                    group: group,
                    createdAt: new Date().toISOString()
                };
                this.appData.students.push(studentRecord);
                user.studentId = studentRecord.id;
            } else {
                // Обновляем существующую запись
                studentRecord.name = name;
                studentRecord.group = group;
            }
        }
        
        if (this.saveData()) {
            const modal = bootstrap.Modal.getInstance(document.getElementById('editUserModal'));
            if (modal) modal.hide();
            
            this.showAlert('Успех', `Данные пользователя ${name} обновлены`, 'success');
            this.loadUsersTab();
        }
    } catch (error) {
        console.error('Ошибка обновления пользователя:', error);
        this.showAlert('Ошибка', 'Не удалось обновить пользователя', 'danger');
    }
}

toggleUserStatus(userId) {
    try {
        const user = this.appData.users.find(u => u.id === userId);
        if (!user) {
            this.showAlert('Ошибка', 'Пользователь не найден!', 'danger');
            return;
        }
        
        const action = user.disabled ? 'активировать' : 'деактивировать';
        if (confirm(`Вы уверены, что хотите ${action} пользователя ${user.name}?`)) {
            user.disabled = !user.disabled;
            user.updatedAt = new Date().toISOString();
            user.updatedBy = this.currentUser?.id;
            
            if (this.saveData()) {
                this.showAlert('Успех', `Пользователь ${user.name} ${user.disabled ? 'деактивирован' : 'активирован'}`, 'success');
                this.loadUsersTab();
            }
        }
    } catch (error) {
        console.error('Ошибка изменения статуса пользователя:', error);
        this.showAlert('Ошибка', 'Не удалось изменить статус пользователя', 'danger');
    }
}

deleteUser(userId) {
    try {
        const user = this.appData.users.find(u => u.id === userId);
        if (!user) {
            this.showAlert('Ошибка', 'Пользователь не найден!', 'danger');
            return;
        }
        
        if (confirm(`Вы уверены, что хотите удалить пользователя ${user.name}? Это действие нельзя отменить.`)) {
            this.appData.users = this.appData.users.filter(u => u.id !== userId);
            
            if (this.saveData()) {
                this.showAlert('Удалено', `Пользователь ${user.name} удалён из системы`, 'info');
                this.loadUsersTab();
            }
        }
    } catch (error) {
        console.error('Ошибка удаления пользователя:', error);
        this.showAlert('Ошибка', 'Не удалось удалить пользователя', 'danger');
    }
}

updateNavigationForRole() {
    const navItems = {
        'dashboard': true,
        'students': this.currentUser.role !== 'student',
        'subjects': this.currentUser.role !== 'student', 
        'grades': this.currentUser.role !== 'student',
        'attendance': this.currentUser.role !== 'student',
        'calendar': true,
        'reports': this.currentUser.role === 'admin',
        'users': this.currentUser.role === 'admin',
        'groups': this.currentUser.role === 'admin',
        'students-management': this.currentUser.role === 'admin',
        'teachers-management': this.currentUser.role === 'admin',
        'mygrades': this.currentUser.role === 'student',
        'myattendance': this.currentUser.role === 'student'
    };
    
    // Скрываем/показываем элементы навигации
    Object.keys(navItems).forEach(tab => {
        const element = document.querySelector(`[onclick="showTab('${tab}')"]`);
        if (element) {
            element.parentElement.style.display = navItems[tab] ? 'block' : 'none';
        }
    });
    
    // Админ-меню только для админов
    document.getElementById('adminNavItem').style.display = this.currentUser.role === 'admin' ? 'block' : 'none';
}

getRoleDisplayName(role) {
    const roleNames = {
        'admin': 'Админ',
        'teacher': 'Преподаватель', 
        'student': 'Студент'
    };
    return roleNames[role] || role;
}

// МОИ ОЦЕНКИ - для студентов
loadMyGradesTab() {
    try {
        const container = document.getElementById('mygradesTab');
        
        if (this.currentUser.role !== 'student') {
            container.innerHTML = this.getAccessDeniedMessage();
            return;
        }
        
        const studentGrades = this.appData.grades.filter(g => g.studentId === this.currentUser.studentId);
        const stats = this.getStudentStatistics(this.currentUser.studentId);
        
        container.innerHTML = `
            <div class="row">
                <div class="col-12">
                    <div class="d-flex justify-content-between align-items-center mb-4">
                        <h2 class="h3 mb-0">
                            <i class="bi bi-journal-check me-2 text-primary"></i>Мои оценки
                        </h2>
                        <div class="text-muted">
                            Средний балл: <span class="badge bg-primary fs-6">${stats.averageGrade}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="row mb-4">
                <div class="col-md-3">
                    <div class="card border-start border-success border-4">
                        <div class="card-body">
                            <div class="d-flex align-items-center">
                                <div class="flex-grow-1">
                                    <div class="text-muted small">Всего оценок</div>
                                    <div class="h4 mb-0">${stats.totalGrades}</div>
                                </div>
                                <i class="bi bi-pencil-square fs-1 text-success"></i>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card border-start border-primary border-4">
                        <div class="card-body">
                            <div class="d-flex align-items-center">
                                <div class="flex-grow-1">
                                    <div class="text-muted small">Средний балл</div>
                                    <div class="h4 mb-0">${stats.averageGrade}</div>
                                </div>
                                <i class="bi bi-graph-up fs-1 text-primary"></i>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card border-start border-info border-4">
                        <div class="card-body">
                            <div class="d-flex align-items-center">
                                <div class="flex-grow-1">
                                    <div class="text-muted small">Предметов</div>
                                    <div class="h4 mb-0">${new Set(studentGrades.map(g => g.subjectId)).size}</div>
                                </div>
                                <i class="bi bi-book fs-1 text-info"></i>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card border-start border-warning border-4">
                        <div class="card-body">
                            <div class="d-flex align-items-center">
                                <div class="flex-grow-1">
                                    <div class="text-muted small">Последняя</div>
                                    <div class="h4 mb-0">
                                        ${studentGrades.length > 0 ? 
                                            `<span class="badge ${this.getGradeClass(studentGrades[studentGrades.length-1].grade)}">
                                                ${studentGrades[studentGrades.length-1].grade}
                                            </span>` : 
                                            '-'
                                        }
                                    </div>
                                </div>
                                <i class="bi bi-clock-history fs-1 text-warning"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="row">
                <div class="col-12">
                    <div class="card shadow">
                        <div class="card-header">
                            <h5 class="card-title mb-0">
                                <i class="bi bi-list-check me-2"></i>История оценок
                            </h5>
                        </div>
                        <div class="card-body">
                            ${this.renderStudentGrades(studentGrades)}
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="row mt-4">
                <div class="col-12">
                    <div class="card shadow">
                        <div class="card-header">
                            <h5 class="card-title mb-0">
                                <i class="bi bi-graph-up me-2"></i>Успеваемость по предметам
                            </h5>
                        </div>
                        <div class="card-body">
                            ${this.renderStudentSubjectsProgress(studentGrades)}
                        </div>
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Ошибка загрузки вкладки моих оценок:', error);
        this.showAlert('Ошибка', 'Не удалось загрузить оценки', 'danger');
    }
}

renderStudentGrades(grades) {
    if (grades.length === 0) {
        return `
            <div class="text-center py-5">
                <i class="bi bi-journal-x display-1 text-muted"></i>
                <h4 class="text-muted mt-3">Оценок пока нет</h4>
                <p class="text-muted">Ваши оценки появятся здесь после их выставления преподавателями</p>
            </div>
        `;
    }
    
    // Группируем оценки по предметам
    const gradesBySubject = {};
    grades.forEach(grade => {
        const subject = this.appData.subjects.find(s => s.id === grade.subjectId);
        if (subject) {
            if (!gradesBySubject[subject.id]) {
                gradesBySubject[subject.id] = {
                    subject: subject,
                    grades: []
                };
            }
            gradesBySubject[subject.id].grades.push(grade);
        }
    });
    
    let html = '';
    
    Object.values(gradesBySubject).forEach(({ subject, grades }) => {
        const subjectStats = this.getStudentStatistics(this.currentUser.studentId);
        const sortedGrades = grades.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        html += `
            <div class="mb-4">
                <h6 class="border-bottom pb-2">
                    <i class="bi bi-book me-2 text-success"></i>
                    ${subject.name}
                    <small class="text-muted"> - Преподаватель: ${subject.teacherName}</small>
                </h6>
                <div class="row">
        `;
        
        sortedGrades.forEach(grade => {
            html += `
                <div class="col-md-3 mb-2">
                    <div class="card">
                        <div class="card-body text-center p-3">
                            <div class="fs-4">
                                <span class="badge ${this.getGradeClass(grade.grade)} fs-6">
                                    ${grade.grade}
                                </span>
                            </div>
                            <div class="text-muted small mt-1">
                                ${grade.date || 'Дата не указана'}
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
    
    return html;
}

renderStudentSubjectsProgress(grades) {
    if (grades.length === 0) {
        return '<p class="text-muted text-center">Нет данных для построения графика успеваемости</p>';
    }
    
    // Группируем оценки по предметам и считаем средний балл
    const subjectProgress = {};
    grades.forEach(grade => {
        const subject = this.appData.subjects.find(s => s.id === grade.subjectId);
        if (subject) {
            if (!subjectProgress[subject.id]) {
                subjectProgress[subject.id] = {
                    subject: subject,
                    grades: [],
                    numericGrades: []
                };
            }
            subjectProgress[subject.id].grades.push(grade);
            
            // Преобразуем оценки в числа для расчёта среднего
            const numGrade = parseInt(grade.grade);
            if (!isNaN(numGrade)) {
                subjectProgress[subject.id].numericGrades.push(numGrade);
            }
        }
    });
    
    let html = '<div class="row">';
    
    Object.values(subjectProgress).forEach(({ subject, grades, numericGrades }) => {
        const average = numericGrades.length > 0 ? 
            (numericGrades.reduce((a, b) => a + b, 0) / numericGrades.length).toFixed(2) : 
            '0.00';
        
        const progressWidth = Math.min((parseFloat(average) / 5) * 100, 100);
        const progressColor = average >= 4.5 ? 'bg-success' : 
                            average >= 4.0 ? 'bg-info' : 
                            average >= 3.0 ? 'bg-warning' : 'bg-danger';
        
        html += `
            <div class="col-md-6 mb-3">
                <div class="card h-100">
                    <div class="card-body">
                        <h6 class="card-title">${subject.name}</h6>
                        <p class="text-muted small mb-2">Преподаватель: ${subject.teacherName}</p>
                        
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <small>Средний балл:</small>
                            <strong>${average}</strong>
                        </div>
                        
                        <div class="progress mb-2" style="height: 8px;">
                            <div class="progress-bar ${progressColor}" style="width: ${progressWidth}%"></div>
                        </div>
                        
                        <div class="d-flex justify-content-between">
                            <small class="text-muted">Кол-во оценок: ${grades.length}</small>
                            <small class="text-muted">${progressWidth}% от макс.</small>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    return html;
}

// МОЯ ПОСЕЩАЕМОСТЬ - для студентов
loadMyAttendanceTab() {
    try {
        const container = document.getElementById('myattendanceTab');
        
        if (this.currentUser.role !== 'student') {
            container.innerHTML = this.getAccessDeniedMessage();
            return;
        }
        
        const studentAttendance = [];
        if (this.appData.attendanceEvents) {
            this.appData.attendanceEvents.forEach(event => {
                const record = event.records.find(r => r.studentId === this.currentUser.studentId);
                if (record) {
                    studentAttendance.push({
                        event: event,
                        record: record
                    });
                }
            });
        }
        
        const stats = this.calculateStudentAttendanceStats(studentAttendance);
        
        container.innerHTML = `
            <div class="row">
                <div class="col-12">
                    <div class="d-flex justify-content-between align-items-center mb-4">
                        <h2 class="h3 mb-0">
                            <i class="bi bi-clipboard-check me-2 text-success"></i>Моя посещаемость
                        </h2>
                        <div class="text-muted">
                            Посещаемость: <span class="badge bg-success fs-6">${stats.attendanceRate}%</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="row mb-4">
                <div class="col-md-3">
                    <div class="card border-start border-success border-4">
                        <div class="card-body">
                            <div class="d-flex align-items-center">
                                <div class="flex-grow-1">
                                    <div class="text-muted small">Всего мероприятий</div>
                                    <div class="h4 mb-0">${stats.totalEvents}</div>
                                </div>
                                <i class="bi bi-calendar-check fs-1 text-success"></i>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card border-start border-primary border-4">
                        <div class="card-body">
                            <div class="d-flex align-items-center">
                                <div class="flex-grow-1">
                                    <div class="text-muted small">Присутствовал</div>
                                    <div class="h4 mb-0">${stats.presentCount}</div>
                                </div>
                                <i class="bi bi-person-check fs-1 text-primary"></i>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card border-start border-warning border-4">
                        <div class="card-body">
                            <div class="d-flex align-items-center">
                                <div class="flex-grow-1">
                                    <div class="text-muted small">Отсутствовал</div>
                                    <div class="h4 mb-0">${stats.absentCount}</div>
                                </div>
                                <i class="bi bi-person-x fs-1 text-warning"></i>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card border-start border-info border-4">
                        <div class="card-body">
                            <div class="d-flex align-items-center">
                                <div class="flex-grow-1">
                                    <div class="text-muted small">Уважительные</div>
                                    <div class="h4 mb-0">${stats.excusedCount}</div>
                                </div>
                                <i class="bi bi-clipboard-plus fs-1 text-info"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="row">
                <div class="col-12">
                    <div class="card shadow">
                        <div class="card-header">
                            <h5 class="card-title mb-0">
                                <i class="bi bi-list-ul me-2"></i>История посещаемости
                            </h5>
                        </div>
                        <div class="card-body">
                            ${this.renderStudentAttendance(studentAttendance)}
                        </div>
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Ошибка загрузки вкладки моей посещаемости:', error);
        this.showAlert('Ошибка', 'Не удалось загрузить данные о посещаемости', 'danger');
    }
}

calculateStudentAttendanceStats(attendance) {
    const totalEvents = attendance.length;
    const presentCount = attendance.filter(a => a.record.status === 'present').length;
    const absentCount = attendance.filter(a => a.record.status === 'absent').length;
    const excusedCount = attendance.filter(a => a.record.status === 'excused').length;
    
    const attendanceRate = totalEvents > 0 ? Math.round((presentCount / totalEvents) * 100) : 0;
    
    return {
        totalEvents,
        presentCount,
        absentCount,
        excusedCount,
        attendanceRate
    };
}

renderStudentAttendance(attendance) {
    if (attendance.length === 0) {
        return `
            <div class="text-center py-5">
                <i class="bi bi-clipboard-x display-1 text-muted"></i>
                <h4 class="text-muted mt-3">Зачётные мероприятия не проводились</h4>
                <p class="text-muted">Данные о посещаемости появятся после проведения зачётных мероприятий</p>
            </div>
        `;
    }
    
    const typeLabels = {
        'exam': 'Экзамен',
        'test': 'Зачёт',
        'diff_test': 'Диф. зачёт',
        'thesis_defense': 'Защита ВКР',
        'qualification_exam': 'Квалиф. экзамен'
    };
    
    const statusLabels = {
        'present': 'Присутствовал',
        'absent': 'Отсутствовал',
        'excused': 'Уважительная причина'
    };
    
    const statusColors = {
        'present': 'success',
        'absent': 'danger',
        'excused': 'info'
    };
    
    let html = `
        <div class="table-responsive">
            <table class="table table-hover">
                <thead>
                    <tr>
                        <th>Дата</th>
                        <th>Тип мероприятия</th>
                        <th>Предмет</th>
                        <th>Статус</th>
                        <th>Время отметки</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    attendance
        .sort((a, b) => new Date(b.event.date) - new Date(a.event.date))
        .forEach(({ event, record }) => {
            const subject = this.appData.subjects.find(s => s.id === event.subjectId);
            
            html += `
                <tr>
                    <td>${new Date(event.date).toLocaleDateString('ru-RU')}</td>
                    <td>
                        <span class="badge bg-primary">${typeLabels[event.type]}</span>
                    </td>
                    <td>${subject ? subject.name : 'Не указан'}</td>
                    <td>
                        <span class="badge bg-${statusColors[record.status]}">
                            ${statusLabels[record.status]}
                        </span>
                    </td>
                    <td>
                        <small class="text-muted">
                            ${new Date(record.markedAt).toLocaleString('ru-RU')}
                        </small>
                    </td>
                </tr>
            `;
        });
    
    html += `
                </tbody>
            </table>
        </div>
    `;
    
    return html;
}

getAccessDeniedMessage() {
    return `
        <div class="text-center py-5">
            <i class="bi bi-shield-exclamation display-1 text-danger"></i>
            <h4 class="text-danger mt-3">Доступ запрещён</h4>
            <p class="text-muted">У вас нет прав для доступа к этому разделу</p>
        </div>
    `;
}

debugUsers() {
    console.log('Все пользователи:', this.appData.users);
    console.log('Все студенты:', this.appData.students);
    console.log('Текущий пользователь:', this.currentUser);
}

forceResetData() {
    localStorage.removeItem('e-zachetka-data');
    localStorage.removeItem('e-zachetka-currentUser');
    location.reload();
}

// ДОБАВЬ этот метод в класс EZachetkaApp и выполни в консоли:
forceCreateTestUsers() {
    console.log('Принудительное создание тестовых пользователей...');
    
    // Очищаем текущих пользователей
    this.appData.users = [];
    
    // Создаём тестовых пользователей
    this.appData.users = [
        {
            id: this.generateId(),
            username: 'prepod',
            password: '123456',
            name: 'Иванова Мария Петровна',
            role: 'teacher',
            subjects: ['Математика', 'Физика'],
            disabled: false,
            createdAt: new Date().toISOString()
        },
        {
            id: this.generateId(),
            username: 'admin',
            password: 'admin123',
            name: 'Администратор Системы',
            role: 'admin',
            subjects: [],
            disabled: false,
            createdAt: new Date().toISOString()
        },
        {
            id: this.generateId(), 
            username: 'student1',
            password: '123456',
            name: 'Петров Иван Сергеевич',
            role: 'student',
            studentId: null,
            group: 'ИТ-21',
            disabled: false,
            createdAt: new Date().toISOString()
        },
        {
            id: this.generateId(), 
            username: 'student2',
            password: '123456',
            name: 'Сидорова Анна Владимировна',
            role: 'student',
            studentId: null,
            group: 'ИТ-21',
            disabled: false,
            createdAt: new Date().toISOString()
        },
        {
            id: this.generateId(), 
            username: 'student3',
            password: '123456',
            name: 'Козлов Дмитрий Александрович',
            role: 'student',
            studentId: null,
            group: 'ИТ-22',
            disabled: false,
            createdAt: new Date().toISOString()
        }
    ];
    
    // Также создаём несколько тестовых предметов
    this.appData.subjects = [
        {
            id: this.generateId(),
            name: 'Математика',
            teacherName: 'Иванова Мария Петровна',
            teacherId: this.appData.users[0].id,
            createdAt: new Date().toISOString()
        },
        {
            id: this.generateId(),
            name: 'Физика',
            teacherName: 'Иванова Мария Петровна', 
            teacherId: this.appData.users[0].id,
            createdAt: new Date().toISOString()
        },
        {
            id: this.generateId(),
            name: 'Программирование',
            teacherName: 'Иванова Мария Петровна',
            teacherId: this.appData.users[0].id,
            createdAt: new Date().toISOString()
        }
    ];
    
    // Создаём тестовых студентов в базе студентов
    this.appData.students = [
        {
            id: this.generateId(),
            name: 'Петров Иван Сергеевич',
            group: 'ИТ-21',
            createdAt: new Date().toISOString()
        },
        {
            id: this.generateId(),
            name: 'Сидорова Анна Владимировna',
            group: 'ИТ-21',
            createdAt: new Date().toISOString()
        },
        {
            id: this.generateId(),
            name: 'Козлов Дмитрий Александрович',
            group: 'ИТ-22',
            createdAt: new Date().toISOString()
        }
    ];
    
    // Связываем пользователей-студентов с записями студентов
    const studentUser1 = this.appData.users.find(u => u.username === 'student1');
    const studentRecord1 = this.appData.students.find(s => s.name === 'Петров Иван Сергеевич');
    if (studentUser1 && studentRecord1) {
        studentUser1.studentId = studentRecord1.id;
    }
    
    const studentUser2 = this.appData.users.find(u => u.username === 'student2');
    const studentRecord2 = this.appData.students.find(s => s.name === 'Сидорова Анна Владимировna');
    if (studentUser2 && studentRecord2) {
        studentUser2.studentId = studentRecord2.id;
    }
    
    const studentUser3 = this.appData.users.find(u => u.username === 'student3');
    const studentRecord3 = this.appData.students.find(s => s.name === 'Козлов Дмитрий Александрович');
    if (studentUser3 && studentRecord3) {
        studentUser3.studentId = studentRecord3.id;
    }
    
    this.saveData();
    console.log('Тестовые пользователи созданы!');
    console.log('Пользователи:', this.appData.users);
    console.log('Студенты:', this.appData.students);
    console.log('Предметы:', this.appData.subjects);
    
    return 'Готово! Теперь попробуй войти как student1 / 123456';
}

// СИСТЕМА УВЕДОМЛЕНИЙ
loadNotificationsTab() {
    try {
        const container = document.getElementById('notificationsTab');
        const userNotifications = this.getUserNotifications();
        
        container.innerHTML = `
            <div class="row">
                <div class="col-12">
                    <div class="d-flex justify-content-between align-items-center mb-4">
                        <h2 class="h3 mb-0">
                            <i class="bi bi-bell me-2 text-warning"></i>Центр уведомлений
                        </h2>
                        <div>
                            <button class="btn btn-outline-secondary me-2" onclick="app.markAllNotificationsAsRead()">
                                <i class="bi bi-check-all me-1"></i>Прочитать все
                            </button>
                            <button class="btn btn-outline-danger" onclick="app.clearAllNotifications()">
                                <i class="bi bi-trash me-1"></i>Очистить все
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="row mb-4">
                <div class="col-md-3">
                    <div class="card border-start border-primary border-4">
                        <div class="card-body">
                            <div class="d-flex align-items-center">
                                <div class="flex-grow-1">
                                    <div class="text-muted small">Всего уведомлений</div>
                                    <div class="h4 mb-0">${userNotifications.length}</div>
                                </div>
                                <i class="bi bi-bell fs-1 text-primary"></i>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card border-start border-warning border-4">
                        <div class="card-body">
                            <div class="d-flex align-items-center">
                                <div class="flex-grow-1">
                                    <div class="text-muted small">Непрочитанных</div>
                                    <div class="h4 mb-0">${userNotifications.filter(n => !n.read).length}</div>
                                </div>
                                <i class="bi bi-bell-fill fs-1 text-warning"></i>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card border-start border-success border-4">
                        <div class="card-body">
                            <div class="d-flex align-items-center">
                                <div class="flex-grow-1">
                                    <div class="text-muted small">Важных</div>
                                    <div class="h4 mb-0">${userNotifications.filter(n => n.priority === 'high').length}</div>
                                </div>
                                <i class="bi bi-exclamation-triangle fs-1 text-success"></i>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card border-start border-info border-4">
                        <div class="card-body">
                            <div class="d-flex align-items-center">
                                <div class="flex-grow-1">
                                    <div class="text-muted small">За сегодня</div>
                                    <div class="h4 mb-0">${userNotifications.filter(n => {
                                        const today = new Date();
                                        const notifDate = new Date(n.createdAt);
                                        return notifDate.toDateString() === today.toDateString();
                                    }).length}</div>
                                </div>
                                <i class="bi bi-clock-history fs-1 text-info"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="row">
                <div class="col-12">
                    <div class="card shadow">
                        <div class="card-header">
                            <div class="d-flex justify-content-between align-items-center">
                                <h5 class="card-title mb-0">
                                    <i class="bi bi-list-ul me-2"></i>Мои уведомления
                                </h5>
                                <div class="btn-group btn-group-sm">
                                    <button class="btn btn-outline-primary ${this.getNotificationFilter() === 'all' ? 'active' : ''}" 
                                            onclick="app.setNotificationFilter('all')">Все</button>
                                    <button class="btn btn-outline-warning ${this.getNotificationFilter() === 'unread' ? 'active' : ''}" 
                                            onclick="app.setNotificationFilter('unread')">Непрочитанные</button>
                                    <button class="btn btn-outline-success ${this.getNotificationFilter() === 'important' ? 'active' : ''}" 
                                            onclick="app.setNotificationFilter('important')">Важные</button>
                                </div>
                            </div>
                        </div>
                        <div class="card-body">
                            ${this.renderNotificationsList(userNotifications)}
                        </div>
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Ошибка загрузки центра уведомлений:', error);
        this.showAlert('Ошибка', 'Не удалось загрузить уведомления', 'danger');
    }
}

getUserNotifications() {
    if (!this.appData.notifications) {
        this.appData.notifications = [];
    }
    
    // Фильтруем уведомления для текущего пользователя
    return this.appData.notifications.filter(notification => {
        // Уведомления без указания пользователя видны всем
        if (!notification.userId && !notification.group && !notification.role) {
            return true;
        }
        
        // Проверяем по userId
        if (notification.userId && notification.userId === this.currentUser.id) {
            return true;
        }
        
        // Проверяем по группе (для студентов)
        if (notification.group && this.currentUser.role === 'student' && notification.group === this.currentUser.group) {
            return true;
        }
        
        // Проверяем по роли
        if (notification.role && notification.role === this.currentUser.role) {
            return true;
        }
        
        return false;
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

renderNotificationsList(notifications) {
    const filter = this.getNotificationFilter();
    let filteredNotifications = notifications;
    
    // Применяем фильтр
    switch (filter) {
        case 'unread':
            filteredNotifications = notifications.filter(n => !n.read);
            break;
        case 'important':
            filteredNotifications = notifications.filter(n => n.priority === 'high');
            break;
    }
    
    if (filteredNotifications.length === 0) {
        return `
            <div class="text-center py-5">
                <i class="bi bi-bell-slash display-1 text-muted"></i>
                <h4 class="text-muted mt-3">Уведомлений нет</h4>
                <p class="text-muted">${filter === 'all' ? 'Здесь будут появляться ваши уведомления' : 
                                      filter === 'unread' ? 'Все уведомления прочитаны' : 
                                      'Важных уведомлений нет'}</p>
            </div>
        `;
    }
    
    return `
        <div class="list-group">
            ${filteredNotifications.map(notification => `
                <div class="list-group-item ${!notification.read ? 'bg-light' : ''}">
                    <div class="d-flex justify-content-between align-items-start">
                        <div class="flex-grow-1 me-3">
                            <div class="d-flex align-items-center mb-2">
                                ${this.getNotificationIcon(notification.type)}
                                <h6 class="mb-0 ms-2 ${!notification.read ? 'fw-bold' : ''}">
                                    ${notification.title}
                                    ${notification.priority === 'high' ? '<span class="badge bg-danger ms-2">Важно</span>' : ''}
                                </h6>
                            </div>
                            <p class="mb-2 text-muted">${notification.message}</p>
                            <div class="d-flex flex-wrap gap-2">
                                <small class="text-muted">
                                    <i class="bi bi-clock me-1"></i>
                                    ${new Date(notification.createdAt).toLocaleString('ru-RU')}
                                </small>
                                ${notification.relatedEvent ? `
                                    <small class="text-primary">
                                        <i class="bi bi-calendar-event me-1"></i>
                                        Связано с событием
                                    </small>
                                ` : ''}
                                ${notification.relatedGrade ? `
                                    <small class="text-success">
                                        <i class="bi bi-journal-check me-1"></i>
                                        Новая оценка
                                    </small>
                                ` : ''}
                            </div>
                        </div>
                        <div class="btn-group btn-group-sm flex-shrink-0">
                            ${!notification.read ? `
                                <button class="btn btn-outline-success" onclick="app.markNotificationAsRead('${notification.id}')" 
                                        title="Отметить как прочитанное">
                                    <i class="bi bi-check"></i>
                                </button>
                            ` : ''}
                            <button class="btn btn-outline-danger" onclick="app.deleteNotification('${notification.id}')" 
                                    title="Удалить уведомление">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

getNotificationIcon(type) {
    const icons = {
        'calendar': 'bi-calendar-event text-primary',
        'grade': 'bi-journal-check text-success', 
        'attendance': 'bi-clipboard-check text-info',
        'system': 'bi-gear text-secondary',
        'warning': 'bi-exclamation-triangle text-warning',
        'info': 'bi-info-circle text-primary'
    };
    
    const iconClass = icons[type] || 'bi-bell text-muted';
    return `<i class="bi ${iconClass} fs-5"></i>`;
}

getNotificationFilter() {
    return localStorage.getItem('notificationFilter') || 'all';
}

setNotificationFilter(filter) {
    localStorage.setItem('notificationFilter', filter);
    this.loadNotificationsTab();
}

markNotificationAsRead(notificationId) {
    try {
        const notification = this.appData.notifications.find(n => n.id === notificationId);
        if (notification) {
            notification.read = true;
            notification.readAt = new Date().toISOString();
            this.saveData();
            this.updateNotificationBadge();
            this.loadNotificationsTab();
        }
    } catch (error) {
        console.error('Ошибка отметки уведомления как прочитанного:', error);
    }
}

markAllNotificationsAsRead() {
    try {
        const userNotifications = this.getUserNotifications();
        userNotifications.forEach(notification => {
            if (!notification.read) {
                notification.read = true;
                notification.readAt = new Date().toISOString();
            }
        });
        
        this.saveData();
        this.updateNotificationBadge();
        this.loadNotificationsTab();
        this.showAlert('Успех', 'Все уведомления отмечены как прочитанные', 'success');
    } catch (error) {
        console.error('Ошибка отметки всех уведомлений:', error);
    }
}

deleteNotification(notificationId) {
    try {
        this.appData.notifications = this.appData.notifications.filter(n => n.id !== notificationId);
        this.saveData();
        this.updateNotificationBadge();
        this.loadNotificationsTab();
        this.showAlert('Удалено', 'Уведомление удалено', 'info');
    } catch (error) {
        console.error('Ошибка удаления уведомления:', error);
    }
}

clearAllNotifications() {
    try {
        if (confirm('Вы уверены, что хотите удалить все уведомления? Это действие нельзя отменить.')) {
            const userNotifications = this.getUserNotifications();
            this.appData.notifications = this.appData.notifications.filter(n => 
                !userNotifications.some(un => un.id === n.id)
            );
            
            this.saveData();
            this.updateNotificationBadge();
            this.loadNotificationsTab();
            this.showAlert('Удалено', 'Все уведомления удалены', 'info');
        }
    } catch (error) {
        console.error('Ошибка очистки уведомлений:', error);
    }
}

// СИСТЕМА СОЗДАНИЯ УВЕДОМЛЕНИЙ
createNotification(notificationData) {
    try {
        if (!this.appData.notifications) {
            this.appData.notifications = [];
        }
        
        const notification = {
            id: this.generateId(),
            type: notificationData.type || 'info',
            title: notificationData.title,
            message: notificationData.message,
            priority: notificationData.priority || 'normal',
            userId: notificationData.userId, // Для конкретного пользователя
            group: notificationData.group,    // Для группы студентов
            role: notificationData.role,      // Для роли
            relatedEvent: notificationData.relatedEvent,
            relatedGrade: notificationData.relatedGrade,
            read: false,
            createdAt: new Date().toISOString(),
            createdBy: this.currentUser?.id
        };
        
        this.appData.notifications.push(notification);
        this.saveData();
        this.updateNotificationBadge();
        
        // Показываем всплывающее уведомление для важных сообщений
        if (notification.priority === 'high') {
            this.showAlert(notification.title, notification.message, 'warning');
        }
        
        return notification;
    } catch (error) {
        console.error('Ошибка создания уведомления:', error);
    }
}

updateNotificationBadge() {
    try {
        const badge = document.getElementById('notificationBadgeNav');
        const userNotifications = this.getUserNotifications();
        const unreadCount = userNotifications.filter(n => !n.read).length;
        
        if (badge) {
            if (unreadCount > 0) {
                badge.textContent = unreadCount;
                badge.style.display = 'inline';
            } else {
                badge.style.display = 'none';
            }
        }
    } catch (error) {
        console.error('Ошибка обновления бейджа уведомлений:', error);
    }
}

// АВТОМАТИЧЕСКИЕ УВЕДОМЛЕНИЯ

// Уведомление о новой оценке
createGradeNotification(grade, isUpdate = false) {
    const student = this.appData.students.find(s => s.id === grade.studentId);
    const subject = this.appData.subjects.find(s => s.id === grade.subjectId);
    
    if (student && subject) {
        this.createNotification({
            type: 'grade',
            title: isUpdate ? 'Оценка обновлена' : 'Новая оценка',
            message: `Студенту ${student.name} по предмету "${subject.name}" ${isUpdate ? 'обновлена' : 'выставлена'} оценка: ${grade.grade} (${grade.semester})`,
            userId: this.findStudentUserId(student.id),
            relatedGrade: grade.id,
            priority: 'normal'
        });
    }
}

// Уведомление о зачётном мероприятии
createAttendanceNotification(event) {
    const subject = this.appData.subjects.find(s => s.id === event.subjectId);
    
    if (subject && event.group) {
        this.createNotification({
            type: 'attendance', 
            title: 'Зачётное мероприятие',
            message: `Проведено мероприятие по предмету "${subject.name}" для группы ${event.group}`,
            group: event.group, // Для всех студентов группы
            relatedEvent: event.id,
            priority: 'normal'
        });
    }
}

// Уведомление о предстоящем событии
createCalendarEventNotification(event) {
    const subject = this.appData.subjects.find(s => s.id === event.subjectId);
    const daysUntilEvent = Math.ceil((new Date(event.date) - new Date()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilEvent <= 1) { // Уведомляем за 1 день
        this.createNotification({
            type: 'calendar',
            title: 'Напоминание о событии',
            message: `Завтра: ${event.title}${subject ? ` по предмету "${subject.name}"` : ''}`,
            group: event.group,
            relatedEvent: event.id,
            priority: 'high'
        });
    }
}

// Системные уведомления
createSystemNotification(title, message, priority = 'normal') {
    this.createNotification({
        type: 'system',
        title: title,
        message: message,
        priority: priority
    });
}

// Вспомогательный метод для поиска userId студента
findStudentUserId(studentId) {
    const student = this.appData.students.find(s => s.id === studentId);
    if (student) {
        const user = this.appData.users.find(u => 
            u.role === 'student' && u.name === student.name && u.group === student.group
        );
        return user?.id;
    }
    return null;
}

// СИСТЕМА УПРАВЛЕНИЯ ГРУППАМИ
loadGroupsTab() {
    try {
        // Проверяем права доступа
        if (this.currentUser.role !== 'admin') {
            document.getElementById('groupsTab').innerHTML = this.getAccessDeniedMessage();
            return;
        }

        const container = document.getElementById('groupsTab');
        const groups = this.getGroupsWithStats();
        
        container.innerHTML = `
            <div class="row">
                <div class="col-12">
                    <div class="d-flex justify-content-between align-items-center mb-4">
                        <h2 class="h3 mb-0">
                            <i class="bi bi-people-fill me-2 text-info"></i>Управление группами
                        </h2>
                        <button class="btn btn-info" onclick="app.showAddGroupModal()">
                            <i class="bi bi-plus-circle me-1"></i>Создать группу
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- Статистика групп -->
            <div class="row mb-4">
                <div class="col-md-3">
                    <div class="card border-start border-primary border-4">
                        <div class="card-body">
                            <div class="d-flex align-items-center">
                                <div class="flex-grow-1">
                                    <div class="text-muted small">Всего групп</div>
                                    <div class="h4 mb-0">${groups.length}</div>
                                </div>
                                <i class="bi bi-people fs-1 text-primary"></i>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card border-start border-success border-4">
                        <div class="card-body">
                            <div class="d-flex align-items-center">
                                <div class="flex-grow-1">
                                    <div class="text-muted small">Всего студентов</div>
                                    <div class="h4 mb-0">${this.getTotalStudentsCount()}</div>
                                </div>
                                <i class="bi bi-person-check fs-1 text-success"></i>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card border-start border-warning border-4">
                        <div class="card-body">
                            <div class="d-flex align-items-center">
                                <div class="flex-grow-1">
                                    <div class="text-muted small">Средний балл</div>
                                    <div class="h4 mb-0">${this.getOverallAverageGrade()}</div>
                                </div>
                                <i class="bi bi-graph-up fs-1 text-warning"></i>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card border-start border-danger border-4">
                        <div class="card-body">
                            <div class="d-flex align-items-center">
                                <div class="flex-grow-1">
                                    <div class="text-muted small">Активных групп</div>
                                    <div class="h4 mb-0">${groups.filter(g => g.isActive).length}</div>
                                </div>
                                <i class="bi bi-check-circle fs-1 text-danger"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Список групп -->
            <div class="row">
                <div class="col-12">
                    <div class="card shadow">
                        <div class="card-header">
                            <h5 class="card-title mb-0">
                                <i class="bi bi-list-ul me-2"></i>Список учебных групп
                            </h5>
                        </div>
                        <div class="card-body">
                            ${this.renderGroupsTable(groups)}
                        </div>
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Ошибка загрузки вкладки групп:', error);
        this.showAlert('Ошибка', 'Не удалось загрузить раздел групп', 'danger');
    }
}

getGroupsWithStats() {
    // Если коллекции групп нет, создаем её из существующих студентов
    if (!this.appData.groups || this.appData.groups.length === 0) {
        this.initializeGroupsFromStudents();
    }
    
    return this.appData.groups.map(group => {
        const studentsInGroup = this.appData.students.filter(s => s.group === group.name);
        const groupGrades = this.appData.grades.filter(g => {
            const student = this.appData.students.find(s => s.id === g.studentId);
            return student && student.group === group.name;
        });
        
        // Находим куратора
        const curator = group.curatorId ? 
            this.appData.users.find(u => u.id === group.curatorId) : null;
        
        const numericGrades = groupGrades
            .map(g => parseInt(g.grade))
            .filter(g => !isNaN(g));
        
        const averageGrade = numericGrades.length > 0 
            ? (numericGrades.reduce((a, b) => a + b, 0) / numericGrades.length).toFixed(2)
            : '0.00';
            
        return {
            id: group.id,
            name: group.name,
            specialty: group.specialty || '',
            studentCount: studentsInGroup.length,
            averageGrade: averageGrade,
            curator: curator ? curator.name : 'Не назначен',
            curatorId: curator ? curator.id : null,
            isActive: group.isActive !== false, // по умолчанию активна
            createdAt: group.createdAt
        };
    }).sort((a, b) => a.name.localeCompare(b.name));
}

// ДОБАВЬ этот метод для инициализации групп из студентов
initializeGroupsFromStudents() {
    const existingGroups = [...new Set(this.appData.students.map(s => s.group))].filter(g => g);
    
    this.appData.groups = existingGroups.map(groupName => ({
        id: this.generateId(),
        name: groupName,
        specialty: '',
        curatorId: null,
        createdAt: new Date().toISOString(),
        isActive: true
    }));
    
    this.saveData();
}

getTotalStudentsCount() {
    return this.appData.students.length;
}

getOverallAverageGrade() {
    const numericGrades = this.appData.grades
        .map(g => parseInt(g.grade))
        .filter(g => !isNaN(g));
    
    return numericGrades.length > 0 
        ? (numericGrades.reduce((a, b) => a + b, 0) / numericGrades.length).toFixed(2)
        : '0.00';
}

getGroupCreationDate(groupName) {
    // Находим самую раннюю дату создания студента в этой группе
    const groupStudents = this.appData.students.filter(s => s.group === groupName);
    if (groupStudents.length === 0) return new Date().toISOString();
    
    return groupStudents.reduce((earliest, student) => {
        return student.createdAt < earliest ? student.createdAt : earliest;
    }, groupStudents[0].createdAt);
}

renderGroupsTable(groups) {
    if (groups.length === 0) {
        return `
            <div class="text-center py-5">
                <i class="bi bi-people display-1 text-muted"></i>
                <h4 class="text-muted mt-3">Группы не созданы</h4>
                <p class="text-muted">Создайте первую учебную группу</p>
                <button class="btn btn-info mt-3" onclick="app.showAddGroupModal()">
                    <i class="bi bi-plus-circle me-1"></i>Создать группу
                </button>
            </div>
        `;
    }
    
    return `
        <div class="table-responsive">
            <table class="table table-hover">
                <thead>
                    <tr>
                        <th>Группа</th>
                        <th>Количество студентов</th>
                        <th>Средний балл</th>
                        <th>Куратор</th>
                        <th>Статус</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
                    ${groups.map(group => `
                        <tr>
                            <td>
                                <i class="bi bi-people-fill me-2 text-info"></i>
                                <strong>${group.name}</strong>
                            </td>
                            <td>
                                <span class="badge bg-primary">${group.studentCount}</span>
                            </td>
                            <td>
                                <span class="badge ${group.averageGrade >= 4 ? 'bg-success' : group.averageGrade >= 3 ? 'bg-warning' : 'bg-danger'}">
                                    ${group.averageGrade}
                                </span>
                            </td>
                            <td>
                                ${group.curator}
                                ${group.curatorId ? `
                                    <button class="btn btn-sm btn-outline-secondary ms-1" onclick="app.changeGroupCurator('${group.name}')">
                                        <i class="bi bi-pencil"></i>
                                    </button>
                                ` : ''}
                            </td>
                            <td>
                                <span class="badge ${group.isActive ? 'bg-success' : 'bg-secondary'}">
                                    ${group.isActive ? 'Активна' : 'Неактивна'}
                                </span>
                            </td>
                            <td>
                                <div class="btn-group btn-group-sm">
                                    <button class="btn btn-outline-primary" onclick="app.viewGroupDetails('${group.name}')">
                                        <i class="bi bi-eye"></i>
                                    </button>
                                    <button class="btn btn-outline-info" onclick="app.editGroup('${group.name}')">
                                        <i class="bi bi-pencil"></i>
                                    </button>
                                    <button class="btn btn-outline-danger" onclick="app.deleteGroup('${group.name}')">
                                        <i class="bi bi-trash"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// МОДАЛЬНЫЕ ОКНА ДЛЯ ГРУПП
showAddGroupModal() {
    try {
        const modalHTML = `
            <div class="modal fade" id="addGroupModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Создать группу</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="addGroupForm">
                                <div class="mb-3">
                                    <label for="groupName" class="form-label">Название группы *</label>
                                    <input type="text" class="form-control" id="groupName" 
                                           placeholder="Например: ИТ-21" required>
                                    <div class="form-text">Формат: Направление-Номер (ИТ-21, ПКС-22)</div>
                                </div>
                                <div class="mb-3">
                                    <label for="groupSpecialty" class="form-label">Специальность</label>
                                    <input type="text" class="form-control" id="groupSpecialty" 
                                           placeholder="Например: Информационные технологии">
                                </div>
                                <div class="mb-3">
                                    <label for="groupCurator" class="form-label">Куратор</label>
                                    <select class="form-select" id="groupCurator">
                                        <option value="">Не назначен</option>
                                        ${this.appData.users
                                            .filter(u => u.role === 'teacher')
                                            .map(teacher => 
                                                `<option value="${teacher.id}">${teacher.name}</option>`
                                            ).join('')}
                                    </select>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Отмена</button>
                            <button type="button" class="btn btn-info" onclick="app.addGroup()">
                                <i class="bi bi-check-lg me-1"></i>Создать группу
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        const oldModal = document.getElementById('addGroupModal');
        if (oldModal) oldModal.remove();
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        const modal = new bootstrap.Modal(document.getElementById('addGroupModal'));
        modal.show();
        
    } catch (error) {
        console.error('Ошибка показа модального окна группы:', error);
        this.showAlert('Ошибка', 'Не удалось открыть форму создания группы', 'danger');
    }
}

addGroup() {
    try {
        const name = document.getElementById('groupName')?.value.trim();
        const specialty = document.getElementById('groupSpecialty')?.value.trim();
        const curatorId = document.getElementById('groupCurator')?.value;
        
        if (!name) {
            this.showAlert('Ошибка', 'Введите название группы!', 'warning');
            return;
        }
        
        // Проверяем, что группа с таким названием не существует
        const existingGroups = this.getExistingGroups();
        if (existingGroups.includes(name)) {
            this.showAlert('Ошибка', 'Группа с таким названием уже существует!', 'danger');
            return;
        }
        
        // СОЗДАЕМ ГРУППУ В СИСТЕМЕ
        // Для этого нам нужно создать отдельную коллекцию групп в appData
        if (!this.appData.groups) {
            this.appData.groups = [];
        }
        
        const newGroup = {
            id: this.generateId(),
            name: name,
            specialty: specialty || '',
            curatorId: curatorId || null,
            createdAt: new Date().toISOString(),
            createdBy: this.currentUser?.id,
            isActive: true
        };
        
        this.appData.groups.push(newGroup);
        
        // Если назначен куратор, обновляем его данные
        if (curatorId) {
            const curator = this.appData.users.find(u => u.id === curatorId);
            if (curator) {
                if (!curator.groups) {
                    curator.groups = [];
                }
                if (!curator.groups.includes(name)) {
                    curator.groups.push(name);
                }
            }
        }
        
        // Сохраняем данные
        if (this.saveData()) {
            const modal = bootstrap.Modal.getInstance(document.getElementById('addGroupModal'));
            if (modal) modal.hide();
            
            this.showAlert('Успех', `Группа "${name}" успешно создана!`, 'success');
            
            // Обновляем список групп
            this.loadGroupsTab();
        }
        
    } catch (error) {
        console.error('Ошибка создания группы:', error);
        this.showAlert('Ошибка', 'Не удалось создать группу', 'danger');
    }
}

// МЕТОДЫ ДЛЯ КНОПОК ДЕЙСТВИЙ
viewGroupDetails(groupName) {
    try {
        const studentsInGroup = this.appData.students.filter(s => s.group === groupName);
        const groupStats = this.getGroupsWithStats().find(g => g.name === groupName);
        
        let html = `
            <div class="modal fade" id="groupDetailsModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">
                                <i class="bi bi-people-fill me-2 text-info"></i>Группа: ${groupName}
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row mb-4">
                                <div class="col-md-6">
                                    <p><strong>Название:</strong> ${groupName}</p>
                                    <p><strong>Количество студентов:</strong> <span class="badge bg-primary">${studentsInGroup.length}</span></p>
                                    <p><strong>Средний балл:</strong> <span class="badge ${groupStats.averageGrade >= 4 ? 'bg-success' : groupStats.averageGrade >= 3 ? 'bg-warning' : 'bg-danger'}">${groupStats.averageGrade}</span></p>
                                </div>
                                <div class="col-md-6">
                                    <p><strong>Куратор:</strong> ${groupStats.curator}</p>
                                    <p><strong>Статус:</strong> <span class="badge ${groupStats.isActive ? 'bg-success' : 'bg-secondary'}">${groupStats.isActive ? 'Активна' : 'Неактивна'}</span></p>
                                </div>
                            </div>
                            
                            <h6>Студенты группы:</h6>
        `;
        
        if (studentsInGroup.length === 0) {
            html += '<p class="text-muted">В группе пока нет студентов</p>';
        } else {
            html += `
                <div class="table-responsive">
                    <table class="table table-sm">
                        <thead>
                            <tr>
                                <th>ФИО студента</th>
                                <th>Количество оценок</th>
                                <th>Средний балл</th>
                            </tr>
                        </thead>
                        <tbody>
            `;
            
            studentsInGroup.forEach(student => {
                const stats = this.getStudentStatistics(student.id);
                html += `
                    <tr>
                        <td>
                            <i class="bi bi-person-circle me-1 text-primary"></i>
                            ${student.name}
                        </td>
                        <td><span class="badge bg-info">${stats.totalGrades}</span></td>
                        <td><span class="badge ${stats.averageGrade >= 4 ? 'bg-success' : stats.averageGrade >= 3 ? 'bg-warning' : 'bg-danger'}">${stats.averageGrade}</span></td>
                    </tr>
                `;
            });
            
            html += `
                        </tbody>
                    </table>
                </div>
            `;
        }
        
        html += `
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        const oldModal = document.getElementById('groupDetailsModal');
        if (oldModal) oldModal.remove();
        
        document.body.insertAdjacentHTML('beforeend', html);
        const modal = new bootstrap.Modal(document.getElementById('groupDetailsModal'));
        modal.show();
        
    } catch (error) {
        console.error('Ошибка показа деталей группы:', error);
        this.showAlert('Ошибка', 'Не удалось загрузить информацию о группе', 'danger');
    }
}

editGroup(groupName) {
    this.showAlert('Информация', 'Функция редактирования группы будет доступна в следующем обновлении', 'info');
}

deleteGroup(groupName) {
    try {
        const studentsInGroup = this.appData.students.filter(s => s.group === groupName);
        
        if (studentsInGroup.length > 0) {
            this.showAlert('Ошибка', `Нельзя удалить группу "${groupName}", так как в ней есть студенты. Сначала переместите или удалите студентов.`, 'danger');
            return;
        }
        
        if (confirm(`Вы уверены, что хотите удалить группу "${groupName}"?`)) {
            // Удаляем группу из коллекции групп
            this.appData.groups = this.appData.groups.filter(g => g.name !== groupName);
            
            // Удаляем группу из всех пользователей
            this.appData.users.forEach(user => {
                if (user.groups && user.groups.includes(groupName)) {
                    user.groups = user.groups.filter(g => g !== groupName);
                }
            });
            
            if (this.saveData()) {
                this.showAlert('Успех', `Группа "${groupName}" удалена`, 'success');
                this.loadGroupsTab();
            }
        }
    } catch (error) {
        console.error('Ошибка удаления группы:', error);
        this.showAlert('Ошибка', 'Не удалось удалить группу', 'danger');
    }
}

editGroup(groupName) {
    try {
        const group = this.appData.groups.find(g => g.name === groupName);
        if (!group) {
            this.showAlert('Ошибка', 'Группа не найдена!', 'danger');
            return;
        }

        const modalHTML = `
            <div class="modal fade" id="editGroupModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Редактировать группу: ${groupName}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="editGroupForm">
                                <div class="mb-3">
                                    <label for="editGroupName" class="form-label">Название группы *</label>
                                    <input type="text" class="form-control" id="editGroupName" 
                                           value="${group.name}" required>
                                    <div class="form-text">Текущее название: ${group.name}</div>
                                </div>
                                <div class="mb-3">
                                    <label for="editGroupSpecialty" class="form-label">Специальность</label>
                                    <input type="text" class="form-control" id="editGroupSpecialty" 
                                           value="${group.specialty || ''}" 
                                           placeholder="Например: Информационные технологии">
                                </div>
                                <div class="mb-3">
                                    <label for="editGroupCurator" class="form-label">Куратор</label>
                                    <select class="form-select" id="editGroupCurator">
                                        <option value="">Не назначен</option>
                                        ${this.appData.users
                                            .filter(u => u.role === 'teacher')
                                            .map(teacher => 
                                                `<option value="${teacher.id}" ${group.curatorId === teacher.id ? 'selected' : ''}>
                                                    ${teacher.name}
                                                </option>`
                                            ).join('')}
                                    </select>
                                </div>
                                <div class="mb-3 form-check">
                                    <input type="checkbox" class="form-check-input" id="editGroupActive" ${group.isActive !== false ? 'checked' : ''}>
                                    <label class="form-check-label" for="editGroupActive">Группа активна</label>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Отмена</button>
                            <button type="button" class="btn btn-info" onclick="app.updateGroup('${groupName}')">
                                <i class="bi bi-check-lg me-1"></i>Сохранить изменения
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        const oldModal = document.getElementById('editGroupModal');
        if (oldModal) oldModal.remove();
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        const modal = new bootstrap.Modal(document.getElementById('editGroupModal'));
        modal.show();
        
    } catch (error) {
        console.error('Ошибка показа формы редактирования:', error);
        this.showAlert('Ошибка', 'Не удалось открыть форму редактирования', 'danger');
    }
}

updateGroup(oldGroupName) {
    try {
        const newName = document.getElementById('editGroupName')?.value.trim();
        const specialty = document.getElementById('editGroupSpecialty')?.value.trim();
        const curatorId = document.getElementById('editGroupCurator')?.value;
        const isActive = document.getElementById('editGroupActive')?.checked;
        
        if (!newName) {
            this.showAlert('Ошибка', 'Введите название группы!', 'warning');
            return;
        }
        
        const group = this.appData.groups.find(g => g.name === oldGroupName);
        if (!group) {
            this.showAlert('Ошибка', 'Группа не найдена!', 'danger');
            return;
        }
        
        // Проверяем, что новое название не занято (кроме текущей группы)
        if (newName !== oldGroupName) {
            const existingGroup = this.appData.groups.find(g => g.name === newName && g.name !== oldGroupName);
            if (existingGroup) {
                this.showAlert('Ошибка', 'Группа с таким названием уже существует!', 'danger');
                return;
            }
        }
        
        // Сохраняем старого куратора для обновления
        const oldCuratorId = group.curatorId;
        
        // Обновляем данные группы
        group.name = newName;
        group.specialty = specialty || '';
        group.curatorId = curatorId || null;
        group.isActive = isActive;
        group.updatedAt = new Date().toISOString();
        group.updatedBy = this.currentUser?.id;
        
        // Обновляем кураторов
        this.updateGroupCurator(oldGroupName, newName, oldCuratorId, curatorId);
        
        // Обновляем группу у студентов
        this.updateStudentsGroup(oldGroupName, newName);
        
        // Обновляем группу у пользователей
        this.updateUsersGroup(oldGroupName, newName);
        
        if (this.saveData()) {
            const modal = bootstrap.Modal.getInstance(document.getElementById('editGroupModal'));
            if (modal) modal.hide();
            
            this.showAlert('Успех', `Группа "${oldGroupName}" успешно обновлена!`, 'success');
            this.loadGroupsTab();
        }
        
    } catch (error) {
        console.error('Ошибка обновления группы:', error);
        this.showAlert('Ошибка', 'Не удалось обновить группу', 'danger');
    }
}

// ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ ДЛЯ ОБНОВЛЕНИЯ ДАННЫХ
updateGroupCurator(oldGroupName, newGroupName, oldCuratorId, newCuratorId) {
    // Удаляем старую группу у предыдущего куратора
    if (oldCuratorId && oldCuratorId !== newCuratorId) {
        const oldCurator = this.appData.users.find(u => u.id === oldCuratorId);
        if (oldCurator && oldCurator.groups) {
            oldCurator.groups = oldCurator.groups.filter(g => g !== oldGroupName);
        }
    }
    
    // Добавляем группу новому куратору
    if (newCuratorId) {
        const newCurator = this.appData.users.find(u => u.id === newCuratorId);
        if (newCurator) {
            if (!newCurator.groups) {
                newCurator.groups = [];
            }
            if (!newCurator.groups.includes(newGroupName)) {
                newCurator.groups.push(newGroupName);
            }
        }
    }
}

updateStudentsGroup(oldGroupName, newGroupName) {
    // Обновляем группу у всех студентов
    this.appData.students.forEach(student => {
        if (student.group === oldGroupName) {
            student.group = newGroupName;
        }
    });
}

updateUsersGroup(oldGroupName, newGroupName) {
    // Обновляем группу у всех пользователей (для кураторов и т.д.)
    this.appData.users.forEach(user => {
        if (user.groups && user.groups.includes(oldGroupName)) {
            user.groups = user.groups.map(g => g === oldGroupName ? newGroupName : g);
        }
        
        // Обновляем группу у студентов-пользователей
        if (user.role === 'student' && user.group === oldGroupName) {
            user.group = newGroupName;
        }
    });
}

changeGroupCurator(groupName) {
    try {
        const group = this.appData.groups.find(g => g.name === groupName);
        if (!group) {
            this.showAlert('Ошибка', 'Группа не найдена!', 'danger');
            return;
        }

        const modalHTML = `
            <div class="modal fade" id="changeCuratorModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Смена куратора: ${groupName}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="changeCuratorForm">
                                <div class="mb-3">
                                    <label for="newCurator" class="form-label">Новый куратор</label>
                                    <select class="form-select" id="newCurator">
                                        <option value="">Не назначен</option>
                                        ${this.appData.users
                                            .filter(u => u.role === 'teacher')
                                            .map(teacher => 
                                                `<option value="${teacher.id}" ${group.curatorId === teacher.id ? 'selected' : ''}>
                                                    ${teacher.name}
                                                </option>`
                                            ).join('')}
                                    </select>
                                </div>
                                ${group.curatorId ? `
                                    <div class="alert alert-info">
                                        <i class="bi bi-info-circle me-2"></i>
                                        Текущий куратор: ${this.appData.users.find(u => u.id === group.curatorId)?.name || 'Не назначен'}
                                    </div>
                                ` : ''}
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Отмена</button>
                            <button type="button" class="btn btn-warning" onclick="app.saveNewCurator('${groupName}')">
                                <i class="bi bi-person-check me-1"></i>Назначить куратора
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        const oldModal = document.getElementById('changeCuratorModal');
        if (oldModal) oldModal.remove();
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        const modal = new bootstrap.Modal(document.getElementById('changeCuratorModal'));
        modal.show();
        
    } catch (error) {
        console.error('Ошибка показа формы смены куратора:', error);
        this.showAlert('Ошибка', 'Не удалось открыть форму смены куратора', 'danger');
    }
}

saveNewCurator(groupName) {
    try {
        const newCuratorId = document.getElementById('newCurator')?.value;
        const group = this.appData.groups.find(g => g.name === groupName);
        
        if (!group) {
            this.showAlert('Ошибка', 'Группа не найдена!', 'danger');
            return;
        }
        
        const oldCuratorId = group.curatorId;
        
        // Обновляем куратора в группе
        group.curatorId = newCuratorId || null;
        group.updatedAt = new Date().toISOString();
        group.updatedBy = this.currentUser?.id;
        
        // Обновляем данные кураторов
        this.updateGroupCurator(groupName, groupName, oldCuratorId, newCuratorId);
        
        if (this.saveData()) {
            const modal = bootstrap.Modal.getInstance(document.getElementById('changeCuratorModal'));
            if (modal) modal.hide();
            
            const curatorName = newCuratorId ? 
                this.appData.users.find(u => u.id === newCuratorId)?.name : 'Не назначен';
            
            this.showAlert('Успех', `Куратор группы "${groupName}" изменен на: ${curatorName}`, 'success');
            this.loadGroupsTab();
        }
        
    } catch (error) {
        console.error('Ошибка сохранения куратора:', error);
        this.showAlert('Ошибка', 'Не удалось сохранить куратора', 'danger');
    }
}

// СИСТЕМА УПРАВЛЕНИЯ СТУДЕНТАМИ
loadStudentsManagementTab() {
    try {
        // Проверяем права доступа
        if (this.currentUser.role !== 'admin') {
            document.getElementById('students-managementTab').innerHTML = this.getAccessDeniedMessage();
            return;
        }

        const container = document.getElementById('students-managementTab');
        const students = this.appData.students;
        
        console.log('Загружаем вкладку студентов, всего:', students.length);
        
        container.innerHTML = `
            <div class="row">
                <div class="col-12">
                    <div class="d-flex justify-content-between align-items-center mb-4">
                        <h2 class="h3 mb-0">
                            <i class="bi bi-person-video me-2 text-success"></i>Управление студентами
                        </h2>
                        <button class="btn btn-success" onclick="app.showAddStudentUserModal()">
                            <i class="bi bi-person-plus me-1"></i>Добавить студента
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- Статистика студентов -->
            <div class="row mb-4">
                <div class="col-md-3">
                    <div class="card border-start border-primary border-4">
                        <div class="card-body">
                            <div class="d-flex align-items-center">
                                <div class="flex-grow-1">
                                    <div class="text-muted small">Всего студентов</div>
                                    <div class="h4 mb-0">${students.length}</div>
                                </div>
                                <i class="bi bi-people fs-1 text-primary"></i>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card border-start border-info border-4">
                        <div class="card-body">
                            <div class="d-flex align-items-center">
                                <div class="flex-grow-1">
                                    <div class="text-muted small">Активных групп</div>
                                    <div class="h4 mb-0">${new Set(students.map(s => s.group)).size}</div>
                                </div>
                                <i class="bi bi-people-fill fs-1 text-info"></i>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card border-start border-warning border-4">
                        <div class="card-body">
                            <div class="d-flex align-items-center">
                                <div class="flex-grow-1">
                                    <div class="text-muted small">Средний балл</div>
                                    <div class="h4 mb-0">${this.getOverallAverageGrade()}</div>
                                </div>
                                <i class="bi bi-graph-up fs-1 text-warning"></i>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card border-start border-danger border-4">
                        <div class="card-body">
                            <div class="d-flex align-items-center">
                                <div class="flex-grow-1">
                                    <div class="text-muted small">Без оценок</div>
                                    <div class="h4 mb-0">${this.getStudentsWithoutGrades().length}</div>
                                </div>
                                <i class="bi bi-journal-x fs-1 text-danger"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Фильтры и поиск -->
            <div class="row mb-4">
                <div class="col-md-3">
                    <label for="studentGroupFilter" class="form-label small text-muted">Группа</label>
                    <select class="form-select" id="studentGroupFilter" onchange="app.filterStudents()">
                        <option value="all">Все группы</option>
                        ${this.getExistingGroups().map(group => 
                            `<option value="${group}">${group}</option>`
                        ).join('')}
                    </select>
                </div>
                <div class="col-md-3">
                    <label for="studentStatusFilter" class="form-label small text-muted">Успеваемость</label>
                    <select class="form-select" id="studentStatusFilter" onchange="app.filterStudents()">
                        <option value="all">Все студенты</option>
                        <option value="with-grades">С оценками</option>
                        <option value="without-grades">Без оценок</option>
                        <option value="excellent">Отличники (≥4.5)</option>
                        <option value="good">Хорошисты (4.0-4.49)</option>
                        <option value="satisfactory">Успевающие (3.0-3.99)</option>
                        <option value="unsatisfactory">Неуспевающие (<3.0)</option>
                    </select>
                </div>
                <div class="col-md-3">
                    <label for="studentAccountFilter" class="form-label small text-muted">Аккаунт</label>
                    <select class="form-select" id="studentAccountFilter" onchange="app.filterStudents()">
                        <option value="all">Все</option>
                        <option value="with-account">С аккаунтом</option>
                        <option value="without-account">Без аккаунта</option>
                        <option value="active">Активные</option>
                        <option value="disabled">Отключенные</option>
                    </select>
                </div>
                <div class="col-md-3">
                    <label for="studentSearch" class="form-label small text-muted">Поиск</label>
                    <div class="input-group">
                        <input type="text" class="form-control" id="studentSearch" 
                               placeholder="ФИО студента..." onkeyup="app.filterStudents()">
                        <button class="btn btn-outline-secondary" type="button" onclick="app.clearStudentFilters()">
                            <i class="bi bi-x-circle"></i>
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- Список студентов -->
            <div class="row">
                <div class="col-12">
                    <div class="card shadow">
                        <div class="card-header">
                            <div class="d-flex justify-content-between align-items-center">
                                <h5 class="card-title mb-0">
                                    <i class="bi bi-list-ul me-2"></i>Список студентов
                                    <span id="studentsCountBadge" class="badge bg-primary ms-2">${students.length}</span>
                                </h5>
                                <div class="btn-group">
                                    <button class="btn btn-sm btn-outline-secondary" onclick="app.exportStudentsList()">
                                        <i class="bi bi-download me-1"></i>Экспорт
                                    </button>
                                    <button class="btn btn-sm btn-outline-secondary" onclick="app.clearStudentFilters()">
                                        <i class="bi bi-arrow-clockwise me-1"></i>Сбросить
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div class="card-body">
                            <div id="studentsListContainer">
                                ${this.renderStudentsManagementList(students)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Ошибка загрузки вкладки управления студентами:', error);
        this.showAlert('Ошибка', 'Не удалось загрузить раздел студентов', 'danger');
    }
}

//рендеринг списка студентов
renderSimpleStudentsList(students) {
    return `
        <div class="table-responsive">
            <table class="table table-hover">
                <thead>
                    <tr>
                        <th>ФИО студента</th>
                        <th>Группа</th>
                        <th>Количество оценок</th>
                        <th>Средний балл</th>
                        <th>Статус</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
                    ${students.map(student => {
                        const stats = this.getStudentStatistics(student.id);
                        const status = this.getStudentStatus(stats.averageGrade, stats.totalGrades);
                        
                        return `
                            <tr>
                                <td>
                                    <i class="bi bi-person-circle me-2 text-primary"></i>
                                    <strong>${student.name}</strong>
                                </td>
                                <td>
                                    <span class="badge bg-info">${student.group}</span>
                                </td>
                                <td>
                                    <span class="badge ${stats.totalGrades > 0 ? 'bg-primary' : 'bg-secondary'}">
                                        ${stats.totalGrades}
                                    </span>
                                </td>
                                <td>
                                    <span class="badge ${this.getGradeBadgeClass(stats.averageGrade)}">
                                        ${stats.averageGrade}
                                    </span>
                                </td>
                                <td>
                                    ${status}
                                </td>
                                <td>
                                    <div class="btn-group btn-group-sm">
                                        <button class="btn btn-outline-primary" onclick="app.viewStudentDetails('${student.id}')">
                                            <i class="bi bi-eye"></i>
                                        </button>
                                        <button class="btn btn-outline-warning" onclick="app.editStudentUser('${student.id}')">
                                            <i class="bi bi-pencil"></i>
                                        </button>
                                        <button class="btn btn-outline-danger" onclick="app.deleteStudentUser('${student.id}')">
                                            <i class="bi bi-trash"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// МЕТОДЫ ДЛЯ УПРАВЛЕНИЯ СТУДЕНТАМИ
showAddStudentUserModal() {
    try {
        const modalHTML = `
            <div class="modal fade" id="addStudentUserModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Добавить студента</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="addStudentUserForm">
                                <div class="mb-3">
                                    <label for="newStudentName" class="form-label">ФИО студента *</label>
                                    <input type="text" class="form-control" id="newStudentName" required>
                                </div>
                                <div class="mb-3">
                                    <label for="newStudentGroup" class="form-label">Группа *</label>
                                    <select class="form-select" id="newStudentGroup" required>
                                        <option value="">Выберите группу</option>
                                        ${this.getExistingGroups().map(group => 
                                            `<option value="${group}">${group}</option>`
                                        ).join('')}
                                        <option value="new">+ Создать новую группу</option>
                                    </select>
                                </div>
                                <div class="mb-3" id="newStudentGroupField" style="display: none;">
                                    <label for="newStudentGroupName" class="form-label">Название новой группы</label>
                                    <input type="text" class="form-control" id="newStudentGroupName" placeholder="Например: ИТ-21">
                                </div>
                                <div class="mb-3">
                                    <label for="newStudentUsername" class="form-label">Логин для входа *</label>
                                    <input type="text" class="form-control" id="newStudentUsername" required>
                                    <div class="form-text">Логин должен быть уникальным</div>
                                </div>
                                <div class="mb-3">
                                    <label for="newStudentPassword" class="form-label">Пароль *</label>
                                    <input type="password" class="form-control" id="newStudentPassword" required minlength="6">
                                    <div class="form-text">Минимум 6 символов</div>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Отмена</button>
                            <button type="button" class="btn btn-success" onclick="app.addStudentUser()">
                                <i class="bi bi-person-plus me-1"></i>Добавить студента
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        const oldModal = document.getElementById('addStudentUserModal');
        if (oldModal) oldModal.remove();
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Обработчик для создания новой группы
        document.getElementById('newStudentGroup')?.addEventListener('change', function(e) {
            const newGroupField = document.getElementById('newStudentGroupField');
            if (e.target.value === 'new') {
                newGroupField.style.display = 'block';
            } else {
                newGroupField.style.display = 'none';
            }
        });
        
        const modal = new bootstrap.Modal(document.getElementById('addStudentUserModal'));
        modal.show();
        
    } catch (error) {
        console.error('Ошибка показа модального окна:', error);
        this.showAlert('Ошибка', 'Не удалось открыть форму добавления студента', 'danger');
    }
}

addStudentUser() {
    try {
        const name = document.getElementById('newStudentName')?.value.trim();
        const groupSelect = document.getElementById('newStudentGroup')?.value;
        const username = document.getElementById('newStudentUsername')?.value.trim();
        const password = document.getElementById('newStudentPassword')?.value;
        
        let group = '';
        if (groupSelect === 'new') {
            group = document.getElementById('newStudentGroupName')?.value.trim();
        } else {
            group = groupSelect;
        }
        
        if (!name || !group || !username || !password) {
            this.showAlert('Ошибка', 'Заполните все обязательные поля!', 'warning');
            return;
        }
        
        if (password.length < 6) {
            this.showAlert('Ошибка', 'Пароль должен содержать минимум 6 символов!', 'warning');
            return;
        }
        
        // Проверяем уникальность логина
        const existingUser = this.appData.users.find(u => u.username === username);
        if (existingUser) {
            this.showAlert('Ошибка', 'Пользователь с таким логином уже существует!', 'danger');
            return;
        }
        
        // Создаем запись студента
        const student = {
            id: this.generateId(),
            name: name,
            group: group,
            createdAt: new Date().toISOString()
        };
        
        // Создаем пользователя-студента
        const user = {
            id: this.generateId(),
            username: username,
            password: password,
            name: name,
            role: 'student',
            group: group,
            studentId: student.id,
            disabled: false,
            createdAt: new Date().toISOString(),
            createdBy: this.currentUser?.id
        };
        
        // Добавляем в данные
        this.appData.students.push(student);
        this.appData.users.push(user);
        
        // Создаем группу, если её нет
        if (!this.appData.groups) {
            this.appData.groups = [];
        }
        const existingGroup = this.appData.groups.find(g => g.name === group);
        if (!existingGroup) {
            this.appData.groups.push({
                id: this.generateId(),
                name: group,
                specialty: '',
                curatorId: null,
                createdAt: new Date().toISOString(),
                isActive: true
            });
        }
        
        if (this.saveData()) {
            const modal = bootstrap.Modal.getInstance(document.getElementById('addStudentUserModal'));
            if (modal) modal.hide();
            
            this.showAlert('Успех', `Студент ${name} добавлен в систему!`, 'success');
            this.loadStudentsManagementTab();
        }
        
    } catch (error) {
        console.error('Ошибка добавления студента:', error);
        this.showAlert('Ошибка', 'Не удалось добавить студента', 'danger');
    }
}

editStudentUser(studentId) {
    try {
        const student = this.appData.students.find(s => s.id === studentId);
        const user = this.appData.users.find(u => u.studentId === studentId);
        
        if (!student) {
            this.showAlert('Ошибка', 'Студент не найден!', 'danger');
            return;
        }
        
        const modalHTML = `
            <div class="modal fade" id="editStudentUserModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Редактировать студента</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="editStudentUserForm">
                                <div class="mb-3">
                                    <label for="editStudentName" class="form-label">ФИО студента *</label>
                                    <input type="text" class="form-control" id="editStudentName" 
                                           value="${student.name}" required>
                                </div>
                                <div class="mb-3">
                                    <label for="editStudentGroup" class="form-label">Группа *</label>
                                    <select class="form-select" id="editStudentGroup" required>
                                        <option value="">Выберите группу</option>
                                        ${this.getExistingGroups().map(group => 
                                            `<option value="${group}" ${student.group === group ? 'selected' : ''}>
                                                ${group}
                                            </option>`
                                        ).join('')}
                                    </select>
                                </div>
                                ${user ? `
                                    <div class="mb-3">
                                        <label for="editStudentUsername" class="form-label">Логин *</label>
                                        <input type="text" class="form-control" id="editStudentUsername" 
                                               value="${user.username}" required>
                                    </div>
                                    <div class="mb-3">
                                        <label for="editStudentPassword" class="form-label">Новый пароль</label>
                                        <input type="password" class="form-control" id="editStudentPassword" 
                                               placeholder="Оставьте пустым, чтобы не менять">
                                    </div>
                                    <div class="mb-3 form-check">
                                        <input type="checkbox" class="form-check-input" id="editStudentActive" ${!user.disabled ? 'checked' : ''}>
                                        <label class="form-check-label" for="editStudentActive">Аккаунт активен</label>
                                    </div>
                                ` : `
                                    <div class="alert alert-info">
                                        <i class="bi bi-info-circle me-2"></i>
                                        У этого студента нет аккаунта для входа в систему
                                    </div>
                                `}
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Отмена</button>
                            <button type="button" class="btn btn-warning" onclick="app.updateStudentUser('${studentId}')">
                                <i class="bi bi-check-lg me-1"></i>Сохранить
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        const oldModal = document.getElementById('editStudentUserModal');
        if (oldModal) oldModal.remove();
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        const modal = new bootstrap.Modal(document.getElementById('editStudentUserModal'));
        modal.show();
        
    } catch (error) {
        console.error('Ошибка показа формы редактирования:', error);
        this.showAlert('Ошибка', 'Не удалось открыть форму редактирования', 'danger');
    }
}

updateStudentUser(studentId) {
    try {
        const name = document.getElementById('editStudentName')?.value.trim();
        const group = document.getElementById('editStudentGroup')?.value;
        const username = document.getElementById('editStudentUsername')?.value.trim();
        const newPassword = document.getElementById('editStudentPassword')?.value;
        const isActive = document.getElementById('editStudentActive')?.checked;
        
        if (!name || !group) {
            this.showAlert('Ошибка', 'Заполните обязательные поля!', 'warning');
            return;
        }
        
        const student = this.appData.students.find(s => s.id === studentId);
        const user = this.appData.users.find(u => u.studentId === studentId);
        
        if (!student) {
            this.showAlert('Ошибка', 'Студент не найден!', 'danger');
            return;
        }
        
        // Обновляем студента
        student.name = name;
        student.group = group;
        
        // Обновляем пользователя, если он есть
        if (user) {
            if (username) user.username = username;
            if (newPassword && newPassword.length >= 6) user.password = newPassword;
            user.name = name;
            user.group = group;
            user.disabled = !isActive;
        }
        
        if (this.saveData()) {
            const modal = bootstrap.Modal.getInstance(document.getElementById('editStudentUserModal'));
            if (modal) modal.hide();
            
            this.showAlert('Успех', `Данные студента обновлены!`, 'success');
            this.loadStudentsManagementTab();
        }
        
    } catch (error) {
        console.error('Ошибка обновления студента:', error);
        this.showAlert('Ошибка', 'Не удалось обновить данные студента', 'danger');
    }
}

deleteStudentUser(studentId) {
    try {
        const student = this.appData.students.find(s => s.id === studentId);
        if (!student) {
            this.showAlert('Ошибка', 'Студент не найден!', 'danger');
            return;
        }
        
        if (confirm(`Вы уверены, что хотите удалить студента "${student.name}"? Все его оценки также будут удалены.`)) {
            // Удаляем студента
            this.appData.students = this.appData.students.filter(s => s.id !== studentId);
            
            // Удаляем пользователя-студента
            this.appData.users = this.appData.users.filter(u => u.studentId !== studentId);
            
            // Удаляем оценки студента
            this.appData.grades = this.appData.grades.filter(g => g.studentId !== studentId);
            
            if (this.saveData()) {
                this.showAlert('Удалено', `Студент "${student.name}" удален из системы`, 'info');
                this.loadStudentsManagementTab();
            }
        }
    } catch (error) {
        console.error('Ошибка удаления студента:', error);
        this.showAlert('Ошибка', 'Не удалось удалить студента', 'danger');
    }
}

createStudentAccount(studentId) {
    try {
        const student = this.appData.students.find(s => s.id === studentId);
        if (!student) {
            this.showAlert('Ошибка', 'Студент не найден!', 'danger');
            return;
        }

        // Проверяем, нет ли уже аккаунта
        const existingUser = this.appData.users.find(u => u.studentId === studentId);
        if (existingUser) {
            this.showAlert('Ошибка', 'У этого студента уже есть аккаунт!', 'warning');
            return;
        }

        const modalHTML = `
            <div class="modal fade" id="createStudentAccountModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Создать аккаунт для студента</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="createStudentAccountForm">
                                <div class="alert alert-info">
                                    <i class="bi bi-info-circle me-2"></i>
                                    Создаем аккаунт для: <strong>${student.name}</strong>
                                </div>
                                <div class="mb-3">
                                    <label for="studentAccountUsername" class="form-label">Логин *</label>
                                    <input type="text" class="form-control" id="studentAccountUsername" 
                                           value="${this.generateUsernameFromName(student.name)}" required>
                                    <div class="form-text">Логин должен быть уникальным</div>
                                </div>
                                <div class="mb-3">
                                    <label for="studentAccountPassword" class="form-label">Пароль *</label>
                                    <input type="password" class="form-control" id="studentAccountPassword" 
                                           value="123456" required minlength="6">
                                    <div class="form-text">Минимум 6 символов. Рекомендуем сменить при первом входе</div>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Отмена</button>
                            <button type="button" class="btn btn-success" onclick="app.saveStudentAccount('${studentId}')">
                                <i class="bi bi-person-check me-1"></i>Создать аккаунт
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        const oldModal = document.getElementById('createStudentAccountModal');
        if (oldModal) oldModal.remove();
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        const modal = new bootstrap.Modal(document.getElementById('createStudentAccountModal'));
        modal.show();
        
    } catch (error) {
        console.error('Ошибка создания аккаунта:', error);
        this.showAlert('Ошибка', 'Не удалось создать форму аккаунта', 'danger');
    }
}

saveStudentAccount(studentId) {
    try {
        const username = document.getElementById('studentAccountUsername')?.value.trim();
        const password = document.getElementById('studentAccountPassword')?.value;
        
        if (!username || !password) {
            this.showAlert('Ошибка', 'Заполните все поля!', 'warning');
            return;
        }
        
        if (password.length < 6) {
            this.showAlert('Ошибка', 'Пароль должен содержать минимум 6 символов!', 'warning');
            return;
        }
        
        const student = this.appData.students.find(s => s.id === studentId);
        if (!student) {
            this.showAlert('Ошибка', 'Студент не найден!', 'danger');
            return;
        }
        
        // Проверяем уникальность логина
        const existingUser = this.appData.users.find(u => u.username === username);
        if (existingUser) {
            this.showAlert('Ошибка', 'Пользователь с таким логином уже существует!', 'danger');
            return;
        }
        
        // Создаем пользователя-студента
        const user = {
            id: this.generateId(),
            username: username,
            password: password,
            name: student.name,
            role: 'student',
            group: student.group,
            studentId: student.id,
            disabled: false,
            createdAt: new Date().toISOString(),
            createdBy: this.currentUser?.id
        };
        
        this.appData.users.push(user);
        
        if (this.saveData()) {
            const modal = bootstrap.Modal.getInstance(document.getElementById('createStudentAccountModal'));
            if (modal) modal.hide();
            
            this.showAlert('Успех', `Аккаунт для студента ${student.name} создан!`, 'success');
            this.loadStudentsManagementTab();
        }
        
    } catch (error) {
        console.error('Ошибка сохранения аккаунта:', error);
        this.showAlert('Ошибка', 'Не удалось создать аккаунт', 'danger');
    }
}

toggleStudentAccount(userId) {
    try {
        const user = this.appData.users.find(u => u.id === userId);
        if (!user) {
            this.showAlert('Ошибка', 'Пользователь не найден!', 'danger');
            return;
        }
        
        const action = user.disabled ? 'активировать' : 'деактивировать';
        const student = this.appData.students.find(s => s.id === user.studentId);
        
        if (confirm(`Вы уверены, что хотите ${action} аккаунт студента ${student?.name || user.name}?`)) {
            user.disabled = !user.disabled;
            user.updatedAt = new Date().toISOString();
            user.updatedBy = this.currentUser?.id;
            
            if (this.saveData()) {
                this.showAlert('Успех', `Аккаунт ${user.disabled ? 'деактивирован' : 'активирован'}`, 'success');
                this.loadStudentsManagementTab();
            }
        }
    } catch (error) {
        console.error('Ошибка изменения статуса аккаунта:', error);
        this.showAlert('Ошибка', 'Не удалось изменить статус аккаунта', 'danger');
    }
}

// Вспомогательный метод для генерации логина из ФИО
generateUsernameFromName(name) {
    // Преобразуем "Иванов Иван Иванович" в "ivanov.i"
    const parts = name.toLowerCase().split(' ');
    if (parts.length >= 2) {
        return `${parts[0]}.${parts[1][0]}`;
    }
    return name.toLowerCase().replace(/\s+/g, '.');
}

// ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ
getStudentsWithoutGrades() {
    return this.appData.students.filter(student => {
        const studentGrades = this.appData.grades.filter(g => g.studentId === student.id);
        return studentGrades.length === 0;
    });
}

getStudentStatus(averageGrade, totalGrades) {
    const avg = parseFloat(averageGrade);
    
    if (totalGrades === 0) {
        return '<span class="badge bg-secondary">Нет оценок</span>';
    } else if (avg >= 4.5) {
        return '<span class="badge bg-success">Отличник</span>';
    } else if (avg >= 4.0) {
        return '<span class="badge bg-info">Хорошист</span>';
    } else if (avg >= 3.0) {
        return '<span class="badge bg-warning">Успевающий</span>';
    } else {
        return '<span class="badge bg-danger">Неуспевающий</span>';
    }
}

getGradeBadgeClass(averageGrade) {
    const avg = parseFloat(averageGrade);
    if (avg >= 4.5) return 'bg-success';
    if (avg >= 4.0) return 'bg-info';
    if (avg >= 3.0) return 'bg-warning';
    return 'bg-danger';
}

// ФИЛЬТРАЦИЯ И ПОИСК
filterStudents() {
    try {
        const groupFilter = document.getElementById('studentGroupFilter')?.value;
        const statusFilter = document.getElementById('studentStatusFilter')?.value;
        const accountFilter = document.getElementById('studentAccountFilter')?.value;
        const searchQuery = document.getElementById('studentSearch')?.value.toLowerCase();
        
        let filteredStudents = this.appData.students;
        
        // Фильтр по группе
        if (groupFilter && groupFilter !== 'all') {
            filteredStudents = filteredStudents.filter(s => s.group === groupFilter);
        }
        
        // Фильтр по успеваемости
        if (statusFilter && statusFilter !== 'all') {
            filteredStudents = filteredStudents.filter(student => {
                const stats = this.getStudentStatistics(student.id);
                const avg = parseFloat(stats.averageGrade);
                
                switch (statusFilter) {
                    case 'with-grades':
                        return stats.totalGrades > 0;
                    case 'without-grades':
                        return stats.totalGrades === 0;
                    case 'excellent':
                        return avg >= 4.5 && stats.totalGrades > 0;
                    case 'good':
                        return avg >= 4.0 && avg < 4.5 && stats.totalGrades > 0;
                    case 'satisfactory':
                        return avg >= 3.0 && avg < 4.0 && stats.totalGrades > 0;
                    case 'unsatisfactory':
                        return avg < 3.0 && stats.totalGrades > 0;
                    default:
                        return true;
                }
            });
        }
        
        // Фильтр по аккаунту
        if (accountFilter && accountFilter !== 'all') {
            filteredStudents = filteredStudents.filter(student => {
                const user = this.appData.users.find(u => u.studentId === student.id);
                
                switch (accountFilter) {
                    case 'with-account':
                        return !!user;
                    case 'without-account':
                        return !user;
                    case 'active':
                        return user && !user.disabled;
                    case 'disabled':
                        return user && user.disabled;
                    default:
                        return true;
                }
            });
        }
        
        // Поиск по ФИО
        if (searchQuery) {
            filteredStudents = filteredStudents.filter(s => 
                s.name.toLowerCase().includes(searchQuery)
            );
        }
        
        // Обновляем отображение
        const container = document.getElementById('studentsListContainer');
        if (container) {
            container.innerHTML = this.renderStudentsManagementList(filteredStudents);
        } else {
            console.error('Контейнер studentsListContainer не найден');
            return;
        }
        
        // Обновляем счетчик
        this.updateStudentsCounter(filteredStudents.length);
        
    } catch (error) {
        console.error('Ошибка фильтрации студентов:', error);
        this.showAlert('Ошибка', 'Не удалось применить фильтры', 'danger');
    }
}

renderStudentsManagementList(students) {
    if (students.length === 0) {
        return `
            <div class="text-center py-5">
                <i class="bi bi-search display-1 text-muted"></i>
                <h4 class="text-muted mt-3">Студенты не найдены</h4>
                <p class="text-muted">Попробуйте изменить параметры фильтрации</p>
                <button class="btn btn-outline-secondary mt-3" onclick="app.clearStudentFilters()">
                    <i class="bi bi-arrow-clockwise me-1"></i>Сбросить фильтры
                </button>
            </div>
        `;
    }

    return `
        <div class="table-responsive">
            <table class="table table-hover">
                <thead>
                    <tr>
                        <th>ФИО студента</th>
                        <th>Группа</th>
                        <th>Аккаунт</th>
                        <th>Оценки</th>
                        <th>Средний балл</th>
                        <th>Статус</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
                    ${students.map(student => {
                        const user = this.appData.users.find(u => u.studentId === student.id);
                        const stats = this.getStudentStatistics(student.id);
                        const status = this.getStudentStatus(stats.averageGrade, stats.totalGrades);
                        
                        return `
                            <tr>
                                <td>
                                    <div class="d-flex align-items-center">
                                        <i class="bi bi-person-circle me-3 fs-4 text-primary"></i>
                                        <div>
                                            <strong>${student.name}</strong>
                                            ${user && user.disabled ? '<br><small class="text-danger">Аккаунт отключен</small>' : ''}
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <span class="badge bg-info">${student.group}</span>
                                </td>
                                <td>
                                    ${user ? 
                                        `<span class="badge ${user.disabled ? 'bg-secondary' : 'bg-success'}">
                                            ${user.disabled ? 'Отключен' : 'Активен'}
                                        </span>
                                        <br><small class="text-muted">${user.username}</small>` 
                                        : 
                                        `<span class="badge bg-warning">Нет аккаунта</span>`
                                    }
                                </td>
                                <td>
                                    <span class="badge ${stats.totalGrades > 0 ? 'bg-primary' : 'bg-secondary'}">
                                        ${stats.totalGrades}
                                    </span>
                                </td>
                                <td>
                                    <span class="badge ${this.getGradeBadgeClass(stats.averageGrade)}">
                                        ${stats.averageGrade}
                                    </span>
                                </td>
                                <td>
                                    ${status}
                                </td>
                                <td>
                                    <div class="btn-group btn-group-sm">
                                        <button class="btn btn-outline-primary" onclick="app.viewStudentDetails('${student.id}')">
                                            <i class="bi bi-eye"></i>
                                        </button>
                                        <button class="btn btn-outline-warning" onclick="app.editStudentUser('${student.id}')">
                                            <i class="bi bi-pencil"></i>
                                        </button>
                                        ${user ? `
                                            <button class="btn btn-outline-${user.disabled ? 'success' : 'secondary'}" 
                                                    onclick="app.toggleStudentAccount('${user.id}')"
                                                    title="${user.disabled ? 'Активировать' : 'Деактивировать'}">
                                                <i class="bi bi-${user.disabled ? 'check' : 'pause'}"></i>
                                            </button>
                                        ` : `
                                            <button class="btn btn-outline-success" 
                                                    onclick="app.createStudentAccount('${student.id}')"
                                                    title="Создать аккаунт">
                                                <i class="bi bi-person-plus"></i>
                                            </button>
                                        `}
                                        <button class="btn btn-outline-danger" onclick="app.deleteStudentUser('${student.id}')">
                                            <i class="bi bi-trash"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;
}

updateStudentsCounter(count) {
    const badge = document.getElementById('studentsCountBadge');
    if (badge) {
        badge.textContent = count;
        badge.className = `badge ${count > 0 ? 'bg-primary' : 'bg-secondary'} ms-2`;
    }
}

clearStudentFilters() {
    try {
        document.getElementById('studentGroupFilter').value = 'all';
        document.getElementById('studentStatusFilter').value = 'all';
        document.getElementById('studentAccountFilter').value = 'all';
        document.getElementById('studentSearch').value = '';
        
        // Применяем сброшенные фильтры
        this.filterStudents();
        
        this.showAlert('Информация', 'Фильтры сброшены', 'info');
    } catch (error) {
        console.error('Ошибка сброса фильтров:', error);
    }
}

exportStudentsList() {
    try {
        const modalHTML = `
            <div class="modal fade" id="exportStudentsModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Экспорт списка студентов</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="exportStudentsForm">
                                <div class="mb-3">
                                    <label for="exportFormat" class="form-label">Формат экспорта</label>
                                    <select class="form-select" id="exportFormat">
                                        <option value="csv">CSV (Excel)</option>
                                        <option value="pdf">PDF документ</option>
                                        <option value="json">JSON данные</option>
                                    </select>
                                </div>
                                <div class="mb-3">
                                    <label for="exportColumns" class="form-label">Включаемые данные</label>
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" id="exportName" checked>
                                        <label class="form-check-label" for="exportName">ФИО студента</label>
                                    </div>
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" id="exportGroup" checked>
                                        <label class="form-check-label" for="exportGroup">Группа</label>
                                    </div>
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" id="exportGrades" checked>
                                        <label class="form-check-label" for="exportGrades">Оценки и средний балл</label>
                                    </div>
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" id="exportAccount">
                                        <label class="form-check-label" for="exportAccount">Данные аккаунта</label>
                                    </div>
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" id="exportStatus" checked>
                                        <label class="form-check-label" for="exportStatus">Статус успеваемости</label>
                                    </div>
                                </div>
                                <div class="mb-3">
                                    <label for="exportFilter" class="form-label">Применить текущие фильтры</label>
                                    <select class="form-select" id="exportFilter">
                                        <option value="current">Текущий отфильтрованный список</option>
                                        <option value="all">Все студенты</option>
                                    </select>
                                </div>
                                <div class="alert alert-info">
                                    <i class="bi bi-info-circle me-2"></i>
                                    Будет экспортировано: <span id="exportCount">0</span> студентов
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Отмена</button>
                            <button type="button" class="btn btn-success" onclick="app.generateExport()">
                                <i class="bi bi-download me-1"></i>Экспортировать
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('exportFilter')?.addEventListener('change', () => {
            this.updateExportCount();
        });
        
        const oldModal = document.getElementById('exportStudentsModal');
        if (oldModal) oldModal.remove();
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Обновляем счетчик
        this.updateExportCount();
        
        const modal = new bootstrap.Modal(document.getElementById('exportStudentsModal'));
        modal.show();
        
    } catch (error) {
        console.error('Ошибка показа формы экспорта:', error);
        this.showAlert('Ошибка', 'Не удалось открыть форму экспорта', 'danger');
    }
}

updateExportCount() {
    try {
        const exportFilter = document.getElementById('exportFilter')?.value;
        let count = 0;
        
        if (exportFilter === 'current') {
            // Считаем отфильтрованных студентов (нужно получить текущий список)
            const container = document.getElementById('studentsListContainer');
            if (container) {
                const rows = container.querySelectorAll('tbody tr');
                count = rows.length;
            }
        } else {
            count = this.appData.students.length;
        }
        
        const exportCount = document.getElementById('exportCount');
        if (exportCount) {
            exportCount.textContent = count;
        }
    } catch (error) {
        console.error('Ошибка обновления счетчика экспорта:', error);
    }
}

generateExport() {
    try {
        const format = document.getElementById('exportFormat')?.value;
        const exportFilter = document.getElementById('exportFilter')?.value;
        
        // Получаем данные для экспорта
        let studentsToExport = [];
        
        if (exportFilter === 'current') {
            // Получаем текущий отфильтрованный список
            studentsToExport = this.getCurrentFilteredStudents();
        } else {
            studentsToExport = this.appData.students;
        }
        
        if (studentsToExport.length === 0) {
            this.showAlert('Ошибка', 'Нет данных для экспорта', 'warning');
            return;
        }
        
        // Получаем выбранные колонки
        const includeName = document.getElementById('exportName')?.checked;
        const includeGroup = document.getElementById('exportGroup')?.checked;
        const includeGrades = document.getElementById('exportGrades')?.checked;
        const includeAccount = document.getElementById('exportAccount')?.checked;
        const includeStatus = document.getElementById('exportStatus')?.checked;
        
        // Генерируем данные в выбранном формате
        switch (format) {
            case 'csv':
                this.exportToCSV(studentsToExport, { includeName, includeGroup, includeGrades, includeAccount, includeStatus });
                break;
            case 'pdf':
                this.exportToPDF(studentsToExport, { includeName, includeGroup, includeGrades, includeAccount, includeStatus });
                break;
            case 'json':
                this.exportToJSON(studentsToExport, { includeName, includeGroup, includeGrades, includeAccount, includeStatus });
                break;
            default:
                this.showAlert('Ошибка', 'Неизвестный формат экспорта', 'danger');
                return;
        }
        
        // Закрываем модальное окно
        const modal = bootstrap.Modal.getInstance(document.getElementById('exportStudentsModal'));
        if (modal) modal.hide();
        
        this.showAlert('Успех', `Экспортировано ${studentsToExport.length} студентов в формате ${format.toUpperCase()}`, 'success');
        
    } catch (error) {
        console.error('Ошибка экспорта:', error);
        this.showAlert('Ошибка', 'Не удалось выполнить экспорт', 'danger');
    }
}

// Вспомогательный метод для получения текущего отфильтрованного списка
getCurrentFilteredStudents() {
    const container = document.getElementById('studentsListContainer');
    if (!container) return this.appData.students;
    
    // Получаем имена студентов из текущего отображения
    const studentNames = Array.from(container.querySelectorAll('tbody tr strong'))
        .map(el => el.textContent.trim());
    
    return this.appData.students.filter(student => 
        studentNames.includes(student.name)
    );
}

// ЭКСПОРТ В CSV (EXCEL)
exportToCSV(students, options) {
    const headers = [];
    const data = [];
    
    // Формируем заголовки
    if (options.includeName) headers.push('ФИО студента');
    if (options.includeGroup) headers.push('Группа');
    if (options.includeGrades) {
        headers.push('Количество оценок');
        headers.push('Средний балл');
    }
    if (options.includeAccount) {
        headers.push('Логин');
        headers.push('Статус аккаунта');
    }
    if (options.includeStatus) headers.push('Статус успеваемости');
    
    // Формируем данные
    students.forEach(student => {
        const user = this.appData.users.find(u => u.studentId === student.id);
        const stats = this.getStudentStatistics(student.id);
        const status = this.getStudentStatusText(stats.averageGrade, stats.totalGrades);
        
        const row = [];
        if (options.includeName) row.push(this.escapeCSV(student.name));
        if (options.includeGroup) row.push(this.escapeCSV(student.group));
        if (options.includeGrades) {
            row.push(stats.totalGrades);
            row.push(stats.averageGrade.replace('.', ',')); // Замена точки на запятую для Excel
        }
        if (options.includeAccount) {
            row.push(user ? this.escapeCSV(user.username) : 'Нет аккаунта');
            row.push(user ? (user.disabled ? 'Отключен' : 'Активен') : 'Нет аккаунта');
        }
        if (options.includeStatus) row.push(this.escapeCSV(status));
        
        data.push(row);
    });
    
    // Создаем CSV содержимое с BOM для правильной кодировки
    const csvContent = [
        '\uFEFF' + headers.join(';'), // BOM + заголовки с разделителем ;
        ...data.map(row => row.join(';')) // данные с разделителем ;
    ].join('\r\n'); // Windows line endings
    
    // Создаем и скачиваем файл
    this.downloadFile(csvContent, `students_${this.getCurrentDate()}.csv`, 'text/csv; charset=utf-8');
}

// ДОБАВИМ МЕТОД ДЛЯ ЭКРАНИРОВАНИЯ CSV
escapeCSV(str) {
    if (str === null || str === undefined) return '';
    
    // Экранируем кавычки и добавляем кавычки если есть запятые, точки с запятой или кавычки
    const string = String(str);
    if (string.includes(';') || string.includes('"') || string.includes('\n') || string.includes(',')) {
        return '"' + string.replace(/"/g, '""') + '"';
    }
    return string;
}

// ЭКСПОРТ В PDF
exportToPDF(students, options) {
    // Создаем HTML для PDF
    let htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Список студентов</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
                .title { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
                .subtitle { color: #666; margin-bottom: 5px; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                th { background-color: #f5f5f5; font-weight: bold; }
                .badge { padding: 3px 8px; border-radius: 4px; font-size: 12px; }
                .badge-success { background-color: #d4edda; color: #155724; }
                .badge-warning { background-color: #fff3cd; color: #856404; }
                .badge-danger { background-color: #f8d7da; color: #721c24; }
                .badge-info { background-color: #d1ecf1; color: #0c5460; }
                .footer { margin-top: 30px; text-align: center; color: #666; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="title">Список студентов</div>
                <div class="subtitle">Техникум информационных технологий</div>
                <div class="subtitle">Дата формирования: ${new Date().toLocaleDateString('ru-RU')}</div>
                <div class="subtitle">Всего студентов: ${students.length}</div>
            </div>
            <table>
                <thead>
                    <tr>
    `;
    
    // Заголовки таблицы
    if (options.includeName) htmlContent += '<th>ФИО студента</th>';
    if (options.includeGroup) htmlContent += '<th>Группа</th>';
    if (options.includeGrades) {
        htmlContent += '<th>Оценки</th><th>Средний балл</th>';
    }
    if (options.includeAccount) {
        htmlContent += '<th>Аккаунт</th>';
    }
    if (options.includeStatus) htmlContent += '<th>Статус</th>';
    
    htmlContent += `
                    </tr>
                </thead>
                <tbody>
    `;
    
    // Данные таблицы
    students.forEach(student => {
        const user = this.appData.users.find(u => u.studentId === student.id);
        const stats = this.getStudentStatistics(student.id);
        const status = this.getStudentStatusText(stats.averageGrade, stats.totalGrades);
        const statusClass = this.getStudentStatusClass(stats.averageGrade, stats.totalGrades);
        
        htmlContent += '<tr>';
        if (options.includeName) htmlContent += `<td>${student.name}</td>`;
        if (options.includeGroup) htmlContent += `<td>${student.group}</td>`;
        if (options.includeGrades) {
            htmlContent += `<td>${stats.totalGrades}</td>`;
            htmlContent += `<td>${stats.averageGrade}</td>`;
        }
        if (options.includeAccount) {
            const accountStatus = user ? (user.disabled ? 'Отключен' : 'Активен') : 'Нет аккаунта';
            htmlContent += `<td>${accountStatus}</td>`;
        }
        if (options.includeStatus) {
            htmlContent += `<td><span class="badge ${statusClass}">${status}</span></td>`;
        }
        htmlContent += '</tr>';
    });
    
    htmlContent += `
                </tbody>
            </table>
            <div class="footer">
                Сформировано в электронной зачётке • ${new Date().toLocaleString('ru-RU')}
            </div>
        </body>
        </html>
    `;
    
    // Открываем в новом окне для печати/сохранения как PDF
    const printWindow = window.open('', '_blank');
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
}

// ЭКСПОРТ В JSON
exportToJSON(students, options) {
    const exportData = students.map(student => {
        const user = this.appData.users.find(u => u.studentId === student.id);
        const stats = this.getStudentStatistics(student.id);
        const status = this.getStudentStatusText(stats.averageGrade, stats.totalGrades);
        
        const studentData = {};
        
        if (options.includeName) studentData.name = student.name;
        if (options.includeGroup) studentData.group = student.group;
        if (options.includeGrades) {
            studentData.gradesCount = stats.totalGrades;
            studentData.averageGrade = parseFloat(stats.averageGrade);
        }
        if (options.includeAccount) {
            studentData.account = user ? {
                username: user.username,
                status: user.disabled ? 'disabled' : 'active'
            } : null;
        }
        if (options.includeStatus) studentData.academicStatus = status;
        
        return studentData;
    });
    
    const jsonContent = JSON.stringify(exportData, null, 2);
    this.downloadFile(jsonContent, `students_${this.getCurrentDate()}.json`, 'application/json');
}

// ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ
downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

getCurrentDate() {
    return new Date().toISOString().split('T')[0];
}

getStudentStatusText(averageGrade, totalGrades) {
    const avg = parseFloat(averageGrade);
    if (totalGrades === 0) return 'Нет оценок';
    if (avg >= 4.5) return 'Отличник';
    if (avg >= 4.0) return 'Хорошист';
    if (avg >= 3.0) return 'Успевающий';
    return 'Неуспевающий';
}

getStudentStatusClass(averageGrade, totalGrades) {
    const avg = parseFloat(averageGrade);
    if (totalGrades === 0) return 'badge-info';
    if (avg >= 4.5) return 'badge-success';
    if (avg >= 4.0) return 'badge-success';
    if (avg >= 3.0) return 'badge-warning';
    return 'badge-danger';
}

// СИСТЕМА УПРАВЛЕНИЯ ПРЕПОДАВАТЕЛЯМИ
loadTeachersManagementTab() {
    try {
        // Проверяем права доступа
        if (this.currentUser.role !== 'admin') {
            document.getElementById('teachers-managementTab').innerHTML = this.getAccessDeniedMessage();
            return;
        }

        const container = document.getElementById('teachers-managementTab');
        const teachers = this.appData.users.filter(u => u.role === 'teacher');
        
        console.log('Загружаем вкладку преподавателей, всего:', teachers.length);
        
        container.innerHTML = `
            <div class="row">
                <div class="col-12">
                    <div class="d-flex justify-content-between align-items-center mb-4">
                        <h2 class="h3 mb-0">
                            <i class="bi bi-person-badge me-2 text-primary"></i>Управление преподавателями
                        </h2>
                        <button class="btn btn-primary" onclick="app.showAddTeacherModal()">
                            <i class="bi bi-person-plus me-1"></i>Добавить преподавателя
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- Статистика преподавателей -->
            <div class="row mb-4">
                <div class="col-md-3">
                    <div class="card border-start border-primary border-4">
                        <div class="card-body">
                            <div class="d-flex align-items-center">
                                <div class="flex-grow-1">
                                    <div class="text-muted small">Всего преподавателей</div>
                                    <div class="h4 mb-0">${teachers.length}</div>
                                </div>
                                <i class="bi bi-people fs-1 text-primary"></i>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card border-start border-info border-4">
                        <div class="card-body">
                            <div class="d-flex align-items-center">
                                <div class="flex-grow-1">
                                    <div class="text-muted small">Активных</div>
                                    <div class="h4 mb-0">${teachers.filter(t => !t.disabled).length}</div>
                                </div>
                                <i class="bi bi-person-check fs-1 text-info"></i>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card border-start border-success border-4">
                        <div class="card-body">
                            <div class="d-flex align-items-center">
                                <div class="flex-grow-1">
                                    <div class="text-muted small">Ведут предметы</div>
                                    <div class="h4 mb-0">${new Set(teachers.flatMap(t => t.subjects || [])).size}</div>
                                </div>
                                <i class="bi bi-book fs-1 text-success"></i>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card border-start border-warning border-4">
                        <div class="card-body">
                            <div class="d-flex align-items-center">
                                <div class="flex-grow-1">
                                    <div class="text-muted small">Кураторы групп</div>
                                    <div class="h4 mb-0">${this.getTeachersWithGroupsCount()}</div>
                                </div>
                                <i class="bi bi-people-fill fs-1 text-warning"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Фильтры и поиск -->
            <div class="row mb-4">
                <div class="col-md-4">
                    <label for="teacherStatusFilter" class="form-label small text-muted">Статус</label>
                    <select class="form-select" id="teacherStatusFilter" onchange="app.filterTeachers()">
                        <option value="all">Все преподаватели</option>
                        <option value="active">Активные</option>
                        <option value="disabled">Отключенные</option>
                    </select>
                </div>
                <div class="col-md-4">
                    <label for="teacherSubjectFilter" class="form-label small text-muted">Предмет</label>
                    <select class="form-select" id="teacherSubjectFilter" onchange="app.filterTeachers()">
                        <option value="all">Все предметы</option>
                        ${this.getAllTeacherSubjects().map(subject => 
                            `<option value="${subject}">${subject}</option>`
                        ).join('')}
                    </select>
                </div>
                <div class="col-md-4">
                    <label for="teacherSearch" class="form-label small text-muted">Поиск</label>
                    <div class="input-group">
                        <input type="text" class="form-control" id="teacherSearch" 
                               placeholder="ФИО преподавателя..." onkeyup="app.filterTeachers()">
                        <button class="btn btn-outline-secondary" type="button" onclick="app.clearTeacherFilters()">
                            <i class="bi bi-x-circle"></i>
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- Список преподавателей -->
            <div class="row">
                <div class="col-12">
                    <div class="card shadow">
                        <div class="card-header">
                            <div class="d-flex justify-content-between align-items-center">
                                <h5 class="card-title mb-0">
                                    <i class="bi bi-list-ul me-2"></i>Список преподавателей
                                    <span id="teachersCountBadge" class="badge bg-primary ms-2">${teachers.length}</span>
                                </h5>
                                <div class="btn-group">
                                    <button class="btn btn-sm btn-outline-secondary" onclick="app.exportTeachersList()">
                                        <i class="bi bi-download me-1"></i>Экспорт
                                    </button>
                                    <button class="btn btn-sm btn-outline-secondary" onclick="app.clearTeacherFilters()">
                                        <i class="bi bi-arrow-clockwise me-1"></i>Сбросить
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div class="card-body">
                            <div id="teachersListContainer">
                                ${this.renderTeachersManagementList(teachers)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Ошибка загрузки вкладки управления преподавателями:', error);
        this.showAlert('Ошибка', 'Не удалось загрузить раздел преподавателей', 'danger');
    }
}

// ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ ДЛЯ ПРЕПОДАВАТЕЛЕЙ
getTeachersWithGroupsCount() {
    const teachers = this.appData.users.filter(u => u.role === 'teacher');
    return teachers.filter(teacher => teacher.groups && teacher.groups.length > 0).length;
}

getAllTeacherSubjects() {
    const teachers = this.appData.users.filter(u => u.role === 'teacher');
    const allSubjects = teachers.flatMap(teacher => teacher.subjects || []);
    return [...new Set(allSubjects)].filter(s => s).sort();
}

getTeacherStatistics(teacherId) {
    const teacher = this.appData.users.find(u => u.id === teacherId);
    if (!teacher) return { subjectsCount: 0, groupsCount: 0, studentsCount: 0 };
    
    const subjectsCount = teacher.subjects ? teacher.subjects.length : 0;
    const groupsCount = teacher.groups ? teacher.groups.length : 0;
    
    // Считаем студентов у преподавателя (через предметы и группы)
    let studentsCount = 0;
    if (teacher.subjects) {
        teacher.subjects.forEach(subjectName => {
            const subject = this.appData.subjects.find(s => s.name === subjectName);
            if (subject) {
                const subjectGrades = this.appData.grades.filter(g => g.subjectId === subject.id);
                studentsCount += new Set(subjectGrades.map(g => g.studentId)).size;
            }
        });
    }
    
    return {
        subjectsCount,
        groupsCount,
        studentsCount
    };
}

renderTeachersManagementList(teachers) {
    if (teachers.length === 0) {
        return `
            <div class="text-center py-5">
                <i class="bi bi-person-x display-1 text-muted"></i>
                <h4 class="text-muted mt-3">Преподаватели не найдены</h4>
                <p class="text-muted">Добавьте первого преподавателя в систему</p>
                <button class="btn btn-primary mt-3" onclick="app.showAddTeacherModal()">
                    <i class="bi bi-person-plus me-1"></i>Добавить преподавателя
                </button>
            </div>
        `;
    }

    return `
        <div class="table-responsive">
            <table class="table table-hover">
                <thead>
                    <tr>
                        <th>ФИО преподавателя</th>
                        <th>Предметы</th>
                        <th>Группы (куратор)</th>
                        <th>Логин</th>
                        <th>Статистика</th>
                        <th>Статус</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
                    ${teachers.map(teacher => {
                        const stats = this.getTeacherStatistics(teacher.id);
                        const subjectsList = teacher.subjects ? teacher.subjects.slice(0, 3).join(', ') : '';
                        const groupsList = teacher.groups ? teacher.groups.slice(0, 2).join(', ') : '';
                        
                        return `
                            <tr class="${teacher.disabled ? 'table-secondary' : ''}">
                                <td>
                                    <div class="d-flex align-items-center">
                                        <i class="bi bi-person-badge me-3 fs-4 text-primary"></i>
                                        <div>
                                            <strong>${teacher.name}</strong>
                                            ${teacher.disabled ? '<br><small class="text-danger">Аккаунт отключен</small>' : ''}
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    ${subjectsList || '<span class="text-muted">Не назначены</span>'}
                                    ${teacher.subjects && teacher.subjects.length > 3 ? 
                                        `<br><small class="text-primary">+${teacher.subjects.length - 3} еще</small>` : ''}
                                </td>
                                <td>
                                    ${groupsList || '<span class="text-muted">Не назначен</span>'}
                                    ${teacher.groups && teacher.groups.length > 2 ? 
                                        `<br><small class="text-primary">+${teacher.groups.length - 2} еще</small>` : ''}
                                </td>
                                <td>
                                    <small class="text-muted">${teacher.username}</small>
                                </td>
                                <td>
                                    <div class="small">
                                        <div>Предметы: <span class="badge bg-info">${stats.subjectsCount}</span></div>
                                        <div>Группы: <span class="badge bg-warning">${stats.groupsCount}</span></div>
                                        <div>Студенты: <span class="badge bg-success">${stats.studentsCount}</span></div>
                                    </div>
                                </td>
                                <td>
                                    <span class="badge ${teacher.disabled ? 'bg-secondary' : 'bg-success'}">
                                        ${teacher.disabled ? 'Отключен' : 'Активен'}
                                    </span>
                                </td>
                                <td>
                                    <div class="btn-group btn-group-sm">
                                        <button class="btn btn-outline-primary" onclick="app.viewTeacherDetails('${teacher.id}')">
                                            <i class="bi bi-eye"></i>
                                        </button>
                                        <button class="btn btn-outline-warning" onclick="app.editTeacher('${teacher.id}')">
                                            <i class="bi bi-pencil"></i>
                                        </button>
                                        <button class="btn btn-outline-${teacher.disabled ? 'success' : 'secondary'}" 
                                                onclick="app.toggleTeacherAccount('${teacher.id}')"
                                                title="${teacher.disabled ? 'Активировать' : 'Деактивировать'}">
                                            <i class="bi bi-${teacher.disabled ? 'check' : 'pause'}"></i>
                                        </button>
                                        <button class="btn btn-outline-danger" onclick="app.deleteTeacher('${teacher.id}')">
                                            <i class="bi bi-trash"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// МЕТОДЫ ДЛЯ УПРАВЛЕНИЯ ПРЕПОДАВАТЕЛЯМИ
showAddTeacherModal() {
    try {
        const modalHTML = `
            <div class="modal fade" id="addTeacherModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Добавить преподавателя</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="addTeacherForm">
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label for="teacherName" class="form-label">ФИО преподавателя *</label>
                                            <input type="text" class="form-control" id="teacherName" required>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label for="teacherUsername" class="form-label">Логин *</label>
                                            <input type="text" class="form-control" id="teacherUsername" required>
                                            <div class="form-text">Логин должен быть уникальным</div>
                                        </div>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label for="teacherPassword" class="form-label">Пароль *</label>
                                            <input type="password" class="form-control" id="teacherPassword" required minlength="6">
                                            <div class="form-text">Минимум 6 символов</div>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label for="teacherEmail" class="form-label">Email (необязательно)</label>
                                            <input type="email" class="form-control" id="teacherEmail">
                                        </div>
                                    </div>
                                </div>
                                <div class="mb-3">
                                    <label for="teacherSubjects" class="form-label">Предметы</label>
                                    <select class="form-select" id="teacherSubjects" multiple>
                                        ${this.appData.subjects.map(subject => 
                                            `<option value="${subject.name}">${subject.name}</option>`
                                        ).join('')}
                                    </select>
                                    <div class="form-text">Удерживайте Ctrl для выбора нескольких предметов</div>
                                </div>
                                <div class="mb-3">
                                    <label for="teacherGroups" class="form-label">Группы (кураторство)</label>
                                    <select class="form-select" id="teacherGroups" multiple>
                                        ${this.getExistingGroups().map(group => 
                                            `<option value="${group}">${group}</option>`
                                        ).join('')}
                                    </select>
                                    <div class="form-text">Удерживайте Ctrl для выбора нескольких групп</div>
                                </div>
                                <div class="mb-3 form-check">
                                    <input type="checkbox" class="form-check-input" id="teacherActive" checked>
                                    <label class="form-check-label" for="teacherActive">Активный преподаватель</label>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Отмена</button>
                            <button type="button" class="btn btn-primary" onclick="app.addTeacher()">
                                <i class="bi bi-person-plus me-1"></i>Добавить преподавателя
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        const oldModal = document.getElementById('addTeacherModal');
        if (oldModal) oldModal.remove();
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        const modal = new bootstrap.Modal(document.getElementById('addTeacherModal'));
        modal.show();
        
    } catch (error) {
        console.error('Ошибка показа модального окна:', error);
        this.showAlert('Ошибка', 'Не удалось открыть форму добавления преподавателя', 'danger');
    }
}

addTeacher() {
    try {
        const name = document.getElementById('teacherName')?.value.trim();
        const username = document.getElementById('teacherUsername')?.value.trim();
        const password = document.getElementById('teacherPassword')?.value;
        const email = document.getElementById('teacherEmail')?.value.trim();
        const subjectsSelect = document.getElementById('teacherSubjects');
        const groupsSelect = document.getElementById('teacherGroups');
        const active = document.getElementById('teacherActive')?.checked;
        
        if (!name || !username || !password) {
            this.showAlert('Ошибка', 'Заполните обязательные поля!', 'warning');
            return;
        }
        
        if (password.length < 6) {
            this.showAlert('Ошибка', 'Пароль должен содержать минимум 6 символов!', 'warning');
            return;
        }
        
        // Проверяем уникальность логина
        const existingUser = this.appData.users.find(u => u.username === username);
        if (existingUser) {
            this.showAlert('Ошибка', 'Пользователь с таким логином уже существует!', 'danger');
            return;
        }
        
        // Получаем выбранные предметы и группы
        const subjects = subjectsSelect ? Array.from(subjectsSelect.selectedOptions).map(option => option.value) : [];
        const groups = groupsSelect ? Array.from(groupsSelect.selectedOptions).map(option => option.value) : [];
        
        // Создаем преподавателя
        const teacher = {
            id: this.generateId(),
            username: username,
            password: password,
            name: name,
            email: email || '',
            role: 'teacher',
            subjects: subjects,
            groups: groups,
            disabled: !active,
            createdAt: new Date().toISOString(),
            createdBy: this.currentUser?.id
        };
        
        this.appData.users.push(teacher);
        
        if (this.saveData()) {
            const modal = bootstrap.Modal.getInstance(document.getElementById('addTeacherModal'));
            if (modal) modal.hide();
            
            this.showAlert('Успех', `Преподаватель ${name} добавлен в систему!`, 'success');
            this.loadTeachersManagementTab();
        }
        
    } catch (error) {
        console.error('Ошибка добавления преподавателя:', error);
        this.showAlert('Ошибка', 'Не удалось добавить преподавателя', 'danger');
    }
}

viewTeacherDetails(teacherId) {
    try {
        const teacher = this.appData.users.find(u => u.id === teacherId);
        if (!teacher) {
            this.showAlert('Ошибка', 'Преподаватель не найден!', 'danger');
            return;
        }
        
        const stats = this.getTeacherStatistics(teacherId);
        const teacherSubjects = this.appData.subjects.filter(s => 
            teacher.subjects && teacher.subjects.includes(s.name)
        );
        
        let html = `
            <div class="modal fade" id="teacherDetailsModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">
                                <i class="bi bi-person-badge me-2 text-primary"></i>Преподаватель: ${teacher.name}
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row mb-4">
                                <div class="col-md-6">
                                    <p><strong>ФИО:</strong> ${teacher.name}</p>
                                    <p><strong>Логин:</strong> ${teacher.username}</p>
                                    ${teacher.email ? `<p><strong>Email:</strong> ${teacher.email}</p>` : ''}
                                    <p><strong>Статус:</strong> <span class="badge ${teacher.disabled ? 'bg-secondary' : 'bg-success'}">${teacher.disabled ? 'Отключен' : 'Активен'}</span></p>
                                </div>
                                <div class="col-md-6">
                                    <p><strong>Дата регистрации:</strong> ${new Date(teacher.createdAt).toLocaleDateString('ru-RU')}</p>
                                    <p><strong>Предметы:</strong> <span class="badge bg-info">${stats.subjectsCount}</span></p>
                                    <p><strong>Группы (куратор):</strong> <span class="badge bg-warning">${stats.groupsCount}</span></p>
                                    <p><strong>Студентов:</strong> <span class="badge bg-success">${stats.studentsCount}</span></p>
                                </div>
                            </div>
                            
                            <h6>Предметы преподавателя:</h6>
        `;
        
        if (!teacher.subjects || teacher.subjects.length === 0) {
            html += '<p class="text-muted">Предметы не назначены</p>';
        } else {
            html += `
                <div class="table-responsive mb-4">
                    <table class="table table-sm">
                        <thead>
                            <tr>
                                <th>Предмет</th>
                                <th>Количество оценок</th>
                                <th>Средний балл</th>
                            </tr>
                        </thead>
                        <tbody>
            `;
            
            teacher.subjects.forEach(subjectName => {
                const subject = this.appData.subjects.find(s => s.name === subjectName);
                if (subject) {
                    const subjectGrades = this.appData.grades.filter(g => g.subjectId === subject.id);
                    const numericGrades = subjectGrades
                        .map(g => parseInt(g.grade))
                        .filter(g => !isNaN(g));
                    const averageGrade = numericGrades.length > 0 
                        ? (numericGrades.reduce((a, b) => a + b, 0) / numericGrades.length).toFixed(2)
                        : '0.00';
                    
                    html += `
                        <tr>
                            <td>${subject.name}</td>
                            <td><span class="badge bg-primary">${subjectGrades.length}</span></td>
                            <td><span class="badge ${this.getGradeBadgeClass(averageGrade)}">${averageGrade}</span></td>
                        </tr>
                    `;
                }
            });
            
            html += `
                        </tbody>
                    </table>
                </div>
            `;
        }
        
        html += `
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        const oldModal = document.getElementById('teacherDetailsModal');
        if (oldModal) oldModal.remove();
        
        document.body.insertAdjacentHTML('beforeend', html);
        const modal = new bootstrap.Modal(document.getElementById('teacherDetailsModal'));
        modal.show();
        
    } catch (error) {
        console.error('Ошибка показа деталей преподавателя:', error);
        this.showAlert('Ошибка', 'Не удалось загрузить информацию о преподавателе', 'danger');
    }
}

editTeacher(teacherId) {
    this.showAlert('Информация', 'Функция редактирования преподавателя будет доступна в следующем обновлении', 'info');
}

toggleTeacherAccount(teacherId) {
    try {
        const teacher = this.appData.users.find(u => u.id === teacherId);
        if (!teacher) {
            this.showAlert('Ошибка', 'Преподаватель не найден!', 'danger');
            return;
        }
        
        const action = teacher.disabled ? 'активировать' : 'деактивировать';
        
        if (confirm(`Вы уверены, что хотите ${action} аккаунт преподавателя ${teacher.name}?`)) {
            teacher.disabled = !teacher.disabled;
            teacher.updatedAt = new Date().toISOString();
            teacher.updatedBy = this.currentUser?.id;
            
            if (this.saveData()) {
                this.showAlert('Успех', `Аккаунт преподавателя ${teacher.disabled ? 'деактивирован' : 'активирован'}`, 'success');
                this.loadTeachersManagementTab();
            }
        }
    } catch (error) {
        console.error('Ошибка изменения статуса аккаунта:', error);
        this.showAlert('Ошибка', 'Не удалось изменить статус аккаунта', 'danger');
    }
}

deleteTeacher(teacherId) {
    try {
        const teacher = this.appData.users.find(u => u.id === teacherId);
        if (!teacher) {
            this.showAlert('Ошибка', 'Преподаватель не найден!', 'danger');
            return;
        }
        
        // Проверяем, нет ли у преподавателя связанных данных
        const teacherSubjects = this.appData.subjects.filter(s => s.teacherId === teacherId);
        if (teacherSubjects.length > 0) {
            this.showAlert('Ошибка', `Нельзя удалить преподавателя ${teacher.name}, так как он ведет предметы: ${teacherSubjects.map(s => s.name).join(', ')}`, 'danger');
            return;
        }
        
        if (confirm(`Вы уверены, что хотите удалить преподавателя "${teacher.name}"?`)) {
            this.appData.users = this.appData.users.filter(u => u.id !== teacherId);
            
            if (this.saveData()) {
                this.showAlert('Удалено', `Преподаватель "${teacher.name}" удален из системы`, 'info');
                this.loadTeachersManagementTab();
            }
        }
    } catch (error) {
        console.error('Ошибка удаления преподавателя:', error);
        this.showAlert('Ошибка', 'Не удалось удалить преподавателя', 'danger');
    }
}

// ФИЛЬТРАЦИЯ И ПОИСК ДЛЯ ПРЕПОДАВАТЕЛЕЙ
filterTeachers() {
    try {
        const statusFilter = document.getElementById('teacherStatusFilter')?.value;
        const subjectFilter = document.getElementById('teacherSubjectFilter')?.value;
        const searchQuery = document.getElementById('teacherSearch')?.value.toLowerCase();
        
        let filteredTeachers = this.appData.users.filter(u => u.role === 'teacher');
        
        // Фильтр по статусу
        if (statusFilter && statusFilter !== 'all') {
            filteredTeachers = filteredTeachers.filter(teacher => {
                if (statusFilter === 'active') return !teacher.disabled;
                if (statusFilter === 'disabled') return teacher.disabled;
                return true;
            });
        }
        
        // Фильтр по предмету
        if (subjectFilter && subjectFilter !== 'all') {
            filteredTeachers = filteredTeachers.filter(teacher => 
                teacher.subjects && teacher.subjects.includes(subjectFilter)
            );
        }
        
        // Поиск по ФИО
        if (searchQuery) {
            filteredTeachers = filteredTeachers.filter(teacher => 
                teacher.name.toLowerCase().includes(searchQuery)
            );
        }
        
        // Обновляем отображение
        const container = document.getElementById('teachersListContainer');
        if (container) {
            container.innerHTML = this.renderTeachersManagementList(filteredTeachers);
        } else {
            console.error('Контейнер teachersListContainer не найден');
            return;
        }
        
        // Обновляем счетчик
        this.updateTeachersCounter(filteredTeachers.length);
        
    } catch (error) {
        console.error('Ошибка фильтрации преподавателей:', error);
        this.showAlert('Ошибка', 'Не удалось применить фильтры', 'danger');
    }
}

clearTeacherFilters() {
    try {
        document.getElementById('teacherStatusFilter').value = 'all';
        document.getElementById('teacherSubjectFilter').value = 'all';
        document.getElementById('teacherSearch').value = '';
        
        // Применяем сброшенные фильтры
        this.filterTeachers();
        
        this.showAlert('Информация', 'Фильтры сброшены', 'info');
    } catch (error) {
        console.error('Ошибка сброса фильтров:', error);
    }
}

updateTeachersCounter(count) {
    const badge = document.getElementById('teachersCountBadge');
    if (badge) {
        badge.textContent = count;
        badge.className = `badge ${count > 0 ? 'bg-primary' : 'bg-secondary'} ms-2`;
    }
}

exportTeachersList() {
    this.showAlert('Информация', 'Функция экспорта списка преподавателей будет доступна в следующем обновлении', 'info');
}

// СИСТЕМА СЕМЕСТРОВ И КУРСОВ
getCurrentSemester() {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    
    // 1 семестр: сентябрь-январь, 2 семестр: февраль-июнь
    if (month >= 9 || month <= 1) {
        return `1 семестр ${year}-${year + 1}`;
    } else {
        return `2 семестр ${year}`;
    }
}

getCurrentCourse(group) {
    if (!group) return 1;
    
    // Парсим номер группы: ИТ-21 -> 21 (год поступления)
    const match = group.match(/-(\d{2})$/);
    if (match) {
        const admissionYear = parseInt(match[1]);
        const currentYear = new Date().getFullYear() % 100; // Последние 2 цифры текущего года
        
        let course = currentYear - admissionYear + 1;
        
        // Корректируем курс в зависимости от месяца
        const currentMonth = new Date().getMonth() + 1;
        if (currentMonth >= 9) { // С сентября начинается новый учебный год
            course = currentYear - admissionYear + 1;
        } else { // С января по август - продолжается предыдущий учебный год
            course = currentYear - admissionYear;
        }
        
        return Math.max(1, Math.min(4, course)); // Ограничиваем 1-4 курсами
    }
    
    return 1; // По умолчанию 1 курс
}

getAllSemesters() {
    const semesters = new Set();
    this.appData.grades.forEach(grade => {
        if (grade.semester) semesters.add(grade.semester);
    });
    
    // Добавляем текущий семестр, если его еще нет
    const currentSemester = this.getCurrentSemester();
    semesters.add(currentSemester);
    
    return Array.from(semesters).sort().reverse(); // Сначала новые семестры
}

getAllCourses() {
    return [1, 2, 3, 4]; // Все возможные курсы
}

}

// Создаем глобальный экземпляр приложения
const app = new EZachetkaApp();

// Глобальные функции для вызова из HTML
function login() {
    try {
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;
        
        console.log('Попытка входа:', username, password); // для отладки
        
        // Теперь передаём только логин и пароль
        if (app.login(username, password)) {
            console.log('Успешный вход');
        } else {
            console.log('Ошибка входа');
        }
    } catch (error) {
        console.error('Ошибка входа:', error);
        alert('Произошла ошибка при входе в систему');
    }
}

function logout() {
    try {
        if (confirm('Вы уверены, что хотите выйти?')) {
            app.logout();
            document.getElementById('loginScreen').style.display = 'flex';
            document.getElementById('mainApp').style.display = 'none';
            document.getElementById('adminNavItem').style.display = 'none';
            document.getElementById('loginPassword').value = '';
        }
    } catch (error) {
        console.error('Ошибка выхода:', error);
    }
}

function showTab(tabName) {
    try {
        app.showTab(tabName);
    } catch (error) {
        console.error('Ошибка переключения вкладки:', error);
    }
}

// Делаем app глобально доступным
window.app = app;