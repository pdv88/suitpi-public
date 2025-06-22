import React from "react";

function StatusMarcaCard({ marcas, status, color }) {
  const gradient = `linear-gradient(145deg, ${color[0]}, ${color[1]})`;
  const border = `1px solid #d3d8d93b`;
  return (
    <>
      <div className="bg-card rounded-3xl md:min-w-36 min-w-32 text-center" >
        <h3 className="md:text-xl p-1 text-md w-full rounded-3xl bg-badge" style={{ background: gradient }}>{status}</h3>
        <p className="md:text-3xl p-1 text-xl font-bold">{`${marcas.length}`}</p>
      </div>
    </>
  );
}

export default StatusMarcaCard;
