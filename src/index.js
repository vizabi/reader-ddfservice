import 'whatwg-fetch' // Polyfill for fetch
import { utcParse } from 'd3-time-format'
import * as Urlon from 'urlon'

// Time parsing must follow DDF specs here
// https://docs.google.com/document/d/1Cd2kEH5w3SRJYaDcu-M4dU5SY8No84T3g-QlNSW6pIE/edit#heading=h.oafc7aswaafy
const defaultParsers = {
  'YYYYMMDD': t => new Date(Date.UTC(Math.floor(t/10000), Math.floor((t % 10000)/100) - 1, t % 100)),
  'YYYY-MM': t => new Date(Date.UTC(+t.slice(0,4), +t.slice(-2) - 1)),
  'YYYY': t => new Date(Date.UTC(t, 0)),
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
      if (dataset.token) {
        this.headers.Authorization = 'Bearer ' + dataset.token
      }
      Object.assign(this.parsers, dataset.parsers || {}) // add or overwrite parsers
    },
    setToken (token){
      this.headers.Authorization = 'Bearer ' + token;
    },

    checkIfAssetExists (filePath) {
      const asset = filePath.replace(/^assets\//, '') // some datasets still include the root path in asset names 
      const url = `${this.service}/${this.dataset}${this.version ? `/${this.version}` : ''}/assets/${asset}`
      return fetch(url, { method: "HEAD", credentials: 'same-origin', redirect: "follow"})
        .then((response) => {
          //the client should then look into response.ok, response.status and response.url 
          return Promise.resolve(response)
        })
        .catch(error => {
          error.name = "reader/error/asset";
          error.details = asset;
          error.message = "connection/error";
          error.endpoint = `${this.service}/${this.dataset}${this.version ? '/' + this.version : ''}`;
          throw error;
        });
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
              return Promise.resolve(response) // in case of an image or so ?
            }
          } else {
            return response.text()
              .then(txt => {
                const err = new Error(txt || `DDF Service responded with ${response.status}`)
                err.code = `HTTP_${response.status}`
                return err
              })
          }
        })
        .catch(error => {
          error.name = "reader/error/asset";
          error.details = asset;
          error.message = "connection/error";
          error.endpoint = `${this.service}/${this.dataset}${this.version ? '/' + this.version : ''}`;
          throw error;
        })
    },
    
    parsers: {
      time: timeValue => {       
        // json() parsing in fetch makes all time values integers except weeks and quarters
        if (Number.isInteger(timeValue)) {
          if (timeValue >= 0 && timeValue < 10000) 
            return defaultParsers['YYYY'](timeValue);        
          
          if (timeValue >= 1000000 && timeValue < 100000000) 
            return defaultParsers['YYYYMMDD'](timeValue);

        } else if (typeof timeValue == 'string') {

          if (timeValue[4] === "-" && timeValue.length == 7) 
          return defaultParsers['YYYY-MM'](timeValue);

          if (timeValue[4] === "q" || timeValue[4] === "Q") 
            return defaultParsers['YYYYqQ'](timeValue);

          if (timeValue[4] === "w" || timeValue[4] === "W") 
            return defaultParsers['YYYYwWW'](timeValue);

        } else {
          
         return undefined

        }
      },
      year: timeValue => defaultParsers['YYYY'](timeValue),
      month: timeValue => defaultParsers['YYYY-MM'](timeValue),
      day: timeValue => defaultParsers['YYYYMMDD'](timeValue),
      week: timeValue => defaultParsers['YYYYwWW'](timeValue),
      quarter: timeValue => defaultParsers['YYYYqQ'](timeValue)
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
                const err = new Error(txt || `DDF Service responded with ${response.status}`)
                err.code = `HTTP_${response.status}`
                return err
              })
          }
        })
        .catch(error => {
          error.name = "reader/error/generic";
          error.details = query;
          error.message = "connection/error";
          error.endpoint = `${this.service}/${this.dataset}${this.version ? '/' + this.version : ''}`;
          throw error;
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
