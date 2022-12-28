import React, { Fragment, useCallback } from "react";
import { Link } from "react-router-dom";
import { dateFormat, timeStampToTimeAgo } from "../../../utils/Functions";
import SubProfileCard from "../../cards/SubProfileCard";
import Tippy from "@tippyjs/react/headless";
import { NODE_URL } from "../../../utils/Constants";
import greenCheck from "../../../assets/greenCheck.svg";
import { useState } from "react";
import { BiCopy, BiDotsHorizontalRounded } from "react-icons/bi";
import { Menu, Transition } from "@headlessui/react";
import { RiScreenshot2Line } from "react-icons/ri";
import useApp from "../../../store/app";
import { toast } from "react-hot-toast";
import { toPng, toJpeg, toBlob, toPixelData, toSvg } from 'html-to-image';

function PostTopMeta({
  isCircle,
  circle,
  post,
  isCommunityPost,
  onCirclePage,
  rootRef,
}) {
  let verifiedPayload = null;
  const setExport = useApp((state) => state.setExport);
  try {
    verifiedPayload = circle
      ? circle.ExtraData.CircleIt !== undefined
        ? JSON.parse(circle.ExtraData.CircleIt)
        : null
      : null;
  } catch {
    verifiedPayload = null;
  }

  const [listOfVerifiedUsers, setListOfVerifiedUsers] = useState(
    verifiedPayload?.VerifiedUsers.length > 0
      ? verifiedPayload.VerifiedUsers.map((user) => user.PublicKeyBase58Check)
      : []
  );

  let payload = null;
  try {
    payload = post.ProfileEntryResponse?.ExtraData?.CircleIt
      ? JSON.parse(post.ProfileEntryResponse?.ExtraData.CircleIt)
      : null;
  } catch {
    payload = null;
  }

  const profileIsCircle =
    payload !== null && payload.isCircle === "true" ? true : false;
  const url = onCirclePage
    ? isCommunityPost
      ? `/circle/${circle.Username}`
      : `/u/${post.ProfileEntryResponse?.Username}`
    : `/circle/${post.ProfileEntryResponse?.Username}`;
  const profile = onCirclePage
    ? isCommunityPost
      ? circle
      : post.ProfileEntryResponse
    : circle;
  
  

  const saveImage = useCallback(() => {
    const toastId = toast.loading("Exporting image to PNG...")
    setExport(true);
    if (rootRef?.current === null) {
      return
    }
    const d = new Date();
    let time = d.getTime();
    const fileName = 'Circleit.app__' + time;

    setTimeout(() =>
      toJpeg(rootRef?.current, { cacheBust: true, pixelRatio: 3 }).then((dataUrl) => {
        exportLink(dataUrl, fileName);
        setExport(false);
        toast.update(toastId, { render: "Image exported!", type: "success", isLoading: false, autoClose: 2000, hideProgressBar: true  });
    })
    .catch((err) => {
      console.log(err);
    })
    , 1500);
  }, [rootRef])

  const exportLink = (dataUrl, fileName) => {
    const link = document.createElement('a')
    link.download = `${fileName}.jpeg`
    link.href = dataUrl
    link.click()
  }

  return (
    <>
      <div className='flex flex-row items-center justify-start space-x-2 w-full mb-1'>
        <div className='flex items-center text-sm font-bold -mt-[2px]'>
          <Tippy
            followCursor={true}
            placement='bottom'
            interactive={true}
            maxWidth={300}
            interactiveDebounce={100}
            delay={200}
            render={(attrs) => (
              <SubProfileCard
                isCircle={false}
                profile={!isCommunityPost ? post.ProfileEntryResponse : circle}
                {...attrs}
              />
            )}>
            <Link
              to={url}
              className='primaryTextColor text-sm cursor-pointer relative hover:underline flex items-center justify-center space-x-1'>
              <img
                src={`${NODE_URL}/get-single-profile-picture/${
                  onCirclePage
                    ? isCommunityPost
                      ? circle.PublicKeyBase58Check
                      : post.ProfileEntryResponse.PublicKeyBase58Check
                    : post.ProfileEntryResponse.PublicKeyBase58Check
                }?fallback=https://diamondapp.com/assets/img/default_profile_pic.png`}
                className='w-8 h-8 rounded-full mt-1'
                alt={
                  onCirclePage
                    ? isCommunityPost
                      ? circle.Username
                      : post.ProfileEntryResponse.Username
                    : post.ProfileEntryResponse.Username
                }
              />
              <span>
                {/* Show user name on post which are on circle Feed */}
                {!onCirclePage &&
                  !isCommunityPost &&
                  post.ProfileEntryResponse.Username}

                {/* Show CircleName on post which are on Community Feed in Circle Page */}
                {!onCirclePage &&
                  isCommunityPost &&
                  (isCircle ? `c/${circle.Username}` : `${circle.Username}`)}
                {onCirclePage && isCommunityPost && circle.Username}

                {onCirclePage &&
                  !isCommunityPost &&
                  post.ProfileEntryResponse.Username}
              </span>
              {onCirclePage &&
                !isCommunityPost &&
                listOfVerifiedUsers &&
                listOfVerifiedUsers.indexOf(
                  post.ProfileEntryResponse.PublicKeyBase58Check
                ) > -1 && <img src={greenCheck} alt='' className='w-4 h-4' />}
            </Link>
          </Tippy>
        </div>

        {!isCommunityPost &&
          !onCirclePage &&
          typeof post.PostExtraData.CircleUsername != "undefined" && (
            <div className='flex items-center text-sm'>
              <span className='md:inline-flex hidden mr-1 extralightText'>
                Posted in
              </span>
              <Link
                to={`/circle/${post.PostExtraData.CircleUsername}`}
                className='text-sm cursor-pointer hover:underline relative flex items-center justify-center space-x-1 extralightText'>
                <span>{`c/${post.PostExtraData.CircleUsername}`}</span>
              </Link>
            </div>
          )}
        <div className='flex items-center space-x-2'>
          <span className='middot' />
          <div className='items-center text-sm'>
            <span
              className='text-sm extralightText'
              title={dateFormat(post.TimestampNanos)}>
              {timeStampToTimeAgo(post.TimestampNanos)}
            </span>
          </div>
        </div>
        <div>
          <Menu as='div' className='relative w-full flex text-left'>
            <Menu.Button className='flex w-full menu space-x-1 items-center justify-center focus:outline-none'>
              <BiDotsHorizontalRounded size={20} />
            </Menu.Button>
            <Transition
              as={Fragment}
              enter='transition ease-out duration-100'
              enterFrom='transform opacity-0 scale-95'
              enterTo='transform opacity-100 scale-100'
              leave='transition ease-in duration-75'
              leaveFrom='transform opacity-100 scale-100'
              leaveTo='transform opacity-0 scale-95'>
              <Menu.Items className='absolute right-0 z-10 mt-10 w-44 origin-top-right divide-y divide-gray-100 dark:divide-[#2D2D33] rounded-md primaryBg shadow-lg ring-1 ring-black ring-opacity-5 py-1 focus:outline-none'>
                <Menu.Item>
                  {({ active }) => (
                    <button 
                      className={`${
                        active ? "bg-gray-100 dark:bg-[#2D2D33]" : ""
                        } group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                      onClick={() => null}
                    >
                      <BiCopy className='mr-2' size={20} />
                      Copy Link
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button 
                      className={`${
                        active ? "bg-gray-100 dark:bg-[#2D2D33]" : ""
                        } group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                      onClick={() => {
                          setExport(true)
                          saveImage()
                        }
                      }
                    >
                      <RiScreenshot2Line className='mr-2' size={20} />
                      Screenshot
                    </button>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>
    </>
  );
}

export default PostTopMeta;
