import React from 'react'
import { Toaster } from 'react-hot-toast'
import { toastOptions } from '../../utils/Functions'
import { Header } from '../header'
import { SidebarLeft } from '../sidebar'

function DefaultLayout({ children }) {
    const rootRef = React.useRef(null)
    return (
        <>
            <div className='h-screen overflow-hidden flex'>
                <div className='hidden md:flex md:flex-shrink-0'>
                    <SidebarLeft rootRef={rootRef} />
                </div>
                <div className='flex flex-col mx-auto flex-1'>
                    <Header />
                    <div ref={rootRef} className='w-full relative overflow-y-scroll overflow-x-hidden'>
                        <div className='py-16 lg:pb-12'>
                            <div className='min-h-screen'>
                                <div className='max-w-3xl mx-auto px-2 sm:px-6 lg:max-w-7xl lg:px-8'>
                                    {children}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Toaster toastOptions={toastOptions} />
        </>
    )
}

export default DefaultLayout