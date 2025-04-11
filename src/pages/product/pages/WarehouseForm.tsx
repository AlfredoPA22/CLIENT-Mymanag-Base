import { useMutation } from "@apollo/client";
import { Button } from "primereact/button";
import { FC } from "react";
import FieldTextareaInput from "../../../components/textAreaInput/FieldTextareaInput";
import FieldTextInput from "../../../components/textInput/FieldTextInput";
import { CREATE_WAREHOUSE } from "../../../graphql/mutations/Warehouse";
import { LIST_WAREHOUSE } from "../../../graphql/queries/Warehouse";
import { useFormikForm } from "../../../hooks/useFormikForm";
import {
    IWarehouseInput
} from "../../../utils/interfaces/Warehouse";
import { schemaFormWarehouse } from "../validations/FormWarehouseValidation";

interface WarehouseFormProps {
  setVisibleForm: (isVisible: boolean) => void;
}

const WarehouseForm: FC<WarehouseFormProps> = ({ setVisibleForm }) => {
  const [createWarehouse] = useMutation(CREATE_WAREHOUSE, {
    refetchQueries: [{ query: LIST_WAREHOUSE }],
  });
  const initialValues: IWarehouseInput = {
    name: "",
    description: "",
  };
  const onSubmit = async () => {
    await createWarehouse({ variables: values });
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
    msgSuccess: "Almacén creado",
    handleSubmit: onSubmit,
    validationSchema: schemaFormWarehouse,
  });
  return (
    <form onSubmit={handleSubmit} className="grid gap-4 justify-center">
      <section className="grid w-[300px] gap-4">
        <FieldTextInput
          role="input-name"
          label="Nombre"
          type="text"
          name="name"
          placeholder="Nombre"
          mandatory
          value={values.name}
          error={errors.name ? errors.name : ""}
          onChange={handleChange}
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

export default WarehouseForm;
