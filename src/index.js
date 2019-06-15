import 'whatwg-fetch' // Polyfill for fetch
import * as Urlon from 'urlon';

export const getReader = () => {
  return {
    init (options) {
      const defaults = {
        dataset: 'systema_globalis',
        service: 'http://big-waffle.gapminder.org'
      }
      this.dataset = options.dataset || defaults.dataset
      this.service = options.service || defaults.service
      this.version = options.version
      this.headers = {}
      if (options.password) {
        this.headers.Authorization = 'Basic ' + btoa(this.dataset + ":" + options.password)
      }
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
    
    read (query, parsers) {
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
                return (data.rows || []).map(row => row.reduce((obj, value, headerIdx) => {
                  const field = header[headerIdx]
                  const parser = parsers[field]
                  obj[field] = parser ? parser(value) : value
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
