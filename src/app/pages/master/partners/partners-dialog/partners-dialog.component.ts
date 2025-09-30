import { Component, Inject, OnInit, Optional } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-partners-dialog',
  templateUrl: './partners-dialog.component.html',
  styleUrls: ['./partners-dialog.component.scss']
})
export class PartnersDialogComponent implements OnInit {
  partnersForm: FormGroup;
  action: string;
  local_data: any;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<PartnersDialogComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) {

    this.local_data = { ...data };
    this.action = this.local_data.action;
    
  }
  ngOnInit(): void {
    this.buildForm()
    if (this.action === 'Edit') {
      this.partnersForm.controls['firstName'].setValue(this.local_data.firstName)
      this.partnersForm.controls['middleName'].setValue(this.local_data.middleName)
      this.partnersForm.controls['lastName'].setValue(this.local_data.lastName)
      this.partnersForm.controls['lastName'].setValue(this.local_data.lastName)
      this.partnersForm.controls['mobileNumber'].setValue(this.local_data.mobileNumber)
    }
  }

  buildForm() {
    this.partnersForm = this.fb.group({
      firstName: ['',Validators.required],
      lastName: ['',Validators.required],
      middleName: ['',Validators.required],
      mobileNumber: ['',Validators.required],
    })
  }

  doAction(): void {
    const payload = {
      id: this.local_data.id ? this.local_data.id : '',
      firstName: this.partnersForm.value.firstName,
      middleName: this.partnersForm.value.middleName,
      lastName: this.partnersForm.value.lastName,
      mobileNumber: this.partnersForm.value.mobileNumber,
    }
    this.dialogRef.close({ event: this.action, data: payload });
  }

  closeDialog(): void {
    this.dialogRef.close({ event: 'Cancel' });
  }
}