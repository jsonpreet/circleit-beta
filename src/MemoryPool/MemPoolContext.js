import { createContext } from "react";

const MemPoolContext = createContext({
  memPool: [],
  updateMemPoolState: () => {},
  appState: {},
  exchangeRates: {},
});

export default MemPoolContext;
