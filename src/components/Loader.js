import React from 'react';
import { css } from 'react-emotion';

const styles = css`
    width: 100%;
    top: 50%;
    left: 50%;
    position: absolute;
    transform: translate(-50%, -50%);
    display: flex;
    align-items: center;
    justify-content: center;
`;

const Loader = ({ size }) => (
    <div className={styles}>
        <img width={size || 50} src="/images/loader.svg" alt="loading" />
    </div>
);

export default Loader;
