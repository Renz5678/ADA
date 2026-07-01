import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import LoadingBar from "#components/ui/LoadingBar.jsx";
import AppRouter from "#routes/AppRouter.jsx";

const queryClient = new QueryClient();

export default function App() {
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");

    const startLoading = (message) => { setLoadingMessage(message); setIsLoading(true); };
    const stopLoading = () => { setIsLoading(false); setLoadingMessage(""); };

    return (
        <>
            <QueryClientProvider client={queryClient}>
                <LoadingBar isLoading={isLoading} message={loadingMessage} />
                <AppRouter onStart={startLoading} onStop={stopLoading} />
            </QueryClientProvider>
        </>
    );
}