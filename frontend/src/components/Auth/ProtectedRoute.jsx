import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Error } from '../../pages/Error';

const ProtectedRoute = (props) => {
    const {token} = useSelector((state) => state.auth);
    return token ? props.children : <Navigate to="/login" replace />;
}

export default ProtectedRoute