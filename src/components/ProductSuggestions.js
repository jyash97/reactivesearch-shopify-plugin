import React from 'react';
import { Card, Spin, Button, Icon } from 'antd';
import Truncate from 'react-truncate';
import strip from 'striptags';
import { css } from 'react-emotion';
import { mediaMax } from '@divyanshu013/media';
import { ReactiveBase, ReactiveList } from '@appbaseio/reactivesearch';
import { getPreferences } from '../utils';

const appname = window.APPNAME;
const credentials = window.CREDENTIALS;

const maxProductSize = 5;

const { Meta } = Card;

const buttonLeft = css({
    [mediaMax.small]: {
        padding: 0,
    },
    position: 'absolute',
    zIndex: 10,
    top: 0,
    marginTop: 100,
    left: 0,
    border: 'none',
    boxShadow: 'none',
    background: 'transparent !important',
});
const buttonRight = css({
    position: 'absolute',
    zIndex: 10,
    top: 0,
    marginTop: 100,
    right: 0,
    border: 'none',
    boxShadow: 'none',
    background: 'transparent !important',
    [mediaMax.small]: {
        padding: 0,
    },
});

const icon = css({
    fontSize: 32,
    [mediaMax.small]: {
        fontSize: 25,
    },
});

if (!appname) {
    console.warn('APPNAME not available'); // eslint-disable-line
}
if (!credentials) {
    console.warn('CREDENTIALS not available'); // eslint-disable-line
}

class ProductSuggestions extends React.Component {
    state = {
        preferences: null,
        theme: {},
        currency: '',
        currentPage: 1,
        maxSize: maxProductSize,
    };

    componentWillMount() {
        this.updateMaxSize();
    }

    async componentDidMount() {
        window.addEventListener('resize', this.updateMaxSize);
        if (appname && credentials) {
            try {
                const preferences = await getPreferences(appname, credentials);
                this.setState({
                    preferences: preferences.message.default,
                    theme: preferences.message._theme,
                    currency: preferences.message._store
                        ? preferences.message._store.currency
                        : '',
                });
            } catch (error) {
                // eslint-disable-next-line
                console.error(error);
            }
        }
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateMaxSize);
    }

    updateMaxSize = () => {
        if (window.innerWidth < 860) {
            this.setState({
                maxSize: 2,
            });
            return;
        }
        if (window.innerWidth < 1130) {
            this.setState({
                maxSize: 3,
            });
            return;
        }
        if (window.innerWidth < 1400) {
            this.setState({
                maxSize: 4,
            });
            return;
        }
        this.setState({
            maxSize: maxProductSize,
        });
    };

    nextPage = () => {
        this.setState(prevState => ({
            currentPage: prevState.currentPage + 1,
        }));
    };

    prevPage = () => {
        this.setState(prevState => ({
            currentPage: prevState.currentPage - 1,
        }));
    };

    render() {
        const {
            theme,
            currency,
            preferences,
            currentPage,
            maxSize,
        } = this.state;
        if (!preferences) {
            return (
                <div css={{ display: 'flex', justifyContent: 'center' }}>
                    <Spin size="large" />
                </div>
            );
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
                <div css={{ margin: '25px auto', position: 'relative' }}>
                    <ReactiveList
                        currentPage={currentPage}
                        onResultStats={total => {
                            this.total = total;
                        }}
                        onAllData={(
                            results,
                            streamResults,
                            loadMoreData,
                            { triggerClickAnalytics, base },
                        ) => {
                            let filteredResults = results;

                            if (streamResults.length) {
                                const ids = streamResults.map(item => item._id);
                                filteredResults = filteredResults.filter(
                                    item => !ids.includes(item._id),
                                );
                            }
                            const resultsCalc = [
                                ...filteredResults,
                                ...streamResults,
                            ];
                            return (
                                <div
                                    className={css({
                                        display: 'flex',
                                        justifyContent: 'center',
                                    })}
                                >
                                    <Button
                                        disabled={currentPage === 0}
                                        className={buttonLeft}
                                        onClick={this.prevPage}
                                    >
                                        <Icon className={icon} type="left" />
                                    </Button>
                                    {resultsCalc.map(
                                        (
                                            {
                                                handle,
                                                _id,
                                                image,
                                                title,
                                                body_html,
                                                variants,
                                            },
                                            index,
                                        ) => (
                                            <a
                                                onClick={() => {
                                                    triggerClickAnalytics(
                                                        base + index,
                                                    );
                                                }}
                                                href={`products/${handle}`}
                                                target="_blank"
                                                rel="noreferrer noopener"
                                                key={_id}
                                                className={css({
                                                    minWidth: 240,
                                                    maxWidth: 250,
                                                    margin: 8,
                                                    padding: 10,
                                                    [mediaMax.small]: {
                                                        minWidth: 150,
                                                        maxWidth: 170,
                                                        margin: 3,
                                                        padding: 3,
                                                    },
                                                    [mediaMax.xsmall]: {
                                                        minWidth: 100,
                                                        maxWidth: 140,
                                                        margin: 3,
                                                        padding: 3,
                                                    },
                                                })}
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
                                                >
                                                    <Meta
                                                        title={title}
                                                        description={
                                                            <Truncate
                                                                lines={3}
                                                                ellipsis={
                                                                    <span>
                                                                        ...{' '}
                                                                    </span>
                                                                }
                                                            >
                                                                {strip(
                                                                    body_html,
                                                                )}
                                                            </Truncate>
                                                        }
                                                    />
                                                    <div
                                                        css={{
                                                            fontWeight: 500,
                                                            fontSize: '1.1rem',
                                                            marginTop: 10,
                                                        }}
                                                    >
                                                        {variants &&
                                                            `${currency} ${
                                                                variants[0]
                                                                    .price
                                                            }`}
                                                    </div>
                                                </Card>
                                            </a>
                                        ),
                                    )}
                                    <Button
                                        disabled={
                                            this.total <= currentPage * maxSize
                                        }
                                        className={buttonRight}
                                        onClick={this.nextPage}
                                    >
                                        <Icon className={icon} type="right" />
                                    </Button>
                                </div>
                            );
                        }}
                        componentId="results"
                        dataField="title"
                        react={{
                            and: ['search', ...otherComponents],
                        }}
                        innerClass={{
                            list: css({
                                display: 'grid',
                                gridTemplateColumns:
                                    'repeat(auto-fit, minmax(250px, 1fr))',
                                gridGap: 10,
                                [mediaMax.medium]: {
                                    gridTemplateColumns:
                                        'repeat(auto-fit, minmax(200px, 1fr))',
                                },
                                [mediaMax.small]: {
                                    gridTemplateColumns:
                                        'repeat(auto-fit, minmax(150px, 1fr))',
                                },
                            }),
                            pagination: css({
                                display: 'none',
                            }),
                            noResults: css({
                                display: 'flex',
                                justifyContent: 'center',
                                padding: '25px 0',
                            }),
                            resultsInfo: css({
                                display: 'none',
                            }),
                        }}
                        {...result}
                        size={maxSize} // default 5
                    />
                </div>
            </ReactiveBase>
        );
    }
}
export default ProductSuggestions;
