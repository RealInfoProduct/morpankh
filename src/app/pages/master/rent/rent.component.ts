import { AfterViewInit, Component, ElementRef, HostListener, Inject, OnInit, Optional, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import {  RentList } from 'src/app/interface/invoice';
import { FirebaseService } from 'src/app/services/firebase.service';
import { LoaderService } from 'src/app/services/loader.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-rent',
  templateUrl: './rent.component.html',
  styleUrls: ['./rent.component.scss']
})
export class RentComponent implements OnInit{
displayedColumns: string[] = [
    'orderno',
    'porduct',
    'customername',
     'pickupdate',
    'returndate',
    'status',
    'mobileno',
     'rent',
    'advance',
    'deposite',
    'return',
    'orderdate',
    'aadharCard',
    'action'
  ];
  rentList :any = []
  allRentProductList:any =[]
  rentDataSource = new MatTableDataSource(this.rentList);
  @ViewChild(MatTable, { static: true }) table: MatTable<any> = Object.create(null);
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator = Object.create(null);

  constructor(private dialog: MatDialog , 
    private firebaseService : FirebaseService ,
    private loaderService : LoaderService,
    private _elementRef: ElementRef,
    private _snackBar: MatSnackBar) { }


  ngOnInit(): void {
    this.getRentList()
    this.getRentProductList()
  }

  applyFilter(filterValue: string): void {
    this.rentDataSource.filter = filterValue.trim().toLowerCase();
  }
  
  getSerialNumber(index: number): number {
    if (!this.paginator) return index + 1;
    return (this.paginator.pageIndex * this.paginator.pageSize) + index + 1;
  }
  
