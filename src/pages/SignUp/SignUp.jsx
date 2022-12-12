import Deso from "deso-protocol";
import { Fragment, useEffect, useState } from "react";
import useApp from "../../store/app";

import { DefaultLayout } from "../../components/layouts";
import { isBrowser } from "react-device-detect";
import { Menu, Transition } from "@headlessui/react";
import { BiChevronDown } from "react-icons/bi";
import { Header } from "../../components/header";
import ProfileForm from "./ProfileForm";

export default function SignUp() {
 

  return (
    <>
      <div className='relative inline-flex justify-center rounded-full items-center w-full my-8'>
        <div className='relative text-4xl md:py-10 font-bold text-center dark:text-white sm:text-4xl lg:text-5xl leading-none rounded-full z-10'>
          <span className='brandGradientBg blur-2xl filter opacity-10 w-full h-full absolute inset-0 rounded-full'></span>
          <span className='md:px-5'>
            Welcome to {" "}
            <span className='text-transparent bg-clip-text brandGradientBg'>
              CircleIt
            </span>{" "}
          </span>
        </div>
      </div>
      <div className="mx-auto flex justify-center">
      <ProfileForm/>
      </div>

    
    </>
  );
}
