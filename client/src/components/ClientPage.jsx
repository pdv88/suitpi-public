import React, { useState, useEffect } from "react";
import { Navigate, useParams } from "react-router-dom";
import SideMenu from "./SideMenu";
import axios from "axios";
import MarcaListMaker from "./MarcaListMaker";
import plusIcon from "../assets/icons/plus.svg";
import dropdownIcon from "../assets/icons/drop.svg";
import searchIcon from "../assets/icons/search.svg";
import { PulseLoader, PuffLoader } from "react-spinners";
import StatusMarcaCard from "./utils/StatusMarcaCard";
import AlertModal from "./utils/AlertModal";

const ClientPage = () => {
  const url = import.meta.env.VITE_URL;

  const { id } = useParams();
  const [marcasCliente, setMarcasCliente] = useState([]);
  const [clientInfo, setClientInfo] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isMarcaLoading, setIsMarcaLoading] = useState(false);
  const [userInfo, setUserInfo] = useState({});
  const [marcasFiltradas, setMarcasFiltradas] = useState([]);
  const [filtro, setFiltro] = useState({ param: "denom", input: "" });
  const [tab, setTab] = useState("registradas");
  const [modalText, setModalText] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showAgregarInputs, setShowAgregarInputs] = useState(false);
  const [showBuscarInputs, setShowBuscarInputs] = useState(false);

  const [marcasRegistradas, setMarcasRegistradas] = useState([]);
  const [marcasEnTamite, setMarcasEnTramite] = useState([]);
  const [marcasDenegadas, setMarcasDenegadas] = useState([]);
  const [marcasExpiradas, setMarcasExpiradas] = useState([]);
  const [marcasAbandonadas, setMarcasAbandonadas] = useState([]);
  const [marcasSuspendidas, setMarcasSuspendidas] = useState([]);
  const [marcasDesistidas, setMarcasDesistidas] = useState([]);
  const [marcasDenProv, setMarcasDenProv] = useState([]);

  useEffect(() => {
    verifyDevice();
    document.title = `SuitPI | ${clientInfo.name ? clientInfo.name : ""}`;
  });

  useEffect(() => {
    axios.get(url + "/clientById?id=" + id).then((results) => {
      const marcasData = results.data.marcas;
      marcasData.map((marca) => {
        if (marca.fechaVig && new Date(marca.fechaVig) < new Date(Date.now())) {
          marca.status = "EXPIRADA";
        }
      });
      setMarcasCliente(marcasData);
      setMarcasFiltradas(marcasData);
      setClientInfo(results.data.clientInfo);
      setUserInfo(JSON.parse(localStorage.getItem("user")));
      setIsLoading(false);
    });
  }, []);

  // contar marcas por estatus
  useEffect(() => {
    filterMarcasByStatus(marcasCliente);
  }, [marcasCliente]);

  function filterMarcasByStatus(marcasToFilter) {
    let auxRegistradas = [];
    let auxEnTramite = [];
    let auxDenegadas = [];
    let auxExpiradas = [];
    let auxAbandonadas = [];
    let auxSuspendidas = [];
    let auxDesistidas = [];
    let auxDenProv = [];
    marcasToFilter.map((marca) => {
      switch (marca.status) {
        case "REGISTRADA":
          auxRegistradas.push(marca);
          break;
        case "PENDIENTE":
          auxEnTramite.push(marca);
          break;
        case "DENEGADA":
          auxDenegadas.push(marca);
          break;
        case "EXPIRADA":
          auxExpiradas.push(marca);
          break;
        case "ABANDONADA":
          auxAbandonadas.push(marca);
          break;
        case "SUSPENDIDA":
          auxSuspendidas.push(marca);
          break;
        case "DESISTIDA":
          auxDesistidas.push(marca);
          break;
        case "DEN PROV":
          auxDenProv.push(marca);
          break;
        default:
          break;
      }
    });
    setMarcasRegistradas(auxRegistradas);
    setMarcasEnTramite(auxEnTramite);
    setMarcasDenegadas(auxDenegadas);
    setMarcasExpiradas(auxExpiradas);
    setMarcasAbandonadas(auxAbandonadas);
    setMarcasSuspendidas(auxSuspendidas);
    setMarcasDesistidas(auxDesistidas);
    setMarcasDenProv(auxDenProv);
  }

  const verifyDevice = async () => {
    const userId = await JSON.parse(localStorage.getItem("user")).id_user;
    const deviceId = await JSON.parse(localStorage.getItem("user")).device_id;
    axios
      .post(url + "/deviceAuth", { userId, deviceId })
      .then((response) => {
        if (response.data.status === "Success") {
          if (response.data.user.subscription_status !== "active") {
            localStorage.setItem("user", JSON.stringify(response.data.user));
            window.location.reload();
          }
        } else {
          localStorage.removeItem("user");
          window.location.href = "/";
        }
      })
      .catch((error) => {
        console.error("Error al validar sesion en dispositivo " + error);
      });
  };

  function showAlertModal() {
    setShowModal(true);
    setTimeout(() => {
      setShowModal(false);
    }, 3000);
  }

  function handleAgregarMarca(e, type) {
    e.preventDefault();
    let num = "";
    switch (type) {
      case "expediente":
        if (e.target.numExp.value === "") {
          setModalText("Favor de introducir un numero ⚠️");
          showAlertModal();
          return;
        }
        if (
          marcasCliente.some(
            (marca) => marca.numExp === e.target.numExp.value.replace(/\s/g, "")
          )
        ) {
          setModalText("⚠️ Marca repetida ⚠️");
          showAlertModal();
          return;
        }
        num = e.target.numExp.value.replace(/\s/g, "");
        break;
      case "registro":
        if (e.target.numReg.value === "") {
          setModalText("⚠️ Favor de introducir un numero ⚠️");
          showAlertModal();
          return;
        }
        if (
          marcasCliente.some(
            (marca) => marca.numReg === e.target.numReg.value.replace(/\s/g, "")
          )
        ) {
          setModalText("⚠️ Marca repetida ⚠️");
          showAlertModal();
          return;
        }
        num = e.target.numReg.value.replace(/\s/g, "");
        break;
      default:
        break;
    }

    document.getElementById("numExp").disabled = true;
    document.getElementById("numReg").disabled = true;
    setIsMarcaLoading(true);
    // Disable the input

    axios
      .post(url + "/agregarMarca", {
        num: num,
        id_client: clientInfo.id_client,
        id_user: userInfo.id_user,
        type: type,
      })
      .then((response) => {
        if (response.status === 206) {
          setModalText(
            "⚠️ Multiples registros encontrados, agregue usando el numero de registro ⚠️"
          );
          showAlertModal();
          document.getElementById("numExp").value = "";
        }
        if (response.status === 200) {
          const nuevaMarca = response.data[0];
          if (
            nuevaMarca.fechaVig &&
            new Date(nuevaMarca.fechaVig) < new Date(Date.now())
          ) {
            nuevaMarca.status = "EXPIRADA";
          }
          setModalText("🎉 Marca agregada 🎉");
          showAlertModal();
          setMarcasCliente([...marcasCliente, nuevaMarca]);
          setMarcasFiltradas([...marcasFiltradas, nuevaMarca]);
          document.getElementById("numExp").value = "";
          document.getElementById("numReg").value = "";
          setIsMarcaLoading(false);
        } else if (response.status === 205) {
          setModalText(
            "Haz alcanzado el limite de marcas en tu suscripcion, actualiza tu plan para agregar mas marcas ⛔"
          );
          showAlertModal();
        }
      })
      .catch((error) => {
        setModalText("❌ Error, intente de nuevo ❌");
        showAlertModal();
      })
      .finally(() => {
        // Enable the input
        document.getElementById("numExp").disabled = false;
        document.getElementById("numReg").disabled = false;
        setIsMarcaLoading(false);
      });
  }

  const filtrarMarcas = (e) => {
    e.preventDefault();
    const auxMarcas = marcasCliente.filter((marca) =>
      marca[filtro.param]
        .toString()
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .includes(filtro.input.toUpperCase(), 0)
    );
    setMarcasFiltradas(auxMarcas);
  };

  function handleChange(e) {
    setFiltro({ ...filtro, [e.target.name]: e.target.value });
  }

  const updateParentMarcas = (auxMarcas) => {
    setMarcasCliente(auxMarcas);
  };

  return (
    <>
      {!localStorage.getItem("user") ? (
        (window.location.href = "/login")
      ) : clientInfo.id_user === userInfo.id_user ? (
        <main>
          <SideMenu />
          {isLoading ? (
            <div className="flex justify-center items-center w-full">
              <PulseLoader color="#d3d3d3" size={20} className="p-1" />
            </div>
          ) : (
            <section className="flex-col px-3 py-5 lg:py-10 lg:p-10 w-full overflow-auto max-sm:pb-20">
              <div className="flex flex-col w-full justify-between py-2 lg:py-5">
                <h1 className=" font-bold text-3xl lg:text-5xl py-3">
                  {clientInfo.name}
                </h1>

                <div className="flex flex-wrap my-5 w-full self-center justify-evenly gap-5">
                  <StatusMarcaCard
                    marcas={marcasEnTamite}
                    status="Pendientes"
                    color={["#707274", "#9EA0A2"]}
                  />
                  <StatusMarcaCard
                    marcas={marcasSuspendidas}
                    status="Suspendidas"
                    color={["#131314", "#363637"]}
                  />
                  <StatusMarcaCard
                    marcas={marcasAbandonadas}
                    status="Abandonadas"
                    color={["#5E5E7C", "#7E7EA5"]}
                  />
                  <StatusMarcaCard
                    marcas={marcasDesistidas}
                    status="Desistidas"
                    color={["#332B23", "#5F5043"]}
                  />
                  <StatusMarcaCard
                    marcas={marcasDenProv}
                    status="Den Prov"
                    color={["#684b4f", "#7c595e"]}
                  />
                  <StatusMarcaCard
                    marcas={marcasDenegadas}
                    status="Denegadas"
                    color={["#74313C", "#A54555"]}
                  />
                  <StatusMarcaCard
                    marcas={marcasRegistradas}
                    status="Registradas"
                    color={["#495852", "#6D8179"]}
                  />
                  <StatusMarcaCard
                    marcas={marcasExpiradas}
                    status="Expiradas"
                    color={["#77682F", "#AC9543"]}
                  />
                </div>

                <div className="flex max-sm:flex-col gap-3 w-full justify-between items-center">
                  <div className="flex flex-col max-sm:w-full w-1/2">
                    <button
                      className="flex w-fit gap-3 items-center max-sm:justify-center max-sm:text-center max-sm:w-full p-2"
                      onClick={() => setShowBuscarInputs(!showBuscarInputs)}
                    >
                      Buscar
                      <img
                        className={`${
                          showBuscarInputs ? "rotate-180" : ""
                        } transition-all duration-500 w-5 h-5`}
                        src={dropdownIcon}
                        alt=""
                      />
                    </button>
                    <div
                      className={`${
                        showBuscarInputs
                          ? "opacity-100 transition-height duration-500 ease-in-out max-h-[1000px]"
                          : "invisible opacity-0 max-h-0 transition-height duration-700 ease-in-out overflow-hidden"
                      } flex flex-wrap w-fit gap-3 justify-end max-sm:w-full`}
                    >
                      <form
                        className="flex flex-col md:flex-row max-sm:w-full gap-2"
                        onSubmit={filtrarMarcas}
                      >
                        <select
                          className="px-2 w-fit py-1 rounded-md max-sm:w-full"
                          name="param"
                          id="param"
                          onChange={handleChange}
                          value={filtro.param}
                        >
                          <option value="numExp">Expediente</option>
                          <option value="numReg">Registro</option>
                          <option value="denom">Denominación</option>
                          <option value="titNom">Titular</option>
                          <option value="clase">Clase</option>
                          <option value="status">Estatus</option>
                        </select>
                        <div className="flex justify-center">
                          <input
                            className="w-full"
                            type="text"
                            name="input"
                            id="input"
                            onChange={handleChange}
                            value={filtro.input}
                          />
                          <button
                            className="flex justify-center items-center w-8"
                            type="submit"
                          >
                            <img className="w-5 h-5" src={searchIcon} alt="" />
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>

                  <div className="w-1/2 flex flex-col justify-end items-end max-sm:w-full">
                    <button
                      className="flex w-fit text-right gap-3 items-center max-sm:justify-center max-sm:text-center max-sm:w-full p-2"
                      onClick={() => setShowAgregarInputs(!showAgregarInputs)}
                    >
                      Agregar Marca
                      <img
                        className={`${
                          showAgregarInputs ? "rotate-180" : ""
                        } transition-all duration-500 w-5 h-5`}
                        src={dropdownIcon}
                        alt=""
                      />
                    </button>
                    <div
                      className={`${
                        showAgregarInputs
                          ? "opacity-100 transition-height duration-500 ease-in-out max-h-[1000px]"
                          : "invisible opacity-0 max-h-0 transition-height duration-700 ease-in-out overflow-hidden"
                      } flex flex-wrap w-fit gap-3 justify-end max-sm:w-full`}
                    >
                      <form
                        className="flex flex-col self-end max-sm:w-full"
                        action=""
                        onSubmit={(e) => handleAgregarMarca(e, "expediente")}
                      >
                        <div className="flex gap-2">
                          <input
                            className="w-full sm:max-w-32 placeholder:text-gray-400 placeholder:italic text-sm"
                            type="number"
                            name="numExp"
                            id="numExp"
                            placeholder="Nº Expediente"
                          />
                          {isMarcaLoading ? (
                            <div className="flex items-center w-10 h-10 justify-center">
                              <PuffLoader
                                color="#d3d8d9"
                                size={14}
                                className="w-full h-full"
                              />
                            </div>
                          ) : (
                            <button className="w-fit" type="submit">
                              <img
                                className="w-10 h-10 p-2.5"
                                src={plusIcon}
                                alt=""
                              />
                            </button>
                          )}
                        </div>
                      </form>
                      <form
                        className="flex flex-col self-end max-sm:w-full"
                        action=""
                        onSubmit={(e) => handleAgregarMarca(e, "registro")}
                      >
                        <div className="flex gap-2">
                          <input
                            className="w-full sm:max-w-32 placeholder:text-gray-400 placeholder:italic text-sm"
                            type="number"
                            name="numReg"
                            id="numReg"
                            placeholder="Nº Registro"
                          />
                          {isMarcaLoading ? (
                            <div className="flex items-center w-10 h-10 justify-center">
                              <PuffLoader
                                color="#d3d8d9"
                                size={14}
                                className="w-full h-full"
                              />
                            </div>
                          ) : (
                            <button className="w-fit" type="submit">
                              <img
                                className="w-10 h-10 p-2.5"
                                src={plusIcon}
                                alt=""
                              />
                            </button>
                          )}
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex w-full my-5">
                <div className="flex w-full gap-2">
                  <button
                    className={`w-full rounded-sm px-3 py-1 ${
                      tab === "pendientes" ? "bg-active-tab" : "bg-inactive-tab"
                    }`}
                    onClick={() =>
                      tab === "pendientes" ? setTab("") : setTab("pendientes")
                    }
                  >
                    En Tramite
                  </button>
                  <button
                    className={`w-full rounded-sm px-3 py-1 ${
                      tab === "registradas"
                        ? "bg-active-tab"
                        : "bg-inactive-tab"
                    }`}
                    onClick={() =>
                      tab === "registradas" ? setTab("") : setTab("registradas")
                    }
                  >
                    Registradas
                  </button>
                </div>
              </div>

              {marcasFiltradas.length === 0 ? (
                <p>No hay Marcas</p>
              ) : (
                <MarcaListMaker
                  data={marcasFiltradas}
                  updateParentMarcas={updateParentMarcas}
                  tab={tab}
                  marcasSinFiltrar={marcasCliente}
                />
              )}
              <AlertModal text={modalText} show={showModal} />
            </section>
          )}
        </main>
      ) : (
        <p>Unauthorized</p>
      )}
    </>
  );
};

export default ClientPage;
