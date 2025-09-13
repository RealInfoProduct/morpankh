import { AfterViewInit, Component, ElementRef, HostListener, Inject, OnInit, Optional, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { RentList } from 'src/app/interface/invoice';
import { FirebaseService } from 'src/app/services/firebase.service';
import { LoaderService } from 'src/app/services/loader.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-rent',
  templateUrl: './rent.component.html',
  styleUrls: ['./rent.component.scss']
})
export class RentComponent implements OnInit {
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
  rentList: any = []
  allRentProductList: any = []
  dateForm: FormGroup;
  rentDataSource = new MatTableDataSource(this.rentList);
  @ViewChild(MatTable, { static: true }) table: MatTable<any> = Object.create(null);
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator = Object.create(null);

  constructor(private dialog: MatDialog,
    private firebaseService: FirebaseService,
    private loaderService: LoaderService,
    private _elementRef: ElementRef,
    private _snackBar: MatSnackBar,
    private fb: FormBuilder,
    private datePipe: DatePipe
  ) { }


  ngOnInit(): void {
    this.getRentList()
    this.getRentProductList()

    this.rentDataSource.filterPredicate = (data: any, filter: string): boolean => {
      const filterValue = filter.trim().toLowerCase();

      const formatDate = (timestamp: any): string => {
        if (!timestamp || typeof timestamp.seconds !== 'number') return '';
        const date = new Date(timestamp.seconds * 1000);
        return this.datePipe.transform(date, 'dd/MM/yyyy hh:mm a') ?? '';
      };

      const pickupDateStr = formatDate(data.pickupDateTime).toLowerCase();
      const returnDateStr = formatDate(data.returnDateTime).toLowerCase();
      const orderDateStr = formatDate(data.orderDate).toLowerCase();

      return (
        pickupDateStr.includes(filterValue) ||
        returnDateStr.includes(filterValue) ||
        orderDateStr.includes(filterValue)
      );
    };

    this.dateForm = this.fb.group({
      start: [null],
      end: [null]
    })

    this.dateForm.valueChanges.subscribe(() => {
      this.filterByDateRange();
    });
  }

  filterByDateRange(): void {
    const { start, end } = this.dateForm.value;

    if (!(start instanceof Date) || !(end instanceof Date)) {
      this.rentDataSource.data = this.rentList;
      return;
    }

    const startDate = new Date(start).setHours(0, 0, 0, 0);
    const endDate = new Date(end).setHours(23, 59, 59, 999);

    const filtered = this.rentList.filter((item: any) => {
      const pickupObj = item.pickupDateTime;

      if (!pickupObj || typeof pickupObj.seconds !== 'number') return false;

      const pickup = new Date(pickupObj.seconds * 1000).getTime();
      return pickup >= startDate && pickup <= endDate;
    });

    this.rentDataSource.data = filtered;
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
          id: '',
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
          userId: localStorage.getItem("userId")
        }
        console.log(payload);


