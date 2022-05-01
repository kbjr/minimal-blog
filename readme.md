
## Features

- Produces multiple standard feed formats:
	- [RSS](https://www.rssboard.org/rss-specification)
	- [Atom](https://datatracker.ietf.org/doc/html/rfc4287)
	- [JSON Feed](https://www.jsonfeed.org/)
	- [`h-feed` Microformat](https://microformats.org/wiki/h-feed)



## Building from source

### To run locally (i.e. for development)

The [start.sh](./start.sh) file contains all of the environment variables to configure the server.

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
