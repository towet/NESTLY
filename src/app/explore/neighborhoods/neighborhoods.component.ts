
// Then define your component
import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';


@Component({
  selector: 'app-neighborhoods',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HeaderComponent,
    FooterComponent
  ],
  templateUrl: './neighborhoods.component.html',
  styleUrls: ['./neighborhoods.component.scss']
})
export class NeighborhoodsComponent implements OnInit {


  ngOnInit() {
    // Initialize component logic
  }
}
