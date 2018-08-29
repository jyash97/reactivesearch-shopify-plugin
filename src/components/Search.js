import React from 'react';
import {
    ReactiveBase,
    DataSearch,
    MultiList,
    ReactiveList,
    SelectedFilters,
    DynamicRangeSlider,
} from '@appbaseio/reactivesearch';
import { string } from 'prop-types';
import { mediaMax } from '@divyanshu013/media';
import { css } from 'react-emotion';
import { Card } from 'antd';

const { Meta } = Card;

const Search = ({ appname, credentials, appid }) => (
    <ReactiveBase app={appname} credentials={credentials}>
        <div css={{ maxWidth: 1200, margin: '25px auto' }}>
            <DataSearch
                componentId="q"
                filterLabel="Search"
                dataField={['title', 'body_html', 'vendor']}
                placeholder="Search for products..."
                iconPosition="right"
                css={{ marginBottom: 20 }}
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
                    <MultiList
                        dataField="product_type.keyword"
                        componentId="category"
                        showSearch={false}
                        title="Categories"
                        filterLabel="Categories"
                        react={{
                            and: ['q'],
                        }}
                    />
                    <MultiList
                        dataField="vendor.keyword"
                        componentId="vendor"
                        showSearch={false}
                        title="Vendor"
                        filterLabel="Vendor"
                        react={{
                            and: ['q'],
                        }}
                    />
                    <DynamicRangeSlider
                        dataField="variants.price"
                        componentId="price"
                        title="Price"
                        rangeLabels={(start, end) => ({
                            start,
                            end,
                        })}
                        interval={500}
                    />
                    <MultiList
                        dataField="tags.keyword"
                        componentId="tags"
                        showSearch={false}
                        title="Tags"
                        filterLabel="Tags"
                        react={{
                            and: ['q'],
                        }}
                    />
                </div>
                <div>
                    <SelectedFilters />
                    <ReactiveList
                        componentId="results"
                        dataField="title.keyword"
                        // defaultQuery={this.defaultQuery}
                        onData={({
                            _id,
                            title,
                            body_html,
                            handle,
                            image: { src },
                            variants,
                        }) => (
                            <a href={`products/${handle}`}>
                                <Card
                                    key={_id}
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
                            and: ['q', 'category', 'vendor', 'price', 'tags'],
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
                    />
                </div>
            </div>
        </div>
    </ReactiveBase>
);

Search.propTypes = {
    appname: string.isRequired,
    credentials: string.isRequired,
    appid: string.isRequired,
};

export default Search;
