import React, { Fragment, useRef, useState } from "react";
import useApp from "../../../store/app";
import { Loader } from "../../../utils/Loader";
import Deso from "deso-protocol";
import { useEffect } from "react";
import CommentCard from "../../cards/CommentCard";
import { useInView } from "react-cool-inview";
import { DESO_CONFIG } from "../../../utils/Constants";
import Tippy from "@tippyjs/react";
import { BiImageAdd, BiVideoPlus } from "react-icons/bi";
import { ImEmbed2 } from "react-icons/im";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import * as tus from "tus-js-client"
import { getEmbedHeight, getEmbedURL, getEmbedWidth, isValidEmbedURL } from "../../../utils/EmbedUrls";
import { BsEmojiSmile, BsTrash } from "react-icons/bs";
import { Popover, Transition } from "@headlessui/react";
import EmojiPicker from "emoji-picker-react";

const deso = new Deso(DESO_CONFIG);

function PostComments({ post }) {
  const { isLoggedIn, user, isCircle: userIsCircle } = useApp();
  const { circle } = useParams();
  const [comment, setComment] = useState("");
  const [postImage, setPostImage] = useState('');
  const [postEmoji, setEmoji] = useState('');
  const [postLink, setPostLink] = useState('');
  const [postEmbedLink, setPostEmbedLink] = useState('');
  const [comments, setComments] = useState("");
  const [hasMore, setHasMore] = useState(true);
  const [commentOffset, setCommentOffset] = useState(30);

  const [loading, setLoading] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showLinkField, setShowLinkField] = useState(false);
  const inputFileRef = useRef(null);
  const userPublicKey = isLoggedIn
    ? user.profile.PublicKeyBase58Check
    : "BC1YLhBLE1834FBJbQ9JU23JbPanNYMkUsdpJZrFVqNGsCe7YadYiUg";
  
  useEffect(() => {
    if (postEmoji && postEmoji.emoji.trim().length > 0) {
      setComment(comment + postEmoji.emoji)
    }
  }, [postEmoji])

  useEffect(() => {
    setComments(post.Comments);
    // console.log(post);
    setLoadingComments(false);
    // fetchData();
  }, [post, userPublicKey]);

  const submitComment = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (comment.trim().length > 0) {
     
      const request = {
        BodyObj: {
          Body: comment,
          ImageURLs: postImage !== '' ? [postImage] : [],
        },
        ParentStakeID: post.PostHashHex,
        UpdaterPublicKeyBase58Check: userPublicKey,
      };
      try {
        const response = await deso.posts.submitPost(request);
        if (response && response.TxnHashHex) {
          setLoadingComments(true);
          const request1 = {
            PostHashHex: post.PostHashHex,
            ReaderPublicKeyBase58Check: userPublicKey,
            CommentLimit: 10,
            CommentOffset: 0,
          };
          try {
            const response1 = await deso.posts.getSinglePost(request1);
            if (response1 && response1.PostFound) {
              let post = response1.PostFound;
              setComments(post.Comments);
              setComment("");
              setLoading(false);
              setLoadingComments(false);
            }
          } catch (error) {
            console.log(error);
            setLoading(false);
            setLoadingComments(false);
          }
        }
      } catch (error) {
        console.log(error);
        setLoading(false);
      }
      finally {
        setComment('');
        setPostImage('');
        setPostEmbedLink('');
        setEmoji('');
        setPostLink('');
        setLoading(false);
        setShowLinkField(false);
        toast.success('Congratulations! Post Created.');
      }
    } else {
        setLoading(false);
        toast.error('Please write something to post.');
    }
    
  };

  const { observe } = useInView({
    rootMargin: "1000px 0px",
    onEnter: async () => {
      // setHasMore(true);
      console.log(`fetching more posts for infinite scroll`);
      const request = {
        ReaderPublicKeyBase58Check: userPublicKey,
        PostHashHex: post.PostHashHex,
        FetchParents: true,
        CommentOffset: commentOffset,
        CommentLimit: 30,
        AddGlobalFeedBool: false,
        ThreadLevelLimit: 3,
        ThreadLeafLimit: 2,
        LoadAuthorThread: true,
      };

      try {
        const response1 = await deso.posts.getSinglePost(request);
        if (response1 && response1.PostFound) {
          let post = response1.PostFound;
          if (!post.Comments) {
            setHasMore(false);
            setLoadingComments(false);
            return;
          }
          setComments([...comments, ...post.Comments]);
          setCommentOffset(commentOffset + 30);
          setComment("");

          setLoadingComments(false);
        }
      } catch (error) {
        console.log(error);

        setLoadingComments(false);
      }
    },
  });

  const handleEmbedLink = (e) => {
    const link = e.target.value
    setPostLink(link);
    if (link.trim().length > 0) {
      const response = getEmbedURL(link);
      const isValid = isValidEmbedURL(response)
      if (isValid) {
        setPostEmbedLink(response)
      } else {
        setPostEmbedLink(null)
        toast.error('Invalid Embed URL');
      }
    }
  }

  const handleImage = async () => {
    setUploadingImage(true);
    const deso = new Deso();
    const request = {
      UserPublicKeyBase58Check: user.profile.PublicKeyBase58Check
    };
    const response = await deso.media.uploadImage(request);
    if(response.ImageURL !== "") {
      setPostImage(response.ImageURL);
      setUploadingImage(false);
    }
  }
  return (
    <>
      <div className='flex flex-col w-full'>
        {isLoggedIn ? <div className='flex w-full px-4'>
          <div className='transition w-full delay-50 border secondaryBorder rounded-md p-[1px]'>
            <textarea
              className='w-full h-32 auto-resize primaryBg dark:text-white outline-none p-2 focus:ring-0'
              placeholder='Write a comment...'
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            {postImage !== '' ?
            <div className="relative m-4">
              <img src={postImage}
                alt=""
                className="w-full darkenBorder border rounded-lg"
              />
              <div className="absolute top-4 right-4 ">
                <button onClick={() => {
                    setPostImage('')
                  }}
                  className="bg-red-500 group hover:bg-red-700  rounded-full w-10 h-10 drop-shadow-lg flex items-center justify-center">
                  <BsTrash size={24} className="text-white" />
                </button>
              </div>
            </div>
              : null}
            {showLinkField ?
            <div className="m-4">
              <input
                onChange={handleEmbedLink}
                value={postLink}
                className={`focus:ring-0 focus:outline-none outline-none darkenBg darkenHoverBg border dark:border-[#2D2D33] hover:dark:border-[#43434d] border-gray-200 hover:border-gray-200 resize-none w-full heading px-4 py-2 rounded-md`}
                placeholder='Embed Youtube, Vimeo, TikTok, Giphy, Spotify, Mousai, or SoundCloud' />
            </div>
          : null}
          {postEmbedLink !== '' && postEmbedLink !== null ?
            <div className='m-2 embed-container w-full flex flex-row items-center justify-center rounded-xl overflow-hidden'>
              <iframe id="embed-iframe" className='w-full flex-shrink-0' height={getEmbedHeight(postEmbedLink)} style={{ maxWidth: getEmbedWidth(postEmbedLink) }} src={postEmbedLink} frameBorder="0" allow="picture-in-picture; clipboard-write; encrypted-media; gyroscope; accelerometer; encrypted-media;" allowFullScreen ></iframe>
            </div>
            : null}
            <div className='bg-gray-100 -mt-[1px] dark:bg-[#121214] p-2 flex w-full'>
             <div className="flex items-center space-x-4 my-2 px-2">
                <div>
                  <Tippy content="Add Image" placement="bottom">
                    <button onClick={() => {
                        handleImage()
                        setShowLinkField(false)
                      }}>
                      {uploadingImage ? <Loader className='w-5 h-5'/> : <BiImageAdd size={21} className="text-gray-500" />}
                    </button>
                  </Tippy>
                </div>
                {/* <div>
                  <input ref={inputFileRef} type="file" className="hidden" name="video" onChange={handleFileChange} />
                  <Tippy content="Add Video" placement="bottom">
                    <button onClick={() => handleVideo()}>
                      <BiVideoPlus size={21} className="text-gray-500" />
                    </button>
                  </Tippy>
                </div> */}
                <div>
                  <Tippy content="Add Embed" placement="bottom">
                    <button onClick={() => {
                        setUploadingImage(false);
                        setShowLinkField(true)
                      }
                    }>
                      <ImEmbed2 size={21} className="text-gray-500" />
                    </button>
                  </Tippy>
                </div>
                <div className="relative">
                  <Popover className="relative">
                      {({ open }) => (
                      <>
                        <Popover.Button
                          onClick={() => {
                            setUploadingImage(false);
                            postEmbedLink !== '' && postEmbedLink !== null ? setShowLinkField(true) : setShowLinkField(false)
                          }}
                          className={`
                              ${open ? '' : 'text-opacity-90'}
                              group inline-flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75`}
                          >
                              <BsEmojiSmile size={19} className="text-gray-500" />
                          </Popover.Button>
                          <Transition
                              as={Fragment}
                              enter="transition ease-out duration-200"
                              enterFrom="opacity-0 translate-y-1"
                              enterTo="opacity-100 translate-y-0"
                              leave="transition ease-in duration-150"
                              leaveFrom="opacity-100 translate-y-0"
                              leaveTo="opacity-0 translate-y-1"
                          >
                              <Popover.Panel className="absolute left-1/2 z-20 mt-3 w-screen max-w-sm -translate-x-1/2 transform">
                                  <EmojiPicker emojiStyle='twitter' onEmojiClick={setEmoji}  />
                              </Popover.Panel>
                          </Transition>
                      </>
                      )}
                  </Popover>
                </div>
              </div>
              <div className='flex w-full justify-end'>
                <button
                  onClick={(e) => submitComment(e)}
                  className='buttonBG dark:text-white flex items-center px-4 py-2 rounded-md'>
                  {loading && <Loader className='mr-2 w-5 h-5' />}{" "}
                  <span>Post</span>
                </button>
              </div>
            </div>
          </div>
        </div> :
          <div className='mb-2 flex px-4 items-center'>
            <span className="text-lg brandGradientText font-semibold">Comments</span>
          </div>}
        <div className='flex flex-col space-y-4 mt-4'>
          {comments &&
            comments.length > 0 &&
            comments.map((comment, index) => {
              return <div key={index}>
                <CommentCard isSubComment={false} post={post} comment={comment}  />
                </div>
            })
          }
          {!loadingComments && comments && comments.length === 0 && (
            <div className='text-sm text-gray-500 dark:text-gray-400'>
              No comments yet
            </div>
          )}
          {!loadingComments &&
            comments &&
            (hasMore ? (
              <span ref={observe} className='flex justify-center pb-4'>
                <Loader />
              </span>
            ) : (
              <div className='flex justify-center pb-4'>
                <p className='text-gray-500 dark:text-gray-400'>
                  No more comments
                </p>
              </div>
            ))}
        </div>
      </div>
    </>
  );
}

export default PostComments;
