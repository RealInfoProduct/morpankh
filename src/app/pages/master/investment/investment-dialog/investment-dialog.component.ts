import { Component, Inject, OnInit, Optional } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FirebaseService } from 'src/app/services/firebase.service';
import { LoaderService } from 'src/app/services/loader.service';

@Component({
  selector: 'app-investment-dialog',
  templateUrl: './investment-dialog.component.html',
  styleUrls: ['./investment-dialog.component.scss']
})
export class InvestmentDialogComponent implements OnInit {
  investmentForm: FormGroup;
  action: string;
  local_data: any;
  selectedBankUpdateData: any;
  partnersList: any = [];
  selectedBankDetails:any = [];
  cashFlow:any = [];
  paymenttype: any = [
    'Cash',
    'G-Pay'
  ]

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<InvestmentDialogComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    private firebaseService: FirebaseService,
    private loaderService: LoaderService,
    private _snackBar: MatSnackBar
  ) {

    this.local_data = { ...data };
    this.action = this.local_data.action;

  }
  ngOnInit(): void {
    const data = Object.keys(this.local_data?.data)?.length === 0 ? null : this.local_data?.data
    this.buildForm()

    if (this.action === 'Edit' || this.action === 'Delete') {
      this.investmentForm.patchValue(this.local_data.data);
      this.investmentForm.controls['date'].setValue(new Date(this.local_data.data.date.seconds * 1000));
    }

    this.getPartnersList();
    this.getBalanceList();
  }

  buildForm(data?:any) {
    this.investmentForm = this.fb.group({
      name: ['', Validators.required],
      amount: ['', Validators.required],
      note: ['', Validators.required],
      date: [data ? new Date(data?.date.toDate()) : new Date()],
      paymenttype: [''],
      bank: ['']
    })
  }

  doAction(data?:any): void {
    
    const payload:any = {
      id: this.local_data.data?.id ? this.local_data.data?.id : '',
      name: this.investmentForm.value.name,
      amount: this.investmentForm.value.amount,
      note: this.investmentForm.value.note,
      date: this.investmentForm.value.date,
      paymenttype: this.investmentForm.value.paymenttype,
      userId: localStorage.getItem("userId"),
    };


    if(this.investmentForm.value.paymenttype != 'Cash') {
      payload.bank =  this.investmentForm.value.bank
    }
    
    // this.dialogRef.close({ event: this.action, data: payload });
    if (this.action === 'Add') {
      this.firebaseService.addInvestment(payload).then((res) => {
        if (res) {
          this.updateBalance(payload, this.action);
          this.openConfigSnackBar('record create successfully')
        }
      }, (error) => {
        console.log("error=>", error);

      })
    }
    if (this.action === 'Edit') {
        this.firebaseService.updateInvestment(payload.id, payload).then((res: any) => {
          // const balance = this.cashFlow.find((id:any) => id.transactionId === payload.id).amount;
          // this.selectedBankUpdateData.cashBalance -= balance;
          if (this.investmentForm.controls['paymenttype'].value === 'G-Pay') {
            const balance = this.cashFlow.find((id: any) => id.transactionId === payload.id).amount;
            this.selectedBankDetails.forEach((ele: any) => {
              if (ele.id === payload?.bank) {
                ele.balance -= balance
              }
            })
          } else {
            const balance = this.cashFlow.find((id: any) => id.transactionId === payload.id).amount;
            this.selectedBankUpdateData.cashBalance -= balance;
          }

          this.updateBalance(payload, this.action);
          this.openConfigSnackBar('record update successfully')
        }, (error) => {
          console.log("error => ", error);

        })
    }
    if (this.action === 'Delete') {
      this.firebaseService.deleteInvestment(payload.id).then((res: any) => {
        this.updateBalance(payload , this.action);
        this.openConfigSnackBar('record delete successfully');
        this.dialogRef.close();
      }, (error) => {
        console.log("error => ", error);

      })
    }

    
  }

  openConfigSnackBar(snackbarTitle: any) {
    this._snackBar.open(snackbarTitle, 'Splash', {
      duration: 2 * 1000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }

  closeDialog(): void {
    this.dialogRef.close({ event: 'Cancel' });
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

  getBalanceList() {
    this.loaderService.setLoader(true);
    this.firebaseService.getUserBalance().subscribe((res: any) => {
      if (res) {
        const BalanceList = res.find((id: any) => id.userId === localStorage.getItem("userId"));
        this.selectedBankUpdateData = BalanceList;
        this.selectedBankDetails = BalanceList?.bankDetails
        this.cashFlow = BalanceList.cashFlow ?? []
        // const data = BalanceList?.bankDetails.find((b: any) => b.selected === true);
        // this.investmentForm.controls['bank'].setValue(data?.id)

         if(this.action === 'Edit' || this.action === 'Delete') {
            this.investmentForm.controls['bank'].setValue(this.local_data.data.bank)
          } else {
            const data = BalanceList?.bankDetails.find((b: any) => b.selected === true);
            this.investmentForm.controls['bank'].setValue(data?.id)
          }

        this.loaderService.setLoader(false);
      }
    });
  }

  updateBalance(payload: any, type:any) {
    
    if (type === 'Delete') {
      const indexToDelete = this.cashFlow.findIndex((item: any) => item?.transactionId === payload?.id);

      if (indexToDelete >= -1) {
        this.cashFlow.splice(indexToDelete, 1);
      }

    } else {
      const cashFlowObj = {
        trasactionType: 'Investment',
        paymentType: payload.paymenttype,
        createdDate: new Date(),
        transactionDate: payload.date,
        amount: payload.amount,
        transactionId: payload.id
      }

      const existingIndex = this.cashFlow.findIndex((item: any) => item?.transactionId === payload?.id);

      if (existingIndex !== -1) {
        this.cashFlow[existingIndex] = cashFlowObj;
      } else {
        this.cashFlow.push(cashFlowObj);
      }
    }
    
    if(this.investmentForm.controls['paymenttype'].value === 'G-Pay') {
      const selectedBank = this.selectedBankDetails.find((bank:any) => bank.id === payload.bank);
      if (selectedBank) {

          let updatedBalance = selectedBank.balance;
          if (type === 'Delete') {
            updatedBalance -= Number(payload.amount);
          } else{
            updatedBalance += Number(payload.amount);
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
              cashFlow : this.cashFlow,
              userId: localStorage.getItem("userId")
          };

          this.firebaseService.updateBalance(balancePayload.id, balancePayload).subscribe({
            next: (res: any) => {
              if (res) {
                this.investmentForm.reset();
              }
            },
            error: (error) => { }
          })
        }
    } else {
        // let updatedCashBalance = this.selectedBankUpdateData.cashBalance;
        // updatedCashBalance += Number(payload.amount);

        let updatedCashBalance = this.selectedBankUpdateData.cashBalance;
          if (type === 'Delete') {
            updatedCashBalance -= Number(payload.amount);
          } else{
            updatedCashBalance += Number(payload.amount);
          }
        

        this.selectedBankUpdateData.cashBalance = updatedCashBalance
        const balancePayload = {
            id: this.selectedBankUpdateData.id,
            cashBalance: this.selectedBankUpdateData.cashBalance,
            bankDetails: this.selectedBankDetails,
            cashFlow : this.cashFlow,
            userId: localStorage.getItem("userId")
        };


        this.firebaseService.updateBalance(balancePayload.id, balancePayload).subscribe({
          next: (res: any) => {
            if (res) { }
          },
          error: (error) => { }
        })
    }
  }

}