import { useEffect, useState } from "react";
import Deso from "deso-protocol";
import PostCard from "../../components/cards/PostCard";
import { useNavigate, useParams } from "react-router-dom";
import { SidebarRight } from "../../components/sidebar/circle";
import useApp from "../../store/app";
import FeedShimmer from "../../components/shimmers/Feed";
import SidebarShimmer from "../../components/shimmers/Sidebar";
import NoPostCard from "../../components/cards/NoPostCard";
import { Loader } from "../../utils/Loader";
import { useInView } from "react-cool-inview";
import { DefaultLayout } from "../../components/layouts";
import { DESO_CONFIG } from "../../utils/Constants";
import ProfileTabs from "../../components/common/ProfileTabs";
import toast from "react-hot-toast";
export default function Circle() {
  const { isLoggedIn, user } = useApp();
  const { username } = useParams();
  const [isLoading, setIsLoading] = useState(true);

  const [userProfile, setUserProfile] = useState([]);
  const [activeTab, setActiveTab] = useState("");
  const [feedLoading, setFeedLoading] = useState(false);
  const [currentActiveTab, setCurrentActiveTab] = useState("");
  const [isFeedReloading, setIsFeedReloading] = useState(false);
  const navigate = useNavigate();

  // having 2 different states for each tab. So we don't have to fetch the data again on tab change
  const [mentionFeed, setMentionFeed] = useState([]);
  const [communityPostFeed, setCommunityPostFeed] = useState([]);

  const [seenMentionPost, setSeenMentionPost] = useState([]);
  const [lastPostHashHex, setLastPostHashHex] = useState("");

  const [mentionHasMore, setMentionHasMore] = useState(true);

  const [communityHasMore, setCommunityHasMore] = useState(true);
  const userPublicKey = isLoggedIn
    ? user.profile.PublicKeyBase58Check
    : "BC1YLhBLE1834FBJbQ9JU23JbPanNYMkUsdpJZrFVqNGsCe7YadYiUg";

  const deso = new Deso(DESO_CONFIG);

  useEffect(() => {
    async function fetchData(lastTab) {
      if (!username) return navigate("/");

      const profileRequest = {
        Username: `${username}`,
      };
      const profileResponse = await deso.user.getSingleProfile(profileRequest);
      if (profileResponse !== null && profileResponse.Profile !== null) {
        const payload = profileResponse.Profile.ExtraData?.CircleIt
          ? JSON.parse(profileResponse.Profile.ExtraData.CircleIt)
          : null;
        const isCircle =
          payload !== null && payload.isCircle === "true" ? true : false;
        if (isCircle) {
          navigate(`/circle/${username}`);
          return;
        }
        setUserProfile(profileResponse.Profile);

        let sequenceTabList = [
          lastTab ? lastTab : "posts",
          "mentions",
          "posts",
        ];
        //remove duplicate from sequenceTabList
        sequenceTabList = [...new Set(sequenceTabList)];

        //looping through each tab and storing their feed data in state
        for (let i = 0; i < sequenceTabList.length; i++) {
          const tab = sequenceTabList[i];
          if (tab === "mentions") {
            const request = {
              ReaderPublicKeyBase58Check: userPublicKey,
              SeenPosts: [],
              Tag: `@${username.toLowerCase()}`,
              SortByNew: true,
              ResponseLimit: 20,
            };
            try {
              setMentionHasMore(true);
              const response = await deso.posts.getHotFeed(request);
              if (response.HotFeedPage === null) {
                setMentionHasMore(false);
              }

              let feedDataList = response.HotFeedPage;
              //remove posts where RecloutedPostEntryResponse is not null
              if (feedDataList) {
                feedDataList = feedDataList.filter(
                  (post) => post.RecloutedPostEntryResponse === null
                );
                const seenPostLists = response.HotFeedPage.map(
                  (post) => post.PostHashHex
                );
                setSeenMentionPost(seenPostLists);
              }
              setMentionFeed(feedDataList);
              //store postHashHex of each post in hotFeed

              setIsLoading(false);
            } catch (error) {
              console.log(error);
            }
          }

          if (tab === "posts") {
            const request = {
              Username: username.toLowerCase(),
              ReaderPublicKeyBase58Check: userPublicKey,
              NumToFetch: 20,
            };
            try {
              setCommunityHasMore(true);
              const response = await deso.posts.getPostsForPublicKey(request);

              if (response.Posts === null) {
                setCommunityHasMore(false);
              }
              let feedDataList = response.Posts;

              setLastPostHashHex(response.LastPostHashHex);
              setCommunityPostFeed(feedDataList);
            } catch (error) {
              console.log(error);
            }
          }
        }
      } else {
        console.log("something wentr wrong. profile didn't load or don't exit");
      }
    }
    let lastTab = localStorage.getItem("profileTab");
    if (lastTab === null) lastTab = "posts";
    localStorage.setItem("profileTab", lastTab);
    setActiveTab(lastTab);
    fetchData(lastTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username, userPublicKey]);

  useEffect(() => {
    setCurrentActiveTab(activeTab);
  }, [activeTab, username, userPublicKey]);

  const { observe } = useInView({
    rootMargin: "1000px 0px",
    onEnter: async () => {
      if (activeTab === "mentions") {
        setMentionHasMore(true);
        const request = {
          ReaderPublicKeyBase58Check: userPublicKey,
          SeenPosts: seenMentionPost,
          Tag: `@${username.toLowerCase()}`,
          SortByNew: true,
          ResponseLimit: 20,
        };
        try {
          const response = await deso.posts.getHotFeed(request);
          if (response.HotFeedPage.length === 0) {
            setMentionHasMore(false);
          }
          let feedDataList = response.HotFeedPage;
          //remove posts where RecloutedPostEntryResponse is not null
          feedDataList = feedDataList.filter(
            (post) => post.RecloutedPostEntryResponse === null
          );
          setMentionFeed([...mentionFeed, ...feedDataList]);

          //store postHashHex of each post in hotFeed
          const seenPostLists = response.HotFeedPage.map(
            (post) => post.PostHashHex
          );

          setSeenMentionPost([...seenMentionPost, ...seenPostLists]);
        } catch (error) {
          console.log(error);
        }
      }

      if (activeTab === "community") {
        const request = {
          Username: username.toLowerCase(),
          ReaderPublicKeyBase58Check: userPublicKey,
          NumToFetch: 20,
          LastPostHashHex: lastPostHashHex,
        };
        try {
          setCommunityHasMore(true);
          const response = await deso.posts.getPostsForPublicKey(request);

          if (response.Posts === null) {
            setCommunityHasMore(false);
          }
          let feedDataList = response.Posts;

          setLastPostHashHex(response.LastPostHashHex);
          setCommunityPostFeed([...communityPostFeed, ...feedDataList]);
        } catch (error) {
          console.log(error);
        }
      }
    },
  });

  const handleTabChange = (tab) => {
    localStorage.setItem("profileTab", tab);
    setActiveTab(tab);
  };

  const handleFeedReload = () => {
    if (isFeedReloading || isLoading) return;
    setIsFeedReloading(true);
    async function reloadFeed(lastTab) {
      let sequenceTabList = [lastTab ? lastTab : "posts", "mentions", "posts"];
      //remove duplicate from sequenceTabList
      sequenceTabList = [...new Set(sequenceTabList)];
      //looping through each tab and storing their feed data in state
      let newPostFound = 0;
      for (let i = 0; i < sequenceTabList.length; i++) {
        const tab = sequenceTabList[i];
        if (tab === "mentions") {
          const request = {
            ReaderPublicKeyBase58Check: userPublicKey,
            SeenPosts: [],
            Tag: `@${username.toLowerCase()}`,
            SortByNew: true,
            ResponseLimit: 20,
          };
          try {
            const response = await deso.posts.getHotFeed(request);
            if (response.HotFeedPage === null) {
              setMentionHasMore(false);
            }
            let feedDataList = response.HotFeedPage;
            feedDataList = feedDataList.filter(
              (post) => post.RecloutedPostEntryResponse === null
            );
            //see if feedDataList has any new post by comparing with mentionFeed
            feedDataList = feedDataList.filter(
              (post) =>
                !mentionFeed.some((p) => p.PostHashHex === post.PostHashHex)
            );

            //if new post found, then set newPostFound to number of new post found and update seenHotPosts and hotFeed
            if (feedDataList.length > 0) {
              newPostFound += feedDataList.length;
              setSeenMentionPost([
                ...seenMentionPost,
                ...feedDataList.map((post) => post.PostHashHex),
              ]);
              setMentionFeed([...feedDataList, ...mentionFeed]);
            }
          } catch (error) {
            console.log(error);
          }
        }
        if (tab === "posts") {
          const request = {
            Username: username.toLowerCase(),
            ReaderPublicKeyBase58Check: userPublicKey,
            NumToFetch: 20,
          };
          try {
            const response = await deso.posts.getPostsForPublicKey(request);
            if (response.Posts === null) {
              setCommunityHasMore(false);
            }
            let feedDataList = response.Posts;

            //see if feedDataList has any new post by comparing with communityPostFeed
            feedDataList = feedDataList.filter(
              (post) =>
                !communityPostFeed.some(
                  (p) => p.PostHashHex === post.PostHashHex
                )
            );
            console.log(feedDataList);
            //if new post found, then set newPostFound to number of new post found and update communityPostFeed
            if (feedDataList.length > 0) {
              newPostFound += feedDataList.length;
              setCommunityPostFeed([...feedDataList, ...communityPostFeed]);
            }
          } catch (error) {
            console.log(error);
          }
        }
      }

      setIsFeedReloading(false);
      if (newPostFound > 0) {
        toast.success(
          `${newPostFound} new post${newPostFound == 1 ? "" : "s"} found!`
        );
      } else {
        toast.success("No new post found! You are up to date!");
      }
    }
    reloadFeed(currentActiveTab);
  };

  return (
    <>
      <DefaultLayout>
      <div className='flex sm:grid sm:grid-cols-1 sm:gap-4 items-start lg:grid-cols-3 lg:gap-8 flex-col-reverse'>
          <div className='grid grid-cols-1 gap-4 lg:col-span-2 mt-6'>
            <ProfileTabs
              handleTabChange={handleTabChange}
              username={username}
              activeTab={activeTab}
              currentActiveTab={currentActiveTab}
              handleFeedReload={handleFeedReload}
              isFeedReloading={isFeedReloading}
            />

            <div>
              {isLoading || feedLoading ? <FeedShimmer cols={20} /> : null}
              {currentActiveTab === "mentions" && (
                <>
                  {mentionFeed ? (
                    mentionFeed.map((post) => (
                      <PostCard
                        circle={userProfile}
                        key={post.PostHashHex}
                        post={post}
                        isRepost={false}
                        isCommunityPost={false}
                        onCirclePage={true}
                        isLoggedIn={isLoggedIn}
                        readerPublicKey={userPublicKey}
                      />
                    ))
                  ) : (
                    <NoPostCard />
                  )}
                  {mentionFeed &&
                    !isLoading &&
                    !feedLoading &&
                    mentionFeed.length === 0 && <NoPostCard />}
                  {!isLoading &&
                    !feedLoading &&
                    (mentionHasMore ? (
                      <span ref={observe} className='flex justify-center p-10'>
                        <Loader />
                      </span>
                    ) : (
                      <div className='flex justify-center p-10'>
                        <p className='text-gray-500'>No more posts</p>
                      </div>
                    ))}
                </>
              )}

              {currentActiveTab === "posts" && (
                <>
                  {communityPostFeed ? (
                    communityPostFeed.map((post) => (
                      <PostCard
                        circle={userProfile}
                        key={post.PostHashHex}
                        post={post}
                        isRepost={false}
                        isCommunityPost={true}
                        onCirclePage={true}
                        readerPublicKey={userPublicKey}
                        isLoggedIn={isLoggedIn}
                      />
                    ))
                  ) : (
                    <NoPostCard />
                  )}
                  {!isLoading &&
                    !feedLoading &&
                    communityPostFeed &&
                    communityPostFeed.length === 0 && <NoPostCard />}
                  {!isLoading &&
                    !feedLoading &&
                    (communityHasMore ? (
                      <span ref={observe} className='flex justify-center p-10'>
                        <Loader />
                      </span>
                    ) : (
                      <div className='flex justify-center p-10'>
                        <p className='text-gray-500'>No more posts</p>
                      </div>
                    ))}
                </>
              )}
            </div>
          </div>
          <div className='sm:mt-[20px] md:mt-[35px]'>
            {!isLoading ? (
              <SidebarRight circle={userProfile} />
            ) : (
              <SidebarShimmer />
            )}
          </div>
        </div>
      </DefaultLayout>
    </>
  );
}
