import React from "react";
import { useState } from "react";
import Deso from "deso-protocol";
import { BiUpload, BiX } from "react-icons/bi";
import { DESO_CONFIG, NODE_URL } from "../../../utils/Constants";
import { Loader } from "../../../utils/Loader";
import toast from "react-hot-toast";
import useApp from "../../../store/app";
export default function Verification({ user, sidebar }) {
  const profileExtraDataJson = JSON.parse(user.profile.ExtraData.CircleIt);
  const { setUser } = useApp((state) => state);
  const [searchPrefix, setSearchPrefix] = useState("");
  const [loading, setLoading] = useState(false);
  const [listOfSearchedProfiles, setListOfSearchedProfiles] = useState([]);
  const [listOfVerifiedUsers, setListOfVerifiedUsers] = useState(
    profileExtraDataJson.VerifiedUsers ? profileExtraDataJson.VerifiedUsers : []
  );
  const [showSearchBox, setShowSearchBox] = useState(false);

  const handleProfileSuggestor = async (e) => {
    let prefix = e.target.value;
    setSearchPrefix(prefix);
    if (prefix.length > 0) {
      const deso = new Deso(DESO_CONFIG);
      const request = {
        PublicKeyBase58Check: "",
        Username: "",
        UsernamePrefix: prefix,
        Description: "",
        OrderBy: "",
        NumToFetch: 20,
        ReaderPublicKeyBase58Check: user.PublicKeyBase58Check,
        ModerationType: "",
        FetchUsersThatHODL: false,
        AddGlobalFeedBool: false,
      };
      try {
        const profiles = await deso.user.getProfiles(request);
        if (profiles && profiles.ProfilesFound !== null) {
          setShowSearchBox(true);
          //setListOfSearchProfiles only top 4 profiles
          setListOfSearchedProfiles(profiles.ProfilesFound.slice(0, 4));
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  const updateProfile = async () => {
    const profileExtraInfo = user.profile.ExtraData;
    let currentExtraData = JSON.parse(profileExtraInfo.CircleIt);
    console.log(currentExtraData);

    const deso = new Deso(DESO_CONFIG);
    setLoading(true);

    const verifiedUser = listOfVerifiedUsers.map((mod) => {
      return {
        PublicKeyBase58Check: mod.PublicKeyBase58Check,
        Username: mod.Username,
      };
    });
    currentExtraData.VerifiedUsers = verifiedUser;

    let CircleItString = JSON.stringify(currentExtraData);

    const profile = {
      UpdaterPublicKeyBase58Check: user.profile.PublicKeyBase58Check,

      //NewProfilePic: profileImage,
      ExtraData: {
        CircleIt: CircleItString,
      },
      NewStakeMultipleBasisPoints: 12500,
      MinFeeRateNanosPerKB: 1000,
      NewCreatorBasisPoints: user.profile.CoinEntry.CreatorBasisPoints,
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
          setLoading(false);
        }
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className='flex md:mt-6 flex-col w-full space-y-6 space-x-0 md:flex-row md:space-x-10 md:space-y-0'>
      <div className='flex flex-col w-full md:w-1/4'>{sidebar}</div>
      <div className='flex flex-col justify-start items-start my-4 mx-2 space-y-2 secondaryBg border secondaryBorder rounded-xl p-4 w-full md:w-3/4'>
        <div className='w-full md:w-3/5'>
          <p className='font-semibold mb-2 primaryTextColor'>
            Verified Users. All verified users get green tick in your circle
          </p>
          <input
            type='text'
            placeholder='Search Users to add as moderators'
            value={searchPrefix}
            className='search rounded-full darkenBg darkenBorder border darkenHoverBg  px-3 py-2 w-full outline-none focus:shadow transition delay-50 placeholder:text-gray-400 dark:placeholder:text-gray-500'
            onChange={handleProfileSuggestor}
          />
          {showSearchBox && (
            <div className='flex flex-col rounded-xl darkenBg border divide-y theme-divider py-2 darkenBorder mt-4'>
              {listOfSearchedProfiles.map((profile, index) => (
                <button
                  className='flex space-x-2 items-center darkenHoverBg darkenBg py-2 px-2'
                  key={index}
                  onClick={() => {
                    setListOfVerifiedUsers([...listOfVerifiedUsers, profile]);
                    setListOfSearchedProfiles([]);
                    setSearchPrefix("");
                    setShowSearchBox(false);
                  }}>
                  <img
                    src={`${NODE_URL}/get-single-profile-picture/${profile.PublicKeyBase58Check}?fallback=https://diamondapp.com/assets/img/default_profile_pic.png`}
                    className='rounded-full subHeader w-10 h-10'
                    alt={profile.Username}
                  />
                  <div className='flex flex-col'>
                    <p className='extralightText'>{profile.Username}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
          <div className='flex my-2 w-full md:w-3/4 flex-auto flex-wrap'>
            {listOfVerifiedUsers.map((profile, index) => (
              <div
                className='bg-blue-100 dark:bg-[#212126] rounded-full pl-5 pr-3 py-2  mx-1 my-1 flex space-x-1 items-center'
                key={index}>
                <img
                  src={`${NODE_URL}/get-single-profile-picture/${profile.PublicKeyBase58Check}?fallback=https://diamondapp.com/assets/img/default_profile_pic.png`}
                  className='rounded-full subHeader w-6 h-6'
                  alt={profile.Username}
                />
                <div className='flex flex-col'>
                  <p className='extralightText'>{profile.Username}</p>
                </div>
                <button
                  className='rounded-full text-red-500 hover:text-red-700'
                  onClick={() =>
                    setListOfVerifiedUsers(
                      listOfVerifiedUsers.filter(
                        (p) =>
                          p.PublicKeyBase58Check !==
                          profile.PublicKeyBase58Check
                      )
                    )
                  }>
                  {" "}
                  <BiX size={20} />
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className='flex items-center '>
          <button
            onClick={() => updateProfile()}
            className={`flex items-center justify-center space-x-2 font-medium text-white px-6 py-3 leading-none rounded-full buttonBG my-2 ${
              loading ? "cursor-not-allowed bg-opacity-50" : ""
            }`}>
            {loading && <Loader className='w-3.5 h-3.5' />}
            <span>Save Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
}
