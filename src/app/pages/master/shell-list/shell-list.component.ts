import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { FirebaseService } from 'src/app/services/firebase.service';
import { LoaderService } from 'src/app/services/loader.service';
import { ShellConfirmationDialogComponent } from './shell-confirmation-dialog/shell-confirmation-dialog.component';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Subscription } from 'rxjs';
import { BreakpointService } from 'src/app/services/breakpoint.service';


@Component({
  selector: 'app-shell-list',
  templateUrl: './shell-list.component.html',
  styleUrls: ['./shell-list.component.scss']
})
export class ShellListComponent implements OnInit {
  dateInvoiceListForm: FormGroup;
  displayedColumns: string[] = [
    'srno',
    'ProductName',
    'customerName',
    'customerNumber',
    'shellAmount',
    'action'
  ];
  purchaseList: any = []
  productList: any = []
    isMobile: boolean = false;
  subcription = new Subscription();

  purchaseDataSource = new MatTableDataSource<any>(this.purchaseList);
  @ViewChild(MatTable, { static: true }) table: MatTable<any> = Object.create(null);
  // @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator = Object.create(null);
   @ViewChild(MatPaginator) paginator: MatPaginator

  constructor(private firebaseService: FirebaseService,
    private dialog : MatDialog,
    private fb: FormBuilder,
    private loaderService: LoaderService, private breakpointService: BreakpointService) { }


  ngOnInit(): void {
    this.subcription.add(
      this.breakpointService.breakpoint$.subscribe(bpState => {
        this.isMobile = bpState.isMobile;
      })
    );
    this.getPurchaseList()
    this.getProductList()
    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    this.dateInvoiceListForm = this.fb.group({
      start: [startDate],
      end: [endDate]
    });
  }

    ngOnDestroy(): void {
    this.subcription.unsubscribe();
  }

  filterDate() {
    if (!this.purchaseList) return;
    const startDate = this.dateInvoiceListForm.value.start ? new Date(this.dateInvoiceListForm.value.start) : null;
    const endDate = this.dateInvoiceListForm.value.end ? new Date(this.dateInvoiceListForm.value.end) : null;
  
    if (startDate && endDate) {
      this.purchaseDataSource.data = this.purchaseList.filter((invoice: any) => {
        if (!invoice.productDate) return false;
  
        let invoiceDate;
        if (invoice.productDate.toDate) {
          invoiceDate = invoice.productDate.toDate();
        } else if (invoice.productDate instanceof Date) {
          invoiceDate = invoice.productDate;
        } else {
          return false;
        }
  
        return invoiceDate >= startDate && invoiceDate <= endDate;
      });
    } else {
      this.purchaseDataSource.data = this.purchaseList;
    }
  }
  
  applyFilter(filterValue: string): void {
    this.purchaseDataSource.filter = filterValue.trim().toLowerCase();
  }

  getPurchaseList() {
    this.loaderService.setLoader(true);
    this.firebaseService.getAllPurchase().subscribe((res: any) => {
      if (res) {
        this.purchaseList = res.filter((item: any) => item.userId === localStorage.getItem("userId") && item.isShell);
        this.purchaseList.sort((a: any, b: any) => {
          const aTime = a.createDate?.seconds || 0;
          const bTime = b.createDate?.seconds || 0;
          return bTime - aTime;
        });
        this.filterDate();
        this.purchaseDataSource = new MatTableDataSource(this.purchaseList);
        this.purchaseDataSource.paginator = this.paginator;
        this.loaderService.setLoader(false);
        console.log('purchaseList===>>' , this.purchaseList);
        
      }
    });
  }

  getProductList() {
    this.loaderService.setLoader(true)
    this.firebaseService.getAllProduct().subscribe((res: any) => {
      if (res) {
        this.productList = res.filter((id: any) => id.userId === localStorage.getItem("userId"))
        this.loaderService.setLoader(false)
      }
    })
  }

  getProductName(productid: string) {
    return this.productList.find((id: any) => id.id === productid)?.productName
  }

  returnProduct(rowData: any) {
    const dialogRef = this.dialog.open(ShellConfirmationDialogComponent,
      { data: rowData, width: '400px' }
    );
    
    dialogRef.afterClosed().subscribe((result) => {
        this.loaderService.setLoader(true)
        const selectedReturnProduct = this.purchaseList.find((id: any) => id.id === result.data.id)
        selectedReturnProduct.isShell = false;
        selectedReturnProduct.finalAmount = 0;
        selectedReturnProduct.shellDiscount = 0;

        this.firebaseService.updatePurchase(selectedReturnProduct.id, selectedReturnProduct).then((res: any) => {
          this.getPurchaseList()
        }, (error) => {
          console.log("error => ", error);
        })
    })
  }
  
   filedownload() {
    const doc: any = new jsPDF();
    doc.setFontSize(13);
    const filteredData: any[] = this.purchaseDataSource.data;

    if (!filteredData || filteredData.length === 0) {
      window.alert("No Shell data available for the selected filters.");
      return;
    }

    const startDate = this.dateInvoiceListForm.value.start;
    const endDate = this.dateInvoiceListForm.value.end;

    const formattedStart = new Date(startDate).toLocaleDateString('en-GB');
    const formattedEnd = new Date(endDate).toLocaleDateString('en-GB');

    doc.text(`Report Date: ${formattedStart} To ${formattedEnd}`, 14, 15);

    const PurchaseAmounttotal = filteredData.reduce((sum, item) => sum + parseFloat(item.purchaseAmount), 0);
    const PurchaseAmount = Math.round(PurchaseAmounttotal).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    doc.text(`Purchase Total: ${(PurchaseAmount)}`, 140, 15);

    const shelltotalAmount = filteredData.reduce((sum, item) => sum + parseFloat(item.shellAmount), 0);
    const ShellAmount = Math.round(shelltotalAmount).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    doc.text(`Shell Total: ${(ShellAmount)}`, 140, 23);
    
    const headers = [
      "Sr.No",
      "Bill No",
      "Invoice No",
      "Product Name",
      "Customer Name",
      "Customer Number",
      "Purchase Amount",
      "Shell Amount"
    ];

    const data = filteredData.map((item, i) => {
      const productName = this.productList.find((prod: any) => prod.id === item.productid)?.productName || '';
      return [
        i + 1,
        item.billNo,
        item.invoiceNo,
        productName,
        item.customerName,
        item.customerNumber,
        item.purchaseAmount,
        item.shellAmount,
      ];
    });

    const MIN_ROWS = 35;
    if (data.length < MIN_ROWS) {
      for (let idx = data.length; idx < MIN_ROWS; idx++) {
        data.push([
          idx + 1,
          '',
          '',
          '',
          '',
          ''
        ]);
      }
    }

    doc.setFontSize(10);
    (doc as any).autoTable({
      head: [headers],
      body: data,
      startY: 30,
      theme: 'grid',
      headStyles: {
        fillColor: [255, 187, 0],
        textColor: [8, 8, 8],
        fontStyle: 'bold'
      },
      styles: {
        textColor: [8, 8, 8],
        fontSize: 8,
        valign: 'middle',
        halign: 'center'
      }
    });

    doc.save(`Shell Report.pdf`);
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
