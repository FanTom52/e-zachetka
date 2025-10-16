export class Validator {
    static isNotEmpty(value) {
        return value && value.toString().trim().length > 0;
    }

    static isNumber(value) {
        return !isNaN(parseFloat(value)) && isFinite(value);
    }

    static isStrongPassword(password) {
        return password.length >= 6;
    }

    static validateStudent(student) {
        const errors = [];
        if (!this.isNotEmpty(student.name)) errors.push('ФИО студента обязательно');
        if (!this.isNotEmpty(student.group)) errors.push('Группа обязательна');
        return errors;
    }
}