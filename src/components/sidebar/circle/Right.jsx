
import ProfileCard from "../../cards/ProfileCard";


function SidebarRight({circle}) {
    

    return (
        <>
            <div className='flex flex-col md:w-96 md:ml-6'>
                <ProfileCard circle={circle}/>
            </div>
        </>
    )
}

export default SidebarRight