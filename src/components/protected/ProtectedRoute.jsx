import React from 'react'
import { Navigate } from 'react-router-dom';
import useApp from '../../store/app';

function ProtectedRoute({ children }) {
    const { isLoggedIn } = useApp();
    if (!isLoggedIn) {
        // user is not authenticated
        return <Navigate to="/" />;
    }
    return children;
}

export default ProtectedRoute