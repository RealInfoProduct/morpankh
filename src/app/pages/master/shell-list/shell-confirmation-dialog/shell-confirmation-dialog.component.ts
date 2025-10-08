import { Component, Inject, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-shell-confirmation-dialog',
  templateUrl: './shell-confirmation-dialog.component.html',
  styleUrls: ['./shell-confirmation-dialog.component.scss']
})
export class ShellConfirmationDialogComponent {

  constructor(   public dialogRef: MatDialogRef<ShellConfirmationDialogComponent>,
      @Optional() @Inject(MAT_DIALOG_DATA) public data: any) {
  }


  closeShellDailog() {
    this.dialogRef.close({ data: this.data });
  }

}
