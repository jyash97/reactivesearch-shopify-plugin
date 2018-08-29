import React from 'react';
import {
    ReactiveBase,
    DataSearch,
    MultiList,
    ReactiveList,
} from '@appbaseio/reactivesearch';
import { string } from 'prop-types';
import { mediaMax } from '@divyanshu013/media';
import { css } from 'react-emotion';

const Search = ({ appname, credentials, appid }) => (
    <ReactiveBase app={appname} credentials={credentials}>
        <div css={{ maxWidth: 1000, margin: '25px auto' }}>
            <DataSearch
                componentId="q"
                filterLabel="Search"
                dataField={['title', 'body_html', 'vendor']}
                placeholder="Search for products..."
                iconPosition="right"
            />
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
                }) => <div key={_id}>{title}</div>}
                react={{
                    and: [
                        'q',
                        'category',
                        'vendor',
                        'tags',
                        'collectionId',
                        'price',
                    ],
                }}
                pagination
                size={12}
                innerClass={{
                    list: css({
                        display: 'grid',
                        gridTemplateColumns:
                            'repeat(auto-fit, minmax(300px, 1fr))',
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
                        borderBottom: '1px solid #f0f0f0',
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
    </ReactiveBase>
);

Search.propTypes = {
    appname: string.isRequired,
    credentials: string.isRequired,
    appid: string.isRequired,
};

export default Search;
