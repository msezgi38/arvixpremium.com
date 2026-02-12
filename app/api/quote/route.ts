import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import nodemailer from 'nodemailer';

interface QuoteItem {
  id: string;
  name: string;
  category: string;
  categoryName: string;
  quantity: number;
}

interface QuoteRequestBody {
  name: string;
  email: string;
  phone: string;
  company?: string;
  message?: string;
  items: QuoteItem[];
}

export async function POST(request: Request) {
  try {
    const data: QuoteRequestBody = await request.json();

    if (!data.name || !data.email || !data.phone || !data.items?.length) {
      return NextResponse.json({ error: 'Eksik bilgi' }, { status: 400 });
    }

    // Save to database
    await prisma.quoteRequest.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        company: data.company || null,
        message: data.message || null,
        items: JSON.stringify(data.items),
      },
    });

    // Build product table for email
    const itemRows = data.items.map(item =>
      `<tr>
        <td style="padding:10px 15px;border-bottom:1px solid #eee;">${item.name}</td>
        <td style="padding:10px 15px;border-bottom:1px solid #eee;">${item.categoryName}</td>
        <td style="padding:10px 15px;border-bottom:1px solid #eee;text-align:center;font-weight:bold;">${item.quantity}</td>
      </tr>`
    ).join('');

    const totalQty = data.items.reduce((s, i) => s + i.quantity, 0);

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:#000;color:#fff;padding:30px;text-align:center;">
          <h1 style="margin:0;font-size:20px;letter-spacing:4px;">ARVIX PREMIUM</h1>
          <p style="margin:8px 0 0;font-size:12px;color:#999;">Yeni Teklif Talebi</p>
        </div>

        <div style="padding:30px;background:#f9f9f9;">
          <h2 style="font-size:16px;margin:0 0 20px;">Müşteri Bilgileri</h2>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:6px 0;color:#666;width:120px;">Ad Soyad:</td><td style="padding:6px 0;font-weight:bold;">${data.name}</td></tr>
            <tr><td style="padding:6px 0;color:#666;">E-posta:</td><td style="padding:6px 0;"><a href="mailto:${data.email}">${data.email}</a></td></tr>
            <tr><td style="padding:6px 0;color:#666;">Telefon:</td><td style="padding:6px 0;">${data.phone}</td></tr>
            ${data.company ? `<tr><td style="padding:6px 0;color:#666;">Firma:</td><td style="padding:6px 0;">${data.company}</td></tr>` : ''}
          </table>
        </div>

        <div style="padding:30px;">
          <h2 style="font-size:16px;margin:0 0 15px;">Talep Edilen Ürünler (${totalQty} Adet)</h2>
          <table style="width:100%;border-collapse:collapse;">
            <thead>
              <tr style="background:#000;color:#fff;">
                <th style="padding:10px 15px;text-align:left;font-size:11px;letter-spacing:1px;">ÜRÜN</th>
                <th style="padding:10px 15px;text-align:left;font-size:11px;letter-spacing:1px;">KATEGORİ</th>
                <th style="padding:10px 15px;text-align:center;font-size:11px;letter-spacing:1px;">ADET</th>
              </tr>
            </thead>
            <tbody>
              ${itemRows}
            </tbody>
          </table>
        </div>

        ${data.message ? `
        <div style="padding:0 30px 30px;">
          <h2 style="font-size:16px;margin:0 0 10px;">Ek Not</h2>
          <p style="background:#f9f9f9;padding:15px;border-left:3px solid #000;margin:0;">${data.message}</p>
        </div>
        ` : ''}

        <div style="background:#000;color:#999;padding:20px;text-align:center;font-size:11px;">
          Bu mesaj arvixpremium.com teklif formundan gönderilmiştir.
        </div>
      </div>
    `;

    // Send email (optional - continues even if email fails)
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        await transporter.sendMail({
          from: `"Arvix Premium" <${process.env.SMTP_USER}>`,
          to: process.env.QUOTE_EMAIL || process.env.SMTP_USER,
          replyTo: data.email,
          subject: `Yeni Teklif Talebi - ${data.name} (${totalQty} Ürün)`,
          html,
        });
      }
    } catch (emailErr) {
      console.error('Email error:', emailErr);
      // Continue - quote is already saved to database
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
