import { AfterViewInit, Component, Inject, OnInit, Optional, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { forkJoin } from 'rxjs';
import { BalanceList } from 'src/app/interface/invoice';
import { FirebaseService } from 'src/app/services/firebase.service';
import { LoaderService } from 'src/app/services/loader.service';

@Component({
  selector: 'app-balance',
  templateUrl: './balance.component.html',
  styleUrls: ['./balance.component.scss']
})
export class BalanceComponent implements OnInit, AfterViewInit {
balanceForm:FormGroup
balanceList:any =[]
expensesList:any = []
totalBalance:any = 0
CheckBalance:boolean = false
CheckBalanceTable:boolean = false
selectedBankIndex: number | null = null;
cashFlowList:any =[]

cashFlowListdisplayedColumns=[
  'transactionDate',
  'paymentType',
  'trasactionType',
  'amount',
  'createdDate'
]

cashFlowListDataSource = new  MatTableDataSource(this.cashFlowList);
@ViewChild(MatTable, { static: true }) table: MatTable<any> = Object.create(null);
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator = Object.create(null);
constructor(private fb:FormBuilder, private firebaseService : FirebaseService,
            private loaderService : LoaderService, private _snackBar: MatSnackBar,
           @Optional() @Inject(MAT_DIALOG_DATA) public data: any){}

  ngOnInit(): void {
    this.balanceFormList()

    if (this.data?.disabled) {
      setTimeout(() => {
        this.balanceForm.disable();
        this.CheckBalance = true
      }, 100);
    }

    this.getexpensesList()
  }

  ngAfterViewInit(): void {
      this.getBalanceList()
  }

  balanceFormList() {
    this.balanceForm = this.fb.group({
      cashBalance: [{ value: '', disabled: true }],
      bankDetails: this.fb.array([this.createBankDetailGroup()])
    })
  }

  createBankDetailGroup(data?: any): FormGroup {
    return this.fb.group({
      id: [data?.id || this.generateUniqueId()],
      selected: [data?.selected || false],
      bankName: [data?.bankName || ''],
      accountHolderName: [data?.accountHolderName || ''],
      balance: [data?.balance || 0 ]
    });
  }

  get bankDetails(): FormArray {
    return this.balanceForm.get('bankDetails') as FormArray;
  }

  generateUniqueId(): string {
    return Date.now().toString() + Math.floor(Math.random() * 1000).toString();
  }

  removeBankDetail(index: number) {
    this.bankDetails.removeAt(index);
    const selectedBank = this.balanceList?.bankDetails?.find((id:any) => id.selected);
    if (!selectedBank) return;
    this.firebaseService.deleteBalance(selectedBank.id).then((res: any) => {
      this.saveBalance();
      this.openConfigSnackBar('Record deleted successfully');
    }, (error) => {
      console.error("Error deleting record:", error);
    });
  }


  addBankDetail() {
    this.bankDetails.push(this.createBankDetailGroup());
  }

  saveBalance() {
    debugger
    const payload = {
      id: this.balanceList?.id || '',
      cashBalance: this.balanceForm.value.cashBalance,
      bankDetails: this.balanceForm.value.bankDetails,
      userId: localStorage.getItem("userId")
    }
    if(this.balanceList?.id) {
      console.log('payload==>>' , payload);
      
      this.firebaseService.updateBalance(this.balanceList?.id, payload).subscribe({
        next : (res:any) => {
          if(res) {
            this.openConfigSnackBar('record update successfully');
            this.getBalanceList();
          }
        },
        error : (error) => {}
      })
    } else {
      this.firebaseService.addBalance(payload).subscribe({
        next : (res) => {
          if(res) {
            this.openConfigSnackBar('record create successfully');
            this.getBalanceList();
          }
        },
        error : (error) => {}
      })
    }
  }

  getBalanceList() {
    this.loaderService.setLoader(true);
    this.firebaseService.getUserBalance().subscribe((res: any) => {
      if (res) {
        this.balanceList = res.find((id: any) => id.userId === localStorage.getItem("userId"));
        this.balanceForm.controls['cashBalance'].setValue(this.balanceList?.cashBalance);
        this.cashFlowList = [...this.balanceList?.cashFlow]
        this.cashFlowListDataSource = new  MatTableDataSource(this.cashFlowList);
        this.cashFlowListDataSource.paginator = this.paginator;
        if(this.balanceList?.bankDetails?.length) {
          this.bankDetails.clear();
          this.balanceList?.bankDetails.forEach((val: any) => {
            (this.balanceForm.controls['bankDetails'] as FormArray).push(this.createBankDetailGroup(val))
          });
        } else {
          this.bankDetails.push(this.createBankDetailGroup());
        }
     let total = 0;
      this.balanceList?.bankDetails?.forEach((bank: any) => {
        total += parseFloat(bank.balance) || 0;
      });

      this.totalBalance = total
        this.loaderService.setLoader(false)
      }
    })

  }


  openConfigSnackBar(snackbarTitle: any) {
    this._snackBar.open(snackbarTitle, 'Splash', {
      duration: 2 * 1000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }

  onCheckboxChange(event: MatCheckboxChange, selectedIndex: number) {
    const bankFormArray = this.balanceForm.get('bankDetails') as FormArray;

    if (event.checked) {
      this.selectedBankIndex = selectedIndex;

      bankFormArray.controls.forEach((ctrl, index) => {
        const isSelected = index === selectedIndex;
        ctrl.get('selected')?.setValue(isSelected, { emitEvent: false });
      });

    } else {
      this.selectedBankIndex = null;

      bankFormArray.controls.forEach(ctrl => {
        ctrl.get('selected')?.setValue(false, { emitEvent: false });
      });
    }
  }

  isCheckboxDisabled(index: number): boolean {
    const bankFormArray = this.balanceForm.get('bankDetails') as FormArray;
    const selectedIndex = bankFormArray.controls.findIndex(ctrl => ctrl.get('selected')?.value);
    return selectedIndex !== -1 && selectedIndex !== index;
  }

  getexpensesList() {
    this.loaderService.setLoader(true)
    this.firebaseService.getAllExpenses().subscribe((res: any) => {
      if (res) {
        this.expensesList = res.filter((id: any) => id.userId === localStorage.getItem("userId"));
        this.loaderService.setLoader(false)
      }
    })
  }
}
