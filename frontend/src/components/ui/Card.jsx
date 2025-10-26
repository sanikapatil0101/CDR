import React from "react";

export default function Card({ children, className = "", style = {} }) {
  return (
    <div
      className={`theme-card shadow-md rounded-xl p-4 transition hover:shadow-xl ${className}`}
      style={{ ...style }}
    >
      {children}
    </div>
  );
}
