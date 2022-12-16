import GlobalContext from "./GlobalContext";
import { useState } from "react";
import Deso from "deso-protocol";
import { DESO_CONFIG } from "../Constants";
const deso = new Deso(DESO_CONFIG);
const GlobalState = (props) => {
  const [homeFeed, setHomeFeed] = useState([]);
  const [followingFeed, setFollowingFeed] = useState([]);
  const [circleItProfile, setCircleItProfile] = useState({});
  const [topDiamonderStatelessResponse, setTopDiamonderStatelessResponse] =
    useState({});
  const [diamondInfoMap, setDiamondInfoMap] = useState({});
  const [followingFeedInfo, setFollowingFeedInfo] = useState({});
  const [newCircles, setNewCircles] = useState([]);
  const [desoObj, setDesoObj] = useState(deso);

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

  const updateNewCircles = (newNewCircles) => {
    setNewCircles(newNewCircles);
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
        newCircles,
        desoObj,
        updateHomeFeed,
        updateFollowingFeed,
        updateCircleItProfile,
        updateTopDiamonderStatelessResponse,
        updateDiamondInfoMap,
        updateFollowingFeedInfo,
        updateNewCircles,
      }}>
      {props.children}
    </GlobalContext.Provider>
  );
};
export default GlobalState;
