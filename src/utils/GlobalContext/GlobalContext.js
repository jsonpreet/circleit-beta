import { createContext } from "react";

//Using this we can feathc memPolList, updateMemPoolState, appState, exchangeRates from any component
//this helps us not to ping the getappstate and getexchangerate api every time we need to use it
const GlobalContext = createContext({
  homeFeed: [],
  updateHomeFeed: () => {},
  followingFeed: {},
  updateFollowingFeed: () => {},
  circleItProfile: {},
  updateCircleItProfile: () => {},

  diamondInfoMap: {},
  updateDiamondInfoMap : () => {},
  topDiamonderStatelessResponse: {},
  updateTopDiamonderStatelessResponse: () => {},

  followingFeedInfo:{},
  updateFollowingFeedInfo: () => {},
});

export default GlobalContext;
