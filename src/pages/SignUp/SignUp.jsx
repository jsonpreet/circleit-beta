import Deso from "deso-protocol";
import ProfileForm from "./ProfileForm";
import { Loader } from "../../utils/Loader";
import { Navigate } from "react-router-dom";
import { DESO_CONFIG, MIN_DESO_TO_CREATE_PROFILE } from "../../utils/Constants";
import { Link, useNavigate } from "react-router-dom";
import BegDESO from "./BegDESO";
import { useEffect, useState, useRef } from "react";
import useApp from "../../store/app";
const deso = new Deso(DESO_CONFIG);
export default function SignUp() {
  const navigate = useNavigate();
  const [newDeSoPublicKey, setNewDeSoPublicKey] = useState("");
  const [balance, setBalance] = useState(0);
  const { setUser } = useApp((state) => state);
  const [profileExists, setProfileExists] = useState(false);
  const rootRef = useRef(null);
  useEffect(() => {
    async function initSignUpStage() {
      let loggedInDeSoPublicKey = localStorage.getItem("newDeSoPublicKey");
      try {
        if (loggedInDeSoPublicKey) {
          const request = {
            PublicKeysBase58Check: [loggedInDeSoPublicKey],
          };
          const response = await deso.user.getUserStateless(request);
          let hasProfile = response.UserList[0].ProfileEntryResponse !== null;
          setProfileExists(hasProfile);
          setBalance(response.UserList[0].BalanceNanos);
          setNewDeSoPublicKey(loggedInDeSoPublicKey);

          if (hasProfile) {
            navigate("/");
          } else {
            setUser({ profile: response.UserList[0] });
          }
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
    <div ref={rootRef}>
      <div className='relative inline-flex justify-center rounded-full items-center w-full my-8'>
        <div className='relative text-4xl md:py-10 font-bold text-center dark:text-white sm:text-4xl lg:text-5xl leading-none rounded-full z-10'>
          <span className='brandGradientBg blur-2xl filter opacity-10 w-full h-full absolute inset-0 rounded-full'></span>
          {newDeSoPublicKey && balance >= MIN_DESO_TO_CREATE_PROFILE ? (
            <span className='md:px-5'>
              Create your{" "}
              <span className='text-transparent bg-clip-text brandGradientBg'>
                Profile
              </span>
            </span>
          ) : (
            <span className='md:px-5'>
              Welcome to{" "}
              <span className='text-transparent bg-clip-text brandGradientBg'>
                CircleIt
              </span>{" "}
            </span>
          )}
        </div>
      </div>
      {!newDeSoPublicKey && (
        <div className='mx-auto flex justify-center'>
          <Loader />
        </div>
      )}

      {newDeSoPublicKey &&
        balance >= MIN_DESO_TO_CREATE_PROFILE &&
        !profileExists && (
          <div className='mx-auto flex justify-center'>
            <ProfileForm
              desoObj={deso}
              publicKey={newDeSoPublicKey}
              rootRef={rootRef}
            />
          </div>
        )}

      {newDeSoPublicKey && balance < MIN_DESO_TO_CREATE_PROFILE && (
        <div className='mx-auto flex justify-center'>
          <BegDESO publicKey={newDeSoPublicKey} desoObj={deso} />
        </div>
      )}
    </div>
  );
}
