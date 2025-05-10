import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent],
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss']
})
export class FaqComponent {
  faqs = [
    {
      question: 'How do I list my property?',
      answer: 'Use our agent listing submission form to add property details, images, and pricing.'
    },
    {
      question: 'Can I book a vacation home online?',
      answer: 'Yes, simply find a short-stay listing and follow the booking instructions provided.'
    },
    {
      question: 'What if I need to contact support?',
      answer: 'Go to “Contact Support” under the Help section, and fill out the form with your query.'
    }
  ];

  toggleAnswer(index: number) {
    // Optionally expand/collapse answers
    // For a simple static FAQ, you can skip this
  }
}
