import React, { Component, Fragment } from 'react';
import { Button, Modal, Icon } from 'antd';
import { accapi } from './constants';

import Search from './components/Search';

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
    return {
        borderColor: primaryColor,
        ...buttonStyle,
    };
};
const getIconClass = theme => {
    const primaryColor = theme && theme.colors && theme.colors.primaryColor;
    return {
        color: primaryColor,
        ...iconStyle,
    };
};
class App extends Component {
    state = {
        isOpen: false,
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
        return (
            <Fragment>
                <Button
                    style={getButtonClass(theme)}
                    shape="circle"
                    onClick={this.toggleModal}
                >
                    <Icon style={getIconClass(theme)} type="search" />
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
