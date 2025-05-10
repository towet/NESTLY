import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contact-us',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact-us.component.html',
  styleUrls: ['./contact-us.component.scss']
})
export class ContactUsComponent {
  // You can add any additional properties if needed

  onSubmit(event: Event): void {
    event.preventDefault();
    // Add form submission logic here.
    console.log("Contact form submitted");
  }
}
