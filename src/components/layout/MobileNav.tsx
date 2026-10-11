import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, GraduationCap, Car, Trophy, MapPin } from 'lucide-react';

export const MobileNav: React.FC = () => {
  const links = [
    { label: 'Home', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Academics', path: '/academics', icon: GraduationCap },
    { label: 'Rides', path: '/rides', icon: Car },
    { label: 'Compete', path: '/challenges', icon: Trophy },
    { label: 'Guide', path: '/campus', icon: MapPin },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E5E3DC] px-2 py-1.5 flex items-center justify-around">
      {links.map((link) => {
        const Icon = link.icon;
        return (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg text-[10px] font-semibold transition-colors ${
                isActive ? 'text-[#F97316]' : 'text-[#737871] hover:text-[#171916]'
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
