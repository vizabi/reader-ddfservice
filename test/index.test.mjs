import assert from 'node:assert/strict';
import { getReader } from '../src/index.js';

// ─── helpers ──────────────────────────────────────────────────────────────────

function makeReader(config = {}) {
  const reader = getReader();
  reader.init({ dataset: '_dummy', ...config });
  return reader;
}

function utc(y, m = 1, d = 1) {
  return new Date(Date.UTC(y, m - 1, d));
}

// ─── init / endpoint building ─────────────────────────────────────────────────

assert.equal(
  makeReader().getEndpoint(),
  'https://small-waffle.gapminder.org/v3/_dummy',
  'default endpoint: url + v3 + dataset'
);

assert.equal(
  makeReader({ branch: 'master' }).getEndpoint(),
  'https://small-waffle.gapminder.org/v3/_dummy/master',
  'endpoint with branch'
);

assert.equal(
  makeReader({ branch: 'master', commit: 'abc1234' }).getEndpoint(),
  'https://small-waffle.gapminder.org/v3/_dummy/master/abc1234',
  'endpoint with branch + commit'
);

assert.equal(
  makeReader({ url: 'https://custom.example.com/', apiVersion: 'v2' }).getEndpoint(),
  'https://custom.example.com/v2/_dummy',
  'trailing slash stripped, custom url and apiVersion respected'
);

assert.throws(
  () => getReader().init({}),
  /dataset is required/,
  'throws when dataset is missing'
);

// ─── _queryAsParams ───────────────────────────────────────────────────────────

{
  const reader = makeReader();
  const q = reader._queryAsParams({
    select: { key: ['company', 'year'], value: ['lines_of_code'] },
    from: 'datapoints',
    _internal: 'stripped'  // not in allowedProperties
  });
  assert.match(q, /^\$/, 'urlon v3 output starts with $');
  assert.doesNotMatch(q, /^_/, 'urlon v2 _ prefix not present');
  assert.match(q, /lines_of_code/, 'indicator name preserved');
  assert.doesNotMatch(q, /_internal/, 'non-DDF props stripped');
}

// ─── time parsers ─────────────────────────────────────────────────────────────

const reader = makeReader();
const p = reader.parsers;

assert.deepEqual(p.year(2015),        utc(2015),       'year: integer → Jan 1');
assert.deepEqual(p.month('2015-04'),  utc(2015, 4),    'month: YYYY-MM string');
assert.deepEqual(p.day(20150407),     utc(2015, 4, 7), 'day: YYYYMMDD integer');
assert.deepEqual(p.quarter('2015q2'), utc(2015, 4),    'quarter: q2 → Apr 1');
assert.deepEqual(p.quarter('2015Q3'), utc(2015, 7),    'quarter: Q3 → Jul 1 (uppercase Q)');
assert.deepEqual(p.week('2015w01'),   utc(2014, 12, 29), 'week: 2015w01 → Mon Dec 29 2014 (ISO)');
assert.deepEqual(p.week('2015w02'),   utc(2015, 1, 5),   'week: 2015w02 → Mon Jan 5 2015');

// generic time parser dispatch
assert.deepEqual(p.time(2015),        utc(2015),       'time: small integer → year');
assert.deepEqual(p.time(20150407),    utc(2015, 4, 7), 'time: 8-digit integer → day');
assert.deepEqual(p.time('2015-04'),   utc(2015, 4),    'time: YYYY-MM string → month');
assert.deepEqual(p.time('2015q2'),    utc(2015, 4),    'time: quarter string');
assert.deepEqual(p.time('2015w01'),   utc(2014, 12, 29), 'time: week string');
assert.equal(    p.time(null),        undefined,       'time: non-string non-integer → undefined');

console.log('All tests passed.');
