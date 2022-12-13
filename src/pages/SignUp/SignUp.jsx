import Deso from "deso-protocol";
import { Fragment, useEffect, useState } from "react";
import useApp from "../../store/app";
import { DefaultLayout } from "../../components/layouts";
import { isBrowser } from "react-device-detect";
import { Menu, Transition } from "@headlessui/react";
import { BiChevronDown } from "react-icons/bi";
import { Header } from "../../components/header";
import ProfileForm from "./ProfileForm";
import { Loader } from "../../utils/Loader";
import { Navigate } from "react-router-dom";
import { DESO_CONFIG, MIN_DESO_TO_CREATE_PROFILE } from "../../utils/Constants";
import { Link, useNavigate } from "react-router-dom";
import BegDESO from "./BegDESO";

const deso = new Deso(DESO_CONFIG);
export default function SignUp() {
  const navigate = useNavigate();
  const [newDeSoPublicKey, setNewDeSoPublicKey] = useState("");
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    async function initSignUpStage() {
      let loggedInDeSoPublicKey = localStorage.getItem("newDeSoPublicKey");
      try {
        if (loggedInDeSoPublicKey) {
          const request = {
            PublicKeysBase58Check: [loggedInDeSoPublicKey],
          };
          const response = await deso.user.getUserStateless(request);
          setBalance(response.UserList[0].BalanceNanos);
          setNewDeSoPublicKey(loggedInDeSoPublicKey);
        } else {
          navigate("/");
        }
      } catch (error) {
        console.log(error);
        navigate("/");
      }
    }
    initSignUpStage();
  }, []);

  return (
    <>
      <div className='relative inline-flex justify-center rounded-full items-center w-full my-8'>
        <div className='relative text-4xl md:py-10 font-bold text-center dark:text-white sm:text-4xl lg:text-5xl leading-none rounded-full z-10'>
          <span className='brandGradientBg blur-2xl filter opacity-10 w-full h-full absolute inset-0 rounded-full'></span>
          <span className='md:px-5'>
            Welcome to{" "}
            <span className='text-transparent bg-clip-text brandGradientBg'>
              CircleIt
            </span>{" "}
          </span>
        </div>
      </div>
      {!newDeSoPublicKey && (
        <div className='mx-auto flex justify-center'>
          <Loader />
        </div>
      )}

      {newDeSoPublicKey && balance >= MIN_DESO_TO_CREATE_PROFILE && (
        <div className='mx-auto flex justify-center'>
          <ProfileForm />
        </div>
      )}

      {newDeSoPublicKey && balance < MIN_DESO_TO_CREATE_PROFILE && (
        <div className='mx-auto flex justify-center'>
          <BegDESO publicKey={newDeSoPublicKey} />
        </div>
      )}
    </>
  );
}
