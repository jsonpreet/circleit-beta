import React, { useEffect, useState, useContext } from "react";

import DiamondedCreatorsList from "./DiamondedCreatorsList";
import Deso from "deso-protocol";
// TODO: add catch exception to manage handlings when API errors out

import GlobalContext from "../../utils/GlobalContext/GlobalContext";

function SidebarRight() {
  const GlobalContextValue = useContext(GlobalContext);
  const deso = new Deso();
  const [diamondInfoMap, setDiamondInfoMap] = useState(
    Object.keys(GlobalContextValue.diamondInfoMap).length == 0
      ? {}
      : GlobalContextValue.diamondInfoMap
  );
  useEffect(() => {
    async function fetchTopDiamonded() {
      if (Object.keys(GlobalContextValue.diamondInfoMap).length == 0) {
        const response = await fetch(
          "https://altumbase.com/api/diamonds_received_24h?ref=bcl&page_size=20&page=0"
        );
        const data = await response.json();

        let publicKeyList = [];
        //loop through data.data list
        let tempDimaondInfoMap = {};

        for (let i = 0; i < data.data.length; i++) {
          let currentItem = data.data[i];
          tempDimaondInfoMap[currentItem.public_key] = {
            diamonds_received_24h: currentItem.diamonds_received_24h,
            diamonds_received_value_24h:
              currentItem.diamonds_received_value_24h,
          };
          publicKeyList.push(currentItem.public_key);
        }
        GlobalContextValue.updateDiamondInfoMap(tempDimaondInfoMap);
        if (
          Object.keys(GlobalContextValue.topDiamonderStatelessResponse).length ==
          0
        ) {
          const request = {
            PublicKeysBase58Check: publicKeyList,
            SkipForLeaderboard: true,
          };
          const response2 = await deso.user.getUserStateless(request);
          GlobalContextValue.updateTopDiamonderStatelessResponse(response2);
        }
      } else {
      }
    }
    fetchTopDiamonded();
  }, []);
  return (
    <>
      <div className='flex flex-col md:w-96 md:ml-6 secondaryBg border secondaryBorder rounded-md secondaryTextColor py-4 items-start justify-start'>
        <div className='flex-1 w-full flex flex-col'>
          <div className='flex items-center space-x-2 px-4 text-xl font-bold mb-4 pb-4 border-b secondaryBorder dark:text-white'>
            <h3 className=''>Top Diamonded Creators</h3>
          </div>
          {Object.keys(GlobalContextValue.diamondInfoMap).length > 0 && (
            <div className='px-4'>
              <DiamondedCreatorsList
                list={
                  typeof GlobalContextValue.topDiamonderStatelessResponse
                    .UserList == "undefined"
                    ? []
                    : GlobalContextValue.topDiamonderStatelessResponse.UserList
                }
                diamondInfoMap={GlobalContextValue.diamondInfoMap}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default SidebarRight;
