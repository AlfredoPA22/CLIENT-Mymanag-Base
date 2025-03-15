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
    firstName: "",
    lastName: "",
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
      <section className="grid md:grid-cols-2 grid-cols-1 w-[300px] md:w-[600px] gap-4">
        <FieldTextInput
          label="Nombre"
          type="text"
          name="firstName"
          placeholder="Nombre"
          mandatory
          value={values.firstName}
          error={errors.firstName ? errors.firstName : ""}
          onChange={handleChange}
        />
        <FieldTextInput
          label="Apellidos"
          type="text"
          name="lastName"
          placeholder="Apellidos"
          mandatory
          value={values.lastName}
          error={errors.lastName ? errors.lastName : ""}
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
          disabled={!dirty || !isValid || isSubmitting}
        />
      </section>
    </form>
  );
};

export default ClientForm;
