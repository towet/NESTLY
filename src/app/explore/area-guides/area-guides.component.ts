import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { HeaderComponent } from '../../shared/components/header/header.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';


@Component({
  selector: 'app-area-guides',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, FooterComponent],
  templateUrl: './area-guides.component.html',
  styleUrls: ['./area-guides.component.scss']
})
export class AreaGuidesComponent implements OnInit {


  ngOnInit() {
   
  }

}
