import pako from 'pako'

const def = {
  ...pako,
  deflateSync: (...args) => Buffer.from(pako.deflate(...args))
}

module.exports = def