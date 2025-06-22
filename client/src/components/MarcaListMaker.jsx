import React, { useEffect, useState } from "react";
import axios from "axios";
import okIcon from "../assets/icons/ok.svg";
import circleXIcon from "../assets/icons/circle-xmark.svg";
import warningYellowIcon from "../assets/icons/warningYellow.svg";
import warningRedIcon from "../assets/icons/warningRed.svg";
import circleMinusIcon from "../assets/icons/circle-minus.svg";
import trashIcon from "../assets/icons/trash.svg";
import updateIcon from "../assets/icons/update.svg";
import sortIcon from "../assets/icons/sort.svg";
import trademarkIcon from "../assets/icons/trademark.svg";
import { PulseLoader, PuffLoader } from "react-spinners";
import MarcaStatusBadge from "./utils/MarcaStatusBadge";
import AlertModal from "./utils/AlertModal";
import Paginate from "react-paginate";

function MarcaListMaker({ data, updateParentMarcas, tab, marcasSinFiltrar }) {
  const url = import.meta.env.VITE_URL;

  const [marcas, setMarcas] = useState(data);
  const [marcasByStatus, setMarcasByStatus] = useState([]);
  const [paginatedMarcas, setPaginatedMarcas] = useState([]);
  const [marcaInfoVisible, setMarcaInfoVisible] = useState(null);
  const [isUpdateLoading, setIsUpdateLoading] = useState(null);
  const [modalText, setModalText] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    let auxMarcas = [];
    switch (tab) {
      case "registradas":
        auxMarcas = marcas.filter(
          (marca) =>
            marca.status === "REGISTRADA" || marca.status === "EXPIRADA"
        );
        break;

      case "pendientes":
        auxMarcas = marcas.filter(
          (marca) =>
            marca.status !== "REGISTRADA" && marca.status !== "EXPIRADA"
        );
        break;
      default:
        auxMarcas = marcas;
        break;
    }
    setMarcasByStatus(auxMarcas);
    setTotalPages(Math.ceil(auxMarcas.length / rowsPerPage));
    setTotalItems(auxMarcas.length);
    setPaginatedMarcas(
      auxMarcas.slice(
        currentPage * rowsPerPage,
        (currentPage + 1) * rowsPerPage
      )
    );
  }, [tab, currentPage, rowsPerPage, marcas]);

  //regresar a la primer pagina cuando se cambie de pestaña
  useEffect(() => {
    setCurrentPage(0);
  }, [tab]);

  const handlePageChange = ({ selected: currentPage }) => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage);
    }
  };

  useEffect(() => {
    setMarcas(data);
  }, [data]);

  function showAlertModal() {
    setShowModal(true);
    setTimeout(() => {
      setShowModal(false);
    }, 3000);
  }

  function handleMarcaClick(id_marca) {
    if (marcaInfoVisible === id_marca) {
      setMarcaInfoVisible(null);
    } else {
      setMarcaInfoVisible(id_marca);
    }
  }

  function getDiasParaExpirar(date) {
    const today = new Date();
    if (date === null) {
      return "-";
    } else {
      const expirationDate = new Date(date);
      const timeDiff = expirationDate.getTime() - today.getTime();
      const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));
      return daysRemaining;
    }
  }

  const getDiasParaDeclararUso = (concesion, usoDec) => {
    if (concesion === null) {
      return "-";
    } else if (usoDec === "declarado") {
      return "declarado";
    } else if (usoDec === "favorable") {
      return "favorable";
    } else if (usoDec === "N/A") {
      return "N/A";
    } else if (usoDec === "no declarado") {
      const fechaConcesion = new Date(concesion);
      const fechaUso = new Date(fechaConcesion);
      fechaUso.setFullYear(fechaUso.getFullYear() + 3);
      const timeDiff = fechaUso.getTime() - Date.now();
      const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));
      return daysRemaining;
    }
  };

  const getDiasParaCorregirDatos = (concesion) => {
    if (concesion === null) {
      return "-";
    } else {
      const fechaConcesion = new Date(concesion);
      const plazoCorregirDatos = new Date(fechaConcesion);
      plazoCorregirDatos.setMonth(plazoCorregirDatos.getMonth() + 2);
      const timeDiff = plazoCorregirDatos.getTime() - Date.now();
      const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));
      if (daysRemaining > 0) {
        return daysRemaining + " días";
      } else {
        return "Vencido";
      }
    }
  };

  const deleteMarca = (marcaId) => {
    axios
      .delete(url + "/deleteMarca", { data: { marcaId } })
      .then((response) => {
        if (response.status === 200) {
          setModalText("🗑️ Marca eliminada 🗑️");
          showAlertModal();
          const newMarcas = marcas.filter(
            (marca) => marca.id_marca !== marcaId
          );
          const newMarcasSinFiltrar = marcasSinFiltrar.filter(
            (marca) => marca.id_marca !== marcaId
          );
          setMarcas([...newMarcas]);
          updateParentMarcas(newMarcasSinFiltrar);
        } else {
          setModalText("❌ Error al eliminar la marca, intente de nuevo ❌");
          showAlertModal();
        }
      })
      .catch((error) => {
        console.error("Error Eliminando marca " + error);
      });
  };

  const sortByColumn = (column) => {
    const sorted = [...marcas].sort((a, b) => {
      if (a[column] === null) {
        return 1;
      }
      if (b[column] === null) {
        return -1;
      }
      if (a[column] < b[column]) {
        return -1;
      }
      if (a[column] > b[column]) {
        return 1;
      }
      return 0;
    });
    setMarcas(sorted);
  };

  const handleUpdateMarca = (marcaId, numExp, numReg) => {
    const data = { marcaId, numExp, numReg };
    setIsUpdateLoading(marcaId);
    axios
      .put(url + "/updateMarca", data)
      .then((response) => {
        if (response.status === 200) {
          let updatedMarca = response.data.marca;
          if (
            updatedMarca.fechaVig &&
            new Date(updatedMarca.fechaVig) < new Date(Date.now())
          ) {
            updatedMarca = { ...updatedMarca, status: "EXPIRADA" };
          }
          const newMarcas = marcas.map((m) =>
            m.id_marca === marcaId ? { ...m, ...updatedMarca } : m
          );
          const newMarcasSinFiltrar = marcasSinFiltrar.map((m) =>
            m.id_marca === marcaId ? { ...m, ...updatedMarca } : m
          );
          setMarcas([...newMarcas]);
          updateParentMarcas(newMarcasSinFiltrar);
          setModalText("🎉 Marca actualizada 🎉");
          showAlertModal();
        } else if (response.status !== 200) {
          setModalText("❌ Error al actualizar la marca, intente de nuevo ❌");
          showAlertModal();
        }
      })
      .catch((error) => {
        console.error("Error actualizando marca " + error);
        setModalText("❌ Error al actualizar la marca, intente de nuevo ❌");
        showAlertModal();
      })
      .finally(() => {
        setIsUpdateLoading(null);
      });
  };

  const getDiasParaResponderImpugnacion = (fechaDenegacionProv) => {
    if (!fechaDenegacionProv) {
      return "-";
    } else {
      const plazo = new Date(fechaDenegacionProv);
      plazo.setMonth(plazo.getMonth() + 2);
      const today = new Date();
      const timeDiff = plazo.getTime() - today.getTime();
      const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));
      return daysRemaining > 0 ? `${daysRemaining} días` : "Vencido";
    }
  };

  const getDiasParaImpugnarDenegacion = (fechaDenegacion) => {
    if (!fechaDenegacion) {
      return "-";
    }

    const deadline = addBusinessDays(new Date(fechaDenegacion), 30);
    const today = new Date();

    const daysLeft = countBusinessDays(today.getTime(), deadline.getTime());

    return daysLeft > 0 ? `${daysLeft} días` : "Vencido";
  };

  function addBusinessDays(date, days) {
    const oneDay = 24 * 60 * 60 * 1000;
    let newDate = new Date(date.getTime());
    while (days > 0) {
      newDate = new Date(newDate.getTime() + oneDay);
      if (
        newDate.getDay() !== 0 && // Sunday
        newDate.getDay() !== 6 // Saturday
      ) {
        days--;
      }
    }
    return newDate;
  }

  function countBusinessDays(startDate, endDate) {
    const oneDay = 24 * 60 * 60 * 1000;
    let days = Math.round((endDate - startDate) / oneDay);
    const currentYear = new Date().getFullYear();
    const holidays = [
      new Date(currentYear, 0, 1),
      new Date(currentYear, 1, 5),
      new Date(currentYear, 2, 2),
      new Date(currentYear, 5, 1),
      new Date(currentYear, 7, 15),
      new Date(currentYear, 10, 1),
      new Date(currentYear, 10, 8),
      new Date(currentYear, 11, 25),
      new Date(currentYear, 11, 26),
    ]
      .filter((holiday) => {
        return (
          holiday.getTime() >= startDate &&
          holiday.getTime() <= endDate &&
          holiday.getDay() !== 0 && // Sunday
          holiday.getDay() !== 6 // Saturday
        );
      })
      .reduce((acc, holiday) => {
        const daysToAdd = Math.ceil((holiday.getTime() - startDate) / oneDay);
        acc.push(...Array(daysToAdd).fill(holiday));
        return acc;
      }, []);

    days -= holidays.length;

    return days;
  }

  return (
    <>
      <div className="flex justify-between items-center w-full sticky -top-4 px-2 md:px-4 py-1 lg:py-3 mb-5 bg-list-header gap-1 sm:gap-3 z-10">
        <div
          className="flex w-3/12  cursor-pointer"
          onClick={() => sortByColumn("denom")}
        >
          <img className="w-4 h-4" src={sortIcon} alt="" />
          <p className="text-xs italic">Denom:</p>
        </div>

        <div
          className="flex w-3/12 max-w-32 cursor-pointer"
          onClick={() => sortByColumn("status")}
        >
          <img className="w-4 h-4" src={sortIcon} alt="" />
          <p className="text-xs italic">Estatus:</p>
        </div>

        <div
          className="flex w-1/12 max-w-14 max-sm:hidden  cursor-pointer"
          onClick={() => sortByColumn("clase")}
        >
          <img className="w-4 h-4" src={sortIcon} alt="" />
          <p className="text-xs italic">Clase:</p>
        </div>

        {/* ---plazos marcas registradas--- */}

        <div
          className={`${
            tab !== "registradas"
              ? "hidden"
              : "flex w-1/12 max-w-14 max-sm:hidden"
          }`}
          title="Plazo restante para corrección de datos"
        >
          <p className="text-xs italic">CC Datos:</p>
        </div>

        <div
          className={`${
            tab !== "registradas"
              ? "hidden"
              : "flex w-2/12 max-w-32 cursor-pointer"
          }`}
          onClick={() => sortByColumn("fechaCon")}
          title="Plazo restante para declaración de uso"
        >
          <img className="w-4 h-4" src={sortIcon} alt="" />
          <p className="text-xs italic">Dec Uso:</p>
        </div>

        <div
          className={`${
            tab !== "registradas"
              ? "hidden"
              : "flex w-2/12 max-w-32 cursor-pointer"
          }`}
          onClick={() => sortByColumn("fechaVig")}
          title="Plazo restante de vigencia"
        >
          <img className="w-4 h-4" src={sortIcon} alt="" />
          <p className=" text-xs italic">Vence en:</p>
        </div>

        {/* ---plazos marcas pendientes--- */}

        <div
          className={`${
            tab !== "pendientes" ? "hidden" : "flex w-1/12 max-sm:w-1/4 "
          }`}
          title="Plazo restante para impugnar negativa de registro"
        >
          <p className="text-xs italic text-wrap">Impugnar negativa:</p>
        </div>

        <div
          className={`${
            tab !== "pendientes" ? "hidden" : "flex w-1/12 max-sm:w-1/4"
          }`}
          title="Plazo restante para responder impugnación de registro"
        >
          <p className="text-xs italic text-wrap">Respuesta a impugnación:</p>
        </div>

        {/* espacios de separación */}

        <div className="w-1/12 max-w-20 hidden md:flex">
          <div>
            <div className="w-10 h-5 hidden md:block"></div>
          </div>
          <div>
            <div className="w-10 h-5 hidden md:block"></div>
          </div>
        </div>
      </div>

      <AlertModal text={modalText} show={showModal} />

      {paginatedMarcas.map((marca) => {
        return (
          <div key={marca.id_marca} className="mb-3">
            <div className="flex gap-3 w-full rounded-xl px-2 md:px-4 py-1 items-center justify-between bg-list">
              <div className="flex w-3/12 max-sm:w-1/4 gap-3 items-center">
                <img
                  className="w-14 h-12 object-contain hidden md:block rounded-md bg-white"
                  src={`data:image/jpeg;base64,${marca.imagen}`}
                  alt=""
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = trademarkIcon;
                  }}
                />
                <p
                  className="cursor-pointer line-clamp-2 text-wrap max-sm:text-sm overflow-hidden"
                  onClick={() => handleMarcaClick(marca.id_marca)}
                >
                  {!marca.denom ? (
                    <i
                      className="text-gray-500 cursor-pointer"
                      onClick={() => handleMarcaClick(marca.id_marca)}
                    >
                      Sin denominación
                    </i>
                  ) : (
                    marca.denom
                  )}
                </p>
              </div>

              <MarcaStatusBadge status={marca.status} />

              <div className="w-1/12 max-w-14  items-center max-sm:hidden">
                <p>{marca.clase}</p>
              </div>

              {/* ---plazos marcas registradas--- */}

              <div
                className={`${
                  tab !== "registradas"
                    ? "hidden"
                    : "flex w-1/12 items-center max-w-14 max-sm:hidden"
                }`}
              >
                <p>{getDiasParaCorregirDatos(marca.fechaCon)}</p>
              </div>

              <div
                className={`${
                  tab !== "registradas"
                    ? "hidden"
                    : "flex flex-col md:flex-row gap-1 md:gap-3 w-2/12 max-w-32 items-center max-sm:text-xs"
                }`}
              >
                {getDiasParaDeclararUso(marca.fechaCon, marca.usoDec) ===
                "-" ? (
                  <div className="flex items-center">
                    <p>-</p>
                  </div>
                ) : getDiasParaDeclararUso(marca.fechaCon, marca.usoDec) ===
                  "declarado" ? (
                  <>
                    <img className="w-4 h-4" src={okIcon} alt="" />
                    <p className="leading-4">Declarado</p>
                  </>
                ) : getDiasParaDeclararUso(marca.fechaCon, marca.usoDec) === "N/A" ? (
                  <div className="flex items-center">
                    <p className="text-gray-400">N/A</p>
                  </div>
                ) : getDiasParaDeclararUso(marca.fechaCon, marca.usoDec) ===
                  "favorable" ? (
                  <>
                    <img className="w-4 h-4" src={okIcon} alt="" />
                    <p className=" text-green-300 leading-4">Favorable</p>
                  </>
                ) : getDiasParaDeclararUso(marca.fechaCon, marca.usoDec) >
                  180 ? (
                  <>
                    <img className="w-4 h-4" src={circleMinusIcon} alt="" />
                    <p className="text-center md:text-left leading-4">
                      {getDiasParaDeclararUso(marca.fechaCon, marca.usoDec)}{" "}
                      Dias
                    </p>
                  </>
                ) : getDiasParaDeclararUso(marca.fechaCon, marca.usoDec) >
                  30 ? (
                  <>
                    <img className="w-4 h-4" src={warningYellowIcon} alt="" />
                    <p className="text-center md:text-left leading-4">
                      {getDiasParaDeclararUso(marca.fechaCon, marca.usoDec)}{" "}
                      días
                    </p>
                  </>
                ) : getDiasParaDeclararUso(marca.fechaCon, marca.usoDec) > 0 ? (
                  <>
                    <img className="w-4 h-4" src={warningRedIcon} alt="" />
                    <p className="text-center md:text-left leading-4">
                      {getDiasParaDeclararUso(marca.fechaCon, marca.usoDec)}{" "}
                      días
                    </p>
                  </>
                ) : (
                  <>
                    <img className="w-4 h-4" src={circleXIcon} alt="" />
                    <p className=" text-red-300 leading-4">Vencido</p>
                  </>
                )}
              </div>

              <div
                className={`${
                  tab !== "registradas"
                    ? "hidden"
                    : "flex flex-col md:flex-row gap-1 md:gap-3 w-2/12 max-w-32 items-center max-sm:text-xs"
                }`}
              >
                {getDiasParaExpirar(marca.fechaVig) === "-" ? (
                  <>
                    <p className="text-center md:text-left leading-4">
                      {getDiasParaExpirar(marca.fechaVig)}
                    </p>
                  </>
                ) : getDiasParaExpirar(marca.fechaVig) > 180 ? (
                  <>
                    <img className="w-4 h-4" src={okIcon} alt="" />
                    <p className="text-center md:text-left leading-4">
                      {getDiasParaExpirar(marca.fechaVig)} días
                    </p>
                  </>
                ) : getDiasParaExpirar(marca.fechaVig) > 30 ? (
                  <>
                    <img className="w-4 h-4" src={warningYellowIcon} alt="" />
                    <p className="text-center md:text-left leading-4">
                      {getDiasParaExpirar(marca.fechaVig)} días
                    </p>
                  </>
                ) : getDiasParaExpirar(marca.fechaVig) > 0 ? (
                  <>
                    <img className="w-4 h-4" src={warningRedIcon} alt="" />
                    <p className="text-center md:text-left leading-4">
                      {getDiasParaExpirar(marca.fechaVig)} días
                    </p>
                  </>
                ) : (
                  <>
                    <img className="w-4 h-4" src={circleXIcon} alt="" />
                    <p className="text-red-300 text-center md:text-left leading-4">
                      Vencida
                    </p>
                  </>
                )}
              </div>

              {/* ---Plazos  de marcas en tramite--- */}

              <div
                className={`${
                  tab !== "pendientes" ? "hidden" : "flex w-1/12 max-sm:w-1/4"
                }`}
                title="Plazo restante para impugnar negativa de registro"
              >
                <p className="text-xs italic text-wrap">
                  {getDiasParaImpugnarDenegacion(marca.fechaDenegacion)}
                </p>
              </div>

              <div
                className={`${
                  tab !== "pendientes" ? "hidden" : "flex w-1/12 max-sm:w-1/4"
                }`}
                title="Plazo restante para responder impugnación de registro"
              >
                <p className="text-xs italic text-wrap">
                  {getDiasParaResponderImpugnacion(marca.fechaDenegacionProv)}
                </p>
              </div>

              <div className="hidden md:flex w-fit">
                <div className="z-0">
                  {isUpdateLoading === marca.id_marca ? (
                    <img
                      className="w-10 h-10 p-2.5 lg:p-3 animate-spin"
                      src={updateIcon}
                      alt=""
                    />
                  ) : isUpdateLoading === null ? (
                    <img
                      className="w-10 h-10 p-2.5 lg:p-3 cursor-pointer"
                      src={updateIcon}
                      alt=""
                      onClick={() =>
                        handleUpdateMarca(marca.id_marca, marca.numExp, marca.numReg)
                      }
                    />
                  ) : isUpdateLoading ? (
                    <img
                      className="w-10 h-10 p-2.5 lg:p-3 opacity-50"
                      src={updateIcon}
                      alt=""
                    />
                  ) : null}
                </div>
                <div className="z-0">
                  <img
                    className="w-10 h-10 p-2.5 lg:p-3 cursor-pointer"
                    src={trashIcon}
                    alt=""
                    onClick={() => deleteMarca(marca.id_marca)}
                  />
                </div>
              </div>
            </div>

            <div
              className={`${
                marcaInfoVisible === marca.id_marca
                  ? "max-h-[1000px] transition-height opacity-100 p-5 my-3"
                  : "max-h-0 opacity-0 -z-10 p-0 my-0 invisible overflow-hidden"
              } bg-list-details rounded-xl transition-all transition-height duration-500 ease-in-out`}
            >
              <img
                className=" self-center object-contain rounded-md"
                src={`data:image/jpeg;base64,${marca.imagen}`}
                alt=""
              />
              <h2 className="font-bold text-lg py-2 ">Datos Generales</h2>
              <div className=" flex flex-wrap gap-3">
                <div className="flex-col">
                  <p className=" text-xs italic">Numero Expediente:</p>
                  <p>{marca.numExp}</p>
                </div>
                <div className="flex-col">
                  <p className=" text-xs italic">Numero Registro:</p>
                  {marca.numReg === "" ? <p>-</p> : <p>{marca.numReg}</p>}
                </div>
                {marca.fechaCon && (
                  <div className="flex-col">
                    <p className=" text-xs italic">Declaración de Uso</p>
                    <p>{marca.usoDec}</p>
                  </div>
                )}

                <div className="flex-col">
                  <p className="text-xs italic">Fecha de Uso:</p>
                  {marca.fechaUso === null ? (
                    <p>-</p>
                  ) : (
                    <p>
                      {new Date(marca.fechaUso).toLocaleDateString(undefined, {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  )}
                </div>
                <div className="flex-col">
                  <p className=" text-xs italic">Fecha de Presentación:</p>
                  {marca.fechaPres === null ? (
                    <p>-</p>
                  ) : (
                    <p>
                      {new Date(marca.fechaPres).toLocaleDateString(undefined, {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        timeZone: 'UTC'
                      })}
                    </p>
                  )}
                </div>
                <div className="flex-col">
                  <p className=" text-xs italic">Fecha de Concesión:</p>
                  {marca.fechaCon === null ? (
                    <p>-</p>
                  ) : (
                    <p>
                      {new Date(marca.fechaCon).toLocaleDateString(undefined, {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        timeZone: 'UTC'
                      })}
                    </p>
                  )}
                </div>
                <div className="flex-col">
                  <p className=" text-xs italic">Fecha de Vigencia:</p>
                  {marca.fechaVig === null ? (
                    <p>-</p>
                  ) : (
                    <p>
                      {new Date(marca.fechaVig).toLocaleDateString(undefined, {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        timeZone: 'UTC'
                      })}
                    </p>
                  )}
                </div>
                <div className="flex-col">
                  <p className=" text-xs italic">Fecha de Publicación:</p>
                  {marca.fechaPub === null ? (
                    <p>-</p>
                  ) : (
                    <p>
                      {new Date(marca.fechaPub).toLocaleDateString(undefined, {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        timeZone: 'UTC'
                      })}
                    </p>
                  )}
                </div>
                <div className="flex-col">
                  <p className=" text-xs italic">Denominación:</p>
                  <p className={!marca.denom ? "italic" : ""}>
                    {!marca.denom ? "-" : marca.denom}
                  </p>
                </div>
                <div className="flex-col">
                  <p className=" text-xs italic">Descripción:</p>
                  <p>{!marca.descMar ? "-" : marca.descMar}</p>
                </div>
                <div className="flex-col">
                  <p className=" text-xs italic">Tipo de Solicitud:</p>
                  <p>{marca.tipoSol}</p>
                </div>
                <div className="flex-col">
                  <p className=" text-xs italic">Tipo de Marca:</p>
                  <p>{!marca.tipoMarca ? "-" : marca.tipoMarca}</p>
                </div>
                <div className="flex-col">
                  <p className=" text-xs italic">Leyendas:</p>
                  <p>{!marca.descMar ? "-" : marca.descMar}</p>
                </div>
                <div className="flex-col">
                  <p className=" text-xs italic">Registro Internacional:</p>
                  <p>{!marca.regInt ? "-" : marca.regInt}</p>
                </div>
                <div className="flex-col">
                  <p className=" text-xs italic">Clase:</p>
                  <p>{!marca.clase ? "-" : marca.clase}</p>
                </div>
                <div className="flex-col">
                  <p className=" text-xs italic">Desc. Clase:</p>
                  <p className="line-clamp-6 overflow-auto">
                    {!marca.descClase ? "-" : marca.descClase}
                  </p>
                </div>
              </div>
              <h2 className="font-bold text-lg py-3">Datos del Titular</h2>
              <div className="flex flex-wrap gap-3">
                <div className="flex-col">
                  <p className=" text-xs italic">Nombre:</p>
                  <p>{!marca.titNom ? "-" : marca.titNom}</p>
                </div>
                <div className="flex-col">
                  <p className=" text-xs italic">Dirección:</p>
                  <p>{!marca.titDir ? "-" : marca.titDir}</p>
                </div>
                <div className="flex-col">
                  <p className=" text-xs italic">Población:</p>
                  <p>{!marca.titPob ? "-" : marca.titPob}</p>
                </div>
                <div className="flex-col">
                  <p className=" text-xs italic">CP:</p>
                  <p>{!marca.titCP ? "-" : marca.titCP}</p>
                </div>
                <div className="flex-col">
                  <p className=" text-xs italic">Pais:</p>
                  <p>{!marca.titPais ? "-" : marca.titPais}</p>
                </div>
                <div className="flex-col">
                  <p className=" text-xs italic">Nacionalidad:</p>
                  <p>{!marca.titNac ? "-" : marca.titNac}</p>
                </div>
                <div className="flex-col">
                  <p className=" text-xs italic">RFC:</p>
                  <p>{!marca.titRFC ? "-" : marca.titRFC}</p>
                </div>
                <div className="flex-col">
                  <p className=" text-xs italic">Teléfono:</p>
                  <p>{!marca.titTel ? "-" : marca.titTel}</p>
                </div>
                <div className="flex-col">
                  <p className=" text-xs italic">Email:</p>
                  <p>{!marca.titEmail ? "-" : marca.titEmail}</p>
                </div>
                <div className="flex-col">
                  <p className=" text-xs italic">Status:</p>
                  <p>{!marca.status ? "-" : marca.status}</p>
                </div>
                {marca.fechaDenegacion && (
                  <div className="flex-col">
                    <p className=" text-xs italic">Fecha Denegación:</p>
                    <p>
                      {new Date(marca.fechaDenegacion).toLocaleDateString(
                        undefined,
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          timeZone: 'UTC'
                        }
                      )}
                    </p>
                  </div>
                )}
                {marca.fechaDenegacionProv && (
                  <div className="flex-col">
                    <p className=" text-xs italic">Denegacion Provisional:</p>
                    <p>
                      {new Date(marca.fechaDenegacionProv).toLocaleDateString(
                        undefined,
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          timeZone: 'UTC'
                        }
                      )}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
      <div className="flex justify-center py-5 mb-6">
        <Paginate
          pageCount={totalPages}
          onPageChange={({ selected }) => setCurrentPage(selected)}
          marginPagesDisplayed={1}
          pageRangeDisplayed={3}
          previousLabel="<Ant"
          nextLabel="Sig>"
          breakLabel="..."
          breakClassName="break-me"
          pageLinkClassName="p-3 max-sm:p-1.5 hover:rounded-full"
          containerClassName="flex gap-2 max-sm:gap-1"
          previousLinkClassName="p-3 rounded-full max-sm:p-1.5"
          nextLinkClassName="p-3 max-sm:p-1.5 rounded-full"
          breakLinkClassName="p-3 max-sm:p-1.5"
          activeLinkClassName="bg-feature rounded-full text-white font-bold"
        />
      </div>
    </>
  );
}

export default MarcaListMaker;
