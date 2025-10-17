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
        this.checkAuthState(); // Проверяем авторизацию при загрузке
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
                studentId: null, // Связь с записью в students
                group: 'ИТ-21',
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
    login(username, password, role) {
    if (!username || !password) {
        this.showAlert('Ошибка', 'Заполните все поля!', 'warning');
        return false;
    }

    const user = this.appData.users.find(u => 
        u.username === username && 
        u.password === password && 
        u.role === role &&
        !u.disabled
    );

    if (user) {
        // Записываем время входа
        user.lastLogin = new Date().toISOString();
        
        // Для студента находим соответствующую запись в students
        if (user.role === 'student') {
            let studentRecord = this.appData.students.find(s => 
                s.name === user.name && s.group === user.group
            );
            
            // Если записи нет - создаём
            if (!studentRecord) {
                studentRecord = {
                    id: this.generateId(),
                    name: user.name,
                    group: user.group,
                    createdAt: new Date().toISOString()
                };
                this.appData.students.push(studentRecord);
                this.saveData();
            }
            
            user.studentId = studentRecord.id;
        }
        
        this.currentUser = user;
        this.appData.system.totalLogins++;
        this.saveData();
        this.saveAuthState();
        this.showMainApp();
        return true;
    }

    this.showAlert('Ошибка входа', 'Неверный логин, пароль или роль!', 'danger');
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
                document.getElementById('statStudents').textContent = stats.totalStudents;
                document.getElementById('statSubjects').textContent = stats.totalSubjects;
                document.getElementById('statGrades').textContent = stats.totalGrades;
                document.getElementById('statAverage').textContent = stats.averageGrade;
                
                document.getElementById('currentDate').textContent = new Date().toLocaleDateString('ru-RU', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            }

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
        } catch (error) {
            console.error('Ошибка загрузки уведомлений:', error);
        }
    }

    loadUpcomingEvents() {
    try {
        const container = document.getElementById('upcomingEvents');
        
        if (!this.appData.calendarEvents || this.appData.calendarEvents.length === 0) {
            container.innerHTML = '<p class="text-muted text-center">Событий на ближайшую неделю нет</p>';
            return;
        }
        
        const today = new Date();
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);
        
        const upcomingEvents = this.appData.calendarEvents
            .filter(event => {
                const eventDate = new Date(event.date);
                return eventDate >= today && eventDate <= nextWeek;
            })
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
                                            ${this.appData.students.map(student => 
                                                `<option value="${student.id}">${student.name} (${student.group})</option>`
                                            ).join('')}
                                        </select>
                                    </div>
                                    <div class="mb-3">
                                        <label for="gradeSubjectSelect" class="form-label">Предмет</label>
                                        <select class="form-select" id="gradeSubjectSelect" required>
                                            <option value="">Выберите предмет</option>
                                            ${this.appData.subjects.map(subject => 
                                                `<option value="${subject.id}">${subject.name}</option>`
                                            ).join('')}
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
                                    <button type="button" class="btn btn-primary w-100" onclick="app.addGrade()">
                                        <i class="bi bi-check-circle me-1"></i>Выставить оценку
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-md-6">
                        <div class="card shadow">
                            <div class="card-header">
                                <h5 class="card-title mb-0">Все оценки</h5>
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

    renderAllGrades() {
        try {
            if (this.appData.grades.length === 0) {
                return '<p class="text-muted text-center">Оценок пока нет</p>';
            }

            let html = `
                <div class="table-responsive">
                    <table class="table table-sm table-hover">
                        <thead>
                            <tr>
                                <th>Студент</th>
                                <th>Предмет</th>
                                <th>Оценка</th>
                                <th>Дата</th>
                                <th>Действия</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

            const sortedGrades = [...this.appData.grades].sort((a, b) => {
                return new Date(b.date || b.id) - new Date(a.date || a.id);
            });

            sortedGrades.forEach(grade => {
                const student = this.appData.students.find(s => s.id === grade.studentId);
                const subject = this.appData.subjects.find(s => s.id === grade.subjectId);
                const gradeClass = this.getGradeClass(grade.grade);
                
                if (student && subject) {
                    html += `
                        <tr>
                            <td>
                                <i class="bi bi-person-circle me-1 text-primary"></i>
                                ${student.name}
                            </td>
                            <td>${subject.name}</td>
                            <td><span class="badge ${gradeClass}">${grade.grade}</span></td>
                            <td><small class="text-muted">${grade.date || 'Не указана'}</small></td>
                            <td>
                                <button class="btn btn-sm btn-outline-danger" onclick="app.deleteGrade('${grade.id}')">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `;
                } else {
                    html += `
                        <tr class="table-warning">
                            <td><i class="bi bi-exclamation-triangle me-1 text-warning"></i>Не найден</td>
                            <td>Не найден</td>
                            <td><span class="badge ${gradeClass}">${grade.grade}</span></td>
                            <td><small class="text-muted">${grade.date || 'Не указана'}</small></td>
                            <td>
                                <button class="btn btn-sm btn-outline-danger" onclick="app.deleteGrade('${grade.id}')">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `;
                }
            });

            html += `
                        </tbody>
                    </table>
                </div>
            `;

            return html;
        } catch (error) {
            console.error('Ошибка рендеринга оценок:', error);
            return '<p class="text-danger text-center">Ошибка загрузки оценок</p>';
        }
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

    deleteGrade(gradeId) {
        try {
            if (confirm('Удалить эту оценку?')) {
                // ИСПРАВЛЕННАЯ СТРОКА - используем строгое сравнение
                this.appData.grades = this.appData.grades.filter(g => g.id !== gradeId);
                
                if (this.saveData()) {
                    this.showAlert('Удалено', 'Оценка удалена', 'info');
                    this.updateGradesDisplay();
                }
            }
        } catch (error) {
            console.error('Ошибка удаления оценки:', error);
            this.showAlert('Ошибка', 'Не удалось удалить оценку', 'danger');
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
        
        container.innerHTML = `
            <div class="row">
                <div class="col-12">
                    <div class="d-flex justify-content-between align-items-center mb-4">
                        <h2 class="h3 mb-0">
                            <i class="bi bi-calendar me-2 text-primary"></i>Календарь мероприятий
                        </h2>
                        <div>
                            <button class="btn btn-outline-secondary me-2" onclick="app.prevMonth()">
                                <i class="bi bi-chevron-left"></i>
                            </button>
                            <span id="currentMonth" class="fw-bold fs-5">${this.getMonthYearString(currentDate)}</span>
                            <button class="btn btn-outline-secondary ms-2" onclick="app.nextMonth()">
                                <i class="bi bi-chevron-right"></i>
                            </button>
                            <button class="btn btn-primary ms-3" onclick="app.showAddEventModal()">
                                <i class="bi bi-plus-circle me-1"></i>Добавить событие
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
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
    
    for (let i = 0; i < 42; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        
        const isCurrentMonth = currentDate.getMonth() === date.getMonth();
        const isToday = currentDate.getTime() === today.getTime();
        const dayEvents = this.getEventsForDate(currentDate);
        
        let dayClass = 'calendar-day';
        if (!isCurrentMonth) dayClass += ' other-month';
        if (isToday) dayClass += ' today';
        if (dayEvents.length > 0) dayClass += ' has-events';
        
        html += `
            <div class="${dayClass}" onclick="app.showDayEvents('${currentDate.toISOString()}')">
                <div class="day-number">${currentDate.getDate()}</div>
                ${this.renderEventDots(dayEvents)}
            </div>
        `;
    }
    
    html += `</div>`;
    return html;
}

getEventsForDate(date) {
    if (!this.appData.calendarEvents) {
        this.appData.calendarEvents = [];
    }
    
    const dateStr = date.toISOString().split('T')[0];
    return this.appData.calendarEvents.filter(event => 
        event.date.startsWith(dateStr)
    );
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
            
            this.showAlert('Успех', 'Событие добавлено в календарь', 'success');
            this.loadCalendarTab();
        }
    } catch (error) {
        console.error('Ошибка добавления события:', error);
        this.showAlert('Ошибка', 'Не удалось добавить событие', 'danger');
    }
}

