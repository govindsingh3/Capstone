import { createContext, useContext } from "react";
import { useSimulationEngine } from "./useSimulationEngine.js";

const SimulationContext = createContext(null);

export const SimulationProvider = ({ children }) => {
  const engine = useSimulationEngine();
  return <SimulationContext.Provider value={engine}>{children}</SimulationContext.Provider>;
};

export const useSimulation = () => {
  const value = useContext(SimulationContext);
  if (!value) {
    throw new Error("useSimulation must be used inside SimulationProvider");
  }
  return value;
};
