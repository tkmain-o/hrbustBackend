const xml2json = require('node-xml2json')
const request = require('request')

function getCaptcha (filePath) {
  const promise = new Promise((resolve, reject) => {
    request(`http://localhost:8007/?name=${filePath}`, (error, response, body) => {
      let text = ''
      let predictable = 'False'
      try {
        const bodyObj = xml2json.parser(body)
        text = bodyObj.note.digits
        predictable = bodyObj.note.predictable
      } catch (e) {
        console.error(e)
        reject(e)
        return
      }
      resolve({
        text,
        predictable,
      })
    })
  })
  return promise
}

module.exports = getCaptcha
