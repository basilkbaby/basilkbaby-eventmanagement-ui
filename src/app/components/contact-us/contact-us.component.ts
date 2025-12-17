// contact-us.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-contact-us',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './contact-us.component.html',
  styleUrls: ['./contact-us.component.scss']
})
export class ContactUsComponent implements OnInit {
  private breakpointObserver = inject(BreakpointObserver);
  private fb = inject(FormBuilder);
  
  isMobile = false;
  isSubmitted = false;
  isLoading = false;

  contactForm: FormGroup;

  contactInfo = {
    email: 'info@v4entertainments.co.uk',
    phone: '+44 20 1234 5678',
    address: 'London, United Kingdom',
    hours: 'Monday - Friday: 9AM - 6PM',
    emergency: '+44 20 8765 4321 (Events Only)'
  };

  departments = [
    {
      icon: '🎤',
      title: 'Artist Booking',
      email: 'booking@v4entertainments.co.uk',
      description: 'For artist inquiries and concert bookings'
    },
    {
      icon: '🎫',
      title: 'Ticketing',
      email: 'tickets@v4entertainments.co.uk',
      description: 'Ticket sales and customer support'
    },
    {
      icon: '🤝',
      title: 'Partnerships',
      email: 'partners@v4entertainments.co.uk',
      description: 'Corporate partnerships and sponsorships'
    },
    {
      icon: '📢',
      title: 'Press & Media',
      email: 'press@v4entertainments.co.uk',
      description: 'Media inquiries and press releases'
    }
  ];

  faqs = [
    {
      question: 'How do I book tickets for upcoming concerts?',
      answer: 'Tickets can be purchased through our website, or by contacting our ticketing department. We recommend booking early as Malayali concerts often sell out quickly.'
    },
    {
      question: 'Can I request a specific artist to perform in the UK?',
      answer: 'Yes! We welcome artist suggestions. Please use the contact form below or email our booking department with your request.'
    },
    {
      question: 'What is your refund policy?',
      answer: 'Refunds are available up to 48 hours before the event. Please contact our ticketing department for assistance.'
    },
    {
      question: 'Do you organize private events?',
      answer: 'Yes, we specialize in private Malayali events including weddings, celebrations, and corporate functions. Contact us for custom event planning.'
    }
  ];

  constructor() {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.pattern('^[0-9+ ]*$')]],
      subject: ['', Validators.required],
      department: ['general'],
      message: ['', [Validators.required, Validators.minLength(10)]],
      subscribe: [true]
    });
  }

  ngOnInit() {
    this.breakpointObserver.observe([Breakpoints.HandsetPortrait])
      .subscribe(result => {
        this.isMobile = result.matches;
      });
  }

  onSubmit() {
    if (this.contactForm.valid) {
      this.isLoading = true;
      
      // Simulate API call
      setTimeout(() => {
        console.log('Form submitted:', this.contactForm.value);
        this.isLoading = false;
        this.isSubmitted = true;
        this.contactForm.reset();
        this.contactForm.patchValue({ subscribe: true, department: 'general' });
      }, 1500);
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.contactForm.controls).forEach(key => {
        const control = this.contactForm.get(key);
        control?.markAsTouched();
      });
    }
  }

  getDepartmentEmail(department: string): string {
    const dept = this.departments.find(d => 
      d.title.toLowerCase().includes(department.toLowerCase()) || 
      department.toLowerCase().includes(d.title.toLowerCase())
    );
    return dept ? dept.email : this.contactInfo.email;
  }
}