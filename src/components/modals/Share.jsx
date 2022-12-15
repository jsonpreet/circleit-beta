import {
  FacebookShareButton,
  FacebookIcon,
  PinterestShareButton,
  PinterestIcon,
  RedditShareButton,
  RedditIcon,
  TwitterShareButton,
  TwitterIcon,
  WhatsappShareButton,
  WhatsappIcon,
  EmailShareButton,
  EmailIcon,
  LinkedinShareButton,
  LinkedinIcon,
  TelegramShareButton,
  TelegramIcon,
  TumblrShareButton,
  TumblrIcon,
} from 'react-share';
import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react';
import { APP } from '../../utils/Constants';
import { truncate } from '../../utils/Functions';
import { MdOutlineClose } from 'react-icons/md'

const ShareModal = ({ rootRef, show, setShowShare, post, autoClose = true }) => {
    return (
        <>
            <Transition appear show={show} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => (autoClose ? null : setShowShare(false))}>
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
                                <Dialog.Panel className="w-full max-w-xl transform overflow-hidden rounded-2xl primaryBg primaryBorder border text-left align-middle shadow-xl transition-all">
                                    <div className="flex items-center justify-between  w-full border-b primaryBorder">
                                        <Dialog.Title
                                            as="h3"
                                            className="text-lg py-4 px-6 font-semibold leading-6 primaryTextColor"
                                        >
                                            Share
                                        </Dialog.Title>
                                        <button
                                            className='relative inline-block disabled:opacity-50 rounded-full group px-5 md:py-2 py-1.5 text-sm md:rounded-full'
                                            onClick={() => setShowShare(false)}
                                        >
                                            <MdOutlineClose size={22} />
                                        </button>
                                    </div>
                                    <div className="w-full pt-5 px-5 md:pt-8 pb-5">
                                        <div className="md:flex grid grid-cols-5 md:grid-cols-1 md:items-center pb-4 md:gap-0 gap-3 flex-nowrap max-w-md">
                                            <div className='md:mr-4 mr-0'>
                                                <WhatsappShareButton
                                                    url={`${APP.URL}/${post.PostHashHex}`}
                                                    title={post.Body ? truncate(post.Body, 200) : APP.Description}
                                                    separator=":: "
                                                >
                                                    <WhatsappIcon size={44} round />
                                                </WhatsappShareButton>
                                            </div>
                                            <div className='md:mr-4 mr-0'>
                                                <TwitterShareButton
                                                    url={`${APP.URL}/${post.PostHashHex}`}
                                                    title={`${post.Body ? truncate(post.Body, 200) : APP.Description}`}
                                                    via={APP.Twitter}
                                                >
                                                    <TwitterIcon size={44} round />
                                                </TwitterShareButton>
                                            </div>
                                            <div className='md:mr-4 mr-0'>
                                                <FacebookShareButton
                                                    url={`${APP.URL}/${post.PostHashHex}`}
                                                    quote={`${post.Body ? truncate(post.Body, 200) : APP.Description} via ${APP.Twitter}`}
                                                    hashtag={'#CircleIt'}
                                                >
                                                    <FacebookIcon size={44} round />
                                                </FacebookShareButton>
                                            </div>
                                            <div className='md:mr-4 mr-0'>
                                                <EmailShareButton
                                                    url={`${APP.URL}/${post.PostHashHex}`}
                                                    subject={APP.Name}
                                                    body={post.Body ? truncate(post.Body, 200) : APP.Description}
                                                >
                                                    <EmailIcon size={44} round />
                                                </EmailShareButton>
                                            </div>
                                            <div className='md:mr-4 mr-0'>
                                                <PinterestShareButton
                                                    url={`${APP.URL}/${post.PostHashHex}`}
                                                    description={`${post.Body ? truncate(post.Body, 200) : APP.Description} via ${APP.Twitter}`}
                                                >
                                                    <PinterestIcon size={44} round />
                                                </PinterestShareButton>
                                            </div>
                                            <div className='md:mr-4 mr-0'>
                                                <RedditShareButton
                                                    url={`${APP.URL}/${post.PostHashHex}`}
                                                    title={`${post.Body ? truncate(post.Body, 200) : APP.Description} via ${APP.Twitter}`}
                                                >
                                                    <RedditIcon size={44} round />
                                                </RedditShareButton>
                                            </div>
                                            <div className='md:mr-4 mr-0'>
                                                <LinkedinShareButton
                                                    source={`${APP.URL}/${post.PostHashHex}`}
                                                    title={`Post by ${post.ProfileEntryResponse.Username}`}
                                                    summary={`${post.Body ? truncate(post.Body, 200) : APP.Description}`}>
                                                    <LinkedinIcon size={44} round />
                                                </LinkedinShareButton>
                                            </div>
                                            <div className='md:mr-4 mr-0'>
                                                <TelegramShareButton
                                                    url={`${APP.URL}/${post.PostHashHex}`}
                                                    quote={`${post.Body ? truncate(post.Body, 200) : APP.Description} via ${APP.Twitter}`}
                                                >
                                                    <TelegramIcon size={44} round />
                                                </TelegramShareButton>
                                            </div>
                                            <div className='md:mr-4 mr-0'>
                                                <TumblrShareButton
                                                    url={`${APP.URL}/${post.PostHashHex}`}
                                                    quote={`${post.Body ? truncate(post.Body, 200) : APP.Description} via ${APP.Twitter}`}
                                                >
                                                    <TumblrIcon size={44} round />
                                                </TumblrShareButton>
                                            </div>
                                        </div>
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

export default ShareModal;