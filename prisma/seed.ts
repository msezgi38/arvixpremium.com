import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@arvixpremium.com' },
    update: {},
    create: {
      email: 'admin@arvixpremium.com',
      password: hashedPassword,
      name: 'Admin',
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // Create main categories based on your structure
  const categories = [
    { name: 'Plaka Yüklemeli Aletler', slug: 'plaka-yuklemeli', order: 1 },
    { name: 'Pinli (Selectorized) Aletler', slug: 'pinli-aletler', order: 2 },
    { name: 'Kardiyo Aletleri', slug: 'kardiyo', order: 3 },
    { name: 'Sehpa Benchler', slug: 'sehpa-bench', order: 4 },
    { name: 'İstasyonlar', slug: 'istasyonlar', order: 5 },
    { name: 'Aksesuarlar', slug: 'aksesuarlar', order: 6 },
    { name: 'Yeni Ürünler', slug: 'yeni-urunler', order: 7 },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log('✅ Main categories created');

  // Create Plaka Yüklemeli subcategories and products
  const plakaCategory = await prisma.category.findUnique({
    where: { slug: 'plaka-yuklemeli' },
  });

  if (plakaCategory) {
    const plakaProducts = [
      { oldName: 'MİNİ METTA', newName: 'PLX', slug: 'plx' },
      { oldName: 'XAL', newName: 'PL1', slug: 'pl1' },
      { oldName: 'XVS', newName: 'PL2', slug: 'pl2' },
      { oldName: 'METTA1', newName: 'PL3', slug: 'pl3' },
      { oldName: 'METTA2', newName: 'PL4', slug: 'pl4' },
      { oldName: 'GM', newName: 'PL5', slug: 'pl5' },
      { oldName: '82-', newName: 'PLY', slug: 'ply' },
    ];

    for (const product of plakaProducts) {
      await prisma.product.upsert({
        where: { slug: product.slug },
        update: {},
        create: {
          ...product,
          name: product.newName,
          categoryId: plakaCategory.id,
          description: `${product.oldName} modelinin yeni versiyonu`,
        },
      });
    }
    console.log('✅ Plaka Yüklemeli products created');
  }

  // Create Pinli Aletler products
  const pinliCategory = await prisma.category.findUnique({
    where: { slug: 'pinli-aletler' },
  });

  if (pinliCategory) {
    const pinliProducts = [
      { oldName: 'CFU-', newName: 'DSL 1', slug: 'dsl-1' },
      { oldName: 'T8', newName: 'DSL2', slug: 'dsl2' },
      { oldName: 'ZMU', newName: 'DSL3', slug: 'dsl3' },
      { oldName: 'AM5', newName: 'SL0', slug: 'sl0' },
      { oldName: 'M1', newName: 'SL1', slug: 'sl1' },
      { oldName: 'M10U', newName: 'SL2', slug: 'sl2' },
      { oldName: 'MEL', newName: 'SL3', slug: 'sl3' },
      { oldName: 'M8U', newName: 'SL4', slug: 'sl4' },
      { oldName: 'SNU', newName: 'SL5', slug: 'sl5' },
      { oldName: 'XMTM', newName: 'SL6', slug: 'sl6' },
      { oldName: 'M5U', newName: 'SL7', slug: 'sl7' },
      { oldName: 'M6U', newName: 'SL8', slug: 'sl8' },
      { oldName: 'ASL', newName: 'SL9', slug: 'sl9' },
      { oldName: '73-', newName: 'SL0X', slug: 'sl0x' },
      { oldName: 'ACF', newName: 'SLV', slug: 'slv' },
      { oldName: 'AZM', newName: 'SLC', slug: 'slc' },
    ];

    for (const product of pinliProducts) {
      await prisma.product.upsert({
        where: { slug: product.slug },
        update: {},
        create: {
          ...product,
          name: product.newName,
          categoryId: pinliCategory.id,
          description: `${product.oldName} modelinin yeni versiyonu`,
        },
      });
    }
    console.log('✅ Pinli Aletler products created');
  }

  // Create Kardiyo subcategories
  const kardiyoCategory = await prisma.category.findUnique({
    where: { slug: 'kardiyo' },
  });

  if (kardiyoCategory) {
    const kardiyoSubcats = [
      { name: 'Koşu Bandı', slug: 'kosu-bandi', parentId: kardiyoCategory.id },
      { name: 'Eliptik Aletler', slug: 'eliptik', parentId: kardiyoCategory.id },
      { name: 'Merdivenler', slug: 'merdivenler', parentId: kardiyoCategory.id },
      { name: 'Bisikletler', slug: 'bisikletler', parentId: kardiyoCategory.id },
      { name: 'Air Serisi', slug: 'air-serisi', parentId: kardiyoCategory.id },
    ];

    for (const subcat of kardiyoSubcats) {
      await prisma.category.upsert({
        where: { slug: subcat.slug },
        update: {},
        create: subcat,
      });
    }
    console.log('✅ Kardiyo subcategories created');
  }

  // Create Sehpa Bench series
  const sehpaCategory = await prisma.category.findUnique({
    where: { slug: 'sehpa-bench' },
  });

  if (sehpaCategory) {
    const sehpaSubcats = [
      { name: 'Z Serisi', slug: 'z-serisi', oldName: 'ZH', parentId: sehpaCategory.id },
      { name: 'Air Serisi', slug: 'air-serisi-bench', parentId: sehpaCategory.id },
    ];

    for (const subcat of sehpaSubcats) {
      await prisma.category.upsert({
        where: { slug: subcat.slug },
        update: {},
        create: subcat,
      });
    }
    console.log('✅ Sehpa Bench series created');
  }

  // Create İstasyonlar series
  const istasyonCategory = await prisma.category.findUnique({
    where: { slug: 'istasyonlar' },
  });

  if (istasyonCategory) {
    const istasyonSubcats = [
      { name: 'L Serisi', slug: 'l-serisi', oldName: 'LY', parentId: istasyonCategory.id },
      { name: 'YN Serisi', slug: 'yn-serisi', oldName: 'YN', parentId: istasyonCategory.id },
    ];

    for (const subcat of istasyonSubcats) {
      await prisma.category.upsert({
        where: { slug: subcat.slug },
        update: {},
        create: subcat,
      });
    }
    console.log('✅ İstasyon series created');
  }

  // Create Aksesuar subcategories
  const aksesuarCategory = await prisma.category.findUnique({
    where: { slug: 'aksesuarlar' },
  });

  if (aksesuarCategory) {
    const aksesuarSubcats = [
      { name: 'Dumbell ve Plakalar', slug: 'dumbell-plakalar', newName: 'ARVY', parentId: aksesuarCategory.id },
      { name: 'Bar ve Aksesuarlar', slug: 'bar-aksesuarlar', newName: 'ARVX', parentId: aksesuarCategory.id },
      { name: 'Strength Training', slug: 'strength-training', newName: 'ARVZ', parentId: aksesuarCategory.id },
      { name: 'Yoga Pilates Ekipmanları', slug: 'yoga-pilates', newName: 'ARVQ', parentId: aksesuarCategory.id },
    ];

    for (const subcat of aksesuarSubcats) {
      await prisma.category.upsert({
        where: { slug: subcat.slug },
        update: {},
        create: subcat,
      });
    }
    console.log('✅ Aksesuar subcategories created');
  }

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