  addParty(action: string, obj: any) {
    obj.action = action;

    const dialogRef = this.dialog.open(rentDialogComponent, 
      { data: obj, width: '1000px' }
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
        

        this.firebaseService.addRent(payload).then((res) => {
          if (res) {
              this.getRentList()
              this.openConfigSnackBar('record create successfully')
            }
        } , (error) => {
          console.log("error=>" , error);
          
        })
      }
      if (result?.event === 'Edit') {
        this.rentList.forEach((element: any) => {
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
              this.firebaseService.updateRent(result.data.id , payload).then((res:any) => {
                  this.getRentList()
                  this.openConfigSnackBar('record update successfully')
              }, (error) => {
                console.log("error => " , error);
                
              })
          }
        });
      }
      if (result?.event === 'Delete') {
        this.firebaseService.deleteRent(result.data.id).then((res:any) => {
            this.getRentList()
            this.openConfigSnackBar('record delete successfully')
        }, (error) => {
          console.log("error => " , error);
          
        })
      }
    });
  }


    getRentProductList() {
    this.loaderService.setLoader(true)
    this.firebaseService.getAllRentProduct().subscribe((res: any) => {
      if (res) {
        this.allRentProductList = res
        this.loaderService.setLoader(false)
      }

    });
  }

  getRentList() {
    this.loaderService.setLoader(true)
    this.firebaseService.getAllRent().subscribe((res: any) => {
      if (res) {
        this.rentList = res.filter((id:any) => id.userId === localStorage.getItem("userId"));
        this.rentList.sort((a:any, b:any) => a.orderDate.seconds - b.orderDate.seconds);
        this.rentDataSource = new MatTableDataSource(this.rentList);
        this.rentDataSource.paginator = this.paginator;
        this.loaderService.setLoader(false)
      }
    })
  }
    getProductnumberName(data :any){
      const findProuct =  this.allRentProductList.find((id:any) => id.id === data.rentProducts)
      return findProuct?.productNumber + '-' + findProuct?.productName
      

    }

  openConfigSnackBar(snackbarTitle: any) {
    this._snackBar.open(snackbarTitle, 'Splash', {
      duration: 2 * 1000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }


onStatusChange(row: any, newStatus: string) {
    row.status = newStatus;
    console.log('Status changed:', row);
  }

  editingRowId: string | null = null;

 enableEdit(rowId: string): void {
    this.editingRowId = rowId;
  }

  saveStatus(row: any, newStatus: string): void {
    row.status = newStatus;
    this.editingRowId = null;
  }

  cancelEdit(): void {
    this.editingRowId = null;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
      this.cancelEdit();
  }
}



@Component({
  selector: 'app-rent-dialog',
  templateUrl: 'rent-dialog.html',
  styleUrls: ['./rent.component.scss']
})

export class rentDialogComponent implements OnInit {
  productForm: FormGroup;
  action: string;
  local_data: any;
  statusList :any = [
    'Pending',
    'In progress',
    'Done'
  ]
  rentProductList:any =[]

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<rentDialogComponent>,
     private firebaseService : FirebaseService ,
    private loaderService : LoaderService,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) {

    this.local_data = { ...data };
    this.action = this.local_data.action;
    
  }
  ngOnInit(): void {
    this.buildForm();
    if (this.action === 'Edit') {
      debugger
      this.productForm.patchValue(this.local_data);
      this.productForm.controls['rentProducts'].setValue(this.local_data.rentProducts.id ? this.local_data.rentProducts.id : this.local_data.rentProducts);
      this.productForm.controls['pickupDateTime'].setValue(new Date(this.local_data.pickupDateTime.seconds * 1000));
      this.productForm.controls['orderDate'].setValue(new Date(this.local_data.orderDate.seconds * 1000));
      this.productForm.controls['returnDateTime'].setValue(new Date(this.local_data.returnDateTime.seconds * 1000));

    }
    this.productForm.controls['status'].setValue('Pending');
    this.productForm.get('deposite')?.valueChanges.subscribe(value => {
      const newValue = this.calculateTotal();
      this.productForm.get('returnAmount')?.setValue(newValue, { emitEvent: false });
    });
    this.getRentProductList()
  }

  buildForm() {
    this.productForm = this.fb.group({
      rentProducts: ['',Validators.required],
      customerName: ['',Validators.required],
      status: ['',Validators.required],
      mobileNumber: ['',Validators.required],
      orderDate: [new Date()],
      pickupDateTime: ['',Validators.required],
      returnDateTime: ['',Validators.required],
      rent: ['',Validators.required],
      advance: ['',Validators.required],
      deposite: ['',Validators.required],
      returnAmount: ['',Validators.required],
      aadharCard: [''],
    })
  }

 calculateTotal(): any {
  const rent = this.productForm.get('rent')?.value || 0;
  const advance = this.productForm.get('advance')?.value || 0;
  const deposite = this.productForm.get('deposite')?.value || 0;
  const total = deposite - advance-rent ;
  return total;

}

  doAction(): void {
    // const payload = {
    //   id: this.local_data.id ? this.local_data.id : '',
    //   customerName: this.productForm.value.customerName,
    //   status: this.productForm.value.status,
    //   mobileNumber: this.productForm.value.mobileNumber,
    //   rent: this.productForm.value.rent,
    //   pickupDateTime: this.productForm.value.pickupDateTime,
    //   advance: this.productForm.value.advance,
    //   returnDateTime: this.productForm.value.returnDateTime,
    //   deposite: this.productForm.value.deposite,
    //   orderDate: this.productForm.value.orderDate,
    //   returnAmount: this.productForm.value.returnAmount,
    //   aadharCard: this.productForm.value.aadharCard,
    //   numberofday: this.productForm.value.numberofday
    // }

    const payload = this.productForm.value
    this.dialogRef.close({ event: this.action, data: payload });
  }

  closeDialog(): void {
    this.dialogRef.close({ event: 'Cancel' });
  }


  getRentProductList() {
    this.loaderService.setLoader(true)
    this.firebaseService.getAllRentProduct().subscribe((res: any) => {
      if (res) {
        this.rentProductList = res.filter((id:any) => id.userId === localStorage.getItem("userId"));
        this.loaderService.setLoader(false)

      }
     
    });
  }

}