import { createContext } from "react";
import Deso from "deso-protocol";
import { DESO_CONFIG } from "../Constants";
const deso = new Deso(DESO_CONFIG);
//Using this we can feathc memPolList, updateMemPoolState, appState, exchangeRates from any component
//this helps us not to ping the getappstate and getexchangerate api every time we need to use it
const GlobalContext = createContext({
  homeFeed: [],
  followingFeed: {},
  circleItProfile: {},
  diamondInfoMap: {},
  topDiamonderStatelessResponse: {},
  followingFeedInfo: {},
  newCircles: [],
  desoObj: deso,

  updateHomeFeed: () => {},
  updateFollowingFeed: () => {},
  updateCircleItProfile: () => {},
  updateDiamondInfoMap: () => {},
  updateTopDiamonderStatelessResponse: () => {},
  updateFollowingFeedInfo: () => {},
  updateNewCircles: () => {},
});

export default GlobalContext;
