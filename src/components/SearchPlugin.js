import React, { Component, Fragment } from 'react';
import { css } from 'react-emotion';
import { Button, Modal, Icon } from 'antd';
import PropTypes from 'prop-types';
import { getPreferences } from '../utils';

import Search from './Search';

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
    const styles = {
        button: {
            borderColor: `${primaryColor} !important`,
            backgroundColor: 'transparent !important',
            marginLeft: '3px',
            marginRight: '3px',
            alignItems: 'center',
            display: 'flex',
            justifyContent: 'space-between',
            width: '44px',
            borderRadius: '50px',
            overflow: 'hidden',
            boxShadow: `0 0 0 2px ${primaryColor}1a`,
            '&:hover': {
                width: '182px',
                '& span': { opacity: 1 },
            },
            '& span': { opacity: 0 },
        },
    };

    return css({ ...styles.button, ...buttonStyle });
};

const getIconClass = theme => {
    const primaryColor = theme && theme.colors && theme.colors.primaryColor;
    return css({
        color: `${primaryColor} !important`,
        ...iconStyle,
    });
};

const getTextClass = theme => {
    const primaryColor = theme && theme.colors && theme.colors.primaryColor;
    return css({
        color: `${primaryColor} !important`,
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
                <Button css={getButtonClass(theme)} onClick={this.toggleModal}>
                    <Icon className={getIconClass(theme)} type="search" />
                    <span className={getTextClass(theme)}>
                        Click here to Search
                    </span>
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
