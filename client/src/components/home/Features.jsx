import React from "react";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";

import alarmIcon from "../../assets/icons/alarm.svg";
import dashboardIcon from "../../assets/icons/dashboard.svg";
import archiveIcon from "../../assets/icons/archive.svg";
import mailIcon from "../../assets/icons/mail.svg";

import clientPageImg from "../../assets/clientPage.webp";
import dashboardImg from "../../assets/dashboard.webp";
import informeImg from "../../assets/page_informe.webp";
import notificacionesImg from "../../assets/newNotifications.webp";

function Features() {
  return (
    <>
      <Carousel
        className="max-w-7xl w-full max-h-6xl"
        showThumbs={false}
        showStatus={false}
        infiniteLoop
        useKeyboardArrows
        autoPlay
        interval={5000}
        preventMovementUntilSwipeScrollTolerance
        swipeScrollTolerance={100}
      >
        {/* Slide 1 */}
        <div className="flex lg:flex-row flex-col w-full p-1 lg:p-3  items-center gap-5 ">
          <div className="lg:w-1/3 flex flex-col gap-3 items-center px-5">
            <div className="flex flex-col w-fit bg-feature p-1 rounded-full">
              <div className="rounded-full bg-list-details">
                <img className="w-20 h-20 p-6" src={archiveIcon} alt="" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-center">
              Agrega tus marcas de forma facil y automática.
            </h3>
            <p>
              Solo tienes que introducir el numero de registro o numero de
              expediente y nosotros hacemos el resto por ti.
            </p>
          </div>
          <div className="lg:w-2/3 rounded-3xl bg-card overflow-hidden m-5">
            <img className="w-full h-full" src={clientPageImg} alt="" />
          </div>
        </div>

        {/* Slide 2 */}
        <div className="flex lg:flex-row flex-col w-full p-1 lg:p-3 items-center gap-5 ">
          <div className="lg:w-2/3 max-lg:hidden block rounded-3xl bg-card overflow-hidden m-5">
            <img className="w-full h-full" src={dashboardImg} alt="" />
          </div>
          <div className="lg:w-1/3 flex flex-col gap-3 items-center px-5">
            <div className="flex flex-col w-fit bg-feature p-1 rounded-full">
              <div className="rounded-full bg-list-details">
                <img className="w-20 h-20 p-6" src={dashboardIcon} alt="" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-center">
              Dashboard de marcas y clientes
            </h3>
            <p>
              Te mostramos la información mas relevante de tus marcas de forma
              que con una vista rapida sabes exactamente que acciones tomar.
            </p>
          </div>
          <div className="lg:w-2/3 max-lg:block hidden rounded-3xl bg-card overflow-hidden m-5">
            <img className="w-full h-full" src={dashboardImg} alt="" />
          </div>
        </div>

        {/* Slide 3 */}
        <div className="flex lg:flex-row flex-col w-full p-1 lg:p-3 items-center gap-5 ">
          <div className="lg:w-1/2 flex flex-col gap-3 items-center px-5">
            <div className="flex flex-col w-fit bg-feature p-1 rounded-full">
              <div className="rounded-full bg-list-details">
                <img className="w-20 h-20 p-6" src={mailIcon} alt="" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-center">
              Informes semanales o mensuales.
            </h3>
            <p>
              Contamos con un sistema de informes semanales y mensuales donde te
              mostramos las marcas con plazos a vencer.
            </p>
          </div>
          <div className="lg:w-1/2 rounded-3xl bg-card overflow-hidden m-5">
            <img className="w-full h-full" src={informeImg} alt="" />
          </div>
        </div>

        {/* Slide 4 */}
        <div className="flex lg:flex-row flex-col w-full p-1 lg:p-3 items-center gap-5 ">
          <div className="lg:w-2/3 max-lg:hidden block rounded-3xl bg-card overflow-hidden m-5">
            <img className="w-full h-full" src={notificacionesImg} alt="" />
          </div>
          <div className="lg:w-1/3 flex flex-col gap-3 items-center px-5">
            <div className="flex flex-col w-fit bg-feature p-1 rounded-full">
              <div className="rounded-full bg-list-details">
                <img className="w-20 h-20 p-6" src={alarmIcon} alt="" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-center">
              Notificaciones del IMPI
            </h3>
            <p>
              Recibe las actualizaciones del impi en tiempo real sobre las
              actualizaciones en el estatus del tramite de tus marcas.
            </p>
          </div>
          <div className="lg:w-2/3 max-lg:block hidden rounded-3xl bg-card overflow-hidden m-5">
            <img className="w-full h-full" src={notificacionesImg} alt="" />
          </div>
        </div>
      </Carousel>
    </>
  );
}

export default Features;
