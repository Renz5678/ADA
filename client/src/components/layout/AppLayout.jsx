import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function AppLayout() {
    return (
        <div className="w-screen h-screen flex overflow-hidden">
            <Sidebar />
            <div className="flex flex-col flex-1 overflow-hidden">
                <Topbar />
                <main className="flex-1 overflow-y-auto p-6 flex flex-col">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}