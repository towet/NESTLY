import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';


@Component({
  selector: 'app-market-trends',
  standalone: true,
  imports: [CommonModule, HeaderComponent,FooterComponent],
  templateUrl: './market-trends.component.html',
  styleUrls: ['./market-trends.component.scss']
})
export class MarketTrendsComponent implements OnInit {



  ngOnInit() {
    
  }


}
