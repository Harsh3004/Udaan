import React from 'react'
import { useSelector } from 'react-redux';

const OpenRoute = () => {
    const {token} = useSelector((state) => state.auth);
  return (
    <div>
        {console.log("token: ", token)}
    </div>
  )
}

export default OpenRoute