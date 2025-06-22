import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SideMenu from "../components/SideMenu";
import axios from "axios";
import { PulseLoader } from "react-spinners";
import TreemapClientes from "../components/utils/TreemapClientes";
import ProgressBar from "../components/utils/ProgressBar";
import StatusMarcaCard from "../components/utils/StatusMarcaCard";
import Notifications from "../components/Notifications";
import notificationsIcon from "../assets/icons/alarm.svg";

import TableDashboardExpiran from "../components/utils/TableDashboardExpiran";
import TableDashboardDecUso from "../components/utils/TableDashboardDecUso";
import TableDashboardResNeg from "../components/utils/TableDashboardResNeg";
import TableDashboardResImpug from "../components/utils/TableDashboardResImpug";


function Dashboard() {
  const url = import.meta.env.VITE_URL;

  const navigate = useNavigate();

  const [clientes, setClientes] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [conectionError, setConectionError] = useState(false);

  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const [marcasRegistradas, setMarcasRegistradas] = useState([]);
  const [marcasEnTamite, setMarcasEnTramite] = useState([]);
  const [marcasDenegadas, setMarcasDenegadas] = useState([]);
  const [marcasExpiradas, setMarcasExpiradas] = useState([]);
  const [marcasAbandonadas, setMarcasAbandonadas] = useState([]);
  const [marcasSuspendidas, setMarcasSuspendidas] = useState([]);
  const [marcasDesistidas, setMarcasDesistidas] = useState([]);
  const [marcasDenProv, setMarcasDenProv] = useState([]);

  const [marcasExpiranEn30Dias, setMarcasExpiranEn30Dias] = useState([]);
  const [marcasDecUso30Dias, setMarcasDecUso30Dias] = useState([]);
  const [marcasResponderNegativa30Dias, setMarcasResponderNegativa30Dias] = useState([]);
  const [marcasDenegacionProv30Dias, setMarcasDenegacionProv30Dias] = useState([]);

  const [isLoading, setIsLoading] = useState(true);

  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);

  // Get notifications effect
  useEffect(() => {
    const userId = JSON.parse(localStorage.getItem("user")).id_user;
    const data = { userId: userId };
    axios
      .post(url + "/getUnreadNotifications", data)
      .then((results) => {
        if (results.data.status === "success") {
          setNotifications(results.data.notifications);
        }
      })
      .catch((error) => {
        console.error("Error fetching notifications: " + error);
      });
    }, []);
    
    // Set unread notifications effect
    useEffect(() => {
      let auxUnread = 0;
      notifications.forEach((notification) => {
        if (!notification.isRead) {
          auxUnread++;
        }
      });
      setUnread(auxUnread);
  }, [notifications]);

  //  Verify device effect
  useEffect(() => {
    verifyDevice();
    document.title = "SuitPI | Dashboard";
  });

  // Get user data effect
  useEffect(() => {
    setIsLoading(true);
    const userId = JSON.parse(localStorage.getItem("user")).id_user;
    axios
      .post(url + "/getUserData", { userId })
      .then(async (response) => {
        if (response.status === 200) {
          const marcasData = response.data.marcas
          marcasData.map((marca) => {
            if (marca.fechaVig && new Date(marca.fechaVig) < new Date(Date.now())) {
              marca.status = "EXPIRADA";
            }
          })
          setMarcas(marcasData);
          setClientes(response.data.clientes);
        } else if (response.status === 501) {
          alert("Error al cargar clientes");
        } else if (response.status === 502) {
          alert("Error al cargar marcas");
        } else {
          alert("Error al cargar datos");
        }
      })
      .catch((err) => {
        setConectionError(true);
        console.log(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // filter functions effect
  useEffect(() => {
    filterMarcasByStatus(marcas);
    getMarcasExpiranEn30Dias();
    getMarcasDecUso30Dias();
    getMarcasResponderNegativa30Dias();
    getMarcasDenegacionProv30Dias();
  }, [marcas]);

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

  // verify device function
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

  // filter brands that expire in 30 days
  const getMarcasExpiranEn30Dias = () => {
    let auxMarcas = [];
    marcas.filter((marca) => {
      if (
        marca.fechaVig &&
        new Date(marca.fechaVig) <
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) &&
        new Date(marca.fechaVig) > new Date(Date.now())
      ) {
        auxMarcas.push(marca);
      }
    });
    setMarcasExpiranEn30Dias(auxMarcas.sort((a, b) => new Date(a.fechaVig) - new Date(b.fechaVig)));
  };

  // filter brands that DecUso expire in 30 days
  const getMarcasDecUso30Dias = () => {
    let auxMarcas = [];
    marcas.filter((marca) => {
      if (marca.usoDec === "no declarado") {
        const plazoUso = new Date(marca.fechaCon);
        plazoUso.setFullYear(plazoUso.getFullYear() + 3);
        if (
          plazoUso < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) &&
          plazoUso > new Date(Date.now())
        ) {
          auxMarcas.push(marca);
        }
        setMarcasDecUso30Dias(auxMarcas.sort((a, b) => new Date(a.fechaCon) - new Date(b.fechaCon)));
      }
    });
  };

  // filter brands that fechaDenegacionProv deadline is in the next 30 days
  const getMarcasDenegacionProv30Dias = () => {
    let auxMarcas = [];

    marcas.forEach((marca) => {
      if (marca.fechaDenegacionProv) {
        const fechaDenegacionProv = new Date(marca.fechaDenegacionProv);
        const deadlineDate = fechaDenegacionProv.setMonth(fechaDenegacionProv.getMonth() + 2);
        const today = new Date();
        const next30days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
        

        if (deadlineDate >= today && deadlineDate < next30days) {
          auxMarcas.push(marca);
        }
      }
    });
    setMarcasDenegacionProv30Dias(auxMarcas.sort((a, b) => new Date(a.fechaDenegacionProv) - new Date(b.fechaDenegacionProv)));
  };

  const getMarcasResponderNegativa30Dias = () => {
    let auxMarcas = [];

    marcas.filter((marca) => {
      if (marca.fechaDenegacion) {
        const deadlineDate = new Date(marca.fechaDenegacion);
        const thirtyBusinessDays = addBusinessDays(deadlineDate, 30);
        const today = new Date();

        if (thirtyBusinessDays >= today && thirtyBusinessDays <= new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)) {
          auxMarcas.push(marca);
        }
      }
    });
    setMarcasResponderNegativa30Dias(auxMarcas.sort((a, b) => new Date(a.fechaDenegacion) - new Date(b.fechaDenegacion)));
  };

  const addBusinessDays = (date, days) => {
    let resultDate = new Date(date);
    while (days > 0) {
      resultDate.setDate(resultDate.getDate() + 1);
      if (resultDate.getDay() > 0 && resultDate.getDay() < 6) {
        days--;
      }
    }
    return resultDate;
  };

  return (
    <>
      <main>
        <SideMenu />
        <section className="flex flex-col w-full p-5 overflow-auto max-sm:pb-20">
          <div className="flex w-full items-center justify-between">
            <h1 className="my-5 lg:text-5xl text-3xl">Dashboard</h1>
            <button
              className="bg-card rounded-full relative"
              onClick={() => setNotificationsOpen(true)}
            >
              <img
                className="w-10 h-10 p-2.5"
                src={notificationsIcon}
                alt="Notifications icon"
              />
            {unread > 0 && (
              <div className="absolute -top-1 -right-1 bg-red-500 rounded-full w-5 h-5 flex items-center justify-center bg-badge">
                <p className="text-white text-xs">{unread}</p>
              </div>
            )
            }
            </button>
          </div>
          {isLoading ? (
            <div className="flex items-center justify-center h-full w-full">
              <PulseLoader color="#d3d3d3" size={20} />
            </div>
          ) : (
            <>
              <div className="my-5">
                <ProgressBar data={{ marcas }} />
              </div>
              <h2 className="text-2xl">Marcas</h2>
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

              <h2 className="text-2xl">Clientes</h2>
              <TreemapClientes clientes={clientes} marcas={marcas} />

              <h2 className="text-2xl">Plazos que vencen en 30 días</h2>
              {marcasExpiranEn30Dias.length <= 0 &&
                marcasDecUso30Dias.length <= 0 &&
                marcasResponderNegativa30Dias.length <= 0 &&
                marcasDenegacionProv30Dias.length <= 0 && (
                  <div className="my-5 bg-card p-3 md:p-5 rounded-3xl">
                    <h2 className="text-xl lg:text-2xl my-3 text-center">
                      <img src="" alt="" />
                      No hay plazos que venzan dentro de 30 días :)
                    </h2>
                  </div>
                )}
              {marcasExpiranEn30Dias.length > 0 && (
                <div className="my-5 bg-card p-3 md:p-5 rounded-3xl">
                  <h2 className="text-xl lg:text-2xl my-3 text-center">
                    Expira Registro
                  </h2>
                  <TableDashboardExpiran marcas={marcasExpiranEn30Dias} />
                </div>
              )}
              {marcasDecUso30Dias.length > 0 && (
                <div className="my-5 bg-card p-3 md:p-5 rounded-3xl">
                  <h2 className="text-xl lg:text-2xl my-3 text-center">
                    Declaración de Uso
                  </h2>
                  <TableDashboardDecUso marcas={marcasDecUso30Dias} />
                </div>
              )}
              {marcasResponderNegativa30Dias.length > 0 && (
                <div className="my-5 bg-card p-3 md:p-5 rounded-3xl">
                  <h2 className="text-xl lg:text-2xl my-3 text-center">
                    Impugnar Negativa de Registro
                  </h2>
                  <TableDashboardResNeg marcas={marcasResponderNegativa30Dias} />
                </div>
              )}
              {marcasDenegacionProv30Dias.length > 0 && (
                <div className="my-5 bg-card p-3 md:p-5 rounded-3xl">
                  <h2 className="text-xl lg:text-2xl my-3 text-center">
                    Impugnar Denegación Provisional
                  </h2>
                  <TableDashboardResImpug marcas={marcasDenegacionProv30Dias} />
                </div>
              )}

            </>
          )}
        </section>
      </main>
      <Notifications
        notificationsOpen={notificationsOpen}
        setNotificationsOpen={setNotificationsOpen}
        notifications={notifications}
        setNotifications={setNotifications}
      />
      {conectionError && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
          <div className="flex flex-col items-center bg-card p-5 rounded-3xl gap-2">
            <p className="text-7xl p-3 rounded-full">:(</p>
            <h1 className="text-2xl">Error de conexión</h1>
            <p>Por favor, revisa tu conexión a internet</p>
            <button
              className="btn-primary text-white p-2 rounded-full"
              onClick={() => window.location.reload()}
            >
              Reintentar
            </button>
          </div>
        </div>
      )
      }
    </>
  );
}

export default Dashboard;
