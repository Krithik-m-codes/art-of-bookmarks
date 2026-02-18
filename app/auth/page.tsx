import { Suspense } from "react";
import AuthPageClient from "./AuthPageClient";

function AuthPageFallback() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-blue-50 via-blue-50 to-purple-50">
            <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-4 border-blue-200 animate-pulse"></div>
                <div className="absolute inset-0 rounded-full border-t-4 border-indigo-600 animate-spin"></div>
            </div>
        </div>
    );
}

export default function AuthPage() {
    return (
        <Suspense fallback={<AuthPageFallback />}>
            <AuthPageClient />
        </Suspense>
    );
}
