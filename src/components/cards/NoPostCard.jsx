import React from 'react'

function NoPostCard() {
    return (
        <>
            <div className="flex items-center justify-between h-36 w-full secondaryBg secondaryBorder border primaryTextColor rounded-md mb-2 relative z-10">
                <div className="flex flex-col w-full p-4">
                    <div className="flex flex-col space-x-2">
                        <h2 className="text-center text-2xl font-bold dark:text-white text-gray-700">No Posts Found</h2>
                        <p className='text-center dark:text-white text-gray-700'>
                            Be the first to post in this circle
                        </p>
                    </div>
                </div>
             </div>
        </>
    )
}

export default NoPostCard