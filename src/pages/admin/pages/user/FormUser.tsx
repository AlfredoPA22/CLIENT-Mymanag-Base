import { useMutation } from "@apollo/client";
import { Button } from "primereact/button";

import { TreeSelectChangeEvent } from "primereact/treeselect";
import { FC, useState } from "react";
import LoadingSpinner from "../../../../components/LoadingSpinner/LoadingSpinner";
import FieldTextareaInput from "../../../../components/textAreaInput/FieldTextareaInput";
import FieldTextInput from "../../../../components/textInput/FieldTextInput";
import TreeSelectInput from "../../../../components/TreeSelectInput/TreeSelectInput";
import { CREATE_USER } from "../../../../graphql/mutations/User";
import { LIST_USER } from "../../../../graphql/queries/User";
import { useFormikForm } from "../../../../hooks/useFormikForm";
import { IUserInput } from "../../../../utils/interfaces/User";
import useRoleList from "../../hooks/useRoleList";
import { schemaFormRole } from "../../validations/FormRoleValidation";
import { AutoCompleteChangeEvent } from "primereact/autocomplete";
import { schemaFormUser } from "../../validations/FormUserValidation";
import DropdownInput from "../../../../components/dropdownInput/DropdownInput";

interface UserFormProps {
  setVisibleForm: (isVisible: boolean) => void;
}

const UserForm: FC<UserFormProps> = ({ setVisibleForm }) => {
  const { listRole, loadingListRole } = useRoleList();

  const [selectedRole, setSelectedRole] = useState(null);

  const [createUser] = useMutation(CREATE_USER, {
    refetchQueries: [{ query: LIST_USER }],
  });

  const initialValues: IUserInput = {
    user_name: "",
    password: "",
    role: "",
  };

  const handleRoleChange = async (e: AutoCompleteChangeEvent) => {
    const { value } = e.target;
    setSelectedRole(value ? value : "");
    e.target.value = value ? value._id : "";
    setFieldValue(e.target.name, e.target.value);
  };

  const onSubmit = async () => {
    await createUser({ variables: values });
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
    validationSchema: schemaFormUser,
  });

  if (loadingListRole) {
    return <LoadingSpinner />;
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <section className="grid  grid-cols-1 w-[300px] md:w-[600px] gap-4">
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

        <FieldTextInput
          label="Contraseña"
          type="text"
          name="password"
          placeholder="Contraseña"
          mandatory
          value={values.password}
          error={errors.password ? errors.password : ""}
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

export default UserForm;
