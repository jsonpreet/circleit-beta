import React, { useEffect, useState, useContext, useRef } from "react";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import PostShimmer from "../../components/shimmers/Post";
import SidebarShimmer from "../../components/shimmers/Sidebar";
import { SidebarRight } from "../../components/sidebar/circle";
import useApp from "../../store/app";
import { LinkifyOptions, toastOptions } from "../../utils/Functions";
import Linkify from "linkify-react";
import "linkify-plugin-hashtag";
import "linkify-plugin-mention";
import PostCard from "../../components/cards/PostCard";
import {
  LikeButton,
  PostBottomMeta,
  PostTopMeta,
  PostComments,
  PostImages,
} from "../../components/common/post";

import { DefaultLayout } from "../../components/layouts";
import {
  getEmbedHeight,
  getEmbedURL,
  getEmbedWidth,
} from "../../utils/EmbedUrls";
import { isBrowser } from "react-device-detect";
import GlobalContext from "../../utils/GlobalContext/GlobalContext";
import { Loader } from "../../utils/Loader";

function Post() {
  const ref = useRef(null);
  const GlobalContextValue = useContext(GlobalContext);
  const deso = GlobalContextValue.desoObj;
  const { circle, postID } = useParams();
  const { isLoggedIn, user, isCircle: userIsCircle } = useApp();
  const [post, setPost] = useState("");
  const [circleProfile, setCircleProfile] = useState("");
  const [isLoading, setisLoading] = useState(true);
  const [body, setBody] = useState("");
  const [isCircle, setisCircle] = useState(false);
  const [videoEmbed, setEmbed] = useState("");

  const [isGatedWithDiamond, setIsGatedWithDiamond] = useState(false);
  const [diamondLevelGatedWith, setDiamondLevelGatedWith] = useState(0);

  const [loadingDecrypted, setLoadingDecrypted] = useState(false);
  const [decryptedData, setDecryptedData] = useState(null);

  const [imagelist, setImageList] = useState([]);
  const [videoList, setVideoList] = useState([]);

  const [postBody, setPostBody] = useState("");
  const userPublicKey = isLoggedIn
    ? user.profile.PublicKeyBase58Check
    : "BC1YLhBLE1834FBJbQ9JU23JbPanNYMkUsdpJZrFVqNGsCe7YadYiUg";

  useEffect(() => {
    async function fetchData() {
      const request1 = {
        Username: circle,
      };
      try {
        const profileResponse = await deso.user.getSingleProfile(request1);
        if (profileResponse && profileResponse.Profile) {
          setCircleProfile(profileResponse.Profile);
          const payload = profileResponse.Profile.ExtraData?.CircleIt
            ? JSON.parse(profileResponse.Profile.ExtraData.CircleIt)
            : null;
          const isCircle =
            payload !== null && payload.isCircle === "true" ? true : false;
          setisCircle(isCircle);

          const request = {
            ReaderPublicKeyBase58Check: userPublicKey,
            PostHashHex: postID,
            FetchParents: true,
            CommentOffset: 0,
            CommentLimit: 20,
            AddGlobalFeedBool: false,
            ThreadLevelLimit: 2,
            ThreadLeafLimit: 1,
            LoadAuthorThread: true,
          };
          try {
            const response = await deso.posts.getSinglePost(request);
            if (response && response.PostFound) {
              let post = response.PostFound;
              setPost(post);
              setVideoList([post.VideoURLs ? post.VideoURLs : ""]);
              setImageList(post.ImageURLs ? post.ImageURLs : []);

              try {
                if (post.PostExtraData.isGatedWithDiamondOnCircleIt) {
                  setIsGatedWithDiamond(
                    post.PostExtraData.isGatedWithDiamondOnCircleIt === "true"
                      ? true
                      : false
                  );
                  setDiamondLevelGatedWith(
                    parseInt(post.PostExtraData.gatedDiamondLevel)
                  );
                }
              } catch (error) {
                // console.log(error);
              }
              setisLoading(false);
              setPostBody(post.Body);
              const regex = /Posted on @\w+ in @\w+/;
              const output = post.Body.replace(regex, "");

              setPostBody(output.trimRight());
              if (
                post.PostExtraData &&
                post.PostExtraData["EmbedVideoURL"] !== null
              ) {
                const response = getEmbedURL(
                  post.PostExtraData["EmbedVideoURL"]
                );
                setEmbed(response);
              }
            }
          } catch (error) {
            console.log(error);
            toast.error("Something went wrong!", toastOptions);
            setisLoading(false);
          }
        }
      } catch (error) {
        console.log(error);
        toast.error("Something went wrong!", toastOptions);
        setisLoading(false);
      }
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postID, circle, userPublicKey]);

  const loadGatedContent = async () => {
    if (loadingDecrypted) return;
    if (!isLoggedIn) {
      toast.error("Please login to view this content");
      return;
    }
    setLoadingDecrypted(true);
    try {
      const jwt = await GlobalContextValue.desoObj.identity.getJwt(undefined);

      const requestPayload = {
        content: post.PostExtraData.EncryptedData,
        postHashHex: post.PostHashHex,
        jwt: jwt,
        readerPublicKey: userPublicKey,
      };
      const requestURL = "https://itsaditya.live/decrypt-diamond-gated-content";
      const encryptedResponse = await fetch(requestURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestPayload),
      });
      const data = await encryptedResponse.json();
      if (data.status) {
        setImageList(data.response.image);
        setVideoList([data.response.postVideo]);
        setPostBody(data.response.content);
        setDecryptedData(data.response);
        setLoadingDecrypted(false);
      } else {
        toast.error(data.message || `Error loading gated content`);

        setLoadingDecrypted(false);
      }
      console.log(data);
    } catch (e) {
      console.log(e);
      toast.error(`Error loading gated content`);
      setLoadingDecrypted(false);
    }
  };

  return (
    <>
      <DefaultLayout>
        <div className='grid grid-cols-1 gap-4 items-start lg:grid-cols-3 lg:gap-8'>
          <div className='grid grid-cols-1 gap-4 lg:col-span-2 mt-9'>
            {isLoading ? (
              <PostShimmer />
            ) : (
              <>
                  <div
                    ref={ref}
                    className='flex flex-col min-h-24 lg:min-h-36 w-full secondaryBg secondaryBorder border primaryTextColor rounded-md mb-2'
                  >
                  <div className='flex items-start justify-between w-full'>
                    <div className='flex flex-col w-full p-4'>
                      <PostTopMeta
                        rootRef={ref}
                        post={post}
                        circle={circleProfile}
                        isCircle={isCircle}
                      />
                      <div className='flex flex-col w-full'>
                        <div className='flex flex-col space-y-4 my-2'>
                          {(!isGatedWithDiamond || decryptedData) && (
                            <div className='w-full lightText break-words'>
                              <Linkify options={LinkifyOptions}>
                                {postBody}
                              </Linkify>
                            </div>
                          )}

                          {isGatedWithDiamond &&
                            !decryptedData &&
                            !loadingDecrypted && (
                              <div className='w-full lightText break-words flex justify-center items-center flex-col'>
                                <span>{`This Content is Gated with ${diamondLevelGatedWith} Diamonds `}</span>
                                <button
                                  onClick={loadGatedContent}
                                  className={`buttonBG dark:text-white flex items-center px-8 py-2 rounded-full`}>
                                  <span className='text-sm sm:text-md'>
                                    View Gated Content 👀
                                  </span>
                                </button>
                              </div>
                            )}

                          {loadingDecrypted && (
                            <div className='w-full lightText break-words flex justify-center items-center flex-col'>
                              <Loader />
                            </div>
                          )}

                          {imagelist?.length > 0 && imagelist[0] !== "" && (
                            <PostImages images={imagelist} circle={circle} />
                          )}
                          {videoList && videoList[0] !== "" && (
                            <div className='mt-2 feed-post__video-container relative pt-[56.25%] w-full rounded-xl max-h-[700px] overflow-hidden'>
                              <iframe
                                title='embed-video'
                                src={videoList[0]}
                                className='w-full absolute left-0 right-0 top-0 bottom-0 h-full feed-post__video'
                                allow='accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;'
                                allowFullScreen></iframe>
                            </div>
                          )}
                          {post.PostExtraData?.EmbedVideoURL &&
                            post.PostExtraData?.EmbedVideoURL !== "" &&
                            videoEmbed !== "" && (
                              <div className='mt-2 embed-container w-full flex flex-row items-center justify-center rounded-xl overflow-hidden'>
                                <iframe
                                  title='extraembed-video'
                                  id='embed-iframe'
                                  className='w-full flex-shrink-0 feed-post__image'
                                  height={getEmbedHeight(videoEmbed)}
                                  style={{
                                    maxWidth: getEmbedWidth(videoEmbed),
                                  }}
                                  src={videoEmbed}
                                  frameBorder='0'
                                  allow='picture-in-picture; clipboard-write; encrypted-media; gyroscope; accelerometer; encrypted-media;'
                                  allowFullScreen></iframe>
                              </div>
                            )}
                        </div>
                        {post.RepostedPostEntryResponse !== null && (
                          <div>
                            <PostCard
                              post={post.RepostedPostEntryResponse}
                              isRepost={true}
                              circle={circleProfile}
                              isLoggedIn={isLoggedIn}
                              readerPublicKey={userPublicKey}
                            />
                          </div>
                        )}

                        <PostBottomMeta
                          post={post}
                          circleProfile={circleProfile}
                          isCircle={isCircle}
                          desoObj={deso}
                        />
                      </div>
                    </div>
                    {isBrowser ? (
                      <LikeButton isRepost={false} post={post} />
                    ) : null}
                  </div>
                  <div className='divider mt-2'></div>
                  <div className='w-full pt-4'>
                    <div className='flex flex-col'>
                      {isLoggedIn && (
                        <div className='mb-2 flex px-4 items-center space-x-1'>
                          <span>Comment as</span>
                          <p
                            to={`/${userIsCircle ? `circle` : `u`}/${
                              user.profile.Username
                            }`}
                            className='brandGradientText'>
                            <span>{user.profile.Username}</span>
                          </p>
                        </div>
                      )}
                      <div>
                        <PostComments
                          post={post}
                          circleProfile={circleProfile}
                          isCircle={isCircle}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
          <div className='md:mt-[35px]'>
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

export default Post;
