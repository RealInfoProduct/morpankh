import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FullComponent } from 'src/app/layouts/full/full.component';
import { ProductMasterComponent } from './product-master/product-master.component';
import { PurchaseMasterComponent } from './purchase-master/purchase-master.component';
import { ShellMasterComponent } from './shell-master/shell-master.component';
import { ShellListComponent } from './shell-list/shell-list.component';
import { CreateinvoiceComponent } from './createinvoice/createinvoice.component';
import { InvoiceListComponent } from './invoice-list/invoice-list.component';
import { InvoiceViewComponent } from './invoice-view/invoice-view.component';
import { RentProductComponent } from './rent-product/rent-product.component';
import { RentComponent } from './rent/rent.component';
import { AccountComponent } from './account/account.component';
import { IncomeExpenseComponent } from './income-expense/income-expense.component';
import { BalanceComponent } from './balance/balance.component';
import { DayByDayComponent } from './day-by-day/day-by-day.component';
import { InvestmentComponent } from './investment/investment.component';
import { PartnersComponent } from './partners/partners.component';


export const MasterRoutes: Routes = [
  {
    path: '',
    component: FullComponent,
    children: [
      {
        path: 'productmaster',
        component: ProductMasterComponent,
        data: {
          title: 'Product Master',
          urls: [
            { title: 'Master', url: '/master/productmaster' },
            { title: 'Product Master' },
          ],
        },
      },
      {
        path: 'purchase',
        component: PurchaseMasterComponent,
        data: {
          title: 'Purchase',
          urls: [
            { title: 'Master', url: '/master/purchase' },
            { title: 'Purchase' },
          ],
        },
      },
      {
        path: 'shell',
        component: ShellMasterComponent,
        data: {
          title: 'Shell',
          urls: [
            { title: 'Master', url: '/master/shell' },
            { title: 'Shell' },
          ],
        },
      },
      {
        path: 'shelllist',
        component: ShellListComponent,
        data: {
          title: 'Shell List',
          urls: [
            { title: 'Master', url: '/master/shelllist' },
            { title: 'Shell List' },
          ],
        },
      },
      {
        path: 'invoice',
        component: CreateinvoiceComponent,
        data: {
          title: 'invoice',
          urls: [
            { title: 'Master', url: '/master/invoice' },
            { title: 'invoice' },
          ],
        },
      },
      {
        path: 'rentproducts',
        component: RentProductComponent,
        data: {
          title: 'Rent Products',
          urls: [
            { title: 'Master', url: '/master/rentproducts' },
            { title: 'Rent Products' },
          ],
        },
      },
      {
        path: 'rent',
        component: RentComponent,
        data: {
          title: 'Rent',
          urls: [
            { title: 'Master', url: '/master/rent' },
            { title: 'Rent' },
          ],
        },
      },
      {
        path: 'account',
        component: AccountComponent,
        data: {
          title: 'Account',
          urls: [
            { title: 'Master', url: '/master/account' },
            { title: 'Account' },
          ],
        },
      },
      {
        path: 'invoicelist',
        component: InvoiceListComponent,
        data: {
          title: 'Invoice List',
          urls: [
            { title: 'Master', url: '/master/invoicelist' },
            { title: 'Invoice List' },
          ],
        },
      },
      {
        path: 'viewinvoice/:id',
        component: InvoiceViewComponent,
        data: {
          title: 'View Invoice',
          urls: [
            { title: 'Master', url: '/master/viewinvoice' },
            { title: 'View Invoice' },
          ],
        },
      },
      {
        path: 'income-expense',
        component: IncomeExpenseComponent,
        data: {
          title: 'Income Expense',
          urls: [
            { title: 'Master', url: '/master/income-expense' },
            { title: 'Income Expense' },
          ],
        },
      },
      {
        path: 'balance',
        component: BalanceComponent,
        data: {
          title: 'Balance',
          urls: [
            { title: 'Master', url: '/master/balance' },
            { title: 'Balance' },
          ],
        },
      },
      {
        path: 'investment',
        component: InvestmentComponent,
        data: {
          title: 'Investment',
          urls: [
            { title: 'Master', url: '/master/investment' },
            { title: 'Investment' },
          ],
        },
      },
      {
        path: 'partners',
        component: PartnersComponent,
        data: {
          title: 'Partners',
          urls: [
            { title: 'Master', url: '/master/partners' },
            { title: 'Partners' },
          ],
        },
      },
      {
        path: 'day-by-day',
        component: DayByDayComponent,
        data: {
          title: 'day-by-day',
          urls: [
            { title: 'Master', url: '/master/day-by-day' },
            { title: 'day-by-day' },
          ],
        },
      }
    ],
  }
];

@NgModule({
  imports: [RouterModule.forChild(MasterRoutes)],
  exports: [RouterModule]
})
export class MasterRoutingModule { }
