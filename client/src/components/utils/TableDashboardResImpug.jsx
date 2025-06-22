import React from "react";

function TableDashboardResImpug({ marcas }) {

    const getDenegadaProvDeadline = (fechaDenegacionProv) => {
        const deadlineDate = new Date(fechaDenegacionProv);
        deadlineDate.setMonth(deadlineDate.getMonth() + 2);
        const day = deadlineDate.getDay()
        const month = (deadlineDate.getMonth() + 1)
        const year = deadlineDate.getFullYear();
        return deadlineDate.toLocaleDateString('es-mx', { day: 'numeric', month: 'short' });
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
            <td className="w-1/2 text-center">{marca.denom ? marca.denom : '-Sin denominación-'}</td>
            <td className="max-md:hidden text-center w-1/2">{marca.titNom}</td>
            <td className="w-16 text-center p-1">
              {getDenegadaProvDeadline(marca.fechaDenegacionProv)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default TableDashboardResImpug;