showDayEvents(dateString) {
    const date = new Date(dateString);
    const events = this.getEventsForDate(date);
    
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
                    <button class="btn btn-sm btn-outline-danger ms-2" onclick="app.deleteCalendarEvent('${event.id}')">
                        <i class="bi bi-trash"></i>
                    </button>
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
                        <th>Предметы</th>
                        <th>Статус</th>
                        <th>Последний вход</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    users.forEach(user => {
        const roleBadge = user.role === 'admin' ? 
            '<span class="badge bg-danger">Администратор</span>' : 
            '<span class="badge bg-primary">Преподаватель</span>';
        
        const statusBadge = user.disabled ? 
            '<span class="badge bg-secondary">Неактивен</span>' : 
            '<span class="badge bg-success">Активен</span>';
        
        const subjectsList = user.subjects && user.subjects.length > 0 ? 
            user.subjects.slice(0, 2).join(', ') + (user.subjects.length > 2 ? '...' : '') : 
            'Не назначены';
        
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
                    <small class="text-muted">${subjectsList}</small>
                    ${user.subjects && user.subjects.length > 2 ? 
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
                                <select class="form-select" id="userRole" required>
                                    <option value="teacher">Преподаватель</option>
                                    <option value="admin">Администратор</option>
                                </select>
                            </div>
                            <div class="mb-3">
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
    const modal = new bootstrap.Modal(document.getElementById('addUserModal'));
    modal.show();
}

addUser() {
    try {
        const name = document.getElementById('userName')?.value.trim();
        const username = document.getElementById('userUsername')?.value.trim();
        const password = document.getElementById('userPassword')?.value;
        const role = document.getElementById('userRole')?.value;
        const active = document.getElementById('userActive')?.checked;
        
        const subjectsSelect = document.getElementById('userSubjects');
        const subjects = Array.from(subjectsSelect.selectedOptions).map(option => option.value);
        
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
            disabled: !active,
            createdAt: new Date().toISOString(),
            createdBy: this.currentUser?.id
        };
        
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
                                    <select class="form-select" id="editUserRole" required>
                                        <option value="teacher" ${user.role === 'teacher' ? 'selected' : ''}>Преподаватель</option>
                                        <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Администратор</option>
                                    </select>
                                </div>
                                <div class="mb-3">
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
        const modal = new bootstrap.Modal(document.getElementById('editUserModal'));
        modal.show();
        
    } catch (error) {
        console.error('Ошибка редактирования пользователя:', error);
        this.showAlert('Ошибка', 'Не удалось открыть форму редактирования', 'danger');
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
        
        const subjectsSelect = document.getElementById('editUserSubjects');
        const subjects = Array.from(subjectsSelect.selectedOptions).map(option => option.value);
        
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



}

// Создаем глобальный экземпляр приложения
const app = new EZachetkaApp();

// Глобальные функции для вызова из HTML
function login() {
    try {
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;
        const role = document.getElementById('loginRole').value;
        
        app.login(username, password, role);
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