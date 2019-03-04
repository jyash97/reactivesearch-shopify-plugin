import React, { Component } from 'react';
import {
    ReactiveBase,
    CategorySearch,
    MultiList,
    ReactiveList,
    SelectedFilters,
    DynamicRangeSlider,
} from '@appbaseio/reactivesearch';
import { string } from 'prop-types';
import { mediaMax } from '@divyanshu013/media';
import { css } from 'react-emotion';
import { Card, Collapse, Button, Icon, message, Affix } from 'antd';
import strip from 'striptags';
import Truncate from 'react-truncate';

import Suggestions from './Suggestions';
import { accapi } from '../constants';
import Loader from './Loader';

const { Meta } = Card;
const { Panel } = Collapse;

const minimalSearchStyles = ({ titleColor }) => css`
    input {
        background: transparent;
        border: 0;
        color: ${titleColor};
        box-shadow: 0px 0px 4px ${titleColor}1a;
    }
`;

const paginationStyle = toggleFilters => css`
    max-width:none;
    a{
        border-radius: 2px;
    }
    a:first-child{
        float: left;
    }
    a:last-child{
        float: right;
    }
    @media(max-width: 768px){
        display: ${toggleFilters ? 'none' : 'block'}
    },
`;

const cardStyles = ({ textColor, titleColor }) => css`
    .ant-card-meta-title {
        color: ${titleColor};
    }
    .ant-card-meta-description {
        color: ${textColor};
    }
`;

const cardTitleStyles = ({ titleColor, primaryColor }) => css`
    margin: 0;
    padding: 0;
    color: ${titleColor};
    mark {
        color: ${titleColor};
        background-color: ${primaryColor}4d};
    }
`;

const mobileButtonStyles = css`
    border-radius: 0;
    border: 0;
`;

const checkPreferences = settingsFetched => {
    const defaultSettings = {
        isFilterCollapsible: true,
        showPrice: true,
        showSelectedFilters: true,
        showPopularSearches: true,
        showCollectionsFilter: false,
    };

    if (settingsFetched) {
        const fetchedKeys = Object.keys(settingsFetched); // From preferences Endpoint
        const defaultKeys = Object.keys(defaultSettings); // Preferences we have by default
        if (fetchedKeys.length !== defaultKeys.length) {
            return defaultSettings;
        }
        let preferencesIsEqual = true;
        fetchedKeys.forEach(key => {
            if (!defaultKeys.includes(key)) {
                preferencesIsEqual = false;
            }
        });
        if (preferencesIsEqual) {
            return settingsFetched;
        }
    }
    return defaultSettings;
};

class Search extends Component {
    state = {
        preferences: null,
        theme: {},
        currency: '',
        toggleFilters: false,
        popularSearches: [],
    };

    async componentDidMount() {
        try {
            const { appname, credentials } = this.props;
            const preferences = await fetch(
                `${accapi}/app/${appname}/preferences`,
                {
                    headers: {
                        Authorization: `Basic ${btoa(credentials)}`,
                    },
                },
            ).then(res => res.json());

            this.getPopularSearches();

            this.setState({
                preferences: preferences.message.default,
                theme: preferences.message._theme,
                settings: checkPreferences(preferences.message._settings),
                currency: preferences.message._store
                    ? preferences.message._store.currency
                    : '',
                themeType: preferences.message._themeType || 'classic',
            });
        } catch (error) {
            // eslint-disable-next-line
            console.error(error);
        }
    }

    getPopularSearches = async () => {
        let topPopularSearches = [];
        try {
            const { appname, credentials } = this.props;
            const response = await fetch(
                `${accapi}/analytics/${appname}/popularsearches`,
                {
                    headers: {
                        Authorization: `Basic ${btoa(credentials)}`,
                    },
                },
            );
            const { popularSearches } = await response.json();
            if (response.status >= 400) {
                message.error(popularSearches.message);
            } else {
                topPopularSearches = popularSearches.sort(item => item.count);
                if (topPopularSearches.length > 5) {
                    topPopularSearches = topPopularSearches.slice(0, 5);
                }
                this.setState({
                    popularSearches: topPopularSearches,
                });
            }
        } catch (e) {
            console.error('No Popular Searches');
        }
    };

