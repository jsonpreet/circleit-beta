import React from "react";
import { useState } from "react";
import { DESO_CONFIG, NODE_URL } from "../../../utils/Constants";
import { BiUpload, BiX } from "react-icons/bi";
import useApp from "../../../store/app";
import Deso from "deso-protocol";
import { Loader } from "../../../utils/Loader";
import toast from "react-hot-toast";
import { toastOptions } from "../../../utils/Functions";
import { redirect, useNavigate } from "react-router-dom";
import { supabase } from "../../../utils/supabase";
    
export default function Delete({ user, sidebar }) {
  const [loading, setLoading] = useState(false);
  const { isLoggedIn, setLoggedIn, setUser, setCircle, isCircle } = useApp((state) => state);
  const navigate  = useNavigate();

  const updateProfile = async () => {
        const deso = new Deso(DESO_CONFIG);
        setLoading(true);
        const payload = {
            Mods: "",
            NFTRoyality: "",
            VerifiedUsers: "",
            bannedUsers: "",
            isCircle: "false",
            rules: ""
        }
        
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
            await deso.social.updateProfile(request);
            await supabase.from('circles').eq('PublicKeyBase58Check', user.profile.PublicKeyBase58Check)
            toast.success('Your Circle is Removed.', toastOptions);
            setUser({});
            setCircle(false);
            setLoggedIn(false);
            navigate("/");
        } catch (error) {
          console.log(error)
            setLoading(false);
            toast.error('Something went wrong!', toastOptions);
        }
    }

  return (
      <div className='flex flex-col relative justify-center items-start w-full'>
        <div className="flex flex-col w-full space-y-6 md:flex-row md:space-x-10 md:space-y-0">
          <div className="flex flex-col w-full md:w-1/4">
              {sidebar}
          </div>
          <div className="flex flex-col w-full md:w-3/4 secondaryBg border secondaryBorder rounded-xl p-4">
            <div className='flex flex-col w-full space-y-4'>
              <div className='w-3/5'>
              <button onClick={() => updateProfile()} className={`flex items-center justify-center space-x-2 font-medium text-white px-6 py-3 leading-none rounded-full buttonBG my-2 ${loading ? 'cursor-not-allowed bg-opacity-50' : ''}`}>
                  {loading && <Loader className="w-3.5 h-3.5" />}<span>Delete Circle</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
