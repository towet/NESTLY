import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarketTrendsComponent } from './market-trends.component';

describe('MarketTrendsComponent', () => {
  let component: MarketTrendsComponent;
  let fixture: ComponentFixture<MarketTrendsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MarketTrendsComponent]
    });
    fixture = TestBed.createComponent(MarketTrendsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
