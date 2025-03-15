import { MenuItem } from 'primereact/menuitem';

export interface MenuModuleItem extends MenuItem {
  href: string;
  current: boolean;
}
