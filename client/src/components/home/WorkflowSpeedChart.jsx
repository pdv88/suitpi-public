import React, { useState, useEffect, useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";

const data = [
  { name: "SuitPI", time: 22, color: "#90cdf4" },
  { name: "Excel", time: 1, color: "#e0e0e0" },
];

export default function Component() {
  const [isVisible, setIsVisible] = useState(false);
  const chartRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (chartRef.current) {
      observer.observe(chartRef.current);
    }

    return () => {
      if (chartRef.current) {
        observer.unobserve(chartRef.current);
      }
    };
  }, []);

  const AnimatedNeumorphicBar = (props) => {
    const { fill, x, y, width, height } = props;
    const [barWidth, setBarWidth] = useState(0);

    useEffect(() => {
      if (isVisible) {
        setBarWidth(width);
      }
    }, [isVisible, width]);

    const filterId = `neumorphic-${fill ? fill.slice(1) : "default"}`;

    return (
      <g>
        <defs>
          <filter id={filterId}>
            <feDropShadow
              dx="2"
              dy="2"
              stdDeviation="3"
              floodOpacity="0.3"
              floodColor="#121719"
            />
            <feDropShadow
              dx="-2"
              dy="-2"
              stdDeviation="3"
              floodOpacity="0.3"
              floodColor="#262f33"
            />
          </filter>
        </defs>
        <rect
          x={x}
          y={y}
          width={barWidth}
          height={height}
          fill={fill || "#598ca4"}
          rx={height / 8}
          ry={height / 8}
          className="transition-all duration-1000 ease-out"
          filter={`url(#${filterId})`}
        />
        {props.label && (
          <text
            x={x + barWidth + 10}
            y={y + height / 2}
            fill="#4a5568"
            textAnchor="start"
            dominantBaseline="middle"
            className="font-bold text-lg"
          >
            {props.label.formatter(props.value)}
          </text>
        )}
      </g>
    );
  };

  return (
    <>
      <div className="max-lg:flex-col flex px-5 max-w-7xl items-center justify-center">

        <div className="max-lg:w-full w-full">
          <h2 className="font-extrabold tracking-tight text-center mb-8 text-4xl sm:text-5xl md:text-6xl">
            ¡Hasta 22 veces mas rápido!
          </h2>
          <p>
            Haciendo una simulación del armado de una cartera de 600 marcas
            usando una hoja de calculo tradicional (Excel) se llevó 
            <span className="text-red-400 font-bold"> 45hrs</span>. En cambio, con
            SuitPI, tan solo se llevo{" "}
            <span className="text-blue-400 font-bold">2hrs</span>. Lo que
            resulta en un{" "}
            <span className="text-blue-400"> ahorro hasta del 95.5% de tu tiempo.</span>
          </p>
        </div>

        <div
          ref={chartRef}
          className="h-64 sm:h-64 w-full py-6 items-center justify-center"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 5, right: 50, left: 20, bottom: 5 }}
            >
              <XAxis
                type="number"
                tickFormatter={(value) => `${value} hrs`}
                stroke="#71809600"
              />
              <YAxis dataKey="name" type="category" stroke="#718096" />
              <Bar
                dataKey="time"
                fill={(entry) => entry.color}
                shape={<AnimatedNeumorphicBar height={60} />}
                label={{
                  position: "right",
                  formatter: (value) => `${value}x`,
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>
    </>
  );
}
