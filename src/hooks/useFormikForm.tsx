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
        showToast({ detail: error.message, severity: ToastSeverity.Error });
      } finally {
        dispatch(setIsBlocked(false));
      }
    },
  });

  return { ...formik };
};
