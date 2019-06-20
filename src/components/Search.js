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
import { css, injectGlobal } from 'react-emotion';
import { Card, Collapse, Button, Icon, message, Affix } from 'antd';
import strip from 'striptags';
import Truncate from 'react-truncate';
import get from 'lodash.get';

import Suggestions from './Suggestions';
import { accapi } from '../constants';
import Loader from './Loader';
import { browserColors } from '../utils';

const { Meta } = Card;
const { Panel } = Collapse;

const resultRef = React.createRef();

const minimalSearchStyles = ({ titleColor }) => css`
    input {
        background: transparent;
        border: 0;
        color: ${titleColor};
        box-shadow: 0px 0px 4px ${titleColor}1a;
    }
`;

const loaderStyle = css`
    margin: 10px 0;
    position: relative;
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

export const cardStyles = ({ textColor, titleColor, primaryColor }) => css`
    position: relative;
    overflow: hidden;

    .product-button {
        top: -50%;
        position: absolute;
        background: ${primaryColor} !important;
        border: 0;
        box-shadow: 0 2px 4px ${titleColor}33;
        left: 50%;
        transform: translateX(-50%);
        transition: all ease 0.2s;
    }

    ::before {
        content: '';
        width: 100%;
        height: 0vh;
        background: ${primaryColor}00 !important;
        position: absolute;
        top: 0;
        left: 0;
        display: block;
        transition: all ease 0.4s;
    }

    .ant-card-meta-title {
        color: ${titleColor};
    }
    .ant-card-meta-description {
        color: ${textColor};
    }

    &:hover {
        .product-button {
            top: 50%;
        }
        ::before {
            width: 100%;
            height: 100vh;
            background: ${primaryColor}1a !important;
        }
    }
`;

export const cardTitleStyles = ({ titleColor, primaryColor }) => css`
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

const colorContainer = css`
    display: grid;
    grid-gap: 5px;
    grid-template-columns: repeat(auto-fill, 30px);
    justify-content: center;
`;

