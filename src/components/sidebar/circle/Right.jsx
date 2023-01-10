import ProfileCard from "../../cards/ProfileCard";

function SidebarRight({ circle }) {
  return (
    <>
      <div className='flex flex-col  md:ml-6 w-full sm:w-96'>
        <ProfileCard circle={circle} />
      </div>
    </>
  );
}

export default SidebarRight;
