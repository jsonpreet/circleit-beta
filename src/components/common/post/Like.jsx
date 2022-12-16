import React, { useRef, useState, useContext } from "react";
import toast from "react-hot-toast";
import useApp from "../../../store/app";
import { HeartFillIcon, HeartIcon } from "../../../utils/Icons";
import { useEffect } from "react";
import { isBrowser } from "react-device-detect";
import MemPoolContext from "../../../MemoryPool/MemPoolContext";

function LikeButton({ isRepost, post }) {
  const memPoolContextValue = useContext(MemPoolContext);

  const [liked, setLiked] = useState(post.PostEntryReaderState.LikedByReader);
  const [likes, setLikes] = useState(0);
  const { isLoggedIn, user } = useApp();
  const rootRef = useRef(null);

  useEffect(() => {
    setLikes(post.LikeCount);
  }, [post.LikeCount]);

  const like = async (isLiked) => {
    if (!isLoggedIn) {
      toast.error("You must be logged in!");
      return;
    }
    const isUnlike = isLiked ? true : false;
    try {
      memPoolContextValue.updateMemPoolState({
        request: {
          ReaderPublicKeyBase58Check: user.profile.PublicKeyBase58Check,
          LikedPostHashHex: post.PostHashHex,
          MinFeeRateNanosPerKB: 1000,
          IsUnlike: isUnlike,
        },
        type: "LIKE",
      });
      setLiked(!isLiked);
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong!");
    }
  };
  return (
    <>
      {isBrowser ? (
        !isRepost && (
          <div
            ref={rootRef}
            className='flex-1 pt-2 pb-2 pr-3 lg:pr-5 lg:pt-7 lg:pb-7 h-24 lg:h-36'>
            <button
              onClick={() => like(liked)}
              className={`  text-sm rounded-lg group border darkenHoverBg darkenBg darkenBorder font-semibold dark:text-white transition delay-50 w-16 h-full flex flex-col items-center justify-center`}>
              {isLoggedIn ? (
                liked ? (
                  <HeartFillIcon
                    classes={`h-5 w-5 group-hover:text-red-500 text-red-500`}
                  />
                ) : (
                  <HeartIcon
                    classes={`h-5 w-5 group-hover:text-red-500 text-red-500`}
                  />
                )
              ) : (
                <HeartIcon classes={`h-5 w-5 group-hover:text-red-500`} />
              )}
              <span className='mt-1 group-hover:text-red-500'>{likes}</span>
            </button>
          </div>
        )
      ) : (
        <div className='flex text-sm items-center justify-center font-semibold extralightText'>
          <button
            onClick={() => like(liked)}
            className={`  flex text-sm items-center justify-center font-semibold extralightText`}>
            {isLoggedIn ? (
              liked ? (
                <HeartFillIcon
                  classes={`h-5 w-5 mr-1 group-hover:text-red-500 text-red-500`}
                />
              ) : (
                <HeartIcon
                  classes={`h-5 w-5 mr-1 group-hover:text-red-500 text-red-500`}
                />
              )
            ) : (
              <HeartIcon classes={`h-5 w-5 mr-1 group-hover:text-red-500`} />
            )}
            <span>{likes}</span>
          </button>
        </div>
      )}
    </>
  );
}

export default LikeButton;
