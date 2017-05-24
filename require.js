// GTAN's JS is dumb and they won't let me fix it.

let __cache = new Map()

function require (moduleName) { // eslint-disable-line no-unused-vars
  // don't cache if we start with @
  let cachable = true

  if (moduleName.startsWith('@')) {
    cachable = false
    moduleName = moduleName.slice(1)
  }

  // fix module name
  moduleName = moduleName.replace('\\', '/') // switch \ to /
  moduleName = moduleName.replace(/\.js$/, '') // remove .js endings

  // check cache
  if (cachable && __cache.has(moduleName)) {
    return __cache.get(moduleName)
  }

  // split it into usable parts
  let path = moduleName.split('/')

  // if path is e.x. /liberty/test, remove the leading element.
  // we also manage to do this for non-cachable modules.
  if (path[0] === '') {
    path = path.slice(1)
  }

  // just in case API changes... (which i doubt but whatever.)
  let exportProvider = (API.exported !== undefined) ? API.exported : exported

  let resolved = false
  let module = exportProvider

  // when the module path is one name, we'll try two files: moduleName.index and moduleName.moduleName
  if (path.length === 1) {
    let m = path[0]
    module = module[m]

    if (module.index !== undefined) {
      module = module.index
      resolved = true
    }

    if (module[m] !== undefined) {
      module = module[m]
      resolved = true
    }
  }

  if (!resolved) {
    // loop the path, appending to module every time.
    for (let p of path) {
      if (module[p] !== undefined) {
        module = module[p]
      } else {
        throw new TypeError(`${moduleName} can't be loaded.`)
      }
    }
  }

  let polyfill = null

  // check if any polyfill methods are around...
  if (module.module !== undefined && typeof module.module.classes === 'function') {
    polyfill = module.module.classes
  } else if (typeof module.__requireModuleClasses === 'function') {
    polyfill = module.__requireModuleClasses
  }

  // polyfill classes, since we can pass them by reference but not export them
  if (polyfill !== null) {
    // call the thing
    const classes = polyfill()

    // It can return an object or just a single class.
    if (typeof classes === 'object' || '' + classes === '[object Object]') {
      // for an object of classes, we just append it...
      Object.assign(module, classes)
      // API.sendChatMessage('assigned')
    } else if (typeof classes === 'function') {
      // for a bare class, we try to extrapolate that it is in fact a class, and that it has a name.
      if (classes.constructor !== undefined && classes.constructor.name !== undefined) {
        module[classes.constructor.name] = classes
      }
    }
  }

  // and cache that mother/father.
  if (cachable) {
    __cache = __cache.set(moduleName, module)
  }

  return module
}
