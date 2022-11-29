import React from "react";
import { useState } from "react";

import { BiUpload, BiX } from "react-icons/bi";
export default function Monetization({ user, sidebar }) {
  const [circleGuidelines, setCircleGuidelines] = useState("");
  return (
    <div className="flex md:mt-6 flex-col w-full space-y-6 md:flex-row md:space-x-10 md:space-y-0">
      <div className="flex flex-col w-full md:w-1/4">
        {sidebar}
      </div>
      <div className='flex flex-col justify-start items-start my-4 md:mx-2  secondaryBg border secondaryBorder rounded-xl p-4 space-y-2 w-full md:w-3/4'>
        <div className='w-full md:w-3/5'>
          <p className='font-semibold mb-2 primaryTextColor'>
            NFT royality percentage
          </p>
          <input
            type='text'
            placeholder='have to finish this'
            className='search rounded-full px-3 py-2 w-full outline-none focus:shadow transition delay-50 darkenBg darkenBorder border darkenHoverBg placeholder:text-gray-400 dark:placeholder:text-gray-500'/>
        </div>
        <div className='flex items-center'>
          <button className='font-medium text-white px-6 py-3 leading-none  rounded-full buttonBG my-4'>
            <span>Save Changes</span>
          </button>
        </div>
      </div>
    
    </div>
  );
}
