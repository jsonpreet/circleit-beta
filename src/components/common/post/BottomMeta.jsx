import React from "react";
import { BsChatLeft } from "react-icons/bs";
import { IoDiamondOutline } from "react-icons/io5";
import { FiRefreshCcw } from "react-icons/fi";
import { FaRegShareSquare } from "react-icons/fa";
import { HeartFillIcon, HeartIcon } from "../../../utils/Icons";
import LikeButton from "./Like";
import { isMobile } from "react-device-detect";
import DiamondModal from "../../modals/Diamond";
import { toast } from "react-hot-toast";
import { useState } from "react";
import useApp from "../../../store/app";
import { formatNumber } from "../../../utils/Functions";
import { useNavigate } from "react-router-dom";
import ShareModal from "../../modals/Share";

function PostBottomMeta({ circle, isCircle, isRepost, post, desoObj }) {
  const { isLoggedIn } = useApp();
  const [diamondBestowed, setDiamondBestowed] = useState(
    post.PostEntryReaderState.DiamondLevelBestowed
  );
  const [diamonds, setDiamonds] = useState(post.DiamondCount);
  const [showDiamond, setShowDiamond] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const navigate = useNavigate();

  const showDiamondModal = () => {
    if (!isLoggedIn) {
      return toast.error("You must be logged in!");
    }
    setShowDiamond(!showDiamond);
  };
  return (
    <>
      <DiamondModal
        setDiamonds={setDiamonds}
        diamonds={diamonds}
        diamondBestowed={diamondBestowed}
        setDiamondBestowed={setDiamondBestowed}
        show={showDiamond}
        setShowDiamondModal={setShowDiamond}
        post={post}
        desoObj={desoObj}
      />
      <ShareModal
        show={showShareModal}
        setShowShare={setShowShareModal}
        post={post}
      />
      <div className='flex w-full items-center mt-2 primaryTextColor'>
        <div className='flex -ml-3'>
          {isRepost && (
            <div className='px-3 hidden md:flex text-sm items-center justify-center font-semibold extralightText'>
              {post.PostEntryReaderState.LikedByReader ? (
                <HeartFillIcon classes={`text-red-500 h-4 w-4 mt-[1px] mr-1`} />
              ) : (
                <HeartIcon classes={`h-4 mt-[1px] w-4 mr-1`} />
              )}
              <span>{formatNumber(post.LikeCount)}</span>
            </div>
          )}
          <button
            onClick={() =>
              navigate(
                `/${isCircle ? `circle` : `u`}/${circle.Username}/${
                  post.PostHashHex
                }#comments`
              )
            }
            className='px-3 flex text-sm items-center cursor-pointer justify-center font-semibold extralightText'>
            <BsChatLeft size={17} className='mt-1 mr-1' />
            <span>{formatNumber(post.CommentCount)}</span>
          </button>
          <div className='px-3 flex text-sm items-center justify-center font-semibold extralightText'>
            <FiRefreshCcw size={17} className='mt-1 mr-1' />
            <span>
              {formatNumber(post.RepostCount + post.QuoteRepostCount)}
            </span>
          </div>
          {isMobile ? (
            <div className='px-3'>
              <LikeButton post={post} />
            </div>
          ) : null}

          <button
            onClick={showDiamondModal}
            className={`px-3 flex text-sm items-center cursor-pointer justify-center font-semibold ${
              diamondBestowed > 0 ? `text-blue-400` : `extralightText`
            }`}>
            <IoDiamondOutline size={17} className='mt-1 mr-1' />
            <span>{formatNumber(diamonds)}</span>
          </button>
          <button
            onClick={() => setShowShareModal(!showShareModal)}
            className='px-3 cursor-pointer flex text-sm items-center justify-center font-semibold extralightText'>
            <FaRegShareSquare size={17} className='mt-1 mr-1' />
            <span className='mt-[1px]'></span>
          </button>
        </div>
      </div>
    </>
  );
}

export default PostBottomMeta;
