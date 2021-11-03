# whats-in-a-gif
Guide to understanding the GIF file format

These are the source files for the guide that resides at

    http://matthewflickinger.com/lab/whatsinagif/

The article was originally written in February 2005. Over time,
errors have been corrected and new examples have been added.

This guide breaks down the GIF file format and LZW based compression.
The contents of each byte should be fully described. There are now
interactive tools to hopefully make everything more clear. Note that
the javascript tools to encode and decode GIF files in the browser
are mainly for educational purposes. The may not be robust or efficient
enough for practical uses. However, they can be a useful reference if 
you are writing code in other languages.

Note the files have a .asp extension for historical reasons.
They should be all plain HTML files. In order to make it easier
to preview the pages, I've included a python script to serve
the ASP pages with the proper MIME type.

    python ./devserver.py

## Linting

In an effort to keep the javascript code consistent despite being
written at very different times, the `.eslintrc.js` lists
the enforced rules. You can install `eslint` with `npm`.

    npm i -D eslint eslint-config-airbnb-base eslint-plugin-import