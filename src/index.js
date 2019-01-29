import 'axios'

export class BigWaffleReader {
  init (options) {
    const defaults = {
      dataset: 'systema_globalis',
      service: 'http://bigwaffle.gapminder.org'
    }
    this.dataset = options.dataset || defaults.dataset
    this.service = options.service || defaults.service
  }

  read (query, parsers) {
    // For now parsers are ignored
    const url = `${this.service}/${this.dataset}?${this._queryAsParams(query)}`
    return axios.get(url)
      .then(response => {
        if (response.status === 200) {
          return data
        } else {
          const err = new Error(response.statusTxt || `DDF Service responded with ${response.status}`)
          err.code = `HTTP_${response.status}`
          return err
        }
      })
      .catch(error => {
        if (error.response) {
          const err = new Error(response.statusTxt || `DDF Service responded with ${response.status}`)
          err.code = `HTTP_${response.status}`
          return err
        } else {
          console.error(error)
          return error
        }
      })
  }

  _queryAsParams(query) {
    //TODO: Add some basic validation ??
    return encodeURIComponent(JSON.stringify(query))
  }

  static newReader () {
    return new BigWaffleReader()
  }
}