        this.firebaseService.addRent(payload).then((res) => {
          if (res) {
            this.getRentList()
            this.sendWhatsAppMessage(payload)
            this.openConfigSnackBar('record create successfully')
          }
        }, (error) => {
          console.log("error=>", error);

        })
      }
      if (result?.event === 'Edit') {
        this.editRentProduct(result)
      }
      if (result?.event === 'Delete') {
        this.deleteRentProduct(result);
      }
    });
  }

  sendWhatsAppMessage(order: any) {
    const message = `Hello ${order.customerName},
    Your Saree Rental Order has been confirmed ✅

    📌 Order Details:
    - Product: ${order.rentProduct}
    - Status: ${order.status}
    - Order Date: ${order.orderDate}
    - Pickup Date & Time: ${order.pickupDateTime}
    - Return Date & Time: ${order.returnDateTime}
    - Rent Amount: ₹${order.rent}
    - Advance Paid: ₹${order.advance}
    - Deposit: ₹${order.deposit}
    - Return Amount: ₹${order.returnAmount}
    - Aadhar: ${order.aadhar}

    📜 Rules:
    1. Deposit will be refunded after product check.
    2. If the saree is damaged, deduction will be applied.
    3. Late return will incur extra charges.

    Thank you for booking with us 💐`;

    const phone = order.mobileNumber; // customer mobile number
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  }


  deleteRentProduct(result: any) {
    this.firebaseService.deleteRent(result.data.id).then((res: any) => {
      this.getRentList()
      this.openConfigSnackBar('record delete successfully')
    }, (error) => {
      console.log("error => ", error);

    })
  }

  editRentProduct(result: any) {
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
      userId: localStorage.getItem("userId")
    }

    this.firebaseService.updateRent(result.data.id, payload).then((res: any) => {
      this.getRentList()
      
      this.openConfigSnackBar('record update successfully')
    }, (error) => {
      console.log("error => ", error);

    })
  }


  getRentProductList() {
    this.loaderService.setLoader(true)
    this.firebaseService.getAllRentProduct().subscribe((res: any) => {
      if (res) {
        this.allRentProductList = res;
        this.rentList.forEach((element: any) => {
          const data = res.find((id: any) => id.id === element.rentProducts)
          element['product'] = data?.productNumber + '-' + data?.productName
        })
        this.loaderService.setLoader(false)
      }
    });
  }

  getRentList() {
    this.loaderService.setLoader(true)
    this.firebaseService.getAllRent().subscribe((res: any) => {
      if (res) {
        this.rentList = res.filter((id: any) => id.userId === localStorage.getItem("userId"));

        this.rentList.sort((a: any, b: any) => a.orderDate.seconds - b.orderDate.seconds);
        this.rentDataSource = new MatTableDataSource(this.rentList);
        this.rentDataSource.paginator = this.paginator;
        this.loaderService.setLoader(false)

        this.getRentProductList()
      }
    })
  }
  // getProductnumberName(data :any){
  //   const findProuct =  this.allRentProductList.find((id:any) => id.id === data.rentProducts)

  //   return findProuct?.productNumber + '-' + findProuct?.productName
  // }

  openConfigSnackBar(snackbarTitle: any) {
    this._snackBar.open(snackbarTitle, 'Splash', {
      duration: 2 * 1000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }

  editingRowId: string | null = null;

  enableEdit(rowId: string): void {
    this.editingRowId = rowId;
  }

  saveStatus(row: any, newStatus: string): void {
    if (newStatus === 'Cancelled') {
      this.addParty('Delete', row);
      // row.status = newStatus;
    } else {
      row.status = newStatus;
      this.editRentProduct({ data: row });
    }
    this.editingRowId = null;
  }

  cancelEdit(): void {
    this.editingRowId = null;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    this.cancelEdit();
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Booked':
        return 'status-booked';
      case 'In-Progress':
        return 'status-in-progress';
      case 'Completed':
        return 'status-completed';
      default:
        return '';
    }
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
  statusList: any = [
    'Booked',
    'In-Progress',
    'Completed',
    'Cancelled'
  ]
  rentProductList: any = []
  filteredRentProducts: any = []
  enableMeridian = true

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<rentDialogComponent>,
    private firebaseService: FirebaseService,
    private loaderService: LoaderService,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) {

    this.local_data = { ...data };
    this.action = this.local_data.action;

  }
  ngOnInit(): void {
    this.buildForm();
    this.getRentProductList();
    if (this.action === 'Edit' || this.action === 'Delete') {
      this.productForm.patchValue(this.local_data);
      this.productForm.controls['rentProducts'].setValue(this.local_data.rentProducts.id ? this.local_data.rentProducts.id : this.local_data.rentProducts);
      this.productForm.controls['pickupDateTime'].setValue(new Date(this.local_data.pickupDateTime.seconds * 1000));
      this.productForm.controls['orderDate'].setValue(new Date(this.local_data.orderDate.seconds * 1000));
      this.productForm.controls['returnDateTime'].setValue(new Date(this.local_data.returnDateTime.seconds * 1000));

      this.rentCalculation('');
    }

    // this.productForm.get('deposite')?.valueChanges.subscribe(value => {
    //   const newValue = this.calculateTotal();
    //   this.productForm.get('returnAmount')?.setValue(newValue, { emitEvent: false });
    // });
    
    this.productForm.get('pickupDateTime')?.valueChanges.subscribe(() => {
      this.validateDateOrder();
    });

    this.productForm.get('returnDateTime')?.valueChanges.subscribe(() => {
      this.validateDateOrder();
    });
  }

  buildForm() {
    this.productForm = this.fb.group({
      rentProducts: ['', Validators.required],
      customerName: ['', Validators.required],
      status: ['', Validators.required],
      mobileNumber: ['', Validators.required],
      orderDate: [new Date()],
      pickupDateTime: ['', Validators.required],
      returnDateTime: ['', Validators.required],
      rent: ['', Validators.required],
      advance: ['', Validators.required],
      deposite: ['', Validators.required],
      returnAmount: ['', Validators.required],
      aadharCard: [''],
      id: ['']
    })
  }

  calculateTotal(): any {
    const rent = this.productForm.get('rent')?.value || 0;
    const advance = this.productForm.get('advance')?.value || 0;
    const deposite = this.productForm.get('deposite')?.value || 0;
    const total = deposite - advance - rent;
    return total;

  }

  doAction(): void {
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
        this.rentProductList = res.filter((id: any) => id.userId === localStorage.getItem("userId"));

        this.rentProductList.forEach((element: any) => {
          // const data = res.find((id: any) => id.id === element.id)
          element['product'] = element?.productNumber + '-' + element?.productName
        })

        this.filteredRentProducts = [...this.rentProductList];
        if (this.action === 'Edit') {
          const data = this.rentProductList.find((id: any) => id.id === (this.local_data.rentProducts.id ? this.local_data.rentProducts.id : this.local_data.rentProducts))
          this.productForm.get('rent')?.setValue(data.rent)
        }
        this.loaderService.setLoader(false)
      }
    });
  }

  validateDateOrder(): void {
    const pickup = new Date(this.productForm.get('pickupDateTime')?.value);
    const returnDate = new Date(this.productForm.get('returnDateTime')?.value);

    const pickupControl = this.productForm.get('pickupDateTime');
    const returnControl = this.productForm.get('returnDateTime');

    pickupControl?.setErrors(null);
    returnControl?.setErrors(null);

    if (pickup && returnDate) {
      if (pickup.getTime() >= returnDate.getTime()) {
        pickupControl?.setErrors({ pickupAfterReturn: true });
        returnControl?.setErrors({ returnBeforePickup: true });
      }
    }
  }

  onRentProductChange(event: any) {
    const data = this.rentProductList.find((id: any) => id.id === event.value)
    this.productForm.get('rent')?.setValue(data.rent)
  }

  rentCalculation(event: any) {
    const rent = Number(this.productForm.get('rent')?.value) || 0;
    const advance = Number(this.productForm.get('advance')?.value) || 0;
    const deposite = Number(this.productForm.get('deposite')?.value) || 0;
    const total = rent - advance;
    this.productForm.get('returnAmount')?.setValue(total - deposite)
  }

  filterRentProducts(event: any) {
    const search = (event.target.value || '').toLowerCase();
    debugger
    this.filteredRentProducts = this.rentProductList.filter((item:any) =>
      item.product.toLowerCase().includes(search)
    );
  }

}