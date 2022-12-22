import React from "react";
import { Link } from "react-router-dom";

function CircleList({ name, list }) {
  return (
    <>
      {name && (
        <div className='flex flex-row py-6'>
          <h2 className='heading uppercase font-semibold'>{name}</h2>
        </div>
      )}
      <div className='flex flex-col'>
        {list.length > 0 &&
          list.map((circle, index) => {
            let circleUsername = circle.circleName.toLowerCase();
            return (
              <Link
                key={circleUsername}
                to={`/circle/${circleUsername}`}
                className=' w-full menu transition delay-100 flex flex-row space-x-2 items-center mb-[20px]'>
                <img
                  src={`https://diamondapp.com/api/v0/get-single-profile-picture/${circle.publicKey}?fallback=https://diamondapp.com/assets/img/default_profile_pic.png`}
                  className='rounded-full w-6 h-6'
                  alt=''
                />
                <span className='font-semibold tracking-wider'>
                  c/
                  {`${circle.circleName.slice(0, 13)}${
                    circle.circleName.length > 13 ? `...` : ""
                  }`}
                </span>
              </Link>
            );
          })}
      </div>
    </>
  );
}

export default CircleList;
