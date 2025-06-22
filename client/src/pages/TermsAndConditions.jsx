import React from "react";

import Header from "../components/Header";
import PoliticasTexto from "../components/utils/PoliticasTexto";
import Footer from "../components/Footer";

function TermsAndConditions() {
  return (
    <>
      <Header />
      <div className="flex flex-col justify-center items-center">
      <PoliticasTexto />
      </div>
      <Footer />
    </>
  );
}

export default TermsAndConditions;
