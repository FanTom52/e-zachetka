// Основной файл приложения
import { AuthManager } from './modules/auth.js';
import { StudentsManager } from './modules/students.js';
import { SubjectsManager } from './modules/subjects.js';
import { GradesManager } from './modules/grades.js';
import { StorageManager } from './utils/storage.js';
import { Helpers } from './utils/helpers.js';

class EZachetkaApp {
    constructor() {
        this.auth = new AuthManager();
        this.students = new StudentsManager();
        this.subjects = new SubjectsManager();
        this.grades = new GradesManager();
        
        this.currentTab = 'dashboard';
        this.init();
    }

    init() {
    console.log('🎯 init() вызван');
    
    // Настраиваем пользователей по умолчанию
    this.setupDefaultUsers();
    console.log('👥 Пользователи настроены:', this.appData.users);
    
    // Пытаемся автоматически войти
    this.autoLogin();
    console.log('🏁 Инициализация завершена');
    }

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
        }
    }

    loadDashboard() {
        const stats = this.grades.calculateOverallStatistics();
        
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
    }

    loadStudentsTab() {
        const container = document.getElementById('studentsTab');
        const students = this.students.getAllStudents();
        
        let html = `
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
        `;

        if (students.length === 0) {
            html += `
                <div class="text-center py-5">
                    <i class="bi bi-people display-1 text-muted"></i>
                    <h4 class="text-muted mt-3">Студенты не добавлены</h4>
                    <p class="text-muted">Добавьте первого студента чтобы начать работу</p>
                </div>
            `;
        } else {
            html += `
                <div class="card shadow">
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-hover">
                                <thead>
                                    <tr>
                                        <th>ФИО</th>
                                        <th>Группа</th>
                                        <th>Действия</th>
                                    </tr>
                                </thead>
                                <tbody>
            `;

            students.forEach(student => {
                html += `
                    <tr>
                        <td>
                            <i class="bi bi-person-circle me-2 text-primary"></i>
                            <strong>${student.name}</strong>
                        </td>
                        <td><span class="badge bg-secondary">${student.group}</span></td>
                        <td>
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
        }

        html += `
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

        container.innerHTML = html;
    }

    addStudent(name, group) {
        return this.students.addStudent(name, group);
    }

    deleteStudent(id) {
        if (confirm('Удалить студента и все его оценки?')) {
            if (this.students.deleteStudent(id)) {
                this.loadStudentsTab();
            }
        }
    }
    constructor() {
    console.log('🚀 Конструктор EZachetkaApp запущен');
    
    // 1. Сначала загружаем данные системы
    this.currentTab = 'dashboard';
    this.appData = this.loadData();
    
    // 2. Потом загружаем текущего пользователя (чтобы были данные для проверки)
    this.currentUser = this.loadCurrentUser();
    console.log('📋 Загруженный пользователь:', this.currentUser);
    
    // 3. Инициализируем
    this.init();
    }
    saveCurrentUser() {
    if (this.currentUser) {
        const userData = {
            ...this.currentUser,
            loginTime: new Date().getTime() // Сохраняем время входа
        };
        localStorage.setItem('e-zachetka-current-user', JSON.stringify(userData));
    } else {
        localStorage.removeItem('e-zachetka-current-user');
    }
    }
    loadCurrentUser() {
    const saved = localStorage.getItem('e-zachetka-current-user');
    if (!saved) return null;
    
    try {
        const storedUser = JSON.parse(saved);
        return this.validateStoredUser(storedUser);
    } catch (error) {
        console.error('Ошибка загрузки пользователя:', error);
        return null;
    }
    }
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
        this.saveCurrentUser(); // 🔽 СОХРАНЯЕМ ПОЛЬЗОВАТЕЛЯ
        return true;
    }

    this.showAlert('Ошибка входа', 'Неверный логин, пароль или роль!', 'danger');
    return false;
    }
    logout() {
    this.currentUser = null;
    this.saveCurrentUser(); // 🔽 ОЧИЩАЕМ СОХРАНЕНИЕ
    return true;
    }
    autoLogin() {
    if (this.currentUser) {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('mainApp').style.display = 'block';
        document.getElementById('currentUserNav').textContent = this.currentUser.name;
        document.getElementById('currentRoleNav').textContent = this.currentUser.role === 'admin' ? 'Админ' : 'Преподаватель';
        document.getElementById('currentUserEmail').textContent = this.currentUser.username;
        
        if (this.currentUser.role === 'admin') {
            document.getElementById('adminNavItem').style.display = 'block';
        }
        
        this.loadDashboard();
        this.showTab('dashboard');
        
        this.showAlert('Успех', `С возвращением, ${this.currentUser.name}!`, 'success');
    }
    }
    validateStoredUser(storedUser) {
    console.log('🔍 Валидация пользователя:', storedUser);
    
    if (!storedUser || !storedUser.id) {
        console.log('❌ Нет ID пользователя');
        return null;
    }
    
    // Загружаем данные если они еще не загружены
    if (!this.appData) {
        this.appData = this.loadData();
    }
    
    // Проверяем, существует ли пользователь в системе
    const validUser = this.appData.users.find(u => u.id == storedUser.id);
    console.log('👥 Найденный пользователь в системе:', validUser);
    
    if (!validUser) {
        console.log('❌ Пользователь не найден в системе');
        return null;
    }
    
    // Проверяем, не изменились ли критичные данные
    if (validUser.username !== storedUser.username || 
        validUser.role !== storedUser.role) {
        console.log('❌ Данные пользователя изменились');
        return null;
    }
    
    console.log('✅ Пользователь прошел валидацию');
    return validUser;
    }

}

// Инициализация приложения
const app = new EZachetkaApp();

// Глобальные функции для HTML
window.login = function() {
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    const role = document.getElementById('loginRole').value;
    
    if (app.auth.login(username, password, role)) {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('mainApp').style.display = 'block';
        document.getElementById('currentUserNav').textContent = app.auth.getCurrentUser().name;
        document.getElementById('currentRoleNav').textContent = app.auth.getCurrentUser().role === 'admin' ? 'Админ' : 'Преподаватель';
        
        if (app.auth.getCurrentUser().role === 'admin') {
            document.getElementById('adminNavItem').style.display = 'block';
        }
        
        app.loadDashboard();
        app.showTab('dashboard');
        
        Helpers.showAlert('Успех', `Добро пожаловать, ${app.auth.getCurrentUser().name}!`, 'success');
    }
};

window.logout = function() {
    if (confirm('Вы уверены, что хотите выйти?')) {
        app.auth.logout();
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('mainApp').style.display = 'none';
        document.getElementById('adminNavItem').style.display = 'none';
        document.getElementById('loginPassword').value = '';
    }
};

window.showTab = function(tabName) {
    app.showTab(tabName);
};

window.addStudent = function() {
    const name = document.getElementById('studentName').value.trim();
    const group = document.getElementById('studentGroup').value.trim();
    
    if (app.addStudent(name, group)) {
        const modal = bootstrap.Modal.getInstance(document.getElementById('addStudentModal'));
        modal.hide();
        document.getElementById('addStudentForm').reset();
        app.loadStudentsTab();
    }
};



// Делаем app глобально доступным
window.app = app;