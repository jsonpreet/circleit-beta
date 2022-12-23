import { Menu, Transition } from '@headlessui/react'
import React, { Fragment, useState } from 'react'
import { CgBell } from 'react-icons/cg'
import Deso from 'deso-protocol';
import { useEffect } from 'react';
import useApp from '../../store/app';
import { Link, useParams } from 'react-router-dom';
import Notification from './Notification';
import { Loader } from '../../utils/Loader';

const deso = new Deso();
        
function NotificationMenu() {
    const { isLoggedIn, user } = useApp();
    const [notifications, setNotifications] = useState(null)
    const [notificationsList, setNotificationsList] = useState(null)
    const { username } = useParams();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get notifications count after few seconds
        setTimeout(() => {
            getNotificationsCount()
        }, 1500)
        getNotifications()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    const userPublicKey = isLoggedIn
        ? user.profile.PublicKeyBase58Check
        : "BC1YLhBLE1834FBJbQ9JU23JbPanNYMkUsdpJZrFVqNGsCe7YadYiUg";

    const getNotificationsCount = async () => {
        try {
            const request = {
                "PublicKeyBase58Check": userPublicKey
            };
            const response = await deso.notification.getUnreadNotificationsCount(request);
            setNotifications(response)
        } catch (error) {
            console.log(error)
        }
    }

    const getNotifications = async () => {
        try {
            const count = await deso.notification.getUnreadNotificationsCount({"PublicKeyBase58Check": userPublicKey});
            const request = {
                "PublicKeyBase58Check": userPublicKey,
                "FetchStartIndex": count ? count.LastUnreadNotificationIndex : 0,
                "NumToFetch": 10
            };
            const response = await deso.notification.getNotifications(request);
            //console.log(response);
            setLoading(false)
            setNotificationsList(response)
        } catch (error) {
            console.log(error)
        }
    }


    return (
        <>
            <Menu as='div' className='relative w-full'>
                <Menu.Button className='flex cursor-pointer'>
                    <CgBell size={24} />
                    {notifications?.NotificationsCount > 0 && (
                        <span className="absolute flex w-2 h-2 bg-red-500 rounded-full -top-1 -right-0.5" />
                    )}
                </Menu.Button>
                <Transition
                    as={Fragment}
                    enter="transition duration-200 ease-out"
                    enterFrom="transform scale-95 opacity-0"
                    enterTo="transform scale-100 opacity-100"
                    leave="transition duration-75 ease-out"
                    leaveFrom="transform scale-100 opacity-100"
                    leaveTo="transform scale-95 opacity-0"
                    className='absolute z-10 outline-none ring-0 focus:outline-none focus:ring-0 right-0 rounded-md primaryBg shadow-lg border theme-border w-96' 
                >
                    <Menu.Items className='outline-none w-full ring-0 focus:outline-none focus:ring-0' static>
                        <div className="py-2 my-1 overflow-hidden theme-divider divide-y outline-none ring-0 focus:outline-none focus:ring-0">
                            <div className="flex flex-col space-y-1 text-sm transition duration-150 ease-in-out rounded-lg">
                                <div className="inline-flex items-center justify-between p-2 pt-1 pb-3 space-x-2 rounded-lg">
                                    <span className="text-base truncate leading-4">Notifications</span>
                                    <Link
                                        to={`/notifications/${username ? username : username}`}
                                        className="flex items-center justify-center text-sm font-medium"
                                    >
                                        View All
                                    </Link>
                                </div>
                            </div>           
                            <div className='divide-y theme-divider flex flex-col space-y-2'>
                                {loading ?
                                    <div className='flex flex-col pt-2 items-center justify-center px-4'><Loader className='w-5 h-5' /></div>
                                    : notificationsList && notificationsList.Notifications.map((notification, index) => (
                                    <Notification key={index} ProfilesByPublicKey={notificationsList.ProfilesByPublicKey} reader={userPublicKey} PostsByHash={notificationsList.PostsByHash} notification={notification} />
                                ))}
                            </div>
                        </div>
                    </Menu.Items>
                </Transition>
            </Menu>
        </>
    )
}

export default NotificationMenu