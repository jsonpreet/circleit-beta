import React from "react";
import { BsChatLeft } from "react-icons/bs";
import { IoDiamondOutline } from "react-icons/io5";
import { FiRefreshCcw } from "react-icons/fi";
import { FaRegShareSquare } from "react-icons/fa";
import { HeartFillIcon, HeartIcon } from "../../../utils/Icons";
import LikeButton from "./Like";
import { isMobile } from "react-device-detect";

function PostBottomMeta({ isRepost, post }) {
  return (
    <>
      <div className='flex w-full items-center mt-2 primaryTextColor'>
        <div className='flex space-x-6'>
          {isRepost && (
            <div className='hidden md:flex text-sm items-center justify-center font-semibold extralightText'>
              {post.PostEntryReaderState.LikedByReader ? (
                <HeartFillIcon classes={`text-red-500 h-4 w-4 mt-[1px] mr-1`} />
              ) : (
                <HeartIcon classes={`h-4 mt-[1px] w-4 mr-1`} />
              )}
              <span>{post.LikeCount}</span>
            </div>
          )}
          {isMobile ? <LikeButton post={post} /> : null }
          <div className='flex text-sm items-center justify-center font-semibold extralightText'>
            <BsChatLeft size={17} className='mt-1 mr-1' />
            <span>{post.CommentCount}</span>
          </div>
          <div className='flex text-sm items-center justify-center font-semibold extralightText'>
            <FiRefreshCcw size={17} className='mt-1 mr-1' />
            <span>{post.RepostCount + post.QuoteRepostCount}</span>
          </div>
          <div className='flex text-sm items-center justify-center font-semibold extralightText'>
            <IoDiamondOutline size={17} className='mt-1 mr-1' />
            <span>{post.DiamondCount}</span>
          </div>
          <div className='cursor-pointer flex text-sm items-center justify-center font-semibold extralightText'>
            <FaRegShareSquare size={17} className='mt-1 mr-1' />
            <span className='mt-[1px]'></span>
          </div>
        </div>
      </div>
    </>
  );
}

export default PostBottomMeta;
