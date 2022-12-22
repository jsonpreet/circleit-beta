import React from "react";
import { useState } from "react";
import { DESO_CONFIG } from "../../../utils/Constants";
import useApp from "../../../store/app";
import Deso from "deso-protocol";
import { Loader } from "../../../utils/Loader";
import toast from "react-hot-toast";
import { toastOptions } from "../../../utils/Functions";
import { useNavigate } from "react-router-dom";

export default function Delete({ user, sidebar }) {
  const [loading, setLoading] = useState(false);
  const { setLoggedIn, setUser, setCircle } = useApp((state) => state);
  const navigate = useNavigate();

  const updateProfile = async () => {
    const deso = new Deso(DESO_CONFIG);
    setLoading(true);
    const payload = {
      Mods: "",
      NFTRoyality: "",
      VerifiedUsers: "",
      bannedUsers: "",
      isCircle: "false",
      rules: "",
    };

    const request = {
      ProfilePublicKeyBase58Check: "",
      UpdaterPublicKeyBase58Check: user.profile.PublicKeyBase58Check,
      MinFeeRateNanosPerKB: 1000,
      NewStakeMultipleBasisPoints: 12500,
      NewCreatorBasisPoints: user.profile.CoinEntry.CreatorBasisPoints,
      ExtraData: {
        CircleIt: JSON.stringify(payload),
      },
    };
    try {
      const response = await deso.social.updateProfile(request);
      const jwt = await deso.identity.getJwt(undefined);
    
      if (response) {
        const response2 = await fetch("https://tipdeso.com/delete-circle", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            jwt: jwt,
            publicKey: user.profile.PublicKeyBase58Check,
          }),
        });
        toast.success("Your Circle is Removed.", toastOptions);
        setUser({});
        setCircle(false);
        setLoggedIn(false);
        navigate("/");
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
      toast.error("Something went wrong!", toastOptions);
    }
  };

  return (
    <div className='flex flex-col relative justify-center items-start w-full'>
      <div className='flex flex-col w-full space-y-6 md:flex-row md:space-x-10 md:space-y-0'>
        <div className='flex flex-col w-full md:w-1/4'>{sidebar}</div>
        <div className='flex flex-col w-full md:w-3/4 secondaryBg border secondaryBorder rounded-xl p-4'>
          <div className='flex flex-col w-full space-y-4'>
            <div className='w-full md:w-3/5'>
              <p className='font-semibold mb-2 primaryTextColor'>
                Delete Circle
              </p>
              <p>
                Note: Deleting a Cicle will remove all your circle settings.
              </p>
            </div>
            <div className='w-full md:w-3/5'>
              <button
                onClick={() => updateProfile()}
                className={`flex items-center justify-center space-x-2 font-medium text-white px-6 py-3 leading-none rounded-full buttonBG my-2 ${
                  loading ? "cursor-not-allowed bg-opacity-50" : ""
                }`}>
                {loading && <Loader className='w-3.5 h-3.5' />}
                <span>Delete Circle</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
