import { FormikValues, useFormik } from "formik";
import { useState } from "react";
import { ObjectSchema } from "yup";
import { showToast } from "../utils/toastUtils";
import { ToastSeverity } from "../utils/enums/toast.enum";

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
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const formik = useFormik({
    initialValues,
    validationSchema: validationSchema || undefined,
    onSubmit: async () => {
      try {
        setIsSubmitting(true);
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
        setIsSubmitting(false);
      }
    },
  });

  return { ...formik, isSubmitting };
};
