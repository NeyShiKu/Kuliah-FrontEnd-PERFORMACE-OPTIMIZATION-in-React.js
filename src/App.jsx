// src/App.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { getFromCache, setToCache } from './utils/searchCache';
import { products } from './data/products';
import SearchBar from './components/SearchBar';
import ProductList from './components/ProductList';
import { lazy, Suspense } from 'react';

const AboutPage = lazy(() => import('./components/AboutPage'));

// Helper: simpan ke localStorage
const saveCartToStorage = (cart) => {
    localStorage.setItem('pos-cart', JSON.stringify(cart));
};

// Helper: baca dari localStorage
const loadCartFromStorage = () => {
    try {
        const saved = localStorage.getItem('pos-cart');
        return saved ? JSON.parse(saved) : [];
    } catch (e) {
        console.warn('Gagal memuat keranjang dari localStorage:' + e);
        return [];
    }
};

function App() {
    const [searchTerm, setSearchTerm] = useState('');
    const [cart, setCart] = useState(() => loadCartFromStorage()); // inisialisasi dari storage
    const [view, setView] = useState('pos'); // 'pos' atau 'about'

    // Simpan ke localStorage setiap cart berubah
    useEffect(() => {
        saveCartToStorage(cart);
    }, [cart]);

    // Fungsi pembantu: filter produk dengan caching
    const filterProducts = (term) => {
        if (!term.trim()) return products;

        const cacheKey = term.toLowerCase().trim();
        const cached = getFromCache(cacheKey);
        if (cached) {
            console.log('🎯 Cache hit:', cacheKey); // opsional: untuk debugging
            return cached;
        }

        console.log('🔍 Cache miss, filtering:', cacheKey); // opsional

        const filtered = products.filter((p) =>
            p.name.toLowerCase().includes(cacheKey) ||
            p.brand.toLowerCase().includes(cacheKey) ||
            p.category.toLowerCase().includes(cacheKey)
        );

        setToCache(cacheKey, filtered);
        return filtered;
    };

    // Gunakan useMemo hanya untuk memastikan tidak memanggil filterProducts berulang dalam satu render
    const filteredProducts = useMemo(() => {
        return filterProducts(searchTerm);
    }, [searchTerm]);

    const handleAddToCart = (product) => {
        setCart((prev) => {
            const existing = prev.find((item) => item.product.id === product.id);
            if (existing) {
                return prev.map((item) =>
                    item.product.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            } else {
                return [...prev, { product, quantity: 1 }];
            }
        });
    };

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <>
            <div style={{ marginBottom: '20px' }}>
                <button onClick={() => setView('pos')}>POS</button>
                <button onClick={() => setView('about')} style={{ marginLeft: '10px'}}>About</button>
            </div>
            {view === 'pos' ? (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
            <h1>🛒 Point of Sales (POS)</h1>
            <div style={{ backgroundColor: '#e8f5e9', padding: '12px', borderRadius: '6px', marginBottom: '20px' }}>
                <strong>Keranjang:</strong> {totalItems} item
            </div>

            <SearchBar onSearch={setSearchTerm} />
            <div style={{ border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
                <ProductList
                    filteredProducts={filteredProducts}
                    onAddToCart={handleAddToCart}
                />
            </div>
        </div>
            ) : (
        <Suspense fallback={<div>Memuat halaman About...</div>}>
            <AboutPage />
        </Suspense>
            )}
        </>
    );
}

export default App;
