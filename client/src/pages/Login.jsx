import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import { PulseLoader } from "react-spinners";


function Login() {
  
  document.title = "Login | SUITPI";

  const url = import.meta.env.VITE_URL

  const [login, setLogin] = useState({ mail: "", password: "", error: ""});
  const [errors, setErrors] = useState({ mail: "", password: "" });
  const [isLoginLoading, setIsLoginLoading] = useState(false)

  function handleLogin(e) {
    e.preventDefault();
    setErrors({ mail: "", password: "" });
    setLogin({ ...login, error: "" });
    let errorsTemp = {};
    if (login.mail === "") {
      errorsTemp.mail = "Introduce tu correo";
    }
    if (login.password === "") {
      errorsTemp.password = "Introduce contraseña";
    }
    if (Object.keys(errorsTemp).length > 0) {
      setErrors(errorsTemp);
    } else {
      setIsLoginLoading(true)
      const userAgent = window.navigator.userAgent;
      const randomString = Math.random().toString(20).substring(2, 14) + Math.random().toString(20).substring(2, 14);
      const deviceId = `${userAgent}-${randomString}`;
      axios.post(url + "/login", {login, deviceId}).then((result) => {
        console.log(result.data)
        switch (result.data.status) {
          case "success":
            localStorage.setItem("user", JSON.stringify(result.data));
            window.location.href = "/dashboard";
            break;
          case "passwordFail":
            setLogin({
              ...login,
              error: "Contraseña incorrecta",
            });
            break;
          case "userFail":
            setLogin({
              ...login,
              error: "Email no encontrado",
            });
            break;
            case "emailNotVerified":
            setLogin({
              ...login,
              error: "Email no verificado",
            });
          default:
            break;
        }
        setIsLoginLoading(false)
      })
      .catch((err) => {
        console.log(err);
        setIsLoginLoading(false)
      });
    }
  }

  function handleChange(e) {
    let name = e.target.name;
    let valor = e.target.value;
    setLogin({ ...login, [name]: valor });
  }

  return (
    <>
      <Header />
      <main className="flex h-auto">
        <section
          className="flex flex-col p-10 w-full min-h-[calc(100svh-4.5rem)] justify-center items-center"
          id="login"
        >
          <div className="flex flex-col w-full max-w-96 items-center justify-center p-10 rounded-3xl bg-login">
            <h1 className="">Login</h1>
            <p className=" text-red-400">{login.error}</p>
            <form
              className="flex flex-col w-full gap-3"
              action="#"
              method="post"
              onSubmit={handleLogin}
            >
              <div className="flex flex-col">
                <label htmlFor="mail">Email</label>
                <input
                  type="text"
                  name="mail"
                  id="mail"
                  onChange={handleChange}
                  value={login.mail}
                />
                <p className="text-red-400 h-6">{errors.mail}</p>
              </div>
              <div className="flex flex-col">
                <label htmlFor="pass">Contraseña</label>
                <input
                  type="password"
                  name="password"
                  id="pass"
                  onChange={handleChange}
                  value={login.password}
                />
                  <p className="text-red-400 h-6">{errors.password}</p>
                  <Link className="px-3 py-1 text-xs rounded-full" to={'/forgotPassword'}>¿Olvidaste tu contraseña? Haz click aquí</Link>
              </div>
              {isLoginLoading ? (
                <div className="flex w-full items-center justify-center btn-primary p-2 rounded-full">
                  <PulseLoader color="#1c2326" size={10} className="p-1"/>
                </div>
              ) : (
              <button type="submit" className="btn-primary p-2 rounded-full">
                Login
              </button>
              )

              }
            </form>
            <p className="flex flex-col w-full text-center">
              ¿No tienes cuenta? <br />
              <Link className="px-3 py-1 rounded-full text-center" to={"/register"}>Registrate aquí</Link>
            </p>
          </div>
        </section>
      </main>
    </>
  );
}

export default Login;
