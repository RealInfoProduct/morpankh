import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { PartnersList } from 'src/app/interface/invoice';
import { FirebaseService } from 'src/app/services/firebase.service';
import { LoaderService } from 'src/app/services/loader.service';
import { PartnersDialogComponent } from './partners-dialog/partners-dialog.component';
import { Subscription } from 'rxjs';
import { BreakpointService } from 'src/app/services/breakpoint.service';

@Component({
  selector: 'app-partners',
  templateUrl: './partners.component.html',
  styleUrls: ['./partners.component.scss']
})
export class PartnersComponent implements OnInit {

  displayedColumns: string[] = [
    'srno',
    'firstName',
    'middleName',
    'lastName',
    'mobileNumber',
    'action',
  ];
  partnersList :any = []
  isMobile: boolean = false;
  subcription = new Subscription();

  partnersDataSource = new MatTableDataSource(this.partnersList);
  @ViewChild(MatTable, { static: true }) table: MatTable<any> = Object.create(null);
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator = Object.create(null);

  constructor(private dialog: MatDialog , 
    private firebaseService : FirebaseService ,
    private loaderService : LoaderService,
    private _snackBar: MatSnackBar, private breakpointService: BreakpointService) { }


  ngOnInit(): void {
     this.subcription.add(
      this.breakpointService.breakpoint$.subscribe(bpState => {
        this.isMobile = bpState.isMobile;
      })
    );
  this.getPartnersList()
  }

     ngOnDestroy(): void {
    this.subcription.unsubscribe();
  }

  applyFilter(filterValue: string): void {
    this.partnersDataSource.filter = filterValue.trim().toLowerCase();
  }
  
  getSerialNumber(index: number): number {
    if (!this.paginator) return index + 1;
    return (this.paginator.pageIndex * this.paginator.pageSize) + index + 1;
  }
  
  addParty(action: string, obj: any) {
    obj.action = action;

    const dialogRef = this.dialog.open(PartnersDialogComponent, { data: obj });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.event === 'Add') {
        const payload: PartnersList = {
          id: '',
          firstName: result.data.firstName,
          middleName: result.data.middleName,
          lastName: result.data.lastName,
          mobileNumber: result.data.mobileNumber,
          userId : localStorage.getItem("userId")
        }

        this.firebaseService.addPartners(payload).then((res) => {
          if (res) {
              this.getPartnersList()
              this.openConfigSnackBar('record create successfully')
            }
        } , (error) => {
          console.log("error=>" , error);
          
        })
      }
      if (result?.event === 'Edit') {
        this.partnersList.forEach((element: any) => {
          if (element.id === result.data.id) {
            const payload: PartnersList = {
              id: result.data.id,
              firstName: result.data.firstName,
              middleName: result.data.middleName,
              lastName: result.data.lastName,
              mobileNumber: result.data.mobileNumber,
              userId : localStorage.getItem("userId")
            }
              this.firebaseService.updatePartners(result.data.id , payload).then((res:any) => {
                  this.getPartnersList()
                  this.openConfigSnackBar('record update successfully')
              }, (error) => {
                console.log("error => " , error);
                
              })
          }
        });
      }
      if (result?.event === 'Delete') {
        this.firebaseService.deletePartners(result.data.id).then((res:any) => {
            this.getPartnersList()
            this.openConfigSnackBar('record delete successfully')
        }, (error) => {
          console.log("error => " , error);
          
        })
      }
    });
  }

  getPartnersList() {
    this.loaderService.setLoader(true)
    this.firebaseService.getAllPartners().subscribe((res: any) => {
      if (res) {
        this.partnersList = res.filter((id:any) => id.userId === localStorage.getItem("userId"))
        this.partnersDataSource = new MatTableDataSource(this.partnersList);
        this.partnersDataSource.paginator = this.paginator;
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

}