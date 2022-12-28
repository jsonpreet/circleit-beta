import React from 'react'
import { parseNotification } from '../../utils/Notifications'
import { Link } from 'react-router-dom';
import { NODE_URL } from '../../utils/Constants';
import greenCheck from "../../assets/greenCheck.svg";
import { SlDiamond } from "react-icons/sl";
import { BsFillHeartFill, BsReplyFill } from "react-icons/bs";
import { FaRegUserCircle } from "react-icons/fa";
import Notify from '../../components/notifications/Notify';
import { dateFormat } from '../../utils/Functions';

function Notification({ ProfilesByPublicKey, reader, PostsByHash, notification }) {
    let profiles = {};
    let posts = {};
    Object.assign(profiles, ProfilesByPublicKey);
    Object.assign(posts, PostsByHash);
    const notify = parseNotification(notification, reader, profiles, posts)
    if(!notify) return null;
    const profileExtraData = typeof notify.actor.ExtraData !== "undefined" ? notify.actor.ExtraData : null;
    const circleData = profileExtraData ? typeof profileExtraData.CircleIt !== "undefined" ? JSON.parse(profileExtraData.CircleIt) : null : null;
    const isCircle = circleData ? circleData.isCircle : false;

    const listOfVerifiedUsers = circleData?.VerifiedUsers.length > 0
      ? circleData.VerifiedUsers.map((user) => user.PublicKeyBase58Check)
      : []
    return (
        <>
            <div className='flex flex-col p-4 border theme-border secondaryBg rounded-lg'>
                <div className='flex items-start space-x-2'>
                    <div className='mt-2'>
                        { notify.type === 'REPLIED_TO_POST' ?
                            <span className='text-sm extralight flex space-x-1 items-center'>
                                <BsReplyFill className='text-blue-500' size={22} />
                            </span>
                            : notify.type === 'DIAMOND_SENT' ?
                                <span className='text-sm extralight flex space-x-1 items-center'>
                                    <SlDiamond className='text-blue-700' size={20} />
                                </span>
                                : notify.type === 'LIKED' ?
                                    <span className='text-sm extralight flex space-x-1 items-center'>
                                        <BsFillHeartFill className='text-red-500' size={20} />
                                    </span>
                                    : notify.type === 'MENTIONED' ?
                                        <span className='text-sm extralight flex space-x-1 items-center'>
                                            <FaRegUserCircle className='text-blue-500' size={20} />
                                        </span>
                                        : null
                        }
                    </div>
                    <Link
                        to={`/${isCircle ? `circle` : `u`}/${notify.actor.Username}`}
                        className='cursor-pointer relative flex items-center space-x-2 '>
                        <img
                            src={`${NODE_URL}/get-single-profile-picture/${
                            notify.actor.PublicKeyBase58Check
                            }?fallback=https://diamondapp.com/assets/img/default_profile_pic.png`}
                            className='w-9 h-9 rounded-full'
                            alt={profileExtraData?.DisplayName ? profileExtraData.DisplayName : notify.actor.Username}
                        />
                    </Link>
                    <div className='flex w-full items-start flex-col'>
                        <div className='flex space-x-1'>
                            <Link
                                to={`/${isCircle ? `circle` : `u`}/${notify.actor.Username}`}
                                className='cursor-pointer relative flex items-center space-x-2 '>
                                <span className='text-sm font-semibold'>{profileExtraData?.DisplayName ? profileExtraData.DisplayName : notify.actor.Username}</span>
                                {listOfVerifiedUsers &&
                                    listOfVerifiedUsers.indexOf(
                                    notify.actor.PublicKeyBase58Check
                                    ) > -1 && <img src={greenCheck} alt={profileExtraData?.DisplayName ? profileExtraData.DisplayName : notify.actor.Username} className='w-4 h-4' />}
                            </Link>
                            <Notify notification={notify} />
                        </div>
                        <Post notification={notify}/>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Notification

export const Post = ({ notification }) => {
    const profileExtra = typeof notification?.post?.ProfileEntryResponse?.ExtraData !== "undefined" ? notification?.post?.ProfileEntryResponse?.ExtraData : null;

    const circleData = profileExtra ? typeof profileExtra.CircleIt !== "undefined" ? JSON.parse(profileExtra.CircleIt) : null : null;
    const isCircle = circleData ? circleData.isCircle : false;

    return (
        <>
            {notification.post  ?
                <>
                    {notification.type === 'DIAMOND_SENT' || notification.type === 'LIKED' ?
                        <div className='flex w-full flex-col mt-1'>
                            {notification.post.Body ? <p className='text-sm text-gray-500'>{notification.post.Body}</p> : null}
                        </div>
                        : null}
            
                    <span
                    className='text-sm mt-0.5 extralightText'
                    title={dateFormat(notification.post.TimestampNanos)}>
                    {dateFormat(notification.post.TimestampNanos)}
                    </span>
                </>
            : null
        }
            
           
        </>
    )
}