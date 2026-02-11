'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface BlogPost {
    id: number;
    title: string;
    excerpt: string;
    image: string;
    date: string;
    author: string;
    slug: string;
    active: boolean;
}

export default function BlogPage() {
    const [posts, setPosts] = useState<BlogPost[]>([]);

    useEffect(() => {
        fetch('/api/db/blog', { cache: 'no-store' })
            .then((res) => res.json())
            .then((data: BlogPost[]) => {
                const active = (Array.isArray(data) ? data : []).filter((p) => p.active);
                if (active.length > 0) setPosts(active);
                else return fetch('/blog/blog.json').then(r => r.json()).then((d: BlogPost[]) => setPosts(d.filter(p => p.active)));
            })
            .catch(() => {
                fetch('/blog/blog.json').then(r => r.json()).then((d: BlogPost[]) => setPosts(d.filter(p => p.active))).catch(() => setPosts([]));
            });
    }, []);

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    return (
        <>
            {/* Hero */}
            <section className="py-24 md:py-32 bg-black text-white">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-4">Blog</h1>
                    <p className="text-lg md:text-xl text-white/70">Fitness dünyasından haberler ve rehberler</p>
                </div>
            </section>

            {/* Posts Grid */}
            <section className="py-20 md:py-28 bg-white">
                <div className="max-w-6xl mx-auto px-6">
                    {posts.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {posts.map((post) => (
                                <Link key={post.id} href={`/blog/${post.slug}`} className="group block">
                                    <div className="aspect-[16/10] bg-neutral-100 overflow-hidden mb-4">
                                        {post.image ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={post.image}
                                                alt={post.title}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-neutral-300">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-xs text-neutral-400 mb-2 uppercase tracking-wider">
                                        {formatDate(post.date)} — {post.author}
                                    </p>
                                    <h3 className="text-lg font-bold mb-2 group-hover:text-neutral-600 transition-colors">
                                        {post.title}
                                    </h3>
                                    <p className="text-sm text-neutral-500 leading-relaxed">
                                        {post.excerpt}
                                    </p>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 text-neutral-500">
                            <p className="text-lg">Henüz blog yazısı bulunmuyor.</p>
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}
