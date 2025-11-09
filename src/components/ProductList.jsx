// src/components/ProductList.jsx
import React from 'react';
import { FixedSizeList as List } from 'react-window';
import ProductRow from './ProductRow';

// Komponen baris dalam daftar virtual
const Row = ({ index, style, data }) => {
    const { filteredProducts, onAddToCart } = data;
    return (
        <div style={style}>
            <ProductRow
                product={filteredProducts[index]}
                onAddToCart={onAddToCart}
            />
        </div>
    );
};

const ProductList = ({ filteredProducts, onAddToCart }) => {
    return (
        <List
            height={600}
            itemCount={filteredProducts.length}
            itemSize={80} // tinggi tiap baris (sesuaikan dengan desain)
            width="100%"
            itemData={{ filteredProducts, onAddToCart }} // lewatkan data ke Row
        >
            {Row}
        </List>
    );
};

export default ProductList;
