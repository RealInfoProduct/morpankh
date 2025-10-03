import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { InvestmentList, PartnersList } from 'src/app/interface/invoice';
import { FirebaseService } from 'src/app/services/firebase.service';
import { LoaderService } from 'src/app/services/loader.service';
import { InvestmentDialogComponent } from './investment-dialog/investment-dialog.component';

@Component({
  selector: 'app-investment',
  templateUrl: './investment.component.html',
  styleUrls: ['./investment.component.scss']
})
export class InvestmentComponent implements OnInit {

  displayedColumns: string[] = [
    'srno',
    'name',
    'amount',
    'note',
    'date',
    'action',
  ];
  partnersList: any = []
  cashFlow: any = []
  investmentist: any = []
  investmentDataSource = new MatTableDataSource(this.investmentist);
  @ViewChild(MatTable, { static: true }) table: MatTable<any> = Object.create(null);
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator = Object.create(null);

  constructor(private dialog: MatDialog,
    private firebaseService: FirebaseService,
    private loaderService: LoaderService,
    private _snackBar: MatSnackBar,) { }


  ngOnInit(): void {
    this.getInvestmentList();
    this.getPartnersList();
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
        this.investmentist = res.filter((id: any) => id.userId === localStorage.getItem("userId"))
        this.investmentDataSource = new MatTableDataSource(this.investmentist);
        this.investmentDataSource.paginator = this.paginator;
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


  getPartnersList() {
    this.loaderService.setLoader(true)
    this.firebaseService.getAllPartners().subscribe((res: any) => {
      if (res) {
        this.partnersList = res.filter((id: any) => id.userId === localStorage.getItem("userId"))

        this.loaderService.setLoader(false)
      }
    })
  }

}