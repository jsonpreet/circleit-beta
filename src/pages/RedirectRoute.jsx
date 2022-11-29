import React from 'react'
import { useNavigate } from 'react-router-dom';

function RedirectRoute() {
    
    const navigate = useNavigate();
    
    React.useEffect(() => {
        navigate('/');
    }, [navigate]);

    return (
        <>
        </>
    )
}

export default RedirectRoute