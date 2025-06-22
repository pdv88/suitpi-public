import React from "react";

function TableDashboardResNeg({ marcas }) {

    const getNegativaDeadline = (fechaDenegacion) => {
        const thirtyBusinessDays = 30;
        let currentDate = new Date(fechaDenegacion);
        let businessDays = 0;

        while (businessDays < thirtyBusinessDays) {
            currentDate.setDate(currentDate.getDate() + 1);
            if (currentDate.getDay() > 0 && currentDate.getDay() < 6) {
                businessDays++;
            }
        }

        return currentDate.toLocaleDateString('es-mx', {day: 'numeric', month: 'short' });
    };
    
  return (
    <table className="w-full">
      <thead className="">
        <tr className="bg-list-header w-full rounded-full items-center">
          <th className="w-16 rounded-s-full px-3 py-2">Expediente</th>
          <th className="md:w-1/2 w-full">Denominación</th>
          <th className="max-md:hidden justify-center w-1/2">Titular</th>
          <th className="w-16 rounded-e-full px-3 py-2">Vence</th>
        </tr>
      </thead>
      <tbody>
        {marcas.map((marca) => (
          <tr
            key={marca.id_marca}
            className=" border-b-[1px] border-gray-500  "
          >
            <td className="w-16 text-center p-1">{marca.numExp}</td>
            <td className="w-1/2 text-center">{marca.denom ? marca.denom : "-Sin denominación-"}</td>
            <td className="max-md:hidden text-center w-1/2">{marca.titNom}</td>
            <td className="w-16 text-center p-1">
              {getNegativaDeadline(marca.fechaDenegacion)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default TableDashboardResNeg;

