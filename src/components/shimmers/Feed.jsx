import React, { useMemo } from 'react'
import PostCardShimmer from './PostCard'

function FeedShimmer({cols = 3}) {
    const cards = useMemo(() => Array(cols).fill(1), [])
    return (
        <div className='w-full'>
            <div className="flex flex-col">
                {cards.map((i, idx) => (
                    <PostCardShimmer key={`${i}_${idx}`} />
                ))}
            </div>
        </div>
    )
}

export default FeedShimmer