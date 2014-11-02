(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/cssify/browser.js":[function(require,module,exports){
module.exports = function (css, customDocument) {
  var doc = customDocument || document;
  if (doc.createStyleSheet) {
    var sheet = doc.createStyleSheet()
    sheet.cssText = css;
    return sheet.ownerNode;
  } else {
    var head = doc.getElementsByTagName('head')[0],
        style = doc.createElement('style');

    style.type = 'text/css';

    if (style.styleSheet) {
      style.styleSheet.cssText = css;
    } else {
      style.appendChild(doc.createTextNode(css));
    }

    head.appendChild(style);
    return style;
  }
};

module.exports.byUrl = function(url) {
  if (document.createStyleSheet) {
    return document.createStyleSheet(url).ownerNode;
  } else {
    var head = document.getElementsByTagName('head')[0],
        link = document.createElement('link');

    link.rel = 'stylesheet';
    link.href = url;

    head.appendChild(link);
    return link;
  }
};

},{}],"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/core/Context.js":[function(require,module,exports){
var RenderNode = require('./RenderNode');
var EventHandler = require('./EventHandler');
var ElementAllocator = require('./ElementAllocator');
var Transform = require('./Transform');
var Transitionable = require('../transitions/Transitionable');
var _zeroZero = [
        0,
        0
    ];
var usePrefix = !('perspective' in document.documentElement.style);
function _getElementSize(element) {
    return [
        element.clientWidth,
        element.clientHeight
    ];
}
var _setPerspective = usePrefix ? function (element, perspective) {
        element.style.webkitPerspective = perspective ? perspective.toFixed() + 'px' : '';
    } : function (element, perspective) {
        element.style.perspective = perspective ? perspective.toFixed() + 'px' : '';
    };
function Context(container) {
    this.container = container;
    this._allocator = new ElementAllocator(container);
    this._node = new RenderNode();
    this._eventOutput = new EventHandler();
    this._size = _getElementSize(this.container);
    this._perspectiveState = new Transitionable(0);
    this._perspective = undefined;
    this._nodeContext = {
        allocator: this._allocator,
        transform: Transform.identity,
        opacity: 1,
        origin: _zeroZero,
        align: _zeroZero,
        size: this._size
    };
    this._eventOutput.on('resize', function () {
        this.setSize(_getElementSize(this.container));
    }.bind(this));
}
Context.prototype.getAllocator = function getAllocator() {
    return this._allocator;
};
Context.prototype.add = function add(obj) {
    return this._node.add(obj);
};
Context.prototype.migrate = function migrate(container) {
    if (container === this.container)
        return;
    this.container = container;
    this._allocator.migrate(container);
};
Context.prototype.getSize = function getSize() {
    return this._size;
};
Context.prototype.setSize = function setSize(size) {
    if (!size)
        size = _getElementSize(this.container);
    this._size[0] = size[0];
    this._size[1] = size[1];
};
Context.prototype.update = function update(contextParameters) {
    if (contextParameters) {
        if (contextParameters.transform)
            this._nodeContext.transform = contextParameters.transform;
        if (contextParameters.opacity)
            this._nodeContext.opacity = contextParameters.opacity;
        if (contextParameters.origin)
            this._nodeContext.origin = contextParameters.origin;
        if (contextParameters.align)
            this._nodeContext.align = contextParameters.align;
        if (contextParameters.size)
            this._nodeContext.size = contextParameters.size;
    }
    var perspective = this._perspectiveState.get();
    if (perspective !== this._perspective) {
        _setPerspective(this.container, perspective);
        this._perspective = perspective;
    }
    this._node.commit(this._nodeContext);
};
Context.prototype.getPerspective = function getPerspective() {
    return this._perspectiveState.get();
};
Context.prototype.setPerspective = function setPerspective(perspective, transition, callback) {
    return this._perspectiveState.set(perspective, transition, callback);
};
Context.prototype.emit = function emit(type, event) {
    return this._eventOutput.emit(type, event);
};
Context.prototype.on = function on(type, handler) {
    return this._eventOutput.on(type, handler);
};
Context.prototype.removeListener = function removeListener(type, handler) {
    return this._eventOutput.removeListener(type, handler);
};
Context.prototype.pipe = function pipe(target) {
    return this._eventOutput.pipe(target);
};
Context.prototype.unpipe = function unpipe(target) {
    return this._eventOutput.unpipe(target);
};
module.exports = Context;
},{"../transitions/Transitionable":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/transitions/Transitionable.js","./ElementAllocator":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/core/ElementAllocator.js","./EventHandler":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/core/EventHandler.js","./RenderNode":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/core/RenderNode.js","./Transform":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/core/Transform.js"}],"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/core/ElementAllocator.js":[function(require,module,exports){
function ElementAllocator(container) {
    if (!container)
        container = document.createDocumentFragment();
    this.container = container;
    this.detachedNodes = {};
    this.nodeCount = 0;
}
ElementAllocator.prototype.migrate = function migrate(container) {
    var oldContainer = this.container;
    if (container === oldContainer)
        return;
    if (oldContainer instanceof DocumentFragment) {
        container.appendChild(oldContainer);
    } else {
        while (oldContainer.hasChildNodes()) {
            container.appendChild(oldContainer.removeChild(oldContainer.firstChild));
        }
    }
    this.container = container;
};
ElementAllocator.prototype.allocate = function allocate(type) {
    type = type.toLowerCase();
    if (!(type in this.detachedNodes))
        this.detachedNodes[type] = [];
    var nodeStore = this.detachedNodes[type];
    var result;
    if (nodeStore.length > 0) {
        result = nodeStore.pop();
    } else {
        result = document.createElement(type);
        this.container.appendChild(result);
    }
    this.nodeCount++;
    return result;
};
ElementAllocator.prototype.deallocate = function deallocate(element) {
    var nodeType = element.nodeName.toLowerCase();
    var nodeStore = this.detachedNodes[nodeType];
    nodeStore.push(element);
    this.nodeCount--;
};
ElementAllocator.prototype.getNodeCount = function getNodeCount() {
    return this.nodeCount;
};
module.exports = ElementAllocator;
},{}],"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/core/ElementOutput.js":[function(require,module,exports){
var Entity = require('./Entity');
var EventHandler = require('./EventHandler');
var Transform = require('./Transform');
var usePrefix = !('transform' in document.documentElement.style);
var devicePixelRatio = window.devicePixelRatio || 1;
function ElementOutput(element) {
    this._matrix = null;
    this._opacity = 1;
    this._origin = null;
    this._size = null;
    this._eventOutput = new EventHandler();
    this._eventOutput.bindThis(this);
    this.eventForwarder = function eventForwarder(event) {
        this._eventOutput.emit(event.type, event);
    }.bind(this);
    this.id = Entity.register(this);
    this._element = null;
    this._sizeDirty = false;
    this._originDirty = false;
    this._transformDirty = false;
    this._invisible = false;
    if (element)
        this.attach(element);
}
ElementOutput.prototype.on = function on(type, fn) {
    if (this._element)
        this._element.addEventListener(type, this.eventForwarder);
    this._eventOutput.on(type, fn);
};
ElementOutput.prototype.removeListener = function removeListener(type, fn) {
    this._eventOutput.removeListener(type, fn);
};
ElementOutput.prototype.emit = function emit(type, event) {
    if (event && !event.origin)
        event.origin = this;
    var handled = this._eventOutput.emit(type, event);
    if (handled && event && event.stopPropagation)
        event.stopPropagation();
    return handled;
};
ElementOutput.prototype.pipe = function pipe(target) {
    return this._eventOutput.pipe(target);
};
ElementOutput.prototype.unpipe = function unpipe(target) {
    return this._eventOutput.unpipe(target);
};
ElementOutput.prototype.render = function render() {
    return this.id;
};
function _addEventListeners(target) {
    for (var i in this._eventOutput.listeners) {
        target.addEventListener(i, this.eventForwarder);
    }
}
function _removeEventListeners(target) {
    for (var i in this._eventOutput.listeners) {
        target.removeEventListener(i, this.eventForwarder);
    }
}
function _formatCSSTransform(m) {
    var result = 'matrix3d(';
    for (var i = 0; i < 15; i++) {
        result += m[i] < 0.000001 && m[i] > -0.000001 ? '0,' : m[i] + ',';
    }
    result += m[15] + ')';
    return result;
}
var _setMatrix;
if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
    _setMatrix = function (element, matrix) {
        element.style.zIndex = matrix[14] * 1000000 | 0;
        element.style.transform = _formatCSSTransform(matrix);
    };
} else if (usePrefix) {
    _setMatrix = function (element, matrix) {
        element.style.webkitTransform = _formatCSSTransform(matrix);
    };
} else {
    _setMatrix = function (element, matrix) {
        element.style.transform = _formatCSSTransform(matrix);
    };
}
function _formatCSSOrigin(origin) {
    return 100 * origin[0] + '% ' + 100 * origin[1] + '%';
}
var _setOrigin = usePrefix ? function (element, origin) {
        element.style.webkitTransformOrigin = _formatCSSOrigin(origin);
    } : function (element, origin) {
        element.style.transformOrigin = _formatCSSOrigin(origin);
    };
var _setInvisible = usePrefix ? function (element) {
        element.style.webkitTransform = 'scale3d(0.0001,0.0001,0.0001)';
        element.style.opacity = 0;
    } : function (element) {
        element.style.transform = 'scale3d(0.0001,0.0001,0.0001)';
        element.style.opacity = 0;
    };
function _xyNotEquals(a, b) {
    return a && b ? a[0] !== b[0] || a[1] !== b[1] : a !== b;
}
ElementOutput.prototype.commit = function commit(context) {
    var target = this._element;
    if (!target)
        return;
    var matrix = context.transform;
    var opacity = context.opacity;
    var origin = context.origin;
    var size = context.size;
    if (!matrix && this._matrix) {
        this._matrix = null;
        this._opacity = 0;
        _setInvisible(target);
        return;
    }
    if (_xyNotEquals(this._origin, origin))
        this._originDirty = true;
    if (Transform.notEquals(this._matrix, matrix))
        this._transformDirty = true;
    if (this._invisible) {
        this._invisible = false;
        this._element.style.display = '';
    }
    if (this._opacity !== opacity) {
        this._opacity = opacity;
        target.style.opacity = opacity >= 1 ? '0.999999' : opacity;
    }
    if (this._transformDirty || this._originDirty || this._sizeDirty) {
        if (this._sizeDirty)
            this._sizeDirty = false;
        if (this._originDirty) {
            if (origin) {
                if (!this._origin)
                    this._origin = [
                        0,
                        0
                    ];
                this._origin[0] = origin[0];
                this._origin[1] = origin[1];
            } else
                this._origin = null;
            _setOrigin(target, this._origin);
            this._originDirty = false;
        }
        if (!matrix)
            matrix = Transform.identity;
        this._matrix = matrix;
        var aaMatrix = this._size ? Transform.thenMove(matrix, [
                -this._size[0] * origin[0],
                -this._size[1] * origin[1],
                0
            ]) : matrix;
        _setMatrix(target, aaMatrix);
        this._transformDirty = false;
    }
};
ElementOutput.prototype.cleanup = function cleanup() {
    if (this._element) {
        this._invisible = true;
        this._element.style.display = 'none';
    }
};
ElementOutput.prototype.attach = function attach(target) {
    this._element = target;
    _addEventListeners.call(this, target);
};
ElementOutput.prototype.detach = function detach() {
    var target = this._element;
    if (target) {
        _removeEventListeners.call(this, target);
        if (this._invisible) {
            this._invisible = false;
            this._element.style.display = '';
        }
    }
    this._element = null;
    return target;
};
module.exports = ElementOutput;
},{"./Entity":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/core/Entity.js","./EventHandler":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/core/EventHandler.js","./Transform":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/core/Transform.js"}],"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/core/Engine.js":[function(require,module,exports){
var Context = require('./Context');
var EventHandler = require('./EventHandler');
var OptionsManager = require('./OptionsManager');
var Engine = {};
var contexts = [];
var nextTickQueue = [];
var deferQueue = [];
var lastTime = Date.now();
var frameTime;
var frameTimeLimit;
var loopEnabled = true;
var eventForwarders = {};
var eventHandler = new EventHandler();
var options = {
        containerType: 'div',
        containerClass: 'famous-container',
        fpsCap: undefined,
        runLoop: true,
        appMode: true
    };
var optionsManager = new OptionsManager(options);
var MAX_DEFER_FRAME_TIME = 10;
Engine.step = function step() {
    var currentTime = Date.now();
    if (frameTimeLimit && currentTime - lastTime < frameTimeLimit)
        return;
    var i = 0;
    frameTime = currentTime - lastTime;
    lastTime = currentTime;
    eventHandler.emit('prerender');
    for (i = 0; i < nextTickQueue.length; i++)
        nextTickQueue[i].call(this);
    nextTickQueue.splice(0);
    while (deferQueue.length && Date.now() - currentTime < MAX_DEFER_FRAME_TIME) {
        deferQueue.shift().call(this);
    }
    for (i = 0; i < contexts.length; i++)
        contexts[i].update();
    eventHandler.emit('postrender');
};
function loop() {
    if (options.runLoop) {
        Engine.step();
        window.requestAnimationFrame(loop);
    } else
        loopEnabled = false;
}
window.requestAnimationFrame(loop);
function handleResize(event) {
    for (var i = 0; i < contexts.length; i++) {
        contexts[i].emit('resize');
    }
    eventHandler.emit('resize');
}
window.addEventListener('resize', handleResize, false);
handleResize();
function initialize() {
    window.addEventListener('touchmove', function (event) {
        event.preventDefault();
    }, true);
    document.body.classList.add('famous-root');
    document.documentElement.classList.add('famous-root');
}
var initialized = false;
Engine.pipe = function pipe(target) {
    if (target.subscribe instanceof Function)
        return target.subscribe(Engine);
    else
        return eventHandler.pipe(target);
};
Engine.unpipe = function unpipe(target) {
    if (target.unsubscribe instanceof Function)
        return target.unsubscribe(Engine);
    else
        return eventHandler.unpipe(target);
};
Engine.on = function on(type, handler) {
    if (!(type in eventForwarders)) {
        eventForwarders[type] = eventHandler.emit.bind(eventHandler, type);
        if (document.body) {
            document.body.addEventListener(type, eventForwarders[type]);
        } else {
            Engine.nextTick(function (type, forwarder) {
                document.body.addEventListener(type, forwarder);
            }.bind(this, type, eventForwarders[type]));
        }
    }
    return eventHandler.on(type, handler);
};
Engine.emit = function emit(type, event) {
    return eventHandler.emit(type, event);
};
Engine.removeListener = function removeListener(type, handler) {
    return eventHandler.removeListener(type, handler);
};
Engine.getFPS = function getFPS() {
    return 1000 / frameTime;
};
Engine.setFPSCap = function setFPSCap(fps) {
    frameTimeLimit = Math.floor(1000 / fps);
};
Engine.getOptions = function getOptions(key) {
    return optionsManager.getOptions(key);
};
Engine.setOptions = function setOptions(options) {
    return optionsManager.setOptions.apply(optionsManager, arguments);
};
Engine.createContext = function createContext(el) {
    if (!initialized && options.appMode)
        Engine.nextTick(initialize);
    var needMountContainer = false;
    if (!el) {
        el = document.createElement(options.containerType);
        el.classList.add(options.containerClass);
        needMountContainer = true;
    }
    var context = new Context(el);
    Engine.registerContext(context);
    if (needMountContainer) {
        Engine.nextTick(function (context, el) {
            document.body.appendChild(el);
            context.emit('resize');
        }.bind(this, context, el));
    }
    return context;
};
Engine.registerContext = function registerContext(context) {
    contexts.push(context);
    return context;
};
Engine.getContexts = function getContexts() {
    return contexts;
};
Engine.deregisterContext = function deregisterContext(context) {
    var i = contexts.indexOf(context);
    if (i >= 0)
        contexts.splice(i, 1);
};
Engine.nextTick = function nextTick(fn) {
    nextTickQueue.push(fn);
};
Engine.defer = function defer(fn) {
    deferQueue.push(fn);
};
optionsManager.on('change', function (data) {
    if (data.id === 'fpsCap')
        Engine.setFPSCap(data.value);
    else if (data.id === 'runLoop') {
        if (!loopEnabled && data.value) {
            loopEnabled = true;
            window.requestAnimationFrame(loop);
        }
    }
});
module.exports = Engine;
},{"./Context":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/core/Context.js","./EventHandler":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/core/EventHandler.js","./OptionsManager":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/core/OptionsManager.js"}],"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/core/Entity.js":[function(require,module,exports){
var entities = [];
function get(id) {
    return entities[id];
}
function set(id, entity) {
    entities[id] = entity;
}
function register(entity) {
    var id = entities.length;
    set(id, entity);
    return id;
}
function unregister(id) {
    set(id, null);
}
module.exports = {
    register: register,
    unregister: unregister,
    get: get,
    set: set
};
},{}],"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/core/EventEmitter.js":[function(require,module,exports){
function EventEmitter() {
    this.listeners = {};
    this._owner = this;
}
EventEmitter.prototype.emit = function emit(type, event) {
    var handlers = this.listeners[type];
    if (handlers) {
        for (var i = 0; i < handlers.length; i++) {
            handlers[i].call(this._owner, event);
        }
    }
    return this;
};
EventEmitter.prototype.on = function on(type, handler) {
    if (!(type in this.listeners))
        this.listeners[type] = [];
    var index = this.listeners[type].indexOf(handler);
    if (index < 0)
        this.listeners[type].push(handler);
    return this;
};
EventEmitter.prototype.addListener = EventEmitter.prototype.on;
EventEmitter.prototype.removeListener = function removeListener(type, handler) {
    var listener = this.listeners[type];
    if (listener !== undefined) {
        var index = listener.indexOf(handler);
        if (index >= 0)
            listener.splice(index, 1);
    }
    return this;
};
EventEmitter.prototype.bindThis = function bindThis(owner) {
    this._owner = owner;
};
module.exports = EventEmitter;
},{}],"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/core/EventHandler.js":[function(require,module,exports){
var EventEmitter = require('./EventEmitter');
function EventHandler() {
    EventEmitter.apply(this, arguments);
    this.downstream = [];
    this.downstreamFn = [];
    this.upstream = [];
    this.upstreamListeners = {};
}
EventHandler.prototype = Object.create(EventEmitter.prototype);
EventHandler.prototype.constructor = EventHandler;
EventHandler.setInputHandler = function setInputHandler(object, handler) {
    object.trigger = handler.trigger.bind(handler);
    if (handler.subscribe && handler.unsubscribe) {
        object.subscribe = handler.subscribe.bind(handler);
        object.unsubscribe = handler.unsubscribe.bind(handler);
    }
};
EventHandler.setOutputHandler = function setOutputHandler(object, handler) {
    if (handler instanceof EventHandler)
        handler.bindThis(object);
    object.pipe = handler.pipe.bind(handler);
    object.unpipe = handler.unpipe.bind(handler);
    object.on = handler.on.bind(handler);
    object.addListener = object.on;
    object.removeListener = handler.removeListener.bind(handler);
};
EventHandler.prototype.emit = function emit(type, event) {
    EventEmitter.prototype.emit.apply(this, arguments);
    var i = 0;
    for (i = 0; i < this.downstream.length; i++) {
        if (this.downstream[i].trigger)
            this.downstream[i].trigger(type, event);
    }
    for (i = 0; i < this.downstreamFn.length; i++) {
        this.downstreamFn[i](type, event);
    }
    return this;
};
EventHandler.prototype.trigger = EventHandler.prototype.emit;
EventHandler.prototype.pipe = function pipe(target) {
    if (target.subscribe instanceof Function)
        return target.subscribe(this);
    var downstreamCtx = target instanceof Function ? this.downstreamFn : this.downstream;
    var index = downstreamCtx.indexOf(target);
    if (index < 0)
        downstreamCtx.push(target);
    if (target instanceof Function)
        target('pipe', null);
    else if (target.trigger)
        target.trigger('pipe', null);
    return target;
};
EventHandler.prototype.unpipe = function unpipe(target) {
    if (target.unsubscribe instanceof Function)
        return target.unsubscribe(this);
    var downstreamCtx = target instanceof Function ? this.downstreamFn : this.downstream;
    var index = downstreamCtx.indexOf(target);
    if (index >= 0) {
        downstreamCtx.splice(index, 1);
        if (target instanceof Function)
            target('unpipe', null);
        else if (target.trigger)
            target.trigger('unpipe', null);
        return target;
    } else
        return false;
};
EventHandler.prototype.on = function on(type, handler) {
    EventEmitter.prototype.on.apply(this, arguments);
    if (!(type in this.upstreamListeners)) {
        var upstreamListener = this.trigger.bind(this, type);
        this.upstreamListeners[type] = upstreamListener;
        for (var i = 0; i < this.upstream.length; i++) {
            this.upstream[i].on(type, upstreamListener);
        }
    }
    return this;
};
EventHandler.prototype.addListener = EventHandler.prototype.on;
EventHandler.prototype.subscribe = function subscribe(source) {
    var index = this.upstream.indexOf(source);
    if (index < 0) {
        this.upstream.push(source);
        for (var type in this.upstreamListeners) {
            source.on(type, this.upstreamListeners[type]);
        }
    }
    return this;
};
EventHandler.prototype.unsubscribe = function unsubscribe(source) {
    var index = this.upstream.indexOf(source);
    if (index >= 0) {
        this.upstream.splice(index, 1);
        for (var type in this.upstreamListeners) {
            source.removeListener(type, this.upstreamListeners[type]);
        }
    }
    return this;
};
module.exports = EventHandler;
},{"./EventEmitter":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/core/EventEmitter.js"}],"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/core/Modifier.js":[function(require,module,exports){
var Transform = require('./Transform');
var Transitionable = require('../transitions/Transitionable');
var TransitionableTransform = require('../transitions/TransitionableTransform');
function Modifier(options) {
    this._transformGetter = null;
    this._opacityGetter = null;
    this._originGetter = null;
    this._alignGetter = null;
    this._sizeGetter = null;
    this._proportionGetter = null;
    this._legacyStates = {};
    this._output = {
        transform: Transform.identity,
        opacity: 1,
        origin: null,
        align: null,
        size: null,
        proportions: null,
        target: null
    };
    if (options) {
        if (options.transform)
            this.transformFrom(options.transform);
        if (options.opacity !== undefined)
            this.opacityFrom(options.opacity);
        if (options.origin)
            this.originFrom(options.origin);
        if (options.align)
            this.alignFrom(options.align);
        if (options.size)
            this.sizeFrom(options.size);
        if (options.proportions)
            this.proportionsFrom(options.proportions);
    }
}
Modifier.prototype.transformFrom = function transformFrom(transform) {
    if (transform instanceof Function)
        this._transformGetter = transform;
    else if (transform instanceof Object && transform.get)
        this._transformGetter = transform.get.bind(transform);
    else {
        this._transformGetter = null;
        this._output.transform = transform;
    }
    return this;
};
Modifier.prototype.opacityFrom = function opacityFrom(opacity) {
    if (opacity instanceof Function)
        this._opacityGetter = opacity;
    else if (opacity instanceof Object && opacity.get)
        this._opacityGetter = opacity.get.bind(opacity);
    else {
        this._opacityGetter = null;
        this._output.opacity = opacity;
    }
    return this;
};
Modifier.prototype.originFrom = function originFrom(origin) {
    if (origin instanceof Function)
        this._originGetter = origin;
    else if (origin instanceof Object && origin.get)
        this._originGetter = origin.get.bind(origin);
    else {
        this._originGetter = null;
        this._output.origin = origin;
    }
    return this;
};
Modifier.prototype.alignFrom = function alignFrom(align) {
    if (align instanceof Function)
        this._alignGetter = align;
    else if (align instanceof Object && align.get)
        this._alignGetter = align.get.bind(align);
    else {
        this._alignGetter = null;
        this._output.align = align;
    }
    return this;
};
Modifier.prototype.sizeFrom = function sizeFrom(size) {
    if (size instanceof Function)
        this._sizeGetter = size;
    else if (size instanceof Object && size.get)
        this._sizeGetter = size.get.bind(size);
    else {
        this._sizeGetter = null;
        this._output.size = size;
    }
    return this;
};
Modifier.prototype.proportionsFrom = function proportionsFrom(proportions) {
    if (proportions instanceof Function)
        this._proportionGetter = proportions;
    else if (proportions instanceof Object && proportions.get)
        this._proportionGetter = proportions.get.bind(proportions);
    else {
        this._proportionGetter = null;
        this._output.proportions = proportions;
    }
    return this;
};
Modifier.prototype.setTransform = function setTransform(transform, transition, callback) {
    if (transition || this._legacyStates.transform) {
        if (!this._legacyStates.transform) {
            this._legacyStates.transform = new TransitionableTransform(this._output.transform);
        }
        if (!this._transformGetter)
            this.transformFrom(this._legacyStates.transform);
        this._legacyStates.transform.set(transform, transition, callback);
        return this;
    } else
        return this.transformFrom(transform);
};
Modifier.prototype.setOpacity = function setOpacity(opacity, transition, callback) {
    if (transition || this._legacyStates.opacity) {
        if (!this._legacyStates.opacity) {
            this._legacyStates.opacity = new Transitionable(this._output.opacity);
        }
        if (!this._opacityGetter)
            this.opacityFrom(this._legacyStates.opacity);
        return this._legacyStates.opacity.set(opacity, transition, callback);
    } else
        return this.opacityFrom(opacity);
};
Modifier.prototype.setOrigin = function setOrigin(origin, transition, callback) {
    if (transition || this._legacyStates.origin) {
        if (!this._legacyStates.origin) {
            this._legacyStates.origin = new Transitionable(this._output.origin || [
                0,
                0
            ]);
        }
        if (!this._originGetter)
            this.originFrom(this._legacyStates.origin);
        this._legacyStates.origin.set(origin, transition, callback);
        return this;
    } else
        return this.originFrom(origin);
};
Modifier.prototype.setAlign = function setAlign(align, transition, callback) {
    if (transition || this._legacyStates.align) {
        if (!this._legacyStates.align) {
            this._legacyStates.align = new Transitionable(this._output.align || [
                0,
                0
            ]);
        }
        if (!this._alignGetter)
            this.alignFrom(this._legacyStates.align);
        this._legacyStates.align.set(align, transition, callback);
        return this;
    } else
        return this.alignFrom(align);
};
Modifier.prototype.setSize = function setSize(size, transition, callback) {
    if (size && (transition || this._legacyStates.size)) {
        if (!this._legacyStates.size) {
            this._legacyStates.size = new Transitionable(this._output.size || [
                0,
                0
            ]);
        }
        if (!this._sizeGetter)
            this.sizeFrom(this._legacyStates.size);
        this._legacyStates.size.set(size, transition, callback);
        return this;
    } else
        return this.sizeFrom(size);
};
Modifier.prototype.setProportions = function setProportions(proportions, transition, callback) {
    if (proportions && (transition || this._legacyStates.proportions)) {
        if (!this._legacyStates.proportions) {
            this._legacyStates.proportions = new Transitionable(this._output.proportions || [
                0,
                0
            ]);
        }
        if (!this._proportionGetter)
            this.proportionsFrom(this._legacyStates.proportions);
        this._legacyStates.proportions.set(proportions, transition, callback);
        return this;
    } else
        return this.proportionsFrom(proportions);
};
Modifier.prototype.halt = function halt() {
    if (this._legacyStates.transform)
        this._legacyStates.transform.halt();
    if (this._legacyStates.opacity)
        this._legacyStates.opacity.halt();
    if (this._legacyStates.origin)
        this._legacyStates.origin.halt();
    if (this._legacyStates.align)
        this._legacyStates.align.halt();
    if (this._legacyStates.size)
        this._legacyStates.size.halt();
    if (this._legacyStates.proportions)
        this._legacyStates.proportions.halt();
    this._transformGetter = null;
    this._opacityGetter = null;
    this._originGetter = null;
    this._alignGetter = null;
    this._sizeGetter = null;
    this._proportionGetter = null;
};
Modifier.prototype.getTransform = function getTransform() {
    return this._transformGetter();
};
Modifier.prototype.getFinalTransform = function getFinalTransform() {
    return this._legacyStates.transform ? this._legacyStates.transform.getFinal() : this._output.transform;
};
Modifier.prototype.getOpacity = function getOpacity() {
    return this._opacityGetter();
};
Modifier.prototype.getOrigin = function getOrigin() {
    return this._originGetter();
};
Modifier.prototype.getAlign = function getAlign() {
    return this._alignGetter();
};
Modifier.prototype.getSize = function getSize() {
    return this._sizeGetter ? this._sizeGetter() : this._output.size;
};
Modifier.prototype.getProportions = function getProportions() {
    return this._proportionGetter ? this._proportionGetter() : this._output.proportions;
};
function _update() {
    if (this._transformGetter)
        this._output.transform = this._transformGetter();
    if (this._opacityGetter)
        this._output.opacity = this._opacityGetter();
    if (this._originGetter)
        this._output.origin = this._originGetter();
    if (this._alignGetter)
        this._output.align = this._alignGetter();
    if (this._sizeGetter)
        this._output.size = this._sizeGetter();
    if (this._proportionGetter)
        this._output.proportions = this._proportionGetter();
}
Modifier.prototype.modify = function modify(target) {
    _update.call(this);
    this._output.target = target;
    return this._output;
};
module.exports = Modifier;
},{"../transitions/Transitionable":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/transitions/Transitionable.js","../transitions/TransitionableTransform":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/transitions/TransitionableTransform.js","./Transform":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/core/Transform.js"}],"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/core/OptionsManager.js":[function(require,module,exports){
var EventHandler = require('./EventHandler');
function OptionsManager(value) {
    this._value = value;
    this.eventOutput = null;
}
OptionsManager.patch = function patchObject(source, data) {
    var manager = new OptionsManager(source);
    for (var i = 1; i < arguments.length; i++)
        manager.patch(arguments[i]);
    return source;
};
function _createEventOutput() {
    this.eventOutput = new EventHandler();
    this.eventOutput.bindThis(this);
    EventHandler.setOutputHandler(this, this.eventOutput);
}
OptionsManager.prototype.patch = function patch() {
    var myState = this._value;
    for (var i = 0; i < arguments.length; i++) {
        var data = arguments[i];
        for (var k in data) {
            if (k in myState && (data[k] && data[k].constructor === Object) && (myState[k] && myState[k].constructor === Object)) {
                if (!myState.hasOwnProperty(k))
                    myState[k] = Object.create(myState[k]);
                this.key(k).patch(data[k]);
                if (this.eventOutput)
                    this.eventOutput.emit('change', {
                        id: k,
                        value: this.key(k).value()
                    });
            } else
                this.set(k, data[k]);
        }
    }
    return this;
};
OptionsManager.prototype.setOptions = OptionsManager.prototype.patch;
OptionsManager.prototype.key = function key(identifier) {
    var result = new OptionsManager(this._value[identifier]);
    if (!(result._value instanceof Object) || result._value instanceof Array)
        result._value = {};
    return result;
};
OptionsManager.prototype.get = function get(key) {
    return key ? this._value[key] : this._value;
};
OptionsManager.prototype.getOptions = OptionsManager.prototype.get;
OptionsManager.prototype.set = function set(key, value) {
    var originalValue = this.get(key);
    this._value[key] = value;
    if (this.eventOutput && value !== originalValue)
        this.eventOutput.emit('change', {
            id: key,
            value: value
        });
    return this;
};
OptionsManager.prototype.on = function on() {
    _createEventOutput.call(this);
    return this.on.apply(this, arguments);
};
OptionsManager.prototype.removeListener = function removeListener() {
    _createEventOutput.call(this);
    return this.removeListener.apply(this, arguments);
};
OptionsManager.prototype.pipe = function pipe() {
    _createEventOutput.call(this);
    return this.pipe.apply(this, arguments);
};
OptionsManager.prototype.unpipe = function unpipe() {
    _createEventOutput.call(this);
    return this.unpipe.apply(this, arguments);
};
module.exports = OptionsManager;
},{"./EventHandler":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/core/EventHandler.js"}],"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/core/RenderNode.js":[function(require,module,exports){
var Entity = require('./Entity');
var SpecParser = require('./SpecParser');
function RenderNode(object) {
    this._object = null;
    this._child = null;
    this._hasMultipleChildren = false;
    this._isRenderable = false;
    this._isModifier = false;
    this._resultCache = {};
    this._prevResults = {};
    this._childResult = null;
    if (object)
        this.set(object);
}
RenderNode.prototype.add = function add(child) {
    var childNode = child instanceof RenderNode ? child : new RenderNode(child);
    if (this._child instanceof Array)
        this._child.push(childNode);
    else if (this._child) {
        this._child = [
            this._child,
            childNode
        ];
        this._hasMultipleChildren = true;
        this._childResult = [];
    } else
        this._child = childNode;
    return childNode;
};
RenderNode.prototype.get = function get() {
    return this._object || (this._hasMultipleChildren ? null : this._child ? this._child.get() : null);
};
RenderNode.prototype.set = function set(child) {
    this._childResult = null;
    this._hasMultipleChildren = false;
    this._isRenderable = child.render ? true : false;
    this._isModifier = child.modify ? true : false;
    this._object = child;
    this._child = null;
    if (child instanceof RenderNode)
        return child;
    else
        return this;
};
RenderNode.prototype.getSize = function getSize() {
    var result = null;
    var target = this.get();
    if (target && target.getSize)
        result = target.getSize();
    if (!result && this._child && this._child.getSize)
        result = this._child.getSize();
    return result;
};
function _applyCommit(spec, context, cacheStorage) {
    var result = SpecParser.parse(spec, context);
    var keys = Object.keys(result);
    for (var i = 0; i < keys.length; i++) {
        var id = keys[i];
        var childNode = Entity.get(id);
        var commitParams = result[id];
        commitParams.allocator = context.allocator;
        var commitResult = childNode.commit(commitParams);
        if (commitResult)
            _applyCommit(commitResult, context, cacheStorage);
        else
            cacheStorage[id] = commitParams;
    }
}
RenderNode.prototype.commit = function commit(context) {
    var prevKeys = Object.keys(this._prevResults);
    for (var i = 0; i < prevKeys.length; i++) {
        var id = prevKeys[i];
        if (this._resultCache[id] === undefined) {
            var object = Entity.get(id);
            if (object.cleanup)
                object.cleanup(context.allocator);
        }
    }
    this._prevResults = this._resultCache;
    this._resultCache = {};
    _applyCommit(this.render(), context, this._resultCache);
};
RenderNode.prototype.render = function render() {
    if (this._isRenderable)
        return this._object.render();
    var result = null;
    if (this._hasMultipleChildren) {
        result = this._childResult;
        var children = this._child;
        for (var i = 0; i < children.length; i++) {
            result[i] = children[i].render();
        }
    } else if (this._child)
        result = this._child.render();
    return this._isModifier ? this._object.modify(result) : result;
};
module.exports = RenderNode;
},{"./Entity":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/core/Entity.js","./SpecParser":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/core/SpecParser.js"}],"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/core/SpecParser.js":[function(require,module,exports){
var Transform = require('./Transform');
function SpecParser() {
    this.result = {};
}
SpecParser._instance = new SpecParser();
SpecParser.parse = function parse(spec, context) {
    return SpecParser._instance.parse(spec, context);
};
SpecParser.prototype.parse = function parse(spec, context) {
    this.reset();
    this._parseSpec(spec, context, Transform.identity);
    return this.result;
};
SpecParser.prototype.reset = function reset() {
    this.result = {};
};
function _vecInContext(v, m) {
    return [
        v[0] * m[0] + v[1] * m[4] + v[2] * m[8],
        v[0] * m[1] + v[1] * m[5] + v[2] * m[9],
        v[0] * m[2] + v[1] * m[6] + v[2] * m[10]
    ];
}
var _zeroZero = [
        0,
        0
    ];
SpecParser.prototype._parseSpec = function _parseSpec(spec, parentContext, sizeContext) {
    var id;
    var target;
    var transform;
    var opacity;
    var origin;
    var align;
    var size;
    if (typeof spec === 'number') {
        id = spec;
        transform = parentContext.transform;
        align = parentContext.align || _zeroZero;
        if (parentContext.size && align && (align[0] || align[1])) {
            var alignAdjust = [
                    align[0] * parentContext.size[0],
                    align[1] * parentContext.size[1],
                    0
                ];
            transform = Transform.thenMove(transform, _vecInContext(alignAdjust, sizeContext));
        }
        this.result[id] = {
            transform: transform,
            opacity: parentContext.opacity,
            origin: parentContext.origin || _zeroZero,
            align: parentContext.align || _zeroZero,
            size: parentContext.size
        };
    } else if (!spec) {
        return;
    } else if (spec instanceof Array) {
        for (var i = 0; i < spec.length; i++) {
            this._parseSpec(spec[i], parentContext, sizeContext);
        }
    } else {
        target = spec.target;
        transform = parentContext.transform;
        opacity = parentContext.opacity;
        origin = parentContext.origin;
        align = parentContext.align;
        size = parentContext.size;
        var nextSizeContext = sizeContext;
        if (spec.opacity !== undefined)
            opacity = parentContext.opacity * spec.opacity;
        if (spec.transform)
            transform = Transform.multiply(parentContext.transform, spec.transform);
        if (spec.origin) {
            origin = spec.origin;
            nextSizeContext = parentContext.transform;
        }
        if (spec.align)
            align = spec.align;
        if (spec.size || spec.proportions) {
            var parentSize = size;
            size = [
                size[0],
                size[1]
            ];
            if (spec.size) {
                if (spec.size[0] !== undefined)
                    size[0] = spec.size[0];
                if (spec.size[1] !== undefined)
                    size[1] = spec.size[1];
            }
            if (spec.proportions) {
                if (spec.proportions[0] !== undefined)
                    size[0] = size[0] * spec.proportions[0];
                if (spec.proportions[1] !== undefined)
                    size[1] = size[1] * spec.proportions[1];
            }
            if (parentSize) {
                if (align && (align[0] || align[1]))
                    transform = Transform.thenMove(transform, _vecInContext([
                        align[0] * parentSize[0],
                        align[1] * parentSize[1],
                        0
                    ], sizeContext));
                if (origin && (origin[0] || origin[1]))
                    transform = Transform.moveThen([
                        -origin[0] * size[0],
                        -origin[1] * size[1],
                        0
                    ], transform);
            }
            nextSizeContext = parentContext.transform;
            origin = null;
            align = null;
        }
        this._parseSpec(target, {
            transform: transform,
            opacity: opacity,
            origin: origin,
            align: align,
            size: size
        }, nextSizeContext);
    }
};
module.exports = SpecParser;
},{"./Transform":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/core/Transform.js"}],"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/core/Surface.js":[function(require,module,exports){
var ElementOutput = require('./ElementOutput');
function Surface(options) {
    ElementOutput.call(this);
    this.options = {};
    this.properties = {};
    this.attributes = {};
    this.content = '';
    this.classList = [];
    this.size = null;
    this._classesDirty = true;
    this._stylesDirty = true;
    this._attributesDirty = true;
    this._sizeDirty = true;
    this._contentDirty = true;
    this._trueSizeCheck = true;
    this._dirtyClasses = [];
    if (options)
        this.setOptions(options);
    this._currentTarget = null;
}
Surface.prototype = Object.create(ElementOutput.prototype);
Surface.prototype.constructor = Surface;
Surface.prototype.elementType = 'div';
Surface.prototype.elementClass = 'famous-surface';
Surface.prototype.setAttributes = function setAttributes(attributes) {
    for (var n in attributes) {
        if (n === 'style')
            throw new Error('Cannot set styles via "setAttributes" as it will break Famo.us.  Use "setProperties" instead.');
        this.attributes[n] = attributes[n];
    }
    this._attributesDirty = true;
};
Surface.prototype.getAttributes = function getAttributes() {
    return this.attributes;
};
Surface.prototype.setProperties = function setProperties(properties) {
    for (var n in properties) {
        this.properties[n] = properties[n];
    }
    this._stylesDirty = true;
    return this;
};
Surface.prototype.getProperties = function getProperties() {
    return this.properties;
};
Surface.prototype.addClass = function addClass(className) {
    if (this.classList.indexOf(className) < 0) {
        this.classList.push(className);
        this._classesDirty = true;
    }
    return this;
};
Surface.prototype.removeClass = function removeClass(className) {
    var i = this.classList.indexOf(className);
    if (i >= 0) {
        this._dirtyClasses.push(this.classList.splice(i, 1)[0]);
        this._classesDirty = true;
    }
    return this;
};
Surface.prototype.toggleClass = function toggleClass(className) {
    var i = this.classList.indexOf(className);
    if (i >= 0) {
        this.removeClass(className);
    } else {
        this.addClass(className);
    }
    return this;
};
Surface.prototype.setClasses = function setClasses(classList) {
    var i = 0;
    var removal = [];
    for (i = 0; i < this.classList.length; i++) {
        if (classList.indexOf(this.classList[i]) < 0)
            removal.push(this.classList[i]);
    }
    for (i = 0; i < removal.length; i++)
        this.removeClass(removal[i]);
    for (i = 0; i < classList.length; i++)
        this.addClass(classList[i]);
    return this;
};
Surface.prototype.getClassList = function getClassList() {
    return this.classList;
};
Surface.prototype.setContent = function setContent(content) {
    if (this.content !== content) {
        this.content = content;
        this._contentDirty = true;
    }
    return this;
};
Surface.prototype.getContent = function getContent() {
    return this.content;
};
Surface.prototype.setOptions = function setOptions(options) {
    if (options.size)
        this.setSize(options.size);
    if (options.classes)
        this.setClasses(options.classes);
    if (options.properties)
        this.setProperties(options.properties);
    if (options.attributes)
        this.setAttributes(options.attributes);
    if (options.content)
        this.setContent(options.content);
    return this;
};
function _cleanupClasses(target) {
    for (var i = 0; i < this._dirtyClasses.length; i++)
        target.classList.remove(this._dirtyClasses[i]);
    this._dirtyClasses = [];
}
function _applyStyles(target) {
    for (var n in this.properties) {
        target.style[n] = this.properties[n];
    }
}
function _cleanupStyles(target) {
    for (var n in this.properties) {
        target.style[n] = '';
    }
}
function _applyAttributes(target) {
    for (var n in this.attributes) {
        target.setAttribute(n, this.attributes[n]);
    }
}
function _cleanupAttributes(target) {
    for (var n in this.attributes) {
        target.removeAttribute(n);
    }
}
function _xyNotEquals(a, b) {
    return a && b ? a[0] !== b[0] || a[1] !== b[1] : a !== b;
}
Surface.prototype.setup = function setup(allocator) {
    var target = allocator.allocate(this.elementType);
    if (this.elementClass) {
        if (this.elementClass instanceof Array) {
            for (var i = 0; i < this.elementClass.length; i++) {
                target.classList.add(this.elementClass[i]);
            }
        } else {
            target.classList.add(this.elementClass);
        }
    }
    target.style.display = '';
    this.attach(target);
    this._opacity = null;
    this._currentTarget = target;
    this._stylesDirty = true;
    this._classesDirty = true;
    this._attributesDirty = true;
    this._sizeDirty = true;
    this._contentDirty = true;
    this._originDirty = true;
    this._transformDirty = true;
};
Surface.prototype.commit = function commit(context) {
    if (!this._currentTarget)
        this.setup(context.allocator);
    var target = this._currentTarget;
    var size = context.size;
    if (this._classesDirty) {
        _cleanupClasses.call(this, target);
        var classList = this.getClassList();
        for (var i = 0; i < classList.length; i++)
            target.classList.add(classList[i]);
        this._classesDirty = false;
        this._trueSizeCheck = true;
    }
    if (this._stylesDirty) {
        _applyStyles.call(this, target);
        this._stylesDirty = false;
        this._trueSizeCheck = true;
    }
    if (this._attributesDirty) {
        _applyAttributes.call(this, target);
        this._attributesDirty = false;
        this._trueSizeCheck = true;
    }
    if (this.size) {
        var origSize = context.size;
        size = [
            this.size[0],
            this.size[1]
        ];
        if (size[0] === undefined)
            size[0] = origSize[0];
        if (size[1] === undefined)
            size[1] = origSize[1];
        if (size[0] === true || size[1] === true) {
            if (size[0] === true && (this._trueSizeCheck || this._size[0] === 0)) {
                var width = target.offsetWidth;
                if (this._size && this._size[0] !== width) {
                    this._size[0] = width;
                    this._sizeDirty = true;
                }
                size[0] = width;
            } else {
                if (this._size)
                    size[0] = this._size[0];
            }
            if (size[1] === true && (this._trueSizeCheck || this._size[1] === 0)) {
                var height = target.offsetHeight;
                if (this._size && this._size[1] !== height) {
                    this._size[1] = height;
                    this._sizeDirty = true;
                }
                size[1] = height;
            } else {
                if (this._size)
                    size[1] = this._size[1];
            }
            this._trueSizeCheck = false;
        }
    }
    if (_xyNotEquals(this._size, size)) {
        if (!this._size)
            this._size = [
                0,
                0
            ];
        this._size[0] = size[0];
        this._size[1] = size[1];
        this._sizeDirty = true;
    }
    if (this._sizeDirty) {
        if (this._size) {
            target.style.width = this.size && this.size[0] === true ? '' : this._size[0] + 'px';
            target.style.height = this.size && this.size[1] === true ? '' : this._size[1] + 'px';
        }
        this._eventOutput.emit('resize');
    }
    if (this._contentDirty) {
        this.deploy(target);
        this._eventOutput.emit('deploy');
        this._contentDirty = false;
        this._trueSizeCheck = true;
    }
    ElementOutput.prototype.commit.call(this, context);
};
Surface.prototype.cleanup = function cleanup(allocator) {
    var i = 0;
    var target = this._currentTarget;
    this._eventOutput.emit('recall');
    this.recall(target);
    target.style.display = 'none';
    target.style.opacity = '';
    target.style.width = '';
    target.style.height = '';
    _cleanupStyles.call(this, target);
    _cleanupAttributes.call(this, target);
    var classList = this.getClassList();
    _cleanupClasses.call(this, target);
    for (i = 0; i < classList.length; i++)
        target.classList.remove(classList[i]);
    if (this.elementClass) {
        if (this.elementClass instanceof Array) {
            for (i = 0; i < this.elementClass.length; i++) {
                target.classList.remove(this.elementClass[i]);
            }
        } else {
            target.classList.remove(this.elementClass);
        }
    }
    this.detach(target);
    this._currentTarget = null;
    allocator.deallocate(target);
};
Surface.prototype.deploy = function deploy(target) {
    var content = this.getContent();
    if (content instanceof Node) {
        while (target.hasChildNodes())
            target.removeChild(target.firstChild);
        target.appendChild(content);
    } else
        target.innerHTML = content;
};
Surface.prototype.recall = function recall(target) {
    var df = document.createDocumentFragment();
    while (target.hasChildNodes())
        df.appendChild(target.firstChild);
    this.setContent(df);
};
Surface.prototype.getSize = function getSize() {
    return this._size ? this._size : this.size;
};
Surface.prototype.setSize = function setSize(size) {
    this.size = size ? [
        size[0],
        size[1]
    ] : null;
    this._sizeDirty = true;
    return this;
};
module.exports = Surface;
},{"./ElementOutput":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/core/ElementOutput.js"}],"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/core/Transform.js":[function(require,module,exports){
var Transform = {};
Transform.precision = 0.000001;
Transform.identity = [
    1,
    0,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    0,
    1
];
Transform.multiply4x4 = function multiply4x4(a, b) {
    return [
        a[0] * b[0] + a[4] * b[1] + a[8] * b[2] + a[12] * b[3],
        a[1] * b[0] + a[5] * b[1] + a[9] * b[2] + a[13] * b[3],
        a[2] * b[0] + a[6] * b[1] + a[10] * b[2] + a[14] * b[3],
        a[3] * b[0] + a[7] * b[1] + a[11] * b[2] + a[15] * b[3],
        a[0] * b[4] + a[4] * b[5] + a[8] * b[6] + a[12] * b[7],
        a[1] * b[4] + a[5] * b[5] + a[9] * b[6] + a[13] * b[7],
        a[2] * b[4] + a[6] * b[5] + a[10] * b[6] + a[14] * b[7],
        a[3] * b[4] + a[7] * b[5] + a[11] * b[6] + a[15] * b[7],
        a[0] * b[8] + a[4] * b[9] + a[8] * b[10] + a[12] * b[11],
        a[1] * b[8] + a[5] * b[9] + a[9] * b[10] + a[13] * b[11],
        a[2] * b[8] + a[6] * b[9] + a[10] * b[10] + a[14] * b[11],
        a[3] * b[8] + a[7] * b[9] + a[11] * b[10] + a[15] * b[11],
        a[0] * b[12] + a[4] * b[13] + a[8] * b[14] + a[12] * b[15],
        a[1] * b[12] + a[5] * b[13] + a[9] * b[14] + a[13] * b[15],
        a[2] * b[12] + a[6] * b[13] + a[10] * b[14] + a[14] * b[15],
        a[3] * b[12] + a[7] * b[13] + a[11] * b[14] + a[15] * b[15]
    ];
};
Transform.multiply = function multiply(a, b) {
    return [
        a[0] * b[0] + a[4] * b[1] + a[8] * b[2],
        a[1] * b[0] + a[5] * b[1] + a[9] * b[2],
        a[2] * b[0] + a[6] * b[1] + a[10] * b[2],
        0,
        a[0] * b[4] + a[4] * b[5] + a[8] * b[6],
        a[1] * b[4] + a[5] * b[5] + a[9] * b[6],
        a[2] * b[4] + a[6] * b[5] + a[10] * b[6],
        0,
        a[0] * b[8] + a[4] * b[9] + a[8] * b[10],
        a[1] * b[8] + a[5] * b[9] + a[9] * b[10],
        a[2] * b[8] + a[6] * b[9] + a[10] * b[10],
        0,
        a[0] * b[12] + a[4] * b[13] + a[8] * b[14] + a[12],
        a[1] * b[12] + a[5] * b[13] + a[9] * b[14] + a[13],
        a[2] * b[12] + a[6] * b[13] + a[10] * b[14] + a[14],
        1
    ];
};
Transform.thenMove = function thenMove(m, t) {
    if (!t[2])
        t[2] = 0;
    return [
        m[0],
        m[1],
        m[2],
        0,
        m[4],
        m[5],
        m[6],
        0,
        m[8],
        m[9],
        m[10],
        0,
        m[12] + t[0],
        m[13] + t[1],
        m[14] + t[2],
        1
    ];
};
Transform.moveThen = function moveThen(v, m) {
    if (!v[2])
        v[2] = 0;
    var t0 = v[0] * m[0] + v[1] * m[4] + v[2] * m[8];
    var t1 = v[0] * m[1] + v[1] * m[5] + v[2] * m[9];
    var t2 = v[0] * m[2] + v[1] * m[6] + v[2] * m[10];
    return Transform.thenMove(m, [
        t0,
        t1,
        t2
    ]);
};
Transform.translate = function translate(x, y, z) {
    if (z === undefined)
        z = 0;
    return [
        1,
        0,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        0,
        1,
        0,
        x,
        y,
        z,
        1
    ];
};
Transform.thenScale = function thenScale(m, s) {
    return [
        s[0] * m[0],
        s[1] * m[1],
        s[2] * m[2],
        0,
        s[0] * m[4],
        s[1] * m[5],
        s[2] * m[6],
        0,
        s[0] * m[8],
        s[1] * m[9],
        s[2] * m[10],
        0,
        s[0] * m[12],
        s[1] * m[13],
        s[2] * m[14],
        1
    ];
};
Transform.scale = function scale(x, y, z) {
    if (z === undefined)
        z = 1;
    if (y === undefined)
        y = x;
    return [
        x,
        0,
        0,
        0,
        0,
        y,
        0,
        0,
        0,
        0,
        z,
        0,
        0,
        0,
        0,
        1
    ];
};
Transform.rotateX = function rotateX(theta) {
    var cosTheta = Math.cos(theta);
    var sinTheta = Math.sin(theta);
    return [
        1,
        0,
        0,
        0,
        0,
        cosTheta,
        sinTheta,
        0,
        0,
        -sinTheta,
        cosTheta,
        0,
        0,
        0,
        0,
        1
    ];
};
Transform.rotateY = function rotateY(theta) {
    var cosTheta = Math.cos(theta);
    var sinTheta = Math.sin(theta);
    return [
        cosTheta,
        0,
        -sinTheta,
        0,
        0,
        1,
        0,
        0,
        sinTheta,
        0,
        cosTheta,
        0,
        0,
        0,
        0,
        1
    ];
};
Transform.rotateZ = function rotateZ(theta) {
    var cosTheta = Math.cos(theta);
    var sinTheta = Math.sin(theta);
    return [
        cosTheta,
        sinTheta,
        0,
        0,
        -sinTheta,
        cosTheta,
        0,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        0,
        1
    ];
};
Transform.rotate = function rotate(phi, theta, psi) {
    var cosPhi = Math.cos(phi);
    var sinPhi = Math.sin(phi);
    var cosTheta = Math.cos(theta);
    var sinTheta = Math.sin(theta);
    var cosPsi = Math.cos(psi);
    var sinPsi = Math.sin(psi);
    var result = [
            cosTheta * cosPsi,
            cosPhi * sinPsi + sinPhi * sinTheta * cosPsi,
            sinPhi * sinPsi - cosPhi * sinTheta * cosPsi,
            0,
            -cosTheta * sinPsi,
            cosPhi * cosPsi - sinPhi * sinTheta * sinPsi,
            sinPhi * cosPsi + cosPhi * sinTheta * sinPsi,
            0,
            sinTheta,
            -sinPhi * cosTheta,
            cosPhi * cosTheta,
            0,
            0,
            0,
            0,
            1
        ];
    return result;
};
Transform.rotateAxis = function rotateAxis(v, theta) {
    var sinTheta = Math.sin(theta);
    var cosTheta = Math.cos(theta);
    var verTheta = 1 - cosTheta;
    var xxV = v[0] * v[0] * verTheta;
    var xyV = v[0] * v[1] * verTheta;
    var xzV = v[0] * v[2] * verTheta;
    var yyV = v[1] * v[1] * verTheta;
    var yzV = v[1] * v[2] * verTheta;
    var zzV = v[2] * v[2] * verTheta;
    var xs = v[0] * sinTheta;
    var ys = v[1] * sinTheta;
    var zs = v[2] * sinTheta;
    var result = [
            xxV + cosTheta,
            xyV + zs,
            xzV - ys,
            0,
            xyV - zs,
            yyV + cosTheta,
            yzV + xs,
            0,
            xzV + ys,
            yzV - xs,
            zzV + cosTheta,
            0,
            0,
            0,
            0,
            1
        ];
    return result;
};
Transform.aboutOrigin = function aboutOrigin(v, m) {
    var t0 = v[0] - (v[0] * m[0] + v[1] * m[4] + v[2] * m[8]);
    var t1 = v[1] - (v[0] * m[1] + v[1] * m[5] + v[2] * m[9]);
    var t2 = v[2] - (v[0] * m[2] + v[1] * m[6] + v[2] * m[10]);
    return Transform.thenMove(m, [
        t0,
        t1,
        t2
    ]);
};
Transform.skew = function skew(phi, theta, psi) {
    return [
        1,
        Math.tan(theta),
        0,
        0,
        Math.tan(psi),
        1,
        0,
        0,
        0,
        Math.tan(phi),
        1,
        0,
        0,
        0,
        0,
        1
    ];
};
Transform.skewX = function skewX(angle) {
    return [
        1,
        0,
        0,
        0,
        Math.tan(angle),
        1,
        0,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        0,
        1
    ];
};
Transform.skewY = function skewY(angle) {
    return [
        1,
        Math.tan(angle),
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        0,
        1
    ];
};
Transform.perspective = function perspective(focusZ) {
    return [
        1,
        0,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        0,
        1,
        -1 / focusZ,
        0,
        0,
        0,
        1
    ];
};
Transform.getTranslate = function getTranslate(m) {
    return [
        m[12],
        m[13],
        m[14]
    ];
};
Transform.inverse = function inverse(m) {
    var c0 = m[5] * m[10] - m[6] * m[9];
    var c1 = m[4] * m[10] - m[6] * m[8];
    var c2 = m[4] * m[9] - m[5] * m[8];
    var c4 = m[1] * m[10] - m[2] * m[9];
    var c5 = m[0] * m[10] - m[2] * m[8];
    var c6 = m[0] * m[9] - m[1] * m[8];
    var c8 = m[1] * m[6] - m[2] * m[5];
    var c9 = m[0] * m[6] - m[2] * m[4];
    var c10 = m[0] * m[5] - m[1] * m[4];
    var detM = m[0] * c0 - m[1] * c1 + m[2] * c2;
    var invD = 1 / detM;
    var result = [
            invD * c0,
            -invD * c4,
            invD * c8,
            0,
            -invD * c1,
            invD * c5,
            -invD * c9,
            0,
            invD * c2,
            -invD * c6,
            invD * c10,
            0,
            0,
            0,
            0,
            1
        ];
    result[12] = -m[12] * result[0] - m[13] * result[4] - m[14] * result[8];
    result[13] = -m[12] * result[1] - m[13] * result[5] - m[14] * result[9];
    result[14] = -m[12] * result[2] - m[13] * result[6] - m[14] * result[10];
    return result;
};
Transform.transpose = function transpose(m) {
    return [
        m[0],
        m[4],
        m[8],
        m[12],
        m[1],
        m[5],
        m[9],
        m[13],
        m[2],
        m[6],
        m[10],
        m[14],
        m[3],
        m[7],
        m[11],
        m[15]
    ];
};
function _normSquared(v) {
    return v.length === 2 ? v[0] * v[0] + v[1] * v[1] : v[0] * v[0] + v[1] * v[1] + v[2] * v[2];
}
function _norm(v) {
    return Math.sqrt(_normSquared(v));
}
function _sign(n) {
    return n < 0 ? -1 : 1;
}
Transform.interpret = function interpret(M) {
    var x = [
            M[0],
            M[1],
            M[2]
        ];
    var sgn = _sign(x[0]);
    var xNorm = _norm(x);
    var v = [
            x[0] + sgn * xNorm,
            x[1],
            x[2]
        ];
    var mult = 2 / _normSquared(v);
    if (mult >= Infinity) {
        return {
            translate: Transform.getTranslate(M),
            rotate: [
                0,
                0,
                0
            ],
            scale: [
                0,
                0,
                0
            ],
            skew: [
                0,
                0,
                0
            ]
        };
    }
    var Q1 = [
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            1
        ];
    Q1[0] = 1 - mult * v[0] * v[0];
    Q1[5] = 1 - mult * v[1] * v[1];
    Q1[10] = 1 - mult * v[2] * v[2];
    Q1[1] = -mult * v[0] * v[1];
    Q1[2] = -mult * v[0] * v[2];
    Q1[6] = -mult * v[1] * v[2];
    Q1[4] = Q1[1];
    Q1[8] = Q1[2];
    Q1[9] = Q1[6];
    var MQ1 = Transform.multiply(Q1, M);
    var x2 = [
            MQ1[5],
            MQ1[6]
        ];
    var sgn2 = _sign(x2[0]);
    var x2Norm = _norm(x2);
    var v2 = [
            x2[0] + sgn2 * x2Norm,
            x2[1]
        ];
    var mult2 = 2 / _normSquared(v2);
    var Q2 = [
            1,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            1
        ];
    Q2[5] = 1 - mult2 * v2[0] * v2[0];
    Q2[10] = 1 - mult2 * v2[1] * v2[1];
    Q2[6] = -mult2 * v2[0] * v2[1];
    Q2[9] = Q2[6];
    var Q = Transform.multiply(Q2, Q1);
    var R = Transform.multiply(Q, M);
    var remover = Transform.scale(R[0] < 0 ? -1 : 1, R[5] < 0 ? -1 : 1, R[10] < 0 ? -1 : 1);
    R = Transform.multiply(R, remover);
    Q = Transform.multiply(remover, Q);
    var result = {};
    result.translate = Transform.getTranslate(M);
    result.rotate = [
        Math.atan2(-Q[6], Q[10]),
        Math.asin(Q[2]),
        Math.atan2(-Q[1], Q[0])
    ];
    if (!result.rotate[0]) {
        result.rotate[0] = 0;
        result.rotate[2] = Math.atan2(Q[4], Q[5]);
    }
    result.scale = [
        R[0],
        R[5],
        R[10]
    ];
    result.skew = [
        Math.atan2(R[9], result.scale[2]),
        Math.atan2(R[8], result.scale[2]),
        Math.atan2(R[4], result.scale[0])
    ];
    if (Math.abs(result.rotate[0]) + Math.abs(result.rotate[2]) > 1.5 * Math.PI) {
        result.rotate[1] = Math.PI - result.rotate[1];
        if (result.rotate[1] > Math.PI)
            result.rotate[1] -= 2 * Math.PI;
        if (result.rotate[1] < -Math.PI)
            result.rotate[1] += 2 * Math.PI;
        if (result.rotate[0] < 0)
            result.rotate[0] += Math.PI;
        else
            result.rotate[0] -= Math.PI;
        if (result.rotate[2] < 0)
            result.rotate[2] += Math.PI;
        else
            result.rotate[2] -= Math.PI;
    }
    return result;
};
Transform.average = function average(M1, M2, t) {
    t = t === undefined ? 0.5 : t;
    var specM1 = Transform.interpret(M1);
    var specM2 = Transform.interpret(M2);
    var specAvg = {
            translate: [
                0,
                0,
                0
            ],
            rotate: [
                0,
                0,
                0
            ],
            scale: [
                0,
                0,
                0
            ],
            skew: [
                0,
                0,
                0
            ]
        };
    for (var i = 0; i < 3; i++) {
        specAvg.translate[i] = (1 - t) * specM1.translate[i] + t * specM2.translate[i];
        specAvg.rotate[i] = (1 - t) * specM1.rotate[i] + t * specM2.rotate[i];
        specAvg.scale[i] = (1 - t) * specM1.scale[i] + t * specM2.scale[i];
        specAvg.skew[i] = (1 - t) * specM1.skew[i] + t * specM2.skew[i];
    }
    return Transform.build(specAvg);
};
Transform.build = function build(spec) {
    var scaleMatrix = Transform.scale(spec.scale[0], spec.scale[1], spec.scale[2]);
    var skewMatrix = Transform.skew(spec.skew[0], spec.skew[1], spec.skew[2]);
    var rotateMatrix = Transform.rotate(spec.rotate[0], spec.rotate[1], spec.rotate[2]);
    return Transform.thenMove(Transform.multiply(Transform.multiply(rotateMatrix, skewMatrix), scaleMatrix), spec.translate);
};
Transform.equals = function equals(a, b) {
    return !Transform.notEquals(a, b);
};
Transform.notEquals = function notEquals(a, b) {
    if (a === b)
        return false;
    return !(a && b) || a[12] !== b[12] || a[13] !== b[13] || a[14] !== b[14] || a[0] !== b[0] || a[1] !== b[1] || a[2] !== b[2] || a[4] !== b[4] || a[5] !== b[5] || a[6] !== b[6] || a[8] !== b[8] || a[9] !== b[9] || a[10] !== b[10];
};
Transform.normalizeRotation = function normalizeRotation(rotation) {
    var result = rotation.slice(0);
    if (result[0] === Math.PI * 0.5 || result[0] === -Math.PI * 0.5) {
        result[0] = -result[0];
        result[1] = Math.PI - result[1];
        result[2] -= Math.PI;
    }
    if (result[0] > Math.PI * 0.5) {
        result[0] = result[0] - Math.PI;
        result[1] = Math.PI - result[1];
        result[2] -= Math.PI;
    }
    if (result[0] < -Math.PI * 0.5) {
        result[0] = result[0] + Math.PI;
        result[1] = -Math.PI - result[1];
        result[2] -= Math.PI;
    }
    while (result[1] < -Math.PI)
        result[1] += 2 * Math.PI;
    while (result[1] >= Math.PI)
        result[1] -= 2 * Math.PI;
    while (result[2] < -Math.PI)
        result[2] += 2 * Math.PI;
    while (result[2] >= Math.PI)
        result[2] -= 2 * Math.PI;
    return result;
};
Transform.inFront = [
    1,
    0,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    0.001,
    1
];
Transform.behind = [
    1,
    0,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    -0.001,
    1
];
module.exports = Transform;
},{}],"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/core/View.js":[function(require,module,exports){
var EventHandler = require('./EventHandler');
var OptionsManager = require('./OptionsManager');
var RenderNode = require('./RenderNode');
var Utility = require('../utilities/Utility');
function View(options) {
    this._node = new RenderNode();
    this._eventInput = new EventHandler();
    this._eventOutput = new EventHandler();
    EventHandler.setInputHandler(this, this._eventInput);
    EventHandler.setOutputHandler(this, this._eventOutput);
    this.options = Utility.clone(this.constructor.DEFAULT_OPTIONS || View.DEFAULT_OPTIONS);
    this._optionsManager = new OptionsManager(this.options);
    if (options)
        this.setOptions(options);
}
View.DEFAULT_OPTIONS = {};
View.prototype.getOptions = function getOptions(key) {
    return this._optionsManager.getOptions(key);
};
View.prototype.setOptions = function setOptions(options) {
    this._optionsManager.patch(options);
};
View.prototype.add = function add() {
    return this._node.add.apply(this._node, arguments);
};
View.prototype._add = View.prototype.add;
View.prototype.render = function render() {
    return this._node.render();
};
View.prototype.getSize = function getSize() {
    if (this._node && this._node.getSize) {
        return this._node.getSize.apply(this._node, arguments) || this.options.size;
    } else
        return this.options.size;
};
module.exports = View;
},{"../utilities/Utility":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/utilities/Utility.js","./EventHandler":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/core/EventHandler.js","./OptionsManager":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/core/OptionsManager.js","./RenderNode":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/core/RenderNode.js"}],"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/core/famous.css":[function(require,module,exports){
var css = "/* This Source Code Form is subject to the terms of the Mozilla Public\n * License, v. 2.0. If a copy of the MPL was not distributed with this\n * file, You can obtain one at http://mozilla.org/MPL/2.0/.\n *\n * Owner: mark@famo.us\n * @license MPL 2.0\n * @copyright Famous Industries, Inc. 2014\n */\n\n.famous-root {\n    width: 100%;\n    height: 100%;\n    margin: 0px;\n    padding: 0px;\n    overflow: hidden;\n    -webkit-transform-style: preserve-3d;\n    transform-style: preserve-3d;\n}\n\n.famous-container, .famous-group {\n    position: absolute;\n    top: 0px;\n    left: 0px;\n    bottom: 0px;\n    right: 0px;\n    overflow: visible;\n    -webkit-transform-style: preserve-3d;\n    transform-style: preserve-3d;\n    -webkit-backface-visibility: visible;\n    backface-visibility: visible;\n    pointer-events: none;\n}\n\n.famous-group {\n    width: 0px;\n    height: 0px;\n    margin: 0px;\n    padding: 0px;\n    -webkit-transform-style: preserve-3d;\n    transform-style: preserve-3d;\n}\n\n.famous-surface {\n    position: absolute;\n    -webkit-transform-origin: center center;\n    transform-origin: center center;\n    -webkit-backface-visibility: hidden;\n    backface-visibility: hidden;\n    -webkit-transform-style: preserve-3d;\n    transform-style: preserve-3d;\n    -webkit-box-sizing: border-box;\n    -moz-box-sizing: border-box;\n    box-sizing: border-box;\n    -webkit-tap-highlight-color: transparent;\n    pointer-events: auto;\n}\n\n.famous-container-group {\n    position: relative;\n    width: 100%;\n    height: 100%;\n}\n"; (require("/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/cssify"))(css); module.exports = css;
},{"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/cssify":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/cssify/browser.js"}],"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/inputs/GenericSync.js":[function(require,module,exports){
var EventHandler = require('../core/EventHandler');
function GenericSync(syncs, options) {
    this._eventInput = new EventHandler();
    this._eventOutput = new EventHandler();
    EventHandler.setInputHandler(this, this._eventInput);
    EventHandler.setOutputHandler(this, this._eventOutput);
    this._syncs = {};
    if (syncs)
        this.addSync(syncs);
    if (options)
        this.setOptions(options);
}
GenericSync.DIRECTION_X = 0;
GenericSync.DIRECTION_Y = 1;
GenericSync.DIRECTION_Z = 2;
var registry = {};
GenericSync.register = function register(syncObject) {
    for (var key in syncObject) {
        if (registry[key]) {
            if (registry[key] === syncObject[key])
                return;
            else
                throw new Error('this key is registered to a different sync class');
        } else
            registry[key] = syncObject[key];
    }
};
GenericSync.prototype.setOptions = function (options) {
    for (var key in this._syncs) {
        this._syncs[key].setOptions(options);
    }
};
GenericSync.prototype.pipeSync = function pipeToSync(key) {
    var sync = this._syncs[key];
    this._eventInput.pipe(sync);
    sync.pipe(this._eventOutput);
};
GenericSync.prototype.unpipeSync = function unpipeFromSync(key) {
    var sync = this._syncs[key];
    this._eventInput.unpipe(sync);
    sync.unpipe(this._eventOutput);
};
function _addSingleSync(key, options) {
    if (!registry[key])
        return;
    this._syncs[key] = new registry[key](options);
    this.pipeSync(key);
}
GenericSync.prototype.addSync = function addSync(syncs) {
    if (syncs instanceof Array)
        for (var i = 0; i < syncs.length; i++)
            _addSingleSync.call(this, syncs[i]);
    else if (syncs instanceof Object)
        for (var key in syncs)
            _addSingleSync.call(this, key, syncs[key]);
};
module.exports = GenericSync;
},{"../core/EventHandler":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/core/EventHandler.js"}],"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/inputs/MouseSync.js":[function(require,module,exports){
var EventHandler = require('../core/EventHandler');
var OptionsManager = require('../core/OptionsManager');
function MouseSync(options) {
    this.options = Object.create(MouseSync.DEFAULT_OPTIONS);
    this._optionsManager = new OptionsManager(this.options);
    if (options)
        this.setOptions(options);
    this._eventInput = new EventHandler();
    this._eventOutput = new EventHandler();
    EventHandler.setInputHandler(this, this._eventInput);
    EventHandler.setOutputHandler(this, this._eventOutput);
    this._eventInput.on('mousedown', _handleStart.bind(this));
    this._eventInput.on('mousemove', _handleMove.bind(this));
    this._eventInput.on('mouseup', _handleEnd.bind(this));
    if (this.options.propogate)
        this._eventInput.on('mouseleave', _handleLeave.bind(this));
    else
        this._eventInput.on('mouseleave', _handleEnd.bind(this));
    this._payload = {
        delta: null,
        position: null,
        velocity: null,
        clientX: 0,
        clientY: 0,
        offsetX: 0,
        offsetY: 0
    };
    this._positionHistory = [];
    this._position = null;
    this._prevCoord = undefined;
    this._prevTime = undefined;
    this._down = false;
    this._moved = false;
    this._documentActive = false;
}
MouseSync.DEFAULT_OPTIONS = {
    direction: undefined,
    rails: false,
    scale: 1,
    propogate: true,
    velocitySampleLength: 10,
    preventDefault: true
};
MouseSync.DIRECTION_X = 0;
MouseSync.DIRECTION_Y = 1;
var MINIMUM_TICK_TIME = 8;
function _handleStart(event) {
    var delta;
    var velocity;
    if (this.options.preventDefault)
        event.preventDefault();
    var x = event.clientX;
    var y = event.clientY;
    this._prevCoord = [
        x,
        y
    ];
    this._prevTime = Date.now();
    this._down = true;
    this._move = false;
    if (this.options.direction !== undefined) {
        this._position = 0;
        delta = 0;
        velocity = 0;
    } else {
        this._position = [
            0,
            0
        ];
        delta = [
            0,
            0
        ];
        velocity = [
            0,
            0
        ];
    }
    var payload = this._payload;
    payload.delta = delta;
    payload.position = this._position;
    payload.velocity = velocity;
    payload.clientX = x;
    payload.clientY = y;
    payload.offsetX = event.offsetX;
    payload.offsetY = event.offsetY;
    this._positionHistory.push({
        position: payload.position.slice ? payload.position.slice(0) : payload.position,
        time: this._prevTime
    });
    this._eventOutput.emit('start', payload);
    this._documentActive = false;
}
function _handleMove(event) {
    if (!this._prevCoord)
        return;
    var prevCoord = this._prevCoord;
    var prevTime = this._prevTime;
    var x = event.clientX;
    var y = event.clientY;
    var currTime = Date.now();
    var diffX = x - prevCoord[0];
    var diffY = y - prevCoord[1];
    if (this.options.rails) {
        if (Math.abs(diffX) > Math.abs(diffY))
            diffY = 0;
        else
            diffX = 0;
    }
    var diffTime = Math.max(currTime - this._positionHistory[0].time, MINIMUM_TICK_TIME);
    var scale = this.options.scale;
    var nextVel;
    var nextDelta;
    if (this.options.direction === MouseSync.DIRECTION_X) {
        nextDelta = scale * diffX;
        this._position += nextDelta;
        nextVel = scale * (this._position - this._positionHistory[0].position) / diffTime;
    } else if (this.options.direction === MouseSync.DIRECTION_Y) {
        nextDelta = scale * diffY;
        this._position += nextDelta;
        nextVel = scale * (this._position - this._positionHistory[0].position) / diffTime;
    } else {
        nextDelta = [
            scale * diffX,
            scale * diffY
        ];
        nextVel = [
            scale * (this._position[0] - this._positionHistory[0].position[0]) / diffTime,
            scale * (this._position[1] - this._positionHistory[0].position[1]) / diffTime
        ];
        this._position[0] += nextDelta[0];
        this._position[1] += nextDelta[1];
    }
    var payload = this._payload;
    payload.delta = nextDelta;
    payload.position = this._position;
    payload.velocity = nextVel;
    payload.clientX = x;
    payload.clientY = y;
    payload.offsetX = event.offsetX;
    payload.offsetY = event.offsetY;
    if (this._positionHistory.length === this.options.velocitySampleLength) {
        this._positionHistory.shift();
    }
    this._positionHistory.push({
        position: payload.position.slice ? payload.position.slice(0) : payload.position,
        time: currTime
    });
    this._eventOutput.emit('update', payload);
    this._prevCoord = [
        x,
        y
    ];
    this._prevTime = currTime;
    this._move = true;
}
function _handleEnd(event) {
    if (!this._down)
        return;
    this._eventOutput.emit('end', this._payload);
    this._prevCoord = undefined;
    this._prevTime = undefined;
    this._down = false;
    this._move = false;
    this._positionHistory = [];
}
function _handleLeave(event) {
    if (!this._down || !this._move)
        return;
    if (!this._documentActive) {
        var boundMove = _handleMove.bind(this);
        var boundEnd = function (event) {
                _handleEnd.call(this, event);
                document.removeEventListener('mousemove', boundMove);
                document.removeEventListener('mouseup', boundEnd);
            }.bind(this, event);
        document.addEventListener('mousemove', boundMove);
        document.addEventListener('mouseup', boundEnd);
        this._documentActive = true;
    }
}
MouseSync.prototype.getOptions = function getOptions() {
    return this.options;
};
MouseSync.prototype.setOptions = function setOptions(options) {
    return this._optionsManager.setOptions(options);
};
module.exports = MouseSync;
},{"../core/EventHandler":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/core/EventHandler.js","../core/OptionsManager":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/core/OptionsManager.js"}],"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/inputs/ScrollSync.js":[function(require,module,exports){
var EventHandler = require('../core/EventHandler');
var Engine = require('../core/Engine');
var OptionsManager = require('../core/OptionsManager');
function ScrollSync(options) {
    this.options = Object.create(ScrollSync.DEFAULT_OPTIONS);
    this._optionsManager = new OptionsManager(this.options);
    if (options)
        this.setOptions(options);
    this._payload = {
        delta: null,
        position: null,
        velocity: null,
        slip: true
    };
    this._eventInput = new EventHandler();
    this._eventOutput = new EventHandler();
    EventHandler.setInputHandler(this, this._eventInput);
    EventHandler.setOutputHandler(this, this._eventOutput);
    this._position = this.options.direction === undefined ? [
        0,
        0
    ] : 0;
    this._prevTime = undefined;
    this._prevVel = undefined;
    this._eventInput.on('mousewheel', _handleMove.bind(this));
    this._eventInput.on('wheel', _handleMove.bind(this));
    this._inProgress = false;
    this._loopBound = false;
}
ScrollSync.DEFAULT_OPTIONS = {
    direction: undefined,
    minimumEndSpeed: Infinity,
    rails: false,
    scale: 1,
    stallTime: 50,
    lineHeight: 40,
    preventDefault: true
};
ScrollSync.DIRECTION_X = 0;
ScrollSync.DIRECTION_Y = 1;
var MINIMUM_TICK_TIME = 8;
var _now = Date.now;
function _newFrame() {
    if (this._inProgress && _now() - this._prevTime > this.options.stallTime) {
        this._inProgress = false;
        var finalVel = Math.abs(this._prevVel) >= this.options.minimumEndSpeed ? this._prevVel : 0;
        var payload = this._payload;
        payload.position = this._position;
        payload.velocity = finalVel;
        payload.slip = true;
        this._eventOutput.emit('end', payload);
    }
}
function _handleMove(event) {
    if (this.options.preventDefault)
        event.preventDefault();
    if (!this._inProgress) {
        this._inProgress = true;
        this._position = this.options.direction === undefined ? [
            0,
            0
        ] : 0;
        payload = this._payload;
        payload.slip = true;
        payload.position = this._position;
        payload.clientX = event.clientX;
        payload.clientY = event.clientY;
        payload.offsetX = event.offsetX;
        payload.offsetY = event.offsetY;
        this._eventOutput.emit('start', payload);
        if (!this._loopBound) {
            Engine.on('prerender', _newFrame.bind(this));
            this._loopBound = true;
        }
    }
    var currTime = _now();
    var prevTime = this._prevTime || currTime;
    var diffX = event.wheelDeltaX !== undefined ? event.wheelDeltaX : -event.deltaX;
    var diffY = event.wheelDeltaY !== undefined ? event.wheelDeltaY : -event.deltaY;
    if (event.deltaMode === 1) {
        diffX *= this.options.lineHeight;
        diffY *= this.options.lineHeight;
    }
    if (this.options.rails) {
        if (Math.abs(diffX) > Math.abs(diffY))
            diffY = 0;
        else
            diffX = 0;
    }
    var diffTime = Math.max(currTime - prevTime, MINIMUM_TICK_TIME);
    var velX = diffX / diffTime;
    var velY = diffY / diffTime;
    var scale = this.options.scale;
    var nextVel;
    var nextDelta;
    if (this.options.direction === ScrollSync.DIRECTION_X) {
        nextDelta = scale * diffX;
        nextVel = scale * velX;
        this._position += nextDelta;
    } else if (this.options.direction === ScrollSync.DIRECTION_Y) {
        nextDelta = scale * diffY;
        nextVel = scale * velY;
        this._position += nextDelta;
    } else {
        nextDelta = [
            scale * diffX,
            scale * diffY
        ];
        nextVel = [
            scale * velX,
            scale * velY
        ];
        this._position[0] += nextDelta[0];
        this._position[1] += nextDelta[1];
    }
    var payload = this._payload;
    payload.delta = nextDelta;
    payload.velocity = nextVel;
    payload.position = this._position;
    payload.slip = true;
    this._eventOutput.emit('update', payload);
    this._prevTime = currTime;
    this._prevVel = nextVel;
}
ScrollSync.prototype.getOptions = function getOptions() {
    return this.options;
};
ScrollSync.prototype.setOptions = function setOptions(options) {
    return this._optionsManager.setOptions(options);
};
module.exports = ScrollSync;
},{"../core/Engine":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/core/Engine.js","../core/EventHandler":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/core/EventHandler.js","../core/OptionsManager":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/core/OptionsManager.js"}],"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/inputs/TouchSync.js":[function(require,module,exports){
var TouchTracker = require('./TouchTracker');
var EventHandler = require('../core/EventHandler');
var OptionsManager = require('../core/OptionsManager');
function TouchSync(options) {
    this.options = Object.create(TouchSync.DEFAULT_OPTIONS);
    this._optionsManager = new OptionsManager(this.options);
    if (options)
        this.setOptions(options);
    this._eventOutput = new EventHandler();
    this._touchTracker = new TouchTracker({ touchLimit: this.options.touchLimit });
    EventHandler.setOutputHandler(this, this._eventOutput);
    EventHandler.setInputHandler(this, this._touchTracker);
    this._touchTracker.on('trackstart', _handleStart.bind(this));
    this._touchTracker.on('trackmove', _handleMove.bind(this));
    this._touchTracker.on('trackend', _handleEnd.bind(this));
    this._payload = {
        delta: null,
        position: null,
        velocity: null,
        clientX: undefined,
        clientY: undefined,
        count: 0,
        touch: undefined
    };
    this._position = null;
}
TouchSync.DEFAULT_OPTIONS = {
    direction: undefined,
    rails: false,
    touchLimit: 1,
    velocitySampleLength: 10,
    scale: 1
};
TouchSync.DIRECTION_X = 0;
TouchSync.DIRECTION_Y = 1;
var MINIMUM_TICK_TIME = 8;
function _handleStart(data) {
    var velocity;
    var delta;
    if (this.options.direction !== undefined) {
        this._position = 0;
        velocity = 0;
        delta = 0;
    } else {
        this._position = [
            0,
            0
        ];
        velocity = [
            0,
            0
        ];
        delta = [
            0,
            0
        ];
    }
    var payload = this._payload;
    payload.delta = delta;
    payload.position = this._position;
    payload.velocity = velocity;
    payload.clientX = data.x;
    payload.clientY = data.y;
    payload.count = data.count;
    payload.touch = data.identifier;
    this._eventOutput.emit('start', payload);
}
function _handleMove(data) {
    var history = data.history;
    var currHistory = history[history.length - 1];
    var prevHistory = history[history.length - 2];
    var distantHistory = history[history.length - this.options.velocitySampleLength] ? history[history.length - this.options.velocitySampleLength] : history[history.length - 2];
    var distantTime = distantHistory.timestamp;
    var currTime = currHistory.timestamp;
    var diffX = currHistory.x - prevHistory.x;
    var diffY = currHistory.y - prevHistory.y;
    var velDiffX = currHistory.x - distantHistory.x;
    var velDiffY = currHistory.y - distantHistory.y;
    if (this.options.rails) {
        if (Math.abs(diffX) > Math.abs(diffY))
            diffY = 0;
        else
            diffX = 0;
        if (Math.abs(velDiffX) > Math.abs(velDiffY))
            velDiffY = 0;
        else
            velDiffX = 0;
    }
    var diffTime = Math.max(currTime - distantTime, MINIMUM_TICK_TIME);
    var velX = velDiffX / diffTime;
    var velY = velDiffY / diffTime;
    var scale = this.options.scale;
    var nextVel;
    var nextDelta;
    if (this.options.direction === TouchSync.DIRECTION_X) {
        nextDelta = scale * diffX;
        nextVel = scale * velX;
        this._position += nextDelta;
    } else if (this.options.direction === TouchSync.DIRECTION_Y) {
        nextDelta = scale * diffY;
        nextVel = scale * velY;
        this._position += nextDelta;
    } else {
        nextDelta = [
            scale * diffX,
            scale * diffY
        ];
        nextVel = [
            scale * velX,
            scale * velY
        ];
        this._position[0] += nextDelta[0];
        this._position[1] += nextDelta[1];
    }
    var payload = this._payload;
    payload.delta = nextDelta;
    payload.velocity = nextVel;
    payload.position = this._position;
    payload.clientX = data.x;
    payload.clientY = data.y;
    payload.count = data.count;
    payload.touch = data.identifier;
    this._eventOutput.emit('update', payload);
}
function _handleEnd(data) {
    this._payload.count = data.count;
    this._eventOutput.emit('end', this._payload);
}
TouchSync.prototype.setOptions = function setOptions(options) {
    return this._optionsManager.setOptions(options);
};
TouchSync.prototype.getOptions = function getOptions() {
    return this.options;
};
module.exports = TouchSync;
},{"../core/EventHandler":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/core/EventHandler.js","../core/OptionsManager":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/core/OptionsManager.js","./TouchTracker":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/inputs/TouchTracker.js"}],"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/inputs/TouchTracker.js":[function(require,module,exports){
var EventHandler = require('../core/EventHandler');
var _now = Date.now;
function _timestampTouch(touch, event, history) {
    return {
        x: touch.clientX,
        y: touch.clientY,
        identifier: touch.identifier,
        origin: event.origin,
        timestamp: _now(),
        count: event.touches.length,
        history: history
    };
}
function _handleStart(event) {
    if (event.touches.length > this.touchLimit)
        return;
    this.isTouched = true;
    for (var i = 0; i < event.changedTouches.length; i++) {
        var touch = event.changedTouches[i];
        var data = _timestampTouch(touch, event, null);
        this.eventOutput.emit('trackstart', data);
        if (!this.selective && !this.touchHistory[touch.identifier])
            this.track(data);
    }
}
function _handleMove(event) {
    if (event.touches.length > this.touchLimit)
        return;
    for (var i = 0; i < event.changedTouches.length; i++) {
        var touch = event.changedTouches[i];
        var history = this.touchHistory[touch.identifier];
        if (history) {
            var data = _timestampTouch(touch, event, history);
            this.touchHistory[touch.identifier].push(data);
            this.eventOutput.emit('trackmove', data);
        }
    }
}
function _handleEnd(event) {
    if (!this.isTouched)
        return;
    for (var i = 0; i < event.changedTouches.length; i++) {
        var touch = event.changedTouches[i];
        var history = this.touchHistory[touch.identifier];
        if (history) {
            var data = _timestampTouch(touch, event, history);
            this.eventOutput.emit('trackend', data);
            delete this.touchHistory[touch.identifier];
        }
    }
    this.isTouched = false;
}
function _handleUnpipe() {
    for (var i in this.touchHistory) {
        var history = this.touchHistory[i];
        this.eventOutput.emit('trackend', {
            touch: history[history.length - 1].touch,
            timestamp: Date.now(),
            count: 0,
            history: history
        });
        delete this.touchHistory[i];
    }
}
function TouchTracker(options) {
    this.selective = options.selective;
    this.touchLimit = options.touchLimit || 1;
    this.touchHistory = {};
    this.eventInput = new EventHandler();
    this.eventOutput = new EventHandler();
    EventHandler.setInputHandler(this, this.eventInput);
    EventHandler.setOutputHandler(this, this.eventOutput);
    this.eventInput.on('touchstart', _handleStart.bind(this));
    this.eventInput.on('touchmove', _handleMove.bind(this));
    this.eventInput.on('touchend', _handleEnd.bind(this));
    this.eventInput.on('touchcancel', _handleEnd.bind(this));
    this.eventInput.on('unpipe', _handleUnpipe.bind(this));
    this.isTouched = false;
}
TouchTracker.prototype.track = function track(data) {
    this.touchHistory[data.identifier] = [data];
};
module.exports = TouchTracker;
},{"../core/EventHandler":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/core/EventHandler.js"}],"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/math/Matrix.js":[function(require,module,exports){
var Vector = require('./Vector');
function Matrix(values) {
    this.values = values || [
        [
            1,
            0,
            0
        ],
        [
            0,
            1,
            0
        ],
        [
            0,
            0,
            1
        ]
    ];
    return this;
}
var _register = new Matrix();
var _vectorRegister = new Vector();
Matrix.prototype.get = function get() {
    return this.values;
};
Matrix.prototype.set = function set(values) {
    this.values = values;
};
Matrix.prototype.vectorMultiply = function vectorMultiply(v) {
    var M = this.get();
    var v0 = v.x;
    var v1 = v.y;
    var v2 = v.z;
    var M0 = M[0];
    var M1 = M[1];
    var M2 = M[2];
    var M00 = M0[0];
    var M01 = M0[1];
    var M02 = M0[2];
    var M10 = M1[0];
    var M11 = M1[1];
    var M12 = M1[2];
    var M20 = M2[0];
    var M21 = M2[1];
    var M22 = M2[2];
    return _vectorRegister.setXYZ(M00 * v0 + M01 * v1 + M02 * v2, M10 * v0 + M11 * v1 + M12 * v2, M20 * v0 + M21 * v1 + M22 * v2);
};
Matrix.prototype.multiply = function multiply(M2) {
    var M1 = this.get();
    var result = [[]];
    for (var i = 0; i < 3; i++) {
        result[i] = [];
        for (var j = 0; j < 3; j++) {
            var sum = 0;
            for (var k = 0; k < 3; k++) {
                sum += M1[i][k] * M2[k][j];
            }
            result[i][j] = sum;
        }
    }
    return _register.set(result);
};
Matrix.prototype.transpose = function transpose() {
    var result = [];
    var M = this.get();
    for (var row = 0; row < 3; row++) {
        for (var col = 0; col < 3; col++) {
            result[row][col] = M[col][row];
        }
    }
    return _register.set(result);
};
Matrix.prototype.clone = function clone() {
    var values = this.get();
    var M = [];
    for (var row = 0; row < 3; row++)
        M[row] = values[row].slice();
    return new Matrix(M);
};
module.exports = Matrix;
},{"./Vector":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/math/Vector.js"}],"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/math/Quaternion.js":[function(require,module,exports){
var Matrix = require('./Matrix');
function Quaternion(w, x, y, z) {
    if (arguments.length === 1)
        this.set(w);
    else {
        this.w = w !== undefined ? w : 1;
        this.x = x !== undefined ? x : 0;
        this.y = y !== undefined ? y : 0;
        this.z = z !== undefined ? z : 0;
    }
    return this;
}
var register = new Quaternion(1, 0, 0, 0);
Quaternion.prototype.add = function add(q) {
    return register.setWXYZ(this.w + q.w, this.x + q.x, this.y + q.y, this.z + q.z);
};
Quaternion.prototype.sub = function sub(q) {
    return register.setWXYZ(this.w - q.w, this.x - q.x, this.y - q.y, this.z - q.z);
};
Quaternion.prototype.scalarDivide = function scalarDivide(s) {
    return this.scalarMultiply(1 / s);
};
Quaternion.prototype.scalarMultiply = function scalarMultiply(s) {
    return register.setWXYZ(this.w * s, this.x * s, this.y * s, this.z * s);
};
Quaternion.prototype.multiply = function multiply(q) {
    var x1 = this.x;
    var y1 = this.y;
    var z1 = this.z;
    var w1 = this.w;
    var x2 = q.x;
    var y2 = q.y;
    var z2 = q.z;
    var w2 = q.w || 0;
    return register.setWXYZ(w1 * w2 - x1 * x2 - y1 * y2 - z1 * z2, x1 * w2 + x2 * w1 + y2 * z1 - y1 * z2, y1 * w2 + y2 * w1 + x1 * z2 - x2 * z1, z1 * w2 + z2 * w1 + x2 * y1 - x1 * y2);
};
var conj = new Quaternion(1, 0, 0, 0);
Quaternion.prototype.rotateVector = function rotateVector(v) {
    conj.set(this.conj());
    return register.set(this.multiply(v).multiply(conj));
};
Quaternion.prototype.inverse = function inverse() {
    return register.set(this.conj().scalarDivide(this.normSquared()));
};
Quaternion.prototype.negate = function negate() {
    return this.scalarMultiply(-1);
};
Quaternion.prototype.conj = function conj() {
    return register.setWXYZ(this.w, -this.x, -this.y, -this.z);
};
Quaternion.prototype.normalize = function normalize(length) {
    length = length === undefined ? 1 : length;
    return this.scalarDivide(length * this.norm());
};
Quaternion.prototype.makeFromAngleAndAxis = function makeFromAngleAndAxis(angle, v) {
    var n = v.normalize();
    var ha = angle * 0.5;
    var s = -Math.sin(ha);
    this.x = s * n.x;
    this.y = s * n.y;
    this.z = s * n.z;
    this.w = Math.cos(ha);
    return this;
};
Quaternion.prototype.setWXYZ = function setWXYZ(w, x, y, z) {
    register.clear();
    this.w = w;
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
};
Quaternion.prototype.set = function set(v) {
    if (v instanceof Array) {
        this.w = 0;
        this.x = v[0];
        this.y = v[1];
        this.z = v[2];
    } else {
        this.w = v.w;
        this.x = v.x;
        this.y = v.y;
        this.z = v.z;
    }
    if (this !== register)
        register.clear();
    return this;
};
Quaternion.prototype.put = function put(q) {
    q.set(register);
};
Quaternion.prototype.clone = function clone() {
    return new Quaternion(this);
};
Quaternion.prototype.clear = function clear() {
    this.w = 1;
    this.x = 0;
    this.y = 0;
    this.z = 0;
    return this;
};
Quaternion.prototype.isEqual = function isEqual(q) {
    return q.w === this.w && q.x === this.x && q.y === this.y && q.z === this.z;
};
Quaternion.prototype.dot = function dot(q) {
    return this.w * q.w + this.x * q.x + this.y * q.y + this.z * q.z;
};
Quaternion.prototype.normSquared = function normSquared() {
    return this.dot(this);
};
Quaternion.prototype.norm = function norm() {
    return Math.sqrt(this.normSquared());
};
Quaternion.prototype.isZero = function isZero() {
    return !(this.x || this.y || this.z);
};
Quaternion.prototype.getTransform = function getTransform() {
    var temp = this.normalize(1);
    var x = temp.x;
    var y = temp.y;
    var z = temp.z;
    var w = temp.w;
    return [
        1 - 2 * y * y - 2 * z * z,
        2 * x * y - 2 * z * w,
        2 * x * z + 2 * y * w,
        0,
        2 * x * y + 2 * z * w,
        1 - 2 * x * x - 2 * z * z,
        2 * y * z - 2 * x * w,
        0,
        2 * x * z - 2 * y * w,
        2 * y * z + 2 * x * w,
        1 - 2 * x * x - 2 * y * y,
        0,
        0,
        0,
        0,
        1
    ];
};
var matrixRegister = new Matrix();
Quaternion.prototype.getMatrix = function getMatrix() {
    var temp = this.normalize(1);
    var x = temp.x;
    var y = temp.y;
    var z = temp.z;
    var w = temp.w;
    return matrixRegister.set([
        [
            1 - 2 * y * y - 2 * z * z,
            2 * x * y + 2 * z * w,
            2 * x * z - 2 * y * w
        ],
        [
            2 * x * y - 2 * z * w,
            1 - 2 * x * x - 2 * z * z,
            2 * y * z + 2 * x * w
        ],
        [
            2 * x * z + 2 * y * w,
            2 * y * z - 2 * x * w,
            1 - 2 * x * x - 2 * y * y
        ]
    ]);
};
var epsilon = 0.00001;
Quaternion.prototype.slerp = function slerp(q, t) {
    var omega;
    var cosomega;
    var sinomega;
    var scaleFrom;
    var scaleTo;
    cosomega = this.dot(q);
    if (1 - cosomega > epsilon) {
        omega = Math.acos(cosomega);
        sinomega = Math.sin(omega);
        scaleFrom = Math.sin((1 - t) * omega) / sinomega;
        scaleTo = Math.sin(t * omega) / sinomega;
    } else {
        scaleFrom = 1 - t;
        scaleTo = t;
    }
    return register.set(this.scalarMultiply(scaleFrom / scaleTo).add(q).multiply(scaleTo));
};
module.exports = Quaternion;
},{"./Matrix":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/math/Matrix.js"}],"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/math/Vector.js":[function(require,module,exports){
function Vector(x, y, z) {
    if (arguments.length === 1 && x !== undefined)
        this.set(x);
    else {
        this.x = x || 0;
        this.y = y || 0;
        this.z = z || 0;
    }
    return this;
}
var _register = new Vector(0, 0, 0);
Vector.prototype.add = function add(v) {
    return _setXYZ.call(_register, this.x + v.x, this.y + v.y, this.z + v.z);
};
Vector.prototype.sub = function sub(v) {
    return _setXYZ.call(_register, this.x - v.x, this.y - v.y, this.z - v.z);
};
Vector.prototype.mult = function mult(r) {
    return _setXYZ.call(_register, r * this.x, r * this.y, r * this.z);
};
Vector.prototype.div = function div(r) {
    return this.mult(1 / r);
};
Vector.prototype.cross = function cross(v) {
    var x = this.x;
    var y = this.y;
    var z = this.z;
    var vx = v.x;
    var vy = v.y;
    var vz = v.z;
    return _setXYZ.call(_register, z * vy - y * vz, x * vz - z * vx, y * vx - x * vy);
};
Vector.prototype.equals = function equals(v) {
    return v.x === this.x && v.y === this.y && v.z === this.z;
};
Vector.prototype.rotateX = function rotateX(theta) {
    var x = this.x;
    var y = this.y;
    var z = this.z;
    var cosTheta = Math.cos(theta);
    var sinTheta = Math.sin(theta);
    return _setXYZ.call(_register, x, y * cosTheta - z * sinTheta, y * sinTheta + z * cosTheta);
};
Vector.prototype.rotateY = function rotateY(theta) {
    var x = this.x;
    var y = this.y;
    var z = this.z;
    var cosTheta = Math.cos(theta);
    var sinTheta = Math.sin(theta);
    return _setXYZ.call(_register, z * sinTheta + x * cosTheta, y, z * cosTheta - x * sinTheta);
};
Vector.prototype.rotateZ = function rotateZ(theta) {
    var x = this.x;
    var y = this.y;
    var z = this.z;
    var cosTheta = Math.cos(theta);
    var sinTheta = Math.sin(theta);
    return _setXYZ.call(_register, x * cosTheta - y * sinTheta, x * sinTheta + y * cosTheta, z);
};
Vector.prototype.dot = function dot(v) {
    return this.x * v.x + this.y * v.y + this.z * v.z;
};
Vector.prototype.normSquared = function normSquared() {
    return this.dot(this);
};
Vector.prototype.norm = function norm() {
    return Math.sqrt(this.normSquared());
};
Vector.prototype.normalize = function normalize(length) {
    if (arguments.length === 0)
        length = 1;
    var norm = this.norm();
    if (norm > 1e-7)
        return _setFromVector.call(_register, this.mult(length / norm));
    else
        return _setXYZ.call(_register, length, 0, 0);
};
Vector.prototype.clone = function clone() {
    return new Vector(this);
};
Vector.prototype.isZero = function isZero() {
    return !(this.x || this.y || this.z);
};
function _setXYZ(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
}
function _setFromArray(v) {
    return _setXYZ.call(this, v[0], v[1], v[2] || 0);
}
function _setFromVector(v) {
    return _setXYZ.call(this, v.x, v.y, v.z);
}
function _setFromNumber(x) {
    return _setXYZ.call(this, x, 0, 0);
}
Vector.prototype.set = function set(v) {
    if (v instanceof Array)
        return _setFromArray.call(this, v);
    if (typeof v === 'number')
        return _setFromNumber.call(this, v);
    return _setFromVector.call(this, v);
};
Vector.prototype.setXYZ = function (x, y, z) {
    return _setXYZ.apply(this, arguments);
};
Vector.prototype.set1D = function (x) {
    return _setFromNumber.call(this, x);
};
Vector.prototype.put = function put(v) {
    if (this === _register)
        _setFromVector.call(v, _register);
    else
        _setFromVector.call(v, this);
};
Vector.prototype.clear = function clear() {
    return _setXYZ.call(this, 0, 0, 0);
};
Vector.prototype.cap = function cap(cap) {
    if (cap === Infinity)
        return _setFromVector.call(_register, this);
    var norm = this.norm();
    if (norm > cap)
        return _setFromVector.call(_register, this.mult(cap / norm));
    else
        return _setFromVector.call(_register, this);
};
Vector.prototype.project = function project(n) {
    return n.mult(this.dot(n));
};
Vector.prototype.reflectAcross = function reflectAcross(n) {
    n.normalize().put(n);
    return _setFromVector(_register, this.sub(this.project(n).mult(2)));
};
Vector.prototype.get = function get() {
    return [
        this.x,
        this.y,
        this.z
    ];
};
Vector.prototype.get1D = function () {
    return this.x;
};
module.exports = Vector;
},{}],"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/modifiers/StateModifier.js":[function(require,module,exports){
var Modifier = require('../core/Modifier');
var Transform = require('../core/Transform');
var Transitionable = require('../transitions/Transitionable');
var TransitionableTransform = require('../transitions/TransitionableTransform');
function StateModifier(options) {
    this._transformState = new TransitionableTransform(Transform.identity);
    this._opacityState = new Transitionable(1);
    this._originState = new Transitionable([
        0,
        0
    ]);
    this._alignState = new Transitionable([
        0,
        0
    ]);
    this._sizeState = new Transitionable([
        0,
        0
    ]);
    this._proportionsState = new Transitionable([
        0,
        0
    ]);
    this._modifier = new Modifier({
        transform: this._transformState,
        opacity: this._opacityState,
        origin: null,
        align: null,
        size: null,
        proportions: null
    });
    this._hasOrigin = false;
    this._hasAlign = false;
    this._hasSize = false;
    this._hasProportions = false;
    if (options) {
        if (options.transform)
            this.setTransform(options.transform);
        if (options.opacity !== undefined)
            this.setOpacity(options.opacity);
        if (options.origin)
            this.setOrigin(options.origin);
        if (options.align)
            this.setAlign(options.align);
        if (options.size)
            this.setSize(options.size);
        if (options.proportions)
            this.setProportions(options.proportions);
    }
}
StateModifier.prototype.setTransform = function setTransform(transform, transition, callback) {
    this._transformState.set(transform, transition, callback);
    return this;
};
StateModifier.prototype.setOpacity = function setOpacity(opacity, transition, callback) {
    this._opacityState.set(opacity, transition, callback);
    return this;
};
StateModifier.prototype.setOrigin = function setOrigin(origin, transition, callback) {
    if (origin === null) {
        if (this._hasOrigin) {
            this._modifier.originFrom(null);
            this._hasOrigin = false;
        }
        return this;
    } else if (!this._hasOrigin) {
        this._hasOrigin = true;
        this._modifier.originFrom(this._originState);
    }
    this._originState.set(origin, transition, callback);
    return this;
};
StateModifier.prototype.setAlign = function setOrigin(align, transition, callback) {
    if (align === null) {
        if (this._hasAlign) {
            this._modifier.alignFrom(null);
            this._hasAlign = false;
        }
        return this;
    } else if (!this._hasAlign) {
        this._hasAlign = true;
        this._modifier.alignFrom(this._alignState);
    }
    this._alignState.set(align, transition, callback);
    return this;
};
StateModifier.prototype.setSize = function setSize(size, transition, callback) {
    if (size === null) {
        if (this._hasSize) {
            this._modifier.sizeFrom(null);
            this._hasSize = false;
        }
        return this;
    } else if (!this._hasSize) {
        this._hasSize = true;
        this._modifier.sizeFrom(this._sizeState);
    }
    this._sizeState.set(size, transition, callback);
    return this;
};
StateModifier.prototype.setProportions = function setSize(proportions, transition, callback) {
    if (proportions === null) {
        if (this._hasProportions) {
            this._modifier.proportionsFrom(null);
            this._hasProportions = false;
        }
        return this;
    } else if (!this._hasProportions) {
        this._hasProportions = true;
        this._modifier.proportionsFrom(this._proportionsState);
    }
    this._proportionsState.set(proportions, transition, callback);
    return this;
};
StateModifier.prototype.halt = function halt() {
    this._transformState.halt();
    this._opacityState.halt();
    this._originState.halt();
    this._alignState.halt();
    this._sizeState.halt();
    this._proportionsState.halt();
};
StateModifier.prototype.getTransform = function getTransform() {
    return this._transformState.get();
};
StateModifier.prototype.getFinalTransform = function getFinalTransform() {
    return this._transformState.getFinal();
};
StateModifier.prototype.getOpacity = function getOpacity() {
    return this._opacityState.get();
};
StateModifier.prototype.getOrigin = function getOrigin() {
    return this._hasOrigin ? this._originState.get() : null;
};
StateModifier.prototype.getAlign = function getAlign() {
    return this._hasAlign ? this._alignState.get() : null;
};
StateModifier.prototype.getSize = function getSize() {
    return this._hasSize ? this._sizeState.get() : null;
};
StateModifier.prototype.getProportions = function getProportions() {
    return this._hasProportions ? this._proportionsState.get() : null;
};
StateModifier.prototype.modify = function modify(target) {
    return this._modifier.modify(target);
};
module.exports = StateModifier;
},{"../core/Modifier":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/core/Modifier.js","../core/Transform":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/core/Transform.js","../transitions/Transitionable":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/transitions/Transitionable.js","../transitions/TransitionableTransform":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/transitions/TransitionableTransform.js"}],"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/physics/PhysicsEngine.js":[function(require,module,exports){
var EventHandler = require('../core/EventHandler');
function PhysicsEngine(options) {
    this.options = Object.create(PhysicsEngine.DEFAULT_OPTIONS);
    if (options)
        this.setOptions(options);
    this._particles = [];
    this._bodies = [];
    this._agentData = {};
    this._forces = [];
    this._constraints = [];
    this._buffer = 0;
    this._prevTime = now();
    this._isSleeping = false;
    this._eventHandler = null;
    this._currAgentId = 0;
    this._hasBodies = false;
    this._eventHandler = null;
}
var TIMESTEP = 17;
var MIN_TIME_STEP = 1000 / 120;
var MAX_TIME_STEP = 17;
var now = Date.now;
var _events = {
        start: 'start',
        update: 'update',
        end: 'end'
    };
PhysicsEngine.DEFAULT_OPTIONS = {
    constraintSteps: 1,
    sleepTolerance: 1e-7,
    velocityCap: undefined,
    angularVelocityCap: undefined
};
PhysicsEngine.prototype.setOptions = function setOptions(opts) {
    for (var key in opts)
        if (this.options[key])
            this.options[key] = opts[key];
};
PhysicsEngine.prototype.addBody = function addBody(body) {
    body._engine = this;
    if (body.isBody) {
        this._bodies.push(body);
        this._hasBodies = true;
    } else
        this._particles.push(body);
    body.on('start', this.wake.bind(this));
    return body;
};
PhysicsEngine.prototype.removeBody = function removeBody(body) {
    var array = body.isBody ? this._bodies : this._particles;
    var index = array.indexOf(body);
    if (index > -1) {
        for (var agent in this._agentData)
            this.detachFrom(agent.id, body);
        array.splice(index, 1);
    }
    if (this.getBodies().length === 0)
        this._hasBodies = false;
};
function _mapAgentArray(agent) {
    if (agent.applyForce)
        return this._forces;
    if (agent.applyConstraint)
        return this._constraints;
}
function _attachOne(agent, targets, source) {
    if (targets === undefined)
        targets = this.getParticlesAndBodies();
    if (!(targets instanceof Array))
        targets = [targets];
    agent.on('change', this.wake.bind(this));
    this._agentData[this._currAgentId] = {
        agent: agent,
        id: this._currAgentId,
        targets: targets,
        source: source
    };
    _mapAgentArray.call(this, agent).push(this._currAgentId);
    return this._currAgentId++;
}
PhysicsEngine.prototype.attach = function attach(agents, targets, source) {
    this.wake();
    if (agents instanceof Array) {
        var agentIDs = [];
        for (var i = 0; i < agents.length; i++)
            agentIDs[i] = _attachOne.call(this, agents[i], targets, source);
        return agentIDs;
    } else
        return _attachOne.call(this, agents, targets, source);
};
PhysicsEngine.prototype.attachTo = function attachTo(agentID, target) {
    _getAgentData.call(this, agentID).targets.push(target);
};
PhysicsEngine.prototype.detach = function detach(id) {
    var agent = this.getAgent(id);
    var agentArray = _mapAgentArray.call(this, agent);
    var index = agentArray.indexOf(id);
    agentArray.splice(index, 1);
    delete this._agentData[id];
};
PhysicsEngine.prototype.detachFrom = function detachFrom(id, target) {
    var boundAgent = _getAgentData.call(this, id);
    if (boundAgent.source === target)
        this.detach(id);
    else {
        var targets = boundAgent.targets;
        var index = targets.indexOf(target);
        if (index > -1)
            targets.splice(index, 1);
    }
};
PhysicsEngine.prototype.detachAll = function detachAll() {
    this._agentData = {};
    this._forces = [];
    this._constraints = [];
    this._currAgentId = 0;
};
function _getAgentData(id) {
    return this._agentData[id];
}
PhysicsEngine.prototype.getAgent = function getAgent(id) {
    return _getAgentData.call(this, id).agent;
};
PhysicsEngine.prototype.getParticles = function getParticles() {
    return this._particles;
};
PhysicsEngine.prototype.getBodies = function getBodies() {
    return this._bodies;
};
PhysicsEngine.prototype.getParticlesAndBodies = function getParticlesAndBodies() {
    return this.getParticles().concat(this.getBodies());
};
PhysicsEngine.prototype.forEachParticle = function forEachParticle(fn, dt) {
    var particles = this.getParticles();
    for (var index = 0, len = particles.length; index < len; index++)
        fn.call(this, particles[index], dt);
};
PhysicsEngine.prototype.forEachBody = function forEachBody(fn, dt) {
    if (!this._hasBodies)
        return;
    var bodies = this.getBodies();
    for (var index = 0, len = bodies.length; index < len; index++)
        fn.call(this, bodies[index], dt);
};
PhysicsEngine.prototype.forEach = function forEach(fn, dt) {
    this.forEachParticle(fn, dt);
    this.forEachBody(fn, dt);
};
function _updateForce(index) {
    var boundAgent = _getAgentData.call(this, this._forces[index]);
    boundAgent.agent.applyForce(boundAgent.targets, boundAgent.source);
}
function _updateForces() {
    for (var index = this._forces.length - 1; index > -1; index--)
        _updateForce.call(this, index);
}
function _updateConstraint(index, dt) {
    var boundAgent = this._agentData[this._constraints[index]];
    return boundAgent.agent.applyConstraint(boundAgent.targets, boundAgent.source, dt);
}
function _updateConstraints(dt) {
    var iteration = 0;
    while (iteration < this.options.constraintSteps) {
        for (var index = this._constraints.length - 1; index > -1; index--)
            _updateConstraint.call(this, index, dt);
        iteration++;
    }
}
function _updateVelocities(body, dt) {
    body.integrateVelocity(dt);
    if (this.options.velocityCap)
        body.velocity.cap(this.options.velocityCap).put(body.velocity);
}
function _updateAngularVelocities(body, dt) {
    body.integrateAngularMomentum(dt);
    body.updateAngularVelocity();
    if (this.options.angularVelocityCap)
        body.angularVelocity.cap(this.options.angularVelocityCap).put(body.angularVelocity);
}
function _updateOrientations(body, dt) {
    body.integrateOrientation(dt);
}
function _updatePositions(body, dt) {
    body.integratePosition(dt);
    body.emit(_events.update, body);
}
function _integrate(dt) {
    _updateForces.call(this, dt);
    this.forEach(_updateVelocities, dt);
    this.forEachBody(_updateAngularVelocities, dt);
    _updateConstraints.call(this, dt);
    this.forEachBody(_updateOrientations, dt);
    this.forEach(_updatePositions, dt);
}
function _getParticlesEnergy() {
    var energy = 0;
    var particleEnergy = 0;
    this.forEach(function (particle) {
        particleEnergy = particle.getEnergy();
        energy += particleEnergy;
    });
    return energy;
}
function _getAgentsEnergy() {
    var energy = 0;
    for (var id in this._agentData)
        energy += this.getAgentEnergy(id);
    return energy;
}
PhysicsEngine.prototype.getAgentEnergy = function (agentId) {
    var agentData = _getAgentData.call(this, agentId);
    return agentData.agent.getEnergy(agentData.targets, agentData.source);
};
PhysicsEngine.prototype.getEnergy = function getEnergy() {
    return _getParticlesEnergy.call(this) + _getAgentsEnergy.call(this);
};
PhysicsEngine.prototype.step = function step() {
    if (this.isSleeping())
        return;
    var currTime = now();
    var dtFrame = currTime - this._prevTime;
    this._prevTime = currTime;
    if (dtFrame < MIN_TIME_STEP)
        return;
    if (dtFrame > MAX_TIME_STEP)
        dtFrame = MAX_TIME_STEP;
    _integrate.call(this, TIMESTEP);
    this.emit(_events.update, this);
    if (this.getEnergy() < this.options.sleepTolerance)
        this.sleep();
};
PhysicsEngine.prototype.isSleeping = function isSleeping() {
    return this._isSleeping;
};
PhysicsEngine.prototype.isActive = function isSleeping() {
    return !this._isSleeping;
};
PhysicsEngine.prototype.sleep = function sleep() {
    if (this._isSleeping)
        return;
    this.forEach(function (body) {
        body.sleep();
    });
    this.emit(_events.end, this);
    this._isSleeping = true;
};
PhysicsEngine.prototype.wake = function wake() {
    if (!this._isSleeping)
        return;
    this._prevTime = now();
    this.emit(_events.start, this);
    this._isSleeping = false;
};
PhysicsEngine.prototype.emit = function emit(type, data) {
    if (this._eventHandler === null)
        return;
    this._eventHandler.emit(type, data);
};
PhysicsEngine.prototype.on = function on(event, fn) {
    if (this._eventHandler === null)
        this._eventHandler = new EventHandler();
    this._eventHandler.on(event, fn);
};
module.exports = PhysicsEngine;
},{"../core/EventHandler":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/core/EventHandler.js"}],"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/physics/bodies/Body.js":[function(require,module,exports){
var Particle = require('./Particle');
var Transform = require('../../core/Transform');
var Vector = require('../../math/Vector');
var Quaternion = require('../../math/Quaternion');
var Matrix = require('../../math/Matrix');
var Integrator = require('../integrators/SymplecticEuler');
function Body(options) {
    Particle.call(this, options);
    options = options || {};
    this.orientation = new Quaternion();
    this.angularVelocity = new Vector();
    this.angularMomentum = new Vector();
    this.torque = new Vector();
    if (options.orientation)
        this.orientation.set(options.orientation);
    if (options.angularVelocity)
        this.angularVelocity.set(options.angularVelocity);
    if (options.angularMomentum)
        this.angularMomentum.set(options.angularMomentum);
    if (options.torque)
        this.torque.set(options.torque);
    this.angularVelocity.w = 0;
    this.setMomentsOfInertia();
    this.pWorld = new Vector();
}
Body.DEFAULT_OPTIONS = Particle.DEFAULT_OPTIONS;
Body.DEFAULT_OPTIONS.orientation = [
    0,
    0,
    0,
    1
];
Body.DEFAULT_OPTIONS.angularVelocity = [
    0,
    0,
    0
];
Body.prototype = Object.create(Particle.prototype);
Body.prototype.constructor = Body;
Body.prototype.isBody = true;
Body.prototype.setMass = function setMass() {
    Particle.prototype.setMass.apply(this, arguments);
    this.setMomentsOfInertia();
};
Body.prototype.setMomentsOfInertia = function setMomentsOfInertia() {
    this.inertia = new Matrix();
    this.inverseInertia = new Matrix();
};
Body.prototype.updateAngularVelocity = function updateAngularVelocity() {
    this.angularVelocity.set(this.inverseInertia.vectorMultiply(this.angularMomentum));
};
Body.prototype.toWorldCoordinates = function toWorldCoordinates(localPosition) {
    return this.pWorld.set(this.orientation.rotateVector(localPosition));
};
Body.prototype.getEnergy = function getEnergy() {
    return Particle.prototype.getEnergy.call(this) + 0.5 * this.inertia.vectorMultiply(this.angularVelocity).dot(this.angularVelocity);
};
Body.prototype.reset = function reset(p, v, q, L) {
    Particle.prototype.reset.call(this, p, v);
    this.angularVelocity.clear();
    this.setOrientation(q || [
        1,
        0,
        0,
        0
    ]);
    this.setAngularMomentum(L || [
        0,
        0,
        0
    ]);
};
Body.prototype.setOrientation = function setOrientation(q) {
    this.orientation.set(q);
};
Body.prototype.setAngularVelocity = function setAngularVelocity(w) {
    this.wake();
    this.angularVelocity.set(w);
};
Body.prototype.setAngularMomentum = function setAngularMomentum(L) {
    this.wake();
    this.angularMomentum.set(L);
};
Body.prototype.applyForce = function applyForce(force, location) {
    Particle.prototype.applyForce.call(this, force);
    if (location !== undefined)
        this.applyTorque(location.cross(force));
};
Body.prototype.applyTorque = function applyTorque(torque) {
    this.wake();
    this.torque.set(this.torque.add(torque));
};
Body.prototype.getTransform = function getTransform() {
    return Transform.thenMove(this.orientation.getTransform(), Transform.getTranslate(Particle.prototype.getTransform.call(this)));
};
Body.prototype._integrate = function _integrate(dt) {
    Particle.prototype._integrate.call(this, dt);
    this.integrateAngularMomentum(dt);
    this.updateAngularVelocity(dt);
    this.integrateOrientation(dt);
};
Body.prototype.integrateAngularMomentum = function integrateAngularMomentum(dt) {
    Integrator.integrateAngularMomentum(this, dt);
};
Body.prototype.integrateOrientation = function integrateOrientation(dt) {
    Integrator.integrateOrientation(this, dt);
};
module.exports = Body;
},{"../../core/Transform":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/core/Transform.js","../../math/Matrix":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/math/Matrix.js","../../math/Quaternion":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/math/Quaternion.js","../../math/Vector":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/math/Vector.js","../integrators/SymplecticEuler":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/physics/integrators/SymplecticEuler.js","./Particle":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/physics/bodies/Particle.js"}],"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/physics/bodies/Circle.js":[function(require,module,exports){
var Body = require('./Body');
var Matrix = require('../../math/Matrix');
function Circle(options) {
    options = options || {};
    this.setRadius(options.radius || 0);
    Body.call(this, options);
}
Circle.prototype = Object.create(Body.prototype);
Circle.prototype.constructor = Circle;
Circle.prototype.setRadius = function setRadius(r) {
    this.radius = r;
    this.size = [
        2 * this.radius,
        2 * this.radius
    ];
    this.setMomentsOfInertia();
};
Circle.prototype.setMomentsOfInertia = function setMomentsOfInertia() {
    var m = this.mass;
    var r = this.radius;
    this.inertia = new Matrix([
        [
            0.25 * m * r * r,
            0,
            0
        ],
        [
            0,
            0.25 * m * r * r,
            0
        ],
        [
            0,
            0,
            0.5 * m * r * r
        ]
    ]);
    this.inverseInertia = new Matrix([
        [
            4 / (m * r * r),
            0,
            0
        ],
        [
            0,
            4 / (m * r * r),
            0
        ],
        [
            0,
            0,
            2 / (m * r * r)
        ]
    ]);
};
module.exports = Circle;
},{"../../math/Matrix":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/math/Matrix.js","./Body":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/physics/bodies/Body.js"}],"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/physics/bodies/Particle.js":[function(require,module,exports){
var Vector = require('../../math/Vector');
var Transform = require('../../core/Transform');
var EventHandler = require('../../core/EventHandler');
var Integrator = require('../integrators/SymplecticEuler');
function Particle(options) {
    options = options || {};
    var defaults = Particle.DEFAULT_OPTIONS;
    this.position = new Vector();
    this.velocity = new Vector();
    this.force = new Vector();
    this._engine = null;
    this._isSleeping = true;
    this._eventOutput = null;
    this.mass = options.mass !== undefined ? options.mass : defaults.mass;
    this.inverseMass = 1 / this.mass;
    this.setPosition(options.position || defaults.position);
    this.setVelocity(options.velocity || defaults.velocity);
    this.force.set(options.force || [
        0,
        0,
        0
    ]);
    this.transform = Transform.identity.slice();
    this._spec = {
        size: [
            true,
            true
        ],
        target: {
            transform: this.transform,
            origin: [
                0.5,
                0.5
            ],
            target: null
        }
    };
}
Particle.DEFAULT_OPTIONS = {
    position: [
        0,
        0,
        0
    ],
    velocity: [
        0,
        0,
        0
    ],
    mass: 1
};
var _events = {
        start: 'start',
        update: 'update',
        end: 'end'
    };
var now = Date.now;
Particle.prototype.isBody = false;
Particle.prototype.isActive = function isActive() {
    return !this._isSleeping;
};
Particle.prototype.sleep = function sleep() {
    if (this._isSleeping)
        return;
    this.emit(_events.end, this);
    this._isSleeping = true;
};
Particle.prototype.wake = function wake() {
    if (!this._isSleeping)
        return;
    this.emit(_events.start, this);
    this._isSleeping = false;
    this._prevTime = now();
    if (this._engine)
        this._engine.wake();
};
Particle.prototype.setPosition = function setPosition(position) {
    this.position.set(position);
};
Particle.prototype.setPosition1D = function setPosition1D(x) {
    this.position.x = x;
};
Particle.prototype.getPosition = function getPosition() {
    this._engine.step();
    return this.position.get();
};
Particle.prototype.getPosition1D = function getPosition1D() {
    this._engine.step();
    return this.position.x;
};
Particle.prototype.setVelocity = function setVelocity(velocity) {
    this.velocity.set(velocity);
    if (!(velocity[0] === 0 && velocity[1] === 0 && velocity[2] === 0))
        this.wake();
};
Particle.prototype.setVelocity1D = function setVelocity1D(x) {
    this.velocity.x = x;
    if (x !== 0)
        this.wake();
};
Particle.prototype.getVelocity = function getVelocity() {
    return this.velocity.get();
};
Particle.prototype.setForce = function setForce(force) {
    this.force.set(force);
    this.wake();
};
Particle.prototype.getVelocity1D = function getVelocity1D() {
    return this.velocity.x;
};
Particle.prototype.setMass = function setMass(mass) {
    this.mass = mass;
    this.inverseMass = 1 / mass;
};
Particle.prototype.getMass = function getMass() {
    return this.mass;
};
Particle.prototype.reset = function reset(position, velocity) {
    this.setPosition(position || [
        0,
        0,
        0
    ]);
    this.setVelocity(velocity || [
        0,
        0,
        0
    ]);
};
Particle.prototype.applyForce = function applyForce(force) {
    if (force.isZero())
        return;
    this.force.add(force).put(this.force);
    this.wake();
};
Particle.prototype.applyImpulse = function applyImpulse(impulse) {
    if (impulse.isZero())
        return;
    var velocity = this.velocity;
    velocity.add(impulse.mult(this.inverseMass)).put(velocity);
};
Particle.prototype.integrateVelocity = function integrateVelocity(dt) {
    Integrator.integrateVelocity(this, dt);
};
Particle.prototype.integratePosition = function integratePosition(dt) {
    Integrator.integratePosition(this, dt);
};
Particle.prototype._integrate = function _integrate(dt) {
    this.integrateVelocity(dt);
    this.integratePosition(dt);
};
Particle.prototype.getEnergy = function getEnergy() {
    return 0.5 * this.mass * this.velocity.normSquared();
};
Particle.prototype.getTransform = function getTransform() {
    this._engine.step();
    var position = this.position;
    var transform = this.transform;
    transform[12] = position.x;
    transform[13] = position.y;
    transform[14] = position.z;
    return transform;
};
Particle.prototype.modify = function modify(target) {
    var _spec = this._spec.target;
    _spec.transform = this.getTransform();
    _spec.target = target;
    return this._spec;
};
function _createEventOutput() {
    this._eventOutput = new EventHandler();
    this._eventOutput.bindThis(this);
    EventHandler.setOutputHandler(this, this._eventOutput);
}
Particle.prototype.emit = function emit(type, data) {
    if (!this._eventOutput)
        return;
    this._eventOutput.emit(type, data);
};
Particle.prototype.on = function on() {
    _createEventOutput.call(this);
    return this.on.apply(this, arguments);
};
Particle.prototype.removeListener = function removeListener() {
    _createEventOutput.call(this);
    return this.removeListener.apply(this, arguments);
};
Particle.prototype.pipe = function pipe() {
    _createEventOutput.call(this);
    return this.pipe.apply(this, arguments);
};
Particle.prototype.unpipe = function unpipe() {
    _createEventOutput.call(this);
    return this.unpipe.apply(this, arguments);
};
module.exports = Particle;
},{"../../core/EventHandler":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/core/EventHandler.js","../../core/Transform":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/core/Transform.js","../../math/Vector":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/math/Vector.js","../integrators/SymplecticEuler":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/physics/integrators/SymplecticEuler.js"}],"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/physics/constraints/Collision.js":[function(require,module,exports){
var Constraint = require('./Constraint');
var Vector = require('../../math/Vector');
function Collision(options) {
    this.options = Object.create(Collision.DEFAULT_OPTIONS);
    if (options)
        this.setOptions(options);
    this.normal = new Vector();
    this.pDiff = new Vector();
    this.vDiff = new Vector();
    this.impulse1 = new Vector();
    this.impulse2 = new Vector();
    Constraint.call(this);
}
Collision.prototype = Object.create(Constraint.prototype);
Collision.prototype.constructor = Collision;
Collision.DEFAULT_OPTIONS = {
    restitution: 0.5,
    drift: 0.5,
    slop: 0
};
function _normalVelocity(particle1, particle2) {
    return particle1.velocity.dot(particle2.velocity);
}
Collision.prototype.setOptions = function setOptions(options) {
    for (var key in options)
        this.options[key] = options[key];
};
Collision.prototype.applyConstraint = function applyConstraint(targets, source, dt) {
    if (source === undefined)
        return;
    var v1 = source.velocity;
    var p1 = source.position;
    var w1 = source.inverseMass;
    var r1 = source.radius;
    var options = this.options;
    var drift = options.drift;
    var slop = -options.slop;
    var restitution = options.restitution;
    var n = this.normal;
    var pDiff = this.pDiff;
    var vDiff = this.vDiff;
    var impulse1 = this.impulse1;
    var impulse2 = this.impulse2;
    for (var i = 0; i < targets.length; i++) {
        var target = targets[i];
        if (target === source)
            continue;
        var v2 = target.velocity;
        var p2 = target.position;
        var w2 = target.inverseMass;
        var r2 = target.radius;
        pDiff.set(p2.sub(p1));
        vDiff.set(v2.sub(v1));
        var dist = pDiff.norm();
        var overlap = dist - (r1 + r2);
        var effMass = 1 / (w1 + w2);
        var gamma = 0;
        if (overlap < 0) {
            n.set(pDiff.normalize());
            if (this._eventOutput) {
                var collisionData = {
                        target: target,
                        source: source,
                        overlap: overlap,
                        normal: n
                    };
                this._eventOutput.emit('preCollision', collisionData);
                this._eventOutput.emit('collision', collisionData);
            }
            var lambda = overlap <= slop ? ((1 + restitution) * n.dot(vDiff) + drift / dt * (overlap - slop)) / (gamma + dt / effMass) : (1 + restitution) * n.dot(vDiff) / (gamma + dt / effMass);
            n.mult(dt * lambda).put(impulse1);
            impulse1.mult(-1).put(impulse2);
            source.applyImpulse(impulse1);
            target.applyImpulse(impulse2);
            if (this._eventOutput)
                this._eventOutput.emit('postCollision', collisionData);
        }
    }
};
module.exports = Collision;
},{"../../math/Vector":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/math/Vector.js","./Constraint":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/physics/constraints/Constraint.js"}],"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/physics/constraints/Constraint.js":[function(require,module,exports){
var EventHandler = require('../../core/EventHandler');
function Constraint() {
    this.options = this.options || {};
    this._eventOutput = new EventHandler();
    EventHandler.setOutputHandler(this, this._eventOutput);
}
Constraint.prototype.setOptions = function setOptions(options) {
    this._eventOutput.emit('change', options);
};
Constraint.prototype.applyConstraint = function applyConstraint() {
};
Constraint.prototype.getEnergy = function getEnergy() {
    return 0;
};
module.exports = Constraint;
},{"../../core/EventHandler":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/core/EventHandler.js"}],"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/physics/constraints/Wall.js":[function(require,module,exports){
var Constraint = require('./Constraint');
var Vector = require('../../math/Vector');
function Wall(options) {
    this.options = Object.create(Wall.DEFAULT_OPTIONS);
    if (options)
        this.setOptions(options);
    this.diff = new Vector();
    this.impulse = new Vector();
    Constraint.call(this);
}
Wall.prototype = Object.create(Constraint.prototype);
Wall.prototype.constructor = Wall;
Wall.ON_CONTACT = {
    REFLECT: 0,
    SILENT: 1
};
Wall.DEFAULT_OPTIONS = {
    restitution: 0.5,
    drift: 0.5,
    slop: 0,
    normal: [
        1,
        0,
        0
    ],
    distance: 0,
    onContact: Wall.ON_CONTACT.REFLECT
};
Wall.prototype.setOptions = function setOptions(options) {
    if (options.normal !== undefined) {
        if (options.normal instanceof Vector)
            this.options.normal = options.normal.clone();
        if (options.normal instanceof Array)
            this.options.normal = new Vector(options.normal);
    }
    if (options.restitution !== undefined)
        this.options.restitution = options.restitution;
    if (options.drift !== undefined)
        this.options.drift = options.drift;
    if (options.slop !== undefined)
        this.options.slop = options.slop;
    if (options.distance !== undefined)
        this.options.distance = options.distance;
    if (options.onContact !== undefined)
        this.options.onContact = options.onContact;
};
function _getNormalVelocity(n, v) {
    return v.dot(n);
}
function _getDistanceFromOrigin(p) {
    var n = this.options.normal;
    var d = this.options.distance;
    return p.dot(n) + d;
}
function _onEnter(particle, overlap, dt) {
    var p = particle.position;
    var v = particle.velocity;
    var m = particle.mass;
    var n = this.options.normal;
    var action = this.options.onContact;
    var restitution = this.options.restitution;
    var impulse = this.impulse;
    var drift = this.options.drift;
    var slop = -this.options.slop;
    var gamma = 0;
    if (this._eventOutput) {
        var data = {
                particle: particle,
                wall: this,
                overlap: overlap,
                normal: n
            };
        this._eventOutput.emit('preCollision', data);
        this._eventOutput.emit('collision', data);
    }
    switch (action) {
    case Wall.ON_CONTACT.REFLECT:
        var lambda = overlap < slop ? -((1 + restitution) * n.dot(v) + drift / dt * (overlap - slop)) / (m * dt + gamma) : -((1 + restitution) * n.dot(v)) / (m * dt + gamma);
        impulse.set(n.mult(dt * lambda));
        particle.applyImpulse(impulse);
        particle.setPosition(p.add(n.mult(-overlap)));
        break;
    }
    if (this._eventOutput)
        this._eventOutput.emit('postCollision', data);
}
function _onExit(particle, overlap, dt) {
    var action = this.options.onContact;
    var p = particle.position;
    var n = this.options.normal;
    if (action === Wall.ON_CONTACT.REFLECT) {
        particle.setPosition(p.add(n.mult(-overlap)));
    }
}
Wall.prototype.applyConstraint = function applyConstraint(targets, source, dt) {
    var n = this.options.normal;
    for (var i = 0; i < targets.length; i++) {
        var particle = targets[i];
        var p = particle.position;
        var v = particle.velocity;
        var r = particle.radius || 0;
        var overlap = _getDistanceFromOrigin.call(this, p.add(n.mult(-r)));
        var nv = _getNormalVelocity.call(this, n, v);
        if (overlap <= 0) {
            if (nv < 0)
                _onEnter.call(this, particle, overlap, dt);
            else
                _onExit.call(this, particle, overlap, dt);
        }
    }
};
module.exports = Wall;
},{"../../math/Vector":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/math/Vector.js","./Constraint":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/physics/constraints/Constraint.js"}],"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/physics/constraints/Walls.js":[function(require,module,exports){
var Constraint = require('./Constraint');
var Wall = require('./Wall');
var Vector = require('../../math/Vector');
var Utility = require('../../utilities/Utility');
function Walls(options) {
    this.options = Utility.clone(this.constructor.DEFAULT_OPTIONS || Walls.DEFAULT_OPTIONS);
    if (options)
        this.setOptions(options);
    _createComponents.call(this, this.options.sides);
    Constraint.call(this);
}
Walls.prototype = Object.create(Constraint.prototype);
Walls.prototype.constructor = Walls;
Walls.ON_CONTACT = Wall.ON_CONTACT;
Walls.SIDES = {
    LEFT: 0,
    RIGHT: 1,
    TOP: 2,
    BOTTOM: 3,
    FRONT: 4,
    BACK: 5,
    TWO_DIMENSIONAL: [
        0,
        1,
        2,
        3
    ],
    THREE_DIMENSIONAL: [
        0,
        1,
        2,
        3,
        4,
        5
    ]
};
Walls.DEFAULT_OPTIONS = {
    sides: Walls.SIDES.TWO_DIMENSIONAL,
    size: [
        window.innerWidth,
        window.innerHeight,
        0
    ],
    origin: [
        0.5,
        0.5,
        0.5
    ],
    drift: 0.5,
    slop: 0,
    restitution: 0.5,
    onContact: Walls.ON_CONTACT.REFLECT
};
var _SIDE_NORMALS = {
        0: new Vector(1, 0, 0),
        1: new Vector(-1, 0, 0),
        2: new Vector(0, 1, 0),
        3: new Vector(0, -1, 0),
        4: new Vector(0, 0, 1),
        5: new Vector(0, 0, -1)
    };
function _getDistance(side, size, origin) {
    var distance;
    var SIDES = Walls.SIDES;
    switch (parseInt(side)) {
    case SIDES.LEFT:
        distance = size[0] * origin[0];
        break;
    case SIDES.TOP:
        distance = size[1] * origin[1];
        break;
    case SIDES.FRONT:
        distance = size[2] * origin[2];
        break;
    case SIDES.RIGHT:
        distance = size[0] * (1 - origin[0]);
        break;
    case SIDES.BOTTOM:
        distance = size[1] * (1 - origin[1]);
        break;
    case SIDES.BACK:
        distance = size[2] * (1 - origin[2]);
        break;
    }
    return distance;
}
Walls.prototype.setOptions = function setOptions(options) {
    var resizeFlag = false;
    if (options.restitution !== undefined)
        _setOptionsForEach.call(this, { restitution: options.restitution });
    if (options.drift !== undefined)
        _setOptionsForEach.call(this, { drift: options.drift });
    if (options.slop !== undefined)
        _setOptionsForEach.call(this, { slop: options.slop });
    if (options.onContact !== undefined)
        _setOptionsForEach.call(this, { onContact: options.onContact });
    if (options.size !== undefined)
        resizeFlag = true;
    if (options.sides !== undefined)
        this.options.sides = options.sides;
    if (options.origin !== undefined)
        resizeFlag = true;
    if (resizeFlag)
        this.setSize(options.size, options.origin);
};
function _createComponents(sides) {
    this.components = {};
    var components = this.components;
    for (var i = 0; i < sides.length; i++) {
        var side = sides[i];
        components[i] = new Wall({
            normal: _SIDE_NORMALS[side].clone(),
            distance: _getDistance(side, this.options.size, this.options.origin)
        });
    }
}
Walls.prototype.setSize = function setSize(size, origin) {
    origin = origin || this.options.origin;
    if (origin.length < 3)
        origin[2] = 0.5;
    this.forEach(function (wall, side) {
        var d = _getDistance(side, size, origin);
        wall.setOptions({ distance: d });
    });
    this.options.size = size;
    this.options.origin = origin;
};
function _setOptionsForEach(options) {
    this.forEach(function (wall) {
        wall.setOptions(options);
    });
    for (var key in options)
        this.options[key] = options[key];
}
Walls.prototype.applyConstraint = function applyConstraint(targets, source, dt) {
    this.forEach(function (wall) {
        wall.applyConstraint(targets, source, dt);
    });
};
Walls.prototype.forEach = function forEach(fn) {
    var sides = this.options.sides;
    for (var key in this.sides)
        fn(sides[key], key);
};
Walls.prototype.rotateZ = function rotateZ(angle) {
    this.forEach(function (wall) {
        var n = wall.options.normal;
        n.rotateZ(angle).put(n);
    });
};
Walls.prototype.rotateX = function rotateX(angle) {
    this.forEach(function (wall) {
        var n = wall.options.normal;
        n.rotateX(angle).put(n);
    });
};
Walls.prototype.rotateY = function rotateY(angle) {
    this.forEach(function (wall) {
        var n = wall.options.normal;
        n.rotateY(angle).put(n);
    });
};
module.exports = Walls;
},{"../../math/Vector":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/math/Vector.js","../../utilities/Utility":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/utilities/Utility.js","./Constraint":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/physics/constraints/Constraint.js","./Wall":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/physics/constraints/Wall.js"}],"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/physics/forces/Drag.js":[function(require,module,exports){
var Force = require('./Force');
function Drag(options) {
    this.options = Object.create(this.constructor.DEFAULT_OPTIONS);
    if (options)
        this.setOptions(options);
    Force.call(this);
}
Drag.prototype = Object.create(Force.prototype);
Drag.prototype.constructor = Drag;
Drag.FORCE_FUNCTIONS = {
    LINEAR: function (velocity) {
        return velocity;
    },
    QUADRATIC: function (velocity) {
        return velocity.mult(velocity.norm());
    }
};
Drag.DEFAULT_OPTIONS = {
    strength: 0.01,
    forceFunction: Drag.FORCE_FUNCTIONS.LINEAR
};
Drag.prototype.applyForce = function applyForce(targets) {
    var strength = this.options.strength;
    var forceFunction = this.options.forceFunction;
    var force = this.force;
    var index;
    var particle;
    for (index = 0; index < targets.length; index++) {
        particle = targets[index];
        forceFunction(particle.velocity).mult(-strength).put(force);
        particle.applyForce(force);
    }
};
Drag.prototype.setOptions = function setOptions(options) {
    for (var key in options)
        this.options[key] = options[key];
};
module.exports = Drag;
},{"./Force":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/physics/forces/Force.js"}],"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/physics/forces/Force.js":[function(require,module,exports){
var Vector = require('../../math/Vector');
var EventHandler = require('../../core/EventHandler');
function Force(force) {
    this.force = new Vector(force);
    this._eventOutput = new EventHandler();
    EventHandler.setOutputHandler(this, this._eventOutput);
}
Force.prototype.setOptions = function setOptions(options) {
    this._eventOutput.emit('change', options);
};
Force.prototype.applyForce = function applyForce(targets) {
    var length = targets.length;
    while (length--) {
        targets[length].applyForce(this.force);
    }
};
Force.prototype.getEnergy = function getEnergy() {
    return 0;
};
module.exports = Force;
},{"../../core/EventHandler":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/core/EventHandler.js","../../math/Vector":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/math/Vector.js"}],"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/physics/forces/Repulsion.js":[function(require,module,exports){
var Force = require('./Force');
var Vector = require('../../math/Vector');
function Repulsion(options) {
    this.options = Object.create(Repulsion.DEFAULT_OPTIONS);
    if (options)
        this.setOptions(options);
    this.disp = new Vector();
    Force.call(this);
}
Repulsion.prototype = Object.create(Force.prototype);
Repulsion.prototype.constructor = Repulsion;
Repulsion.DECAY_FUNCTIONS = {
    LINEAR: function (r, cutoff) {
        return Math.max(1 - 1 / cutoff * r, 0);
    },
    MORSE: function (r, cutoff) {
        var r0 = cutoff === 0 ? 100 : cutoff;
        var rShifted = r + r0 * (1 - Math.log(2));
        return Math.max(1 - Math.pow(1 - Math.exp(rShifted / r0 - 1), 2), 0);
    },
    INVERSE: function (r, cutoff) {
        return 1 / (1 - cutoff + r);
    },
    GRAVITY: function (r, cutoff) {
        return 1 / (1 - cutoff + r * r);
    }
};
Repulsion.DEFAULT_OPTIONS = {
    strength: 1,
    anchor: undefined,
    range: [
        0,
        Infinity
    ],
    cutoff: 0,
    cap: Infinity,
    decayFunction: Repulsion.DECAY_FUNCTIONS.GRAVITY
};
Repulsion.prototype.setOptions = function setOptions(options) {
    if (options.anchor !== undefined) {
        if (options.anchor.position instanceof Vector)
            this.options.anchor = options.anchor.position;
        if (options.anchor instanceof Array)
            this.options.anchor = new Vector(options.anchor);
        delete options.anchor;
    }
    for (var key in options)
        this.options[key] = options[key];
};
Repulsion.prototype.applyForce = function applyForce(targets, source) {
    var options = this.options;
    var force = this.force;
    var disp = this.disp;
    var strength = options.strength;
    var anchor = options.anchor || source.position;
    var cap = options.cap;
    var cutoff = options.cutoff;
    var rMin = options.range[0];
    var rMax = options.range[1];
    var decayFn = options.decayFunction;
    if (strength === 0)
        return;
    var length = targets.length;
    var particle;
    var m1;
    var p1;
    var r;
    while (length--) {
        particle = targets[length];
        if (particle === source)
            continue;
        m1 = particle.mass;
        p1 = particle.position;
        disp.set(p1.sub(anchor));
        r = disp.norm();
        if (r < rMax && r > rMin) {
            force.set(disp.normalize(strength * m1 * decayFn(r, cutoff)).cap(cap));
            particle.applyForce(force);
        }
    }
};
module.exports = Repulsion;
},{"../../math/Vector":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/math/Vector.js","./Force":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/physics/forces/Force.js"}],"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/physics/forces/VectorField.js":[function(require,module,exports){
var Force = require('./Force');
var Vector = require('../../math/Vector');
function VectorField(options) {
    Force.call(this);
    this.options = Object.create(VectorField.DEFAULT_OPTIONS);
    if (options)
        this.setOptions(options);
    this.evaluation = new Vector();
}
VectorField.prototype = Object.create(Force.prototype);
VectorField.prototype.constructor = VectorField;
VectorField.FIELDS = {
    CONSTANT: function (v, options) {
        options.direction.put(this.evaluation);
    },
    LINEAR: function (v) {
        v.put(this.evaluation);
    },
    RADIAL: function (v) {
        v.mult(-1).put(this.evaluation);
    },
    POINT_ATTRACTOR: function (v, options) {
        options.position.sub(v).put(this.evaluation);
    }
};
VectorField.DEFAULT_OPTIONS = {
    strength: 0.01,
    field: VectorField.FIELDS.CONSTANT
};
VectorField.prototype.setOptions = function setOptions(options) {
    if (options.strength !== undefined)
        this.options.strength = options.strength;
    if (options.field !== undefined) {
        this.options.field = options.field;
        _setFieldOptions.call(this, this.options.field);
    }
};
function _setFieldOptions(field) {
    var FIELDS = VectorField.FIELDS;
    switch (field) {
    case FIELDS.CONSTANT:
        if (!this.options.direction)
            this.options.direction = new Vector(0, 1, 0);
        else if (this.options.direction instanceof Array)
            this.options.direction = new Vector(this.options.direction);
        break;
    case FIELDS.POINT_ATTRACTOR:
        if (!this.options.position)
            this.options.position = new Vector(0, 0, 0);
        else if (this.options.position instanceof Array)
            this.options.position = new Vector(this.options.position);
        break;
    }
}
VectorField.prototype.applyForce = function applyForce(targets) {
    var force = this.force;
    var strength = this.options.strength;
    var field = this.options.field;
    var i;
    var target;
    for (i = 0; i < targets.length; i++) {
        target = targets[i];
        field.call(this, target.position, this.options);
        this.evaluation.mult(target.mass * strength).put(force);
        target.applyForce(force);
    }
};
VectorField.prototype.getEnergy = function getEnergy(targets) {
    var field = this.options.field;
    var FIELDS = VectorField.FIELDS;
    var energy = 0;
    var i;
    var target;
    switch (field) {
    case FIELDS.CONSTANT:
        energy = targets.length * this.options.direction.norm();
        break;
    case FIELDS.RADIAL:
        for (i = 0; i < targets.length; i++) {
            target = targets[i];
            energy += target.position.norm();
        }
        break;
    case FIELDS.POINT_ATTRACTOR:
        for (i = 0; i < targets.length; i++) {
            target = targets[i];
            energy += target.position.sub(this.options.position).norm();
        }
        break;
    }
    energy *= this.options.strength;
    return energy;
};
module.exports = VectorField;
},{"../../math/Vector":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/math/Vector.js","./Force":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/physics/forces/Force.js"}],"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/physics/integrators/SymplecticEuler.js":[function(require,module,exports){
var SymplecticEuler = {};
SymplecticEuler.integrateVelocity = function integrateVelocity(body, dt) {
    var v = body.velocity;
    var w = body.inverseMass;
    var f = body.force;
    if (f.isZero())
        return;
    v.add(f.mult(dt * w)).put(v);
    f.clear();
};
SymplecticEuler.integratePosition = function integratePosition(body, dt) {
    var p = body.position;
    var v = body.velocity;
    p.add(v.mult(dt)).put(p);
};
SymplecticEuler.integrateAngularMomentum = function integrateAngularMomentum(body, dt) {
    var L = body.angularMomentum;
    var t = body.torque;
    if (t.isZero())
        return;
    L.add(t.mult(dt)).put(L);
    t.clear();
};
SymplecticEuler.integrateOrientation = function integrateOrientation(body, dt) {
    var q = body.orientation;
    var w = body.angularVelocity;
    if (w.isZero())
        return;
    q.add(q.multiply(w).scalarMultiply(0.5 * dt)).put(q);
};
module.exports = SymplecticEuler;
},{}],"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/transitions/Easing.js":[function(require,module,exports){
var Easing = {
        inQuad: function (t) {
            return t * t;
        },
        outQuad: function (t) {
            return -(t -= 1) * t + 1;
        },
        inOutQuad: function (t) {
            if ((t /= 0.5) < 1)
                return 0.5 * t * t;
            return -0.5 * (--t * (t - 2) - 1);
        },
        inCubic: function (t) {
            return t * t * t;
        },
        outCubic: function (t) {
            return --t * t * t + 1;
        },
        inOutCubic: function (t) {
            if ((t /= 0.5) < 1)
                return 0.5 * t * t * t;
            return 0.5 * ((t -= 2) * t * t + 2);
        },
        inQuart: function (t) {
            return t * t * t * t;
        },
        outQuart: function (t) {
            return -(--t * t * t * t - 1);
        },
        inOutQuart: function (t) {
            if ((t /= 0.5) < 1)
                return 0.5 * t * t * t * t;
            return -0.5 * ((t -= 2) * t * t * t - 2);
        },
        inQuint: function (t) {
            return t * t * t * t * t;
        },
        outQuint: function (t) {
            return --t * t * t * t * t + 1;
        },
        inOutQuint: function (t) {
            if ((t /= 0.5) < 1)
                return 0.5 * t * t * t * t * t;
            return 0.5 * ((t -= 2) * t * t * t * t + 2);
        },
        inSine: function (t) {
            return -1 * Math.cos(t * (Math.PI / 2)) + 1;
        },
        outSine: function (t) {
            return Math.sin(t * (Math.PI / 2));
        },
        inOutSine: function (t) {
            return -0.5 * (Math.cos(Math.PI * t) - 1);
        },
        inExpo: function (t) {
            return t === 0 ? 0 : Math.pow(2, 10 * (t - 1));
        },
        outExpo: function (t) {
            return t === 1 ? 1 : -Math.pow(2, -10 * t) + 1;
        },
        inOutExpo: function (t) {
            if (t === 0)
                return 0;
            if (t === 1)
                return 1;
            if ((t /= 0.5) < 1)
                return 0.5 * Math.pow(2, 10 * (t - 1));
            return 0.5 * (-Math.pow(2, -10 * --t) + 2);
        },
        inCirc: function (t) {
            return -(Math.sqrt(1 - t * t) - 1);
        },
        outCirc: function (t) {
            return Math.sqrt(1 - --t * t);
        },
        inOutCirc: function (t) {
            if ((t /= 0.5) < 1)
                return -0.5 * (Math.sqrt(1 - t * t) - 1);
            return 0.5 * (Math.sqrt(1 - (t -= 2) * t) + 1);
        },
        inElastic: function (t) {
            var s = 1.70158;
            var p = 0;
            var a = 1;
            if (t === 0)
                return 0;
            if (t === 1)
                return 1;
            if (!p)
                p = 0.3;
            s = p / (2 * Math.PI) * Math.asin(1 / a);
            return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t - s) * (2 * Math.PI) / p));
        },
        outElastic: function (t) {
            var s = 1.70158;
            var p = 0;
            var a = 1;
            if (t === 0)
                return 0;
            if (t === 1)
                return 1;
            if (!p)
                p = 0.3;
            s = p / (2 * Math.PI) * Math.asin(1 / a);
            return a * Math.pow(2, -10 * t) * Math.sin((t - s) * (2 * Math.PI) / p) + 1;
        },
        inOutElastic: function (t) {
            var s = 1.70158;
            var p = 0;
            var a = 1;
            if (t === 0)
                return 0;
            if ((t /= 0.5) === 2)
                return 1;
            if (!p)
                p = 0.3 * 1.5;
            s = p / (2 * Math.PI) * Math.asin(1 / a);
            if (t < 1)
                return -0.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t - s) * (2 * Math.PI) / p));
            return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t - s) * (2 * Math.PI) / p) * 0.5 + 1;
        },
        inBack: function (t, s) {
            if (s === undefined)
                s = 1.70158;
            return t * t * ((s + 1) * t - s);
        },
        outBack: function (t, s) {
            if (s === undefined)
                s = 1.70158;
            return --t * t * ((s + 1) * t + s) + 1;
        },
        inOutBack: function (t, s) {
            if (s === undefined)
                s = 1.70158;
            if ((t /= 0.5) < 1)
                return 0.5 * (t * t * (((s *= 1.525) + 1) * t - s));
            return 0.5 * ((t -= 2) * t * (((s *= 1.525) + 1) * t + s) + 2);
        },
        inBounce: function (t) {
            return 1 - Easing.outBounce(1 - t);
        },
        outBounce: function (t) {
            if (t < 1 / 2.75) {
                return 7.5625 * t * t;
            } else if (t < 2 / 2.75) {
                return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
            } else if (t < 2.5 / 2.75) {
                return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
            } else {
                return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
            }
        },
        inOutBounce: function (t) {
            if (t < 0.5)
                return Easing.inBounce(t * 2) * 0.5;
            return Easing.outBounce(t * 2 - 1) * 0.5 + 0.5;
        }
    };
module.exports = Easing;
},{}],"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/transitions/MultipleTransition.js":[function(require,module,exports){
var Utility = require('../utilities/Utility');
function MultipleTransition(method) {
    this.method = method;
    this._instances = [];
    this.state = [];
}
MultipleTransition.SUPPORTS_MULTIPLE = true;
MultipleTransition.prototype.get = function get() {
    for (var i = 0; i < this._instances.length; i++) {
        this.state[i] = this._instances[i].get();
    }
    return this.state;
};
MultipleTransition.prototype.set = function set(endState, transition, callback) {
    var _allCallback = Utility.after(endState.length, callback);
    for (var i = 0; i < endState.length; i++) {
        if (!this._instances[i])
            this._instances[i] = new this.method();
        this._instances[i].set(endState[i], transition, _allCallback);
    }
};
MultipleTransition.prototype.reset = function reset(startState) {
    for (var i = 0; i < startState.length; i++) {
        if (!this._instances[i])
            this._instances[i] = new this.method();
        this._instances[i].reset(startState[i]);
    }
};
module.exports = MultipleTransition;
},{"../utilities/Utility":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/utilities/Utility.js"}],"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/transitions/Transitionable.js":[function(require,module,exports){
var MultipleTransition = require('./MultipleTransition');
var TweenTransition = require('./TweenTransition');
function Transitionable(start) {
    this.currentAction = null;
    this.actionQueue = [];
    this.callbackQueue = [];
    this.state = 0;
    this.velocity = undefined;
    this._callback = undefined;
    this._engineInstance = null;
    this._currentMethod = null;
    this.set(start);
}
var transitionMethods = {};
Transitionable.register = function register(methods) {
    var success = true;
    for (var method in methods) {
        if (!Transitionable.registerMethod(method, methods[method]))
            success = false;
    }
    return success;
};
Transitionable.registerMethod = function registerMethod(name, engineClass) {
    if (!(name in transitionMethods)) {
        transitionMethods[name] = engineClass;
        return true;
    } else
        return false;
};
Transitionable.unregisterMethod = function unregisterMethod(name) {
    if (name in transitionMethods) {
        delete transitionMethods[name];
        return true;
    } else
        return false;
};
function _loadNext() {
    if (this._callback) {
        var callback = this._callback;
        this._callback = undefined;
        callback();
    }
    if (this.actionQueue.length <= 0) {
        this.set(this.get());
        return;
    }
    this.currentAction = this.actionQueue.shift();
    this._callback = this.callbackQueue.shift();
    var method = null;
    var endValue = this.currentAction[0];
    var transition = this.currentAction[1];
    if (transition instanceof Object && transition.method) {
        method = transition.method;
        if (typeof method === 'string')
            method = transitionMethods[method];
    } else {
        method = TweenTransition;
    }
    if (this._currentMethod !== method) {
        if (!(endValue instanceof Object) || method.SUPPORTS_MULTIPLE === true || endValue.length <= method.SUPPORTS_MULTIPLE) {
            this._engineInstance = new method();
        } else {
            this._engineInstance = new MultipleTransition(method);
        }
        this._currentMethod = method;
    }
    this._engineInstance.reset(this.state, this.velocity);
    if (this.velocity !== undefined)
        transition.velocity = this.velocity;
    this._engineInstance.set(endValue, transition, _loadNext.bind(this));
}
Transitionable.prototype.set = function set(endState, transition, callback) {
    if (!transition) {
        this.reset(endState);
        if (callback)
            callback();
        return this;
    }
    var action = [
            endState,
            transition
        ];
    this.actionQueue.push(action);
    this.callbackQueue.push(callback);
    if (!this.currentAction)
        _loadNext.call(this);
    return this;
};
Transitionable.prototype.reset = function reset(startState, startVelocity) {
    this._currentMethod = null;
    this._engineInstance = null;
    this._callback = undefined;
    this.state = startState;
    this.velocity = startVelocity;
    this.currentAction = null;
    this.actionQueue = [];
    this.callbackQueue = [];
};
Transitionable.prototype.delay = function delay(duration, callback) {
    this.set(this.get(), {
        duration: duration,
        curve: function () {
            return 0;
        }
    }, callback);
};
Transitionable.prototype.get = function get(timestamp) {
    if (this._engineInstance) {
        if (this._engineInstance.getVelocity)
            this.velocity = this._engineInstance.getVelocity();
        this.state = this._engineInstance.get(timestamp);
    }
    return this.state;
};
Transitionable.prototype.isActive = function isActive() {
    return !!this.currentAction;
};
Transitionable.prototype.halt = function halt() {
    return this.set(this.get());
};
module.exports = Transitionable;
},{"./MultipleTransition":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/transitions/MultipleTransition.js","./TweenTransition":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/transitions/TweenTransition.js"}],"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/transitions/TransitionableTransform.js":[function(require,module,exports){
var Transitionable = require('./Transitionable');
var Transform = require('../core/Transform');
var Utility = require('../utilities/Utility');
function TransitionableTransform(transform) {
    this._final = Transform.identity.slice();
    this._finalTranslate = [
        0,
        0,
        0
    ];
    this._finalRotate = [
        0,
        0,
        0
    ];
    this._finalSkew = [
        0,
        0,
        0
    ];
    this._finalScale = [
        1,
        1,
        1
    ];
    this.translate = new Transitionable(this._finalTranslate);
    this.rotate = new Transitionable(this._finalRotate);
    this.skew = new Transitionable(this._finalSkew);
    this.scale = new Transitionable(this._finalScale);
    if (transform)
        this.set(transform);
}
function _build() {
    return Transform.build({
        translate: this.translate.get(),
        rotate: this.rotate.get(),
        skew: this.skew.get(),
        scale: this.scale.get()
    });
}
function _buildFinal() {
    return Transform.build({
        translate: this._finalTranslate,
        rotate: this._finalRotate,
        skew: this._finalSkew,
        scale: this._finalScale
    });
}
TransitionableTransform.prototype.setTranslate = function setTranslate(translate, transition, callback) {
    this._finalTranslate = translate;
    this._final = _buildFinal.call(this);
    this.translate.set(translate, transition, callback);
    return this;
};
TransitionableTransform.prototype.setScale = function setScale(scale, transition, callback) {
    this._finalScale = scale;
    this._final = _buildFinal.call(this);
    this.scale.set(scale, transition, callback);
    return this;
};
TransitionableTransform.prototype.setRotate = function setRotate(eulerAngles, transition, callback) {
    this._finalRotate = eulerAngles;
    this._final = _buildFinal.call(this);
    this.rotate.set(eulerAngles, transition, callback);
    return this;
};
TransitionableTransform.prototype.setSkew = function setSkew(skewAngles, transition, callback) {
    this._finalSkew = skewAngles;
    this._final = _buildFinal.call(this);
    this.skew.set(skewAngles, transition, callback);
    return this;
};
TransitionableTransform.prototype.set = function set(transform, transition, callback) {
    var components = Transform.interpret(transform);
    this._finalTranslate = components.translate;
    this._finalRotate = components.rotate;
    this._finalSkew = components.skew;
    this._finalScale = components.scale;
    this._final = transform;
    var _callback = callback ? Utility.after(4, callback) : null;
    this.translate.set(components.translate, transition, _callback);
    this.rotate.set(components.rotate, transition, _callback);
    this.skew.set(components.skew, transition, _callback);
    this.scale.set(components.scale, transition, _callback);
    return this;
};
TransitionableTransform.prototype.setDefaultTransition = function setDefaultTransition(transition) {
    this.translate.setDefault(transition);
    this.rotate.setDefault(transition);
    this.skew.setDefault(transition);
    this.scale.setDefault(transition);
};
TransitionableTransform.prototype.get = function get() {
    if (this.isActive()) {
        return _build.call(this);
    } else
        return this._final;
};
TransitionableTransform.prototype.getFinal = function getFinal() {
    return this._final;
};
TransitionableTransform.prototype.isActive = function isActive() {
    return this.translate.isActive() || this.rotate.isActive() || this.scale.isActive() || this.skew.isActive();
};
TransitionableTransform.prototype.halt = function halt() {
    this.translate.halt();
    this.rotate.halt();
    this.skew.halt();
    this.scale.halt();
    this._final = this.get();
    this._finalTranslate = this.translate.get();
    this._finalRotate = this.rotate.get();
    this._finalSkew = this.skew.get();
    this._finalScale = this.scale.get();
    return this;
};
module.exports = TransitionableTransform;
},{"../core/Transform":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/core/Transform.js","../utilities/Utility":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/utilities/Utility.js","./Transitionable":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/transitions/Transitionable.js"}],"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/transitions/TweenTransition.js":[function(require,module,exports){
function TweenTransition(options) {
    this.options = Object.create(TweenTransition.DEFAULT_OPTIONS);
    if (options)
        this.setOptions(options);
    this._startTime = 0;
    this._startValue = 0;
    this._updateTime = 0;
    this._endValue = 0;
    this._curve = undefined;
    this._duration = 0;
    this._active = false;
    this._callback = undefined;
    this.state = 0;
    this.velocity = undefined;
}
TweenTransition.Curves = {
    linear: function (t) {
        return t;
    },
    easeIn: function (t) {
        return t * t;
    },
    easeOut: function (t) {
        return t * (2 - t);
    },
    easeInOut: function (t) {
        if (t <= 0.5)
            return 2 * t * t;
        else
            return -2 * t * t + 4 * t - 1;
    },
    easeOutBounce: function (t) {
        return t * (3 - 2 * t);
    },
    spring: function (t) {
        return (1 - t) * Math.sin(6 * Math.PI * t) + t;
    }
};
TweenTransition.SUPPORTS_MULTIPLE = true;
TweenTransition.DEFAULT_OPTIONS = {
    curve: TweenTransition.Curves.linear,
    duration: 500,
    speed: 0
};
var registeredCurves = {};
TweenTransition.registerCurve = function registerCurve(curveName, curve) {
    if (!registeredCurves[curveName]) {
        registeredCurves[curveName] = curve;
        return true;
    } else {
        return false;
    }
};
TweenTransition.unregisterCurve = function unregisterCurve(curveName) {
    if (registeredCurves[curveName]) {
        delete registeredCurves[curveName];
        return true;
    } else {
        return false;
    }
};
TweenTransition.getCurve = function getCurve(curveName) {
    var curve = registeredCurves[curveName];
    if (curve !== undefined)
        return curve;
    else
        throw new Error('curve not registered');
};
TweenTransition.getCurves = function getCurves() {
    return registeredCurves;
};
function _interpolate(a, b, t) {
    return (1 - t) * a + t * b;
}
function _clone(obj) {
    if (obj instanceof Object) {
        if (obj instanceof Array)
            return obj.slice(0);
        else
            return Object.create(obj);
    } else
        return obj;
}
function _normalize(transition, defaultTransition) {
    var result = { curve: defaultTransition.curve };
    if (defaultTransition.duration)
        result.duration = defaultTransition.duration;
    if (defaultTransition.speed)
        result.speed = defaultTransition.speed;
    if (transition instanceof Object) {
        if (transition.duration !== undefined)
            result.duration = transition.duration;
        if (transition.curve)
            result.curve = transition.curve;
        if (transition.speed)
            result.speed = transition.speed;
    }
    if (typeof result.curve === 'string')
        result.curve = TweenTransition.getCurve(result.curve);
    return result;
}
TweenTransition.prototype.setOptions = function setOptions(options) {
    if (options.curve !== undefined)
        this.options.curve = options.curve;
    if (options.duration !== undefined)
        this.options.duration = options.duration;
    if (options.speed !== undefined)
        this.options.speed = options.speed;
};
TweenTransition.prototype.set = function set(endValue, transition, callback) {
    if (!transition) {
        this.reset(endValue);
        if (callback)
            callback();
        return;
    }
    this._startValue = _clone(this.get());
    transition = _normalize(transition, this.options);
    if (transition.speed) {
        var startValue = this._startValue;
        if (startValue instanceof Object) {
            var variance = 0;
            for (var i in startValue)
                variance += (endValue[i] - startValue[i]) * (endValue[i] - startValue[i]);
            transition.duration = Math.sqrt(variance) / transition.speed;
        } else {
            transition.duration = Math.abs(endValue - startValue) / transition.speed;
        }
    }
    this._startTime = Date.now();
    this._endValue = _clone(endValue);
    this._startVelocity = _clone(transition.velocity);
    this._duration = transition.duration;
    this._curve = transition.curve;
    this._active = true;
    this._callback = callback;
};
TweenTransition.prototype.reset = function reset(startValue, startVelocity) {
    if (this._callback) {
        var callback = this._callback;
        this._callback = undefined;
        callback();
    }
    this.state = _clone(startValue);
    this.velocity = _clone(startVelocity);
    this._startTime = 0;
    this._duration = 0;
    this._updateTime = 0;
    this._startValue = this.state;
    this._startVelocity = this.velocity;
    this._endValue = this.state;
    this._active = false;
};
TweenTransition.prototype.getVelocity = function getVelocity() {
    return this.velocity;
};
TweenTransition.prototype.get = function get(timestamp) {
    this.update(timestamp);
    return this.state;
};
function _calculateVelocity(current, start, curve, duration, t) {
    var velocity;
    var eps = 1e-7;
    var speed = (curve(t) - curve(t - eps)) / eps;
    if (current instanceof Array) {
        velocity = [];
        for (var i = 0; i < current.length; i++) {
            if (typeof current[i] === 'number')
                velocity[i] = speed * (current[i] - start[i]) / duration;
            else
                velocity[i] = 0;
        }
    } else
        velocity = speed * (current - start) / duration;
    return velocity;
}
function _calculateState(start, end, t) {
    var state;
    if (start instanceof Array) {
        state = [];
        for (var i = 0; i < start.length; i++) {
            if (typeof start[i] === 'number')
                state[i] = _interpolate(start[i], end[i], t);
            else
                state[i] = start[i];
        }
    } else
        state = _interpolate(start, end, t);
    return state;
}
TweenTransition.prototype.update = function update(timestamp) {
    if (!this._active) {
        if (this._callback) {
            var callback = this._callback;
            this._callback = undefined;
            callback();
        }
        return;
    }
    if (!timestamp)
        timestamp = Date.now();
    if (this._updateTime >= timestamp)
        return;
    this._updateTime = timestamp;
    var timeSinceStart = timestamp - this._startTime;
    if (timeSinceStart >= this._duration) {
        this.state = this._endValue;
        this.velocity = _calculateVelocity(this.state, this._startValue, this._curve, this._duration, 1);
        this._active = false;
    } else if (timeSinceStart < 0) {
        this.state = this._startValue;
        this.velocity = this._startVelocity;
    } else {
        var t = timeSinceStart / this._duration;
        this.state = _calculateState(this._startValue, this._endValue, this._curve(t));
        this.velocity = _calculateVelocity(this.state, this._startValue, this._curve, this._duration, t);
    }
};
TweenTransition.prototype.isActive = function isActive() {
    return this._active;
};
TweenTransition.prototype.halt = function halt() {
    this.reset(this.get());
};
TweenTransition.registerCurve('linear', TweenTransition.Curves.linear);
TweenTransition.registerCurve('easeIn', TweenTransition.Curves.easeIn);
TweenTransition.registerCurve('easeOut', TweenTransition.Curves.easeOut);
TweenTransition.registerCurve('easeInOut', TweenTransition.Curves.easeInOut);
TweenTransition.registerCurve('easeOutBounce', TweenTransition.Curves.easeOutBounce);
TweenTransition.registerCurve('spring', TweenTransition.Curves.spring);
TweenTransition.customCurve = function customCurve(v1, v2) {
    v1 = v1 || 0;
    v2 = v2 || 0;
    return function (t) {
        return v1 * t + (-2 * v1 - v2 + 3) * t * t + (v1 + v2 - 2) * t * t * t;
    };
};
module.exports = TweenTransition;
},{}],"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/utilities/Utility.js":[function(require,module,exports){
var Utility = {};
Utility.Direction = {
    X: 0,
    Y: 1,
    Z: 2
};
Utility.after = function after(count, callback) {
    var counter = count;
    return function () {
        counter--;
        if (counter === 0)
            callback.apply(this, arguments);
    };
};
Utility.loadURL = function loadURL(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function onreadystatechange() {
        if (this.readyState === 4) {
            if (callback)
                callback(this.responseText);
        }
    };
    xhr.open('GET', url);
    xhr.send();
};
Utility.createDocumentFragmentFromHTML = function createDocumentFragmentFromHTML(html) {
    var element = document.createElement('div');
    element.innerHTML = html;
    var result = document.createDocumentFragment();
    while (element.hasChildNodes())
        result.appendChild(element.firstChild);
    return result;
};
Utility.clone = function clone(b) {
    var a;
    if (typeof b === 'object') {
        a = b instanceof Array ? [] : {};
        for (var key in b) {
            if (typeof b[key] === 'object' && b[key] !== null) {
                if (b[key] instanceof Array) {
                    a[key] = new Array(b[key].length);
                    for (var i = 0; i < b[key].length; i++) {
                        a[key][i] = Utility.clone(b[key][i]);
                    }
                } else {
                    a[key] = Utility.clone(b[key]);
                }
            } else {
                a[key] = b[key];
            }
        }
    } else {
        a = b;
    }
    return a;
};
module.exports = Utility;
},{}],"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/src/Components/EasyCamera.js":[function(require,module,exports){
var Modifier       = require('famous/src/core/Modifier');
var FamousEngine = require('famous/src/core/Engine'); 
var Utils = require('./Utils'); 
var FM = require('./OldMatrix');    
var Vector = require('famous/src/math/Vector');
var Quat = require('./OldQuaternion');

function EasyCamera()
{
    this.renderMatrix = FM.identity; 

    this.doubleClickToReset = true; 
    this.touchTime = (new Date()).getTime();
    this.clickTime = (new Date()).getTime();
    this.deltaTime = 200;         

    this.viewWidth = Utils.getWidth(); 
    this.viewHeight = Utils.getHeight(); 
    this.radius = Math.max(this.viewWidth, this.viewHeight)*0.5; 

    this.center = new Vector(this.viewWidth*.5, this.viewHeight*.5, 0.0); 

    this.axis = new Vector(0.0, 1.0, 0.0); 
    this.theta = 0.0;       
    
    this.flipX = 1.0; 
    this.flipY = 1.0; 
    this.flipZ = 1.0; 

    this.t1 = new Vector(); 
    this.t2 = new Vector(); 

    this.pt1 = new Vector(); 
    this.pt2 = new Vector();

    this.damping = .95; 

    this.zAcc = 0.0; 
    this.zVel = 0.0; 
    
    this.dt = 0.0;
    this.pdt = 0.0; //Previous distance Between Two Touches 

    this.distance = -100.0; 
    this.position = new Vector(0, 0, this.distance); 
    this.rotation = new Vector(0, 0, 0); 
    this.e_mtx = FM.identity;  
    this.q_rot = new Quat();
    this.q_mtx = FM.identity;  
    this.quat = new Quat(); 
    this.d_mtx = FM.identity; 

    this.sensitivityRotation = 0.5; 
    this.sensitivityZoom = 3.0; 

    this.touchDown = false; 
    this.mouseDown = false; 

    FamousEngine.on('prerender', this._update.bind(this));         
    FamousEngine.on('touchstart', this.touchstart.bind(this));                 
    FamousEngine.on('touchmove', this.touchmove.bind(this));                 
    FamousEngine.on('touchend', this.touchend.bind(this));                         
    FamousEngine.on('resize', this.resize.bind(this));                 
    
    FamousEngine.on('mousedown', this.mousedown.bind(this));                         
    FamousEngine.on('mousemove', this.mousemove.bind(this));                         
    FamousEngine.on('mouseup', this.mouseup.bind(this));                                         
    window.addEventListener('mousewheel', this.mousewheel.bind(this));     
    this.updateMatrix(); 

    this.mod = new Modifier({
        origin: [0.5, 0.5],
        align: [0.5, 0.5],
        transform : function() {
            return this.renderMatrix;
        }.bind(this)
    });
}

EasyCamera.prototype._update = function(event)
{
    this.update(); 
    if(!this.mouseDown && !this.touchDown && this.theta > 0.0001)
    {                
        this.quat.makeFromAngleAndAxis(this.theta * this.sensitivityRotation, this.axis);             
        this.q_rot = this.q_rot.multiply(this.quat);       
        this.q_mtx = this.q_rot.getMatrix(); 
        this.updateMatrix();
        this.theta*=this.damping; 
    }            
}; 

EasyCamera.prototype.update = function(event)
{
    
}; 

EasyCamera.prototype.setFlipX = function(v)
{
    if(v)
    {
        this.flipX = -1.0; 
    }
    else
    {
        this.flipX = 1.0; 
    }
};

EasyCamera.prototype.setFlipY = function(v)
{
    if(v)
    {
        this.flipY = -1.0; 
    }
    else
    {
        this.flipY = 1.0; 
    }
};

EasyCamera.prototype.setFlipZ = function(v)
{
    if(v)
    {
        this.flipZ = -1.0; 
    }
    else
    {
        this.flipZ = 1.0; 
    }
};

EasyCamera.prototype.setSensitivityZoom = function(z)
{
    this.sensitivityZoom = z; 
};

EasyCamera.prototype.setSensitivityRotation = function(r)
{
    this.sensitivityRotation = r; 
};

EasyCamera.prototype.setDistance = function(d)
{
    this.distance = d; 
    this.position.z = this.distance;         
    this.setPosition(this.position);    
};

EasyCamera.prototype.setPosition = function(p)
{
    this.position.set(p); 
    this.updateMatrix();         
};

EasyCamera.prototype.applyQuaternionRotation = function(q)
{
    this.q_rot = this.q_rot.multiply(q);       
    this.q_mtx = this.q_rot.getMatrix(); 
    this.updateMatrix();        
};

EasyCamera.prototype.applyEulerRotation = function(phi, theta, psi)
{
    this.rotation.setXYZ(phi, theta, psi); 
    this.e_mtx = FM.rotate(phi, theta, psi);
    this.updateMatrix(); 
};

EasyCamera.prototype.updateMatrix = function()
{

    var arr = [this.position.x, this.position.y, this.position.z];
    var a1 = FM.multiply(this.q_mtx, this.e_mtx)
    this.renderMatrix = FM.move(a1, arr);
};

EasyCamera.prototype.getRotationMatrix = function()
{
    return this.q_mtx; 
}; 

EasyCamera.prototype.getMatrix = function()
{
    return this.renderMatrix; 
}; 

EasyCamera.prototype.reset = function()
{        
    this.theta = 0.0; 
    this.q_rot.clear();            
    this.q_mtx = this.d_mtx; 
    this.position.clear();
    this.position.setXYZ(0.0, 0.0, this.distance);          
    this.updateMatrix();
};

EasyCamera.prototype.setDefaultMatrix = function(mtx)
{
    this.d_mtx = mtx; 
}; 

EasyCamera.prototype.clickCheckForCameraRestart = function()
{    
    var newTime = (new Date()).getTime();             
    if(newTime - this.clickTime < this.deltaTime && this.doubleClickToReset)
    {               
        this.reset(); 
    }

    this.clickTime = newTime; 
};

EasyCamera.prototype.touchCheckForCameraRestart = function()
{
    var newTime = (new Date()).getTime();             
    if(newTime - this.touchTime < this.deltaTime && this.doubleClickToReset)
    {               
        this.reset(); 
    }

    this.touchTime = newTime; 
};

EasyCamera.prototype.touchstart = function(event) 
{
    if(event.touches.length == 1)
    {
        this.touchDown = true; 
        this.touchCheckForCameraRestart();         
        this.theta = 0.0; 
        this.t1.clear(); 
        this.pt1.clear(); 
        this.quat.clear(); 
        this.setArcBallVector(event.touches[0].clientX, event.touches[0].clientY);                         
    }
    else if(event.touches.length == 2)            
    {
        this.t1.setXYZ(event.touches[0].clientX, event.touches[0].clientY, 0.0);
        this.t2.setXYZ(event.touches[1].clientX, event.touches[1].clientY, 0.0); 
        
        this.pt1.set(this.t1); 
        this.pt2.set(this.t2); 
        
        this.dt = Utils.distance(this.t1.x, this.t1.y, this.t2.x, this.t2.y); 
        this.pdt = this.dt; 
    }        
};

EasyCamera.prototype.touchmove = function(event)
{
    if(event.touches.length == 1)
    {
        this.setArcBallVector(event.touches[0].clientX, event.touches[0].clientY); 
        this.updateArcBallRotation(); 
    }
    else if(event.touches.length == 2)            
    {
        this.t1.setXYZ(event.touches[0].clientX, event.touches[0].clientY, 0.0); 
        this.t2.setXYZ(event.touches[1].clientX, event.touches[1].clientY, 0.0); 

        this.dt = Utils.distance(this.t1.x, this.t1.y, this.t2.x, this.t2.y);             
        
        this.position.z += this.flipZ*(this.dt-this.pdt)/this.sensitivityZoom;         
        this.updateMatrix();

        this.pt1.set(this.t1); 
        this.pt2.set(this.t2);          

        this.pdt = this.dt; 
    }
};

EasyCamera.prototype.touchend = function(event)
{
    if(event.touches.length == 1)
    {            
        this.t1.clear(); 
        this.pt1.clear(); 
        this.quat.clear(); 
    }
    else if(event.touches.length == 2)            
    {
        this.t1.clear(); 
        this.pt1.clear(); 
        
        this.t2.clear(); 
        this.pt2.clear(); 
        
        this.dt = 0.0; 
        this.pdt = 0.0; 
    }
};

EasyCamera.prototype.setArcBallVector = function(x, y)
{                
    this.pt1.set(this.t1); 
    this.t1.clear(); 
    
    this.t1.x = this.flipX * -1.0 * (x - this.center.x) / this.radius; 
    this.t1.y = this.flipY * -1.0 * (y - this.center.y) / this.radius;                 

    var r = this.t1.norm(); 
    if(r > 1.0)
    {
        this.t1.normalize(1.0, this.t1);          
    }
    else
    {
        this.t1.z = Math.sqrt(1.0 - r); 
    }                
};

EasyCamera.prototype.updateArcBallRotation = function()
{        
    this.theta = Math.acos(this.t1.dot(this.pt1)); 
    this.axis = this.pt1.cross(this.t1, this.axis);   
    this.quat.makeFromAngleAndAxis(this.theta * this.sensitivityRotation, this.axis);             
    this.q_rot = this.q_rot.multiply(this.quat);       
    this.q_mtx = this.q_rot.getMatrix(); 
    this.updateMatrix();
}

EasyCamera.prototype.emit = function(type, event)
{
    if(type == 'prerender')    this.update(event);    
    else if(type == 'touchstart')        this.touchstart(event);
    else if(type == 'touchmove')    this.touchmove(event);
    else if(type == 'touchend')     this.touchend(event);
    else if(type == 'resize')       this.resize(event);            
};

EasyCamera.prototype.mousemove = function(event)
{  
    if(this.mouseDown) 
    {
        this.setArcBallVector(event.clientX, event.clientY);             
        this.updateArcBallRotation();             
    }
};

EasyCamera.prototype.mousedown = function(event)
{            
    this.mouseDown = true;                 
    this.clickCheckForCameraRestart();         
    this.theta = 0.0; 
    this.t1.clear(); 
    this.pt1.clear(); 
    this.quat.clear();            
    this.setArcBallVector(event.clientX, event.clientY);              
}

EasyCamera.prototype.mouseup = function(event)
{      
    this.mouseDown = false; 
}; 

EasyCamera.prototype.mousewheel = function(event)
{                

    this.position.z += this.flipZ*Utils.limit(event.wheelDelta, -500, 500)*.01*this.sensitivityZoom;         
    this.updateMatrix(); 
    // this.zAcc = Utils.limit(event.wheelDelta,-10,10); 
    // this.zVel += this.zAcc; 
    // this.zVel = Utils.limit(this.zVel, -2, 2);         
};

EasyCamera.prototype.resize = function(event) 
{        
    this.viewWidth = Utils.getWidth(); 
    this.viewHeight = Utils.getHeight(); 
    this.center = new Vector(this.viewWidth*.5, this.viewHeight*.5, 0.0); 
    this.radius = Math.min(this.viewWidth, this.viewHeight)*0.5;         
};

EasyCamera.prototype.setDamping = function(d) 
{        
    this.damping = d;
};

EasyCamera.prototype.render = function(input) 
{
    return {
        transform: this.renderMatrix,
        origin: [.5, .5],
        target: input

    }; 
};

module.exports = EasyCamera;


},{"./OldMatrix":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/src/Components/OldMatrix.js","./OldQuaternion":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/src/Components/OldQuaternion.js","./Utils":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/src/Components/Utils.js","famous/src/core/Engine":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/core/Engine.js","famous/src/core/Modifier":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/core/Modifier.js","famous/src/math/Vector":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/math/Vector.js"}],"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/src/Components/OldMatrix.js":[function(require,module,exports){

/**
 * @namespace FamousMatrix
 * 
 * @description 
 *  * A high-performance matrix math library used to calculate 
 *   affine transforms on surfaces and other renderables.
 *   Famous uses 4x4 matrices corresponding directly to
 *   WebKit matrices (row-major order)
 *    
 *    The internal "type" of a FamousMatrix is a 16-long float array in 
 *    row-major order, with:
 *      * elements [0],[1],[2],[4],[5],[6],[8],[9],[10] forming the 3x3
 *          transformation matrix
 *      * elements [12], [13], [14] corresponding to the t_x, t_y, t_z 
 *          affine translation.
 *      * element [15] always set to 1.
 * 
 * Scope: Ideally, none of these functions should be visible below the 
 * component developer level.
 *
 * @static
 * 
 * @name FamousMatrix
 */
var FamousMatrix = {};

// WARNING: these matrices correspond to WebKit matrices, which are
//    transposed from their math counterparts
FamousMatrix.precision = 1e-6;
FamousMatrix.identity = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

/**
 * Multiply two or more FamousMatrix types to return a FamousMatrix.
 *
 * @name FamousMatrix#multiply4x4
 * @function
 * @param {FamousMatrix} a left matrix
 * @param {FamousMatrix} b right matrix
 * @returns {FamousMatrix} the resulting matrix
 */
FamousMatrix.multiply4x4 = function multiply4x4(a, b) {
    var result = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    result[0] = a[0] * b[0] + a[1] * b[4] + a[2] * b[8] + a[3] * b[12];
    result[1] = a[0] * b[1] + a[1] * b[5] + a[2] * b[9] + a[3] * b[13];
    result[2] = a[0] * b[2] + a[1] * b[6] + a[2] * b[10] + a[3] * b[14];
    result[3] = a[0] * b[3] + a[1] * b[7] + a[2] * b[11] + a[3] * b[15];
    result[4] = a[4] * b[0] + a[5] * b[4] + a[6] * b[8] + a[7] * b[12];
    result[5] = a[4] * b[1] + a[5] * b[5] + a[6] * b[9] + a[7] * b[13];
    result[6] = a[4] * b[2] + a[5] * b[6] + a[6] * b[10] + a[7] * b[14];
    result[7] = a[4] * b[3] + a[5] * b[7] + a[6] * b[11] + a[7] * b[15];
    result[8] = a[8] * b[0] + a[9] * b[4] + a[10] * b[8] + a[11] * b[12];
    result[9] = a[8] * b[1] + a[9] * b[5] + a[10] * b[9] + a[11] * b[13];
    result[10] = a[8] * b[2] + a[9] * b[6] + a[10] * b[10] + a[11] * b[14];
    result[11] = a[8] * b[3] + a[9] * b[7] + a[10] * b[11] + a[11] * b[15];
    result[12] = a[12] * b[0] + a[13] * b[4] + a[14] * b[8] + a[15] * b[12];
    result[13] = a[12] * b[1] + a[13] * b[5] + a[14] * b[9] + a[15] * b[13];
    result[14] = a[12] * b[2] + a[13] * b[6] + a[14] * b[10] + a[15] * b[14];
    result[15] = a[12] * b[3] + a[13] * b[7] + a[14] * b[11] + a[15] * b[15];
    if(arguments.length <= 2)  return result;
    else return multiply4x4.apply(null, [result].concat(Array.prototype.slice.call(arguments, 2)));
};

/**
 * Fast-multiply two or more FamousMatrix types to return a
 *    FamousMatrix, assuming right column on each is [0 0 0 1]^T.
 *    
 * @name FamousMatrix#multiply
 * @function
 * @param {FamousMatrix} a left matrix
 * @param {FamousMatrix} b right matrix
 * @param {...FamousMatrix} c additional matrices to be multiplied in 
 *    order
 * @returns {FamousMatrix} the resulting matrix
 */ 
FamousMatrix.multiply = function multiply(a, b, c) {
    if(!a || !b) return a || b;
    var result = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1];
    result[0] = a[0] * b[0] + a[1] * b[4] + a[2] * b[8];
    result[1] = a[0] * b[1] + a[1] * b[5] + a[2] * b[9];
    result[2] = a[0] * b[2] + a[1] * b[6] + a[2] * b[10];
    result[4] = a[4] * b[0] + a[5] * b[4] + a[6] * b[8];
    result[5] = a[4] * b[1] + a[5] * b[5] + a[6] * b[9];
    result[6] = a[4] * b[2] + a[5] * b[6] + a[6] * b[10];
    result[8] = a[8] * b[0] + a[9] * b[4] + a[10] * b[8];
    result[9] = a[8] * b[1] + a[9] * b[5] + a[10] * b[9];
    result[10] = a[8] * b[2] + a[9] * b[6] + a[10] * b[10];
    result[12] = a[12] * b[0] + a[13] * b[4] + a[14] * b[8] + b[12];
    result[13] = a[12] * b[1] + a[13] * b[5] + a[14] * b[9] + b[13];
    result[14] = a[12] * b[2] + a[13] * b[6] + a[14] * b[10] + b[14];
    if(arguments.length <= 2)  return result;
    else return multiply.apply(null, [result].concat(Array.prototype.slice.call(arguments, 2)));
};

/**
 * Return a FamousMatrix translated by additional amounts in each
 *    dimension.
 *    
 * @name FamousMatrix#move
 * @function
 * @param {FamousMatrix} m a matrix
 * @param {Array.<number>} t delta vector (array of floats && 
 *    array.length == 2 || 3)
 * @returns {FamousMatrix} the resulting translated matrix
 */ 
FamousMatrix.move = function(m, t) {
    if(!t[2]) t[2] = 0;
    return [m[0], m[1], m[2], 0, m[4], m[5], m[6], 0, m[8], m[9], m[10], 0, m[12] + t[0], m[13] + t[1], m[14] + t[2], 1];
};

/**
 * Return a FamousMatrix which represents the result of a transform matrix
 * applied after a move. This is faster than the equivalent multiply.
 * 
 * @name FamousMatrix#moveThen
 * @function
 *
 * @param {Array.number} v vector representing initial movement
 * @param {FamousMatrix} m matrix to apply afterwards
 * @returns {FamousMatrix} the resulting matrix
 */
FamousMatrix.moveThen = function(v, m) {
    if(!v[2]) v[2] = 0;
    var t0 = v[0]*m[0] + v[1]*m[4] + v[2]*m[8];
    var t1 = v[0]*m[1] + v[1]*m[5] + v[2]*m[9];
    var t2 = v[0]*m[2] + v[1]*m[6] + v[2]*m[10];
    return FamousMatrix.move(m, [t0, t1, t2]);
};

/**
 * Return a FamousMatrix which represents a translation by specified
 *    amounts in each dimension.
 *    
 * @name FamousMatrix#translate
 * @function
 * @param {number} x x translation (delta_x)
 * @param {number} y y translation (delta_y)
 * @param {number} z z translation (delta_z)
 * @returns {FamousMatrix} the resulting matrix
 */ 
FamousMatrix.translate = function(x, y, z) {
    if(z === undefined) z = 0;
    return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1];
};

/**
 * Return a FamousMatrix which represents a scale by specified amounts
 *    in each dimension.
 *    
 * @name FamousMatrix#scale
 * @function  
 *
 * @param {number} x x scale factor
 * @param {number} y y scale factor
 * @param {number} z z scale factor
 * @returns {FamousMatrix} the resulting matrix
 */ 
FamousMatrix.scale = function(x, y, z) {
    if(z === undefined) z = 1;
    return [x, 0, 0, 0, 0, y, 0, 0, 0, 0, z, 0, 0, 0, 0, 1];
};

/**
 * Return a FamousMatrix which represents a specified clockwise
 *    rotation around the x axis.
 *    
 * @name FamousMatrix#rotateX
 * @function
 *
 * @param {number} theta radians
 * @returns {FamousMatrix} the resulting matrix
 */ 
FamousMatrix.rotateX = function(theta) {
    var cosTheta = Math.cos(theta);
    var sinTheta = Math.sin(theta);
    return [1, 0, 0, 0, 0, cosTheta, sinTheta, 0, 0, -sinTheta, cosTheta, 0, 0, 0, 0, 1];
};

/**
 * Return a FamousMatrix which represents a specified clockwise
 *    rotation around the y axis.
 *    
 * @name FamousMatrix#rotateY
 * @function
 *
 * @returns {FamousMatrix} the resulting matrix
 */ 
FamousMatrix.rotateY = function(theta) {
    var cosTheta = Math.cos(theta);
    var sinTheta = Math.sin(theta);
    return [cosTheta, 0, -sinTheta, 0, 0, 1, 0, 0, sinTheta, 0, cosTheta, 0, 0, 0, 0, 1];
};

/**
 * Return a FamousMatrix which represents a specified clockwise
 *    rotation around the z axis.
 *    
 * @name FamousMatrix#rotateZ
 * @function
 *
 * @param {number} theta radians
 * @returns {FamousMatrix} the resulting matrix
 */ 
FamousMatrix.rotateZ = function(theta) {
    var cosTheta = Math.cos(theta);
    var sinTheta = Math.sin(theta);
    return [cosTheta, sinTheta, 0, 0, -sinTheta, cosTheta, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
};

/**
 * Return a FamousMatrix which represents composed clockwise
 *    rotations along each of the axes. Equivalent to the result of
 *    multiply(rotateX(phi), rotateY(theta), rotateZ(psi))
 *    
 * @name FamousMatrix#rotate
 * @function
 *
 * @param {number} phi radians to rotate about the positive x axis
 * @param {number} theta radians to rotate about the positive y axis
 * @param {number} psi radians to rotate about the positive z axis
 * @returns {FamousMatrix} the resulting matrix
 */ 
FamousMatrix.rotate = function(phi, theta, psi) {
    var cosPhi = Math.cos(phi);
    var sinPhi = Math.sin(phi);
    var cosTheta = Math.cos(theta);
    var sinTheta = Math.sin(theta);
    var cosPsi = Math.cos(psi);
    var sinPsi = Math.sin(psi);
    var result = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1];
    result[0] = cosTheta * cosPsi;
    result[1] = cosPhi * sinPsi + sinPhi * sinTheta * cosPsi;
    result[2] = sinPhi * sinPsi - cosPhi * sinTheta * cosPsi;
    result[4] = -cosTheta * sinPsi;
    result[5] = cosPhi * cosPsi - sinPhi * sinTheta * sinPsi;
    result[6] = sinPhi * cosPsi + cosPhi * sinTheta * sinPsi;
    result[8] = sinTheta;
    result[9] = -sinPhi * cosTheta;
    result[10] = cosPhi * cosTheta;
    return result;
};

/**
 * Return a FamousMatrix which represents an axis-angle rotation
 *
 * @name FamousMatrix#rotateAxis
 * @function
 *
 * @param {Array.number} v unit vector representing the axis to rotate about
 * @param {number} theta radians to rotate clockwise about the axis
 * @returns {FamousMatrix} the resulting matrix
 */ 
FamousMatrix.rotateAxis = function(v, theta) {
    var sinTheta = Math.sin(theta);
    var cosTheta = Math.cos(theta);
    var verTheta = 1 - cosTheta; // versine of theta

    var xxV = v[0]*v[0]*verTheta;
    var xyV = v[0]*v[1]*verTheta;
    var xzV = v[0]*v[2]*verTheta;
    var yyV = v[1]*v[1]*verTheta;
    var yzV = v[1]*v[2]*verTheta;
    var zzV = v[2]*v[2]*verTheta;
    var xs = v[0]*sinTheta;
    var ys = v[1]*sinTheta;
    var zs = v[2]*sinTheta;

    var result = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1];
    result[0] = xxV + cosTheta;
    result[1] = xyV + zs;
    result[2] = xzV - ys;
    result[4] = xyV - zs;
    result[5] = yyV + cosTheta;
    result[6] = yzV + xs;
    result[8] = xzV + ys;
    result[9] = yzV - xs;
    result[10] = zzV + cosTheta;
    return result;
};

/**
 * Return a FamousMatrix which represents a transform matrix applied about
 * a separate origin point.
 * 
 * @name FamousMatrix#aboutOrigin
 * @function
 *
 * @param {Array.number} v origin point to apply matrix
 * @param {FamousMatrix} m matrix to apply
 * @returns {FamousMatrix} the resulting matrix
 */
FamousMatrix.aboutOrigin = function(v, m) {
    var t0 = v[0] - (v[0]*m[0] + v[1]*m[4] + v[2]*m[8]);
    var t1 = v[1] - (v[0]*m[1] + v[1]*m[5] + v[2]*m[9]);
    var t2 = v[2] - (v[0]*m[2] + v[1]*m[6] + v[2]*m[10]);
    return FamousMatrix.move(m, [t0, t1, t2]);
};

/**
 * Return a FamousMatrix's webkit css representation to be used with the
 *    CSS3 -webkit-transform style. 
 * @example: -webkit-transform: matrix3d(1,0,0,0,0,1,0,0,0,0,1,0,716,243,0,1)
 *
 * @name FamousMatrix#formatCSS
 * @function
 * 
 * @param {FamousMatrix} m a Famous matrix
 * @returns {string} matrix3d CSS style representation of the transform
 */ 
FamousMatrix.formatCSS = function(m) {
    var n = m.slice(0);
    for(var i = 0; i < n.length; i++) if(n[i] < 0.000001 && n[i] > -0.000001) n[i] = 0;
    return 'matrix3d(' + n.join() + ')';
};

/**
 * Return a FamousMatrix representatikon of a skew transformation
 *
 * @name FamousMatrix#skew
 * @function
 * 
 * @param {number} psi radians skewed about the yz plane
 * @param {number} theta radians skewed about the xz plane
 * @param {number} phi radians skewed about the xy plane
 * @returns {FamousMatrix} the resulting matrix
 */ 
FamousMatrix.skew = function(phi, theta, psi) {
    return [1, 0, 0, 0, Math.tan(psi), 1, 0, 0, Math.tan(theta), Math.tan(phi), 1, 0, 0, 0, 0, 1];
};

/**
 * Return translation vector component of given FamousMatrix
 * 
 * @name FamousMatrix#getTranslate
 * @function
 *
 * @param {FamousMatrix} m matrix
 * @returns {Array.<number>} the translation vector [t_x, t_y, t_z]
 */ 
FamousMatrix.getTranslate = function(m) {
    return [m[12], m[13], m[14]];
};

/**
 * Return inverse affine matrix for given FamousMatrix. 
 * Note: This assumes m[3] = m[7] = m[11] = 0, and m[15] = 1. 
 *       Incorrect results if not invertable or preconditions not met.
 *
 * @name FamousMatrix#inverse
 * @function
 * 
 * @param {FamousMatrix} m matrix
 * @returns {FamousMatrix} the resulting inverted matrix
 */ 
FamousMatrix.inverse = function(m) {
    var result = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1];
    // only need to consider 3x3 section for affine
    var c0 = m[5]*m[10] - m[6]*m[9];
    var c1 = m[4]*m[10] - m[6]*m[8];
    var c2 = m[4]*m[9] - m[5]*m[8];
    var c4 = m[1]*m[10] - m[2]*m[9];
    var c5 = m[0]*m[10] - m[2]*m[8];
    var c6 = m[0]*m[9] - m[1]*m[8];
    var c8 = m[1]*m[6] - m[2]*m[5];
    var c9 = m[0]*m[6] - m[2]*m[4];
    var c10 = m[0]*m[5] - m[1]*m[4];
    var detM = m[0]*c0 - m[1]*c1 + m[2]*c2;
    var invD = 1/detM;
    result[0] = invD * c0;
    result[1] = -invD * c4;
    result[2] = invD * c8;
    result[4] = -invD * c1;
    result[5] = invD * c5;
    result[6] = -invD * c9;
    result[8] = invD * c2;
    result[9] = -invD * c6;
    result[10] = invD * c10;
    result[12] = -m[12]*result[0] - m[13]*result[4] - m[14]*result[8];
    result[13] = -m[12]*result[1] - m[13]*result[5] - m[14]*result[9];
    result[14] = -m[12]*result[2] - m[13]*result[6] - m[14]*result[10];
    return result;
};

/**
 * Decompose FamousMatrix into separate .translate, .rotate, .scale,
 *    .skew components.
 *    
 * @name FamousMatrix#interpret
 * @function
 *
 * @param {FamousMatrix} M matrix
 * @returns {matrixSpec} object with component matrices .translate,
 *    .rotate, .scale, .skew
 */ 
FamousMatrix.interpret = function(M) {

    // QR decomposition via Householder reflections

    function normSquared(v){
        if (v.length == 2)
            return v[0]*v[0] + v[1]*v[1];
        else
            return v[0]*v[0] + v[1]*v[1] + v[2]*v[2];
    };

    function norm(v){
        return Math.sqrt(normSquared(v));
    };

    function sign(n){
        return (n < 0) ? -1 : 1;
    };


    //FIRST ITERATION

    //default Q1 to the identity matrix;
    var x = [M[0], M[1], M[2]];                 // first column vector
    var sgn = sign(x[0]);                       // sign of first component of x (for stability)
    var xNorm = norm(x);                       // norm of first column vector
    var v = [x[0] + sgn * xNorm, x[1], x[2]];  // v = x + sign(x[0])|x|e1
    var mult = 2 / normSquared(v);              // mult = 2/v'v

    //evaluate Q1 = I - 2vv'/v'v
    var Q1 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1];

    //diagonals
    Q1[0]  = 1 - mult * v[0] * v[0];    // 0,0 entry
    Q1[5]  = 1 - mult * v[1] * v[1];    // 1,1 entry
    Q1[10] = 1 - mult * v[2] * v[2];    // 2,2 entry

    //upper diagonal
    Q1[1] = -mult * v[0] * v[1];        // 0,1 entry
    Q1[2] = -mult * v[0] * v[2];        // 0,2 entry
    Q1[6] = -mult * v[1] * v[2];        // 1,2 entry

    //lower diagonal
    Q1[4] = Q1[1];                      // 1,0 entry
    Q1[8] = Q1[2];                      // 2,0 entry
    Q1[9] = Q1[6];                      // 2,1 entry

    //reduce first column of M
    var MQ1 = FamousMatrix.multiply(M, Q1);


    //SECOND ITERATION on (1,1) minor
    var x2 = [MQ1[5], MQ1[6]];
    var sgn2 = sign(x2[0]);                              // sign of first component of x (for stability)
    var x2Norm = norm(x2);                              // norm of first column vector
    var v2 = [x2[0] + sgn2 * x2Norm, x2[1]];            // v = x + sign(x[0])|x|e1
    var mult2 = 2 / normSquared(v2);                     // mult = 2/v'v

    //evaluate Q2 = I - 2vv'/v'v
    var Q2 = [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1];

    //diagonal
    Q2[5]  = 1 - mult2 * v2[0] * v2[0]; // 1,1 entry
    Q2[10] = 1 - mult2 * v2[1] * v2[1]; // 2,2 entry

    //off diagonals
    Q2[6] = -mult2 * v2[0] * v2[1];     // 2,1 entry
    Q2[9] = Q2[6];                      // 1,2 entry


    //calc QR decomposition. Q = Q1*Q2, R = Q'*M
    var Q = FamousMatrix.multiply(Q1, Q2);              //note: really Q transpose
    var R = FamousMatrix.multiply(M, Q);

    //remove negative scaling
    var remover = FamousMatrix.scale(R[0] < 0 ? -1 : 1, R[5] < 0 ? -1 : 1, R[10] < 0 ? -1 : 1);
    R = FamousMatrix.multiply(remover, R);
    Q = FamousMatrix.multiply(Q, remover);

    //decompose into rotate/scale/skew matrices
    var result = {};
    result.translate = FamousMatrix.getTranslate(M);
    result.rotate = [Math.atan2(-Q[6], Q[10]), Math.asin(Q[2]), Math.atan2(-Q[1], Q[0])];
    if(!result.rotate[0]) {
        result.rotate[0] = 0;
        result.rotate[2] = Math.atan2(Q[4], Q[5]);
    }
    result.scale = [R[0], R[5], R[10]];
    result.skew = [Math.atan(R[9]/result.scale[2]), Math.atan(R[8]/result.scale[2]), Math.atan(R[4]/result.scale[0])];

    //double rotation workaround
    if(Math.abs(result.rotate[0]) + Math.abs(result.rotate[2]) > 1.5*Math.PI) {
        result.rotate[1] = Math.PI - result.rotate[1];
        if(result.rotate[1] > Math.PI) result.rotate[1] -= 2*Math.PI;
        if(result.rotate[1] < -Math.PI) result.rotate[1] += 2*Math.PI;
        if(result.rotate[0] < 0) result.rotate[0] += Math.PI;
        else result.rotate[0] -= Math.PI;
        if(result.rotate[2] < 0) result.rotate[2] += Math.PI;
        else result.rotate[2] -= Math.PI;
    }   

    return result;

};

/**
 * Compose .translate, .rotate, .scale, .skew components into into
 *    FamousMatrix
 *    
 * @name FamousMatrix#build
 * @function
 *
 * @param {matrixSpec} spec object with component matrices .translate,
 *    .rotate, .scale, .skew
 * @returns {FamousMatrix} composed martix
 */ 
FamousMatrix.build = function(spec) {
    var scaleMatrix = FamousMatrix.scale(spec.scale[0], spec.scale[1], spec.scale[2]);
    var skewMatrix = FamousMatrix.skew(spec.skew[0], spec.skew[1], spec.skew[2]);
    var rotateMatrix = FamousMatrix.rotate(spec.rotate[0], spec.rotate[1], spec.rotate[2]);
    return FamousMatrix.move(FamousMatrix.multiply(scaleMatrix, skewMatrix, rotateMatrix), spec.translate);
};

/**
 * Determine if two FamousMatrixes are component-wise equal
 * 
 * @name FamousMatrix#equals
 * @function
 * 
 * @param {FamousMatrix} a matrix
 * @param {FamousMatrix} b matrix
 * @returns {boolean} 
 */ 
FamousMatrix.equals = function(a, b) {
    if(a === b) return true;
    if(!a || !b) return false;
    for(var i = 0; i < a.length; i++) if(a[i] != b[i]) return false;
    return true;
};

/**
 * Constrain angle-trio components to range of [-pi, pi).
 *
 * @name FamousMatrix#normalizeRotation
 * @function
 * 
 * @param {Array.<number>} rotation phi, theta, psi (array of floats 
 *    && array.length == 3)
 * @returns {Array.<number>} new phi, theta, psi triplet
 *    (array of floats && array.length == 3)
 */ 
FamousMatrix.normalizeRotation = function(rotation) {
    var result = rotation.slice(0);
    if(result[0] == Math.PI/2 || result[0] == -Math.PI/2) {
        result[0] = -result[0];
        result[1] = Math.PI - result[1];
        result[2] -= Math.PI;
    }
    if(result[0] > Math.PI/2) {
        result[0] = result[0] - Math.PI;
        result[1] = Math.PI - result[1];
        result[2] -= Math.PI;
    }
    if(result[0] < -Math.PI/2) {
        result[0] = result[0] + Math.PI;
        result[1] = -Math.PI - result[1];
        result[2] -= Math.PI;
    }
    while(result[1] < -Math.PI) result[1] += 2*Math.PI;
    while(result[1] >= Math.PI) result[1] -= 2*Math.PI;
    while(result[2] < -Math.PI) result[2] += 2*Math.PI;
    while(result[2] >= Math.PI) result[2] -= 2*Math.PI;
    return result;
};

/**
 * Transform vector by a matrix, through right-multiplying by matrix.
 * 
 * @name FamousMatrix#vecMultiply
 * @function
 *
 * @param {Array.<number>} vec x,y,z vector 
 *    (array of floats && array.length == 3)
 * @param {FamousMatrix} m matrix
 * @returns {Array.<number>} the resulting vector
 *    (array of floats && array.length == 3)
 */ 
FamousMatrix.vecMultiply = function(vec, m) {
    return [
        vec[0]*m[0] + vec[1]*m[4] + vec[2]*m[8] + m[12],
        vec[0]*m[1] + vec[1]*m[5] + vec[2]*m[9] + m[13],
        vec[0]*m[2] + vec[1]*m[6] + vec[2]*m[10] + m[14]
    ];
};

/** 
 * Apply visual perspective factor p to vector.
 *
 * @name FamousMatrix#applyPerspective
 * @function
 * @param {Array.<number>} vec x,y,z vector (array of floats && array.length == 3)
 * @param {number} p perspective factor
 * @returns {Array.<number>} the resulting x,y vector (array of floats 
 *    && array.length == 2)
 */
FamousMatrix.applyPerspective = function(vec, p) {
    var scale = p/(p - vec[2]);
    return [scale * vec[0], scale * vec[1]];
};

module.exports = FamousMatrix;

},{}],"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/src/Components/OldQuaternion.js":[function(require,module,exports){

var FM = require('./OldMatrix');

/**
 * @constructor
 */
function Quaternion(w,x,y,z){
    this.w = (w !== undefined) ? w : 1.0;  //Angle
    this.x = x || 0.0;  //Axis.x
    this.y = y || 0.0;  //Axis.y
    this.z = z || 0.0;  //Axis.z        
    return this;
};

Quaternion.prototype.makeFromAngleAndAxis = function(angle, v)
{        
    v.normalize(); 
    var ha = angle*0.5; 
    var s = Math.sin(ha);         
    this.x = s*v.x; 
    this.y = s*v.y; 
    this.z = s*v.z; 
    this.w = Math.cos(ha);         
    return this; 
};     

Quaternion.prototype.clone = function()
{
    return new Quaternion(this.w, this.x, this.y, this.z); 
}; 

Quaternion.prototype.setWXYZ = function(w, x, y, z)
{
    this.w = w; 
    this.x = x; 
    this.y = y; 
    this.z = z;         
    return this; 
};

Quaternion.prototype.set = function(q) 
{
    this.w = q.w;    
    this.x = q.x; 
    this.y = q.y; 
    this.z = q.z;         
    return this; 
};

Quaternion.prototype.clear = function() 
{
    this.w = 1.0; 
    this.x = 0.0; 
    this.y = 0.0; 
    this.z = 0.0; 
    return this;         
};

Quaternion.prototype.normalize = function()
{
    var norme = Math.sqrt(this.w*this.w + this.x*this.x + this.y*this.y + this.z*this.z); 
    if (norme == 0.0)
    {
        this.w = 1.0; 
        this.x = this.y = this.z = 0.0; 
    }
    else
    {
        var recip = 1.0 / norme; 
        this.w *= recip; 
        this.x *= recip; 
        this.y *= recip; 
        this.z *= recip;             
    }
    return this; 
}; 

Quaternion.prototype.getMatrix = function()
{
    this.normalize(); 
    return [ 
        1.0 - 2.0*this.y*this.y - 2.0*this.z*this.z, 
        2.0*this.x*this.y - 2.0*this.z*this.w, 
        2.0*this.x*this.z + 2.0*this.y*this.w, 
        0.0,
        2.0*this.x*this.y + 2.0*this.z*this.w, 
        1.0 - 2.0*this.x*this.x - 2.0*this.z*this.z, 
        2.0*this.y*this.z - 2.0*this.x*this.w, 
        0.0,
        2.0*this.x*this.z - 2.0*this.y*this.w, 
        2.0*this.y*this.z + 2.0*this.x*this.w, 
        1.0 - 2.0*this.x*this.x - 2.0*this.y*this.y, 
        0.0,
        0.0, 
        0.0, 
        0.0, 
        1.0 ]; 
};  

Quaternion.prototype.multiply = function(q, out) 
{
    out = out || this.register;
    out.w = this.w*q.w - this.x*q.x - this.y*q.y - this.z*q.z; 
    out.x = this.w*q.x + this.x*q.w + this.y*q.z - this.z*q.y;
    out.y = this.w*q.y - this.x*q.z + this.y*q.w + this.z*q.x;
    out.z = this.w*q.z + this.x*q.y - this.y*q.x + this.z*q.w ;
    return out; 
};

Quaternion.prototype.isEqual = function(q) 
{
    if(q.w == this.w && q.x == this.x && q.y == this.y && q.z == this.z)
    {
        return true; 
    }
    return false; 
}; 

Quaternion.prototype.dot = function(q)
{
    return (this.w*q.w + this.x*q.x + this.y*q.y + this.z*q.z); 
};    

Quaternion.prototype.add = function(q, out)
{
    out = out || this.register;
    out.w = this.w + q.w; 
    out.x = this.x + q.x; 
    out.y = this.y + q.y; 
    out.z = this.z + q.z; 
    return out; 
}; 

Quaternion.prototype.sub = function(q, out)
{
    out = out || this.register;
    out.w = this.w - q.w; 
    out.x = this.x - q.x; 
    out.y = this.y - q.y; 
    out.z = this.z - q.z; 
    return out; 
}; 

Quaternion.prototype.normSquared = function()
{
    return this.x*this.x + this.y*this.y + this.z*this.z + this.w*this.w; 
};

Quaternion.prototype.norm = function()
{
    return Math.sqrt(this.normSquared());
};


Quaternion.prototype.conj = function(out)
{
    out = out || this.register;
    out.w = this.w; 
    out.x = -this.x; 
    out.y = -this.y; 
    out.z = -this.z; 
    return out; 
}; 

Quaternion.prototype.inverse = function(out)
{
    out = out || this.register;
    this.conj(out);
    out.scalarDivide(this.normSquared(), out);
    return out;  
}; 

Quaternion.prototype.scalarDivide = function(s, out)
{
    out = out || this.register;        
    s = 1.0 / s;
    out.w = this.w*s; 
    out.x = this.x*s; 
    out.y = this.y*s; 
    out.z = this.z*s; 
    return out; 
};

Quaternion.prototype.scalarMult = function(s, out)
{
    out = out || this.register;                
    out.w = this.w*s; 
    out.x = this.x*s; 
    out.y = this.y*s; 
    out.z = this.z*s; 
    return out;   
}

Quaternion.prototype.isZero = function()
{
    if(this.x == 0 && this.y == 0 && this.z == 0 && this.w == 1.0)
    {
        return true; 
    }
    return false;         
}; 

Quaternion.prototype.negate = function()
{
    this.w = -this.w; 
    this.x = -this.x; 
    this.y = -this.y; 
    this.z = -this.z; 
    return this; 
}

Quaternion.prototype.zeroRotation = function()
{
    this.x = 0; this.y = 0; this.z = 0; this.w = 1.0; 
    return this; 
}; 

Quaternion.prototype.slerp = function(q, t, out)
{
    out = out || this.register;                
    var omega, cosomega, sinomega, scaleFrom, scaleTo; 

    this.to.set(q);
    this.from.set(this); 

    cosomega = this.dot(q); 

    if(cosomega < 0.0)
    {
        cosomega = -cosomega; 
        this.to.negate();             
    }

    if( (1.0 - cosomega) > this.epsilon )
    {
        omega = Math.acos(cosomega); 
        sinomega = Math.sin(omega);
        scaleFrom = Math.sin( (1.0 - t) * omega ) / sinomega; 
        scaleTo = Math.sin( t * omega ) / sinomega;             
    }
    else
    {
        scaleFrom = 1.0 - t; 
        scaleTo = t; 
    }


    this.from.scalarMult(scaleFrom, this.from);        
    this.to.scalarMult(scaleTo, this.to);        
    this.from.add(this.to, out);         
    return out; 
}

Quaternion.prototype.epsilon    = 0.00001; 
Quaternion.prototype.from       = new Quaternion(0,0,0,0);
Quaternion.prototype.to         = new Quaternion(0,0,0,0);
Quaternion.prototype.register   = new Quaternion(0,0,0,0);
Quaternion.prototype.zero       = new Quaternion(0,0,0,0);
Quaternion.prototype.one        = new Quaternion(1,1,1,1);

module.exports = Quaternion;

},{"./OldMatrix":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/src/Components/OldMatrix.js"}],"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/src/Components/Utils.js":[function(require,module,exports){
var FM = require('./OldMatrix');

var Utils = {                
    rad2deg: function(rad)
    {
        return rad * 57.2957795; 
    },

    deg2rad: function(deg)
    {
        return deg * 0.0174532925; 
    },

    distance: function(x1, y1, x2, y2)
    {
        var deltaX = x2 - x1; 
        var deltaY = y2 - y1; 
        return Math.sqrt(deltaX*deltaX + deltaY*deltaY); 
    },

    distance3D: function(x1, y1, z1, x2, y2, z2)
    {
        var deltaX = x2 - x1; 
        var deltaY = y2 - y1; 
        var deltaZ = z2 - z1; 
        return Math.sqrt(deltaX*deltaX + deltaY*deltaY + deltaZ*deltaZ); 
    },

    map: function(value, inputMin, inputMax, outputMin, outputMax, clamp)
    {         
      var outValue = ((value - inputMin)/(inputMax - inputMin)) * (outputMax - outputMin) + outputMin; 
      if(clamp)
      {       
        if(outputMax > outputMin)
        {
          if(outValue > outputMax)
          {
            outValue = outputMax; 
          }
          else if(outValue < outputMin)
          {
            outValue = outputMin; 
          } 
        }
        else
        {
          if(outValue < outputMax)
          {
            outValue = outputMax; 
          }
          else if(outValue > outputMin)
          {
            outValue = outputMin; 
          } 
        }         
      }
      return outValue;         
    },

    limit: function(value, low, high)
    {
        value = Math.min(value, high); 
        value = Math.max(value, low); 
        return value;             
    },

    perspective: function(fovy, aspect, near, far) 
    {
        var out = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
        var f = 1.0 / Math.tan(fovy / 2),
        nf = 1.0 / (near - far);
        out[0] = f / aspect;
        out[1] = 0;
        out[2] = 0;
        out[3] = 0;

        out[4] = 0;
        out[5] = f;
        out[6] = 0;
        out[7] = 0;
        
        out[8] = 0;
        out[9] = 0;
        out[10] = (far + near) * nf;
        out[11] = -1;
        
        out[12] = 0;
        out[13] = 0;
        out[14] = (2 * far * near) * nf;
        out[15] = 0;
        return out;
    },

    ortho: function(left, right, bottom, top, near, far)
    {
        var out = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
        var tx = -(right+left)/(right-left);
        var ty = -(top+bottom)/(top-bottom);
        var tz = -(far+near)/(far-near);

        out[0] = 2.0/(right-left); 
        out[1] = 0;
        out[2] = 0;
        out[3] = 0;

        out[4] = 0;
        out[5] = 2.0/(top-bottom);
        out[6] = 0;
        out[7] = 0;
        
        out[8] = 0;
        out[9] = 0;
        out[10] = -2.0/(far-near);
        out[11] = -1;
        
        out[12] = tx; 
        out[13] = ty;
        out[14] = tz;
        out[15] = 1.0;
        return out;
    },

    normalFromFM: function (out, a) 
    {
        var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
        a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
        a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15],

        b00 = a00 * a11 - a01 * a10,
        b01 = a00 * a12 - a02 * a10,
        b02 = a00 * a13 - a03 * a10,
        b03 = a01 * a12 - a02 * a11,
        b04 = a01 * a13 - a03 * a11,
        b05 = a02 * a13 - a03 * a12,
        b06 = a20 * a31 - a21 * a30,
        b07 = a20 * a32 - a22 * a30,
        b08 = a20 * a33 - a23 * a30,
        b09 = a21 * a32 - a22 * a31,
        b10 = a21 * a33 - a23 * a31,
        b11 = a22 * a33 - a23 * a32,

        // Calculate the determinant
        det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

        if (!det) { 
            return null; 
        }
        det = 1.0 / det;

        out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
        out[1] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
        out[2] = (a10 * b10 - a11 * b08 + a13 * b06) * det;

        out[3] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
        out[4] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
        out[5] = (a01 * b08 - a00 * b10 - a03 * b06) * det;

        out[6] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
        out[7] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
        out[8] = (a30 * b04 - a31 * b02 + a33 * b00) * det;

        return out;
    }, 

    clamp: function(v, min, max)        
    {
        if(v < min)
        {
            return min; 
        }
        else if(v > max)
        {
            return max; 
        }
        return v; 
    },

    color: function(red, green, blue, alpha)
    {
      return 'rgba('+Math.floor(red)+','+Math.floor(green)+','+Math.floor(blue)+','+alpha+')'; 
    },
    
    backgroundTransparent: function()
    {
        return {'backgroundColor': 'transparent'}; 
    },

    backgroundColor: function(red, green, blue, alpha)
    {
        return {'backgroundColor': 'rgba('+Math.floor(red)+','+Math.floor(green)+','+Math.floor(blue)+','+alpha+')'}; 
    },

    borderRadius: function(r)
    {
        return {'borderRadius': r+'px'}; 
    },

    borderTopWidth: function(r)
    {
        return {'borderTopWidth': r+'px'}; 
    },

    borderBottomWidth: function(r)
    {
        return {'borderBottomWidth': r+'px'}; 
    },

    borderLeftWidth: function(r)
    {
        return {'borderLeftWidth': r+'px'}; 
    },

    borderRightWidth: function(r)
    {
        return {'borderRightWidth': r+'px'}; 
    },

    borderWidth: function(size)
    {
        return {'borderWidth': size+'px'};
    },

    borderColor: function(red, green, blue, alpha)
    {
        if(alpha == 0.0)
        {
            return {'borderColor': 'transparent'}; 
        }
        else
        {
            return {'borderColor': 'rgba('+Math.floor(red)+','+Math.floor(green)+','+Math.floor(blue)+','+alpha+')'}; 
        }            
    },

    borderTopColor: function(red, green, blue, alpha)
    {
        if(alpha == 0.0)
        {
            return {'borderTopColor': 'transparent'}; 
        }
        else
        {
            return {'borderTopColor': 'rgba('+Math.floor(red)+','+Math.floor(green)+','+Math.floor(blue)+','+alpha+')'}; 
        }            
    },

    borderBottomColor: function(red, green, blue, alpha)
    {
        if(alpha == 0.0)
        {
            return {'borderBottomColor': 'transparent'}; 
        }
        else
        {
            return {'borderBottomColor': 'rgba('+Math.floor(red)+','+Math.floor(green)+','+Math.floor(blue)+','+alpha+')'}; 
        }            
    },

    borderRightColor: function(red, green, blue, alpha)
    {
        if(alpha == 0.0)
        {
            return {'borderRightColor': 'transparent'}; 
        }
        else
        {
            return {'borderRightColor': 'rgba('+Math.floor(red)+','+Math.floor(green)+','+Math.floor(blue)+','+alpha+')'}; 
        }            
    },

    borderLeftColor: function(red, green, blue, alpha)
    {
        if(alpha == 0.0)
        {
            return {'borderLeftColor': 'transparent'}; 
        }
        else
        {
            return {'borderLeftColor': 'rgba('+Math.floor(red)+','+Math.floor(green)+','+Math.floor(blue)+','+alpha+')'}; 
        }            
    },

    borderStyle: function(style)
    {
        return {'borderStyle': style};
    },

    borderTopStyle: function(style)
    {
        return {'borderTopStyle': style};
    },

    borderBottomStyle: function(style)
    {
        return {'borderBottomStyle': style};
    },

    borderRightStyle: function(style)
    {
        return {'borderRightStyle': style};
    },

    borderLeftStyle: function(style)
    {
        return {'borderLeftStyle': style};
    },

    colorHSL: function(hue, saturation, lightness, alpha)
    {
        return 'hsla('+Math.floor(hue)+','+Math.floor(saturation)+'%,'+Math.floor(lightness)+'%,'+alpha+')'; 
    },

    backgroundTransparent: function()
    {
        return {'backgroundColor': 'transparent'};             
    }, 

    backgroundColorHSL: function(hue, saturation, lightness, alpha)
    {
        return {'backgroundColor': 'hsla('+Math.floor(hue)+','+Math.floor(saturation)+'%,'+Math.floor(lightness)+'%,'+alpha+')'}; 
    },

    backfaceVisible: function(value)
    {
        if(value)
        {
            return {
               'backface-visibility':'visible',
                '-webkit-backface-visibility':'visible',
                '-moz-backface-visibility':'visible',
                '-ms-backface-visibility': 'visible',
            }; 
        }
        else
        {
            return {
               'backface-visibility':'hidden',
                '-webkit-backface-visibility':'hidden',
                '-moz-backface-visibility':'hidden',
                '-ms-backface-visibility': 'hidden',
            }; 
        }
    }, 

    clipCircle: function(x, y, r)
    {
        return {'-webkit-clip-path': 'circle('+x+'px,'+y+'px,'+r+'px)'};
    },        

    getWidth: function()
    {            
        return window.innerWidth; 
    },

    getHeight: function()
    {
        return window.innerHeight;                        
    },

    getCenter: function()
    {
        return [Utils.getWidth()*.5, Utils.getHeight()*.5]; 
    },
    
    isMobile: function() { 
        if( /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent) ) {
            return true;
        } 
        return false;
    },

    isString: function (maybeString) {
        return (typeof maybeString == 'string' || maybeString instanceof String) 
    },

    isArray: function (maybeArray) {
        return Object.prototype.toString.call( maybeArray ) === '[object Array]';
    },

    extend: function(a, b) {
        for(var key in b) { 
            a[key] = b[key];
        }
        return a;
    },

    getDevicePixelRatio: function()
    {
        return (window.devicePixelRatio ? window.devicePixelRatio : 1); 
    },

    supportsWebGL: function()
    {
        if( /Android|Chrome|Mozilla/i.test(navigator.appCodeName) && !!window.WebGLRenderingContext) {
            return true;
        } 
        return false;
    }, 

    getSurfacePosition: function getSurfacePosition(surface) {

        var currTarget = surface._currTarget;
        var transforms = [];
        var totalDist = [0, 0, 0];

        function getAllTransforms ( elem ) {

            var transform = getTransform(elem);

            if(transform !== "" && transform !== undefined ) {
                var offset = parseTransform(transform);

                totalDist[0] += offset[0];
                totalDist[1] += offset[1];
                totalDist[2] += offset[2];
                
            }

            if( elem.parentElement !== document.body ) {
                getAllTransforms(elem.parentNode);
            }
            
        }
        
        function parseTransform(transform) {
            var translate = []; 

            transform = removeMatrix3d( transform );

            translate[0] = parseInt(transform[12].replace(' ', '')); 
            translate[1] = parseInt(transform[13].replace(' ', ''));        
            translate[2] = parseInt(transform[14].replace(' ', ''));        

            for (var i = 0; i < translate.length; i++) {
                if(typeof translate[i] == 'undefined') {
                    translate[i] = 0;
                }
            };

            return translate;
        }

        function removeMatrix3d( mtxString ) { 
            mtxString = mtxString.replace('matrix3d(','');
            mtxString = mtxString.replace(')','');
            return mtxString.split(',');
        }

        function getTransform( elem ) { 
            var transform = elem['style']['webkitTransform'] || elem['style']['transform'] ;
            return transform;
        }

        if(currTarget) {

            getAllTransforms(currTarget);

        } else {

            return undefined;
        }

        return totalDist; 
    },

    // get center from [0, 0] origin
    getCenterMatrix: function ( pos, size, z) {
        if(z == undefined) z = 0;
        return FM.translate( pos[0] - size[0] * 0.5, pos[1] - size[1] * 0.5, z ); 
    },

    hasUserMedia: function() {
        return !!(navigator.getUserMedia || navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia || navigator.msGetUserMedia);
    },

    getUserMedia: function()
    {
        return navigator.getUserMedia || navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia || navigator.msGetUserMedia; 
    }, 

    isWebkit: function () {
       return !!window.webkitURL; 
    }

};

module.exports = Utils;

},{"./OldMatrix":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/src/Components/OldMatrix.js"}],"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/src/index.js":[function(require,module,exports){
var Surface = require('famous/src/core/Surface');
var Engine = require('famous/src/core/Engine');
var AppView = require('./views/Appview');
var EasyCamera = require('./Components/EasyCamera');
require('./styles');

var mainContext = Engine.createContext();
mainContext.setPerspective(1000);

var camera = new EasyCamera();

var app = new AppView(Engine);
mainContext.add(app);

window.app = app;
window.context = mainContext;

},{"./Components/EasyCamera":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/src/Components/EasyCamera.js","./styles":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/src/styles/index.js","./views/Appview":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/src/views/Appview.js","famous/src/core/Engine":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/core/Engine.js","famous/src/core/Surface":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/core/Surface.js"}],"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/src/styles/app.css":[function(require,module,exports){
var css = "html {\n  background: #fff;\n}\n\n.backfaceVisibility {\n  -webkit-backface-visibility: visible;\n  backface-visibility: visible;\n}\n\n.sphere{\n    background-image: -webkit-radial-gradient(40% 40%, circle contain, rgba(50,50,50,.4) 10%, rgba(100,100,100,.4) 100%);\n    border-radius : 50%;\n}\n\n.particle{\n    background: rgba(50,210,255,.9);\n    -webkit-box-shadow: inset 3px 3px 5px 2px rgba(187, 211, 255, 0.80), 0px 0px 5px rgba(0,50,255,.9);\n    border-radius: 50%;\n    color : black;\n    font-size: 20px;\n    backface-visibility : visible !important;\n    -webkit-backface-visibility: visible !important;\n}\n"; (require("/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/cssify"))(css); module.exports = css;
},{"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/cssify":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/cssify/browser.js"}],"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/src/styles/index.js":[function(require,module,exports){
// load css
require('famous/src/core/famous.css');
require('./app.css');

},{"./app.css":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/src/styles/app.css","famous/src/core/famous.css":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/core/famous.css"}],"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/src/views/Appview.js":[function(require,module,exports){
var View = require('famous/src/core/View');
var Modifier       = require('famous/src/core/Modifier');
var Surface = require('famous/src/core/Surface');
var RepulsionForce = require('famous/src/physics/forces/Repulsion');
var Transform = require('famous/src/core/Transform');
var StateModifier = require('famous/src/modifiers/StateModifier');
var Transitionable = require('famous/src/transitions/Transitionable');
var Walls = require('famous/src/physics/constraints/Walls');
var Collision = require('famous/src/physics/constraints/Collision');
var VectorField = require('famous/src/physics/forces/VectorField');
var Vector = require('famous/src/math/Vector');

var Drag = require('famous/src/physics/forces/Drag');
var Particle = require('famous/src/physics/bodies/Particle');
var Circle = require('famous/src/physics/bodies/Circle');
var CubicView = require('./CubicView');
var PhysicsEngine = require('famous/src/physics/PhysicsEngine');
var MouseSync     = require('famous/src/inputs/MouseSync');
var TouchSync     = require('famous/src/inputs/TouchSync');
var ScrollSync    = require('famous/src/inputs/ScrollSync');
var GenericSync   = require('famous/src/inputs/GenericSync');

GenericSync.register({
    "mouse"  : MouseSync,
    "touch"  : TouchSync,
    "scroll" : ScrollSync
});

function AppView(Engine) {
    View.apply(this, arguments);

    this.sync = new GenericSync({
        "mouse"  : {},
        "touch"  : {},
        "scroll" : {scale : .5}
    });
    
    this._physicsEngine = new PhysicsEngine();

    this._rotationTransitionable = new Transitionable([0, 0, 0])

    this._rotationModifier = new Modifier({
        origin: [0.5, 0.5],
        align: [0.5, 0.5],
        transform: function() {
            return Transform.rotate.apply(this, this._rotationTransitionable.get());
        }.bind(this)
    });

    this._rootNode = this.add(this._rotationModifier);

    _createBackground.call(this);
    _createCube.call(this);
    
    //must create in this order for anchor to sit outside of the walls...
    _createSpheres.call(this);
    _createWalls.call(this);
    _createAnchor.call(this);

    _bindEvents.call(this);

    var rotateAngle = Math.PI/100;
    if (rotateAngle){
        var angle = 0
        Engine.on('prerender', function(){
            angle += rotateAngle;
            this._walls.rotateZ(rotateAngle);
            var old_rotation = this._rotationTransitionable.get();
            old_rotation[2] += rotateAngle;
            // .setTransform(Matrix.rotateZ(angle));
        }.bind(this));
    };
}

AppView.prototype = Object.create(View.prototype);
AppView.prototype.constructor = AppView;

AppView.DEFAULT_OPTIONS = {};

function _createCube() {
    this.edgeLength = window.innerWidth < window.innerHeight ? window.innerWidth * 0.5 : window.innerHeight * 0.5;
    var cube = new CubicView({
        edgeLength: this.edgeLength
    });
    cube.pipe(this.sync);
    this._rootNode.add(cube);
}

function _createAnchor() {
    this._anchorParticle = new Circle({
      radius: 0
    });

    this._anchorParticle.setPosition([250, 250, 0])

    var anchorModifier = new Modifier({
        origin: [0.5, 0.5],
        align: [0.5, 0.5],
        transform : function() {
            return this._anchorParticle.getTransform();
        }.bind(this)
    });

    var anchor = new Surface({
      size: [50, 50],
      properties: {
        backgroundColor: 'red'
      }
    });
    this._physicsEngine.addBody(this._anchorParticle);

    var gravity = new RepulsionForce({
        strength: -50
    });

    this._physicsEngine.attach(gravity, this._spheres, this._anchorParticle);

    this.add(anchorModifier).add(anchor);
}

function _createWalls() {
    this._walls = new Walls({
        restitution : 0.5,
        size : [this.edgeLength, this.edgeLength, this.edgeLength],
        origin : [0.5, 0.5, 0.5],
        k : 0.5,
        drift : 0.5,
        slop : 0,
        sides : Walls.SIDES.THREE_DIMENSIONAL,
        onContact : Walls.ON_CONTACT.REFLECT
    });
    
    this._walls.options.sides = this._walls.components; // Patch for bug in Walls module.
    this._walls.sides = this._walls.components;         // Patch for bug in Walls module.
    
    // this._physicsEngine.attach([this._walls, drag]);
    this._physicsEngine.attach(this._walls, this._spheres);
}

function  _createSpheres() {
    
    this.spheres = [];
    for(var i=0; i<10; i++) {
        var sphere = _createSphere();
        this.add(sphere.modifier).add(sphere.surface);
        this._physicsEngine.addBody(sphere.circle);
        this.spheres.push(sphere.circle);
        
        // var sphereR = 20;
        // var sphereSurface = new Surface({
        //     size: [2*sphereR, 2*sphereR],
        //     classes: ['particle'],
        //     properties: {
        //         backgroundColor: 'blue'
        //     }
        // });

        // var sphereParticle = new Circle({
        //   radius: 25
        // });
        
        // var sphereModifier = new Modifier({
        //     size: [2*sphereR, 2*sphereR],
        //     align: [0.5, 0.5],
        //     origin: [0.5, 0.5],
        //     transform: function() {
        //         return sphereParticle.getTransform();
        //     }
        // });

        // this._physicsEngine.addBody(sphereParticle);
        // this.spheres.push(sphereParticle);
        // sphereParticle.setVelocity(0.2, 0, 0);
        // this._rootNode.add(sphereModifier).add(sphereSurface);

        
    }

}

function _createSphere() {

    var size = Math.random() * 20;
    var circle = new Circle({
      radius: 2 * size
    });

    // circle.applyForce(new Vector(Math.random() * 1, Math.random() * 1, Math.random() * 1));

    var surface = new Surface({
      size: [size, size],
      classes: ['particle'],
      properties: {
        backgroundColor : 'blue'
      }
    });

    var modifier = new Modifier({
      align: [0.5, 0.5],
      origin: [0.5, 0.5],

      transform: function() {
        return circle.getTransform();
      }
    });

    return {
      circle: circle,
      modifier: modifier,
      surface: surface
    };
}

function _createBackground() {
    this._backgroundSurface = new Surface({
        size: [undefined, undefined]
    })
    this._backgroundSurface.pipe(this.sync);
    this.add(this._backgroundSurface);
}

function _bindEvents() {
    this.sync.on('start', function(data){
        console.log('start', data);
    });

    this.sync.on('update', function(data){
        var dX = data.delta[0];
        var dY = data.delta[1];

        var old_rotation = this._rotationTransitionable.get();
        
        old_rotation[0] += -dY/100;
        this._walls.rotateX(-dY/100);
        old_rotation[1] += dX/100;
        this._walls.rotateY(dX/100);
    }.bind(this));

    this.sync.on('end', function(data){
        console.log('end', data);
    });
}

module.exports = AppView;

},{"./CubicView":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/src/views/CubicView.js","famous/src/core/Modifier":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/core/Modifier.js","famous/src/core/Surface":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/core/Surface.js","famous/src/core/Transform":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/core/Transform.js","famous/src/core/View":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/core/View.js","famous/src/inputs/GenericSync":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/inputs/GenericSync.js","famous/src/inputs/MouseSync":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/inputs/MouseSync.js","famous/src/inputs/ScrollSync":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/inputs/ScrollSync.js","famous/src/inputs/TouchSync":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/inputs/TouchSync.js","famous/src/math/Vector":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/math/Vector.js","famous/src/modifiers/StateModifier":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/modifiers/StateModifier.js","famous/src/physics/PhysicsEngine":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/physics/PhysicsEngine.js","famous/src/physics/bodies/Circle":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/physics/bodies/Circle.js","famous/src/physics/bodies/Particle":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/physics/bodies/Particle.js","famous/src/physics/constraints/Collision":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/physics/constraints/Collision.js","famous/src/physics/constraints/Walls":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/physics/constraints/Walls.js","famous/src/physics/forces/Drag":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/physics/forces/Drag.js","famous/src/physics/forces/Repulsion":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/physics/forces/Repulsion.js","famous/src/physics/forces/VectorField":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/physics/forces/VectorField.js","famous/src/transitions/Transitionable":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/transitions/Transitionable.js"}],"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/src/views/CubicView.js":[function(require,module,exports){
var View           = require('famous/src/core/View');
var Surface        = require('famous/src/core/Surface');
var Transform      = require('famous/src/core/Transform');
var Modifier       = require('famous/src/core/Modifier');
var Transitionable = require('famous/src/transitions/Transitionable');
var StateModifier  = require('famous/src/modifiers/StateModifier');
var Easing         = require('famous/src/transitions/Easing');
var EventHandler   = require('famous/src/core/EventHandler');

var NINETY_DEGRESS = Math.PI/2;

var FACE_ROTATIONS = [
    [0, 0, 0],                    //FRONT
    [-NINETY_DEGRESS, 0, 0],      //LEFT
    [NINETY_DEGRESS, 0, 0],       //RIGHT
    [0, -NINETY_DEGRESS, 0],      //BOTTOM
    [0, NINETY_DEGRESS, 0],       //TOP 
    [2 * NINETY_DEGRESS, 0, 0],   //BACK  
]

function CubicView() {
    View.apply(this, arguments);

    this._cubeRotationState = new Transitionable([0, 0, 0]);
    this._cubeTranslationState = new Transitionable([0, 0, 0]);

    this._faces = [];

    this._rotationModifier = new Modifier({
        // align: [0.5, 0.5],
        // origin: [0.5, 0.5],
        transform: function() {
            var state = this._cubeRotationState.get();
            // return Transform.rotate(state[0], state[1], state[2]);
            return Transform.rotate.apply(this, state);
        }.bind(this)
    });

    this._translationModifier = new Modifier({
        transform : function () {
            var state = this._cubeTranslationState.get();
            return Transform.translate.apply(this, state);
        }.bind(this)
    })

    this._rootNode = this.add(this._translationModifier).add(this._rotationModifier);
    
    _createCube.call(this);
}

CubicView.prototype = Object.create(View.prototype);
CubicView.prototype.constructor = CubicView;

CubicView.DEFAULT_OPTIONS = {
    edgeLength : 50,
    translation : 25
};

function _createCube() {
    var self = this;
    for(var i=0; i<FACE_ROTATIONS.length; i++){
        
        var face = _createFace.call(this, i);
        var faceModifier = new Modifier({
            opacity: 0.5,
            transform: Transform.multiply(
                Transform.rotate.apply(self, FACE_ROTATIONS[i]),
                Transform.translate(0, 0, this.options.edgeLength * 0.5)
            )
        });

        self._faces.push(face);
        self._rootNode.add(faceModifier).add(face);
    }
}

function _createFace(index) {
    var face = new Surface({
      content: '',
      classes: ['backfaceVisibility'],
      size: [this.options.edgeLength, this.options.edgeLength],
      properties: {
        textAlign: 'center',
        lineHeight: '70px',
        fontSize: '35px',
        border: '2px solid black',
        backgroundColor: 'hsl(' + (index * 20 + 120) + ', 100%, 30%)'
      }
    });
    face.pipe(this._eventOutput);
    return face;
}

module.exports = CubicView;

},{"famous/src/core/EventHandler":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/core/EventHandler.js","famous/src/core/Modifier":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/core/Modifier.js","famous/src/core/Surface":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/core/Surface.js","famous/src/core/Transform":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/core/Transform.js","famous/src/core/View":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/core/View.js","famous/src/modifiers/StateModifier":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/modifiers/StateModifier.js","famous/src/transitions/Easing":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/transitions/Easing.js","famous/src/transitions/Transitionable":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/transitions/Transitionable.js"}]},{},["/Users/michaelxia/Famous/Vanilla/cube-walls-3d/src/index.js"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvY3NzaWZ5L2Jyb3dzZXIuanMiLCJub2RlX21vZHVsZXMvZmFtb3VzL3NyYy9jb3JlL0NvbnRleHQuanMiLCJub2RlX21vZHVsZXMvZmFtb3VzL3NyYy9jb3JlL0VsZW1lbnRBbGxvY2F0b3IuanMiLCJub2RlX21vZHVsZXMvZmFtb3VzL3NyYy9jb3JlL0VsZW1lbnRPdXRwdXQuanMiLCJub2RlX21vZHVsZXMvZmFtb3VzL3NyYy9jb3JlL0VuZ2luZS5qcyIsIm5vZGVfbW9kdWxlcy9mYW1vdXMvc3JjL2NvcmUvRW50aXR5LmpzIiwibm9kZV9tb2R1bGVzL2ZhbW91cy9zcmMvY29yZS9FdmVudEVtaXR0ZXIuanMiLCJub2RlX21vZHVsZXMvZmFtb3VzL3NyYy9jb3JlL0V2ZW50SGFuZGxlci5qcyIsIm5vZGVfbW9kdWxlcy9mYW1vdXMvc3JjL2NvcmUvTW9kaWZpZXIuanMiLCJub2RlX21vZHVsZXMvZmFtb3VzL3NyYy9jb3JlL09wdGlvbnNNYW5hZ2VyLmpzIiwibm9kZV9tb2R1bGVzL2ZhbW91cy9zcmMvY29yZS9SZW5kZXJOb2RlLmpzIiwibm9kZV9tb2R1bGVzL2ZhbW91cy9zcmMvY29yZS9TcGVjUGFyc2VyLmpzIiwibm9kZV9tb2R1bGVzL2ZhbW91cy9zcmMvY29yZS9TdXJmYWNlLmpzIiwibm9kZV9tb2R1bGVzL2ZhbW91cy9zcmMvY29yZS9UcmFuc2Zvcm0uanMiLCJub2RlX21vZHVsZXMvZmFtb3VzL3NyYy9jb3JlL1ZpZXcuanMiLCJub2RlX21vZHVsZXMvZmFtb3VzL3NyYy9jb3JlL2ZhbW91cy5jc3MiLCJub2RlX21vZHVsZXMvZmFtb3VzL3NyYy9pbnB1dHMvR2VuZXJpY1N5bmMuanMiLCJub2RlX21vZHVsZXMvZmFtb3VzL3NyYy9pbnB1dHMvTW91c2VTeW5jLmpzIiwibm9kZV9tb2R1bGVzL2ZhbW91cy9zcmMvaW5wdXRzL1Njcm9sbFN5bmMuanMiLCJub2RlX21vZHVsZXMvZmFtb3VzL3NyYy9pbnB1dHMvVG91Y2hTeW5jLmpzIiwibm9kZV9tb2R1bGVzL2ZhbW91cy9zcmMvaW5wdXRzL1RvdWNoVHJhY2tlci5qcyIsIm5vZGVfbW9kdWxlcy9mYW1vdXMvc3JjL21hdGgvTWF0cml4LmpzIiwibm9kZV9tb2R1bGVzL2ZhbW91cy9zcmMvbWF0aC9RdWF0ZXJuaW9uLmpzIiwibm9kZV9tb2R1bGVzL2ZhbW91cy9zcmMvbWF0aC9WZWN0b3IuanMiLCJub2RlX21vZHVsZXMvZmFtb3VzL3NyYy9tb2RpZmllcnMvU3RhdGVNb2RpZmllci5qcyIsIm5vZGVfbW9kdWxlcy9mYW1vdXMvc3JjL3BoeXNpY3MvUGh5c2ljc0VuZ2luZS5qcyIsIm5vZGVfbW9kdWxlcy9mYW1vdXMvc3JjL3BoeXNpY3MvYm9kaWVzL0JvZHkuanMiLCJub2RlX21vZHVsZXMvZmFtb3VzL3NyYy9waHlzaWNzL2JvZGllcy9DaXJjbGUuanMiLCJub2RlX21vZHVsZXMvZmFtb3VzL3NyYy9waHlzaWNzL2JvZGllcy9QYXJ0aWNsZS5qcyIsIm5vZGVfbW9kdWxlcy9mYW1vdXMvc3JjL3BoeXNpY3MvY29uc3RyYWludHMvQ29sbGlzaW9uLmpzIiwibm9kZV9tb2R1bGVzL2ZhbW91cy9zcmMvcGh5c2ljcy9jb25zdHJhaW50cy9Db25zdHJhaW50LmpzIiwibm9kZV9tb2R1bGVzL2ZhbW91cy9zcmMvcGh5c2ljcy9jb25zdHJhaW50cy9XYWxsLmpzIiwibm9kZV9tb2R1bGVzL2ZhbW91cy9zcmMvcGh5c2ljcy9jb25zdHJhaW50cy9XYWxscy5qcyIsIm5vZGVfbW9kdWxlcy9mYW1vdXMvc3JjL3BoeXNpY3MvZm9yY2VzL0RyYWcuanMiLCJub2RlX21vZHVsZXMvZmFtb3VzL3NyYy9waHlzaWNzL2ZvcmNlcy9Gb3JjZS5qcyIsIm5vZGVfbW9kdWxlcy9mYW1vdXMvc3JjL3BoeXNpY3MvZm9yY2VzL1JlcHVsc2lvbi5qcyIsIm5vZGVfbW9kdWxlcy9mYW1vdXMvc3JjL3BoeXNpY3MvZm9yY2VzL1ZlY3RvckZpZWxkLmpzIiwibm9kZV9tb2R1bGVzL2ZhbW91cy9zcmMvcGh5c2ljcy9pbnRlZ3JhdG9ycy9TeW1wbGVjdGljRXVsZXIuanMiLCJub2RlX21vZHVsZXMvZmFtb3VzL3NyYy90cmFuc2l0aW9ucy9FYXNpbmcuanMiLCJub2RlX21vZHVsZXMvZmFtb3VzL3NyYy90cmFuc2l0aW9ucy9NdWx0aXBsZVRyYW5zaXRpb24uanMiLCJub2RlX21vZHVsZXMvZmFtb3VzL3NyYy90cmFuc2l0aW9ucy9UcmFuc2l0aW9uYWJsZS5qcyIsIm5vZGVfbW9kdWxlcy9mYW1vdXMvc3JjL3RyYW5zaXRpb25zL1RyYW5zaXRpb25hYmxlVHJhbnNmb3JtLmpzIiwibm9kZV9tb2R1bGVzL2ZhbW91cy9zcmMvdHJhbnNpdGlvbnMvVHdlZW5UcmFuc2l0aW9uLmpzIiwibm9kZV9tb2R1bGVzL2ZhbW91cy9zcmMvdXRpbGl0aWVzL1V0aWxpdHkuanMiLCJzcmMvQ29tcG9uZW50cy9FYXN5Q2FtZXJhLmpzIiwic3JjL0NvbXBvbmVudHMvT2xkTWF0cml4LmpzIiwic3JjL0NvbXBvbmVudHMvT2xkUXVhdGVybmlvbi5qcyIsInNyYy9Db21wb25lbnRzL1V0aWxzLmpzIiwic3JjL2luZGV4LmpzIiwic3JjL3N0eWxlcy9hcHAuY3NzIiwic3JjL3N0eWxlcy9pbmRleC5qcyIsInNyYy92aWV3cy9BcHB2aWV3LmpzIiwic3JjL3ZpZXdzL0N1YmljVmlldy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcFBBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDelNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25DQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdlFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbk1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN09BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDellBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3bEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JRQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFlQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGNzcywgY3VzdG9tRG9jdW1lbnQpIHtcbiAgdmFyIGRvYyA9IGN1c3RvbURvY3VtZW50IHx8IGRvY3VtZW50O1xuICBpZiAoZG9jLmNyZWF0ZVN0eWxlU2hlZXQpIHtcbiAgICB2YXIgc2hlZXQgPSBkb2MuY3JlYXRlU3R5bGVTaGVldCgpXG4gICAgc2hlZXQuY3NzVGV4dCA9IGNzcztcbiAgICByZXR1cm4gc2hlZXQub3duZXJOb2RlO1xuICB9IGVsc2Uge1xuICAgIHZhciBoZWFkID0gZG9jLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoZWFkJylbMF0sXG4gICAgICAgIHN0eWxlID0gZG9jLmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyk7XG5cbiAgICBzdHlsZS50eXBlID0gJ3RleHQvY3NzJztcblxuICAgIGlmIChzdHlsZS5zdHlsZVNoZWV0KSB7XG4gICAgICBzdHlsZS5zdHlsZVNoZWV0LmNzc1RleHQgPSBjc3M7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0eWxlLmFwcGVuZENoaWxkKGRvYy5jcmVhdGVUZXh0Tm9kZShjc3MpKTtcbiAgICB9XG5cbiAgICBoZWFkLmFwcGVuZENoaWxkKHN0eWxlKTtcbiAgICByZXR1cm4gc3R5bGU7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzLmJ5VXJsID0gZnVuY3Rpb24odXJsKSB7XG4gIGlmIChkb2N1bWVudC5jcmVhdGVTdHlsZVNoZWV0KSB7XG4gICAgcmV0dXJuIGRvY3VtZW50LmNyZWF0ZVN0eWxlU2hlZXQodXJsKS5vd25lck5vZGU7XG4gIH0gZWxzZSB7XG4gICAgdmFyIGhlYWQgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaGVhZCcpWzBdLFxuICAgICAgICBsaW5rID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGluaycpO1xuXG4gICAgbGluay5yZWwgPSAnc3R5bGVzaGVldCc7XG4gICAgbGluay5ocmVmID0gdXJsO1xuXG4gICAgaGVhZC5hcHBlbmRDaGlsZChsaW5rKTtcbiAgICByZXR1cm4gbGluaztcbiAgfVxufTtcbiIsInZhciBSZW5kZXJOb2RlID0gcmVxdWlyZSgnLi9SZW5kZXJOb2RlJyk7XG52YXIgRXZlbnRIYW5kbGVyID0gcmVxdWlyZSgnLi9FdmVudEhhbmRsZXInKTtcbnZhciBFbGVtZW50QWxsb2NhdG9yID0gcmVxdWlyZSgnLi9FbGVtZW50QWxsb2NhdG9yJyk7XG52YXIgVHJhbnNmb3JtID0gcmVxdWlyZSgnLi9UcmFuc2Zvcm0nKTtcbnZhciBUcmFuc2l0aW9uYWJsZSA9IHJlcXVpcmUoJy4uL3RyYW5zaXRpb25zL1RyYW5zaXRpb25hYmxlJyk7XG52YXIgX3plcm9aZXJvID0gW1xuICAgICAgICAwLFxuICAgICAgICAwXG4gICAgXTtcbnZhciB1c2VQcmVmaXggPSAhKCdwZXJzcGVjdGl2ZScgaW4gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnN0eWxlKTtcbmZ1bmN0aW9uIF9nZXRFbGVtZW50U2l6ZShlbGVtZW50KSB7XG4gICAgcmV0dXJuIFtcbiAgICAgICAgZWxlbWVudC5jbGllbnRXaWR0aCxcbiAgICAgICAgZWxlbWVudC5jbGllbnRIZWlnaHRcbiAgICBdO1xufVxudmFyIF9zZXRQZXJzcGVjdGl2ZSA9IHVzZVByZWZpeCA/IGZ1bmN0aW9uIChlbGVtZW50LCBwZXJzcGVjdGl2ZSkge1xuICAgICAgICBlbGVtZW50LnN0eWxlLndlYmtpdFBlcnNwZWN0aXZlID0gcGVyc3BlY3RpdmUgPyBwZXJzcGVjdGl2ZS50b0ZpeGVkKCkgKyAncHgnIDogJyc7XG4gICAgfSA6IGZ1bmN0aW9uIChlbGVtZW50LCBwZXJzcGVjdGl2ZSkge1xuICAgICAgICBlbGVtZW50LnN0eWxlLnBlcnNwZWN0aXZlID0gcGVyc3BlY3RpdmUgPyBwZXJzcGVjdGl2ZS50b0ZpeGVkKCkgKyAncHgnIDogJyc7XG4gICAgfTtcbmZ1bmN0aW9uIENvbnRleHQoY29udGFpbmVyKSB7XG4gICAgdGhpcy5jb250YWluZXIgPSBjb250YWluZXI7XG4gICAgdGhpcy5fYWxsb2NhdG9yID0gbmV3IEVsZW1lbnRBbGxvY2F0b3IoY29udGFpbmVyKTtcbiAgICB0aGlzLl9ub2RlID0gbmV3IFJlbmRlck5vZGUoKTtcbiAgICB0aGlzLl9ldmVudE91dHB1dCA9IG5ldyBFdmVudEhhbmRsZXIoKTtcbiAgICB0aGlzLl9zaXplID0gX2dldEVsZW1lbnRTaXplKHRoaXMuY29udGFpbmVyKTtcbiAgICB0aGlzLl9wZXJzcGVjdGl2ZVN0YXRlID0gbmV3IFRyYW5zaXRpb25hYmxlKDApO1xuICAgIHRoaXMuX3BlcnNwZWN0aXZlID0gdW5kZWZpbmVkO1xuICAgIHRoaXMuX25vZGVDb250ZXh0ID0ge1xuICAgICAgICBhbGxvY2F0b3I6IHRoaXMuX2FsbG9jYXRvcixcbiAgICAgICAgdHJhbnNmb3JtOiBUcmFuc2Zvcm0uaWRlbnRpdHksXG4gICAgICAgIG9wYWNpdHk6IDEsXG4gICAgICAgIG9yaWdpbjogX3plcm9aZXJvLFxuICAgICAgICBhbGlnbjogX3plcm9aZXJvLFxuICAgICAgICBzaXplOiB0aGlzLl9zaXplXG4gICAgfTtcbiAgICB0aGlzLl9ldmVudE91dHB1dC5vbigncmVzaXplJywgZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLnNldFNpemUoX2dldEVsZW1lbnRTaXplKHRoaXMuY29udGFpbmVyKSk7XG4gICAgfS5iaW5kKHRoaXMpKTtcbn1cbkNvbnRleHQucHJvdG90eXBlLmdldEFsbG9jYXRvciA9IGZ1bmN0aW9uIGdldEFsbG9jYXRvcigpIHtcbiAgICByZXR1cm4gdGhpcy5fYWxsb2NhdG9yO1xufTtcbkNvbnRleHQucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uIGFkZChvYmopIHtcbiAgICByZXR1cm4gdGhpcy5fbm9kZS5hZGQob2JqKTtcbn07XG5Db250ZXh0LnByb3RvdHlwZS5taWdyYXRlID0gZnVuY3Rpb24gbWlncmF0ZShjb250YWluZXIpIHtcbiAgICBpZiAoY29udGFpbmVyID09PSB0aGlzLmNvbnRhaW5lcilcbiAgICAgICAgcmV0dXJuO1xuICAgIHRoaXMuY29udGFpbmVyID0gY29udGFpbmVyO1xuICAgIHRoaXMuX2FsbG9jYXRvci5taWdyYXRlKGNvbnRhaW5lcik7XG59O1xuQ29udGV4dC5wcm90b3R5cGUuZ2V0U2l6ZSA9IGZ1bmN0aW9uIGdldFNpemUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3NpemU7XG59O1xuQ29udGV4dC5wcm90b3R5cGUuc2V0U2l6ZSA9IGZ1bmN0aW9uIHNldFNpemUoc2l6ZSkge1xuICAgIGlmICghc2l6ZSlcbiAgICAgICAgc2l6ZSA9IF9nZXRFbGVtZW50U2l6ZSh0aGlzLmNvbnRhaW5lcik7XG4gICAgdGhpcy5fc2l6ZVswXSA9IHNpemVbMF07XG4gICAgdGhpcy5fc2l6ZVsxXSA9IHNpemVbMV07XG59O1xuQ29udGV4dC5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24gdXBkYXRlKGNvbnRleHRQYXJhbWV0ZXJzKSB7XG4gICAgaWYgKGNvbnRleHRQYXJhbWV0ZXJzKSB7XG4gICAgICAgIGlmIChjb250ZXh0UGFyYW1ldGVycy50cmFuc2Zvcm0pXG4gICAgICAgICAgICB0aGlzLl9ub2RlQ29udGV4dC50cmFuc2Zvcm0gPSBjb250ZXh0UGFyYW1ldGVycy50cmFuc2Zvcm07XG4gICAgICAgIGlmIChjb250ZXh0UGFyYW1ldGVycy5vcGFjaXR5KVxuICAgICAgICAgICAgdGhpcy5fbm9kZUNvbnRleHQub3BhY2l0eSA9IGNvbnRleHRQYXJhbWV0ZXJzLm9wYWNpdHk7XG4gICAgICAgIGlmIChjb250ZXh0UGFyYW1ldGVycy5vcmlnaW4pXG4gICAgICAgICAgICB0aGlzLl9ub2RlQ29udGV4dC5vcmlnaW4gPSBjb250ZXh0UGFyYW1ldGVycy5vcmlnaW47XG4gICAgICAgIGlmIChjb250ZXh0UGFyYW1ldGVycy5hbGlnbilcbiAgICAgICAgICAgIHRoaXMuX25vZGVDb250ZXh0LmFsaWduID0gY29udGV4dFBhcmFtZXRlcnMuYWxpZ247XG4gICAgICAgIGlmIChjb250ZXh0UGFyYW1ldGVycy5zaXplKVxuICAgICAgICAgICAgdGhpcy5fbm9kZUNvbnRleHQuc2l6ZSA9IGNvbnRleHRQYXJhbWV0ZXJzLnNpemU7XG4gICAgfVxuICAgIHZhciBwZXJzcGVjdGl2ZSA9IHRoaXMuX3BlcnNwZWN0aXZlU3RhdGUuZ2V0KCk7XG4gICAgaWYgKHBlcnNwZWN0aXZlICE9PSB0aGlzLl9wZXJzcGVjdGl2ZSkge1xuICAgICAgICBfc2V0UGVyc3BlY3RpdmUodGhpcy5jb250YWluZXIsIHBlcnNwZWN0aXZlKTtcbiAgICAgICAgdGhpcy5fcGVyc3BlY3RpdmUgPSBwZXJzcGVjdGl2ZTtcbiAgICB9XG4gICAgdGhpcy5fbm9kZS5jb21taXQodGhpcy5fbm9kZUNvbnRleHQpO1xufTtcbkNvbnRleHQucHJvdG90eXBlLmdldFBlcnNwZWN0aXZlID0gZnVuY3Rpb24gZ2V0UGVyc3BlY3RpdmUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3BlcnNwZWN0aXZlU3RhdGUuZ2V0KCk7XG59O1xuQ29udGV4dC5wcm90b3R5cGUuc2V0UGVyc3BlY3RpdmUgPSBmdW5jdGlvbiBzZXRQZXJzcGVjdGl2ZShwZXJzcGVjdGl2ZSwgdHJhbnNpdGlvbiwgY2FsbGJhY2spIHtcbiAgICByZXR1cm4gdGhpcy5fcGVyc3BlY3RpdmVTdGF0ZS5zZXQocGVyc3BlY3RpdmUsIHRyYW5zaXRpb24sIGNhbGxiYWNrKTtcbn07XG5Db250ZXh0LnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24gZW1pdCh0eXBlLCBldmVudCkge1xuICAgIHJldHVybiB0aGlzLl9ldmVudE91dHB1dC5lbWl0KHR5cGUsIGV2ZW50KTtcbn07XG5Db250ZXh0LnByb3RvdHlwZS5vbiA9IGZ1bmN0aW9uIG9uKHR5cGUsIGhhbmRsZXIpIHtcbiAgICByZXR1cm4gdGhpcy5fZXZlbnRPdXRwdXQub24odHlwZSwgaGFuZGxlcik7XG59O1xuQ29udGV4dC5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXIgPSBmdW5jdGlvbiByZW1vdmVMaXN0ZW5lcih0eXBlLCBoYW5kbGVyKSB7XG4gICAgcmV0dXJuIHRoaXMuX2V2ZW50T3V0cHV0LnJlbW92ZUxpc3RlbmVyKHR5cGUsIGhhbmRsZXIpO1xufTtcbkNvbnRleHQucHJvdG90eXBlLnBpcGUgPSBmdW5jdGlvbiBwaXBlKHRhcmdldCkge1xuICAgIHJldHVybiB0aGlzLl9ldmVudE91dHB1dC5waXBlKHRhcmdldCk7XG59O1xuQ29udGV4dC5wcm90b3R5cGUudW5waXBlID0gZnVuY3Rpb24gdW5waXBlKHRhcmdldCkge1xuICAgIHJldHVybiB0aGlzLl9ldmVudE91dHB1dC51bnBpcGUodGFyZ2V0KTtcbn07XG5tb2R1bGUuZXhwb3J0cyA9IENvbnRleHQ7IiwiZnVuY3Rpb24gRWxlbWVudEFsbG9jYXRvcihjb250YWluZXIpIHtcbiAgICBpZiAoIWNvbnRhaW5lcilcbiAgICAgICAgY29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpO1xuICAgIHRoaXMuY29udGFpbmVyID0gY29udGFpbmVyO1xuICAgIHRoaXMuZGV0YWNoZWROb2RlcyA9IHt9O1xuICAgIHRoaXMubm9kZUNvdW50ID0gMDtcbn1cbkVsZW1lbnRBbGxvY2F0b3IucHJvdG90eXBlLm1pZ3JhdGUgPSBmdW5jdGlvbiBtaWdyYXRlKGNvbnRhaW5lcikge1xuICAgIHZhciBvbGRDb250YWluZXIgPSB0aGlzLmNvbnRhaW5lcjtcbiAgICBpZiAoY29udGFpbmVyID09PSBvbGRDb250YWluZXIpXG4gICAgICAgIHJldHVybjtcbiAgICBpZiAob2xkQ29udGFpbmVyIGluc3RhbmNlb2YgRG9jdW1lbnRGcmFnbWVudCkge1xuICAgICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQob2xkQ29udGFpbmVyKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB3aGlsZSAob2xkQ29udGFpbmVyLmhhc0NoaWxkTm9kZXMoKSkge1xuICAgICAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKG9sZENvbnRhaW5lci5yZW1vdmVDaGlsZChvbGRDb250YWluZXIuZmlyc3RDaGlsZCkpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHRoaXMuY29udGFpbmVyID0gY29udGFpbmVyO1xufTtcbkVsZW1lbnRBbGxvY2F0b3IucHJvdG90eXBlLmFsbG9jYXRlID0gZnVuY3Rpb24gYWxsb2NhdGUodHlwZSkge1xuICAgIHR5cGUgPSB0eXBlLnRvTG93ZXJDYXNlKCk7XG4gICAgaWYgKCEodHlwZSBpbiB0aGlzLmRldGFjaGVkTm9kZXMpKVxuICAgICAgICB0aGlzLmRldGFjaGVkTm9kZXNbdHlwZV0gPSBbXTtcbiAgICB2YXIgbm9kZVN0b3JlID0gdGhpcy5kZXRhY2hlZE5vZGVzW3R5cGVdO1xuICAgIHZhciByZXN1bHQ7XG4gICAgaWYgKG5vZGVTdG9yZS5sZW5ndGggPiAwKSB7XG4gICAgICAgIHJlc3VsdCA9IG5vZGVTdG9yZS5wb3AoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXN1bHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHR5cGUpO1xuICAgICAgICB0aGlzLmNvbnRhaW5lci5hcHBlbmRDaGlsZChyZXN1bHQpO1xuICAgIH1cbiAgICB0aGlzLm5vZGVDb3VudCsrO1xuICAgIHJldHVybiByZXN1bHQ7XG59O1xuRWxlbWVudEFsbG9jYXRvci5wcm90b3R5cGUuZGVhbGxvY2F0ZSA9IGZ1bmN0aW9uIGRlYWxsb2NhdGUoZWxlbWVudCkge1xuICAgIHZhciBub2RlVHlwZSA9IGVsZW1lbnQubm9kZU5hbWUudG9Mb3dlckNhc2UoKTtcbiAgICB2YXIgbm9kZVN0b3JlID0gdGhpcy5kZXRhY2hlZE5vZGVzW25vZGVUeXBlXTtcbiAgICBub2RlU3RvcmUucHVzaChlbGVtZW50KTtcbiAgICB0aGlzLm5vZGVDb3VudC0tO1xufTtcbkVsZW1lbnRBbGxvY2F0b3IucHJvdG90eXBlLmdldE5vZGVDb3VudCA9IGZ1bmN0aW9uIGdldE5vZGVDb3VudCgpIHtcbiAgICByZXR1cm4gdGhpcy5ub2RlQ291bnQ7XG59O1xubW9kdWxlLmV4cG9ydHMgPSBFbGVtZW50QWxsb2NhdG9yOyIsInZhciBFbnRpdHkgPSByZXF1aXJlKCcuL0VudGl0eScpO1xudmFyIEV2ZW50SGFuZGxlciA9IHJlcXVpcmUoJy4vRXZlbnRIYW5kbGVyJyk7XG52YXIgVHJhbnNmb3JtID0gcmVxdWlyZSgnLi9UcmFuc2Zvcm0nKTtcbnZhciB1c2VQcmVmaXggPSAhKCd0cmFuc2Zvcm0nIGluIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zdHlsZSk7XG52YXIgZGV2aWNlUGl4ZWxSYXRpbyA9IHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvIHx8IDE7XG5mdW5jdGlvbiBFbGVtZW50T3V0cHV0KGVsZW1lbnQpIHtcbiAgICB0aGlzLl9tYXRyaXggPSBudWxsO1xuICAgIHRoaXMuX29wYWNpdHkgPSAxO1xuICAgIHRoaXMuX29yaWdpbiA9IG51bGw7XG4gICAgdGhpcy5fc2l6ZSA9IG51bGw7XG4gICAgdGhpcy5fZXZlbnRPdXRwdXQgPSBuZXcgRXZlbnRIYW5kbGVyKCk7XG4gICAgdGhpcy5fZXZlbnRPdXRwdXQuYmluZFRoaXModGhpcyk7XG4gICAgdGhpcy5ldmVudEZvcndhcmRlciA9IGZ1bmN0aW9uIGV2ZW50Rm9yd2FyZGVyKGV2ZW50KSB7XG4gICAgICAgIHRoaXMuX2V2ZW50T3V0cHV0LmVtaXQoZXZlbnQudHlwZSwgZXZlbnQpO1xuICAgIH0uYmluZCh0aGlzKTtcbiAgICB0aGlzLmlkID0gRW50aXR5LnJlZ2lzdGVyKHRoaXMpO1xuICAgIHRoaXMuX2VsZW1lbnQgPSBudWxsO1xuICAgIHRoaXMuX3NpemVEaXJ0eSA9IGZhbHNlO1xuICAgIHRoaXMuX29yaWdpbkRpcnR5ID0gZmFsc2U7XG4gICAgdGhpcy5fdHJhbnNmb3JtRGlydHkgPSBmYWxzZTtcbiAgICB0aGlzLl9pbnZpc2libGUgPSBmYWxzZTtcbiAgICBpZiAoZWxlbWVudClcbiAgICAgICAgdGhpcy5hdHRhY2goZWxlbWVudCk7XG59XG5FbGVtZW50T3V0cHV0LnByb3RvdHlwZS5vbiA9IGZ1bmN0aW9uIG9uKHR5cGUsIGZuKSB7XG4gICAgaWYgKHRoaXMuX2VsZW1lbnQpXG4gICAgICAgIHRoaXMuX2VsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcih0eXBlLCB0aGlzLmV2ZW50Rm9yd2FyZGVyKTtcbiAgICB0aGlzLl9ldmVudE91dHB1dC5vbih0eXBlLCBmbik7XG59O1xuRWxlbWVudE91dHB1dC5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXIgPSBmdW5jdGlvbiByZW1vdmVMaXN0ZW5lcih0eXBlLCBmbikge1xuICAgIHRoaXMuX2V2ZW50T3V0cHV0LnJlbW92ZUxpc3RlbmVyKHR5cGUsIGZuKTtcbn07XG5FbGVtZW50T3V0cHV0LnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24gZW1pdCh0eXBlLCBldmVudCkge1xuICAgIGlmIChldmVudCAmJiAhZXZlbnQub3JpZ2luKVxuICAgICAgICBldmVudC5vcmlnaW4gPSB0aGlzO1xuICAgIHZhciBoYW5kbGVkID0gdGhpcy5fZXZlbnRPdXRwdXQuZW1pdCh0eXBlLCBldmVudCk7XG4gICAgaWYgKGhhbmRsZWQgJiYgZXZlbnQgJiYgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKVxuICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICByZXR1cm4gaGFuZGxlZDtcbn07XG5FbGVtZW50T3V0cHV0LnByb3RvdHlwZS5waXBlID0gZnVuY3Rpb24gcGlwZSh0YXJnZXQpIHtcbiAgICByZXR1cm4gdGhpcy5fZXZlbnRPdXRwdXQucGlwZSh0YXJnZXQpO1xufTtcbkVsZW1lbnRPdXRwdXQucHJvdG90eXBlLnVucGlwZSA9IGZ1bmN0aW9uIHVucGlwZSh0YXJnZXQpIHtcbiAgICByZXR1cm4gdGhpcy5fZXZlbnRPdXRwdXQudW5waXBlKHRhcmdldCk7XG59O1xuRWxlbWVudE91dHB1dC5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgIHJldHVybiB0aGlzLmlkO1xufTtcbmZ1bmN0aW9uIF9hZGRFdmVudExpc3RlbmVycyh0YXJnZXQpIHtcbiAgICBmb3IgKHZhciBpIGluIHRoaXMuX2V2ZW50T3V0cHV0Lmxpc3RlbmVycykge1xuICAgICAgICB0YXJnZXQuYWRkRXZlbnRMaXN0ZW5lcihpLCB0aGlzLmV2ZW50Rm9yd2FyZGVyKTtcbiAgICB9XG59XG5mdW5jdGlvbiBfcmVtb3ZlRXZlbnRMaXN0ZW5lcnModGFyZ2V0KSB7XG4gICAgZm9yICh2YXIgaSBpbiB0aGlzLl9ldmVudE91dHB1dC5saXN0ZW5lcnMpIHtcbiAgICAgICAgdGFyZ2V0LnJlbW92ZUV2ZW50TGlzdGVuZXIoaSwgdGhpcy5ldmVudEZvcndhcmRlcik7XG4gICAgfVxufVxuZnVuY3Rpb24gX2Zvcm1hdENTU1RyYW5zZm9ybShtKSB7XG4gICAgdmFyIHJlc3VsdCA9ICdtYXRyaXgzZCgnO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMTU7IGkrKykge1xuICAgICAgICByZXN1bHQgKz0gbVtpXSA8IDAuMDAwMDAxICYmIG1baV0gPiAtMC4wMDAwMDEgPyAnMCwnIDogbVtpXSArICcsJztcbiAgICB9XG4gICAgcmVzdWx0ICs9IG1bMTVdICsgJyknO1xuICAgIHJldHVybiByZXN1bHQ7XG59XG52YXIgX3NldE1hdHJpeDtcbmlmIChuYXZpZ2F0b3IudXNlckFnZW50LnRvTG93ZXJDYXNlKCkuaW5kZXhPZignZmlyZWZveCcpID4gLTEpIHtcbiAgICBfc2V0TWF0cml4ID0gZnVuY3Rpb24gKGVsZW1lbnQsIG1hdHJpeCkge1xuICAgICAgICBlbGVtZW50LnN0eWxlLnpJbmRleCA9IG1hdHJpeFsxNF0gKiAxMDAwMDAwIHwgMDtcbiAgICAgICAgZWxlbWVudC5zdHlsZS50cmFuc2Zvcm0gPSBfZm9ybWF0Q1NTVHJhbnNmb3JtKG1hdHJpeCk7XG4gICAgfTtcbn0gZWxzZSBpZiAodXNlUHJlZml4KSB7XG4gICAgX3NldE1hdHJpeCA9IGZ1bmN0aW9uIChlbGVtZW50LCBtYXRyaXgpIHtcbiAgICAgICAgZWxlbWVudC5zdHlsZS53ZWJraXRUcmFuc2Zvcm0gPSBfZm9ybWF0Q1NTVHJhbnNmb3JtKG1hdHJpeCk7XG4gICAgfTtcbn0gZWxzZSB7XG4gICAgX3NldE1hdHJpeCA9IGZ1bmN0aW9uIChlbGVtZW50LCBtYXRyaXgpIHtcbiAgICAgICAgZWxlbWVudC5zdHlsZS50cmFuc2Zvcm0gPSBfZm9ybWF0Q1NTVHJhbnNmb3JtKG1hdHJpeCk7XG4gICAgfTtcbn1cbmZ1bmN0aW9uIF9mb3JtYXRDU1NPcmlnaW4ob3JpZ2luKSB7XG4gICAgcmV0dXJuIDEwMCAqIG9yaWdpblswXSArICclICcgKyAxMDAgKiBvcmlnaW5bMV0gKyAnJSc7XG59XG52YXIgX3NldE9yaWdpbiA9IHVzZVByZWZpeCA/IGZ1bmN0aW9uIChlbGVtZW50LCBvcmlnaW4pIHtcbiAgICAgICAgZWxlbWVudC5zdHlsZS53ZWJraXRUcmFuc2Zvcm1PcmlnaW4gPSBfZm9ybWF0Q1NTT3JpZ2luKG9yaWdpbik7XG4gICAgfSA6IGZ1bmN0aW9uIChlbGVtZW50LCBvcmlnaW4pIHtcbiAgICAgICAgZWxlbWVudC5zdHlsZS50cmFuc2Zvcm1PcmlnaW4gPSBfZm9ybWF0Q1NTT3JpZ2luKG9yaWdpbik7XG4gICAgfTtcbnZhciBfc2V0SW52aXNpYmxlID0gdXNlUHJlZml4ID8gZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICAgICAgZWxlbWVudC5zdHlsZS53ZWJraXRUcmFuc2Zvcm0gPSAnc2NhbGUzZCgwLjAwMDEsMC4wMDAxLDAuMDAwMSknO1xuICAgICAgICBlbGVtZW50LnN0eWxlLm9wYWNpdHkgPSAwO1xuICAgIH0gOiBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgICAgICBlbGVtZW50LnN0eWxlLnRyYW5zZm9ybSA9ICdzY2FsZTNkKDAuMDAwMSwwLjAwMDEsMC4wMDAxKSc7XG4gICAgICAgIGVsZW1lbnQuc3R5bGUub3BhY2l0eSA9IDA7XG4gICAgfTtcbmZ1bmN0aW9uIF94eU5vdEVxdWFscyhhLCBiKSB7XG4gICAgcmV0dXJuIGEgJiYgYiA/IGFbMF0gIT09IGJbMF0gfHwgYVsxXSAhPT0gYlsxXSA6IGEgIT09IGI7XG59XG5FbGVtZW50T3V0cHV0LnByb3RvdHlwZS5jb21taXQgPSBmdW5jdGlvbiBjb21taXQoY29udGV4dCkge1xuICAgIHZhciB0YXJnZXQgPSB0aGlzLl9lbGVtZW50O1xuICAgIGlmICghdGFyZ2V0KVxuICAgICAgICByZXR1cm47XG4gICAgdmFyIG1hdHJpeCA9IGNvbnRleHQudHJhbnNmb3JtO1xuICAgIHZhciBvcGFjaXR5ID0gY29udGV4dC5vcGFjaXR5O1xuICAgIHZhciBvcmlnaW4gPSBjb250ZXh0Lm9yaWdpbjtcbiAgICB2YXIgc2l6ZSA9IGNvbnRleHQuc2l6ZTtcbiAgICBpZiAoIW1hdHJpeCAmJiB0aGlzLl9tYXRyaXgpIHtcbiAgICAgICAgdGhpcy5fbWF0cml4ID0gbnVsbDtcbiAgICAgICAgdGhpcy5fb3BhY2l0eSA9IDA7XG4gICAgICAgIF9zZXRJbnZpc2libGUodGFyZ2V0KTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoX3h5Tm90RXF1YWxzKHRoaXMuX29yaWdpbiwgb3JpZ2luKSlcbiAgICAgICAgdGhpcy5fb3JpZ2luRGlydHkgPSB0cnVlO1xuICAgIGlmIChUcmFuc2Zvcm0ubm90RXF1YWxzKHRoaXMuX21hdHJpeCwgbWF0cml4KSlcbiAgICAgICAgdGhpcy5fdHJhbnNmb3JtRGlydHkgPSB0cnVlO1xuICAgIGlmICh0aGlzLl9pbnZpc2libGUpIHtcbiAgICAgICAgdGhpcy5faW52aXNpYmxlID0gZmFsc2U7XG4gICAgICAgIHRoaXMuX2VsZW1lbnQuc3R5bGUuZGlzcGxheSA9ICcnO1xuICAgIH1cbiAgICBpZiAodGhpcy5fb3BhY2l0eSAhPT0gb3BhY2l0eSkge1xuICAgICAgICB0aGlzLl9vcGFjaXR5ID0gb3BhY2l0eTtcbiAgICAgICAgdGFyZ2V0LnN0eWxlLm9wYWNpdHkgPSBvcGFjaXR5ID49IDEgPyAnMC45OTk5OTknIDogb3BhY2l0eTtcbiAgICB9XG4gICAgaWYgKHRoaXMuX3RyYW5zZm9ybURpcnR5IHx8IHRoaXMuX29yaWdpbkRpcnR5IHx8IHRoaXMuX3NpemVEaXJ0eSkge1xuICAgICAgICBpZiAodGhpcy5fc2l6ZURpcnR5KVxuICAgICAgICAgICAgdGhpcy5fc2l6ZURpcnR5ID0gZmFsc2U7XG4gICAgICAgIGlmICh0aGlzLl9vcmlnaW5EaXJ0eSkge1xuICAgICAgICAgICAgaWYgKG9yaWdpbikge1xuICAgICAgICAgICAgICAgIGlmICghdGhpcy5fb3JpZ2luKVxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9vcmlnaW4gPSBbXG4gICAgICAgICAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgMFxuICAgICAgICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgICAgIHRoaXMuX29yaWdpblswXSA9IG9yaWdpblswXTtcbiAgICAgICAgICAgICAgICB0aGlzLl9vcmlnaW5bMV0gPSBvcmlnaW5bMV07XG4gICAgICAgICAgICB9IGVsc2VcbiAgICAgICAgICAgICAgICB0aGlzLl9vcmlnaW4gPSBudWxsO1xuICAgICAgICAgICAgX3NldE9yaWdpbih0YXJnZXQsIHRoaXMuX29yaWdpbik7XG4gICAgICAgICAgICB0aGlzLl9vcmlnaW5EaXJ0eSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmICghbWF0cml4KVxuICAgICAgICAgICAgbWF0cml4ID0gVHJhbnNmb3JtLmlkZW50aXR5O1xuICAgICAgICB0aGlzLl9tYXRyaXggPSBtYXRyaXg7XG4gICAgICAgIHZhciBhYU1hdHJpeCA9IHRoaXMuX3NpemUgPyBUcmFuc2Zvcm0udGhlbk1vdmUobWF0cml4LCBbXG4gICAgICAgICAgICAgICAgLXRoaXMuX3NpemVbMF0gKiBvcmlnaW5bMF0sXG4gICAgICAgICAgICAgICAgLXRoaXMuX3NpemVbMV0gKiBvcmlnaW5bMV0sXG4gICAgICAgICAgICAgICAgMFxuICAgICAgICAgICAgXSkgOiBtYXRyaXg7XG4gICAgICAgIF9zZXRNYXRyaXgodGFyZ2V0LCBhYU1hdHJpeCk7XG4gICAgICAgIHRoaXMuX3RyYW5zZm9ybURpcnR5ID0gZmFsc2U7XG4gICAgfVxufTtcbkVsZW1lbnRPdXRwdXQucHJvdG90eXBlLmNsZWFudXAgPSBmdW5jdGlvbiBjbGVhbnVwKCkge1xuICAgIGlmICh0aGlzLl9lbGVtZW50KSB7XG4gICAgICAgIHRoaXMuX2ludmlzaWJsZSA9IHRydWU7XG4gICAgICAgIHRoaXMuX2VsZW1lbnQuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICB9XG59O1xuRWxlbWVudE91dHB1dC5wcm90b3R5cGUuYXR0YWNoID0gZnVuY3Rpb24gYXR0YWNoKHRhcmdldCkge1xuICAgIHRoaXMuX2VsZW1lbnQgPSB0YXJnZXQ7XG4gICAgX2FkZEV2ZW50TGlzdGVuZXJzLmNhbGwodGhpcywgdGFyZ2V0KTtcbn07XG5FbGVtZW50T3V0cHV0LnByb3RvdHlwZS5kZXRhY2ggPSBmdW5jdGlvbiBkZXRhY2goKSB7XG4gICAgdmFyIHRhcmdldCA9IHRoaXMuX2VsZW1lbnQ7XG4gICAgaWYgKHRhcmdldCkge1xuICAgICAgICBfcmVtb3ZlRXZlbnRMaXN0ZW5lcnMuY2FsbCh0aGlzLCB0YXJnZXQpO1xuICAgICAgICBpZiAodGhpcy5faW52aXNpYmxlKSB7XG4gICAgICAgICAgICB0aGlzLl9pbnZpc2libGUgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuX2VsZW1lbnQuc3R5bGUuZGlzcGxheSA9ICcnO1xuICAgICAgICB9XG4gICAgfVxuICAgIHRoaXMuX2VsZW1lbnQgPSBudWxsO1xuICAgIHJldHVybiB0YXJnZXQ7XG59O1xubW9kdWxlLmV4cG9ydHMgPSBFbGVtZW50T3V0cHV0OyIsInZhciBDb250ZXh0ID0gcmVxdWlyZSgnLi9Db250ZXh0Jyk7XG52YXIgRXZlbnRIYW5kbGVyID0gcmVxdWlyZSgnLi9FdmVudEhhbmRsZXInKTtcbnZhciBPcHRpb25zTWFuYWdlciA9IHJlcXVpcmUoJy4vT3B0aW9uc01hbmFnZXInKTtcbnZhciBFbmdpbmUgPSB7fTtcbnZhciBjb250ZXh0cyA9IFtdO1xudmFyIG5leHRUaWNrUXVldWUgPSBbXTtcbnZhciBkZWZlclF1ZXVlID0gW107XG52YXIgbGFzdFRpbWUgPSBEYXRlLm5vdygpO1xudmFyIGZyYW1lVGltZTtcbnZhciBmcmFtZVRpbWVMaW1pdDtcbnZhciBsb29wRW5hYmxlZCA9IHRydWU7XG52YXIgZXZlbnRGb3J3YXJkZXJzID0ge307XG52YXIgZXZlbnRIYW5kbGVyID0gbmV3IEV2ZW50SGFuZGxlcigpO1xudmFyIG9wdGlvbnMgPSB7XG4gICAgICAgIGNvbnRhaW5lclR5cGU6ICdkaXYnLFxuICAgICAgICBjb250YWluZXJDbGFzczogJ2ZhbW91cy1jb250YWluZXInLFxuICAgICAgICBmcHNDYXA6IHVuZGVmaW5lZCxcbiAgICAgICAgcnVuTG9vcDogdHJ1ZSxcbiAgICAgICAgYXBwTW9kZTogdHJ1ZVxuICAgIH07XG52YXIgb3B0aW9uc01hbmFnZXIgPSBuZXcgT3B0aW9uc01hbmFnZXIob3B0aW9ucyk7XG52YXIgTUFYX0RFRkVSX0ZSQU1FX1RJTUUgPSAxMDtcbkVuZ2luZS5zdGVwID0gZnVuY3Rpb24gc3RlcCgpIHtcbiAgICB2YXIgY3VycmVudFRpbWUgPSBEYXRlLm5vdygpO1xuICAgIGlmIChmcmFtZVRpbWVMaW1pdCAmJiBjdXJyZW50VGltZSAtIGxhc3RUaW1lIDwgZnJhbWVUaW1lTGltaXQpXG4gICAgICAgIHJldHVybjtcbiAgICB2YXIgaSA9IDA7XG4gICAgZnJhbWVUaW1lID0gY3VycmVudFRpbWUgLSBsYXN0VGltZTtcbiAgICBsYXN0VGltZSA9IGN1cnJlbnRUaW1lO1xuICAgIGV2ZW50SGFuZGxlci5lbWl0KCdwcmVyZW5kZXInKTtcbiAgICBmb3IgKGkgPSAwOyBpIDwgbmV4dFRpY2tRdWV1ZS5sZW5ndGg7IGkrKylcbiAgICAgICAgbmV4dFRpY2tRdWV1ZVtpXS5jYWxsKHRoaXMpO1xuICAgIG5leHRUaWNrUXVldWUuc3BsaWNlKDApO1xuICAgIHdoaWxlIChkZWZlclF1ZXVlLmxlbmd0aCAmJiBEYXRlLm5vdygpIC0gY3VycmVudFRpbWUgPCBNQVhfREVGRVJfRlJBTUVfVElNRSkge1xuICAgICAgICBkZWZlclF1ZXVlLnNoaWZ0KCkuY2FsbCh0aGlzKTtcbiAgICB9XG4gICAgZm9yIChpID0gMDsgaSA8IGNvbnRleHRzLmxlbmd0aDsgaSsrKVxuICAgICAgICBjb250ZXh0c1tpXS51cGRhdGUoKTtcbiAgICBldmVudEhhbmRsZXIuZW1pdCgncG9zdHJlbmRlcicpO1xufTtcbmZ1bmN0aW9uIGxvb3AoKSB7XG4gICAgaWYgKG9wdGlvbnMucnVuTG9vcCkge1xuICAgICAgICBFbmdpbmUuc3RlcCgpO1xuICAgICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGxvb3ApO1xuICAgIH0gZWxzZVxuICAgICAgICBsb29wRW5hYmxlZCA9IGZhbHNlO1xufVxud2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShsb29wKTtcbmZ1bmN0aW9uIGhhbmRsZVJlc2l6ZShldmVudCkge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY29udGV4dHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29udGV4dHNbaV0uZW1pdCgncmVzaXplJyk7XG4gICAgfVxuICAgIGV2ZW50SGFuZGxlci5lbWl0KCdyZXNpemUnKTtcbn1cbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCBoYW5kbGVSZXNpemUsIGZhbHNlKTtcbmhhbmRsZVJlc2l6ZSgpO1xuZnVuY3Rpb24gaW5pdGlhbGl6ZSgpIHtcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgfSwgdHJ1ZSk7XG4gICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QuYWRkKCdmYW1vdXMtcm9vdCcpO1xuICAgIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGFzc0xpc3QuYWRkKCdmYW1vdXMtcm9vdCcpO1xufVxudmFyIGluaXRpYWxpemVkID0gZmFsc2U7XG5FbmdpbmUucGlwZSA9IGZ1bmN0aW9uIHBpcGUodGFyZ2V0KSB7XG4gICAgaWYgKHRhcmdldC5zdWJzY3JpYmUgaW5zdGFuY2VvZiBGdW5jdGlvbilcbiAgICAgICAgcmV0dXJuIHRhcmdldC5zdWJzY3JpYmUoRW5naW5lKTtcbiAgICBlbHNlXG4gICAgICAgIHJldHVybiBldmVudEhhbmRsZXIucGlwZSh0YXJnZXQpO1xufTtcbkVuZ2luZS51bnBpcGUgPSBmdW5jdGlvbiB1bnBpcGUodGFyZ2V0KSB7XG4gICAgaWYgKHRhcmdldC51bnN1YnNjcmliZSBpbnN0YW5jZW9mIEZ1bmN0aW9uKVxuICAgICAgICByZXR1cm4gdGFyZ2V0LnVuc3Vic2NyaWJlKEVuZ2luZSk7XG4gICAgZWxzZVxuICAgICAgICByZXR1cm4gZXZlbnRIYW5kbGVyLnVucGlwZSh0YXJnZXQpO1xufTtcbkVuZ2luZS5vbiA9IGZ1bmN0aW9uIG9uKHR5cGUsIGhhbmRsZXIpIHtcbiAgICBpZiAoISh0eXBlIGluIGV2ZW50Rm9yd2FyZGVycykpIHtcbiAgICAgICAgZXZlbnRGb3J3YXJkZXJzW3R5cGVdID0gZXZlbnRIYW5kbGVyLmVtaXQuYmluZChldmVudEhhbmRsZXIsIHR5cGUpO1xuICAgICAgICBpZiAoZG9jdW1lbnQuYm9keSkge1xuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKHR5cGUsIGV2ZW50Rm9yd2FyZGVyc1t0eXBlXSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBFbmdpbmUubmV4dFRpY2soZnVuY3Rpb24gKHR5cGUsIGZvcndhcmRlcikge1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcih0eXBlLCBmb3J3YXJkZXIpO1xuICAgICAgICAgICAgfS5iaW5kKHRoaXMsIHR5cGUsIGV2ZW50Rm9yd2FyZGVyc1t0eXBlXSkpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBldmVudEhhbmRsZXIub24odHlwZSwgaGFuZGxlcik7XG59O1xuRW5naW5lLmVtaXQgPSBmdW5jdGlvbiBlbWl0KHR5cGUsIGV2ZW50KSB7XG4gICAgcmV0dXJuIGV2ZW50SGFuZGxlci5lbWl0KHR5cGUsIGV2ZW50KTtcbn07XG5FbmdpbmUucmVtb3ZlTGlzdGVuZXIgPSBmdW5jdGlvbiByZW1vdmVMaXN0ZW5lcih0eXBlLCBoYW5kbGVyKSB7XG4gICAgcmV0dXJuIGV2ZW50SGFuZGxlci5yZW1vdmVMaXN0ZW5lcih0eXBlLCBoYW5kbGVyKTtcbn07XG5FbmdpbmUuZ2V0RlBTID0gZnVuY3Rpb24gZ2V0RlBTKCkge1xuICAgIHJldHVybiAxMDAwIC8gZnJhbWVUaW1lO1xufTtcbkVuZ2luZS5zZXRGUFNDYXAgPSBmdW5jdGlvbiBzZXRGUFNDYXAoZnBzKSB7XG4gICAgZnJhbWVUaW1lTGltaXQgPSBNYXRoLmZsb29yKDEwMDAgLyBmcHMpO1xufTtcbkVuZ2luZS5nZXRPcHRpb25zID0gZnVuY3Rpb24gZ2V0T3B0aW9ucyhrZXkpIHtcbiAgICByZXR1cm4gb3B0aW9uc01hbmFnZXIuZ2V0T3B0aW9ucyhrZXkpO1xufTtcbkVuZ2luZS5zZXRPcHRpb25zID0gZnVuY3Rpb24gc2V0T3B0aW9ucyhvcHRpb25zKSB7XG4gICAgcmV0dXJuIG9wdGlvbnNNYW5hZ2VyLnNldE9wdGlvbnMuYXBwbHkob3B0aW9uc01hbmFnZXIsIGFyZ3VtZW50cyk7XG59O1xuRW5naW5lLmNyZWF0ZUNvbnRleHQgPSBmdW5jdGlvbiBjcmVhdGVDb250ZXh0KGVsKSB7XG4gICAgaWYgKCFpbml0aWFsaXplZCAmJiBvcHRpb25zLmFwcE1vZGUpXG4gICAgICAgIEVuZ2luZS5uZXh0VGljayhpbml0aWFsaXplKTtcbiAgICB2YXIgbmVlZE1vdW50Q29udGFpbmVyID0gZmFsc2U7XG4gICAgaWYgKCFlbCkge1xuICAgICAgICBlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQob3B0aW9ucy5jb250YWluZXJUeXBlKTtcbiAgICAgICAgZWwuY2xhc3NMaXN0LmFkZChvcHRpb25zLmNvbnRhaW5lckNsYXNzKTtcbiAgICAgICAgbmVlZE1vdW50Q29udGFpbmVyID0gdHJ1ZTtcbiAgICB9XG4gICAgdmFyIGNvbnRleHQgPSBuZXcgQ29udGV4dChlbCk7XG4gICAgRW5naW5lLnJlZ2lzdGVyQ29udGV4dChjb250ZXh0KTtcbiAgICBpZiAobmVlZE1vdW50Q29udGFpbmVyKSB7XG4gICAgICAgIEVuZ2luZS5uZXh0VGljayhmdW5jdGlvbiAoY29udGV4dCwgZWwpIHtcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoZWwpO1xuICAgICAgICAgICAgY29udGV4dC5lbWl0KCdyZXNpemUnKTtcbiAgICAgICAgfS5iaW5kKHRoaXMsIGNvbnRleHQsIGVsKSk7XG4gICAgfVxuICAgIHJldHVybiBjb250ZXh0O1xufTtcbkVuZ2luZS5yZWdpc3RlckNvbnRleHQgPSBmdW5jdGlvbiByZWdpc3RlckNvbnRleHQoY29udGV4dCkge1xuICAgIGNvbnRleHRzLnB1c2goY29udGV4dCk7XG4gICAgcmV0dXJuIGNvbnRleHQ7XG59O1xuRW5naW5lLmdldENvbnRleHRzID0gZnVuY3Rpb24gZ2V0Q29udGV4dHMoKSB7XG4gICAgcmV0dXJuIGNvbnRleHRzO1xufTtcbkVuZ2luZS5kZXJlZ2lzdGVyQ29udGV4dCA9IGZ1bmN0aW9uIGRlcmVnaXN0ZXJDb250ZXh0KGNvbnRleHQpIHtcbiAgICB2YXIgaSA9IGNvbnRleHRzLmluZGV4T2YoY29udGV4dCk7XG4gICAgaWYgKGkgPj0gMClcbiAgICAgICAgY29udGV4dHMuc3BsaWNlKGksIDEpO1xufTtcbkVuZ2luZS5uZXh0VGljayA9IGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgbmV4dFRpY2tRdWV1ZS5wdXNoKGZuKTtcbn07XG5FbmdpbmUuZGVmZXIgPSBmdW5jdGlvbiBkZWZlcihmbikge1xuICAgIGRlZmVyUXVldWUucHVzaChmbik7XG59O1xub3B0aW9uc01hbmFnZXIub24oJ2NoYW5nZScsIGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgaWYgKGRhdGEuaWQgPT09ICdmcHNDYXAnKVxuICAgICAgICBFbmdpbmUuc2V0RlBTQ2FwKGRhdGEudmFsdWUpO1xuICAgIGVsc2UgaWYgKGRhdGEuaWQgPT09ICdydW5Mb29wJykge1xuICAgICAgICBpZiAoIWxvb3BFbmFibGVkICYmIGRhdGEudmFsdWUpIHtcbiAgICAgICAgICAgIGxvb3BFbmFibGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUobG9vcCk7XG4gICAgICAgIH1cbiAgICB9XG59KTtcbm1vZHVsZS5leHBvcnRzID0gRW5naW5lOyIsInZhciBlbnRpdGllcyA9IFtdO1xuZnVuY3Rpb24gZ2V0KGlkKSB7XG4gICAgcmV0dXJuIGVudGl0aWVzW2lkXTtcbn1cbmZ1bmN0aW9uIHNldChpZCwgZW50aXR5KSB7XG4gICAgZW50aXRpZXNbaWRdID0gZW50aXR5O1xufVxuZnVuY3Rpb24gcmVnaXN0ZXIoZW50aXR5KSB7XG4gICAgdmFyIGlkID0gZW50aXRpZXMubGVuZ3RoO1xuICAgIHNldChpZCwgZW50aXR5KTtcbiAgICByZXR1cm4gaWQ7XG59XG5mdW5jdGlvbiB1bnJlZ2lzdGVyKGlkKSB7XG4gICAgc2V0KGlkLCBudWxsKTtcbn1cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIHJlZ2lzdGVyOiByZWdpc3RlcixcbiAgICB1bnJlZ2lzdGVyOiB1bnJlZ2lzdGVyLFxuICAgIGdldDogZ2V0LFxuICAgIHNldDogc2V0XG59OyIsImZ1bmN0aW9uIEV2ZW50RW1pdHRlcigpIHtcbiAgICB0aGlzLmxpc3RlbmVycyA9IHt9O1xuICAgIHRoaXMuX293bmVyID0gdGhpcztcbn1cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uIGVtaXQodHlwZSwgZXZlbnQpIHtcbiAgICB2YXIgaGFuZGxlcnMgPSB0aGlzLmxpc3RlbmVyc1t0eXBlXTtcbiAgICBpZiAoaGFuZGxlcnMpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBoYW5kbGVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaGFuZGxlcnNbaV0uY2FsbCh0aGlzLl9vd25lciwgZXZlbnQpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xufTtcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub24gPSBmdW5jdGlvbiBvbih0eXBlLCBoYW5kbGVyKSB7XG4gICAgaWYgKCEodHlwZSBpbiB0aGlzLmxpc3RlbmVycykpXG4gICAgICAgIHRoaXMubGlzdGVuZXJzW3R5cGVdID0gW107XG4gICAgdmFyIGluZGV4ID0gdGhpcy5saXN0ZW5lcnNbdHlwZV0uaW5kZXhPZihoYW5kbGVyKTtcbiAgICBpZiAoaW5kZXggPCAwKVxuICAgICAgICB0aGlzLmxpc3RlbmVyc1t0eXBlXS5wdXNoKGhhbmRsZXIpO1xuICAgIHJldHVybiB0aGlzO1xufTtcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXIgPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uO1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9IGZ1bmN0aW9uIHJlbW92ZUxpc3RlbmVyKHR5cGUsIGhhbmRsZXIpIHtcbiAgICB2YXIgbGlzdGVuZXIgPSB0aGlzLmxpc3RlbmVyc1t0eXBlXTtcbiAgICBpZiAobGlzdGVuZXIgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICB2YXIgaW5kZXggPSBsaXN0ZW5lci5pbmRleE9mKGhhbmRsZXIpO1xuICAgICAgICBpZiAoaW5kZXggPj0gMClcbiAgICAgICAgICAgIGxpc3RlbmVyLnNwbGljZShpbmRleCwgMSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xufTtcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuYmluZFRoaXMgPSBmdW5jdGlvbiBiaW5kVGhpcyhvd25lcikge1xuICAgIHRoaXMuX293bmVyID0gb3duZXI7XG59O1xubW9kdWxlLmV4cG9ydHMgPSBFdmVudEVtaXR0ZXI7IiwidmFyIEV2ZW50RW1pdHRlciA9IHJlcXVpcmUoJy4vRXZlbnRFbWl0dGVyJyk7XG5mdW5jdGlvbiBFdmVudEhhbmRsZXIoKSB7XG4gICAgRXZlbnRFbWl0dGVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgdGhpcy5kb3duc3RyZWFtID0gW107XG4gICAgdGhpcy5kb3duc3RyZWFtRm4gPSBbXTtcbiAgICB0aGlzLnVwc3RyZWFtID0gW107XG4gICAgdGhpcy51cHN0cmVhbUxpc3RlbmVycyA9IHt9O1xufVxuRXZlbnRIYW5kbGVyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoRXZlbnRFbWl0dGVyLnByb3RvdHlwZSk7XG5FdmVudEhhbmRsZXIucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gRXZlbnRIYW5kbGVyO1xuRXZlbnRIYW5kbGVyLnNldElucHV0SGFuZGxlciA9IGZ1bmN0aW9uIHNldElucHV0SGFuZGxlcihvYmplY3QsIGhhbmRsZXIpIHtcbiAgICBvYmplY3QudHJpZ2dlciA9IGhhbmRsZXIudHJpZ2dlci5iaW5kKGhhbmRsZXIpO1xuICAgIGlmIChoYW5kbGVyLnN1YnNjcmliZSAmJiBoYW5kbGVyLnVuc3Vic2NyaWJlKSB7XG4gICAgICAgIG9iamVjdC5zdWJzY3JpYmUgPSBoYW5kbGVyLnN1YnNjcmliZS5iaW5kKGhhbmRsZXIpO1xuICAgICAgICBvYmplY3QudW5zdWJzY3JpYmUgPSBoYW5kbGVyLnVuc3Vic2NyaWJlLmJpbmQoaGFuZGxlcik7XG4gICAgfVxufTtcbkV2ZW50SGFuZGxlci5zZXRPdXRwdXRIYW5kbGVyID0gZnVuY3Rpb24gc2V0T3V0cHV0SGFuZGxlcihvYmplY3QsIGhhbmRsZXIpIHtcbiAgICBpZiAoaGFuZGxlciBpbnN0YW5jZW9mIEV2ZW50SGFuZGxlcilcbiAgICAgICAgaGFuZGxlci5iaW5kVGhpcyhvYmplY3QpO1xuICAgIG9iamVjdC5waXBlID0gaGFuZGxlci5waXBlLmJpbmQoaGFuZGxlcik7XG4gICAgb2JqZWN0LnVucGlwZSA9IGhhbmRsZXIudW5waXBlLmJpbmQoaGFuZGxlcik7XG4gICAgb2JqZWN0Lm9uID0gaGFuZGxlci5vbi5iaW5kKGhhbmRsZXIpO1xuICAgIG9iamVjdC5hZGRMaXN0ZW5lciA9IG9iamVjdC5vbjtcbiAgICBvYmplY3QucmVtb3ZlTGlzdGVuZXIgPSBoYW5kbGVyLnJlbW92ZUxpc3RlbmVyLmJpbmQoaGFuZGxlcik7XG59O1xuRXZlbnRIYW5kbGVyLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24gZW1pdCh0eXBlLCBldmVudCkge1xuICAgIEV2ZW50RW1pdHRlci5wcm90b3R5cGUuZW1pdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIHZhciBpID0gMDtcbiAgICBmb3IgKGkgPSAwOyBpIDwgdGhpcy5kb3duc3RyZWFtLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmICh0aGlzLmRvd25zdHJlYW1baV0udHJpZ2dlcilcbiAgICAgICAgICAgIHRoaXMuZG93bnN0cmVhbVtpXS50cmlnZ2VyKHR5cGUsIGV2ZW50KTtcbiAgICB9XG4gICAgZm9yIChpID0gMDsgaSA8IHRoaXMuZG93bnN0cmVhbUZuLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHRoaXMuZG93bnN0cmVhbUZuW2ldKHR5cGUsIGV2ZW50KTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuRXZlbnRIYW5kbGVyLnByb3RvdHlwZS50cmlnZ2VyID0gRXZlbnRIYW5kbGVyLnByb3RvdHlwZS5lbWl0O1xuRXZlbnRIYW5kbGVyLnByb3RvdHlwZS5waXBlID0gZnVuY3Rpb24gcGlwZSh0YXJnZXQpIHtcbiAgICBpZiAodGFyZ2V0LnN1YnNjcmliZSBpbnN0YW5jZW9mIEZ1bmN0aW9uKVxuICAgICAgICByZXR1cm4gdGFyZ2V0LnN1YnNjcmliZSh0aGlzKTtcbiAgICB2YXIgZG93bnN0cmVhbUN0eCA9IHRhcmdldCBpbnN0YW5jZW9mIEZ1bmN0aW9uID8gdGhpcy5kb3duc3RyZWFtRm4gOiB0aGlzLmRvd25zdHJlYW07XG4gICAgdmFyIGluZGV4ID0gZG93bnN0cmVhbUN0eC5pbmRleE9mKHRhcmdldCk7XG4gICAgaWYgKGluZGV4IDwgMClcbiAgICAgICAgZG93bnN0cmVhbUN0eC5wdXNoKHRhcmdldCk7XG4gICAgaWYgKHRhcmdldCBpbnN0YW5jZW9mIEZ1bmN0aW9uKVxuICAgICAgICB0YXJnZXQoJ3BpcGUnLCBudWxsKTtcbiAgICBlbHNlIGlmICh0YXJnZXQudHJpZ2dlcilcbiAgICAgICAgdGFyZ2V0LnRyaWdnZXIoJ3BpcGUnLCBudWxsKTtcbiAgICByZXR1cm4gdGFyZ2V0O1xufTtcbkV2ZW50SGFuZGxlci5wcm90b3R5cGUudW5waXBlID0gZnVuY3Rpb24gdW5waXBlKHRhcmdldCkge1xuICAgIGlmICh0YXJnZXQudW5zdWJzY3JpYmUgaW5zdGFuY2VvZiBGdW5jdGlvbilcbiAgICAgICAgcmV0dXJuIHRhcmdldC51bnN1YnNjcmliZSh0aGlzKTtcbiAgICB2YXIgZG93bnN0cmVhbUN0eCA9IHRhcmdldCBpbnN0YW5jZW9mIEZ1bmN0aW9uID8gdGhpcy5kb3duc3RyZWFtRm4gOiB0aGlzLmRvd25zdHJlYW07XG4gICAgdmFyIGluZGV4ID0gZG93bnN0cmVhbUN0eC5pbmRleE9mKHRhcmdldCk7XG4gICAgaWYgKGluZGV4ID49IDApIHtcbiAgICAgICAgZG93bnN0cmVhbUN0eC5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICBpZiAodGFyZ2V0IGluc3RhbmNlb2YgRnVuY3Rpb24pXG4gICAgICAgICAgICB0YXJnZXQoJ3VucGlwZScsIG51bGwpO1xuICAgICAgICBlbHNlIGlmICh0YXJnZXQudHJpZ2dlcilcbiAgICAgICAgICAgIHRhcmdldC50cmlnZ2VyKCd1bnBpcGUnLCBudWxsKTtcbiAgICAgICAgcmV0dXJuIHRhcmdldDtcbiAgICB9IGVsc2VcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xufTtcbkV2ZW50SGFuZGxlci5wcm90b3R5cGUub24gPSBmdW5jdGlvbiBvbih0eXBlLCBoYW5kbGVyKSB7XG4gICAgRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIGlmICghKHR5cGUgaW4gdGhpcy51cHN0cmVhbUxpc3RlbmVycykpIHtcbiAgICAgICAgdmFyIHVwc3RyZWFtTGlzdGVuZXIgPSB0aGlzLnRyaWdnZXIuYmluZCh0aGlzLCB0eXBlKTtcbiAgICAgICAgdGhpcy51cHN0cmVhbUxpc3RlbmVyc1t0eXBlXSA9IHVwc3RyZWFtTGlzdGVuZXI7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy51cHN0cmVhbS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdGhpcy51cHN0cmVhbVtpXS5vbih0eXBlLCB1cHN0cmVhbUxpc3RlbmVyKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbn07XG5FdmVudEhhbmRsZXIucHJvdG90eXBlLmFkZExpc3RlbmVyID0gRXZlbnRIYW5kbGVyLnByb3RvdHlwZS5vbjtcbkV2ZW50SGFuZGxlci5wcm90b3R5cGUuc3Vic2NyaWJlID0gZnVuY3Rpb24gc3Vic2NyaWJlKHNvdXJjZSkge1xuICAgIHZhciBpbmRleCA9IHRoaXMudXBzdHJlYW0uaW5kZXhPZihzb3VyY2UpO1xuICAgIGlmIChpbmRleCA8IDApIHtcbiAgICAgICAgdGhpcy51cHN0cmVhbS5wdXNoKHNvdXJjZSk7XG4gICAgICAgIGZvciAodmFyIHR5cGUgaW4gdGhpcy51cHN0cmVhbUxpc3RlbmVycykge1xuICAgICAgICAgICAgc291cmNlLm9uKHR5cGUsIHRoaXMudXBzdHJlYW1MaXN0ZW5lcnNbdHlwZV0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xufTtcbkV2ZW50SGFuZGxlci5wcm90b3R5cGUudW5zdWJzY3JpYmUgPSBmdW5jdGlvbiB1bnN1YnNjcmliZShzb3VyY2UpIHtcbiAgICB2YXIgaW5kZXggPSB0aGlzLnVwc3RyZWFtLmluZGV4T2Yoc291cmNlKTtcbiAgICBpZiAoaW5kZXggPj0gMCkge1xuICAgICAgICB0aGlzLnVwc3RyZWFtLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIGZvciAodmFyIHR5cGUgaW4gdGhpcy51cHN0cmVhbUxpc3RlbmVycykge1xuICAgICAgICAgICAgc291cmNlLnJlbW92ZUxpc3RlbmVyKHR5cGUsIHRoaXMudXBzdHJlYW1MaXN0ZW5lcnNbdHlwZV0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xufTtcbm1vZHVsZS5leHBvcnRzID0gRXZlbnRIYW5kbGVyOyIsInZhciBUcmFuc2Zvcm0gPSByZXF1aXJlKCcuL1RyYW5zZm9ybScpO1xudmFyIFRyYW5zaXRpb25hYmxlID0gcmVxdWlyZSgnLi4vdHJhbnNpdGlvbnMvVHJhbnNpdGlvbmFibGUnKTtcbnZhciBUcmFuc2l0aW9uYWJsZVRyYW5zZm9ybSA9IHJlcXVpcmUoJy4uL3RyYW5zaXRpb25zL1RyYW5zaXRpb25hYmxlVHJhbnNmb3JtJyk7XG5mdW5jdGlvbiBNb2RpZmllcihvcHRpb25zKSB7XG4gICAgdGhpcy5fdHJhbnNmb3JtR2V0dGVyID0gbnVsbDtcbiAgICB0aGlzLl9vcGFjaXR5R2V0dGVyID0gbnVsbDtcbiAgICB0aGlzLl9vcmlnaW5HZXR0ZXIgPSBudWxsO1xuICAgIHRoaXMuX2FsaWduR2V0dGVyID0gbnVsbDtcbiAgICB0aGlzLl9zaXplR2V0dGVyID0gbnVsbDtcbiAgICB0aGlzLl9wcm9wb3J0aW9uR2V0dGVyID0gbnVsbDtcbiAgICB0aGlzLl9sZWdhY3lTdGF0ZXMgPSB7fTtcbiAgICB0aGlzLl9vdXRwdXQgPSB7XG4gICAgICAgIHRyYW5zZm9ybTogVHJhbnNmb3JtLmlkZW50aXR5LFxuICAgICAgICBvcGFjaXR5OiAxLFxuICAgICAgICBvcmlnaW46IG51bGwsXG4gICAgICAgIGFsaWduOiBudWxsLFxuICAgICAgICBzaXplOiBudWxsLFxuICAgICAgICBwcm9wb3J0aW9uczogbnVsbCxcbiAgICAgICAgdGFyZ2V0OiBudWxsXG4gICAgfTtcbiAgICBpZiAob3B0aW9ucykge1xuICAgICAgICBpZiAob3B0aW9ucy50cmFuc2Zvcm0pXG4gICAgICAgICAgICB0aGlzLnRyYW5zZm9ybUZyb20ob3B0aW9ucy50cmFuc2Zvcm0pO1xuICAgICAgICBpZiAob3B0aW9ucy5vcGFjaXR5ICE9PSB1bmRlZmluZWQpXG4gICAgICAgICAgICB0aGlzLm9wYWNpdHlGcm9tKG9wdGlvbnMub3BhY2l0eSk7XG4gICAgICAgIGlmIChvcHRpb25zLm9yaWdpbilcbiAgICAgICAgICAgIHRoaXMub3JpZ2luRnJvbShvcHRpb25zLm9yaWdpbik7XG4gICAgICAgIGlmIChvcHRpb25zLmFsaWduKVxuICAgICAgICAgICAgdGhpcy5hbGlnbkZyb20ob3B0aW9ucy5hbGlnbik7XG4gICAgICAgIGlmIChvcHRpb25zLnNpemUpXG4gICAgICAgICAgICB0aGlzLnNpemVGcm9tKG9wdGlvbnMuc2l6ZSk7XG4gICAgICAgIGlmIChvcHRpb25zLnByb3BvcnRpb25zKVxuICAgICAgICAgICAgdGhpcy5wcm9wb3J0aW9uc0Zyb20ob3B0aW9ucy5wcm9wb3J0aW9ucyk7XG4gICAgfVxufVxuTW9kaWZpZXIucHJvdG90eXBlLnRyYW5zZm9ybUZyb20gPSBmdW5jdGlvbiB0cmFuc2Zvcm1Gcm9tKHRyYW5zZm9ybSkge1xuICAgIGlmICh0cmFuc2Zvcm0gaW5zdGFuY2VvZiBGdW5jdGlvbilcbiAgICAgICAgdGhpcy5fdHJhbnNmb3JtR2V0dGVyID0gdHJhbnNmb3JtO1xuICAgIGVsc2UgaWYgKHRyYW5zZm9ybSBpbnN0YW5jZW9mIE9iamVjdCAmJiB0cmFuc2Zvcm0uZ2V0KVxuICAgICAgICB0aGlzLl90cmFuc2Zvcm1HZXR0ZXIgPSB0cmFuc2Zvcm0uZ2V0LmJpbmQodHJhbnNmb3JtKTtcbiAgICBlbHNlIHtcbiAgICAgICAgdGhpcy5fdHJhbnNmb3JtR2V0dGVyID0gbnVsbDtcbiAgICAgICAgdGhpcy5fb3V0cHV0LnRyYW5zZm9ybSA9IHRyYW5zZm9ybTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuTW9kaWZpZXIucHJvdG90eXBlLm9wYWNpdHlGcm9tID0gZnVuY3Rpb24gb3BhY2l0eUZyb20ob3BhY2l0eSkge1xuICAgIGlmIChvcGFjaXR5IGluc3RhbmNlb2YgRnVuY3Rpb24pXG4gICAgICAgIHRoaXMuX29wYWNpdHlHZXR0ZXIgPSBvcGFjaXR5O1xuICAgIGVsc2UgaWYgKG9wYWNpdHkgaW5zdGFuY2VvZiBPYmplY3QgJiYgb3BhY2l0eS5nZXQpXG4gICAgICAgIHRoaXMuX29wYWNpdHlHZXR0ZXIgPSBvcGFjaXR5LmdldC5iaW5kKG9wYWNpdHkpO1xuICAgIGVsc2Uge1xuICAgICAgICB0aGlzLl9vcGFjaXR5R2V0dGVyID0gbnVsbDtcbiAgICAgICAgdGhpcy5fb3V0cHV0Lm9wYWNpdHkgPSBvcGFjaXR5O1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbn07XG5Nb2RpZmllci5wcm90b3R5cGUub3JpZ2luRnJvbSA9IGZ1bmN0aW9uIG9yaWdpbkZyb20ob3JpZ2luKSB7XG4gICAgaWYgKG9yaWdpbiBpbnN0YW5jZW9mIEZ1bmN0aW9uKVxuICAgICAgICB0aGlzLl9vcmlnaW5HZXR0ZXIgPSBvcmlnaW47XG4gICAgZWxzZSBpZiAob3JpZ2luIGluc3RhbmNlb2YgT2JqZWN0ICYmIG9yaWdpbi5nZXQpXG4gICAgICAgIHRoaXMuX29yaWdpbkdldHRlciA9IG9yaWdpbi5nZXQuYmluZChvcmlnaW4pO1xuICAgIGVsc2Uge1xuICAgICAgICB0aGlzLl9vcmlnaW5HZXR0ZXIgPSBudWxsO1xuICAgICAgICB0aGlzLl9vdXRwdXQub3JpZ2luID0gb3JpZ2luO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbn07XG5Nb2RpZmllci5wcm90b3R5cGUuYWxpZ25Gcm9tID0gZnVuY3Rpb24gYWxpZ25Gcm9tKGFsaWduKSB7XG4gICAgaWYgKGFsaWduIGluc3RhbmNlb2YgRnVuY3Rpb24pXG4gICAgICAgIHRoaXMuX2FsaWduR2V0dGVyID0gYWxpZ247XG4gICAgZWxzZSBpZiAoYWxpZ24gaW5zdGFuY2VvZiBPYmplY3QgJiYgYWxpZ24uZ2V0KVxuICAgICAgICB0aGlzLl9hbGlnbkdldHRlciA9IGFsaWduLmdldC5iaW5kKGFsaWduKTtcbiAgICBlbHNlIHtcbiAgICAgICAgdGhpcy5fYWxpZ25HZXR0ZXIgPSBudWxsO1xuICAgICAgICB0aGlzLl9vdXRwdXQuYWxpZ24gPSBhbGlnbjtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuTW9kaWZpZXIucHJvdG90eXBlLnNpemVGcm9tID0gZnVuY3Rpb24gc2l6ZUZyb20oc2l6ZSkge1xuICAgIGlmIChzaXplIGluc3RhbmNlb2YgRnVuY3Rpb24pXG4gICAgICAgIHRoaXMuX3NpemVHZXR0ZXIgPSBzaXplO1xuICAgIGVsc2UgaWYgKHNpemUgaW5zdGFuY2VvZiBPYmplY3QgJiYgc2l6ZS5nZXQpXG4gICAgICAgIHRoaXMuX3NpemVHZXR0ZXIgPSBzaXplLmdldC5iaW5kKHNpemUpO1xuICAgIGVsc2Uge1xuICAgICAgICB0aGlzLl9zaXplR2V0dGVyID0gbnVsbDtcbiAgICAgICAgdGhpcy5fb3V0cHV0LnNpemUgPSBzaXplO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbn07XG5Nb2RpZmllci5wcm90b3R5cGUucHJvcG9ydGlvbnNGcm9tID0gZnVuY3Rpb24gcHJvcG9ydGlvbnNGcm9tKHByb3BvcnRpb25zKSB7XG4gICAgaWYgKHByb3BvcnRpb25zIGluc3RhbmNlb2YgRnVuY3Rpb24pXG4gICAgICAgIHRoaXMuX3Byb3BvcnRpb25HZXR0ZXIgPSBwcm9wb3J0aW9ucztcbiAgICBlbHNlIGlmIChwcm9wb3J0aW9ucyBpbnN0YW5jZW9mIE9iamVjdCAmJiBwcm9wb3J0aW9ucy5nZXQpXG4gICAgICAgIHRoaXMuX3Byb3BvcnRpb25HZXR0ZXIgPSBwcm9wb3J0aW9ucy5nZXQuYmluZChwcm9wb3J0aW9ucyk7XG4gICAgZWxzZSB7XG4gICAgICAgIHRoaXMuX3Byb3BvcnRpb25HZXR0ZXIgPSBudWxsO1xuICAgICAgICB0aGlzLl9vdXRwdXQucHJvcG9ydGlvbnMgPSBwcm9wb3J0aW9ucztcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuTW9kaWZpZXIucHJvdG90eXBlLnNldFRyYW5zZm9ybSA9IGZ1bmN0aW9uIHNldFRyYW5zZm9ybSh0cmFuc2Zvcm0sIHRyYW5zaXRpb24sIGNhbGxiYWNrKSB7XG4gICAgaWYgKHRyYW5zaXRpb24gfHwgdGhpcy5fbGVnYWN5U3RhdGVzLnRyYW5zZm9ybSkge1xuICAgICAgICBpZiAoIXRoaXMuX2xlZ2FjeVN0YXRlcy50cmFuc2Zvcm0pIHtcbiAgICAgICAgICAgIHRoaXMuX2xlZ2FjeVN0YXRlcy50cmFuc2Zvcm0gPSBuZXcgVHJhbnNpdGlvbmFibGVUcmFuc2Zvcm0odGhpcy5fb3V0cHV0LnRyYW5zZm9ybSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF0aGlzLl90cmFuc2Zvcm1HZXR0ZXIpXG4gICAgICAgICAgICB0aGlzLnRyYW5zZm9ybUZyb20odGhpcy5fbGVnYWN5U3RhdGVzLnRyYW5zZm9ybSk7XG4gICAgICAgIHRoaXMuX2xlZ2FjeVN0YXRlcy50cmFuc2Zvcm0uc2V0KHRyYW5zZm9ybSwgdHJhbnNpdGlvbiwgY2FsbGJhY2spO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9IGVsc2VcbiAgICAgICAgcmV0dXJuIHRoaXMudHJhbnNmb3JtRnJvbSh0cmFuc2Zvcm0pO1xufTtcbk1vZGlmaWVyLnByb3RvdHlwZS5zZXRPcGFjaXR5ID0gZnVuY3Rpb24gc2V0T3BhY2l0eShvcGFjaXR5LCB0cmFuc2l0aW9uLCBjYWxsYmFjaykge1xuICAgIGlmICh0cmFuc2l0aW9uIHx8IHRoaXMuX2xlZ2FjeVN0YXRlcy5vcGFjaXR5KSB7XG4gICAgICAgIGlmICghdGhpcy5fbGVnYWN5U3RhdGVzLm9wYWNpdHkpIHtcbiAgICAgICAgICAgIHRoaXMuX2xlZ2FjeVN0YXRlcy5vcGFjaXR5ID0gbmV3IFRyYW5zaXRpb25hYmxlKHRoaXMuX291dHB1dC5vcGFjaXR5KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXRoaXMuX29wYWNpdHlHZXR0ZXIpXG4gICAgICAgICAgICB0aGlzLm9wYWNpdHlGcm9tKHRoaXMuX2xlZ2FjeVN0YXRlcy5vcGFjaXR5KTtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2xlZ2FjeVN0YXRlcy5vcGFjaXR5LnNldChvcGFjaXR5LCB0cmFuc2l0aW9uLCBjYWxsYmFjayk7XG4gICAgfSBlbHNlXG4gICAgICAgIHJldHVybiB0aGlzLm9wYWNpdHlGcm9tKG9wYWNpdHkpO1xufTtcbk1vZGlmaWVyLnByb3RvdHlwZS5zZXRPcmlnaW4gPSBmdW5jdGlvbiBzZXRPcmlnaW4ob3JpZ2luLCB0cmFuc2l0aW9uLCBjYWxsYmFjaykge1xuICAgIGlmICh0cmFuc2l0aW9uIHx8IHRoaXMuX2xlZ2FjeVN0YXRlcy5vcmlnaW4pIHtcbiAgICAgICAgaWYgKCF0aGlzLl9sZWdhY3lTdGF0ZXMub3JpZ2luKSB7XG4gICAgICAgICAgICB0aGlzLl9sZWdhY3lTdGF0ZXMub3JpZ2luID0gbmV3IFRyYW5zaXRpb25hYmxlKHRoaXMuX291dHB1dC5vcmlnaW4gfHwgW1xuICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgMFxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF0aGlzLl9vcmlnaW5HZXR0ZXIpXG4gICAgICAgICAgICB0aGlzLm9yaWdpbkZyb20odGhpcy5fbGVnYWN5U3RhdGVzLm9yaWdpbik7XG4gICAgICAgIHRoaXMuX2xlZ2FjeVN0YXRlcy5vcmlnaW4uc2V0KG9yaWdpbiwgdHJhbnNpdGlvbiwgY2FsbGJhY2spO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9IGVsc2VcbiAgICAgICAgcmV0dXJuIHRoaXMub3JpZ2luRnJvbShvcmlnaW4pO1xufTtcbk1vZGlmaWVyLnByb3RvdHlwZS5zZXRBbGlnbiA9IGZ1bmN0aW9uIHNldEFsaWduKGFsaWduLCB0cmFuc2l0aW9uLCBjYWxsYmFjaykge1xuICAgIGlmICh0cmFuc2l0aW9uIHx8IHRoaXMuX2xlZ2FjeVN0YXRlcy5hbGlnbikge1xuICAgICAgICBpZiAoIXRoaXMuX2xlZ2FjeVN0YXRlcy5hbGlnbikge1xuICAgICAgICAgICAgdGhpcy5fbGVnYWN5U3RhdGVzLmFsaWduID0gbmV3IFRyYW5zaXRpb25hYmxlKHRoaXMuX291dHB1dC5hbGlnbiB8fCBbXG4gICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICAwXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXRoaXMuX2FsaWduR2V0dGVyKVxuICAgICAgICAgICAgdGhpcy5hbGlnbkZyb20odGhpcy5fbGVnYWN5U3RhdGVzLmFsaWduKTtcbiAgICAgICAgdGhpcy5fbGVnYWN5U3RhdGVzLmFsaWduLnNldChhbGlnbiwgdHJhbnNpdGlvbiwgY2FsbGJhY2spO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9IGVsc2VcbiAgICAgICAgcmV0dXJuIHRoaXMuYWxpZ25Gcm9tKGFsaWduKTtcbn07XG5Nb2RpZmllci5wcm90b3R5cGUuc2V0U2l6ZSA9IGZ1bmN0aW9uIHNldFNpemUoc2l6ZSwgdHJhbnNpdGlvbiwgY2FsbGJhY2spIHtcbiAgICBpZiAoc2l6ZSAmJiAodHJhbnNpdGlvbiB8fCB0aGlzLl9sZWdhY3lTdGF0ZXMuc2l6ZSkpIHtcbiAgICAgICAgaWYgKCF0aGlzLl9sZWdhY3lTdGF0ZXMuc2l6ZSkge1xuICAgICAgICAgICAgdGhpcy5fbGVnYWN5U3RhdGVzLnNpemUgPSBuZXcgVHJhbnNpdGlvbmFibGUodGhpcy5fb3V0cHV0LnNpemUgfHwgW1xuICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgMFxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF0aGlzLl9zaXplR2V0dGVyKVxuICAgICAgICAgICAgdGhpcy5zaXplRnJvbSh0aGlzLl9sZWdhY3lTdGF0ZXMuc2l6ZSk7XG4gICAgICAgIHRoaXMuX2xlZ2FjeVN0YXRlcy5zaXplLnNldChzaXplLCB0cmFuc2l0aW9uLCBjYWxsYmFjayk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0gZWxzZVxuICAgICAgICByZXR1cm4gdGhpcy5zaXplRnJvbShzaXplKTtcbn07XG5Nb2RpZmllci5wcm90b3R5cGUuc2V0UHJvcG9ydGlvbnMgPSBmdW5jdGlvbiBzZXRQcm9wb3J0aW9ucyhwcm9wb3J0aW9ucywgdHJhbnNpdGlvbiwgY2FsbGJhY2spIHtcbiAgICBpZiAocHJvcG9ydGlvbnMgJiYgKHRyYW5zaXRpb24gfHwgdGhpcy5fbGVnYWN5U3RhdGVzLnByb3BvcnRpb25zKSkge1xuICAgICAgICBpZiAoIXRoaXMuX2xlZ2FjeVN0YXRlcy5wcm9wb3J0aW9ucykge1xuICAgICAgICAgICAgdGhpcy5fbGVnYWN5U3RhdGVzLnByb3BvcnRpb25zID0gbmV3IFRyYW5zaXRpb25hYmxlKHRoaXMuX291dHB1dC5wcm9wb3J0aW9ucyB8fCBbXG4gICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICAwXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXRoaXMuX3Byb3BvcnRpb25HZXR0ZXIpXG4gICAgICAgICAgICB0aGlzLnByb3BvcnRpb25zRnJvbSh0aGlzLl9sZWdhY3lTdGF0ZXMucHJvcG9ydGlvbnMpO1xuICAgICAgICB0aGlzLl9sZWdhY3lTdGF0ZXMucHJvcG9ydGlvbnMuc2V0KHByb3BvcnRpb25zLCB0cmFuc2l0aW9uLCBjYWxsYmFjayk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0gZWxzZVxuICAgICAgICByZXR1cm4gdGhpcy5wcm9wb3J0aW9uc0Zyb20ocHJvcG9ydGlvbnMpO1xufTtcbk1vZGlmaWVyLnByb3RvdHlwZS5oYWx0ID0gZnVuY3Rpb24gaGFsdCgpIHtcbiAgICBpZiAodGhpcy5fbGVnYWN5U3RhdGVzLnRyYW5zZm9ybSlcbiAgICAgICAgdGhpcy5fbGVnYWN5U3RhdGVzLnRyYW5zZm9ybS5oYWx0KCk7XG4gICAgaWYgKHRoaXMuX2xlZ2FjeVN0YXRlcy5vcGFjaXR5KVxuICAgICAgICB0aGlzLl9sZWdhY3lTdGF0ZXMub3BhY2l0eS5oYWx0KCk7XG4gICAgaWYgKHRoaXMuX2xlZ2FjeVN0YXRlcy5vcmlnaW4pXG4gICAgICAgIHRoaXMuX2xlZ2FjeVN0YXRlcy5vcmlnaW4uaGFsdCgpO1xuICAgIGlmICh0aGlzLl9sZWdhY3lTdGF0ZXMuYWxpZ24pXG4gICAgICAgIHRoaXMuX2xlZ2FjeVN0YXRlcy5hbGlnbi5oYWx0KCk7XG4gICAgaWYgKHRoaXMuX2xlZ2FjeVN0YXRlcy5zaXplKVxuICAgICAgICB0aGlzLl9sZWdhY3lTdGF0ZXMuc2l6ZS5oYWx0KCk7XG4gICAgaWYgKHRoaXMuX2xlZ2FjeVN0YXRlcy5wcm9wb3J0aW9ucylcbiAgICAgICAgdGhpcy5fbGVnYWN5U3RhdGVzLnByb3BvcnRpb25zLmhhbHQoKTtcbiAgICB0aGlzLl90cmFuc2Zvcm1HZXR0ZXIgPSBudWxsO1xuICAgIHRoaXMuX29wYWNpdHlHZXR0ZXIgPSBudWxsO1xuICAgIHRoaXMuX29yaWdpbkdldHRlciA9IG51bGw7XG4gICAgdGhpcy5fYWxpZ25HZXR0ZXIgPSBudWxsO1xuICAgIHRoaXMuX3NpemVHZXR0ZXIgPSBudWxsO1xuICAgIHRoaXMuX3Byb3BvcnRpb25HZXR0ZXIgPSBudWxsO1xufTtcbk1vZGlmaWVyLnByb3RvdHlwZS5nZXRUcmFuc2Zvcm0gPSBmdW5jdGlvbiBnZXRUcmFuc2Zvcm0oKSB7XG4gICAgcmV0dXJuIHRoaXMuX3RyYW5zZm9ybUdldHRlcigpO1xufTtcbk1vZGlmaWVyLnByb3RvdHlwZS5nZXRGaW5hbFRyYW5zZm9ybSA9IGZ1bmN0aW9uIGdldEZpbmFsVHJhbnNmb3JtKCkge1xuICAgIHJldHVybiB0aGlzLl9sZWdhY3lTdGF0ZXMudHJhbnNmb3JtID8gdGhpcy5fbGVnYWN5U3RhdGVzLnRyYW5zZm9ybS5nZXRGaW5hbCgpIDogdGhpcy5fb3V0cHV0LnRyYW5zZm9ybTtcbn07XG5Nb2RpZmllci5wcm90b3R5cGUuZ2V0T3BhY2l0eSA9IGZ1bmN0aW9uIGdldE9wYWNpdHkoKSB7XG4gICAgcmV0dXJuIHRoaXMuX29wYWNpdHlHZXR0ZXIoKTtcbn07XG5Nb2RpZmllci5wcm90b3R5cGUuZ2V0T3JpZ2luID0gZnVuY3Rpb24gZ2V0T3JpZ2luKCkge1xuICAgIHJldHVybiB0aGlzLl9vcmlnaW5HZXR0ZXIoKTtcbn07XG5Nb2RpZmllci5wcm90b3R5cGUuZ2V0QWxpZ24gPSBmdW5jdGlvbiBnZXRBbGlnbigpIHtcbiAgICByZXR1cm4gdGhpcy5fYWxpZ25HZXR0ZXIoKTtcbn07XG5Nb2RpZmllci5wcm90b3R5cGUuZ2V0U2l6ZSA9IGZ1bmN0aW9uIGdldFNpemUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3NpemVHZXR0ZXIgPyB0aGlzLl9zaXplR2V0dGVyKCkgOiB0aGlzLl9vdXRwdXQuc2l6ZTtcbn07XG5Nb2RpZmllci5wcm90b3R5cGUuZ2V0UHJvcG9ydGlvbnMgPSBmdW5jdGlvbiBnZXRQcm9wb3J0aW9ucygpIHtcbiAgICByZXR1cm4gdGhpcy5fcHJvcG9ydGlvbkdldHRlciA/IHRoaXMuX3Byb3BvcnRpb25HZXR0ZXIoKSA6IHRoaXMuX291dHB1dC5wcm9wb3J0aW9ucztcbn07XG5mdW5jdGlvbiBfdXBkYXRlKCkge1xuICAgIGlmICh0aGlzLl90cmFuc2Zvcm1HZXR0ZXIpXG4gICAgICAgIHRoaXMuX291dHB1dC50cmFuc2Zvcm0gPSB0aGlzLl90cmFuc2Zvcm1HZXR0ZXIoKTtcbiAgICBpZiAodGhpcy5fb3BhY2l0eUdldHRlcilcbiAgICAgICAgdGhpcy5fb3V0cHV0Lm9wYWNpdHkgPSB0aGlzLl9vcGFjaXR5R2V0dGVyKCk7XG4gICAgaWYgKHRoaXMuX29yaWdpbkdldHRlcilcbiAgICAgICAgdGhpcy5fb3V0cHV0Lm9yaWdpbiA9IHRoaXMuX29yaWdpbkdldHRlcigpO1xuICAgIGlmICh0aGlzLl9hbGlnbkdldHRlcilcbiAgICAgICAgdGhpcy5fb3V0cHV0LmFsaWduID0gdGhpcy5fYWxpZ25HZXR0ZXIoKTtcbiAgICBpZiAodGhpcy5fc2l6ZUdldHRlcilcbiAgICAgICAgdGhpcy5fb3V0cHV0LnNpemUgPSB0aGlzLl9zaXplR2V0dGVyKCk7XG4gICAgaWYgKHRoaXMuX3Byb3BvcnRpb25HZXR0ZXIpXG4gICAgICAgIHRoaXMuX291dHB1dC5wcm9wb3J0aW9ucyA9IHRoaXMuX3Byb3BvcnRpb25HZXR0ZXIoKTtcbn1cbk1vZGlmaWVyLnByb3RvdHlwZS5tb2RpZnkgPSBmdW5jdGlvbiBtb2RpZnkodGFyZ2V0KSB7XG4gICAgX3VwZGF0ZS5jYWxsKHRoaXMpO1xuICAgIHRoaXMuX291dHB1dC50YXJnZXQgPSB0YXJnZXQ7XG4gICAgcmV0dXJuIHRoaXMuX291dHB1dDtcbn07XG5tb2R1bGUuZXhwb3J0cyA9IE1vZGlmaWVyOyIsInZhciBFdmVudEhhbmRsZXIgPSByZXF1aXJlKCcuL0V2ZW50SGFuZGxlcicpO1xuZnVuY3Rpb24gT3B0aW9uc01hbmFnZXIodmFsdWUpIHtcbiAgICB0aGlzLl92YWx1ZSA9IHZhbHVlO1xuICAgIHRoaXMuZXZlbnRPdXRwdXQgPSBudWxsO1xufVxuT3B0aW9uc01hbmFnZXIucGF0Y2ggPSBmdW5jdGlvbiBwYXRjaE9iamVjdChzb3VyY2UsIGRhdGEpIHtcbiAgICB2YXIgbWFuYWdlciA9IG5ldyBPcHRpb25zTWFuYWdlcihzb3VyY2UpO1xuICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKVxuICAgICAgICBtYW5hZ2VyLnBhdGNoKGFyZ3VtZW50c1tpXSk7XG4gICAgcmV0dXJuIHNvdXJjZTtcbn07XG5mdW5jdGlvbiBfY3JlYXRlRXZlbnRPdXRwdXQoKSB7XG4gICAgdGhpcy5ldmVudE91dHB1dCA9IG5ldyBFdmVudEhhbmRsZXIoKTtcbiAgICB0aGlzLmV2ZW50T3V0cHV0LmJpbmRUaGlzKHRoaXMpO1xuICAgIEV2ZW50SGFuZGxlci5zZXRPdXRwdXRIYW5kbGVyKHRoaXMsIHRoaXMuZXZlbnRPdXRwdXQpO1xufVxuT3B0aW9uc01hbmFnZXIucHJvdG90eXBlLnBhdGNoID0gZnVuY3Rpb24gcGF0Y2goKSB7XG4gICAgdmFyIG15U3RhdGUgPSB0aGlzLl92YWx1ZTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgZGF0YSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgZm9yICh2YXIgayBpbiBkYXRhKSB7XG4gICAgICAgICAgICBpZiAoayBpbiBteVN0YXRlICYmIChkYXRhW2tdICYmIGRhdGFba10uY29uc3RydWN0b3IgPT09IE9iamVjdCkgJiYgKG15U3RhdGVba10gJiYgbXlTdGF0ZVtrXS5jb25zdHJ1Y3RvciA9PT0gT2JqZWN0KSkge1xuICAgICAgICAgICAgICAgIGlmICghbXlTdGF0ZS5oYXNPd25Qcm9wZXJ0eShrKSlcbiAgICAgICAgICAgICAgICAgICAgbXlTdGF0ZVtrXSA9IE9iamVjdC5jcmVhdGUobXlTdGF0ZVtrXSk7XG4gICAgICAgICAgICAgICAgdGhpcy5rZXkoaykucGF0Y2goZGF0YVtrXSk7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZXZlbnRPdXRwdXQpXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZXZlbnRPdXRwdXQuZW1pdCgnY2hhbmdlJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGssXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogdGhpcy5rZXkoaykudmFsdWUoKVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZVxuICAgICAgICAgICAgICAgIHRoaXMuc2V0KGssIGRhdGFba10pO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xufTtcbk9wdGlvbnNNYW5hZ2VyLnByb3RvdHlwZS5zZXRPcHRpb25zID0gT3B0aW9uc01hbmFnZXIucHJvdG90eXBlLnBhdGNoO1xuT3B0aW9uc01hbmFnZXIucHJvdG90eXBlLmtleSA9IGZ1bmN0aW9uIGtleShpZGVudGlmaWVyKSB7XG4gICAgdmFyIHJlc3VsdCA9IG5ldyBPcHRpb25zTWFuYWdlcih0aGlzLl92YWx1ZVtpZGVudGlmaWVyXSk7XG4gICAgaWYgKCEocmVzdWx0Ll92YWx1ZSBpbnN0YW5jZW9mIE9iamVjdCkgfHwgcmVzdWx0Ll92YWx1ZSBpbnN0YW5jZW9mIEFycmF5KVxuICAgICAgICByZXN1bHQuX3ZhbHVlID0ge307XG4gICAgcmV0dXJuIHJlc3VsdDtcbn07XG5PcHRpb25zTWFuYWdlci5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24gZ2V0KGtleSkge1xuICAgIHJldHVybiBrZXkgPyB0aGlzLl92YWx1ZVtrZXldIDogdGhpcy5fdmFsdWU7XG59O1xuT3B0aW9uc01hbmFnZXIucHJvdG90eXBlLmdldE9wdGlvbnMgPSBPcHRpb25zTWFuYWdlci5wcm90b3R5cGUuZ2V0O1xuT3B0aW9uc01hbmFnZXIucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uIHNldChrZXksIHZhbHVlKSB7XG4gICAgdmFyIG9yaWdpbmFsVmFsdWUgPSB0aGlzLmdldChrZXkpO1xuICAgIHRoaXMuX3ZhbHVlW2tleV0gPSB2YWx1ZTtcbiAgICBpZiAodGhpcy5ldmVudE91dHB1dCAmJiB2YWx1ZSAhPT0gb3JpZ2luYWxWYWx1ZSlcbiAgICAgICAgdGhpcy5ldmVudE91dHB1dC5lbWl0KCdjaGFuZ2UnLCB7XG4gICAgICAgICAgICBpZDoga2V5LFxuICAgICAgICAgICAgdmFsdWU6IHZhbHVlXG4gICAgICAgIH0pO1xuICAgIHJldHVybiB0aGlzO1xufTtcbk9wdGlvbnNNYW5hZ2VyLnByb3RvdHlwZS5vbiA9IGZ1bmN0aW9uIG9uKCkge1xuICAgIF9jcmVhdGVFdmVudE91dHB1dC5jYWxsKHRoaXMpO1xuICAgIHJldHVybiB0aGlzLm9uLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG59O1xuT3B0aW9uc01hbmFnZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyID0gZnVuY3Rpb24gcmVtb3ZlTGlzdGVuZXIoKSB7XG4gICAgX2NyZWF0ZUV2ZW50T3V0cHV0LmNhbGwodGhpcyk7XG4gICAgcmV0dXJuIHRoaXMucmVtb3ZlTGlzdGVuZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn07XG5PcHRpb25zTWFuYWdlci5wcm90b3R5cGUucGlwZSA9IGZ1bmN0aW9uIHBpcGUoKSB7XG4gICAgX2NyZWF0ZUV2ZW50T3V0cHV0LmNhbGwodGhpcyk7XG4gICAgcmV0dXJuIHRoaXMucGlwZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xufTtcbk9wdGlvbnNNYW5hZ2VyLnByb3RvdHlwZS51bnBpcGUgPSBmdW5jdGlvbiB1bnBpcGUoKSB7XG4gICAgX2NyZWF0ZUV2ZW50T3V0cHV0LmNhbGwodGhpcyk7XG4gICAgcmV0dXJuIHRoaXMudW5waXBlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG59O1xubW9kdWxlLmV4cG9ydHMgPSBPcHRpb25zTWFuYWdlcjsiLCJ2YXIgRW50aXR5ID0gcmVxdWlyZSgnLi9FbnRpdHknKTtcbnZhciBTcGVjUGFyc2VyID0gcmVxdWlyZSgnLi9TcGVjUGFyc2VyJyk7XG5mdW5jdGlvbiBSZW5kZXJOb2RlKG9iamVjdCkge1xuICAgIHRoaXMuX29iamVjdCA9IG51bGw7XG4gICAgdGhpcy5fY2hpbGQgPSBudWxsO1xuICAgIHRoaXMuX2hhc011bHRpcGxlQ2hpbGRyZW4gPSBmYWxzZTtcbiAgICB0aGlzLl9pc1JlbmRlcmFibGUgPSBmYWxzZTtcbiAgICB0aGlzLl9pc01vZGlmaWVyID0gZmFsc2U7XG4gICAgdGhpcy5fcmVzdWx0Q2FjaGUgPSB7fTtcbiAgICB0aGlzLl9wcmV2UmVzdWx0cyA9IHt9O1xuICAgIHRoaXMuX2NoaWxkUmVzdWx0ID0gbnVsbDtcbiAgICBpZiAob2JqZWN0KVxuICAgICAgICB0aGlzLnNldChvYmplY3QpO1xufVxuUmVuZGVyTm9kZS5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24gYWRkKGNoaWxkKSB7XG4gICAgdmFyIGNoaWxkTm9kZSA9IGNoaWxkIGluc3RhbmNlb2YgUmVuZGVyTm9kZSA/IGNoaWxkIDogbmV3IFJlbmRlck5vZGUoY2hpbGQpO1xuICAgIGlmICh0aGlzLl9jaGlsZCBpbnN0YW5jZW9mIEFycmF5KVxuICAgICAgICB0aGlzLl9jaGlsZC5wdXNoKGNoaWxkTm9kZSk7XG4gICAgZWxzZSBpZiAodGhpcy5fY2hpbGQpIHtcbiAgICAgICAgdGhpcy5fY2hpbGQgPSBbXG4gICAgICAgICAgICB0aGlzLl9jaGlsZCxcbiAgICAgICAgICAgIGNoaWxkTm9kZVxuICAgICAgICBdO1xuICAgICAgICB0aGlzLl9oYXNNdWx0aXBsZUNoaWxkcmVuID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5fY2hpbGRSZXN1bHQgPSBbXTtcbiAgICB9IGVsc2VcbiAgICAgICAgdGhpcy5fY2hpbGQgPSBjaGlsZE5vZGU7XG4gICAgcmV0dXJuIGNoaWxkTm9kZTtcbn07XG5SZW5kZXJOb2RlLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbiBnZXQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX29iamVjdCB8fCAodGhpcy5faGFzTXVsdGlwbGVDaGlsZHJlbiA/IG51bGwgOiB0aGlzLl9jaGlsZCA/IHRoaXMuX2NoaWxkLmdldCgpIDogbnVsbCk7XG59O1xuUmVuZGVyTm9kZS5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24gc2V0KGNoaWxkKSB7XG4gICAgdGhpcy5fY2hpbGRSZXN1bHQgPSBudWxsO1xuICAgIHRoaXMuX2hhc011bHRpcGxlQ2hpbGRyZW4gPSBmYWxzZTtcbiAgICB0aGlzLl9pc1JlbmRlcmFibGUgPSBjaGlsZC5yZW5kZXIgPyB0cnVlIDogZmFsc2U7XG4gICAgdGhpcy5faXNNb2RpZmllciA9IGNoaWxkLm1vZGlmeSA/IHRydWUgOiBmYWxzZTtcbiAgICB0aGlzLl9vYmplY3QgPSBjaGlsZDtcbiAgICB0aGlzLl9jaGlsZCA9IG51bGw7XG4gICAgaWYgKGNoaWxkIGluc3RhbmNlb2YgUmVuZGVyTm9kZSlcbiAgICAgICAgcmV0dXJuIGNoaWxkO1xuICAgIGVsc2VcbiAgICAgICAgcmV0dXJuIHRoaXM7XG59O1xuUmVuZGVyTm9kZS5wcm90b3R5cGUuZ2V0U2l6ZSA9IGZ1bmN0aW9uIGdldFNpemUoKSB7XG4gICAgdmFyIHJlc3VsdCA9IG51bGw7XG4gICAgdmFyIHRhcmdldCA9IHRoaXMuZ2V0KCk7XG4gICAgaWYgKHRhcmdldCAmJiB0YXJnZXQuZ2V0U2l6ZSlcbiAgICAgICAgcmVzdWx0ID0gdGFyZ2V0LmdldFNpemUoKTtcbiAgICBpZiAoIXJlc3VsdCAmJiB0aGlzLl9jaGlsZCAmJiB0aGlzLl9jaGlsZC5nZXRTaXplKVxuICAgICAgICByZXN1bHQgPSB0aGlzLl9jaGlsZC5nZXRTaXplKCk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn07XG5mdW5jdGlvbiBfYXBwbHlDb21taXQoc3BlYywgY29udGV4dCwgY2FjaGVTdG9yYWdlKSB7XG4gICAgdmFyIHJlc3VsdCA9IFNwZWNQYXJzZXIucGFyc2Uoc3BlYywgY29udGV4dCk7XG4gICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhyZXN1bHQpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgaWQgPSBrZXlzW2ldO1xuICAgICAgICB2YXIgY2hpbGROb2RlID0gRW50aXR5LmdldChpZCk7XG4gICAgICAgIHZhciBjb21taXRQYXJhbXMgPSByZXN1bHRbaWRdO1xuICAgICAgICBjb21taXRQYXJhbXMuYWxsb2NhdG9yID0gY29udGV4dC5hbGxvY2F0b3I7XG4gICAgICAgIHZhciBjb21taXRSZXN1bHQgPSBjaGlsZE5vZGUuY29tbWl0KGNvbW1pdFBhcmFtcyk7XG4gICAgICAgIGlmIChjb21taXRSZXN1bHQpXG4gICAgICAgICAgICBfYXBwbHlDb21taXQoY29tbWl0UmVzdWx0LCBjb250ZXh0LCBjYWNoZVN0b3JhZ2UpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBjYWNoZVN0b3JhZ2VbaWRdID0gY29tbWl0UGFyYW1zO1xuICAgIH1cbn1cblJlbmRlck5vZGUucHJvdG90eXBlLmNvbW1pdCA9IGZ1bmN0aW9uIGNvbW1pdChjb250ZXh0KSB7XG4gICAgdmFyIHByZXZLZXlzID0gT2JqZWN0LmtleXModGhpcy5fcHJldlJlc3VsdHMpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcHJldktleXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGlkID0gcHJldktleXNbaV07XG4gICAgICAgIGlmICh0aGlzLl9yZXN1bHRDYWNoZVtpZF0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdmFyIG9iamVjdCA9IEVudGl0eS5nZXQoaWQpO1xuICAgICAgICAgICAgaWYgKG9iamVjdC5jbGVhbnVwKVxuICAgICAgICAgICAgICAgIG9iamVjdC5jbGVhbnVwKGNvbnRleHQuYWxsb2NhdG9yKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICB0aGlzLl9wcmV2UmVzdWx0cyA9IHRoaXMuX3Jlc3VsdENhY2hlO1xuICAgIHRoaXMuX3Jlc3VsdENhY2hlID0ge307XG4gICAgX2FwcGx5Q29tbWl0KHRoaXMucmVuZGVyKCksIGNvbnRleHQsIHRoaXMuX3Jlc3VsdENhY2hlKTtcbn07XG5SZW5kZXJOb2RlLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgaWYgKHRoaXMuX2lzUmVuZGVyYWJsZSlcbiAgICAgICAgcmV0dXJuIHRoaXMuX29iamVjdC5yZW5kZXIoKTtcbiAgICB2YXIgcmVzdWx0ID0gbnVsbDtcbiAgICBpZiAodGhpcy5faGFzTXVsdGlwbGVDaGlsZHJlbikge1xuICAgICAgICByZXN1bHQgPSB0aGlzLl9jaGlsZFJlc3VsdDtcbiAgICAgICAgdmFyIGNoaWxkcmVuID0gdGhpcy5fY2hpbGQ7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHJlc3VsdFtpXSA9IGNoaWxkcmVuW2ldLnJlbmRlcigpO1xuICAgICAgICB9XG4gICAgfSBlbHNlIGlmICh0aGlzLl9jaGlsZClcbiAgICAgICAgcmVzdWx0ID0gdGhpcy5fY2hpbGQucmVuZGVyKCk7XG4gICAgcmV0dXJuIHRoaXMuX2lzTW9kaWZpZXIgPyB0aGlzLl9vYmplY3QubW9kaWZ5KHJlc3VsdCkgOiByZXN1bHQ7XG59O1xubW9kdWxlLmV4cG9ydHMgPSBSZW5kZXJOb2RlOyIsInZhciBUcmFuc2Zvcm0gPSByZXF1aXJlKCcuL1RyYW5zZm9ybScpO1xuZnVuY3Rpb24gU3BlY1BhcnNlcigpIHtcbiAgICB0aGlzLnJlc3VsdCA9IHt9O1xufVxuU3BlY1BhcnNlci5faW5zdGFuY2UgPSBuZXcgU3BlY1BhcnNlcigpO1xuU3BlY1BhcnNlci5wYXJzZSA9IGZ1bmN0aW9uIHBhcnNlKHNwZWMsIGNvbnRleHQpIHtcbiAgICByZXR1cm4gU3BlY1BhcnNlci5faW5zdGFuY2UucGFyc2Uoc3BlYywgY29udGV4dCk7XG59O1xuU3BlY1BhcnNlci5wcm90b3R5cGUucGFyc2UgPSBmdW5jdGlvbiBwYXJzZShzcGVjLCBjb250ZXh0KSB7XG4gICAgdGhpcy5yZXNldCgpO1xuICAgIHRoaXMuX3BhcnNlU3BlYyhzcGVjLCBjb250ZXh0LCBUcmFuc2Zvcm0uaWRlbnRpdHkpO1xuICAgIHJldHVybiB0aGlzLnJlc3VsdDtcbn07XG5TcGVjUGFyc2VyLnByb3RvdHlwZS5yZXNldCA9IGZ1bmN0aW9uIHJlc2V0KCkge1xuICAgIHRoaXMucmVzdWx0ID0ge307XG59O1xuZnVuY3Rpb24gX3ZlY0luQ29udGV4dCh2LCBtKSB7XG4gICAgcmV0dXJuIFtcbiAgICAgICAgdlswXSAqIG1bMF0gKyB2WzFdICogbVs0XSArIHZbMl0gKiBtWzhdLFxuICAgICAgICB2WzBdICogbVsxXSArIHZbMV0gKiBtWzVdICsgdlsyXSAqIG1bOV0sXG4gICAgICAgIHZbMF0gKiBtWzJdICsgdlsxXSAqIG1bNl0gKyB2WzJdICogbVsxMF1cbiAgICBdO1xufVxudmFyIF96ZXJvWmVybyA9IFtcbiAgICAgICAgMCxcbiAgICAgICAgMFxuICAgIF07XG5TcGVjUGFyc2VyLnByb3RvdHlwZS5fcGFyc2VTcGVjID0gZnVuY3Rpb24gX3BhcnNlU3BlYyhzcGVjLCBwYXJlbnRDb250ZXh0LCBzaXplQ29udGV4dCkge1xuICAgIHZhciBpZDtcbiAgICB2YXIgdGFyZ2V0O1xuICAgIHZhciB0cmFuc2Zvcm07XG4gICAgdmFyIG9wYWNpdHk7XG4gICAgdmFyIG9yaWdpbjtcbiAgICB2YXIgYWxpZ247XG4gICAgdmFyIHNpemU7XG4gICAgaWYgKHR5cGVvZiBzcGVjID09PSAnbnVtYmVyJykge1xuICAgICAgICBpZCA9IHNwZWM7XG4gICAgICAgIHRyYW5zZm9ybSA9IHBhcmVudENvbnRleHQudHJhbnNmb3JtO1xuICAgICAgICBhbGlnbiA9IHBhcmVudENvbnRleHQuYWxpZ24gfHwgX3plcm9aZXJvO1xuICAgICAgICBpZiAocGFyZW50Q29udGV4dC5zaXplICYmIGFsaWduICYmIChhbGlnblswXSB8fCBhbGlnblsxXSkpIHtcbiAgICAgICAgICAgIHZhciBhbGlnbkFkanVzdCA9IFtcbiAgICAgICAgICAgICAgICAgICAgYWxpZ25bMF0gKiBwYXJlbnRDb250ZXh0LnNpemVbMF0sXG4gICAgICAgICAgICAgICAgICAgIGFsaWduWzFdICogcGFyZW50Q29udGV4dC5zaXplWzFdLFxuICAgICAgICAgICAgICAgICAgICAwXG4gICAgICAgICAgICAgICAgXTtcbiAgICAgICAgICAgIHRyYW5zZm9ybSA9IFRyYW5zZm9ybS50aGVuTW92ZSh0cmFuc2Zvcm0sIF92ZWNJbkNvbnRleHQoYWxpZ25BZGp1c3QsIHNpemVDb250ZXh0KSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5yZXN1bHRbaWRdID0ge1xuICAgICAgICAgICAgdHJhbnNmb3JtOiB0cmFuc2Zvcm0sXG4gICAgICAgICAgICBvcGFjaXR5OiBwYXJlbnRDb250ZXh0Lm9wYWNpdHksXG4gICAgICAgICAgICBvcmlnaW46IHBhcmVudENvbnRleHQub3JpZ2luIHx8IF96ZXJvWmVybyxcbiAgICAgICAgICAgIGFsaWduOiBwYXJlbnRDb250ZXh0LmFsaWduIHx8IF96ZXJvWmVybyxcbiAgICAgICAgICAgIHNpemU6IHBhcmVudENvbnRleHQuc2l6ZVxuICAgICAgICB9O1xuICAgIH0gZWxzZSBpZiAoIXNwZWMpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH0gZWxzZSBpZiAoc3BlYyBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc3BlYy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdGhpcy5fcGFyc2VTcGVjKHNwZWNbaV0sIHBhcmVudENvbnRleHQsIHNpemVDb250ZXh0KTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIHRhcmdldCA9IHNwZWMudGFyZ2V0O1xuICAgICAgICB0cmFuc2Zvcm0gPSBwYXJlbnRDb250ZXh0LnRyYW5zZm9ybTtcbiAgICAgICAgb3BhY2l0eSA9IHBhcmVudENvbnRleHQub3BhY2l0eTtcbiAgICAgICAgb3JpZ2luID0gcGFyZW50Q29udGV4dC5vcmlnaW47XG4gICAgICAgIGFsaWduID0gcGFyZW50Q29udGV4dC5hbGlnbjtcbiAgICAgICAgc2l6ZSA9IHBhcmVudENvbnRleHQuc2l6ZTtcbiAgICAgICAgdmFyIG5leHRTaXplQ29udGV4dCA9IHNpemVDb250ZXh0O1xuICAgICAgICBpZiAoc3BlYy5vcGFjaXR5ICE9PSB1bmRlZmluZWQpXG4gICAgICAgICAgICBvcGFjaXR5ID0gcGFyZW50Q29udGV4dC5vcGFjaXR5ICogc3BlYy5vcGFjaXR5O1xuICAgICAgICBpZiAoc3BlYy50cmFuc2Zvcm0pXG4gICAgICAgICAgICB0cmFuc2Zvcm0gPSBUcmFuc2Zvcm0ubXVsdGlwbHkocGFyZW50Q29udGV4dC50cmFuc2Zvcm0sIHNwZWMudHJhbnNmb3JtKTtcbiAgICAgICAgaWYgKHNwZWMub3JpZ2luKSB7XG4gICAgICAgICAgICBvcmlnaW4gPSBzcGVjLm9yaWdpbjtcbiAgICAgICAgICAgIG5leHRTaXplQ29udGV4dCA9IHBhcmVudENvbnRleHQudHJhbnNmb3JtO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzcGVjLmFsaWduKVxuICAgICAgICAgICAgYWxpZ24gPSBzcGVjLmFsaWduO1xuICAgICAgICBpZiAoc3BlYy5zaXplIHx8IHNwZWMucHJvcG9ydGlvbnMpIHtcbiAgICAgICAgICAgIHZhciBwYXJlbnRTaXplID0gc2l6ZTtcbiAgICAgICAgICAgIHNpemUgPSBbXG4gICAgICAgICAgICAgICAgc2l6ZVswXSxcbiAgICAgICAgICAgICAgICBzaXplWzFdXG4gICAgICAgICAgICBdO1xuICAgICAgICAgICAgaWYgKHNwZWMuc2l6ZSkge1xuICAgICAgICAgICAgICAgIGlmIChzcGVjLnNpemVbMF0gIT09IHVuZGVmaW5lZClcbiAgICAgICAgICAgICAgICAgICAgc2l6ZVswXSA9IHNwZWMuc2l6ZVswXTtcbiAgICAgICAgICAgICAgICBpZiAoc3BlYy5zaXplWzFdICE9PSB1bmRlZmluZWQpXG4gICAgICAgICAgICAgICAgICAgIHNpemVbMV0gPSBzcGVjLnNpemVbMV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoc3BlYy5wcm9wb3J0aW9ucykge1xuICAgICAgICAgICAgICAgIGlmIChzcGVjLnByb3BvcnRpb25zWzBdICE9PSB1bmRlZmluZWQpXG4gICAgICAgICAgICAgICAgICAgIHNpemVbMF0gPSBzaXplWzBdICogc3BlYy5wcm9wb3J0aW9uc1swXTtcbiAgICAgICAgICAgICAgICBpZiAoc3BlYy5wcm9wb3J0aW9uc1sxXSAhPT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgICAgICAgICBzaXplWzFdID0gc2l6ZVsxXSAqIHNwZWMucHJvcG9ydGlvbnNbMV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocGFyZW50U2l6ZSkge1xuICAgICAgICAgICAgICAgIGlmIChhbGlnbiAmJiAoYWxpZ25bMF0gfHwgYWxpZ25bMV0pKVxuICAgICAgICAgICAgICAgICAgICB0cmFuc2Zvcm0gPSBUcmFuc2Zvcm0udGhlbk1vdmUodHJhbnNmb3JtLCBfdmVjSW5Db250ZXh0KFtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFsaWduWzBdICogcGFyZW50U2l6ZVswXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFsaWduWzFdICogcGFyZW50U2l6ZVsxXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIDBcbiAgICAgICAgICAgICAgICAgICAgXSwgc2l6ZUNvbnRleHQpKTtcbiAgICAgICAgICAgICAgICBpZiAob3JpZ2luICYmIChvcmlnaW5bMF0gfHwgb3JpZ2luWzFdKSlcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNmb3JtID0gVHJhbnNmb3JtLm1vdmVUaGVuKFtcbiAgICAgICAgICAgICAgICAgICAgICAgIC1vcmlnaW5bMF0gKiBzaXplWzBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgLW9yaWdpblsxXSAqIHNpemVbMV0sXG4gICAgICAgICAgICAgICAgICAgICAgICAwXG4gICAgICAgICAgICAgICAgICAgIF0sIHRyYW5zZm9ybSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBuZXh0U2l6ZUNvbnRleHQgPSBwYXJlbnRDb250ZXh0LnRyYW5zZm9ybTtcbiAgICAgICAgICAgIG9yaWdpbiA9IG51bGw7XG4gICAgICAgICAgICBhbGlnbiA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fcGFyc2VTcGVjKHRhcmdldCwge1xuICAgICAgICAgICAgdHJhbnNmb3JtOiB0cmFuc2Zvcm0sXG4gICAgICAgICAgICBvcGFjaXR5OiBvcGFjaXR5LFxuICAgICAgICAgICAgb3JpZ2luOiBvcmlnaW4sXG4gICAgICAgICAgICBhbGlnbjogYWxpZ24sXG4gICAgICAgICAgICBzaXplOiBzaXplXG4gICAgICAgIH0sIG5leHRTaXplQ29udGV4dCk7XG4gICAgfVxufTtcbm1vZHVsZS5leHBvcnRzID0gU3BlY1BhcnNlcjsiLCJ2YXIgRWxlbWVudE91dHB1dCA9IHJlcXVpcmUoJy4vRWxlbWVudE91dHB1dCcpO1xuZnVuY3Rpb24gU3VyZmFjZShvcHRpb25zKSB7XG4gICAgRWxlbWVudE91dHB1dC5jYWxsKHRoaXMpO1xuICAgIHRoaXMub3B0aW9ucyA9IHt9O1xuICAgIHRoaXMucHJvcGVydGllcyA9IHt9O1xuICAgIHRoaXMuYXR0cmlidXRlcyA9IHt9O1xuICAgIHRoaXMuY29udGVudCA9ICcnO1xuICAgIHRoaXMuY2xhc3NMaXN0ID0gW107XG4gICAgdGhpcy5zaXplID0gbnVsbDtcbiAgICB0aGlzLl9jbGFzc2VzRGlydHkgPSB0cnVlO1xuICAgIHRoaXMuX3N0eWxlc0RpcnR5ID0gdHJ1ZTtcbiAgICB0aGlzLl9hdHRyaWJ1dGVzRGlydHkgPSB0cnVlO1xuICAgIHRoaXMuX3NpemVEaXJ0eSA9IHRydWU7XG4gICAgdGhpcy5fY29udGVudERpcnR5ID0gdHJ1ZTtcbiAgICB0aGlzLl90cnVlU2l6ZUNoZWNrID0gdHJ1ZTtcbiAgICB0aGlzLl9kaXJ0eUNsYXNzZXMgPSBbXTtcbiAgICBpZiAob3B0aW9ucylcbiAgICAgICAgdGhpcy5zZXRPcHRpb25zKG9wdGlvbnMpO1xuICAgIHRoaXMuX2N1cnJlbnRUYXJnZXQgPSBudWxsO1xufVxuU3VyZmFjZS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEVsZW1lbnRPdXRwdXQucHJvdG90eXBlKTtcblN1cmZhY2UucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gU3VyZmFjZTtcblN1cmZhY2UucHJvdG90eXBlLmVsZW1lbnRUeXBlID0gJ2Rpdic7XG5TdXJmYWNlLnByb3RvdHlwZS5lbGVtZW50Q2xhc3MgPSAnZmFtb3VzLXN1cmZhY2UnO1xuU3VyZmFjZS5wcm90b3R5cGUuc2V0QXR0cmlidXRlcyA9IGZ1bmN0aW9uIHNldEF0dHJpYnV0ZXMoYXR0cmlidXRlcykge1xuICAgIGZvciAodmFyIG4gaW4gYXR0cmlidXRlcykge1xuICAgICAgICBpZiAobiA9PT0gJ3N0eWxlJylcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQ2Fubm90IHNldCBzdHlsZXMgdmlhIFwic2V0QXR0cmlidXRlc1wiIGFzIGl0IHdpbGwgYnJlYWsgRmFtby51cy4gIFVzZSBcInNldFByb3BlcnRpZXNcIiBpbnN0ZWFkLicpO1xuICAgICAgICB0aGlzLmF0dHJpYnV0ZXNbbl0gPSBhdHRyaWJ1dGVzW25dO1xuICAgIH1cbiAgICB0aGlzLl9hdHRyaWJ1dGVzRGlydHkgPSB0cnVlO1xufTtcblN1cmZhY2UucHJvdG90eXBlLmdldEF0dHJpYnV0ZXMgPSBmdW5jdGlvbiBnZXRBdHRyaWJ1dGVzKCkge1xuICAgIHJldHVybiB0aGlzLmF0dHJpYnV0ZXM7XG59O1xuU3VyZmFjZS5wcm90b3R5cGUuc2V0UHJvcGVydGllcyA9IGZ1bmN0aW9uIHNldFByb3BlcnRpZXMocHJvcGVydGllcykge1xuICAgIGZvciAodmFyIG4gaW4gcHJvcGVydGllcykge1xuICAgICAgICB0aGlzLnByb3BlcnRpZXNbbl0gPSBwcm9wZXJ0aWVzW25dO1xuICAgIH1cbiAgICB0aGlzLl9zdHlsZXNEaXJ0eSA9IHRydWU7XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuU3VyZmFjZS5wcm90b3R5cGUuZ2V0UHJvcGVydGllcyA9IGZ1bmN0aW9uIGdldFByb3BlcnRpZXMoKSB7XG4gICAgcmV0dXJuIHRoaXMucHJvcGVydGllcztcbn07XG5TdXJmYWNlLnByb3RvdHlwZS5hZGRDbGFzcyA9IGZ1bmN0aW9uIGFkZENsYXNzKGNsYXNzTmFtZSkge1xuICAgIGlmICh0aGlzLmNsYXNzTGlzdC5pbmRleE9mKGNsYXNzTmFtZSkgPCAwKSB7XG4gICAgICAgIHRoaXMuY2xhc3NMaXN0LnB1c2goY2xhc3NOYW1lKTtcbiAgICAgICAgdGhpcy5fY2xhc3Nlc0RpcnR5ID0gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuU3VyZmFjZS5wcm90b3R5cGUucmVtb3ZlQ2xhc3MgPSBmdW5jdGlvbiByZW1vdmVDbGFzcyhjbGFzc05hbWUpIHtcbiAgICB2YXIgaSA9IHRoaXMuY2xhc3NMaXN0LmluZGV4T2YoY2xhc3NOYW1lKTtcbiAgICBpZiAoaSA+PSAwKSB7XG4gICAgICAgIHRoaXMuX2RpcnR5Q2xhc3Nlcy5wdXNoKHRoaXMuY2xhc3NMaXN0LnNwbGljZShpLCAxKVswXSk7XG4gICAgICAgIHRoaXMuX2NsYXNzZXNEaXJ0eSA9IHRydWU7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xufTtcblN1cmZhY2UucHJvdG90eXBlLnRvZ2dsZUNsYXNzID0gZnVuY3Rpb24gdG9nZ2xlQ2xhc3MoY2xhc3NOYW1lKSB7XG4gICAgdmFyIGkgPSB0aGlzLmNsYXNzTGlzdC5pbmRleE9mKGNsYXNzTmFtZSk7XG4gICAgaWYgKGkgPj0gMCkge1xuICAgICAgICB0aGlzLnJlbW92ZUNsYXNzKGNsYXNzTmFtZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5hZGRDbGFzcyhjbGFzc05hbWUpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbn07XG5TdXJmYWNlLnByb3RvdHlwZS5zZXRDbGFzc2VzID0gZnVuY3Rpb24gc2V0Q2xhc3NlcyhjbGFzc0xpc3QpIHtcbiAgICB2YXIgaSA9IDA7XG4gICAgdmFyIHJlbW92YWwgPSBbXTtcbiAgICBmb3IgKGkgPSAwOyBpIDwgdGhpcy5jbGFzc0xpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKGNsYXNzTGlzdC5pbmRleE9mKHRoaXMuY2xhc3NMaXN0W2ldKSA8IDApXG4gICAgICAgICAgICByZW1vdmFsLnB1c2godGhpcy5jbGFzc0xpc3RbaV0pO1xuICAgIH1cbiAgICBmb3IgKGkgPSAwOyBpIDwgcmVtb3ZhbC5sZW5ndGg7IGkrKylcbiAgICAgICAgdGhpcy5yZW1vdmVDbGFzcyhyZW1vdmFsW2ldKTtcbiAgICBmb3IgKGkgPSAwOyBpIDwgY2xhc3NMaXN0Lmxlbmd0aDsgaSsrKVxuICAgICAgICB0aGlzLmFkZENsYXNzKGNsYXNzTGlzdFtpXSk7XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuU3VyZmFjZS5wcm90b3R5cGUuZ2V0Q2xhc3NMaXN0ID0gZnVuY3Rpb24gZ2V0Q2xhc3NMaXN0KCkge1xuICAgIHJldHVybiB0aGlzLmNsYXNzTGlzdDtcbn07XG5TdXJmYWNlLnByb3RvdHlwZS5zZXRDb250ZW50ID0gZnVuY3Rpb24gc2V0Q29udGVudChjb250ZW50KSB7XG4gICAgaWYgKHRoaXMuY29udGVudCAhPT0gY29udGVudCkge1xuICAgICAgICB0aGlzLmNvbnRlbnQgPSBjb250ZW50O1xuICAgICAgICB0aGlzLl9jb250ZW50RGlydHkgPSB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbn07XG5TdXJmYWNlLnByb3RvdHlwZS5nZXRDb250ZW50ID0gZnVuY3Rpb24gZ2V0Q29udGVudCgpIHtcbiAgICByZXR1cm4gdGhpcy5jb250ZW50O1xufTtcblN1cmZhY2UucHJvdG90eXBlLnNldE9wdGlvbnMgPSBmdW5jdGlvbiBzZXRPcHRpb25zKG9wdGlvbnMpIHtcbiAgICBpZiAob3B0aW9ucy5zaXplKVxuICAgICAgICB0aGlzLnNldFNpemUob3B0aW9ucy5zaXplKTtcbiAgICBpZiAob3B0aW9ucy5jbGFzc2VzKVxuICAgICAgICB0aGlzLnNldENsYXNzZXMob3B0aW9ucy5jbGFzc2VzKTtcbiAgICBpZiAob3B0aW9ucy5wcm9wZXJ0aWVzKVxuICAgICAgICB0aGlzLnNldFByb3BlcnRpZXMob3B0aW9ucy5wcm9wZXJ0aWVzKTtcbiAgICBpZiAob3B0aW9ucy5hdHRyaWJ1dGVzKVxuICAgICAgICB0aGlzLnNldEF0dHJpYnV0ZXMob3B0aW9ucy5hdHRyaWJ1dGVzKTtcbiAgICBpZiAob3B0aW9ucy5jb250ZW50KVxuICAgICAgICB0aGlzLnNldENvbnRlbnQob3B0aW9ucy5jb250ZW50KTtcbiAgICByZXR1cm4gdGhpcztcbn07XG5mdW5jdGlvbiBfY2xlYW51cENsYXNzZXModGFyZ2V0KSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLl9kaXJ0eUNsYXNzZXMubGVuZ3RoOyBpKyspXG4gICAgICAgIHRhcmdldC5jbGFzc0xpc3QucmVtb3ZlKHRoaXMuX2RpcnR5Q2xhc3Nlc1tpXSk7XG4gICAgdGhpcy5fZGlydHlDbGFzc2VzID0gW107XG59XG5mdW5jdGlvbiBfYXBwbHlTdHlsZXModGFyZ2V0KSB7XG4gICAgZm9yICh2YXIgbiBpbiB0aGlzLnByb3BlcnRpZXMpIHtcbiAgICAgICAgdGFyZ2V0LnN0eWxlW25dID0gdGhpcy5wcm9wZXJ0aWVzW25dO1xuICAgIH1cbn1cbmZ1bmN0aW9uIF9jbGVhbnVwU3R5bGVzKHRhcmdldCkge1xuICAgIGZvciAodmFyIG4gaW4gdGhpcy5wcm9wZXJ0aWVzKSB7XG4gICAgICAgIHRhcmdldC5zdHlsZVtuXSA9ICcnO1xuICAgIH1cbn1cbmZ1bmN0aW9uIF9hcHBseUF0dHJpYnV0ZXModGFyZ2V0KSB7XG4gICAgZm9yICh2YXIgbiBpbiB0aGlzLmF0dHJpYnV0ZXMpIHtcbiAgICAgICAgdGFyZ2V0LnNldEF0dHJpYnV0ZShuLCB0aGlzLmF0dHJpYnV0ZXNbbl0pO1xuICAgIH1cbn1cbmZ1bmN0aW9uIF9jbGVhbnVwQXR0cmlidXRlcyh0YXJnZXQpIHtcbiAgICBmb3IgKHZhciBuIGluIHRoaXMuYXR0cmlidXRlcykge1xuICAgICAgICB0YXJnZXQucmVtb3ZlQXR0cmlidXRlKG4pO1xuICAgIH1cbn1cbmZ1bmN0aW9uIF94eU5vdEVxdWFscyhhLCBiKSB7XG4gICAgcmV0dXJuIGEgJiYgYiA/IGFbMF0gIT09IGJbMF0gfHwgYVsxXSAhPT0gYlsxXSA6IGEgIT09IGI7XG59XG5TdXJmYWNlLnByb3RvdHlwZS5zZXR1cCA9IGZ1bmN0aW9uIHNldHVwKGFsbG9jYXRvcikge1xuICAgIHZhciB0YXJnZXQgPSBhbGxvY2F0b3IuYWxsb2NhdGUodGhpcy5lbGVtZW50VHlwZSk7XG4gICAgaWYgKHRoaXMuZWxlbWVudENsYXNzKSB7XG4gICAgICAgIGlmICh0aGlzLmVsZW1lbnRDbGFzcyBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZWxlbWVudENsYXNzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdGFyZ2V0LmNsYXNzTGlzdC5hZGQodGhpcy5lbGVtZW50Q2xhc3NbaV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGFyZ2V0LmNsYXNzTGlzdC5hZGQodGhpcy5lbGVtZW50Q2xhc3MpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHRhcmdldC5zdHlsZS5kaXNwbGF5ID0gJyc7XG4gICAgdGhpcy5hdHRhY2godGFyZ2V0KTtcbiAgICB0aGlzLl9vcGFjaXR5ID0gbnVsbDtcbiAgICB0aGlzLl9jdXJyZW50VGFyZ2V0ID0gdGFyZ2V0O1xuICAgIHRoaXMuX3N0eWxlc0RpcnR5ID0gdHJ1ZTtcbiAgICB0aGlzLl9jbGFzc2VzRGlydHkgPSB0cnVlO1xuICAgIHRoaXMuX2F0dHJpYnV0ZXNEaXJ0eSA9IHRydWU7XG4gICAgdGhpcy5fc2l6ZURpcnR5ID0gdHJ1ZTtcbiAgICB0aGlzLl9jb250ZW50RGlydHkgPSB0cnVlO1xuICAgIHRoaXMuX29yaWdpbkRpcnR5ID0gdHJ1ZTtcbiAgICB0aGlzLl90cmFuc2Zvcm1EaXJ0eSA9IHRydWU7XG59O1xuU3VyZmFjZS5wcm90b3R5cGUuY29tbWl0ID0gZnVuY3Rpb24gY29tbWl0KGNvbnRleHQpIHtcbiAgICBpZiAoIXRoaXMuX2N1cnJlbnRUYXJnZXQpXG4gICAgICAgIHRoaXMuc2V0dXAoY29udGV4dC5hbGxvY2F0b3IpO1xuICAgIHZhciB0YXJnZXQgPSB0aGlzLl9jdXJyZW50VGFyZ2V0O1xuICAgIHZhciBzaXplID0gY29udGV4dC5zaXplO1xuICAgIGlmICh0aGlzLl9jbGFzc2VzRGlydHkpIHtcbiAgICAgICAgX2NsZWFudXBDbGFzc2VzLmNhbGwodGhpcywgdGFyZ2V0KTtcbiAgICAgICAgdmFyIGNsYXNzTGlzdCA9IHRoaXMuZ2V0Q2xhc3NMaXN0KCk7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2xhc3NMaXN0Lmxlbmd0aDsgaSsrKVxuICAgICAgICAgICAgdGFyZ2V0LmNsYXNzTGlzdC5hZGQoY2xhc3NMaXN0W2ldKTtcbiAgICAgICAgdGhpcy5fY2xhc3Nlc0RpcnR5ID0gZmFsc2U7XG4gICAgICAgIHRoaXMuX3RydWVTaXplQ2hlY2sgPSB0cnVlO1xuICAgIH1cbiAgICBpZiAodGhpcy5fc3R5bGVzRGlydHkpIHtcbiAgICAgICAgX2FwcGx5U3R5bGVzLmNhbGwodGhpcywgdGFyZ2V0KTtcbiAgICAgICAgdGhpcy5fc3R5bGVzRGlydHkgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5fdHJ1ZVNpemVDaGVjayA9IHRydWU7XG4gICAgfVxuICAgIGlmICh0aGlzLl9hdHRyaWJ1dGVzRGlydHkpIHtcbiAgICAgICAgX2FwcGx5QXR0cmlidXRlcy5jYWxsKHRoaXMsIHRhcmdldCk7XG4gICAgICAgIHRoaXMuX2F0dHJpYnV0ZXNEaXJ0eSA9IGZhbHNlO1xuICAgICAgICB0aGlzLl90cnVlU2l6ZUNoZWNrID0gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKHRoaXMuc2l6ZSkge1xuICAgICAgICB2YXIgb3JpZ1NpemUgPSBjb250ZXh0LnNpemU7XG4gICAgICAgIHNpemUgPSBbXG4gICAgICAgICAgICB0aGlzLnNpemVbMF0sXG4gICAgICAgICAgICB0aGlzLnNpemVbMV1cbiAgICAgICAgXTtcbiAgICAgICAgaWYgKHNpemVbMF0gPT09IHVuZGVmaW5lZClcbiAgICAgICAgICAgIHNpemVbMF0gPSBvcmlnU2l6ZVswXTtcbiAgICAgICAgaWYgKHNpemVbMV0gPT09IHVuZGVmaW5lZClcbiAgICAgICAgICAgIHNpemVbMV0gPSBvcmlnU2l6ZVsxXTtcbiAgICAgICAgaWYgKHNpemVbMF0gPT09IHRydWUgfHwgc2l6ZVsxXSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgaWYgKHNpemVbMF0gPT09IHRydWUgJiYgKHRoaXMuX3RydWVTaXplQ2hlY2sgfHwgdGhpcy5fc2l6ZVswXSA9PT0gMCkpIHtcbiAgICAgICAgICAgICAgICB2YXIgd2lkdGggPSB0YXJnZXQub2Zmc2V0V2lkdGg7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX3NpemUgJiYgdGhpcy5fc2l6ZVswXSAhPT0gd2lkdGgpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fc2l6ZVswXSA9IHdpZHRoO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9zaXplRGlydHkgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBzaXplWzBdID0gd2lkdGg7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9zaXplKVxuICAgICAgICAgICAgICAgICAgICBzaXplWzBdID0gdGhpcy5fc2l6ZVswXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChzaXplWzFdID09PSB0cnVlICYmICh0aGlzLl90cnVlU2l6ZUNoZWNrIHx8IHRoaXMuX3NpemVbMV0gPT09IDApKSB7XG4gICAgICAgICAgICAgICAgdmFyIGhlaWdodCA9IHRhcmdldC5vZmZzZXRIZWlnaHQ7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX3NpemUgJiYgdGhpcy5fc2l6ZVsxXSAhPT0gaGVpZ2h0KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3NpemVbMV0gPSBoZWlnaHQ7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3NpemVEaXJ0eSA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHNpemVbMV0gPSBoZWlnaHQ7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9zaXplKVxuICAgICAgICAgICAgICAgICAgICBzaXplWzFdID0gdGhpcy5fc2l6ZVsxXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuX3RydWVTaXplQ2hlY2sgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAoX3h5Tm90RXF1YWxzKHRoaXMuX3NpemUsIHNpemUpKSB7XG4gICAgICAgIGlmICghdGhpcy5fc2l6ZSlcbiAgICAgICAgICAgIHRoaXMuX3NpemUgPSBbXG4gICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICAwXG4gICAgICAgICAgICBdO1xuICAgICAgICB0aGlzLl9zaXplWzBdID0gc2l6ZVswXTtcbiAgICAgICAgdGhpcy5fc2l6ZVsxXSA9IHNpemVbMV07XG4gICAgICAgIHRoaXMuX3NpemVEaXJ0eSA9IHRydWU7XG4gICAgfVxuICAgIGlmICh0aGlzLl9zaXplRGlydHkpIHtcbiAgICAgICAgaWYgKHRoaXMuX3NpemUpIHtcbiAgICAgICAgICAgIHRhcmdldC5zdHlsZS53aWR0aCA9IHRoaXMuc2l6ZSAmJiB0aGlzLnNpemVbMF0gPT09IHRydWUgPyAnJyA6IHRoaXMuX3NpemVbMF0gKyAncHgnO1xuICAgICAgICAgICAgdGFyZ2V0LnN0eWxlLmhlaWdodCA9IHRoaXMuc2l6ZSAmJiB0aGlzLnNpemVbMV0gPT09IHRydWUgPyAnJyA6IHRoaXMuX3NpemVbMV0gKyAncHgnO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2V2ZW50T3V0cHV0LmVtaXQoJ3Jlc2l6ZScpO1xuICAgIH1cbiAgICBpZiAodGhpcy5fY29udGVudERpcnR5KSB7XG4gICAgICAgIHRoaXMuZGVwbG95KHRhcmdldCk7XG4gICAgICAgIHRoaXMuX2V2ZW50T3V0cHV0LmVtaXQoJ2RlcGxveScpO1xuICAgICAgICB0aGlzLl9jb250ZW50RGlydHkgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5fdHJ1ZVNpemVDaGVjayA9IHRydWU7XG4gICAgfVxuICAgIEVsZW1lbnRPdXRwdXQucHJvdG90eXBlLmNvbW1pdC5jYWxsKHRoaXMsIGNvbnRleHQpO1xufTtcblN1cmZhY2UucHJvdG90eXBlLmNsZWFudXAgPSBmdW5jdGlvbiBjbGVhbnVwKGFsbG9jYXRvcikge1xuICAgIHZhciBpID0gMDtcbiAgICB2YXIgdGFyZ2V0ID0gdGhpcy5fY3VycmVudFRhcmdldDtcbiAgICB0aGlzLl9ldmVudE91dHB1dC5lbWl0KCdyZWNhbGwnKTtcbiAgICB0aGlzLnJlY2FsbCh0YXJnZXQpO1xuICAgIHRhcmdldC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgIHRhcmdldC5zdHlsZS5vcGFjaXR5ID0gJyc7XG4gICAgdGFyZ2V0LnN0eWxlLndpZHRoID0gJyc7XG4gICAgdGFyZ2V0LnN0eWxlLmhlaWdodCA9ICcnO1xuICAgIF9jbGVhbnVwU3R5bGVzLmNhbGwodGhpcywgdGFyZ2V0KTtcbiAgICBfY2xlYW51cEF0dHJpYnV0ZXMuY2FsbCh0aGlzLCB0YXJnZXQpO1xuICAgIHZhciBjbGFzc0xpc3QgPSB0aGlzLmdldENsYXNzTGlzdCgpO1xuICAgIF9jbGVhbnVwQ2xhc3Nlcy5jYWxsKHRoaXMsIHRhcmdldCk7XG4gICAgZm9yIChpID0gMDsgaSA8IGNsYXNzTGlzdC5sZW5ndGg7IGkrKylcbiAgICAgICAgdGFyZ2V0LmNsYXNzTGlzdC5yZW1vdmUoY2xhc3NMaXN0W2ldKTtcbiAgICBpZiAodGhpcy5lbGVtZW50Q2xhc3MpIHtcbiAgICAgICAgaWYgKHRoaXMuZWxlbWVudENsYXNzIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCB0aGlzLmVsZW1lbnRDbGFzcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHRhcmdldC5jbGFzc0xpc3QucmVtb3ZlKHRoaXMuZWxlbWVudENsYXNzW2ldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRhcmdldC5jbGFzc0xpc3QucmVtb3ZlKHRoaXMuZWxlbWVudENsYXNzKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICB0aGlzLmRldGFjaCh0YXJnZXQpO1xuICAgIHRoaXMuX2N1cnJlbnRUYXJnZXQgPSBudWxsO1xuICAgIGFsbG9jYXRvci5kZWFsbG9jYXRlKHRhcmdldCk7XG59O1xuU3VyZmFjZS5wcm90b3R5cGUuZGVwbG95ID0gZnVuY3Rpb24gZGVwbG95KHRhcmdldCkge1xuICAgIHZhciBjb250ZW50ID0gdGhpcy5nZXRDb250ZW50KCk7XG4gICAgaWYgKGNvbnRlbnQgaW5zdGFuY2VvZiBOb2RlKSB7XG4gICAgICAgIHdoaWxlICh0YXJnZXQuaGFzQ2hpbGROb2RlcygpKVxuICAgICAgICAgICAgdGFyZ2V0LnJlbW92ZUNoaWxkKHRhcmdldC5maXJzdENoaWxkKTtcbiAgICAgICAgdGFyZ2V0LmFwcGVuZENoaWxkKGNvbnRlbnQpO1xuICAgIH0gZWxzZVxuICAgICAgICB0YXJnZXQuaW5uZXJIVE1MID0gY29udGVudDtcbn07XG5TdXJmYWNlLnByb3RvdHlwZS5yZWNhbGwgPSBmdW5jdGlvbiByZWNhbGwodGFyZ2V0KSB7XG4gICAgdmFyIGRmID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpO1xuICAgIHdoaWxlICh0YXJnZXQuaGFzQ2hpbGROb2RlcygpKVxuICAgICAgICBkZi5hcHBlbmRDaGlsZCh0YXJnZXQuZmlyc3RDaGlsZCk7XG4gICAgdGhpcy5zZXRDb250ZW50KGRmKTtcbn07XG5TdXJmYWNlLnByb3RvdHlwZS5nZXRTaXplID0gZnVuY3Rpb24gZ2V0U2l6ZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fc2l6ZSA/IHRoaXMuX3NpemUgOiB0aGlzLnNpemU7XG59O1xuU3VyZmFjZS5wcm90b3R5cGUuc2V0U2l6ZSA9IGZ1bmN0aW9uIHNldFNpemUoc2l6ZSkge1xuICAgIHRoaXMuc2l6ZSA9IHNpemUgPyBbXG4gICAgICAgIHNpemVbMF0sXG4gICAgICAgIHNpemVbMV1cbiAgICBdIDogbnVsbDtcbiAgICB0aGlzLl9zaXplRGlydHkgPSB0cnVlO1xuICAgIHJldHVybiB0aGlzO1xufTtcbm1vZHVsZS5leHBvcnRzID0gU3VyZmFjZTsiLCJ2YXIgVHJhbnNmb3JtID0ge307XG5UcmFuc2Zvcm0ucHJlY2lzaW9uID0gMC4wMDAwMDE7XG5UcmFuc2Zvcm0uaWRlbnRpdHkgPSBbXG4gICAgMSxcbiAgICAwLFxuICAgIDAsXG4gICAgMCxcbiAgICAwLFxuICAgIDEsXG4gICAgMCxcbiAgICAwLFxuICAgIDAsXG4gICAgMCxcbiAgICAxLFxuICAgIDAsXG4gICAgMCxcbiAgICAwLFxuICAgIDAsXG4gICAgMVxuXTtcblRyYW5zZm9ybS5tdWx0aXBseTR4NCA9IGZ1bmN0aW9uIG11bHRpcGx5NHg0KGEsIGIpIHtcbiAgICByZXR1cm4gW1xuICAgICAgICBhWzBdICogYlswXSArIGFbNF0gKiBiWzFdICsgYVs4XSAqIGJbMl0gKyBhWzEyXSAqIGJbM10sXG4gICAgICAgIGFbMV0gKiBiWzBdICsgYVs1XSAqIGJbMV0gKyBhWzldICogYlsyXSArIGFbMTNdICogYlszXSxcbiAgICAgICAgYVsyXSAqIGJbMF0gKyBhWzZdICogYlsxXSArIGFbMTBdICogYlsyXSArIGFbMTRdICogYlszXSxcbiAgICAgICAgYVszXSAqIGJbMF0gKyBhWzddICogYlsxXSArIGFbMTFdICogYlsyXSArIGFbMTVdICogYlszXSxcbiAgICAgICAgYVswXSAqIGJbNF0gKyBhWzRdICogYls1XSArIGFbOF0gKiBiWzZdICsgYVsxMl0gKiBiWzddLFxuICAgICAgICBhWzFdICogYls0XSArIGFbNV0gKiBiWzVdICsgYVs5XSAqIGJbNl0gKyBhWzEzXSAqIGJbN10sXG4gICAgICAgIGFbMl0gKiBiWzRdICsgYVs2XSAqIGJbNV0gKyBhWzEwXSAqIGJbNl0gKyBhWzE0XSAqIGJbN10sXG4gICAgICAgIGFbM10gKiBiWzRdICsgYVs3XSAqIGJbNV0gKyBhWzExXSAqIGJbNl0gKyBhWzE1XSAqIGJbN10sXG4gICAgICAgIGFbMF0gKiBiWzhdICsgYVs0XSAqIGJbOV0gKyBhWzhdICogYlsxMF0gKyBhWzEyXSAqIGJbMTFdLFxuICAgICAgICBhWzFdICogYls4XSArIGFbNV0gKiBiWzldICsgYVs5XSAqIGJbMTBdICsgYVsxM10gKiBiWzExXSxcbiAgICAgICAgYVsyXSAqIGJbOF0gKyBhWzZdICogYls5XSArIGFbMTBdICogYlsxMF0gKyBhWzE0XSAqIGJbMTFdLFxuICAgICAgICBhWzNdICogYls4XSArIGFbN10gKiBiWzldICsgYVsxMV0gKiBiWzEwXSArIGFbMTVdICogYlsxMV0sXG4gICAgICAgIGFbMF0gKiBiWzEyXSArIGFbNF0gKiBiWzEzXSArIGFbOF0gKiBiWzE0XSArIGFbMTJdICogYlsxNV0sXG4gICAgICAgIGFbMV0gKiBiWzEyXSArIGFbNV0gKiBiWzEzXSArIGFbOV0gKiBiWzE0XSArIGFbMTNdICogYlsxNV0sXG4gICAgICAgIGFbMl0gKiBiWzEyXSArIGFbNl0gKiBiWzEzXSArIGFbMTBdICogYlsxNF0gKyBhWzE0XSAqIGJbMTVdLFxuICAgICAgICBhWzNdICogYlsxMl0gKyBhWzddICogYlsxM10gKyBhWzExXSAqIGJbMTRdICsgYVsxNV0gKiBiWzE1XVxuICAgIF07XG59O1xuVHJhbnNmb3JtLm11bHRpcGx5ID0gZnVuY3Rpb24gbXVsdGlwbHkoYSwgYikge1xuICAgIHJldHVybiBbXG4gICAgICAgIGFbMF0gKiBiWzBdICsgYVs0XSAqIGJbMV0gKyBhWzhdICogYlsyXSxcbiAgICAgICAgYVsxXSAqIGJbMF0gKyBhWzVdICogYlsxXSArIGFbOV0gKiBiWzJdLFxuICAgICAgICBhWzJdICogYlswXSArIGFbNl0gKiBiWzFdICsgYVsxMF0gKiBiWzJdLFxuICAgICAgICAwLFxuICAgICAgICBhWzBdICogYls0XSArIGFbNF0gKiBiWzVdICsgYVs4XSAqIGJbNl0sXG4gICAgICAgIGFbMV0gKiBiWzRdICsgYVs1XSAqIGJbNV0gKyBhWzldICogYls2XSxcbiAgICAgICAgYVsyXSAqIGJbNF0gKyBhWzZdICogYls1XSArIGFbMTBdICogYls2XSxcbiAgICAgICAgMCxcbiAgICAgICAgYVswXSAqIGJbOF0gKyBhWzRdICogYls5XSArIGFbOF0gKiBiWzEwXSxcbiAgICAgICAgYVsxXSAqIGJbOF0gKyBhWzVdICogYls5XSArIGFbOV0gKiBiWzEwXSxcbiAgICAgICAgYVsyXSAqIGJbOF0gKyBhWzZdICogYls5XSArIGFbMTBdICogYlsxMF0sXG4gICAgICAgIDAsXG4gICAgICAgIGFbMF0gKiBiWzEyXSArIGFbNF0gKiBiWzEzXSArIGFbOF0gKiBiWzE0XSArIGFbMTJdLFxuICAgICAgICBhWzFdICogYlsxMl0gKyBhWzVdICogYlsxM10gKyBhWzldICogYlsxNF0gKyBhWzEzXSxcbiAgICAgICAgYVsyXSAqIGJbMTJdICsgYVs2XSAqIGJbMTNdICsgYVsxMF0gKiBiWzE0XSArIGFbMTRdLFxuICAgICAgICAxXG4gICAgXTtcbn07XG5UcmFuc2Zvcm0udGhlbk1vdmUgPSBmdW5jdGlvbiB0aGVuTW92ZShtLCB0KSB7XG4gICAgaWYgKCF0WzJdKVxuICAgICAgICB0WzJdID0gMDtcbiAgICByZXR1cm4gW1xuICAgICAgICBtWzBdLFxuICAgICAgICBtWzFdLFxuICAgICAgICBtWzJdLFxuICAgICAgICAwLFxuICAgICAgICBtWzRdLFxuICAgICAgICBtWzVdLFxuICAgICAgICBtWzZdLFxuICAgICAgICAwLFxuICAgICAgICBtWzhdLFxuICAgICAgICBtWzldLFxuICAgICAgICBtWzEwXSxcbiAgICAgICAgMCxcbiAgICAgICAgbVsxMl0gKyB0WzBdLFxuICAgICAgICBtWzEzXSArIHRbMV0sXG4gICAgICAgIG1bMTRdICsgdFsyXSxcbiAgICAgICAgMVxuICAgIF07XG59O1xuVHJhbnNmb3JtLm1vdmVUaGVuID0gZnVuY3Rpb24gbW92ZVRoZW4odiwgbSkge1xuICAgIGlmICghdlsyXSlcbiAgICAgICAgdlsyXSA9IDA7XG4gICAgdmFyIHQwID0gdlswXSAqIG1bMF0gKyB2WzFdICogbVs0XSArIHZbMl0gKiBtWzhdO1xuICAgIHZhciB0MSA9IHZbMF0gKiBtWzFdICsgdlsxXSAqIG1bNV0gKyB2WzJdICogbVs5XTtcbiAgICB2YXIgdDIgPSB2WzBdICogbVsyXSArIHZbMV0gKiBtWzZdICsgdlsyXSAqIG1bMTBdO1xuICAgIHJldHVybiBUcmFuc2Zvcm0udGhlbk1vdmUobSwgW1xuICAgICAgICB0MCxcbiAgICAgICAgdDEsXG4gICAgICAgIHQyXG4gICAgXSk7XG59O1xuVHJhbnNmb3JtLnRyYW5zbGF0ZSA9IGZ1bmN0aW9uIHRyYW5zbGF0ZSh4LCB5LCB6KSB7XG4gICAgaWYgKHogPT09IHVuZGVmaW5lZClcbiAgICAgICAgeiA9IDA7XG4gICAgcmV0dXJuIFtcbiAgICAgICAgMSxcbiAgICAgICAgMCxcbiAgICAgICAgMCxcbiAgICAgICAgMCxcbiAgICAgICAgMCxcbiAgICAgICAgMSxcbiAgICAgICAgMCxcbiAgICAgICAgMCxcbiAgICAgICAgMCxcbiAgICAgICAgMCxcbiAgICAgICAgMSxcbiAgICAgICAgMCxcbiAgICAgICAgeCxcbiAgICAgICAgeSxcbiAgICAgICAgeixcbiAgICAgICAgMVxuICAgIF07XG59O1xuVHJhbnNmb3JtLnRoZW5TY2FsZSA9IGZ1bmN0aW9uIHRoZW5TY2FsZShtLCBzKSB7XG4gICAgcmV0dXJuIFtcbiAgICAgICAgc1swXSAqIG1bMF0sXG4gICAgICAgIHNbMV0gKiBtWzFdLFxuICAgICAgICBzWzJdICogbVsyXSxcbiAgICAgICAgMCxcbiAgICAgICAgc1swXSAqIG1bNF0sXG4gICAgICAgIHNbMV0gKiBtWzVdLFxuICAgICAgICBzWzJdICogbVs2XSxcbiAgICAgICAgMCxcbiAgICAgICAgc1swXSAqIG1bOF0sXG4gICAgICAgIHNbMV0gKiBtWzldLFxuICAgICAgICBzWzJdICogbVsxMF0sXG4gICAgICAgIDAsXG4gICAgICAgIHNbMF0gKiBtWzEyXSxcbiAgICAgICAgc1sxXSAqIG1bMTNdLFxuICAgICAgICBzWzJdICogbVsxNF0sXG4gICAgICAgIDFcbiAgICBdO1xufTtcblRyYW5zZm9ybS5zY2FsZSA9IGZ1bmN0aW9uIHNjYWxlKHgsIHksIHopIHtcbiAgICBpZiAoeiA9PT0gdW5kZWZpbmVkKVxuICAgICAgICB6ID0gMTtcbiAgICBpZiAoeSA9PT0gdW5kZWZpbmVkKVxuICAgICAgICB5ID0geDtcbiAgICByZXR1cm4gW1xuICAgICAgICB4LFxuICAgICAgICAwLFxuICAgICAgICAwLFxuICAgICAgICAwLFxuICAgICAgICAwLFxuICAgICAgICB5LFxuICAgICAgICAwLFxuICAgICAgICAwLFxuICAgICAgICAwLFxuICAgICAgICAwLFxuICAgICAgICB6LFxuICAgICAgICAwLFxuICAgICAgICAwLFxuICAgICAgICAwLFxuICAgICAgICAwLFxuICAgICAgICAxXG4gICAgXTtcbn07XG5UcmFuc2Zvcm0ucm90YXRlWCA9IGZ1bmN0aW9uIHJvdGF0ZVgodGhldGEpIHtcbiAgICB2YXIgY29zVGhldGEgPSBNYXRoLmNvcyh0aGV0YSk7XG4gICAgdmFyIHNpblRoZXRhID0gTWF0aC5zaW4odGhldGEpO1xuICAgIHJldHVybiBbXG4gICAgICAgIDEsXG4gICAgICAgIDAsXG4gICAgICAgIDAsXG4gICAgICAgIDAsXG4gICAgICAgIDAsXG4gICAgICAgIGNvc1RoZXRhLFxuICAgICAgICBzaW5UaGV0YSxcbiAgICAgICAgMCxcbiAgICAgICAgMCxcbiAgICAgICAgLXNpblRoZXRhLFxuICAgICAgICBjb3NUaGV0YSxcbiAgICAgICAgMCxcbiAgICAgICAgMCxcbiAgICAgICAgMCxcbiAgICAgICAgMCxcbiAgICAgICAgMVxuICAgIF07XG59O1xuVHJhbnNmb3JtLnJvdGF0ZVkgPSBmdW5jdGlvbiByb3RhdGVZKHRoZXRhKSB7XG4gICAgdmFyIGNvc1RoZXRhID0gTWF0aC5jb3ModGhldGEpO1xuICAgIHZhciBzaW5UaGV0YSA9IE1hdGguc2luKHRoZXRhKTtcbiAgICByZXR1cm4gW1xuICAgICAgICBjb3NUaGV0YSxcbiAgICAgICAgMCxcbiAgICAgICAgLXNpblRoZXRhLFxuICAgICAgICAwLFxuICAgICAgICAwLFxuICAgICAgICAxLFxuICAgICAgICAwLFxuICAgICAgICAwLFxuICAgICAgICBzaW5UaGV0YSxcbiAgICAgICAgMCxcbiAgICAgICAgY29zVGhldGEsXG4gICAgICAgIDAsXG4gICAgICAgIDAsXG4gICAgICAgIDAsXG4gICAgICAgIDAsXG4gICAgICAgIDFcbiAgICBdO1xufTtcblRyYW5zZm9ybS5yb3RhdGVaID0gZnVuY3Rpb24gcm90YXRlWih0aGV0YSkge1xuICAgIHZhciBjb3NUaGV0YSA9IE1hdGguY29zKHRoZXRhKTtcbiAgICB2YXIgc2luVGhldGEgPSBNYXRoLnNpbih0aGV0YSk7XG4gICAgcmV0dXJuIFtcbiAgICAgICAgY29zVGhldGEsXG4gICAgICAgIHNpblRoZXRhLFxuICAgICAgICAwLFxuICAgICAgICAwLFxuICAgICAgICAtc2luVGhldGEsXG4gICAgICAgIGNvc1RoZXRhLFxuICAgICAgICAwLFxuICAgICAgICAwLFxuICAgICAgICAwLFxuICAgICAgICAwLFxuICAgICAgICAxLFxuICAgICAgICAwLFxuICAgICAgICAwLFxuICAgICAgICAwLFxuICAgICAgICAwLFxuICAgICAgICAxXG4gICAgXTtcbn07XG5UcmFuc2Zvcm0ucm90YXRlID0gZnVuY3Rpb24gcm90YXRlKHBoaSwgdGhldGEsIHBzaSkge1xuICAgIHZhciBjb3NQaGkgPSBNYXRoLmNvcyhwaGkpO1xuICAgIHZhciBzaW5QaGkgPSBNYXRoLnNpbihwaGkpO1xuICAgIHZhciBjb3NUaGV0YSA9IE1hdGguY29zKHRoZXRhKTtcbiAgICB2YXIgc2luVGhldGEgPSBNYXRoLnNpbih0aGV0YSk7XG4gICAgdmFyIGNvc1BzaSA9IE1hdGguY29zKHBzaSk7XG4gICAgdmFyIHNpblBzaSA9IE1hdGguc2luKHBzaSk7XG4gICAgdmFyIHJlc3VsdCA9IFtcbiAgICAgICAgICAgIGNvc1RoZXRhICogY29zUHNpLFxuICAgICAgICAgICAgY29zUGhpICogc2luUHNpICsgc2luUGhpICogc2luVGhldGEgKiBjb3NQc2ksXG4gICAgICAgICAgICBzaW5QaGkgKiBzaW5Qc2kgLSBjb3NQaGkgKiBzaW5UaGV0YSAqIGNvc1BzaSxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAtY29zVGhldGEgKiBzaW5Qc2ksXG4gICAgICAgICAgICBjb3NQaGkgKiBjb3NQc2kgLSBzaW5QaGkgKiBzaW5UaGV0YSAqIHNpblBzaSxcbiAgICAgICAgICAgIHNpblBoaSAqIGNvc1BzaSArIGNvc1BoaSAqIHNpblRoZXRhICogc2luUHNpLFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIHNpblRoZXRhLFxuICAgICAgICAgICAgLXNpblBoaSAqIGNvc1RoZXRhLFxuICAgICAgICAgICAgY29zUGhpICogY29zVGhldGEsXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMVxuICAgICAgICBdO1xuICAgIHJldHVybiByZXN1bHQ7XG59O1xuVHJhbnNmb3JtLnJvdGF0ZUF4aXMgPSBmdW5jdGlvbiByb3RhdGVBeGlzKHYsIHRoZXRhKSB7XG4gICAgdmFyIHNpblRoZXRhID0gTWF0aC5zaW4odGhldGEpO1xuICAgIHZhciBjb3NUaGV0YSA9IE1hdGguY29zKHRoZXRhKTtcbiAgICB2YXIgdmVyVGhldGEgPSAxIC0gY29zVGhldGE7XG4gICAgdmFyIHh4ViA9IHZbMF0gKiB2WzBdICogdmVyVGhldGE7XG4gICAgdmFyIHh5ViA9IHZbMF0gKiB2WzFdICogdmVyVGhldGE7XG4gICAgdmFyIHh6ViA9IHZbMF0gKiB2WzJdICogdmVyVGhldGE7XG4gICAgdmFyIHl5ViA9IHZbMV0gKiB2WzFdICogdmVyVGhldGE7XG4gICAgdmFyIHl6ViA9IHZbMV0gKiB2WzJdICogdmVyVGhldGE7XG4gICAgdmFyIHp6ViA9IHZbMl0gKiB2WzJdICogdmVyVGhldGE7XG4gICAgdmFyIHhzID0gdlswXSAqIHNpblRoZXRhO1xuICAgIHZhciB5cyA9IHZbMV0gKiBzaW5UaGV0YTtcbiAgICB2YXIgenMgPSB2WzJdICogc2luVGhldGE7XG4gICAgdmFyIHJlc3VsdCA9IFtcbiAgICAgICAgICAgIHh4ViArIGNvc1RoZXRhLFxuICAgICAgICAgICAgeHlWICsgenMsXG4gICAgICAgICAgICB4elYgLSB5cyxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICB4eVYgLSB6cyxcbiAgICAgICAgICAgIHl5ViArIGNvc1RoZXRhLFxuICAgICAgICAgICAgeXpWICsgeHMsXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgeHpWICsgeXMsXG4gICAgICAgICAgICB5elYgLSB4cyxcbiAgICAgICAgICAgIHp6ViArIGNvc1RoZXRhLFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDFcbiAgICAgICAgXTtcbiAgICByZXR1cm4gcmVzdWx0O1xufTtcblRyYW5zZm9ybS5hYm91dE9yaWdpbiA9IGZ1bmN0aW9uIGFib3V0T3JpZ2luKHYsIG0pIHtcbiAgICB2YXIgdDAgPSB2WzBdIC0gKHZbMF0gKiBtWzBdICsgdlsxXSAqIG1bNF0gKyB2WzJdICogbVs4XSk7XG4gICAgdmFyIHQxID0gdlsxXSAtICh2WzBdICogbVsxXSArIHZbMV0gKiBtWzVdICsgdlsyXSAqIG1bOV0pO1xuICAgIHZhciB0MiA9IHZbMl0gLSAodlswXSAqIG1bMl0gKyB2WzFdICogbVs2XSArIHZbMl0gKiBtWzEwXSk7XG4gICAgcmV0dXJuIFRyYW5zZm9ybS50aGVuTW92ZShtLCBbXG4gICAgICAgIHQwLFxuICAgICAgICB0MSxcbiAgICAgICAgdDJcbiAgICBdKTtcbn07XG5UcmFuc2Zvcm0uc2tldyA9IGZ1bmN0aW9uIHNrZXcocGhpLCB0aGV0YSwgcHNpKSB7XG4gICAgcmV0dXJuIFtcbiAgICAgICAgMSxcbiAgICAgICAgTWF0aC50YW4odGhldGEpLFxuICAgICAgICAwLFxuICAgICAgICAwLFxuICAgICAgICBNYXRoLnRhbihwc2kpLFxuICAgICAgICAxLFxuICAgICAgICAwLFxuICAgICAgICAwLFxuICAgICAgICAwLFxuICAgICAgICBNYXRoLnRhbihwaGkpLFxuICAgICAgICAxLFxuICAgICAgICAwLFxuICAgICAgICAwLFxuICAgICAgICAwLFxuICAgICAgICAwLFxuICAgICAgICAxXG4gICAgXTtcbn07XG5UcmFuc2Zvcm0uc2tld1ggPSBmdW5jdGlvbiBza2V3WChhbmdsZSkge1xuICAgIHJldHVybiBbXG4gICAgICAgIDEsXG4gICAgICAgIDAsXG4gICAgICAgIDAsXG4gICAgICAgIDAsXG4gICAgICAgIE1hdGgudGFuKGFuZ2xlKSxcbiAgICAgICAgMSxcbiAgICAgICAgMCxcbiAgICAgICAgMCxcbiAgICAgICAgMCxcbiAgICAgICAgMCxcbiAgICAgICAgMSxcbiAgICAgICAgMCxcbiAgICAgICAgMCxcbiAgICAgICAgMCxcbiAgICAgICAgMCxcbiAgICAgICAgMVxuICAgIF07XG59O1xuVHJhbnNmb3JtLnNrZXdZID0gZnVuY3Rpb24gc2tld1koYW5nbGUpIHtcbiAgICByZXR1cm4gW1xuICAgICAgICAxLFxuICAgICAgICBNYXRoLnRhbihhbmdsZSksXG4gICAgICAgIDAsXG4gICAgICAgIDAsXG4gICAgICAgIDAsXG4gICAgICAgIDEsXG4gICAgICAgIDAsXG4gICAgICAgIDAsXG4gICAgICAgIDAsXG4gICAgICAgIDAsXG4gICAgICAgIDEsXG4gICAgICAgIDAsXG4gICAgICAgIDAsXG4gICAgICAgIDAsXG4gICAgICAgIDAsXG4gICAgICAgIDFcbiAgICBdO1xufTtcblRyYW5zZm9ybS5wZXJzcGVjdGl2ZSA9IGZ1bmN0aW9uIHBlcnNwZWN0aXZlKGZvY3VzWikge1xuICAgIHJldHVybiBbXG4gICAgICAgIDEsXG4gICAgICAgIDAsXG4gICAgICAgIDAsXG4gICAgICAgIDAsXG4gICAgICAgIDAsXG4gICAgICAgIDEsXG4gICAgICAgIDAsXG4gICAgICAgIDAsXG4gICAgICAgIDAsXG4gICAgICAgIDAsXG4gICAgICAgIDEsXG4gICAgICAgIC0xIC8gZm9jdXNaLFxuICAgICAgICAwLFxuICAgICAgICAwLFxuICAgICAgICAwLFxuICAgICAgICAxXG4gICAgXTtcbn07XG5UcmFuc2Zvcm0uZ2V0VHJhbnNsYXRlID0gZnVuY3Rpb24gZ2V0VHJhbnNsYXRlKG0pIHtcbiAgICByZXR1cm4gW1xuICAgICAgICBtWzEyXSxcbiAgICAgICAgbVsxM10sXG4gICAgICAgIG1bMTRdXG4gICAgXTtcbn07XG5UcmFuc2Zvcm0uaW52ZXJzZSA9IGZ1bmN0aW9uIGludmVyc2UobSkge1xuICAgIHZhciBjMCA9IG1bNV0gKiBtWzEwXSAtIG1bNl0gKiBtWzldO1xuICAgIHZhciBjMSA9IG1bNF0gKiBtWzEwXSAtIG1bNl0gKiBtWzhdO1xuICAgIHZhciBjMiA9IG1bNF0gKiBtWzldIC0gbVs1XSAqIG1bOF07XG4gICAgdmFyIGM0ID0gbVsxXSAqIG1bMTBdIC0gbVsyXSAqIG1bOV07XG4gICAgdmFyIGM1ID0gbVswXSAqIG1bMTBdIC0gbVsyXSAqIG1bOF07XG4gICAgdmFyIGM2ID0gbVswXSAqIG1bOV0gLSBtWzFdICogbVs4XTtcbiAgICB2YXIgYzggPSBtWzFdICogbVs2XSAtIG1bMl0gKiBtWzVdO1xuICAgIHZhciBjOSA9IG1bMF0gKiBtWzZdIC0gbVsyXSAqIG1bNF07XG4gICAgdmFyIGMxMCA9IG1bMF0gKiBtWzVdIC0gbVsxXSAqIG1bNF07XG4gICAgdmFyIGRldE0gPSBtWzBdICogYzAgLSBtWzFdICogYzEgKyBtWzJdICogYzI7XG4gICAgdmFyIGludkQgPSAxIC8gZGV0TTtcbiAgICB2YXIgcmVzdWx0ID0gW1xuICAgICAgICAgICAgaW52RCAqIGMwLFxuICAgICAgICAgICAgLWludkQgKiBjNCxcbiAgICAgICAgICAgIGludkQgKiBjOCxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAtaW52RCAqIGMxLFxuICAgICAgICAgICAgaW52RCAqIGM1LFxuICAgICAgICAgICAgLWludkQgKiBjOSxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICBpbnZEICogYzIsXG4gICAgICAgICAgICAtaW52RCAqIGM2LFxuICAgICAgICAgICAgaW52RCAqIGMxMCxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAxXG4gICAgICAgIF07XG4gICAgcmVzdWx0WzEyXSA9IC1tWzEyXSAqIHJlc3VsdFswXSAtIG1bMTNdICogcmVzdWx0WzRdIC0gbVsxNF0gKiByZXN1bHRbOF07XG4gICAgcmVzdWx0WzEzXSA9IC1tWzEyXSAqIHJlc3VsdFsxXSAtIG1bMTNdICogcmVzdWx0WzVdIC0gbVsxNF0gKiByZXN1bHRbOV07XG4gICAgcmVzdWx0WzE0XSA9IC1tWzEyXSAqIHJlc3VsdFsyXSAtIG1bMTNdICogcmVzdWx0WzZdIC0gbVsxNF0gKiByZXN1bHRbMTBdO1xuICAgIHJldHVybiByZXN1bHQ7XG59O1xuVHJhbnNmb3JtLnRyYW5zcG9zZSA9IGZ1bmN0aW9uIHRyYW5zcG9zZShtKSB7XG4gICAgcmV0dXJuIFtcbiAgICAgICAgbVswXSxcbiAgICAgICAgbVs0XSxcbiAgICAgICAgbVs4XSxcbiAgICAgICAgbVsxMl0sXG4gICAgICAgIG1bMV0sXG4gICAgICAgIG1bNV0sXG4gICAgICAgIG1bOV0sXG4gICAgICAgIG1bMTNdLFxuICAgICAgICBtWzJdLFxuICAgICAgICBtWzZdLFxuICAgICAgICBtWzEwXSxcbiAgICAgICAgbVsxNF0sXG4gICAgICAgIG1bM10sXG4gICAgICAgIG1bN10sXG4gICAgICAgIG1bMTFdLFxuICAgICAgICBtWzE1XVxuICAgIF07XG59O1xuZnVuY3Rpb24gX25vcm1TcXVhcmVkKHYpIHtcbiAgICByZXR1cm4gdi5sZW5ndGggPT09IDIgPyB2WzBdICogdlswXSArIHZbMV0gKiB2WzFdIDogdlswXSAqIHZbMF0gKyB2WzFdICogdlsxXSArIHZbMl0gKiB2WzJdO1xufVxuZnVuY3Rpb24gX25vcm0odikge1xuICAgIHJldHVybiBNYXRoLnNxcnQoX25vcm1TcXVhcmVkKHYpKTtcbn1cbmZ1bmN0aW9uIF9zaWduKG4pIHtcbiAgICByZXR1cm4gbiA8IDAgPyAtMSA6IDE7XG59XG5UcmFuc2Zvcm0uaW50ZXJwcmV0ID0gZnVuY3Rpb24gaW50ZXJwcmV0KE0pIHtcbiAgICB2YXIgeCA9IFtcbiAgICAgICAgICAgIE1bMF0sXG4gICAgICAgICAgICBNWzFdLFxuICAgICAgICAgICAgTVsyXVxuICAgICAgICBdO1xuICAgIHZhciBzZ24gPSBfc2lnbih4WzBdKTtcbiAgICB2YXIgeE5vcm0gPSBfbm9ybSh4KTtcbiAgICB2YXIgdiA9IFtcbiAgICAgICAgICAgIHhbMF0gKyBzZ24gKiB4Tm9ybSxcbiAgICAgICAgICAgIHhbMV0sXG4gICAgICAgICAgICB4WzJdXG4gICAgICAgIF07XG4gICAgdmFyIG11bHQgPSAyIC8gX25vcm1TcXVhcmVkKHYpO1xuICAgIGlmIChtdWx0ID49IEluZmluaXR5KSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB0cmFuc2xhdGU6IFRyYW5zZm9ybS5nZXRUcmFuc2xhdGUoTSksXG4gICAgICAgICAgICByb3RhdGU6IFtcbiAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgMFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIHNjYWxlOiBbXG4gICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgIDBcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBza2V3OiBbXG4gICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgIDBcbiAgICAgICAgICAgIF1cbiAgICAgICAgfTtcbiAgICB9XG4gICAgdmFyIFExID0gW1xuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMVxuICAgICAgICBdO1xuICAgIFExWzBdID0gMSAtIG11bHQgKiB2WzBdICogdlswXTtcbiAgICBRMVs1XSA9IDEgLSBtdWx0ICogdlsxXSAqIHZbMV07XG4gICAgUTFbMTBdID0gMSAtIG11bHQgKiB2WzJdICogdlsyXTtcbiAgICBRMVsxXSA9IC1tdWx0ICogdlswXSAqIHZbMV07XG4gICAgUTFbMl0gPSAtbXVsdCAqIHZbMF0gKiB2WzJdO1xuICAgIFExWzZdID0gLW11bHQgKiB2WzFdICogdlsyXTtcbiAgICBRMVs0XSA9IFExWzFdO1xuICAgIFExWzhdID0gUTFbMl07XG4gICAgUTFbOV0gPSBRMVs2XTtcbiAgICB2YXIgTVExID0gVHJhbnNmb3JtLm11bHRpcGx5KFExLCBNKTtcbiAgICB2YXIgeDIgPSBbXG4gICAgICAgICAgICBNUTFbNV0sXG4gICAgICAgICAgICBNUTFbNl1cbiAgICAgICAgXTtcbiAgICB2YXIgc2duMiA9IF9zaWduKHgyWzBdKTtcbiAgICB2YXIgeDJOb3JtID0gX25vcm0oeDIpO1xuICAgIHZhciB2MiA9IFtcbiAgICAgICAgICAgIHgyWzBdICsgc2duMiAqIHgyTm9ybSxcbiAgICAgICAgICAgIHgyWzFdXG4gICAgICAgIF07XG4gICAgdmFyIG11bHQyID0gMiAvIF9ub3JtU3F1YXJlZCh2Mik7XG4gICAgdmFyIFEyID0gW1xuICAgICAgICAgICAgMSxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMVxuICAgICAgICBdO1xuICAgIFEyWzVdID0gMSAtIG11bHQyICogdjJbMF0gKiB2MlswXTtcbiAgICBRMlsxMF0gPSAxIC0gbXVsdDIgKiB2MlsxXSAqIHYyWzFdO1xuICAgIFEyWzZdID0gLW11bHQyICogdjJbMF0gKiB2MlsxXTtcbiAgICBRMls5XSA9IFEyWzZdO1xuICAgIHZhciBRID0gVHJhbnNmb3JtLm11bHRpcGx5KFEyLCBRMSk7XG4gICAgdmFyIFIgPSBUcmFuc2Zvcm0ubXVsdGlwbHkoUSwgTSk7XG4gICAgdmFyIHJlbW92ZXIgPSBUcmFuc2Zvcm0uc2NhbGUoUlswXSA8IDAgPyAtMSA6IDEsIFJbNV0gPCAwID8gLTEgOiAxLCBSWzEwXSA8IDAgPyAtMSA6IDEpO1xuICAgIFIgPSBUcmFuc2Zvcm0ubXVsdGlwbHkoUiwgcmVtb3Zlcik7XG4gICAgUSA9IFRyYW5zZm9ybS5tdWx0aXBseShyZW1vdmVyLCBRKTtcbiAgICB2YXIgcmVzdWx0ID0ge307XG4gICAgcmVzdWx0LnRyYW5zbGF0ZSA9IFRyYW5zZm9ybS5nZXRUcmFuc2xhdGUoTSk7XG4gICAgcmVzdWx0LnJvdGF0ZSA9IFtcbiAgICAgICAgTWF0aC5hdGFuMigtUVs2XSwgUVsxMF0pLFxuICAgICAgICBNYXRoLmFzaW4oUVsyXSksXG4gICAgICAgIE1hdGguYXRhbjIoLVFbMV0sIFFbMF0pXG4gICAgXTtcbiAgICBpZiAoIXJlc3VsdC5yb3RhdGVbMF0pIHtcbiAgICAgICAgcmVzdWx0LnJvdGF0ZVswXSA9IDA7XG4gICAgICAgIHJlc3VsdC5yb3RhdGVbMl0gPSBNYXRoLmF0YW4yKFFbNF0sIFFbNV0pO1xuICAgIH1cbiAgICByZXN1bHQuc2NhbGUgPSBbXG4gICAgICAgIFJbMF0sXG4gICAgICAgIFJbNV0sXG4gICAgICAgIFJbMTBdXG4gICAgXTtcbiAgICByZXN1bHQuc2tldyA9IFtcbiAgICAgICAgTWF0aC5hdGFuMihSWzldLCByZXN1bHQuc2NhbGVbMl0pLFxuICAgICAgICBNYXRoLmF0YW4yKFJbOF0sIHJlc3VsdC5zY2FsZVsyXSksXG4gICAgICAgIE1hdGguYXRhbjIoUls0XSwgcmVzdWx0LnNjYWxlWzBdKVxuICAgIF07XG4gICAgaWYgKE1hdGguYWJzKHJlc3VsdC5yb3RhdGVbMF0pICsgTWF0aC5hYnMocmVzdWx0LnJvdGF0ZVsyXSkgPiAxLjUgKiBNYXRoLlBJKSB7XG4gICAgICAgIHJlc3VsdC5yb3RhdGVbMV0gPSBNYXRoLlBJIC0gcmVzdWx0LnJvdGF0ZVsxXTtcbiAgICAgICAgaWYgKHJlc3VsdC5yb3RhdGVbMV0gPiBNYXRoLlBJKVxuICAgICAgICAgICAgcmVzdWx0LnJvdGF0ZVsxXSAtPSAyICogTWF0aC5QSTtcbiAgICAgICAgaWYgKHJlc3VsdC5yb3RhdGVbMV0gPCAtTWF0aC5QSSlcbiAgICAgICAgICAgIHJlc3VsdC5yb3RhdGVbMV0gKz0gMiAqIE1hdGguUEk7XG4gICAgICAgIGlmIChyZXN1bHQucm90YXRlWzBdIDwgMClcbiAgICAgICAgICAgIHJlc3VsdC5yb3RhdGVbMF0gKz0gTWF0aC5QSTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmVzdWx0LnJvdGF0ZVswXSAtPSBNYXRoLlBJO1xuICAgICAgICBpZiAocmVzdWx0LnJvdGF0ZVsyXSA8IDApXG4gICAgICAgICAgICByZXN1bHQucm90YXRlWzJdICs9IE1hdGguUEk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJlc3VsdC5yb3RhdGVbMl0gLT0gTWF0aC5QSTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn07XG5UcmFuc2Zvcm0uYXZlcmFnZSA9IGZ1bmN0aW9uIGF2ZXJhZ2UoTTEsIE0yLCB0KSB7XG4gICAgdCA9IHQgPT09IHVuZGVmaW5lZCA/IDAuNSA6IHQ7XG4gICAgdmFyIHNwZWNNMSA9IFRyYW5zZm9ybS5pbnRlcnByZXQoTTEpO1xuICAgIHZhciBzcGVjTTIgPSBUcmFuc2Zvcm0uaW50ZXJwcmV0KE0yKTtcbiAgICB2YXIgc3BlY0F2ZyA9IHtcbiAgICAgICAgICAgIHRyYW5zbGF0ZTogW1xuICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICAwXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgcm90YXRlOiBbXG4gICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgIDBcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBzY2FsZTogW1xuICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICAwXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgc2tldzogW1xuICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICAwXG4gICAgICAgICAgICBdXG4gICAgICAgIH07XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCAzOyBpKyspIHtcbiAgICAgICAgc3BlY0F2Zy50cmFuc2xhdGVbaV0gPSAoMSAtIHQpICogc3BlY00xLnRyYW5zbGF0ZVtpXSArIHQgKiBzcGVjTTIudHJhbnNsYXRlW2ldO1xuICAgICAgICBzcGVjQXZnLnJvdGF0ZVtpXSA9ICgxIC0gdCkgKiBzcGVjTTEucm90YXRlW2ldICsgdCAqIHNwZWNNMi5yb3RhdGVbaV07XG4gICAgICAgIHNwZWNBdmcuc2NhbGVbaV0gPSAoMSAtIHQpICogc3BlY00xLnNjYWxlW2ldICsgdCAqIHNwZWNNMi5zY2FsZVtpXTtcbiAgICAgICAgc3BlY0F2Zy5za2V3W2ldID0gKDEgLSB0KSAqIHNwZWNNMS5za2V3W2ldICsgdCAqIHNwZWNNMi5za2V3W2ldO1xuICAgIH1cbiAgICByZXR1cm4gVHJhbnNmb3JtLmJ1aWxkKHNwZWNBdmcpO1xufTtcblRyYW5zZm9ybS5idWlsZCA9IGZ1bmN0aW9uIGJ1aWxkKHNwZWMpIHtcbiAgICB2YXIgc2NhbGVNYXRyaXggPSBUcmFuc2Zvcm0uc2NhbGUoc3BlYy5zY2FsZVswXSwgc3BlYy5zY2FsZVsxXSwgc3BlYy5zY2FsZVsyXSk7XG4gICAgdmFyIHNrZXdNYXRyaXggPSBUcmFuc2Zvcm0uc2tldyhzcGVjLnNrZXdbMF0sIHNwZWMuc2tld1sxXSwgc3BlYy5za2V3WzJdKTtcbiAgICB2YXIgcm90YXRlTWF0cml4ID0gVHJhbnNmb3JtLnJvdGF0ZShzcGVjLnJvdGF0ZVswXSwgc3BlYy5yb3RhdGVbMV0sIHNwZWMucm90YXRlWzJdKTtcbiAgICByZXR1cm4gVHJhbnNmb3JtLnRoZW5Nb3ZlKFRyYW5zZm9ybS5tdWx0aXBseShUcmFuc2Zvcm0ubXVsdGlwbHkocm90YXRlTWF0cml4LCBza2V3TWF0cml4KSwgc2NhbGVNYXRyaXgpLCBzcGVjLnRyYW5zbGF0ZSk7XG59O1xuVHJhbnNmb3JtLmVxdWFscyA9IGZ1bmN0aW9uIGVxdWFscyhhLCBiKSB7XG4gICAgcmV0dXJuICFUcmFuc2Zvcm0ubm90RXF1YWxzKGEsIGIpO1xufTtcblRyYW5zZm9ybS5ub3RFcXVhbHMgPSBmdW5jdGlvbiBub3RFcXVhbHMoYSwgYikge1xuICAgIGlmIChhID09PSBiKVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgcmV0dXJuICEoYSAmJiBiKSB8fCBhWzEyXSAhPT0gYlsxMl0gfHwgYVsxM10gIT09IGJbMTNdIHx8IGFbMTRdICE9PSBiWzE0XSB8fCBhWzBdICE9PSBiWzBdIHx8IGFbMV0gIT09IGJbMV0gfHwgYVsyXSAhPT0gYlsyXSB8fCBhWzRdICE9PSBiWzRdIHx8IGFbNV0gIT09IGJbNV0gfHwgYVs2XSAhPT0gYls2XSB8fCBhWzhdICE9PSBiWzhdIHx8IGFbOV0gIT09IGJbOV0gfHwgYVsxMF0gIT09IGJbMTBdO1xufTtcblRyYW5zZm9ybS5ub3JtYWxpemVSb3RhdGlvbiA9IGZ1bmN0aW9uIG5vcm1hbGl6ZVJvdGF0aW9uKHJvdGF0aW9uKSB7XG4gICAgdmFyIHJlc3VsdCA9IHJvdGF0aW9uLnNsaWNlKDApO1xuICAgIGlmIChyZXN1bHRbMF0gPT09IE1hdGguUEkgKiAwLjUgfHwgcmVzdWx0WzBdID09PSAtTWF0aC5QSSAqIDAuNSkge1xuICAgICAgICByZXN1bHRbMF0gPSAtcmVzdWx0WzBdO1xuICAgICAgICByZXN1bHRbMV0gPSBNYXRoLlBJIC0gcmVzdWx0WzFdO1xuICAgICAgICByZXN1bHRbMl0gLT0gTWF0aC5QSTtcbiAgICB9XG4gICAgaWYgKHJlc3VsdFswXSA+IE1hdGguUEkgKiAwLjUpIHtcbiAgICAgICAgcmVzdWx0WzBdID0gcmVzdWx0WzBdIC0gTWF0aC5QSTtcbiAgICAgICAgcmVzdWx0WzFdID0gTWF0aC5QSSAtIHJlc3VsdFsxXTtcbiAgICAgICAgcmVzdWx0WzJdIC09IE1hdGguUEk7XG4gICAgfVxuICAgIGlmIChyZXN1bHRbMF0gPCAtTWF0aC5QSSAqIDAuNSkge1xuICAgICAgICByZXN1bHRbMF0gPSByZXN1bHRbMF0gKyBNYXRoLlBJO1xuICAgICAgICByZXN1bHRbMV0gPSAtTWF0aC5QSSAtIHJlc3VsdFsxXTtcbiAgICAgICAgcmVzdWx0WzJdIC09IE1hdGguUEk7XG4gICAgfVxuICAgIHdoaWxlIChyZXN1bHRbMV0gPCAtTWF0aC5QSSlcbiAgICAgICAgcmVzdWx0WzFdICs9IDIgKiBNYXRoLlBJO1xuICAgIHdoaWxlIChyZXN1bHRbMV0gPj0gTWF0aC5QSSlcbiAgICAgICAgcmVzdWx0WzFdIC09IDIgKiBNYXRoLlBJO1xuICAgIHdoaWxlIChyZXN1bHRbMl0gPCAtTWF0aC5QSSlcbiAgICAgICAgcmVzdWx0WzJdICs9IDIgKiBNYXRoLlBJO1xuICAgIHdoaWxlIChyZXN1bHRbMl0gPj0gTWF0aC5QSSlcbiAgICAgICAgcmVzdWx0WzJdIC09IDIgKiBNYXRoLlBJO1xuICAgIHJldHVybiByZXN1bHQ7XG59O1xuVHJhbnNmb3JtLmluRnJvbnQgPSBbXG4gICAgMSxcbiAgICAwLFxuICAgIDAsXG4gICAgMCxcbiAgICAwLFxuICAgIDEsXG4gICAgMCxcbiAgICAwLFxuICAgIDAsXG4gICAgMCxcbiAgICAxLFxuICAgIDAsXG4gICAgMCxcbiAgICAwLFxuICAgIDAuMDAxLFxuICAgIDFcbl07XG5UcmFuc2Zvcm0uYmVoaW5kID0gW1xuICAgIDEsXG4gICAgMCxcbiAgICAwLFxuICAgIDAsXG4gICAgMCxcbiAgICAxLFxuICAgIDAsXG4gICAgMCxcbiAgICAwLFxuICAgIDAsXG4gICAgMSxcbiAgICAwLFxuICAgIDAsXG4gICAgMCxcbiAgICAtMC4wMDEsXG4gICAgMVxuXTtcbm1vZHVsZS5leHBvcnRzID0gVHJhbnNmb3JtOyIsInZhciBFdmVudEhhbmRsZXIgPSByZXF1aXJlKCcuL0V2ZW50SGFuZGxlcicpO1xudmFyIE9wdGlvbnNNYW5hZ2VyID0gcmVxdWlyZSgnLi9PcHRpb25zTWFuYWdlcicpO1xudmFyIFJlbmRlck5vZGUgPSByZXF1aXJlKCcuL1JlbmRlck5vZGUnKTtcbnZhciBVdGlsaXR5ID0gcmVxdWlyZSgnLi4vdXRpbGl0aWVzL1V0aWxpdHknKTtcbmZ1bmN0aW9uIFZpZXcob3B0aW9ucykge1xuICAgIHRoaXMuX25vZGUgPSBuZXcgUmVuZGVyTm9kZSgpO1xuICAgIHRoaXMuX2V2ZW50SW5wdXQgPSBuZXcgRXZlbnRIYW5kbGVyKCk7XG4gICAgdGhpcy5fZXZlbnRPdXRwdXQgPSBuZXcgRXZlbnRIYW5kbGVyKCk7XG4gICAgRXZlbnRIYW5kbGVyLnNldElucHV0SGFuZGxlcih0aGlzLCB0aGlzLl9ldmVudElucHV0KTtcbiAgICBFdmVudEhhbmRsZXIuc2V0T3V0cHV0SGFuZGxlcih0aGlzLCB0aGlzLl9ldmVudE91dHB1dCk7XG4gICAgdGhpcy5vcHRpb25zID0gVXRpbGl0eS5jbG9uZSh0aGlzLmNvbnN0cnVjdG9yLkRFRkFVTFRfT1BUSU9OUyB8fCBWaWV3LkRFRkFVTFRfT1BUSU9OUyk7XG4gICAgdGhpcy5fb3B0aW9uc01hbmFnZXIgPSBuZXcgT3B0aW9uc01hbmFnZXIodGhpcy5vcHRpb25zKTtcbiAgICBpZiAob3B0aW9ucylcbiAgICAgICAgdGhpcy5zZXRPcHRpb25zKG9wdGlvbnMpO1xufVxuVmlldy5ERUZBVUxUX09QVElPTlMgPSB7fTtcblZpZXcucHJvdG90eXBlLmdldE9wdGlvbnMgPSBmdW5jdGlvbiBnZXRPcHRpb25zKGtleSkge1xuICAgIHJldHVybiB0aGlzLl9vcHRpb25zTWFuYWdlci5nZXRPcHRpb25zKGtleSk7XG59O1xuVmlldy5wcm90b3R5cGUuc2V0T3B0aW9ucyA9IGZ1bmN0aW9uIHNldE9wdGlvbnMob3B0aW9ucykge1xuICAgIHRoaXMuX29wdGlvbnNNYW5hZ2VyLnBhdGNoKG9wdGlvbnMpO1xufTtcblZpZXcucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uIGFkZCgpIHtcbiAgICByZXR1cm4gdGhpcy5fbm9kZS5hZGQuYXBwbHkodGhpcy5fbm9kZSwgYXJndW1lbnRzKTtcbn07XG5WaWV3LnByb3RvdHlwZS5fYWRkID0gVmlldy5wcm90b3R5cGUuYWRkO1xuVmlldy5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgIHJldHVybiB0aGlzLl9ub2RlLnJlbmRlcigpO1xufTtcblZpZXcucHJvdG90eXBlLmdldFNpemUgPSBmdW5jdGlvbiBnZXRTaXplKCkge1xuICAgIGlmICh0aGlzLl9ub2RlICYmIHRoaXMuX25vZGUuZ2V0U2l6ZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fbm9kZS5nZXRTaXplLmFwcGx5KHRoaXMuX25vZGUsIGFyZ3VtZW50cykgfHwgdGhpcy5vcHRpb25zLnNpemU7XG4gICAgfSBlbHNlXG4gICAgICAgIHJldHVybiB0aGlzLm9wdGlvbnMuc2l6ZTtcbn07XG5tb2R1bGUuZXhwb3J0cyA9IFZpZXc7IiwidmFyIGNzcyA9IFwiLyogVGhpcyBTb3VyY2UgQ29kZSBGb3JtIGlzIHN1YmplY3QgdG8gdGhlIHRlcm1zIG9mIHRoZSBNb3ppbGxhIFB1YmxpY1xcbiAqIExpY2Vuc2UsIHYuIDIuMC4gSWYgYSBjb3B5IG9mIHRoZSBNUEwgd2FzIG5vdCBkaXN0cmlidXRlZCB3aXRoIHRoaXNcXG4gKiBmaWxlLCBZb3UgY2FuIG9idGFpbiBvbmUgYXQgaHR0cDovL21vemlsbGEub3JnL01QTC8yLjAvLlxcbiAqXFxuICogT3duZXI6IG1hcmtAZmFtby51c1xcbiAqIEBsaWNlbnNlIE1QTCAyLjBcXG4gKiBAY29weXJpZ2h0IEZhbW91cyBJbmR1c3RyaWVzLCBJbmMuIDIwMTRcXG4gKi9cXG5cXG4uZmFtb3VzLXJvb3Qge1xcbiAgICB3aWR0aDogMTAwJTtcXG4gICAgaGVpZ2h0OiAxMDAlO1xcbiAgICBtYXJnaW46IDBweDtcXG4gICAgcGFkZGluZzogMHB4O1xcbiAgICBvdmVyZmxvdzogaGlkZGVuO1xcbiAgICAtd2Via2l0LXRyYW5zZm9ybS1zdHlsZTogcHJlc2VydmUtM2Q7XFxuICAgIHRyYW5zZm9ybS1zdHlsZTogcHJlc2VydmUtM2Q7XFxufVxcblxcbi5mYW1vdXMtY29udGFpbmVyLCAuZmFtb3VzLWdyb3VwIHtcXG4gICAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgICB0b3A6IDBweDtcXG4gICAgbGVmdDogMHB4O1xcbiAgICBib3R0b206IDBweDtcXG4gICAgcmlnaHQ6IDBweDtcXG4gICAgb3ZlcmZsb3c6IHZpc2libGU7XFxuICAgIC13ZWJraXQtdHJhbnNmb3JtLXN0eWxlOiBwcmVzZXJ2ZS0zZDtcXG4gICAgdHJhbnNmb3JtLXN0eWxlOiBwcmVzZXJ2ZS0zZDtcXG4gICAgLXdlYmtpdC1iYWNrZmFjZS12aXNpYmlsaXR5OiB2aXNpYmxlO1xcbiAgICBiYWNrZmFjZS12aXNpYmlsaXR5OiB2aXNpYmxlO1xcbiAgICBwb2ludGVyLWV2ZW50czogbm9uZTtcXG59XFxuXFxuLmZhbW91cy1ncm91cCB7XFxuICAgIHdpZHRoOiAwcHg7XFxuICAgIGhlaWdodDogMHB4O1xcbiAgICBtYXJnaW46IDBweDtcXG4gICAgcGFkZGluZzogMHB4O1xcbiAgICAtd2Via2l0LXRyYW5zZm9ybS1zdHlsZTogcHJlc2VydmUtM2Q7XFxuICAgIHRyYW5zZm9ybS1zdHlsZTogcHJlc2VydmUtM2Q7XFxufVxcblxcbi5mYW1vdXMtc3VyZmFjZSB7XFxuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gICAgLXdlYmtpdC10cmFuc2Zvcm0tb3JpZ2luOiBjZW50ZXIgY2VudGVyO1xcbiAgICB0cmFuc2Zvcm0tb3JpZ2luOiBjZW50ZXIgY2VudGVyO1xcbiAgICAtd2Via2l0LWJhY2tmYWNlLXZpc2liaWxpdHk6IGhpZGRlbjtcXG4gICAgYmFja2ZhY2UtdmlzaWJpbGl0eTogaGlkZGVuO1xcbiAgICAtd2Via2l0LXRyYW5zZm9ybS1zdHlsZTogcHJlc2VydmUtM2Q7XFxuICAgIHRyYW5zZm9ybS1zdHlsZTogcHJlc2VydmUtM2Q7XFxuICAgIC13ZWJraXQtYm94LXNpemluZzogYm9yZGVyLWJveDtcXG4gICAgLW1vei1ib3gtc2l6aW5nOiBib3JkZXItYm94O1xcbiAgICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xcbiAgICAtd2Via2l0LXRhcC1oaWdobGlnaHQtY29sb3I6IHRyYW5zcGFyZW50O1xcbiAgICBwb2ludGVyLWV2ZW50czogYXV0bztcXG59XFxuXFxuLmZhbW91cy1jb250YWluZXItZ3JvdXAge1xcbiAgICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICAgIHdpZHRoOiAxMDAlO1xcbiAgICBoZWlnaHQ6IDEwMCU7XFxufVxcblwiOyAocmVxdWlyZShcIi9Vc2Vycy9taWNoYWVseGlhL0ZhbW91cy9WYW5pbGxhL2N1YmUtd2FsbHMtM2Qvbm9kZV9tb2R1bGVzL2Nzc2lmeVwiKSkoY3NzKTsgbW9kdWxlLmV4cG9ydHMgPSBjc3M7IiwidmFyIEV2ZW50SGFuZGxlciA9IHJlcXVpcmUoJy4uL2NvcmUvRXZlbnRIYW5kbGVyJyk7XG5mdW5jdGlvbiBHZW5lcmljU3luYyhzeW5jcywgb3B0aW9ucykge1xuICAgIHRoaXMuX2V2ZW50SW5wdXQgPSBuZXcgRXZlbnRIYW5kbGVyKCk7XG4gICAgdGhpcy5fZXZlbnRPdXRwdXQgPSBuZXcgRXZlbnRIYW5kbGVyKCk7XG4gICAgRXZlbnRIYW5kbGVyLnNldElucHV0SGFuZGxlcih0aGlzLCB0aGlzLl9ldmVudElucHV0KTtcbiAgICBFdmVudEhhbmRsZXIuc2V0T3V0cHV0SGFuZGxlcih0aGlzLCB0aGlzLl9ldmVudE91dHB1dCk7XG4gICAgdGhpcy5fc3luY3MgPSB7fTtcbiAgICBpZiAoc3luY3MpXG4gICAgICAgIHRoaXMuYWRkU3luYyhzeW5jcyk7XG4gICAgaWYgKG9wdGlvbnMpXG4gICAgICAgIHRoaXMuc2V0T3B0aW9ucyhvcHRpb25zKTtcbn1cbkdlbmVyaWNTeW5jLkRJUkVDVElPTl9YID0gMDtcbkdlbmVyaWNTeW5jLkRJUkVDVElPTl9ZID0gMTtcbkdlbmVyaWNTeW5jLkRJUkVDVElPTl9aID0gMjtcbnZhciByZWdpc3RyeSA9IHt9O1xuR2VuZXJpY1N5bmMucmVnaXN0ZXIgPSBmdW5jdGlvbiByZWdpc3RlcihzeW5jT2JqZWN0KSB7XG4gICAgZm9yICh2YXIga2V5IGluIHN5bmNPYmplY3QpIHtcbiAgICAgICAgaWYgKHJlZ2lzdHJ5W2tleV0pIHtcbiAgICAgICAgICAgIGlmIChyZWdpc3RyeVtrZXldID09PSBzeW5jT2JqZWN0W2tleV0pXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcigndGhpcyBrZXkgaXMgcmVnaXN0ZXJlZCB0byBhIGRpZmZlcmVudCBzeW5jIGNsYXNzJyk7XG4gICAgICAgIH0gZWxzZVxuICAgICAgICAgICAgcmVnaXN0cnlba2V5XSA9IHN5bmNPYmplY3Rba2V5XTtcbiAgICB9XG59O1xuR2VuZXJpY1N5bmMucHJvdG90eXBlLnNldE9wdGlvbnMgPSBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgIGZvciAodmFyIGtleSBpbiB0aGlzLl9zeW5jcykge1xuICAgICAgICB0aGlzLl9zeW5jc1trZXldLnNldE9wdGlvbnMob3B0aW9ucyk7XG4gICAgfVxufTtcbkdlbmVyaWNTeW5jLnByb3RvdHlwZS5waXBlU3luYyA9IGZ1bmN0aW9uIHBpcGVUb1N5bmMoa2V5KSB7XG4gICAgdmFyIHN5bmMgPSB0aGlzLl9zeW5jc1trZXldO1xuICAgIHRoaXMuX2V2ZW50SW5wdXQucGlwZShzeW5jKTtcbiAgICBzeW5jLnBpcGUodGhpcy5fZXZlbnRPdXRwdXQpO1xufTtcbkdlbmVyaWNTeW5jLnByb3RvdHlwZS51bnBpcGVTeW5jID0gZnVuY3Rpb24gdW5waXBlRnJvbVN5bmMoa2V5KSB7XG4gICAgdmFyIHN5bmMgPSB0aGlzLl9zeW5jc1trZXldO1xuICAgIHRoaXMuX2V2ZW50SW5wdXQudW5waXBlKHN5bmMpO1xuICAgIHN5bmMudW5waXBlKHRoaXMuX2V2ZW50T3V0cHV0KTtcbn07XG5mdW5jdGlvbiBfYWRkU2luZ2xlU3luYyhrZXksIG9wdGlvbnMpIHtcbiAgICBpZiAoIXJlZ2lzdHJ5W2tleV0pXG4gICAgICAgIHJldHVybjtcbiAgICB0aGlzLl9zeW5jc1trZXldID0gbmV3IHJlZ2lzdHJ5W2tleV0ob3B0aW9ucyk7XG4gICAgdGhpcy5waXBlU3luYyhrZXkpO1xufVxuR2VuZXJpY1N5bmMucHJvdG90eXBlLmFkZFN5bmMgPSBmdW5jdGlvbiBhZGRTeW5jKHN5bmNzKSB7XG4gICAgaWYgKHN5bmNzIGluc3RhbmNlb2YgQXJyYXkpXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc3luY3MubGVuZ3RoOyBpKyspXG4gICAgICAgICAgICBfYWRkU2luZ2xlU3luYy5jYWxsKHRoaXMsIHN5bmNzW2ldKTtcbiAgICBlbHNlIGlmIChzeW5jcyBpbnN0YW5jZW9mIE9iamVjdClcbiAgICAgICAgZm9yICh2YXIga2V5IGluIHN5bmNzKVxuICAgICAgICAgICAgX2FkZFNpbmdsZVN5bmMuY2FsbCh0aGlzLCBrZXksIHN5bmNzW2tleV0pO1xufTtcbm1vZHVsZS5leHBvcnRzID0gR2VuZXJpY1N5bmM7IiwidmFyIEV2ZW50SGFuZGxlciA9IHJlcXVpcmUoJy4uL2NvcmUvRXZlbnRIYW5kbGVyJyk7XG52YXIgT3B0aW9uc01hbmFnZXIgPSByZXF1aXJlKCcuLi9jb3JlL09wdGlvbnNNYW5hZ2VyJyk7XG5mdW5jdGlvbiBNb3VzZVN5bmMob3B0aW9ucykge1xuICAgIHRoaXMub3B0aW9ucyA9IE9iamVjdC5jcmVhdGUoTW91c2VTeW5jLkRFRkFVTFRfT1BUSU9OUyk7XG4gICAgdGhpcy5fb3B0aW9uc01hbmFnZXIgPSBuZXcgT3B0aW9uc01hbmFnZXIodGhpcy5vcHRpb25zKTtcbiAgICBpZiAob3B0aW9ucylcbiAgICAgICAgdGhpcy5zZXRPcHRpb25zKG9wdGlvbnMpO1xuICAgIHRoaXMuX2V2ZW50SW5wdXQgPSBuZXcgRXZlbnRIYW5kbGVyKCk7XG4gICAgdGhpcy5fZXZlbnRPdXRwdXQgPSBuZXcgRXZlbnRIYW5kbGVyKCk7XG4gICAgRXZlbnRIYW5kbGVyLnNldElucHV0SGFuZGxlcih0aGlzLCB0aGlzLl9ldmVudElucHV0KTtcbiAgICBFdmVudEhhbmRsZXIuc2V0T3V0cHV0SGFuZGxlcih0aGlzLCB0aGlzLl9ldmVudE91dHB1dCk7XG4gICAgdGhpcy5fZXZlbnRJbnB1dC5vbignbW91c2Vkb3duJywgX2hhbmRsZVN0YXJ0LmJpbmQodGhpcykpO1xuICAgIHRoaXMuX2V2ZW50SW5wdXQub24oJ21vdXNlbW92ZScsIF9oYW5kbGVNb3ZlLmJpbmQodGhpcykpO1xuICAgIHRoaXMuX2V2ZW50SW5wdXQub24oJ21vdXNldXAnLCBfaGFuZGxlRW5kLmJpbmQodGhpcykpO1xuICAgIGlmICh0aGlzLm9wdGlvbnMucHJvcG9nYXRlKVxuICAgICAgICB0aGlzLl9ldmVudElucHV0Lm9uKCdtb3VzZWxlYXZlJywgX2hhbmRsZUxlYXZlLmJpbmQodGhpcykpO1xuICAgIGVsc2VcbiAgICAgICAgdGhpcy5fZXZlbnRJbnB1dC5vbignbW91c2VsZWF2ZScsIF9oYW5kbGVFbmQuYmluZCh0aGlzKSk7XG4gICAgdGhpcy5fcGF5bG9hZCA9IHtcbiAgICAgICAgZGVsdGE6IG51bGwsXG4gICAgICAgIHBvc2l0aW9uOiBudWxsLFxuICAgICAgICB2ZWxvY2l0eTogbnVsbCxcbiAgICAgICAgY2xpZW50WDogMCxcbiAgICAgICAgY2xpZW50WTogMCxcbiAgICAgICAgb2Zmc2V0WDogMCxcbiAgICAgICAgb2Zmc2V0WTogMFxuICAgIH07XG4gICAgdGhpcy5fcG9zaXRpb25IaXN0b3J5ID0gW107XG4gICAgdGhpcy5fcG9zaXRpb24gPSBudWxsO1xuICAgIHRoaXMuX3ByZXZDb29yZCA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLl9wcmV2VGltZSA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLl9kb3duID0gZmFsc2U7XG4gICAgdGhpcy5fbW92ZWQgPSBmYWxzZTtcbiAgICB0aGlzLl9kb2N1bWVudEFjdGl2ZSA9IGZhbHNlO1xufVxuTW91c2VTeW5jLkRFRkFVTFRfT1BUSU9OUyA9IHtcbiAgICBkaXJlY3Rpb246IHVuZGVmaW5lZCxcbiAgICByYWlsczogZmFsc2UsXG4gICAgc2NhbGU6IDEsXG4gICAgcHJvcG9nYXRlOiB0cnVlLFxuICAgIHZlbG9jaXR5U2FtcGxlTGVuZ3RoOiAxMCxcbiAgICBwcmV2ZW50RGVmYXVsdDogdHJ1ZVxufTtcbk1vdXNlU3luYy5ESVJFQ1RJT05fWCA9IDA7XG5Nb3VzZVN5bmMuRElSRUNUSU9OX1kgPSAxO1xudmFyIE1JTklNVU1fVElDS19USU1FID0gODtcbmZ1bmN0aW9uIF9oYW5kbGVTdGFydChldmVudCkge1xuICAgIHZhciBkZWx0YTtcbiAgICB2YXIgdmVsb2NpdHk7XG4gICAgaWYgKHRoaXMub3B0aW9ucy5wcmV2ZW50RGVmYXVsdClcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICB2YXIgeCA9IGV2ZW50LmNsaWVudFg7XG4gICAgdmFyIHkgPSBldmVudC5jbGllbnRZO1xuICAgIHRoaXMuX3ByZXZDb29yZCA9IFtcbiAgICAgICAgeCxcbiAgICAgICAgeVxuICAgIF07XG4gICAgdGhpcy5fcHJldlRpbWUgPSBEYXRlLm5vdygpO1xuICAgIHRoaXMuX2Rvd24gPSB0cnVlO1xuICAgIHRoaXMuX21vdmUgPSBmYWxzZTtcbiAgICBpZiAodGhpcy5vcHRpb25zLmRpcmVjdGlvbiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHRoaXMuX3Bvc2l0aW9uID0gMDtcbiAgICAgICAgZGVsdGEgPSAwO1xuICAgICAgICB2ZWxvY2l0eSA9IDA7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fcG9zaXRpb24gPSBbXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMFxuICAgICAgICBdO1xuICAgICAgICBkZWx0YSA9IFtcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAwXG4gICAgICAgIF07XG4gICAgICAgIHZlbG9jaXR5ID0gW1xuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDBcbiAgICAgICAgXTtcbiAgICB9XG4gICAgdmFyIHBheWxvYWQgPSB0aGlzLl9wYXlsb2FkO1xuICAgIHBheWxvYWQuZGVsdGEgPSBkZWx0YTtcbiAgICBwYXlsb2FkLnBvc2l0aW9uID0gdGhpcy5fcG9zaXRpb247XG4gICAgcGF5bG9hZC52ZWxvY2l0eSA9IHZlbG9jaXR5O1xuICAgIHBheWxvYWQuY2xpZW50WCA9IHg7XG4gICAgcGF5bG9hZC5jbGllbnRZID0geTtcbiAgICBwYXlsb2FkLm9mZnNldFggPSBldmVudC5vZmZzZXRYO1xuICAgIHBheWxvYWQub2Zmc2V0WSA9IGV2ZW50Lm9mZnNldFk7XG4gICAgdGhpcy5fcG9zaXRpb25IaXN0b3J5LnB1c2goe1xuICAgICAgICBwb3NpdGlvbjogcGF5bG9hZC5wb3NpdGlvbi5zbGljZSA/IHBheWxvYWQucG9zaXRpb24uc2xpY2UoMCkgOiBwYXlsb2FkLnBvc2l0aW9uLFxuICAgICAgICB0aW1lOiB0aGlzLl9wcmV2VGltZVxuICAgIH0pO1xuICAgIHRoaXMuX2V2ZW50T3V0cHV0LmVtaXQoJ3N0YXJ0JywgcGF5bG9hZCk7XG4gICAgdGhpcy5fZG9jdW1lbnRBY3RpdmUgPSBmYWxzZTtcbn1cbmZ1bmN0aW9uIF9oYW5kbGVNb3ZlKGV2ZW50KSB7XG4gICAgaWYgKCF0aGlzLl9wcmV2Q29vcmQpXG4gICAgICAgIHJldHVybjtcbiAgICB2YXIgcHJldkNvb3JkID0gdGhpcy5fcHJldkNvb3JkO1xuICAgIHZhciBwcmV2VGltZSA9IHRoaXMuX3ByZXZUaW1lO1xuICAgIHZhciB4ID0gZXZlbnQuY2xpZW50WDtcbiAgICB2YXIgeSA9IGV2ZW50LmNsaWVudFk7XG4gICAgdmFyIGN1cnJUaW1lID0gRGF0ZS5ub3coKTtcbiAgICB2YXIgZGlmZlggPSB4IC0gcHJldkNvb3JkWzBdO1xuICAgIHZhciBkaWZmWSA9IHkgLSBwcmV2Q29vcmRbMV07XG4gICAgaWYgKHRoaXMub3B0aW9ucy5yYWlscykge1xuICAgICAgICBpZiAoTWF0aC5hYnMoZGlmZlgpID4gTWF0aC5hYnMoZGlmZlkpKVxuICAgICAgICAgICAgZGlmZlkgPSAwO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBkaWZmWCA9IDA7XG4gICAgfVxuICAgIHZhciBkaWZmVGltZSA9IE1hdGgubWF4KGN1cnJUaW1lIC0gdGhpcy5fcG9zaXRpb25IaXN0b3J5WzBdLnRpbWUsIE1JTklNVU1fVElDS19USU1FKTtcbiAgICB2YXIgc2NhbGUgPSB0aGlzLm9wdGlvbnMuc2NhbGU7XG4gICAgdmFyIG5leHRWZWw7XG4gICAgdmFyIG5leHREZWx0YTtcbiAgICBpZiAodGhpcy5vcHRpb25zLmRpcmVjdGlvbiA9PT0gTW91c2VTeW5jLkRJUkVDVElPTl9YKSB7XG4gICAgICAgIG5leHREZWx0YSA9IHNjYWxlICogZGlmZlg7XG4gICAgICAgIHRoaXMuX3Bvc2l0aW9uICs9IG5leHREZWx0YTtcbiAgICAgICAgbmV4dFZlbCA9IHNjYWxlICogKHRoaXMuX3Bvc2l0aW9uIC0gdGhpcy5fcG9zaXRpb25IaXN0b3J5WzBdLnBvc2l0aW9uKSAvIGRpZmZUaW1lO1xuICAgIH0gZWxzZSBpZiAodGhpcy5vcHRpb25zLmRpcmVjdGlvbiA9PT0gTW91c2VTeW5jLkRJUkVDVElPTl9ZKSB7XG4gICAgICAgIG5leHREZWx0YSA9IHNjYWxlICogZGlmZlk7XG4gICAgICAgIHRoaXMuX3Bvc2l0aW9uICs9IG5leHREZWx0YTtcbiAgICAgICAgbmV4dFZlbCA9IHNjYWxlICogKHRoaXMuX3Bvc2l0aW9uIC0gdGhpcy5fcG9zaXRpb25IaXN0b3J5WzBdLnBvc2l0aW9uKSAvIGRpZmZUaW1lO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIG5leHREZWx0YSA9IFtcbiAgICAgICAgICAgIHNjYWxlICogZGlmZlgsXG4gICAgICAgICAgICBzY2FsZSAqIGRpZmZZXG4gICAgICAgIF07XG4gICAgICAgIG5leHRWZWwgPSBbXG4gICAgICAgICAgICBzY2FsZSAqICh0aGlzLl9wb3NpdGlvblswXSAtIHRoaXMuX3Bvc2l0aW9uSGlzdG9yeVswXS5wb3NpdGlvblswXSkgLyBkaWZmVGltZSxcbiAgICAgICAgICAgIHNjYWxlICogKHRoaXMuX3Bvc2l0aW9uWzFdIC0gdGhpcy5fcG9zaXRpb25IaXN0b3J5WzBdLnBvc2l0aW9uWzFdKSAvIGRpZmZUaW1lXG4gICAgICAgIF07XG4gICAgICAgIHRoaXMuX3Bvc2l0aW9uWzBdICs9IG5leHREZWx0YVswXTtcbiAgICAgICAgdGhpcy5fcG9zaXRpb25bMV0gKz0gbmV4dERlbHRhWzFdO1xuICAgIH1cbiAgICB2YXIgcGF5bG9hZCA9IHRoaXMuX3BheWxvYWQ7XG4gICAgcGF5bG9hZC5kZWx0YSA9IG5leHREZWx0YTtcbiAgICBwYXlsb2FkLnBvc2l0aW9uID0gdGhpcy5fcG9zaXRpb247XG4gICAgcGF5bG9hZC52ZWxvY2l0eSA9IG5leHRWZWw7XG4gICAgcGF5bG9hZC5jbGllbnRYID0geDtcbiAgICBwYXlsb2FkLmNsaWVudFkgPSB5O1xuICAgIHBheWxvYWQub2Zmc2V0WCA9IGV2ZW50Lm9mZnNldFg7XG4gICAgcGF5bG9hZC5vZmZzZXRZID0gZXZlbnQub2Zmc2V0WTtcbiAgICBpZiAodGhpcy5fcG9zaXRpb25IaXN0b3J5Lmxlbmd0aCA9PT0gdGhpcy5vcHRpb25zLnZlbG9jaXR5U2FtcGxlTGVuZ3RoKSB7XG4gICAgICAgIHRoaXMuX3Bvc2l0aW9uSGlzdG9yeS5zaGlmdCgpO1xuICAgIH1cbiAgICB0aGlzLl9wb3NpdGlvbkhpc3RvcnkucHVzaCh7XG4gICAgICAgIHBvc2l0aW9uOiBwYXlsb2FkLnBvc2l0aW9uLnNsaWNlID8gcGF5bG9hZC5wb3NpdGlvbi5zbGljZSgwKSA6IHBheWxvYWQucG9zaXRpb24sXG4gICAgICAgIHRpbWU6IGN1cnJUaW1lXG4gICAgfSk7XG4gICAgdGhpcy5fZXZlbnRPdXRwdXQuZW1pdCgndXBkYXRlJywgcGF5bG9hZCk7XG4gICAgdGhpcy5fcHJldkNvb3JkID0gW1xuICAgICAgICB4LFxuICAgICAgICB5XG4gICAgXTtcbiAgICB0aGlzLl9wcmV2VGltZSA9IGN1cnJUaW1lO1xuICAgIHRoaXMuX21vdmUgPSB0cnVlO1xufVxuZnVuY3Rpb24gX2hhbmRsZUVuZChldmVudCkge1xuICAgIGlmICghdGhpcy5fZG93bilcbiAgICAgICAgcmV0dXJuO1xuICAgIHRoaXMuX2V2ZW50T3V0cHV0LmVtaXQoJ2VuZCcsIHRoaXMuX3BheWxvYWQpO1xuICAgIHRoaXMuX3ByZXZDb29yZCA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLl9wcmV2VGltZSA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLl9kb3duID0gZmFsc2U7XG4gICAgdGhpcy5fbW92ZSA9IGZhbHNlO1xuICAgIHRoaXMuX3Bvc2l0aW9uSGlzdG9yeSA9IFtdO1xufVxuZnVuY3Rpb24gX2hhbmRsZUxlYXZlKGV2ZW50KSB7XG4gICAgaWYgKCF0aGlzLl9kb3duIHx8ICF0aGlzLl9tb3ZlKVxuICAgICAgICByZXR1cm47XG4gICAgaWYgKCF0aGlzLl9kb2N1bWVudEFjdGl2ZSkge1xuICAgICAgICB2YXIgYm91bmRNb3ZlID0gX2hhbmRsZU1vdmUuYmluZCh0aGlzKTtcbiAgICAgICAgdmFyIGJvdW5kRW5kID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgX2hhbmRsZUVuZC5jYWxsKHRoaXMsIGV2ZW50KTtcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBib3VuZE1vdmUpO1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCBib3VuZEVuZCk7XG4gICAgICAgICAgICB9LmJpbmQodGhpcywgZXZlbnQpO1xuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBib3VuZE1vdmUpO1xuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgYm91bmRFbmQpO1xuICAgICAgICB0aGlzLl9kb2N1bWVudEFjdGl2ZSA9IHRydWU7XG4gICAgfVxufVxuTW91c2VTeW5jLnByb3RvdHlwZS5nZXRPcHRpb25zID0gZnVuY3Rpb24gZ2V0T3B0aW9ucygpIHtcbiAgICByZXR1cm4gdGhpcy5vcHRpb25zO1xufTtcbk1vdXNlU3luYy5wcm90b3R5cGUuc2V0T3B0aW9ucyA9IGZ1bmN0aW9uIHNldE9wdGlvbnMob3B0aW9ucykge1xuICAgIHJldHVybiB0aGlzLl9vcHRpb25zTWFuYWdlci5zZXRPcHRpb25zKG9wdGlvbnMpO1xufTtcbm1vZHVsZS5leHBvcnRzID0gTW91c2VTeW5jOyIsInZhciBFdmVudEhhbmRsZXIgPSByZXF1aXJlKCcuLi9jb3JlL0V2ZW50SGFuZGxlcicpO1xudmFyIEVuZ2luZSA9IHJlcXVpcmUoJy4uL2NvcmUvRW5naW5lJyk7XG52YXIgT3B0aW9uc01hbmFnZXIgPSByZXF1aXJlKCcuLi9jb3JlL09wdGlvbnNNYW5hZ2VyJyk7XG5mdW5jdGlvbiBTY3JvbGxTeW5jKG9wdGlvbnMpIHtcbiAgICB0aGlzLm9wdGlvbnMgPSBPYmplY3QuY3JlYXRlKFNjcm9sbFN5bmMuREVGQVVMVF9PUFRJT05TKTtcbiAgICB0aGlzLl9vcHRpb25zTWFuYWdlciA9IG5ldyBPcHRpb25zTWFuYWdlcih0aGlzLm9wdGlvbnMpO1xuICAgIGlmIChvcHRpb25zKVxuICAgICAgICB0aGlzLnNldE9wdGlvbnMob3B0aW9ucyk7XG4gICAgdGhpcy5fcGF5bG9hZCA9IHtcbiAgICAgICAgZGVsdGE6IG51bGwsXG4gICAgICAgIHBvc2l0aW9uOiBudWxsLFxuICAgICAgICB2ZWxvY2l0eTogbnVsbCxcbiAgICAgICAgc2xpcDogdHJ1ZVxuICAgIH07XG4gICAgdGhpcy5fZXZlbnRJbnB1dCA9IG5ldyBFdmVudEhhbmRsZXIoKTtcbiAgICB0aGlzLl9ldmVudE91dHB1dCA9IG5ldyBFdmVudEhhbmRsZXIoKTtcbiAgICBFdmVudEhhbmRsZXIuc2V0SW5wdXRIYW5kbGVyKHRoaXMsIHRoaXMuX2V2ZW50SW5wdXQpO1xuICAgIEV2ZW50SGFuZGxlci5zZXRPdXRwdXRIYW5kbGVyKHRoaXMsIHRoaXMuX2V2ZW50T3V0cHV0KTtcbiAgICB0aGlzLl9wb3NpdGlvbiA9IHRoaXMub3B0aW9ucy5kaXJlY3Rpb24gPT09IHVuZGVmaW5lZCA/IFtcbiAgICAgICAgMCxcbiAgICAgICAgMFxuICAgIF0gOiAwO1xuICAgIHRoaXMuX3ByZXZUaW1lID0gdW5kZWZpbmVkO1xuICAgIHRoaXMuX3ByZXZWZWwgPSB1bmRlZmluZWQ7XG4gICAgdGhpcy5fZXZlbnRJbnB1dC5vbignbW91c2V3aGVlbCcsIF9oYW5kbGVNb3ZlLmJpbmQodGhpcykpO1xuICAgIHRoaXMuX2V2ZW50SW5wdXQub24oJ3doZWVsJywgX2hhbmRsZU1vdmUuYmluZCh0aGlzKSk7XG4gICAgdGhpcy5faW5Qcm9ncmVzcyA9IGZhbHNlO1xuICAgIHRoaXMuX2xvb3BCb3VuZCA9IGZhbHNlO1xufVxuU2Nyb2xsU3luYy5ERUZBVUxUX09QVElPTlMgPSB7XG4gICAgZGlyZWN0aW9uOiB1bmRlZmluZWQsXG4gICAgbWluaW11bUVuZFNwZWVkOiBJbmZpbml0eSxcbiAgICByYWlsczogZmFsc2UsXG4gICAgc2NhbGU6IDEsXG4gICAgc3RhbGxUaW1lOiA1MCxcbiAgICBsaW5lSGVpZ2h0OiA0MCxcbiAgICBwcmV2ZW50RGVmYXVsdDogdHJ1ZVxufTtcblNjcm9sbFN5bmMuRElSRUNUSU9OX1ggPSAwO1xuU2Nyb2xsU3luYy5ESVJFQ1RJT05fWSA9IDE7XG52YXIgTUlOSU1VTV9USUNLX1RJTUUgPSA4O1xudmFyIF9ub3cgPSBEYXRlLm5vdztcbmZ1bmN0aW9uIF9uZXdGcmFtZSgpIHtcbiAgICBpZiAodGhpcy5faW5Qcm9ncmVzcyAmJiBfbm93KCkgLSB0aGlzLl9wcmV2VGltZSA+IHRoaXMub3B0aW9ucy5zdGFsbFRpbWUpIHtcbiAgICAgICAgdGhpcy5faW5Qcm9ncmVzcyA9IGZhbHNlO1xuICAgICAgICB2YXIgZmluYWxWZWwgPSBNYXRoLmFicyh0aGlzLl9wcmV2VmVsKSA+PSB0aGlzLm9wdGlvbnMubWluaW11bUVuZFNwZWVkID8gdGhpcy5fcHJldlZlbCA6IDA7XG4gICAgICAgIHZhciBwYXlsb2FkID0gdGhpcy5fcGF5bG9hZDtcbiAgICAgICAgcGF5bG9hZC5wb3NpdGlvbiA9IHRoaXMuX3Bvc2l0aW9uO1xuICAgICAgICBwYXlsb2FkLnZlbG9jaXR5ID0gZmluYWxWZWw7XG4gICAgICAgIHBheWxvYWQuc2xpcCA9IHRydWU7XG4gICAgICAgIHRoaXMuX2V2ZW50T3V0cHV0LmVtaXQoJ2VuZCcsIHBheWxvYWQpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIF9oYW5kbGVNb3ZlKGV2ZW50KSB7XG4gICAgaWYgKHRoaXMub3B0aW9ucy5wcmV2ZW50RGVmYXVsdClcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICBpZiAoIXRoaXMuX2luUHJvZ3Jlc3MpIHtcbiAgICAgICAgdGhpcy5faW5Qcm9ncmVzcyA9IHRydWU7XG4gICAgICAgIHRoaXMuX3Bvc2l0aW9uID0gdGhpcy5vcHRpb25zLmRpcmVjdGlvbiA9PT0gdW5kZWZpbmVkID8gW1xuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDBcbiAgICAgICAgXSA6IDA7XG4gICAgICAgIHBheWxvYWQgPSB0aGlzLl9wYXlsb2FkO1xuICAgICAgICBwYXlsb2FkLnNsaXAgPSB0cnVlO1xuICAgICAgICBwYXlsb2FkLnBvc2l0aW9uID0gdGhpcy5fcG9zaXRpb247XG4gICAgICAgIHBheWxvYWQuY2xpZW50WCA9IGV2ZW50LmNsaWVudFg7XG4gICAgICAgIHBheWxvYWQuY2xpZW50WSA9IGV2ZW50LmNsaWVudFk7XG4gICAgICAgIHBheWxvYWQub2Zmc2V0WCA9IGV2ZW50Lm9mZnNldFg7XG4gICAgICAgIHBheWxvYWQub2Zmc2V0WSA9IGV2ZW50Lm9mZnNldFk7XG4gICAgICAgIHRoaXMuX2V2ZW50T3V0cHV0LmVtaXQoJ3N0YXJ0JywgcGF5bG9hZCk7XG4gICAgICAgIGlmICghdGhpcy5fbG9vcEJvdW5kKSB7XG4gICAgICAgICAgICBFbmdpbmUub24oJ3ByZXJlbmRlcicsIF9uZXdGcmFtZS5iaW5kKHRoaXMpKTtcbiAgICAgICAgICAgIHRoaXMuX2xvb3BCb3VuZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgdmFyIGN1cnJUaW1lID0gX25vdygpO1xuICAgIHZhciBwcmV2VGltZSA9IHRoaXMuX3ByZXZUaW1lIHx8IGN1cnJUaW1lO1xuICAgIHZhciBkaWZmWCA9IGV2ZW50LndoZWVsRGVsdGFYICE9PSB1bmRlZmluZWQgPyBldmVudC53aGVlbERlbHRhWCA6IC1ldmVudC5kZWx0YVg7XG4gICAgdmFyIGRpZmZZID0gZXZlbnQud2hlZWxEZWx0YVkgIT09IHVuZGVmaW5lZCA/IGV2ZW50LndoZWVsRGVsdGFZIDogLWV2ZW50LmRlbHRhWTtcbiAgICBpZiAoZXZlbnQuZGVsdGFNb2RlID09PSAxKSB7XG4gICAgICAgIGRpZmZYICo9IHRoaXMub3B0aW9ucy5saW5lSGVpZ2h0O1xuICAgICAgICBkaWZmWSAqPSB0aGlzLm9wdGlvbnMubGluZUhlaWdodDtcbiAgICB9XG4gICAgaWYgKHRoaXMub3B0aW9ucy5yYWlscykge1xuICAgICAgICBpZiAoTWF0aC5hYnMoZGlmZlgpID4gTWF0aC5hYnMoZGlmZlkpKVxuICAgICAgICAgICAgZGlmZlkgPSAwO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBkaWZmWCA9IDA7XG4gICAgfVxuICAgIHZhciBkaWZmVGltZSA9IE1hdGgubWF4KGN1cnJUaW1lIC0gcHJldlRpbWUsIE1JTklNVU1fVElDS19USU1FKTtcbiAgICB2YXIgdmVsWCA9IGRpZmZYIC8gZGlmZlRpbWU7XG4gICAgdmFyIHZlbFkgPSBkaWZmWSAvIGRpZmZUaW1lO1xuICAgIHZhciBzY2FsZSA9IHRoaXMub3B0aW9ucy5zY2FsZTtcbiAgICB2YXIgbmV4dFZlbDtcbiAgICB2YXIgbmV4dERlbHRhO1xuICAgIGlmICh0aGlzLm9wdGlvbnMuZGlyZWN0aW9uID09PSBTY3JvbGxTeW5jLkRJUkVDVElPTl9YKSB7XG4gICAgICAgIG5leHREZWx0YSA9IHNjYWxlICogZGlmZlg7XG4gICAgICAgIG5leHRWZWwgPSBzY2FsZSAqIHZlbFg7XG4gICAgICAgIHRoaXMuX3Bvc2l0aW9uICs9IG5leHREZWx0YTtcbiAgICB9IGVsc2UgaWYgKHRoaXMub3B0aW9ucy5kaXJlY3Rpb24gPT09IFNjcm9sbFN5bmMuRElSRUNUSU9OX1kpIHtcbiAgICAgICAgbmV4dERlbHRhID0gc2NhbGUgKiBkaWZmWTtcbiAgICAgICAgbmV4dFZlbCA9IHNjYWxlICogdmVsWTtcbiAgICAgICAgdGhpcy5fcG9zaXRpb24gKz0gbmV4dERlbHRhO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIG5leHREZWx0YSA9IFtcbiAgICAgICAgICAgIHNjYWxlICogZGlmZlgsXG4gICAgICAgICAgICBzY2FsZSAqIGRpZmZZXG4gICAgICAgIF07XG4gICAgICAgIG5leHRWZWwgPSBbXG4gICAgICAgICAgICBzY2FsZSAqIHZlbFgsXG4gICAgICAgICAgICBzY2FsZSAqIHZlbFlcbiAgICAgICAgXTtcbiAgICAgICAgdGhpcy5fcG9zaXRpb25bMF0gKz0gbmV4dERlbHRhWzBdO1xuICAgICAgICB0aGlzLl9wb3NpdGlvblsxXSArPSBuZXh0RGVsdGFbMV07XG4gICAgfVxuICAgIHZhciBwYXlsb2FkID0gdGhpcy5fcGF5bG9hZDtcbiAgICBwYXlsb2FkLmRlbHRhID0gbmV4dERlbHRhO1xuICAgIHBheWxvYWQudmVsb2NpdHkgPSBuZXh0VmVsO1xuICAgIHBheWxvYWQucG9zaXRpb24gPSB0aGlzLl9wb3NpdGlvbjtcbiAgICBwYXlsb2FkLnNsaXAgPSB0cnVlO1xuICAgIHRoaXMuX2V2ZW50T3V0cHV0LmVtaXQoJ3VwZGF0ZScsIHBheWxvYWQpO1xuICAgIHRoaXMuX3ByZXZUaW1lID0gY3VyclRpbWU7XG4gICAgdGhpcy5fcHJldlZlbCA9IG5leHRWZWw7XG59XG5TY3JvbGxTeW5jLnByb3RvdHlwZS5nZXRPcHRpb25zID0gZnVuY3Rpb24gZ2V0T3B0aW9ucygpIHtcbiAgICByZXR1cm4gdGhpcy5vcHRpb25zO1xufTtcblNjcm9sbFN5bmMucHJvdG90eXBlLnNldE9wdGlvbnMgPSBmdW5jdGlvbiBzZXRPcHRpb25zKG9wdGlvbnMpIHtcbiAgICByZXR1cm4gdGhpcy5fb3B0aW9uc01hbmFnZXIuc2V0T3B0aW9ucyhvcHRpb25zKTtcbn07XG5tb2R1bGUuZXhwb3J0cyA9IFNjcm9sbFN5bmM7IiwidmFyIFRvdWNoVHJhY2tlciA9IHJlcXVpcmUoJy4vVG91Y2hUcmFja2VyJyk7XG52YXIgRXZlbnRIYW5kbGVyID0gcmVxdWlyZSgnLi4vY29yZS9FdmVudEhhbmRsZXInKTtcbnZhciBPcHRpb25zTWFuYWdlciA9IHJlcXVpcmUoJy4uL2NvcmUvT3B0aW9uc01hbmFnZXInKTtcbmZ1bmN0aW9uIFRvdWNoU3luYyhvcHRpb25zKSB7XG4gICAgdGhpcy5vcHRpb25zID0gT2JqZWN0LmNyZWF0ZShUb3VjaFN5bmMuREVGQVVMVF9PUFRJT05TKTtcbiAgICB0aGlzLl9vcHRpb25zTWFuYWdlciA9IG5ldyBPcHRpb25zTWFuYWdlcih0aGlzLm9wdGlvbnMpO1xuICAgIGlmIChvcHRpb25zKVxuICAgICAgICB0aGlzLnNldE9wdGlvbnMob3B0aW9ucyk7XG4gICAgdGhpcy5fZXZlbnRPdXRwdXQgPSBuZXcgRXZlbnRIYW5kbGVyKCk7XG4gICAgdGhpcy5fdG91Y2hUcmFja2VyID0gbmV3IFRvdWNoVHJhY2tlcih7IHRvdWNoTGltaXQ6IHRoaXMub3B0aW9ucy50b3VjaExpbWl0IH0pO1xuICAgIEV2ZW50SGFuZGxlci5zZXRPdXRwdXRIYW5kbGVyKHRoaXMsIHRoaXMuX2V2ZW50T3V0cHV0KTtcbiAgICBFdmVudEhhbmRsZXIuc2V0SW5wdXRIYW5kbGVyKHRoaXMsIHRoaXMuX3RvdWNoVHJhY2tlcik7XG4gICAgdGhpcy5fdG91Y2hUcmFja2VyLm9uKCd0cmFja3N0YXJ0JywgX2hhbmRsZVN0YXJ0LmJpbmQodGhpcykpO1xuICAgIHRoaXMuX3RvdWNoVHJhY2tlci5vbigndHJhY2ttb3ZlJywgX2hhbmRsZU1vdmUuYmluZCh0aGlzKSk7XG4gICAgdGhpcy5fdG91Y2hUcmFja2VyLm9uKCd0cmFja2VuZCcsIF9oYW5kbGVFbmQuYmluZCh0aGlzKSk7XG4gICAgdGhpcy5fcGF5bG9hZCA9IHtcbiAgICAgICAgZGVsdGE6IG51bGwsXG4gICAgICAgIHBvc2l0aW9uOiBudWxsLFxuICAgICAgICB2ZWxvY2l0eTogbnVsbCxcbiAgICAgICAgY2xpZW50WDogdW5kZWZpbmVkLFxuICAgICAgICBjbGllbnRZOiB1bmRlZmluZWQsXG4gICAgICAgIGNvdW50OiAwLFxuICAgICAgICB0b3VjaDogdW5kZWZpbmVkXG4gICAgfTtcbiAgICB0aGlzLl9wb3NpdGlvbiA9IG51bGw7XG59XG5Ub3VjaFN5bmMuREVGQVVMVF9PUFRJT05TID0ge1xuICAgIGRpcmVjdGlvbjogdW5kZWZpbmVkLFxuICAgIHJhaWxzOiBmYWxzZSxcbiAgICB0b3VjaExpbWl0OiAxLFxuICAgIHZlbG9jaXR5U2FtcGxlTGVuZ3RoOiAxMCxcbiAgICBzY2FsZTogMVxufTtcblRvdWNoU3luYy5ESVJFQ1RJT05fWCA9IDA7XG5Ub3VjaFN5bmMuRElSRUNUSU9OX1kgPSAxO1xudmFyIE1JTklNVU1fVElDS19USU1FID0gODtcbmZ1bmN0aW9uIF9oYW5kbGVTdGFydChkYXRhKSB7XG4gICAgdmFyIHZlbG9jaXR5O1xuICAgIHZhciBkZWx0YTtcbiAgICBpZiAodGhpcy5vcHRpb25zLmRpcmVjdGlvbiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHRoaXMuX3Bvc2l0aW9uID0gMDtcbiAgICAgICAgdmVsb2NpdHkgPSAwO1xuICAgICAgICBkZWx0YSA9IDA7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fcG9zaXRpb24gPSBbXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMFxuICAgICAgICBdO1xuICAgICAgICB2ZWxvY2l0eSA9IFtcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAwXG4gICAgICAgIF07XG4gICAgICAgIGRlbHRhID0gW1xuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDBcbiAgICAgICAgXTtcbiAgICB9XG4gICAgdmFyIHBheWxvYWQgPSB0aGlzLl9wYXlsb2FkO1xuICAgIHBheWxvYWQuZGVsdGEgPSBkZWx0YTtcbiAgICBwYXlsb2FkLnBvc2l0aW9uID0gdGhpcy5fcG9zaXRpb247XG4gICAgcGF5bG9hZC52ZWxvY2l0eSA9IHZlbG9jaXR5O1xuICAgIHBheWxvYWQuY2xpZW50WCA9IGRhdGEueDtcbiAgICBwYXlsb2FkLmNsaWVudFkgPSBkYXRhLnk7XG4gICAgcGF5bG9hZC5jb3VudCA9IGRhdGEuY291bnQ7XG4gICAgcGF5bG9hZC50b3VjaCA9IGRhdGEuaWRlbnRpZmllcjtcbiAgICB0aGlzLl9ldmVudE91dHB1dC5lbWl0KCdzdGFydCcsIHBheWxvYWQpO1xufVxuZnVuY3Rpb24gX2hhbmRsZU1vdmUoZGF0YSkge1xuICAgIHZhciBoaXN0b3J5ID0gZGF0YS5oaXN0b3J5O1xuICAgIHZhciBjdXJySGlzdG9yeSA9IGhpc3RvcnlbaGlzdG9yeS5sZW5ndGggLSAxXTtcbiAgICB2YXIgcHJldkhpc3RvcnkgPSBoaXN0b3J5W2hpc3RvcnkubGVuZ3RoIC0gMl07XG4gICAgdmFyIGRpc3RhbnRIaXN0b3J5ID0gaGlzdG9yeVtoaXN0b3J5Lmxlbmd0aCAtIHRoaXMub3B0aW9ucy52ZWxvY2l0eVNhbXBsZUxlbmd0aF0gPyBoaXN0b3J5W2hpc3RvcnkubGVuZ3RoIC0gdGhpcy5vcHRpb25zLnZlbG9jaXR5U2FtcGxlTGVuZ3RoXSA6IGhpc3RvcnlbaGlzdG9yeS5sZW5ndGggLSAyXTtcbiAgICB2YXIgZGlzdGFudFRpbWUgPSBkaXN0YW50SGlzdG9yeS50aW1lc3RhbXA7XG4gICAgdmFyIGN1cnJUaW1lID0gY3Vyckhpc3RvcnkudGltZXN0YW1wO1xuICAgIHZhciBkaWZmWCA9IGN1cnJIaXN0b3J5LnggLSBwcmV2SGlzdG9yeS54O1xuICAgIHZhciBkaWZmWSA9IGN1cnJIaXN0b3J5LnkgLSBwcmV2SGlzdG9yeS55O1xuICAgIHZhciB2ZWxEaWZmWCA9IGN1cnJIaXN0b3J5LnggLSBkaXN0YW50SGlzdG9yeS54O1xuICAgIHZhciB2ZWxEaWZmWSA9IGN1cnJIaXN0b3J5LnkgLSBkaXN0YW50SGlzdG9yeS55O1xuICAgIGlmICh0aGlzLm9wdGlvbnMucmFpbHMpIHtcbiAgICAgICAgaWYgKE1hdGguYWJzKGRpZmZYKSA+IE1hdGguYWJzKGRpZmZZKSlcbiAgICAgICAgICAgIGRpZmZZID0gMDtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgZGlmZlggPSAwO1xuICAgICAgICBpZiAoTWF0aC5hYnModmVsRGlmZlgpID4gTWF0aC5hYnModmVsRGlmZlkpKVxuICAgICAgICAgICAgdmVsRGlmZlkgPSAwO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICB2ZWxEaWZmWCA9IDA7XG4gICAgfVxuICAgIHZhciBkaWZmVGltZSA9IE1hdGgubWF4KGN1cnJUaW1lIC0gZGlzdGFudFRpbWUsIE1JTklNVU1fVElDS19USU1FKTtcbiAgICB2YXIgdmVsWCA9IHZlbERpZmZYIC8gZGlmZlRpbWU7XG4gICAgdmFyIHZlbFkgPSB2ZWxEaWZmWSAvIGRpZmZUaW1lO1xuICAgIHZhciBzY2FsZSA9IHRoaXMub3B0aW9ucy5zY2FsZTtcbiAgICB2YXIgbmV4dFZlbDtcbiAgICB2YXIgbmV4dERlbHRhO1xuICAgIGlmICh0aGlzLm9wdGlvbnMuZGlyZWN0aW9uID09PSBUb3VjaFN5bmMuRElSRUNUSU9OX1gpIHtcbiAgICAgICAgbmV4dERlbHRhID0gc2NhbGUgKiBkaWZmWDtcbiAgICAgICAgbmV4dFZlbCA9IHNjYWxlICogdmVsWDtcbiAgICAgICAgdGhpcy5fcG9zaXRpb24gKz0gbmV4dERlbHRhO1xuICAgIH0gZWxzZSBpZiAodGhpcy5vcHRpb25zLmRpcmVjdGlvbiA9PT0gVG91Y2hTeW5jLkRJUkVDVElPTl9ZKSB7XG4gICAgICAgIG5leHREZWx0YSA9IHNjYWxlICogZGlmZlk7XG4gICAgICAgIG5leHRWZWwgPSBzY2FsZSAqIHZlbFk7XG4gICAgICAgIHRoaXMuX3Bvc2l0aW9uICs9IG5leHREZWx0YTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBuZXh0RGVsdGEgPSBbXG4gICAgICAgICAgICBzY2FsZSAqIGRpZmZYLFxuICAgICAgICAgICAgc2NhbGUgKiBkaWZmWVxuICAgICAgICBdO1xuICAgICAgICBuZXh0VmVsID0gW1xuICAgICAgICAgICAgc2NhbGUgKiB2ZWxYLFxuICAgICAgICAgICAgc2NhbGUgKiB2ZWxZXG4gICAgICAgIF07XG4gICAgICAgIHRoaXMuX3Bvc2l0aW9uWzBdICs9IG5leHREZWx0YVswXTtcbiAgICAgICAgdGhpcy5fcG9zaXRpb25bMV0gKz0gbmV4dERlbHRhWzFdO1xuICAgIH1cbiAgICB2YXIgcGF5bG9hZCA9IHRoaXMuX3BheWxvYWQ7XG4gICAgcGF5bG9hZC5kZWx0YSA9IG5leHREZWx0YTtcbiAgICBwYXlsb2FkLnZlbG9jaXR5ID0gbmV4dFZlbDtcbiAgICBwYXlsb2FkLnBvc2l0aW9uID0gdGhpcy5fcG9zaXRpb247XG4gICAgcGF5bG9hZC5jbGllbnRYID0gZGF0YS54O1xuICAgIHBheWxvYWQuY2xpZW50WSA9IGRhdGEueTtcbiAgICBwYXlsb2FkLmNvdW50ID0gZGF0YS5jb3VudDtcbiAgICBwYXlsb2FkLnRvdWNoID0gZGF0YS5pZGVudGlmaWVyO1xuICAgIHRoaXMuX2V2ZW50T3V0cHV0LmVtaXQoJ3VwZGF0ZScsIHBheWxvYWQpO1xufVxuZnVuY3Rpb24gX2hhbmRsZUVuZChkYXRhKSB7XG4gICAgdGhpcy5fcGF5bG9hZC5jb3VudCA9IGRhdGEuY291bnQ7XG4gICAgdGhpcy5fZXZlbnRPdXRwdXQuZW1pdCgnZW5kJywgdGhpcy5fcGF5bG9hZCk7XG59XG5Ub3VjaFN5bmMucHJvdG90eXBlLnNldE9wdGlvbnMgPSBmdW5jdGlvbiBzZXRPcHRpb25zKG9wdGlvbnMpIHtcbiAgICByZXR1cm4gdGhpcy5fb3B0aW9uc01hbmFnZXIuc2V0T3B0aW9ucyhvcHRpb25zKTtcbn07XG5Ub3VjaFN5bmMucHJvdG90eXBlLmdldE9wdGlvbnMgPSBmdW5jdGlvbiBnZXRPcHRpb25zKCkge1xuICAgIHJldHVybiB0aGlzLm9wdGlvbnM7XG59O1xubW9kdWxlLmV4cG9ydHMgPSBUb3VjaFN5bmM7IiwidmFyIEV2ZW50SGFuZGxlciA9IHJlcXVpcmUoJy4uL2NvcmUvRXZlbnRIYW5kbGVyJyk7XG52YXIgX25vdyA9IERhdGUubm93O1xuZnVuY3Rpb24gX3RpbWVzdGFtcFRvdWNoKHRvdWNoLCBldmVudCwgaGlzdG9yeSkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHg6IHRvdWNoLmNsaWVudFgsXG4gICAgICAgIHk6IHRvdWNoLmNsaWVudFksXG4gICAgICAgIGlkZW50aWZpZXI6IHRvdWNoLmlkZW50aWZpZXIsXG4gICAgICAgIG9yaWdpbjogZXZlbnQub3JpZ2luLFxuICAgICAgICB0aW1lc3RhbXA6IF9ub3coKSxcbiAgICAgICAgY291bnQ6IGV2ZW50LnRvdWNoZXMubGVuZ3RoLFxuICAgICAgICBoaXN0b3J5OiBoaXN0b3J5XG4gICAgfTtcbn1cbmZ1bmN0aW9uIF9oYW5kbGVTdGFydChldmVudCkge1xuICAgIGlmIChldmVudC50b3VjaGVzLmxlbmd0aCA+IHRoaXMudG91Y2hMaW1pdClcbiAgICAgICAgcmV0dXJuO1xuICAgIHRoaXMuaXNUb3VjaGVkID0gdHJ1ZTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGV2ZW50LmNoYW5nZWRUb3VjaGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciB0b3VjaCA9IGV2ZW50LmNoYW5nZWRUb3VjaGVzW2ldO1xuICAgICAgICB2YXIgZGF0YSA9IF90aW1lc3RhbXBUb3VjaCh0b3VjaCwgZXZlbnQsIG51bGwpO1xuICAgICAgICB0aGlzLmV2ZW50T3V0cHV0LmVtaXQoJ3RyYWNrc3RhcnQnLCBkYXRhKTtcbiAgICAgICAgaWYgKCF0aGlzLnNlbGVjdGl2ZSAmJiAhdGhpcy50b3VjaEhpc3RvcnlbdG91Y2guaWRlbnRpZmllcl0pXG4gICAgICAgICAgICB0aGlzLnRyYWNrKGRhdGEpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIF9oYW5kbGVNb3ZlKGV2ZW50KSB7XG4gICAgaWYgKGV2ZW50LnRvdWNoZXMubGVuZ3RoID4gdGhpcy50b3VjaExpbWl0KVxuICAgICAgICByZXR1cm47XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBldmVudC5jaGFuZ2VkVG91Y2hlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgdG91Y2ggPSBldmVudC5jaGFuZ2VkVG91Y2hlc1tpXTtcbiAgICAgICAgdmFyIGhpc3RvcnkgPSB0aGlzLnRvdWNoSGlzdG9yeVt0b3VjaC5pZGVudGlmaWVyXTtcbiAgICAgICAgaWYgKGhpc3RvcnkpIHtcbiAgICAgICAgICAgIHZhciBkYXRhID0gX3RpbWVzdGFtcFRvdWNoKHRvdWNoLCBldmVudCwgaGlzdG9yeSk7XG4gICAgICAgICAgICB0aGlzLnRvdWNoSGlzdG9yeVt0b3VjaC5pZGVudGlmaWVyXS5wdXNoKGRhdGEpO1xuICAgICAgICAgICAgdGhpcy5ldmVudE91dHB1dC5lbWl0KCd0cmFja21vdmUnLCBkYXRhKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbmZ1bmN0aW9uIF9oYW5kbGVFbmQoZXZlbnQpIHtcbiAgICBpZiAoIXRoaXMuaXNUb3VjaGVkKVxuICAgICAgICByZXR1cm47XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBldmVudC5jaGFuZ2VkVG91Y2hlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgdG91Y2ggPSBldmVudC5jaGFuZ2VkVG91Y2hlc1tpXTtcbiAgICAgICAgdmFyIGhpc3RvcnkgPSB0aGlzLnRvdWNoSGlzdG9yeVt0b3VjaC5pZGVudGlmaWVyXTtcbiAgICAgICAgaWYgKGhpc3RvcnkpIHtcbiAgICAgICAgICAgIHZhciBkYXRhID0gX3RpbWVzdGFtcFRvdWNoKHRvdWNoLCBldmVudCwgaGlzdG9yeSk7XG4gICAgICAgICAgICB0aGlzLmV2ZW50T3V0cHV0LmVtaXQoJ3RyYWNrZW5kJywgZGF0YSk7XG4gICAgICAgICAgICBkZWxldGUgdGhpcy50b3VjaEhpc3RvcnlbdG91Y2guaWRlbnRpZmllcl07XG4gICAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5pc1RvdWNoZWQgPSBmYWxzZTtcbn1cbmZ1bmN0aW9uIF9oYW5kbGVVbnBpcGUoKSB7XG4gICAgZm9yICh2YXIgaSBpbiB0aGlzLnRvdWNoSGlzdG9yeSkge1xuICAgICAgICB2YXIgaGlzdG9yeSA9IHRoaXMudG91Y2hIaXN0b3J5W2ldO1xuICAgICAgICB0aGlzLmV2ZW50T3V0cHV0LmVtaXQoJ3RyYWNrZW5kJywge1xuICAgICAgICAgICAgdG91Y2g6IGhpc3RvcnlbaGlzdG9yeS5sZW5ndGggLSAxXS50b3VjaCxcbiAgICAgICAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKSxcbiAgICAgICAgICAgIGNvdW50OiAwLFxuICAgICAgICAgICAgaGlzdG9yeTogaGlzdG9yeVxuICAgICAgICB9KTtcbiAgICAgICAgZGVsZXRlIHRoaXMudG91Y2hIaXN0b3J5W2ldO1xuICAgIH1cbn1cbmZ1bmN0aW9uIFRvdWNoVHJhY2tlcihvcHRpb25zKSB7XG4gICAgdGhpcy5zZWxlY3RpdmUgPSBvcHRpb25zLnNlbGVjdGl2ZTtcbiAgICB0aGlzLnRvdWNoTGltaXQgPSBvcHRpb25zLnRvdWNoTGltaXQgfHwgMTtcbiAgICB0aGlzLnRvdWNoSGlzdG9yeSA9IHt9O1xuICAgIHRoaXMuZXZlbnRJbnB1dCA9IG5ldyBFdmVudEhhbmRsZXIoKTtcbiAgICB0aGlzLmV2ZW50T3V0cHV0ID0gbmV3IEV2ZW50SGFuZGxlcigpO1xuICAgIEV2ZW50SGFuZGxlci5zZXRJbnB1dEhhbmRsZXIodGhpcywgdGhpcy5ldmVudElucHV0KTtcbiAgICBFdmVudEhhbmRsZXIuc2V0T3V0cHV0SGFuZGxlcih0aGlzLCB0aGlzLmV2ZW50T3V0cHV0KTtcbiAgICB0aGlzLmV2ZW50SW5wdXQub24oJ3RvdWNoc3RhcnQnLCBfaGFuZGxlU3RhcnQuYmluZCh0aGlzKSk7XG4gICAgdGhpcy5ldmVudElucHV0Lm9uKCd0b3VjaG1vdmUnLCBfaGFuZGxlTW92ZS5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLmV2ZW50SW5wdXQub24oJ3RvdWNoZW5kJywgX2hhbmRsZUVuZC5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLmV2ZW50SW5wdXQub24oJ3RvdWNoY2FuY2VsJywgX2hhbmRsZUVuZC5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLmV2ZW50SW5wdXQub24oJ3VucGlwZScsIF9oYW5kbGVVbnBpcGUuYmluZCh0aGlzKSk7XG4gICAgdGhpcy5pc1RvdWNoZWQgPSBmYWxzZTtcbn1cblRvdWNoVHJhY2tlci5wcm90b3R5cGUudHJhY2sgPSBmdW5jdGlvbiB0cmFjayhkYXRhKSB7XG4gICAgdGhpcy50b3VjaEhpc3RvcnlbZGF0YS5pZGVudGlmaWVyXSA9IFtkYXRhXTtcbn07XG5tb2R1bGUuZXhwb3J0cyA9IFRvdWNoVHJhY2tlcjsiLCJ2YXIgVmVjdG9yID0gcmVxdWlyZSgnLi9WZWN0b3InKTtcbmZ1bmN0aW9uIE1hdHJpeCh2YWx1ZXMpIHtcbiAgICB0aGlzLnZhbHVlcyA9IHZhbHVlcyB8fCBbXG4gICAgICAgIFtcbiAgICAgICAgICAgIDEsXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMFxuICAgICAgICBdLFxuICAgICAgICBbXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMSxcbiAgICAgICAgICAgIDBcbiAgICAgICAgXSxcbiAgICAgICAgW1xuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAxXG4gICAgICAgIF1cbiAgICBdO1xuICAgIHJldHVybiB0aGlzO1xufVxudmFyIF9yZWdpc3RlciA9IG5ldyBNYXRyaXgoKTtcbnZhciBfdmVjdG9yUmVnaXN0ZXIgPSBuZXcgVmVjdG9yKCk7XG5NYXRyaXgucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uIGdldCgpIHtcbiAgICByZXR1cm4gdGhpcy52YWx1ZXM7XG59O1xuTWF0cml4LnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbiBzZXQodmFsdWVzKSB7XG4gICAgdGhpcy52YWx1ZXMgPSB2YWx1ZXM7XG59O1xuTWF0cml4LnByb3RvdHlwZS52ZWN0b3JNdWx0aXBseSA9IGZ1bmN0aW9uIHZlY3Rvck11bHRpcGx5KHYpIHtcbiAgICB2YXIgTSA9IHRoaXMuZ2V0KCk7XG4gICAgdmFyIHYwID0gdi54O1xuICAgIHZhciB2MSA9IHYueTtcbiAgICB2YXIgdjIgPSB2Lno7XG4gICAgdmFyIE0wID0gTVswXTtcbiAgICB2YXIgTTEgPSBNWzFdO1xuICAgIHZhciBNMiA9IE1bMl07XG4gICAgdmFyIE0wMCA9IE0wWzBdO1xuICAgIHZhciBNMDEgPSBNMFsxXTtcbiAgICB2YXIgTTAyID0gTTBbMl07XG4gICAgdmFyIE0xMCA9IE0xWzBdO1xuICAgIHZhciBNMTEgPSBNMVsxXTtcbiAgICB2YXIgTTEyID0gTTFbMl07XG4gICAgdmFyIE0yMCA9IE0yWzBdO1xuICAgIHZhciBNMjEgPSBNMlsxXTtcbiAgICB2YXIgTTIyID0gTTJbMl07XG4gICAgcmV0dXJuIF92ZWN0b3JSZWdpc3Rlci5zZXRYWVooTTAwICogdjAgKyBNMDEgKiB2MSArIE0wMiAqIHYyLCBNMTAgKiB2MCArIE0xMSAqIHYxICsgTTEyICogdjIsIE0yMCAqIHYwICsgTTIxICogdjEgKyBNMjIgKiB2Mik7XG59O1xuTWF0cml4LnByb3RvdHlwZS5tdWx0aXBseSA9IGZ1bmN0aW9uIG11bHRpcGx5KE0yKSB7XG4gICAgdmFyIE0xID0gdGhpcy5nZXQoKTtcbiAgICB2YXIgcmVzdWx0ID0gW1tdXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDM7IGkrKykge1xuICAgICAgICByZXN1bHRbaV0gPSBbXTtcbiAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCAzOyBqKyspIHtcbiAgICAgICAgICAgIHZhciBzdW0gPSAwO1xuICAgICAgICAgICAgZm9yICh2YXIgayA9IDA7IGsgPCAzOyBrKyspIHtcbiAgICAgICAgICAgICAgICBzdW0gKz0gTTFbaV1ba10gKiBNMltrXVtqXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlc3VsdFtpXVtqXSA9IHN1bTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gX3JlZ2lzdGVyLnNldChyZXN1bHQpO1xufTtcbk1hdHJpeC5wcm90b3R5cGUudHJhbnNwb3NlID0gZnVuY3Rpb24gdHJhbnNwb3NlKCkge1xuICAgIHZhciByZXN1bHQgPSBbXTtcbiAgICB2YXIgTSA9IHRoaXMuZ2V0KCk7XG4gICAgZm9yICh2YXIgcm93ID0gMDsgcm93IDwgMzsgcm93KyspIHtcbiAgICAgICAgZm9yICh2YXIgY29sID0gMDsgY29sIDwgMzsgY29sKyspIHtcbiAgICAgICAgICAgIHJlc3VsdFtyb3ddW2NvbF0gPSBNW2NvbF1bcm93XTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gX3JlZ2lzdGVyLnNldChyZXN1bHQpO1xufTtcbk1hdHJpeC5wcm90b3R5cGUuY2xvbmUgPSBmdW5jdGlvbiBjbG9uZSgpIHtcbiAgICB2YXIgdmFsdWVzID0gdGhpcy5nZXQoKTtcbiAgICB2YXIgTSA9IFtdO1xuICAgIGZvciAodmFyIHJvdyA9IDA7IHJvdyA8IDM7IHJvdysrKVxuICAgICAgICBNW3Jvd10gPSB2YWx1ZXNbcm93XS5zbGljZSgpO1xuICAgIHJldHVybiBuZXcgTWF0cml4KE0pO1xufTtcbm1vZHVsZS5leHBvcnRzID0gTWF0cml4OyIsInZhciBNYXRyaXggPSByZXF1aXJlKCcuL01hdHJpeCcpO1xuZnVuY3Rpb24gUXVhdGVybmlvbih3LCB4LCB5LCB6KSB7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDEpXG4gICAgICAgIHRoaXMuc2V0KHcpO1xuICAgIGVsc2Uge1xuICAgICAgICB0aGlzLncgPSB3ICE9PSB1bmRlZmluZWQgPyB3IDogMTtcbiAgICAgICAgdGhpcy54ID0geCAhPT0gdW5kZWZpbmVkID8geCA6IDA7XG4gICAgICAgIHRoaXMueSA9IHkgIT09IHVuZGVmaW5lZCA/IHkgOiAwO1xuICAgICAgICB0aGlzLnogPSB6ICE9PSB1bmRlZmluZWQgPyB6IDogMDtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG59XG52YXIgcmVnaXN0ZXIgPSBuZXcgUXVhdGVybmlvbigxLCAwLCAwLCAwKTtcblF1YXRlcm5pb24ucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uIGFkZChxKSB7XG4gICAgcmV0dXJuIHJlZ2lzdGVyLnNldFdYWVoodGhpcy53ICsgcS53LCB0aGlzLnggKyBxLngsIHRoaXMueSArIHEueSwgdGhpcy56ICsgcS56KTtcbn07XG5RdWF0ZXJuaW9uLnByb3RvdHlwZS5zdWIgPSBmdW5jdGlvbiBzdWIocSkge1xuICAgIHJldHVybiByZWdpc3Rlci5zZXRXWFlaKHRoaXMudyAtIHEudywgdGhpcy54IC0gcS54LCB0aGlzLnkgLSBxLnksIHRoaXMueiAtIHEueik7XG59O1xuUXVhdGVybmlvbi5wcm90b3R5cGUuc2NhbGFyRGl2aWRlID0gZnVuY3Rpb24gc2NhbGFyRGl2aWRlKHMpIHtcbiAgICByZXR1cm4gdGhpcy5zY2FsYXJNdWx0aXBseSgxIC8gcyk7XG59O1xuUXVhdGVybmlvbi5wcm90b3R5cGUuc2NhbGFyTXVsdGlwbHkgPSBmdW5jdGlvbiBzY2FsYXJNdWx0aXBseShzKSB7XG4gICAgcmV0dXJuIHJlZ2lzdGVyLnNldFdYWVoodGhpcy53ICogcywgdGhpcy54ICogcywgdGhpcy55ICogcywgdGhpcy56ICogcyk7XG59O1xuUXVhdGVybmlvbi5wcm90b3R5cGUubXVsdGlwbHkgPSBmdW5jdGlvbiBtdWx0aXBseShxKSB7XG4gICAgdmFyIHgxID0gdGhpcy54O1xuICAgIHZhciB5MSA9IHRoaXMueTtcbiAgICB2YXIgejEgPSB0aGlzLno7XG4gICAgdmFyIHcxID0gdGhpcy53O1xuICAgIHZhciB4MiA9IHEueDtcbiAgICB2YXIgeTIgPSBxLnk7XG4gICAgdmFyIHoyID0gcS56O1xuICAgIHZhciB3MiA9IHEudyB8fCAwO1xuICAgIHJldHVybiByZWdpc3Rlci5zZXRXWFlaKHcxICogdzIgLSB4MSAqIHgyIC0geTEgKiB5MiAtIHoxICogejIsIHgxICogdzIgKyB4MiAqIHcxICsgeTIgKiB6MSAtIHkxICogejIsIHkxICogdzIgKyB5MiAqIHcxICsgeDEgKiB6MiAtIHgyICogejEsIHoxICogdzIgKyB6MiAqIHcxICsgeDIgKiB5MSAtIHgxICogeTIpO1xufTtcbnZhciBjb25qID0gbmV3IFF1YXRlcm5pb24oMSwgMCwgMCwgMCk7XG5RdWF0ZXJuaW9uLnByb3RvdHlwZS5yb3RhdGVWZWN0b3IgPSBmdW5jdGlvbiByb3RhdGVWZWN0b3Iodikge1xuICAgIGNvbmouc2V0KHRoaXMuY29uaigpKTtcbiAgICByZXR1cm4gcmVnaXN0ZXIuc2V0KHRoaXMubXVsdGlwbHkodikubXVsdGlwbHkoY29uaikpO1xufTtcblF1YXRlcm5pb24ucHJvdG90eXBlLmludmVyc2UgPSBmdW5jdGlvbiBpbnZlcnNlKCkge1xuICAgIHJldHVybiByZWdpc3Rlci5zZXQodGhpcy5jb25qKCkuc2NhbGFyRGl2aWRlKHRoaXMubm9ybVNxdWFyZWQoKSkpO1xufTtcblF1YXRlcm5pb24ucHJvdG90eXBlLm5lZ2F0ZSA9IGZ1bmN0aW9uIG5lZ2F0ZSgpIHtcbiAgICByZXR1cm4gdGhpcy5zY2FsYXJNdWx0aXBseSgtMSk7XG59O1xuUXVhdGVybmlvbi5wcm90b3R5cGUuY29uaiA9IGZ1bmN0aW9uIGNvbmooKSB7XG4gICAgcmV0dXJuIHJlZ2lzdGVyLnNldFdYWVoodGhpcy53LCAtdGhpcy54LCAtdGhpcy55LCAtdGhpcy56KTtcbn07XG5RdWF0ZXJuaW9uLnByb3RvdHlwZS5ub3JtYWxpemUgPSBmdW5jdGlvbiBub3JtYWxpemUobGVuZ3RoKSB7XG4gICAgbGVuZ3RoID0gbGVuZ3RoID09PSB1bmRlZmluZWQgPyAxIDogbGVuZ3RoO1xuICAgIHJldHVybiB0aGlzLnNjYWxhckRpdmlkZShsZW5ndGggKiB0aGlzLm5vcm0oKSk7XG59O1xuUXVhdGVybmlvbi5wcm90b3R5cGUubWFrZUZyb21BbmdsZUFuZEF4aXMgPSBmdW5jdGlvbiBtYWtlRnJvbUFuZ2xlQW5kQXhpcyhhbmdsZSwgdikge1xuICAgIHZhciBuID0gdi5ub3JtYWxpemUoKTtcbiAgICB2YXIgaGEgPSBhbmdsZSAqIDAuNTtcbiAgICB2YXIgcyA9IC1NYXRoLnNpbihoYSk7XG4gICAgdGhpcy54ID0gcyAqIG4ueDtcbiAgICB0aGlzLnkgPSBzICogbi55O1xuICAgIHRoaXMueiA9IHMgKiBuLno7XG4gICAgdGhpcy53ID0gTWF0aC5jb3MoaGEpO1xuICAgIHJldHVybiB0aGlzO1xufTtcblF1YXRlcm5pb24ucHJvdG90eXBlLnNldFdYWVogPSBmdW5jdGlvbiBzZXRXWFlaKHcsIHgsIHksIHopIHtcbiAgICByZWdpc3Rlci5jbGVhcigpO1xuICAgIHRoaXMudyA9IHc7XG4gICAgdGhpcy54ID0geDtcbiAgICB0aGlzLnkgPSB5O1xuICAgIHRoaXMueiA9IHo7XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuUXVhdGVybmlvbi5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24gc2V0KHYpIHtcbiAgICBpZiAodiBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICAgIHRoaXMudyA9IDA7XG4gICAgICAgIHRoaXMueCA9IHZbMF07XG4gICAgICAgIHRoaXMueSA9IHZbMV07XG4gICAgICAgIHRoaXMueiA9IHZbMl07XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy53ID0gdi53O1xuICAgICAgICB0aGlzLnggPSB2Lng7XG4gICAgICAgIHRoaXMueSA9IHYueTtcbiAgICAgICAgdGhpcy56ID0gdi56O1xuICAgIH1cbiAgICBpZiAodGhpcyAhPT0gcmVnaXN0ZXIpXG4gICAgICAgIHJlZ2lzdGVyLmNsZWFyKCk7XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuUXVhdGVybmlvbi5wcm90b3R5cGUucHV0ID0gZnVuY3Rpb24gcHV0KHEpIHtcbiAgICBxLnNldChyZWdpc3Rlcik7XG59O1xuUXVhdGVybmlvbi5wcm90b3R5cGUuY2xvbmUgPSBmdW5jdGlvbiBjbG9uZSgpIHtcbiAgICByZXR1cm4gbmV3IFF1YXRlcm5pb24odGhpcyk7XG59O1xuUXVhdGVybmlvbi5wcm90b3R5cGUuY2xlYXIgPSBmdW5jdGlvbiBjbGVhcigpIHtcbiAgICB0aGlzLncgPSAxO1xuICAgIHRoaXMueCA9IDA7XG4gICAgdGhpcy55ID0gMDtcbiAgICB0aGlzLnogPSAwO1xuICAgIHJldHVybiB0aGlzO1xufTtcblF1YXRlcm5pb24ucHJvdG90eXBlLmlzRXF1YWwgPSBmdW5jdGlvbiBpc0VxdWFsKHEpIHtcbiAgICByZXR1cm4gcS53ID09PSB0aGlzLncgJiYgcS54ID09PSB0aGlzLnggJiYgcS55ID09PSB0aGlzLnkgJiYgcS56ID09PSB0aGlzLno7XG59O1xuUXVhdGVybmlvbi5wcm90b3R5cGUuZG90ID0gZnVuY3Rpb24gZG90KHEpIHtcbiAgICByZXR1cm4gdGhpcy53ICogcS53ICsgdGhpcy54ICogcS54ICsgdGhpcy55ICogcS55ICsgdGhpcy56ICogcS56O1xufTtcblF1YXRlcm5pb24ucHJvdG90eXBlLm5vcm1TcXVhcmVkID0gZnVuY3Rpb24gbm9ybVNxdWFyZWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuZG90KHRoaXMpO1xufTtcblF1YXRlcm5pb24ucHJvdG90eXBlLm5vcm0gPSBmdW5jdGlvbiBub3JtKCkge1xuICAgIHJldHVybiBNYXRoLnNxcnQodGhpcy5ub3JtU3F1YXJlZCgpKTtcbn07XG5RdWF0ZXJuaW9uLnByb3RvdHlwZS5pc1plcm8gPSBmdW5jdGlvbiBpc1plcm8oKSB7XG4gICAgcmV0dXJuICEodGhpcy54IHx8IHRoaXMueSB8fCB0aGlzLnopO1xufTtcblF1YXRlcm5pb24ucHJvdG90eXBlLmdldFRyYW5zZm9ybSA9IGZ1bmN0aW9uIGdldFRyYW5zZm9ybSgpIHtcbiAgICB2YXIgdGVtcCA9IHRoaXMubm9ybWFsaXplKDEpO1xuICAgIHZhciB4ID0gdGVtcC54O1xuICAgIHZhciB5ID0gdGVtcC55O1xuICAgIHZhciB6ID0gdGVtcC56O1xuICAgIHZhciB3ID0gdGVtcC53O1xuICAgIHJldHVybiBbXG4gICAgICAgIDEgLSAyICogeSAqIHkgLSAyICogeiAqIHosXG4gICAgICAgIDIgKiB4ICogeSAtIDIgKiB6ICogdyxcbiAgICAgICAgMiAqIHggKiB6ICsgMiAqIHkgKiB3LFxuICAgICAgICAwLFxuICAgICAgICAyICogeCAqIHkgKyAyICogeiAqIHcsXG4gICAgICAgIDEgLSAyICogeCAqIHggLSAyICogeiAqIHosXG4gICAgICAgIDIgKiB5ICogeiAtIDIgKiB4ICogdyxcbiAgICAgICAgMCxcbiAgICAgICAgMiAqIHggKiB6IC0gMiAqIHkgKiB3LFxuICAgICAgICAyICogeSAqIHogKyAyICogeCAqIHcsXG4gICAgICAgIDEgLSAyICogeCAqIHggLSAyICogeSAqIHksXG4gICAgICAgIDAsXG4gICAgICAgIDAsXG4gICAgICAgIDAsXG4gICAgICAgIDAsXG4gICAgICAgIDFcbiAgICBdO1xufTtcbnZhciBtYXRyaXhSZWdpc3RlciA9IG5ldyBNYXRyaXgoKTtcblF1YXRlcm5pb24ucHJvdG90eXBlLmdldE1hdHJpeCA9IGZ1bmN0aW9uIGdldE1hdHJpeCgpIHtcbiAgICB2YXIgdGVtcCA9IHRoaXMubm9ybWFsaXplKDEpO1xuICAgIHZhciB4ID0gdGVtcC54O1xuICAgIHZhciB5ID0gdGVtcC55O1xuICAgIHZhciB6ID0gdGVtcC56O1xuICAgIHZhciB3ID0gdGVtcC53O1xuICAgIHJldHVybiBtYXRyaXhSZWdpc3Rlci5zZXQoW1xuICAgICAgICBbXG4gICAgICAgICAgICAxIC0gMiAqIHkgKiB5IC0gMiAqIHogKiB6LFxuICAgICAgICAgICAgMiAqIHggKiB5ICsgMiAqIHogKiB3LFxuICAgICAgICAgICAgMiAqIHggKiB6IC0gMiAqIHkgKiB3XG4gICAgICAgIF0sXG4gICAgICAgIFtcbiAgICAgICAgICAgIDIgKiB4ICogeSAtIDIgKiB6ICogdyxcbiAgICAgICAgICAgIDEgLSAyICogeCAqIHggLSAyICogeiAqIHosXG4gICAgICAgICAgICAyICogeSAqIHogKyAyICogeCAqIHdcbiAgICAgICAgXSxcbiAgICAgICAgW1xuICAgICAgICAgICAgMiAqIHggKiB6ICsgMiAqIHkgKiB3LFxuICAgICAgICAgICAgMiAqIHkgKiB6IC0gMiAqIHggKiB3LFxuICAgICAgICAgICAgMSAtIDIgKiB4ICogeCAtIDIgKiB5ICogeVxuICAgICAgICBdXG4gICAgXSk7XG59O1xudmFyIGVwc2lsb24gPSAwLjAwMDAxO1xuUXVhdGVybmlvbi5wcm90b3R5cGUuc2xlcnAgPSBmdW5jdGlvbiBzbGVycChxLCB0KSB7XG4gICAgdmFyIG9tZWdhO1xuICAgIHZhciBjb3NvbWVnYTtcbiAgICB2YXIgc2lub21lZ2E7XG4gICAgdmFyIHNjYWxlRnJvbTtcbiAgICB2YXIgc2NhbGVUbztcbiAgICBjb3NvbWVnYSA9IHRoaXMuZG90KHEpO1xuICAgIGlmICgxIC0gY29zb21lZ2EgPiBlcHNpbG9uKSB7XG4gICAgICAgIG9tZWdhID0gTWF0aC5hY29zKGNvc29tZWdhKTtcbiAgICAgICAgc2lub21lZ2EgPSBNYXRoLnNpbihvbWVnYSk7XG4gICAgICAgIHNjYWxlRnJvbSA9IE1hdGguc2luKCgxIC0gdCkgKiBvbWVnYSkgLyBzaW5vbWVnYTtcbiAgICAgICAgc2NhbGVUbyA9IE1hdGguc2luKHQgKiBvbWVnYSkgLyBzaW5vbWVnYTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBzY2FsZUZyb20gPSAxIC0gdDtcbiAgICAgICAgc2NhbGVUbyA9IHQ7XG4gICAgfVxuICAgIHJldHVybiByZWdpc3Rlci5zZXQodGhpcy5zY2FsYXJNdWx0aXBseShzY2FsZUZyb20gLyBzY2FsZVRvKS5hZGQocSkubXVsdGlwbHkoc2NhbGVUbykpO1xufTtcbm1vZHVsZS5leHBvcnRzID0gUXVhdGVybmlvbjsiLCJmdW5jdGlvbiBWZWN0b3IoeCwgeSwgeikge1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAxICYmIHggIT09IHVuZGVmaW5lZClcbiAgICAgICAgdGhpcy5zZXQoeCk7XG4gICAgZWxzZSB7XG4gICAgICAgIHRoaXMueCA9IHggfHwgMDtcbiAgICAgICAgdGhpcy55ID0geSB8fCAwO1xuICAgICAgICB0aGlzLnogPSB6IHx8IDA7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xufVxudmFyIF9yZWdpc3RlciA9IG5ldyBWZWN0b3IoMCwgMCwgMCk7XG5WZWN0b3IucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uIGFkZCh2KSB7XG4gICAgcmV0dXJuIF9zZXRYWVouY2FsbChfcmVnaXN0ZXIsIHRoaXMueCArIHYueCwgdGhpcy55ICsgdi55LCB0aGlzLnogKyB2LnopO1xufTtcblZlY3Rvci5wcm90b3R5cGUuc3ViID0gZnVuY3Rpb24gc3ViKHYpIHtcbiAgICByZXR1cm4gX3NldFhZWi5jYWxsKF9yZWdpc3RlciwgdGhpcy54IC0gdi54LCB0aGlzLnkgLSB2LnksIHRoaXMueiAtIHYueik7XG59O1xuVmVjdG9yLnByb3RvdHlwZS5tdWx0ID0gZnVuY3Rpb24gbXVsdChyKSB7XG4gICAgcmV0dXJuIF9zZXRYWVouY2FsbChfcmVnaXN0ZXIsIHIgKiB0aGlzLngsIHIgKiB0aGlzLnksIHIgKiB0aGlzLnopO1xufTtcblZlY3Rvci5wcm90b3R5cGUuZGl2ID0gZnVuY3Rpb24gZGl2KHIpIHtcbiAgICByZXR1cm4gdGhpcy5tdWx0KDEgLyByKTtcbn07XG5WZWN0b3IucHJvdG90eXBlLmNyb3NzID0gZnVuY3Rpb24gY3Jvc3Modikge1xuICAgIHZhciB4ID0gdGhpcy54O1xuICAgIHZhciB5ID0gdGhpcy55O1xuICAgIHZhciB6ID0gdGhpcy56O1xuICAgIHZhciB2eCA9IHYueDtcbiAgICB2YXIgdnkgPSB2Lnk7XG4gICAgdmFyIHZ6ID0gdi56O1xuICAgIHJldHVybiBfc2V0WFlaLmNhbGwoX3JlZ2lzdGVyLCB6ICogdnkgLSB5ICogdnosIHggKiB2eiAtIHogKiB2eCwgeSAqIHZ4IC0geCAqIHZ5KTtcbn07XG5WZWN0b3IucHJvdG90eXBlLmVxdWFscyA9IGZ1bmN0aW9uIGVxdWFscyh2KSB7XG4gICAgcmV0dXJuIHYueCA9PT0gdGhpcy54ICYmIHYueSA9PT0gdGhpcy55ICYmIHYueiA9PT0gdGhpcy56O1xufTtcblZlY3Rvci5wcm90b3R5cGUucm90YXRlWCA9IGZ1bmN0aW9uIHJvdGF0ZVgodGhldGEpIHtcbiAgICB2YXIgeCA9IHRoaXMueDtcbiAgICB2YXIgeSA9IHRoaXMueTtcbiAgICB2YXIgeiA9IHRoaXMuejtcbiAgICB2YXIgY29zVGhldGEgPSBNYXRoLmNvcyh0aGV0YSk7XG4gICAgdmFyIHNpblRoZXRhID0gTWF0aC5zaW4odGhldGEpO1xuICAgIHJldHVybiBfc2V0WFlaLmNhbGwoX3JlZ2lzdGVyLCB4LCB5ICogY29zVGhldGEgLSB6ICogc2luVGhldGEsIHkgKiBzaW5UaGV0YSArIHogKiBjb3NUaGV0YSk7XG59O1xuVmVjdG9yLnByb3RvdHlwZS5yb3RhdGVZID0gZnVuY3Rpb24gcm90YXRlWSh0aGV0YSkge1xuICAgIHZhciB4ID0gdGhpcy54O1xuICAgIHZhciB5ID0gdGhpcy55O1xuICAgIHZhciB6ID0gdGhpcy56O1xuICAgIHZhciBjb3NUaGV0YSA9IE1hdGguY29zKHRoZXRhKTtcbiAgICB2YXIgc2luVGhldGEgPSBNYXRoLnNpbih0aGV0YSk7XG4gICAgcmV0dXJuIF9zZXRYWVouY2FsbChfcmVnaXN0ZXIsIHogKiBzaW5UaGV0YSArIHggKiBjb3NUaGV0YSwgeSwgeiAqIGNvc1RoZXRhIC0geCAqIHNpblRoZXRhKTtcbn07XG5WZWN0b3IucHJvdG90eXBlLnJvdGF0ZVogPSBmdW5jdGlvbiByb3RhdGVaKHRoZXRhKSB7XG4gICAgdmFyIHggPSB0aGlzLng7XG4gICAgdmFyIHkgPSB0aGlzLnk7XG4gICAgdmFyIHogPSB0aGlzLno7XG4gICAgdmFyIGNvc1RoZXRhID0gTWF0aC5jb3ModGhldGEpO1xuICAgIHZhciBzaW5UaGV0YSA9IE1hdGguc2luKHRoZXRhKTtcbiAgICByZXR1cm4gX3NldFhZWi5jYWxsKF9yZWdpc3RlciwgeCAqIGNvc1RoZXRhIC0geSAqIHNpblRoZXRhLCB4ICogc2luVGhldGEgKyB5ICogY29zVGhldGEsIHopO1xufTtcblZlY3Rvci5wcm90b3R5cGUuZG90ID0gZnVuY3Rpb24gZG90KHYpIHtcbiAgICByZXR1cm4gdGhpcy54ICogdi54ICsgdGhpcy55ICogdi55ICsgdGhpcy56ICogdi56O1xufTtcblZlY3Rvci5wcm90b3R5cGUubm9ybVNxdWFyZWQgPSBmdW5jdGlvbiBub3JtU3F1YXJlZCgpIHtcbiAgICByZXR1cm4gdGhpcy5kb3QodGhpcyk7XG59O1xuVmVjdG9yLnByb3RvdHlwZS5ub3JtID0gZnVuY3Rpb24gbm9ybSgpIHtcbiAgICByZXR1cm4gTWF0aC5zcXJ0KHRoaXMubm9ybVNxdWFyZWQoKSk7XG59O1xuVmVjdG9yLnByb3RvdHlwZS5ub3JtYWxpemUgPSBmdW5jdGlvbiBub3JtYWxpemUobGVuZ3RoKSB7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApXG4gICAgICAgIGxlbmd0aCA9IDE7XG4gICAgdmFyIG5vcm0gPSB0aGlzLm5vcm0oKTtcbiAgICBpZiAobm9ybSA+IDFlLTcpXG4gICAgICAgIHJldHVybiBfc2V0RnJvbVZlY3Rvci5jYWxsKF9yZWdpc3RlciwgdGhpcy5tdWx0KGxlbmd0aCAvIG5vcm0pKTtcbiAgICBlbHNlXG4gICAgICAgIHJldHVybiBfc2V0WFlaLmNhbGwoX3JlZ2lzdGVyLCBsZW5ndGgsIDAsIDApO1xufTtcblZlY3Rvci5wcm90b3R5cGUuY2xvbmUgPSBmdW5jdGlvbiBjbG9uZSgpIHtcbiAgICByZXR1cm4gbmV3IFZlY3Rvcih0aGlzKTtcbn07XG5WZWN0b3IucHJvdG90eXBlLmlzWmVybyA9IGZ1bmN0aW9uIGlzWmVybygpIHtcbiAgICByZXR1cm4gISh0aGlzLnggfHwgdGhpcy55IHx8IHRoaXMueik7XG59O1xuZnVuY3Rpb24gX3NldFhZWih4LCB5LCB6KSB7XG4gICAgdGhpcy54ID0geDtcbiAgICB0aGlzLnkgPSB5O1xuICAgIHRoaXMueiA9IHo7XG4gICAgcmV0dXJuIHRoaXM7XG59XG5mdW5jdGlvbiBfc2V0RnJvbUFycmF5KHYpIHtcbiAgICByZXR1cm4gX3NldFhZWi5jYWxsKHRoaXMsIHZbMF0sIHZbMV0sIHZbMl0gfHwgMCk7XG59XG5mdW5jdGlvbiBfc2V0RnJvbVZlY3Rvcih2KSB7XG4gICAgcmV0dXJuIF9zZXRYWVouY2FsbCh0aGlzLCB2LngsIHYueSwgdi56KTtcbn1cbmZ1bmN0aW9uIF9zZXRGcm9tTnVtYmVyKHgpIHtcbiAgICByZXR1cm4gX3NldFhZWi5jYWxsKHRoaXMsIHgsIDAsIDApO1xufVxuVmVjdG9yLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbiBzZXQodikge1xuICAgIGlmICh2IGluc3RhbmNlb2YgQXJyYXkpXG4gICAgICAgIHJldHVybiBfc2V0RnJvbUFycmF5LmNhbGwodGhpcywgdik7XG4gICAgaWYgKHR5cGVvZiB2ID09PSAnbnVtYmVyJylcbiAgICAgICAgcmV0dXJuIF9zZXRGcm9tTnVtYmVyLmNhbGwodGhpcywgdik7XG4gICAgcmV0dXJuIF9zZXRGcm9tVmVjdG9yLmNhbGwodGhpcywgdik7XG59O1xuVmVjdG9yLnByb3RvdHlwZS5zZXRYWVogPSBmdW5jdGlvbiAoeCwgeSwgeikge1xuICAgIHJldHVybiBfc2V0WFlaLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG59O1xuVmVjdG9yLnByb3RvdHlwZS5zZXQxRCA9IGZ1bmN0aW9uICh4KSB7XG4gICAgcmV0dXJuIF9zZXRGcm9tTnVtYmVyLmNhbGwodGhpcywgeCk7XG59O1xuVmVjdG9yLnByb3RvdHlwZS5wdXQgPSBmdW5jdGlvbiBwdXQodikge1xuICAgIGlmICh0aGlzID09PSBfcmVnaXN0ZXIpXG4gICAgICAgIF9zZXRGcm9tVmVjdG9yLmNhbGwodiwgX3JlZ2lzdGVyKTtcbiAgICBlbHNlXG4gICAgICAgIF9zZXRGcm9tVmVjdG9yLmNhbGwodiwgdGhpcyk7XG59O1xuVmVjdG9yLnByb3RvdHlwZS5jbGVhciA9IGZ1bmN0aW9uIGNsZWFyKCkge1xuICAgIHJldHVybiBfc2V0WFlaLmNhbGwodGhpcywgMCwgMCwgMCk7XG59O1xuVmVjdG9yLnByb3RvdHlwZS5jYXAgPSBmdW5jdGlvbiBjYXAoY2FwKSB7XG4gICAgaWYgKGNhcCA9PT0gSW5maW5pdHkpXG4gICAgICAgIHJldHVybiBfc2V0RnJvbVZlY3Rvci5jYWxsKF9yZWdpc3RlciwgdGhpcyk7XG4gICAgdmFyIG5vcm0gPSB0aGlzLm5vcm0oKTtcbiAgICBpZiAobm9ybSA+IGNhcClcbiAgICAgICAgcmV0dXJuIF9zZXRGcm9tVmVjdG9yLmNhbGwoX3JlZ2lzdGVyLCB0aGlzLm11bHQoY2FwIC8gbm9ybSkpO1xuICAgIGVsc2VcbiAgICAgICAgcmV0dXJuIF9zZXRGcm9tVmVjdG9yLmNhbGwoX3JlZ2lzdGVyLCB0aGlzKTtcbn07XG5WZWN0b3IucHJvdG90eXBlLnByb2plY3QgPSBmdW5jdGlvbiBwcm9qZWN0KG4pIHtcbiAgICByZXR1cm4gbi5tdWx0KHRoaXMuZG90KG4pKTtcbn07XG5WZWN0b3IucHJvdG90eXBlLnJlZmxlY3RBY3Jvc3MgPSBmdW5jdGlvbiByZWZsZWN0QWNyb3NzKG4pIHtcbiAgICBuLm5vcm1hbGl6ZSgpLnB1dChuKTtcbiAgICByZXR1cm4gX3NldEZyb21WZWN0b3IoX3JlZ2lzdGVyLCB0aGlzLnN1Yih0aGlzLnByb2plY3QobikubXVsdCgyKSkpO1xufTtcblZlY3Rvci5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24gZ2V0KCkge1xuICAgIHJldHVybiBbXG4gICAgICAgIHRoaXMueCxcbiAgICAgICAgdGhpcy55LFxuICAgICAgICB0aGlzLnpcbiAgICBdO1xufTtcblZlY3Rvci5wcm90b3R5cGUuZ2V0MUQgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMueDtcbn07XG5tb2R1bGUuZXhwb3J0cyA9IFZlY3RvcjsiLCJ2YXIgTW9kaWZpZXIgPSByZXF1aXJlKCcuLi9jb3JlL01vZGlmaWVyJyk7XG52YXIgVHJhbnNmb3JtID0gcmVxdWlyZSgnLi4vY29yZS9UcmFuc2Zvcm0nKTtcbnZhciBUcmFuc2l0aW9uYWJsZSA9IHJlcXVpcmUoJy4uL3RyYW5zaXRpb25zL1RyYW5zaXRpb25hYmxlJyk7XG52YXIgVHJhbnNpdGlvbmFibGVUcmFuc2Zvcm0gPSByZXF1aXJlKCcuLi90cmFuc2l0aW9ucy9UcmFuc2l0aW9uYWJsZVRyYW5zZm9ybScpO1xuZnVuY3Rpb24gU3RhdGVNb2RpZmllcihvcHRpb25zKSB7XG4gICAgdGhpcy5fdHJhbnNmb3JtU3RhdGUgPSBuZXcgVHJhbnNpdGlvbmFibGVUcmFuc2Zvcm0oVHJhbnNmb3JtLmlkZW50aXR5KTtcbiAgICB0aGlzLl9vcGFjaXR5U3RhdGUgPSBuZXcgVHJhbnNpdGlvbmFibGUoMSk7XG4gICAgdGhpcy5fb3JpZ2luU3RhdGUgPSBuZXcgVHJhbnNpdGlvbmFibGUoW1xuICAgICAgICAwLFxuICAgICAgICAwXG4gICAgXSk7XG4gICAgdGhpcy5fYWxpZ25TdGF0ZSA9IG5ldyBUcmFuc2l0aW9uYWJsZShbXG4gICAgICAgIDAsXG4gICAgICAgIDBcbiAgICBdKTtcbiAgICB0aGlzLl9zaXplU3RhdGUgPSBuZXcgVHJhbnNpdGlvbmFibGUoW1xuICAgICAgICAwLFxuICAgICAgICAwXG4gICAgXSk7XG4gICAgdGhpcy5fcHJvcG9ydGlvbnNTdGF0ZSA9IG5ldyBUcmFuc2l0aW9uYWJsZShbXG4gICAgICAgIDAsXG4gICAgICAgIDBcbiAgICBdKTtcbiAgICB0aGlzLl9tb2RpZmllciA9IG5ldyBNb2RpZmllcih7XG4gICAgICAgIHRyYW5zZm9ybTogdGhpcy5fdHJhbnNmb3JtU3RhdGUsXG4gICAgICAgIG9wYWNpdHk6IHRoaXMuX29wYWNpdHlTdGF0ZSxcbiAgICAgICAgb3JpZ2luOiBudWxsLFxuICAgICAgICBhbGlnbjogbnVsbCxcbiAgICAgICAgc2l6ZTogbnVsbCxcbiAgICAgICAgcHJvcG9ydGlvbnM6IG51bGxcbiAgICB9KTtcbiAgICB0aGlzLl9oYXNPcmlnaW4gPSBmYWxzZTtcbiAgICB0aGlzLl9oYXNBbGlnbiA9IGZhbHNlO1xuICAgIHRoaXMuX2hhc1NpemUgPSBmYWxzZTtcbiAgICB0aGlzLl9oYXNQcm9wb3J0aW9ucyA9IGZhbHNlO1xuICAgIGlmIChvcHRpb25zKSB7XG4gICAgICAgIGlmIChvcHRpb25zLnRyYW5zZm9ybSlcbiAgICAgICAgICAgIHRoaXMuc2V0VHJhbnNmb3JtKG9wdGlvbnMudHJhbnNmb3JtKTtcbiAgICAgICAgaWYgKG9wdGlvbnMub3BhY2l0eSAhPT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgdGhpcy5zZXRPcGFjaXR5KG9wdGlvbnMub3BhY2l0eSk7XG4gICAgICAgIGlmIChvcHRpb25zLm9yaWdpbilcbiAgICAgICAgICAgIHRoaXMuc2V0T3JpZ2luKG9wdGlvbnMub3JpZ2luKTtcbiAgICAgICAgaWYgKG9wdGlvbnMuYWxpZ24pXG4gICAgICAgICAgICB0aGlzLnNldEFsaWduKG9wdGlvbnMuYWxpZ24pO1xuICAgICAgICBpZiAob3B0aW9ucy5zaXplKVxuICAgICAgICAgICAgdGhpcy5zZXRTaXplKG9wdGlvbnMuc2l6ZSk7XG4gICAgICAgIGlmIChvcHRpb25zLnByb3BvcnRpb25zKVxuICAgICAgICAgICAgdGhpcy5zZXRQcm9wb3J0aW9ucyhvcHRpb25zLnByb3BvcnRpb25zKTtcbiAgICB9XG59XG5TdGF0ZU1vZGlmaWVyLnByb3RvdHlwZS5zZXRUcmFuc2Zvcm0gPSBmdW5jdGlvbiBzZXRUcmFuc2Zvcm0odHJhbnNmb3JtLCB0cmFuc2l0aW9uLCBjYWxsYmFjaykge1xuICAgIHRoaXMuX3RyYW5zZm9ybVN0YXRlLnNldCh0cmFuc2Zvcm0sIHRyYW5zaXRpb24sIGNhbGxiYWNrKTtcbiAgICByZXR1cm4gdGhpcztcbn07XG5TdGF0ZU1vZGlmaWVyLnByb3RvdHlwZS5zZXRPcGFjaXR5ID0gZnVuY3Rpb24gc2V0T3BhY2l0eShvcGFjaXR5LCB0cmFuc2l0aW9uLCBjYWxsYmFjaykge1xuICAgIHRoaXMuX29wYWNpdHlTdGF0ZS5zZXQob3BhY2l0eSwgdHJhbnNpdGlvbiwgY2FsbGJhY2spO1xuICAgIHJldHVybiB0aGlzO1xufTtcblN0YXRlTW9kaWZpZXIucHJvdG90eXBlLnNldE9yaWdpbiA9IGZ1bmN0aW9uIHNldE9yaWdpbihvcmlnaW4sIHRyYW5zaXRpb24sIGNhbGxiYWNrKSB7XG4gICAgaWYgKG9yaWdpbiA9PT0gbnVsbCkge1xuICAgICAgICBpZiAodGhpcy5faGFzT3JpZ2luKSB7XG4gICAgICAgICAgICB0aGlzLl9tb2RpZmllci5vcmlnaW5Gcm9tKG51bGwpO1xuICAgICAgICAgICAgdGhpcy5faGFzT3JpZ2luID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSBlbHNlIGlmICghdGhpcy5faGFzT3JpZ2luKSB7XG4gICAgICAgIHRoaXMuX2hhc09yaWdpbiA9IHRydWU7XG4gICAgICAgIHRoaXMuX21vZGlmaWVyLm9yaWdpbkZyb20odGhpcy5fb3JpZ2luU3RhdGUpO1xuICAgIH1cbiAgICB0aGlzLl9vcmlnaW5TdGF0ZS5zZXQob3JpZ2luLCB0cmFuc2l0aW9uLCBjYWxsYmFjayk7XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuU3RhdGVNb2RpZmllci5wcm90b3R5cGUuc2V0QWxpZ24gPSBmdW5jdGlvbiBzZXRPcmlnaW4oYWxpZ24sIHRyYW5zaXRpb24sIGNhbGxiYWNrKSB7XG4gICAgaWYgKGFsaWduID09PSBudWxsKSB7XG4gICAgICAgIGlmICh0aGlzLl9oYXNBbGlnbikge1xuICAgICAgICAgICAgdGhpcy5fbW9kaWZpZXIuYWxpZ25Gcm9tKG51bGwpO1xuICAgICAgICAgICAgdGhpcy5faGFzQWxpZ24gPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9IGVsc2UgaWYgKCF0aGlzLl9oYXNBbGlnbikge1xuICAgICAgICB0aGlzLl9oYXNBbGlnbiA9IHRydWU7XG4gICAgICAgIHRoaXMuX21vZGlmaWVyLmFsaWduRnJvbSh0aGlzLl9hbGlnblN0YXRlKTtcbiAgICB9XG4gICAgdGhpcy5fYWxpZ25TdGF0ZS5zZXQoYWxpZ24sIHRyYW5zaXRpb24sIGNhbGxiYWNrKTtcbiAgICByZXR1cm4gdGhpcztcbn07XG5TdGF0ZU1vZGlmaWVyLnByb3RvdHlwZS5zZXRTaXplID0gZnVuY3Rpb24gc2V0U2l6ZShzaXplLCB0cmFuc2l0aW9uLCBjYWxsYmFjaykge1xuICAgIGlmIChzaXplID09PSBudWxsKSB7XG4gICAgICAgIGlmICh0aGlzLl9oYXNTaXplKSB7XG4gICAgICAgICAgICB0aGlzLl9tb2RpZmllci5zaXplRnJvbShudWxsKTtcbiAgICAgICAgICAgIHRoaXMuX2hhc1NpemUgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9IGVsc2UgaWYgKCF0aGlzLl9oYXNTaXplKSB7XG4gICAgICAgIHRoaXMuX2hhc1NpemUgPSB0cnVlO1xuICAgICAgICB0aGlzLl9tb2RpZmllci5zaXplRnJvbSh0aGlzLl9zaXplU3RhdGUpO1xuICAgIH1cbiAgICB0aGlzLl9zaXplU3RhdGUuc2V0KHNpemUsIHRyYW5zaXRpb24sIGNhbGxiYWNrKTtcbiAgICByZXR1cm4gdGhpcztcbn07XG5TdGF0ZU1vZGlmaWVyLnByb3RvdHlwZS5zZXRQcm9wb3J0aW9ucyA9IGZ1bmN0aW9uIHNldFNpemUocHJvcG9ydGlvbnMsIHRyYW5zaXRpb24sIGNhbGxiYWNrKSB7XG4gICAgaWYgKHByb3BvcnRpb25zID09PSBudWxsKSB7XG4gICAgICAgIGlmICh0aGlzLl9oYXNQcm9wb3J0aW9ucykge1xuICAgICAgICAgICAgdGhpcy5fbW9kaWZpZXIucHJvcG9ydGlvbnNGcm9tKG51bGwpO1xuICAgICAgICAgICAgdGhpcy5faGFzUHJvcG9ydGlvbnMgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9IGVsc2UgaWYgKCF0aGlzLl9oYXNQcm9wb3J0aW9ucykge1xuICAgICAgICB0aGlzLl9oYXNQcm9wb3J0aW9ucyA9IHRydWU7XG4gICAgICAgIHRoaXMuX21vZGlmaWVyLnByb3BvcnRpb25zRnJvbSh0aGlzLl9wcm9wb3J0aW9uc1N0YXRlKTtcbiAgICB9XG4gICAgdGhpcy5fcHJvcG9ydGlvbnNTdGF0ZS5zZXQocHJvcG9ydGlvbnMsIHRyYW5zaXRpb24sIGNhbGxiYWNrKTtcbiAgICByZXR1cm4gdGhpcztcbn07XG5TdGF0ZU1vZGlmaWVyLnByb3RvdHlwZS5oYWx0ID0gZnVuY3Rpb24gaGFsdCgpIHtcbiAgICB0aGlzLl90cmFuc2Zvcm1TdGF0ZS5oYWx0KCk7XG4gICAgdGhpcy5fb3BhY2l0eVN0YXRlLmhhbHQoKTtcbiAgICB0aGlzLl9vcmlnaW5TdGF0ZS5oYWx0KCk7XG4gICAgdGhpcy5fYWxpZ25TdGF0ZS5oYWx0KCk7XG4gICAgdGhpcy5fc2l6ZVN0YXRlLmhhbHQoKTtcbiAgICB0aGlzLl9wcm9wb3J0aW9uc1N0YXRlLmhhbHQoKTtcbn07XG5TdGF0ZU1vZGlmaWVyLnByb3RvdHlwZS5nZXRUcmFuc2Zvcm0gPSBmdW5jdGlvbiBnZXRUcmFuc2Zvcm0oKSB7XG4gICAgcmV0dXJuIHRoaXMuX3RyYW5zZm9ybVN0YXRlLmdldCgpO1xufTtcblN0YXRlTW9kaWZpZXIucHJvdG90eXBlLmdldEZpbmFsVHJhbnNmb3JtID0gZnVuY3Rpb24gZ2V0RmluYWxUcmFuc2Zvcm0oKSB7XG4gICAgcmV0dXJuIHRoaXMuX3RyYW5zZm9ybVN0YXRlLmdldEZpbmFsKCk7XG59O1xuU3RhdGVNb2RpZmllci5wcm90b3R5cGUuZ2V0T3BhY2l0eSA9IGZ1bmN0aW9uIGdldE9wYWNpdHkoKSB7XG4gICAgcmV0dXJuIHRoaXMuX29wYWNpdHlTdGF0ZS5nZXQoKTtcbn07XG5TdGF0ZU1vZGlmaWVyLnByb3RvdHlwZS5nZXRPcmlnaW4gPSBmdW5jdGlvbiBnZXRPcmlnaW4oKSB7XG4gICAgcmV0dXJuIHRoaXMuX2hhc09yaWdpbiA/IHRoaXMuX29yaWdpblN0YXRlLmdldCgpIDogbnVsbDtcbn07XG5TdGF0ZU1vZGlmaWVyLnByb3RvdHlwZS5nZXRBbGlnbiA9IGZ1bmN0aW9uIGdldEFsaWduKCkge1xuICAgIHJldHVybiB0aGlzLl9oYXNBbGlnbiA/IHRoaXMuX2FsaWduU3RhdGUuZ2V0KCkgOiBudWxsO1xufTtcblN0YXRlTW9kaWZpZXIucHJvdG90eXBlLmdldFNpemUgPSBmdW5jdGlvbiBnZXRTaXplKCkge1xuICAgIHJldHVybiB0aGlzLl9oYXNTaXplID8gdGhpcy5fc2l6ZVN0YXRlLmdldCgpIDogbnVsbDtcbn07XG5TdGF0ZU1vZGlmaWVyLnByb3RvdHlwZS5nZXRQcm9wb3J0aW9ucyA9IGZ1bmN0aW9uIGdldFByb3BvcnRpb25zKCkge1xuICAgIHJldHVybiB0aGlzLl9oYXNQcm9wb3J0aW9ucyA/IHRoaXMuX3Byb3BvcnRpb25zU3RhdGUuZ2V0KCkgOiBudWxsO1xufTtcblN0YXRlTW9kaWZpZXIucHJvdG90eXBlLm1vZGlmeSA9IGZ1bmN0aW9uIG1vZGlmeSh0YXJnZXQpIHtcbiAgICByZXR1cm4gdGhpcy5fbW9kaWZpZXIubW9kaWZ5KHRhcmdldCk7XG59O1xubW9kdWxlLmV4cG9ydHMgPSBTdGF0ZU1vZGlmaWVyOyIsInZhciBFdmVudEhhbmRsZXIgPSByZXF1aXJlKCcuLi9jb3JlL0V2ZW50SGFuZGxlcicpO1xuZnVuY3Rpb24gUGh5c2ljc0VuZ2luZShvcHRpb25zKSB7XG4gICAgdGhpcy5vcHRpb25zID0gT2JqZWN0LmNyZWF0ZShQaHlzaWNzRW5naW5lLkRFRkFVTFRfT1BUSU9OUyk7XG4gICAgaWYgKG9wdGlvbnMpXG4gICAgICAgIHRoaXMuc2V0T3B0aW9ucyhvcHRpb25zKTtcbiAgICB0aGlzLl9wYXJ0aWNsZXMgPSBbXTtcbiAgICB0aGlzLl9ib2RpZXMgPSBbXTtcbiAgICB0aGlzLl9hZ2VudERhdGEgPSB7fTtcbiAgICB0aGlzLl9mb3JjZXMgPSBbXTtcbiAgICB0aGlzLl9jb25zdHJhaW50cyA9IFtdO1xuICAgIHRoaXMuX2J1ZmZlciA9IDA7XG4gICAgdGhpcy5fcHJldlRpbWUgPSBub3coKTtcbiAgICB0aGlzLl9pc1NsZWVwaW5nID0gZmFsc2U7XG4gICAgdGhpcy5fZXZlbnRIYW5kbGVyID0gbnVsbDtcbiAgICB0aGlzLl9jdXJyQWdlbnRJZCA9IDA7XG4gICAgdGhpcy5faGFzQm9kaWVzID0gZmFsc2U7XG4gICAgdGhpcy5fZXZlbnRIYW5kbGVyID0gbnVsbDtcbn1cbnZhciBUSU1FU1RFUCA9IDE3O1xudmFyIE1JTl9USU1FX1NURVAgPSAxMDAwIC8gMTIwO1xudmFyIE1BWF9USU1FX1NURVAgPSAxNztcbnZhciBub3cgPSBEYXRlLm5vdztcbnZhciBfZXZlbnRzID0ge1xuICAgICAgICBzdGFydDogJ3N0YXJ0JyxcbiAgICAgICAgdXBkYXRlOiAndXBkYXRlJyxcbiAgICAgICAgZW5kOiAnZW5kJ1xuICAgIH07XG5QaHlzaWNzRW5naW5lLkRFRkFVTFRfT1BUSU9OUyA9IHtcbiAgICBjb25zdHJhaW50U3RlcHM6IDEsXG4gICAgc2xlZXBUb2xlcmFuY2U6IDFlLTcsXG4gICAgdmVsb2NpdHlDYXA6IHVuZGVmaW5lZCxcbiAgICBhbmd1bGFyVmVsb2NpdHlDYXA6IHVuZGVmaW5lZFxufTtcblBoeXNpY3NFbmdpbmUucHJvdG90eXBlLnNldE9wdGlvbnMgPSBmdW5jdGlvbiBzZXRPcHRpb25zKG9wdHMpIHtcbiAgICBmb3IgKHZhciBrZXkgaW4gb3B0cylcbiAgICAgICAgaWYgKHRoaXMub3B0aW9uc1trZXldKVxuICAgICAgICAgICAgdGhpcy5vcHRpb25zW2tleV0gPSBvcHRzW2tleV07XG59O1xuUGh5c2ljc0VuZ2luZS5wcm90b3R5cGUuYWRkQm9keSA9IGZ1bmN0aW9uIGFkZEJvZHkoYm9keSkge1xuICAgIGJvZHkuX2VuZ2luZSA9IHRoaXM7XG4gICAgaWYgKGJvZHkuaXNCb2R5KSB7XG4gICAgICAgIHRoaXMuX2JvZGllcy5wdXNoKGJvZHkpO1xuICAgICAgICB0aGlzLl9oYXNCb2RpZXMgPSB0cnVlO1xuICAgIH0gZWxzZVxuICAgICAgICB0aGlzLl9wYXJ0aWNsZXMucHVzaChib2R5KTtcbiAgICBib2R5Lm9uKCdzdGFydCcsIHRoaXMud2FrZS5iaW5kKHRoaXMpKTtcbiAgICByZXR1cm4gYm9keTtcbn07XG5QaHlzaWNzRW5naW5lLnByb3RvdHlwZS5yZW1vdmVCb2R5ID0gZnVuY3Rpb24gcmVtb3ZlQm9keShib2R5KSB7XG4gICAgdmFyIGFycmF5ID0gYm9keS5pc0JvZHkgPyB0aGlzLl9ib2RpZXMgOiB0aGlzLl9wYXJ0aWNsZXM7XG4gICAgdmFyIGluZGV4ID0gYXJyYXkuaW5kZXhPZihib2R5KTtcbiAgICBpZiAoaW5kZXggPiAtMSkge1xuICAgICAgICBmb3IgKHZhciBhZ2VudCBpbiB0aGlzLl9hZ2VudERhdGEpXG4gICAgICAgICAgICB0aGlzLmRldGFjaEZyb20oYWdlbnQuaWQsIGJvZHkpO1xuICAgICAgICBhcnJheS5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIH1cbiAgICBpZiAodGhpcy5nZXRCb2RpZXMoKS5sZW5ndGggPT09IDApXG4gICAgICAgIHRoaXMuX2hhc0JvZGllcyA9IGZhbHNlO1xufTtcbmZ1bmN0aW9uIF9tYXBBZ2VudEFycmF5KGFnZW50KSB7XG4gICAgaWYgKGFnZW50LmFwcGx5Rm9yY2UpXG4gICAgICAgIHJldHVybiB0aGlzLl9mb3JjZXM7XG4gICAgaWYgKGFnZW50LmFwcGx5Q29uc3RyYWludClcbiAgICAgICAgcmV0dXJuIHRoaXMuX2NvbnN0cmFpbnRzO1xufVxuZnVuY3Rpb24gX2F0dGFjaE9uZShhZ2VudCwgdGFyZ2V0cywgc291cmNlKSB7XG4gICAgaWYgKHRhcmdldHMgPT09IHVuZGVmaW5lZClcbiAgICAgICAgdGFyZ2V0cyA9IHRoaXMuZ2V0UGFydGljbGVzQW5kQm9kaWVzKCk7XG4gICAgaWYgKCEodGFyZ2V0cyBpbnN0YW5jZW9mIEFycmF5KSlcbiAgICAgICAgdGFyZ2V0cyA9IFt0YXJnZXRzXTtcbiAgICBhZ2VudC5vbignY2hhbmdlJywgdGhpcy53YWtlLmJpbmQodGhpcykpO1xuICAgIHRoaXMuX2FnZW50RGF0YVt0aGlzLl9jdXJyQWdlbnRJZF0gPSB7XG4gICAgICAgIGFnZW50OiBhZ2VudCxcbiAgICAgICAgaWQ6IHRoaXMuX2N1cnJBZ2VudElkLFxuICAgICAgICB0YXJnZXRzOiB0YXJnZXRzLFxuICAgICAgICBzb3VyY2U6IHNvdXJjZVxuICAgIH07XG4gICAgX21hcEFnZW50QXJyYXkuY2FsbCh0aGlzLCBhZ2VudCkucHVzaCh0aGlzLl9jdXJyQWdlbnRJZCk7XG4gICAgcmV0dXJuIHRoaXMuX2N1cnJBZ2VudElkKys7XG59XG5QaHlzaWNzRW5naW5lLnByb3RvdHlwZS5hdHRhY2ggPSBmdW5jdGlvbiBhdHRhY2goYWdlbnRzLCB0YXJnZXRzLCBzb3VyY2UpIHtcbiAgICB0aGlzLndha2UoKTtcbiAgICBpZiAoYWdlbnRzIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgICAgdmFyIGFnZW50SURzID0gW107XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYWdlbnRzLmxlbmd0aDsgaSsrKVxuICAgICAgICAgICAgYWdlbnRJRHNbaV0gPSBfYXR0YWNoT25lLmNhbGwodGhpcywgYWdlbnRzW2ldLCB0YXJnZXRzLCBzb3VyY2UpO1xuICAgICAgICByZXR1cm4gYWdlbnRJRHM7XG4gICAgfSBlbHNlXG4gICAgICAgIHJldHVybiBfYXR0YWNoT25lLmNhbGwodGhpcywgYWdlbnRzLCB0YXJnZXRzLCBzb3VyY2UpO1xufTtcblBoeXNpY3NFbmdpbmUucHJvdG90eXBlLmF0dGFjaFRvID0gZnVuY3Rpb24gYXR0YWNoVG8oYWdlbnRJRCwgdGFyZ2V0KSB7XG4gICAgX2dldEFnZW50RGF0YS5jYWxsKHRoaXMsIGFnZW50SUQpLnRhcmdldHMucHVzaCh0YXJnZXQpO1xufTtcblBoeXNpY3NFbmdpbmUucHJvdG90eXBlLmRldGFjaCA9IGZ1bmN0aW9uIGRldGFjaChpZCkge1xuICAgIHZhciBhZ2VudCA9IHRoaXMuZ2V0QWdlbnQoaWQpO1xuICAgIHZhciBhZ2VudEFycmF5ID0gX21hcEFnZW50QXJyYXkuY2FsbCh0aGlzLCBhZ2VudCk7XG4gICAgdmFyIGluZGV4ID0gYWdlbnRBcnJheS5pbmRleE9mKGlkKTtcbiAgICBhZ2VudEFycmF5LnNwbGljZShpbmRleCwgMSk7XG4gICAgZGVsZXRlIHRoaXMuX2FnZW50RGF0YVtpZF07XG59O1xuUGh5c2ljc0VuZ2luZS5wcm90b3R5cGUuZGV0YWNoRnJvbSA9IGZ1bmN0aW9uIGRldGFjaEZyb20oaWQsIHRhcmdldCkge1xuICAgIHZhciBib3VuZEFnZW50ID0gX2dldEFnZW50RGF0YS5jYWxsKHRoaXMsIGlkKTtcbiAgICBpZiAoYm91bmRBZ2VudC5zb3VyY2UgPT09IHRhcmdldClcbiAgICAgICAgdGhpcy5kZXRhY2goaWQpO1xuICAgIGVsc2Uge1xuICAgICAgICB2YXIgdGFyZ2V0cyA9IGJvdW5kQWdlbnQudGFyZ2V0cztcbiAgICAgICAgdmFyIGluZGV4ID0gdGFyZ2V0cy5pbmRleE9mKHRhcmdldCk7XG4gICAgICAgIGlmIChpbmRleCA+IC0xKVxuICAgICAgICAgICAgdGFyZ2V0cy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIH1cbn07XG5QaHlzaWNzRW5naW5lLnByb3RvdHlwZS5kZXRhY2hBbGwgPSBmdW5jdGlvbiBkZXRhY2hBbGwoKSB7XG4gICAgdGhpcy5fYWdlbnREYXRhID0ge307XG4gICAgdGhpcy5fZm9yY2VzID0gW107XG4gICAgdGhpcy5fY29uc3RyYWludHMgPSBbXTtcbiAgICB0aGlzLl9jdXJyQWdlbnRJZCA9IDA7XG59O1xuZnVuY3Rpb24gX2dldEFnZW50RGF0YShpZCkge1xuICAgIHJldHVybiB0aGlzLl9hZ2VudERhdGFbaWRdO1xufVxuUGh5c2ljc0VuZ2luZS5wcm90b3R5cGUuZ2V0QWdlbnQgPSBmdW5jdGlvbiBnZXRBZ2VudChpZCkge1xuICAgIHJldHVybiBfZ2V0QWdlbnREYXRhLmNhbGwodGhpcywgaWQpLmFnZW50O1xufTtcblBoeXNpY3NFbmdpbmUucHJvdG90eXBlLmdldFBhcnRpY2xlcyA9IGZ1bmN0aW9uIGdldFBhcnRpY2xlcygpIHtcbiAgICByZXR1cm4gdGhpcy5fcGFydGljbGVzO1xufTtcblBoeXNpY3NFbmdpbmUucHJvdG90eXBlLmdldEJvZGllcyA9IGZ1bmN0aW9uIGdldEJvZGllcygpIHtcbiAgICByZXR1cm4gdGhpcy5fYm9kaWVzO1xufTtcblBoeXNpY3NFbmdpbmUucHJvdG90eXBlLmdldFBhcnRpY2xlc0FuZEJvZGllcyA9IGZ1bmN0aW9uIGdldFBhcnRpY2xlc0FuZEJvZGllcygpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRQYXJ0aWNsZXMoKS5jb25jYXQodGhpcy5nZXRCb2RpZXMoKSk7XG59O1xuUGh5c2ljc0VuZ2luZS5wcm90b3R5cGUuZm9yRWFjaFBhcnRpY2xlID0gZnVuY3Rpb24gZm9yRWFjaFBhcnRpY2xlKGZuLCBkdCkge1xuICAgIHZhciBwYXJ0aWNsZXMgPSB0aGlzLmdldFBhcnRpY2xlcygpO1xuICAgIGZvciAodmFyIGluZGV4ID0gMCwgbGVuID0gcGFydGljbGVzLmxlbmd0aDsgaW5kZXggPCBsZW47IGluZGV4KyspXG4gICAgICAgIGZuLmNhbGwodGhpcywgcGFydGljbGVzW2luZGV4XSwgZHQpO1xufTtcblBoeXNpY3NFbmdpbmUucHJvdG90eXBlLmZvckVhY2hCb2R5ID0gZnVuY3Rpb24gZm9yRWFjaEJvZHkoZm4sIGR0KSB7XG4gICAgaWYgKCF0aGlzLl9oYXNCb2RpZXMpXG4gICAgICAgIHJldHVybjtcbiAgICB2YXIgYm9kaWVzID0gdGhpcy5nZXRCb2RpZXMoKTtcbiAgICBmb3IgKHZhciBpbmRleCA9IDAsIGxlbiA9IGJvZGllcy5sZW5ndGg7IGluZGV4IDwgbGVuOyBpbmRleCsrKVxuICAgICAgICBmbi5jYWxsKHRoaXMsIGJvZGllc1tpbmRleF0sIGR0KTtcbn07XG5QaHlzaWNzRW5naW5lLnByb3RvdHlwZS5mb3JFYWNoID0gZnVuY3Rpb24gZm9yRWFjaChmbiwgZHQpIHtcbiAgICB0aGlzLmZvckVhY2hQYXJ0aWNsZShmbiwgZHQpO1xuICAgIHRoaXMuZm9yRWFjaEJvZHkoZm4sIGR0KTtcbn07XG5mdW5jdGlvbiBfdXBkYXRlRm9yY2UoaW5kZXgpIHtcbiAgICB2YXIgYm91bmRBZ2VudCA9IF9nZXRBZ2VudERhdGEuY2FsbCh0aGlzLCB0aGlzLl9mb3JjZXNbaW5kZXhdKTtcbiAgICBib3VuZEFnZW50LmFnZW50LmFwcGx5Rm9yY2UoYm91bmRBZ2VudC50YXJnZXRzLCBib3VuZEFnZW50LnNvdXJjZSk7XG59XG5mdW5jdGlvbiBfdXBkYXRlRm9yY2VzKCkge1xuICAgIGZvciAodmFyIGluZGV4ID0gdGhpcy5fZm9yY2VzLmxlbmd0aCAtIDE7IGluZGV4ID4gLTE7IGluZGV4LS0pXG4gICAgICAgIF91cGRhdGVGb3JjZS5jYWxsKHRoaXMsIGluZGV4KTtcbn1cbmZ1bmN0aW9uIF91cGRhdGVDb25zdHJhaW50KGluZGV4LCBkdCkge1xuICAgIHZhciBib3VuZEFnZW50ID0gdGhpcy5fYWdlbnREYXRhW3RoaXMuX2NvbnN0cmFpbnRzW2luZGV4XV07XG4gICAgcmV0dXJuIGJvdW5kQWdlbnQuYWdlbnQuYXBwbHlDb25zdHJhaW50KGJvdW5kQWdlbnQudGFyZ2V0cywgYm91bmRBZ2VudC5zb3VyY2UsIGR0KTtcbn1cbmZ1bmN0aW9uIF91cGRhdGVDb25zdHJhaW50cyhkdCkge1xuICAgIHZhciBpdGVyYXRpb24gPSAwO1xuICAgIHdoaWxlIChpdGVyYXRpb24gPCB0aGlzLm9wdGlvbnMuY29uc3RyYWludFN0ZXBzKSB7XG4gICAgICAgIGZvciAodmFyIGluZGV4ID0gdGhpcy5fY29uc3RyYWludHMubGVuZ3RoIC0gMTsgaW5kZXggPiAtMTsgaW5kZXgtLSlcbiAgICAgICAgICAgIF91cGRhdGVDb25zdHJhaW50LmNhbGwodGhpcywgaW5kZXgsIGR0KTtcbiAgICAgICAgaXRlcmF0aW9uKys7XG4gICAgfVxufVxuZnVuY3Rpb24gX3VwZGF0ZVZlbG9jaXRpZXMoYm9keSwgZHQpIHtcbiAgICBib2R5LmludGVncmF0ZVZlbG9jaXR5KGR0KTtcbiAgICBpZiAodGhpcy5vcHRpb25zLnZlbG9jaXR5Q2FwKVxuICAgICAgICBib2R5LnZlbG9jaXR5LmNhcCh0aGlzLm9wdGlvbnMudmVsb2NpdHlDYXApLnB1dChib2R5LnZlbG9jaXR5KTtcbn1cbmZ1bmN0aW9uIF91cGRhdGVBbmd1bGFyVmVsb2NpdGllcyhib2R5LCBkdCkge1xuICAgIGJvZHkuaW50ZWdyYXRlQW5ndWxhck1vbWVudHVtKGR0KTtcbiAgICBib2R5LnVwZGF0ZUFuZ3VsYXJWZWxvY2l0eSgpO1xuICAgIGlmICh0aGlzLm9wdGlvbnMuYW5ndWxhclZlbG9jaXR5Q2FwKVxuICAgICAgICBib2R5LmFuZ3VsYXJWZWxvY2l0eS5jYXAodGhpcy5vcHRpb25zLmFuZ3VsYXJWZWxvY2l0eUNhcCkucHV0KGJvZHkuYW5ndWxhclZlbG9jaXR5KTtcbn1cbmZ1bmN0aW9uIF91cGRhdGVPcmllbnRhdGlvbnMoYm9keSwgZHQpIHtcbiAgICBib2R5LmludGVncmF0ZU9yaWVudGF0aW9uKGR0KTtcbn1cbmZ1bmN0aW9uIF91cGRhdGVQb3NpdGlvbnMoYm9keSwgZHQpIHtcbiAgICBib2R5LmludGVncmF0ZVBvc2l0aW9uKGR0KTtcbiAgICBib2R5LmVtaXQoX2V2ZW50cy51cGRhdGUsIGJvZHkpO1xufVxuZnVuY3Rpb24gX2ludGVncmF0ZShkdCkge1xuICAgIF91cGRhdGVGb3JjZXMuY2FsbCh0aGlzLCBkdCk7XG4gICAgdGhpcy5mb3JFYWNoKF91cGRhdGVWZWxvY2l0aWVzLCBkdCk7XG4gICAgdGhpcy5mb3JFYWNoQm9keShfdXBkYXRlQW5ndWxhclZlbG9jaXRpZXMsIGR0KTtcbiAgICBfdXBkYXRlQ29uc3RyYWludHMuY2FsbCh0aGlzLCBkdCk7XG4gICAgdGhpcy5mb3JFYWNoQm9keShfdXBkYXRlT3JpZW50YXRpb25zLCBkdCk7XG4gICAgdGhpcy5mb3JFYWNoKF91cGRhdGVQb3NpdGlvbnMsIGR0KTtcbn1cbmZ1bmN0aW9uIF9nZXRQYXJ0aWNsZXNFbmVyZ3koKSB7XG4gICAgdmFyIGVuZXJneSA9IDA7XG4gICAgdmFyIHBhcnRpY2xlRW5lcmd5ID0gMDtcbiAgICB0aGlzLmZvckVhY2goZnVuY3Rpb24gKHBhcnRpY2xlKSB7XG4gICAgICAgIHBhcnRpY2xlRW5lcmd5ID0gcGFydGljbGUuZ2V0RW5lcmd5KCk7XG4gICAgICAgIGVuZXJneSArPSBwYXJ0aWNsZUVuZXJneTtcbiAgICB9KTtcbiAgICByZXR1cm4gZW5lcmd5O1xufVxuZnVuY3Rpb24gX2dldEFnZW50c0VuZXJneSgpIHtcbiAgICB2YXIgZW5lcmd5ID0gMDtcbiAgICBmb3IgKHZhciBpZCBpbiB0aGlzLl9hZ2VudERhdGEpXG4gICAgICAgIGVuZXJneSArPSB0aGlzLmdldEFnZW50RW5lcmd5KGlkKTtcbiAgICByZXR1cm4gZW5lcmd5O1xufVxuUGh5c2ljc0VuZ2luZS5wcm90b3R5cGUuZ2V0QWdlbnRFbmVyZ3kgPSBmdW5jdGlvbiAoYWdlbnRJZCkge1xuICAgIHZhciBhZ2VudERhdGEgPSBfZ2V0QWdlbnREYXRhLmNhbGwodGhpcywgYWdlbnRJZCk7XG4gICAgcmV0dXJuIGFnZW50RGF0YS5hZ2VudC5nZXRFbmVyZ3koYWdlbnREYXRhLnRhcmdldHMsIGFnZW50RGF0YS5zb3VyY2UpO1xufTtcblBoeXNpY3NFbmdpbmUucHJvdG90eXBlLmdldEVuZXJneSA9IGZ1bmN0aW9uIGdldEVuZXJneSgpIHtcbiAgICByZXR1cm4gX2dldFBhcnRpY2xlc0VuZXJneS5jYWxsKHRoaXMpICsgX2dldEFnZW50c0VuZXJneS5jYWxsKHRoaXMpO1xufTtcblBoeXNpY3NFbmdpbmUucHJvdG90eXBlLnN0ZXAgPSBmdW5jdGlvbiBzdGVwKCkge1xuICAgIGlmICh0aGlzLmlzU2xlZXBpbmcoKSlcbiAgICAgICAgcmV0dXJuO1xuICAgIHZhciBjdXJyVGltZSA9IG5vdygpO1xuICAgIHZhciBkdEZyYW1lID0gY3VyclRpbWUgLSB0aGlzLl9wcmV2VGltZTtcbiAgICB0aGlzLl9wcmV2VGltZSA9IGN1cnJUaW1lO1xuICAgIGlmIChkdEZyYW1lIDwgTUlOX1RJTUVfU1RFUClcbiAgICAgICAgcmV0dXJuO1xuICAgIGlmIChkdEZyYW1lID4gTUFYX1RJTUVfU1RFUClcbiAgICAgICAgZHRGcmFtZSA9IE1BWF9USU1FX1NURVA7XG4gICAgX2ludGVncmF0ZS5jYWxsKHRoaXMsIFRJTUVTVEVQKTtcbiAgICB0aGlzLmVtaXQoX2V2ZW50cy51cGRhdGUsIHRoaXMpO1xuICAgIGlmICh0aGlzLmdldEVuZXJneSgpIDwgdGhpcy5vcHRpb25zLnNsZWVwVG9sZXJhbmNlKVxuICAgICAgICB0aGlzLnNsZWVwKCk7XG59O1xuUGh5c2ljc0VuZ2luZS5wcm90b3R5cGUuaXNTbGVlcGluZyA9IGZ1bmN0aW9uIGlzU2xlZXBpbmcoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2lzU2xlZXBpbmc7XG59O1xuUGh5c2ljc0VuZ2luZS5wcm90b3R5cGUuaXNBY3RpdmUgPSBmdW5jdGlvbiBpc1NsZWVwaW5nKCkge1xuICAgIHJldHVybiAhdGhpcy5faXNTbGVlcGluZztcbn07XG5QaHlzaWNzRW5naW5lLnByb3RvdHlwZS5zbGVlcCA9IGZ1bmN0aW9uIHNsZWVwKCkge1xuICAgIGlmICh0aGlzLl9pc1NsZWVwaW5nKVxuICAgICAgICByZXR1cm47XG4gICAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uIChib2R5KSB7XG4gICAgICAgIGJvZHkuc2xlZXAoKTtcbiAgICB9KTtcbiAgICB0aGlzLmVtaXQoX2V2ZW50cy5lbmQsIHRoaXMpO1xuICAgIHRoaXMuX2lzU2xlZXBpbmcgPSB0cnVlO1xufTtcblBoeXNpY3NFbmdpbmUucHJvdG90eXBlLndha2UgPSBmdW5jdGlvbiB3YWtlKCkge1xuICAgIGlmICghdGhpcy5faXNTbGVlcGluZylcbiAgICAgICAgcmV0dXJuO1xuICAgIHRoaXMuX3ByZXZUaW1lID0gbm93KCk7XG4gICAgdGhpcy5lbWl0KF9ldmVudHMuc3RhcnQsIHRoaXMpO1xuICAgIHRoaXMuX2lzU2xlZXBpbmcgPSBmYWxzZTtcbn07XG5QaHlzaWNzRW5naW5lLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24gZW1pdCh0eXBlLCBkYXRhKSB7XG4gICAgaWYgKHRoaXMuX2V2ZW50SGFuZGxlciA9PT0gbnVsbClcbiAgICAgICAgcmV0dXJuO1xuICAgIHRoaXMuX2V2ZW50SGFuZGxlci5lbWl0KHR5cGUsIGRhdGEpO1xufTtcblBoeXNpY3NFbmdpbmUucHJvdG90eXBlLm9uID0gZnVuY3Rpb24gb24oZXZlbnQsIGZuKSB7XG4gICAgaWYgKHRoaXMuX2V2ZW50SGFuZGxlciA9PT0gbnVsbClcbiAgICAgICAgdGhpcy5fZXZlbnRIYW5kbGVyID0gbmV3IEV2ZW50SGFuZGxlcigpO1xuICAgIHRoaXMuX2V2ZW50SGFuZGxlci5vbihldmVudCwgZm4pO1xufTtcbm1vZHVsZS5leHBvcnRzID0gUGh5c2ljc0VuZ2luZTsiLCJ2YXIgUGFydGljbGUgPSByZXF1aXJlKCcuL1BhcnRpY2xlJyk7XG52YXIgVHJhbnNmb3JtID0gcmVxdWlyZSgnLi4vLi4vY29yZS9UcmFuc2Zvcm0nKTtcbnZhciBWZWN0b3IgPSByZXF1aXJlKCcuLi8uLi9tYXRoL1ZlY3RvcicpO1xudmFyIFF1YXRlcm5pb24gPSByZXF1aXJlKCcuLi8uLi9tYXRoL1F1YXRlcm5pb24nKTtcbnZhciBNYXRyaXggPSByZXF1aXJlKCcuLi8uLi9tYXRoL01hdHJpeCcpO1xudmFyIEludGVncmF0b3IgPSByZXF1aXJlKCcuLi9pbnRlZ3JhdG9ycy9TeW1wbGVjdGljRXVsZXInKTtcbmZ1bmN0aW9uIEJvZHkob3B0aW9ucykge1xuICAgIFBhcnRpY2xlLmNhbGwodGhpcywgb3B0aW9ucyk7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgdGhpcy5vcmllbnRhdGlvbiA9IG5ldyBRdWF0ZXJuaW9uKCk7XG4gICAgdGhpcy5hbmd1bGFyVmVsb2NpdHkgPSBuZXcgVmVjdG9yKCk7XG4gICAgdGhpcy5hbmd1bGFyTW9tZW50dW0gPSBuZXcgVmVjdG9yKCk7XG4gICAgdGhpcy50b3JxdWUgPSBuZXcgVmVjdG9yKCk7XG4gICAgaWYgKG9wdGlvbnMub3JpZW50YXRpb24pXG4gICAgICAgIHRoaXMub3JpZW50YXRpb24uc2V0KG9wdGlvbnMub3JpZW50YXRpb24pO1xuICAgIGlmIChvcHRpb25zLmFuZ3VsYXJWZWxvY2l0eSlcbiAgICAgICAgdGhpcy5hbmd1bGFyVmVsb2NpdHkuc2V0KG9wdGlvbnMuYW5ndWxhclZlbG9jaXR5KTtcbiAgICBpZiAob3B0aW9ucy5hbmd1bGFyTW9tZW50dW0pXG4gICAgICAgIHRoaXMuYW5ndWxhck1vbWVudHVtLnNldChvcHRpb25zLmFuZ3VsYXJNb21lbnR1bSk7XG4gICAgaWYgKG9wdGlvbnMudG9ycXVlKVxuICAgICAgICB0aGlzLnRvcnF1ZS5zZXQob3B0aW9ucy50b3JxdWUpO1xuICAgIHRoaXMuYW5ndWxhclZlbG9jaXR5LncgPSAwO1xuICAgIHRoaXMuc2V0TW9tZW50c09mSW5lcnRpYSgpO1xuICAgIHRoaXMucFdvcmxkID0gbmV3IFZlY3RvcigpO1xufVxuQm9keS5ERUZBVUxUX09QVElPTlMgPSBQYXJ0aWNsZS5ERUZBVUxUX09QVElPTlM7XG5Cb2R5LkRFRkFVTFRfT1BUSU9OUy5vcmllbnRhdGlvbiA9IFtcbiAgICAwLFxuICAgIDAsXG4gICAgMCxcbiAgICAxXG5dO1xuQm9keS5ERUZBVUxUX09QVElPTlMuYW5ndWxhclZlbG9jaXR5ID0gW1xuICAgIDAsXG4gICAgMCxcbiAgICAwXG5dO1xuQm9keS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBhcnRpY2xlLnByb3RvdHlwZSk7XG5Cb2R5LnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEJvZHk7XG5Cb2R5LnByb3RvdHlwZS5pc0JvZHkgPSB0cnVlO1xuQm9keS5wcm90b3R5cGUuc2V0TWFzcyA9IGZ1bmN0aW9uIHNldE1hc3MoKSB7XG4gICAgUGFydGljbGUucHJvdG90eXBlLnNldE1hc3MuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB0aGlzLnNldE1vbWVudHNPZkluZXJ0aWEoKTtcbn07XG5Cb2R5LnByb3RvdHlwZS5zZXRNb21lbnRzT2ZJbmVydGlhID0gZnVuY3Rpb24gc2V0TW9tZW50c09mSW5lcnRpYSgpIHtcbiAgICB0aGlzLmluZXJ0aWEgPSBuZXcgTWF0cml4KCk7XG4gICAgdGhpcy5pbnZlcnNlSW5lcnRpYSA9IG5ldyBNYXRyaXgoKTtcbn07XG5Cb2R5LnByb3RvdHlwZS51cGRhdGVBbmd1bGFyVmVsb2NpdHkgPSBmdW5jdGlvbiB1cGRhdGVBbmd1bGFyVmVsb2NpdHkoKSB7XG4gICAgdGhpcy5hbmd1bGFyVmVsb2NpdHkuc2V0KHRoaXMuaW52ZXJzZUluZXJ0aWEudmVjdG9yTXVsdGlwbHkodGhpcy5hbmd1bGFyTW9tZW50dW0pKTtcbn07XG5Cb2R5LnByb3RvdHlwZS50b1dvcmxkQ29vcmRpbmF0ZXMgPSBmdW5jdGlvbiB0b1dvcmxkQ29vcmRpbmF0ZXMobG9jYWxQb3NpdGlvbikge1xuICAgIHJldHVybiB0aGlzLnBXb3JsZC5zZXQodGhpcy5vcmllbnRhdGlvbi5yb3RhdGVWZWN0b3IobG9jYWxQb3NpdGlvbikpO1xufTtcbkJvZHkucHJvdG90eXBlLmdldEVuZXJneSA9IGZ1bmN0aW9uIGdldEVuZXJneSgpIHtcbiAgICByZXR1cm4gUGFydGljbGUucHJvdG90eXBlLmdldEVuZXJneS5jYWxsKHRoaXMpICsgMC41ICogdGhpcy5pbmVydGlhLnZlY3Rvck11bHRpcGx5KHRoaXMuYW5ndWxhclZlbG9jaXR5KS5kb3QodGhpcy5hbmd1bGFyVmVsb2NpdHkpO1xufTtcbkJvZHkucHJvdG90eXBlLnJlc2V0ID0gZnVuY3Rpb24gcmVzZXQocCwgdiwgcSwgTCkge1xuICAgIFBhcnRpY2xlLnByb3RvdHlwZS5yZXNldC5jYWxsKHRoaXMsIHAsIHYpO1xuICAgIHRoaXMuYW5ndWxhclZlbG9jaXR5LmNsZWFyKCk7XG4gICAgdGhpcy5zZXRPcmllbnRhdGlvbihxIHx8IFtcbiAgICAgICAgMSxcbiAgICAgICAgMCxcbiAgICAgICAgMCxcbiAgICAgICAgMFxuICAgIF0pO1xuICAgIHRoaXMuc2V0QW5ndWxhck1vbWVudHVtKEwgfHwgW1xuICAgICAgICAwLFxuICAgICAgICAwLFxuICAgICAgICAwXG4gICAgXSk7XG59O1xuQm9keS5wcm90b3R5cGUuc2V0T3JpZW50YXRpb24gPSBmdW5jdGlvbiBzZXRPcmllbnRhdGlvbihxKSB7XG4gICAgdGhpcy5vcmllbnRhdGlvbi5zZXQocSk7XG59O1xuQm9keS5wcm90b3R5cGUuc2V0QW5ndWxhclZlbG9jaXR5ID0gZnVuY3Rpb24gc2V0QW5ndWxhclZlbG9jaXR5KHcpIHtcbiAgICB0aGlzLndha2UoKTtcbiAgICB0aGlzLmFuZ3VsYXJWZWxvY2l0eS5zZXQodyk7XG59O1xuQm9keS5wcm90b3R5cGUuc2V0QW5ndWxhck1vbWVudHVtID0gZnVuY3Rpb24gc2V0QW5ndWxhck1vbWVudHVtKEwpIHtcbiAgICB0aGlzLndha2UoKTtcbiAgICB0aGlzLmFuZ3VsYXJNb21lbnR1bS5zZXQoTCk7XG59O1xuQm9keS5wcm90b3R5cGUuYXBwbHlGb3JjZSA9IGZ1bmN0aW9uIGFwcGx5Rm9yY2UoZm9yY2UsIGxvY2F0aW9uKSB7XG4gICAgUGFydGljbGUucHJvdG90eXBlLmFwcGx5Rm9yY2UuY2FsbCh0aGlzLCBmb3JjZSk7XG4gICAgaWYgKGxvY2F0aW9uICE9PSB1bmRlZmluZWQpXG4gICAgICAgIHRoaXMuYXBwbHlUb3JxdWUobG9jYXRpb24uY3Jvc3MoZm9yY2UpKTtcbn07XG5Cb2R5LnByb3RvdHlwZS5hcHBseVRvcnF1ZSA9IGZ1bmN0aW9uIGFwcGx5VG9ycXVlKHRvcnF1ZSkge1xuICAgIHRoaXMud2FrZSgpO1xuICAgIHRoaXMudG9ycXVlLnNldCh0aGlzLnRvcnF1ZS5hZGQodG9ycXVlKSk7XG59O1xuQm9keS5wcm90b3R5cGUuZ2V0VHJhbnNmb3JtID0gZnVuY3Rpb24gZ2V0VHJhbnNmb3JtKCkge1xuICAgIHJldHVybiBUcmFuc2Zvcm0udGhlbk1vdmUodGhpcy5vcmllbnRhdGlvbi5nZXRUcmFuc2Zvcm0oKSwgVHJhbnNmb3JtLmdldFRyYW5zbGF0ZShQYXJ0aWNsZS5wcm90b3R5cGUuZ2V0VHJhbnNmb3JtLmNhbGwodGhpcykpKTtcbn07XG5Cb2R5LnByb3RvdHlwZS5faW50ZWdyYXRlID0gZnVuY3Rpb24gX2ludGVncmF0ZShkdCkge1xuICAgIFBhcnRpY2xlLnByb3RvdHlwZS5faW50ZWdyYXRlLmNhbGwodGhpcywgZHQpO1xuICAgIHRoaXMuaW50ZWdyYXRlQW5ndWxhck1vbWVudHVtKGR0KTtcbiAgICB0aGlzLnVwZGF0ZUFuZ3VsYXJWZWxvY2l0eShkdCk7XG4gICAgdGhpcy5pbnRlZ3JhdGVPcmllbnRhdGlvbihkdCk7XG59O1xuQm9keS5wcm90b3R5cGUuaW50ZWdyYXRlQW5ndWxhck1vbWVudHVtID0gZnVuY3Rpb24gaW50ZWdyYXRlQW5ndWxhck1vbWVudHVtKGR0KSB7XG4gICAgSW50ZWdyYXRvci5pbnRlZ3JhdGVBbmd1bGFyTW9tZW50dW0odGhpcywgZHQpO1xufTtcbkJvZHkucHJvdG90eXBlLmludGVncmF0ZU9yaWVudGF0aW9uID0gZnVuY3Rpb24gaW50ZWdyYXRlT3JpZW50YXRpb24oZHQpIHtcbiAgICBJbnRlZ3JhdG9yLmludGVncmF0ZU9yaWVudGF0aW9uKHRoaXMsIGR0KTtcbn07XG5tb2R1bGUuZXhwb3J0cyA9IEJvZHk7IiwidmFyIEJvZHkgPSByZXF1aXJlKCcuL0JvZHknKTtcbnZhciBNYXRyaXggPSByZXF1aXJlKCcuLi8uLi9tYXRoL01hdHJpeCcpO1xuZnVuY3Rpb24gQ2lyY2xlKG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICB0aGlzLnNldFJhZGl1cyhvcHRpb25zLnJhZGl1cyB8fCAwKTtcbiAgICBCb2R5LmNhbGwodGhpcywgb3B0aW9ucyk7XG59XG5DaXJjbGUucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShCb2R5LnByb3RvdHlwZSk7XG5DaXJjbGUucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQ2lyY2xlO1xuQ2lyY2xlLnByb3RvdHlwZS5zZXRSYWRpdXMgPSBmdW5jdGlvbiBzZXRSYWRpdXMocikge1xuICAgIHRoaXMucmFkaXVzID0gcjtcbiAgICB0aGlzLnNpemUgPSBbXG4gICAgICAgIDIgKiB0aGlzLnJhZGl1cyxcbiAgICAgICAgMiAqIHRoaXMucmFkaXVzXG4gICAgXTtcbiAgICB0aGlzLnNldE1vbWVudHNPZkluZXJ0aWEoKTtcbn07XG5DaXJjbGUucHJvdG90eXBlLnNldE1vbWVudHNPZkluZXJ0aWEgPSBmdW5jdGlvbiBzZXRNb21lbnRzT2ZJbmVydGlhKCkge1xuICAgIHZhciBtID0gdGhpcy5tYXNzO1xuICAgIHZhciByID0gdGhpcy5yYWRpdXM7XG4gICAgdGhpcy5pbmVydGlhID0gbmV3IE1hdHJpeChbXG4gICAgICAgIFtcbiAgICAgICAgICAgIDAuMjUgKiBtICogciAqIHIsXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMFxuICAgICAgICBdLFxuICAgICAgICBbXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMC4yNSAqIG0gKiByICogcixcbiAgICAgICAgICAgIDBcbiAgICAgICAgXSxcbiAgICAgICAgW1xuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAwLjUgKiBtICogciAqIHJcbiAgICAgICAgXVxuICAgIF0pO1xuICAgIHRoaXMuaW52ZXJzZUluZXJ0aWEgPSBuZXcgTWF0cml4KFtcbiAgICAgICAgW1xuICAgICAgICAgICAgNCAvIChtICogciAqIHIpLFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDBcbiAgICAgICAgXSxcbiAgICAgICAgW1xuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDQgLyAobSAqIHIgKiByKSxcbiAgICAgICAgICAgIDBcbiAgICAgICAgXSxcbiAgICAgICAgW1xuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAyIC8gKG0gKiByICogcilcbiAgICAgICAgXVxuICAgIF0pO1xufTtcbm1vZHVsZS5leHBvcnRzID0gQ2lyY2xlOyIsInZhciBWZWN0b3IgPSByZXF1aXJlKCcuLi8uLi9tYXRoL1ZlY3RvcicpO1xudmFyIFRyYW5zZm9ybSA9IHJlcXVpcmUoJy4uLy4uL2NvcmUvVHJhbnNmb3JtJyk7XG52YXIgRXZlbnRIYW5kbGVyID0gcmVxdWlyZSgnLi4vLi4vY29yZS9FdmVudEhhbmRsZXInKTtcbnZhciBJbnRlZ3JhdG9yID0gcmVxdWlyZSgnLi4vaW50ZWdyYXRvcnMvU3ltcGxlY3RpY0V1bGVyJyk7XG5mdW5jdGlvbiBQYXJ0aWNsZShvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgdmFyIGRlZmF1bHRzID0gUGFydGljbGUuREVGQVVMVF9PUFRJT05TO1xuICAgIHRoaXMucG9zaXRpb24gPSBuZXcgVmVjdG9yKCk7XG4gICAgdGhpcy52ZWxvY2l0eSA9IG5ldyBWZWN0b3IoKTtcbiAgICB0aGlzLmZvcmNlID0gbmV3IFZlY3RvcigpO1xuICAgIHRoaXMuX2VuZ2luZSA9IG51bGw7XG4gICAgdGhpcy5faXNTbGVlcGluZyA9IHRydWU7XG4gICAgdGhpcy5fZXZlbnRPdXRwdXQgPSBudWxsO1xuICAgIHRoaXMubWFzcyA9IG9wdGlvbnMubWFzcyAhPT0gdW5kZWZpbmVkID8gb3B0aW9ucy5tYXNzIDogZGVmYXVsdHMubWFzcztcbiAgICB0aGlzLmludmVyc2VNYXNzID0gMSAvIHRoaXMubWFzcztcbiAgICB0aGlzLnNldFBvc2l0aW9uKG9wdGlvbnMucG9zaXRpb24gfHwgZGVmYXVsdHMucG9zaXRpb24pO1xuICAgIHRoaXMuc2V0VmVsb2NpdHkob3B0aW9ucy52ZWxvY2l0eSB8fCBkZWZhdWx0cy52ZWxvY2l0eSk7XG4gICAgdGhpcy5mb3JjZS5zZXQob3B0aW9ucy5mb3JjZSB8fCBbXG4gICAgICAgIDAsXG4gICAgICAgIDAsXG4gICAgICAgIDBcbiAgICBdKTtcbiAgICB0aGlzLnRyYW5zZm9ybSA9IFRyYW5zZm9ybS5pZGVudGl0eS5zbGljZSgpO1xuICAgIHRoaXMuX3NwZWMgPSB7XG4gICAgICAgIHNpemU6IFtcbiAgICAgICAgICAgIHRydWUsXG4gICAgICAgICAgICB0cnVlXG4gICAgICAgIF0sXG4gICAgICAgIHRhcmdldDoge1xuICAgICAgICAgICAgdHJhbnNmb3JtOiB0aGlzLnRyYW5zZm9ybSxcbiAgICAgICAgICAgIG9yaWdpbjogW1xuICAgICAgICAgICAgICAgIDAuNSxcbiAgICAgICAgICAgICAgICAwLjVcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICB0YXJnZXQ6IG51bGxcbiAgICAgICAgfVxuICAgIH07XG59XG5QYXJ0aWNsZS5ERUZBVUxUX09QVElPTlMgPSB7XG4gICAgcG9zaXRpb246IFtcbiAgICAgICAgMCxcbiAgICAgICAgMCxcbiAgICAgICAgMFxuICAgIF0sXG4gICAgdmVsb2NpdHk6IFtcbiAgICAgICAgMCxcbiAgICAgICAgMCxcbiAgICAgICAgMFxuICAgIF0sXG4gICAgbWFzczogMVxufTtcbnZhciBfZXZlbnRzID0ge1xuICAgICAgICBzdGFydDogJ3N0YXJ0JyxcbiAgICAgICAgdXBkYXRlOiAndXBkYXRlJyxcbiAgICAgICAgZW5kOiAnZW5kJ1xuICAgIH07XG52YXIgbm93ID0gRGF0ZS5ub3c7XG5QYXJ0aWNsZS5wcm90b3R5cGUuaXNCb2R5ID0gZmFsc2U7XG5QYXJ0aWNsZS5wcm90b3R5cGUuaXNBY3RpdmUgPSBmdW5jdGlvbiBpc0FjdGl2ZSgpIHtcbiAgICByZXR1cm4gIXRoaXMuX2lzU2xlZXBpbmc7XG59O1xuUGFydGljbGUucHJvdG90eXBlLnNsZWVwID0gZnVuY3Rpb24gc2xlZXAoKSB7XG4gICAgaWYgKHRoaXMuX2lzU2xlZXBpbmcpXG4gICAgICAgIHJldHVybjtcbiAgICB0aGlzLmVtaXQoX2V2ZW50cy5lbmQsIHRoaXMpO1xuICAgIHRoaXMuX2lzU2xlZXBpbmcgPSB0cnVlO1xufTtcblBhcnRpY2xlLnByb3RvdHlwZS53YWtlID0gZnVuY3Rpb24gd2FrZSgpIHtcbiAgICBpZiAoIXRoaXMuX2lzU2xlZXBpbmcpXG4gICAgICAgIHJldHVybjtcbiAgICB0aGlzLmVtaXQoX2V2ZW50cy5zdGFydCwgdGhpcyk7XG4gICAgdGhpcy5faXNTbGVlcGluZyA9IGZhbHNlO1xuICAgIHRoaXMuX3ByZXZUaW1lID0gbm93KCk7XG4gICAgaWYgKHRoaXMuX2VuZ2luZSlcbiAgICAgICAgdGhpcy5fZW5naW5lLndha2UoKTtcbn07XG5QYXJ0aWNsZS5wcm90b3R5cGUuc2V0UG9zaXRpb24gPSBmdW5jdGlvbiBzZXRQb3NpdGlvbihwb3NpdGlvbikge1xuICAgIHRoaXMucG9zaXRpb24uc2V0KHBvc2l0aW9uKTtcbn07XG5QYXJ0aWNsZS5wcm90b3R5cGUuc2V0UG9zaXRpb24xRCA9IGZ1bmN0aW9uIHNldFBvc2l0aW9uMUQoeCkge1xuICAgIHRoaXMucG9zaXRpb24ueCA9IHg7XG59O1xuUGFydGljbGUucHJvdG90eXBlLmdldFBvc2l0aW9uID0gZnVuY3Rpb24gZ2V0UG9zaXRpb24oKSB7XG4gICAgdGhpcy5fZW5naW5lLnN0ZXAoKTtcbiAgICByZXR1cm4gdGhpcy5wb3NpdGlvbi5nZXQoKTtcbn07XG5QYXJ0aWNsZS5wcm90b3R5cGUuZ2V0UG9zaXRpb24xRCA9IGZ1bmN0aW9uIGdldFBvc2l0aW9uMUQoKSB7XG4gICAgdGhpcy5fZW5naW5lLnN0ZXAoKTtcbiAgICByZXR1cm4gdGhpcy5wb3NpdGlvbi54O1xufTtcblBhcnRpY2xlLnByb3RvdHlwZS5zZXRWZWxvY2l0eSA9IGZ1bmN0aW9uIHNldFZlbG9jaXR5KHZlbG9jaXR5KSB7XG4gICAgdGhpcy52ZWxvY2l0eS5zZXQodmVsb2NpdHkpO1xuICAgIGlmICghKHZlbG9jaXR5WzBdID09PSAwICYmIHZlbG9jaXR5WzFdID09PSAwICYmIHZlbG9jaXR5WzJdID09PSAwKSlcbiAgICAgICAgdGhpcy53YWtlKCk7XG59O1xuUGFydGljbGUucHJvdG90eXBlLnNldFZlbG9jaXR5MUQgPSBmdW5jdGlvbiBzZXRWZWxvY2l0eTFEKHgpIHtcbiAgICB0aGlzLnZlbG9jaXR5LnggPSB4O1xuICAgIGlmICh4ICE9PSAwKVxuICAgICAgICB0aGlzLndha2UoKTtcbn07XG5QYXJ0aWNsZS5wcm90b3R5cGUuZ2V0VmVsb2NpdHkgPSBmdW5jdGlvbiBnZXRWZWxvY2l0eSgpIHtcbiAgICByZXR1cm4gdGhpcy52ZWxvY2l0eS5nZXQoKTtcbn07XG5QYXJ0aWNsZS5wcm90b3R5cGUuc2V0Rm9yY2UgPSBmdW5jdGlvbiBzZXRGb3JjZShmb3JjZSkge1xuICAgIHRoaXMuZm9yY2Uuc2V0KGZvcmNlKTtcbiAgICB0aGlzLndha2UoKTtcbn07XG5QYXJ0aWNsZS5wcm90b3R5cGUuZ2V0VmVsb2NpdHkxRCA9IGZ1bmN0aW9uIGdldFZlbG9jaXR5MUQoKSB7XG4gICAgcmV0dXJuIHRoaXMudmVsb2NpdHkueDtcbn07XG5QYXJ0aWNsZS5wcm90b3R5cGUuc2V0TWFzcyA9IGZ1bmN0aW9uIHNldE1hc3MobWFzcykge1xuICAgIHRoaXMubWFzcyA9IG1hc3M7XG4gICAgdGhpcy5pbnZlcnNlTWFzcyA9IDEgLyBtYXNzO1xufTtcblBhcnRpY2xlLnByb3RvdHlwZS5nZXRNYXNzID0gZnVuY3Rpb24gZ2V0TWFzcygpIHtcbiAgICByZXR1cm4gdGhpcy5tYXNzO1xufTtcblBhcnRpY2xlLnByb3RvdHlwZS5yZXNldCA9IGZ1bmN0aW9uIHJlc2V0KHBvc2l0aW9uLCB2ZWxvY2l0eSkge1xuICAgIHRoaXMuc2V0UG9zaXRpb24ocG9zaXRpb24gfHwgW1xuICAgICAgICAwLFxuICAgICAgICAwLFxuICAgICAgICAwXG4gICAgXSk7XG4gICAgdGhpcy5zZXRWZWxvY2l0eSh2ZWxvY2l0eSB8fCBbXG4gICAgICAgIDAsXG4gICAgICAgIDAsXG4gICAgICAgIDBcbiAgICBdKTtcbn07XG5QYXJ0aWNsZS5wcm90b3R5cGUuYXBwbHlGb3JjZSA9IGZ1bmN0aW9uIGFwcGx5Rm9yY2UoZm9yY2UpIHtcbiAgICBpZiAoZm9yY2UuaXNaZXJvKCkpXG4gICAgICAgIHJldHVybjtcbiAgICB0aGlzLmZvcmNlLmFkZChmb3JjZSkucHV0KHRoaXMuZm9yY2UpO1xuICAgIHRoaXMud2FrZSgpO1xufTtcblBhcnRpY2xlLnByb3RvdHlwZS5hcHBseUltcHVsc2UgPSBmdW5jdGlvbiBhcHBseUltcHVsc2UoaW1wdWxzZSkge1xuICAgIGlmIChpbXB1bHNlLmlzWmVybygpKVxuICAgICAgICByZXR1cm47XG4gICAgdmFyIHZlbG9jaXR5ID0gdGhpcy52ZWxvY2l0eTtcbiAgICB2ZWxvY2l0eS5hZGQoaW1wdWxzZS5tdWx0KHRoaXMuaW52ZXJzZU1hc3MpKS5wdXQodmVsb2NpdHkpO1xufTtcblBhcnRpY2xlLnByb3RvdHlwZS5pbnRlZ3JhdGVWZWxvY2l0eSA9IGZ1bmN0aW9uIGludGVncmF0ZVZlbG9jaXR5KGR0KSB7XG4gICAgSW50ZWdyYXRvci5pbnRlZ3JhdGVWZWxvY2l0eSh0aGlzLCBkdCk7XG59O1xuUGFydGljbGUucHJvdG90eXBlLmludGVncmF0ZVBvc2l0aW9uID0gZnVuY3Rpb24gaW50ZWdyYXRlUG9zaXRpb24oZHQpIHtcbiAgICBJbnRlZ3JhdG9yLmludGVncmF0ZVBvc2l0aW9uKHRoaXMsIGR0KTtcbn07XG5QYXJ0aWNsZS5wcm90b3R5cGUuX2ludGVncmF0ZSA9IGZ1bmN0aW9uIF9pbnRlZ3JhdGUoZHQpIHtcbiAgICB0aGlzLmludGVncmF0ZVZlbG9jaXR5KGR0KTtcbiAgICB0aGlzLmludGVncmF0ZVBvc2l0aW9uKGR0KTtcbn07XG5QYXJ0aWNsZS5wcm90b3R5cGUuZ2V0RW5lcmd5ID0gZnVuY3Rpb24gZ2V0RW5lcmd5KCkge1xuICAgIHJldHVybiAwLjUgKiB0aGlzLm1hc3MgKiB0aGlzLnZlbG9jaXR5Lm5vcm1TcXVhcmVkKCk7XG59O1xuUGFydGljbGUucHJvdG90eXBlLmdldFRyYW5zZm9ybSA9IGZ1bmN0aW9uIGdldFRyYW5zZm9ybSgpIHtcbiAgICB0aGlzLl9lbmdpbmUuc3RlcCgpO1xuICAgIHZhciBwb3NpdGlvbiA9IHRoaXMucG9zaXRpb247XG4gICAgdmFyIHRyYW5zZm9ybSA9IHRoaXMudHJhbnNmb3JtO1xuICAgIHRyYW5zZm9ybVsxMl0gPSBwb3NpdGlvbi54O1xuICAgIHRyYW5zZm9ybVsxM10gPSBwb3NpdGlvbi55O1xuICAgIHRyYW5zZm9ybVsxNF0gPSBwb3NpdGlvbi56O1xuICAgIHJldHVybiB0cmFuc2Zvcm07XG59O1xuUGFydGljbGUucHJvdG90eXBlLm1vZGlmeSA9IGZ1bmN0aW9uIG1vZGlmeSh0YXJnZXQpIHtcbiAgICB2YXIgX3NwZWMgPSB0aGlzLl9zcGVjLnRhcmdldDtcbiAgICBfc3BlYy50cmFuc2Zvcm0gPSB0aGlzLmdldFRyYW5zZm9ybSgpO1xuICAgIF9zcGVjLnRhcmdldCA9IHRhcmdldDtcbiAgICByZXR1cm4gdGhpcy5fc3BlYztcbn07XG5mdW5jdGlvbiBfY3JlYXRlRXZlbnRPdXRwdXQoKSB7XG4gICAgdGhpcy5fZXZlbnRPdXRwdXQgPSBuZXcgRXZlbnRIYW5kbGVyKCk7XG4gICAgdGhpcy5fZXZlbnRPdXRwdXQuYmluZFRoaXModGhpcyk7XG4gICAgRXZlbnRIYW5kbGVyLnNldE91dHB1dEhhbmRsZXIodGhpcywgdGhpcy5fZXZlbnRPdXRwdXQpO1xufVxuUGFydGljbGUucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbiBlbWl0KHR5cGUsIGRhdGEpIHtcbiAgICBpZiAoIXRoaXMuX2V2ZW50T3V0cHV0KVxuICAgICAgICByZXR1cm47XG4gICAgdGhpcy5fZXZlbnRPdXRwdXQuZW1pdCh0eXBlLCBkYXRhKTtcbn07XG5QYXJ0aWNsZS5wcm90b3R5cGUub24gPSBmdW5jdGlvbiBvbigpIHtcbiAgICBfY3JlYXRlRXZlbnRPdXRwdXQuY2FsbCh0aGlzKTtcbiAgICByZXR1cm4gdGhpcy5vbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xufTtcblBhcnRpY2xlLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9IGZ1bmN0aW9uIHJlbW92ZUxpc3RlbmVyKCkge1xuICAgIF9jcmVhdGVFdmVudE91dHB1dC5jYWxsKHRoaXMpO1xuICAgIHJldHVybiB0aGlzLnJlbW92ZUxpc3RlbmVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG59O1xuUGFydGljbGUucHJvdG90eXBlLnBpcGUgPSBmdW5jdGlvbiBwaXBlKCkge1xuICAgIF9jcmVhdGVFdmVudE91dHB1dC5jYWxsKHRoaXMpO1xuICAgIHJldHVybiB0aGlzLnBpcGUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn07XG5QYXJ0aWNsZS5wcm90b3R5cGUudW5waXBlID0gZnVuY3Rpb24gdW5waXBlKCkge1xuICAgIF9jcmVhdGVFdmVudE91dHB1dC5jYWxsKHRoaXMpO1xuICAgIHJldHVybiB0aGlzLnVucGlwZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xufTtcbm1vZHVsZS5leHBvcnRzID0gUGFydGljbGU7IiwidmFyIENvbnN0cmFpbnQgPSByZXF1aXJlKCcuL0NvbnN0cmFpbnQnKTtcbnZhciBWZWN0b3IgPSByZXF1aXJlKCcuLi8uLi9tYXRoL1ZlY3RvcicpO1xuZnVuY3Rpb24gQ29sbGlzaW9uKG9wdGlvbnMpIHtcbiAgICB0aGlzLm9wdGlvbnMgPSBPYmplY3QuY3JlYXRlKENvbGxpc2lvbi5ERUZBVUxUX09QVElPTlMpO1xuICAgIGlmIChvcHRpb25zKVxuICAgICAgICB0aGlzLnNldE9wdGlvbnMob3B0aW9ucyk7XG4gICAgdGhpcy5ub3JtYWwgPSBuZXcgVmVjdG9yKCk7XG4gICAgdGhpcy5wRGlmZiA9IG5ldyBWZWN0b3IoKTtcbiAgICB0aGlzLnZEaWZmID0gbmV3IFZlY3RvcigpO1xuICAgIHRoaXMuaW1wdWxzZTEgPSBuZXcgVmVjdG9yKCk7XG4gICAgdGhpcy5pbXB1bHNlMiA9IG5ldyBWZWN0b3IoKTtcbiAgICBDb25zdHJhaW50LmNhbGwodGhpcyk7XG59XG5Db2xsaXNpb24ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShDb25zdHJhaW50LnByb3RvdHlwZSk7XG5Db2xsaXNpb24ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQ29sbGlzaW9uO1xuQ29sbGlzaW9uLkRFRkFVTFRfT1BUSU9OUyA9IHtcbiAgICByZXN0aXR1dGlvbjogMC41LFxuICAgIGRyaWZ0OiAwLjUsXG4gICAgc2xvcDogMFxufTtcbmZ1bmN0aW9uIF9ub3JtYWxWZWxvY2l0eShwYXJ0aWNsZTEsIHBhcnRpY2xlMikge1xuICAgIHJldHVybiBwYXJ0aWNsZTEudmVsb2NpdHkuZG90KHBhcnRpY2xlMi52ZWxvY2l0eSk7XG59XG5Db2xsaXNpb24ucHJvdG90eXBlLnNldE9wdGlvbnMgPSBmdW5jdGlvbiBzZXRPcHRpb25zKG9wdGlvbnMpIHtcbiAgICBmb3IgKHZhciBrZXkgaW4gb3B0aW9ucylcbiAgICAgICAgdGhpcy5vcHRpb25zW2tleV0gPSBvcHRpb25zW2tleV07XG59O1xuQ29sbGlzaW9uLnByb3RvdHlwZS5hcHBseUNvbnN0cmFpbnQgPSBmdW5jdGlvbiBhcHBseUNvbnN0cmFpbnQodGFyZ2V0cywgc291cmNlLCBkdCkge1xuICAgIGlmIChzb3VyY2UgPT09IHVuZGVmaW5lZClcbiAgICAgICAgcmV0dXJuO1xuICAgIHZhciB2MSA9IHNvdXJjZS52ZWxvY2l0eTtcbiAgICB2YXIgcDEgPSBzb3VyY2UucG9zaXRpb247XG4gICAgdmFyIHcxID0gc291cmNlLmludmVyc2VNYXNzO1xuICAgIHZhciByMSA9IHNvdXJjZS5yYWRpdXM7XG4gICAgdmFyIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnM7XG4gICAgdmFyIGRyaWZ0ID0gb3B0aW9ucy5kcmlmdDtcbiAgICB2YXIgc2xvcCA9IC1vcHRpb25zLnNsb3A7XG4gICAgdmFyIHJlc3RpdHV0aW9uID0gb3B0aW9ucy5yZXN0aXR1dGlvbjtcbiAgICB2YXIgbiA9IHRoaXMubm9ybWFsO1xuICAgIHZhciBwRGlmZiA9IHRoaXMucERpZmY7XG4gICAgdmFyIHZEaWZmID0gdGhpcy52RGlmZjtcbiAgICB2YXIgaW1wdWxzZTEgPSB0aGlzLmltcHVsc2UxO1xuICAgIHZhciBpbXB1bHNlMiA9IHRoaXMuaW1wdWxzZTI7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0YXJnZXRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciB0YXJnZXQgPSB0YXJnZXRzW2ldO1xuICAgICAgICBpZiAodGFyZ2V0ID09PSBzb3VyY2UpXG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgdmFyIHYyID0gdGFyZ2V0LnZlbG9jaXR5O1xuICAgICAgICB2YXIgcDIgPSB0YXJnZXQucG9zaXRpb247XG4gICAgICAgIHZhciB3MiA9IHRhcmdldC5pbnZlcnNlTWFzcztcbiAgICAgICAgdmFyIHIyID0gdGFyZ2V0LnJhZGl1cztcbiAgICAgICAgcERpZmYuc2V0KHAyLnN1YihwMSkpO1xuICAgICAgICB2RGlmZi5zZXQodjIuc3ViKHYxKSk7XG4gICAgICAgIHZhciBkaXN0ID0gcERpZmYubm9ybSgpO1xuICAgICAgICB2YXIgb3ZlcmxhcCA9IGRpc3QgLSAocjEgKyByMik7XG4gICAgICAgIHZhciBlZmZNYXNzID0gMSAvICh3MSArIHcyKTtcbiAgICAgICAgdmFyIGdhbW1hID0gMDtcbiAgICAgICAgaWYgKG92ZXJsYXAgPCAwKSB7XG4gICAgICAgICAgICBuLnNldChwRGlmZi5ub3JtYWxpemUoKSk7XG4gICAgICAgICAgICBpZiAodGhpcy5fZXZlbnRPdXRwdXQpIHtcbiAgICAgICAgICAgICAgICB2YXIgY29sbGlzaW9uRGF0YSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldDogdGFyZ2V0LFxuICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlOiBzb3VyY2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBvdmVybGFwOiBvdmVybGFwLFxuICAgICAgICAgICAgICAgICAgICAgICAgbm9ybWFsOiBuXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgdGhpcy5fZXZlbnRPdXRwdXQuZW1pdCgncHJlQ29sbGlzaW9uJywgY29sbGlzaW9uRGF0YSk7XG4gICAgICAgICAgICAgICAgdGhpcy5fZXZlbnRPdXRwdXQuZW1pdCgnY29sbGlzaW9uJywgY29sbGlzaW9uRGF0YSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgbGFtYmRhID0gb3ZlcmxhcCA8PSBzbG9wID8gKCgxICsgcmVzdGl0dXRpb24pICogbi5kb3QodkRpZmYpICsgZHJpZnQgLyBkdCAqIChvdmVybGFwIC0gc2xvcCkpIC8gKGdhbW1hICsgZHQgLyBlZmZNYXNzKSA6ICgxICsgcmVzdGl0dXRpb24pICogbi5kb3QodkRpZmYpIC8gKGdhbW1hICsgZHQgLyBlZmZNYXNzKTtcbiAgICAgICAgICAgIG4ubXVsdChkdCAqIGxhbWJkYSkucHV0KGltcHVsc2UxKTtcbiAgICAgICAgICAgIGltcHVsc2UxLm11bHQoLTEpLnB1dChpbXB1bHNlMik7XG4gICAgICAgICAgICBzb3VyY2UuYXBwbHlJbXB1bHNlKGltcHVsc2UxKTtcbiAgICAgICAgICAgIHRhcmdldC5hcHBseUltcHVsc2UoaW1wdWxzZTIpO1xuICAgICAgICAgICAgaWYgKHRoaXMuX2V2ZW50T3V0cHV0KVxuICAgICAgICAgICAgICAgIHRoaXMuX2V2ZW50T3V0cHV0LmVtaXQoJ3Bvc3RDb2xsaXNpb24nLCBjb2xsaXNpb25EYXRhKTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5tb2R1bGUuZXhwb3J0cyA9IENvbGxpc2lvbjsiLCJ2YXIgRXZlbnRIYW5kbGVyID0gcmVxdWlyZSgnLi4vLi4vY29yZS9FdmVudEhhbmRsZXInKTtcbmZ1bmN0aW9uIENvbnN0cmFpbnQoKSB7XG4gICAgdGhpcy5vcHRpb25zID0gdGhpcy5vcHRpb25zIHx8IHt9O1xuICAgIHRoaXMuX2V2ZW50T3V0cHV0ID0gbmV3IEV2ZW50SGFuZGxlcigpO1xuICAgIEV2ZW50SGFuZGxlci5zZXRPdXRwdXRIYW5kbGVyKHRoaXMsIHRoaXMuX2V2ZW50T3V0cHV0KTtcbn1cbkNvbnN0cmFpbnQucHJvdG90eXBlLnNldE9wdGlvbnMgPSBmdW5jdGlvbiBzZXRPcHRpb25zKG9wdGlvbnMpIHtcbiAgICB0aGlzLl9ldmVudE91dHB1dC5lbWl0KCdjaGFuZ2UnLCBvcHRpb25zKTtcbn07XG5Db25zdHJhaW50LnByb3RvdHlwZS5hcHBseUNvbnN0cmFpbnQgPSBmdW5jdGlvbiBhcHBseUNvbnN0cmFpbnQoKSB7XG59O1xuQ29uc3RyYWludC5wcm90b3R5cGUuZ2V0RW5lcmd5ID0gZnVuY3Rpb24gZ2V0RW5lcmd5KCkge1xuICAgIHJldHVybiAwO1xufTtcbm1vZHVsZS5leHBvcnRzID0gQ29uc3RyYWludDsiLCJ2YXIgQ29uc3RyYWludCA9IHJlcXVpcmUoJy4vQ29uc3RyYWludCcpO1xudmFyIFZlY3RvciA9IHJlcXVpcmUoJy4uLy4uL21hdGgvVmVjdG9yJyk7XG5mdW5jdGlvbiBXYWxsKG9wdGlvbnMpIHtcbiAgICB0aGlzLm9wdGlvbnMgPSBPYmplY3QuY3JlYXRlKFdhbGwuREVGQVVMVF9PUFRJT05TKTtcbiAgICBpZiAob3B0aW9ucylcbiAgICAgICAgdGhpcy5zZXRPcHRpb25zKG9wdGlvbnMpO1xuICAgIHRoaXMuZGlmZiA9IG5ldyBWZWN0b3IoKTtcbiAgICB0aGlzLmltcHVsc2UgPSBuZXcgVmVjdG9yKCk7XG4gICAgQ29uc3RyYWludC5jYWxsKHRoaXMpO1xufVxuV2FsbC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKENvbnN0cmFpbnQucHJvdG90eXBlKTtcbldhbGwucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gV2FsbDtcbldhbGwuT05fQ09OVEFDVCA9IHtcbiAgICBSRUZMRUNUOiAwLFxuICAgIFNJTEVOVDogMVxufTtcbldhbGwuREVGQVVMVF9PUFRJT05TID0ge1xuICAgIHJlc3RpdHV0aW9uOiAwLjUsXG4gICAgZHJpZnQ6IDAuNSxcbiAgICBzbG9wOiAwLFxuICAgIG5vcm1hbDogW1xuICAgICAgICAxLFxuICAgICAgICAwLFxuICAgICAgICAwXG4gICAgXSxcbiAgICBkaXN0YW5jZTogMCxcbiAgICBvbkNvbnRhY3Q6IFdhbGwuT05fQ09OVEFDVC5SRUZMRUNUXG59O1xuV2FsbC5wcm90b3R5cGUuc2V0T3B0aW9ucyA9IGZ1bmN0aW9uIHNldE9wdGlvbnMob3B0aW9ucykge1xuICAgIGlmIChvcHRpb25zLm5vcm1hbCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGlmIChvcHRpb25zLm5vcm1hbCBpbnN0YW5jZW9mIFZlY3RvcilcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5ub3JtYWwgPSBvcHRpb25zLm5vcm1hbC5jbG9uZSgpO1xuICAgICAgICBpZiAob3B0aW9ucy5ub3JtYWwgaW5zdGFuY2VvZiBBcnJheSlcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5ub3JtYWwgPSBuZXcgVmVjdG9yKG9wdGlvbnMubm9ybWFsKTtcbiAgICB9XG4gICAgaWYgKG9wdGlvbnMucmVzdGl0dXRpb24gIT09IHVuZGVmaW5lZClcbiAgICAgICAgdGhpcy5vcHRpb25zLnJlc3RpdHV0aW9uID0gb3B0aW9ucy5yZXN0aXR1dGlvbjtcbiAgICBpZiAob3B0aW9ucy5kcmlmdCAhPT0gdW5kZWZpbmVkKVxuICAgICAgICB0aGlzLm9wdGlvbnMuZHJpZnQgPSBvcHRpb25zLmRyaWZ0O1xuICAgIGlmIChvcHRpb25zLnNsb3AgIT09IHVuZGVmaW5lZClcbiAgICAgICAgdGhpcy5vcHRpb25zLnNsb3AgPSBvcHRpb25zLnNsb3A7XG4gICAgaWYgKG9wdGlvbnMuZGlzdGFuY2UgIT09IHVuZGVmaW5lZClcbiAgICAgICAgdGhpcy5vcHRpb25zLmRpc3RhbmNlID0gb3B0aW9ucy5kaXN0YW5jZTtcbiAgICBpZiAob3B0aW9ucy5vbkNvbnRhY3QgIT09IHVuZGVmaW5lZClcbiAgICAgICAgdGhpcy5vcHRpb25zLm9uQ29udGFjdCA9IG9wdGlvbnMub25Db250YWN0O1xufTtcbmZ1bmN0aW9uIF9nZXROb3JtYWxWZWxvY2l0eShuLCB2KSB7XG4gICAgcmV0dXJuIHYuZG90KG4pO1xufVxuZnVuY3Rpb24gX2dldERpc3RhbmNlRnJvbU9yaWdpbihwKSB7XG4gICAgdmFyIG4gPSB0aGlzLm9wdGlvbnMubm9ybWFsO1xuICAgIHZhciBkID0gdGhpcy5vcHRpb25zLmRpc3RhbmNlO1xuICAgIHJldHVybiBwLmRvdChuKSArIGQ7XG59XG5mdW5jdGlvbiBfb25FbnRlcihwYXJ0aWNsZSwgb3ZlcmxhcCwgZHQpIHtcbiAgICB2YXIgcCA9IHBhcnRpY2xlLnBvc2l0aW9uO1xuICAgIHZhciB2ID0gcGFydGljbGUudmVsb2NpdHk7XG4gICAgdmFyIG0gPSBwYXJ0aWNsZS5tYXNzO1xuICAgIHZhciBuID0gdGhpcy5vcHRpb25zLm5vcm1hbDtcbiAgICB2YXIgYWN0aW9uID0gdGhpcy5vcHRpb25zLm9uQ29udGFjdDtcbiAgICB2YXIgcmVzdGl0dXRpb24gPSB0aGlzLm9wdGlvbnMucmVzdGl0dXRpb247XG4gICAgdmFyIGltcHVsc2UgPSB0aGlzLmltcHVsc2U7XG4gICAgdmFyIGRyaWZ0ID0gdGhpcy5vcHRpb25zLmRyaWZ0O1xuICAgIHZhciBzbG9wID0gLXRoaXMub3B0aW9ucy5zbG9wO1xuICAgIHZhciBnYW1tYSA9IDA7XG4gICAgaWYgKHRoaXMuX2V2ZW50T3V0cHV0KSB7XG4gICAgICAgIHZhciBkYXRhID0ge1xuICAgICAgICAgICAgICAgIHBhcnRpY2xlOiBwYXJ0aWNsZSxcbiAgICAgICAgICAgICAgICB3YWxsOiB0aGlzLFxuICAgICAgICAgICAgICAgIG92ZXJsYXA6IG92ZXJsYXAsXG4gICAgICAgICAgICAgICAgbm9ybWFsOiBuXG4gICAgICAgICAgICB9O1xuICAgICAgICB0aGlzLl9ldmVudE91dHB1dC5lbWl0KCdwcmVDb2xsaXNpb24nLCBkYXRhKTtcbiAgICAgICAgdGhpcy5fZXZlbnRPdXRwdXQuZW1pdCgnY29sbGlzaW9uJywgZGF0YSk7XG4gICAgfVxuICAgIHN3aXRjaCAoYWN0aW9uKSB7XG4gICAgY2FzZSBXYWxsLk9OX0NPTlRBQ1QuUkVGTEVDVDpcbiAgICAgICAgdmFyIGxhbWJkYSA9IG92ZXJsYXAgPCBzbG9wID8gLSgoMSArIHJlc3RpdHV0aW9uKSAqIG4uZG90KHYpICsgZHJpZnQgLyBkdCAqIChvdmVybGFwIC0gc2xvcCkpIC8gKG0gKiBkdCArIGdhbW1hKSA6IC0oKDEgKyByZXN0aXR1dGlvbikgKiBuLmRvdCh2KSkgLyAobSAqIGR0ICsgZ2FtbWEpO1xuICAgICAgICBpbXB1bHNlLnNldChuLm11bHQoZHQgKiBsYW1iZGEpKTtcbiAgICAgICAgcGFydGljbGUuYXBwbHlJbXB1bHNlKGltcHVsc2UpO1xuICAgICAgICBwYXJ0aWNsZS5zZXRQb3NpdGlvbihwLmFkZChuLm11bHQoLW92ZXJsYXApKSk7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgICBpZiAodGhpcy5fZXZlbnRPdXRwdXQpXG4gICAgICAgIHRoaXMuX2V2ZW50T3V0cHV0LmVtaXQoJ3Bvc3RDb2xsaXNpb24nLCBkYXRhKTtcbn1cbmZ1bmN0aW9uIF9vbkV4aXQocGFydGljbGUsIG92ZXJsYXAsIGR0KSB7XG4gICAgdmFyIGFjdGlvbiA9IHRoaXMub3B0aW9ucy5vbkNvbnRhY3Q7XG4gICAgdmFyIHAgPSBwYXJ0aWNsZS5wb3NpdGlvbjtcbiAgICB2YXIgbiA9IHRoaXMub3B0aW9ucy5ub3JtYWw7XG4gICAgaWYgKGFjdGlvbiA9PT0gV2FsbC5PTl9DT05UQUNULlJFRkxFQ1QpIHtcbiAgICAgICAgcGFydGljbGUuc2V0UG9zaXRpb24ocC5hZGQobi5tdWx0KC1vdmVybGFwKSkpO1xuICAgIH1cbn1cbldhbGwucHJvdG90eXBlLmFwcGx5Q29uc3RyYWludCA9IGZ1bmN0aW9uIGFwcGx5Q29uc3RyYWludCh0YXJnZXRzLCBzb3VyY2UsIGR0KSB7XG4gICAgdmFyIG4gPSB0aGlzLm9wdGlvbnMubm9ybWFsO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGFyZ2V0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgcGFydGljbGUgPSB0YXJnZXRzW2ldO1xuICAgICAgICB2YXIgcCA9IHBhcnRpY2xlLnBvc2l0aW9uO1xuICAgICAgICB2YXIgdiA9IHBhcnRpY2xlLnZlbG9jaXR5O1xuICAgICAgICB2YXIgciA9IHBhcnRpY2xlLnJhZGl1cyB8fCAwO1xuICAgICAgICB2YXIgb3ZlcmxhcCA9IF9nZXREaXN0YW5jZUZyb21PcmlnaW4uY2FsbCh0aGlzLCBwLmFkZChuLm11bHQoLXIpKSk7XG4gICAgICAgIHZhciBudiA9IF9nZXROb3JtYWxWZWxvY2l0eS5jYWxsKHRoaXMsIG4sIHYpO1xuICAgICAgICBpZiAob3ZlcmxhcCA8PSAwKSB7XG4gICAgICAgICAgICBpZiAobnYgPCAwKVxuICAgICAgICAgICAgICAgIF9vbkVudGVyLmNhbGwodGhpcywgcGFydGljbGUsIG92ZXJsYXAsIGR0KTtcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBfb25FeGl0LmNhbGwodGhpcywgcGFydGljbGUsIG92ZXJsYXAsIGR0KTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5tb2R1bGUuZXhwb3J0cyA9IFdhbGw7IiwidmFyIENvbnN0cmFpbnQgPSByZXF1aXJlKCcuL0NvbnN0cmFpbnQnKTtcbnZhciBXYWxsID0gcmVxdWlyZSgnLi9XYWxsJyk7XG52YXIgVmVjdG9yID0gcmVxdWlyZSgnLi4vLi4vbWF0aC9WZWN0b3InKTtcbnZhciBVdGlsaXR5ID0gcmVxdWlyZSgnLi4vLi4vdXRpbGl0aWVzL1V0aWxpdHknKTtcbmZ1bmN0aW9uIFdhbGxzKG9wdGlvbnMpIHtcbiAgICB0aGlzLm9wdGlvbnMgPSBVdGlsaXR5LmNsb25lKHRoaXMuY29uc3RydWN0b3IuREVGQVVMVF9PUFRJT05TIHx8IFdhbGxzLkRFRkFVTFRfT1BUSU9OUyk7XG4gICAgaWYgKG9wdGlvbnMpXG4gICAgICAgIHRoaXMuc2V0T3B0aW9ucyhvcHRpb25zKTtcbiAgICBfY3JlYXRlQ29tcG9uZW50cy5jYWxsKHRoaXMsIHRoaXMub3B0aW9ucy5zaWRlcyk7XG4gICAgQ29uc3RyYWludC5jYWxsKHRoaXMpO1xufVxuV2FsbHMucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShDb25zdHJhaW50LnByb3RvdHlwZSk7XG5XYWxscy5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBXYWxscztcbldhbGxzLk9OX0NPTlRBQ1QgPSBXYWxsLk9OX0NPTlRBQ1Q7XG5XYWxscy5TSURFUyA9IHtcbiAgICBMRUZUOiAwLFxuICAgIFJJR0hUOiAxLFxuICAgIFRPUDogMixcbiAgICBCT1RUT006IDMsXG4gICAgRlJPTlQ6IDQsXG4gICAgQkFDSzogNSxcbiAgICBUV09fRElNRU5TSU9OQUw6IFtcbiAgICAgICAgMCxcbiAgICAgICAgMSxcbiAgICAgICAgMixcbiAgICAgICAgM1xuICAgIF0sXG4gICAgVEhSRUVfRElNRU5TSU9OQUw6IFtcbiAgICAgICAgMCxcbiAgICAgICAgMSxcbiAgICAgICAgMixcbiAgICAgICAgMyxcbiAgICAgICAgNCxcbiAgICAgICAgNVxuICAgIF1cbn07XG5XYWxscy5ERUZBVUxUX09QVElPTlMgPSB7XG4gICAgc2lkZXM6IFdhbGxzLlNJREVTLlRXT19ESU1FTlNJT05BTCxcbiAgICBzaXplOiBbXG4gICAgICAgIHdpbmRvdy5pbm5lcldpZHRoLFxuICAgICAgICB3aW5kb3cuaW5uZXJIZWlnaHQsXG4gICAgICAgIDBcbiAgICBdLFxuICAgIG9yaWdpbjogW1xuICAgICAgICAwLjUsXG4gICAgICAgIDAuNSxcbiAgICAgICAgMC41XG4gICAgXSxcbiAgICBkcmlmdDogMC41LFxuICAgIHNsb3A6IDAsXG4gICAgcmVzdGl0dXRpb246IDAuNSxcbiAgICBvbkNvbnRhY3Q6IFdhbGxzLk9OX0NPTlRBQ1QuUkVGTEVDVFxufTtcbnZhciBfU0lERV9OT1JNQUxTID0ge1xuICAgICAgICAwOiBuZXcgVmVjdG9yKDEsIDAsIDApLFxuICAgICAgICAxOiBuZXcgVmVjdG9yKC0xLCAwLCAwKSxcbiAgICAgICAgMjogbmV3IFZlY3RvcigwLCAxLCAwKSxcbiAgICAgICAgMzogbmV3IFZlY3RvcigwLCAtMSwgMCksXG4gICAgICAgIDQ6IG5ldyBWZWN0b3IoMCwgMCwgMSksXG4gICAgICAgIDU6IG5ldyBWZWN0b3IoMCwgMCwgLTEpXG4gICAgfTtcbmZ1bmN0aW9uIF9nZXREaXN0YW5jZShzaWRlLCBzaXplLCBvcmlnaW4pIHtcbiAgICB2YXIgZGlzdGFuY2U7XG4gICAgdmFyIFNJREVTID0gV2FsbHMuU0lERVM7XG4gICAgc3dpdGNoIChwYXJzZUludChzaWRlKSkge1xuICAgIGNhc2UgU0lERVMuTEVGVDpcbiAgICAgICAgZGlzdGFuY2UgPSBzaXplWzBdICogb3JpZ2luWzBdO1xuICAgICAgICBicmVhaztcbiAgICBjYXNlIFNJREVTLlRPUDpcbiAgICAgICAgZGlzdGFuY2UgPSBzaXplWzFdICogb3JpZ2luWzFdO1xuICAgICAgICBicmVhaztcbiAgICBjYXNlIFNJREVTLkZST05UOlxuICAgICAgICBkaXN0YW5jZSA9IHNpemVbMl0gKiBvcmlnaW5bMl07XG4gICAgICAgIGJyZWFrO1xuICAgIGNhc2UgU0lERVMuUklHSFQ6XG4gICAgICAgIGRpc3RhbmNlID0gc2l6ZVswXSAqICgxIC0gb3JpZ2luWzBdKTtcbiAgICAgICAgYnJlYWs7XG4gICAgY2FzZSBTSURFUy5CT1RUT006XG4gICAgICAgIGRpc3RhbmNlID0gc2l6ZVsxXSAqICgxIC0gb3JpZ2luWzFdKTtcbiAgICAgICAgYnJlYWs7XG4gICAgY2FzZSBTSURFUy5CQUNLOlxuICAgICAgICBkaXN0YW5jZSA9IHNpemVbMl0gKiAoMSAtIG9yaWdpblsyXSk7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgICByZXR1cm4gZGlzdGFuY2U7XG59XG5XYWxscy5wcm90b3R5cGUuc2V0T3B0aW9ucyA9IGZ1bmN0aW9uIHNldE9wdGlvbnMob3B0aW9ucykge1xuICAgIHZhciByZXNpemVGbGFnID0gZmFsc2U7XG4gICAgaWYgKG9wdGlvbnMucmVzdGl0dXRpb24gIT09IHVuZGVmaW5lZClcbiAgICAgICAgX3NldE9wdGlvbnNGb3JFYWNoLmNhbGwodGhpcywgeyByZXN0aXR1dGlvbjogb3B0aW9ucy5yZXN0aXR1dGlvbiB9KTtcbiAgICBpZiAob3B0aW9ucy5kcmlmdCAhPT0gdW5kZWZpbmVkKVxuICAgICAgICBfc2V0T3B0aW9uc0ZvckVhY2guY2FsbCh0aGlzLCB7IGRyaWZ0OiBvcHRpb25zLmRyaWZ0IH0pO1xuICAgIGlmIChvcHRpb25zLnNsb3AgIT09IHVuZGVmaW5lZClcbiAgICAgICAgX3NldE9wdGlvbnNGb3JFYWNoLmNhbGwodGhpcywgeyBzbG9wOiBvcHRpb25zLnNsb3AgfSk7XG4gICAgaWYgKG9wdGlvbnMub25Db250YWN0ICE9PSB1bmRlZmluZWQpXG4gICAgICAgIF9zZXRPcHRpb25zRm9yRWFjaC5jYWxsKHRoaXMsIHsgb25Db250YWN0OiBvcHRpb25zLm9uQ29udGFjdCB9KTtcbiAgICBpZiAob3B0aW9ucy5zaXplICE9PSB1bmRlZmluZWQpXG4gICAgICAgIHJlc2l6ZUZsYWcgPSB0cnVlO1xuICAgIGlmIChvcHRpb25zLnNpZGVzICE9PSB1bmRlZmluZWQpXG4gICAgICAgIHRoaXMub3B0aW9ucy5zaWRlcyA9IG9wdGlvbnMuc2lkZXM7XG4gICAgaWYgKG9wdGlvbnMub3JpZ2luICE9PSB1bmRlZmluZWQpXG4gICAgICAgIHJlc2l6ZUZsYWcgPSB0cnVlO1xuICAgIGlmIChyZXNpemVGbGFnKVxuICAgICAgICB0aGlzLnNldFNpemUob3B0aW9ucy5zaXplLCBvcHRpb25zLm9yaWdpbik7XG59O1xuZnVuY3Rpb24gX2NyZWF0ZUNvbXBvbmVudHMoc2lkZXMpIHtcbiAgICB0aGlzLmNvbXBvbmVudHMgPSB7fTtcbiAgICB2YXIgY29tcG9uZW50cyA9IHRoaXMuY29tcG9uZW50cztcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNpZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBzaWRlID0gc2lkZXNbaV07XG4gICAgICAgIGNvbXBvbmVudHNbaV0gPSBuZXcgV2FsbCh7XG4gICAgICAgICAgICBub3JtYWw6IF9TSURFX05PUk1BTFNbc2lkZV0uY2xvbmUoKSxcbiAgICAgICAgICAgIGRpc3RhbmNlOiBfZ2V0RGlzdGFuY2Uoc2lkZSwgdGhpcy5vcHRpb25zLnNpemUsIHRoaXMub3B0aW9ucy5vcmlnaW4pXG4gICAgICAgIH0pO1xuICAgIH1cbn1cbldhbGxzLnByb3RvdHlwZS5zZXRTaXplID0gZnVuY3Rpb24gc2V0U2l6ZShzaXplLCBvcmlnaW4pIHtcbiAgICBvcmlnaW4gPSBvcmlnaW4gfHwgdGhpcy5vcHRpb25zLm9yaWdpbjtcbiAgICBpZiAob3JpZ2luLmxlbmd0aCA8IDMpXG4gICAgICAgIG9yaWdpblsyXSA9IDAuNTtcbiAgICB0aGlzLmZvckVhY2goZnVuY3Rpb24gKHdhbGwsIHNpZGUpIHtcbiAgICAgICAgdmFyIGQgPSBfZ2V0RGlzdGFuY2Uoc2lkZSwgc2l6ZSwgb3JpZ2luKTtcbiAgICAgICAgd2FsbC5zZXRPcHRpb25zKHsgZGlzdGFuY2U6IGQgfSk7XG4gICAgfSk7XG4gICAgdGhpcy5vcHRpb25zLnNpemUgPSBzaXplO1xuICAgIHRoaXMub3B0aW9ucy5vcmlnaW4gPSBvcmlnaW47XG59O1xuZnVuY3Rpb24gX3NldE9wdGlvbnNGb3JFYWNoKG9wdGlvbnMpIHtcbiAgICB0aGlzLmZvckVhY2goZnVuY3Rpb24gKHdhbGwpIHtcbiAgICAgICAgd2FsbC5zZXRPcHRpb25zKG9wdGlvbnMpO1xuICAgIH0pO1xuICAgIGZvciAodmFyIGtleSBpbiBvcHRpb25zKVxuICAgICAgICB0aGlzLm9wdGlvbnNba2V5XSA9IG9wdGlvbnNba2V5XTtcbn1cbldhbGxzLnByb3RvdHlwZS5hcHBseUNvbnN0cmFpbnQgPSBmdW5jdGlvbiBhcHBseUNvbnN0cmFpbnQodGFyZ2V0cywgc291cmNlLCBkdCkge1xuICAgIHRoaXMuZm9yRWFjaChmdW5jdGlvbiAod2FsbCkge1xuICAgICAgICB3YWxsLmFwcGx5Q29uc3RyYWludCh0YXJnZXRzLCBzb3VyY2UsIGR0KTtcbiAgICB9KTtcbn07XG5XYWxscy5wcm90b3R5cGUuZm9yRWFjaCA9IGZ1bmN0aW9uIGZvckVhY2goZm4pIHtcbiAgICB2YXIgc2lkZXMgPSB0aGlzLm9wdGlvbnMuc2lkZXM7XG4gICAgZm9yICh2YXIga2V5IGluIHRoaXMuc2lkZXMpXG4gICAgICAgIGZuKHNpZGVzW2tleV0sIGtleSk7XG59O1xuV2FsbHMucHJvdG90eXBlLnJvdGF0ZVogPSBmdW5jdGlvbiByb3RhdGVaKGFuZ2xlKSB7XG4gICAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uICh3YWxsKSB7XG4gICAgICAgIHZhciBuID0gd2FsbC5vcHRpb25zLm5vcm1hbDtcbiAgICAgICAgbi5yb3RhdGVaKGFuZ2xlKS5wdXQobik7XG4gICAgfSk7XG59O1xuV2FsbHMucHJvdG90eXBlLnJvdGF0ZVggPSBmdW5jdGlvbiByb3RhdGVYKGFuZ2xlKSB7XG4gICAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uICh3YWxsKSB7XG4gICAgICAgIHZhciBuID0gd2FsbC5vcHRpb25zLm5vcm1hbDtcbiAgICAgICAgbi5yb3RhdGVYKGFuZ2xlKS5wdXQobik7XG4gICAgfSk7XG59O1xuV2FsbHMucHJvdG90eXBlLnJvdGF0ZVkgPSBmdW5jdGlvbiByb3RhdGVZKGFuZ2xlKSB7XG4gICAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uICh3YWxsKSB7XG4gICAgICAgIHZhciBuID0gd2FsbC5vcHRpb25zLm5vcm1hbDtcbiAgICAgICAgbi5yb3RhdGVZKGFuZ2xlKS5wdXQobik7XG4gICAgfSk7XG59O1xubW9kdWxlLmV4cG9ydHMgPSBXYWxsczsiLCJ2YXIgRm9yY2UgPSByZXF1aXJlKCcuL0ZvcmNlJyk7XG5mdW5jdGlvbiBEcmFnKG9wdGlvbnMpIHtcbiAgICB0aGlzLm9wdGlvbnMgPSBPYmplY3QuY3JlYXRlKHRoaXMuY29uc3RydWN0b3IuREVGQVVMVF9PUFRJT05TKTtcbiAgICBpZiAob3B0aW9ucylcbiAgICAgICAgdGhpcy5zZXRPcHRpb25zKG9wdGlvbnMpO1xuICAgIEZvcmNlLmNhbGwodGhpcyk7XG59XG5EcmFnLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoRm9yY2UucHJvdG90eXBlKTtcbkRyYWcucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gRHJhZztcbkRyYWcuRk9SQ0VfRlVOQ1RJT05TID0ge1xuICAgIExJTkVBUjogZnVuY3Rpb24gKHZlbG9jaXR5KSB7XG4gICAgICAgIHJldHVybiB2ZWxvY2l0eTtcbiAgICB9LFxuICAgIFFVQURSQVRJQzogZnVuY3Rpb24gKHZlbG9jaXR5KSB7XG4gICAgICAgIHJldHVybiB2ZWxvY2l0eS5tdWx0KHZlbG9jaXR5Lm5vcm0oKSk7XG4gICAgfVxufTtcbkRyYWcuREVGQVVMVF9PUFRJT05TID0ge1xuICAgIHN0cmVuZ3RoOiAwLjAxLFxuICAgIGZvcmNlRnVuY3Rpb246IERyYWcuRk9SQ0VfRlVOQ1RJT05TLkxJTkVBUlxufTtcbkRyYWcucHJvdG90eXBlLmFwcGx5Rm9yY2UgPSBmdW5jdGlvbiBhcHBseUZvcmNlKHRhcmdldHMpIHtcbiAgICB2YXIgc3RyZW5ndGggPSB0aGlzLm9wdGlvbnMuc3RyZW5ndGg7XG4gICAgdmFyIGZvcmNlRnVuY3Rpb24gPSB0aGlzLm9wdGlvbnMuZm9yY2VGdW5jdGlvbjtcbiAgICB2YXIgZm9yY2UgPSB0aGlzLmZvcmNlO1xuICAgIHZhciBpbmRleDtcbiAgICB2YXIgcGFydGljbGU7XG4gICAgZm9yIChpbmRleCA9IDA7IGluZGV4IDwgdGFyZ2V0cy5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgcGFydGljbGUgPSB0YXJnZXRzW2luZGV4XTtcbiAgICAgICAgZm9yY2VGdW5jdGlvbihwYXJ0aWNsZS52ZWxvY2l0eSkubXVsdCgtc3RyZW5ndGgpLnB1dChmb3JjZSk7XG4gICAgICAgIHBhcnRpY2xlLmFwcGx5Rm9yY2UoZm9yY2UpO1xuICAgIH1cbn07XG5EcmFnLnByb3RvdHlwZS5zZXRPcHRpb25zID0gZnVuY3Rpb24gc2V0T3B0aW9ucyhvcHRpb25zKSB7XG4gICAgZm9yICh2YXIga2V5IGluIG9wdGlvbnMpXG4gICAgICAgIHRoaXMub3B0aW9uc1trZXldID0gb3B0aW9uc1trZXldO1xufTtcbm1vZHVsZS5leHBvcnRzID0gRHJhZzsiLCJ2YXIgVmVjdG9yID0gcmVxdWlyZSgnLi4vLi4vbWF0aC9WZWN0b3InKTtcbnZhciBFdmVudEhhbmRsZXIgPSByZXF1aXJlKCcuLi8uLi9jb3JlL0V2ZW50SGFuZGxlcicpO1xuZnVuY3Rpb24gRm9yY2UoZm9yY2UpIHtcbiAgICB0aGlzLmZvcmNlID0gbmV3IFZlY3Rvcihmb3JjZSk7XG4gICAgdGhpcy5fZXZlbnRPdXRwdXQgPSBuZXcgRXZlbnRIYW5kbGVyKCk7XG4gICAgRXZlbnRIYW5kbGVyLnNldE91dHB1dEhhbmRsZXIodGhpcywgdGhpcy5fZXZlbnRPdXRwdXQpO1xufVxuRm9yY2UucHJvdG90eXBlLnNldE9wdGlvbnMgPSBmdW5jdGlvbiBzZXRPcHRpb25zKG9wdGlvbnMpIHtcbiAgICB0aGlzLl9ldmVudE91dHB1dC5lbWl0KCdjaGFuZ2UnLCBvcHRpb25zKTtcbn07XG5Gb3JjZS5wcm90b3R5cGUuYXBwbHlGb3JjZSA9IGZ1bmN0aW9uIGFwcGx5Rm9yY2UodGFyZ2V0cykge1xuICAgIHZhciBsZW5ndGggPSB0YXJnZXRzLmxlbmd0aDtcbiAgICB3aGlsZSAobGVuZ3RoLS0pIHtcbiAgICAgICAgdGFyZ2V0c1tsZW5ndGhdLmFwcGx5Rm9yY2UodGhpcy5mb3JjZSk7XG4gICAgfVxufTtcbkZvcmNlLnByb3RvdHlwZS5nZXRFbmVyZ3kgPSBmdW5jdGlvbiBnZXRFbmVyZ3koKSB7XG4gICAgcmV0dXJuIDA7XG59O1xubW9kdWxlLmV4cG9ydHMgPSBGb3JjZTsiLCJ2YXIgRm9yY2UgPSByZXF1aXJlKCcuL0ZvcmNlJyk7XG52YXIgVmVjdG9yID0gcmVxdWlyZSgnLi4vLi4vbWF0aC9WZWN0b3InKTtcbmZ1bmN0aW9uIFJlcHVsc2lvbihvcHRpb25zKSB7XG4gICAgdGhpcy5vcHRpb25zID0gT2JqZWN0LmNyZWF0ZShSZXB1bHNpb24uREVGQVVMVF9PUFRJT05TKTtcbiAgICBpZiAob3B0aW9ucylcbiAgICAgICAgdGhpcy5zZXRPcHRpb25zKG9wdGlvbnMpO1xuICAgIHRoaXMuZGlzcCA9IG5ldyBWZWN0b3IoKTtcbiAgICBGb3JjZS5jYWxsKHRoaXMpO1xufVxuUmVwdWxzaW9uLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoRm9yY2UucHJvdG90eXBlKTtcblJlcHVsc2lvbi5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBSZXB1bHNpb247XG5SZXB1bHNpb24uREVDQVlfRlVOQ1RJT05TID0ge1xuICAgIExJTkVBUjogZnVuY3Rpb24gKHIsIGN1dG9mZikge1xuICAgICAgICByZXR1cm4gTWF0aC5tYXgoMSAtIDEgLyBjdXRvZmYgKiByLCAwKTtcbiAgICB9LFxuICAgIE1PUlNFOiBmdW5jdGlvbiAociwgY3V0b2ZmKSB7XG4gICAgICAgIHZhciByMCA9IGN1dG9mZiA9PT0gMCA/IDEwMCA6IGN1dG9mZjtcbiAgICAgICAgdmFyIHJTaGlmdGVkID0gciArIHIwICogKDEgLSBNYXRoLmxvZygyKSk7XG4gICAgICAgIHJldHVybiBNYXRoLm1heCgxIC0gTWF0aC5wb3coMSAtIE1hdGguZXhwKHJTaGlmdGVkIC8gcjAgLSAxKSwgMiksIDApO1xuICAgIH0sXG4gICAgSU5WRVJTRTogZnVuY3Rpb24gKHIsIGN1dG9mZikge1xuICAgICAgICByZXR1cm4gMSAvICgxIC0gY3V0b2ZmICsgcik7XG4gICAgfSxcbiAgICBHUkFWSVRZOiBmdW5jdGlvbiAociwgY3V0b2ZmKSB7XG4gICAgICAgIHJldHVybiAxIC8gKDEgLSBjdXRvZmYgKyByICogcik7XG4gICAgfVxufTtcblJlcHVsc2lvbi5ERUZBVUxUX09QVElPTlMgPSB7XG4gICAgc3RyZW5ndGg6IDEsXG4gICAgYW5jaG9yOiB1bmRlZmluZWQsXG4gICAgcmFuZ2U6IFtcbiAgICAgICAgMCxcbiAgICAgICAgSW5maW5pdHlcbiAgICBdLFxuICAgIGN1dG9mZjogMCxcbiAgICBjYXA6IEluZmluaXR5LFxuICAgIGRlY2F5RnVuY3Rpb246IFJlcHVsc2lvbi5ERUNBWV9GVU5DVElPTlMuR1JBVklUWVxufTtcblJlcHVsc2lvbi5wcm90b3R5cGUuc2V0T3B0aW9ucyA9IGZ1bmN0aW9uIHNldE9wdGlvbnMob3B0aW9ucykge1xuICAgIGlmIChvcHRpb25zLmFuY2hvciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGlmIChvcHRpb25zLmFuY2hvci5wb3NpdGlvbiBpbnN0YW5jZW9mIFZlY3RvcilcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5hbmNob3IgPSBvcHRpb25zLmFuY2hvci5wb3NpdGlvbjtcbiAgICAgICAgaWYgKG9wdGlvbnMuYW5jaG9yIGluc3RhbmNlb2YgQXJyYXkpXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMuYW5jaG9yID0gbmV3IFZlY3RvcihvcHRpb25zLmFuY2hvcik7XG4gICAgICAgIGRlbGV0ZSBvcHRpb25zLmFuY2hvcjtcbiAgICB9XG4gICAgZm9yICh2YXIga2V5IGluIG9wdGlvbnMpXG4gICAgICAgIHRoaXMub3B0aW9uc1trZXldID0gb3B0aW9uc1trZXldO1xufTtcblJlcHVsc2lvbi5wcm90b3R5cGUuYXBwbHlGb3JjZSA9IGZ1bmN0aW9uIGFwcGx5Rm9yY2UodGFyZ2V0cywgc291cmNlKSB7XG4gICAgdmFyIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnM7XG4gICAgdmFyIGZvcmNlID0gdGhpcy5mb3JjZTtcbiAgICB2YXIgZGlzcCA9IHRoaXMuZGlzcDtcbiAgICB2YXIgc3RyZW5ndGggPSBvcHRpb25zLnN0cmVuZ3RoO1xuICAgIHZhciBhbmNob3IgPSBvcHRpb25zLmFuY2hvciB8fCBzb3VyY2UucG9zaXRpb247XG4gICAgdmFyIGNhcCA9IG9wdGlvbnMuY2FwO1xuICAgIHZhciBjdXRvZmYgPSBvcHRpb25zLmN1dG9mZjtcbiAgICB2YXIgck1pbiA9IG9wdGlvbnMucmFuZ2VbMF07XG4gICAgdmFyIHJNYXggPSBvcHRpb25zLnJhbmdlWzFdO1xuICAgIHZhciBkZWNheUZuID0gb3B0aW9ucy5kZWNheUZ1bmN0aW9uO1xuICAgIGlmIChzdHJlbmd0aCA9PT0gMClcbiAgICAgICAgcmV0dXJuO1xuICAgIHZhciBsZW5ndGggPSB0YXJnZXRzLmxlbmd0aDtcbiAgICB2YXIgcGFydGljbGU7XG4gICAgdmFyIG0xO1xuICAgIHZhciBwMTtcbiAgICB2YXIgcjtcbiAgICB3aGlsZSAobGVuZ3RoLS0pIHtcbiAgICAgICAgcGFydGljbGUgPSB0YXJnZXRzW2xlbmd0aF07XG4gICAgICAgIGlmIChwYXJ0aWNsZSA9PT0gc291cmNlKVxuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIG0xID0gcGFydGljbGUubWFzcztcbiAgICAgICAgcDEgPSBwYXJ0aWNsZS5wb3NpdGlvbjtcbiAgICAgICAgZGlzcC5zZXQocDEuc3ViKGFuY2hvcikpO1xuICAgICAgICByID0gZGlzcC5ub3JtKCk7XG4gICAgICAgIGlmIChyIDwgck1heCAmJiByID4gck1pbikge1xuICAgICAgICAgICAgZm9yY2Uuc2V0KGRpc3Aubm9ybWFsaXplKHN0cmVuZ3RoICogbTEgKiBkZWNheUZuKHIsIGN1dG9mZikpLmNhcChjYXApKTtcbiAgICAgICAgICAgIHBhcnRpY2xlLmFwcGx5Rm9yY2UoZm9yY2UpO1xuICAgICAgICB9XG4gICAgfVxufTtcbm1vZHVsZS5leHBvcnRzID0gUmVwdWxzaW9uOyIsInZhciBGb3JjZSA9IHJlcXVpcmUoJy4vRm9yY2UnKTtcbnZhciBWZWN0b3IgPSByZXF1aXJlKCcuLi8uLi9tYXRoL1ZlY3RvcicpO1xuZnVuY3Rpb24gVmVjdG9yRmllbGQob3B0aW9ucykge1xuICAgIEZvcmNlLmNhbGwodGhpcyk7XG4gICAgdGhpcy5vcHRpb25zID0gT2JqZWN0LmNyZWF0ZShWZWN0b3JGaWVsZC5ERUZBVUxUX09QVElPTlMpO1xuICAgIGlmIChvcHRpb25zKVxuICAgICAgICB0aGlzLnNldE9wdGlvbnMob3B0aW9ucyk7XG4gICAgdGhpcy5ldmFsdWF0aW9uID0gbmV3IFZlY3RvcigpO1xufVxuVmVjdG9yRmllbGQucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShGb3JjZS5wcm90b3R5cGUpO1xuVmVjdG9yRmllbGQucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gVmVjdG9yRmllbGQ7XG5WZWN0b3JGaWVsZC5GSUVMRFMgPSB7XG4gICAgQ09OU1RBTlQ6IGZ1bmN0aW9uICh2LCBvcHRpb25zKSB7XG4gICAgICAgIG9wdGlvbnMuZGlyZWN0aW9uLnB1dCh0aGlzLmV2YWx1YXRpb24pO1xuICAgIH0sXG4gICAgTElORUFSOiBmdW5jdGlvbiAodikge1xuICAgICAgICB2LnB1dCh0aGlzLmV2YWx1YXRpb24pO1xuICAgIH0sXG4gICAgUkFESUFMOiBmdW5jdGlvbiAodikge1xuICAgICAgICB2Lm11bHQoLTEpLnB1dCh0aGlzLmV2YWx1YXRpb24pO1xuICAgIH0sXG4gICAgUE9JTlRfQVRUUkFDVE9SOiBmdW5jdGlvbiAodiwgb3B0aW9ucykge1xuICAgICAgICBvcHRpb25zLnBvc2l0aW9uLnN1Yih2KS5wdXQodGhpcy5ldmFsdWF0aW9uKTtcbiAgICB9XG59O1xuVmVjdG9yRmllbGQuREVGQVVMVF9PUFRJT05TID0ge1xuICAgIHN0cmVuZ3RoOiAwLjAxLFxuICAgIGZpZWxkOiBWZWN0b3JGaWVsZC5GSUVMRFMuQ09OU1RBTlRcbn07XG5WZWN0b3JGaWVsZC5wcm90b3R5cGUuc2V0T3B0aW9ucyA9IGZ1bmN0aW9uIHNldE9wdGlvbnMob3B0aW9ucykge1xuICAgIGlmIChvcHRpb25zLnN0cmVuZ3RoICE9PSB1bmRlZmluZWQpXG4gICAgICAgIHRoaXMub3B0aW9ucy5zdHJlbmd0aCA9IG9wdGlvbnMuc3RyZW5ndGg7XG4gICAgaWYgKG9wdGlvbnMuZmllbGQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICB0aGlzLm9wdGlvbnMuZmllbGQgPSBvcHRpb25zLmZpZWxkO1xuICAgICAgICBfc2V0RmllbGRPcHRpb25zLmNhbGwodGhpcywgdGhpcy5vcHRpb25zLmZpZWxkKTtcbiAgICB9XG59O1xuZnVuY3Rpb24gX3NldEZpZWxkT3B0aW9ucyhmaWVsZCkge1xuICAgIHZhciBGSUVMRFMgPSBWZWN0b3JGaWVsZC5GSUVMRFM7XG4gICAgc3dpdGNoIChmaWVsZCkge1xuICAgIGNhc2UgRklFTERTLkNPTlNUQU5UOlxuICAgICAgICBpZiAoIXRoaXMub3B0aW9ucy5kaXJlY3Rpb24pXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMuZGlyZWN0aW9uID0gbmV3IFZlY3RvcigwLCAxLCAwKTtcbiAgICAgICAgZWxzZSBpZiAodGhpcy5vcHRpb25zLmRpcmVjdGlvbiBpbnN0YW5jZW9mIEFycmF5KVxuICAgICAgICAgICAgdGhpcy5vcHRpb25zLmRpcmVjdGlvbiA9IG5ldyBWZWN0b3IodGhpcy5vcHRpb25zLmRpcmVjdGlvbik7XG4gICAgICAgIGJyZWFrO1xuICAgIGNhc2UgRklFTERTLlBPSU5UX0FUVFJBQ1RPUjpcbiAgICAgICAgaWYgKCF0aGlzLm9wdGlvbnMucG9zaXRpb24pXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMucG9zaXRpb24gPSBuZXcgVmVjdG9yKDAsIDAsIDApO1xuICAgICAgICBlbHNlIGlmICh0aGlzLm9wdGlvbnMucG9zaXRpb24gaW5zdGFuY2VvZiBBcnJheSlcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5wb3NpdGlvbiA9IG5ldyBWZWN0b3IodGhpcy5vcHRpb25zLnBvc2l0aW9uKTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxufVxuVmVjdG9yRmllbGQucHJvdG90eXBlLmFwcGx5Rm9yY2UgPSBmdW5jdGlvbiBhcHBseUZvcmNlKHRhcmdldHMpIHtcbiAgICB2YXIgZm9yY2UgPSB0aGlzLmZvcmNlO1xuICAgIHZhciBzdHJlbmd0aCA9IHRoaXMub3B0aW9ucy5zdHJlbmd0aDtcbiAgICB2YXIgZmllbGQgPSB0aGlzLm9wdGlvbnMuZmllbGQ7XG4gICAgdmFyIGk7XG4gICAgdmFyIHRhcmdldDtcbiAgICBmb3IgKGkgPSAwOyBpIDwgdGFyZ2V0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICB0YXJnZXQgPSB0YXJnZXRzW2ldO1xuICAgICAgICBmaWVsZC5jYWxsKHRoaXMsIHRhcmdldC5wb3NpdGlvbiwgdGhpcy5vcHRpb25zKTtcbiAgICAgICAgdGhpcy5ldmFsdWF0aW9uLm11bHQodGFyZ2V0Lm1hc3MgKiBzdHJlbmd0aCkucHV0KGZvcmNlKTtcbiAgICAgICAgdGFyZ2V0LmFwcGx5Rm9yY2UoZm9yY2UpO1xuICAgIH1cbn07XG5WZWN0b3JGaWVsZC5wcm90b3R5cGUuZ2V0RW5lcmd5ID0gZnVuY3Rpb24gZ2V0RW5lcmd5KHRhcmdldHMpIHtcbiAgICB2YXIgZmllbGQgPSB0aGlzLm9wdGlvbnMuZmllbGQ7XG4gICAgdmFyIEZJRUxEUyA9IFZlY3RvckZpZWxkLkZJRUxEUztcbiAgICB2YXIgZW5lcmd5ID0gMDtcbiAgICB2YXIgaTtcbiAgICB2YXIgdGFyZ2V0O1xuICAgIHN3aXRjaCAoZmllbGQpIHtcbiAgICBjYXNlIEZJRUxEUy5DT05TVEFOVDpcbiAgICAgICAgZW5lcmd5ID0gdGFyZ2V0cy5sZW5ndGggKiB0aGlzLm9wdGlvbnMuZGlyZWN0aW9uLm5vcm0oKTtcbiAgICAgICAgYnJlYWs7XG4gICAgY2FzZSBGSUVMRFMuUkFESUFMOlxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgdGFyZ2V0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdGFyZ2V0ID0gdGFyZ2V0c1tpXTtcbiAgICAgICAgICAgIGVuZXJneSArPSB0YXJnZXQucG9zaXRpb24ubm9ybSgpO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgIGNhc2UgRklFTERTLlBPSU5UX0FUVFJBQ1RPUjpcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IHRhcmdldHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHRhcmdldCA9IHRhcmdldHNbaV07XG4gICAgICAgICAgICBlbmVyZ3kgKz0gdGFyZ2V0LnBvc2l0aW9uLnN1Yih0aGlzLm9wdGlvbnMucG9zaXRpb24pLm5vcm0oKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICB9XG4gICAgZW5lcmd5ICo9IHRoaXMub3B0aW9ucy5zdHJlbmd0aDtcbiAgICByZXR1cm4gZW5lcmd5O1xufTtcbm1vZHVsZS5leHBvcnRzID0gVmVjdG9yRmllbGQ7IiwidmFyIFN5bXBsZWN0aWNFdWxlciA9IHt9O1xuU3ltcGxlY3RpY0V1bGVyLmludGVncmF0ZVZlbG9jaXR5ID0gZnVuY3Rpb24gaW50ZWdyYXRlVmVsb2NpdHkoYm9keSwgZHQpIHtcbiAgICB2YXIgdiA9IGJvZHkudmVsb2NpdHk7XG4gICAgdmFyIHcgPSBib2R5LmludmVyc2VNYXNzO1xuICAgIHZhciBmID0gYm9keS5mb3JjZTtcbiAgICBpZiAoZi5pc1plcm8oKSlcbiAgICAgICAgcmV0dXJuO1xuICAgIHYuYWRkKGYubXVsdChkdCAqIHcpKS5wdXQodik7XG4gICAgZi5jbGVhcigpO1xufTtcblN5bXBsZWN0aWNFdWxlci5pbnRlZ3JhdGVQb3NpdGlvbiA9IGZ1bmN0aW9uIGludGVncmF0ZVBvc2l0aW9uKGJvZHksIGR0KSB7XG4gICAgdmFyIHAgPSBib2R5LnBvc2l0aW9uO1xuICAgIHZhciB2ID0gYm9keS52ZWxvY2l0eTtcbiAgICBwLmFkZCh2Lm11bHQoZHQpKS5wdXQocCk7XG59O1xuU3ltcGxlY3RpY0V1bGVyLmludGVncmF0ZUFuZ3VsYXJNb21lbnR1bSA9IGZ1bmN0aW9uIGludGVncmF0ZUFuZ3VsYXJNb21lbnR1bShib2R5LCBkdCkge1xuICAgIHZhciBMID0gYm9keS5hbmd1bGFyTW9tZW50dW07XG4gICAgdmFyIHQgPSBib2R5LnRvcnF1ZTtcbiAgICBpZiAodC5pc1plcm8oKSlcbiAgICAgICAgcmV0dXJuO1xuICAgIEwuYWRkKHQubXVsdChkdCkpLnB1dChMKTtcbiAgICB0LmNsZWFyKCk7XG59O1xuU3ltcGxlY3RpY0V1bGVyLmludGVncmF0ZU9yaWVudGF0aW9uID0gZnVuY3Rpb24gaW50ZWdyYXRlT3JpZW50YXRpb24oYm9keSwgZHQpIHtcbiAgICB2YXIgcSA9IGJvZHkub3JpZW50YXRpb247XG4gICAgdmFyIHcgPSBib2R5LmFuZ3VsYXJWZWxvY2l0eTtcbiAgICBpZiAody5pc1plcm8oKSlcbiAgICAgICAgcmV0dXJuO1xuICAgIHEuYWRkKHEubXVsdGlwbHkodykuc2NhbGFyTXVsdGlwbHkoMC41ICogZHQpKS5wdXQocSk7XG59O1xubW9kdWxlLmV4cG9ydHMgPSBTeW1wbGVjdGljRXVsZXI7IiwidmFyIEVhc2luZyA9IHtcbiAgICAgICAgaW5RdWFkOiBmdW5jdGlvbiAodCkge1xuICAgICAgICAgICAgcmV0dXJuIHQgKiB0O1xuICAgICAgICB9LFxuICAgICAgICBvdXRRdWFkOiBmdW5jdGlvbiAodCkge1xuICAgICAgICAgICAgcmV0dXJuIC0odCAtPSAxKSAqIHQgKyAxO1xuICAgICAgICB9LFxuICAgICAgICBpbk91dFF1YWQ6IGZ1bmN0aW9uICh0KSB7XG4gICAgICAgICAgICBpZiAoKHQgLz0gMC41KSA8IDEpXG4gICAgICAgICAgICAgICAgcmV0dXJuIDAuNSAqIHQgKiB0O1xuICAgICAgICAgICAgcmV0dXJuIC0wLjUgKiAoLS10ICogKHQgLSAyKSAtIDEpO1xuICAgICAgICB9LFxuICAgICAgICBpbkN1YmljOiBmdW5jdGlvbiAodCkge1xuICAgICAgICAgICAgcmV0dXJuIHQgKiB0ICogdDtcbiAgICAgICAgfSxcbiAgICAgICAgb3V0Q3ViaWM6IGZ1bmN0aW9uICh0KSB7XG4gICAgICAgICAgICByZXR1cm4gLS10ICogdCAqIHQgKyAxO1xuICAgICAgICB9LFxuICAgICAgICBpbk91dEN1YmljOiBmdW5jdGlvbiAodCkge1xuICAgICAgICAgICAgaWYgKCh0IC89IDAuNSkgPCAxKVxuICAgICAgICAgICAgICAgIHJldHVybiAwLjUgKiB0ICogdCAqIHQ7XG4gICAgICAgICAgICByZXR1cm4gMC41ICogKCh0IC09IDIpICogdCAqIHQgKyAyKTtcbiAgICAgICAgfSxcbiAgICAgICAgaW5RdWFydDogZnVuY3Rpb24gKHQpIHtcbiAgICAgICAgICAgIHJldHVybiB0ICogdCAqIHQgKiB0O1xuICAgICAgICB9LFxuICAgICAgICBvdXRRdWFydDogZnVuY3Rpb24gKHQpIHtcbiAgICAgICAgICAgIHJldHVybiAtKC0tdCAqIHQgKiB0ICogdCAtIDEpO1xuICAgICAgICB9LFxuICAgICAgICBpbk91dFF1YXJ0OiBmdW5jdGlvbiAodCkge1xuICAgICAgICAgICAgaWYgKCh0IC89IDAuNSkgPCAxKVxuICAgICAgICAgICAgICAgIHJldHVybiAwLjUgKiB0ICogdCAqIHQgKiB0O1xuICAgICAgICAgICAgcmV0dXJuIC0wLjUgKiAoKHQgLT0gMikgKiB0ICogdCAqIHQgLSAyKTtcbiAgICAgICAgfSxcbiAgICAgICAgaW5RdWludDogZnVuY3Rpb24gKHQpIHtcbiAgICAgICAgICAgIHJldHVybiB0ICogdCAqIHQgKiB0ICogdDtcbiAgICAgICAgfSxcbiAgICAgICAgb3V0UXVpbnQ6IGZ1bmN0aW9uICh0KSB7XG4gICAgICAgICAgICByZXR1cm4gLS10ICogdCAqIHQgKiB0ICogdCArIDE7XG4gICAgICAgIH0sXG4gICAgICAgIGluT3V0UXVpbnQ6IGZ1bmN0aW9uICh0KSB7XG4gICAgICAgICAgICBpZiAoKHQgLz0gMC41KSA8IDEpXG4gICAgICAgICAgICAgICAgcmV0dXJuIDAuNSAqIHQgKiB0ICogdCAqIHQgKiB0O1xuICAgICAgICAgICAgcmV0dXJuIDAuNSAqICgodCAtPSAyKSAqIHQgKiB0ICogdCAqIHQgKyAyKTtcbiAgICAgICAgfSxcbiAgICAgICAgaW5TaW5lOiBmdW5jdGlvbiAodCkge1xuICAgICAgICAgICAgcmV0dXJuIC0xICogTWF0aC5jb3ModCAqIChNYXRoLlBJIC8gMikpICsgMTtcbiAgICAgICAgfSxcbiAgICAgICAgb3V0U2luZTogZnVuY3Rpb24gKHQpIHtcbiAgICAgICAgICAgIHJldHVybiBNYXRoLnNpbih0ICogKE1hdGguUEkgLyAyKSk7XG4gICAgICAgIH0sXG4gICAgICAgIGluT3V0U2luZTogZnVuY3Rpb24gKHQpIHtcbiAgICAgICAgICAgIHJldHVybiAtMC41ICogKE1hdGguY29zKE1hdGguUEkgKiB0KSAtIDEpO1xuICAgICAgICB9LFxuICAgICAgICBpbkV4cG86IGZ1bmN0aW9uICh0KSB7XG4gICAgICAgICAgICByZXR1cm4gdCA9PT0gMCA/IDAgOiBNYXRoLnBvdygyLCAxMCAqICh0IC0gMSkpO1xuICAgICAgICB9LFxuICAgICAgICBvdXRFeHBvOiBmdW5jdGlvbiAodCkge1xuICAgICAgICAgICAgcmV0dXJuIHQgPT09IDEgPyAxIDogLU1hdGgucG93KDIsIC0xMCAqIHQpICsgMTtcbiAgICAgICAgfSxcbiAgICAgICAgaW5PdXRFeHBvOiBmdW5jdGlvbiAodCkge1xuICAgICAgICAgICAgaWYgKHQgPT09IDApXG4gICAgICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgICAgICBpZiAodCA9PT0gMSlcbiAgICAgICAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgICAgIGlmICgodCAvPSAwLjUpIDwgMSlcbiAgICAgICAgICAgICAgICByZXR1cm4gMC41ICogTWF0aC5wb3coMiwgMTAgKiAodCAtIDEpKTtcbiAgICAgICAgICAgIHJldHVybiAwLjUgKiAoLU1hdGgucG93KDIsIC0xMCAqIC0tdCkgKyAyKTtcbiAgICAgICAgfSxcbiAgICAgICAgaW5DaXJjOiBmdW5jdGlvbiAodCkge1xuICAgICAgICAgICAgcmV0dXJuIC0oTWF0aC5zcXJ0KDEgLSB0ICogdCkgLSAxKTtcbiAgICAgICAgfSxcbiAgICAgICAgb3V0Q2lyYzogZnVuY3Rpb24gKHQpIHtcbiAgICAgICAgICAgIHJldHVybiBNYXRoLnNxcnQoMSAtIC0tdCAqIHQpO1xuICAgICAgICB9LFxuICAgICAgICBpbk91dENpcmM6IGZ1bmN0aW9uICh0KSB7XG4gICAgICAgICAgICBpZiAoKHQgLz0gMC41KSA8IDEpXG4gICAgICAgICAgICAgICAgcmV0dXJuIC0wLjUgKiAoTWF0aC5zcXJ0KDEgLSB0ICogdCkgLSAxKTtcbiAgICAgICAgICAgIHJldHVybiAwLjUgKiAoTWF0aC5zcXJ0KDEgLSAodCAtPSAyKSAqIHQpICsgMSk7XG4gICAgICAgIH0sXG4gICAgICAgIGluRWxhc3RpYzogZnVuY3Rpb24gKHQpIHtcbiAgICAgICAgICAgIHZhciBzID0gMS43MDE1ODtcbiAgICAgICAgICAgIHZhciBwID0gMDtcbiAgICAgICAgICAgIHZhciBhID0gMTtcbiAgICAgICAgICAgIGlmICh0ID09PSAwKVxuICAgICAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICAgICAgaWYgKHQgPT09IDEpXG4gICAgICAgICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgICAgICBpZiAoIXApXG4gICAgICAgICAgICAgICAgcCA9IDAuMztcbiAgICAgICAgICAgIHMgPSBwIC8gKDIgKiBNYXRoLlBJKSAqIE1hdGguYXNpbigxIC8gYSk7XG4gICAgICAgICAgICByZXR1cm4gLShhICogTWF0aC5wb3coMiwgMTAgKiAodCAtPSAxKSkgKiBNYXRoLnNpbigodCAtIHMpICogKDIgKiBNYXRoLlBJKSAvIHApKTtcbiAgICAgICAgfSxcbiAgICAgICAgb3V0RWxhc3RpYzogZnVuY3Rpb24gKHQpIHtcbiAgICAgICAgICAgIHZhciBzID0gMS43MDE1ODtcbiAgICAgICAgICAgIHZhciBwID0gMDtcbiAgICAgICAgICAgIHZhciBhID0gMTtcbiAgICAgICAgICAgIGlmICh0ID09PSAwKVxuICAgICAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICAgICAgaWYgKHQgPT09IDEpXG4gICAgICAgICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgICAgICBpZiAoIXApXG4gICAgICAgICAgICAgICAgcCA9IDAuMztcbiAgICAgICAgICAgIHMgPSBwIC8gKDIgKiBNYXRoLlBJKSAqIE1hdGguYXNpbigxIC8gYSk7XG4gICAgICAgICAgICByZXR1cm4gYSAqIE1hdGgucG93KDIsIC0xMCAqIHQpICogTWF0aC5zaW4oKHQgLSBzKSAqICgyICogTWF0aC5QSSkgLyBwKSArIDE7XG4gICAgICAgIH0sXG4gICAgICAgIGluT3V0RWxhc3RpYzogZnVuY3Rpb24gKHQpIHtcbiAgICAgICAgICAgIHZhciBzID0gMS43MDE1ODtcbiAgICAgICAgICAgIHZhciBwID0gMDtcbiAgICAgICAgICAgIHZhciBhID0gMTtcbiAgICAgICAgICAgIGlmICh0ID09PSAwKVxuICAgICAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICAgICAgaWYgKCh0IC89IDAuNSkgPT09IDIpXG4gICAgICAgICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgICAgICBpZiAoIXApXG4gICAgICAgICAgICAgICAgcCA9IDAuMyAqIDEuNTtcbiAgICAgICAgICAgIHMgPSBwIC8gKDIgKiBNYXRoLlBJKSAqIE1hdGguYXNpbigxIC8gYSk7XG4gICAgICAgICAgICBpZiAodCA8IDEpXG4gICAgICAgICAgICAgICAgcmV0dXJuIC0wLjUgKiAoYSAqIE1hdGgucG93KDIsIDEwICogKHQgLT0gMSkpICogTWF0aC5zaW4oKHQgLSBzKSAqICgyICogTWF0aC5QSSkgLyBwKSk7XG4gICAgICAgICAgICByZXR1cm4gYSAqIE1hdGgucG93KDIsIC0xMCAqICh0IC09IDEpKSAqIE1hdGguc2luKCh0IC0gcykgKiAoMiAqIE1hdGguUEkpIC8gcCkgKiAwLjUgKyAxO1xuICAgICAgICB9LFxuICAgICAgICBpbkJhY2s6IGZ1bmN0aW9uICh0LCBzKSB7XG4gICAgICAgICAgICBpZiAocyA9PT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgICAgIHMgPSAxLjcwMTU4O1xuICAgICAgICAgICAgcmV0dXJuIHQgKiB0ICogKChzICsgMSkgKiB0IC0gcyk7XG4gICAgICAgIH0sXG4gICAgICAgIG91dEJhY2s6IGZ1bmN0aW9uICh0LCBzKSB7XG4gICAgICAgICAgICBpZiAocyA9PT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgICAgIHMgPSAxLjcwMTU4O1xuICAgICAgICAgICAgcmV0dXJuIC0tdCAqIHQgKiAoKHMgKyAxKSAqIHQgKyBzKSArIDE7XG4gICAgICAgIH0sXG4gICAgICAgIGluT3V0QmFjazogZnVuY3Rpb24gKHQsIHMpIHtcbiAgICAgICAgICAgIGlmIChzID09PSB1bmRlZmluZWQpXG4gICAgICAgICAgICAgICAgcyA9IDEuNzAxNTg7XG4gICAgICAgICAgICBpZiAoKHQgLz0gMC41KSA8IDEpXG4gICAgICAgICAgICAgICAgcmV0dXJuIDAuNSAqICh0ICogdCAqICgoKHMgKj0gMS41MjUpICsgMSkgKiB0IC0gcykpO1xuICAgICAgICAgICAgcmV0dXJuIDAuNSAqICgodCAtPSAyKSAqIHQgKiAoKChzICo9IDEuNTI1KSArIDEpICogdCArIHMpICsgMik7XG4gICAgICAgIH0sXG4gICAgICAgIGluQm91bmNlOiBmdW5jdGlvbiAodCkge1xuICAgICAgICAgICAgcmV0dXJuIDEgLSBFYXNpbmcub3V0Qm91bmNlKDEgLSB0KTtcbiAgICAgICAgfSxcbiAgICAgICAgb3V0Qm91bmNlOiBmdW5jdGlvbiAodCkge1xuICAgICAgICAgICAgaWYgKHQgPCAxIC8gMi43NSkge1xuICAgICAgICAgICAgICAgIHJldHVybiA3LjU2MjUgKiB0ICogdDtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodCA8IDIgLyAyLjc1KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDcuNTYyNSAqICh0IC09IDEuNSAvIDIuNzUpICogdCArIDAuNzU7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHQgPCAyLjUgLyAyLjc1KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDcuNTYyNSAqICh0IC09IDIuMjUgLyAyLjc1KSAqIHQgKyAwLjkzNzU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiA3LjU2MjUgKiAodCAtPSAyLjYyNSAvIDIuNzUpICogdCArIDAuOTg0Mzc1O1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBpbk91dEJvdW5jZTogZnVuY3Rpb24gKHQpIHtcbiAgICAgICAgICAgIGlmICh0IDwgMC41KVxuICAgICAgICAgICAgICAgIHJldHVybiBFYXNpbmcuaW5Cb3VuY2UodCAqIDIpICogMC41O1xuICAgICAgICAgICAgcmV0dXJuIEVhc2luZy5vdXRCb3VuY2UodCAqIDIgLSAxKSAqIDAuNSArIDAuNTtcbiAgICAgICAgfVxuICAgIH07XG5tb2R1bGUuZXhwb3J0cyA9IEVhc2luZzsiLCJ2YXIgVXRpbGl0eSA9IHJlcXVpcmUoJy4uL3V0aWxpdGllcy9VdGlsaXR5Jyk7XG5mdW5jdGlvbiBNdWx0aXBsZVRyYW5zaXRpb24obWV0aG9kKSB7XG4gICAgdGhpcy5tZXRob2QgPSBtZXRob2Q7XG4gICAgdGhpcy5faW5zdGFuY2VzID0gW107XG4gICAgdGhpcy5zdGF0ZSA9IFtdO1xufVxuTXVsdGlwbGVUcmFuc2l0aW9uLlNVUFBPUlRTX01VTFRJUExFID0gdHJ1ZTtcbk11bHRpcGxlVHJhbnNpdGlvbi5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24gZ2V0KCkge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5faW5zdGFuY2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHRoaXMuc3RhdGVbaV0gPSB0aGlzLl9pbnN0YW5jZXNbaV0uZ2V0KCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnN0YXRlO1xufTtcbk11bHRpcGxlVHJhbnNpdGlvbi5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24gc2V0KGVuZFN0YXRlLCB0cmFuc2l0aW9uLCBjYWxsYmFjaykge1xuICAgIHZhciBfYWxsQ2FsbGJhY2sgPSBVdGlsaXR5LmFmdGVyKGVuZFN0YXRlLmxlbmd0aCwgY2FsbGJhY2spO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZW5kU3RhdGUubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKCF0aGlzLl9pbnN0YW5jZXNbaV0pXG4gICAgICAgICAgICB0aGlzLl9pbnN0YW5jZXNbaV0gPSBuZXcgdGhpcy5tZXRob2QoKTtcbiAgICAgICAgdGhpcy5faW5zdGFuY2VzW2ldLnNldChlbmRTdGF0ZVtpXSwgdHJhbnNpdGlvbiwgX2FsbENhbGxiYWNrKTtcbiAgICB9XG59O1xuTXVsdGlwbGVUcmFuc2l0aW9uLnByb3RvdHlwZS5yZXNldCA9IGZ1bmN0aW9uIHJlc2V0KHN0YXJ0U3RhdGUpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHN0YXJ0U3RhdGUubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKCF0aGlzLl9pbnN0YW5jZXNbaV0pXG4gICAgICAgICAgICB0aGlzLl9pbnN0YW5jZXNbaV0gPSBuZXcgdGhpcy5tZXRob2QoKTtcbiAgICAgICAgdGhpcy5faW5zdGFuY2VzW2ldLnJlc2V0KHN0YXJ0U3RhdGVbaV0pO1xuICAgIH1cbn07XG5tb2R1bGUuZXhwb3J0cyA9IE11bHRpcGxlVHJhbnNpdGlvbjsiLCJ2YXIgTXVsdGlwbGVUcmFuc2l0aW9uID0gcmVxdWlyZSgnLi9NdWx0aXBsZVRyYW5zaXRpb24nKTtcbnZhciBUd2VlblRyYW5zaXRpb24gPSByZXF1aXJlKCcuL1R3ZWVuVHJhbnNpdGlvbicpO1xuZnVuY3Rpb24gVHJhbnNpdGlvbmFibGUoc3RhcnQpIHtcbiAgICB0aGlzLmN1cnJlbnRBY3Rpb24gPSBudWxsO1xuICAgIHRoaXMuYWN0aW9uUXVldWUgPSBbXTtcbiAgICB0aGlzLmNhbGxiYWNrUXVldWUgPSBbXTtcbiAgICB0aGlzLnN0YXRlID0gMDtcbiAgICB0aGlzLnZlbG9jaXR5ID0gdW5kZWZpbmVkO1xuICAgIHRoaXMuX2NhbGxiYWNrID0gdW5kZWZpbmVkO1xuICAgIHRoaXMuX2VuZ2luZUluc3RhbmNlID0gbnVsbDtcbiAgICB0aGlzLl9jdXJyZW50TWV0aG9kID0gbnVsbDtcbiAgICB0aGlzLnNldChzdGFydCk7XG59XG52YXIgdHJhbnNpdGlvbk1ldGhvZHMgPSB7fTtcblRyYW5zaXRpb25hYmxlLnJlZ2lzdGVyID0gZnVuY3Rpb24gcmVnaXN0ZXIobWV0aG9kcykge1xuICAgIHZhciBzdWNjZXNzID0gdHJ1ZTtcbiAgICBmb3IgKHZhciBtZXRob2QgaW4gbWV0aG9kcykge1xuICAgICAgICBpZiAoIVRyYW5zaXRpb25hYmxlLnJlZ2lzdGVyTWV0aG9kKG1ldGhvZCwgbWV0aG9kc1ttZXRob2RdKSlcbiAgICAgICAgICAgIHN1Y2Nlc3MgPSBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHN1Y2Nlc3M7XG59O1xuVHJhbnNpdGlvbmFibGUucmVnaXN0ZXJNZXRob2QgPSBmdW5jdGlvbiByZWdpc3Rlck1ldGhvZChuYW1lLCBlbmdpbmVDbGFzcykge1xuICAgIGlmICghKG5hbWUgaW4gdHJhbnNpdGlvbk1ldGhvZHMpKSB7XG4gICAgICAgIHRyYW5zaXRpb25NZXRob2RzW25hbWVdID0gZW5naW5lQ2xhc3M7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gZWxzZVxuICAgICAgICByZXR1cm4gZmFsc2U7XG59O1xuVHJhbnNpdGlvbmFibGUudW5yZWdpc3Rlck1ldGhvZCA9IGZ1bmN0aW9uIHVucmVnaXN0ZXJNZXRob2QobmFtZSkge1xuICAgIGlmIChuYW1lIGluIHRyYW5zaXRpb25NZXRob2RzKSB7XG4gICAgICAgIGRlbGV0ZSB0cmFuc2l0aW9uTWV0aG9kc1tuYW1lXTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBlbHNlXG4gICAgICAgIHJldHVybiBmYWxzZTtcbn07XG5mdW5jdGlvbiBfbG9hZE5leHQoKSB7XG4gICAgaWYgKHRoaXMuX2NhbGxiYWNrKSB7XG4gICAgICAgIHZhciBjYWxsYmFjayA9IHRoaXMuX2NhbGxiYWNrO1xuICAgICAgICB0aGlzLl9jYWxsYmFjayA9IHVuZGVmaW5lZDtcbiAgICAgICAgY2FsbGJhY2soKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuYWN0aW9uUXVldWUubGVuZ3RoIDw9IDApIHtcbiAgICAgICAgdGhpcy5zZXQodGhpcy5nZXQoKSk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5jdXJyZW50QWN0aW9uID0gdGhpcy5hY3Rpb25RdWV1ZS5zaGlmdCgpO1xuICAgIHRoaXMuX2NhbGxiYWNrID0gdGhpcy5jYWxsYmFja1F1ZXVlLnNoaWZ0KCk7XG4gICAgdmFyIG1ldGhvZCA9IG51bGw7XG4gICAgdmFyIGVuZFZhbHVlID0gdGhpcy5jdXJyZW50QWN0aW9uWzBdO1xuICAgIHZhciB0cmFuc2l0aW9uID0gdGhpcy5jdXJyZW50QWN0aW9uWzFdO1xuICAgIGlmICh0cmFuc2l0aW9uIGluc3RhbmNlb2YgT2JqZWN0ICYmIHRyYW5zaXRpb24ubWV0aG9kKSB7XG4gICAgICAgIG1ldGhvZCA9IHRyYW5zaXRpb24ubWV0aG9kO1xuICAgICAgICBpZiAodHlwZW9mIG1ldGhvZCA9PT0gJ3N0cmluZycpXG4gICAgICAgICAgICBtZXRob2QgPSB0cmFuc2l0aW9uTWV0aG9kc1ttZXRob2RdO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIG1ldGhvZCA9IFR3ZWVuVHJhbnNpdGlvbjtcbiAgICB9XG4gICAgaWYgKHRoaXMuX2N1cnJlbnRNZXRob2QgIT09IG1ldGhvZCkge1xuICAgICAgICBpZiAoIShlbmRWYWx1ZSBpbnN0YW5jZW9mIE9iamVjdCkgfHwgbWV0aG9kLlNVUFBPUlRTX01VTFRJUExFID09PSB0cnVlIHx8IGVuZFZhbHVlLmxlbmd0aCA8PSBtZXRob2QuU1VQUE9SVFNfTVVMVElQTEUpIHtcbiAgICAgICAgICAgIHRoaXMuX2VuZ2luZUluc3RhbmNlID0gbmV3IG1ldGhvZCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fZW5naW5lSW5zdGFuY2UgPSBuZXcgTXVsdGlwbGVUcmFuc2l0aW9uKG1ldGhvZCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fY3VycmVudE1ldGhvZCA9IG1ldGhvZDtcbiAgICB9XG4gICAgdGhpcy5fZW5naW5lSW5zdGFuY2UucmVzZXQodGhpcy5zdGF0ZSwgdGhpcy52ZWxvY2l0eSk7XG4gICAgaWYgKHRoaXMudmVsb2NpdHkgIT09IHVuZGVmaW5lZClcbiAgICAgICAgdHJhbnNpdGlvbi52ZWxvY2l0eSA9IHRoaXMudmVsb2NpdHk7XG4gICAgdGhpcy5fZW5naW5lSW5zdGFuY2Uuc2V0KGVuZFZhbHVlLCB0cmFuc2l0aW9uLCBfbG9hZE5leHQuYmluZCh0aGlzKSk7XG59XG5UcmFuc2l0aW9uYWJsZS5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24gc2V0KGVuZFN0YXRlLCB0cmFuc2l0aW9uLCBjYWxsYmFjaykge1xuICAgIGlmICghdHJhbnNpdGlvbikge1xuICAgICAgICB0aGlzLnJlc2V0KGVuZFN0YXRlKTtcbiAgICAgICAgaWYgKGNhbGxiYWNrKVxuICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIHZhciBhY3Rpb24gPSBbXG4gICAgICAgICAgICBlbmRTdGF0ZSxcbiAgICAgICAgICAgIHRyYW5zaXRpb25cbiAgICAgICAgXTtcbiAgICB0aGlzLmFjdGlvblF1ZXVlLnB1c2goYWN0aW9uKTtcbiAgICB0aGlzLmNhbGxiYWNrUXVldWUucHVzaChjYWxsYmFjayk7XG4gICAgaWYgKCF0aGlzLmN1cnJlbnRBY3Rpb24pXG4gICAgICAgIF9sb2FkTmV4dC5jYWxsKHRoaXMpO1xuICAgIHJldHVybiB0aGlzO1xufTtcblRyYW5zaXRpb25hYmxlLnByb3RvdHlwZS5yZXNldCA9IGZ1bmN0aW9uIHJlc2V0KHN0YXJ0U3RhdGUsIHN0YXJ0VmVsb2NpdHkpIHtcbiAgICB0aGlzLl9jdXJyZW50TWV0aG9kID0gbnVsbDtcbiAgICB0aGlzLl9lbmdpbmVJbnN0YW5jZSA9IG51bGw7XG4gICAgdGhpcy5fY2FsbGJhY2sgPSB1bmRlZmluZWQ7XG4gICAgdGhpcy5zdGF0ZSA9IHN0YXJ0U3RhdGU7XG4gICAgdGhpcy52ZWxvY2l0eSA9IHN0YXJ0VmVsb2NpdHk7XG4gICAgdGhpcy5jdXJyZW50QWN0aW9uID0gbnVsbDtcbiAgICB0aGlzLmFjdGlvblF1ZXVlID0gW107XG4gICAgdGhpcy5jYWxsYmFja1F1ZXVlID0gW107XG59O1xuVHJhbnNpdGlvbmFibGUucHJvdG90eXBlLmRlbGF5ID0gZnVuY3Rpb24gZGVsYXkoZHVyYXRpb24sIGNhbGxiYWNrKSB7XG4gICAgdGhpcy5zZXQodGhpcy5nZXQoKSwge1xuICAgICAgICBkdXJhdGlvbjogZHVyYXRpb24sXG4gICAgICAgIGN1cnZlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgfVxuICAgIH0sIGNhbGxiYWNrKTtcbn07XG5UcmFuc2l0aW9uYWJsZS5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24gZ2V0KHRpbWVzdGFtcCkge1xuICAgIGlmICh0aGlzLl9lbmdpbmVJbnN0YW5jZSkge1xuICAgICAgICBpZiAodGhpcy5fZW5naW5lSW5zdGFuY2UuZ2V0VmVsb2NpdHkpXG4gICAgICAgICAgICB0aGlzLnZlbG9jaXR5ID0gdGhpcy5fZW5naW5lSW5zdGFuY2UuZ2V0VmVsb2NpdHkoKTtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHRoaXMuX2VuZ2luZUluc3RhbmNlLmdldCh0aW1lc3RhbXApO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5zdGF0ZTtcbn07XG5UcmFuc2l0aW9uYWJsZS5wcm90b3R5cGUuaXNBY3RpdmUgPSBmdW5jdGlvbiBpc0FjdGl2ZSgpIHtcbiAgICByZXR1cm4gISF0aGlzLmN1cnJlbnRBY3Rpb247XG59O1xuVHJhbnNpdGlvbmFibGUucHJvdG90eXBlLmhhbHQgPSBmdW5jdGlvbiBoYWx0KCkge1xuICAgIHJldHVybiB0aGlzLnNldCh0aGlzLmdldCgpKTtcbn07XG5tb2R1bGUuZXhwb3J0cyA9IFRyYW5zaXRpb25hYmxlOyIsInZhciBUcmFuc2l0aW9uYWJsZSA9IHJlcXVpcmUoJy4vVHJhbnNpdGlvbmFibGUnKTtcbnZhciBUcmFuc2Zvcm0gPSByZXF1aXJlKCcuLi9jb3JlL1RyYW5zZm9ybScpO1xudmFyIFV0aWxpdHkgPSByZXF1aXJlKCcuLi91dGlsaXRpZXMvVXRpbGl0eScpO1xuZnVuY3Rpb24gVHJhbnNpdGlvbmFibGVUcmFuc2Zvcm0odHJhbnNmb3JtKSB7XG4gICAgdGhpcy5fZmluYWwgPSBUcmFuc2Zvcm0uaWRlbnRpdHkuc2xpY2UoKTtcbiAgICB0aGlzLl9maW5hbFRyYW5zbGF0ZSA9IFtcbiAgICAgICAgMCxcbiAgICAgICAgMCxcbiAgICAgICAgMFxuICAgIF07XG4gICAgdGhpcy5fZmluYWxSb3RhdGUgPSBbXG4gICAgICAgIDAsXG4gICAgICAgIDAsXG4gICAgICAgIDBcbiAgICBdO1xuICAgIHRoaXMuX2ZpbmFsU2tldyA9IFtcbiAgICAgICAgMCxcbiAgICAgICAgMCxcbiAgICAgICAgMFxuICAgIF07XG4gICAgdGhpcy5fZmluYWxTY2FsZSA9IFtcbiAgICAgICAgMSxcbiAgICAgICAgMSxcbiAgICAgICAgMVxuICAgIF07XG4gICAgdGhpcy50cmFuc2xhdGUgPSBuZXcgVHJhbnNpdGlvbmFibGUodGhpcy5fZmluYWxUcmFuc2xhdGUpO1xuICAgIHRoaXMucm90YXRlID0gbmV3IFRyYW5zaXRpb25hYmxlKHRoaXMuX2ZpbmFsUm90YXRlKTtcbiAgICB0aGlzLnNrZXcgPSBuZXcgVHJhbnNpdGlvbmFibGUodGhpcy5fZmluYWxTa2V3KTtcbiAgICB0aGlzLnNjYWxlID0gbmV3IFRyYW5zaXRpb25hYmxlKHRoaXMuX2ZpbmFsU2NhbGUpO1xuICAgIGlmICh0cmFuc2Zvcm0pXG4gICAgICAgIHRoaXMuc2V0KHRyYW5zZm9ybSk7XG59XG5mdW5jdGlvbiBfYnVpbGQoKSB7XG4gICAgcmV0dXJuIFRyYW5zZm9ybS5idWlsZCh7XG4gICAgICAgIHRyYW5zbGF0ZTogdGhpcy50cmFuc2xhdGUuZ2V0KCksXG4gICAgICAgIHJvdGF0ZTogdGhpcy5yb3RhdGUuZ2V0KCksXG4gICAgICAgIHNrZXc6IHRoaXMuc2tldy5nZXQoKSxcbiAgICAgICAgc2NhbGU6IHRoaXMuc2NhbGUuZ2V0KClcbiAgICB9KTtcbn1cbmZ1bmN0aW9uIF9idWlsZEZpbmFsKCkge1xuICAgIHJldHVybiBUcmFuc2Zvcm0uYnVpbGQoe1xuICAgICAgICB0cmFuc2xhdGU6IHRoaXMuX2ZpbmFsVHJhbnNsYXRlLFxuICAgICAgICByb3RhdGU6IHRoaXMuX2ZpbmFsUm90YXRlLFxuICAgICAgICBza2V3OiB0aGlzLl9maW5hbFNrZXcsXG4gICAgICAgIHNjYWxlOiB0aGlzLl9maW5hbFNjYWxlXG4gICAgfSk7XG59XG5UcmFuc2l0aW9uYWJsZVRyYW5zZm9ybS5wcm90b3R5cGUuc2V0VHJhbnNsYXRlID0gZnVuY3Rpb24gc2V0VHJhbnNsYXRlKHRyYW5zbGF0ZSwgdHJhbnNpdGlvbiwgY2FsbGJhY2spIHtcbiAgICB0aGlzLl9maW5hbFRyYW5zbGF0ZSA9IHRyYW5zbGF0ZTtcbiAgICB0aGlzLl9maW5hbCA9IF9idWlsZEZpbmFsLmNhbGwodGhpcyk7XG4gICAgdGhpcy50cmFuc2xhdGUuc2V0KHRyYW5zbGF0ZSwgdHJhbnNpdGlvbiwgY2FsbGJhY2spO1xuICAgIHJldHVybiB0aGlzO1xufTtcblRyYW5zaXRpb25hYmxlVHJhbnNmb3JtLnByb3RvdHlwZS5zZXRTY2FsZSA9IGZ1bmN0aW9uIHNldFNjYWxlKHNjYWxlLCB0cmFuc2l0aW9uLCBjYWxsYmFjaykge1xuICAgIHRoaXMuX2ZpbmFsU2NhbGUgPSBzY2FsZTtcbiAgICB0aGlzLl9maW5hbCA9IF9idWlsZEZpbmFsLmNhbGwodGhpcyk7XG4gICAgdGhpcy5zY2FsZS5zZXQoc2NhbGUsIHRyYW5zaXRpb24sIGNhbGxiYWNrKTtcbiAgICByZXR1cm4gdGhpcztcbn07XG5UcmFuc2l0aW9uYWJsZVRyYW5zZm9ybS5wcm90b3R5cGUuc2V0Um90YXRlID0gZnVuY3Rpb24gc2V0Um90YXRlKGV1bGVyQW5nbGVzLCB0cmFuc2l0aW9uLCBjYWxsYmFjaykge1xuICAgIHRoaXMuX2ZpbmFsUm90YXRlID0gZXVsZXJBbmdsZXM7XG4gICAgdGhpcy5fZmluYWwgPSBfYnVpbGRGaW5hbC5jYWxsKHRoaXMpO1xuICAgIHRoaXMucm90YXRlLnNldChldWxlckFuZ2xlcywgdHJhbnNpdGlvbiwgY2FsbGJhY2spO1xuICAgIHJldHVybiB0aGlzO1xufTtcblRyYW5zaXRpb25hYmxlVHJhbnNmb3JtLnByb3RvdHlwZS5zZXRTa2V3ID0gZnVuY3Rpb24gc2V0U2tldyhza2V3QW5nbGVzLCB0cmFuc2l0aW9uLCBjYWxsYmFjaykge1xuICAgIHRoaXMuX2ZpbmFsU2tldyA9IHNrZXdBbmdsZXM7XG4gICAgdGhpcy5fZmluYWwgPSBfYnVpbGRGaW5hbC5jYWxsKHRoaXMpO1xuICAgIHRoaXMuc2tldy5zZXQoc2tld0FuZ2xlcywgdHJhbnNpdGlvbiwgY2FsbGJhY2spO1xuICAgIHJldHVybiB0aGlzO1xufTtcblRyYW5zaXRpb25hYmxlVHJhbnNmb3JtLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbiBzZXQodHJhbnNmb3JtLCB0cmFuc2l0aW9uLCBjYWxsYmFjaykge1xuICAgIHZhciBjb21wb25lbnRzID0gVHJhbnNmb3JtLmludGVycHJldCh0cmFuc2Zvcm0pO1xuICAgIHRoaXMuX2ZpbmFsVHJhbnNsYXRlID0gY29tcG9uZW50cy50cmFuc2xhdGU7XG4gICAgdGhpcy5fZmluYWxSb3RhdGUgPSBjb21wb25lbnRzLnJvdGF0ZTtcbiAgICB0aGlzLl9maW5hbFNrZXcgPSBjb21wb25lbnRzLnNrZXc7XG4gICAgdGhpcy5fZmluYWxTY2FsZSA9IGNvbXBvbmVudHMuc2NhbGU7XG4gICAgdGhpcy5fZmluYWwgPSB0cmFuc2Zvcm07XG4gICAgdmFyIF9jYWxsYmFjayA9IGNhbGxiYWNrID8gVXRpbGl0eS5hZnRlcig0LCBjYWxsYmFjaykgOiBudWxsO1xuICAgIHRoaXMudHJhbnNsYXRlLnNldChjb21wb25lbnRzLnRyYW5zbGF0ZSwgdHJhbnNpdGlvbiwgX2NhbGxiYWNrKTtcbiAgICB0aGlzLnJvdGF0ZS5zZXQoY29tcG9uZW50cy5yb3RhdGUsIHRyYW5zaXRpb24sIF9jYWxsYmFjayk7XG4gICAgdGhpcy5za2V3LnNldChjb21wb25lbnRzLnNrZXcsIHRyYW5zaXRpb24sIF9jYWxsYmFjayk7XG4gICAgdGhpcy5zY2FsZS5zZXQoY29tcG9uZW50cy5zY2FsZSwgdHJhbnNpdGlvbiwgX2NhbGxiYWNrKTtcbiAgICByZXR1cm4gdGhpcztcbn07XG5UcmFuc2l0aW9uYWJsZVRyYW5zZm9ybS5wcm90b3R5cGUuc2V0RGVmYXVsdFRyYW5zaXRpb24gPSBmdW5jdGlvbiBzZXREZWZhdWx0VHJhbnNpdGlvbih0cmFuc2l0aW9uKSB7XG4gICAgdGhpcy50cmFuc2xhdGUuc2V0RGVmYXVsdCh0cmFuc2l0aW9uKTtcbiAgICB0aGlzLnJvdGF0ZS5zZXREZWZhdWx0KHRyYW5zaXRpb24pO1xuICAgIHRoaXMuc2tldy5zZXREZWZhdWx0KHRyYW5zaXRpb24pO1xuICAgIHRoaXMuc2NhbGUuc2V0RGVmYXVsdCh0cmFuc2l0aW9uKTtcbn07XG5UcmFuc2l0aW9uYWJsZVRyYW5zZm9ybS5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24gZ2V0KCkge1xuICAgIGlmICh0aGlzLmlzQWN0aXZlKCkpIHtcbiAgICAgICAgcmV0dXJuIF9idWlsZC5jYWxsKHRoaXMpO1xuICAgIH0gZWxzZVxuICAgICAgICByZXR1cm4gdGhpcy5fZmluYWw7XG59O1xuVHJhbnNpdGlvbmFibGVUcmFuc2Zvcm0ucHJvdG90eXBlLmdldEZpbmFsID0gZnVuY3Rpb24gZ2V0RmluYWwoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2ZpbmFsO1xufTtcblRyYW5zaXRpb25hYmxlVHJhbnNmb3JtLnByb3RvdHlwZS5pc0FjdGl2ZSA9IGZ1bmN0aW9uIGlzQWN0aXZlKCkge1xuICAgIHJldHVybiB0aGlzLnRyYW5zbGF0ZS5pc0FjdGl2ZSgpIHx8IHRoaXMucm90YXRlLmlzQWN0aXZlKCkgfHwgdGhpcy5zY2FsZS5pc0FjdGl2ZSgpIHx8IHRoaXMuc2tldy5pc0FjdGl2ZSgpO1xufTtcblRyYW5zaXRpb25hYmxlVHJhbnNmb3JtLnByb3RvdHlwZS5oYWx0ID0gZnVuY3Rpb24gaGFsdCgpIHtcbiAgICB0aGlzLnRyYW5zbGF0ZS5oYWx0KCk7XG4gICAgdGhpcy5yb3RhdGUuaGFsdCgpO1xuICAgIHRoaXMuc2tldy5oYWx0KCk7XG4gICAgdGhpcy5zY2FsZS5oYWx0KCk7XG4gICAgdGhpcy5fZmluYWwgPSB0aGlzLmdldCgpO1xuICAgIHRoaXMuX2ZpbmFsVHJhbnNsYXRlID0gdGhpcy50cmFuc2xhdGUuZ2V0KCk7XG4gICAgdGhpcy5fZmluYWxSb3RhdGUgPSB0aGlzLnJvdGF0ZS5nZXQoKTtcbiAgICB0aGlzLl9maW5hbFNrZXcgPSB0aGlzLnNrZXcuZ2V0KCk7XG4gICAgdGhpcy5fZmluYWxTY2FsZSA9IHRoaXMuc2NhbGUuZ2V0KCk7XG4gICAgcmV0dXJuIHRoaXM7XG59O1xubW9kdWxlLmV4cG9ydHMgPSBUcmFuc2l0aW9uYWJsZVRyYW5zZm9ybTsiLCJmdW5jdGlvbiBUd2VlblRyYW5zaXRpb24ob3B0aW9ucykge1xuICAgIHRoaXMub3B0aW9ucyA9IE9iamVjdC5jcmVhdGUoVHdlZW5UcmFuc2l0aW9uLkRFRkFVTFRfT1BUSU9OUyk7XG4gICAgaWYgKG9wdGlvbnMpXG4gICAgICAgIHRoaXMuc2V0T3B0aW9ucyhvcHRpb25zKTtcbiAgICB0aGlzLl9zdGFydFRpbWUgPSAwO1xuICAgIHRoaXMuX3N0YXJ0VmFsdWUgPSAwO1xuICAgIHRoaXMuX3VwZGF0ZVRpbWUgPSAwO1xuICAgIHRoaXMuX2VuZFZhbHVlID0gMDtcbiAgICB0aGlzLl9jdXJ2ZSA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLl9kdXJhdGlvbiA9IDA7XG4gICAgdGhpcy5fYWN0aXZlID0gZmFsc2U7XG4gICAgdGhpcy5fY2FsbGJhY2sgPSB1bmRlZmluZWQ7XG4gICAgdGhpcy5zdGF0ZSA9IDA7XG4gICAgdGhpcy52ZWxvY2l0eSA9IHVuZGVmaW5lZDtcbn1cblR3ZWVuVHJhbnNpdGlvbi5DdXJ2ZXMgPSB7XG4gICAgbGluZWFyOiBmdW5jdGlvbiAodCkge1xuICAgICAgICByZXR1cm4gdDtcbiAgICB9LFxuICAgIGVhc2VJbjogZnVuY3Rpb24gKHQpIHtcbiAgICAgICAgcmV0dXJuIHQgKiB0O1xuICAgIH0sXG4gICAgZWFzZU91dDogZnVuY3Rpb24gKHQpIHtcbiAgICAgICAgcmV0dXJuIHQgKiAoMiAtIHQpO1xuICAgIH0sXG4gICAgZWFzZUluT3V0OiBmdW5jdGlvbiAodCkge1xuICAgICAgICBpZiAodCA8PSAwLjUpXG4gICAgICAgICAgICByZXR1cm4gMiAqIHQgKiB0O1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXR1cm4gLTIgKiB0ICogdCArIDQgKiB0IC0gMTtcbiAgICB9LFxuICAgIGVhc2VPdXRCb3VuY2U6IGZ1bmN0aW9uICh0KSB7XG4gICAgICAgIHJldHVybiB0ICogKDMgLSAyICogdCk7XG4gICAgfSxcbiAgICBzcHJpbmc6IGZ1bmN0aW9uICh0KSB7XG4gICAgICAgIHJldHVybiAoMSAtIHQpICogTWF0aC5zaW4oNiAqIE1hdGguUEkgKiB0KSArIHQ7XG4gICAgfVxufTtcblR3ZWVuVHJhbnNpdGlvbi5TVVBQT1JUU19NVUxUSVBMRSA9IHRydWU7XG5Ud2VlblRyYW5zaXRpb24uREVGQVVMVF9PUFRJT05TID0ge1xuICAgIGN1cnZlOiBUd2VlblRyYW5zaXRpb24uQ3VydmVzLmxpbmVhcixcbiAgICBkdXJhdGlvbjogNTAwLFxuICAgIHNwZWVkOiAwXG59O1xudmFyIHJlZ2lzdGVyZWRDdXJ2ZXMgPSB7fTtcblR3ZWVuVHJhbnNpdGlvbi5yZWdpc3RlckN1cnZlID0gZnVuY3Rpb24gcmVnaXN0ZXJDdXJ2ZShjdXJ2ZU5hbWUsIGN1cnZlKSB7XG4gICAgaWYgKCFyZWdpc3RlcmVkQ3VydmVzW2N1cnZlTmFtZV0pIHtcbiAgICAgICAgcmVnaXN0ZXJlZEN1cnZlc1tjdXJ2ZU5hbWVdID0gY3VydmU7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG59O1xuVHdlZW5UcmFuc2l0aW9uLnVucmVnaXN0ZXJDdXJ2ZSA9IGZ1bmN0aW9uIHVucmVnaXN0ZXJDdXJ2ZShjdXJ2ZU5hbWUpIHtcbiAgICBpZiAocmVnaXN0ZXJlZEN1cnZlc1tjdXJ2ZU5hbWVdKSB7XG4gICAgICAgIGRlbGV0ZSByZWdpc3RlcmVkQ3VydmVzW2N1cnZlTmFtZV07XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG59O1xuVHdlZW5UcmFuc2l0aW9uLmdldEN1cnZlID0gZnVuY3Rpb24gZ2V0Q3VydmUoY3VydmVOYW1lKSB7XG4gICAgdmFyIGN1cnZlID0gcmVnaXN0ZXJlZEN1cnZlc1tjdXJ2ZU5hbWVdO1xuICAgIGlmIChjdXJ2ZSAhPT0gdW5kZWZpbmVkKVxuICAgICAgICByZXR1cm4gY3VydmU7XG4gICAgZWxzZVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2N1cnZlIG5vdCByZWdpc3RlcmVkJyk7XG59O1xuVHdlZW5UcmFuc2l0aW9uLmdldEN1cnZlcyA9IGZ1bmN0aW9uIGdldEN1cnZlcygpIHtcbiAgICByZXR1cm4gcmVnaXN0ZXJlZEN1cnZlcztcbn07XG5mdW5jdGlvbiBfaW50ZXJwb2xhdGUoYSwgYiwgdCkge1xuICAgIHJldHVybiAoMSAtIHQpICogYSArIHQgKiBiO1xufVxuZnVuY3Rpb24gX2Nsb25lKG9iaikge1xuICAgIGlmIChvYmogaW5zdGFuY2VvZiBPYmplY3QpIHtcbiAgICAgICAgaWYgKG9iaiBpbnN0YW5jZW9mIEFycmF5KVxuICAgICAgICAgICAgcmV0dXJuIG9iai5zbGljZSgwKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmV0dXJuIE9iamVjdC5jcmVhdGUob2JqKTtcbiAgICB9IGVsc2VcbiAgICAgICAgcmV0dXJuIG9iajtcbn1cbmZ1bmN0aW9uIF9ub3JtYWxpemUodHJhbnNpdGlvbiwgZGVmYXVsdFRyYW5zaXRpb24pIHtcbiAgICB2YXIgcmVzdWx0ID0geyBjdXJ2ZTogZGVmYXVsdFRyYW5zaXRpb24uY3VydmUgfTtcbiAgICBpZiAoZGVmYXVsdFRyYW5zaXRpb24uZHVyYXRpb24pXG4gICAgICAgIHJlc3VsdC5kdXJhdGlvbiA9IGRlZmF1bHRUcmFuc2l0aW9uLmR1cmF0aW9uO1xuICAgIGlmIChkZWZhdWx0VHJhbnNpdGlvbi5zcGVlZClcbiAgICAgICAgcmVzdWx0LnNwZWVkID0gZGVmYXVsdFRyYW5zaXRpb24uc3BlZWQ7XG4gICAgaWYgKHRyYW5zaXRpb24gaW5zdGFuY2VvZiBPYmplY3QpIHtcbiAgICAgICAgaWYgKHRyYW5zaXRpb24uZHVyYXRpb24gIT09IHVuZGVmaW5lZClcbiAgICAgICAgICAgIHJlc3VsdC5kdXJhdGlvbiA9IHRyYW5zaXRpb24uZHVyYXRpb247XG4gICAgICAgIGlmICh0cmFuc2l0aW9uLmN1cnZlKVxuICAgICAgICAgICAgcmVzdWx0LmN1cnZlID0gdHJhbnNpdGlvbi5jdXJ2ZTtcbiAgICAgICAgaWYgKHRyYW5zaXRpb24uc3BlZWQpXG4gICAgICAgICAgICByZXN1bHQuc3BlZWQgPSB0cmFuc2l0aW9uLnNwZWVkO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIHJlc3VsdC5jdXJ2ZSA9PT0gJ3N0cmluZycpXG4gICAgICAgIHJlc3VsdC5jdXJ2ZSA9IFR3ZWVuVHJhbnNpdGlvbi5nZXRDdXJ2ZShyZXN1bHQuY3VydmUpO1xuICAgIHJldHVybiByZXN1bHQ7XG59XG5Ud2VlblRyYW5zaXRpb24ucHJvdG90eXBlLnNldE9wdGlvbnMgPSBmdW5jdGlvbiBzZXRPcHRpb25zKG9wdGlvbnMpIHtcbiAgICBpZiAob3B0aW9ucy5jdXJ2ZSAhPT0gdW5kZWZpbmVkKVxuICAgICAgICB0aGlzLm9wdGlvbnMuY3VydmUgPSBvcHRpb25zLmN1cnZlO1xuICAgIGlmIChvcHRpb25zLmR1cmF0aW9uICE9PSB1bmRlZmluZWQpXG4gICAgICAgIHRoaXMub3B0aW9ucy5kdXJhdGlvbiA9IG9wdGlvbnMuZHVyYXRpb247XG4gICAgaWYgKG9wdGlvbnMuc3BlZWQgIT09IHVuZGVmaW5lZClcbiAgICAgICAgdGhpcy5vcHRpb25zLnNwZWVkID0gb3B0aW9ucy5zcGVlZDtcbn07XG5Ud2VlblRyYW5zaXRpb24ucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uIHNldChlbmRWYWx1ZSwgdHJhbnNpdGlvbiwgY2FsbGJhY2spIHtcbiAgICBpZiAoIXRyYW5zaXRpb24pIHtcbiAgICAgICAgdGhpcy5yZXNldChlbmRWYWx1ZSk7XG4gICAgICAgIGlmIChjYWxsYmFjaylcbiAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5fc3RhcnRWYWx1ZSA9IF9jbG9uZSh0aGlzLmdldCgpKTtcbiAgICB0cmFuc2l0aW9uID0gX25vcm1hbGl6ZSh0cmFuc2l0aW9uLCB0aGlzLm9wdGlvbnMpO1xuICAgIGlmICh0cmFuc2l0aW9uLnNwZWVkKSB7XG4gICAgICAgIHZhciBzdGFydFZhbHVlID0gdGhpcy5fc3RhcnRWYWx1ZTtcbiAgICAgICAgaWYgKHN0YXJ0VmFsdWUgaW5zdGFuY2VvZiBPYmplY3QpIHtcbiAgICAgICAgICAgIHZhciB2YXJpYW5jZSA9IDA7XG4gICAgICAgICAgICBmb3IgKHZhciBpIGluIHN0YXJ0VmFsdWUpXG4gICAgICAgICAgICAgICAgdmFyaWFuY2UgKz0gKGVuZFZhbHVlW2ldIC0gc3RhcnRWYWx1ZVtpXSkgKiAoZW5kVmFsdWVbaV0gLSBzdGFydFZhbHVlW2ldKTtcbiAgICAgICAgICAgIHRyYW5zaXRpb24uZHVyYXRpb24gPSBNYXRoLnNxcnQodmFyaWFuY2UpIC8gdHJhbnNpdGlvbi5zcGVlZDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRyYW5zaXRpb24uZHVyYXRpb24gPSBNYXRoLmFicyhlbmRWYWx1ZSAtIHN0YXJ0VmFsdWUpIC8gdHJhbnNpdGlvbi5zcGVlZDtcbiAgICAgICAgfVxuICAgIH1cbiAgICB0aGlzLl9zdGFydFRpbWUgPSBEYXRlLm5vdygpO1xuICAgIHRoaXMuX2VuZFZhbHVlID0gX2Nsb25lKGVuZFZhbHVlKTtcbiAgICB0aGlzLl9zdGFydFZlbG9jaXR5ID0gX2Nsb25lKHRyYW5zaXRpb24udmVsb2NpdHkpO1xuICAgIHRoaXMuX2R1cmF0aW9uID0gdHJhbnNpdGlvbi5kdXJhdGlvbjtcbiAgICB0aGlzLl9jdXJ2ZSA9IHRyYW5zaXRpb24uY3VydmU7XG4gICAgdGhpcy5fYWN0aXZlID0gdHJ1ZTtcbiAgICB0aGlzLl9jYWxsYmFjayA9IGNhbGxiYWNrO1xufTtcblR3ZWVuVHJhbnNpdGlvbi5wcm90b3R5cGUucmVzZXQgPSBmdW5jdGlvbiByZXNldChzdGFydFZhbHVlLCBzdGFydFZlbG9jaXR5KSB7XG4gICAgaWYgKHRoaXMuX2NhbGxiYWNrKSB7XG4gICAgICAgIHZhciBjYWxsYmFjayA9IHRoaXMuX2NhbGxiYWNrO1xuICAgICAgICB0aGlzLl9jYWxsYmFjayA9IHVuZGVmaW5lZDtcbiAgICAgICAgY2FsbGJhY2soKTtcbiAgICB9XG4gICAgdGhpcy5zdGF0ZSA9IF9jbG9uZShzdGFydFZhbHVlKTtcbiAgICB0aGlzLnZlbG9jaXR5ID0gX2Nsb25lKHN0YXJ0VmVsb2NpdHkpO1xuICAgIHRoaXMuX3N0YXJ0VGltZSA9IDA7XG4gICAgdGhpcy5fZHVyYXRpb24gPSAwO1xuICAgIHRoaXMuX3VwZGF0ZVRpbWUgPSAwO1xuICAgIHRoaXMuX3N0YXJ0VmFsdWUgPSB0aGlzLnN0YXRlO1xuICAgIHRoaXMuX3N0YXJ0VmVsb2NpdHkgPSB0aGlzLnZlbG9jaXR5O1xuICAgIHRoaXMuX2VuZFZhbHVlID0gdGhpcy5zdGF0ZTtcbiAgICB0aGlzLl9hY3RpdmUgPSBmYWxzZTtcbn07XG5Ud2VlblRyYW5zaXRpb24ucHJvdG90eXBlLmdldFZlbG9jaXR5ID0gZnVuY3Rpb24gZ2V0VmVsb2NpdHkoKSB7XG4gICAgcmV0dXJuIHRoaXMudmVsb2NpdHk7XG59O1xuVHdlZW5UcmFuc2l0aW9uLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbiBnZXQodGltZXN0YW1wKSB7XG4gICAgdGhpcy51cGRhdGUodGltZXN0YW1wKTtcbiAgICByZXR1cm4gdGhpcy5zdGF0ZTtcbn07XG5mdW5jdGlvbiBfY2FsY3VsYXRlVmVsb2NpdHkoY3VycmVudCwgc3RhcnQsIGN1cnZlLCBkdXJhdGlvbiwgdCkge1xuICAgIHZhciB2ZWxvY2l0eTtcbiAgICB2YXIgZXBzID0gMWUtNztcbiAgICB2YXIgc3BlZWQgPSAoY3VydmUodCkgLSBjdXJ2ZSh0IC0gZXBzKSkgLyBlcHM7XG4gICAgaWYgKGN1cnJlbnQgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgICB2ZWxvY2l0eSA9IFtdO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGN1cnJlbnQubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgY3VycmVudFtpXSA9PT0gJ251bWJlcicpXG4gICAgICAgICAgICAgICAgdmVsb2NpdHlbaV0gPSBzcGVlZCAqIChjdXJyZW50W2ldIC0gc3RhcnRbaV0pIC8gZHVyYXRpb247XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgdmVsb2NpdHlbaV0gPSAwO1xuICAgICAgICB9XG4gICAgfSBlbHNlXG4gICAgICAgIHZlbG9jaXR5ID0gc3BlZWQgKiAoY3VycmVudCAtIHN0YXJ0KSAvIGR1cmF0aW9uO1xuICAgIHJldHVybiB2ZWxvY2l0eTtcbn1cbmZ1bmN0aW9uIF9jYWxjdWxhdGVTdGF0ZShzdGFydCwgZW5kLCB0KSB7XG4gICAgdmFyIHN0YXRlO1xuICAgIGlmIChzdGFydCBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICAgIHN0YXRlID0gW107XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc3RhcnQubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2Ygc3RhcnRbaV0gPT09ICdudW1iZXInKVxuICAgICAgICAgICAgICAgIHN0YXRlW2ldID0gX2ludGVycG9sYXRlKHN0YXJ0W2ldLCBlbmRbaV0sIHQpO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHN0YXRlW2ldID0gc3RhcnRbaV07XG4gICAgICAgIH1cbiAgICB9IGVsc2VcbiAgICAgICAgc3RhdGUgPSBfaW50ZXJwb2xhdGUoc3RhcnQsIGVuZCwgdCk7XG4gICAgcmV0dXJuIHN0YXRlO1xufVxuVHdlZW5UcmFuc2l0aW9uLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbiB1cGRhdGUodGltZXN0YW1wKSB7XG4gICAgaWYgKCF0aGlzLl9hY3RpdmUpIHtcbiAgICAgICAgaWYgKHRoaXMuX2NhbGxiYWNrKSB7XG4gICAgICAgICAgICB2YXIgY2FsbGJhY2sgPSB0aGlzLl9jYWxsYmFjaztcbiAgICAgICAgICAgIHRoaXMuX2NhbGxiYWNrID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICghdGltZXN0YW1wKVxuICAgICAgICB0aW1lc3RhbXAgPSBEYXRlLm5vdygpO1xuICAgIGlmICh0aGlzLl91cGRhdGVUaW1lID49IHRpbWVzdGFtcClcbiAgICAgICAgcmV0dXJuO1xuICAgIHRoaXMuX3VwZGF0ZVRpbWUgPSB0aW1lc3RhbXA7XG4gICAgdmFyIHRpbWVTaW5jZVN0YXJ0ID0gdGltZXN0YW1wIC0gdGhpcy5fc3RhcnRUaW1lO1xuICAgIGlmICh0aW1lU2luY2VTdGFydCA+PSB0aGlzLl9kdXJhdGlvbikge1xuICAgICAgICB0aGlzLnN0YXRlID0gdGhpcy5fZW5kVmFsdWU7XG4gICAgICAgIHRoaXMudmVsb2NpdHkgPSBfY2FsY3VsYXRlVmVsb2NpdHkodGhpcy5zdGF0ZSwgdGhpcy5fc3RhcnRWYWx1ZSwgdGhpcy5fY3VydmUsIHRoaXMuX2R1cmF0aW9uLCAxKTtcbiAgICAgICAgdGhpcy5fYWN0aXZlID0gZmFsc2U7XG4gICAgfSBlbHNlIGlmICh0aW1lU2luY2VTdGFydCA8IDApIHtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHRoaXMuX3N0YXJ0VmFsdWU7XG4gICAgICAgIHRoaXMudmVsb2NpdHkgPSB0aGlzLl9zdGFydFZlbG9jaXR5O1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciB0ID0gdGltZVNpbmNlU3RhcnQgLyB0aGlzLl9kdXJhdGlvbjtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IF9jYWxjdWxhdGVTdGF0ZSh0aGlzLl9zdGFydFZhbHVlLCB0aGlzLl9lbmRWYWx1ZSwgdGhpcy5fY3VydmUodCkpO1xuICAgICAgICB0aGlzLnZlbG9jaXR5ID0gX2NhbGN1bGF0ZVZlbG9jaXR5KHRoaXMuc3RhdGUsIHRoaXMuX3N0YXJ0VmFsdWUsIHRoaXMuX2N1cnZlLCB0aGlzLl9kdXJhdGlvbiwgdCk7XG4gICAgfVxufTtcblR3ZWVuVHJhbnNpdGlvbi5wcm90b3R5cGUuaXNBY3RpdmUgPSBmdW5jdGlvbiBpc0FjdGl2ZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fYWN0aXZlO1xufTtcblR3ZWVuVHJhbnNpdGlvbi5wcm90b3R5cGUuaGFsdCA9IGZ1bmN0aW9uIGhhbHQoKSB7XG4gICAgdGhpcy5yZXNldCh0aGlzLmdldCgpKTtcbn07XG5Ud2VlblRyYW5zaXRpb24ucmVnaXN0ZXJDdXJ2ZSgnbGluZWFyJywgVHdlZW5UcmFuc2l0aW9uLkN1cnZlcy5saW5lYXIpO1xuVHdlZW5UcmFuc2l0aW9uLnJlZ2lzdGVyQ3VydmUoJ2Vhc2VJbicsIFR3ZWVuVHJhbnNpdGlvbi5DdXJ2ZXMuZWFzZUluKTtcblR3ZWVuVHJhbnNpdGlvbi5yZWdpc3RlckN1cnZlKCdlYXNlT3V0JywgVHdlZW5UcmFuc2l0aW9uLkN1cnZlcy5lYXNlT3V0KTtcblR3ZWVuVHJhbnNpdGlvbi5yZWdpc3RlckN1cnZlKCdlYXNlSW5PdXQnLCBUd2VlblRyYW5zaXRpb24uQ3VydmVzLmVhc2VJbk91dCk7XG5Ud2VlblRyYW5zaXRpb24ucmVnaXN0ZXJDdXJ2ZSgnZWFzZU91dEJvdW5jZScsIFR3ZWVuVHJhbnNpdGlvbi5DdXJ2ZXMuZWFzZU91dEJvdW5jZSk7XG5Ud2VlblRyYW5zaXRpb24ucmVnaXN0ZXJDdXJ2ZSgnc3ByaW5nJywgVHdlZW5UcmFuc2l0aW9uLkN1cnZlcy5zcHJpbmcpO1xuVHdlZW5UcmFuc2l0aW9uLmN1c3RvbUN1cnZlID0gZnVuY3Rpb24gY3VzdG9tQ3VydmUodjEsIHYyKSB7XG4gICAgdjEgPSB2MSB8fCAwO1xuICAgIHYyID0gdjIgfHwgMDtcbiAgICByZXR1cm4gZnVuY3Rpb24gKHQpIHtcbiAgICAgICAgcmV0dXJuIHYxICogdCArICgtMiAqIHYxIC0gdjIgKyAzKSAqIHQgKiB0ICsgKHYxICsgdjIgLSAyKSAqIHQgKiB0ICogdDtcbiAgICB9O1xufTtcbm1vZHVsZS5leHBvcnRzID0gVHdlZW5UcmFuc2l0aW9uOyIsInZhciBVdGlsaXR5ID0ge307XG5VdGlsaXR5LkRpcmVjdGlvbiA9IHtcbiAgICBYOiAwLFxuICAgIFk6IDEsXG4gICAgWjogMlxufTtcblV0aWxpdHkuYWZ0ZXIgPSBmdW5jdGlvbiBhZnRlcihjb3VudCwgY2FsbGJhY2spIHtcbiAgICB2YXIgY291bnRlciA9IGNvdW50O1xuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGNvdW50ZXItLTtcbiAgICAgICAgaWYgKGNvdW50ZXIgPT09IDApXG4gICAgICAgICAgICBjYWxsYmFjay5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH07XG59O1xuVXRpbGl0eS5sb2FkVVJMID0gZnVuY3Rpb24gbG9hZFVSTCh1cmwsIGNhbGxiYWNrKSB7XG4gICAgdmFyIHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgIHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiBvbnJlYWR5c3RhdGVjaGFuZ2UoKSB7XG4gICAgICAgIGlmICh0aGlzLnJlYWR5U3RhdGUgPT09IDQpIHtcbiAgICAgICAgICAgIGlmIChjYWxsYmFjaylcbiAgICAgICAgICAgICAgICBjYWxsYmFjayh0aGlzLnJlc3BvbnNlVGV4dCk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIHhoci5vcGVuKCdHRVQnLCB1cmwpO1xuICAgIHhoci5zZW5kKCk7XG59O1xuVXRpbGl0eS5jcmVhdGVEb2N1bWVudEZyYWdtZW50RnJvbUhUTUwgPSBmdW5jdGlvbiBjcmVhdGVEb2N1bWVudEZyYWdtZW50RnJvbUhUTUwoaHRtbCkge1xuICAgIHZhciBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgZWxlbWVudC5pbm5lckhUTUwgPSBodG1sO1xuICAgIHZhciByZXN1bHQgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XG4gICAgd2hpbGUgKGVsZW1lbnQuaGFzQ2hpbGROb2RlcygpKVxuICAgICAgICByZXN1bHQuYXBwZW5kQ2hpbGQoZWxlbWVudC5maXJzdENoaWxkKTtcbiAgICByZXR1cm4gcmVzdWx0O1xufTtcblV0aWxpdHkuY2xvbmUgPSBmdW5jdGlvbiBjbG9uZShiKSB7XG4gICAgdmFyIGE7XG4gICAgaWYgKHR5cGVvZiBiID09PSAnb2JqZWN0Jykge1xuICAgICAgICBhID0gYiBpbnN0YW5jZW9mIEFycmF5ID8gW10gOiB7fTtcbiAgICAgICAgZm9yICh2YXIga2V5IGluIGIpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgYltrZXldID09PSAnb2JqZWN0JyAmJiBiW2tleV0gIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBpZiAoYltrZXldIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgICAgICAgICAgICAgICAgYVtrZXldID0gbmV3IEFycmF5KGJba2V5XS5sZW5ndGgpO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGJba2V5XS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgYVtrZXldW2ldID0gVXRpbGl0eS5jbG9uZShiW2tleV1baV0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgYVtrZXldID0gVXRpbGl0eS5jbG9uZShiW2tleV0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgYVtrZXldID0gYltrZXldO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgYSA9IGI7XG4gICAgfVxuICAgIHJldHVybiBhO1xufTtcbm1vZHVsZS5leHBvcnRzID0gVXRpbGl0eTsiLCJ2YXIgTW9kaWZpZXIgICAgICAgPSByZXF1aXJlKCdmYW1vdXMvc3JjL2NvcmUvTW9kaWZpZXInKTtcbnZhciBGYW1vdXNFbmdpbmUgPSByZXF1aXJlKCdmYW1vdXMvc3JjL2NvcmUvRW5naW5lJyk7IFxudmFyIFV0aWxzID0gcmVxdWlyZSgnLi9VdGlscycpOyBcbnZhciBGTSA9IHJlcXVpcmUoJy4vT2xkTWF0cml4Jyk7ICAgIFxudmFyIFZlY3RvciA9IHJlcXVpcmUoJ2ZhbW91cy9zcmMvbWF0aC9WZWN0b3InKTtcbnZhciBRdWF0ID0gcmVxdWlyZSgnLi9PbGRRdWF0ZXJuaW9uJyk7XG5cbmZ1bmN0aW9uIEVhc3lDYW1lcmEoKVxue1xuICAgIHRoaXMucmVuZGVyTWF0cml4ID0gRk0uaWRlbnRpdHk7IFxuXG4gICAgdGhpcy5kb3VibGVDbGlja1RvUmVzZXQgPSB0cnVlOyBcbiAgICB0aGlzLnRvdWNoVGltZSA9IChuZXcgRGF0ZSgpKS5nZXRUaW1lKCk7XG4gICAgdGhpcy5jbGlja1RpbWUgPSAobmV3IERhdGUoKSkuZ2V0VGltZSgpO1xuICAgIHRoaXMuZGVsdGFUaW1lID0gMjAwOyAgICAgICAgIFxuXG4gICAgdGhpcy52aWV3V2lkdGggPSBVdGlscy5nZXRXaWR0aCgpOyBcbiAgICB0aGlzLnZpZXdIZWlnaHQgPSBVdGlscy5nZXRIZWlnaHQoKTsgXG4gICAgdGhpcy5yYWRpdXMgPSBNYXRoLm1heCh0aGlzLnZpZXdXaWR0aCwgdGhpcy52aWV3SGVpZ2h0KSowLjU7IFxuXG4gICAgdGhpcy5jZW50ZXIgPSBuZXcgVmVjdG9yKHRoaXMudmlld1dpZHRoKi41LCB0aGlzLnZpZXdIZWlnaHQqLjUsIDAuMCk7IFxuXG4gICAgdGhpcy5heGlzID0gbmV3IFZlY3RvcigwLjAsIDEuMCwgMC4wKTsgXG4gICAgdGhpcy50aGV0YSA9IDAuMDsgICAgICAgXG4gICAgXG4gICAgdGhpcy5mbGlwWCA9IDEuMDsgXG4gICAgdGhpcy5mbGlwWSA9IDEuMDsgXG4gICAgdGhpcy5mbGlwWiA9IDEuMDsgXG5cbiAgICB0aGlzLnQxID0gbmV3IFZlY3RvcigpOyBcbiAgICB0aGlzLnQyID0gbmV3IFZlY3RvcigpOyBcblxuICAgIHRoaXMucHQxID0gbmV3IFZlY3RvcigpOyBcbiAgICB0aGlzLnB0MiA9IG5ldyBWZWN0b3IoKTtcblxuICAgIHRoaXMuZGFtcGluZyA9IC45NTsgXG5cbiAgICB0aGlzLnpBY2MgPSAwLjA7IFxuICAgIHRoaXMuelZlbCA9IDAuMDsgXG4gICAgXG4gICAgdGhpcy5kdCA9IDAuMDtcbiAgICB0aGlzLnBkdCA9IDAuMDsgLy9QcmV2aW91cyBkaXN0YW5jZSBCZXR3ZWVuIFR3byBUb3VjaGVzIFxuXG4gICAgdGhpcy5kaXN0YW5jZSA9IC0xMDAuMDsgXG4gICAgdGhpcy5wb3NpdGlvbiA9IG5ldyBWZWN0b3IoMCwgMCwgdGhpcy5kaXN0YW5jZSk7IFxuICAgIHRoaXMucm90YXRpb24gPSBuZXcgVmVjdG9yKDAsIDAsIDApOyBcbiAgICB0aGlzLmVfbXR4ID0gRk0uaWRlbnRpdHk7ICBcbiAgICB0aGlzLnFfcm90ID0gbmV3IFF1YXQoKTtcbiAgICB0aGlzLnFfbXR4ID0gRk0uaWRlbnRpdHk7ICBcbiAgICB0aGlzLnF1YXQgPSBuZXcgUXVhdCgpOyBcbiAgICB0aGlzLmRfbXR4ID0gRk0uaWRlbnRpdHk7IFxuXG4gICAgdGhpcy5zZW5zaXRpdml0eVJvdGF0aW9uID0gMC41OyBcbiAgICB0aGlzLnNlbnNpdGl2aXR5Wm9vbSA9IDMuMDsgXG5cbiAgICB0aGlzLnRvdWNoRG93biA9IGZhbHNlOyBcbiAgICB0aGlzLm1vdXNlRG93biA9IGZhbHNlOyBcblxuICAgIEZhbW91c0VuZ2luZS5vbigncHJlcmVuZGVyJywgdGhpcy5fdXBkYXRlLmJpbmQodGhpcykpOyAgICAgICAgIFxuICAgIEZhbW91c0VuZ2luZS5vbigndG91Y2hzdGFydCcsIHRoaXMudG91Y2hzdGFydC5iaW5kKHRoaXMpKTsgICAgICAgICAgICAgICAgIFxuICAgIEZhbW91c0VuZ2luZS5vbigndG91Y2htb3ZlJywgdGhpcy50b3VjaG1vdmUuYmluZCh0aGlzKSk7ICAgICAgICAgICAgICAgICBcbiAgICBGYW1vdXNFbmdpbmUub24oJ3RvdWNoZW5kJywgdGhpcy50b3VjaGVuZC5iaW5kKHRoaXMpKTsgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgRmFtb3VzRW5naW5lLm9uKCdyZXNpemUnLCB0aGlzLnJlc2l6ZS5iaW5kKHRoaXMpKTsgICAgICAgICAgICAgICAgIFxuICAgIFxuICAgIEZhbW91c0VuZ2luZS5vbignbW91c2Vkb3duJywgdGhpcy5tb3VzZWRvd24uYmluZCh0aGlzKSk7ICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgIEZhbW91c0VuZ2luZS5vbignbW91c2Vtb3ZlJywgdGhpcy5tb3VzZW1vdmUuYmluZCh0aGlzKSk7ICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgIEZhbW91c0VuZ2luZS5vbignbW91c2V1cCcsIHRoaXMubW91c2V1cC5iaW5kKHRoaXMpKTsgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXdoZWVsJywgdGhpcy5tb3VzZXdoZWVsLmJpbmQodGhpcykpOyAgICAgXG4gICAgdGhpcy51cGRhdGVNYXRyaXgoKTsgXG5cbiAgICB0aGlzLm1vZCA9IG5ldyBNb2RpZmllcih7XG4gICAgICAgIG9yaWdpbjogWzAuNSwgMC41XSxcbiAgICAgICAgYWxpZ246IFswLjUsIDAuNV0sXG4gICAgICAgIHRyYW5zZm9ybSA6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucmVuZGVyTWF0cml4O1xuICAgICAgICB9LmJpbmQodGhpcylcbiAgICB9KTtcbn1cblxuRWFzeUNhbWVyYS5wcm90b3R5cGUuX3VwZGF0ZSA9IGZ1bmN0aW9uKGV2ZW50KVxue1xuICAgIHRoaXMudXBkYXRlKCk7IFxuICAgIGlmKCF0aGlzLm1vdXNlRG93biAmJiAhdGhpcy50b3VjaERvd24gJiYgdGhpcy50aGV0YSA+IDAuMDAwMSlcbiAgICB7ICAgICAgICAgICAgICAgIFxuICAgICAgICB0aGlzLnF1YXQubWFrZUZyb21BbmdsZUFuZEF4aXModGhpcy50aGV0YSAqIHRoaXMuc2Vuc2l0aXZpdHlSb3RhdGlvbiwgdGhpcy5heGlzKTsgICAgICAgICAgICAgXG4gICAgICAgIHRoaXMucV9yb3QgPSB0aGlzLnFfcm90Lm11bHRpcGx5KHRoaXMucXVhdCk7ICAgICAgIFxuICAgICAgICB0aGlzLnFfbXR4ID0gdGhpcy5xX3JvdC5nZXRNYXRyaXgoKTsgXG4gICAgICAgIHRoaXMudXBkYXRlTWF0cml4KCk7XG4gICAgICAgIHRoaXMudGhldGEqPXRoaXMuZGFtcGluZzsgXG4gICAgfSAgICAgICAgICAgIFxufTsgXG5cbkVhc3lDYW1lcmEucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKGV2ZW50KVxue1xuICAgIFxufTsgXG5cbkVhc3lDYW1lcmEucHJvdG90eXBlLnNldEZsaXBYID0gZnVuY3Rpb24odilcbntcbiAgICBpZih2KVxuICAgIHtcbiAgICAgICAgdGhpcy5mbGlwWCA9IC0xLjA7IFxuICAgIH1cbiAgICBlbHNlXG4gICAge1xuICAgICAgICB0aGlzLmZsaXBYID0gMS4wOyBcbiAgICB9XG59O1xuXG5FYXN5Q2FtZXJhLnByb3RvdHlwZS5zZXRGbGlwWSA9IGZ1bmN0aW9uKHYpXG57XG4gICAgaWYodilcbiAgICB7XG4gICAgICAgIHRoaXMuZmxpcFkgPSAtMS4wOyBcbiAgICB9XG4gICAgZWxzZVxuICAgIHtcbiAgICAgICAgdGhpcy5mbGlwWSA9IDEuMDsgXG4gICAgfVxufTtcblxuRWFzeUNhbWVyYS5wcm90b3R5cGUuc2V0RmxpcFogPSBmdW5jdGlvbih2KVxue1xuICAgIGlmKHYpXG4gICAge1xuICAgICAgICB0aGlzLmZsaXBaID0gLTEuMDsgXG4gICAgfVxuICAgIGVsc2VcbiAgICB7XG4gICAgICAgIHRoaXMuZmxpcFogPSAxLjA7IFxuICAgIH1cbn07XG5cbkVhc3lDYW1lcmEucHJvdG90eXBlLnNldFNlbnNpdGl2aXR5Wm9vbSA9IGZ1bmN0aW9uKHopXG57XG4gICAgdGhpcy5zZW5zaXRpdml0eVpvb20gPSB6OyBcbn07XG5cbkVhc3lDYW1lcmEucHJvdG90eXBlLnNldFNlbnNpdGl2aXR5Um90YXRpb24gPSBmdW5jdGlvbihyKVxue1xuICAgIHRoaXMuc2Vuc2l0aXZpdHlSb3RhdGlvbiA9IHI7IFxufTtcblxuRWFzeUNhbWVyYS5wcm90b3R5cGUuc2V0RGlzdGFuY2UgPSBmdW5jdGlvbihkKVxue1xuICAgIHRoaXMuZGlzdGFuY2UgPSBkOyBcbiAgICB0aGlzLnBvc2l0aW9uLnogPSB0aGlzLmRpc3RhbmNlOyAgICAgICAgIFxuICAgIHRoaXMuc2V0UG9zaXRpb24odGhpcy5wb3NpdGlvbik7ICAgIFxufTtcblxuRWFzeUNhbWVyYS5wcm90b3R5cGUuc2V0UG9zaXRpb24gPSBmdW5jdGlvbihwKVxue1xuICAgIHRoaXMucG9zaXRpb24uc2V0KHApOyBcbiAgICB0aGlzLnVwZGF0ZU1hdHJpeCgpOyAgICAgICAgIFxufTtcblxuRWFzeUNhbWVyYS5wcm90b3R5cGUuYXBwbHlRdWF0ZXJuaW9uUm90YXRpb24gPSBmdW5jdGlvbihxKVxue1xuICAgIHRoaXMucV9yb3QgPSB0aGlzLnFfcm90Lm11bHRpcGx5KHEpOyAgICAgICBcbiAgICB0aGlzLnFfbXR4ID0gdGhpcy5xX3JvdC5nZXRNYXRyaXgoKTsgXG4gICAgdGhpcy51cGRhdGVNYXRyaXgoKTsgICAgICAgIFxufTtcblxuRWFzeUNhbWVyYS5wcm90b3R5cGUuYXBwbHlFdWxlclJvdGF0aW9uID0gZnVuY3Rpb24ocGhpLCB0aGV0YSwgcHNpKVxue1xuICAgIHRoaXMucm90YXRpb24uc2V0WFlaKHBoaSwgdGhldGEsIHBzaSk7IFxuICAgIHRoaXMuZV9tdHggPSBGTS5yb3RhdGUocGhpLCB0aGV0YSwgcHNpKTtcbiAgICB0aGlzLnVwZGF0ZU1hdHJpeCgpOyBcbn07XG5cbkVhc3lDYW1lcmEucHJvdG90eXBlLnVwZGF0ZU1hdHJpeCA9IGZ1bmN0aW9uKClcbntcblxuICAgIHZhciBhcnIgPSBbdGhpcy5wb3NpdGlvbi54LCB0aGlzLnBvc2l0aW9uLnksIHRoaXMucG9zaXRpb24uel07XG4gICAgdmFyIGExID0gRk0ubXVsdGlwbHkodGhpcy5xX210eCwgdGhpcy5lX210eClcbiAgICB0aGlzLnJlbmRlck1hdHJpeCA9IEZNLm1vdmUoYTEsIGFycik7XG59O1xuXG5FYXN5Q2FtZXJhLnByb3RvdHlwZS5nZXRSb3RhdGlvbk1hdHJpeCA9IGZ1bmN0aW9uKClcbntcbiAgICByZXR1cm4gdGhpcy5xX210eDsgXG59OyBcblxuRWFzeUNhbWVyYS5wcm90b3R5cGUuZ2V0TWF0cml4ID0gZnVuY3Rpb24oKVxue1xuICAgIHJldHVybiB0aGlzLnJlbmRlck1hdHJpeDsgXG59OyBcblxuRWFzeUNhbWVyYS5wcm90b3R5cGUucmVzZXQgPSBmdW5jdGlvbigpXG57ICAgICAgICBcbiAgICB0aGlzLnRoZXRhID0gMC4wOyBcbiAgICB0aGlzLnFfcm90LmNsZWFyKCk7ICAgICAgICAgICAgXG4gICAgdGhpcy5xX210eCA9IHRoaXMuZF9tdHg7IFxuICAgIHRoaXMucG9zaXRpb24uY2xlYXIoKTtcbiAgICB0aGlzLnBvc2l0aW9uLnNldFhZWigwLjAsIDAuMCwgdGhpcy5kaXN0YW5jZSk7ICAgICAgICAgIFxuICAgIHRoaXMudXBkYXRlTWF0cml4KCk7XG59O1xuXG5FYXN5Q2FtZXJhLnByb3RvdHlwZS5zZXREZWZhdWx0TWF0cml4ID0gZnVuY3Rpb24obXR4KVxue1xuICAgIHRoaXMuZF9tdHggPSBtdHg7IFxufTsgXG5cbkVhc3lDYW1lcmEucHJvdG90eXBlLmNsaWNrQ2hlY2tGb3JDYW1lcmFSZXN0YXJ0ID0gZnVuY3Rpb24oKVxueyAgICBcbiAgICB2YXIgbmV3VGltZSA9IChuZXcgRGF0ZSgpKS5nZXRUaW1lKCk7ICAgICAgICAgICAgIFxuICAgIGlmKG5ld1RpbWUgLSB0aGlzLmNsaWNrVGltZSA8IHRoaXMuZGVsdGFUaW1lICYmIHRoaXMuZG91YmxlQ2xpY2tUb1Jlc2V0KVxuICAgIHsgICAgICAgICAgICAgICBcbiAgICAgICAgdGhpcy5yZXNldCgpOyBcbiAgICB9XG5cbiAgICB0aGlzLmNsaWNrVGltZSA9IG5ld1RpbWU7IFxufTtcblxuRWFzeUNhbWVyYS5wcm90b3R5cGUudG91Y2hDaGVja0ZvckNhbWVyYVJlc3RhcnQgPSBmdW5jdGlvbigpXG57XG4gICAgdmFyIG5ld1RpbWUgPSAobmV3IERhdGUoKSkuZ2V0VGltZSgpOyAgICAgICAgICAgICBcbiAgICBpZihuZXdUaW1lIC0gdGhpcy50b3VjaFRpbWUgPCB0aGlzLmRlbHRhVGltZSAmJiB0aGlzLmRvdWJsZUNsaWNrVG9SZXNldClcbiAgICB7ICAgICAgICAgICAgICAgXG4gICAgICAgIHRoaXMucmVzZXQoKTsgXG4gICAgfVxuXG4gICAgdGhpcy50b3VjaFRpbWUgPSBuZXdUaW1lOyBcbn07XG5cbkVhc3lDYW1lcmEucHJvdG90eXBlLnRvdWNoc3RhcnQgPSBmdW5jdGlvbihldmVudCkgXG57XG4gICAgaWYoZXZlbnQudG91Y2hlcy5sZW5ndGggPT0gMSlcbiAgICB7XG4gICAgICAgIHRoaXMudG91Y2hEb3duID0gdHJ1ZTsgXG4gICAgICAgIHRoaXMudG91Y2hDaGVja0ZvckNhbWVyYVJlc3RhcnQoKTsgICAgICAgICBcbiAgICAgICAgdGhpcy50aGV0YSA9IDAuMDsgXG4gICAgICAgIHRoaXMudDEuY2xlYXIoKTsgXG4gICAgICAgIHRoaXMucHQxLmNsZWFyKCk7IFxuICAgICAgICB0aGlzLnF1YXQuY2xlYXIoKTsgXG4gICAgICAgIHRoaXMuc2V0QXJjQmFsbFZlY3RvcihldmVudC50b3VjaGVzWzBdLmNsaWVudFgsIGV2ZW50LnRvdWNoZXNbMF0uY2xpZW50WSk7ICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgIH1cbiAgICBlbHNlIGlmKGV2ZW50LnRvdWNoZXMubGVuZ3RoID09IDIpICAgICAgICAgICAgXG4gICAge1xuICAgICAgICB0aGlzLnQxLnNldFhZWihldmVudC50b3VjaGVzWzBdLmNsaWVudFgsIGV2ZW50LnRvdWNoZXNbMF0uY2xpZW50WSwgMC4wKTtcbiAgICAgICAgdGhpcy50Mi5zZXRYWVooZXZlbnQudG91Y2hlc1sxXS5jbGllbnRYLCBldmVudC50b3VjaGVzWzFdLmNsaWVudFksIDAuMCk7IFxuICAgICAgICBcbiAgICAgICAgdGhpcy5wdDEuc2V0KHRoaXMudDEpOyBcbiAgICAgICAgdGhpcy5wdDIuc2V0KHRoaXMudDIpOyBcbiAgICAgICAgXG4gICAgICAgIHRoaXMuZHQgPSBVdGlscy5kaXN0YW5jZSh0aGlzLnQxLngsIHRoaXMudDEueSwgdGhpcy50Mi54LCB0aGlzLnQyLnkpOyBcbiAgICAgICAgdGhpcy5wZHQgPSB0aGlzLmR0OyBcbiAgICB9ICAgICAgICBcbn07XG5cbkVhc3lDYW1lcmEucHJvdG90eXBlLnRvdWNobW92ZSA9IGZ1bmN0aW9uKGV2ZW50KVxue1xuICAgIGlmKGV2ZW50LnRvdWNoZXMubGVuZ3RoID09IDEpXG4gICAge1xuICAgICAgICB0aGlzLnNldEFyY0JhbGxWZWN0b3IoZXZlbnQudG91Y2hlc1swXS5jbGllbnRYLCBldmVudC50b3VjaGVzWzBdLmNsaWVudFkpOyBcbiAgICAgICAgdGhpcy51cGRhdGVBcmNCYWxsUm90YXRpb24oKTsgXG4gICAgfVxuICAgIGVsc2UgaWYoZXZlbnQudG91Y2hlcy5sZW5ndGggPT0gMikgICAgICAgICAgICBcbiAgICB7XG4gICAgICAgIHRoaXMudDEuc2V0WFlaKGV2ZW50LnRvdWNoZXNbMF0uY2xpZW50WCwgZXZlbnQudG91Y2hlc1swXS5jbGllbnRZLCAwLjApOyBcbiAgICAgICAgdGhpcy50Mi5zZXRYWVooZXZlbnQudG91Y2hlc1sxXS5jbGllbnRYLCBldmVudC50b3VjaGVzWzFdLmNsaWVudFksIDAuMCk7IFxuXG4gICAgICAgIHRoaXMuZHQgPSBVdGlscy5kaXN0YW5jZSh0aGlzLnQxLngsIHRoaXMudDEueSwgdGhpcy50Mi54LCB0aGlzLnQyLnkpOyAgICAgICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIHRoaXMucG9zaXRpb24ueiArPSB0aGlzLmZsaXBaKih0aGlzLmR0LXRoaXMucGR0KS90aGlzLnNlbnNpdGl2aXR5Wm9vbTsgICAgICAgICBcbiAgICAgICAgdGhpcy51cGRhdGVNYXRyaXgoKTtcblxuICAgICAgICB0aGlzLnB0MS5zZXQodGhpcy50MSk7IFxuICAgICAgICB0aGlzLnB0Mi5zZXQodGhpcy50Mik7ICAgICAgICAgIFxuXG4gICAgICAgIHRoaXMucGR0ID0gdGhpcy5kdDsgXG4gICAgfVxufTtcblxuRWFzeUNhbWVyYS5wcm90b3R5cGUudG91Y2hlbmQgPSBmdW5jdGlvbihldmVudClcbntcbiAgICBpZihldmVudC50b3VjaGVzLmxlbmd0aCA9PSAxKVxuICAgIHsgICAgICAgICAgICBcbiAgICAgICAgdGhpcy50MS5jbGVhcigpOyBcbiAgICAgICAgdGhpcy5wdDEuY2xlYXIoKTsgXG4gICAgICAgIHRoaXMucXVhdC5jbGVhcigpOyBcbiAgICB9XG4gICAgZWxzZSBpZihldmVudC50b3VjaGVzLmxlbmd0aCA9PSAyKSAgICAgICAgICAgIFxuICAgIHtcbiAgICAgICAgdGhpcy50MS5jbGVhcigpOyBcbiAgICAgICAgdGhpcy5wdDEuY2xlYXIoKTsgXG4gICAgICAgIFxuICAgICAgICB0aGlzLnQyLmNsZWFyKCk7IFxuICAgICAgICB0aGlzLnB0Mi5jbGVhcigpOyBcbiAgICAgICAgXG4gICAgICAgIHRoaXMuZHQgPSAwLjA7IFxuICAgICAgICB0aGlzLnBkdCA9IDAuMDsgXG4gICAgfVxufTtcblxuRWFzeUNhbWVyYS5wcm90b3R5cGUuc2V0QXJjQmFsbFZlY3RvciA9IGZ1bmN0aW9uKHgsIHkpXG57ICAgICAgICAgICAgICAgIFxuICAgIHRoaXMucHQxLnNldCh0aGlzLnQxKTsgXG4gICAgdGhpcy50MS5jbGVhcigpOyBcbiAgICBcbiAgICB0aGlzLnQxLnggPSB0aGlzLmZsaXBYICogLTEuMCAqICh4IC0gdGhpcy5jZW50ZXIueCkgLyB0aGlzLnJhZGl1czsgXG4gICAgdGhpcy50MS55ID0gdGhpcy5mbGlwWSAqIC0xLjAgKiAoeSAtIHRoaXMuY2VudGVyLnkpIC8gdGhpcy5yYWRpdXM7ICAgICAgICAgICAgICAgICBcblxuICAgIHZhciByID0gdGhpcy50MS5ub3JtKCk7IFxuICAgIGlmKHIgPiAxLjApXG4gICAge1xuICAgICAgICB0aGlzLnQxLm5vcm1hbGl6ZSgxLjAsIHRoaXMudDEpOyAgICAgICAgICBcbiAgICB9XG4gICAgZWxzZVxuICAgIHtcbiAgICAgICAgdGhpcy50MS56ID0gTWF0aC5zcXJ0KDEuMCAtIHIpOyBcbiAgICB9ICAgICAgICAgICAgICAgIFxufTtcblxuRWFzeUNhbWVyYS5wcm90b3R5cGUudXBkYXRlQXJjQmFsbFJvdGF0aW9uID0gZnVuY3Rpb24oKVxueyAgICAgICAgXG4gICAgdGhpcy50aGV0YSA9IE1hdGguYWNvcyh0aGlzLnQxLmRvdCh0aGlzLnB0MSkpOyBcbiAgICB0aGlzLmF4aXMgPSB0aGlzLnB0MS5jcm9zcyh0aGlzLnQxLCB0aGlzLmF4aXMpOyAgIFxuICAgIHRoaXMucXVhdC5tYWtlRnJvbUFuZ2xlQW5kQXhpcyh0aGlzLnRoZXRhICogdGhpcy5zZW5zaXRpdml0eVJvdGF0aW9uLCB0aGlzLmF4aXMpOyAgICAgICAgICAgICBcbiAgICB0aGlzLnFfcm90ID0gdGhpcy5xX3JvdC5tdWx0aXBseSh0aGlzLnF1YXQpOyAgICAgICBcbiAgICB0aGlzLnFfbXR4ID0gdGhpcy5xX3JvdC5nZXRNYXRyaXgoKTsgXG4gICAgdGhpcy51cGRhdGVNYXRyaXgoKTtcbn1cblxuRWFzeUNhbWVyYS5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uKHR5cGUsIGV2ZW50KVxue1xuICAgIGlmKHR5cGUgPT0gJ3ByZXJlbmRlcicpICAgIHRoaXMudXBkYXRlKGV2ZW50KTsgICAgXG4gICAgZWxzZSBpZih0eXBlID09ICd0b3VjaHN0YXJ0JykgICAgICAgIHRoaXMudG91Y2hzdGFydChldmVudCk7XG4gICAgZWxzZSBpZih0eXBlID09ICd0b3VjaG1vdmUnKSAgICB0aGlzLnRvdWNobW92ZShldmVudCk7XG4gICAgZWxzZSBpZih0eXBlID09ICd0b3VjaGVuZCcpICAgICB0aGlzLnRvdWNoZW5kKGV2ZW50KTtcbiAgICBlbHNlIGlmKHR5cGUgPT0gJ3Jlc2l6ZScpICAgICAgIHRoaXMucmVzaXplKGV2ZW50KTsgICAgICAgICAgICBcbn07XG5cbkVhc3lDYW1lcmEucHJvdG90eXBlLm1vdXNlbW92ZSA9IGZ1bmN0aW9uKGV2ZW50KVxueyAgXG4gICAgaWYodGhpcy5tb3VzZURvd24pIFxuICAgIHtcbiAgICAgICAgdGhpcy5zZXRBcmNCYWxsVmVjdG9yKGV2ZW50LmNsaWVudFgsIGV2ZW50LmNsaWVudFkpOyAgICAgICAgICAgICBcbiAgICAgICAgdGhpcy51cGRhdGVBcmNCYWxsUm90YXRpb24oKTsgICAgICAgICAgICAgXG4gICAgfVxufTtcblxuRWFzeUNhbWVyYS5wcm90b3R5cGUubW91c2Vkb3duID0gZnVuY3Rpb24oZXZlbnQpXG57ICAgICAgICAgICAgXG4gICAgdGhpcy5tb3VzZURvd24gPSB0cnVlOyAgICAgICAgICAgICAgICAgXG4gICAgdGhpcy5jbGlja0NoZWNrRm9yQ2FtZXJhUmVzdGFydCgpOyAgICAgICAgIFxuICAgIHRoaXMudGhldGEgPSAwLjA7IFxuICAgIHRoaXMudDEuY2xlYXIoKTsgXG4gICAgdGhpcy5wdDEuY2xlYXIoKTsgXG4gICAgdGhpcy5xdWF0LmNsZWFyKCk7ICAgICAgICAgICAgXG4gICAgdGhpcy5zZXRBcmNCYWxsVmVjdG9yKGV2ZW50LmNsaWVudFgsIGV2ZW50LmNsaWVudFkpOyAgICAgICAgICAgICAgXG59XG5cbkVhc3lDYW1lcmEucHJvdG90eXBlLm1vdXNldXAgPSBmdW5jdGlvbihldmVudClcbnsgICAgICBcbiAgICB0aGlzLm1vdXNlRG93biA9IGZhbHNlOyBcbn07IFxuXG5FYXN5Q2FtZXJhLnByb3RvdHlwZS5tb3VzZXdoZWVsID0gZnVuY3Rpb24oZXZlbnQpXG57ICAgICAgICAgICAgICAgIFxuXG4gICAgdGhpcy5wb3NpdGlvbi56ICs9IHRoaXMuZmxpcFoqVXRpbHMubGltaXQoZXZlbnQud2hlZWxEZWx0YSwgLTUwMCwgNTAwKSouMDEqdGhpcy5zZW5zaXRpdml0eVpvb207ICAgICAgICAgXG4gICAgdGhpcy51cGRhdGVNYXRyaXgoKTsgXG4gICAgLy8gdGhpcy56QWNjID0gVXRpbHMubGltaXQoZXZlbnQud2hlZWxEZWx0YSwtMTAsMTApOyBcbiAgICAvLyB0aGlzLnpWZWwgKz0gdGhpcy56QWNjOyBcbiAgICAvLyB0aGlzLnpWZWwgPSBVdGlscy5saW1pdCh0aGlzLnpWZWwsIC0yLCAyKTsgICAgICAgICBcbn07XG5cbkVhc3lDYW1lcmEucHJvdG90eXBlLnJlc2l6ZSA9IGZ1bmN0aW9uKGV2ZW50KSBcbnsgICAgICAgIFxuICAgIHRoaXMudmlld1dpZHRoID0gVXRpbHMuZ2V0V2lkdGgoKTsgXG4gICAgdGhpcy52aWV3SGVpZ2h0ID0gVXRpbHMuZ2V0SGVpZ2h0KCk7IFxuICAgIHRoaXMuY2VudGVyID0gbmV3IFZlY3Rvcih0aGlzLnZpZXdXaWR0aCouNSwgdGhpcy52aWV3SGVpZ2h0Ki41LCAwLjApOyBcbiAgICB0aGlzLnJhZGl1cyA9IE1hdGgubWluKHRoaXMudmlld1dpZHRoLCB0aGlzLnZpZXdIZWlnaHQpKjAuNTsgICAgICAgICBcbn07XG5cbkVhc3lDYW1lcmEucHJvdG90eXBlLnNldERhbXBpbmcgPSBmdW5jdGlvbihkKSBcbnsgICAgICAgIFxuICAgIHRoaXMuZGFtcGluZyA9IGQ7XG59O1xuXG5FYXN5Q2FtZXJhLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbihpbnB1dCkgXG57XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdHJhbnNmb3JtOiB0aGlzLnJlbmRlck1hdHJpeCxcbiAgICAgICAgb3JpZ2luOiBbLjUsIC41XSxcbiAgICAgICAgdGFyZ2V0OiBpbnB1dFxuXG4gICAgfTsgXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEVhc3lDYW1lcmE7XG5cbiIsIlxuLyoqXG4gKiBAbmFtZXNwYWNlIEZhbW91c01hdHJpeFxuICogXG4gKiBAZGVzY3JpcHRpb24gXG4gKiAgKiBBIGhpZ2gtcGVyZm9ybWFuY2UgbWF0cml4IG1hdGggbGlicmFyeSB1c2VkIHRvIGNhbGN1bGF0ZSBcbiAqICAgYWZmaW5lIHRyYW5zZm9ybXMgb24gc3VyZmFjZXMgYW5kIG90aGVyIHJlbmRlcmFibGVzLlxuICogICBGYW1vdXMgdXNlcyA0eDQgbWF0cmljZXMgY29ycmVzcG9uZGluZyBkaXJlY3RseSB0b1xuICogICBXZWJLaXQgbWF0cmljZXMgKHJvdy1tYWpvciBvcmRlcilcbiAqICAgIFxuICogICAgVGhlIGludGVybmFsIFwidHlwZVwiIG9mIGEgRmFtb3VzTWF0cml4IGlzIGEgMTYtbG9uZyBmbG9hdCBhcnJheSBpbiBcbiAqICAgIHJvdy1tYWpvciBvcmRlciwgd2l0aDpcbiAqICAgICAgKiBlbGVtZW50cyBbMF0sWzFdLFsyXSxbNF0sWzVdLFs2XSxbOF0sWzldLFsxMF0gZm9ybWluZyB0aGUgM3gzXG4gKiAgICAgICAgICB0cmFuc2Zvcm1hdGlvbiBtYXRyaXhcbiAqICAgICAgKiBlbGVtZW50cyBbMTJdLCBbMTNdLCBbMTRdIGNvcnJlc3BvbmRpbmcgdG8gdGhlIHRfeCwgdF95LCB0X3ogXG4gKiAgICAgICAgICBhZmZpbmUgdHJhbnNsYXRpb24uXG4gKiAgICAgICogZWxlbWVudCBbMTVdIGFsd2F5cyBzZXQgdG8gMS5cbiAqIFxuICogU2NvcGU6IElkZWFsbHksIG5vbmUgb2YgdGhlc2UgZnVuY3Rpb25zIHNob3VsZCBiZSB2aXNpYmxlIGJlbG93IHRoZSBcbiAqIGNvbXBvbmVudCBkZXZlbG9wZXIgbGV2ZWwuXG4gKlxuICogQHN0YXRpY1xuICogXG4gKiBAbmFtZSBGYW1vdXNNYXRyaXhcbiAqL1xudmFyIEZhbW91c01hdHJpeCA9IHt9O1xuXG4vLyBXQVJOSU5HOiB0aGVzZSBtYXRyaWNlcyBjb3JyZXNwb25kIHRvIFdlYktpdCBtYXRyaWNlcywgd2hpY2ggYXJlXG4vLyAgICB0cmFuc3Bvc2VkIGZyb20gdGhlaXIgbWF0aCBjb3VudGVycGFydHNcbkZhbW91c01hdHJpeC5wcmVjaXNpb24gPSAxZS02O1xuRmFtb3VzTWF0cml4LmlkZW50aXR5ID0gWzEsIDAsIDAsIDAsIDAsIDEsIDAsIDAsIDAsIDAsIDEsIDAsIDAsIDAsIDAsIDFdO1xuXG4vKipcbiAqIE11bHRpcGx5IHR3byBvciBtb3JlIEZhbW91c01hdHJpeCB0eXBlcyB0byByZXR1cm4gYSBGYW1vdXNNYXRyaXguXG4gKlxuICogQG5hbWUgRmFtb3VzTWF0cml4I211bHRpcGx5NHg0XG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSB7RmFtb3VzTWF0cml4fSBhIGxlZnQgbWF0cml4XG4gKiBAcGFyYW0ge0ZhbW91c01hdHJpeH0gYiByaWdodCBtYXRyaXhcbiAqIEByZXR1cm5zIHtGYW1vdXNNYXRyaXh9IHRoZSByZXN1bHRpbmcgbWF0cml4XG4gKi9cbkZhbW91c01hdHJpeC5tdWx0aXBseTR4NCA9IGZ1bmN0aW9uIG11bHRpcGx5NHg0KGEsIGIpIHtcbiAgICB2YXIgcmVzdWx0ID0gWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdO1xuICAgIHJlc3VsdFswXSA9IGFbMF0gKiBiWzBdICsgYVsxXSAqIGJbNF0gKyBhWzJdICogYls4XSArIGFbM10gKiBiWzEyXTtcbiAgICByZXN1bHRbMV0gPSBhWzBdICogYlsxXSArIGFbMV0gKiBiWzVdICsgYVsyXSAqIGJbOV0gKyBhWzNdICogYlsxM107XG4gICAgcmVzdWx0WzJdID0gYVswXSAqIGJbMl0gKyBhWzFdICogYls2XSArIGFbMl0gKiBiWzEwXSArIGFbM10gKiBiWzE0XTtcbiAgICByZXN1bHRbM10gPSBhWzBdICogYlszXSArIGFbMV0gKiBiWzddICsgYVsyXSAqIGJbMTFdICsgYVszXSAqIGJbMTVdO1xuICAgIHJlc3VsdFs0XSA9IGFbNF0gKiBiWzBdICsgYVs1XSAqIGJbNF0gKyBhWzZdICogYls4XSArIGFbN10gKiBiWzEyXTtcbiAgICByZXN1bHRbNV0gPSBhWzRdICogYlsxXSArIGFbNV0gKiBiWzVdICsgYVs2XSAqIGJbOV0gKyBhWzddICogYlsxM107XG4gICAgcmVzdWx0WzZdID0gYVs0XSAqIGJbMl0gKyBhWzVdICogYls2XSArIGFbNl0gKiBiWzEwXSArIGFbN10gKiBiWzE0XTtcbiAgICByZXN1bHRbN10gPSBhWzRdICogYlszXSArIGFbNV0gKiBiWzddICsgYVs2XSAqIGJbMTFdICsgYVs3XSAqIGJbMTVdO1xuICAgIHJlc3VsdFs4XSA9IGFbOF0gKiBiWzBdICsgYVs5XSAqIGJbNF0gKyBhWzEwXSAqIGJbOF0gKyBhWzExXSAqIGJbMTJdO1xuICAgIHJlc3VsdFs5XSA9IGFbOF0gKiBiWzFdICsgYVs5XSAqIGJbNV0gKyBhWzEwXSAqIGJbOV0gKyBhWzExXSAqIGJbMTNdO1xuICAgIHJlc3VsdFsxMF0gPSBhWzhdICogYlsyXSArIGFbOV0gKiBiWzZdICsgYVsxMF0gKiBiWzEwXSArIGFbMTFdICogYlsxNF07XG4gICAgcmVzdWx0WzExXSA9IGFbOF0gKiBiWzNdICsgYVs5XSAqIGJbN10gKyBhWzEwXSAqIGJbMTFdICsgYVsxMV0gKiBiWzE1XTtcbiAgICByZXN1bHRbMTJdID0gYVsxMl0gKiBiWzBdICsgYVsxM10gKiBiWzRdICsgYVsxNF0gKiBiWzhdICsgYVsxNV0gKiBiWzEyXTtcbiAgICByZXN1bHRbMTNdID0gYVsxMl0gKiBiWzFdICsgYVsxM10gKiBiWzVdICsgYVsxNF0gKiBiWzldICsgYVsxNV0gKiBiWzEzXTtcbiAgICByZXN1bHRbMTRdID0gYVsxMl0gKiBiWzJdICsgYVsxM10gKiBiWzZdICsgYVsxNF0gKiBiWzEwXSArIGFbMTVdICogYlsxNF07XG4gICAgcmVzdWx0WzE1XSA9IGFbMTJdICogYlszXSArIGFbMTNdICogYls3XSArIGFbMTRdICogYlsxMV0gKyBhWzE1XSAqIGJbMTVdO1xuICAgIGlmKGFyZ3VtZW50cy5sZW5ndGggPD0gMikgIHJldHVybiByZXN1bHQ7XG4gICAgZWxzZSByZXR1cm4gbXVsdGlwbHk0eDQuYXBwbHkobnVsbCwgW3Jlc3VsdF0uY29uY2F0KEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMikpKTtcbn07XG5cbi8qKlxuICogRmFzdC1tdWx0aXBseSB0d28gb3IgbW9yZSBGYW1vdXNNYXRyaXggdHlwZXMgdG8gcmV0dXJuIGFcbiAqICAgIEZhbW91c01hdHJpeCwgYXNzdW1pbmcgcmlnaHQgY29sdW1uIG9uIGVhY2ggaXMgWzAgMCAwIDFdXlQuXG4gKiAgICBcbiAqIEBuYW1lIEZhbW91c01hdHJpeCNtdWx0aXBseVxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0ge0ZhbW91c01hdHJpeH0gYSBsZWZ0IG1hdHJpeFxuICogQHBhcmFtIHtGYW1vdXNNYXRyaXh9IGIgcmlnaHQgbWF0cml4XG4gKiBAcGFyYW0gey4uLkZhbW91c01hdHJpeH0gYyBhZGRpdGlvbmFsIG1hdHJpY2VzIHRvIGJlIG11bHRpcGxpZWQgaW4gXG4gKiAgICBvcmRlclxuICogQHJldHVybnMge0ZhbW91c01hdHJpeH0gdGhlIHJlc3VsdGluZyBtYXRyaXhcbiAqLyBcbkZhbW91c01hdHJpeC5tdWx0aXBseSA9IGZ1bmN0aW9uIG11bHRpcGx5KGEsIGIsIGMpIHtcbiAgICBpZighYSB8fCAhYikgcmV0dXJuIGEgfHwgYjtcbiAgICB2YXIgcmVzdWx0ID0gWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDFdO1xuICAgIHJlc3VsdFswXSA9IGFbMF0gKiBiWzBdICsgYVsxXSAqIGJbNF0gKyBhWzJdICogYls4XTtcbiAgICByZXN1bHRbMV0gPSBhWzBdICogYlsxXSArIGFbMV0gKiBiWzVdICsgYVsyXSAqIGJbOV07XG4gICAgcmVzdWx0WzJdID0gYVswXSAqIGJbMl0gKyBhWzFdICogYls2XSArIGFbMl0gKiBiWzEwXTtcbiAgICByZXN1bHRbNF0gPSBhWzRdICogYlswXSArIGFbNV0gKiBiWzRdICsgYVs2XSAqIGJbOF07XG4gICAgcmVzdWx0WzVdID0gYVs0XSAqIGJbMV0gKyBhWzVdICogYls1XSArIGFbNl0gKiBiWzldO1xuICAgIHJlc3VsdFs2XSA9IGFbNF0gKiBiWzJdICsgYVs1XSAqIGJbNl0gKyBhWzZdICogYlsxMF07XG4gICAgcmVzdWx0WzhdID0gYVs4XSAqIGJbMF0gKyBhWzldICogYls0XSArIGFbMTBdICogYls4XTtcbiAgICByZXN1bHRbOV0gPSBhWzhdICogYlsxXSArIGFbOV0gKiBiWzVdICsgYVsxMF0gKiBiWzldO1xuICAgIHJlc3VsdFsxMF0gPSBhWzhdICogYlsyXSArIGFbOV0gKiBiWzZdICsgYVsxMF0gKiBiWzEwXTtcbiAgICByZXN1bHRbMTJdID0gYVsxMl0gKiBiWzBdICsgYVsxM10gKiBiWzRdICsgYVsxNF0gKiBiWzhdICsgYlsxMl07XG4gICAgcmVzdWx0WzEzXSA9IGFbMTJdICogYlsxXSArIGFbMTNdICogYls1XSArIGFbMTRdICogYls5XSArIGJbMTNdO1xuICAgIHJlc3VsdFsxNF0gPSBhWzEyXSAqIGJbMl0gKyBhWzEzXSAqIGJbNl0gKyBhWzE0XSAqIGJbMTBdICsgYlsxNF07XG4gICAgaWYoYXJndW1lbnRzLmxlbmd0aCA8PSAyKSAgcmV0dXJuIHJlc3VsdDtcbiAgICBlbHNlIHJldHVybiBtdWx0aXBseS5hcHBseShudWxsLCBbcmVzdWx0XS5jb25jYXQoQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAyKSkpO1xufTtcblxuLyoqXG4gKiBSZXR1cm4gYSBGYW1vdXNNYXRyaXggdHJhbnNsYXRlZCBieSBhZGRpdGlvbmFsIGFtb3VudHMgaW4gZWFjaFxuICogICAgZGltZW5zaW9uLlxuICogICAgXG4gKiBAbmFtZSBGYW1vdXNNYXRyaXgjbW92ZVxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0ge0ZhbW91c01hdHJpeH0gbSBhIG1hdHJpeFxuICogQHBhcmFtIHtBcnJheS48bnVtYmVyPn0gdCBkZWx0YSB2ZWN0b3IgKGFycmF5IG9mIGZsb2F0cyAmJiBcbiAqICAgIGFycmF5Lmxlbmd0aCA9PSAyIHx8IDMpXG4gKiBAcmV0dXJucyB7RmFtb3VzTWF0cml4fSB0aGUgcmVzdWx0aW5nIHRyYW5zbGF0ZWQgbWF0cml4XG4gKi8gXG5GYW1vdXNNYXRyaXgubW92ZSA9IGZ1bmN0aW9uKG0sIHQpIHtcbiAgICBpZighdFsyXSkgdFsyXSA9IDA7XG4gICAgcmV0dXJuIFttWzBdLCBtWzFdLCBtWzJdLCAwLCBtWzRdLCBtWzVdLCBtWzZdLCAwLCBtWzhdLCBtWzldLCBtWzEwXSwgMCwgbVsxMl0gKyB0WzBdLCBtWzEzXSArIHRbMV0sIG1bMTRdICsgdFsyXSwgMV07XG59O1xuXG4vKipcbiAqIFJldHVybiBhIEZhbW91c01hdHJpeCB3aGljaCByZXByZXNlbnRzIHRoZSByZXN1bHQgb2YgYSB0cmFuc2Zvcm0gbWF0cml4XG4gKiBhcHBsaWVkIGFmdGVyIGEgbW92ZS4gVGhpcyBpcyBmYXN0ZXIgdGhhbiB0aGUgZXF1aXZhbGVudCBtdWx0aXBseS5cbiAqIFxuICogQG5hbWUgRmFtb3VzTWF0cml4I21vdmVUaGVuXG4gKiBAZnVuY3Rpb25cbiAqXG4gKiBAcGFyYW0ge0FycmF5Lm51bWJlcn0gdiB2ZWN0b3IgcmVwcmVzZW50aW5nIGluaXRpYWwgbW92ZW1lbnRcbiAqIEBwYXJhbSB7RmFtb3VzTWF0cml4fSBtIG1hdHJpeCB0byBhcHBseSBhZnRlcndhcmRzXG4gKiBAcmV0dXJucyB7RmFtb3VzTWF0cml4fSB0aGUgcmVzdWx0aW5nIG1hdHJpeFxuICovXG5GYW1vdXNNYXRyaXgubW92ZVRoZW4gPSBmdW5jdGlvbih2LCBtKSB7XG4gICAgaWYoIXZbMl0pIHZbMl0gPSAwO1xuICAgIHZhciB0MCA9IHZbMF0qbVswXSArIHZbMV0qbVs0XSArIHZbMl0qbVs4XTtcbiAgICB2YXIgdDEgPSB2WzBdKm1bMV0gKyB2WzFdKm1bNV0gKyB2WzJdKm1bOV07XG4gICAgdmFyIHQyID0gdlswXSptWzJdICsgdlsxXSptWzZdICsgdlsyXSptWzEwXTtcbiAgICByZXR1cm4gRmFtb3VzTWF0cml4Lm1vdmUobSwgW3QwLCB0MSwgdDJdKTtcbn07XG5cbi8qKlxuICogUmV0dXJuIGEgRmFtb3VzTWF0cml4IHdoaWNoIHJlcHJlc2VudHMgYSB0cmFuc2xhdGlvbiBieSBzcGVjaWZpZWRcbiAqICAgIGFtb3VudHMgaW4gZWFjaCBkaW1lbnNpb24uXG4gKiAgICBcbiAqIEBuYW1lIEZhbW91c01hdHJpeCN0cmFuc2xhdGVcbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIHtudW1iZXJ9IHggeCB0cmFuc2xhdGlvbiAoZGVsdGFfeClcbiAqIEBwYXJhbSB7bnVtYmVyfSB5IHkgdHJhbnNsYXRpb24gKGRlbHRhX3kpXG4gKiBAcGFyYW0ge251bWJlcn0geiB6IHRyYW5zbGF0aW9uIChkZWx0YV96KVxuICogQHJldHVybnMge0ZhbW91c01hdHJpeH0gdGhlIHJlc3VsdGluZyBtYXRyaXhcbiAqLyBcbkZhbW91c01hdHJpeC50cmFuc2xhdGUgPSBmdW5jdGlvbih4LCB5LCB6KSB7XG4gICAgaWYoeiA9PT0gdW5kZWZpbmVkKSB6ID0gMDtcbiAgICByZXR1cm4gWzEsIDAsIDAsIDAsIDAsIDEsIDAsIDAsIDAsIDAsIDEsIDAsIHgsIHksIHosIDFdO1xufTtcblxuLyoqXG4gKiBSZXR1cm4gYSBGYW1vdXNNYXRyaXggd2hpY2ggcmVwcmVzZW50cyBhIHNjYWxlIGJ5IHNwZWNpZmllZCBhbW91bnRzXG4gKiAgICBpbiBlYWNoIGRpbWVuc2lvbi5cbiAqICAgIFxuICogQG5hbWUgRmFtb3VzTWF0cml4I3NjYWxlXG4gKiBAZnVuY3Rpb24gIFxuICpcbiAqIEBwYXJhbSB7bnVtYmVyfSB4IHggc2NhbGUgZmFjdG9yXG4gKiBAcGFyYW0ge251bWJlcn0geSB5IHNjYWxlIGZhY3RvclxuICogQHBhcmFtIHtudW1iZXJ9IHogeiBzY2FsZSBmYWN0b3JcbiAqIEByZXR1cm5zIHtGYW1vdXNNYXRyaXh9IHRoZSByZXN1bHRpbmcgbWF0cml4XG4gKi8gXG5GYW1vdXNNYXRyaXguc2NhbGUgPSBmdW5jdGlvbih4LCB5LCB6KSB7XG4gICAgaWYoeiA9PT0gdW5kZWZpbmVkKSB6ID0gMTtcbiAgICByZXR1cm4gW3gsIDAsIDAsIDAsIDAsIHksIDAsIDAsIDAsIDAsIHosIDAsIDAsIDAsIDAsIDFdO1xufTtcblxuLyoqXG4gKiBSZXR1cm4gYSBGYW1vdXNNYXRyaXggd2hpY2ggcmVwcmVzZW50cyBhIHNwZWNpZmllZCBjbG9ja3dpc2VcbiAqICAgIHJvdGF0aW9uIGFyb3VuZCB0aGUgeCBheGlzLlxuICogICAgXG4gKiBAbmFtZSBGYW1vdXNNYXRyaXgjcm90YXRlWFxuICogQGZ1bmN0aW9uXG4gKlxuICogQHBhcmFtIHtudW1iZXJ9IHRoZXRhIHJhZGlhbnNcbiAqIEByZXR1cm5zIHtGYW1vdXNNYXRyaXh9IHRoZSByZXN1bHRpbmcgbWF0cml4XG4gKi8gXG5GYW1vdXNNYXRyaXgucm90YXRlWCA9IGZ1bmN0aW9uKHRoZXRhKSB7XG4gICAgdmFyIGNvc1RoZXRhID0gTWF0aC5jb3ModGhldGEpO1xuICAgIHZhciBzaW5UaGV0YSA9IE1hdGguc2luKHRoZXRhKTtcbiAgICByZXR1cm4gWzEsIDAsIDAsIDAsIDAsIGNvc1RoZXRhLCBzaW5UaGV0YSwgMCwgMCwgLXNpblRoZXRhLCBjb3NUaGV0YSwgMCwgMCwgMCwgMCwgMV07XG59O1xuXG4vKipcbiAqIFJldHVybiBhIEZhbW91c01hdHJpeCB3aGljaCByZXByZXNlbnRzIGEgc3BlY2lmaWVkIGNsb2Nrd2lzZVxuICogICAgcm90YXRpb24gYXJvdW5kIHRoZSB5IGF4aXMuXG4gKiAgICBcbiAqIEBuYW1lIEZhbW91c01hdHJpeCNyb3RhdGVZXG4gKiBAZnVuY3Rpb25cbiAqXG4gKiBAcmV0dXJucyB7RmFtb3VzTWF0cml4fSB0aGUgcmVzdWx0aW5nIG1hdHJpeFxuICovIFxuRmFtb3VzTWF0cml4LnJvdGF0ZVkgPSBmdW5jdGlvbih0aGV0YSkge1xuICAgIHZhciBjb3NUaGV0YSA9IE1hdGguY29zKHRoZXRhKTtcbiAgICB2YXIgc2luVGhldGEgPSBNYXRoLnNpbih0aGV0YSk7XG4gICAgcmV0dXJuIFtjb3NUaGV0YSwgMCwgLXNpblRoZXRhLCAwLCAwLCAxLCAwLCAwLCBzaW5UaGV0YSwgMCwgY29zVGhldGEsIDAsIDAsIDAsIDAsIDFdO1xufTtcblxuLyoqXG4gKiBSZXR1cm4gYSBGYW1vdXNNYXRyaXggd2hpY2ggcmVwcmVzZW50cyBhIHNwZWNpZmllZCBjbG9ja3dpc2VcbiAqICAgIHJvdGF0aW9uIGFyb3VuZCB0aGUgeiBheGlzLlxuICogICAgXG4gKiBAbmFtZSBGYW1vdXNNYXRyaXgjcm90YXRlWlxuICogQGZ1bmN0aW9uXG4gKlxuICogQHBhcmFtIHtudW1iZXJ9IHRoZXRhIHJhZGlhbnNcbiAqIEByZXR1cm5zIHtGYW1vdXNNYXRyaXh9IHRoZSByZXN1bHRpbmcgbWF0cml4XG4gKi8gXG5GYW1vdXNNYXRyaXgucm90YXRlWiA9IGZ1bmN0aW9uKHRoZXRhKSB7XG4gICAgdmFyIGNvc1RoZXRhID0gTWF0aC5jb3ModGhldGEpO1xuICAgIHZhciBzaW5UaGV0YSA9IE1hdGguc2luKHRoZXRhKTtcbiAgICByZXR1cm4gW2Nvc1RoZXRhLCBzaW5UaGV0YSwgMCwgMCwgLXNpblRoZXRhLCBjb3NUaGV0YSwgMCwgMCwgMCwgMCwgMSwgMCwgMCwgMCwgMCwgMV07XG59O1xuXG4vKipcbiAqIFJldHVybiBhIEZhbW91c01hdHJpeCB3aGljaCByZXByZXNlbnRzIGNvbXBvc2VkIGNsb2Nrd2lzZVxuICogICAgcm90YXRpb25zIGFsb25nIGVhY2ggb2YgdGhlIGF4ZXMuIEVxdWl2YWxlbnQgdG8gdGhlIHJlc3VsdCBvZlxuICogICAgbXVsdGlwbHkocm90YXRlWChwaGkpLCByb3RhdGVZKHRoZXRhKSwgcm90YXRlWihwc2kpKVxuICogICAgXG4gKiBAbmFtZSBGYW1vdXNNYXRyaXgjcm90YXRlXG4gKiBAZnVuY3Rpb25cbiAqXG4gKiBAcGFyYW0ge251bWJlcn0gcGhpIHJhZGlhbnMgdG8gcm90YXRlIGFib3V0IHRoZSBwb3NpdGl2ZSB4IGF4aXNcbiAqIEBwYXJhbSB7bnVtYmVyfSB0aGV0YSByYWRpYW5zIHRvIHJvdGF0ZSBhYm91dCB0aGUgcG9zaXRpdmUgeSBheGlzXG4gKiBAcGFyYW0ge251bWJlcn0gcHNpIHJhZGlhbnMgdG8gcm90YXRlIGFib3V0IHRoZSBwb3NpdGl2ZSB6IGF4aXNcbiAqIEByZXR1cm5zIHtGYW1vdXNNYXRyaXh9IHRoZSByZXN1bHRpbmcgbWF0cml4XG4gKi8gXG5GYW1vdXNNYXRyaXgucm90YXRlID0gZnVuY3Rpb24ocGhpLCB0aGV0YSwgcHNpKSB7XG4gICAgdmFyIGNvc1BoaSA9IE1hdGguY29zKHBoaSk7XG4gICAgdmFyIHNpblBoaSA9IE1hdGguc2luKHBoaSk7XG4gICAgdmFyIGNvc1RoZXRhID0gTWF0aC5jb3ModGhldGEpO1xuICAgIHZhciBzaW5UaGV0YSA9IE1hdGguc2luKHRoZXRhKTtcbiAgICB2YXIgY29zUHNpID0gTWF0aC5jb3MocHNpKTtcbiAgICB2YXIgc2luUHNpID0gTWF0aC5zaW4ocHNpKTtcbiAgICB2YXIgcmVzdWx0ID0gWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDFdO1xuICAgIHJlc3VsdFswXSA9IGNvc1RoZXRhICogY29zUHNpO1xuICAgIHJlc3VsdFsxXSA9IGNvc1BoaSAqIHNpblBzaSArIHNpblBoaSAqIHNpblRoZXRhICogY29zUHNpO1xuICAgIHJlc3VsdFsyXSA9IHNpblBoaSAqIHNpblBzaSAtIGNvc1BoaSAqIHNpblRoZXRhICogY29zUHNpO1xuICAgIHJlc3VsdFs0XSA9IC1jb3NUaGV0YSAqIHNpblBzaTtcbiAgICByZXN1bHRbNV0gPSBjb3NQaGkgKiBjb3NQc2kgLSBzaW5QaGkgKiBzaW5UaGV0YSAqIHNpblBzaTtcbiAgICByZXN1bHRbNl0gPSBzaW5QaGkgKiBjb3NQc2kgKyBjb3NQaGkgKiBzaW5UaGV0YSAqIHNpblBzaTtcbiAgICByZXN1bHRbOF0gPSBzaW5UaGV0YTtcbiAgICByZXN1bHRbOV0gPSAtc2luUGhpICogY29zVGhldGE7XG4gICAgcmVzdWx0WzEwXSA9IGNvc1BoaSAqIGNvc1RoZXRhO1xuICAgIHJldHVybiByZXN1bHQ7XG59O1xuXG4vKipcbiAqIFJldHVybiBhIEZhbW91c01hdHJpeCB3aGljaCByZXByZXNlbnRzIGFuIGF4aXMtYW5nbGUgcm90YXRpb25cbiAqXG4gKiBAbmFtZSBGYW1vdXNNYXRyaXgjcm90YXRlQXhpc1xuICogQGZ1bmN0aW9uXG4gKlxuICogQHBhcmFtIHtBcnJheS5udW1iZXJ9IHYgdW5pdCB2ZWN0b3IgcmVwcmVzZW50aW5nIHRoZSBheGlzIHRvIHJvdGF0ZSBhYm91dFxuICogQHBhcmFtIHtudW1iZXJ9IHRoZXRhIHJhZGlhbnMgdG8gcm90YXRlIGNsb2Nrd2lzZSBhYm91dCB0aGUgYXhpc1xuICogQHJldHVybnMge0ZhbW91c01hdHJpeH0gdGhlIHJlc3VsdGluZyBtYXRyaXhcbiAqLyBcbkZhbW91c01hdHJpeC5yb3RhdGVBeGlzID0gZnVuY3Rpb24odiwgdGhldGEpIHtcbiAgICB2YXIgc2luVGhldGEgPSBNYXRoLnNpbih0aGV0YSk7XG4gICAgdmFyIGNvc1RoZXRhID0gTWF0aC5jb3ModGhldGEpO1xuICAgIHZhciB2ZXJUaGV0YSA9IDEgLSBjb3NUaGV0YTsgLy8gdmVyc2luZSBvZiB0aGV0YVxuXG4gICAgdmFyIHh4ViA9IHZbMF0qdlswXSp2ZXJUaGV0YTtcbiAgICB2YXIgeHlWID0gdlswXSp2WzFdKnZlclRoZXRhO1xuICAgIHZhciB4elYgPSB2WzBdKnZbMl0qdmVyVGhldGE7XG4gICAgdmFyIHl5ViA9IHZbMV0qdlsxXSp2ZXJUaGV0YTtcbiAgICB2YXIgeXpWID0gdlsxXSp2WzJdKnZlclRoZXRhO1xuICAgIHZhciB6elYgPSB2WzJdKnZbMl0qdmVyVGhldGE7XG4gICAgdmFyIHhzID0gdlswXSpzaW5UaGV0YTtcbiAgICB2YXIgeXMgPSB2WzFdKnNpblRoZXRhO1xuICAgIHZhciB6cyA9IHZbMl0qc2luVGhldGE7XG5cbiAgICB2YXIgcmVzdWx0ID0gWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDFdO1xuICAgIHJlc3VsdFswXSA9IHh4ViArIGNvc1RoZXRhO1xuICAgIHJlc3VsdFsxXSA9IHh5ViArIHpzO1xuICAgIHJlc3VsdFsyXSA9IHh6ViAtIHlzO1xuICAgIHJlc3VsdFs0XSA9IHh5ViAtIHpzO1xuICAgIHJlc3VsdFs1XSA9IHl5ViArIGNvc1RoZXRhO1xuICAgIHJlc3VsdFs2XSA9IHl6ViArIHhzO1xuICAgIHJlc3VsdFs4XSA9IHh6ViArIHlzO1xuICAgIHJlc3VsdFs5XSA9IHl6ViAtIHhzO1xuICAgIHJlc3VsdFsxMF0gPSB6elYgKyBjb3NUaGV0YTtcbiAgICByZXR1cm4gcmVzdWx0O1xufTtcblxuLyoqXG4gKiBSZXR1cm4gYSBGYW1vdXNNYXRyaXggd2hpY2ggcmVwcmVzZW50cyBhIHRyYW5zZm9ybSBtYXRyaXggYXBwbGllZCBhYm91dFxuICogYSBzZXBhcmF0ZSBvcmlnaW4gcG9pbnQuXG4gKiBcbiAqIEBuYW1lIEZhbW91c01hdHJpeCNhYm91dE9yaWdpblxuICogQGZ1bmN0aW9uXG4gKlxuICogQHBhcmFtIHtBcnJheS5udW1iZXJ9IHYgb3JpZ2luIHBvaW50IHRvIGFwcGx5IG1hdHJpeFxuICogQHBhcmFtIHtGYW1vdXNNYXRyaXh9IG0gbWF0cml4IHRvIGFwcGx5XG4gKiBAcmV0dXJucyB7RmFtb3VzTWF0cml4fSB0aGUgcmVzdWx0aW5nIG1hdHJpeFxuICovXG5GYW1vdXNNYXRyaXguYWJvdXRPcmlnaW4gPSBmdW5jdGlvbih2LCBtKSB7XG4gICAgdmFyIHQwID0gdlswXSAtICh2WzBdKm1bMF0gKyB2WzFdKm1bNF0gKyB2WzJdKm1bOF0pO1xuICAgIHZhciB0MSA9IHZbMV0gLSAodlswXSptWzFdICsgdlsxXSptWzVdICsgdlsyXSptWzldKTtcbiAgICB2YXIgdDIgPSB2WzJdIC0gKHZbMF0qbVsyXSArIHZbMV0qbVs2XSArIHZbMl0qbVsxMF0pO1xuICAgIHJldHVybiBGYW1vdXNNYXRyaXgubW92ZShtLCBbdDAsIHQxLCB0Ml0pO1xufTtcblxuLyoqXG4gKiBSZXR1cm4gYSBGYW1vdXNNYXRyaXgncyB3ZWJraXQgY3NzIHJlcHJlc2VudGF0aW9uIHRvIGJlIHVzZWQgd2l0aCB0aGVcbiAqICAgIENTUzMgLXdlYmtpdC10cmFuc2Zvcm0gc3R5bGUuIFxuICogQGV4YW1wbGU6IC13ZWJraXQtdHJhbnNmb3JtOiBtYXRyaXgzZCgxLDAsMCwwLDAsMSwwLDAsMCwwLDEsMCw3MTYsMjQzLDAsMSlcbiAqXG4gKiBAbmFtZSBGYW1vdXNNYXRyaXgjZm9ybWF0Q1NTXG4gKiBAZnVuY3Rpb25cbiAqIFxuICogQHBhcmFtIHtGYW1vdXNNYXRyaXh9IG0gYSBGYW1vdXMgbWF0cml4XG4gKiBAcmV0dXJucyB7c3RyaW5nfSBtYXRyaXgzZCBDU1Mgc3R5bGUgcmVwcmVzZW50YXRpb24gb2YgdGhlIHRyYW5zZm9ybVxuICovIFxuRmFtb3VzTWF0cml4LmZvcm1hdENTUyA9IGZ1bmN0aW9uKG0pIHtcbiAgICB2YXIgbiA9IG0uc2xpY2UoMCk7XG4gICAgZm9yKHZhciBpID0gMDsgaSA8IG4ubGVuZ3RoOyBpKyspIGlmKG5baV0gPCAwLjAwMDAwMSAmJiBuW2ldID4gLTAuMDAwMDAxKSBuW2ldID0gMDtcbiAgICByZXR1cm4gJ21hdHJpeDNkKCcgKyBuLmpvaW4oKSArICcpJztcbn07XG5cbi8qKlxuICogUmV0dXJuIGEgRmFtb3VzTWF0cml4IHJlcHJlc2VudGF0aWtvbiBvZiBhIHNrZXcgdHJhbnNmb3JtYXRpb25cbiAqXG4gKiBAbmFtZSBGYW1vdXNNYXRyaXgjc2tld1xuICogQGZ1bmN0aW9uXG4gKiBcbiAqIEBwYXJhbSB7bnVtYmVyfSBwc2kgcmFkaWFucyBza2V3ZWQgYWJvdXQgdGhlIHl6IHBsYW5lXG4gKiBAcGFyYW0ge251bWJlcn0gdGhldGEgcmFkaWFucyBza2V3ZWQgYWJvdXQgdGhlIHh6IHBsYW5lXG4gKiBAcGFyYW0ge251bWJlcn0gcGhpIHJhZGlhbnMgc2tld2VkIGFib3V0IHRoZSB4eSBwbGFuZVxuICogQHJldHVybnMge0ZhbW91c01hdHJpeH0gdGhlIHJlc3VsdGluZyBtYXRyaXhcbiAqLyBcbkZhbW91c01hdHJpeC5za2V3ID0gZnVuY3Rpb24ocGhpLCB0aGV0YSwgcHNpKSB7XG4gICAgcmV0dXJuIFsxLCAwLCAwLCAwLCBNYXRoLnRhbihwc2kpLCAxLCAwLCAwLCBNYXRoLnRhbih0aGV0YSksIE1hdGgudGFuKHBoaSksIDEsIDAsIDAsIDAsIDAsIDFdO1xufTtcblxuLyoqXG4gKiBSZXR1cm4gdHJhbnNsYXRpb24gdmVjdG9yIGNvbXBvbmVudCBvZiBnaXZlbiBGYW1vdXNNYXRyaXhcbiAqIFxuICogQG5hbWUgRmFtb3VzTWF0cml4I2dldFRyYW5zbGF0ZVxuICogQGZ1bmN0aW9uXG4gKlxuICogQHBhcmFtIHtGYW1vdXNNYXRyaXh9IG0gbWF0cml4XG4gKiBAcmV0dXJucyB7QXJyYXkuPG51bWJlcj59IHRoZSB0cmFuc2xhdGlvbiB2ZWN0b3IgW3RfeCwgdF95LCB0X3pdXG4gKi8gXG5GYW1vdXNNYXRyaXguZ2V0VHJhbnNsYXRlID0gZnVuY3Rpb24obSkge1xuICAgIHJldHVybiBbbVsxMl0sIG1bMTNdLCBtWzE0XV07XG59O1xuXG4vKipcbiAqIFJldHVybiBpbnZlcnNlIGFmZmluZSBtYXRyaXggZm9yIGdpdmVuIEZhbW91c01hdHJpeC4gXG4gKiBOb3RlOiBUaGlzIGFzc3VtZXMgbVszXSA9IG1bN10gPSBtWzExXSA9IDAsIGFuZCBtWzE1XSA9IDEuIFxuICogICAgICAgSW5jb3JyZWN0IHJlc3VsdHMgaWYgbm90IGludmVydGFibGUgb3IgcHJlY29uZGl0aW9ucyBub3QgbWV0LlxuICpcbiAqIEBuYW1lIEZhbW91c01hdHJpeCNpbnZlcnNlXG4gKiBAZnVuY3Rpb25cbiAqIFxuICogQHBhcmFtIHtGYW1vdXNNYXRyaXh9IG0gbWF0cml4XG4gKiBAcmV0dXJucyB7RmFtb3VzTWF0cml4fSB0aGUgcmVzdWx0aW5nIGludmVydGVkIG1hdHJpeFxuICovIFxuRmFtb3VzTWF0cml4LmludmVyc2UgPSBmdW5jdGlvbihtKSB7XG4gICAgdmFyIHJlc3VsdCA9IFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAxXTtcbiAgICAvLyBvbmx5IG5lZWQgdG8gY29uc2lkZXIgM3gzIHNlY3Rpb24gZm9yIGFmZmluZVxuICAgIHZhciBjMCA9IG1bNV0qbVsxMF0gLSBtWzZdKm1bOV07XG4gICAgdmFyIGMxID0gbVs0XSptWzEwXSAtIG1bNl0qbVs4XTtcbiAgICB2YXIgYzIgPSBtWzRdKm1bOV0gLSBtWzVdKm1bOF07XG4gICAgdmFyIGM0ID0gbVsxXSptWzEwXSAtIG1bMl0qbVs5XTtcbiAgICB2YXIgYzUgPSBtWzBdKm1bMTBdIC0gbVsyXSptWzhdO1xuICAgIHZhciBjNiA9IG1bMF0qbVs5XSAtIG1bMV0qbVs4XTtcbiAgICB2YXIgYzggPSBtWzFdKm1bNl0gLSBtWzJdKm1bNV07XG4gICAgdmFyIGM5ID0gbVswXSptWzZdIC0gbVsyXSptWzRdO1xuICAgIHZhciBjMTAgPSBtWzBdKm1bNV0gLSBtWzFdKm1bNF07XG4gICAgdmFyIGRldE0gPSBtWzBdKmMwIC0gbVsxXSpjMSArIG1bMl0qYzI7XG4gICAgdmFyIGludkQgPSAxL2RldE07XG4gICAgcmVzdWx0WzBdID0gaW52RCAqIGMwO1xuICAgIHJlc3VsdFsxXSA9IC1pbnZEICogYzQ7XG4gICAgcmVzdWx0WzJdID0gaW52RCAqIGM4O1xuICAgIHJlc3VsdFs0XSA9IC1pbnZEICogYzE7XG4gICAgcmVzdWx0WzVdID0gaW52RCAqIGM1O1xuICAgIHJlc3VsdFs2XSA9IC1pbnZEICogYzk7XG4gICAgcmVzdWx0WzhdID0gaW52RCAqIGMyO1xuICAgIHJlc3VsdFs5XSA9IC1pbnZEICogYzY7XG4gICAgcmVzdWx0WzEwXSA9IGludkQgKiBjMTA7XG4gICAgcmVzdWx0WzEyXSA9IC1tWzEyXSpyZXN1bHRbMF0gLSBtWzEzXSpyZXN1bHRbNF0gLSBtWzE0XSpyZXN1bHRbOF07XG4gICAgcmVzdWx0WzEzXSA9IC1tWzEyXSpyZXN1bHRbMV0gLSBtWzEzXSpyZXN1bHRbNV0gLSBtWzE0XSpyZXN1bHRbOV07XG4gICAgcmVzdWx0WzE0XSA9IC1tWzEyXSpyZXN1bHRbMl0gLSBtWzEzXSpyZXN1bHRbNl0gLSBtWzE0XSpyZXN1bHRbMTBdO1xuICAgIHJldHVybiByZXN1bHQ7XG59O1xuXG4vKipcbiAqIERlY29tcG9zZSBGYW1vdXNNYXRyaXggaW50byBzZXBhcmF0ZSAudHJhbnNsYXRlLCAucm90YXRlLCAuc2NhbGUsXG4gKiAgICAuc2tldyBjb21wb25lbnRzLlxuICogICAgXG4gKiBAbmFtZSBGYW1vdXNNYXRyaXgjaW50ZXJwcmV0XG4gKiBAZnVuY3Rpb25cbiAqXG4gKiBAcGFyYW0ge0ZhbW91c01hdHJpeH0gTSBtYXRyaXhcbiAqIEByZXR1cm5zIHttYXRyaXhTcGVjfSBvYmplY3Qgd2l0aCBjb21wb25lbnQgbWF0cmljZXMgLnRyYW5zbGF0ZSxcbiAqICAgIC5yb3RhdGUsIC5zY2FsZSwgLnNrZXdcbiAqLyBcbkZhbW91c01hdHJpeC5pbnRlcnByZXQgPSBmdW5jdGlvbihNKSB7XG5cbiAgICAvLyBRUiBkZWNvbXBvc2l0aW9uIHZpYSBIb3VzZWhvbGRlciByZWZsZWN0aW9uc1xuXG4gICAgZnVuY3Rpb24gbm9ybVNxdWFyZWQodil7XG4gICAgICAgIGlmICh2Lmxlbmd0aCA9PSAyKVxuICAgICAgICAgICAgcmV0dXJuIHZbMF0qdlswXSArIHZbMV0qdlsxXTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmV0dXJuIHZbMF0qdlswXSArIHZbMV0qdlsxXSArIHZbMl0qdlsyXTtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gbm9ybSh2KXtcbiAgICAgICAgcmV0dXJuIE1hdGguc3FydChub3JtU3F1YXJlZCh2KSk7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIHNpZ24obil7XG4gICAgICAgIHJldHVybiAobiA8IDApID8gLTEgOiAxO1xuICAgIH07XG5cblxuICAgIC8vRklSU1QgSVRFUkFUSU9OXG5cbiAgICAvL2RlZmF1bHQgUTEgdG8gdGhlIGlkZW50aXR5IG1hdHJpeDtcbiAgICB2YXIgeCA9IFtNWzBdLCBNWzFdLCBNWzJdXTsgICAgICAgICAgICAgICAgIC8vIGZpcnN0IGNvbHVtbiB2ZWN0b3JcbiAgICB2YXIgc2duID0gc2lnbih4WzBdKTsgICAgICAgICAgICAgICAgICAgICAgIC8vIHNpZ24gb2YgZmlyc3QgY29tcG9uZW50IG9mIHggKGZvciBzdGFiaWxpdHkpXG4gICAgdmFyIHhOb3JtID0gbm9ybSh4KTsgICAgICAgICAgICAgICAgICAgICAgIC8vIG5vcm0gb2YgZmlyc3QgY29sdW1uIHZlY3RvclxuICAgIHZhciB2ID0gW3hbMF0gKyBzZ24gKiB4Tm9ybSwgeFsxXSwgeFsyXV07ICAvLyB2ID0geCArIHNpZ24oeFswXSl8eHxlMVxuICAgIHZhciBtdWx0ID0gMiAvIG5vcm1TcXVhcmVkKHYpOyAgICAgICAgICAgICAgLy8gbXVsdCA9IDIvdid2XG5cbiAgICAvL2V2YWx1YXRlIFExID0gSSAtIDJ2dicvdid2XG4gICAgdmFyIFExID0gWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDFdO1xuXG4gICAgLy9kaWFnb25hbHNcbiAgICBRMVswXSAgPSAxIC0gbXVsdCAqIHZbMF0gKiB2WzBdOyAgICAvLyAwLDAgZW50cnlcbiAgICBRMVs1XSAgPSAxIC0gbXVsdCAqIHZbMV0gKiB2WzFdOyAgICAvLyAxLDEgZW50cnlcbiAgICBRMVsxMF0gPSAxIC0gbXVsdCAqIHZbMl0gKiB2WzJdOyAgICAvLyAyLDIgZW50cnlcblxuICAgIC8vdXBwZXIgZGlhZ29uYWxcbiAgICBRMVsxXSA9IC1tdWx0ICogdlswXSAqIHZbMV07ICAgICAgICAvLyAwLDEgZW50cnlcbiAgICBRMVsyXSA9IC1tdWx0ICogdlswXSAqIHZbMl07ICAgICAgICAvLyAwLDIgZW50cnlcbiAgICBRMVs2XSA9IC1tdWx0ICogdlsxXSAqIHZbMl07ICAgICAgICAvLyAxLDIgZW50cnlcblxuICAgIC8vbG93ZXIgZGlhZ29uYWxcbiAgICBRMVs0XSA9IFExWzFdOyAgICAgICAgICAgICAgICAgICAgICAvLyAxLDAgZW50cnlcbiAgICBRMVs4XSA9IFExWzJdOyAgICAgICAgICAgICAgICAgICAgICAvLyAyLDAgZW50cnlcbiAgICBRMVs5XSA9IFExWzZdOyAgICAgICAgICAgICAgICAgICAgICAvLyAyLDEgZW50cnlcblxuICAgIC8vcmVkdWNlIGZpcnN0IGNvbHVtbiBvZiBNXG4gICAgdmFyIE1RMSA9IEZhbW91c01hdHJpeC5tdWx0aXBseShNLCBRMSk7XG5cblxuICAgIC8vU0VDT05EIElURVJBVElPTiBvbiAoMSwxKSBtaW5vclxuICAgIHZhciB4MiA9IFtNUTFbNV0sIE1RMVs2XV07XG4gICAgdmFyIHNnbjIgPSBzaWduKHgyWzBdKTsgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBzaWduIG9mIGZpcnN0IGNvbXBvbmVudCBvZiB4IChmb3Igc3RhYmlsaXR5KVxuICAgIHZhciB4Mk5vcm0gPSBub3JtKHgyKTsgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBub3JtIG9mIGZpcnN0IGNvbHVtbiB2ZWN0b3JcbiAgICB2YXIgdjIgPSBbeDJbMF0gKyBzZ24yICogeDJOb3JtLCB4MlsxXV07ICAgICAgICAgICAgLy8gdiA9IHggKyBzaWduKHhbMF0pfHh8ZTFcbiAgICB2YXIgbXVsdDIgPSAyIC8gbm9ybVNxdWFyZWQodjIpOyAgICAgICAgICAgICAgICAgICAgIC8vIG11bHQgPSAyL3YndlxuXG4gICAgLy9ldmFsdWF0ZSBRMiA9IEkgLSAydnYnL3YndlxuICAgIHZhciBRMiA9IFsxLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAxXTtcblxuICAgIC8vZGlhZ29uYWxcbiAgICBRMls1XSAgPSAxIC0gbXVsdDIgKiB2MlswXSAqIHYyWzBdOyAvLyAxLDEgZW50cnlcbiAgICBRMlsxMF0gPSAxIC0gbXVsdDIgKiB2MlsxXSAqIHYyWzFdOyAvLyAyLDIgZW50cnlcblxuICAgIC8vb2ZmIGRpYWdvbmFsc1xuICAgIFEyWzZdID0gLW11bHQyICogdjJbMF0gKiB2MlsxXTsgICAgIC8vIDIsMSBlbnRyeVxuICAgIFEyWzldID0gUTJbNl07ICAgICAgICAgICAgICAgICAgICAgIC8vIDEsMiBlbnRyeVxuXG5cbiAgICAvL2NhbGMgUVIgZGVjb21wb3NpdGlvbi4gUSA9IFExKlEyLCBSID0gUScqTVxuICAgIHZhciBRID0gRmFtb3VzTWF0cml4Lm11bHRpcGx5KFExLCBRMik7ICAgICAgICAgICAgICAvL25vdGU6IHJlYWxseSBRIHRyYW5zcG9zZVxuICAgIHZhciBSID0gRmFtb3VzTWF0cml4Lm11bHRpcGx5KE0sIFEpO1xuXG4gICAgLy9yZW1vdmUgbmVnYXRpdmUgc2NhbGluZ1xuICAgIHZhciByZW1vdmVyID0gRmFtb3VzTWF0cml4LnNjYWxlKFJbMF0gPCAwID8gLTEgOiAxLCBSWzVdIDwgMCA/IC0xIDogMSwgUlsxMF0gPCAwID8gLTEgOiAxKTtcbiAgICBSID0gRmFtb3VzTWF0cml4Lm11bHRpcGx5KHJlbW92ZXIsIFIpO1xuICAgIFEgPSBGYW1vdXNNYXRyaXgubXVsdGlwbHkoUSwgcmVtb3Zlcik7XG5cbiAgICAvL2RlY29tcG9zZSBpbnRvIHJvdGF0ZS9zY2FsZS9za2V3IG1hdHJpY2VzXG4gICAgdmFyIHJlc3VsdCA9IHt9O1xuICAgIHJlc3VsdC50cmFuc2xhdGUgPSBGYW1vdXNNYXRyaXguZ2V0VHJhbnNsYXRlKE0pO1xuICAgIHJlc3VsdC5yb3RhdGUgPSBbTWF0aC5hdGFuMigtUVs2XSwgUVsxMF0pLCBNYXRoLmFzaW4oUVsyXSksIE1hdGguYXRhbjIoLVFbMV0sIFFbMF0pXTtcbiAgICBpZighcmVzdWx0LnJvdGF0ZVswXSkge1xuICAgICAgICByZXN1bHQucm90YXRlWzBdID0gMDtcbiAgICAgICAgcmVzdWx0LnJvdGF0ZVsyXSA9IE1hdGguYXRhbjIoUVs0XSwgUVs1XSk7XG4gICAgfVxuICAgIHJlc3VsdC5zY2FsZSA9IFtSWzBdLCBSWzVdLCBSWzEwXV07XG4gICAgcmVzdWx0LnNrZXcgPSBbTWF0aC5hdGFuKFJbOV0vcmVzdWx0LnNjYWxlWzJdKSwgTWF0aC5hdGFuKFJbOF0vcmVzdWx0LnNjYWxlWzJdKSwgTWF0aC5hdGFuKFJbNF0vcmVzdWx0LnNjYWxlWzBdKV07XG5cbiAgICAvL2RvdWJsZSByb3RhdGlvbiB3b3JrYXJvdW5kXG4gICAgaWYoTWF0aC5hYnMocmVzdWx0LnJvdGF0ZVswXSkgKyBNYXRoLmFicyhyZXN1bHQucm90YXRlWzJdKSA+IDEuNSpNYXRoLlBJKSB7XG4gICAgICAgIHJlc3VsdC5yb3RhdGVbMV0gPSBNYXRoLlBJIC0gcmVzdWx0LnJvdGF0ZVsxXTtcbiAgICAgICAgaWYocmVzdWx0LnJvdGF0ZVsxXSA+IE1hdGguUEkpIHJlc3VsdC5yb3RhdGVbMV0gLT0gMipNYXRoLlBJO1xuICAgICAgICBpZihyZXN1bHQucm90YXRlWzFdIDwgLU1hdGguUEkpIHJlc3VsdC5yb3RhdGVbMV0gKz0gMipNYXRoLlBJO1xuICAgICAgICBpZihyZXN1bHQucm90YXRlWzBdIDwgMCkgcmVzdWx0LnJvdGF0ZVswXSArPSBNYXRoLlBJO1xuICAgICAgICBlbHNlIHJlc3VsdC5yb3RhdGVbMF0gLT0gTWF0aC5QSTtcbiAgICAgICAgaWYocmVzdWx0LnJvdGF0ZVsyXSA8IDApIHJlc3VsdC5yb3RhdGVbMl0gKz0gTWF0aC5QSTtcbiAgICAgICAgZWxzZSByZXN1bHQucm90YXRlWzJdIC09IE1hdGguUEk7XG4gICAgfSAgIFxuXG4gICAgcmV0dXJuIHJlc3VsdDtcblxufTtcblxuLyoqXG4gKiBDb21wb3NlIC50cmFuc2xhdGUsIC5yb3RhdGUsIC5zY2FsZSwgLnNrZXcgY29tcG9uZW50cyBpbnRvIGludG9cbiAqICAgIEZhbW91c01hdHJpeFxuICogICAgXG4gKiBAbmFtZSBGYW1vdXNNYXRyaXgjYnVpbGRcbiAqIEBmdW5jdGlvblxuICpcbiAqIEBwYXJhbSB7bWF0cml4U3BlY30gc3BlYyBvYmplY3Qgd2l0aCBjb21wb25lbnQgbWF0cmljZXMgLnRyYW5zbGF0ZSxcbiAqICAgIC5yb3RhdGUsIC5zY2FsZSwgLnNrZXdcbiAqIEByZXR1cm5zIHtGYW1vdXNNYXRyaXh9IGNvbXBvc2VkIG1hcnRpeFxuICovIFxuRmFtb3VzTWF0cml4LmJ1aWxkID0gZnVuY3Rpb24oc3BlYykge1xuICAgIHZhciBzY2FsZU1hdHJpeCA9IEZhbW91c01hdHJpeC5zY2FsZShzcGVjLnNjYWxlWzBdLCBzcGVjLnNjYWxlWzFdLCBzcGVjLnNjYWxlWzJdKTtcbiAgICB2YXIgc2tld01hdHJpeCA9IEZhbW91c01hdHJpeC5za2V3KHNwZWMuc2tld1swXSwgc3BlYy5za2V3WzFdLCBzcGVjLnNrZXdbMl0pO1xuICAgIHZhciByb3RhdGVNYXRyaXggPSBGYW1vdXNNYXRyaXgucm90YXRlKHNwZWMucm90YXRlWzBdLCBzcGVjLnJvdGF0ZVsxXSwgc3BlYy5yb3RhdGVbMl0pO1xuICAgIHJldHVybiBGYW1vdXNNYXRyaXgubW92ZShGYW1vdXNNYXRyaXgubXVsdGlwbHkoc2NhbGVNYXRyaXgsIHNrZXdNYXRyaXgsIHJvdGF0ZU1hdHJpeCksIHNwZWMudHJhbnNsYXRlKTtcbn07XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIHR3byBGYW1vdXNNYXRyaXhlcyBhcmUgY29tcG9uZW50LXdpc2UgZXF1YWxcbiAqIFxuICogQG5hbWUgRmFtb3VzTWF0cml4I2VxdWFsc1xuICogQGZ1bmN0aW9uXG4gKiBcbiAqIEBwYXJhbSB7RmFtb3VzTWF0cml4fSBhIG1hdHJpeFxuICogQHBhcmFtIHtGYW1vdXNNYXRyaXh9IGIgbWF0cml4XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gXG4gKi8gXG5GYW1vdXNNYXRyaXguZXF1YWxzID0gZnVuY3Rpb24oYSwgYikge1xuICAgIGlmKGEgPT09IGIpIHJldHVybiB0cnVlO1xuICAgIGlmKCFhIHx8ICFiKSByZXR1cm4gZmFsc2U7XG4gICAgZm9yKHZhciBpID0gMDsgaSA8IGEubGVuZ3RoOyBpKyspIGlmKGFbaV0gIT0gYltpXSkgcmV0dXJuIGZhbHNlO1xuICAgIHJldHVybiB0cnVlO1xufTtcblxuLyoqXG4gKiBDb25zdHJhaW4gYW5nbGUtdHJpbyBjb21wb25lbnRzIHRvIHJhbmdlIG9mIFstcGksIHBpKS5cbiAqXG4gKiBAbmFtZSBGYW1vdXNNYXRyaXgjbm9ybWFsaXplUm90YXRpb25cbiAqIEBmdW5jdGlvblxuICogXG4gKiBAcGFyYW0ge0FycmF5LjxudW1iZXI+fSByb3RhdGlvbiBwaGksIHRoZXRhLCBwc2kgKGFycmF5IG9mIGZsb2F0cyBcbiAqICAgICYmIGFycmF5Lmxlbmd0aCA9PSAzKVxuICogQHJldHVybnMge0FycmF5LjxudW1iZXI+fSBuZXcgcGhpLCB0aGV0YSwgcHNpIHRyaXBsZXRcbiAqICAgIChhcnJheSBvZiBmbG9hdHMgJiYgYXJyYXkubGVuZ3RoID09IDMpXG4gKi8gXG5GYW1vdXNNYXRyaXgubm9ybWFsaXplUm90YXRpb24gPSBmdW5jdGlvbihyb3RhdGlvbikge1xuICAgIHZhciByZXN1bHQgPSByb3RhdGlvbi5zbGljZSgwKTtcbiAgICBpZihyZXN1bHRbMF0gPT0gTWF0aC5QSS8yIHx8IHJlc3VsdFswXSA9PSAtTWF0aC5QSS8yKSB7XG4gICAgICAgIHJlc3VsdFswXSA9IC1yZXN1bHRbMF07XG4gICAgICAgIHJlc3VsdFsxXSA9IE1hdGguUEkgLSByZXN1bHRbMV07XG4gICAgICAgIHJlc3VsdFsyXSAtPSBNYXRoLlBJO1xuICAgIH1cbiAgICBpZihyZXN1bHRbMF0gPiBNYXRoLlBJLzIpIHtcbiAgICAgICAgcmVzdWx0WzBdID0gcmVzdWx0WzBdIC0gTWF0aC5QSTtcbiAgICAgICAgcmVzdWx0WzFdID0gTWF0aC5QSSAtIHJlc3VsdFsxXTtcbiAgICAgICAgcmVzdWx0WzJdIC09IE1hdGguUEk7XG4gICAgfVxuICAgIGlmKHJlc3VsdFswXSA8IC1NYXRoLlBJLzIpIHtcbiAgICAgICAgcmVzdWx0WzBdID0gcmVzdWx0WzBdICsgTWF0aC5QSTtcbiAgICAgICAgcmVzdWx0WzFdID0gLU1hdGguUEkgLSByZXN1bHRbMV07XG4gICAgICAgIHJlc3VsdFsyXSAtPSBNYXRoLlBJO1xuICAgIH1cbiAgICB3aGlsZShyZXN1bHRbMV0gPCAtTWF0aC5QSSkgcmVzdWx0WzFdICs9IDIqTWF0aC5QSTtcbiAgICB3aGlsZShyZXN1bHRbMV0gPj0gTWF0aC5QSSkgcmVzdWx0WzFdIC09IDIqTWF0aC5QSTtcbiAgICB3aGlsZShyZXN1bHRbMl0gPCAtTWF0aC5QSSkgcmVzdWx0WzJdICs9IDIqTWF0aC5QSTtcbiAgICB3aGlsZShyZXN1bHRbMl0gPj0gTWF0aC5QSSkgcmVzdWx0WzJdIC09IDIqTWF0aC5QSTtcbiAgICByZXR1cm4gcmVzdWx0O1xufTtcblxuLyoqXG4gKiBUcmFuc2Zvcm0gdmVjdG9yIGJ5IGEgbWF0cml4LCB0aHJvdWdoIHJpZ2h0LW11bHRpcGx5aW5nIGJ5IG1hdHJpeC5cbiAqIFxuICogQG5hbWUgRmFtb3VzTWF0cml4I3ZlY011bHRpcGx5XG4gKiBAZnVuY3Rpb25cbiAqXG4gKiBAcGFyYW0ge0FycmF5LjxudW1iZXI+fSB2ZWMgeCx5LHogdmVjdG9yIFxuICogICAgKGFycmF5IG9mIGZsb2F0cyAmJiBhcnJheS5sZW5ndGggPT0gMylcbiAqIEBwYXJhbSB7RmFtb3VzTWF0cml4fSBtIG1hdHJpeFxuICogQHJldHVybnMge0FycmF5LjxudW1iZXI+fSB0aGUgcmVzdWx0aW5nIHZlY3RvclxuICogICAgKGFycmF5IG9mIGZsb2F0cyAmJiBhcnJheS5sZW5ndGggPT0gMylcbiAqLyBcbkZhbW91c01hdHJpeC52ZWNNdWx0aXBseSA9IGZ1bmN0aW9uKHZlYywgbSkge1xuICAgIHJldHVybiBbXG4gICAgICAgIHZlY1swXSptWzBdICsgdmVjWzFdKm1bNF0gKyB2ZWNbMl0qbVs4XSArIG1bMTJdLFxuICAgICAgICB2ZWNbMF0qbVsxXSArIHZlY1sxXSptWzVdICsgdmVjWzJdKm1bOV0gKyBtWzEzXSxcbiAgICAgICAgdmVjWzBdKm1bMl0gKyB2ZWNbMV0qbVs2XSArIHZlY1syXSptWzEwXSArIG1bMTRdXG4gICAgXTtcbn07XG5cbi8qKiBcbiAqIEFwcGx5IHZpc3VhbCBwZXJzcGVjdGl2ZSBmYWN0b3IgcCB0byB2ZWN0b3IuXG4gKlxuICogQG5hbWUgRmFtb3VzTWF0cml4I2FwcGx5UGVyc3BlY3RpdmVcbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIHtBcnJheS48bnVtYmVyPn0gdmVjIHgseSx6IHZlY3RvciAoYXJyYXkgb2YgZmxvYXRzICYmIGFycmF5Lmxlbmd0aCA9PSAzKVxuICogQHBhcmFtIHtudW1iZXJ9IHAgcGVyc3BlY3RpdmUgZmFjdG9yXG4gKiBAcmV0dXJucyB7QXJyYXkuPG51bWJlcj59IHRoZSByZXN1bHRpbmcgeCx5IHZlY3RvciAoYXJyYXkgb2YgZmxvYXRzIFxuICogICAgJiYgYXJyYXkubGVuZ3RoID09IDIpXG4gKi9cbkZhbW91c01hdHJpeC5hcHBseVBlcnNwZWN0aXZlID0gZnVuY3Rpb24odmVjLCBwKSB7XG4gICAgdmFyIHNjYWxlID0gcC8ocCAtIHZlY1syXSk7XG4gICAgcmV0dXJuIFtzY2FsZSAqIHZlY1swXSwgc2NhbGUgKiB2ZWNbMV1dO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBGYW1vdXNNYXRyaXg7XG4iLCJcbnZhciBGTSA9IHJlcXVpcmUoJy4vT2xkTWF0cml4Jyk7XG5cbi8qKlxuICogQGNvbnN0cnVjdG9yXG4gKi9cbmZ1bmN0aW9uIFF1YXRlcm5pb24odyx4LHkseil7XG4gICAgdGhpcy53ID0gKHcgIT09IHVuZGVmaW5lZCkgPyB3IDogMS4wOyAgLy9BbmdsZVxuICAgIHRoaXMueCA9IHggfHwgMC4wOyAgLy9BeGlzLnhcbiAgICB0aGlzLnkgPSB5IHx8IDAuMDsgIC8vQXhpcy55XG4gICAgdGhpcy56ID0geiB8fCAwLjA7ICAvL0F4aXMueiAgICAgICAgXG4gICAgcmV0dXJuIHRoaXM7XG59O1xuXG5RdWF0ZXJuaW9uLnByb3RvdHlwZS5tYWtlRnJvbUFuZ2xlQW5kQXhpcyA9IGZ1bmN0aW9uKGFuZ2xlLCB2KVxueyAgICAgICAgXG4gICAgdi5ub3JtYWxpemUoKTsgXG4gICAgdmFyIGhhID0gYW5nbGUqMC41OyBcbiAgICB2YXIgcyA9IE1hdGguc2luKGhhKTsgICAgICAgICBcbiAgICB0aGlzLnggPSBzKnYueDsgXG4gICAgdGhpcy55ID0gcyp2Lnk7IFxuICAgIHRoaXMueiA9IHMqdi56OyBcbiAgICB0aGlzLncgPSBNYXRoLmNvcyhoYSk7ICAgICAgICAgXG4gICAgcmV0dXJuIHRoaXM7IFxufTsgICAgIFxuXG5RdWF0ZXJuaW9uLnByb3RvdHlwZS5jbG9uZSA9IGZ1bmN0aW9uKClcbntcbiAgICByZXR1cm4gbmV3IFF1YXRlcm5pb24odGhpcy53LCB0aGlzLngsIHRoaXMueSwgdGhpcy56KTsgXG59OyBcblxuUXVhdGVybmlvbi5wcm90b3R5cGUuc2V0V1hZWiA9IGZ1bmN0aW9uKHcsIHgsIHksIHopXG57XG4gICAgdGhpcy53ID0gdzsgXG4gICAgdGhpcy54ID0geDsgXG4gICAgdGhpcy55ID0geTsgXG4gICAgdGhpcy56ID0gejsgICAgICAgICBcbiAgICByZXR1cm4gdGhpczsgXG59O1xuXG5RdWF0ZXJuaW9uLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbihxKSBcbntcbiAgICB0aGlzLncgPSBxLnc7ICAgIFxuICAgIHRoaXMueCA9IHEueDsgXG4gICAgdGhpcy55ID0gcS55OyBcbiAgICB0aGlzLnogPSBxLno7ICAgICAgICAgXG4gICAgcmV0dXJuIHRoaXM7IFxufTtcblxuUXVhdGVybmlvbi5wcm90b3R5cGUuY2xlYXIgPSBmdW5jdGlvbigpIFxue1xuICAgIHRoaXMudyA9IDEuMDsgXG4gICAgdGhpcy54ID0gMC4wOyBcbiAgICB0aGlzLnkgPSAwLjA7IFxuICAgIHRoaXMueiA9IDAuMDsgXG4gICAgcmV0dXJuIHRoaXM7ICAgICAgICAgXG59O1xuXG5RdWF0ZXJuaW9uLnByb3RvdHlwZS5ub3JtYWxpemUgPSBmdW5jdGlvbigpXG57XG4gICAgdmFyIG5vcm1lID0gTWF0aC5zcXJ0KHRoaXMudyp0aGlzLncgKyB0aGlzLngqdGhpcy54ICsgdGhpcy55KnRoaXMueSArIHRoaXMueip0aGlzLnopOyBcbiAgICBpZiAobm9ybWUgPT0gMC4wKVxuICAgIHtcbiAgICAgICAgdGhpcy53ID0gMS4wOyBcbiAgICAgICAgdGhpcy54ID0gdGhpcy55ID0gdGhpcy56ID0gMC4wOyBcbiAgICB9XG4gICAgZWxzZVxuICAgIHtcbiAgICAgICAgdmFyIHJlY2lwID0gMS4wIC8gbm9ybWU7IFxuICAgICAgICB0aGlzLncgKj0gcmVjaXA7IFxuICAgICAgICB0aGlzLnggKj0gcmVjaXA7IFxuICAgICAgICB0aGlzLnkgKj0gcmVjaXA7IFxuICAgICAgICB0aGlzLnogKj0gcmVjaXA7ICAgICAgICAgICAgIFxuICAgIH1cbiAgICByZXR1cm4gdGhpczsgXG59OyBcblxuUXVhdGVybmlvbi5wcm90b3R5cGUuZ2V0TWF0cml4ID0gZnVuY3Rpb24oKVxue1xuICAgIHRoaXMubm9ybWFsaXplKCk7IFxuICAgIHJldHVybiBbIFxuICAgICAgICAxLjAgLSAyLjAqdGhpcy55KnRoaXMueSAtIDIuMCp0aGlzLnoqdGhpcy56LCBcbiAgICAgICAgMi4wKnRoaXMueCp0aGlzLnkgLSAyLjAqdGhpcy56KnRoaXMudywgXG4gICAgICAgIDIuMCp0aGlzLngqdGhpcy56ICsgMi4wKnRoaXMueSp0aGlzLncsIFxuICAgICAgICAwLjAsXG4gICAgICAgIDIuMCp0aGlzLngqdGhpcy55ICsgMi4wKnRoaXMueip0aGlzLncsIFxuICAgICAgICAxLjAgLSAyLjAqdGhpcy54KnRoaXMueCAtIDIuMCp0aGlzLnoqdGhpcy56LCBcbiAgICAgICAgMi4wKnRoaXMueSp0aGlzLnogLSAyLjAqdGhpcy54KnRoaXMudywgXG4gICAgICAgIDAuMCxcbiAgICAgICAgMi4wKnRoaXMueCp0aGlzLnogLSAyLjAqdGhpcy55KnRoaXMudywgXG4gICAgICAgIDIuMCp0aGlzLnkqdGhpcy56ICsgMi4wKnRoaXMueCp0aGlzLncsIFxuICAgICAgICAxLjAgLSAyLjAqdGhpcy54KnRoaXMueCAtIDIuMCp0aGlzLnkqdGhpcy55LCBcbiAgICAgICAgMC4wLFxuICAgICAgICAwLjAsIFxuICAgICAgICAwLjAsIFxuICAgICAgICAwLjAsIFxuICAgICAgICAxLjAgXTsgXG59OyAgXG5cblF1YXRlcm5pb24ucHJvdG90eXBlLm11bHRpcGx5ID0gZnVuY3Rpb24ocSwgb3V0KSBcbntcbiAgICBvdXQgPSBvdXQgfHwgdGhpcy5yZWdpc3RlcjtcbiAgICBvdXQudyA9IHRoaXMudypxLncgLSB0aGlzLngqcS54IC0gdGhpcy55KnEueSAtIHRoaXMueipxLno7IFxuICAgIG91dC54ID0gdGhpcy53KnEueCArIHRoaXMueCpxLncgKyB0aGlzLnkqcS56IC0gdGhpcy56KnEueTtcbiAgICBvdXQueSA9IHRoaXMudypxLnkgLSB0aGlzLngqcS56ICsgdGhpcy55KnEudyArIHRoaXMueipxLng7XG4gICAgb3V0LnogPSB0aGlzLncqcS56ICsgdGhpcy54KnEueSAtIHRoaXMueSpxLnggKyB0aGlzLnoqcS53IDtcbiAgICByZXR1cm4gb3V0OyBcbn07XG5cblF1YXRlcm5pb24ucHJvdG90eXBlLmlzRXF1YWwgPSBmdW5jdGlvbihxKSBcbntcbiAgICBpZihxLncgPT0gdGhpcy53ICYmIHEueCA9PSB0aGlzLnggJiYgcS55ID09IHRoaXMueSAmJiBxLnogPT0gdGhpcy56KVxuICAgIHtcbiAgICAgICAgcmV0dXJuIHRydWU7IFxuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7IFxufTsgXG5cblF1YXRlcm5pb24ucHJvdG90eXBlLmRvdCA9IGZ1bmN0aW9uKHEpXG57XG4gICAgcmV0dXJuICh0aGlzLncqcS53ICsgdGhpcy54KnEueCArIHRoaXMueSpxLnkgKyB0aGlzLnoqcS56KTsgXG59OyAgICBcblxuUXVhdGVybmlvbi5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24ocSwgb3V0KVxue1xuICAgIG91dCA9IG91dCB8fCB0aGlzLnJlZ2lzdGVyO1xuICAgIG91dC53ID0gdGhpcy53ICsgcS53OyBcbiAgICBvdXQueCA9IHRoaXMueCArIHEueDsgXG4gICAgb3V0LnkgPSB0aGlzLnkgKyBxLnk7IFxuICAgIG91dC56ID0gdGhpcy56ICsgcS56OyBcbiAgICByZXR1cm4gb3V0OyBcbn07IFxuXG5RdWF0ZXJuaW9uLnByb3RvdHlwZS5zdWIgPSBmdW5jdGlvbihxLCBvdXQpXG57XG4gICAgb3V0ID0gb3V0IHx8IHRoaXMucmVnaXN0ZXI7XG4gICAgb3V0LncgPSB0aGlzLncgLSBxLnc7IFxuICAgIG91dC54ID0gdGhpcy54IC0gcS54OyBcbiAgICBvdXQueSA9IHRoaXMueSAtIHEueTsgXG4gICAgb3V0LnogPSB0aGlzLnogLSBxLno7IFxuICAgIHJldHVybiBvdXQ7IFxufTsgXG5cblF1YXRlcm5pb24ucHJvdG90eXBlLm5vcm1TcXVhcmVkID0gZnVuY3Rpb24oKVxue1xuICAgIHJldHVybiB0aGlzLngqdGhpcy54ICsgdGhpcy55KnRoaXMueSArIHRoaXMueip0aGlzLnogKyB0aGlzLncqdGhpcy53OyBcbn07XG5cblF1YXRlcm5pb24ucHJvdG90eXBlLm5vcm0gPSBmdW5jdGlvbigpXG57XG4gICAgcmV0dXJuIE1hdGguc3FydCh0aGlzLm5vcm1TcXVhcmVkKCkpO1xufTtcblxuXG5RdWF0ZXJuaW9uLnByb3RvdHlwZS5jb25qID0gZnVuY3Rpb24ob3V0KVxue1xuICAgIG91dCA9IG91dCB8fCB0aGlzLnJlZ2lzdGVyO1xuICAgIG91dC53ID0gdGhpcy53OyBcbiAgICBvdXQueCA9IC10aGlzLng7IFxuICAgIG91dC55ID0gLXRoaXMueTsgXG4gICAgb3V0LnogPSAtdGhpcy56OyBcbiAgICByZXR1cm4gb3V0OyBcbn07IFxuXG5RdWF0ZXJuaW9uLnByb3RvdHlwZS5pbnZlcnNlID0gZnVuY3Rpb24ob3V0KVxue1xuICAgIG91dCA9IG91dCB8fCB0aGlzLnJlZ2lzdGVyO1xuICAgIHRoaXMuY29uaihvdXQpO1xuICAgIG91dC5zY2FsYXJEaXZpZGUodGhpcy5ub3JtU3F1YXJlZCgpLCBvdXQpO1xuICAgIHJldHVybiBvdXQ7ICBcbn07IFxuXG5RdWF0ZXJuaW9uLnByb3RvdHlwZS5zY2FsYXJEaXZpZGUgPSBmdW5jdGlvbihzLCBvdXQpXG57XG4gICAgb3V0ID0gb3V0IHx8IHRoaXMucmVnaXN0ZXI7ICAgICAgICBcbiAgICBzID0gMS4wIC8gcztcbiAgICBvdXQudyA9IHRoaXMudypzOyBcbiAgICBvdXQueCA9IHRoaXMueCpzOyBcbiAgICBvdXQueSA9IHRoaXMueSpzOyBcbiAgICBvdXQueiA9IHRoaXMueipzOyBcbiAgICByZXR1cm4gb3V0OyBcbn07XG5cblF1YXRlcm5pb24ucHJvdG90eXBlLnNjYWxhck11bHQgPSBmdW5jdGlvbihzLCBvdXQpXG57XG4gICAgb3V0ID0gb3V0IHx8IHRoaXMucmVnaXN0ZXI7ICAgICAgICAgICAgICAgIFxuICAgIG91dC53ID0gdGhpcy53KnM7IFxuICAgIG91dC54ID0gdGhpcy54KnM7IFxuICAgIG91dC55ID0gdGhpcy55KnM7IFxuICAgIG91dC56ID0gdGhpcy56KnM7IFxuICAgIHJldHVybiBvdXQ7ICAgXG59XG5cblF1YXRlcm5pb24ucHJvdG90eXBlLmlzWmVybyA9IGZ1bmN0aW9uKClcbntcbiAgICBpZih0aGlzLnggPT0gMCAmJiB0aGlzLnkgPT0gMCAmJiB0aGlzLnogPT0gMCAmJiB0aGlzLncgPT0gMS4wKVxuICAgIHtcbiAgICAgICAgcmV0dXJuIHRydWU7IFxuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7ICAgICAgICAgXG59OyBcblxuUXVhdGVybmlvbi5wcm90b3R5cGUubmVnYXRlID0gZnVuY3Rpb24oKVxue1xuICAgIHRoaXMudyA9IC10aGlzLnc7IFxuICAgIHRoaXMueCA9IC10aGlzLng7IFxuICAgIHRoaXMueSA9IC10aGlzLnk7IFxuICAgIHRoaXMueiA9IC10aGlzLno7IFxuICAgIHJldHVybiB0aGlzOyBcbn1cblxuUXVhdGVybmlvbi5wcm90b3R5cGUuemVyb1JvdGF0aW9uID0gZnVuY3Rpb24oKVxue1xuICAgIHRoaXMueCA9IDA7IHRoaXMueSA9IDA7IHRoaXMueiA9IDA7IHRoaXMudyA9IDEuMDsgXG4gICAgcmV0dXJuIHRoaXM7IFxufTsgXG5cblF1YXRlcm5pb24ucHJvdG90eXBlLnNsZXJwID0gZnVuY3Rpb24ocSwgdCwgb3V0KVxue1xuICAgIG91dCA9IG91dCB8fCB0aGlzLnJlZ2lzdGVyOyAgICAgICAgICAgICAgICBcbiAgICB2YXIgb21lZ2EsIGNvc29tZWdhLCBzaW5vbWVnYSwgc2NhbGVGcm9tLCBzY2FsZVRvOyBcblxuICAgIHRoaXMudG8uc2V0KHEpO1xuICAgIHRoaXMuZnJvbS5zZXQodGhpcyk7IFxuXG4gICAgY29zb21lZ2EgPSB0aGlzLmRvdChxKTsgXG5cbiAgICBpZihjb3NvbWVnYSA8IDAuMClcbiAgICB7XG4gICAgICAgIGNvc29tZWdhID0gLWNvc29tZWdhOyBcbiAgICAgICAgdGhpcy50by5uZWdhdGUoKTsgICAgICAgICAgICAgXG4gICAgfVxuXG4gICAgaWYoICgxLjAgLSBjb3NvbWVnYSkgPiB0aGlzLmVwc2lsb24gKVxuICAgIHtcbiAgICAgICAgb21lZ2EgPSBNYXRoLmFjb3MoY29zb21lZ2EpOyBcbiAgICAgICAgc2lub21lZ2EgPSBNYXRoLnNpbihvbWVnYSk7XG4gICAgICAgIHNjYWxlRnJvbSA9IE1hdGguc2luKCAoMS4wIC0gdCkgKiBvbWVnYSApIC8gc2lub21lZ2E7IFxuICAgICAgICBzY2FsZVRvID0gTWF0aC5zaW4oIHQgKiBvbWVnYSApIC8gc2lub21lZ2E7ICAgICAgICAgICAgIFxuICAgIH1cbiAgICBlbHNlXG4gICAge1xuICAgICAgICBzY2FsZUZyb20gPSAxLjAgLSB0OyBcbiAgICAgICAgc2NhbGVUbyA9IHQ7IFxuICAgIH1cblxuXG4gICAgdGhpcy5mcm9tLnNjYWxhck11bHQoc2NhbGVGcm9tLCB0aGlzLmZyb20pOyAgICAgICAgXG4gICAgdGhpcy50by5zY2FsYXJNdWx0KHNjYWxlVG8sIHRoaXMudG8pOyAgICAgICAgXG4gICAgdGhpcy5mcm9tLmFkZCh0aGlzLnRvLCBvdXQpOyAgICAgICAgIFxuICAgIHJldHVybiBvdXQ7IFxufVxuXG5RdWF0ZXJuaW9uLnByb3RvdHlwZS5lcHNpbG9uICAgID0gMC4wMDAwMTsgXG5RdWF0ZXJuaW9uLnByb3RvdHlwZS5mcm9tICAgICAgID0gbmV3IFF1YXRlcm5pb24oMCwwLDAsMCk7XG5RdWF0ZXJuaW9uLnByb3RvdHlwZS50byAgICAgICAgID0gbmV3IFF1YXRlcm5pb24oMCwwLDAsMCk7XG5RdWF0ZXJuaW9uLnByb3RvdHlwZS5yZWdpc3RlciAgID0gbmV3IFF1YXRlcm5pb24oMCwwLDAsMCk7XG5RdWF0ZXJuaW9uLnByb3RvdHlwZS56ZXJvICAgICAgID0gbmV3IFF1YXRlcm5pb24oMCwwLDAsMCk7XG5RdWF0ZXJuaW9uLnByb3RvdHlwZS5vbmUgICAgICAgID0gbmV3IFF1YXRlcm5pb24oMSwxLDEsMSk7XG5cbm1vZHVsZS5leHBvcnRzID0gUXVhdGVybmlvbjtcbiIsInZhciBGTSA9IHJlcXVpcmUoJy4vT2xkTWF0cml4Jyk7XG5cbnZhciBVdGlscyA9IHsgICAgICAgICAgICAgICAgXG4gICAgcmFkMmRlZzogZnVuY3Rpb24ocmFkKVxuICAgIHtcbiAgICAgICAgcmV0dXJuIHJhZCAqIDU3LjI5NTc3OTU7IFxuICAgIH0sXG5cbiAgICBkZWcycmFkOiBmdW5jdGlvbihkZWcpXG4gICAge1xuICAgICAgICByZXR1cm4gZGVnICogMC4wMTc0NTMyOTI1OyBcbiAgICB9LFxuXG4gICAgZGlzdGFuY2U6IGZ1bmN0aW9uKHgxLCB5MSwgeDIsIHkyKVxuICAgIHtcbiAgICAgICAgdmFyIGRlbHRhWCA9IHgyIC0geDE7IFxuICAgICAgICB2YXIgZGVsdGFZID0geTIgLSB5MTsgXG4gICAgICAgIHJldHVybiBNYXRoLnNxcnQoZGVsdGFYKmRlbHRhWCArIGRlbHRhWSpkZWx0YVkpOyBcbiAgICB9LFxuXG4gICAgZGlzdGFuY2UzRDogZnVuY3Rpb24oeDEsIHkxLCB6MSwgeDIsIHkyLCB6MilcbiAgICB7XG4gICAgICAgIHZhciBkZWx0YVggPSB4MiAtIHgxOyBcbiAgICAgICAgdmFyIGRlbHRhWSA9IHkyIC0geTE7IFxuICAgICAgICB2YXIgZGVsdGFaID0gejIgLSB6MTsgXG4gICAgICAgIHJldHVybiBNYXRoLnNxcnQoZGVsdGFYKmRlbHRhWCArIGRlbHRhWSpkZWx0YVkgKyBkZWx0YVoqZGVsdGFaKTsgXG4gICAgfSxcblxuICAgIG1hcDogZnVuY3Rpb24odmFsdWUsIGlucHV0TWluLCBpbnB1dE1heCwgb3V0cHV0TWluLCBvdXRwdXRNYXgsIGNsYW1wKVxuICAgIHsgICAgICAgICBcbiAgICAgIHZhciBvdXRWYWx1ZSA9ICgodmFsdWUgLSBpbnB1dE1pbikvKGlucHV0TWF4IC0gaW5wdXRNaW4pKSAqIChvdXRwdXRNYXggLSBvdXRwdXRNaW4pICsgb3V0cHV0TWluOyBcbiAgICAgIGlmKGNsYW1wKVxuICAgICAgeyAgICAgICBcbiAgICAgICAgaWYob3V0cHV0TWF4ID4gb3V0cHV0TWluKVxuICAgICAgICB7XG4gICAgICAgICAgaWYob3V0VmFsdWUgPiBvdXRwdXRNYXgpXG4gICAgICAgICAge1xuICAgICAgICAgICAgb3V0VmFsdWUgPSBvdXRwdXRNYXg7IFxuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlIGlmKG91dFZhbHVlIDwgb3V0cHV0TWluKVxuICAgICAgICAgIHtcbiAgICAgICAgICAgIG91dFZhbHVlID0gb3V0cHV0TWluOyBcbiAgICAgICAgICB9IFxuICAgICAgICB9XG4gICAgICAgIGVsc2VcbiAgICAgICAge1xuICAgICAgICAgIGlmKG91dFZhbHVlIDwgb3V0cHV0TWF4KVxuICAgICAgICAgIHtcbiAgICAgICAgICAgIG91dFZhbHVlID0gb3V0cHV0TWF4OyBcbiAgICAgICAgICB9XG4gICAgICAgICAgZWxzZSBpZihvdXRWYWx1ZSA+IG91dHB1dE1pbilcbiAgICAgICAgICB7XG4gICAgICAgICAgICBvdXRWYWx1ZSA9IG91dHB1dE1pbjsgXG4gICAgICAgICAgfSBcbiAgICAgICAgfSAgICAgICAgIFxuICAgICAgfVxuICAgICAgcmV0dXJuIG91dFZhbHVlOyAgICAgICAgIFxuICAgIH0sXG5cbiAgICBsaW1pdDogZnVuY3Rpb24odmFsdWUsIGxvdywgaGlnaClcbiAgICB7XG4gICAgICAgIHZhbHVlID0gTWF0aC5taW4odmFsdWUsIGhpZ2gpOyBcbiAgICAgICAgdmFsdWUgPSBNYXRoLm1heCh2YWx1ZSwgbG93KTsgXG4gICAgICAgIHJldHVybiB2YWx1ZTsgICAgICAgICAgICAgXG4gICAgfSxcblxuICAgIHBlcnNwZWN0aXZlOiBmdW5jdGlvbihmb3Z5LCBhc3BlY3QsIG5lYXIsIGZhcikgXG4gICAge1xuICAgICAgICB2YXIgb3V0ID0gWzEsIDAsIDAsIDAsIDAsIDEsIDAsIDAsIDAsIDAsIDEsIDAsIDAsIDAsIDAsIDFdO1xuICAgICAgICB2YXIgZiA9IDEuMCAvIE1hdGgudGFuKGZvdnkgLyAyKSxcbiAgICAgICAgbmYgPSAxLjAgLyAobmVhciAtIGZhcik7XG4gICAgICAgIG91dFswXSA9IGYgLyBhc3BlY3Q7XG4gICAgICAgIG91dFsxXSA9IDA7XG4gICAgICAgIG91dFsyXSA9IDA7XG4gICAgICAgIG91dFszXSA9IDA7XG5cbiAgICAgICAgb3V0WzRdID0gMDtcbiAgICAgICAgb3V0WzVdID0gZjtcbiAgICAgICAgb3V0WzZdID0gMDtcbiAgICAgICAgb3V0WzddID0gMDtcbiAgICAgICAgXG4gICAgICAgIG91dFs4XSA9IDA7XG4gICAgICAgIG91dFs5XSA9IDA7XG4gICAgICAgIG91dFsxMF0gPSAoZmFyICsgbmVhcikgKiBuZjtcbiAgICAgICAgb3V0WzExXSA9IC0xO1xuICAgICAgICBcbiAgICAgICAgb3V0WzEyXSA9IDA7XG4gICAgICAgIG91dFsxM10gPSAwO1xuICAgICAgICBvdXRbMTRdID0gKDIgKiBmYXIgKiBuZWFyKSAqIG5mO1xuICAgICAgICBvdXRbMTVdID0gMDtcbiAgICAgICAgcmV0dXJuIG91dDtcbiAgICB9LFxuXG4gICAgb3J0aG86IGZ1bmN0aW9uKGxlZnQsIHJpZ2h0LCBib3R0b20sIHRvcCwgbmVhciwgZmFyKVxuICAgIHtcbiAgICAgICAgdmFyIG91dCA9IFsxLCAwLCAwLCAwLCAwLCAxLCAwLCAwLCAwLCAwLCAxLCAwLCAwLCAwLCAwLCAxXTtcbiAgICAgICAgdmFyIHR4ID0gLShyaWdodCtsZWZ0KS8ocmlnaHQtbGVmdCk7XG4gICAgICAgIHZhciB0eSA9IC0odG9wK2JvdHRvbSkvKHRvcC1ib3R0b20pO1xuICAgICAgICB2YXIgdHogPSAtKGZhcituZWFyKS8oZmFyLW5lYXIpO1xuXG4gICAgICAgIG91dFswXSA9IDIuMC8ocmlnaHQtbGVmdCk7IFxuICAgICAgICBvdXRbMV0gPSAwO1xuICAgICAgICBvdXRbMl0gPSAwO1xuICAgICAgICBvdXRbM10gPSAwO1xuXG4gICAgICAgIG91dFs0XSA9IDA7XG4gICAgICAgIG91dFs1XSA9IDIuMC8odG9wLWJvdHRvbSk7XG4gICAgICAgIG91dFs2XSA9IDA7XG4gICAgICAgIG91dFs3XSA9IDA7XG4gICAgICAgIFxuICAgICAgICBvdXRbOF0gPSAwO1xuICAgICAgICBvdXRbOV0gPSAwO1xuICAgICAgICBvdXRbMTBdID0gLTIuMC8oZmFyLW5lYXIpO1xuICAgICAgICBvdXRbMTFdID0gLTE7XG4gICAgICAgIFxuICAgICAgICBvdXRbMTJdID0gdHg7IFxuICAgICAgICBvdXRbMTNdID0gdHk7XG4gICAgICAgIG91dFsxNF0gPSB0ejtcbiAgICAgICAgb3V0WzE1XSA9IDEuMDtcbiAgICAgICAgcmV0dXJuIG91dDtcbiAgICB9LFxuXG4gICAgbm9ybWFsRnJvbUZNOiBmdW5jdGlvbiAob3V0LCBhKSBcbiAgICB7XG4gICAgICAgIHZhciBhMDAgPSBhWzBdLCBhMDEgPSBhWzFdLCBhMDIgPSBhWzJdLCBhMDMgPSBhWzNdLFxuICAgICAgICBhMTAgPSBhWzRdLCBhMTEgPSBhWzVdLCBhMTIgPSBhWzZdLCBhMTMgPSBhWzddLFxuICAgICAgICBhMjAgPSBhWzhdLCBhMjEgPSBhWzldLCBhMjIgPSBhWzEwXSwgYTIzID0gYVsxMV0sXG4gICAgICAgIGEzMCA9IGFbMTJdLCBhMzEgPSBhWzEzXSwgYTMyID0gYVsxNF0sIGEzMyA9IGFbMTVdLFxuXG4gICAgICAgIGIwMCA9IGEwMCAqIGExMSAtIGEwMSAqIGExMCxcbiAgICAgICAgYjAxID0gYTAwICogYTEyIC0gYTAyICogYTEwLFxuICAgICAgICBiMDIgPSBhMDAgKiBhMTMgLSBhMDMgKiBhMTAsXG4gICAgICAgIGIwMyA9IGEwMSAqIGExMiAtIGEwMiAqIGExMSxcbiAgICAgICAgYjA0ID0gYTAxICogYTEzIC0gYTAzICogYTExLFxuICAgICAgICBiMDUgPSBhMDIgKiBhMTMgLSBhMDMgKiBhMTIsXG4gICAgICAgIGIwNiA9IGEyMCAqIGEzMSAtIGEyMSAqIGEzMCxcbiAgICAgICAgYjA3ID0gYTIwICogYTMyIC0gYTIyICogYTMwLFxuICAgICAgICBiMDggPSBhMjAgKiBhMzMgLSBhMjMgKiBhMzAsXG4gICAgICAgIGIwOSA9IGEyMSAqIGEzMiAtIGEyMiAqIGEzMSxcbiAgICAgICAgYjEwID0gYTIxICogYTMzIC0gYTIzICogYTMxLFxuICAgICAgICBiMTEgPSBhMjIgKiBhMzMgLSBhMjMgKiBhMzIsXG5cbiAgICAgICAgLy8gQ2FsY3VsYXRlIHRoZSBkZXRlcm1pbmFudFxuICAgICAgICBkZXQgPSBiMDAgKiBiMTEgLSBiMDEgKiBiMTAgKyBiMDIgKiBiMDkgKyBiMDMgKiBiMDggLSBiMDQgKiBiMDcgKyBiMDUgKiBiMDY7XG5cbiAgICAgICAgaWYgKCFkZXQpIHsgXG4gICAgICAgICAgICByZXR1cm4gbnVsbDsgXG4gICAgICAgIH1cbiAgICAgICAgZGV0ID0gMS4wIC8gZGV0O1xuXG4gICAgICAgIG91dFswXSA9IChhMTEgKiBiMTEgLSBhMTIgKiBiMTAgKyBhMTMgKiBiMDkpICogZGV0O1xuICAgICAgICBvdXRbMV0gPSAoYTEyICogYjA4IC0gYTEwICogYjExIC0gYTEzICogYjA3KSAqIGRldDtcbiAgICAgICAgb3V0WzJdID0gKGExMCAqIGIxMCAtIGExMSAqIGIwOCArIGExMyAqIGIwNikgKiBkZXQ7XG5cbiAgICAgICAgb3V0WzNdID0gKGEwMiAqIGIxMCAtIGEwMSAqIGIxMSAtIGEwMyAqIGIwOSkgKiBkZXQ7XG4gICAgICAgIG91dFs0XSA9IChhMDAgKiBiMTEgLSBhMDIgKiBiMDggKyBhMDMgKiBiMDcpICogZGV0O1xuICAgICAgICBvdXRbNV0gPSAoYTAxICogYjA4IC0gYTAwICogYjEwIC0gYTAzICogYjA2KSAqIGRldDtcblxuICAgICAgICBvdXRbNl0gPSAoYTMxICogYjA1IC0gYTMyICogYjA0ICsgYTMzICogYjAzKSAqIGRldDtcbiAgICAgICAgb3V0WzddID0gKGEzMiAqIGIwMiAtIGEzMCAqIGIwNSAtIGEzMyAqIGIwMSkgKiBkZXQ7XG4gICAgICAgIG91dFs4XSA9IChhMzAgKiBiMDQgLSBhMzEgKiBiMDIgKyBhMzMgKiBiMDApICogZGV0O1xuXG4gICAgICAgIHJldHVybiBvdXQ7XG4gICAgfSwgXG5cbiAgICBjbGFtcDogZnVuY3Rpb24odiwgbWluLCBtYXgpICAgICAgICBcbiAgICB7XG4gICAgICAgIGlmKHYgPCBtaW4pXG4gICAgICAgIHtcbiAgICAgICAgICAgIHJldHVybiBtaW47IFxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYodiA+IG1heClcbiAgICAgICAge1xuICAgICAgICAgICAgcmV0dXJuIG1heDsgXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHY7IFxuICAgIH0sXG5cbiAgICBjb2xvcjogZnVuY3Rpb24ocmVkLCBncmVlbiwgYmx1ZSwgYWxwaGEpXG4gICAge1xuICAgICAgcmV0dXJuICdyZ2JhKCcrTWF0aC5mbG9vcihyZWQpKycsJytNYXRoLmZsb29yKGdyZWVuKSsnLCcrTWF0aC5mbG9vcihibHVlKSsnLCcrYWxwaGErJyknOyBcbiAgICB9LFxuICAgIFxuICAgIGJhY2tncm91bmRUcmFuc3BhcmVudDogZnVuY3Rpb24oKVxuICAgIHtcbiAgICAgICAgcmV0dXJuIHsnYmFja2dyb3VuZENvbG9yJzogJ3RyYW5zcGFyZW50J307IFxuICAgIH0sXG5cbiAgICBiYWNrZ3JvdW5kQ29sb3I6IGZ1bmN0aW9uKHJlZCwgZ3JlZW4sIGJsdWUsIGFscGhhKVxuICAgIHtcbiAgICAgICAgcmV0dXJuIHsnYmFja2dyb3VuZENvbG9yJzogJ3JnYmEoJytNYXRoLmZsb29yKHJlZCkrJywnK01hdGguZmxvb3IoZ3JlZW4pKycsJytNYXRoLmZsb29yKGJsdWUpKycsJythbHBoYSsnKSd9OyBcbiAgICB9LFxuXG4gICAgYm9yZGVyUmFkaXVzOiBmdW5jdGlvbihyKVxuICAgIHtcbiAgICAgICAgcmV0dXJuIHsnYm9yZGVyUmFkaXVzJzogcisncHgnfTsgXG4gICAgfSxcblxuICAgIGJvcmRlclRvcFdpZHRoOiBmdW5jdGlvbihyKVxuICAgIHtcbiAgICAgICAgcmV0dXJuIHsnYm9yZGVyVG9wV2lkdGgnOiByKydweCd9OyBcbiAgICB9LFxuXG4gICAgYm9yZGVyQm90dG9tV2lkdGg6IGZ1bmN0aW9uKHIpXG4gICAge1xuICAgICAgICByZXR1cm4geydib3JkZXJCb3R0b21XaWR0aCc6IHIrJ3B4J307IFxuICAgIH0sXG5cbiAgICBib3JkZXJMZWZ0V2lkdGg6IGZ1bmN0aW9uKHIpXG4gICAge1xuICAgICAgICByZXR1cm4geydib3JkZXJMZWZ0V2lkdGgnOiByKydweCd9OyBcbiAgICB9LFxuXG4gICAgYm9yZGVyUmlnaHRXaWR0aDogZnVuY3Rpb24ocilcbiAgICB7XG4gICAgICAgIHJldHVybiB7J2JvcmRlclJpZ2h0V2lkdGgnOiByKydweCd9OyBcbiAgICB9LFxuXG4gICAgYm9yZGVyV2lkdGg6IGZ1bmN0aW9uKHNpemUpXG4gICAge1xuICAgICAgICByZXR1cm4geydib3JkZXJXaWR0aCc6IHNpemUrJ3B4J307XG4gICAgfSxcblxuICAgIGJvcmRlckNvbG9yOiBmdW5jdGlvbihyZWQsIGdyZWVuLCBibHVlLCBhbHBoYSlcbiAgICB7XG4gICAgICAgIGlmKGFscGhhID09IDAuMClcbiAgICAgICAge1xuICAgICAgICAgICAgcmV0dXJuIHsnYm9yZGVyQ29sb3InOiAndHJhbnNwYXJlbnQnfTsgXG4gICAgICAgIH1cbiAgICAgICAgZWxzZVxuICAgICAgICB7XG4gICAgICAgICAgICByZXR1cm4geydib3JkZXJDb2xvcic6ICdyZ2JhKCcrTWF0aC5mbG9vcihyZWQpKycsJytNYXRoLmZsb29yKGdyZWVuKSsnLCcrTWF0aC5mbG9vcihibHVlKSsnLCcrYWxwaGErJyknfTsgXG4gICAgICAgIH0gICAgICAgICAgICBcbiAgICB9LFxuXG4gICAgYm9yZGVyVG9wQ29sb3I6IGZ1bmN0aW9uKHJlZCwgZ3JlZW4sIGJsdWUsIGFscGhhKVxuICAgIHtcbiAgICAgICAgaWYoYWxwaGEgPT0gMC4wKVxuICAgICAgICB7XG4gICAgICAgICAgICByZXR1cm4geydib3JkZXJUb3BDb2xvcic6ICd0cmFuc3BhcmVudCd9OyBcbiAgICAgICAgfVxuICAgICAgICBlbHNlXG4gICAgICAgIHtcbiAgICAgICAgICAgIHJldHVybiB7J2JvcmRlclRvcENvbG9yJzogJ3JnYmEoJytNYXRoLmZsb29yKHJlZCkrJywnK01hdGguZmxvb3IoZ3JlZW4pKycsJytNYXRoLmZsb29yKGJsdWUpKycsJythbHBoYSsnKSd9OyBcbiAgICAgICAgfSAgICAgICAgICAgIFxuICAgIH0sXG5cbiAgICBib3JkZXJCb3R0b21Db2xvcjogZnVuY3Rpb24ocmVkLCBncmVlbiwgYmx1ZSwgYWxwaGEpXG4gICAge1xuICAgICAgICBpZihhbHBoYSA9PSAwLjApXG4gICAgICAgIHtcbiAgICAgICAgICAgIHJldHVybiB7J2JvcmRlckJvdHRvbUNvbG9yJzogJ3RyYW5zcGFyZW50J307IFxuICAgICAgICB9XG4gICAgICAgIGVsc2VcbiAgICAgICAge1xuICAgICAgICAgICAgcmV0dXJuIHsnYm9yZGVyQm90dG9tQ29sb3InOiAncmdiYSgnK01hdGguZmxvb3IocmVkKSsnLCcrTWF0aC5mbG9vcihncmVlbikrJywnK01hdGguZmxvb3IoYmx1ZSkrJywnK2FscGhhKycpJ307IFxuICAgICAgICB9ICAgICAgICAgICAgXG4gICAgfSxcblxuICAgIGJvcmRlclJpZ2h0Q29sb3I6IGZ1bmN0aW9uKHJlZCwgZ3JlZW4sIGJsdWUsIGFscGhhKVxuICAgIHtcbiAgICAgICAgaWYoYWxwaGEgPT0gMC4wKVxuICAgICAgICB7XG4gICAgICAgICAgICByZXR1cm4geydib3JkZXJSaWdodENvbG9yJzogJ3RyYW5zcGFyZW50J307IFxuICAgICAgICB9XG4gICAgICAgIGVsc2VcbiAgICAgICAge1xuICAgICAgICAgICAgcmV0dXJuIHsnYm9yZGVyUmlnaHRDb2xvcic6ICdyZ2JhKCcrTWF0aC5mbG9vcihyZWQpKycsJytNYXRoLmZsb29yKGdyZWVuKSsnLCcrTWF0aC5mbG9vcihibHVlKSsnLCcrYWxwaGErJyknfTsgXG4gICAgICAgIH0gICAgICAgICAgICBcbiAgICB9LFxuXG4gICAgYm9yZGVyTGVmdENvbG9yOiBmdW5jdGlvbihyZWQsIGdyZWVuLCBibHVlLCBhbHBoYSlcbiAgICB7XG4gICAgICAgIGlmKGFscGhhID09IDAuMClcbiAgICAgICAge1xuICAgICAgICAgICAgcmV0dXJuIHsnYm9yZGVyTGVmdENvbG9yJzogJ3RyYW5zcGFyZW50J307IFxuICAgICAgICB9XG4gICAgICAgIGVsc2VcbiAgICAgICAge1xuICAgICAgICAgICAgcmV0dXJuIHsnYm9yZGVyTGVmdENvbG9yJzogJ3JnYmEoJytNYXRoLmZsb29yKHJlZCkrJywnK01hdGguZmxvb3IoZ3JlZW4pKycsJytNYXRoLmZsb29yKGJsdWUpKycsJythbHBoYSsnKSd9OyBcbiAgICAgICAgfSAgICAgICAgICAgIFxuICAgIH0sXG5cbiAgICBib3JkZXJTdHlsZTogZnVuY3Rpb24oc3R5bGUpXG4gICAge1xuICAgICAgICByZXR1cm4geydib3JkZXJTdHlsZSc6IHN0eWxlfTtcbiAgICB9LFxuXG4gICAgYm9yZGVyVG9wU3R5bGU6IGZ1bmN0aW9uKHN0eWxlKVxuICAgIHtcbiAgICAgICAgcmV0dXJuIHsnYm9yZGVyVG9wU3R5bGUnOiBzdHlsZX07XG4gICAgfSxcblxuICAgIGJvcmRlckJvdHRvbVN0eWxlOiBmdW5jdGlvbihzdHlsZSlcbiAgICB7XG4gICAgICAgIHJldHVybiB7J2JvcmRlckJvdHRvbVN0eWxlJzogc3R5bGV9O1xuICAgIH0sXG5cbiAgICBib3JkZXJSaWdodFN0eWxlOiBmdW5jdGlvbihzdHlsZSlcbiAgICB7XG4gICAgICAgIHJldHVybiB7J2JvcmRlclJpZ2h0U3R5bGUnOiBzdHlsZX07XG4gICAgfSxcblxuICAgIGJvcmRlckxlZnRTdHlsZTogZnVuY3Rpb24oc3R5bGUpXG4gICAge1xuICAgICAgICByZXR1cm4geydib3JkZXJMZWZ0U3R5bGUnOiBzdHlsZX07XG4gICAgfSxcblxuICAgIGNvbG9ySFNMOiBmdW5jdGlvbihodWUsIHNhdHVyYXRpb24sIGxpZ2h0bmVzcywgYWxwaGEpXG4gICAge1xuICAgICAgICByZXR1cm4gJ2hzbGEoJytNYXRoLmZsb29yKGh1ZSkrJywnK01hdGguZmxvb3Ioc2F0dXJhdGlvbikrJyUsJytNYXRoLmZsb29yKGxpZ2h0bmVzcykrJyUsJythbHBoYSsnKSc7IFxuICAgIH0sXG5cbiAgICBiYWNrZ3JvdW5kVHJhbnNwYXJlbnQ6IGZ1bmN0aW9uKClcbiAgICB7XG4gICAgICAgIHJldHVybiB7J2JhY2tncm91bmRDb2xvcic6ICd0cmFuc3BhcmVudCd9OyAgICAgICAgICAgICBcbiAgICB9LCBcblxuICAgIGJhY2tncm91bmRDb2xvckhTTDogZnVuY3Rpb24oaHVlLCBzYXR1cmF0aW9uLCBsaWdodG5lc3MsIGFscGhhKVxuICAgIHtcbiAgICAgICAgcmV0dXJuIHsnYmFja2dyb3VuZENvbG9yJzogJ2hzbGEoJytNYXRoLmZsb29yKGh1ZSkrJywnK01hdGguZmxvb3Ioc2F0dXJhdGlvbikrJyUsJytNYXRoLmZsb29yKGxpZ2h0bmVzcykrJyUsJythbHBoYSsnKSd9OyBcbiAgICB9LFxuXG4gICAgYmFja2ZhY2VWaXNpYmxlOiBmdW5jdGlvbih2YWx1ZSlcbiAgICB7XG4gICAgICAgIGlmKHZhbHVlKVxuICAgICAgICB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgJ2JhY2tmYWNlLXZpc2liaWxpdHknOid2aXNpYmxlJyxcbiAgICAgICAgICAgICAgICAnLXdlYmtpdC1iYWNrZmFjZS12aXNpYmlsaXR5JzondmlzaWJsZScsXG4gICAgICAgICAgICAgICAgJy1tb3otYmFja2ZhY2UtdmlzaWJpbGl0eSc6J3Zpc2libGUnLFxuICAgICAgICAgICAgICAgICctbXMtYmFja2ZhY2UtdmlzaWJpbGl0eSc6ICd2aXNpYmxlJyxcbiAgICAgICAgICAgIH07IFxuICAgICAgICB9XG4gICAgICAgIGVsc2VcbiAgICAgICAge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICdiYWNrZmFjZS12aXNpYmlsaXR5JzonaGlkZGVuJyxcbiAgICAgICAgICAgICAgICAnLXdlYmtpdC1iYWNrZmFjZS12aXNpYmlsaXR5JzonaGlkZGVuJyxcbiAgICAgICAgICAgICAgICAnLW1vei1iYWNrZmFjZS12aXNpYmlsaXR5JzonaGlkZGVuJyxcbiAgICAgICAgICAgICAgICAnLW1zLWJhY2tmYWNlLXZpc2liaWxpdHknOiAnaGlkZGVuJyxcbiAgICAgICAgICAgIH07IFxuICAgICAgICB9XG4gICAgfSwgXG5cbiAgICBjbGlwQ2lyY2xlOiBmdW5jdGlvbih4LCB5LCByKVxuICAgIHtcbiAgICAgICAgcmV0dXJuIHsnLXdlYmtpdC1jbGlwLXBhdGgnOiAnY2lyY2xlKCcreCsncHgsJyt5KydweCwnK3IrJ3B4KSd9O1xuICAgIH0sICAgICAgICBcblxuICAgIGdldFdpZHRoOiBmdW5jdGlvbigpXG4gICAgeyAgICAgICAgICAgIFxuICAgICAgICByZXR1cm4gd2luZG93LmlubmVyV2lkdGg7IFxuICAgIH0sXG5cbiAgICBnZXRIZWlnaHQ6IGZ1bmN0aW9uKClcbiAgICB7XG4gICAgICAgIHJldHVybiB3aW5kb3cuaW5uZXJIZWlnaHQ7ICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgfSxcblxuICAgIGdldENlbnRlcjogZnVuY3Rpb24oKVxuICAgIHtcbiAgICAgICAgcmV0dXJuIFtVdGlscy5nZXRXaWR0aCgpKi41LCBVdGlscy5nZXRIZWlnaHQoKSouNV07IFxuICAgIH0sXG4gICAgXG4gICAgaXNNb2JpbGU6IGZ1bmN0aW9uKCkgeyBcbiAgICAgICAgaWYoIC9BbmRyb2lkfHdlYk9TfGlQaG9uZXxpUGFkfGlQb2R8QmxhY2tCZXJyeS9pLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCkgKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSBcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0sXG5cbiAgICBpc1N0cmluZzogZnVuY3Rpb24gKG1heWJlU3RyaW5nKSB7XG4gICAgICAgIHJldHVybiAodHlwZW9mIG1heWJlU3RyaW5nID09ICdzdHJpbmcnIHx8IG1heWJlU3RyaW5nIGluc3RhbmNlb2YgU3RyaW5nKSBcbiAgICB9LFxuXG4gICAgaXNBcnJheTogZnVuY3Rpb24gKG1heWJlQXJyYXkpIHtcbiAgICAgICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCggbWF5YmVBcnJheSApID09PSAnW29iamVjdCBBcnJheV0nO1xuICAgIH0sXG5cbiAgICBleHRlbmQ6IGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgICAgZm9yKHZhciBrZXkgaW4gYikgeyBcbiAgICAgICAgICAgIGFba2V5XSA9IGJba2V5XTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYTtcbiAgICB9LFxuXG4gICAgZ2V0RGV2aWNlUGl4ZWxSYXRpbzogZnVuY3Rpb24oKVxuICAgIHtcbiAgICAgICAgcmV0dXJuICh3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbyA/IHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvIDogMSk7IFxuICAgIH0sXG5cbiAgICBzdXBwb3J0c1dlYkdMOiBmdW5jdGlvbigpXG4gICAge1xuICAgICAgICBpZiggL0FuZHJvaWR8Q2hyb21lfE1vemlsbGEvaS50ZXN0KG5hdmlnYXRvci5hcHBDb2RlTmFtZSkgJiYgISF3aW5kb3cuV2ViR0xSZW5kZXJpbmdDb250ZXh0KSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSBcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0sIFxuXG4gICAgZ2V0U3VyZmFjZVBvc2l0aW9uOiBmdW5jdGlvbiBnZXRTdXJmYWNlUG9zaXRpb24oc3VyZmFjZSkge1xuXG4gICAgICAgIHZhciBjdXJyVGFyZ2V0ID0gc3VyZmFjZS5fY3VyclRhcmdldDtcbiAgICAgICAgdmFyIHRyYW5zZm9ybXMgPSBbXTtcbiAgICAgICAgdmFyIHRvdGFsRGlzdCA9IFswLCAwLCAwXTtcblxuICAgICAgICBmdW5jdGlvbiBnZXRBbGxUcmFuc2Zvcm1zICggZWxlbSApIHtcblxuICAgICAgICAgICAgdmFyIHRyYW5zZm9ybSA9IGdldFRyYW5zZm9ybShlbGVtKTtcblxuICAgICAgICAgICAgaWYodHJhbnNmb3JtICE9PSBcIlwiICYmIHRyYW5zZm9ybSAhPT0gdW5kZWZpbmVkICkge1xuICAgICAgICAgICAgICAgIHZhciBvZmZzZXQgPSBwYXJzZVRyYW5zZm9ybSh0cmFuc2Zvcm0pO1xuXG4gICAgICAgICAgICAgICAgdG90YWxEaXN0WzBdICs9IG9mZnNldFswXTtcbiAgICAgICAgICAgICAgICB0b3RhbERpc3RbMV0gKz0gb2Zmc2V0WzFdO1xuICAgICAgICAgICAgICAgIHRvdGFsRGlzdFsyXSArPSBvZmZzZXRbMl07XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmKCBlbGVtLnBhcmVudEVsZW1lbnQgIT09IGRvY3VtZW50LmJvZHkgKSB7XG4gICAgICAgICAgICAgICAgZ2V0QWxsVHJhbnNmb3JtcyhlbGVtLnBhcmVudE5vZGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGZ1bmN0aW9uIHBhcnNlVHJhbnNmb3JtKHRyYW5zZm9ybSkge1xuICAgICAgICAgICAgdmFyIHRyYW5zbGF0ZSA9IFtdOyBcblxuICAgICAgICAgICAgdHJhbnNmb3JtID0gcmVtb3ZlTWF0cml4M2QoIHRyYW5zZm9ybSApO1xuXG4gICAgICAgICAgICB0cmFuc2xhdGVbMF0gPSBwYXJzZUludCh0cmFuc2Zvcm1bMTJdLnJlcGxhY2UoJyAnLCAnJykpOyBcbiAgICAgICAgICAgIHRyYW5zbGF0ZVsxXSA9IHBhcnNlSW50KHRyYW5zZm9ybVsxM10ucmVwbGFjZSgnICcsICcnKSk7ICAgICAgICBcbiAgICAgICAgICAgIHRyYW5zbGF0ZVsyXSA9IHBhcnNlSW50KHRyYW5zZm9ybVsxNF0ucmVwbGFjZSgnICcsICcnKSk7ICAgICAgICBcblxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0cmFuc2xhdGUubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZih0eXBlb2YgdHJhbnNsYXRlW2ldID09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgICAgIHRyYW5zbGF0ZVtpXSA9IDA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmV0dXJuIHRyYW5zbGF0ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIHJlbW92ZU1hdHJpeDNkKCBtdHhTdHJpbmcgKSB7IFxuICAgICAgICAgICAgbXR4U3RyaW5nID0gbXR4U3RyaW5nLnJlcGxhY2UoJ21hdHJpeDNkKCcsJycpO1xuICAgICAgICAgICAgbXR4U3RyaW5nID0gbXR4U3RyaW5nLnJlcGxhY2UoJyknLCcnKTtcbiAgICAgICAgICAgIHJldHVybiBtdHhTdHJpbmcuc3BsaXQoJywnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGdldFRyYW5zZm9ybSggZWxlbSApIHsgXG4gICAgICAgICAgICB2YXIgdHJhbnNmb3JtID0gZWxlbVsnc3R5bGUnXVsnd2Via2l0VHJhbnNmb3JtJ10gfHwgZWxlbVsnc3R5bGUnXVsndHJhbnNmb3JtJ10gO1xuICAgICAgICAgICAgcmV0dXJuIHRyYW5zZm9ybTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKGN1cnJUYXJnZXQpIHtcblxuICAgICAgICAgICAgZ2V0QWxsVHJhbnNmb3JtcyhjdXJyVGFyZ2V0KTtcblxuICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRvdGFsRGlzdDsgXG4gICAgfSxcblxuICAgIC8vIGdldCBjZW50ZXIgZnJvbSBbMCwgMF0gb3JpZ2luXG4gICAgZ2V0Q2VudGVyTWF0cml4OiBmdW5jdGlvbiAoIHBvcywgc2l6ZSwgeikge1xuICAgICAgICBpZih6ID09IHVuZGVmaW5lZCkgeiA9IDA7XG4gICAgICAgIHJldHVybiBGTS50cmFuc2xhdGUoIHBvc1swXSAtIHNpemVbMF0gKiAwLjUsIHBvc1sxXSAtIHNpemVbMV0gKiAwLjUsIHogKTsgXG4gICAgfSxcblxuICAgIGhhc1VzZXJNZWRpYTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiAhIShuYXZpZ2F0b3IuZ2V0VXNlck1lZGlhIHx8IG5hdmlnYXRvci53ZWJraXRHZXRVc2VyTWVkaWEgfHxcbiAgICAgICAgbmF2aWdhdG9yLm1vekdldFVzZXJNZWRpYSB8fCBuYXZpZ2F0b3IubXNHZXRVc2VyTWVkaWEpO1xuICAgIH0sXG5cbiAgICBnZXRVc2VyTWVkaWE6IGZ1bmN0aW9uKClcbiAgICB7XG4gICAgICAgIHJldHVybiBuYXZpZ2F0b3IuZ2V0VXNlck1lZGlhIHx8IG5hdmlnYXRvci53ZWJraXRHZXRVc2VyTWVkaWEgfHxcbiAgICAgICAgbmF2aWdhdG9yLm1vekdldFVzZXJNZWRpYSB8fCBuYXZpZ2F0b3IubXNHZXRVc2VyTWVkaWE7IFxuICAgIH0sIFxuXG4gICAgaXNXZWJraXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICByZXR1cm4gISF3aW5kb3cud2Via2l0VVJMOyBcbiAgICB9XG5cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gVXRpbHM7XG4iLCJ2YXIgU3VyZmFjZSA9IHJlcXVpcmUoJ2ZhbW91cy9zcmMvY29yZS9TdXJmYWNlJyk7XG52YXIgRW5naW5lID0gcmVxdWlyZSgnZmFtb3VzL3NyYy9jb3JlL0VuZ2luZScpO1xudmFyIEFwcFZpZXcgPSByZXF1aXJlKCcuL3ZpZXdzL0FwcHZpZXcnKTtcbnZhciBFYXN5Q2FtZXJhID0gcmVxdWlyZSgnLi9Db21wb25lbnRzL0Vhc3lDYW1lcmEnKTtcbnJlcXVpcmUoJy4vc3R5bGVzJyk7XG5cbnZhciBtYWluQ29udGV4dCA9IEVuZ2luZS5jcmVhdGVDb250ZXh0KCk7XG5tYWluQ29udGV4dC5zZXRQZXJzcGVjdGl2ZSgxMDAwKTtcblxudmFyIGNhbWVyYSA9IG5ldyBFYXN5Q2FtZXJhKCk7XG5cbnZhciBhcHAgPSBuZXcgQXBwVmlldyhFbmdpbmUpO1xubWFpbkNvbnRleHQuYWRkKGFwcCk7XG5cbndpbmRvdy5hcHAgPSBhcHA7XG53aW5kb3cuY29udGV4dCA9IG1haW5Db250ZXh0O1xuIiwidmFyIGNzcyA9IFwiaHRtbCB7XFxuICBiYWNrZ3JvdW5kOiAjZmZmO1xcbn1cXG5cXG4uYmFja2ZhY2VWaXNpYmlsaXR5IHtcXG4gIC13ZWJraXQtYmFja2ZhY2UtdmlzaWJpbGl0eTogdmlzaWJsZTtcXG4gIGJhY2tmYWNlLXZpc2liaWxpdHk6IHZpc2libGU7XFxufVxcblxcbi5zcGhlcmV7XFxuICAgIGJhY2tncm91bmQtaW1hZ2U6IC13ZWJraXQtcmFkaWFsLWdyYWRpZW50KDQwJSA0MCUsIGNpcmNsZSBjb250YWluLCByZ2JhKDUwLDUwLDUwLC40KSAxMCUsIHJnYmEoMTAwLDEwMCwxMDAsLjQpIDEwMCUpO1xcbiAgICBib3JkZXItcmFkaXVzIDogNTAlO1xcbn1cXG5cXG4ucGFydGljbGV7XFxuICAgIGJhY2tncm91bmQ6IHJnYmEoNTAsMjEwLDI1NSwuOSk7XFxuICAgIC13ZWJraXQtYm94LXNoYWRvdzogaW5zZXQgM3B4IDNweCA1cHggMnB4IHJnYmEoMTg3LCAyMTEsIDI1NSwgMC44MCksIDBweCAwcHggNXB4IHJnYmEoMCw1MCwyNTUsLjkpO1xcbiAgICBib3JkZXItcmFkaXVzOiA1MCU7XFxuICAgIGNvbG9yIDogYmxhY2s7XFxuICAgIGZvbnQtc2l6ZTogMjBweDtcXG4gICAgYmFja2ZhY2UtdmlzaWJpbGl0eSA6IHZpc2libGUgIWltcG9ydGFudDtcXG4gICAgLXdlYmtpdC1iYWNrZmFjZS12aXNpYmlsaXR5OiB2aXNpYmxlICFpbXBvcnRhbnQ7XFxufVxcblwiOyAocmVxdWlyZShcIi9Vc2Vycy9taWNoYWVseGlhL0ZhbW91cy9WYW5pbGxhL2N1YmUtd2FsbHMtM2Qvbm9kZV9tb2R1bGVzL2Nzc2lmeVwiKSkoY3NzKTsgbW9kdWxlLmV4cG9ydHMgPSBjc3M7IiwiLy8gbG9hZCBjc3NcbnJlcXVpcmUoJ2ZhbW91cy9zcmMvY29yZS9mYW1vdXMuY3NzJyk7XG5yZXF1aXJlKCcuL2FwcC5jc3MnKTtcbiIsInZhciBWaWV3ID0gcmVxdWlyZSgnZmFtb3VzL3NyYy9jb3JlL1ZpZXcnKTtcbnZhciBNb2RpZmllciAgICAgICA9IHJlcXVpcmUoJ2ZhbW91cy9zcmMvY29yZS9Nb2RpZmllcicpO1xudmFyIFN1cmZhY2UgPSByZXF1aXJlKCdmYW1vdXMvc3JjL2NvcmUvU3VyZmFjZScpO1xudmFyIFJlcHVsc2lvbkZvcmNlID0gcmVxdWlyZSgnZmFtb3VzL3NyYy9waHlzaWNzL2ZvcmNlcy9SZXB1bHNpb24nKTtcbnZhciBUcmFuc2Zvcm0gPSByZXF1aXJlKCdmYW1vdXMvc3JjL2NvcmUvVHJhbnNmb3JtJyk7XG52YXIgU3RhdGVNb2RpZmllciA9IHJlcXVpcmUoJ2ZhbW91cy9zcmMvbW9kaWZpZXJzL1N0YXRlTW9kaWZpZXInKTtcbnZhciBUcmFuc2l0aW9uYWJsZSA9IHJlcXVpcmUoJ2ZhbW91cy9zcmMvdHJhbnNpdGlvbnMvVHJhbnNpdGlvbmFibGUnKTtcbnZhciBXYWxscyA9IHJlcXVpcmUoJ2ZhbW91cy9zcmMvcGh5c2ljcy9jb25zdHJhaW50cy9XYWxscycpO1xudmFyIENvbGxpc2lvbiA9IHJlcXVpcmUoJ2ZhbW91cy9zcmMvcGh5c2ljcy9jb25zdHJhaW50cy9Db2xsaXNpb24nKTtcbnZhciBWZWN0b3JGaWVsZCA9IHJlcXVpcmUoJ2ZhbW91cy9zcmMvcGh5c2ljcy9mb3JjZXMvVmVjdG9yRmllbGQnKTtcbnZhciBWZWN0b3IgPSByZXF1aXJlKCdmYW1vdXMvc3JjL21hdGgvVmVjdG9yJyk7XG5cbnZhciBEcmFnID0gcmVxdWlyZSgnZmFtb3VzL3NyYy9waHlzaWNzL2ZvcmNlcy9EcmFnJyk7XG52YXIgUGFydGljbGUgPSByZXF1aXJlKCdmYW1vdXMvc3JjL3BoeXNpY3MvYm9kaWVzL1BhcnRpY2xlJyk7XG52YXIgQ2lyY2xlID0gcmVxdWlyZSgnZmFtb3VzL3NyYy9waHlzaWNzL2JvZGllcy9DaXJjbGUnKTtcbnZhciBDdWJpY1ZpZXcgPSByZXF1aXJlKCcuL0N1YmljVmlldycpO1xudmFyIFBoeXNpY3NFbmdpbmUgPSByZXF1aXJlKCdmYW1vdXMvc3JjL3BoeXNpY3MvUGh5c2ljc0VuZ2luZScpO1xudmFyIE1vdXNlU3luYyAgICAgPSByZXF1aXJlKCdmYW1vdXMvc3JjL2lucHV0cy9Nb3VzZVN5bmMnKTtcbnZhciBUb3VjaFN5bmMgICAgID0gcmVxdWlyZSgnZmFtb3VzL3NyYy9pbnB1dHMvVG91Y2hTeW5jJyk7XG52YXIgU2Nyb2xsU3luYyAgICA9IHJlcXVpcmUoJ2ZhbW91cy9zcmMvaW5wdXRzL1Njcm9sbFN5bmMnKTtcbnZhciBHZW5lcmljU3luYyAgID0gcmVxdWlyZSgnZmFtb3VzL3NyYy9pbnB1dHMvR2VuZXJpY1N5bmMnKTtcblxuR2VuZXJpY1N5bmMucmVnaXN0ZXIoe1xuICAgIFwibW91c2VcIiAgOiBNb3VzZVN5bmMsXG4gICAgXCJ0b3VjaFwiICA6IFRvdWNoU3luYyxcbiAgICBcInNjcm9sbFwiIDogU2Nyb2xsU3luY1xufSk7XG5cbmZ1bmN0aW9uIEFwcFZpZXcoRW5naW5lKSB7XG4gICAgVmlldy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXG4gICAgdGhpcy5zeW5jID0gbmV3IEdlbmVyaWNTeW5jKHtcbiAgICAgICAgXCJtb3VzZVwiICA6IHt9LFxuICAgICAgICBcInRvdWNoXCIgIDoge30sXG4gICAgICAgIFwic2Nyb2xsXCIgOiB7c2NhbGUgOiAuNX1cbiAgICB9KTtcbiAgICBcbiAgICB0aGlzLl9waHlzaWNzRW5naW5lID0gbmV3IFBoeXNpY3NFbmdpbmUoKTtcblxuICAgIHRoaXMuX3JvdGF0aW9uVHJhbnNpdGlvbmFibGUgPSBuZXcgVHJhbnNpdGlvbmFibGUoWzAsIDAsIDBdKVxuXG4gICAgdGhpcy5fcm90YXRpb25Nb2RpZmllciA9IG5ldyBNb2RpZmllcih7XG4gICAgICAgIG9yaWdpbjogWzAuNSwgMC41XSxcbiAgICAgICAgYWxpZ246IFswLjUsIDAuNV0sXG4gICAgICAgIHRyYW5zZm9ybTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gVHJhbnNmb3JtLnJvdGF0ZS5hcHBseSh0aGlzLCB0aGlzLl9yb3RhdGlvblRyYW5zaXRpb25hYmxlLmdldCgpKTtcbiAgICAgICAgfS5iaW5kKHRoaXMpXG4gICAgfSk7XG5cbiAgICB0aGlzLl9yb290Tm9kZSA9IHRoaXMuYWRkKHRoaXMuX3JvdGF0aW9uTW9kaWZpZXIpO1xuXG4gICAgX2NyZWF0ZUJhY2tncm91bmQuY2FsbCh0aGlzKTtcbiAgICBfY3JlYXRlQ3ViZS5jYWxsKHRoaXMpO1xuICAgIFxuICAgIC8vbXVzdCBjcmVhdGUgaW4gdGhpcyBvcmRlciBmb3IgYW5jaG9yIHRvIHNpdCBvdXRzaWRlIG9mIHRoZSB3YWxscy4uLlxuICAgIF9jcmVhdGVTcGhlcmVzLmNhbGwodGhpcyk7XG4gICAgX2NyZWF0ZVdhbGxzLmNhbGwodGhpcyk7XG4gICAgX2NyZWF0ZUFuY2hvci5jYWxsKHRoaXMpO1xuXG4gICAgX2JpbmRFdmVudHMuY2FsbCh0aGlzKTtcblxuICAgIHZhciByb3RhdGVBbmdsZSA9IE1hdGguUEkvMTAwO1xuICAgIGlmIChyb3RhdGVBbmdsZSl7XG4gICAgICAgIHZhciBhbmdsZSA9IDBcbiAgICAgICAgRW5naW5lLm9uKCdwcmVyZW5kZXInLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgYW5nbGUgKz0gcm90YXRlQW5nbGU7XG4gICAgICAgICAgICB0aGlzLl93YWxscy5yb3RhdGVaKHJvdGF0ZUFuZ2xlKTtcbiAgICAgICAgICAgIHZhciBvbGRfcm90YXRpb24gPSB0aGlzLl9yb3RhdGlvblRyYW5zaXRpb25hYmxlLmdldCgpO1xuICAgICAgICAgICAgb2xkX3JvdGF0aW9uWzJdICs9IHJvdGF0ZUFuZ2xlO1xuICAgICAgICAgICAgLy8gLnNldFRyYW5zZm9ybShNYXRyaXgucm90YXRlWihhbmdsZSkpO1xuICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgIH07XG59XG5cbkFwcFZpZXcucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShWaWV3LnByb3RvdHlwZSk7XG5BcHBWaWV3LnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEFwcFZpZXc7XG5cbkFwcFZpZXcuREVGQVVMVF9PUFRJT05TID0ge307XG5cbmZ1bmN0aW9uIF9jcmVhdGVDdWJlKCkge1xuICAgIHRoaXMuZWRnZUxlbmd0aCA9IHdpbmRvdy5pbm5lcldpZHRoIDwgd2luZG93LmlubmVySGVpZ2h0ID8gd2luZG93LmlubmVyV2lkdGggKiAwLjUgOiB3aW5kb3cuaW5uZXJIZWlnaHQgKiAwLjU7XG4gICAgdmFyIGN1YmUgPSBuZXcgQ3ViaWNWaWV3KHtcbiAgICAgICAgZWRnZUxlbmd0aDogdGhpcy5lZGdlTGVuZ3RoXG4gICAgfSk7XG4gICAgY3ViZS5waXBlKHRoaXMuc3luYyk7XG4gICAgdGhpcy5fcm9vdE5vZGUuYWRkKGN1YmUpO1xufVxuXG5mdW5jdGlvbiBfY3JlYXRlQW5jaG9yKCkge1xuICAgIHRoaXMuX2FuY2hvclBhcnRpY2xlID0gbmV3IENpcmNsZSh7XG4gICAgICByYWRpdXM6IDBcbiAgICB9KTtcblxuICAgIHRoaXMuX2FuY2hvclBhcnRpY2xlLnNldFBvc2l0aW9uKFsyNTAsIDI1MCwgMF0pXG5cbiAgICB2YXIgYW5jaG9yTW9kaWZpZXIgPSBuZXcgTW9kaWZpZXIoe1xuICAgICAgICBvcmlnaW46IFswLjUsIDAuNV0sXG4gICAgICAgIGFsaWduOiBbMC41LCAwLjVdLFxuICAgICAgICB0cmFuc2Zvcm0gOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9hbmNob3JQYXJ0aWNsZS5nZXRUcmFuc2Zvcm0oKTtcbiAgICAgICAgfS5iaW5kKHRoaXMpXG4gICAgfSk7XG5cbiAgICB2YXIgYW5jaG9yID0gbmV3IFN1cmZhY2Uoe1xuICAgICAgc2l6ZTogWzUwLCA1MF0sXG4gICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgIGJhY2tncm91bmRDb2xvcjogJ3JlZCdcbiAgICAgIH1cbiAgICB9KTtcbiAgICB0aGlzLl9waHlzaWNzRW5naW5lLmFkZEJvZHkodGhpcy5fYW5jaG9yUGFydGljbGUpO1xuXG4gICAgdmFyIGdyYXZpdHkgPSBuZXcgUmVwdWxzaW9uRm9yY2Uoe1xuICAgICAgICBzdHJlbmd0aDogLTUwXG4gICAgfSk7XG5cbiAgICB0aGlzLl9waHlzaWNzRW5naW5lLmF0dGFjaChncmF2aXR5LCB0aGlzLl9zcGhlcmVzLCB0aGlzLl9hbmNob3JQYXJ0aWNsZSk7XG5cbiAgICB0aGlzLmFkZChhbmNob3JNb2RpZmllcikuYWRkKGFuY2hvcik7XG59XG5cbmZ1bmN0aW9uIF9jcmVhdGVXYWxscygpIHtcbiAgICB0aGlzLl93YWxscyA9IG5ldyBXYWxscyh7XG4gICAgICAgIHJlc3RpdHV0aW9uIDogMC41LFxuICAgICAgICBzaXplIDogW3RoaXMuZWRnZUxlbmd0aCwgdGhpcy5lZGdlTGVuZ3RoLCB0aGlzLmVkZ2VMZW5ndGhdLFxuICAgICAgICBvcmlnaW4gOiBbMC41LCAwLjUsIDAuNV0sXG4gICAgICAgIGsgOiAwLjUsXG4gICAgICAgIGRyaWZ0IDogMC41LFxuICAgICAgICBzbG9wIDogMCxcbiAgICAgICAgc2lkZXMgOiBXYWxscy5TSURFUy5USFJFRV9ESU1FTlNJT05BTCxcbiAgICAgICAgb25Db250YWN0IDogV2FsbHMuT05fQ09OVEFDVC5SRUZMRUNUXG4gICAgfSk7XG4gICAgXG4gICAgdGhpcy5fd2FsbHMub3B0aW9ucy5zaWRlcyA9IHRoaXMuX3dhbGxzLmNvbXBvbmVudHM7IC8vIFBhdGNoIGZvciBidWcgaW4gV2FsbHMgbW9kdWxlLlxuICAgIHRoaXMuX3dhbGxzLnNpZGVzID0gdGhpcy5fd2FsbHMuY29tcG9uZW50czsgICAgICAgICAvLyBQYXRjaCBmb3IgYnVnIGluIFdhbGxzIG1vZHVsZS5cbiAgICBcbiAgICAvLyB0aGlzLl9waHlzaWNzRW5naW5lLmF0dGFjaChbdGhpcy5fd2FsbHMsIGRyYWddKTtcbiAgICB0aGlzLl9waHlzaWNzRW5naW5lLmF0dGFjaCh0aGlzLl93YWxscywgdGhpcy5fc3BoZXJlcyk7XG59XG5cbmZ1bmN0aW9uICBfY3JlYXRlU3BoZXJlcygpIHtcbiAgICBcbiAgICB0aGlzLnNwaGVyZXMgPSBbXTtcbiAgICBmb3IodmFyIGk9MDsgaTwxMDsgaSsrKSB7XG4gICAgICAgIHZhciBzcGhlcmUgPSBfY3JlYXRlU3BoZXJlKCk7XG4gICAgICAgIHRoaXMuYWRkKHNwaGVyZS5tb2RpZmllcikuYWRkKHNwaGVyZS5zdXJmYWNlKTtcbiAgICAgICAgdGhpcy5fcGh5c2ljc0VuZ2luZS5hZGRCb2R5KHNwaGVyZS5jaXJjbGUpO1xuICAgICAgICB0aGlzLnNwaGVyZXMucHVzaChzcGhlcmUuY2lyY2xlKTtcbiAgICAgICAgXG4gICAgICAgIC8vIHZhciBzcGhlcmVSID0gMjA7XG4gICAgICAgIC8vIHZhciBzcGhlcmVTdXJmYWNlID0gbmV3IFN1cmZhY2Uoe1xuICAgICAgICAvLyAgICAgc2l6ZTogWzIqc3BoZXJlUiwgMipzcGhlcmVSXSxcbiAgICAgICAgLy8gICAgIGNsYXNzZXM6IFsncGFydGljbGUnXSxcbiAgICAgICAgLy8gICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgLy8gICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICdibHVlJ1xuICAgICAgICAvLyAgICAgfVxuICAgICAgICAvLyB9KTtcblxuICAgICAgICAvLyB2YXIgc3BoZXJlUGFydGljbGUgPSBuZXcgQ2lyY2xlKHtcbiAgICAgICAgLy8gICByYWRpdXM6IDI1XG4gICAgICAgIC8vIH0pO1xuICAgICAgICBcbiAgICAgICAgLy8gdmFyIHNwaGVyZU1vZGlmaWVyID0gbmV3IE1vZGlmaWVyKHtcbiAgICAgICAgLy8gICAgIHNpemU6IFsyKnNwaGVyZVIsIDIqc3BoZXJlUl0sXG4gICAgICAgIC8vICAgICBhbGlnbjogWzAuNSwgMC41XSxcbiAgICAgICAgLy8gICAgIG9yaWdpbjogWzAuNSwgMC41XSxcbiAgICAgICAgLy8gICAgIHRyYW5zZm9ybTogZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vICAgICAgICAgcmV0dXJuIHNwaGVyZVBhcnRpY2xlLmdldFRyYW5zZm9ybSgpO1xuICAgICAgICAvLyAgICAgfVxuICAgICAgICAvLyB9KTtcblxuICAgICAgICAvLyB0aGlzLl9waHlzaWNzRW5naW5lLmFkZEJvZHkoc3BoZXJlUGFydGljbGUpO1xuICAgICAgICAvLyB0aGlzLnNwaGVyZXMucHVzaChzcGhlcmVQYXJ0aWNsZSk7XG4gICAgICAgIC8vIHNwaGVyZVBhcnRpY2xlLnNldFZlbG9jaXR5KDAuMiwgMCwgMCk7XG4gICAgICAgIC8vIHRoaXMuX3Jvb3ROb2RlLmFkZChzcGhlcmVNb2RpZmllcikuYWRkKHNwaGVyZVN1cmZhY2UpO1xuXG4gICAgICAgIFxuICAgIH1cblxufVxuXG5mdW5jdGlvbiBfY3JlYXRlU3BoZXJlKCkge1xuXG4gICAgdmFyIHNpemUgPSBNYXRoLnJhbmRvbSgpICogMjA7XG4gICAgdmFyIGNpcmNsZSA9IG5ldyBDaXJjbGUoe1xuICAgICAgcmFkaXVzOiAyICogc2l6ZVxuICAgIH0pO1xuXG4gICAgLy8gY2lyY2xlLmFwcGx5Rm9yY2UobmV3IFZlY3RvcihNYXRoLnJhbmRvbSgpICogMSwgTWF0aC5yYW5kb20oKSAqIDEsIE1hdGgucmFuZG9tKCkgKiAxKSk7XG5cbiAgICB2YXIgc3VyZmFjZSA9IG5ldyBTdXJmYWNlKHtcbiAgICAgIHNpemU6IFtzaXplLCBzaXplXSxcbiAgICAgIGNsYXNzZXM6IFsncGFydGljbGUnXSxcbiAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgYmFja2dyb3VuZENvbG9yIDogJ2JsdWUnXG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB2YXIgbW9kaWZpZXIgPSBuZXcgTW9kaWZpZXIoe1xuICAgICAgYWxpZ246IFswLjUsIDAuNV0sXG4gICAgICBvcmlnaW46IFswLjUsIDAuNV0sXG5cbiAgICAgIHRyYW5zZm9ybTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBjaXJjbGUuZ2V0VHJhbnNmb3JtKCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgY2lyY2xlOiBjaXJjbGUsXG4gICAgICBtb2RpZmllcjogbW9kaWZpZXIsXG4gICAgICBzdXJmYWNlOiBzdXJmYWNlXG4gICAgfTtcbn1cblxuZnVuY3Rpb24gX2NyZWF0ZUJhY2tncm91bmQoKSB7XG4gICAgdGhpcy5fYmFja2dyb3VuZFN1cmZhY2UgPSBuZXcgU3VyZmFjZSh7XG4gICAgICAgIHNpemU6IFt1bmRlZmluZWQsIHVuZGVmaW5lZF1cbiAgICB9KVxuICAgIHRoaXMuX2JhY2tncm91bmRTdXJmYWNlLnBpcGUodGhpcy5zeW5jKTtcbiAgICB0aGlzLmFkZCh0aGlzLl9iYWNrZ3JvdW5kU3VyZmFjZSk7XG59XG5cbmZ1bmN0aW9uIF9iaW5kRXZlbnRzKCkge1xuICAgIHRoaXMuc3luYy5vbignc3RhcnQnLCBmdW5jdGlvbihkYXRhKXtcbiAgICAgICAgY29uc29sZS5sb2coJ3N0YXJ0JywgZGF0YSk7XG4gICAgfSk7XG5cbiAgICB0aGlzLnN5bmMub24oJ3VwZGF0ZScsIGZ1bmN0aW9uKGRhdGEpe1xuICAgICAgICB2YXIgZFggPSBkYXRhLmRlbHRhWzBdO1xuICAgICAgICB2YXIgZFkgPSBkYXRhLmRlbHRhWzFdO1xuXG4gICAgICAgIHZhciBvbGRfcm90YXRpb24gPSB0aGlzLl9yb3RhdGlvblRyYW5zaXRpb25hYmxlLmdldCgpO1xuICAgICAgICBcbiAgICAgICAgb2xkX3JvdGF0aW9uWzBdICs9IC1kWS8xMDA7XG4gICAgICAgIHRoaXMuX3dhbGxzLnJvdGF0ZVgoLWRZLzEwMCk7XG4gICAgICAgIG9sZF9yb3RhdGlvblsxXSArPSBkWC8xMDA7XG4gICAgICAgIHRoaXMuX3dhbGxzLnJvdGF0ZVkoZFgvMTAwKTtcbiAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgdGhpcy5zeW5jLm9uKCdlbmQnLCBmdW5jdGlvbihkYXRhKXtcbiAgICAgICAgY29uc29sZS5sb2coJ2VuZCcsIGRhdGEpO1xuICAgIH0pO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEFwcFZpZXc7XG4iLCJ2YXIgVmlldyAgICAgICAgICAgPSByZXF1aXJlKCdmYW1vdXMvc3JjL2NvcmUvVmlldycpO1xudmFyIFN1cmZhY2UgICAgICAgID0gcmVxdWlyZSgnZmFtb3VzL3NyYy9jb3JlL1N1cmZhY2UnKTtcbnZhciBUcmFuc2Zvcm0gICAgICA9IHJlcXVpcmUoJ2ZhbW91cy9zcmMvY29yZS9UcmFuc2Zvcm0nKTtcbnZhciBNb2RpZmllciAgICAgICA9IHJlcXVpcmUoJ2ZhbW91cy9zcmMvY29yZS9Nb2RpZmllcicpO1xudmFyIFRyYW5zaXRpb25hYmxlID0gcmVxdWlyZSgnZmFtb3VzL3NyYy90cmFuc2l0aW9ucy9UcmFuc2l0aW9uYWJsZScpO1xudmFyIFN0YXRlTW9kaWZpZXIgID0gcmVxdWlyZSgnZmFtb3VzL3NyYy9tb2RpZmllcnMvU3RhdGVNb2RpZmllcicpO1xudmFyIEVhc2luZyAgICAgICAgID0gcmVxdWlyZSgnZmFtb3VzL3NyYy90cmFuc2l0aW9ucy9FYXNpbmcnKTtcbnZhciBFdmVudEhhbmRsZXIgICA9IHJlcXVpcmUoJ2ZhbW91cy9zcmMvY29yZS9FdmVudEhhbmRsZXInKTtcblxudmFyIE5JTkVUWV9ERUdSRVNTID0gTWF0aC5QSS8yO1xuXG52YXIgRkFDRV9ST1RBVElPTlMgPSBbXG4gICAgWzAsIDAsIDBdLCAgICAgICAgICAgICAgICAgICAgLy9GUk9OVFxuICAgIFstTklORVRZX0RFR1JFU1MsIDAsIDBdLCAgICAgIC8vTEVGVFxuICAgIFtOSU5FVFlfREVHUkVTUywgMCwgMF0sICAgICAgIC8vUklHSFRcbiAgICBbMCwgLU5JTkVUWV9ERUdSRVNTLCAwXSwgICAgICAvL0JPVFRPTVxuICAgIFswLCBOSU5FVFlfREVHUkVTUywgMF0sICAgICAgIC8vVE9QIFxuICAgIFsyICogTklORVRZX0RFR1JFU1MsIDAsIDBdLCAgIC8vQkFDSyAgXG5dXG5cbmZ1bmN0aW9uIEN1YmljVmlldygpIHtcbiAgICBWaWV3LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cbiAgICB0aGlzLl9jdWJlUm90YXRpb25TdGF0ZSA9IG5ldyBUcmFuc2l0aW9uYWJsZShbMCwgMCwgMF0pO1xuICAgIHRoaXMuX2N1YmVUcmFuc2xhdGlvblN0YXRlID0gbmV3IFRyYW5zaXRpb25hYmxlKFswLCAwLCAwXSk7XG5cbiAgICB0aGlzLl9mYWNlcyA9IFtdO1xuXG4gICAgdGhpcy5fcm90YXRpb25Nb2RpZmllciA9IG5ldyBNb2RpZmllcih7XG4gICAgICAgIC8vIGFsaWduOiBbMC41LCAwLjVdLFxuICAgICAgICAvLyBvcmlnaW46IFswLjUsIDAuNV0sXG4gICAgICAgIHRyYW5zZm9ybTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgc3RhdGUgPSB0aGlzLl9jdWJlUm90YXRpb25TdGF0ZS5nZXQoKTtcbiAgICAgICAgICAgIC8vIHJldHVybiBUcmFuc2Zvcm0ucm90YXRlKHN0YXRlWzBdLCBzdGF0ZVsxXSwgc3RhdGVbMl0pO1xuICAgICAgICAgICAgcmV0dXJuIFRyYW5zZm9ybS5yb3RhdGUuYXBwbHkodGhpcywgc3RhdGUpO1xuICAgICAgICB9LmJpbmQodGhpcylcbiAgICB9KTtcblxuICAgIHRoaXMuX3RyYW5zbGF0aW9uTW9kaWZpZXIgPSBuZXcgTW9kaWZpZXIoe1xuICAgICAgICB0cmFuc2Zvcm0gOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgc3RhdGUgPSB0aGlzLl9jdWJlVHJhbnNsYXRpb25TdGF0ZS5nZXQoKTtcbiAgICAgICAgICAgIHJldHVybiBUcmFuc2Zvcm0udHJhbnNsYXRlLmFwcGx5KHRoaXMsIHN0YXRlKTtcbiAgICAgICAgfS5iaW5kKHRoaXMpXG4gICAgfSlcblxuICAgIHRoaXMuX3Jvb3ROb2RlID0gdGhpcy5hZGQodGhpcy5fdHJhbnNsYXRpb25Nb2RpZmllcikuYWRkKHRoaXMuX3JvdGF0aW9uTW9kaWZpZXIpO1xuICAgIFxuICAgIF9jcmVhdGVDdWJlLmNhbGwodGhpcyk7XG59XG5cbkN1YmljVmlldy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFZpZXcucHJvdG90eXBlKTtcbkN1YmljVmlldy5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBDdWJpY1ZpZXc7XG5cbkN1YmljVmlldy5ERUZBVUxUX09QVElPTlMgPSB7XG4gICAgZWRnZUxlbmd0aCA6IDUwLFxuICAgIHRyYW5zbGF0aW9uIDogMjVcbn07XG5cbmZ1bmN0aW9uIF9jcmVhdGVDdWJlKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBmb3IodmFyIGk9MDsgaTxGQUNFX1JPVEFUSU9OUy5sZW5ndGg7IGkrKyl7XG4gICAgICAgIFxuICAgICAgICB2YXIgZmFjZSA9IF9jcmVhdGVGYWNlLmNhbGwodGhpcywgaSk7XG4gICAgICAgIHZhciBmYWNlTW9kaWZpZXIgPSBuZXcgTW9kaWZpZXIoe1xuICAgICAgICAgICAgb3BhY2l0eTogMC41LFxuICAgICAgICAgICAgdHJhbnNmb3JtOiBUcmFuc2Zvcm0ubXVsdGlwbHkoXG4gICAgICAgICAgICAgICAgVHJhbnNmb3JtLnJvdGF0ZS5hcHBseShzZWxmLCBGQUNFX1JPVEFUSU9OU1tpXSksXG4gICAgICAgICAgICAgICAgVHJhbnNmb3JtLnRyYW5zbGF0ZSgwLCAwLCB0aGlzLm9wdGlvbnMuZWRnZUxlbmd0aCAqIDAuNSlcbiAgICAgICAgICAgIClcbiAgICAgICAgfSk7XG5cbiAgICAgICAgc2VsZi5fZmFjZXMucHVzaChmYWNlKTtcbiAgICAgICAgc2VsZi5fcm9vdE5vZGUuYWRkKGZhY2VNb2RpZmllcikuYWRkKGZhY2UpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gX2NyZWF0ZUZhY2UoaW5kZXgpIHtcbiAgICB2YXIgZmFjZSA9IG5ldyBTdXJmYWNlKHtcbiAgICAgIGNvbnRlbnQ6ICcnLFxuICAgICAgY2xhc3NlczogWydiYWNrZmFjZVZpc2liaWxpdHknXSxcbiAgICAgIHNpemU6IFt0aGlzLm9wdGlvbnMuZWRnZUxlbmd0aCwgdGhpcy5vcHRpb25zLmVkZ2VMZW5ndGhdLFxuICAgICAgcHJvcGVydGllczoge1xuICAgICAgICB0ZXh0QWxpZ246ICdjZW50ZXInLFxuICAgICAgICBsaW5lSGVpZ2h0OiAnNzBweCcsXG4gICAgICAgIGZvbnRTaXplOiAnMzVweCcsXG4gICAgICAgIGJvcmRlcjogJzJweCBzb2xpZCBibGFjaycsXG4gICAgICAgIGJhY2tncm91bmRDb2xvcjogJ2hzbCgnICsgKGluZGV4ICogMjAgKyAxMjApICsgJywgMTAwJSwgMzAlKSdcbiAgICAgIH1cbiAgICB9KTtcbiAgICBmYWNlLnBpcGUodGhpcy5fZXZlbnRPdXRwdXQpO1xuICAgIHJldHVybiBmYWNlO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEN1YmljVmlldztcbiJdfQ==
