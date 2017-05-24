// GTAN's JS is dumb and they won't let me fix it.

let __cache = new Map()

function require (moduleName) { // eslint-disable-line no-unused-vars
  // fix module name
  moduleName = moduleName.replace('\\', '/')

  // split it into usable parts
  const path = moduleName.split('/')

  // just in case API changes... (which i doubt but whatever.)
  let exportProvider = (API.exported !== undefined) ? API.exported : exported

  let module = exportProvider

  // loop the path, appending to module every time.
  for (let p of path) {
    if (module[p] !== undefined) {
      module = module[p]
    } else {
      throw new TypeError(`${moduleName} can't be loaded.`)
    }
  }

  // polyfill classes, since we can pass them by reference but not export them
  if (module.__requireModuleClasses !== undefined && typeof module.__requireModuleClasses === 'function') {
    // call the thing
    const classes = module.__requireModuleClasses()

    // It can return an object or just a single class.
    if (typeof classes === 'object' || '' + classes === '[object Object]') {
      // for an object of classes, we just append it...
      API.sendNotification('an object!')
      Object.assign(module, classes)
      // API.sendChatMessage('assigned')
    } else if (typeof classes === 'function') {
      API.sendNotification('function!')
      // for a bare class, we try to extrapolate that it is in fact a class, and that it has a name.
      if (classes.constructor !== undefined && classes.constructor.name !== undefined) {
        API.sendNotification('but solo class!')
        module[classes.constructor.name] = classes
      }
    } else {
      API.sendNotification('idk!')
    }
  }

  // and cache that mother/father.
  __cache = __cache.set(moduleName, module)

  return module
}
