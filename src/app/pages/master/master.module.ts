import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

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
    accountDialogComponent
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
  ],
  providers: [DatePipe],
})
export class MasterModule { }
