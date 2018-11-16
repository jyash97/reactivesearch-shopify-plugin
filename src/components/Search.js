import React, { Component } from 'react';
import {
    ReactiveBase,
    CategorySearch,
    MultiList,
    ReactiveList,
    SelectedFilters,
} from '@appbaseio/reactivesearch';
import { string } from 'prop-types';
import { mediaMax } from '@divyanshu013/media';
import { css } from 'react-emotion';
import { Card, Spin, Collapse, Button, Tooltip } from 'antd';
import strip from 'striptags';

import Suggestions from './Suggestions';
import { accapi } from '../constants';

const { Meta } = Card;
const { Panel } = Collapse;

const labelStyles = textColor => css`
    ul li > label > span {
        width: 80%;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
        color: ${textColor};
    }
`;

const cardStyles = ({ textColor, titleColor }) => css`
    .ant-card-meta-title {
        color: ${titleColor};
    }
    .ant-card-meta-description {
        color: ${textColor};
    }
`;

class Search extends Component {
    state = {
        preferences: null,
        theme: {},
        currency: '',
        toggleFilters: false,
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
            const { popularSearches } = await fetch(
                `${accapi}/analytics/${appname}/popularsearches`,
                {
                    headers: {
                        Authorization: `Basic ${btoa(credentials)}`,
                    },
                },
            ).then(res => res.json());
            this.setState({
                preferences: preferences.message.default,
                theme: preferences.message._theme,
                popularSearches,
                currency: preferences.message._store
                    ? preferences.message._store.currency
                    : '',
            });
        } catch (error) {
            // eslint-disable-next-line
            console.error(error);
        }
    }

    getMultiListProps = listComponentProps => {
        const { title, ...restProps } = listComponentProps;
        return restProps;
    };

    handleSmallScreen = () => {
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

    render() {
        const { appname, credentials } = this.props;
        const {
            preferences,
            theme,
            currency,
            toggleFilters,
            popularSearches,
        } = this.state;
        const isMobile = window.innerWidth < 768;
        if (!preferences) {
            return (
                <div css={{ display: 'flex', justifyContent: 'center' }}>
                    <Spin size="large" />
                </div>
            );
        }
        const { search, result } = preferences;
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
                    <Tooltip
                        placement="leftTop"
                        title={toggleFilters ? 'Show Results' : 'Show Filters'}
                    >
                        <Button
                            type="primary"
                            shape="circle"
                            icon={toggleFilters ? 'close' : 'filter'}
                            onClick={this.handleSmallScreen}
                            css={{
                                display: 'none',
                                position: 'fixed',
                                bottom: '20px',
                                right: '20px',
                                zIndex: 2,
                                [mediaMax.medium]: { display: 'inline' },
                            }}
                        />
                    </Tooltip>
                ) : null}

                <div css={{ maxWidth: 1200, margin: '25px auto' }}>
                    <CategorySearch
                        componentId="search"
                        filterLabel="Search"
                        dataField={
                            ['title', 'body_html', 'vendor'] // TODO: add subfields to improve search results
                        }
                        placeholder="Search for products..."
                        iconPosition="right"
                        css={{ marginBottom: 20 }}
                        renderSuggestions={({
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
                                    popularSearches={popularSearches}
                                />
                            )
                        }
                        {...search}
                        categoryField="product_type.keyword"
                    />
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
                                    'repeat(auto-fit, minmax(250px, 1fr))',
                                gridGap: 20,
                                alignSelf: 'start',
                                [mediaMax.medium]: {
                                    display: toggleFilters ? 'grid' : 'none',
                                    gridTemplateColumns: '1fr',
                                },
                            }}
                        >
                            {otherComponents.map(listComponent => (
                                <Collapse key={listComponent}>
                                    <Panel
                                        header={
                                            <span
                                                css={{
                                                    color:
                                                        theme.colors.titleColor,
                                                }}
                                            >
                                                {preferences[listComponent]
                                                    .title || 'Select Item'}
                                            </span>
                                        }
                                        css={this.getFontFamily()}
                                    >
                                        <MultiList
                                            key={listComponent}
                                            componentId={listComponent}
                                            {...this.getMultiListProps(
                                                preferences[listComponent],
                                            )}
                                            className={labelStyles(
                                                theme.colors.textColor,
                                            )}
                                            dataField={`${
                                                preferences[listComponent]
                                                    .dataField
                                            }.keyword`}
                                            css={this.getFontFamily()}
                                        />
                                    </Panel>
                                </Collapse>
                            ))}
                        </div>

                        <div>
                            <SelectedFilters />
                            <ReactiveList
                                componentId="results"
                                dataField="title"
                                onData={(
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
                                        href={`products/${handle}`}
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
                                            css={this.getFontFamily()}
                                        >
                                            <Meta
                                                title={title}
                                                className={cardStyles({
                                                    ...theme.colors,
                                                })}
                                                description={strip(body_html)}
                                            />
                                            <div
                                                css={{
                                                    fontWeight: 500,
                                                    fontSize: '1.1rem',
                                                    marginTop: 10,
                                                    color:
                                                        theme.colors.titleColor,
                                                }}
                                            >
                                                {variants &&
                                                    `${currency} ${
                                                        variants[0].price
                                                    }`}
                                            </div>
                                        </Card>
                                    </a>
                                )}
                                react={{ and: ['search', ...otherComponents] }}
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
                                    pagination: css({
                                        [mediaMax.medium]: {
                                            display: toggleFilters
                                                ? 'none'
                                                : 'block',
                                        },
                                    }),
                                }}
                                {...result}
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
