import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

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

  onSubmit(): void {
    if (!this.form.name || !this.form.email || !this.form.subject || !this.form.message) return;

    this.sending = true;

    // Replace with your actual API call / EmailJS / etc.
    setTimeout(() => {
      this.sending   = false;
      this.submitted = true;
    }, 1200);
  }
}