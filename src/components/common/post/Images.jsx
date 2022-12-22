import React, { useState } from 'react'
import SimpleImageSlider from "react-simple-image-slider";
import ModalImage, { Lightbox } from "react-modal-image";

function PostImages({images, circle}) {
  const [openLightbox, setOpenLightbox] = useState(false);
  const [currentImage, setCurrentImage] = useState('');
  

  const closeLightbox = () => {
      setOpenLightbox(false);
  }

  const onImageClicked = (index, event) => {
      event.preventDefault();
      console.log(index);
      setCurrentImage(images[index]);
      setOpenLightbox(true);
  }
  return (
    <>
      <div className='relative mt-4 justify-center rounded-sm'>
        <div>
          <ModalImage
            small={images[0]}
            large={images[0]}
            hideDownload={true}
            className='min-h-[50px] !max-h-[300px] md:!max-h-[600px] h-full'
            alt={circle.Username}
          />
        </div>
        {/* {images.length > 1 ?
          <div className='rounded-3xl simpleImageSlider w-full min-h-[50px] max-h-[300px] md:min-h-[200px] md:max-h-[700px] h-full'>
            <SimpleImageSlider
              width={`100%`}
              height={`600px`}
              images={images}
              showBullets={false}
              showNavs={true}
              alt={circle.Username}
              style={{borderRadius: '1.5rem'}}
              onClick={(idx, event) => onImageClicked(idx, event)}
            />
          </div>
          :
          images[0] !== '' && 
          <div>
            <ModalImage
              small={images[0]}
              large={images[0]}
              hideDownload={true}
              className='min-h-[50px] !max-h-[300px] md:!max-h-[600px] h-full'
              alt={circle.Username}
            />
          </div>
        } */}
        {openLightbox && (
          <Lightbox
            medium={currentImage}
            large={currentImage}
            alt="CircleIt"
            onClose={closeLightbox}
          />
        )}
      </div>
    </>
  )
}

export default PostImages