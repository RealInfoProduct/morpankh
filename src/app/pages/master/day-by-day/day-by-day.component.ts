import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { FirebaseService } from 'src/app/services/firebase.service';
import { LoaderService } from 'src/app/services/loader.service';

@Component({
  selector: 'app-day-by-day',
  templateUrl: './day-by-day.component.html',
  styleUrls: ['./day-by-day.component.scss']
})
export class DayByDayComponent implements OnInit {
  displayedColumns: string[] = ['billNo', 'porduct', 'pickupdate', 'returndate', 'rent', 'status'];
  daybydayDataSource = new MatTableDataSource<any>([]);
  rentList: any[] = [];
  rentProductList: any[] = [];

  @ViewChild(MatTable, { static: true }) table!: MatTable<any>;
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;

  constructor(
    private firebaseService: FirebaseService,
    private loaderService: LoaderService,
     private datePipe: DatePipe
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
      const filtered = res?.filter(r => r.userId === userId) || [];
      this.rentList = filtered.flatMap(r => r.rentDetails || []).sort((a, b) => a.pickupDateTime?.toDate() - b.pickupDateTime?.toDate());
      this.daybydayDataSource.data = this.rentList;
      this.getRentListProduct();
    });
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