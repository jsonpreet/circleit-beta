import React, { useEffect, useState } from 'react'
import { defaultCircles } from '../../utils/Constants'
import { supabase } from '../../utils/supabase'
import CircleList from './CircleList'

function SidebarRight() {
    const [circles, setCircles] = useState([]);
    useEffect(() => {
        async function fetchCircles() {
        const { data, error, status } = await supabase.from('circles').select()
            if (error && status !== 406) {
                console.log(error.error_description || error.message);
            }
            if (data && data.length > 0) {
                setCircles([...defaultCircles, ...data]);
            } else {
                setCircles(defaultCircles);
            }
        }
        fetchCircles()
    },[])
    return (
        <>
            <div className='flex flex-col md:w-96 md:ml-6 secondaryBg border secondaryBorder rounded-md secondaryTextColor py-4 items-start justify-start'>
                <div className='flex-1 w-full flex flex-col'>
                    <h3 className='px-4 text-xl font-bold mb-4 pb-4 border-b secondaryBorder dark:text-white'>Latest Circles</h3>
                    <div className='px-4'>
                        <CircleList list={circles} />
                    </div>
                </div>
            </div>
        </>
    )
}

export default SidebarRight