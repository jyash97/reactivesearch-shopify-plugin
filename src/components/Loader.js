import React from 'react';
import PropTypes from 'prop-types';
import { css } from 'react-emotion';

const styles = css`
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 300px;
`;

const Loader = ({ size }) => (
    <div className={styles}>
        <img width={size || 50} src="/images/loader.svg" alt="loading" />
    </div>
);

Loader.propTypes = {
    size: PropTypes.number,
};

export default Loader;
