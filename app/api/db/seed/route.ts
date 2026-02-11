import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Helper to create a slug from name
function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/ş/g, 's').replace(/ç/g, 'c').replace(/ğ/g, 'g')
        .replace(/ü/g, 'u').replace(/ö/g, 'o').replace(/ı/g, 'i')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

// POST - seed the database with initial data
export async function POST() {
    try {
        // Check if already seeded
        const existing = await prisma.category.count();
        if (existing > 0) {
            return NextResponse.json({ message: 'Veritabanı zaten dolu', count: existing });
        }

        // ═══════════════════════════════════════
        // 1. PLAKA YÜKLEMELİ ALETLER
        // ═══════════════════════════════════════
        const plakaMain = await prisma.category.create({
            data: { name: 'Plaka Yüklemeli Aletler', slug: 'plaka-yuklemeli', order: 1, active: true },
        });

        const plakaSubs = [
            {
                name: 'XVS', slug: 'xvs', order: 1, products: [
                    { name: 'Seated Chest Press', slug: 'xvs-seated-chest-press' },
                    { name: 'Shoulder Press', slug: 'xvs-shoulder-press' },
                    { name: 'Lat Pulldown', slug: 'xvs-lat-pulldown' },
                    { name: 'Seated Row', slug: 'xvs-seated-row' },
                    { name: 'Leg Press', slug: 'xvs-leg-press' },
                    { name: 'Leg Extension', slug: 'xvs-leg-extension' },
                    { name: 'Leg Curl', slug: 'xvs-leg-curl' },
                ]
            },
            {
                name: 'XAL', slug: 'xal', order: 2, products: [
                    { name: 'Chest Press', slug: 'xal-chest-press' },
                    { name: 'Pec Fly', slug: 'xal-pec-fly' },
                    { name: 'Shoulder Press', slug: 'xal-shoulder-press' },
                    { name: 'Lat Pulldown', slug: 'xal-lat-pulldown' },
                    { name: 'Low Row', slug: 'xal-low-row' },
                    { name: 'Leg Press', slug: 'xal-leg-press' },
                ]
            },
            {
                name: 'MINI', slug: 'mini', order: 3, products: [
                    { name: 'Chest Press', slug: 'mini-chest-press' },
                    { name: 'Shoulder Press', slug: 'mini-shoulder-press' },
                    { name: 'Lat Pulldown', slug: 'mini-lat-pulldown' },
                    { name: 'Low Row', slug: 'mini-low-row' },
                    { name: 'Leg Press', slug: 'mini-leg-press' },
                    { name: 'Leg Extension', slug: 'mini-leg-extension' },
                ]
            },
            {
                name: 'METTA', slug: 'metta', order: 4, products: [
                    { name: 'Chest Press', slug: 'metta-chest-press' },
                    { name: 'Incline Chest Press', slug: 'metta-incline-chest-press' },
                    { name: 'Shoulder Press', slug: 'metta-shoulder-press' },
                    { name: 'Lat Pulldown', slug: 'metta-lat-pulldown' },
                    { name: 'Seated Row', slug: 'metta-seated-row' },
                    { name: 'Leg Press', slug: 'metta-leg-press' },
                    { name: 'Leg Extension', slug: 'metta-leg-extension' },
                    { name: 'Leg Curl', slug: 'metta-leg-curl' },
                ]
            },
            {
                name: 'METTA 2', slug: 'metta-2', order: 5, products: [
                    { name: 'Chest Press', slug: 'metta2-chest-press' },
                    { name: 'Incline Chest Press', slug: 'metta2-incline-chest-press' },
                    { name: 'Shoulder Press', slug: 'metta2-shoulder-press' },
                    { name: 'Lat Pulldown', slug: 'metta2-lat-pulldown' },
                    { name: 'Seated Row', slug: 'metta2-seated-row' },
                    { name: 'Leg Press', slug: 'metta2-leg-press' },
                ]
            },
            {
                name: 'HM', slug: 'hm', order: 6, products: [
                    { name: 'Decline Chest Press Machine', slug: 'hm-decline-chest-press' },
                    { name: 'Flat Bench Press Machine', slug: 'hm-flat-bench-press' },
                    { name: 'Incline Chest Press Machine', slug: 'hm-incline-chest-press' },
                    { name: 'Kneeling Leg Curl Machine', slug: 'hm-kneeling-leg-curl' },
                    { name: 'Iso-Lateral Front Lat Pulldown', slug: 'hm-iso-lateral-lat-pulldown' },
                    { name: 'Rowing Machine', slug: 'hm-rowing-machine' },
                    { name: 'Shoulder Press Machine', slug: 'hm-shoulder-press' },
                    { name: 'Side Arm Lift Trainer Machine', slug: 'hm-side-arm-lift-trainer' },
                    { name: 'Super Incline Chest Press Machine', slug: 'hm-super-incline-chest-press' },
                    { name: 'Wide-Grip Lat Pulldown Machine', slug: 'hm-wide-grip-lat-pulldown' },
                ]
            },
            {
                name: 'GM 82', slug: 'gm-82', order: 7, products: [
                    { name: 'Chest Press', slug: 'gm82-chest-press' },
                    { name: 'Shoulder Press', slug: 'gm82-shoulder-press' },
                    { name: 'Lat Pulldown', slug: 'gm82-lat-pulldown' },
                    { name: 'Seated Row', slug: 'gm82-seated-row' },
                    { name: 'Leg Press', slug: 'gm82-leg-press' },
                    { name: 'Leg Extension', slug: 'gm82-leg-extension' },
                    { name: 'Leg Curl', slug: 'gm82-leg-curl' },
                    { name: 'Hack Squat', slug: 'gm82-hack-squat' },
                ]
            },
        ];

        for (const sub of plakaSubs) {
            const subCat = await prisma.category.create({
                data: { name: sub.name, slug: sub.slug, parentId: plakaMain.id, order: sub.order, active: true },
            });
            for (let i = 0; i < sub.products.length; i++) {
                await prisma.product.create({
                    data: {
                        name: sub.products[i].name,
                        slug: sub.products[i].slug,
                        newName: sub.products[i].name,
                        categoryId: subCat.id,
                        active: true,
                        order: i + 1,
                    },
                });
            }
        }

        // ═══════════════════════════════════════
        // 2. PİNLİ (SELECTORİZED) ALETLER
        // ═══════════════════════════════════════
        const pinliMain = await prisma.category.create({
            data: { name: 'Pinli Aletler', slug: 'pinli-aletler', order: 2, active: true },
        });

        const pinliSubs = [
            {
                name: 'DSL', slug: 'dsl', order: 1, products: [
                    { name: 'DSL 1', slug: 'dsl-1', oldName: 'CFU' },
                    { name: 'DSL 2', slug: 'dsl-2', oldName: 'T8' },
                    { name: 'DSL 3', slug: 'dsl-3', oldName: 'ZMU' },
                ]
            },
            {
                name: 'SL', slug: 'sl', order: 2, products: [
                    { name: 'SL0', slug: 'sl-0', oldName: 'AM5' },
                    { name: 'SL1', slug: 'sl-1', oldName: 'M1' },
                    { name: 'SL2', slug: 'sl-2', oldName: 'M10U' },
                    { name: 'SL3', slug: 'sl-3', oldName: 'MEL' },
                    { name: 'SL4', slug: 'sl-4', oldName: 'M8U' },
                    { name: 'SL5', slug: 'sl-5', oldName: 'SNU' },
                    { name: 'SL6', slug: 'sl-6', oldName: 'XMTM' },
                    { name: 'SL7', slug: 'sl-7', oldName: 'M5U' },
                    { name: 'SL8', slug: 'sl-8', oldName: 'M6U' },
                    { name: 'SL9', slug: 'sl-9', oldName: 'ASL' },
                    { name: 'SL0X', slug: 'sl-0x', oldName: '73' },
                    { name: 'SLV', slug: 'sl-v', oldName: 'ACF' },
                    { name: 'SLC', slug: 'sl-c', oldName: 'AZM' },
                ]
            },
        ];

        for (const sub of pinliSubs) {
            const subCat = await prisma.category.create({
                data: { name: sub.name, slug: sub.slug, parentId: pinliMain.id, order: sub.order, active: true },
            });
            for (let i = 0; i < sub.products.length; i++) {
                const p = sub.products[i];
                await prisma.product.create({
                    data: {
                        name: p.name, slug: p.slug, oldName: p.oldName || null,
                        newName: p.name, categoryId: subCat.id, active: true, order: i + 1,
                    },
                });
            }
        }

        // ═══════════════════════════════════════
        // 3. KARDİYO ALETLERİ
        // ═══════════════════════════════════════
        const kardiyoMain = await prisma.category.create({
            data: { name: 'Kardiyo Aletleri', slug: 'kardiyo', order: 3, active: true },
        });

        const kardiyoSubs = [
            { name: 'Koşu Bandı', slug: 'kosu-bandi', order: 1 },
            { name: 'Eliptik Aletler', slug: 'eliptik', order: 2 },
            { name: 'Merdivenler', slug: 'merdivenler', order: 3 },
            { name: 'Bisikletler', slug: 'bisiklet', order: 4 },
            { name: 'Air Serisi', slug: 'air-serisi', order: 5 },
        ];

        for (const sub of kardiyoSubs) {
            await prisma.category.create({
                data: { name: sub.name, slug: `kardiyo-${sub.slug}`, parentId: kardiyoMain.id, order: sub.order, active: true },
            });
        }

        // ═══════════════════════════════════════
        // 4. İSTASYONLAR
        // ═══════════════════════════════════════
        const istasyonlarMain = await prisma.category.create({
            data: { name: 'İstasyonlar', slug: 'istasyonlar', order: 4, active: true },
        });

        const istasyonlarSubs = [
            { name: 'L Serisi', slug: 'l-serisi', oldName: 'LY', order: 1 },
            { name: 'YN Serisi', slug: 'yn-serisi', oldName: 'YN', order: 2 },
        ];

        for (const sub of istasyonlarSubs) {
            await prisma.category.create({
                data: { name: sub.name, slug: `istasyonlar-${sub.slug}`, oldName: sub.oldName, parentId: istasyonlarMain.id, order: sub.order, active: true },
            });
        }

        // ═══════════════════════════════════════
        // 5. SEHPA & BENCH
        // ═══════════════════════════════════════
        const sehpaMain = await prisma.category.create({
            data: { name: 'Sehpa & Bench', slug: 'sehpa-bench', order: 5, active: true },
        });

        const sehpaSubs = [
            { name: 'Z Serisi', slug: 'z-serisi', oldName: 'ZH', order: 1 },
            { name: 'Air Serisi', slug: 'sehpa-air-serisi', oldName: 'Air Serisi', order: 2 },
        ];

        for (const sub of sehpaSubs) {
            await prisma.category.create({
                data: { name: sub.name, slug: sub.slug, oldName: sub.oldName, parentId: sehpaMain.id, order: sub.order, active: true },
            });
        }

        // ═══════════════════════════════════════
        // 6. AKSESUARLAR
        // ═══════════════════════════════════════
        const aksesuarMain = await prisma.category.create({
            data: { name: 'Aksesuarlar', slug: 'aksesuarlar', order: 6, active: true },
        });

        const aksesuarSubs = [
            { name: 'Dumbbell ve Plakalar', slug: 'dumbbell-plakalar', oldName: 'ARVY', order: 1 },
            { name: 'Bar ve Aksesuarlar', slug: 'bar-aksesuarlar', oldName: 'ARVX', order: 2 },
            { name: 'Strength Training', slug: 'strength-training', oldName: 'ARVZ', order: 3 },
            { name: 'Yoga Pilates Ekipmanları', slug: 'yoga-pilates', oldName: 'ARVQ', order: 4 },
        ];

        for (const sub of aksesuarSubs) {
            await prisma.category.create({
                data: { name: sub.name, slug: sub.slug, oldName: sub.oldName, parentId: aksesuarMain.id, order: sub.order, active: true },
            });
        }

        // ═══════════════════════════════════════
        // 7. YENİ ÜRÜNLER
        // ═══════════════════════════════════════
        const yeniMain = await prisma.category.create({
            data: { name: 'Yeni Ürünler', slug: 'yeni-urunler', order: 7, active: true },
        });

        await prisma.product.create({
            data: {
                name: 'MBH', slug: 'mbh', oldName: 'MBH Yeni Ürün', newName: 'Yeni Ürünler',
                description: 'Yeni nesil fitness ekipmanı', categoryId: yeniMain.id, active: true, order: 1,
            },
        });

        const totalCats = await prisma.category.count();
        const totalProducts = await prisma.product.count();

        return NextResponse.json({
            success: true,
            message: 'Veritabanı başarıyla dolduruldu',
            categories: totalCats,
            products: totalProducts,
        });
    } catch (e) {
        return NextResponse.json({ error: 'Seed hatası', detail: String(e) }, { status: 500 });
    }
}
