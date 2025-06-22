import React, { useEffect, useState } from "react";
import axios from "axios";
import SideMenu from "../components/SideMenu";
import { useNavigate, useLocation } from "react-router-dom";
import { PulseLoader } from "react-spinners";

function SubSuccess() {
  const url = import.meta.env.VITE_URL;
  const navigate = useNavigate();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const session_id = queryParams.get('session_id');

  useEffect(() => {
      console.log(session_id);
      axios
      .get(url+'/success?session_id='+session_id)
      .then((result) => {
        if (result.data.session.status === 'complete') {
            setUser({...user, 
                customer_id: result.data.customer.id,
                stripe_subscription_id: result.data.session.subscription,
                subscription_status: 'active',
                stripe_customer_id: result.data.customer.id,
                subscription: result.data.subscription
            })
            setIsSubscribed(true);
            setIsLoading(false);
        } else {
            setIsSubscribed(false);
            setIsLoading(false);
        }
    });
  }, [session_id]);

  useEffect(() => {
    localStorage.setItem("user", JSON.stringify(user));
  },[user]);

  return (
    <main>
      {isLoading ? (
        <div className="flex items-center justify-center w-full h-full">
          <PulseLoader color="#d3d8d9" size={20} />
        </div>
      ) : (
      <section className="flex items-center justify-center w-full">
        {isSubscribed ? (
          <div>
            <h1>Subscripción Exitosa</h1>
            <p>¡Gracias por suscribirte!</p>
            <p>Ya puedes disfrutar de todas las funcionalidades de la plataforma</p>
            <p>Vuelve a iniciar sesión</p>
            <button
              className="btn-primary w-fit px-10 py-5 rounded-full"
              onClick={() => {
                localStorage.removeItem("user");
                window.location.href="/login"}}
            >
              Reiniciar Sesión
            </button>
          </div>
        ) : (
          <div className="flex flex-col text-center gap-5">
            <h1>La suscripción falló :( intenta de nuevo</h1>
            <button
              className="btn-primary w-fit px-10 py-5 rounded-full"
              onClick={() => navigate("/configuracion")}
            >
              Escoge tu suscripción
            </button>
          </div>
        )}
      </section>
      )}
    </main>
  );
}

export default SubSuccess;
