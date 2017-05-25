let require
API.onResourceStart.connect(() => {
  const test = resource.require
  require = test.require


  const { Dummy } = require('@/require/dummyclass')
  const { dummyFunction } = require('@/dummyfunction', { source: resource })
})
