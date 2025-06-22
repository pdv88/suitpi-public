import React, { useEffect, useState } from "react";
import axios from "axios";
import xIcon from "../assets/icons/xmark.svg";

function Notifications({
  notificationsOpen,
  setNotificationsOpen,
  notifications,
  setNotifications,
}) {
  const url = import.meta.env.VITE_URL;

  const handleNotificationRead = (id_notification) => {
    const data = { id_notification: id_notification };
    axios
      .put(url + "/markAsRead", data)
      .then((results) => {
        if (results.data.status === "success") {
          const auxNotifications = notifications.map((notification) => {
            if (notification.id_notification === id_notification) {
              return { ...notification, isRead: 1 };
            } else {
              return notification;
            }
          });
          setNotifications(auxNotifications);
        }
      })
      .catch((error) => {
        console.error("Error setting notification read: " + error);
      });
  };

  return (
    <>
      {notificationsOpen && (
        <div className="flex fixed p-5 top-0 h-screen w-full backdrop-blur-sm max-h-screen justify-center items-center">
          <div className="relative bg-notifications opacity-100 h-fit max-h-[90vh] overflow-auto min-w-80 p-5 rounded-3xl">
            <button
              className="absolute right-3 top-3"
              onClick={() => setNotificationsOpen(false)}
            >
              <img
                className="w-10 h-10 p-2.5 bg-card rounded-full"
                src={xIcon}
                alt=""
              />
            </button>
            <div>
              <h2 className="text-3xl text-center my-2">Notificaciones</h2>
            </div>
            {notifications.length === 0 ? (
              <p className="text-center">No tienes notificaciones nuevas</p>
            ) : (
              <ul className="flex flex-col sm:gap-1">
                <li className="flex text-center sm:gap-1 justify-between bg-list-header py-1 px-3">
                  <p className="font-bold">Exp</p>
                  <p className="font-bold">Desc. Oficio</p>
                  <p className="font-bold">Fecha</p>
                </li>
                <div className="overflow-auto p-5">
                  {notifications.map((notification) => (
                    <li
                      className="flex relative max-sm:text-sm sm:gap-1 items-center justify-between border-b-[1px] border-gray-700"
                      style={
                        !notification.isRead
                          ? { color: "#9ac3d5", fontWeight: "bold" }
                          : { color: "#f9f9f9" }
                      }
                      key={notification.id_notification}
                      onClick={() =>
                        handleNotificationRead(notification.id_notification)
                      }
                    >
                      {!notification.isRead && (
                        <div className="flex absolute -left-4 h-full items-center justify-center">
                          <button className=" w-2 h-2 bg-[#9ac3d5] rounded-full"></button>
                        </div>
                      )}
                      <p>{notification.numExp}</p>
                      <a
                        className="py-1 px-2 bg-transparent rounded-lg text-wrap text-center"
                        target="_blank"
                        href={notification.urlOficio}
                      >
                        {notification.descOficio}
                      </a>
                    <p className="text-nowrap">{new Date(notification.fechaOficio).toLocaleDateString()}</p>
                    </li>
                  ))}
                </div>
              </ul>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default Notifications;
