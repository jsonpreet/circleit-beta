import { DefaultLayout } from "../../components/layouts";
import Deso from "deso-protocol";
import React, { useEffect, useState, useContext } from "react";
import { useInView } from "react-cool-inview";
import useApp from "../../store/app";
import { Loader } from "../../utils/Loader";
import { SidebarRight } from "../../components/sidebar";
import NoPostCard from "../../components/cards/NoPostCard";
import PostCard from "../../components/cards/PostCard";
import FeedShimmer from "../../components/shimmers/Feed";
import { DESO_CONFIG } from "../../utils/Constants";
import toast from "react-hot-toast";
import FeedChanger from "./FeedChanger";
import GlobalContext from "../../utils/GlobalContext/GlobalContext";

function Following() {
  const GlobalContextValue = useContext(GlobalContext);
  const { isLoggedIn, user } = useApp();
  const [isLoading, setIsLoading] = useState(true);
  const [feedLoading, setFeedLoading] = useState(false);

  const [circleProfile, setCircleProfile] = useState([]);
  const [lastPostHashHex, setLastPostHashHex] = useState("");
  const [hasMore, setHasMore] = useState(false);
  const [noPosts, setNoPosts] = useState(false);
  const deso = new Deso(DESO_CONFIG);

  const circle = "circleit";
  const userPublicKey = isLoggedIn
    ? user.profile.PublicKeyBase58Check
    : "BC1YLhBLE1834FBJbQ9JU23JbPanNYMkUsdpJZrFVqNGsCe7YadYiUg";

  const [feedUser, setFeedUser] = useState(
    Object.keys(GlobalContextValue.followingFeedInfo).length === 0
      ? {
          PublicKeyBase58Check: userPublicKey,
        }
      : GlobalContextValue.followingFeedInfo
  );

  useEffect(() => {
    async function fetchData() {
      try {
        if (Object.keys(GlobalContextValue.circleItProfile).length === 0) {
          const profileRequest = {
            Username: `${circle}`,
          };
          const profileResponse = await deso.user.getSingleProfile(
            profileRequest
          );
          GlobalContextValue.updateCircleItProfile(profileResponse.Profile);
        }

        const request = {
          PostHashHex: "",
          ReaderPublicKeyBase58Check: userPublicKey,
          OrderBy: "newest",
          StartTstampSecs: null,
          PostContent: "",
          NumToFetch: 50,
          FetchSubcomments: false,
          GetPostsForFollowFeed: true,
          GetPostsForGlobalWhitelist: false,
          GetPostsByDESO: false,
          MediaRequired: false,
          PostsByDESOMinutesLookback: 0,
          AddGlobalFeedBool: false,
        };
        try {
          if (GlobalContextValue.followingFeed.length === 0) {
            console.log("looking for post");
            setHasMore(true);
            const response = await deso.posts.getPostsStateless(request);
            if (response.PostsFound === null) {
              setHasMore(false);
            }
            let feedDataList = response.PostsFound;
            //remove posts where RecloutedPostEntryResponse is not null
            setLastPostHashHex(
              feedDataList[feedDataList.length - 1].PostHashHex
            );
            GlobalContextValue.updateFollowingFeed(feedDataList);
          } else {
            console.log("already have post");
            setIsLoading(false);
            setLastPostHashHex(
              GlobalContextValue.followingFeed[
                GlobalContextValue.followingFeed.length - 1
              ].PostHashHex
            );
          }
        } catch (error) {
          console.log(error);
          //toast.error("Something went wrong");
          setIsLoading(false);
        } finally {
          setIsLoading(false);
        }
      } catch (error) {
        toast.error("Something went wrong");
      } finally {
      }
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (
      GlobalContextValue.followingFeed &&
      GlobalContextValue.followingFeed.length > 0
    ) {
      setNoPosts(false);
    } else {
      setNoPosts(true);
    }
  }, [GlobalContextValue.followingFeed]);

  const { observe } = useInView({
    rootMargin: "1000px 0px",
    onEnter: async () => {
      console.log("finding more posts");

      setFeedLoading(true);
      setHasMore(true);
      const request = {
        PostHashHex: lastPostHashHex,
        ReaderPublicKeyBase58Check: userPublicKey,
        OrderBy: "newest",
        StartTstampSecs: null,
        PostContent: "",
        NumToFetch: 50,
        FetchSubcomments: false,
        GetPostsForFollowFeed: true,
        GetPostsForGlobalWhitelist: false,
        GetPostsByDESO: false,
        MediaRequired: false,
        PostsByDESOMinutesLookback: 0,
        AddGlobalFeedBool: false,
      };
      try {
        const response = await deso.posts.getPostsStateless(request);
        if (response.PostsFound === null || response.PostsFound.length === 0) {
          console.log("is it really happening?");
          setHasMore(false);
        }
        let feedDataList = response.PostsFound;

        GlobalContextValue.updateFollowingFeed([
          ...GlobalContextValue.followingFeed,
          ...feedDataList,
        ]);

        //store postHashHex of each post in hotFeed
        if (feedDataList.length > 0) {
          setLastPostHashHex(feedDataList[feedDataList.length - 1].PostHashHex);
        }
      } catch (error) {
        console.log(error);
        toast.error("Something went wrong");
      } finally {
        setFeedLoading(false);
      }
    },
  });

  const handleFeedChange = (feedUser) => {
    async function getFeed() {
      const request = {
        PostHashHex: "",
        ReaderPublicKeyBase58Check: feedUser.PublicKeyBase58Check,
        OrderBy: "newest",
        StartTstampSecs: null,
        PostContent: "",
        NumToFetch: 50,
        FetchSubcomments: false,
        GetPostsForFollowFeed: true,
        GetPostsForGlobalWhitelist: false,
        GetPostsByDESO: false,
        MediaRequired: false,
        PostsByDESOMinutesLookback: 0,
        AddGlobalFeedBool: false,
      };
      try {
        setHasMore(true);
        const response = await deso.posts.getPostsStateless(request);
        if (response.PostsFound === null) {
          setHasMore(false);
        }
        if (response.PostsFound.length === 0) {
          setHasMore(false);
          GlobalContextValue.updateFollowingFeed([]);
          setIsLoading(false);
          return;
        }
        let feedDataList = response.PostsFound;
        setLastPostHashHex(feedDataList[feedDataList.length - 1].PostHashHex);
        GlobalContextValue.updateFollowingFeed(feedDataList);
      } catch (error) {
        console.log(error);
        //toast.error("Something went wrong");
        setIsLoading(false);
      } finally {
        setIsLoading(false);
      }
    }
    setFeedUser(feedUser);
    GlobalContextValue.updateFollowingFeedInfo(feedUser);
    setIsLoading(true);

    getFeed();
  };

  return (
    <>
      <DefaultLayout>
        {!isLoggedIn && (
        <div className='relative inline-flex justify-center rounded-full items-center w-full mt-24 mb-4 px-2'>
        <div className='relative text-4xl md:py-10 font-bold text-center dark:text-white sm:text-4xl lg:text-5xl leading-normal rounded-full z-10'>
          <span className='brandGradientBg blur-2xl filter opacity-10 w-full h-full absolute inset-0 rounded-full'></span>
          <span className='md:px-5'>
            Get paid for{" "}
            <span className='text-transparent bg-clip-text brandGradientBg'>
              Creating
            </span>{" "}
            and{" "}
            <span className='text-transparent bg-clip-text brandGradientBg'>
              Contributing
            </span>{" "}
            to{" "}
            <span className='text-transparent bg-clip-text brandGradientBg'>
              Communities
            </span>
          </span>
        </div>
      </div>
        )}
        <div className='grid grid-cols-1 gap-4 items-start lg:grid-cols-3 lg:gap-8 sm:mt-4 mt-14'>
          <div className='grid grid-cols-1  lg:col-span-2'>
            <div className='flex items-center justify-between w-full'>
              <div className='flex  items-center'>
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
                <h1 className='text-2xl lg:text-3xl font-bold dark:text-white pl-2'>
                  Following Feed
                </h1>
                {/* Make a drop down menu*/}
              </div>

              <FeedChanger
                userPublicKey={userPublicKey}
                feedUser={feedUser}
                desoObj={deso}
                handleFeedChange={handleFeedChange}
              />
            </div>
            <div className='mt-4'>
            {isLoading && <FeedShimmer cols={20} />}
            {!isLoading &&
            GlobalContextValue.followingFeed &&
            GlobalContextValue.followingFeed.length > 0 ? (
              GlobalContextValue.followingFeed.map((post, index) => (
                <PostCard
                  post={post}
                  key={index}
                  isRepost={false}
                  circle={GlobalContextValue.circleItProfile}
                  onCirclePage={false}
                  readerPublicKey={userPublicKey}
                  isLoggedIn={isLoggedIn}
                />
              ))
            ) : (
              <>
                <NoPostCard />
              </>
            )}
            </div>
            {!isLoading && !feedLoading && noPosts && (
              <>
                <NoPostCard />
              </>
            )}
            {!isLoading &&
              !feedLoading &&
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
          <div className='mt-[20px] md:mt-[75px] hidden sm:flex'>
            <SidebarRight />
          </div>
        </div>
      </DefaultLayout>
    </>
  );
}

export default Following;
