import { Component, OnInit, ViewChild } from '@angular/core';
import { ExpenseDialogComponent } from './expense-dialog/expense-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { FirebaseService } from 'src/app/services/firebase.service';
import { LoaderService } from 'src/app/services/loader.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatPaginator } from '@angular/material/paginator';
import { BalanceComponent } from '../balance/balance.component';
import { MatSelectChange } from '@angular/material/select';
import { FormBuilder, FormGroup } from '@angular/forms';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import moment from 'moment';
import { Subscription } from 'rxjs';
import { MatDateRangePicker } from '@angular/material/datepicker';
import { BreakpointService } from 'src/app/services/breakpoint.service';

@Component({
  selector: 'app-income-expense',
  templateUrl: './income-expense.component.html',
  styleUrls: ['./income-expense.component.scss']
})
export class IncomeExpenseComponent implements OnInit {
  dateIncomeListForm: FormGroup;
  expensesList: any = [];
  balanceList: any = [];

  expensesdisplayedColumns = [
    // 'srNo',
    'date',
    'billNo',
    'notes',
    'amount',
    // 'bank',
    'paymenttype',
    'accounttype',
    'statustype',
    'action'
  ];

  AccountList = [
    'All',
    'Expense',
    'Income'
  ]

  StatusList = [
    'Paid',
    'Pending'
  ]
  Account: any = [];
  Status: any = [];

  allExpenses: any[] = [];
  totalByAccountType: any = 0;
   isMobile: boolean = false;
      subcription = new Subscription();


  expensesDataSource = new MatTableDataSource<any>(this.expensesList);
  @ViewChild(MatTable, { static: true }) table: MatTable<any> = Object.create(null);
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator = Object.create(null);
   @ViewChild('campaignOnePicker') campaignOnePicker!: MatDateRangePicker<Date>;

  constructor(private dialog: MatDialog, private firebaseService: FirebaseService,
    private loaderService: LoaderService,
    private fb: FormBuilder,
    private _snackBar: MatSnackBar,
   private breakpointService: BreakpointService) { }

  ngOnInit(): void {
     this.subcription.add(
      this.breakpointService.breakpoint$.subscribe(bpState => {
        this.isMobile = bpState.isMobile;
      })
    );
    this.getexpensesList()
    this.getBalanceList()
    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    this.dateIncomeListForm = this.fb.group({
      start: [startDate],
      end: [endDate]
    });
  }

   ngOnDestroy(): void {
    this.subcription.unsubscribe();
  }


  filterDate() {
    if (!this.expensesList) return;
    const startDate = this.dateIncomeListForm.value.start ? new Date(this.dateIncomeListForm.value.start) : null;
    const endDate = this.dateIncomeListForm.value.end ? new Date(this.dateIncomeListForm.value.end) : null;

    if (startDate && endDate) {
      this.expensesDataSource.data = this.expensesList.filter((invoice: any) => {
        if (!invoice.date) return false;

        let invoiceDate;
        if (invoice.date.toDate) {
          invoiceDate = invoice.date.toDate();
        } else if (invoice.date instanceof Date) {
          invoiceDate = invoice.date;
        } else {
          return false;
        }

        return invoiceDate >= startDate && invoiceDate <= endDate;
      });
    } else {
      this.expensesDataSource.data = this.expensesList;
    }
  }

  addexpenses(action: string, obj: any) {
    obj.action = action;
    const dialogRef = this.dialog.open(ExpenseDialogComponent, { data: obj, width: '650px' });
    // dialogRef.afterClosed().subscribe((result) => {
    //   if (result?.event === 'Add') {
    //     const payload: ExpensesList = {
    //       id: '',
    //       date: result.data.date,
    //       billno: result.data.billno,
    //       paymenttype: result.data.paymenttype,
    //       accounttype: result.data.accounttype,
    //       status: result.data.status,
    //       bank: result.data.bank,
    //       amount: result.data.amount,
    //       notes: result.data.notes,
    //       userId: localStorage.getItem("userId")
    //     }


    //     this.firebaseService.addExpenses(payload).then((res:any) => {
    //       if (res) {
    //         this.getexpensesList()
    //         this.openConfigSnackBar('record create successfully')
    //       }
    //     }, (error) => {
    //       console.log("error=>", error);

    //     })
    //   }
    //   if (result?.event === 'Edit') {

    //     this.expensesList.forEach((element: any) => {
    //       if (element.id === result.data.id) {
    //         const payload: ExpensesList = {
    //           id: result.data.id,
    //           date: result.data.date,
    //           billno: result.data.billno,
    //           paymenttype: result.data.paymenttype,
    //           accounttype: result.data.accounttype,
    //           status: result.data.status,
    //           bank: result.data.bank,
    //           amount: result.data.amount,
    //           notes: result.data.notes,
    //           userId: localStorage.getItem("userId")
    //         }
    //         this.firebaseService.updateExpenses(result.data.id, payload).then((res: any) => {
    //           this.getexpensesList()
    //           this.openConfigSnackBar('record update successfully')
    //         }, (error) => {
    //           console.log("error => ", error);

    //         })
    //       }
    //     });
    //   }
    //   if (result?.event === 'Delete') {
    //     this.firebaseService.deleteExpenses(result.data.id).then((res: any) => {
    //       this.getexpensesList()
    //       this.openConfigSnackBar('record delete successfully')
    //     }, (error) => {
    //       console.log("error => ", error);

    //     })
    //   }
    // });

  }

