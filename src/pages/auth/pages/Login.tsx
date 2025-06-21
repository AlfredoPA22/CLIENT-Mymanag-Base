import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
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
    <div className="surface-ground flex items-center justify-center min-h-screen min-w-screen overflow-hidden px-4 bg-[#F9FAFB]">
      <div className="flex flex-col items-center justify-center w-full max-w-md">
        <img
          src="https://res.cloudinary.com/dyyd4no6j/image/upload/v1750462264/icono_inventasys_ca6zei.png"
          alt="logo"
          className="mb-5 w-24 h-24 rounded-full shadow-lg border-4 border-[#A0C82E]"
        />

        <div
          style={{
            borderRadius: "56px",
            padding: "0.3rem",
            background:
              "linear-gradient(180deg, #A0C82E 10%, rgba(160, 200, 46, 0.1) 90%)",
          }}
          className="w-full"
        >
          <div
            className="bg-white py-10 px-6 sm:px-10"
            style={{ borderRadius: "53px" }}
          >
            <div className="text-center mb-6">
              <div className="text-[#103953] text-2xl font-bold mb-2">
                Bienvenido
              </div>
              <p className="text-[#103953]/70 font-medium">
                Inicia sesión para continuar
              </p>
            </div>

            <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="user_name"
                  className="block text-[#103953] text-lg font-medium mb-2"
                >
                  Usuario
                </label>
                <InputText
                  id="user_name"
                  name="user_name"
                  className="w-full p-3 bg-gray-100 border border-gray-300 text-[#103953] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A0C82E]"
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
                  className="block text-[#103953] text-lg font-medium mb-2"
                >
                  Contraseña
                </label>
                <Password
                  inputClassName="sm:w-[340px] w-full p-3 bg-gray-100 border border-gray-300 text-[#103953] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A0C82E]"
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
                className="w-full p-3 text-white bg-[#103953] border-none rounded-xl hover:bg-[#0b2a3f] transition-all text-lg"
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
