import { useEffect, useState } from "react";
import Deso from "deso-protocol";
import PostCard from "../../components/cards/PostCard";
import { useNavigate, useParams } from "react-router-dom";
import { CreatePostBox } from "../../components/common";
import { SidebarRight } from "../../components/sidebar/circle";
import useApp from "../../store/app";
import FeedShimmer from "../../components/shimmers/Feed";
import SidebarShimmer from "../../components/shimmers/Sidebar";
import NoPostCard from "../../components/cards/NoPostCard";
import { Loader } from "../../utils/Loader";
import { useInView } from "react-cool-inview";
import { DefaultLayout } from "../../components/layouts";
import { DESO_CONFIG } from "../../utils/Constants";
import CircleTabs from "../../components/common/CircleTabs";
import { act } from "react-dom/test-utils";

export default function Circle() {
  const { isLoggedIn, user } = useApp();
  const { circle } = useParams();
  const [isLoading, setIsLoading] = useState(true);

  const [circleProfile, setCircleProfile] = useState([]);
  const [activeTab, setActiveTab] = useState("");
  const [feedLoading, setFeedLoading] = useState(false);
  const [currentActiveTab, setCurrentActiveTab] = useState("");

  const navigate = useNavigate();

  // having 3 different states for each tab. So we don't have to fetch the data again on tab change
  const [hotFeed, setHotFeed] = useState([]);
  const [newFeed, setNewFeed] = useState([]);
  const [communityPostFeed, setCommunityPostFeed] = useState([]);

  const [seenHotPosts, setSeenHotPosts] = useState([]);
  const [seenNewPosts, setSeenNewPosts] = useState([]);
  const [lastPostHashHex, setLastPostHashHex] = useState("");

  const [hotHasMore, setHotHasMore] = useState(true);
  const [newHasMore, setNewHasMore] = useState(true);
  const [communityHasMore, setCommunityHasMore] = useState(true);

  const [noHotPosts, setNoHotPosts] = useState(false);
  const [noNewPosts, setNoNewPosts] = useState(false);
  const [noCommunityPosts, setNoCommunityPosts] = useState(false);
  const userPublicKey = isLoggedIn
    ? user.profile.PublicKeyBase58Check
    : "BC1YLhBLE1834FBJbQ9JU23JbPanNYMkUsdpJZrFVqNGsCe7YadYiUg";

  useEffect(() => {
    if (hotFeed && hotFeed.length > 0) {
      setNoHotPosts(false);
    } else {
      setNoHotPosts(true);
    }
    if (newFeed && newFeed.length > 0) {
      setNoNewPosts(false);
    } else {
      setNoNewPosts(true);
    }
    if (communityPostFeed && communityPostFeed.length > 0) {
      setNoCommunityPosts(false);
    } else {
      setNoCommunityPosts(true);
    }
  }, [hotFeed, newFeed, communityPostFeed]);

  useEffect(() => {
    async function fetchData(lastTab) {
      if (!circle) return navigate("/");
      const deso = new Deso(DESO_CONFIG);
      const profileRequest = {
        Username: `${circle}`,
      };
      const profileResponse = await deso.user.getSingleProfile(profileRequest);
      if (profileResponse !== null && profileResponse.Profile !== null) {
        const payload = profileResponse.Profile.ExtraData?.CircleIt
          ? JSON.parse(profileResponse.Profile.ExtraData.CircleIt)
          : null;
        const isCircle =
          payload !== null && payload.isCircle === "true" ? true : false;
        if (!isCircle) {
          navigate(`/u/${circle}`);
        }
        setCircleProfile(profileResponse.Profile);

        //
        let sequenceTabList = [
          lastTab ? lastTab : "hot",
          "new",
          "community",
          "hot",
        ];
        //remove duplicate from sequenceTabList
        sequenceTabList = [...new Set(sequenceTabList)];

        //looping through each tab and storing their feed data in state
        for (let i = 0; i < sequenceTabList.length; i++) {
          const tab = sequenceTabList[i];
          if (tab === "hot") {
            const request = {
              ReaderPublicKeyBase58Check: userPublicKey,
              SeenPosts: [],
              Tag: `@${circle.toLowerCase()}`,
              SortByNew: false,
              ResponseLimit: 20,
            };
            try {
              setHotHasMore(true);
              const response = await deso.posts.getHotFeed(request);
              if (response.HotFeedPage === null) {
                setHotHasMore(false);
              }
              let feedDataList = response.HotFeedPage;
              //remove posts where RecloutedPostEntryResponse is not null
              feedDataList = feedDataList.filter(
                (post) => post.RecloutedPostEntryResponse === null
              );
              setHotFeed(feedDataList);
              //store postHashHex of each post in hotFeed
              const seenPostLists = response.HotFeedPage.map(
                (post) => post.PostHashHex
              );
              setSeenHotPosts(seenPostLists);
              setIsLoading(false);
            } catch (error) {
              console.log(error);
            }
          }
          if (tab === "new") {
            const request = {
              ReaderPublicKeyBase58Check: userPublicKey,
              SeenPosts: [],
              Tag: `@${circle.toLowerCase()}`,
              SortByNew: true,
              ResponseLimit: 20,
            };
            try {
              setNewHasMore(true);
              const response = await deso.posts.getHotFeed(request);
              if (response.HotFeedPage === null) {
                setNewHasMore(false);
              }
              let feedDataList = response.HotFeedPage;
              //remove posts where RecloutedPostEntryResponse is not null
              feedDataList = feedDataList.filter(
                (post) => post.RecloutedPostEntryResponse === null
              );
              setNewFeed(feedDataList);
              //store postHashHex of each post in newFeed
              const seenPostLists = response.HotFeedPage.map(
                (post) => post.PostHashHex
              );
              setSeenNewPosts(seenPostLists);
              setIsLoading(false);
            } catch (error) {
              console.log(error);
            }
          }
          if (tab === "community") {
            const request = {
              Username: circle.toLowerCase(),
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
             
              setLastPostHashHex(response.LastPostHashHex)
              setCommunityPostFeed(feedDataList);
              setIsLoading(false);
            } catch (error) {
              console.log(error);
            }
          }
        }
      } else {
        console.log("something wentr wrong. profile didn't load or don't exit");
      }
    }
    let lastTab = localStorage.getItem("circleTab");
    if (lastTab === null) lastTab = "hot";
    localStorage.setItem("circleTab", lastTab);
    setActiveTab(lastTab);
    fetchData(lastTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [circle, userPublicKey]);

  useEffect(() => {
    setCurrentActiveTab(activeTab);
  }, [activeTab, circle, userPublicKey]);

  const { observe } = useInView({
    rootMargin: "1000px 0px",
    onEnter: async () => {
      const deso = new Deso(DESO_CONFIG);
      if (activeTab === "hot" || activeTab === "new") {
        let isNew = activeTab === "new" ? true : false;
        if (activeTab === "hot") setHotHasMore(true);
        if (activeTab === "new") setNewHasMore(true);
        const request = {
          ReaderPublicKeyBase58Check: userPublicKey,
          SeenPosts: activeTab === "hot" ? seenHotPosts : seenNewPosts,
          Tag: `@${circle.toLowerCase()}`,
          SortByNew: isNew,
          ResponseLimit: 20,
        };
        try {
          const response = await deso.posts.getHotFeed(request);
          if (response.HotFeedPage.length === 0) {
            if (activeTab === "hot") setHotHasMore(false);
            if (activeTab === "new") setNewHasMore(false);
          }
          let feedDataList = response.HotFeedPage;
          //remove posts where RecloutedPostEntryResponse is not null
          feedDataList = feedDataList.filter(
            (post) => post.RecloutedPostEntryResponse === null
          );
          if (activeTab === "hot") setHotFeed([...hotFeed, ...feedDataList]);
          if (activeTab === "new") setNewFeed([...newFeed, ...feedDataList]);
          //store postHashHex of each post in hotFeed
          const seenPostLists = response.HotFeedPage.map(
            (post) => post.PostHashHex
          );
          if (activeTab === "hot")
            setSeenHotPosts([...seenHotPosts, ...seenPostLists]);
          if (activeTab === "new")
            setSeenNewPosts([...seenNewPosts, ...seenPostLists]);
        } catch (error) {
          console.log(error);
        }
      }
      console.log(activeTab)
      if (activeTab === "community") {
        console.log("in it should work wtf")
        const request = {
          Username: circle.toLowerCase(),
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
        
          setLastPostHashHex(response.LastPostHashHex)
          setCommunityPostFeed([...communityPostFeed, ...feedDataList]);
        } catch (error) {
          console.log(error);
        }
      }
    },
  });

  const handleTabChange = (tab) => {
    localStorage.setItem("circleTab", tab);
    setActiveTab(tab);
  };
  return (
    <>
      <DefaultLayout>
        <div className='grid grid-cols-1 gap-4 items-start lg:grid-cols-3 lg:gap-8'>
          <div className='grid grid-cols-1 gap-4 lg:col-span-2 mt-6'>
            {isLoggedIn && <CreatePostBox circle={circleProfile} />}
            <div className='flex flex-row justify-between items-center py-2'>
              <CircleTabs
                handleTabChange={handleTabChange}
                currentActiveTab={currentActiveTab}
                activeTab={activeTab}
              />
            </div>
            <div>
              {isLoading || feedLoading ? <FeedShimmer cols={20} /> : null}
              {(currentActiveTab === "hot") && (
                <>
                  {hotFeed? (
                    hotFeed.map((post) => (
                      <PostCard
                        circle={circleProfile}
                        key={post.PostHashHex}
                        post={post}
                        isRepost={false}
                        isCommunityPost={false}
                        onCirclePage={true}
                      />
                    ))
                  ) : (
                    <NoPostCard />
                  )}
                  {!isLoading && !feedLoading && hotFeed.length === 0 && (
                    <NoPostCard />
                  )}
                  {!isLoading &&
                    !feedLoading &&
                    (hotHasMore ? (
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
              {currentActiveTab === "new" && (
                <>
                  {newFeed ? (
                    newFeed.map((post) => (
                      <PostCard
                        circle={circleProfile}
                        key={post.PostHashHex}
                        post={post}
                        isRepost={false}
                        isCommunityPost={false}
                        onCirclePage={true}
                      />
                    ))
                  ) : (
                    <NoPostCard />
                  )}
                  {!isLoading && !feedLoading && newFeed.length === 0 && (
                    <NoPostCard />
                  )}
                  {!isLoading &&
                    !feedLoading &&
                    (newHasMore ? (
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
              {currentActiveTab === "community" && (
                <>
                  {communityPostFeed? (
                    communityPostFeed.map((post) => (
                      <PostCard
                        circle={circleProfile}
                        key={post.PostHashHex}
                        post={post}
                        isRepost={false}
                        isCommunityPost={true}
                        onCirclePage={true}
                      />
                    ))
                  ) : (
                    <NoPostCard />
                  )}
                  {!isLoading &&
                    !feedLoading && communityPostFeed &&
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

              {/* {!isLoading && feedData && feedData.length > 0 ? (
                feedData.map((post) => (
                  <PostCard
                    circle={circleProfile}
                    key={post.PostHashHex}
                    post={post}
                    isRepost={false}
                    isCommunityPost={currentActiveTab === "community"}
                    onCirclePage={true}
                  />
                ))
              ) : (
                <>
                  <NoPostCard />
                </>
              )}
              {!isLoading && !feedLoading && noPosts && (
                <>
                  <NoPostCard />
                </>
              )} */}
              {/* {!isLoading &&
                !feedLoading &&
                (hasMore ? (
                  <span ref={observe} className='flex justify-center p-10'>
                    <Loader />
                  </span>
                ) : (
                  <div className='flex justify-center p-10'>
                    <p className='text-gray-500 dark:text-gray-400'>
                      No more posts
                    </p>
                  </div>
                ))} */}
            </div>
          </div>
          <div className='mt-[20px] md:mt-[35px]'>
            {!isLoading ? (
              <SidebarRight circle={circleProfile} />
            ) : (
              <SidebarShimmer />
            )}
          </div>
        </div>
      </DefaultLayout>
    </>
  );
}
