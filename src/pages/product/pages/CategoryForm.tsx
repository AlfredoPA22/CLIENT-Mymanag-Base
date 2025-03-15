import { ICategoryInput } from "../../../utils/interfaces/Category";
import { useFormikForm } from "../../../hooks/useFormikForm";
import { schemaFormCategory } from "../validations/FormCategoryValidation";
import FieldTextInput from "../../../components/textInput/FieldTextInput";
import FieldTextareaInput from "../../../components/textAreaInput/FieldTextareaInput";
import { Button } from "primereact/button";
import { useMutation } from "@apollo/client";
import { CREATE_CATEGORY } from "../../../graphql/mutations/Category";
import { LIST_CATEGORY } from "../../../graphql/queries/Category";
import { FC } from "react";

interface CategoryFormProps {
  setVisibleForm: (isVisible: boolean) => void;
}

const CategoryForm: FC<CategoryFormProps> = ({ setVisibleForm }) => {
  const [createCategory] = useMutation(CREATE_CATEGORY, {
    refetchQueries: [{ query: LIST_CATEGORY }],
  });
  const initialValues: ICategoryInput = {
    name: "",
    description: "",
  };
  const onSubmit = async () => {
    await createCategory({ variables: values });
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
    msgSuccess: "Categoria creada",
    handleSubmit: onSubmit,
    validationSchema: schemaFormCategory,
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
          role="submit-warehouse"
          type="submit"
          severity="success"
          label="Guardar"
          disabled={!dirty || !isValid || isSubmitting}
        />
      </section>
    </form>
  );
};

export default CategoryForm;
