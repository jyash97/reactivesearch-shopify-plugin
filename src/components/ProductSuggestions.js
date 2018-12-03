import React from 'react';
import { Spin, Button, Icon } from 'antd';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { css } from 'react-emotion';
import { mediaMax } from '@divyanshu013/media';
import { ReactiveBase, ReactiveList } from '@appbaseio/reactivesearch';
import SuggestionCard from './SuggestionCard';
import { getPreferences } from '../utils';

const appname = window.APPNAME;
const credentials = window.CREDENTIALS;

const maxProductSize = 5;

const buttonLeft = css({
    [mediaMax.small]: {
        padding: 0,
    },
    zIndex: 10,
    top: 0,
    marginTop: 100,
    left: 0,
});
const buttonRight = css({
    zIndex: 10,
    top: 0,
    marginTop: 100,
    right: 0,
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

const main = css`
    .ant-btn {
        border: none !important;
        box-shadow: none;
        background: transparent !important;
        position: absolute;
    }
`;

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
        // currentPage: 1,
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
        // this.setState(
        //     prevState => ({
        //         currentPage: prevState.currentPage + 1,
        //     }),
        //     () => {
        //         this.slick.slickNext();
        //     },
        // );
        this.slick.slickNext();
    };

    prevPage = () => {
        // this.setState(
        //     prevState => ({
        //         currentPage: prevState.currentPage - 1,
        //     }),
        //     () => {
        //         this.slick.slickPrev();
        //     },
        // );
        this.slick.slickPrev();
    };

    render() {
        const { theme, currency, preferences, maxSize } = this.state;
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
        const settings = {
            dots: false,
            infinite: false,
            speed: 500,
            slidesToShow: maxSize,
            slidesToScroll: maxSize,
            initialSlide: 0,
        };
        return (
            <ReactiveBase
                app={appname}
                credentials={credentials}
                theme={theme}
                analytics
            >
                <div css={{ margin: '25px auto', position: 'relative' }}>
                    <ReactiveList
                        // currentPage={currentPage}
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
                                <div css={main}>
                                    <Button
                                        className={buttonLeft}
                                        onClick={this.prevPage}
                                    >
                                        <Icon className={icon} type="left" />
                                    </Button>
                                    <div
                                        className={css({
                                            margin: '10px 50px',
                                            [mediaMax.small]: {
                                                margin: '10px 25px',
                                            },
                                        })}
                                    >
                                        <Slider
                                            ref={c => {
                                                this.slick = c;
                                            }}
                                            {...settings}
                                        >
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
                                                    <SuggestionCard
                                                        key={_id}
                                                        {...{
                                                            handle,
                                                            image,
                                                            title,
                                                            body_html,
                                                            variants,
                                                            currency,
                                                            index,
                                                            base,
                                                            triggerClickAnalytics,
                                                        }}
                                                        index={_id}
                                                    />
                                                ),
                                            )}
                                        </Slider>
                                    </div>

                                    <Button
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
                                padding: '100px 0',
                            }),
                            resultsInfo: css({
                                display: 'none',
                            }),
                        }}
                        {...result}
                        size={15}
                    />
                </div>
            </ReactiveBase>
        );
    }
}
export default ProductSuggestions;
