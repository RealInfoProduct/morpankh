import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { FirebaseService } from 'src/app/services/firebase.service';
import { LoaderService } from 'src/app/services/loader.service';
import { InvestmentDialogComponent } from './investment-dialog/investment-dialog.component';
import { MatSelectChange } from '@angular/material/select';
import { BreakpointService } from 'src/app/services/breakpoint.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-investment',
  templateUrl: './investment.component.html',
  styleUrls: ['./investment.component.scss']
})
export class InvestmentComponent implements OnInit {

  displayedColumns: string[] = [
    'srno',
    'name',
    'paymentType',
    'amount',
    'note',
    'date',
    'action',
  ];
  partnersList: any = [];
  cashFlow: any = [];
  investmentist: any = [];
  investmentListtable:any =[];
  investmentList:any =[];
  investmentists:any =[];
  totalAmount:any = 0;
  balanceList:any =[];
  investmentList2:any =[];
  isMobile: boolean = false;
  subcription = new Subscription();

  investmentDataSource = new MatTableDataSource(this.investmentList);
  @ViewChild(MatTable, { static: true }) table: MatTable<any> = Object.create(null);
  // @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator = Object.create(null);
   @ViewChild(MatPaginator) paginator: MatPaginator

  constructor(private dialog: MatDialog,
    private firebaseService: FirebaseService,
    private loaderService: LoaderService,
    private _snackBar: MatSnackBar, private breakpointService: BreakpointService) { }


  ngOnInit(): void {
    this.subcription.add(
      this.breakpointService.breakpoint$.subscribe(bpState => {
        this.isMobile = bpState.isMobile;
      })
    );
    this.getInvestmentList();
    this.getPartnersList();
    this.getBalanceList();   
    console.log(this.investmentList2,"investmentList2");
     
  }

    ngOnDestroy(): void {
    this.subcription.unsubscribe();
  }

  applyFilter(filterValue: string): void {
    this.investmentDataSource.filter = filterValue.trim().toLowerCase();
  }

  getSerialNumber(index: number): number {
    if (!this.paginator) return index + 1;
    return (this.paginator.pageIndex * this.paginator.pageSize) + index + 1;
  }

  addParty(action: string, obj: any) {
    // obj.action = action;
    const dialogRef = this.dialog.open(InvestmentDialogComponent, { data: {data : obj, action : action}});

    // dialogRef.afterClosed().subscribe((result) => {
    //     if (result?.event === 'Add') {
    //       const payload: InvestmentList = {
    //         id: '',
    //         name: result.data.name,
    //         amount: result.data.amount,
    //         note: result.data.note,
    //         date: result.data.date,
    //         userId: localStorage.getItem("userId"),
    //         paymenttype: result.data.paymenttype,
    //         bank: result.data.bank
    //       }

    //       this.firebaseService.addInvestment(payload).then((res) => {
    //         if (res) {
    //           this.getInvestmentList()
    //           this.openConfigSnackBar('record create successfully')
    //         }
    //       }, (error) => {
    //         console.log("error=>", error);

    //       })
    //     }
    //     if (result?.event === 'Edit') {
    //       this.investmentist.forEach((element: any) => {
    //         if (element.id === result.data.id) {
    //           const payload: InvestmentList = {
    //             id: result.data.id,
    //             name: result.data.name,
    //             amount: result.data.amount,
    //             note: result.data.note,
    //             date: result.data.date,
    //             userId: localStorage.getItem("userId"),
    //             paymenttype: result.data.paymenttype,
    //             bank: result.data.bank
    //           }
    //           this.firebaseService.updateInvestment(result.data.id, payload).then((res: any) => {
    //             this.getInvestmentList()
    //             this.openConfigSnackBar('record update successfully')
    //           }, (error) => {
    //             console.log("error => ", error);

    //           })
    //         }
    //       });
    //     }
    //     if (result?.event === 'Delete') {
    //       this.firebaseService.deleteInvestment(result.data.id).then((res: any) => {
    //         this.getInvestmentList()
    //         this.openConfigSnackBar('record delete successfully')
    //       }, (error) => {
    //         console.log("error => ", error);

    //       })
    //     }
    // });
  }

 
  getInvestmentList() {
    this.loaderService.setLoader(true)
    this.firebaseService.getAllInvestment().subscribe((res: any) => {
      if (res) {
        this.investmentList = res.filter((id: any) => id.userId === localStorage.getItem("userId"));
        
        this.investmentList2  = [...this.investmentList]
        this.totalAmount = this.investmentList.reduce((sum: number, item: any) => {
          return sum + (Number(item.amount) || 0);
        }, 0);
        
        this.investmentDataSource = new MatTableDataSource(this.investmentList);
        this.investmentDataSource.paginator = this.paginator;
          console.log(this.investmentList2,"investmentDataSource");
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


  getPartnersList() {
    this.loaderService.setLoader(true)
    this.firebaseService.getAllPartners().subscribe((res: any) => {
      if (res) {
        this.partnersList = res.filter((id: any) => id.userId === localStorage.getItem("userId"))
        this.loaderService.setLoader(false)
      }
    })
  }

  getAccountHolderNameById(partnersId: string): string {
    if (!this.partnersList) return '';
    const partners = this.partnersList.find((b: any) => b.id === partnersId);
    return partners ? `${partners.firstName} - ${partners.lastName}` : '';
  }

    getBalanceList() {
    this.loaderService.setLoader(true)
    this.firebaseService.getUserBalance().subscribe((res: any) => {
      if (res) {
        this.balanceList = res.find((id: any) => id.userId === localStorage.getItem("userId"));
        this.loaderService.setLoader(false)
      }
    })
  }
   getBankNameById(bankId: string): string {
    if (!this.balanceList || !this.balanceList.bankDetails) return '';

    const bank = this.balanceList.bankDetails.find((b: any) => b.id === bankId);
    return bank ? `${bank.bankName} - ${bank.accountHolderName}` : '';
  }


  onFilterChange(event: MatSelectChange) {
    const selectedValue = event.value;
    if (selectedValue === 'All') {
      this.investmentDataSource = new MatTableDataSource(this.investmentList);
      this.investmentDataSource.paginator = this.paginator;
      this.totalAmount = this.investmentList.reduce((sum: number, item: any) => { return sum + (Number(item.amount) || 0); }, 0);
    } else {
      const filteredData = this.investmentList.filter((item: any) => item.name === selectedValue);
      this.investmentDataSource = new MatTableDataSource(filteredData);
      this.investmentDataSource.paginator = this.paginator;
      this.totalAmount = filteredData.reduce((sum: number, item: any) => { return sum + (Number(item.amount) || 0); }, 0);
    }
  }

     pageSize = 5;
  currentPage = 0;
  // pageSizeOptions = [3, 6, 9, 12];

  // Get paginated cards
  get paginatedCards(): any[] {
    const startIndex = this.currentPage * this.pageSize;
    return this.investmentList2.slice(startIndex, startIndex + this.pageSize);
  }

  // Handle page event
  onPageChange(event: PageEvent) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  // Get display info
  get displayInfo(): string {
    const start = this.currentPage * this.pageSize + 1;
    const end = Math.min((this.currentPage + 1) * this.pageSize, this.investmentList2.length);
    return `Showing ${start}-${end} of ${this.investmentList2.length} items`;
  }


  
}