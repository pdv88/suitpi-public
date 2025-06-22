import react, { useEffect, useState } from "react";
import axios from "axios";
import SideMenu from "./SideMenu";
import MarcaListMaker from "./MarcaListMaker";
import searchIcon from "../assets/icons/search.svg";
import { PulseLoader } from "react-spinners";
import StatusMarcaCard from "./utils/StatusMarcaCard";
import dropdownIcon from "../assets/icons/drop.svg";

function Marcas() {
  const url = import.meta.env.VITE_URL;

  const [marcas, setMarcas] = useState([]);
  const [filtro, setFiltro] = useState({ param: "numReg", input: "" });
  const [marcasFiltradas, setMarcasFiltradas] = useState([]);
  const [isMarcasLoading, setIsMarcasLoading] = useState(false);
  const [tab, setTab ] = useState('registradas');
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
    document.title = "SuitPI | Marcas";
  });

  useEffect(() => {
    setIsMarcasLoading(true);
    const userId = JSON.parse(localStorage.getItem("user")).id_user;
    axios.post(url + "/getUserMarcas", { userId }).then((response) => {
      const marcasData = response.data
          marcasData.map((marca) => {
            if (marca.fechaVig && (new Date(marca.fechaVig) < new Date(Date.now()))) {
              marca.status = "EXPIRADA";
            }
          })
      setMarcas(marcasData);
      setMarcasFiltradas(marcasData);
      setIsMarcasLoading(false);
    });
  }, []);

  // Filter marcas by status
  useEffect(() => {
    filterMarcasByStatus(marcas);
  }, [marcas, marcasFiltradas]);

  function filterMarcasByStatus (marcasToFilter) {
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
    })
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

  const filtrarMarcas = (e) => {
    e.preventDefault();
    const auxMarcas = marcas.filter((marca) =>
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
    setMarcas(auxMarcas);
  };

  return (
    <>
      {localStorage.getItem("user") === null ? (
        (window.location.href = "/login")
      ) : (
        <main>
          <SideMenu />
          {isMarcasLoading ? (
            <div className="flex justify-center items-center w-full">
              <PulseLoader color="#d3d3d3" size={20} className="p-1" />
            </div>
          ) : (
            <section
              className="flex-col p-5 lg:p-10 w-full overflow-y-scroll max-sm:pb-20"
              id="marcas"
            >
              <h1 className="text-3xl lg:text-5xl my-3">Marcas</h1>

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

              <div className="flex w-full my-5">
                <div className="flex w-full gap-2">
                  <button
                    className={`w-full rounded-sm px-3 py-1 ${tab === "pendientes" ? "bg-active-tab" : "bg-inactive-tab"}`}
                    onClick={() => tab === "pendientes" ? setTab("") : setTab("pendientes")}
                  >
                    En Tramite
                  </button>
                  <button
                    className={`w-full rounded-sm px-3 py-1 ${tab === "registradas" ? "bg-active-tab" : "bg-inactive-tab"}`}
                    onClick={() => tab === "registradas" ? setTab("") : setTab("registradas")}
                  >
                    Registradas
                  </button>
                </div>
              </div>

              <MarcaListMaker
                data={marcasFiltradas}
                updateParentMarcas={updateParentMarcas}
                tab={tab}
                marcasSinFiltrar={marcas}
              />
            </section>
          )}
        </main>
      )}
    </>
  );
}

export default Marcas;
