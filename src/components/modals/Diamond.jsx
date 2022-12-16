import { Dialog, Transition } from "@headlessui/react";
import { useEffect, useState, useContext } from "react";
import { Slider } from "rsuite";
import { Fragment } from "react";
import { toast } from "react-hot-toast";
import {
  abbreviateNumber,
  formatUSD,
  nanosToUSDNumber,
} from "../../utils/Functions";
import useApp from "../../store/app";
import { Loader } from "../../utils/Loader";
import { MdOutlineClose } from "react-icons/md";
import MemPoolContext from "../../MemoryPool/MemPoolContext";
const DiamondModal = ({
  diamonds,
  setDiamonds,
  diamondBestowed,
  setDiamondBestowed,
  show,
  post,
  setShowDiamondModal,
  desoObj,
}) => {
 
  const memPoolContextValue = useContext(MemPoolContext);

  const { user } = useApp();
  const [diamondLevels, setDiamondLevels] = useState(0);
  const [loading, setLoading] = useState(false);
 
  const [exchange, setExchange] = useState(null);
  const [value, setValue] = useState(diamondBestowed + 1);
  const labels = ["1", "2", "3", "4", "5", "6", "7"];

  useEffect(() => {
    getExchange();
    getState();
  }, [
    memPoolContextValue.appState.DiamondLevelMap,
    memPoolContextValue.exchangeRates,
  ]);

  const getState = async () => {
    setDiamondLevels(memPoolContextValue.appState.DiamondLevelMap);
  };
  const getExchange = async () => {
    setExchange(memPoolContextValue.exchangeRates);
  };

  function diamondPrice(diamond) {
    const desoNanos = diamondLevels[diamond];
    const val = nanosToUSDNumber(desoNanos);
    const exchangeRate = exchange?.USDCentsPerDeSoCoinbase / 100;
    const diamondCost = val * exchangeRate;
    if (val < 1) {
      return formatUSD(Math.max(diamondCost, 0.01), 2);
    }
    return abbreviateNumber(diamondCost, 0, true);
  }

  const sendDiamonds = async () => {
    setLoading(true);
    try {
      const request = {
        ReceiverPublicKeyBase58Check:
          post.ProfileEntryResponse.PublicKeyBase58Check,
        SenderPublicKeyBase58Check: user.profile.PublicKeyBase58Check,
        DiamondPostHashHex: post.PostHashHex,
        MinFeeRateNanosPerKB: 1000,
        DiamondLevel: value,
        InTutorial: false,
      };
    
      const response = await desoObj.social.sendDiamonds(request);
      if (response && response.TxnHashHex) {
        setDiamondBestowed(value);
        setLoading(false);
        setShowDiamondModal(false);
        setDiamonds(diamonds + value);
      } else {
        console.log(response);
        toast.error(`Oops! This Amount Diamonds Already Sent`);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <Transition appear show={show} as={Fragment}>
        <Dialog
          as='div'
          className='relative z-50'
          onClose={() => setShowDiamondModal(false)}>
          <Transition.Child
            as={Fragment}
            enter='ease-out duration-300'
            enterFrom='opacity-0'
            enterTo='opacity-100'
            leave='ease-in duration-200'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'>
            <div className='fixed inset-0 bg-black bg-opacity-70' />
          </Transition.Child>

          <div className='fixed inset-0 overflow-y-auto'>
            <div className='flex min-h-full items-center justify-center p-4 text-center'>
              <Transition.Child
                as={Fragment}
                enter='ease-out duration-300'
                enterFrom='opacity-0 scale-95'
                enterTo='opacity-100 scale-100'
                leave='ease-in duration-200'
                leaveFrom='opacity-100 scale-100'
                leaveTo='opacity-0 scale-95'>
                <Dialog.Panel className='w-full max-w-xl transform overflow-hidden rounded-2xl primaryBg primaryBorder border text-left align-middle shadow-xl transition-all'>
                  <div className='flex items-center justify-between w-full mb-4 border-b primaryBorder'>
                    <Dialog.Title
                      as='h3'
                      className='text-lg py-4 px-6 w-full font-semibold leading-6 primaryTextColor'>
                      Send Diamonds
                    </Dialog.Title>
                    <button
                      className='relative inline-block disabled:opacity-50 rounded-full group px-5 md:py-2 py-1.5 text-sm md:rounded-full'
                      onClick={() => setShowDiamondModal(false)}>
                      <MdOutlineClose size={22} />
                    </button>
                  </div>
                  <div className='w-full pt-5 px-5 md:pt-8 pb-5'>
                    <Slider
                      value={value}
                      onChange={(value) => {
                        setValue(value);
                      }}
                      className={`custom-slider value-${value}`}
                      handleStyle={{
                        borderRadius: 10,
                        color: "#fff",
                        fontSize: 12,
                        width: 32,
                        height: 22,
                      }}
                      handleTitle={labels[value]}
                      defaultValue={diamondBestowed + 1}
                      tooltip={false}
                      min={1}
                      step={1}
                      max={6}
                      graduated
                      progress
                    />
                  </div>
                  <div className='text-light text-center text-sm'>
                    <span className='font-semibold'>{value}</span>{" "}
                    {value > 1 ? `Diamonds` : `Diamond`} Cost{" "}
                    <span className='font-semibold'>
                      {diamondPrice(value)} USD
                    </span>
                  </div>
                  <div className='flex items-center justify-center my-5 flex-col'>
                    <div>
                      <button
                        onClick={sendDiamonds}
                        className={`relative flex items-center justify-center space-x-2 rounded-full border border-transparent px-4 py-2 text-sm font-medium buttonBG focus:outline-none ${
                          loading ? "cursor-not-allowed bg-opacity-50" : ""
                        }`}>
                        {loading && <Loader className='w-3.5 h-3.5' />}
                        <span>Send</span>
                      </button>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default DiamondModal;
