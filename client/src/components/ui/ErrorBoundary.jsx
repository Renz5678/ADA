import React from 'react';

export default class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, info) {
        console.error('[ErrorBoundary] Uncaught error:', error, info);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center h-full w-full p-8 gap-6 text-center bg-[#FFF7E6]">
                    <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-3xl">
                        ⚠️
                    </div>
                    <div className="flex flex-col gap-2">
                        <h2 className="text-xl font-headline font-semibold text-[#0F1D29]">Something went wrong</h2>
                        <p className="text-gray-500 font-body text-sm max-w-md">
                            An unexpected error occurred in this section. Try refreshing the page. If the problem persists, contact support.
                        </p>
                        {this.state.error && (
                            <p className="text-xs text-red-400 font-mono bg-red-50 rounded-lg px-4 py-2 mt-2 max-w-md break-all">
                                {this.state.error.message}
                            </p>
                        )}
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-2.5 rounded-xl bg-[#8D4A52] text-white font-body font-medium hover:bg-[#7a3e46] transition"
                    >
                        Reload Page
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}
