import React, { useState, useMemo } from "react";
import { useWebsites } from "../hooks/useWebsites";
import DashboardCard from "../components/DashboardCard";
import CreateWebsiteModal from "../components/CreateWebsiteModal";

export default function Dashboard() {
  const [darkMode, setDarkMode] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { websites, refreshWebsites } = useWebsites();

  // processedWebsites logic same as before
  const processedWebsites = useMemo(() => { /* copy from previous Dashboard logic */ }, [websites]);

  React.useEffect(() => {
    if (darkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [darkMode]);

  return (
    <div>
      <button onClick={() => setIsModalOpen(true)}>Add Website</button>
      {processedWebsites.map((w) => <DashboardCard key={w.id} website={w} />)}
      <CreateWebsiteModal isOpen={isModalOpen} onClose={(url) => { /* axios POST + refresh */ }} />
    </div>
  );
}
