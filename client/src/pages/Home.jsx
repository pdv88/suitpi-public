import React from "react";

import Hero from "../components/home/Hero";
import Features from "../components/home/Features";
import WorkflowSpeedChart from "../components/home/WorkflowSpeedChart";
import DataExtraction from "../components/home/DataExtraction";
import DeadlineSection from "../components/home/DeadlineSection";
import FAQ from "../components/home/FAQ";
import PricingCards from "../components/home/PricingCards";
import Footer from "../components/Footer";

function Home() {
  document.title = "SuitPI | Propiedad Intelectual Simplificada";

  return (
    <>

    <div className="relative overflow-hidden">
        {/* Bouncing shapes */}
        <div className="absolute inset-0 -z-10">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className={`absolute rounded-full shadow-neumorph ${
                i % 2 === 0 ? "w-32 h-32" : "w-40 h-40 rounded-full"
              }`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `${i < 10 ? `move${i}` : `move${i % 10}`} ${
                  20 + i * 5
                }s infinite ease-in-out`,
              }}
            />
          ))}
        </div>

      <section className="flex flex-col max-lg:gap-14 gap-32 items-center self-center mx-auto">
        <Hero />
        <WorkflowSpeedChart />
        <DataExtraction />
        <DeadlineSection />
        <Features />
        <FAQ />
        <PricingCards />
      </section>
      <Footer />

      {/* CSS for animations and neumorphic effect */}
      <style jsx>{`
          @keyframes move0 {
            0%,
            100% {
              transform: translate(0, 0);
            }
            25% {
              transform: translate(50vw, 25vh);
            }
            50% {
              transform: translate(75vw, 75vh);
            }
            75% {
              transform: translate(25vw, 50vh);
            }
          }
          @keyframes move1 {
            0%,
            100% {
              transform: translate(0, 0);
            }
            25% {
              transform: translate(-30vw, 40vh);
            }
            50% {
              transform: translate(-60vw, -30vh);
            }
            75% {
              transform: translate(-20vw, -60vh);
            }
          }
          @keyframes move2 {
            0%,
            100% {
              transform: translate(0, 0);
            }
            25% {
              transform: translate(40vw, -35vh);
            }
            50% {
              transform: translate(-45vw, -65vh);
            }
            75% {
              transform: translate(-35vw, 30vh);
            }
          }
          @keyframes move3 {
            0%,
            100% {
              transform: translate(0, 0);
            }
            25% {
              transform: translate(-55vw, 20vh);
            }
            50% {
              transform: translate(35vw, 60vh);
            }
            75% {
              transform: translate(60vw, -40vh);
            }
          }
          @keyframes move4 {
            0%,
            100% {
              transform: translate(0, 0);
            }
            25% {
              transform: translate(45vw, 55vh);
            }
            50% {
              transform: translate(-50vw, -20vh);
            }
            75% {
              transform: translate(-25vw, 45vh);
            }
          }
          @keyframes move5 {
            0%,
            100% {
              transform: translate(0, 0);
            }
            25% {
              transform: translate(-40vw, -50vh);
            }
            50% {
              transform: translate(55vw, -30vh);
            }
            75% {
              transform: translate(30vw, 60vh);
            }
          }
          @keyframes move6 {
            0%,
            100% {
              transform: translate(0, 0);
            }
            25% {
              transform: translate(35vw, -45vh);
            }
            50% {
              transform: translate(-30vw, 55vh);
            }
            75% {
              transform: translate(-55vw, -35vh);
            }
          }
          @keyframes move7 {
            0%,
            100% {
              transform: translate(0, 0);
            }
            25% {
              transform: translate(-25vw, 40vh);
            }
            50% {
              transform: translate(60vw, -50vh);
            }
            75% {
              transform: translate(20vw, 30vh);
            }
          }
          @keyframes move8 {
            0%,
            100% {
              transform: translate(0, 0);
            }
            25% {
              transform: translate(55vw, 30vh);
            }
            50% {
              transform: translate(-40vw, 45vh);
            }
            75% {
              transform: translate(-50vw, -40vh);
            }
          }
          @keyframes move9 {
            0%,
            100% {
              transform: translate(0, 0);
            }
            25% {
              transform: translate(-45vw, -35vh);
            }
            50% {
              transform: translate(50vw, 40vh);
            }
            75% {
              transform: translate(35vw, -55vh);
            }
          }

          .shadow-neumorph {
            background: linear-gradient(145deg, #15191b, #2f3a40);
            border: 1px solid #313d416f;
            box-shadow: 10px 10px 20px #0f1314, -10px -10px 20px #252e31;
          }

          .shadow-neumorph-button {
            box-shadow: 6px 6px 12px #b8b9be, -6px -6px 12px #ffffff;
          }

          .shadow-neumorph-button-hover {
            box-shadow: inset 6px 6px 12px #97989c, inset -6px -6px 12px #ffffff;
          }
        `}</style>
        </div>
    </>
  );
}

export default Home;
