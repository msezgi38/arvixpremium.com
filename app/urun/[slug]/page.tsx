import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Check } from 'lucide-react';

// Mock data - in production this would fetch from database
const mockProduct = {
    id: '1',
    slug: 'plx',
    oldName: 'MİNİ METTA',
    newName: 'PLX',
    name: 'PLX',
    description: 'Kompakt ve güçlü plaka yüklemeli ekipman. Profesyonel spor salonları için ideal.',
    specifications: `• Ağırlık Kapasitesi: 200kg
• Boyutlar: 150cm x 120cm x 180cm
• Ağırlık: 85kg
• Malzeme: Profesyonel kalite çelik
• Kaplama: Elektrostatik toz boya`,
    features: [
        'Ticari kullanım için tasarlanmış',
        'Yüksek dayanıklılık',
        'Ergonomik tasarım',
        'Kolay bakım',
        'Logo ve renk özelleştirme uygun',
    ],
    images: [] as { url: string; alt?: string }[],
    category: { name: 'Plaka Yüklemeli', slug: 'plaka-yuklemeli' },
};

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
    // In production, fetch product by slug from database
    const product = mockProduct;

    if (!product || product.slug !== params.slug) {
        // For demo purposes, we'll show the mock product for any slug
        // In production, this would notFound()
    }

    return (
        <div className="py-12">
            {/* Breadcrumb */}
            <section className="container-custom mb-8">
                <div className="flex items-center text-sm text-gray-600">
                    <Link href="/" className="hover:text-blue-600">Anasayfa</Link>
                    <span className="mx-2">/</span>
                    <Link href={`/urunler/${product.category.slug}`} className="hover:text-blue-600">
                        {product.category.name}
                    </Link>
                    <span className="mx-2">/</span>
                    <span className="text-gray-900 font-medium">{product.newName}</span>
                </div>
            </section>

            {/* Product Content */}
            <section className="container-custom">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Image Gallery */}
                    <div>
                        <div className="bg-gray-100 rounded-xl overflow-hidden mb-4">
                            <div className="aspect-square relative">
                                {product.images.length > 0 ? (
                                    <Image
                                        src={product.images[0].url}
                                        alt={product.newName}
                                        fill
                                        className="object-cover"
                                        priority
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                                        <span className="text-white text-9xl font-bold">
                                            {product.newName[0]}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Thumbnail Gallery - if multiple images */}
                        {product.images.length > 1 && (
                            <div className="grid grid-cols-4 gap-4">
                                {product.images.slice(0, 4).map((image, index) => (
                                    <div key={index} className="aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-pointer hover:opacity-75 transition">
                                        <Image
                                            src={image.url}
                                            alt={`${product.newName} ${index + 1}`}
                                            width={150}
                                            height={150}
                                            className="object-cover w-full h-full"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div>
                        <Link
                            href={`/urunler/${product.category.slug}`}
                            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            {product.category.name} kategorisine dön
                        </Link>

                        <h1 className="text-4xl font-bold mb-4">{product.newName}</h1>

                        {product.oldName && (
                            <p className="text-lg text-gray-600 mb-6">
                                Eski model adı: <span className="font-semibold">{product.oldName}</span>
                            </p>
                        )}

                        <div className="prose prose-lg mb-8">
                            <p className="text-gray-700 text-lg leading-relaxed">
                                {product.description}
                            </p>
                        </div>

                        {/* Features */}
                        {product.features && product.features.length > 0 && (
                            <div className="mb-8">
                                <h2 className="text-2xl font-bold mb-4">Özellikler</h2>
                                <ul className="space-y-3">
                                    {product.features.map((feature, index) => (
                                        <li key={index} className="flex items-start">
                                            <Check className="w-6 h-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                                            <span className="text-gray-700">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Specifications */}
                        {product.specifications && (
                            <div className="mb-8">
                                <h2 className="text-2xl font-bold mb-4">Teknik Özellikler</h2>
                                <div className="bg-gray-50 rounded-lg p-6">
                                    <pre className="whitespace-pre-wrap text-gray-700 font-sans">
                                        {product.specifications}
                                    </pre>
                                </div>
                            </div>
                        )}

                        {/* CTA */}
                        <div className="bg-blue-50 rounded-xl p-6">
                            <h3 className="text-xl font-bold mb-2">Bu ürünü kendi markanızla alın</h3>
                            <p className="text-gray-700 mb-4">
                                Logo, renk ve tasarım özelleştirme ile profesyonel ekipmanlarınızı edinin.
                            </p>
                            <Link href="/iletisim" className="btn-primary">
                                Teklif Al
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Related Products - Placeholder */}
            <section className="container-custom mt-20">
                <h2 className="text-3xl font-bold mb-8">Benzer Ürünler</h2>
                <p className="text-gray-600">İlgili ürünler yakında eklenecektir.</p>
            </section>
        </div>
    );
}
