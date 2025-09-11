import { Component, Inject, OnInit, Optional, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { RentList } from 'src/app/interface/invoice';
import { FirebaseService } from 'src/app/services/firebase.service';
import { LoaderService } from 'src/app/services/loader.service';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit {
  accountList: any = [];

  displayedColumns=[
    'srNo',
    'name',
    'bank',
    'accountnumber',
    'type',
  ]
   accountDataSource = new MatTableDataSource(this.accountList);
   @ViewChild(MatTable, { static: true }) table: MatTable<any> = Object.create(null);
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator = Object.create(null);

  constructor(private dialog: MatDialog,
     private firebaseService : FirebaseService ,
        private loaderService : LoaderService,
        private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
   this.getAccountList()
  }

  applyFilter(filterValue: string): void {
    this.accountDataSource.filter = filterValue.trim().toLowerCase();
  }

  addaccount(action: string, obj: any) {
    obj.action = action;

    const dialogRef = this.dialog.open(accountDialogComponent,
      { data: obj, width: '500px' }
    );

    dialogRef.afterClosed().subscribe((result) => {
          if (result?.event === 'Add') {
            const payload: RentList = {
              id:'',
              rentProducts: result.data.rentProducts,
              customerName: result.data.customerName,
              status: result.data.status,
              mobileNumber: result.data.mobileNumber,
              rent: result.data.rent,
              pickupDateTime: result.data.pickupDateTime,
              advance: result.data.advance,
              returnDateTime: result.data.returnDateTime,
              deposite: result.data.deposite,
              orderDate: result.data.orderDate,
              returnAmount: result.data.returnAmount,
              aadharCard: result.data.aadharCard,
              userId : localStorage.getItem("userId")
            }
            console.log(payload);
            
    
            // this.firebaseService.addRent(payload).then((res) => {
            //   if (res) {
            //       this.getAccountList()
            //       this.openConfigSnackBar('record create successfully')
            //     }
            // } , (error) => {
            //   console.log("error=>" , error);
              
            // })
          }
          if (result?.event === 'Edit') {
            this.accountList.forEach((element: any) => {
              if (element.id === result.data.id) {
                const payload: RentList = {
                  id: result.data.id,
                  rentProducts: result.data.rentProducts,
                  customerName: result.data.customerName,
                  status: result.data.status,
                  mobileNumber: result.data.mobileNumber,
                  rent: result.data.rent,
                  pickupDateTime: result.data.pickupDateTime,
                  advance: result.data.advance,
                  returnDateTime: result.data.returnDateTime,
                  deposite: result.data.deposite,
                  orderDate: result.data.orderDate,
                  returnAmount: result.data.returnAmount,
                  aadharCard: result.data.aadharCard,
                  userId : localStorage.getItem("userId")
                }
                  // this.firebaseService.updateRent(result.data.id , payload).then((res:any) => {
                  //     this.getAccountList()
                  //     this.openConfigSnackBar('record update successfully')
                  // }, (error) => {
                  //   console.log("error => " , error);
                    
                  // })
              }
            });
          }
          if (result?.event === 'Delete') {
            // this.firebaseService.deleteRent(result.data.id).then((res:any) => {
            //   this.getAccountList()
            //     this.openConfigSnackBar('record delete successfully')
            // }, (error) => {
            //   console.log("error => " , error);
              
            // })
          }
        });

  }

   getAccountList() {
    this.loaderService.setLoader(true)
    this.firebaseService.getAllRent().subscribe((res: any) => {
      if (res) {
        this.accountList = res.filter((id:any) => id.userId === localStorage.getItem("userId"));
        this.accountList.sort((a:any, b:any) => a.orderDate.seconds - b.orderDate.seconds);
        this.accountDataSource = new MatTableDataSource(this.accountList);
        this.accountDataSource.paginator = this.paginator;
        this.loaderService.setLoader(false)
      }
    })
  }
  
   openConfigSnackBar(snackbarTitle: any) {
    this._snackBar.open(snackbarTitle, 'Splash', {
      duration: 2 * 1000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }


}



@Component({
  selector: 'app-account-dialog',
  templateUrl: 'account-dialog.html',
  styleUrls: ['./account.component.scss']
})

export class accountDialogComponent implements OnInit {
  action: any;
  accountForm: FormGroup;
  local_data: any;

  accounttype: any = [
    { type: 'Cash' },
    { type: 'G-Pay' }
  ]

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<accountDialogComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.local_data = { ...data };
    this.action = this.local_data.action;
  }

  ngOnInit(): void {
    this.accountformlist()
  }

  accountformlist() {
    this.accountForm = this.fb.group({
      name: [''],
      bank: [''],
      accountNumber: [''],
      type: [''],
    })
  }


  doAction() {
    const payload = this.accountForm.value;
    this.dialogRef.close({ event: this.action, data: payload })
  }

  closeDialog() {
    this.dialogRef.close({ event: 'Cancel' });
  }

}