import React, { Component, Fragment } from 'react';
import { css } from 'react-emotion';
import { Button, Modal, Icon } from 'antd';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import get from 'lodash.get';
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
    top: 0 !important;
    height: 100vh;
    padding-bottom: 0 !important;
    overflow-y: scroll;
    .ant-modal {
        top: 0;
    }
    .ant-modal-content {
        border-radius: 0;
        min-height: 100%;
    }
    @media (max-width: 767px) {
        margin: 0 !important;
    }
`;

const getButtonClass = theme => {
    const primaryColor = get(theme, 'colors.primaryColor', '') || '#0B6AFF';
    const styles = {
        button: {
            borderColor: `${primaryColor} !important`,
            backgroundColor: 'transparent !important',
            marginLeft: '3px',
            marginRight: '3px',
            alignItems: 'center',
            display: 'flex !important',
            transition: 'all ease 0.2s',
            borderRadius: '50px',
            overflow: 'hidden',
            boxShadow: `0 0 0 2px ${primaryColor}1a`,
            '&:hover': {
                '& .text-container': { marginLeft: 5, width: '100%' },
            },
            '& .text-container': {
                display: 'inline-flex',
                width: '0px',
                overflow: 'hidden',
                transition: 'all ease 0.2s',
            },
            img: { width: 40 },
        },
    };

    return css({ ...styles.button, ...buttonStyle });
};

const getIconClass = theme => {
    const primaryColor = get(theme, 'colors.primaryColor', '') || '#0B6AFF';
    return css({
        color: `${primaryColor} !important`,
        ...iconStyle,
    });
};

const getTextClass = theme => {
    const primaryColor = get(theme, 'colors.primaryColor', '') || '#0B6AFF';
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
            searchButton: {},
            preferences: null,
        };
    }

    async componentDidMount() {
        if (appname && credentials) {
            try {
                const preferences = await getPreferences(appname, credentials);
                this.setState({
                    theme: get(preferences, 'message._theme', {}),
                    searchButton: get(preferences, 'message.searchButton', {}),
                    preferences,
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
        const { isOpen, theme, searchButton, preferences } = this.state;
        const { openWithModal, disableSearchText } = this.props;
        const isValid = appname && credentials;
        const isOpenWithModal = Boolean(openWithModal);
        const isSearchTextHidden = Boolean(disableSearchText);

        let fontFamilyLink = '';
        const fontFamily = get(theme, 'typography.fontFamily');
        if (fontFamily && fontFamily !== 'default') {
            const parsedFontFamily = fontFamily.split(' ').join('+');
            fontFamilyLink = (
                <link
                    href={`https://fonts.googleapis.com/css?family=${parsedFontFamily}`}
                    rel="stylesheet"
                />
            );
        }
        if (isOpenWithModal) {
            return <Search appname={appname} credentials={credentials} />;
        }
        return (
            <Fragment>
                {fontFamilyLink ? <Helmet>{fontFamilyLink}</Helmet> : null}
                {preferences ? (
                    <Button
                        css={getButtonClass(theme)}
                        onClick={this.toggleModal}
                    >
                        <div className="icon-container">
                            {searchButton.searchIcon ? (
                                <img
                                    src={searchButton.searchIcon}
                                    alt="Search Icon"
                                />
                            ) : (
                                <Icon
                                    className={getIconClass(theme)}
                                    type="search"
                                />
                            )}
                        </div>
                        {isSearchTextHidden ? null : (
                            <div
                                className={`text-container ${getTextClass(
                                    theme,
                                )}`}
                            >
                                {searchButton.searchText ||
                                    'Click here to Search'}
                            </div>
                        )}
                    </Button>
                ) : null}
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
    disableSearchText: 'false',
    isOpen: 'false', // if true, then modal will be in open state
};
App.propTypes = {
    openWithModal: PropTypes.string,
    disableSearchText: PropTypes.string,
    isOpen: PropTypes.string,
};
export default App;
