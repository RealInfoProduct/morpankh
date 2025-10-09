import { DatePipe } from '@angular/common';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { FirebaseService } from 'src/app/services/firebase.service';
import { LoaderService } from 'src/app/services/loader.service';

@Component({
  selector: 'app-day-by-day',
  templateUrl: './day-by-day.component.html',
  styleUrls: ['./day-by-day.component.scss']
})
export class DayByDayComponent implements OnInit,AfterViewInit {
  displayedColumns: string[] = ['billNo', 'porduct', 'pickupdate', 'returndate', 'rent', 'status'];
  daybydayDataSource = new MatTableDataSource<any>([]);
  rentList: any[] = [];
  rentProductList: any[] = [];
  dateForm: FormGroup;
  selectedTabIndex :any = 0;

   @ViewChild(MatTable, { static: true }) table: MatTable<any> = Object.create(null);
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator = Object.create(null);

  constructor(
    private firebaseService: FirebaseService,
    private loaderService: LoaderService,
    private datePipe: DatePipe,
    private fb : FormBuilder
  ) {}

  ngOnInit(): void {
    this.getRentList();

    this.daybydayDataSource.filterPredicate = (data: any, filter: string): boolean => {
      filter = filter.toLowerCase();

      const product = (data.product || '').toLowerCase();
      const rent = (data.rent !== undefined && data.rent !== null) ? data.rent.toString().toLowerCase() : '';

      const pickup = this.formatDate(data.pickupDateTime).toLowerCase();
      const returnDate = this.formatDate(data.returnDateTime).toLowerCase();

      return (
        product.includes(filter) ||
        pickup.includes(filter) ||
        returnDate.includes(filter) ||
        rent.includes(filter)
      );
    };
    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    this.dateForm = this.fb.group({
      start: [startDate],
      end: [endDate]
    })

    this.dateForm.valueChanges.subscribe(() => {
      this.filterByDateRange();
    });
      this.daybydayDataSource = new MatTableDataSource();
        this.daybydayDataSource.paginator = this.paginator;
  }

  ngAfterViewInit(): void {
  // this.daybydayDataSource.paginator = this.paginator;
}


  filterByDateRange() {
    const { start, end } = this.dateForm.value;
    let filtered = this.rentList.filter(item => {
      return this.selectedTabIndex === 1
        ? item.status === 'Completed'
        : item.status !== 'Completed';
    });

    if (start instanceof Date && end instanceof Date) {
      const startMs = new Date(start).setHours(0,0,0,0);
      const endMs   = new Date(end).setHours(23,59,59,999);
      filtered = filtered.filter(item => {
        if (!item.pickupDateTime || typeof item.pickupDateTime.seconds !== 'number') return false;
        const pickupMs = item.pickupDateTime.seconds * 1000;
        return pickupMs >= startMs && pickupMs <= endMs;
      });
    }

    this.daybydayDataSource.data = filtered;
  }


  applyFilter(filterValue: string): void {
    this.daybydayDataSource.filter = filterValue.trim().toLowerCase();
  }

  formatDate(timestamp: any): string {
    if (!timestamp) return '';

    const date = timestamp?.seconds
      ? new Date(timestamp.seconds * 1000)
      : timestamp?.toDate
        ? timestamp.toDate()
        : new Date(timestamp);

    return this.datePipe.transform(date, 'dd/MM/yyyy hh:mm a') || '';
  }


  getRentList(): void {
    this.loaderService.setLoader(true);
    this.firebaseService.getAllRent().subscribe((res: any[]) => {
      const userId = localStorage.getItem('userId');
      const rents = res?.filter(r => r.userId === userId) || [];
      
      this.rentList = rents.flatMap(r => r.rentDetails || []).sort((a, b) => a.pickupDateTime?.toDate() - b.pickupDateTime?.toDate());
      this.updateDataSource("pending");
      this.getRentListProduct();
    });
  }
  
  onTabChange(event: any): void {
    this.selectedTabIndex = event.index;
    this.filterByDateRange();
    
  }
  
  updateDataSource(status: "completed" | "pending"): void {
    this.daybydayDataSource.data = this.rentList.filter(order =>
      status === "completed" ? order.status === "Completed" : order.status !== "Completed"
    );
    // this.daybydayDataSource.paginator = this.paginator;
  }

  getRentListProduct(): void {
    this.firebaseService.getAllRentProduct().subscribe((res: any[]) => {
      const userId = localStorage.getItem('userId');
      this.rentProductList = res?.filter(r => r.userId === userId) || [];

      this.rentList.forEach(rent => {
        const product = this.rentProductList.find(p => p.id === rent.rentProducts);
        rent.product = product ? `${product.productNumber} - ${product.productName}` : '';
      });

      this.loaderService.setLoader(false);
    });
  }
}