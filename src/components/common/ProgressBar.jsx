import React from 'react'

const ProgressBar = ({progress, height}) => {
	const Parentdiv = {
		height: height,
	}
	
	const Childdiv = {
		width: `${progress}%`,
	}
		
	return (
	<div className='w-full my-5 anotherDarkBG rounded-full' style={Parentdiv}>
        <div className='buttonBG text-right rounded-full' style={Childdiv}>
            <span className='text-sm px-3 text-white'>{`${progress}%`}</span>
        </div>
	</div>
	)
}
export default ProgressBar;