import GlobalContext from "./GlobalContext";
import { useState } from "react";

const GlobalState = (props) => {
  const [homeFeed, setHomeFeed] = useState([]);
  const [followingFeed, setFollowingFeed] = useState([]);
  const [circleItProfile, setCircleItProfile] = useState({});
  const [topDiamonderStatelessResponse, setTopDiamonderStatelessResponse] = useState({});
  const [diamondInfoMap, setDiamondInfoMap] = useState({});
  const [followingFeedInfo, setFollowingFeedInfo] = useState({});

  const updateHomeFeed = (newHomeFeed) => {
    setHomeFeed(newHomeFeed);
  };
const updateFollowingFeed = (newFollowingFeed) => {
    setFollowingFeed(newFollowingFeed);
  };
 const updateCircleItProfile = (newCircleItProfile) => {
    setCircleItProfile(newCircleItProfile);
  };
  const updateTopDiamonderStatelessResponse = (
    newTopDiamonderStatelessResponse
  ) => {
    setTopDiamonderStatelessResponse(newTopDiamonderStatelessResponse);
  };
const updateDiamondInfoMap = (newDiamondInfoMap) => {
    setDiamondInfoMap(newDiamondInfoMap);
  };

  const updateFollowingFeedInfo = (newFollowingFeedInfo) => {
    setFollowingFeedInfo(newFollowingFeedInfo);
  };
  return (
    <GlobalContext.Provider
      value={{
        homeFeed,
        followingFeed,
        circleItProfile,
        topDiamonderStatelessResponse,
        diamondInfoMap,
        followingFeedInfo,
        updateHomeFeed,
        updateFollowingFeed,
        updateCircleItProfile,
        updateTopDiamonderStatelessResponse,
        updateDiamondInfoMap,
        updateFollowingFeedInfo,
      }}>
      {props.children}
    </GlobalContext.Provider>
  );
};
export default GlobalState;
