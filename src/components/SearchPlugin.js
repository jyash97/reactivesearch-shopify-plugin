import React, { Component, Fragment } from 'react';
import { css } from 'react-emotion';
import { Button, Modal, Icon } from 'antd';
import PropTypes from 'prop-types';
import { getPreferences } from '../utils';

import Search from './Search';

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

const modalStyles = css`
    top: 0;
    height: 100vh;
    @media (max-width: 768px) {
        margin: 0;
    }
`;

const getButtonClass = theme => {
    const primaryColor = theme && theme.colors && theme.colors.primaryColor;
    return css({
        borderColor: `${primaryColor} !important`,
        backgroundColor: 'transparent !important',
        marginLeft: 3,
        marginRight: 3,
        ...buttonStyle,
    });
};
const getIconClass = theme => {
    const primaryColor = theme && theme.colors && theme.colors.primaryColor;
    return css({
        color: `${primaryColor} !important`,
        ...iconStyle,
    });
};
class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: Boolean(props.isOpen),
            theme: {},
        };
    }

    async componentDidMount() {
        if (appname && credentials) {
            try {
                const preferences = await getPreferences(appname, credentials);
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
        const { openWithModal } = this.props;
        const isValid = appname && credentials;
        const isOpenWithModal = Boolean(openWithModal);
        if (isOpenWithModal) {
            return <Search appname={appname} credentials={credentials} />;
        }
        return (
            <Fragment>
                <Button
                    className={getButtonClass(theme)}
                    shape="circle"
                    onClick={this.toggleModal}
                >
                    <Icon className={getIconClass(theme)} type="search" />
                </Button>
                {isValid && isOpen && (
                    <Modal
                        visible={isOpen}
                        onCancel={this.toggleModal}
                        footer={null}
                        width="100%"
                        className={modalStyles}
                    >
                        <Search appname={appname} credentials={credentials} />
                    </Modal>
                )}
            </Fragment>
        );
    }
}
App.defaultProps = {
    openWithModal: 'true',
    isOpen: 'false', // if true, then modal will be in open state
};
App.propTypes = {
    openWithModal: PropTypes.string,
    isOpen: PropTypes.string,
};
export default App;
