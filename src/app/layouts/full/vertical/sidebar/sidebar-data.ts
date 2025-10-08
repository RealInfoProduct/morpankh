import { NavItem } from './nav-item/nav-item';

export const navItems: NavItem[] = [
  {
    navCap: 'Home',
  },
  {
    displayName: 'Dashboard',
    iconName: 'aperture',
    route: '/dashboards/dashboard1',
  },
  {
    navCap: 'Rent',
  },
  {
    displayName: 'Order',
    iconName: 'hanger',
    route: '/master/rent',
  },
  {
    displayName: 'Product',
    iconName: 'hanger-2',
    route: '/master/rentproducts',
  },
  {
    displayName: 'Day by day',
    iconName: 'hanger-2',
    route: '/master/day-by-day',
  },
  {
    navCap: 'Financial',
  },
   {
    displayName: 'Income/Expense',
    iconName: 'hanger-2',
    route: '/master/income-expense',
  },
  {
    displayName: 'Balance',
    iconName: 'hanger-2',
    route: '/master/balance',
  },
  {
    displayName: 'Investment',
    iconName: 'hanger-2',
    route: '/master/investment',
  },
  {
    displayName: 'Partners',
    iconName: 'hanger-2',
    route: '/master/partners',
  },
  {
    navCap: 'Stock',
  },
  {
    displayName: 'Product Master',
    iconName: 'brand-asana',
    route: '/master/productmaster',
  },
  {
    displayName: 'Purchase',
    iconName: 'file-invoice',
    route: '/master/purchase',
  },
  {
    displayName: 'Add Shell',
    iconName: 'receipt-tax',
    route: '/master/invoice',
  },  
  {
    displayName: 'Shell List',
    iconName: 'building-store',
    route: '/master/shelllist',
  },
  {
    displayName: 'Invoice List',
    iconName: 'list-details',
    route: '/master/invoicelist',
  },
 

  // {
  //   displayName: 'Account',
  //   iconName: 'hanger',
  //   route: '/master/account',
  // },
]