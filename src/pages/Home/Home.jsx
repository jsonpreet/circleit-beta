import { DefaultLayout } from '../../components/layouts';
import Deso from "deso-protocol";
import React, { useEffect, useState } from "react";
import { useInView } from "react-cool-inview";
import useApp from '../../store/app';
import { Loader } from '../../utils/Loader';
import { SidebarRight } from '../../components/sidebar';
import NoPostCard from "../../components/cards/NoPostCard";
import PostCard from "../../components/cards/PostCard";
import FeedShimmer from "../../components/shimmers/Feed";
import { DESO_CONFIG } from '../../utils/Constants';
import toast from 'react-hot-toast';

function Home() {
    const { isLoggedIn, user } = useApp();
    const [isLoading, setIsLoading] = useState(true);
    const [feedLoading, setFeedLoading] = useState(false);
    const [feedData, setFeedData] = useState([]);
    const [circleProfile, setCircleProfile] = useState([]);
    const [seenPosts, setSeenPosts] = useState([]);
    const [hasMore, setHasMore] = useState(false);
    const [noPosts, setNoPosts] = useState(false);

    const circle = "circleit";
    const userPublicKey = isLoggedIn
        ? user.profile.PublicKeyBase58Check
        : "BC1YLhBLE1834FBJbQ9JU23JbPanNYMkUsdpJZrFVqNGsCe7YadYiUg";
    
    useEffect(() => {
        async function fetchData() {
            const deso = new Deso(DESO_CONFIG);
            try {
                const profileRequest = {
                    Username: `${circle}`,
                };
                const profileResponse = await deso.user.getSingleProfile(profileRequest);
                console.log(profileResponse)
                if (profileResponse?.Profile !== null) {
                    setCircleProfile(profileResponse.Profile);
                    const request = {
                        ReaderPublicKeyBase58Check: userPublicKey,
                        SeenPosts: [],
                        Tag: `@${circle.toLowerCase()}`,
                        SortByNew: false,
                        ResponseLimit: 20,
                    };
                    try {
                        setHasMore(true);
                        const response = await deso.posts.getHotFeed(request);
                        if (response.HotFeedPage === null) {
                            setHasMore(false);
                        }
                        let feedDataList = response.HotFeedPage;
                        //remove posts where RecloutedPostEntryResponse is not null
                        feedDataList = feedDataList.filter(
                            (post) => post.RecloutedPostEntryResponse === null
                        );
                        setFeedData(feedDataList);
                        //store postHashHex of each post in hotFeed
                        const seenPostLists = response.HotFeedPage.map(
                            (post) => post.PostHashHex
                        );
                        setSeenPosts(seenPostLists);
                    } catch (error) {
                        console.log(error);
                        //toast.error("Something went wrong");
                        setIsLoading(false);
                    } finally {
                        setIsLoading(false);
                    }
                }
            }catch (error) {
                toast.error("Something went wrong");
            } finally {}
        }
        fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (feedData && feedData.length > 0) {
            setNoPosts(false);
        } else {
            setNoPosts(true);
        }
    }, [feedData]);

    const { observe } = useInView({
        rootMargin: "1000px 0px",
        onEnter: async () => {
            const deso = new Deso(DESO_CONFIG);
            setFeedLoading(true);
            setHasMore(true);
            const request = {
                ReaderPublicKeyBase58Check: userPublicKey,
                SeenPosts: seenPosts,
                Tag: `@${circle.toLowerCase()}`,
                SortByNew: false,
                ResponseLimit: 20,
            };
            try {
                const response = await deso.posts.getHotFeed(request);
                if (response.HotFeedPage.length === 0) {
                    setHasMore(false);
                }
                let feedDataList = response.HotFeedPage;
                //remove posts where RecloutedPostEntryResponse is not null
                feedDataList = feedDataList.filter(
                    (post) => post.RecloutedPostEntryResponse === null
                );
                setFeedData([...feedData, ...feedDataList]);

                //store postHashHex of each post in hotFeed
                const seenPostLists = response.HotFeedPage.map(
                    (post) => post.PostHashHex
                );
                setSeenPosts([...seenPosts, ...seenPostLists]);
                
            } catch (error) {
                toast.error("Something went wrong");
            } finally {
                setHasMore(false);
                setFeedLoading(false);
            }
        },
    });

    return (
        <>
            <DefaultLayout>
                {!isLoggedIn && 
                <div className='relative inline-flex justify-center rounded-full items-center w-full my-20'>
                    <div className='relative text-4xl md:py-10 font-bold text-center dark:text-white sm:text-4xl lg:text-5xl leading-none rounded-full z-10'>
                        <span className="brandGradientBg blur-2xl filter opacity-10 w-full h-full absolute inset-0 rounded-full"></span>
                        <span className='md:px-5'>Your <span className='text-transparent bg-clip-text brandGradientBg'>Community</span> on your terms.</span>
                    </div>
                </div>
                }
                <div className='grid grid-cols-1 gap-4 items-start lg:grid-cols-3 lg:gap-8 mt-4'>
                    <div className='grid grid-cols-1 gap-4 lg:col-span-2'>
                        <div className='flex w-full items-center'>
                            <div className='hidden md:flex md:float-left mr-4 text-white brandGradientBg dark:border-[#18181C] border-transparent border rounded-md p-3'>
                                <svg
                                    xmlns='http://www.w3.org/2000/svg'
                                    viewBox='0 0 20 20'
                                    fill='currentColor'
                                    aria-hidden='true'
                                    className='h-5 w-5'>
                                    <path
                                    fillRule='evenodd'
                                    d='M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z'
                                    clipRule='evenodd'></path>
                                </svg>
                            </div>
                            <h1 className='text-2xl lg:text-3xl font-bold dark:text-white'>
                                Trending Posts on CircleIt
                            </h1>
                        </div>
                        {isLoading &&
                            <FeedShimmer cols={20}/>                        
                        }
                        {!isLoading && feedData && feedData.length > 0 ?
                            feedData.map((post) => (
                            <PostCard
                                post={post}
                                key={post.PostHashHex}
                                isRepost={false}
                                circle={circleProfile}
                                onCirclePage={false}
                            />
                        )) : <>
                                <NoPostCard />
                            </>
                        }
                        {!isLoading && !feedLoading && noPosts && (
                            <>
                                <NoPostCard />
                            </>
                        )}
                        {!isLoading && !feedLoading &&
                            (hasMore ? (
                            <span ref={observe} className='flex justify-center my-10'>
                                <Loader />
                            </span>
                            ) : (
                            <div className='flex justify-center md:p-10'>
                                <p className='text-gray-500 dark:text-gray-400'>
                                No more posts
                                </p>
                            </div>
                            ))}
                    </div>
                    <div className='mt-[20px] md:mt-[75px]'>
                        <SidebarRight />
                    </div>
                </div>
            </DefaultLayout>
        </>
    )
}

export default Home