import React, { Fragment, useEffect, useRef, useState } from "react";
import {
  BiImageAdd,
  BiVideoPlus,
  BiSlider,
  BiQuestionMark,
} from "react-icons/bi";

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
import { IoDiamondOutline } from "react-icons/io5";
import { useDetectClickOutside } from "react-detect-click-outside";

export const getAttachmentsClass = (attachments, isNew = false) => {
  if (attachments === 1) {
    return {
      aspect: isNew ? "aspect-w-16 aspect-h-10" : "",
      row: "grid-cols-1 grid-rows-1",
    };
  } else if (attachments === 2) {
    return {
      aspect: "aspect-w-16 aspect-h-12",
      row: "grid-cols-2 grid-rows-1",
    };
  } else if (attachments > 2) {
    return {
      aspect: "aspect-w-16 aspect-h-12",
      row: "grid-cols-2 grid-rows-2",
    };
  }
};

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

  const [postConfigure, setPostConfigure] = useState(true);
  const [diamondLevelToGateWith, setDiamondLevelToGateWith] = useState(1);
  const [isDropdowExpanded, setIsDropdownExpanded] = useState(false);
  const videoStreamInterval = null;
  const inputFileRef = useRef(null);
  const [enableDiamondGate, setEnableDiamondGate] = useState(false);
  const closeModal = () => {
    setIsDropdownExpanded(false);
  };
  const ref = useDetectClickOutside({ onTriggered: closeModal });

  const diamondLevelsMap = [
    { value: 1, label: "$0.005" },
    { value: 2, label: "$0.01" },
    { value: 3, label: "$0.04" },
    { value: 4, label: "$0.4" },
    { value: 5, label: "$4" },
    { value: 6, label: "$40" },
  ];
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
      let body = "";
      let payload = {
        Title: postTitle,
      };
      let extraBody = `Posted on @CircleIt${
        circle.Username !== "CircleIt" ? " in @" + circle.Username : ""
      }`;

      if (enableDiamondGate) {
        const ContentToEncrypt = JSON.stringify({
          content: postBody,
          image: postImageList,
          dimaondLevel: diamondLevelToGateWith,
          postVideo: postVideo,
        });
        const requestPayload = {
          content: ContentToEncrypt,
        };
        const requestURL = "https://itsaditya.live/encrypt-diamond-gated-content";
        const encryptedResponse = await fetch(requestURL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestPayload),
        });
        const data = await encryptedResponse.json();
        if (data.status) {
          const encryptedBody = data.response;
          let diamondString = `💎💎💎💎💎💎`.slice(
            0,
            parseInt(diamondLevelToGateWith) * 2
          );
          body = `This Post is Gated by ${diamondString} diamond${
            diamondLevelToGateWith > 1 ? "s" : ""
          } using @CircleIt`;

          if (postTitle.trim().length > 0) {
            body += `\nTitle: ${postTitle}`;
          }

          const request = {
            UpdaterPublicKeyBase58Check: user.profile.PublicKeyBase58Check,
            BodyObj: {
              Body: body,
              VideoURLs: [],
              ImageURLs: [],
            },
            PostExtraData: {
              EmbedVideoURL: postEmbedLink,
              CircleIt: JSON.stringify(payload),
              CircleUsername: circle.Username,
              CirclePublicKey: circle.PublicKeyBase58Check,
              gatedDiamondLevel: `${parseInt(diamondLevelToGateWith)}`,
              isGatedWithDiamondOnCircleIt: `${enableDiamondGate}`,
              EncryptedData: encryptedBody,
            },
          };
          const response2 = await deso.posts.submitPost(request);

          //editing the post to add circleItPostLink
          const createdPostHashHex =
            response2.submittedTransactionResponse.PostEntryResponse
              .PostHashHex;
          if (!createdPostHashHex) {
            toast.error("Something went wrong. Please try again later");
            return;
          }
          // make a delay of 2 seconds bcz deso will rip the post lol
          await new Promise((r) => setTimeout(r, 2000));
          const EditpostRequest = {
            UpdaterPublicKeyBase58Check: user.profile.PublicKeyBase58Check,
            BodyObj: {
              Body: `${body}\n\nView at circleit.app/circle/${circle.Username}/${createdPostHashHex}\n\n${extraBody}`,
              VideoURLs: [],
              ImageURLs: [],
            },
            PostExtraData: {
              EmbedVideoURL: postEmbedLink,
              CircleIt: JSON.stringify(payload),
              CircleUsername: circle.Username,
              CirclePublicKey: circle.PublicKeyBase58Check,
              gatedDiamondLevel: `${parseInt(diamondLevelToGateWith)}`,
              isGatedWithDiamondOnCircleIt: `${enableDiamondGate}`,
              EncryptedData: encryptedBody,
            },
            PostHashHexToModify: createdPostHashHex,
          };
          const response3 = await deso.posts.submitPost(EditpostRequest);
          if (response3) {
            setPostBody("");
            setPostImageList([]);
            setPostVideo("");
            setPostEmbedLink("");
            setPostTitle("");
            toast.success("Congratulations! Post Created.");
          }
        } else {
          toast.error("Something went wrong. Please try again later.");
          setIsLoading(false);
          return;
        }
      } else {
        body =
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
            gatedDiamondLevel: `${parseInt(diamondLevelToGateWith)}`,
            isGatedWithDiamondOnCircleIt: `${enableDiamondGate}`,
          },
        };
        const submitPostRes = await deso.posts.submitPost(request);
        if (submitPostRes) {
          setPostBody("");
          setPostImageList([]);
          setPostVideo("");
          setPostEmbedLink("");
          setPostTitle("");
          toast.success("Congratulations! Post Created.");
        }
      }
    } catch (error) {
      console.log(error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
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
                  isExpanded ? "rounded-md" : "rounded-md sm:rounded-full"
                }`}
                placeholder={`${
                  !isExpanded ? "Create Post" : "Title (optional)"
                }`}
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

                  {/* Show only when user is configuring post...*/}
                  {postConfigure && (
                    <div className='flex space-x-3 items-center mt-1'>
                      <div className='flex items-center space-x-1'>
                        <input
                          type='checkbox'
                          checked={enableDiamondGate}
                          onChange={() =>
                            setEnableDiamondGate(!enableDiamondGate)
                          }
                          className=' dark:border-[#2d2d33] hover:dark:border-[#43434d] border-gray-200 hover:border-gray-200 active:border-none'
                        />
                        <div className='flex items-center space-x-1'>
                          <p className='text-xs text-gray-400'>Diamond Gate</p>
                          <Tippy
                            content='When you gate your content with diamonds, the viewer has to give diamond first in order to view your content. Title remains visible to everyone. You can set number of dimonds to gate with between 1-6'
                            placement='bottom'>
                            <span>
                              <BiQuestionMark
                                size={16}
                                className='text-gray-200 bg-gray-700 rounded-full'
                              />
                            </span>
                          </Tippy>
                        </div>
                      </div>
                      <div ref={ref}>
                        <button
                          className='flex space-x-1 items-center text-sm pl-1 rounded-md hover:bg-gray-200 p-1 hover:bg-opacity-20'
                          onClick={() => {
                            setIsDropdownExpanded(!isDropdowExpanded);
                          }}>
                          <span className='text-gray-400'>
                            {diamondLevelToGateWith == 1
                              ? "1 Diamond"
                              : `${diamondLevelToGateWith} Diamonds`}
                          </span>
                          <span className='flex ml-2 lightText'>
                            <IoDiamondOutline
                              size={16}
                              className='text-blue-500'
                            />
                          </span>
                          <svg
                            xmlns='http://www.w3.org/2000/svg'
                            viewBox='0 0 20 20'
                            fill='currentColor'
                            className='w-5 h-5 dark:text-white'>
                            <path
                              d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z'
                              clipRule='evenodd'></path>
                          </svg>
                        </button>
                        <div
                          className={` ${
                            isDropdowExpanded ? "flex" : "hidden"
                          } absolute  drop-shadow-xl  flex-col rounded-md primaryBg border divide-y theme-divider darkenBorder mt-2 px-3 py-2 min-w-[280px] left-1/3 md:left-auto`}
                          style={{
                            zIndex: 100,
                          }}>
                          <span className='text-sm lightText flex items-center '>
                            Select Diamond Level to gate with{" "}
                            <IoDiamondOutline
                              size={14}
                              className='text-blue-500 ml-1'
                            />
                          </span>

                          <div className='flex flex-col pt-1  '>
                            {diamondLevelsMap.map((diamond, index) => {
                              return (
                                <button
                                  className='flex items-center space-x-1  primaryBg lightText   hover:bg-gray-100 py-3 px-1 rounded-md dark:hover:bg-gray-800'
                                  key={index}
                                  onClick={() => {
                                    setDiamondLevelToGateWith(diamond.value);
                                    setIsDropdownExpanded(false);
                                  }}>
                                  <span className='text-xs flex items-center'>
                                    {
                                      //loop diamond.value times
                                      [...Array(diamond.value)].map((e, i) => (
                                        <IoDiamondOutline
                                          size={14}
                                          className='text-blue-500'
                                        />
                                      ))
                                    }
                                    <span className='ml-1'>
                                      {" "}
                                      {diamond.label}
                                    </span>
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {postImageList.length > 0 ? (
                    <>
                      <div
                        className={`${
                          getAttachmentsClass(postImageList.length).row
                        } grid gap-2 pt-3`}>
                        {postImageList.map((image, index) => (
                          <div
                            key={index}
                            className={`relative ${
                              getAttachmentsClass(postImageList.length).aspect
                            } ${
                              postImageList?.length === 3 && index === 0
                                ? ""
                                : ""
                            }`}>
                            <div className='container'>
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
                      </div>
                    </>
                  ) : null}

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
                    <>
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
                    </>
                  ) : null}
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
                    {!isVideoReady &&
                      postVideo === "" &&
                      uploadProgress > 0 && (
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
                    <div className='flex w-full justify-end space-x-2'>
                      <Tippy content='Configure Post' placement='bottom'>
                        <button
                          onClick={() => setPostConfigure(!postConfigure)}>
                          <BiSlider size={21} className='text-gray-500' />
                        </button>
                      </Tippy>
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
              </>
            ) : null}
          </div>
        </div>
        {/* <p className='secondaryTextColor mx-20'>{`Posting on ${circleName}`}</p> */}
      </div>
    </>
  );
}
