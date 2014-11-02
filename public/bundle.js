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
var css = "html {\n  background : rgba(50,50,50,1)\n}\n\n.particle{\n    background: rgba(50,210,255,.9);\n    -webkit-box-shadow: inset 3px 3px 5px 2px rgba(187, 211, 255, 0.80), 0px 0px 5px rgba(0,50,255,.9);\n    border-radius: 50%;\n    color : black;\n    font-size: 20px;\n    backface-visibility : visible !important;\n    -webkit-backface-visibility: visible !important;\n}\n\n.rectangle{\n    background: rgba(50,210,255,.9);\n    color : black;\n    font-size: 40px;\n    text-align: center;\n    line-height: 100px;\n}\n\n.backface{\n    backface-visibility : visible !important;\n    -webkit-backface-visibility: visible !important;\n}\n\n.color1{\n    background: rgba(229, 55, 255, 0.9);\n    -webkit-box-shadow: inset 3px 3px 5px 2px rgba(244, 121, 255, 0.40), 0px 0px 5px rgba(224, 0, 255, 0.89);\n}\n\n.circle{\n    border : 2px solid rgba(255,255,255,0.7);\n    border-radius : 50%;\n    pointer-events : none;\n}\n\n.sphere{\n    background-image: -webkit-radial-gradient(40% 40%, circle contain, rgba(50,50,50,.4) 10%, rgba(100,100,100,.4) 100%);\n    border-radius : 50%;\n}\n"; (require("/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/cssify"))(css); module.exports = css;
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

    this._anchorParticle.setPosition([0, 250, 0])

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

    var size = Math.random() * 90;

    var circle = new Circle({
      radius: size,
      position: new Vector(0, 0, 0),
      velocity: new Vector(0, 0, 0)
    });

    var surface = new Surface({
      size: [size, size],
      classes: ['particle']
    });
    if(Math.random() > 0.5) surface.addClass('color1');

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
      size: [this.options.edgeLength, this.options.edgeLength],
      classes : ['backface'],
      properties: {
        textAlign: 'center',
        lineHeight: '70px',
        fontSize: '35px',
        background : 'rgba(255,255,255,0.1)',
        border : '1px solid rgba(255,255,255,1)'
      }
    });
    face.pipe(this._eventOutput);
    return face;
}

module.exports = CubicView;

},{"famous/src/core/EventHandler":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/core/EventHandler.js","famous/src/core/Modifier":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/core/Modifier.js","famous/src/core/Surface":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/core/Surface.js","famous/src/core/Transform":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/core/Transform.js","famous/src/core/View":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/core/View.js","famous/src/modifiers/StateModifier":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/modifiers/StateModifier.js","famous/src/transitions/Easing":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/transitions/Easing.js","famous/src/transitions/Transitionable":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/transitions/Transitionable.js"}]},{},["/Users/michaelxia/Famous/Vanilla/cube-walls-3d/src/index.js"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvY3NzaWZ5L2Jyb3dzZXIuanMiLCJub2RlX21vZHVsZXMvZmFtb3VzL3NyYy9jb3JlL0NvbnRleHQuanMiLCJub2RlX21vZHVsZXMvZmFtb3VzL3NyYy9jb3JlL0VsZW1lbnRBbGxvY2F0b3IuanMiLCJub2RlX21vZHVsZXMvZmFtb3VzL3NyYy9jb3JlL0VsZW1lbnRPdXRwdXQuanMiLCJub2RlX21vZHVsZXMvZmFtb3VzL3NyYy9jb3JlL0VuZ2luZS5qcyIsIm5vZGVfbW9kdWxlcy9mYW1vdXMvc3JjL2NvcmUvRW50aXR5LmpzIiwibm9kZV9tb2R1bGVzL2ZhbW91cy9zcmMvY29yZS9FdmVudEVtaXR0ZXIuanMiLCJub2RlX21vZHVsZXMvZmFtb3VzL3NyYy9jb3JlL0V2ZW50SGFuZGxlci5qcyIsIm5vZGVfbW9kdWxlcy9mYW1vdXMvc3JjL2NvcmUvTW9kaWZpZXIuanMiLCJub2RlX21vZHVsZXMvZmFtb3VzL3NyYy9jb3JlL09wdGlvbnNNYW5hZ2VyLmpzIiwibm9kZV9tb2R1bGVzL2ZhbW91cy9zcmMvY29yZS9SZW5kZXJOb2RlLmpzIiwibm9kZV9tb2R1bGVzL2ZhbW91cy9zcmMvY29yZS9TcGVjUGFyc2VyLmpzIiwibm9kZV9tb2R1bGVzL2ZhbW91cy9zcmMvY29yZS9TdXJmYWNlLmpzIiwibm9kZV9tb2R1bGVzL2ZhbW91cy9zcmMvY29yZS9UcmFuc2Zvcm0uanMiLCJub2RlX21vZHVsZXMvZmFtb3VzL3NyYy9jb3JlL1ZpZXcuanMiLCJub2RlX21vZHVsZXMvZmFtb3VzL3NyYy9jb3JlL2ZhbW91cy5jc3MiLCJub2RlX21vZHVsZXMvZmFtb3VzL3NyYy9pbnB1dHMvR2VuZXJpY1N5bmMuanMiLCJub2RlX21vZHVsZXMvZmFtb3VzL3NyYy9pbnB1dHMvTW91c2VTeW5jLmpzIiwibm9kZV9tb2R1bGVzL2ZhbW91cy9zcmMvaW5wdXRzL1Njcm9sbFN5bmMuanMiLCJub2RlX21vZHVsZXMvZmFtb3VzL3NyYy9pbnB1dHMvVG91Y2hTeW5jLmpzIiwibm9kZV9tb2R1bGVzL2ZhbW91cy9zcmMvaW5wdXRzL1RvdWNoVHJhY2tlci5qcyIsIm5vZGVfbW9kdWxlcy9mYW1vdXMvc3JjL21hdGgvTWF0cml4LmpzIiwibm9kZV9tb2R1bGVzL2ZhbW91cy9zcmMvbWF0aC9RdWF0ZXJuaW9uLmpzIiwibm9kZV9tb2R1bGVzL2ZhbW91cy9zcmMvbWF0aC9WZWN0b3IuanMiLCJub2RlX21vZHVsZXMvZmFtb3VzL3NyYy9tb2RpZmllcnMvU3RhdGVNb2RpZmllci5qcyIsIm5vZGVfbW9kdWxlcy9mYW1vdXMvc3JjL3BoeXNpY3MvUGh5c2ljc0VuZ2luZS5qcyIsIm5vZGVfbW9kdWxlcy9mYW1vdXMvc3JjL3BoeXNpY3MvYm9kaWVzL0JvZHkuanMiLCJub2RlX21vZHVsZXMvZmFtb3VzL3NyYy9waHlzaWNzL2JvZGllcy9DaXJjbGUuanMiLCJub2RlX21vZHVsZXMvZmFtb3VzL3NyYy9waHlzaWNzL2JvZGllcy9QYXJ0aWNsZS5qcyIsIm5vZGVfbW9kdWxlcy9mYW1vdXMvc3JjL3BoeXNpY3MvY29uc3RyYWludHMvQ29sbGlzaW9uLmpzIiwibm9kZV9tb2R1bGVzL2ZhbW91cy9zcmMvcGh5c2ljcy9jb25zdHJhaW50cy9Db25zdHJhaW50LmpzIiwibm9kZV9tb2R1bGVzL2ZhbW91cy9zcmMvcGh5c2ljcy9jb25zdHJhaW50cy9XYWxsLmpzIiwibm9kZV9tb2R1bGVzL2ZhbW91cy9zcmMvcGh5c2ljcy9jb25zdHJhaW50cy9XYWxscy5qcyIsIm5vZGVfbW9kdWxlcy9mYW1vdXMvc3JjL3BoeXNpY3MvZm9yY2VzL0RyYWcuanMiLCJub2RlX21vZHVsZXMvZmFtb3VzL3NyYy9waHlzaWNzL2ZvcmNlcy9Gb3JjZS5qcyIsIm5vZGVfbW9kdWxlcy9mYW1vdXMvc3JjL3BoeXNpY3MvZm9yY2VzL1JlcHVsc2lvbi5qcyIsIm5vZGVfbW9kdWxlcy9mYW1vdXMvc3JjL3BoeXNpY3MvZm9yY2VzL1ZlY3RvckZpZWxkLmpzIiwibm9kZV9tb2R1bGVzL2ZhbW91cy9zcmMvcGh5c2ljcy9pbnRlZ3JhdG9ycy9TeW1wbGVjdGljRXVsZXIuanMiLCJub2RlX21vZHVsZXMvZmFtb3VzL3NyYy90cmFuc2l0aW9ucy9FYXNpbmcuanMiLCJub2RlX21vZHVsZXMvZmFtb3VzL3NyYy90cmFuc2l0aW9ucy9NdWx0aXBsZVRyYW5zaXRpb24uanMiLCJub2RlX21vZHVsZXMvZmFtb3VzL3NyYy90cmFuc2l0aW9ucy9UcmFuc2l0aW9uYWJsZS5qcyIsIm5vZGVfbW9kdWxlcy9mYW1vdXMvc3JjL3RyYW5zaXRpb25zL1RyYW5zaXRpb25hYmxlVHJhbnNmb3JtLmpzIiwibm9kZV9tb2R1bGVzL2ZhbW91cy9zcmMvdHJhbnNpdGlvbnMvVHdlZW5UcmFuc2l0aW9uLmpzIiwibm9kZV9tb2R1bGVzL2ZhbW91cy9zcmMvdXRpbGl0aWVzL1V0aWxpdHkuanMiLCJzcmMvQ29tcG9uZW50cy9FYXN5Q2FtZXJhLmpzIiwic3JjL0NvbXBvbmVudHMvT2xkTWF0cml4LmpzIiwic3JjL0NvbXBvbmVudHMvT2xkUXVhdGVybmlvbi5qcyIsInNyYy9Db21wb25lbnRzL1V0aWxzLmpzIiwic3JjL2luZGV4LmpzIiwic3JjL3N0eWxlcy9hcHAuY3NzIiwic3JjL3N0eWxlcy9pbmRleC5qcyIsInNyYy92aWV3cy9BcHB2aWV3LmpzIiwic3JjL3ZpZXdzL0N1YmljVmlldy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcFBBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDelNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25DQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdlFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbk1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN09BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDellBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3bEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JRQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFlQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbFBBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoY3NzLCBjdXN0b21Eb2N1bWVudCkge1xuICB2YXIgZG9jID0gY3VzdG9tRG9jdW1lbnQgfHwgZG9jdW1lbnQ7XG4gIGlmIChkb2MuY3JlYXRlU3R5bGVTaGVldCkge1xuICAgIHZhciBzaGVldCA9IGRvYy5jcmVhdGVTdHlsZVNoZWV0KClcbiAgICBzaGVldC5jc3NUZXh0ID0gY3NzO1xuICAgIHJldHVybiBzaGVldC5vd25lck5vZGU7XG4gIH0gZWxzZSB7XG4gICAgdmFyIGhlYWQgPSBkb2MuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2hlYWQnKVswXSxcbiAgICAgICAgc3R5bGUgPSBkb2MuY3JlYXRlRWxlbWVudCgnc3R5bGUnKTtcblxuICAgIHN0eWxlLnR5cGUgPSAndGV4dC9jc3MnO1xuXG4gICAgaWYgKHN0eWxlLnN0eWxlU2hlZXQpIHtcbiAgICAgIHN0eWxlLnN0eWxlU2hlZXQuY3NzVGV4dCA9IGNzcztcbiAgICB9IGVsc2Uge1xuICAgICAgc3R5bGUuYXBwZW5kQ2hpbGQoZG9jLmNyZWF0ZVRleHROb2RlKGNzcykpO1xuICAgIH1cblxuICAgIGhlYWQuYXBwZW5kQ2hpbGQoc3R5bGUpO1xuICAgIHJldHVybiBzdHlsZTtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMuYnlVcmwgPSBmdW5jdGlvbih1cmwpIHtcbiAgaWYgKGRvY3VtZW50LmNyZWF0ZVN0eWxlU2hlZXQpIHtcbiAgICByZXR1cm4gZG9jdW1lbnQuY3JlYXRlU3R5bGVTaGVldCh1cmwpLm93bmVyTm9kZTtcbiAgfSBlbHNlIHtcbiAgICB2YXIgaGVhZCA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoZWFkJylbMF0sXG4gICAgICAgIGxpbmsgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaW5rJyk7XG5cbiAgICBsaW5rLnJlbCA9ICdzdHlsZXNoZWV0JztcbiAgICBsaW5rLmhyZWYgPSB1cmw7XG5cbiAgICBoZWFkLmFwcGVuZENoaWxkKGxpbmspO1xuICAgIHJldHVybiBsaW5rO1xuICB9XG59O1xuIiwidmFyIFJlbmRlck5vZGUgPSByZXF1aXJlKCcuL1JlbmRlck5vZGUnKTtcbnZhciBFdmVudEhhbmRsZXIgPSByZXF1aXJlKCcuL0V2ZW50SGFuZGxlcicpO1xudmFyIEVsZW1lbnRBbGxvY2F0b3IgPSByZXF1aXJlKCcuL0VsZW1lbnRBbGxvY2F0b3InKTtcbnZhciBUcmFuc2Zvcm0gPSByZXF1aXJlKCcuL1RyYW5zZm9ybScpO1xudmFyIFRyYW5zaXRpb25hYmxlID0gcmVxdWlyZSgnLi4vdHJhbnNpdGlvbnMvVHJhbnNpdGlvbmFibGUnKTtcbnZhciBfemVyb1plcm8gPSBbXG4gICAgICAgIDAsXG4gICAgICAgIDBcbiAgICBdO1xudmFyIHVzZVByZWZpeCA9ICEoJ3BlcnNwZWN0aXZlJyBpbiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc3R5bGUpO1xuZnVuY3Rpb24gX2dldEVsZW1lbnRTaXplKGVsZW1lbnQpIHtcbiAgICByZXR1cm4gW1xuICAgICAgICBlbGVtZW50LmNsaWVudFdpZHRoLFxuICAgICAgICBlbGVtZW50LmNsaWVudEhlaWdodFxuICAgIF07XG59XG52YXIgX3NldFBlcnNwZWN0aXZlID0gdXNlUHJlZml4ID8gZnVuY3Rpb24gKGVsZW1lbnQsIHBlcnNwZWN0aXZlKSB7XG4gICAgICAgIGVsZW1lbnQuc3R5bGUud2Via2l0UGVyc3BlY3RpdmUgPSBwZXJzcGVjdGl2ZSA/IHBlcnNwZWN0aXZlLnRvRml4ZWQoKSArICdweCcgOiAnJztcbiAgICB9IDogZnVuY3Rpb24gKGVsZW1lbnQsIHBlcnNwZWN0aXZlKSB7XG4gICAgICAgIGVsZW1lbnQuc3R5bGUucGVyc3BlY3RpdmUgPSBwZXJzcGVjdGl2ZSA/IHBlcnNwZWN0aXZlLnRvRml4ZWQoKSArICdweCcgOiAnJztcbiAgICB9O1xuZnVuY3Rpb24gQ29udGV4dChjb250YWluZXIpIHtcbiAgICB0aGlzLmNvbnRhaW5lciA9IGNvbnRhaW5lcjtcbiAgICB0aGlzLl9hbGxvY2F0b3IgPSBuZXcgRWxlbWVudEFsbG9jYXRvcihjb250YWluZXIpO1xuICAgIHRoaXMuX25vZGUgPSBuZXcgUmVuZGVyTm9kZSgpO1xuICAgIHRoaXMuX2V2ZW50T3V0cHV0ID0gbmV3IEV2ZW50SGFuZGxlcigpO1xuICAgIHRoaXMuX3NpemUgPSBfZ2V0RWxlbWVudFNpemUodGhpcy5jb250YWluZXIpO1xuICAgIHRoaXMuX3BlcnNwZWN0aXZlU3RhdGUgPSBuZXcgVHJhbnNpdGlvbmFibGUoMCk7XG4gICAgdGhpcy5fcGVyc3BlY3RpdmUgPSB1bmRlZmluZWQ7XG4gICAgdGhpcy5fbm9kZUNvbnRleHQgPSB7XG4gICAgICAgIGFsbG9jYXRvcjogdGhpcy5fYWxsb2NhdG9yLFxuICAgICAgICB0cmFuc2Zvcm06IFRyYW5zZm9ybS5pZGVudGl0eSxcbiAgICAgICAgb3BhY2l0eTogMSxcbiAgICAgICAgb3JpZ2luOiBfemVyb1plcm8sXG4gICAgICAgIGFsaWduOiBfemVyb1plcm8sXG4gICAgICAgIHNpemU6IHRoaXMuX3NpemVcbiAgICB9O1xuICAgIHRoaXMuX2V2ZW50T3V0cHV0Lm9uKCdyZXNpemUnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuc2V0U2l6ZShfZ2V0RWxlbWVudFNpemUodGhpcy5jb250YWluZXIpKTtcbiAgICB9LmJpbmQodGhpcykpO1xufVxuQ29udGV4dC5wcm90b3R5cGUuZ2V0QWxsb2NhdG9yID0gZnVuY3Rpb24gZ2V0QWxsb2NhdG9yKCkge1xuICAgIHJldHVybiB0aGlzLl9hbGxvY2F0b3I7XG59O1xuQ29udGV4dC5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24gYWRkKG9iaikge1xuICAgIHJldHVybiB0aGlzLl9ub2RlLmFkZChvYmopO1xufTtcbkNvbnRleHQucHJvdG90eXBlLm1pZ3JhdGUgPSBmdW5jdGlvbiBtaWdyYXRlKGNvbnRhaW5lcikge1xuICAgIGlmIChjb250YWluZXIgPT09IHRoaXMuY29udGFpbmVyKVxuICAgICAgICByZXR1cm47XG4gICAgdGhpcy5jb250YWluZXIgPSBjb250YWluZXI7XG4gICAgdGhpcy5fYWxsb2NhdG9yLm1pZ3JhdGUoY29udGFpbmVyKTtcbn07XG5Db250ZXh0LnByb3RvdHlwZS5nZXRTaXplID0gZnVuY3Rpb24gZ2V0U2l6ZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fc2l6ZTtcbn07XG5Db250ZXh0LnByb3RvdHlwZS5zZXRTaXplID0gZnVuY3Rpb24gc2V0U2l6ZShzaXplKSB7XG4gICAgaWYgKCFzaXplKVxuICAgICAgICBzaXplID0gX2dldEVsZW1lbnRTaXplKHRoaXMuY29udGFpbmVyKTtcbiAgICB0aGlzLl9zaXplWzBdID0gc2l6ZVswXTtcbiAgICB0aGlzLl9zaXplWzFdID0gc2l6ZVsxXTtcbn07XG5Db250ZXh0LnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbiB1cGRhdGUoY29udGV4dFBhcmFtZXRlcnMpIHtcbiAgICBpZiAoY29udGV4dFBhcmFtZXRlcnMpIHtcbiAgICAgICAgaWYgKGNvbnRleHRQYXJhbWV0ZXJzLnRyYW5zZm9ybSlcbiAgICAgICAgICAgIHRoaXMuX25vZGVDb250ZXh0LnRyYW5zZm9ybSA9IGNvbnRleHRQYXJhbWV0ZXJzLnRyYW5zZm9ybTtcbiAgICAgICAgaWYgKGNvbnRleHRQYXJhbWV0ZXJzLm9wYWNpdHkpXG4gICAgICAgICAgICB0aGlzLl9ub2RlQ29udGV4dC5vcGFjaXR5ID0gY29udGV4dFBhcmFtZXRlcnMub3BhY2l0eTtcbiAgICAgICAgaWYgKGNvbnRleHRQYXJhbWV0ZXJzLm9yaWdpbilcbiAgICAgICAgICAgIHRoaXMuX25vZGVDb250ZXh0Lm9yaWdpbiA9IGNvbnRleHRQYXJhbWV0ZXJzLm9yaWdpbjtcbiAgICAgICAgaWYgKGNvbnRleHRQYXJhbWV0ZXJzLmFsaWduKVxuICAgICAgICAgICAgdGhpcy5fbm9kZUNvbnRleHQuYWxpZ24gPSBjb250ZXh0UGFyYW1ldGVycy5hbGlnbjtcbiAgICAgICAgaWYgKGNvbnRleHRQYXJhbWV0ZXJzLnNpemUpXG4gICAgICAgICAgICB0aGlzLl9ub2RlQ29udGV4dC5zaXplID0gY29udGV4dFBhcmFtZXRlcnMuc2l6ZTtcbiAgICB9XG4gICAgdmFyIHBlcnNwZWN0aXZlID0gdGhpcy5fcGVyc3BlY3RpdmVTdGF0ZS5nZXQoKTtcbiAgICBpZiAocGVyc3BlY3RpdmUgIT09IHRoaXMuX3BlcnNwZWN0aXZlKSB7XG4gICAgICAgIF9zZXRQZXJzcGVjdGl2ZSh0aGlzLmNvbnRhaW5lciwgcGVyc3BlY3RpdmUpO1xuICAgICAgICB0aGlzLl9wZXJzcGVjdGl2ZSA9IHBlcnNwZWN0aXZlO1xuICAgIH1cbiAgICB0aGlzLl9ub2RlLmNvbW1pdCh0aGlzLl9ub2RlQ29udGV4dCk7XG59O1xuQ29udGV4dC5wcm90b3R5cGUuZ2V0UGVyc3BlY3RpdmUgPSBmdW5jdGlvbiBnZXRQZXJzcGVjdGl2ZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fcGVyc3BlY3RpdmVTdGF0ZS5nZXQoKTtcbn07XG5Db250ZXh0LnByb3RvdHlwZS5zZXRQZXJzcGVjdGl2ZSA9IGZ1bmN0aW9uIHNldFBlcnNwZWN0aXZlKHBlcnNwZWN0aXZlLCB0cmFuc2l0aW9uLCBjYWxsYmFjaykge1xuICAgIHJldHVybiB0aGlzLl9wZXJzcGVjdGl2ZVN0YXRlLnNldChwZXJzcGVjdGl2ZSwgdHJhbnNpdGlvbiwgY2FsbGJhY2spO1xufTtcbkNvbnRleHQucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbiBlbWl0KHR5cGUsIGV2ZW50KSB7XG4gICAgcmV0dXJuIHRoaXMuX2V2ZW50T3V0cHV0LmVtaXQodHlwZSwgZXZlbnQpO1xufTtcbkNvbnRleHQucHJvdG90eXBlLm9uID0gZnVuY3Rpb24gb24odHlwZSwgaGFuZGxlcikge1xuICAgIHJldHVybiB0aGlzLl9ldmVudE91dHB1dC5vbih0eXBlLCBoYW5kbGVyKTtcbn07XG5Db250ZXh0LnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9IGZ1bmN0aW9uIHJlbW92ZUxpc3RlbmVyKHR5cGUsIGhhbmRsZXIpIHtcbiAgICByZXR1cm4gdGhpcy5fZXZlbnRPdXRwdXQucmVtb3ZlTGlzdGVuZXIodHlwZSwgaGFuZGxlcik7XG59O1xuQ29udGV4dC5wcm90b3R5cGUucGlwZSA9IGZ1bmN0aW9uIHBpcGUodGFyZ2V0KSB7XG4gICAgcmV0dXJuIHRoaXMuX2V2ZW50T3V0cHV0LnBpcGUodGFyZ2V0KTtcbn07XG5Db250ZXh0LnByb3RvdHlwZS51bnBpcGUgPSBmdW5jdGlvbiB1bnBpcGUodGFyZ2V0KSB7XG4gICAgcmV0dXJuIHRoaXMuX2V2ZW50T3V0cHV0LnVucGlwZSh0YXJnZXQpO1xufTtcbm1vZHVsZS5leHBvcnRzID0gQ29udGV4dDsiLCJmdW5jdGlvbiBFbGVtZW50QWxsb2NhdG9yKGNvbnRhaW5lcikge1xuICAgIGlmICghY29udGFpbmVyKVxuICAgICAgICBjb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XG4gICAgdGhpcy5jb250YWluZXIgPSBjb250YWluZXI7XG4gICAgdGhpcy5kZXRhY2hlZE5vZGVzID0ge307XG4gICAgdGhpcy5ub2RlQ291bnQgPSAwO1xufVxuRWxlbWVudEFsbG9jYXRvci5wcm90b3R5cGUubWlncmF0ZSA9IGZ1bmN0aW9uIG1pZ3JhdGUoY29udGFpbmVyKSB7XG4gICAgdmFyIG9sZENvbnRhaW5lciA9IHRoaXMuY29udGFpbmVyO1xuICAgIGlmIChjb250YWluZXIgPT09IG9sZENvbnRhaW5lcilcbiAgICAgICAgcmV0dXJuO1xuICAgIGlmIChvbGRDb250YWluZXIgaW5zdGFuY2VvZiBEb2N1bWVudEZyYWdtZW50KSB7XG4gICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChvbGRDb250YWluZXIpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHdoaWxlIChvbGRDb250YWluZXIuaGFzQ2hpbGROb2RlcygpKSB7XG4gICAgICAgICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQob2xkQ29udGFpbmVyLnJlbW92ZUNoaWxkKG9sZENvbnRhaW5lci5maXJzdENoaWxkKSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5jb250YWluZXIgPSBjb250YWluZXI7XG59O1xuRWxlbWVudEFsbG9jYXRvci5wcm90b3R5cGUuYWxsb2NhdGUgPSBmdW5jdGlvbiBhbGxvY2F0ZSh0eXBlKSB7XG4gICAgdHlwZSA9IHR5cGUudG9Mb3dlckNhc2UoKTtcbiAgICBpZiAoISh0eXBlIGluIHRoaXMuZGV0YWNoZWROb2RlcykpXG4gICAgICAgIHRoaXMuZGV0YWNoZWROb2Rlc1t0eXBlXSA9IFtdO1xuICAgIHZhciBub2RlU3RvcmUgPSB0aGlzLmRldGFjaGVkTm9kZXNbdHlwZV07XG4gICAgdmFyIHJlc3VsdDtcbiAgICBpZiAobm9kZVN0b3JlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgcmVzdWx0ID0gbm9kZVN0b3JlLnBvcCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc3VsdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQodHlwZSk7XG4gICAgICAgIHRoaXMuY29udGFpbmVyLmFwcGVuZENoaWxkKHJlc3VsdCk7XG4gICAgfVxuICAgIHRoaXMubm9kZUNvdW50Kys7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn07XG5FbGVtZW50QWxsb2NhdG9yLnByb3RvdHlwZS5kZWFsbG9jYXRlID0gZnVuY3Rpb24gZGVhbGxvY2F0ZShlbGVtZW50KSB7XG4gICAgdmFyIG5vZGVUeXBlID0gZWxlbWVudC5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpO1xuICAgIHZhciBub2RlU3RvcmUgPSB0aGlzLmRldGFjaGVkTm9kZXNbbm9kZVR5cGVdO1xuICAgIG5vZGVTdG9yZS5wdXNoKGVsZW1lbnQpO1xuICAgIHRoaXMubm9kZUNvdW50LS07XG59O1xuRWxlbWVudEFsbG9jYXRvci5wcm90b3R5cGUuZ2V0Tm9kZUNvdW50ID0gZnVuY3Rpb24gZ2V0Tm9kZUNvdW50KCkge1xuICAgIHJldHVybiB0aGlzLm5vZGVDb3VudDtcbn07XG5tb2R1bGUuZXhwb3J0cyA9IEVsZW1lbnRBbGxvY2F0b3I7IiwidmFyIEVudGl0eSA9IHJlcXVpcmUoJy4vRW50aXR5Jyk7XG52YXIgRXZlbnRIYW5kbGVyID0gcmVxdWlyZSgnLi9FdmVudEhhbmRsZXInKTtcbnZhciBUcmFuc2Zvcm0gPSByZXF1aXJlKCcuL1RyYW5zZm9ybScpO1xudmFyIHVzZVByZWZpeCA9ICEoJ3RyYW5zZm9ybScgaW4gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnN0eWxlKTtcbnZhciBkZXZpY2VQaXhlbFJhdGlvID0gd2luZG93LmRldmljZVBpeGVsUmF0aW8gfHwgMTtcbmZ1bmN0aW9uIEVsZW1lbnRPdXRwdXQoZWxlbWVudCkge1xuICAgIHRoaXMuX21hdHJpeCA9IG51bGw7XG4gICAgdGhpcy5fb3BhY2l0eSA9IDE7XG4gICAgdGhpcy5fb3JpZ2luID0gbnVsbDtcbiAgICB0aGlzLl9zaXplID0gbnVsbDtcbiAgICB0aGlzLl9ldmVudE91dHB1dCA9IG5ldyBFdmVudEhhbmRsZXIoKTtcbiAgICB0aGlzLl9ldmVudE91dHB1dC5iaW5kVGhpcyh0aGlzKTtcbiAgICB0aGlzLmV2ZW50Rm9yd2FyZGVyID0gZnVuY3Rpb24gZXZlbnRGb3J3YXJkZXIoZXZlbnQpIHtcbiAgICAgICAgdGhpcy5fZXZlbnRPdXRwdXQuZW1pdChldmVudC50eXBlLCBldmVudCk7XG4gICAgfS5iaW5kKHRoaXMpO1xuICAgIHRoaXMuaWQgPSBFbnRpdHkucmVnaXN0ZXIodGhpcyk7XG4gICAgdGhpcy5fZWxlbWVudCA9IG51bGw7XG4gICAgdGhpcy5fc2l6ZURpcnR5ID0gZmFsc2U7XG4gICAgdGhpcy5fb3JpZ2luRGlydHkgPSBmYWxzZTtcbiAgICB0aGlzLl90cmFuc2Zvcm1EaXJ0eSA9IGZhbHNlO1xuICAgIHRoaXMuX2ludmlzaWJsZSA9IGZhbHNlO1xuICAgIGlmIChlbGVtZW50KVxuICAgICAgICB0aGlzLmF0dGFjaChlbGVtZW50KTtcbn1cbkVsZW1lbnRPdXRwdXQucHJvdG90eXBlLm9uID0gZnVuY3Rpb24gb24odHlwZSwgZm4pIHtcbiAgICBpZiAodGhpcy5fZWxlbWVudClcbiAgICAgICAgdGhpcy5fZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKHR5cGUsIHRoaXMuZXZlbnRGb3J3YXJkZXIpO1xuICAgIHRoaXMuX2V2ZW50T3V0cHV0Lm9uKHR5cGUsIGZuKTtcbn07XG5FbGVtZW50T3V0cHV0LnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9IGZ1bmN0aW9uIHJlbW92ZUxpc3RlbmVyKHR5cGUsIGZuKSB7XG4gICAgdGhpcy5fZXZlbnRPdXRwdXQucmVtb3ZlTGlzdGVuZXIodHlwZSwgZm4pO1xufTtcbkVsZW1lbnRPdXRwdXQucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbiBlbWl0KHR5cGUsIGV2ZW50KSB7XG4gICAgaWYgKGV2ZW50ICYmICFldmVudC5vcmlnaW4pXG4gICAgICAgIGV2ZW50Lm9yaWdpbiA9IHRoaXM7XG4gICAgdmFyIGhhbmRsZWQgPSB0aGlzLl9ldmVudE91dHB1dC5lbWl0KHR5cGUsIGV2ZW50KTtcbiAgICBpZiAoaGFuZGxlZCAmJiBldmVudCAmJiBldmVudC5zdG9wUHJvcGFnYXRpb24pXG4gICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgIHJldHVybiBoYW5kbGVkO1xufTtcbkVsZW1lbnRPdXRwdXQucHJvdG90eXBlLnBpcGUgPSBmdW5jdGlvbiBwaXBlKHRhcmdldCkge1xuICAgIHJldHVybiB0aGlzLl9ldmVudE91dHB1dC5waXBlKHRhcmdldCk7XG59O1xuRWxlbWVudE91dHB1dC5wcm90b3R5cGUudW5waXBlID0gZnVuY3Rpb24gdW5waXBlKHRhcmdldCkge1xuICAgIHJldHVybiB0aGlzLl9ldmVudE91dHB1dC51bnBpcGUodGFyZ2V0KTtcbn07XG5FbGVtZW50T3V0cHV0LnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgcmV0dXJuIHRoaXMuaWQ7XG59O1xuZnVuY3Rpb24gX2FkZEV2ZW50TGlzdGVuZXJzKHRhcmdldCkge1xuICAgIGZvciAodmFyIGkgaW4gdGhpcy5fZXZlbnRPdXRwdXQubGlzdGVuZXJzKSB7XG4gICAgICAgIHRhcmdldC5hZGRFdmVudExpc3RlbmVyKGksIHRoaXMuZXZlbnRGb3J3YXJkZXIpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIF9yZW1vdmVFdmVudExpc3RlbmVycyh0YXJnZXQpIHtcbiAgICBmb3IgKHZhciBpIGluIHRoaXMuX2V2ZW50T3V0cHV0Lmxpc3RlbmVycykge1xuICAgICAgICB0YXJnZXQucmVtb3ZlRXZlbnRMaXN0ZW5lcihpLCB0aGlzLmV2ZW50Rm9yd2FyZGVyKTtcbiAgICB9XG59XG5mdW5jdGlvbiBfZm9ybWF0Q1NTVHJhbnNmb3JtKG0pIHtcbiAgICB2YXIgcmVzdWx0ID0gJ21hdHJpeDNkKCc7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCAxNTsgaSsrKSB7XG4gICAgICAgIHJlc3VsdCArPSBtW2ldIDwgMC4wMDAwMDEgJiYgbVtpXSA+IC0wLjAwMDAwMSA/ICcwLCcgOiBtW2ldICsgJywnO1xuICAgIH1cbiAgICByZXN1bHQgKz0gbVsxNV0gKyAnKSc7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cbnZhciBfc2V0TWF0cml4O1xuaWYgKG5hdmlnYXRvci51c2VyQWdlbnQudG9Mb3dlckNhc2UoKS5pbmRleE9mKCdmaXJlZm94JykgPiAtMSkge1xuICAgIF9zZXRNYXRyaXggPSBmdW5jdGlvbiAoZWxlbWVudCwgbWF0cml4KSB7XG4gICAgICAgIGVsZW1lbnQuc3R5bGUuekluZGV4ID0gbWF0cml4WzE0XSAqIDEwMDAwMDAgfCAwO1xuICAgICAgICBlbGVtZW50LnN0eWxlLnRyYW5zZm9ybSA9IF9mb3JtYXRDU1NUcmFuc2Zvcm0obWF0cml4KTtcbiAgICB9O1xufSBlbHNlIGlmICh1c2VQcmVmaXgpIHtcbiAgICBfc2V0TWF0cml4ID0gZnVuY3Rpb24gKGVsZW1lbnQsIG1hdHJpeCkge1xuICAgICAgICBlbGVtZW50LnN0eWxlLndlYmtpdFRyYW5zZm9ybSA9IF9mb3JtYXRDU1NUcmFuc2Zvcm0obWF0cml4KTtcbiAgICB9O1xufSBlbHNlIHtcbiAgICBfc2V0TWF0cml4ID0gZnVuY3Rpb24gKGVsZW1lbnQsIG1hdHJpeCkge1xuICAgICAgICBlbGVtZW50LnN0eWxlLnRyYW5zZm9ybSA9IF9mb3JtYXRDU1NUcmFuc2Zvcm0obWF0cml4KTtcbiAgICB9O1xufVxuZnVuY3Rpb24gX2Zvcm1hdENTU09yaWdpbihvcmlnaW4pIHtcbiAgICByZXR1cm4gMTAwICogb3JpZ2luWzBdICsgJyUgJyArIDEwMCAqIG9yaWdpblsxXSArICclJztcbn1cbnZhciBfc2V0T3JpZ2luID0gdXNlUHJlZml4ID8gZnVuY3Rpb24gKGVsZW1lbnQsIG9yaWdpbikge1xuICAgICAgICBlbGVtZW50LnN0eWxlLndlYmtpdFRyYW5zZm9ybU9yaWdpbiA9IF9mb3JtYXRDU1NPcmlnaW4ob3JpZ2luKTtcbiAgICB9IDogZnVuY3Rpb24gKGVsZW1lbnQsIG9yaWdpbikge1xuICAgICAgICBlbGVtZW50LnN0eWxlLnRyYW5zZm9ybU9yaWdpbiA9IF9mb3JtYXRDU1NPcmlnaW4ob3JpZ2luKTtcbiAgICB9O1xudmFyIF9zZXRJbnZpc2libGUgPSB1c2VQcmVmaXggPyBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgICAgICBlbGVtZW50LnN0eWxlLndlYmtpdFRyYW5zZm9ybSA9ICdzY2FsZTNkKDAuMDAwMSwwLjAwMDEsMC4wMDAxKSc7XG4gICAgICAgIGVsZW1lbnQuc3R5bGUub3BhY2l0eSA9IDA7XG4gICAgfSA6IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgICAgIGVsZW1lbnQuc3R5bGUudHJhbnNmb3JtID0gJ3NjYWxlM2QoMC4wMDAxLDAuMDAwMSwwLjAwMDEpJztcbiAgICAgICAgZWxlbWVudC5zdHlsZS5vcGFjaXR5ID0gMDtcbiAgICB9O1xuZnVuY3Rpb24gX3h5Tm90RXF1YWxzKGEsIGIpIHtcbiAgICByZXR1cm4gYSAmJiBiID8gYVswXSAhPT0gYlswXSB8fCBhWzFdICE9PSBiWzFdIDogYSAhPT0gYjtcbn1cbkVsZW1lbnRPdXRwdXQucHJvdG90eXBlLmNvbW1pdCA9IGZ1bmN0aW9uIGNvbW1pdChjb250ZXh0KSB7XG4gICAgdmFyIHRhcmdldCA9IHRoaXMuX2VsZW1lbnQ7XG4gICAgaWYgKCF0YXJnZXQpXG4gICAgICAgIHJldHVybjtcbiAgICB2YXIgbWF0cml4ID0gY29udGV4dC50cmFuc2Zvcm07XG4gICAgdmFyIG9wYWNpdHkgPSBjb250ZXh0Lm9wYWNpdHk7XG4gICAgdmFyIG9yaWdpbiA9IGNvbnRleHQub3JpZ2luO1xuICAgIHZhciBzaXplID0gY29udGV4dC5zaXplO1xuICAgIGlmICghbWF0cml4ICYmIHRoaXMuX21hdHJpeCkge1xuICAgICAgICB0aGlzLl9tYXRyaXggPSBudWxsO1xuICAgICAgICB0aGlzLl9vcGFjaXR5ID0gMDtcbiAgICAgICAgX3NldEludmlzaWJsZSh0YXJnZXQpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChfeHlOb3RFcXVhbHModGhpcy5fb3JpZ2luLCBvcmlnaW4pKVxuICAgICAgICB0aGlzLl9vcmlnaW5EaXJ0eSA9IHRydWU7XG4gICAgaWYgKFRyYW5zZm9ybS5ub3RFcXVhbHModGhpcy5fbWF0cml4LCBtYXRyaXgpKVxuICAgICAgICB0aGlzLl90cmFuc2Zvcm1EaXJ0eSA9IHRydWU7XG4gICAgaWYgKHRoaXMuX2ludmlzaWJsZSkge1xuICAgICAgICB0aGlzLl9pbnZpc2libGUgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5fZWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gJyc7XG4gICAgfVxuICAgIGlmICh0aGlzLl9vcGFjaXR5ICE9PSBvcGFjaXR5KSB7XG4gICAgICAgIHRoaXMuX29wYWNpdHkgPSBvcGFjaXR5O1xuICAgICAgICB0YXJnZXQuc3R5bGUub3BhY2l0eSA9IG9wYWNpdHkgPj0gMSA/ICcwLjk5OTk5OScgOiBvcGFjaXR5O1xuICAgIH1cbiAgICBpZiAodGhpcy5fdHJhbnNmb3JtRGlydHkgfHwgdGhpcy5fb3JpZ2luRGlydHkgfHwgdGhpcy5fc2l6ZURpcnR5KSB7XG4gICAgICAgIGlmICh0aGlzLl9zaXplRGlydHkpXG4gICAgICAgICAgICB0aGlzLl9zaXplRGlydHkgPSBmYWxzZTtcbiAgICAgICAgaWYgKHRoaXMuX29yaWdpbkRpcnR5KSB7XG4gICAgICAgICAgICBpZiAob3JpZ2luKSB7XG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLl9vcmlnaW4pXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX29yaWdpbiA9IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAwXG4gICAgICAgICAgICAgICAgICAgIF07XG4gICAgICAgICAgICAgICAgdGhpcy5fb3JpZ2luWzBdID0gb3JpZ2luWzBdO1xuICAgICAgICAgICAgICAgIHRoaXMuX29yaWdpblsxXSA9IG9yaWdpblsxXTtcbiAgICAgICAgICAgIH0gZWxzZVxuICAgICAgICAgICAgICAgIHRoaXMuX29yaWdpbiA9IG51bGw7XG4gICAgICAgICAgICBfc2V0T3JpZ2luKHRhcmdldCwgdGhpcy5fb3JpZ2luKTtcbiAgICAgICAgICAgIHRoaXMuX29yaWdpbkRpcnR5ID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFtYXRyaXgpXG4gICAgICAgICAgICBtYXRyaXggPSBUcmFuc2Zvcm0uaWRlbnRpdHk7XG4gICAgICAgIHRoaXMuX21hdHJpeCA9IG1hdHJpeDtcbiAgICAgICAgdmFyIGFhTWF0cml4ID0gdGhpcy5fc2l6ZSA/IFRyYW5zZm9ybS50aGVuTW92ZShtYXRyaXgsIFtcbiAgICAgICAgICAgICAgICAtdGhpcy5fc2l6ZVswXSAqIG9yaWdpblswXSxcbiAgICAgICAgICAgICAgICAtdGhpcy5fc2l6ZVsxXSAqIG9yaWdpblsxXSxcbiAgICAgICAgICAgICAgICAwXG4gICAgICAgICAgICBdKSA6IG1hdHJpeDtcbiAgICAgICAgX3NldE1hdHJpeCh0YXJnZXQsIGFhTWF0cml4KTtcbiAgICAgICAgdGhpcy5fdHJhbnNmb3JtRGlydHkgPSBmYWxzZTtcbiAgICB9XG59O1xuRWxlbWVudE91dHB1dC5wcm90b3R5cGUuY2xlYW51cCA9IGZ1bmN0aW9uIGNsZWFudXAoKSB7XG4gICAgaWYgKHRoaXMuX2VsZW1lbnQpIHtcbiAgICAgICAgdGhpcy5faW52aXNpYmxlID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5fZWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgIH1cbn07XG5FbGVtZW50T3V0cHV0LnByb3RvdHlwZS5hdHRhY2ggPSBmdW5jdGlvbiBhdHRhY2godGFyZ2V0KSB7XG4gICAgdGhpcy5fZWxlbWVudCA9IHRhcmdldDtcbiAgICBfYWRkRXZlbnRMaXN0ZW5lcnMuY2FsbCh0aGlzLCB0YXJnZXQpO1xufTtcbkVsZW1lbnRPdXRwdXQucHJvdG90eXBlLmRldGFjaCA9IGZ1bmN0aW9uIGRldGFjaCgpIHtcbiAgICB2YXIgdGFyZ2V0ID0gdGhpcy5fZWxlbWVudDtcbiAgICBpZiAodGFyZ2V0KSB7XG4gICAgICAgIF9yZW1vdmVFdmVudExpc3RlbmVycy5jYWxsKHRoaXMsIHRhcmdldCk7XG4gICAgICAgIGlmICh0aGlzLl9pbnZpc2libGUpIHtcbiAgICAgICAgICAgIHRoaXMuX2ludmlzaWJsZSA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5fZWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gJyc7XG4gICAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5fZWxlbWVudCA9IG51bGw7XG4gICAgcmV0dXJuIHRhcmdldDtcbn07XG5tb2R1bGUuZXhwb3J0cyA9IEVsZW1lbnRPdXRwdXQ7IiwidmFyIENvbnRleHQgPSByZXF1aXJlKCcuL0NvbnRleHQnKTtcbnZhciBFdmVudEhhbmRsZXIgPSByZXF1aXJlKCcuL0V2ZW50SGFuZGxlcicpO1xudmFyIE9wdGlvbnNNYW5hZ2VyID0gcmVxdWlyZSgnLi9PcHRpb25zTWFuYWdlcicpO1xudmFyIEVuZ2luZSA9IHt9O1xudmFyIGNvbnRleHRzID0gW107XG52YXIgbmV4dFRpY2tRdWV1ZSA9IFtdO1xudmFyIGRlZmVyUXVldWUgPSBbXTtcbnZhciBsYXN0VGltZSA9IERhdGUubm93KCk7XG52YXIgZnJhbWVUaW1lO1xudmFyIGZyYW1lVGltZUxpbWl0O1xudmFyIGxvb3BFbmFibGVkID0gdHJ1ZTtcbnZhciBldmVudEZvcndhcmRlcnMgPSB7fTtcbnZhciBldmVudEhhbmRsZXIgPSBuZXcgRXZlbnRIYW5kbGVyKCk7XG52YXIgb3B0aW9ucyA9IHtcbiAgICAgICAgY29udGFpbmVyVHlwZTogJ2RpdicsXG4gICAgICAgIGNvbnRhaW5lckNsYXNzOiAnZmFtb3VzLWNvbnRhaW5lcicsXG4gICAgICAgIGZwc0NhcDogdW5kZWZpbmVkLFxuICAgICAgICBydW5Mb29wOiB0cnVlLFxuICAgICAgICBhcHBNb2RlOiB0cnVlXG4gICAgfTtcbnZhciBvcHRpb25zTWFuYWdlciA9IG5ldyBPcHRpb25zTWFuYWdlcihvcHRpb25zKTtcbnZhciBNQVhfREVGRVJfRlJBTUVfVElNRSA9IDEwO1xuRW5naW5lLnN0ZXAgPSBmdW5jdGlvbiBzdGVwKCkge1xuICAgIHZhciBjdXJyZW50VGltZSA9IERhdGUubm93KCk7XG4gICAgaWYgKGZyYW1lVGltZUxpbWl0ICYmIGN1cnJlbnRUaW1lIC0gbGFzdFRpbWUgPCBmcmFtZVRpbWVMaW1pdClcbiAgICAgICAgcmV0dXJuO1xuICAgIHZhciBpID0gMDtcbiAgICBmcmFtZVRpbWUgPSBjdXJyZW50VGltZSAtIGxhc3RUaW1lO1xuICAgIGxhc3RUaW1lID0gY3VycmVudFRpbWU7XG4gICAgZXZlbnRIYW5kbGVyLmVtaXQoJ3ByZXJlbmRlcicpO1xuICAgIGZvciAoaSA9IDA7IGkgPCBuZXh0VGlja1F1ZXVlLmxlbmd0aDsgaSsrKVxuICAgICAgICBuZXh0VGlja1F1ZXVlW2ldLmNhbGwodGhpcyk7XG4gICAgbmV4dFRpY2tRdWV1ZS5zcGxpY2UoMCk7XG4gICAgd2hpbGUgKGRlZmVyUXVldWUubGVuZ3RoICYmIERhdGUubm93KCkgLSBjdXJyZW50VGltZSA8IE1BWF9ERUZFUl9GUkFNRV9USU1FKSB7XG4gICAgICAgIGRlZmVyUXVldWUuc2hpZnQoKS5jYWxsKHRoaXMpO1xuICAgIH1cbiAgICBmb3IgKGkgPSAwOyBpIDwgY29udGV4dHMubGVuZ3RoOyBpKyspXG4gICAgICAgIGNvbnRleHRzW2ldLnVwZGF0ZSgpO1xuICAgIGV2ZW50SGFuZGxlci5lbWl0KCdwb3N0cmVuZGVyJyk7XG59O1xuZnVuY3Rpb24gbG9vcCgpIHtcbiAgICBpZiAob3B0aW9ucy5ydW5Mb29wKSB7XG4gICAgICAgIEVuZ2luZS5zdGVwKCk7XG4gICAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUobG9vcCk7XG4gICAgfSBlbHNlXG4gICAgICAgIGxvb3BFbmFibGVkID0gZmFsc2U7XG59XG53aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGxvb3ApO1xuZnVuY3Rpb24gaGFuZGxlUmVzaXplKGV2ZW50KSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjb250ZXh0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb250ZXh0c1tpXS5lbWl0KCdyZXNpemUnKTtcbiAgICB9XG4gICAgZXZlbnRIYW5kbGVyLmVtaXQoJ3Jlc2l6ZScpO1xufVxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIGhhbmRsZVJlc2l6ZSwgZmFsc2UpO1xuaGFuZGxlUmVzaXplKCk7XG5mdW5jdGlvbiBpbml0aWFsaXplKCkge1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICB9LCB0cnVlKTtcbiAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQoJ2ZhbW91cy1yb290Jyk7XG4gICAgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2ZhbW91cy1yb290Jyk7XG59XG52YXIgaW5pdGlhbGl6ZWQgPSBmYWxzZTtcbkVuZ2luZS5waXBlID0gZnVuY3Rpb24gcGlwZSh0YXJnZXQpIHtcbiAgICBpZiAodGFyZ2V0LnN1YnNjcmliZSBpbnN0YW5jZW9mIEZ1bmN0aW9uKVxuICAgICAgICByZXR1cm4gdGFyZ2V0LnN1YnNjcmliZShFbmdpbmUpO1xuICAgIGVsc2VcbiAgICAgICAgcmV0dXJuIGV2ZW50SGFuZGxlci5waXBlKHRhcmdldCk7XG59O1xuRW5naW5lLnVucGlwZSA9IGZ1bmN0aW9uIHVucGlwZSh0YXJnZXQpIHtcbiAgICBpZiAodGFyZ2V0LnVuc3Vic2NyaWJlIGluc3RhbmNlb2YgRnVuY3Rpb24pXG4gICAgICAgIHJldHVybiB0YXJnZXQudW5zdWJzY3JpYmUoRW5naW5lKTtcbiAgICBlbHNlXG4gICAgICAgIHJldHVybiBldmVudEhhbmRsZXIudW5waXBlKHRhcmdldCk7XG59O1xuRW5naW5lLm9uID0gZnVuY3Rpb24gb24odHlwZSwgaGFuZGxlcikge1xuICAgIGlmICghKHR5cGUgaW4gZXZlbnRGb3J3YXJkZXJzKSkge1xuICAgICAgICBldmVudEZvcndhcmRlcnNbdHlwZV0gPSBldmVudEhhbmRsZXIuZW1pdC5iaW5kKGV2ZW50SGFuZGxlciwgdHlwZSk7XG4gICAgICAgIGlmIChkb2N1bWVudC5ib2R5KSB7XG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIodHlwZSwgZXZlbnRGb3J3YXJkZXJzW3R5cGVdKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIEVuZ2luZS5uZXh0VGljayhmdW5jdGlvbiAodHlwZSwgZm9yd2FyZGVyKSB7XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKHR5cGUsIGZvcndhcmRlcik7XG4gICAgICAgICAgICB9LmJpbmQodGhpcywgdHlwZSwgZXZlbnRGb3J3YXJkZXJzW3R5cGVdKSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGV2ZW50SGFuZGxlci5vbih0eXBlLCBoYW5kbGVyKTtcbn07XG5FbmdpbmUuZW1pdCA9IGZ1bmN0aW9uIGVtaXQodHlwZSwgZXZlbnQpIHtcbiAgICByZXR1cm4gZXZlbnRIYW5kbGVyLmVtaXQodHlwZSwgZXZlbnQpO1xufTtcbkVuZ2luZS5yZW1vdmVMaXN0ZW5lciA9IGZ1bmN0aW9uIHJlbW92ZUxpc3RlbmVyKHR5cGUsIGhhbmRsZXIpIHtcbiAgICByZXR1cm4gZXZlbnRIYW5kbGVyLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGhhbmRsZXIpO1xufTtcbkVuZ2luZS5nZXRGUFMgPSBmdW5jdGlvbiBnZXRGUFMoKSB7XG4gICAgcmV0dXJuIDEwMDAgLyBmcmFtZVRpbWU7XG59O1xuRW5naW5lLnNldEZQU0NhcCA9IGZ1bmN0aW9uIHNldEZQU0NhcChmcHMpIHtcbiAgICBmcmFtZVRpbWVMaW1pdCA9IE1hdGguZmxvb3IoMTAwMCAvIGZwcyk7XG59O1xuRW5naW5lLmdldE9wdGlvbnMgPSBmdW5jdGlvbiBnZXRPcHRpb25zKGtleSkge1xuICAgIHJldHVybiBvcHRpb25zTWFuYWdlci5nZXRPcHRpb25zKGtleSk7XG59O1xuRW5naW5lLnNldE9wdGlvbnMgPSBmdW5jdGlvbiBzZXRPcHRpb25zKG9wdGlvbnMpIHtcbiAgICByZXR1cm4gb3B0aW9uc01hbmFnZXIuc2V0T3B0aW9ucy5hcHBseShvcHRpb25zTWFuYWdlciwgYXJndW1lbnRzKTtcbn07XG5FbmdpbmUuY3JlYXRlQ29udGV4dCA9IGZ1bmN0aW9uIGNyZWF0ZUNvbnRleHQoZWwpIHtcbiAgICBpZiAoIWluaXRpYWxpemVkICYmIG9wdGlvbnMuYXBwTW9kZSlcbiAgICAgICAgRW5naW5lLm5leHRUaWNrKGluaXRpYWxpemUpO1xuICAgIHZhciBuZWVkTW91bnRDb250YWluZXIgPSBmYWxzZTtcbiAgICBpZiAoIWVsKSB7XG4gICAgICAgIGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChvcHRpb25zLmNvbnRhaW5lclR5cGUpO1xuICAgICAgICBlbC5jbGFzc0xpc3QuYWRkKG9wdGlvbnMuY29udGFpbmVyQ2xhc3MpO1xuICAgICAgICBuZWVkTW91bnRDb250YWluZXIgPSB0cnVlO1xuICAgIH1cbiAgICB2YXIgY29udGV4dCA9IG5ldyBDb250ZXh0KGVsKTtcbiAgICBFbmdpbmUucmVnaXN0ZXJDb250ZXh0KGNvbnRleHQpO1xuICAgIGlmIChuZWVkTW91bnRDb250YWluZXIpIHtcbiAgICAgICAgRW5naW5lLm5leHRUaWNrKGZ1bmN0aW9uIChjb250ZXh0LCBlbCkge1xuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChlbCk7XG4gICAgICAgICAgICBjb250ZXh0LmVtaXQoJ3Jlc2l6ZScpO1xuICAgICAgICB9LmJpbmQodGhpcywgY29udGV4dCwgZWwpKTtcbiAgICB9XG4gICAgcmV0dXJuIGNvbnRleHQ7XG59O1xuRW5naW5lLnJlZ2lzdGVyQ29udGV4dCA9IGZ1bmN0aW9uIHJlZ2lzdGVyQ29udGV4dChjb250ZXh0KSB7XG4gICAgY29udGV4dHMucHVzaChjb250ZXh0KTtcbiAgICByZXR1cm4gY29udGV4dDtcbn07XG5FbmdpbmUuZ2V0Q29udGV4dHMgPSBmdW5jdGlvbiBnZXRDb250ZXh0cygpIHtcbiAgICByZXR1cm4gY29udGV4dHM7XG59O1xuRW5naW5lLmRlcmVnaXN0ZXJDb250ZXh0ID0gZnVuY3Rpb24gZGVyZWdpc3RlckNvbnRleHQoY29udGV4dCkge1xuICAgIHZhciBpID0gY29udGV4dHMuaW5kZXhPZihjb250ZXh0KTtcbiAgICBpZiAoaSA+PSAwKVxuICAgICAgICBjb250ZXh0cy5zcGxpY2UoaSwgMSk7XG59O1xuRW5naW5lLm5leHRUaWNrID0gZnVuY3Rpb24gbmV4dFRpY2soZm4pIHtcbiAgICBuZXh0VGlja1F1ZXVlLnB1c2goZm4pO1xufTtcbkVuZ2luZS5kZWZlciA9IGZ1bmN0aW9uIGRlZmVyKGZuKSB7XG4gICAgZGVmZXJRdWV1ZS5wdXNoKGZuKTtcbn07XG5vcHRpb25zTWFuYWdlci5vbignY2hhbmdlJywgZnVuY3Rpb24gKGRhdGEpIHtcbiAgICBpZiAoZGF0YS5pZCA9PT0gJ2Zwc0NhcCcpXG4gICAgICAgIEVuZ2luZS5zZXRGUFNDYXAoZGF0YS52YWx1ZSk7XG4gICAgZWxzZSBpZiAoZGF0YS5pZCA9PT0gJ3J1bkxvb3AnKSB7XG4gICAgICAgIGlmICghbG9vcEVuYWJsZWQgJiYgZGF0YS52YWx1ZSkge1xuICAgICAgICAgICAgbG9vcEVuYWJsZWQgPSB0cnVlO1xuICAgICAgICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShsb29wKTtcbiAgICAgICAgfVxuICAgIH1cbn0pO1xubW9kdWxlLmV4cG9ydHMgPSBFbmdpbmU7IiwidmFyIGVudGl0aWVzID0gW107XG5mdW5jdGlvbiBnZXQoaWQpIHtcbiAgICByZXR1cm4gZW50aXRpZXNbaWRdO1xufVxuZnVuY3Rpb24gc2V0KGlkLCBlbnRpdHkpIHtcbiAgICBlbnRpdGllc1tpZF0gPSBlbnRpdHk7XG59XG5mdW5jdGlvbiByZWdpc3RlcihlbnRpdHkpIHtcbiAgICB2YXIgaWQgPSBlbnRpdGllcy5sZW5ndGg7XG4gICAgc2V0KGlkLCBlbnRpdHkpO1xuICAgIHJldHVybiBpZDtcbn1cbmZ1bmN0aW9uIHVucmVnaXN0ZXIoaWQpIHtcbiAgICBzZXQoaWQsIG51bGwpO1xufVxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgcmVnaXN0ZXI6IHJlZ2lzdGVyLFxuICAgIHVucmVnaXN0ZXI6IHVucmVnaXN0ZXIsXG4gICAgZ2V0OiBnZXQsXG4gICAgc2V0OiBzZXRcbn07IiwiZnVuY3Rpb24gRXZlbnRFbWl0dGVyKCkge1xuICAgIHRoaXMubGlzdGVuZXJzID0ge307XG4gICAgdGhpcy5fb3duZXIgPSB0aGlzO1xufVxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24gZW1pdCh0eXBlLCBldmVudCkge1xuICAgIHZhciBoYW5kbGVycyA9IHRoaXMubGlzdGVuZXJzW3R5cGVdO1xuICAgIGlmIChoYW5kbGVycykge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGhhbmRsZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBoYW5kbGVyc1tpXS5jYWxsKHRoaXMuX293bmVyLCBldmVudCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbiA9IGZ1bmN0aW9uIG9uKHR5cGUsIGhhbmRsZXIpIHtcbiAgICBpZiAoISh0eXBlIGluIHRoaXMubGlzdGVuZXJzKSlcbiAgICAgICAgdGhpcy5saXN0ZW5lcnNbdHlwZV0gPSBbXTtcbiAgICB2YXIgaW5kZXggPSB0aGlzLmxpc3RlbmVyc1t0eXBlXS5pbmRleE9mKGhhbmRsZXIpO1xuICAgIGlmIChpbmRleCA8IDApXG4gICAgICAgIHRoaXMubGlzdGVuZXJzW3R5cGVdLnB1c2goaGFuZGxlcik7XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lciA9IEV2ZW50RW1pdHRlci5wcm90b3R5cGUub247XG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyID0gZnVuY3Rpb24gcmVtb3ZlTGlzdGVuZXIodHlwZSwgaGFuZGxlcikge1xuICAgIHZhciBsaXN0ZW5lciA9IHRoaXMubGlzdGVuZXJzW3R5cGVdO1xuICAgIGlmIChsaXN0ZW5lciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHZhciBpbmRleCA9IGxpc3RlbmVyLmluZGV4T2YoaGFuZGxlcik7XG4gICAgICAgIGlmIChpbmRleCA+PSAwKVxuICAgICAgICAgICAgbGlzdGVuZXIuc3BsaWNlKGluZGV4LCAxKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5iaW5kVGhpcyA9IGZ1bmN0aW9uIGJpbmRUaGlzKG93bmVyKSB7XG4gICAgdGhpcy5fb3duZXIgPSBvd25lcjtcbn07XG5tb2R1bGUuZXhwb3J0cyA9IEV2ZW50RW1pdHRlcjsiLCJ2YXIgRXZlbnRFbWl0dGVyID0gcmVxdWlyZSgnLi9FdmVudEVtaXR0ZXInKTtcbmZ1bmN0aW9uIEV2ZW50SGFuZGxlcigpIHtcbiAgICBFdmVudEVtaXR0ZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB0aGlzLmRvd25zdHJlYW0gPSBbXTtcbiAgICB0aGlzLmRvd25zdHJlYW1GbiA9IFtdO1xuICAgIHRoaXMudXBzdHJlYW0gPSBbXTtcbiAgICB0aGlzLnVwc3RyZWFtTGlzdGVuZXJzID0ge307XG59XG5FdmVudEhhbmRsZXIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShFdmVudEVtaXR0ZXIucHJvdG90eXBlKTtcbkV2ZW50SGFuZGxlci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBFdmVudEhhbmRsZXI7XG5FdmVudEhhbmRsZXIuc2V0SW5wdXRIYW5kbGVyID0gZnVuY3Rpb24gc2V0SW5wdXRIYW5kbGVyKG9iamVjdCwgaGFuZGxlcikge1xuICAgIG9iamVjdC50cmlnZ2VyID0gaGFuZGxlci50cmlnZ2VyLmJpbmQoaGFuZGxlcik7XG4gICAgaWYgKGhhbmRsZXIuc3Vic2NyaWJlICYmIGhhbmRsZXIudW5zdWJzY3JpYmUpIHtcbiAgICAgICAgb2JqZWN0LnN1YnNjcmliZSA9IGhhbmRsZXIuc3Vic2NyaWJlLmJpbmQoaGFuZGxlcik7XG4gICAgICAgIG9iamVjdC51bnN1YnNjcmliZSA9IGhhbmRsZXIudW5zdWJzY3JpYmUuYmluZChoYW5kbGVyKTtcbiAgICB9XG59O1xuRXZlbnRIYW5kbGVyLnNldE91dHB1dEhhbmRsZXIgPSBmdW5jdGlvbiBzZXRPdXRwdXRIYW5kbGVyKG9iamVjdCwgaGFuZGxlcikge1xuICAgIGlmIChoYW5kbGVyIGluc3RhbmNlb2YgRXZlbnRIYW5kbGVyKVxuICAgICAgICBoYW5kbGVyLmJpbmRUaGlzKG9iamVjdCk7XG4gICAgb2JqZWN0LnBpcGUgPSBoYW5kbGVyLnBpcGUuYmluZChoYW5kbGVyKTtcbiAgICBvYmplY3QudW5waXBlID0gaGFuZGxlci51bnBpcGUuYmluZChoYW5kbGVyKTtcbiAgICBvYmplY3Qub24gPSBoYW5kbGVyLm9uLmJpbmQoaGFuZGxlcik7XG4gICAgb2JqZWN0LmFkZExpc3RlbmVyID0gb2JqZWN0Lm9uO1xuICAgIG9iamVjdC5yZW1vdmVMaXN0ZW5lciA9IGhhbmRsZXIucmVtb3ZlTGlzdGVuZXIuYmluZChoYW5kbGVyKTtcbn07XG5FdmVudEhhbmRsZXIucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbiBlbWl0KHR5cGUsIGV2ZW50KSB7XG4gICAgRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5lbWl0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgdmFyIGkgPSAwO1xuICAgIGZvciAoaSA9IDA7IGkgPCB0aGlzLmRvd25zdHJlYW0ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKHRoaXMuZG93bnN0cmVhbVtpXS50cmlnZ2VyKVxuICAgICAgICAgICAgdGhpcy5kb3duc3RyZWFtW2ldLnRyaWdnZXIodHlwZSwgZXZlbnQpO1xuICAgIH1cbiAgICBmb3IgKGkgPSAwOyBpIDwgdGhpcy5kb3duc3RyZWFtRm4ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdGhpcy5kb3duc3RyZWFtRm5baV0odHlwZSwgZXZlbnQpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbn07XG5FdmVudEhhbmRsZXIucHJvdG90eXBlLnRyaWdnZXIgPSBFdmVudEhhbmRsZXIucHJvdG90eXBlLmVtaXQ7XG5FdmVudEhhbmRsZXIucHJvdG90eXBlLnBpcGUgPSBmdW5jdGlvbiBwaXBlKHRhcmdldCkge1xuICAgIGlmICh0YXJnZXQuc3Vic2NyaWJlIGluc3RhbmNlb2YgRnVuY3Rpb24pXG4gICAgICAgIHJldHVybiB0YXJnZXQuc3Vic2NyaWJlKHRoaXMpO1xuICAgIHZhciBkb3duc3RyZWFtQ3R4ID0gdGFyZ2V0IGluc3RhbmNlb2YgRnVuY3Rpb24gPyB0aGlzLmRvd25zdHJlYW1GbiA6IHRoaXMuZG93bnN0cmVhbTtcbiAgICB2YXIgaW5kZXggPSBkb3duc3RyZWFtQ3R4LmluZGV4T2YodGFyZ2V0KTtcbiAgICBpZiAoaW5kZXggPCAwKVxuICAgICAgICBkb3duc3RyZWFtQ3R4LnB1c2godGFyZ2V0KTtcbiAgICBpZiAodGFyZ2V0IGluc3RhbmNlb2YgRnVuY3Rpb24pXG4gICAgICAgIHRhcmdldCgncGlwZScsIG51bGwpO1xuICAgIGVsc2UgaWYgKHRhcmdldC50cmlnZ2VyKVxuICAgICAgICB0YXJnZXQudHJpZ2dlcigncGlwZScsIG51bGwpO1xuICAgIHJldHVybiB0YXJnZXQ7XG59O1xuRXZlbnRIYW5kbGVyLnByb3RvdHlwZS51bnBpcGUgPSBmdW5jdGlvbiB1bnBpcGUodGFyZ2V0KSB7XG4gICAgaWYgKHRhcmdldC51bnN1YnNjcmliZSBpbnN0YW5jZW9mIEZ1bmN0aW9uKVxuICAgICAgICByZXR1cm4gdGFyZ2V0LnVuc3Vic2NyaWJlKHRoaXMpO1xuICAgIHZhciBkb3duc3RyZWFtQ3R4ID0gdGFyZ2V0IGluc3RhbmNlb2YgRnVuY3Rpb24gPyB0aGlzLmRvd25zdHJlYW1GbiA6IHRoaXMuZG93bnN0cmVhbTtcbiAgICB2YXIgaW5kZXggPSBkb3duc3RyZWFtQ3R4LmluZGV4T2YodGFyZ2V0KTtcbiAgICBpZiAoaW5kZXggPj0gMCkge1xuICAgICAgICBkb3duc3RyZWFtQ3R4LnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIGlmICh0YXJnZXQgaW5zdGFuY2VvZiBGdW5jdGlvbilcbiAgICAgICAgICAgIHRhcmdldCgndW5waXBlJywgbnVsbCk7XG4gICAgICAgIGVsc2UgaWYgKHRhcmdldC50cmlnZ2VyKVxuICAgICAgICAgICAgdGFyZ2V0LnRyaWdnZXIoJ3VucGlwZScsIG51bGwpO1xuICAgICAgICByZXR1cm4gdGFyZ2V0O1xuICAgIH0gZWxzZVxuICAgICAgICByZXR1cm4gZmFsc2U7XG59O1xuRXZlbnRIYW5kbGVyLnByb3RvdHlwZS5vbiA9IGZ1bmN0aW9uIG9uKHR5cGUsIGhhbmRsZXIpIHtcbiAgICBFdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgaWYgKCEodHlwZSBpbiB0aGlzLnVwc3RyZWFtTGlzdGVuZXJzKSkge1xuICAgICAgICB2YXIgdXBzdHJlYW1MaXN0ZW5lciA9IHRoaXMudHJpZ2dlci5iaW5kKHRoaXMsIHR5cGUpO1xuICAgICAgICB0aGlzLnVwc3RyZWFtTGlzdGVuZXJzW3R5cGVdID0gdXBzdHJlYW1MaXN0ZW5lcjtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnVwc3RyZWFtLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB0aGlzLnVwc3RyZWFtW2ldLm9uKHR5cGUsIHVwc3RyZWFtTGlzdGVuZXIpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xufTtcbkV2ZW50SGFuZGxlci5wcm90b3R5cGUuYWRkTGlzdGVuZXIgPSBFdmVudEhhbmRsZXIucHJvdG90eXBlLm9uO1xuRXZlbnRIYW5kbGVyLnByb3RvdHlwZS5zdWJzY3JpYmUgPSBmdW5jdGlvbiBzdWJzY3JpYmUoc291cmNlKSB7XG4gICAgdmFyIGluZGV4ID0gdGhpcy51cHN0cmVhbS5pbmRleE9mKHNvdXJjZSk7XG4gICAgaWYgKGluZGV4IDwgMCkge1xuICAgICAgICB0aGlzLnVwc3RyZWFtLnB1c2goc291cmNlKTtcbiAgICAgICAgZm9yICh2YXIgdHlwZSBpbiB0aGlzLnVwc3RyZWFtTGlzdGVuZXJzKSB7XG4gICAgICAgICAgICBzb3VyY2Uub24odHlwZSwgdGhpcy51cHN0cmVhbUxpc3RlbmVyc1t0eXBlXSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuRXZlbnRIYW5kbGVyLnByb3RvdHlwZS51bnN1YnNjcmliZSA9IGZ1bmN0aW9uIHVuc3Vic2NyaWJlKHNvdXJjZSkge1xuICAgIHZhciBpbmRleCA9IHRoaXMudXBzdHJlYW0uaW5kZXhPZihzb3VyY2UpO1xuICAgIGlmIChpbmRleCA+PSAwKSB7XG4gICAgICAgIHRoaXMudXBzdHJlYW0uc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgZm9yICh2YXIgdHlwZSBpbiB0aGlzLnVwc3RyZWFtTGlzdGVuZXJzKSB7XG4gICAgICAgICAgICBzb3VyY2UucmVtb3ZlTGlzdGVuZXIodHlwZSwgdGhpcy51cHN0cmVhbUxpc3RlbmVyc1t0eXBlXSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG59O1xubW9kdWxlLmV4cG9ydHMgPSBFdmVudEhhbmRsZXI7IiwidmFyIFRyYW5zZm9ybSA9IHJlcXVpcmUoJy4vVHJhbnNmb3JtJyk7XG52YXIgVHJhbnNpdGlvbmFibGUgPSByZXF1aXJlKCcuLi90cmFuc2l0aW9ucy9UcmFuc2l0aW9uYWJsZScpO1xudmFyIFRyYW5zaXRpb25hYmxlVHJhbnNmb3JtID0gcmVxdWlyZSgnLi4vdHJhbnNpdGlvbnMvVHJhbnNpdGlvbmFibGVUcmFuc2Zvcm0nKTtcbmZ1bmN0aW9uIE1vZGlmaWVyKG9wdGlvbnMpIHtcbiAgICB0aGlzLl90cmFuc2Zvcm1HZXR0ZXIgPSBudWxsO1xuICAgIHRoaXMuX29wYWNpdHlHZXR0ZXIgPSBudWxsO1xuICAgIHRoaXMuX29yaWdpbkdldHRlciA9IG51bGw7XG4gICAgdGhpcy5fYWxpZ25HZXR0ZXIgPSBudWxsO1xuICAgIHRoaXMuX3NpemVHZXR0ZXIgPSBudWxsO1xuICAgIHRoaXMuX3Byb3BvcnRpb25HZXR0ZXIgPSBudWxsO1xuICAgIHRoaXMuX2xlZ2FjeVN0YXRlcyA9IHt9O1xuICAgIHRoaXMuX291dHB1dCA9IHtcbiAgICAgICAgdHJhbnNmb3JtOiBUcmFuc2Zvcm0uaWRlbnRpdHksXG4gICAgICAgIG9wYWNpdHk6IDEsXG4gICAgICAgIG9yaWdpbjogbnVsbCxcbiAgICAgICAgYWxpZ246IG51bGwsXG4gICAgICAgIHNpemU6IG51bGwsXG4gICAgICAgIHByb3BvcnRpb25zOiBudWxsLFxuICAgICAgICB0YXJnZXQ6IG51bGxcbiAgICB9O1xuICAgIGlmIChvcHRpb25zKSB7XG4gICAgICAgIGlmIChvcHRpb25zLnRyYW5zZm9ybSlcbiAgICAgICAgICAgIHRoaXMudHJhbnNmb3JtRnJvbShvcHRpb25zLnRyYW5zZm9ybSk7XG4gICAgICAgIGlmIChvcHRpb25zLm9wYWNpdHkgIT09IHVuZGVmaW5lZClcbiAgICAgICAgICAgIHRoaXMub3BhY2l0eUZyb20ob3B0aW9ucy5vcGFjaXR5KTtcbiAgICAgICAgaWYgKG9wdGlvbnMub3JpZ2luKVxuICAgICAgICAgICAgdGhpcy5vcmlnaW5Gcm9tKG9wdGlvbnMub3JpZ2luKTtcbiAgICAgICAgaWYgKG9wdGlvbnMuYWxpZ24pXG4gICAgICAgICAgICB0aGlzLmFsaWduRnJvbShvcHRpb25zLmFsaWduKTtcbiAgICAgICAgaWYgKG9wdGlvbnMuc2l6ZSlcbiAgICAgICAgICAgIHRoaXMuc2l6ZUZyb20ob3B0aW9ucy5zaXplKTtcbiAgICAgICAgaWYgKG9wdGlvbnMucHJvcG9ydGlvbnMpXG4gICAgICAgICAgICB0aGlzLnByb3BvcnRpb25zRnJvbShvcHRpb25zLnByb3BvcnRpb25zKTtcbiAgICB9XG59XG5Nb2RpZmllci5wcm90b3R5cGUudHJhbnNmb3JtRnJvbSA9IGZ1bmN0aW9uIHRyYW5zZm9ybUZyb20odHJhbnNmb3JtKSB7XG4gICAgaWYgKHRyYW5zZm9ybSBpbnN0YW5jZW9mIEZ1bmN0aW9uKVxuICAgICAgICB0aGlzLl90cmFuc2Zvcm1HZXR0ZXIgPSB0cmFuc2Zvcm07XG4gICAgZWxzZSBpZiAodHJhbnNmb3JtIGluc3RhbmNlb2YgT2JqZWN0ICYmIHRyYW5zZm9ybS5nZXQpXG4gICAgICAgIHRoaXMuX3RyYW5zZm9ybUdldHRlciA9IHRyYW5zZm9ybS5nZXQuYmluZCh0cmFuc2Zvcm0pO1xuICAgIGVsc2Uge1xuICAgICAgICB0aGlzLl90cmFuc2Zvcm1HZXR0ZXIgPSBudWxsO1xuICAgICAgICB0aGlzLl9vdXRwdXQudHJhbnNmb3JtID0gdHJhbnNmb3JtO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbn07XG5Nb2RpZmllci5wcm90b3R5cGUub3BhY2l0eUZyb20gPSBmdW5jdGlvbiBvcGFjaXR5RnJvbShvcGFjaXR5KSB7XG4gICAgaWYgKG9wYWNpdHkgaW5zdGFuY2VvZiBGdW5jdGlvbilcbiAgICAgICAgdGhpcy5fb3BhY2l0eUdldHRlciA9IG9wYWNpdHk7XG4gICAgZWxzZSBpZiAob3BhY2l0eSBpbnN0YW5jZW9mIE9iamVjdCAmJiBvcGFjaXR5LmdldClcbiAgICAgICAgdGhpcy5fb3BhY2l0eUdldHRlciA9IG9wYWNpdHkuZ2V0LmJpbmQob3BhY2l0eSk7XG4gICAgZWxzZSB7XG4gICAgICAgIHRoaXMuX29wYWNpdHlHZXR0ZXIgPSBudWxsO1xuICAgICAgICB0aGlzLl9vdXRwdXQub3BhY2l0eSA9IG9wYWNpdHk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xufTtcbk1vZGlmaWVyLnByb3RvdHlwZS5vcmlnaW5Gcm9tID0gZnVuY3Rpb24gb3JpZ2luRnJvbShvcmlnaW4pIHtcbiAgICBpZiAob3JpZ2luIGluc3RhbmNlb2YgRnVuY3Rpb24pXG4gICAgICAgIHRoaXMuX29yaWdpbkdldHRlciA9IG9yaWdpbjtcbiAgICBlbHNlIGlmIChvcmlnaW4gaW5zdGFuY2VvZiBPYmplY3QgJiYgb3JpZ2luLmdldClcbiAgICAgICAgdGhpcy5fb3JpZ2luR2V0dGVyID0gb3JpZ2luLmdldC5iaW5kKG9yaWdpbik7XG4gICAgZWxzZSB7XG4gICAgICAgIHRoaXMuX29yaWdpbkdldHRlciA9IG51bGw7XG4gICAgICAgIHRoaXMuX291dHB1dC5vcmlnaW4gPSBvcmlnaW47XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xufTtcbk1vZGlmaWVyLnByb3RvdHlwZS5hbGlnbkZyb20gPSBmdW5jdGlvbiBhbGlnbkZyb20oYWxpZ24pIHtcbiAgICBpZiAoYWxpZ24gaW5zdGFuY2VvZiBGdW5jdGlvbilcbiAgICAgICAgdGhpcy5fYWxpZ25HZXR0ZXIgPSBhbGlnbjtcbiAgICBlbHNlIGlmIChhbGlnbiBpbnN0YW5jZW9mIE9iamVjdCAmJiBhbGlnbi5nZXQpXG4gICAgICAgIHRoaXMuX2FsaWduR2V0dGVyID0gYWxpZ24uZ2V0LmJpbmQoYWxpZ24pO1xuICAgIGVsc2Uge1xuICAgICAgICB0aGlzLl9hbGlnbkdldHRlciA9IG51bGw7XG4gICAgICAgIHRoaXMuX291dHB1dC5hbGlnbiA9IGFsaWduO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbn07XG5Nb2RpZmllci5wcm90b3R5cGUuc2l6ZUZyb20gPSBmdW5jdGlvbiBzaXplRnJvbShzaXplKSB7XG4gICAgaWYgKHNpemUgaW5zdGFuY2VvZiBGdW5jdGlvbilcbiAgICAgICAgdGhpcy5fc2l6ZUdldHRlciA9IHNpemU7XG4gICAgZWxzZSBpZiAoc2l6ZSBpbnN0YW5jZW9mIE9iamVjdCAmJiBzaXplLmdldClcbiAgICAgICAgdGhpcy5fc2l6ZUdldHRlciA9IHNpemUuZ2V0LmJpbmQoc2l6ZSk7XG4gICAgZWxzZSB7XG4gICAgICAgIHRoaXMuX3NpemVHZXR0ZXIgPSBudWxsO1xuICAgICAgICB0aGlzLl9vdXRwdXQuc2l6ZSA9IHNpemU7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xufTtcbk1vZGlmaWVyLnByb3RvdHlwZS5wcm9wb3J0aW9uc0Zyb20gPSBmdW5jdGlvbiBwcm9wb3J0aW9uc0Zyb20ocHJvcG9ydGlvbnMpIHtcbiAgICBpZiAocHJvcG9ydGlvbnMgaW5zdGFuY2VvZiBGdW5jdGlvbilcbiAgICAgICAgdGhpcy5fcHJvcG9ydGlvbkdldHRlciA9IHByb3BvcnRpb25zO1xuICAgIGVsc2UgaWYgKHByb3BvcnRpb25zIGluc3RhbmNlb2YgT2JqZWN0ICYmIHByb3BvcnRpb25zLmdldClcbiAgICAgICAgdGhpcy5fcHJvcG9ydGlvbkdldHRlciA9IHByb3BvcnRpb25zLmdldC5iaW5kKHByb3BvcnRpb25zKTtcbiAgICBlbHNlIHtcbiAgICAgICAgdGhpcy5fcHJvcG9ydGlvbkdldHRlciA9IG51bGw7XG4gICAgICAgIHRoaXMuX291dHB1dC5wcm9wb3J0aW9ucyA9IHByb3BvcnRpb25zO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbn07XG5Nb2RpZmllci5wcm90b3R5cGUuc2V0VHJhbnNmb3JtID0gZnVuY3Rpb24gc2V0VHJhbnNmb3JtKHRyYW5zZm9ybSwgdHJhbnNpdGlvbiwgY2FsbGJhY2spIHtcbiAgICBpZiAodHJhbnNpdGlvbiB8fCB0aGlzLl9sZWdhY3lTdGF0ZXMudHJhbnNmb3JtKSB7XG4gICAgICAgIGlmICghdGhpcy5fbGVnYWN5U3RhdGVzLnRyYW5zZm9ybSkge1xuICAgICAgICAgICAgdGhpcy5fbGVnYWN5U3RhdGVzLnRyYW5zZm9ybSA9IG5ldyBUcmFuc2l0aW9uYWJsZVRyYW5zZm9ybSh0aGlzLl9vdXRwdXQudHJhbnNmb3JtKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXRoaXMuX3RyYW5zZm9ybUdldHRlcilcbiAgICAgICAgICAgIHRoaXMudHJhbnNmb3JtRnJvbSh0aGlzLl9sZWdhY3lTdGF0ZXMudHJhbnNmb3JtKTtcbiAgICAgICAgdGhpcy5fbGVnYWN5U3RhdGVzLnRyYW5zZm9ybS5zZXQodHJhbnNmb3JtLCB0cmFuc2l0aW9uLCBjYWxsYmFjayk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0gZWxzZVxuICAgICAgICByZXR1cm4gdGhpcy50cmFuc2Zvcm1Gcm9tKHRyYW5zZm9ybSk7XG59O1xuTW9kaWZpZXIucHJvdG90eXBlLnNldE9wYWNpdHkgPSBmdW5jdGlvbiBzZXRPcGFjaXR5KG9wYWNpdHksIHRyYW5zaXRpb24sIGNhbGxiYWNrKSB7XG4gICAgaWYgKHRyYW5zaXRpb24gfHwgdGhpcy5fbGVnYWN5U3RhdGVzLm9wYWNpdHkpIHtcbiAgICAgICAgaWYgKCF0aGlzLl9sZWdhY3lTdGF0ZXMub3BhY2l0eSkge1xuICAgICAgICAgICAgdGhpcy5fbGVnYWN5U3RhdGVzLm9wYWNpdHkgPSBuZXcgVHJhbnNpdGlvbmFibGUodGhpcy5fb3V0cHV0Lm9wYWNpdHkpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghdGhpcy5fb3BhY2l0eUdldHRlcilcbiAgICAgICAgICAgIHRoaXMub3BhY2l0eUZyb20odGhpcy5fbGVnYWN5U3RhdGVzLm9wYWNpdHkpO1xuICAgICAgICByZXR1cm4gdGhpcy5fbGVnYWN5U3RhdGVzLm9wYWNpdHkuc2V0KG9wYWNpdHksIHRyYW5zaXRpb24sIGNhbGxiYWNrKTtcbiAgICB9IGVsc2VcbiAgICAgICAgcmV0dXJuIHRoaXMub3BhY2l0eUZyb20ob3BhY2l0eSk7XG59O1xuTW9kaWZpZXIucHJvdG90eXBlLnNldE9yaWdpbiA9IGZ1bmN0aW9uIHNldE9yaWdpbihvcmlnaW4sIHRyYW5zaXRpb24sIGNhbGxiYWNrKSB7XG4gICAgaWYgKHRyYW5zaXRpb24gfHwgdGhpcy5fbGVnYWN5U3RhdGVzLm9yaWdpbikge1xuICAgICAgICBpZiAoIXRoaXMuX2xlZ2FjeVN0YXRlcy5vcmlnaW4pIHtcbiAgICAgICAgICAgIHRoaXMuX2xlZ2FjeVN0YXRlcy5vcmlnaW4gPSBuZXcgVHJhbnNpdGlvbmFibGUodGhpcy5fb3V0cHV0Lm9yaWdpbiB8fCBbXG4gICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICAwXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXRoaXMuX29yaWdpbkdldHRlcilcbiAgICAgICAgICAgIHRoaXMub3JpZ2luRnJvbSh0aGlzLl9sZWdhY3lTdGF0ZXMub3JpZ2luKTtcbiAgICAgICAgdGhpcy5fbGVnYWN5U3RhdGVzLm9yaWdpbi5zZXQob3JpZ2luLCB0cmFuc2l0aW9uLCBjYWxsYmFjayk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0gZWxzZVxuICAgICAgICByZXR1cm4gdGhpcy5vcmlnaW5Gcm9tKG9yaWdpbik7XG59O1xuTW9kaWZpZXIucHJvdG90eXBlLnNldEFsaWduID0gZnVuY3Rpb24gc2V0QWxpZ24oYWxpZ24sIHRyYW5zaXRpb24sIGNhbGxiYWNrKSB7XG4gICAgaWYgKHRyYW5zaXRpb24gfHwgdGhpcy5fbGVnYWN5U3RhdGVzLmFsaWduKSB7XG4gICAgICAgIGlmICghdGhpcy5fbGVnYWN5U3RhdGVzLmFsaWduKSB7XG4gICAgICAgICAgICB0aGlzLl9sZWdhY3lTdGF0ZXMuYWxpZ24gPSBuZXcgVHJhbnNpdGlvbmFibGUodGhpcy5fb3V0cHV0LmFsaWduIHx8IFtcbiAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgIDBcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgICAgIGlmICghdGhpcy5fYWxpZ25HZXR0ZXIpXG4gICAgICAgICAgICB0aGlzLmFsaWduRnJvbSh0aGlzLl9sZWdhY3lTdGF0ZXMuYWxpZ24pO1xuICAgICAgICB0aGlzLl9sZWdhY3lTdGF0ZXMuYWxpZ24uc2V0KGFsaWduLCB0cmFuc2l0aW9uLCBjYWxsYmFjayk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0gZWxzZVxuICAgICAgICByZXR1cm4gdGhpcy5hbGlnbkZyb20oYWxpZ24pO1xufTtcbk1vZGlmaWVyLnByb3RvdHlwZS5zZXRTaXplID0gZnVuY3Rpb24gc2V0U2l6ZShzaXplLCB0cmFuc2l0aW9uLCBjYWxsYmFjaykge1xuICAgIGlmIChzaXplICYmICh0cmFuc2l0aW9uIHx8IHRoaXMuX2xlZ2FjeVN0YXRlcy5zaXplKSkge1xuICAgICAgICBpZiAoIXRoaXMuX2xlZ2FjeVN0YXRlcy5zaXplKSB7XG4gICAgICAgICAgICB0aGlzLl9sZWdhY3lTdGF0ZXMuc2l6ZSA9IG5ldyBUcmFuc2l0aW9uYWJsZSh0aGlzLl9vdXRwdXQuc2l6ZSB8fCBbXG4gICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICAwXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXRoaXMuX3NpemVHZXR0ZXIpXG4gICAgICAgICAgICB0aGlzLnNpemVGcm9tKHRoaXMuX2xlZ2FjeVN0YXRlcy5zaXplKTtcbiAgICAgICAgdGhpcy5fbGVnYWN5U3RhdGVzLnNpemUuc2V0KHNpemUsIHRyYW5zaXRpb24sIGNhbGxiYWNrKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSBlbHNlXG4gICAgICAgIHJldHVybiB0aGlzLnNpemVGcm9tKHNpemUpO1xufTtcbk1vZGlmaWVyLnByb3RvdHlwZS5zZXRQcm9wb3J0aW9ucyA9IGZ1bmN0aW9uIHNldFByb3BvcnRpb25zKHByb3BvcnRpb25zLCB0cmFuc2l0aW9uLCBjYWxsYmFjaykge1xuICAgIGlmIChwcm9wb3J0aW9ucyAmJiAodHJhbnNpdGlvbiB8fCB0aGlzLl9sZWdhY3lTdGF0ZXMucHJvcG9ydGlvbnMpKSB7XG4gICAgICAgIGlmICghdGhpcy5fbGVnYWN5U3RhdGVzLnByb3BvcnRpb25zKSB7XG4gICAgICAgICAgICB0aGlzLl9sZWdhY3lTdGF0ZXMucHJvcG9ydGlvbnMgPSBuZXcgVHJhbnNpdGlvbmFibGUodGhpcy5fb3V0cHV0LnByb3BvcnRpb25zIHx8IFtcbiAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgIDBcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgICAgIGlmICghdGhpcy5fcHJvcG9ydGlvbkdldHRlcilcbiAgICAgICAgICAgIHRoaXMucHJvcG9ydGlvbnNGcm9tKHRoaXMuX2xlZ2FjeVN0YXRlcy5wcm9wb3J0aW9ucyk7XG4gICAgICAgIHRoaXMuX2xlZ2FjeVN0YXRlcy5wcm9wb3J0aW9ucy5zZXQocHJvcG9ydGlvbnMsIHRyYW5zaXRpb24sIGNhbGxiYWNrKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSBlbHNlXG4gICAgICAgIHJldHVybiB0aGlzLnByb3BvcnRpb25zRnJvbShwcm9wb3J0aW9ucyk7XG59O1xuTW9kaWZpZXIucHJvdG90eXBlLmhhbHQgPSBmdW5jdGlvbiBoYWx0KCkge1xuICAgIGlmICh0aGlzLl9sZWdhY3lTdGF0ZXMudHJhbnNmb3JtKVxuICAgICAgICB0aGlzLl9sZWdhY3lTdGF0ZXMudHJhbnNmb3JtLmhhbHQoKTtcbiAgICBpZiAodGhpcy5fbGVnYWN5U3RhdGVzLm9wYWNpdHkpXG4gICAgICAgIHRoaXMuX2xlZ2FjeVN0YXRlcy5vcGFjaXR5LmhhbHQoKTtcbiAgICBpZiAodGhpcy5fbGVnYWN5U3RhdGVzLm9yaWdpbilcbiAgICAgICAgdGhpcy5fbGVnYWN5U3RhdGVzLm9yaWdpbi5oYWx0KCk7XG4gICAgaWYgKHRoaXMuX2xlZ2FjeVN0YXRlcy5hbGlnbilcbiAgICAgICAgdGhpcy5fbGVnYWN5U3RhdGVzLmFsaWduLmhhbHQoKTtcbiAgICBpZiAodGhpcy5fbGVnYWN5U3RhdGVzLnNpemUpXG4gICAgICAgIHRoaXMuX2xlZ2FjeVN0YXRlcy5zaXplLmhhbHQoKTtcbiAgICBpZiAodGhpcy5fbGVnYWN5U3RhdGVzLnByb3BvcnRpb25zKVxuICAgICAgICB0aGlzLl9sZWdhY3lTdGF0ZXMucHJvcG9ydGlvbnMuaGFsdCgpO1xuICAgIHRoaXMuX3RyYW5zZm9ybUdldHRlciA9IG51bGw7XG4gICAgdGhpcy5fb3BhY2l0eUdldHRlciA9IG51bGw7XG4gICAgdGhpcy5fb3JpZ2luR2V0dGVyID0gbnVsbDtcbiAgICB0aGlzLl9hbGlnbkdldHRlciA9IG51bGw7XG4gICAgdGhpcy5fc2l6ZUdldHRlciA9IG51bGw7XG4gICAgdGhpcy5fcHJvcG9ydGlvbkdldHRlciA9IG51bGw7XG59O1xuTW9kaWZpZXIucHJvdG90eXBlLmdldFRyYW5zZm9ybSA9IGZ1bmN0aW9uIGdldFRyYW5zZm9ybSgpIHtcbiAgICByZXR1cm4gdGhpcy5fdHJhbnNmb3JtR2V0dGVyKCk7XG59O1xuTW9kaWZpZXIucHJvdG90eXBlLmdldEZpbmFsVHJhbnNmb3JtID0gZnVuY3Rpb24gZ2V0RmluYWxUcmFuc2Zvcm0oKSB7XG4gICAgcmV0dXJuIHRoaXMuX2xlZ2FjeVN0YXRlcy50cmFuc2Zvcm0gPyB0aGlzLl9sZWdhY3lTdGF0ZXMudHJhbnNmb3JtLmdldEZpbmFsKCkgOiB0aGlzLl9vdXRwdXQudHJhbnNmb3JtO1xufTtcbk1vZGlmaWVyLnByb3RvdHlwZS5nZXRPcGFjaXR5ID0gZnVuY3Rpb24gZ2V0T3BhY2l0eSgpIHtcbiAgICByZXR1cm4gdGhpcy5fb3BhY2l0eUdldHRlcigpO1xufTtcbk1vZGlmaWVyLnByb3RvdHlwZS5nZXRPcmlnaW4gPSBmdW5jdGlvbiBnZXRPcmlnaW4oKSB7XG4gICAgcmV0dXJuIHRoaXMuX29yaWdpbkdldHRlcigpO1xufTtcbk1vZGlmaWVyLnByb3RvdHlwZS5nZXRBbGlnbiA9IGZ1bmN0aW9uIGdldEFsaWduKCkge1xuICAgIHJldHVybiB0aGlzLl9hbGlnbkdldHRlcigpO1xufTtcbk1vZGlmaWVyLnByb3RvdHlwZS5nZXRTaXplID0gZnVuY3Rpb24gZ2V0U2l6ZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fc2l6ZUdldHRlciA/IHRoaXMuX3NpemVHZXR0ZXIoKSA6IHRoaXMuX291dHB1dC5zaXplO1xufTtcbk1vZGlmaWVyLnByb3RvdHlwZS5nZXRQcm9wb3J0aW9ucyA9IGZ1bmN0aW9uIGdldFByb3BvcnRpb25zKCkge1xuICAgIHJldHVybiB0aGlzLl9wcm9wb3J0aW9uR2V0dGVyID8gdGhpcy5fcHJvcG9ydGlvbkdldHRlcigpIDogdGhpcy5fb3V0cHV0LnByb3BvcnRpb25zO1xufTtcbmZ1bmN0aW9uIF91cGRhdGUoKSB7XG4gICAgaWYgKHRoaXMuX3RyYW5zZm9ybUdldHRlcilcbiAgICAgICAgdGhpcy5fb3V0cHV0LnRyYW5zZm9ybSA9IHRoaXMuX3RyYW5zZm9ybUdldHRlcigpO1xuICAgIGlmICh0aGlzLl9vcGFjaXR5R2V0dGVyKVxuICAgICAgICB0aGlzLl9vdXRwdXQub3BhY2l0eSA9IHRoaXMuX29wYWNpdHlHZXR0ZXIoKTtcbiAgICBpZiAodGhpcy5fb3JpZ2luR2V0dGVyKVxuICAgICAgICB0aGlzLl9vdXRwdXQub3JpZ2luID0gdGhpcy5fb3JpZ2luR2V0dGVyKCk7XG4gICAgaWYgKHRoaXMuX2FsaWduR2V0dGVyKVxuICAgICAgICB0aGlzLl9vdXRwdXQuYWxpZ24gPSB0aGlzLl9hbGlnbkdldHRlcigpO1xuICAgIGlmICh0aGlzLl9zaXplR2V0dGVyKVxuICAgICAgICB0aGlzLl9vdXRwdXQuc2l6ZSA9IHRoaXMuX3NpemVHZXR0ZXIoKTtcbiAgICBpZiAodGhpcy5fcHJvcG9ydGlvbkdldHRlcilcbiAgICAgICAgdGhpcy5fb3V0cHV0LnByb3BvcnRpb25zID0gdGhpcy5fcHJvcG9ydGlvbkdldHRlcigpO1xufVxuTW9kaWZpZXIucHJvdG90eXBlLm1vZGlmeSA9IGZ1bmN0aW9uIG1vZGlmeSh0YXJnZXQpIHtcbiAgICBfdXBkYXRlLmNhbGwodGhpcyk7XG4gICAgdGhpcy5fb3V0cHV0LnRhcmdldCA9IHRhcmdldDtcbiAgICByZXR1cm4gdGhpcy5fb3V0cHV0O1xufTtcbm1vZHVsZS5leHBvcnRzID0gTW9kaWZpZXI7IiwidmFyIEV2ZW50SGFuZGxlciA9IHJlcXVpcmUoJy4vRXZlbnRIYW5kbGVyJyk7XG5mdW5jdGlvbiBPcHRpb25zTWFuYWdlcih2YWx1ZSkge1xuICAgIHRoaXMuX3ZhbHVlID0gdmFsdWU7XG4gICAgdGhpcy5ldmVudE91dHB1dCA9IG51bGw7XG59XG5PcHRpb25zTWFuYWdlci5wYXRjaCA9IGZ1bmN0aW9uIHBhdGNoT2JqZWN0KHNvdXJjZSwgZGF0YSkge1xuICAgIHZhciBtYW5hZ2VyID0gbmV3IE9wdGlvbnNNYW5hZ2VyKHNvdXJjZSk7XG4gICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspXG4gICAgICAgIG1hbmFnZXIucGF0Y2goYXJndW1lbnRzW2ldKTtcbiAgICByZXR1cm4gc291cmNlO1xufTtcbmZ1bmN0aW9uIF9jcmVhdGVFdmVudE91dHB1dCgpIHtcbiAgICB0aGlzLmV2ZW50T3V0cHV0ID0gbmV3IEV2ZW50SGFuZGxlcigpO1xuICAgIHRoaXMuZXZlbnRPdXRwdXQuYmluZFRoaXModGhpcyk7XG4gICAgRXZlbnRIYW5kbGVyLnNldE91dHB1dEhhbmRsZXIodGhpcywgdGhpcy5ldmVudE91dHB1dCk7XG59XG5PcHRpb25zTWFuYWdlci5wcm90b3R5cGUucGF0Y2ggPSBmdW5jdGlvbiBwYXRjaCgpIHtcbiAgICB2YXIgbXlTdGF0ZSA9IHRoaXMuX3ZhbHVlO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBkYXRhID0gYXJndW1lbnRzW2ldO1xuICAgICAgICBmb3IgKHZhciBrIGluIGRhdGEpIHtcbiAgICAgICAgICAgIGlmIChrIGluIG15U3RhdGUgJiYgKGRhdGFba10gJiYgZGF0YVtrXS5jb25zdHJ1Y3RvciA9PT0gT2JqZWN0KSAmJiAobXlTdGF0ZVtrXSAmJiBteVN0YXRlW2tdLmNvbnN0cnVjdG9yID09PSBPYmplY3QpKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFteVN0YXRlLmhhc093blByb3BlcnR5KGspKVxuICAgICAgICAgICAgICAgICAgICBteVN0YXRlW2tdID0gT2JqZWN0LmNyZWF0ZShteVN0YXRlW2tdKTtcbiAgICAgICAgICAgICAgICB0aGlzLmtleShrKS5wYXRjaChkYXRhW2tdKTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5ldmVudE91dHB1dClcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5ldmVudE91dHB1dC5lbWl0KCdjaGFuZ2UnLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogayxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiB0aGlzLmtleShrKS52YWx1ZSgpXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlXG4gICAgICAgICAgICAgICAgdGhpcy5zZXQoaywgZGF0YVtrXSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuT3B0aW9uc01hbmFnZXIucHJvdG90eXBlLnNldE9wdGlvbnMgPSBPcHRpb25zTWFuYWdlci5wcm90b3R5cGUucGF0Y2g7XG5PcHRpb25zTWFuYWdlci5wcm90b3R5cGUua2V5ID0gZnVuY3Rpb24ga2V5KGlkZW50aWZpZXIpIHtcbiAgICB2YXIgcmVzdWx0ID0gbmV3IE9wdGlvbnNNYW5hZ2VyKHRoaXMuX3ZhbHVlW2lkZW50aWZpZXJdKTtcbiAgICBpZiAoIShyZXN1bHQuX3ZhbHVlIGluc3RhbmNlb2YgT2JqZWN0KSB8fCByZXN1bHQuX3ZhbHVlIGluc3RhbmNlb2YgQXJyYXkpXG4gICAgICAgIHJlc3VsdC5fdmFsdWUgPSB7fTtcbiAgICByZXR1cm4gcmVzdWx0O1xufTtcbk9wdGlvbnNNYW5hZ2VyLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbiBnZXQoa2V5KSB7XG4gICAgcmV0dXJuIGtleSA/IHRoaXMuX3ZhbHVlW2tleV0gOiB0aGlzLl92YWx1ZTtcbn07XG5PcHRpb25zTWFuYWdlci5wcm90b3R5cGUuZ2V0T3B0aW9ucyA9IE9wdGlvbnNNYW5hZ2VyLnByb3RvdHlwZS5nZXQ7XG5PcHRpb25zTWFuYWdlci5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24gc2V0KGtleSwgdmFsdWUpIHtcbiAgICB2YXIgb3JpZ2luYWxWYWx1ZSA9IHRoaXMuZ2V0KGtleSk7XG4gICAgdGhpcy5fdmFsdWVba2V5XSA9IHZhbHVlO1xuICAgIGlmICh0aGlzLmV2ZW50T3V0cHV0ICYmIHZhbHVlICE9PSBvcmlnaW5hbFZhbHVlKVxuICAgICAgICB0aGlzLmV2ZW50T3V0cHV0LmVtaXQoJ2NoYW5nZScsIHtcbiAgICAgICAgICAgIGlkOiBrZXksXG4gICAgICAgICAgICB2YWx1ZTogdmFsdWVcbiAgICAgICAgfSk7XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuT3B0aW9uc01hbmFnZXIucHJvdG90eXBlLm9uID0gZnVuY3Rpb24gb24oKSB7XG4gICAgX2NyZWF0ZUV2ZW50T3V0cHV0LmNhbGwodGhpcyk7XG4gICAgcmV0dXJuIHRoaXMub24uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn07XG5PcHRpb25zTWFuYWdlci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXIgPSBmdW5jdGlvbiByZW1vdmVMaXN0ZW5lcigpIHtcbiAgICBfY3JlYXRlRXZlbnRPdXRwdXQuY2FsbCh0aGlzKTtcbiAgICByZXR1cm4gdGhpcy5yZW1vdmVMaXN0ZW5lci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xufTtcbk9wdGlvbnNNYW5hZ2VyLnByb3RvdHlwZS5waXBlID0gZnVuY3Rpb24gcGlwZSgpIHtcbiAgICBfY3JlYXRlRXZlbnRPdXRwdXQuY2FsbCh0aGlzKTtcbiAgICByZXR1cm4gdGhpcy5waXBlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG59O1xuT3B0aW9uc01hbmFnZXIucHJvdG90eXBlLnVucGlwZSA9IGZ1bmN0aW9uIHVucGlwZSgpIHtcbiAgICBfY3JlYXRlRXZlbnRPdXRwdXQuY2FsbCh0aGlzKTtcbiAgICByZXR1cm4gdGhpcy51bnBpcGUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn07XG5tb2R1bGUuZXhwb3J0cyA9IE9wdGlvbnNNYW5hZ2VyOyIsInZhciBFbnRpdHkgPSByZXF1aXJlKCcuL0VudGl0eScpO1xudmFyIFNwZWNQYXJzZXIgPSByZXF1aXJlKCcuL1NwZWNQYXJzZXInKTtcbmZ1bmN0aW9uIFJlbmRlck5vZGUob2JqZWN0KSB7XG4gICAgdGhpcy5fb2JqZWN0ID0gbnVsbDtcbiAgICB0aGlzLl9jaGlsZCA9IG51bGw7XG4gICAgdGhpcy5faGFzTXVsdGlwbGVDaGlsZHJlbiA9IGZhbHNlO1xuICAgIHRoaXMuX2lzUmVuZGVyYWJsZSA9IGZhbHNlO1xuICAgIHRoaXMuX2lzTW9kaWZpZXIgPSBmYWxzZTtcbiAgICB0aGlzLl9yZXN1bHRDYWNoZSA9IHt9O1xuICAgIHRoaXMuX3ByZXZSZXN1bHRzID0ge307XG4gICAgdGhpcy5fY2hpbGRSZXN1bHQgPSBudWxsO1xuICAgIGlmIChvYmplY3QpXG4gICAgICAgIHRoaXMuc2V0KG9iamVjdCk7XG59XG5SZW5kZXJOb2RlLnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbiBhZGQoY2hpbGQpIHtcbiAgICB2YXIgY2hpbGROb2RlID0gY2hpbGQgaW5zdGFuY2VvZiBSZW5kZXJOb2RlID8gY2hpbGQgOiBuZXcgUmVuZGVyTm9kZShjaGlsZCk7XG4gICAgaWYgKHRoaXMuX2NoaWxkIGluc3RhbmNlb2YgQXJyYXkpXG4gICAgICAgIHRoaXMuX2NoaWxkLnB1c2goY2hpbGROb2RlKTtcbiAgICBlbHNlIGlmICh0aGlzLl9jaGlsZCkge1xuICAgICAgICB0aGlzLl9jaGlsZCA9IFtcbiAgICAgICAgICAgIHRoaXMuX2NoaWxkLFxuICAgICAgICAgICAgY2hpbGROb2RlXG4gICAgICAgIF07XG4gICAgICAgIHRoaXMuX2hhc011bHRpcGxlQ2hpbGRyZW4gPSB0cnVlO1xuICAgICAgICB0aGlzLl9jaGlsZFJlc3VsdCA9IFtdO1xuICAgIH0gZWxzZVxuICAgICAgICB0aGlzLl9jaGlsZCA9IGNoaWxkTm9kZTtcbiAgICByZXR1cm4gY2hpbGROb2RlO1xufTtcblJlbmRlck5vZGUucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uIGdldCgpIHtcbiAgICByZXR1cm4gdGhpcy5fb2JqZWN0IHx8ICh0aGlzLl9oYXNNdWx0aXBsZUNoaWxkcmVuID8gbnVsbCA6IHRoaXMuX2NoaWxkID8gdGhpcy5fY2hpbGQuZ2V0KCkgOiBudWxsKTtcbn07XG5SZW5kZXJOb2RlLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbiBzZXQoY2hpbGQpIHtcbiAgICB0aGlzLl9jaGlsZFJlc3VsdCA9IG51bGw7XG4gICAgdGhpcy5faGFzTXVsdGlwbGVDaGlsZHJlbiA9IGZhbHNlO1xuICAgIHRoaXMuX2lzUmVuZGVyYWJsZSA9IGNoaWxkLnJlbmRlciA/IHRydWUgOiBmYWxzZTtcbiAgICB0aGlzLl9pc01vZGlmaWVyID0gY2hpbGQubW9kaWZ5ID8gdHJ1ZSA6IGZhbHNlO1xuICAgIHRoaXMuX29iamVjdCA9IGNoaWxkO1xuICAgIHRoaXMuX2NoaWxkID0gbnVsbDtcbiAgICBpZiAoY2hpbGQgaW5zdGFuY2VvZiBSZW5kZXJOb2RlKVxuICAgICAgICByZXR1cm4gY2hpbGQ7XG4gICAgZWxzZVxuICAgICAgICByZXR1cm4gdGhpcztcbn07XG5SZW5kZXJOb2RlLnByb3RvdHlwZS5nZXRTaXplID0gZnVuY3Rpb24gZ2V0U2l6ZSgpIHtcbiAgICB2YXIgcmVzdWx0ID0gbnVsbDtcbiAgICB2YXIgdGFyZ2V0ID0gdGhpcy5nZXQoKTtcbiAgICBpZiAodGFyZ2V0ICYmIHRhcmdldC5nZXRTaXplKVxuICAgICAgICByZXN1bHQgPSB0YXJnZXQuZ2V0U2l6ZSgpO1xuICAgIGlmICghcmVzdWx0ICYmIHRoaXMuX2NoaWxkICYmIHRoaXMuX2NoaWxkLmdldFNpemUpXG4gICAgICAgIHJlc3VsdCA9IHRoaXMuX2NoaWxkLmdldFNpemUoKTtcbiAgICByZXR1cm4gcmVzdWx0O1xufTtcbmZ1bmN0aW9uIF9hcHBseUNvbW1pdChzcGVjLCBjb250ZXh0LCBjYWNoZVN0b3JhZ2UpIHtcbiAgICB2YXIgcmVzdWx0ID0gU3BlY1BhcnNlci5wYXJzZShzcGVjLCBjb250ZXh0KTtcbiAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKHJlc3VsdCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBpZCA9IGtleXNbaV07XG4gICAgICAgIHZhciBjaGlsZE5vZGUgPSBFbnRpdHkuZ2V0KGlkKTtcbiAgICAgICAgdmFyIGNvbW1pdFBhcmFtcyA9IHJlc3VsdFtpZF07XG4gICAgICAgIGNvbW1pdFBhcmFtcy5hbGxvY2F0b3IgPSBjb250ZXh0LmFsbG9jYXRvcjtcbiAgICAgICAgdmFyIGNvbW1pdFJlc3VsdCA9IGNoaWxkTm9kZS5jb21taXQoY29tbWl0UGFyYW1zKTtcbiAgICAgICAgaWYgKGNvbW1pdFJlc3VsdClcbiAgICAgICAgICAgIF9hcHBseUNvbW1pdChjb21taXRSZXN1bHQsIGNvbnRleHQsIGNhY2hlU3RvcmFnZSk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGNhY2hlU3RvcmFnZVtpZF0gPSBjb21taXRQYXJhbXM7XG4gICAgfVxufVxuUmVuZGVyTm9kZS5wcm90b3R5cGUuY29tbWl0ID0gZnVuY3Rpb24gY29tbWl0KGNvbnRleHQpIHtcbiAgICB2YXIgcHJldktleXMgPSBPYmplY3Qua2V5cyh0aGlzLl9wcmV2UmVzdWx0cyk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwcmV2S2V5cy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgaWQgPSBwcmV2S2V5c1tpXTtcbiAgICAgICAgaWYgKHRoaXMuX3Jlc3VsdENhY2hlW2lkXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB2YXIgb2JqZWN0ID0gRW50aXR5LmdldChpZCk7XG4gICAgICAgICAgICBpZiAob2JqZWN0LmNsZWFudXApXG4gICAgICAgICAgICAgICAgb2JqZWN0LmNsZWFudXAoY29udGV4dC5hbGxvY2F0b3IpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHRoaXMuX3ByZXZSZXN1bHRzID0gdGhpcy5fcmVzdWx0Q2FjaGU7XG4gICAgdGhpcy5fcmVzdWx0Q2FjaGUgPSB7fTtcbiAgICBfYXBwbHlDb21taXQodGhpcy5yZW5kZXIoKSwgY29udGV4dCwgdGhpcy5fcmVzdWx0Q2FjaGUpO1xufTtcblJlbmRlck5vZGUucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICBpZiAodGhpcy5faXNSZW5kZXJhYmxlKVxuICAgICAgICByZXR1cm4gdGhpcy5fb2JqZWN0LnJlbmRlcigpO1xuICAgIHZhciByZXN1bHQgPSBudWxsO1xuICAgIGlmICh0aGlzLl9oYXNNdWx0aXBsZUNoaWxkcmVuKSB7XG4gICAgICAgIHJlc3VsdCA9IHRoaXMuX2NoaWxkUmVzdWx0O1xuICAgICAgICB2YXIgY2hpbGRyZW4gPSB0aGlzLl9jaGlsZDtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgcmVzdWx0W2ldID0gY2hpbGRyZW5baV0ucmVuZGVyKCk7XG4gICAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHRoaXMuX2NoaWxkKVxuICAgICAgICByZXN1bHQgPSB0aGlzLl9jaGlsZC5yZW5kZXIoKTtcbiAgICByZXR1cm4gdGhpcy5faXNNb2RpZmllciA/IHRoaXMuX29iamVjdC5tb2RpZnkocmVzdWx0KSA6IHJlc3VsdDtcbn07XG5tb2R1bGUuZXhwb3J0cyA9IFJlbmRlck5vZGU7IiwidmFyIFRyYW5zZm9ybSA9IHJlcXVpcmUoJy4vVHJhbnNmb3JtJyk7XG5mdW5jdGlvbiBTcGVjUGFyc2VyKCkge1xuICAgIHRoaXMucmVzdWx0ID0ge307XG59XG5TcGVjUGFyc2VyLl9pbnN0YW5jZSA9IG5ldyBTcGVjUGFyc2VyKCk7XG5TcGVjUGFyc2VyLnBhcnNlID0gZnVuY3Rpb24gcGFyc2Uoc3BlYywgY29udGV4dCkge1xuICAgIHJldHVybiBTcGVjUGFyc2VyLl9pbnN0YW5jZS5wYXJzZShzcGVjLCBjb250ZXh0KTtcbn07XG5TcGVjUGFyc2VyLnByb3RvdHlwZS5wYXJzZSA9IGZ1bmN0aW9uIHBhcnNlKHNwZWMsIGNvbnRleHQpIHtcbiAgICB0aGlzLnJlc2V0KCk7XG4gICAgdGhpcy5fcGFyc2VTcGVjKHNwZWMsIGNvbnRleHQsIFRyYW5zZm9ybS5pZGVudGl0eSk7XG4gICAgcmV0dXJuIHRoaXMucmVzdWx0O1xufTtcblNwZWNQYXJzZXIucHJvdG90eXBlLnJlc2V0ID0gZnVuY3Rpb24gcmVzZXQoKSB7XG4gICAgdGhpcy5yZXN1bHQgPSB7fTtcbn07XG5mdW5jdGlvbiBfdmVjSW5Db250ZXh0KHYsIG0pIHtcbiAgICByZXR1cm4gW1xuICAgICAgICB2WzBdICogbVswXSArIHZbMV0gKiBtWzRdICsgdlsyXSAqIG1bOF0sXG4gICAgICAgIHZbMF0gKiBtWzFdICsgdlsxXSAqIG1bNV0gKyB2WzJdICogbVs5XSxcbiAgICAgICAgdlswXSAqIG1bMl0gKyB2WzFdICogbVs2XSArIHZbMl0gKiBtWzEwXVxuICAgIF07XG59XG52YXIgX3plcm9aZXJvID0gW1xuICAgICAgICAwLFxuICAgICAgICAwXG4gICAgXTtcblNwZWNQYXJzZXIucHJvdG90eXBlLl9wYXJzZVNwZWMgPSBmdW5jdGlvbiBfcGFyc2VTcGVjKHNwZWMsIHBhcmVudENvbnRleHQsIHNpemVDb250ZXh0KSB7XG4gICAgdmFyIGlkO1xuICAgIHZhciB0YXJnZXQ7XG4gICAgdmFyIHRyYW5zZm9ybTtcbiAgICB2YXIgb3BhY2l0eTtcbiAgICB2YXIgb3JpZ2luO1xuICAgIHZhciBhbGlnbjtcbiAgICB2YXIgc2l6ZTtcbiAgICBpZiAodHlwZW9mIHNwZWMgPT09ICdudW1iZXInKSB7XG4gICAgICAgIGlkID0gc3BlYztcbiAgICAgICAgdHJhbnNmb3JtID0gcGFyZW50Q29udGV4dC50cmFuc2Zvcm07XG4gICAgICAgIGFsaWduID0gcGFyZW50Q29udGV4dC5hbGlnbiB8fCBfemVyb1plcm87XG4gICAgICAgIGlmIChwYXJlbnRDb250ZXh0LnNpemUgJiYgYWxpZ24gJiYgKGFsaWduWzBdIHx8IGFsaWduWzFdKSkge1xuICAgICAgICAgICAgdmFyIGFsaWduQWRqdXN0ID0gW1xuICAgICAgICAgICAgICAgICAgICBhbGlnblswXSAqIHBhcmVudENvbnRleHQuc2l6ZVswXSxcbiAgICAgICAgICAgICAgICAgICAgYWxpZ25bMV0gKiBwYXJlbnRDb250ZXh0LnNpemVbMV0sXG4gICAgICAgICAgICAgICAgICAgIDBcbiAgICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgdHJhbnNmb3JtID0gVHJhbnNmb3JtLnRoZW5Nb3ZlKHRyYW5zZm9ybSwgX3ZlY0luQ29udGV4dChhbGlnbkFkanVzdCwgc2l6ZUNvbnRleHQpKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnJlc3VsdFtpZF0gPSB7XG4gICAgICAgICAgICB0cmFuc2Zvcm06IHRyYW5zZm9ybSxcbiAgICAgICAgICAgIG9wYWNpdHk6IHBhcmVudENvbnRleHQub3BhY2l0eSxcbiAgICAgICAgICAgIG9yaWdpbjogcGFyZW50Q29udGV4dC5vcmlnaW4gfHwgX3plcm9aZXJvLFxuICAgICAgICAgICAgYWxpZ246IHBhcmVudENvbnRleHQuYWxpZ24gfHwgX3plcm9aZXJvLFxuICAgICAgICAgICAgc2l6ZTogcGFyZW50Q29udGV4dC5zaXplXG4gICAgICAgIH07XG4gICAgfSBlbHNlIGlmICghc3BlYykge1xuICAgICAgICByZXR1cm47XG4gICAgfSBlbHNlIGlmIChzcGVjIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzcGVjLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB0aGlzLl9wYXJzZVNwZWMoc3BlY1tpXSwgcGFyZW50Q29udGV4dCwgc2l6ZUNvbnRleHQpO1xuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGFyZ2V0ID0gc3BlYy50YXJnZXQ7XG4gICAgICAgIHRyYW5zZm9ybSA9IHBhcmVudENvbnRleHQudHJhbnNmb3JtO1xuICAgICAgICBvcGFjaXR5ID0gcGFyZW50Q29udGV4dC5vcGFjaXR5O1xuICAgICAgICBvcmlnaW4gPSBwYXJlbnRDb250ZXh0Lm9yaWdpbjtcbiAgICAgICAgYWxpZ24gPSBwYXJlbnRDb250ZXh0LmFsaWduO1xuICAgICAgICBzaXplID0gcGFyZW50Q29udGV4dC5zaXplO1xuICAgICAgICB2YXIgbmV4dFNpemVDb250ZXh0ID0gc2l6ZUNvbnRleHQ7XG4gICAgICAgIGlmIChzcGVjLm9wYWNpdHkgIT09IHVuZGVmaW5lZClcbiAgICAgICAgICAgIG9wYWNpdHkgPSBwYXJlbnRDb250ZXh0Lm9wYWNpdHkgKiBzcGVjLm9wYWNpdHk7XG4gICAgICAgIGlmIChzcGVjLnRyYW5zZm9ybSlcbiAgICAgICAgICAgIHRyYW5zZm9ybSA9IFRyYW5zZm9ybS5tdWx0aXBseShwYXJlbnRDb250ZXh0LnRyYW5zZm9ybSwgc3BlYy50cmFuc2Zvcm0pO1xuICAgICAgICBpZiAoc3BlYy5vcmlnaW4pIHtcbiAgICAgICAgICAgIG9yaWdpbiA9IHNwZWMub3JpZ2luO1xuICAgICAgICAgICAgbmV4dFNpemVDb250ZXh0ID0gcGFyZW50Q29udGV4dC50cmFuc2Zvcm07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHNwZWMuYWxpZ24pXG4gICAgICAgICAgICBhbGlnbiA9IHNwZWMuYWxpZ247XG4gICAgICAgIGlmIChzcGVjLnNpemUgfHwgc3BlYy5wcm9wb3J0aW9ucykge1xuICAgICAgICAgICAgdmFyIHBhcmVudFNpemUgPSBzaXplO1xuICAgICAgICAgICAgc2l6ZSA9IFtcbiAgICAgICAgICAgICAgICBzaXplWzBdLFxuICAgICAgICAgICAgICAgIHNpemVbMV1cbiAgICAgICAgICAgIF07XG4gICAgICAgICAgICBpZiAoc3BlYy5zaXplKSB7XG4gICAgICAgICAgICAgICAgaWYgKHNwZWMuc2l6ZVswXSAhPT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgICAgICAgICBzaXplWzBdID0gc3BlYy5zaXplWzBdO1xuICAgICAgICAgICAgICAgIGlmIChzcGVjLnNpemVbMV0gIT09IHVuZGVmaW5lZClcbiAgICAgICAgICAgICAgICAgICAgc2l6ZVsxXSA9IHNwZWMuc2l6ZVsxXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChzcGVjLnByb3BvcnRpb25zKSB7XG4gICAgICAgICAgICAgICAgaWYgKHNwZWMucHJvcG9ydGlvbnNbMF0gIT09IHVuZGVmaW5lZClcbiAgICAgICAgICAgICAgICAgICAgc2l6ZVswXSA9IHNpemVbMF0gKiBzcGVjLnByb3BvcnRpb25zWzBdO1xuICAgICAgICAgICAgICAgIGlmIChzcGVjLnByb3BvcnRpb25zWzFdICE9PSB1bmRlZmluZWQpXG4gICAgICAgICAgICAgICAgICAgIHNpemVbMV0gPSBzaXplWzFdICogc3BlYy5wcm9wb3J0aW9uc1sxXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChwYXJlbnRTaXplKSB7XG4gICAgICAgICAgICAgICAgaWYgKGFsaWduICYmIChhbGlnblswXSB8fCBhbGlnblsxXSkpXG4gICAgICAgICAgICAgICAgICAgIHRyYW5zZm9ybSA9IFRyYW5zZm9ybS50aGVuTW92ZSh0cmFuc2Zvcm0sIF92ZWNJbkNvbnRleHQoW1xuICAgICAgICAgICAgICAgICAgICAgICAgYWxpZ25bMF0gKiBwYXJlbnRTaXplWzBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgYWxpZ25bMV0gKiBwYXJlbnRTaXplWzFdLFxuICAgICAgICAgICAgICAgICAgICAgICAgMFxuICAgICAgICAgICAgICAgICAgICBdLCBzaXplQ29udGV4dCkpO1xuICAgICAgICAgICAgICAgIGlmIChvcmlnaW4gJiYgKG9yaWdpblswXSB8fCBvcmlnaW5bMV0pKVxuICAgICAgICAgICAgICAgICAgICB0cmFuc2Zvcm0gPSBUcmFuc2Zvcm0ubW92ZVRoZW4oW1xuICAgICAgICAgICAgICAgICAgICAgICAgLW9yaWdpblswXSAqIHNpemVbMF0sXG4gICAgICAgICAgICAgICAgICAgICAgICAtb3JpZ2luWzFdICogc2l6ZVsxXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIDBcbiAgICAgICAgICAgICAgICAgICAgXSwgdHJhbnNmb3JtKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG5leHRTaXplQ29udGV4dCA9IHBhcmVudENvbnRleHQudHJhbnNmb3JtO1xuICAgICAgICAgICAgb3JpZ2luID0gbnVsbDtcbiAgICAgICAgICAgIGFsaWduID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9wYXJzZVNwZWModGFyZ2V0LCB7XG4gICAgICAgICAgICB0cmFuc2Zvcm06IHRyYW5zZm9ybSxcbiAgICAgICAgICAgIG9wYWNpdHk6IG9wYWNpdHksXG4gICAgICAgICAgICBvcmlnaW46IG9yaWdpbixcbiAgICAgICAgICAgIGFsaWduOiBhbGlnbixcbiAgICAgICAgICAgIHNpemU6IHNpemVcbiAgICAgICAgfSwgbmV4dFNpemVDb250ZXh0KTtcbiAgICB9XG59O1xubW9kdWxlLmV4cG9ydHMgPSBTcGVjUGFyc2VyOyIsInZhciBFbGVtZW50T3V0cHV0ID0gcmVxdWlyZSgnLi9FbGVtZW50T3V0cHV0Jyk7XG5mdW5jdGlvbiBTdXJmYWNlKG9wdGlvbnMpIHtcbiAgICBFbGVtZW50T3V0cHV0LmNhbGwodGhpcyk7XG4gICAgdGhpcy5vcHRpb25zID0ge307XG4gICAgdGhpcy5wcm9wZXJ0aWVzID0ge307XG4gICAgdGhpcy5hdHRyaWJ1dGVzID0ge307XG4gICAgdGhpcy5jb250ZW50ID0gJyc7XG4gICAgdGhpcy5jbGFzc0xpc3QgPSBbXTtcbiAgICB0aGlzLnNpemUgPSBudWxsO1xuICAgIHRoaXMuX2NsYXNzZXNEaXJ0eSA9IHRydWU7XG4gICAgdGhpcy5fc3R5bGVzRGlydHkgPSB0cnVlO1xuICAgIHRoaXMuX2F0dHJpYnV0ZXNEaXJ0eSA9IHRydWU7XG4gICAgdGhpcy5fc2l6ZURpcnR5ID0gdHJ1ZTtcbiAgICB0aGlzLl9jb250ZW50RGlydHkgPSB0cnVlO1xuICAgIHRoaXMuX3RydWVTaXplQ2hlY2sgPSB0cnVlO1xuICAgIHRoaXMuX2RpcnR5Q2xhc3NlcyA9IFtdO1xuICAgIGlmIChvcHRpb25zKVxuICAgICAgICB0aGlzLnNldE9wdGlvbnMob3B0aW9ucyk7XG4gICAgdGhpcy5fY3VycmVudFRhcmdldCA9IG51bGw7XG59XG5TdXJmYWNlLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoRWxlbWVudE91dHB1dC5wcm90b3R5cGUpO1xuU3VyZmFjZS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBTdXJmYWNlO1xuU3VyZmFjZS5wcm90b3R5cGUuZWxlbWVudFR5cGUgPSAnZGl2JztcblN1cmZhY2UucHJvdG90eXBlLmVsZW1lbnRDbGFzcyA9ICdmYW1vdXMtc3VyZmFjZSc7XG5TdXJmYWNlLnByb3RvdHlwZS5zZXRBdHRyaWJ1dGVzID0gZnVuY3Rpb24gc2V0QXR0cmlidXRlcyhhdHRyaWJ1dGVzKSB7XG4gICAgZm9yICh2YXIgbiBpbiBhdHRyaWJ1dGVzKSB7XG4gICAgICAgIGlmIChuID09PSAnc3R5bGUnKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3Qgc2V0IHN0eWxlcyB2aWEgXCJzZXRBdHRyaWJ1dGVzXCIgYXMgaXQgd2lsbCBicmVhayBGYW1vLnVzLiAgVXNlIFwic2V0UHJvcGVydGllc1wiIGluc3RlYWQuJyk7XG4gICAgICAgIHRoaXMuYXR0cmlidXRlc1tuXSA9IGF0dHJpYnV0ZXNbbl07XG4gICAgfVxuICAgIHRoaXMuX2F0dHJpYnV0ZXNEaXJ0eSA9IHRydWU7XG59O1xuU3VyZmFjZS5wcm90b3R5cGUuZ2V0QXR0cmlidXRlcyA9IGZ1bmN0aW9uIGdldEF0dHJpYnV0ZXMoKSB7XG4gICAgcmV0dXJuIHRoaXMuYXR0cmlidXRlcztcbn07XG5TdXJmYWNlLnByb3RvdHlwZS5zZXRQcm9wZXJ0aWVzID0gZnVuY3Rpb24gc2V0UHJvcGVydGllcyhwcm9wZXJ0aWVzKSB7XG4gICAgZm9yICh2YXIgbiBpbiBwcm9wZXJ0aWVzKSB7XG4gICAgICAgIHRoaXMucHJvcGVydGllc1tuXSA9IHByb3BlcnRpZXNbbl07XG4gICAgfVxuICAgIHRoaXMuX3N0eWxlc0RpcnR5ID0gdHJ1ZTtcbiAgICByZXR1cm4gdGhpcztcbn07XG5TdXJmYWNlLnByb3RvdHlwZS5nZXRQcm9wZXJ0aWVzID0gZnVuY3Rpb24gZ2V0UHJvcGVydGllcygpIHtcbiAgICByZXR1cm4gdGhpcy5wcm9wZXJ0aWVzO1xufTtcblN1cmZhY2UucHJvdG90eXBlLmFkZENsYXNzID0gZnVuY3Rpb24gYWRkQ2xhc3MoY2xhc3NOYW1lKSB7XG4gICAgaWYgKHRoaXMuY2xhc3NMaXN0LmluZGV4T2YoY2xhc3NOYW1lKSA8IDApIHtcbiAgICAgICAgdGhpcy5jbGFzc0xpc3QucHVzaChjbGFzc05hbWUpO1xuICAgICAgICB0aGlzLl9jbGFzc2VzRGlydHkgPSB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbn07XG5TdXJmYWNlLnByb3RvdHlwZS5yZW1vdmVDbGFzcyA9IGZ1bmN0aW9uIHJlbW92ZUNsYXNzKGNsYXNzTmFtZSkge1xuICAgIHZhciBpID0gdGhpcy5jbGFzc0xpc3QuaW5kZXhPZihjbGFzc05hbWUpO1xuICAgIGlmIChpID49IDApIHtcbiAgICAgICAgdGhpcy5fZGlydHlDbGFzc2VzLnB1c2godGhpcy5jbGFzc0xpc3Quc3BsaWNlKGksIDEpWzBdKTtcbiAgICAgICAgdGhpcy5fY2xhc3Nlc0RpcnR5ID0gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuU3VyZmFjZS5wcm90b3R5cGUudG9nZ2xlQ2xhc3MgPSBmdW5jdGlvbiB0b2dnbGVDbGFzcyhjbGFzc05hbWUpIHtcbiAgICB2YXIgaSA9IHRoaXMuY2xhc3NMaXN0LmluZGV4T2YoY2xhc3NOYW1lKTtcbiAgICBpZiAoaSA+PSAwKSB7XG4gICAgICAgIHRoaXMucmVtb3ZlQ2xhc3MoY2xhc3NOYW1lKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmFkZENsYXNzKGNsYXNzTmFtZSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xufTtcblN1cmZhY2UucHJvdG90eXBlLnNldENsYXNzZXMgPSBmdW5jdGlvbiBzZXRDbGFzc2VzKGNsYXNzTGlzdCkge1xuICAgIHZhciBpID0gMDtcbiAgICB2YXIgcmVtb3ZhbCA9IFtdO1xuICAgIGZvciAoaSA9IDA7IGkgPCB0aGlzLmNsYXNzTGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoY2xhc3NMaXN0LmluZGV4T2YodGhpcy5jbGFzc0xpc3RbaV0pIDwgMClcbiAgICAgICAgICAgIHJlbW92YWwucHVzaCh0aGlzLmNsYXNzTGlzdFtpXSk7XG4gICAgfVxuICAgIGZvciAoaSA9IDA7IGkgPCByZW1vdmFsLmxlbmd0aDsgaSsrKVxuICAgICAgICB0aGlzLnJlbW92ZUNsYXNzKHJlbW92YWxbaV0pO1xuICAgIGZvciAoaSA9IDA7IGkgPCBjbGFzc0xpc3QubGVuZ3RoOyBpKyspXG4gICAgICAgIHRoaXMuYWRkQ2xhc3MoY2xhc3NMaXN0W2ldKTtcbiAgICByZXR1cm4gdGhpcztcbn07XG5TdXJmYWNlLnByb3RvdHlwZS5nZXRDbGFzc0xpc3QgPSBmdW5jdGlvbiBnZXRDbGFzc0xpc3QoKSB7XG4gICAgcmV0dXJuIHRoaXMuY2xhc3NMaXN0O1xufTtcblN1cmZhY2UucHJvdG90eXBlLnNldENvbnRlbnQgPSBmdW5jdGlvbiBzZXRDb250ZW50KGNvbnRlbnQpIHtcbiAgICBpZiAodGhpcy5jb250ZW50ICE9PSBjb250ZW50KSB7XG4gICAgICAgIHRoaXMuY29udGVudCA9IGNvbnRlbnQ7XG4gICAgICAgIHRoaXMuX2NvbnRlbnREaXJ0eSA9IHRydWU7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xufTtcblN1cmZhY2UucHJvdG90eXBlLmdldENvbnRlbnQgPSBmdW5jdGlvbiBnZXRDb250ZW50KCkge1xuICAgIHJldHVybiB0aGlzLmNvbnRlbnQ7XG59O1xuU3VyZmFjZS5wcm90b3R5cGUuc2V0T3B0aW9ucyA9IGZ1bmN0aW9uIHNldE9wdGlvbnMob3B0aW9ucykge1xuICAgIGlmIChvcHRpb25zLnNpemUpXG4gICAgICAgIHRoaXMuc2V0U2l6ZShvcHRpb25zLnNpemUpO1xuICAgIGlmIChvcHRpb25zLmNsYXNzZXMpXG4gICAgICAgIHRoaXMuc2V0Q2xhc3NlcyhvcHRpb25zLmNsYXNzZXMpO1xuICAgIGlmIChvcHRpb25zLnByb3BlcnRpZXMpXG4gICAgICAgIHRoaXMuc2V0UHJvcGVydGllcyhvcHRpb25zLnByb3BlcnRpZXMpO1xuICAgIGlmIChvcHRpb25zLmF0dHJpYnV0ZXMpXG4gICAgICAgIHRoaXMuc2V0QXR0cmlidXRlcyhvcHRpb25zLmF0dHJpYnV0ZXMpO1xuICAgIGlmIChvcHRpb25zLmNvbnRlbnQpXG4gICAgICAgIHRoaXMuc2V0Q29udGVudChvcHRpb25zLmNvbnRlbnQpO1xuICAgIHJldHVybiB0aGlzO1xufTtcbmZ1bmN0aW9uIF9jbGVhbnVwQ2xhc3Nlcyh0YXJnZXQpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuX2RpcnR5Q2xhc3Nlcy5sZW5ndGg7IGkrKylcbiAgICAgICAgdGFyZ2V0LmNsYXNzTGlzdC5yZW1vdmUodGhpcy5fZGlydHlDbGFzc2VzW2ldKTtcbiAgICB0aGlzLl9kaXJ0eUNsYXNzZXMgPSBbXTtcbn1cbmZ1bmN0aW9uIF9hcHBseVN0eWxlcyh0YXJnZXQpIHtcbiAgICBmb3IgKHZhciBuIGluIHRoaXMucHJvcGVydGllcykge1xuICAgICAgICB0YXJnZXQuc3R5bGVbbl0gPSB0aGlzLnByb3BlcnRpZXNbbl07XG4gICAgfVxufVxuZnVuY3Rpb24gX2NsZWFudXBTdHlsZXModGFyZ2V0KSB7XG4gICAgZm9yICh2YXIgbiBpbiB0aGlzLnByb3BlcnRpZXMpIHtcbiAgICAgICAgdGFyZ2V0LnN0eWxlW25dID0gJyc7XG4gICAgfVxufVxuZnVuY3Rpb24gX2FwcGx5QXR0cmlidXRlcyh0YXJnZXQpIHtcbiAgICBmb3IgKHZhciBuIGluIHRoaXMuYXR0cmlidXRlcykge1xuICAgICAgICB0YXJnZXQuc2V0QXR0cmlidXRlKG4sIHRoaXMuYXR0cmlidXRlc1tuXSk7XG4gICAgfVxufVxuZnVuY3Rpb24gX2NsZWFudXBBdHRyaWJ1dGVzKHRhcmdldCkge1xuICAgIGZvciAodmFyIG4gaW4gdGhpcy5hdHRyaWJ1dGVzKSB7XG4gICAgICAgIHRhcmdldC5yZW1vdmVBdHRyaWJ1dGUobik7XG4gICAgfVxufVxuZnVuY3Rpb24gX3h5Tm90RXF1YWxzKGEsIGIpIHtcbiAgICByZXR1cm4gYSAmJiBiID8gYVswXSAhPT0gYlswXSB8fCBhWzFdICE9PSBiWzFdIDogYSAhPT0gYjtcbn1cblN1cmZhY2UucHJvdG90eXBlLnNldHVwID0gZnVuY3Rpb24gc2V0dXAoYWxsb2NhdG9yKSB7XG4gICAgdmFyIHRhcmdldCA9IGFsbG9jYXRvci5hbGxvY2F0ZSh0aGlzLmVsZW1lbnRUeXBlKTtcbiAgICBpZiAodGhpcy5lbGVtZW50Q2xhc3MpIHtcbiAgICAgICAgaWYgKHRoaXMuZWxlbWVudENsYXNzIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5lbGVtZW50Q2xhc3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICB0YXJnZXQuY2xhc3NMaXN0LmFkZCh0aGlzLmVsZW1lbnRDbGFzc1tpXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0YXJnZXQuY2xhc3NMaXN0LmFkZCh0aGlzLmVsZW1lbnRDbGFzcyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgdGFyZ2V0LnN0eWxlLmRpc3BsYXkgPSAnJztcbiAgICB0aGlzLmF0dGFjaCh0YXJnZXQpO1xuICAgIHRoaXMuX29wYWNpdHkgPSBudWxsO1xuICAgIHRoaXMuX2N1cnJlbnRUYXJnZXQgPSB0YXJnZXQ7XG4gICAgdGhpcy5fc3R5bGVzRGlydHkgPSB0cnVlO1xuICAgIHRoaXMuX2NsYXNzZXNEaXJ0eSA9IHRydWU7XG4gICAgdGhpcy5fYXR0cmlidXRlc0RpcnR5ID0gdHJ1ZTtcbiAgICB0aGlzLl9zaXplRGlydHkgPSB0cnVlO1xuICAgIHRoaXMuX2NvbnRlbnREaXJ0eSA9IHRydWU7XG4gICAgdGhpcy5fb3JpZ2luRGlydHkgPSB0cnVlO1xuICAgIHRoaXMuX3RyYW5zZm9ybURpcnR5ID0gdHJ1ZTtcbn07XG5TdXJmYWNlLnByb3RvdHlwZS5jb21taXQgPSBmdW5jdGlvbiBjb21taXQoY29udGV4dCkge1xuICAgIGlmICghdGhpcy5fY3VycmVudFRhcmdldClcbiAgICAgICAgdGhpcy5zZXR1cChjb250ZXh0LmFsbG9jYXRvcik7XG4gICAgdmFyIHRhcmdldCA9IHRoaXMuX2N1cnJlbnRUYXJnZXQ7XG4gICAgdmFyIHNpemUgPSBjb250ZXh0LnNpemU7XG4gICAgaWYgKHRoaXMuX2NsYXNzZXNEaXJ0eSkge1xuICAgICAgICBfY2xlYW51cENsYXNzZXMuY2FsbCh0aGlzLCB0YXJnZXQpO1xuICAgICAgICB2YXIgY2xhc3NMaXN0ID0gdGhpcy5nZXRDbGFzc0xpc3QoKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjbGFzc0xpc3QubGVuZ3RoOyBpKyspXG4gICAgICAgICAgICB0YXJnZXQuY2xhc3NMaXN0LmFkZChjbGFzc0xpc3RbaV0pO1xuICAgICAgICB0aGlzLl9jbGFzc2VzRGlydHkgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5fdHJ1ZVNpemVDaGVjayA9IHRydWU7XG4gICAgfVxuICAgIGlmICh0aGlzLl9zdHlsZXNEaXJ0eSkge1xuICAgICAgICBfYXBwbHlTdHlsZXMuY2FsbCh0aGlzLCB0YXJnZXQpO1xuICAgICAgICB0aGlzLl9zdHlsZXNEaXJ0eSA9IGZhbHNlO1xuICAgICAgICB0aGlzLl90cnVlU2l6ZUNoZWNrID0gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKHRoaXMuX2F0dHJpYnV0ZXNEaXJ0eSkge1xuICAgICAgICBfYXBwbHlBdHRyaWJ1dGVzLmNhbGwodGhpcywgdGFyZ2V0KTtcbiAgICAgICAgdGhpcy5fYXR0cmlidXRlc0RpcnR5ID0gZmFsc2U7XG4gICAgICAgIHRoaXMuX3RydWVTaXplQ2hlY2sgPSB0cnVlO1xuICAgIH1cbiAgICBpZiAodGhpcy5zaXplKSB7XG4gICAgICAgIHZhciBvcmlnU2l6ZSA9IGNvbnRleHQuc2l6ZTtcbiAgICAgICAgc2l6ZSA9IFtcbiAgICAgICAgICAgIHRoaXMuc2l6ZVswXSxcbiAgICAgICAgICAgIHRoaXMuc2l6ZVsxXVxuICAgICAgICBdO1xuICAgICAgICBpZiAoc2l6ZVswXSA9PT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgc2l6ZVswXSA9IG9yaWdTaXplWzBdO1xuICAgICAgICBpZiAoc2l6ZVsxXSA9PT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgc2l6ZVsxXSA9IG9yaWdTaXplWzFdO1xuICAgICAgICBpZiAoc2l6ZVswXSA9PT0gdHJ1ZSB8fCBzaXplWzFdID09PSB0cnVlKSB7XG4gICAgICAgICAgICBpZiAoc2l6ZVswXSA9PT0gdHJ1ZSAmJiAodGhpcy5fdHJ1ZVNpemVDaGVjayB8fCB0aGlzLl9zaXplWzBdID09PSAwKSkge1xuICAgICAgICAgICAgICAgIHZhciB3aWR0aCA9IHRhcmdldC5vZmZzZXRXaWR0aDtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fc2l6ZSAmJiB0aGlzLl9zaXplWzBdICE9PSB3aWR0aCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9zaXplWzBdID0gd2lkdGg7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3NpemVEaXJ0eSA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHNpemVbMF0gPSB3aWR0aDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX3NpemUpXG4gICAgICAgICAgICAgICAgICAgIHNpemVbMF0gPSB0aGlzLl9zaXplWzBdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHNpemVbMV0gPT09IHRydWUgJiYgKHRoaXMuX3RydWVTaXplQ2hlY2sgfHwgdGhpcy5fc2l6ZVsxXSA9PT0gMCkpIHtcbiAgICAgICAgICAgICAgICB2YXIgaGVpZ2h0ID0gdGFyZ2V0Lm9mZnNldEhlaWdodDtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fc2l6ZSAmJiB0aGlzLl9zaXplWzFdICE9PSBoZWlnaHQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fc2l6ZVsxXSA9IGhlaWdodDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fc2l6ZURpcnR5ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgc2l6ZVsxXSA9IGhlaWdodDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX3NpemUpXG4gICAgICAgICAgICAgICAgICAgIHNpemVbMV0gPSB0aGlzLl9zaXplWzFdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5fdHJ1ZVNpemVDaGVjayA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChfeHlOb3RFcXVhbHModGhpcy5fc2l6ZSwgc2l6ZSkpIHtcbiAgICAgICAgaWYgKCF0aGlzLl9zaXplKVxuICAgICAgICAgICAgdGhpcy5fc2l6ZSA9IFtcbiAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgIDBcbiAgICAgICAgICAgIF07XG4gICAgICAgIHRoaXMuX3NpemVbMF0gPSBzaXplWzBdO1xuICAgICAgICB0aGlzLl9zaXplWzFdID0gc2l6ZVsxXTtcbiAgICAgICAgdGhpcy5fc2l6ZURpcnR5ID0gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKHRoaXMuX3NpemVEaXJ0eSkge1xuICAgICAgICBpZiAodGhpcy5fc2l6ZSkge1xuICAgICAgICAgICAgdGFyZ2V0LnN0eWxlLndpZHRoID0gdGhpcy5zaXplICYmIHRoaXMuc2l6ZVswXSA9PT0gdHJ1ZSA/ICcnIDogdGhpcy5fc2l6ZVswXSArICdweCc7XG4gICAgICAgICAgICB0YXJnZXQuc3R5bGUuaGVpZ2h0ID0gdGhpcy5zaXplICYmIHRoaXMuc2l6ZVsxXSA9PT0gdHJ1ZSA/ICcnIDogdGhpcy5fc2l6ZVsxXSArICdweCc7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fZXZlbnRPdXRwdXQuZW1pdCgncmVzaXplJyk7XG4gICAgfVxuICAgIGlmICh0aGlzLl9jb250ZW50RGlydHkpIHtcbiAgICAgICAgdGhpcy5kZXBsb3kodGFyZ2V0KTtcbiAgICAgICAgdGhpcy5fZXZlbnRPdXRwdXQuZW1pdCgnZGVwbG95Jyk7XG4gICAgICAgIHRoaXMuX2NvbnRlbnREaXJ0eSA9IGZhbHNlO1xuICAgICAgICB0aGlzLl90cnVlU2l6ZUNoZWNrID0gdHJ1ZTtcbiAgICB9XG4gICAgRWxlbWVudE91dHB1dC5wcm90b3R5cGUuY29tbWl0LmNhbGwodGhpcywgY29udGV4dCk7XG59O1xuU3VyZmFjZS5wcm90b3R5cGUuY2xlYW51cCA9IGZ1bmN0aW9uIGNsZWFudXAoYWxsb2NhdG9yKSB7XG4gICAgdmFyIGkgPSAwO1xuICAgIHZhciB0YXJnZXQgPSB0aGlzLl9jdXJyZW50VGFyZ2V0O1xuICAgIHRoaXMuX2V2ZW50T3V0cHV0LmVtaXQoJ3JlY2FsbCcpO1xuICAgIHRoaXMucmVjYWxsKHRhcmdldCk7XG4gICAgdGFyZ2V0LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgdGFyZ2V0LnN0eWxlLm9wYWNpdHkgPSAnJztcbiAgICB0YXJnZXQuc3R5bGUud2lkdGggPSAnJztcbiAgICB0YXJnZXQuc3R5bGUuaGVpZ2h0ID0gJyc7XG4gICAgX2NsZWFudXBTdHlsZXMuY2FsbCh0aGlzLCB0YXJnZXQpO1xuICAgIF9jbGVhbnVwQXR0cmlidXRlcy5jYWxsKHRoaXMsIHRhcmdldCk7XG4gICAgdmFyIGNsYXNzTGlzdCA9IHRoaXMuZ2V0Q2xhc3NMaXN0KCk7XG4gICAgX2NsZWFudXBDbGFzc2VzLmNhbGwodGhpcywgdGFyZ2V0KTtcbiAgICBmb3IgKGkgPSAwOyBpIDwgY2xhc3NMaXN0Lmxlbmd0aDsgaSsrKVxuICAgICAgICB0YXJnZXQuY2xhc3NMaXN0LnJlbW92ZShjbGFzc0xpc3RbaV0pO1xuICAgIGlmICh0aGlzLmVsZW1lbnRDbGFzcykge1xuICAgICAgICBpZiAodGhpcy5lbGVtZW50Q2xhc3MgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IHRoaXMuZWxlbWVudENsYXNzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdGFyZ2V0LmNsYXNzTGlzdC5yZW1vdmUodGhpcy5lbGVtZW50Q2xhc3NbaV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGFyZ2V0LmNsYXNzTGlzdC5yZW1vdmUodGhpcy5lbGVtZW50Q2xhc3MpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHRoaXMuZGV0YWNoKHRhcmdldCk7XG4gICAgdGhpcy5fY3VycmVudFRhcmdldCA9IG51bGw7XG4gICAgYWxsb2NhdG9yLmRlYWxsb2NhdGUodGFyZ2V0KTtcbn07XG5TdXJmYWNlLnByb3RvdHlwZS5kZXBsb3kgPSBmdW5jdGlvbiBkZXBsb3kodGFyZ2V0KSB7XG4gICAgdmFyIGNvbnRlbnQgPSB0aGlzLmdldENvbnRlbnQoKTtcbiAgICBpZiAoY29udGVudCBpbnN0YW5jZW9mIE5vZGUpIHtcbiAgICAgICAgd2hpbGUgKHRhcmdldC5oYXNDaGlsZE5vZGVzKCkpXG4gICAgICAgICAgICB0YXJnZXQucmVtb3ZlQ2hpbGQodGFyZ2V0LmZpcnN0Q2hpbGQpO1xuICAgICAgICB0YXJnZXQuYXBwZW5kQ2hpbGQoY29udGVudCk7XG4gICAgfSBlbHNlXG4gICAgICAgIHRhcmdldC5pbm5lckhUTUwgPSBjb250ZW50O1xufTtcblN1cmZhY2UucHJvdG90eXBlLnJlY2FsbCA9IGZ1bmN0aW9uIHJlY2FsbCh0YXJnZXQpIHtcbiAgICB2YXIgZGYgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XG4gICAgd2hpbGUgKHRhcmdldC5oYXNDaGlsZE5vZGVzKCkpXG4gICAgICAgIGRmLmFwcGVuZENoaWxkKHRhcmdldC5maXJzdENoaWxkKTtcbiAgICB0aGlzLnNldENvbnRlbnQoZGYpO1xufTtcblN1cmZhY2UucHJvdG90eXBlLmdldFNpemUgPSBmdW5jdGlvbiBnZXRTaXplKCkge1xuICAgIHJldHVybiB0aGlzLl9zaXplID8gdGhpcy5fc2l6ZSA6IHRoaXMuc2l6ZTtcbn07XG5TdXJmYWNlLnByb3RvdHlwZS5zZXRTaXplID0gZnVuY3Rpb24gc2V0U2l6ZShzaXplKSB7XG4gICAgdGhpcy5zaXplID0gc2l6ZSA/IFtcbiAgICAgICAgc2l6ZVswXSxcbiAgICAgICAgc2l6ZVsxXVxuICAgIF0gOiBudWxsO1xuICAgIHRoaXMuX3NpemVEaXJ0eSA9IHRydWU7XG4gICAgcmV0dXJuIHRoaXM7XG59O1xubW9kdWxlLmV4cG9ydHMgPSBTdXJmYWNlOyIsInZhciBUcmFuc2Zvcm0gPSB7fTtcblRyYW5zZm9ybS5wcmVjaXNpb24gPSAwLjAwMDAwMTtcblRyYW5zZm9ybS5pZGVudGl0eSA9IFtcbiAgICAxLFxuICAgIDAsXG4gICAgMCxcbiAgICAwLFxuICAgIDAsXG4gICAgMSxcbiAgICAwLFxuICAgIDAsXG4gICAgMCxcbiAgICAwLFxuICAgIDEsXG4gICAgMCxcbiAgICAwLFxuICAgIDAsXG4gICAgMCxcbiAgICAxXG5dO1xuVHJhbnNmb3JtLm11bHRpcGx5NHg0ID0gZnVuY3Rpb24gbXVsdGlwbHk0eDQoYSwgYikge1xuICAgIHJldHVybiBbXG4gICAgICAgIGFbMF0gKiBiWzBdICsgYVs0XSAqIGJbMV0gKyBhWzhdICogYlsyXSArIGFbMTJdICogYlszXSxcbiAgICAgICAgYVsxXSAqIGJbMF0gKyBhWzVdICogYlsxXSArIGFbOV0gKiBiWzJdICsgYVsxM10gKiBiWzNdLFxuICAgICAgICBhWzJdICogYlswXSArIGFbNl0gKiBiWzFdICsgYVsxMF0gKiBiWzJdICsgYVsxNF0gKiBiWzNdLFxuICAgICAgICBhWzNdICogYlswXSArIGFbN10gKiBiWzFdICsgYVsxMV0gKiBiWzJdICsgYVsxNV0gKiBiWzNdLFxuICAgICAgICBhWzBdICogYls0XSArIGFbNF0gKiBiWzVdICsgYVs4XSAqIGJbNl0gKyBhWzEyXSAqIGJbN10sXG4gICAgICAgIGFbMV0gKiBiWzRdICsgYVs1XSAqIGJbNV0gKyBhWzldICogYls2XSArIGFbMTNdICogYls3XSxcbiAgICAgICAgYVsyXSAqIGJbNF0gKyBhWzZdICogYls1XSArIGFbMTBdICogYls2XSArIGFbMTRdICogYls3XSxcbiAgICAgICAgYVszXSAqIGJbNF0gKyBhWzddICogYls1XSArIGFbMTFdICogYls2XSArIGFbMTVdICogYls3XSxcbiAgICAgICAgYVswXSAqIGJbOF0gKyBhWzRdICogYls5XSArIGFbOF0gKiBiWzEwXSArIGFbMTJdICogYlsxMV0sXG4gICAgICAgIGFbMV0gKiBiWzhdICsgYVs1XSAqIGJbOV0gKyBhWzldICogYlsxMF0gKyBhWzEzXSAqIGJbMTFdLFxuICAgICAgICBhWzJdICogYls4XSArIGFbNl0gKiBiWzldICsgYVsxMF0gKiBiWzEwXSArIGFbMTRdICogYlsxMV0sXG4gICAgICAgIGFbM10gKiBiWzhdICsgYVs3XSAqIGJbOV0gKyBhWzExXSAqIGJbMTBdICsgYVsxNV0gKiBiWzExXSxcbiAgICAgICAgYVswXSAqIGJbMTJdICsgYVs0XSAqIGJbMTNdICsgYVs4XSAqIGJbMTRdICsgYVsxMl0gKiBiWzE1XSxcbiAgICAgICAgYVsxXSAqIGJbMTJdICsgYVs1XSAqIGJbMTNdICsgYVs5XSAqIGJbMTRdICsgYVsxM10gKiBiWzE1XSxcbiAgICAgICAgYVsyXSAqIGJbMTJdICsgYVs2XSAqIGJbMTNdICsgYVsxMF0gKiBiWzE0XSArIGFbMTRdICogYlsxNV0sXG4gICAgICAgIGFbM10gKiBiWzEyXSArIGFbN10gKiBiWzEzXSArIGFbMTFdICogYlsxNF0gKyBhWzE1XSAqIGJbMTVdXG4gICAgXTtcbn07XG5UcmFuc2Zvcm0ubXVsdGlwbHkgPSBmdW5jdGlvbiBtdWx0aXBseShhLCBiKSB7XG4gICAgcmV0dXJuIFtcbiAgICAgICAgYVswXSAqIGJbMF0gKyBhWzRdICogYlsxXSArIGFbOF0gKiBiWzJdLFxuICAgICAgICBhWzFdICogYlswXSArIGFbNV0gKiBiWzFdICsgYVs5XSAqIGJbMl0sXG4gICAgICAgIGFbMl0gKiBiWzBdICsgYVs2XSAqIGJbMV0gKyBhWzEwXSAqIGJbMl0sXG4gICAgICAgIDAsXG4gICAgICAgIGFbMF0gKiBiWzRdICsgYVs0XSAqIGJbNV0gKyBhWzhdICogYls2XSxcbiAgICAgICAgYVsxXSAqIGJbNF0gKyBhWzVdICogYls1XSArIGFbOV0gKiBiWzZdLFxuICAgICAgICBhWzJdICogYls0XSArIGFbNl0gKiBiWzVdICsgYVsxMF0gKiBiWzZdLFxuICAgICAgICAwLFxuICAgICAgICBhWzBdICogYls4XSArIGFbNF0gKiBiWzldICsgYVs4XSAqIGJbMTBdLFxuICAgICAgICBhWzFdICogYls4XSArIGFbNV0gKiBiWzldICsgYVs5XSAqIGJbMTBdLFxuICAgICAgICBhWzJdICogYls4XSArIGFbNl0gKiBiWzldICsgYVsxMF0gKiBiWzEwXSxcbiAgICAgICAgMCxcbiAgICAgICAgYVswXSAqIGJbMTJdICsgYVs0XSAqIGJbMTNdICsgYVs4XSAqIGJbMTRdICsgYVsxMl0sXG4gICAgICAgIGFbMV0gKiBiWzEyXSArIGFbNV0gKiBiWzEzXSArIGFbOV0gKiBiWzE0XSArIGFbMTNdLFxuICAgICAgICBhWzJdICogYlsxMl0gKyBhWzZdICogYlsxM10gKyBhWzEwXSAqIGJbMTRdICsgYVsxNF0sXG4gICAgICAgIDFcbiAgICBdO1xufTtcblRyYW5zZm9ybS50aGVuTW92ZSA9IGZ1bmN0aW9uIHRoZW5Nb3ZlKG0sIHQpIHtcbiAgICBpZiAoIXRbMl0pXG4gICAgICAgIHRbMl0gPSAwO1xuICAgIHJldHVybiBbXG4gICAgICAgIG1bMF0sXG4gICAgICAgIG1bMV0sXG4gICAgICAgIG1bMl0sXG4gICAgICAgIDAsXG4gICAgICAgIG1bNF0sXG4gICAgICAgIG1bNV0sXG4gICAgICAgIG1bNl0sXG4gICAgICAgIDAsXG4gICAgICAgIG1bOF0sXG4gICAgICAgIG1bOV0sXG4gICAgICAgIG1bMTBdLFxuICAgICAgICAwLFxuICAgICAgICBtWzEyXSArIHRbMF0sXG4gICAgICAgIG1bMTNdICsgdFsxXSxcbiAgICAgICAgbVsxNF0gKyB0WzJdLFxuICAgICAgICAxXG4gICAgXTtcbn07XG5UcmFuc2Zvcm0ubW92ZVRoZW4gPSBmdW5jdGlvbiBtb3ZlVGhlbih2LCBtKSB7XG4gICAgaWYgKCF2WzJdKVxuICAgICAgICB2WzJdID0gMDtcbiAgICB2YXIgdDAgPSB2WzBdICogbVswXSArIHZbMV0gKiBtWzRdICsgdlsyXSAqIG1bOF07XG4gICAgdmFyIHQxID0gdlswXSAqIG1bMV0gKyB2WzFdICogbVs1XSArIHZbMl0gKiBtWzldO1xuICAgIHZhciB0MiA9IHZbMF0gKiBtWzJdICsgdlsxXSAqIG1bNl0gKyB2WzJdICogbVsxMF07XG4gICAgcmV0dXJuIFRyYW5zZm9ybS50aGVuTW92ZShtLCBbXG4gICAgICAgIHQwLFxuICAgICAgICB0MSxcbiAgICAgICAgdDJcbiAgICBdKTtcbn07XG5UcmFuc2Zvcm0udHJhbnNsYXRlID0gZnVuY3Rpb24gdHJhbnNsYXRlKHgsIHksIHopIHtcbiAgICBpZiAoeiA9PT0gdW5kZWZpbmVkKVxuICAgICAgICB6ID0gMDtcbiAgICByZXR1cm4gW1xuICAgICAgICAxLFxuICAgICAgICAwLFxuICAgICAgICAwLFxuICAgICAgICAwLFxuICAgICAgICAwLFxuICAgICAgICAxLFxuICAgICAgICAwLFxuICAgICAgICAwLFxuICAgICAgICAwLFxuICAgICAgICAwLFxuICAgICAgICAxLFxuICAgICAgICAwLFxuICAgICAgICB4LFxuICAgICAgICB5LFxuICAgICAgICB6LFxuICAgICAgICAxXG4gICAgXTtcbn07XG5UcmFuc2Zvcm0udGhlblNjYWxlID0gZnVuY3Rpb24gdGhlblNjYWxlKG0sIHMpIHtcbiAgICByZXR1cm4gW1xuICAgICAgICBzWzBdICogbVswXSxcbiAgICAgICAgc1sxXSAqIG1bMV0sXG4gICAgICAgIHNbMl0gKiBtWzJdLFxuICAgICAgICAwLFxuICAgICAgICBzWzBdICogbVs0XSxcbiAgICAgICAgc1sxXSAqIG1bNV0sXG4gICAgICAgIHNbMl0gKiBtWzZdLFxuICAgICAgICAwLFxuICAgICAgICBzWzBdICogbVs4XSxcbiAgICAgICAgc1sxXSAqIG1bOV0sXG4gICAgICAgIHNbMl0gKiBtWzEwXSxcbiAgICAgICAgMCxcbiAgICAgICAgc1swXSAqIG1bMTJdLFxuICAgICAgICBzWzFdICogbVsxM10sXG4gICAgICAgIHNbMl0gKiBtWzE0XSxcbiAgICAgICAgMVxuICAgIF07XG59O1xuVHJhbnNmb3JtLnNjYWxlID0gZnVuY3Rpb24gc2NhbGUoeCwgeSwgeikge1xuICAgIGlmICh6ID09PSB1bmRlZmluZWQpXG4gICAgICAgIHogPSAxO1xuICAgIGlmICh5ID09PSB1bmRlZmluZWQpXG4gICAgICAgIHkgPSB4O1xuICAgIHJldHVybiBbXG4gICAgICAgIHgsXG4gICAgICAgIDAsXG4gICAgICAgIDAsXG4gICAgICAgIDAsXG4gICAgICAgIDAsXG4gICAgICAgIHksXG4gICAgICAgIDAsXG4gICAgICAgIDAsXG4gICAgICAgIDAsXG4gICAgICAgIDAsXG4gICAgICAgIHosXG4gICAgICAgIDAsXG4gICAgICAgIDAsXG4gICAgICAgIDAsXG4gICAgICAgIDAsXG4gICAgICAgIDFcbiAgICBdO1xufTtcblRyYW5zZm9ybS5yb3RhdGVYID0gZnVuY3Rpb24gcm90YXRlWCh0aGV0YSkge1xuICAgIHZhciBjb3NUaGV0YSA9IE1hdGguY29zKHRoZXRhKTtcbiAgICB2YXIgc2luVGhldGEgPSBNYXRoLnNpbih0aGV0YSk7XG4gICAgcmV0dXJuIFtcbiAgICAgICAgMSxcbiAgICAgICAgMCxcbiAgICAgICAgMCxcbiAgICAgICAgMCxcbiAgICAgICAgMCxcbiAgICAgICAgY29zVGhldGEsXG4gICAgICAgIHNpblRoZXRhLFxuICAgICAgICAwLFxuICAgICAgICAwLFxuICAgICAgICAtc2luVGhldGEsXG4gICAgICAgIGNvc1RoZXRhLFxuICAgICAgICAwLFxuICAgICAgICAwLFxuICAgICAgICAwLFxuICAgICAgICAwLFxuICAgICAgICAxXG4gICAgXTtcbn07XG5UcmFuc2Zvcm0ucm90YXRlWSA9IGZ1bmN0aW9uIHJvdGF0ZVkodGhldGEpIHtcbiAgICB2YXIgY29zVGhldGEgPSBNYXRoLmNvcyh0aGV0YSk7XG4gICAgdmFyIHNpblRoZXRhID0gTWF0aC5zaW4odGhldGEpO1xuICAgIHJldHVybiBbXG4gICAgICAgIGNvc1RoZXRhLFxuICAgICAgICAwLFxuICAgICAgICAtc2luVGhldGEsXG4gICAgICAgIDAsXG4gICAgICAgIDAsXG4gICAgICAgIDEsXG4gICAgICAgIDAsXG4gICAgICAgIDAsXG4gICAgICAgIHNpblRoZXRhLFxuICAgICAgICAwLFxuICAgICAgICBjb3NUaGV0YSxcbiAgICAgICAgMCxcbiAgICAgICAgMCxcbiAgICAgICAgMCxcbiAgICAgICAgMCxcbiAgICAgICAgMVxuICAgIF07XG59O1xuVHJhbnNmb3JtLnJvdGF0ZVogPSBmdW5jdGlvbiByb3RhdGVaKHRoZXRhKSB7XG4gICAgdmFyIGNvc1RoZXRhID0gTWF0aC5jb3ModGhldGEpO1xuICAgIHZhciBzaW5UaGV0YSA9IE1hdGguc2luKHRoZXRhKTtcbiAgICByZXR1cm4gW1xuICAgICAgICBjb3NUaGV0YSxcbiAgICAgICAgc2luVGhldGEsXG4gICAgICAgIDAsXG4gICAgICAgIDAsXG4gICAgICAgIC1zaW5UaGV0YSxcbiAgICAgICAgY29zVGhldGEsXG4gICAgICAgIDAsXG4gICAgICAgIDAsXG4gICAgICAgIDAsXG4gICAgICAgIDAsXG4gICAgICAgIDEsXG4gICAgICAgIDAsXG4gICAgICAgIDAsXG4gICAgICAgIDAsXG4gICAgICAgIDAsXG4gICAgICAgIDFcbiAgICBdO1xufTtcblRyYW5zZm9ybS5yb3RhdGUgPSBmdW5jdGlvbiByb3RhdGUocGhpLCB0aGV0YSwgcHNpKSB7XG4gICAgdmFyIGNvc1BoaSA9IE1hdGguY29zKHBoaSk7XG4gICAgdmFyIHNpblBoaSA9IE1hdGguc2luKHBoaSk7XG4gICAgdmFyIGNvc1RoZXRhID0gTWF0aC5jb3ModGhldGEpO1xuICAgIHZhciBzaW5UaGV0YSA9IE1hdGguc2luKHRoZXRhKTtcbiAgICB2YXIgY29zUHNpID0gTWF0aC5jb3MocHNpKTtcbiAgICB2YXIgc2luUHNpID0gTWF0aC5zaW4ocHNpKTtcbiAgICB2YXIgcmVzdWx0ID0gW1xuICAgICAgICAgICAgY29zVGhldGEgKiBjb3NQc2ksXG4gICAgICAgICAgICBjb3NQaGkgKiBzaW5Qc2kgKyBzaW5QaGkgKiBzaW5UaGV0YSAqIGNvc1BzaSxcbiAgICAgICAgICAgIHNpblBoaSAqIHNpblBzaSAtIGNvc1BoaSAqIHNpblRoZXRhICogY29zUHNpLFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIC1jb3NUaGV0YSAqIHNpblBzaSxcbiAgICAgICAgICAgIGNvc1BoaSAqIGNvc1BzaSAtIHNpblBoaSAqIHNpblRoZXRhICogc2luUHNpLFxuICAgICAgICAgICAgc2luUGhpICogY29zUHNpICsgY29zUGhpICogc2luVGhldGEgKiBzaW5Qc2ksXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgc2luVGhldGEsXG4gICAgICAgICAgICAtc2luUGhpICogY29zVGhldGEsXG4gICAgICAgICAgICBjb3NQaGkgKiBjb3NUaGV0YSxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAxXG4gICAgICAgIF07XG4gICAgcmV0dXJuIHJlc3VsdDtcbn07XG5UcmFuc2Zvcm0ucm90YXRlQXhpcyA9IGZ1bmN0aW9uIHJvdGF0ZUF4aXModiwgdGhldGEpIHtcbiAgICB2YXIgc2luVGhldGEgPSBNYXRoLnNpbih0aGV0YSk7XG4gICAgdmFyIGNvc1RoZXRhID0gTWF0aC5jb3ModGhldGEpO1xuICAgIHZhciB2ZXJUaGV0YSA9IDEgLSBjb3NUaGV0YTtcbiAgICB2YXIgeHhWID0gdlswXSAqIHZbMF0gKiB2ZXJUaGV0YTtcbiAgICB2YXIgeHlWID0gdlswXSAqIHZbMV0gKiB2ZXJUaGV0YTtcbiAgICB2YXIgeHpWID0gdlswXSAqIHZbMl0gKiB2ZXJUaGV0YTtcbiAgICB2YXIgeXlWID0gdlsxXSAqIHZbMV0gKiB2ZXJUaGV0YTtcbiAgICB2YXIgeXpWID0gdlsxXSAqIHZbMl0gKiB2ZXJUaGV0YTtcbiAgICB2YXIgenpWID0gdlsyXSAqIHZbMl0gKiB2ZXJUaGV0YTtcbiAgICB2YXIgeHMgPSB2WzBdICogc2luVGhldGE7XG4gICAgdmFyIHlzID0gdlsxXSAqIHNpblRoZXRhO1xuICAgIHZhciB6cyA9IHZbMl0gKiBzaW5UaGV0YTtcbiAgICB2YXIgcmVzdWx0ID0gW1xuICAgICAgICAgICAgeHhWICsgY29zVGhldGEsXG4gICAgICAgICAgICB4eVYgKyB6cyxcbiAgICAgICAgICAgIHh6ViAtIHlzLFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIHh5ViAtIHpzLFxuICAgICAgICAgICAgeXlWICsgY29zVGhldGEsXG4gICAgICAgICAgICB5elYgKyB4cyxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICB4elYgKyB5cyxcbiAgICAgICAgICAgIHl6ViAtIHhzLFxuICAgICAgICAgICAgenpWICsgY29zVGhldGEsXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMVxuICAgICAgICBdO1xuICAgIHJldHVybiByZXN1bHQ7XG59O1xuVHJhbnNmb3JtLmFib3V0T3JpZ2luID0gZnVuY3Rpb24gYWJvdXRPcmlnaW4odiwgbSkge1xuICAgIHZhciB0MCA9IHZbMF0gLSAodlswXSAqIG1bMF0gKyB2WzFdICogbVs0XSArIHZbMl0gKiBtWzhdKTtcbiAgICB2YXIgdDEgPSB2WzFdIC0gKHZbMF0gKiBtWzFdICsgdlsxXSAqIG1bNV0gKyB2WzJdICogbVs5XSk7XG4gICAgdmFyIHQyID0gdlsyXSAtICh2WzBdICogbVsyXSArIHZbMV0gKiBtWzZdICsgdlsyXSAqIG1bMTBdKTtcbiAgICByZXR1cm4gVHJhbnNmb3JtLnRoZW5Nb3ZlKG0sIFtcbiAgICAgICAgdDAsXG4gICAgICAgIHQxLFxuICAgICAgICB0MlxuICAgIF0pO1xufTtcblRyYW5zZm9ybS5za2V3ID0gZnVuY3Rpb24gc2tldyhwaGksIHRoZXRhLCBwc2kpIHtcbiAgICByZXR1cm4gW1xuICAgICAgICAxLFxuICAgICAgICBNYXRoLnRhbih0aGV0YSksXG4gICAgICAgIDAsXG4gICAgICAgIDAsXG4gICAgICAgIE1hdGgudGFuKHBzaSksXG4gICAgICAgIDEsXG4gICAgICAgIDAsXG4gICAgICAgIDAsXG4gICAgICAgIDAsXG4gICAgICAgIE1hdGgudGFuKHBoaSksXG4gICAgICAgIDEsXG4gICAgICAgIDAsXG4gICAgICAgIDAsXG4gICAgICAgIDAsXG4gICAgICAgIDAsXG4gICAgICAgIDFcbiAgICBdO1xufTtcblRyYW5zZm9ybS5za2V3WCA9IGZ1bmN0aW9uIHNrZXdYKGFuZ2xlKSB7XG4gICAgcmV0dXJuIFtcbiAgICAgICAgMSxcbiAgICAgICAgMCxcbiAgICAgICAgMCxcbiAgICAgICAgMCxcbiAgICAgICAgTWF0aC50YW4oYW5nbGUpLFxuICAgICAgICAxLFxuICAgICAgICAwLFxuICAgICAgICAwLFxuICAgICAgICAwLFxuICAgICAgICAwLFxuICAgICAgICAxLFxuICAgICAgICAwLFxuICAgICAgICAwLFxuICAgICAgICAwLFxuICAgICAgICAwLFxuICAgICAgICAxXG4gICAgXTtcbn07XG5UcmFuc2Zvcm0uc2tld1kgPSBmdW5jdGlvbiBza2V3WShhbmdsZSkge1xuICAgIHJldHVybiBbXG4gICAgICAgIDEsXG4gICAgICAgIE1hdGgudGFuKGFuZ2xlKSxcbiAgICAgICAgMCxcbiAgICAgICAgMCxcbiAgICAgICAgMCxcbiAgICAgICAgMSxcbiAgICAgICAgMCxcbiAgICAgICAgMCxcbiAgICAgICAgMCxcbiAgICAgICAgMCxcbiAgICAgICAgMSxcbiAgICAgICAgMCxcbiAgICAgICAgMCxcbiAgICAgICAgMCxcbiAgICAgICAgMCxcbiAgICAgICAgMVxuICAgIF07XG59O1xuVHJhbnNmb3JtLnBlcnNwZWN0aXZlID0gZnVuY3Rpb24gcGVyc3BlY3RpdmUoZm9jdXNaKSB7XG4gICAgcmV0dXJuIFtcbiAgICAgICAgMSxcbiAgICAgICAgMCxcbiAgICAgICAgMCxcbiAgICAgICAgMCxcbiAgICAgICAgMCxcbiAgICAgICAgMSxcbiAgICAgICAgMCxcbiAgICAgICAgMCxcbiAgICAgICAgMCxcbiAgICAgICAgMCxcbiAgICAgICAgMSxcbiAgICAgICAgLTEgLyBmb2N1c1osXG4gICAgICAgIDAsXG4gICAgICAgIDAsXG4gICAgICAgIDAsXG4gICAgICAgIDFcbiAgICBdO1xufTtcblRyYW5zZm9ybS5nZXRUcmFuc2xhdGUgPSBmdW5jdGlvbiBnZXRUcmFuc2xhdGUobSkge1xuICAgIHJldHVybiBbXG4gICAgICAgIG1bMTJdLFxuICAgICAgICBtWzEzXSxcbiAgICAgICAgbVsxNF1cbiAgICBdO1xufTtcblRyYW5zZm9ybS5pbnZlcnNlID0gZnVuY3Rpb24gaW52ZXJzZShtKSB7XG4gICAgdmFyIGMwID0gbVs1XSAqIG1bMTBdIC0gbVs2XSAqIG1bOV07XG4gICAgdmFyIGMxID0gbVs0XSAqIG1bMTBdIC0gbVs2XSAqIG1bOF07XG4gICAgdmFyIGMyID0gbVs0XSAqIG1bOV0gLSBtWzVdICogbVs4XTtcbiAgICB2YXIgYzQgPSBtWzFdICogbVsxMF0gLSBtWzJdICogbVs5XTtcbiAgICB2YXIgYzUgPSBtWzBdICogbVsxMF0gLSBtWzJdICogbVs4XTtcbiAgICB2YXIgYzYgPSBtWzBdICogbVs5XSAtIG1bMV0gKiBtWzhdO1xuICAgIHZhciBjOCA9IG1bMV0gKiBtWzZdIC0gbVsyXSAqIG1bNV07XG4gICAgdmFyIGM5ID0gbVswXSAqIG1bNl0gLSBtWzJdICogbVs0XTtcbiAgICB2YXIgYzEwID0gbVswXSAqIG1bNV0gLSBtWzFdICogbVs0XTtcbiAgICB2YXIgZGV0TSA9IG1bMF0gKiBjMCAtIG1bMV0gKiBjMSArIG1bMl0gKiBjMjtcbiAgICB2YXIgaW52RCA9IDEgLyBkZXRNO1xuICAgIHZhciByZXN1bHQgPSBbXG4gICAgICAgICAgICBpbnZEICogYzAsXG4gICAgICAgICAgICAtaW52RCAqIGM0LFxuICAgICAgICAgICAgaW52RCAqIGM4LFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIC1pbnZEICogYzEsXG4gICAgICAgICAgICBpbnZEICogYzUsXG4gICAgICAgICAgICAtaW52RCAqIGM5LFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIGludkQgKiBjMixcbiAgICAgICAgICAgIC1pbnZEICogYzYsXG4gICAgICAgICAgICBpbnZEICogYzEwLFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDFcbiAgICAgICAgXTtcbiAgICByZXN1bHRbMTJdID0gLW1bMTJdICogcmVzdWx0WzBdIC0gbVsxM10gKiByZXN1bHRbNF0gLSBtWzE0XSAqIHJlc3VsdFs4XTtcbiAgICByZXN1bHRbMTNdID0gLW1bMTJdICogcmVzdWx0WzFdIC0gbVsxM10gKiByZXN1bHRbNV0gLSBtWzE0XSAqIHJlc3VsdFs5XTtcbiAgICByZXN1bHRbMTRdID0gLW1bMTJdICogcmVzdWx0WzJdIC0gbVsxM10gKiByZXN1bHRbNl0gLSBtWzE0XSAqIHJlc3VsdFsxMF07XG4gICAgcmV0dXJuIHJlc3VsdDtcbn07XG5UcmFuc2Zvcm0udHJhbnNwb3NlID0gZnVuY3Rpb24gdHJhbnNwb3NlKG0pIHtcbiAgICByZXR1cm4gW1xuICAgICAgICBtWzBdLFxuICAgICAgICBtWzRdLFxuICAgICAgICBtWzhdLFxuICAgICAgICBtWzEyXSxcbiAgICAgICAgbVsxXSxcbiAgICAgICAgbVs1XSxcbiAgICAgICAgbVs5XSxcbiAgICAgICAgbVsxM10sXG4gICAgICAgIG1bMl0sXG4gICAgICAgIG1bNl0sXG4gICAgICAgIG1bMTBdLFxuICAgICAgICBtWzE0XSxcbiAgICAgICAgbVszXSxcbiAgICAgICAgbVs3XSxcbiAgICAgICAgbVsxMV0sXG4gICAgICAgIG1bMTVdXG4gICAgXTtcbn07XG5mdW5jdGlvbiBfbm9ybVNxdWFyZWQodikge1xuICAgIHJldHVybiB2Lmxlbmd0aCA9PT0gMiA/IHZbMF0gKiB2WzBdICsgdlsxXSAqIHZbMV0gOiB2WzBdICogdlswXSArIHZbMV0gKiB2WzFdICsgdlsyXSAqIHZbMl07XG59XG5mdW5jdGlvbiBfbm9ybSh2KSB7XG4gICAgcmV0dXJuIE1hdGguc3FydChfbm9ybVNxdWFyZWQodikpO1xufVxuZnVuY3Rpb24gX3NpZ24obikge1xuICAgIHJldHVybiBuIDwgMCA/IC0xIDogMTtcbn1cblRyYW5zZm9ybS5pbnRlcnByZXQgPSBmdW5jdGlvbiBpbnRlcnByZXQoTSkge1xuICAgIHZhciB4ID0gW1xuICAgICAgICAgICAgTVswXSxcbiAgICAgICAgICAgIE1bMV0sXG4gICAgICAgICAgICBNWzJdXG4gICAgICAgIF07XG4gICAgdmFyIHNnbiA9IF9zaWduKHhbMF0pO1xuICAgIHZhciB4Tm9ybSA9IF9ub3JtKHgpO1xuICAgIHZhciB2ID0gW1xuICAgICAgICAgICAgeFswXSArIHNnbiAqIHhOb3JtLFxuICAgICAgICAgICAgeFsxXSxcbiAgICAgICAgICAgIHhbMl1cbiAgICAgICAgXTtcbiAgICB2YXIgbXVsdCA9IDIgLyBfbm9ybVNxdWFyZWQodik7XG4gICAgaWYgKG11bHQgPj0gSW5maW5pdHkpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHRyYW5zbGF0ZTogVHJhbnNmb3JtLmdldFRyYW5zbGF0ZShNKSxcbiAgICAgICAgICAgIHJvdGF0ZTogW1xuICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICAwXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgc2NhbGU6IFtcbiAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgMFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIHNrZXc6IFtcbiAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgMFxuICAgICAgICAgICAgXVxuICAgICAgICB9O1xuICAgIH1cbiAgICB2YXIgUTEgPSBbXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAxXG4gICAgICAgIF07XG4gICAgUTFbMF0gPSAxIC0gbXVsdCAqIHZbMF0gKiB2WzBdO1xuICAgIFExWzVdID0gMSAtIG11bHQgKiB2WzFdICogdlsxXTtcbiAgICBRMVsxMF0gPSAxIC0gbXVsdCAqIHZbMl0gKiB2WzJdO1xuICAgIFExWzFdID0gLW11bHQgKiB2WzBdICogdlsxXTtcbiAgICBRMVsyXSA9IC1tdWx0ICogdlswXSAqIHZbMl07XG4gICAgUTFbNl0gPSAtbXVsdCAqIHZbMV0gKiB2WzJdO1xuICAgIFExWzRdID0gUTFbMV07XG4gICAgUTFbOF0gPSBRMVsyXTtcbiAgICBRMVs5XSA9IFExWzZdO1xuICAgIHZhciBNUTEgPSBUcmFuc2Zvcm0ubXVsdGlwbHkoUTEsIE0pO1xuICAgIHZhciB4MiA9IFtcbiAgICAgICAgICAgIE1RMVs1XSxcbiAgICAgICAgICAgIE1RMVs2XVxuICAgICAgICBdO1xuICAgIHZhciBzZ24yID0gX3NpZ24oeDJbMF0pO1xuICAgIHZhciB4Mk5vcm0gPSBfbm9ybSh4Mik7XG4gICAgdmFyIHYyID0gW1xuICAgICAgICAgICAgeDJbMF0gKyBzZ24yICogeDJOb3JtLFxuICAgICAgICAgICAgeDJbMV1cbiAgICAgICAgXTtcbiAgICB2YXIgbXVsdDIgPSAyIC8gX25vcm1TcXVhcmVkKHYyKTtcbiAgICB2YXIgUTIgPSBbXG4gICAgICAgICAgICAxLFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAxXG4gICAgICAgIF07XG4gICAgUTJbNV0gPSAxIC0gbXVsdDIgKiB2MlswXSAqIHYyWzBdO1xuICAgIFEyWzEwXSA9IDEgLSBtdWx0MiAqIHYyWzFdICogdjJbMV07XG4gICAgUTJbNl0gPSAtbXVsdDIgKiB2MlswXSAqIHYyWzFdO1xuICAgIFEyWzldID0gUTJbNl07XG4gICAgdmFyIFEgPSBUcmFuc2Zvcm0ubXVsdGlwbHkoUTIsIFExKTtcbiAgICB2YXIgUiA9IFRyYW5zZm9ybS5tdWx0aXBseShRLCBNKTtcbiAgICB2YXIgcmVtb3ZlciA9IFRyYW5zZm9ybS5zY2FsZShSWzBdIDwgMCA/IC0xIDogMSwgUls1XSA8IDAgPyAtMSA6IDEsIFJbMTBdIDwgMCA/IC0xIDogMSk7XG4gICAgUiA9IFRyYW5zZm9ybS5tdWx0aXBseShSLCByZW1vdmVyKTtcbiAgICBRID0gVHJhbnNmb3JtLm11bHRpcGx5KHJlbW92ZXIsIFEpO1xuICAgIHZhciByZXN1bHQgPSB7fTtcbiAgICByZXN1bHQudHJhbnNsYXRlID0gVHJhbnNmb3JtLmdldFRyYW5zbGF0ZShNKTtcbiAgICByZXN1bHQucm90YXRlID0gW1xuICAgICAgICBNYXRoLmF0YW4yKC1RWzZdLCBRWzEwXSksXG4gICAgICAgIE1hdGguYXNpbihRWzJdKSxcbiAgICAgICAgTWF0aC5hdGFuMigtUVsxXSwgUVswXSlcbiAgICBdO1xuICAgIGlmICghcmVzdWx0LnJvdGF0ZVswXSkge1xuICAgICAgICByZXN1bHQucm90YXRlWzBdID0gMDtcbiAgICAgICAgcmVzdWx0LnJvdGF0ZVsyXSA9IE1hdGguYXRhbjIoUVs0XSwgUVs1XSk7XG4gICAgfVxuICAgIHJlc3VsdC5zY2FsZSA9IFtcbiAgICAgICAgUlswXSxcbiAgICAgICAgUls1XSxcbiAgICAgICAgUlsxMF1cbiAgICBdO1xuICAgIHJlc3VsdC5za2V3ID0gW1xuICAgICAgICBNYXRoLmF0YW4yKFJbOV0sIHJlc3VsdC5zY2FsZVsyXSksXG4gICAgICAgIE1hdGguYXRhbjIoUls4XSwgcmVzdWx0LnNjYWxlWzJdKSxcbiAgICAgICAgTWF0aC5hdGFuMihSWzRdLCByZXN1bHQuc2NhbGVbMF0pXG4gICAgXTtcbiAgICBpZiAoTWF0aC5hYnMocmVzdWx0LnJvdGF0ZVswXSkgKyBNYXRoLmFicyhyZXN1bHQucm90YXRlWzJdKSA+IDEuNSAqIE1hdGguUEkpIHtcbiAgICAgICAgcmVzdWx0LnJvdGF0ZVsxXSA9IE1hdGguUEkgLSByZXN1bHQucm90YXRlWzFdO1xuICAgICAgICBpZiAocmVzdWx0LnJvdGF0ZVsxXSA+IE1hdGguUEkpXG4gICAgICAgICAgICByZXN1bHQucm90YXRlWzFdIC09IDIgKiBNYXRoLlBJO1xuICAgICAgICBpZiAocmVzdWx0LnJvdGF0ZVsxXSA8IC1NYXRoLlBJKVxuICAgICAgICAgICAgcmVzdWx0LnJvdGF0ZVsxXSArPSAyICogTWF0aC5QSTtcbiAgICAgICAgaWYgKHJlc3VsdC5yb3RhdGVbMF0gPCAwKVxuICAgICAgICAgICAgcmVzdWx0LnJvdGF0ZVswXSArPSBNYXRoLlBJO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXN1bHQucm90YXRlWzBdIC09IE1hdGguUEk7XG4gICAgICAgIGlmIChyZXN1bHQucm90YXRlWzJdIDwgMClcbiAgICAgICAgICAgIHJlc3VsdC5yb3RhdGVbMl0gKz0gTWF0aC5QSTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmVzdWx0LnJvdGF0ZVsyXSAtPSBNYXRoLlBJO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufTtcblRyYW5zZm9ybS5hdmVyYWdlID0gZnVuY3Rpb24gYXZlcmFnZShNMSwgTTIsIHQpIHtcbiAgICB0ID0gdCA9PT0gdW5kZWZpbmVkID8gMC41IDogdDtcbiAgICB2YXIgc3BlY00xID0gVHJhbnNmb3JtLmludGVycHJldChNMSk7XG4gICAgdmFyIHNwZWNNMiA9IFRyYW5zZm9ybS5pbnRlcnByZXQoTTIpO1xuICAgIHZhciBzcGVjQXZnID0ge1xuICAgICAgICAgICAgdHJhbnNsYXRlOiBbXG4gICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgIDBcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICByb3RhdGU6IFtcbiAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgMFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIHNjYWxlOiBbXG4gICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgIDBcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBza2V3OiBbXG4gICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgIDBcbiAgICAgICAgICAgIF1cbiAgICAgICAgfTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDM7IGkrKykge1xuICAgICAgICBzcGVjQXZnLnRyYW5zbGF0ZVtpXSA9ICgxIC0gdCkgKiBzcGVjTTEudHJhbnNsYXRlW2ldICsgdCAqIHNwZWNNMi50cmFuc2xhdGVbaV07XG4gICAgICAgIHNwZWNBdmcucm90YXRlW2ldID0gKDEgLSB0KSAqIHNwZWNNMS5yb3RhdGVbaV0gKyB0ICogc3BlY00yLnJvdGF0ZVtpXTtcbiAgICAgICAgc3BlY0F2Zy5zY2FsZVtpXSA9ICgxIC0gdCkgKiBzcGVjTTEuc2NhbGVbaV0gKyB0ICogc3BlY00yLnNjYWxlW2ldO1xuICAgICAgICBzcGVjQXZnLnNrZXdbaV0gPSAoMSAtIHQpICogc3BlY00xLnNrZXdbaV0gKyB0ICogc3BlY00yLnNrZXdbaV07XG4gICAgfVxuICAgIHJldHVybiBUcmFuc2Zvcm0uYnVpbGQoc3BlY0F2Zyk7XG59O1xuVHJhbnNmb3JtLmJ1aWxkID0gZnVuY3Rpb24gYnVpbGQoc3BlYykge1xuICAgIHZhciBzY2FsZU1hdHJpeCA9IFRyYW5zZm9ybS5zY2FsZShzcGVjLnNjYWxlWzBdLCBzcGVjLnNjYWxlWzFdLCBzcGVjLnNjYWxlWzJdKTtcbiAgICB2YXIgc2tld01hdHJpeCA9IFRyYW5zZm9ybS5za2V3KHNwZWMuc2tld1swXSwgc3BlYy5za2V3WzFdLCBzcGVjLnNrZXdbMl0pO1xuICAgIHZhciByb3RhdGVNYXRyaXggPSBUcmFuc2Zvcm0ucm90YXRlKHNwZWMucm90YXRlWzBdLCBzcGVjLnJvdGF0ZVsxXSwgc3BlYy5yb3RhdGVbMl0pO1xuICAgIHJldHVybiBUcmFuc2Zvcm0udGhlbk1vdmUoVHJhbnNmb3JtLm11bHRpcGx5KFRyYW5zZm9ybS5tdWx0aXBseShyb3RhdGVNYXRyaXgsIHNrZXdNYXRyaXgpLCBzY2FsZU1hdHJpeCksIHNwZWMudHJhbnNsYXRlKTtcbn07XG5UcmFuc2Zvcm0uZXF1YWxzID0gZnVuY3Rpb24gZXF1YWxzKGEsIGIpIHtcbiAgICByZXR1cm4gIVRyYW5zZm9ybS5ub3RFcXVhbHMoYSwgYik7XG59O1xuVHJhbnNmb3JtLm5vdEVxdWFscyA9IGZ1bmN0aW9uIG5vdEVxdWFscyhhLCBiKSB7XG4gICAgaWYgKGEgPT09IGIpXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICByZXR1cm4gIShhICYmIGIpIHx8IGFbMTJdICE9PSBiWzEyXSB8fCBhWzEzXSAhPT0gYlsxM10gfHwgYVsxNF0gIT09IGJbMTRdIHx8IGFbMF0gIT09IGJbMF0gfHwgYVsxXSAhPT0gYlsxXSB8fCBhWzJdICE9PSBiWzJdIHx8IGFbNF0gIT09IGJbNF0gfHwgYVs1XSAhPT0gYls1XSB8fCBhWzZdICE9PSBiWzZdIHx8IGFbOF0gIT09IGJbOF0gfHwgYVs5XSAhPT0gYls5XSB8fCBhWzEwXSAhPT0gYlsxMF07XG59O1xuVHJhbnNmb3JtLm5vcm1hbGl6ZVJvdGF0aW9uID0gZnVuY3Rpb24gbm9ybWFsaXplUm90YXRpb24ocm90YXRpb24pIHtcbiAgICB2YXIgcmVzdWx0ID0gcm90YXRpb24uc2xpY2UoMCk7XG4gICAgaWYgKHJlc3VsdFswXSA9PT0gTWF0aC5QSSAqIDAuNSB8fCByZXN1bHRbMF0gPT09IC1NYXRoLlBJICogMC41KSB7XG4gICAgICAgIHJlc3VsdFswXSA9IC1yZXN1bHRbMF07XG4gICAgICAgIHJlc3VsdFsxXSA9IE1hdGguUEkgLSByZXN1bHRbMV07XG4gICAgICAgIHJlc3VsdFsyXSAtPSBNYXRoLlBJO1xuICAgIH1cbiAgICBpZiAocmVzdWx0WzBdID4gTWF0aC5QSSAqIDAuNSkge1xuICAgICAgICByZXN1bHRbMF0gPSByZXN1bHRbMF0gLSBNYXRoLlBJO1xuICAgICAgICByZXN1bHRbMV0gPSBNYXRoLlBJIC0gcmVzdWx0WzFdO1xuICAgICAgICByZXN1bHRbMl0gLT0gTWF0aC5QSTtcbiAgICB9XG4gICAgaWYgKHJlc3VsdFswXSA8IC1NYXRoLlBJICogMC41KSB7XG4gICAgICAgIHJlc3VsdFswXSA9IHJlc3VsdFswXSArIE1hdGguUEk7XG4gICAgICAgIHJlc3VsdFsxXSA9IC1NYXRoLlBJIC0gcmVzdWx0WzFdO1xuICAgICAgICByZXN1bHRbMl0gLT0gTWF0aC5QSTtcbiAgICB9XG4gICAgd2hpbGUgKHJlc3VsdFsxXSA8IC1NYXRoLlBJKVxuICAgICAgICByZXN1bHRbMV0gKz0gMiAqIE1hdGguUEk7XG4gICAgd2hpbGUgKHJlc3VsdFsxXSA+PSBNYXRoLlBJKVxuICAgICAgICByZXN1bHRbMV0gLT0gMiAqIE1hdGguUEk7XG4gICAgd2hpbGUgKHJlc3VsdFsyXSA8IC1NYXRoLlBJKVxuICAgICAgICByZXN1bHRbMl0gKz0gMiAqIE1hdGguUEk7XG4gICAgd2hpbGUgKHJlc3VsdFsyXSA+PSBNYXRoLlBJKVxuICAgICAgICByZXN1bHRbMl0gLT0gMiAqIE1hdGguUEk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn07XG5UcmFuc2Zvcm0uaW5Gcm9udCA9IFtcbiAgICAxLFxuICAgIDAsXG4gICAgMCxcbiAgICAwLFxuICAgIDAsXG4gICAgMSxcbiAgICAwLFxuICAgIDAsXG4gICAgMCxcbiAgICAwLFxuICAgIDEsXG4gICAgMCxcbiAgICAwLFxuICAgIDAsXG4gICAgMC4wMDEsXG4gICAgMVxuXTtcblRyYW5zZm9ybS5iZWhpbmQgPSBbXG4gICAgMSxcbiAgICAwLFxuICAgIDAsXG4gICAgMCxcbiAgICAwLFxuICAgIDEsXG4gICAgMCxcbiAgICAwLFxuICAgIDAsXG4gICAgMCxcbiAgICAxLFxuICAgIDAsXG4gICAgMCxcbiAgICAwLFxuICAgIC0wLjAwMSxcbiAgICAxXG5dO1xubW9kdWxlLmV4cG9ydHMgPSBUcmFuc2Zvcm07IiwidmFyIEV2ZW50SGFuZGxlciA9IHJlcXVpcmUoJy4vRXZlbnRIYW5kbGVyJyk7XG52YXIgT3B0aW9uc01hbmFnZXIgPSByZXF1aXJlKCcuL09wdGlvbnNNYW5hZ2VyJyk7XG52YXIgUmVuZGVyTm9kZSA9IHJlcXVpcmUoJy4vUmVuZGVyTm9kZScpO1xudmFyIFV0aWxpdHkgPSByZXF1aXJlKCcuLi91dGlsaXRpZXMvVXRpbGl0eScpO1xuZnVuY3Rpb24gVmlldyhvcHRpb25zKSB7XG4gICAgdGhpcy5fbm9kZSA9IG5ldyBSZW5kZXJOb2RlKCk7XG4gICAgdGhpcy5fZXZlbnRJbnB1dCA9IG5ldyBFdmVudEhhbmRsZXIoKTtcbiAgICB0aGlzLl9ldmVudE91dHB1dCA9IG5ldyBFdmVudEhhbmRsZXIoKTtcbiAgICBFdmVudEhhbmRsZXIuc2V0SW5wdXRIYW5kbGVyKHRoaXMsIHRoaXMuX2V2ZW50SW5wdXQpO1xuICAgIEV2ZW50SGFuZGxlci5zZXRPdXRwdXRIYW5kbGVyKHRoaXMsIHRoaXMuX2V2ZW50T3V0cHV0KTtcbiAgICB0aGlzLm9wdGlvbnMgPSBVdGlsaXR5LmNsb25lKHRoaXMuY29uc3RydWN0b3IuREVGQVVMVF9PUFRJT05TIHx8IFZpZXcuREVGQVVMVF9PUFRJT05TKTtcbiAgICB0aGlzLl9vcHRpb25zTWFuYWdlciA9IG5ldyBPcHRpb25zTWFuYWdlcih0aGlzLm9wdGlvbnMpO1xuICAgIGlmIChvcHRpb25zKVxuICAgICAgICB0aGlzLnNldE9wdGlvbnMob3B0aW9ucyk7XG59XG5WaWV3LkRFRkFVTFRfT1BUSU9OUyA9IHt9O1xuVmlldy5wcm90b3R5cGUuZ2V0T3B0aW9ucyA9IGZ1bmN0aW9uIGdldE9wdGlvbnMoa2V5KSB7XG4gICAgcmV0dXJuIHRoaXMuX29wdGlvbnNNYW5hZ2VyLmdldE9wdGlvbnMoa2V5KTtcbn07XG5WaWV3LnByb3RvdHlwZS5zZXRPcHRpb25zID0gZnVuY3Rpb24gc2V0T3B0aW9ucyhvcHRpb25zKSB7XG4gICAgdGhpcy5fb3B0aW9uc01hbmFnZXIucGF0Y2gob3B0aW9ucyk7XG59O1xuVmlldy5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24gYWRkKCkge1xuICAgIHJldHVybiB0aGlzLl9ub2RlLmFkZC5hcHBseSh0aGlzLl9ub2RlLCBhcmd1bWVudHMpO1xufTtcblZpZXcucHJvdG90eXBlLl9hZGQgPSBWaWV3LnByb3RvdHlwZS5hZGQ7XG5WaWV3LnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgcmV0dXJuIHRoaXMuX25vZGUucmVuZGVyKCk7XG59O1xuVmlldy5wcm90b3R5cGUuZ2V0U2l6ZSA9IGZ1bmN0aW9uIGdldFNpemUoKSB7XG4gICAgaWYgKHRoaXMuX25vZGUgJiYgdGhpcy5fbm9kZS5nZXRTaXplKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9ub2RlLmdldFNpemUuYXBwbHkodGhpcy5fbm9kZSwgYXJndW1lbnRzKSB8fCB0aGlzLm9wdGlvbnMuc2l6ZTtcbiAgICB9IGVsc2VcbiAgICAgICAgcmV0dXJuIHRoaXMub3B0aW9ucy5zaXplO1xufTtcbm1vZHVsZS5leHBvcnRzID0gVmlldzsiLCJ2YXIgY3NzID0gXCIvKiBUaGlzIFNvdXJjZSBDb2RlIEZvcm0gaXMgc3ViamVjdCB0byB0aGUgdGVybXMgb2YgdGhlIE1vemlsbGEgUHVibGljXFxuICogTGljZW5zZSwgdi4gMi4wLiBJZiBhIGNvcHkgb2YgdGhlIE1QTCB3YXMgbm90IGRpc3RyaWJ1dGVkIHdpdGggdGhpc1xcbiAqIGZpbGUsIFlvdSBjYW4gb2J0YWluIG9uZSBhdCBodHRwOi8vbW96aWxsYS5vcmcvTVBMLzIuMC8uXFxuICpcXG4gKiBPd25lcjogbWFya0BmYW1vLnVzXFxuICogQGxpY2Vuc2UgTVBMIDIuMFxcbiAqIEBjb3B5cmlnaHQgRmFtb3VzIEluZHVzdHJpZXMsIEluYy4gMjAxNFxcbiAqL1xcblxcbi5mYW1vdXMtcm9vdCB7XFxuICAgIHdpZHRoOiAxMDAlO1xcbiAgICBoZWlnaHQ6IDEwMCU7XFxuICAgIG1hcmdpbjogMHB4O1xcbiAgICBwYWRkaW5nOiAwcHg7XFxuICAgIG92ZXJmbG93OiBoaWRkZW47XFxuICAgIC13ZWJraXQtdHJhbnNmb3JtLXN0eWxlOiBwcmVzZXJ2ZS0zZDtcXG4gICAgdHJhbnNmb3JtLXN0eWxlOiBwcmVzZXJ2ZS0zZDtcXG59XFxuXFxuLmZhbW91cy1jb250YWluZXIsIC5mYW1vdXMtZ3JvdXAge1xcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICAgIHRvcDogMHB4O1xcbiAgICBsZWZ0OiAwcHg7XFxuICAgIGJvdHRvbTogMHB4O1xcbiAgICByaWdodDogMHB4O1xcbiAgICBvdmVyZmxvdzogdmlzaWJsZTtcXG4gICAgLXdlYmtpdC10cmFuc2Zvcm0tc3R5bGU6IHByZXNlcnZlLTNkO1xcbiAgICB0cmFuc2Zvcm0tc3R5bGU6IHByZXNlcnZlLTNkO1xcbiAgICAtd2Via2l0LWJhY2tmYWNlLXZpc2liaWxpdHk6IHZpc2libGU7XFxuICAgIGJhY2tmYWNlLXZpc2liaWxpdHk6IHZpc2libGU7XFxuICAgIHBvaW50ZXItZXZlbnRzOiBub25lO1xcbn1cXG5cXG4uZmFtb3VzLWdyb3VwIHtcXG4gICAgd2lkdGg6IDBweDtcXG4gICAgaGVpZ2h0OiAwcHg7XFxuICAgIG1hcmdpbjogMHB4O1xcbiAgICBwYWRkaW5nOiAwcHg7XFxuICAgIC13ZWJraXQtdHJhbnNmb3JtLXN0eWxlOiBwcmVzZXJ2ZS0zZDtcXG4gICAgdHJhbnNmb3JtLXN0eWxlOiBwcmVzZXJ2ZS0zZDtcXG59XFxuXFxuLmZhbW91cy1zdXJmYWNlIHtcXG4gICAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgICAtd2Via2l0LXRyYW5zZm9ybS1vcmlnaW46IGNlbnRlciBjZW50ZXI7XFxuICAgIHRyYW5zZm9ybS1vcmlnaW46IGNlbnRlciBjZW50ZXI7XFxuICAgIC13ZWJraXQtYmFja2ZhY2UtdmlzaWJpbGl0eTogaGlkZGVuO1xcbiAgICBiYWNrZmFjZS12aXNpYmlsaXR5OiBoaWRkZW47XFxuICAgIC13ZWJraXQtdHJhbnNmb3JtLXN0eWxlOiBwcmVzZXJ2ZS0zZDtcXG4gICAgdHJhbnNmb3JtLXN0eWxlOiBwcmVzZXJ2ZS0zZDtcXG4gICAgLXdlYmtpdC1ib3gtc2l6aW5nOiBib3JkZXItYm94O1xcbiAgICAtbW96LWJveC1zaXppbmc6IGJvcmRlci1ib3g7XFxuICAgIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XFxuICAgIC13ZWJraXQtdGFwLWhpZ2hsaWdodC1jb2xvcjogdHJhbnNwYXJlbnQ7XFxuICAgIHBvaW50ZXItZXZlbnRzOiBhdXRvO1xcbn1cXG5cXG4uZmFtb3VzLWNvbnRhaW5lci1ncm91cCB7XFxuICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gICAgd2lkdGg6IDEwMCU7XFxuICAgIGhlaWdodDogMTAwJTtcXG59XFxuXCI7IChyZXF1aXJlKFwiL1VzZXJzL21pY2hhZWx4aWEvRmFtb3VzL1ZhbmlsbGEvY3ViZS13YWxscy0zZC9ub2RlX21vZHVsZXMvY3NzaWZ5XCIpKShjc3MpOyBtb2R1bGUuZXhwb3J0cyA9IGNzczsiLCJ2YXIgRXZlbnRIYW5kbGVyID0gcmVxdWlyZSgnLi4vY29yZS9FdmVudEhhbmRsZXInKTtcbmZ1bmN0aW9uIEdlbmVyaWNTeW5jKHN5bmNzLCBvcHRpb25zKSB7XG4gICAgdGhpcy5fZXZlbnRJbnB1dCA9IG5ldyBFdmVudEhhbmRsZXIoKTtcbiAgICB0aGlzLl9ldmVudE91dHB1dCA9IG5ldyBFdmVudEhhbmRsZXIoKTtcbiAgICBFdmVudEhhbmRsZXIuc2V0SW5wdXRIYW5kbGVyKHRoaXMsIHRoaXMuX2V2ZW50SW5wdXQpO1xuICAgIEV2ZW50SGFuZGxlci5zZXRPdXRwdXRIYW5kbGVyKHRoaXMsIHRoaXMuX2V2ZW50T3V0cHV0KTtcbiAgICB0aGlzLl9zeW5jcyA9IHt9O1xuICAgIGlmIChzeW5jcylcbiAgICAgICAgdGhpcy5hZGRTeW5jKHN5bmNzKTtcbiAgICBpZiAob3B0aW9ucylcbiAgICAgICAgdGhpcy5zZXRPcHRpb25zKG9wdGlvbnMpO1xufVxuR2VuZXJpY1N5bmMuRElSRUNUSU9OX1ggPSAwO1xuR2VuZXJpY1N5bmMuRElSRUNUSU9OX1kgPSAxO1xuR2VuZXJpY1N5bmMuRElSRUNUSU9OX1ogPSAyO1xudmFyIHJlZ2lzdHJ5ID0ge307XG5HZW5lcmljU3luYy5yZWdpc3RlciA9IGZ1bmN0aW9uIHJlZ2lzdGVyKHN5bmNPYmplY3QpIHtcbiAgICBmb3IgKHZhciBrZXkgaW4gc3luY09iamVjdCkge1xuICAgICAgICBpZiAocmVnaXN0cnlba2V5XSkge1xuICAgICAgICAgICAgaWYgKHJlZ2lzdHJ5W2tleV0gPT09IHN5bmNPYmplY3Rba2V5XSlcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCd0aGlzIGtleSBpcyByZWdpc3RlcmVkIHRvIGEgZGlmZmVyZW50IHN5bmMgY2xhc3MnKTtcbiAgICAgICAgfSBlbHNlXG4gICAgICAgICAgICByZWdpc3RyeVtrZXldID0gc3luY09iamVjdFtrZXldO1xuICAgIH1cbn07XG5HZW5lcmljU3luYy5wcm90b3R5cGUuc2V0T3B0aW9ucyA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgZm9yICh2YXIga2V5IGluIHRoaXMuX3N5bmNzKSB7XG4gICAgICAgIHRoaXMuX3N5bmNzW2tleV0uc2V0T3B0aW9ucyhvcHRpb25zKTtcbiAgICB9XG59O1xuR2VuZXJpY1N5bmMucHJvdG90eXBlLnBpcGVTeW5jID0gZnVuY3Rpb24gcGlwZVRvU3luYyhrZXkpIHtcbiAgICB2YXIgc3luYyA9IHRoaXMuX3N5bmNzW2tleV07XG4gICAgdGhpcy5fZXZlbnRJbnB1dC5waXBlKHN5bmMpO1xuICAgIHN5bmMucGlwZSh0aGlzLl9ldmVudE91dHB1dCk7XG59O1xuR2VuZXJpY1N5bmMucHJvdG90eXBlLnVucGlwZVN5bmMgPSBmdW5jdGlvbiB1bnBpcGVGcm9tU3luYyhrZXkpIHtcbiAgICB2YXIgc3luYyA9IHRoaXMuX3N5bmNzW2tleV07XG4gICAgdGhpcy5fZXZlbnRJbnB1dC51bnBpcGUoc3luYyk7XG4gICAgc3luYy51bnBpcGUodGhpcy5fZXZlbnRPdXRwdXQpO1xufTtcbmZ1bmN0aW9uIF9hZGRTaW5nbGVTeW5jKGtleSwgb3B0aW9ucykge1xuICAgIGlmICghcmVnaXN0cnlba2V5XSlcbiAgICAgICAgcmV0dXJuO1xuICAgIHRoaXMuX3N5bmNzW2tleV0gPSBuZXcgcmVnaXN0cnlba2V5XShvcHRpb25zKTtcbiAgICB0aGlzLnBpcGVTeW5jKGtleSk7XG59XG5HZW5lcmljU3luYy5wcm90b3R5cGUuYWRkU3luYyA9IGZ1bmN0aW9uIGFkZFN5bmMoc3luY3MpIHtcbiAgICBpZiAoc3luY3MgaW5zdGFuY2VvZiBBcnJheSlcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzeW5jcy5sZW5ndGg7IGkrKylcbiAgICAgICAgICAgIF9hZGRTaW5nbGVTeW5jLmNhbGwodGhpcywgc3luY3NbaV0pO1xuICAgIGVsc2UgaWYgKHN5bmNzIGluc3RhbmNlb2YgT2JqZWN0KVxuICAgICAgICBmb3IgKHZhciBrZXkgaW4gc3luY3MpXG4gICAgICAgICAgICBfYWRkU2luZ2xlU3luYy5jYWxsKHRoaXMsIGtleSwgc3luY3Nba2V5XSk7XG59O1xubW9kdWxlLmV4cG9ydHMgPSBHZW5lcmljU3luYzsiLCJ2YXIgRXZlbnRIYW5kbGVyID0gcmVxdWlyZSgnLi4vY29yZS9FdmVudEhhbmRsZXInKTtcbnZhciBPcHRpb25zTWFuYWdlciA9IHJlcXVpcmUoJy4uL2NvcmUvT3B0aW9uc01hbmFnZXInKTtcbmZ1bmN0aW9uIE1vdXNlU3luYyhvcHRpb25zKSB7XG4gICAgdGhpcy5vcHRpb25zID0gT2JqZWN0LmNyZWF0ZShNb3VzZVN5bmMuREVGQVVMVF9PUFRJT05TKTtcbiAgICB0aGlzLl9vcHRpb25zTWFuYWdlciA9IG5ldyBPcHRpb25zTWFuYWdlcih0aGlzLm9wdGlvbnMpO1xuICAgIGlmIChvcHRpb25zKVxuICAgICAgICB0aGlzLnNldE9wdGlvbnMob3B0aW9ucyk7XG4gICAgdGhpcy5fZXZlbnRJbnB1dCA9IG5ldyBFdmVudEhhbmRsZXIoKTtcbiAgICB0aGlzLl9ldmVudE91dHB1dCA9IG5ldyBFdmVudEhhbmRsZXIoKTtcbiAgICBFdmVudEhhbmRsZXIuc2V0SW5wdXRIYW5kbGVyKHRoaXMsIHRoaXMuX2V2ZW50SW5wdXQpO1xuICAgIEV2ZW50SGFuZGxlci5zZXRPdXRwdXRIYW5kbGVyKHRoaXMsIHRoaXMuX2V2ZW50T3V0cHV0KTtcbiAgICB0aGlzLl9ldmVudElucHV0Lm9uKCdtb3VzZWRvd24nLCBfaGFuZGxlU3RhcnQuYmluZCh0aGlzKSk7XG4gICAgdGhpcy5fZXZlbnRJbnB1dC5vbignbW91c2Vtb3ZlJywgX2hhbmRsZU1vdmUuYmluZCh0aGlzKSk7XG4gICAgdGhpcy5fZXZlbnRJbnB1dC5vbignbW91c2V1cCcsIF9oYW5kbGVFbmQuYmluZCh0aGlzKSk7XG4gICAgaWYgKHRoaXMub3B0aW9ucy5wcm9wb2dhdGUpXG4gICAgICAgIHRoaXMuX2V2ZW50SW5wdXQub24oJ21vdXNlbGVhdmUnLCBfaGFuZGxlTGVhdmUuYmluZCh0aGlzKSk7XG4gICAgZWxzZVxuICAgICAgICB0aGlzLl9ldmVudElucHV0Lm9uKCdtb3VzZWxlYXZlJywgX2hhbmRsZUVuZC5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLl9wYXlsb2FkID0ge1xuICAgICAgICBkZWx0YTogbnVsbCxcbiAgICAgICAgcG9zaXRpb246IG51bGwsXG4gICAgICAgIHZlbG9jaXR5OiBudWxsLFxuICAgICAgICBjbGllbnRYOiAwLFxuICAgICAgICBjbGllbnRZOiAwLFxuICAgICAgICBvZmZzZXRYOiAwLFxuICAgICAgICBvZmZzZXRZOiAwXG4gICAgfTtcbiAgICB0aGlzLl9wb3NpdGlvbkhpc3RvcnkgPSBbXTtcbiAgICB0aGlzLl9wb3NpdGlvbiA9IG51bGw7XG4gICAgdGhpcy5fcHJldkNvb3JkID0gdW5kZWZpbmVkO1xuICAgIHRoaXMuX3ByZXZUaW1lID0gdW5kZWZpbmVkO1xuICAgIHRoaXMuX2Rvd24gPSBmYWxzZTtcbiAgICB0aGlzLl9tb3ZlZCA9IGZhbHNlO1xuICAgIHRoaXMuX2RvY3VtZW50QWN0aXZlID0gZmFsc2U7XG59XG5Nb3VzZVN5bmMuREVGQVVMVF9PUFRJT05TID0ge1xuICAgIGRpcmVjdGlvbjogdW5kZWZpbmVkLFxuICAgIHJhaWxzOiBmYWxzZSxcbiAgICBzY2FsZTogMSxcbiAgICBwcm9wb2dhdGU6IHRydWUsXG4gICAgdmVsb2NpdHlTYW1wbGVMZW5ndGg6IDEwLFxuICAgIHByZXZlbnREZWZhdWx0OiB0cnVlXG59O1xuTW91c2VTeW5jLkRJUkVDVElPTl9YID0gMDtcbk1vdXNlU3luYy5ESVJFQ1RJT05fWSA9IDE7XG52YXIgTUlOSU1VTV9USUNLX1RJTUUgPSA4O1xuZnVuY3Rpb24gX2hhbmRsZVN0YXJ0KGV2ZW50KSB7XG4gICAgdmFyIGRlbHRhO1xuICAgIHZhciB2ZWxvY2l0eTtcbiAgICBpZiAodGhpcy5vcHRpb25zLnByZXZlbnREZWZhdWx0KVxuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHZhciB4ID0gZXZlbnQuY2xpZW50WDtcbiAgICB2YXIgeSA9IGV2ZW50LmNsaWVudFk7XG4gICAgdGhpcy5fcHJldkNvb3JkID0gW1xuICAgICAgICB4LFxuICAgICAgICB5XG4gICAgXTtcbiAgICB0aGlzLl9wcmV2VGltZSA9IERhdGUubm93KCk7XG4gICAgdGhpcy5fZG93biA9IHRydWU7XG4gICAgdGhpcy5fbW92ZSA9IGZhbHNlO1xuICAgIGlmICh0aGlzLm9wdGlvbnMuZGlyZWN0aW9uICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdGhpcy5fcG9zaXRpb24gPSAwO1xuICAgICAgICBkZWx0YSA9IDA7XG4gICAgICAgIHZlbG9jaXR5ID0gMDtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9wb3NpdGlvbiA9IFtcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAwXG4gICAgICAgIF07XG4gICAgICAgIGRlbHRhID0gW1xuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDBcbiAgICAgICAgXTtcbiAgICAgICAgdmVsb2NpdHkgPSBbXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMFxuICAgICAgICBdO1xuICAgIH1cbiAgICB2YXIgcGF5bG9hZCA9IHRoaXMuX3BheWxvYWQ7XG4gICAgcGF5bG9hZC5kZWx0YSA9IGRlbHRhO1xuICAgIHBheWxvYWQucG9zaXRpb24gPSB0aGlzLl9wb3NpdGlvbjtcbiAgICBwYXlsb2FkLnZlbG9jaXR5ID0gdmVsb2NpdHk7XG4gICAgcGF5bG9hZC5jbGllbnRYID0geDtcbiAgICBwYXlsb2FkLmNsaWVudFkgPSB5O1xuICAgIHBheWxvYWQub2Zmc2V0WCA9IGV2ZW50Lm9mZnNldFg7XG4gICAgcGF5bG9hZC5vZmZzZXRZID0gZXZlbnQub2Zmc2V0WTtcbiAgICB0aGlzLl9wb3NpdGlvbkhpc3RvcnkucHVzaCh7XG4gICAgICAgIHBvc2l0aW9uOiBwYXlsb2FkLnBvc2l0aW9uLnNsaWNlID8gcGF5bG9hZC5wb3NpdGlvbi5zbGljZSgwKSA6IHBheWxvYWQucG9zaXRpb24sXG4gICAgICAgIHRpbWU6IHRoaXMuX3ByZXZUaW1lXG4gICAgfSk7XG4gICAgdGhpcy5fZXZlbnRPdXRwdXQuZW1pdCgnc3RhcnQnLCBwYXlsb2FkKTtcbiAgICB0aGlzLl9kb2N1bWVudEFjdGl2ZSA9IGZhbHNlO1xufVxuZnVuY3Rpb24gX2hhbmRsZU1vdmUoZXZlbnQpIHtcbiAgICBpZiAoIXRoaXMuX3ByZXZDb29yZClcbiAgICAgICAgcmV0dXJuO1xuICAgIHZhciBwcmV2Q29vcmQgPSB0aGlzLl9wcmV2Q29vcmQ7XG4gICAgdmFyIHByZXZUaW1lID0gdGhpcy5fcHJldlRpbWU7XG4gICAgdmFyIHggPSBldmVudC5jbGllbnRYO1xuICAgIHZhciB5ID0gZXZlbnQuY2xpZW50WTtcbiAgICB2YXIgY3VyclRpbWUgPSBEYXRlLm5vdygpO1xuICAgIHZhciBkaWZmWCA9IHggLSBwcmV2Q29vcmRbMF07XG4gICAgdmFyIGRpZmZZID0geSAtIHByZXZDb29yZFsxXTtcbiAgICBpZiAodGhpcy5vcHRpb25zLnJhaWxzKSB7XG4gICAgICAgIGlmIChNYXRoLmFicyhkaWZmWCkgPiBNYXRoLmFicyhkaWZmWSkpXG4gICAgICAgICAgICBkaWZmWSA9IDA7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGRpZmZYID0gMDtcbiAgICB9XG4gICAgdmFyIGRpZmZUaW1lID0gTWF0aC5tYXgoY3VyclRpbWUgLSB0aGlzLl9wb3NpdGlvbkhpc3RvcnlbMF0udGltZSwgTUlOSU1VTV9USUNLX1RJTUUpO1xuICAgIHZhciBzY2FsZSA9IHRoaXMub3B0aW9ucy5zY2FsZTtcbiAgICB2YXIgbmV4dFZlbDtcbiAgICB2YXIgbmV4dERlbHRhO1xuICAgIGlmICh0aGlzLm9wdGlvbnMuZGlyZWN0aW9uID09PSBNb3VzZVN5bmMuRElSRUNUSU9OX1gpIHtcbiAgICAgICAgbmV4dERlbHRhID0gc2NhbGUgKiBkaWZmWDtcbiAgICAgICAgdGhpcy5fcG9zaXRpb24gKz0gbmV4dERlbHRhO1xuICAgICAgICBuZXh0VmVsID0gc2NhbGUgKiAodGhpcy5fcG9zaXRpb24gLSB0aGlzLl9wb3NpdGlvbkhpc3RvcnlbMF0ucG9zaXRpb24pIC8gZGlmZlRpbWU7XG4gICAgfSBlbHNlIGlmICh0aGlzLm9wdGlvbnMuZGlyZWN0aW9uID09PSBNb3VzZVN5bmMuRElSRUNUSU9OX1kpIHtcbiAgICAgICAgbmV4dERlbHRhID0gc2NhbGUgKiBkaWZmWTtcbiAgICAgICAgdGhpcy5fcG9zaXRpb24gKz0gbmV4dERlbHRhO1xuICAgICAgICBuZXh0VmVsID0gc2NhbGUgKiAodGhpcy5fcG9zaXRpb24gLSB0aGlzLl9wb3NpdGlvbkhpc3RvcnlbMF0ucG9zaXRpb24pIC8gZGlmZlRpbWU7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgbmV4dERlbHRhID0gW1xuICAgICAgICAgICAgc2NhbGUgKiBkaWZmWCxcbiAgICAgICAgICAgIHNjYWxlICogZGlmZllcbiAgICAgICAgXTtcbiAgICAgICAgbmV4dFZlbCA9IFtcbiAgICAgICAgICAgIHNjYWxlICogKHRoaXMuX3Bvc2l0aW9uWzBdIC0gdGhpcy5fcG9zaXRpb25IaXN0b3J5WzBdLnBvc2l0aW9uWzBdKSAvIGRpZmZUaW1lLFxuICAgICAgICAgICAgc2NhbGUgKiAodGhpcy5fcG9zaXRpb25bMV0gLSB0aGlzLl9wb3NpdGlvbkhpc3RvcnlbMF0ucG9zaXRpb25bMV0pIC8gZGlmZlRpbWVcbiAgICAgICAgXTtcbiAgICAgICAgdGhpcy5fcG9zaXRpb25bMF0gKz0gbmV4dERlbHRhWzBdO1xuICAgICAgICB0aGlzLl9wb3NpdGlvblsxXSArPSBuZXh0RGVsdGFbMV07XG4gICAgfVxuICAgIHZhciBwYXlsb2FkID0gdGhpcy5fcGF5bG9hZDtcbiAgICBwYXlsb2FkLmRlbHRhID0gbmV4dERlbHRhO1xuICAgIHBheWxvYWQucG9zaXRpb24gPSB0aGlzLl9wb3NpdGlvbjtcbiAgICBwYXlsb2FkLnZlbG9jaXR5ID0gbmV4dFZlbDtcbiAgICBwYXlsb2FkLmNsaWVudFggPSB4O1xuICAgIHBheWxvYWQuY2xpZW50WSA9IHk7XG4gICAgcGF5bG9hZC5vZmZzZXRYID0gZXZlbnQub2Zmc2V0WDtcbiAgICBwYXlsb2FkLm9mZnNldFkgPSBldmVudC5vZmZzZXRZO1xuICAgIGlmICh0aGlzLl9wb3NpdGlvbkhpc3RvcnkubGVuZ3RoID09PSB0aGlzLm9wdGlvbnMudmVsb2NpdHlTYW1wbGVMZW5ndGgpIHtcbiAgICAgICAgdGhpcy5fcG9zaXRpb25IaXN0b3J5LnNoaWZ0KCk7XG4gICAgfVxuICAgIHRoaXMuX3Bvc2l0aW9uSGlzdG9yeS5wdXNoKHtcbiAgICAgICAgcG9zaXRpb246IHBheWxvYWQucG9zaXRpb24uc2xpY2UgPyBwYXlsb2FkLnBvc2l0aW9uLnNsaWNlKDApIDogcGF5bG9hZC5wb3NpdGlvbixcbiAgICAgICAgdGltZTogY3VyclRpbWVcbiAgICB9KTtcbiAgICB0aGlzLl9ldmVudE91dHB1dC5lbWl0KCd1cGRhdGUnLCBwYXlsb2FkKTtcbiAgICB0aGlzLl9wcmV2Q29vcmQgPSBbXG4gICAgICAgIHgsXG4gICAgICAgIHlcbiAgICBdO1xuICAgIHRoaXMuX3ByZXZUaW1lID0gY3VyclRpbWU7XG4gICAgdGhpcy5fbW92ZSA9IHRydWU7XG59XG5mdW5jdGlvbiBfaGFuZGxlRW5kKGV2ZW50KSB7XG4gICAgaWYgKCF0aGlzLl9kb3duKVxuICAgICAgICByZXR1cm47XG4gICAgdGhpcy5fZXZlbnRPdXRwdXQuZW1pdCgnZW5kJywgdGhpcy5fcGF5bG9hZCk7XG4gICAgdGhpcy5fcHJldkNvb3JkID0gdW5kZWZpbmVkO1xuICAgIHRoaXMuX3ByZXZUaW1lID0gdW5kZWZpbmVkO1xuICAgIHRoaXMuX2Rvd24gPSBmYWxzZTtcbiAgICB0aGlzLl9tb3ZlID0gZmFsc2U7XG4gICAgdGhpcy5fcG9zaXRpb25IaXN0b3J5ID0gW107XG59XG5mdW5jdGlvbiBfaGFuZGxlTGVhdmUoZXZlbnQpIHtcbiAgICBpZiAoIXRoaXMuX2Rvd24gfHwgIXRoaXMuX21vdmUpXG4gICAgICAgIHJldHVybjtcbiAgICBpZiAoIXRoaXMuX2RvY3VtZW50QWN0aXZlKSB7XG4gICAgICAgIHZhciBib3VuZE1vdmUgPSBfaGFuZGxlTW92ZS5iaW5kKHRoaXMpO1xuICAgICAgICB2YXIgYm91bmRFbmQgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICAgICAgICBfaGFuZGxlRW5kLmNhbGwodGhpcywgZXZlbnQpO1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIGJvdW5kTW92ZSk7XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIGJvdW5kRW5kKTtcbiAgICAgICAgICAgIH0uYmluZCh0aGlzLCBldmVudCk7XG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIGJvdW5kTW92ZSk7XG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCBib3VuZEVuZCk7XG4gICAgICAgIHRoaXMuX2RvY3VtZW50QWN0aXZlID0gdHJ1ZTtcbiAgICB9XG59XG5Nb3VzZVN5bmMucHJvdG90eXBlLmdldE9wdGlvbnMgPSBmdW5jdGlvbiBnZXRPcHRpb25zKCkge1xuICAgIHJldHVybiB0aGlzLm9wdGlvbnM7XG59O1xuTW91c2VTeW5jLnByb3RvdHlwZS5zZXRPcHRpb25zID0gZnVuY3Rpb24gc2V0T3B0aW9ucyhvcHRpb25zKSB7XG4gICAgcmV0dXJuIHRoaXMuX29wdGlvbnNNYW5hZ2VyLnNldE9wdGlvbnMob3B0aW9ucyk7XG59O1xubW9kdWxlLmV4cG9ydHMgPSBNb3VzZVN5bmM7IiwidmFyIEV2ZW50SGFuZGxlciA9IHJlcXVpcmUoJy4uL2NvcmUvRXZlbnRIYW5kbGVyJyk7XG52YXIgRW5naW5lID0gcmVxdWlyZSgnLi4vY29yZS9FbmdpbmUnKTtcbnZhciBPcHRpb25zTWFuYWdlciA9IHJlcXVpcmUoJy4uL2NvcmUvT3B0aW9uc01hbmFnZXInKTtcbmZ1bmN0aW9uIFNjcm9sbFN5bmMob3B0aW9ucykge1xuICAgIHRoaXMub3B0aW9ucyA9IE9iamVjdC5jcmVhdGUoU2Nyb2xsU3luYy5ERUZBVUxUX09QVElPTlMpO1xuICAgIHRoaXMuX29wdGlvbnNNYW5hZ2VyID0gbmV3IE9wdGlvbnNNYW5hZ2VyKHRoaXMub3B0aW9ucyk7XG4gICAgaWYgKG9wdGlvbnMpXG4gICAgICAgIHRoaXMuc2V0T3B0aW9ucyhvcHRpb25zKTtcbiAgICB0aGlzLl9wYXlsb2FkID0ge1xuICAgICAgICBkZWx0YTogbnVsbCxcbiAgICAgICAgcG9zaXRpb246IG51bGwsXG4gICAgICAgIHZlbG9jaXR5OiBudWxsLFxuICAgICAgICBzbGlwOiB0cnVlXG4gICAgfTtcbiAgICB0aGlzLl9ldmVudElucHV0ID0gbmV3IEV2ZW50SGFuZGxlcigpO1xuICAgIHRoaXMuX2V2ZW50T3V0cHV0ID0gbmV3IEV2ZW50SGFuZGxlcigpO1xuICAgIEV2ZW50SGFuZGxlci5zZXRJbnB1dEhhbmRsZXIodGhpcywgdGhpcy5fZXZlbnRJbnB1dCk7XG4gICAgRXZlbnRIYW5kbGVyLnNldE91dHB1dEhhbmRsZXIodGhpcywgdGhpcy5fZXZlbnRPdXRwdXQpO1xuICAgIHRoaXMuX3Bvc2l0aW9uID0gdGhpcy5vcHRpb25zLmRpcmVjdGlvbiA9PT0gdW5kZWZpbmVkID8gW1xuICAgICAgICAwLFxuICAgICAgICAwXG4gICAgXSA6IDA7XG4gICAgdGhpcy5fcHJldlRpbWUgPSB1bmRlZmluZWQ7XG4gICAgdGhpcy5fcHJldlZlbCA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLl9ldmVudElucHV0Lm9uKCdtb3VzZXdoZWVsJywgX2hhbmRsZU1vdmUuYmluZCh0aGlzKSk7XG4gICAgdGhpcy5fZXZlbnRJbnB1dC5vbignd2hlZWwnLCBfaGFuZGxlTW92ZS5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLl9pblByb2dyZXNzID0gZmFsc2U7XG4gICAgdGhpcy5fbG9vcEJvdW5kID0gZmFsc2U7XG59XG5TY3JvbGxTeW5jLkRFRkFVTFRfT1BUSU9OUyA9IHtcbiAgICBkaXJlY3Rpb246IHVuZGVmaW5lZCxcbiAgICBtaW5pbXVtRW5kU3BlZWQ6IEluZmluaXR5LFxuICAgIHJhaWxzOiBmYWxzZSxcbiAgICBzY2FsZTogMSxcbiAgICBzdGFsbFRpbWU6IDUwLFxuICAgIGxpbmVIZWlnaHQ6IDQwLFxuICAgIHByZXZlbnREZWZhdWx0OiB0cnVlXG59O1xuU2Nyb2xsU3luYy5ESVJFQ1RJT05fWCA9IDA7XG5TY3JvbGxTeW5jLkRJUkVDVElPTl9ZID0gMTtcbnZhciBNSU5JTVVNX1RJQ0tfVElNRSA9IDg7XG52YXIgX25vdyA9IERhdGUubm93O1xuZnVuY3Rpb24gX25ld0ZyYW1lKCkge1xuICAgIGlmICh0aGlzLl9pblByb2dyZXNzICYmIF9ub3coKSAtIHRoaXMuX3ByZXZUaW1lID4gdGhpcy5vcHRpb25zLnN0YWxsVGltZSkge1xuICAgICAgICB0aGlzLl9pblByb2dyZXNzID0gZmFsc2U7XG4gICAgICAgIHZhciBmaW5hbFZlbCA9IE1hdGguYWJzKHRoaXMuX3ByZXZWZWwpID49IHRoaXMub3B0aW9ucy5taW5pbXVtRW5kU3BlZWQgPyB0aGlzLl9wcmV2VmVsIDogMDtcbiAgICAgICAgdmFyIHBheWxvYWQgPSB0aGlzLl9wYXlsb2FkO1xuICAgICAgICBwYXlsb2FkLnBvc2l0aW9uID0gdGhpcy5fcG9zaXRpb247XG4gICAgICAgIHBheWxvYWQudmVsb2NpdHkgPSBmaW5hbFZlbDtcbiAgICAgICAgcGF5bG9hZC5zbGlwID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5fZXZlbnRPdXRwdXQuZW1pdCgnZW5kJywgcGF5bG9hZCk7XG4gICAgfVxufVxuZnVuY3Rpb24gX2hhbmRsZU1vdmUoZXZlbnQpIHtcbiAgICBpZiAodGhpcy5vcHRpb25zLnByZXZlbnREZWZhdWx0KVxuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGlmICghdGhpcy5faW5Qcm9ncmVzcykge1xuICAgICAgICB0aGlzLl9pblByb2dyZXNzID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5fcG9zaXRpb24gPSB0aGlzLm9wdGlvbnMuZGlyZWN0aW9uID09PSB1bmRlZmluZWQgPyBbXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMFxuICAgICAgICBdIDogMDtcbiAgICAgICAgcGF5bG9hZCA9IHRoaXMuX3BheWxvYWQ7XG4gICAgICAgIHBheWxvYWQuc2xpcCA9IHRydWU7XG4gICAgICAgIHBheWxvYWQucG9zaXRpb24gPSB0aGlzLl9wb3NpdGlvbjtcbiAgICAgICAgcGF5bG9hZC5jbGllbnRYID0gZXZlbnQuY2xpZW50WDtcbiAgICAgICAgcGF5bG9hZC5jbGllbnRZID0gZXZlbnQuY2xpZW50WTtcbiAgICAgICAgcGF5bG9hZC5vZmZzZXRYID0gZXZlbnQub2Zmc2V0WDtcbiAgICAgICAgcGF5bG9hZC5vZmZzZXRZID0gZXZlbnQub2Zmc2V0WTtcbiAgICAgICAgdGhpcy5fZXZlbnRPdXRwdXQuZW1pdCgnc3RhcnQnLCBwYXlsb2FkKTtcbiAgICAgICAgaWYgKCF0aGlzLl9sb29wQm91bmQpIHtcbiAgICAgICAgICAgIEVuZ2luZS5vbigncHJlcmVuZGVyJywgX25ld0ZyYW1lLmJpbmQodGhpcykpO1xuICAgICAgICAgICAgdGhpcy5fbG9vcEJvdW5kID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICB2YXIgY3VyclRpbWUgPSBfbm93KCk7XG4gICAgdmFyIHByZXZUaW1lID0gdGhpcy5fcHJldlRpbWUgfHwgY3VyclRpbWU7XG4gICAgdmFyIGRpZmZYID0gZXZlbnQud2hlZWxEZWx0YVggIT09IHVuZGVmaW5lZCA/IGV2ZW50LndoZWVsRGVsdGFYIDogLWV2ZW50LmRlbHRhWDtcbiAgICB2YXIgZGlmZlkgPSBldmVudC53aGVlbERlbHRhWSAhPT0gdW5kZWZpbmVkID8gZXZlbnQud2hlZWxEZWx0YVkgOiAtZXZlbnQuZGVsdGFZO1xuICAgIGlmIChldmVudC5kZWx0YU1vZGUgPT09IDEpIHtcbiAgICAgICAgZGlmZlggKj0gdGhpcy5vcHRpb25zLmxpbmVIZWlnaHQ7XG4gICAgICAgIGRpZmZZICo9IHRoaXMub3B0aW9ucy5saW5lSGVpZ2h0O1xuICAgIH1cbiAgICBpZiAodGhpcy5vcHRpb25zLnJhaWxzKSB7XG4gICAgICAgIGlmIChNYXRoLmFicyhkaWZmWCkgPiBNYXRoLmFicyhkaWZmWSkpXG4gICAgICAgICAgICBkaWZmWSA9IDA7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGRpZmZYID0gMDtcbiAgICB9XG4gICAgdmFyIGRpZmZUaW1lID0gTWF0aC5tYXgoY3VyclRpbWUgLSBwcmV2VGltZSwgTUlOSU1VTV9USUNLX1RJTUUpO1xuICAgIHZhciB2ZWxYID0gZGlmZlggLyBkaWZmVGltZTtcbiAgICB2YXIgdmVsWSA9IGRpZmZZIC8gZGlmZlRpbWU7XG4gICAgdmFyIHNjYWxlID0gdGhpcy5vcHRpb25zLnNjYWxlO1xuICAgIHZhciBuZXh0VmVsO1xuICAgIHZhciBuZXh0RGVsdGE7XG4gICAgaWYgKHRoaXMub3B0aW9ucy5kaXJlY3Rpb24gPT09IFNjcm9sbFN5bmMuRElSRUNUSU9OX1gpIHtcbiAgICAgICAgbmV4dERlbHRhID0gc2NhbGUgKiBkaWZmWDtcbiAgICAgICAgbmV4dFZlbCA9IHNjYWxlICogdmVsWDtcbiAgICAgICAgdGhpcy5fcG9zaXRpb24gKz0gbmV4dERlbHRhO1xuICAgIH0gZWxzZSBpZiAodGhpcy5vcHRpb25zLmRpcmVjdGlvbiA9PT0gU2Nyb2xsU3luYy5ESVJFQ1RJT05fWSkge1xuICAgICAgICBuZXh0RGVsdGEgPSBzY2FsZSAqIGRpZmZZO1xuICAgICAgICBuZXh0VmVsID0gc2NhbGUgKiB2ZWxZO1xuICAgICAgICB0aGlzLl9wb3NpdGlvbiArPSBuZXh0RGVsdGE7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgbmV4dERlbHRhID0gW1xuICAgICAgICAgICAgc2NhbGUgKiBkaWZmWCxcbiAgICAgICAgICAgIHNjYWxlICogZGlmZllcbiAgICAgICAgXTtcbiAgICAgICAgbmV4dFZlbCA9IFtcbiAgICAgICAgICAgIHNjYWxlICogdmVsWCxcbiAgICAgICAgICAgIHNjYWxlICogdmVsWVxuICAgICAgICBdO1xuICAgICAgICB0aGlzLl9wb3NpdGlvblswXSArPSBuZXh0RGVsdGFbMF07XG4gICAgICAgIHRoaXMuX3Bvc2l0aW9uWzFdICs9IG5leHREZWx0YVsxXTtcbiAgICB9XG4gICAgdmFyIHBheWxvYWQgPSB0aGlzLl9wYXlsb2FkO1xuICAgIHBheWxvYWQuZGVsdGEgPSBuZXh0RGVsdGE7XG4gICAgcGF5bG9hZC52ZWxvY2l0eSA9IG5leHRWZWw7XG4gICAgcGF5bG9hZC5wb3NpdGlvbiA9IHRoaXMuX3Bvc2l0aW9uO1xuICAgIHBheWxvYWQuc2xpcCA9IHRydWU7XG4gICAgdGhpcy5fZXZlbnRPdXRwdXQuZW1pdCgndXBkYXRlJywgcGF5bG9hZCk7XG4gICAgdGhpcy5fcHJldlRpbWUgPSBjdXJyVGltZTtcbiAgICB0aGlzLl9wcmV2VmVsID0gbmV4dFZlbDtcbn1cblNjcm9sbFN5bmMucHJvdG90eXBlLmdldE9wdGlvbnMgPSBmdW5jdGlvbiBnZXRPcHRpb25zKCkge1xuICAgIHJldHVybiB0aGlzLm9wdGlvbnM7XG59O1xuU2Nyb2xsU3luYy5wcm90b3R5cGUuc2V0T3B0aW9ucyA9IGZ1bmN0aW9uIHNldE9wdGlvbnMob3B0aW9ucykge1xuICAgIHJldHVybiB0aGlzLl9vcHRpb25zTWFuYWdlci5zZXRPcHRpb25zKG9wdGlvbnMpO1xufTtcbm1vZHVsZS5leHBvcnRzID0gU2Nyb2xsU3luYzsiLCJ2YXIgVG91Y2hUcmFja2VyID0gcmVxdWlyZSgnLi9Ub3VjaFRyYWNrZXInKTtcbnZhciBFdmVudEhhbmRsZXIgPSByZXF1aXJlKCcuLi9jb3JlL0V2ZW50SGFuZGxlcicpO1xudmFyIE9wdGlvbnNNYW5hZ2VyID0gcmVxdWlyZSgnLi4vY29yZS9PcHRpb25zTWFuYWdlcicpO1xuZnVuY3Rpb24gVG91Y2hTeW5jKG9wdGlvbnMpIHtcbiAgICB0aGlzLm9wdGlvbnMgPSBPYmplY3QuY3JlYXRlKFRvdWNoU3luYy5ERUZBVUxUX09QVElPTlMpO1xuICAgIHRoaXMuX29wdGlvbnNNYW5hZ2VyID0gbmV3IE9wdGlvbnNNYW5hZ2VyKHRoaXMub3B0aW9ucyk7XG4gICAgaWYgKG9wdGlvbnMpXG4gICAgICAgIHRoaXMuc2V0T3B0aW9ucyhvcHRpb25zKTtcbiAgICB0aGlzLl9ldmVudE91dHB1dCA9IG5ldyBFdmVudEhhbmRsZXIoKTtcbiAgICB0aGlzLl90b3VjaFRyYWNrZXIgPSBuZXcgVG91Y2hUcmFja2VyKHsgdG91Y2hMaW1pdDogdGhpcy5vcHRpb25zLnRvdWNoTGltaXQgfSk7XG4gICAgRXZlbnRIYW5kbGVyLnNldE91dHB1dEhhbmRsZXIodGhpcywgdGhpcy5fZXZlbnRPdXRwdXQpO1xuICAgIEV2ZW50SGFuZGxlci5zZXRJbnB1dEhhbmRsZXIodGhpcywgdGhpcy5fdG91Y2hUcmFja2VyKTtcbiAgICB0aGlzLl90b3VjaFRyYWNrZXIub24oJ3RyYWNrc3RhcnQnLCBfaGFuZGxlU3RhcnQuYmluZCh0aGlzKSk7XG4gICAgdGhpcy5fdG91Y2hUcmFja2VyLm9uKCd0cmFja21vdmUnLCBfaGFuZGxlTW92ZS5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLl90b3VjaFRyYWNrZXIub24oJ3RyYWNrZW5kJywgX2hhbmRsZUVuZC5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLl9wYXlsb2FkID0ge1xuICAgICAgICBkZWx0YTogbnVsbCxcbiAgICAgICAgcG9zaXRpb246IG51bGwsXG4gICAgICAgIHZlbG9jaXR5OiBudWxsLFxuICAgICAgICBjbGllbnRYOiB1bmRlZmluZWQsXG4gICAgICAgIGNsaWVudFk6IHVuZGVmaW5lZCxcbiAgICAgICAgY291bnQ6IDAsXG4gICAgICAgIHRvdWNoOiB1bmRlZmluZWRcbiAgICB9O1xuICAgIHRoaXMuX3Bvc2l0aW9uID0gbnVsbDtcbn1cblRvdWNoU3luYy5ERUZBVUxUX09QVElPTlMgPSB7XG4gICAgZGlyZWN0aW9uOiB1bmRlZmluZWQsXG4gICAgcmFpbHM6IGZhbHNlLFxuICAgIHRvdWNoTGltaXQ6IDEsXG4gICAgdmVsb2NpdHlTYW1wbGVMZW5ndGg6IDEwLFxuICAgIHNjYWxlOiAxXG59O1xuVG91Y2hTeW5jLkRJUkVDVElPTl9YID0gMDtcblRvdWNoU3luYy5ESVJFQ1RJT05fWSA9IDE7XG52YXIgTUlOSU1VTV9USUNLX1RJTUUgPSA4O1xuZnVuY3Rpb24gX2hhbmRsZVN0YXJ0KGRhdGEpIHtcbiAgICB2YXIgdmVsb2NpdHk7XG4gICAgdmFyIGRlbHRhO1xuICAgIGlmICh0aGlzLm9wdGlvbnMuZGlyZWN0aW9uICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdGhpcy5fcG9zaXRpb24gPSAwO1xuICAgICAgICB2ZWxvY2l0eSA9IDA7XG4gICAgICAgIGRlbHRhID0gMDtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9wb3NpdGlvbiA9IFtcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAwXG4gICAgICAgIF07XG4gICAgICAgIHZlbG9jaXR5ID0gW1xuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDBcbiAgICAgICAgXTtcbiAgICAgICAgZGVsdGEgPSBbXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMFxuICAgICAgICBdO1xuICAgIH1cbiAgICB2YXIgcGF5bG9hZCA9IHRoaXMuX3BheWxvYWQ7XG4gICAgcGF5bG9hZC5kZWx0YSA9IGRlbHRhO1xuICAgIHBheWxvYWQucG9zaXRpb24gPSB0aGlzLl9wb3NpdGlvbjtcbiAgICBwYXlsb2FkLnZlbG9jaXR5ID0gdmVsb2NpdHk7XG4gICAgcGF5bG9hZC5jbGllbnRYID0gZGF0YS54O1xuICAgIHBheWxvYWQuY2xpZW50WSA9IGRhdGEueTtcbiAgICBwYXlsb2FkLmNvdW50ID0gZGF0YS5jb3VudDtcbiAgICBwYXlsb2FkLnRvdWNoID0gZGF0YS5pZGVudGlmaWVyO1xuICAgIHRoaXMuX2V2ZW50T3V0cHV0LmVtaXQoJ3N0YXJ0JywgcGF5bG9hZCk7XG59XG5mdW5jdGlvbiBfaGFuZGxlTW92ZShkYXRhKSB7XG4gICAgdmFyIGhpc3RvcnkgPSBkYXRhLmhpc3Rvcnk7XG4gICAgdmFyIGN1cnJIaXN0b3J5ID0gaGlzdG9yeVtoaXN0b3J5Lmxlbmd0aCAtIDFdO1xuICAgIHZhciBwcmV2SGlzdG9yeSA9IGhpc3RvcnlbaGlzdG9yeS5sZW5ndGggLSAyXTtcbiAgICB2YXIgZGlzdGFudEhpc3RvcnkgPSBoaXN0b3J5W2hpc3RvcnkubGVuZ3RoIC0gdGhpcy5vcHRpb25zLnZlbG9jaXR5U2FtcGxlTGVuZ3RoXSA/IGhpc3RvcnlbaGlzdG9yeS5sZW5ndGggLSB0aGlzLm9wdGlvbnMudmVsb2NpdHlTYW1wbGVMZW5ndGhdIDogaGlzdG9yeVtoaXN0b3J5Lmxlbmd0aCAtIDJdO1xuICAgIHZhciBkaXN0YW50VGltZSA9IGRpc3RhbnRIaXN0b3J5LnRpbWVzdGFtcDtcbiAgICB2YXIgY3VyclRpbWUgPSBjdXJySGlzdG9yeS50aW1lc3RhbXA7XG4gICAgdmFyIGRpZmZYID0gY3Vyckhpc3RvcnkueCAtIHByZXZIaXN0b3J5Lng7XG4gICAgdmFyIGRpZmZZID0gY3Vyckhpc3RvcnkueSAtIHByZXZIaXN0b3J5Lnk7XG4gICAgdmFyIHZlbERpZmZYID0gY3Vyckhpc3RvcnkueCAtIGRpc3RhbnRIaXN0b3J5Lng7XG4gICAgdmFyIHZlbERpZmZZID0gY3Vyckhpc3RvcnkueSAtIGRpc3RhbnRIaXN0b3J5Lnk7XG4gICAgaWYgKHRoaXMub3B0aW9ucy5yYWlscykge1xuICAgICAgICBpZiAoTWF0aC5hYnMoZGlmZlgpID4gTWF0aC5hYnMoZGlmZlkpKVxuICAgICAgICAgICAgZGlmZlkgPSAwO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBkaWZmWCA9IDA7XG4gICAgICAgIGlmIChNYXRoLmFicyh2ZWxEaWZmWCkgPiBNYXRoLmFicyh2ZWxEaWZmWSkpXG4gICAgICAgICAgICB2ZWxEaWZmWSA9IDA7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHZlbERpZmZYID0gMDtcbiAgICB9XG4gICAgdmFyIGRpZmZUaW1lID0gTWF0aC5tYXgoY3VyclRpbWUgLSBkaXN0YW50VGltZSwgTUlOSU1VTV9USUNLX1RJTUUpO1xuICAgIHZhciB2ZWxYID0gdmVsRGlmZlggLyBkaWZmVGltZTtcbiAgICB2YXIgdmVsWSA9IHZlbERpZmZZIC8gZGlmZlRpbWU7XG4gICAgdmFyIHNjYWxlID0gdGhpcy5vcHRpb25zLnNjYWxlO1xuICAgIHZhciBuZXh0VmVsO1xuICAgIHZhciBuZXh0RGVsdGE7XG4gICAgaWYgKHRoaXMub3B0aW9ucy5kaXJlY3Rpb24gPT09IFRvdWNoU3luYy5ESVJFQ1RJT05fWCkge1xuICAgICAgICBuZXh0RGVsdGEgPSBzY2FsZSAqIGRpZmZYO1xuICAgICAgICBuZXh0VmVsID0gc2NhbGUgKiB2ZWxYO1xuICAgICAgICB0aGlzLl9wb3NpdGlvbiArPSBuZXh0RGVsdGE7XG4gICAgfSBlbHNlIGlmICh0aGlzLm9wdGlvbnMuZGlyZWN0aW9uID09PSBUb3VjaFN5bmMuRElSRUNUSU9OX1kpIHtcbiAgICAgICAgbmV4dERlbHRhID0gc2NhbGUgKiBkaWZmWTtcbiAgICAgICAgbmV4dFZlbCA9IHNjYWxlICogdmVsWTtcbiAgICAgICAgdGhpcy5fcG9zaXRpb24gKz0gbmV4dERlbHRhO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIG5leHREZWx0YSA9IFtcbiAgICAgICAgICAgIHNjYWxlICogZGlmZlgsXG4gICAgICAgICAgICBzY2FsZSAqIGRpZmZZXG4gICAgICAgIF07XG4gICAgICAgIG5leHRWZWwgPSBbXG4gICAgICAgICAgICBzY2FsZSAqIHZlbFgsXG4gICAgICAgICAgICBzY2FsZSAqIHZlbFlcbiAgICAgICAgXTtcbiAgICAgICAgdGhpcy5fcG9zaXRpb25bMF0gKz0gbmV4dERlbHRhWzBdO1xuICAgICAgICB0aGlzLl9wb3NpdGlvblsxXSArPSBuZXh0RGVsdGFbMV07XG4gICAgfVxuICAgIHZhciBwYXlsb2FkID0gdGhpcy5fcGF5bG9hZDtcbiAgICBwYXlsb2FkLmRlbHRhID0gbmV4dERlbHRhO1xuICAgIHBheWxvYWQudmVsb2NpdHkgPSBuZXh0VmVsO1xuICAgIHBheWxvYWQucG9zaXRpb24gPSB0aGlzLl9wb3NpdGlvbjtcbiAgICBwYXlsb2FkLmNsaWVudFggPSBkYXRhLng7XG4gICAgcGF5bG9hZC5jbGllbnRZID0gZGF0YS55O1xuICAgIHBheWxvYWQuY291bnQgPSBkYXRhLmNvdW50O1xuICAgIHBheWxvYWQudG91Y2ggPSBkYXRhLmlkZW50aWZpZXI7XG4gICAgdGhpcy5fZXZlbnRPdXRwdXQuZW1pdCgndXBkYXRlJywgcGF5bG9hZCk7XG59XG5mdW5jdGlvbiBfaGFuZGxlRW5kKGRhdGEpIHtcbiAgICB0aGlzLl9wYXlsb2FkLmNvdW50ID0gZGF0YS5jb3VudDtcbiAgICB0aGlzLl9ldmVudE91dHB1dC5lbWl0KCdlbmQnLCB0aGlzLl9wYXlsb2FkKTtcbn1cblRvdWNoU3luYy5wcm90b3R5cGUuc2V0T3B0aW9ucyA9IGZ1bmN0aW9uIHNldE9wdGlvbnMob3B0aW9ucykge1xuICAgIHJldHVybiB0aGlzLl9vcHRpb25zTWFuYWdlci5zZXRPcHRpb25zKG9wdGlvbnMpO1xufTtcblRvdWNoU3luYy5wcm90b3R5cGUuZ2V0T3B0aW9ucyA9IGZ1bmN0aW9uIGdldE9wdGlvbnMoKSB7XG4gICAgcmV0dXJuIHRoaXMub3B0aW9ucztcbn07XG5tb2R1bGUuZXhwb3J0cyA9IFRvdWNoU3luYzsiLCJ2YXIgRXZlbnRIYW5kbGVyID0gcmVxdWlyZSgnLi4vY29yZS9FdmVudEhhbmRsZXInKTtcbnZhciBfbm93ID0gRGF0ZS5ub3c7XG5mdW5jdGlvbiBfdGltZXN0YW1wVG91Y2godG91Y2gsIGV2ZW50LCBoaXN0b3J5KSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgeDogdG91Y2guY2xpZW50WCxcbiAgICAgICAgeTogdG91Y2guY2xpZW50WSxcbiAgICAgICAgaWRlbnRpZmllcjogdG91Y2guaWRlbnRpZmllcixcbiAgICAgICAgb3JpZ2luOiBldmVudC5vcmlnaW4sXG4gICAgICAgIHRpbWVzdGFtcDogX25vdygpLFxuICAgICAgICBjb3VudDogZXZlbnQudG91Y2hlcy5sZW5ndGgsXG4gICAgICAgIGhpc3Rvcnk6IGhpc3RvcnlcbiAgICB9O1xufVxuZnVuY3Rpb24gX2hhbmRsZVN0YXJ0KGV2ZW50KSB7XG4gICAgaWYgKGV2ZW50LnRvdWNoZXMubGVuZ3RoID4gdGhpcy50b3VjaExpbWl0KVxuICAgICAgICByZXR1cm47XG4gICAgdGhpcy5pc1RvdWNoZWQgPSB0cnVlO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZXZlbnQuY2hhbmdlZFRvdWNoZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIHRvdWNoID0gZXZlbnQuY2hhbmdlZFRvdWNoZXNbaV07XG4gICAgICAgIHZhciBkYXRhID0gX3RpbWVzdGFtcFRvdWNoKHRvdWNoLCBldmVudCwgbnVsbCk7XG4gICAgICAgIHRoaXMuZXZlbnRPdXRwdXQuZW1pdCgndHJhY2tzdGFydCcsIGRhdGEpO1xuICAgICAgICBpZiAoIXRoaXMuc2VsZWN0aXZlICYmICF0aGlzLnRvdWNoSGlzdG9yeVt0b3VjaC5pZGVudGlmaWVyXSlcbiAgICAgICAgICAgIHRoaXMudHJhY2soZGF0YSk7XG4gICAgfVxufVxuZnVuY3Rpb24gX2hhbmRsZU1vdmUoZXZlbnQpIHtcbiAgICBpZiAoZXZlbnQudG91Y2hlcy5sZW5ndGggPiB0aGlzLnRvdWNoTGltaXQpXG4gICAgICAgIHJldHVybjtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGV2ZW50LmNoYW5nZWRUb3VjaGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciB0b3VjaCA9IGV2ZW50LmNoYW5nZWRUb3VjaGVzW2ldO1xuICAgICAgICB2YXIgaGlzdG9yeSA9IHRoaXMudG91Y2hIaXN0b3J5W3RvdWNoLmlkZW50aWZpZXJdO1xuICAgICAgICBpZiAoaGlzdG9yeSkge1xuICAgICAgICAgICAgdmFyIGRhdGEgPSBfdGltZXN0YW1wVG91Y2godG91Y2gsIGV2ZW50LCBoaXN0b3J5KTtcbiAgICAgICAgICAgIHRoaXMudG91Y2hIaXN0b3J5W3RvdWNoLmlkZW50aWZpZXJdLnB1c2goZGF0YSk7XG4gICAgICAgICAgICB0aGlzLmV2ZW50T3V0cHV0LmVtaXQoJ3RyYWNrbW92ZScsIGRhdGEpO1xuICAgICAgICB9XG4gICAgfVxufVxuZnVuY3Rpb24gX2hhbmRsZUVuZChldmVudCkge1xuICAgIGlmICghdGhpcy5pc1RvdWNoZWQpXG4gICAgICAgIHJldHVybjtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGV2ZW50LmNoYW5nZWRUb3VjaGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciB0b3VjaCA9IGV2ZW50LmNoYW5nZWRUb3VjaGVzW2ldO1xuICAgICAgICB2YXIgaGlzdG9yeSA9IHRoaXMudG91Y2hIaXN0b3J5W3RvdWNoLmlkZW50aWZpZXJdO1xuICAgICAgICBpZiAoaGlzdG9yeSkge1xuICAgICAgICAgICAgdmFyIGRhdGEgPSBfdGltZXN0YW1wVG91Y2godG91Y2gsIGV2ZW50LCBoaXN0b3J5KTtcbiAgICAgICAgICAgIHRoaXMuZXZlbnRPdXRwdXQuZW1pdCgndHJhY2tlbmQnLCBkYXRhKTtcbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzLnRvdWNoSGlzdG9yeVt0b3VjaC5pZGVudGlmaWVyXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICB0aGlzLmlzVG91Y2hlZCA9IGZhbHNlO1xufVxuZnVuY3Rpb24gX2hhbmRsZVVucGlwZSgpIHtcbiAgICBmb3IgKHZhciBpIGluIHRoaXMudG91Y2hIaXN0b3J5KSB7XG4gICAgICAgIHZhciBoaXN0b3J5ID0gdGhpcy50b3VjaEhpc3RvcnlbaV07XG4gICAgICAgIHRoaXMuZXZlbnRPdXRwdXQuZW1pdCgndHJhY2tlbmQnLCB7XG4gICAgICAgICAgICB0b3VjaDogaGlzdG9yeVtoaXN0b3J5Lmxlbmd0aCAtIDFdLnRvdWNoLFxuICAgICAgICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpLFxuICAgICAgICAgICAgY291bnQ6IDAsXG4gICAgICAgICAgICBoaXN0b3J5OiBoaXN0b3J5XG4gICAgICAgIH0pO1xuICAgICAgICBkZWxldGUgdGhpcy50b3VjaEhpc3RvcnlbaV07XG4gICAgfVxufVxuZnVuY3Rpb24gVG91Y2hUcmFja2VyKG9wdGlvbnMpIHtcbiAgICB0aGlzLnNlbGVjdGl2ZSA9IG9wdGlvbnMuc2VsZWN0aXZlO1xuICAgIHRoaXMudG91Y2hMaW1pdCA9IG9wdGlvbnMudG91Y2hMaW1pdCB8fCAxO1xuICAgIHRoaXMudG91Y2hIaXN0b3J5ID0ge307XG4gICAgdGhpcy5ldmVudElucHV0ID0gbmV3IEV2ZW50SGFuZGxlcigpO1xuICAgIHRoaXMuZXZlbnRPdXRwdXQgPSBuZXcgRXZlbnRIYW5kbGVyKCk7XG4gICAgRXZlbnRIYW5kbGVyLnNldElucHV0SGFuZGxlcih0aGlzLCB0aGlzLmV2ZW50SW5wdXQpO1xuICAgIEV2ZW50SGFuZGxlci5zZXRPdXRwdXRIYW5kbGVyKHRoaXMsIHRoaXMuZXZlbnRPdXRwdXQpO1xuICAgIHRoaXMuZXZlbnRJbnB1dC5vbigndG91Y2hzdGFydCcsIF9oYW5kbGVTdGFydC5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLmV2ZW50SW5wdXQub24oJ3RvdWNobW92ZScsIF9oYW5kbGVNb3ZlLmJpbmQodGhpcykpO1xuICAgIHRoaXMuZXZlbnRJbnB1dC5vbigndG91Y2hlbmQnLCBfaGFuZGxlRW5kLmJpbmQodGhpcykpO1xuICAgIHRoaXMuZXZlbnRJbnB1dC5vbigndG91Y2hjYW5jZWwnLCBfaGFuZGxlRW5kLmJpbmQodGhpcykpO1xuICAgIHRoaXMuZXZlbnRJbnB1dC5vbigndW5waXBlJywgX2hhbmRsZVVucGlwZS5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLmlzVG91Y2hlZCA9IGZhbHNlO1xufVxuVG91Y2hUcmFja2VyLnByb3RvdHlwZS50cmFjayA9IGZ1bmN0aW9uIHRyYWNrKGRhdGEpIHtcbiAgICB0aGlzLnRvdWNoSGlzdG9yeVtkYXRhLmlkZW50aWZpZXJdID0gW2RhdGFdO1xufTtcbm1vZHVsZS5leHBvcnRzID0gVG91Y2hUcmFja2VyOyIsInZhciBWZWN0b3IgPSByZXF1aXJlKCcuL1ZlY3RvcicpO1xuZnVuY3Rpb24gTWF0cml4KHZhbHVlcykge1xuICAgIHRoaXMudmFsdWVzID0gdmFsdWVzIHx8IFtcbiAgICAgICAgW1xuICAgICAgICAgICAgMSxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAwXG4gICAgICAgIF0sXG4gICAgICAgIFtcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAxLFxuICAgICAgICAgICAgMFxuICAgICAgICBdLFxuICAgICAgICBbXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDFcbiAgICAgICAgXVxuICAgIF07XG4gICAgcmV0dXJuIHRoaXM7XG59XG52YXIgX3JlZ2lzdGVyID0gbmV3IE1hdHJpeCgpO1xudmFyIF92ZWN0b3JSZWdpc3RlciA9IG5ldyBWZWN0b3IoKTtcbk1hdHJpeC5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24gZ2V0KCkge1xuICAgIHJldHVybiB0aGlzLnZhbHVlcztcbn07XG5NYXRyaXgucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uIHNldCh2YWx1ZXMpIHtcbiAgICB0aGlzLnZhbHVlcyA9IHZhbHVlcztcbn07XG5NYXRyaXgucHJvdG90eXBlLnZlY3Rvck11bHRpcGx5ID0gZnVuY3Rpb24gdmVjdG9yTXVsdGlwbHkodikge1xuICAgIHZhciBNID0gdGhpcy5nZXQoKTtcbiAgICB2YXIgdjAgPSB2Lng7XG4gICAgdmFyIHYxID0gdi55O1xuICAgIHZhciB2MiA9IHYuejtcbiAgICB2YXIgTTAgPSBNWzBdO1xuICAgIHZhciBNMSA9IE1bMV07XG4gICAgdmFyIE0yID0gTVsyXTtcbiAgICB2YXIgTTAwID0gTTBbMF07XG4gICAgdmFyIE0wMSA9IE0wWzFdO1xuICAgIHZhciBNMDIgPSBNMFsyXTtcbiAgICB2YXIgTTEwID0gTTFbMF07XG4gICAgdmFyIE0xMSA9IE0xWzFdO1xuICAgIHZhciBNMTIgPSBNMVsyXTtcbiAgICB2YXIgTTIwID0gTTJbMF07XG4gICAgdmFyIE0yMSA9IE0yWzFdO1xuICAgIHZhciBNMjIgPSBNMlsyXTtcbiAgICByZXR1cm4gX3ZlY3RvclJlZ2lzdGVyLnNldFhZWihNMDAgKiB2MCArIE0wMSAqIHYxICsgTTAyICogdjIsIE0xMCAqIHYwICsgTTExICogdjEgKyBNMTIgKiB2MiwgTTIwICogdjAgKyBNMjEgKiB2MSArIE0yMiAqIHYyKTtcbn07XG5NYXRyaXgucHJvdG90eXBlLm11bHRpcGx5ID0gZnVuY3Rpb24gbXVsdGlwbHkoTTIpIHtcbiAgICB2YXIgTTEgPSB0aGlzLmdldCgpO1xuICAgIHZhciByZXN1bHQgPSBbW11dO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMzsgaSsrKSB7XG4gICAgICAgIHJlc3VsdFtpXSA9IFtdO1xuICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IDM7IGorKykge1xuICAgICAgICAgICAgdmFyIHN1bSA9IDA7XG4gICAgICAgICAgICBmb3IgKHZhciBrID0gMDsgayA8IDM7IGsrKykge1xuICAgICAgICAgICAgICAgIHN1bSArPSBNMVtpXVtrXSAqIE0yW2tdW2pdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVzdWx0W2ldW2pdID0gc3VtO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBfcmVnaXN0ZXIuc2V0KHJlc3VsdCk7XG59O1xuTWF0cml4LnByb3RvdHlwZS50cmFuc3Bvc2UgPSBmdW5jdGlvbiB0cmFuc3Bvc2UoKSB7XG4gICAgdmFyIHJlc3VsdCA9IFtdO1xuICAgIHZhciBNID0gdGhpcy5nZXQoKTtcbiAgICBmb3IgKHZhciByb3cgPSAwOyByb3cgPCAzOyByb3crKykge1xuICAgICAgICBmb3IgKHZhciBjb2wgPSAwOyBjb2wgPCAzOyBjb2wrKykge1xuICAgICAgICAgICAgcmVzdWx0W3Jvd11bY29sXSA9IE1bY29sXVtyb3ddO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBfcmVnaXN0ZXIuc2V0KHJlc3VsdCk7XG59O1xuTWF0cml4LnByb3RvdHlwZS5jbG9uZSA9IGZ1bmN0aW9uIGNsb25lKCkge1xuICAgIHZhciB2YWx1ZXMgPSB0aGlzLmdldCgpO1xuICAgIHZhciBNID0gW107XG4gICAgZm9yICh2YXIgcm93ID0gMDsgcm93IDwgMzsgcm93KyspXG4gICAgICAgIE1bcm93XSA9IHZhbHVlc1tyb3ddLnNsaWNlKCk7XG4gICAgcmV0dXJuIG5ldyBNYXRyaXgoTSk7XG59O1xubW9kdWxlLmV4cG9ydHMgPSBNYXRyaXg7IiwidmFyIE1hdHJpeCA9IHJlcXVpcmUoJy4vTWF0cml4Jyk7XG5mdW5jdGlvbiBRdWF0ZXJuaW9uKHcsIHgsIHksIHopIHtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSlcbiAgICAgICAgdGhpcy5zZXQodyk7XG4gICAgZWxzZSB7XG4gICAgICAgIHRoaXMudyA9IHcgIT09IHVuZGVmaW5lZCA/IHcgOiAxO1xuICAgICAgICB0aGlzLnggPSB4ICE9PSB1bmRlZmluZWQgPyB4IDogMDtcbiAgICAgICAgdGhpcy55ID0geSAhPT0gdW5kZWZpbmVkID8geSA6IDA7XG4gICAgICAgIHRoaXMueiA9IHogIT09IHVuZGVmaW5lZCA/IHogOiAwO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbn1cbnZhciByZWdpc3RlciA9IG5ldyBRdWF0ZXJuaW9uKDEsIDAsIDAsIDApO1xuUXVhdGVybmlvbi5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24gYWRkKHEpIHtcbiAgICByZXR1cm4gcmVnaXN0ZXIuc2V0V1hZWih0aGlzLncgKyBxLncsIHRoaXMueCArIHEueCwgdGhpcy55ICsgcS55LCB0aGlzLnogKyBxLnopO1xufTtcblF1YXRlcm5pb24ucHJvdG90eXBlLnN1YiA9IGZ1bmN0aW9uIHN1YihxKSB7XG4gICAgcmV0dXJuIHJlZ2lzdGVyLnNldFdYWVoodGhpcy53IC0gcS53LCB0aGlzLnggLSBxLngsIHRoaXMueSAtIHEueSwgdGhpcy56IC0gcS56KTtcbn07XG5RdWF0ZXJuaW9uLnByb3RvdHlwZS5zY2FsYXJEaXZpZGUgPSBmdW5jdGlvbiBzY2FsYXJEaXZpZGUocykge1xuICAgIHJldHVybiB0aGlzLnNjYWxhck11bHRpcGx5KDEgLyBzKTtcbn07XG5RdWF0ZXJuaW9uLnByb3RvdHlwZS5zY2FsYXJNdWx0aXBseSA9IGZ1bmN0aW9uIHNjYWxhck11bHRpcGx5KHMpIHtcbiAgICByZXR1cm4gcmVnaXN0ZXIuc2V0V1hZWih0aGlzLncgKiBzLCB0aGlzLnggKiBzLCB0aGlzLnkgKiBzLCB0aGlzLnogKiBzKTtcbn07XG5RdWF0ZXJuaW9uLnByb3RvdHlwZS5tdWx0aXBseSA9IGZ1bmN0aW9uIG11bHRpcGx5KHEpIHtcbiAgICB2YXIgeDEgPSB0aGlzLng7XG4gICAgdmFyIHkxID0gdGhpcy55O1xuICAgIHZhciB6MSA9IHRoaXMuejtcbiAgICB2YXIgdzEgPSB0aGlzLnc7XG4gICAgdmFyIHgyID0gcS54O1xuICAgIHZhciB5MiA9IHEueTtcbiAgICB2YXIgejIgPSBxLno7XG4gICAgdmFyIHcyID0gcS53IHx8IDA7XG4gICAgcmV0dXJuIHJlZ2lzdGVyLnNldFdYWVoodzEgKiB3MiAtIHgxICogeDIgLSB5MSAqIHkyIC0gejEgKiB6MiwgeDEgKiB3MiArIHgyICogdzEgKyB5MiAqIHoxIC0geTEgKiB6MiwgeTEgKiB3MiArIHkyICogdzEgKyB4MSAqIHoyIC0geDIgKiB6MSwgejEgKiB3MiArIHoyICogdzEgKyB4MiAqIHkxIC0geDEgKiB5Mik7XG59O1xudmFyIGNvbmogPSBuZXcgUXVhdGVybmlvbigxLCAwLCAwLCAwKTtcblF1YXRlcm5pb24ucHJvdG90eXBlLnJvdGF0ZVZlY3RvciA9IGZ1bmN0aW9uIHJvdGF0ZVZlY3Rvcih2KSB7XG4gICAgY29uai5zZXQodGhpcy5jb25qKCkpO1xuICAgIHJldHVybiByZWdpc3Rlci5zZXQodGhpcy5tdWx0aXBseSh2KS5tdWx0aXBseShjb25qKSk7XG59O1xuUXVhdGVybmlvbi5wcm90b3R5cGUuaW52ZXJzZSA9IGZ1bmN0aW9uIGludmVyc2UoKSB7XG4gICAgcmV0dXJuIHJlZ2lzdGVyLnNldCh0aGlzLmNvbmooKS5zY2FsYXJEaXZpZGUodGhpcy5ub3JtU3F1YXJlZCgpKSk7XG59O1xuUXVhdGVybmlvbi5wcm90b3R5cGUubmVnYXRlID0gZnVuY3Rpb24gbmVnYXRlKCkge1xuICAgIHJldHVybiB0aGlzLnNjYWxhck11bHRpcGx5KC0xKTtcbn07XG5RdWF0ZXJuaW9uLnByb3RvdHlwZS5jb25qID0gZnVuY3Rpb24gY29uaigpIHtcbiAgICByZXR1cm4gcmVnaXN0ZXIuc2V0V1hZWih0aGlzLncsIC10aGlzLngsIC10aGlzLnksIC10aGlzLnopO1xufTtcblF1YXRlcm5pb24ucHJvdG90eXBlLm5vcm1hbGl6ZSA9IGZ1bmN0aW9uIG5vcm1hbGl6ZShsZW5ndGgpIHtcbiAgICBsZW5ndGggPSBsZW5ndGggPT09IHVuZGVmaW5lZCA/IDEgOiBsZW5ndGg7XG4gICAgcmV0dXJuIHRoaXMuc2NhbGFyRGl2aWRlKGxlbmd0aCAqIHRoaXMubm9ybSgpKTtcbn07XG5RdWF0ZXJuaW9uLnByb3RvdHlwZS5tYWtlRnJvbUFuZ2xlQW5kQXhpcyA9IGZ1bmN0aW9uIG1ha2VGcm9tQW5nbGVBbmRBeGlzKGFuZ2xlLCB2KSB7XG4gICAgdmFyIG4gPSB2Lm5vcm1hbGl6ZSgpO1xuICAgIHZhciBoYSA9IGFuZ2xlICogMC41O1xuICAgIHZhciBzID0gLU1hdGguc2luKGhhKTtcbiAgICB0aGlzLnggPSBzICogbi54O1xuICAgIHRoaXMueSA9IHMgKiBuLnk7XG4gICAgdGhpcy56ID0gcyAqIG4uejtcbiAgICB0aGlzLncgPSBNYXRoLmNvcyhoYSk7XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuUXVhdGVybmlvbi5wcm90b3R5cGUuc2V0V1hZWiA9IGZ1bmN0aW9uIHNldFdYWVoodywgeCwgeSwgeikge1xuICAgIHJlZ2lzdGVyLmNsZWFyKCk7XG4gICAgdGhpcy53ID0gdztcbiAgICB0aGlzLnggPSB4O1xuICAgIHRoaXMueSA9IHk7XG4gICAgdGhpcy56ID0gejtcbiAgICByZXR1cm4gdGhpcztcbn07XG5RdWF0ZXJuaW9uLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbiBzZXQodikge1xuICAgIGlmICh2IGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgICAgdGhpcy53ID0gMDtcbiAgICAgICAgdGhpcy54ID0gdlswXTtcbiAgICAgICAgdGhpcy55ID0gdlsxXTtcbiAgICAgICAgdGhpcy56ID0gdlsyXTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLncgPSB2Lnc7XG4gICAgICAgIHRoaXMueCA9IHYueDtcbiAgICAgICAgdGhpcy55ID0gdi55O1xuICAgICAgICB0aGlzLnogPSB2Lno7XG4gICAgfVxuICAgIGlmICh0aGlzICE9PSByZWdpc3RlcilcbiAgICAgICAgcmVnaXN0ZXIuY2xlYXIoKTtcbiAgICByZXR1cm4gdGhpcztcbn07XG5RdWF0ZXJuaW9uLnByb3RvdHlwZS5wdXQgPSBmdW5jdGlvbiBwdXQocSkge1xuICAgIHEuc2V0KHJlZ2lzdGVyKTtcbn07XG5RdWF0ZXJuaW9uLnByb3RvdHlwZS5jbG9uZSA9IGZ1bmN0aW9uIGNsb25lKCkge1xuICAgIHJldHVybiBuZXcgUXVhdGVybmlvbih0aGlzKTtcbn07XG5RdWF0ZXJuaW9uLnByb3RvdHlwZS5jbGVhciA9IGZ1bmN0aW9uIGNsZWFyKCkge1xuICAgIHRoaXMudyA9IDE7XG4gICAgdGhpcy54ID0gMDtcbiAgICB0aGlzLnkgPSAwO1xuICAgIHRoaXMueiA9IDA7XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuUXVhdGVybmlvbi5wcm90b3R5cGUuaXNFcXVhbCA9IGZ1bmN0aW9uIGlzRXF1YWwocSkge1xuICAgIHJldHVybiBxLncgPT09IHRoaXMudyAmJiBxLnggPT09IHRoaXMueCAmJiBxLnkgPT09IHRoaXMueSAmJiBxLnogPT09IHRoaXMuejtcbn07XG5RdWF0ZXJuaW9uLnByb3RvdHlwZS5kb3QgPSBmdW5jdGlvbiBkb3QocSkge1xuICAgIHJldHVybiB0aGlzLncgKiBxLncgKyB0aGlzLnggKiBxLnggKyB0aGlzLnkgKiBxLnkgKyB0aGlzLnogKiBxLno7XG59O1xuUXVhdGVybmlvbi5wcm90b3R5cGUubm9ybVNxdWFyZWQgPSBmdW5jdGlvbiBub3JtU3F1YXJlZCgpIHtcbiAgICByZXR1cm4gdGhpcy5kb3QodGhpcyk7XG59O1xuUXVhdGVybmlvbi5wcm90b3R5cGUubm9ybSA9IGZ1bmN0aW9uIG5vcm0oKSB7XG4gICAgcmV0dXJuIE1hdGguc3FydCh0aGlzLm5vcm1TcXVhcmVkKCkpO1xufTtcblF1YXRlcm5pb24ucHJvdG90eXBlLmlzWmVybyA9IGZ1bmN0aW9uIGlzWmVybygpIHtcbiAgICByZXR1cm4gISh0aGlzLnggfHwgdGhpcy55IHx8IHRoaXMueik7XG59O1xuUXVhdGVybmlvbi5wcm90b3R5cGUuZ2V0VHJhbnNmb3JtID0gZnVuY3Rpb24gZ2V0VHJhbnNmb3JtKCkge1xuICAgIHZhciB0ZW1wID0gdGhpcy5ub3JtYWxpemUoMSk7XG4gICAgdmFyIHggPSB0ZW1wLng7XG4gICAgdmFyIHkgPSB0ZW1wLnk7XG4gICAgdmFyIHogPSB0ZW1wLno7XG4gICAgdmFyIHcgPSB0ZW1wLnc7XG4gICAgcmV0dXJuIFtcbiAgICAgICAgMSAtIDIgKiB5ICogeSAtIDIgKiB6ICogeixcbiAgICAgICAgMiAqIHggKiB5IC0gMiAqIHogKiB3LFxuICAgICAgICAyICogeCAqIHogKyAyICogeSAqIHcsXG4gICAgICAgIDAsXG4gICAgICAgIDIgKiB4ICogeSArIDIgKiB6ICogdyxcbiAgICAgICAgMSAtIDIgKiB4ICogeCAtIDIgKiB6ICogeixcbiAgICAgICAgMiAqIHkgKiB6IC0gMiAqIHggKiB3LFxuICAgICAgICAwLFxuICAgICAgICAyICogeCAqIHogLSAyICogeSAqIHcsXG4gICAgICAgIDIgKiB5ICogeiArIDIgKiB4ICogdyxcbiAgICAgICAgMSAtIDIgKiB4ICogeCAtIDIgKiB5ICogeSxcbiAgICAgICAgMCxcbiAgICAgICAgMCxcbiAgICAgICAgMCxcbiAgICAgICAgMCxcbiAgICAgICAgMVxuICAgIF07XG59O1xudmFyIG1hdHJpeFJlZ2lzdGVyID0gbmV3IE1hdHJpeCgpO1xuUXVhdGVybmlvbi5wcm90b3R5cGUuZ2V0TWF0cml4ID0gZnVuY3Rpb24gZ2V0TWF0cml4KCkge1xuICAgIHZhciB0ZW1wID0gdGhpcy5ub3JtYWxpemUoMSk7XG4gICAgdmFyIHggPSB0ZW1wLng7XG4gICAgdmFyIHkgPSB0ZW1wLnk7XG4gICAgdmFyIHogPSB0ZW1wLno7XG4gICAgdmFyIHcgPSB0ZW1wLnc7XG4gICAgcmV0dXJuIG1hdHJpeFJlZ2lzdGVyLnNldChbXG4gICAgICAgIFtcbiAgICAgICAgICAgIDEgLSAyICogeSAqIHkgLSAyICogeiAqIHosXG4gICAgICAgICAgICAyICogeCAqIHkgKyAyICogeiAqIHcsXG4gICAgICAgICAgICAyICogeCAqIHogLSAyICogeSAqIHdcbiAgICAgICAgXSxcbiAgICAgICAgW1xuICAgICAgICAgICAgMiAqIHggKiB5IC0gMiAqIHogKiB3LFxuICAgICAgICAgICAgMSAtIDIgKiB4ICogeCAtIDIgKiB6ICogeixcbiAgICAgICAgICAgIDIgKiB5ICogeiArIDIgKiB4ICogd1xuICAgICAgICBdLFxuICAgICAgICBbXG4gICAgICAgICAgICAyICogeCAqIHogKyAyICogeSAqIHcsXG4gICAgICAgICAgICAyICogeSAqIHogLSAyICogeCAqIHcsXG4gICAgICAgICAgICAxIC0gMiAqIHggKiB4IC0gMiAqIHkgKiB5XG4gICAgICAgIF1cbiAgICBdKTtcbn07XG52YXIgZXBzaWxvbiA9IDAuMDAwMDE7XG5RdWF0ZXJuaW9uLnByb3RvdHlwZS5zbGVycCA9IGZ1bmN0aW9uIHNsZXJwKHEsIHQpIHtcbiAgICB2YXIgb21lZ2E7XG4gICAgdmFyIGNvc29tZWdhO1xuICAgIHZhciBzaW5vbWVnYTtcbiAgICB2YXIgc2NhbGVGcm9tO1xuICAgIHZhciBzY2FsZVRvO1xuICAgIGNvc29tZWdhID0gdGhpcy5kb3QocSk7XG4gICAgaWYgKDEgLSBjb3NvbWVnYSA+IGVwc2lsb24pIHtcbiAgICAgICAgb21lZ2EgPSBNYXRoLmFjb3MoY29zb21lZ2EpO1xuICAgICAgICBzaW5vbWVnYSA9IE1hdGguc2luKG9tZWdhKTtcbiAgICAgICAgc2NhbGVGcm9tID0gTWF0aC5zaW4oKDEgLSB0KSAqIG9tZWdhKSAvIHNpbm9tZWdhO1xuICAgICAgICBzY2FsZVRvID0gTWF0aC5zaW4odCAqIG9tZWdhKSAvIHNpbm9tZWdhO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHNjYWxlRnJvbSA9IDEgLSB0O1xuICAgICAgICBzY2FsZVRvID0gdDtcbiAgICB9XG4gICAgcmV0dXJuIHJlZ2lzdGVyLnNldCh0aGlzLnNjYWxhck11bHRpcGx5KHNjYWxlRnJvbSAvIHNjYWxlVG8pLmFkZChxKS5tdWx0aXBseShzY2FsZVRvKSk7XG59O1xubW9kdWxlLmV4cG9ydHMgPSBRdWF0ZXJuaW9uOyIsImZ1bmN0aW9uIFZlY3Rvcih4LCB5LCB6KSB7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDEgJiYgeCAhPT0gdW5kZWZpbmVkKVxuICAgICAgICB0aGlzLnNldCh4KTtcbiAgICBlbHNlIHtcbiAgICAgICAgdGhpcy54ID0geCB8fCAwO1xuICAgICAgICB0aGlzLnkgPSB5IHx8IDA7XG4gICAgICAgIHRoaXMueiA9IHogfHwgMDtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG59XG52YXIgX3JlZ2lzdGVyID0gbmV3IFZlY3RvcigwLCAwLCAwKTtcblZlY3Rvci5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24gYWRkKHYpIHtcbiAgICByZXR1cm4gX3NldFhZWi5jYWxsKF9yZWdpc3RlciwgdGhpcy54ICsgdi54LCB0aGlzLnkgKyB2LnksIHRoaXMueiArIHYueik7XG59O1xuVmVjdG9yLnByb3RvdHlwZS5zdWIgPSBmdW5jdGlvbiBzdWIodikge1xuICAgIHJldHVybiBfc2V0WFlaLmNhbGwoX3JlZ2lzdGVyLCB0aGlzLnggLSB2LngsIHRoaXMueSAtIHYueSwgdGhpcy56IC0gdi56KTtcbn07XG5WZWN0b3IucHJvdG90eXBlLm11bHQgPSBmdW5jdGlvbiBtdWx0KHIpIHtcbiAgICByZXR1cm4gX3NldFhZWi5jYWxsKF9yZWdpc3RlciwgciAqIHRoaXMueCwgciAqIHRoaXMueSwgciAqIHRoaXMueik7XG59O1xuVmVjdG9yLnByb3RvdHlwZS5kaXYgPSBmdW5jdGlvbiBkaXYocikge1xuICAgIHJldHVybiB0aGlzLm11bHQoMSAvIHIpO1xufTtcblZlY3Rvci5wcm90b3R5cGUuY3Jvc3MgPSBmdW5jdGlvbiBjcm9zcyh2KSB7XG4gICAgdmFyIHggPSB0aGlzLng7XG4gICAgdmFyIHkgPSB0aGlzLnk7XG4gICAgdmFyIHogPSB0aGlzLno7XG4gICAgdmFyIHZ4ID0gdi54O1xuICAgIHZhciB2eSA9IHYueTtcbiAgICB2YXIgdnogPSB2Lno7XG4gICAgcmV0dXJuIF9zZXRYWVouY2FsbChfcmVnaXN0ZXIsIHogKiB2eSAtIHkgKiB2eiwgeCAqIHZ6IC0geiAqIHZ4LCB5ICogdnggLSB4ICogdnkpO1xufTtcblZlY3Rvci5wcm90b3R5cGUuZXF1YWxzID0gZnVuY3Rpb24gZXF1YWxzKHYpIHtcbiAgICByZXR1cm4gdi54ID09PSB0aGlzLnggJiYgdi55ID09PSB0aGlzLnkgJiYgdi56ID09PSB0aGlzLno7XG59O1xuVmVjdG9yLnByb3RvdHlwZS5yb3RhdGVYID0gZnVuY3Rpb24gcm90YXRlWCh0aGV0YSkge1xuICAgIHZhciB4ID0gdGhpcy54O1xuICAgIHZhciB5ID0gdGhpcy55O1xuICAgIHZhciB6ID0gdGhpcy56O1xuICAgIHZhciBjb3NUaGV0YSA9IE1hdGguY29zKHRoZXRhKTtcbiAgICB2YXIgc2luVGhldGEgPSBNYXRoLnNpbih0aGV0YSk7XG4gICAgcmV0dXJuIF9zZXRYWVouY2FsbChfcmVnaXN0ZXIsIHgsIHkgKiBjb3NUaGV0YSAtIHogKiBzaW5UaGV0YSwgeSAqIHNpblRoZXRhICsgeiAqIGNvc1RoZXRhKTtcbn07XG5WZWN0b3IucHJvdG90eXBlLnJvdGF0ZVkgPSBmdW5jdGlvbiByb3RhdGVZKHRoZXRhKSB7XG4gICAgdmFyIHggPSB0aGlzLng7XG4gICAgdmFyIHkgPSB0aGlzLnk7XG4gICAgdmFyIHogPSB0aGlzLno7XG4gICAgdmFyIGNvc1RoZXRhID0gTWF0aC5jb3ModGhldGEpO1xuICAgIHZhciBzaW5UaGV0YSA9IE1hdGguc2luKHRoZXRhKTtcbiAgICByZXR1cm4gX3NldFhZWi5jYWxsKF9yZWdpc3RlciwgeiAqIHNpblRoZXRhICsgeCAqIGNvc1RoZXRhLCB5LCB6ICogY29zVGhldGEgLSB4ICogc2luVGhldGEpO1xufTtcblZlY3Rvci5wcm90b3R5cGUucm90YXRlWiA9IGZ1bmN0aW9uIHJvdGF0ZVoodGhldGEpIHtcbiAgICB2YXIgeCA9IHRoaXMueDtcbiAgICB2YXIgeSA9IHRoaXMueTtcbiAgICB2YXIgeiA9IHRoaXMuejtcbiAgICB2YXIgY29zVGhldGEgPSBNYXRoLmNvcyh0aGV0YSk7XG4gICAgdmFyIHNpblRoZXRhID0gTWF0aC5zaW4odGhldGEpO1xuICAgIHJldHVybiBfc2V0WFlaLmNhbGwoX3JlZ2lzdGVyLCB4ICogY29zVGhldGEgLSB5ICogc2luVGhldGEsIHggKiBzaW5UaGV0YSArIHkgKiBjb3NUaGV0YSwgeik7XG59O1xuVmVjdG9yLnByb3RvdHlwZS5kb3QgPSBmdW5jdGlvbiBkb3Qodikge1xuICAgIHJldHVybiB0aGlzLnggKiB2LnggKyB0aGlzLnkgKiB2LnkgKyB0aGlzLnogKiB2Lno7XG59O1xuVmVjdG9yLnByb3RvdHlwZS5ub3JtU3F1YXJlZCA9IGZ1bmN0aW9uIG5vcm1TcXVhcmVkKCkge1xuICAgIHJldHVybiB0aGlzLmRvdCh0aGlzKTtcbn07XG5WZWN0b3IucHJvdG90eXBlLm5vcm0gPSBmdW5jdGlvbiBub3JtKCkge1xuICAgIHJldHVybiBNYXRoLnNxcnQodGhpcy5ub3JtU3F1YXJlZCgpKTtcbn07XG5WZWN0b3IucHJvdG90eXBlLm5vcm1hbGl6ZSA9IGZ1bmN0aW9uIG5vcm1hbGl6ZShsZW5ndGgpIHtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMClcbiAgICAgICAgbGVuZ3RoID0gMTtcbiAgICB2YXIgbm9ybSA9IHRoaXMubm9ybSgpO1xuICAgIGlmIChub3JtID4gMWUtNylcbiAgICAgICAgcmV0dXJuIF9zZXRGcm9tVmVjdG9yLmNhbGwoX3JlZ2lzdGVyLCB0aGlzLm11bHQobGVuZ3RoIC8gbm9ybSkpO1xuICAgIGVsc2VcbiAgICAgICAgcmV0dXJuIF9zZXRYWVouY2FsbChfcmVnaXN0ZXIsIGxlbmd0aCwgMCwgMCk7XG59O1xuVmVjdG9yLnByb3RvdHlwZS5jbG9uZSA9IGZ1bmN0aW9uIGNsb25lKCkge1xuICAgIHJldHVybiBuZXcgVmVjdG9yKHRoaXMpO1xufTtcblZlY3Rvci5wcm90b3R5cGUuaXNaZXJvID0gZnVuY3Rpb24gaXNaZXJvKCkge1xuICAgIHJldHVybiAhKHRoaXMueCB8fCB0aGlzLnkgfHwgdGhpcy56KTtcbn07XG5mdW5jdGlvbiBfc2V0WFlaKHgsIHksIHopIHtcbiAgICB0aGlzLnggPSB4O1xuICAgIHRoaXMueSA9IHk7XG4gICAgdGhpcy56ID0gejtcbiAgICByZXR1cm4gdGhpcztcbn1cbmZ1bmN0aW9uIF9zZXRGcm9tQXJyYXkodikge1xuICAgIHJldHVybiBfc2V0WFlaLmNhbGwodGhpcywgdlswXSwgdlsxXSwgdlsyXSB8fCAwKTtcbn1cbmZ1bmN0aW9uIF9zZXRGcm9tVmVjdG9yKHYpIHtcbiAgICByZXR1cm4gX3NldFhZWi5jYWxsKHRoaXMsIHYueCwgdi55LCB2LnopO1xufVxuZnVuY3Rpb24gX3NldEZyb21OdW1iZXIoeCkge1xuICAgIHJldHVybiBfc2V0WFlaLmNhbGwodGhpcywgeCwgMCwgMCk7XG59XG5WZWN0b3IucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uIHNldCh2KSB7XG4gICAgaWYgKHYgaW5zdGFuY2VvZiBBcnJheSlcbiAgICAgICAgcmV0dXJuIF9zZXRGcm9tQXJyYXkuY2FsbCh0aGlzLCB2KTtcbiAgICBpZiAodHlwZW9mIHYgPT09ICdudW1iZXInKVxuICAgICAgICByZXR1cm4gX3NldEZyb21OdW1iZXIuY2FsbCh0aGlzLCB2KTtcbiAgICByZXR1cm4gX3NldEZyb21WZWN0b3IuY2FsbCh0aGlzLCB2KTtcbn07XG5WZWN0b3IucHJvdG90eXBlLnNldFhZWiA9IGZ1bmN0aW9uICh4LCB5LCB6KSB7XG4gICAgcmV0dXJuIF9zZXRYWVouYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn07XG5WZWN0b3IucHJvdG90eXBlLnNldDFEID0gZnVuY3Rpb24gKHgpIHtcbiAgICByZXR1cm4gX3NldEZyb21OdW1iZXIuY2FsbCh0aGlzLCB4KTtcbn07XG5WZWN0b3IucHJvdG90eXBlLnB1dCA9IGZ1bmN0aW9uIHB1dCh2KSB7XG4gICAgaWYgKHRoaXMgPT09IF9yZWdpc3RlcilcbiAgICAgICAgX3NldEZyb21WZWN0b3IuY2FsbCh2LCBfcmVnaXN0ZXIpO1xuICAgIGVsc2VcbiAgICAgICAgX3NldEZyb21WZWN0b3IuY2FsbCh2LCB0aGlzKTtcbn07XG5WZWN0b3IucHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24gY2xlYXIoKSB7XG4gICAgcmV0dXJuIF9zZXRYWVouY2FsbCh0aGlzLCAwLCAwLCAwKTtcbn07XG5WZWN0b3IucHJvdG90eXBlLmNhcCA9IGZ1bmN0aW9uIGNhcChjYXApIHtcbiAgICBpZiAoY2FwID09PSBJbmZpbml0eSlcbiAgICAgICAgcmV0dXJuIF9zZXRGcm9tVmVjdG9yLmNhbGwoX3JlZ2lzdGVyLCB0aGlzKTtcbiAgICB2YXIgbm9ybSA9IHRoaXMubm9ybSgpO1xuICAgIGlmIChub3JtID4gY2FwKVxuICAgICAgICByZXR1cm4gX3NldEZyb21WZWN0b3IuY2FsbChfcmVnaXN0ZXIsIHRoaXMubXVsdChjYXAgLyBub3JtKSk7XG4gICAgZWxzZVxuICAgICAgICByZXR1cm4gX3NldEZyb21WZWN0b3IuY2FsbChfcmVnaXN0ZXIsIHRoaXMpO1xufTtcblZlY3Rvci5wcm90b3R5cGUucHJvamVjdCA9IGZ1bmN0aW9uIHByb2plY3Qobikge1xuICAgIHJldHVybiBuLm11bHQodGhpcy5kb3QobikpO1xufTtcblZlY3Rvci5wcm90b3R5cGUucmVmbGVjdEFjcm9zcyA9IGZ1bmN0aW9uIHJlZmxlY3RBY3Jvc3Mobikge1xuICAgIG4ubm9ybWFsaXplKCkucHV0KG4pO1xuICAgIHJldHVybiBfc2V0RnJvbVZlY3RvcihfcmVnaXN0ZXIsIHRoaXMuc3ViKHRoaXMucHJvamVjdChuKS5tdWx0KDIpKSk7XG59O1xuVmVjdG9yLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbiBnZXQoKSB7XG4gICAgcmV0dXJuIFtcbiAgICAgICAgdGhpcy54LFxuICAgICAgICB0aGlzLnksXG4gICAgICAgIHRoaXMuelxuICAgIF07XG59O1xuVmVjdG9yLnByb3RvdHlwZS5nZXQxRCA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy54O1xufTtcbm1vZHVsZS5leHBvcnRzID0gVmVjdG9yOyIsInZhciBNb2RpZmllciA9IHJlcXVpcmUoJy4uL2NvcmUvTW9kaWZpZXInKTtcbnZhciBUcmFuc2Zvcm0gPSByZXF1aXJlKCcuLi9jb3JlL1RyYW5zZm9ybScpO1xudmFyIFRyYW5zaXRpb25hYmxlID0gcmVxdWlyZSgnLi4vdHJhbnNpdGlvbnMvVHJhbnNpdGlvbmFibGUnKTtcbnZhciBUcmFuc2l0aW9uYWJsZVRyYW5zZm9ybSA9IHJlcXVpcmUoJy4uL3RyYW5zaXRpb25zL1RyYW5zaXRpb25hYmxlVHJhbnNmb3JtJyk7XG5mdW5jdGlvbiBTdGF0ZU1vZGlmaWVyKG9wdGlvbnMpIHtcbiAgICB0aGlzLl90cmFuc2Zvcm1TdGF0ZSA9IG5ldyBUcmFuc2l0aW9uYWJsZVRyYW5zZm9ybShUcmFuc2Zvcm0uaWRlbnRpdHkpO1xuICAgIHRoaXMuX29wYWNpdHlTdGF0ZSA9IG5ldyBUcmFuc2l0aW9uYWJsZSgxKTtcbiAgICB0aGlzLl9vcmlnaW5TdGF0ZSA9IG5ldyBUcmFuc2l0aW9uYWJsZShbXG4gICAgICAgIDAsXG4gICAgICAgIDBcbiAgICBdKTtcbiAgICB0aGlzLl9hbGlnblN0YXRlID0gbmV3IFRyYW5zaXRpb25hYmxlKFtcbiAgICAgICAgMCxcbiAgICAgICAgMFxuICAgIF0pO1xuICAgIHRoaXMuX3NpemVTdGF0ZSA9IG5ldyBUcmFuc2l0aW9uYWJsZShbXG4gICAgICAgIDAsXG4gICAgICAgIDBcbiAgICBdKTtcbiAgICB0aGlzLl9wcm9wb3J0aW9uc1N0YXRlID0gbmV3IFRyYW5zaXRpb25hYmxlKFtcbiAgICAgICAgMCxcbiAgICAgICAgMFxuICAgIF0pO1xuICAgIHRoaXMuX21vZGlmaWVyID0gbmV3IE1vZGlmaWVyKHtcbiAgICAgICAgdHJhbnNmb3JtOiB0aGlzLl90cmFuc2Zvcm1TdGF0ZSxcbiAgICAgICAgb3BhY2l0eTogdGhpcy5fb3BhY2l0eVN0YXRlLFxuICAgICAgICBvcmlnaW46IG51bGwsXG4gICAgICAgIGFsaWduOiBudWxsLFxuICAgICAgICBzaXplOiBudWxsLFxuICAgICAgICBwcm9wb3J0aW9uczogbnVsbFxuICAgIH0pO1xuICAgIHRoaXMuX2hhc09yaWdpbiA9IGZhbHNlO1xuICAgIHRoaXMuX2hhc0FsaWduID0gZmFsc2U7XG4gICAgdGhpcy5faGFzU2l6ZSA9IGZhbHNlO1xuICAgIHRoaXMuX2hhc1Byb3BvcnRpb25zID0gZmFsc2U7XG4gICAgaWYgKG9wdGlvbnMpIHtcbiAgICAgICAgaWYgKG9wdGlvbnMudHJhbnNmb3JtKVxuICAgICAgICAgICAgdGhpcy5zZXRUcmFuc2Zvcm0ob3B0aW9ucy50cmFuc2Zvcm0pO1xuICAgICAgICBpZiAob3B0aW9ucy5vcGFjaXR5ICE9PSB1bmRlZmluZWQpXG4gICAgICAgICAgICB0aGlzLnNldE9wYWNpdHkob3B0aW9ucy5vcGFjaXR5KTtcbiAgICAgICAgaWYgKG9wdGlvbnMub3JpZ2luKVxuICAgICAgICAgICAgdGhpcy5zZXRPcmlnaW4ob3B0aW9ucy5vcmlnaW4pO1xuICAgICAgICBpZiAob3B0aW9ucy5hbGlnbilcbiAgICAgICAgICAgIHRoaXMuc2V0QWxpZ24ob3B0aW9ucy5hbGlnbik7XG4gICAgICAgIGlmIChvcHRpb25zLnNpemUpXG4gICAgICAgICAgICB0aGlzLnNldFNpemUob3B0aW9ucy5zaXplKTtcbiAgICAgICAgaWYgKG9wdGlvbnMucHJvcG9ydGlvbnMpXG4gICAgICAgICAgICB0aGlzLnNldFByb3BvcnRpb25zKG9wdGlvbnMucHJvcG9ydGlvbnMpO1xuICAgIH1cbn1cblN0YXRlTW9kaWZpZXIucHJvdG90eXBlLnNldFRyYW5zZm9ybSA9IGZ1bmN0aW9uIHNldFRyYW5zZm9ybSh0cmFuc2Zvcm0sIHRyYW5zaXRpb24sIGNhbGxiYWNrKSB7XG4gICAgdGhpcy5fdHJhbnNmb3JtU3RhdGUuc2V0KHRyYW5zZm9ybSwgdHJhbnNpdGlvbiwgY2FsbGJhY2spO1xuICAgIHJldHVybiB0aGlzO1xufTtcblN0YXRlTW9kaWZpZXIucHJvdG90eXBlLnNldE9wYWNpdHkgPSBmdW5jdGlvbiBzZXRPcGFjaXR5KG9wYWNpdHksIHRyYW5zaXRpb24sIGNhbGxiYWNrKSB7XG4gICAgdGhpcy5fb3BhY2l0eVN0YXRlLnNldChvcGFjaXR5LCB0cmFuc2l0aW9uLCBjYWxsYmFjayk7XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuU3RhdGVNb2RpZmllci5wcm90b3R5cGUuc2V0T3JpZ2luID0gZnVuY3Rpb24gc2V0T3JpZ2luKG9yaWdpbiwgdHJhbnNpdGlvbiwgY2FsbGJhY2spIHtcbiAgICBpZiAob3JpZ2luID09PSBudWxsKSB7XG4gICAgICAgIGlmICh0aGlzLl9oYXNPcmlnaW4pIHtcbiAgICAgICAgICAgIHRoaXMuX21vZGlmaWVyLm9yaWdpbkZyb20obnVsbCk7XG4gICAgICAgICAgICB0aGlzLl9oYXNPcmlnaW4gPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9IGVsc2UgaWYgKCF0aGlzLl9oYXNPcmlnaW4pIHtcbiAgICAgICAgdGhpcy5faGFzT3JpZ2luID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5fbW9kaWZpZXIub3JpZ2luRnJvbSh0aGlzLl9vcmlnaW5TdGF0ZSk7XG4gICAgfVxuICAgIHRoaXMuX29yaWdpblN0YXRlLnNldChvcmlnaW4sIHRyYW5zaXRpb24sIGNhbGxiYWNrKTtcbiAgICByZXR1cm4gdGhpcztcbn07XG5TdGF0ZU1vZGlmaWVyLnByb3RvdHlwZS5zZXRBbGlnbiA9IGZ1bmN0aW9uIHNldE9yaWdpbihhbGlnbiwgdHJhbnNpdGlvbiwgY2FsbGJhY2spIHtcbiAgICBpZiAoYWxpZ24gPT09IG51bGwpIHtcbiAgICAgICAgaWYgKHRoaXMuX2hhc0FsaWduKSB7XG4gICAgICAgICAgICB0aGlzLl9tb2RpZmllci5hbGlnbkZyb20obnVsbCk7XG4gICAgICAgICAgICB0aGlzLl9oYXNBbGlnbiA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0gZWxzZSBpZiAoIXRoaXMuX2hhc0FsaWduKSB7XG4gICAgICAgIHRoaXMuX2hhc0FsaWduID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5fbW9kaWZpZXIuYWxpZ25Gcm9tKHRoaXMuX2FsaWduU3RhdGUpO1xuICAgIH1cbiAgICB0aGlzLl9hbGlnblN0YXRlLnNldChhbGlnbiwgdHJhbnNpdGlvbiwgY2FsbGJhY2spO1xuICAgIHJldHVybiB0aGlzO1xufTtcblN0YXRlTW9kaWZpZXIucHJvdG90eXBlLnNldFNpemUgPSBmdW5jdGlvbiBzZXRTaXplKHNpemUsIHRyYW5zaXRpb24sIGNhbGxiYWNrKSB7XG4gICAgaWYgKHNpemUgPT09IG51bGwpIHtcbiAgICAgICAgaWYgKHRoaXMuX2hhc1NpemUpIHtcbiAgICAgICAgICAgIHRoaXMuX21vZGlmaWVyLnNpemVGcm9tKG51bGwpO1xuICAgICAgICAgICAgdGhpcy5faGFzU2l6ZSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0gZWxzZSBpZiAoIXRoaXMuX2hhc1NpemUpIHtcbiAgICAgICAgdGhpcy5faGFzU2l6ZSA9IHRydWU7XG4gICAgICAgIHRoaXMuX21vZGlmaWVyLnNpemVGcm9tKHRoaXMuX3NpemVTdGF0ZSk7XG4gICAgfVxuICAgIHRoaXMuX3NpemVTdGF0ZS5zZXQoc2l6ZSwgdHJhbnNpdGlvbiwgY2FsbGJhY2spO1xuICAgIHJldHVybiB0aGlzO1xufTtcblN0YXRlTW9kaWZpZXIucHJvdG90eXBlLnNldFByb3BvcnRpb25zID0gZnVuY3Rpb24gc2V0U2l6ZShwcm9wb3J0aW9ucywgdHJhbnNpdGlvbiwgY2FsbGJhY2spIHtcbiAgICBpZiAocHJvcG9ydGlvbnMgPT09IG51bGwpIHtcbiAgICAgICAgaWYgKHRoaXMuX2hhc1Byb3BvcnRpb25zKSB7XG4gICAgICAgICAgICB0aGlzLl9tb2RpZmllci5wcm9wb3J0aW9uc0Zyb20obnVsbCk7XG4gICAgICAgICAgICB0aGlzLl9oYXNQcm9wb3J0aW9ucyA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0gZWxzZSBpZiAoIXRoaXMuX2hhc1Byb3BvcnRpb25zKSB7XG4gICAgICAgIHRoaXMuX2hhc1Byb3BvcnRpb25zID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5fbW9kaWZpZXIucHJvcG9ydGlvbnNGcm9tKHRoaXMuX3Byb3BvcnRpb25zU3RhdGUpO1xuICAgIH1cbiAgICB0aGlzLl9wcm9wb3J0aW9uc1N0YXRlLnNldChwcm9wb3J0aW9ucywgdHJhbnNpdGlvbiwgY2FsbGJhY2spO1xuICAgIHJldHVybiB0aGlzO1xufTtcblN0YXRlTW9kaWZpZXIucHJvdG90eXBlLmhhbHQgPSBmdW5jdGlvbiBoYWx0KCkge1xuICAgIHRoaXMuX3RyYW5zZm9ybVN0YXRlLmhhbHQoKTtcbiAgICB0aGlzLl9vcGFjaXR5U3RhdGUuaGFsdCgpO1xuICAgIHRoaXMuX29yaWdpblN0YXRlLmhhbHQoKTtcbiAgICB0aGlzLl9hbGlnblN0YXRlLmhhbHQoKTtcbiAgICB0aGlzLl9zaXplU3RhdGUuaGFsdCgpO1xuICAgIHRoaXMuX3Byb3BvcnRpb25zU3RhdGUuaGFsdCgpO1xufTtcblN0YXRlTW9kaWZpZXIucHJvdG90eXBlLmdldFRyYW5zZm9ybSA9IGZ1bmN0aW9uIGdldFRyYW5zZm9ybSgpIHtcbiAgICByZXR1cm4gdGhpcy5fdHJhbnNmb3JtU3RhdGUuZ2V0KCk7XG59O1xuU3RhdGVNb2RpZmllci5wcm90b3R5cGUuZ2V0RmluYWxUcmFuc2Zvcm0gPSBmdW5jdGlvbiBnZXRGaW5hbFRyYW5zZm9ybSgpIHtcbiAgICByZXR1cm4gdGhpcy5fdHJhbnNmb3JtU3RhdGUuZ2V0RmluYWwoKTtcbn07XG5TdGF0ZU1vZGlmaWVyLnByb3RvdHlwZS5nZXRPcGFjaXR5ID0gZnVuY3Rpb24gZ2V0T3BhY2l0eSgpIHtcbiAgICByZXR1cm4gdGhpcy5fb3BhY2l0eVN0YXRlLmdldCgpO1xufTtcblN0YXRlTW9kaWZpZXIucHJvdG90eXBlLmdldE9yaWdpbiA9IGZ1bmN0aW9uIGdldE9yaWdpbigpIHtcbiAgICByZXR1cm4gdGhpcy5faGFzT3JpZ2luID8gdGhpcy5fb3JpZ2luU3RhdGUuZ2V0KCkgOiBudWxsO1xufTtcblN0YXRlTW9kaWZpZXIucHJvdG90eXBlLmdldEFsaWduID0gZnVuY3Rpb24gZ2V0QWxpZ24oKSB7XG4gICAgcmV0dXJuIHRoaXMuX2hhc0FsaWduID8gdGhpcy5fYWxpZ25TdGF0ZS5nZXQoKSA6IG51bGw7XG59O1xuU3RhdGVNb2RpZmllci5wcm90b3R5cGUuZ2V0U2l6ZSA9IGZ1bmN0aW9uIGdldFNpemUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2hhc1NpemUgPyB0aGlzLl9zaXplU3RhdGUuZ2V0KCkgOiBudWxsO1xufTtcblN0YXRlTW9kaWZpZXIucHJvdG90eXBlLmdldFByb3BvcnRpb25zID0gZnVuY3Rpb24gZ2V0UHJvcG9ydGlvbnMoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2hhc1Byb3BvcnRpb25zID8gdGhpcy5fcHJvcG9ydGlvbnNTdGF0ZS5nZXQoKSA6IG51bGw7XG59O1xuU3RhdGVNb2RpZmllci5wcm90b3R5cGUubW9kaWZ5ID0gZnVuY3Rpb24gbW9kaWZ5KHRhcmdldCkge1xuICAgIHJldHVybiB0aGlzLl9tb2RpZmllci5tb2RpZnkodGFyZ2V0KTtcbn07XG5tb2R1bGUuZXhwb3J0cyA9IFN0YXRlTW9kaWZpZXI7IiwidmFyIEV2ZW50SGFuZGxlciA9IHJlcXVpcmUoJy4uL2NvcmUvRXZlbnRIYW5kbGVyJyk7XG5mdW5jdGlvbiBQaHlzaWNzRW5naW5lKG9wdGlvbnMpIHtcbiAgICB0aGlzLm9wdGlvbnMgPSBPYmplY3QuY3JlYXRlKFBoeXNpY3NFbmdpbmUuREVGQVVMVF9PUFRJT05TKTtcbiAgICBpZiAob3B0aW9ucylcbiAgICAgICAgdGhpcy5zZXRPcHRpb25zKG9wdGlvbnMpO1xuICAgIHRoaXMuX3BhcnRpY2xlcyA9IFtdO1xuICAgIHRoaXMuX2JvZGllcyA9IFtdO1xuICAgIHRoaXMuX2FnZW50RGF0YSA9IHt9O1xuICAgIHRoaXMuX2ZvcmNlcyA9IFtdO1xuICAgIHRoaXMuX2NvbnN0cmFpbnRzID0gW107XG4gICAgdGhpcy5fYnVmZmVyID0gMDtcbiAgICB0aGlzLl9wcmV2VGltZSA9IG5vdygpO1xuICAgIHRoaXMuX2lzU2xlZXBpbmcgPSBmYWxzZTtcbiAgICB0aGlzLl9ldmVudEhhbmRsZXIgPSBudWxsO1xuICAgIHRoaXMuX2N1cnJBZ2VudElkID0gMDtcbiAgICB0aGlzLl9oYXNCb2RpZXMgPSBmYWxzZTtcbiAgICB0aGlzLl9ldmVudEhhbmRsZXIgPSBudWxsO1xufVxudmFyIFRJTUVTVEVQID0gMTc7XG52YXIgTUlOX1RJTUVfU1RFUCA9IDEwMDAgLyAxMjA7XG52YXIgTUFYX1RJTUVfU1RFUCA9IDE3O1xudmFyIG5vdyA9IERhdGUubm93O1xudmFyIF9ldmVudHMgPSB7XG4gICAgICAgIHN0YXJ0OiAnc3RhcnQnLFxuICAgICAgICB1cGRhdGU6ICd1cGRhdGUnLFxuICAgICAgICBlbmQ6ICdlbmQnXG4gICAgfTtcblBoeXNpY3NFbmdpbmUuREVGQVVMVF9PUFRJT05TID0ge1xuICAgIGNvbnN0cmFpbnRTdGVwczogMSxcbiAgICBzbGVlcFRvbGVyYW5jZTogMWUtNyxcbiAgICB2ZWxvY2l0eUNhcDogdW5kZWZpbmVkLFxuICAgIGFuZ3VsYXJWZWxvY2l0eUNhcDogdW5kZWZpbmVkXG59O1xuUGh5c2ljc0VuZ2luZS5wcm90b3R5cGUuc2V0T3B0aW9ucyA9IGZ1bmN0aW9uIHNldE9wdGlvbnMob3B0cykge1xuICAgIGZvciAodmFyIGtleSBpbiBvcHRzKVxuICAgICAgICBpZiAodGhpcy5vcHRpb25zW2tleV0pXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnNba2V5XSA9IG9wdHNba2V5XTtcbn07XG5QaHlzaWNzRW5naW5lLnByb3RvdHlwZS5hZGRCb2R5ID0gZnVuY3Rpb24gYWRkQm9keShib2R5KSB7XG4gICAgYm9keS5fZW5naW5lID0gdGhpcztcbiAgICBpZiAoYm9keS5pc0JvZHkpIHtcbiAgICAgICAgdGhpcy5fYm9kaWVzLnB1c2goYm9keSk7XG4gICAgICAgIHRoaXMuX2hhc0JvZGllcyA9IHRydWU7XG4gICAgfSBlbHNlXG4gICAgICAgIHRoaXMuX3BhcnRpY2xlcy5wdXNoKGJvZHkpO1xuICAgIGJvZHkub24oJ3N0YXJ0JywgdGhpcy53YWtlLmJpbmQodGhpcykpO1xuICAgIHJldHVybiBib2R5O1xufTtcblBoeXNpY3NFbmdpbmUucHJvdG90eXBlLnJlbW92ZUJvZHkgPSBmdW5jdGlvbiByZW1vdmVCb2R5KGJvZHkpIHtcbiAgICB2YXIgYXJyYXkgPSBib2R5LmlzQm9keSA/IHRoaXMuX2JvZGllcyA6IHRoaXMuX3BhcnRpY2xlcztcbiAgICB2YXIgaW5kZXggPSBhcnJheS5pbmRleE9mKGJvZHkpO1xuICAgIGlmIChpbmRleCA+IC0xKSB7XG4gICAgICAgIGZvciAodmFyIGFnZW50IGluIHRoaXMuX2FnZW50RGF0YSlcbiAgICAgICAgICAgIHRoaXMuZGV0YWNoRnJvbShhZ2VudC5pZCwgYm9keSk7XG4gICAgICAgIGFycmF5LnNwbGljZShpbmRleCwgMSk7XG4gICAgfVxuICAgIGlmICh0aGlzLmdldEJvZGllcygpLmxlbmd0aCA9PT0gMClcbiAgICAgICAgdGhpcy5faGFzQm9kaWVzID0gZmFsc2U7XG59O1xuZnVuY3Rpb24gX21hcEFnZW50QXJyYXkoYWdlbnQpIHtcbiAgICBpZiAoYWdlbnQuYXBwbHlGb3JjZSlcbiAgICAgICAgcmV0dXJuIHRoaXMuX2ZvcmNlcztcbiAgICBpZiAoYWdlbnQuYXBwbHlDb25zdHJhaW50KVxuICAgICAgICByZXR1cm4gdGhpcy5fY29uc3RyYWludHM7XG59XG5mdW5jdGlvbiBfYXR0YWNoT25lKGFnZW50LCB0YXJnZXRzLCBzb3VyY2UpIHtcbiAgICBpZiAodGFyZ2V0cyA9PT0gdW5kZWZpbmVkKVxuICAgICAgICB0YXJnZXRzID0gdGhpcy5nZXRQYXJ0aWNsZXNBbmRCb2RpZXMoKTtcbiAgICBpZiAoISh0YXJnZXRzIGluc3RhbmNlb2YgQXJyYXkpKVxuICAgICAgICB0YXJnZXRzID0gW3RhcmdldHNdO1xuICAgIGFnZW50Lm9uKCdjaGFuZ2UnLCB0aGlzLndha2UuYmluZCh0aGlzKSk7XG4gICAgdGhpcy5fYWdlbnREYXRhW3RoaXMuX2N1cnJBZ2VudElkXSA9IHtcbiAgICAgICAgYWdlbnQ6IGFnZW50LFxuICAgICAgICBpZDogdGhpcy5fY3VyckFnZW50SWQsXG4gICAgICAgIHRhcmdldHM6IHRhcmdldHMsXG4gICAgICAgIHNvdXJjZTogc291cmNlXG4gICAgfTtcbiAgICBfbWFwQWdlbnRBcnJheS5jYWxsKHRoaXMsIGFnZW50KS5wdXNoKHRoaXMuX2N1cnJBZ2VudElkKTtcbiAgICByZXR1cm4gdGhpcy5fY3VyckFnZW50SWQrKztcbn1cblBoeXNpY3NFbmdpbmUucHJvdG90eXBlLmF0dGFjaCA9IGZ1bmN0aW9uIGF0dGFjaChhZ2VudHMsIHRhcmdldHMsIHNvdXJjZSkge1xuICAgIHRoaXMud2FrZSgpO1xuICAgIGlmIChhZ2VudHMgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgICB2YXIgYWdlbnRJRHMgPSBbXTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhZ2VudHMubGVuZ3RoOyBpKyspXG4gICAgICAgICAgICBhZ2VudElEc1tpXSA9IF9hdHRhY2hPbmUuY2FsbCh0aGlzLCBhZ2VudHNbaV0sIHRhcmdldHMsIHNvdXJjZSk7XG4gICAgICAgIHJldHVybiBhZ2VudElEcztcbiAgICB9IGVsc2VcbiAgICAgICAgcmV0dXJuIF9hdHRhY2hPbmUuY2FsbCh0aGlzLCBhZ2VudHMsIHRhcmdldHMsIHNvdXJjZSk7XG59O1xuUGh5c2ljc0VuZ2luZS5wcm90b3R5cGUuYXR0YWNoVG8gPSBmdW5jdGlvbiBhdHRhY2hUbyhhZ2VudElELCB0YXJnZXQpIHtcbiAgICBfZ2V0QWdlbnREYXRhLmNhbGwodGhpcywgYWdlbnRJRCkudGFyZ2V0cy5wdXNoKHRhcmdldCk7XG59O1xuUGh5c2ljc0VuZ2luZS5wcm90b3R5cGUuZGV0YWNoID0gZnVuY3Rpb24gZGV0YWNoKGlkKSB7XG4gICAgdmFyIGFnZW50ID0gdGhpcy5nZXRBZ2VudChpZCk7XG4gICAgdmFyIGFnZW50QXJyYXkgPSBfbWFwQWdlbnRBcnJheS5jYWxsKHRoaXMsIGFnZW50KTtcbiAgICB2YXIgaW5kZXggPSBhZ2VudEFycmF5LmluZGV4T2YoaWQpO1xuICAgIGFnZW50QXJyYXkuc3BsaWNlKGluZGV4LCAxKTtcbiAgICBkZWxldGUgdGhpcy5fYWdlbnREYXRhW2lkXTtcbn07XG5QaHlzaWNzRW5naW5lLnByb3RvdHlwZS5kZXRhY2hGcm9tID0gZnVuY3Rpb24gZGV0YWNoRnJvbShpZCwgdGFyZ2V0KSB7XG4gICAgdmFyIGJvdW5kQWdlbnQgPSBfZ2V0QWdlbnREYXRhLmNhbGwodGhpcywgaWQpO1xuICAgIGlmIChib3VuZEFnZW50LnNvdXJjZSA9PT0gdGFyZ2V0KVxuICAgICAgICB0aGlzLmRldGFjaChpZCk7XG4gICAgZWxzZSB7XG4gICAgICAgIHZhciB0YXJnZXRzID0gYm91bmRBZ2VudC50YXJnZXRzO1xuICAgICAgICB2YXIgaW5kZXggPSB0YXJnZXRzLmluZGV4T2YodGFyZ2V0KTtcbiAgICAgICAgaWYgKGluZGV4ID4gLTEpXG4gICAgICAgICAgICB0YXJnZXRzLnNwbGljZShpbmRleCwgMSk7XG4gICAgfVxufTtcblBoeXNpY3NFbmdpbmUucHJvdG90eXBlLmRldGFjaEFsbCA9IGZ1bmN0aW9uIGRldGFjaEFsbCgpIHtcbiAgICB0aGlzLl9hZ2VudERhdGEgPSB7fTtcbiAgICB0aGlzLl9mb3JjZXMgPSBbXTtcbiAgICB0aGlzLl9jb25zdHJhaW50cyA9IFtdO1xuICAgIHRoaXMuX2N1cnJBZ2VudElkID0gMDtcbn07XG5mdW5jdGlvbiBfZ2V0QWdlbnREYXRhKGlkKSB7XG4gICAgcmV0dXJuIHRoaXMuX2FnZW50RGF0YVtpZF07XG59XG5QaHlzaWNzRW5naW5lLnByb3RvdHlwZS5nZXRBZ2VudCA9IGZ1bmN0aW9uIGdldEFnZW50KGlkKSB7XG4gICAgcmV0dXJuIF9nZXRBZ2VudERhdGEuY2FsbCh0aGlzLCBpZCkuYWdlbnQ7XG59O1xuUGh5c2ljc0VuZ2luZS5wcm90b3R5cGUuZ2V0UGFydGljbGVzID0gZnVuY3Rpb24gZ2V0UGFydGljbGVzKCkge1xuICAgIHJldHVybiB0aGlzLl9wYXJ0aWNsZXM7XG59O1xuUGh5c2ljc0VuZ2luZS5wcm90b3R5cGUuZ2V0Qm9kaWVzID0gZnVuY3Rpb24gZ2V0Qm9kaWVzKCkge1xuICAgIHJldHVybiB0aGlzLl9ib2RpZXM7XG59O1xuUGh5c2ljc0VuZ2luZS5wcm90b3R5cGUuZ2V0UGFydGljbGVzQW5kQm9kaWVzID0gZnVuY3Rpb24gZ2V0UGFydGljbGVzQW5kQm9kaWVzKCkge1xuICAgIHJldHVybiB0aGlzLmdldFBhcnRpY2xlcygpLmNvbmNhdCh0aGlzLmdldEJvZGllcygpKTtcbn07XG5QaHlzaWNzRW5naW5lLnByb3RvdHlwZS5mb3JFYWNoUGFydGljbGUgPSBmdW5jdGlvbiBmb3JFYWNoUGFydGljbGUoZm4sIGR0KSB7XG4gICAgdmFyIHBhcnRpY2xlcyA9IHRoaXMuZ2V0UGFydGljbGVzKCk7XG4gICAgZm9yICh2YXIgaW5kZXggPSAwLCBsZW4gPSBwYXJ0aWNsZXMubGVuZ3RoOyBpbmRleCA8IGxlbjsgaW5kZXgrKylcbiAgICAgICAgZm4uY2FsbCh0aGlzLCBwYXJ0aWNsZXNbaW5kZXhdLCBkdCk7XG59O1xuUGh5c2ljc0VuZ2luZS5wcm90b3R5cGUuZm9yRWFjaEJvZHkgPSBmdW5jdGlvbiBmb3JFYWNoQm9keShmbiwgZHQpIHtcbiAgICBpZiAoIXRoaXMuX2hhc0JvZGllcylcbiAgICAgICAgcmV0dXJuO1xuICAgIHZhciBib2RpZXMgPSB0aGlzLmdldEJvZGllcygpO1xuICAgIGZvciAodmFyIGluZGV4ID0gMCwgbGVuID0gYm9kaWVzLmxlbmd0aDsgaW5kZXggPCBsZW47IGluZGV4KyspXG4gICAgICAgIGZuLmNhbGwodGhpcywgYm9kaWVzW2luZGV4XSwgZHQpO1xufTtcblBoeXNpY3NFbmdpbmUucHJvdG90eXBlLmZvckVhY2ggPSBmdW5jdGlvbiBmb3JFYWNoKGZuLCBkdCkge1xuICAgIHRoaXMuZm9yRWFjaFBhcnRpY2xlKGZuLCBkdCk7XG4gICAgdGhpcy5mb3JFYWNoQm9keShmbiwgZHQpO1xufTtcbmZ1bmN0aW9uIF91cGRhdGVGb3JjZShpbmRleCkge1xuICAgIHZhciBib3VuZEFnZW50ID0gX2dldEFnZW50RGF0YS5jYWxsKHRoaXMsIHRoaXMuX2ZvcmNlc1tpbmRleF0pO1xuICAgIGJvdW5kQWdlbnQuYWdlbnQuYXBwbHlGb3JjZShib3VuZEFnZW50LnRhcmdldHMsIGJvdW5kQWdlbnQuc291cmNlKTtcbn1cbmZ1bmN0aW9uIF91cGRhdGVGb3JjZXMoKSB7XG4gICAgZm9yICh2YXIgaW5kZXggPSB0aGlzLl9mb3JjZXMubGVuZ3RoIC0gMTsgaW5kZXggPiAtMTsgaW5kZXgtLSlcbiAgICAgICAgX3VwZGF0ZUZvcmNlLmNhbGwodGhpcywgaW5kZXgpO1xufVxuZnVuY3Rpb24gX3VwZGF0ZUNvbnN0cmFpbnQoaW5kZXgsIGR0KSB7XG4gICAgdmFyIGJvdW5kQWdlbnQgPSB0aGlzLl9hZ2VudERhdGFbdGhpcy5fY29uc3RyYWludHNbaW5kZXhdXTtcbiAgICByZXR1cm4gYm91bmRBZ2VudC5hZ2VudC5hcHBseUNvbnN0cmFpbnQoYm91bmRBZ2VudC50YXJnZXRzLCBib3VuZEFnZW50LnNvdXJjZSwgZHQpO1xufVxuZnVuY3Rpb24gX3VwZGF0ZUNvbnN0cmFpbnRzKGR0KSB7XG4gICAgdmFyIGl0ZXJhdGlvbiA9IDA7XG4gICAgd2hpbGUgKGl0ZXJhdGlvbiA8IHRoaXMub3B0aW9ucy5jb25zdHJhaW50U3RlcHMpIHtcbiAgICAgICAgZm9yICh2YXIgaW5kZXggPSB0aGlzLl9jb25zdHJhaW50cy5sZW5ndGggLSAxOyBpbmRleCA+IC0xOyBpbmRleC0tKVxuICAgICAgICAgICAgX3VwZGF0ZUNvbnN0cmFpbnQuY2FsbCh0aGlzLCBpbmRleCwgZHQpO1xuICAgICAgICBpdGVyYXRpb24rKztcbiAgICB9XG59XG5mdW5jdGlvbiBfdXBkYXRlVmVsb2NpdGllcyhib2R5LCBkdCkge1xuICAgIGJvZHkuaW50ZWdyYXRlVmVsb2NpdHkoZHQpO1xuICAgIGlmICh0aGlzLm9wdGlvbnMudmVsb2NpdHlDYXApXG4gICAgICAgIGJvZHkudmVsb2NpdHkuY2FwKHRoaXMub3B0aW9ucy52ZWxvY2l0eUNhcCkucHV0KGJvZHkudmVsb2NpdHkpO1xufVxuZnVuY3Rpb24gX3VwZGF0ZUFuZ3VsYXJWZWxvY2l0aWVzKGJvZHksIGR0KSB7XG4gICAgYm9keS5pbnRlZ3JhdGVBbmd1bGFyTW9tZW50dW0oZHQpO1xuICAgIGJvZHkudXBkYXRlQW5ndWxhclZlbG9jaXR5KCk7XG4gICAgaWYgKHRoaXMub3B0aW9ucy5hbmd1bGFyVmVsb2NpdHlDYXApXG4gICAgICAgIGJvZHkuYW5ndWxhclZlbG9jaXR5LmNhcCh0aGlzLm9wdGlvbnMuYW5ndWxhclZlbG9jaXR5Q2FwKS5wdXQoYm9keS5hbmd1bGFyVmVsb2NpdHkpO1xufVxuZnVuY3Rpb24gX3VwZGF0ZU9yaWVudGF0aW9ucyhib2R5LCBkdCkge1xuICAgIGJvZHkuaW50ZWdyYXRlT3JpZW50YXRpb24oZHQpO1xufVxuZnVuY3Rpb24gX3VwZGF0ZVBvc2l0aW9ucyhib2R5LCBkdCkge1xuICAgIGJvZHkuaW50ZWdyYXRlUG9zaXRpb24oZHQpO1xuICAgIGJvZHkuZW1pdChfZXZlbnRzLnVwZGF0ZSwgYm9keSk7XG59XG5mdW5jdGlvbiBfaW50ZWdyYXRlKGR0KSB7XG4gICAgX3VwZGF0ZUZvcmNlcy5jYWxsKHRoaXMsIGR0KTtcbiAgICB0aGlzLmZvckVhY2goX3VwZGF0ZVZlbG9jaXRpZXMsIGR0KTtcbiAgICB0aGlzLmZvckVhY2hCb2R5KF91cGRhdGVBbmd1bGFyVmVsb2NpdGllcywgZHQpO1xuICAgIF91cGRhdGVDb25zdHJhaW50cy5jYWxsKHRoaXMsIGR0KTtcbiAgICB0aGlzLmZvckVhY2hCb2R5KF91cGRhdGVPcmllbnRhdGlvbnMsIGR0KTtcbiAgICB0aGlzLmZvckVhY2goX3VwZGF0ZVBvc2l0aW9ucywgZHQpO1xufVxuZnVuY3Rpb24gX2dldFBhcnRpY2xlc0VuZXJneSgpIHtcbiAgICB2YXIgZW5lcmd5ID0gMDtcbiAgICB2YXIgcGFydGljbGVFbmVyZ3kgPSAwO1xuICAgIHRoaXMuZm9yRWFjaChmdW5jdGlvbiAocGFydGljbGUpIHtcbiAgICAgICAgcGFydGljbGVFbmVyZ3kgPSBwYXJ0aWNsZS5nZXRFbmVyZ3koKTtcbiAgICAgICAgZW5lcmd5ICs9IHBhcnRpY2xlRW5lcmd5O1xuICAgIH0pO1xuICAgIHJldHVybiBlbmVyZ3k7XG59XG5mdW5jdGlvbiBfZ2V0QWdlbnRzRW5lcmd5KCkge1xuICAgIHZhciBlbmVyZ3kgPSAwO1xuICAgIGZvciAodmFyIGlkIGluIHRoaXMuX2FnZW50RGF0YSlcbiAgICAgICAgZW5lcmd5ICs9IHRoaXMuZ2V0QWdlbnRFbmVyZ3koaWQpO1xuICAgIHJldHVybiBlbmVyZ3k7XG59XG5QaHlzaWNzRW5naW5lLnByb3RvdHlwZS5nZXRBZ2VudEVuZXJneSA9IGZ1bmN0aW9uIChhZ2VudElkKSB7XG4gICAgdmFyIGFnZW50RGF0YSA9IF9nZXRBZ2VudERhdGEuY2FsbCh0aGlzLCBhZ2VudElkKTtcbiAgICByZXR1cm4gYWdlbnREYXRhLmFnZW50LmdldEVuZXJneShhZ2VudERhdGEudGFyZ2V0cywgYWdlbnREYXRhLnNvdXJjZSk7XG59O1xuUGh5c2ljc0VuZ2luZS5wcm90b3R5cGUuZ2V0RW5lcmd5ID0gZnVuY3Rpb24gZ2V0RW5lcmd5KCkge1xuICAgIHJldHVybiBfZ2V0UGFydGljbGVzRW5lcmd5LmNhbGwodGhpcykgKyBfZ2V0QWdlbnRzRW5lcmd5LmNhbGwodGhpcyk7XG59O1xuUGh5c2ljc0VuZ2luZS5wcm90b3R5cGUuc3RlcCA9IGZ1bmN0aW9uIHN0ZXAoKSB7XG4gICAgaWYgKHRoaXMuaXNTbGVlcGluZygpKVxuICAgICAgICByZXR1cm47XG4gICAgdmFyIGN1cnJUaW1lID0gbm93KCk7XG4gICAgdmFyIGR0RnJhbWUgPSBjdXJyVGltZSAtIHRoaXMuX3ByZXZUaW1lO1xuICAgIHRoaXMuX3ByZXZUaW1lID0gY3VyclRpbWU7XG4gICAgaWYgKGR0RnJhbWUgPCBNSU5fVElNRV9TVEVQKVxuICAgICAgICByZXR1cm47XG4gICAgaWYgKGR0RnJhbWUgPiBNQVhfVElNRV9TVEVQKVxuICAgICAgICBkdEZyYW1lID0gTUFYX1RJTUVfU1RFUDtcbiAgICBfaW50ZWdyYXRlLmNhbGwodGhpcywgVElNRVNURVApO1xuICAgIHRoaXMuZW1pdChfZXZlbnRzLnVwZGF0ZSwgdGhpcyk7XG4gICAgaWYgKHRoaXMuZ2V0RW5lcmd5KCkgPCB0aGlzLm9wdGlvbnMuc2xlZXBUb2xlcmFuY2UpXG4gICAgICAgIHRoaXMuc2xlZXAoKTtcbn07XG5QaHlzaWNzRW5naW5lLnByb3RvdHlwZS5pc1NsZWVwaW5nID0gZnVuY3Rpb24gaXNTbGVlcGluZygpIHtcbiAgICByZXR1cm4gdGhpcy5faXNTbGVlcGluZztcbn07XG5QaHlzaWNzRW5naW5lLnByb3RvdHlwZS5pc0FjdGl2ZSA9IGZ1bmN0aW9uIGlzU2xlZXBpbmcoKSB7XG4gICAgcmV0dXJuICF0aGlzLl9pc1NsZWVwaW5nO1xufTtcblBoeXNpY3NFbmdpbmUucHJvdG90eXBlLnNsZWVwID0gZnVuY3Rpb24gc2xlZXAoKSB7XG4gICAgaWYgKHRoaXMuX2lzU2xlZXBpbmcpXG4gICAgICAgIHJldHVybjtcbiAgICB0aGlzLmZvckVhY2goZnVuY3Rpb24gKGJvZHkpIHtcbiAgICAgICAgYm9keS5zbGVlcCgpO1xuICAgIH0pO1xuICAgIHRoaXMuZW1pdChfZXZlbnRzLmVuZCwgdGhpcyk7XG4gICAgdGhpcy5faXNTbGVlcGluZyA9IHRydWU7XG59O1xuUGh5c2ljc0VuZ2luZS5wcm90b3R5cGUud2FrZSA9IGZ1bmN0aW9uIHdha2UoKSB7XG4gICAgaWYgKCF0aGlzLl9pc1NsZWVwaW5nKVxuICAgICAgICByZXR1cm47XG4gICAgdGhpcy5fcHJldlRpbWUgPSBub3coKTtcbiAgICB0aGlzLmVtaXQoX2V2ZW50cy5zdGFydCwgdGhpcyk7XG4gICAgdGhpcy5faXNTbGVlcGluZyA9IGZhbHNlO1xufTtcblBoeXNpY3NFbmdpbmUucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbiBlbWl0KHR5cGUsIGRhdGEpIHtcbiAgICBpZiAodGhpcy5fZXZlbnRIYW5kbGVyID09PSBudWxsKVxuICAgICAgICByZXR1cm47XG4gICAgdGhpcy5fZXZlbnRIYW5kbGVyLmVtaXQodHlwZSwgZGF0YSk7XG59O1xuUGh5c2ljc0VuZ2luZS5wcm90b3R5cGUub24gPSBmdW5jdGlvbiBvbihldmVudCwgZm4pIHtcbiAgICBpZiAodGhpcy5fZXZlbnRIYW5kbGVyID09PSBudWxsKVxuICAgICAgICB0aGlzLl9ldmVudEhhbmRsZXIgPSBuZXcgRXZlbnRIYW5kbGVyKCk7XG4gICAgdGhpcy5fZXZlbnRIYW5kbGVyLm9uKGV2ZW50LCBmbik7XG59O1xubW9kdWxlLmV4cG9ydHMgPSBQaHlzaWNzRW5naW5lOyIsInZhciBQYXJ0aWNsZSA9IHJlcXVpcmUoJy4vUGFydGljbGUnKTtcbnZhciBUcmFuc2Zvcm0gPSByZXF1aXJlKCcuLi8uLi9jb3JlL1RyYW5zZm9ybScpO1xudmFyIFZlY3RvciA9IHJlcXVpcmUoJy4uLy4uL21hdGgvVmVjdG9yJyk7XG52YXIgUXVhdGVybmlvbiA9IHJlcXVpcmUoJy4uLy4uL21hdGgvUXVhdGVybmlvbicpO1xudmFyIE1hdHJpeCA9IHJlcXVpcmUoJy4uLy4uL21hdGgvTWF0cml4Jyk7XG52YXIgSW50ZWdyYXRvciA9IHJlcXVpcmUoJy4uL2ludGVncmF0b3JzL1N5bXBsZWN0aWNFdWxlcicpO1xuZnVuY3Rpb24gQm9keShvcHRpb25zKSB7XG4gICAgUGFydGljbGUuY2FsbCh0aGlzLCBvcHRpb25zKTtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICB0aGlzLm9yaWVudGF0aW9uID0gbmV3IFF1YXRlcm5pb24oKTtcbiAgICB0aGlzLmFuZ3VsYXJWZWxvY2l0eSA9IG5ldyBWZWN0b3IoKTtcbiAgICB0aGlzLmFuZ3VsYXJNb21lbnR1bSA9IG5ldyBWZWN0b3IoKTtcbiAgICB0aGlzLnRvcnF1ZSA9IG5ldyBWZWN0b3IoKTtcbiAgICBpZiAob3B0aW9ucy5vcmllbnRhdGlvbilcbiAgICAgICAgdGhpcy5vcmllbnRhdGlvbi5zZXQob3B0aW9ucy5vcmllbnRhdGlvbik7XG4gICAgaWYgKG9wdGlvbnMuYW5ndWxhclZlbG9jaXR5KVxuICAgICAgICB0aGlzLmFuZ3VsYXJWZWxvY2l0eS5zZXQob3B0aW9ucy5hbmd1bGFyVmVsb2NpdHkpO1xuICAgIGlmIChvcHRpb25zLmFuZ3VsYXJNb21lbnR1bSlcbiAgICAgICAgdGhpcy5hbmd1bGFyTW9tZW50dW0uc2V0KG9wdGlvbnMuYW5ndWxhck1vbWVudHVtKTtcbiAgICBpZiAob3B0aW9ucy50b3JxdWUpXG4gICAgICAgIHRoaXMudG9ycXVlLnNldChvcHRpb25zLnRvcnF1ZSk7XG4gICAgdGhpcy5hbmd1bGFyVmVsb2NpdHkudyA9IDA7XG4gICAgdGhpcy5zZXRNb21lbnRzT2ZJbmVydGlhKCk7XG4gICAgdGhpcy5wV29ybGQgPSBuZXcgVmVjdG9yKCk7XG59XG5Cb2R5LkRFRkFVTFRfT1BUSU9OUyA9IFBhcnRpY2xlLkRFRkFVTFRfT1BUSU9OUztcbkJvZHkuREVGQVVMVF9PUFRJT05TLm9yaWVudGF0aW9uID0gW1xuICAgIDAsXG4gICAgMCxcbiAgICAwLFxuICAgIDFcbl07XG5Cb2R5LkRFRkFVTFRfT1BUSU9OUy5hbmd1bGFyVmVsb2NpdHkgPSBbXG4gICAgMCxcbiAgICAwLFxuICAgIDBcbl07XG5Cb2R5LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGFydGljbGUucHJvdG90eXBlKTtcbkJvZHkucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQm9keTtcbkJvZHkucHJvdG90eXBlLmlzQm9keSA9IHRydWU7XG5Cb2R5LnByb3RvdHlwZS5zZXRNYXNzID0gZnVuY3Rpb24gc2V0TWFzcygpIHtcbiAgICBQYXJ0aWNsZS5wcm90b3R5cGUuc2V0TWFzcy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIHRoaXMuc2V0TW9tZW50c09mSW5lcnRpYSgpO1xufTtcbkJvZHkucHJvdG90eXBlLnNldE1vbWVudHNPZkluZXJ0aWEgPSBmdW5jdGlvbiBzZXRNb21lbnRzT2ZJbmVydGlhKCkge1xuICAgIHRoaXMuaW5lcnRpYSA9IG5ldyBNYXRyaXgoKTtcbiAgICB0aGlzLmludmVyc2VJbmVydGlhID0gbmV3IE1hdHJpeCgpO1xufTtcbkJvZHkucHJvdG90eXBlLnVwZGF0ZUFuZ3VsYXJWZWxvY2l0eSA9IGZ1bmN0aW9uIHVwZGF0ZUFuZ3VsYXJWZWxvY2l0eSgpIHtcbiAgICB0aGlzLmFuZ3VsYXJWZWxvY2l0eS5zZXQodGhpcy5pbnZlcnNlSW5lcnRpYS52ZWN0b3JNdWx0aXBseSh0aGlzLmFuZ3VsYXJNb21lbnR1bSkpO1xufTtcbkJvZHkucHJvdG90eXBlLnRvV29ybGRDb29yZGluYXRlcyA9IGZ1bmN0aW9uIHRvV29ybGRDb29yZGluYXRlcyhsb2NhbFBvc2l0aW9uKSB7XG4gICAgcmV0dXJuIHRoaXMucFdvcmxkLnNldCh0aGlzLm9yaWVudGF0aW9uLnJvdGF0ZVZlY3Rvcihsb2NhbFBvc2l0aW9uKSk7XG59O1xuQm9keS5wcm90b3R5cGUuZ2V0RW5lcmd5ID0gZnVuY3Rpb24gZ2V0RW5lcmd5KCkge1xuICAgIHJldHVybiBQYXJ0aWNsZS5wcm90b3R5cGUuZ2V0RW5lcmd5LmNhbGwodGhpcykgKyAwLjUgKiB0aGlzLmluZXJ0aWEudmVjdG9yTXVsdGlwbHkodGhpcy5hbmd1bGFyVmVsb2NpdHkpLmRvdCh0aGlzLmFuZ3VsYXJWZWxvY2l0eSk7XG59O1xuQm9keS5wcm90b3R5cGUucmVzZXQgPSBmdW5jdGlvbiByZXNldChwLCB2LCBxLCBMKSB7XG4gICAgUGFydGljbGUucHJvdG90eXBlLnJlc2V0LmNhbGwodGhpcywgcCwgdik7XG4gICAgdGhpcy5hbmd1bGFyVmVsb2NpdHkuY2xlYXIoKTtcbiAgICB0aGlzLnNldE9yaWVudGF0aW9uKHEgfHwgW1xuICAgICAgICAxLFxuICAgICAgICAwLFxuICAgICAgICAwLFxuICAgICAgICAwXG4gICAgXSk7XG4gICAgdGhpcy5zZXRBbmd1bGFyTW9tZW50dW0oTCB8fCBbXG4gICAgICAgIDAsXG4gICAgICAgIDAsXG4gICAgICAgIDBcbiAgICBdKTtcbn07XG5Cb2R5LnByb3RvdHlwZS5zZXRPcmllbnRhdGlvbiA9IGZ1bmN0aW9uIHNldE9yaWVudGF0aW9uKHEpIHtcbiAgICB0aGlzLm9yaWVudGF0aW9uLnNldChxKTtcbn07XG5Cb2R5LnByb3RvdHlwZS5zZXRBbmd1bGFyVmVsb2NpdHkgPSBmdW5jdGlvbiBzZXRBbmd1bGFyVmVsb2NpdHkodykge1xuICAgIHRoaXMud2FrZSgpO1xuICAgIHRoaXMuYW5ndWxhclZlbG9jaXR5LnNldCh3KTtcbn07XG5Cb2R5LnByb3RvdHlwZS5zZXRBbmd1bGFyTW9tZW50dW0gPSBmdW5jdGlvbiBzZXRBbmd1bGFyTW9tZW50dW0oTCkge1xuICAgIHRoaXMud2FrZSgpO1xuICAgIHRoaXMuYW5ndWxhck1vbWVudHVtLnNldChMKTtcbn07XG5Cb2R5LnByb3RvdHlwZS5hcHBseUZvcmNlID0gZnVuY3Rpb24gYXBwbHlGb3JjZShmb3JjZSwgbG9jYXRpb24pIHtcbiAgICBQYXJ0aWNsZS5wcm90b3R5cGUuYXBwbHlGb3JjZS5jYWxsKHRoaXMsIGZvcmNlKTtcbiAgICBpZiAobG9jYXRpb24gIT09IHVuZGVmaW5lZClcbiAgICAgICAgdGhpcy5hcHBseVRvcnF1ZShsb2NhdGlvbi5jcm9zcyhmb3JjZSkpO1xufTtcbkJvZHkucHJvdG90eXBlLmFwcGx5VG9ycXVlID0gZnVuY3Rpb24gYXBwbHlUb3JxdWUodG9ycXVlKSB7XG4gICAgdGhpcy53YWtlKCk7XG4gICAgdGhpcy50b3JxdWUuc2V0KHRoaXMudG9ycXVlLmFkZCh0b3JxdWUpKTtcbn07XG5Cb2R5LnByb3RvdHlwZS5nZXRUcmFuc2Zvcm0gPSBmdW5jdGlvbiBnZXRUcmFuc2Zvcm0oKSB7XG4gICAgcmV0dXJuIFRyYW5zZm9ybS50aGVuTW92ZSh0aGlzLm9yaWVudGF0aW9uLmdldFRyYW5zZm9ybSgpLCBUcmFuc2Zvcm0uZ2V0VHJhbnNsYXRlKFBhcnRpY2xlLnByb3RvdHlwZS5nZXRUcmFuc2Zvcm0uY2FsbCh0aGlzKSkpO1xufTtcbkJvZHkucHJvdG90eXBlLl9pbnRlZ3JhdGUgPSBmdW5jdGlvbiBfaW50ZWdyYXRlKGR0KSB7XG4gICAgUGFydGljbGUucHJvdG90eXBlLl9pbnRlZ3JhdGUuY2FsbCh0aGlzLCBkdCk7XG4gICAgdGhpcy5pbnRlZ3JhdGVBbmd1bGFyTW9tZW50dW0oZHQpO1xuICAgIHRoaXMudXBkYXRlQW5ndWxhclZlbG9jaXR5KGR0KTtcbiAgICB0aGlzLmludGVncmF0ZU9yaWVudGF0aW9uKGR0KTtcbn07XG5Cb2R5LnByb3RvdHlwZS5pbnRlZ3JhdGVBbmd1bGFyTW9tZW50dW0gPSBmdW5jdGlvbiBpbnRlZ3JhdGVBbmd1bGFyTW9tZW50dW0oZHQpIHtcbiAgICBJbnRlZ3JhdG9yLmludGVncmF0ZUFuZ3VsYXJNb21lbnR1bSh0aGlzLCBkdCk7XG59O1xuQm9keS5wcm90b3R5cGUuaW50ZWdyYXRlT3JpZW50YXRpb24gPSBmdW5jdGlvbiBpbnRlZ3JhdGVPcmllbnRhdGlvbihkdCkge1xuICAgIEludGVncmF0b3IuaW50ZWdyYXRlT3JpZW50YXRpb24odGhpcywgZHQpO1xufTtcbm1vZHVsZS5leHBvcnRzID0gQm9keTsiLCJ2YXIgQm9keSA9IHJlcXVpcmUoJy4vQm9keScpO1xudmFyIE1hdHJpeCA9IHJlcXVpcmUoJy4uLy4uL21hdGgvTWF0cml4Jyk7XG5mdW5jdGlvbiBDaXJjbGUob3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgIHRoaXMuc2V0UmFkaXVzKG9wdGlvbnMucmFkaXVzIHx8IDApO1xuICAgIEJvZHkuY2FsbCh0aGlzLCBvcHRpb25zKTtcbn1cbkNpcmNsZS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEJvZHkucHJvdG90eXBlKTtcbkNpcmNsZS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBDaXJjbGU7XG5DaXJjbGUucHJvdG90eXBlLnNldFJhZGl1cyA9IGZ1bmN0aW9uIHNldFJhZGl1cyhyKSB7XG4gICAgdGhpcy5yYWRpdXMgPSByO1xuICAgIHRoaXMuc2l6ZSA9IFtcbiAgICAgICAgMiAqIHRoaXMucmFkaXVzLFxuICAgICAgICAyICogdGhpcy5yYWRpdXNcbiAgICBdO1xuICAgIHRoaXMuc2V0TW9tZW50c09mSW5lcnRpYSgpO1xufTtcbkNpcmNsZS5wcm90b3R5cGUuc2V0TW9tZW50c09mSW5lcnRpYSA9IGZ1bmN0aW9uIHNldE1vbWVudHNPZkluZXJ0aWEoKSB7XG4gICAgdmFyIG0gPSB0aGlzLm1hc3M7XG4gICAgdmFyIHIgPSB0aGlzLnJhZGl1cztcbiAgICB0aGlzLmluZXJ0aWEgPSBuZXcgTWF0cml4KFtcbiAgICAgICAgW1xuICAgICAgICAgICAgMC4yNSAqIG0gKiByICogcixcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAwXG4gICAgICAgIF0sXG4gICAgICAgIFtcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAwLjI1ICogbSAqIHIgKiByLFxuICAgICAgICAgICAgMFxuICAgICAgICBdLFxuICAgICAgICBbXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDAuNSAqIG0gKiByICogclxuICAgICAgICBdXG4gICAgXSk7XG4gICAgdGhpcy5pbnZlcnNlSW5lcnRpYSA9IG5ldyBNYXRyaXgoW1xuICAgICAgICBbXG4gICAgICAgICAgICA0IC8gKG0gKiByICogciksXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMFxuICAgICAgICBdLFxuICAgICAgICBbXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgNCAvIChtICogciAqIHIpLFxuICAgICAgICAgICAgMFxuICAgICAgICBdLFxuICAgICAgICBbXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDIgLyAobSAqIHIgKiByKVxuICAgICAgICBdXG4gICAgXSk7XG59O1xubW9kdWxlLmV4cG9ydHMgPSBDaXJjbGU7IiwidmFyIFZlY3RvciA9IHJlcXVpcmUoJy4uLy4uL21hdGgvVmVjdG9yJyk7XG52YXIgVHJhbnNmb3JtID0gcmVxdWlyZSgnLi4vLi4vY29yZS9UcmFuc2Zvcm0nKTtcbnZhciBFdmVudEhhbmRsZXIgPSByZXF1aXJlKCcuLi8uLi9jb3JlL0V2ZW50SGFuZGxlcicpO1xudmFyIEludGVncmF0b3IgPSByZXF1aXJlKCcuLi9pbnRlZ3JhdG9ycy9TeW1wbGVjdGljRXVsZXInKTtcbmZ1bmN0aW9uIFBhcnRpY2xlKG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICB2YXIgZGVmYXVsdHMgPSBQYXJ0aWNsZS5ERUZBVUxUX09QVElPTlM7XG4gICAgdGhpcy5wb3NpdGlvbiA9IG5ldyBWZWN0b3IoKTtcbiAgICB0aGlzLnZlbG9jaXR5ID0gbmV3IFZlY3RvcigpO1xuICAgIHRoaXMuZm9yY2UgPSBuZXcgVmVjdG9yKCk7XG4gICAgdGhpcy5fZW5naW5lID0gbnVsbDtcbiAgICB0aGlzLl9pc1NsZWVwaW5nID0gdHJ1ZTtcbiAgICB0aGlzLl9ldmVudE91dHB1dCA9IG51bGw7XG4gICAgdGhpcy5tYXNzID0gb3B0aW9ucy5tYXNzICE9PSB1bmRlZmluZWQgPyBvcHRpb25zLm1hc3MgOiBkZWZhdWx0cy5tYXNzO1xuICAgIHRoaXMuaW52ZXJzZU1hc3MgPSAxIC8gdGhpcy5tYXNzO1xuICAgIHRoaXMuc2V0UG9zaXRpb24ob3B0aW9ucy5wb3NpdGlvbiB8fCBkZWZhdWx0cy5wb3NpdGlvbik7XG4gICAgdGhpcy5zZXRWZWxvY2l0eShvcHRpb25zLnZlbG9jaXR5IHx8IGRlZmF1bHRzLnZlbG9jaXR5KTtcbiAgICB0aGlzLmZvcmNlLnNldChvcHRpb25zLmZvcmNlIHx8IFtcbiAgICAgICAgMCxcbiAgICAgICAgMCxcbiAgICAgICAgMFxuICAgIF0pO1xuICAgIHRoaXMudHJhbnNmb3JtID0gVHJhbnNmb3JtLmlkZW50aXR5LnNsaWNlKCk7XG4gICAgdGhpcy5fc3BlYyA9IHtcbiAgICAgICAgc2l6ZTogW1xuICAgICAgICAgICAgdHJ1ZSxcbiAgICAgICAgICAgIHRydWVcbiAgICAgICAgXSxcbiAgICAgICAgdGFyZ2V0OiB7XG4gICAgICAgICAgICB0cmFuc2Zvcm06IHRoaXMudHJhbnNmb3JtLFxuICAgICAgICAgICAgb3JpZ2luOiBbXG4gICAgICAgICAgICAgICAgMC41LFxuICAgICAgICAgICAgICAgIDAuNVxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIHRhcmdldDogbnVsbFxuICAgICAgICB9XG4gICAgfTtcbn1cblBhcnRpY2xlLkRFRkFVTFRfT1BUSU9OUyA9IHtcbiAgICBwb3NpdGlvbjogW1xuICAgICAgICAwLFxuICAgICAgICAwLFxuICAgICAgICAwXG4gICAgXSxcbiAgICB2ZWxvY2l0eTogW1xuICAgICAgICAwLFxuICAgICAgICAwLFxuICAgICAgICAwXG4gICAgXSxcbiAgICBtYXNzOiAxXG59O1xudmFyIF9ldmVudHMgPSB7XG4gICAgICAgIHN0YXJ0OiAnc3RhcnQnLFxuICAgICAgICB1cGRhdGU6ICd1cGRhdGUnLFxuICAgICAgICBlbmQ6ICdlbmQnXG4gICAgfTtcbnZhciBub3cgPSBEYXRlLm5vdztcblBhcnRpY2xlLnByb3RvdHlwZS5pc0JvZHkgPSBmYWxzZTtcblBhcnRpY2xlLnByb3RvdHlwZS5pc0FjdGl2ZSA9IGZ1bmN0aW9uIGlzQWN0aXZlKCkge1xuICAgIHJldHVybiAhdGhpcy5faXNTbGVlcGluZztcbn07XG5QYXJ0aWNsZS5wcm90b3R5cGUuc2xlZXAgPSBmdW5jdGlvbiBzbGVlcCgpIHtcbiAgICBpZiAodGhpcy5faXNTbGVlcGluZylcbiAgICAgICAgcmV0dXJuO1xuICAgIHRoaXMuZW1pdChfZXZlbnRzLmVuZCwgdGhpcyk7XG4gICAgdGhpcy5faXNTbGVlcGluZyA9IHRydWU7XG59O1xuUGFydGljbGUucHJvdG90eXBlLndha2UgPSBmdW5jdGlvbiB3YWtlKCkge1xuICAgIGlmICghdGhpcy5faXNTbGVlcGluZylcbiAgICAgICAgcmV0dXJuO1xuICAgIHRoaXMuZW1pdChfZXZlbnRzLnN0YXJ0LCB0aGlzKTtcbiAgICB0aGlzLl9pc1NsZWVwaW5nID0gZmFsc2U7XG4gICAgdGhpcy5fcHJldlRpbWUgPSBub3coKTtcbiAgICBpZiAodGhpcy5fZW5naW5lKVxuICAgICAgICB0aGlzLl9lbmdpbmUud2FrZSgpO1xufTtcblBhcnRpY2xlLnByb3RvdHlwZS5zZXRQb3NpdGlvbiA9IGZ1bmN0aW9uIHNldFBvc2l0aW9uKHBvc2l0aW9uKSB7XG4gICAgdGhpcy5wb3NpdGlvbi5zZXQocG9zaXRpb24pO1xufTtcblBhcnRpY2xlLnByb3RvdHlwZS5zZXRQb3NpdGlvbjFEID0gZnVuY3Rpb24gc2V0UG9zaXRpb24xRCh4KSB7XG4gICAgdGhpcy5wb3NpdGlvbi54ID0geDtcbn07XG5QYXJ0aWNsZS5wcm90b3R5cGUuZ2V0UG9zaXRpb24gPSBmdW5jdGlvbiBnZXRQb3NpdGlvbigpIHtcbiAgICB0aGlzLl9lbmdpbmUuc3RlcCgpO1xuICAgIHJldHVybiB0aGlzLnBvc2l0aW9uLmdldCgpO1xufTtcblBhcnRpY2xlLnByb3RvdHlwZS5nZXRQb3NpdGlvbjFEID0gZnVuY3Rpb24gZ2V0UG9zaXRpb24xRCgpIHtcbiAgICB0aGlzLl9lbmdpbmUuc3RlcCgpO1xuICAgIHJldHVybiB0aGlzLnBvc2l0aW9uLng7XG59O1xuUGFydGljbGUucHJvdG90eXBlLnNldFZlbG9jaXR5ID0gZnVuY3Rpb24gc2V0VmVsb2NpdHkodmVsb2NpdHkpIHtcbiAgICB0aGlzLnZlbG9jaXR5LnNldCh2ZWxvY2l0eSk7XG4gICAgaWYgKCEodmVsb2NpdHlbMF0gPT09IDAgJiYgdmVsb2NpdHlbMV0gPT09IDAgJiYgdmVsb2NpdHlbMl0gPT09IDApKVxuICAgICAgICB0aGlzLndha2UoKTtcbn07XG5QYXJ0aWNsZS5wcm90b3R5cGUuc2V0VmVsb2NpdHkxRCA9IGZ1bmN0aW9uIHNldFZlbG9jaXR5MUQoeCkge1xuICAgIHRoaXMudmVsb2NpdHkueCA9IHg7XG4gICAgaWYgKHggIT09IDApXG4gICAgICAgIHRoaXMud2FrZSgpO1xufTtcblBhcnRpY2xlLnByb3RvdHlwZS5nZXRWZWxvY2l0eSA9IGZ1bmN0aW9uIGdldFZlbG9jaXR5KCkge1xuICAgIHJldHVybiB0aGlzLnZlbG9jaXR5LmdldCgpO1xufTtcblBhcnRpY2xlLnByb3RvdHlwZS5zZXRGb3JjZSA9IGZ1bmN0aW9uIHNldEZvcmNlKGZvcmNlKSB7XG4gICAgdGhpcy5mb3JjZS5zZXQoZm9yY2UpO1xuICAgIHRoaXMud2FrZSgpO1xufTtcblBhcnRpY2xlLnByb3RvdHlwZS5nZXRWZWxvY2l0eTFEID0gZnVuY3Rpb24gZ2V0VmVsb2NpdHkxRCgpIHtcbiAgICByZXR1cm4gdGhpcy52ZWxvY2l0eS54O1xufTtcblBhcnRpY2xlLnByb3RvdHlwZS5zZXRNYXNzID0gZnVuY3Rpb24gc2V0TWFzcyhtYXNzKSB7XG4gICAgdGhpcy5tYXNzID0gbWFzcztcbiAgICB0aGlzLmludmVyc2VNYXNzID0gMSAvIG1hc3M7XG59O1xuUGFydGljbGUucHJvdG90eXBlLmdldE1hc3MgPSBmdW5jdGlvbiBnZXRNYXNzKCkge1xuICAgIHJldHVybiB0aGlzLm1hc3M7XG59O1xuUGFydGljbGUucHJvdG90eXBlLnJlc2V0ID0gZnVuY3Rpb24gcmVzZXQocG9zaXRpb24sIHZlbG9jaXR5KSB7XG4gICAgdGhpcy5zZXRQb3NpdGlvbihwb3NpdGlvbiB8fCBbXG4gICAgICAgIDAsXG4gICAgICAgIDAsXG4gICAgICAgIDBcbiAgICBdKTtcbiAgICB0aGlzLnNldFZlbG9jaXR5KHZlbG9jaXR5IHx8IFtcbiAgICAgICAgMCxcbiAgICAgICAgMCxcbiAgICAgICAgMFxuICAgIF0pO1xufTtcblBhcnRpY2xlLnByb3RvdHlwZS5hcHBseUZvcmNlID0gZnVuY3Rpb24gYXBwbHlGb3JjZShmb3JjZSkge1xuICAgIGlmIChmb3JjZS5pc1plcm8oKSlcbiAgICAgICAgcmV0dXJuO1xuICAgIHRoaXMuZm9yY2UuYWRkKGZvcmNlKS5wdXQodGhpcy5mb3JjZSk7XG4gICAgdGhpcy53YWtlKCk7XG59O1xuUGFydGljbGUucHJvdG90eXBlLmFwcGx5SW1wdWxzZSA9IGZ1bmN0aW9uIGFwcGx5SW1wdWxzZShpbXB1bHNlKSB7XG4gICAgaWYgKGltcHVsc2UuaXNaZXJvKCkpXG4gICAgICAgIHJldHVybjtcbiAgICB2YXIgdmVsb2NpdHkgPSB0aGlzLnZlbG9jaXR5O1xuICAgIHZlbG9jaXR5LmFkZChpbXB1bHNlLm11bHQodGhpcy5pbnZlcnNlTWFzcykpLnB1dCh2ZWxvY2l0eSk7XG59O1xuUGFydGljbGUucHJvdG90eXBlLmludGVncmF0ZVZlbG9jaXR5ID0gZnVuY3Rpb24gaW50ZWdyYXRlVmVsb2NpdHkoZHQpIHtcbiAgICBJbnRlZ3JhdG9yLmludGVncmF0ZVZlbG9jaXR5KHRoaXMsIGR0KTtcbn07XG5QYXJ0aWNsZS5wcm90b3R5cGUuaW50ZWdyYXRlUG9zaXRpb24gPSBmdW5jdGlvbiBpbnRlZ3JhdGVQb3NpdGlvbihkdCkge1xuICAgIEludGVncmF0b3IuaW50ZWdyYXRlUG9zaXRpb24odGhpcywgZHQpO1xufTtcblBhcnRpY2xlLnByb3RvdHlwZS5faW50ZWdyYXRlID0gZnVuY3Rpb24gX2ludGVncmF0ZShkdCkge1xuICAgIHRoaXMuaW50ZWdyYXRlVmVsb2NpdHkoZHQpO1xuICAgIHRoaXMuaW50ZWdyYXRlUG9zaXRpb24oZHQpO1xufTtcblBhcnRpY2xlLnByb3RvdHlwZS5nZXRFbmVyZ3kgPSBmdW5jdGlvbiBnZXRFbmVyZ3koKSB7XG4gICAgcmV0dXJuIDAuNSAqIHRoaXMubWFzcyAqIHRoaXMudmVsb2NpdHkubm9ybVNxdWFyZWQoKTtcbn07XG5QYXJ0aWNsZS5wcm90b3R5cGUuZ2V0VHJhbnNmb3JtID0gZnVuY3Rpb24gZ2V0VHJhbnNmb3JtKCkge1xuICAgIHRoaXMuX2VuZ2luZS5zdGVwKCk7XG4gICAgdmFyIHBvc2l0aW9uID0gdGhpcy5wb3NpdGlvbjtcbiAgICB2YXIgdHJhbnNmb3JtID0gdGhpcy50cmFuc2Zvcm07XG4gICAgdHJhbnNmb3JtWzEyXSA9IHBvc2l0aW9uLng7XG4gICAgdHJhbnNmb3JtWzEzXSA9IHBvc2l0aW9uLnk7XG4gICAgdHJhbnNmb3JtWzE0XSA9IHBvc2l0aW9uLno7XG4gICAgcmV0dXJuIHRyYW5zZm9ybTtcbn07XG5QYXJ0aWNsZS5wcm90b3R5cGUubW9kaWZ5ID0gZnVuY3Rpb24gbW9kaWZ5KHRhcmdldCkge1xuICAgIHZhciBfc3BlYyA9IHRoaXMuX3NwZWMudGFyZ2V0O1xuICAgIF9zcGVjLnRyYW5zZm9ybSA9IHRoaXMuZ2V0VHJhbnNmb3JtKCk7XG4gICAgX3NwZWMudGFyZ2V0ID0gdGFyZ2V0O1xuICAgIHJldHVybiB0aGlzLl9zcGVjO1xufTtcbmZ1bmN0aW9uIF9jcmVhdGVFdmVudE91dHB1dCgpIHtcbiAgICB0aGlzLl9ldmVudE91dHB1dCA9IG5ldyBFdmVudEhhbmRsZXIoKTtcbiAgICB0aGlzLl9ldmVudE91dHB1dC5iaW5kVGhpcyh0aGlzKTtcbiAgICBFdmVudEhhbmRsZXIuc2V0T3V0cHV0SGFuZGxlcih0aGlzLCB0aGlzLl9ldmVudE91dHB1dCk7XG59XG5QYXJ0aWNsZS5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uIGVtaXQodHlwZSwgZGF0YSkge1xuICAgIGlmICghdGhpcy5fZXZlbnRPdXRwdXQpXG4gICAgICAgIHJldHVybjtcbiAgICB0aGlzLl9ldmVudE91dHB1dC5lbWl0KHR5cGUsIGRhdGEpO1xufTtcblBhcnRpY2xlLnByb3RvdHlwZS5vbiA9IGZ1bmN0aW9uIG9uKCkge1xuICAgIF9jcmVhdGVFdmVudE91dHB1dC5jYWxsKHRoaXMpO1xuICAgIHJldHVybiB0aGlzLm9uLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG59O1xuUGFydGljbGUucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyID0gZnVuY3Rpb24gcmVtb3ZlTGlzdGVuZXIoKSB7XG4gICAgX2NyZWF0ZUV2ZW50T3V0cHV0LmNhbGwodGhpcyk7XG4gICAgcmV0dXJuIHRoaXMucmVtb3ZlTGlzdGVuZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn07XG5QYXJ0aWNsZS5wcm90b3R5cGUucGlwZSA9IGZ1bmN0aW9uIHBpcGUoKSB7XG4gICAgX2NyZWF0ZUV2ZW50T3V0cHV0LmNhbGwodGhpcyk7XG4gICAgcmV0dXJuIHRoaXMucGlwZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xufTtcblBhcnRpY2xlLnByb3RvdHlwZS51bnBpcGUgPSBmdW5jdGlvbiB1bnBpcGUoKSB7XG4gICAgX2NyZWF0ZUV2ZW50T3V0cHV0LmNhbGwodGhpcyk7XG4gICAgcmV0dXJuIHRoaXMudW5waXBlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG59O1xubW9kdWxlLmV4cG9ydHMgPSBQYXJ0aWNsZTsiLCJ2YXIgQ29uc3RyYWludCA9IHJlcXVpcmUoJy4vQ29uc3RyYWludCcpO1xudmFyIFZlY3RvciA9IHJlcXVpcmUoJy4uLy4uL21hdGgvVmVjdG9yJyk7XG5mdW5jdGlvbiBDb2xsaXNpb24ob3B0aW9ucykge1xuICAgIHRoaXMub3B0aW9ucyA9IE9iamVjdC5jcmVhdGUoQ29sbGlzaW9uLkRFRkFVTFRfT1BUSU9OUyk7XG4gICAgaWYgKG9wdGlvbnMpXG4gICAgICAgIHRoaXMuc2V0T3B0aW9ucyhvcHRpb25zKTtcbiAgICB0aGlzLm5vcm1hbCA9IG5ldyBWZWN0b3IoKTtcbiAgICB0aGlzLnBEaWZmID0gbmV3IFZlY3RvcigpO1xuICAgIHRoaXMudkRpZmYgPSBuZXcgVmVjdG9yKCk7XG4gICAgdGhpcy5pbXB1bHNlMSA9IG5ldyBWZWN0b3IoKTtcbiAgICB0aGlzLmltcHVsc2UyID0gbmV3IFZlY3RvcigpO1xuICAgIENvbnN0cmFpbnQuY2FsbCh0aGlzKTtcbn1cbkNvbGxpc2lvbi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKENvbnN0cmFpbnQucHJvdG90eXBlKTtcbkNvbGxpc2lvbi5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBDb2xsaXNpb247XG5Db2xsaXNpb24uREVGQVVMVF9PUFRJT05TID0ge1xuICAgIHJlc3RpdHV0aW9uOiAwLjUsXG4gICAgZHJpZnQ6IDAuNSxcbiAgICBzbG9wOiAwXG59O1xuZnVuY3Rpb24gX25vcm1hbFZlbG9jaXR5KHBhcnRpY2xlMSwgcGFydGljbGUyKSB7XG4gICAgcmV0dXJuIHBhcnRpY2xlMS52ZWxvY2l0eS5kb3QocGFydGljbGUyLnZlbG9jaXR5KTtcbn1cbkNvbGxpc2lvbi5wcm90b3R5cGUuc2V0T3B0aW9ucyA9IGZ1bmN0aW9uIHNldE9wdGlvbnMob3B0aW9ucykge1xuICAgIGZvciAodmFyIGtleSBpbiBvcHRpb25zKVxuICAgICAgICB0aGlzLm9wdGlvbnNba2V5XSA9IG9wdGlvbnNba2V5XTtcbn07XG5Db2xsaXNpb24ucHJvdG90eXBlLmFwcGx5Q29uc3RyYWludCA9IGZ1bmN0aW9uIGFwcGx5Q29uc3RyYWludCh0YXJnZXRzLCBzb3VyY2UsIGR0KSB7XG4gICAgaWYgKHNvdXJjZSA9PT0gdW5kZWZpbmVkKVxuICAgICAgICByZXR1cm47XG4gICAgdmFyIHYxID0gc291cmNlLnZlbG9jaXR5O1xuICAgIHZhciBwMSA9IHNvdXJjZS5wb3NpdGlvbjtcbiAgICB2YXIgdzEgPSBzb3VyY2UuaW52ZXJzZU1hc3M7XG4gICAgdmFyIHIxID0gc291cmNlLnJhZGl1cztcbiAgICB2YXIgb3B0aW9ucyA9IHRoaXMub3B0aW9ucztcbiAgICB2YXIgZHJpZnQgPSBvcHRpb25zLmRyaWZ0O1xuICAgIHZhciBzbG9wID0gLW9wdGlvbnMuc2xvcDtcbiAgICB2YXIgcmVzdGl0dXRpb24gPSBvcHRpb25zLnJlc3RpdHV0aW9uO1xuICAgIHZhciBuID0gdGhpcy5ub3JtYWw7XG4gICAgdmFyIHBEaWZmID0gdGhpcy5wRGlmZjtcbiAgICB2YXIgdkRpZmYgPSB0aGlzLnZEaWZmO1xuICAgIHZhciBpbXB1bHNlMSA9IHRoaXMuaW1wdWxzZTE7XG4gICAgdmFyIGltcHVsc2UyID0gdGhpcy5pbXB1bHNlMjtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRhcmdldHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIHRhcmdldCA9IHRhcmdldHNbaV07XG4gICAgICAgIGlmICh0YXJnZXQgPT09IHNvdXJjZSlcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB2YXIgdjIgPSB0YXJnZXQudmVsb2NpdHk7XG4gICAgICAgIHZhciBwMiA9IHRhcmdldC5wb3NpdGlvbjtcbiAgICAgICAgdmFyIHcyID0gdGFyZ2V0LmludmVyc2VNYXNzO1xuICAgICAgICB2YXIgcjIgPSB0YXJnZXQucmFkaXVzO1xuICAgICAgICBwRGlmZi5zZXQocDIuc3ViKHAxKSk7XG4gICAgICAgIHZEaWZmLnNldCh2Mi5zdWIodjEpKTtcbiAgICAgICAgdmFyIGRpc3QgPSBwRGlmZi5ub3JtKCk7XG4gICAgICAgIHZhciBvdmVybGFwID0gZGlzdCAtIChyMSArIHIyKTtcbiAgICAgICAgdmFyIGVmZk1hc3MgPSAxIC8gKHcxICsgdzIpO1xuICAgICAgICB2YXIgZ2FtbWEgPSAwO1xuICAgICAgICBpZiAob3ZlcmxhcCA8IDApIHtcbiAgICAgICAgICAgIG4uc2V0KHBEaWZmLm5vcm1hbGl6ZSgpKTtcbiAgICAgICAgICAgIGlmICh0aGlzLl9ldmVudE91dHB1dCkge1xuICAgICAgICAgICAgICAgIHZhciBjb2xsaXNpb25EYXRhID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0OiB0YXJnZXQsXG4gICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2U6IHNvdXJjZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG92ZXJsYXA6IG92ZXJsYXAsXG4gICAgICAgICAgICAgICAgICAgICAgICBub3JtYWw6IG5cbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB0aGlzLl9ldmVudE91dHB1dC5lbWl0KCdwcmVDb2xsaXNpb24nLCBjb2xsaXNpb25EYXRhKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9ldmVudE91dHB1dC5lbWl0KCdjb2xsaXNpb24nLCBjb2xsaXNpb25EYXRhKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBsYW1iZGEgPSBvdmVybGFwIDw9IHNsb3AgPyAoKDEgKyByZXN0aXR1dGlvbikgKiBuLmRvdCh2RGlmZikgKyBkcmlmdCAvIGR0ICogKG92ZXJsYXAgLSBzbG9wKSkgLyAoZ2FtbWEgKyBkdCAvIGVmZk1hc3MpIDogKDEgKyByZXN0aXR1dGlvbikgKiBuLmRvdCh2RGlmZikgLyAoZ2FtbWEgKyBkdCAvIGVmZk1hc3MpO1xuICAgICAgICAgICAgbi5tdWx0KGR0ICogbGFtYmRhKS5wdXQoaW1wdWxzZTEpO1xuICAgICAgICAgICAgaW1wdWxzZTEubXVsdCgtMSkucHV0KGltcHVsc2UyKTtcbiAgICAgICAgICAgIHNvdXJjZS5hcHBseUltcHVsc2UoaW1wdWxzZTEpO1xuICAgICAgICAgICAgdGFyZ2V0LmFwcGx5SW1wdWxzZShpbXB1bHNlMik7XG4gICAgICAgICAgICBpZiAodGhpcy5fZXZlbnRPdXRwdXQpXG4gICAgICAgICAgICAgICAgdGhpcy5fZXZlbnRPdXRwdXQuZW1pdCgncG9zdENvbGxpc2lvbicsIGNvbGxpc2lvbkRhdGEpO1xuICAgICAgICB9XG4gICAgfVxufTtcbm1vZHVsZS5leHBvcnRzID0gQ29sbGlzaW9uOyIsInZhciBFdmVudEhhbmRsZXIgPSByZXF1aXJlKCcuLi8uLi9jb3JlL0V2ZW50SGFuZGxlcicpO1xuZnVuY3Rpb24gQ29uc3RyYWludCgpIHtcbiAgICB0aGlzLm9wdGlvbnMgPSB0aGlzLm9wdGlvbnMgfHwge307XG4gICAgdGhpcy5fZXZlbnRPdXRwdXQgPSBuZXcgRXZlbnRIYW5kbGVyKCk7XG4gICAgRXZlbnRIYW5kbGVyLnNldE91dHB1dEhhbmRsZXIodGhpcywgdGhpcy5fZXZlbnRPdXRwdXQpO1xufVxuQ29uc3RyYWludC5wcm90b3R5cGUuc2V0T3B0aW9ucyA9IGZ1bmN0aW9uIHNldE9wdGlvbnMob3B0aW9ucykge1xuICAgIHRoaXMuX2V2ZW50T3V0cHV0LmVtaXQoJ2NoYW5nZScsIG9wdGlvbnMpO1xufTtcbkNvbnN0cmFpbnQucHJvdG90eXBlLmFwcGx5Q29uc3RyYWludCA9IGZ1bmN0aW9uIGFwcGx5Q29uc3RyYWludCgpIHtcbn07XG5Db25zdHJhaW50LnByb3RvdHlwZS5nZXRFbmVyZ3kgPSBmdW5jdGlvbiBnZXRFbmVyZ3koKSB7XG4gICAgcmV0dXJuIDA7XG59O1xubW9kdWxlLmV4cG9ydHMgPSBDb25zdHJhaW50OyIsInZhciBDb25zdHJhaW50ID0gcmVxdWlyZSgnLi9Db25zdHJhaW50Jyk7XG52YXIgVmVjdG9yID0gcmVxdWlyZSgnLi4vLi4vbWF0aC9WZWN0b3InKTtcbmZ1bmN0aW9uIFdhbGwob3B0aW9ucykge1xuICAgIHRoaXMub3B0aW9ucyA9IE9iamVjdC5jcmVhdGUoV2FsbC5ERUZBVUxUX09QVElPTlMpO1xuICAgIGlmIChvcHRpb25zKVxuICAgICAgICB0aGlzLnNldE9wdGlvbnMob3B0aW9ucyk7XG4gICAgdGhpcy5kaWZmID0gbmV3IFZlY3RvcigpO1xuICAgIHRoaXMuaW1wdWxzZSA9IG5ldyBWZWN0b3IoKTtcbiAgICBDb25zdHJhaW50LmNhbGwodGhpcyk7XG59XG5XYWxsLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoQ29uc3RyYWludC5wcm90b3R5cGUpO1xuV2FsbC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBXYWxsO1xuV2FsbC5PTl9DT05UQUNUID0ge1xuICAgIFJFRkxFQ1Q6IDAsXG4gICAgU0lMRU5UOiAxXG59O1xuV2FsbC5ERUZBVUxUX09QVElPTlMgPSB7XG4gICAgcmVzdGl0dXRpb246IDAuNSxcbiAgICBkcmlmdDogMC41LFxuICAgIHNsb3A6IDAsXG4gICAgbm9ybWFsOiBbXG4gICAgICAgIDEsXG4gICAgICAgIDAsXG4gICAgICAgIDBcbiAgICBdLFxuICAgIGRpc3RhbmNlOiAwLFxuICAgIG9uQ29udGFjdDogV2FsbC5PTl9DT05UQUNULlJFRkxFQ1Rcbn07XG5XYWxsLnByb3RvdHlwZS5zZXRPcHRpb25zID0gZnVuY3Rpb24gc2V0T3B0aW9ucyhvcHRpb25zKSB7XG4gICAgaWYgKG9wdGlvbnMubm9ybWFsICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgaWYgKG9wdGlvbnMubm9ybWFsIGluc3RhbmNlb2YgVmVjdG9yKVxuICAgICAgICAgICAgdGhpcy5vcHRpb25zLm5vcm1hbCA9IG9wdGlvbnMubm9ybWFsLmNsb25lKCk7XG4gICAgICAgIGlmIChvcHRpb25zLm5vcm1hbCBpbnN0YW5jZW9mIEFycmF5KVxuICAgICAgICAgICAgdGhpcy5vcHRpb25zLm5vcm1hbCA9IG5ldyBWZWN0b3Iob3B0aW9ucy5ub3JtYWwpO1xuICAgIH1cbiAgICBpZiAob3B0aW9ucy5yZXN0aXR1dGlvbiAhPT0gdW5kZWZpbmVkKVxuICAgICAgICB0aGlzLm9wdGlvbnMucmVzdGl0dXRpb24gPSBvcHRpb25zLnJlc3RpdHV0aW9uO1xuICAgIGlmIChvcHRpb25zLmRyaWZ0ICE9PSB1bmRlZmluZWQpXG4gICAgICAgIHRoaXMub3B0aW9ucy5kcmlmdCA9IG9wdGlvbnMuZHJpZnQ7XG4gICAgaWYgKG9wdGlvbnMuc2xvcCAhPT0gdW5kZWZpbmVkKVxuICAgICAgICB0aGlzLm9wdGlvbnMuc2xvcCA9IG9wdGlvbnMuc2xvcDtcbiAgICBpZiAob3B0aW9ucy5kaXN0YW5jZSAhPT0gdW5kZWZpbmVkKVxuICAgICAgICB0aGlzLm9wdGlvbnMuZGlzdGFuY2UgPSBvcHRpb25zLmRpc3RhbmNlO1xuICAgIGlmIChvcHRpb25zLm9uQ29udGFjdCAhPT0gdW5kZWZpbmVkKVxuICAgICAgICB0aGlzLm9wdGlvbnMub25Db250YWN0ID0gb3B0aW9ucy5vbkNvbnRhY3Q7XG59O1xuZnVuY3Rpb24gX2dldE5vcm1hbFZlbG9jaXR5KG4sIHYpIHtcbiAgICByZXR1cm4gdi5kb3Qobik7XG59XG5mdW5jdGlvbiBfZ2V0RGlzdGFuY2VGcm9tT3JpZ2luKHApIHtcbiAgICB2YXIgbiA9IHRoaXMub3B0aW9ucy5ub3JtYWw7XG4gICAgdmFyIGQgPSB0aGlzLm9wdGlvbnMuZGlzdGFuY2U7XG4gICAgcmV0dXJuIHAuZG90KG4pICsgZDtcbn1cbmZ1bmN0aW9uIF9vbkVudGVyKHBhcnRpY2xlLCBvdmVybGFwLCBkdCkge1xuICAgIHZhciBwID0gcGFydGljbGUucG9zaXRpb247XG4gICAgdmFyIHYgPSBwYXJ0aWNsZS52ZWxvY2l0eTtcbiAgICB2YXIgbSA9IHBhcnRpY2xlLm1hc3M7XG4gICAgdmFyIG4gPSB0aGlzLm9wdGlvbnMubm9ybWFsO1xuICAgIHZhciBhY3Rpb24gPSB0aGlzLm9wdGlvbnMub25Db250YWN0O1xuICAgIHZhciByZXN0aXR1dGlvbiA9IHRoaXMub3B0aW9ucy5yZXN0aXR1dGlvbjtcbiAgICB2YXIgaW1wdWxzZSA9IHRoaXMuaW1wdWxzZTtcbiAgICB2YXIgZHJpZnQgPSB0aGlzLm9wdGlvbnMuZHJpZnQ7XG4gICAgdmFyIHNsb3AgPSAtdGhpcy5vcHRpb25zLnNsb3A7XG4gICAgdmFyIGdhbW1hID0gMDtcbiAgICBpZiAodGhpcy5fZXZlbnRPdXRwdXQpIHtcbiAgICAgICAgdmFyIGRhdGEgPSB7XG4gICAgICAgICAgICAgICAgcGFydGljbGU6IHBhcnRpY2xlLFxuICAgICAgICAgICAgICAgIHdhbGw6IHRoaXMsXG4gICAgICAgICAgICAgICAgb3ZlcmxhcDogb3ZlcmxhcCxcbiAgICAgICAgICAgICAgICBub3JtYWw6IG5cbiAgICAgICAgICAgIH07XG4gICAgICAgIHRoaXMuX2V2ZW50T3V0cHV0LmVtaXQoJ3ByZUNvbGxpc2lvbicsIGRhdGEpO1xuICAgICAgICB0aGlzLl9ldmVudE91dHB1dC5lbWl0KCdjb2xsaXNpb24nLCBkYXRhKTtcbiAgICB9XG4gICAgc3dpdGNoIChhY3Rpb24pIHtcbiAgICBjYXNlIFdhbGwuT05fQ09OVEFDVC5SRUZMRUNUOlxuICAgICAgICB2YXIgbGFtYmRhID0gb3ZlcmxhcCA8IHNsb3AgPyAtKCgxICsgcmVzdGl0dXRpb24pICogbi5kb3QodikgKyBkcmlmdCAvIGR0ICogKG92ZXJsYXAgLSBzbG9wKSkgLyAobSAqIGR0ICsgZ2FtbWEpIDogLSgoMSArIHJlc3RpdHV0aW9uKSAqIG4uZG90KHYpKSAvIChtICogZHQgKyBnYW1tYSk7XG4gICAgICAgIGltcHVsc2Uuc2V0KG4ubXVsdChkdCAqIGxhbWJkYSkpO1xuICAgICAgICBwYXJ0aWNsZS5hcHBseUltcHVsc2UoaW1wdWxzZSk7XG4gICAgICAgIHBhcnRpY2xlLnNldFBvc2l0aW9uKHAuYWRkKG4ubXVsdCgtb3ZlcmxhcCkpKTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICAgIGlmICh0aGlzLl9ldmVudE91dHB1dClcbiAgICAgICAgdGhpcy5fZXZlbnRPdXRwdXQuZW1pdCgncG9zdENvbGxpc2lvbicsIGRhdGEpO1xufVxuZnVuY3Rpb24gX29uRXhpdChwYXJ0aWNsZSwgb3ZlcmxhcCwgZHQpIHtcbiAgICB2YXIgYWN0aW9uID0gdGhpcy5vcHRpb25zLm9uQ29udGFjdDtcbiAgICB2YXIgcCA9IHBhcnRpY2xlLnBvc2l0aW9uO1xuICAgIHZhciBuID0gdGhpcy5vcHRpb25zLm5vcm1hbDtcbiAgICBpZiAoYWN0aW9uID09PSBXYWxsLk9OX0NPTlRBQ1QuUkVGTEVDVCkge1xuICAgICAgICBwYXJ0aWNsZS5zZXRQb3NpdGlvbihwLmFkZChuLm11bHQoLW92ZXJsYXApKSk7XG4gICAgfVxufVxuV2FsbC5wcm90b3R5cGUuYXBwbHlDb25zdHJhaW50ID0gZnVuY3Rpb24gYXBwbHlDb25zdHJhaW50KHRhcmdldHMsIHNvdXJjZSwgZHQpIHtcbiAgICB2YXIgbiA9IHRoaXMub3B0aW9ucy5ub3JtYWw7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0YXJnZXRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBwYXJ0aWNsZSA9IHRhcmdldHNbaV07XG4gICAgICAgIHZhciBwID0gcGFydGljbGUucG9zaXRpb247XG4gICAgICAgIHZhciB2ID0gcGFydGljbGUudmVsb2NpdHk7XG4gICAgICAgIHZhciByID0gcGFydGljbGUucmFkaXVzIHx8IDA7XG4gICAgICAgIHZhciBvdmVybGFwID0gX2dldERpc3RhbmNlRnJvbU9yaWdpbi5jYWxsKHRoaXMsIHAuYWRkKG4ubXVsdCgtcikpKTtcbiAgICAgICAgdmFyIG52ID0gX2dldE5vcm1hbFZlbG9jaXR5LmNhbGwodGhpcywgbiwgdik7XG4gICAgICAgIGlmIChvdmVybGFwIDw9IDApIHtcbiAgICAgICAgICAgIGlmIChudiA8IDApXG4gICAgICAgICAgICAgICAgX29uRW50ZXIuY2FsbCh0aGlzLCBwYXJ0aWNsZSwgb3ZlcmxhcCwgZHQpO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIF9vbkV4aXQuY2FsbCh0aGlzLCBwYXJ0aWNsZSwgb3ZlcmxhcCwgZHQpO1xuICAgICAgICB9XG4gICAgfVxufTtcbm1vZHVsZS5leHBvcnRzID0gV2FsbDsiLCJ2YXIgQ29uc3RyYWludCA9IHJlcXVpcmUoJy4vQ29uc3RyYWludCcpO1xudmFyIFdhbGwgPSByZXF1aXJlKCcuL1dhbGwnKTtcbnZhciBWZWN0b3IgPSByZXF1aXJlKCcuLi8uLi9tYXRoL1ZlY3RvcicpO1xudmFyIFV0aWxpdHkgPSByZXF1aXJlKCcuLi8uLi91dGlsaXRpZXMvVXRpbGl0eScpO1xuZnVuY3Rpb24gV2FsbHMob3B0aW9ucykge1xuICAgIHRoaXMub3B0aW9ucyA9IFV0aWxpdHkuY2xvbmUodGhpcy5jb25zdHJ1Y3Rvci5ERUZBVUxUX09QVElPTlMgfHwgV2FsbHMuREVGQVVMVF9PUFRJT05TKTtcbiAgICBpZiAob3B0aW9ucylcbiAgICAgICAgdGhpcy5zZXRPcHRpb25zKG9wdGlvbnMpO1xuICAgIF9jcmVhdGVDb21wb25lbnRzLmNhbGwodGhpcywgdGhpcy5vcHRpb25zLnNpZGVzKTtcbiAgICBDb25zdHJhaW50LmNhbGwodGhpcyk7XG59XG5XYWxscy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKENvbnN0cmFpbnQucHJvdG90eXBlKTtcbldhbGxzLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFdhbGxzO1xuV2FsbHMuT05fQ09OVEFDVCA9IFdhbGwuT05fQ09OVEFDVDtcbldhbGxzLlNJREVTID0ge1xuICAgIExFRlQ6IDAsXG4gICAgUklHSFQ6IDEsXG4gICAgVE9QOiAyLFxuICAgIEJPVFRPTTogMyxcbiAgICBGUk9OVDogNCxcbiAgICBCQUNLOiA1LFxuICAgIFRXT19ESU1FTlNJT05BTDogW1xuICAgICAgICAwLFxuICAgICAgICAxLFxuICAgICAgICAyLFxuICAgICAgICAzXG4gICAgXSxcbiAgICBUSFJFRV9ESU1FTlNJT05BTDogW1xuICAgICAgICAwLFxuICAgICAgICAxLFxuICAgICAgICAyLFxuICAgICAgICAzLFxuICAgICAgICA0LFxuICAgICAgICA1XG4gICAgXVxufTtcbldhbGxzLkRFRkFVTFRfT1BUSU9OUyA9IHtcbiAgICBzaWRlczogV2FsbHMuU0lERVMuVFdPX0RJTUVOU0lPTkFMLFxuICAgIHNpemU6IFtcbiAgICAgICAgd2luZG93LmlubmVyV2lkdGgsXG4gICAgICAgIHdpbmRvdy5pbm5lckhlaWdodCxcbiAgICAgICAgMFxuICAgIF0sXG4gICAgb3JpZ2luOiBbXG4gICAgICAgIDAuNSxcbiAgICAgICAgMC41LFxuICAgICAgICAwLjVcbiAgICBdLFxuICAgIGRyaWZ0OiAwLjUsXG4gICAgc2xvcDogMCxcbiAgICByZXN0aXR1dGlvbjogMC41LFxuICAgIG9uQ29udGFjdDogV2FsbHMuT05fQ09OVEFDVC5SRUZMRUNUXG59O1xudmFyIF9TSURFX05PUk1BTFMgPSB7XG4gICAgICAgIDA6IG5ldyBWZWN0b3IoMSwgMCwgMCksXG4gICAgICAgIDE6IG5ldyBWZWN0b3IoLTEsIDAsIDApLFxuICAgICAgICAyOiBuZXcgVmVjdG9yKDAsIDEsIDApLFxuICAgICAgICAzOiBuZXcgVmVjdG9yKDAsIC0xLCAwKSxcbiAgICAgICAgNDogbmV3IFZlY3RvcigwLCAwLCAxKSxcbiAgICAgICAgNTogbmV3IFZlY3RvcigwLCAwLCAtMSlcbiAgICB9O1xuZnVuY3Rpb24gX2dldERpc3RhbmNlKHNpZGUsIHNpemUsIG9yaWdpbikge1xuICAgIHZhciBkaXN0YW5jZTtcbiAgICB2YXIgU0lERVMgPSBXYWxscy5TSURFUztcbiAgICBzd2l0Y2ggKHBhcnNlSW50KHNpZGUpKSB7XG4gICAgY2FzZSBTSURFUy5MRUZUOlxuICAgICAgICBkaXN0YW5jZSA9IHNpemVbMF0gKiBvcmlnaW5bMF07XG4gICAgICAgIGJyZWFrO1xuICAgIGNhc2UgU0lERVMuVE9QOlxuICAgICAgICBkaXN0YW5jZSA9IHNpemVbMV0gKiBvcmlnaW5bMV07XG4gICAgICAgIGJyZWFrO1xuICAgIGNhc2UgU0lERVMuRlJPTlQ6XG4gICAgICAgIGRpc3RhbmNlID0gc2l6ZVsyXSAqIG9yaWdpblsyXTtcbiAgICAgICAgYnJlYWs7XG4gICAgY2FzZSBTSURFUy5SSUdIVDpcbiAgICAgICAgZGlzdGFuY2UgPSBzaXplWzBdICogKDEgLSBvcmlnaW5bMF0pO1xuICAgICAgICBicmVhaztcbiAgICBjYXNlIFNJREVTLkJPVFRPTTpcbiAgICAgICAgZGlzdGFuY2UgPSBzaXplWzFdICogKDEgLSBvcmlnaW5bMV0pO1xuICAgICAgICBicmVhaztcbiAgICBjYXNlIFNJREVTLkJBQ0s6XG4gICAgICAgIGRpc3RhbmNlID0gc2l6ZVsyXSAqICgxIC0gb3JpZ2luWzJdKTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICAgIHJldHVybiBkaXN0YW5jZTtcbn1cbldhbGxzLnByb3RvdHlwZS5zZXRPcHRpb25zID0gZnVuY3Rpb24gc2V0T3B0aW9ucyhvcHRpb25zKSB7XG4gICAgdmFyIHJlc2l6ZUZsYWcgPSBmYWxzZTtcbiAgICBpZiAob3B0aW9ucy5yZXN0aXR1dGlvbiAhPT0gdW5kZWZpbmVkKVxuICAgICAgICBfc2V0T3B0aW9uc0ZvckVhY2guY2FsbCh0aGlzLCB7IHJlc3RpdHV0aW9uOiBvcHRpb25zLnJlc3RpdHV0aW9uIH0pO1xuICAgIGlmIChvcHRpb25zLmRyaWZ0ICE9PSB1bmRlZmluZWQpXG4gICAgICAgIF9zZXRPcHRpb25zRm9yRWFjaC5jYWxsKHRoaXMsIHsgZHJpZnQ6IG9wdGlvbnMuZHJpZnQgfSk7XG4gICAgaWYgKG9wdGlvbnMuc2xvcCAhPT0gdW5kZWZpbmVkKVxuICAgICAgICBfc2V0T3B0aW9uc0ZvckVhY2guY2FsbCh0aGlzLCB7IHNsb3A6IG9wdGlvbnMuc2xvcCB9KTtcbiAgICBpZiAob3B0aW9ucy5vbkNvbnRhY3QgIT09IHVuZGVmaW5lZClcbiAgICAgICAgX3NldE9wdGlvbnNGb3JFYWNoLmNhbGwodGhpcywgeyBvbkNvbnRhY3Q6IG9wdGlvbnMub25Db250YWN0IH0pO1xuICAgIGlmIChvcHRpb25zLnNpemUgIT09IHVuZGVmaW5lZClcbiAgICAgICAgcmVzaXplRmxhZyA9IHRydWU7XG4gICAgaWYgKG9wdGlvbnMuc2lkZXMgIT09IHVuZGVmaW5lZClcbiAgICAgICAgdGhpcy5vcHRpb25zLnNpZGVzID0gb3B0aW9ucy5zaWRlcztcbiAgICBpZiAob3B0aW9ucy5vcmlnaW4gIT09IHVuZGVmaW5lZClcbiAgICAgICAgcmVzaXplRmxhZyA9IHRydWU7XG4gICAgaWYgKHJlc2l6ZUZsYWcpXG4gICAgICAgIHRoaXMuc2V0U2l6ZShvcHRpb25zLnNpemUsIG9wdGlvbnMub3JpZ2luKTtcbn07XG5mdW5jdGlvbiBfY3JlYXRlQ29tcG9uZW50cyhzaWRlcykge1xuICAgIHRoaXMuY29tcG9uZW50cyA9IHt9O1xuICAgIHZhciBjb21wb25lbnRzID0gdGhpcy5jb21wb25lbnRzO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2lkZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIHNpZGUgPSBzaWRlc1tpXTtcbiAgICAgICAgY29tcG9uZW50c1tpXSA9IG5ldyBXYWxsKHtcbiAgICAgICAgICAgIG5vcm1hbDogX1NJREVfTk9STUFMU1tzaWRlXS5jbG9uZSgpLFxuICAgICAgICAgICAgZGlzdGFuY2U6IF9nZXREaXN0YW5jZShzaWRlLCB0aGlzLm9wdGlvbnMuc2l6ZSwgdGhpcy5vcHRpb25zLm9yaWdpbilcbiAgICAgICAgfSk7XG4gICAgfVxufVxuV2FsbHMucHJvdG90eXBlLnNldFNpemUgPSBmdW5jdGlvbiBzZXRTaXplKHNpemUsIG9yaWdpbikge1xuICAgIG9yaWdpbiA9IG9yaWdpbiB8fCB0aGlzLm9wdGlvbnMub3JpZ2luO1xuICAgIGlmIChvcmlnaW4ubGVuZ3RoIDwgMylcbiAgICAgICAgb3JpZ2luWzJdID0gMC41O1xuICAgIHRoaXMuZm9yRWFjaChmdW5jdGlvbiAod2FsbCwgc2lkZSkge1xuICAgICAgICB2YXIgZCA9IF9nZXREaXN0YW5jZShzaWRlLCBzaXplLCBvcmlnaW4pO1xuICAgICAgICB3YWxsLnNldE9wdGlvbnMoeyBkaXN0YW5jZTogZCB9KTtcbiAgICB9KTtcbiAgICB0aGlzLm9wdGlvbnMuc2l6ZSA9IHNpemU7XG4gICAgdGhpcy5vcHRpb25zLm9yaWdpbiA9IG9yaWdpbjtcbn07XG5mdW5jdGlvbiBfc2V0T3B0aW9uc0ZvckVhY2gob3B0aW9ucykge1xuICAgIHRoaXMuZm9yRWFjaChmdW5jdGlvbiAod2FsbCkge1xuICAgICAgICB3YWxsLnNldE9wdGlvbnMob3B0aW9ucyk7XG4gICAgfSk7XG4gICAgZm9yICh2YXIga2V5IGluIG9wdGlvbnMpXG4gICAgICAgIHRoaXMub3B0aW9uc1trZXldID0gb3B0aW9uc1trZXldO1xufVxuV2FsbHMucHJvdG90eXBlLmFwcGx5Q29uc3RyYWludCA9IGZ1bmN0aW9uIGFwcGx5Q29uc3RyYWludCh0YXJnZXRzLCBzb3VyY2UsIGR0KSB7XG4gICAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uICh3YWxsKSB7XG4gICAgICAgIHdhbGwuYXBwbHlDb25zdHJhaW50KHRhcmdldHMsIHNvdXJjZSwgZHQpO1xuICAgIH0pO1xufTtcbldhbGxzLnByb3RvdHlwZS5mb3JFYWNoID0gZnVuY3Rpb24gZm9yRWFjaChmbikge1xuICAgIHZhciBzaWRlcyA9IHRoaXMub3B0aW9ucy5zaWRlcztcbiAgICBmb3IgKHZhciBrZXkgaW4gdGhpcy5zaWRlcylcbiAgICAgICAgZm4oc2lkZXNba2V5XSwga2V5KTtcbn07XG5XYWxscy5wcm90b3R5cGUucm90YXRlWiA9IGZ1bmN0aW9uIHJvdGF0ZVooYW5nbGUpIHtcbiAgICB0aGlzLmZvckVhY2goZnVuY3Rpb24gKHdhbGwpIHtcbiAgICAgICAgdmFyIG4gPSB3YWxsLm9wdGlvbnMubm9ybWFsO1xuICAgICAgICBuLnJvdGF0ZVooYW5nbGUpLnB1dChuKTtcbiAgICB9KTtcbn07XG5XYWxscy5wcm90b3R5cGUucm90YXRlWCA9IGZ1bmN0aW9uIHJvdGF0ZVgoYW5nbGUpIHtcbiAgICB0aGlzLmZvckVhY2goZnVuY3Rpb24gKHdhbGwpIHtcbiAgICAgICAgdmFyIG4gPSB3YWxsLm9wdGlvbnMubm9ybWFsO1xuICAgICAgICBuLnJvdGF0ZVgoYW5nbGUpLnB1dChuKTtcbiAgICB9KTtcbn07XG5XYWxscy5wcm90b3R5cGUucm90YXRlWSA9IGZ1bmN0aW9uIHJvdGF0ZVkoYW5nbGUpIHtcbiAgICB0aGlzLmZvckVhY2goZnVuY3Rpb24gKHdhbGwpIHtcbiAgICAgICAgdmFyIG4gPSB3YWxsLm9wdGlvbnMubm9ybWFsO1xuICAgICAgICBuLnJvdGF0ZVkoYW5nbGUpLnB1dChuKTtcbiAgICB9KTtcbn07XG5tb2R1bGUuZXhwb3J0cyA9IFdhbGxzOyIsInZhciBGb3JjZSA9IHJlcXVpcmUoJy4vRm9yY2UnKTtcbmZ1bmN0aW9uIERyYWcob3B0aW9ucykge1xuICAgIHRoaXMub3B0aW9ucyA9IE9iamVjdC5jcmVhdGUodGhpcy5jb25zdHJ1Y3Rvci5ERUZBVUxUX09QVElPTlMpO1xuICAgIGlmIChvcHRpb25zKVxuICAgICAgICB0aGlzLnNldE9wdGlvbnMob3B0aW9ucyk7XG4gICAgRm9yY2UuY2FsbCh0aGlzKTtcbn1cbkRyYWcucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShGb3JjZS5wcm90b3R5cGUpO1xuRHJhZy5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBEcmFnO1xuRHJhZy5GT1JDRV9GVU5DVElPTlMgPSB7XG4gICAgTElORUFSOiBmdW5jdGlvbiAodmVsb2NpdHkpIHtcbiAgICAgICAgcmV0dXJuIHZlbG9jaXR5O1xuICAgIH0sXG4gICAgUVVBRFJBVElDOiBmdW5jdGlvbiAodmVsb2NpdHkpIHtcbiAgICAgICAgcmV0dXJuIHZlbG9jaXR5Lm11bHQodmVsb2NpdHkubm9ybSgpKTtcbiAgICB9XG59O1xuRHJhZy5ERUZBVUxUX09QVElPTlMgPSB7XG4gICAgc3RyZW5ndGg6IDAuMDEsXG4gICAgZm9yY2VGdW5jdGlvbjogRHJhZy5GT1JDRV9GVU5DVElPTlMuTElORUFSXG59O1xuRHJhZy5wcm90b3R5cGUuYXBwbHlGb3JjZSA9IGZ1bmN0aW9uIGFwcGx5Rm9yY2UodGFyZ2V0cykge1xuICAgIHZhciBzdHJlbmd0aCA9IHRoaXMub3B0aW9ucy5zdHJlbmd0aDtcbiAgICB2YXIgZm9yY2VGdW5jdGlvbiA9IHRoaXMub3B0aW9ucy5mb3JjZUZ1bmN0aW9uO1xuICAgIHZhciBmb3JjZSA9IHRoaXMuZm9yY2U7XG4gICAgdmFyIGluZGV4O1xuICAgIHZhciBwYXJ0aWNsZTtcbiAgICBmb3IgKGluZGV4ID0gMDsgaW5kZXggPCB0YXJnZXRzLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICBwYXJ0aWNsZSA9IHRhcmdldHNbaW5kZXhdO1xuICAgICAgICBmb3JjZUZ1bmN0aW9uKHBhcnRpY2xlLnZlbG9jaXR5KS5tdWx0KC1zdHJlbmd0aCkucHV0KGZvcmNlKTtcbiAgICAgICAgcGFydGljbGUuYXBwbHlGb3JjZShmb3JjZSk7XG4gICAgfVxufTtcbkRyYWcucHJvdG90eXBlLnNldE9wdGlvbnMgPSBmdW5jdGlvbiBzZXRPcHRpb25zKG9wdGlvbnMpIHtcbiAgICBmb3IgKHZhciBrZXkgaW4gb3B0aW9ucylcbiAgICAgICAgdGhpcy5vcHRpb25zW2tleV0gPSBvcHRpb25zW2tleV07XG59O1xubW9kdWxlLmV4cG9ydHMgPSBEcmFnOyIsInZhciBWZWN0b3IgPSByZXF1aXJlKCcuLi8uLi9tYXRoL1ZlY3RvcicpO1xudmFyIEV2ZW50SGFuZGxlciA9IHJlcXVpcmUoJy4uLy4uL2NvcmUvRXZlbnRIYW5kbGVyJyk7XG5mdW5jdGlvbiBGb3JjZShmb3JjZSkge1xuICAgIHRoaXMuZm9yY2UgPSBuZXcgVmVjdG9yKGZvcmNlKTtcbiAgICB0aGlzLl9ldmVudE91dHB1dCA9IG5ldyBFdmVudEhhbmRsZXIoKTtcbiAgICBFdmVudEhhbmRsZXIuc2V0T3V0cHV0SGFuZGxlcih0aGlzLCB0aGlzLl9ldmVudE91dHB1dCk7XG59XG5Gb3JjZS5wcm90b3R5cGUuc2V0T3B0aW9ucyA9IGZ1bmN0aW9uIHNldE9wdGlvbnMob3B0aW9ucykge1xuICAgIHRoaXMuX2V2ZW50T3V0cHV0LmVtaXQoJ2NoYW5nZScsIG9wdGlvbnMpO1xufTtcbkZvcmNlLnByb3RvdHlwZS5hcHBseUZvcmNlID0gZnVuY3Rpb24gYXBwbHlGb3JjZSh0YXJnZXRzKSB7XG4gICAgdmFyIGxlbmd0aCA9IHRhcmdldHMubGVuZ3RoO1xuICAgIHdoaWxlIChsZW5ndGgtLSkge1xuICAgICAgICB0YXJnZXRzW2xlbmd0aF0uYXBwbHlGb3JjZSh0aGlzLmZvcmNlKTtcbiAgICB9XG59O1xuRm9yY2UucHJvdG90eXBlLmdldEVuZXJneSA9IGZ1bmN0aW9uIGdldEVuZXJneSgpIHtcbiAgICByZXR1cm4gMDtcbn07XG5tb2R1bGUuZXhwb3J0cyA9IEZvcmNlOyIsInZhciBGb3JjZSA9IHJlcXVpcmUoJy4vRm9yY2UnKTtcbnZhciBWZWN0b3IgPSByZXF1aXJlKCcuLi8uLi9tYXRoL1ZlY3RvcicpO1xuZnVuY3Rpb24gUmVwdWxzaW9uKG9wdGlvbnMpIHtcbiAgICB0aGlzLm9wdGlvbnMgPSBPYmplY3QuY3JlYXRlKFJlcHVsc2lvbi5ERUZBVUxUX09QVElPTlMpO1xuICAgIGlmIChvcHRpb25zKVxuICAgICAgICB0aGlzLnNldE9wdGlvbnMob3B0aW9ucyk7XG4gICAgdGhpcy5kaXNwID0gbmV3IFZlY3RvcigpO1xuICAgIEZvcmNlLmNhbGwodGhpcyk7XG59XG5SZXB1bHNpb24ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShGb3JjZS5wcm90b3R5cGUpO1xuUmVwdWxzaW9uLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFJlcHVsc2lvbjtcblJlcHVsc2lvbi5ERUNBWV9GVU5DVElPTlMgPSB7XG4gICAgTElORUFSOiBmdW5jdGlvbiAociwgY3V0b2ZmKSB7XG4gICAgICAgIHJldHVybiBNYXRoLm1heCgxIC0gMSAvIGN1dG9mZiAqIHIsIDApO1xuICAgIH0sXG4gICAgTU9SU0U6IGZ1bmN0aW9uIChyLCBjdXRvZmYpIHtcbiAgICAgICAgdmFyIHIwID0gY3V0b2ZmID09PSAwID8gMTAwIDogY3V0b2ZmO1xuICAgICAgICB2YXIgclNoaWZ0ZWQgPSByICsgcjAgKiAoMSAtIE1hdGgubG9nKDIpKTtcbiAgICAgICAgcmV0dXJuIE1hdGgubWF4KDEgLSBNYXRoLnBvdygxIC0gTWF0aC5leHAoclNoaWZ0ZWQgLyByMCAtIDEpLCAyKSwgMCk7XG4gICAgfSxcbiAgICBJTlZFUlNFOiBmdW5jdGlvbiAociwgY3V0b2ZmKSB7XG4gICAgICAgIHJldHVybiAxIC8gKDEgLSBjdXRvZmYgKyByKTtcbiAgICB9LFxuICAgIEdSQVZJVFk6IGZ1bmN0aW9uIChyLCBjdXRvZmYpIHtcbiAgICAgICAgcmV0dXJuIDEgLyAoMSAtIGN1dG9mZiArIHIgKiByKTtcbiAgICB9XG59O1xuUmVwdWxzaW9uLkRFRkFVTFRfT1BUSU9OUyA9IHtcbiAgICBzdHJlbmd0aDogMSxcbiAgICBhbmNob3I6IHVuZGVmaW5lZCxcbiAgICByYW5nZTogW1xuICAgICAgICAwLFxuICAgICAgICBJbmZpbml0eVxuICAgIF0sXG4gICAgY3V0b2ZmOiAwLFxuICAgIGNhcDogSW5maW5pdHksXG4gICAgZGVjYXlGdW5jdGlvbjogUmVwdWxzaW9uLkRFQ0FZX0ZVTkNUSU9OUy5HUkFWSVRZXG59O1xuUmVwdWxzaW9uLnByb3RvdHlwZS5zZXRPcHRpb25zID0gZnVuY3Rpb24gc2V0T3B0aW9ucyhvcHRpb25zKSB7XG4gICAgaWYgKG9wdGlvbnMuYW5jaG9yICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgaWYgKG9wdGlvbnMuYW5jaG9yLnBvc2l0aW9uIGluc3RhbmNlb2YgVmVjdG9yKVxuICAgICAgICAgICAgdGhpcy5vcHRpb25zLmFuY2hvciA9IG9wdGlvbnMuYW5jaG9yLnBvc2l0aW9uO1xuICAgICAgICBpZiAob3B0aW9ucy5hbmNob3IgaW5zdGFuY2VvZiBBcnJheSlcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5hbmNob3IgPSBuZXcgVmVjdG9yKG9wdGlvbnMuYW5jaG9yKTtcbiAgICAgICAgZGVsZXRlIG9wdGlvbnMuYW5jaG9yO1xuICAgIH1cbiAgICBmb3IgKHZhciBrZXkgaW4gb3B0aW9ucylcbiAgICAgICAgdGhpcy5vcHRpb25zW2tleV0gPSBvcHRpb25zW2tleV07XG59O1xuUmVwdWxzaW9uLnByb3RvdHlwZS5hcHBseUZvcmNlID0gZnVuY3Rpb24gYXBwbHlGb3JjZSh0YXJnZXRzLCBzb3VyY2UpIHtcbiAgICB2YXIgb3B0aW9ucyA9IHRoaXMub3B0aW9ucztcbiAgICB2YXIgZm9yY2UgPSB0aGlzLmZvcmNlO1xuICAgIHZhciBkaXNwID0gdGhpcy5kaXNwO1xuICAgIHZhciBzdHJlbmd0aCA9IG9wdGlvbnMuc3RyZW5ndGg7XG4gICAgdmFyIGFuY2hvciA9IG9wdGlvbnMuYW5jaG9yIHx8IHNvdXJjZS5wb3NpdGlvbjtcbiAgICB2YXIgY2FwID0gb3B0aW9ucy5jYXA7XG4gICAgdmFyIGN1dG9mZiA9IG9wdGlvbnMuY3V0b2ZmO1xuICAgIHZhciByTWluID0gb3B0aW9ucy5yYW5nZVswXTtcbiAgICB2YXIgck1heCA9IG9wdGlvbnMucmFuZ2VbMV07XG4gICAgdmFyIGRlY2F5Rm4gPSBvcHRpb25zLmRlY2F5RnVuY3Rpb247XG4gICAgaWYgKHN0cmVuZ3RoID09PSAwKVxuICAgICAgICByZXR1cm47XG4gICAgdmFyIGxlbmd0aCA9IHRhcmdldHMubGVuZ3RoO1xuICAgIHZhciBwYXJ0aWNsZTtcbiAgICB2YXIgbTE7XG4gICAgdmFyIHAxO1xuICAgIHZhciByO1xuICAgIHdoaWxlIChsZW5ndGgtLSkge1xuICAgICAgICBwYXJ0aWNsZSA9IHRhcmdldHNbbGVuZ3RoXTtcbiAgICAgICAgaWYgKHBhcnRpY2xlID09PSBzb3VyY2UpXG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgbTEgPSBwYXJ0aWNsZS5tYXNzO1xuICAgICAgICBwMSA9IHBhcnRpY2xlLnBvc2l0aW9uO1xuICAgICAgICBkaXNwLnNldChwMS5zdWIoYW5jaG9yKSk7XG4gICAgICAgIHIgPSBkaXNwLm5vcm0oKTtcbiAgICAgICAgaWYgKHIgPCByTWF4ICYmIHIgPiByTWluKSB7XG4gICAgICAgICAgICBmb3JjZS5zZXQoZGlzcC5ub3JtYWxpemUoc3RyZW5ndGggKiBtMSAqIGRlY2F5Rm4ociwgY3V0b2ZmKSkuY2FwKGNhcCkpO1xuICAgICAgICAgICAgcGFydGljbGUuYXBwbHlGb3JjZShmb3JjZSk7XG4gICAgICAgIH1cbiAgICB9XG59O1xubW9kdWxlLmV4cG9ydHMgPSBSZXB1bHNpb247IiwidmFyIEZvcmNlID0gcmVxdWlyZSgnLi9Gb3JjZScpO1xudmFyIFZlY3RvciA9IHJlcXVpcmUoJy4uLy4uL21hdGgvVmVjdG9yJyk7XG5mdW5jdGlvbiBWZWN0b3JGaWVsZChvcHRpb25zKSB7XG4gICAgRm9yY2UuY2FsbCh0aGlzKTtcbiAgICB0aGlzLm9wdGlvbnMgPSBPYmplY3QuY3JlYXRlKFZlY3RvckZpZWxkLkRFRkFVTFRfT1BUSU9OUyk7XG4gICAgaWYgKG9wdGlvbnMpXG4gICAgICAgIHRoaXMuc2V0T3B0aW9ucyhvcHRpb25zKTtcbiAgICB0aGlzLmV2YWx1YXRpb24gPSBuZXcgVmVjdG9yKCk7XG59XG5WZWN0b3JGaWVsZC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEZvcmNlLnByb3RvdHlwZSk7XG5WZWN0b3JGaWVsZC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBWZWN0b3JGaWVsZDtcblZlY3RvckZpZWxkLkZJRUxEUyA9IHtcbiAgICBDT05TVEFOVDogZnVuY3Rpb24gKHYsIG9wdGlvbnMpIHtcbiAgICAgICAgb3B0aW9ucy5kaXJlY3Rpb24ucHV0KHRoaXMuZXZhbHVhdGlvbik7XG4gICAgfSxcbiAgICBMSU5FQVI6IGZ1bmN0aW9uICh2KSB7XG4gICAgICAgIHYucHV0KHRoaXMuZXZhbHVhdGlvbik7XG4gICAgfSxcbiAgICBSQURJQUw6IGZ1bmN0aW9uICh2KSB7XG4gICAgICAgIHYubXVsdCgtMSkucHV0KHRoaXMuZXZhbHVhdGlvbik7XG4gICAgfSxcbiAgICBQT0lOVF9BVFRSQUNUT1I6IGZ1bmN0aW9uICh2LCBvcHRpb25zKSB7XG4gICAgICAgIG9wdGlvbnMucG9zaXRpb24uc3ViKHYpLnB1dCh0aGlzLmV2YWx1YXRpb24pO1xuICAgIH1cbn07XG5WZWN0b3JGaWVsZC5ERUZBVUxUX09QVElPTlMgPSB7XG4gICAgc3RyZW5ndGg6IDAuMDEsXG4gICAgZmllbGQ6IFZlY3RvckZpZWxkLkZJRUxEUy5DT05TVEFOVFxufTtcblZlY3RvckZpZWxkLnByb3RvdHlwZS5zZXRPcHRpb25zID0gZnVuY3Rpb24gc2V0T3B0aW9ucyhvcHRpb25zKSB7XG4gICAgaWYgKG9wdGlvbnMuc3RyZW5ndGggIT09IHVuZGVmaW5lZClcbiAgICAgICAgdGhpcy5vcHRpb25zLnN0cmVuZ3RoID0gb3B0aW9ucy5zdHJlbmd0aDtcbiAgICBpZiAob3B0aW9ucy5maWVsZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHRoaXMub3B0aW9ucy5maWVsZCA9IG9wdGlvbnMuZmllbGQ7XG4gICAgICAgIF9zZXRGaWVsZE9wdGlvbnMuY2FsbCh0aGlzLCB0aGlzLm9wdGlvbnMuZmllbGQpO1xuICAgIH1cbn07XG5mdW5jdGlvbiBfc2V0RmllbGRPcHRpb25zKGZpZWxkKSB7XG4gICAgdmFyIEZJRUxEUyA9IFZlY3RvckZpZWxkLkZJRUxEUztcbiAgICBzd2l0Y2ggKGZpZWxkKSB7XG4gICAgY2FzZSBGSUVMRFMuQ09OU1RBTlQ6XG4gICAgICAgIGlmICghdGhpcy5vcHRpb25zLmRpcmVjdGlvbilcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5kaXJlY3Rpb24gPSBuZXcgVmVjdG9yKDAsIDEsIDApO1xuICAgICAgICBlbHNlIGlmICh0aGlzLm9wdGlvbnMuZGlyZWN0aW9uIGluc3RhbmNlb2YgQXJyYXkpXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMuZGlyZWN0aW9uID0gbmV3IFZlY3Rvcih0aGlzLm9wdGlvbnMuZGlyZWN0aW9uKTtcbiAgICAgICAgYnJlYWs7XG4gICAgY2FzZSBGSUVMRFMuUE9JTlRfQVRUUkFDVE9SOlxuICAgICAgICBpZiAoIXRoaXMub3B0aW9ucy5wb3NpdGlvbilcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5wb3NpdGlvbiA9IG5ldyBWZWN0b3IoMCwgMCwgMCk7XG4gICAgICAgIGVsc2UgaWYgKHRoaXMub3B0aW9ucy5wb3NpdGlvbiBpbnN0YW5jZW9mIEFycmF5KVxuICAgICAgICAgICAgdGhpcy5vcHRpb25zLnBvc2l0aW9uID0gbmV3IFZlY3Rvcih0aGlzLm9wdGlvbnMucG9zaXRpb24pO1xuICAgICAgICBicmVhaztcbiAgICB9XG59XG5WZWN0b3JGaWVsZC5wcm90b3R5cGUuYXBwbHlGb3JjZSA9IGZ1bmN0aW9uIGFwcGx5Rm9yY2UodGFyZ2V0cykge1xuICAgIHZhciBmb3JjZSA9IHRoaXMuZm9yY2U7XG4gICAgdmFyIHN0cmVuZ3RoID0gdGhpcy5vcHRpb25zLnN0cmVuZ3RoO1xuICAgIHZhciBmaWVsZCA9IHRoaXMub3B0aW9ucy5maWVsZDtcbiAgICB2YXIgaTtcbiAgICB2YXIgdGFyZ2V0O1xuICAgIGZvciAoaSA9IDA7IGkgPCB0YXJnZXRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHRhcmdldCA9IHRhcmdldHNbaV07XG4gICAgICAgIGZpZWxkLmNhbGwodGhpcywgdGFyZ2V0LnBvc2l0aW9uLCB0aGlzLm9wdGlvbnMpO1xuICAgICAgICB0aGlzLmV2YWx1YXRpb24ubXVsdCh0YXJnZXQubWFzcyAqIHN0cmVuZ3RoKS5wdXQoZm9yY2UpO1xuICAgICAgICB0YXJnZXQuYXBwbHlGb3JjZShmb3JjZSk7XG4gICAgfVxufTtcblZlY3RvckZpZWxkLnByb3RvdHlwZS5nZXRFbmVyZ3kgPSBmdW5jdGlvbiBnZXRFbmVyZ3kodGFyZ2V0cykge1xuICAgIHZhciBmaWVsZCA9IHRoaXMub3B0aW9ucy5maWVsZDtcbiAgICB2YXIgRklFTERTID0gVmVjdG9yRmllbGQuRklFTERTO1xuICAgIHZhciBlbmVyZ3kgPSAwO1xuICAgIHZhciBpO1xuICAgIHZhciB0YXJnZXQ7XG4gICAgc3dpdGNoIChmaWVsZCkge1xuICAgIGNhc2UgRklFTERTLkNPTlNUQU5UOlxuICAgICAgICBlbmVyZ3kgPSB0YXJnZXRzLmxlbmd0aCAqIHRoaXMub3B0aW9ucy5kaXJlY3Rpb24ubm9ybSgpO1xuICAgICAgICBicmVhaztcbiAgICBjYXNlIEZJRUxEUy5SQURJQUw6XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCB0YXJnZXRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB0YXJnZXQgPSB0YXJnZXRzW2ldO1xuICAgICAgICAgICAgZW5lcmd5ICs9IHRhcmdldC5wb3NpdGlvbi5ub3JtKCk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgY2FzZSBGSUVMRFMuUE9JTlRfQVRUUkFDVE9SOlxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgdGFyZ2V0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdGFyZ2V0ID0gdGFyZ2V0c1tpXTtcbiAgICAgICAgICAgIGVuZXJneSArPSB0YXJnZXQucG9zaXRpb24uc3ViKHRoaXMub3B0aW9ucy5wb3NpdGlvbikubm9ybSgpO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgICBlbmVyZ3kgKj0gdGhpcy5vcHRpb25zLnN0cmVuZ3RoO1xuICAgIHJldHVybiBlbmVyZ3k7XG59O1xubW9kdWxlLmV4cG9ydHMgPSBWZWN0b3JGaWVsZDsiLCJ2YXIgU3ltcGxlY3RpY0V1bGVyID0ge307XG5TeW1wbGVjdGljRXVsZXIuaW50ZWdyYXRlVmVsb2NpdHkgPSBmdW5jdGlvbiBpbnRlZ3JhdGVWZWxvY2l0eShib2R5LCBkdCkge1xuICAgIHZhciB2ID0gYm9keS52ZWxvY2l0eTtcbiAgICB2YXIgdyA9IGJvZHkuaW52ZXJzZU1hc3M7XG4gICAgdmFyIGYgPSBib2R5LmZvcmNlO1xuICAgIGlmIChmLmlzWmVybygpKVxuICAgICAgICByZXR1cm47XG4gICAgdi5hZGQoZi5tdWx0KGR0ICogdykpLnB1dCh2KTtcbiAgICBmLmNsZWFyKCk7XG59O1xuU3ltcGxlY3RpY0V1bGVyLmludGVncmF0ZVBvc2l0aW9uID0gZnVuY3Rpb24gaW50ZWdyYXRlUG9zaXRpb24oYm9keSwgZHQpIHtcbiAgICB2YXIgcCA9IGJvZHkucG9zaXRpb247XG4gICAgdmFyIHYgPSBib2R5LnZlbG9jaXR5O1xuICAgIHAuYWRkKHYubXVsdChkdCkpLnB1dChwKTtcbn07XG5TeW1wbGVjdGljRXVsZXIuaW50ZWdyYXRlQW5ndWxhck1vbWVudHVtID0gZnVuY3Rpb24gaW50ZWdyYXRlQW5ndWxhck1vbWVudHVtKGJvZHksIGR0KSB7XG4gICAgdmFyIEwgPSBib2R5LmFuZ3VsYXJNb21lbnR1bTtcbiAgICB2YXIgdCA9IGJvZHkudG9ycXVlO1xuICAgIGlmICh0LmlzWmVybygpKVxuICAgICAgICByZXR1cm47XG4gICAgTC5hZGQodC5tdWx0KGR0KSkucHV0KEwpO1xuICAgIHQuY2xlYXIoKTtcbn07XG5TeW1wbGVjdGljRXVsZXIuaW50ZWdyYXRlT3JpZW50YXRpb24gPSBmdW5jdGlvbiBpbnRlZ3JhdGVPcmllbnRhdGlvbihib2R5LCBkdCkge1xuICAgIHZhciBxID0gYm9keS5vcmllbnRhdGlvbjtcbiAgICB2YXIgdyA9IGJvZHkuYW5ndWxhclZlbG9jaXR5O1xuICAgIGlmICh3LmlzWmVybygpKVxuICAgICAgICByZXR1cm47XG4gICAgcS5hZGQocS5tdWx0aXBseSh3KS5zY2FsYXJNdWx0aXBseSgwLjUgKiBkdCkpLnB1dChxKTtcbn07XG5tb2R1bGUuZXhwb3J0cyA9IFN5bXBsZWN0aWNFdWxlcjsiLCJ2YXIgRWFzaW5nID0ge1xuICAgICAgICBpblF1YWQ6IGZ1bmN0aW9uICh0KSB7XG4gICAgICAgICAgICByZXR1cm4gdCAqIHQ7XG4gICAgICAgIH0sXG4gICAgICAgIG91dFF1YWQ6IGZ1bmN0aW9uICh0KSB7XG4gICAgICAgICAgICByZXR1cm4gLSh0IC09IDEpICogdCArIDE7XG4gICAgICAgIH0sXG4gICAgICAgIGluT3V0UXVhZDogZnVuY3Rpb24gKHQpIHtcbiAgICAgICAgICAgIGlmICgodCAvPSAwLjUpIDwgMSlcbiAgICAgICAgICAgICAgICByZXR1cm4gMC41ICogdCAqIHQ7XG4gICAgICAgICAgICByZXR1cm4gLTAuNSAqICgtLXQgKiAodCAtIDIpIC0gMSk7XG4gICAgICAgIH0sXG4gICAgICAgIGluQ3ViaWM6IGZ1bmN0aW9uICh0KSB7XG4gICAgICAgICAgICByZXR1cm4gdCAqIHQgKiB0O1xuICAgICAgICB9LFxuICAgICAgICBvdXRDdWJpYzogZnVuY3Rpb24gKHQpIHtcbiAgICAgICAgICAgIHJldHVybiAtLXQgKiB0ICogdCArIDE7XG4gICAgICAgIH0sXG4gICAgICAgIGluT3V0Q3ViaWM6IGZ1bmN0aW9uICh0KSB7XG4gICAgICAgICAgICBpZiAoKHQgLz0gMC41KSA8IDEpXG4gICAgICAgICAgICAgICAgcmV0dXJuIDAuNSAqIHQgKiB0ICogdDtcbiAgICAgICAgICAgIHJldHVybiAwLjUgKiAoKHQgLT0gMikgKiB0ICogdCArIDIpO1xuICAgICAgICB9LFxuICAgICAgICBpblF1YXJ0OiBmdW5jdGlvbiAodCkge1xuICAgICAgICAgICAgcmV0dXJuIHQgKiB0ICogdCAqIHQ7XG4gICAgICAgIH0sXG4gICAgICAgIG91dFF1YXJ0OiBmdW5jdGlvbiAodCkge1xuICAgICAgICAgICAgcmV0dXJuIC0oLS10ICogdCAqIHQgKiB0IC0gMSk7XG4gICAgICAgIH0sXG4gICAgICAgIGluT3V0UXVhcnQ6IGZ1bmN0aW9uICh0KSB7XG4gICAgICAgICAgICBpZiAoKHQgLz0gMC41KSA8IDEpXG4gICAgICAgICAgICAgICAgcmV0dXJuIDAuNSAqIHQgKiB0ICogdCAqIHQ7XG4gICAgICAgICAgICByZXR1cm4gLTAuNSAqICgodCAtPSAyKSAqIHQgKiB0ICogdCAtIDIpO1xuICAgICAgICB9LFxuICAgICAgICBpblF1aW50OiBmdW5jdGlvbiAodCkge1xuICAgICAgICAgICAgcmV0dXJuIHQgKiB0ICogdCAqIHQgKiB0O1xuICAgICAgICB9LFxuICAgICAgICBvdXRRdWludDogZnVuY3Rpb24gKHQpIHtcbiAgICAgICAgICAgIHJldHVybiAtLXQgKiB0ICogdCAqIHQgKiB0ICsgMTtcbiAgICAgICAgfSxcbiAgICAgICAgaW5PdXRRdWludDogZnVuY3Rpb24gKHQpIHtcbiAgICAgICAgICAgIGlmICgodCAvPSAwLjUpIDwgMSlcbiAgICAgICAgICAgICAgICByZXR1cm4gMC41ICogdCAqIHQgKiB0ICogdCAqIHQ7XG4gICAgICAgICAgICByZXR1cm4gMC41ICogKCh0IC09IDIpICogdCAqIHQgKiB0ICogdCArIDIpO1xuICAgICAgICB9LFxuICAgICAgICBpblNpbmU6IGZ1bmN0aW9uICh0KSB7XG4gICAgICAgICAgICByZXR1cm4gLTEgKiBNYXRoLmNvcyh0ICogKE1hdGguUEkgLyAyKSkgKyAxO1xuICAgICAgICB9LFxuICAgICAgICBvdXRTaW5lOiBmdW5jdGlvbiAodCkge1xuICAgICAgICAgICAgcmV0dXJuIE1hdGguc2luKHQgKiAoTWF0aC5QSSAvIDIpKTtcbiAgICAgICAgfSxcbiAgICAgICAgaW5PdXRTaW5lOiBmdW5jdGlvbiAodCkge1xuICAgICAgICAgICAgcmV0dXJuIC0wLjUgKiAoTWF0aC5jb3MoTWF0aC5QSSAqIHQpIC0gMSk7XG4gICAgICAgIH0sXG4gICAgICAgIGluRXhwbzogZnVuY3Rpb24gKHQpIHtcbiAgICAgICAgICAgIHJldHVybiB0ID09PSAwID8gMCA6IE1hdGgucG93KDIsIDEwICogKHQgLSAxKSk7XG4gICAgICAgIH0sXG4gICAgICAgIG91dEV4cG86IGZ1bmN0aW9uICh0KSB7XG4gICAgICAgICAgICByZXR1cm4gdCA9PT0gMSA/IDEgOiAtTWF0aC5wb3coMiwgLTEwICogdCkgKyAxO1xuICAgICAgICB9LFxuICAgICAgICBpbk91dEV4cG86IGZ1bmN0aW9uICh0KSB7XG4gICAgICAgICAgICBpZiAodCA9PT0gMClcbiAgICAgICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgICAgIGlmICh0ID09PSAxKVxuICAgICAgICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICAgICAgaWYgKCh0IC89IDAuNSkgPCAxKVxuICAgICAgICAgICAgICAgIHJldHVybiAwLjUgKiBNYXRoLnBvdygyLCAxMCAqICh0IC0gMSkpO1xuICAgICAgICAgICAgcmV0dXJuIDAuNSAqICgtTWF0aC5wb3coMiwgLTEwICogLS10KSArIDIpO1xuICAgICAgICB9LFxuICAgICAgICBpbkNpcmM6IGZ1bmN0aW9uICh0KSB7XG4gICAgICAgICAgICByZXR1cm4gLShNYXRoLnNxcnQoMSAtIHQgKiB0KSAtIDEpO1xuICAgICAgICB9LFxuICAgICAgICBvdXRDaXJjOiBmdW5jdGlvbiAodCkge1xuICAgICAgICAgICAgcmV0dXJuIE1hdGguc3FydCgxIC0gLS10ICogdCk7XG4gICAgICAgIH0sXG4gICAgICAgIGluT3V0Q2lyYzogZnVuY3Rpb24gKHQpIHtcbiAgICAgICAgICAgIGlmICgodCAvPSAwLjUpIDwgMSlcbiAgICAgICAgICAgICAgICByZXR1cm4gLTAuNSAqIChNYXRoLnNxcnQoMSAtIHQgKiB0KSAtIDEpO1xuICAgICAgICAgICAgcmV0dXJuIDAuNSAqIChNYXRoLnNxcnQoMSAtICh0IC09IDIpICogdCkgKyAxKTtcbiAgICAgICAgfSxcbiAgICAgICAgaW5FbGFzdGljOiBmdW5jdGlvbiAodCkge1xuICAgICAgICAgICAgdmFyIHMgPSAxLjcwMTU4O1xuICAgICAgICAgICAgdmFyIHAgPSAwO1xuICAgICAgICAgICAgdmFyIGEgPSAxO1xuICAgICAgICAgICAgaWYgKHQgPT09IDApXG4gICAgICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgICAgICBpZiAodCA9PT0gMSlcbiAgICAgICAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgICAgIGlmICghcClcbiAgICAgICAgICAgICAgICBwID0gMC4zO1xuICAgICAgICAgICAgcyA9IHAgLyAoMiAqIE1hdGguUEkpICogTWF0aC5hc2luKDEgLyBhKTtcbiAgICAgICAgICAgIHJldHVybiAtKGEgKiBNYXRoLnBvdygyLCAxMCAqICh0IC09IDEpKSAqIE1hdGguc2luKCh0IC0gcykgKiAoMiAqIE1hdGguUEkpIC8gcCkpO1xuICAgICAgICB9LFxuICAgICAgICBvdXRFbGFzdGljOiBmdW5jdGlvbiAodCkge1xuICAgICAgICAgICAgdmFyIHMgPSAxLjcwMTU4O1xuICAgICAgICAgICAgdmFyIHAgPSAwO1xuICAgICAgICAgICAgdmFyIGEgPSAxO1xuICAgICAgICAgICAgaWYgKHQgPT09IDApXG4gICAgICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgICAgICBpZiAodCA9PT0gMSlcbiAgICAgICAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgICAgIGlmICghcClcbiAgICAgICAgICAgICAgICBwID0gMC4zO1xuICAgICAgICAgICAgcyA9IHAgLyAoMiAqIE1hdGguUEkpICogTWF0aC5hc2luKDEgLyBhKTtcbiAgICAgICAgICAgIHJldHVybiBhICogTWF0aC5wb3coMiwgLTEwICogdCkgKiBNYXRoLnNpbigodCAtIHMpICogKDIgKiBNYXRoLlBJKSAvIHApICsgMTtcbiAgICAgICAgfSxcbiAgICAgICAgaW5PdXRFbGFzdGljOiBmdW5jdGlvbiAodCkge1xuICAgICAgICAgICAgdmFyIHMgPSAxLjcwMTU4O1xuICAgICAgICAgICAgdmFyIHAgPSAwO1xuICAgICAgICAgICAgdmFyIGEgPSAxO1xuICAgICAgICAgICAgaWYgKHQgPT09IDApXG4gICAgICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgICAgICBpZiAoKHQgLz0gMC41KSA9PT0gMilcbiAgICAgICAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgICAgIGlmICghcClcbiAgICAgICAgICAgICAgICBwID0gMC4zICogMS41O1xuICAgICAgICAgICAgcyA9IHAgLyAoMiAqIE1hdGguUEkpICogTWF0aC5hc2luKDEgLyBhKTtcbiAgICAgICAgICAgIGlmICh0IDwgMSlcbiAgICAgICAgICAgICAgICByZXR1cm4gLTAuNSAqIChhICogTWF0aC5wb3coMiwgMTAgKiAodCAtPSAxKSkgKiBNYXRoLnNpbigodCAtIHMpICogKDIgKiBNYXRoLlBJKSAvIHApKTtcbiAgICAgICAgICAgIHJldHVybiBhICogTWF0aC5wb3coMiwgLTEwICogKHQgLT0gMSkpICogTWF0aC5zaW4oKHQgLSBzKSAqICgyICogTWF0aC5QSSkgLyBwKSAqIDAuNSArIDE7XG4gICAgICAgIH0sXG4gICAgICAgIGluQmFjazogZnVuY3Rpb24gKHQsIHMpIHtcbiAgICAgICAgICAgIGlmIChzID09PSB1bmRlZmluZWQpXG4gICAgICAgICAgICAgICAgcyA9IDEuNzAxNTg7XG4gICAgICAgICAgICByZXR1cm4gdCAqIHQgKiAoKHMgKyAxKSAqIHQgLSBzKTtcbiAgICAgICAgfSxcbiAgICAgICAgb3V0QmFjazogZnVuY3Rpb24gKHQsIHMpIHtcbiAgICAgICAgICAgIGlmIChzID09PSB1bmRlZmluZWQpXG4gICAgICAgICAgICAgICAgcyA9IDEuNzAxNTg7XG4gICAgICAgICAgICByZXR1cm4gLS10ICogdCAqICgocyArIDEpICogdCArIHMpICsgMTtcbiAgICAgICAgfSxcbiAgICAgICAgaW5PdXRCYWNrOiBmdW5jdGlvbiAodCwgcykge1xuICAgICAgICAgICAgaWYgKHMgPT09IHVuZGVmaW5lZClcbiAgICAgICAgICAgICAgICBzID0gMS43MDE1ODtcbiAgICAgICAgICAgIGlmICgodCAvPSAwLjUpIDwgMSlcbiAgICAgICAgICAgICAgICByZXR1cm4gMC41ICogKHQgKiB0ICogKCgocyAqPSAxLjUyNSkgKyAxKSAqIHQgLSBzKSk7XG4gICAgICAgICAgICByZXR1cm4gMC41ICogKCh0IC09IDIpICogdCAqICgoKHMgKj0gMS41MjUpICsgMSkgKiB0ICsgcykgKyAyKTtcbiAgICAgICAgfSxcbiAgICAgICAgaW5Cb3VuY2U6IGZ1bmN0aW9uICh0KSB7XG4gICAgICAgICAgICByZXR1cm4gMSAtIEVhc2luZy5vdXRCb3VuY2UoMSAtIHQpO1xuICAgICAgICB9LFxuICAgICAgICBvdXRCb3VuY2U6IGZ1bmN0aW9uICh0KSB7XG4gICAgICAgICAgICBpZiAodCA8IDEgLyAyLjc1KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDcuNTYyNSAqIHQgKiB0O1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0IDwgMiAvIDIuNzUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gNy41NjI1ICogKHQgLT0gMS41IC8gMi43NSkgKiB0ICsgMC43NTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodCA8IDIuNSAvIDIuNzUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gNy41NjI1ICogKHQgLT0gMi4yNSAvIDIuNzUpICogdCArIDAuOTM3NTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDcuNTYyNSAqICh0IC09IDIuNjI1IC8gMi43NSkgKiB0ICsgMC45ODQzNzU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGluT3V0Qm91bmNlOiBmdW5jdGlvbiAodCkge1xuICAgICAgICAgICAgaWYgKHQgPCAwLjUpXG4gICAgICAgICAgICAgICAgcmV0dXJuIEVhc2luZy5pbkJvdW5jZSh0ICogMikgKiAwLjU7XG4gICAgICAgICAgICByZXR1cm4gRWFzaW5nLm91dEJvdW5jZSh0ICogMiAtIDEpICogMC41ICsgMC41O1xuICAgICAgICB9XG4gICAgfTtcbm1vZHVsZS5leHBvcnRzID0gRWFzaW5nOyIsInZhciBVdGlsaXR5ID0gcmVxdWlyZSgnLi4vdXRpbGl0aWVzL1V0aWxpdHknKTtcbmZ1bmN0aW9uIE11bHRpcGxlVHJhbnNpdGlvbihtZXRob2QpIHtcbiAgICB0aGlzLm1ldGhvZCA9IG1ldGhvZDtcbiAgICB0aGlzLl9pbnN0YW5jZXMgPSBbXTtcbiAgICB0aGlzLnN0YXRlID0gW107XG59XG5NdWx0aXBsZVRyYW5zaXRpb24uU1VQUE9SVFNfTVVMVElQTEUgPSB0cnVlO1xuTXVsdGlwbGVUcmFuc2l0aW9uLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbiBnZXQoKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLl9pbnN0YW5jZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdGhpcy5zdGF0ZVtpXSA9IHRoaXMuX2luc3RhbmNlc1tpXS5nZXQoKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuc3RhdGU7XG59O1xuTXVsdGlwbGVUcmFuc2l0aW9uLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbiBzZXQoZW5kU3RhdGUsIHRyYW5zaXRpb24sIGNhbGxiYWNrKSB7XG4gICAgdmFyIF9hbGxDYWxsYmFjayA9IFV0aWxpdHkuYWZ0ZXIoZW5kU3RhdGUubGVuZ3RoLCBjYWxsYmFjayk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBlbmRTdGF0ZS5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoIXRoaXMuX2luc3RhbmNlc1tpXSlcbiAgICAgICAgICAgIHRoaXMuX2luc3RhbmNlc1tpXSA9IG5ldyB0aGlzLm1ldGhvZCgpO1xuICAgICAgICB0aGlzLl9pbnN0YW5jZXNbaV0uc2V0KGVuZFN0YXRlW2ldLCB0cmFuc2l0aW9uLCBfYWxsQ2FsbGJhY2spO1xuICAgIH1cbn07XG5NdWx0aXBsZVRyYW5zaXRpb24ucHJvdG90eXBlLnJlc2V0ID0gZnVuY3Rpb24gcmVzZXQoc3RhcnRTdGF0ZSkge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc3RhcnRTdGF0ZS5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoIXRoaXMuX2luc3RhbmNlc1tpXSlcbiAgICAgICAgICAgIHRoaXMuX2luc3RhbmNlc1tpXSA9IG5ldyB0aGlzLm1ldGhvZCgpO1xuICAgICAgICB0aGlzLl9pbnN0YW5jZXNbaV0ucmVzZXQoc3RhcnRTdGF0ZVtpXSk7XG4gICAgfVxufTtcbm1vZHVsZS5leHBvcnRzID0gTXVsdGlwbGVUcmFuc2l0aW9uOyIsInZhciBNdWx0aXBsZVRyYW5zaXRpb24gPSByZXF1aXJlKCcuL011bHRpcGxlVHJhbnNpdGlvbicpO1xudmFyIFR3ZWVuVHJhbnNpdGlvbiA9IHJlcXVpcmUoJy4vVHdlZW5UcmFuc2l0aW9uJyk7XG5mdW5jdGlvbiBUcmFuc2l0aW9uYWJsZShzdGFydCkge1xuICAgIHRoaXMuY3VycmVudEFjdGlvbiA9IG51bGw7XG4gICAgdGhpcy5hY3Rpb25RdWV1ZSA9IFtdO1xuICAgIHRoaXMuY2FsbGJhY2tRdWV1ZSA9IFtdO1xuICAgIHRoaXMuc3RhdGUgPSAwO1xuICAgIHRoaXMudmVsb2NpdHkgPSB1bmRlZmluZWQ7XG4gICAgdGhpcy5fY2FsbGJhY2sgPSB1bmRlZmluZWQ7XG4gICAgdGhpcy5fZW5naW5lSW5zdGFuY2UgPSBudWxsO1xuICAgIHRoaXMuX2N1cnJlbnRNZXRob2QgPSBudWxsO1xuICAgIHRoaXMuc2V0KHN0YXJ0KTtcbn1cbnZhciB0cmFuc2l0aW9uTWV0aG9kcyA9IHt9O1xuVHJhbnNpdGlvbmFibGUucmVnaXN0ZXIgPSBmdW5jdGlvbiByZWdpc3RlcihtZXRob2RzKSB7XG4gICAgdmFyIHN1Y2Nlc3MgPSB0cnVlO1xuICAgIGZvciAodmFyIG1ldGhvZCBpbiBtZXRob2RzKSB7XG4gICAgICAgIGlmICghVHJhbnNpdGlvbmFibGUucmVnaXN0ZXJNZXRob2QobWV0aG9kLCBtZXRob2RzW21ldGhvZF0pKVxuICAgICAgICAgICAgc3VjY2VzcyA9IGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gc3VjY2Vzcztcbn07XG5UcmFuc2l0aW9uYWJsZS5yZWdpc3Rlck1ldGhvZCA9IGZ1bmN0aW9uIHJlZ2lzdGVyTWV0aG9kKG5hbWUsIGVuZ2luZUNsYXNzKSB7XG4gICAgaWYgKCEobmFtZSBpbiB0cmFuc2l0aW9uTWV0aG9kcykpIHtcbiAgICAgICAgdHJhbnNpdGlvbk1ldGhvZHNbbmFtZV0gPSBlbmdpbmVDbGFzcztcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBlbHNlXG4gICAgICAgIHJldHVybiBmYWxzZTtcbn07XG5UcmFuc2l0aW9uYWJsZS51bnJlZ2lzdGVyTWV0aG9kID0gZnVuY3Rpb24gdW5yZWdpc3Rlck1ldGhvZChuYW1lKSB7XG4gICAgaWYgKG5hbWUgaW4gdHJhbnNpdGlvbk1ldGhvZHMpIHtcbiAgICAgICAgZGVsZXRlIHRyYW5zaXRpb25NZXRob2RzW25hbWVdO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGVsc2VcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xufTtcbmZ1bmN0aW9uIF9sb2FkTmV4dCgpIHtcbiAgICBpZiAodGhpcy5fY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIGNhbGxiYWNrID0gdGhpcy5fY2FsbGJhY2s7XG4gICAgICAgIHRoaXMuX2NhbGxiYWNrID0gdW5kZWZpbmVkO1xuICAgICAgICBjYWxsYmFjaygpO1xuICAgIH1cbiAgICBpZiAodGhpcy5hY3Rpb25RdWV1ZS5sZW5ndGggPD0gMCkge1xuICAgICAgICB0aGlzLnNldCh0aGlzLmdldCgpKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLmN1cnJlbnRBY3Rpb24gPSB0aGlzLmFjdGlvblF1ZXVlLnNoaWZ0KCk7XG4gICAgdGhpcy5fY2FsbGJhY2sgPSB0aGlzLmNhbGxiYWNrUXVldWUuc2hpZnQoKTtcbiAgICB2YXIgbWV0aG9kID0gbnVsbDtcbiAgICB2YXIgZW5kVmFsdWUgPSB0aGlzLmN1cnJlbnRBY3Rpb25bMF07XG4gICAgdmFyIHRyYW5zaXRpb24gPSB0aGlzLmN1cnJlbnRBY3Rpb25bMV07XG4gICAgaWYgKHRyYW5zaXRpb24gaW5zdGFuY2VvZiBPYmplY3QgJiYgdHJhbnNpdGlvbi5tZXRob2QpIHtcbiAgICAgICAgbWV0aG9kID0gdHJhbnNpdGlvbi5tZXRob2Q7XG4gICAgICAgIGlmICh0eXBlb2YgbWV0aG9kID09PSAnc3RyaW5nJylcbiAgICAgICAgICAgIG1ldGhvZCA9IHRyYW5zaXRpb25NZXRob2RzW21ldGhvZF07XG4gICAgfSBlbHNlIHtcbiAgICAgICAgbWV0aG9kID0gVHdlZW5UcmFuc2l0aW9uO1xuICAgIH1cbiAgICBpZiAodGhpcy5fY3VycmVudE1ldGhvZCAhPT0gbWV0aG9kKSB7XG4gICAgICAgIGlmICghKGVuZFZhbHVlIGluc3RhbmNlb2YgT2JqZWN0KSB8fCBtZXRob2QuU1VQUE9SVFNfTVVMVElQTEUgPT09IHRydWUgfHwgZW5kVmFsdWUubGVuZ3RoIDw9IG1ldGhvZC5TVVBQT1JUU19NVUxUSVBMRSkge1xuICAgICAgICAgICAgdGhpcy5fZW5naW5lSW5zdGFuY2UgPSBuZXcgbWV0aG9kKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9lbmdpbmVJbnN0YW5jZSA9IG5ldyBNdWx0aXBsZVRyYW5zaXRpb24obWV0aG9kKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9jdXJyZW50TWV0aG9kID0gbWV0aG9kO1xuICAgIH1cbiAgICB0aGlzLl9lbmdpbmVJbnN0YW5jZS5yZXNldCh0aGlzLnN0YXRlLCB0aGlzLnZlbG9jaXR5KTtcbiAgICBpZiAodGhpcy52ZWxvY2l0eSAhPT0gdW5kZWZpbmVkKVxuICAgICAgICB0cmFuc2l0aW9uLnZlbG9jaXR5ID0gdGhpcy52ZWxvY2l0eTtcbiAgICB0aGlzLl9lbmdpbmVJbnN0YW5jZS5zZXQoZW5kVmFsdWUsIHRyYW5zaXRpb24sIF9sb2FkTmV4dC5iaW5kKHRoaXMpKTtcbn1cblRyYW5zaXRpb25hYmxlLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbiBzZXQoZW5kU3RhdGUsIHRyYW5zaXRpb24sIGNhbGxiYWNrKSB7XG4gICAgaWYgKCF0cmFuc2l0aW9uKSB7XG4gICAgICAgIHRoaXMucmVzZXQoZW5kU3RhdGUpO1xuICAgICAgICBpZiAoY2FsbGJhY2spXG4gICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgdmFyIGFjdGlvbiA9IFtcbiAgICAgICAgICAgIGVuZFN0YXRlLFxuICAgICAgICAgICAgdHJhbnNpdGlvblxuICAgICAgICBdO1xuICAgIHRoaXMuYWN0aW9uUXVldWUucHVzaChhY3Rpb24pO1xuICAgIHRoaXMuY2FsbGJhY2tRdWV1ZS5wdXNoKGNhbGxiYWNrKTtcbiAgICBpZiAoIXRoaXMuY3VycmVudEFjdGlvbilcbiAgICAgICAgX2xvYWROZXh0LmNhbGwodGhpcyk7XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuVHJhbnNpdGlvbmFibGUucHJvdG90eXBlLnJlc2V0ID0gZnVuY3Rpb24gcmVzZXQoc3RhcnRTdGF0ZSwgc3RhcnRWZWxvY2l0eSkge1xuICAgIHRoaXMuX2N1cnJlbnRNZXRob2QgPSBudWxsO1xuICAgIHRoaXMuX2VuZ2luZUluc3RhbmNlID0gbnVsbDtcbiAgICB0aGlzLl9jYWxsYmFjayA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLnN0YXRlID0gc3RhcnRTdGF0ZTtcbiAgICB0aGlzLnZlbG9jaXR5ID0gc3RhcnRWZWxvY2l0eTtcbiAgICB0aGlzLmN1cnJlbnRBY3Rpb24gPSBudWxsO1xuICAgIHRoaXMuYWN0aW9uUXVldWUgPSBbXTtcbiAgICB0aGlzLmNhbGxiYWNrUXVldWUgPSBbXTtcbn07XG5UcmFuc2l0aW9uYWJsZS5wcm90b3R5cGUuZGVsYXkgPSBmdW5jdGlvbiBkZWxheShkdXJhdGlvbiwgY2FsbGJhY2spIHtcbiAgICB0aGlzLnNldCh0aGlzLmdldCgpLCB7XG4gICAgICAgIGR1cmF0aW9uOiBkdXJhdGlvbixcbiAgICAgICAgY3VydmU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICB9XG4gICAgfSwgY2FsbGJhY2spO1xufTtcblRyYW5zaXRpb25hYmxlLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbiBnZXQodGltZXN0YW1wKSB7XG4gICAgaWYgKHRoaXMuX2VuZ2luZUluc3RhbmNlKSB7XG4gICAgICAgIGlmICh0aGlzLl9lbmdpbmVJbnN0YW5jZS5nZXRWZWxvY2l0eSlcbiAgICAgICAgICAgIHRoaXMudmVsb2NpdHkgPSB0aGlzLl9lbmdpbmVJbnN0YW5jZS5nZXRWZWxvY2l0eSgpO1xuICAgICAgICB0aGlzLnN0YXRlID0gdGhpcy5fZW5naW5lSW5zdGFuY2UuZ2V0KHRpbWVzdGFtcCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnN0YXRlO1xufTtcblRyYW5zaXRpb25hYmxlLnByb3RvdHlwZS5pc0FjdGl2ZSA9IGZ1bmN0aW9uIGlzQWN0aXZlKCkge1xuICAgIHJldHVybiAhIXRoaXMuY3VycmVudEFjdGlvbjtcbn07XG5UcmFuc2l0aW9uYWJsZS5wcm90b3R5cGUuaGFsdCA9IGZ1bmN0aW9uIGhhbHQoKSB7XG4gICAgcmV0dXJuIHRoaXMuc2V0KHRoaXMuZ2V0KCkpO1xufTtcbm1vZHVsZS5leHBvcnRzID0gVHJhbnNpdGlvbmFibGU7IiwidmFyIFRyYW5zaXRpb25hYmxlID0gcmVxdWlyZSgnLi9UcmFuc2l0aW9uYWJsZScpO1xudmFyIFRyYW5zZm9ybSA9IHJlcXVpcmUoJy4uL2NvcmUvVHJhbnNmb3JtJyk7XG52YXIgVXRpbGl0eSA9IHJlcXVpcmUoJy4uL3V0aWxpdGllcy9VdGlsaXR5Jyk7XG5mdW5jdGlvbiBUcmFuc2l0aW9uYWJsZVRyYW5zZm9ybSh0cmFuc2Zvcm0pIHtcbiAgICB0aGlzLl9maW5hbCA9IFRyYW5zZm9ybS5pZGVudGl0eS5zbGljZSgpO1xuICAgIHRoaXMuX2ZpbmFsVHJhbnNsYXRlID0gW1xuICAgICAgICAwLFxuICAgICAgICAwLFxuICAgICAgICAwXG4gICAgXTtcbiAgICB0aGlzLl9maW5hbFJvdGF0ZSA9IFtcbiAgICAgICAgMCxcbiAgICAgICAgMCxcbiAgICAgICAgMFxuICAgIF07XG4gICAgdGhpcy5fZmluYWxTa2V3ID0gW1xuICAgICAgICAwLFxuICAgICAgICAwLFxuICAgICAgICAwXG4gICAgXTtcbiAgICB0aGlzLl9maW5hbFNjYWxlID0gW1xuICAgICAgICAxLFxuICAgICAgICAxLFxuICAgICAgICAxXG4gICAgXTtcbiAgICB0aGlzLnRyYW5zbGF0ZSA9IG5ldyBUcmFuc2l0aW9uYWJsZSh0aGlzLl9maW5hbFRyYW5zbGF0ZSk7XG4gICAgdGhpcy5yb3RhdGUgPSBuZXcgVHJhbnNpdGlvbmFibGUodGhpcy5fZmluYWxSb3RhdGUpO1xuICAgIHRoaXMuc2tldyA9IG5ldyBUcmFuc2l0aW9uYWJsZSh0aGlzLl9maW5hbFNrZXcpO1xuICAgIHRoaXMuc2NhbGUgPSBuZXcgVHJhbnNpdGlvbmFibGUodGhpcy5fZmluYWxTY2FsZSk7XG4gICAgaWYgKHRyYW5zZm9ybSlcbiAgICAgICAgdGhpcy5zZXQodHJhbnNmb3JtKTtcbn1cbmZ1bmN0aW9uIF9idWlsZCgpIHtcbiAgICByZXR1cm4gVHJhbnNmb3JtLmJ1aWxkKHtcbiAgICAgICAgdHJhbnNsYXRlOiB0aGlzLnRyYW5zbGF0ZS5nZXQoKSxcbiAgICAgICAgcm90YXRlOiB0aGlzLnJvdGF0ZS5nZXQoKSxcbiAgICAgICAgc2tldzogdGhpcy5za2V3LmdldCgpLFxuICAgICAgICBzY2FsZTogdGhpcy5zY2FsZS5nZXQoKVxuICAgIH0pO1xufVxuZnVuY3Rpb24gX2J1aWxkRmluYWwoKSB7XG4gICAgcmV0dXJuIFRyYW5zZm9ybS5idWlsZCh7XG4gICAgICAgIHRyYW5zbGF0ZTogdGhpcy5fZmluYWxUcmFuc2xhdGUsXG4gICAgICAgIHJvdGF0ZTogdGhpcy5fZmluYWxSb3RhdGUsXG4gICAgICAgIHNrZXc6IHRoaXMuX2ZpbmFsU2tldyxcbiAgICAgICAgc2NhbGU6IHRoaXMuX2ZpbmFsU2NhbGVcbiAgICB9KTtcbn1cblRyYW5zaXRpb25hYmxlVHJhbnNmb3JtLnByb3RvdHlwZS5zZXRUcmFuc2xhdGUgPSBmdW5jdGlvbiBzZXRUcmFuc2xhdGUodHJhbnNsYXRlLCB0cmFuc2l0aW9uLCBjYWxsYmFjaykge1xuICAgIHRoaXMuX2ZpbmFsVHJhbnNsYXRlID0gdHJhbnNsYXRlO1xuICAgIHRoaXMuX2ZpbmFsID0gX2J1aWxkRmluYWwuY2FsbCh0aGlzKTtcbiAgICB0aGlzLnRyYW5zbGF0ZS5zZXQodHJhbnNsYXRlLCB0cmFuc2l0aW9uLCBjYWxsYmFjayk7XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuVHJhbnNpdGlvbmFibGVUcmFuc2Zvcm0ucHJvdG90eXBlLnNldFNjYWxlID0gZnVuY3Rpb24gc2V0U2NhbGUoc2NhbGUsIHRyYW5zaXRpb24sIGNhbGxiYWNrKSB7XG4gICAgdGhpcy5fZmluYWxTY2FsZSA9IHNjYWxlO1xuICAgIHRoaXMuX2ZpbmFsID0gX2J1aWxkRmluYWwuY2FsbCh0aGlzKTtcbiAgICB0aGlzLnNjYWxlLnNldChzY2FsZSwgdHJhbnNpdGlvbiwgY2FsbGJhY2spO1xuICAgIHJldHVybiB0aGlzO1xufTtcblRyYW5zaXRpb25hYmxlVHJhbnNmb3JtLnByb3RvdHlwZS5zZXRSb3RhdGUgPSBmdW5jdGlvbiBzZXRSb3RhdGUoZXVsZXJBbmdsZXMsIHRyYW5zaXRpb24sIGNhbGxiYWNrKSB7XG4gICAgdGhpcy5fZmluYWxSb3RhdGUgPSBldWxlckFuZ2xlcztcbiAgICB0aGlzLl9maW5hbCA9IF9idWlsZEZpbmFsLmNhbGwodGhpcyk7XG4gICAgdGhpcy5yb3RhdGUuc2V0KGV1bGVyQW5nbGVzLCB0cmFuc2l0aW9uLCBjYWxsYmFjayk7XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuVHJhbnNpdGlvbmFibGVUcmFuc2Zvcm0ucHJvdG90eXBlLnNldFNrZXcgPSBmdW5jdGlvbiBzZXRTa2V3KHNrZXdBbmdsZXMsIHRyYW5zaXRpb24sIGNhbGxiYWNrKSB7XG4gICAgdGhpcy5fZmluYWxTa2V3ID0gc2tld0FuZ2xlcztcbiAgICB0aGlzLl9maW5hbCA9IF9idWlsZEZpbmFsLmNhbGwodGhpcyk7XG4gICAgdGhpcy5za2V3LnNldChza2V3QW5nbGVzLCB0cmFuc2l0aW9uLCBjYWxsYmFjayk7XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuVHJhbnNpdGlvbmFibGVUcmFuc2Zvcm0ucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uIHNldCh0cmFuc2Zvcm0sIHRyYW5zaXRpb24sIGNhbGxiYWNrKSB7XG4gICAgdmFyIGNvbXBvbmVudHMgPSBUcmFuc2Zvcm0uaW50ZXJwcmV0KHRyYW5zZm9ybSk7XG4gICAgdGhpcy5fZmluYWxUcmFuc2xhdGUgPSBjb21wb25lbnRzLnRyYW5zbGF0ZTtcbiAgICB0aGlzLl9maW5hbFJvdGF0ZSA9IGNvbXBvbmVudHMucm90YXRlO1xuICAgIHRoaXMuX2ZpbmFsU2tldyA9IGNvbXBvbmVudHMuc2tldztcbiAgICB0aGlzLl9maW5hbFNjYWxlID0gY29tcG9uZW50cy5zY2FsZTtcbiAgICB0aGlzLl9maW5hbCA9IHRyYW5zZm9ybTtcbiAgICB2YXIgX2NhbGxiYWNrID0gY2FsbGJhY2sgPyBVdGlsaXR5LmFmdGVyKDQsIGNhbGxiYWNrKSA6IG51bGw7XG4gICAgdGhpcy50cmFuc2xhdGUuc2V0KGNvbXBvbmVudHMudHJhbnNsYXRlLCB0cmFuc2l0aW9uLCBfY2FsbGJhY2spO1xuICAgIHRoaXMucm90YXRlLnNldChjb21wb25lbnRzLnJvdGF0ZSwgdHJhbnNpdGlvbiwgX2NhbGxiYWNrKTtcbiAgICB0aGlzLnNrZXcuc2V0KGNvbXBvbmVudHMuc2tldywgdHJhbnNpdGlvbiwgX2NhbGxiYWNrKTtcbiAgICB0aGlzLnNjYWxlLnNldChjb21wb25lbnRzLnNjYWxlLCB0cmFuc2l0aW9uLCBfY2FsbGJhY2spO1xuICAgIHJldHVybiB0aGlzO1xufTtcblRyYW5zaXRpb25hYmxlVHJhbnNmb3JtLnByb3RvdHlwZS5zZXREZWZhdWx0VHJhbnNpdGlvbiA9IGZ1bmN0aW9uIHNldERlZmF1bHRUcmFuc2l0aW9uKHRyYW5zaXRpb24pIHtcbiAgICB0aGlzLnRyYW5zbGF0ZS5zZXREZWZhdWx0KHRyYW5zaXRpb24pO1xuICAgIHRoaXMucm90YXRlLnNldERlZmF1bHQodHJhbnNpdGlvbik7XG4gICAgdGhpcy5za2V3LnNldERlZmF1bHQodHJhbnNpdGlvbik7XG4gICAgdGhpcy5zY2FsZS5zZXREZWZhdWx0KHRyYW5zaXRpb24pO1xufTtcblRyYW5zaXRpb25hYmxlVHJhbnNmb3JtLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbiBnZXQoKSB7XG4gICAgaWYgKHRoaXMuaXNBY3RpdmUoKSkge1xuICAgICAgICByZXR1cm4gX2J1aWxkLmNhbGwodGhpcyk7XG4gICAgfSBlbHNlXG4gICAgICAgIHJldHVybiB0aGlzLl9maW5hbDtcbn07XG5UcmFuc2l0aW9uYWJsZVRyYW5zZm9ybS5wcm90b3R5cGUuZ2V0RmluYWwgPSBmdW5jdGlvbiBnZXRGaW5hbCgpIHtcbiAgICByZXR1cm4gdGhpcy5fZmluYWw7XG59O1xuVHJhbnNpdGlvbmFibGVUcmFuc2Zvcm0ucHJvdG90eXBlLmlzQWN0aXZlID0gZnVuY3Rpb24gaXNBY3RpdmUoKSB7XG4gICAgcmV0dXJuIHRoaXMudHJhbnNsYXRlLmlzQWN0aXZlKCkgfHwgdGhpcy5yb3RhdGUuaXNBY3RpdmUoKSB8fCB0aGlzLnNjYWxlLmlzQWN0aXZlKCkgfHwgdGhpcy5za2V3LmlzQWN0aXZlKCk7XG59O1xuVHJhbnNpdGlvbmFibGVUcmFuc2Zvcm0ucHJvdG90eXBlLmhhbHQgPSBmdW5jdGlvbiBoYWx0KCkge1xuICAgIHRoaXMudHJhbnNsYXRlLmhhbHQoKTtcbiAgICB0aGlzLnJvdGF0ZS5oYWx0KCk7XG4gICAgdGhpcy5za2V3LmhhbHQoKTtcbiAgICB0aGlzLnNjYWxlLmhhbHQoKTtcbiAgICB0aGlzLl9maW5hbCA9IHRoaXMuZ2V0KCk7XG4gICAgdGhpcy5fZmluYWxUcmFuc2xhdGUgPSB0aGlzLnRyYW5zbGF0ZS5nZXQoKTtcbiAgICB0aGlzLl9maW5hbFJvdGF0ZSA9IHRoaXMucm90YXRlLmdldCgpO1xuICAgIHRoaXMuX2ZpbmFsU2tldyA9IHRoaXMuc2tldy5nZXQoKTtcbiAgICB0aGlzLl9maW5hbFNjYWxlID0gdGhpcy5zY2FsZS5nZXQoKTtcbiAgICByZXR1cm4gdGhpcztcbn07XG5tb2R1bGUuZXhwb3J0cyA9IFRyYW5zaXRpb25hYmxlVHJhbnNmb3JtOyIsImZ1bmN0aW9uIFR3ZWVuVHJhbnNpdGlvbihvcHRpb25zKSB7XG4gICAgdGhpcy5vcHRpb25zID0gT2JqZWN0LmNyZWF0ZShUd2VlblRyYW5zaXRpb24uREVGQVVMVF9PUFRJT05TKTtcbiAgICBpZiAob3B0aW9ucylcbiAgICAgICAgdGhpcy5zZXRPcHRpb25zKG9wdGlvbnMpO1xuICAgIHRoaXMuX3N0YXJ0VGltZSA9IDA7XG4gICAgdGhpcy5fc3RhcnRWYWx1ZSA9IDA7XG4gICAgdGhpcy5fdXBkYXRlVGltZSA9IDA7XG4gICAgdGhpcy5fZW5kVmFsdWUgPSAwO1xuICAgIHRoaXMuX2N1cnZlID0gdW5kZWZpbmVkO1xuICAgIHRoaXMuX2R1cmF0aW9uID0gMDtcbiAgICB0aGlzLl9hY3RpdmUgPSBmYWxzZTtcbiAgICB0aGlzLl9jYWxsYmFjayA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLnN0YXRlID0gMDtcbiAgICB0aGlzLnZlbG9jaXR5ID0gdW5kZWZpbmVkO1xufVxuVHdlZW5UcmFuc2l0aW9uLkN1cnZlcyA9IHtcbiAgICBsaW5lYXI6IGZ1bmN0aW9uICh0KSB7XG4gICAgICAgIHJldHVybiB0O1xuICAgIH0sXG4gICAgZWFzZUluOiBmdW5jdGlvbiAodCkge1xuICAgICAgICByZXR1cm4gdCAqIHQ7XG4gICAgfSxcbiAgICBlYXNlT3V0OiBmdW5jdGlvbiAodCkge1xuICAgICAgICByZXR1cm4gdCAqICgyIC0gdCk7XG4gICAgfSxcbiAgICBlYXNlSW5PdXQ6IGZ1bmN0aW9uICh0KSB7XG4gICAgICAgIGlmICh0IDw9IDAuNSlcbiAgICAgICAgICAgIHJldHVybiAyICogdCAqIHQ7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJldHVybiAtMiAqIHQgKiB0ICsgNCAqIHQgLSAxO1xuICAgIH0sXG4gICAgZWFzZU91dEJvdW5jZTogZnVuY3Rpb24gKHQpIHtcbiAgICAgICAgcmV0dXJuIHQgKiAoMyAtIDIgKiB0KTtcbiAgICB9LFxuICAgIHNwcmluZzogZnVuY3Rpb24gKHQpIHtcbiAgICAgICAgcmV0dXJuICgxIC0gdCkgKiBNYXRoLnNpbig2ICogTWF0aC5QSSAqIHQpICsgdDtcbiAgICB9XG59O1xuVHdlZW5UcmFuc2l0aW9uLlNVUFBPUlRTX01VTFRJUExFID0gdHJ1ZTtcblR3ZWVuVHJhbnNpdGlvbi5ERUZBVUxUX09QVElPTlMgPSB7XG4gICAgY3VydmU6IFR3ZWVuVHJhbnNpdGlvbi5DdXJ2ZXMubGluZWFyLFxuICAgIGR1cmF0aW9uOiA1MDAsXG4gICAgc3BlZWQ6IDBcbn07XG52YXIgcmVnaXN0ZXJlZEN1cnZlcyA9IHt9O1xuVHdlZW5UcmFuc2l0aW9uLnJlZ2lzdGVyQ3VydmUgPSBmdW5jdGlvbiByZWdpc3RlckN1cnZlKGN1cnZlTmFtZSwgY3VydmUpIHtcbiAgICBpZiAoIXJlZ2lzdGVyZWRDdXJ2ZXNbY3VydmVOYW1lXSkge1xuICAgICAgICByZWdpc3RlcmVkQ3VydmVzW2N1cnZlTmFtZV0gPSBjdXJ2ZTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn07XG5Ud2VlblRyYW5zaXRpb24udW5yZWdpc3RlckN1cnZlID0gZnVuY3Rpb24gdW5yZWdpc3RlckN1cnZlKGN1cnZlTmFtZSkge1xuICAgIGlmIChyZWdpc3RlcmVkQ3VydmVzW2N1cnZlTmFtZV0pIHtcbiAgICAgICAgZGVsZXRlIHJlZ2lzdGVyZWRDdXJ2ZXNbY3VydmVOYW1lXTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn07XG5Ud2VlblRyYW5zaXRpb24uZ2V0Q3VydmUgPSBmdW5jdGlvbiBnZXRDdXJ2ZShjdXJ2ZU5hbWUpIHtcbiAgICB2YXIgY3VydmUgPSByZWdpc3RlcmVkQ3VydmVzW2N1cnZlTmFtZV07XG4gICAgaWYgKGN1cnZlICE9PSB1bmRlZmluZWQpXG4gICAgICAgIHJldHVybiBjdXJ2ZTtcbiAgICBlbHNlXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignY3VydmUgbm90IHJlZ2lzdGVyZWQnKTtcbn07XG5Ud2VlblRyYW5zaXRpb24uZ2V0Q3VydmVzID0gZnVuY3Rpb24gZ2V0Q3VydmVzKCkge1xuICAgIHJldHVybiByZWdpc3RlcmVkQ3VydmVzO1xufTtcbmZ1bmN0aW9uIF9pbnRlcnBvbGF0ZShhLCBiLCB0KSB7XG4gICAgcmV0dXJuICgxIC0gdCkgKiBhICsgdCAqIGI7XG59XG5mdW5jdGlvbiBfY2xvbmUob2JqKSB7XG4gICAgaWYgKG9iaiBpbnN0YW5jZW9mIE9iamVjdCkge1xuICAgICAgICBpZiAob2JqIGluc3RhbmNlb2YgQXJyYXkpXG4gICAgICAgICAgICByZXR1cm4gb2JqLnNsaWNlKDApO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXR1cm4gT2JqZWN0LmNyZWF0ZShvYmopO1xuICAgIH0gZWxzZVxuICAgICAgICByZXR1cm4gb2JqO1xufVxuZnVuY3Rpb24gX25vcm1hbGl6ZSh0cmFuc2l0aW9uLCBkZWZhdWx0VHJhbnNpdGlvbikge1xuICAgIHZhciByZXN1bHQgPSB7IGN1cnZlOiBkZWZhdWx0VHJhbnNpdGlvbi5jdXJ2ZSB9O1xuICAgIGlmIChkZWZhdWx0VHJhbnNpdGlvbi5kdXJhdGlvbilcbiAgICAgICAgcmVzdWx0LmR1cmF0aW9uID0gZGVmYXVsdFRyYW5zaXRpb24uZHVyYXRpb247XG4gICAgaWYgKGRlZmF1bHRUcmFuc2l0aW9uLnNwZWVkKVxuICAgICAgICByZXN1bHQuc3BlZWQgPSBkZWZhdWx0VHJhbnNpdGlvbi5zcGVlZDtcbiAgICBpZiAodHJhbnNpdGlvbiBpbnN0YW5jZW9mIE9iamVjdCkge1xuICAgICAgICBpZiAodHJhbnNpdGlvbi5kdXJhdGlvbiAhPT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgcmVzdWx0LmR1cmF0aW9uID0gdHJhbnNpdGlvbi5kdXJhdGlvbjtcbiAgICAgICAgaWYgKHRyYW5zaXRpb24uY3VydmUpXG4gICAgICAgICAgICByZXN1bHQuY3VydmUgPSB0cmFuc2l0aW9uLmN1cnZlO1xuICAgICAgICBpZiAodHJhbnNpdGlvbi5zcGVlZClcbiAgICAgICAgICAgIHJlc3VsdC5zcGVlZCA9IHRyYW5zaXRpb24uc3BlZWQ7XG4gICAgfVxuICAgIGlmICh0eXBlb2YgcmVzdWx0LmN1cnZlID09PSAnc3RyaW5nJylcbiAgICAgICAgcmVzdWx0LmN1cnZlID0gVHdlZW5UcmFuc2l0aW9uLmdldEN1cnZlKHJlc3VsdC5jdXJ2ZSk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblR3ZWVuVHJhbnNpdGlvbi5wcm90b3R5cGUuc2V0T3B0aW9ucyA9IGZ1bmN0aW9uIHNldE9wdGlvbnMob3B0aW9ucykge1xuICAgIGlmIChvcHRpb25zLmN1cnZlICE9PSB1bmRlZmluZWQpXG4gICAgICAgIHRoaXMub3B0aW9ucy5jdXJ2ZSA9IG9wdGlvbnMuY3VydmU7XG4gICAgaWYgKG9wdGlvbnMuZHVyYXRpb24gIT09IHVuZGVmaW5lZClcbiAgICAgICAgdGhpcy5vcHRpb25zLmR1cmF0aW9uID0gb3B0aW9ucy5kdXJhdGlvbjtcbiAgICBpZiAob3B0aW9ucy5zcGVlZCAhPT0gdW5kZWZpbmVkKVxuICAgICAgICB0aGlzLm9wdGlvbnMuc3BlZWQgPSBvcHRpb25zLnNwZWVkO1xufTtcblR3ZWVuVHJhbnNpdGlvbi5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24gc2V0KGVuZFZhbHVlLCB0cmFuc2l0aW9uLCBjYWxsYmFjaykge1xuICAgIGlmICghdHJhbnNpdGlvbikge1xuICAgICAgICB0aGlzLnJlc2V0KGVuZFZhbHVlKTtcbiAgICAgICAgaWYgKGNhbGxiYWNrKVxuICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLl9zdGFydFZhbHVlID0gX2Nsb25lKHRoaXMuZ2V0KCkpO1xuICAgIHRyYW5zaXRpb24gPSBfbm9ybWFsaXplKHRyYW5zaXRpb24sIHRoaXMub3B0aW9ucyk7XG4gICAgaWYgKHRyYW5zaXRpb24uc3BlZWQpIHtcbiAgICAgICAgdmFyIHN0YXJ0VmFsdWUgPSB0aGlzLl9zdGFydFZhbHVlO1xuICAgICAgICBpZiAoc3RhcnRWYWx1ZSBpbnN0YW5jZW9mIE9iamVjdCkge1xuICAgICAgICAgICAgdmFyIHZhcmlhbmNlID0gMDtcbiAgICAgICAgICAgIGZvciAodmFyIGkgaW4gc3RhcnRWYWx1ZSlcbiAgICAgICAgICAgICAgICB2YXJpYW5jZSArPSAoZW5kVmFsdWVbaV0gLSBzdGFydFZhbHVlW2ldKSAqIChlbmRWYWx1ZVtpXSAtIHN0YXJ0VmFsdWVbaV0pO1xuICAgICAgICAgICAgdHJhbnNpdGlvbi5kdXJhdGlvbiA9IE1hdGguc3FydCh2YXJpYW5jZSkgLyB0cmFuc2l0aW9uLnNwZWVkO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdHJhbnNpdGlvbi5kdXJhdGlvbiA9IE1hdGguYWJzKGVuZFZhbHVlIC0gc3RhcnRWYWx1ZSkgLyB0cmFuc2l0aW9uLnNwZWVkO1xuICAgICAgICB9XG4gICAgfVxuICAgIHRoaXMuX3N0YXJ0VGltZSA9IERhdGUubm93KCk7XG4gICAgdGhpcy5fZW5kVmFsdWUgPSBfY2xvbmUoZW5kVmFsdWUpO1xuICAgIHRoaXMuX3N0YXJ0VmVsb2NpdHkgPSBfY2xvbmUodHJhbnNpdGlvbi52ZWxvY2l0eSk7XG4gICAgdGhpcy5fZHVyYXRpb24gPSB0cmFuc2l0aW9uLmR1cmF0aW9uO1xuICAgIHRoaXMuX2N1cnZlID0gdHJhbnNpdGlvbi5jdXJ2ZTtcbiAgICB0aGlzLl9hY3RpdmUgPSB0cnVlO1xuICAgIHRoaXMuX2NhbGxiYWNrID0gY2FsbGJhY2s7XG59O1xuVHdlZW5UcmFuc2l0aW9uLnByb3RvdHlwZS5yZXNldCA9IGZ1bmN0aW9uIHJlc2V0KHN0YXJ0VmFsdWUsIHN0YXJ0VmVsb2NpdHkpIHtcbiAgICBpZiAodGhpcy5fY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIGNhbGxiYWNrID0gdGhpcy5fY2FsbGJhY2s7XG4gICAgICAgIHRoaXMuX2NhbGxiYWNrID0gdW5kZWZpbmVkO1xuICAgICAgICBjYWxsYmFjaygpO1xuICAgIH1cbiAgICB0aGlzLnN0YXRlID0gX2Nsb25lKHN0YXJ0VmFsdWUpO1xuICAgIHRoaXMudmVsb2NpdHkgPSBfY2xvbmUoc3RhcnRWZWxvY2l0eSk7XG4gICAgdGhpcy5fc3RhcnRUaW1lID0gMDtcbiAgICB0aGlzLl9kdXJhdGlvbiA9IDA7XG4gICAgdGhpcy5fdXBkYXRlVGltZSA9IDA7XG4gICAgdGhpcy5fc3RhcnRWYWx1ZSA9IHRoaXMuc3RhdGU7XG4gICAgdGhpcy5fc3RhcnRWZWxvY2l0eSA9IHRoaXMudmVsb2NpdHk7XG4gICAgdGhpcy5fZW5kVmFsdWUgPSB0aGlzLnN0YXRlO1xuICAgIHRoaXMuX2FjdGl2ZSA9IGZhbHNlO1xufTtcblR3ZWVuVHJhbnNpdGlvbi5wcm90b3R5cGUuZ2V0VmVsb2NpdHkgPSBmdW5jdGlvbiBnZXRWZWxvY2l0eSgpIHtcbiAgICByZXR1cm4gdGhpcy52ZWxvY2l0eTtcbn07XG5Ud2VlblRyYW5zaXRpb24ucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uIGdldCh0aW1lc3RhbXApIHtcbiAgICB0aGlzLnVwZGF0ZSh0aW1lc3RhbXApO1xuICAgIHJldHVybiB0aGlzLnN0YXRlO1xufTtcbmZ1bmN0aW9uIF9jYWxjdWxhdGVWZWxvY2l0eShjdXJyZW50LCBzdGFydCwgY3VydmUsIGR1cmF0aW9uLCB0KSB7XG4gICAgdmFyIHZlbG9jaXR5O1xuICAgIHZhciBlcHMgPSAxZS03O1xuICAgIHZhciBzcGVlZCA9IChjdXJ2ZSh0KSAtIGN1cnZlKHQgLSBlcHMpKSAvIGVwcztcbiAgICBpZiAoY3VycmVudCBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICAgIHZlbG9jaXR5ID0gW107XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY3VycmVudC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBjdXJyZW50W2ldID09PSAnbnVtYmVyJylcbiAgICAgICAgICAgICAgICB2ZWxvY2l0eVtpXSA9IHNwZWVkICogKGN1cnJlbnRbaV0gLSBzdGFydFtpXSkgLyBkdXJhdGlvbjtcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICB2ZWxvY2l0eVtpXSA9IDA7XG4gICAgICAgIH1cbiAgICB9IGVsc2VcbiAgICAgICAgdmVsb2NpdHkgPSBzcGVlZCAqIChjdXJyZW50IC0gc3RhcnQpIC8gZHVyYXRpb247XG4gICAgcmV0dXJuIHZlbG9jaXR5O1xufVxuZnVuY3Rpb24gX2NhbGN1bGF0ZVN0YXRlKHN0YXJ0LCBlbmQsIHQpIHtcbiAgICB2YXIgc3RhdGU7XG4gICAgaWYgKHN0YXJ0IGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgICAgc3RhdGUgPSBbXTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdGFydC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBzdGFydFtpXSA9PT0gJ251bWJlcicpXG4gICAgICAgICAgICAgICAgc3RhdGVbaV0gPSBfaW50ZXJwb2xhdGUoc3RhcnRbaV0sIGVuZFtpXSwgdCk7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgc3RhdGVbaV0gPSBzdGFydFtpXTtcbiAgICAgICAgfVxuICAgIH0gZWxzZVxuICAgICAgICBzdGF0ZSA9IF9pbnRlcnBvbGF0ZShzdGFydCwgZW5kLCB0KTtcbiAgICByZXR1cm4gc3RhdGU7XG59XG5Ud2VlblRyYW5zaXRpb24ucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uIHVwZGF0ZSh0aW1lc3RhbXApIHtcbiAgICBpZiAoIXRoaXMuX2FjdGl2ZSkge1xuICAgICAgICBpZiAodGhpcy5fY2FsbGJhY2spIHtcbiAgICAgICAgICAgIHZhciBjYWxsYmFjayA9IHRoaXMuX2NhbGxiYWNrO1xuICAgICAgICAgICAgdGhpcy5fY2FsbGJhY2sgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKCF0aW1lc3RhbXApXG4gICAgICAgIHRpbWVzdGFtcCA9IERhdGUubm93KCk7XG4gICAgaWYgKHRoaXMuX3VwZGF0ZVRpbWUgPj0gdGltZXN0YW1wKVxuICAgICAgICByZXR1cm47XG4gICAgdGhpcy5fdXBkYXRlVGltZSA9IHRpbWVzdGFtcDtcbiAgICB2YXIgdGltZVNpbmNlU3RhcnQgPSB0aW1lc3RhbXAgLSB0aGlzLl9zdGFydFRpbWU7XG4gICAgaWYgKHRpbWVTaW5jZVN0YXJ0ID49IHRoaXMuX2R1cmF0aW9uKSB7XG4gICAgICAgIHRoaXMuc3RhdGUgPSB0aGlzLl9lbmRWYWx1ZTtcbiAgICAgICAgdGhpcy52ZWxvY2l0eSA9IF9jYWxjdWxhdGVWZWxvY2l0eSh0aGlzLnN0YXRlLCB0aGlzLl9zdGFydFZhbHVlLCB0aGlzLl9jdXJ2ZSwgdGhpcy5fZHVyYXRpb24sIDEpO1xuICAgICAgICB0aGlzLl9hY3RpdmUgPSBmYWxzZTtcbiAgICB9IGVsc2UgaWYgKHRpbWVTaW5jZVN0YXJ0IDwgMCkge1xuICAgICAgICB0aGlzLnN0YXRlID0gdGhpcy5fc3RhcnRWYWx1ZTtcbiAgICAgICAgdGhpcy52ZWxvY2l0eSA9IHRoaXMuX3N0YXJ0VmVsb2NpdHk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIHQgPSB0aW1lU2luY2VTdGFydCAvIHRoaXMuX2R1cmF0aW9uO1xuICAgICAgICB0aGlzLnN0YXRlID0gX2NhbGN1bGF0ZVN0YXRlKHRoaXMuX3N0YXJ0VmFsdWUsIHRoaXMuX2VuZFZhbHVlLCB0aGlzLl9jdXJ2ZSh0KSk7XG4gICAgICAgIHRoaXMudmVsb2NpdHkgPSBfY2FsY3VsYXRlVmVsb2NpdHkodGhpcy5zdGF0ZSwgdGhpcy5fc3RhcnRWYWx1ZSwgdGhpcy5fY3VydmUsIHRoaXMuX2R1cmF0aW9uLCB0KTtcbiAgICB9XG59O1xuVHdlZW5UcmFuc2l0aW9uLnByb3RvdHlwZS5pc0FjdGl2ZSA9IGZ1bmN0aW9uIGlzQWN0aXZlKCkge1xuICAgIHJldHVybiB0aGlzLl9hY3RpdmU7XG59O1xuVHdlZW5UcmFuc2l0aW9uLnByb3RvdHlwZS5oYWx0ID0gZnVuY3Rpb24gaGFsdCgpIHtcbiAgICB0aGlzLnJlc2V0KHRoaXMuZ2V0KCkpO1xufTtcblR3ZWVuVHJhbnNpdGlvbi5yZWdpc3RlckN1cnZlKCdsaW5lYXInLCBUd2VlblRyYW5zaXRpb24uQ3VydmVzLmxpbmVhcik7XG5Ud2VlblRyYW5zaXRpb24ucmVnaXN0ZXJDdXJ2ZSgnZWFzZUluJywgVHdlZW5UcmFuc2l0aW9uLkN1cnZlcy5lYXNlSW4pO1xuVHdlZW5UcmFuc2l0aW9uLnJlZ2lzdGVyQ3VydmUoJ2Vhc2VPdXQnLCBUd2VlblRyYW5zaXRpb24uQ3VydmVzLmVhc2VPdXQpO1xuVHdlZW5UcmFuc2l0aW9uLnJlZ2lzdGVyQ3VydmUoJ2Vhc2VJbk91dCcsIFR3ZWVuVHJhbnNpdGlvbi5DdXJ2ZXMuZWFzZUluT3V0KTtcblR3ZWVuVHJhbnNpdGlvbi5yZWdpc3RlckN1cnZlKCdlYXNlT3V0Qm91bmNlJywgVHdlZW5UcmFuc2l0aW9uLkN1cnZlcy5lYXNlT3V0Qm91bmNlKTtcblR3ZWVuVHJhbnNpdGlvbi5yZWdpc3RlckN1cnZlKCdzcHJpbmcnLCBUd2VlblRyYW5zaXRpb24uQ3VydmVzLnNwcmluZyk7XG5Ud2VlblRyYW5zaXRpb24uY3VzdG9tQ3VydmUgPSBmdW5jdGlvbiBjdXN0b21DdXJ2ZSh2MSwgdjIpIHtcbiAgICB2MSA9IHYxIHx8IDA7XG4gICAgdjIgPSB2MiB8fCAwO1xuICAgIHJldHVybiBmdW5jdGlvbiAodCkge1xuICAgICAgICByZXR1cm4gdjEgKiB0ICsgKC0yICogdjEgLSB2MiArIDMpICogdCAqIHQgKyAodjEgKyB2MiAtIDIpICogdCAqIHQgKiB0O1xuICAgIH07XG59O1xubW9kdWxlLmV4cG9ydHMgPSBUd2VlblRyYW5zaXRpb247IiwidmFyIFV0aWxpdHkgPSB7fTtcblV0aWxpdHkuRGlyZWN0aW9uID0ge1xuICAgIFg6IDAsXG4gICAgWTogMSxcbiAgICBaOiAyXG59O1xuVXRpbGl0eS5hZnRlciA9IGZ1bmN0aW9uIGFmdGVyKGNvdW50LCBjYWxsYmFjaykge1xuICAgIHZhciBjb3VudGVyID0gY291bnQ7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgY291bnRlci0tO1xuICAgICAgICBpZiAoY291bnRlciA9PT0gMClcbiAgICAgICAgICAgIGNhbGxiYWNrLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfTtcbn07XG5VdGlsaXR5LmxvYWRVUkwgPSBmdW5jdGlvbiBsb2FkVVJMKHVybCwgY2FsbGJhY2spIHtcbiAgICB2YXIgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgeGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uIG9ucmVhZHlzdGF0ZWNoYW5nZSgpIHtcbiAgICAgICAgaWYgKHRoaXMucmVhZHlTdGF0ZSA9PT0gNCkge1xuICAgICAgICAgICAgaWYgKGNhbGxiYWNrKVxuICAgICAgICAgICAgICAgIGNhbGxiYWNrKHRoaXMucmVzcG9uc2VUZXh0KTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgeGhyLm9wZW4oJ0dFVCcsIHVybCk7XG4gICAgeGhyLnNlbmQoKTtcbn07XG5VdGlsaXR5LmNyZWF0ZURvY3VtZW50RnJhZ21lbnRGcm9tSFRNTCA9IGZ1bmN0aW9uIGNyZWF0ZURvY3VtZW50RnJhZ21lbnRGcm9tSFRNTChodG1sKSB7XG4gICAgdmFyIGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBlbGVtZW50LmlubmVySFRNTCA9IGh0bWw7XG4gICAgdmFyIHJlc3VsdCA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcbiAgICB3aGlsZSAoZWxlbWVudC5oYXNDaGlsZE5vZGVzKCkpXG4gICAgICAgIHJlc3VsdC5hcHBlbmRDaGlsZChlbGVtZW50LmZpcnN0Q2hpbGQpO1xuICAgIHJldHVybiByZXN1bHQ7XG59O1xuVXRpbGl0eS5jbG9uZSA9IGZ1bmN0aW9uIGNsb25lKGIpIHtcbiAgICB2YXIgYTtcbiAgICBpZiAodHlwZW9mIGIgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIGEgPSBiIGluc3RhbmNlb2YgQXJyYXkgPyBbXSA6IHt9O1xuICAgICAgICBmb3IgKHZhciBrZXkgaW4gYikge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBiW2tleV0gPT09ICdvYmplY3QnICYmIGJba2V5XSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGlmIChiW2tleV0gaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgICAgICAgICAgICAgICBhW2tleV0gPSBuZXcgQXJyYXkoYltrZXldLmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYltrZXldLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhW2tleV1baV0gPSBVdGlsaXR5LmNsb25lKGJba2V5XVtpXSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBhW2tleV0gPSBVdGlsaXR5LmNsb25lKGJba2V5XSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBhW2tleV0gPSBiW2tleV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICBhID0gYjtcbiAgICB9XG4gICAgcmV0dXJuIGE7XG59O1xubW9kdWxlLmV4cG9ydHMgPSBVdGlsaXR5OyIsInZhciBNb2RpZmllciAgICAgICA9IHJlcXVpcmUoJ2ZhbW91cy9zcmMvY29yZS9Nb2RpZmllcicpO1xudmFyIEZhbW91c0VuZ2luZSA9IHJlcXVpcmUoJ2ZhbW91cy9zcmMvY29yZS9FbmdpbmUnKTsgXG52YXIgVXRpbHMgPSByZXF1aXJlKCcuL1V0aWxzJyk7IFxudmFyIEZNID0gcmVxdWlyZSgnLi9PbGRNYXRyaXgnKTsgICAgXG52YXIgVmVjdG9yID0gcmVxdWlyZSgnZmFtb3VzL3NyYy9tYXRoL1ZlY3RvcicpO1xudmFyIFF1YXQgPSByZXF1aXJlKCcuL09sZFF1YXRlcm5pb24nKTtcblxuZnVuY3Rpb24gRWFzeUNhbWVyYSgpXG57XG4gICAgdGhpcy5yZW5kZXJNYXRyaXggPSBGTS5pZGVudGl0eTsgXG5cbiAgICB0aGlzLmRvdWJsZUNsaWNrVG9SZXNldCA9IHRydWU7IFxuICAgIHRoaXMudG91Y2hUaW1lID0gKG5ldyBEYXRlKCkpLmdldFRpbWUoKTtcbiAgICB0aGlzLmNsaWNrVGltZSA9IChuZXcgRGF0ZSgpKS5nZXRUaW1lKCk7XG4gICAgdGhpcy5kZWx0YVRpbWUgPSAyMDA7ICAgICAgICAgXG5cbiAgICB0aGlzLnZpZXdXaWR0aCA9IFV0aWxzLmdldFdpZHRoKCk7IFxuICAgIHRoaXMudmlld0hlaWdodCA9IFV0aWxzLmdldEhlaWdodCgpOyBcbiAgICB0aGlzLnJhZGl1cyA9IE1hdGgubWF4KHRoaXMudmlld1dpZHRoLCB0aGlzLnZpZXdIZWlnaHQpKjAuNTsgXG5cbiAgICB0aGlzLmNlbnRlciA9IG5ldyBWZWN0b3IodGhpcy52aWV3V2lkdGgqLjUsIHRoaXMudmlld0hlaWdodCouNSwgMC4wKTsgXG5cbiAgICB0aGlzLmF4aXMgPSBuZXcgVmVjdG9yKDAuMCwgMS4wLCAwLjApOyBcbiAgICB0aGlzLnRoZXRhID0gMC4wOyAgICAgICBcbiAgICBcbiAgICB0aGlzLmZsaXBYID0gMS4wOyBcbiAgICB0aGlzLmZsaXBZID0gMS4wOyBcbiAgICB0aGlzLmZsaXBaID0gMS4wOyBcblxuICAgIHRoaXMudDEgPSBuZXcgVmVjdG9yKCk7IFxuICAgIHRoaXMudDIgPSBuZXcgVmVjdG9yKCk7IFxuXG4gICAgdGhpcy5wdDEgPSBuZXcgVmVjdG9yKCk7IFxuICAgIHRoaXMucHQyID0gbmV3IFZlY3RvcigpO1xuXG4gICAgdGhpcy5kYW1waW5nID0gLjk1OyBcblxuICAgIHRoaXMuekFjYyA9IDAuMDsgXG4gICAgdGhpcy56VmVsID0gMC4wOyBcbiAgICBcbiAgICB0aGlzLmR0ID0gMC4wO1xuICAgIHRoaXMucGR0ID0gMC4wOyAvL1ByZXZpb3VzIGRpc3RhbmNlIEJldHdlZW4gVHdvIFRvdWNoZXMgXG5cbiAgICB0aGlzLmRpc3RhbmNlID0gLTEwMC4wOyBcbiAgICB0aGlzLnBvc2l0aW9uID0gbmV3IFZlY3RvcigwLCAwLCB0aGlzLmRpc3RhbmNlKTsgXG4gICAgdGhpcy5yb3RhdGlvbiA9IG5ldyBWZWN0b3IoMCwgMCwgMCk7IFxuICAgIHRoaXMuZV9tdHggPSBGTS5pZGVudGl0eTsgIFxuICAgIHRoaXMucV9yb3QgPSBuZXcgUXVhdCgpO1xuICAgIHRoaXMucV9tdHggPSBGTS5pZGVudGl0eTsgIFxuICAgIHRoaXMucXVhdCA9IG5ldyBRdWF0KCk7IFxuICAgIHRoaXMuZF9tdHggPSBGTS5pZGVudGl0eTsgXG5cbiAgICB0aGlzLnNlbnNpdGl2aXR5Um90YXRpb24gPSAwLjU7IFxuICAgIHRoaXMuc2Vuc2l0aXZpdHlab29tID0gMy4wOyBcblxuICAgIHRoaXMudG91Y2hEb3duID0gZmFsc2U7IFxuICAgIHRoaXMubW91c2VEb3duID0gZmFsc2U7IFxuXG4gICAgRmFtb3VzRW5naW5lLm9uKCdwcmVyZW5kZXInLCB0aGlzLl91cGRhdGUuYmluZCh0aGlzKSk7ICAgICAgICAgXG4gICAgRmFtb3VzRW5naW5lLm9uKCd0b3VjaHN0YXJ0JywgdGhpcy50b3VjaHN0YXJ0LmJpbmQodGhpcykpOyAgICAgICAgICAgICAgICAgXG4gICAgRmFtb3VzRW5naW5lLm9uKCd0b3VjaG1vdmUnLCB0aGlzLnRvdWNobW92ZS5iaW5kKHRoaXMpKTsgICAgICAgICAgICAgICAgIFxuICAgIEZhbW91c0VuZ2luZS5vbigndG91Y2hlbmQnLCB0aGlzLnRvdWNoZW5kLmJpbmQodGhpcykpOyAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICBGYW1vdXNFbmdpbmUub24oJ3Jlc2l6ZScsIHRoaXMucmVzaXplLmJpbmQodGhpcykpOyAgICAgICAgICAgICAgICAgXG4gICAgXG4gICAgRmFtb3VzRW5naW5lLm9uKCdtb3VzZWRvd24nLCB0aGlzLm1vdXNlZG93bi5iaW5kKHRoaXMpKTsgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgRmFtb3VzRW5naW5lLm9uKCdtb3VzZW1vdmUnLCB0aGlzLm1vdXNlbW92ZS5iaW5kKHRoaXMpKTsgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgRmFtb3VzRW5naW5lLm9uKCdtb3VzZXVwJywgdGhpcy5tb3VzZXVwLmJpbmQodGhpcykpOyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNld2hlZWwnLCB0aGlzLm1vdXNld2hlZWwuYmluZCh0aGlzKSk7ICAgICBcbiAgICB0aGlzLnVwZGF0ZU1hdHJpeCgpOyBcblxuICAgIHRoaXMubW9kID0gbmV3IE1vZGlmaWVyKHtcbiAgICAgICAgb3JpZ2luOiBbMC41LCAwLjVdLFxuICAgICAgICBhbGlnbjogWzAuNSwgMC41XSxcbiAgICAgICAgdHJhbnNmb3JtIDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5yZW5kZXJNYXRyaXg7XG4gICAgICAgIH0uYmluZCh0aGlzKVxuICAgIH0pO1xufVxuXG5FYXN5Q2FtZXJhLnByb3RvdHlwZS5fdXBkYXRlID0gZnVuY3Rpb24oZXZlbnQpXG57XG4gICAgdGhpcy51cGRhdGUoKTsgXG4gICAgaWYoIXRoaXMubW91c2VEb3duICYmICF0aGlzLnRvdWNoRG93biAmJiB0aGlzLnRoZXRhID4gMC4wMDAxKVxuICAgIHsgICAgICAgICAgICAgICAgXG4gICAgICAgIHRoaXMucXVhdC5tYWtlRnJvbUFuZ2xlQW5kQXhpcyh0aGlzLnRoZXRhICogdGhpcy5zZW5zaXRpdml0eVJvdGF0aW9uLCB0aGlzLmF4aXMpOyAgICAgICAgICAgICBcbiAgICAgICAgdGhpcy5xX3JvdCA9IHRoaXMucV9yb3QubXVsdGlwbHkodGhpcy5xdWF0KTsgICAgICAgXG4gICAgICAgIHRoaXMucV9tdHggPSB0aGlzLnFfcm90LmdldE1hdHJpeCgpOyBcbiAgICAgICAgdGhpcy51cGRhdGVNYXRyaXgoKTtcbiAgICAgICAgdGhpcy50aGV0YSo9dGhpcy5kYW1waW5nOyBcbiAgICB9ICAgICAgICAgICAgXG59OyBcblxuRWFzeUNhbWVyYS5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24oZXZlbnQpXG57XG4gICAgXG59OyBcblxuRWFzeUNhbWVyYS5wcm90b3R5cGUuc2V0RmxpcFggPSBmdW5jdGlvbih2KVxue1xuICAgIGlmKHYpXG4gICAge1xuICAgICAgICB0aGlzLmZsaXBYID0gLTEuMDsgXG4gICAgfVxuICAgIGVsc2VcbiAgICB7XG4gICAgICAgIHRoaXMuZmxpcFggPSAxLjA7IFxuICAgIH1cbn07XG5cbkVhc3lDYW1lcmEucHJvdG90eXBlLnNldEZsaXBZID0gZnVuY3Rpb24odilcbntcbiAgICBpZih2KVxuICAgIHtcbiAgICAgICAgdGhpcy5mbGlwWSA9IC0xLjA7IFxuICAgIH1cbiAgICBlbHNlXG4gICAge1xuICAgICAgICB0aGlzLmZsaXBZID0gMS4wOyBcbiAgICB9XG59O1xuXG5FYXN5Q2FtZXJhLnByb3RvdHlwZS5zZXRGbGlwWiA9IGZ1bmN0aW9uKHYpXG57XG4gICAgaWYodilcbiAgICB7XG4gICAgICAgIHRoaXMuZmxpcFogPSAtMS4wOyBcbiAgICB9XG4gICAgZWxzZVxuICAgIHtcbiAgICAgICAgdGhpcy5mbGlwWiA9IDEuMDsgXG4gICAgfVxufTtcblxuRWFzeUNhbWVyYS5wcm90b3R5cGUuc2V0U2Vuc2l0aXZpdHlab29tID0gZnVuY3Rpb24oeilcbntcbiAgICB0aGlzLnNlbnNpdGl2aXR5Wm9vbSA9IHo7IFxufTtcblxuRWFzeUNhbWVyYS5wcm90b3R5cGUuc2V0U2Vuc2l0aXZpdHlSb3RhdGlvbiA9IGZ1bmN0aW9uKHIpXG57XG4gICAgdGhpcy5zZW5zaXRpdml0eVJvdGF0aW9uID0gcjsgXG59O1xuXG5FYXN5Q2FtZXJhLnByb3RvdHlwZS5zZXREaXN0YW5jZSA9IGZ1bmN0aW9uKGQpXG57XG4gICAgdGhpcy5kaXN0YW5jZSA9IGQ7IFxuICAgIHRoaXMucG9zaXRpb24ueiA9IHRoaXMuZGlzdGFuY2U7ICAgICAgICAgXG4gICAgdGhpcy5zZXRQb3NpdGlvbih0aGlzLnBvc2l0aW9uKTsgICAgXG59O1xuXG5FYXN5Q2FtZXJhLnByb3RvdHlwZS5zZXRQb3NpdGlvbiA9IGZ1bmN0aW9uKHApXG57XG4gICAgdGhpcy5wb3NpdGlvbi5zZXQocCk7IFxuICAgIHRoaXMudXBkYXRlTWF0cml4KCk7ICAgICAgICAgXG59O1xuXG5FYXN5Q2FtZXJhLnByb3RvdHlwZS5hcHBseVF1YXRlcm5pb25Sb3RhdGlvbiA9IGZ1bmN0aW9uKHEpXG57XG4gICAgdGhpcy5xX3JvdCA9IHRoaXMucV9yb3QubXVsdGlwbHkocSk7ICAgICAgIFxuICAgIHRoaXMucV9tdHggPSB0aGlzLnFfcm90LmdldE1hdHJpeCgpOyBcbiAgICB0aGlzLnVwZGF0ZU1hdHJpeCgpOyAgICAgICAgXG59O1xuXG5FYXN5Q2FtZXJhLnByb3RvdHlwZS5hcHBseUV1bGVyUm90YXRpb24gPSBmdW5jdGlvbihwaGksIHRoZXRhLCBwc2kpXG57XG4gICAgdGhpcy5yb3RhdGlvbi5zZXRYWVoocGhpLCB0aGV0YSwgcHNpKTsgXG4gICAgdGhpcy5lX210eCA9IEZNLnJvdGF0ZShwaGksIHRoZXRhLCBwc2kpO1xuICAgIHRoaXMudXBkYXRlTWF0cml4KCk7IFxufTtcblxuRWFzeUNhbWVyYS5wcm90b3R5cGUudXBkYXRlTWF0cml4ID0gZnVuY3Rpb24oKVxue1xuXG4gICAgdmFyIGFyciA9IFt0aGlzLnBvc2l0aW9uLngsIHRoaXMucG9zaXRpb24ueSwgdGhpcy5wb3NpdGlvbi56XTtcbiAgICB2YXIgYTEgPSBGTS5tdWx0aXBseSh0aGlzLnFfbXR4LCB0aGlzLmVfbXR4KVxuICAgIHRoaXMucmVuZGVyTWF0cml4ID0gRk0ubW92ZShhMSwgYXJyKTtcbn07XG5cbkVhc3lDYW1lcmEucHJvdG90eXBlLmdldFJvdGF0aW9uTWF0cml4ID0gZnVuY3Rpb24oKVxue1xuICAgIHJldHVybiB0aGlzLnFfbXR4OyBcbn07IFxuXG5FYXN5Q2FtZXJhLnByb3RvdHlwZS5nZXRNYXRyaXggPSBmdW5jdGlvbigpXG57XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyTWF0cml4OyBcbn07IFxuXG5FYXN5Q2FtZXJhLnByb3RvdHlwZS5yZXNldCA9IGZ1bmN0aW9uKClcbnsgICAgICAgIFxuICAgIHRoaXMudGhldGEgPSAwLjA7IFxuICAgIHRoaXMucV9yb3QuY2xlYXIoKTsgICAgICAgICAgICBcbiAgICB0aGlzLnFfbXR4ID0gdGhpcy5kX210eDsgXG4gICAgdGhpcy5wb3NpdGlvbi5jbGVhcigpO1xuICAgIHRoaXMucG9zaXRpb24uc2V0WFlaKDAuMCwgMC4wLCB0aGlzLmRpc3RhbmNlKTsgICAgICAgICAgXG4gICAgdGhpcy51cGRhdGVNYXRyaXgoKTtcbn07XG5cbkVhc3lDYW1lcmEucHJvdG90eXBlLnNldERlZmF1bHRNYXRyaXggPSBmdW5jdGlvbihtdHgpXG57XG4gICAgdGhpcy5kX210eCA9IG10eDsgXG59OyBcblxuRWFzeUNhbWVyYS5wcm90b3R5cGUuY2xpY2tDaGVja0ZvckNhbWVyYVJlc3RhcnQgPSBmdW5jdGlvbigpXG57ICAgIFxuICAgIHZhciBuZXdUaW1lID0gKG5ldyBEYXRlKCkpLmdldFRpbWUoKTsgICAgICAgICAgICAgXG4gICAgaWYobmV3VGltZSAtIHRoaXMuY2xpY2tUaW1lIDwgdGhpcy5kZWx0YVRpbWUgJiYgdGhpcy5kb3VibGVDbGlja1RvUmVzZXQpXG4gICAgeyAgICAgICAgICAgICAgIFxuICAgICAgICB0aGlzLnJlc2V0KCk7IFxuICAgIH1cblxuICAgIHRoaXMuY2xpY2tUaW1lID0gbmV3VGltZTsgXG59O1xuXG5FYXN5Q2FtZXJhLnByb3RvdHlwZS50b3VjaENoZWNrRm9yQ2FtZXJhUmVzdGFydCA9IGZ1bmN0aW9uKClcbntcbiAgICB2YXIgbmV3VGltZSA9IChuZXcgRGF0ZSgpKS5nZXRUaW1lKCk7ICAgICAgICAgICAgIFxuICAgIGlmKG5ld1RpbWUgLSB0aGlzLnRvdWNoVGltZSA8IHRoaXMuZGVsdGFUaW1lICYmIHRoaXMuZG91YmxlQ2xpY2tUb1Jlc2V0KVxuICAgIHsgICAgICAgICAgICAgICBcbiAgICAgICAgdGhpcy5yZXNldCgpOyBcbiAgICB9XG5cbiAgICB0aGlzLnRvdWNoVGltZSA9IG5ld1RpbWU7IFxufTtcblxuRWFzeUNhbWVyYS5wcm90b3R5cGUudG91Y2hzdGFydCA9IGZ1bmN0aW9uKGV2ZW50KSBcbntcbiAgICBpZihldmVudC50b3VjaGVzLmxlbmd0aCA9PSAxKVxuICAgIHtcbiAgICAgICAgdGhpcy50b3VjaERvd24gPSB0cnVlOyBcbiAgICAgICAgdGhpcy50b3VjaENoZWNrRm9yQ2FtZXJhUmVzdGFydCgpOyAgICAgICAgIFxuICAgICAgICB0aGlzLnRoZXRhID0gMC4wOyBcbiAgICAgICAgdGhpcy50MS5jbGVhcigpOyBcbiAgICAgICAgdGhpcy5wdDEuY2xlYXIoKTsgXG4gICAgICAgIHRoaXMucXVhdC5jbGVhcigpOyBcbiAgICAgICAgdGhpcy5zZXRBcmNCYWxsVmVjdG9yKGV2ZW50LnRvdWNoZXNbMF0uY2xpZW50WCwgZXZlbnQudG91Y2hlc1swXS5jbGllbnRZKTsgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgfVxuICAgIGVsc2UgaWYoZXZlbnQudG91Y2hlcy5sZW5ndGggPT0gMikgICAgICAgICAgICBcbiAgICB7XG4gICAgICAgIHRoaXMudDEuc2V0WFlaKGV2ZW50LnRvdWNoZXNbMF0uY2xpZW50WCwgZXZlbnQudG91Y2hlc1swXS5jbGllbnRZLCAwLjApO1xuICAgICAgICB0aGlzLnQyLnNldFhZWihldmVudC50b3VjaGVzWzFdLmNsaWVudFgsIGV2ZW50LnRvdWNoZXNbMV0uY2xpZW50WSwgMC4wKTsgXG4gICAgICAgIFxuICAgICAgICB0aGlzLnB0MS5zZXQodGhpcy50MSk7IFxuICAgICAgICB0aGlzLnB0Mi5zZXQodGhpcy50Mik7IFxuICAgICAgICBcbiAgICAgICAgdGhpcy5kdCA9IFV0aWxzLmRpc3RhbmNlKHRoaXMudDEueCwgdGhpcy50MS55LCB0aGlzLnQyLngsIHRoaXMudDIueSk7IFxuICAgICAgICB0aGlzLnBkdCA9IHRoaXMuZHQ7IFxuICAgIH0gICAgICAgIFxufTtcblxuRWFzeUNhbWVyYS5wcm90b3R5cGUudG91Y2htb3ZlID0gZnVuY3Rpb24oZXZlbnQpXG57XG4gICAgaWYoZXZlbnQudG91Y2hlcy5sZW5ndGggPT0gMSlcbiAgICB7XG4gICAgICAgIHRoaXMuc2V0QXJjQmFsbFZlY3RvcihldmVudC50b3VjaGVzWzBdLmNsaWVudFgsIGV2ZW50LnRvdWNoZXNbMF0uY2xpZW50WSk7IFxuICAgICAgICB0aGlzLnVwZGF0ZUFyY0JhbGxSb3RhdGlvbigpOyBcbiAgICB9XG4gICAgZWxzZSBpZihldmVudC50b3VjaGVzLmxlbmd0aCA9PSAyKSAgICAgICAgICAgIFxuICAgIHtcbiAgICAgICAgdGhpcy50MS5zZXRYWVooZXZlbnQudG91Y2hlc1swXS5jbGllbnRYLCBldmVudC50b3VjaGVzWzBdLmNsaWVudFksIDAuMCk7IFxuICAgICAgICB0aGlzLnQyLnNldFhZWihldmVudC50b3VjaGVzWzFdLmNsaWVudFgsIGV2ZW50LnRvdWNoZXNbMV0uY2xpZW50WSwgMC4wKTsgXG5cbiAgICAgICAgdGhpcy5kdCA9IFV0aWxzLmRpc3RhbmNlKHRoaXMudDEueCwgdGhpcy50MS55LCB0aGlzLnQyLngsIHRoaXMudDIueSk7ICAgICAgICAgICAgIFxuICAgICAgICBcbiAgICAgICAgdGhpcy5wb3NpdGlvbi56ICs9IHRoaXMuZmxpcFoqKHRoaXMuZHQtdGhpcy5wZHQpL3RoaXMuc2Vuc2l0aXZpdHlab29tOyAgICAgICAgIFxuICAgICAgICB0aGlzLnVwZGF0ZU1hdHJpeCgpO1xuXG4gICAgICAgIHRoaXMucHQxLnNldCh0aGlzLnQxKTsgXG4gICAgICAgIHRoaXMucHQyLnNldCh0aGlzLnQyKTsgICAgICAgICAgXG5cbiAgICAgICAgdGhpcy5wZHQgPSB0aGlzLmR0OyBcbiAgICB9XG59O1xuXG5FYXN5Q2FtZXJhLnByb3RvdHlwZS50b3VjaGVuZCA9IGZ1bmN0aW9uKGV2ZW50KVxue1xuICAgIGlmKGV2ZW50LnRvdWNoZXMubGVuZ3RoID09IDEpXG4gICAgeyAgICAgICAgICAgIFxuICAgICAgICB0aGlzLnQxLmNsZWFyKCk7IFxuICAgICAgICB0aGlzLnB0MS5jbGVhcigpOyBcbiAgICAgICAgdGhpcy5xdWF0LmNsZWFyKCk7IFxuICAgIH1cbiAgICBlbHNlIGlmKGV2ZW50LnRvdWNoZXMubGVuZ3RoID09IDIpICAgICAgICAgICAgXG4gICAge1xuICAgICAgICB0aGlzLnQxLmNsZWFyKCk7IFxuICAgICAgICB0aGlzLnB0MS5jbGVhcigpOyBcbiAgICAgICAgXG4gICAgICAgIHRoaXMudDIuY2xlYXIoKTsgXG4gICAgICAgIHRoaXMucHQyLmNsZWFyKCk7IFxuICAgICAgICBcbiAgICAgICAgdGhpcy5kdCA9IDAuMDsgXG4gICAgICAgIHRoaXMucGR0ID0gMC4wOyBcbiAgICB9XG59O1xuXG5FYXN5Q2FtZXJhLnByb3RvdHlwZS5zZXRBcmNCYWxsVmVjdG9yID0gZnVuY3Rpb24oeCwgeSlcbnsgICAgICAgICAgICAgICAgXG4gICAgdGhpcy5wdDEuc2V0KHRoaXMudDEpOyBcbiAgICB0aGlzLnQxLmNsZWFyKCk7IFxuICAgIFxuICAgIHRoaXMudDEueCA9IHRoaXMuZmxpcFggKiAtMS4wICogKHggLSB0aGlzLmNlbnRlci54KSAvIHRoaXMucmFkaXVzOyBcbiAgICB0aGlzLnQxLnkgPSB0aGlzLmZsaXBZICogLTEuMCAqICh5IC0gdGhpcy5jZW50ZXIueSkgLyB0aGlzLnJhZGl1czsgICAgICAgICAgICAgICAgIFxuXG4gICAgdmFyIHIgPSB0aGlzLnQxLm5vcm0oKTsgXG4gICAgaWYociA+IDEuMClcbiAgICB7XG4gICAgICAgIHRoaXMudDEubm9ybWFsaXplKDEuMCwgdGhpcy50MSk7ICAgICAgICAgIFxuICAgIH1cbiAgICBlbHNlXG4gICAge1xuICAgICAgICB0aGlzLnQxLnogPSBNYXRoLnNxcnQoMS4wIC0gcik7IFxuICAgIH0gICAgICAgICAgICAgICAgXG59O1xuXG5FYXN5Q2FtZXJhLnByb3RvdHlwZS51cGRhdGVBcmNCYWxsUm90YXRpb24gPSBmdW5jdGlvbigpXG57ICAgICAgICBcbiAgICB0aGlzLnRoZXRhID0gTWF0aC5hY29zKHRoaXMudDEuZG90KHRoaXMucHQxKSk7IFxuICAgIHRoaXMuYXhpcyA9IHRoaXMucHQxLmNyb3NzKHRoaXMudDEsIHRoaXMuYXhpcyk7ICAgXG4gICAgdGhpcy5xdWF0Lm1ha2VGcm9tQW5nbGVBbmRBeGlzKHRoaXMudGhldGEgKiB0aGlzLnNlbnNpdGl2aXR5Um90YXRpb24sIHRoaXMuYXhpcyk7ICAgICAgICAgICAgIFxuICAgIHRoaXMucV9yb3QgPSB0aGlzLnFfcm90Lm11bHRpcGx5KHRoaXMucXVhdCk7ICAgICAgIFxuICAgIHRoaXMucV9tdHggPSB0aGlzLnFfcm90LmdldE1hdHJpeCgpOyBcbiAgICB0aGlzLnVwZGF0ZU1hdHJpeCgpO1xufVxuXG5FYXN5Q2FtZXJhLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24odHlwZSwgZXZlbnQpXG57XG4gICAgaWYodHlwZSA9PSAncHJlcmVuZGVyJykgICAgdGhpcy51cGRhdGUoZXZlbnQpOyAgICBcbiAgICBlbHNlIGlmKHR5cGUgPT0gJ3RvdWNoc3RhcnQnKSAgICAgICAgdGhpcy50b3VjaHN0YXJ0KGV2ZW50KTtcbiAgICBlbHNlIGlmKHR5cGUgPT0gJ3RvdWNobW92ZScpICAgIHRoaXMudG91Y2htb3ZlKGV2ZW50KTtcbiAgICBlbHNlIGlmKHR5cGUgPT0gJ3RvdWNoZW5kJykgICAgIHRoaXMudG91Y2hlbmQoZXZlbnQpO1xuICAgIGVsc2UgaWYodHlwZSA9PSAncmVzaXplJykgICAgICAgdGhpcy5yZXNpemUoZXZlbnQpOyAgICAgICAgICAgIFxufTtcblxuRWFzeUNhbWVyYS5wcm90b3R5cGUubW91c2Vtb3ZlID0gZnVuY3Rpb24oZXZlbnQpXG57ICBcbiAgICBpZih0aGlzLm1vdXNlRG93bikgXG4gICAge1xuICAgICAgICB0aGlzLnNldEFyY0JhbGxWZWN0b3IoZXZlbnQuY2xpZW50WCwgZXZlbnQuY2xpZW50WSk7ICAgICAgICAgICAgIFxuICAgICAgICB0aGlzLnVwZGF0ZUFyY0JhbGxSb3RhdGlvbigpOyAgICAgICAgICAgICBcbiAgICB9XG59O1xuXG5FYXN5Q2FtZXJhLnByb3RvdHlwZS5tb3VzZWRvd24gPSBmdW5jdGlvbihldmVudClcbnsgICAgICAgICAgICBcbiAgICB0aGlzLm1vdXNlRG93biA9IHRydWU7ICAgICAgICAgICAgICAgICBcbiAgICB0aGlzLmNsaWNrQ2hlY2tGb3JDYW1lcmFSZXN0YXJ0KCk7ICAgICAgICAgXG4gICAgdGhpcy50aGV0YSA9IDAuMDsgXG4gICAgdGhpcy50MS5jbGVhcigpOyBcbiAgICB0aGlzLnB0MS5jbGVhcigpOyBcbiAgICB0aGlzLnF1YXQuY2xlYXIoKTsgICAgICAgICAgICBcbiAgICB0aGlzLnNldEFyY0JhbGxWZWN0b3IoZXZlbnQuY2xpZW50WCwgZXZlbnQuY2xpZW50WSk7ICAgICAgICAgICAgICBcbn1cblxuRWFzeUNhbWVyYS5wcm90b3R5cGUubW91c2V1cCA9IGZ1bmN0aW9uKGV2ZW50KVxueyAgICAgIFxuICAgIHRoaXMubW91c2VEb3duID0gZmFsc2U7IFxufTsgXG5cbkVhc3lDYW1lcmEucHJvdG90eXBlLm1vdXNld2hlZWwgPSBmdW5jdGlvbihldmVudClcbnsgICAgICAgICAgICAgICAgXG5cbiAgICB0aGlzLnBvc2l0aW9uLnogKz0gdGhpcy5mbGlwWipVdGlscy5saW1pdChldmVudC53aGVlbERlbHRhLCAtNTAwLCA1MDApKi4wMSp0aGlzLnNlbnNpdGl2aXR5Wm9vbTsgICAgICAgICBcbiAgICB0aGlzLnVwZGF0ZU1hdHJpeCgpOyBcbiAgICAvLyB0aGlzLnpBY2MgPSBVdGlscy5saW1pdChldmVudC53aGVlbERlbHRhLC0xMCwxMCk7IFxuICAgIC8vIHRoaXMuelZlbCArPSB0aGlzLnpBY2M7IFxuICAgIC8vIHRoaXMuelZlbCA9IFV0aWxzLmxpbWl0KHRoaXMuelZlbCwgLTIsIDIpOyAgICAgICAgIFxufTtcblxuRWFzeUNhbWVyYS5wcm90b3R5cGUucmVzaXplID0gZnVuY3Rpb24oZXZlbnQpIFxueyAgICAgICAgXG4gICAgdGhpcy52aWV3V2lkdGggPSBVdGlscy5nZXRXaWR0aCgpOyBcbiAgICB0aGlzLnZpZXdIZWlnaHQgPSBVdGlscy5nZXRIZWlnaHQoKTsgXG4gICAgdGhpcy5jZW50ZXIgPSBuZXcgVmVjdG9yKHRoaXMudmlld1dpZHRoKi41LCB0aGlzLnZpZXdIZWlnaHQqLjUsIDAuMCk7IFxuICAgIHRoaXMucmFkaXVzID0gTWF0aC5taW4odGhpcy52aWV3V2lkdGgsIHRoaXMudmlld0hlaWdodCkqMC41OyAgICAgICAgIFxufTtcblxuRWFzeUNhbWVyYS5wcm90b3R5cGUuc2V0RGFtcGluZyA9IGZ1bmN0aW9uKGQpIFxueyAgICAgICAgXG4gICAgdGhpcy5kYW1waW5nID0gZDtcbn07XG5cbkVhc3lDYW1lcmEucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uKGlucHV0KSBcbntcbiAgICByZXR1cm4ge1xuICAgICAgICB0cmFuc2Zvcm06IHRoaXMucmVuZGVyTWF0cml4LFxuICAgICAgICBvcmlnaW46IFsuNSwgLjVdLFxuICAgICAgICB0YXJnZXQ6IGlucHV0XG5cbiAgICB9OyBcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gRWFzeUNhbWVyYTtcblxuIiwiXG4vKipcbiAqIEBuYW1lc3BhY2UgRmFtb3VzTWF0cml4XG4gKiBcbiAqIEBkZXNjcmlwdGlvbiBcbiAqICAqIEEgaGlnaC1wZXJmb3JtYW5jZSBtYXRyaXggbWF0aCBsaWJyYXJ5IHVzZWQgdG8gY2FsY3VsYXRlIFxuICogICBhZmZpbmUgdHJhbnNmb3JtcyBvbiBzdXJmYWNlcyBhbmQgb3RoZXIgcmVuZGVyYWJsZXMuXG4gKiAgIEZhbW91cyB1c2VzIDR4NCBtYXRyaWNlcyBjb3JyZXNwb25kaW5nIGRpcmVjdGx5IHRvXG4gKiAgIFdlYktpdCBtYXRyaWNlcyAocm93LW1ham9yIG9yZGVyKVxuICogICAgXG4gKiAgICBUaGUgaW50ZXJuYWwgXCJ0eXBlXCIgb2YgYSBGYW1vdXNNYXRyaXggaXMgYSAxNi1sb25nIGZsb2F0IGFycmF5IGluIFxuICogICAgcm93LW1ham9yIG9yZGVyLCB3aXRoOlxuICogICAgICAqIGVsZW1lbnRzIFswXSxbMV0sWzJdLFs0XSxbNV0sWzZdLFs4XSxbOV0sWzEwXSBmb3JtaW5nIHRoZSAzeDNcbiAqICAgICAgICAgIHRyYW5zZm9ybWF0aW9uIG1hdHJpeFxuICogICAgICAqIGVsZW1lbnRzIFsxMl0sIFsxM10sIFsxNF0gY29ycmVzcG9uZGluZyB0byB0aGUgdF94LCB0X3ksIHRfeiBcbiAqICAgICAgICAgIGFmZmluZSB0cmFuc2xhdGlvbi5cbiAqICAgICAgKiBlbGVtZW50IFsxNV0gYWx3YXlzIHNldCB0byAxLlxuICogXG4gKiBTY29wZTogSWRlYWxseSwgbm9uZSBvZiB0aGVzZSBmdW5jdGlvbnMgc2hvdWxkIGJlIHZpc2libGUgYmVsb3cgdGhlIFxuICogY29tcG9uZW50IGRldmVsb3BlciBsZXZlbC5cbiAqXG4gKiBAc3RhdGljXG4gKiBcbiAqIEBuYW1lIEZhbW91c01hdHJpeFxuICovXG52YXIgRmFtb3VzTWF0cml4ID0ge307XG5cbi8vIFdBUk5JTkc6IHRoZXNlIG1hdHJpY2VzIGNvcnJlc3BvbmQgdG8gV2ViS2l0IG1hdHJpY2VzLCB3aGljaCBhcmVcbi8vICAgIHRyYW5zcG9zZWQgZnJvbSB0aGVpciBtYXRoIGNvdW50ZXJwYXJ0c1xuRmFtb3VzTWF0cml4LnByZWNpc2lvbiA9IDFlLTY7XG5GYW1vdXNNYXRyaXguaWRlbnRpdHkgPSBbMSwgMCwgMCwgMCwgMCwgMSwgMCwgMCwgMCwgMCwgMSwgMCwgMCwgMCwgMCwgMV07XG5cbi8qKlxuICogTXVsdGlwbHkgdHdvIG9yIG1vcmUgRmFtb3VzTWF0cml4IHR5cGVzIHRvIHJldHVybiBhIEZhbW91c01hdHJpeC5cbiAqXG4gKiBAbmFtZSBGYW1vdXNNYXRyaXgjbXVsdGlwbHk0eDRcbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIHtGYW1vdXNNYXRyaXh9IGEgbGVmdCBtYXRyaXhcbiAqIEBwYXJhbSB7RmFtb3VzTWF0cml4fSBiIHJpZ2h0IG1hdHJpeFxuICogQHJldHVybnMge0ZhbW91c01hdHJpeH0gdGhlIHJlc3VsdGluZyBtYXRyaXhcbiAqL1xuRmFtb3VzTWF0cml4Lm11bHRpcGx5NHg0ID0gZnVuY3Rpb24gbXVsdGlwbHk0eDQoYSwgYikge1xuICAgIHZhciByZXN1bHQgPSBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF07XG4gICAgcmVzdWx0WzBdID0gYVswXSAqIGJbMF0gKyBhWzFdICogYls0XSArIGFbMl0gKiBiWzhdICsgYVszXSAqIGJbMTJdO1xuICAgIHJlc3VsdFsxXSA9IGFbMF0gKiBiWzFdICsgYVsxXSAqIGJbNV0gKyBhWzJdICogYls5XSArIGFbM10gKiBiWzEzXTtcbiAgICByZXN1bHRbMl0gPSBhWzBdICogYlsyXSArIGFbMV0gKiBiWzZdICsgYVsyXSAqIGJbMTBdICsgYVszXSAqIGJbMTRdO1xuICAgIHJlc3VsdFszXSA9IGFbMF0gKiBiWzNdICsgYVsxXSAqIGJbN10gKyBhWzJdICogYlsxMV0gKyBhWzNdICogYlsxNV07XG4gICAgcmVzdWx0WzRdID0gYVs0XSAqIGJbMF0gKyBhWzVdICogYls0XSArIGFbNl0gKiBiWzhdICsgYVs3XSAqIGJbMTJdO1xuICAgIHJlc3VsdFs1XSA9IGFbNF0gKiBiWzFdICsgYVs1XSAqIGJbNV0gKyBhWzZdICogYls5XSArIGFbN10gKiBiWzEzXTtcbiAgICByZXN1bHRbNl0gPSBhWzRdICogYlsyXSArIGFbNV0gKiBiWzZdICsgYVs2XSAqIGJbMTBdICsgYVs3XSAqIGJbMTRdO1xuICAgIHJlc3VsdFs3XSA9IGFbNF0gKiBiWzNdICsgYVs1XSAqIGJbN10gKyBhWzZdICogYlsxMV0gKyBhWzddICogYlsxNV07XG4gICAgcmVzdWx0WzhdID0gYVs4XSAqIGJbMF0gKyBhWzldICogYls0XSArIGFbMTBdICogYls4XSArIGFbMTFdICogYlsxMl07XG4gICAgcmVzdWx0WzldID0gYVs4XSAqIGJbMV0gKyBhWzldICogYls1XSArIGFbMTBdICogYls5XSArIGFbMTFdICogYlsxM107XG4gICAgcmVzdWx0WzEwXSA9IGFbOF0gKiBiWzJdICsgYVs5XSAqIGJbNl0gKyBhWzEwXSAqIGJbMTBdICsgYVsxMV0gKiBiWzE0XTtcbiAgICByZXN1bHRbMTFdID0gYVs4XSAqIGJbM10gKyBhWzldICogYls3XSArIGFbMTBdICogYlsxMV0gKyBhWzExXSAqIGJbMTVdO1xuICAgIHJlc3VsdFsxMl0gPSBhWzEyXSAqIGJbMF0gKyBhWzEzXSAqIGJbNF0gKyBhWzE0XSAqIGJbOF0gKyBhWzE1XSAqIGJbMTJdO1xuICAgIHJlc3VsdFsxM10gPSBhWzEyXSAqIGJbMV0gKyBhWzEzXSAqIGJbNV0gKyBhWzE0XSAqIGJbOV0gKyBhWzE1XSAqIGJbMTNdO1xuICAgIHJlc3VsdFsxNF0gPSBhWzEyXSAqIGJbMl0gKyBhWzEzXSAqIGJbNl0gKyBhWzE0XSAqIGJbMTBdICsgYVsxNV0gKiBiWzE0XTtcbiAgICByZXN1bHRbMTVdID0gYVsxMl0gKiBiWzNdICsgYVsxM10gKiBiWzddICsgYVsxNF0gKiBiWzExXSArIGFbMTVdICogYlsxNV07XG4gICAgaWYoYXJndW1lbnRzLmxlbmd0aCA8PSAyKSAgcmV0dXJuIHJlc3VsdDtcbiAgICBlbHNlIHJldHVybiBtdWx0aXBseTR4NC5hcHBseShudWxsLCBbcmVzdWx0XS5jb25jYXQoQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAyKSkpO1xufTtcblxuLyoqXG4gKiBGYXN0LW11bHRpcGx5IHR3byBvciBtb3JlIEZhbW91c01hdHJpeCB0eXBlcyB0byByZXR1cm4gYVxuICogICAgRmFtb3VzTWF0cml4LCBhc3N1bWluZyByaWdodCBjb2x1bW4gb24gZWFjaCBpcyBbMCAwIDAgMV1eVC5cbiAqICAgIFxuICogQG5hbWUgRmFtb3VzTWF0cml4I211bHRpcGx5XG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSB7RmFtb3VzTWF0cml4fSBhIGxlZnQgbWF0cml4XG4gKiBAcGFyYW0ge0ZhbW91c01hdHJpeH0gYiByaWdodCBtYXRyaXhcbiAqIEBwYXJhbSB7Li4uRmFtb3VzTWF0cml4fSBjIGFkZGl0aW9uYWwgbWF0cmljZXMgdG8gYmUgbXVsdGlwbGllZCBpbiBcbiAqICAgIG9yZGVyXG4gKiBAcmV0dXJucyB7RmFtb3VzTWF0cml4fSB0aGUgcmVzdWx0aW5nIG1hdHJpeFxuICovIFxuRmFtb3VzTWF0cml4Lm11bHRpcGx5ID0gZnVuY3Rpb24gbXVsdGlwbHkoYSwgYiwgYykge1xuICAgIGlmKCFhIHx8ICFiKSByZXR1cm4gYSB8fCBiO1xuICAgIHZhciByZXN1bHQgPSBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMV07XG4gICAgcmVzdWx0WzBdID0gYVswXSAqIGJbMF0gKyBhWzFdICogYls0XSArIGFbMl0gKiBiWzhdO1xuICAgIHJlc3VsdFsxXSA9IGFbMF0gKiBiWzFdICsgYVsxXSAqIGJbNV0gKyBhWzJdICogYls5XTtcbiAgICByZXN1bHRbMl0gPSBhWzBdICogYlsyXSArIGFbMV0gKiBiWzZdICsgYVsyXSAqIGJbMTBdO1xuICAgIHJlc3VsdFs0XSA9IGFbNF0gKiBiWzBdICsgYVs1XSAqIGJbNF0gKyBhWzZdICogYls4XTtcbiAgICByZXN1bHRbNV0gPSBhWzRdICogYlsxXSArIGFbNV0gKiBiWzVdICsgYVs2XSAqIGJbOV07XG4gICAgcmVzdWx0WzZdID0gYVs0XSAqIGJbMl0gKyBhWzVdICogYls2XSArIGFbNl0gKiBiWzEwXTtcbiAgICByZXN1bHRbOF0gPSBhWzhdICogYlswXSArIGFbOV0gKiBiWzRdICsgYVsxMF0gKiBiWzhdO1xuICAgIHJlc3VsdFs5XSA9IGFbOF0gKiBiWzFdICsgYVs5XSAqIGJbNV0gKyBhWzEwXSAqIGJbOV07XG4gICAgcmVzdWx0WzEwXSA9IGFbOF0gKiBiWzJdICsgYVs5XSAqIGJbNl0gKyBhWzEwXSAqIGJbMTBdO1xuICAgIHJlc3VsdFsxMl0gPSBhWzEyXSAqIGJbMF0gKyBhWzEzXSAqIGJbNF0gKyBhWzE0XSAqIGJbOF0gKyBiWzEyXTtcbiAgICByZXN1bHRbMTNdID0gYVsxMl0gKiBiWzFdICsgYVsxM10gKiBiWzVdICsgYVsxNF0gKiBiWzldICsgYlsxM107XG4gICAgcmVzdWx0WzE0XSA9IGFbMTJdICogYlsyXSArIGFbMTNdICogYls2XSArIGFbMTRdICogYlsxMF0gKyBiWzE0XTtcbiAgICBpZihhcmd1bWVudHMubGVuZ3RoIDw9IDIpICByZXR1cm4gcmVzdWx0O1xuICAgIGVsc2UgcmV0dXJuIG11bHRpcGx5LmFwcGx5KG51bGwsIFtyZXN1bHRdLmNvbmNhdChBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDIpKSk7XG59O1xuXG4vKipcbiAqIFJldHVybiBhIEZhbW91c01hdHJpeCB0cmFuc2xhdGVkIGJ5IGFkZGl0aW9uYWwgYW1vdW50cyBpbiBlYWNoXG4gKiAgICBkaW1lbnNpb24uXG4gKiAgICBcbiAqIEBuYW1lIEZhbW91c01hdHJpeCNtb3ZlXG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSB7RmFtb3VzTWF0cml4fSBtIGEgbWF0cml4XG4gKiBAcGFyYW0ge0FycmF5LjxudW1iZXI+fSB0IGRlbHRhIHZlY3RvciAoYXJyYXkgb2YgZmxvYXRzICYmIFxuICogICAgYXJyYXkubGVuZ3RoID09IDIgfHwgMylcbiAqIEByZXR1cm5zIHtGYW1vdXNNYXRyaXh9IHRoZSByZXN1bHRpbmcgdHJhbnNsYXRlZCBtYXRyaXhcbiAqLyBcbkZhbW91c01hdHJpeC5tb3ZlID0gZnVuY3Rpb24obSwgdCkge1xuICAgIGlmKCF0WzJdKSB0WzJdID0gMDtcbiAgICByZXR1cm4gW21bMF0sIG1bMV0sIG1bMl0sIDAsIG1bNF0sIG1bNV0sIG1bNl0sIDAsIG1bOF0sIG1bOV0sIG1bMTBdLCAwLCBtWzEyXSArIHRbMF0sIG1bMTNdICsgdFsxXSwgbVsxNF0gKyB0WzJdLCAxXTtcbn07XG5cbi8qKlxuICogUmV0dXJuIGEgRmFtb3VzTWF0cml4IHdoaWNoIHJlcHJlc2VudHMgdGhlIHJlc3VsdCBvZiBhIHRyYW5zZm9ybSBtYXRyaXhcbiAqIGFwcGxpZWQgYWZ0ZXIgYSBtb3ZlLiBUaGlzIGlzIGZhc3RlciB0aGFuIHRoZSBlcXVpdmFsZW50IG11bHRpcGx5LlxuICogXG4gKiBAbmFtZSBGYW1vdXNNYXRyaXgjbW92ZVRoZW5cbiAqIEBmdW5jdGlvblxuICpcbiAqIEBwYXJhbSB7QXJyYXkubnVtYmVyfSB2IHZlY3RvciByZXByZXNlbnRpbmcgaW5pdGlhbCBtb3ZlbWVudFxuICogQHBhcmFtIHtGYW1vdXNNYXRyaXh9IG0gbWF0cml4IHRvIGFwcGx5IGFmdGVyd2FyZHNcbiAqIEByZXR1cm5zIHtGYW1vdXNNYXRyaXh9IHRoZSByZXN1bHRpbmcgbWF0cml4XG4gKi9cbkZhbW91c01hdHJpeC5tb3ZlVGhlbiA9IGZ1bmN0aW9uKHYsIG0pIHtcbiAgICBpZighdlsyXSkgdlsyXSA9IDA7XG4gICAgdmFyIHQwID0gdlswXSptWzBdICsgdlsxXSptWzRdICsgdlsyXSptWzhdO1xuICAgIHZhciB0MSA9IHZbMF0qbVsxXSArIHZbMV0qbVs1XSArIHZbMl0qbVs5XTtcbiAgICB2YXIgdDIgPSB2WzBdKm1bMl0gKyB2WzFdKm1bNl0gKyB2WzJdKm1bMTBdO1xuICAgIHJldHVybiBGYW1vdXNNYXRyaXgubW92ZShtLCBbdDAsIHQxLCB0Ml0pO1xufTtcblxuLyoqXG4gKiBSZXR1cm4gYSBGYW1vdXNNYXRyaXggd2hpY2ggcmVwcmVzZW50cyBhIHRyYW5zbGF0aW9uIGJ5IHNwZWNpZmllZFxuICogICAgYW1vdW50cyBpbiBlYWNoIGRpbWVuc2lvbi5cbiAqICAgIFxuICogQG5hbWUgRmFtb3VzTWF0cml4I3RyYW5zbGF0ZVxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0ge251bWJlcn0geCB4IHRyYW5zbGF0aW9uIChkZWx0YV94KVxuICogQHBhcmFtIHtudW1iZXJ9IHkgeSB0cmFuc2xhdGlvbiAoZGVsdGFfeSlcbiAqIEBwYXJhbSB7bnVtYmVyfSB6IHogdHJhbnNsYXRpb24gKGRlbHRhX3opXG4gKiBAcmV0dXJucyB7RmFtb3VzTWF0cml4fSB0aGUgcmVzdWx0aW5nIG1hdHJpeFxuICovIFxuRmFtb3VzTWF0cml4LnRyYW5zbGF0ZSA9IGZ1bmN0aW9uKHgsIHksIHopIHtcbiAgICBpZih6ID09PSB1bmRlZmluZWQpIHogPSAwO1xuICAgIHJldHVybiBbMSwgMCwgMCwgMCwgMCwgMSwgMCwgMCwgMCwgMCwgMSwgMCwgeCwgeSwgeiwgMV07XG59O1xuXG4vKipcbiAqIFJldHVybiBhIEZhbW91c01hdHJpeCB3aGljaCByZXByZXNlbnRzIGEgc2NhbGUgYnkgc3BlY2lmaWVkIGFtb3VudHNcbiAqICAgIGluIGVhY2ggZGltZW5zaW9uLlxuICogICAgXG4gKiBAbmFtZSBGYW1vdXNNYXRyaXgjc2NhbGVcbiAqIEBmdW5jdGlvbiAgXG4gKlxuICogQHBhcmFtIHtudW1iZXJ9IHggeCBzY2FsZSBmYWN0b3JcbiAqIEBwYXJhbSB7bnVtYmVyfSB5IHkgc2NhbGUgZmFjdG9yXG4gKiBAcGFyYW0ge251bWJlcn0geiB6IHNjYWxlIGZhY3RvclxuICogQHJldHVybnMge0ZhbW91c01hdHJpeH0gdGhlIHJlc3VsdGluZyBtYXRyaXhcbiAqLyBcbkZhbW91c01hdHJpeC5zY2FsZSA9IGZ1bmN0aW9uKHgsIHksIHopIHtcbiAgICBpZih6ID09PSB1bmRlZmluZWQpIHogPSAxO1xuICAgIHJldHVybiBbeCwgMCwgMCwgMCwgMCwgeSwgMCwgMCwgMCwgMCwgeiwgMCwgMCwgMCwgMCwgMV07XG59O1xuXG4vKipcbiAqIFJldHVybiBhIEZhbW91c01hdHJpeCB3aGljaCByZXByZXNlbnRzIGEgc3BlY2lmaWVkIGNsb2Nrd2lzZVxuICogICAgcm90YXRpb24gYXJvdW5kIHRoZSB4IGF4aXMuXG4gKiAgICBcbiAqIEBuYW1lIEZhbW91c01hdHJpeCNyb3RhdGVYXG4gKiBAZnVuY3Rpb25cbiAqXG4gKiBAcGFyYW0ge251bWJlcn0gdGhldGEgcmFkaWFuc1xuICogQHJldHVybnMge0ZhbW91c01hdHJpeH0gdGhlIHJlc3VsdGluZyBtYXRyaXhcbiAqLyBcbkZhbW91c01hdHJpeC5yb3RhdGVYID0gZnVuY3Rpb24odGhldGEpIHtcbiAgICB2YXIgY29zVGhldGEgPSBNYXRoLmNvcyh0aGV0YSk7XG4gICAgdmFyIHNpblRoZXRhID0gTWF0aC5zaW4odGhldGEpO1xuICAgIHJldHVybiBbMSwgMCwgMCwgMCwgMCwgY29zVGhldGEsIHNpblRoZXRhLCAwLCAwLCAtc2luVGhldGEsIGNvc1RoZXRhLCAwLCAwLCAwLCAwLCAxXTtcbn07XG5cbi8qKlxuICogUmV0dXJuIGEgRmFtb3VzTWF0cml4IHdoaWNoIHJlcHJlc2VudHMgYSBzcGVjaWZpZWQgY2xvY2t3aXNlXG4gKiAgICByb3RhdGlvbiBhcm91bmQgdGhlIHkgYXhpcy5cbiAqICAgIFxuICogQG5hbWUgRmFtb3VzTWF0cml4I3JvdGF0ZVlcbiAqIEBmdW5jdGlvblxuICpcbiAqIEByZXR1cm5zIHtGYW1vdXNNYXRyaXh9IHRoZSByZXN1bHRpbmcgbWF0cml4XG4gKi8gXG5GYW1vdXNNYXRyaXgucm90YXRlWSA9IGZ1bmN0aW9uKHRoZXRhKSB7XG4gICAgdmFyIGNvc1RoZXRhID0gTWF0aC5jb3ModGhldGEpO1xuICAgIHZhciBzaW5UaGV0YSA9IE1hdGguc2luKHRoZXRhKTtcbiAgICByZXR1cm4gW2Nvc1RoZXRhLCAwLCAtc2luVGhldGEsIDAsIDAsIDEsIDAsIDAsIHNpblRoZXRhLCAwLCBjb3NUaGV0YSwgMCwgMCwgMCwgMCwgMV07XG59O1xuXG4vKipcbiAqIFJldHVybiBhIEZhbW91c01hdHJpeCB3aGljaCByZXByZXNlbnRzIGEgc3BlY2lmaWVkIGNsb2Nrd2lzZVxuICogICAgcm90YXRpb24gYXJvdW5kIHRoZSB6IGF4aXMuXG4gKiAgICBcbiAqIEBuYW1lIEZhbW91c01hdHJpeCNyb3RhdGVaXG4gKiBAZnVuY3Rpb25cbiAqXG4gKiBAcGFyYW0ge251bWJlcn0gdGhldGEgcmFkaWFuc1xuICogQHJldHVybnMge0ZhbW91c01hdHJpeH0gdGhlIHJlc3VsdGluZyBtYXRyaXhcbiAqLyBcbkZhbW91c01hdHJpeC5yb3RhdGVaID0gZnVuY3Rpb24odGhldGEpIHtcbiAgICB2YXIgY29zVGhldGEgPSBNYXRoLmNvcyh0aGV0YSk7XG4gICAgdmFyIHNpblRoZXRhID0gTWF0aC5zaW4odGhldGEpO1xuICAgIHJldHVybiBbY29zVGhldGEsIHNpblRoZXRhLCAwLCAwLCAtc2luVGhldGEsIGNvc1RoZXRhLCAwLCAwLCAwLCAwLCAxLCAwLCAwLCAwLCAwLCAxXTtcbn07XG5cbi8qKlxuICogUmV0dXJuIGEgRmFtb3VzTWF0cml4IHdoaWNoIHJlcHJlc2VudHMgY29tcG9zZWQgY2xvY2t3aXNlXG4gKiAgICByb3RhdGlvbnMgYWxvbmcgZWFjaCBvZiB0aGUgYXhlcy4gRXF1aXZhbGVudCB0byB0aGUgcmVzdWx0IG9mXG4gKiAgICBtdWx0aXBseShyb3RhdGVYKHBoaSksIHJvdGF0ZVkodGhldGEpLCByb3RhdGVaKHBzaSkpXG4gKiAgICBcbiAqIEBuYW1lIEZhbW91c01hdHJpeCNyb3RhdGVcbiAqIEBmdW5jdGlvblxuICpcbiAqIEBwYXJhbSB7bnVtYmVyfSBwaGkgcmFkaWFucyB0byByb3RhdGUgYWJvdXQgdGhlIHBvc2l0aXZlIHggYXhpc1xuICogQHBhcmFtIHtudW1iZXJ9IHRoZXRhIHJhZGlhbnMgdG8gcm90YXRlIGFib3V0IHRoZSBwb3NpdGl2ZSB5IGF4aXNcbiAqIEBwYXJhbSB7bnVtYmVyfSBwc2kgcmFkaWFucyB0byByb3RhdGUgYWJvdXQgdGhlIHBvc2l0aXZlIHogYXhpc1xuICogQHJldHVybnMge0ZhbW91c01hdHJpeH0gdGhlIHJlc3VsdGluZyBtYXRyaXhcbiAqLyBcbkZhbW91c01hdHJpeC5yb3RhdGUgPSBmdW5jdGlvbihwaGksIHRoZXRhLCBwc2kpIHtcbiAgICB2YXIgY29zUGhpID0gTWF0aC5jb3MocGhpKTtcbiAgICB2YXIgc2luUGhpID0gTWF0aC5zaW4ocGhpKTtcbiAgICB2YXIgY29zVGhldGEgPSBNYXRoLmNvcyh0aGV0YSk7XG4gICAgdmFyIHNpblRoZXRhID0gTWF0aC5zaW4odGhldGEpO1xuICAgIHZhciBjb3NQc2kgPSBNYXRoLmNvcyhwc2kpO1xuICAgIHZhciBzaW5Qc2kgPSBNYXRoLnNpbihwc2kpO1xuICAgIHZhciByZXN1bHQgPSBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMV07XG4gICAgcmVzdWx0WzBdID0gY29zVGhldGEgKiBjb3NQc2k7XG4gICAgcmVzdWx0WzFdID0gY29zUGhpICogc2luUHNpICsgc2luUGhpICogc2luVGhldGEgKiBjb3NQc2k7XG4gICAgcmVzdWx0WzJdID0gc2luUGhpICogc2luUHNpIC0gY29zUGhpICogc2luVGhldGEgKiBjb3NQc2k7XG4gICAgcmVzdWx0WzRdID0gLWNvc1RoZXRhICogc2luUHNpO1xuICAgIHJlc3VsdFs1XSA9IGNvc1BoaSAqIGNvc1BzaSAtIHNpblBoaSAqIHNpblRoZXRhICogc2luUHNpO1xuICAgIHJlc3VsdFs2XSA9IHNpblBoaSAqIGNvc1BzaSArIGNvc1BoaSAqIHNpblRoZXRhICogc2luUHNpO1xuICAgIHJlc3VsdFs4XSA9IHNpblRoZXRhO1xuICAgIHJlc3VsdFs5XSA9IC1zaW5QaGkgKiBjb3NUaGV0YTtcbiAgICByZXN1bHRbMTBdID0gY29zUGhpICogY29zVGhldGE7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn07XG5cbi8qKlxuICogUmV0dXJuIGEgRmFtb3VzTWF0cml4IHdoaWNoIHJlcHJlc2VudHMgYW4gYXhpcy1hbmdsZSByb3RhdGlvblxuICpcbiAqIEBuYW1lIEZhbW91c01hdHJpeCNyb3RhdGVBeGlzXG4gKiBAZnVuY3Rpb25cbiAqXG4gKiBAcGFyYW0ge0FycmF5Lm51bWJlcn0gdiB1bml0IHZlY3RvciByZXByZXNlbnRpbmcgdGhlIGF4aXMgdG8gcm90YXRlIGFib3V0XG4gKiBAcGFyYW0ge251bWJlcn0gdGhldGEgcmFkaWFucyB0byByb3RhdGUgY2xvY2t3aXNlIGFib3V0IHRoZSBheGlzXG4gKiBAcmV0dXJucyB7RmFtb3VzTWF0cml4fSB0aGUgcmVzdWx0aW5nIG1hdHJpeFxuICovIFxuRmFtb3VzTWF0cml4LnJvdGF0ZUF4aXMgPSBmdW5jdGlvbih2LCB0aGV0YSkge1xuICAgIHZhciBzaW5UaGV0YSA9IE1hdGguc2luKHRoZXRhKTtcbiAgICB2YXIgY29zVGhldGEgPSBNYXRoLmNvcyh0aGV0YSk7XG4gICAgdmFyIHZlclRoZXRhID0gMSAtIGNvc1RoZXRhOyAvLyB2ZXJzaW5lIG9mIHRoZXRhXG5cbiAgICB2YXIgeHhWID0gdlswXSp2WzBdKnZlclRoZXRhO1xuICAgIHZhciB4eVYgPSB2WzBdKnZbMV0qdmVyVGhldGE7XG4gICAgdmFyIHh6ViA9IHZbMF0qdlsyXSp2ZXJUaGV0YTtcbiAgICB2YXIgeXlWID0gdlsxXSp2WzFdKnZlclRoZXRhO1xuICAgIHZhciB5elYgPSB2WzFdKnZbMl0qdmVyVGhldGE7XG4gICAgdmFyIHp6ViA9IHZbMl0qdlsyXSp2ZXJUaGV0YTtcbiAgICB2YXIgeHMgPSB2WzBdKnNpblRoZXRhO1xuICAgIHZhciB5cyA9IHZbMV0qc2luVGhldGE7XG4gICAgdmFyIHpzID0gdlsyXSpzaW5UaGV0YTtcblxuICAgIHZhciByZXN1bHQgPSBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMV07XG4gICAgcmVzdWx0WzBdID0geHhWICsgY29zVGhldGE7XG4gICAgcmVzdWx0WzFdID0geHlWICsgenM7XG4gICAgcmVzdWx0WzJdID0geHpWIC0geXM7XG4gICAgcmVzdWx0WzRdID0geHlWIC0genM7XG4gICAgcmVzdWx0WzVdID0geXlWICsgY29zVGhldGE7XG4gICAgcmVzdWx0WzZdID0geXpWICsgeHM7XG4gICAgcmVzdWx0WzhdID0geHpWICsgeXM7XG4gICAgcmVzdWx0WzldID0geXpWIC0geHM7XG4gICAgcmVzdWx0WzEwXSA9IHp6ViArIGNvc1RoZXRhO1xuICAgIHJldHVybiByZXN1bHQ7XG59O1xuXG4vKipcbiAqIFJldHVybiBhIEZhbW91c01hdHJpeCB3aGljaCByZXByZXNlbnRzIGEgdHJhbnNmb3JtIG1hdHJpeCBhcHBsaWVkIGFib3V0XG4gKiBhIHNlcGFyYXRlIG9yaWdpbiBwb2ludC5cbiAqIFxuICogQG5hbWUgRmFtb3VzTWF0cml4I2Fib3V0T3JpZ2luXG4gKiBAZnVuY3Rpb25cbiAqXG4gKiBAcGFyYW0ge0FycmF5Lm51bWJlcn0gdiBvcmlnaW4gcG9pbnQgdG8gYXBwbHkgbWF0cml4XG4gKiBAcGFyYW0ge0ZhbW91c01hdHJpeH0gbSBtYXRyaXggdG8gYXBwbHlcbiAqIEByZXR1cm5zIHtGYW1vdXNNYXRyaXh9IHRoZSByZXN1bHRpbmcgbWF0cml4XG4gKi9cbkZhbW91c01hdHJpeC5hYm91dE9yaWdpbiA9IGZ1bmN0aW9uKHYsIG0pIHtcbiAgICB2YXIgdDAgPSB2WzBdIC0gKHZbMF0qbVswXSArIHZbMV0qbVs0XSArIHZbMl0qbVs4XSk7XG4gICAgdmFyIHQxID0gdlsxXSAtICh2WzBdKm1bMV0gKyB2WzFdKm1bNV0gKyB2WzJdKm1bOV0pO1xuICAgIHZhciB0MiA9IHZbMl0gLSAodlswXSptWzJdICsgdlsxXSptWzZdICsgdlsyXSptWzEwXSk7XG4gICAgcmV0dXJuIEZhbW91c01hdHJpeC5tb3ZlKG0sIFt0MCwgdDEsIHQyXSk7XG59O1xuXG4vKipcbiAqIFJldHVybiBhIEZhbW91c01hdHJpeCdzIHdlYmtpdCBjc3MgcmVwcmVzZW50YXRpb24gdG8gYmUgdXNlZCB3aXRoIHRoZVxuICogICAgQ1NTMyAtd2Via2l0LXRyYW5zZm9ybSBzdHlsZS4gXG4gKiBAZXhhbXBsZTogLXdlYmtpdC10cmFuc2Zvcm06IG1hdHJpeDNkKDEsMCwwLDAsMCwxLDAsMCwwLDAsMSwwLDcxNiwyNDMsMCwxKVxuICpcbiAqIEBuYW1lIEZhbW91c01hdHJpeCNmb3JtYXRDU1NcbiAqIEBmdW5jdGlvblxuICogXG4gKiBAcGFyYW0ge0ZhbW91c01hdHJpeH0gbSBhIEZhbW91cyBtYXRyaXhcbiAqIEByZXR1cm5zIHtzdHJpbmd9IG1hdHJpeDNkIENTUyBzdHlsZSByZXByZXNlbnRhdGlvbiBvZiB0aGUgdHJhbnNmb3JtXG4gKi8gXG5GYW1vdXNNYXRyaXguZm9ybWF0Q1NTID0gZnVuY3Rpb24obSkge1xuICAgIHZhciBuID0gbS5zbGljZSgwKTtcbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgbi5sZW5ndGg7IGkrKykgaWYobltpXSA8IDAuMDAwMDAxICYmIG5baV0gPiAtMC4wMDAwMDEpIG5baV0gPSAwO1xuICAgIHJldHVybiAnbWF0cml4M2QoJyArIG4uam9pbigpICsgJyknO1xufTtcblxuLyoqXG4gKiBSZXR1cm4gYSBGYW1vdXNNYXRyaXggcmVwcmVzZW50YXRpa29uIG9mIGEgc2tldyB0cmFuc2Zvcm1hdGlvblxuICpcbiAqIEBuYW1lIEZhbW91c01hdHJpeCNza2V3XG4gKiBAZnVuY3Rpb25cbiAqIFxuICogQHBhcmFtIHtudW1iZXJ9IHBzaSByYWRpYW5zIHNrZXdlZCBhYm91dCB0aGUgeXogcGxhbmVcbiAqIEBwYXJhbSB7bnVtYmVyfSB0aGV0YSByYWRpYW5zIHNrZXdlZCBhYm91dCB0aGUgeHogcGxhbmVcbiAqIEBwYXJhbSB7bnVtYmVyfSBwaGkgcmFkaWFucyBza2V3ZWQgYWJvdXQgdGhlIHh5IHBsYW5lXG4gKiBAcmV0dXJucyB7RmFtb3VzTWF0cml4fSB0aGUgcmVzdWx0aW5nIG1hdHJpeFxuICovIFxuRmFtb3VzTWF0cml4LnNrZXcgPSBmdW5jdGlvbihwaGksIHRoZXRhLCBwc2kpIHtcbiAgICByZXR1cm4gWzEsIDAsIDAsIDAsIE1hdGgudGFuKHBzaSksIDEsIDAsIDAsIE1hdGgudGFuKHRoZXRhKSwgTWF0aC50YW4ocGhpKSwgMSwgMCwgMCwgMCwgMCwgMV07XG59O1xuXG4vKipcbiAqIFJldHVybiB0cmFuc2xhdGlvbiB2ZWN0b3IgY29tcG9uZW50IG9mIGdpdmVuIEZhbW91c01hdHJpeFxuICogXG4gKiBAbmFtZSBGYW1vdXNNYXRyaXgjZ2V0VHJhbnNsYXRlXG4gKiBAZnVuY3Rpb25cbiAqXG4gKiBAcGFyYW0ge0ZhbW91c01hdHJpeH0gbSBtYXRyaXhcbiAqIEByZXR1cm5zIHtBcnJheS48bnVtYmVyPn0gdGhlIHRyYW5zbGF0aW9uIHZlY3RvciBbdF94LCB0X3ksIHRfel1cbiAqLyBcbkZhbW91c01hdHJpeC5nZXRUcmFuc2xhdGUgPSBmdW5jdGlvbihtKSB7XG4gICAgcmV0dXJuIFttWzEyXSwgbVsxM10sIG1bMTRdXTtcbn07XG5cbi8qKlxuICogUmV0dXJuIGludmVyc2UgYWZmaW5lIG1hdHJpeCBmb3IgZ2l2ZW4gRmFtb3VzTWF0cml4LiBcbiAqIE5vdGU6IFRoaXMgYXNzdW1lcyBtWzNdID0gbVs3XSA9IG1bMTFdID0gMCwgYW5kIG1bMTVdID0gMS4gXG4gKiAgICAgICBJbmNvcnJlY3QgcmVzdWx0cyBpZiBub3QgaW52ZXJ0YWJsZSBvciBwcmVjb25kaXRpb25zIG5vdCBtZXQuXG4gKlxuICogQG5hbWUgRmFtb3VzTWF0cml4I2ludmVyc2VcbiAqIEBmdW5jdGlvblxuICogXG4gKiBAcGFyYW0ge0ZhbW91c01hdHJpeH0gbSBtYXRyaXhcbiAqIEByZXR1cm5zIHtGYW1vdXNNYXRyaXh9IHRoZSByZXN1bHRpbmcgaW52ZXJ0ZWQgbWF0cml4XG4gKi8gXG5GYW1vdXNNYXRyaXguaW52ZXJzZSA9IGZ1bmN0aW9uKG0pIHtcbiAgICB2YXIgcmVzdWx0ID0gWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDFdO1xuICAgIC8vIG9ubHkgbmVlZCB0byBjb25zaWRlciAzeDMgc2VjdGlvbiBmb3IgYWZmaW5lXG4gICAgdmFyIGMwID0gbVs1XSptWzEwXSAtIG1bNl0qbVs5XTtcbiAgICB2YXIgYzEgPSBtWzRdKm1bMTBdIC0gbVs2XSptWzhdO1xuICAgIHZhciBjMiA9IG1bNF0qbVs5XSAtIG1bNV0qbVs4XTtcbiAgICB2YXIgYzQgPSBtWzFdKm1bMTBdIC0gbVsyXSptWzldO1xuICAgIHZhciBjNSA9IG1bMF0qbVsxMF0gLSBtWzJdKm1bOF07XG4gICAgdmFyIGM2ID0gbVswXSptWzldIC0gbVsxXSptWzhdO1xuICAgIHZhciBjOCA9IG1bMV0qbVs2XSAtIG1bMl0qbVs1XTtcbiAgICB2YXIgYzkgPSBtWzBdKm1bNl0gLSBtWzJdKm1bNF07XG4gICAgdmFyIGMxMCA9IG1bMF0qbVs1XSAtIG1bMV0qbVs0XTtcbiAgICB2YXIgZGV0TSA9IG1bMF0qYzAgLSBtWzFdKmMxICsgbVsyXSpjMjtcbiAgICB2YXIgaW52RCA9IDEvZGV0TTtcbiAgICByZXN1bHRbMF0gPSBpbnZEICogYzA7XG4gICAgcmVzdWx0WzFdID0gLWludkQgKiBjNDtcbiAgICByZXN1bHRbMl0gPSBpbnZEICogYzg7XG4gICAgcmVzdWx0WzRdID0gLWludkQgKiBjMTtcbiAgICByZXN1bHRbNV0gPSBpbnZEICogYzU7XG4gICAgcmVzdWx0WzZdID0gLWludkQgKiBjOTtcbiAgICByZXN1bHRbOF0gPSBpbnZEICogYzI7XG4gICAgcmVzdWx0WzldID0gLWludkQgKiBjNjtcbiAgICByZXN1bHRbMTBdID0gaW52RCAqIGMxMDtcbiAgICByZXN1bHRbMTJdID0gLW1bMTJdKnJlc3VsdFswXSAtIG1bMTNdKnJlc3VsdFs0XSAtIG1bMTRdKnJlc3VsdFs4XTtcbiAgICByZXN1bHRbMTNdID0gLW1bMTJdKnJlc3VsdFsxXSAtIG1bMTNdKnJlc3VsdFs1XSAtIG1bMTRdKnJlc3VsdFs5XTtcbiAgICByZXN1bHRbMTRdID0gLW1bMTJdKnJlc3VsdFsyXSAtIG1bMTNdKnJlc3VsdFs2XSAtIG1bMTRdKnJlc3VsdFsxMF07XG4gICAgcmV0dXJuIHJlc3VsdDtcbn07XG5cbi8qKlxuICogRGVjb21wb3NlIEZhbW91c01hdHJpeCBpbnRvIHNlcGFyYXRlIC50cmFuc2xhdGUsIC5yb3RhdGUsIC5zY2FsZSxcbiAqICAgIC5za2V3IGNvbXBvbmVudHMuXG4gKiAgICBcbiAqIEBuYW1lIEZhbW91c01hdHJpeCNpbnRlcnByZXRcbiAqIEBmdW5jdGlvblxuICpcbiAqIEBwYXJhbSB7RmFtb3VzTWF0cml4fSBNIG1hdHJpeFxuICogQHJldHVybnMge21hdHJpeFNwZWN9IG9iamVjdCB3aXRoIGNvbXBvbmVudCBtYXRyaWNlcyAudHJhbnNsYXRlLFxuICogICAgLnJvdGF0ZSwgLnNjYWxlLCAuc2tld1xuICovIFxuRmFtb3VzTWF0cml4LmludGVycHJldCA9IGZ1bmN0aW9uKE0pIHtcblxuICAgIC8vIFFSIGRlY29tcG9zaXRpb24gdmlhIEhvdXNlaG9sZGVyIHJlZmxlY3Rpb25zXG5cbiAgICBmdW5jdGlvbiBub3JtU3F1YXJlZCh2KXtcbiAgICAgICAgaWYgKHYubGVuZ3RoID09IDIpXG4gICAgICAgICAgICByZXR1cm4gdlswXSp2WzBdICsgdlsxXSp2WzFdO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXR1cm4gdlswXSp2WzBdICsgdlsxXSp2WzFdICsgdlsyXSp2WzJdO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBub3JtKHYpe1xuICAgICAgICByZXR1cm4gTWF0aC5zcXJ0KG5vcm1TcXVhcmVkKHYpKTtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gc2lnbihuKXtcbiAgICAgICAgcmV0dXJuIChuIDwgMCkgPyAtMSA6IDE7XG4gICAgfTtcblxuXG4gICAgLy9GSVJTVCBJVEVSQVRJT05cblxuICAgIC8vZGVmYXVsdCBRMSB0byB0aGUgaWRlbnRpdHkgbWF0cml4O1xuICAgIHZhciB4ID0gW01bMF0sIE1bMV0sIE1bMl1dOyAgICAgICAgICAgICAgICAgLy8gZmlyc3QgY29sdW1uIHZlY3RvclxuICAgIHZhciBzZ24gPSBzaWduKHhbMF0pOyAgICAgICAgICAgICAgICAgICAgICAgLy8gc2lnbiBvZiBmaXJzdCBjb21wb25lbnQgb2YgeCAoZm9yIHN0YWJpbGl0eSlcbiAgICB2YXIgeE5vcm0gPSBub3JtKHgpOyAgICAgICAgICAgICAgICAgICAgICAgLy8gbm9ybSBvZiBmaXJzdCBjb2x1bW4gdmVjdG9yXG4gICAgdmFyIHYgPSBbeFswXSArIHNnbiAqIHhOb3JtLCB4WzFdLCB4WzJdXTsgIC8vIHYgPSB4ICsgc2lnbih4WzBdKXx4fGUxXG4gICAgdmFyIG11bHQgPSAyIC8gbm9ybVNxdWFyZWQodik7ICAgICAgICAgICAgICAvLyBtdWx0ID0gMi92J3ZcblxuICAgIC8vZXZhbHVhdGUgUTEgPSBJIC0gMnZ2Jy92J3ZcbiAgICB2YXIgUTEgPSBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMV07XG5cbiAgICAvL2RpYWdvbmFsc1xuICAgIFExWzBdICA9IDEgLSBtdWx0ICogdlswXSAqIHZbMF07ICAgIC8vIDAsMCBlbnRyeVxuICAgIFExWzVdICA9IDEgLSBtdWx0ICogdlsxXSAqIHZbMV07ICAgIC8vIDEsMSBlbnRyeVxuICAgIFExWzEwXSA9IDEgLSBtdWx0ICogdlsyXSAqIHZbMl07ICAgIC8vIDIsMiBlbnRyeVxuXG4gICAgLy91cHBlciBkaWFnb25hbFxuICAgIFExWzFdID0gLW11bHQgKiB2WzBdICogdlsxXTsgICAgICAgIC8vIDAsMSBlbnRyeVxuICAgIFExWzJdID0gLW11bHQgKiB2WzBdICogdlsyXTsgICAgICAgIC8vIDAsMiBlbnRyeVxuICAgIFExWzZdID0gLW11bHQgKiB2WzFdICogdlsyXTsgICAgICAgIC8vIDEsMiBlbnRyeVxuXG4gICAgLy9sb3dlciBkaWFnb25hbFxuICAgIFExWzRdID0gUTFbMV07ICAgICAgICAgICAgICAgICAgICAgIC8vIDEsMCBlbnRyeVxuICAgIFExWzhdID0gUTFbMl07ICAgICAgICAgICAgICAgICAgICAgIC8vIDIsMCBlbnRyeVxuICAgIFExWzldID0gUTFbNl07ICAgICAgICAgICAgICAgICAgICAgIC8vIDIsMSBlbnRyeVxuXG4gICAgLy9yZWR1Y2UgZmlyc3QgY29sdW1uIG9mIE1cbiAgICB2YXIgTVExID0gRmFtb3VzTWF0cml4Lm11bHRpcGx5KE0sIFExKTtcblxuXG4gICAgLy9TRUNPTkQgSVRFUkFUSU9OIG9uICgxLDEpIG1pbm9yXG4gICAgdmFyIHgyID0gW01RMVs1XSwgTVExWzZdXTtcbiAgICB2YXIgc2duMiA9IHNpZ24oeDJbMF0pOyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHNpZ24gb2YgZmlyc3QgY29tcG9uZW50IG9mIHggKGZvciBzdGFiaWxpdHkpXG4gICAgdmFyIHgyTm9ybSA9IG5vcm0oeDIpOyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIG5vcm0gb2YgZmlyc3QgY29sdW1uIHZlY3RvclxuICAgIHZhciB2MiA9IFt4MlswXSArIHNnbjIgKiB4Mk5vcm0sIHgyWzFdXTsgICAgICAgICAgICAvLyB2ID0geCArIHNpZ24oeFswXSl8eHxlMVxuICAgIHZhciBtdWx0MiA9IDIgLyBub3JtU3F1YXJlZCh2Mik7ICAgICAgICAgICAgICAgICAgICAgLy8gbXVsdCA9IDIvdid2XG5cbiAgICAvL2V2YWx1YXRlIFEyID0gSSAtIDJ2dicvdid2XG4gICAgdmFyIFEyID0gWzEsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDFdO1xuXG4gICAgLy9kaWFnb25hbFxuICAgIFEyWzVdICA9IDEgLSBtdWx0MiAqIHYyWzBdICogdjJbMF07IC8vIDEsMSBlbnRyeVxuICAgIFEyWzEwXSA9IDEgLSBtdWx0MiAqIHYyWzFdICogdjJbMV07IC8vIDIsMiBlbnRyeVxuXG4gICAgLy9vZmYgZGlhZ29uYWxzXG4gICAgUTJbNl0gPSAtbXVsdDIgKiB2MlswXSAqIHYyWzFdOyAgICAgLy8gMiwxIGVudHJ5XG4gICAgUTJbOV0gPSBRMls2XTsgICAgICAgICAgICAgICAgICAgICAgLy8gMSwyIGVudHJ5XG5cblxuICAgIC8vY2FsYyBRUiBkZWNvbXBvc2l0aW9uLiBRID0gUTEqUTIsIFIgPSBRJypNXG4gICAgdmFyIFEgPSBGYW1vdXNNYXRyaXgubXVsdGlwbHkoUTEsIFEyKTsgICAgICAgICAgICAgIC8vbm90ZTogcmVhbGx5IFEgdHJhbnNwb3NlXG4gICAgdmFyIFIgPSBGYW1vdXNNYXRyaXgubXVsdGlwbHkoTSwgUSk7XG5cbiAgICAvL3JlbW92ZSBuZWdhdGl2ZSBzY2FsaW5nXG4gICAgdmFyIHJlbW92ZXIgPSBGYW1vdXNNYXRyaXguc2NhbGUoUlswXSA8IDAgPyAtMSA6IDEsIFJbNV0gPCAwID8gLTEgOiAxLCBSWzEwXSA8IDAgPyAtMSA6IDEpO1xuICAgIFIgPSBGYW1vdXNNYXRyaXgubXVsdGlwbHkocmVtb3ZlciwgUik7XG4gICAgUSA9IEZhbW91c01hdHJpeC5tdWx0aXBseShRLCByZW1vdmVyKTtcblxuICAgIC8vZGVjb21wb3NlIGludG8gcm90YXRlL3NjYWxlL3NrZXcgbWF0cmljZXNcbiAgICB2YXIgcmVzdWx0ID0ge307XG4gICAgcmVzdWx0LnRyYW5zbGF0ZSA9IEZhbW91c01hdHJpeC5nZXRUcmFuc2xhdGUoTSk7XG4gICAgcmVzdWx0LnJvdGF0ZSA9IFtNYXRoLmF0YW4yKC1RWzZdLCBRWzEwXSksIE1hdGguYXNpbihRWzJdKSwgTWF0aC5hdGFuMigtUVsxXSwgUVswXSldO1xuICAgIGlmKCFyZXN1bHQucm90YXRlWzBdKSB7XG4gICAgICAgIHJlc3VsdC5yb3RhdGVbMF0gPSAwO1xuICAgICAgICByZXN1bHQucm90YXRlWzJdID0gTWF0aC5hdGFuMihRWzRdLCBRWzVdKTtcbiAgICB9XG4gICAgcmVzdWx0LnNjYWxlID0gW1JbMF0sIFJbNV0sIFJbMTBdXTtcbiAgICByZXN1bHQuc2tldyA9IFtNYXRoLmF0YW4oUls5XS9yZXN1bHQuc2NhbGVbMl0pLCBNYXRoLmF0YW4oUls4XS9yZXN1bHQuc2NhbGVbMl0pLCBNYXRoLmF0YW4oUls0XS9yZXN1bHQuc2NhbGVbMF0pXTtcblxuICAgIC8vZG91YmxlIHJvdGF0aW9uIHdvcmthcm91bmRcbiAgICBpZihNYXRoLmFicyhyZXN1bHQucm90YXRlWzBdKSArIE1hdGguYWJzKHJlc3VsdC5yb3RhdGVbMl0pID4gMS41Kk1hdGguUEkpIHtcbiAgICAgICAgcmVzdWx0LnJvdGF0ZVsxXSA9IE1hdGguUEkgLSByZXN1bHQucm90YXRlWzFdO1xuICAgICAgICBpZihyZXN1bHQucm90YXRlWzFdID4gTWF0aC5QSSkgcmVzdWx0LnJvdGF0ZVsxXSAtPSAyKk1hdGguUEk7XG4gICAgICAgIGlmKHJlc3VsdC5yb3RhdGVbMV0gPCAtTWF0aC5QSSkgcmVzdWx0LnJvdGF0ZVsxXSArPSAyKk1hdGguUEk7XG4gICAgICAgIGlmKHJlc3VsdC5yb3RhdGVbMF0gPCAwKSByZXN1bHQucm90YXRlWzBdICs9IE1hdGguUEk7XG4gICAgICAgIGVsc2UgcmVzdWx0LnJvdGF0ZVswXSAtPSBNYXRoLlBJO1xuICAgICAgICBpZihyZXN1bHQucm90YXRlWzJdIDwgMCkgcmVzdWx0LnJvdGF0ZVsyXSArPSBNYXRoLlBJO1xuICAgICAgICBlbHNlIHJlc3VsdC5yb3RhdGVbMl0gLT0gTWF0aC5QSTtcbiAgICB9ICAgXG5cbiAgICByZXR1cm4gcmVzdWx0O1xuXG59O1xuXG4vKipcbiAqIENvbXBvc2UgLnRyYW5zbGF0ZSwgLnJvdGF0ZSwgLnNjYWxlLCAuc2tldyBjb21wb25lbnRzIGludG8gaW50b1xuICogICAgRmFtb3VzTWF0cml4XG4gKiAgICBcbiAqIEBuYW1lIEZhbW91c01hdHJpeCNidWlsZFxuICogQGZ1bmN0aW9uXG4gKlxuICogQHBhcmFtIHttYXRyaXhTcGVjfSBzcGVjIG9iamVjdCB3aXRoIGNvbXBvbmVudCBtYXRyaWNlcyAudHJhbnNsYXRlLFxuICogICAgLnJvdGF0ZSwgLnNjYWxlLCAuc2tld1xuICogQHJldHVybnMge0ZhbW91c01hdHJpeH0gY29tcG9zZWQgbWFydGl4XG4gKi8gXG5GYW1vdXNNYXRyaXguYnVpbGQgPSBmdW5jdGlvbihzcGVjKSB7XG4gICAgdmFyIHNjYWxlTWF0cml4ID0gRmFtb3VzTWF0cml4LnNjYWxlKHNwZWMuc2NhbGVbMF0sIHNwZWMuc2NhbGVbMV0sIHNwZWMuc2NhbGVbMl0pO1xuICAgIHZhciBza2V3TWF0cml4ID0gRmFtb3VzTWF0cml4LnNrZXcoc3BlYy5za2V3WzBdLCBzcGVjLnNrZXdbMV0sIHNwZWMuc2tld1syXSk7XG4gICAgdmFyIHJvdGF0ZU1hdHJpeCA9IEZhbW91c01hdHJpeC5yb3RhdGUoc3BlYy5yb3RhdGVbMF0sIHNwZWMucm90YXRlWzFdLCBzcGVjLnJvdGF0ZVsyXSk7XG4gICAgcmV0dXJuIEZhbW91c01hdHJpeC5tb3ZlKEZhbW91c01hdHJpeC5tdWx0aXBseShzY2FsZU1hdHJpeCwgc2tld01hdHJpeCwgcm90YXRlTWF0cml4KSwgc3BlYy50cmFuc2xhdGUpO1xufTtcblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgdHdvIEZhbW91c01hdHJpeGVzIGFyZSBjb21wb25lbnQtd2lzZSBlcXVhbFxuICogXG4gKiBAbmFtZSBGYW1vdXNNYXRyaXgjZXF1YWxzXG4gKiBAZnVuY3Rpb25cbiAqIFxuICogQHBhcmFtIHtGYW1vdXNNYXRyaXh9IGEgbWF0cml4XG4gKiBAcGFyYW0ge0ZhbW91c01hdHJpeH0gYiBtYXRyaXhcbiAqIEByZXR1cm5zIHtib29sZWFufSBcbiAqLyBcbkZhbW91c01hdHJpeC5lcXVhbHMgPSBmdW5jdGlvbihhLCBiKSB7XG4gICAgaWYoYSA9PT0gYikgcmV0dXJuIHRydWU7XG4gICAgaWYoIWEgfHwgIWIpIHJldHVybiBmYWxzZTtcbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgYS5sZW5ndGg7IGkrKykgaWYoYVtpXSAhPSBiW2ldKSByZXR1cm4gZmFsc2U7XG4gICAgcmV0dXJuIHRydWU7XG59O1xuXG4vKipcbiAqIENvbnN0cmFpbiBhbmdsZS10cmlvIGNvbXBvbmVudHMgdG8gcmFuZ2Ugb2YgWy1waSwgcGkpLlxuICpcbiAqIEBuYW1lIEZhbW91c01hdHJpeCNub3JtYWxpemVSb3RhdGlvblxuICogQGZ1bmN0aW9uXG4gKiBcbiAqIEBwYXJhbSB7QXJyYXkuPG51bWJlcj59IHJvdGF0aW9uIHBoaSwgdGhldGEsIHBzaSAoYXJyYXkgb2YgZmxvYXRzIFxuICogICAgJiYgYXJyYXkubGVuZ3RoID09IDMpXG4gKiBAcmV0dXJucyB7QXJyYXkuPG51bWJlcj59IG5ldyBwaGksIHRoZXRhLCBwc2kgdHJpcGxldFxuICogICAgKGFycmF5IG9mIGZsb2F0cyAmJiBhcnJheS5sZW5ndGggPT0gMylcbiAqLyBcbkZhbW91c01hdHJpeC5ub3JtYWxpemVSb3RhdGlvbiA9IGZ1bmN0aW9uKHJvdGF0aW9uKSB7XG4gICAgdmFyIHJlc3VsdCA9IHJvdGF0aW9uLnNsaWNlKDApO1xuICAgIGlmKHJlc3VsdFswXSA9PSBNYXRoLlBJLzIgfHwgcmVzdWx0WzBdID09IC1NYXRoLlBJLzIpIHtcbiAgICAgICAgcmVzdWx0WzBdID0gLXJlc3VsdFswXTtcbiAgICAgICAgcmVzdWx0WzFdID0gTWF0aC5QSSAtIHJlc3VsdFsxXTtcbiAgICAgICAgcmVzdWx0WzJdIC09IE1hdGguUEk7XG4gICAgfVxuICAgIGlmKHJlc3VsdFswXSA+IE1hdGguUEkvMikge1xuICAgICAgICByZXN1bHRbMF0gPSByZXN1bHRbMF0gLSBNYXRoLlBJO1xuICAgICAgICByZXN1bHRbMV0gPSBNYXRoLlBJIC0gcmVzdWx0WzFdO1xuICAgICAgICByZXN1bHRbMl0gLT0gTWF0aC5QSTtcbiAgICB9XG4gICAgaWYocmVzdWx0WzBdIDwgLU1hdGguUEkvMikge1xuICAgICAgICByZXN1bHRbMF0gPSByZXN1bHRbMF0gKyBNYXRoLlBJO1xuICAgICAgICByZXN1bHRbMV0gPSAtTWF0aC5QSSAtIHJlc3VsdFsxXTtcbiAgICAgICAgcmVzdWx0WzJdIC09IE1hdGguUEk7XG4gICAgfVxuICAgIHdoaWxlKHJlc3VsdFsxXSA8IC1NYXRoLlBJKSByZXN1bHRbMV0gKz0gMipNYXRoLlBJO1xuICAgIHdoaWxlKHJlc3VsdFsxXSA+PSBNYXRoLlBJKSByZXN1bHRbMV0gLT0gMipNYXRoLlBJO1xuICAgIHdoaWxlKHJlc3VsdFsyXSA8IC1NYXRoLlBJKSByZXN1bHRbMl0gKz0gMipNYXRoLlBJO1xuICAgIHdoaWxlKHJlc3VsdFsyXSA+PSBNYXRoLlBJKSByZXN1bHRbMl0gLT0gMipNYXRoLlBJO1xuICAgIHJldHVybiByZXN1bHQ7XG59O1xuXG4vKipcbiAqIFRyYW5zZm9ybSB2ZWN0b3IgYnkgYSBtYXRyaXgsIHRocm91Z2ggcmlnaHQtbXVsdGlwbHlpbmcgYnkgbWF0cml4LlxuICogXG4gKiBAbmFtZSBGYW1vdXNNYXRyaXgjdmVjTXVsdGlwbHlcbiAqIEBmdW5jdGlvblxuICpcbiAqIEBwYXJhbSB7QXJyYXkuPG51bWJlcj59IHZlYyB4LHkseiB2ZWN0b3IgXG4gKiAgICAoYXJyYXkgb2YgZmxvYXRzICYmIGFycmF5Lmxlbmd0aCA9PSAzKVxuICogQHBhcmFtIHtGYW1vdXNNYXRyaXh9IG0gbWF0cml4XG4gKiBAcmV0dXJucyB7QXJyYXkuPG51bWJlcj59IHRoZSByZXN1bHRpbmcgdmVjdG9yXG4gKiAgICAoYXJyYXkgb2YgZmxvYXRzICYmIGFycmF5Lmxlbmd0aCA9PSAzKVxuICovIFxuRmFtb3VzTWF0cml4LnZlY011bHRpcGx5ID0gZnVuY3Rpb24odmVjLCBtKSB7XG4gICAgcmV0dXJuIFtcbiAgICAgICAgdmVjWzBdKm1bMF0gKyB2ZWNbMV0qbVs0XSArIHZlY1syXSptWzhdICsgbVsxMl0sXG4gICAgICAgIHZlY1swXSptWzFdICsgdmVjWzFdKm1bNV0gKyB2ZWNbMl0qbVs5XSArIG1bMTNdLFxuICAgICAgICB2ZWNbMF0qbVsyXSArIHZlY1sxXSptWzZdICsgdmVjWzJdKm1bMTBdICsgbVsxNF1cbiAgICBdO1xufTtcblxuLyoqIFxuICogQXBwbHkgdmlzdWFsIHBlcnNwZWN0aXZlIGZhY3RvciBwIHRvIHZlY3Rvci5cbiAqXG4gKiBAbmFtZSBGYW1vdXNNYXRyaXgjYXBwbHlQZXJzcGVjdGl2ZVxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0ge0FycmF5LjxudW1iZXI+fSB2ZWMgeCx5LHogdmVjdG9yIChhcnJheSBvZiBmbG9hdHMgJiYgYXJyYXkubGVuZ3RoID09IDMpXG4gKiBAcGFyYW0ge251bWJlcn0gcCBwZXJzcGVjdGl2ZSBmYWN0b3JcbiAqIEByZXR1cm5zIHtBcnJheS48bnVtYmVyPn0gdGhlIHJlc3VsdGluZyB4LHkgdmVjdG9yIChhcnJheSBvZiBmbG9hdHMgXG4gKiAgICAmJiBhcnJheS5sZW5ndGggPT0gMilcbiAqL1xuRmFtb3VzTWF0cml4LmFwcGx5UGVyc3BlY3RpdmUgPSBmdW5jdGlvbih2ZWMsIHApIHtcbiAgICB2YXIgc2NhbGUgPSBwLyhwIC0gdmVjWzJdKTtcbiAgICByZXR1cm4gW3NjYWxlICogdmVjWzBdLCBzY2FsZSAqIHZlY1sxXV07XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEZhbW91c01hdHJpeDtcbiIsIlxudmFyIEZNID0gcmVxdWlyZSgnLi9PbGRNYXRyaXgnKTtcblxuLyoqXG4gKiBAY29uc3RydWN0b3JcbiAqL1xuZnVuY3Rpb24gUXVhdGVybmlvbih3LHgseSx6KXtcbiAgICB0aGlzLncgPSAodyAhPT0gdW5kZWZpbmVkKSA/IHcgOiAxLjA7ICAvL0FuZ2xlXG4gICAgdGhpcy54ID0geCB8fCAwLjA7ICAvL0F4aXMueFxuICAgIHRoaXMueSA9IHkgfHwgMC4wOyAgLy9BeGlzLnlcbiAgICB0aGlzLnogPSB6IHx8IDAuMDsgIC8vQXhpcy56ICAgICAgICBcbiAgICByZXR1cm4gdGhpcztcbn07XG5cblF1YXRlcm5pb24ucHJvdG90eXBlLm1ha2VGcm9tQW5nbGVBbmRBeGlzID0gZnVuY3Rpb24oYW5nbGUsIHYpXG57ICAgICAgICBcbiAgICB2Lm5vcm1hbGl6ZSgpOyBcbiAgICB2YXIgaGEgPSBhbmdsZSowLjU7IFxuICAgIHZhciBzID0gTWF0aC5zaW4oaGEpOyAgICAgICAgIFxuICAgIHRoaXMueCA9IHMqdi54OyBcbiAgICB0aGlzLnkgPSBzKnYueTsgXG4gICAgdGhpcy56ID0gcyp2Lno7IFxuICAgIHRoaXMudyA9IE1hdGguY29zKGhhKTsgICAgICAgICBcbiAgICByZXR1cm4gdGhpczsgXG59OyAgICAgXG5cblF1YXRlcm5pb24ucHJvdG90eXBlLmNsb25lID0gZnVuY3Rpb24oKVxue1xuICAgIHJldHVybiBuZXcgUXVhdGVybmlvbih0aGlzLncsIHRoaXMueCwgdGhpcy55LCB0aGlzLnopOyBcbn07IFxuXG5RdWF0ZXJuaW9uLnByb3RvdHlwZS5zZXRXWFlaID0gZnVuY3Rpb24odywgeCwgeSwgeilcbntcbiAgICB0aGlzLncgPSB3OyBcbiAgICB0aGlzLnggPSB4OyBcbiAgICB0aGlzLnkgPSB5OyBcbiAgICB0aGlzLnogPSB6OyAgICAgICAgIFxuICAgIHJldHVybiB0aGlzOyBcbn07XG5cblF1YXRlcm5pb24ucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uKHEpIFxue1xuICAgIHRoaXMudyA9IHEudzsgICAgXG4gICAgdGhpcy54ID0gcS54OyBcbiAgICB0aGlzLnkgPSBxLnk7IFxuICAgIHRoaXMueiA9IHEuejsgICAgICAgICBcbiAgICByZXR1cm4gdGhpczsgXG59O1xuXG5RdWF0ZXJuaW9uLnByb3RvdHlwZS5jbGVhciA9IGZ1bmN0aW9uKCkgXG57XG4gICAgdGhpcy53ID0gMS4wOyBcbiAgICB0aGlzLnggPSAwLjA7IFxuICAgIHRoaXMueSA9IDAuMDsgXG4gICAgdGhpcy56ID0gMC4wOyBcbiAgICByZXR1cm4gdGhpczsgICAgICAgICBcbn07XG5cblF1YXRlcm5pb24ucHJvdG90eXBlLm5vcm1hbGl6ZSA9IGZ1bmN0aW9uKClcbntcbiAgICB2YXIgbm9ybWUgPSBNYXRoLnNxcnQodGhpcy53KnRoaXMudyArIHRoaXMueCp0aGlzLnggKyB0aGlzLnkqdGhpcy55ICsgdGhpcy56KnRoaXMueik7IFxuICAgIGlmIChub3JtZSA9PSAwLjApXG4gICAge1xuICAgICAgICB0aGlzLncgPSAxLjA7IFxuICAgICAgICB0aGlzLnggPSB0aGlzLnkgPSB0aGlzLnogPSAwLjA7IFxuICAgIH1cbiAgICBlbHNlXG4gICAge1xuICAgICAgICB2YXIgcmVjaXAgPSAxLjAgLyBub3JtZTsgXG4gICAgICAgIHRoaXMudyAqPSByZWNpcDsgXG4gICAgICAgIHRoaXMueCAqPSByZWNpcDsgXG4gICAgICAgIHRoaXMueSAqPSByZWNpcDsgXG4gICAgICAgIHRoaXMueiAqPSByZWNpcDsgICAgICAgICAgICAgXG4gICAgfVxuICAgIHJldHVybiB0aGlzOyBcbn07IFxuXG5RdWF0ZXJuaW9uLnByb3RvdHlwZS5nZXRNYXRyaXggPSBmdW5jdGlvbigpXG57XG4gICAgdGhpcy5ub3JtYWxpemUoKTsgXG4gICAgcmV0dXJuIFsgXG4gICAgICAgIDEuMCAtIDIuMCp0aGlzLnkqdGhpcy55IC0gMi4wKnRoaXMueip0aGlzLnosIFxuICAgICAgICAyLjAqdGhpcy54KnRoaXMueSAtIDIuMCp0aGlzLnoqdGhpcy53LCBcbiAgICAgICAgMi4wKnRoaXMueCp0aGlzLnogKyAyLjAqdGhpcy55KnRoaXMudywgXG4gICAgICAgIDAuMCxcbiAgICAgICAgMi4wKnRoaXMueCp0aGlzLnkgKyAyLjAqdGhpcy56KnRoaXMudywgXG4gICAgICAgIDEuMCAtIDIuMCp0aGlzLngqdGhpcy54IC0gMi4wKnRoaXMueip0aGlzLnosIFxuICAgICAgICAyLjAqdGhpcy55KnRoaXMueiAtIDIuMCp0aGlzLngqdGhpcy53LCBcbiAgICAgICAgMC4wLFxuICAgICAgICAyLjAqdGhpcy54KnRoaXMueiAtIDIuMCp0aGlzLnkqdGhpcy53LCBcbiAgICAgICAgMi4wKnRoaXMueSp0aGlzLnogKyAyLjAqdGhpcy54KnRoaXMudywgXG4gICAgICAgIDEuMCAtIDIuMCp0aGlzLngqdGhpcy54IC0gMi4wKnRoaXMueSp0aGlzLnksIFxuICAgICAgICAwLjAsXG4gICAgICAgIDAuMCwgXG4gICAgICAgIDAuMCwgXG4gICAgICAgIDAuMCwgXG4gICAgICAgIDEuMCBdOyBcbn07ICBcblxuUXVhdGVybmlvbi5wcm90b3R5cGUubXVsdGlwbHkgPSBmdW5jdGlvbihxLCBvdXQpIFxue1xuICAgIG91dCA9IG91dCB8fCB0aGlzLnJlZ2lzdGVyO1xuICAgIG91dC53ID0gdGhpcy53KnEudyAtIHRoaXMueCpxLnggLSB0aGlzLnkqcS55IC0gdGhpcy56KnEuejsgXG4gICAgb3V0LnggPSB0aGlzLncqcS54ICsgdGhpcy54KnEudyArIHRoaXMueSpxLnogLSB0aGlzLnoqcS55O1xuICAgIG91dC55ID0gdGhpcy53KnEueSAtIHRoaXMueCpxLnogKyB0aGlzLnkqcS53ICsgdGhpcy56KnEueDtcbiAgICBvdXQueiA9IHRoaXMudypxLnogKyB0aGlzLngqcS55IC0gdGhpcy55KnEueCArIHRoaXMueipxLncgO1xuICAgIHJldHVybiBvdXQ7IFxufTtcblxuUXVhdGVybmlvbi5wcm90b3R5cGUuaXNFcXVhbCA9IGZ1bmN0aW9uKHEpIFxue1xuICAgIGlmKHEudyA9PSB0aGlzLncgJiYgcS54ID09IHRoaXMueCAmJiBxLnkgPT0gdGhpcy55ICYmIHEueiA9PSB0aGlzLnopXG4gICAge1xuICAgICAgICByZXR1cm4gdHJ1ZTsgXG4gICAgfVxuICAgIHJldHVybiBmYWxzZTsgXG59OyBcblxuUXVhdGVybmlvbi5wcm90b3R5cGUuZG90ID0gZnVuY3Rpb24ocSlcbntcbiAgICByZXR1cm4gKHRoaXMudypxLncgKyB0aGlzLngqcS54ICsgdGhpcy55KnEueSArIHRoaXMueipxLnopOyBcbn07ICAgIFxuXG5RdWF0ZXJuaW9uLnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbihxLCBvdXQpXG57XG4gICAgb3V0ID0gb3V0IHx8IHRoaXMucmVnaXN0ZXI7XG4gICAgb3V0LncgPSB0aGlzLncgKyBxLnc7IFxuICAgIG91dC54ID0gdGhpcy54ICsgcS54OyBcbiAgICBvdXQueSA9IHRoaXMueSArIHEueTsgXG4gICAgb3V0LnogPSB0aGlzLnogKyBxLno7IFxuICAgIHJldHVybiBvdXQ7IFxufTsgXG5cblF1YXRlcm5pb24ucHJvdG90eXBlLnN1YiA9IGZ1bmN0aW9uKHEsIG91dClcbntcbiAgICBvdXQgPSBvdXQgfHwgdGhpcy5yZWdpc3RlcjtcbiAgICBvdXQudyA9IHRoaXMudyAtIHEudzsgXG4gICAgb3V0LnggPSB0aGlzLnggLSBxLng7IFxuICAgIG91dC55ID0gdGhpcy55IC0gcS55OyBcbiAgICBvdXQueiA9IHRoaXMueiAtIHEuejsgXG4gICAgcmV0dXJuIG91dDsgXG59OyBcblxuUXVhdGVybmlvbi5wcm90b3R5cGUubm9ybVNxdWFyZWQgPSBmdW5jdGlvbigpXG57XG4gICAgcmV0dXJuIHRoaXMueCp0aGlzLnggKyB0aGlzLnkqdGhpcy55ICsgdGhpcy56KnRoaXMueiArIHRoaXMudyp0aGlzLnc7IFxufTtcblxuUXVhdGVybmlvbi5wcm90b3R5cGUubm9ybSA9IGZ1bmN0aW9uKClcbntcbiAgICByZXR1cm4gTWF0aC5zcXJ0KHRoaXMubm9ybVNxdWFyZWQoKSk7XG59O1xuXG5cblF1YXRlcm5pb24ucHJvdG90eXBlLmNvbmogPSBmdW5jdGlvbihvdXQpXG57XG4gICAgb3V0ID0gb3V0IHx8IHRoaXMucmVnaXN0ZXI7XG4gICAgb3V0LncgPSB0aGlzLnc7IFxuICAgIG91dC54ID0gLXRoaXMueDsgXG4gICAgb3V0LnkgPSAtdGhpcy55OyBcbiAgICBvdXQueiA9IC10aGlzLno7IFxuICAgIHJldHVybiBvdXQ7IFxufTsgXG5cblF1YXRlcm5pb24ucHJvdG90eXBlLmludmVyc2UgPSBmdW5jdGlvbihvdXQpXG57XG4gICAgb3V0ID0gb3V0IHx8IHRoaXMucmVnaXN0ZXI7XG4gICAgdGhpcy5jb25qKG91dCk7XG4gICAgb3V0LnNjYWxhckRpdmlkZSh0aGlzLm5vcm1TcXVhcmVkKCksIG91dCk7XG4gICAgcmV0dXJuIG91dDsgIFxufTsgXG5cblF1YXRlcm5pb24ucHJvdG90eXBlLnNjYWxhckRpdmlkZSA9IGZ1bmN0aW9uKHMsIG91dClcbntcbiAgICBvdXQgPSBvdXQgfHwgdGhpcy5yZWdpc3RlcjsgICAgICAgIFxuICAgIHMgPSAxLjAgLyBzO1xuICAgIG91dC53ID0gdGhpcy53KnM7IFxuICAgIG91dC54ID0gdGhpcy54KnM7IFxuICAgIG91dC55ID0gdGhpcy55KnM7IFxuICAgIG91dC56ID0gdGhpcy56KnM7IFxuICAgIHJldHVybiBvdXQ7IFxufTtcblxuUXVhdGVybmlvbi5wcm90b3R5cGUuc2NhbGFyTXVsdCA9IGZ1bmN0aW9uKHMsIG91dClcbntcbiAgICBvdXQgPSBvdXQgfHwgdGhpcy5yZWdpc3RlcjsgICAgICAgICAgICAgICAgXG4gICAgb3V0LncgPSB0aGlzLncqczsgXG4gICAgb3V0LnggPSB0aGlzLngqczsgXG4gICAgb3V0LnkgPSB0aGlzLnkqczsgXG4gICAgb3V0LnogPSB0aGlzLnoqczsgXG4gICAgcmV0dXJuIG91dDsgICBcbn1cblxuUXVhdGVybmlvbi5wcm90b3R5cGUuaXNaZXJvID0gZnVuY3Rpb24oKVxue1xuICAgIGlmKHRoaXMueCA9PSAwICYmIHRoaXMueSA9PSAwICYmIHRoaXMueiA9PSAwICYmIHRoaXMudyA9PSAxLjApXG4gICAge1xuICAgICAgICByZXR1cm4gdHJ1ZTsgXG4gICAgfVxuICAgIHJldHVybiBmYWxzZTsgICAgICAgICBcbn07IFxuXG5RdWF0ZXJuaW9uLnByb3RvdHlwZS5uZWdhdGUgPSBmdW5jdGlvbigpXG57XG4gICAgdGhpcy53ID0gLXRoaXMudzsgXG4gICAgdGhpcy54ID0gLXRoaXMueDsgXG4gICAgdGhpcy55ID0gLXRoaXMueTsgXG4gICAgdGhpcy56ID0gLXRoaXMuejsgXG4gICAgcmV0dXJuIHRoaXM7IFxufVxuXG5RdWF0ZXJuaW9uLnByb3RvdHlwZS56ZXJvUm90YXRpb24gPSBmdW5jdGlvbigpXG57XG4gICAgdGhpcy54ID0gMDsgdGhpcy55ID0gMDsgdGhpcy56ID0gMDsgdGhpcy53ID0gMS4wOyBcbiAgICByZXR1cm4gdGhpczsgXG59OyBcblxuUXVhdGVybmlvbi5wcm90b3R5cGUuc2xlcnAgPSBmdW5jdGlvbihxLCB0LCBvdXQpXG57XG4gICAgb3V0ID0gb3V0IHx8IHRoaXMucmVnaXN0ZXI7ICAgICAgICAgICAgICAgIFxuICAgIHZhciBvbWVnYSwgY29zb21lZ2EsIHNpbm9tZWdhLCBzY2FsZUZyb20sIHNjYWxlVG87IFxuXG4gICAgdGhpcy50by5zZXQocSk7XG4gICAgdGhpcy5mcm9tLnNldCh0aGlzKTsgXG5cbiAgICBjb3NvbWVnYSA9IHRoaXMuZG90KHEpOyBcblxuICAgIGlmKGNvc29tZWdhIDwgMC4wKVxuICAgIHtcbiAgICAgICAgY29zb21lZ2EgPSAtY29zb21lZ2E7IFxuICAgICAgICB0aGlzLnRvLm5lZ2F0ZSgpOyAgICAgICAgICAgICBcbiAgICB9XG5cbiAgICBpZiggKDEuMCAtIGNvc29tZWdhKSA+IHRoaXMuZXBzaWxvbiApXG4gICAge1xuICAgICAgICBvbWVnYSA9IE1hdGguYWNvcyhjb3NvbWVnYSk7IFxuICAgICAgICBzaW5vbWVnYSA9IE1hdGguc2luKG9tZWdhKTtcbiAgICAgICAgc2NhbGVGcm9tID0gTWF0aC5zaW4oICgxLjAgLSB0KSAqIG9tZWdhICkgLyBzaW5vbWVnYTsgXG4gICAgICAgIHNjYWxlVG8gPSBNYXRoLnNpbiggdCAqIG9tZWdhICkgLyBzaW5vbWVnYTsgICAgICAgICAgICAgXG4gICAgfVxuICAgIGVsc2VcbiAgICB7XG4gICAgICAgIHNjYWxlRnJvbSA9IDEuMCAtIHQ7IFxuICAgICAgICBzY2FsZVRvID0gdDsgXG4gICAgfVxuXG5cbiAgICB0aGlzLmZyb20uc2NhbGFyTXVsdChzY2FsZUZyb20sIHRoaXMuZnJvbSk7ICAgICAgICBcbiAgICB0aGlzLnRvLnNjYWxhck11bHQoc2NhbGVUbywgdGhpcy50byk7ICAgICAgICBcbiAgICB0aGlzLmZyb20uYWRkKHRoaXMudG8sIG91dCk7ICAgICAgICAgXG4gICAgcmV0dXJuIG91dDsgXG59XG5cblF1YXRlcm5pb24ucHJvdG90eXBlLmVwc2lsb24gICAgPSAwLjAwMDAxOyBcblF1YXRlcm5pb24ucHJvdG90eXBlLmZyb20gICAgICAgPSBuZXcgUXVhdGVybmlvbigwLDAsMCwwKTtcblF1YXRlcm5pb24ucHJvdG90eXBlLnRvICAgICAgICAgPSBuZXcgUXVhdGVybmlvbigwLDAsMCwwKTtcblF1YXRlcm5pb24ucHJvdG90eXBlLnJlZ2lzdGVyICAgPSBuZXcgUXVhdGVybmlvbigwLDAsMCwwKTtcblF1YXRlcm5pb24ucHJvdG90eXBlLnplcm8gICAgICAgPSBuZXcgUXVhdGVybmlvbigwLDAsMCwwKTtcblF1YXRlcm5pb24ucHJvdG90eXBlLm9uZSAgICAgICAgPSBuZXcgUXVhdGVybmlvbigxLDEsMSwxKTtcblxubW9kdWxlLmV4cG9ydHMgPSBRdWF0ZXJuaW9uO1xuIiwidmFyIEZNID0gcmVxdWlyZSgnLi9PbGRNYXRyaXgnKTtcblxudmFyIFV0aWxzID0geyAgICAgICAgICAgICAgICBcbiAgICByYWQyZGVnOiBmdW5jdGlvbihyYWQpXG4gICAge1xuICAgICAgICByZXR1cm4gcmFkICogNTcuMjk1Nzc5NTsgXG4gICAgfSxcblxuICAgIGRlZzJyYWQ6IGZ1bmN0aW9uKGRlZylcbiAgICB7XG4gICAgICAgIHJldHVybiBkZWcgKiAwLjAxNzQ1MzI5MjU7IFxuICAgIH0sXG5cbiAgICBkaXN0YW5jZTogZnVuY3Rpb24oeDEsIHkxLCB4MiwgeTIpXG4gICAge1xuICAgICAgICB2YXIgZGVsdGFYID0geDIgLSB4MTsgXG4gICAgICAgIHZhciBkZWx0YVkgPSB5MiAtIHkxOyBcbiAgICAgICAgcmV0dXJuIE1hdGguc3FydChkZWx0YVgqZGVsdGFYICsgZGVsdGFZKmRlbHRhWSk7IFxuICAgIH0sXG5cbiAgICBkaXN0YW5jZTNEOiBmdW5jdGlvbih4MSwgeTEsIHoxLCB4MiwgeTIsIHoyKVxuICAgIHtcbiAgICAgICAgdmFyIGRlbHRhWCA9IHgyIC0geDE7IFxuICAgICAgICB2YXIgZGVsdGFZID0geTIgLSB5MTsgXG4gICAgICAgIHZhciBkZWx0YVogPSB6MiAtIHoxOyBcbiAgICAgICAgcmV0dXJuIE1hdGguc3FydChkZWx0YVgqZGVsdGFYICsgZGVsdGFZKmRlbHRhWSArIGRlbHRhWipkZWx0YVopOyBcbiAgICB9LFxuXG4gICAgbWFwOiBmdW5jdGlvbih2YWx1ZSwgaW5wdXRNaW4sIGlucHV0TWF4LCBvdXRwdXRNaW4sIG91dHB1dE1heCwgY2xhbXApXG4gICAgeyAgICAgICAgIFxuICAgICAgdmFyIG91dFZhbHVlID0gKCh2YWx1ZSAtIGlucHV0TWluKS8oaW5wdXRNYXggLSBpbnB1dE1pbikpICogKG91dHB1dE1heCAtIG91dHB1dE1pbikgKyBvdXRwdXRNaW47IFxuICAgICAgaWYoY2xhbXApXG4gICAgICB7ICAgICAgIFxuICAgICAgICBpZihvdXRwdXRNYXggPiBvdXRwdXRNaW4pXG4gICAgICAgIHtcbiAgICAgICAgICBpZihvdXRWYWx1ZSA+IG91dHB1dE1heClcbiAgICAgICAgICB7XG4gICAgICAgICAgICBvdXRWYWx1ZSA9IG91dHB1dE1heDsgXG4gICAgICAgICAgfVxuICAgICAgICAgIGVsc2UgaWYob3V0VmFsdWUgPCBvdXRwdXRNaW4pXG4gICAgICAgICAge1xuICAgICAgICAgICAgb3V0VmFsdWUgPSBvdXRwdXRNaW47IFxuICAgICAgICAgIH0gXG4gICAgICAgIH1cbiAgICAgICAgZWxzZVxuICAgICAgICB7XG4gICAgICAgICAgaWYob3V0VmFsdWUgPCBvdXRwdXRNYXgpXG4gICAgICAgICAge1xuICAgICAgICAgICAgb3V0VmFsdWUgPSBvdXRwdXRNYXg7IFxuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlIGlmKG91dFZhbHVlID4gb3V0cHV0TWluKVxuICAgICAgICAgIHtcbiAgICAgICAgICAgIG91dFZhbHVlID0gb3V0cHV0TWluOyBcbiAgICAgICAgICB9IFxuICAgICAgICB9ICAgICAgICAgXG4gICAgICB9XG4gICAgICByZXR1cm4gb3V0VmFsdWU7ICAgICAgICAgXG4gICAgfSxcblxuICAgIGxpbWl0OiBmdW5jdGlvbih2YWx1ZSwgbG93LCBoaWdoKVxuICAgIHtcbiAgICAgICAgdmFsdWUgPSBNYXRoLm1pbih2YWx1ZSwgaGlnaCk7IFxuICAgICAgICB2YWx1ZSA9IE1hdGgubWF4KHZhbHVlLCBsb3cpOyBcbiAgICAgICAgcmV0dXJuIHZhbHVlOyAgICAgICAgICAgICBcbiAgICB9LFxuXG4gICAgcGVyc3BlY3RpdmU6IGZ1bmN0aW9uKGZvdnksIGFzcGVjdCwgbmVhciwgZmFyKSBcbiAgICB7XG4gICAgICAgIHZhciBvdXQgPSBbMSwgMCwgMCwgMCwgMCwgMSwgMCwgMCwgMCwgMCwgMSwgMCwgMCwgMCwgMCwgMV07XG4gICAgICAgIHZhciBmID0gMS4wIC8gTWF0aC50YW4oZm92eSAvIDIpLFxuICAgICAgICBuZiA9IDEuMCAvIChuZWFyIC0gZmFyKTtcbiAgICAgICAgb3V0WzBdID0gZiAvIGFzcGVjdDtcbiAgICAgICAgb3V0WzFdID0gMDtcbiAgICAgICAgb3V0WzJdID0gMDtcbiAgICAgICAgb3V0WzNdID0gMDtcblxuICAgICAgICBvdXRbNF0gPSAwO1xuICAgICAgICBvdXRbNV0gPSBmO1xuICAgICAgICBvdXRbNl0gPSAwO1xuICAgICAgICBvdXRbN10gPSAwO1xuICAgICAgICBcbiAgICAgICAgb3V0WzhdID0gMDtcbiAgICAgICAgb3V0WzldID0gMDtcbiAgICAgICAgb3V0WzEwXSA9IChmYXIgKyBuZWFyKSAqIG5mO1xuICAgICAgICBvdXRbMTFdID0gLTE7XG4gICAgICAgIFxuICAgICAgICBvdXRbMTJdID0gMDtcbiAgICAgICAgb3V0WzEzXSA9IDA7XG4gICAgICAgIG91dFsxNF0gPSAoMiAqIGZhciAqIG5lYXIpICogbmY7XG4gICAgICAgIG91dFsxNV0gPSAwO1xuICAgICAgICByZXR1cm4gb3V0O1xuICAgIH0sXG5cbiAgICBvcnRobzogZnVuY3Rpb24obGVmdCwgcmlnaHQsIGJvdHRvbSwgdG9wLCBuZWFyLCBmYXIpXG4gICAge1xuICAgICAgICB2YXIgb3V0ID0gWzEsIDAsIDAsIDAsIDAsIDEsIDAsIDAsIDAsIDAsIDEsIDAsIDAsIDAsIDAsIDFdO1xuICAgICAgICB2YXIgdHggPSAtKHJpZ2h0K2xlZnQpLyhyaWdodC1sZWZ0KTtcbiAgICAgICAgdmFyIHR5ID0gLSh0b3ArYm90dG9tKS8odG9wLWJvdHRvbSk7XG4gICAgICAgIHZhciB0eiA9IC0oZmFyK25lYXIpLyhmYXItbmVhcik7XG5cbiAgICAgICAgb3V0WzBdID0gMi4wLyhyaWdodC1sZWZ0KTsgXG4gICAgICAgIG91dFsxXSA9IDA7XG4gICAgICAgIG91dFsyXSA9IDA7XG4gICAgICAgIG91dFszXSA9IDA7XG5cbiAgICAgICAgb3V0WzRdID0gMDtcbiAgICAgICAgb3V0WzVdID0gMi4wLyh0b3AtYm90dG9tKTtcbiAgICAgICAgb3V0WzZdID0gMDtcbiAgICAgICAgb3V0WzddID0gMDtcbiAgICAgICAgXG4gICAgICAgIG91dFs4XSA9IDA7XG4gICAgICAgIG91dFs5XSA9IDA7XG4gICAgICAgIG91dFsxMF0gPSAtMi4wLyhmYXItbmVhcik7XG4gICAgICAgIG91dFsxMV0gPSAtMTtcbiAgICAgICAgXG4gICAgICAgIG91dFsxMl0gPSB0eDsgXG4gICAgICAgIG91dFsxM10gPSB0eTtcbiAgICAgICAgb3V0WzE0XSA9IHR6O1xuICAgICAgICBvdXRbMTVdID0gMS4wO1xuICAgICAgICByZXR1cm4gb3V0O1xuICAgIH0sXG5cbiAgICBub3JtYWxGcm9tRk06IGZ1bmN0aW9uIChvdXQsIGEpIFxuICAgIHtcbiAgICAgICAgdmFyIGEwMCA9IGFbMF0sIGEwMSA9IGFbMV0sIGEwMiA9IGFbMl0sIGEwMyA9IGFbM10sXG4gICAgICAgIGExMCA9IGFbNF0sIGExMSA9IGFbNV0sIGExMiA9IGFbNl0sIGExMyA9IGFbN10sXG4gICAgICAgIGEyMCA9IGFbOF0sIGEyMSA9IGFbOV0sIGEyMiA9IGFbMTBdLCBhMjMgPSBhWzExXSxcbiAgICAgICAgYTMwID0gYVsxMl0sIGEzMSA9IGFbMTNdLCBhMzIgPSBhWzE0XSwgYTMzID0gYVsxNV0sXG5cbiAgICAgICAgYjAwID0gYTAwICogYTExIC0gYTAxICogYTEwLFxuICAgICAgICBiMDEgPSBhMDAgKiBhMTIgLSBhMDIgKiBhMTAsXG4gICAgICAgIGIwMiA9IGEwMCAqIGExMyAtIGEwMyAqIGExMCxcbiAgICAgICAgYjAzID0gYTAxICogYTEyIC0gYTAyICogYTExLFxuICAgICAgICBiMDQgPSBhMDEgKiBhMTMgLSBhMDMgKiBhMTEsXG4gICAgICAgIGIwNSA9IGEwMiAqIGExMyAtIGEwMyAqIGExMixcbiAgICAgICAgYjA2ID0gYTIwICogYTMxIC0gYTIxICogYTMwLFxuICAgICAgICBiMDcgPSBhMjAgKiBhMzIgLSBhMjIgKiBhMzAsXG4gICAgICAgIGIwOCA9IGEyMCAqIGEzMyAtIGEyMyAqIGEzMCxcbiAgICAgICAgYjA5ID0gYTIxICogYTMyIC0gYTIyICogYTMxLFxuICAgICAgICBiMTAgPSBhMjEgKiBhMzMgLSBhMjMgKiBhMzEsXG4gICAgICAgIGIxMSA9IGEyMiAqIGEzMyAtIGEyMyAqIGEzMixcblxuICAgICAgICAvLyBDYWxjdWxhdGUgdGhlIGRldGVybWluYW50XG4gICAgICAgIGRldCA9IGIwMCAqIGIxMSAtIGIwMSAqIGIxMCArIGIwMiAqIGIwOSArIGIwMyAqIGIwOCAtIGIwNCAqIGIwNyArIGIwNSAqIGIwNjtcblxuICAgICAgICBpZiAoIWRldCkgeyBcbiAgICAgICAgICAgIHJldHVybiBudWxsOyBcbiAgICAgICAgfVxuICAgICAgICBkZXQgPSAxLjAgLyBkZXQ7XG5cbiAgICAgICAgb3V0WzBdID0gKGExMSAqIGIxMSAtIGExMiAqIGIxMCArIGExMyAqIGIwOSkgKiBkZXQ7XG4gICAgICAgIG91dFsxXSA9IChhMTIgKiBiMDggLSBhMTAgKiBiMTEgLSBhMTMgKiBiMDcpICogZGV0O1xuICAgICAgICBvdXRbMl0gPSAoYTEwICogYjEwIC0gYTExICogYjA4ICsgYTEzICogYjA2KSAqIGRldDtcblxuICAgICAgICBvdXRbM10gPSAoYTAyICogYjEwIC0gYTAxICogYjExIC0gYTAzICogYjA5KSAqIGRldDtcbiAgICAgICAgb3V0WzRdID0gKGEwMCAqIGIxMSAtIGEwMiAqIGIwOCArIGEwMyAqIGIwNykgKiBkZXQ7XG4gICAgICAgIG91dFs1XSA9IChhMDEgKiBiMDggLSBhMDAgKiBiMTAgLSBhMDMgKiBiMDYpICogZGV0O1xuXG4gICAgICAgIG91dFs2XSA9IChhMzEgKiBiMDUgLSBhMzIgKiBiMDQgKyBhMzMgKiBiMDMpICogZGV0O1xuICAgICAgICBvdXRbN10gPSAoYTMyICogYjAyIC0gYTMwICogYjA1IC0gYTMzICogYjAxKSAqIGRldDtcbiAgICAgICAgb3V0WzhdID0gKGEzMCAqIGIwNCAtIGEzMSAqIGIwMiArIGEzMyAqIGIwMCkgKiBkZXQ7XG5cbiAgICAgICAgcmV0dXJuIG91dDtcbiAgICB9LCBcblxuICAgIGNsYW1wOiBmdW5jdGlvbih2LCBtaW4sIG1heCkgICAgICAgIFxuICAgIHtcbiAgICAgICAgaWYodiA8IG1pbilcbiAgICAgICAge1xuICAgICAgICAgICAgcmV0dXJuIG1pbjsgXG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZih2ID4gbWF4KVxuICAgICAgICB7XG4gICAgICAgICAgICByZXR1cm4gbWF4OyBcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdjsgXG4gICAgfSxcblxuICAgIGNvbG9yOiBmdW5jdGlvbihyZWQsIGdyZWVuLCBibHVlLCBhbHBoYSlcbiAgICB7XG4gICAgICByZXR1cm4gJ3JnYmEoJytNYXRoLmZsb29yKHJlZCkrJywnK01hdGguZmxvb3IoZ3JlZW4pKycsJytNYXRoLmZsb29yKGJsdWUpKycsJythbHBoYSsnKSc7IFxuICAgIH0sXG4gICAgXG4gICAgYmFja2dyb3VuZFRyYW5zcGFyZW50OiBmdW5jdGlvbigpXG4gICAge1xuICAgICAgICByZXR1cm4geydiYWNrZ3JvdW5kQ29sb3InOiAndHJhbnNwYXJlbnQnfTsgXG4gICAgfSxcblxuICAgIGJhY2tncm91bmRDb2xvcjogZnVuY3Rpb24ocmVkLCBncmVlbiwgYmx1ZSwgYWxwaGEpXG4gICAge1xuICAgICAgICByZXR1cm4geydiYWNrZ3JvdW5kQ29sb3InOiAncmdiYSgnK01hdGguZmxvb3IocmVkKSsnLCcrTWF0aC5mbG9vcihncmVlbikrJywnK01hdGguZmxvb3IoYmx1ZSkrJywnK2FscGhhKycpJ307IFxuICAgIH0sXG5cbiAgICBib3JkZXJSYWRpdXM6IGZ1bmN0aW9uKHIpXG4gICAge1xuICAgICAgICByZXR1cm4geydib3JkZXJSYWRpdXMnOiByKydweCd9OyBcbiAgICB9LFxuXG4gICAgYm9yZGVyVG9wV2lkdGg6IGZ1bmN0aW9uKHIpXG4gICAge1xuICAgICAgICByZXR1cm4geydib3JkZXJUb3BXaWR0aCc6IHIrJ3B4J307IFxuICAgIH0sXG5cbiAgICBib3JkZXJCb3R0b21XaWR0aDogZnVuY3Rpb24ocilcbiAgICB7XG4gICAgICAgIHJldHVybiB7J2JvcmRlckJvdHRvbVdpZHRoJzogcisncHgnfTsgXG4gICAgfSxcblxuICAgIGJvcmRlckxlZnRXaWR0aDogZnVuY3Rpb24ocilcbiAgICB7XG4gICAgICAgIHJldHVybiB7J2JvcmRlckxlZnRXaWR0aCc6IHIrJ3B4J307IFxuICAgIH0sXG5cbiAgICBib3JkZXJSaWdodFdpZHRoOiBmdW5jdGlvbihyKVxuICAgIHtcbiAgICAgICAgcmV0dXJuIHsnYm9yZGVyUmlnaHRXaWR0aCc6IHIrJ3B4J307IFxuICAgIH0sXG5cbiAgICBib3JkZXJXaWR0aDogZnVuY3Rpb24oc2l6ZSlcbiAgICB7XG4gICAgICAgIHJldHVybiB7J2JvcmRlcldpZHRoJzogc2l6ZSsncHgnfTtcbiAgICB9LFxuXG4gICAgYm9yZGVyQ29sb3I6IGZ1bmN0aW9uKHJlZCwgZ3JlZW4sIGJsdWUsIGFscGhhKVxuICAgIHtcbiAgICAgICAgaWYoYWxwaGEgPT0gMC4wKVxuICAgICAgICB7XG4gICAgICAgICAgICByZXR1cm4geydib3JkZXJDb2xvcic6ICd0cmFuc3BhcmVudCd9OyBcbiAgICAgICAgfVxuICAgICAgICBlbHNlXG4gICAgICAgIHtcbiAgICAgICAgICAgIHJldHVybiB7J2JvcmRlckNvbG9yJzogJ3JnYmEoJytNYXRoLmZsb29yKHJlZCkrJywnK01hdGguZmxvb3IoZ3JlZW4pKycsJytNYXRoLmZsb29yKGJsdWUpKycsJythbHBoYSsnKSd9OyBcbiAgICAgICAgfSAgICAgICAgICAgIFxuICAgIH0sXG5cbiAgICBib3JkZXJUb3BDb2xvcjogZnVuY3Rpb24ocmVkLCBncmVlbiwgYmx1ZSwgYWxwaGEpXG4gICAge1xuICAgICAgICBpZihhbHBoYSA9PSAwLjApXG4gICAgICAgIHtcbiAgICAgICAgICAgIHJldHVybiB7J2JvcmRlclRvcENvbG9yJzogJ3RyYW5zcGFyZW50J307IFxuICAgICAgICB9XG4gICAgICAgIGVsc2VcbiAgICAgICAge1xuICAgICAgICAgICAgcmV0dXJuIHsnYm9yZGVyVG9wQ29sb3InOiAncmdiYSgnK01hdGguZmxvb3IocmVkKSsnLCcrTWF0aC5mbG9vcihncmVlbikrJywnK01hdGguZmxvb3IoYmx1ZSkrJywnK2FscGhhKycpJ307IFxuICAgICAgICB9ICAgICAgICAgICAgXG4gICAgfSxcblxuICAgIGJvcmRlckJvdHRvbUNvbG9yOiBmdW5jdGlvbihyZWQsIGdyZWVuLCBibHVlLCBhbHBoYSlcbiAgICB7XG4gICAgICAgIGlmKGFscGhhID09IDAuMClcbiAgICAgICAge1xuICAgICAgICAgICAgcmV0dXJuIHsnYm9yZGVyQm90dG9tQ29sb3InOiAndHJhbnNwYXJlbnQnfTsgXG4gICAgICAgIH1cbiAgICAgICAgZWxzZVxuICAgICAgICB7XG4gICAgICAgICAgICByZXR1cm4geydib3JkZXJCb3R0b21Db2xvcic6ICdyZ2JhKCcrTWF0aC5mbG9vcihyZWQpKycsJytNYXRoLmZsb29yKGdyZWVuKSsnLCcrTWF0aC5mbG9vcihibHVlKSsnLCcrYWxwaGErJyknfTsgXG4gICAgICAgIH0gICAgICAgICAgICBcbiAgICB9LFxuXG4gICAgYm9yZGVyUmlnaHRDb2xvcjogZnVuY3Rpb24ocmVkLCBncmVlbiwgYmx1ZSwgYWxwaGEpXG4gICAge1xuICAgICAgICBpZihhbHBoYSA9PSAwLjApXG4gICAgICAgIHtcbiAgICAgICAgICAgIHJldHVybiB7J2JvcmRlclJpZ2h0Q29sb3InOiAndHJhbnNwYXJlbnQnfTsgXG4gICAgICAgIH1cbiAgICAgICAgZWxzZVxuICAgICAgICB7XG4gICAgICAgICAgICByZXR1cm4geydib3JkZXJSaWdodENvbG9yJzogJ3JnYmEoJytNYXRoLmZsb29yKHJlZCkrJywnK01hdGguZmxvb3IoZ3JlZW4pKycsJytNYXRoLmZsb29yKGJsdWUpKycsJythbHBoYSsnKSd9OyBcbiAgICAgICAgfSAgICAgICAgICAgIFxuICAgIH0sXG5cbiAgICBib3JkZXJMZWZ0Q29sb3I6IGZ1bmN0aW9uKHJlZCwgZ3JlZW4sIGJsdWUsIGFscGhhKVxuICAgIHtcbiAgICAgICAgaWYoYWxwaGEgPT0gMC4wKVxuICAgICAgICB7XG4gICAgICAgICAgICByZXR1cm4geydib3JkZXJMZWZ0Q29sb3InOiAndHJhbnNwYXJlbnQnfTsgXG4gICAgICAgIH1cbiAgICAgICAgZWxzZVxuICAgICAgICB7XG4gICAgICAgICAgICByZXR1cm4geydib3JkZXJMZWZ0Q29sb3InOiAncmdiYSgnK01hdGguZmxvb3IocmVkKSsnLCcrTWF0aC5mbG9vcihncmVlbikrJywnK01hdGguZmxvb3IoYmx1ZSkrJywnK2FscGhhKycpJ307IFxuICAgICAgICB9ICAgICAgICAgICAgXG4gICAgfSxcblxuICAgIGJvcmRlclN0eWxlOiBmdW5jdGlvbihzdHlsZSlcbiAgICB7XG4gICAgICAgIHJldHVybiB7J2JvcmRlclN0eWxlJzogc3R5bGV9O1xuICAgIH0sXG5cbiAgICBib3JkZXJUb3BTdHlsZTogZnVuY3Rpb24oc3R5bGUpXG4gICAge1xuICAgICAgICByZXR1cm4geydib3JkZXJUb3BTdHlsZSc6IHN0eWxlfTtcbiAgICB9LFxuXG4gICAgYm9yZGVyQm90dG9tU3R5bGU6IGZ1bmN0aW9uKHN0eWxlKVxuICAgIHtcbiAgICAgICAgcmV0dXJuIHsnYm9yZGVyQm90dG9tU3R5bGUnOiBzdHlsZX07XG4gICAgfSxcblxuICAgIGJvcmRlclJpZ2h0U3R5bGU6IGZ1bmN0aW9uKHN0eWxlKVxuICAgIHtcbiAgICAgICAgcmV0dXJuIHsnYm9yZGVyUmlnaHRTdHlsZSc6IHN0eWxlfTtcbiAgICB9LFxuXG4gICAgYm9yZGVyTGVmdFN0eWxlOiBmdW5jdGlvbihzdHlsZSlcbiAgICB7XG4gICAgICAgIHJldHVybiB7J2JvcmRlckxlZnRTdHlsZSc6IHN0eWxlfTtcbiAgICB9LFxuXG4gICAgY29sb3JIU0w6IGZ1bmN0aW9uKGh1ZSwgc2F0dXJhdGlvbiwgbGlnaHRuZXNzLCBhbHBoYSlcbiAgICB7XG4gICAgICAgIHJldHVybiAnaHNsYSgnK01hdGguZmxvb3IoaHVlKSsnLCcrTWF0aC5mbG9vcihzYXR1cmF0aW9uKSsnJSwnK01hdGguZmxvb3IobGlnaHRuZXNzKSsnJSwnK2FscGhhKycpJzsgXG4gICAgfSxcblxuICAgIGJhY2tncm91bmRUcmFuc3BhcmVudDogZnVuY3Rpb24oKVxuICAgIHtcbiAgICAgICAgcmV0dXJuIHsnYmFja2dyb3VuZENvbG9yJzogJ3RyYW5zcGFyZW50J307ICAgICAgICAgICAgIFxuICAgIH0sIFxuXG4gICAgYmFja2dyb3VuZENvbG9ySFNMOiBmdW5jdGlvbihodWUsIHNhdHVyYXRpb24sIGxpZ2h0bmVzcywgYWxwaGEpXG4gICAge1xuICAgICAgICByZXR1cm4geydiYWNrZ3JvdW5kQ29sb3InOiAnaHNsYSgnK01hdGguZmxvb3IoaHVlKSsnLCcrTWF0aC5mbG9vcihzYXR1cmF0aW9uKSsnJSwnK01hdGguZmxvb3IobGlnaHRuZXNzKSsnJSwnK2FscGhhKycpJ307IFxuICAgIH0sXG5cbiAgICBiYWNrZmFjZVZpc2libGU6IGZ1bmN0aW9uKHZhbHVlKVxuICAgIHtcbiAgICAgICAgaWYodmFsdWUpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAnYmFja2ZhY2UtdmlzaWJpbGl0eSc6J3Zpc2libGUnLFxuICAgICAgICAgICAgICAgICctd2Via2l0LWJhY2tmYWNlLXZpc2liaWxpdHknOid2aXNpYmxlJyxcbiAgICAgICAgICAgICAgICAnLW1vei1iYWNrZmFjZS12aXNpYmlsaXR5JzondmlzaWJsZScsXG4gICAgICAgICAgICAgICAgJy1tcy1iYWNrZmFjZS12aXNpYmlsaXR5JzogJ3Zpc2libGUnLFxuICAgICAgICAgICAgfTsgXG4gICAgICAgIH1cbiAgICAgICAgZWxzZVxuICAgICAgICB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgJ2JhY2tmYWNlLXZpc2liaWxpdHknOidoaWRkZW4nLFxuICAgICAgICAgICAgICAgICctd2Via2l0LWJhY2tmYWNlLXZpc2liaWxpdHknOidoaWRkZW4nLFxuICAgICAgICAgICAgICAgICctbW96LWJhY2tmYWNlLXZpc2liaWxpdHknOidoaWRkZW4nLFxuICAgICAgICAgICAgICAgICctbXMtYmFja2ZhY2UtdmlzaWJpbGl0eSc6ICdoaWRkZW4nLFxuICAgICAgICAgICAgfTsgXG4gICAgICAgIH1cbiAgICB9LCBcblxuICAgIGNsaXBDaXJjbGU6IGZ1bmN0aW9uKHgsIHksIHIpXG4gICAge1xuICAgICAgICByZXR1cm4geyctd2Via2l0LWNsaXAtcGF0aCc6ICdjaXJjbGUoJyt4KydweCwnK3krJ3B4LCcrcisncHgpJ307XG4gICAgfSwgICAgICAgIFxuXG4gICAgZ2V0V2lkdGg6IGZ1bmN0aW9uKClcbiAgICB7ICAgICAgICAgICAgXG4gICAgICAgIHJldHVybiB3aW5kb3cuaW5uZXJXaWR0aDsgXG4gICAgfSxcblxuICAgIGdldEhlaWdodDogZnVuY3Rpb24oKVxuICAgIHtcbiAgICAgICAgcmV0dXJuIHdpbmRvdy5pbm5lckhlaWdodDsgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICB9LFxuXG4gICAgZ2V0Q2VudGVyOiBmdW5jdGlvbigpXG4gICAge1xuICAgICAgICByZXR1cm4gW1V0aWxzLmdldFdpZHRoKCkqLjUsIFV0aWxzLmdldEhlaWdodCgpKi41XTsgXG4gICAgfSxcbiAgICBcbiAgICBpc01vYmlsZTogZnVuY3Rpb24oKSB7IFxuICAgICAgICBpZiggL0FuZHJvaWR8d2ViT1N8aVBob25lfGlQYWR8aVBvZHxCbGFja0JlcnJ5L2kudGVzdChuYXZpZ2F0b3IudXNlckFnZW50KSApIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9IFxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSxcblxuICAgIGlzU3RyaW5nOiBmdW5jdGlvbiAobWF5YmVTdHJpbmcpIHtcbiAgICAgICAgcmV0dXJuICh0eXBlb2YgbWF5YmVTdHJpbmcgPT0gJ3N0cmluZycgfHwgbWF5YmVTdHJpbmcgaW5zdGFuY2VvZiBTdHJpbmcpIFxuICAgIH0sXG5cbiAgICBpc0FycmF5OiBmdW5jdGlvbiAobWF5YmVBcnJheSkge1xuICAgICAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKCBtYXliZUFycmF5ICkgPT09ICdbb2JqZWN0IEFycmF5XSc7XG4gICAgfSxcblxuICAgIGV4dGVuZDogZnVuY3Rpb24oYSwgYikge1xuICAgICAgICBmb3IodmFyIGtleSBpbiBiKSB7IFxuICAgICAgICAgICAgYVtrZXldID0gYltrZXldO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBhO1xuICAgIH0sXG5cbiAgICBnZXREZXZpY2VQaXhlbFJhdGlvOiBmdW5jdGlvbigpXG4gICAge1xuICAgICAgICByZXR1cm4gKHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvID8gd2luZG93LmRldmljZVBpeGVsUmF0aW8gOiAxKTsgXG4gICAgfSxcblxuICAgIHN1cHBvcnRzV2ViR0w6IGZ1bmN0aW9uKClcbiAgICB7XG4gICAgICAgIGlmKCAvQW5kcm9pZHxDaHJvbWV8TW96aWxsYS9pLnRlc3QobmF2aWdhdG9yLmFwcENvZGVOYW1lKSAmJiAhIXdpbmRvdy5XZWJHTFJlbmRlcmluZ0NvbnRleHQpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9IFxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSwgXG5cbiAgICBnZXRTdXJmYWNlUG9zaXRpb246IGZ1bmN0aW9uIGdldFN1cmZhY2VQb3NpdGlvbihzdXJmYWNlKSB7XG5cbiAgICAgICAgdmFyIGN1cnJUYXJnZXQgPSBzdXJmYWNlLl9jdXJyVGFyZ2V0O1xuICAgICAgICB2YXIgdHJhbnNmb3JtcyA9IFtdO1xuICAgICAgICB2YXIgdG90YWxEaXN0ID0gWzAsIDAsIDBdO1xuXG4gICAgICAgIGZ1bmN0aW9uIGdldEFsbFRyYW5zZm9ybXMgKCBlbGVtICkge1xuXG4gICAgICAgICAgICB2YXIgdHJhbnNmb3JtID0gZ2V0VHJhbnNmb3JtKGVsZW0pO1xuXG4gICAgICAgICAgICBpZih0cmFuc2Zvcm0gIT09IFwiXCIgJiYgdHJhbnNmb3JtICE9PSB1bmRlZmluZWQgKSB7XG4gICAgICAgICAgICAgICAgdmFyIG9mZnNldCA9IHBhcnNlVHJhbnNmb3JtKHRyYW5zZm9ybSk7XG5cbiAgICAgICAgICAgICAgICB0b3RhbERpc3RbMF0gKz0gb2Zmc2V0WzBdO1xuICAgICAgICAgICAgICAgIHRvdGFsRGlzdFsxXSArPSBvZmZzZXRbMV07XG4gICAgICAgICAgICAgICAgdG90YWxEaXN0WzJdICs9IG9mZnNldFsyXTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYoIGVsZW0ucGFyZW50RWxlbWVudCAhPT0gZG9jdW1lbnQuYm9keSApIHtcbiAgICAgICAgICAgICAgICBnZXRBbGxUcmFuc2Zvcm1zKGVsZW0ucGFyZW50Tm9kZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgZnVuY3Rpb24gcGFyc2VUcmFuc2Zvcm0odHJhbnNmb3JtKSB7XG4gICAgICAgICAgICB2YXIgdHJhbnNsYXRlID0gW107IFxuXG4gICAgICAgICAgICB0cmFuc2Zvcm0gPSByZW1vdmVNYXRyaXgzZCggdHJhbnNmb3JtICk7XG5cbiAgICAgICAgICAgIHRyYW5zbGF0ZVswXSA9IHBhcnNlSW50KHRyYW5zZm9ybVsxMl0ucmVwbGFjZSgnICcsICcnKSk7IFxuICAgICAgICAgICAgdHJhbnNsYXRlWzFdID0gcGFyc2VJbnQodHJhbnNmb3JtWzEzXS5yZXBsYWNlKCcgJywgJycpKTsgICAgICAgIFxuICAgICAgICAgICAgdHJhbnNsYXRlWzJdID0gcGFyc2VJbnQodHJhbnNmb3JtWzE0XS5yZXBsYWNlKCcgJywgJycpKTsgICAgICAgIFxuXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRyYW5zbGF0ZS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGlmKHR5cGVvZiB0cmFuc2xhdGVbaV0gPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNsYXRlW2ldID0gMDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4gdHJhbnNsYXRlO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gcmVtb3ZlTWF0cml4M2QoIG10eFN0cmluZyApIHsgXG4gICAgICAgICAgICBtdHhTdHJpbmcgPSBtdHhTdHJpbmcucmVwbGFjZSgnbWF0cml4M2QoJywnJyk7XG4gICAgICAgICAgICBtdHhTdHJpbmcgPSBtdHhTdHJpbmcucmVwbGFjZSgnKScsJycpO1xuICAgICAgICAgICAgcmV0dXJuIG10eFN0cmluZy5zcGxpdCgnLCcpO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gZ2V0VHJhbnNmb3JtKCBlbGVtICkgeyBcbiAgICAgICAgICAgIHZhciB0cmFuc2Zvcm0gPSBlbGVtWydzdHlsZSddWyd3ZWJraXRUcmFuc2Zvcm0nXSB8fCBlbGVtWydzdHlsZSddWyd0cmFuc2Zvcm0nXSA7XG4gICAgICAgICAgICByZXR1cm4gdHJhbnNmb3JtO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYoY3VyclRhcmdldCkge1xuXG4gICAgICAgICAgICBnZXRBbGxUcmFuc2Zvcm1zKGN1cnJUYXJnZXQpO1xuXG4gICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdG90YWxEaXN0OyBcbiAgICB9LFxuXG4gICAgLy8gZ2V0IGNlbnRlciBmcm9tIFswLCAwXSBvcmlnaW5cbiAgICBnZXRDZW50ZXJNYXRyaXg6IGZ1bmN0aW9uICggcG9zLCBzaXplLCB6KSB7XG4gICAgICAgIGlmKHogPT0gdW5kZWZpbmVkKSB6ID0gMDtcbiAgICAgICAgcmV0dXJuIEZNLnRyYW5zbGF0ZSggcG9zWzBdIC0gc2l6ZVswXSAqIDAuNSwgcG9zWzFdIC0gc2l6ZVsxXSAqIDAuNSwgeiApOyBcbiAgICB9LFxuXG4gICAgaGFzVXNlck1lZGlhOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuICEhKG5hdmlnYXRvci5nZXRVc2VyTWVkaWEgfHwgbmF2aWdhdG9yLndlYmtpdEdldFVzZXJNZWRpYSB8fFxuICAgICAgICBuYXZpZ2F0b3IubW96R2V0VXNlck1lZGlhIHx8IG5hdmlnYXRvci5tc0dldFVzZXJNZWRpYSk7XG4gICAgfSxcblxuICAgIGdldFVzZXJNZWRpYTogZnVuY3Rpb24oKVxuICAgIHtcbiAgICAgICAgcmV0dXJuIG5hdmlnYXRvci5nZXRVc2VyTWVkaWEgfHwgbmF2aWdhdG9yLndlYmtpdEdldFVzZXJNZWRpYSB8fFxuICAgICAgICBuYXZpZ2F0b3IubW96R2V0VXNlck1lZGlhIHx8IG5hdmlnYXRvci5tc0dldFVzZXJNZWRpYTsgXG4gICAgfSwgXG5cbiAgICBpc1dlYmtpdDogZnVuY3Rpb24gKCkge1xuICAgICAgIHJldHVybiAhIXdpbmRvdy53ZWJraXRVUkw7IFxuICAgIH1cblxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBVdGlscztcbiIsInZhciBTdXJmYWNlID0gcmVxdWlyZSgnZmFtb3VzL3NyYy9jb3JlL1N1cmZhY2UnKTtcbnZhciBFbmdpbmUgPSByZXF1aXJlKCdmYW1vdXMvc3JjL2NvcmUvRW5naW5lJyk7XG52YXIgQXBwVmlldyA9IHJlcXVpcmUoJy4vdmlld3MvQXBwdmlldycpO1xudmFyIEVhc3lDYW1lcmEgPSByZXF1aXJlKCcuL0NvbXBvbmVudHMvRWFzeUNhbWVyYScpO1xucmVxdWlyZSgnLi9zdHlsZXMnKTtcblxudmFyIG1haW5Db250ZXh0ID0gRW5naW5lLmNyZWF0ZUNvbnRleHQoKTtcbm1haW5Db250ZXh0LnNldFBlcnNwZWN0aXZlKDEwMDApO1xuXG52YXIgY2FtZXJhID0gbmV3IEVhc3lDYW1lcmEoKTtcblxudmFyIGFwcCA9IG5ldyBBcHBWaWV3KEVuZ2luZSk7XG5tYWluQ29udGV4dC5hZGQoYXBwKTtcblxud2luZG93LmFwcCA9IGFwcDtcbndpbmRvdy5jb250ZXh0ID0gbWFpbkNvbnRleHQ7XG4iLCJ2YXIgY3NzID0gXCJodG1sIHtcXG4gIGJhY2tncm91bmQgOiByZ2JhKDUwLDUwLDUwLDEpXFxufVxcblxcbi5wYXJ0aWNsZXtcXG4gICAgYmFja2dyb3VuZDogcmdiYSg1MCwyMTAsMjU1LC45KTtcXG4gICAgLXdlYmtpdC1ib3gtc2hhZG93OiBpbnNldCAzcHggM3B4IDVweCAycHggcmdiYSgxODcsIDIxMSwgMjU1LCAwLjgwKSwgMHB4IDBweCA1cHggcmdiYSgwLDUwLDI1NSwuOSk7XFxuICAgIGJvcmRlci1yYWRpdXM6IDUwJTtcXG4gICAgY29sb3IgOiBibGFjaztcXG4gICAgZm9udC1zaXplOiAyMHB4O1xcbiAgICBiYWNrZmFjZS12aXNpYmlsaXR5IDogdmlzaWJsZSAhaW1wb3J0YW50O1xcbiAgICAtd2Via2l0LWJhY2tmYWNlLXZpc2liaWxpdHk6IHZpc2libGUgIWltcG9ydGFudDtcXG59XFxuXFxuLnJlY3RhbmdsZXtcXG4gICAgYmFja2dyb3VuZDogcmdiYSg1MCwyMTAsMjU1LC45KTtcXG4gICAgY29sb3IgOiBibGFjaztcXG4gICAgZm9udC1zaXplOiA0MHB4O1xcbiAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxuICAgIGxpbmUtaGVpZ2h0OiAxMDBweDtcXG59XFxuXFxuLmJhY2tmYWNle1xcbiAgICBiYWNrZmFjZS12aXNpYmlsaXR5IDogdmlzaWJsZSAhaW1wb3J0YW50O1xcbiAgICAtd2Via2l0LWJhY2tmYWNlLXZpc2liaWxpdHk6IHZpc2libGUgIWltcG9ydGFudDtcXG59XFxuXFxuLmNvbG9yMXtcXG4gICAgYmFja2dyb3VuZDogcmdiYSgyMjksIDU1LCAyNTUsIDAuOSk7XFxuICAgIC13ZWJraXQtYm94LXNoYWRvdzogaW5zZXQgM3B4IDNweCA1cHggMnB4IHJnYmEoMjQ0LCAxMjEsIDI1NSwgMC40MCksIDBweCAwcHggNXB4IHJnYmEoMjI0LCAwLCAyNTUsIDAuODkpO1xcbn1cXG5cXG4uY2lyY2xle1xcbiAgICBib3JkZXIgOiAycHggc29saWQgcmdiYSgyNTUsMjU1LDI1NSwwLjcpO1xcbiAgICBib3JkZXItcmFkaXVzIDogNTAlO1xcbiAgICBwb2ludGVyLWV2ZW50cyA6IG5vbmU7XFxufVxcblxcbi5zcGhlcmV7XFxuICAgIGJhY2tncm91bmQtaW1hZ2U6IC13ZWJraXQtcmFkaWFsLWdyYWRpZW50KDQwJSA0MCUsIGNpcmNsZSBjb250YWluLCByZ2JhKDUwLDUwLDUwLC40KSAxMCUsIHJnYmEoMTAwLDEwMCwxMDAsLjQpIDEwMCUpO1xcbiAgICBib3JkZXItcmFkaXVzIDogNTAlO1xcbn1cXG5cIjsgKHJlcXVpcmUoXCIvVXNlcnMvbWljaGFlbHhpYS9GYW1vdXMvVmFuaWxsYS9jdWJlLXdhbGxzLTNkL25vZGVfbW9kdWxlcy9jc3NpZnlcIikpKGNzcyk7IG1vZHVsZS5leHBvcnRzID0gY3NzOyIsIi8vIGxvYWQgY3NzXG5yZXF1aXJlKCdmYW1vdXMvc3JjL2NvcmUvZmFtb3VzLmNzcycpO1xucmVxdWlyZSgnLi9hcHAuY3NzJyk7XG4iLCJ2YXIgVmlldyA9IHJlcXVpcmUoJ2ZhbW91cy9zcmMvY29yZS9WaWV3Jyk7XG52YXIgTW9kaWZpZXIgICAgICAgPSByZXF1aXJlKCdmYW1vdXMvc3JjL2NvcmUvTW9kaWZpZXInKTtcbnZhciBTdXJmYWNlID0gcmVxdWlyZSgnZmFtb3VzL3NyYy9jb3JlL1N1cmZhY2UnKTtcbnZhciBSZXB1bHNpb25Gb3JjZSA9IHJlcXVpcmUoJ2ZhbW91cy9zcmMvcGh5c2ljcy9mb3JjZXMvUmVwdWxzaW9uJyk7XG52YXIgVHJhbnNmb3JtID0gcmVxdWlyZSgnZmFtb3VzL3NyYy9jb3JlL1RyYW5zZm9ybScpO1xudmFyIFN0YXRlTW9kaWZpZXIgPSByZXF1aXJlKCdmYW1vdXMvc3JjL21vZGlmaWVycy9TdGF0ZU1vZGlmaWVyJyk7XG52YXIgVHJhbnNpdGlvbmFibGUgPSByZXF1aXJlKCdmYW1vdXMvc3JjL3RyYW5zaXRpb25zL1RyYW5zaXRpb25hYmxlJyk7XG52YXIgV2FsbHMgPSByZXF1aXJlKCdmYW1vdXMvc3JjL3BoeXNpY3MvY29uc3RyYWludHMvV2FsbHMnKTtcbnZhciBDb2xsaXNpb24gPSByZXF1aXJlKCdmYW1vdXMvc3JjL3BoeXNpY3MvY29uc3RyYWludHMvQ29sbGlzaW9uJyk7XG52YXIgVmVjdG9yRmllbGQgPSByZXF1aXJlKCdmYW1vdXMvc3JjL3BoeXNpY3MvZm9yY2VzL1ZlY3RvckZpZWxkJyk7XG52YXIgVmVjdG9yID0gcmVxdWlyZSgnZmFtb3VzL3NyYy9tYXRoL1ZlY3RvcicpO1xuXG52YXIgRHJhZyA9IHJlcXVpcmUoJ2ZhbW91cy9zcmMvcGh5c2ljcy9mb3JjZXMvRHJhZycpO1xudmFyIFBhcnRpY2xlID0gcmVxdWlyZSgnZmFtb3VzL3NyYy9waHlzaWNzL2JvZGllcy9QYXJ0aWNsZScpO1xudmFyIENpcmNsZSA9IHJlcXVpcmUoJ2ZhbW91cy9zcmMvcGh5c2ljcy9ib2RpZXMvQ2lyY2xlJyk7XG52YXIgQ3ViaWNWaWV3ID0gcmVxdWlyZSgnLi9DdWJpY1ZpZXcnKTtcbnZhciBQaHlzaWNzRW5naW5lID0gcmVxdWlyZSgnZmFtb3VzL3NyYy9waHlzaWNzL1BoeXNpY3NFbmdpbmUnKTtcbnZhciBNb3VzZVN5bmMgICAgID0gcmVxdWlyZSgnZmFtb3VzL3NyYy9pbnB1dHMvTW91c2VTeW5jJyk7XG52YXIgVG91Y2hTeW5jICAgICA9IHJlcXVpcmUoJ2ZhbW91cy9zcmMvaW5wdXRzL1RvdWNoU3luYycpO1xudmFyIFNjcm9sbFN5bmMgICAgPSByZXF1aXJlKCdmYW1vdXMvc3JjL2lucHV0cy9TY3JvbGxTeW5jJyk7XG52YXIgR2VuZXJpY1N5bmMgICA9IHJlcXVpcmUoJ2ZhbW91cy9zcmMvaW5wdXRzL0dlbmVyaWNTeW5jJyk7XG5cbkdlbmVyaWNTeW5jLnJlZ2lzdGVyKHtcbiAgICBcIm1vdXNlXCIgIDogTW91c2VTeW5jLFxuICAgIFwidG91Y2hcIiAgOiBUb3VjaFN5bmMsXG4gICAgXCJzY3JvbGxcIiA6IFNjcm9sbFN5bmNcbn0pO1xuXG5mdW5jdGlvbiBBcHBWaWV3KEVuZ2luZSkge1xuICAgIFZpZXcuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblxuICAgIHRoaXMuc3luYyA9IG5ldyBHZW5lcmljU3luYyh7XG4gICAgICAgIFwibW91c2VcIiAgOiB7fSxcbiAgICAgICAgXCJ0b3VjaFwiICA6IHt9LFxuICAgICAgICBcInNjcm9sbFwiIDoge3NjYWxlIDogLjV9XG4gICAgfSk7XG4gICAgXG4gICAgdGhpcy5fcGh5c2ljc0VuZ2luZSA9IG5ldyBQaHlzaWNzRW5naW5lKCk7XG5cbiAgICB0aGlzLl9yb3RhdGlvblRyYW5zaXRpb25hYmxlID0gbmV3IFRyYW5zaXRpb25hYmxlKFswLCAwLCAwXSlcblxuICAgIHRoaXMuX3JvdGF0aW9uTW9kaWZpZXIgPSBuZXcgTW9kaWZpZXIoe1xuICAgICAgICBvcmlnaW46IFswLjUsIDAuNV0sXG4gICAgICAgIGFsaWduOiBbMC41LCAwLjVdLFxuICAgICAgICB0cmFuc2Zvcm06IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIFRyYW5zZm9ybS5yb3RhdGUuYXBwbHkodGhpcywgdGhpcy5fcm90YXRpb25UcmFuc2l0aW9uYWJsZS5nZXQoKSk7XG4gICAgICAgIH0uYmluZCh0aGlzKVxuICAgIH0pO1xuXG4gICAgdGhpcy5fcm9vdE5vZGUgPSB0aGlzLmFkZCh0aGlzLl9yb3RhdGlvbk1vZGlmaWVyKTtcblxuICAgIF9jcmVhdGVCYWNrZ3JvdW5kLmNhbGwodGhpcyk7XG4gICAgX2NyZWF0ZUN1YmUuY2FsbCh0aGlzKTtcbiAgICBcbiAgICAvL211c3QgY3JlYXRlIGluIHRoaXMgb3JkZXIgZm9yIGFuY2hvciB0byBzaXQgb3V0c2lkZSBvZiB0aGUgd2FsbHMuLi5cbiAgICBfY3JlYXRlU3BoZXJlcy5jYWxsKHRoaXMpO1xuICAgIF9jcmVhdGVXYWxscy5jYWxsKHRoaXMpO1xuICAgIF9jcmVhdGVBbmNob3IuY2FsbCh0aGlzKTtcblxuICAgIF9iaW5kRXZlbnRzLmNhbGwodGhpcyk7XG5cbiAgICB2YXIgcm90YXRlQW5nbGUgPSBNYXRoLlBJLzEwMDtcbiAgICBpZiAocm90YXRlQW5nbGUpe1xuICAgICAgICB2YXIgYW5nbGUgPSAwXG4gICAgICAgIEVuZ2luZS5vbigncHJlcmVuZGVyJywgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIGFuZ2xlICs9IHJvdGF0ZUFuZ2xlO1xuICAgICAgICAgICAgdGhpcy5fd2FsbHMucm90YXRlWihyb3RhdGVBbmdsZSk7XG4gICAgICAgICAgICB2YXIgb2xkX3JvdGF0aW9uID0gdGhpcy5fcm90YXRpb25UcmFuc2l0aW9uYWJsZS5nZXQoKTtcbiAgICAgICAgICAgIG9sZF9yb3RhdGlvblsyXSArPSByb3RhdGVBbmdsZTtcbiAgICAgICAgICAgIC8vIC5zZXRUcmFuc2Zvcm0oTWF0cml4LnJvdGF0ZVooYW5nbGUpKTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICB9O1xufVxuXG5BcHBWaWV3LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoVmlldy5wcm90b3R5cGUpO1xuQXBwVmlldy5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBBcHBWaWV3O1xuXG5BcHBWaWV3LkRFRkFVTFRfT1BUSU9OUyA9IHt9O1xuXG5mdW5jdGlvbiBfY3JlYXRlQ3ViZSgpIHtcbiAgICB0aGlzLmVkZ2VMZW5ndGggPSB3aW5kb3cuaW5uZXJXaWR0aCA8IHdpbmRvdy5pbm5lckhlaWdodCA/IHdpbmRvdy5pbm5lcldpZHRoICogMC41IDogd2luZG93LmlubmVySGVpZ2h0ICogMC41O1xuICAgIHZhciBjdWJlID0gbmV3IEN1YmljVmlldyh7XG4gICAgICAgIGVkZ2VMZW5ndGg6IHRoaXMuZWRnZUxlbmd0aFxuICAgIH0pO1xuICAgIGN1YmUucGlwZSh0aGlzLnN5bmMpO1xuICAgIHRoaXMuX3Jvb3ROb2RlLmFkZChjdWJlKTtcbn1cblxuZnVuY3Rpb24gX2NyZWF0ZUFuY2hvcigpIHtcbiAgICB0aGlzLl9hbmNob3JQYXJ0aWNsZSA9IG5ldyBDaXJjbGUoe1xuICAgICAgcmFkaXVzOiAwXG4gICAgfSk7XG5cbiAgICB0aGlzLl9hbmNob3JQYXJ0aWNsZS5zZXRQb3NpdGlvbihbMCwgMjUwLCAwXSlcblxuICAgIHZhciBhbmNob3JNb2RpZmllciA9IG5ldyBNb2RpZmllcih7XG4gICAgICAgIG9yaWdpbjogWzAuNSwgMC41XSxcbiAgICAgICAgYWxpZ246IFswLjUsIDAuNV0sXG4gICAgICAgIHRyYW5zZm9ybSA6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2FuY2hvclBhcnRpY2xlLmdldFRyYW5zZm9ybSgpO1xuICAgICAgICB9LmJpbmQodGhpcylcbiAgICB9KTtcblxuICAgIHZhciBhbmNob3IgPSBuZXcgU3VyZmFjZSh7XG4gICAgICBzaXplOiBbNTAsIDUwXSxcbiAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgYmFja2dyb3VuZENvbG9yOiAncmVkJ1xuICAgICAgfVxuICAgIH0pO1xuICAgIHRoaXMuX3BoeXNpY3NFbmdpbmUuYWRkQm9keSh0aGlzLl9hbmNob3JQYXJ0aWNsZSk7XG5cbiAgICB2YXIgZ3Jhdml0eSA9IG5ldyBSZXB1bHNpb25Gb3JjZSh7XG4gICAgICAgIHN0cmVuZ3RoOiAtNTBcbiAgICB9KTtcblxuICAgIHRoaXMuX3BoeXNpY3NFbmdpbmUuYXR0YWNoKGdyYXZpdHksIHRoaXMuX3NwaGVyZXMsIHRoaXMuX2FuY2hvclBhcnRpY2xlKTtcblxuICAgIHRoaXMuYWRkKGFuY2hvck1vZGlmaWVyKS5hZGQoYW5jaG9yKTtcbn1cblxuZnVuY3Rpb24gX2NyZWF0ZVdhbGxzKCkge1xuICAgIHRoaXMuX3dhbGxzID0gbmV3IFdhbGxzKHtcbiAgICAgICAgcmVzdGl0dXRpb24gOiAwLjUsXG4gICAgICAgIHNpemUgOiBbdGhpcy5lZGdlTGVuZ3RoLCB0aGlzLmVkZ2VMZW5ndGgsIHRoaXMuZWRnZUxlbmd0aF0sXG4gICAgICAgIG9yaWdpbiA6IFswLjUsIDAuNSwgMC41XSxcbiAgICAgICAgayA6IDAuNSxcbiAgICAgICAgZHJpZnQgOiAwLjUsXG4gICAgICAgIHNsb3AgOiAwLFxuICAgICAgICBzaWRlcyA6IFdhbGxzLlNJREVTLlRIUkVFX0RJTUVOU0lPTkFMLFxuICAgICAgICBvbkNvbnRhY3QgOiBXYWxscy5PTl9DT05UQUNULlJFRkxFQ1RcbiAgICB9KTtcbiAgICBcbiAgICB0aGlzLl93YWxscy5vcHRpb25zLnNpZGVzID0gdGhpcy5fd2FsbHMuY29tcG9uZW50czsgLy8gUGF0Y2ggZm9yIGJ1ZyBpbiBXYWxscyBtb2R1bGUuXG4gICAgdGhpcy5fd2FsbHMuc2lkZXMgPSB0aGlzLl93YWxscy5jb21wb25lbnRzOyAgICAgICAgIC8vIFBhdGNoIGZvciBidWcgaW4gV2FsbHMgbW9kdWxlLlxuICAgIFxuICAgIC8vIHRoaXMuX3BoeXNpY3NFbmdpbmUuYXR0YWNoKFt0aGlzLl93YWxscywgZHJhZ10pO1xuICAgIHRoaXMuX3BoeXNpY3NFbmdpbmUuYXR0YWNoKHRoaXMuX3dhbGxzLCB0aGlzLl9zcGhlcmVzKTtcbn1cblxuZnVuY3Rpb24gIF9jcmVhdGVTcGhlcmVzKCkge1xuICAgIFxuICAgIHRoaXMuc3BoZXJlcyA9IFtdO1xuICAgIGZvcih2YXIgaT0wOyBpPDEwOyBpKyspIHtcbiAgICAgICAgdmFyIHNwaGVyZSA9IF9jcmVhdGVTcGhlcmUoKTtcbiAgICAgICAgdGhpcy5hZGQoc3BoZXJlLm1vZGlmaWVyKS5hZGQoc3BoZXJlLnN1cmZhY2UpO1xuICAgICAgICB0aGlzLl9waHlzaWNzRW5naW5lLmFkZEJvZHkoc3BoZXJlLmNpcmNsZSk7XG4gICAgICAgIHRoaXMuc3BoZXJlcy5wdXNoKHNwaGVyZS5jaXJjbGUpO1xuICAgICAgICBcbiAgICAgICAgLy8gdmFyIHNwaGVyZVIgPSAyMDtcbiAgICAgICAgLy8gdmFyIHNwaGVyZVN1cmZhY2UgPSBuZXcgU3VyZmFjZSh7XG4gICAgICAgIC8vICAgICBzaXplOiBbMipzcGhlcmVSLCAyKnNwaGVyZVJdLFxuICAgICAgICAvLyAgICAgY2xhc3NlczogWydwYXJ0aWNsZSddLFxuICAgICAgICAvLyAgICAgcHJvcGVydGllczoge1xuICAgICAgICAvLyAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJ2JsdWUnXG4gICAgICAgIC8vICAgICB9XG4gICAgICAgIC8vIH0pO1xuXG4gICAgICAgIC8vIHZhciBzcGhlcmVQYXJ0aWNsZSA9IG5ldyBDaXJjbGUoe1xuICAgICAgICAvLyAgIHJhZGl1czogMjVcbiAgICAgICAgLy8gfSk7XG4gICAgICAgIFxuICAgICAgICAvLyB2YXIgc3BoZXJlTW9kaWZpZXIgPSBuZXcgTW9kaWZpZXIoe1xuICAgICAgICAvLyAgICAgc2l6ZTogWzIqc3BoZXJlUiwgMipzcGhlcmVSXSxcbiAgICAgICAgLy8gICAgIGFsaWduOiBbMC41LCAwLjVdLFxuICAgICAgICAvLyAgICAgb3JpZ2luOiBbMC41LCAwLjVdLFxuICAgICAgICAvLyAgICAgdHJhbnNmb3JtOiBmdW5jdGlvbigpIHtcbiAgICAgICAgLy8gICAgICAgICByZXR1cm4gc3BoZXJlUGFydGljbGUuZ2V0VHJhbnNmb3JtKCk7XG4gICAgICAgIC8vICAgICB9XG4gICAgICAgIC8vIH0pO1xuXG4gICAgICAgIC8vIHRoaXMuX3BoeXNpY3NFbmdpbmUuYWRkQm9keShzcGhlcmVQYXJ0aWNsZSk7XG4gICAgICAgIC8vIHRoaXMuc3BoZXJlcy5wdXNoKHNwaGVyZVBhcnRpY2xlKTtcbiAgICAgICAgLy8gc3BoZXJlUGFydGljbGUuc2V0VmVsb2NpdHkoMC4yLCAwLCAwKTtcbiAgICAgICAgLy8gdGhpcy5fcm9vdE5vZGUuYWRkKHNwaGVyZU1vZGlmaWVyKS5hZGQoc3BoZXJlU3VyZmFjZSk7XG5cbiAgICAgICAgXG4gICAgfVxuXG59XG5cbmZ1bmN0aW9uIF9jcmVhdGVTcGhlcmUoKSB7XG5cbiAgICB2YXIgc2l6ZSA9IE1hdGgucmFuZG9tKCkgKiA5MDtcblxuICAgIHZhciBjaXJjbGUgPSBuZXcgQ2lyY2xlKHtcbiAgICAgIHJhZGl1czogc2l6ZSxcbiAgICAgIHBvc2l0aW9uOiBuZXcgVmVjdG9yKDAsIDAsIDApLFxuICAgICAgdmVsb2NpdHk6IG5ldyBWZWN0b3IoMCwgMCwgMClcbiAgICB9KTtcblxuICAgIHZhciBzdXJmYWNlID0gbmV3IFN1cmZhY2Uoe1xuICAgICAgc2l6ZTogW3NpemUsIHNpemVdLFxuICAgICAgY2xhc3NlczogWydwYXJ0aWNsZSddXG4gICAgfSk7XG4gICAgaWYoTWF0aC5yYW5kb20oKSA+IDAuNSkgc3VyZmFjZS5hZGRDbGFzcygnY29sb3IxJyk7XG5cbiAgICB2YXIgbW9kaWZpZXIgPSBuZXcgTW9kaWZpZXIoe1xuICAgICAgYWxpZ246IFswLjUsIDAuNV0sXG4gICAgICBvcmlnaW46IFswLjUsIDAuNV0sXG4gICAgICB0cmFuc2Zvcm06IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gY2lyY2xlLmdldFRyYW5zZm9ybSgpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIGNpcmNsZTogY2lyY2xlLFxuICAgICAgbW9kaWZpZXI6IG1vZGlmaWVyLFxuICAgICAgc3VyZmFjZTogc3VyZmFjZVxuICAgIH07XG59XG5cbmZ1bmN0aW9uIF9jcmVhdGVCYWNrZ3JvdW5kKCkge1xuICAgIHRoaXMuX2JhY2tncm91bmRTdXJmYWNlID0gbmV3IFN1cmZhY2Uoe1xuICAgICAgICBzaXplOiBbdW5kZWZpbmVkLCB1bmRlZmluZWRdXG4gICAgfSlcbiAgICB0aGlzLl9iYWNrZ3JvdW5kU3VyZmFjZS5waXBlKHRoaXMuc3luYyk7XG4gICAgdGhpcy5hZGQodGhpcy5fYmFja2dyb3VuZFN1cmZhY2UpO1xufVxuXG5mdW5jdGlvbiBfYmluZEV2ZW50cygpIHtcbiAgICB0aGlzLnN5bmMub24oJ3N0YXJ0JywgZnVuY3Rpb24oZGF0YSl7XG4gICAgICAgIGNvbnNvbGUubG9nKCdzdGFydCcsIGRhdGEpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5zeW5jLm9uKCd1cGRhdGUnLCBmdW5jdGlvbihkYXRhKXtcbiAgICAgICAgdmFyIGRYID0gZGF0YS5kZWx0YVswXTtcbiAgICAgICAgdmFyIGRZID0gZGF0YS5kZWx0YVsxXTtcblxuICAgICAgICB2YXIgb2xkX3JvdGF0aW9uID0gdGhpcy5fcm90YXRpb25UcmFuc2l0aW9uYWJsZS5nZXQoKTtcbiAgICAgICAgXG4gICAgICAgIG9sZF9yb3RhdGlvblswXSArPSAtZFkvMTAwO1xuICAgICAgICB0aGlzLl93YWxscy5yb3RhdGVYKC1kWS8xMDApO1xuICAgICAgICBvbGRfcm90YXRpb25bMV0gKz0gZFgvMTAwO1xuICAgICAgICB0aGlzLl93YWxscy5yb3RhdGVZKGRYLzEwMCk7XG4gICAgfS5iaW5kKHRoaXMpKTtcblxuICAgIHRoaXMuc3luYy5vbignZW5kJywgZnVuY3Rpb24oZGF0YSl7XG4gICAgICAgIGNvbnNvbGUubG9nKCdlbmQnLCBkYXRhKTtcbiAgICB9KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBBcHBWaWV3O1xuIiwidmFyIFZpZXcgICAgICAgICAgID0gcmVxdWlyZSgnZmFtb3VzL3NyYy9jb3JlL1ZpZXcnKTtcbnZhciBTdXJmYWNlICAgICAgICA9IHJlcXVpcmUoJ2ZhbW91cy9zcmMvY29yZS9TdXJmYWNlJyk7XG52YXIgVHJhbnNmb3JtICAgICAgPSByZXF1aXJlKCdmYW1vdXMvc3JjL2NvcmUvVHJhbnNmb3JtJyk7XG52YXIgTW9kaWZpZXIgICAgICAgPSByZXF1aXJlKCdmYW1vdXMvc3JjL2NvcmUvTW9kaWZpZXInKTtcbnZhciBUcmFuc2l0aW9uYWJsZSA9IHJlcXVpcmUoJ2ZhbW91cy9zcmMvdHJhbnNpdGlvbnMvVHJhbnNpdGlvbmFibGUnKTtcbnZhciBTdGF0ZU1vZGlmaWVyICA9IHJlcXVpcmUoJ2ZhbW91cy9zcmMvbW9kaWZpZXJzL1N0YXRlTW9kaWZpZXInKTtcbnZhciBFYXNpbmcgICAgICAgICA9IHJlcXVpcmUoJ2ZhbW91cy9zcmMvdHJhbnNpdGlvbnMvRWFzaW5nJyk7XG52YXIgRXZlbnRIYW5kbGVyICAgPSByZXF1aXJlKCdmYW1vdXMvc3JjL2NvcmUvRXZlbnRIYW5kbGVyJyk7XG5cbnZhciBOSU5FVFlfREVHUkVTUyA9IE1hdGguUEkvMjtcblxudmFyIEZBQ0VfUk9UQVRJT05TID0gW1xuICAgIFswLCAwLCAwXSwgICAgICAgICAgICAgICAgICAgIC8vRlJPTlRcbiAgICBbLU5JTkVUWV9ERUdSRVNTLCAwLCAwXSwgICAgICAvL0xFRlRcbiAgICBbTklORVRZX0RFR1JFU1MsIDAsIDBdLCAgICAgICAvL1JJR0hUXG4gICAgWzAsIC1OSU5FVFlfREVHUkVTUywgMF0sICAgICAgLy9CT1RUT01cbiAgICBbMCwgTklORVRZX0RFR1JFU1MsIDBdLCAgICAgICAvL1RPUCBcbiAgICBbMiAqIE5JTkVUWV9ERUdSRVNTLCAwLCAwXSwgICAvL0JBQ0sgIFxuXVxuXG5mdW5jdGlvbiBDdWJpY1ZpZXcoKSB7XG4gICAgVmlldy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXG4gICAgdGhpcy5fY3ViZVJvdGF0aW9uU3RhdGUgPSBuZXcgVHJhbnNpdGlvbmFibGUoWzAsIDAsIDBdKTtcbiAgICB0aGlzLl9jdWJlVHJhbnNsYXRpb25TdGF0ZSA9IG5ldyBUcmFuc2l0aW9uYWJsZShbMCwgMCwgMF0pO1xuXG4gICAgdGhpcy5fZmFjZXMgPSBbXTtcblxuICAgIHRoaXMuX3JvdGF0aW9uTW9kaWZpZXIgPSBuZXcgTW9kaWZpZXIoe1xuICAgICAgICAvLyBhbGlnbjogWzAuNSwgMC41XSxcbiAgICAgICAgLy8gb3JpZ2luOiBbMC41LCAwLjVdLFxuICAgICAgICB0cmFuc2Zvcm06IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHN0YXRlID0gdGhpcy5fY3ViZVJvdGF0aW9uU3RhdGUuZ2V0KCk7XG4gICAgICAgICAgICAvLyByZXR1cm4gVHJhbnNmb3JtLnJvdGF0ZShzdGF0ZVswXSwgc3RhdGVbMV0sIHN0YXRlWzJdKTtcbiAgICAgICAgICAgIHJldHVybiBUcmFuc2Zvcm0ucm90YXRlLmFwcGx5KHRoaXMsIHN0YXRlKTtcbiAgICAgICAgfS5iaW5kKHRoaXMpXG4gICAgfSk7XG5cbiAgICB0aGlzLl90cmFuc2xhdGlvbk1vZGlmaWVyID0gbmV3IE1vZGlmaWVyKHtcbiAgICAgICAgdHJhbnNmb3JtIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHN0YXRlID0gdGhpcy5fY3ViZVRyYW5zbGF0aW9uU3RhdGUuZ2V0KCk7XG4gICAgICAgICAgICByZXR1cm4gVHJhbnNmb3JtLnRyYW5zbGF0ZS5hcHBseSh0aGlzLCBzdGF0ZSk7XG4gICAgICAgIH0uYmluZCh0aGlzKVxuICAgIH0pXG5cbiAgICB0aGlzLl9yb290Tm9kZSA9IHRoaXMuYWRkKHRoaXMuX3RyYW5zbGF0aW9uTW9kaWZpZXIpLmFkZCh0aGlzLl9yb3RhdGlvbk1vZGlmaWVyKTtcbiAgICBcbiAgICBfY3JlYXRlQ3ViZS5jYWxsKHRoaXMpO1xufVxuXG5DdWJpY1ZpZXcucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShWaWV3LnByb3RvdHlwZSk7XG5DdWJpY1ZpZXcucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQ3ViaWNWaWV3O1xuXG5DdWJpY1ZpZXcuREVGQVVMVF9PUFRJT05TID0ge1xuICAgIGVkZ2VMZW5ndGggOiA1MCxcbiAgICB0cmFuc2xhdGlvbiA6IDI1XG59O1xuXG5mdW5jdGlvbiBfY3JlYXRlQ3ViZSgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgZm9yKHZhciBpPTA7IGk8RkFDRV9ST1RBVElPTlMubGVuZ3RoOyBpKyspe1xuXG4gICAgICAgIHZhciBmYWNlID0gX2NyZWF0ZUZhY2UuY2FsbCh0aGlzLCBpKTtcbiAgICAgICAgdmFyIGZhY2VNb2RpZmllciA9IG5ldyBNb2RpZmllcih7XG4gICAgICAgICAgICBvcGFjaXR5OiAwLjUsXG4gICAgICAgICAgICB0cmFuc2Zvcm06IFRyYW5zZm9ybS5tdWx0aXBseShcbiAgICAgICAgICAgICAgICBUcmFuc2Zvcm0ucm90YXRlLmFwcGx5KHNlbGYsIEZBQ0VfUk9UQVRJT05TW2ldKSxcbiAgICAgICAgICAgICAgICBUcmFuc2Zvcm0udHJhbnNsYXRlKDAsIDAsIHRoaXMub3B0aW9ucy5lZGdlTGVuZ3RoICogMC41KVxuICAgICAgICAgICAgKVxuICAgICAgICB9KTtcblxuICAgICAgICBzZWxmLl9mYWNlcy5wdXNoKGZhY2UpO1xuICAgICAgICBzZWxmLl9yb290Tm9kZS5hZGQoZmFjZU1vZGlmaWVyKS5hZGQoZmFjZSk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBfY3JlYXRlRmFjZShpbmRleCkge1xuICAgIHZhciBmYWNlID0gbmV3IFN1cmZhY2Uoe1xuICAgICAgY29udGVudDogJycsXG4gICAgICBzaXplOiBbdGhpcy5vcHRpb25zLmVkZ2VMZW5ndGgsIHRoaXMub3B0aW9ucy5lZGdlTGVuZ3RoXSxcbiAgICAgIGNsYXNzZXMgOiBbJ2JhY2tmYWNlJ10sXG4gICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgIHRleHRBbGlnbjogJ2NlbnRlcicsXG4gICAgICAgIGxpbmVIZWlnaHQ6ICc3MHB4JyxcbiAgICAgICAgZm9udFNpemU6ICczNXB4JyxcbiAgICAgICAgYmFja2dyb3VuZCA6ICdyZ2JhKDI1NSwyNTUsMjU1LDAuMSknLFxuICAgICAgICBib3JkZXIgOiAnMXB4IHNvbGlkIHJnYmEoMjU1LDI1NSwyNTUsMSknXG4gICAgICB9XG4gICAgfSk7XG4gICAgZmFjZS5waXBlKHRoaXMuX2V2ZW50T3V0cHV0KTtcbiAgICByZXR1cm4gZmFjZTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBDdWJpY1ZpZXc7XG4iXX0=
