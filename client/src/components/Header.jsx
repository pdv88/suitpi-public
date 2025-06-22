import React from "react";
import logo2 from "../assets/logo_suitpi_header.png";
import burger from "../assets/icons/burger.svg";
import close from "../assets/icons/xmark.svg";
import { Link } from "react-router-dom";
import { useState } from "react";

function Header() {
  const [isActive, setIsActive] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));

  const toggleMenu = () => {
    setIsActive(!isActive);
  };

  return (
    <>
      <header className="flex w-full h-[4.5rem] relative justify-center">
        <div className="flex items-center justify-between py-3 px-5 mx-3 lg:mx-14 w-full bg-header">
          <Link
            className="flex px-5 py-1 justify-center rounded-full bg-logo"
            to="/"
          >
            <img className="w-24" src={logo2} alt="SuitPI Logo" />
          </Link>
          <img
            src={isActive ? close : burger}
            alt="burger"
            onClick={toggleMenu}
            className="w-6 h-6 cursor-pointer md:hidden"
          />
          <nav className="hidden md:block">
            <ul className="flex gap-1">
              {localStorage.getItem("user") && (
                <li>
                  <Link className="py-2 px-4 rounded-full" to={"/dashboard"}>
                    Dashboard
                  </Link>
                </li>
              )}
              <li>
                {localStorage.getItem("user") === null ? (
                  <Link className="py-2 px-4 rounded-full" to={"/login"}>
                    Login
                  </Link>
                ) : (
                  <Link className="py-2 px-4 rounded-full" to={"/configuracion"}>
                    Hi {user.name}
                  </Link>
                )}
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <div
        className={`flex items-center w-full justify-center absolute top-[4.5rem]  z-10 transition-all ${
          isActive
            ? "translate-y-0 "
            : "-translate-y-72 "
        }`}
        onClick={toggleMenu}
      >
        <nav className="m-auto p-5 rounded-b-3xl bg-burger">
          <ul className="flex flex-col text-center gap-5  bg-list-details p-10 rounded-2xl">
            {localStorage.getItem("user") && (
              <li>
                <Link className=" text-white p-2 rounded-full" to={"/dashboard"}>
                  Dashboard
                </Link>
              </li>
            )}
            {localStorage.getItem("user") === null && (
              <li>
                <Link className=" text-white p-2 rounded-full" to={"/register"}>
                  Registro
                </Link>
              </li>
            )}
            <li>
              {localStorage.getItem("user") === null ? (
                <Link className=" text-white p-2 rounded-full" to={"/login"}>
                  Login
                </Link>
              ) : (
                <Link className=" text-white p-2 rounded-full" to={"/configuracion"}>
                  ¡Hola {user.name}!
                </Link>
              )}
            </li>
          </ul>
        </nav>
      </div>

    </>
  );
}

export default Header;
