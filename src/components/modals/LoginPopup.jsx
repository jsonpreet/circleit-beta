import { Dialog, Transition } from "@headlessui/react";
import React, { Fragment } from "react";

function LoginPopup({ showLoginPopup, setShowLoginPopup, loginWithDeso }) {
  return (
    <>
      <Transition appear show={showLoginPopup} as={Fragment}>
        <Dialog
          as='div'
          className='relative z-50'
          onClose={() => setShowLoginPopup(false)}>
          <Transition.Child
            as={Fragment}
            enter='ease-out duration-300'
            enterFrom='opacity-0'
            enterTo='opacity-100'
            leave='ease-in duration-200'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'>
            <div className='fixed inset-0 bg-black bg-opacity-70' />
          </Transition.Child>

          <div className='fixed inset-0 overflow-y-auto'>
            <div className='flex min-h-full items-center justify-center p-4 text-center'>
              <Transition.Child
                as={Fragment}
                enter='ease-out duration-300'
                enterFrom='opacity-0 scale-95'
                enterTo='opacity-100 scale-100'
                leave='ease-in duration-200'
                leaveFrom='opacity-100 scale-100'
                leaveTo='opacity-0 scale-95'>
                <Dialog.Panel className='w-full max-w-md sm:max-w-xl transform overflow-hidden rounded-2xl primaryBg primaryBorder border text-left align-middle shadow-xl transition-all'>
                  <Dialog.Title
                    as='h3'
                    className='text-lg py-4  px-6 font-semibold leading-6 border-b primaryBorder primaryTextColor'>
                    Join CircleIt using existing account or create new Account.
                  </Dialog.Title>
                  <div className='mt-4 px-6'>
                    <p className='primaryTextColor'>
                      Your Profile on CircleIt is a digital Identity accessible
                      only by you. Make sure you always save your account's
                      Secret phrase when you create new account. There is no way to recover or revoke your
                      secret phrase.
                    </p>
                  </div>
                  <div className='mt-6 flex flex-col items-center space-y-3  py-3 px-6 '>
                    <button
                      type='button'
                      className={`relative flex items-center justify-center space-x-2 rounded-lg border border-transparent px-4 py-2 text-md font-medium bg-pink-500 focus:outline-none text-white `}
                      onClick={() => loginWithDeso(true)}>
                      <span>Login with Existing Account</span>
                    </button>
                    <button
                      type='button'
                      className={`relative flex items-center justify-center space-x-2 rounded-lg border border-transparent px-5 py-2 text-md font-medium  focus:outline-none bg-[#7c3aed] text-white`}
                      onClick={() => loginWithDeso(true)}>
                      <span>Sign Up with New Account</span>
                    </button>
                  </div>
                  <div className='mt-6 flex justify-end space-x-4 py-3 px-6 secondaryBg'>
                    <button
                      type='button'
                      className='inline-flex justify-center rounded-full darkenBg border px-4 py-2 text-sm font-medium darkenHoverBg darkenBorder focus:outline-none'
                      onClick={() => setShowLoginPopup(false)}>
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
  );
}

export default LoginPopup;
