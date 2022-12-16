// Do'nt fuckin touch this component as it is used in a lot of places.
// Proceed only if you know what you are doing

import Linkify from "linkify-react";
import "linkify-plugin-hashtag";
import "linkify-plugin-mention";
import { LinkifyOptions } from "../../utils/Functions";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useEffect } from "react";
import {
  LikeButton,
  PostBottomMeta,
  PostImages,
  PostTopMeta,
} from "../common/post";
import {
  getEmbedHeight,
  getEmbedURL,
  getEmbedWidth,
} from "../../utils/EmbedUrls";
import { isBrowser } from "react-device-detect";

export default function PostCard({
  post,
  circle,
  isCommunityPost,
  isRepost,
  onCirclePage,
}) {
  const navigate = useNavigate();
  const [videoEmbed, setEmbed] = useState("");
  const [postTitle, setPostTitle] = useState("");
  const [postBody, setPostBody] = useState("");
  // let body1 = post.Body.replace( `Posted on @CircleIt in @${circle.Username}`, "" );
  // let body2 = body1.replace(`Posted on @${circle.Username}`, "");
  // let body3 = body2.replace(`Posted on @CircleIt in @${post.ProfileEntryResponse.Username}`, "");
  // let body = body3.replace(`in @undefined`, "");
  const [readMore, setReadMore] = useState(false);

  const payload = circle.ExtraData?.CircleIt
    ? JSON.parse(circle.ExtraData.CircleIt)
    : null;
  const isCircle =
    payload !== null && payload.isCircle === "true" ? true : false;

  useEffect(() => {
    if (post.PostExtraData) {
      if (post.PostExtraData.EmbedVideoURL !== null) {
        const response = getEmbedURL(post.PostExtraData.EmbedVideoURL);
        setEmbed(response);
      }
      if (post.PostExtraData.CircleIt !== null) {
        const payload = post.PostExtraData.CircleIt
          ? JSON.parse(post.PostExtraData.CircleIt)
          : null;
        if (payload && payload.Title !== null) {
          setPostTitle(payload.Title);
        }
      }
    }
  }, [post]);

  useEffect(() => {
 
    const regex = /Posted on @\w+ in @\w+/;
    const output = post.Body.replace(regex, "");
    

    const regex2 = /Posted via @\w+/;
    const output2 = output.replace(regex2, "");
    output2.length > 240 ? setReadMore(true) : setReadMore(false);
    setPostBody(output2.trimRight())
  }, [post.Body]);

  const onPostClicked = (event) => {
    event.preventDefault();
    const selection = window.getSelection();
    if (selection.toString().length !== 0) {
      return;
    }
    //console.log(event.target)
    // don't navigate if the user clicked a link
    if (
      event.target.tagName.toLowerCase() === "a" &&
      event.target.target === "_blank"
    ) {
      window.open(event.target.href, "_blank");
      return;
    } else if (
      (event.target.tagName.toLowerCase() === "a" &&
        event.target.target !== "_blank") ||
      event.target.tagName.toLowerCase() === "button" ||
      event.target.tagName.toLowerCase() === "span" ||
      event.target.tagName.toLowerCase() === "img" ||
      event.target.tagName.toLowerCase() === "svg" ||
      event.target.className === "__react_modal_image__header" ||
      event.target.className === "rsis-image"
    ) {
      return;
    }

    navigate(
      `/${isCircle ? `circle` : `u`}/${circle.Username}/${post.PostHashHex}`
    );
  };

  return (
    <div
      onClick={(e) => onPostClicked(e)}
      className={`${
        isRepost ? `my-2` : ``
      } cursor-pointer flex items-start justify-between min-h-24 lg:min-h-36 w-full transition secondaryBg secondaryBorder border primaryTextColor rounded-md mb-1 focus:outline-none active:outline-none `}>
      <div className='flex flex-col w-full p-4'>
        <PostTopMeta
          post={post}
          isCircle={isCircle}
          circle={circle}
          isCommunityPost={isCommunityPost}
          onCirclePage={onCirclePage}
        />
        <div className='flex flex-col w-full'>
          <div className='flex flex-col space-y-4 my-2 '>
            {postTitle ? 
              <h2 className='w-full font-bold text-xl lightText'>
                {postTitle}
              </h2>
            : null}
            <div className='w-full lightText break-words'>
              <Linkify options={LinkifyOptions} >
                {!readMore ? postBody : `${postBody.substring(0, 200)}`}
              </Linkify>
              {readMore && (
                <span
                  className='brandGradientText'
                  onClick={() => setReadMore(false)}>
                  ... <span className='ml-1 font-medium'>Read more</span>
                </span>
              )}
            </div>
            {post.ImageURLs?.length > 0 && post.ImageURLs[0] !== '' &&  (
              <PostImages images={post.ImageURLs} circle={circle} />
            )}
            {post.VideoURLs && post.VideoURLs[0] !== "" && (
              <div className='mt-2 feed-post__video-container relative pt-[56.25%] w-full rounded-xl max-h-[700px] overflow-hidden'>
                <iframe
                  title='embed-video'
                  src={post.VideoURLs[0]}
                  className='w-full absolute left-0 right-0 top-0 bottom-0 h-full feed-post__video'
                  allow='accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;'
                  allowFullScreen></iframe>
              </div>
            )}
            {post.PostExtraData?.EmbedVideoURL &&
              post.PostExtraData?.EmbedVideoURL !== "" &&
              videoEmbed !== "" && typeof videoEmbed != "undefined" &&(
                <div className='mt-2 embed-container w-full flex flex-row items-center justify-center rounded-xl overflow-hidden'>
                  <iframe
                    title='extraembed-video'
                    id='embed-iframe'
                    className='w-full flex-shrink-0 feed-post__image'
                    height={getEmbedHeight(videoEmbed)}
                    style={{ maxWidth: getEmbedWidth(videoEmbed) }}
                    src={videoEmbed}
                    frameBorder='0'
                    allow='picture-in-picture; clipboard-write; encrypted-media; gyroscope; accelerometer; encrypted-media;'
                    allowFullScreen></iframe>
                </div>
              )}
          </div>
          <div>
            {post.RepostedPostEntryResponse !== null && (
              <PostCard
                post={post.RepostedPostEntryResponse}
                isRepost={true}
                circle={circle}
              />
            )}
          </div>
          <PostBottomMeta
            isRepost={isRepost}
            post={
              post.RepostedPostEntryResponse !== null
                ? post.RepostedPostEntryResponse
                : post
            }
            circle={circle}
          />
        </div>
      </div>
      {isBrowser ? <LikeButton isRepost={isRepost} post={post} /> : null}
    </div>
  );
}
