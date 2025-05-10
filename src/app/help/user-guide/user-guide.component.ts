import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';


@Component({
  selector: 'app-user-guide',
  standalone: true,
  imports: [CommonModule,HeaderComponent,FooterComponent],
  templateUrl: './user-guide.component.html',
  styleUrls: ['./user-guide.component.scss']
})
export class UserGuideComponent {
  steps = [
    {
      title: 'Create an Account',
      detail: 'Sign up with your email address to start exploring our platform.'
    },
    {
      title: 'Customize Your Search',
      detail: 'Use filters like location, budget, and amenities to refine your results.'
    },
    {
      title: 'Shortlist Favorites',
      detail: 'Add interesting listings to your favorites to compare later.'
    },
    {
      title: 'Contact an Agent',
      detail: 'Get personalized assistance by reaching out to one of our expert agents.'
    }
  ];
}
