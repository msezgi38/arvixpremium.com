'use client';

import { usePathname } from 'next/navigation';
import Header from "@/components/Layout/Header";
import Footer from "@/components/Layout/Footer";
import { CartProvider } from "@/context/CartContext";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAdmin = pathname.startsWith('/admin');

    return (
        <CartProvider>
            {isAdmin ? (
                <>{children}</>
            ) : (
                <>
                    <Header />
                    <main className="min-h-screen">{children}</main>
                    <Footer />
                </>
            )}
        </CartProvider>
    );
}
