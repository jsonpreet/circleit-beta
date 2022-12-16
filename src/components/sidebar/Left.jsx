import { defaultCircles } from "../../utils/Constants";
import CircleList from "./CircleList";
import { Link } from "react-router-dom";
import useApp from "../../store/app";
import { useEffect, useState, useContext } from "react";
import CreateCircleModal from "../modals/CreateCircle";
import GlobalContext from "../../utils/GlobalContext/GlobalContext";
import logo from "../../assets/logo.svg";
import { supabase } from "../../utils/supabase";

function SidebarLeft({ rootRef }) {
  const GlobalContextValue = useContext(GlobalContext);
  const { isLoggedIn, isCircle } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [circles, setCircles] = useState(
    GlobalContextValue.newCircles.length > 0
      ? GlobalContextValue.newCircles
      : []
  );

  useEffect(() => {
    async function fetchCircles() {
      const { data, error, status } = await supabase.from("circles").select();
      if (error && status !== 406) {
        console.log(error.error_description || error.message);
      }
      if (data && data.length > 0) {
        const uniqueCircles = data.filter(
          (thing, index, self) =>
            index === self.findIndex((t) => t.Username === thing.Username)
        );
        let reversedCircles = uniqueCircles.reverse().slice(0, 10);
        setCircles(reversedCircles);
        GlobalContextValue.updateNewCircles(reversedCircles);
      }
    }
    if (GlobalContextValue.newCircles.length == 0) {
      fetchCircles();
    }
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
          />
        </div>
        {circles && circles.length > 0 ? (
          <>
            <div className='divider'></div>
            <CircleList
              name='New Circles'
              list={circles}
            />
          </>
        ) : null}
      </div>
    </>
  );
}

export default SidebarLeft;
