import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { StockKeeperDashboardComponent } from './stock-keeper-dashboard';
import { DashboardService } from '../services/dashboard.service';

describe('StockKeeperDashboardComponent', () => {
  let component: StockKeeperDashboardComponent;
  let fixture: ComponentFixture<StockKeeperDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StockKeeperDashboardComponent],
      providers: [provideRouter([]), DashboardService],
    }).compileComponents();

    fixture = TestBed.createComponent(StockKeeperDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
