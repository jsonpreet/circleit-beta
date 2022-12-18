import Linkify from "linkify-react";
import React, { useEffect, useState, useContext } from "react";
import { Link, useParams } from "react-router-dom";
import useApp from "../../store/app";
import { getEmbedHeight, getEmbedWidth } from "../../utils/EmbedUrls";
import {
  dateFormat,
  LinkifyOptions,
  timeStampToTimeAgo,
} from "../../utils/Functions";
import { PostBottomMeta, PostImages } from "../common/post";

import { NODE_URL } from "../../utils/Constants";
import Tippy from "@tippyjs/react/headless";
import SubProfileCard from "./SubProfileCard";
import { isBrowser, isMobile } from "react-device-detect";

import GlobalContext from "../../utils/GlobalContext/GlobalContext";
import greenCheck from "../../assets/greenCheck.svg";
function CommentCard({
  post,
  comment,
  isSubComment,
  isVerified,
  parent = null,
 
}) {
  console.log(isVerified)
  const GlobalContextValue = useContext(GlobalContext);
  const deso = GlobalContextValue.desoObj;
  const { isLoggedIn, user, isCircle: userIsCircle } = useApp();
  const { circle } = useParams();
  const [videoEmbed, setEmbed] = useState("");
  const [readMore, setReadMore] = useState(false);
  const [comments, setComments] = useState("");
  const [commentBody, setCommentBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [isCircle, setisCircle] = useState(false);
  const [lastID, setLastID] = useState("");
  const [totalComments, setTotalComments] = useState(0);

  const userPublicKey = isLoggedIn
    ? user.profile.PublicKeyBase58Check
    : "BC1YLhBLE1834FBJbQ9JU23JbPanNYMkUsdpJZrFVqNGsCe7YadYiUg";

  useEffect(() => {
    //disabled this as this throws weird error on this post u/nader/e94f552d8f1d6e78b038ca6a5669308984e2a2d5e4bb0d222c23a510a2fff877
    // if (comment.PostExtraData && comment.PostExtraData['EmbedVideoURL'] !== null) {
    //     const response = getEmbedURL(comment.PostExtraData['EmbedVideoURL']);
    //     setEmbed(response)
    // }

    if (comment.Comments && comment.Comments.length > 0) {
      setComments(comment.Comments);
      setTotalComments(comment.Comments.length);
      setHasMore(true);
      setLastID(comment.Comments[comment.Comments.length - 1].PostHashHex);
    } else {
      setHasMore(false);
    }

    if (comment.Body && comment.ProfileEntryResponse) {
      let body1 = comment.Body.replace(`Posted on @CircleIt in @${circle}`, "");
      let body2 = body1.replace(`Posted on @${circle}`, "");
      let body3 = body2.replace(
        `Posted on @CircleIt in @${comment.ProfileEntryResponse.Username}`,
        ""
      );
      let body = body3.replace(`in @undefined`, "");
      setCommentBody(body);
    }
    if (
      comment.ProfileEntryResponse.ExtraData !== null &&
      comment.ProfileEntryResponse.ExtraData.CircleIt !== undefined
    ) {
      const payload = JSON.parse(
        comment.ProfileEntryResponse.ExtraData.CircleIt
      );
      const isCircle =
        payload !== null && payload.isCircle === "true" ? true : false;
      setisCircle(isCircle);
    }
  }, [comment]);

  const loadMore = async (e, id) => {
    e.preventDefault();
    try {
      setLoading(true);
      const request = {
        PostHashHex: id,
        ReaderPublicKeyBase58Check: userPublicKey,
        CommentLimit: 10,
        CommentOffset: isSubComment ? 0 : 1,
      };
      try {
        const response = await deso.posts.getSinglePost(request);
        if (response && response.PostFound) {
          let npost = response.PostFound;
          if (npost.Comments !== null && npost.Comments.length > 0) {
            setHasMore(true);
            setLastID(npost.Comments[npost.Comments.length - 1].PostHashHex);
          } else {
            setHasMore(false);
          }
          setComments([...comments, ...npost.Comments]);
          setTotalComments(comments.length);
          setLoading(false);
        }
      } catch (error) {
        console.log(error);
        setLoading(false);
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    commentBody.length > 200 ? setReadMore(true) : setReadMore(false);
  }, [commentBody]);

  return (
    <>
      <div
        data-id={comment.PostHashHex}
        data-last={lastID}
        className={`flex flex-col overflow-hidden secondaryBorder ${
          isSubComment
            ? `ml-2 px-0 rounded-none`
            : `border-b pb-4 px-4 last:border-transparent`
        }`}
      >
        <div className="flex space-y-3 md:divide-y-0 divide-y theme-divider md:space-y-0 space-x-0 md:space-x-3">
          {isBrowser ? (
            <div className="flex thread relative">
              <Link
                to={`/${isCircle ? `circle` : `u`}/${
                  comment.ProfileEntryResponse.Username
                }`}
                className="flex items-start justify-start space-x-1"
              >
                <img
                  src={`${NODE_URL}/get-single-profile-picture/${comment.ProfileEntryResponse.PublicKeyBase58Check}?fallback=https://diamondapp.com/assets/img/default_profile_pic.png`}
                  className="w-9 h-9 rounded-full"
                  alt={
                    comment.ProfileEntryResponse.ExtraData?.DisplayName
                      ? comment.ProfileEntryResponse.ExtraData?.DisplayName
                      : comment.ProfileEntryResponse.Username
                  }
                />
              </Link>
            </div>
          ) : null}
          <div className="md:flex-1">
            <div className="flex items-center space-x-2">
              {isMobile ? (
                <div className="thread relative">
                  <Link
                    to={`/${isCircle ? `circle` : `u`}/${
                      comment.ProfileEntryResponse.Username
                    }`}
                    className="flex items-start justify-center space-x-1"
                  >
                    <img
                      src={`${NODE_URL}/get-single-profile-picture/${comment.ProfileEntryResponse.PublicKeyBase58Check}?fallback=https://diamondapp.com/assets/img/default_profile_pic.png`}
                      className="w-9 h-9 rounded-full"
                      alt={
                        comment.ProfileEntryResponse.ExtraData?.DisplayName
                          ? comment.ProfileEntryResponse.ExtraData?.DisplayName
                          : comment.ProfileEntryResponse.Username
                      }
                    />
                    
                  </Link>
                </div>
              ) : null}
              <span className="text-sm font-semibold">
                <Tippy
                  followCursor={true}
                  placement="bottom"
                  interactive={true}
                  maxWidth={300}
                  interactiveDebounce={100}
                  delay={500}
                  render={(attrs) => (
                    <SubProfileCard
                      isCircle={false}
                      profile={comment.ProfileEntryResponse}
                      {...attrs}
                    />
                  )}
                >
                  <Link
                    className="extralightText text-sm cursor-pointer relative hover:underline flex items-center justify-center space-x-1"
                    to={`/${isCircle ? `circle` : `u`}/${
                      comment.ProfileEntryResponse.Username
                    }`}
                  >
                    {/* <span>{comment.ProfileEntryResponse.ExtraData?.DisplayName ? comment.ProfileEntryResponse.ExtraData?.DisplayName : comment.ProfileEntryResponse.Username}</span> */}
                    <span>{comment.ProfileEntryResponse.Username}</span>
                    {isVerified && <img src={greenCheck} className="w-4 h-4" />}
                  </Link>
                </Tippy>
              </span>
              <span className="middot"></span>
              <span
                className="text-sm extralightText"
                title={dateFormat(comment.TimestampNanos)}
              >
                {timeStampToTimeAgo(comment.TimestampNanos)}
              </span>
            </div>
            {parent && (
              <div className="text-sm">
                Replying to{" "}
                <Link
                  to={`/${isCircle ? `circle` : `u`}/${
                    parent.ProfileEntryResponse.Username
                  }`}
                  className="font-semibold brandGradientText text-sm"
                >
                  {parent.ProfileEntryResponse.Username}
                </Link>
              </div>
            )}
            <div className="mt-1 w-full lightText">
              <Linkify options={LinkifyOptions}>
                {!readMore ? commentBody : `${commentBody.substring(0, 200)}`}
              </Linkify>
              {readMore && (
                <span
                  className="brandGradientText cursor-pointer"
                  onClick={() => setReadMore(false)}
                >
                  ... <span className="ml-1 font-medium">Read more</span>
                </span>
              )}
            </div>
            {comment.ImageURLs?.length > 0 && (
              <PostImages
                images={comment.ImageURLs}
                circle={comment.ProfileEntryResponse}
              />
            )}
            {comment.VideoURLs && comment.VideoURLs[0] !== "" && (
              <div className="mt-2 feed-post__video-container relative pt-[56.25%] w-full rounded-xl max-h-[700px] overflow-hidden">
                <iframe
                  title="embed-video"
                  src={comment.VideoURLs[0]}
                  className="w-full absolute left-0 right-0 top-0 bottom-0 h-full feed-post__video"
                  allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                  allowFullScreen
                ></iframe>
              </div>
            )}

            {comment.PostExtraData?.EmbedVideoURL &&
              comment.PostExtraData?.EmbedVideoURL !== "" &&
              videoEmbed !== "" && (
                <div className="mt-2 embed-container w-full flex flex-row items-center justify-center rounded-xl overflow-hidden">
                  <iframe
                    title="extraembed-video"
                    id="embed-iframe"
                    className="w-full flex-shrink-0 feed-post__image"
                    height={getEmbedHeight(videoEmbed)}
                    style={{ maxWidth: getEmbedWidth(videoEmbed) }}
                    src={videoEmbed}
                    frameBorder="0"
                    allow="picture-in-picture; clipboard-write; encrypted-media; gyroscope; accelerometer; encrypted-media;"
                    allowFullScreen
                  ></iframe>
                </div>
              )}
            <div className="mb-2">
              <PostBottomMeta post={comment} isRepost={false} desoObj={deso} />
            </div>
            {comments && comments.length > 0 && (
              <div className="mt-4 mb-2">
                {comments.map((subcomment, index) => {
                  return (
                    <CommentCard
                      isSubComment={true}
                      parent={comment}
                      comment={subcomment}
                      key={index}
                    />
                  );
                })}
              </div>
            )}

            {hasMore && comments.length > 0 && (
              <div
                data-id={isSubComment ? lastID : comment.PostHashHex}
                className="flex items-center justify-start mt-2"
              >
                <button
                  className="text-sm brandGradientText font-medium"
                  onClick={(e) =>
                    loadMore(e, isSubComment ? lastID : comment.PostHashHex)
                  }
                >
                  {!loading
                    ? `View more comments`
                    : `Fetching more comments...`}
                </button>
              </div>
            )}
            {/* {comments && comment.CommentCount > comments.length && (
                            <div className='flex items-center justify-start mt-2'>
                                    <button onClick={(e) => loadMore(e, comment.PostHashHex)} data-id={comment.PostHashHex} className='brandGradientText text-sm font-medium'>View {comment.CommentCount - comments.length} more comments</button>
                                </div>
                        ) } */}
          </div>
        </div>
      </div>
    </>
  );
}

export default CommentCard;
