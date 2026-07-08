import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";
import StatusBar from "../components/layout/StatusBar";
import ScrollToTop from "../components/layout/ScrollToTop";
import { Outlet } from "react-router-dom";

function MainLayout() {
  return (
    <div className="app-shell flex min-h-screen">
      <ScrollToTop />
      <div className="dot-grid" />
      <div className="mesh-gradient" />

      <div className="relative z-10 flex min-h-screen flex-1">
        <Sidebar />
        <div className="flex min-h-0 flex-1 flex-col">
          <Navbar />
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-5 md:p-7 lg:p-8">
            <div className="mx-auto w-full max-w-[1600px]">
              <Outlet />
            </div>
          </main>
          <StatusBar />
        </div>
      </div>
    </div>
  );
}

export default MainLayout;
