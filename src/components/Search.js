import React, { Component } from 'react';
import {
    ReactiveBase,
    DataSearch,
    MultiList,
    ReactiveList,
    SelectedFilters,
} from '@appbaseio/reactivesearch';
import { string } from 'prop-types';
import { mediaMax } from '@divyanshu013/media';
import { css } from 'react-emotion';
import { Card, Spin } from 'antd';

import { accapi } from '../constants';

const { Meta } = Card;

class Search extends Component {
    state = {
        preferences: null,
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
            this.setState({ preferences: preferences.message.default });
        } catch (error) {
            // eslint-disable-next-line
            console.error(error);
        }
    }

    render() {
        const { appname, credentials } = this.props;
        const { preferences } = this.state;
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
            <ReactiveBase app={appname} credentials={credentials}>
                <div css={{ maxWidth: 1200, margin: '25px auto' }}>
                    <DataSearch
                        componentId="search"
                        filterLabel="Search"
                        dataField={['title', 'body_html', 'vendor']}
                        placeholder="Search for products..."
                        iconPosition="right"
                        css={{ marginBottom: 20 }}
                        {...search}
                    />
                    <div
                        css={{
                            display: 'grid',
                            gridTemplateColumns: '300px 1fr',
                            [mediaMax.medium]: {
                                gridTemplateColumns: '1fr',
                            },
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
                            }}
                        >
                            {otherComponents.map(listComponent => (
                                <MultiList
                                    key={listComponent}
                                    {...preferences['list-2']}
                                />
                            ))}
                        </div>
                        <div>
                            <SelectedFilters />
                            <ReactiveList
                                componentId="results"
                                dataField="title"
                                onData={({
                                    _id,
                                    title,
                                    body_html,
                                    handle,
                                    image: { src },
                                    variants,
                                }) => (
                                    <a href={`products/${handle}`} key={_id}>
                                        <Card
                                            hoverable
                                            bordered={false}
                                            cover={
                                                <img
                                                    src={src}
                                                    width="100%"
                                                    alt={title}
                                                />
                                            }
                                        >
                                            <Meta
                                                title={title}
                                                description={body_html}
                                            />
                                            <div
                                                css={{
                                                    fontWeight: 500,
                                                    fontSize: '1.1rem',
                                                    marginTop: 10,
                                                }}
                                            >
                                                {variants && variants[0].price}
                                            </div>
                                        </Card>
                                    </a>
                                )}
                                react={{
                                    and: ['search', ...otherComponents],
                                }}
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
                                    }),
                                    poweredBy: css({
                                        margin: 15,
                                    }),
                                    noResults: css({
                                        display: 'flex',
                                        justifyContent: 'center',
                                        padding: '25px 0',
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