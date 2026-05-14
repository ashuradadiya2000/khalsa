import { SidebarProvider, useSidebar } from "../context/SidebarContext";
import { Outlet } from "react-router";
import AppHeader from "./AppHeader";
import Backdrop from "./Backdrop";
import AppSidebar from "./AppSidebar";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { authStorage } from "../utils/login";
import { AuthActionTypes } from "../store/reducers/auth";

const LayoutContent: React.FC = () => {

  const dispatch = useDispatch()
  const [search, setSearch] = useState('');

  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  useEffect(() => {
    if (!authStorage.authToken) {
      dispatch({
        type: AuthActionTypes.AUTH_FAILURE
      })
    }
  }, [])



  return (
    <div className="min-h-screen xl:flex">
      <div>
        <AppSidebar />
        <Backdrop />
      </div>
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${isExpanded || isHovered ? "lg:ml-[290px]" : "lg:ml-[90px]"
          } ${isMobileOpen ? "ml-0" : ""}`}
      >
        <AppHeader setSearch={setSearch} search={search} />
        <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">
          <Outlet
            context={{
              search
            }}
          />
        </div>
      </div>
    </div>
  );
};

const AppLayout: React.FC = () => {
  return (
    <SidebarProvider>
      <LayoutContent />
    </SidebarProvider>
  );
};

export default AppLayout;
