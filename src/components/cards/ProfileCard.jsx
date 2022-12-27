import Deso from "deso-protocol";
import Linkify from "linkify-react";
import React, { useState } from "react";
import { useEffect } from "react";
import useApp from "../../store/app";
import { DESO_CONFIG, NODE_URL } from "../../utils/Constants";
import { LinkifyOptions } from "../../utils/Functions";
import { FiSettings } from "react-icons/fi";
import Tippy from "@tippyjs/react";
import { useNavigate } from "react-router-dom";

const deso = new Deso(DESO_CONFIG);

function ProfileCard({ circle }) {
  const { isLoggedIn, user } = useApp();
  const navigate = useNavigate();
  const [follows, setFollows] = useState(0);
  const [followings, setFollowings] = useState(0);
  const [isFollowing, setisFollowing] = useState(false);
  const [readMore, setReadMore] = useState(false);

  const payload = circle.ExtraData?.CircleIt
    ? JSON.parse(circle.ExtraData.CircleIt)
    : null;
  const isCircle =
    payload !== null && payload.isCircle === "true" ? true : false;
  const cover =
    circle.ExtraData && circle.ExtraData.FeaturedImageURL !== ""
      ? circle.ExtraData.FeaturedImageURL
      : "https://wallpaperaccess.com/full/1760835.jpg";

  useEffect(() => {
    async function fetchFollowers() {
      try {
        const followRequest = {
          PublicKeyBase58Check: `${circle.PublicKeyBase58Check}`,
          GetEntriesFollowingUsername: true,
        };
        const response = await deso.social.getFollowsStateless(followRequest);
        if (response !== null) {
          setFollows(response.NumFollowers);
        }
      } catch (error) {
        console.log(error);
      }
    }

    async function fetchFollowings() {
      try {
        const followRequest = {
          PublicKeyBase58Check: `${circle.PublicKeyBase58Check}`,
          GetEntriesFollowingUsername: false,
        };
        const response = await deso.social.getFollowsStateless(followRequest);
        if (response !== null) {
          setFollowings(response.NumFollowers);
        }
      } catch (error) {
        console.log(error);
      }
    }

    async function checkFollowing() {
      try {
        const followRequest = {
          IsFollowingPublicKeyBase58Check: `${user.profile.PublicKeyBase58Check}`,
          PublicKeyBase58Check: `${circle.PublicKeyBase58Check}`,
        };
        const response = await deso.social.isFollowingPublicKey(followRequest);
        if (response !== null) {
          setisFollowing(response);
        }
      } catch (error) {
        console.log(error);
      }
    }

    fetchFollowings();
    fetchFollowers();

    if (isLoggedIn) {
      checkFollowing();
    }
  }, [isLoggedIn, circle, user.profile]);

  const handleFollow = async () => {
    //have to write this after making mempool thing work
  };

  useEffect(() => {
    circle.Description.length > 200 ? setReadMore(true) : setReadMore(false);
  }, [circle.Description]);

  const settingsURL = isCircle ? `/circle` : `/u`;
  return (
    <>
      <div className='rounded-md secondaryBg secondaryBorder secondaryTextColor overflow-hidden border relative z-0'>
        <div className='flex flex-col'>
          <div
            className='h-32 md:h-48'
            style={{
              position: "relative",
              backgroundImage: `url(${
                cover !== ""
                  ? cover
                  : "https://wallpaperaccess.com/full/1760835.jpg"
              })`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}></div>
          {isLoggedIn &&
            circle.PublicKeyBase58Check ===
              user.profile.PublicKeyBase58Check && (
              <div className='relative w-full flex z-20 items-end justify-end pt-4 pr-4'>
                <Tippy content='Account Settings'>
                  <button
                    onClick={() =>
                      navigate(
                        `${settingsURL}/${user.profile.Username}/settings`
                      )
                    }
                    className='p-2 rounded-full bg-primaryBg hover:bg-primaryBgHover'>
                    <FiSettings className='extralightText text-xl cursor-pointer' />
                  </button>
                </Tippy>
              </div>
            )}
          <div className='flex flex-col items-center justify-center -mt-20 relative z-10'>
            <img
              src={`${NODE_URL}/get-single-profile-picture/${circle.PublicKeyBase58Check}?fallback=https://diamondapp.com/assets/img/default_profile_pic.png`}
              className='rounded-full subHeader border-4 border-white dark:border-[#212126] w-24 h-24 md:w-32 md:h-32'
              alt={circle.Username}
            />
            <div className='flex items-center flex-col mt-1'>
              <h2 className='font-semibold text-2xl'>
                {circle.ExtraData?.DisplayName
                  ? circle.ExtraData?.DisplayName
                  : circle.Username}
              </h2>
              <p className='text-gray-500 dark:text-gray-400 text-sm'>{`${
                isCircle ? `circle` : `u`
              }/${circle.Username}`}</p>
            </div>
          </div>
        </div>
        <div className='p-6 pt-2'>
          <div className='w-full pt-2'>
            <Linkify options={LinkifyOptions}>
              {!readMore
                ? circle.Description
                : `${circle.Description.substring(0, 200)} `}
            </Linkify>
            {readMore && (
              <span
                className='brandGradientText cursor-pointer'
                onClick={() => setReadMore(false)}>
                ... <span className='ml-1 font-medium'>Read more</span>
              </span>
            )}
          </div>
        </div>
        <div className='divider'></div>
        <div className='px-6 py-3 flex justify-between'>
          <div className='flex flex-col items-center space-y-1'>
            <span className='font-bold text-xl'>{follows}</span>
            <span className='text-sm'>
              {isCircle ? `Members` : `Followers`}
            </span>
          </div>
          <div className='flex flex-col items-center space-y-1'>
            <span className='font-bold text-xl'>{followings}</span>
            <span className='text-sm'>
              {isCircle ? `Followings` : `Followings`}
            </span>
          </div>
        </div>
        <div className='divider'></div>
        <div className='px-6 py-4 items-center justify-center flex'>
          {isFollowing ? (
            <button className='py-2 px-10 border border-transparent rounded-full text-sm font-medium text-white buttonBG focus:outline-none'>
              {isCircle ? `Leave` : `Unfollow`}
            </button>
          ) : (
            <button className='py-2 px-10 border border-transparent rounded-full text-sm font-medium text-white buttonBG focus:outline-none'>
              {isCircle ? `Join` : `Follow`}
            </button>
          )}
        </div>
      </div>
    </>
  );
}

export default ProfileCard;
