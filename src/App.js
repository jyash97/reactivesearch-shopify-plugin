import React, { Component, Fragment } from 'react';
import { css } from 'react-emotion';
import { Helmet } from 'react-helmet';
import { Button, Modal, Icon } from 'antd';
import { accapi } from './constants';

import Search from './components/Search';

window.APPNAME = 'shopify-plugin-myplugin';
window.CREDENTIALS = 'MFyWfzzW3:00e6fd64-dad7-4290-80e8-4e883f3d7e06';
const appname = window.APPNAME;
const credentials = window.CREDENTIALS;
const buttonStyle = window.REACTIVESEARCH_SEARCH_BUTTON_STYLE;
const iconStyle = window.REACTIVESEARCH_SEARCH_ICON_STYLE;

// available from shopify store
if (!appname) {
    console.warn('APPNAME not available'); // eslint-disable-line
}
if (!credentials) {
    console.warn('CREDENTIALS not available'); // eslint-disable-line
}

const getButtonClass = theme => {
    const primaryColor = theme && theme.colors && theme.colors.primaryColor;
    return css({
        borderColor: primaryColor,
        ...buttonStyle,
    });
};
const getIconClass = theme => {
    const primaryColor = theme && theme.colors && theme.colors.primaryColor;
    return css({
        color: primaryColor,
        ...iconStyle,
    });
};
class App extends Component {
    state = {
        isOpen: false,
        preferences: null,
        theme: {},
    };

    async componentDidMount() {
        if (appname && credentials) {
            try {
                const preferences = await fetch(
                    `${accapi}/app/${appname}/preferences`,
                    {
                        headers: {
                            Authorization: `Basic ${btoa(credentials)}`,
                        },
                    },
                ).then(res => res.json());
                this.setState({
                    preferences: preferences.message.default,
                    theme: preferences.message._theme,
                });
            } catch (error) {
                // eslint-disable-next-line
                console.error(error);
            }
        }
    }

    toggleModal = () => {
        this.setState(({ isOpen }) => ({
            isOpen: !isOpen,
        }));
    };

    render() {
        const { isOpen, theme } = this.state;
        const isValid = appname && credentials;
        let fontFamilyLink = '';
        if (
            theme.typography &&
            theme.typography.fontFamily &&
            theme.typography.fontFamily !== 'default'
        ) {
            const parsedFontFamily = theme.typography.fontFamily
                .split(' ')
                .join('+');
            fontFamilyLink = (
                <link
                    href={`https://fonts.googleapis.com/css?family=${parsedFontFamily}`}
                    rel="stylesheet"
                />
            );
        }
        return (
            <Fragment>
                {fontFamilyLink ? <Helmet>{fontFamilyLink}</Helmet> : null}
                <Button
                    className={getButtonClass(theme)}
                    shape="circle"
                    onClick={this.toggleModal}
                >
                    <Icon className={getIconClass(theme)} type="search" />
                </Button>
                {isValid &&
                    isOpen && (
                        <Modal
                            visible={isOpen}
                            onCancel={this.toggleModal}
                            footer={null}
                            width="100%"
                            css={{ top: 0, height: '100vh' }}
                        >
                            <Search
                                appname={appname}
                                credentials={credentials}
                            />
                        </Modal>
                    )}
            </Fragment>
        );
    }
}

export default App;
