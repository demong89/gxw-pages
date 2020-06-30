const test = require('ava')
const gxwPages = require('..')

// TODO: Implement module test
test('<test-title>', t => {
  const err = t.throws(() => gxwPages(100), TypeError)
  t.is(err.message, 'Expected a string, got number')

  t.is(gxwPages('w'), 'w@zce.me')
  t.is(gxwPages('w', { host: 'wedn.net' }), 'w@wedn.net')
})
