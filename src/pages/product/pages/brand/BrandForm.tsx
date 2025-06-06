import { useMutation } from "@apollo/client";
import { Button } from "primereact/button";
import { FC } from "react";
import { CREATE_BRAND } from "../../../../graphql/mutations/Brand";
import { LIST_BRAND } from "../../../../graphql/queries/Brand";
import { IBrandInput } from "../../../../utils/interfaces/Brand";
import { useFormikForm } from "../../../../hooks/useFormikForm";
import { schemaFormBrand } from "../../validations/FormBrandValidation";
import FieldTextInput from "../../../../components/textInput/FieldTextInput";
import FieldTextareaInput from "../../../../components/textAreaInput/FieldTextareaInput";

interface BrandFormProps {
  setVisibleForm: (isVisible: boolean) => void;
}

const BrandForm: FC<BrandFormProps> = ({ setVisibleForm }) => {
  const [createBrand] = useMutation(CREATE_BRAND, {
    refetchQueries: [{ query: LIST_BRAND }],
  });
  const initialValues: IBrandInput = {
    name: "",
    description: "",
  };
  const onSubmit = async () => {
    await createBrand({ variables: values });
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
    msgSuccess: "Marca creada",
    handleSubmit: onSubmit,
    validationSchema: schemaFormBrand,
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

export default BrandForm;
