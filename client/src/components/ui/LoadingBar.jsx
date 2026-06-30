import nProgress from "nprogress";
import "nprogress/nprogress.css"

nProgress.configure({ showSpinner: false, speed: 400, minimum: 0.1 });

export default function LoadingBar({ isLoading, message = "Please wait..." }) {
    if (!isLoading) return null;
    return (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex justify-center items-center">
            <div className="bg-white rounded-2xl p-8 flex flex-col items-center gap-4 shadow-lg">
                <div className="w-10 h-10 border-4 border-[#CBA0AA] border-t-[#8D4A52] rounded-full animate-spin" />
                <p className="text-sm font-medium text-[#0F1D29] font-body">{message}</p>
            </div>
        </div>
    );
}