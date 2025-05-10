// contact-support.component.ts
import { Component, AfterViewInit, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';

@Component({
  selector: 'app-contact-support',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, FooterComponent],
  templateUrl: './contact-support.component.html',
  styleUrls: ['./contact-support.component.scss']
})
export class ContactSupportComponent implements OnInit, AfterViewInit, OnDestroy {
  name = '';
  email = '';
  message = '';
  newsletter = false;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';
  activeOption = 'support'; // Default option
  formProgress = 0;
  observer: IntersectionObserver | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.updateFormProgress();
  }

  ngAfterViewInit() {
    this.initScrollReveal();
  }

  initScrollReveal() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          this.observer?.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      rootMargin: '0px',
      threshold: 0.15
    });

    // Target all elements with scroll-reveal class
    document.querySelectorAll('.scroll-reveal').forEach(el => {
      this.observer?.observe(el);
    });
  }

  setActiveOption(option: string) {
    this.activeOption = option;
    
    // Update subject based on selected option
    switch(option) {
      case 'support':
        // You could set a default message template here if desired
        break;
      case 'feedback':
        // You could set a default message template here if desired
        break;
      case 'inquiry':
        // You could set a default message template here if desired
        break;
    }
  }

  updateFormProgress() {
    let filledFields = 0;
    let totalFields = 3; // name, email, message
    
    if (this.name.trim()) filledFields++;
    if (this.email.trim()) filledFields++;
    if (this.message.trim()) filledFields++;
    
    this.formProgress = Math.round((filledFields / totalFields) * 100);
  }

  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  onSubmit() {
    // Reset messages
    this.errorMessage = '';
    this.successMessage = '';

    // Validate fields
    if (!this.name.trim() || !this.email.trim() || !this.message.trim()) {
      this.errorMessage = 'Please fill out all the required fields.';
      return;
    }

    // Validate email
    if (!this.validateEmail(this.email)) {
      this.errorMessage = 'Please enter a valid email address.';
      return;
    }

    this.isSubmitting = true;

    // Include the selected contact option and newsletter preference in submission
    this.http.post('https://us-central1-personal-a9a71.cloudfunctions.net/sendSupportEmail', {
      name: this.name.trim(),
      email: this.email.trim(),
      message: this.message.trim(),
      type: this.activeOption,
      newsletter: this.newsletter
    }).subscribe({
      next: (response: any) => {
        this.successMessage = 'Your request has been submitted successfully! We\'ll get back to you soon.';
        this.resetForm();
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Error submitting form:', error);
        this.errorMessage = 'Failed to submit your request. Please try again later.';
        this.isSubmitting = false;
      }
    });
  }

  resetForm() {
    this.name = '';
    this.email = '';
    this.message = '';
    this.newsletter = false;
    this.formProgress = 0;
  }

  ngOnDestroy() {
    // Clean up observer when component is destroyed
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}
