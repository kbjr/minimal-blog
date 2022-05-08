
## Features

- Entire application runs in a single container
	- No database needed, just needs a volume for file storage
- Control panel API / UI (served on a separate port from the main web UI)
- Produces multiple standard feed formats:
	- [RSS](https://www.rssboard.org/rss-specification)
	- [Atom](https://datatracker.ietf.org/doc/html/rfc4287)
	- [JSON Feed](https://www.jsonfeed.org/)
	- [`h-feed` Microformat](https://microformats.org/wiki/h-feed)
- Produces standard [sitemap.xml](https://www.sitemaps.org/protocol.html)
- Customizable HTML with [mustache](https://mustache.github.io/) templates
- Light / dark mode toggle (defaulting to system preference)
- Customizable color themes
- Designed to support multiple storage backends (currently only one available)
	- [SQLite3](https://www.sqlite.org/index.html) (Default)
- Code syntax highlighting with [Prism](https://prismjs.com/)



## Building from source

### To run locally (i.e. for development)

The [start.sh](./start.sh) file contains all of the environment variables to configure the server.

The default configuration will create a `./data` directory in the project to store the sqlite database files for app storage. To reset the server settings (and to reload `./assets` files from disk), delete the `./data/settings.db` file.

```bash
# Install dependencies
$ npm install

# Build the source
$ npm run build

# Run the server
$ npm start
```

### To build a docker image

```bash
# Build for linux/arm64 platform (tagged as "blog:arm64")
$ npm run docker:arm64

# Build for linux/amd64 platform (tagged as "blog:amd64")
$ npm run docker:amd64
```
