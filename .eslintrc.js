module.exports = {
    parser: 'babel-eslint',
    plugins: ['react', 'prettier', 'jest'],
    env: {
        browser: true,
    },
    globals: {
        APPID: true,
        APPNAME: true,
        CREDENTIALS: true,
    },
    extends: [
        'airbnb',
        'plugin:prettier/recommended',
        'prettier/react',
        'prettier/standard',
        'plugin:jest/recommended',
    ],
    rules: {
        indent: 0,
        camelcase: 0,
        'no-underscore-dangle': 0,

        'prettier/prettier': 'error',

        'react/jsx-indent': 0,
        'react/jsx-indent-props': 0,
        'react/jsx-filename-extension': 0,
        'react/require-default-props': 0,
        'react/forbid-prop-types': 0,
    },
};
