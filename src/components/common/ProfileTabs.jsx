import { Menu, Transition } from "@headlessui/react";
import React, { Fragment } from "react";
import { isBrowser } from "react-device-detect";
import { BiChevronDown, BiRefresh } from "react-icons/bi";

function ProfileTabs({
  currentActiveTab,
  handleTabChange,
  activeTab,
  username,
  handleFeedReload,
  isFeedReloading,
}) {
  const handleReload = () => {
    handleFeedReload();
  };
  return (
    <>
      {isBrowser ? (
        <>
          <div className='flex flex-row justify-between items-center py-2'>
            <h2 className='font-semibold text-lg heading'>
              {currentActiveTab === "posts"
                ? `Posts`
                : `Posts mentioning ${username}`}
            </h2>
            <div className='flex flex-row space-x-2'>
              <button
                className={`rounded-full px-3 dark:text-gray-200 ${
                  isFeedReloading
                    ? "animate-spin hover:bg-none"
                    : "hover:bg-gray-200 hover:dark:bg-gray-800 "
                }}`}
                onClick={handleReload}>
                <BiRefresh size={22} />
              </button>
              <button
                onClick={() => handleTabChange("posts")}
                className={`${
                  activeTab === "posts"
                    ? `brandGradientBg text-white`
                    : `dark:bg-[#212126] dark:hover:bg-[#1D1D21] hover:bg-gray-300 bg-gray-200 dark:text-white`
                } font-semibold px-8 py-2 rounded-full`}>
                Posts
              </button>

              <button
                onClick={() => handleTabChange("mentions")}
                className={`${
                  activeTab === "mentions"
                    ? `brandGradientBg text-white`
                    : `dark:bg-[#212126] dark:hover:bg-[#1D1D21] hover:bg-gray-300 bg-gray-200 dark:text-white`
                } font-semibold px-8 py-2 rounded-full`}>
                Mentions
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className='flex w-full items-center justify-between '>
          <Menu as='div' className='relative inline-block text-left'>
            <Menu.Button className='flex w-full menu space-x-1 items-center justify-start focus:outline-none'>
              <h2 className='font-semibold text-lg heading'>
                {currentActiveTab === "posts"
                  ? `Posts`
                  : `Posts mentioning ${username}`}
              </h2>
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
              <Menu.Items className='absolute left-0 z-20 mt-2 w-56 origin-top-right divide-y divide-gray-100 dark:divide-[#2D2D33] rounded-md primaryBg shadow-lg ring-1 ring-black ring-opacity-5 py-1 focus:outline-none'>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => handleTabChange("posts")}
                      className={`${
                        activeTab === "posts" ? "text-pink-600" : ""
                      } flex justify-between menu w-full px-4 py-2 `}>
                      Posts
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => handleTabChange("mentions")}
                      className={`${
                        activeTab === "mentions" ? "text-pink-600" : ""
                      } flex justify-between menu w-full px-4 py-2 `}>
                      Mentions
                    </button>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Transition>
          </Menu>
          <button
            className={` rounded-full px-1 py-1 dark:text-gray-200 items-end ${
              isFeedReloading
                ? "animate-spin hover:bg-none"
                : "hover:bg-gray-200 hover:dark:bg-gray-800 "
            }}`}
            onClick={handleReload}>
            <BiRefresh size={24} />
          </button>
        </div>
      )}
    </>
  );
}

export default ProfileTabs;
