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
    displayName: 'Rent',
    iconName: 'hanger',
    route: '/master/rent',
  },
  {
    navCap: 'Master',
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
  {
    displayName: 'Rent Product',
    iconName: 'hanger-2',
    route: '/master/rentproducts',
  },

  // {
  //   displayName: 'Account',
  //   iconName: 'hanger',
  //   route: '/master/account',
  // },
]