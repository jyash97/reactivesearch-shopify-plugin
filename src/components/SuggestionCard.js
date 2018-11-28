import React from 'react';
import strip from 'striptags';
import Truncate from 'react-truncate';
import { Card } from 'antd';

const { Meta } = Card;

const SuggestionCard = ({
    index,
    triggerClickAnalytics,
    base,
    handle,
    image,
    title,
    body_html,
    currency,
    variants,
    ...props
}) => (
    <div {...props}>
        <a
            onClick={() => {
                triggerClickAnalytics(base + index);
            }}
            href={`products/${handle}`}
            target="_blank"
            rel="noreferrer noopener"
        >
            <Card
                style={{
                    margin: 8,
                }}
                hoverable
                bordered={false}
                cover={
                    image && <img src={image.src} width="100%" alt={title} />
                }
            >
                <Meta
                    title={title}
                    description={
                        <Truncate lines={3} ellipsis={<span>... </span>}>
                            {strip(body_html)}
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
                    {variants && `${currency} ${variants[0].price}`}
                </div>
            </Card>
        </a>
    </div>
);

export default SuggestionCard;
