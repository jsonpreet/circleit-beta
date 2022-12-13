//Component for allowing users to beg for deso after selling their phone info LMAOO.
//Only visible if new logged in user doesn't has min deso required to complete profile

import React from "react";

export default function BegDESO({ publicKey }) {
  const begDeSoButton = () => {
    //ope new window in new browser tab
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
      <button onClick={begDeSoButton}>BegDeso</button>
    </div>
  );
}
