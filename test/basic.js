var t = require('tap')
var Parser = require('../')

t.test('passing no options and cb works fine', function (t) {
  var p = new Parser(t.end)
  p.emit('complete')
})

t.test('end() can take chunk', function (t) {
  t.plan(2)
  t.test('string', function (t) {
    var p = new Parser()
    p.end('1..0\n', t.end)
  })
  t.test('encoding', function (t) {
    var p = new Parser()
    p.end(new Buffer('1..0\n').toString('hex'), 'hex',  t.end)
  })
})

t.test('takes a buffer just fine', function (t) {
  var p = new Parser(theEnd)
  p.write(new Buffer('TAP version 13\n'))

  var calledme = false
  function callme () {
    calledme = true
  }

  var calledbail = false
  function bailcall () {
    calledbail = true
  }

  p.write('ok 1 i just met you\n')
  p.write('ok and this is crazy\n')
  p.write('ok 3 - but heres my number\n')
  p.write('6f6b2034202d20736f2063616c6c206d65206d61796265', 'hex', callme)
  p.write('Bail out! then call cb on next tick')
  p.write('bailouts make all writes ignored right away', bailcall)
  process.nextTick(function () {
    p.end()
  })

  function theEnd (results) {
    t.ok(calledme, 'called cb from normal write')
    t.ok(calledbail, 'called cb from post-bailout write')
    t.match(results, { ok: false, count: 4, pass: 4 })
    t.end()
  }
})
