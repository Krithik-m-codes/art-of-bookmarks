"use client";

import { supabase } from "@/lib/supabase";
import { useEffect, useLayoutEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import gsap from "gsap";
import { Bookmark, Zap, Shield, Cloud, Chrome } from "lucide-react";

export default function AuthPageClient() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSigningIn, setIsSigningIn] = useState(false);
    const [runtimeAuthError, setRuntimeAuthError] = useState<string | null>(null);
    const router = useRouter();
    const searchParams = useSearchParams();
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const checkAuth = async () => {
            const {
                data: { session },
            } = await supabase.auth.getSession();
            if (session) {
                router.push("/bookmarks");
            }
            setIsLoading(false);
        };

        checkAuth();
    }, [router]);

    const searchParamError = searchParams.get("error");
    const queryAuthError =
        searchParamError === "auth_failed"
            ? "Google sign-in failed. Please try again."
            : searchParamError === "no_code"
                ? "Sign-in was cancelled. Please continue with Google."
                : null;
    const authError = runtimeAuthError ?? queryAuthError;

    const handleGoogleSignIn = async () => {
        try {
            setRuntimeAuthError(null);
            setIsSigningIn(true);

            const { error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                    redirectTo: `${window.location.origin}/bookmarks`,
                },
            });

            if (error) {
                setRuntimeAuthError(error.message);
                setIsSigningIn(false);
            }
        } catch (error) {
            console.error("Google OAuth error:", error);
            setRuntimeAuthError("Unable to start Google sign-in.");
            setIsSigningIn(false);
        }
    };

    useLayoutEffect(() => {
        if (isLoading || !containerRef.current) {
            return;
        }

        const ctx = gsap.context(() => {
            const featureElements = gsap.utils.toArray<HTMLElement>("[data-feature]");

            const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

            tl.fromTo(
                ".auth-container",
                { autoAlpha: 0, y: 30 },
                { autoAlpha: 1, y: 0, duration: 0.8, clearProps: "opacity,visibility,transform" }
            );

            if (featureElements.length > 0) {
                tl.fromTo(
                    featureElements,
                    { autoAlpha: 0, x: -24 },
                    {
                        autoAlpha: 1,
                        x: 0,
                        duration: 0.55,
                        stagger: 0.1,
                        clearProps: "opacity,visibility,transform",
                    },
                    "-=0.45"
                );
            }

            gsap.to(".float-1", {
                y: -20,
                duration: 3,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut",
            });

            gsap.to(".float-2", {
                y: 20,
                duration: 4,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut",
                delay: 0.5,
            });

            gsap.to(".float-3", {
                y: -15,
                duration: 3.5,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut",
                delay: 1,
            });
        }, containerRef);

        return () => ctx.revert();
    }, [isLoading]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-blue-50 via-blue-50 to-purple-50">
                <div className="relative w-16 h-16">
                    <div className="absolute inset-0 rounded-full border-4 border-blue-200 animate-pulse"></div>
                    <div className="absolute inset-0 rounded-full border-t-4 border-indigo-600 animate-spin"></div>
                </div>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className="min-h-screen bg-linear-to-br from-blue-50 via-blue-50 to-purple-50 flex items-center justify-center p-4 overflow-hidden relative"
        >
            <div className="absolute top-10 left-10 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 float-1"></div>
            <div className="absolute top-40 right-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 float-2"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 float-3"></div>

            <div className="relative z-10 w-full max-w-5xl grid lg:grid-cols-2 gap-12 items-center">
                <div className="hidden lg:flex flex-col gap-8">
                    <div className="mb-4">
                        <h1 className="text-5xl font-bold gradient-text mb-3">
                            Art of Bookmarks
                        </h1>
                        <p className="text-gray-600 text-lg">
                            Your personal bookmark sanctuary
                        </p>
                    </div>

                    {[
                        {
                            icon: Bookmark,
                            title: "Smart Organization",
                            desc: "Save and manage all your bookmarks in one beautiful place",
                        },
                        {
                            icon: Zap,
                            title: "Real-time Sync",
                            desc: "See changes instantly across all your devices",
                        },
                        {
                            icon: Shield,
                            title: "Private & Secure",
                            desc: "Your bookmarks are encrypted and only visible to you",
                        },
                        {
                            icon: Cloud,
                            title: "Cloud Powered",
                            desc: "Access anywhere, anytime, on any device",
                        },
                    ].map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <div
                                key={index}
                                data-feature
                                className="glass-effect rounded-xl p-4 hover:shadow-glow hover:bg-white/90 transition-all cursor-pointer group"
                            >
                                <div className="flex gap-4 items-start">
                                    <div className="p-3 bg-linear-to-br from-indigo-500 to-purple-500 rounded-lg group-hover:shadow-glow transition-all">
                                        <Icon className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-1">
                                            {feature.title}
                                        </h3>
                                        <p className="text-sm text-gray-600">{feature.desc}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="auth-container">
                    <div className="glass-effect rounded-2xl p-8 shadow-glow-lg">
                        <div className="mb-8 text-center">
                            <div className="inline-block p-3 bg-linear-to-br from-indigo-500 to-purple-500 rounded-xl mb-4">
                                <Bookmark className="w-8 h-8 text-white" />
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">
                                Welcome Back
                            </h2>
                            <p className="text-gray-600">Continue with Google to sign in or sign up</p>
                        </div>

                        {authError && (
                            <div className="mb-4 p-3 rounded-lg border border-red-200 bg-red-50 text-sm text-red-700">
                                {authError}
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={handleGoogleSignIn}
                            disabled={isSigningIn}
                            className="w-full inline-flex items-center justify-center gap-3 rounded-xl px-4 py-3 bg-white border border-gray-200 text-gray-800 font-semibold hover:bg-gray-50 transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {isSigningIn ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                    Redirecting to Google...
                                </>
                            ) : (
                                <>
                                    <Chrome className="w-5 h-5 text-indigo-600" />
                                    Continue with Google
                                </>
                            )}
                        </button>

                        <p className="mt-3 text-xs text-gray-500 text-center">
                            Email/password sign-in is disabled for this app.
                        </p>

                        <div className="mt-8 pt-8 border-t border-gray-200">
                            <p className="text-xs text-gray-500 text-center">
                                By signing in, you agree to our Terms of Service and Privacy
                                Policy
                            </p>
                        </div>
                    </div>

                    <div className="lg:hidden mt-8">
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { title: "Save", desc: "Your links" },
                                { title: "Sync", desc: "Everywhere" },
                                { title: "Private", desc: "& Secure" },
                                { title: "Cloud", desc: "Powered" },
                            ].map((item, index) => (
                                <div
                                    key={index}
                                    className="glass-effect rounded-lg p-3 text-center hover:bg-white/90 transition-all"
                                >
                                    <p className="font-semibold text-gray-900 text-sm">
                                        {item.title}
                                    </p>
                                    <p className="text-xs text-gray-600">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
