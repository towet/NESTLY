// src/app/shared/components/lightbox-modal/lightbox-modal.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-lightbox-modal',
  standalone: true,
  imports: [CommonModule, NgbModule],
  template: `
    <div class="lightbox-wrapper">
      <button class="close-btn" (click)="activeModal.dismiss()">&times;</button>

      <ngb-carousel
      [interval]="0"
      [keyboard]="true"
      [pauseOnHover]="false"
      [showNavigationIndicators]="false"
    
      [activeId]="slideId"                 
      (slide)="slideId = $event.current"   
    >
      <ng-template ngbSlide
                   *ngFor="let img of images; let i = index"
                   id="slide-{{ i }}">
        <img [src]="img"
             alt="property image {{ i + 1 }}"
             class="d-block w-100 full-img" />
      </ng-template>
    </ngb-carousel>
    
    </div>
  `,
  styles: [
    `
      .lightbox-wrapper {
        position: relative;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.92);
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .full-img {
        max-height: 100vh;
        object-fit: contain;
      }

      .close-btn {
        position: absolute;
        top: 1rem;
        right: 1.2rem;
        font-size: 2.25rem;
        background: transparent;
        border: none;
        color: #ffffff;
        cursor: pointer;
        z-index: 10;
      }
    `,
  ],
})
export class LightboxModalComponent implements OnInit {
  /** Image URLs passed in by the parent */
  @Input() images: string[] = [];

  /** Where we should start */
  @Input() startIndex = 0;

  slideId = 'slide-0';

  constructor(public activeModal: NgbActiveModal) {}

  ngOnInit() {
    this.slideId = `slide-${this.startIndex}`;
  }
}
