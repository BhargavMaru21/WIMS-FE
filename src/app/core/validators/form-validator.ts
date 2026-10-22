import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';


export function emailValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        if (!control.value) return null;
        const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return pattern.test(control.value.trim())
            ? null
            : { invalidEmail: true };
    };
}

export function passwordValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        if (!control.value) return null;
        const val: string = control.value;
        const errors: Record<string, boolean> = {};

        if (val.length < 8) errors['minLength'] = true;
        if (!/[a-z]/.test(val)) errors['lowercase'] = true;
        if (!/[A-Z]/.test(val)) errors['uppercase'] = true;
        if (!/\d/.test(val)) errors['digit'] = true;
        if (!/[\W_]/.test(val)) errors['special'] = true;

        return Object.keys(errors).length ? { strongPassword: errors } : null;
    };
}


export function getEmailError(control: AbstractControl | null): string {
    if (!control || (!control.touched)) return ''; 
    if (control.errors?.['required']) return 'Email address is required';
    if (control.errors?.['invalidEmail']) return 'Enter a valid email address (e.g. you@company.com)';
    return '';
}

export function getPasswordError(control: AbstractControl | null): string {
    if (!control || (!control.touched)) return '';
    if (control.errors?.['required']) return 'Password is required';

    const sp = control.errors?.['strongPassword'];
    if (sp) {
        if (sp['minLength']) return 'Password must be at least 8 characters';
        if (sp['lowercase']) return 'Must contain at least one lowercase letter (a–z)';
        if (sp['uppercase']) return 'Must contain at least one uppercase letter (A–Z)';
        if (sp['digit']) return 'Must contain at least one number (0–9)';
        if (sp['special']) return 'Must contain at least one special character (!@#$%^&*...)';
    }

    return '';
}

export function getConfirmPasswordError(
    control: AbstractControl | null,
    group: AbstractControl | null,
): string {
    if (!control || !control.touched) return '';
    if (control.errors?.['required']) return 'Please confirm your password';
    if (group?.errors?.['passwordMismatch']) return 'Passwords do not match';
    return '';
}