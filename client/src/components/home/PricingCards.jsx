import React from "react";
import { useNavigate } from "react-router-dom";
import okIcon from "../../assets/icons/ok.svg";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";

function PricingCards() {
  const navigate = useNavigate();

  const plans = [
    {
      name: "Basico",
      price: "499",
      features: [
        {
          name: "200 marcas",
          available: true,
        },
        {
          name: "Clientes ilimitados",
          available: true,
        },
        {
          name: "Informes semanales",
          available: true,
        },
        {
          name: "Informes mensuales",
          available: true,
        },
        {
          name: "Notificaciones del IMPI",
          available: true,
        },
        {
          name: "Calculo de plazos",
          available: true,
        },
        {
          name: "Soporte 24/7",
          available: false,
        },
      ],
    },
    {
      name: "Intermedio",
      price: "799",
      features: [
        {
          name: "1000 marcas",
          available: true,
        },
        {
          name: "Clientes ilimitados",
          available: true,
        },
        {
          name: "Informes semanales",
          available: true,
        },
        {
          name: "Informes mensuales",
          available: true,
        },
        {
          name: "Notificaciones del IMPI",
          available: true,
        },
        {
          name: "Calculo de plazos",
          available: true,
        },
        {
          name: "Soporte 24/7",
          available: false,
        },
      ],
    },
    {
      name: "Profesional",
      price: "1499",
      features: [
        {
          name: "5000 marcas",
          available: true,
        },
        {
          name: "Clientes ilimitados",
          available: true,
        },
        {
          name: "Informes semanales",
          available: true,
        },
        {
          name: "Informes mensuales",
          available: true,
        },
        {
          name: "Notificaciones del IMPI",
          available: true,
        },
        {
          name: "Calculo de plazos",
          available: true,
        },
        {
          name: "Soporte 24/7",
          available: true,
        },
      ],
    },
    {
      name: "Empresarial",
      price: "1,999",
      features: [
        {
          name: "10000 marcas",
          available: true,
        },
        {
          name: "Clientes ilimitados",
          available: true,
        },
        {
          name: "Informes semanales",
          available: true,
        },
        {
          name: "Informes mensuales",
          available: true,
        },
        {
          name: "Notificaciones del IMPI",
          available: true,
        },
        {
          name: "Calculo de plazos",
          available: true,
        },
        {
          name: "Soporte 24/7",
          available: true,
        },
      ],
    },
  ];

  return (
    <>
      <section className="flex flex-col w-full gap-5 items-center mb-10">
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold p-5 ">
          Conoce nuestros planes:
        </h2>
        {/* no slider */}
        <div className="flex flex-wrap gap-10 w-full items-center justify-center max-sm:hidden">
          {plans.map((plan, index) => (
            <div
              key={index}
              className="flex flex-col gap-2 p-5 bg-card backdrop-blur-sm rounded-2xl h-fit min-w-64 justify-between"
            >
              <h3 className="text-3xl italic my-1 bg-card-title w-full text-center px-3 py-1 rounded-full">
                {plan.name}
              </h3>
              <ul className="flex flex-col gap-2 h-full ">
                {plan.features.map((feature, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-2"
                    style={{
                      opacity: feature.available ? 1 : 0.5,
                      textDecoration: feature.available
                        ? "none"
                        : "line-through",
                    }}
                  >
                    <img className="h-4 w-4" src={okIcon} alt="Ok Icon" />
                    {feature.name}
                  </li>
                ))}
              </ul>
              <div className="flex items-baseline self-end">
                <p className="text-3xl font-bold">${plan.price}</p>
                <p>/mes</p>
              </div>
            </div>
          ))}
        </div>

        {/* slider */}

        <div className="max-sm:flex hidden w-full items-center justify-center">
          <Carousel
            className="w-full touch-action-none"
            useKeyboardArrows
            showStatus={false}
            showIndicators={false}
            showThumbs={false}
            centerMode={true}
            slidesToSlide={1}
            fadeOutAnimation
            centerSlidePercentage={80}
            preventMovementUntilSwipeScrollTolerance
            swipeScrollTolerance={100}
          >
            {plans.map((plan, index) => (
              <div
                key={index}
                className="flex flex-col p-5 m-6 bg-card backdrop-blur-sm rounded-2xl h-fit w-[90%] "
              >
                <h3 className="text-3xl italic my-1 bg-card-title w-full text-center px-3 py-1 rounded-full">
                  {plan.name}
                </h3>
                <ul className="flex flex-col gap-2">
                  {plan.features.map((feature, index) => (
                    <li
                      key={index}
                      className="flex items-center justify-start w-fit gap-2 text-nowrap"
                      style={{
                        opacity: feature.available ? 1 : 0.5,
                        textDecoration: feature.available
                          ? "none"
                          : "line-through",
                      }}
                    >
                      <img
                        className="h-4 w-4 justify-start "
                        src={okIcon}
                        alt="Ok Icon"
                      />
                      <p className="w-full">{feature.name}</p>
                    </li>
                  ))}
                </ul>
                <div className="flex items-baseline self-end">
                  <p className="text-3xl font-bold">${plan.price}</p>
                  <p>/mes</p>
                </div>
              </div>
            ))}
          </Carousel>
        </div>

        <button
          onClick={() => navigate("/register")}
          className="btn-primary w-fit max-sm:w-[90%] px-10 py-5 rounded-full"
        >
          Comienza tus 15 días de prueba gratis
        </button>
      </section>
    </>
  );
}

export default PricingCards;
