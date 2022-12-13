import React from "react";
import { useState } from "react";
import { DESO_CONFIG, NODE_URL } from "../../utils/Constants";
import { BiUpload, BiX } from "react-icons/bi";
import useApp from "../../store/app";
import Deso from "deso-protocol";
import { Loader } from "../../utils/Loader";
import toast from "react-hot-toast";

export default function ProfileForm(user) {
  const profileExtraInfo = {};
  const { setUser } = useApp((state) => state);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [telegramURL, setTelegramURL] = useState("");
  const [twitterURL, setTwitterURL] = useState("");
  const [websiteURL, setWebsiteURL] = useState("");
  const [instagramURL, setInstagramURL] = useState("");
  const [githubURL, setGithubURL] = useState("");
  const [linkedinURL, setLinkedinURL] = useState("");
  const [profileDescription, setProfileDescription] = useState("");
  const [profileImage, setProfileImage] = useState(
    "https://wallpaperaccess.com/full/1760835.jpg"
  );
  const bannerURL =
    profileExtraInfo && profileExtraInfo.FeaturedImageURL !== ""
      ? profileExtraInfo.FeaturedImageURL
      : "https://wallpaperaccess.com/full/1760835.jpg";

  const updateProfile = async () => {
    const deso = new Deso(DESO_CONFIG);
    setLoading(true);
    const profile = {
      UpdaterPublicKeyBase58Check: user.profile.PublicKeyBase58Check,
      NewUsername: username,
      NewDescription: profileDescription,
      //NewProfilePic: profileImage,
      ExtraData: {
        NewProfilePic: profileImage,
        DisplayName: displayName,
        TelegramURL: telegramURL,
        TwitterURL: twitterURL,
        WebsiteURL: websiteURL,
        InstagramURL: instagramURL,
        GithubURL: githubURL,
        LinkedinURL: linkedinURL,
        FeaturedImageURL: profileExtraInfo.FeaturedImageURL,
        LargeProfilePicURL: profileExtraInfo.LargeProfilePicURL,
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
    <div className='flex   mx-auto relative justify-center items-start w-full'>
      <div className='flex mx-auto  w-full space-y-6 md:flex-row md:space-x-10 md:space-y-0'>
        <div className='flex mx-auto flex-col w-full md:w-3/4 secondaryBg border secondaryBorder rounded-xl p-4'>
          <div
            style={{
              backgroundImage: `url(${bannerURL})`,
              backgroundPosition: "center",
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
            }}
            className='rounded-lg w-full h-48 md:h-64 relative flex justify-center items-center dark:border-[#2D2D33] border-gray-100 border '>
            <div className='flex w-full h-64 justify-center items-center relative group z-10'>
              <div className='group-hover:flex hidden items-center space-x-3'>
                <button className='bg-white/[.7] rounded-full px-2 py-2 hover:bg-white/[.9]'>
                  <BiUpload size={24} />
                </button>
                <button className='bg-white/[.7] rounded-full px-2 py-2 hover:bg-white/[.9]'>
                  <BiX size={24} />
                </button>
              </div>
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
                <button className='bg-white/[.7] hidden group-hover:flex rounded-full px-2 py-2 hover:bg-white/[.9]'>
                  <BiUpload size={24} />
                </button>
              </div>
            </div>
          </div>
          <div className='flex flex-col mt-10 pt-5 w-full space-y-4'>
            <div className='w-full md:w-3/5'>
              <p className='font-semibold mb-2 primaryTextColor'>Username</p>
              <input
                type='text'
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder='GavinBelson'
                className='search rounded-full darkenBg darkenBorder border darkenHoverBg px-3 py-2 w-full outline-none focus:shadow transition delay-50 placeholder:text-gray-400 dark:placeholder:text-gray-500'
              />
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
              <button
                onClick={() => updateProfile()}
                className={`flex items-center justify-center space-x-2 font-medium text-white px-6 py-3 leading-none rounded-full buttonBG my-2 ${
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
