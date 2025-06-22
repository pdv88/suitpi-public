import React, { useState } from "react";
import axios from 'axios'
import { PulseLoader } from "react-spinners";
import AlertModal from "./utils/AlertModal";

function UpdateClientForm({ clients, client, updateClients }) {
  const url = import.meta.env.VITE_URL;

  const [isUpdatingClient, setIsUpdatingClient] = useState(false);
  const [updatedClient, setUpdatedClient] = useState({
    id_client: client.id_client,
    name: client.name,
    mail: client.mail,
    phone: client.phone,
    rfc: client.rfc,
    address: client.address,
    userId: JSON.parse(localStorage.getItem("user")).id_user,
  });
  const [showModal, setShowModal] = useState(false);
  const [modalText, setModalText] = useState('');

  function showAlertModal() {
    setShowModal(true);
    setTimeout(() => {
      setShowModal(false);
    }, 3000);
  }

  const validateUpdateInputs = (updatedClient) => {
    const errors = {};
    if (updatedClient.name === "") {
      errors.name = "Name is required";
    }

    return errors;
  };

  const handleUpdateChange = (e) => {
    const { name, value } = e.target;
    setUpdatedClient((prevClient) => ({
      ...prevClient,
      [name]: value,
    }));
  };

  function handleUpdateClient(e) {
    e.preventDefault();
    setUpdateErrors({
        name: "",
        mail: "",
        phone: "",
        rfc: "",
        address: "",
      });
    const validationErrors = validateUpdateInputs(updatedClient);
    if (Object.keys(validationErrors).length > 0) {
      setUpdateErrors(validationErrors);
      return;
    } else {
      setIsUpdatingClient(true);
      axios.put(url + "/updateClientInfo", updatedClient).then((response) => {
        if (response.status === 200) {
          setModalText("Cliente actualizado 🎉");
          showAlertModal();
          // alert("Cliente actualizado");
          setIsUpdatingClient(false);
          updateClients(clients, client.id_client, updatedClient);
          setUpdateErrors({
            name: "",
            mail: "",
            phone: "",
            rfc: "",
            address: "",
          });
        } else {
          setModalText("Error actualizando cliente ❌");
          showAlertModal();
          // alert("Error actualizando cliente");
          setIsUpdatingClient(false);
        }
      });
    }
  }

  const [updateErrors, setUpdateErrors] = useState({
    name: "",
    mail: "",
    phone: "",
    rfc: "",
    address: "",
  });

  return (
    <>
      <div className="flex flex-col bg-list-details p-2 lg:p-5 rounded-2xl">
        <form action="" className="flex flex-col gap-3">
          <h3 className="text-xl font-bold">Introduce datos nuevos</h3>
          <div className="flex flex-col lg:flex-row flex-wrap w-full justify-between">
            <div className="flex flex-col">
              <label className="text-xs italic" htmlFor="name">
                Nombre:*
              </label>
              <input
                type="text"
                name="name"
                onChange={handleUpdateChange}
                placeholder={client.name}
                value={updatedClient.name}
              />
              {updateErrors.name && <span className="text-red-400">{updateErrors.name}</span>}
            </div>
            <div className="flex flex-col">
              <label className="text-xs italic" htmlFor="mail">
                Correo:*
              </label>
              <input
                type="text"
                name="mail"
                onChange={handleUpdateChange}
                placeholder={client.mail}
                value={updatedClient.mail}
              />
              {updateErrors.mail && <span className="text-red-400">{updateErrors.mail}</span>}
            </div>
            <div className="flex flex-col">
              <label className="text-xs italic" htmlFor="phone">
                Teléfono:*
              </label>
              <input
                type="number"
                name="phone"
                onChange={handleUpdateChange}
                placeholder={client.phone}
                value={updatedClient.phone}
              />
              {updateErrors.phone && <span className="text-red-400">{updateErrors.phone}</span>}
            </div>
            <div className="flex flex-col">
              <label className="text-xs italic" htmlFor="rfc">
                RFC:
              </label>
              <input
                type="text"
                name="rfc"
                onChange={handleUpdateChange}
                placeholder={client.rfc}
                value={updatedClient.rfc}
              />
            </div>
          </div>
          <div className="flex flex-col">
            <label className="text-xs italic" htmlFor="address">
              Dirección:
            </label>
            <textarea
              type="text"
              name="address"
              onChange={handleUpdateChange}
              placeholder={client.address}
              value={updatedClient.address}
            />
          </div>
        </form>

        <div className="flex flex-col self-center p-5 justify-center">
          <p>¿Quieres actualizar la informacion de este cliente?</p>
          <div className="flex gap-3 justify-center w-full">
            {isUpdatingClient ? (
              <div className=" flex items-center justify-center btn-primary w-1/2 rounded-full p-1">
                <PulseLoader color="#1c2326" size={10} className="p-1" />
              </div>
            ) : (
              <button
                className="btn-primary w-1/2 rounded-full p-1"
                onClick={handleUpdateClient}
              >
                Actualizar
              </button>
            )}
          </div>
        </div>
      </div>
      <AlertModal text={modalText} show={showModal} />
    </>
  );
}

export default UpdateClientForm;
