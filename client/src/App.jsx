import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from 'react-hot-toast';
import { SpeedInsights } from '@vercel/speed-insights/react';
import LoadingBar from "#components/ui/LoadingBar.jsx";
import AppRouter from "#routes/AppRouter.jsx";
import ErrorBoundary from "#components/ui/ErrorBoundary.jsx";

const queryClient = new QueryClient();

export default function App() {
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");

    const startLoading = (message) => { setLoadingMessage(message); setIsLoading(true); };
    const stopLoading = () => { setIsLoading(false); setLoadingMessage(""); };

    return (
        <>
            <QueryClientProvider client={queryClient}>
                <ErrorBoundary>
                    <Toaster
                        position="top-right"
                        toastOptions={{
                            duration: 3500,
                            style: {
                                borderRadius: '12px',
                                background: '#0F1D29',
                                color: '#fff',
                                fontFamily: 'var(--font-body, sans-serif)',
                                fontSize: '14px',
                                padding: '12px 16px'
                            },
                            success: {
                                iconTheme: { primary: '#4ade80', secondary: '#0F1D29' }
                            },
                            error: {
                                iconTheme: { primary: '#f87171', secondary: '#0F1D29' }
                            }
                        }}
                    />
                    <LoadingBar isLoading={isLoading} message={loadingMessage} />
                    <AppRouter onStart={startLoading} onStop={stopLoading} />
                    <SpeedInsights />
                </ErrorBoundary>
            </QueryClientProvider>
        </>
    );
}