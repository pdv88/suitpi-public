import React from "react";
import { useNavigate } from "react-router-dom";

import okIcon from "../../assets/icons/ok.svg";

import Header from "../Header";

function Hero() {
  const navigate = useNavigate();
  return (
    <>
      {/* Hero content */}
      <section className="min-h-screen w-[90vw] grid grid-rows-[auto_1fr] bg-[url('../src/assets/deskMockup.webp')] bg-right-bottom bg-contain xl:bg-right-bottom max-xl:bg-bottom bg-no-repeat xl:bg-[length:60%_auto] md:bg-[length:70%_auto] ">
        <Header />
        <section className="flex flex-col xl:flex-row mx-auto xl:items-center justify-start gap-5 w-full">
          <div className="flex flex-col items-center xl:items-start gap-3 p-5 md:p-10 xl:px-16">
            <h1 className="xl:max-w-[50vw] w-full py-3 text-center text-4xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl xl:text-left font-bold leading-tight">
              Automatiza la gestión de tus marcas
            </h1>
            <div className="flex flex-col gap-3">
              <h3 className="lg:text-left text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl text-wrap max-sm:text-left text-center">
                SuitPI es un sistema de monitoreo de marcas te ayuda con los
                siguientes procesos:
              </h3>
              <ul className="flex flex-col gap-3 text-md lg:text-lg xl:text-xl 2xl:text-2xl">
                <li className="flex items-center space-x-3">
                  <img src={okIcon} alt="" className="h-5 w-5" />
                  <span>Extrae y actualiza tus marcas.</span>
                </li>
                <li className="flex items-center space-x-3">
                  <img src={okIcon} alt="" className="h-5 w-5" />
                  <span>Revisa las gacetas oficiales, notifica y actualiza.</span>
                </li>
                <li className="flex items-center space-x-3">
                  <img src={okIcon} alt="" className="h-5 w-5" />
                  <span>Calcula plazos.</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => navigate("/register")}
              className="btn-primary w-fit px-10 py-5 rounded-full self-center xl:self-start"
            >
              Comienza tu prueba gratis
            </button>
          </div>

          <div className="w-1/2 max-xl:w-full"></div>
          {/* <img
            className="lg:max-w-[60%] h-auto"
            src={mockup1}
            alt="SuitPI Mockup dispositivos"
          /> */}
        </section>

        {/* <section className="flex items-center my-5 w-full h-fit p-3 bg-list-details backdrop-blur-sm rounded-3xl">
          <div className="bg-feature bg-card p-1 rounded-2xl w-full">
            <h2 className="text-center text-2xl w-full py-14 px-10 ">
              <strong className="text-3xl">SuitPI</strong> Te ahorra hasta el{" "}
              <strong className="text-3xl">95%</strong> del tiempo empleado en
              tareas rutinarias como la integración de marcas de tus clientes,
              cálculo de plazos, revisión de gacetas y mucho más.
            </h2>
          </div>
        </section> */}
      </section>
    </>
  );
}

export default Hero;
