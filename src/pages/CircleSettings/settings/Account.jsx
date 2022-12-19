import React from "react";
import { useState, useRef } from "react";
import { DESO_CONFIG, NODE_URL } from "../../../utils/Constants";
import { BiUpload, BiX } from "react-icons/bi";
import useApp from "../../../store/app";
import Deso from "deso-protocol";
import { Loader } from "../../../utils/Loader";
import toast from "react-hot-toast";
import { getBase64FromFile } from "../../../utils/Functions";
export default function Account({ user, sidebar, desoObj, rootRef }) {
  const profileExtraInfo = user.profile.ExtraData;
  const { setUser } = useApp((state) => state);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState(user.profile.Username);
  const [displayName, setDisplayName] = useState(
    profileExtraInfo && profileExtraInfo.DisplayName
      ? profileExtraInfo.DisplayName
      : ""
  );
  const [telegramURL, setTelegramURL] = useState(
    profileExtraInfo && profileExtraInfo.TelegramURL
      ? profileExtraInfo.TelegramURL
      : ""
  );
  const [twitterURL, setTwitterURL] = useState(
    profileExtraInfo && profileExtraInfo.TwitterURL
      ? profileExtraInfo.TwitterURL
      : ""
  );
  const [websiteURL, setWebsiteURL] = useState(
    profileExtraInfo && profileExtraInfo.WebsiteURL
      ? profileExtraInfo.WebsiteURL
      : ""
  );
  const [instagramURL, setInstagramURL] = useState(
    profileExtraInfo && profileExtraInfo.InstagramURL
      ? profileExtraInfo.InstagramURL
      : ""
  );
  const [githubURL, setGithubURL] = useState(
    profileExtraInfo && profileExtraInfo.GithubURL
      ? profileExtraInfo.GithubURL
      : ""
  );
  const [linkedinURL, setLinkedinURL] = useState(
    profileExtraInfo && profileExtraInfo.LinkedinURL
      ? profileExtraInfo.LinkedinURL
      : ""
  );
  const [profileDescription, setProfileDescription] = useState(
    user.profile.Description
  );
  const [profileImage, setProfileImage] = useState(
    profileExtraInfo && profileExtraInfo.LargeProfilePicURL
      ? profileExtraInfo.LargeProfilePicURL
      : `${NODE_URL}/get-single-profile-picture/${user.profile.PublicKeyBase58Check}`
  );
  const [bannerURL, setBannerURL] = useState(
    profileExtraInfo && profileExtraInfo.FeaturedImageURL !== ""
      ? profileExtraInfo.FeaturedImageURL
      : "https://wallpaperaccess.com/full/1760835.jpg"
  );
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [isUploadingProfilePic, setIsUploadingProfilePic] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState(true);
  const [base68Image, setBase64Image] = useState("");
  const fileInput = useRef(null);
  const handleUploadBanner = async (e) => {
    setIsUploadingBanner(true);
    try {
      const request = {
        UserPublicKeyBase58Check: user.profile.PublicKeyBase58Check,
      };
      const response = await desoObj.media.uploadImage(request);
      setBannerURL(response.ImageURL);
      setIsUploadingBanner(false);
    } catch (error) {
      console.log(error);
      setIsUploadingBanner(false);
    }
  };

  const handleProfilePicUpload = async (e) => {
    setIsUploadingProfilePic(true);

    const file = e.target.files[0];
    if (file) {
      const fileType = file.type;
      if (
        fileType === "image/png" ||
        fileType === "image/webp" ||
        fileType === "image/jpg" ||
        fileType === "image/jpeg"
      ) {
        handleImageUpload(file);
      }
    }
  };

  const handleImageUpload = async (file) => {
    const request = undefined;
    try {
      const jwt = await desoObj.identity.getJwt(request);

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
        setProfileImage(data.ImageURL);
        const base64imgRes = await getBase64FromFile(file);
        setBase64Image(base64imgRes);
      }
      setIsUploadingProfilePic(false);
    } catch (e) {
      setIsUploadingProfilePic(false);
      console.log(e);
    }
  };

  const handleUsernameChange = async (e) => {
    setUsername(e.target.value);
    setCheckingUsername(true);
    //check if value is only alphanumeric including underscore
    let regex = /^[a-zA-Z0-9_]*$/;
    if (!regex.test(e.target.value)) {
      setIsUsernameAvailable(false);
      setCheckingUsername(false);
      return;
    }
    try {
      const request = {
        PublicKeyBase58Check: "",
        Username: e.target.value,
      };
      try {
        const userFound = await desoObj.user.getSingleProfile(request);

        if (userFound == null) {
          setIsUsernameAvailable(true);
        } else {
          setIsUsernameAvailable(false);
        }
      } catch (error) {
        setIsUsernameAvailable(true);
      }

      setCheckingUsername(false);
    } catch (error) {
      console.log(error);
      setCheckingUsername(false);
    }
  };

  const updateProfile = async () => {
    if (username === "" || !isUsernameAvailable || loading) {
      return;
    }
    setLoading(true);
    const profile = {
      UpdaterPublicKeyBase58Check: user.profile.PublicKeyBase58Check,
      NewUsername: username,
      NewDescription: profileDescription,
      NewProfilePic: base68Image,
      ExtraData: {
        NewProfilePic: profileImage,
        DisplayName: displayName,
        TelegramURL: telegramURL,
        TwitterURL: twitterURL,
        WebsiteURL: websiteURL,
        InstagramURL: instagramURL,
        GithubURL: githubURL,
        LinkedinURL: linkedinURL,
        FeaturedImageURL: bannerURL,
        LargeProfilePicURL: profileImage,
      },
      NewStakeMultipleBasisPoints: 12500,
      MinFeeRateNanosPerKB: 1000,
      NewCreatorBasisPoints: user.profile.CoinEntry.CreatorBasisPoints,
    };
    try {
      const response = await desoObj.social.updateProfile(profile);
      if (response.TransactionHex !== undefined) {
        try {
          const profile = await desoObj.user.getSingleProfile({
            PublicKeyBase58Check: user.profile.PublicKeyBase58Check,
          });
          if (profile && profile.Profile !== undefined) {
            setUser({ profile: profile.Profile });
            setLoading(false);
            toast.success("Profile updated successfully");
          }
        } catch (error) {
          toast.error("Something went wrong");
          console.log(error);
        }
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className='flex flex-col relative justify-center items-start w-full'>
      <div className='flex flex-col w-full space-y-6 md:flex-row md:space-x-10 md:space-y-0'>
        <div className='flex flex-col w-full md:w-1/4'>{sidebar}</div>
        <div className='flex flex-col w-full md:w-3/4 secondaryBg border secondaryBorder rounded-xl p-4'>
          <div
            style={{
              backgroundImage: `url(${bannerURL})`,
              backgroundPosition: "center",
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
            }}
            className='rounded-lg w-full h-48 md:h-64 relative flex justify-center items-center dark:border-[#2D2D33] border-gray-100 border '>
            <div className='flex w-full h-64 justify-center items-center relative group z-10'>
              {!isUploadingBanner ? (
                <div className='group-hover:flex  items-center space-x-3'>
                  <button
                    className='bg-white/[.7] rounded-full px-2 py-2 hover:bg-white/[.9]'
                    onClick={handleUploadBanner}>
                    <BiUpload size={24} />
                  </button>
                  <button
                    className='bg-white/[.7] rounded-full px-2 py-2 hover:bg-white/[.9]'
                    onClick={() => setBannerURL("")}>
                    <BiX size={24} />
                  </button>
                </div>
              ) : (
                <Loader />
              )}
            </div>
            <div className='flex space-x-3 -bottom-12 left-6 absolute items-center'>
              <div
                className='w-24 h-24 my-2 group rounded-full relative z-20 flex items-center justify-center dark:border-[#2D2D33] border-white border-4'
                style={{
                  backgroundImage: `url(${profileImage})`,
                  backgroundPosition: "center",
                  backgroundSize: "cover",
                  backgroundRepeat: "no-repeat",
                }}>
                {!isUploadingProfilePic ? (
                  <button
                    className='bg-white/[.7]  group-hover:flex rounded-full px-2 py-2 hover:bg-white/[.9]'
                    onClick={() => {
                      fileInput.current.click();
                    }}>
                    <input
                      ref={fileInput}
                      type='file'
                      accept='image/*'
                      onChange={handleProfilePicUpload}
                      style={{ display: "none" }}
                    />
                    <BiUpload size={24} />
                  </button>
                ) : (
                  <Loader />
                )}
              </div>
            </div>
          </div>
          <div className='flex flex-col mt-10 pt-5 w-full space-y-4'>
            <div className='w-full md:w-3/5'>
              <p className='font-semibold mb-2 primaryTextColor'>Username</p>
              <input
                type='text'
                value={username}
                onChange={handleUsernameChange}
                placeholder='GavinBelson'
                className='search rounded-full darkenBg darkenBorder border darkenHoverBg px-3 py-2 w-full outline-none focus:shadow transition delay-50 placeholder:text-gray-400 dark:placeholder:text-gray-500'
              />
              {checkingUsername && !isUsernameAvailable && (
                <div className='flex items-center px-4'>
                  <p className='text-xs text-gray-400'>
                    Checking Username Availability{" "}
                  </p>
                  <div className='animate-spin rounded-full h-3 w-3 border-b-2 border-gray-400 ml-1'></div>
                </div>
              )}
              {isUsernameAvailable && !checkingUsername && username != "" && (
                <div className='flex items-center px-4'>
                  <p className='text-sm text-green-500'>
                    Username is available
                  </p>
                </div>
              )}
              {!isUsernameAvailable && !checkingUsername && username != "" && (
                <div className='flex items-center px-4'>
                  <p className='text-sm text-red-500'>
                    Username is not available
                  </p>
                </div>
              )}
            </div>
            <div className='w-full md:w-3/5'>
              <p className='font-semibold mb-2 primaryTextColor'>
                Display Name
              </p>
              <input
                type='text'
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder='Gavin Belson'
                className='search rounded-full darkenBg darkenBorder border darkenHoverBg px-3 py-2 w-full outline-none focus:shadow transition delay-50 placeholder:text-gray-400 dark:placeholder:text-gray-500'
              />
            </div>
            <div className='w-full md:w-3/5'>
              <p className='font-semibold mb-2 primaryTextColor'>Description</p>
              <textarea
                type='text'
                placeholder='CEO OF HOOLI'
                className='search rounded-xl darkenBg darkenBorder border darkenHoverBg h-32 px-3 py-2 w-full outline-none focus:shadow transition delay-50 placeholder:text-gray-400 dark:placeholder:text-gray-500'
                value={profileDescription}
                onChange={(e) =>
                  setProfileDescription(e.target.value)
                }></textarea>
            </div>
            <div className='w-full md:w-3/5'>
              <p className='font-semibold mb-2 primaryTextColor'>Website</p>
              <input
                type='text'
                placeholder='www.hooli.com'
                value={websiteURL}
                onChange={(e) => setWebsiteURL(e.target.value)}
                className='search rounded-full darkenBg darkenBorder border darkenHoverBg px-3 py-2 w-full outline-none focus:shadow transition delay-50 placeholder:text-gray-400 dark:placeholder:text-gray-500'
              />
            </div>
            <div className='w-full md:w-3/5'>
              <p className='font-semibold mb-2 primaryTextColor'>Twitter URL</p>
              <input
                type='text'
                value={twitterURL}
                onChange={(e) => setTwitterURL(e.target.value)}
                placeholder='https://twitter.com/gavinbelson'
                className='search rounded-full darkenBg darkenBorder border darkenHoverBg px-3 py-2 w-full outline-none focus:shadow transition delay-50 placeholder:text-gray-400 dark:placeholder:text-gray-500'
              />
            </div>

            <div className='w-full md:w-3/5'>
              <p className='font-semibold mb-2 primaryTextColor'>
                Instgram URL
              </p>
              <input
                type='text'
                value={instagramURL}
                onChange={(e) => setInstagramURL(e.target.value)}
                placeholder='https://instagram.com/gavinbelson'
                className='search rounded-full darkenBg darkenBorder border darkenHoverBg  px-3 py-2 w-full outline-none focus:shadow transition delay-50 placeholder:text-gray-400 dark:placeholder:text-gray-500'
              />
            </div>
            <div className='w-full md:w-3/5'>
              <p className='font-semibold mb-2 primaryTextColor'>Github URL</p>
              <input
                type='text'
                value={githubURL}
                onChange={(e) => setGithubURL(e.target.value)}
                placeholder='https://github.com/gavinbelson'
                className='search rounded-full darkenBg darkenBorder border darkenHoverBg px-3 py-2 w-full outline-none focus:shadow transition delay-50 placeholder:text-gray-400 dark:placeholder:text-gray-500'
              />
            </div>
            <div className='w-full md:w-3/5'>
              <p className='font-semibold mb-2 primaryTextColor'>
                LinkedIn URL
              </p>
              <input
                type='text'
                value={linkedinURL}
                onChange={(e) => setLinkedinURL(e.target.value)}
                placeholder='https://linkedin.com/gavinbelson'
                className='search rounded-full darkenBg darkenBorder border darkenHoverBg px-3 py-2 w-full outline-none focus:shadow transition delay-50 placeholder:text-gray-400 dark:placeholder:text-gray-500'
              />
            </div>
            <div className='w-full md:w-3/5'>
              <button
                onClick={() => updateProfile()}
                className={`flex items-center justify-center space-x-2 font-medium text-white px-6 py-3 leading-none rounded-full buttonBG my-2 ${
                  loading ? "cursor-not-allowed bg-opacity-50" : ""
                }`}>
                {loading && <Loader className='w-3.5 h-3.5' />}
                <span>Update Profile</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
