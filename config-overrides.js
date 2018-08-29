const { injectBabelPlugin } = require('react-app-rewired');

module.exports = function override(config, env) {
    // remove chunkhash
    config.output.filename = 'static/js/[name].js';
    config.plugins[4].filename = 'static/css/[name].css';
    config = injectBabelPlugin(
        [
            'import',
            { libraryName: 'antd', libraryDirectory: 'es', style: 'css' },
        ],
        config,
    );
    config = injectBabelPlugin(
        [
            'direct-import',
            [
                '@appbaseio/reactivesearch',
                {
                    name: '@appbaseio/reactivesearch',
                    indexFile: '@appbaseio/reactivesearch/lib/index.es.js',
                },
            ],
        ],
        config,
    );
    config = injectBabelPlugin('emotion', config);
    return config;
};
