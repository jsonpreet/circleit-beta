import Deso from "deso-protocol";
import { Fragment, useEffect, useState, useRef } from "react";
import useApp from "../../store/app";

import { DefaultLayout } from "../../components/layouts";
import Account from "./settings/Account";
import Moderation from "./settings/Moderation";
import Verification from "./settings/Verification";
import Monetization from "./settings/Monetization";
import Delete from "./settings/DeleteAccount";
import { isBrowser } from "react-device-detect";
import { Menu, Transition } from "@headlessui/react";
import { BiChevronDown } from "react-icons/bi";
import { DESO_CONFIG } from "../../utils/Constants";

const deso = new Deso(DESO_CONFIG);

export const Sidebar = ({ activeTab, handleTabChange, currentActiveTab }) => {
  const { isCircle } = useApp();

  return (
    <>
      {isBrowser ? (
        <>
          <div className='w-full'>
            <div className='flex flex-col secondaryBg border secondaryBorder rounded-lg pb-4'>
              <div>
                <h1 className='p-4 secondaryTextColor font-bold text-xl'>
                  {/* {isCircle ? `Circle` : `Account`}  */}
                  {activeTab === "account"
                    ? `Account`
                    : activeTab === "moderation"
                    ? "Moderation"
                    : activeTab === "verification"
                    ? "Verification"
                    : activeTab === "monetization"
                    ? "Monetization"
                    : `Delete`}{" "}
                  Settings
                </h1>
              </div>
              <div className='divider mb-2'></div>
              <div className='flex flex-col items-start justify-start px-2 w-full space-y-1'>
                <button
                  onClick={() => handleTabChange("account")}
                  className={`${
                    activeTab === "account" ? " anotherBG" : null
                  }  menu font-semibold anotherBGhover rounded-lg px-4 text-left transition w-full delay-75 py-2`}>
                  Account
                </button>
                {isCircle ? (
                  <>
                    <button
                      onClick={() => handleTabChange("moderation")}
                      className={`${
                        activeTab === "moderation" ? "anotherBG" : null
                      }  menu font-semibold anotherBGhover rounded-lg px-4 text-left transition w-full delay-75 py-2`}>
                      Moderation
                    </button>
                    <button
                      onClick={() => handleTabChange("verification")}
                      className={`${
                        activeTab === "verification" ? "anotherBG" : null
                      }  menu font-semibold anotherBGhover rounded-lg px-4 text-left transition w-full delay-75 py-2`}>
                      Verification
                    </button>
                    <button
                      onClick={() => handleTabChange("monetization")}
                      className={`${
                        activeTab === "monetization" ? "anotherBG" : null
                      }  menu font-semibold anotherBGhover rounded-lg px-4 text-left transition w-full delay-75 py-2`}>
                      Monetization
                    </button>
                    <button
                      onClick={() => handleTabChange("delete")}
                      className={`${
                        activeTab === "delete" ? "anotherBG" : null
                      }  font-semibold text-red-500 anotherBGhover rounded-lg px-4 text-left transition w-full delay-75 py-2`}>
                     Delete Circle
                    </button>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <Menu as='div' className='relative inline-block text-left'>
            <Menu.Button className='flex w-full menu space-x-1 items-center justify-start focus:outline-none'>
              <h2 className='font-semibold text-lg heading'>
                {activeTab === "account"
                  ? `Account`
                  : activeTab === "moderation"
                  ? "Moderation"
                  : activeTab === "verification"
                  ? "Verification"
                  : activeTab === "monetization"
                  ? "Monetization"
                  : `Delete`}{" "}
                Settings
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
                      onClick={() => handleTabChange("account")}
                      className={`${
                        activeTab === "account" ? "text-pink-600" : ""
                      } flex justify-between menu w-full px-4 py-2 `}>
                      Account
                    </button>
                  )}
                </Menu.Item>
                {isCircle ? (
                  <>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => handleTabChange("moderation")}
                          className={`${
                            activeTab === "moderation" ? "text-pink-600" : ""
                          } flex justify-between menu w-full px-4 py-2 `}>
                          Moderation
                        </button>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => handleTabChange("verification")}
                          className={`${
                            activeTab === "verification" ? "text-pink-600" : ""
                          } flex justify-between menu w-full px-4 py-2 `}>
                          Verification
                        </button>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => handleTabChange("monetization")}
                          className={`${
                            activeTab === "monetization" ? "text-pink-600" : ""
                          } flex justify-between menu w-full px-4 py-2 `}>
                          Monetization
                        </button>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => handleTabChange("delete")}
                          className={`${
                            activeTab === "delete" ? "text-pink-600" : ""
                          } flex justify-between menu w-full px-4 py-2 `}>
                          Delete
                        </button>
                      )}
                    </Menu.Item>
                  </>
                ) : null}
              </Menu.Items>
            </Transition>
          </Menu>
        </>
      )}
    </>
  );
};

export default function CircleSettings() {
  const { user } = useApp();
  const rootRef = useRef(null);
  const [activeTab, setActiveTab] = useState("account");
  const [currentActiveTab, setCurrentActiveTab] = useState("");

  let lastTab = localStorage.getItem("settingsTab");

  useEffect(() => {
    if (lastTab) {
      setActiveTab(lastTab);
      setCurrentActiveTab(lastTab);
    } else {
      setActiveTab("account");
      setCurrentActiveTab("account");
      localStorage.setItem("settingsTab", "account");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    localStorage.setItem("settingsTab", tab);
  };

  return (
    <div ref={rootRef}>
      <DefaultLayout>
        <div className='flex flex-col mt-6 justify-start items-start'>
          <div className='w-full'>
            {activeTab === "account" && (
              <Account
                user={user}
                sidebar={
                  <Sidebar
                    activeTab={activeTab}
                    currentActiveTab={currentActiveTab}
                    handleTabChange={handleTabChange}
                  
                  />
                }
                desoObj={deso}
                rootRef={rootRef}
              />
            )}
            {activeTab === "moderation" && (
              <Moderation
                user={user}
                sidebar={
                  <Sidebar
                    activeTab={activeTab}
                    currentActiveTab={currentActiveTab}
                    handleTabChange={handleTabChange}
                  />
                }
              />
            )}
            {activeTab === "verification" && (
              <Verification
                user={user}
                sidebar={
                  <Sidebar
                    activeTab={activeTab}
                    currentActiveTab={currentActiveTab}
                    handleTabChange={handleTabChange}
                  />
                }
              />
            )}
            {activeTab === "monetization" && (
              <Monetization
                user={user}
                sidebar={
                  <Sidebar
                    activeTab={activeTab}
                    currentActiveTab={currentActiveTab}
                    handleTabChange={handleTabChange}
                  />
                }
              />
            )}
            {activeTab === "delete" && (
              <Delete
                user={user}
                sidebar={
                  <Sidebar
                    activeTab={activeTab}
                    currentActiveTab={currentActiveTab}
                    handleTabChange={handleTabChange}
                  />
                }
              />
            )}
          </div>
        </div>
      </DefaultLayout>
    </div>
  );
}
