import React from "react";
import { useState } from "react";
import { DESO_CONFIG, NODE_URL } from "../../utils/Constants";
import { BiUpload, BiX } from "react-icons/bi";
import useApp from "../../store/app";
import Deso from "deso-protocol";
import { Loader } from "../../utils/Loader";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import party from "party-js";
import { getBase64FromFile } from "../../utils/Functions";

export default function ProfileForm({ desoObj, publicKey, rootRef }) {
  const profileExtraInfo = {};
  const navigate = useNavigate();
  const { user, setUser, setLoggedIn } = useApp();
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [profileDescription, setProfileDescription] = useState("");
  const [profileImage, setProfileImage] = useState(
    "https://node.deso.org/assets/img/default_profile_pic.png"
  );
  const [bannerURL, setBannerURL] = useState("");
  console.log(user);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [isUploadingProfilePic, setIsUploadingProfilePic] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState(false);
  const [base68Image, setBase64Image] = useState("");

  const fileInput = React.useRef(null);
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
    const deso = new Deso(DESO_CONFIG);
    setLoading(true);
    const profile = {
      UpdaterPublicKeyBase58Check: user.profile.PublicKeyBase58Check,
      NewUsername: username,
      NewDescription: profileDescription,
      NewProfilePic: base68Image,
      ExtraData: {
        DisplayName: "",
        TelegramURL: "",
        TwitterURL: "",
        WebsiteURL: "",
        InstagramURL: "",
        GithubURL: "",
        LinkedinURL: "",
        FeaturedImageURL: bannerURL,
        LargeProfilePicURL: profileImage,
      },
      NewStakeMultipleBasisPoints: 12500,
      MinFeeRateNanosPerKB: 1000,
      NewCreatorBasisPoints: 10000,
    };
    try {
      const response = await deso.social.updateProfile(profile);
      if (response.TransactionHex !== undefined) {
        try {
          const profile = await deso.user.getSingleProfile({
            PublicKeyBase58Check: user.profile.PublicKeyBase58Check,
          });
          if (profile && typeof profile.Profile !== "undefined") {
            console.log("hell yeah, profile updated");
            setUser({ profile: profile.Profile });
            setLoading(false);
            party.confetti(rootRef.current, {
              count: party.variation.range(100, 2000),
              size: party.variation.range(0.5, 2.0),
            });
            setLoggedIn(true);
            //await for 1 seconds
            await new Promise((resolve) => setTimeout(resolve, 2000));
            navigate("/");
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
    <div className='flex   mx-auto  justify-center items-start w-full md:w-2/3 mb-24'>
      <div className='flex mx-auto  w-full space-y-6 md:flex-row md:space-x-10 md:space-y-0'>
        <div className='flex mx-auto flex-col w-full md:w-3/4 secondaryBg border secondaryBorder rounded-xl p-4'>
          <div
            style={{
              backgroundImage: `url(${bannerURL})`,
              backgroundPosition: "center",
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
            }}
            className='rounded-lg w-full h-40 md:h-64 relative flex justify-center items-center dark:border-[#2D2D33] border-gray-100 border z-20 '>
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
            <div className='flex  -bottom-12 left-auto absolute items-center'>
              <div
                className='w-24 h-24 my-2 group rounded-full relative z-20 flex items-center justify-center dark:border-[#2D2D33] border-white border-4'
                id='profilePicOnSignUp'
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
          <div className='flex flex-col mt-10 pt-5 w-full space-y-4 items-center'>
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
            {/* <div className='w-full md:w-3/5'>
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
            </div> */}
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

            <div className='mx-auto'>
              <button
                onClick={() => updateProfile()}
                className={` ${
                  !(username != "" && isUsernameAvailable) &&
                  "cursor-not-allowed"
                } flex items-center justify-center space-x-2 font-medium text-white px-6 py-3 leading-none rounded-full buttonBG my-2 ${
                  loading ? "cursor-not-allowed bg-opacity-50" : ""
                }`}>
                {loading && <Loader className='w-3.5 h-3.5' />}
                <span>Create Profile</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
