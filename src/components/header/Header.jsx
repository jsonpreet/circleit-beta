import React, { Fragment } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BsBarChart } from "react-icons/bs";
import { BiChevronDown, BiHomeAlt } from "react-icons/bi";
import { FiSunrise } from "react-icons/fi";
import { Menu, Transition } from "@headlessui/react";
import useApp from "../../store/app";
import BraveBrowserModal from "../modals/BraveBrowser";
import Deso from "deso-protocol";
import { ThemeSwitch } from "../theme";
import { DESO_CONFIG } from "../../utils/Constants";
import toast from "react-hot-toast";
import { MobileSearch, Search } from "../common/search";
import logo from "../../assets/logo.svg";
import { isMobile } from "react-device-detect";

const deso = new Deso(DESO_CONFIG);

function Header() {
  const { user, isLoggedIn, setLoggedIn, setUser, setCircle, isCircle } =
    useApp((state) => state);
  const [showModal, setShowModal] = React.useState(false);
  const navigate = useNavigate();

  const logout = async () => {
    const request = user.profile.PublicKeyBase58Check;
    try {
      const response = await deso.identity.logout(request);
      if (response) {
        toast.success("Logout Successfully!");
        setUser({});
        setCircle(false);
        setLoggedIn(false);
        navigate("/");
      } else {
        console.log(response);
      }
    } catch (error) {
      toast.error("Something went wrong");
      console.log(error);
    }
  };

  const loginWithDeso = async (ignoreBrowser) => {
    //check if browsers is brave
    if (!ignoreBrowser) {
      if ((navigator.brave && (await navigator.brave.isBrave())) || false) {
        setShowModal(true);
        return;
      }
    }
    setShowModal(false);
    try {
      const request = 4;
      const response = await deso.identity.login(request);
      if (response) {
        const request = {
          PublicKeyBase58Check: response.key,
        };

        try {
          const data = await deso.user.getSingleProfile(request);
          let checkExtraData = data.Profile.ExtraData
            ? data.Profile.ExtraData.CircleIt
            : false;
          if (checkExtraData) {
            try {
              let payload = JSON.parse(data.Profile.ExtraData.CircleIt);
              let isCircle =
                payload && payload.isCircle === "true" ? true : false;
              setCircle(isCircle);
            } catch {
              setCircle(false);
            }
          }

          setUser({ profile: data.Profile });
          setLoggedIn(true);
        } catch (error) {
          // toast.error("Something went wrong");
          // console.log(error);
          //route to /sign-up
          localStorage.setItem("newDeSoPublicKey", response.key);
          navigate("/sign-up");
        }
      } else {
        console.log(response);
      }
    } catch (error) {
      toast.error("Something went wrong");
      console.log(error);
    }
  };

  return (
    <>
      <div className='dark:bg-[#121214] bg-white dark:border-[#2D2D33] border-gray-100 border-b fixed items-center flex justify-between flex-row z-30 md:left-56 left-0 w-full md:w-[calc(100%-224px)] right-0 top-0 bg-opacity-70 bg-clip-padding backdrop-blur-xl backdrop-filter'>
        <div className='flex flex-row items-center w-full h-16 px-4 justify-start md:justify-between'>
          {isMobile ? (
            <div className='flex-1 flex flex-row items-center'>
              <Link to='/'>
                <div className='relative text-4xl font-bold dark:text-white sm:text-4xl lg:text-5xl leading-none rounded-full z-10'>
                  {/* <span className="brandGradientBg blur-2xl filter opacity-40 dark:opacity-30 w-full h-full absolute inset-0 rounded-full"></span> */}
                  <img src={logo} className='h-10' alt='Circleit Logo'></img>
                </div>
              </Link>
            </div>
          ) : null}
          <div className='hidden md:flex justify-between mx-6 flex-row items-center'>
            <Link
              to='/'
              className='mr-6 menu font-semibold flex flex-row flex-grow transition delay-75 '>
              <BiHomeAlt size={24} />
              <span className='ml-2'>Home</span>
            </Link>
            <Link
              to='/latest'
              className='mr-6 menu font-semibold flex flex-row flex-grow transition delay-75'>
              <FiSunrise size={24} />
              <span className='ml-2'>Latest</span>
            </Link>
            <Link
              to='/hot'
              className='menu font-semibold flex flex-row flex-grow transition delay-75'>
              <BsBarChart size={24} />
              <span className='ml-2'>Popular</span>
            </Link>
          </div>
          <Search />
          <div className='justify-end items-center flex flex-row space-x-5 md:space-x-0'>
            <div className='md:flex-col flex justify-center space-x-5 md:space-x-0 items-center md:ml-6 md:mr-2'>
              {isMobile ? <MobileSearch /> : null}
              <ThemeSwitch />
            </div>
            {!isLoggedIn ? (
              <button
                onClick={() => loginWithDeso(false)}
                className='font-medium text-white px-6 py-2 rounded-full buttonBG ml-2 md:mr-6'>
                <span>Get Started </span>
              </button>
            ) : (
              // <Link to={`/create/post`} className='font-medium text-white px-6 py-2 rounded-full buttonBG mx-6'>
              //   <span>Create Post</span>
              // </Link>
              <div className='flex flex-row items-center justify-end'>
                <Menu as='div' className='relative w-full flex text-left'>
                  <Menu.Button className='flex w-full menu space-x-1 items-center justify-center focus:outline-none'>
                    <div className='flex space-x-3 items-center justify-center'>
                      <img
                        src={`https://diamondapp.com/api/v0/get-single-profile-picture/${user.profile.PublicKeyBase58Check}`}
                        alt=''
                        className='rounded-full w-7 h-7 md:w-10 md:h-10 md:ml-4'
                      />
                      <span className='hidden md:flex'>
                        Hey, {user.profile.Username}
                      </span>
                    </div>
                    <BiChevronDown size={20} />
                  </Menu.Button>
                  <Transition
                    as={Fragment}
                    enter='transition ease-out duration-100'
                    enterFrom='transform opacity-0 scale-95'
                    enterTo='transform opacity-100 scale-100'
                    leave='transition ease-in duration-75'
                    leaveFrom='transform opacity-100 scale-100'
                    leaveTo='transform opacity-0 scale-95'>
                    <Menu.Items className='absolute right-0 z-10 mt-10 w-56 origin-top-right divide-y divide-gray-100 dark:divide-[#2D2D33] rounded-md primaryBg shadow-lg ring-1 ring-black ring-opacity-5 py-1 focus:outline-none'>
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            className={`${
                              active ? "text-pink-600" : ""
                            } flex justify-between menu w-full px-4 py-2 `}
                            to={`/${isCircle ? `circle` : `u`}/${
                              user.profile.Username
                            }`}>
                            My Profile
                          </Link>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            className={`${
                              active ? "text-pink-600" : ""
                            } flex justify-between menu w-full px-4 py-2 `}
                            to={`/${isCircle ? `circle` : `u`}/${
                              user.profile.Username
                            }/settings`}>
                            Account Settings
                          </Link>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={() => logout()}
                            className={`${
                              active ? "text-pink-600" : ""
                            } cursor-pointer flex menu justify-between w-full px-4 py-2`}>
                            Logout
                          </button>
                        )}
                      </Menu.Item>
                    </Menu.Items>
                  </Transition>
                </Menu>
              </div>
            )}
          </div>
        </div>
      </div>
      <BraveBrowserModal
        showModal={showModal}
        setShowModal={setShowModal}
        loginWithDeso={loginWithDeso}
      />
    </>
  );
}

export default Header;
