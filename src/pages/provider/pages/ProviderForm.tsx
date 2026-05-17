import { useMutation } from "@apollo/client";
import { Button } from "primereact/button";
import { FC } from "react";
import FieldTextInput from "../../../components/textInput/FieldTextInput";
import { CREATE_PROVIDER } from "../../../graphql/mutations/Provider";
import { LIST_PROVIDER } from "../../../graphql/queries/Provider";
import { useFormikForm } from "../../../hooks/useFormikForm";
import { IProviderInput } from "../../../utils/interfaces/Provider";
import {
  schemaFormProvider
} from "../validations/FormProviderValidation";

interface ProviderFormProps {
  setVisibleForm: (isVisible: boolean) => void;
}

const ProviderForm: FC<ProviderFormProps> = ({ setVisibleForm }) => {
  const [createProvider] = useMutation(CREATE_PROVIDER, {
    refetchQueries: [{ query: LIST_PROVIDER }],
  });
  const initialValues: IProviderInput = {
    name: "",
    address: "",
    phoneNumber: "",
  };
  const onSubmit = async () => {
    await createProvider({ variables: values });
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
    msgSuccess: "Proveedor creado",
    handleSubmit: onSubmit,
    validationSchema: schemaFormProvider,
  });
  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <section className="grid md:grid-cols-2 grid-cols-1 w-full md:w-[600px] gap-4">
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
        <FieldTextInput
          label="Direccion"
          type="text"
          name="address"
          placeholder="Direccion"
          value={values.address}
          error={errors.address ? errors.address : ""}
          onChange={handleChange}
        />
        <FieldTextInput
          label="Telefono"
          type="text"
          name="phoneNumber"
          placeholder="Telefono"
          value={values.phoneNumber}
          error={errors.phoneNumber ? errors.phoneNumber : ""}
          onChange={handleChange}
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

export default ProviderForm;
