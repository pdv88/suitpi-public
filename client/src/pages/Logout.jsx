import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SideMenu from "../components/SideMenu";

function Logout() {

  document.title = "Logout | SIMPI";

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  function closeSesion() {
    localStorage.removeItem("user");
    window.location.href = "/";
  }

  return (
    <>
      <main>
        <SideMenu />
        <section
          id="logout"
          className="flex w-full min-h-svh justify-center items-center"
        >
          <div className="flex flex-col justify-center items-center p-10 rounded-3xl bg-login m-10">
            <h1 className="text-center text-3xl lg:text-5xl">¿Cerrar sesión?</h1>
            <button onClick={closeSesion} className="btn-primary w-full px-5 py-1 rounded-full">
              Si
            </button>
            <button onClick={() => navigate("/dashboard")} className="w-full px-5 py-1 rounded-full">
              Regresar
            </button>
          </div>
        </section>
      </main>
    </>
  );
}

export default Logout;
