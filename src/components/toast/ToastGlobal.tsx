import React, { useEffect, useRef } from 'react';
import { Toast } from 'primereact/toast';
import { setToastRef } from '../../utils/toastUtils';

const ToastGlobal: React.FC = () => {
  const toast = useRef<Toast>(null);

  useEffect(() => {
    if (toast.current) {
      setToastRef(toast.current);
    }
  }, []);

  return <Toast role='toast-message' ref={toast} />;
};

export default ToastGlobal;
