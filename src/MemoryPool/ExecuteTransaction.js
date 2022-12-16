/* This is function for execute transaction
It is supposed to be like this:
1. It will take transaction as a parameter
2. It will execute the transaction after checking it's "TYPE"
3. After executing the transaction, it will make awaited api calls to get-txn to check if trasnaction has made to mempool
4. If it is not in mempool, then it will throw an error
5. If it is in mempool, then it will return the transaction response

*/
async function ExecuteTransaction(transaction, desoObject) {
  console.log("executing transaction");

  const transactinoType = transaction.type;
  const request = transaction.request;

  if (transactinoType === "LIKE") {
    let response = null;
    try {
      response = await desoObject.social.createLikeStateless(request);
    } catch (e) {
      console.log(e);
      response = e;
    } finally {
      return response;
    }

    return response;
    //TODO: make an awaited loop to hit get-txn api to check if transaction is in mempool.
    // I can't do rn bcz fucking desjs packakge does'nt return tranactionHashHex smh
  }
}

export default ExecuteTransaction;
