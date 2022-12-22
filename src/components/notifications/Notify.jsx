import { Link } from "react-router-dom";

export const Notify = ({ notification }) => {
    const profileExtra = typeof notification.post.ProfileEntryResponse.ExtraData !== "undefined" ? notification.post.ProfileEntryResponse.ExtraData : null;

    const circleData = profileExtra ? typeof profileExtra.CircleIt !== "undefined" ? JSON.parse(profileExtra.CircleIt) : null : null;
    const isCircle = circleData ? circleData.isCircle : false;

    const PostLink = ({ isCircle, notification }) => {
        return (
            <Link
                to={`${isCircle ? `/circle` : `/u`}/${notification.post.ProfileEntryResponse.Username}/${notification.post.PostHashHex}`}
                className='colorText font-semibold'
            >
                {notification.parentPost !== null && notification.parentPost !== '' ? `comment` : `post`}
            </Link>
        )
    }
    return (
        <>
            {
                notification.type === 'REPLIED_TO_POST' ?
                    <span className='text-sm extralight flex space-x-1'>
                        <span>replied on your</span>
                        <PostLink isCircle={isCircle} notification={notification}/>
                    </span>
                    : notification.type === 'DIAMOND_SENT' ?
                        <span className='text-sm extralight flex space-x-1'>
                            <span>diamonded your</span>
                            <PostLink isCircle={isCircle} notification={notification}/>
                        </span>
                        : notification.type === 'LIKED' ?
                            <span className='text-sm extralight flex space-x-1'>
                                <span>liked your</span>
                                <PostLink isCircle={isCircle} notification={notification}/>
                            </span>
                            : notification.type === 'MENTIONED' ?
                                <span className='text-sm extralight flex space-x-1'>
                                    <span>mentioned you in</span>
                                    <PostLink isCircle={isCircle} notification={notification}/>
                                </span>
                                : null
            }
        </>
    )
}

export default Notify