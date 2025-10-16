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
        console.log('Электронная зачётка инициализирована!');
    }

    // Система хранения данных
    loadData() {
        const saved = localStorage.getItem('e-zachetka-data');
        if (saved) {
            return JSON.parse(saved);
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
        localStorage.setItem('e-zachetka-data', JSON.stringify(this.appData));
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
                    subjects: ['Математика', 'Физика']
                },
                {
                    id: this.generateId(),
                    username: 'admin',
                    password: 'admin123',
                    name: 'Администратор Системы',
                    role: 'admin',
                    subjects: []
                }
            ];
            this.saveData();
        }
    }

    generateId() {
        return Date.now() + Math.random().toString(36).substr(2, 9);
    }

    showAlert(title, message, type = 'info') {
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
            u.role === role
        );

        if (user) {
            this.currentUser = user;
            this.appData.system.totalLogins++;
            this.saveData();
            return true;
        }

        this.showAlert('Ошибка входа', 'Неверный логин, пароль или роль!', 'danger');
        return false;
    }

    logout() {
        this.currentUser = null;
        return true;
    }

    // Система вкладок
    showTab(tabName) {
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
    }

    loadTabContent(tabName) {
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
            default:
                const container = document.getElementById(tabName + 'Tab');
                if (container) {
                    container.innerHTML = this.getDevelopmentMessage();
                }
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
    }

    calculateStatistics() {
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
    }

    loadRecentNotifications() {
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
    }

    loadUpcomingEvents() {
        const container = document.getElementById('upcomingEvents');
        const events = [
            { title: 'Экзамен по математике', date: new Date(Date.now() + 86400000), group: 'ИТ-21' },
            { title: 'Зачёт по программированию', date: new Date(Date.now() + 172800000), group: 'ИТ-22' }
        ];
        
        if (events.length === 0) {
            container.innerHTML = '<p class="text-muted text-center">Событий на ближайшую неделю нет</p>';
            return;
        }
        
        container.innerHTML = events.map(event => `
            <div class="d-flex justify-content-between align-items-center border-bottom pb-2 mb-2">
                <div>
                    <h6 class="mb-1">${event.title}</h6>
                    <small class="text-muted">${event.group ? `• ${event.group}` : ''}</small>
                </div>
                <div class="text-end">
                    <div class="fw-bold">${event.date.toLocaleDateString()}</div>
                    <small class="text-muted">Весь день</small>
                </div>
            </div>
        `).join('');
    }

    // СТУДЕНТЫ
    loadStudentsTab() {
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
                        <button class="btn btn-sm btn-outline-primary me-1" onclick="app.viewStudentDetails(${student.id})">
                            <i class="bi bi-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="app.deleteStudent(${student.id})">
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
}

    showAddStudentModal() {
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
    }

    addStudent() {
        const name = document.getElementById('studentName').value.trim();
        const group = document.getElementById('studentGroup').value.trim();
        
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
        this.saveData();
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('addStudentModal'));
        modal.hide();
        
        this.showAlert('Успех', `Студент ${name} добавлен в группу ${group}`, 'success');
        this.loadStudentsTab();
    }

    deleteStudent(id) {
        if (confirm('Удалить студента и все его оценки?')) {
            this.appData.students = this.appData.students.filter(s => s.id !== id);
            this.appData.grades = this.appData.grades.filter(g => g.studentId !== id);
            this.saveData();
            
            this.showAlert('Удалено', 'Студент и все его оценки удалены', 'info');
            this.loadStudentsTab();
        }
    }

    viewStudentDetails(studentId) {
        const student = this.appData.students.find(s => s.id === studentId);
        if (!student) return;

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
                        <td>${grade.date}</td>
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
        
        document.body.insertAdjacentHTML('beforeend', html);
        const modal = new bootstrap.Modal(document.getElementById('studentDetailsModal'));
        modal.show();
        
        document.getElementById('studentDetailsModal').addEventListener('hidden.bs.modal', function() {
            this.remove();
        });
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
                        <button class="btn btn-sm btn-outline-danger" onclick="app.deleteSubject(${subject.id})">
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
                                    <input type="text" class="form-control" id="subjectTeacher" value="${this.currentUser.name}" readonly>
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
    }

    addSubject() {
        const name = document.getElementById('subjectName').value.trim();
        const teacher = document.getElementById('subjectTeacher').value.trim();
        
        if (!name) {
            this.showAlert('Ошибка', 'Введите название предмета!', 'warning');
            return;
        }

        const subject = {
            id: this.generateId(),
            name: name,
            teacherName: teacher,
            teacherId: this.currentUser.id,
            createdAt: new Date().toISOString()
        };

        this.appData.subjects.push(subject);
        this.saveData();
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('addSubjectModal'));
        modal.hide();
        
        this.showAlert('Успех', `Предмет "${name}" добавлен в систему`, 'success');
        this.loadSubjectsTab();
    }

    deleteSubject(id) {
        if (confirm('Удалить предмет и все связанные оценки?')) {
            this.appData.subjects = this.appData.subjects.filter(s => s.id !== id);
            this.appData.grades = this.appData.grades.filter(g => g.subjectId !== id);
            this.saveData();
            
            this.showAlert('Удалено', 'Предмет и все связанные оценки удалены', 'info');
            this.loadSubjectsTab();
        }
    }

    // ОЦЕНКИ - исправленная версия
