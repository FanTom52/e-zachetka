import { StorageManager } from '../utils/storage.js';
import { Helpers } from '../utils/helpers.js';

export class ReportsManager {
    constructor(studentsManager, gradesManager, subjectsManager) {
        this.students = studentsManager;
        this.grades = gradesManager;
        this.subjects = subjectsManager;
    }

    generateGradeSheet() {
        const stats = this.grades.calculateOverallStatistics();
        const groups = [...new Set(this.students.getAllStudents().map(s => s.group))];
        
        let html = `
            <div class="report-header text-center mb-4">
                <h2 class="report-title">ВЕДОМОСТЬ УСПЕВАЕМОСТИ</h2>
                <p class="report-subtitle">Техникум информационных технологий</p>
                <div class="report-meta">
                    <div>Дата формирования: ${new Date().toLocaleDateString('ru-RU')}</div>
                    <div>Всего студентов: ${stats.totalStudents}</div>
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

        groups.forEach(group => {
            const groupStudents = this.students.getAllStudents().filter(s => s.group === group);
            
            html += `
                <h4 class="mt-4 mb-3">Группа: ${group}</h4>
                <div class="table-responsive">
                    <table class="table table-bordered report-table">
                        <thead class="table-light">
                            <tr>
                                <th>ФИО студента</th>
                                ${this.subjects.getAllSubjects().map(subject => 
                                    `<th class="text-center">${subject.name}</th>`
                                ).join('')}
                                <th class="text-center">Средний балл</th>
                            </tr>
                        </thead>
                        <tbody>
            `;
            
            groupStudents.forEach(student => {
                const studentStats = this.students.getStudentStatistics(student.id);
                const studentGrades = this.students.getStudentGrades(student.id);
                
                html += `
                    <tr>
                        <td><strong>${student.name}</strong></td>
                `;
                
                this.subjects.getAllSubjects().forEach(subject => {
                    const grade = studentGrades.find(g => g.subjectId === subject.id);
                    const gradeValue = grade ? grade.grade : '';
                    const gradeClass = Helpers.getGradeClass(gradeValue);
                    
                    html += `<td class="text-center ${gradeClass}">${gradeValue}</td>`;
                });
                
                html += `<td class="text-center"><strong>${studentStats.averageGrade}</strong></td>`;
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

    generateStudentReport(studentId) {
        const student = this.students.getStudentById(studentId);
        if (!student) return '<p>Студент не найден</p>';

        const stats = this.students.getStudentStatistics(studentId);
        const allSubjects = this.subjects.getAllSubjects();
        
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
        
        allSubjects.forEach(subject => {
            const grade = this.students.getStudentGrades(studentId).find(g => g.subjectId === subject.id);
            const gradeValue = grade ? grade.grade : '-';
            const gradeClass = Helpers.getGradeClass(gradeValue);
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
        `;

        return html;
    }

    findStudentsWithDebts() {
        const students = this.students.getAllStudents();
        const subjects = this.subjects.getAllSubjects();
        
        return students
            .map(student => {
                const studentGrades = this.students.getStudentGrades(student.id);
                const gradedSubjects = new Set(studentGrades.map(g => g.subjectId));
                const debtSubjects = subjects.filter(s => !gradedSubjects.has(s.id));
                
                return {
                    student: student,
                    debtSubjects: debtSubjects,
                    debtCount: debtSubjects.length
                };
            })
            .filter(item => item.debtCount > 0)
            .sort((a, b) => b.debtCount - a.debtCount);
    }

    generateDebtsReport() {
        const studentsWithDebts = this.findStudentsWithDebts();
        
        if (studentsWithDebts.length === 0) {
            return {
                hasDebts: false,
                html: '<div class="alert alert-success">Все студенты имеют оценки по всем предметам</div>'
            };
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
        
        studentsWithDebts.forEach(({ student, debtSubjects, debtCount }) => {
            html += `
                <tr>
                    <td>${student.name}</td>
                    <td><span class="badge bg-secondary">${student.group}</span></td>
                    <td><span class="badge bg-danger">${debtCount}</span></td>
                    <td>${debtSubjects.map(s => s.name).join(', ')}</td>
                </tr>
            `;
        });
        
        html += `
                    </tbody>
                </table>
            </div>
        `;

        return {
            hasDebts: true,
            html: html,
            data: studentsWithDebts
        };
    }

    exportDebtsToCSV() {
        const debtsReport = this.generateDebtsReport();
        if (!debtsReport.hasDebts) return null;

        let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
        csvContent += "Отчёт по академическим долгам\r\n";
        csvContent += `Сгенерировано: ${new Date().toLocaleDateString()}\r\n`;
        csvContent += "\r\n";
        csvContent += "Студент;Группа;Количество долгов;Предметы\r\n";
        
        debtsReport.data.forEach(({ student, debtSubjects, debtCount }) => {
            csvContent += `${student.name};${student.group};${debtCount};"${debtSubjects.map(s => s.name).join(', ')}"\r\n`;
        });
        
        return csvContent;
    }
}