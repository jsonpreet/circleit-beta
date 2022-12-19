//Component for allowing users to beg for deso after selling their phone info LMAOO.
//Only visible if new logged in user doesn't has min deso required to complete profile

import { React, useEffect, useState } from "react";
import { MIN_DESO_TO_CREATE_PROFILE } from "../../utils/Constants";
export default function BegDESO({ publicKey, desoObj }) {
  const [balance, setBalance] = useState(0);
  const [isBeggin, setIsBegging] = useState(false);
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        console.log("checking balance");

        const request = {
          PublicKeysBase58Check: [publicKey],
          SkipForLeaderboard: false,
        };
        const response2 = await desoObj.user.getUserStateless(request);
        if (response2.UserList[0].BalanceNanos >= MIN_DESO_TO_CREATE_PROFILE) {
          window.location.reload();
        }

        console.log(response2);
        console.log("done...");
      } catch (error) {
        console.log(error);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, []);
  const begDeSoButton = () => {
    //ope new window in new browser tab
    setIsBegging(true);
    function openInNewTab() {
      const win = window.open(
        `https://identity.deso.org/verify-phone-number?public_key=${publicKey}`,
        "_blank",
        "width=600,height=800,left=500,top=80,toolbar=yes,location=yes,menubar=yes,status=yes"
      );
      console.log(win);

      win.focus();
      console.log(win);
    }
    openInNewTab();
  };
  return (
    <div>
      <h1 className='text-2xl font-bold text-center mt-12 sm:mt-6'>
        To Create your Digital Identity Profile on CircleIt, you need at least{" "}
        {MIN_DESO_TO_CREATE_PROFILE} $DESO tokens.
      </h1>
      <p className='primaryTextColor text-center mt-4'>
        You can get free $DESO tokens by verifying your phone number. This is
        done in order to prevent bots.
      </p>

      <button
        onClick={begDeSoButton}
        className={
          "flex items-center justify-center space-x-2 rounded-md border border-transparent px-4 py-2 text-md font-medium buttonBG focus:outline-none mx-auto mt-4"
        }>
        Verify Phone Number
      </button>
      {isBeggin && (
        <p className='primaryTextColor text-center mt-4'>
          After verification, you will be redirected to CircleIt. Please wait...
        </p>
      )}
      <p className='primaryTextColor text-center mt-4'></p>
    </div>
  );
}
