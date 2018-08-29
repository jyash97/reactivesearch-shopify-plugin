import React, { Component, Fragment } from 'react';
import { Button, Modal } from 'antd';

import Search from './components/Search';

const appname = window.APPNAME;
const credentials = window.CREDENTIALS;
const appid = window.APPID;

// available from shopify store
if (!appname) {
    console.warn('APPNAME not available'); // eslint-disable-line
}
if (!credentials) {
    console.warn('CREDENTIALS not available'); // eslint-disable-line
}
if (!appid) {
    console.warn('APPID not available'); // eslint-disable-line
}

class App extends Component {
    state = {
        isOpen: false,
    };

    toggleModal = () => {
        this.setState(({ isOpen }) => ({
            isOpen: !isOpen,
        }));
    };

    render() {
        const { isOpen } = this.state;
        const isValid = APPNAME && CREDENTIALS && APPID;
        return (
            <Fragment>
                <Button
                    shape="circle"
                    icon="search"
                    onClick={this.toggleModal}
                />
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
                                appid={appid}
                            />
                        </Modal>
                    )}
            </Fragment>
        );
    }
}

export default App;
