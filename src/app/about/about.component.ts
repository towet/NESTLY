import { Component, AfterViewInit, ElementRef, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../shared/components/header/header.component';
import { FooterComponent } from '../shared/components/footer/footer.component';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements AfterViewInit {
  // For the watermark animation
  @ViewChild('watermark') watermark!: ElementRef;

  // For the floating scroll-to-top button progress fill effect
  scrollPercent = 0;

  // For the tilt effect on the image
  @ViewChild('tiltImage') tiltImage!: ElementRef;
  @ViewChild('tiltContainer') tiltContainer!: ElementRef;

  // For the CTA section "pop-in" effect
  @ViewChild('ctaSection') ctaSection!: ElementRef;

  // Getter for the conic gradient (scroll-to-top button)
  get conicGradientValue(): string {
    return `conic-gradient(#000 ${this.scrollPercent}%, #e5e7eb ${this.scrollPercent}% 100%)`;
  }

  ngAfterViewInit() {
    // --- Watermark Animation ---
    const watermarkEl = this.watermark.nativeElement;
    const watermarkObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          watermarkEl.classList.add('animate');
        } else {
          watermarkEl.classList.remove('animate');
        }
      });
    }, { threshold: 0.5 });
    watermarkObserver.observe(watermarkEl);

    // --- CTA Section Pop-in Animation ---
    const ctaEl = this.ctaSection.nativeElement;
    const ctaObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          ctaEl.classList.add('visible');
        } else {
          ctaEl.classList.remove('visible');
        }
      });
    }, { threshold: 0.3 });
    ctaObserver.observe(ctaEl);
  }

  // Listen for window scroll to update the scroll percentage
  @HostListener('window:scroll', [])
  onWindowScroll() {
    const docElem = document.documentElement;
    const scrollTop = docElem.scrollTop || document.body.scrollTop;
    const scrollHeight = docElem.scrollHeight - docElem.clientHeight;
    this.scrollPercent = (scrollTop / scrollHeight) * 100;
  }

  // Smooth scroll-to-top when button is clicked
  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Tilt effect: update image transform based on mouse position
  onImageMouseMove(event: MouseEvent) {
    const container = this.tiltContainer.nativeElement;
    const image = this.tiltImage.nativeElement;
    const rect = container.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const deltaX = (x - centerX) / centerX;
    const deltaY = (y - centerY) / centerY;
    // Increase the multiplier for a stronger tilt effect:
    const rotateY = deltaX * 30;
    const rotateX = -deltaY * 30;
    image.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  }

  // Reset the image transform when the mouse leaves the container
  onImageMouseLeave() {
    this.tiltImage.nativeElement.style.transform = 'rotateX(0deg) rotateY(0deg)';
  }
}
