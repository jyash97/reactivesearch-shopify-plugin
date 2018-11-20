import React from 'react';
import { string, object, arrayOf, func, number } from 'prop-types';
import { css } from 'react-emotion';
import Highlight from 'react-highlight-words';
import strip from 'striptags';

const headingStyles = ({ titleColor, primaryColor }) => css`
    margin: 8px 0;
    background: ${primaryColor}1a;
    padding: 4px 10px;
    color: ${titleColor};
    font-weight: 500;
`;

const popularSearchStyles = ({ textColor }) => css`
    color: textColor;
    padding: 10px;
    cursor: pointer;
    margin-bottom: 4px;
    font-size: 0.9rem;
    align-items: center;
    transition: background ease 0.2s;
    :hover {
        background: #eee;
    }
`;

const Suggestions = ({
    currentValue,
    categories,
    getItemProps,
    highlightedIndex,
    parsedSuggestions,
    themeConfig,
    currency,
    popularSearches,
    showPopularSearches,
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
                {parsedSuggestions.length > 0 ? (
                    <h3 className={headingStyles(themeConfig.colors)}>
                        Products
                    </h3>
                ) : null}

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
                                    width="80px"
                                    css={{ marginRight: 15 }}
                                />
                            }
                            <div>
                                <Highlight
                                    searchWords={currentValue.split(' ')}
                                    textToHighlight={suggestion.source.title}
                                    highlightStyle={{
                                        fontWeight: 700,
                                        padding: 0,
                                        background: `${
                                            themeConfig.colors.primaryColor
                                        }33`,
                                        color: themeConfig.colors.titleColor,
                                        fontSize: '1rem',
                                    }}
                                    unhighlightStyle={{
                                        fontSize: '1rem',
                                        color: themeConfig.colors.titleColor,
                                    }}
                                />
                                <div
                                    css={{
                                        fontSize: '0.8rem',
                                        margin: '2px 0',
                                        color: themeConfig.colors.textColor,
                                    }}
                                >
                                    <Highlight
                                        searchWords={currentValue.split(' ')}
                                        textToHighlight={`${strip(
                                            suggestion.source.body_html.slice(
                                                0,
                                                200,
                                            ),
                                        )}${
                                            suggestion.source.body_html.length >
                                            200
                                                ? '...'
                                                : ''
                                        }`}
                                        highlightStyle={{
                                            fontWeight: 600,
                                            padding: 0,
                                            background: `${
                                                themeConfig.colors.primaryColor
                                            }33`,
                                            color: themeConfig.colors.textColor,
                                        }}
                                    />
                                </div>
                                {suggestion.source.variants &&
                                    suggestion.source.variants[0].price && (
                                        <div
                                            css={{
                                                color:
                                                    themeConfig.colors
                                                        .titleColor,
                                            }}
                                        >
                                            {currency}{' '}
                                            {
                                                suggestion.source.variants[0]
                                                    .price
                                            }
                                        </div>
                                    )}
                            </div>
                        </div>
                    </div>
                ))}

                {popularSearches.length > 0 && showPopularSearches ? (
                    <h3 className={headingStyles(themeConfig.colors)}>
                        Popular Searches
                    </h3>
                ) : null}
                {showPopularSearches
                    ? popularSearches.map(item => (
                          <div
                              key={item.key}
                              className={popularSearchStyles(
                                  themeConfig.colors,
                              )}
                              {...getItemProps({
                                  item: {
                                      label: item.key,
                                      value: item.key,
                                  },
                              })}
                          >
                              {item.key}
                          </div>
                      ))
                    : null}
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
    currency: string,
};

export default Suggestions;
