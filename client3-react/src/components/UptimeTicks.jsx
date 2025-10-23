import React from "react";

export default function UptimeTicks({ ticks }) {
  return (
    <div className="flex gap-1 mt-2">
      {ticks.map((tick, index) => (
        <div
          key={index}
          className={`w-8 h-2 rounded ${
            tick === "good" ? "bg-green-500" : tick === "bad" ? "bg-red-500" : "bg-gray-500"
          }`}
        />
      ))}
    </div>
  );
}
