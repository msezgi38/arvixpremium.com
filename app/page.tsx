import Link from 'next/link';
import HeroSlider from '@/components/HeroSlider';
import CategoryShowcase from '@/components/CategoryShowcase';
import Testimonials from '@/components/Testimonials';
import BlogSection from '@/components/BlogSection';

export default function HomePage() {
  return (
    <>
      {/* Hero Slider */}
      <HeroSlider />

      {/* Category Showcase Grid */}
      <CategoryShowcase />

      {/* About Section */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-10">ARVIX Nedir?</h2>
          <div className="text-left space-y-6 text-base md:text-lg text-neutral-600 leading-relaxed">
            <p>
              Arvix ekibi olarak; profesyonel spor salonları, butik stüdyolar ve kurumsal fitness
              yatırımları için yüksek standartlarda fitness ekipmanlarını tedarik eden, markalayan
              ve uçtan uca yöneten bir çözüm ortağıyız.
            </p>
            <p>
              Yurt dışındaki üretici fabrikalarla doğrudan iş birliği içinde çalışarak; aracı marka
              ve distribütör zincirlerini ortadan kaldırır, fitness ekipmanlarını kendi marka ve
              logonuzla pazara sunmanıza imkân tanırız.
            </p>
          </div>
          <div className="mt-10">
            <Link
              href="/hakkimizda"
              className="inline-block bg-black text-white text-xs uppercase tracking-[2px] font-semibold px-8 py-4 hover:bg-neutral-800 transition-colors"
            >
              Daha Fazla Bilgi
            </Link>
          </div>
        </div>
      </section>

      {/* Product Categories */}
      <section className="py-20 md:py-28 bg-neutral-950 text-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Ürün Kategorileri</h2>
            <p className="text-neutral-400 text-base md:text-lg">
              Profesyonel spor salonları için geniş ürün yelpazesi
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { name: 'Plaka Yüklemeli', desc: '7 farklı model', slug: 'plaka-yuklemeli' },
              { name: 'Pinli Aletler', desc: '16 farklı ekipman', slug: 'pinli-aletler' },
              { name: 'Kardiyo', desc: 'Koşu bandı, eliptik', slug: 'kardiyo' },
              { name: 'Aksesuarlar', desc: 'Dumbell, bar, yoga', slug: 'aksesuarlar' },
            ].map((cat) => (
              <Link
                key={cat.slug}
                href={`/urunler/${cat.slug}`}
                className="block bg-white text-black p-10 text-center hover:bg-neutral-100 transition-colors"
              >
                <h3 className="text-xl font-bold mb-2">{cat.name}</h3>
                <p className="text-sm text-neutral-500">{cat.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Custom Branding */}
      <section className="py-20 md:py-28 bg-neutral-50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Kendi Marka ve Logonuzu Oluşturun
          </h2>
          <p className="text-base md:text-lg text-neutral-600 mb-10 max-w-3xl mx-auto">
            Tüm ekipmanları kendi markanız ve renk paletinizle özelleştirin.
          </p>
          <Link
            href="/marka-logo"
            className="inline-block bg-black text-white text-xs uppercase tracking-[2px] font-semibold px-8 py-4 hover:bg-neutral-800 transition-colors"
          >
            Daha Fazla Bilgi
          </Link>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl md:text-5xl font-bold mb-14 text-center">Neden Arvix?</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="text-center">
              <h3 className="text-xl font-bold mb-3">Direkt Fabrika</h3>
              <p className="text-neutral-600 text-sm leading-relaxed">
                %20-40 daha avantajlı fabrika çıkış fiyatları
              </p>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold mb-3">Profesyonel Kalite</h3>
              <p className="text-neutral-600 text-sm leading-relaxed">
                Ticari kullanım için uzun ömürlü ekipmanlar
              </p>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold mb-3">Özelleştirme</h3>
              <p className="text-neutral-600 text-sm leading-relaxed">
                Logo, renk ve tasarımda tam kontrol
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <Testimonials />

      {/* Blog */}
      <BlogSection />

      {/* Final CTA */}
      <section className="py-20 bg-black text-white text-center">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-2xl md:text-4xl font-bold mb-6">
            Profesyonel Spor Salonu Kurmaya Hazır Mısınız?
          </h2>
          <p className="text-neutral-400 mb-10">
            Proje danışmanlığından ekipman tedariğine uçtan uca çözümler
          </p>
          <Link
            href="/iletisim"
            className="inline-block border-2 border-white text-white text-xs uppercase tracking-[2px] font-semibold px-8 py-4 hover:bg-white hover:text-black transition-colors"
          >
            Teklif Al
          </Link>
        </div>
      </section>
    </>
  );
}
