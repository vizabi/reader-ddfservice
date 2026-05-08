# Vizabi DDF Service Reader

Client-side middleware that connects a [Vizabi](https://github.com/vizabi/vizabi) visualization to a [small-waffle](https://github.com/Gapminder/small-waffle) backend. Takes DDFQL queries from Vizabi, encodes them as URL parameters using [urlon](https://github.com/cerebral/urlon), hits the API, and converts the `{header, rows}` response back into an array of objects with parsed time values.

Shipped as a pre-built UMD bundle (`dist/reader-ddfservice.js`) for use as a `<script>` tag in tools-page.

## Usage in tools-page

```html
<script src="reader-ddfservice.js"></script>
```

```js
Vizabi.stores.dataSources.createAndAddType("ddfbw", DDFServiceReader.getReader());
```

Vizabi then calls `init(config)` and `read(query)` automatically when a data source is defined:

```js
const data = {
  modelType: "ddfbw",
  dataset: "open-numbers/ddf--gapminder--systema_globalis",
  branch: "master"
};
```

## Config options (`init`)

| Option | Default | Description |
|--------|---------|-------------|
| `dataset` | _(required)_ | Dataset slug, e.g. `open-numbers/ddf--gapminder--systema_globalis` |
| `url` | `https://small-waffle.gapminder.org` | Backend base URL |
| `apiVersion` | `v3` | API version prefix |
| `branch` | — | Git branch |
| `commit` | — | Git commit (short or full). Updated automatically from responses. |
| `authToken` | — | Bearer token sent as `Authorization` header |
| `permalinkToken` | — | Sent as `x-share-token` header |
| `parsers` | — | Override or extend the built-in time parsers |

## Usage without Vizabi

```js
import { getReader } from '@vizabi/reader-ddfservice';

const reader = getReader();
reader.init({
  dataset: 'open-numbers/ddf--gapminder--systema_globalis',
  branch: 'master'
});

const rows = await reader.read({
  select: { key: ['geo', 'time'], value: ['sg_gdi_pcap'] },
  from: 'datapoints',
  where: { geo: { $in: ['swe', 'nor'] } }
});
console.log(rows); // [{geo: 'swe', time: Date, sg_gdi_pcap: 42}, ...]
```

## Development

```bash
npm test       # run unit tests (node, no extra deps)
npm run build  # bundle → dist/reader-ddfservice.js
```

Tests cover endpoint building, urlon v3 query encoding, and all time parsers (`year`, `month`, `day`, `quarter`, `week`, `time`).