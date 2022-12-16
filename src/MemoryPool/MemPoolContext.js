import { createContext } from "react";

const MemPoolContext = createContext({
  memPool: [],
  updateMemPoolState: () => {},
});

export default MemPoolContext;
