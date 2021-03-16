import 'whatwg-fetch' // Polyfill for fetch
import { utcParse } from 'd3-time-format'
import * as Urlon from 'urlon'

const defaultParsers = {
  'YYYYMMDD': timeString => new Date(Date.UTC(timeString.slice(0,4), timeString.slice(4,6), timeString.slice(-2))),
  'YYYYMM': timeString => new Date(Date.UTC(timeString.slice(0,4), timeString.slice(-2))),
  'YYYY': timeString => new Date(Date.UTC(timeString, 0)),
  'YYYYqQ': utcParse("%Yq%q"),
  'YYYYwWW': utcParse("%Yw%W")
};

export const getReader = (options = {}) => {
  return {
    init (dataset) {
      const defaults = {
        service: 'https://big-waffle.gapminder.org'
      }
      this.service = options.service || dataset.service || defaults.service
      this.dataset = dataset.name || defaults.name
      this.version = dataset.version || defaults.version
      this.headers = {}
      if (dataset.password) {
        this.headers.Authorization = 'Basic ' + btoa(this.dataset + ":" + options.password)
      }
      Object.assign(this.parsers, dataset.parsers || {}) // add or overwrite parsers
    },

    getAsset (filePath) {
      const asset = filePath.replace(/^assets\//, '') // some datasets still include the root path in asset names 
      const url = `${this.service}/${this.dataset}${this.version ? `/${this.version}` : ''}/assets/${asset}`
      return fetch(url, { credentials: 'same-origin', redirect: "follow" })
        .then(response => {
          if (response.ok) {
            const contentType = response.headers.get("Content-Type")
            if (/application\/json/.test(contentType)) {
              return response.json()
                .then(data => data)
            } else {
              return response.blob() // in case of an image or so ?
                .then(data => data)
            }
          } else {
            return response.text()
              .then(txt => {
                const err = new Error(response.text() || `DDF Service responded with ${response.status}`)
                err.code = `HTTP_${response.status}`
                return err
              })
          }
        })
        .catch(error => {
          console.error(error)
          return error
        })
    },
    
    parsers: {
      time: timeString => {
        const timeRegEx = /^([0-9]{4})(w[0-9]{2}|q[0-9]{1})?([0-9]{2})?([0-9]{2})?$/
        if (Number.isInteger(timeString)) { // the timeString is probably a year
          return timeString >= 0 && timeString < 10000 ? defaultParsers['YYYY'](timeString) : undefined
        } else if (typeof timeString !== 'string') {
          return undefined
        } else {
           const match = timeRegEx.exec(timeString)
           if (match) { // match[1] = year, match[2] = week or quarter, match[3] = month, match[4] = day
             if (match[4]) {
               return defaultParsers['YYYYMMDD'](timeString)
             } else if (match[3]) {
              return defaultParsers['YYYYMM'](timeString)
             } else if (match[2].length === 2) {
              return defaultParsers['YYYYqQ'](timeString)
             } else if (match[2].length === 3) {
              return defaultParsers['YYYYwWW'](timeString)
             } else if (match[1]) {
              return defaultParsers['YYYY'](timeString)
             }
           }
        }
      },
      year: timeString => defaultParsers['YYYY'](timeString),
      month: timeString => defaultParsers['YYYYMM'](timeString),
      day: timeString => defaultParsers['YYYYMMDD'](timeString),
      week: timeString => defaultParsers['YYYYwWW'](timeString),
      quarter: timeString => defaultParsers['YYYYqQ'](timeString)
    },

    read (query) {
      const url = `${this.service}/${this.dataset}${this.version ? `/${this.version}` : ''}?${this._queryAsParams(query)}`
      return fetch(url, { credentials: 'same-origin', headers: this.headers, redirect: "follow" })
        .then(response => {
          if (response.ok) {
            /*
            * Return an array of objects
            */
            return response.json()
              .then(data => {
                if (data.version) {
                  this.version = data.version
                }
                ['info', 'warn', 'error'].forEach(level => {
                  (data[level] || []).forEach(logRecord => {
                    const msg = logRecord && logRecord.msg ? logRecord.msg : logRecord
                    console[level](msg)
                  })
                })
                const header = data.header
                const parsers = header.map(h => this.parsers[h])
                return (data.rows || []).map(row => row.reduce((obj, value, headerIdx) => {
                  const field = header[headerIdx]
                  obj[field] = parsers[headerIdx] ? parsers[headerIdx](value) : value
                  return obj
                }, {}))
              })
          } else {
            return response.text()
              .then(txt => {
                const err = new Error(response.text() || `DDF Service responded with ${response.status}`)
                err.code = `HTTP_${response.status}`
                return err
              })
          }
        })
        .catch(error => {
          console.error(error)
          return error
        })
    },

    _queryAsParams (query) {
      // Only include properties specidied in the DDF Query Language specification
      const allowedProperties = ['language', 'select', 'from', 'where', 'join', 'order_by']
      const cleanQuery = {}
      allowedProperties.filter(prop => query[prop]).forEach(prop => {
        cleanQuery[prop] = query[prop]
      })
      
      return Urlon.stringify(cleanQuery) // could also do encodeURIComponent(JSON.stringify(query))
    }
  }
}
