import React from "react";
import logo from "../assets/logo_suitpi_header.png";
import { Link } from "react-router-dom";

import facebookIcon from "../assets/icons/facebook.png";
import instagramIcon from "../assets/icons/instagram.png";
import xIcon from "../assets/icons/x-social.png";
import linkedinIcon from "../assets/icons/linkedin.png";
import tiktokIcon from "../assets/icons/tiktok.png";

function Footer() {
  return (
    <>
      <footer className="flex flex-col w-full justify-center items-center p-5 bg-aside">
        <div className="flex flex-col items-center justify-center p-5 w-full bg-list-details">
          <Link
            className="flex px-5 py-1 w-fit justify-center rounded-full bg-logo"
            to="/"
          >
            <img className=" w-32 py-2" src={logo} alt="SuitPI Logo" />
          </Link>
          <div className="flex max-md:flex-col w-full justify-evenly gap-10 p-5 mb-10">
            <div className="flex flex-col items-center  w-1/3 max-md:w-full">
              <p className="font-bold text-lg py-2">Enlaces</p>
              <Link to="/politicas">Politicas de uso</Link>
              <Link>Sobre nosotros</Link>
            </div>
            <div className="flex flex-col gap-2 max-md:items-center w-1/3 max-md:w-full">
              <p className="font-bold text-center text-lg py-2">Síguenos</p>
              <div className="flex flex-wrap justify-center gap-2">
                <a
                  className="flex bg-card rounded-full p-2 items-center gap-1"
                  href="https://www.facebook.com/suitpiapp"
                  target="_blank"
                >
                  <img
                    className="w-8 h-8"
                    src={facebookIcon}
                    alt="Facebook Icon"
                  />
                </a>
                <a
                  className="flex bg-card rounded-full p-2 items-center gap-1"
                  href="https://www.instagram.com/suitpiapp"
                  target="_blank"
                >
                  <img
                    className="w-8 h-8"
                    src={instagramIcon}
                    alt="Instagram Icon"
                  />
                </a>
                <a
                  className="flex bg-card rounded-full p-2 items-center gap-1"
                  href="https://x.com/suitpiapp"
                  target="_blank"
                >
                  <img className="w-8 h-8" src={xIcon} alt="Twitter Icon" />
                </a>
                <a
                  className="flex bg-card rounded-full p-2 items-center gap-1"
                  href="https://www.linkedin.com/company/suitpi/"
                  target="_blank"
                >
                  <img
                    className="w-8 h-8"
                    src={linkedinIcon}
                    alt="LinkedIn Icon"
                  />
                </a>
                <a
                  className="flex bg-card rounded-full p-2 items-center gap-1"
                  href="https://www.tiktok.com/@suitpi"
                  target="_blank"
                >
                  <img
                    className="w-8 h-8"
                    src={tiktokIcon}
                    alt="LinkedIn Icon"
                  />
                </a>
              </div>
            </div>
            <div className="flex flex-col items-center w-1/3 max-md:w-full">
              <p className="font-bold text-lg py-2">Contacto</p>
              <p>
                <a href="mailto:hola@suitpi.com">hola@suitpi.com</a>
              </p>
            </div>
          </div>
          <p className="text-xs">
            &copy; SuitPI 2024 todos los derechos reservados.
          </p>
          <p className="text-xs">
            Iconos por{" "}
            <a href="https://icons8.com" target="_blank" alt="icons8">
              icons8
            </a>
          </p>
        </div>
      </footer>
    </>
  );
}

export default Footer;
