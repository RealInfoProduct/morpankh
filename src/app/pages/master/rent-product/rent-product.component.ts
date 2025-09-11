import { Component, Inject, OnInit, Optional, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { ProductList, RentProductList } from 'src/app/interface/invoice';
import { FirebaseService } from 'src/app/services/firebase.service';
import { LoaderService } from 'src/app/services/loader.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-rent-product',
  templateUrl: './rent-product.component.html',
  styleUrls: ['./rent-product.component.scss']
})
export class RentProductComponent {
displayedColumns: string[] = [
    'productNumber',
    'ProductName',
    'rent',
    'action',
  ];
  rentProductList :any = []
  productDataSource = new MatTableDataSource(this.rentProductList);
  @ViewChild(MatTable, { static: true }) table: MatTable<any> = Object.create(null);
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator = Object.create(null);

  constructor(private dialog: MatDialog , 
    private firebaseService : FirebaseService ,
    private loaderService : LoaderService,
    private _snackBar: MatSnackBar,) { }


  ngOnInit(): void {
  this.getRentProductList()
  }

  applyFilter(filterValue: string): void {
    this.productDataSource.filter = filterValue.trim().toLowerCase();
  }
  
  getSerialNumber(index: number): number {
    if (!this.paginator) return index + 1;
    return (this.paginator.pageIndex * this.paginator.pageSize) + index + 1;
  }
  
  addParty(action: string, obj: any) {
    obj.action = action;

    const dialogRef = this.dialog.open(rentproductMasterDialogComponent, { data: obj });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.event === 'Add') {
        const payload: RentProductList = {
          id: '',
          productNumber: result.data.productNumber,
          productName: result.data.productName,
          rent: result.data.rent,
          userId : localStorage.getItem("userId")
        }

        this.firebaseService.addRentProduct(payload).then((res:any) => {
          if (res) {
              this.getRentProductList()
              this.openConfigSnackBar('record create successfully')
            }
        } , (error: any) => {
          console.log("error=>" , error);
          
        })
      }
      if (result?.event === 'Edit') {
        this.rentProductList.forEach((element: any) => {
          if (element.id === result.data.id) {
            const payload: RentProductList = {
              id: result.data.id,
              productNumber: result.data.productNumber,
              productName: result.data.productName,
              rent: result.data.rent,
              userId : localStorage.getItem("userId")
            }
              this.firebaseService.updateRentProduct(result.data.id , payload).then((res:any) => {
                  this.getRentProductList()
                  this.openConfigSnackBar('record update successfully')
              }, (error) => {
                console.log("error => " , error);
                
              })
          }
        });
      }
      if (result?.event === 'Delete') {
        this.firebaseService.deleteRentProduct(result.data.id).then((res:any) => {
            this.getRentProductList()
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
        this.rentProductList = res.filter((id:any) => id.userId === localStorage.getItem("userId"))
        this.productDataSource = new MatTableDataSource(this.rentProductList);
        this.productDataSource.paginator = this.paginator;
        this.loaderService.setLoader(false)
      }
    });
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
  selector: 'app-product-master-dialog',
  templateUrl: 'rent-product-master-dialog.html',
  styleUrls: ['./rent-product.component.scss']
})

export class rentproductMasterDialogComponent implements OnInit {
  rentproductForm: FormGroup;
  action: string;
  local_data: any;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<rentproductMasterDialogComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) {

    this.local_data = { ...data };
    this.action = this.local_data.action;
    
  }
  ngOnInit(): void {
    this.buildForm()
    if (this.action === 'Edit') {
      this.rentproductForm.controls['productNumber'].setValue(this.local_data.productNumber)
      this.rentproductForm.controls['productName'].setValue(this.local_data.productName)
      this.rentproductForm.controls['rent'].setValue(this.local_data.rent)
      this.rentproductForm.controls['id'].setValue(this.local_data.id)
    }
  }

  buildForm() {
    this.rentproductForm = this.fb.group({
      productNumber: ['',Validators.required],
      productName: ['',Validators.required],
      rent: ['',Validators.required],
      id: ['']
    })
  }

  doAction(): void {
    const payload = this.rentproductForm.value
    this.dialogRef.close({ event: this.action, data: payload });
  }

  closeDialog(): void {
    this.dialogRef.close({ event: 'Cancel' });
  }
}