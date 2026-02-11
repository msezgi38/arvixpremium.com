'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CartItem {
    id: string;
    name: string;
    category: string;
    categoryName: string;
    image: string;
    quantity: number;
}

interface CartContextType {
    items: CartItem[];
    addItem: (item: Omit<CartItem, 'quantity'>, qty?: number) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    totalItems: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [loaded, setLoaded] = useState(false);

    // Load from localStorage
    useEffect(() => {
        try {
            const saved = localStorage.getItem('arvix_cart');
            if (saved) setItems(JSON.parse(saved));
        } catch { }
        setLoaded(true);
    }, []);

    // Save to localStorage
    useEffect(() => {
        if (loaded) {
            localStorage.setItem('arvix_cart', JSON.stringify(items));
        }
    }, [items, loaded]);

    const addItem = (item: Omit<CartItem, 'quantity'>, qty: number = 1) => {
        setItems(prev => {
            const existing = prev.find(i => i.id === item.id && i.category === item.category);
            if (existing) {
                return prev.map(i =>
                    i.id === item.id && i.category === item.category
                        ? { ...i, quantity: i.quantity + qty }
                        : i
                );
            }
            return [...prev, { ...item, quantity: qty }];
        });
    };

    const removeItem = (id: string) => {
        setItems(prev => prev.filter(i => !(i.id === id)));
    };

    const updateQuantity = (id: string, quantity: number) => {
        if (quantity <= 0) { removeItem(id); return; }
        setItems(prev => prev.map(i => i.id === id ? { ...i, quantity } : i));
    };

    const clearCart = () => setItems([]);

    const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);

    return (
        <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart must be used within CartProvider');
    return context;
}
