import React from "react";
import { NavLink } from "react-router-dom";

// icons
import fullLogo from "../assets/logo_suitpi_header.png";
import shortLogo from "../assets/logo_suitpi_short.png";
import dashboardIcon from "../assets/icons/dashboard.svg";
import clientsIcon from "../assets/icons/clients.svg";
import trademarkIcon from "../assets/icons/trademark.svg";
import notificationIcon from "../assets/icons/alarm.svg";
import settingsIcon from "../assets/icons/settings.svg";
import logoutIcon from "../assets/icons/logout.svg";

const SideMenu = () => {
  return (
    <aside className="flex w-16 lg:w-64 h-[100svh] max-sm:absolute max-sm:w-full max-sm:h-fit max-sm:bottom-0 max-sm:z-10 max-sm: ">
      <div id="sidemenu" className="flex flex-col  justify-between w-full rounded-r-3xl max-sm:rounded-t-3xl max-sm:rounded-b-none p-2 lg:p-5 my-3 bg-aside lg:my-10 max-sm:flex-row max-sm:my-0 max-sm:mx-5  overflow-y-scroll">
        <div  className="flex flex-col max-sm:flex-row">
          <NavLink
            className="w-full justify-center rounded-full bg-logo hidden lg:block max-sm:hidden"
            to="/"
          >
            <img className=" w-48  py-2 px-5" src={fullLogo} alt="Logo link to home" />
          </NavLink>
          <NavLink
            className="w-full max-sm:w-fit justify-center rounded-full bg-logo block lg:hidden"
            to="/"
          >
            <img className="w-14 max-sm:w-10" src={shortLogo} alt="" />
          </NavLink>
          <ul className="flex flex-col max-sm:flex-row gap-1 lg:gap-3 mt-2 max-sm:mt-0 lg:mt-10 items-center lg:items-start">
            <li className="font-bold rounded-full">
              <NavLink
                className="flex items-center gap-2 lg:px-4 lg:py-2 rounded-full"
                to="/dashboard"
              >
                <img
                  className="w-10 h-10 p-2 lg:w-5 lg:h-5 lg:p-0"
                  src={dashboardIcon}
                  alt=""
                />
                <p className="hidden lg:block">Resumen</p>
              </NavLink>
            </li>
            <li className="font-bold rounded-full">
              <NavLink
                className="flex items-center gap-2 lg:px-4 lg:py-2 rounded-full"
                to="/clientes"
              >
                <img
                  className="w-10 h-10 p-2 lg:w-5 lg:h-5 lg:p-0"
                  src={clientsIcon}
                  alt=""
                />
                <p className="hidden lg:block">Clientes</p>
              </NavLink>
            </li>
            <li className="font-bold rounded-full">
              <NavLink
                className="flex items-center gap-2 lg:px-4 lg:py-2 rounded-full"
                to="/marcas"
              >
                <img
                  className="w-10 h-10 p-1.5 lg:w-5 lg:h-5 lg:p-0"
                  src={trademarkIcon}
                  alt=""
                />
                <p className="hidden lg:block">Marcas</p>
              </NavLink>
            </li>
            <li className="font-bold rounded-full">
              <NavLink
                className="flex items-center gap-2 lg:px-4 lg:py-2 rounded-full"
                to="/notificaciones"
              >
                <img
                  className="w-10 h-10 p-2.5 lg:w-5 lg:h-5 lg:p-[.1rem]"
                  src={notificationIcon}
                  alt=""
                />
                <p className="hidden lg:block">Notif IMPI</p>
              </NavLink>
            </li>
          </ul>
        </div>
        <ul className="flex flex-col max-sm:flex-row gap-1 lg:gap-3 items-center lg:items-start">
          <li className="font-bold rounded-full">
            <NavLink
              className="flex items-center gap-2 lg:px-4 lg:py-2 rounded-full"
              to="/configuracion"
            >
              <img
                className="w-10 h-10 p-2 lg:w-5 lg:h-5 lg:p-0"
                src={settingsIcon}
                alt=""
              />
              <p className="hidden lg:block">Config</p>
            </NavLink>
          </li>
          <li className="font-bold rounded-full">
            <NavLink
              className="flex items-center gap-2 lg:px-4 lg:py-2 rounded-full"
              to="/logout"
            >
              <img
                className="w-10 h-10 p-2 lg:w-5 lg:h-5 lg:p-0"
                src={logoutIcon}
                alt=""
              />
              <p className="hidden lg:block">Logout</p>
            </NavLink>
          </li>
        </ul>
      </div>
    </aside>
  );
};

export default SideMenu;
