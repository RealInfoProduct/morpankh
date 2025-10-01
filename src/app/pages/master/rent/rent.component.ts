import { Component, ElementRef, HostListener, Inject, OnInit, Optional, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { FirebaseService } from 'src/app/services/firebase.service';
import { LoaderService } from 'src/app/services/loader.service';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { animate, state, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-rent',
  templateUrl: './rent.component.html',
  styleUrls: ['./rent.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class RentComponent implements OnInit {
  displayedColumns: string[] = [
    'expand',
    'orderno',
    'customername',
    'mobileno',
    'advance',
    'deposite',
    'return',
    'orderdate',
    'total',
    'aadharCard',
    'action'
  ];
  rentList: any = []
  allRentProductList: any = []
  expandedElement: null;
  dateForm: FormGroup;
  totalRent: any = 0;
  expandedRow: any = null;
  isRowHide: any = null;

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



  toggleRow(row: any) {
    this.expandedRow = this.expandedRow === row ? null : row;
  }

  isExpanded(row: any): boolean {
    return this.expandedRow === row;
  }

  isExpansionDetailRow = (index: number, row: any): boolean => {
    return this.isExpanded(row);
  };


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
        const payload = result.data;
        payload.userId = localStorage.getItem("userId");
        console.log(payload);


        this.firebaseService.addRent(payload).then((res) => {
          if (res) {
            this.getRentList()
            this.sendWhatsAppMessage(payload);
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
    const product = this.rentList.find((id: any) => id?.rentProducts === order?.rentProducts);
  const formatDate = (timestamp: any): string => {
    if (!timestamp) return '';

    let date: Date;

    if (typeof timestamp === 'string') {
      date = new Date(timestamp);
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else if (timestamp?.seconds) {
      date = new Date(timestamp.seconds * 1000);
    } else {
      return '';
    }

    return this.datePipe.transform(date, 'dd/MM/yyyy hh:mm a') ?? '';
  };

  const orderDate = formatDate(product?.orderDate);

  // 🔁 Loop through rentDetails array and build the item list
  let rentDetailsMessage = '';
  product?.rentDetails?.forEach((item: any, index: number) => {
    const pickupDateStr = formatDate(item.pickupDateTime);
    const returnDateStr = formatDate(item.returnDateTime);
    rentDetailsMessage += `
    ------------------------------------------
    Product: ${item.product || 'N/A'}
    Pickup Date: ${pickupDateStr}
    Return Date: ${returnDateStr}
    Rent: ₹${item.rent}
    ------------------------------------------\n`;
  });
  
  const totalRent = product?.rentDetails?.reduce((sum: number, item: any) => sum + item.rent, 0) || 0;
  const remainingAmount = totalRent - product.advance;
  
  const message = `Hello ${product.customerName},
  Your Saree Rental Order has been confirmed ✅
  
  📌 Order Summary:
  - Bill No: ${product.billNo}
  - Order Date: ${orderDate}
  - Status: ${product.status}

📦 Items:
${rentDetailsMessage}

- Total Rent: ₹${totalRent}
- Advance Paid: ₹${product.advance}
- Deposit: ₹${product.deposite}
- Remaining Amount: ₹${remainingAmount}

💰 ડીલવરી લેતી વખતે ₹${(totalRent - product.advance) + product.deposite} રકમ આપવાની રહેશે. ડીલેવરી લેવા આવો ત્યારે ડિપોઝિટ કેશ માં લાવવી.

📜 Rules:
1) ઓર્ડર બુકિંગ થયા પછી કોઈપણ વસ્તુમાં ચેન્જ કે કેન્સલ થશે નહીં અને બિલ ની રકમ પરત મળશે નહીં.
2) ડીલવરી લેતી વખતે બાકી રહેતી રકમ અને ડિપોઝિટ આપવાની રહેશે. ડીલેવરી લેવા આવો ત્યારે ડિપોઝિટ કેશ માં લાવવી.
3) કોઈપણ ઓર્ડર ના બુકિંગ સાથે 50% રકમ જમા કરાવવાની રહેશે.
4) ચોલીના બ્લાઉઝમાં ફીટીંગ માટે ફરજિયાત હાથ સિલાઈ કરવાની રહેશે, મશીન સિલાઈ હશે તો ૫૦૦ ચાર્જ લેવામાં આવશે.
5) ભાડેથી લઈ ગયેલ ઓર્ડર આપેલ તારીખ કે સમય પર નહીં પહોંચે તો બે ગણું ભાડું લેવામાં આવશે.
6) ભાડાની બધી જ વસ્તુઓ રિટર્ન કરવાની રહેશે.
7) ડીલવરી લેતી વખતે સામાન ચેક કરીને લઈ જવો. (ઘરે જઈને ૪ કલાકમાં જાણ કરવી, પછી શો-રૂમ જવાબદાર નહીં રહેશે)
8) શો-રૂમ સમય: સવારે ૧૦:૦૦ થી સાંજે ૯:૦૦
9) ઉપરના બધા નિયમો મંજુર છે અને અમારું પાલન કરવા બંધાયેલ છીએ. ડીલીવરી ૮:૦૦ PM પહેલા લેવી.

📲 Follow us:
Instagram: https://www.instagram.com/_.morpankh_saree._?igsh=MTBkaG5rb2Fxdzg2cw==

Thank you for booking with us 💐`;

  const phone = product.mobileNumber;
  const url = `https://web.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`;
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
    const payload = result.data;
    payload.userId = localStorage.getItem("userId");

    this.firebaseService.updateRent(result.data.id, payload).then((res: any) => {
      this.sendWhatsAppMessage(payload);
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
          element.rentDetails.forEach((rentItem: any) => {
            const data = res.find((product: any) => product.id === rentItem.rentProducts);
            rentItem['product'] = data ? `${data.productNumber} - ${data.productName}` : '';
          });
        });

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
        this.totalRent = this.rentList.reduce((acc: number, item: any) => {
          return acc + (parseFloat(item.total) || 0);
        }, 0);

          const pendingOrders = this.rentList.filter((order:any) =>
            !order.rentDetails?.length ||
            order.rentDetails.some((detail:any) => detail.status !== "Completed")
          );
        this.rentDataSource = new MatTableDataSource(pendingOrders);
        this.rentDataSource.paginator = this.paginator;
        this.loaderService.setLoader(false)
        this.getRentProductList()
      }
    })
  }

  onTabChange(event: any): void {
    this.updateDataSource(event.index === 1 ? "Completed" : "pending");
  }

  private updateDataSource(status: "Completed" | "pending"): void {
    this.rentDataSource.data = this.rentList.filter((order:any) =>
            !order.rentDetails?.length ||
            status === 'Completed' ? order.rentDetails.every((detail:any) => detail.status === status) : order.rentDetails.some((detail:any) => detail.status !== 'Completed')
    );
  }

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


  editOrderRowId: string | null = null;

  enableOrderEdit(rowId: string): void {
    this.editOrderRowId = rowId;
  }

  updateOrderStatus(element: any, row: any, newStatus: string): void {
    row.status = newStatus;
    this.editRentProduct({ data: element });
    this.editOrderRowId = null;
  }

  cancelOrder(): void {
    this.editOrderRowId = null;
  }

  @HostListener('document:click', ['$event'])
  onClickOrderOutside(event: MouseEvent) {
    this.cancelOrder();
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
    if (this.action === 'Add') {
      this.setAutoBillNo();
    }
    if (this.action === 'Edit' || this.action === 'Delete') {
      this.productForm.patchValue(this.local_data);
      this.productForm.controls['orderDate'].setValue(new Date(this.local_data.orderDate.seconds * 1000));

      if (this.local_data?.rentDetails?.length) {
        this.rentDetails.clear();
        this.local_data?.rentDetails.forEach((val: any) => {
          (this.productForm.controls['rentDetails'] as FormArray).push(this.createRentDetailGroup(val))
        });
      }

      this.productForm.value.rentDetails.forEach((ele: any) => {
        ele['']
      })

      this.rentCalculation('');
    }

    this.productForm.get('pickupDateTime')?.valueChanges.subscribe(() => {
      this.validateDateOrder();
    });

    this.productForm.get('returnDateTime')?.valueChanges.subscribe(() => {
      this.validateDateOrder();
    });
  }

  setAutoBillNo() {
    this.firebaseService.getAllRent().subscribe((res: any) => {
      const userId = localStorage.getItem("userId");
      if (res && res.length > 0) {
        const userData = res.filter((item: any) => item.userId === userId);
        this.productForm.get('srNo')?.setValue(userData.length + 1);
      } else {
        this.productForm.get('srNo')?.setValue(1);
      }
    });
  }


  buildForm() {
    this.productForm = this.fb.group({
      id: [''],
      srNo: [''],
      billNo: [''],
      customerName: ['', Validators.required],
      status: ['', Validators.required],
      address: ['', Validators.required],
      mobileNumber: ['', Validators.required],
      othermobileNumber: ['',],
      orderDate: [new Date()],
      advance: ['', Validators.required],
      deposite: ['', Validators.required],
      returnAmount: ['', Validators.required],
      aadharCard: [''],
      total: [''],
      rentDetails: this.fb.array([this.createRentDetailGroup()])
    })
  }

  createRentDetailGroup(data?: any): FormGroup {
    return this.fb.group({
      rentProducts: [data?.rentProducts || '', Validators.required],
      rent: [data?.rent || '', Validators.required],
      pickupDateTime: [data?.pickupDateTime ? new Date(data.pickupDateTime.seconds * 1000) : '', Validators.required],
      returnDateTime: [data?.returnDateTime ? new Date(data.returnDateTime.seconds * 1000) : '', Validators.required],
      billNo: [data?.billNo || ''],
      id: [data?.id || ''],
      status: [data?.status || '']
    });
  }

  get rentDetails(): FormArray {
    return this.productForm.get('rentDetails') as FormArray;
  }

  removeRentDetail(index: number) {
    this.rentDetails.removeAt(index);
  }

  addRentDetail() {
    this.rentDetails.push(this.createRentDetailGroup());
    this.filteredRentProducts.push([...this.rentProductList]);
  }

  calculateTotal(): any {
    const rent = this.productForm.get('rent')?.value || 0;
    const advance = this.productForm.get('advance')?.value || 0;
    const deposite = this.productForm.get('deposite')?.value || 0;
    const total = deposite - advance - rent;
    return total;

  }

  doAction(): void {
    this.productForm.value.rentDetails.forEach((ele: any) => {
      ele['status'] = ele?.status || "Booked";
      ele['billNo'] = this.productForm.value.billNo;
      ele['id'] = ele?.id || this.generateUniqueId();
    });
    const payload = this.productForm.value
    this.dialogRef.close({ event: this.action, data: payload });
  }

  generateUniqueId(): string {
    return Date.now().toString() + Math.floor(Math.random() * 1000).toString();
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
          element['product'] = element?.productNumber + '-' + element?.productName
        })
        // this.filteredRentProducts = [...this.rentProductList];
        this.filteredRentProducts = this.rentDetails.controls.map(() => [...this.rentProductList]);
        this.loaderService.setLoader(false)
      }
    });
  }

  validateDateOrder(): void {
    const pickup = new Date(this.productForm.get('pickupDateTime')?.value);
    const returnDate = new Date(this.productForm.get('returnDateTime')?.value);

    const pickupControl = this.productForm.get('pickupDateTime');
    const returnControl = this.productForm.get('returnDateTime');

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
    const rentArray = this.productForm.get('rentDetails') as FormArray;
    if (!rentArray) return;

    let rentSum = 0;
    rentArray.controls.forEach(group => {
      const rent = Number(group.get('rent')?.value) || 0;
      rentSum += rent;
    });

    this.productForm.get('total')?.setValue(rentSum, { emitEvent: false });

    const advance = Number(this.productForm.get('advance')?.value) || 0;
    const deposite = Number(this.productForm.get('deposite')?.value) || 0;
    const returnAmount = (rentSum - advance) - deposite;

    this.productForm.get('returnAmount')?.setValue(returnAmount, { emitEvent: false });
  }

  filterRentProducts(event: any, i:any) {
    const search = (event.target.value || '').toLowerCase();
    this.filteredRentProducts[i] = this.rentProductList.filter((item: any) =>
      item.product.toLowerCase().includes(search)
    );
  }

}