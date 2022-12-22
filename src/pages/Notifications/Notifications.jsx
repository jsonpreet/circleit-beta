import React, { useEffect, useState } from 'react'
import { DefaultLayout } from '../../components/layouts'
import useApp from '../../store/app';
import { useParams } from 'react-router-dom';
import Deso from 'deso-protocol';
import Notification from './Notification';
import { Loader } from '../../utils/Loader';

const deso = new Deso();
        
function Notifications() {
    const { isLoggedIn, user } = useApp();
    const [notificationsList, setNotificationsList] = useState(null)
    const { username } = useParams();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getNotifications()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const userPublicKey = isLoggedIn
        ? user.profile.PublicKeyBase58Check
        : "BC1YLhBLE1834FBJbQ9JU23JbPanNYMkUsdpJZrFVqNGsCe7YadYiUg";
    

    const getNotifications = async () => {
        try {
            const count = await deso.notification.getUnreadNotificationsCount({"PublicKeyBase58Check": userPublicKey});
            const request = {
                "PublicKeyBase58Check": userPublicKey,
                "FetchStartIndex": count ? count.LastUnreadNotificationIndex : 0,
                "NumToFetch": 50
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
            <DefaultLayout>
                <div className="flex flex-col w-full mt-6">
                    <h1 className="text-2xl font-bold">Notifications</h1>
                </div>
                <div className='flex flex-col space-y-3 w-full mt-6'>
                    {loading ?
                        <div className='flex flex-col items-center justify-center h-full p-4 border theme-border secondaryBg rounded-lg'>
                            <Loader />
                        </div>
                        :
                        notificationsList && notificationsList.Notifications.map((notification, index) => (
                        <Notification key={index} ProfilesByPublicKey={notificationsList.ProfilesByPublicKey} reader={userPublicKey} PostsByHash={notificationsList.PostsByHash} notification={notification} />
                    ))}
                </div>
            </DefaultLayout>
        </>
    )
}

export default Notifications