import React from 'react';
import ReactDOM from 'react-dom';
import SearchPlugin from './components/SearchPlugin';
import ProductSuggestions from './components/ProductSuggestions';
import './index.css';

const isIdAvailble = id => document.getElementById(id);

const getPropsById = id => {
    const container = isIdAvailble(id);
    if (container) {
        return {
            isOpen: container.getAttribute('isOpen'),
            openWithModal: container.getAttribute('openWithModal'),
            disableSearchText: container.getAttribute('disableSearchText'),
        };
    }
    return null;
};

const renderById = (id, mode) => {
    const container = isIdAvailble(id);
    if (container) {
        ReactDOM.render(
            mode === 'suggestions' ? (
                <ProductSuggestions {...getPropsById(id)} />
            ) : (
                <SearchPlugin {...getPropsById(id)} />
            ),
            document.getElementById(id),
        );
    }
};
// ------------------ PRODUCT RECOMMENDATIONS ------------------

// Note: Only for internal testing, below id is not available for use

renderById('reactivesearch-shopify-product-recommendations', 'suggestions');

// Note: These ids can be used in plugin
renderById('reactivesearch-shopify-product-recommendations-1', 'suggestions');
renderById('reactivesearch-shopify-product-recommendations-2', 'suggestions');
renderById('reactivesearch-shopify-product-recommendations-2', 'suggestions');
renderById('reactivesearch-shopify-product-recommendations-4', 'suggestions');

// ------------------ SEARCH PLUGIN ------------------

// Note: Only for internal testing, below id is not available for use
renderById('reactivesearch-shopify');

// Note: These ids can be used in plugin
renderById('reactivesearch-shopify-1');
renderById('reactivesearch-shopify-2');
renderById('reactivesearch-shopify-3');
renderById('reactivesearch-shopify-4');
