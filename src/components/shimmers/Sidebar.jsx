function SidebarShimmer() {
    return (
        <>
            <div className='flex flex-col w-96 sm:ml-6 ml-1'>
                <div className='rounded-md secondaryBg secondaryBorder secondaryTextColor overflow-hidden border'>
                    <div className=' animate-pulse'>
                        <div className='flex flex-col'>
                            <div className="h-48 relative z-0 bg-gray-300 rounded dark:bg-gray-500"/>
                            <div className='flex flex-col items-center justify-center -mt-20 relative z-10'>
                                <div className="bg-gray-300 rounded-full w-32 h-32 dark:bg-gray-700" />
                                <div className="flex items-center flex-col space-y-2 mt-1">
                                    <div className="h-2 w-28 bg-gray-300 rounded dark:bg-gray-700" />
                                    <div className="h-2 w-20 bg-gray-300 rounded dark:bg-gray-700" />
                                </div>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="flex flex-col space-y-2">
                                <div className="h-2 w-80 bg-gray-300 rounded dark:bg-gray-700" />
                                <div className="h-2 w-40 bg-gray-300 rounded dark:bg-gray-700" />
                            </div>
                        </div>
                        <div className="h-[1px] w-full dark:bg-[#2D2D33] bg-gray-100"></div>
                        <div className="px-6 py-6 flex justify-between">
                            <div className="flex flex-col items-center space-y-1">
                                <div className="h-2 w-10 bg-gray-300 rounded dark:bg-gray-700" />
                                <div className="h-2 w-20 bg-gray-300 rounded dark:bg-gray-700" />
                            </div>
                            <div className="flex flex-col items-center space-y-1">
                                <div className="h-2 w-10 bg-gray-300 rounded dark:bg-gray-700" />
                                <div className="h-2 w-20 bg-gray-300 rounded dark:bg-gray-700" />
                            </div>
                            <div className="flex flex-col items-center space-y-1">
                                <div className="h-2 w-10 bg-gray-300 rounded dark:bg-gray-700" />
                                <div className="h-2 w-20 bg-gray-300 rounded dark:bg-gray-700" />
                            </div>
                        </div>
                        <div className="h-[1px] w-full dark:bg-[#2D2D33] bg-gray-100"></div>
                        <div className="px-6 py-4 items-center justify-center flex">
                            <div className="h-10 w-28 bg-gray-300 rounded-full dark:bg-gray-700" />
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default SidebarShimmer