// src/app/shared/services/modal.service.ts
import { Injectable, ComponentRef, createComponent, ApplicationRef, Injector, EmbeddedViewRef, Type } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private modalContainer: HTMLElement | null = null;
  private currentComponent: ComponentRef<any> | null = null;
  private modalStateSubject = new BehaviorSubject<boolean>(false);

  constructor(
    private appRef: ApplicationRef,
    private injector: Injector
  ) {
    this.setupModalContainer();
  }

  private setupModalContainer() {
    this.modalContainer = document.createElement('div');
    this.modalContainer.className = 'modal-container';
    document.body.appendChild(this.modalContainer);
  }

  open<T>(component: Type<T>): Observable<any> {
    if (this.currentComponent) {
      this.close();
    }

    this.modalStateSubject.next(true);
    this.currentComponent = createComponent(component, {
      environmentInjector: this.appRef.injector,
      elementInjector: this.injector
    });

    this.appRef.attachView(this.currentComponent.hostView);
    const domElem = (this.currentComponent.hostView as EmbeddedViewRef<any>).rootNodes[0];
    this.modalContainer?.appendChild(domElem);

    return new Observable(observer => {
      const instance = this.currentComponent?.instance;
      if (instance) {
        instance.close = (result: any) => {
          observer.next(result);
          observer.complete();
          this.close();
        };
      }
    });
  }

  close() {
    if (this.currentComponent) {
      this.appRef.detachView(this.currentComponent.hostView);
      this.currentComponent.destroy();
      this.currentComponent = null;
      this.modalStateSubject.next(false);
    }
  }

  isOpen(): Observable<boolean> {
    return this.modalStateSubject.asObservable();
  }
}
