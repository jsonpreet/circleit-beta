import React from "react";
import { Link } from "react-router-dom";
import { dateFormat, timeStampToTimeAgo } from "../../../utils/Functions";
import SubProfileCard from "../../cards/SubProfileCard";
import Tippy from "@tippyjs/react/headless";
import { NODE_URL } from "../../../utils/Constants";
import greenCheck from "../../../assets/greenCheck.svg";
import { useState } from "react";
function PostTopMeta({
  isCircle,
  circle,
  post,
  isCommunityPost,
  onCirclePage,
}) {
  const verifiedPayload = circle ? circle.ExtraData.CircleIt !== undefined ? JSON.parse(circle.ExtraData.CircleIt) : null : null;
  const [listOfVerifiedUsers, setListOfVerifiedUsers] = useState(verifiedPayload?.VerifiedUsers.length > 0 ? verifiedPayload.VerifiedUsers.map((user) => user.PublicKeyBase58Check) : []);

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
    : `/circle/${circle.Username}`;
  const profile = onCirclePage
    ? isCommunityPost
      ? circle
      : post.ProfileEntryResponse
    : circle;

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
            delay={500}
            render={(attrs) => (
              <SubProfileCard isCircle={true} profile={profile} {...attrs} />
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
                    : circle.PublicKeyBase58Check
                }?fallback=https://diamondapp.com/assets/img/default_profile_pic.png`}
                className='w-8 h-8 rounded-full mt-1'
                alt={
                  onCirclePage
                    ? isCommunityPost
                      ? circle.Username
                      : post.ProfileEntryResponse.Username
                    : circle.Username
                }
              />
              <span>
                {onCirclePage &&
                  !isCommunityPost &&
                  post.ProfileEntryResponse.Username}

                {(!onCirclePage || isCommunityPost) &&
                  (isCircle ? `c/${circle.Username}` : `${circle.Username}`)}
              </span>
              {onCirclePage &&
                !isCommunityPost &&
                listOfVerifiedUsers &&
                listOfVerifiedUsers.indexOf(
                  post.ProfileEntryResponse.PublicKeyBase58Check
                ) > -1 && <img src={greenCheck} className='w-4 h-4' />}
            </Link>
          </Tippy>
        </div>
        {!isCommunityPost && !onCirclePage && (
          <div className='flex items-center text-sm'>
            <span className='md:inline-flex hidden mr-1 extralightText'>Posted by</span>
            <Tippy
              followCursor={true}
              placement='bottom'
              interactive={true}
              maxWidth={300}
              interactiveDebounce={100}
              delay={500}
              render={(attrs) => (
                <SubProfileCard
                  isCircle={false}
                  profile={post.ProfileEntryResponse}
                  {...attrs}
                />
              )}>
              <Link
                to={`/${profileIsCircle ? `circle` : `u`}/${
                  post.ProfileEntryResponse.Username
                }`}
                className='text-sm cursor-pointer hover:underline relative flex items-center justify-center space-x-1 extralightText'>
                {/* <img src={`https://node.deso.org/api/v0/get-single-profile-picture/${publicKey}?fallback=https://diamondapp.com/assets/img/default_profile_pic.png`} className='w-5 h-5 rounded-full mt-1' alt='' /> */}
                {/* <span>{post.ProfileEntryResponse.ExtraData?.DisplayName ? post.ProfileEntryResponse.ExtraData?.DisplayName : post.ProfileEntryResponse.Username}</span> */}
                <span>{post.ProfileEntryResponse.Username}</span>
              </Link>
            </Tippy>
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
      </div>
    </>
  );
}

export default PostTopMeta;
