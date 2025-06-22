import React from "react";
import { Disclosure, Transition } from "@headlessui/react";
import { ChevronUpIcon } from "@heroicons/react/20/solid";

const faqs = [
  {
    question: "¿Qué es SuitPI?",
    answer:
      "SuitPI es una plataforma SAAS (Software as a Service) diseñada para monitorear trámites de marcas y revisar gacetas oficiales del IMPI (Instituto Mexicano de Propiedad Industrial). Extrae la información de las marcas y actualiza automáticamente las marcas que tengan cambios en las gacetas del IMPI notificandote de estos cambios.",
  },
  {
    question:
      "¿Con qué frecuencia SuitPI actualiza la información de las marcas?",
    answer:
      "SuitPI revisa las gacetas oficiales del IMPI diariamente y actualiza la información de las marcas en tiempo real. Esto asegura que siempre tengas la información más reciente sobre el estado de los trámites de marcas que estás monitoreando.",
  },
  {
    question: "¿Qué tipo de información puedo monitorear con SuitPI?",
    answer:
      "Con SuitPI puedes monitorear diversos aspectos de los trámites de marcas, incluyendo solicitudes de registro, oposiciones, concesiones, negativas, caducidades, nulidades y cualquier otro cambio en el estado legal de las marcas publicado en las gacetas del IMPI. Además, calcula los días restantes para diferentes plazos según el estatus de la marca.",
  },
  {
    question: "¿Cómo funciona la suscripción mensual de SuitPI?",
    answer:
      "SuitPI opera con un modelo de suscripción mensual. Esto te permite acceder a todos los servicios de monitoreo y actualización de información de marcas por un pago mensual. La suscripción se renueva automáticamente cada mes, pero puedes cancelarla en cualquier momento.",
  },
  {
    question: "¿Puedo cancelar mi suscripción en cualquier momento?",
    answer:
      "Sí, puedes cancelar tu suscripción a SuitPI en cualquier momento. No hay contratos a largo plazo ni penalizaciones por cancelación. Una vez que canceles, tendrás acceso al servicio hasta el final del período de facturación actual.",
  },
  {
    question: "¿Es seguro el metodo de pago?",
    answer:
      "Utilizamos STRIPE como intermediario para procesar los pagos, un servicio altamente confiable. En ningún momento almacenamos la información de tus tarjetas de crédito.",
  },
];

export default function SuitPIFAQ() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-12">
      <h2 className="font-extrabold tracking-tight text-center mb-8 text-4xl sm:text-5xl md:text-6xl">
        Preguntas Frecuentes
      </h2>
      <div className="mx-auto w-full max-w-7xl rounded-2xl p-2">
        {faqs.map((faq, index) => (
          <Disclosure as="div" key={index} className="mt-2">
            {({ open }) => (
              <>
                <Disclosure.Button className="flex w-full justify-between rounded-lg  px-4 py-2 text-left font-medium bg-list backdrop-blur-sm focus:outline-none focus-visible:ring focus-visible:ring-gray-500 focus-visible:ring-opacity-75">
                  <span>{faq.question}</span>
                  <ChevronUpIcon
                    className={`${
                      open ? "rotate-180 transform" : ""
                    } h-5 w-5  transition-transform duration-300 ease-in-out`}
                  />
                </Disclosure.Button>
                <Transition
                  show={open}
                  enter="transition-all duration-500 ease-in-out"
                  enterFrom="max-h-0 opacity-0"
                  enterTo="max-h-[500px] opacity-100"
                  leave="transition-all duration-300 ease-in"
                  leaveFrom="max-h-[500px] opacity-100"
                  leaveTo="max-h-0 opacity-0"
                >
                  <Disclosure.Panel static className="overflow-hidden">
                    <div className="px-4 pt-4 pb-2 bg-list-details backdrop-blur-sm p-2">
                      {faq.answer}
                    </div>
                  </Disclosure.Panel>
                </Transition>
              </>
            )}
          </Disclosure>
        ))}
      </div>
    </div>
  );
}
