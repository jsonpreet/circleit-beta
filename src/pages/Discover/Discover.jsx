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

  const navigate = useNavigate();

  const deso = new Deso(DESO_CONFIG);
  const GlobalContextValue = useContext(GlobalContext);
  const [circles, setCircles] = useState(
    GlobalContextValue.newCircles.length > 0
      ? GlobalContextValue.newCircles
      : []
  );
  const [isLoading, setIsLoading] = useState(
    circles.length == 0 ? true : false
  );
  useEffect(() => {
    if (circles.length == 0 && GlobalContextValue.newCircles.length > 0) {
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
          <div>
            {circles &&
              circles.length > 0 &&
              circles.map((circle, index) => {
                //return divs that has 4 cards on big screen, 3 on small, and 1 on mobile. Each div card has banner image, circle name, and circle description along with circle image and join button
                return (
                  <div key={index}>
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
      </DefaultLayout>
    </>
  );
}
