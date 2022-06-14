
**NOTICE: This project is still in very early alpha development.**

## Features

- Entire application runs in a single container
	- No database needed, just a volume for file storage
- Control panel API / UI for managing the site
	- Served on a separate port from the main web UI so you don't have to expose it to the internet if you don't want to
	- Can enable a [Swagger](https://swagger.io/) documentation page for control panel API at `/api/docs`
- Publish several different kinds of content, including:
  - Posts (normal, structured article / blog post format)
  - Comments ( / replies / responses / reactions to some referenced content)
  - Notes (unstructured blobs, more like micro-blogging)
  - Events
  - RSVPs
- Write posts using [GitHub Flavored Markdown](https://github.github.com/gfm/)
	- Also includes support for:
		- Code-block syntax highlighting with [Prism](https://prismjs.com/) for [more than 200 languages](https://prismjs.com/#supported-languages)
		- Rendering math expressions with [KaTeX](https://katex.org/)
    - Rendering diagrams with [nomnoml](https://www.nomnoml.com/)
    - Rendering bytefield diagrams with [bytefield-svg](https://bytefield-svg.deepsymmetry.org/bytefield-svg)
    <!-- - Rendering graphs and charts with [Vega](https://vega.github.io/vega) -->
    <!-- - Rendering waveform diagrams with [wavedrom](https://www.npmjs.com/package/wavedrom) -->
    - Rendering diagrams with [Pikchr](https://pikchr.org/home/doc/trunk/homepage.md)
    - Rendering railroad diagrams with [@prantlf/railroad-diagrams](https://github.com/prantlf/railroad-diagrams)
    - A handful of additional extensions, including highlights/marks, note blocks, description lists, and footnotes
- Produces multiple standard feed / metadata formats by default:
	- [RSS](https://www.rssboard.org/rss-specification)
	- [JSON Feed](https://www.jsonfeed.org/)
	- [`h-feed`](https://microformats.org/wiki/h-feed) / [h-event](https://microformats.org/wiki/h-event) Microformats
	- [JF2 Feed](https://jf2.spec.indieweb.org/)
  - [Open Graph protocol](https://ogp.me/)
  - [iCalendar](https://datatracker.ietf.org/doc/html/rfc5545) (for Events)
- Produces standard [sitemap.xml](https://www.sitemaps.org/protocol.html)
- Light / dark mode toggle (defaulting to system preference)
- Easily edit and swap between color themes in the control panel
- Full-text search on content powered by [minisearch](https://github.com/lucaong/minisearch)
  - `<link>` for [OpenSearch](https://github.com/dewitt/opensearch/blob/master/opensearch-1-1-draft-6.md) discovery

### Roadmap Features

- Automatic syndication to multiple 3rd parties
- Send and receive interactions in multiple standard formats (with moderation / spam blocking features):
	- [Pingbacks](https://www.hixie.ch/specs/pingback/pingback)
	- [WebMentions](https://www.w3.org/TR/webmention) (with support for [vouches](https://indieweb.org/Vouch))
- HTTPS termination in the server itself

## Building from source

### To run locally (i.e. for development)

The [start.sh](./start.sh) file contains all of the environment variables to configure the server.

The default configuration will create a `./data` directory in the project to store the sqlite database files for app storage.

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
# Build for linux/arm64 platform (tagged as "minimal-blog:arm64")
$ npm run docker:arm64

# Build for linux/amd64 platform (tagged as "minimal-blog:amd64")
$ npm run docker:amd64
```
