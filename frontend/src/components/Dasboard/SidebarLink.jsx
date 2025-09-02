import React from 'react'
import * as icons from "react-icons/vsc"
import { useDispatch } from 'react-redux';
import { matchPath, NavLink, useLocation } from 'react-router-dom';

export const SidebarLink = ({data}) => {
    const Icon = icons[data.icon];
    const location = useLocation();
    const dispatch = useDispatch();

    const matchRoute = (route) => {
      return matchPath({path: route}, location.pathname);
    }

    return (
      <NavLink  
        to={data.path}
        className={`relative flex ${matchRoute(data.path) ? "bg-yellow-50 text-rich-black-900 " : "bg-opacity-0"}`}
      >
        <span className={`absolute left-0 top-0 h-full w-[0.5rem] bg-yellow-600 ${matchRoute(data.path) ? "opacity-100" : "opacity-0"}`}>
        </span>

        <div className='flex gap-4 items-center p-4 px-8'>
            <Icon className='text-lg'></Icon>
            <span>{data.name}</span>
        </div>
      </NavLink>
    )
}
