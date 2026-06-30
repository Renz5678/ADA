import { useState } from "react";
import LoadingBar from "#components/ui/LoadingBar.jsx";
import AppRouter from "#routes/AppRouter.jsx";

export default function App() {
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");

    const startLoading = (message) => { setLoadingMessage(message); setIsLoading(true); };
    const stopLoading = () => { setIsLoading(false); setLoadingMessage(""); };

    return (
        <>
            <LoadingBar isLoading={isLoading} message={loadingMessage} />
            <AppRouter onStart={startLoading} onStop={stopLoading} />
        </>
    );
}