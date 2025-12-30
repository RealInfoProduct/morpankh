import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { Subscription } from 'rxjs';
import { BreakpointService } from 'src/app/services/breakpoint.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import { LoaderService } from 'src/app/services/loader.service';

@Component({
  selector: 'app-updatestatus',
  templateUrl: './updatestatus.component.html',
  styleUrls: ['./updatestatus.component.scss']
})
export class UpdatestatusComponent implements OnInit {
  updatestatusList: any[] = [];
   selection: any[] = [];
   rents: any[] = [];
   filteredRentDetails: any[] = [];
   rentProductList: any[] = [];
   rentList: any[] = [];
     isMobile: boolean = false;
     subcription = new Subscription();


   displayedColumns: string[] = ['select','billNo', 'porduct', 'pickupdate', 'returndate', 'rent', 'status'];
 updatestatusDataSource  = new MatTableDataSource(this.updatestatusList);

    @ViewChild(MatTable, { static: true }) table: MatTable<any> = Object.create(null);
  @ViewChild(MatPaginator) paginator!: MatPaginator


  constructor(
    private firebaseService: FirebaseService,
        private loaderService: LoaderService,
         private _snackBar: MatSnackBar,
         private breakpointService: BreakpointService
  ) { 

  }

  ngOnInit(): void {
      this.subcription.add(
      this.breakpointService.breakpoint$.subscribe(bpState => {
        this.isMobile = bpState.isMobile;
      })
    );
    this.getRentList();
    this.getRentProductList();
  }

    ngOnDestroy(): void {
    this.subcription.unsubscribe();
  }

// getRentList(): void {
//   this.loaderService.setLoader(true);
//   this.firebaseService.getAllRent().subscribe((res: any[]) => {
//     const userId = localStorage.getItem('userId');
//     this.rents = res?.filter(r => r.userId === userId) || [];

//     let allRentDetails = this.rents.flatMap((r: any) => r.rentDetails || []);

//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     const filteredRentDetails = allRentDetails.filter(d => {
//       const pickupDate = d.returnDateTime?.toDate ? d.returnDateTime.toDate() : new Date(d.returnDateTime);
//       pickupDate.setHours(0, 0, 0, 0); 
//       return pickupDate.getTime() < today.getTime();
//     });

//     filteredRentDetails.sort((a, b) => {
//       const dateA = a.returnDateTime?.toDate ? a.returnDateTime.toDate() : new Date(a.returnDateTime);
//       const dateB = b.returnDateTime?.toDate ? b.returnDateTime.toDate() : new Date(b.returnDateTime);
//       return dateA.getTime() - dateB.getTime();
//     });

//     this.updatestatusDataSource = new MatTableDataSource(filteredRentDetails);
//     this.updatestatusDataSource.paginator = this.paginator;

//     this.loaderService.setLoader(false);
//   });
// }


getRentList(): void {
  this.loaderService.setLoader(true);
  this.firebaseService.getAllRent().subscribe((res: any[]) => {
    const userId = localStorage.getItem('userId');
    this.rents = res?.filter(r => r.userId === userId) || [];

    let allRentDetails = this.rents.flatMap((r: any) => r.rentDetails || []);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

   this.filteredRentDetails = allRentDetails.filter(d => {
      const pickupDate = d.returnDateTime?.toDate ? d.returnDateTime.toDate() : new Date(d.returnDateTime);
      pickupDate.setHours(0, 0, 0, 0); 
      return (
        pickupDate.getTime() < today.getTime() &&
        d.status === 'Booked' 
      )
      });

    this.filteredRentDetails.sort((a, b) => {
      const dateA = a.returnDateTime?.toDate ? a.returnDateTime.toDate() : new Date(a.returnDateTime);
      const dateB = b.returnDateTime?.toDate ? b.returnDateTime.toDate() : new Date(b.returnDateTime);
      return dateA.getTime() - dateB.getTime();
    });

    this.updatestatusDataSource = new MatTableDataSource(this.filteredRentDetails);
    this.updatestatusDataSource.paginator = this.paginator;
    this.loaderService.setLoader(false);
  });
}



  toggleRowSelection(element: any) {
  const index = this.selection.indexOf(element);
  if (index === -1) {
    this.selection.push(element);
  } else {
    this.selection.splice(index, 1);
  }
}

isAllSelected() {
  return this.selection === this.rents;
  
}

isIndeterminate() {
  return this.selection.length > 0 && !this.isAllSelected();
}

toggleAllRows(event: any) {
  if (event.checked) {
    console.log(this.selection);
    this.selection = [...this.updatestatusDataSource.data];
  } else {
    this.selection = [];
  }
}

    updateStatus() {
      if (!this.selection || this.selection.length === 0) {
        alert('Please select at least one record to update.');
        return;
      }
      
      this.loaderService.setLoader(true);
      
      const updatePromises = this.selection.map((selectedDetail: any) => {
        const rentObj = this.rents.find(r =>
          r.rentDetails && r.rentDetails.some((d: any) => d.billNo === selectedDetail.billNo && d.id === selectedDetail.id)
        );
        

        if (rentObj) {
          const updatedRentDetails = rentObj.rentDetails.map((detail: any) => {
            if (detail.billNo === selectedDetail.billNo && detail.id === selectedDetail.id && detail.status === 'Booked') {
              return { ...detail, status: 'Completed' };
            }
            return detail;
          });
          const payload = { ...rentObj, rentDetails: updatedRentDetails , status: 'Completed'};
          return this.firebaseService.updateRent(rentObj.id, payload)
            .then(() => console.log(`✅ Updated rent ${rentObj.id}`))
            .catch((err: any) => console.error(`❌ Error updating rent ${rentObj.id}`, err));
        }

        return Promise.resolve();
      });

      Promise.all(updatePromises)
        .then(() => {
          this.getRentList();
          this.openConfigSnackBar('Selected records updated successfully.');
          this.selection = []; 
        })
        .catch((err) => {
          console.error('Error updating records:', err);
          this.openConfigSnackBar('Error updating some records.');
        })
        .finally(() => {
          this.loaderService.setLoader(false);
        });

    }




openConfigSnackBar(snackbarTitle: any) {
    this._snackBar.open(snackbarTitle, 'Splash', {
      duration: 2 * 1000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }

    getRentProductList() {
    this.loaderService.setLoader(true)
    this.firebaseService.getAllRentProduct().subscribe((res: any) => {
      if (res) {
         this.rentProductList = res.filter((id: any) => id.userId === localStorage.getItem("userId"))
        this.loaderService.setLoader(false)
      }
    })
  }

    getrentProductNameById(partnersId: string): string {
    if (!this.rentProductList) return '';
    const partners = this.rentProductList.find((b: any) => b.id === partnersId);
    return partners ? `${partners.productNumber} - ${partners.productName}` : '';
  }


   pageSize = 5;
  currentPage = 0;
  // pageSizeOptions = [3, 6, 9, 12];

  // Get paginated cards
  get paginatedCards(): any[] {
    const startIndex = this.currentPage * this.pageSize;
    return this.updatestatusDataSource.data.slice(startIndex, startIndex + this.pageSize);
  }

  // Handle page event
  onPageChange(event: PageEvent) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  // Get display info
  get displayInfo(): string {
    const start = this.currentPage * this.pageSize + 1;
    const end = Math.min((this.currentPage + 1) * this.pageSize, this.updatestatusDataSource.data.length);
    return `Showing ${start}-${end} of ${this.updatestatusDataSource.data.length} items`;
  }

}
