import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatDialogModule } from '@angular/material/dialog';
import { ScrollService } from './services/scroll.service';
import { HeaderComponent } from './shared/components/header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    MatDialogModule,
    HeaderComponent,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'nestify-web';
  
  constructor(private scrollService: ScrollService) {}
  
  ngOnInit() {
    // The scroll service is automatically initialized and will scroll to top on navigation
  }
}
