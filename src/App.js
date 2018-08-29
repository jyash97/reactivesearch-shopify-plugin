import React, { Component, Fragment } from 'react';
import { Button, Modal } from 'antd';

import Search from './components/Search';

// available from shopify store
if (!APPNAME) {
    console.warn('APPNAME not available'); // eslint-disable-line
}
if (!CREDENTIALS) {
    console.warn('CREDENTIALS not available'); // eslint-disable-line
}
if (!APPID) {
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
                                appname={APPNAME}
                                credentials={CREDENTIALS}
                                appid={APPID}
                            />
                        </Modal>
                    )}
            </Fragment>
        );
    }
}

export default App;
