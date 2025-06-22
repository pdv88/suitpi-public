import React, { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { PulseLoader } from "react-spinners";

function ResetPassword() {
  const url = import.meta.env.VITE_URL;
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handlePasswordRecovery = (e) => {
    e.preventDefault();
    console.log(token);
    setError("");
    if (password === "" || confirmPassword === "") {
      setError("Ingresa una contraseña");
      return;
    }
    if (password.length < 8 || confirmPassword.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return;
    }
    if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password)) {
      setError(
        "La contraseña debe contener al menos un número, una letra y 8 caracteres"
      );
      return;
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }
    if (token === "") {
      setError("Token inválido");
      return;
    }
    if (!error) {
      setIsLoading(true);
      const data = { token, password };
      axios.post(url + "/resetPassword", data).then((result) => {
        if (result.data.status === "tokenFail") {
          setError("Token inválido");
          setIsLoading(false);
        }
        if (result.data.status === "success") {
          setSuccess(true);
          setIsLoading(false);
        }
      });
    }
  };

  return (
    <>
      <Header />
      <main className="flex flex-col p-5 lg:p-10 w-full h-[calc(100svh-4.5rem)] justify-center items-center">
        <div className="flex flex-col w-fit self-center p-5 bg-card rounded-3xl justify-center items-center">
          <h1 className="text-3xl my-5 text-center w-64">
            Recuperación de contraseña
          </h1>
          <h2 className="my-3 text-md ">Ingresa tu nueva contraseña</h2>
          <input
            className="w-80 rounded-full px-5 py-1 my-2"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
          />
          <input
            className="w-80 rounded-full px-5 py-1 my-2"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirmar contraseña"
          />
          {isLoading ? (
            <div className="btn-primary rounded-full px-5 py-2 my-3 flex justify-center items-center w-full">
              <PulseLoader color="#1c2326" size={10} />
            </div>
          ) : (
            <button
              className="btn-primary text-white rounded-full px-5 py-2 my-3"
              onClick={handlePasswordRecovery}
            >
              Enviar
            </button>
          )}
          {error && <p className="text-red-500">{error}</p>}
          {success && (
            <div className="flex top-0 absolute w-full h-full backdrop-blur-sm justify-center items-center">
              <div className="flex flex-col justify-center bg-card p-5 rounded-3xl ">
                <h2 className="text-2xl">Contraseña actualizada</h2>
                <button
                  className="btn-primary text-white rounded-full px-5 py-2 my-3"
                  onClick={() => navigate("/login")}
                >Login
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

export default ResetPassword;
