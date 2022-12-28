import Linkify from "linkify-react";
import React, { useState } from "react";
import { useEffect } from "react";
import { LinkifyOptions } from "../../utils/Functions";
import { useNavigate } from "react-router-dom";
import { NODE_URL } from "../../utils/Constants";
import defaultBanner from "../../assets/defaultBanner.jpg";
function CircleCard({ circleStateless }) {
  const navigate = useNavigate();

  let cover = defaultBanner;

  let imgURL = `${NODE_URL}/get-single-profile-picture/${circleStateless.ProfileEntryResponse.PublicKeyBase58Check}?fallback=https://diamondapp.com/assets/img/default_profile_pic.png`;
  try {
    for (const [key, value] of Object.entries(
      circleStateless.ProfileEntryResponse.ExtraData
    )) {
      if (key === "LargeProfilePicURL" && value !== "") {
        imgURL = value;
      }
      if (key === "FeaturedImageURL" && value !== "") {
        cover = value;
      }
    }
  } catch (e) {
    //console.log(e);
  }

  //get all text till newline from circleStateless.ProfileEntryResponse.Description
  const description =
    circleStateless.ProfileEntryResponse.Description.split("/n")[0];

  const handleFollow = async () => {
    //have to write this after making mempool thing work
  };

  return (
    <>
      <div className='rounded-md secondaryBg secondaryBorder secondaryTextColor overflow-hidden border relative z-0 '>
        <div className='flex flex-col'>
          <div
            className='h-32 md:h-48'
            style={{
              position: "relative",
              backgroundImage: `url(${cover !== "" ? cover : defaultBanner})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}></div>

          <div className='flex flex-col items-center justify-center -mt-20 relative z-10'>
            <img
              src={imgURL}
              className='rounded-full subHeader border-4 border-white dark:border-[#212126] w-24 h-24 md:w-32 md:h-32'
              alt={circleStateless.ProfileEntryResponse.Username}
            />
            <div className='flex items-center flex-col mt-1'>
              <h2 className='font-semibold text-2xl text-clip overflow-hidden'>
                {circleStateless.ProfileEntryResponse.ExtraData?.DisplayName
                  ? circleStateless.ProfileEntryResponse.ExtraData?.DisplayName
                  : circleStateless.ProfileEntryResponse.Username}
              </h2>
              <p className='text-gray-500 dark:text-gray-400 text-sm over text-clip overflow-hidden '>{`${`c`}/${
                circleStateless.ProfileEntryResponse.Username
              }`}</p>
            </div>
          </div>
        </div>
        <div className='p-6 pt-2'>
          <div className='w-full pt-2 h-[6.5rem] overflow-hidden'>
            <Linkify options={LinkifyOptions}>{description}</Linkify>
          </div>
        </div>
        <div className='divider'></div>

        <div className='divider'></div>
        <div className='px-6 py-4 items-center justify-center flex'>
          {/* Fuck desoAPIs. getUserStateless doesn't return any of the required shit smh */}
          {/* {false ? (
            <button className='py-2 px-10 border border-transparent rounded-full text-sm font-medium text-white buttonBG focus:outline-none'>
              Leave
            </button>
          ) : (
            <button className='py-2 px-10 border border-transparent rounded-full text-sm font-medium text-white buttonBG focus:outline-none'>
              Join
            </button>
          )} */}
          <button
            className='py-2 px-10 border border-transparent rounded-full text-sm font-medium text-white buttonBG focus:outline-none'
            onClick={() => {
              navigate(
                `/circle/${circleStateless.ProfileEntryResponse.Username}`
              );
            }}>
            View
          </button>
        </div>
      </div>
    </>
  );
}

export default CircleCard;
