import { Link } from "react-router";

// Assume these icons are imported from an icon library
import { GridIcon, HorizontaLDots, GroupIcon, VideoIcon, AudioIcon, UserCircleIcon } from "../icons";
import { IoGameControllerOutline } from "react-icons/io5";


import { useSidebar } from "../context/SidebarContext";
import React from "react";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path: string;
  subItems?: { name: string; path: string; }[];
};

const navItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    path: '/dashboard',
  },
  {
    icon: <VideoIcon />,
    name: "Video Playlist",
    path: '/video-playlist',
  },
  {
    icon: <AudioIcon />,
    name: "Audio Playlist",
    path: '/audio-playlist',
  },
  {
    icon: <GroupIcon />,
    name: "Users",
    path: '/users',
  },
  {
    icon: <UserCircleIcon />,
    name: "Profile Pictures",
    path: '/profile-picture',
  },
  {
    icon: <IoGameControllerOutline />,
    name: "Games",
    path: '/games',
  },
];




const AppSidebar: React.FC = () => {

  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${isExpanded || isMobileOpen ? "w-[290px]" : isHovered ? "w-[290px]" : "w-[90px]"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`py-8 flex ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"}`} >
        <Link to="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <img
                className="dark:hidden"
                src="/images/logo/logo-black.png"
                alt="Logo"
                width={250}
              />
              <img
                className="hidden dark:block"
                src="/images/logo/logo-white.png"
                alt="Logo"
                width={250}
                height={40}
              />
            </>
          ) : (
            <img
              src="/images/logo/logo-icon.png"
              alt="Logo"
              width={50}
              height={50}
            />
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2 className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"}`} >
                {isExpanded || isHovered || isMobileOpen ? ("Menu") : (<HorizontaLDots className="size-6" />)}
              </h2>

              <ul className="flex flex-col gap-4">
                {
                  navItems.map((ele, i) => {
                    return (
                      <li key={i}>
                        <Link to={ele.path} className="menu-item group menu-item-inactive">
                          <span className="menu-item-icon-size menu-item-icon-active">{ele.icon}</span>
                          {isExpanded || isHovered ? <span className="menu-item-text">{ele.name}</span> : <></>}
                        </Link>
                      </li>
                    )
                  })
                }
              </ul>
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
