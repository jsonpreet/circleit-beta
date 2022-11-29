import { Dialog, Transition } from '@headlessui/react'
import React, { Fragment, useState } from 'react'
import useApp from '../../store/app';
import party from "party-js";
import toast from 'react-hot-toast';
import { Link, redirect } from 'react-router-dom';
import { Loader } from '../../utils/Loader';
import Deso from 'deso-protocol';
import { DESO_CONFIG } from '../../utils/Constants';
import { supabase } from '../../utils/supabase';

function CreateCircleModal({ rootRef, showModal, setShowModal }) {
    const { user, setCircle } = useApp();
    const [loading, setLoading] = useState(false);
    const createCircle = async () => {
        const deso = new Deso(DESO_CONFIG);
        setLoading(true);
        const payload = {
            Mods: "",
            NFTRoyality: "",
            VerifiedUsers: "",
            bannedUsers: "",
            isCircle: "true",
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
            const response = await deso.social.updateProfile(request);
            if (response) {
                try {
                    const { data, error, status } = await supabase.from('circles').insert([{ Username: user.profile.Username, PublicKeyBase58Check: user.profile.PublicKeyBase58Check }]).eq('PublicKeyBase58Check', user.profile.PublicKeyBase58Check).select()
                    if (error && status !== 406) {
                        toast.error(error.error_description || error.message);
                    }
                    if (data && data.length > 0) {
                        toast.success('Congratulations! Circle Created Successfully.');
                        party.confetti(rootRef.current, {
                            count: party.variation.range(100, 2000),
                            size: party.variation.range(0.5, 2.0),
                        })
                        setCircle(true);
                        setTimeout(() =>
                            redirect(`/circle/${user.profile.Username}`)
                        , 1500);
                    } else {
                        toast.error('Something went wrong!');
                    }
                } catch (error) {
                    toast.error(error.error_description || error.message);
                } finally {
                    setLoading(false)
                    setShowModal(false);
                }
            }
        } catch (error) {
            console.log(error);
            setLoading(false);
            toast.error('Something went wrong!');
        }
    }

    const closeModal = () => {
        setShowModal(false);
        setLoading(false);
    }
    return (
        <>
            <Transition appear show={showModal} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => closeModal()}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black bg-opacity-70" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl primaryBg primaryBorder border text-left align-middle shadow-xl transition-all">
                                    <Dialog.Title
                                        as="h3"
                                        className="text-lg py-4  px-6 font-semibold leading-6 border-b primaryBorder primaryTextColor"
                                    >
                                        Create a Circle
                                    </Dialog.Title>
                                    <div className="mt-4 px-6">
                                        <p className=" primaryTextColor">Convert Your DeSo Profile with Circle or <Link className='cursor-pointer hover:underline colorText' to='/'>Create</Link> a new DeSo account!</p>
                                    </div>

                                    <div className="mt-6 flex justify-end space-x-4 py-3 px-6 secondaryBg">
                                        <button
                                            type="button"
                                            className={`relative flex items-center justify-center space-x-2 rounded-full border border-transparent px-4 py-2 text-sm font-medium buttonBG focus:outline-none ${loading ? 'cursor-not-allowed bg-opacity-50' : ''}`}
                                            onClick={createCircle}
                                        >
                                            {loading && <Loader className="w-3.5 h-3.5" />}<span>Conitnue</span>
                                        </button>
                                        <button
                                            type="button"
                                            className="inline-flex justify-center rounded-full darkenBg border px-4 py-2 text-sm font-medium darkenHoverBg darkenBorder focus:outline-none"
                                            onClick={() => closeModal()}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </>
    )
}

export default CreateCircleModal