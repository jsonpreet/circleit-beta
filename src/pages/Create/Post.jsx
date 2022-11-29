import React from 'react'
import { BsChevronDown } from 'react-icons/bs';
import { DefaultLayout } from '../../components/layouts'
import { SidebarRight } from '../../components/sidebar/circle'
import useApp from '../../store/app';

function CreatePost() {
    const { user } = useApp();
    return (
        <>
            <DefaultLayout>
                <div className='grid grid-cols-1 gap-4 items-start lg:grid-cols-3 lg:gap-8'>
                    <div className='grid grid-cols-1 gap-4 lg:col-span-2 mt-6'>
                        <div className='secondaryBg border secondaryBorder rounded-lg '>
                            <div className='px-4 py-3 flex items-center flex-row justify-between'>
                                <h2 className='font-semibold primaryTextColor text-xl'>Create Post</h2>
                                <div>
                                    <button className='w-full h-full flex flex-row justify-between items-center pl-4 pr-7 py-2 rounded-md border primaryBorder primaryBg dark:text-white relative'>
                                    <span className='pr-4 dark:text-[#b3b8c0] text-gray-600'>
                                        Select Circle
                                    </span>
                                    <div className='absolute right-3'>
                                        <BsChevronDown
                                            className='dark:text-[#b3b8c0] text-gray-600'
                                            size={17}
                                        />
                                    </div>
                                    </button>
                                </div>
                            </div>
                            <div className='divider'></div>
                            <div className='p-4 flex flex-col'>
                                <div className='flex flex-row items-center'>
                                    <textarea className='w-full h-40 resize-none border rounded-lg outline-none px-4 py-2' placeholder='What is on your mind?'></textarea>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='mt-[25px]'>
                        <SidebarRight circle={user.profile} />
                    </div>
                </div>
            </DefaultLayout>
        </>
    )
}

export default CreatePost