    getMultiListProps = listComponentProps => {
        const { title, ...restProps } = listComponentProps;
        return restProps;
    };

    handleToggleFilter = () => {
        this.setState(({ toggleFilters }) => ({
            toggleFilters: !toggleFilters,
        }));
    };

    getFontFamily = () => {
        const { theme } = this.state;
        let fontFamily = '';
        if (theme.typography && theme.typography.fontFamily !== 'default') {
            fontFamily = theme.typography.fontFamily; // eslint-disable-line
        }
        return fontFamily ? { fontFamily } : {};
    };

    renderCollectionFilter = (
        font,
        { theme } = this.state, // eslint-disable-line
        { themeType } = this.state,
    ) => {
        const defaultQuery = {
            query: { type: { value: 'collections' } },
            aggregations: {
                collections: { terms: { field: 'title.keyword' } },
            },
        };

        return (
            <MultiList
                dataField="collections"
                componentId="collections"
                css={font}
                defaultQuery={() => defaultQuery}
                showCheckbox={themeType !== 'minimal'}
            />
        );
    };

    renderCategorySearch = categorySearchProps => {
        const {
            settings,
            popularSearches,
            theme,
            currency,
            preferences,
        } = this.state;
        const { search } = preferences;
        return (
            <CategorySearch
                componentId="search"
                filterLabel="Search"
                dataField={
                    ['title', 'body_html', 'vendor'] // TODO: add subfields to improve search results
                }
                placeholder="Search for products..."
                iconPosition="right"
                css={{ marginBottom: 20 }}
                renderAllSuggestions={({
                    currentValue,
                    categories,
                    isOpen,
                    getItemProps,
                    highlightedIndex,
                    parsedSuggestions,
                }) =>
                    isOpen &&
                    Boolean(currentValue.length) && (
                        <Suggestions
                            currentValue={currentValue}
                            categories={categories}
                            getItemProps={getItemProps}
                            highlightedIndex={highlightedIndex}
                            parsedSuggestions={parsedSuggestions}
                            themeConfig={theme}
                            currency={currency}
                            showPopularSearches={settings.showPopularSearches}
                            popularSearches={popularSearches}
                        />
                    )
                }
                {...search}
                {...categorySearchProps}
                categoryField="product_type.keyword"
            />
        );
    };

    showCollapseFilters = componentsIdArray => {
        const {
            settings: { isFilterCollapsible },
        } = this.state;
        const isMobile = window.innerWidth < 768;
        if (isMobile) {
            return componentsIdArray;
        }
        if (isFilterCollapsible) {
            return [];
        }
        return componentsIdArray;
    };

