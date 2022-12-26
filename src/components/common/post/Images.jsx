import ModalImage from "react-modal-image";
import { getAttachmentsClass } from "../../../utils/Functions";
import { useParams } from "react-router-dom";


function PostImages({ images, circle }) {
  const router = useParams()

  const isPostPage = router?.postID !== undefined && router?.postID !== '' ? true : false

  const splicedImages = images?.length === 3 ? images?.slice(0, 2) : images?.length > 4 ? images?.slice(0, 4) : images

  const attachments = isPostPage ? images : splicedImages
  
  return (
    <>
      <div className='relative mt-4 justify-center rounded-sm overflow-hidden'>
        <div className={`${getAttachmentsClass(attachments.length).row} grid gap-2 pt-3`}>
          {attachments.map((image, index) => (
            <div
              key={index}
              className={`relative ${getAttachmentsClass(attachments.length).aspect} ${
                      attachments?.length === 3 && index === 0 ? '' : ''
                    }`}>
              <ModalImage
                small={image}
                large={image}
                hideDownload={true}
                className='min-h-[50px] !max-h-[300px] md:!max-h-[600px] h-full rounded-md border border-gray-100 dark:border-gray-800'
                alt={circle.Username}
              />
              {!isPostPage && images?.length > 4 && index === 3 && (
                (
                  <div className='absolute inset-0 bg-black bg-opacity-50 flex items-center rounded-md justify-center'>
                    <span className='text-white text-2xl font-bold'>
                      +{images?.length - 4}
                    </span>
                  </div>
                )
              )}
              {!isPostPage && images?.length === 3 && index === 1 && (
                (
                  <div className='absolute inset-0 rounded-md bg-black bg-opacity-50 flex items-center justify-center'>
                    <span className='text-white text-2xl font-bold'>
                      +{images?.length - 2}
                    </span>
                  </div>
                )
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default PostImages;
