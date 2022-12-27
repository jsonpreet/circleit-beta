import React from "react";
import { useState } from "react";
import { Loader } from "../../utils/Loader";
import { useDetectClickOutside } from "react-detect-click-outside";
export default function FeedChanger({
  userPublicKey,
  desoObj,
  handleFeedChange,
  feedUser,
}) {
  let initialSearchResult = [
    {
      Username: "My Feed",
      PublicKeyBase58Check: userPublicKey,
    },
    {
      Username: "Nader",
      PublicKeyBase58Check:
        "BC1YLhyuDGeWVgHmh3UQEoKstda525T1LnonYWURBdpgWbFBfRuntP5",
    },
    {
      Username: "ItsAditya",
      PublicKeyBase58Check:
        "BC1YLhBLE1834FBJbQ9JU23JbPanNYMkUsdpJZrFVqNGsCe7YadYiUg",
    },

    {
      Username: "WhaleSharkETH",
      PublicKeyBase58Check:
        "BC1YLi2r4Kn2vDb2ThCrbtG3cASKYnzqAvyv2qwCshbS3NojYxQNudp",
    },
  ];
  //remove duplicates from initialSearchResult

  const uniqueSearchResults = initialSearchResult.filter(
    (thing, index, self) =>
      index ===
      self.findIndex(
        (t) => t.PublicKeyBase58Check === thing.PublicKeyBase58Check
      )
  );

  const [browseFeedSearchResult, setBrowseFeedSearchResult] =
    useState(uniqueSearchResults);
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  React.useEffect(() => {
    const getData = setTimeout(async () => {
      if (query.length > 0) {
        if (!isSearching) setIsSearching(true);

        const request = {
          UsernamePrefix: query,
        };
        try {
          const profiles = await desoObj.user.getProfiles(request);
          if (profiles && profiles.ProfilesFound !== null) {
            setBrowseFeedSearchResult(profiles.ProfilesFound.slice(0, 5));
          } else {
            setBrowseFeedSearchResult(uniqueSearchResults);
          }
          setIsSearching(false);
        } catch (error) {
          console.log(error);
          setIsSearching(false);
        }
      } else {
        setBrowseFeedSearchResult(uniqueSearchResults);
        //setShowResults(false);
      }
    }, 700);

    return () => clearTimeout(getData);
  }, [query]);
  const closeSearch = () => {
    setQuery("");
    setIsDropdownExpanded(false);
  };
  const ref = useDetectClickOutside({ onTriggered: closeSearch });

  const [isDropdowExpanded, setIsDropdownExpanded] = useState(false);
  return (
    <div ref={ref}>
      <button
        className='flex space-x-1 items-center text-sm pl-1 rounded-md hover:bg-gray-200 p-1 hover:bg-opacity-20'
        onClick={() => {
          setIsDropdownExpanded(!isDropdowExpanded);
        }}>
        <img
          src={`https://diamondapp.com/api/v0/get-single-profile-picture/${feedUser.PublicKeyBase58Check}?fallback=https://diamondapp.com/assets/img/default_profile_pic.png`}
          className='h-8 w-8 rounded-full'
        />
        <span className='flex flex-col ml-2 lightText'>
          {userPublicKey === feedUser.PublicKeyBase58Check
            ? "My Feed"
            : `${feedUser.Username}'s Feed`}
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
        <span className='text-sm lightText'>Browse the feed through 👀</span>
        <input
          type='text'
          placeholder='Search User'
          className='search secondaryBg rounded-md px-2 py-2 w-full outline-none focus:shadow transition delay-50 ring-1  my-2'
          onChange={(e) => setQuery(e.target.value)}
          value={query}
        />
        {!isSearching ? (
          <div className='flex flex-col  '>
            {browseFeedSearchResult.map((users, index) => {
              return (
                <button
                  className='flex items-center space-x-1 my-1 primaryBg lightText menu transition  hover:bg-gray-100 py-1 px-1 rounded-md dark:hover:bg-gray-800'
                  key={index}
                  onClick={() => {
                    handleFeedChange(users);
                    setQuery("");
                    setIsDropdownExpanded(false);
                  }}>
                  <img
                    src={`https://diamondapp.com/api/v0/get-single-profile-picture/${users.PublicKeyBase58Check}?fallback=https://diamondapp.com/assets/img/default_profile_pic.png`}
                    className='h-10 w-10 rounded-full'
                  />
                  <p>{users.Username}</p>
                </button>
              );
            })}
          </div>
        ) : (
          <div className='flex justify-center my-2  '>
            <Loader />
          </div>
        )}
      </div>
    </div>
  );
}
