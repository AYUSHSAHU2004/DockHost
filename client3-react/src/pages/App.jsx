import React, { useState } from "react";
import Appbar from "../components/Appbar";
import FeatureCard from "../components/FeatureCard";
import PricingCard from "../components/PricingCard";

export default function App() {
  const [darkMode, setDarkMode] = useState(false);

  React.useEffect(() => {
    if (darkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [darkMode]);

  return (
    <div>
      <Appbar />
      {/* Hero, Features, Pricing sections */}
    </div>
  );
}
