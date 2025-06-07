import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import logo from "../../../assets/LOGO.png";
import { useFormikForm } from "../../../hooks/useFormikForm";
import { ILoginInput } from "../../../utils/interfaces/User";
import useAuth from "../hooks/useAuth";
import { schemaLogin } from "../utils/validations/LoginValidation";

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

  return (
    <div className="surface-ground flex items-center justify-center min-h-screen min-w-screen overflow-hidden px-4">
      <div className="flex flex-col items-center justify-center w-full max-w-md">
        <img
          src={logo}
          alt="logo"
          className="mb-5 w-24 h-24 rounded-full shadow-md"
        />

        <div
          style={{
            borderRadius: "56px",
            padding: "0.3rem",
            background:
              "linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)",
          }}
          className="w-full"
        >
          <div
            className="bg-white py-8 px-5 sm:px-8"
            style={{ borderRadius: "53px" }}
          >
            <div className="text-center mb-5">
              <div className="text-gray-900 text-2xl font-medium mb-2">
                Bienvenido
              </div>
              <p className="text-gray-500 font-medium">
                Inicia sesión para continuar
              </p>
            </div>

            <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="user_name"
                  className="block text-gray-900 text-lg font-medium mb-2"
                >
                  Usuario
                </label>
                <InputText
                  id="user_name"
                  name="user_name"
                  className="w-full p-3 bg-gray-100 border border-gray-300 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Usuario"
                  value={values.user_name}
                  onChange={handleChange}
                />
                <div className="h-5">
                  {errors.user_name && (
                    <small className="text-red-500 text-sm">
                      {errors.user_name}
                    </small>
                  )}
                </div>
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block text-gray-900 text-lg font-medium mb-2"
                >
                  Contraseña
                </label>
                <Password
                  inputClassName="sm:w-[350px] w-full p-3 bg-gray-100 border border-gray-300 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  inputId="password"
                  name="password"
                  value={values.password}
                  onChange={handleChange}
                  toggleMask
                  feedback={false}
                  className="w-full"
                  placeholder="Contraseña"
                />
                <div className="h-5">
                  {errors.password && (
                    <small className="text-red-500 text-sm">
                      {errors.password}
                    </small>
                  )}
                </div>
              </div>

              <Button
                className="w-full p-3 text-white bg-blue-600 border-none rounded-xl hover:bg-blue-700 transition-all text-lg"
                role="submit-login"
                type="submit"
                label="Ingresar"
                icon="pi pi-sign-in"
                severity="info"
                disabled={!dirty || !isValid || isSubmitting}
              />
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
