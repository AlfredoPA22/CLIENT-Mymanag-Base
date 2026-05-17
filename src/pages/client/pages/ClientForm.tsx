import { useFormikForm } from "../../../hooks/useFormikForm";
import { schemaFormClient } from "../validations/FormClientValidation";
import FieldTextInput from "../../../components/textInput/FieldTextInput";
import { Button } from "primereact/button";
import { useMutation } from "@apollo/client";
import { CREATE_CLIENT } from "../../../graphql/mutations/Client";
import { LIST_CLIENT } from "../../../graphql/queries/Client";
import { FC } from "react";
import { IClientInput } from "../../../utils/interfaces/Client";

interface ClientFormProps {
  setVisibleForm: (isVisible: boolean) => void;
}

const ClientForm: FC<ClientFormProps> = ({ setVisibleForm }) => {
  const [createClient] = useMutation(CREATE_CLIENT, {
    refetchQueries: [{ query: LIST_CLIENT }],
  });
  const initialValues: IClientInput = {
    fullName: "",
    email: "",
    address: "",
    phoneNumber: "",
  };
  const onSubmit = async () => {
    await createClient({ variables: values });
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
    msgSuccess: "Cliente creado",
    handleSubmit: onSubmit,
    validationSchema: schemaFormClient,
  });
  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <section className="grid md:grid-cols-2 grid-cols-1 w-full md:w-[600px] gap-4">
        <FieldTextInput
          label="Nombre completo"
          type="text"
          name="fullName"
          placeholder="Nombre completo"
          mandatory
          value={values.fullName}
          error={errors.fullName ? errors.fullName : ""}
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
        <FieldTextInput
          label="Correo"
          type="text"
          name="email"
          placeholder="Correo"
          value={values.email}
          error={errors.email ? errors.email : ""}
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

export default ClientForm;
