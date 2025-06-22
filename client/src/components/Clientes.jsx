import React, { useEffect, useState } from "react";
import SideMenu from "./SideMenu";
import axios from "axios";
import { Link } from "react-router-dom";
import dropIcon from "../assets/icons/drop.svg";
import { PulseLoader } from "react-spinners";
import trashIcon from "../assets/icons/trash.svg";
import plusIcon from "../assets/icons/plus.svg";
import searchIcon from "../assets/icons/search.svg";
import updateIcon from "../assets/icons/update.svg";
import UpdateClientForm from "../components/UpdateClientForm";
import AlertModal from "./utils/AlertModal";

function Clientes() {
  const url = import.meta.env.VITE_URL;

  const [openAddClient, setOpenAddClient] = useState(false);
  const [openClientDetails, setOpenClientDetails] = useState(null);
  const [openDeleteClient, setOpenDeleteClient] = useState(null);
  const [openUpdateClient, setOpenUpdateClient] = useState(null);
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingNewClient, setIsSavingNewClient] = useState(false);
  const [modalText, setModalText] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [newClient, setNewClient] = useState({
    name: "",
    email: "",
    phone: "",
    rfc: "",
    address: "",
    userId: JSON.parse(localStorage.getItem("user")).id_user,
  });

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    phone: "",
    rfc: "",
    address: "",
  });

  const [filtro, setFiltro] = useState({ param: "name", input: "" });

  useEffect(() => {
    verifyDevice();
    document.title = "SuitPI | Clientes";
  });

  useEffect(() => {
    axios
      .post(url + "/getClients", {
        userId: JSON.parse(localStorage.getItem("user")).id_user,
      })
      .then((response) => {
        setClients(response.data);
        setFilteredClients(response.data);
        setIsLoading(false);
      });
  }, []);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validate form inputs
    const validationErrors = validateInputs(newClient);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    } else {
      setIsSavingNewClient(true);
      axios
        .post(url + "/addClient", newClient)
        .then((response) => {
          if (response.status === 200) {
            // alert("Client added");
            setModalText("🎉 Cliente agregado 🎉");
            showAlertModal();
            setClients(response.data);
            setFilteredClients(response.data);
            setOpenAddClient(false);
            setNewClient({
              name: "",
              email: "",
              phone: "",
              rfc: "",
              address: "",
              userId: JSON.parse(localStorage.getItem("user")).id_user,
            });
            setErrors({
              name: "",
              email: "",
              phone: "",
              rfc: "",
              address: "",
            });
          }
        })
        .catch((error) => {
          // alert("Error adding client");
          setModalText("❌ Error agregando cliente ❌");
          showAlertModal();
        })
        .finally(() => {
          setIsSavingNewClient(false);
        });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewClient((prevClient) => ({
      ...prevClient,
      [name]: value,
    }));
  };

  const validateInputs = (client) => {
    const errors = {};
    if (client.name === "") {
      errors.name = "Nombre requerido";
    }
    return errors;
  };

  function handleOpenClientDetails(id_client) {
    if (openClientDetails === id_client) {
      setOpenClientDetails(null);
    } else {
      setOpenClientDetails(id_client);
    }
  }

  function handleOpenUpdateClient(id_client) {
    return () => {
      if (openUpdateClient === id_client) {
        setOpenUpdateClient(null);
      } else {
        setOpenUpdateClient(id_client);
      }
    };
  }

  function handleOpenDeleteClient(id_client) {
    return () => {
      if (openDeleteClient === id_client) {
        setOpenDeleteClient(null);
      } else {
        setOpenDeleteClient(id_client);
      }
    };
  }

  function handleDeleteClient(id_client) {
    axios
      .delete(url + "/deleteClient", { data: { id_client } })
      .then((response) => {
        if (response.status === 200) {
          // alert("Client deleted");
          setModalText("🗑️ Cliente eliminado 🗑️");
          showAlertModal();
          let newClients = clients.filter(
            (client) => client.id_client !== id_client
          );
          setClients(newClients);
          setFilteredClients(newClients);
          setOpenDeleteClient(null);
        } else {
          setModalText("Error al eliminar el cliente, intente de nuevo");
          showAlertModal();
          // alert("Error deleting client");
        }
      });
  }

  const filterClients = (e) => {
    e.preventDefault();
    const auxClients = clients.filter((client) =>
      client.name
        .toString()
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .toLowerCase()
        .includes(filtro.input.toLowerCase())
    );
    setFilteredClients(auxClients);
  };

  function handleChangeBuscar(e) {
    setFiltro({ ...filtro, [e.target.name]: e.target.value });
  }

  const updateClients = (clients, client, updatedClient) => {
    const newClients = clients.map((item) => {
      item.id_client === client.id_client
        ? {
            ...item,
            id_client: updatedClient.id_client,
            name: updatedClient.name,
            email: updatedClient.email,
            phone: updatedClient.phone,
            rfc: updatedClient.rfc,
            address: updatedClient.address,
          }
        : item;
    });
    setOpenUpdateClient(null);
    setClients(newClients);
  };

  return (
    <>
      {localStorage.getItem("user") === null ? (
        (window.location.href = "/login")
      ) : (
        <main>
          <AlertModal text={modalText} show={showModal} />
          <SideMenu />
          {isLoading ? (
            <div className="flex items-center justify-center w-full">
              <PulseLoader color="#d3d3d3" size={20} className="p-1" />
            </div>
          ) : (
            <section className="w-full px-3 py-10 lg:p-10 overflow-auto max-sm:pb-20">
              <div className="flex w-full justify-between items-center">
                <h1 className="text-3xl lg:text-5xl my-3">Clientes</h1>
                <div
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => setOpenAddClient(!openAddClient)}
                >
                  <p className=" text-xs hidden lg:block">Agregar cliente</p>
                  <img className="w-6 h-6" src={plusIcon} alt="" />
                </div>
              </div>
              <div
                className={`${
                  openAddClient
                    ? "max-h-[1000px] opacity-100"
                    : "max-h-0 opacity-0 -z-10 p-0 my-0 invisible overflow-hidden"
                }
              flex flex-col flex-wrap items-center rounded-3xl m-auto transition-all duration-500 ease-in-out`}
              >
                <form
                  onSubmit={handleSubmit}
                  className={`flex flex-col flex-wrap px-5 lg:px-10 py-5 lg:py-5 w-fit gap-3 items-center bg-login rounded-3xl m-auto `}
                >
                  <h2>Datos cliente nuevo</h2>
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col lg:flex-row gap-2">
                      <div className="flex flex-col">
                        <label>Nombre:</label>
                        <input
                          type="text"
                          name="name"
                          value={newClient.name}
                          onChange={handleChange}
                        />
                        {errors.name && <span>{errors.name}</span>}
                      </div>
                      <div className="flex flex-col">
                        <label>Correo:</label>
                        <input
                          type="email"
                          name="email"
                          value={newClient.email}
                          onChange={handleChange}
                        />
                        {errors.email && <span>{errors.email}</span>}
                      </div>
                      <div className="flex flex-col">
                        <label>Telefono:</label>
                        <input
                          type="number"
                          name="phone"
                          value={newClient.phone}
                          onChange={handleChange}
                        />
                        {errors.phone && <span>{errors.phone}</span>}
                      </div>
                      <div className="flex flex-col">
                        <label>RFC:</label>
                        <input
                          type="text"
                          name="rfc"
                          value={newClient.rfc}
                          onChange={handleChange}
                        />
                        {errors.rfc && <span>{errors.rfc}</span>}
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <label>Dirección:</label>
                      <textarea
                        type="text"
                        name="address"
                        value={newClient.address}
                        onChange={handleChange}
                      />
                      {errors.rfc && <span>{errors.address}</span>}
                    </div>
                  </div>
                  <div className=" flex flex-col h-fit items-center justify-center">
                    {isSavingNewClient ? (
                      <PulseLoader color="#d3d3d3" size={10} className="p-1" />
                    ) : (
                      <>
                        <button
                          className="btn-primary w-full rounded-full py-1 px-3"
                          type="submit"
                        >
                          Agregar
                        </button>
                      </>
                    )}
                    <button onClick={() => setOpenAddClient(false)}>
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>

              <div className="py-3">
                <p className="text-xs italic text-slate-600">Buscar cliente:</p>
                <form
                  className="flex gap-2 items-center"
                  action=""
                  onSubmit={filterClients}
                >
                  <input
                    className="px-2 py-1 rounded-md"
                    type="text"
                    name="input"
                    id="input"
                    onChange={handleChangeBuscar}
                    value={filtro.input}
                  />
                  <button type="submit" className="w-5 h-5 cursor-pointer">
                    <img src={searchIcon} alt="" />
                  </button>
                </form>
              </div>
              <div className="flex flex-col gap-3">
                {filteredClients.map((client) => {
                  return (
                    <div
                      key={client.id_client}
                      className="flex flex-col bg-list p-5 rounded-3xl w-full items-center"
                    >
                      <div className="flex items-center w-full justify-between">
                        <Link
                          className=" text-2xl font-bold overflow-ellipsis px-3 py-2 rounded-full"
                          to={"/clientes/" + client.id_client}
                        >
                          {client.name}
                        </Link>
                        <img
                          className={`${
                            openClientDetails === client.id_client &&
                            "rotate-180 transition-all duration-500 ease-in-out"
                          } w-5 h-5 cursor-pointer transition-all duration-500 ease-in-out`}
                          src={dropIcon}
                          alt=""
                          onClick={() =>
                            handleOpenClientDetails(client.id_client)
                          }
                        />
                      </div>
                      <div
                        className={`${
                          openClientDetails === client.id_client
                            ? "max-h-[1000px] my-3 opacity-100 transition-all duration-500 ease-in-out"
                            : "max-h-0 opacity-0 p-0 my-0 overflow-hidden"
                        } transition-all duration-500 ease-in-out w-full`}
                      >
                        <div
                          className={`flex flex-col lg:flex-wrap  rounded-2xl w-full  bg-list-details p-5 gap-3`}
                        >
                          <div className="flex flex-col lg:flex-row gap-3 justify-between">
                            <div>
                              <p className="text-xs italic">RFC:</p>
                              <p>{client.rfc}</p>
                            </div>
                            <div>
                              <p className="text-xs italic">Correo:</p>
                              <p>{client.mail}</p>
                            </div>
                            <div>
                              <p className="text-xs italic">Teléfono:</p>
                              <p>{client.phone}</p>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs italic">Dirección:</p>
                            <p>{client.address}</p>
                          </div>

                          <div
                            className={`${
                              openUpdateClient === client.id_client
                                ? "max-h-[1000px] my-3 opacity-100 transition-all duration-500 ease-in-out"
                                : "max-h-0 opacity-0 p-0 my-0 overflow-hidden"
                            } transition-all duration-500 ease-in-out w-full`}
                          >
                            <UpdateClientForm
                              client={client}
                              clients={clients}
                              updateClients={updateClients}
                            />
                          </div>

                          <div className="flex justify-center gap-5">
                            <img
                              className="w-9 h-9 p-2 cursor-pointer self-center"
                              src={updateIcon}
                              alt=""
                              onClick={handleOpenUpdateClient(client.id_client)}
                            />
                            <img
                              className="w-9 h-9 p-2 cursor-pointer self-center"
                              src={trashIcon}
                              alt=""
                              onClick={handleOpenDeleteClient(client.id_client)}
                            />
                          </div>
                      <div
                        className={`${
                          openDeleteClient === client.id_client
                            ? "max-h-[1000px] my-3 opacity-100 transition-all duration-500 ease-in-out"
                            : "max-h-0 opacity-0 p-0 my-0 overflow-hidden"
                        } transition-all duration-500 ease-in-out w-fit self-center`}
                      >
                        <div className="flex flex-col self-center justify-center">
                          <p>¿Quieres eliminar este cliente?</p>
                          <div className="flex gap-3 justify-center w-full">
                            <button
                              className="btn-primary w-1/2 rounded-full p-1"
                              onClick={() =>
                                handleDeleteClient(client.id_client)
                              }
                            >
                              Si
                            </button>
                            <button
                              className="flex w-1/2 justify-center items-center"
                              onClick={() => setOpenDeleteClient(null)}
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      </div>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </main>
      )}
    </>
  );
}

export default Clientes;