loadGradesTab() {
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
}

renderAllGrades() {
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
        const student = this.appData.students.find(s => s.id == grade.studentId);
        const subject = this.appData.subjects.find(s => s.id == grade.subjectId);
        const gradeClass = this.getGradeClass(grade.grade);
        
        if (student && subject) {
            // 🔽 ИСПРАВЛЕННАЯ СТРОКА - используем одинарные кавычки для ID 🔽
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
}

addGrade() {
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
    
    console.log('Выбран студент ID:', studentId, 'тип:', typeof studentId);
    console.log('Выбран предмет ID:', subjectId, 'тип:', typeof subjectId);
    console.log('Все студенты:', this.appData.students);
    console.log('Все предметы:', this.appData.subjects);
    
    if (!studentId || !subjectId || !gradeValue) {
        this.showAlert('Ошибка', 'Выберите студента, предмет и оценку!', 'warning');
        return;
    }

    // Ищем студента и предмет - убираем parseInt, сравниваем как строки
    const student = this.appData.students.find(s => s.id == studentId); // == вместо ===
    const subject = this.appData.subjects.find(s => s.id == subjectId); // == вместо ===

    console.log('Найден студент:', student);
    console.log('Найден предмет:', subject);

    if (!student) {
        this.showAlert('Ошибка', `Студент не найден! ID: ${studentId}`, 'danger');
        return;
    }

    if (!subject) {
        this.showAlert('Ошибка', `Предмет не найден! ID: ${subjectId}`, 'danger');
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
    this.saveData();
    
    document.getElementById('addGradeForm').reset();
    
    this.showAlert('Успех', 
        `Студенту ${student.name} по предмету "${subject.name}" выставлена оценка: ${gradeValue}`, 
        'success');
    
    this.updateGradesDisplay();
}

deleteGrade(gradeId) {
    console.log('Пытаемся удалить оценку с ID:', gradeId, 'тип:', typeof gradeId);
    console.log('Все оценки перед удалением:', this.appData.grades);
    
    if (confirm('Удалить эту оценку?')) {
        const initialLength = this.appData.grades.length;
        this.appData.grades = this.appData.grades.filter(g => {
            console.log('Сравниваем:', g.id, 'с', gradeId, 'результат:', g.id != gradeId);
            return g.id != gradeId;
        });
        
        console.log('Удалено оценок:', initialLength - this.appData.grades.length);
        console.log('Все оценки после удаления:', this.appData.grades);
        
        this.saveData();
        
        this.showAlert('Удалено', 'Оценка удалена', 'info');
        this.updateGradesDisplay();
    }
}

    // ЗАЧЁТНЫЕ МЕРОПРИЯТИЯ
    loadAttendanceTab() {
        const container = document.getElementById('attendanceTab');
        container.innerHTML = `
            <div class="row">
                <div class="col-12">
                    <div class="d-flex justify-content-between align-items-center mb-4">
                        <h2 class="h3 mb-0">
                            <i class="bi bi-clipboard-check me-2 text-success"></i>Зачётные мероприятия
                        </h2>
                    </div>
                </div>
            </div>
            
            <div class="row">
                <div class="col-12">
                    <div class="card shadow">
                        <div class="card-body text-center py-5">
                            <i class="bi bi-clipboard-check display-1 text-muted"></i>
                            <h4 class="text-muted mt-3">Система зачётных мероприятий</h4>
                            <p class="text-muted">Отмечайте присутствие студентов на экзаменах и зачётах</p>
                            <button class="btn btn-primary mt-3" onclick="app.showMarkAttendanceModal()">
                                <i class="bi bi-check-square me-1"></i>Отметить присутствие
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    showMarkAttendanceModal() {
        this.showAlert('Информация', 'Функция отметки присутствия будет доступна в следующем обновлении', 'info');
    }
    updateGradesDisplay() {
        if (this.currentTab === 'grades') {
            this.loadGradesTab();
        }
        if (this.currentTab === 'dashboard') {
            this.loadDashboard();
        }
        if (this.currentTab === 'students') {
            this.loadStudentsTab();
        }
    }
}

// Создаем глобальный экземпляр приложения
const app = new EZachetkaApp();

// Глобальные функции для вызова из HTML
function login() {
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    const role = document.getElementById('loginRole').value;
    
    if (app.login(username, password, role)) {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('mainApp').style.display = 'block';
        document.getElementById('currentUserNav').textContent = app.currentUser.name;
        document.getElementById('currentRoleNav').textContent = app.currentUser.role === 'admin' ? 'Админ' : 'Преподаватель';
        document.getElementById('currentUserEmail').textContent = app.currentUser.username;
        
        if (app.currentUser.role === 'admin') {
            document.getElementById('adminNavItem').style.display = 'block';
        }
        
        app.loadDashboard();
        app.showTab('dashboard');
    }
}

function logout() {
    if (confirm('Вы уверены, что хотите выйти?')) {
        app.logout();
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('mainApp').style.display = 'none';
        document.getElementById('adminNavItem').style.display = 'none';
        document.getElementById('loginPassword').value = '';
    }
}

function showTab(tabName) {
    app.showTab(tabName);
}



// Делаем app глобально доступным
window.app = app;