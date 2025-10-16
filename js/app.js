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
        this.setupDefaultUsers();
        console.log('Электронная зачётка инициализирована!');
    }

    setupDefaultUsers() {
        const appData = StorageManager.getAppData();
        if (appData.users.length === 0) {
            appData.users = [
                {
                    id: Helpers.generateId(),
                    username: 'prepod',
                    password: '123456',
                    name: 'Иванова Мария Петровна',
                    role: 'teacher',
                    subjects: ['Математика', 'Физика']
                },
                {
                    id: Helpers.generateId(),
                    username: 'admin',
                    password: 'admin123',
                    name: 'Администратор Системы',
                    role: 'admin',
                    subjects: []
                }
            ];
            StorageManager.saveAppData(appData);
        }
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