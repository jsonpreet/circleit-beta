import { defaultCircles } from "../../utils/Constants";
import CircleList from "./CircleList";
import { Link } from "react-router-dom";
import useApp from "../../store/app";
import { useEffect, useState, useContext } from "react";
import CreateCircleModal from "../modals/CreateCircle";
import GlobalContext from "../../utils/GlobalContext/GlobalContext";
import logo from "../../assets/logo.svg";

function SidebarLeft({ rootRef }) {
  const GlobalContextValue = useContext(GlobalContext);
  const { user, isLoggedIn, isCircle } = useApp((state) => state);
  const [showModal, setShowModal] = useState(false);
  const [circles, setCircles] = useState(
    GlobalContextValue.newCircles.length > 0
      ? GlobalContextValue.newCircles.slice(0, 7)
      : []
  );

  useEffect(() => {
    async function fetchCircles() {
      console.log("fetching circles...");
      const response = await fetch("https://itsaditya.live/get-latest-circles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          limit: 30,
          lastTimeStampOfCircleCreated: null,
        }),
      });
      let uniqueCircles = await response.json();

      setCircles(uniqueCircles.data.slice(0, 7));
      GlobalContextValue.updateNewCircles(uniqueCircles.data);
    }
    if (GlobalContextValue.newCircles.length === 0) {
      fetchCircles();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <>
      <div className='w-56 items-start relative justify-start dark:bg-[#121214] bg-white dark:border-[#2D2D33] border-gray-100 overflow-auto h-screen border-r p-4 bg-clip-padding backdrop-blur-xl backdrop-filter'>
        <div className='flex flex-row -mt-2 items-center'>
          <Link to='/'>
            <div className='relative text-4xl font-bold dark:text-white sm:text-4xl lg:text-5xl leading-none rounded-full z-10'>
              <img src={logo} className='h-14' alt='Circleit Logo'></img>
            </div>
          </Link>
        </div>
        <div className='flex flex-col overflow-auto w-full pr-4 mt-4'>
          <CircleList name='Top Circles' list={defaultCircles} />
          <div className='divider'></div>
          {isLoggedIn ? (
            !isCircle ? (
              <button
                onClick={() => setShowModal(!showModal)}
                className='font-medium text-white px-6 py-4 leading-none w-full rounded-full buttonBG my-6'>
                <span>Create a Circle</span>
              </button>
            ) : null
          ) : null}
          <CreateCircleModal
            rootRef={rootRef}
            showModal={showModal}
            setShowModal={setShowModal}
            loggedInUsername={user.profile ? user.profile.Username : ""}
          />
        </div>
        {circles && circles.length > 0 ? (
          <>
            <div className='divider'></div>
            <CircleList name='New Circles' list={circles} />
          </>
        ) : null}
      </div>
    </>
  );
}

export default SidebarLeft;
