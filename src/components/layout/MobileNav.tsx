import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Layers, GraduationCap, Car, Trophy, Box } from 'lucide-react';

export const MobileNav: React.FC = () => {
  const links = [
    { label: 'Home', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Badges', path: '/badges', icon: Layers },
    { label: 'Crates', path: '/crates', icon: Box },
    { label: 'Rides', path: '/rides', icon: Car },
    { label: 'Academics', path: '/academics', icon: GraduationCap },
    { label: 'Compete', path: '/challenges', icon: Trophy },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-t border-[#E5E3DC] dark:border-neutral-800 px-2 py-1.5 flex items-center justify-around">
      {links.map((link) => {
        const Icon = link.icon;
        return (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-lg text-[10px] font-semibold transition-colors ${
                isActive ? 'text-[#F97316] font-bold' : 'text-[#737871] hover:text-[#171916] dark:hover:text-neutral-200'
              }`
            }
          >
            <Icon className="w-4 h-4" />
            <span>{link.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};
