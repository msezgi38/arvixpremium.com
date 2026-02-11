import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface ProductCardProps {
    product: {
        id: string;
        name: string;
        slug: string;
        oldName?: string;
        newName: string;
        description?: string;
        images: { url: string; alt: string | null }[];
        category: { name: string; slug: string };
    };
}

export default function ProductCard({ product }: ProductCardProps) {
    const mainImage = product.images[0] || null;

    return (
        <Link
            href={`/urun/${product.slug}`}
            className="card group"
        >
            {/* Image */}
            <div className="relative h-64 bg-gray-50 overflow-hidden">
                {mainImage ? (
                    <img
                        src={mainImage.url}
                        alt={mainImage.alt || product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full hero-gradient flex items-center justify-center">
                        <span className="text-white text-6xl font-bold">
                            {product.newName[0]}
                        </span>
                    </div>
                )}

                {/* Category Badge */}
                <div className="absolute top-4 left-4 text-white px-3 py-1 rounded-full text-sm font-semibold" style={{ background: '#2B5CE7' }}>
                    {product.category.name}
                </div>
            </div>

            {/* Content */}
            <div className="p-6 bg-white">
                <h3 className="text-xl font-bold mb-2 group-hover:text-[#2B5CE7] transition-colors">
                    {product.newName}
                </h3>

                {product.oldName && (
                    <p className="text-sm text-gray-500 mb-2">
                        Eski adı: <span className="font-medium">{product.oldName}</span>
                    </p>
                )}

                {product.description && (
                    <p className="text-gray-600 mb-4 line-clamp-2 text-sm">{product.description}</p>
                )}

                <div className="flex items-center font-semibold group-hover:translate-x-2 transition-transform" style={{ color: '#2B5CE7' }}>
                    Detayları Gör
                    <ArrowRight className="ml-2 w-4 h-4" />
                </div>
            </div>
        </Link>
    );
}
