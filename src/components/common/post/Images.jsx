import React, { useState } from 'react'
import SimpleImageSlider from "react-simple-image-slider";
import { Lightbox } from "react-modal-image";
import ModalImage from "react-modal-image";

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
      <div className='w-full relative mt-4 justify-center'>
        {images.length > 1 ?
          <div className='rounded-3xl simpleImageSlider w-full min-h-[300px] max-h-[300px] md:min-h-[600px] md:max-h-[800px] h-full'>
            <SimpleImageSlider
              width={`100%`}
              height={`100%`}
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
          <ModalImage
            small={images[0]}
            large={images[0]}
            hideDownload={true}
            alt={circle.Username}
          />
        }
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