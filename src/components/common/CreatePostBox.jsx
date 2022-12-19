import React, { Fragment, useEffect, useRef, useState } from "react";
import { BiImageAdd, BiVideoPlus } from "react-icons/bi";
import { ImEmbed2 } from "react-icons/im";
import useApp from "../../store/app";
import { DESO_CONFIG, NODE_URL } from "../../utils/Constants";
import Tippy from "@tippyjs/react";
import Deso from "deso-protocol";
import { Loader } from "../../utils/Loader";
import { BsEmojiSmile, BsTrash } from "react-icons/bs";
import * as tus from "tus-js-client";
import ProgressBar from "./ProgressBar";
import toast from "react-hot-toast";
import {
  getEmbedHeight,
  getEmbedURL,
  getEmbedWidth,
  isValidEmbedURL,
} from "../../utils/EmbedUrls";
import { Popover, Transition } from "@headlessui/react";
import EmojiPicker from "emoji-picker-react";

export default function CreatePostBox({ circle }) {
  const { user } = useApp((state) => state);
  const [postTitle, setPostTitle] = useState("");
  const [postBody, setPostBody] = useState("");
  const [postImageList, setPostImageList] = useState([]);
  const [postVideo, setPostVideo] = useState("");
  const [postEmoji, setEmoji] = useState("");
  const [postLink, setPostLink] = useState("");
  const [postEmbedLink, setPostEmbedLink] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isExpanded, setExpand] = useState(false);
  const [isVideoReady, setVideoProcess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showLinkField, setShowLinkField] = useState(false);
  const videoStreamInterval = null;
  const inputFileRef = useRef(null);
  const deso = new Deso(DESO_CONFIG);
  useEffect(() => {
    if (postEmoji && postEmoji.emoji.trim().length > 0) {
      setPostBody(postBody + postEmoji.emoji);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postEmoji]);

  useEffect(() => {
    if (videoFile) {
      handleSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoFile]);

  const handleImage = async () => {
    setUploadingImage(true);

    const request = {
      UserPublicKeyBase58Check: user.profile.PublicKeyBase58Check,
    };
    const response = await deso.media.uploadImage(request);
    if (response.ImageURL !== "") {
      setPostImageList([...postImageList, response.ImageURL]);
      setUploadingImage(false);
    }
  };

  //look for ctrl + v
  const handlePaste = async (e) => {
    try {
      const clipBoardItems = await navigator.clipboard.read();
      const fileItem = clipBoardItems[0].types.includes(
        "image/png",
        "image/jpg",
        "image/jpeg",
        "image/gif",
        "image/webp"
      );
      if (fileItem) {
        setUploadingImage(true);
        const fileObject = await clipBoardItems[0].getType(
          "image/png",
          "image/jpg",
          "image/jpeg",
          "image/gif",
          "image/webp"
        );
        const file = new File([fileObject], clipBoardItems[0].types, {
          type: clipBoardItems[0].types,
        });
        handleImageUpload(file);
      }
    } catch (e) {
      console.log("Not image");
    }
  };

  const handleImageUpload = async (file) => {
    const request = undefined;
    try {
      const jwt = await deso.identity.getJwt(request);

      //make a POST request to https://node.deso.org/api/v0/upload-image
      const formData = new FormData();
      formData.append("file", file);
      formData.append("JWT", jwt);
      formData.append(
        "UserPublicKeyBase58Check",
        user.profile.PublicKeyBase58Check
      );
      const response = await fetch(
        "https://node.deso.org/api/v0/upload-image",
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await response.json();
      if (data.ImageURL !== "") {
        setPostImageList([...postImageList, data.ImageURL]);
      }
      setUploadingImage(false);
    } catch (e) {
      setUploadingImage(false);
      console.log(e);
    }
  };

  const handleEmbedLink = (e) => {
    const link = e.target.value;
    setPostLink(link);
    if (link.trim().length > 0) {
      const response = getEmbedURL(link);
      const isValid = isValidEmbedURL(response);
      if (isValid) {
        setPostEmbedLink(response);
      } else {
        setPostEmbedLink(null);
        toast.error("Invalid Embed URL");
      }
    }
  };

  const handleFileChange = (e) => {
    setVideoFile(e.target.files[0]);
  };

  const handleVideo = async () => {
    inputFileRef.current.click();
  };

  const handleSubmit = () => {
    return new Promise((resolve, reject) => {
      if (videoFile.size > 4 * (1024 * 1024 * 1024)) {
        toast.error("File is too large. Please choose a file less than 4GB!");
        return;
      }
      let upload;
      let mediaId = "";
      const options = {
        endpoint: "https://node.deso.org/api/v0/upload-video",
        chunkSize: 50 * 1024 * 1024,
        uploadSize: videoFile.size,
        onError: (error) => {
          console.log(error.message);
          upload
            .abort(true)
            .then(() => {
              throw error;
            })
            .finally(reject);
        },
        onProgress: (bytesUploaded, bytesTotal) => {
          setUploadProgress((bytesUploaded / bytesTotal) * 100).toFixed(2);
        },
        onSuccess: () => {
          setUploadProgress(100);
          setPostVideo(`https://iframe.videodelivery.net/${mediaId}`);
          pollForReadyToStream(resolve, mediaId);
        },
        onAfterResponse: (req, res) => {
          // The stream-media-id header is the video Id in Cloudflare's system that we'll need to locate the video for streaming.
          let mediaIdHeader = res.getHeader("stream-media-id");
          if (mediaIdHeader) {
            mediaId = mediaIdHeader;
          }
        },
      };
      // Clear the interval used for polling cloudflare to check if a video is ready to stream.
      if (videoStreamInterval != null) {
        clearInterval(videoStreamInterval);
      }
      // Create and start the upload.
      upload = new tus.Upload(videoFile, options);
      upload.start();
    });
  };

  const pollForReadyToStream = (onReadyToStream, mediaId) => {
    let attempts = 0;
    let numTries = 1200;
    let timeoutMillis = 500;
    const videoStreamInterval = setInterval(async () => {
      if (attempts >= numTries) {
        clearInterval(videoStreamInterval);
        return;
      }
      const request = {
        videoId: mediaId,
      };
      const response = await deso.media.getVideoStatus(request);
      if (response.status === 200 && response.data !== undefined) {
        if (response.data.ReadyToStream) {
          setVideoProcess(true);
          setVideoFile(null);
          onReadyToStream();
          clearInterval(videoStreamInterval);
          return;
        }
        if (response.data.exitPolling) {
          console.log("Video is not ready to stream");
          clearInterval(videoStreamInterval);
          return;
        }
      }
      attempts++;
    }, timeoutMillis);
  };

  const submitPost = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      let payload = {
        Title: postTitle,
      };
      let extraBody = `Posted on @CircleIt${
        circle.Username !== "CircleIt" ? " in @" + circle.Username : ""
      }`;
      let body =
        postBody.trim().length > 0 ? postBody + `\n\n ${extraBody}` : null;
      const request = {
        UpdaterPublicKeyBase58Check: user.profile.PublicKeyBase58Check,
        BodyObj: {
          Body: body,
          VideoURLs: postVideo !== "" ? [postVideo] : [],
          ImageURLs: postImageList,
        },
        PostExtraData: {
          EmbedVideoURL: postEmbedLink,
          CircleIt: JSON.stringify(payload),
          CircleUsername: circle.Username,
          CirclePublicKey: circle.PublicKeyBase58Check,
        },
      };
      await deso.posts.submitPost(request);
    } catch (error) {
      console.log(error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setPostBody("");
      setPostTitle("");
      setPostImageList([]);
      setPostVideo("");
      setPostEmbedLink("");
      setEmoji("");
      setPostLink("");
      setVideoFile(null);
      setIsLoading(false);
      setShowLinkField(false);
      toast.success("Congratulations! Post Created.");
      // party.confetti(rootRef.current, {
      //   ount: party.variation.range(100, 2000),
      //   size: party.variation.range(0.5, 2.0),
      // })
    }
  };
  // look for ctrl + enter
  const handleKeyDown = (e) => {
    if (e.keyCode === 13 && e.ctrlKey) {
      submitPost();
    }
    //check for paste
    if (e.keyCode === 86 && e.ctrlKey) {
      handlePaste(e);
    }
  };

  return (
    <>
      <div
        onClick={() => setExpand(true)}
        className='mt-4 flex-col flex secondaryBg primaryBorder border rounded-md'>
        <div className='flex items-start space-x-0 md:space-x-4 my-4 px-4 md:px-6'>
          <img
            src={`${NODE_URL}/get-single-profile-picture/${
              Object.keys(user).length === 0
                ? "BC1YLjYU4V7winz1sNkhGeLpxpNVkFvNE4p2x1V7PFH8BW4ZQ4vJAzX"
                : user.profile.PublicKeyBase58Check
            }?fallback=https://diamondapp.com/assets/img/default_profile_pic.png`}
            alt=''
            className='hidden md:flex rounded-full w-10 h-10'
          />
          <div className='flex w-full flex-col'>
            <div className='flex items-center'>
              <input
                className={`focus:ring-0 focus:outline-none outline-none darkenBg darkenHoverBg border dark:border-[#2D2D33] hover:dark:border-[#43434d] border-gray-200 hover:border-gray-200 resize-none w-full heading px-4 py-2 ${
                  isExpanded ? "rounded-md" : "rounded-full"
                }`}
                placeholder={`${!isExpanded ? "Create Post" : "Title (optional)"}`}
                value={postTitle}
                handleKeyDown={handleKeyDown}
                onChange={(e) => setPostTitle(e.target.value)}
              />
              {!isExpanded ? (
                <button className='font-medium text-white transition delay-75 px-6 py-1.5 rounded-full buttonBG ml-6'>
                  Post
                </button>
              ) : null}
            </div>
            {isExpanded ? (
              <>
                <div className='mt-4'>
                  <textarea
                    className='focus:ring-0 focus:outline-none outline-none darkenBg darkenHoverBg border dark:border-[#2D2D33] hover:dark:border-[#43434d] border-gray-200 hover:border-gray-200 resize-none w-full rounded-lg heading px-4 py-2'
                    placeholder='Write something...'
                    value={postBody}
                    onChange={(e) => setPostBody(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                </div>
                <div>
                  {postImageList.map((image, index) => (
                    <div key={index} className='relative mt-4 grid grid-cols-2 gap-2 mx-auto '>
                      <div className="container">
                      <img
                        src={image}
                        alt=''
                        className='w-full darkenBorder border rounded-lg'
                      />
                      <div className='absolute top-2 right-2 '>
                        <button
                          onClick={() => {
                            let temp = [...postImageList];
                            temp.splice(index, 1);
                            setPostImageList(temp);
                          }}
                          className='bg-red-500 group hover:bg-red-700  rounded-full w-10 h-10 drop-shadow-lg flex items-center justify-center'>
                          <BsTrash size={24} className='text-white' />
                        </button>
                      </div>
                      </div>
                    </div>
                  ))}

                  {isVideoReady && postVideo !== "" ? (
                    <div className='relative mt-4'>
                      <div className='mt-2 relative pt-[56.25%] w-full rounded-xl max-h-[700px] overflow-hidden'>
                        <iframe
                          src={postVideo}
                          className='w-full absolute left-0 right-0 top-0 bottom-0 h-full'
                          allow='accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;'
                          allowFullScreen></iframe>
                      </div>
                      <div className='absolute top-4 right-4 '>
                        <button
                          onClick={() => {
                            setPostVideo("");
                            setVideoProcess(false);
                            setVideoFile(null);
                            setUploadProgress(0);
                          }}
                          className='bg-red-500 group hover:bg-red-700  rounded-full w-10 h-10 drop-shadow-lg flex items-center justify-center'>
                          <BsTrash size={24} className='text-white' />
                        </button>
                      </div>
                    </div>
                  ) : null}

                  {showLinkField ? (
                    <div className='mt-4'>
                      <input
                        onChange={handleEmbedLink}
                        value={postLink}
                        className={`focus:ring-0 focus:outline-none outline-none darkenBg darkenHoverBg border dark:border-[#2D2D33] hover:dark:border-[#43434d] border-gray-200 hover:border-gray-200 resize-none w-full heading px-4 py-2 rounded-md`}
                        placeholder='Embed Youtube, Vimeo, TikTok, Giphy, Spotify, Mousai, or SoundCloud'
                      />
                    </div>
                  ) : null}
                  {postEmbedLink !== "" && postEmbedLink !== null ? (
                    <div className='mt-2 embed-container w-full flex flex-row items-center justify-center rounded-xl overflow-hidden'>
                      <iframe
                        id='embed-iframe'
                        className='w-full flex-shrink-0'
                        height={getEmbedHeight(postEmbedLink)}
                        style={{ maxWidth: getEmbedWidth(postEmbedLink) }}
                        src={postEmbedLink}
                        frameBorder='0'
                        allow='picture-in-picture; clipboard-write; encrypted-media; gyroscope; accelerometer; encrypted-media;'
                        allowFullScreen></iframe>
                    </div>
                  ) : null}
                </div>
                <div className='space-y-4'>
                  {!isVideoReady && postVideo !== "" && (
                    <>
                      <div className='flex mt-4 space-x-2 items-center'>
                        <Loader className='w-5 h-5' />{" "}
                        <span>Processing Video</span>
                      </div>
                    </>
                  )}
                  {/* !isVideoReady && postVideo === '' &&  */}
                  {!isVideoReady && postVideo === "" && uploadProgress > 0 && (
                    <ProgressBar
                      bgcolor='#ff00ff'
                      progress={uploadProgress}
                      height={24}
                    />
                  )}
                </div>
                <div className='flex items-center mt-2 justify-between w-full'>
                  <div className='flex items-center space-x-4 my-2 px-2'>
                    <div>
                      <Tippy content='Add Image' placement='bottom'>
                        <button onClick={() => handleImage()}>
                          {uploadingImage ? (
                            <Loader className='w-5 h-5' />
                          ) : (
                            <BiImageAdd size={21} className='text-gray-500' />
                          )}
                        </button>
                      </Tippy>
                    </div>
                    <div>
                      <input
                        ref={inputFileRef}
                        type='file'
                        className='hidden'
                        name='video'
                        onChange={handleFileChange}
                      />
                      <Tippy content='Add Video' placement='bottom'>
                        <button onClick={() => handleVideo()}>
                          <BiVideoPlus size={21} className='text-gray-500' />
                        </button>
                      </Tippy>
                    </div>
                    <div>
                      <Tippy content='Add Embed' placement='bottom'>
                        <button onClick={() => setShowLinkField(true)}>
                          <ImEmbed2 size={21} className='text-gray-500' />
                        </button>
                      </Tippy>
                    </div>
                    <div className='relative'>
                      {/* <EmojiPicker /> */}
                      <Popover className='relative'>
                        {({ open }) => (
                          <>
                            <Popover.Button
                              onClick={() => {
                                setUploadingImage(false);
                                setShowLinkField(false);
                                setIsLoading(false);
                                setShowLinkField(false);
                              }}
                              className={`
                                  ${open ? "" : "text-opacity-90"}
                                  group inline-flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75`}>
                              <BsEmojiSmile
                                size={19}
                                className='text-gray-500'
                              />
                            </Popover.Button>
                            <Transition
                              as={Fragment}
                              enter='transition ease-out duration-200'
                              enterFrom='opacity-0 translate-y-1'
                              enterTo='opacity-100 translate-y-0'
                              leave='transition ease-in duration-150'
                              leaveFrom='opacity-100 translate-y-0'
                              leaveTo='opacity-0 translate-y-1'>
                              <Popover.Panel className='absolute left-1/2 z-20 mt-3 w-screen max-w-sm -translate-x-1/2 transform'>
                                <EmojiPicker
                                  emojiStyle='twitter'
                                  onEmojiClick={setEmoji}
                                />
                              </Popover.Panel>
                            </Transition>
                          </>
                        )}
                      </Popover>
                    </div>
                  </div>
                  <div className='flex w-full justify-end'>
                    <button
                      onClick={(e) => submitPost(e)}
                      className={`buttonBG dark:text-white flex items-center ${
                        isLoading ? "px-4" : "px-8"
                      } py-2 rounded-full`}>
                      {isLoading && <Loader className='mr-2 w-5 h-5' />}{" "}
                      <span>Post</span>
                    </button>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>
        {/* <p className='secondaryTextColor mx-20'>{`Posting on ${circleName}`}</p> */}
      </div>
    </>
  );
}
