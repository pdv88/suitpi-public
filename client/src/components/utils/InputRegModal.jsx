import React from "react";

function InputRegModal({ showInputReg, setShowInputReg, handleAgregarMarca }) {
  return (
    <>
      <div
        className={`fixed inset-0 flex justify-center items-center backdrop-blur-sm h-full w-full transition-opacity ${
          showInputReg ? "opacity-100 z-50" : "opacity-0 -z-10 invisible"
        }`}
      >
        <div className="transition-opacity fixed flex items-center justify-center flex-col bg-modal p-4 rounded-lg w-fit gap-3 m-5">
          <p className="text-xl">⚠️</p>
          <p className="text-center">
            Multiples registros encontrados, ingresa el número de registro
            deseado.
          </p>
            <button onClick={() => setShowInputReg(false)}>Cancelar</button>
        </div>
      </div>
    </>
  );
}

export default InputRegModal;
