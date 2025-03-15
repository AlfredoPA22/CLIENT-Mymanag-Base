import { ToastSeverity } from '../enums/toast.enum';

export interface IToastInterface {
  detail: string;
  severity: ToastSeverity;
  life?: number;
}
