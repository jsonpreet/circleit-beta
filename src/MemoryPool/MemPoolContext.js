import { createContext } from "react";

//Using this we can feathc memPolList, updateMemPoolState, appState, exchangeRates from any component
//this helps us not to ping the getappstate and getexchangerate api every time we need to use it
const MemPoolContext = createContext({
  memPool: [],
  updateMemPoolState: () => {},
  appState: {},
  exchangeRates: {},
});

export default MemPoolContext;
