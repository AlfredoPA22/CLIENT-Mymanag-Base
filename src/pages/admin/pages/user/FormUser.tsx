import { useMutation } from "@apollo/client";
import { Button } from "primereact/button";

import { AutoCompleteChangeEvent } from "primereact/autocomplete";
import { InputNumberChangeEvent } from "primereact/inputnumber";
import { InputSwitchChangeEvent } from "primereact/inputswitch";
import { FC, useEffect, useState } from "react";
import DropdownInput from "../../../../components/dropdownInput/DropdownInput";
import FieldInputSwitch from "../../../../components/inputSwitch/FieldInputSwitch";
import FieldNumberInput from "../../../../components/FieldNumberInput/FieldNumberInput";
import LoadingSpinner from "../../../../components/LoadingSpinner/LoadingSpinner";
import PasswordInput from "../../../../components/PasswordInput/PasswordInput";
import FieldTextInput from "../../../../components/textInput/FieldTextInput";
import { CREATE_USER, UPDATE_USER } from "../../../../graphql/mutations/User";
import { LIST_USER } from "../../../../graphql/queries/User";
import { useFormikForm } from "../../../../hooks/useFormikForm";
import { IRole } from "../../../../utils/interfaces/Role";
import { IUser, IUserInput } from "../../../../utils/interfaces/User";
import useRoleList from "../../hooks/useRoleList";
import {
  schemaFormUpdateUser,
  schemaFormUser,
} from "../../validations/FormUserValidation";

interface UserFormProps {
  setVisibleForm: (isVisible: boolean) => void;
  userToEdit?: IUser | null;
}

const UserForm: FC<UserFormProps> = ({ setVisibleForm, userToEdit }) => {
  const { listRole, loadingListRole } = useRoleList();

  const [selectedRole, setSelectedRole] = useState<IRole | null>(null);

  const [createUser] = useMutation(CREATE_USER, {
    refetchQueries: [{ query: LIST_USER }],
  });

  const [updateUser] = useMutation(UPDATE_USER, {
    refetchQueries: [{ query: LIST_USER }],
  });

  const initialValues: IUserInput = {
    user_name: userToEdit?.user_name || "",
    password: "",
    role: userToEdit?.role?._id || "",
    is_global: userToEdit?.is_global || false,
    commission_rate: userToEdit?.commission_rate ?? null,
  };

  const handleRoleChange = async (e: AutoCompleteChangeEvent) => {
    const { value } = e.target;
    setSelectedRole(value ? value : "");
    e.target.value = value ? value._id : "";
    setFieldValue(e.target.name, e.target.value);
  };

  const handleIsGlobalChange = (e: InputSwitchChangeEvent) => {
    setFieldValue(e.target.name, e.value);
  };

  const handleCommissionRateChange = (e: InputNumberChangeEvent) => {
    setFieldValue("commission_rate", e.value ?? null);
  };

  const onSubmit = async () => {
    if (userToEdit) {
      await updateUser({
        variables: {
          userId: userToEdit._id,
          user_name: values.user_name,
          role: values.role,
          is_global: values.is_global,
          commission_rate: values.commission_rate,
        },
      });
    } else {
      await createUser({ variables: values });
    }

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
    setFieldValue,
  } = useFormikForm({
    initialValues: initialValues,
    msgSuccess: "Usuario creado",
    handleSubmit: onSubmit,
    validationSchema: userToEdit ? schemaFormUpdateUser : schemaFormUser,
  });

  useEffect(() => {
    if (userToEdit && Array.isArray(listRole)) {
      const roleFound: IRole = listRole.find(
        (r: IRole) => r._id === userToEdit.role?._id
      );
      setSelectedRole(roleFound || null);
    }
  }, [userToEdit, listRole]);

  if (loadingListRole) {
    return <LoadingSpinner />;
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <section className="grid grid-cols-1 md:grid-cols-2 w-full md:w-[600px] gap-4">
        <FieldTextInput
          label="Nombre de usuario"
          type="text"
          name="user_name"
          placeholder="Usuario"
          mandatory
          value={values.user_name}
          error={errors.user_name ? errors.user_name : ""}
          onChange={handleChange}
        />

        <DropdownInput
          label="Rol"
          name="role"
          optionLabel="name"
          placeholder="Seleccionar rol"
          filter={true}
          showClear={true}
          mandatory
          options={listRole}
          value={selectedRole}
          error={errors.role ? errors.role : ""}
          onChange={handleRoleChange}
        />

        {!userToEdit && (
          <PasswordInput
            role="input-password"
            label="Contraseña"
            type="password"
            name="password"
            mandatory
            placeholder="Contraseña"
            value={values.password}
            error={errors.password ? errors.password : ""}
            onChange={handleChange}
          />
        )}

        <FieldInputSwitch
          label="Acceso Global"
          name="is_global"
          tooltip="Acceso global: permite ver todas las transacciones. Desactivado: solo las propias."
          checked={values.is_global}
          onChange={handleIsGlobalChange}
        />

        <FieldNumberInput
          label="Comisión por venta (%)"
          name="commission_rate"
          placeholder="Ej. 5"
          value={values.commission_rate ?? null}
          error={errors.commission_rate ? errors.commission_rate : ""}
          onChange={handleCommissionRateChange}
          min={0}
          max={100}
          suffix=" %"
        />
      </section>

      <section className="flex justify-center">
        <Button
          type="submit"
          severity="success"
          label="Guardar"
          className="w-full md:w-auto"
          disabled={!dirty || !isValid || isSubmitting}
        />
      </section>
    </form>
  );
};

export default UserForm;
