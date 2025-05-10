import { fromEvent } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

export class AnimationHandler {
  constructor() {
    this.initScrollAnimations();
    this.initParallax();
  }

  private initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal, .stagger-children, .section-transition')
      .forEach(el => observer.observe(el));
  }

  private initParallax() {
    fromEvent(window, 'scroll')
      .pipe(debounceTime(10))
      .subscribe(() => {
        document.querySelectorAll('.parallax-element').forEach(el => {
          const speed = el.getAttribute('data-speed') || '0.5';
          const yPos = -(window.scrollY * Number(speed));
          el.setAttribute('style', `transform: translateY(${yPos}px)`);
        });
      });
  }
}
