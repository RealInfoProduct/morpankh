import { NgModule } from '@angular/core';
import { CommonModule, DatePipe, NgClass } from '@angular/common';

import { MasterRoutes, MasterRoutingModule } from './master-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { RouterModule } from '@angular/router';
import { TablerIconsModule } from 'angular-tabler-icons';
import { NgApexchartsModule } from 'ng-apexcharts';
import { MaterialModule } from 'src/app/material.module';
import { ProductMasterComponent, productMasterDialogComponent} from './product-master/product-master.component';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpLoaderFactory } from 'src/app/app.module';
import { HttpClient } from '@angular/common/http';
import { PurchaseMasterComponent} from './purchase-master/purchase-master.component';
import { ShellMasterComponent } from './shell-master/shell-master.component';
import { ShellListComponent } from './shell-list/shell-list.component';
import { BarcodeStickerComponent } from './barcode-sticker/barcode-sticker.component';
import { CreateinvoiceComponent } from './createinvoice/createinvoice.component';
import { InvoiceListComponent } from './invoice-list/invoice-list.component';
import { InvoiceViewComponent } from './invoice-view/invoice-view.component';
import { RentProductComponent, rentproductMasterDialogComponent } from './rent-product/rent-product.component';
import { RentComponent, rentDialogComponent } from './rent/rent.component';
import { NgxMatNativeDateModule, NgxMatDatetimePickerModule, NgxMatTimepickerModule } from '@angular-material-components/datetime-picker';
import { AccountComponent, accountDialogComponent } from './account/account.component';
import { IncomeExpenseComponent } from './income-expense/income-expense.component';
import { ExpenseDialogComponent } from './income-expense/expense-dialog/expense-dialog.component';
import { BalanceComponent } from './balance/balance.component';
import { DayByDayComponent } from './day-by-day/day-by-day.component';
import { InvestmentComponent } from './investment/investment.component';
import { PartnersComponent } from './partners/partners.component';
import { PartnersDialogComponent } from './partners/partners-dialog/partners-dialog.component';
import { InvestmentDialogComponent } from './investment/investment-dialog/investment-dialog.component';
import { ShellConfirmationDialogComponent } from './shell-list/shell-confirmation-dialog/shell-confirmation-dialog.component';
import { UpdatestatusComponent } from './rent/updatestatus/updatestatus.component';
import { InfoDialogComponent } from './rent/info-dialog/info-dialog.component';

@NgModule({
  declarations: [
    ProductMasterComponent,
    productMasterDialogComponent,
    rentproductMasterDialogComponent,
    rentDialogComponent,
    PurchaseMasterComponent,
    ShellMasterComponent,
    ShellListComponent,
    BarcodeStickerComponent,
    CreateinvoiceComponent,
    InvoiceListComponent,
    InvoiceViewComponent,
    RentProductComponent,
    RentComponent,
    AccountComponent,
    accountDialogComponent,
    IncomeExpenseComponent,
    ExpenseDialogComponent,
    BalanceComponent,
    DayByDayComponent,
    InvestmentComponent,
    PartnersComponent,
    PartnersDialogComponent,
    InvestmentDialogComponent,
    ShellConfirmationDialogComponent,
    UpdatestatusComponent,
    InfoDialogComponent
  ],
  imports: [
    CommonModule,
    MasterRoutingModule,
    RouterModule.forChild(MasterRoutes),
    MaterialModule,
    FormsModule,
    MaterialModule,
    ReactiveFormsModule,
    TablerIconsModule,
    MatNativeDateModule,
    NgApexchartsModule,
    NgxMatDatetimePickerModule,
    NgxMatTimepickerModule,
     NgxMatNativeDateModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
    NgClass,
  ],
  providers: [DatePipe],
})
export class MasterModule { }
