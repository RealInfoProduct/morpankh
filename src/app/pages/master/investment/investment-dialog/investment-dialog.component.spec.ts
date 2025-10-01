import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvestmentDialogComponent } from './investment-dialog.component';

describe('InvestmentDialogComponent', () => {
  let component: InvestmentDialogComponent;
  let fixture: ComponentFixture<InvestmentDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InvestmentDialogComponent]
    });
    fixture = TestBed.createComponent(InvestmentDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
