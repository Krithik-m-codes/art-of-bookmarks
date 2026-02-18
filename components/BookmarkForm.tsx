"use client";

import { FormEvent, useState, useRef, useLayoutEffect } from "react";
import { Link, FileText, Plus } from "lucide-react";
import gsap from "gsap";

interface BookmarkFormProps {
    onAddBookmark: (
        url: string,
        title: string,
        description: string
    ) => Promise<void>;
}

export default function BookmarkForm({ onAddBookmark }: BookmarkFormProps) {
    const [url, setUrl] = useState("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [urlError, setUrlError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const formRef = useRef<HTMLFormElement>(null);
    const submitBtnRef = useRef<HTMLButtonElement>(null);

    useLayoutEffect(() => {
        // Animate form on mount
        if (formRef.current) {
            gsap.fromTo(
                formRef.current,
                { autoAlpha: 0, y: 20 },
                {
                    autoAlpha: 1,
                    y: 0,
                    duration: 0.6,
                    ease: "power3.out",
                    clearProps: "opacity,visibility,transform",
                }
            );
        }
    }, []);

    const validateUrl = (urlString: string) => {
        try {
            new URL(urlString);
            return true;
        } catch {
            return false;
        }
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setUrlError("");
        setSuccessMessage("");

        if (!url.trim()) {
            setUrlError("URL is required");
            return;
        }

        if (!validateUrl(url)) {
            setUrlError("Please enter a valid URL (e.g., https://example.com)");
            return;
        }

        if (!title.trim()) {
            setUrlError("Title is required");
            return;
        }

        setIsLoading(true);

        // Button animation
        if (submitBtnRef.current) {
            gsap.to(submitBtnRef.current, {
                scale: 0.95,
                duration: 0.2,
            });
        }

        try {
            await onAddBookmark(url, title, description);
            setUrl("");
            setTitle("");
            setDescription("");
            setSuccessMessage("✨ Bookmark added successfully!");

            if (submitBtnRef.current) {
                gsap.to(submitBtnRef.current, {
                    scale: 1,
                    duration: 0.2,
                });
            }

            setTimeout(() => setSuccessMessage(""), 3000);
        } catch (error) {
            console.error("Error:", error);
            setUrlError("Failed to save bookmark");
            if (submitBtnRef.current) {
                gsap.to(submitBtnRef.current, {
                    scale: 1,
                    duration: 0.2,
                });
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="glass-effect rounded-2xl p-6 md:p-8 shadow-glow hover:shadow-glow-lg transition-all duration-300"
        >
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-linear-to-br from-indigo-500 to-purple-500 rounded-lg">
                    <Plus className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Add Bookmark</h2>
            </div>

            <div className="space-y-5">
                {/* URL Input */}
                <div className="relative">
                    <label htmlFor="url" className="block text-sm font-semibold text-gray-700 mb-2">
                        Website URL <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <Link className="absolute left-3 top-3.5 w-5 h-5 text-indigo-400 pointer-events-none" />
                        <input
                            id="url"
                            type="text"
                            placeholder="https://example.com"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                        />
                    </div>
                </div>

                {/* Title Input */}
                <div>
                    <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
                        Title <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="title"
                        type="text"
                        placeholder="Give your bookmark a title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                    />
                </div>

                {/* Description Input */}
                <div>
                    <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                        <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            Description (optional)
                        </div>
                    </label>
                    <textarea
                        id="description"
                        placeholder="Add a note about this bookmark..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 bg-white/50 backdrop-blur-sm resize-none"
                    />
                </div>

                {/* Error Message */}
                {urlError && (
                    <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-700 text-sm font-medium animate-fade-in-up">
                        ⚠️ {urlError}
                    </div>
                )}

                {/* Success Message */}
                {successMessage && (
                    <div className="p-4 bg-emerald-50 border-2 border-emerald-200 rounded-xl text-emerald-700 text-sm font-medium animate-fade-in-up">
                        {successMessage}
                    </div>
                )}

                {/* Submit Button */}
                <button
                    ref={submitBtnRef}
                    type="submit"
                    disabled={isLoading}
                    className="w-full px-6 py-3 bg-linear-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-glow hover:shadow-glow-lg flex items-center justify-center gap-2 group relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-200"></div>
                    {isLoading ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Saving...
                        </>
                    ) : (
                        <>
                            <Plus className="w-5 h-5" />
                            Save Bookmark
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}
