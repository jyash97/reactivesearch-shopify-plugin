import React from 'react';
import { string, object, arrayOf, func, number } from 'prop-types';
import Highlight from 'react-highlight-words';

const Suggestions = ({
    currentValue,
    categories,
    getItemProps,
    highlightedIndex,
    parsedSuggestions,
    themeConfig,
}) => (
    <div
        css={{
            position: 'absolute',
            padding: 10,
            color: '#424242',
            fontSize: '0.9rem',
            border: '1px solid #ddd',
            background: 'white',
            borderRadius: 2,
            marginTop: 0,
            width: '100%',
            zIndex: 10,
        }}
    >
        {
            <div>
                {parsedSuggestions.slice(0, 5).map((suggestion, index) => (
                    <div
                        css={{
                            padding: 10,
                            background:
                                index === highlightedIndex
                                    ? '#eee'
                                    : 'transparent',
                        }}
                        key={suggestion.value}
                        {...getItemProps({
                            item: {
                                value:
                                    suggestion.source.title || suggestion.value,
                                source: suggestion.source,
                            },
                        })}
                    >
                        <div
                            css={{
                                display: 'flex',
                                alignItems: 'center',
                            }}
                        >
                            {
                                <img
                                    src={suggestion.source.image.src}
                                    alt=" "
                                    width="50px"
                                    css={{ marginRight: 15 }}
                                />
                            }
                            <div>
                                <Highlight
                                    searchWords={currentValue.split(' ')}
                                    textToHighlight={suggestion.source.title}
                                    highlightStyle={{
                                        fontWeight: 600,
                                        padding: 0,
                                    }}
                                />
                                <div
                                    css={{
                                        fontSize: '0.8rem',
                                        margin: '2px 0',
                                    }}
                                >
                                    <Highlight
                                        searchWords={currentValue.split(' ')}
                                        textToHighlight={`${suggestion.source.body_html.slice(
                                            0,
                                            200,
                                        )}${
                                            suggestion.source.body_html.length >
                                            200
                                                ? '...'
                                                : ''
                                        }`}
                                        highlightStyle={{
                                            fontWeight: 600,
                                            padding: 0,
                                        }}
                                    />
                                </div>
                                {suggestion.source.variants[0].price && (
                                    <div>
                                        {suggestion.source.variants[0].price}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                {categories.slice(0, 3).map((category, index) => (
                    <div
                        css={{
                            padding: 10,
                            background:
                                highlightedIndex ===
                                index + parsedSuggestions.slice(0, 5).length
                                    ? '#eee'
                                    : 'transparent',
                        }}
                        key={category.key}
                        {...getItemProps({
                            item: {
                                value: currentValue,
                                category: category.key,
                            },
                        })}
                    >
                        {currentValue}{' '}
                        <span
                            css={{
                                color: themeConfig.colors.primaryColor,
                            }}
                        >
                            in {category.key}
                        </span>
                    </div>
                ))}
                {Boolean(currentValue.length) && (
                    <div
                        css={{
                            color: themeConfig.colors.primaryColor,
                            padding: 10,
                            cursor: 'pointer',
                            background:
                                highlightedIndex ===
                                parsedSuggestions.slice(0, 5).length +
                                    categories.slice(0, 3).length
                                    ? '#eee'
                                    : 'transparent',
                        }}
                        {...getItemProps({
                            item: {
                                label: currentValue,
                                value: currentValue,
                            },
                        })}
                    >
                        Search for {"'"}
                        {currentValue}
                        {"'"} in all categories
                    </div>
                )}
            </div>
        }
    </div>
);

Suggestions.propTypes = {
    currentValue: string,
    categories: arrayOf(object),
    getItemProps: func,
    highlightedIndex: number,
    parsedSuggestions: arrayOf(object),
    themeConfig: object,
    moneyFormat: string,
};

export default Suggestions;
