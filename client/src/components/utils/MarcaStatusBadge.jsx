import React from "react";

function MarcaStatusBadge({ status }) {
  const getStyle = () => {
    switch (status) {
        case "PENDIENTE":
            return { background: "linear-gradient(145deg, #7a7d7f, #929597)" };
        case "REGISTRADA":
            return { background: "linear-gradient(145deg, #55665f, #657971)" };
        case "DENEGADA":
            return { background: "linear-gradient(145deg, #823643, #9a404f)" };
        case "EXPIRADA":
            return { background: "linear-gradient(145deg, #887635, #a28c3f)" };
        case "ABANDONADA":
            return { background: "linear-gradient(145deg, #8282ad, #9a9acd)" };
        case "SUSPENDIDA":
            return { background: "linear-gradient(145deg, #222223, #29292a)" };
        case "DESISTIDA":
            return { background: "linear-gradient(145deg, #44392f, #504338)" };
        case "DEN PROV":
            return { background: "linear-gradient(145deg, #684b4f, #7c595e)" };
        default:
            return { background: "linear-gradient(145deg, #000)" };
    }
  };
return (
    <>
        <div className="flex items-center justify-center text-xs px-1 py-1 w-3/12 max-w-32 max-sm:w-5 max-sm:h-5 sm:px-2 sm:text-base h-full rounded-full bg-list" style={getStyle()} >
            <p className=" overflow-hidden max-sm:hidden">{status}</p>
        </div>
    </>
);
}

export default MarcaStatusBadge;
