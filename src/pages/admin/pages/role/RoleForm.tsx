import { useMutation } from "@apollo/client";
import { Button } from "primereact/button";

import {
  TreeSelectChangeEvent,
  TreeSelectSelectionKeysType,
} from "primereact/treeselect";
import { FC, useState } from "react";
import LoadingSpinner from "../../../../components/LoadingSpinner/LoadingSpinner";
import FieldTextareaInput from "../../../../components/textAreaInput/FieldTextareaInput";
import FieldTextInput from "../../../../components/textInput/FieldTextInput";
import TreeSelectInput from "../../../../components/TreeSelectInput/TreeSelectInput";
import { CREATE_ROLE } from "../../../../graphql/mutations/Role";
import { LIST_ROLE } from "../../../../graphql/queries/Role";
import { useFormikForm } from "../../../../hooks/useFormikForm";
import { IRoleInput } from "../../../../utils/interfaces/Role";
import usePermissionList from "../../hooks/usePermissionList";
import { schemaFormRole } from "../../validations/FormRoleValidation";

interface RoleFormProps {
  setVisibleForm: (isVisible: boolean) => void;
}

const RoleForm: FC<RoleFormProps> = ({ setVisibleForm }) => {
  const { listPermissionSelect, loadingListPermission } = usePermissionList();

  const [selectedPermissions, setSelectedPermissions] = useState<
    string | TreeSelectSelectionKeysType | TreeSelectSelectionKeysType[] | null
  >(null);

  const [createRole] = useMutation(CREATE_ROLE, {
    refetchQueries: [{ query: LIST_ROLE }],
  });

  const initialValues: IRoleInput = {
    name: "",
    description: "",
    permission: [],
  };

  const handleChangePermissions = async (e: TreeSelectChangeEvent) => {
    const { name, value } = e.target;

    setSelectedPermissions(value || null);

    const permissionKeys: string[] = Object.keys(value || {}).filter(
      (key) => !key.startsWith("ALL_")
    );
    e.target.value = value || null;
    setFieldValue(name, permissionKeys);
  };

  const onSubmit = async () => {
    await createRole({ variables: values });
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
    msgSuccess: "Rol creado",
    handleSubmit: onSubmit,
    validationSchema: schemaFormRole,
  });

  if (loadingListPermission) {
    return <LoadingSpinner />;
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <section className="grid  grid-cols-1 w-[300px] md:w-[600px] gap-4">
        <FieldTextInput
          label="Nombre"
          type="text"
          name="name"
          placeholder="Nombre"
          mandatory
          value={values.name}
          error={errors.name ? errors.name : ""}
          onChange={handleChange}
        />

        <TreeSelectInput
          role="input-permission"
          label="Permisos"
          name="permission"
          placeholder="Seleccione los permisos"
          filter={true}
          mandatory
          showClear={true}
          selectionMode="checkbox"
          options={listPermissionSelect}
          value={selectedPermissions}
          onChange={handleChangePermissions}
        />

        <FieldTextareaInput
          role="input-description"
          label="Descripcion"
          name="description"
          value={values.description}
          rows={5}
          cols={30}
          error={errors.description ? errors.description : ""}
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

export default RoleForm;
