import { useMutation } from "@apollo/client";
import { Button } from "primereact/button";
import { FC } from "react";
import PasswordInput from "../../../../components/PasswordInput/PasswordInput";
import { CHANGE_PASSWORD } from "../../../../graphql/mutations/User";
import { LIST_USER } from "../../../../graphql/queries/User";
import { useFormikForm } from "../../../../hooks/useFormikForm";
import { IChangePasswordInput, IUser } from "../../../../utils/interfaces/User";
import { schemaFormChangePassword } from "../../validations/FormChangePasswordValidation";

interface ChangePasswordFormProps {
  setVisibleForm: (isVisible: boolean) => void;
  userToEdit?: IUser | null;
}

const ChangePasswordForm: FC<ChangePasswordFormProps> = ({
  setVisibleForm,
  userToEdit,
}) => {
  const [changePassword] = useMutation(CHANGE_PASSWORD, {
    refetchQueries: [{ query: LIST_USER }],
  });

  const initialValues: IChangePasswordInput = {
    currentPassword: "",
    newPassword: "",
  };

  const onSubmit = async () => {
    await changePassword({
      variables: {
        userId: userToEdit!._id,
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      },
    });

    setVisibleForm(false);
    resetForm();
  };

  const {
    handleChange,
    handleSubmit,
    resetForm,
    values,
    errors,
    dirty,
    isValid,
    isSubmitting,
  } = useFormikForm({
    initialValues: initialValues,
    msgSuccess: "Contraseña actualizada",
    handleSubmit: onSubmit,
    validationSchema: schemaFormChangePassword,
  });

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <section className="grid  grid-cols-2 w-[300px] md:w-[600px] gap-4">
        <PasswordInput
          role="input-current-password"
          label="Contraseña Actual"
          type="password"
          name="currentPassword"
          mandatory
          placeholder="Contraseña Actual"
          value={values.currentPassword}
          error={errors.currentPassword ? errors.currentPassword : ""}
          onChange={handleChange}
        />

        <PasswordInput
          role="input-new-password"
          label="Nueva Contraseña"
          type="password"
          name="newPassword"
          mandatory
          placeholder="Nueva Contraseña"
          value={values.newPassword}
          error={errors.newPassword ? errors.newPassword : ""}
          onChange={handleChange}
        />
      </section>

      <section className="flex justify-center">
        <Button
          type="submit"
          severity="success"
          label="Guardar"
          disabled={!dirty || !isValid || isSubmitting}
        />
      </section>
    </form>
  );
};

export default ChangePasswordForm;
