import { Toast } from 'primereact/toast';
import { IToastInterface } from './interfaces/Toast';

let toast: Toast | null = null;

export const setToastRef = (ref: Toast) => {
  toast = ref;
};

export const showToast = (config: IToastInterface) => {
  if (toast) {
    toast.show({
      ...config,
      summary: config.severity,
      life: config.life || 3000,
    });
  }
};
