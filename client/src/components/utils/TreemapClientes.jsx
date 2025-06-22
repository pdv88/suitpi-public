import React from "react";
import { useNavigate } from "react-router-dom";
import { Treemap, ResponsiveContainer, Tooltip } from "recharts";

function TreemapClientes({ clientes, marcas }) {
  const navigate = useNavigate();
  const CustomizedContent = ({ colors, ...props }) => {
    // Generate unique id for the gradient
    const gradientId = `gradient${props.index}`;
    const gap = 0;

    return (
      <g>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="5%" stopColor={colors[0]} stopOpacity={0.8} />
            <stop offset="95%" stopColor={colors[1]} stopOpacity={0.8} />
          </linearGradient>
        </defs>
        <rect
          x={props.x + gap / 2}
          y={props.y + gap / 2}
          width={props.width - gap}
          height={props.height - gap}
          style={{
            fill: `url(#${gradientId})`,
            stroke: "#1c2326",
            cursor: "pointer",
          }}
          onClick={() => {
            navigate(`/clientes/${props.id_client}`);
          }}
        //   rx={20} // rounded corners
        // ry={20}

        />
        <text
          className="cursor-pointer"
          x={props.x + 5 + gap / 2} 
          y={props.y + props.height / 2}
          textAnchor="left"
          fill="#1c2326"
          onClick={() => {
            navigate(`/clientes/${props.id_client}`);
          }}
          dominantBaseline="central"
        >
          {props.name}
        </text>
      </g>
    );
  };

  return (
    <>
      <div className="flex bg-card rounded-3xl overflow-hidden my-5 w-full min-h-[25rem] self-center bg-transparent">
        <ResponsiveContainer width="100%" height={400}>
          <Treemap
            data={clientes.map((cliente) => {
              return {
                name: cliente.name,
                totalMarcas: marcas.filter(
                  (marca) => marca.id_client === cliente.id_client
                ).length,
                id_client: cliente.id_client,
              };
            })}
            dataKey="totalMarcas"
            aspectRatio={4 / 3}
            content={(props) => (
              <CustomizedContent
                colors={["#598CA4", "#94B5C4"]}
                {...props}
                
              />
            )}
          >
            <Tooltip 
              formatter={(value) => [`${value} marcas`]}
            />
          </Treemap>
        </ResponsiveContainer>
      </div>
    </>
  );
}

export default TreemapClientes;
