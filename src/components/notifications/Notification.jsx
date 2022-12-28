import React from 'react'
import { parseNotification } from '../../utils/Notifications'
import { Link } from 'react-router-dom';
import { NODE_URL } from '../../utils/Constants';
import greenCheck from "../../assets/greenCheck.svg";
import { BsFillHeartFill, BsReplyFill } from 'react-icons/bs';
import { SlDiamond } from 'react-icons/sl';
import { FaRegUserCircle } from 'react-icons/fa';
import Notify from './Notify';
import { dateFormat, timeStampToTimeAgo } from '../../utils/Functions';

function Notification({ ProfilesByPublicKey, reader, PostsByHash, notification }) {
    let profiles = {};
    let posts = {};
    Object.assign(profiles, ProfilesByPublicKey);
    Object.assign(posts, PostsByHash);
    const notify = parseNotification(notification, reader, profiles, posts)
    if (!notify) return null;
    const profileExtraData = typeof notify.actor.ExtraData !== "undefined" ? notify.actor.ExtraData : null;
    const circleData = profileExtraData ? typeof profileExtraData.CircleIt !== "undefined" ? JSON.parse(profileExtraData.CircleIt) : null : null;
    const isCircle = circleData ? circleData.isCircle : false;

    const listOfVerifiedUsers = circleData?.VerifiedUsers.length > 0
      ? circleData.VerifiedUsers.map((user) => user.PublicKeyBase58Check)
        : []
    return (
        <>
            <div className='flex flex-col pt-2 px-4'>
                <div className='flex items-center space-x-1'>
                    { notify.type === 'REPLIED_TO_POST' ?
                            <span className='text-sm extralight flex space-x-1 items-center'>
                                <BsReplyFill className='text-blue-500' size={17} />
                            </span>
                            : notify.type === 'DIAMOND_SENT' ?
                                <span className='text-sm extralight flex space-x-1 items-center'>
                                    <SlDiamond className='text-blue-700' size={17} />
                                </span>
                                : notify.type === 'LIKED' ?
                                    <span className='text-sm extralight flex space-x-1 items-center'>
                                        <BsFillHeartFill className='text-red-500' size={17} />
                                    </span>
                                    : notify.type === 'MENTIONED' ?
                                        <span className='text-sm extralight flex space-x-1 items-center'>
                                            <FaRegUserCircle className='text-blue-500' size={17} />
                                        </span>
                                        : null
                    }
                    <Link
                        to={`/${isCircle ? `circle` : `u`}/${notify.actor.Username}`}
                        className='cursor-pointer relative truncate max-w-1/2  flex items-center space-x-2 '>
                        <img
                            src={`${NODE_URL}/get-single-profile-picture/${
                            notify.actor.PublicKeyBase58Check
                            }?fallback=https://diamondapp.com/assets/img/default_profile_pic.png`}
                            className='w-7 h-7 rounded-full'
                            alt={profileExtraData?.DisplayName ? profileExtraData.DisplayName : notify.actor.Username}
                        />
                        <span className='text-sm font-semibold'>{profileExtraData?.DisplayName ? profileExtraData.DisplayName : notify.actor.Username}</span>
                        {listOfVerifiedUsers &&
                            listOfVerifiedUsers.indexOf(
                            notify.actor.PublicKeyBase58Check
                            ) > -1 && <img src={greenCheck} alt={profileExtraData?.DisplayName ? profileExtraData.DisplayName : notify.actor.Username} className='w-4 h-4' />}
                    </Link>
                    <Notify notification={notify} />
                </div>
                
            </div>
        </>
    )
}

export default Notification