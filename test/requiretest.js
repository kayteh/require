let require
API.onResourceStart.connect(() => {
  const test = resource.require
  require = test.require
  const localRequire = test.local(resource)

  require('@/require/dummyclass')
  require('@/dummyfunction', { source: resource })
  localRequire('@/dummyfunction')
})
