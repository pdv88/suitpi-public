import React from "react";

function AlertModal({text, show}) {
    const modalText = text;
  return (
    <>
      <div className={`${show ? "opacity-100 z-50" : "opacity-0 -z-10 invisible"} transition-opacity fixed flex top-5 right-5 items-center justify-center`}>
        <div className="bg-modal p-4 rounded-lg w-fit">
          <p className="text-lg">{modalText}</p>
        </div>
      </div>
    </>
  );
}

export default AlertModal;
