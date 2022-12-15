import React, { useRef, useState } from 'react'
import toast from 'react-hot-toast';
import useApp from '../../../store/app';
import { toastOptions } from '../../../utils/Functions';
import Deso from "deso-protocol";
import { HeartFillIcon, HeartIcon } from '../../../utils/Icons';
import { useEffect } from 'react';
import { DESO_CONFIG } from '../../../utils/Constants';
import party from "party-js";
import { isBrowser } from 'react-device-detect';

const deso = new Deso(DESO_CONFIG);

function LikeButton({ isRepost, post }) {
    const [loading, setLoading] = useState(false);
    const [liked, setLiked] = useState(post.PostEntryReaderState.LikedByReader);
    const [likes, setLikes] = useState(0);
    const { isLoggedIn, user } = useApp();
    const rootRef = useRef(null);

    useEffect(() => {
        setLikes(post.LikeCount)
    }, [post.LikeCount])

    const like = async (isLiked) => {
        setLoading(true);
        if (!isLoggedIn) {
            setTimeout(() => setLoading(false), 1000);
            toast.error("You must be logged in!");
        return;
        }
        const isUnlike = isLiked ? true : false;
        try {
        const request = {
            ReaderPublicKeyBase58Check: user.profile.PublicKeyBase58Check,
            LikedPostHashHex: post.PostHashHex,
            MinFeeRateNanosPerKB: 1000,
            IsUnlike: isUnlike,
        };
        const response = await deso.social.createLikeStateless(request);
        if (response && response.TxnHashHex !== null) {
            setLikes(!isUnlike ? likes + 1 : likes - 1);
            setLiked(!isUnlike);
            //toast.success('Post liked');
            party.confetti(rootRef.current, {
              count: party.variation.range(50, 200),
              size: party.variation.range(0.2, 1.0),
            })
            setLoading(false);
        }
        } catch (error) {
            toast.error("Something went wrong!");
            setLoading(false);
        }
    };
    return (
        <>
            {isBrowser ?
            !isRepost &&
                <div ref={rootRef} className='flex-1 pt-2 pb-2 pr-3 lg:pr-5 lg:pt-7 lg:pb-7 h-24 lg:h-36'>
                    <button
                        onClick={() => like(liked)}
                        className={` ${loading && `rainbow`
                        } text-sm rounded-lg group border darkenHoverBg darkenBg darkenBorder font-semibold dark:text-white transition delay-50 w-16 h-full flex flex-col items-center justify-center`}>
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
             :
                <div className='flex text-sm items-center justify-center font-semibold extralightText'>
                    <button
                        onClick={() => like(liked)}
                        className={` ${loading && `animate-pulse`} px-3 flex text-sm items-center justify-center font-semibold extralightText`}
                    >
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
            }
        </>
    )
}

export default LikeButton