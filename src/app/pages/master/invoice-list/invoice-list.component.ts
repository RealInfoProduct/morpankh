import { Component, HostListener, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { ProductList } from 'src/app/interface/invoice';
import { FirebaseService } from 'src/app/services/firebase.service';
import { LoaderService } from 'src/app/services/loader.service';
import { productMasterDialogComponent } from '../product-master/product-master.component';
import { DatePipe } from '@angular/common';
import { ShellConfirmationDialogComponent } from '../shell-list/shell-confirmation-dialog/shell-confirmation-dialog.component';
import { Subscription } from 'rxjs';
import { BreakpointService } from 'src/app/services/breakpoint.service';


@Component({
  selector: 'app-invoice-list',
  templateUrl: './invoice-list.component.html',
  styleUrls: ['./invoice-list.component.scss']
})
export class InvoiceListComponent {
displayedColumns: string[] = [
    'id',
    'billno',
    'customerName',
    'invoiceDate',
    'customerNumber',
    'totalcost',
    'invoiceStatus',
    'action',
  ];
  productList :any = []
  purchaseList :any = []
  isMobile: boolean = false;
  subcription = new Subscription();
    
  purchaseDataSource = new MatTableDataSource<any>(this.purchaseList);
  @ViewChild(MatTable, { static: true }) table: MatTable<any> = Object.create(null);
  // @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator = Object.create(null);
   @ViewChild(MatPaginator) paginator: MatPaginator

  constructor(private dialog: MatDialog , 
    private firebaseService : FirebaseService ,
    private loaderService : LoaderService,
    private datePipe: DatePipe,private breakpointService: BreakpointService) { }


  ngOnInit(): void {
     this.subcription.add(
      this.breakpointService.breakpoint$.subscribe(bpState => {
        this.isMobile = bpState.isMobile;
      })
    );
    this.getPurchaseList()
    this.getProductList()
  }

  ngOnDestroy(): void {
    this.subcription.unsubscribe();
  }

  getPurchaseList() {
    this.loaderService.setLoader(true);
  
    this.firebaseService.getAllPurchase().subscribe((res: any) => {
      if (res) {
        this.purchaseList = res.filter((item: any) => item.userId === localStorage.getItem("userId") && item.isShell);
  
        const uniqueInvoices = Object.values(
          this.purchaseList.reduce((acc: any, item: any) => {
            acc[item.invoiceNo] = acc[item.invoiceNo] || item;
            return acc;
          }, {})
        );
  
        uniqueInvoices.sort((a: any, b: any) => {
          const aTime = a.createDate?.seconds || 0;
          const bTime = b.createDate?.seconds || 0;
          return bTime - aTime;
        });
  
        uniqueInvoices.forEach((invoice: any) => {
          const date = new Date(invoice.createDate.seconds * 1000);
          invoice.invoiceDate = this.datePipe.transform(date, 'fullDate');
        });
  
        this.purchaseDataSource = new MatTableDataSource(uniqueInvoices);
        this.purchaseDataSource.paginator = this.paginator;
  
        this.loaderService.setLoader(false);
      }
    });
  }
  


  applyFilter(filterValue: string): void {
    this.purchaseDataSource.filter = filterValue.trim().toLowerCase();
  }
  
  getSerialNumber(index: number): number {
    if (!this.paginator) return index + 1;
    return (this.paginator.pageIndex * this.paginator.pageSize) + index + 1;
  }
  
  getProductList() {
    this.loaderService.setLoader(true)
    this.firebaseService.getAllProduct().subscribe((res: any) => {
      if (res) {
        this.productList = res.filter((id:any) => id.userId === localStorage.getItem("userId"))
        this.loaderService.setLoader(false)
      }
    })
  }

  viewInvoice(element: any) {
    const invoiceDetail = {
      id: element.invoiceNo || 'N/A',
      billFrom: element.firmName || 'N/A',
      billFromEmail: 'N/A',
      billFromAddress: element.firmAddress || 'N/A',
      billFromPhone: 'N/A',
      billTo: element.customerName || 'N/A',
      billToEmail: 'N/A',
      billToAddress: 'N/A',
      billToPhone: element.customerNumber || 'N/A',
      orders: [
        {
          itemName: element.productDes || 'Product',
          unitPrice: element.purchaseAmount || 0,
          units: 1, 
          unitTotalPrice: element.finalAmount || 0
        }
      ],
      orderDate: new Date((element.invoiceDate?.seconds || 0) * 1000),
      totalCost: element.purchaseAmount || 0,
      vat: element.finalAmount ? element.finalAmount - element.purchaseAmount : 0,
      grandTotal: element.finalAmount || 0,
      status: element.invoiceStatus || 'Pending',
      completed: element.invoiceStatus === 'Completed',
      isSelected: false
    };
  }
  

productgrandTotal(invoiceNo: number): number {
  const filteredItems = this.purchaseList.filter((item: any) => item.invoiceNo === invoiceNo);
  return filteredItems.reduce((total: number, row: any) => {
    const discountPercent = row.shellDiscount || 0;
    // const discountAmount = (discountPercent / 100) * row.shellAmount;
    return total + (row.shellAmount - discountPercent);
  }, 0);
}

  sendWhatsAppInvoiceShell(order: any) {
    const invoiceUrl = `${window.location.origin}/invoicedetails/${order.id}`;
      const message = `Hello ${order.customerName} 👋,

📥 Your invoice is ready to download.

🔗 Download Invoice:
${invoiceUrl}

Thank you for choosing Morpankh Saree 💐`;

    const url = `https://web.whatsapp.com/send?phone=${order.customerNumber}&text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  }


  returnProduct(rowData: any) {
      const dialogRef = this.dialog.open(ShellConfirmationDialogComponent,
        { data: rowData, width: '400px' }
      );
      
      dialogRef.afterClosed().subscribe((result) => {
          const selectedReturnProduct = this.purchaseList.find((id: any) => id.id === result.data.id)
          selectedReturnProduct.isShell = false;
          selectedReturnProduct.finalAmount = 0;
          selectedReturnProduct.shellDiscount = 0;
          selectedReturnProduct.customerName = '';
          selectedReturnProduct.customerNumber = '';
          selectedReturnProduct.invoiceNo = '';
  
          this.firebaseService.updatePurchase(selectedReturnProduct.id, selectedReturnProduct).then((res: any) => {
            this.getPurchaseList()
          }, (error) => {
            console.log("error => ", error);
          })
      })
    }


    editRentProduct(result:any) {
        const payload =  result.data
       this.firebaseService.updatePurchase(result.data.id, payload).then((res: any) => {
            this.getPurchaseList()
          }, (error) => {
            console.log("error => ", error);
          })
      }

   editingRentRowId: string | null = null;
 
   enableRentEdit(rowId: string): void {
     this.editingRentRowId = rowId;
   }
 
   rentChange(row: any, event: any): void {
     row.finalAmount = event.target.value;
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
  
  get paginatedCards(): any[] {
    const startIndex = this.currentPage * this.pageSize;
    return this.purchaseDataSource.data.slice(startIndex, startIndex + this.pageSize);
  }

  // Handle page event
  onPageChange(event: PageEvent) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  // Get display info
  get displayInfo(): string {
    const start = this.currentPage * this.pageSize + 1;
    const end = Math.min((this.currentPage + 1) * this.pageSize, this.purchaseDataSource.data.length);
    return `Showing ${start}-${end} of ${this.purchaseDataSource.data.length} items`;
  }

}
