import { useEffect, useState, useContext } from "react";
import Deso from "deso-protocol";

import { useNavigate, useParams } from "react-router-dom";
import GlobalContext from "../../utils/GlobalContext/GlobalContext";
import useApp from "../../store/app";

import { Loader } from "../../utils/Loader";
import { useInView } from "react-cool-inview";
import { DefaultLayout } from "../../components/layouts";
import { DESO_CONFIG } from "../../utils/Constants";
import { toast } from "react-hot-toast";
import CircleCard from "./CircleCard";
export default function Discover() {
  const { isLoggedIn, user } = useApp();
  const { circle } = useParams();

  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const navigate = useNavigate();

  const deso = new Deso(DESO_CONFIG);
  const GlobalContextValue = useContext(GlobalContext);
  const [circles, setCircles] = useState(
    GlobalContextValue.newCircles.length > 0
      ? GlobalContextValue.newCircles
      : []
  );
  const [lastTimeStampOfCircleCreated, setLastTimeStampOfCircleCreated] =
    useState(
      GlobalContextValue.newCircles.length > 0
        ? GlobalContextValue.newCircles[
            GlobalContextValue.newCircles.length - 1
          ].timestampCreated
        : 0
    );
  const [isLoading, setIsLoading] = useState(
    circles.length == 0 ||
      GlobalContextValue.topCirclesStatelessResponse.length == 0
      ? true
      : false
  );
  useEffect(() => {
    if (circles.length == 0 && GlobalContextValue.newCircles.length > 0) {
      setLastTimeStampOfCircleCreated(
        GlobalContextValue.newCircles[GlobalContextValue.newCircles.length - 1]
          .timestampCreated
      );
      setCircles(GlobalContextValue.newCircles);
    }
  }, [GlobalContextValue.newCircles]);

  useEffect(() => {
    async function fetchInfo() {
      if (circles.length == 0) return;
      if (GlobalContextValue.topCirclesStatelessResponse.length == 0) {
        try {
          let publicKeyList = [];
          for (let i = 0; i < GlobalContextValue.newCircles.length; i++) {
            publicKeyList.push(GlobalContextValue.newCircles[i].publicKey);
          }

          const request = {
            PublicKeysBase58Check: publicKeyList,
            SkipForLeaderboard: true,
          };
          const response2 = await deso.user.getUserStateless(request);

          GlobalContextValue.updateTopCirclesStatelessResponse(
            response2.UserList
          );
          setIsLoading(false);
        } catch (e) {
          console.log(e);
        }
      }
    }
    fetchInfo();
  }, [circles]);

  const { observe } = useInView({
    rootMargin: "1000px 0px",
    onEnter: async () => {
      console.log("finding more posts");
      if (loadingMore || !hasMore) return;
      setLoadingMore(true);

      try {
        console.log("fetching circles...");
        const response = await fetch("https://itsaditya.live/get-latest-circles", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            limit: 30,
            lastTimeStampOfCircleCreated: lastTimeStampOfCircleCreated,
          }),
        });

        let uniqueCircles = await response.json();
        if (uniqueCircles.data.length == 0) {
          setHasMore(false);
          return;
        }

        const newGlobalContextValue = [
          ...GlobalContextValue.newCircles,
          ...uniqueCircles.data,
        ];
        GlobalContextValue.updateNewCircles(newGlobalContextValue);
        const listOfAllCircleKeys = uniqueCircles.data.map(
          (circle) => circle.publicKey
        );
        const request = {
          PublicKeysBase58Check: listOfAllCircleKeys,
          SkipForLeaderboard: true,
        };
        const response2 = await deso.user.getUserStateless(request);
        const newGlobalContextToCircleStatelessResponse = [
          ...GlobalContextValue.topCirclesStatelessResponse,
          ...response2.UserList,
        ];

        GlobalContextValue.updateTopCirclesStatelessResponse(
          newGlobalContextToCircleStatelessResponse
        );

        setLastTimeStampOfCircleCreated(
          uniqueCircles.data[uniqueCircles.data.length - 1].timestampCreated
        );
        setCircles((prev) => [...prev, ...uniqueCircles.data]);
      } catch (error) {
        console.log(error);
        toast.error("Something went wrong");
      } finally {
        setLoadingMore(false);
      }
    },
  });

  return (
    <>
      <DefaultLayout>
        <div className='relative inline-flex justify-center rounded-full items-center w-full mt-14 mb-4'>
          <div className='relative text-4xl md:py-10 font-bold text-center dark:text-white sm:text-4xl lg:text-5xl leading-normal rounded-full z-10'>
            <span className='brandGradientBg blur-2xl filter opacity-10 w-full h-full absolute inset-0 rounded-full'></span>
            <span className='md:px-5'>
              Discover and Join
              <span className='text-transparent bg-clip-text brandGradientBg'>
                {" "}
                Community Circles
              </span>
            </span>
          </div>
        </div>

        {isLoading ? (
          <div className='flex justify-center'>
            <Loader />
          </div>
        ) : (
          <div className='container mx-auto flex flex-wrap '>
            {circles &&
              circles.length > 0 &&
              circles.map((circle, index) => {
                //return divs that has 4 cards on big screen, 3 on small, and 1 on mobile. Each div card has banner image, circle name, and circle description along with circle image and join button
                return (
                  <div className='w-full md:w-1/2 xl:w-1/3 sm:p-4 my-1 sm:my-1  ' key={index}>
                    <CircleCard
                      circleStateless={GlobalContextValue.topCirclesStatelessResponse.find(
                        (c) => c.PublicKeyBase58Check == circle.publicKey
                      )}
                    />
                  </div>
                );
              })}
          </div>
        )}
        {!isLoading &&
          (hasMore ? (
            <span ref={observe} className='flex justify-center my-10'>
              <Loader />
            </span>
          ) : (
            <div className='flex justify-center md:p-10'>
              <p className='text-gray-500 dark:text-gray-400'>
                You have come to an end!
              </p>
            </div>
          ))}
      </DefaultLayout>
    </>
  );
}
