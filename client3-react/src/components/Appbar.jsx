import React from "react";

export default function Appbar() {
  return (
    <header className="bg-gray-800 text-white p-4 flex justify-between items-center">
      <h1 className="font-bold text-xl">UptimeMonitor</h1>
      <nav>
        <a href="/" className="mr-4 hover:text-gray-300">Home</a>
        <a href="/dashboard" className="hover:text-gray-300">Dashboard</a>
      </nav>
    </header>
  );
}