const checkPreferences = settingsFetched => {
    const defaultSettings = {
        isFilterCollapsible: true,
        showPrice: true,
        showSelectedFilters: true,
        showPopularSearches: true,
        showCollectionsFilter: false,
        showSizeFilter: false,
        showColorFilter: false,
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

const searchRef = React.createRef();

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
            const preferenceMessage = get(preferences, 'message', {});

            const pagination = get(
                preferenceMessage,
                'default.result.pagination',
                true,
            );
            this.setState({
                preferences: get(preferenceMessage, 'default', {}),
                customMessage: get(preferenceMessage, 'customMessage', ''),
                customSuggestions: get(
                    preferenceMessage,
                    'default.search.customSuggestions',
                    '',
                ),
                pagination,
                showDescription: get(
                    preferenceMessage,
                    'default.result.showDescription',
                    true,
                ),
                customIcon: get(
                    preferenceMessage,
                    'searchButton.searchIcon',
                    '',
                ),
                autoSuggest: get(
                    preferenceMessage,
                    'default.search.autoSuggest',
                    true,
                ),
                theme: get(preferenceMessage, '_theme', {
                    colors: {
                        primaryColor: '#0B6AFF',
                        primaryTextColor: '#fff',
                        textColor: '#424242',
                        titleColor: '#424242',
                    },
                    typography: {
                        fontFamily: 'default',
                    },
                }),
                settings: checkPreferences(
                    get(preferenceMessage, '_settings', {}),
                ),
                currency: get(preferenceMessage, '_store.currency', ''),
                themeType: get(preferenceMessage, '_themeType', 'classic'),
            });

            const inputRef = get(searchRef, 'current._inputRef', null);

            if (inputRef) {
                inputRef.focus();
            }

            const globalStyles = get(preferenceMessage, 'customStyles', '');
            injectGlobal`
                ${globalStyles}
            `;

            if (!pagination) {
                const containerCollection = document.getElementsByClassName(
                    'ant-modal',
                );

                if (containerCollection && containerCollection.length > 0) {
                    this.scrollContainer = containerCollection[0];
                    this.scrollContainer.addEventListener(
                        'scroll',
                        this.scrollHandler,
                    );
                }
            }
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

    scrollHandler = () => {
        const { scrollTop, clientHeight, scrollHeight } = this.scrollContainer;

        if (scrollTop + clientHeight >= scrollHeight) {
            if (resultRef.current) {
                resultRef.current.loadMore();
            }
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
        const receivedFont = get(theme, 'typography.fontFamily', '');
        let fontFamily = '';
        if (receivedFont && receivedFont !== 'default') {
            fontFamily = receivedFont; // eslint-disable-line
        }
        return fontFamily ? { fontFamily } : {};
    };

    renderCollectionFilter = (
        font,
        { theme, customMessage } = this.state, // eslint-disable-line
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
                renderNoResults={() => (
                    <div
                        dangerouslySetInnerHTML={{
                            __html: get(
                                customMessage,
                                'noFilterItem',
                                'No items Found',
                            ),
                        }}
                    />
                )}
                defaultQuery={() => defaultQuery}
                showCheckbox={themeType !== 'minimal'}
            />
        );
    };

    renderColorFilter = (
        font,
        { theme } = this.state, // eslint-disable-line
        { themeType, customMessage } = this.state,
    ) => {
        return (
            <React.Fragment>
                <MultiList
                    dataField="options.name.keyword"
                    defaultValue={['color', 'Color']}
                    componentId="colorOption"
                    showFilter={false}
                    style={{ display: 'none' }}
                />
                <MultiList
                    dataField="options.values.keyword"
                    componentId="color"
                    react={{ and: ['colorOption'] }}
                    css={font}
                    showCheckbox={themeType !== 'minimal'}
                    render={({ loading, error, data, handleChange, value }) => {
                        const values = [...new Set(Object.keys(value))];
                        const broswerStringColors = Object.keys(browserColors);
                        if (loading) {
                            return (
                                <div
                                    className={loaderStyle}
                                    dangerouslySetInnerHTML={{
                                        __html: get(
                                            customMessage,
                                            'fetchingFilterOptions',
                                            'Fetching Colors',
                                        ),
                                    }}
                                />
                            );
                        }
                        if (error) {
                            return (
                                <div>
                                    Something went wrong! Error details{' '}
                                    {JSON.stringify(error)}
                                </div>
                            );
                        }
                        if (data.length === 0) {
                            return (
                                <div
                                    dangerouslySetInnerHTML={{
                                        __html: get(
                                            customMessage,
                                            'noFilterItem',
                                            'No color Found',
                                        ),
                                    }}
                                />
                            );
                        }
                        const primaryColor =
                            get(theme, 'colors.primaryColor', '') || '#0B6AFF';
                        return (
                            <div className={colorContainer}>
                                {data.map(item =>
                                    broswerStringColors.includes(
                                        item.key.toLowerCase(),
                                    ) ? (
                                        <div
                                            key={item.key}
                                            onClick={() =>
                                                handleChange(item.key)
                                            }
                                            css={{
                                                width: '100%',
                                                height: 30,
                                                background: item.key,
                                                transition: 'all ease .2s',
                                                border: `2px solid ${
                                                    values &&
                                                    values.includes(item.key)
                                                        ? primaryColor
                                                        : 'transparent'
                                                }`,
                                            }}
                                        />
                                    ) : null,
                                )}
                            </div>
                        );
                    }}
                />
            </React.Fragment>
        );
    };

    renderSizeFilter = (
        font,
        { theme, customMessage } = this.state, // eslint-disable-line
        { themeType } = this.state,
    ) => {
        return (
            <React.Fragment>
                <MultiList
                    dataField="options.name.keyword"
                    defaultValue={['size', 'Size']}
                    componentId="sizeOption"
                    showFilter={false}
                    css={{ display: 'none' }}
                />
                <MultiList
                    dataField="options.values.keyword"
                    componentId="size"
                    react={{ and: ['sizeOption'] }}
                    css={font}
                    loader={() => (
                        <div
                            className={loaderStyle}
                            dangerouslySetInnerHTML={{
                                __html: get(
                                    customMessage,
                                    'fetchingFilterOptions',
                                    'Fetching Sizes!',
                                ),
                            }}
                        />
                    )}
                    renderNoResults={() => (
                        <div
                            dangerouslySetInnerHTML={{
                                __html: get(
                                    customMessage,
                                    'noFilterItem',
                                    'No sizes Found',
                                ),
                            }}
                        />
                    )}
                    showCheckbox={themeType !== 'minimal'}
                />
            </React.Fragment>
        );
    };

    renderCategorySearch = categorySearchProps => {
        const {
            settings,
            popularSearches,
            theme,
            currency,
            preferences,
            customMessage,
            customSuggestions,
            autoSuggest,
            themeType,
            customIcon,
            toggleFilters,
        } = this.state;
        const { search } = preferences;

        return (
            <CategorySearch
                componentId="search"
                filterLabel="Search"
                dataField={[
                    'title',
                    'title.keyword',
                    'title.search',
                    'title.autosuggest',
                    'body_html',
                    'body_html.keyword',
                    'body_html.autosuggest',
                    'body_html.search',
                    'vendor',
                    'title.keyword',
                    'title.search',
                    'title.autosuggest',
                ]}
                className="search"
                placeholder="Search for products..."
                iconPosition="right"
                icon={customIcon || undefined}
                ref={searchRef}
                css={{
                    marginBottom: 20,
                    position: 'sticky',
                    top: '10px',
                    zIndex: 4,
                    display: toggleFilters ? 'none' : 'block',
                }}
                autosuggest={autoSuggest}
                render={({
                    value,
                    categories,
                    rawSuggestions,
                    downshiftProps,
                    loading,
                }) => {
                    return (
                        downshiftProps.isOpen &&
                        Boolean(value.length) && (
                            <Suggestions
                                themeType={themeType}
                                currentValue={value}
                                categories={categories}
                                customMessage={customMessage}
                                getItemProps={downshiftProps.getItemProps}
                                highlightedIndex={
                                    downshiftProps.highlightedIndex
                                }
                                loading={loading}
                                parsedSuggestions={rawSuggestions.filter(
                                    suggestion =>
                                        suggestion._source.type !==
                                        'collections',
                                )}
                                themeConfig={theme}
                                currency={currency}
                                showPopularSearches={
                                    settings.showPopularSearches
                                }
                                popularSearches={popularSearches}
                                customSuggestions={customSuggestions}
                            />
                        )
                    );
                }}
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
            customMessage,
            pagination,
            showDescription,
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
                                    'color-filter',
                                    'size-filter',
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
                                        className="filter"
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
                                            renderItem={item => (
                                                <span
                                                    dangerouslySetInnerHTML={{
                                                        __html: item,
                                                    }}
                                                />
                                            )}
                                            loader={
                                                <div
                                                    className={loaderStyle}
                                                    dangerouslySetInnerHTML={{
                                                        __html: get(
                                                            customMessage,
                                                            'fetchingFilterOptions',
                                                            '',
                                                        ),
                                                    }}
                                                />
                                            }
                                            renderNoResults={() => (
                                                <div
                                                    dangerouslySetInnerHTML={{
                                                        __html: get(
                                                            customMessage,
                                                            'noFilterItem',
                                                            'No items Found',
                                                        ),
                                                    }}
                                                />
                                            )}
                                            showCount={themeType !== 'minimal'}
                                            showCheckbox={
                                                themeType !== 'minimal'
                                            }
                                            css={this.getFontFamily()}
                                        />
                                    </Panel>
                                ))}
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
                                        className="filter"
                                    >
                                        {this.renderCollectionFilter(
                                            this.getFontFamily,
                                        )}
                                    </Panel>
                                ) : null}
                                {settings.showColorFilter ? (
                                    <Panel
                                        className="filter"
                                        header={
                                            <span
                                                css={{
                                                    color:
                                                        theme.colors.titleColor,
                                                    fontWeight: 'bold',
                                                    fontSize: '15px',
                                                }}
                                            >
                                                Color
                                            </span>
                                        }
                                        showArrow={themeType !== 'minimal'}
                                        key="color-filter"
                                        css={this.getFontFamily()}
                                    >
                                        {this.renderColorFilter(
                                            this.getFontFamily,
                                        )}
                                    </Panel>
                                ) : null}
                                {settings.showSizeFilter ? (
                                    <Panel
                                        className="filter"
                                        header={
                                            <span
                                                css={{
                                                    color:
                                                        theme.colors.titleColor,
                                                    fontWeight: 'bold',
                                                    fontSize: '15px',
                                                }}
                                            >
                                                Size
                                            </span>
                                        }
                                        showArrow={themeType !== 'minimal'}
                                        key="size-filter"
                                        css={this.getFontFamily()}
                                    >
                                        {this.renderSizeFilter(
                                            this.getFontFamily,
                                        )}
                                    </Panel>
                                ) : null}
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
                                        className="filter"
                                    >
                                        <DynamicRangeSlider
                                            componentId="price"
                                            dataField="variants.price"
                                            tooltipTrigger="hover"
                                            showHistogram={false}
                                            style={{ marginTop: 50 }}
                                            css={this.getFontFamily()}
                                            loader={
                                                <div
                                                    className={loaderStyle}
                                                    dangerouslySetInnerHTML={{
                                                        __html: get(
                                                            customMessage,
                                                            'fetchingFilterOptions',
                                                            '',
                                                        ),
                                                    }}
                                                />
                                            }
                                            rangeLabels={(min, max) => ({
                                                start: `${currency} ${min}`,
                                                end: `${currency} ${max}`,
                                            })}
                                        />
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
                                    query: { term: { type: 'products' } },
                                })}
                                ref={resultRef}
                                renderNoResults={() => (
                                    <div
                                        css={{ textAlign: 'right' }}
                                        dangerouslySetInnerHTML={{
                                            __html: get(
                                                customMessage,
                                                'noResultItem',
                                                'No Results Found!',
                                            ),
                                        }}
                                    />
                                )}
                                renderResultStats={({
                                    numberOfResults,
                                    time,
                                }) => {
                                    return (
                                        <div
                                            css={{ textAlign: 'right' }}
                                            dangerouslySetInnerHTML={{
                                                __html: get(
                                                    customMessage,
                                                    'resultStats',
                                                    '[count] products found in [time] ms',
                                                )
                                                    .replace(
                                                        '[count]',
                                                        numberOfResults,
                                                    )
                                                    .replace('[time]', time),
                                            }}
                                        />
                                    );
                                }}
                                renderItem={(
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
                                            className={`${cardStyles({
                                                ...theme.colors,
                                            })} card`}
                                            cover={
                                                image && (
                                                    <img
                                                        src={image.src}
                                                        width="100%"
                                                        alt={title}
                                                    />
                                                )
                                            }
                                            css={{
                                                ...this.getFontFamily(),
                                                padding:
                                                    themeType === 'minimal'
                                                        ? '10px'
                                                        : 0,
                                            }}
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
                                                description={
                                                    showDescription &&
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
                                                        `${currency} ${get(
                                                            variants[0],
                                                            'price',
                                                            '',
                                                        )}`}
                                                </h3>
                                            </div>
                                            <Button
                                                type="primary"
                                                size="large"
                                                className="product-button"
                                            >
                                                <Icon type="eye" />
                                                View Product
                                            </Button>
                                        </Card>
                                    </a>
                                )}
                                pagination={pagination}
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
                                        display: 'none',
                                        visibility: 'hidden',
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
                                        'color',
                                        'size',
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
