import { Button } from "primereact/button";
import { Card } from "primereact/card";

import { useFormikForm } from "../../../hooks/useFormikForm";
import useAuth from "../hooks/useAuth";
import { schemaLogin } from "../utils/validations/LoginValidation";

import logo from "../../../assets/LOGO.png";
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
      <div className="flex justify-center p-4">
        <img
          src={logo}
          alt="logo"
          className="w-[70px] h-[70px] rounded-full shadow-md"
        />
      </div>
    );
  };

  return (
    <div className="h-screen flex items-center justify-center bg-slate-200">
      <Card
        className="w-full sm:w-[400px] rounded-3xl border border-slate-600 shadow-xl bg-[#334155]"
        header={headerTemplate}
      >
        <h2 className="text-center text-2xl font-semibold text-slate-200 mb-6">
          Bienvenido
        </h2>

        <form
          className="flex flex-col gap-5 items-center justify-center"
          onSubmit={handleSubmit}
        >
          <FieldTextInput
            className="w-full p-3 bg-[#475569] border border-slate-600 text-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="w-full p-3 bg-[#475569] border border-slate-600 text-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="w-full py-3 bg-blue-500 border-none text-white rounded-xl hover:bg-blue-600 transition-all"
            role="submit-login"
            type="submit"
            label="Ingresar"
            icon="pi pi-sign-in"
            severity="info"
            disabled={!dirty || !isValid || isSubmitting}
          />
        </form>
      </Card>
    </div>
  );
};

export default Login;
