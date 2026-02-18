"use client";

import { supabase } from "@/lib/supabase";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import BookmarkForm from "@/components/BookmarkForm";
import BookmarkList from "@/components/BookmarkList";
import type { RealtimeChannel, User } from "@supabase/supabase-js";
import {
    LogOut,
    Bookmark,
    Star,
    Search,
    Filter,
    Menu,
    X,
} from "lucide-react";
import gsap from "gsap";
import Image from "next/image";

interface Bookmark {
    id: string;
    url: string;
    title: string;
    description: string | null;
    is_favorite: boolean | null;
    created_at: string;
    updated_at: string;
    user_id: string;
}

export default function BookmarksPage() {
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
    const [filteredBookmarks, setFilteredBookmarks] = useState<Bookmark[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const router = useRouter();
    const subscriptionRef = useRef<RealtimeChannel | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);

    // Filter bookmarks based on search
    useEffect(() => {
        const filtered = bookmarks.filter(
            (bookmark) => {
                const matchesFavorite = !showFavoritesOnly || Boolean(bookmark.is_favorite);
                const lowerSearch = searchQuery.toLowerCase();
                const matchesSearch =
                    bookmark.title.toLowerCase().includes(lowerSearch) ||
                    bookmark.url.toLowerCase().includes(lowerSearch) ||
                    (bookmark.description?.toLowerCase() || "").includes(lowerSearch);

                return matchesFavorite && matchesSearch;
            }
        );
        setFilteredBookmarks(filtered);
    }, [searchQuery, bookmarks, showFavoritesOnly]);

    useEffect(() => {
        const checkAuthAndLoadBookmarks = async () => {
            try {
                const {
                    data: { session },
                } = await supabase.auth.getSession();

                if (!session) {
                    router.push("/auth");
                    return;
                }

                setUser(session.user);
                await loadBookmarks();
                setupRealtimeListener();
            } catch (err) {
                console.error("Error:", err);
                setError("Failed to load bookmarks");
            } finally {
                setIsLoading(false);
            }
        };

        checkAuthAndLoadBookmarks();

        return () => {
            if (subscriptionRef.current) {
                subscriptionRef.current.unsubscribe();
            }
        };
    }, [router]);

    // Animate on mount
    useEffect(() => {
        if (!isLoading && headerRef.current) {
            gsap.from(headerRef.current, {
                opacity: 0,
                y: -20,
                duration: 0.6,
                ease: "power3.out",
            });
        }
    }, [isLoading]);

    const loadBookmarks = async () => {
        try {
            const {
                data: { session },
            } = await supabase.auth.getSession();

            if (!session?.user) return;

            const { data, error: err } = await supabase
                .from("bookmarks")
                .select("*")
                .eq("user_id", session.user.id)
                .order("created_at", { ascending: false });

            if (err) throw err;
            setBookmarks(data || []);
            setError(null);
        } catch (err) {
            console.error("Error loading bookmarks:", err);
            setError("Failed to load bookmarks");
        }
    };

    const setupRealtimeListener = async () => {
        const {
            data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user) return;

        subscriptionRef.current = supabase
            .channel(`bookmarks:${session.user.id}`)
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "bookmarks",
                    filter: `user_id=eq.${session.user.id}`,
                },
                async (payload) => {
                    const newRow = payload.new as Bookmark;
                    const oldRow = payload.old as Bookmark;

                    if (payload.eventType === "INSERT") {
                        if (newRow.user_id !== session.user.id) {
                            return;
                        }

                        setBookmarks((prev) => [newRow, ...prev]);
                    } else if (payload.eventType === "DELETE") {
                        if (oldRow.user_id !== session.user.id) {
                            return;
                        }

                        setBookmarks((prev) =>
                            prev.filter((b) => b.id !== oldRow.id)
                        );
                    } else if (payload.eventType === "UPDATE") {
                        if (newRow.user_id !== session.user.id) {
                            return;
                        }

                        setBookmarks((prev) =>
                            prev.map((b) =>
                                b.id === newRow.id
                                    ? newRow
                                    : b
                            )
                        );
                    }
                }
            )
            .subscribe();
    };

    const handleAddBookmark = async (
        url: string,
        title: string,
        description: string
    ) => {
        try {
            const {
                data: { session },
            } = await supabase.auth.getSession();

            if (!session?.user) return;

            const { error: err } = await supabase.from("bookmarks").insert([
                {
                    url,
                    title,
                    description: description || null,
                    user_id: session.user.id,
                },
            ]);

            if (err) throw err;
        } catch (err) {
            console.error("Error adding bookmark:", err);
            setError("Failed to add bookmark");
        }
    };

    const handleDeleteBookmark = async (id: string) => {
        try {
            if (!user) return;

            const { error: err } = await supabase
                .from("bookmarks")
                .delete()
                .eq("id", id)
                .eq("user_id", user.id);

            if (err) throw err;
        } catch (err) {
            console.error("Error deleting bookmark:", err);
            setError("Failed to delete bookmark");
        }
    };

    const handleUpdateBookmark = async (
        id: string,
        updates: Pick<Bookmark, "title" | "url" | "description">
    ) => {
        try {
            if (!user) return;

            const { error: err } = await supabase
                .from("bookmarks")
                .update({
                    title: updates.title.trim(),
                    url: updates.url.trim(),
                    description: updates.description?.trim() || null,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", id)
                .eq("user_id", user.id);

            if (err) throw err;
        } catch (err) {
            console.error("Error updating bookmark:", err);
            setError("Failed to update bookmark");
        }
    };

    const handleToggleFavorite = async (id: string, isFavorite: boolean) => {
        try {
            if (!user) return;

            const { error: err } = await supabase
                .from("bookmarks")
                .update({
                    is_favorite: !isFavorite,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", id)
                .eq("user_id", user.id);

            if (err) throw err;
        } catch (err) {
            console.error("Error updating favorite:", err);
            setError(
                "Failed to update favorite. Make sure your bookmarks table has an is_favorite column."
            );
        }
    };

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut();
            router.push("/auth");
        } catch (err) {
            console.error("Error logging out:", err);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-blue-50 via-blue-50 to-purple-50">
                <div className="relative w-20 h-20">
                    <div className="absolute inset-0 rounded-full border-4 border-indigo-200 animate-pulse"></div>
                    <div className="absolute inset-0 rounded-full border-t-4 border-indigo-600 animate-spin"></div>
                    <Bookmark className="absolute inset-0 m-auto w-8 h-8 text-indigo-600 opacity-50" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-blue-50 via-blue-50 to-purple-50">
            {/* Navigation */}
            <nav
                ref={headerRef}
                className="glass-effect backdrop-blur-md border-b border-white/20 sticky top-0 z-50 shadow-glow"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        {/* Logo */}
                        <div className="flex items-center gap-3">
                            <Image
                                src="/aob-logo.png"
                                alt="Art of Bookmarks Logo"
                                width={32}
                                height={32}
                            />
                            <div>
                                <h1 className="text-2xl font-bold gradient-text">
                                    Art of Bookmarks
                                </h1>
                                <p className="text-xs text-gray-500">Your bookmark sanctuary</p>
                            </div>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center gap-4">
                            {user && (
                                <div className="text-right">
                                    <p className="text-sm font-medium text-gray-900">
                                        {user.email?.split("@")[0]}
                                    </p>
                                    <p className="text-xs text-gray-500">{user.email}</p>
                                </div>
                            )}
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-red-500 to-pink-600 text-white rounded-lg hover:from-red-600 hover:to-pink-700 transition-all duration-200 font-semibold shadow-glow hover:shadow-glow-lg"
                            >
                                <LogOut className="w-4 h-4" />
                                Logout
                            </button>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 hover:bg-white/20 rounded-lg transition-colors"
                        >
                            {mobileMenuOpen ? (
                                <X className="w-6 h-6" />
                            ) : (
                                <Menu className="w-6 h-6" />
                            )}
                        </button>
                    </div>

                    {/* Mobile Menu */}
                    {mobileMenuOpen && (
                        <div className="md:hidden mt-4 pt-4 border-t border-white/20 space-y-4">
                            {user && (
                                <div className="text-sm">
                                    <p className="font-medium text-gray-900">{user.email}</p>
                                </div>
                            )}
                            <button
                                onClick={() => {
                                    handleLogout();
                                    setMobileMenuOpen(false);
                                }}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-linear-to-r from-red-500 to-pink-600 text-white rounded-lg hover:from-red-600 hover:to-pink-700 transition-all duration-200 font-semibold"
                            >
                                <LogOut className="w-4 h-4" />
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </nav>

            {/* Main Content */}
            <main ref={containerRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 text-red-700 rounded-xl flex items-center justify-between animate-fade-in-up">
                        <span className="font-medium">⚠️ {error}</span>
                        <button
                            onClick={() => setError(null)}
                            className="text-red-500 hover:text-red-700 font-bold"
                        >
                            ✕
                        </button>
                    </div>
                )}

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Form Section */}
                    <div>
                        <BookmarkForm onAddBookmark={handleAddBookmark} />
                    </div>

                    {/* Bookmarks Section */}
                    <div className="lg:col-span-2">
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                    <Bookmark className="w-6 h-6 text-indigo-600" />
                                    Your Bookmarks
                                    <span className="ml-2 text-sm bg-linear-to-r from-indigo-500 to-purple-500 text-white px-3 py-1 rounded-full font-semibold">
                                        {filteredBookmarks.length}
                                    </span>
                                </h2>

                                {bookmarks.length > 0 && (
                                    <button
                                        onClick={() => setShowFavoritesOnly((prev) => !prev)}
                                        className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${showFavoritesOnly
                                            ? "bg-amber-100 text-amber-700 border border-amber-300"
                                            : "bg-white/70 text-gray-700 border border-gray-200 hover:bg-white"
                                            }`}
                                    >
                                        <Star className="w-4 h-4" />
                                        {showFavoritesOnly ? "Showing Favorites" : "Show Favorites"}
                                    </button>
                                )}
                            </div>

                            {/* Search Bar */}
                            {bookmarks.length > 0 && (
                                <div className="relative">
                                    <Search className="absolute left-4 top-3.5 w-5 h-5 text-indigo-400 pointer-events-none" />
                                    <input
                                        type="text"
                                        placeholder="Search bookmarks, URLs, or descriptions..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                                    />
                                    {searchQuery && (
                                        <button
                                            onClick={() => setSearchQuery("")}
                                            className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Bookmarks List */}
                        {filteredBookmarks.length === 0 ? (
                            <div className="text-center py-16 glass-effect rounded-2xl shadow-glow">
                                {bookmarks.length === 0 ? (
                                    <>
                                        <Bookmark className="w-16 h-16 text-indigo-300 mx-auto mb-4" />
                                        <p className="text-gray-500 text-lg font-medium mb-2">
                                            No bookmarks yet
                                        </p>
                                        <p className="text-gray-400 text-sm">
                                            Start by adding your first bookmark using the form on the
                                            left
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <Filter className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                        <p className="text-gray-500 font-medium">
                                            No results for &quot;{searchQuery}&quot;
                                        </p>
                                        <p className="text-gray-400 text-sm mt-1">
                                            Try a different search term
                                        </p>
                                    </>
                                )}
                            </div>
                        ) : (
                            <BookmarkList
                                bookmarks={filteredBookmarks}
                                onDeleteBookmark={handleDeleteBookmark}
                                onUpdateBookmark={handleUpdateBookmark}
                                onToggleFavorite={handleToggleFavorite}
                            />
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
