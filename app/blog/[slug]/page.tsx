'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface BlogPost {
    id: number;
    title: string;
    excerpt: string;
    content: string;
    image: string;
    date: string;
    author: string;
    slug: string;
    active: boolean;
}

function renderMarkdown(text: string) {
    return text.split('\n\n').map((block, i) => {
        if (block.startsWith('## ')) {
            return <h2 key={i} className="text-xl md:text-2xl font-bold mt-10 mb-4">{block.replace('## ', '')}</h2>;
        }
        if (block.startsWith('# ')) {
            return <h1 key={i} className="text-2xl md:text-3xl font-bold mt-10 mb-4">{block.replace('# ', '')}</h1>;
        }
        // Numbered/bulleted lists
        const lines = block.split('\n');
        if (lines.every(l => /^\d+\.\s/.test(l.trim()) || l.trim() === '')) {
            return (
                <ol key={i} className="list-decimal list-inside space-y-2 my-4 text-neutral-600">
                    {lines.filter(l => l.trim()).map((l, j) => {
                        const content = l.replace(/^\d+\.\s/, '');
                        // Handle **bold**
                        const parts = content.split(/\*\*(.*?)\*\*/g);
                        return (
                            <li key={j} className="leading-relaxed">
                                {parts.map((part, k) =>
                                    k % 2 === 1 ? <strong key={k}>{part}</strong> : part
                                )}
                            </li>
                        );
                    })}
                </ol>
            );
        }
        // Regular paragraph with bold support
        const parts = block.split(/\*\*(.*?)\*\*/g);
        return (
            <p key={i} className="text-neutral-600 leading-relaxed mb-4">
                {parts.map((part, k) =>
                    k % 2 === 1 ? <strong key={k} className="text-neutral-800">{part}</strong> : part
                )}
            </p>
        );
    });
}

export default function BlogDetailPage() {
    const params = useParams();
    const slug = params.slug as string;
    const [post, setPost] = useState<BlogPost | null>(null);
    const [allPosts, setAllPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/blog/blog.json')
            .then((res) => res.json())
            .then((data: BlogPost[]) => {
                const activePosts = data.filter((p) => p.active);
                setAllPosts(activePosts);
                const found = activePosts.find((p) => p.slug === slug);
                setPost(found || null);
            })
            .catch(() => setPost(null))
            .finally(() => setLoading(false));
    }, [slug]);

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!post) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4">
                <p className="text-neutral-500 text-lg">Blog yazısı bulunamadı.</p>
                <Link href="/" className="text-sm uppercase tracking-wider font-semibold hover:text-neutral-600 transition-colors">
                    ← Anasayfaya Dön
                </Link>
            </div>
        );
    }

    const otherPosts = allPosts.filter((p) => p.id !== post.id).slice(0, 3);

    return (
        <>
            {/* Hero Image */}
            <section className="relative min-h-[400px] md:min-h-[500px] flex items-end overflow-hidden">
                <div className="absolute inset-0 bg-neutral-900">
                    {post.image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={post.image} alt={post.title} className="w-full h-full object-cover opacity-60" />
                    )}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="relative z-10 max-w-3xl mx-auto px-6 pb-12 w-full">
                    <p className="text-white/60 text-xs uppercase tracking-widest mb-3">
                        {formatDate(post.date)} — {post.author}
                    </p>
                    <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight">
                        {post.title}
                    </h1>
                </div>
            </section>

            {/* Content */}
            <article className="py-16 md:py-24 bg-white">
                <div className="max-w-3xl mx-auto px-6">
                    <p className="text-lg md:text-xl text-neutral-500 leading-relaxed mb-8 border-l-4 border-black pl-4">
                        {post.excerpt}
                    </p>
                    <div className="prose-custom">
                        {renderMarkdown(post.content)}
                    </div>
                </div>
            </article>

            {/* Other Posts */}
            {otherPosts.length > 0 && (
                <section className="py-16 border-t border-neutral-200 bg-neutral-50">
                    <div className="max-w-6xl mx-auto px-6">
                        <h2 className="text-2xl font-bold mb-10">Diğer Yazılar</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {otherPosts.map((p) => (
                                <Link key={p.id} href={`/blog/${p.slug}`} className="group block">
                                    <div className="aspect-[16/10] bg-neutral-200 overflow-hidden mb-4">
                                        {p.image ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={p.image} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-neutral-400">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-xs text-neutral-400 mb-1 uppercase tracking-wider">{formatDate(p.date)}</p>
                                    <h3 className="text-base font-bold group-hover:text-neutral-600 transition-colors">{p.title}</h3>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </>
    );
}
