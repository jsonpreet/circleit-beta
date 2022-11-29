import { Dialog, Transition } from '@headlessui/react'
import React, { Fragment } from 'react'
import toast from 'react-hot-toast';
import useApp from '../../store/app';
import DesoApi from '../../utils/DesoApi';
import { toastOptions } from '../../utils/Functions';

function CreatePostModal({showModal, setShowModal, circle}) {
  const deso = new DesoApi();
  const [postBody, setPostBody] = React.useState("");
  const [isPosting, setIsPosting] = React.useState(false);
  const { user } = useApp((state) => state);
  //let circleName = circle.Username.replace("Circle", "");
  let circleName = circle.Username;
  const submitPost = async (e) => {
    if (isPosting) return;
    setIsPosting(true);
    try {
      let finalPostBody = `${postBody}\n\nPosted on @CircleIt in @${circleName}`;
      let posterPublicKey =
        Object.keys(user).length === 0 ? "" : user.profile.PublicKeyBase58Check;
      const res = await deso.newPost(posterPublicKey, finalPostBody);
      const createdPostHashHex =
        res.submittedTransactionResponse.PostEntryResponse.PostHashHex;
      if (createdPostHashHex) {
        toast.success("Post created successfully", toastOptions);
        setPostBody("");
      } else {
        toast.error("Something went wrong", toastOptions);
      }

      setIsPosting(false);
    } catch (e) {
      console.log(e);
    }
  };
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
                                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl primaryBg primaryBorder border text-left align-middle shadow-xl transition-all">
                                    <Dialog.Title
                                        as="h3"
                                        className="text-lg py-4  px-6 font-semibold leading-6 border-b primaryBorder primaryTextColor"
                                    >
                                        Create Post
                                    </Dialog.Title>
                                    <div className='p-4 flex flex-col'>
                                        <div className='flex flex-row items-center'>
                                            <textarea className='w-full min-h-[40px] h-auto resize-none border rounded-lg outline-none px-4 py-2' placeholder='What is on your mind?'></textarea>
                                        </div>
                                        <div className='flex flex-row items-center justify-end mt-4'>
                                            <button className='font-medium text-white transition delay-75 px-6 py-1.5 rounded-full buttonBG'>Post</button>
                                        </div>
                                    </div>

                                    <div className="mt-6 flex justify-end space-x-4 py-3 px-6 secondaryBg">
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

export default CreatePostModal