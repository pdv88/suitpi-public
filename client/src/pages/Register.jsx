import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import Header from "../components/Header";
import { PulseLoader } from "react-spinners";
import Footer from "../components/Footer";
import PoliticasTexto from "../components/utils/PoliticasTexto";
import closeIcon from "../assets/icons/xmark.svg";

function Register() {
  document.title = "Register | SuitPI";
  const url = import.meta.env.VITE_URL;

  const [showPoliticas, setShowPoliticas] = useState(false);
  const [isRegisterLoading, setIsRegisterLoading] = useState(false);
  const [correoEnviado, setCorreoEnviado] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [register, setRegister] = useState({
    name: "",
    lastname: "",
    password: "",
    confirmPassword: "",
    mail: "",
    terms: false,
  });

  function handleChange(e) {
    setRegister({ ...register, [e.target.name]: e.target.value });
  }

  const [errors, setErrors] = useState({});

  function validate(values) {
    let errors = {};
    if (!values.name) {
      errors.name = "Introduce nombre";
    }
    if (!values.lastname) {
      errors.lastname = "Introduce apellidos";
    }
    if (!values.mail) {
      errors.mail = "Introduce email";
    } else if (!/\S+@\S+\.\S+/.test(values.mail)) {
      errors.mail = "Email no vaido";
    }

    if (!values.password) {
      errors.password = "Introduce contraseña";
    } else if (
      !/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(values.password)
    ) {
      errors.password =
        "Minimo 8 caracteres, por lo menos una letra y un numero";
    }

    if (!values.terms) {
      errors.terms = "Acepta los terminos y condiciones";
    }

    if (!values.confirmPassword) {
      errors.confirmPassword = "Confirma contraseña";
    } else if (values.password !== values.confirmPassword) {
      errors.confirmPassword = "Contraseñas no coinciden";
    }
    return errors;
  }

  function handleRegister(e) {
    e.preventDefault();
    const errors = validate(register);
    setErrors(errors);
    if (Object.keys(errors).length === 0) {
      setIsRegisterLoading(true);
      axios
        .post(url + "/register", register)
        .then((result) => {
          if (result.data.status === "success") {
            setCorreoEnviado(true);
          } else if (result.data.status === "email ya en uso") {
            setErrors({ ...errors, mail: "Email ya en uso" });
          }
        })
        .finally(() => {
          setIsRegisterLoading(false);
        });
    }
  }

  function handleResendToken() {
    setIsButtonDisabled(true);
    axios
      .post(url + "/resendToken", { email: register.mail })
      .then((result) => {
        if (result.data.status === "success") {
        }
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setTimeout(() => {
          setIsButtonDisabled(false);
        }, 30000);
      });
  }

  return (
    <>
      <Header />
      <section className=" flex flex-col gap-5 items-center justify-center w-full min-h-[calc(100svh-4.5rem)] p-10">
        {correoEnviado ? (
          <div className="flex flex-col w-full max-w-96 items-center justify-center p-5 rounded-3xl bg-login">
          <h2 className="text-3xl">Correo enviado</h2>
          <p>Revisa tu bandeja de entrada para verificar tu cuenta</p>
          <button
            className="btn-primary p-2 rounded-full w-full"
            disabled={isButtonDisabled}
            onClick={handleResendToken}
          >
            Reenviar correo de verificación
          </button>
        </div>
        ) : (
        <div className="bg-card p-10 w-full lg:w-96 rounded-3xl">
          <h1>Registro</h1>
          <form
            action="#"
            method="post"
            onSubmit={handleRegister}
            className="flex flex-col justify-center items-left w-full h-full gap-1"
          >
            <label htmlFor="name">Nombre: </label>
            <input
              type="text"
              name="name"
              id="name2"
              onChange={handleChange}
              value={register.name}
            />
            <p className="text-red-400 h-4">{errors.name}</p>

            <label htmlFor="lastname">Apellidos: </label>
            <input
              type="text"
              name="lastname"
              id="lastname"
              onChange={handleChange}
              value={register.lastname}
            />
            <p className="text-red-400 h-4">{errors.lastname}</p>

            <label htmlFor="mail">Email:</label>
            <input
              type="text"
              name="mail"
              id="mail"
              onChange={handleChange}
              value={register.mail}
            />
            <p className="text-red-400 h-4">{errors.mail}</p>

            <label htmlFor="pass">Contraseña: </label>
            <input
              type="password"
              name="password"
              id="pass2"
              onChange={handleChange}
              value={register.password}
            />
            <p className="text-red-400 h-4">{errors.password}</p>

            <label htmlFor="pass">Confirma contraseña: </label>
            <input
              type="password"
              name="confirmPassword"
              id="confirmPassword"
              onChange={handleChange}
              value={register.confirmPassword}
            />
            <p className="text-red-400 h-4">{errors.confirmPassword}</p>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="terms"
                id="terms"
                className="mr-2 w-10 h-10"
                value={register.terms}
                checked={register.terms}
                onChange={() => handleChange({ target: { name: "terms", value: !register.terms } })}
              />
              <label htmlFor="aceptoTerminos" className="text-sm">
                Acepto los{" "}
                <a
                  onClick={() => setShowPoliticas(true)}
                  className="underline cursor-pointer"
                >
                  términos y condiciones
                </a>
              </label>
            </div>
              <p className="text-red-400 h-4">{errors.terms}</p>

            {isRegisterLoading ? (
              <div className="flex w-full items-center justify-center btn-primary p-2 rounded-full">
                <PulseLoader color="#1c2326" size={10} className="p-1" />
              </div>
            ) : (
              <button
                className="btn-primary py-2 px-3 rounded-full"
                type="submit"
              >
                Crear Cuenta
              </button>
            )}
          </form>
        </div>
        )

        }
      </section>
      <Footer />

      <div
        className={`${
          showPoliticas
            ? "flex max-h-[calc(100svh-4.5rem)] opacity-100 overflow-scroll overflow-x-hidden fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-opacity"
            : "invisible  overflow-hidden h-0 opacity-0"
        } transition-opacity duration-500 z-50 bg-modal rounded-3xl overflow-y-auto w-[90vw] max-w-6xl`}
      >
        <div className="absolute top-0 right-0 m-2">
          <img
            className="w-10 h-10 bg-modal rounded-full p-2 cursor-pointer"
            onClick={() => setShowPoliticas(false)}
            src={closeIcon}
            alt="close icon"
          />
        </div>
        <PoliticasTexto />
      </div>    
      </>
  );
}

export default Register;
