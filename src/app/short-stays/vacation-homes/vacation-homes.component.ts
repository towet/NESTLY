import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';


@Component({
  selector: 'app-vacation-homes',
  standalone: true,
  imports: [CommonModule,HeaderComponent,FooterComponent],
  templateUrl: './vacation-homes.component.html',
  styleUrls: ['./vacation-homes.component.scss']
})
export class VacationHomesComponent implements OnInit {
  listings: any[] = [];
  isLoading = true;

  ngOnInit() {
    // Simulate "Airbnb & Short-Term Rentals" subcategory: "Vacation Homes"
    setTimeout(() => {
      this.listings = [
        {
          title: 'Beachfront Cottage',
          nightlyRate: 7000,
          location: 'Diani Beach'
        },
        {
          title: 'Mountain Cabin',
          nightlyRate: 5500,
          location: 'Mt. Kenya Region'
        }
      ];
      this.isLoading = false;
    }, 1000);
  }
}
