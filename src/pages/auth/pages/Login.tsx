import { Button } from "primereact/button";
import { Card } from "primereact/card";

import { useFormikForm } from "../../../hooks/useFormikForm";

import useAuth from "../hooks/useAuth";
import { schemaLogin } from "../utils/validations/LoginValidation";

import PasswordInput from "../../../components/PasswordInput/PasswordInput";
import FieldTextInput from "../../../components/textInput/FieldTextInput";
import { ILoginInput } from "../../../utils/interfaces/User";

const Login = () => {
  const { login } = useAuth();

  const initialLoginValues: ILoginInput = {
    user_name: "",
    password: "",
  };

  const handleLogin = async () => {
    await login(values);
  };

  const {
    values,
    handleChange,
    handleSubmit,
    errors,
    dirty,
    isValid,
    isSubmitting,
  } = useFormikForm({
    initialValues: initialLoginValues,
    handleSubmit: handleLogin,
    validationSchema: schemaLogin,
  });

  const headerTemplate = () => {
    return (
      <div className="flex justify-center rounded-t-lg bg-primary p-5 text-3xl text-white">
        <span>Inicio de sesión</span>
      </div>
    );
  };

  return (
    <Card className="size-full overflow-auto px-3 max-md:px-0 max-sm:px-0 flex h-screen items-center justify-center bg-slate-300">
      <Card className="rounded-t-xl shadow-2xl" header={headerTemplate}>
        <form
          className="flex w-[260px] flex-col items-center justify-center gap-3 py-5 sm:w-[400px] sm:px-20 md:mx-10"
          onSubmit={handleSubmit}
        >
          <FieldTextInput
            className="w-full gap-2"
            role="input-userName"
            label="Usuario"
            type="text"
            name="user_name"
            mandatory
            placeholder="Usuario"
            value={values.user_name}
            error={errors.user_name ? errors.user_name : ""}
            onChange={handleChange}
          />
          <PasswordInput
            className="w-full gap-2"
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
          <Button
            className="mx-auto bg-primary"
            role="submit-login"
            type="submit"
            label="Ingresar"
            icon="pi pi-user"
            severity="info"
            disabled={!dirty || !isValid || isSubmitting}
          />
        </form>
      </Card>
    </Card>
  );
};

export default Login;
