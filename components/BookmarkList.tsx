"use client";

import { useState, useRef, useLayoutEffect } from "react";
import {
    ExternalLink,
    Trash2,
    Globe,
    Copy,
    Check,
    Star,
    Pencil,
    Save,
    X,
} from "lucide-react";
import gsap from "gsap";

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

interface BookmarkListProps {
    bookmarks: Bookmark[];
    onDeleteBookmark: (id: string) => Promise<void>;
    onUpdateBookmark: (
        id: string,
        updates: Pick<Bookmark, "title" | "url" | "description">
    ) => Promise<void>;
    onToggleFavorite: (id: string, isFavorite: boolean) => Promise<void>;
}

export default function BookmarkList({
    bookmarks,
    onDeleteBookmark,
    onUpdateBookmark,
    onToggleFavorite,
}: BookmarkListProps) {
    const [deleting, setDeleting] = useState<string | null>(null);
    const [updating, setUpdating] = useState<string | null>(null);
    const [copied, setCopied] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState("");
    const [editUrl, setEditUrl] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        if (containerRef.current && bookmarks.length > 0) {
            const ctx = gsap.context(() => {
                const items = gsap.utils.toArray<HTMLElement>("[data-bookmark-item]");
                gsap.fromTo(
                    items,
                    { autoAlpha: 0, y: 20 },
                    {
                        autoAlpha: 1,
                        y: 0,
                        duration: 0.5,
                        stagger: 0.05,
                        ease: "power3.out",
                        clearProps: "opacity,visibility,transform",
                    }
                );
            }, containerRef);

            return () => ctx.revert();
        }
    }, [bookmarks.length]);

    const handleDelete = async (id: string) => {
        const deleteRef = containerRef.current?.querySelector<HTMLDivElement>(
            `[data-id="${id}"]`
        );

        if (deleteRef) {
            gsap.to(deleteRef, {
                opacity: 0,
                x: 100,
                duration: 0.4,
                ease: "power2.in",
            });
        }

        setDeleting(id);
        try {
            await onDeleteBookmark(id);
        } catch (error) {
            console.error("Error:", error);
            setDeleting(null);
            if (deleteRef) {
                gsap.to(deleteRef, {
                    opacity: 1,
                    x: 0,
                    duration: 0.4,
                    ease: "power2.out",
                });
            }
        }
    };

    const handleCopyUrl = (url: string, id: string) => {
        navigator.clipboard.writeText(url);
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
    };

    const startEdit = (bookmark: Bookmark) => {
        setEditingId(bookmark.id);
        setEditTitle(bookmark.title);
        setEditUrl(bookmark.url);
        setEditDescription(bookmark.description || "");
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditTitle("");
        setEditUrl("");
        setEditDescription("");
    };

    const validateUrl = (urlString: string) => {
        try {
            new URL(urlString);
            return true;
        } catch {
            return false;
        }
    };

    const saveEdit = async (bookmarkId: string) => {
        if (!editTitle.trim() || !editUrl.trim()) {
            return;
        }

        if (!validateUrl(editUrl.trim())) {
            return;
        }

        setUpdating(bookmarkId);
        try {
            await onUpdateBookmark(bookmarkId, {
                title: editTitle,
                url: editUrl,
                description: editDescription || null,
            });

            cancelEdit();
        } finally {
            setUpdating(null);
        }
    };

    const handleFavorite = async (bookmark: Bookmark) => {
        setUpdating(bookmark.id);
        try {
            await onToggleFavorite(bookmark.id, Boolean(bookmark.is_favorite));
        } finally {
            setUpdating(null);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const getDomain = (urlString: string) => {
        try {
            const url = new URL(urlString);
            return url.hostname.replace("www.", "");
        } catch {
            return urlString;
        }
    };

    return (
        <div ref={containerRef} className="space-y-4">
            {bookmarks.map((bookmark) => (
                <div
                    key={bookmark.id}
                    data-id={bookmark.id}
                    data-bookmark-item
                    className="glass-effect rounded-xl p-5 hover:shadow-glow transition-all duration-200 group hover:bg-white/80 backdrop-blur-sm border-2 border-transparent hover:border-indigo-200"
                >
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                            {editingId === bookmark.id ? (
                                <div className="space-y-3">
                                    <input
                                        value={editTitle}
                                        onChange={(e) => setEditTitle(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white"
                                        placeholder="Bookmark title"
                                    />
                                    <input
                                        value={editUrl}
                                        onChange={(e) => setEditUrl(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white"
                                        placeholder="https://example.com"
                                    />
                                    <textarea
                                        value={editDescription}
                                        onChange={(e) => setEditDescription(e.target.value)}
                                        rows={2}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white resize-none"
                                        placeholder="Description (optional)"
                                    />
                                </div>
                            ) : (
                                <>
                                    {/* Title and Domain */}
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-linear-to-br from-indigo-100 to-purple-100 rounded-lg group-hover:shadow-glow-sm transition-all">
                                            <Globe className="w-4 h-4 text-indigo-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <a
                                                href={bookmark.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:text-blue-800 font-semibold truncate block hover:underline transition-colors"
                                            >
                                                {bookmark.title}
                                            </a>
                                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md inline-block mt-1">
                                                {getDomain(bookmark.url)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    {bookmark.description && (
                                        <p className="text-gray-600 text-sm mb-3 leading-relaxed">
                                            {bookmark.description}
                                        </p>
                                    )}

                                    {/* URL and Date */}
                                    <div className="flex items-center gap-2 text-xs text-gray-500 flex-wrap">
                                        <a
                                            href={bookmark.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="truncate hover:text-gray-700 transition-colors max-w-xs"
                                            title={bookmark.url}
                                        >
                                            {bookmark.url}
                                        </a>
                                        <span>•</span>
                                        <span>{formatDate(bookmark.created_at)}</span>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="shrink-0 flex gap-2">
                            {editingId === bookmark.id ? (
                                <>
                                    <button
                                        onClick={() => saveEdit(bookmark.id)}
                                        disabled={updating === bookmark.id}
                                        className="shrink-0 p-2 text-gray-500 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg transition-all duration-200 disabled:opacity-50"
                                        title="Save changes"
                                    >
                                        <Save className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={cancelEdit}
                                        className="shrink-0 p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 rounded-lg transition-all duration-200"
                                        title="Cancel edit"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={() => handleFavorite(bookmark)}
                                        disabled={updating === bookmark.id}
                                        className={`shrink-0 p-2 rounded-lg transition-all duration-200 disabled:opacity-50 ${bookmark.is_favorite
                                                ? "text-amber-600 bg-amber-50 hover:bg-amber-100"
                                                : "text-gray-500 hover:bg-amber-50 hover:text-amber-600"
                                            }`}
                                        title={bookmark.is_favorite ? "Remove from favorites" : "Add to favorites"}
                                    >
                                        <Star
                                            className={`w-4 h-4 ${bookmark.is_favorite ? "fill-amber-500" : ""}`}
                                        />
                                    </button>

                                    <button
                                        onClick={() => startEdit(bookmark)}
                                        className="shrink-0 p-2 text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-all duration-200"
                                        title="Edit bookmark"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                </>
                            )}

                            <button
                                onClick={() => handleCopyUrl(bookmark.url, bookmark.id)}
                                className="shrink-0 p-2 text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-all duration-200"
                                title="Copy URL"
                            >
                                {copied === bookmark.id ? (
                                    <Check className="w-4 h-4" />
                                ) : (
                                    <Copy className="w-4 h-4" />
                                )}
                            </button>

                            <a
                                href={bookmark.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="shrink-0 p-2 text-gray-500 hover:bg-green-50 hover:text-green-600 rounded-lg transition-all duration-200"
                                title="Open in new tab"
                            >
                                <ExternalLink className="w-4 h-4" />
                            </a>

                            <button
                                onClick={() => handleDelete(bookmark.id)}
                                disabled={deleting === bookmark.id || editingId === bookmark.id}
                                className="shrink-0 p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group/btn"
                                title="Delete bookmark"
                            >
                                {deleting === bookmark.id ? (
                                    <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <Trash2 className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
