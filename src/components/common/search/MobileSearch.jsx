import Deso from 'deso-protocol';
import React, { Fragment } from 'react'
import { BsSearch } from 'react-icons/bs'
import { DESO_CONFIG, NODE_URL } from '../../../utils/Constants';
import { isMobile } from 'react-device-detect';
import { Dialog, Transition } from '@headlessui/react';
import { MdOutlineClose } from 'react-icons/md'
import { getIsCircle } from '../../../utils/Functions';
import { Link } from 'react-router-dom';
import { Loader } from '../../../utils/Loader';

const deso = new Deso(DESO_CONFIG);

function Search() {
    const [query, setQuery] = React.useState('');
    const [results, setResults] = React.useState([]);
    const [showResults, setShowResults] = React.useState(false);
    const [showModal, setShowModal] = React.useState(false);
    const [loading, setLoading] = React.useState(false);

    React.useEffect(() => {
        const getData = setTimeout(async () => {
            if (query?.length > 0) {
                setLoading(true)
                const request = {
                    "UsernamePrefix": query,
                }
                try {
                    const profiles = await deso.user.getProfiles(request);
                    if (profiles && profiles.ProfilesFound !== null) {
                        setShowResults(true);
                        setLoading(false)
                        setResults(profiles.ProfilesFound.slice(0, 5));
                    }
                } catch (error) {
                    console.log(error);
                }
            } else {
                setShowResults(false);
            }
        }, 700)

        return () => clearTimeout(getData)
    }, [query])

    const closeSearch = () => {
        setShowResults(false);
        setResults([]);
        setQuery('');
        setLoading(false);
    }


    return (
        <>
            {isMobile ?
                <>
                    <button 
                        className='relative cursor-pointer'
                        onClick={() => setShowModal(true)}
                    >
                        <BsSearch size={20} className='text-gray-700 dark:text-white' />
                    </button>    
                    <Transition appear show={showModal} as={Fragment}>
                        <Dialog
                            as="div"
                            className="relative z-50"
                            onClose={() => setShowModal(false)}
                        >
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0"
                                enterTo="opacity-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100"
                                leaveTo="opacity-0"
                            >
                                <div className="fixed inset-0 bg-gray-900 bg-opacity-50 dark:bg-opacity-80" />
                            </Transition.Child>

                            <div className="fixed inset-0 overflow-y-auto">
                                <div className="flex items-center justify-center h-full min-h-full p-4 text-center">
                                    <Transition.Child
                                        as={Fragment}
                                        enter="ease-out duration-300"
                                        enterFrom="opacity-0 scale-95"
                                        enterTo="opacity-100 scale-100"
                                        leave="ease-in duration-200"
                                        leaveFrom="opacity-100 scale-100"
                                        leaveTo="opacity-0 scale-95"
                                    >
                                        <Dialog.Panel
                                            className={'w-full p-5 py-5 overflow-x-hidden text-left align-middle transition-all transform shadow-xl secondaryBg rounded-2xl'}
                                        >
                                            
                                            <div className="flex items-center justify-between pb-4">
                                                <Dialog.Title
                                                as="h3"
                                                className="primaryTextColor text-lg font-medium leading-6"
                                                >
                                                Search
                                                </Dialog.Title>
                                                
                                                <button
                                                    onClick={() => setShowModal(false)}
                                                    className='primaryTextColor max-w-[40px] w-auto h-10' 
                                                >
                                                    <MdOutlineClose size={22} />
                                                </button>
                                            </div>
                                            <div className="relative w-full overflow-hidden cursor-default border shadow-inner darkenBg darkenBorder mb-3 rounded-full">
                                                <input
                                                    className="w-full py-2.5 pl-3 pr-10 bg-transparent focus:outline-none"
                                                    onChange={(e) => setQuery(e.target.value)}
                                                    value={query}
                                                    placeholder="Search"
                                                />
                                                <div className="absolute inset-y-0 right-3 flex items-center pr-2">
                                                    {!showResults && loading ? <Loader className='w-5 h-5'/> : <BsSearch size={20} className='text-gray-700 dark:text-white' />}
                                                </div>
                                            </div>
                                            {showResults &&
                                                <div className='flex w-full flex-col divide-y theme-divider py-2 mt-4'>
                                                    {results.map((profile, index) => {
                                                        const isCircle = getIsCircle(profile);
                                                        return (
                                                            <Link to={`/${isCircle ? `circle` : `u`}/${profile.Username}`} className='flex space-x-2 items-center darkenHoverBg darkenBg py-2 px-2'
                                                                key={index}>
                                                                <img
                                                                    src={`${NODE_URL}/get-single-profile-picture/${profile.PublicKeyBase58Check}?fallback=https://diamondapp.com/assets/img/default_profile_pic.png`}
                                                                    className='rounded-full subHeader w-10 h-10' alt={profile.Username}
                                                                />
                                                                <div className='flex flex-col'>
                                                                    <p className='extralightText'>{profile.Username}</p>
                                                                </div>
                                                            </Link>
                                                        )
                                                    })}
                                                </div>
                                            }
                                        </Dialog.Panel>
                                    </Transition.Child>
                                </div>
                            </div>
                        </Dialog>
                    </Transition>
                </>
                 : null}
        </>
    )
}

export default Search