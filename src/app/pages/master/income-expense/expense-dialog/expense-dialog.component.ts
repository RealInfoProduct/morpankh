import { Component, Inject, OnInit, Optional } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ExpensesList } from 'src/app/interface/invoice';
import { FirebaseService } from 'src/app/services/firebase.service';
import { LoaderService } from 'src/app/services/loader.service';

@Component({
  selector: 'app-expense-dialog',
  templateUrl: './expense-dialog.component.html',
  styleUrls: ['./expense-dialog.component.scss']
})
export class ExpenseDialogComponent implements OnInit{
  ExpenseForm: FormGroup;
  action: any;
   local_data: any;
   selectedBankDetails:any =[]
   selectedBankUpdateData :any
   paymenttype: any = [
     'Cash',
     'G-Pay' 
   ]

   accounttype: any = [
     'Income',
     'Expense' 
   ]

   bankList:any =[
    'dome',
   ]
 
   constructor(
     private fb: FormBuilder,
     public dialogRef: MatDialogRef<ExpenseDialogComponent>,
     @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
      private firebaseService : FirebaseService ,
               private loaderService : LoaderService,
                 private _snackBar: MatSnackBar
   ) {
     this.local_data = { ...data };
     this.action = this.local_data.action;
   }
 
   ngOnInit(): void {
     this.ExpenseFormlist()
     this.getBalanceList()
      if (this.action === 'Edit' || this.action === 'Delete') {
      this.ExpenseForm.patchValue(this.local_data);
      this.ExpenseForm.controls['date'].setValue(new Date(this.local_data.date.seconds * 1000));
    }
   }
 
   ExpenseFormlist() {
     this.ExpenseForm = this.fb.group({
       id:[''],
       date: [new Date()],
       billno:[''],
       paymenttype:[''],
       accounttype:[''],
       bank:[''],
       notes:[''],
       amount:['']
     })
   }
 
 
  doAction(type?: any, data?:any) {
    const payload: ExpensesList = {
      id: this.ExpenseForm.value.id || '',
      date: this.ExpenseForm.value.date,
      billno: this.ExpenseForm.value.billno,
      paymenttype: this.ExpenseForm.value.paymenttype,
      accounttype: this.ExpenseForm.value.accounttype,
      bank: this.ExpenseForm.value.bank,
      amount: this.ExpenseForm.value.amount,
      notes: this.ExpenseForm.value.notes,
      userId: localStorage.getItem("userId")
    }

    if (type) {
      this.firebaseService.deleteExpenses(payload.id).then((res: any) => {
        payload.bank = data?.bank;
        payload.accounttype = payload.accounttype === "Expense" ? "Income" : "Expense"
        this.updateBalance(payload);
        this.getexpensesList()
        this.openConfigSnackBar('record delete successfully')
      }, (error) => {})
    } else {
      if (payload?.id) {
        this.firebaseService.updateExpenses(payload.id, payload).then((res: any) => {
          this.updateBalance(payload);
          this.getexpensesList();
          this.openConfigSnackBar('record update successfully')
        }, (error) => {})
      } else {
        this.firebaseService.addExpenses(payload).then((res) => {
          if (res) {
            this.updateBalance(payload)
            this.getexpensesList()
            this.ExpenseForm.reset()
            this.openConfigSnackBar('record create successfully')

          }
        }, (error) => {})
      }
    }
  }
  

  updateBalance(payload :any){
    if(this.ExpenseForm.controls['paymenttype'].value === 'G-Pay') {
      const selectedBank = this.selectedBankDetails.find((bank:any) => bank.id === payload.bank);
      if (selectedBank) {
          let updatedBalance = selectedBank.balance;
          if (payload.accounttype === 'Income') {
              updatedBalance += payload.amount;
          } else if (payload.accounttype === 'Expense') {
              updatedBalance -= payload.amount;
          }
  
          this.selectedBankDetails.forEach((ele:any) => {
             if(ele.id === payload?.bank) {
                ele.balance = updatedBalance
             }
          })
          
          const balancePayload = {
              id: this.selectedBankUpdateData.id,
              cashBalance: this.selectedBankUpdateData.cashBalance,
              bankDetails: this.selectedBankDetails,
              userId: payload.userId
          };
  
          this.firebaseService.updateBalance(balancePayload.id, balancePayload).subscribe({
            next: (res: any) => {
              if (res) {
                this.ExpenseForm.reset();
              }
            },
            error: (error) => { }
          })
        }
    } else {
        let updatedCashBalance = this.selectedBankUpdateData.cashBalance;
        if (payload.accounttype === 'Income') {
            updatedCashBalance += payload.amount;
        } else if (payload.accounttype === 'Expense') {
            updatedCashBalance -= payload.amount;
        }

        this.selectedBankUpdateData.cashBalance = updatedCashBalance
        const balancePayload = {
            id: this.selectedBankUpdateData.id,
            cashBalance: this.selectedBankUpdateData.cashBalance,
            bankDetails: this.selectedBankDetails,
            userId: payload.userId
        };


        this.firebaseService.updateBalance(balancePayload.id, balancePayload).subscribe({
          next: (res: any) => {
            if (res) { }
          },
          error: (error) => { }
        })
    }
  }
 
   closeDialog() {
     this.dialogRef.close({ event: 'Cancel' });
   }

   getexpensesList() {
       this.loaderService.setLoader(true)
       this.firebaseService.getAllExpenses().subscribe((res: any) => {
          this.loaderService.setLoader(false)
       })
     }
     
      openConfigSnackBar(snackbarTitle: any) {
       this._snackBar.open(snackbarTitle, 'Splash', {
         duration: 2 * 1000,
         horizontalPosition: 'right',
         verticalPosition: 'top',
       });
     }


     getBalanceList() {
      this.loaderService.setLoader(true);
      this.firebaseService.getUserBalance().subscribe((res: any) => {
        if (res) {
          const BalanceList = res.find((id: any) => id.userId === localStorage.getItem("userId"));
          this.selectedBankUpdateData = BalanceList;
          this.selectedBankDetails = BalanceList.bankDetails
          const data = BalanceList.bankDetails.find((b: any) => b.selected === true);
          this.ExpenseForm.controls['bank'].setValue(data.id)
          this.loaderService.setLoader(false);
        }
      });
    }
 

}
