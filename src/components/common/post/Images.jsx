import React, { useState } from "react";
import ModalImage from "react-modal-image";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
function PostImages({ images, circle }) {
  const [currentImage, setCurrentImage] = useState(images[0]);

  const chaangeImage = (direction) => {
    if (direction === "left") {
      const currentIndex = images.indexOf(currentImage);
      const nextIndex = currentIndex === 0 ? 0 : currentIndex - 1;
      setCurrentImage(images[nextIndex]);
    }
    if (direction === "right") {
      const currentIndex = images.indexOf(currentImage);
      const nextIndex =
        currentIndex === images.length - 1 ? currentIndex : currentIndex + 1;
      setCurrentImage(images[nextIndex]);
    }
  };

  return (
    <>
      <div className='relative mt-4 justify-center rounded-sm overflow-hidden'>
        {images.length > 1 ? (
          <div className='rounded-3xl simpleImageSlider flex items-center'>
            <button
              className='hover:bg-gray-100 dark:hover:bg-gray-700 py-8'
              onClick={() => chaangeImage("left")}>
              <BsChevronLeft size={24} />
            </button>
            <div className="w-full">
            <ModalImage
              small={currentImage}
              large={currentImage}
              hideDownload={true}
              className='min-h-[50px] !max-h-[300px] md:!max-h-[600px] h-full  rounded-md border-2 border-gray-100 dark:border-gray-800'
              alt={circle.Username}
            />
            </div>
            <button
              className='hover:bg-gray-100 dark:hover:bg-gray-700 py-8'
              onClick={() => chaangeImage("right")}>
              <BsChevronRight size={24} />
            </button>
          </div>
        ) : (
          images[0] !== "" && (
            <div>
              <ModalImage
                small={images[0]}
                large={images[0]}
                hideDownload={true}
                className='min-h-[50px] !max-h-[300px] md:!max-h-[600px] h-full rounded-md border-2 border-gray-100 dark:border-gray-800'
                alt={circle.Username}
              />
            </div>
          )
        )}
      </div>
    </>
  );
}

export default PostImages;
