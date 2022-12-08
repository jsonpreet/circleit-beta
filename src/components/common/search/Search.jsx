import Deso from 'deso-protocol';
import React from 'react'
import { BsSearch } from 'react-icons/bs'
import { Link } from 'react-router-dom';
import { DESO_CONFIG, NODE_URL } from '../../../utils/Constants';
import { getIsCircle } from '../../../utils/Functions';
import { useDetectClickOutside } from 'react-detect-click-outside';
import { isBrowser } from 'react-device-detect';

const deso = new Deso(DESO_CONFIG);

function Search() {
    const [query, setQuery] = React.useState('');
    const [results, setResults] = React.useState([]);
    const [showResults, setShowResults] = React.useState(false);

    React.useEffect(() => {
        const getData = setTimeout(async() => {
            if (query.length > 0) {
                const request = {
                    "UsernamePrefix": query,
                }
                try {
                    const profiles = await deso.user.getProfiles(request);
                    if (profiles && profiles.ProfilesFound !== null) {
                        setShowResults(true);
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
    }

    const ref = useDetectClickOutside({ onTriggered: closeSearch });


    return (
        <>
            {isBrowser ?
            
                <div className='flex flex-row w-[700px] items-center relative'>
                    <input
                        type='text'
                        placeholder='Find circle'
                        className='search secondaryBg rounded-full px-4 py-2 w-full outline-none focus:shadow transition delay-50 ring-1 pl-12'
                        onChange={(e) => setQuery(e.target.value)}
                        value={query}
                    />
                    <div className='absolute left-4 top-2.5'>
                        <BsSearch size={20} className='text-gray-700 dark:text-white' />
                    </div>
                    {showResults &&
                        <div ref={ref} className='flex absolute left-0 top-10 drop-shadow-xl w-full flex-col rounded-xl darkenBg border divide-y theme-divider py-2 darkenBorder mt-4'>
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
                </div>
                : 
                null
            }    
        </>
    )
}

export default Search