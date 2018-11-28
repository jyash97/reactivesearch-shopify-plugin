import React from 'react';
import SearchPlugin from './components/SearchPlugin';
import ProductSuggestions from './components/ProductSuggestions';

const mode = window.MODE;

const App = () => {
    if (mode === 'product_recommendations') {
        return <ProductSuggestions />;
    }
    return <SearchPlugin />;
};
export default App;
