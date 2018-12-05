import React from 'react';
import ReactDOM from 'react-dom';
import SearchPlugin from './components/SearchPlugin';
import ProductSuggestions from './components/ProductSuggestions';
import './index.css';

const mode = window.MODE;
const id = window.REACTIVE_SEARCH_SHOPIFY_ID_SUFFIX;

if (mode === 'product-recommendations') {
    ReactDOM.render(
        <ProductSuggestions />,
        document.getElementById(
            id
                ? `reactivesearch-shopify-product-recommendations-${id}`
                : 'reactivesearch-shopify-product-recommendations',
        ),
    );
} else {
    ReactDOM.render(
        <SearchPlugin />,
        document.getElementById(
            id ? `reactivesearch-shopify-${id}` : 'reactivesearch-shopify',
        ),
    );
}
