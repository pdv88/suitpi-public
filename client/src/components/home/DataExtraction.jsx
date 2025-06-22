import React from "react";
import okIcon from "../../assets/icons/ok.svg";
// import Image from "next/image"

export default function DataExtraction() {
  return (
    <section className="max-w-7xl w-full">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="gap-12 items-center">
          <div className="flex max-md:flex-col space-y-8 w-full items-center">
            <h2 className="max-md:w-full w-1/2 font-extrabold tracking-tight text-4xl sm:text-5xl md:text-6xl">
              Elimina el Error Humano en la Extracción de Datos
            </h2>

            <div className="max-md:w-full w-1/2 flex flex-col gap-4">
              <p className="text-xl">
                SuitPI utiliza un sistema automatizado de extracción de
                información del IMPI, garantizando precisión y consistencia,
                eliminando los errores humanos comunes.
              </p>
              <ul className="space-y-4">
                {[
                  "Tasa de Precisión del 99.9%",
                  "Extracción Automatizada 24/7",
                  "Procesamiento Eficiente de Datos del IMPI",
                ].map((caracteristica, index) => (
                  <li key={index} className="flex items-center space-x-3">
                    <img src={okIcon} alt="" className="h-6 w-6" />
                    <span>{caracteristica}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
