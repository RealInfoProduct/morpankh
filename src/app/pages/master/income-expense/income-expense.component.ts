import { Component, OnInit, ViewChild } from '@angular/core';
import { ExpenseDialogComponent } from './expense-dialog/expense-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { FirebaseService } from 'src/app/services/firebase.service';
import { LoaderService } from 'src/app/services/loader.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatPaginator } from '@angular/material/paginator';
import { ExpensesList, RentList } from 'src/app/interface/invoice';
import { BalanceComponent } from '../balance/balance.component';
import { MatRadioChange } from '@angular/material/radio';

@Component({
  selector: 'app-income-expense',
  templateUrl: './income-expense.component.html',
  styleUrls: ['./income-expense.component.scss']
})
export class IncomeExpenseComponent implements OnInit {

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

  allExpenses: any[] = [];
  totalByAccountType: any = 0;


  expensesDataSource = new MatTableDataSource(this.expensesList);
  @ViewChild(MatTable, { static: true }) table: MatTable<any> = Object.create(null);
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator = Object.create(null);

  constructor(private dialog: MatDialog, private firebaseService: FirebaseService,
    private loaderService: LoaderService,
    private _snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.getexpensesList()
    this.getBalanceList()

  }

  addexpenses(action: string, obj: any) {
    obj.action = action;
    const dialogRef = this.dialog.open(ExpenseDialogComponent, { data: obj, width: '650px' });
    // dialogRef.afterClosed().subscribe((result) => {
    //   debugger
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
    //     console.log(payload);


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

  // onFilterChange(filterValue: string) {
  //   if (filterValue === 'All') {
  //     this.expensesList = [...this.allExpenses];
  //   } else {
  //     this.expensesList = this.allExpenses.filter(item => item.accounttype === filterValue);
  //   }
  //   this.expensesDataSource = new MatTableDataSource(this.expensesList);
  //   this.expensesDataSource.paginator = this.paginator;
  // }

  onFilterChange(event: MatRadioChange) {
    const selectedValue = event.value;

    if (selectedValue === 'All') {
      this.expensesList = [...this.allExpenses];
    } else {
      this.expensesList = this.allExpenses.filter(item => item.accounttype === selectedValue);
    }
    // this.totalAmount = this.expensesList.reduce((sum: any, item: any) => sum + (item.amount || 0), 0);
  
    this.expensesDataSource = new MatTableDataSource(this.expensesList);
    this.expensesDataSource.paginator = this.paginator;
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

 
}
