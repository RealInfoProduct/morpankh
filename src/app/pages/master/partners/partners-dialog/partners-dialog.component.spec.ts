import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartnersDialogComponent } from './partners-dialog.component';

describe('PartnersDialogComponent', () => {
  let component: PartnersDialogComponent;
  let fixture: ComponentFixture<PartnersDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PartnersDialogComponent]
    });
    fixture = TestBed.createComponent(PartnersDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
