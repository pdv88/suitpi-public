import React, { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import axios from "axios";

function PasswordRecovery() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const url = import.meta.env.VITE_URL;

  document.title = "Password Recovery | SUITPI";

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handlePasswordRecovery = () => {
    if (email === "") {
      setError("Ingresa un correo");
      return;
    }
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError("Correo no válido");
        return;
      }
    }
    setError("");
    const data = { email };
    axios.post(url + "/forgotPassword", data).then((result) => {
      switch (result.data.status) {
        case "success":
          setSuccess(true);
          break;
        case "emailFail":
          setError("Email no encontrado");
          break;
        default:
          break;
      }
    });
  };

  return (
    <>
      <>
        <Header />
        <main className="flex flex-col p-5 lg:p-10 w-full h-[calc(100svh-4.5rem)] justify-center items-center">
          <div className="flex flex-col w-fit self-center p-5 bg-card rounded-3xl justify-center items-center">
            <h1 className="text-3xl my-5 text-center w-64">
              Recuperación de contraseña
            </h1>
            <h2 className="my-3 text-md ">Ingresa el correo de tu cuenta</h2>
            <input
              className="w-80 rounded-full px-5"
              type="email"
              value={email}
              onChange={handleEmailChange}
            />
            <p className="text-red-400 h-4">{error}</p>
            <button
              className="btn-primary rounded-full px-5 py-2"
              onClick={handlePasswordRecovery}
            >
              Recuperar contraseña
            </button>
          </div>
        </main>
        <Footer />
        {success && (
          <div className="flex absolute top-0 backdrop-blur-sm p-5 lg:p-10 w-full h-full justify-center items-center">
            <div className="flex flex-col bg-card justify-center items-center rounded-3xl">
              <h1 className="text-3xl lg:text-5xl my-5 text-center w-64">
                Correo enviado
              </h1>
              <h2 className="my-3 text-md ">Revisa tu bandeja de entrada</h2>
              <button
                className="btn-primary px-5 py-2 rounded-full"
                onClick={() => setSuccess(false)}
              >
                Aceptar
              </button>
            </div>
          </div>
        )}
      </>
    </>
  );
}

export default PasswordRecovery;
