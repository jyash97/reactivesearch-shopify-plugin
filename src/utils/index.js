import { accapi } from '../constants';
// eslint-disable-next-line
export const getPreferences = (appname, credentials) => {
    return new Promise((resolve, reject) => {
        if (appname && credentials) {
            return fetch(`${accapi}/app/${appname}/preferences`, {
                headers: {
                    Authorization: `Basic ${btoa(credentials)}`,
                },
            })
                .then(res => res.json())
                .then(resolve)
                .catch(reject);
        }
        return reject(new Error('Credentials not available'));
    });
};