  getexpensesList() {
    this.loaderService.setLoader(true)
    this.firebaseService.getAllExpenses().subscribe((res: any) => {
      if (res) {
        this.expensesList = res.filter((id: any) => id.userId === localStorage.getItem("userId"));
        this.allExpenses = this.expensesList

        this.totalByAccountType = this.expensesList.reduce((totals: any, item: any) => {
          if (item.accounttype === 'Expense') {

            const amount = item.amount || 0;

            if (!totals['Expense']) {
              totals['Expense'] = 0;
            }

            totals['Expense'] += amount;
          } else if (item.accounttype === 'Income') {

            const amount = item.amount || 0;

            if (!totals['Income']) {
              totals['Income'] = 0;
            }

            totals['Income'] += amount;
          }

          return totals;
        }, {});
        this.expensesDataSource = new MatTableDataSource(this.expensesList);
        this.expensesDataSource.paginator = this.paginator;
        this.loaderService.setLoader(false)
      }
    })
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


  openConfigSnackBar(snackbarTitle: any) {
    this._snackBar.open(snackbarTitle, 'Splash', {
      duration: 2 * 1000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }

  onFilterChange(event: MatSelectChange) {
     const selectedValue = event.value;

    if (selectedValue === 'All') {
      this.expensesList = [...this.allExpenses];
    } else {
      this.expensesList = this.allExpenses.filter(item => item.accounttype === selectedValue);
    }
    // this.totalAmount = this.expensesList.reduce((sum: any, item: any) => sum + (item.amount || 0), 0);

    this.expensesDataSource = new MatTableDataSource(this.expensesList);
    this.expensesDataSource.paginator = this.paginator;
     this.Account = event.value 
    ? selectedValue
    : 'All Account';
  }

  onFilterChangestatus(event: MatSelectChange) {
    const selectedsValue = event.value;
    this.expensesList = this.allExpenses.filter(item => item.status === selectedsValue);
    // this.totalAmount = this.expensesList.reduce((sum: any, item: any) => sum + (item.amount || 0), 0);

    this.expensesDataSource = new MatTableDataSource(this.expensesList);
    this.expensesDataSource.paginator = this.paginator;
      this.Status = event.value 
    ? selectedsValue
    : 'All Status';
  }

  applyFilter(filterValue: string): void {
    this.expensesDataSource.filter = filterValue.trim().toLowerCase();
  }

  addBalance() {
    const dialogRef = this.dialog.open(BalanceComponent,
      {
        width: '900px',
        data: { disabled: true }
      });
  }


  filedownload() {
    const doc: any = new jsPDF();
    doc.setFontSize(13);
    const filteredData: any[] = this.expensesDataSource.data;

    if (!filteredData || filteredData.length === 0) {
      window.alert("No Income/Expense data available for the selected filters.");
      return;
    }

    const startDate = this.dateIncomeListForm.value.start;
    const endDate = this.dateIncomeListForm.value.end;
    
    const formattedStart = new Date(startDate).toLocaleDateString('en-GB');
    const formattedEnd = new Date(endDate).toLocaleDateString('en-GB');
    
    doc.text(`Account : ${this.Account?.length === 0 ? 'All Account' : this.Account} `, 14, 15);
    doc.text(`Status:  ${this.Status?.length === 0 ? 'All Status ': this.Status}`, 14, 23);
    doc.text(`Report Date: ${formattedStart} To ${formattedEnd}`, 14, 31);

    const ExpenseAmounttotal = filteredData
      .filter(item => item.accounttype === 'Expense')
      .reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
    const ExpenseAmount = Math.round(ExpenseAmounttotal).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    doc.text(`Expense Total: ${(ExpenseAmount)}`, 140, 15);

    const IncometotalAmount = filteredData
      .filter(item => item.accounttype === 'Income')
      .reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
    const IncomeAmount = Math.round(IncometotalAmount).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    doc.text(`Income Total: ${(IncomeAmount)}`, 140, 23);

    const headers = [
      "Sr.No",
      "Date",
      "Bill No",
      "Notes",
      "Payment Type",
      "Account Type",
      "Status Type",
      "Amount",
    ];

    const data = filteredData.map((item, i) => {
      const dateStr = item.date?.seconds
        ? moment(item.date.seconds * 1000).format('DD/MM/YYYY')
        : '';
      return [
        i + 1,
        dateStr,
        item.billno,
        item.notes,
        item.paymenttype,
        item.accounttype,
        item.status,
        item.amount,
      ];
    });

    const MIN_ROWS = 32;
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
      startY: 40,
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


    doc.save(`Income/Expense Report.pdf`);
  }

}
