/* The idea with this mempool technique is to make sure that client is experiencing everything smoothly with no waiting or loading animation taking time

The idea is simple:
1. When a transaction is created, it is added to the mempool
2. The mempool is a list of transactions that are waiting to be executed
3. Every second, the mempool is checked for transactions
4. If there are transactions, then the first transaction is executed
5. Once the transaction is executed, it is removed from the mempool
6. The mempool is checked again for transactions

This way, the client is not waiting for the transaction to be executed, but rather the transaction is executed in the background and the client is not aware of it.

NOTE: This is still in testing phase. And only a thing for "like" transaction.
When we makes rue that like thing is working smooth with proper exception handling, we will implement this for all the transactions.

*/

import MemPoolContext from "./MemPoolContext";
import { useState, useEffect } from "react";
import ExecuteTransaction from "./ExecuteTransaction";
import Deso from "deso-protocol";
import { DESO_CONFIG } from "../utils/Constants";
const deso = new Deso(DESO_CONFIG);
const MemPoolState = (props) => {
  const [memPool, setMemPool] = useState([]);
  const [appState, setAppState] = useState({});
  const [exchangeRates, setExchangeRates] = useState({});
  const updateMemPoolState = (newTransactionMapList) => {
    setMemPool([...memPool, newTransactionMapList]);
  };

  // function that runs every second to loop thorugh latest state of mempool

  let isLookingIntoMempool = false;
  useEffect(() => {
    //console.log("in mem pool looking for trasnaction");
    const interval = setInterval(async () => {
      if (!isLookingIntoMempool && memPool.length > 0) {
        isLookingIntoMempool = true;
        console.log(memPool);
        //loop through the mempool and execute the transactions
        let tempMemPool = memPool;

        for (const transaction of tempMemPool) {
          const val = await ExecuteTransaction(transaction, deso);
          console.log(val);
          tempMemPool.shift();
          console.log(tempMemPool);
        }

        console.log("transactions in memepool executed");
        if (tempMemPool.length === 0) {
          isLookingIntoMempool = false;
          setMemPool([]);
        }
        isLookingIntoMempool = false;
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [memPool]);

  useEffect(() => {
    async function initStates() {
      const request = {
        PublicKeyBase58Check:
          "BC1YLheA3NepQ8Zohcf5ApY6sYQee9aPJCPY6m3u6XxCL57Asix5peY",
      };
      const res = await deso.metaData.getAppState(request);
      setAppState(res);

      const response = await deso.metaData.getExchangeRate();
      setExchangeRates(response);
    }
    initStates();
  }, []);
  return (
    <MemPoolContext.Provider
      value={{ memPool, updateMemPoolState, appState, exchangeRates }}>
      {props.children}
    </MemPoolContext.Provider>
  );
};
export default MemPoolState;
