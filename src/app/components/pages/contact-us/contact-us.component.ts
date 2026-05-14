import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-contact-us',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './contact-us.component.html',
  styleUrls: ['./contact-us.component.scss']
})
export class ContactUsComponent {

  form = { name: '', email: '', subject: '', message: '' };
  sending  = false;
  submitted = false;
  error: string | null = null;

  constructor(private http: HttpClient) {}

  onSubmit(): void {
    if (!this.form.name || !this.form.email || !this.form.subject || !this.form.message) return;

    this.sending = true;
    this.error   = null;

    this.http.post(`${environment.apiUrl}/api/contact`, this.form).subscribe({
      next: () => {
        this.sending   = false;
        this.submitted = true;
      },
      error: () => {
        this.sending = false;
        this.error   = 'Something went wrong. Please try again or email us directly.';
      }
    });
  }
}