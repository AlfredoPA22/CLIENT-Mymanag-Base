import { FormikValues, useFormik } from "formik";
import { useDispatch } from "react-redux";
import { ObjectSchema } from "yup";
import { setIsBlocked } from "../redux/slices/blockUISlice";
import { ToastSeverity } from "../utils/enums/toast.enum";
import { showToast } from "../utils/toastUtils";

interface HookFormikFormProps<T> {
  initialValues: T;
  handleSubmit: () => Promise<void>;
  msgSuccess?: string;
  validationSchema?: ObjectSchema<object>;
}

export const useFormikForm = <T extends FormikValues>({
  initialValues,
  handleSubmit,
  msgSuccess,
  validationSchema,
}: HookFormikFormProps<T>) => {
  const dispatch = useDispatch();

  const formik = useFormik({
    initialValues,
    validationSchema: validationSchema || undefined,
    onSubmit: async () => {
      try {
        dispatch(setIsBlocked(true));
        await handleSubmit();
        if (msgSuccess) {
          showToast({
            detail: msgSuccess,
            severity: ToastSeverity.Success,
          });
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        // handleSubmit puede tirar un error "silencioso" (error.silent = true)
        // cuando ya manejó la situación por su cuenta (ej: abrió un modal para
        // resolverla) — evita mostrar tanto el toast de éxito (por eso el
        // throw) como uno de error genérico encima del modal.
        if (!error?.silent) {
          showToast({ detail: error.message, severity: ToastSeverity.Error });
        }
      } finally {
        dispatch(setIsBlocked(false));
      }
    },
  });

  return { ...formik };
};
