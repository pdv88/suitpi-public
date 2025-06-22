import react, { useState, useEffect } from "react";
import axios from "axios";
import { PulseLoader } from "react-spinners";

import SideMenu from "./SideMenu";
import AlertModal from "./utils/AlertModal";
import TableNotifications from "./utils/TableNotifications";

function NotificationsPage() {
  const url = import.meta.env.VITE_URL;

  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const userId = JSON.parse(localStorage.getItem("user")).id_user;
    const data = { userId: userId };

    axios
      .post(url + "/getNotifications", data)
      .then((results) => {
        if (results.data.status === "success") {
          setNotifications(results.data.notifications);
        }
      })
      .catch((error) => {
        console.error("Error fetching notifications: " + error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    verifyDevice();
    document.title = "SuitPI | Notificaciones IMPI";
  });



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

  return (
    <>
      {localStorage.getItem("user") === null ? (
        (window.location.href = "/login")
      ) : (
        <main>
          <SideMenu />
          {isLoading ? (
            <div className="flex justify-center items-center w-full">
              <PulseLoader color="#d3d3d3" size={20} className="p-1" />
            </div>
          ) : (
            <section className="flex-col p-5 lg:p-10 w-full overflow-x-hidden max-sm:pb-20">
              <h1 className="text-3xl lg:text-5xl my-3">Notificaciones</h1>

              {notifications.length === 0 ? (
                <div className="flex justify-center items-center">
                  <p className="text-xl font-bold">No hay notificaciones</p>
                </div>
              ) : (
                <>
                  <TableNotifications notifications={notifications}/>
                </>
              )}
            </section>
          )}
        </main>
      )}
    </>
  );
}

export default NotificationsPage;
