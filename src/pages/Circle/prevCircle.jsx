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

export default function Circle() {
  const { isLoggedIn, user } = useApp();
  const { circle } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [feedData, setFeedData] = useState([]);
  const [circleProfile, setCircleProfile] = useState([]);
  const [activeTab, setActiveTab] = useState("");
  const [feedLoading, setFeedLoading] = useState(false);
  const [currentActiveTab, setCurrentActiveTab] = useState("");
  const [seenPosts, setSeenPosts] = useState([]);
  const [noPosts, setNoPosts] = useState(false);
  const navigate = useNavigate();

  const userPublicKey = isLoggedIn
    ? user.profile.PublicKeyBase58Check
    : "BC1YLhBLE1834FBJbQ9JU23JbPanNYMkUsdpJZrFVqNGsCe7YadYiUg";

  useEffect(() => {
    if (feedData && feedData.length > 0) {
      setNoPosts(false);
    } else {
      setNoPosts(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feedData]);

  useEffect(() => {
    async function fetchData() {
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

        try {
          const request = {
            ReaderPublicKeyBase58Check: userPublicKey,
            SeenPosts: [],
            Tag: `@${circle.toLowerCase()}`,
            SortByNew: true,
            ResponseLimit: 20,
          };
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
          setIsLoading(false);
        } finally {
          setIsLoading(false);
        }
      }
    }

    let lastTab = localStorage.getItem("circleTab");
    if (lastTab) {
      setActiveTab(lastTab);
      setCurrentActiveTab(lastTab);
    } else {
      setActiveTab("hot");
      setCurrentActiveTab("hot");
      localStorage.setItem("circleTab", "hot");
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [circle, userPublicKey]);

  useEffect(() => {
    async function fetchData() {
      setFeedLoading(true);
      setCurrentActiveTab(activeTab);
      if (!circle) return;
      const deso = new Deso(DESO_CONFIG);
      let isNew =
        activeTab === "new" ? true : activeTab === "hot" ? false : null;
      if (isNew == null) {
        const request = {
          Username: circle.toLowerCase(),
          ReaderPublicKeyBase58Check: userPublicKey,
          NumToFetch: 20,
        };
        try {
          setHasMore(true);
          const response = await deso.posts.getPostsForPublicKey(request);

          if (response.Posts === null) {
            setHasMore(false);
          }
          let feedDataList = response.HotFeedPage;
          //remove posts where RecloutedPostEntryResponse is not null
          feedDataList = feedDataList.filter(
            (post) => post.RecloutedPostEntryResponse === null
          );
          setFeedData(feedDataList);
          const seenPostLists = response.Posts.map((post) => post.PostHashHex);
          setSeenPosts(seenPostLists);
        } catch (error) {
          setFeedLoading(false);
        } finally {
          setFeedLoading(false);
        }
      }
      const request = {
        ReaderPublicKeyBase58Check: userPublicKey,
        SeenPosts: [],
        Tag: `@${circle.toLowerCase()}`,
        SortByNew: isNew,
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
        setFeedLoading(false);
      } finally {
        setFeedLoading(false);
      }
    }
    fetchData();
  }, [activeTab, circle, userPublicKey]);

  const { observe } = useInView({
    rootMargin: "1000px 0px",
    onEnter: async () => {
      const deso = new Deso(DESO_CONFIG);
      setHasMore(true);
      console.log(`fetching more posts for infinite scroll`);
      let isNew =
        activeTab === "new" ? true : activeTab === "hot" ? false : null;
      const request = {
        ReaderPublicKeyBase58Check: userPublicKey,
        SeenPosts: seenPosts,
        Tag: `@${circle.toLowerCase()}`,
        SortByNew: isNew ? true : false,
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
        console.log(error);
      } finally {
        setFeedLoading(false);
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
              {!isLoading && feedData && feedData.length > 0 ? (
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
              )}
              {!isLoading &&
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
                ))}
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
