import React from 'react';
import strip from 'striptags';
import Truncate from 'react-truncate';
import { Card, Button, Icon } from 'antd';
import get from 'lodash.get';
import { cardStyles, cardTitleStyles } from './Search';

const { Meta } = Card;

const SuggestionCard = ({
    index,
    triggerAnalytics,
    clickId,
    handle,
    image,
    title,
    body_html,
    currency,
    variants,
    themeType,
    theme,
    ...props
}) => (
    <div {...props}>
        <a
            onClick={() => {
                triggerAnalytics(clickId);
            }}
            href={`/products/${handle}`}
        >
            <Card
                hoverable
                bordered={false}
                className={`${cardStyles({
                    ...theme.colors,
                })} card`}
                cover={
                    image && <img src={image.src} width="100%" alt={title} />
                }
                css={{
                    padding: themeType === 'minimal' ? '10px' : 0,
                }}
                bodyStyle={
                    themeType === 'minimal'
                        ? {
                              padding: '15px 10px 10px',
                          }
                        : {}
                }
            >
                <Meta
                    title={
                        <h3
                            className={cardTitleStyles(theme.colors)}
                            css={
                                themeType === 'minimal'
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
                        themeType === 'classic' && (
                            <Truncate lines={4} ellipsis={<span>...</span>}>
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
                                themeType === 'minimal'
                                    ? theme.colors.textColor
                                    : theme.colors.titleColor,
                        }}
                    >
                        {variants &&
                            `${currency} ${get(variants[0], 'price', '')}`}
                    </h3>
                </div>
                <Button type="primary" size="large" className="product-button">
                    <Icon type="eye" />
                    View Product
                </Button>
            </Card>
        </a>
    </div>
);

export default SuggestionCard;
