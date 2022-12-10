import React from "react";
import { Link } from "react-router-dom";
import { FaGem } from "react-icons/fa";
import Tippy from "@tippyjs/react/headless";

import SubProfileCard from "../cards/SubProfileCard";
function DiaondedCreatorList({ name, list, diamondInfoMap }) {
  return (
    <>
      {name && (
        <div className='flex flex-row py-6'>
          <h2 className='heading uppercase font-semibold'>{name}</h2>
        </div>
      )}
      <div className='flex flex-col'>
        {list.length > 0 &&
          list.map((userInfo, index) => {
            let username = userInfo.ProfileEntryResponse.Username;
            let publicKey = userInfo.ProfileEntryResponse.PublicKeyBase58Check;

            return (
              <div className='flex items-center  my-1'>
                <div className='flex items-center space-x-1'>
                  <Tippy
                    followCursor={true}
                    placement='bottom'
                    interactive={true}
                    maxWidth={300}
                    interactiveDebounce={100}
                    delay={100}
                    render={(attrs) => (
                      <SubProfileCard
                        isCircle={false}
                        profile={userInfo.ProfileEntryResponse}
                        {...attrs}
                      />
                    )}>
                    <Link
                      to={`/u/${username}`}
                      className='w-full menu transition delay-100 flex flex-row space-x-2  mb-[20px] items-center'>
                      <img
                        src={`https://diamondapp.com/api/v0/get-single-profile-picture/${publicKey}?fallback=https://diamondapp.com/assets/img/default_profile_pic.png`}
                        className='rounded-full w-7 h-7'
                        alt=''
                      />
                      <span className='font-semibold tracking-wider'>
                        {`${username.slice(0, 18)}${
                          username.length > 18 ? `...` : ""
                        }`}
                      </span>
                    </Link>
                  </Tippy>
                </div>

                <div className='flex items-center space-x-1 justify-end w-full mb-[20px]'>
                  <div className='text-blue-600 dark:text-gray-200 flex items-center space-x-1'>
                    <p>{diamondInfoMap[publicKey].diamonds_received_24h}</p>
                    <FaGem size={20} />
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </>
  );
}

export default DiaondedCreatorList;