    render() {
        const { appname, credentials } = this.props;
        const {
            preferences,
            theme,
            themeType,
            currency,
            toggleFilters,
            settings,
        } = this.state;
        const isMobile = window.innerWidth < 768;
        if (!preferences) {
            return <Loader />;
        }
        const { result } = preferences;
        const otherComponents = Object.keys(preferences).filter(
            key => key !== 'search' && key !== 'result',
        );
        return (
            <ReactiveBase
                app={appname}
                credentials={credentials}
                theme={theme}
                analytics
            >
                {isMobile ? (
                    <Affix
                        css={{
                            position: 'fixed',
                            bottom: 0,
                            zIndex: 4,
                            left: 0,
                            width: '100%',
                        }}
                    >
                        <Button
                            block
                            type="primary"
                            className={mobileButtonStyles}
                            size="large"
                            onClick={this.handleToggleFilter}
                        >
                            <Icon type={toggleFilters ? 'list' : 'filter'} />
                            {toggleFilters ? 'Show Results' : 'Show Filters'}
                        </Button>
                    </Affix>
                ) : null}

                <div css={{ maxWidth: 1200, margin: '25px auto' }}>
                    {themeType === 'classic' && this.renderCategorySearch()}

                    <div
                        css={{
                            display: 'grid',
                            gridTemplateColumns: '300px 1fr',
                            [mediaMax.medium]: { gridTemplateColumns: '1fr' },
                            gridGap: 20,
                        }}
                    >
                        <div
                            css={{
                                display: 'grid',
                                gridTemplateColumns:
                                    'repeat(auto-fit, minmax (250px, 1fr))',
                                gridGap: 0,
                                alignSelf: 'start',
                                border:
                                    themeType === 'classic'
                                        ? '1px solid #eee'
                                        : 0,
                                [mediaMax.medium]: {
                                    display: toggleFilters ? 'grid' : 'none',
                                    gridTemplateColumns: '1fr',
                                },
                                boxShadow:
                                    themeType === 'minimal'
                                        ? `0 0 4px ${theme.colors.titleColor}1a`
                                        : 0,
                            }}
                        >
                            <Collapse
                                bordered={false}
                                defaultActiveKey={this.showCollapseFilters([
                                    ...otherComponents,
                                    'price-filter',
                                    'collections-filter',
                                ])}
                            >
                                {otherComponents.map(listComponent => (
                                    <Panel
                                        header={
                                            <span
                                                css={{
                                                    color:
                                                        theme.colors.titleColor,
                                                    fontWeight: 'bold',
                                                    fontSize: '15px',
                                                }}
                                            >
                                                {preferences[listComponent]
                                                    .title || 'Select Item'}
                                            </span>
                                        }
                                        showArrow={themeType !== 'minimal'}
                                        key={listComponent}
                                        css={{
                                            ...this.getFontFamily(),
                                            maxWidth: isMobile
                                                ? 'none'
                                                : '298px',
                                        }}
                                    >
                                        <MultiList
                                            key={listComponent}
                                            componentId={listComponent}
                                            {...this.getMultiListProps(
                                                preferences[listComponent],
                                            )}
                                            dataField={`${
                                                preferences[listComponent]
                                                    .dataField
                                            }.keyword`}
                                            showCount={themeType !== 'minimal'}
                                            showCheckbox={
                                                themeType !== 'minimal'
                                            }
                                            css={this.getFontFamily()}
                                        />
                                    </Panel>
                                ))}
                                {settings.showPrice ? (
                                    <Panel
                                        header={
                                            <span
                                                css={{
                                                    color:
                                                        theme.colors.titleColor,
                                                    fontWeight: 'bold',
                                                    fontSize: '15px',
                                                }}
                                            >
                                                Price
                                            </span>
                                        }
                                        showArrow={themeType !== 'minimal'}
                                        key="price-filter"
                                        css={this.getFontFamily()}
                                    >
                                        <DynamicRangeSlider
                                            componentId="price"
                                            dataField="variants.price"
                                            tooltipTrigger="hover"
                                            css={this.getFontFamily()}
                                            rangeLabels={(min, max) => ({
                                                start: `${currency} ${min}`,
                                                end: `${currency} ${max}`,
                                            })}
                                        />
                                    </Panel>
                                ) : null}
                                {settings.showCollectionsFilter ? (
                                    <Panel
                                        header={
                                            <span
                                                css={{
                                                    color:
                                                        theme.colors.titleColor,
                                                    fontWeight: 'bold',
                                                    fontSize: '15px',
                                                }}
                                            >
                                                Collections
                                            </span>
                                        }
                                        showArrow={themeType !== 'minimal'}
                                        key="collections-filter"
                                        css={this.getFontFamily()}
                                    >
                                        {this.renderCollectionFilter(
                                            this.getFontFamily,
                                        )}
                                    </Panel>
                                ) : null}
                            </Collapse>
                        </div>

                        <div>
                            {themeType === 'minimal' &&
                                this.renderCategorySearch({
                                    className: minimalSearchStyles(
                                        theme.colors,
                                    ),
                                })}

                            {settings.showSelectedFilters &&
                            themeType !== 'minimal' ? (
                                <SelectedFilters />
                            ) : null}

                            <ReactiveList
                                componentId="results"
                                dataField="title"
                                defaultQuery={() => ({
                                    query: {
                                        term: { _type: 'products' },
                                    },
                                })}
                                renderData={(
                                    {
                                        _id,
                                        title,
                                        body_html,
                                        handle,
                                        image,
                                        variants,
                                    },
                                    triggerClickAnalytics,
                                ) => (
                                    <a
                                        onClick={triggerClickAnalytics}
                                        href={`/products/${handle}`}
                                        target="_blank"
                                        rel="noreferrer noopener"
                                        key={_id}
                                    >
                                        <Card
                                            hoverable
                                            bordered={false}
                                            cover={
                                                image && (
                                                    <img
                                                        src={image.src}
                                                        width="100%"
                                                        alt={title}
                                                    />
                                                )
                                            }
                                            css={
                                                (this.getFontFamily(),
                                                themeType === 'minimal'
                                                    ? { padding: 10 }
                                                    : {})
                                            }
                                            bodyStyle={
                                                themeType === 'minimal'
                                                    ? {
                                                          padding:
                                                              '15px 10px 10px',
                                                      }
                                                    : {}
                                            }
                                        >
                                            <Meta
                                                title={
                                                    <h3
                                                        className={cardTitleStyles(
                                                            theme.colors,
                                                        )}
                                                        css={
                                                            themeType ===
                                                            'minimal'
                                                                ? {
                                                                      fontWeight: 600,
                                                                  }
                                                                : {}
                                                        }
                                                        dangerouslySetInnerHTML={{
                                                            __html: title,
                                                        }}
                                                    />
                                                }
                                                className={cardStyles({
                                                    ...theme.colors,
                                                })}
                                                description={
                                                    themeType === 'classic' && (
                                                        <Truncate
                                                            lines={4}
                                                            ellipsis={
                                                                <span>...</span>
                                                            }
                                                        >
                                                            {strip(body_html)}
                                                        </Truncate>
                                                    )
                                                }
                                            />
                                            <div>
                                                <h3
                                                    style={{
                                                        fontWeight: 500,
                                                        fontSize: '1rem',
                                                        marginTop: 6,
                                                        color:
                                                            themeType ===
                                                            'minimal'
                                                                ? theme.colors
                                                                      .textColor
                                                                : theme.colors
                                                                      .titleColor,
                                                    }}
                                                >
                                                    {variants &&
                                                        `${currency} ${
                                                            variants[0].price
                                                        }`}
                                                </h3>
                                            </div>
                                        </Card>
                                    </a>
                                )}
                                pagination
                                size={9}
                                innerClass={{
                                    list: css({
                                        display: 'grid',
                                        gridTemplateColumns:
                                            'repeat(auto-fit, minmax(250px, 1fr))',
                                        gridGap: 10,
                                        [mediaMax.medium]: {
                                            gridTemplateColumns:
                                                'repeat(auto-fit, minmax(200px, 1fr))',
                                            display: toggleFilters
                                                ? 'none'
                                                : 'grid',
                                        },
                                        [mediaMax.small]: {
                                            gridTemplateColumns:
                                                'repeat(auto-fit, minmax(150px, 1fr))',
                                        },
                                    }),
                                    resultsInfo: css({
                                        padding: 18,
                                        height: 60,
                                        p: {
                                            margin: 0,
                                            fontSize: '1rem',
                                            fontWeight: 500,
                                            textAlign: 'right',
                                        },
                                        [mediaMax.medium]: {
                                            display: toggleFilters
                                                ? 'none'
                                                : 'grid',
                                        },
                                    }),
                                    poweredBy: css({
                                        margin: 15,
                                    }),
                                    noResults: css({
                                        display: 'flex',
                                        justifyContent: 'center',
                                        padding: '25px 0',
                                    }),
                                    pagination: paginationStyle(toggleFilters),
                                }}
                                {...result}
                                react={{
                                    and: [
                                        'search',
                                        ...otherComponents,
                                        'price',
                                        'collections',
                                    ],
                                }}
                            />
                        </div>
                    </div>
                </div>
            </ReactiveBase>
        );
    }
}

Search.propTypes = {
    appname: string.isRequired,
    credentials: string.isRequired,
};

export default Search;
