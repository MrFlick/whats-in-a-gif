/* eslint-disable no-restricted-globals */
/* global GifReader */

// worker thread used to decode file
// mostly just forwards message to GifReader

self.requestFileSystemSync = self.webkitRequestFileSystemSync
    || self.requestFileSystemSync;

self.importScripts('data_helpers.js');
self.importScripts('gif_reader.js');

const gifReader = new GifReader();

const handlers = {
    setfile: ({ file = null }) => gifReader.setFile(file),
    toc: () => gifReader.getToc(),
    bytes: ({ offset = 0, length = 10 }) => gifReader.getBytes(offset, length),
    hello: () => ({ greeting: 'hello' }),
};

self.addEventListener('message', (e) => {
    const { data: { _id, cmd, data } } = e;

    const handler = handlers[cmd];
    if (handler) {
        try {
            const resp = handler(data);
            postMessage({ resp, _id });
        } catch (err) {
            const error = err.message;
            postMessage({ error, _id });
        }
    } else {
        const error = `Unknown command '${cmd}'`;
        postMessage({ error, _id });
    }
}, false);
