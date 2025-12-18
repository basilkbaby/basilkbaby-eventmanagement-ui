import { AbstractControl, ValidationErrors } from "@angular/forms";

export function emailMatchValidator(control: AbstractControl): ValidationErrors | null {
  const email = control.get('email');
  const confirmEmail = control.get('confirmEmail');
  
  if (email && confirmEmail && email.value !== confirmEmail.value) {
    confirmEmail.setErrors({ emailMatch: true });
    return { emailMatch: true };
  } else {
    if (confirmEmail?.hasError('emailMatch')) {
      confirmEmail.setErrors(null);
    }
    return null;
  }
}