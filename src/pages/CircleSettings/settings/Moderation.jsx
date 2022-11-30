import React, { useEffect } from "react";
import { useState } from "react";
import Deso from "deso-protocol";
import useApp from "../../../store/app";
import { DESO_CONFIG, NODE_URL } from "../../../utils/Constants";
import { Loader } from "../../../utils/Loader";
import toast from "react-hot-toast";
import { BiX } from "react-icons/bi";

export default function Moderation({ user, sidebar }) {
  const [profileExtraDataJson, setPorfileExtraDataJson] = useState(JSON.parse(typeof user.profile.ExtraData.CircleIt !== "undefined"? user.profile.ExtraData.CircleIt: "{}"));
  const { setUser } = useApp((state) => state);
  const [circleGuidelines, setCircleGuidelines] = useState(profileExtraDataJson? typeof profileExtraDataJson.CircleGuidelines !== "undefined"? profileExtraDataJson.CircleGuidelines: "": "");
  const [bannedWordList, setBannedWordList] = useState(profileExtraDataJson? typeof profileExtraDataJson.BannedWords !== "undefined"? profileExtraDataJson.BannedWords: []: []);
  const [currentBannedWord, setCurrentBannedWord] = useState("");
  const [listOfSearchedProfiles, setListOfSearchedProfiles] = useState([]);
  const [searchPrefix, setSearchPrefix] = useState("");
  const [listOfModerators, setListOfModerators] = useState(profileExtraDataJson? profileExtraDataJson.Mods !== "undefined"? profileExtraDataJson.Mods: []: []);
  const [showSearchBox, setShowSearchBox] = useState(false);

  const [currentTagWord, setCurrentTagWord] = useState("");
  const [tagWordList, setTagWordList] = useState(profileExtraDataJson? typeof profileExtraDataJson.PostTags !== "undefined"? profileExtraDataJson.PostTags: []: []);
  const [loading, setLoading] = useState(false);

  const handleBannedWordChange = (e) => {
    if (e.target.value !== "" && (e.keyCode === 32 || e.key === "Enter")) {
      setCurrentBannedWord("");
      setBannedWordList([...bannedWordList, e.target.value.replace(/\s/g, "")]); //removing all space
    } else {
      setCurrentBannedWord(e.target.value);
    }
  };

  const handleTagChange = (e) => {
    if (e.target.value !== "" && (e.keyCode === 32 || e.key === "Enter")) {
      setCurrentTagWord("");
      setTagWordList([...tagWordList, e.target.value.replace(/\s/g, "")]); //removing all space
    } else {
      setCurrentTagWord(e.target.value);
    }
  };

  useEffect(() => {
    const getData = setTimeout(async() => {
      if (searchPrefix.length > 0) {
        const deso = new Deso(DESO_CONFIG);
        const request = {
          PublicKeyBase58Check: "",
          Username: "",
          UsernamePrefix: searchPrefix,
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
      } else {
        setShowSearchBox(false);
      }
    }, 700)
    return () => clearTimeout(getData)
  }, [searchPrefix])

  const updateProfile = async () => {
    const profileExtraInfo = user.profile.ExtraData;
    let currentExtraData = JSON.parse(profileExtraInfo.CircleIt);

    const deso = new Deso(DESO_CONFIG);
    setLoading(true);
    // only store publicKey and username from listOfModerators in currentExtraData.Mods
    const mods = listOfModerators?.map((mod) => {
      return {
        PublicKeyBase58Check: mod.PublicKeyBase58Check,
        Username: mod.Username,
      };
    });
    currentExtraData.Mods = mods;
    currentExtraData.BannedWords = bannedWordList;
    currentExtraData.PostTags = tagWordList;
    currentExtraData.CircleGuidelines = circleGuidelines;

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
      <div className='flex flex-col justify-start items-start my-4 mx-2 space-y-2  secondaryBg border secondaryBorder rounded-xl p-4 w-full md:w-3/4'>
        <div className='w-full md:w-3/5'>
          <p className='font-semibold mb-2 primaryTextColor'>
            Circle Guidelines
          </p>
          <textarea
            type='text'
            placeholder='Your Circle Guidelines which each member must follow'
            className='search rounded-xl darkenBg darkenBorder border darkenHoverBg h-32 px-3 py-2 w-full outline-none focus:shadow transition delay-50 placeholder:text-gray-400 dark:placeholder:text-gray-500'
            value={circleGuidelines}
            onChange={(e) => setCircleGuidelines(e.target.value)}></textarea>
        </div>
        <div className='w-full md:w-3/5'>
          <p className='font-semibold mb-2 primaryTextColor'>Banned Words</p>
          <input
            type='text'
            placeholder='Add space separated banned words'
            value={currentBannedWord}
            onChange={handleBannedWordChange}
            onKeyDown={handleBannedWordChange}
            className='search rounded-full darkenBg darkenBorder border darkenHoverBg  px-3 py-2 w-full outline-none focus:shadow transition delay-50 placeholder:text-gray-400 dark:placeholder:text-gray-500'></input>

          <div className='flex my-2 w-full md:w-3/4 flex-auto flex-wrap'>
            {bannedWordList && bannedWordList.length > 0 && bannedWordList?.map((word, index) => (
              <div
                className='bg-blue-100 dark:bg-[#212126] rounded-full pl-5 pr-3 py-1 mx-1 my-1 flex space-x-1 items-center'
                key={index}>
                <p className='text-blue-500 dark:text-gray-100'>{word}</p>
                <button
                  className=' text-red-500 hover:text-red-700'
                  onClick={() =>
                    setBannedWordList(bannedWordList.filter((w) => w !== word))
                  }>
                  {" "}
                  <BiX size={20} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className='w-full md:w-3/5'>
          <p className='font-semibold mb-2 primaryTextColor'>Moderators</p>
          <input
            type='text'
            placeholder='Search Users to add as moderators'
            value={searchPrefix}
            className='search rounded-full darkenBg darkenBorder border darkenHoverBg  px-3 py-2 w-full outline-none focus:shadow transition delay-50 ring-1 placeholder:text-gray-400 dark:placeholder:text-gray-500'
            onChange={(e) => setSearchPrefix(e.target.value)}
          />

          {showSearchBox && (
            <div className='flex flex-col rounded-xl darkenBg border divide-y py-2 theme-divider darkenBorder mt-4'>
              {listOfSearchedProfiles.map((profile, index) => (
                <button
                  className='flex space-x-2 items-center darkenHoverBg darkenBg py-2 px-2'
                  key={index}
                  onClick={() => {
                    setListOfModerators([...listOfModerators, profile]);
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
            {listOfModerators && listOfModerators.length > 0 && listOfModerators.map((profile, index) => (
              <div
                className='bg-blue-100 dark:bg-[#212126]  rounded-full pl-5 pr-3 py-2  mx-1 my-1 flex space-x-1 items-center'
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
                    setListOfModerators(
                      listOfModerators.filter(
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
        <div className='w-full md:w-3/5'>
          <p className='font-semibold mb-2 primaryTextColor'>Post Tags</p>
          <input
            type='text'
            placeholder='Add tags for posts in community'
            value={currentTagWord}
            onChange={handleTagChange}
            onKeyDown={handleTagChange}
            className='search rounded-full darkenBg darkenBorder border darkenHoverBg  px-3 py-2 w-full outline-none focus:shadow transition delay-50 placeholder:text-gray-400 dark:placeholder:text-gray-500'></input>

          <div className='flex my-2 w-3/4 flex-auto flex-wrap'>
            {tagWordList && tagWordList.length > 0 && tagWordList.map((word, index) => (
              <div
                className='bg-blue-100 dark:bg-[#212126] rounded-full pl-5 pr-3 py-2  mx-1 my-1 flex space-x-1'
                key={index}>
                <p className='text-blue-500 dark:text-gray-100'>{word}</p>
                <button
                  className=' text-red-500 hover:text-red-700'
                  onClick={() =>
                    setTagWordList(tagWordList.filter((w) => w !== word))
                  }>
                  {" "}
                  <BiX size={20} />
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className='flex items-center justify-center'>
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
