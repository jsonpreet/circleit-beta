import { defaultCircles } from "../../utils/Constants";
import { BsChevronDown } from "react-icons/bs";
import CircleList from "./CircleList";
import { Link } from "react-router-dom";
import useApp from "../../store/app";
import { useEffect, useState } from "react";
import CreateCircleModal from "../modals/CreateCircle";
import toast from "react-hot-toast";
import logo from "../../assets/logo.svg";
import { supabase } from "../../utils/supabase";

function SidebarLeft({ rootRef }) {
  const { isLoggedIn, isCircle, user } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [circles, setCircles] = useState([]);

  const login = async () => {
    toast.error("You must be logged in!");
  };

  useEffect(() => {
    async function fetchCircles() {
      const { data, error, status } = await supabase.from('circles').select()
      if (error && status !== 406) {
          console.log(error.error_description || error.message);
      }
      if (data && data.length > 0) {
          setCircles(data);
      }
    }
    fetchCircles()
  },[])
  return (
    <>
      <div className='flex flex-col w-56 h-screen items-start overflow-hidden relative justify-start'>
        {/* <span className="brandGradientBg blur-2xl opacity-20 dark:opacity-20 w-full h-full absolute inset-0 rounded-full"></span> */}
        <div className='dark:bg-[#121214] bg-white dark:border-[#2D2D33] border-gray-100 border-r p-4 h-screen bg-clip-padding backdrop-blur-xl backdrop-filter w-full'>
          <div className='flex flex-row items-center'>
            <div className='flex flex-row -mt-2 items-center'>
              <Link to='/'>
                <div className='relative text-4xl font-bold dark:text-white sm:text-4xl lg:text-5xl leading-none rounded-full z-10'>
                  {/* <span className="brandGradientBg blur-2xl filter opacity-40 dark:opacity-30 w-full h-full absolute inset-0 rounded-full"></span> */}
                  <img src={logo} className="h-14" alt="Circleit Logo"></img>
                </div>
              </Link>
            </div>
          </div>
          <div className='flex flex-row w-full mt-8 h-12 items-start justify-start'>
            <button className='w-full h-full flex flex-row justify-between items-center px-4 rounded-md border primaryBorder primaryBg dark:text-white'>
              <span className='dark:text-[#b3b8c0] text-gray-600'>
                Filter by
              </span>
              <BsChevronDown
                className=' dark:text-[#b3b8c0] text-gray-600'
                size={20}
              />
            </button>
          </div>
          <CircleList name='Favorites' list={defaultCircles} />
          {circles && circles.length > 0 ?
            <>
              <div className='divider'></div>
              <CircleList name='Community Circles' list={circles} />
            </> : null}
          <div className='divider'></div>
          {isLoggedIn ? (
            !isCircle ? (
              <button
                onClick={() => setShowModal(!showModal)}
                className='font-medium text-white px-6 py-4 leading-none w-full rounded-full buttonBG my-6'>
                <span>Create a Circle</span>
              </button>
            ) : null
          ) : (
            <button
              onClick={() => login()}
              className='font-medium text-white px-6 py-3 leading-none w-full rounded-full buttonBG my-6'>
              <span>Create a Circle</span>
            </button>
          )}
          <CreateCircleModal
            rootRef={rootRef}
            showModal={showModal}
            setShowModal={setShowModal}
          />
        </div>
      </div>
    </>
  );
}

export default SidebarLeft;
