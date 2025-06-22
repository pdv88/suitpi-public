import React from 'react';
import notificationIcon from '../../assets/icons/alarm.svg';
import calendarIcon from '../../assets/icons/calendar-check.svg';

export default function DeadlineSection() {
  return (
    <section className="w-full max-w-7xl">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="flex flex-col items-center space-y-4 text-center">
          <h2 className="text-left font-bold tracking-tighter text-4xl sm:text-5xl md:text-6xl">
            Nunca más te perderás un plazo
          </h2>
          <p className="max-w-[700px] max-md:text-left md:text-xl lg:text-base xl:text-xl">
          Nuestro sistema automatizado de revisión diaria de gacetas e informes periódicos te mantiene siempre al día y en control de tus marcas.
          </p>
        </div>
        <div className="flex flex-col lg:flex-row justify-evenly items-stretch gap-6 py-12 max-w-7xl">
          <div className="flex-1 relative overflow-hidden bg-card backdrop-blur-sm shadow-lg rounded-lg">
            <div className="flex flex-col items-center p-6 h-full">
                <img className="h-12 w-12 mb-4" src={notificationIcon} alt="notification icon" />
              <h3 className="text-2xl font-bold text-center mb-2">Notificaciones del IMPI</h3>
              <p className="text-center">
              Recibe notificaciones de tus marcas publicadas en las gacetas del día, actualizando la información de manera automática en tu cuenta.
              </p>
            </div>
            <div className="absolute top-0 right-0 h-16 w-16 bg-card rounded-bl-full" />
          </div>
          <div className="flex-1 relative overflow-hidden bg-card backdrop-blur-sm shadow-lg rounded-lg">
            <div className="flex flex-col items-center p-6 h-full">
                <img className="h-12 w-12 mb-4" src={calendarIcon} alt="calendar icon" />
              <h3 className="text-2xl font-bold text-center mb-2">Informes Mensuales y Semanales</h3>
              <p className="text-center ">
              Recibe una lista de las marcas que necesitan atención dentro de una semana o un mes.
              </p>
            </div>
            <div className="absolute top-0 right-0 h-16 w-16 bg-card rounded-bl-full" />
          </div>
        </div>
      </div>
    </section>
  );
}