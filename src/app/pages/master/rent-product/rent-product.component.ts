import { Component, HostListener, Inject, OnInit, Optional, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { ProductList, RentProductList } from 'src/app/interface/invoice';
import { FirebaseService } from 'src/app/services/firebase.service';
import { LoaderService } from 'src/app/services/loader.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { MatDateRangePicker } from '@angular/material/datepicker';
import { BreakpointService } from 'src/app/services/breakpoint.service';

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
  isMobile: boolean = false;
    subcription = new Subscription();
  productDataSource = new MatTableDataSource<any>(this.rentProductList);
  @ViewChild(MatTable, { static: true }) table: MatTable<any> = Object.create(null);
  // @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator = Object.create(null);
   @ViewChild(MatPaginator) paginator: MatPaginator
  //  @ViewChild('campaignOnePicker') campaignOnePicker!: MatDateRangePicker<Date>;

  constructor(private dialog: MatDialog , 
    private firebaseService : FirebaseService ,
    private loaderService : LoaderService,
    private _snackBar: MatSnackBar,
      private breakpointService: BreakpointService) { }


  ngOnInit(): void {
     this.subcription.add(
      this.breakpointService.breakpoint$.subscribe(bpState => {
        this.isMobile = bpState.isMobile;
      })
    );

  this.getRentProductList()
  }
  
  ngOnDestroy(): void {
    this.subcription.unsubscribe();
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

    const dialogRef = this.dialog.open(rentproductMasterDialogComponent, { 
        data: {obj : obj, rentList : this.rentProductList} 
      });

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
        this.editRentProduct(result);
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

  editRentProduct(result:any) {
    const payload: RentProductList = {
      id: result.data.id,
      productNumber: result.data.productNumber,
      productName: result.data.productName,
      rent: result.data.rent,
      userId: localStorage.getItem("userId")
    }
    this.firebaseService.updateRentProduct(result.data.id, payload).then((res: any) => {
      this.getRentProductList()
      this.openConfigSnackBar('record update successfully')
    }, (error) => {
      console.log("error => ", error);

    })
  }

  getRentProductList() {
    this.loaderService.setLoader(true)
    this.firebaseService.getAllRentProduct().subscribe((res: any) => {
      if (res) {
        this.rentProductList = res.filter((id: any) => id.userId === localStorage.getItem("userId"))
        this.rentProductList = this.rentProductList.sort((a: any, b: any) => a.productNumber - b.productNumber);
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

  //////////////////////////////////////////////////////
  editingRowId: string | null = null;

  enableEdit(rowId: string): void {
    this.editingRowId = rowId;
  }

  productNameChange(row: any, event: any): void {
    row.productName = event.target.value;
    this.editRentProduct({data: row})
    this.editingRowId = null;
  }

  cancelEdit(): void {
    this.editingRowId = null;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    this.cancelEdit();
  }
  //////////////////////////////////////////////////////


  //////////////////////////////////////////////////////
  editingRentRowId: string | null = null;

  enableRentEdit(rowId: string): void {
    this.editingRentRowId = rowId;
  }

  rentChange(row: any, event: any): void {
    row.rent = event.target.value;
    this.editRentProduct({ data: row })
    this.editingRentRowId = null;
  }

  cancelRentEdit(): void {
    this.editingRentRowId = null;
  }

  @HostListener('document:click', ['$event'])
  onClickRentOutside(event: MouseEvent) {
    this.cancelRentEdit();
  }

     pageSize = 5;
  currentPage = 0;
  // pageSizeOptions = [3, 6, 9, 12];

  // Get paginated cards
  get paginatedCards(): any[] {
    const startIndex = this.currentPage * this.pageSize;
    return this.productDataSource.data.slice(startIndex, startIndex + this.pageSize);
  }

  // Handle page event
  onPageChange(event: PageEvent) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  // Get display info
  get displayInfo(): string {
    const start = this.currentPage * this.pageSize + 1;
    const end = Math.min((this.currentPage + 1) * this.pageSize, this.productDataSource.data.length);
    return `Showing ${start}-${end} of ${this.productDataSource.data.length} items`;
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
  rentProductArr:any = [];

  constructor(
    private fb: FormBuilder,
    private _snackBar : MatSnackBar,
    public dialogRef: MatDialogRef<rentproductMasterDialogComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) {

    this.rentProductArr = data.rentList;
    this.local_data = { ...data.obj };
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
    if(this.rentProductArr.find((id:any) => id.productNumber === this.rentproductForm.controls['productNumber'].value) && this.action !== 'Edit'){
      this.openConfigSnackBar('Product number is already exits.')
    } else {
      const payload = this.rentproductForm.value
      this.dialogRef.close({ event: this.action, data: payload });
    }
  }

  closeDialog(): void {
    this.dialogRef.close({ event: 'Cancel' });
  }

    openConfigSnackBar(snackbarTitle: any) {
    this._snackBar.open(snackbarTitle, 'Splash', {
      duration: 4 * 1000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }
}