import React from 'react';
import { NavLink } from 'react-router-dom';
import { navItems } from '../../static/data';

/**
 * Desktop / mobile secondary navigation (Home, Best Selling, Products, Events, FAQ).
 * Uses NavLink so the active route is auto-highlighted with the accept prop.
 */
const Navbar = () => {
    return (
        <nav aria-label="Primary" className="flex items-center flex-wrap -mx-2">
            {navItems.map((i, index) => (
                <NavLink
                    key={`${i.url}-${index}`}
                    to={i.url}
                    end={i.url === '/'}
                    className={({ isActive }) =>
                        `relative px-4 py-3 text-[15px] font-[500] transition-colors duration-150 ${
                            isActive
                                ? 'text-white'
                                : 'text-white/85 hover:text-white'
                        }`
                    }
                >
                    {({ isActive }) => (
                        <>
                            {i.title}
                            {isActive && (
                                <span
                                    aria-hidden="true"
                                    className="absolute inset-x-3 bottom-0 h-[3px] rounded-full bg-white"
                                />
                            )}
                        </>
                    )}
                </NavLink>
            ))}
        </nav>
    );
};

export default Navbar;