import React from 'react'
import { useMemo } from 'react'
import PostCardShimmer from './PostCard'

function PostShimmer() {
    const cards = useMemo(() => Array(3).fill(1), [])
    return (
        <>
            <div className="flex items-start justify-between min-h-24 lg:min-h-36 w-full secondaryBg secondaryBorder border primaryTextColor rounded-md mb-2 relative z-10">
                <div className="flex flex-col w-full p-4">
                    <div className="flex flex-col space-x-2 animate-pulse">
                        <div className="flex items-center py-3 space-x-4">
                            <div className='flex items-center space-x-2'>
                                <div className="bg-gray-300 rounded-xl w-4 h-4 dark:bg-gray-700" />
                                <div className="h-2 w-20 bg-gray-300 rounded dark:bg-gray-700" />
                            </div>
                            <div className='flex items-center space-x-4'>
                                <div className="h-2 w-20 bg-gray-300 rounded dark:bg-gray-700" />
                                <div className="h-2 w-10 bg-gray-300 rounded dark:bg-gray-700" />
                            </div>
                        </div>
                        <div className='flex flex-col w-full pr-4 my-2'>
                            <span className="space-y-2">
                                <div className="h-2 bg-gray-300 rounded dark:bg-gray-700" />
                                <div className="h-2 bg-gray-300 rounded dark:bg-gray-700" />
                                <div className="h-2 bg-gray-300 rounded dark:bg-gray-700" />
                                <div className="h-2 bg-gray-300 rounded dark:bg-gray-700" />
                                <div className="h-2 bg-gray-300 rounded dark:bg-gray-700" />
                                <div className="h-2 bg-gray-300 rounded dark:bg-gray-700" />
                                <div className="h-2 w-80 bg-gray-300 rounded dark:bg-gray-700" />
                                <div className="h-2 w-80 bg-gray-300 rounded dark:bg-gray-700" />
                            </span>
                        </div>
                        <div className='flex flex-col w-full space-y-4 my-2'>
                            <span className="space-x-2 flex">
                                <div className="h-2 w-20 bg-gray-300 rounded dark:bg-gray-700" />
                                <div className="h-2 w-20 bg-gray-300 rounded dark:bg-gray-700" />
                            </span>
                        </div>
                        <div className='flex mt-8 flex-col w-full space-y-4 my-2'>
                            <div className="h-2 w-36 bg-gray-300 rounded dark:bg-gray-700" />
                            <div className="h-60 w-full bg-gray-300 rounded dark:bg-gray-700" />
                        </div>
                    </div>
                </div>
                <div className="hidden sm:flex-1 pt-2 pb-2 pr-3 lg:pr-5 lg:pt-7 lg:pb-7 h-24 lg:h-36">
                    <div className="bg-gray-300 rounded-xl w-16 h-20 dark:bg-gray-700" />
                </div>
            </div>
            
            <div>
                <div className='w-full'>
                    <div className="flex flex-col">
                        {cards.map((i, idx) => (
                            <PostCardShimmer key={`${i}_${idx}`} />
                        ))}
                    </div>
                </div>
            </div>
        </>
    )
}

export default PostShimmer