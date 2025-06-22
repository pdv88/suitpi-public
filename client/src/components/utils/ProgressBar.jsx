import React, { useEffect, useState } from "react";

function ProgressBar({ data }) {
  const { marcas } = data;
  const [barPercent, setBarPercent] = useState(0);
  const [subLimit, setSubLimit] = useState(0);
  const userSubscription = JSON.parse(
    localStorage.getItem("user")
  ).subscription;

  useEffect(() => {
      getSubLimit(userSubscription);
  
}, []);

  useEffect(() => {
    setBarPercent(Math.floor((marcas.length / subLimit) * 100));
  }, [marcas, subLimit]);

  // Get subscription limit function
  const getSubLimit = (sub) => {
    switch (sub) {
      case "Basico":
        setSubLimit(200);
        break
      case "Intermedio":
        setSubLimit(1000);
        break
      case "Profesional":
        setSubLimit(5000);
        break
      case "Empresarial":
        setSubLimit(10000);
        break
      default:
        setSubLimit(0);

    }
  };

  return (
    <>
      <div className="flex justify-between items-baseline h-fit">
        <h2 className="h-fit text-2xl">Plan {userSubscription}</h2>
        <p className="text-xs h-fit">
          {marcas.length}/{subLimit} marcas.
        </p>
      </div>
      <div className="flex items-center w-full progress-bg h-4 px-1">
        <div
          className={`progress-bar h-3 px-1`}
          style={{ width: `${barPercent}%` }}
        ></div>
      </div>
      <p className="text-xs font-bold px-1 w-full text-center">{barPercent}%</p>
    </>
  );
}

export default ProgressBar;
