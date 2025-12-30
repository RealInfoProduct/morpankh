import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShellConfirmationDialogComponent } from './shell-confirmation-dialog.component';

describe('ShellConfirmationDialogComponent', () => {
  let component: ShellConfirmationDialogComponent;
  let fixture: ComponentFixture<ShellConfirmationDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ShellConfirmationDialogComponent]
    });
    fixture = TestBed.createComponent(ShellConfirmationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
