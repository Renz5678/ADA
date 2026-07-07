import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { AnimatePresence, motion } from "framer-motion";

export default function AppLayout() {
    const location = useLocation();

    return (
        <div className="w-screen h-screen flex overflow-hidden">
            <Sidebar />
            <div className="flex flex-col flex-1 overflow-hidden min-w-0">
                <Topbar />
                <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 flex flex-col">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.2, ease: "easeInOut" }}
                            className="w-full h-full flex flex-col flex-1"
                        >
                            <Outlet />
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
}