import { useEffect, useState } from "react";
import Deso from "deso-protocol";
import PostCard from "../../components/cards/PostCard";
import { Header } from "../../components/header";
import { useNavigate, useParams } from "react-router-dom";
import { CreatePostBox } from "../../components/common";
import { SidebarLeft } from "../../components/sidebar";
import { SidebarRight } from "../../components/sidebar/circle";
import { Toaster } from "react-hot-toast";
import useApp from "../../store/app";
import FeedShimmer from "../../components/shimmers/Feed";
import SidebarShimmer from "../../components/shimmers/Sidebar";
import NoPostCard from "../../components/cards/NoPostCard";
import { useInView } from "react-cool-inview";
import { Loader } from "../../utils/Loader";
import { DefaultLayout } from "../../components/layouts";
import { DESO_CONFIG } from "../../utils/Constants";
import ProfileTabs from "../../components/common/ProfileTabs";

const deso = new Deso(DESO_CONFIG);

export default function Circle() {
  const { isLoggedIn, user } = useApp();
  const { username } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [feedData, setFeedData] = useState([]);
  const [userProfile, setUserProfile] = useState([]);
  const [activeTab, setActiveTab] = useState("");
  const navigate = useNavigate();
  const [feedLoading, setFeedLoading] = useState(false);
  const [currentActiveTab, setCurrentActiveTab] = useState("");
  const [seenPosts, setSeenPosts] = useState([]);
  const [hasMore, setHasMore] = useState(true);

  const [lastPostHashHex, setLastPostHashHex] = useState("");
  const userPublicKey = isLoggedIn
    ? user.profile.PublicKeyBase58Check
    : "BC1YLhBLE1834FBJbQ9JU23JbPanNYMkUsdpJZrFVqNGsCe7YadYiUg";

  useEffect(() => {
    async function fetchData() {
      if (!username) return;
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
        const request = {
          Username: username,
          ReaderPublicKeyBase58Check: userPublicKey,
          NumToFetch: 20,
        };
        setIsLoading(false);
      }
    }

    let lastTab = localStorage.getItem("profileTab");
    if (lastTab) {
      setActiveTab(lastTab);
      setCurrentActiveTab(lastTab);
    }
    else {
      setActiveTab("posts");
      setCurrentActiveTab("posts");
      localStorage.setItem("profileTab", "posts");
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username, userPublicKey]);

  useEffect(() => {
    async function fetchData() {
      setFeedLoading(true);
      setCurrentActiveTab(activeTab);
      if (!username) return;

      if (activeTab === "comments") {
        return; // we yet have to work on Comment feed ..
      }
      else if (activeTab === "posts") {
        const request = {
          Username: username,
          ReaderPublicKeyBase58Check: userPublicKey,
          NumToFetch: 20,
        };
        try {
          setHasMore(true);
          const response = await deso.posts.getPostsForPublicKey(request);


          setFeedData(response.Posts);
          const lastPostHashHex = response.LastPostHashHex;
          setLastPostHashHex(lastPostHashHex);
          setFeedLoading(false);
          return;
        } catch (error) {
          setFeedLoading(false);
        }
      }
      else if (activeTab === "mentions") {
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
            setHasMore(false);
          }
          setFeedData(response.HotFeedPage);
          //store postHashHex of each post in hotFeed
          const seenPostLists = response.HotFeedPage.map(
            (post) => post.PostHashHex
          );
          setSeenPosts(seenPostLists);
          setFeedLoading(false);
        } catch (error) {
          if (feedData.length !== 0) {
            setFeedLoading(false);
          }
        }
      }


    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, username, userPublicKey]);

  const { observe } = useInView({
    rootMargin: "1000px 0px",
    onEnter: async () => {
      setHasMore(true);
      console.log(`fetching more posts for infinite scroll`);
      const request = {
        ReaderPublicKeyBase58Check: userPublicKey,
        SeenPosts: seenPosts,
        Tag: `@${username.toLowerCase()}`,
        SortByNew: true,
        ResponseLimit: 20,
      };
      try {

        if (activeTab === "posts") {
          const request = {
            Username: username,
            ReaderPublicKeyBase58Check: userPublicKey,
            NumToFetch: 20,
            LastPostHashHex: lastPostHashHex,
          };
          const response = await deso.getPostsForPublicKey(request);


          setFeedData([...feedData, ...response.Posts]);
          const lastPostHashHex = response.LastPostHashHex;
          setLastPostHashHex(lastPostHashHex);
          return
        }
        const response = await deso.posts.getHotFeed(request);
        if (response.HotFeedPage.length === 0) {
          setHasMore(false);
        }
        else {
          setFeedData([...feedData, ...response.HotFeedPage]);
          //store postHashHex of each post in hotFeed
          const seenPostLists = response.HotFeedPage.map(
            (post) => post.PostHashHex
          );
          setSeenPosts([...seenPosts, ...seenPostLists]);
        }

      } catch (error) {
        console.log(error);
        setHasMore(false);
      }
    },
  });

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    localStorage.setItem("profileTab", tab);
  }
  return (
    <>
      <DefaultLayout>
        <div className='grid grid-cols-1 gap-4 items-start lg:grid-cols-3 lg:gap-8'>
          <div className='grid grid-cols-1 gap-4 lg:col-span-2 mt-6'>
            <ProfileTabs handleTabChange={handleTabChange} username={username} activeTab={activeTab} currentActiveTab={currentActiveTab}/>
            <div>
              {isLoading || feedLoading ? (
                <FeedShimmer cols={10} />
              ) : feedData?.length > 0 ? (
                feedData.map((post) => (
                  <PostCard
                    circle={userProfile}
                    key={post.PostHashHex}
                    post={post}
                    isRepost={false}
                    isCommunityPost={currentActiveTab === "posts"}
                    onCirclePage={true}
                  />
                ))
              ) : (
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
