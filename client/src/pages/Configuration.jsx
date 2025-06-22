import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import SideMenu from "../components/SideMenu";
import okIcon from "../assets/icons/ok.svg";
import warningIcon from "../assets/icons/warning.svg";
import { PulseLoader } from "react-spinners";

function Configuration() {
  document.title = "Cuenta | SUITPI";

  const url = import.meta.env.VITE_URL;
  const navigate = useNavigate();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));
  const [newSubscription, setNewSubscription] = useState({});
  // Modales
  const [deleteModal, setDeleteModal] = useState(false);
  const [showChangePlanModal, setShowChangePlanModal] = useState(false);
  const [showCancelSubscriptionModal, setShowCancelSubscriptionModal] =
    useState(false);
  // Loaders
  const [isChangingPlanLoading, setIsChangingPlanLoading] = useState(false);
  const [isCancelSubLoading, setIsCancelSubLoading] = useState(false);
  // Formulario de actualizacion de usuario
  const [errors, setErrors] = useState({});
  const [updatedUser, setUpdatedUser] = useState({
    name: user.name,
    lastname: user.lastname,
    phone: user.phone,
  });

  // planes de suscripcion
  const basico = {
    title: "Basico",
    price: 499,
    id: import.meta.env.VITE_STRIPE_PRICE_ID_BASICO,
  };
  const intermedio = {
    title: "Intermedio",
    price: 799,
    id: import.meta.env.VITE_STRIPE_PRICE_ID_INTERMEDIO,
  };
  const profesional = {
    title: "Profesional",
    price: 1499,
    id: import.meta.env.VITE_STRIPE_PRICE_ID_PROFESIONAL,
  };
  const empresarial = {
    title: "Empresarial",
    price: 1999,
    id: import.meta.env.VITE_STRIPE_PRICE_ID_EMPRESARIAL,
  };

  // Validar dispositivo

  useEffect(() => {
    verifyDevice();
  });

  // Actualizar usuario

  useEffect(() => {
    localStorage.setItem("user", JSON.stringify(user));
  }, [user]);

  const verifyDevice = async () => {
    const userId = await JSON.parse(localStorage.getItem("user")).id_user;
    const deviceId = await JSON.parse(localStorage.getItem("user")).device_id;
    axios
      .post(url + "/deviceAuth", { userId, deviceId })
      .then((response) => {
        if (response.data.status === "Success") {
          if (response.data.user.subscription_status !== "active") {
            localStorage.setItem("user", JSON.stringify(response.data.user));
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

  function handleChange(e) {
    setUpdatedUser({ ...updatedUser, [e.target.name]: e.target.value });
  }

  function validate(values) {
    let errors = {};
    if (!values.name) {
      errors.name = "Name is required";
    }
    if (!values.lastname) {
      errors.lastname = "Lastname is required";
    }
    if (!values.phone) {
      errors.phone = "Phone number is required";
    } else if (values.phone.length > 10 || values.phone.length < 8) {
      errors.phone = "Invalid phone number";
    }
    return errors;
  }

  // Actualizar usuario

  function handleUpdate(e) {
    e.preventDefault();
    const errors = validate(updatedUser);
    setErrors(errors);
    if (Object.keys(errors).length === 0) {
      const userId = parseInt(JSON.parse(localStorage.getItem("user")).id_user);
      axios
        .put(url + "/updateUserInfo", { updatedUser, userId })
        .then((response) => {
          if (response.status === 200) {
            alert("User Updated successfully");
            localStorage.setItem("user", JSON.stringify(response.data));
            setUser(response.data);
            window.location.href = "/configuracion";
          }
        })
        .catch((error) => {
          console.error("Error updating user: ", error);
          alert("Failed to update user");
        });
    }
  }

  // Modal eliminar cuenta

  function showDeleteModal() {
    setDeleteModal(!deleteModal);
  }

  // Eliminar cuenta

  function handleAccountDelete() {
    const userId = user.id_user;
    axios
      .delete(url + "/deleteAccount", { data: { userId: userId } })
      .then((response) => {
        if (response.data.status === "Account deleted") {
          alert("Account deleted succesfully");
          localStorage.removeItem("user");
          window.location.href = "/";
        }
      })
      .catch((err) => {
        console.error("Error deleting user account");
      });
  }

  // stripe checkout

  const handleCheckout = async (plan) => {
    const userId = user.id_user;
    try {
      const response = await axios.post(url + "/create-checkout-session", {
        userId,
        plan,
      });
      const { sessionUrl, sessionId } = response.data;
      setUser({
        ...user,
        stripe_session_id: sessionId,
        subscription_status: "pending",
      });
      window.location.href = sessionUrl;
    } catch (error) {
      console.error("Error al adquirir plan: ", error);
    }
  };

  // Stripe subscription change

  const handleSubscriptionUpdate = async (plan) => {
    const subscriptionId = user.stripe_subscription_id;
    try {
      setIsChangingPlanLoading(true);
      const response = await axios.put(url + "/update-subscription", {
        subscriptionId,
        plan,
      });
      if (response.data.status === "success") {
        setUser({
          ...user,
          subscription: plan.title,
          subscription_status: "active",
          stripe_subscription_id: response.data.subscription.id,
        });
        setShowChangePlanModal(false);
        window.location.reload();
      } else {
        setIsChangingPlanLoading(false);
        alert("Error al cambiar suscripción");
        console.error("Error al cambiar plan: ", response.data.error);
      }
    } catch (error) {
      setIsChangingPlanLoading(false);
      console.error("Error al cambiar plan: ", error);
    }
  };

  // Stripe cancel subscription

  const handleCancelSubscription = (subscriptionId) => async () => {
    try {
      setIsCancelSubLoading(true);
      const response = await axios.put(url + "/cancel-subscription", {
        data: { subscriptionId },
      });
      if (response.data.status === "success") {
        setUser({
          ...user,
          subscription: "",
          subscription_status: "canceled",
          stripe_subscription_id: "",
        });
        setShowCancelSubscriptionModal(false);
        setIsCancelSubLoading(false);
        window.location.reload();
      }
    } catch (error) {
      console.error("Error al cancelar plan: ", error);
      alert("Error al cancelar plan");
      setIsCancelSubLoading(false);
    }
  };

  return (
    <>
      <main>
        <SideMenu />
        <div className="flex flex-col w-full h-full p-5 lg:p-10 overflow-y-auto justify-between">
          <h1 className="text-3xl lg:text-5xl my-3">Configuración</h1>
          <form
            className="flex flex-col flex-wrap w-fit self-center rounded-3xl items-center justify-center bg-card p-5 gap-3"
            action=""
            method="post"
            onSubmit={handleUpdate}
          >
            <h2 className="text-2xl font-bold">Tu información</h2>
            <div className="flex flex-wrap items-center justify-evenly gap-5">
              <div className="flex flex-col">
                <label className="text-xs text-gray-400 italic" htmlFor="name">
                  Nombre:
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={updatedUser.name}
                  onChange={handleChange}
                />
              </div>
              <div className="flex flex-col">
                <label
                  className="text-xs text-gray-400 italic"
                  htmlFor="lastname"
                >
                  Apellidos:
                </label>
                <input
                  type="text"
                  name="lastname"
                  id="lastname"
                  value={updatedUser.lastname}
                  onChange={handleChange}
                />
              </div>
              <div className="flex flex-col">
                <label className="text-xs text-gray-400 italic" htmlFor="phone">
                  Teléfono:
                </label>
                <input
                  type="number"
                  name="phone"
                  id="phone"
                  value={updatedUser.phone}
                  onChange={handleChange}
                />
              </div>
            </div>
            <button
              className="btn-primary px-5 py-3 rounded-full"
              type="submit"
            >
              Actualizar
            </button>
          </form>

          <section className="flex flex-col w-full items-center my-10">
            <div className="flex flex-col justify-center items-center bg-card p-5 rounded-3xl">
              <h2 className="text-2xl font-bold">Notificaciones</h2>
              <div className="flex gap-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="weekly_notification"
                    id="weekly_notification"
                    checked={user.weekly_notification}
                    onChange={(e) => {
                      setUser({
                        ...user,
                        weekly_notification: e.target.checked,
                      });
                      axios
                        .put(url + "/updateWeeklyNotification", {
                          userId: user.id_user,
                          weekly_notification: e.target.checked,
                        })
                        .catch((error) => {
                          console.error(
                            "Error al actualizar notificaciones: ",
                            error
                          );
                        });
                    }}
                  />
                  <label htmlFor="weekly_notification">
                    Recibir informes semanales
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="monthly_notification"
                    id="monthly_notification"
                    checked={user.monthly_notification}
                    onChange={(e) => {
                      setUser({
                        ...user,
                        monthly_notification: e.target.checked,
                      });
                      axios
                        .put(url + "/updateMonthlyNotification", {
                          userId: user.id_user,
                          monthly_notification: e.target.checked,
                        })
                        .catch((error) => {
                          console.error(
                            "Error al actualizar notificaciones: ",
                            error
                          );
                        });
                    }}
                  />
                  <label htmlFor="weekly_notification">
                    Recibir informes mensuales
                  </label>
                </div>
              </div>
            </div>
          </section>

          <section className="flex flex-col w-full items-center my-10">
            {!user.subscription && (
              <div className="flex flex-col gap-4 justify-center items-center bg-card p-5 rounded-3xl">
              <p className="text-xl text-center font-bold bg-red-900 px-5 py-2 rounded-3xl ">
                Elige una suscripción para acceder al resto de la plataforma.
                {" "}
              </p>
              <p className="text-md text-left">
                Stripe te pedirá que ingreses una tarjeta de crédito, pero no se
                te cobrará hasta pasar el periodo de prueba. Puedes
                cancelar la suscripción en cualquier momento.
              </p>
              </div>
            )}
            <h2 className=" font-bold text-2xl my-5">
              {user.subscription ? "Cambia tu plan" : "Elige tu plan"}
            </h2>
            <div className="flex flex-wrap justify-around w-full">
              <div className="w-full flex flex-wrap justify-around items-center gap-5">
                <div className="flex flex-col gap-2 p-5 bg-card rounded-2xl w-72 justify-between relative">
                  <h3 className="text-3xl italic my-1 bg-list-header w-full text-center px-3 py-1 rounded-full">
                    Básico
                  </h3>
                  <ul className="h-full">
                    <li className="flex items-center gap-2">
                      <img className="h-4 w-4" src={okIcon} alt="Ok Icon" />
                      200 marcas
                    </li>
                    <li className="flex items-center gap-2">
                      <img className="h-4 w-4" src={okIcon} alt="Ok Icon" />{" "}
                      Clientes ilimitados
                    </li>
                    <li className="flex items-center gap-2">
                      <img className="h-4 w-4" src={okIcon} alt="Ok Icon" />
                      Informes semanales
                    </li>
                    <li className="flex items-center gap-2">
                      <img className="h-4 w-4" src={okIcon} alt="Ok Icon" />
                      Informes mensuales
                    </li>
                    <li className="flex items-center gap-2">
                      <img className="h-4 w-4" src={okIcon} alt="Ok Icon" />
                      Notificaciones del IMPI
                    </li>
                    <li className="flex items-center gap-2">
                      <img className="h-4 w-4" src={okIcon} alt="Ok Icon" />
                      Cálculo de plazos
                    </li>
                    <li className="flex items-center gap-2 text-gray-500">
                      <div className="h-4 w-4" src={okIcon} alt="Ok Icon"></div>
                      Soporte 24/7
                    </li>
                  </ul>
                  <div className="flex items-baseline self-end">
                    <p className="text-3xl font-bold">$499</p>
                    <p>/mes</p>
                  </div>
                  {user.subscription === "Basico" ? (
                    <button
                      onClick={() => setShowCancelSubscriptionModal(true)}
                      className="px-10 py-3 my-4 w-full text-center rounded-full btn-cancel"
                    >
                      Cancelar plan
                    </button>
                  ) : user.subscription ? (
                    <button
                      className="btn-primary px-5 py-3 rounded-full"
                      onClick={() => {
                        setShowChangePlanModal(true);
                        setNewSubscription(basico);
                      }}
                    >
                      Cambiar plan
                    </button>
                  ) : (
                    <button
                      className="btn-primary px-5 py-3 rounded-full"
                      onClick={() => handleCheckout(basico)}
                    >
                      Suscríbete
                    </button>
                  )}
                  {user.subscription === "Basico" && (
                    <p className="text-xs px-3 py-1 text-black bg-yellow-400 font-bold rounded-full absolute -top-2 -right-2">
                      Plan Actual
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-2 p-5 bg-card rounded-2xl w-72 justify-between relative">
                  <h3 className="text-3xl italic my-1 bg-list-header w-full text-center px-3 py-1 rounded-full ">
                    Intermedio
                  </h3>
                  <ul className="h-full">
                    <li className="flex items-center gap-2">
                      <img className="h-4 w-4" src={okIcon} alt="Ok Icon" />
                      1000 marcas
                    </li>
                    <li className="flex items-center gap-2">
                      <img className="h-4 w-4" src={okIcon} alt="Ok Icon" />{" "}
                      Clientes ilimitados
                    </li>
                    <li className="flex items-center gap-2">
                      <img className="h-4 w-4" src={okIcon} alt="Ok Icon" />
                      Informes semanales
                    </li>
                    <li className="flex items-center gap-2">
                      <img className="h-4 w-4" src={okIcon} alt="Ok Icon" />
                      Informes mensuales
                    </li>
                    <li className="flex items-center gap-2">
                      <img className="h-4 w-4" src={okIcon} alt="Ok Icon" />
                      Notificaciones del IMPI
                    </li>
                    <li className="flex items-center gap-2">
                      <img className="h-4 w-4" src={okIcon} alt="Ok Icon" />
                      Cálculo de plazos
                    </li>
                    <li className="flex items-center gap-2 text-gray-500">
                      <div className="h-4 w-4" src={okIcon} alt="Ok Icon"></div>
                      Soporte 24/7
                    </li>
                  </ul>
                  <div className="flex items-baseline self-end">
                    <p className="text-3xl font-bold">$799</p>
                    <p>/mes</p>
                  </div>
                  {user.subscription === "Intermedio" ? (
                    <button
                      onClick={() => setShowCancelSubscriptionModal(true)}
                      className="px-10 py-3 my-4 w-full text-center rounded-full btn-cancel"
                    >
                      Cancelar plan
                    </button>
                  ) : user.subscription ? (
                    <button
                      className="btn-primary px-5 py-3 rounded-full"
                      onClick={() => {
                        setShowChangePlanModal(true);
                        setNewSubscription(intermedio);
                      }}
                    >
                      Cambiar plan
                    </button>
                  ) : (
                    <button
                      className="btn-primary px-5 py-3 rounded-full"
                      onClick={() => handleCheckout(intermedio)}
                    >
                      Suscríbete
                    </button>
                  )}
                  {user.subscription === "Intermedio" && (
                    <p className="text-xs px-3 py-1 text-black bg-yellow-400 font-bold rounded-full absolute -top-2 -right-2">
                      Plan Actual
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-2 p-5 bg-card rounded-2xl w-72 justify-between relative">
                  <h3 className="text-3xl italic my-1 bg-list-header w-full text-center px-3 py-1 rounded-full">
                    Profesional
                  </h3>
                  <ul className="h-full">
                    <li className="flex items-center gap-2">
                      <img className="h-4 w-4" src={okIcon} alt="Ok Icon" />
                      5000 marcas
                    </li>
                    <li className="flex items-center gap-2">
                      <img className="h-4 w-4" src={okIcon} alt="Ok Icon" />{" "}
                      Clientes ilimitados
                    </li>
                    <li className="flex items-center gap-2">
                      <img className="h-4 w-4" src={okIcon} alt="Ok Icon" />
                      Informes semanales
                    </li>
                    <li className="flex items-center gap-2">
                      <img className="h-4 w-4" src={okIcon} alt="Ok Icon" />
                      Informes mensuales
                    </li>
                    <li className="flex items-center gap-2">
                      <img className="h-4 w-4" src={okIcon} alt="Ok Icon" />
                      Notificaciones del IMPI
                    </li>
                    <li className="flex items-center gap-2">
                      <img className="h-4 w-4" src={okIcon} alt="Ok Icon" />
                      Cálculo de plazos
                    </li>
                    <li className="flex items-center gap-2">
                      <img className="h-4 w-4" src={okIcon} alt="Ok Icon" />
                      Soporte 24/7
                    </li>
                  </ul>
                  <div className="flex items-baseline self-end">
                    <p className="text-3xl font-bold">$1,499</p>
                    <p>/mes</p>
                  </div>
                  {user.subscription === "Profesional" ? (
                    <button
                      onClick={() => setShowCancelSubscriptionModal(true)}
                      className="px-10 py-3 my-4 w-full text-center rounded-full btn-cancel"
                    >
                      Cancelar plan
                    </button>
                  ) : user.subscription ? (
                    <button
                      className="btn-primary px-5 py-3 rounded-full"
                      onClick={() => {
                        setShowChangePlanModal(true);
                        setNewSubscription(profesional);
                      }}
                    >
                      Cambiar plan
                    </button>
                  ) : (
                    <button
                      className="btn-primary px-5 py-3 rounded-full"
                      onClick={() => handleCheckout(profesional)}
                    >
                      Suscríbete
                    </button>
                  )}
                  {user.subscription === "Profesional" && (
                    <p className="text-xs italic w-fit rounded-full px-3 py-1 text-black font-bold bg-yellow-400 absolute -top-2 -right-2">
                      Plan Actual
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-2 p-5 bg-card rounded-2xl w-72 justify-between relative">
                  <h3 className="text-3xl italic my-1 bg-list-header w-full text-center px-3 py-1 rounded-full">
                    Empresarial
                  </h3>
                  <ul className="h-full">
                    <li className="flex items-center gap-2">
                      <img className="h-4 w-4" src={okIcon} alt="Ok Icon" />
                      10000 marcas
                    </li>
                    <li className="flex items-center gap-2">
                      <img className="h-4 w-4" src={okIcon} alt="Ok Icon" />{" "}
                      Clientes ilimitados
                    </li>
                    <li className="flex items-center gap-2">
                      <img className="h-4 w-4" src={okIcon} alt="Ok Icon" />
                      Informes semanales
                    </li>
                    <li className="flex items-center gap-2">
                      <img className="h-4 w-4" src={okIcon} alt="Ok Icon" />
                      Informes mensuales
                    </li>
                    <li className="flex items-center gap-2">
                      <img className="h-4 w-4" src={okIcon} alt="Ok Icon" />
                      Notificaciones del IMPI
                    </li>
                    <li className="flex items-center gap-2">
                      <img className="h-4 w-4" src={okIcon} alt="Ok Icon" />
                      Cálculo de plazos
                    </li>
                    <li className="flex items-center gap-2">
                      <img className="h-4 w-4" src={okIcon} alt="Ok Icon" />
                      Soporte 24/7
                    </li>
                  </ul>
                  <div className="flex items-baseline self-end">
                    <p className="text-3xl font-bold">$1,999</p>
                    <p>/mes</p>
                  </div>
                  {user.subscription === "Empresarial" ? (
                    <button
                      onClick={() => setShowCancelSubscriptionModal(true)}
                      className="px-10 py-3 my-4 w-full text-center rounded-full btn-cancel"
                    >
                      Cancelar plan
                    </button>
                  ) : user.subscription ? (
                    <button
                      className="btn-primary px-5 py-3 rounded-full"
                      onClick={() => {
                        setShowChangePlanModal(true);
                        setNewSubscription(empresarial);
                      }}
                    >
                      Cambiar plan
                    </button>
                  ) : (
                    <button
                      className="btn-primary px-5 py-3 rounded-full"
                      onClick={() => handleCheckout(empresarial)}
                    >
                      Suscríbete
                    </button>
                  )}
                  {user.subscription === "Empresarial" && (
                    <p className="text-xs italic w-fit rounded-full px-3 py-1 text-black font-bold bg-yellow-400 absolute -top-2 -right-2">
                      Plan Actual
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>

          <button className="secondaryButton" onClick={showDeleteModal}>
            Eliminar cuenta
          </button>
        </div>

        {deleteModal && (
          <div className="h-full w-full p-4 absolute z-10 flex justify-center items-center backdrop-blur-md">
            <div className=" flex flex-col bg-card p-10 m-1 gap-3 text-center items-center rounded-3xl">
              <img className="h-14 w-14" src={warningIcon} alt="Warning Icon" />
              <h2 className="text-2xl">¿Estas seguro?</h2>
              <p>Esta acción no puede deshacerse.</p>
              <p className="max-w-96">
                Al eliminar tu cuenta, se cancelará tu suscripción
                automáticamente y se eliminará toda tu información de nuestra
                base de datos.
              </p>
              <div className="flex flex-col py-2">
                <button
                  className="btn-cancel px-10 py-3 rounded-full"
                  onClick={handleAccountDelete}
                >
                  Si, borrar mi cuenta.
                </button>
                <button
                  className="btn-primary px-10 py-3 rounded-full"
                  onClick={showDeleteModal}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {showCancelSubscriptionModal && (
          <div className="h-full w-full p-4 absolute z-10 flex justify-center items-center backdrop-blur-md">
            <div className=" flex flex-col bg-modal p-10 m-1 gap-3 text-center items-center rounded-3xl">
              <img className="h-20 w-20" src={warningIcon} alt="Warning Icon" />
              <h2 className="text-2xl">
                <strong>¿Estás seguro?</strong>
              </h2>
              <p>Esta acción no puede deshacerse.</p>
              <div className="flex flex-col">
                {isCancelSubLoading ? (
                  <div className="btn-cancel px-10 py-3 rounded-full">
                    <PulseLoader color="#1c2326" size={10} className="p-1" />
                  </div>
                ) : (
                  <button
                    className="btn-cancel px-10 py-3 rounded-full"
                    onClick={handleCancelSubscription(
                      user.stripe_subscription_id
                    )}
                  >
                    Si, cancelar suscripción.
                  </button>
                )}
                <button
                  className="btn-primary px-10 py-3 rounded-full"
                  onClick={() => setShowCancelSubscriptionModal(false)}
                >
                  Regresar
                </button>
              </div>
            </div>
          </div>
        )}

        {showChangePlanModal && (
          <div className="h-full w-full p-4 absolute z-10 flex justify-center items-center backdrop-blur-md">
            <div className=" flex flex-col bg-modal p-10 m-1 gap-3 text-center items-center rounded-3xl">
              <h2 className="text-2xl">
                <strong>
                  ¿Cambiar a la suscripción <i>"{newSubscription.title}"</i>?
                </strong>
              </h2>
              <p>
                Al confirmar el cambio de suscripción, se cobrará la mensualidad
                de la nueva suscripción, haciendo un descuento de los días
                restantes de la suscripción actual.
              </p>
              <div className="flex flex-col">
                {isChangingPlanLoading ? (
                  <div className="btn-cancel px-10 py-3 rounded-full">
                    <PulseLoader color="#1c2326" size={10} className="p-1" />
                  </div>
                ) : (
                  <button
                    className="btn-cancel px-10 py-3 rounded-full"
                    onClick={() => handleSubscriptionUpdate(newSubscription)}
                  >
                    Si, cambiar suscripción.
                  </button>
                )}
                <button
                  className="btn-primary px-10 py-3 rounded-full"
                  onClick={() => setShowChangePlanModal(false)}
                >
                  Regresar
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}

export default Configuration;
