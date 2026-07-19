import { MdLockOutline, MdAutoAwesome } from 'react-icons/md';

export default function DigestView({ digestData, isFetching }) {
    if (isFetching) {
        return (
            <div className="flex-1 min-h-0 flex flex-col justify-center items-center opacity-60 animate-pulse h-full">
                <div className="h-10 w-10 rounded-full bg-indigo-100 mb-4"></div>
                <div className="h-4 w-48 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 w-64 bg-gray-200 rounded"></div>
            </div>
        );
    }

    if (!digestData || !digestData.digest) {
        return (
            <div className="flex-1 min-h-0 flex flex-col justify-center items-center text-center p-6 h-full border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                <div className="bg-white p-4 rounded-full mb-4 shadow-sm border border-gray-100">
                    <MdLockOutline className="text-gray-400 w-8 h-8" />
                </div>
                <h3 className="font-headline font-semibold text-gray-800 text-lg mb-2">Daily Digest Locked</h3>
                <p className="text-sm text-gray-500 max-w-[280px]">
                    Add more orders and products to unlock your personalized AI daily digest.
                </p>
            </div>
        );
    }

    return (
        <div className="flex-1 min-h-0 flex flex-col justify-center p-6 bg-gradient-to-br from-indigo-50/80 to-purple-50/80 rounded-xl relative overflow-hidden h-full border border-indigo-100 shadow-inner">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <MdAutoAwesome className="w-32 h-32 text-indigo-600" />
            </div>
            
            <div className="relative z-10 flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                    <MdAutoAwesome className="text-indigo-500 w-5 h-5" />
                    <span className="text-xs font-bold tracking-wider uppercase text-indigo-600">Today's Insight</span>
                </div>
                <p className="text-[#0F1D29] text-base md:text-lg leading-relaxed font-medium">
                    {digestData.digest.content}
                </p>
            </div>
        </div>
    );
}
