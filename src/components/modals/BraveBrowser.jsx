import { Dialog, Transition } from '@headlessui/react'
import React, { Fragment } from 'react'

function BraveBrowserModal({ showModal, setShowModal, loginWithDeso }) {
    return (
        <>
            <Transition appear show={showModal} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setShowModal(false)}>
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
                                        Brave Browser Detected
                                    </Dialog.Title>
                                    <div className="mt-4 px-6">
                                        <p className="primaryTextColor">To continue using CircleIt on brave, Please disable Brave Shields</p>
                                    </div>

                                    <div className="mt-6 flex justify-end space-x-4 py-3 px-6 secondaryBg">
                                        <button
                                            type="button"
                                            className={`relative flex items-center justify-center space-x-2 rounded-full border border-transparent px-4 py-2 text-sm font-medium buttonBG focus:outline-none`}
                                            onClick={() => loginWithDeso(true, true)}
                                        >
                                            <span>Continue Anyway</span>
                                        </button>
                                        <button
                                            type="button"
                                            className="inline-flex justify-center rounded-full darkenBg border px-4 py-2 text-sm font-medium darkenHoverBg darkenBorder focus:outline-none"
                                            onClick={() => setShowModal(false)}
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

export default BraveBrowserModal