import React from "react";
import { Link } from "react-router-dom";
import { FaGem } from "react-icons/fa";
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
              <Link
                key={username}
                to={`/circle/${username}`}
                className=' w-full menu transition delay-100 flex flex-row space-x-2 items-center mb-[20px]'>
                <div className='flex items-center space-x-1'>
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
                </div>
                <div className='flex items-center space-x-1 justify-end w-full'>
                  <div className='text-blue-600 dark:text-white flex items-center space-x-1'>
                    <p>{diamondInfoMap[publicKey].diamonds_received_24h}</p>
                    <FaGem size={20} />
                  </div>
                </div>
              </Link>
            );
          })}
      </div>
    </>
  );
}

export default DiaondedCreatorList;
