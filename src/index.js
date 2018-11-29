import React from 'react';
import ReactDOM from 'react-dom';
import SearchPlugin from './components/SearchPlugin';
import ProductSuggestions from './components/ProductSuggestions';
import './index.css';

const mode = window.MODE;

if (mode === 'product-recommendations') {
    ReactDOM.render(
        <ProductSuggestions />,
        document.getElementById(
            'reactivesearch-shopify-product-recommendations',
        ),
    );
} else {
    ReactDOM.render(
        <SearchPlugin />,
        document.getElementById('reactivesearch-shopify'),
    );
}
