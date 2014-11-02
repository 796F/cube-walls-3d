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
},{"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/cssify":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/cssify/browser.js"}],"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/math/Matrix.js":[function(require,module,exports){
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

var app = new AppView();
mainContext.add(camera.mod).add(app);

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
// var MouseSync     = require("famous/inputs/MouseSync");
// var TouchSync     = require("famous/inputs/TouchSync");
// var ScrollSync    = require("famous/inputs/ScrollSync");
// var GenericSync   = require("famous/inputs/GenericSync");

// GenericSync.register({
//     "mouse"  : MouseSync,
//     "touch"  : TouchSync,
//     "scroll" : ScrollSync
// });

function AppView() {
    View.apply(this, arguments);

    // this.sync = new GenericSync({
    //     "mouse"  : {},
    //     "touch"  : {},
    //     "scroll" : {scale : .5}
    // });
    
    this._physicsEngine = new PhysicsEngine();

    this._rotationTransitionable = new Transitionable([0, 0, 0])

    this._rotationModifier = new Modifier({
        // origin: [0.5, 0.5],
        // align: [0.5, 0.5],
        transform: function() {
            return Transform.rotate.apply(this, this._rotationTransitionable.get());
        }.bind(this)
    });

    this._rootNode = this.add(this._rotationModifier);

    var anchor = new Surface({
      size: [50, 50],
      properties: {
        backgroundColor: 'red'
      }
    });

    this.add(anchor);

    _createBackground.call(this);
    _createCube.call(this);
    _createSpheres.call(this);
    _createWalls.call(this);
    _bindEvents.call(this);
}

AppView.prototype = Object.create(View.prototype);
AppView.prototype.constructor = AppView;

AppView.DEFAULT_OPTIONS = {};

function _createCube() {
    // var edgeLength = window.innerWidth < window.innerHeight ? window.innerWidth * 0.5 : window.innerHeight * 0.5;
    var edgeLength = 500;
    var cube = new CubicView({
        edgeLength: edgeLength
    });
    // cube.pipe(this.sync);
    this._rootNode.add(cube);
}

function _createWalls() {
    this._walls = new Walls({
        restitution : 0.5,
        size : [500, 500, 500],
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
    for(var i=0; i<5; i++) {
        var sphere = _createSphere();
        this._rootNode.add(sphere.modifier).add(sphere.surface);
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

        // var gravity = new RepulsionForce({
        //     strength: -5
        // });

        // var gravity = new VectorField({
        //     strength : 0.005
        // });
        // this._physicsEngine.attach(gravity, sphereParticle, anchorParticle);
    }

}

function _createSphere() {
    var circle = new Circle({
      radius: 25
    });

    circle.applyForce(new Vector(Math.random() * 0.01, Math.random() * 0.01, 0));

    var surface = new Surface({
      size: [50, 50],
      classes: ['particle'],
      properties: {
        backgroundColor : 'blue'
      }
    });

    var modifier = new Modifier({
      align: [0.5, 0.5],
      origin: [0.5, 0.5],
      size: [50, 50],
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
    // this._backgroundSurface.pipe(this.sync);
    this.add(this._backgroundSurface);
}

function _bindEvents() {
    // this.sync.on('start', function(data){
    //     console.log('start', data.delta);
    // });

    // this.sync.on('update', function(data){
    //     var dX = data.delta[0];
    //     var dY = data.delta[1];

    //     var old_rotation = this._rotationTransitionable.get();
    //     //clamp for now.  
    //     if(Math.abs(old_rotation[0] - dY/100) <= 1) old_rotation[0] -= dY/100;
    //     old_rotation[1] += dX/100;
    // }.bind(this));

    // this.sync.on('end', function(data){
    //     console.log('end', data.delta);
    // });
}

module.exports = AppView;

},{"./CubicView":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/src/views/CubicView.js","famous/src/core/Modifier":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/core/Modifier.js","famous/src/core/Surface":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/core/Surface.js","famous/src/core/Transform":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/core/Transform.js","famous/src/core/View":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/core/View.js","famous/src/math/Vector":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/math/Vector.js","famous/src/modifiers/StateModifier":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/modifiers/StateModifier.js","famous/src/physics/PhysicsEngine":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/physics/PhysicsEngine.js","famous/src/physics/bodies/Circle":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/physics/bodies/Circle.js","famous/src/physics/bodies/Particle":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/physics/bodies/Particle.js","famous/src/physics/constraints/Collision":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/physics/constraints/Collision.js","famous/src/physics/constraints/Walls":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/physics/constraints/Walls.js","famous/src/physics/forces/Drag":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/physics/forces/Drag.js","famous/src/physics/forces/Repulsion":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/physics/forces/Repulsion.js","famous/src/physics/forces/VectorField":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/physics/forces/VectorField.js","famous/src/transitions/Transitionable":"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/node_modules/famous/src/transitions/Transitionable.js"}],"/Users/michaelxia/Famous/Vanilla/cube-walls-3d/src/views/CubicView.js":[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvY3NzaWZ5L2Jyb3dzZXIuanMiLCJub2RlX21vZHVsZXMvZmFtb3VzL3NyYy9jb3JlL0NvbnRleHQuanMiLCJub2RlX21vZHVsZXMvZmFtb3VzL3NyYy9jb3JlL0VsZW1lbnRBbGxvY2F0b3IuanMiLCJub2RlX21vZHVsZXMvZmFtb3VzL3NyYy9jb3JlL0VsZW1lbnRPdXRwdXQuanMiLCJub2RlX21vZHVsZXMvZmFtb3VzL3NyYy9jb3JlL0VuZ2luZS5qcyIsIm5vZGVfbW9kdWxlcy9mYW1vdXMvc3JjL2NvcmUvRW50aXR5LmpzIiwibm9kZV9tb2R1bGVzL2ZhbW91cy9zcmMvY29yZS9FdmVudEVtaXR0ZXIuanMiLCJub2RlX21vZHVsZXMvZmFtb3VzL3NyYy9jb3JlL0V2ZW50SGFuZGxlci5qcyIsIm5vZGVfbW9kdWxlcy9mYW1vdXMvc3JjL2NvcmUvTW9kaWZpZXIuanMiLCJub2RlX21vZHVsZXMvZmFtb3VzL3NyYy9jb3JlL09wdGlvbnNNYW5hZ2VyLmpzIiwibm9kZV9tb2R1bGVzL2ZhbW91cy9zcmMvY29yZS9SZW5kZXJOb2RlLmpzIiwibm9kZV9tb2R1bGVzL2ZhbW91cy9zcmMvY29yZS9TcGVjUGFyc2VyLmpzIiwibm9kZV9tb2R1bGVzL2ZhbW91cy9zcmMvY29yZS9TdXJmYWNlLmpzIiwibm9kZV9tb2R1bGVzL2ZhbW91cy9zcmMvY29yZS9UcmFuc2Zvcm0uanMiLCJub2RlX21vZHVsZXMvZmFtb3VzL3NyYy9jb3JlL1ZpZXcuanMiLCJub2RlX21vZHVsZXMvZmFtb3VzL3NyYy9jb3JlL2ZhbW91cy5jc3MiLCJub2RlX21vZHVsZXMvZmFtb3VzL3NyYy9tYXRoL01hdHJpeC5qcyIsIm5vZGVfbW9kdWxlcy9mYW1vdXMvc3JjL21hdGgvUXVhdGVybmlvbi5qcyIsIm5vZGVfbW9kdWxlcy9mYW1vdXMvc3JjL21hdGgvVmVjdG9yLmpzIiwibm9kZV9tb2R1bGVzL2ZhbW91cy9zcmMvbW9kaWZpZXJzL1N0YXRlTW9kaWZpZXIuanMiLCJub2RlX21vZHVsZXMvZmFtb3VzL3NyYy9waHlzaWNzL1BoeXNpY3NFbmdpbmUuanMiLCJub2RlX21vZHVsZXMvZmFtb3VzL3NyYy9waHlzaWNzL2JvZGllcy9Cb2R5LmpzIiwibm9kZV9tb2R1bGVzL2ZhbW91cy9zcmMvcGh5c2ljcy9ib2RpZXMvQ2lyY2xlLmpzIiwibm9kZV9tb2R1bGVzL2ZhbW91cy9zcmMvcGh5c2ljcy9ib2RpZXMvUGFydGljbGUuanMiLCJub2RlX21vZHVsZXMvZmFtb3VzL3NyYy9waHlzaWNzL2NvbnN0cmFpbnRzL0NvbGxpc2lvbi5qcyIsIm5vZGVfbW9kdWxlcy9mYW1vdXMvc3JjL3BoeXNpY3MvY29uc3RyYWludHMvQ29uc3RyYWludC5qcyIsIm5vZGVfbW9kdWxlcy9mYW1vdXMvc3JjL3BoeXNpY3MvY29uc3RyYWludHMvV2FsbC5qcyIsIm5vZGVfbW9kdWxlcy9mYW1vdXMvc3JjL3BoeXNpY3MvY29uc3RyYWludHMvV2FsbHMuanMiLCJub2RlX21vZHVsZXMvZmFtb3VzL3NyYy9waHlzaWNzL2ZvcmNlcy9EcmFnLmpzIiwibm9kZV9tb2R1bGVzL2ZhbW91cy9zcmMvcGh5c2ljcy9mb3JjZXMvRm9yY2UuanMiLCJub2RlX21vZHVsZXMvZmFtb3VzL3NyYy9waHlzaWNzL2ZvcmNlcy9SZXB1bHNpb24uanMiLCJub2RlX21vZHVsZXMvZmFtb3VzL3NyYy9waHlzaWNzL2ZvcmNlcy9WZWN0b3JGaWVsZC5qcyIsIm5vZGVfbW9kdWxlcy9mYW1vdXMvc3JjL3BoeXNpY3MvaW50ZWdyYXRvcnMvU3ltcGxlY3RpY0V1bGVyLmpzIiwibm9kZV9tb2R1bGVzL2ZhbW91cy9zcmMvdHJhbnNpdGlvbnMvRWFzaW5nLmpzIiwibm9kZV9tb2R1bGVzL2ZhbW91cy9zcmMvdHJhbnNpdGlvbnMvTXVsdGlwbGVUcmFuc2l0aW9uLmpzIiwibm9kZV9tb2R1bGVzL2ZhbW91cy9zcmMvdHJhbnNpdGlvbnMvVHJhbnNpdGlvbmFibGUuanMiLCJub2RlX21vZHVsZXMvZmFtb3VzL3NyYy90cmFuc2l0aW9ucy9UcmFuc2l0aW9uYWJsZVRyYW5zZm9ybS5qcyIsIm5vZGVfbW9kdWxlcy9mYW1vdXMvc3JjL3RyYW5zaXRpb25zL1R3ZWVuVHJhbnNpdGlvbi5qcyIsIm5vZGVfbW9kdWxlcy9mYW1vdXMvc3JjL3V0aWxpdGllcy9VdGlsaXR5LmpzIiwic3JjL0NvbXBvbmVudHMvRWFzeUNhbWVyYS5qcyIsInNyYy9Db21wb25lbnRzL09sZE1hdHJpeC5qcyIsInNyYy9Db21wb25lbnRzL09sZFF1YXRlcm5pb24uanMiLCJzcmMvQ29tcG9uZW50cy9VdGlscy5qcyIsInNyYy9pbmRleC5qcyIsInNyYy9zdHlsZXMvYXBwLmNzcyIsInNyYy9zdHlsZXMvaW5kZXguanMiLCJzcmMvdmlld3MvQXBwdmlldy5qcyIsInNyYy92aWV3cy9DdWJpY1ZpZXcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25HQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4ckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQ0E7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdlFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbk1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN09BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDellBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3bEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JRQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFlQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDak5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoY3NzLCBjdXN0b21Eb2N1bWVudCkge1xuICB2YXIgZG9jID0gY3VzdG9tRG9jdW1lbnQgfHwgZG9jdW1lbnQ7XG4gIGlmIChkb2MuY3JlYXRlU3R5bGVTaGVldCkge1xuICAgIHZhciBzaGVldCA9IGRvYy5jcmVhdGVTdHlsZVNoZWV0KClcbiAgICBzaGVldC5jc3NUZXh0ID0gY3NzO1xuICAgIHJldHVybiBzaGVldC5vd25lck5vZGU7XG4gIH0gZWxzZSB7XG4gICAgdmFyIGhlYWQgPSBkb2MuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2hlYWQnKVswXSxcbiAgICAgICAgc3R5bGUgPSBkb2MuY3JlYXRlRWxlbWVudCgnc3R5bGUnKTtcblxuICAgIHN0eWxlLnR5cGUgPSAndGV4dC9jc3MnO1xuXG4gICAgaWYgKHN0eWxlLnN0eWxlU2hlZXQpIHtcbiAgICAgIHN0eWxlLnN0eWxlU2hlZXQuY3NzVGV4dCA9IGNzcztcbiAgICB9IGVsc2Uge1xuICAgICAgc3R5bGUuYXBwZW5kQ2hpbGQoZG9jLmNyZWF0ZVRleHROb2RlKGNzcykpO1xuICAgIH1cblxuICAgIGhlYWQuYXBwZW5kQ2hpbGQoc3R5bGUpO1xuICAgIHJldHVybiBzdHlsZTtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMuYnlVcmwgPSBmdW5jdGlvbih1cmwpIHtcbiAgaWYgKGRvY3VtZW50LmNyZWF0ZVN0eWxlU2hlZXQpIHtcbiAgICByZXR1cm4gZG9jdW1lbnQuY3JlYXRlU3R5bGVTaGVldCh1cmwpLm93bmVyTm9kZTtcbiAgfSBlbHNlIHtcbiAgICB2YXIgaGVhZCA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoZWFkJylbMF0sXG4gICAgICAgIGxpbmsgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaW5rJyk7XG5cbiAgICBsaW5rLnJlbCA9ICdzdHlsZXNoZWV0JztcbiAgICBsaW5rLmhyZWYgPSB1cmw7XG5cbiAgICBoZWFkLmFwcGVuZENoaWxkKGxpbmspO1xuICAgIHJldHVybiBsaW5rO1xuICB9XG59O1xuIiwidmFyIFJlbmRlck5vZGUgPSByZXF1aXJlKCcuL1JlbmRlck5vZGUnKTtcbnZhciBFdmVudEhhbmRsZXIgPSByZXF1aXJlKCcuL0V2ZW50SGFuZGxlcicpO1xudmFyIEVsZW1lbnRBbGxvY2F0b3IgPSByZXF1aXJlKCcuL0VsZW1lbnRBbGxvY2F0b3InKTtcbnZhciBUcmFuc2Zvcm0gPSByZXF1aXJlKCcuL1RyYW5zZm9ybScpO1xudmFyIFRyYW5zaXRpb25hYmxlID0gcmVxdWlyZSgnLi4vdHJhbnNpdGlvbnMvVHJhbnNpdGlvbmFibGUnKTtcbnZhciBfemVyb1plcm8gPSBbXG4gICAgICAgIDAsXG4gICAgICAgIDBcbiAgICBdO1xudmFyIHVzZVByZWZpeCA9ICEoJ3BlcnNwZWN0aXZlJyBpbiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc3R5bGUpO1xuZnVuY3Rpb24gX2dldEVsZW1lbnRTaXplKGVsZW1lbnQpIHtcbiAgICByZXR1cm4gW1xuICAgICAgICBlbGVtZW50LmNsaWVudFdpZHRoLFxuICAgICAgICBlbGVtZW50LmNsaWVudEhlaWdodFxuICAgIF07XG59XG52YXIgX3NldFBlcnNwZWN0aXZlID0gdXNlUHJlZml4ID8gZnVuY3Rpb24gKGVsZW1lbnQsIHBlcnNwZWN0aXZlKSB7XG4gICAgICAgIGVsZW1lbnQuc3R5bGUud2Via2l0UGVyc3BlY3RpdmUgPSBwZXJzcGVjdGl2ZSA/IHBlcnNwZWN0aXZlLnRvRml4ZWQoKSArICdweCcgOiAnJztcbiAgICB9IDogZnVuY3Rpb24gKGVsZW1lbnQsIHBlcnNwZWN0aXZlKSB7XG4gICAgICAgIGVsZW1lbnQuc3R5bGUucGVyc3BlY3RpdmUgPSBwZXJzcGVjdGl2ZSA/IHBlcnNwZWN0aXZlLnRvRml4ZWQoKSArICdweCcgOiAnJztcbiAgICB9O1xuZnVuY3Rpb24gQ29udGV4dChjb250YWluZXIpIHtcbiAgICB0aGlzLmNvbnRhaW5lciA9IGNvbnRhaW5lcjtcbiAgICB0aGlzLl9hbGxvY2F0b3IgPSBuZXcgRWxlbWVudEFsbG9jYXRvcihjb250YWluZXIpO1xuICAgIHRoaXMuX25vZGUgPSBuZXcgUmVuZGVyTm9kZSgpO1xuICAgIHRoaXMuX2V2ZW50T3V0cHV0ID0gbmV3IEV2ZW50SGFuZGxlcigpO1xuICAgIHRoaXMuX3NpemUgPSBfZ2V0RWxlbWVudFNpemUodGhpcy5jb250YWluZXIpO1xuICAgIHRoaXMuX3BlcnNwZWN0aXZlU3RhdGUgPSBuZXcgVHJhbnNpdGlvbmFibGUoMCk7XG4gICAgdGhpcy5fcGVyc3BlY3RpdmUgPSB1bmRlZmluZWQ7XG4gICAgdGhpcy5fbm9kZUNvbnRleHQgPSB7XG4gICAgICAgIGFsbG9jYXRvcjogdGhpcy5fYWxsb2NhdG9yLFxuICAgICAgICB0cmFuc2Zvcm06IFRyYW5zZm9ybS5pZGVudGl0eSxcbiAgICAgICAgb3BhY2l0eTogMSxcbiAgICAgICAgb3JpZ2luOiBfemVyb1plcm8sXG4gICAgICAgIGFsaWduOiBfemVyb1plcm8sXG4gICAgICAgIHNpemU6IHRoaXMuX3NpemVcbiAgICB9O1xuICAgIHRoaXMuX2V2ZW50T3V0cHV0Lm9uKCdyZXNpemUnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuc2V0U2l6ZShfZ2V0RWxlbWVudFNpemUodGhpcy5jb250YWluZXIpKTtcbiAgICB9LmJpbmQodGhpcykpO1xufVxuQ29udGV4dC5wcm90b3R5cGUuZ2V0QWxsb2NhdG9yID0gZnVuY3Rpb24gZ2V0QWxsb2NhdG9yKCkge1xuICAgIHJldHVybiB0aGlzLl9hbGxvY2F0b3I7XG59O1xuQ29udGV4dC5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24gYWRkKG9iaikge1xuICAgIHJldHVybiB0aGlzLl9ub2RlLmFkZChvYmopO1xufTtcbkNvbnRleHQucHJvdG90eXBlLm1pZ3JhdGUgPSBmdW5jdGlvbiBtaWdyYXRlKGNvbnRhaW5lcikge1xuICAgIGlmIChjb250YWluZXIgPT09IHRoaXMuY29udGFpbmVyKVxuICAgICAgICByZXR1cm47XG4gICAgdGhpcy5jb250YWluZXIgPSBjb250YWluZXI7XG4gICAgdGhpcy5fYWxsb2NhdG9yLm1pZ3JhdGUoY29udGFpbmVyKTtcbn07XG5Db250ZXh0LnByb3RvdHlwZS5nZXRTaXplID0gZnVuY3Rpb24gZ2V0U2l6ZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fc2l6ZTtcbn07XG5Db250ZXh0LnByb3RvdHlwZS5zZXRTaXplID0gZnVuY3Rpb24gc2V0U2l6ZShzaXplKSB7XG4gICAgaWYgKCFzaXplKVxuICAgICAgICBzaXplID0gX2dldEVsZW1lbnRTaXplKHRoaXMuY29udGFpbmVyKTtcbiAgICB0aGlzLl9zaXplWzBdID0gc2l6ZVswXTtcbiAgICB0aGlzLl9zaXplWzFdID0gc2l6ZVsxXTtcbn07XG5Db250ZXh0LnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbiB1cGRhdGUoY29udGV4dFBhcmFtZXRlcnMpIHtcbiAgICBpZiAoY29udGV4dFBhcmFtZXRlcnMpIHtcbiAgICAgICAgaWYgKGNvbnRleHRQYXJhbWV0ZXJzLnRyYW5zZm9ybSlcbiAgICAgICAgICAgIHRoaXMuX25vZGVDb250ZXh0LnRyYW5zZm9ybSA9IGNvbnRleHRQYXJhbWV0ZXJzLnRyYW5zZm9ybTtcbiAgICAgICAgaWYgKGNvbnRleHRQYXJhbWV0ZXJzLm9wYWNpdHkpXG4gICAgICAgICAgICB0aGlzLl9ub2RlQ29udGV4dC5vcGFjaXR5ID0gY29udGV4dFBhcmFtZXRlcnMub3BhY2l0eTtcbiAgICAgICAgaWYgKGNvbnRleHRQYXJhbWV0ZXJzLm9yaWdpbilcbiAgICAgICAgICAgIHRoaXMuX25vZGVDb250ZXh0Lm9yaWdpbiA9IGNvbnRleHRQYXJhbWV0ZXJzLm9yaWdpbjtcbiAgICAgICAgaWYgKGNvbnRleHRQYXJhbWV0ZXJzLmFsaWduKVxuICAgICAgICAgICAgdGhpcy5fbm9kZUNvbnRleHQuYWxpZ24gPSBjb250ZXh0UGFyYW1ldGVycy5hbGlnbjtcbiAgICAgICAgaWYgKGNvbnRleHRQYXJhbWV0ZXJzLnNpemUpXG4gICAgICAgICAgICB0aGlzLl9ub2RlQ29udGV4dC5zaXplID0gY29udGV4dFBhcmFtZXRlcnMuc2l6ZTtcbiAgICB9XG4gICAgdmFyIHBlcnNwZWN0aXZlID0gdGhpcy5fcGVyc3BlY3RpdmVTdGF0ZS5nZXQoKTtcbiAgICBpZiAocGVyc3BlY3RpdmUgIT09IHRoaXMuX3BlcnNwZWN0aXZlKSB7XG4gICAgICAgIF9zZXRQZXJzcGVjdGl2ZSh0aGlzLmNvbnRhaW5lciwgcGVyc3BlY3RpdmUpO1xuICAgICAgICB0aGlzLl9wZXJzcGVjdGl2ZSA9IHBlcnNwZWN0aXZlO1xuICAgIH1cbiAgICB0aGlzLl9ub2RlLmNvbW1pdCh0aGlzLl9ub2RlQ29udGV4dCk7XG59O1xuQ29udGV4dC5wcm90b3R5cGUuZ2V0UGVyc3BlY3RpdmUgPSBmdW5jdGlvbiBnZXRQZXJzcGVjdGl2ZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fcGVyc3BlY3RpdmVTdGF0ZS5nZXQoKTtcbn07XG5Db250ZXh0LnByb3RvdHlwZS5zZXRQZXJzcGVjdGl2ZSA9IGZ1bmN0aW9uIHNldFBlcnNwZWN0aXZlKHBlcnNwZWN0aXZlLCB0cmFuc2l0aW9uLCBjYWxsYmFjaykge1xuICAgIHJldHVybiB0aGlzLl9wZXJzcGVjdGl2ZVN0YXRlLnNldChwZXJzcGVjdGl2ZSwgdHJhbnNpdGlvbiwgY2FsbGJhY2spO1xufTtcbkNvbnRleHQucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbiBlbWl0KHR5cGUsIGV2ZW50KSB7XG4gICAgcmV0dXJuIHRoaXMuX2V2ZW50T3V0cHV0LmVtaXQodHlwZSwgZXZlbnQpO1xufTtcbkNvbnRleHQucHJvdG90eXBlLm9uID0gZnVuY3Rpb24gb24odHlwZSwgaGFuZGxlcikge1xuICAgIHJldHVybiB0aGlzLl9ldmVudE91dHB1dC5vbih0eXBlLCBoYW5kbGVyKTtcbn07XG5Db250ZXh0LnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9IGZ1bmN0aW9uIHJlbW92ZUxpc3RlbmVyKHR5cGUsIGhhbmRsZXIpIHtcbiAgICByZXR1cm4gdGhpcy5fZXZlbnRPdXRwdXQucmVtb3ZlTGlzdGVuZXIodHlwZSwgaGFuZGxlcik7XG59O1xuQ29udGV4dC5wcm90b3R5cGUucGlwZSA9IGZ1bmN0aW9uIHBpcGUodGFyZ2V0KSB7XG4gICAgcmV0dXJuIHRoaXMuX2V2ZW50T3V0cHV0LnBpcGUodGFyZ2V0KTtcbn07XG5Db250ZXh0LnByb3RvdHlwZS51bnBpcGUgPSBmdW5jdGlvbiB1bnBpcGUodGFyZ2V0KSB7XG4gICAgcmV0dXJuIHRoaXMuX2V2ZW50T3V0cHV0LnVucGlwZSh0YXJnZXQpO1xufTtcbm1vZHVsZS5leHBvcnRzID0gQ29udGV4dDsiLCJmdW5jdGlvbiBFbGVtZW50QWxsb2NhdG9yKGNvbnRhaW5lcikge1xuICAgIGlmICghY29udGFpbmVyKVxuICAgICAgICBjb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XG4gICAgdGhpcy5jb250YWluZXIgPSBjb250YWluZXI7XG4gICAgdGhpcy5kZXRhY2hlZE5vZGVzID0ge307XG4gICAgdGhpcy5ub2RlQ291bnQgPSAwO1xufVxuRWxlbWVudEFsbG9jYXRvci5wcm90b3R5cGUubWlncmF0ZSA9IGZ1bmN0aW9uIG1pZ3JhdGUoY29udGFpbmVyKSB7XG4gICAgdmFyIG9sZENvbnRhaW5lciA9IHRoaXMuY29udGFpbmVyO1xuICAgIGlmIChjb250YWluZXIgPT09IG9sZENvbnRhaW5lcilcbiAgICAgICAgcmV0dXJuO1xuICAgIGlmIChvbGRDb250YWluZXIgaW5zdGFuY2VvZiBEb2N1bWVudEZyYWdtZW50KSB7XG4gICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChvbGRDb250YWluZXIpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHdoaWxlIChvbGRDb250YWluZXIuaGFzQ2hpbGROb2RlcygpKSB7XG4gICAgICAgICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQob2xkQ29udGFpbmVyLnJlbW92ZUNoaWxkKG9sZENvbnRhaW5lci5maXJzdENoaWxkKSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5jb250YWluZXIgPSBjb250YWluZXI7XG59O1xuRWxlbWVudEFsbG9jYXRvci5wcm90b3R5cGUuYWxsb2NhdGUgPSBmdW5jdGlvbiBhbGxvY2F0ZSh0eXBlKSB7XG4gICAgdHlwZSA9IHR5cGUudG9Mb3dlckNhc2UoKTtcbiAgICBpZiAoISh0eXBlIGluIHRoaXMuZGV0YWNoZWROb2RlcykpXG4gICAgICAgIHRoaXMuZGV0YWNoZWROb2Rlc1t0eXBlXSA9IFtdO1xuICAgIHZhciBub2RlU3RvcmUgPSB0aGlzLmRldGFjaGVkTm9kZXNbdHlwZV07XG4gICAgdmFyIHJlc3VsdDtcbiAgICBpZiAobm9kZVN0b3JlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgcmVzdWx0ID0gbm9kZVN0b3JlLnBvcCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc3VsdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQodHlwZSk7XG4gICAgICAgIHRoaXMuY29udGFpbmVyLmFwcGVuZENoaWxkKHJlc3VsdCk7XG4gICAgfVxuICAgIHRoaXMubm9kZUNvdW50Kys7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn07XG5FbGVtZW50QWxsb2NhdG9yLnByb3RvdHlwZS5kZWFsbG9jYXRlID0gZnVuY3Rpb24gZGVhbGxvY2F0ZShlbGVtZW50KSB7XG4gICAgdmFyIG5vZGVUeXBlID0gZWxlbWVudC5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpO1xuICAgIHZhciBub2RlU3RvcmUgPSB0aGlzLmRldGFjaGVkTm9kZXNbbm9kZVR5cGVdO1xuICAgIG5vZGVTdG9yZS5wdXNoKGVsZW1lbnQpO1xuICAgIHRoaXMubm9kZUNvdW50LS07XG59O1xuRWxlbWVudEFsbG9jYXRvci5wcm90b3R5cGUuZ2V0Tm9kZUNvdW50ID0gZnVuY3Rpb24gZ2V0Tm9kZUNvdW50KCkge1xuICAgIHJldHVybiB0aGlzLm5vZGVDb3VudDtcbn07XG5tb2R1bGUuZXhwb3J0cyA9IEVsZW1lbnRBbGxvY2F0b3I7IiwidmFyIEVudGl0eSA9IHJlcXVpcmUoJy4vRW50aXR5Jyk7XG52YXIgRXZlbnRIYW5kbGVyID0gcmVxdWlyZSgnLi9FdmVudEhhbmRsZXInKTtcbnZhciBUcmFuc2Zvcm0gPSByZXF1aXJlKCcuL1RyYW5zZm9ybScpO1xudmFyIHVzZVByZWZpeCA9ICEoJ3RyYW5zZm9ybScgaW4gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnN0eWxlKTtcbnZhciBkZXZpY2VQaXhlbFJhdGlvID0gd2luZG93LmRldmljZVBpeGVsUmF0aW8gfHwgMTtcbmZ1bmN0aW9uIEVsZW1lbnRPdXRwdXQoZWxlbWVudCkge1xuICAgIHRoaXMuX21hdHJpeCA9IG51bGw7XG4gICAgdGhpcy5fb3BhY2l0eSA9IDE7XG4gICAgdGhpcy5fb3JpZ2luID0gbnVsbDtcbiAgICB0aGlzLl9zaXplID0gbnVsbDtcbiAgICB0aGlzLl9ldmVudE91dHB1dCA9IG5ldyBFdmVudEhhbmRsZXIoKTtcbiAgICB0aGlzLl9ldmVudE91dHB1dC5iaW5kVGhpcyh0aGlzKTtcbiAgICB0aGlzLmV2ZW50Rm9yd2FyZGVyID0gZnVuY3Rpb24gZXZlbnRGb3J3YXJkZXIoZXZlbnQpIHtcbiAgICAgICAgdGhpcy5fZXZlbnRPdXRwdXQuZW1pdChldmVudC50eXBlLCBldmVudCk7XG4gICAgfS5iaW5kKHRoaXMpO1xuICAgIHRoaXMuaWQgPSBFbnRpdHkucmVnaXN0ZXIodGhpcyk7XG4gICAgdGhpcy5fZWxlbWVudCA9IG51bGw7XG4gICAgdGhpcy5fc2l6ZURpcnR5ID0gZmFsc2U7XG4gICAgdGhpcy5fb3JpZ2luRGlydHkgPSBmYWxzZTtcbiAgICB0aGlzLl90cmFuc2Zvcm1EaXJ0eSA9IGZhbHNlO1xuICAgIHRoaXMuX2ludmlzaWJsZSA9IGZhbHNlO1xuICAgIGlmIChlbGVtZW50KVxuICAgICAgICB0aGlzLmF0dGFjaChlbGVtZW50KTtcbn1cbkVsZW1lbnRPdXRwdXQucHJvdG90eXBlLm9uID0gZnVuY3Rpb24gb24odHlwZSwgZm4pIHtcbiAgICBpZiAodGhpcy5fZWxlbWVudClcbiAgICAgICAgdGhpcy5fZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKHR5cGUsIHRoaXMuZXZlbnRGb3J3YXJkZXIpO1xuICAgIHRoaXMuX2V2ZW50T3V0cHV0Lm9uKHR5cGUsIGZuKTtcbn07XG5FbGVtZW50T3V0cHV0LnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9IGZ1bmN0aW9uIHJlbW92ZUxpc3RlbmVyKHR5cGUsIGZuKSB7XG4gICAgdGhpcy5fZXZlbnRPdXRwdXQucmVtb3ZlTGlzdGVuZXIodHlwZSwgZm4pO1xufTtcbkVsZW1lbnRPdXRwdXQucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbiBlbWl0KHR5cGUsIGV2ZW50KSB7XG4gICAgaWYgKGV2ZW50ICYmICFldmVudC5vcmlnaW4pXG4gICAgICAgIGV2ZW50Lm9yaWdpbiA9IHRoaXM7XG4gICAgdmFyIGhhbmRsZWQgPSB0aGlzLl9ldmVudE91dHB1dC5lbWl0KHR5cGUsIGV2ZW50KTtcbiAgICBpZiAoaGFuZGxlZCAmJiBldmVudCAmJiBldmVudC5zdG9wUHJvcGFnYXRpb24pXG4gICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgIHJldHVybiBoYW5kbGVkO1xufTtcbkVsZW1lbnRPdXRwdXQucHJvdG90eXBlLnBpcGUgPSBmdW5jdGlvbiBwaXBlKHRhcmdldCkge1xuICAgIHJldHVybiB0aGlzLl9ldmVudE91dHB1dC5waXBlKHRhcmdldCk7XG59O1xuRWxlbWVudE91dHB1dC5wcm90b3R5cGUudW5waXBlID0gZnVuY3Rpb24gdW5waXBlKHRhcmdldCkge1xuICAgIHJldHVybiB0aGlzLl9ldmVudE91dHB1dC51bnBpcGUodGFyZ2V0KTtcbn07XG5FbGVtZW50T3V0cHV0LnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgcmV0dXJuIHRoaXMuaWQ7XG59O1xuZnVuY3Rpb24gX2FkZEV2ZW50TGlzdGVuZXJzKHRhcmdldCkge1xuICAgIGZvciAodmFyIGkgaW4gdGhpcy5fZXZlbnRPdXRwdXQubGlzdGVuZXJzKSB7XG4gICAgICAgIHRhcmdldC5hZGRFdmVudExpc3RlbmVyKGksIHRoaXMuZXZlbnRGb3J3YXJkZXIpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIF9yZW1vdmVFdmVudExpc3RlbmVycyh0YXJnZXQpIHtcbiAgICBmb3IgKHZhciBpIGluIHRoaXMuX2V2ZW50T3V0cHV0Lmxpc3RlbmVycykge1xuICAgICAgICB0YXJnZXQucmVtb3ZlRXZlbnRMaXN0ZW5lcihpLCB0aGlzLmV2ZW50Rm9yd2FyZGVyKTtcbiAgICB9XG59XG5mdW5jdGlvbiBfZm9ybWF0Q1NTVHJhbnNmb3JtKG0pIHtcbiAgICB2YXIgcmVzdWx0ID0gJ21hdHJpeDNkKCc7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCAxNTsgaSsrKSB7XG4gICAgICAgIHJlc3VsdCArPSBtW2ldIDwgMC4wMDAwMDEgJiYgbVtpXSA+IC0wLjAwMDAwMSA/ICcwLCcgOiBtW2ldICsgJywnO1xuICAgIH1cbiAgICByZXN1bHQgKz0gbVsxNV0gKyAnKSc7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cbnZhciBfc2V0TWF0cml4O1xuaWYgKG5hdmlnYXRvci51c2VyQWdlbnQudG9Mb3dlckNhc2UoKS5pbmRleE9mKCdmaXJlZm94JykgPiAtMSkge1xuICAgIF9zZXRNYXRyaXggPSBmdW5jdGlvbiAoZWxlbWVudCwgbWF0cml4KSB7XG4gICAgICAgIGVsZW1lbnQuc3R5bGUuekluZGV4ID0gbWF0cml4WzE0XSAqIDEwMDAwMDAgfCAwO1xuICAgICAgICBlbGVtZW50LnN0eWxlLnRyYW5zZm9ybSA9IF9mb3JtYXRDU1NUcmFuc2Zvcm0obWF0cml4KTtcbiAgICB9O1xufSBlbHNlIGlmICh1c2VQcmVmaXgpIHtcbiAgICBfc2V0TWF0cml4ID0gZnVuY3Rpb24gKGVsZW1lbnQsIG1hdHJpeCkge1xuICAgICAgICBlbGVtZW50LnN0eWxlLndlYmtpdFRyYW5zZm9ybSA9IF9mb3JtYXRDU1NUcmFuc2Zvcm0obWF0cml4KTtcbiAgICB9O1xufSBlbHNlIHtcbiAgICBfc2V0TWF0cml4ID0gZnVuY3Rpb24gKGVsZW1lbnQsIG1hdHJpeCkge1xuICAgICAgICBlbGVtZW50LnN0eWxlLnRyYW5zZm9ybSA9IF9mb3JtYXRDU1NUcmFuc2Zvcm0obWF0cml4KTtcbiAgICB9O1xufVxuZnVuY3Rpb24gX2Zvcm1hdENTU09yaWdpbihvcmlnaW4pIHtcbiAgICByZXR1cm4gMTAwICogb3JpZ2luWzBdICsgJyUgJyArIDEwMCAqIG9yaWdpblsxXSArICclJztcbn1cbnZhciBfc2V0T3JpZ2luID0gdXNlUHJlZml4ID8gZnVuY3Rpb24gKGVsZW1lbnQsIG9yaWdpbikge1xuICAgICAgICBlbGVtZW50LnN0eWxlLndlYmtpdFRyYW5zZm9ybU9yaWdpbiA9IF9mb3JtYXRDU1NPcmlnaW4ob3JpZ2luKTtcbiAgICB9IDogZnVuY3Rpb24gKGVsZW1lbnQsIG9yaWdpbikge1xuICAgICAgICBlbGVtZW50LnN0eWxlLnRyYW5zZm9ybU9yaWdpbiA9IF9mb3JtYXRDU1NPcmlnaW4ob3JpZ2luKTtcbiAgICB9O1xudmFyIF9zZXRJbnZpc2libGUgPSB1c2VQcmVmaXggPyBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgICAgICBlbGVtZW50LnN0eWxlLndlYmtpdFRyYW5zZm9ybSA9ICdzY2FsZTNkKDAuMDAwMSwwLjAwMDEsMC4wMDAxKSc7XG4gICAgICAgIGVsZW1lbnQuc3R5bGUub3BhY2l0eSA9IDA7XG4gICAgfSA6IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgICAgIGVsZW1lbnQuc3R5bGUudHJhbnNmb3JtID0gJ3NjYWxlM2QoMC4wMDAxLDAuMDAwMSwwLjAwMDEpJztcbiAgICAgICAgZWxlbWVudC5zdHlsZS5vcGFjaXR5ID0gMDtcbiAgICB9O1xuZnVuY3Rpb24gX3h5Tm90RXF1YWxzKGEsIGIpIHtcbiAgICByZXR1cm4gYSAmJiBiID8gYVswXSAhPT0gYlswXSB8fCBhWzFdICE9PSBiWzFdIDogYSAhPT0gYjtcbn1cbkVsZW1lbnRPdXRwdXQucHJvdG90eXBlLmNvbW1pdCA9IGZ1bmN0aW9uIGNvbW1pdChjb250ZXh0KSB7XG4gICAgdmFyIHRhcmdldCA9IHRoaXMuX2VsZW1lbnQ7XG4gICAgaWYgKCF0YXJnZXQpXG4gICAgICAgIHJldHVybjtcbiAgICB2YXIgbWF0cml4ID0gY29udGV4dC50cmFuc2Zvcm07XG4gICAgdmFyIG9wYWNpdHkgPSBjb250ZXh0Lm9wYWNpdHk7XG4gICAgdmFyIG9yaWdpbiA9IGNvbnRleHQub3JpZ2luO1xuICAgIHZhciBzaXplID0gY29udGV4dC5zaXplO1xuICAgIGlmICghbWF0cml4ICYmIHRoaXMuX21hdHJpeCkge1xuICAgICAgICB0aGlzLl9tYXRyaXggPSBudWxsO1xuICAgICAgICB0aGlzLl9vcGFjaXR5ID0gMDtcbiAgICAgICAgX3NldEludmlzaWJsZSh0YXJnZXQpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChfeHlOb3RFcXVhbHModGhpcy5fb3JpZ2luLCBvcmlnaW4pKVxuICAgICAgICB0aGlzLl9vcmlnaW5EaXJ0eSA9IHRydWU7XG4gICAgaWYgKFRyYW5zZm9ybS5ub3RFcXVhbHModGhpcy5fbWF0cml4LCBtYXRyaXgpKVxuICAgICAgICB0aGlzLl90cmFuc2Zvcm1EaXJ0eSA9IHRydWU7XG4gICAgaWYgKHRoaXMuX2ludmlzaWJsZSkge1xuICAgICAgICB0aGlzLl9pbnZpc2libGUgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5fZWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gJyc7XG4gICAgfVxuICAgIGlmICh0aGlzLl9vcGFjaXR5ICE9PSBvcGFjaXR5KSB7XG4gICAgICAgIHRoaXMuX29wYWNpdHkgPSBvcGFjaXR5O1xuICAgICAgICB0YXJnZXQuc3R5bGUub3BhY2l0eSA9IG9wYWNpdHkgPj0gMSA/ICcwLjk5OTk5OScgOiBvcGFjaXR5O1xuICAgIH1cbiAgICBpZiAodGhpcy5fdHJhbnNmb3JtRGlydHkgfHwgdGhpcy5fb3JpZ2luRGlydHkgfHwgdGhpcy5fc2l6ZURpcnR5KSB7XG4gICAgICAgIGlmICh0aGlzLl9zaXplRGlydHkpXG4gICAgICAgICAgICB0aGlzLl9zaXplRGlydHkgPSBmYWxzZTtcbiAgICAgICAgaWYgKHRoaXMuX29yaWdpbkRpcnR5KSB7XG4gICAgICAgICAgICBpZiAob3JpZ2luKSB7XG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLl9vcmlnaW4pXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX29yaWdpbiA9IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAwXG4gICAgICAgICAgICAgICAgICAgIF07XG4gICAgICAgICAgICAgICAgdGhpcy5fb3JpZ2luWzBdID0gb3JpZ2luWzBdO1xuICAgICAgICAgICAgICAgIHRoaXMuX29yaWdpblsxXSA9IG9yaWdpblsxXTtcbiAgICAgICAgICAgIH0gZWxzZVxuICAgICAgICAgICAgICAgIHRoaXMuX29yaWdpbiA9IG51bGw7XG4gICAgICAgICAgICBfc2V0T3JpZ2luKHRhcmdldCwgdGhpcy5fb3JpZ2luKTtcbiAgICAgICAgICAgIHRoaXMuX29yaWdpbkRpcnR5ID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFtYXRyaXgpXG4gICAgICAgICAgICBtYXRyaXggPSBUcmFuc2Zvcm0uaWRlbnRpdHk7XG4gICAgICAgIHRoaXMuX21hdHJpeCA9IG1hdHJpeDtcbiAgICAgICAgdmFyIGFhTWF0cml4ID0gdGhpcy5fc2l6ZSA/IFRyYW5zZm9ybS50aGVuTW92ZShtYXRyaXgsIFtcbiAgICAgICAgICAgICAgICAtdGhpcy5fc2l6ZVswXSAqIG9yaWdpblswXSxcbiAgICAgICAgICAgICAgICAtdGhpcy5fc2l6ZVsxXSAqIG9yaWdpblsxXSxcbiAgICAgICAgICAgICAgICAwXG4gICAgICAgICAgICBdKSA6IG1hdHJpeDtcbiAgICAgICAgX3NldE1hdHJpeCh0YXJnZXQsIGFhTWF0cml4KTtcbiAgICAgICAgdGhpcy5fdHJhbnNmb3JtRGlydHkgPSBmYWxzZTtcbiAgICB9XG59O1xuRWxlbWVudE91dHB1dC5wcm90b3R5cGUuY2xlYW51cCA9IGZ1bmN0aW9uIGNsZWFudXAoKSB7XG4gICAgaWYgKHRoaXMuX2VsZW1lbnQpIHtcbiAgICAgICAgdGhpcy5faW52aXNpYmxlID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5fZWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgIH1cbn07XG5FbGVtZW50T3V0cHV0LnByb3RvdHlwZS5hdHRhY2ggPSBmdW5jdGlvbiBhdHRhY2godGFyZ2V0KSB7XG4gICAgdGhpcy5fZWxlbWVudCA9IHRhcmdldDtcbiAgICBfYWRkRXZlbnRMaXN0ZW5lcnMuY2FsbCh0aGlzLCB0YXJnZXQpO1xufTtcbkVsZW1lbnRPdXRwdXQucHJvdG90eXBlLmRldGFjaCA9IGZ1bmN0aW9uIGRldGFjaCgpIHtcbiAgICB2YXIgdGFyZ2V0ID0gdGhpcy5fZWxlbWVudDtcbiAgICBpZiAodGFyZ2V0KSB7XG4gICAgICAgIF9yZW1vdmVFdmVudExpc3RlbmVycy5jYWxsKHRoaXMsIHRhcmdldCk7XG4gICAgICAgIGlmICh0aGlzLl9pbnZpc2libGUpIHtcbiAgICAgICAgICAgIHRoaXMuX2ludmlzaWJsZSA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5fZWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gJyc7XG4gICAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5fZWxlbWVudCA9IG51bGw7XG4gICAgcmV0dXJuIHRhcmdldDtcbn07XG5tb2R1bGUuZXhwb3J0cyA9IEVsZW1lbnRPdXRwdXQ7IiwidmFyIENvbnRleHQgPSByZXF1aXJlKCcuL0NvbnRleHQnKTtcbnZhciBFdmVudEhhbmRsZXIgPSByZXF1aXJlKCcuL0V2ZW50SGFuZGxlcicpO1xudmFyIE9wdGlvbnNNYW5hZ2VyID0gcmVxdWlyZSgnLi9PcHRpb25zTWFuYWdlcicpO1xudmFyIEVuZ2luZSA9IHt9O1xudmFyIGNvbnRleHRzID0gW107XG52YXIgbmV4dFRpY2tRdWV1ZSA9IFtdO1xudmFyIGRlZmVyUXVldWUgPSBbXTtcbnZhciBsYXN0VGltZSA9IERhdGUubm93KCk7XG52YXIgZnJhbWVUaW1lO1xudmFyIGZyYW1lVGltZUxpbWl0O1xudmFyIGxvb3BFbmFibGVkID0gdHJ1ZTtcbnZhciBldmVudEZvcndhcmRlcnMgPSB7fTtcbnZhciBldmVudEhhbmRsZXIgPSBuZXcgRXZlbnRIYW5kbGVyKCk7XG52YXIgb3B0aW9ucyA9IHtcbiAgICAgICAgY29udGFpbmVyVHlwZTogJ2RpdicsXG4gICAgICAgIGNvbnRhaW5lckNsYXNzOiAnZmFtb3VzLWNvbnRhaW5lcicsXG4gICAgICAgIGZwc0NhcDogdW5kZWZpbmVkLFxuICAgICAgICBydW5Mb29wOiB0cnVlLFxuICAgICAgICBhcHBNb2RlOiB0cnVlXG4gICAgfTtcbnZhciBvcHRpb25zTWFuYWdlciA9IG5ldyBPcHRpb25zTWFuYWdlcihvcHRpb25zKTtcbnZhciBNQVhfREVGRVJfRlJBTUVfVElNRSA9IDEwO1xuRW5naW5lLnN0ZXAgPSBmdW5jdGlvbiBzdGVwKCkge1xuICAgIHZhciBjdXJyZW50VGltZSA9IERhdGUubm93KCk7XG4gICAgaWYgKGZyYW1lVGltZUxpbWl0ICYmIGN1cnJlbnRUaW1lIC0gbGFzdFRpbWUgPCBmcmFtZVRpbWVMaW1pdClcbiAgICAgICAgcmV0dXJuO1xuICAgIHZhciBpID0gMDtcbiAgICBmcmFtZVRpbWUgPSBjdXJyZW50VGltZSAtIGxhc3RUaW1lO1xuICAgIGxhc3RUaW1lID0gY3VycmVudFRpbWU7XG4gICAgZXZlbnRIYW5kbGVyLmVtaXQoJ3ByZXJlbmRlcicpO1xuICAgIGZvciAoaSA9IDA7IGkgPCBuZXh0VGlja1F1ZXVlLmxlbmd0aDsgaSsrKVxuICAgICAgICBuZXh0VGlja1F1ZXVlW2ldLmNhbGwodGhpcyk7XG4gICAgbmV4dFRpY2tRdWV1ZS5zcGxpY2UoMCk7XG4gICAgd2hpbGUgKGRlZmVyUXVldWUubGVuZ3RoICYmIERhdGUubm93KCkgLSBjdXJyZW50VGltZSA8IE1BWF9ERUZFUl9GUkFNRV9USU1FKSB7XG4gICAgICAgIGRlZmVyUXVldWUuc2hpZnQoKS5jYWxsKHRoaXMpO1xuICAgIH1cbiAgICBmb3IgKGkgPSAwOyBpIDwgY29udGV4dHMubGVuZ3RoOyBpKyspXG4gICAgICAgIGNvbnRleHRzW2ldLnVwZGF0ZSgpO1xuICAgIGV2ZW50SGFuZGxlci5lbWl0KCdwb3N0cmVuZGVyJyk7XG59O1xuZnVuY3Rpb24gbG9vcCgpIHtcbiAgICBpZiAob3B0aW9ucy5ydW5Mb29wKSB7XG4gICAgICAgIEVuZ2luZS5zdGVwKCk7XG4gICAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUobG9vcCk7XG4gICAgfSBlbHNlXG4gICAgICAgIGxvb3BFbmFibGVkID0gZmFsc2U7XG59XG53aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGxvb3ApO1xuZnVuY3Rpb24gaGFuZGxlUmVzaXplKGV2ZW50KSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjb250ZXh0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb250ZXh0c1tpXS5lbWl0KCdyZXNpemUnKTtcbiAgICB9XG4gICAgZXZlbnRIYW5kbGVyLmVtaXQoJ3Jlc2l6ZScpO1xufVxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIGhhbmRsZVJlc2l6ZSwgZmFsc2UpO1xuaGFuZGxlUmVzaXplKCk7XG5mdW5jdGlvbiBpbml0aWFsaXplKCkge1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICB9LCB0cnVlKTtcbiAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQoJ2ZhbW91cy1yb290Jyk7XG4gICAgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2ZhbW91cy1yb290Jyk7XG59XG52YXIgaW5pdGlhbGl6ZWQgPSBmYWxzZTtcbkVuZ2luZS5waXBlID0gZnVuY3Rpb24gcGlwZSh0YXJnZXQpIHtcbiAgICBpZiAodGFyZ2V0LnN1YnNjcmliZSBpbnN0YW5jZW9mIEZ1bmN0aW9uKVxuICAgICAgICByZXR1cm4gdGFyZ2V0LnN1YnNjcmliZShFbmdpbmUpO1xuICAgIGVsc2VcbiAgICAgICAgcmV0dXJuIGV2ZW50SGFuZGxlci5waXBlKHRhcmdldCk7XG59O1xuRW5naW5lLnVucGlwZSA9IGZ1bmN0aW9uIHVucGlwZSh0YXJnZXQpIHtcbiAgICBpZiAodGFyZ2V0LnVuc3Vic2NyaWJlIGluc3RhbmNlb2YgRnVuY3Rpb24pXG4gICAgICAgIHJldHVybiB0YXJnZXQudW5zdWJzY3JpYmUoRW5naW5lKTtcbiAgICBlbHNlXG4gICAgICAgIHJldHVybiBldmVudEhhbmRsZXIudW5waXBlKHRhcmdldCk7XG59O1xuRW5naW5lLm9uID0gZnVuY3Rpb24gb24odHlwZSwgaGFuZGxlcikge1xuICAgIGlmICghKHR5cGUgaW4gZXZlbnRGb3J3YXJkZXJzKSkge1xuICAgICAgICBldmVudEZvcndhcmRlcnNbdHlwZV0gPSBldmVudEhhbmRsZXIuZW1pdC5iaW5kKGV2ZW50SGFuZGxlciwgdHlwZSk7XG4gICAgICAgIGlmIChkb2N1bWVudC5ib2R5KSB7XG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIodHlwZSwgZXZlbnRGb3J3YXJkZXJzW3R5cGVdKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIEVuZ2luZS5uZXh0VGljayhmdW5jdGlvbiAodHlwZSwgZm9yd2FyZGVyKSB7XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKHR5cGUsIGZvcndhcmRlcik7XG4gICAgICAgICAgICB9LmJpbmQodGhpcywgdHlwZSwgZXZlbnRGb3J3YXJkZXJzW3R5cGVdKSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGV2ZW50SGFuZGxlci5vbih0eXBlLCBoYW5kbGVyKTtcbn07XG5FbmdpbmUuZW1pdCA9IGZ1bmN0aW9uIGVtaXQodHlwZSwgZXZlbnQpIHtcbiAgICByZXR1cm4gZXZlbnRIYW5kbGVyLmVtaXQodHlwZSwgZXZlbnQpO1xufTtcbkVuZ2luZS5yZW1vdmVMaXN0ZW5lciA9IGZ1bmN0aW9uIHJlbW92ZUxpc3RlbmVyKHR5cGUsIGhhbmRsZXIpIHtcbiAgICByZXR1cm4gZXZlbnRIYW5kbGVyLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGhhbmRsZXIpO1xufTtcbkVuZ2luZS5nZXRGUFMgPSBmdW5jdGlvbiBnZXRGUFMoKSB7XG4gICAgcmV0dXJuIDEwMDAgLyBmcmFtZVRpbWU7XG59O1xuRW5naW5lLnNldEZQU0NhcCA9IGZ1bmN0aW9uIHNldEZQU0NhcChmcHMpIHtcbiAgICBmcmFtZVRpbWVMaW1pdCA9IE1hdGguZmxvb3IoMTAwMCAvIGZwcyk7XG59O1xuRW5naW5lLmdldE9wdGlvbnMgPSBmdW5jdGlvbiBnZXRPcHRpb25zKGtleSkge1xuICAgIHJldHVybiBvcHRpb25zTWFuYWdlci5nZXRPcHRpb25zKGtleSk7XG59O1xuRW5naW5lLnNldE9wdGlvbnMgPSBmdW5jdGlvbiBzZXRPcHRpb25zKG9wdGlvbnMpIHtcbiAgICByZXR1cm4gb3B0aW9uc01hbmFnZXIuc2V0T3B0aW9ucy5hcHBseShvcHRpb25zTWFuYWdlciwgYXJndW1lbnRzKTtcbn07XG5FbmdpbmUuY3JlYXRlQ29udGV4dCA9IGZ1bmN0aW9uIGNyZWF0ZUNvbnRleHQoZWwpIHtcbiAgICBpZiAoIWluaXRpYWxpemVkICYmIG9wdGlvbnMuYXBwTW9kZSlcbiAgICAgICAgRW5naW5lLm5leHRUaWNrKGluaXRpYWxpemUpO1xuICAgIHZhciBuZWVkTW91bnRDb250YWluZXIgPSBmYWxzZTtcbiAgICBpZiAoIWVsKSB7XG4gICAgICAgIGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChvcHRpb25zLmNvbnRhaW5lclR5cGUpO1xuICAgICAgICBlbC5jbGFzc0xpc3QuYWRkKG9wdGlvbnMuY29udGFpbmVyQ2xhc3MpO1xuICAgICAgICBuZWVkTW91bnRDb250YWluZXIgPSB0cnVlO1xuICAgIH1cbiAgICB2YXIgY29udGV4dCA9IG5ldyBDb250ZXh0KGVsKTtcbiAgICBFbmdpbmUucmVnaXN0ZXJDb250ZXh0KGNvbnRleHQpO1xuICAgIGlmIChuZWVkTW91bnRDb250YWluZXIpIHtcbiAgICAgICAgRW5naW5lLm5leHRUaWNrKGZ1bmN0aW9uIChjb250ZXh0LCBlbCkge1xuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChlbCk7XG4gICAgICAgICAgICBjb250ZXh0LmVtaXQoJ3Jlc2l6ZScpO1xuICAgICAgICB9LmJpbmQodGhpcywgY29udGV4dCwgZWwpKTtcbiAgICB9XG4gICAgcmV0dXJuIGNvbnRleHQ7XG59O1xuRW5naW5lLnJlZ2lzdGVyQ29udGV4dCA9IGZ1bmN0aW9uIHJlZ2lzdGVyQ29udGV4dChjb250ZXh0KSB7XG4gICAgY29udGV4dHMucHVzaChjb250ZXh0KTtcbiAgICByZXR1cm4gY29udGV4dDtcbn07XG5FbmdpbmUuZ2V0Q29udGV4dHMgPSBmdW5jdGlvbiBnZXRDb250ZXh0cygpIHtcbiAgICByZXR1cm4gY29udGV4dHM7XG59O1xuRW5naW5lLmRlcmVnaXN0ZXJDb250ZXh0ID0gZnVuY3Rpb24gZGVyZWdpc3RlckNvbnRleHQoY29udGV4dCkge1xuICAgIHZhciBpID0gY29udGV4dHMuaW5kZXhPZihjb250ZXh0KTtcbiAgICBpZiAoaSA+PSAwKVxuICAgICAgICBjb250ZXh0cy5zcGxpY2UoaSwgMSk7XG59O1xuRW5naW5lLm5leHRUaWNrID0gZnVuY3Rpb24gbmV4dFRpY2soZm4pIHtcbiAgICBuZXh0VGlja1F1ZXVlLnB1c2goZm4pO1xufTtcbkVuZ2luZS5kZWZlciA9IGZ1bmN0aW9uIGRlZmVyKGZuKSB7XG4gICAgZGVmZXJRdWV1ZS5wdXNoKGZuKTtcbn07XG5vcHRpb25zTWFuYWdlci5vbignY2hhbmdlJywgZnVuY3Rpb24gKGRhdGEpIHtcbiAgICBpZiAoZGF0YS5pZCA9PT0gJ2Zwc0NhcCcpXG4gICAgICAgIEVuZ2luZS5zZXRGUFNDYXAoZGF0YS52YWx1ZSk7XG4gICAgZWxzZSBpZiAoZGF0YS5pZCA9PT0gJ3J1bkxvb3AnKSB7XG4gICAgICAgIGlmICghbG9vcEVuYWJsZWQgJiYgZGF0YS52YWx1ZSkge1xuICAgICAgICAgICAgbG9vcEVuYWJsZWQgPSB0cnVlO1xuICAgICAgICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShsb29wKTtcbiAgICAgICAgfVxuICAgIH1cbn0pO1xubW9kdWxlLmV4cG9ydHMgPSBFbmdpbmU7IiwidmFyIGVudGl0aWVzID0gW107XG5mdW5jdGlvbiBnZXQoaWQpIHtcbiAgICByZXR1cm4gZW50aXRpZXNbaWRdO1xufVxuZnVuY3Rpb24gc2V0KGlkLCBlbnRpdHkpIHtcbiAgICBlbnRpdGllc1tpZF0gPSBlbnRpdHk7XG59XG5mdW5jdGlvbiByZWdpc3RlcihlbnRpdHkpIHtcbiAgICB2YXIgaWQgPSBlbnRpdGllcy5sZW5ndGg7XG4gICAgc2V0KGlkLCBlbnRpdHkpO1xuICAgIHJldHVybiBpZDtcbn1cbmZ1bmN0aW9uIHVucmVnaXN0ZXIoaWQpIHtcbiAgICBzZXQoaWQsIG51bGwpO1xufVxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgcmVnaXN0ZXI6IHJlZ2lzdGVyLFxuICAgIHVucmVnaXN0ZXI6IHVucmVnaXN0ZXIsXG4gICAgZ2V0OiBnZXQsXG4gICAgc2V0OiBzZXRcbn07IiwiZnVuY3Rpb24gRXZlbnRFbWl0dGVyKCkge1xuICAgIHRoaXMubGlzdGVuZXJzID0ge307XG4gICAgdGhpcy5fb3duZXIgPSB0aGlzO1xufVxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24gZW1pdCh0eXBlLCBldmVudCkge1xuICAgIHZhciBoYW5kbGVycyA9IHRoaXMubGlzdGVuZXJzW3R5cGVdO1xuICAgIGlmIChoYW5kbGVycykge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGhhbmRsZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBoYW5kbGVyc1tpXS5jYWxsKHRoaXMuX293bmVyLCBldmVudCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbiA9IGZ1bmN0aW9uIG9uKHR5cGUsIGhhbmRsZXIpIHtcbiAgICBpZiAoISh0eXBlIGluIHRoaXMubGlzdGVuZXJzKSlcbiAgICAgICAgdGhpcy5saXN0ZW5lcnNbdHlwZV0gPSBbXTtcbiAgICB2YXIgaW5kZXggPSB0aGlzLmxpc3RlbmVyc1t0eXBlXS5pbmRleE9mKGhhbmRsZXIpO1xuICAgIGlmIChpbmRleCA8IDApXG4gICAgICAgIHRoaXMubGlzdGVuZXJzW3R5cGVdLnB1c2goaGFuZGxlcik7XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lciA9IEV2ZW50RW1pdHRlci5wcm90b3R5cGUub247XG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyID0gZnVuY3Rpb24gcmVtb3ZlTGlzdGVuZXIodHlwZSwgaGFuZGxlcikge1xuICAgIHZhciBsaXN0ZW5lciA9IHRoaXMubGlzdGVuZXJzW3R5cGVdO1xuICAgIGlmIChsaXN0ZW5lciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHZhciBpbmRleCA9IGxpc3RlbmVyLmluZGV4T2YoaGFuZGxlcik7XG4gICAgICAgIGlmIChpbmRleCA+PSAwKVxuICAgICAgICAgICAgbGlzdGVuZXIuc3BsaWNlKGluZGV4LCAxKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5iaW5kVGhpcyA9IGZ1bmN0aW9uIGJpbmRUaGlzKG93bmVyKSB7XG4gICAgdGhpcy5fb3duZXIgPSBvd25lcjtcbn07XG5tb2R1bGUuZXhwb3J0cyA9IEV2ZW50RW1pdHRlcjsiLCJ2YXIgRXZlbnRFbWl0dGVyID0gcmVxdWlyZSgnLi9FdmVudEVtaXR0ZXInKTtcbmZ1bmN0aW9uIEV2ZW50SGFuZGxlcigpIHtcbiAgICBFdmVudEVtaXR0ZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB0aGlzLmRvd25zdHJlYW0gPSBbXTtcbiAgICB0aGlzLmRvd25zdHJlYW1GbiA9IFtdO1xuICAgIHRoaXMudXBzdHJlYW0gPSBbXTtcbiAgICB0aGlzLnVwc3RyZWFtTGlzdGVuZXJzID0ge307XG59XG5FdmVudEhhbmRsZXIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShFdmVudEVtaXR0ZXIucHJvdG90eXBlKTtcbkV2ZW50SGFuZGxlci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBFdmVudEhhbmRsZXI7XG5FdmVudEhhbmRsZXIuc2V0SW5wdXRIYW5kbGVyID0gZnVuY3Rpb24gc2V0SW5wdXRIYW5kbGVyKG9iamVjdCwgaGFuZGxlcikge1xuICAgIG9iamVjdC50cmlnZ2VyID0gaGFuZGxlci50cmlnZ2VyLmJpbmQoaGFuZGxlcik7XG4gICAgaWYgKGhhbmRsZXIuc3Vic2NyaWJlICYmIGhhbmRsZXIudW5zdWJzY3JpYmUpIHtcbiAgICAgICAgb2JqZWN0LnN1YnNjcmliZSA9IGhhbmRsZXIuc3Vic2NyaWJlLmJpbmQoaGFuZGxlcik7XG4gICAgICAgIG9iamVjdC51bnN1YnNjcmliZSA9IGhhbmRsZXIudW5zdWJzY3JpYmUuYmluZChoYW5kbGVyKTtcbiAgICB9XG59O1xuRXZlbnRIYW5kbGVyLnNldE91dHB1dEhhbmRsZXIgPSBmdW5jdGlvbiBzZXRPdXRwdXRIYW5kbGVyKG9iamVjdCwgaGFuZGxlcikge1xuICAgIGlmIChoYW5kbGVyIGluc3RhbmNlb2YgRXZlbnRIYW5kbGVyKVxuICAgICAgICBoYW5kbGVyLmJpbmRUaGlzKG9iamVjdCk7XG4gICAgb2JqZWN0LnBpcGUgPSBoYW5kbGVyLnBpcGUuYmluZChoYW5kbGVyKTtcbiAgICBvYmplY3QudW5waXBlID0gaGFuZGxlci51bnBpcGUuYmluZChoYW5kbGVyKTtcbiAgICBvYmplY3Qub24gPSBoYW5kbGVyLm9uLmJpbmQoaGFuZGxlcik7XG4gICAgb2JqZWN0LmFkZExpc3RlbmVyID0gb2JqZWN0Lm9uO1xuICAgIG9iamVjdC5yZW1vdmVMaXN0ZW5lciA9IGhhbmRsZXIucmVtb3ZlTGlzdGVuZXIuYmluZChoYW5kbGVyKTtcbn07XG5FdmVudEhhbmRsZXIucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbiBlbWl0KHR5cGUsIGV2ZW50KSB7XG4gICAgRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5lbWl0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgdmFyIGkgPSAwO1xuICAgIGZvciAoaSA9IDA7IGkgPCB0aGlzLmRvd25zdHJlYW0ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKHRoaXMuZG93bnN0cmVhbVtpXS50cmlnZ2VyKVxuICAgICAgICAgICAgdGhpcy5kb3duc3RyZWFtW2ldLnRyaWdnZXIodHlwZSwgZXZlbnQpO1xuICAgIH1cbiAgICBmb3IgKGkgPSAwOyBpIDwgdGhpcy5kb3duc3RyZWFtRm4ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdGhpcy5kb3duc3RyZWFtRm5baV0odHlwZSwgZXZlbnQpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbn07XG5FdmVudEhhbmRsZXIucHJvdG90eXBlLnRyaWdnZXIgPSBFdmVudEhhbmRsZXIucHJvdG90eXBlLmVtaXQ7XG5FdmVudEhhbmRsZXIucHJvdG90eXBlLnBpcGUgPSBmdW5jdGlvbiBwaXBlKHRhcmdldCkge1xuICAgIGlmICh0YXJnZXQuc3Vic2NyaWJlIGluc3RhbmNlb2YgRnVuY3Rpb24pXG4gICAgICAgIHJldHVybiB0YXJnZXQuc3Vic2NyaWJlKHRoaXMpO1xuICAgIHZhciBkb3duc3RyZWFtQ3R4ID0gdGFyZ2V0IGluc3RhbmNlb2YgRnVuY3Rpb24gPyB0aGlzLmRvd25zdHJlYW1GbiA6IHRoaXMuZG93bnN0cmVhbTtcbiAgICB2YXIgaW5kZXggPSBkb3duc3RyZWFtQ3R4LmluZGV4T2YodGFyZ2V0KTtcbiAgICBpZiAoaW5kZXggPCAwKVxuICAgICAgICBkb3duc3RyZWFtQ3R4LnB1c2godGFyZ2V0KTtcbiAgICBpZiAodGFyZ2V0IGluc3RhbmNlb2YgRnVuY3Rpb24pXG4gICAgICAgIHRhcmdldCgncGlwZScsIG51bGwpO1xuICAgIGVsc2UgaWYgKHRhcmdldC50cmlnZ2VyKVxuICAgICAgICB0YXJnZXQudHJpZ2dlcigncGlwZScsIG51bGwpO1xuICAgIHJldHVybiB0YXJnZXQ7XG59O1xuRXZlbnRIYW5kbGVyLnByb3RvdHlwZS51bnBpcGUgPSBmdW5jdGlvbiB1bnBpcGUodGFyZ2V0KSB7XG4gICAgaWYgKHRhcmdldC51bnN1YnNjcmliZSBpbnN0YW5jZW9mIEZ1bmN0aW9uKVxuICAgICAgICByZXR1cm4gdGFyZ2V0LnVuc3Vic2NyaWJlKHRoaXMpO1xuICAgIHZhciBkb3duc3RyZWFtQ3R4ID0gdGFyZ2V0IGluc3RhbmNlb2YgRnVuY3Rpb24gPyB0aGlzLmRvd25zdHJlYW1GbiA6IHRoaXMuZG93bnN0cmVhbTtcbiAgICB2YXIgaW5kZXggPSBkb3duc3RyZWFtQ3R4LmluZGV4T2YodGFyZ2V0KTtcbiAgICBpZiAoaW5kZXggPj0gMCkge1xuICAgICAgICBkb3duc3RyZWFtQ3R4LnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIGlmICh0YXJnZXQgaW5zdGFuY2VvZiBGdW5jdGlvbilcbiAgICAgICAgICAgIHRhcmdldCgndW5waXBlJywgbnVsbCk7XG4gICAgICAgIGVsc2UgaWYgKHRhcmdldC50cmlnZ2VyKVxuICAgICAgICAgICAgdGFyZ2V0LnRyaWdnZXIoJ3VucGlwZScsIG51bGwpO1xuICAgICAgICByZXR1cm4gdGFyZ2V0O1xuICAgIH0gZWxzZVxuICAgICAgICByZXR1cm4gZmFsc2U7XG59O1xuRXZlbnRIYW5kbGVyLnByb3RvdHlwZS5vbiA9IGZ1bmN0aW9uIG9uKHR5cGUsIGhhbmRsZXIpIHtcbiAgICBFdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgaWYgKCEodHlwZSBpbiB0aGlzLnVwc3RyZWFtTGlzdGVuZXJzKSkge1xuICAgICAgICB2YXIgdXBzdHJlYW1MaXN0ZW5lciA9IHRoaXMudHJpZ2dlci5iaW5kKHRoaXMsIHR5cGUpO1xuICAgICAgICB0aGlzLnVwc3RyZWFtTGlzdGVuZXJzW3R5cGVdID0gdXBzdHJlYW1MaXN0ZW5lcjtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnVwc3RyZWFtLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB0aGlzLnVwc3RyZWFtW2ldLm9uKHR5cGUsIHVwc3RyZWFtTGlzdGVuZXIpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xufTtcbkV2ZW50SGFuZGxlci5wcm90b3R5cGUuYWRkTGlzdGVuZXIgPSBFdmVudEhhbmRsZXIucHJvdG90eXBlLm9uO1xuRXZlbnRIYW5kbGVyLnByb3RvdHlwZS5zdWJzY3JpYmUgPSBmdW5jdGlvbiBzdWJzY3JpYmUoc291cmNlKSB7XG4gICAgdmFyIGluZGV4ID0gdGhpcy51cHN0cmVhbS5pbmRleE9mKHNvdXJjZSk7XG4gICAgaWYgKGluZGV4IDwgMCkge1xuICAgICAgICB0aGlzLnVwc3RyZWFtLnB1c2goc291cmNlKTtcbiAgICAgICAgZm9yICh2YXIgdHlwZSBpbiB0aGlzLnVwc3RyZWFtTGlzdGVuZXJzKSB7XG4gICAgICAgICAgICBzb3VyY2Uub24odHlwZSwgdGhpcy51cHN0cmVhbUxpc3RlbmVyc1t0eXBlXSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuRXZlbnRIYW5kbGVyLnByb3RvdHlwZS51bnN1YnNjcmliZSA9IGZ1bmN0aW9uIHVuc3Vic2NyaWJlKHNvdXJjZSkge1xuICAgIHZhciBpbmRleCA9IHRoaXMudXBzdHJlYW0uaW5kZXhPZihzb3VyY2UpO1xuICAgIGlmIChpbmRleCA+PSAwKSB7XG4gICAgICAgIHRoaXMudXBzdHJlYW0uc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgZm9yICh2YXIgdHlwZSBpbiB0aGlzLnVwc3RyZWFtTGlzdGVuZXJzKSB7XG4gICAgICAgICAgICBzb3VyY2UucmVtb3ZlTGlzdGVuZXIodHlwZSwgdGhpcy51cHN0cmVhbUxpc3RlbmVyc1t0eXBlXSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG59O1xubW9kdWxlLmV4cG9ydHMgPSBFdmVudEhhbmRsZXI7IiwidmFyIFRyYW5zZm9ybSA9IHJlcXVpcmUoJy4vVHJhbnNmb3JtJyk7XG52YXIgVHJhbnNpdGlvbmFibGUgPSByZXF1aXJlKCcuLi90cmFuc2l0aW9ucy9UcmFuc2l0aW9uYWJsZScpO1xudmFyIFRyYW5zaXRpb25hYmxlVHJhbnNmb3JtID0gcmVxdWlyZSgnLi4vdHJhbnNpdGlvbnMvVHJhbnNpdGlvbmFibGVUcmFuc2Zvcm0nKTtcbmZ1bmN0aW9uIE1vZGlmaWVyKG9wdGlvbnMpIHtcbiAgICB0aGlzLl90cmFuc2Zvcm1HZXR0ZXIgPSBudWxsO1xuICAgIHRoaXMuX29wYWNpdHlHZXR0ZXIgPSBudWxsO1xuICAgIHRoaXMuX29yaWdpbkdldHRlciA9IG51bGw7XG4gICAgdGhpcy5fYWxpZ25HZXR0ZXIgPSBudWxsO1xuICAgIHRoaXMuX3NpemVHZXR0ZXIgPSBudWxsO1xuICAgIHRoaXMuX3Byb3BvcnRpb25HZXR0ZXIgPSBudWxsO1xuICAgIHRoaXMuX2xlZ2FjeVN0YXRlcyA9IHt9O1xuICAgIHRoaXMuX291dHB1dCA9IHtcbiAgICAgICAgdHJhbnNmb3JtOiBUcmFuc2Zvcm0uaWRlbnRpdHksXG4gICAgICAgIG9wYWNpdHk6IDEsXG4gICAgICAgIG9yaWdpbjogbnVsbCxcbiAgICAgICAgYWxpZ246IG51bGwsXG4gICAgICAgIHNpemU6IG51bGwsXG4gICAgICAgIHByb3BvcnRpb25zOiBudWxsLFxuICAgICAgICB0YXJnZXQ6IG51bGxcbiAgICB9O1xuICAgIGlmIChvcHRpb25zKSB7XG4gICAgICAgIGlmIChvcHRpb25zLnRyYW5zZm9ybSlcbiAgICAgICAgICAgIHRoaXMudHJhbnNmb3JtRnJvbShvcHRpb25zLnRyYW5zZm9ybSk7XG4gICAgICAgIGlmIChvcHRpb25zLm9wYWNpdHkgIT09IHVuZGVmaW5lZClcbiAgICAgICAgICAgIHRoaXMub3BhY2l0eUZyb20ob3B0aW9ucy5vcGFjaXR5KTtcbiAgICAgICAgaWYgKG9wdGlvbnMub3JpZ2luKVxuICAgICAgICAgICAgdGhpcy5vcmlnaW5Gcm9tKG9wdGlvbnMub3JpZ2luKTtcbiAgICAgICAgaWYgKG9wdGlvbnMuYWxpZ24pXG4gICAgICAgICAgICB0aGlzLmFsaWduRnJvbShvcHRpb25zLmFsaWduKTtcbiAgICAgICAgaWYgKG9wdGlvbnMuc2l6ZSlcbiAgICAgICAgICAgIHRoaXMuc2l6ZUZyb20ob3B0aW9ucy5zaXplKTtcbiAgICAgICAgaWYgKG9wdGlvbnMucHJvcG9ydGlvbnMpXG4gICAgICAgICAgICB0aGlzLnByb3BvcnRpb25zRnJvbShvcHRpb25zLnByb3BvcnRpb25zKTtcbiAgICB9XG59XG5Nb2RpZmllci5wcm90b3R5cGUudHJhbnNmb3JtRnJvbSA9IGZ1bmN0aW9uIHRyYW5zZm9ybUZyb20odHJhbnNmb3JtKSB7XG4gICAgaWYgKHRyYW5zZm9ybSBpbnN0YW5jZW9mIEZ1bmN0aW9uKVxuICAgICAgICB0aGlzLl90cmFuc2Zvcm1HZXR0ZXIgPSB0cmFuc2Zvcm07XG4gICAgZWxzZSBpZiAodHJhbnNmb3JtIGluc3RhbmNlb2YgT2JqZWN0ICYmIHRyYW5zZm9ybS5nZXQpXG4gICAgICAgIHRoaXMuX3RyYW5zZm9ybUdldHRlciA9IHRyYW5zZm9ybS5nZXQuYmluZCh0cmFuc2Zvcm0pO1xuICAgIGVsc2Uge1xuICAgICAgICB0aGlzLl90cmFuc2Zvcm1HZXR0ZXIgPSBudWxsO1xuICAgICAgICB0aGlzLl9vdXRwdXQudHJhbnNmb3JtID0gdHJhbnNmb3JtO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbn07XG5Nb2RpZmllci5wcm90b3R5cGUub3BhY2l0eUZyb20gPSBmdW5jdGlvbiBvcGFjaXR5RnJvbShvcGFjaXR5KSB7XG4gICAgaWYgKG9wYWNpdHkgaW5zdGFuY2VvZiBGdW5jdGlvbilcbiAgICAgICAgdGhpcy5fb3BhY2l0eUdldHRlciA9IG9wYWNpdHk7XG4gICAgZWxzZSBpZiAob3BhY2l0eSBpbnN0YW5jZW9mIE9iamVjdCAmJiBvcGFjaXR5LmdldClcbiAgICAgICAgdGhpcy5fb3BhY2l0eUdldHRlciA9IG9wYWNpdHkuZ2V0LmJpbmQob3BhY2l0eSk7XG4gICAgZWxzZSB7XG4gICAgICAgIHRoaXMuX29wYWNpdHlHZXR0ZXIgPSBudWxsO1xuICAgICAgICB0aGlzLl9vdXRwdXQub3BhY2l0eSA9IG9wYWNpdHk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xufTtcbk1vZGlmaWVyLnByb3RvdHlwZS5vcmlnaW5Gcm9tID0gZnVuY3Rpb24gb3JpZ2luRnJvbShvcmlnaW4pIHtcbiAgICBpZiAob3JpZ2luIGluc3RhbmNlb2YgRnVuY3Rpb24pXG4gICAgICAgIHRoaXMuX29yaWdpbkdldHRlciA9IG9yaWdpbjtcbiAgICBlbHNlIGlmIChvcmlnaW4gaW5zdGFuY2VvZiBPYmplY3QgJiYgb3JpZ2luLmdldClcbiAgICAgICAgdGhpcy5fb3JpZ2luR2V0dGVyID0gb3JpZ2luLmdldC5iaW5kKG9yaWdpbik7XG4gICAgZWxzZSB7XG4gICAgICAgIHRoaXMuX29yaWdpbkdldHRlciA9IG51bGw7XG4gICAgICAgIHRoaXMuX291dHB1dC5vcmlnaW4gPSBvcmlnaW47XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xufTtcbk1vZGlmaWVyLnByb3RvdHlwZS5hbGlnbkZyb20gPSBmdW5jdGlvbiBhbGlnbkZyb20oYWxpZ24pIHtcbiAgICBpZiAoYWxpZ24gaW5zdGFuY2VvZiBGdW5jdGlvbilcbiAgICAgICAgdGhpcy5fYWxpZ25HZXR0ZXIgPSBhbGlnbjtcbiAgICBlbHNlIGlmIChhbGlnbiBpbnN0YW5jZW9mIE9iamVjdCAmJiBhbGlnbi5nZXQpXG4gICAgICAgIHRoaXMuX2FsaWduR2V0dGVyID0gYWxpZ24uZ2V0LmJpbmQoYWxpZ24pO1xuICAgIGVsc2Uge1xuICAgICAgICB0aGlzLl9hbGlnbkdldHRlciA9IG51bGw7XG4gICAgICAgIHRoaXMuX291dHB1dC5hbGlnbiA9IGFsaWduO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbn07XG5Nb2RpZmllci5wcm90b3R5cGUuc2l6ZUZyb20gPSBmdW5jdGlvbiBzaXplRnJvbShzaXplKSB7XG4gICAgaWYgKHNpemUgaW5zdGFuY2VvZiBGdW5jdGlvbilcbiAgICAgICAgdGhpcy5fc2l6ZUdldHRlciA9IHNpemU7XG4gICAgZWxzZSBpZiAoc2l6ZSBpbnN0YW5jZW9mIE9iamVjdCAmJiBzaXplLmdldClcbiAgICAgICAgdGhpcy5fc2l6ZUdldHRlciA9IHNpemUuZ2V0LmJpbmQoc2l6ZSk7XG4gICAgZWxzZSB7XG4gICAgICAgIHRoaXMuX3NpemVHZXR0ZXIgPSBudWxsO1xuICAgICAgICB0aGlzLl9vdXRwdXQuc2l6ZSA9IHNpemU7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xufTtcbk1vZGlmaWVyLnByb3RvdHlwZS5wcm9wb3J0aW9uc0Zyb20gPSBmdW5jdGlvbiBwcm9wb3J0aW9uc0Zyb20ocHJvcG9ydGlvbnMpIHtcbiAgICBpZiAocHJvcG9ydGlvbnMgaW5zdGFuY2VvZiBGdW5jdGlvbilcbiAgICAgICAgdGhpcy5fcHJvcG9ydGlvbkdldHRlciA9IHByb3BvcnRpb25zO1xuICAgIGVsc2UgaWYgKHByb3BvcnRpb25zIGluc3RhbmNlb2YgT2JqZWN0ICYmIHByb3BvcnRpb25zLmdldClcbiAgICAgICAgdGhpcy5fcHJvcG9ydGlvbkdldHRlciA9IHByb3BvcnRpb25zLmdldC5iaW5kKHByb3BvcnRpb25zKTtcbiAgICBlbHNlIHtcbiAgICAgICAgdGhpcy5fcHJvcG9ydGlvbkdldHRlciA9IG51bGw7XG4gICAgICAgIHRoaXMuX291dHB1dC5wcm9wb3J0aW9ucyA9IHByb3BvcnRpb25zO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbn07XG5Nb2RpZmllci5wcm90b3R5cGUuc2V0VHJhbnNmb3JtID0gZnVuY3Rpb24gc2V0VHJhbnNmb3JtKHRyYW5zZm9ybSwgdHJhbnNpdGlvbiwgY2FsbGJhY2spIHtcbiAgICBpZiAodHJhbnNpdGlvbiB8fCB0aGlzLl9sZWdhY3lTdGF0ZXMudHJhbnNmb3JtKSB7XG4gICAgICAgIGlmICghdGhpcy5fbGVnYWN5U3RhdGVzLnRyYW5zZm9ybSkge1xuICAgICAgICAgICAgdGhpcy5fbGVnYWN5U3RhdGVzLnRyYW5zZm9ybSA9IG5ldyBUcmFuc2l0aW9uYWJsZVRyYW5zZm9ybSh0aGlzLl9vdXRwdXQudHJhbnNmb3JtKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXRoaXMuX3RyYW5zZm9ybUdldHRlcilcbiAgICAgICAgICAgIHRoaXMudHJhbnNmb3JtRnJvbSh0aGlzLl9sZWdhY3lTdGF0ZXMudHJhbnNmb3JtKTtcbiAgICAgICAgdGhpcy5fbGVnYWN5U3RhdGVzLnRyYW5zZm9ybS5zZXQodHJhbnNmb3JtLCB0cmFuc2l0aW9uLCBjYWxsYmFjayk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0gZWxzZVxuICAgICAgICByZXR1cm4gdGhpcy50cmFuc2Zvcm1Gcm9tKHRyYW5zZm9ybSk7XG59O1xuTW9kaWZpZXIucHJvdG90eXBlLnNldE9wYWNpdHkgPSBmdW5jdGlvbiBzZXRPcGFjaXR5KG9wYWNpdHksIHRyYW5zaXRpb24sIGNhbGxiYWNrKSB7XG4gICAgaWYgKHRyYW5zaXRpb24gfHwgdGhpcy5fbGVnYWN5U3RhdGVzLm9wYWNpdHkpIHtcbiAgICAgICAgaWYgKCF0aGlzLl9sZWdhY3lTdGF0ZXMub3BhY2l0eSkge1xuICAgICAgICAgICAgdGhpcy5fbGVnYWN5U3RhdGVzLm9wYWNpdHkgPSBuZXcgVHJhbnNpdGlvbmFibGUodGhpcy5fb3V0cHV0Lm9wYWNpdHkpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghdGhpcy5fb3BhY2l0eUdldHRlcilcbiAgICAgICAgICAgIHRoaXMub3BhY2l0eUZyb20odGhpcy5fbGVnYWN5U3RhdGVzLm9wYWNpdHkpO1xuICAgICAgICByZXR1cm4gdGhpcy5fbGVnYWN5U3RhdGVzLm9wYWNpdHkuc2V0KG9wYWNpdHksIHRyYW5zaXRpb24sIGNhbGxiYWNrKTtcbiAgICB9IGVsc2VcbiAgICAgICAgcmV0dXJuIHRoaXMub3BhY2l0eUZyb20ob3BhY2l0eSk7XG59O1xuTW9kaWZpZXIucHJvdG90eXBlLnNldE9yaWdpbiA9IGZ1bmN0aW9uIHNldE9yaWdpbihvcmlnaW4sIHRyYW5zaXRpb24sIGNhbGxiYWNrKSB7XG4gICAgaWYgKHRyYW5zaXRpb24gfHwgdGhpcy5fbGVnYWN5U3RhdGVzLm9yaWdpbikge1xuICAgICAgICBpZiAoIXRoaXMuX2xlZ2FjeVN0YXRlcy5vcmlnaW4pIHtcbiAgICAgICAgICAgIHRoaXMuX2xlZ2FjeVN0YXRlcy5vcmlnaW4gPSBuZXcgVHJhbnNpdGlvbmFibGUodGhpcy5fb3V0cHV0Lm9yaWdpbiB8fCBbXG4gICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICAwXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXRoaXMuX29yaWdpbkdldHRlcilcbiAgICAgICAgICAgIHRoaXMub3JpZ2luRnJvbSh0aGlzLl9sZWdhY3lTdGF0ZXMub3JpZ2luKTtcbiAgICAgICAgdGhpcy5fbGVnYWN5U3RhdGVzLm9yaWdpbi5zZXQob3JpZ2luLCB0cmFuc2l0aW9uLCBjYWxsYmFjayk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0gZWxzZVxuICAgICAgICByZXR1cm4gdGhpcy5vcmlnaW5Gcm9tKG9yaWdpbik7XG59O1xuTW9kaWZpZXIucHJvdG90eXBlLnNldEFsaWduID0gZnVuY3Rpb24gc2V0QWxpZ24oYWxpZ24sIHRyYW5zaXRpb24sIGNhbGxiYWNrKSB7XG4gICAgaWYgKHRyYW5zaXRpb24gfHwgdGhpcy5fbGVnYWN5U3RhdGVzLmFsaWduKSB7XG4gICAgICAgIGlmICghdGhpcy5fbGVnYWN5U3RhdGVzLmFsaWduKSB7XG4gICAgICAgICAgICB0aGlzLl9sZWdhY3lTdGF0ZXMuYWxpZ24gPSBuZXcgVHJhbnNpdGlvbmFibGUodGhpcy5fb3V0cHV0LmFsaWduIHx8IFtcbiAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgIDBcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgICAgIGlmICghdGhpcy5fYWxpZ25HZXR0ZXIpXG4gICAgICAgICAgICB0aGlzLmFsaWduRnJvbSh0aGlzLl9sZWdhY3lTdGF0ZXMuYWxpZ24pO1xuICAgICAgICB0aGlzLl9sZWdhY3lTdGF0ZXMuYWxpZ24uc2V0KGFsaWduLCB0cmFuc2l0aW9uLCBjYWxsYmFjayk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0gZWxzZVxuICAgICAgICByZXR1cm4gdGhpcy5hbGlnbkZyb20oYWxpZ24pO1xufTtcbk1vZGlmaWVyLnByb3RvdHlwZS5zZXRTaXplID0gZnVuY3Rpb24gc2V0U2l6ZShzaXplLCB0cmFuc2l0aW9uLCBjYWxsYmFjaykge1xuICAgIGlmIChzaXplICYmICh0cmFuc2l0aW9uIHx8IHRoaXMuX2xlZ2FjeVN0YXRlcy5zaXplKSkge1xuICAgICAgICBpZiAoIXRoaXMuX2xlZ2FjeVN0YXRlcy5zaXplKSB7XG4gICAgICAgICAgICB0aGlzLl9sZWdhY3lTdGF0ZXMuc2l6ZSA9IG5ldyBUcmFuc2l0aW9uYWJsZSh0aGlzLl9vdXRwdXQuc2l6ZSB8fCBbXG4gICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICAwXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXRoaXMuX3NpemVHZXR0ZXIpXG4gICAgICAgICAgICB0aGlzLnNpemVGcm9tKHRoaXMuX2xlZ2FjeVN0YXRlcy5zaXplKTtcbiAgICAgICAgdGhpcy5fbGVnYWN5U3RhdGVzLnNpemUuc2V0KHNpemUsIHRyYW5zaXRpb24sIGNhbGxiYWNrKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSBlbHNlXG4gICAgICAgIHJldHVybiB0aGlzLnNpemVGcm9tKHNpemUpO1xufTtcbk1vZGlmaWVyLnByb3RvdHlwZS5zZXRQcm9wb3J0aW9ucyA9IGZ1bmN0aW9uIHNldFByb3BvcnRpb25zKHByb3BvcnRpb25zLCB0cmFuc2l0aW9uLCBjYWxsYmFjaykge1xuICAgIGlmIChwcm9wb3J0aW9ucyAmJiAodHJhbnNpdGlvbiB8fCB0aGlzLl9sZWdhY3lTdGF0ZXMucHJvcG9ydGlvbnMpKSB7XG4gICAgICAgIGlmICghdGhpcy5fbGVnYWN5U3RhdGVzLnByb3BvcnRpb25zKSB7XG4gICAgICAgICAgICB0aGlzLl9sZWdhY3lTdGF0ZXMucHJvcG9ydGlvbnMgPSBuZXcgVHJhbnNpdGlvbmFibGUodGhpcy5fb3V0cHV0LnByb3BvcnRpb25zIHx8IFtcbiAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgIDBcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgICAgIGlmICghdGhpcy5fcHJvcG9ydGlvbkdldHRlcilcbiAgICAgICAgICAgIHRoaXMucHJvcG9ydGlvbnNGcm9tKHRoaXMuX2xlZ2FjeVN0YXRlcy5wcm9wb3J0aW9ucyk7XG4gICAgICAgIHRoaXMuX2xlZ2FjeVN0YXRlcy5wcm9wb3J0aW9ucy5zZXQocHJvcG9ydGlvbnMsIHRyYW5zaXRpb24sIGNhbGxiYWNrKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSBlbHNlXG4gICAgICAgIHJldHVybiB0aGlzLnByb3BvcnRpb25zRnJvbShwcm9wb3J0aW9ucyk7XG59O1xuTW9kaWZpZXIucHJvdG90eXBlLmhhbHQgPSBmdW5jdGlvbiBoYWx0KCkge1xuICAgIGlmICh0aGlzLl9sZWdhY3lTdGF0ZXMudHJhbnNmb3JtKVxuICAgICAgICB0aGlzLl9sZWdhY3lTdGF0ZXMudHJhbnNmb3JtLmhhbHQoKTtcbiAgICBpZiAodGhpcy5fbGVnYWN5U3RhdGVzLm9wYWNpdHkpXG4gICAgICAgIHRoaXMuX2xlZ2FjeVN0YXRlcy5vcGFjaXR5LmhhbHQoKTtcbiAgICBpZiAodGhpcy5fbGVnYWN5U3RhdGVzLm9yaWdpbilcbiAgICAgICAgdGhpcy5fbGVnYWN5U3RhdGVzLm9yaWdpbi5oYWx0KCk7XG4gICAgaWYgKHRoaXMuX2xlZ2FjeVN0YXRlcy5hbGlnbilcbiAgICAgICAgdGhpcy5fbGVnYWN5U3RhdGVzLmFsaWduLmhhbHQoKTtcbiAgICBpZiAodGhpcy5fbGVnYWN5U3RhdGVzLnNpemUpXG4gICAgICAgIHRoaXMuX2xlZ2FjeVN0YXRlcy5zaXplLmhhbHQoKTtcbiAgICBpZiAodGhpcy5fbGVnYWN5U3RhdGVzLnByb3BvcnRpb25zKVxuICAgICAgICB0aGlzLl9sZWdhY3lTdGF0ZXMucHJvcG9ydGlvbnMuaGFsdCgpO1xuICAgIHRoaXMuX3RyYW5zZm9ybUdldHRlciA9IG51bGw7XG4gICAgdGhpcy5fb3BhY2l0eUdldHRlciA9IG51bGw7XG4gICAgdGhpcy5fb3JpZ2luR2V0dGVyID0gbnVsbDtcbiAgICB0aGlzLl9hbGlnbkdldHRlciA9IG51bGw7XG4gICAgdGhpcy5fc2l6ZUdldHRlciA9IG51bGw7XG4gICAgdGhpcy5fcHJvcG9ydGlvbkdldHRlciA9IG51bGw7XG59O1xuTW9kaWZpZXIucHJvdG90eXBlLmdldFRyYW5zZm9ybSA9IGZ1bmN0aW9uIGdldFRyYW5zZm9ybSgpIHtcbiAgICByZXR1cm4gdGhpcy5fdHJhbnNmb3JtR2V0dGVyKCk7XG59O1xuTW9kaWZpZXIucHJvdG90eXBlLmdldEZpbmFsVHJhbnNmb3JtID0gZnVuY3Rpb24gZ2V0RmluYWxUcmFuc2Zvcm0oKSB7XG4gICAgcmV0dXJuIHRoaXMuX2xlZ2FjeVN0YXRlcy50cmFuc2Zvcm0gPyB0aGlzLl9sZWdhY3lTdGF0ZXMudHJhbnNmb3JtLmdldEZpbmFsKCkgOiB0aGlzLl9vdXRwdXQudHJhbnNmb3JtO1xufTtcbk1vZGlmaWVyLnByb3RvdHlwZS5nZXRPcGFjaXR5ID0gZnVuY3Rpb24gZ2V0T3BhY2l0eSgpIHtcbiAgICByZXR1cm4gdGhpcy5fb3BhY2l0eUdldHRlcigpO1xufTtcbk1vZGlmaWVyLnByb3RvdHlwZS5nZXRPcmlnaW4gPSBmdW5jdGlvbiBnZXRPcmlnaW4oKSB7XG4gICAgcmV0dXJuIHRoaXMuX29yaWdpbkdldHRlcigpO1xufTtcbk1vZGlmaWVyLnByb3RvdHlwZS5nZXRBbGlnbiA9IGZ1bmN0aW9uIGdldEFsaWduKCkge1xuICAgIHJldHVybiB0aGlzLl9hbGlnbkdldHRlcigpO1xufTtcbk1vZGlmaWVyLnByb3RvdHlwZS5nZXRTaXplID0gZnVuY3Rpb24gZ2V0U2l6ZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fc2l6ZUdldHRlciA/IHRoaXMuX3NpemVHZXR0ZXIoKSA6IHRoaXMuX291dHB1dC5zaXplO1xufTtcbk1vZGlmaWVyLnByb3RvdHlwZS5nZXRQcm9wb3J0aW9ucyA9IGZ1bmN0aW9uIGdldFByb3BvcnRpb25zKCkge1xuICAgIHJldHVybiB0aGlzLl9wcm9wb3J0aW9uR2V0dGVyID8gdGhpcy5fcHJvcG9ydGlvbkdldHRlcigpIDogdGhpcy5fb3V0cHV0LnByb3BvcnRpb25zO1xufTtcbmZ1bmN0aW9uIF91cGRhdGUoKSB7XG4gICAgaWYgKHRoaXMuX3RyYW5zZm9ybUdldHRlcilcbiAgICAgICAgdGhpcy5fb3V0cHV0LnRyYW5zZm9ybSA9IHRoaXMuX3RyYW5zZm9ybUdldHRlcigpO1xuICAgIGlmICh0aGlzLl9vcGFjaXR5R2V0dGVyKVxuICAgICAgICB0aGlzLl9vdXRwdXQub3BhY2l0eSA9IHRoaXMuX29wYWNpdHlHZXR0ZXIoKTtcbiAgICBpZiAodGhpcy5fb3JpZ2luR2V0dGVyKVxuICAgICAgICB0aGlzLl9vdXRwdXQub3JpZ2luID0gdGhpcy5fb3JpZ2luR2V0dGVyKCk7XG4gICAgaWYgKHRoaXMuX2FsaWduR2V0dGVyKVxuICAgICAgICB0aGlzLl9vdXRwdXQuYWxpZ24gPSB0aGlzLl9hbGlnbkdldHRlcigpO1xuICAgIGlmICh0aGlzLl9zaXplR2V0dGVyKVxuICAgICAgICB0aGlzLl9vdXRwdXQuc2l6ZSA9IHRoaXMuX3NpemVHZXR0ZXIoKTtcbiAgICBpZiAodGhpcy5fcHJvcG9ydGlvbkdldHRlcilcbiAgICAgICAgdGhpcy5fb3V0cHV0LnByb3BvcnRpb25zID0gdGhpcy5fcHJvcG9ydGlvbkdldHRlcigpO1xufVxuTW9kaWZpZXIucHJvdG90eXBlLm1vZGlmeSA9IGZ1bmN0aW9uIG1vZGlmeSh0YXJnZXQpIHtcbiAgICBfdXBkYXRlLmNhbGwodGhpcyk7XG4gICAgdGhpcy5fb3V0cHV0LnRhcmdldCA9IHRhcmdldDtcbiAgICByZXR1cm4gdGhpcy5fb3V0cHV0O1xufTtcbm1vZHVsZS5leHBvcnRzID0gTW9kaWZpZXI7IiwidmFyIEV2ZW50SGFuZGxlciA9IHJlcXVpcmUoJy4vRXZlbnRIYW5kbGVyJyk7XG5mdW5jdGlvbiBPcHRpb25zTWFuYWdlcih2YWx1ZSkge1xuICAgIHRoaXMuX3ZhbHVlID0gdmFsdWU7XG4gICAgdGhpcy5ldmVudE91dHB1dCA9IG51bGw7XG59XG5PcHRpb25zTWFuYWdlci5wYXRjaCA9IGZ1bmN0aW9uIHBhdGNoT2JqZWN0KHNvdXJjZSwgZGF0YSkge1xuICAgIHZhciBtYW5hZ2VyID0gbmV3IE9wdGlvbnNNYW5hZ2VyKHNvdXJjZSk7XG4gICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspXG4gICAgICAgIG1hbmFnZXIucGF0Y2goYXJndW1lbnRzW2ldKTtcbiAgICByZXR1cm4gc291cmNlO1xufTtcbmZ1bmN0aW9uIF9jcmVhdGVFdmVudE91dHB1dCgpIHtcbiAgICB0aGlzLmV2ZW50T3V0cHV0ID0gbmV3IEV2ZW50SGFuZGxlcigpO1xuICAgIHRoaXMuZXZlbnRPdXRwdXQuYmluZFRoaXModGhpcyk7XG4gICAgRXZlbnRIYW5kbGVyLnNldE91dHB1dEhhbmRsZXIodGhpcywgdGhpcy5ldmVudE91dHB1dCk7XG59XG5PcHRpb25zTWFuYWdlci5wcm90b3R5cGUucGF0Y2ggPSBmdW5jdGlvbiBwYXRjaCgpIHtcbiAgICB2YXIgbXlTdGF0ZSA9IHRoaXMuX3ZhbHVlO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBkYXRhID0gYXJndW1lbnRzW2ldO1xuICAgICAgICBmb3IgKHZhciBrIGluIGRhdGEpIHtcbiAgICAgICAgICAgIGlmIChrIGluIG15U3RhdGUgJiYgKGRhdGFba10gJiYgZGF0YVtrXS5jb25zdHJ1Y3RvciA9PT0gT2JqZWN0KSAmJiAobXlTdGF0ZVtrXSAmJiBteVN0YXRlW2tdLmNvbnN0cnVjdG9yID09PSBPYmplY3QpKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFteVN0YXRlLmhhc093blByb3BlcnR5KGspKVxuICAgICAgICAgICAgICAgICAgICBteVN0YXRlW2tdID0gT2JqZWN0LmNyZWF0ZShteVN0YXRlW2tdKTtcbiAgICAgICAgICAgICAgICB0aGlzLmtleShrKS5wYXRjaChkYXRhW2tdKTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5ldmVudE91dHB1dClcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5ldmVudE91dHB1dC5lbWl0KCdjaGFuZ2UnLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogayxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiB0aGlzLmtleShrKS52YWx1ZSgpXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlXG4gICAgICAgICAgICAgICAgdGhpcy5zZXQoaywgZGF0YVtrXSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuT3B0aW9uc01hbmFnZXIucHJvdG90eXBlLnNldE9wdGlvbnMgPSBPcHRpb25zTWFuYWdlci5wcm90b3R5cGUucGF0Y2g7XG5PcHRpb25zTWFuYWdlci5wcm90b3R5cGUua2V5ID0gZnVuY3Rpb24ga2V5KGlkZW50aWZpZXIpIHtcbiAgICB2YXIgcmVzdWx0ID0gbmV3IE9wdGlvbnNNYW5hZ2VyKHRoaXMuX3ZhbHVlW2lkZW50aWZpZXJdKTtcbiAgICBpZiAoIShyZXN1bHQuX3ZhbHVlIGluc3RhbmNlb2YgT2JqZWN0KSB8fCByZXN1bHQuX3ZhbHVlIGluc3RhbmNlb2YgQXJyYXkpXG4gICAgICAgIHJlc3VsdC5fdmFsdWUgPSB7fTtcbiAgICByZXR1cm4gcmVzdWx0O1xufTtcbk9wdGlvbnNNYW5hZ2VyLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbiBnZXQoa2V5KSB7XG4gICAgcmV0dXJuIGtleSA/IHRoaXMuX3ZhbHVlW2tleV0gOiB0aGlzLl92YWx1ZTtcbn07XG5PcHRpb25zTWFuYWdlci5wcm90b3R5cGUuZ2V0T3B0aW9ucyA9IE9wdGlvbnNNYW5hZ2VyLnByb3RvdHlwZS5nZXQ7XG5PcHRpb25zTWFuYWdlci5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24gc2V0KGtleSwgdmFsdWUpIHtcbiAgICB2YXIgb3JpZ2luYWxWYWx1ZSA9IHRoaXMuZ2V0KGtleSk7XG4gICAgdGhpcy5fdmFsdWVba2V5XSA9IHZhbHVlO1xuICAgIGlmICh0aGlzLmV2ZW50T3V0cHV0ICYmIHZhbHVlICE9PSBvcmlnaW5hbFZhbHVlKVxuICAgICAgICB0aGlzLmV2ZW50T3V0cHV0LmVtaXQoJ2NoYW5nZScsIHtcbiAgICAgICAgICAgIGlkOiBrZXksXG4gICAgICAgICAgICB2YWx1ZTogdmFsdWVcbiAgICAgICAgfSk7XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuT3B0aW9uc01hbmFnZXIucHJvdG90eXBlLm9uID0gZnVuY3Rpb24gb24oKSB7XG4gICAgX2NyZWF0ZUV2ZW50T3V0cHV0LmNhbGwodGhpcyk7XG4gICAgcmV0dXJuIHRoaXMub24uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn07XG5PcHRpb25zTWFuYWdlci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXIgPSBmdW5jdGlvbiByZW1vdmVMaXN0ZW5lcigpIHtcbiAgICBfY3JlYXRlRXZlbnRPdXRwdXQuY2FsbCh0aGlzKTtcbiAgICByZXR1cm4gdGhpcy5yZW1vdmVMaXN0ZW5lci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xufTtcbk9wdGlvbnNNYW5hZ2VyLnByb3RvdHlwZS5waXBlID0gZnVuY3Rpb24gcGlwZSgpIHtcbiAgICBfY3JlYXRlRXZlbnRPdXRwdXQuY2FsbCh0aGlzKTtcbiAgICByZXR1cm4gdGhpcy5waXBlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG59O1xuT3B0aW9uc01hbmFnZXIucHJvdG90eXBlLnVucGlwZSA9IGZ1bmN0aW9uIHVucGlwZSgpIHtcbiAgICBfY3JlYXRlRXZlbnRPdXRwdXQuY2FsbCh0aGlzKTtcbiAgICByZXR1cm4gdGhpcy51bnBpcGUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn07XG5tb2R1bGUuZXhwb3J0cyA9IE9wdGlvbnNNYW5hZ2VyOyIsInZhciBFbnRpdHkgPSByZXF1aXJlKCcuL0VudGl0eScpO1xudmFyIFNwZWNQYXJzZXIgPSByZXF1aXJlKCcuL1NwZWNQYXJzZXInKTtcbmZ1bmN0aW9uIFJlbmRlck5vZGUob2JqZWN0KSB7XG4gICAgdGhpcy5fb2JqZWN0ID0gbnVsbDtcbiAgICB0aGlzLl9jaGlsZCA9IG51bGw7XG4gICAgdGhpcy5faGFzTXVsdGlwbGVDaGlsZHJlbiA9IGZhbHNlO1xuICAgIHRoaXMuX2lzUmVuZGVyYWJsZSA9IGZhbHNlO1xuICAgIHRoaXMuX2lzTW9kaWZpZXIgPSBmYWxzZTtcbiAgICB0aGlzLl9yZXN1bHRDYWNoZSA9IHt9O1xuICAgIHRoaXMuX3ByZXZSZXN1bHRzID0ge307XG4gICAgdGhpcy5fY2hpbGRSZXN1bHQgPSBudWxsO1xuICAgIGlmIChvYmplY3QpXG4gICAgICAgIHRoaXMuc2V0KG9iamVjdCk7XG59XG5SZW5kZXJOb2RlLnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbiBhZGQoY2hpbGQpIHtcbiAgICB2YXIgY2hpbGROb2RlID0gY2hpbGQgaW5zdGFuY2VvZiBSZW5kZXJOb2RlID8gY2hpbGQgOiBuZXcgUmVuZGVyTm9kZShjaGlsZCk7XG4gICAgaWYgKHRoaXMuX2NoaWxkIGluc3RhbmNlb2YgQXJyYXkpXG4gICAgICAgIHRoaXMuX2NoaWxkLnB1c2goY2hpbGROb2RlKTtcbiAgICBlbHNlIGlmICh0aGlzLl9jaGlsZCkge1xuICAgICAgICB0aGlzLl9jaGlsZCA9IFtcbiAgICAgICAgICAgIHRoaXMuX2NoaWxkLFxuICAgICAgICAgICAgY2hpbGROb2RlXG4gICAgICAgIF07XG4gICAgICAgIHRoaXMuX2hhc011bHRpcGxlQ2hpbGRyZW4gPSB0cnVlO1xuICAgICAgICB0aGlzLl9jaGlsZFJlc3VsdCA9IFtdO1xuICAgIH0gZWxzZVxuICAgICAgICB0aGlzLl9jaGlsZCA9IGNoaWxkTm9kZTtcbiAgICByZXR1cm4gY2hpbGROb2RlO1xufTtcblJlbmRlck5vZGUucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uIGdldCgpIHtcbiAgICByZXR1cm4gdGhpcy5fb2JqZWN0IHx8ICh0aGlzLl9oYXNNdWx0aXBsZUNoaWxkcmVuID8gbnVsbCA6IHRoaXMuX2NoaWxkID8gdGhpcy5fY2hpbGQuZ2V0KCkgOiBudWxsKTtcbn07XG5SZW5kZXJOb2RlLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbiBzZXQoY2hpbGQpIHtcbiAgICB0aGlzLl9jaGlsZFJlc3VsdCA9IG51bGw7XG4gICAgdGhpcy5faGFzTXVsdGlwbGVDaGlsZHJlbiA9IGZhbHNlO1xuICAgIHRoaXMuX2lzUmVuZGVyYWJsZSA9IGNoaWxkLnJlbmRlciA/IHRydWUgOiBmYWxzZTtcbiAgICB0aGlzLl9pc01vZGlmaWVyID0gY2hpbGQubW9kaWZ5ID8gdHJ1ZSA6IGZhbHNlO1xuICAgIHRoaXMuX29iamVjdCA9IGNoaWxkO1xuICAgIHRoaXMuX2NoaWxkID0gbnVsbDtcbiAgICBpZiAoY2hpbGQgaW5zdGFuY2VvZiBSZW5kZXJOb2RlKVxuICAgICAgICByZXR1cm4gY2hpbGQ7XG4gICAgZWxzZVxuICAgICAgICByZXR1cm4gdGhpcztcbn07XG5SZW5kZXJOb2RlLnByb3RvdHlwZS5nZXRTaXplID0gZnVuY3Rpb24gZ2V0U2l6ZSgpIHtcbiAgICB2YXIgcmVzdWx0ID0gbnVsbDtcbiAgICB2YXIgdGFyZ2V0ID0gdGhpcy5nZXQoKTtcbiAgICBpZiAodGFyZ2V0ICYmIHRhcmdldC5nZXRTaXplKVxuICAgICAgICByZXN1bHQgPSB0YXJnZXQuZ2V0U2l6ZSgpO1xuICAgIGlmICghcmVzdWx0ICYmIHRoaXMuX2NoaWxkICYmIHRoaXMuX2NoaWxkLmdldFNpemUpXG4gICAgICAgIHJlc3VsdCA9IHRoaXMuX2NoaWxkLmdldFNpemUoKTtcbiAgICByZXR1cm4gcmVzdWx0O1xufTtcbmZ1bmN0aW9uIF9hcHBseUNvbW1pdChzcGVjLCBjb250ZXh0LCBjYWNoZVN0b3JhZ2UpIHtcbiAgICB2YXIgcmVzdWx0ID0gU3BlY1BhcnNlci5wYXJzZShzcGVjLCBjb250ZXh0KTtcbiAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKHJlc3VsdCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBpZCA9IGtleXNbaV07XG4gICAgICAgIHZhciBjaGlsZE5vZGUgPSBFbnRpdHkuZ2V0KGlkKTtcbiAgICAgICAgdmFyIGNvbW1pdFBhcmFtcyA9IHJlc3VsdFtpZF07XG4gICAgICAgIGNvbW1pdFBhcmFtcy5hbGxvY2F0b3IgPSBjb250ZXh0LmFsbG9jYXRvcjtcbiAgICAgICAgdmFyIGNvbW1pdFJlc3VsdCA9IGNoaWxkTm9kZS5jb21taXQoY29tbWl0UGFyYW1zKTtcbiAgICAgICAgaWYgKGNvbW1pdFJlc3VsdClcbiAgICAgICAgICAgIF9hcHBseUNvbW1pdChjb21taXRSZXN1bHQsIGNvbnRleHQsIGNhY2hlU3RvcmFnZSk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGNhY2hlU3RvcmFnZVtpZF0gPSBjb21taXRQYXJhbXM7XG4gICAgfVxufVxuUmVuZGVyTm9kZS5wcm90b3R5cGUuY29tbWl0ID0gZnVuY3Rpb24gY29tbWl0KGNvbnRleHQpIHtcbiAgICB2YXIgcHJldktleXMgPSBPYmplY3Qua2V5cyh0aGlzLl9wcmV2UmVzdWx0cyk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwcmV2S2V5cy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgaWQgPSBwcmV2S2V5c1tpXTtcbiAgICAgICAgaWYgKHRoaXMuX3Jlc3VsdENhY2hlW2lkXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB2YXIgb2JqZWN0ID0gRW50aXR5LmdldChpZCk7XG4gICAgICAgICAgICBpZiAob2JqZWN0LmNsZWFudXApXG4gICAgICAgICAgICAgICAgb2JqZWN0LmNsZWFudXAoY29udGV4dC5hbGxvY2F0b3IpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHRoaXMuX3ByZXZSZXN1bHRzID0gdGhpcy5fcmVzdWx0Q2FjaGU7XG4gICAgdGhpcy5fcmVzdWx0Q2FjaGUgPSB7fTtcbiAgICBfYXBwbHlDb21taXQodGhpcy5yZW5kZXIoKSwgY29udGV4dCwgdGhpcy5fcmVzdWx0Q2FjaGUpO1xufTtcblJlbmRlck5vZGUucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICBpZiAodGhpcy5faXNSZW5kZXJhYmxlKVxuICAgICAgICByZXR1cm4gdGhpcy5fb2JqZWN0LnJlbmRlcigpO1xuICAgIHZhciByZXN1bHQgPSBudWxsO1xuICAgIGlmICh0aGlzLl9oYXNNdWx0aXBsZUNoaWxkcmVuKSB7XG4gICAgICAgIHJlc3VsdCA9IHRoaXMuX2NoaWxkUmVzdWx0O1xuICAgICAgICB2YXIgY2hpbGRyZW4gPSB0aGlzLl9jaGlsZDtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgcmVzdWx0W2ldID0gY2hpbGRyZW5baV0ucmVuZGVyKCk7XG4gICAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHRoaXMuX2NoaWxkKVxuICAgICAgICByZXN1bHQgPSB0aGlzLl9jaGlsZC5yZW5kZXIoKTtcbiAgICByZXR1cm4gdGhpcy5faXNNb2RpZmllciA/IHRoaXMuX29iamVjdC5tb2RpZnkocmVzdWx0KSA6IHJlc3VsdDtcbn07XG5tb2R1bGUuZXhwb3J0cyA9IFJlbmRlck5vZGU7IiwidmFyIFRyYW5zZm9ybSA9IHJlcXVpcmUoJy4vVHJhbnNmb3JtJyk7XG5mdW5jdGlvbiBTcGVjUGFyc2VyKCkge1xuICAgIHRoaXMucmVzdWx0ID0ge307XG59XG5TcGVjUGFyc2VyLl9pbnN0YW5jZSA9IG5ldyBTcGVjUGFyc2VyKCk7XG5TcGVjUGFyc2VyLnBhcnNlID0gZnVuY3Rpb24gcGFyc2Uoc3BlYywgY29udGV4dCkge1xuICAgIHJldHVybiBTcGVjUGFyc2VyLl9pbnN0YW5jZS5wYXJzZShzcGVjLCBjb250ZXh0KTtcbn07XG5TcGVjUGFyc2VyLnByb3RvdHlwZS5wYXJzZSA9IGZ1bmN0aW9uIHBhcnNlKHNwZWMsIGNvbnRleHQpIHtcbiAgICB0aGlzLnJlc2V0KCk7XG4gICAgdGhpcy5fcGFyc2VTcGVjKHNwZWMsIGNvbnRleHQsIFRyYW5zZm9ybS5pZGVudGl0eSk7XG4gICAgcmV0dXJuIHRoaXMucmVzdWx0O1xufTtcblNwZWNQYXJzZXIucHJvdG90eXBlLnJlc2V0ID0gZnVuY3Rpb24gcmVzZXQoKSB7XG4gICAgdGhpcy5yZXN1bHQgPSB7fTtcbn07XG5mdW5jdGlvbiBfdmVjSW5Db250ZXh0KHYsIG0pIHtcbiAgICByZXR1cm4gW1xuICAgICAgICB2WzBdICogbVswXSArIHZbMV0gKiBtWzRdICsgdlsyXSAqIG1bOF0sXG4gICAgICAgIHZbMF0gKiBtWzFdICsgdlsxXSAqIG1bNV0gKyB2WzJdICogbVs5XSxcbiAgICAgICAgdlswXSAqIG1bMl0gKyB2WzFdICogbVs2XSArIHZbMl0gKiBtWzEwXVxuICAgIF07XG59XG52YXIgX3plcm9aZXJvID0gW1xuICAgICAgICAwLFxuICAgICAgICAwXG4gICAgXTtcblNwZWNQYXJzZXIucHJvdG90eXBlLl9wYXJzZVNwZWMgPSBmdW5jdGlvbiBfcGFyc2VTcGVjKHNwZWMsIHBhcmVudENvbnRleHQsIHNpemVDb250ZXh0KSB7XG4gICAgdmFyIGlkO1xuICAgIHZhciB0YXJnZXQ7XG4gICAgdmFyIHRyYW5zZm9ybTtcbiAgICB2YXIgb3BhY2l0eTtcbiAgICB2YXIgb3JpZ2luO1xuICAgIHZhciBhbGlnbjtcbiAgICB2YXIgc2l6ZTtcbiAgICBpZiAodHlwZW9mIHNwZWMgPT09ICdudW1iZXInKSB7XG4gICAgICAgIGlkID0gc3BlYztcbiAgICAgICAgdHJhbnNmb3JtID0gcGFyZW50Q29udGV4dC50cmFuc2Zvcm07XG4gICAgICAgIGFsaWduID0gcGFyZW50Q29udGV4dC5hbGlnbiB8fCBfemVyb1plcm87XG4gICAgICAgIGlmIChwYXJlbnRDb250ZXh0LnNpemUgJiYgYWxpZ24gJiYgKGFsaWduWzBdIHx8IGFsaWduWzFdKSkge1xuICAgICAgICAgICAgdmFyIGFsaWduQWRqdXN0ID0gW1xuICAgICAgICAgICAgICAgICAgICBhbGlnblswXSAqIHBhcmVudENvbnRleHQuc2l6ZVswXSxcbiAgICAgICAgICAgICAgICAgICAgYWxpZ25bMV0gKiBwYXJlbnRDb250ZXh0LnNpemVbMV0sXG4gICAgICAgICAgICAgICAgICAgIDBcbiAgICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgdHJhbnNmb3JtID0gVHJhbnNmb3JtLnRoZW5Nb3ZlKHRyYW5zZm9ybSwgX3ZlY0luQ29udGV4dChhbGlnbkFkanVzdCwgc2l6ZUNvbnRleHQpKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnJlc3VsdFtpZF0gPSB7XG4gICAgICAgICAgICB0cmFuc2Zvcm06IHRyYW5zZm9ybSxcbiAgICAgICAgICAgIG9wYWNpdHk6IHBhcmVudENvbnRleHQub3BhY2l0eSxcbiAgICAgICAgICAgIG9yaWdpbjogcGFyZW50Q29udGV4dC5vcmlnaW4gfHwgX3plcm9aZXJvLFxuICAgICAgICAgICAgYWxpZ246IHBhcmVudENvbnRleHQuYWxpZ24gfHwgX3plcm9aZXJvLFxuICAgICAgICAgICAgc2l6ZTogcGFyZW50Q29udGV4dC5zaXplXG4gICAgICAgIH07XG4gICAgfSBlbHNlIGlmICghc3BlYykge1xuICAgICAgICByZXR1cm47XG4gICAgfSBlbHNlIGlmIChzcGVjIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzcGVjLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB0aGlzLl9wYXJzZVNwZWMoc3BlY1tpXSwgcGFyZW50Q29udGV4dCwgc2l6ZUNvbnRleHQpO1xuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGFyZ2V0ID0gc3BlYy50YXJnZXQ7XG4gICAgICAgIHRyYW5zZm9ybSA9IHBhcmVudENvbnRleHQudHJhbnNmb3JtO1xuICAgICAgICBvcGFjaXR5ID0gcGFyZW50Q29udGV4dC5vcGFjaXR5O1xuICAgICAgICBvcmlnaW4gPSBwYXJlbnRDb250ZXh0Lm9yaWdpbjtcbiAgICAgICAgYWxpZ24gPSBwYXJlbnRDb250ZXh0LmFsaWduO1xuICAgICAgICBzaXplID0gcGFyZW50Q29udGV4dC5zaXplO1xuICAgICAgICB2YXIgbmV4dFNpemVDb250ZXh0ID0gc2l6ZUNvbnRleHQ7XG4gICAgICAgIGlmIChzcGVjLm9wYWNpdHkgIT09IHVuZGVmaW5lZClcbiAgICAgICAgICAgIG9wYWNpdHkgPSBwYXJlbnRDb250ZXh0Lm9wYWNpdHkgKiBzcGVjLm9wYWNpdHk7XG4gICAgICAgIGlmIChzcGVjLnRyYW5zZm9ybSlcbiAgICAgICAgICAgIHRyYW5zZm9ybSA9IFRyYW5zZm9ybS5tdWx0aXBseShwYXJlbnRDb250ZXh0LnRyYW5zZm9ybSwgc3BlYy50cmFuc2Zvcm0pO1xuICAgICAgICBpZiAoc3BlYy5vcmlnaW4pIHtcbiAgICAgICAgICAgIG9yaWdpbiA9IHNwZWMub3JpZ2luO1xuICAgICAgICAgICAgbmV4dFNpemVDb250ZXh0ID0gcGFyZW50Q29udGV4dC50cmFuc2Zvcm07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHNwZWMuYWxpZ24pXG4gICAgICAgICAgICBhbGlnbiA9IHNwZWMuYWxpZ247XG4gICAgICAgIGlmIChzcGVjLnNpemUgfHwgc3BlYy5wcm9wb3J0aW9ucykge1xuICAgICAgICAgICAgdmFyIHBhcmVudFNpemUgPSBzaXplO1xuICAgICAgICAgICAgc2l6ZSA9IFtcbiAgICAgICAgICAgICAgICBzaXplWzBdLFxuICAgICAgICAgICAgICAgIHNpemVbMV1cbiAgICAgICAgICAgIF07XG4gICAgICAgICAgICBpZiAoc3BlYy5zaXplKSB7XG4gICAgICAgICAgICAgICAgaWYgKHNwZWMuc2l6ZVswXSAhPT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgICAgICAgICBzaXplWzBdID0gc3BlYy5zaXplWzBdO1xuICAgICAgICAgICAgICAgIGlmIChzcGVjLnNpemVbMV0gIT09IHVuZGVmaW5lZClcbiAgICAgICAgICAgICAgICAgICAgc2l6ZVsxXSA9IHNwZWMuc2l6ZVsxXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChzcGVjLnByb3BvcnRpb25zKSB7XG4gICAgICAgICAgICAgICAgaWYgKHNwZWMucHJvcG9ydGlvbnNbMF0gIT09IHVuZGVmaW5lZClcbiAgICAgICAgICAgICAgICAgICAgc2l6ZVswXSA9IHNpemVbMF0gKiBzcGVjLnByb3BvcnRpb25zWzBdO1xuICAgICAgICAgICAgICAgIGlmIChzcGVjLnByb3BvcnRpb25zWzFdICE9PSB1bmRlZmluZWQpXG4gICAgICAgICAgICAgICAgICAgIHNpemVbMV0gPSBzaXplWzFdICogc3BlYy5wcm9wb3J0aW9uc1sxXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChwYXJlbnRTaXplKSB7XG4gICAgICAgICAgICAgICAgaWYgKGFsaWduICYmIChhbGlnblswXSB8fCBhbGlnblsxXSkpXG4gICAgICAgICAgICAgICAgICAgIHRyYW5zZm9ybSA9IFRyYW5zZm9ybS50aGVuTW92ZSh0cmFuc2Zvcm0sIF92ZWNJbkNvbnRleHQoW1xuICAgICAgICAgICAgICAgICAgICAgICAgYWxpZ25bMF0gKiBwYXJlbnRTaXplWzBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgYWxpZ25bMV0gKiBwYXJlbnRTaXplWzFdLFxuICAgICAgICAgICAgICAgICAgICAgICAgMFxuICAgICAgICAgICAgICAgICAgICBdLCBzaXplQ29udGV4dCkpO1xuICAgICAgICAgICAgICAgIGlmIChvcmlnaW4gJiYgKG9yaWdpblswXSB8fCBvcmlnaW5bMV0pKVxuICAgICAgICAgICAgICAgICAgICB0cmFuc2Zvcm0gPSBUcmFuc2Zvcm0ubW92ZVRoZW4oW1xuICAgICAgICAgICAgICAgICAgICAgICAgLW9yaWdpblswXSAqIHNpemVbMF0sXG4gICAgICAgICAgICAgICAgICAgICAgICAtb3JpZ2luWzFdICogc2l6ZVsxXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIDBcbiAgICAgICAgICAgICAgICAgICAgXSwgdHJhbnNmb3JtKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG5leHRTaXplQ29udGV4dCA9IHBhcmVudENvbnRleHQudHJhbnNmb3JtO1xuICAgICAgICAgICAgb3JpZ2luID0gbnVsbDtcbiAgICAgICAgICAgIGFsaWduID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9wYXJzZVNwZWModGFyZ2V0LCB7XG4gICAgICAgICAgICB0cmFuc2Zvcm06IHRyYW5zZm9ybSxcbiAgICAgICAgICAgIG9wYWNpdHk6IG9wYWNpdHksXG4gICAgICAgICAgICBvcmlnaW46IG9yaWdpbixcbiAgICAgICAgICAgIGFsaWduOiBhbGlnbixcbiAgICAgICAgICAgIHNpemU6IHNpemVcbiAgICAgICAgfSwgbmV4dFNpemVDb250ZXh0KTtcbiAgICB9XG59O1xubW9kdWxlLmV4cG9ydHMgPSBTcGVjUGFyc2VyOyIsInZhciBFbGVtZW50T3V0cHV0ID0gcmVxdWlyZSgnLi9FbGVtZW50T3V0cHV0Jyk7XG5mdW5jdGlvbiBTdXJmYWNlKG9wdGlvbnMpIHtcbiAgICBFbGVtZW50T3V0cHV0LmNhbGwodGhpcyk7XG4gICAgdGhpcy5vcHRpb25zID0ge307XG4gICAgdGhpcy5wcm9wZXJ0aWVzID0ge307XG4gICAgdGhpcy5hdHRyaWJ1dGVzID0ge307XG4gICAgdGhpcy5jb250ZW50ID0gJyc7XG4gICAgdGhpcy5jbGFzc0xpc3QgPSBbXTtcbiAgICB0aGlzLnNpemUgPSBudWxsO1xuICAgIHRoaXMuX2NsYXNzZXNEaXJ0eSA9IHRydWU7XG4gICAgdGhpcy5fc3R5bGVzRGlydHkgPSB0cnVlO1xuICAgIHRoaXMuX2F0dHJpYnV0ZXNEaXJ0eSA9IHRydWU7XG4gICAgdGhpcy5fc2l6ZURpcnR5ID0gdHJ1ZTtcbiAgICB0aGlzLl9jb250ZW50RGlydHkgPSB0cnVlO1xuICAgIHRoaXMuX3RydWVTaXplQ2hlY2sgPSB0cnVlO1xuICAgIHRoaXMuX2RpcnR5Q2xhc3NlcyA9IFtdO1xuICAgIGlmIChvcHRpb25zKVxuICAgICAgICB0aGlzLnNldE9wdGlvbnMob3B0aW9ucyk7XG4gICAgdGhpcy5fY3VycmVudFRhcmdldCA9IG51bGw7XG59XG5TdXJmYWNlLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoRWxlbWVudE91dHB1dC5wcm90b3R5cGUpO1xuU3VyZmFjZS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBTdXJmYWNlO1xuU3VyZmFjZS5wcm90b3R5cGUuZWxlbWVudFR5cGUgPSAnZGl2JztcblN1cmZhY2UucHJvdG90eXBlLmVsZW1lbnRDbGFzcyA9ICdmYW1vdXMtc3VyZmFjZSc7XG5TdXJmYWNlLnByb3RvdHlwZS5zZXRBdHRyaWJ1dGVzID0gZnVuY3Rpb24gc2V0QXR0cmlidXRlcyhhdHRyaWJ1dGVzKSB7XG4gICAgZm9yICh2YXIgbiBpbiBhdHRyaWJ1dGVzKSB7XG4gICAgICAgIGlmIChuID09PSAnc3R5bGUnKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3Qgc2V0IHN0eWxlcyB2aWEgXCJzZXRBdHRyaWJ1dGVzXCIgYXMgaXQgd2lsbCBicmVhayBGYW1vLnVzLiAgVXNlIFwic2V0UHJvcGVydGllc1wiIGluc3RlYWQuJyk7XG4gICAgICAgIHRoaXMuYXR0cmlidXRlc1tuXSA9IGF0dHJpYnV0ZXNbbl07XG4gICAgfVxuICAgIHRoaXMuX2F0dHJpYnV0ZXNEaXJ0eSA9IHRydWU7XG59O1xuU3VyZmFjZS5wcm90b3R5cGUuZ2V0QXR0cmlidXRlcyA9IGZ1bmN0aW9uIGdldEF0dHJpYnV0ZXMoKSB7XG4gICAgcmV0dXJuIHRoaXMuYXR0cmlidXRlcztcbn07XG5TdXJmYWNlLnByb3RvdHlwZS5zZXRQcm9wZXJ0aWVzID0gZnVuY3Rpb24gc2V0UHJvcGVydGllcyhwcm9wZXJ0aWVzKSB7XG4gICAgZm9yICh2YXIgbiBpbiBwcm9wZXJ0aWVzKSB7XG4gICAgICAgIHRoaXMucHJvcGVydGllc1tuXSA9IHByb3BlcnRpZXNbbl07XG4gICAgfVxuICAgIHRoaXMuX3N0eWxlc0RpcnR5ID0gdHJ1ZTtcbiAgICByZXR1cm4gdGhpcztcbn07XG5TdXJmYWNlLnByb3RvdHlwZS5nZXRQcm9wZXJ0aWVzID0gZnVuY3Rpb24gZ2V0UHJvcGVydGllcygpIHtcbiAgICByZXR1cm4gdGhpcy5wcm9wZXJ0aWVzO1xufTtcblN1cmZhY2UucHJvdG90eXBlLmFkZENsYXNzID0gZnVuY3Rpb24gYWRkQ2xhc3MoY2xhc3NOYW1lKSB7XG4gICAgaWYgKHRoaXMuY2xhc3NMaXN0LmluZGV4T2YoY2xhc3NOYW1lKSA8IDApIHtcbiAgICAgICAgdGhpcy5jbGFzc0xpc3QucHVzaChjbGFzc05hbWUpO1xuICAgICAgICB0aGlzLl9jbGFzc2VzRGlydHkgPSB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbn07XG5TdXJmYWNlLnByb3RvdHlwZS5yZW1vdmVDbGFzcyA9IGZ1bmN0aW9uIHJlbW92ZUNsYXNzKGNsYXNzTmFtZSkge1xuICAgIHZhciBpID0gdGhpcy5jbGFzc0xpc3QuaW5kZXhPZihjbGFzc05hbWUpO1xuICAgIGlmIChpID49IDApIHtcbiAgICAgICAgdGhpcy5fZGlydHlDbGFzc2VzLnB1c2godGhpcy5jbGFzc0xpc3Quc3BsaWNlKGksIDEpWzBdKTtcbiAgICAgICAgdGhpcy5fY2xhc3Nlc0RpcnR5ID0gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuU3VyZmFjZS5wcm90b3R5cGUudG9nZ2xlQ2xhc3MgPSBmdW5jdGlvbiB0b2dnbGVDbGFzcyhjbGFzc05hbWUpIHtcbiAgICB2YXIgaSA9IHRoaXMuY2xhc3NMaXN0LmluZGV4T2YoY2xhc3NOYW1lKTtcbiAgICBpZiAoaSA+PSAwKSB7XG4gICAgICAgIHRoaXMucmVtb3ZlQ2xhc3MoY2xhc3NOYW1lKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmFkZENsYXNzKGNsYXNzTmFtZSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xufTtcblN1cmZhY2UucHJvdG90eXBlLnNldENsYXNzZXMgPSBmdW5jdGlvbiBzZXRDbGFzc2VzKGNsYXNzTGlzdCkge1xuICAgIHZhciBpID0gMDtcbiAgICB2YXIgcmVtb3ZhbCA9IFtdO1xuICAgIGZvciAoaSA9IDA7IGkgPCB0aGlzLmNsYXNzTGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoY2xhc3NMaXN0LmluZGV4T2YodGhpcy5jbGFzc0xpc3RbaV0pIDwgMClcbiAgICAgICAgICAgIHJlbW92YWwucHVzaCh0aGlzLmNsYXNzTGlzdFtpXSk7XG4gICAgfVxuICAgIGZvciAoaSA9IDA7IGkgPCByZW1vdmFsLmxlbmd0aDsgaSsrKVxuICAgICAgICB0aGlzLnJlbW92ZUNsYXNzKHJlbW92YWxbaV0pO1xuICAgIGZvciAoaSA9IDA7IGkgPCBjbGFzc0xpc3QubGVuZ3RoOyBpKyspXG4gICAgICAgIHRoaXMuYWRkQ2xhc3MoY2xhc3NMaXN0W2ldKTtcbiAgICByZXR1cm4gdGhpcztcbn07XG5TdXJmYWNlLnByb3RvdHlwZS5nZXRDbGFzc0xpc3QgPSBmdW5jdGlvbiBnZXRDbGFzc0xpc3QoKSB7XG4gICAgcmV0dXJuIHRoaXMuY2xhc3NMaXN0O1xufTtcblN1cmZhY2UucHJvdG90eXBlLnNldENvbnRlbnQgPSBmdW5jdGlvbiBzZXRDb250ZW50KGNvbnRlbnQpIHtcbiAgICBpZiAodGhpcy5jb250ZW50ICE9PSBjb250ZW50KSB7XG4gICAgICAgIHRoaXMuY29udGVudCA9IGNvbnRlbnQ7XG4gICAgICAgIHRoaXMuX2NvbnRlbnREaXJ0eSA9IHRydWU7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xufTtcblN1cmZhY2UucHJvdG90eXBlLmdldENvbnRlbnQgPSBmdW5jdGlvbiBnZXRDb250ZW50KCkge1xuICAgIHJldHVybiB0aGlzLmNvbnRlbnQ7XG59O1xuU3VyZmFjZS5wcm90b3R5cGUuc2V0T3B0aW9ucyA9IGZ1bmN0aW9uIHNldE9wdGlvbnMob3B0aW9ucykge1xuICAgIGlmIChvcHRpb25zLnNpemUpXG4gICAgICAgIHRoaXMuc2V0U2l6ZShvcHRpb25zLnNpemUpO1xuICAgIGlmIChvcHRpb25zLmNsYXNzZXMpXG4gICAgICAgIHRoaXMuc2V0Q2xhc3NlcyhvcHRpb25zLmNsYXNzZXMpO1xuICAgIGlmIChvcHRpb25zLnByb3BlcnRpZXMpXG4gICAgICAgIHRoaXMuc2V0UHJvcGVydGllcyhvcHRpb25zLnByb3BlcnRpZXMpO1xuICAgIGlmIChvcHRpb25zLmF0dHJpYnV0ZXMpXG4gICAgICAgIHRoaXMuc2V0QXR0cmlidXRlcyhvcHRpb25zLmF0dHJpYnV0ZXMpO1xuICAgIGlmIChvcHRpb25zLmNvbnRlbnQpXG4gICAgICAgIHRoaXMuc2V0Q29udGVudChvcHRpb25zLmNvbnRlbnQpO1xuICAgIHJldHVybiB0aGlzO1xufTtcbmZ1bmN0aW9uIF9jbGVhbnVwQ2xhc3Nlcyh0YXJnZXQpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuX2RpcnR5Q2xhc3Nlcy5sZW5ndGg7IGkrKylcbiAgICAgICAgdGFyZ2V0LmNsYXNzTGlzdC5yZW1vdmUodGhpcy5fZGlydHlDbGFzc2VzW2ldKTtcbiAgICB0aGlzLl9kaXJ0eUNsYXNzZXMgPSBbXTtcbn1cbmZ1bmN0aW9uIF9hcHBseVN0eWxlcyh0YXJnZXQpIHtcbiAgICBmb3IgKHZhciBuIGluIHRoaXMucHJvcGVydGllcykge1xuICAgICAgICB0YXJnZXQuc3R5bGVbbl0gPSB0aGlzLnByb3BlcnRpZXNbbl07XG4gICAgfVxufVxuZnVuY3Rpb24gX2NsZWFudXBTdHlsZXModGFyZ2V0KSB7XG4gICAgZm9yICh2YXIgbiBpbiB0aGlzLnByb3BlcnRpZXMpIHtcbiAgICAgICAgdGFyZ2V0LnN0eWxlW25dID0gJyc7XG4gICAgfVxufVxuZnVuY3Rpb24gX2FwcGx5QXR0cmlidXRlcyh0YXJnZXQpIHtcbiAgICBmb3IgKHZhciBuIGluIHRoaXMuYXR0cmlidXRlcykge1xuICAgICAgICB0YXJnZXQuc2V0QXR0cmlidXRlKG4sIHRoaXMuYXR0cmlidXRlc1tuXSk7XG4gICAgfVxufVxuZnVuY3Rpb24gX2NsZWFudXBBdHRyaWJ1dGVzKHRhcmdldCkge1xuICAgIGZvciAodmFyIG4gaW4gdGhpcy5hdHRyaWJ1dGVzKSB7XG4gICAgICAgIHRhcmdldC5yZW1vdmVBdHRyaWJ1dGUobik7XG4gICAgfVxufVxuZnVuY3Rpb24gX3h5Tm90RXF1YWxzKGEsIGIpIHtcbiAgICByZXR1cm4gYSAmJiBiID8gYVswXSAhPT0gYlswXSB8fCBhWzFdICE9PSBiWzFdIDogYSAhPT0gYjtcbn1cblN1cmZhY2UucHJvdG90eXBlLnNldHVwID0gZnVuY3Rpb24gc2V0dXAoYWxsb2NhdG9yKSB7XG4gICAgdmFyIHRhcmdldCA9IGFsbG9jYXRvci5hbGxvY2F0ZSh0aGlzLmVsZW1lbnRUeXBlKTtcbiAgICBpZiAodGhpcy5lbGVtZW50Q2xhc3MpIHtcbiAgICAgICAgaWYgKHRoaXMuZWxlbWVudENsYXNzIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5lbGVtZW50Q2xhc3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICB0YXJnZXQuY2xhc3NMaXN0LmFkZCh0aGlzLmVsZW1lbnRDbGFzc1tpXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0YXJnZXQuY2xhc3NMaXN0LmFkZCh0aGlzLmVsZW1lbnRDbGFzcyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgdGFyZ2V0LnN0eWxlLmRpc3BsYXkgPSAnJztcbiAgICB0aGlzLmF0dGFjaCh0YXJnZXQpO1xuICAgIHRoaXMuX29wYWNpdHkgPSBudWxsO1xuICAgIHRoaXMuX2N1cnJlbnRUYXJnZXQgPSB0YXJnZXQ7XG4gICAgdGhpcy5fc3R5bGVzRGlydHkgPSB0cnVlO1xuICAgIHRoaXMuX2NsYXNzZXNEaXJ0eSA9IHRydWU7XG4gICAgdGhpcy5fYXR0cmlidXRlc0RpcnR5ID0gdHJ1ZTtcbiAgICB0aGlzLl9zaXplRGlydHkgPSB0cnVlO1xuICAgIHRoaXMuX2NvbnRlbnREaXJ0eSA9IHRydWU7XG4gICAgdGhpcy5fb3JpZ2luRGlydHkgPSB0cnVlO1xuICAgIHRoaXMuX3RyYW5zZm9ybURpcnR5ID0gdHJ1ZTtcbn07XG5TdXJmYWNlLnByb3RvdHlwZS5jb21taXQgPSBmdW5jdGlvbiBjb21taXQoY29udGV4dCkge1xuICAgIGlmICghdGhpcy5fY3VycmVudFRhcmdldClcbiAgICAgICAgdGhpcy5zZXR1cChjb250ZXh0LmFsbG9jYXRvcik7XG4gICAgdmFyIHRhcmdldCA9IHRoaXMuX2N1cnJlbnRUYXJnZXQ7XG4gICAgdmFyIHNpemUgPSBjb250ZXh0LnNpemU7XG4gICAgaWYgKHRoaXMuX2NsYXNzZXNEaXJ0eSkge1xuICAgICAgICBfY2xlYW51cENsYXNzZXMuY2FsbCh0aGlzLCB0YXJnZXQpO1xuICAgICAgICB2YXIgY2xhc3NMaXN0ID0gdGhpcy5nZXRDbGFzc0xpc3QoKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjbGFzc0xpc3QubGVuZ3RoOyBpKyspXG4gICAgICAgICAgICB0YXJnZXQuY2xhc3NMaXN0LmFkZChjbGFzc0xpc3RbaV0pO1xuICAgICAgICB0aGlzLl9jbGFzc2VzRGlydHkgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5fdHJ1ZVNpemVDaGVjayA9IHRydWU7XG4gICAgfVxuICAgIGlmICh0aGlzLl9zdHlsZXNEaXJ0eSkge1xuICAgICAgICBfYXBwbHlTdHlsZXMuY2FsbCh0aGlzLCB0YXJnZXQpO1xuICAgICAgICB0aGlzLl9zdHlsZXNEaXJ0eSA9IGZhbHNlO1xuICAgICAgICB0aGlzLl90cnVlU2l6ZUNoZWNrID0gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKHRoaXMuX2F0dHJpYnV0ZXNEaXJ0eSkge1xuICAgICAgICBfYXBwbHlBdHRyaWJ1dGVzLmNhbGwodGhpcywgdGFyZ2V0KTtcbiAgICAgICAgdGhpcy5fYXR0cmlidXRlc0RpcnR5ID0gZmFsc2U7XG4gICAgICAgIHRoaXMuX3RydWVTaXplQ2hlY2sgPSB0cnVlO1xuICAgIH1cbiAgICBpZiAodGhpcy5zaXplKSB7XG4gICAgICAgIHZhciBvcmlnU2l6ZSA9IGNvbnRleHQuc2l6ZTtcbiAgICAgICAgc2l6ZSA9IFtcbiAgICAgICAgICAgIHRoaXMuc2l6ZVswXSxcbiAgICAgICAgICAgIHRoaXMuc2l6ZVsxXVxuICAgICAgICBdO1xuICAgICAgICBpZiAoc2l6ZVswXSA9PT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgc2l6ZVswXSA9IG9yaWdTaXplWzBdO1xuICAgICAgICBpZiAoc2l6ZVsxXSA9PT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgc2l6ZVsxXSA9IG9yaWdTaXplWzFdO1xuICAgICAgICBpZiAoc2l6ZVswXSA9PT0gdHJ1ZSB8fCBzaXplWzFdID09PSB0cnVlKSB7XG4gICAgICAgICAgICBpZiAoc2l6ZVswXSA9PT0gdHJ1ZSAmJiAodGhpcy5fdHJ1ZVNpemVDaGVjayB8fCB0aGlzLl9zaXplWzBdID09PSAwKSkge1xuICAgICAgICAgICAgICAgIHZhciB3aWR0aCA9IHRhcmdldC5vZmZzZXRXaWR0aDtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fc2l6ZSAmJiB0aGlzLl9zaXplWzBdICE9PSB3aWR0aCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9zaXplWzBdID0gd2lkdGg7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3NpemVEaXJ0eSA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHNpemVbMF0gPSB3aWR0aDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX3NpemUpXG4gICAgICAgICAgICAgICAgICAgIHNpemVbMF0gPSB0aGlzLl9zaXplWzBdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHNpemVbMV0gPT09IHRydWUgJiYgKHRoaXMuX3RydWVTaXplQ2hlY2sgfHwgdGhpcy5fc2l6ZVsxXSA9PT0gMCkpIHtcbiAgICAgICAgICAgICAgICB2YXIgaGVpZ2h0ID0gdGFyZ2V0Lm9mZnNldEhlaWdodDtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fc2l6ZSAmJiB0aGlzLl9zaXplWzFdICE9PSBoZWlnaHQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fc2l6ZVsxXSA9IGhlaWdodDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fc2l6ZURpcnR5ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgc2l6ZVsxXSA9IGhlaWdodDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX3NpemUpXG4gICAgICAgICAgICAgICAgICAgIHNpemVbMV0gPSB0aGlzLl9zaXplWzFdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5fdHJ1ZVNpemVDaGVjayA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChfeHlOb3RFcXVhbHModGhpcy5fc2l6ZSwgc2l6ZSkpIHtcbiAgICAgICAgaWYgKCF0aGlzLl9zaXplKVxuICAgICAgICAgICAgdGhpcy5fc2l6ZSA9IFtcbiAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgIDBcbiAgICAgICAgICAgIF07XG4gICAgICAgIHRoaXMuX3NpemVbMF0gPSBzaXplWzBdO1xuICAgICAgICB0aGlzLl9zaXplWzFdID0gc2l6ZVsxXTtcbiAgICAgICAgdGhpcy5fc2l6ZURpcnR5ID0gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKHRoaXMuX3NpemVEaXJ0eSkge1xuICAgICAgICBpZiAodGhpcy5fc2l6ZSkge1xuICAgICAgICAgICAgdGFyZ2V0LnN0eWxlLndpZHRoID0gdGhpcy5zaXplICYmIHRoaXMuc2l6ZVswXSA9PT0gdHJ1ZSA/ICcnIDogdGhpcy5fc2l6ZVswXSArICdweCc7XG4gICAgICAgICAgICB0YXJnZXQuc3R5bGUuaGVpZ2h0ID0gdGhpcy5zaXplICYmIHRoaXMuc2l6ZVsxXSA9PT0gdHJ1ZSA/ICcnIDogdGhpcy5fc2l6ZVsxXSArICdweCc7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fZXZlbnRPdXRwdXQuZW1pdCgncmVzaXplJyk7XG4gICAgfVxuICAgIGlmICh0aGlzLl9jb250ZW50RGlydHkpIHtcbiAgICAgICAgdGhpcy5kZXBsb3kodGFyZ2V0KTtcbiAgICAgICAgdGhpcy5fZXZlbnRPdXRwdXQuZW1pdCgnZGVwbG95Jyk7XG4gICAgICAgIHRoaXMuX2NvbnRlbnREaXJ0eSA9IGZhbHNlO1xuICAgICAgICB0aGlzLl90cnVlU2l6ZUNoZWNrID0gdHJ1ZTtcbiAgICB9XG4gICAgRWxlbWVudE91dHB1dC5wcm90b3R5cGUuY29tbWl0LmNhbGwodGhpcywgY29udGV4dCk7XG59O1xuU3VyZmFjZS5wcm90b3R5cGUuY2xlYW51cCA9IGZ1bmN0aW9uIGNsZWFudXAoYWxsb2NhdG9yKSB7XG4gICAgdmFyIGkgPSAwO1xuICAgIHZhciB0YXJnZXQgPSB0aGlzLl9jdXJyZW50VGFyZ2V0O1xuICAgIHRoaXMuX2V2ZW50T3V0cHV0LmVtaXQoJ3JlY2FsbCcpO1xuICAgIHRoaXMucmVjYWxsKHRhcmdldCk7XG4gICAgdGFyZ2V0LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgdGFyZ2V0LnN0eWxlLm9wYWNpdHkgPSAnJztcbiAgICB0YXJnZXQuc3R5bGUud2lkdGggPSAnJztcbiAgICB0YXJnZXQuc3R5bGUuaGVpZ2h0ID0gJyc7XG4gICAgX2NsZWFudXBTdHlsZXMuY2FsbCh0aGlzLCB0YXJnZXQpO1xuICAgIF9jbGVhbnVwQXR0cmlidXRlcy5jYWxsKHRoaXMsIHRhcmdldCk7XG4gICAgdmFyIGNsYXNzTGlzdCA9IHRoaXMuZ2V0Q2xhc3NMaXN0KCk7XG4gICAgX2NsZWFudXBDbGFzc2VzLmNhbGwodGhpcywgdGFyZ2V0KTtcbiAgICBmb3IgKGkgPSAwOyBpIDwgY2xhc3NMaXN0Lmxlbmd0aDsgaSsrKVxuICAgICAgICB0YXJnZXQuY2xhc3NMaXN0LnJlbW92ZShjbGFzc0xpc3RbaV0pO1xuICAgIGlmICh0aGlzLmVsZW1lbnRDbGFzcykge1xuICAgICAgICBpZiAodGhpcy5lbGVtZW50Q2xhc3MgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IHRoaXMuZWxlbWVudENsYXNzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdGFyZ2V0LmNsYXNzTGlzdC5yZW1vdmUodGhpcy5lbGVtZW50Q2xhc3NbaV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGFyZ2V0LmNsYXNzTGlzdC5yZW1vdmUodGhpcy5lbGVtZW50Q2xhc3MpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHRoaXMuZGV0YWNoKHRhcmdldCk7XG4gICAgdGhpcy5fY3VycmVudFRhcmdldCA9IG51bGw7XG4gICAgYWxsb2NhdG9yLmRlYWxsb2NhdGUodGFyZ2V0KTtcbn07XG5TdXJmYWNlLnByb3RvdHlwZS5kZXBsb3kgPSBmdW5jdGlvbiBkZXBsb3kodGFyZ2V0KSB7XG4gICAgdmFyIGNvbnRlbnQgPSB0aGlzLmdldENvbnRlbnQoKTtcbiAgICBpZiAoY29udGVudCBpbnN0YW5jZW9mIE5vZGUpIHtcbiAgICAgICAgd2hpbGUgKHRhcmdldC5oYXNDaGlsZE5vZGVzKCkpXG4gICAgICAgICAgICB0YXJnZXQucmVtb3ZlQ2hpbGQodGFyZ2V0LmZpcnN0Q2hpbGQpO1xuICAgICAgICB0YXJnZXQuYXBwZW5kQ2hpbGQoY29udGVudCk7XG4gICAgfSBlbHNlXG4gICAgICAgIHRhcmdldC5pbm5lckhUTUwgPSBjb250ZW50O1xufTtcblN1cmZhY2UucHJvdG90eXBlLnJlY2FsbCA9IGZ1bmN0aW9uIHJlY2FsbCh0YXJnZXQpIHtcbiAgICB2YXIgZGYgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XG4gICAgd2hpbGUgKHRhcmdldC5oYXNDaGlsZE5vZGVzKCkpXG4gICAgICAgIGRmLmFwcGVuZENoaWxkKHRhcmdldC5maXJzdENoaWxkKTtcbiAgICB0aGlzLnNldENvbnRlbnQoZGYpO1xufTtcblN1cmZhY2UucHJvdG90eXBlLmdldFNpemUgPSBmdW5jdGlvbiBnZXRTaXplKCkge1xuICAgIHJldHVybiB0aGlzLl9zaXplID8gdGhpcy5fc2l6ZSA6IHRoaXMuc2l6ZTtcbn07XG5TdXJmYWNlLnByb3RvdHlwZS5zZXRTaXplID0gZnVuY3Rpb24gc2V0U2l6ZShzaXplKSB7XG4gICAgdGhpcy5zaXplID0gc2l6ZSA/IFtcbiAgICAgICAgc2l6ZVswXSxcbiAgICAgICAgc2l6ZVsxXVxuICAgIF0gOiBudWxsO1xuICAgIHRoaXMuX3NpemVEaXJ0eSA9IHRydWU7XG4gICAgcmV0dXJuIHRoaXM7XG59O1xubW9kdWxlLmV4cG9ydHMgPSBTdXJmYWNlOyIsInZhciBUcmFuc2Zvcm0gPSB7fTtcblRyYW5zZm9ybS5wcmVjaXNpb24gPSAwLjAwMDAwMTtcblRyYW5zZm9ybS5pZGVudGl0eSA9IFtcbiAgICAxLFxuICAgIDAsXG4gICAgMCxcbiAgICAwLFxuICAgIDAsXG4gICAgMSxcbiAgICAwLFxuICAgIDAsXG4gICAgMCxcbiAgICAwLFxuICAgIDEsXG4gICAgMCxcbiAgICAwLFxuICAgIDAsXG4gICAgMCxcbiAgICAxXG5dO1xuVHJhbnNmb3JtLm11bHRpcGx5NHg0ID0gZnVuY3Rpb24gbXVsdGlwbHk0eDQoYSwgYikge1xuICAgIHJldHVybiBbXG4gICAgICAgIGFbMF0gKiBiWzBdICsgYVs0XSAqIGJbMV0gKyBhWzhdICogYlsyXSArIGFbMTJdICogYlszXSxcbiAgICAgICAgYVsxXSAqIGJbMF0gKyBhWzVdICogYlsxXSArIGFbOV0gKiBiWzJdICsgYVsxM10gKiBiWzNdLFxuICAgICAgICBhWzJdICogYlswXSArIGFbNl0gKiBiWzFdICsgYVsxMF0gKiBiWzJdICsgYVsxNF0gKiBiWzNdLFxuICAgICAgICBhWzNdICogYlswXSArIGFbN10gKiBiWzFdICsgYVsxMV0gKiBiWzJdICsgYVsxNV0gKiBiWzNdLFxuICAgICAgICBhWzBdICogYls0XSArIGFbNF0gKiBiWzVdICsgYVs4XSAqIGJbNl0gKyBhWzEyXSAqIGJbN10sXG4gICAgICAgIGFbMV0gKiBiWzRdICsgYVs1XSAqIGJbNV0gKyBhWzldICogYls2XSArIGFbMTNdICogYls3XSxcbiAgICAgICAgYVsyXSAqIGJbNF0gKyBhWzZdICogYls1XSArIGFbMTBdICogYls2XSArIGFbMTRdICogYls3XSxcbiAgICAgICAgYVszXSAqIGJbNF0gKyBhWzddICogYls1XSArIGFbMTFdICogYls2XSArIGFbMTVdICogYls3XSxcbiAgICAgICAgYVswXSAqIGJbOF0gKyBhWzRdICogYls5XSArIGFbOF0gKiBiWzEwXSArIGFbMTJdICogYlsxMV0sXG4gICAgICAgIGFbMV0gKiBiWzhdICsgYVs1XSAqIGJbOV0gKyBhWzldICogYlsxMF0gKyBhWzEzXSAqIGJbMTFdLFxuICAgICAgICBhWzJdICogYls4XSArIGFbNl0gKiBiWzldICsgYVsxMF0gKiBiWzEwXSArIGFbMTRdICogYlsxMV0sXG4gICAgICAgIGFbM10gKiBiWzhdICsgYVs3XSAqIGJbOV0gKyBhWzExXSAqIGJbMTBdICsgYVsxNV0gKiBiWzExXSxcbiAgICAgICAgYVswXSAqIGJbMTJdICsgYVs0XSAqIGJbMTNdICsgYVs4XSAqIGJbMTRdICsgYVsxMl0gKiBiWzE1XSxcbiAgICAgICAgYVsxXSAqIGJbMTJdICsgYVs1XSAqIGJbMTNdICsgYVs5XSAqIGJbMTRdICsgYVsxM10gKiBiWzE1XSxcbiAgICAgICAgYVsyXSAqIGJbMTJdICsgYVs2XSAqIGJbMTNdICsgYVsxMF0gKiBiWzE0XSArIGFbMTRdICogYlsxNV0sXG4gICAgICAgIGFbM10gKiBiWzEyXSArIGFbN10gKiBiWzEzXSArIGFbMTFdICogYlsxNF0gKyBhWzE1XSAqIGJbMTVdXG4gICAgXTtcbn07XG5UcmFuc2Zvcm0ubXVsdGlwbHkgPSBmdW5jdGlvbiBtdWx0aXBseShhLCBiKSB7XG4gICAgcmV0dXJuIFtcbiAgICAgICAgYVswXSAqIGJbMF0gKyBhWzRdICogYlsxXSArIGFbOF0gKiBiWzJdLFxuICAgICAgICBhWzFdICogYlswXSArIGFbNV0gKiBiWzFdICsgYVs5XSAqIGJbMl0sXG4gICAgICAgIGFbMl0gKiBiWzBdICsgYVs2XSAqIGJbMV0gKyBhWzEwXSAqIGJbMl0sXG4gICAgICAgIDAsXG4gICAgICAgIGFbMF0gKiBiWzRdICsgYVs0XSAqIGJbNV0gKyBhWzhdICogYls2XSxcbiAgICAgICAgYVsxXSAqIGJbNF0gKyBhWzVdICogYls1XSArIGFbOV0gKiBiWzZdLFxuICAgICAgICBhWzJdICogYls0XSArIGFbNl0gKiBiWzVdICsgYVsxMF0gKiBiWzZdLFxuICAgICAgICAwLFxuICAgICAgICBhWzBdICogYls4XSArIGFbNF0gKiBiWzldICsgYVs4XSAqIGJbMTBdLFxuICAgICAgICBhWzFdICogYls4XSArIGFbNV0gKiBiWzldICsgYVs5XSAqIGJbMTBdLFxuICAgICAgICBhWzJdICogYls4XSArIGFbNl0gKiBiWzldICsgYVsxMF0gKiBiWzEwXSxcbiAgICAgICAgMCxcbiAgICAgICAgYVswXSAqIGJbMTJdICsgYVs0XSAqIGJbMTNdICsgYVs4XSAqIGJbMTRdICsgYVsxMl0sXG4gICAgICAgIGFbMV0gKiBiWzEyXSArIGFbNV0gKiBiWzEzXSArIGFbOV0gKiBiWzE0XSArIGFbMTNdLFxuICAgICAgICBhWzJdICogYlsxMl0gKyBhWzZdICogYlsxM10gKyBhWzEwXSAqIGJbMTRdICsgYVsxNF0sXG4gICAgICAgIDFcbiAgICBdO1xufTtcblRyYW5zZm9ybS50aGVuTW92ZSA9IGZ1bmN0aW9uIHRoZW5Nb3ZlKG0sIHQpIHtcbiAgICBpZiAoIXRbMl0pXG4gICAgICAgIHRbMl0gPSAwO1xuICAgIHJldHVybiBbXG4gICAgICAgIG1bMF0sXG4gICAgICAgIG1bMV0sXG4gICAgICAgIG1bMl0sXG4gICAgICAgIDAsXG4gICAgICAgIG1bNF0sXG4gICAgICAgIG1bNV0sXG4gICAgICAgIG1bNl0sXG4gICAgICAgIDAsXG4gICAgICAgIG1bOF0sXG4gICAgICAgIG1bOV0sXG4gICAgICAgIG1bMTBdLFxuICAgICAgICAwLFxuICAgICAgICBtWzEyXSArIHRbMF0sXG4gICAgICAgIG1bMTNdICsgdFsxXSxcbiAgICAgICAgbVsxNF0gKyB0WzJdLFxuICAgICAgICAxXG4gICAgXTtcbn07XG5UcmFuc2Zvcm0ubW92ZVRoZW4gPSBmdW5jdGlvbiBtb3ZlVGhlbih2LCBtKSB7XG4gICAgaWYgKCF2WzJdKVxuICAgICAgICB2WzJdID0gMDtcbiAgICB2YXIgdDAgPSB2WzBdICogbVswXSArIHZbMV0gKiBtWzRdICsgdlsyXSAqIG1bOF07XG4gICAgdmFyIHQxID0gdlswXSAqIG1bMV0gKyB2WzFdICogbVs1XSArIHZbMl0gKiBtWzldO1xuICAgIHZhciB0MiA9IHZbMF0gKiBtWzJdICsgdlsxXSAqIG1bNl0gKyB2WzJdICogbVsxMF07XG4gICAgcmV0dXJuIFRyYW5zZm9ybS50aGVuTW92ZShtLCBbXG4gICAgICAgIHQwLFxuICAgICAgICB0MSxcbiAgICAgICAgdDJcbiAgICBdKTtcbn07XG5UcmFuc2Zvcm0udHJhbnNsYXRlID0gZnVuY3Rpb24gdHJhbnNsYXRlKHgsIHksIHopIHtcbiAgICBpZiAoeiA9PT0gdW5kZWZpbmVkKVxuICAgICAgICB6ID0gMDtcbiAgICByZXR1cm4gW1xuICAgICAgICAxLFxuICAgICAgICAwLFxuICAgICAgICAwLFxuICAgICAgICAwLFxuICAgICAgICAwLFxuICAgICAgICAxLFxuICAgICAgICAwLFxuICAgICAgICAwLFxuICAgICAgICAwLFxuICAgICAgICAwLFxuICAgICAgICAxLFxuICAgICAgICAwLFxuICAgICAgICB4LFxuICAgICAgICB5LFxuICAgICAgICB6LFxuICAgICAgICAxXG4gICAgXTtcbn07XG5UcmFuc2Zvcm0udGhlblNjYWxlID0gZnVuY3Rpb24gdGhlblNjYWxlKG0sIHMpIHtcbiAgICByZXR1cm4gW1xuICAgICAgICBzWzBdICogbVswXSxcbiAgICAgICAgc1sxXSAqIG1bMV0sXG4gICAgICAgIHNbMl0gKiBtWzJdLFxuICAgICAgICAwLFxuICAgICAgICBzWzBdICogbVs0XSxcbiAgICAgICAgc1sxXSAqIG1bNV0sXG4gICAgICAgIHNbMl0gKiBtWzZdLFxuICAgICAgICAwLFxuICAgICAgICBzWzBdICogbVs4XSxcbiAgICAgICAgc1sxXSAqIG1bOV0sXG4gICAgICAgIHNbMl0gKiBtWzEwXSxcbiAgICAgICAgMCxcbiAgICAgICAgc1swXSAqIG1bMTJdLFxuICAgICAgICBzWzFdICogbVsxM10sXG4gICAgICAgIHNbMl0gKiBtWzE0XSxcbiAgICAgICAgMVxuICAgIF07XG59O1xuVHJhbnNmb3JtLnNjYWxlID0gZnVuY3Rpb24gc2NhbGUoeCwgeSwgeikge1xuICAgIGlmICh6ID09PSB1bmRlZmluZWQpXG4gICAgICAgIHogPSAxO1xuICAgIGlmICh5ID09PSB1bmRlZmluZWQpXG4gICAgICAgIHkgPSB4O1xuICAgIHJldHVybiBbXG4gICAgICAgIHgsXG4gICAgICAgIDAsXG4gICAgICAgIDAsXG4gICAgICAgIDAsXG4gICAgICAgIDAsXG4gICAgICAgIHksXG4gICAgICAgIDAsXG4gICAgICAgIDAsXG4gICAgICAgIDAsXG4gICAgICAgIDAsXG4gICAgICAgIHosXG4gICAgICAgIDAsXG4gICAgICAgIDAsXG4gICAgICAgIDAsXG4gICAgICAgIDAsXG4gICAgICAgIDFcbiAgICBdO1xufTtcblRyYW5zZm9ybS5yb3RhdGVYID0gZnVuY3Rpb24gcm90YXRlWCh0aGV0YSkge1xuICAgIHZhciBjb3NUaGV0YSA9IE1hdGguY29zKHRoZXRhKTtcbiAgICB2YXIgc2luVGhldGEgPSBNYXRoLnNpbih0aGV0YSk7XG4gICAgcmV0dXJuIFtcbiAgICAgICAgMSxcbiAgICAgICAgMCxcbiAgICAgICAgMCxcbiAgICAgICAgMCxcbiAgICAgICAgMCxcbiAgICAgICAgY29zVGhldGEsXG4gICAgICAgIHNpblRoZXRhLFxuICAgICAgICAwLFxuICAgICAgICAwLFxuICAgICAgICAtc2luVGhldGEsXG4gICAgICAgIGNvc1RoZXRhLFxuICAgICAgICAwLFxuICAgICAgICAwLFxuICAgICAgICAwLFxuICAgICAgICAwLFxuICAgICAgICAxXG4gICAgXTtcbn07XG5UcmFuc2Zvcm0ucm90YXRlWSA9IGZ1bmN0aW9uIHJvdGF0ZVkodGhldGEpIHtcbiAgICB2YXIgY29zVGhldGEgPSBNYXRoLmNvcyh0aGV0YSk7XG4gICAgdmFyIHNpblRoZXRhID0gTWF0aC5zaW4odGhldGEpO1xuICAgIHJldHVybiBbXG4gICAgICAgIGNvc1RoZXRhLFxuICAgICAgICAwLFxuICAgICAgICAtc2luVGhldGEsXG4gICAgICAgIDAsXG4gICAgICAgIDAsXG4gICAgICAgIDEsXG4gICAgICAgIDAsXG4gICAgICAgIDAsXG4gICAgICAgIHNpblRoZXRhLFxuICAgICAgICAwLFxuICAgICAgICBjb3NUaGV0YSxcbiAgICAgICAgMCxcbiAgICAgICAgMCxcbiAgICAgICAgMCxcbiAgICAgICAgMCxcbiAgICAgICAgMVxuICAgIF07XG59O1xuVHJhbnNmb3JtLnJvdGF0ZVogPSBmdW5jdGlvbiByb3RhdGVaKHRoZXRhKSB7XG4gICAgdmFyIGNvc1RoZXRhID0gTWF0aC5jb3ModGhldGEpO1xuICAgIHZhciBzaW5UaGV0YSA9IE1hdGguc2luKHRoZXRhKTtcbiAgICByZXR1cm4gW1xuICAgICAgICBjb3NUaGV0YSxcbiAgICAgICAgc2luVGhldGEsXG4gICAgICAgIDAsXG4gICAgICAgIDAsXG4gICAgICAgIC1zaW5UaGV0YSxcbiAgICAgICAgY29zVGhldGEsXG4gICAgICAgIDAsXG4gICAgICAgIDAsXG4gICAgICAgIDAsXG4gICAgICAgIDAsXG4gICAgICAgIDEsXG4gICAgICAgIDAsXG4gICAgICAgIDAsXG4gICAgICAgIDAsXG4gICAgICAgIDAsXG4gICAgICAgIDFcbiAgICBdO1xufTtcblRyYW5zZm9ybS5yb3RhdGUgPSBmdW5jdGlvbiByb3RhdGUocGhpLCB0aGV0YSwgcHNpKSB7XG4gICAgdmFyIGNvc1BoaSA9IE1hdGguY29zKHBoaSk7XG4gICAgdmFyIHNpblBoaSA9IE1hdGguc2luKHBoaSk7XG4gICAgdmFyIGNvc1RoZXRhID0gTWF0aC5jb3ModGhldGEpO1xuICAgIHZhciBzaW5UaGV0YSA9IE1hdGguc2luKHRoZXRhKTtcbiAgICB2YXIgY29zUHNpID0gTWF0aC5jb3MocHNpKTtcbiAgICB2YXIgc2luUHNpID0gTWF0aC5zaW4ocHNpKTtcbiAgICB2YXIgcmVzdWx0ID0gW1xuICAgICAgICAgICAgY29zVGhldGEgKiBjb3NQc2ksXG4gICAgICAgICAgICBjb3NQaGkgKiBzaW5Qc2kgKyBzaW5QaGkgKiBzaW5UaGV0YSAqIGNvc1BzaSxcbiAgICAgICAgICAgIHNpblBoaSAqIHNpblBzaSAtIGNvc1BoaSAqIHNpblRoZXRhICogY29zUHNpLFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIC1jb3NUaGV0YSAqIHNpblBzaSxcbiAgICAgICAgICAgIGNvc1BoaSAqIGNvc1BzaSAtIHNpblBoaSAqIHNpblRoZXRhICogc2luUHNpLFxuICAgICAgICAgICAgc2luUGhpICogY29zUHNpICsgY29zUGhpICogc2luVGhldGEgKiBzaW5Qc2ksXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgc2luVGhldGEsXG4gICAgICAgICAgICAtc2luUGhpICogY29zVGhldGEsXG4gICAgICAgICAgICBjb3NQaGkgKiBjb3NUaGV0YSxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAxXG4gICAgICAgIF07XG4gICAgcmV0dXJuIHJlc3VsdDtcbn07XG5UcmFuc2Zvcm0ucm90YXRlQXhpcyA9IGZ1bmN0aW9uIHJvdGF0ZUF4aXModiwgdGhldGEpIHtcbiAgICB2YXIgc2luVGhldGEgPSBNYXRoLnNpbih0aGV0YSk7XG4gICAgdmFyIGNvc1RoZXRhID0gTWF0aC5jb3ModGhldGEpO1xuICAgIHZhciB2ZXJUaGV0YSA9IDEgLSBjb3NUaGV0YTtcbiAgICB2YXIgeHhWID0gdlswXSAqIHZbMF0gKiB2ZXJUaGV0YTtcbiAgICB2YXIgeHlWID0gdlswXSAqIHZbMV0gKiB2ZXJUaGV0YTtcbiAgICB2YXIgeHpWID0gdlswXSAqIHZbMl0gKiB2ZXJUaGV0YTtcbiAgICB2YXIgeXlWID0gdlsxXSAqIHZbMV0gKiB2ZXJUaGV0YTtcbiAgICB2YXIgeXpWID0gdlsxXSAqIHZbMl0gKiB2ZXJUaGV0YTtcbiAgICB2YXIgenpWID0gdlsyXSAqIHZbMl0gKiB2ZXJUaGV0YTtcbiAgICB2YXIgeHMgPSB2WzBdICogc2luVGhldGE7XG4gICAgdmFyIHlzID0gdlsxXSAqIHNpblRoZXRhO1xuICAgIHZhciB6cyA9IHZbMl0gKiBzaW5UaGV0YTtcbiAgICB2YXIgcmVzdWx0ID0gW1xuICAgICAgICAgICAgeHhWICsgY29zVGhldGEsXG4gICAgICAgICAgICB4eVYgKyB6cyxcbiAgICAgICAgICAgIHh6ViAtIHlzLFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIHh5ViAtIHpzLFxuICAgICAgICAgICAgeXlWICsgY29zVGhldGEsXG4gICAgICAgICAgICB5elYgKyB4cyxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICB4elYgKyB5cyxcbiAgICAgICAgICAgIHl6ViAtIHhzLFxuICAgICAgICAgICAgenpWICsgY29zVGhldGEsXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMVxuICAgICAgICBdO1xuICAgIHJldHVybiByZXN1bHQ7XG59O1xuVHJhbnNmb3JtLmFib3V0T3JpZ2luID0gZnVuY3Rpb24gYWJvdXRPcmlnaW4odiwgbSkge1xuICAgIHZhciB0MCA9IHZbMF0gLSAodlswXSAqIG1bMF0gKyB2WzFdICogbVs0XSArIHZbMl0gKiBtWzhdKTtcbiAgICB2YXIgdDEgPSB2WzFdIC0gKHZbMF0gKiBtWzFdICsgdlsxXSAqIG1bNV0gKyB2WzJdICogbVs5XSk7XG4gICAgdmFyIHQyID0gdlsyXSAtICh2WzBdICogbVsyXSArIHZbMV0gKiBtWzZdICsgdlsyXSAqIG1bMTBdKTtcbiAgICByZXR1cm4gVHJhbnNmb3JtLnRoZW5Nb3ZlKG0sIFtcbiAgICAgICAgdDAsXG4gICAgICAgIHQxLFxuICAgICAgICB0MlxuICAgIF0pO1xufTtcblRyYW5zZm9ybS5za2V3ID0gZnVuY3Rpb24gc2tldyhwaGksIHRoZXRhLCBwc2kpIHtcbiAgICByZXR1cm4gW1xuICAgICAgICAxLFxuICAgICAgICBNYXRoLnRhbih0aGV0YSksXG4gICAgICAgIDAsXG4gICAgICAgIDAsXG4gICAgICAgIE1hdGgudGFuKHBzaSksXG4gICAgICAgIDEsXG4gICAgICAgIDAsXG4gICAgICAgIDAsXG4gICAgICAgIDAsXG4gICAgICAgIE1hdGgudGFuKHBoaSksXG4gICAgICAgIDEsXG4gICAgICAgIDAsXG4gICAgICAgIDAsXG4gICAgICAgIDAsXG4gICAgICAgIDAsXG4gICAgICAgIDFcbiAgICBdO1xufTtcblRyYW5zZm9ybS5za2V3WCA9IGZ1bmN0aW9uIHNrZXdYKGFuZ2xlKSB7XG4gICAgcmV0dXJuIFtcbiAgICAgICAgMSxcbiAgICAgICAgMCxcbiAgICAgICAgMCxcbiAgICAgICAgMCxcbiAgICAgICAgTWF0aC50YW4oYW5nbGUpLFxuICAgICAgICAxLFxuICAgICAgICAwLFxuICAgICAgICAwLFxuICAgICAgICAwLFxuICAgICAgICAwLFxuICAgICAgICAxLFxuICAgICAgICAwLFxuICAgICAgICAwLFxuICAgICAgICAwLFxuICAgICAgICAwLFxuICAgICAgICAxXG4gICAgXTtcbn07XG5UcmFuc2Zvcm0uc2tld1kgPSBmdW5jdGlvbiBza2V3WShhbmdsZSkge1xuICAgIHJldHVybiBbXG4gICAgICAgIDEsXG4gICAgICAgIE1hdGgudGFuKGFuZ2xlKSxcbiAgICAgICAgMCxcbiAgICAgICAgMCxcbiAgICAgICAgMCxcbiAgICAgICAgMSxcbiAgICAgICAgMCxcbiAgICAgICAgMCxcbiAgICAgICAgMCxcbiAgICAgICAgMCxcbiAgICAgICAgMSxcbiAgICAgICAgMCxcbiAgICAgICAgMCxcbiAgICAgICAgMCxcbiAgICAgICAgMCxcbiAgICAgICAgMVxuICAgIF07XG59O1xuVHJhbnNmb3JtLnBlcnNwZWN0aXZlID0gZnVuY3Rpb24gcGVyc3BlY3RpdmUoZm9jdXNaKSB7XG4gICAgcmV0dXJuIFtcbiAgICAgICAgMSxcbiAgICAgICAgMCxcbiAgICAgICAgMCxcbiAgICAgICAgMCxcbiAgICAgICAgMCxcbiAgICAgICAgMSxcbiAgICAgICAgMCxcbiAgICAgICAgMCxcbiAgICAgICAgMCxcbiAgICAgICAgMCxcbiAgICAgICAgMSxcbiAgICAgICAgLTEgLyBmb2N1c1osXG4gICAgICAgIDAsXG4gICAgICAgIDAsXG4gICAgICAgIDAsXG4gICAgICAgIDFcbiAgICBdO1xufTtcblRyYW5zZm9ybS5nZXRUcmFuc2xhdGUgPSBmdW5jdGlvbiBnZXRUcmFuc2xhdGUobSkge1xuICAgIHJldHVybiBbXG4gICAgICAgIG1bMTJdLFxuICAgICAgICBtWzEzXSxcbiAgICAgICAgbVsxNF1cbiAgICBdO1xufTtcblRyYW5zZm9ybS5pbnZlcnNlID0gZnVuY3Rpb24gaW52ZXJzZShtKSB7XG4gICAgdmFyIGMwID0gbVs1XSAqIG1bMTBdIC0gbVs2XSAqIG1bOV07XG4gICAgdmFyIGMxID0gbVs0XSAqIG1bMTBdIC0gbVs2XSAqIG1bOF07XG4gICAgdmFyIGMyID0gbVs0XSAqIG1bOV0gLSBtWzVdICogbVs4XTtcbiAgICB2YXIgYzQgPSBtWzFdICogbVsxMF0gLSBtWzJdICogbVs5XTtcbiAgICB2YXIgYzUgPSBtWzBdICogbVsxMF0gLSBtWzJdICogbVs4XTtcbiAgICB2YXIgYzYgPSBtWzBdICogbVs5XSAtIG1bMV0gKiBtWzhdO1xuICAgIHZhciBjOCA9IG1bMV0gKiBtWzZdIC0gbVsyXSAqIG1bNV07XG4gICAgdmFyIGM5ID0gbVswXSAqIG1bNl0gLSBtWzJdICogbVs0XTtcbiAgICB2YXIgYzEwID0gbVswXSAqIG1bNV0gLSBtWzFdICogbVs0XTtcbiAgICB2YXIgZGV0TSA9IG1bMF0gKiBjMCAtIG1bMV0gKiBjMSArIG1bMl0gKiBjMjtcbiAgICB2YXIgaW52RCA9IDEgLyBkZXRNO1xuICAgIHZhciByZXN1bHQgPSBbXG4gICAgICAgICAgICBpbnZEICogYzAsXG4gICAgICAgICAgICAtaW52RCAqIGM0LFxuICAgICAgICAgICAgaW52RCAqIGM4LFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIC1pbnZEICogYzEsXG4gICAgICAgICAgICBpbnZEICogYzUsXG4gICAgICAgICAgICAtaW52RCAqIGM5LFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIGludkQgKiBjMixcbiAgICAgICAgICAgIC1pbnZEICogYzYsXG4gICAgICAgICAgICBpbnZEICogYzEwLFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDFcbiAgICAgICAgXTtcbiAgICByZXN1bHRbMTJdID0gLW1bMTJdICogcmVzdWx0WzBdIC0gbVsxM10gKiByZXN1bHRbNF0gLSBtWzE0XSAqIHJlc3VsdFs4XTtcbiAgICByZXN1bHRbMTNdID0gLW1bMTJdICogcmVzdWx0WzFdIC0gbVsxM10gKiByZXN1bHRbNV0gLSBtWzE0XSAqIHJlc3VsdFs5XTtcbiAgICByZXN1bHRbMTRdID0gLW1bMTJdICogcmVzdWx0WzJdIC0gbVsxM10gKiByZXN1bHRbNl0gLSBtWzE0XSAqIHJlc3VsdFsxMF07XG4gICAgcmV0dXJuIHJlc3VsdDtcbn07XG5UcmFuc2Zvcm0udHJhbnNwb3NlID0gZnVuY3Rpb24gdHJhbnNwb3NlKG0pIHtcbiAgICByZXR1cm4gW1xuICAgICAgICBtWzBdLFxuICAgICAgICBtWzRdLFxuICAgICAgICBtWzhdLFxuICAgICAgICBtWzEyXSxcbiAgICAgICAgbVsxXSxcbiAgICAgICAgbVs1XSxcbiAgICAgICAgbVs5XSxcbiAgICAgICAgbVsxM10sXG4gICAgICAgIG1bMl0sXG4gICAgICAgIG1bNl0sXG4gICAgICAgIG1bMTBdLFxuICAgICAgICBtWzE0XSxcbiAgICAgICAgbVszXSxcbiAgICAgICAgbVs3XSxcbiAgICAgICAgbVsxMV0sXG4gICAgICAgIG1bMTVdXG4gICAgXTtcbn07XG5mdW5jdGlvbiBfbm9ybVNxdWFyZWQodikge1xuICAgIHJldHVybiB2Lmxlbmd0aCA9PT0gMiA/IHZbMF0gKiB2WzBdICsgdlsxXSAqIHZbMV0gOiB2WzBdICogdlswXSArIHZbMV0gKiB2WzFdICsgdlsyXSAqIHZbMl07XG59XG5mdW5jdGlvbiBfbm9ybSh2KSB7XG4gICAgcmV0dXJuIE1hdGguc3FydChfbm9ybVNxdWFyZWQodikpO1xufVxuZnVuY3Rpb24gX3NpZ24obikge1xuICAgIHJldHVybiBuIDwgMCA/IC0xIDogMTtcbn1cblRyYW5zZm9ybS5pbnRlcnByZXQgPSBmdW5jdGlvbiBpbnRlcnByZXQoTSkge1xuICAgIHZhciB4ID0gW1xuICAgICAgICAgICAgTVswXSxcbiAgICAgICAgICAgIE1bMV0sXG4gICAgICAgICAgICBNWzJdXG4gICAgICAgIF07XG4gICAgdmFyIHNnbiA9IF9zaWduKHhbMF0pO1xuICAgIHZhciB4Tm9ybSA9IF9ub3JtKHgpO1xuICAgIHZhciB2ID0gW1xuICAgICAgICAgICAgeFswXSArIHNnbiAqIHhOb3JtLFxuICAgICAgICAgICAgeFsxXSxcbiAgICAgICAgICAgIHhbMl1cbiAgICAgICAgXTtcbiAgICB2YXIgbXVsdCA9IDIgLyBfbm9ybVNxdWFyZWQodik7XG4gICAgaWYgKG11bHQgPj0gSW5maW5pdHkpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHRyYW5zbGF0ZTogVHJhbnNmb3JtLmdldFRyYW5zbGF0ZShNKSxcbiAgICAgICAgICAgIHJvdGF0ZTogW1xuICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICAwXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgc2NhbGU6IFtcbiAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgMFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIHNrZXc6IFtcbiAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgMFxuICAgICAgICAgICAgXVxuICAgICAgICB9O1xuICAgIH1cbiAgICB2YXIgUTEgPSBbXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAxXG4gICAgICAgIF07XG4gICAgUTFbMF0gPSAxIC0gbXVsdCAqIHZbMF0gKiB2WzBdO1xuICAgIFExWzVdID0gMSAtIG11bHQgKiB2WzFdICogdlsxXTtcbiAgICBRMVsxMF0gPSAxIC0gbXVsdCAqIHZbMl0gKiB2WzJdO1xuICAgIFExWzFdID0gLW11bHQgKiB2WzBdICogdlsxXTtcbiAgICBRMVsyXSA9IC1tdWx0ICogdlswXSAqIHZbMl07XG4gICAgUTFbNl0gPSAtbXVsdCAqIHZbMV0gKiB2WzJdO1xuICAgIFExWzRdID0gUTFbMV07XG4gICAgUTFbOF0gPSBRMVsyXTtcbiAgICBRMVs5XSA9IFExWzZdO1xuICAgIHZhciBNUTEgPSBUcmFuc2Zvcm0ubXVsdGlwbHkoUTEsIE0pO1xuICAgIHZhciB4MiA9IFtcbiAgICAgICAgICAgIE1RMVs1XSxcbiAgICAgICAgICAgIE1RMVs2XVxuICAgICAgICBdO1xuICAgIHZhciBzZ24yID0gX3NpZ24oeDJbMF0pO1xuICAgIHZhciB4Mk5vcm0gPSBfbm9ybSh4Mik7XG4gICAgdmFyIHYyID0gW1xuICAgICAgICAgICAgeDJbMF0gKyBzZ24yICogeDJOb3JtLFxuICAgICAgICAgICAgeDJbMV1cbiAgICAgICAgXTtcbiAgICB2YXIgbXVsdDIgPSAyIC8gX25vcm1TcXVhcmVkKHYyKTtcbiAgICB2YXIgUTIgPSBbXG4gICAgICAgICAgICAxLFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAxXG4gICAgICAgIF07XG4gICAgUTJbNV0gPSAxIC0gbXVsdDIgKiB2MlswXSAqIHYyWzBdO1xuICAgIFEyWzEwXSA9IDEgLSBtdWx0MiAqIHYyWzFdICogdjJbMV07XG4gICAgUTJbNl0gPSAtbXVsdDIgKiB2MlswXSAqIHYyWzFdO1xuICAgIFEyWzldID0gUTJbNl07XG4gICAgdmFyIFEgPSBUcmFuc2Zvcm0ubXVsdGlwbHkoUTIsIFExKTtcbiAgICB2YXIgUiA9IFRyYW5zZm9ybS5tdWx0aXBseShRLCBNKTtcbiAgICB2YXIgcmVtb3ZlciA9IFRyYW5zZm9ybS5zY2FsZShSWzBdIDwgMCA/IC0xIDogMSwgUls1XSA8IDAgPyAtMSA6IDEsIFJbMTBdIDwgMCA/IC0xIDogMSk7XG4gICAgUiA9IFRyYW5zZm9ybS5tdWx0aXBseShSLCByZW1vdmVyKTtcbiAgICBRID0gVHJhbnNmb3JtLm11bHRpcGx5KHJlbW92ZXIsIFEpO1xuICAgIHZhciByZXN1bHQgPSB7fTtcbiAgICByZXN1bHQudHJhbnNsYXRlID0gVHJhbnNmb3JtLmdldFRyYW5zbGF0ZShNKTtcbiAgICByZXN1bHQucm90YXRlID0gW1xuICAgICAgICBNYXRoLmF0YW4yKC1RWzZdLCBRWzEwXSksXG4gICAgICAgIE1hdGguYXNpbihRWzJdKSxcbiAgICAgICAgTWF0aC5hdGFuMigtUVsxXSwgUVswXSlcbiAgICBdO1xuICAgIGlmICghcmVzdWx0LnJvdGF0ZVswXSkge1xuICAgICAgICByZXN1bHQucm90YXRlWzBdID0gMDtcbiAgICAgICAgcmVzdWx0LnJvdGF0ZVsyXSA9IE1hdGguYXRhbjIoUVs0XSwgUVs1XSk7XG4gICAgfVxuICAgIHJlc3VsdC5zY2FsZSA9IFtcbiAgICAgICAgUlswXSxcbiAgICAgICAgUls1XSxcbiAgICAgICAgUlsxMF1cbiAgICBdO1xuICAgIHJlc3VsdC5za2V3ID0gW1xuICAgICAgICBNYXRoLmF0YW4yKFJbOV0sIHJlc3VsdC5zY2FsZVsyXSksXG4gICAgICAgIE1hdGguYXRhbjIoUls4XSwgcmVzdWx0LnNjYWxlWzJdKSxcbiAgICAgICAgTWF0aC5hdGFuMihSWzRdLCByZXN1bHQuc2NhbGVbMF0pXG4gICAgXTtcbiAgICBpZiAoTWF0aC5hYnMocmVzdWx0LnJvdGF0ZVswXSkgKyBNYXRoLmFicyhyZXN1bHQucm90YXRlWzJdKSA+IDEuNSAqIE1hdGguUEkpIHtcbiAgICAgICAgcmVzdWx0LnJvdGF0ZVsxXSA9IE1hdGguUEkgLSByZXN1bHQucm90YXRlWzFdO1xuICAgICAgICBpZiAocmVzdWx0LnJvdGF0ZVsxXSA+IE1hdGguUEkpXG4gICAgICAgICAgICByZXN1bHQucm90YXRlWzFdIC09IDIgKiBNYXRoLlBJO1xuICAgICAgICBpZiAocmVzdWx0LnJvdGF0ZVsxXSA8IC1NYXRoLlBJKVxuICAgICAgICAgICAgcmVzdWx0LnJvdGF0ZVsxXSArPSAyICogTWF0aC5QSTtcbiAgICAgICAgaWYgKHJlc3VsdC5yb3RhdGVbMF0gPCAwKVxuICAgICAgICAgICAgcmVzdWx0LnJvdGF0ZVswXSArPSBNYXRoLlBJO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXN1bHQucm90YXRlWzBdIC09IE1hdGguUEk7XG4gICAgICAgIGlmIChyZXN1bHQucm90YXRlWzJdIDwgMClcbiAgICAgICAgICAgIHJlc3VsdC5yb3RhdGVbMl0gKz0gTWF0aC5QSTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmVzdWx0LnJvdGF0ZVsyXSAtPSBNYXRoLlBJO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufTtcblRyYW5zZm9ybS5hdmVyYWdlID0gZnVuY3Rpb24gYXZlcmFnZShNMSwgTTIsIHQpIHtcbiAgICB0ID0gdCA9PT0gdW5kZWZpbmVkID8gMC41IDogdDtcbiAgICB2YXIgc3BlY00xID0gVHJhbnNmb3JtLmludGVycHJldChNMSk7XG4gICAgdmFyIHNwZWNNMiA9IFRyYW5zZm9ybS5pbnRlcnByZXQoTTIpO1xuICAgIHZhciBzcGVjQXZnID0ge1xuICAgICAgICAgICAgdHJhbnNsYXRlOiBbXG4gICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgIDBcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICByb3RhdGU6IFtcbiAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgMFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIHNjYWxlOiBbXG4gICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgIDBcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBza2V3OiBbXG4gICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgIDBcbiAgICAgICAgICAgIF1cbiAgICAgICAgfTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDM7IGkrKykge1xuICAgICAgICBzcGVjQXZnLnRyYW5zbGF0ZVtpXSA9ICgxIC0gdCkgKiBzcGVjTTEudHJhbnNsYXRlW2ldICsgdCAqIHNwZWNNMi50cmFuc2xhdGVbaV07XG4gICAgICAgIHNwZWNBdmcucm90YXRlW2ldID0gKDEgLSB0KSAqIHNwZWNNMS5yb3RhdGVbaV0gKyB0ICogc3BlY00yLnJvdGF0ZVtpXTtcbiAgICAgICAgc3BlY0F2Zy5zY2FsZVtpXSA9ICgxIC0gdCkgKiBzcGVjTTEuc2NhbGVbaV0gKyB0ICogc3BlY00yLnNjYWxlW2ldO1xuICAgICAgICBzcGVjQXZnLnNrZXdbaV0gPSAoMSAtIHQpICogc3BlY00xLnNrZXdbaV0gKyB0ICogc3BlY00yLnNrZXdbaV07XG4gICAgfVxuICAgIHJldHVybiBUcmFuc2Zvcm0uYnVpbGQoc3BlY0F2Zyk7XG59O1xuVHJhbnNmb3JtLmJ1aWxkID0gZnVuY3Rpb24gYnVpbGQoc3BlYykge1xuICAgIHZhciBzY2FsZU1hdHJpeCA9IFRyYW5zZm9ybS5zY2FsZShzcGVjLnNjYWxlWzBdLCBzcGVjLnNjYWxlWzFdLCBzcGVjLnNjYWxlWzJdKTtcbiAgICB2YXIgc2tld01hdHJpeCA9IFRyYW5zZm9ybS5za2V3KHNwZWMuc2tld1swXSwgc3BlYy5za2V3WzFdLCBzcGVjLnNrZXdbMl0pO1xuICAgIHZhciByb3RhdGVNYXRyaXggPSBUcmFuc2Zvcm0ucm90YXRlKHNwZWMucm90YXRlWzBdLCBzcGVjLnJvdGF0ZVsxXSwgc3BlYy5yb3RhdGVbMl0pO1xuICAgIHJldHVybiBUcmFuc2Zvcm0udGhlbk1vdmUoVHJhbnNmb3JtLm11bHRpcGx5KFRyYW5zZm9ybS5tdWx0aXBseShyb3RhdGVNYXRyaXgsIHNrZXdNYXRyaXgpLCBzY2FsZU1hdHJpeCksIHNwZWMudHJhbnNsYXRlKTtcbn07XG5UcmFuc2Zvcm0uZXF1YWxzID0gZnVuY3Rpb24gZXF1YWxzKGEsIGIpIHtcbiAgICByZXR1cm4gIVRyYW5zZm9ybS5ub3RFcXVhbHMoYSwgYik7XG59O1xuVHJhbnNmb3JtLm5vdEVxdWFscyA9IGZ1bmN0aW9uIG5vdEVxdWFscyhhLCBiKSB7XG4gICAgaWYgKGEgPT09IGIpXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICByZXR1cm4gIShhICYmIGIpIHx8IGFbMTJdICE9PSBiWzEyXSB8fCBhWzEzXSAhPT0gYlsxM10gfHwgYVsxNF0gIT09IGJbMTRdIHx8IGFbMF0gIT09IGJbMF0gfHwgYVsxXSAhPT0gYlsxXSB8fCBhWzJdICE9PSBiWzJdIHx8IGFbNF0gIT09IGJbNF0gfHwgYVs1XSAhPT0gYls1XSB8fCBhWzZdICE9PSBiWzZdIHx8IGFbOF0gIT09IGJbOF0gfHwgYVs5XSAhPT0gYls5XSB8fCBhWzEwXSAhPT0gYlsxMF07XG59O1xuVHJhbnNmb3JtLm5vcm1hbGl6ZVJvdGF0aW9uID0gZnVuY3Rpb24gbm9ybWFsaXplUm90YXRpb24ocm90YXRpb24pIHtcbiAgICB2YXIgcmVzdWx0ID0gcm90YXRpb24uc2xpY2UoMCk7XG4gICAgaWYgKHJlc3VsdFswXSA9PT0gTWF0aC5QSSAqIDAuNSB8fCByZXN1bHRbMF0gPT09IC1NYXRoLlBJICogMC41KSB7XG4gICAgICAgIHJlc3VsdFswXSA9IC1yZXN1bHRbMF07XG4gICAgICAgIHJlc3VsdFsxXSA9IE1hdGguUEkgLSByZXN1bHRbMV07XG4gICAgICAgIHJlc3VsdFsyXSAtPSBNYXRoLlBJO1xuICAgIH1cbiAgICBpZiAocmVzdWx0WzBdID4gTWF0aC5QSSAqIDAuNSkge1xuICAgICAgICByZXN1bHRbMF0gPSByZXN1bHRbMF0gLSBNYXRoLlBJO1xuICAgICAgICByZXN1bHRbMV0gPSBNYXRoLlBJIC0gcmVzdWx0WzFdO1xuICAgICAgICByZXN1bHRbMl0gLT0gTWF0aC5QSTtcbiAgICB9XG4gICAgaWYgKHJlc3VsdFswXSA8IC1NYXRoLlBJICogMC41KSB7XG4gICAgICAgIHJlc3VsdFswXSA9IHJlc3VsdFswXSArIE1hdGguUEk7XG4gICAgICAgIHJlc3VsdFsxXSA9IC1NYXRoLlBJIC0gcmVzdWx0WzFdO1xuICAgICAgICByZXN1bHRbMl0gLT0gTWF0aC5QSTtcbiAgICB9XG4gICAgd2hpbGUgKHJlc3VsdFsxXSA8IC1NYXRoLlBJKVxuICAgICAgICByZXN1bHRbMV0gKz0gMiAqIE1hdGguUEk7XG4gICAgd2hpbGUgKHJlc3VsdFsxXSA+PSBNYXRoLlBJKVxuICAgICAgICByZXN1bHRbMV0gLT0gMiAqIE1hdGguUEk7XG4gICAgd2hpbGUgKHJlc3VsdFsyXSA8IC1NYXRoLlBJKVxuICAgICAgICByZXN1bHRbMl0gKz0gMiAqIE1hdGguUEk7XG4gICAgd2hpbGUgKHJlc3VsdFsyXSA+PSBNYXRoLlBJKVxuICAgICAgICByZXN1bHRbMl0gLT0gMiAqIE1hdGguUEk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn07XG5UcmFuc2Zvcm0uaW5Gcm9udCA9IFtcbiAgICAxLFxuICAgIDAsXG4gICAgMCxcbiAgICAwLFxuICAgIDAsXG4gICAgMSxcbiAgICAwLFxuICAgIDAsXG4gICAgMCxcbiAgICAwLFxuICAgIDEsXG4gICAgMCxcbiAgICAwLFxuICAgIDAsXG4gICAgMC4wMDEsXG4gICAgMVxuXTtcblRyYW5zZm9ybS5iZWhpbmQgPSBbXG4gICAgMSxcbiAgICAwLFxuICAgIDAsXG4gICAgMCxcbiAgICAwLFxuICAgIDEsXG4gICAgMCxcbiAgICAwLFxuICAgIDAsXG4gICAgMCxcbiAgICAxLFxuICAgIDAsXG4gICAgMCxcbiAgICAwLFxuICAgIC0wLjAwMSxcbiAgICAxXG5dO1xubW9kdWxlLmV4cG9ydHMgPSBUcmFuc2Zvcm07IiwidmFyIEV2ZW50SGFuZGxlciA9IHJlcXVpcmUoJy4vRXZlbnRIYW5kbGVyJyk7XG52YXIgT3B0aW9uc01hbmFnZXIgPSByZXF1aXJlKCcuL09wdGlvbnNNYW5hZ2VyJyk7XG52YXIgUmVuZGVyTm9kZSA9IHJlcXVpcmUoJy4vUmVuZGVyTm9kZScpO1xudmFyIFV0aWxpdHkgPSByZXF1aXJlKCcuLi91dGlsaXRpZXMvVXRpbGl0eScpO1xuZnVuY3Rpb24gVmlldyhvcHRpb25zKSB7XG4gICAgdGhpcy5fbm9kZSA9IG5ldyBSZW5kZXJOb2RlKCk7XG4gICAgdGhpcy5fZXZlbnRJbnB1dCA9IG5ldyBFdmVudEhhbmRsZXIoKTtcbiAgICB0aGlzLl9ldmVudE91dHB1dCA9IG5ldyBFdmVudEhhbmRsZXIoKTtcbiAgICBFdmVudEhhbmRsZXIuc2V0SW5wdXRIYW5kbGVyKHRoaXMsIHRoaXMuX2V2ZW50SW5wdXQpO1xuICAgIEV2ZW50SGFuZGxlci5zZXRPdXRwdXRIYW5kbGVyKHRoaXMsIHRoaXMuX2V2ZW50T3V0cHV0KTtcbiAgICB0aGlzLm9wdGlvbnMgPSBVdGlsaXR5LmNsb25lKHRoaXMuY29uc3RydWN0b3IuREVGQVVMVF9PUFRJT05TIHx8IFZpZXcuREVGQVVMVF9PUFRJT05TKTtcbiAgICB0aGlzLl9vcHRpb25zTWFuYWdlciA9IG5ldyBPcHRpb25zTWFuYWdlcih0aGlzLm9wdGlvbnMpO1xuICAgIGlmIChvcHRpb25zKVxuICAgICAgICB0aGlzLnNldE9wdGlvbnMob3B0aW9ucyk7XG59XG5WaWV3LkRFRkFVTFRfT1BUSU9OUyA9IHt9O1xuVmlldy5wcm90b3R5cGUuZ2V0T3B0aW9ucyA9IGZ1bmN0aW9uIGdldE9wdGlvbnMoa2V5KSB7XG4gICAgcmV0dXJuIHRoaXMuX29wdGlvbnNNYW5hZ2VyLmdldE9wdGlvbnMoa2V5KTtcbn07XG5WaWV3LnByb3RvdHlwZS5zZXRPcHRpb25zID0gZnVuY3Rpb24gc2V0T3B0aW9ucyhvcHRpb25zKSB7XG4gICAgdGhpcy5fb3B0aW9uc01hbmFnZXIucGF0Y2gob3B0aW9ucyk7XG59O1xuVmlldy5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24gYWRkKCkge1xuICAgIHJldHVybiB0aGlzLl9ub2RlLmFkZC5hcHBseSh0aGlzLl9ub2RlLCBhcmd1bWVudHMpO1xufTtcblZpZXcucHJvdG90eXBlLl9hZGQgPSBWaWV3LnByb3RvdHlwZS5hZGQ7XG5WaWV3LnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgcmV0dXJuIHRoaXMuX25vZGUucmVuZGVyKCk7XG59O1xuVmlldy5wcm90b3R5cGUuZ2V0U2l6ZSA9IGZ1bmN0aW9uIGdldFNpemUoKSB7XG4gICAgaWYgKHRoaXMuX25vZGUgJiYgdGhpcy5fbm9kZS5nZXRTaXplKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9ub2RlLmdldFNpemUuYXBwbHkodGhpcy5fbm9kZSwgYXJndW1lbnRzKSB8fCB0aGlzLm9wdGlvbnMuc2l6ZTtcbiAgICB9IGVsc2VcbiAgICAgICAgcmV0dXJuIHRoaXMub3B0aW9ucy5zaXplO1xufTtcbm1vZHVsZS5leHBvcnRzID0gVmlldzsiLCJ2YXIgY3NzID0gXCIvKiBUaGlzIFNvdXJjZSBDb2RlIEZvcm0gaXMgc3ViamVjdCB0byB0aGUgdGVybXMgb2YgdGhlIE1vemlsbGEgUHVibGljXFxuICogTGljZW5zZSwgdi4gMi4wLiBJZiBhIGNvcHkgb2YgdGhlIE1QTCB3YXMgbm90IGRpc3RyaWJ1dGVkIHdpdGggdGhpc1xcbiAqIGZpbGUsIFlvdSBjYW4gb2J0YWluIG9uZSBhdCBodHRwOi8vbW96aWxsYS5vcmcvTVBMLzIuMC8uXFxuICpcXG4gKiBPd25lcjogbWFya0BmYW1vLnVzXFxuICogQGxpY2Vuc2UgTVBMIDIuMFxcbiAqIEBjb3B5cmlnaHQgRmFtb3VzIEluZHVzdHJpZXMsIEluYy4gMjAxNFxcbiAqL1xcblxcbi5mYW1vdXMtcm9vdCB7XFxuICAgIHdpZHRoOiAxMDAlO1xcbiAgICBoZWlnaHQ6IDEwMCU7XFxuICAgIG1hcmdpbjogMHB4O1xcbiAgICBwYWRkaW5nOiAwcHg7XFxuICAgIG92ZXJmbG93OiBoaWRkZW47XFxuICAgIC13ZWJraXQtdHJhbnNmb3JtLXN0eWxlOiBwcmVzZXJ2ZS0zZDtcXG4gICAgdHJhbnNmb3JtLXN0eWxlOiBwcmVzZXJ2ZS0zZDtcXG59XFxuXFxuLmZhbW91cy1jb250YWluZXIsIC5mYW1vdXMtZ3JvdXAge1xcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICAgIHRvcDogMHB4O1xcbiAgICBsZWZ0OiAwcHg7XFxuICAgIGJvdHRvbTogMHB4O1xcbiAgICByaWdodDogMHB4O1xcbiAgICBvdmVyZmxvdzogdmlzaWJsZTtcXG4gICAgLXdlYmtpdC10cmFuc2Zvcm0tc3R5bGU6IHByZXNlcnZlLTNkO1xcbiAgICB0cmFuc2Zvcm0tc3R5bGU6IHByZXNlcnZlLTNkO1xcbiAgICAtd2Via2l0LWJhY2tmYWNlLXZpc2liaWxpdHk6IHZpc2libGU7XFxuICAgIGJhY2tmYWNlLXZpc2liaWxpdHk6IHZpc2libGU7XFxuICAgIHBvaW50ZXItZXZlbnRzOiBub25lO1xcbn1cXG5cXG4uZmFtb3VzLWdyb3VwIHtcXG4gICAgd2lkdGg6IDBweDtcXG4gICAgaGVpZ2h0OiAwcHg7XFxuICAgIG1hcmdpbjogMHB4O1xcbiAgICBwYWRkaW5nOiAwcHg7XFxuICAgIC13ZWJraXQtdHJhbnNmb3JtLXN0eWxlOiBwcmVzZXJ2ZS0zZDtcXG4gICAgdHJhbnNmb3JtLXN0eWxlOiBwcmVzZXJ2ZS0zZDtcXG59XFxuXFxuLmZhbW91cy1zdXJmYWNlIHtcXG4gICAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgICAtd2Via2l0LXRyYW5zZm9ybS1vcmlnaW46IGNlbnRlciBjZW50ZXI7XFxuICAgIHRyYW5zZm9ybS1vcmlnaW46IGNlbnRlciBjZW50ZXI7XFxuICAgIC13ZWJraXQtYmFja2ZhY2UtdmlzaWJpbGl0eTogaGlkZGVuO1xcbiAgICBiYWNrZmFjZS12aXNpYmlsaXR5OiBoaWRkZW47XFxuICAgIC13ZWJraXQtdHJhbnNmb3JtLXN0eWxlOiBwcmVzZXJ2ZS0zZDtcXG4gICAgdHJhbnNmb3JtLXN0eWxlOiBwcmVzZXJ2ZS0zZDtcXG4gICAgLXdlYmtpdC1ib3gtc2l6aW5nOiBib3JkZXItYm94O1xcbiAgICAtbW96LWJveC1zaXppbmc6IGJvcmRlci1ib3g7XFxuICAgIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XFxuICAgIC13ZWJraXQtdGFwLWhpZ2hsaWdodC1jb2xvcjogdHJhbnNwYXJlbnQ7XFxuICAgIHBvaW50ZXItZXZlbnRzOiBhdXRvO1xcbn1cXG5cXG4uZmFtb3VzLWNvbnRhaW5lci1ncm91cCB7XFxuICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gICAgd2lkdGg6IDEwMCU7XFxuICAgIGhlaWdodDogMTAwJTtcXG59XFxuXCI7IChyZXF1aXJlKFwiL1VzZXJzL21pY2hhZWx4aWEvRmFtb3VzL1ZhbmlsbGEvY3ViZS13YWxscy0zZC9ub2RlX21vZHVsZXMvY3NzaWZ5XCIpKShjc3MpOyBtb2R1bGUuZXhwb3J0cyA9IGNzczsiLCJ2YXIgVmVjdG9yID0gcmVxdWlyZSgnLi9WZWN0b3InKTtcbmZ1bmN0aW9uIE1hdHJpeCh2YWx1ZXMpIHtcbiAgICB0aGlzLnZhbHVlcyA9IHZhbHVlcyB8fCBbXG4gICAgICAgIFtcbiAgICAgICAgICAgIDEsXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMFxuICAgICAgICBdLFxuICAgICAgICBbXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMSxcbiAgICAgICAgICAgIDBcbiAgICAgICAgXSxcbiAgICAgICAgW1xuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAxXG4gICAgICAgIF1cbiAgICBdO1xuICAgIHJldHVybiB0aGlzO1xufVxudmFyIF9yZWdpc3RlciA9IG5ldyBNYXRyaXgoKTtcbnZhciBfdmVjdG9yUmVnaXN0ZXIgPSBuZXcgVmVjdG9yKCk7XG5NYXRyaXgucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uIGdldCgpIHtcbiAgICByZXR1cm4gdGhpcy52YWx1ZXM7XG59O1xuTWF0cml4LnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbiBzZXQodmFsdWVzKSB7XG4gICAgdGhpcy52YWx1ZXMgPSB2YWx1ZXM7XG59O1xuTWF0cml4LnByb3RvdHlwZS52ZWN0b3JNdWx0aXBseSA9IGZ1bmN0aW9uIHZlY3Rvck11bHRpcGx5KHYpIHtcbiAgICB2YXIgTSA9IHRoaXMuZ2V0KCk7XG4gICAgdmFyIHYwID0gdi54O1xuICAgIHZhciB2MSA9IHYueTtcbiAgICB2YXIgdjIgPSB2Lno7XG4gICAgdmFyIE0wID0gTVswXTtcbiAgICB2YXIgTTEgPSBNWzFdO1xuICAgIHZhciBNMiA9IE1bMl07XG4gICAgdmFyIE0wMCA9IE0wWzBdO1xuICAgIHZhciBNMDEgPSBNMFsxXTtcbiAgICB2YXIgTTAyID0gTTBbMl07XG4gICAgdmFyIE0xMCA9IE0xWzBdO1xuICAgIHZhciBNMTEgPSBNMVsxXTtcbiAgICB2YXIgTTEyID0gTTFbMl07XG4gICAgdmFyIE0yMCA9IE0yWzBdO1xuICAgIHZhciBNMjEgPSBNMlsxXTtcbiAgICB2YXIgTTIyID0gTTJbMl07XG4gICAgcmV0dXJuIF92ZWN0b3JSZWdpc3Rlci5zZXRYWVooTTAwICogdjAgKyBNMDEgKiB2MSArIE0wMiAqIHYyLCBNMTAgKiB2MCArIE0xMSAqIHYxICsgTTEyICogdjIsIE0yMCAqIHYwICsgTTIxICogdjEgKyBNMjIgKiB2Mik7XG59O1xuTWF0cml4LnByb3RvdHlwZS5tdWx0aXBseSA9IGZ1bmN0aW9uIG11bHRpcGx5KE0yKSB7XG4gICAgdmFyIE0xID0gdGhpcy5nZXQoKTtcbiAgICB2YXIgcmVzdWx0ID0gW1tdXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDM7IGkrKykge1xuICAgICAgICByZXN1bHRbaV0gPSBbXTtcbiAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCAzOyBqKyspIHtcbiAgICAgICAgICAgIHZhciBzdW0gPSAwO1xuICAgICAgICAgICAgZm9yICh2YXIgayA9IDA7IGsgPCAzOyBrKyspIHtcbiAgICAgICAgICAgICAgICBzdW0gKz0gTTFbaV1ba10gKiBNMltrXVtqXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlc3VsdFtpXVtqXSA9IHN1bTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gX3JlZ2lzdGVyLnNldChyZXN1bHQpO1xufTtcbk1hdHJpeC5wcm90b3R5cGUudHJhbnNwb3NlID0gZnVuY3Rpb24gdHJhbnNwb3NlKCkge1xuICAgIHZhciByZXN1bHQgPSBbXTtcbiAgICB2YXIgTSA9IHRoaXMuZ2V0KCk7XG4gICAgZm9yICh2YXIgcm93ID0gMDsgcm93IDwgMzsgcm93KyspIHtcbiAgICAgICAgZm9yICh2YXIgY29sID0gMDsgY29sIDwgMzsgY29sKyspIHtcbiAgICAgICAgICAgIHJlc3VsdFtyb3ddW2NvbF0gPSBNW2NvbF1bcm93XTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gX3JlZ2lzdGVyLnNldChyZXN1bHQpO1xufTtcbk1hdHJpeC5wcm90b3R5cGUuY2xvbmUgPSBmdW5jdGlvbiBjbG9uZSgpIHtcbiAgICB2YXIgdmFsdWVzID0gdGhpcy5nZXQoKTtcbiAgICB2YXIgTSA9IFtdO1xuICAgIGZvciAodmFyIHJvdyA9IDA7IHJvdyA8IDM7IHJvdysrKVxuICAgICAgICBNW3Jvd10gPSB2YWx1ZXNbcm93XS5zbGljZSgpO1xuICAgIHJldHVybiBuZXcgTWF0cml4KE0pO1xufTtcbm1vZHVsZS5leHBvcnRzID0gTWF0cml4OyIsInZhciBNYXRyaXggPSByZXF1aXJlKCcuL01hdHJpeCcpO1xuZnVuY3Rpb24gUXVhdGVybmlvbih3LCB4LCB5LCB6KSB7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDEpXG4gICAgICAgIHRoaXMuc2V0KHcpO1xuICAgIGVsc2Uge1xuICAgICAgICB0aGlzLncgPSB3ICE9PSB1bmRlZmluZWQgPyB3IDogMTtcbiAgICAgICAgdGhpcy54ID0geCAhPT0gdW5kZWZpbmVkID8geCA6IDA7XG4gICAgICAgIHRoaXMueSA9IHkgIT09IHVuZGVmaW5lZCA/IHkgOiAwO1xuICAgICAgICB0aGlzLnogPSB6ICE9PSB1bmRlZmluZWQgPyB6IDogMDtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG59XG52YXIgcmVnaXN0ZXIgPSBuZXcgUXVhdGVybmlvbigxLCAwLCAwLCAwKTtcblF1YXRlcm5pb24ucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uIGFkZChxKSB7XG4gICAgcmV0dXJuIHJlZ2lzdGVyLnNldFdYWVoodGhpcy53ICsgcS53LCB0aGlzLnggKyBxLngsIHRoaXMueSArIHEueSwgdGhpcy56ICsgcS56KTtcbn07XG5RdWF0ZXJuaW9uLnByb3RvdHlwZS5zdWIgPSBmdW5jdGlvbiBzdWIocSkge1xuICAgIHJldHVybiByZWdpc3Rlci5zZXRXWFlaKHRoaXMudyAtIHEudywgdGhpcy54IC0gcS54LCB0aGlzLnkgLSBxLnksIHRoaXMueiAtIHEueik7XG59O1xuUXVhdGVybmlvbi5wcm90b3R5cGUuc2NhbGFyRGl2aWRlID0gZnVuY3Rpb24gc2NhbGFyRGl2aWRlKHMpIHtcbiAgICByZXR1cm4gdGhpcy5zY2FsYXJNdWx0aXBseSgxIC8gcyk7XG59O1xuUXVhdGVybmlvbi5wcm90b3R5cGUuc2NhbGFyTXVsdGlwbHkgPSBmdW5jdGlvbiBzY2FsYXJNdWx0aXBseShzKSB7XG4gICAgcmV0dXJuIHJlZ2lzdGVyLnNldFdYWVoodGhpcy53ICogcywgdGhpcy54ICogcywgdGhpcy55ICogcywgdGhpcy56ICogcyk7XG59O1xuUXVhdGVybmlvbi5wcm90b3R5cGUubXVsdGlwbHkgPSBmdW5jdGlvbiBtdWx0aXBseShxKSB7XG4gICAgdmFyIHgxID0gdGhpcy54O1xuICAgIHZhciB5MSA9IHRoaXMueTtcbiAgICB2YXIgejEgPSB0aGlzLno7XG4gICAgdmFyIHcxID0gdGhpcy53O1xuICAgIHZhciB4MiA9IHEueDtcbiAgICB2YXIgeTIgPSBxLnk7XG4gICAgdmFyIHoyID0gcS56O1xuICAgIHZhciB3MiA9IHEudyB8fCAwO1xuICAgIHJldHVybiByZWdpc3Rlci5zZXRXWFlaKHcxICogdzIgLSB4MSAqIHgyIC0geTEgKiB5MiAtIHoxICogejIsIHgxICogdzIgKyB4MiAqIHcxICsgeTIgKiB6MSAtIHkxICogejIsIHkxICogdzIgKyB5MiAqIHcxICsgeDEgKiB6MiAtIHgyICogejEsIHoxICogdzIgKyB6MiAqIHcxICsgeDIgKiB5MSAtIHgxICogeTIpO1xufTtcbnZhciBjb25qID0gbmV3IFF1YXRlcm5pb24oMSwgMCwgMCwgMCk7XG5RdWF0ZXJuaW9uLnByb3RvdHlwZS5yb3RhdGVWZWN0b3IgPSBmdW5jdGlvbiByb3RhdGVWZWN0b3Iodikge1xuICAgIGNvbmouc2V0KHRoaXMuY29uaigpKTtcbiAgICByZXR1cm4gcmVnaXN0ZXIuc2V0KHRoaXMubXVsdGlwbHkodikubXVsdGlwbHkoY29uaikpO1xufTtcblF1YXRlcm5pb24ucHJvdG90eXBlLmludmVyc2UgPSBmdW5jdGlvbiBpbnZlcnNlKCkge1xuICAgIHJldHVybiByZWdpc3Rlci5zZXQodGhpcy5jb25qKCkuc2NhbGFyRGl2aWRlKHRoaXMubm9ybVNxdWFyZWQoKSkpO1xufTtcblF1YXRlcm5pb24ucHJvdG90eXBlLm5lZ2F0ZSA9IGZ1bmN0aW9uIG5lZ2F0ZSgpIHtcbiAgICByZXR1cm4gdGhpcy5zY2FsYXJNdWx0aXBseSgtMSk7XG59O1xuUXVhdGVybmlvbi5wcm90b3R5cGUuY29uaiA9IGZ1bmN0aW9uIGNvbmooKSB7XG4gICAgcmV0dXJuIHJlZ2lzdGVyLnNldFdYWVoodGhpcy53LCAtdGhpcy54LCAtdGhpcy55LCAtdGhpcy56KTtcbn07XG5RdWF0ZXJuaW9uLnByb3RvdHlwZS5ub3JtYWxpemUgPSBmdW5jdGlvbiBub3JtYWxpemUobGVuZ3RoKSB7XG4gICAgbGVuZ3RoID0gbGVuZ3RoID09PSB1bmRlZmluZWQgPyAxIDogbGVuZ3RoO1xuICAgIHJldHVybiB0aGlzLnNjYWxhckRpdmlkZShsZW5ndGggKiB0aGlzLm5vcm0oKSk7XG59O1xuUXVhdGVybmlvbi5wcm90b3R5cGUubWFrZUZyb21BbmdsZUFuZEF4aXMgPSBmdW5jdGlvbiBtYWtlRnJvbUFuZ2xlQW5kQXhpcyhhbmdsZSwgdikge1xuICAgIHZhciBuID0gdi5ub3JtYWxpemUoKTtcbiAgICB2YXIgaGEgPSBhbmdsZSAqIDAuNTtcbiAgICB2YXIgcyA9IC1NYXRoLnNpbihoYSk7XG4gICAgdGhpcy54ID0gcyAqIG4ueDtcbiAgICB0aGlzLnkgPSBzICogbi55O1xuICAgIHRoaXMueiA9IHMgKiBuLno7XG4gICAgdGhpcy53ID0gTWF0aC5jb3MoaGEpO1xuICAgIHJldHVybiB0aGlzO1xufTtcblF1YXRlcm5pb24ucHJvdG90eXBlLnNldFdYWVogPSBmdW5jdGlvbiBzZXRXWFlaKHcsIHgsIHksIHopIHtcbiAgICByZWdpc3Rlci5jbGVhcigpO1xuICAgIHRoaXMudyA9IHc7XG4gICAgdGhpcy54ID0geDtcbiAgICB0aGlzLnkgPSB5O1xuICAgIHRoaXMueiA9IHo7XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuUXVhdGVybmlvbi5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24gc2V0KHYpIHtcbiAgICBpZiAodiBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICAgIHRoaXMudyA9IDA7XG4gICAgICAgIHRoaXMueCA9IHZbMF07XG4gICAgICAgIHRoaXMueSA9IHZbMV07XG4gICAgICAgIHRoaXMueiA9IHZbMl07XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy53ID0gdi53O1xuICAgICAgICB0aGlzLnggPSB2Lng7XG4gICAgICAgIHRoaXMueSA9IHYueTtcbiAgICAgICAgdGhpcy56ID0gdi56O1xuICAgIH1cbiAgICBpZiAodGhpcyAhPT0gcmVnaXN0ZXIpXG4gICAgICAgIHJlZ2lzdGVyLmNsZWFyKCk7XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuUXVhdGVybmlvbi5wcm90b3R5cGUucHV0ID0gZnVuY3Rpb24gcHV0KHEpIHtcbiAgICBxLnNldChyZWdpc3Rlcik7XG59O1xuUXVhdGVybmlvbi5wcm90b3R5cGUuY2xvbmUgPSBmdW5jdGlvbiBjbG9uZSgpIHtcbiAgICByZXR1cm4gbmV3IFF1YXRlcm5pb24odGhpcyk7XG59O1xuUXVhdGVybmlvbi5wcm90b3R5cGUuY2xlYXIgPSBmdW5jdGlvbiBjbGVhcigpIHtcbiAgICB0aGlzLncgPSAxO1xuICAgIHRoaXMueCA9IDA7XG4gICAgdGhpcy55ID0gMDtcbiAgICB0aGlzLnogPSAwO1xuICAgIHJldHVybiB0aGlzO1xufTtcblF1YXRlcm5pb24ucHJvdG90eXBlLmlzRXF1YWwgPSBmdW5jdGlvbiBpc0VxdWFsKHEpIHtcbiAgICByZXR1cm4gcS53ID09PSB0aGlzLncgJiYgcS54ID09PSB0aGlzLnggJiYgcS55ID09PSB0aGlzLnkgJiYgcS56ID09PSB0aGlzLno7XG59O1xuUXVhdGVybmlvbi5wcm90b3R5cGUuZG90ID0gZnVuY3Rpb24gZG90KHEpIHtcbiAgICByZXR1cm4gdGhpcy53ICogcS53ICsgdGhpcy54ICogcS54ICsgdGhpcy55ICogcS55ICsgdGhpcy56ICogcS56O1xufTtcblF1YXRlcm5pb24ucHJvdG90eXBlLm5vcm1TcXVhcmVkID0gZnVuY3Rpb24gbm9ybVNxdWFyZWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuZG90KHRoaXMpO1xufTtcblF1YXRlcm5pb24ucHJvdG90eXBlLm5vcm0gPSBmdW5jdGlvbiBub3JtKCkge1xuICAgIHJldHVybiBNYXRoLnNxcnQodGhpcy5ub3JtU3F1YXJlZCgpKTtcbn07XG5RdWF0ZXJuaW9uLnByb3RvdHlwZS5pc1plcm8gPSBmdW5jdGlvbiBpc1plcm8oKSB7XG4gICAgcmV0dXJuICEodGhpcy54IHx8IHRoaXMueSB8fCB0aGlzLnopO1xufTtcblF1YXRlcm5pb24ucHJvdG90eXBlLmdldFRyYW5zZm9ybSA9IGZ1bmN0aW9uIGdldFRyYW5zZm9ybSgpIHtcbiAgICB2YXIgdGVtcCA9IHRoaXMubm9ybWFsaXplKDEpO1xuICAgIHZhciB4ID0gdGVtcC54O1xuICAgIHZhciB5ID0gdGVtcC55O1xuICAgIHZhciB6ID0gdGVtcC56O1xuICAgIHZhciB3ID0gdGVtcC53O1xuICAgIHJldHVybiBbXG4gICAgICAgIDEgLSAyICogeSAqIHkgLSAyICogeiAqIHosXG4gICAgICAgIDIgKiB4ICogeSAtIDIgKiB6ICogdyxcbiAgICAgICAgMiAqIHggKiB6ICsgMiAqIHkgKiB3LFxuICAgICAgICAwLFxuICAgICAgICAyICogeCAqIHkgKyAyICogeiAqIHcsXG4gICAgICAgIDEgLSAyICogeCAqIHggLSAyICogeiAqIHosXG4gICAgICAgIDIgKiB5ICogeiAtIDIgKiB4ICogdyxcbiAgICAgICAgMCxcbiAgICAgICAgMiAqIHggKiB6IC0gMiAqIHkgKiB3LFxuICAgICAgICAyICogeSAqIHogKyAyICogeCAqIHcsXG4gICAgICAgIDEgLSAyICogeCAqIHggLSAyICogeSAqIHksXG4gICAgICAgIDAsXG4gICAgICAgIDAsXG4gICAgICAgIDAsXG4gICAgICAgIDAsXG4gICAgICAgIDFcbiAgICBdO1xufTtcbnZhciBtYXRyaXhSZWdpc3RlciA9IG5ldyBNYXRyaXgoKTtcblF1YXRlcm5pb24ucHJvdG90eXBlLmdldE1hdHJpeCA9IGZ1bmN0aW9uIGdldE1hdHJpeCgpIHtcbiAgICB2YXIgdGVtcCA9IHRoaXMubm9ybWFsaXplKDEpO1xuICAgIHZhciB4ID0gdGVtcC54O1xuICAgIHZhciB5ID0gdGVtcC55O1xuICAgIHZhciB6ID0gdGVtcC56O1xuICAgIHZhciB3ID0gdGVtcC53O1xuICAgIHJldHVybiBtYXRyaXhSZWdpc3Rlci5zZXQoW1xuICAgICAgICBbXG4gICAgICAgICAgICAxIC0gMiAqIHkgKiB5IC0gMiAqIHogKiB6LFxuICAgICAgICAgICAgMiAqIHggKiB5ICsgMiAqIHogKiB3LFxuICAgICAgICAgICAgMiAqIHggKiB6IC0gMiAqIHkgKiB3XG4gICAgICAgIF0sXG4gICAgICAgIFtcbiAgICAgICAgICAgIDIgKiB4ICogeSAtIDIgKiB6ICogdyxcbiAgICAgICAgICAgIDEgLSAyICogeCAqIHggLSAyICogeiAqIHosXG4gICAgICAgICAgICAyICogeSAqIHogKyAyICogeCAqIHdcbiAgICAgICAgXSxcbiAgICAgICAgW1xuICAgICAgICAgICAgMiAqIHggKiB6ICsgMiAqIHkgKiB3LFxuICAgICAgICAgICAgMiAqIHkgKiB6IC0gMiAqIHggKiB3LFxuICAgICAgICAgICAgMSAtIDIgKiB4ICogeCAtIDIgKiB5ICogeVxuICAgICAgICBdXG4gICAgXSk7XG59O1xudmFyIGVwc2lsb24gPSAwLjAwMDAxO1xuUXVhdGVybmlvbi5wcm90b3R5cGUuc2xlcnAgPSBmdW5jdGlvbiBzbGVycChxLCB0KSB7XG4gICAgdmFyIG9tZWdhO1xuICAgIHZhciBjb3NvbWVnYTtcbiAgICB2YXIgc2lub21lZ2E7XG4gICAgdmFyIHNjYWxlRnJvbTtcbiAgICB2YXIgc2NhbGVUbztcbiAgICBjb3NvbWVnYSA9IHRoaXMuZG90KHEpO1xuICAgIGlmICgxIC0gY29zb21lZ2EgPiBlcHNpbG9uKSB7XG4gICAgICAgIG9tZWdhID0gTWF0aC5hY29zKGNvc29tZWdhKTtcbiAgICAgICAgc2lub21lZ2EgPSBNYXRoLnNpbihvbWVnYSk7XG4gICAgICAgIHNjYWxlRnJvbSA9IE1hdGguc2luKCgxIC0gdCkgKiBvbWVnYSkgLyBzaW5vbWVnYTtcbiAgICAgICAgc2NhbGVUbyA9IE1hdGguc2luKHQgKiBvbWVnYSkgLyBzaW5vbWVnYTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBzY2FsZUZyb20gPSAxIC0gdDtcbiAgICAgICAgc2NhbGVUbyA9IHQ7XG4gICAgfVxuICAgIHJldHVybiByZWdpc3Rlci5zZXQodGhpcy5zY2FsYXJNdWx0aXBseShzY2FsZUZyb20gLyBzY2FsZVRvKS5hZGQocSkubXVsdGlwbHkoc2NhbGVUbykpO1xufTtcbm1vZHVsZS5leHBvcnRzID0gUXVhdGVybmlvbjsiLCJmdW5jdGlvbiBWZWN0b3IoeCwgeSwgeikge1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAxICYmIHggIT09IHVuZGVmaW5lZClcbiAgICAgICAgdGhpcy5zZXQoeCk7XG4gICAgZWxzZSB7XG4gICAgICAgIHRoaXMueCA9IHggfHwgMDtcbiAgICAgICAgdGhpcy55ID0geSB8fCAwO1xuICAgICAgICB0aGlzLnogPSB6IHx8IDA7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xufVxudmFyIF9yZWdpc3RlciA9IG5ldyBWZWN0b3IoMCwgMCwgMCk7XG5WZWN0b3IucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uIGFkZCh2KSB7XG4gICAgcmV0dXJuIF9zZXRYWVouY2FsbChfcmVnaXN0ZXIsIHRoaXMueCArIHYueCwgdGhpcy55ICsgdi55LCB0aGlzLnogKyB2LnopO1xufTtcblZlY3Rvci5wcm90b3R5cGUuc3ViID0gZnVuY3Rpb24gc3ViKHYpIHtcbiAgICByZXR1cm4gX3NldFhZWi5jYWxsKF9yZWdpc3RlciwgdGhpcy54IC0gdi54LCB0aGlzLnkgLSB2LnksIHRoaXMueiAtIHYueik7XG59O1xuVmVjdG9yLnByb3RvdHlwZS5tdWx0ID0gZnVuY3Rpb24gbXVsdChyKSB7XG4gICAgcmV0dXJuIF9zZXRYWVouY2FsbChfcmVnaXN0ZXIsIHIgKiB0aGlzLngsIHIgKiB0aGlzLnksIHIgKiB0aGlzLnopO1xufTtcblZlY3Rvci5wcm90b3R5cGUuZGl2ID0gZnVuY3Rpb24gZGl2KHIpIHtcbiAgICByZXR1cm4gdGhpcy5tdWx0KDEgLyByKTtcbn07XG5WZWN0b3IucHJvdG90eXBlLmNyb3NzID0gZnVuY3Rpb24gY3Jvc3Modikge1xuICAgIHZhciB4ID0gdGhpcy54O1xuICAgIHZhciB5ID0gdGhpcy55O1xuICAgIHZhciB6ID0gdGhpcy56O1xuICAgIHZhciB2eCA9IHYueDtcbiAgICB2YXIgdnkgPSB2Lnk7XG4gICAgdmFyIHZ6ID0gdi56O1xuICAgIHJldHVybiBfc2V0WFlaLmNhbGwoX3JlZ2lzdGVyLCB6ICogdnkgLSB5ICogdnosIHggKiB2eiAtIHogKiB2eCwgeSAqIHZ4IC0geCAqIHZ5KTtcbn07XG5WZWN0b3IucHJvdG90eXBlLmVxdWFscyA9IGZ1bmN0aW9uIGVxdWFscyh2KSB7XG4gICAgcmV0dXJuIHYueCA9PT0gdGhpcy54ICYmIHYueSA9PT0gdGhpcy55ICYmIHYueiA9PT0gdGhpcy56O1xufTtcblZlY3Rvci5wcm90b3R5cGUucm90YXRlWCA9IGZ1bmN0aW9uIHJvdGF0ZVgodGhldGEpIHtcbiAgICB2YXIgeCA9IHRoaXMueDtcbiAgICB2YXIgeSA9IHRoaXMueTtcbiAgICB2YXIgeiA9IHRoaXMuejtcbiAgICB2YXIgY29zVGhldGEgPSBNYXRoLmNvcyh0aGV0YSk7XG4gICAgdmFyIHNpblRoZXRhID0gTWF0aC5zaW4odGhldGEpO1xuICAgIHJldHVybiBfc2V0WFlaLmNhbGwoX3JlZ2lzdGVyLCB4LCB5ICogY29zVGhldGEgLSB6ICogc2luVGhldGEsIHkgKiBzaW5UaGV0YSArIHogKiBjb3NUaGV0YSk7XG59O1xuVmVjdG9yLnByb3RvdHlwZS5yb3RhdGVZID0gZnVuY3Rpb24gcm90YXRlWSh0aGV0YSkge1xuICAgIHZhciB4ID0gdGhpcy54O1xuICAgIHZhciB5ID0gdGhpcy55O1xuICAgIHZhciB6ID0gdGhpcy56O1xuICAgIHZhciBjb3NUaGV0YSA9IE1hdGguY29zKHRoZXRhKTtcbiAgICB2YXIgc2luVGhldGEgPSBNYXRoLnNpbih0aGV0YSk7XG4gICAgcmV0dXJuIF9zZXRYWVouY2FsbChfcmVnaXN0ZXIsIHogKiBzaW5UaGV0YSArIHggKiBjb3NUaGV0YSwgeSwgeiAqIGNvc1RoZXRhIC0geCAqIHNpblRoZXRhKTtcbn07XG5WZWN0b3IucHJvdG90eXBlLnJvdGF0ZVogPSBmdW5jdGlvbiByb3RhdGVaKHRoZXRhKSB7XG4gICAgdmFyIHggPSB0aGlzLng7XG4gICAgdmFyIHkgPSB0aGlzLnk7XG4gICAgdmFyIHogPSB0aGlzLno7XG4gICAgdmFyIGNvc1RoZXRhID0gTWF0aC5jb3ModGhldGEpO1xuICAgIHZhciBzaW5UaGV0YSA9IE1hdGguc2luKHRoZXRhKTtcbiAgICByZXR1cm4gX3NldFhZWi5jYWxsKF9yZWdpc3RlciwgeCAqIGNvc1RoZXRhIC0geSAqIHNpblRoZXRhLCB4ICogc2luVGhldGEgKyB5ICogY29zVGhldGEsIHopO1xufTtcblZlY3Rvci5wcm90b3R5cGUuZG90ID0gZnVuY3Rpb24gZG90KHYpIHtcbiAgICByZXR1cm4gdGhpcy54ICogdi54ICsgdGhpcy55ICogdi55ICsgdGhpcy56ICogdi56O1xufTtcblZlY3Rvci5wcm90b3R5cGUubm9ybVNxdWFyZWQgPSBmdW5jdGlvbiBub3JtU3F1YXJlZCgpIHtcbiAgICByZXR1cm4gdGhpcy5kb3QodGhpcyk7XG59O1xuVmVjdG9yLnByb3RvdHlwZS5ub3JtID0gZnVuY3Rpb24gbm9ybSgpIHtcbiAgICByZXR1cm4gTWF0aC5zcXJ0KHRoaXMubm9ybVNxdWFyZWQoKSk7XG59O1xuVmVjdG9yLnByb3RvdHlwZS5ub3JtYWxpemUgPSBmdW5jdGlvbiBub3JtYWxpemUobGVuZ3RoKSB7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApXG4gICAgICAgIGxlbmd0aCA9IDE7XG4gICAgdmFyIG5vcm0gPSB0aGlzLm5vcm0oKTtcbiAgICBpZiAobm9ybSA+IDFlLTcpXG4gICAgICAgIHJldHVybiBfc2V0RnJvbVZlY3Rvci5jYWxsKF9yZWdpc3RlciwgdGhpcy5tdWx0KGxlbmd0aCAvIG5vcm0pKTtcbiAgICBlbHNlXG4gICAgICAgIHJldHVybiBfc2V0WFlaLmNhbGwoX3JlZ2lzdGVyLCBsZW5ndGgsIDAsIDApO1xufTtcblZlY3Rvci5wcm90b3R5cGUuY2xvbmUgPSBmdW5jdGlvbiBjbG9uZSgpIHtcbiAgICByZXR1cm4gbmV3IFZlY3Rvcih0aGlzKTtcbn07XG5WZWN0b3IucHJvdG90eXBlLmlzWmVybyA9IGZ1bmN0aW9uIGlzWmVybygpIHtcbiAgICByZXR1cm4gISh0aGlzLnggfHwgdGhpcy55IHx8IHRoaXMueik7XG59O1xuZnVuY3Rpb24gX3NldFhZWih4LCB5LCB6KSB7XG4gICAgdGhpcy54ID0geDtcbiAgICB0aGlzLnkgPSB5O1xuICAgIHRoaXMueiA9IHo7XG4gICAgcmV0dXJuIHRoaXM7XG59XG5mdW5jdGlvbiBfc2V0RnJvbUFycmF5KHYpIHtcbiAgICByZXR1cm4gX3NldFhZWi5jYWxsKHRoaXMsIHZbMF0sIHZbMV0sIHZbMl0gfHwgMCk7XG59XG5mdW5jdGlvbiBfc2V0RnJvbVZlY3Rvcih2KSB7XG4gICAgcmV0dXJuIF9zZXRYWVouY2FsbCh0aGlzLCB2LngsIHYueSwgdi56KTtcbn1cbmZ1bmN0aW9uIF9zZXRGcm9tTnVtYmVyKHgpIHtcbiAgICByZXR1cm4gX3NldFhZWi5jYWxsKHRoaXMsIHgsIDAsIDApO1xufVxuVmVjdG9yLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbiBzZXQodikge1xuICAgIGlmICh2IGluc3RhbmNlb2YgQXJyYXkpXG4gICAgICAgIHJldHVybiBfc2V0RnJvbUFycmF5LmNhbGwodGhpcywgdik7XG4gICAgaWYgKHR5cGVvZiB2ID09PSAnbnVtYmVyJylcbiAgICAgICAgcmV0dXJuIF9zZXRGcm9tTnVtYmVyLmNhbGwodGhpcywgdik7XG4gICAgcmV0dXJuIF9zZXRGcm9tVmVjdG9yLmNhbGwodGhpcywgdik7XG59O1xuVmVjdG9yLnByb3RvdHlwZS5zZXRYWVogPSBmdW5jdGlvbiAoeCwgeSwgeikge1xuICAgIHJldHVybiBfc2V0WFlaLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG59O1xuVmVjdG9yLnByb3RvdHlwZS5zZXQxRCA9IGZ1bmN0aW9uICh4KSB7XG4gICAgcmV0dXJuIF9zZXRGcm9tTnVtYmVyLmNhbGwodGhpcywgeCk7XG59O1xuVmVjdG9yLnByb3RvdHlwZS5wdXQgPSBmdW5jdGlvbiBwdXQodikge1xuICAgIGlmICh0aGlzID09PSBfcmVnaXN0ZXIpXG4gICAgICAgIF9zZXRGcm9tVmVjdG9yLmNhbGwodiwgX3JlZ2lzdGVyKTtcbiAgICBlbHNlXG4gICAgICAgIF9zZXRGcm9tVmVjdG9yLmNhbGwodiwgdGhpcyk7XG59O1xuVmVjdG9yLnByb3RvdHlwZS5jbGVhciA9IGZ1bmN0aW9uIGNsZWFyKCkge1xuICAgIHJldHVybiBfc2V0WFlaLmNhbGwodGhpcywgMCwgMCwgMCk7XG59O1xuVmVjdG9yLnByb3RvdHlwZS5jYXAgPSBmdW5jdGlvbiBjYXAoY2FwKSB7XG4gICAgaWYgKGNhcCA9PT0gSW5maW5pdHkpXG4gICAgICAgIHJldHVybiBfc2V0RnJvbVZlY3Rvci5jYWxsKF9yZWdpc3RlciwgdGhpcyk7XG4gICAgdmFyIG5vcm0gPSB0aGlzLm5vcm0oKTtcbiAgICBpZiAobm9ybSA+IGNhcClcbiAgICAgICAgcmV0dXJuIF9zZXRGcm9tVmVjdG9yLmNhbGwoX3JlZ2lzdGVyLCB0aGlzLm11bHQoY2FwIC8gbm9ybSkpO1xuICAgIGVsc2VcbiAgICAgICAgcmV0dXJuIF9zZXRGcm9tVmVjdG9yLmNhbGwoX3JlZ2lzdGVyLCB0aGlzKTtcbn07XG5WZWN0b3IucHJvdG90eXBlLnByb2plY3QgPSBmdW5jdGlvbiBwcm9qZWN0KG4pIHtcbiAgICByZXR1cm4gbi5tdWx0KHRoaXMuZG90KG4pKTtcbn07XG5WZWN0b3IucHJvdG90eXBlLnJlZmxlY3RBY3Jvc3MgPSBmdW5jdGlvbiByZWZsZWN0QWNyb3NzKG4pIHtcbiAgICBuLm5vcm1hbGl6ZSgpLnB1dChuKTtcbiAgICByZXR1cm4gX3NldEZyb21WZWN0b3IoX3JlZ2lzdGVyLCB0aGlzLnN1Yih0aGlzLnByb2plY3QobikubXVsdCgyKSkpO1xufTtcblZlY3Rvci5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24gZ2V0KCkge1xuICAgIHJldHVybiBbXG4gICAgICAgIHRoaXMueCxcbiAgICAgICAgdGhpcy55LFxuICAgICAgICB0aGlzLnpcbiAgICBdO1xufTtcblZlY3Rvci5wcm90b3R5cGUuZ2V0MUQgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMueDtcbn07XG5tb2R1bGUuZXhwb3J0cyA9IFZlY3RvcjsiLCJ2YXIgTW9kaWZpZXIgPSByZXF1aXJlKCcuLi9jb3JlL01vZGlmaWVyJyk7XG52YXIgVHJhbnNmb3JtID0gcmVxdWlyZSgnLi4vY29yZS9UcmFuc2Zvcm0nKTtcbnZhciBUcmFuc2l0aW9uYWJsZSA9IHJlcXVpcmUoJy4uL3RyYW5zaXRpb25zL1RyYW5zaXRpb25hYmxlJyk7XG52YXIgVHJhbnNpdGlvbmFibGVUcmFuc2Zvcm0gPSByZXF1aXJlKCcuLi90cmFuc2l0aW9ucy9UcmFuc2l0aW9uYWJsZVRyYW5zZm9ybScpO1xuZnVuY3Rpb24gU3RhdGVNb2RpZmllcihvcHRpb25zKSB7XG4gICAgdGhpcy5fdHJhbnNmb3JtU3RhdGUgPSBuZXcgVHJhbnNpdGlvbmFibGVUcmFuc2Zvcm0oVHJhbnNmb3JtLmlkZW50aXR5KTtcbiAgICB0aGlzLl9vcGFjaXR5U3RhdGUgPSBuZXcgVHJhbnNpdGlvbmFibGUoMSk7XG4gICAgdGhpcy5fb3JpZ2luU3RhdGUgPSBuZXcgVHJhbnNpdGlvbmFibGUoW1xuICAgICAgICAwLFxuICAgICAgICAwXG4gICAgXSk7XG4gICAgdGhpcy5fYWxpZ25TdGF0ZSA9IG5ldyBUcmFuc2l0aW9uYWJsZShbXG4gICAgICAgIDAsXG4gICAgICAgIDBcbiAgICBdKTtcbiAgICB0aGlzLl9zaXplU3RhdGUgPSBuZXcgVHJhbnNpdGlvbmFibGUoW1xuICAgICAgICAwLFxuICAgICAgICAwXG4gICAgXSk7XG4gICAgdGhpcy5fcHJvcG9ydGlvbnNTdGF0ZSA9IG5ldyBUcmFuc2l0aW9uYWJsZShbXG4gICAgICAgIDAsXG4gICAgICAgIDBcbiAgICBdKTtcbiAgICB0aGlzLl9tb2RpZmllciA9IG5ldyBNb2RpZmllcih7XG4gICAgICAgIHRyYW5zZm9ybTogdGhpcy5fdHJhbnNmb3JtU3RhdGUsXG4gICAgICAgIG9wYWNpdHk6IHRoaXMuX29wYWNpdHlTdGF0ZSxcbiAgICAgICAgb3JpZ2luOiBudWxsLFxuICAgICAgICBhbGlnbjogbnVsbCxcbiAgICAgICAgc2l6ZTogbnVsbCxcbiAgICAgICAgcHJvcG9ydGlvbnM6IG51bGxcbiAgICB9KTtcbiAgICB0aGlzLl9oYXNPcmlnaW4gPSBmYWxzZTtcbiAgICB0aGlzLl9oYXNBbGlnbiA9IGZhbHNlO1xuICAgIHRoaXMuX2hhc1NpemUgPSBmYWxzZTtcbiAgICB0aGlzLl9oYXNQcm9wb3J0aW9ucyA9IGZhbHNlO1xuICAgIGlmIChvcHRpb25zKSB7XG4gICAgICAgIGlmIChvcHRpb25zLnRyYW5zZm9ybSlcbiAgICAgICAgICAgIHRoaXMuc2V0VHJhbnNmb3JtKG9wdGlvbnMudHJhbnNmb3JtKTtcbiAgICAgICAgaWYgKG9wdGlvbnMub3BhY2l0eSAhPT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgdGhpcy5zZXRPcGFjaXR5KG9wdGlvbnMub3BhY2l0eSk7XG4gICAgICAgIGlmIChvcHRpb25zLm9yaWdpbilcbiAgICAgICAgICAgIHRoaXMuc2V0T3JpZ2luKG9wdGlvbnMub3JpZ2luKTtcbiAgICAgICAgaWYgKG9wdGlvbnMuYWxpZ24pXG4gICAgICAgICAgICB0aGlzLnNldEFsaWduKG9wdGlvbnMuYWxpZ24pO1xuICAgICAgICBpZiAob3B0aW9ucy5zaXplKVxuICAgICAgICAgICAgdGhpcy5zZXRTaXplKG9wdGlvbnMuc2l6ZSk7XG4gICAgICAgIGlmIChvcHRpb25zLnByb3BvcnRpb25zKVxuICAgICAgICAgICAgdGhpcy5zZXRQcm9wb3J0aW9ucyhvcHRpb25zLnByb3BvcnRpb25zKTtcbiAgICB9XG59XG5TdGF0ZU1vZGlmaWVyLnByb3RvdHlwZS5zZXRUcmFuc2Zvcm0gPSBmdW5jdGlvbiBzZXRUcmFuc2Zvcm0odHJhbnNmb3JtLCB0cmFuc2l0aW9uLCBjYWxsYmFjaykge1xuICAgIHRoaXMuX3RyYW5zZm9ybVN0YXRlLnNldCh0cmFuc2Zvcm0sIHRyYW5zaXRpb24sIGNhbGxiYWNrKTtcbiAgICByZXR1cm4gdGhpcztcbn07XG5TdGF0ZU1vZGlmaWVyLnByb3RvdHlwZS5zZXRPcGFjaXR5ID0gZnVuY3Rpb24gc2V0T3BhY2l0eShvcGFjaXR5LCB0cmFuc2l0aW9uLCBjYWxsYmFjaykge1xuICAgIHRoaXMuX29wYWNpdHlTdGF0ZS5zZXQob3BhY2l0eSwgdHJhbnNpdGlvbiwgY2FsbGJhY2spO1xuICAgIHJldHVybiB0aGlzO1xufTtcblN0YXRlTW9kaWZpZXIucHJvdG90eXBlLnNldE9yaWdpbiA9IGZ1bmN0aW9uIHNldE9yaWdpbihvcmlnaW4sIHRyYW5zaXRpb24sIGNhbGxiYWNrKSB7XG4gICAgaWYgKG9yaWdpbiA9PT0gbnVsbCkge1xuICAgICAgICBpZiAodGhpcy5faGFzT3JpZ2luKSB7XG4gICAgICAgICAgICB0aGlzLl9tb2RpZmllci5vcmlnaW5Gcm9tKG51bGwpO1xuICAgICAgICAgICAgdGhpcy5faGFzT3JpZ2luID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSBlbHNlIGlmICghdGhpcy5faGFzT3JpZ2luKSB7XG4gICAgICAgIHRoaXMuX2hhc09yaWdpbiA9IHRydWU7XG4gICAgICAgIHRoaXMuX21vZGlmaWVyLm9yaWdpbkZyb20odGhpcy5fb3JpZ2luU3RhdGUpO1xuICAgIH1cbiAgICB0aGlzLl9vcmlnaW5TdGF0ZS5zZXQob3JpZ2luLCB0cmFuc2l0aW9uLCBjYWxsYmFjayk7XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuU3RhdGVNb2RpZmllci5wcm90b3R5cGUuc2V0QWxpZ24gPSBmdW5jdGlvbiBzZXRPcmlnaW4oYWxpZ24sIHRyYW5zaXRpb24sIGNhbGxiYWNrKSB7XG4gICAgaWYgKGFsaWduID09PSBudWxsKSB7XG4gICAgICAgIGlmICh0aGlzLl9oYXNBbGlnbikge1xuICAgICAgICAgICAgdGhpcy5fbW9kaWZpZXIuYWxpZ25Gcm9tKG51bGwpO1xuICAgICAgICAgICAgdGhpcy5faGFzQWxpZ24gPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9IGVsc2UgaWYgKCF0aGlzLl9oYXNBbGlnbikge1xuICAgICAgICB0aGlzLl9oYXNBbGlnbiA9IHRydWU7XG4gICAgICAgIHRoaXMuX21vZGlmaWVyLmFsaWduRnJvbSh0aGlzLl9hbGlnblN0YXRlKTtcbiAgICB9XG4gICAgdGhpcy5fYWxpZ25TdGF0ZS5zZXQoYWxpZ24sIHRyYW5zaXRpb24sIGNhbGxiYWNrKTtcbiAgICByZXR1cm4gdGhpcztcbn07XG5TdGF0ZU1vZGlmaWVyLnByb3RvdHlwZS5zZXRTaXplID0gZnVuY3Rpb24gc2V0U2l6ZShzaXplLCB0cmFuc2l0aW9uLCBjYWxsYmFjaykge1xuICAgIGlmIChzaXplID09PSBudWxsKSB7XG4gICAgICAgIGlmICh0aGlzLl9oYXNTaXplKSB7XG4gICAgICAgICAgICB0aGlzLl9tb2RpZmllci5zaXplRnJvbShudWxsKTtcbiAgICAgICAgICAgIHRoaXMuX2hhc1NpemUgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9IGVsc2UgaWYgKCF0aGlzLl9oYXNTaXplKSB7XG4gICAgICAgIHRoaXMuX2hhc1NpemUgPSB0cnVlO1xuICAgICAgICB0aGlzLl9tb2RpZmllci5zaXplRnJvbSh0aGlzLl9zaXplU3RhdGUpO1xuICAgIH1cbiAgICB0aGlzLl9zaXplU3RhdGUuc2V0KHNpemUsIHRyYW5zaXRpb24sIGNhbGxiYWNrKTtcbiAgICByZXR1cm4gdGhpcztcbn07XG5TdGF0ZU1vZGlmaWVyLnByb3RvdHlwZS5zZXRQcm9wb3J0aW9ucyA9IGZ1bmN0aW9uIHNldFNpemUocHJvcG9ydGlvbnMsIHRyYW5zaXRpb24sIGNhbGxiYWNrKSB7XG4gICAgaWYgKHByb3BvcnRpb25zID09PSBudWxsKSB7XG4gICAgICAgIGlmICh0aGlzLl9oYXNQcm9wb3J0aW9ucykge1xuICAgICAgICAgICAgdGhpcy5fbW9kaWZpZXIucHJvcG9ydGlvbnNGcm9tKG51bGwpO1xuICAgICAgICAgICAgdGhpcy5faGFzUHJvcG9ydGlvbnMgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9IGVsc2UgaWYgKCF0aGlzLl9oYXNQcm9wb3J0aW9ucykge1xuICAgICAgICB0aGlzLl9oYXNQcm9wb3J0aW9ucyA9IHRydWU7XG4gICAgICAgIHRoaXMuX21vZGlmaWVyLnByb3BvcnRpb25zRnJvbSh0aGlzLl9wcm9wb3J0aW9uc1N0YXRlKTtcbiAgICB9XG4gICAgdGhpcy5fcHJvcG9ydGlvbnNTdGF0ZS5zZXQocHJvcG9ydGlvbnMsIHRyYW5zaXRpb24sIGNhbGxiYWNrKTtcbiAgICByZXR1cm4gdGhpcztcbn07XG5TdGF0ZU1vZGlmaWVyLnByb3RvdHlwZS5oYWx0ID0gZnVuY3Rpb24gaGFsdCgpIHtcbiAgICB0aGlzLl90cmFuc2Zvcm1TdGF0ZS5oYWx0KCk7XG4gICAgdGhpcy5fb3BhY2l0eVN0YXRlLmhhbHQoKTtcbiAgICB0aGlzLl9vcmlnaW5TdGF0ZS5oYWx0KCk7XG4gICAgdGhpcy5fYWxpZ25TdGF0ZS5oYWx0KCk7XG4gICAgdGhpcy5fc2l6ZVN0YXRlLmhhbHQoKTtcbiAgICB0aGlzLl9wcm9wb3J0aW9uc1N0YXRlLmhhbHQoKTtcbn07XG5TdGF0ZU1vZGlmaWVyLnByb3RvdHlwZS5nZXRUcmFuc2Zvcm0gPSBmdW5jdGlvbiBnZXRUcmFuc2Zvcm0oKSB7XG4gICAgcmV0dXJuIHRoaXMuX3RyYW5zZm9ybVN0YXRlLmdldCgpO1xufTtcblN0YXRlTW9kaWZpZXIucHJvdG90eXBlLmdldEZpbmFsVHJhbnNmb3JtID0gZnVuY3Rpb24gZ2V0RmluYWxUcmFuc2Zvcm0oKSB7XG4gICAgcmV0dXJuIHRoaXMuX3RyYW5zZm9ybVN0YXRlLmdldEZpbmFsKCk7XG59O1xuU3RhdGVNb2RpZmllci5wcm90b3R5cGUuZ2V0T3BhY2l0eSA9IGZ1bmN0aW9uIGdldE9wYWNpdHkoKSB7XG4gICAgcmV0dXJuIHRoaXMuX29wYWNpdHlTdGF0ZS5nZXQoKTtcbn07XG5TdGF0ZU1vZGlmaWVyLnByb3RvdHlwZS5nZXRPcmlnaW4gPSBmdW5jdGlvbiBnZXRPcmlnaW4oKSB7XG4gICAgcmV0dXJuIHRoaXMuX2hhc09yaWdpbiA/IHRoaXMuX29yaWdpblN0YXRlLmdldCgpIDogbnVsbDtcbn07XG5TdGF0ZU1vZGlmaWVyLnByb3RvdHlwZS5nZXRBbGlnbiA9IGZ1bmN0aW9uIGdldEFsaWduKCkge1xuICAgIHJldHVybiB0aGlzLl9oYXNBbGlnbiA/IHRoaXMuX2FsaWduU3RhdGUuZ2V0KCkgOiBudWxsO1xufTtcblN0YXRlTW9kaWZpZXIucHJvdG90eXBlLmdldFNpemUgPSBmdW5jdGlvbiBnZXRTaXplKCkge1xuICAgIHJldHVybiB0aGlzLl9oYXNTaXplID8gdGhpcy5fc2l6ZVN0YXRlLmdldCgpIDogbnVsbDtcbn07XG5TdGF0ZU1vZGlmaWVyLnByb3RvdHlwZS5nZXRQcm9wb3J0aW9ucyA9IGZ1bmN0aW9uIGdldFByb3BvcnRpb25zKCkge1xuICAgIHJldHVybiB0aGlzLl9oYXNQcm9wb3J0aW9ucyA/IHRoaXMuX3Byb3BvcnRpb25zU3RhdGUuZ2V0KCkgOiBudWxsO1xufTtcblN0YXRlTW9kaWZpZXIucHJvdG90eXBlLm1vZGlmeSA9IGZ1bmN0aW9uIG1vZGlmeSh0YXJnZXQpIHtcbiAgICByZXR1cm4gdGhpcy5fbW9kaWZpZXIubW9kaWZ5KHRhcmdldCk7XG59O1xubW9kdWxlLmV4cG9ydHMgPSBTdGF0ZU1vZGlmaWVyOyIsInZhciBFdmVudEhhbmRsZXIgPSByZXF1aXJlKCcuLi9jb3JlL0V2ZW50SGFuZGxlcicpO1xuZnVuY3Rpb24gUGh5c2ljc0VuZ2luZShvcHRpb25zKSB7XG4gICAgdGhpcy5vcHRpb25zID0gT2JqZWN0LmNyZWF0ZShQaHlzaWNzRW5naW5lLkRFRkFVTFRfT1BUSU9OUyk7XG4gICAgaWYgKG9wdGlvbnMpXG4gICAgICAgIHRoaXMuc2V0T3B0aW9ucyhvcHRpb25zKTtcbiAgICB0aGlzLl9wYXJ0aWNsZXMgPSBbXTtcbiAgICB0aGlzLl9ib2RpZXMgPSBbXTtcbiAgICB0aGlzLl9hZ2VudERhdGEgPSB7fTtcbiAgICB0aGlzLl9mb3JjZXMgPSBbXTtcbiAgICB0aGlzLl9jb25zdHJhaW50cyA9IFtdO1xuICAgIHRoaXMuX2J1ZmZlciA9IDA7XG4gICAgdGhpcy5fcHJldlRpbWUgPSBub3coKTtcbiAgICB0aGlzLl9pc1NsZWVwaW5nID0gZmFsc2U7XG4gICAgdGhpcy5fZXZlbnRIYW5kbGVyID0gbnVsbDtcbiAgICB0aGlzLl9jdXJyQWdlbnRJZCA9IDA7XG4gICAgdGhpcy5faGFzQm9kaWVzID0gZmFsc2U7XG4gICAgdGhpcy5fZXZlbnRIYW5kbGVyID0gbnVsbDtcbn1cbnZhciBUSU1FU1RFUCA9IDE3O1xudmFyIE1JTl9USU1FX1NURVAgPSAxMDAwIC8gMTIwO1xudmFyIE1BWF9USU1FX1NURVAgPSAxNztcbnZhciBub3cgPSBEYXRlLm5vdztcbnZhciBfZXZlbnRzID0ge1xuICAgICAgICBzdGFydDogJ3N0YXJ0JyxcbiAgICAgICAgdXBkYXRlOiAndXBkYXRlJyxcbiAgICAgICAgZW5kOiAnZW5kJ1xuICAgIH07XG5QaHlzaWNzRW5naW5lLkRFRkFVTFRfT1BUSU9OUyA9IHtcbiAgICBjb25zdHJhaW50U3RlcHM6IDEsXG4gICAgc2xlZXBUb2xlcmFuY2U6IDFlLTcsXG4gICAgdmVsb2NpdHlDYXA6IHVuZGVmaW5lZCxcbiAgICBhbmd1bGFyVmVsb2NpdHlDYXA6IHVuZGVmaW5lZFxufTtcblBoeXNpY3NFbmdpbmUucHJvdG90eXBlLnNldE9wdGlvbnMgPSBmdW5jdGlvbiBzZXRPcHRpb25zKG9wdHMpIHtcbiAgICBmb3IgKHZhciBrZXkgaW4gb3B0cylcbiAgICAgICAgaWYgKHRoaXMub3B0aW9uc1trZXldKVxuICAgICAgICAgICAgdGhpcy5vcHRpb25zW2tleV0gPSBvcHRzW2tleV07XG59O1xuUGh5c2ljc0VuZ2luZS5wcm90b3R5cGUuYWRkQm9keSA9IGZ1bmN0aW9uIGFkZEJvZHkoYm9keSkge1xuICAgIGJvZHkuX2VuZ2luZSA9IHRoaXM7XG4gICAgaWYgKGJvZHkuaXNCb2R5KSB7XG4gICAgICAgIHRoaXMuX2JvZGllcy5wdXNoKGJvZHkpO1xuICAgICAgICB0aGlzLl9oYXNCb2RpZXMgPSB0cnVlO1xuICAgIH0gZWxzZVxuICAgICAgICB0aGlzLl9wYXJ0aWNsZXMucHVzaChib2R5KTtcbiAgICBib2R5Lm9uKCdzdGFydCcsIHRoaXMud2FrZS5iaW5kKHRoaXMpKTtcbiAgICByZXR1cm4gYm9keTtcbn07XG5QaHlzaWNzRW5naW5lLnByb3RvdHlwZS5yZW1vdmVCb2R5ID0gZnVuY3Rpb24gcmVtb3ZlQm9keShib2R5KSB7XG4gICAgdmFyIGFycmF5ID0gYm9keS5pc0JvZHkgPyB0aGlzLl9ib2RpZXMgOiB0aGlzLl9wYXJ0aWNsZXM7XG4gICAgdmFyIGluZGV4ID0gYXJyYXkuaW5kZXhPZihib2R5KTtcbiAgICBpZiAoaW5kZXggPiAtMSkge1xuICAgICAgICBmb3IgKHZhciBhZ2VudCBpbiB0aGlzLl9hZ2VudERhdGEpXG4gICAgICAgICAgICB0aGlzLmRldGFjaEZyb20oYWdlbnQuaWQsIGJvZHkpO1xuICAgICAgICBhcnJheS5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIH1cbiAgICBpZiAodGhpcy5nZXRCb2RpZXMoKS5sZW5ndGggPT09IDApXG4gICAgICAgIHRoaXMuX2hhc0JvZGllcyA9IGZhbHNlO1xufTtcbmZ1bmN0aW9uIF9tYXBBZ2VudEFycmF5KGFnZW50KSB7XG4gICAgaWYgKGFnZW50LmFwcGx5Rm9yY2UpXG4gICAgICAgIHJldHVybiB0aGlzLl9mb3JjZXM7XG4gICAgaWYgKGFnZW50LmFwcGx5Q29uc3RyYWludClcbiAgICAgICAgcmV0dXJuIHRoaXMuX2NvbnN0cmFpbnRzO1xufVxuZnVuY3Rpb24gX2F0dGFjaE9uZShhZ2VudCwgdGFyZ2V0cywgc291cmNlKSB7XG4gICAgaWYgKHRhcmdldHMgPT09IHVuZGVmaW5lZClcbiAgICAgICAgdGFyZ2V0cyA9IHRoaXMuZ2V0UGFydGljbGVzQW5kQm9kaWVzKCk7XG4gICAgaWYgKCEodGFyZ2V0cyBpbnN0YW5jZW9mIEFycmF5KSlcbiAgICAgICAgdGFyZ2V0cyA9IFt0YXJnZXRzXTtcbiAgICBhZ2VudC5vbignY2hhbmdlJywgdGhpcy53YWtlLmJpbmQodGhpcykpO1xuICAgIHRoaXMuX2FnZW50RGF0YVt0aGlzLl9jdXJyQWdlbnRJZF0gPSB7XG4gICAgICAgIGFnZW50OiBhZ2VudCxcbiAgICAgICAgaWQ6IHRoaXMuX2N1cnJBZ2VudElkLFxuICAgICAgICB0YXJnZXRzOiB0YXJnZXRzLFxuICAgICAgICBzb3VyY2U6IHNvdXJjZVxuICAgIH07XG4gICAgX21hcEFnZW50QXJyYXkuY2FsbCh0aGlzLCBhZ2VudCkucHVzaCh0aGlzLl9jdXJyQWdlbnRJZCk7XG4gICAgcmV0dXJuIHRoaXMuX2N1cnJBZ2VudElkKys7XG59XG5QaHlzaWNzRW5naW5lLnByb3RvdHlwZS5hdHRhY2ggPSBmdW5jdGlvbiBhdHRhY2goYWdlbnRzLCB0YXJnZXRzLCBzb3VyY2UpIHtcbiAgICB0aGlzLndha2UoKTtcbiAgICBpZiAoYWdlbnRzIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgICAgdmFyIGFnZW50SURzID0gW107XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYWdlbnRzLmxlbmd0aDsgaSsrKVxuICAgICAgICAgICAgYWdlbnRJRHNbaV0gPSBfYXR0YWNoT25lLmNhbGwodGhpcywgYWdlbnRzW2ldLCB0YXJnZXRzLCBzb3VyY2UpO1xuICAgICAgICByZXR1cm4gYWdlbnRJRHM7XG4gICAgfSBlbHNlXG4gICAgICAgIHJldHVybiBfYXR0YWNoT25lLmNhbGwodGhpcywgYWdlbnRzLCB0YXJnZXRzLCBzb3VyY2UpO1xufTtcblBoeXNpY3NFbmdpbmUucHJvdG90eXBlLmF0dGFjaFRvID0gZnVuY3Rpb24gYXR0YWNoVG8oYWdlbnRJRCwgdGFyZ2V0KSB7XG4gICAgX2dldEFnZW50RGF0YS5jYWxsKHRoaXMsIGFnZW50SUQpLnRhcmdldHMucHVzaCh0YXJnZXQpO1xufTtcblBoeXNpY3NFbmdpbmUucHJvdG90eXBlLmRldGFjaCA9IGZ1bmN0aW9uIGRldGFjaChpZCkge1xuICAgIHZhciBhZ2VudCA9IHRoaXMuZ2V0QWdlbnQoaWQpO1xuICAgIHZhciBhZ2VudEFycmF5ID0gX21hcEFnZW50QXJyYXkuY2FsbCh0aGlzLCBhZ2VudCk7XG4gICAgdmFyIGluZGV4ID0gYWdlbnRBcnJheS5pbmRleE9mKGlkKTtcbiAgICBhZ2VudEFycmF5LnNwbGljZShpbmRleCwgMSk7XG4gICAgZGVsZXRlIHRoaXMuX2FnZW50RGF0YVtpZF07XG59O1xuUGh5c2ljc0VuZ2luZS5wcm90b3R5cGUuZGV0YWNoRnJvbSA9IGZ1bmN0aW9uIGRldGFjaEZyb20oaWQsIHRhcmdldCkge1xuICAgIHZhciBib3VuZEFnZW50ID0gX2dldEFnZW50RGF0YS5jYWxsKHRoaXMsIGlkKTtcbiAgICBpZiAoYm91bmRBZ2VudC5zb3VyY2UgPT09IHRhcmdldClcbiAgICAgICAgdGhpcy5kZXRhY2goaWQpO1xuICAgIGVsc2Uge1xuICAgICAgICB2YXIgdGFyZ2V0cyA9IGJvdW5kQWdlbnQudGFyZ2V0cztcbiAgICAgICAgdmFyIGluZGV4ID0gdGFyZ2V0cy5pbmRleE9mKHRhcmdldCk7XG4gICAgICAgIGlmIChpbmRleCA+IC0xKVxuICAgICAgICAgICAgdGFyZ2V0cy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIH1cbn07XG5QaHlzaWNzRW5naW5lLnByb3RvdHlwZS5kZXRhY2hBbGwgPSBmdW5jdGlvbiBkZXRhY2hBbGwoKSB7XG4gICAgdGhpcy5fYWdlbnREYXRhID0ge307XG4gICAgdGhpcy5fZm9yY2VzID0gW107XG4gICAgdGhpcy5fY29uc3RyYWludHMgPSBbXTtcbiAgICB0aGlzLl9jdXJyQWdlbnRJZCA9IDA7XG59O1xuZnVuY3Rpb24gX2dldEFnZW50RGF0YShpZCkge1xuICAgIHJldHVybiB0aGlzLl9hZ2VudERhdGFbaWRdO1xufVxuUGh5c2ljc0VuZ2luZS5wcm90b3R5cGUuZ2V0QWdlbnQgPSBmdW5jdGlvbiBnZXRBZ2VudChpZCkge1xuICAgIHJldHVybiBfZ2V0QWdlbnREYXRhLmNhbGwodGhpcywgaWQpLmFnZW50O1xufTtcblBoeXNpY3NFbmdpbmUucHJvdG90eXBlLmdldFBhcnRpY2xlcyA9IGZ1bmN0aW9uIGdldFBhcnRpY2xlcygpIHtcbiAgICByZXR1cm4gdGhpcy5fcGFydGljbGVzO1xufTtcblBoeXNpY3NFbmdpbmUucHJvdG90eXBlLmdldEJvZGllcyA9IGZ1bmN0aW9uIGdldEJvZGllcygpIHtcbiAgICByZXR1cm4gdGhpcy5fYm9kaWVzO1xufTtcblBoeXNpY3NFbmdpbmUucHJvdG90eXBlLmdldFBhcnRpY2xlc0FuZEJvZGllcyA9IGZ1bmN0aW9uIGdldFBhcnRpY2xlc0FuZEJvZGllcygpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRQYXJ0aWNsZXMoKS5jb25jYXQodGhpcy5nZXRCb2RpZXMoKSk7XG59O1xuUGh5c2ljc0VuZ2luZS5wcm90b3R5cGUuZm9yRWFjaFBhcnRpY2xlID0gZnVuY3Rpb24gZm9yRWFjaFBhcnRpY2xlKGZuLCBkdCkge1xuICAgIHZhciBwYXJ0aWNsZXMgPSB0aGlzLmdldFBhcnRpY2xlcygpO1xuICAgIGZvciAodmFyIGluZGV4ID0gMCwgbGVuID0gcGFydGljbGVzLmxlbmd0aDsgaW5kZXggPCBsZW47IGluZGV4KyspXG4gICAgICAgIGZuLmNhbGwodGhpcywgcGFydGljbGVzW2luZGV4XSwgZHQpO1xufTtcblBoeXNpY3NFbmdpbmUucHJvdG90eXBlLmZvckVhY2hCb2R5ID0gZnVuY3Rpb24gZm9yRWFjaEJvZHkoZm4sIGR0KSB7XG4gICAgaWYgKCF0aGlzLl9oYXNCb2RpZXMpXG4gICAgICAgIHJldHVybjtcbiAgICB2YXIgYm9kaWVzID0gdGhpcy5nZXRCb2RpZXMoKTtcbiAgICBmb3IgKHZhciBpbmRleCA9IDAsIGxlbiA9IGJvZGllcy5sZW5ndGg7IGluZGV4IDwgbGVuOyBpbmRleCsrKVxuICAgICAgICBmbi5jYWxsKHRoaXMsIGJvZGllc1tpbmRleF0sIGR0KTtcbn07XG5QaHlzaWNzRW5naW5lLnByb3RvdHlwZS5mb3JFYWNoID0gZnVuY3Rpb24gZm9yRWFjaChmbiwgZHQpIHtcbiAgICB0aGlzLmZvckVhY2hQYXJ0aWNsZShmbiwgZHQpO1xuICAgIHRoaXMuZm9yRWFjaEJvZHkoZm4sIGR0KTtcbn07XG5mdW5jdGlvbiBfdXBkYXRlRm9yY2UoaW5kZXgpIHtcbiAgICB2YXIgYm91bmRBZ2VudCA9IF9nZXRBZ2VudERhdGEuY2FsbCh0aGlzLCB0aGlzLl9mb3JjZXNbaW5kZXhdKTtcbiAgICBib3VuZEFnZW50LmFnZW50LmFwcGx5Rm9yY2UoYm91bmRBZ2VudC50YXJnZXRzLCBib3VuZEFnZW50LnNvdXJjZSk7XG59XG5mdW5jdGlvbiBfdXBkYXRlRm9yY2VzKCkge1xuICAgIGZvciAodmFyIGluZGV4ID0gdGhpcy5fZm9yY2VzLmxlbmd0aCAtIDE7IGluZGV4ID4gLTE7IGluZGV4LS0pXG4gICAgICAgIF91cGRhdGVGb3JjZS5jYWxsKHRoaXMsIGluZGV4KTtcbn1cbmZ1bmN0aW9uIF91cGRhdGVDb25zdHJhaW50KGluZGV4LCBkdCkge1xuICAgIHZhciBib3VuZEFnZW50ID0gdGhpcy5fYWdlbnREYXRhW3RoaXMuX2NvbnN0cmFpbnRzW2luZGV4XV07XG4gICAgcmV0dXJuIGJvdW5kQWdlbnQuYWdlbnQuYXBwbHlDb25zdHJhaW50KGJvdW5kQWdlbnQudGFyZ2V0cywgYm91bmRBZ2VudC5zb3VyY2UsIGR0KTtcbn1cbmZ1bmN0aW9uIF91cGRhdGVDb25zdHJhaW50cyhkdCkge1xuICAgIHZhciBpdGVyYXRpb24gPSAwO1xuICAgIHdoaWxlIChpdGVyYXRpb24gPCB0aGlzLm9wdGlvbnMuY29uc3RyYWludFN0ZXBzKSB7XG4gICAgICAgIGZvciAodmFyIGluZGV4ID0gdGhpcy5fY29uc3RyYWludHMubGVuZ3RoIC0gMTsgaW5kZXggPiAtMTsgaW5kZXgtLSlcbiAgICAgICAgICAgIF91cGRhdGVDb25zdHJhaW50LmNhbGwodGhpcywgaW5kZXgsIGR0KTtcbiAgICAgICAgaXRlcmF0aW9uKys7XG4gICAgfVxufVxuZnVuY3Rpb24gX3VwZGF0ZVZlbG9jaXRpZXMoYm9keSwgZHQpIHtcbiAgICBib2R5LmludGVncmF0ZVZlbG9jaXR5KGR0KTtcbiAgICBpZiAodGhpcy5vcHRpb25zLnZlbG9jaXR5Q2FwKVxuICAgICAgICBib2R5LnZlbG9jaXR5LmNhcCh0aGlzLm9wdGlvbnMudmVsb2NpdHlDYXApLnB1dChib2R5LnZlbG9jaXR5KTtcbn1cbmZ1bmN0aW9uIF91cGRhdGVBbmd1bGFyVmVsb2NpdGllcyhib2R5LCBkdCkge1xuICAgIGJvZHkuaW50ZWdyYXRlQW5ndWxhck1vbWVudHVtKGR0KTtcbiAgICBib2R5LnVwZGF0ZUFuZ3VsYXJWZWxvY2l0eSgpO1xuICAgIGlmICh0aGlzLm9wdGlvbnMuYW5ndWxhclZlbG9jaXR5Q2FwKVxuICAgICAgICBib2R5LmFuZ3VsYXJWZWxvY2l0eS5jYXAodGhpcy5vcHRpb25zLmFuZ3VsYXJWZWxvY2l0eUNhcCkucHV0KGJvZHkuYW5ndWxhclZlbG9jaXR5KTtcbn1cbmZ1bmN0aW9uIF91cGRhdGVPcmllbnRhdGlvbnMoYm9keSwgZHQpIHtcbiAgICBib2R5LmludGVncmF0ZU9yaWVudGF0aW9uKGR0KTtcbn1cbmZ1bmN0aW9uIF91cGRhdGVQb3NpdGlvbnMoYm9keSwgZHQpIHtcbiAgICBib2R5LmludGVncmF0ZVBvc2l0aW9uKGR0KTtcbiAgICBib2R5LmVtaXQoX2V2ZW50cy51cGRhdGUsIGJvZHkpO1xufVxuZnVuY3Rpb24gX2ludGVncmF0ZShkdCkge1xuICAgIF91cGRhdGVGb3JjZXMuY2FsbCh0aGlzLCBkdCk7XG4gICAgdGhpcy5mb3JFYWNoKF91cGRhdGVWZWxvY2l0aWVzLCBkdCk7XG4gICAgdGhpcy5mb3JFYWNoQm9keShfdXBkYXRlQW5ndWxhclZlbG9jaXRpZXMsIGR0KTtcbiAgICBfdXBkYXRlQ29uc3RyYWludHMuY2FsbCh0aGlzLCBkdCk7XG4gICAgdGhpcy5mb3JFYWNoQm9keShfdXBkYXRlT3JpZW50YXRpb25zLCBkdCk7XG4gICAgdGhpcy5mb3JFYWNoKF91cGRhdGVQb3NpdGlvbnMsIGR0KTtcbn1cbmZ1bmN0aW9uIF9nZXRQYXJ0aWNsZXNFbmVyZ3koKSB7XG4gICAgdmFyIGVuZXJneSA9IDA7XG4gICAgdmFyIHBhcnRpY2xlRW5lcmd5ID0gMDtcbiAgICB0aGlzLmZvckVhY2goZnVuY3Rpb24gKHBhcnRpY2xlKSB7XG4gICAgICAgIHBhcnRpY2xlRW5lcmd5ID0gcGFydGljbGUuZ2V0RW5lcmd5KCk7XG4gICAgICAgIGVuZXJneSArPSBwYXJ0aWNsZUVuZXJneTtcbiAgICB9KTtcbiAgICByZXR1cm4gZW5lcmd5O1xufVxuZnVuY3Rpb24gX2dldEFnZW50c0VuZXJneSgpIHtcbiAgICB2YXIgZW5lcmd5ID0gMDtcbiAgICBmb3IgKHZhciBpZCBpbiB0aGlzLl9hZ2VudERhdGEpXG4gICAgICAgIGVuZXJneSArPSB0aGlzLmdldEFnZW50RW5lcmd5KGlkKTtcbiAgICByZXR1cm4gZW5lcmd5O1xufVxuUGh5c2ljc0VuZ2luZS5wcm90b3R5cGUuZ2V0QWdlbnRFbmVyZ3kgPSBmdW5jdGlvbiAoYWdlbnRJZCkge1xuICAgIHZhciBhZ2VudERhdGEgPSBfZ2V0QWdlbnREYXRhLmNhbGwodGhpcywgYWdlbnRJZCk7XG4gICAgcmV0dXJuIGFnZW50RGF0YS5hZ2VudC5nZXRFbmVyZ3koYWdlbnREYXRhLnRhcmdldHMsIGFnZW50RGF0YS5zb3VyY2UpO1xufTtcblBoeXNpY3NFbmdpbmUucHJvdG90eXBlLmdldEVuZXJneSA9IGZ1bmN0aW9uIGdldEVuZXJneSgpIHtcbiAgICByZXR1cm4gX2dldFBhcnRpY2xlc0VuZXJneS5jYWxsKHRoaXMpICsgX2dldEFnZW50c0VuZXJneS5jYWxsKHRoaXMpO1xufTtcblBoeXNpY3NFbmdpbmUucHJvdG90eXBlLnN0ZXAgPSBmdW5jdGlvbiBzdGVwKCkge1xuICAgIGlmICh0aGlzLmlzU2xlZXBpbmcoKSlcbiAgICAgICAgcmV0dXJuO1xuICAgIHZhciBjdXJyVGltZSA9IG5vdygpO1xuICAgIHZhciBkdEZyYW1lID0gY3VyclRpbWUgLSB0aGlzLl9wcmV2VGltZTtcbiAgICB0aGlzLl9wcmV2VGltZSA9IGN1cnJUaW1lO1xuICAgIGlmIChkdEZyYW1lIDwgTUlOX1RJTUVfU1RFUClcbiAgICAgICAgcmV0dXJuO1xuICAgIGlmIChkdEZyYW1lID4gTUFYX1RJTUVfU1RFUClcbiAgICAgICAgZHRGcmFtZSA9IE1BWF9USU1FX1NURVA7XG4gICAgX2ludGVncmF0ZS5jYWxsKHRoaXMsIFRJTUVTVEVQKTtcbiAgICB0aGlzLmVtaXQoX2V2ZW50cy51cGRhdGUsIHRoaXMpO1xuICAgIGlmICh0aGlzLmdldEVuZXJneSgpIDwgdGhpcy5vcHRpb25zLnNsZWVwVG9sZXJhbmNlKVxuICAgICAgICB0aGlzLnNsZWVwKCk7XG59O1xuUGh5c2ljc0VuZ2luZS5wcm90b3R5cGUuaXNTbGVlcGluZyA9IGZ1bmN0aW9uIGlzU2xlZXBpbmcoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2lzU2xlZXBpbmc7XG59O1xuUGh5c2ljc0VuZ2luZS5wcm90b3R5cGUuaXNBY3RpdmUgPSBmdW5jdGlvbiBpc1NsZWVwaW5nKCkge1xuICAgIHJldHVybiAhdGhpcy5faXNTbGVlcGluZztcbn07XG5QaHlzaWNzRW5naW5lLnByb3RvdHlwZS5zbGVlcCA9IGZ1bmN0aW9uIHNsZWVwKCkge1xuICAgIGlmICh0aGlzLl9pc1NsZWVwaW5nKVxuICAgICAgICByZXR1cm47XG4gICAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uIChib2R5KSB7XG4gICAgICAgIGJvZHkuc2xlZXAoKTtcbiAgICB9KTtcbiAgICB0aGlzLmVtaXQoX2V2ZW50cy5lbmQsIHRoaXMpO1xuICAgIHRoaXMuX2lzU2xlZXBpbmcgPSB0cnVlO1xufTtcblBoeXNpY3NFbmdpbmUucHJvdG90eXBlLndha2UgPSBmdW5jdGlvbiB3YWtlKCkge1xuICAgIGlmICghdGhpcy5faXNTbGVlcGluZylcbiAgICAgICAgcmV0dXJuO1xuICAgIHRoaXMuX3ByZXZUaW1lID0gbm93KCk7XG4gICAgdGhpcy5lbWl0KF9ldmVudHMuc3RhcnQsIHRoaXMpO1xuICAgIHRoaXMuX2lzU2xlZXBpbmcgPSBmYWxzZTtcbn07XG5QaHlzaWNzRW5naW5lLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24gZW1pdCh0eXBlLCBkYXRhKSB7XG4gICAgaWYgKHRoaXMuX2V2ZW50SGFuZGxlciA9PT0gbnVsbClcbiAgICAgICAgcmV0dXJuO1xuICAgIHRoaXMuX2V2ZW50SGFuZGxlci5lbWl0KHR5cGUsIGRhdGEpO1xufTtcblBoeXNpY3NFbmdpbmUucHJvdG90eXBlLm9uID0gZnVuY3Rpb24gb24oZXZlbnQsIGZuKSB7XG4gICAgaWYgKHRoaXMuX2V2ZW50SGFuZGxlciA9PT0gbnVsbClcbiAgICAgICAgdGhpcy5fZXZlbnRIYW5kbGVyID0gbmV3IEV2ZW50SGFuZGxlcigpO1xuICAgIHRoaXMuX2V2ZW50SGFuZGxlci5vbihldmVudCwgZm4pO1xufTtcbm1vZHVsZS5leHBvcnRzID0gUGh5c2ljc0VuZ2luZTsiLCJ2YXIgUGFydGljbGUgPSByZXF1aXJlKCcuL1BhcnRpY2xlJyk7XG52YXIgVHJhbnNmb3JtID0gcmVxdWlyZSgnLi4vLi4vY29yZS9UcmFuc2Zvcm0nKTtcbnZhciBWZWN0b3IgPSByZXF1aXJlKCcuLi8uLi9tYXRoL1ZlY3RvcicpO1xudmFyIFF1YXRlcm5pb24gPSByZXF1aXJlKCcuLi8uLi9tYXRoL1F1YXRlcm5pb24nKTtcbnZhciBNYXRyaXggPSByZXF1aXJlKCcuLi8uLi9tYXRoL01hdHJpeCcpO1xudmFyIEludGVncmF0b3IgPSByZXF1aXJlKCcuLi9pbnRlZ3JhdG9ycy9TeW1wbGVjdGljRXVsZXInKTtcbmZ1bmN0aW9uIEJvZHkob3B0aW9ucykge1xuICAgIFBhcnRpY2xlLmNhbGwodGhpcywgb3B0aW9ucyk7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgdGhpcy5vcmllbnRhdGlvbiA9IG5ldyBRdWF0ZXJuaW9uKCk7XG4gICAgdGhpcy5hbmd1bGFyVmVsb2NpdHkgPSBuZXcgVmVjdG9yKCk7XG4gICAgdGhpcy5hbmd1bGFyTW9tZW50dW0gPSBuZXcgVmVjdG9yKCk7XG4gICAgdGhpcy50b3JxdWUgPSBuZXcgVmVjdG9yKCk7XG4gICAgaWYgKG9wdGlvbnMub3JpZW50YXRpb24pXG4gICAgICAgIHRoaXMub3JpZW50YXRpb24uc2V0KG9wdGlvbnMub3JpZW50YXRpb24pO1xuICAgIGlmIChvcHRpb25zLmFuZ3VsYXJWZWxvY2l0eSlcbiAgICAgICAgdGhpcy5hbmd1bGFyVmVsb2NpdHkuc2V0KG9wdGlvbnMuYW5ndWxhclZlbG9jaXR5KTtcbiAgICBpZiAob3B0aW9ucy5hbmd1bGFyTW9tZW50dW0pXG4gICAgICAgIHRoaXMuYW5ndWxhck1vbWVudHVtLnNldChvcHRpb25zLmFuZ3VsYXJNb21lbnR1bSk7XG4gICAgaWYgKG9wdGlvbnMudG9ycXVlKVxuICAgICAgICB0aGlzLnRvcnF1ZS5zZXQob3B0aW9ucy50b3JxdWUpO1xuICAgIHRoaXMuYW5ndWxhclZlbG9jaXR5LncgPSAwO1xuICAgIHRoaXMuc2V0TW9tZW50c09mSW5lcnRpYSgpO1xuICAgIHRoaXMucFdvcmxkID0gbmV3IFZlY3RvcigpO1xufVxuQm9keS5ERUZBVUxUX09QVElPTlMgPSBQYXJ0aWNsZS5ERUZBVUxUX09QVElPTlM7XG5Cb2R5LkRFRkFVTFRfT1BUSU9OUy5vcmllbnRhdGlvbiA9IFtcbiAgICAwLFxuICAgIDAsXG4gICAgMCxcbiAgICAxXG5dO1xuQm9keS5ERUZBVUxUX09QVElPTlMuYW5ndWxhclZlbG9jaXR5ID0gW1xuICAgIDAsXG4gICAgMCxcbiAgICAwXG5dO1xuQm9keS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBhcnRpY2xlLnByb3RvdHlwZSk7XG5Cb2R5LnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEJvZHk7XG5Cb2R5LnByb3RvdHlwZS5pc0JvZHkgPSB0cnVlO1xuQm9keS5wcm90b3R5cGUuc2V0TWFzcyA9IGZ1bmN0aW9uIHNldE1hc3MoKSB7XG4gICAgUGFydGljbGUucHJvdG90eXBlLnNldE1hc3MuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB0aGlzLnNldE1vbWVudHNPZkluZXJ0aWEoKTtcbn07XG5Cb2R5LnByb3RvdHlwZS5zZXRNb21lbnRzT2ZJbmVydGlhID0gZnVuY3Rpb24gc2V0TW9tZW50c09mSW5lcnRpYSgpIHtcbiAgICB0aGlzLmluZXJ0aWEgPSBuZXcgTWF0cml4KCk7XG4gICAgdGhpcy5pbnZlcnNlSW5lcnRpYSA9IG5ldyBNYXRyaXgoKTtcbn07XG5Cb2R5LnByb3RvdHlwZS51cGRhdGVBbmd1bGFyVmVsb2NpdHkgPSBmdW5jdGlvbiB1cGRhdGVBbmd1bGFyVmVsb2NpdHkoKSB7XG4gICAgdGhpcy5hbmd1bGFyVmVsb2NpdHkuc2V0KHRoaXMuaW52ZXJzZUluZXJ0aWEudmVjdG9yTXVsdGlwbHkodGhpcy5hbmd1bGFyTW9tZW50dW0pKTtcbn07XG5Cb2R5LnByb3RvdHlwZS50b1dvcmxkQ29vcmRpbmF0ZXMgPSBmdW5jdGlvbiB0b1dvcmxkQ29vcmRpbmF0ZXMobG9jYWxQb3NpdGlvbikge1xuICAgIHJldHVybiB0aGlzLnBXb3JsZC5zZXQodGhpcy5vcmllbnRhdGlvbi5yb3RhdGVWZWN0b3IobG9jYWxQb3NpdGlvbikpO1xufTtcbkJvZHkucHJvdG90eXBlLmdldEVuZXJneSA9IGZ1bmN0aW9uIGdldEVuZXJneSgpIHtcbiAgICByZXR1cm4gUGFydGljbGUucHJvdG90eXBlLmdldEVuZXJneS5jYWxsKHRoaXMpICsgMC41ICogdGhpcy5pbmVydGlhLnZlY3Rvck11bHRpcGx5KHRoaXMuYW5ndWxhclZlbG9jaXR5KS5kb3QodGhpcy5hbmd1bGFyVmVsb2NpdHkpO1xufTtcbkJvZHkucHJvdG90eXBlLnJlc2V0ID0gZnVuY3Rpb24gcmVzZXQocCwgdiwgcSwgTCkge1xuICAgIFBhcnRpY2xlLnByb3RvdHlwZS5yZXNldC5jYWxsKHRoaXMsIHAsIHYpO1xuICAgIHRoaXMuYW5ndWxhclZlbG9jaXR5LmNsZWFyKCk7XG4gICAgdGhpcy5zZXRPcmllbnRhdGlvbihxIHx8IFtcbiAgICAgICAgMSxcbiAgICAgICAgMCxcbiAgICAgICAgMCxcbiAgICAgICAgMFxuICAgIF0pO1xuICAgIHRoaXMuc2V0QW5ndWxhck1vbWVudHVtKEwgfHwgW1xuICAgICAgICAwLFxuICAgICAgICAwLFxuICAgICAgICAwXG4gICAgXSk7XG59O1xuQm9keS5wcm90b3R5cGUuc2V0T3JpZW50YXRpb24gPSBmdW5jdGlvbiBzZXRPcmllbnRhdGlvbihxKSB7XG4gICAgdGhpcy5vcmllbnRhdGlvbi5zZXQocSk7XG59O1xuQm9keS5wcm90b3R5cGUuc2V0QW5ndWxhclZlbG9jaXR5ID0gZnVuY3Rpb24gc2V0QW5ndWxhclZlbG9jaXR5KHcpIHtcbiAgICB0aGlzLndha2UoKTtcbiAgICB0aGlzLmFuZ3VsYXJWZWxvY2l0eS5zZXQodyk7XG59O1xuQm9keS5wcm90b3R5cGUuc2V0QW5ndWxhck1vbWVudHVtID0gZnVuY3Rpb24gc2V0QW5ndWxhck1vbWVudHVtKEwpIHtcbiAgICB0aGlzLndha2UoKTtcbiAgICB0aGlzLmFuZ3VsYXJNb21lbnR1bS5zZXQoTCk7XG59O1xuQm9keS5wcm90b3R5cGUuYXBwbHlGb3JjZSA9IGZ1bmN0aW9uIGFwcGx5Rm9yY2UoZm9yY2UsIGxvY2F0aW9uKSB7XG4gICAgUGFydGljbGUucHJvdG90eXBlLmFwcGx5Rm9yY2UuY2FsbCh0aGlzLCBmb3JjZSk7XG4gICAgaWYgKGxvY2F0aW9uICE9PSB1bmRlZmluZWQpXG4gICAgICAgIHRoaXMuYXBwbHlUb3JxdWUobG9jYXRpb24uY3Jvc3MoZm9yY2UpKTtcbn07XG5Cb2R5LnByb3RvdHlwZS5hcHBseVRvcnF1ZSA9IGZ1bmN0aW9uIGFwcGx5VG9ycXVlKHRvcnF1ZSkge1xuICAgIHRoaXMud2FrZSgpO1xuICAgIHRoaXMudG9ycXVlLnNldCh0aGlzLnRvcnF1ZS5hZGQodG9ycXVlKSk7XG59O1xuQm9keS5wcm90b3R5cGUuZ2V0VHJhbnNmb3JtID0gZnVuY3Rpb24gZ2V0VHJhbnNmb3JtKCkge1xuICAgIHJldHVybiBUcmFuc2Zvcm0udGhlbk1vdmUodGhpcy5vcmllbnRhdGlvbi5nZXRUcmFuc2Zvcm0oKSwgVHJhbnNmb3JtLmdldFRyYW5zbGF0ZShQYXJ0aWNsZS5wcm90b3R5cGUuZ2V0VHJhbnNmb3JtLmNhbGwodGhpcykpKTtcbn07XG5Cb2R5LnByb3RvdHlwZS5faW50ZWdyYXRlID0gZnVuY3Rpb24gX2ludGVncmF0ZShkdCkge1xuICAgIFBhcnRpY2xlLnByb3RvdHlwZS5faW50ZWdyYXRlLmNhbGwodGhpcywgZHQpO1xuICAgIHRoaXMuaW50ZWdyYXRlQW5ndWxhck1vbWVudHVtKGR0KTtcbiAgICB0aGlzLnVwZGF0ZUFuZ3VsYXJWZWxvY2l0eShkdCk7XG4gICAgdGhpcy5pbnRlZ3JhdGVPcmllbnRhdGlvbihkdCk7XG59O1xuQm9keS5wcm90b3R5cGUuaW50ZWdyYXRlQW5ndWxhck1vbWVudHVtID0gZnVuY3Rpb24gaW50ZWdyYXRlQW5ndWxhck1vbWVudHVtKGR0KSB7XG4gICAgSW50ZWdyYXRvci5pbnRlZ3JhdGVBbmd1bGFyTW9tZW50dW0odGhpcywgZHQpO1xufTtcbkJvZHkucHJvdG90eXBlLmludGVncmF0ZU9yaWVudGF0aW9uID0gZnVuY3Rpb24gaW50ZWdyYXRlT3JpZW50YXRpb24oZHQpIHtcbiAgICBJbnRlZ3JhdG9yLmludGVncmF0ZU9yaWVudGF0aW9uKHRoaXMsIGR0KTtcbn07XG5tb2R1bGUuZXhwb3J0cyA9IEJvZHk7IiwidmFyIEJvZHkgPSByZXF1aXJlKCcuL0JvZHknKTtcbnZhciBNYXRyaXggPSByZXF1aXJlKCcuLi8uLi9tYXRoL01hdHJpeCcpO1xuZnVuY3Rpb24gQ2lyY2xlKG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICB0aGlzLnNldFJhZGl1cyhvcHRpb25zLnJhZGl1cyB8fCAwKTtcbiAgICBCb2R5LmNhbGwodGhpcywgb3B0aW9ucyk7XG59XG5DaXJjbGUucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShCb2R5LnByb3RvdHlwZSk7XG5DaXJjbGUucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQ2lyY2xlO1xuQ2lyY2xlLnByb3RvdHlwZS5zZXRSYWRpdXMgPSBmdW5jdGlvbiBzZXRSYWRpdXMocikge1xuICAgIHRoaXMucmFkaXVzID0gcjtcbiAgICB0aGlzLnNpemUgPSBbXG4gICAgICAgIDIgKiB0aGlzLnJhZGl1cyxcbiAgICAgICAgMiAqIHRoaXMucmFkaXVzXG4gICAgXTtcbiAgICB0aGlzLnNldE1vbWVudHNPZkluZXJ0aWEoKTtcbn07XG5DaXJjbGUucHJvdG90eXBlLnNldE1vbWVudHNPZkluZXJ0aWEgPSBmdW5jdGlvbiBzZXRNb21lbnRzT2ZJbmVydGlhKCkge1xuICAgIHZhciBtID0gdGhpcy5tYXNzO1xuICAgIHZhciByID0gdGhpcy5yYWRpdXM7XG4gICAgdGhpcy5pbmVydGlhID0gbmV3IE1hdHJpeChbXG4gICAgICAgIFtcbiAgICAgICAgICAgIDAuMjUgKiBtICogciAqIHIsXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMFxuICAgICAgICBdLFxuICAgICAgICBbXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMC4yNSAqIG0gKiByICogcixcbiAgICAgICAgICAgIDBcbiAgICAgICAgXSxcbiAgICAgICAgW1xuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAwLjUgKiBtICogciAqIHJcbiAgICAgICAgXVxuICAgIF0pO1xuICAgIHRoaXMuaW52ZXJzZUluZXJ0aWEgPSBuZXcgTWF0cml4KFtcbiAgICAgICAgW1xuICAgICAgICAgICAgNCAvIChtICogciAqIHIpLFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDBcbiAgICAgICAgXSxcbiAgICAgICAgW1xuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDQgLyAobSAqIHIgKiByKSxcbiAgICAgICAgICAgIDBcbiAgICAgICAgXSxcbiAgICAgICAgW1xuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAyIC8gKG0gKiByICogcilcbiAgICAgICAgXVxuICAgIF0pO1xufTtcbm1vZHVsZS5leHBvcnRzID0gQ2lyY2xlOyIsInZhciBWZWN0b3IgPSByZXF1aXJlKCcuLi8uLi9tYXRoL1ZlY3RvcicpO1xudmFyIFRyYW5zZm9ybSA9IHJlcXVpcmUoJy4uLy4uL2NvcmUvVHJhbnNmb3JtJyk7XG52YXIgRXZlbnRIYW5kbGVyID0gcmVxdWlyZSgnLi4vLi4vY29yZS9FdmVudEhhbmRsZXInKTtcbnZhciBJbnRlZ3JhdG9yID0gcmVxdWlyZSgnLi4vaW50ZWdyYXRvcnMvU3ltcGxlY3RpY0V1bGVyJyk7XG5mdW5jdGlvbiBQYXJ0aWNsZShvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgdmFyIGRlZmF1bHRzID0gUGFydGljbGUuREVGQVVMVF9PUFRJT05TO1xuICAgIHRoaXMucG9zaXRpb24gPSBuZXcgVmVjdG9yKCk7XG4gICAgdGhpcy52ZWxvY2l0eSA9IG5ldyBWZWN0b3IoKTtcbiAgICB0aGlzLmZvcmNlID0gbmV3IFZlY3RvcigpO1xuICAgIHRoaXMuX2VuZ2luZSA9IG51bGw7XG4gICAgdGhpcy5faXNTbGVlcGluZyA9IHRydWU7XG4gICAgdGhpcy5fZXZlbnRPdXRwdXQgPSBudWxsO1xuICAgIHRoaXMubWFzcyA9IG9wdGlvbnMubWFzcyAhPT0gdW5kZWZpbmVkID8gb3B0aW9ucy5tYXNzIDogZGVmYXVsdHMubWFzcztcbiAgICB0aGlzLmludmVyc2VNYXNzID0gMSAvIHRoaXMubWFzcztcbiAgICB0aGlzLnNldFBvc2l0aW9uKG9wdGlvbnMucG9zaXRpb24gfHwgZGVmYXVsdHMucG9zaXRpb24pO1xuICAgIHRoaXMuc2V0VmVsb2NpdHkob3B0aW9ucy52ZWxvY2l0eSB8fCBkZWZhdWx0cy52ZWxvY2l0eSk7XG4gICAgdGhpcy5mb3JjZS5zZXQob3B0aW9ucy5mb3JjZSB8fCBbXG4gICAgICAgIDAsXG4gICAgICAgIDAsXG4gICAgICAgIDBcbiAgICBdKTtcbiAgICB0aGlzLnRyYW5zZm9ybSA9IFRyYW5zZm9ybS5pZGVudGl0eS5zbGljZSgpO1xuICAgIHRoaXMuX3NwZWMgPSB7XG4gICAgICAgIHNpemU6IFtcbiAgICAgICAgICAgIHRydWUsXG4gICAgICAgICAgICB0cnVlXG4gICAgICAgIF0sXG4gICAgICAgIHRhcmdldDoge1xuICAgICAgICAgICAgdHJhbnNmb3JtOiB0aGlzLnRyYW5zZm9ybSxcbiAgICAgICAgICAgIG9yaWdpbjogW1xuICAgICAgICAgICAgICAgIDAuNSxcbiAgICAgICAgICAgICAgICAwLjVcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICB0YXJnZXQ6IG51bGxcbiAgICAgICAgfVxuICAgIH07XG59XG5QYXJ0aWNsZS5ERUZBVUxUX09QVElPTlMgPSB7XG4gICAgcG9zaXRpb246IFtcbiAgICAgICAgMCxcbiAgICAgICAgMCxcbiAgICAgICAgMFxuICAgIF0sXG4gICAgdmVsb2NpdHk6IFtcbiAgICAgICAgMCxcbiAgICAgICAgMCxcbiAgICAgICAgMFxuICAgIF0sXG4gICAgbWFzczogMVxufTtcbnZhciBfZXZlbnRzID0ge1xuICAgICAgICBzdGFydDogJ3N0YXJ0JyxcbiAgICAgICAgdXBkYXRlOiAndXBkYXRlJyxcbiAgICAgICAgZW5kOiAnZW5kJ1xuICAgIH07XG52YXIgbm93ID0gRGF0ZS5ub3c7XG5QYXJ0aWNsZS5wcm90b3R5cGUuaXNCb2R5ID0gZmFsc2U7XG5QYXJ0aWNsZS5wcm90b3R5cGUuaXNBY3RpdmUgPSBmdW5jdGlvbiBpc0FjdGl2ZSgpIHtcbiAgICByZXR1cm4gIXRoaXMuX2lzU2xlZXBpbmc7XG59O1xuUGFydGljbGUucHJvdG90eXBlLnNsZWVwID0gZnVuY3Rpb24gc2xlZXAoKSB7XG4gICAgaWYgKHRoaXMuX2lzU2xlZXBpbmcpXG4gICAgICAgIHJldHVybjtcbiAgICB0aGlzLmVtaXQoX2V2ZW50cy5lbmQsIHRoaXMpO1xuICAgIHRoaXMuX2lzU2xlZXBpbmcgPSB0cnVlO1xufTtcblBhcnRpY2xlLnByb3RvdHlwZS53YWtlID0gZnVuY3Rpb24gd2FrZSgpIHtcbiAgICBpZiAoIXRoaXMuX2lzU2xlZXBpbmcpXG4gICAgICAgIHJldHVybjtcbiAgICB0aGlzLmVtaXQoX2V2ZW50cy5zdGFydCwgdGhpcyk7XG4gICAgdGhpcy5faXNTbGVlcGluZyA9IGZhbHNlO1xuICAgIHRoaXMuX3ByZXZUaW1lID0gbm93KCk7XG4gICAgaWYgKHRoaXMuX2VuZ2luZSlcbiAgICAgICAgdGhpcy5fZW5naW5lLndha2UoKTtcbn07XG5QYXJ0aWNsZS5wcm90b3R5cGUuc2V0UG9zaXRpb24gPSBmdW5jdGlvbiBzZXRQb3NpdGlvbihwb3NpdGlvbikge1xuICAgIHRoaXMucG9zaXRpb24uc2V0KHBvc2l0aW9uKTtcbn07XG5QYXJ0aWNsZS5wcm90b3R5cGUuc2V0UG9zaXRpb24xRCA9IGZ1bmN0aW9uIHNldFBvc2l0aW9uMUQoeCkge1xuICAgIHRoaXMucG9zaXRpb24ueCA9IHg7XG59O1xuUGFydGljbGUucHJvdG90eXBlLmdldFBvc2l0aW9uID0gZnVuY3Rpb24gZ2V0UG9zaXRpb24oKSB7XG4gICAgdGhpcy5fZW5naW5lLnN0ZXAoKTtcbiAgICByZXR1cm4gdGhpcy5wb3NpdGlvbi5nZXQoKTtcbn07XG5QYXJ0aWNsZS5wcm90b3R5cGUuZ2V0UG9zaXRpb24xRCA9IGZ1bmN0aW9uIGdldFBvc2l0aW9uMUQoKSB7XG4gICAgdGhpcy5fZW5naW5lLnN0ZXAoKTtcbiAgICByZXR1cm4gdGhpcy5wb3NpdGlvbi54O1xufTtcblBhcnRpY2xlLnByb3RvdHlwZS5zZXRWZWxvY2l0eSA9IGZ1bmN0aW9uIHNldFZlbG9jaXR5KHZlbG9jaXR5KSB7XG4gICAgdGhpcy52ZWxvY2l0eS5zZXQodmVsb2NpdHkpO1xuICAgIGlmICghKHZlbG9jaXR5WzBdID09PSAwICYmIHZlbG9jaXR5WzFdID09PSAwICYmIHZlbG9jaXR5WzJdID09PSAwKSlcbiAgICAgICAgdGhpcy53YWtlKCk7XG59O1xuUGFydGljbGUucHJvdG90eXBlLnNldFZlbG9jaXR5MUQgPSBmdW5jdGlvbiBzZXRWZWxvY2l0eTFEKHgpIHtcbiAgICB0aGlzLnZlbG9jaXR5LnggPSB4O1xuICAgIGlmICh4ICE9PSAwKVxuICAgICAgICB0aGlzLndha2UoKTtcbn07XG5QYXJ0aWNsZS5wcm90b3R5cGUuZ2V0VmVsb2NpdHkgPSBmdW5jdGlvbiBnZXRWZWxvY2l0eSgpIHtcbiAgICByZXR1cm4gdGhpcy52ZWxvY2l0eS5nZXQoKTtcbn07XG5QYXJ0aWNsZS5wcm90b3R5cGUuc2V0Rm9yY2UgPSBmdW5jdGlvbiBzZXRGb3JjZShmb3JjZSkge1xuICAgIHRoaXMuZm9yY2Uuc2V0KGZvcmNlKTtcbiAgICB0aGlzLndha2UoKTtcbn07XG5QYXJ0aWNsZS5wcm90b3R5cGUuZ2V0VmVsb2NpdHkxRCA9IGZ1bmN0aW9uIGdldFZlbG9jaXR5MUQoKSB7XG4gICAgcmV0dXJuIHRoaXMudmVsb2NpdHkueDtcbn07XG5QYXJ0aWNsZS5wcm90b3R5cGUuc2V0TWFzcyA9IGZ1bmN0aW9uIHNldE1hc3MobWFzcykge1xuICAgIHRoaXMubWFzcyA9IG1hc3M7XG4gICAgdGhpcy5pbnZlcnNlTWFzcyA9IDEgLyBtYXNzO1xufTtcblBhcnRpY2xlLnByb3RvdHlwZS5nZXRNYXNzID0gZnVuY3Rpb24gZ2V0TWFzcygpIHtcbiAgICByZXR1cm4gdGhpcy5tYXNzO1xufTtcblBhcnRpY2xlLnByb3RvdHlwZS5yZXNldCA9IGZ1bmN0aW9uIHJlc2V0KHBvc2l0aW9uLCB2ZWxvY2l0eSkge1xuICAgIHRoaXMuc2V0UG9zaXRpb24ocG9zaXRpb24gfHwgW1xuICAgICAgICAwLFxuICAgICAgICAwLFxuICAgICAgICAwXG4gICAgXSk7XG4gICAgdGhpcy5zZXRWZWxvY2l0eSh2ZWxvY2l0eSB8fCBbXG4gICAgICAgIDAsXG4gICAgICAgIDAsXG4gICAgICAgIDBcbiAgICBdKTtcbn07XG5QYXJ0aWNsZS5wcm90b3R5cGUuYXBwbHlGb3JjZSA9IGZ1bmN0aW9uIGFwcGx5Rm9yY2UoZm9yY2UpIHtcbiAgICBpZiAoZm9yY2UuaXNaZXJvKCkpXG4gICAgICAgIHJldHVybjtcbiAgICB0aGlzLmZvcmNlLmFkZChmb3JjZSkucHV0KHRoaXMuZm9yY2UpO1xuICAgIHRoaXMud2FrZSgpO1xufTtcblBhcnRpY2xlLnByb3RvdHlwZS5hcHBseUltcHVsc2UgPSBmdW5jdGlvbiBhcHBseUltcHVsc2UoaW1wdWxzZSkge1xuICAgIGlmIChpbXB1bHNlLmlzWmVybygpKVxuICAgICAgICByZXR1cm47XG4gICAgdmFyIHZlbG9jaXR5ID0gdGhpcy52ZWxvY2l0eTtcbiAgICB2ZWxvY2l0eS5hZGQoaW1wdWxzZS5tdWx0KHRoaXMuaW52ZXJzZU1hc3MpKS5wdXQodmVsb2NpdHkpO1xufTtcblBhcnRpY2xlLnByb3RvdHlwZS5pbnRlZ3JhdGVWZWxvY2l0eSA9IGZ1bmN0aW9uIGludGVncmF0ZVZlbG9jaXR5KGR0KSB7XG4gICAgSW50ZWdyYXRvci5pbnRlZ3JhdGVWZWxvY2l0eSh0aGlzLCBkdCk7XG59O1xuUGFydGljbGUucHJvdG90eXBlLmludGVncmF0ZVBvc2l0aW9uID0gZnVuY3Rpb24gaW50ZWdyYXRlUG9zaXRpb24oZHQpIHtcbiAgICBJbnRlZ3JhdG9yLmludGVncmF0ZVBvc2l0aW9uKHRoaXMsIGR0KTtcbn07XG5QYXJ0aWNsZS5wcm90b3R5cGUuX2ludGVncmF0ZSA9IGZ1bmN0aW9uIF9pbnRlZ3JhdGUoZHQpIHtcbiAgICB0aGlzLmludGVncmF0ZVZlbG9jaXR5KGR0KTtcbiAgICB0aGlzLmludGVncmF0ZVBvc2l0aW9uKGR0KTtcbn07XG5QYXJ0aWNsZS5wcm90b3R5cGUuZ2V0RW5lcmd5ID0gZnVuY3Rpb24gZ2V0RW5lcmd5KCkge1xuICAgIHJldHVybiAwLjUgKiB0aGlzLm1hc3MgKiB0aGlzLnZlbG9jaXR5Lm5vcm1TcXVhcmVkKCk7XG59O1xuUGFydGljbGUucHJvdG90eXBlLmdldFRyYW5zZm9ybSA9IGZ1bmN0aW9uIGdldFRyYW5zZm9ybSgpIHtcbiAgICB0aGlzLl9lbmdpbmUuc3RlcCgpO1xuICAgIHZhciBwb3NpdGlvbiA9IHRoaXMucG9zaXRpb247XG4gICAgdmFyIHRyYW5zZm9ybSA9IHRoaXMudHJhbnNmb3JtO1xuICAgIHRyYW5zZm9ybVsxMl0gPSBwb3NpdGlvbi54O1xuICAgIHRyYW5zZm9ybVsxM10gPSBwb3NpdGlvbi55O1xuICAgIHRyYW5zZm9ybVsxNF0gPSBwb3NpdGlvbi56O1xuICAgIHJldHVybiB0cmFuc2Zvcm07XG59O1xuUGFydGljbGUucHJvdG90eXBlLm1vZGlmeSA9IGZ1bmN0aW9uIG1vZGlmeSh0YXJnZXQpIHtcbiAgICB2YXIgX3NwZWMgPSB0aGlzLl9zcGVjLnRhcmdldDtcbiAgICBfc3BlYy50cmFuc2Zvcm0gPSB0aGlzLmdldFRyYW5zZm9ybSgpO1xuICAgIF9zcGVjLnRhcmdldCA9IHRhcmdldDtcbiAgICByZXR1cm4gdGhpcy5fc3BlYztcbn07XG5mdW5jdGlvbiBfY3JlYXRlRXZlbnRPdXRwdXQoKSB7XG4gICAgdGhpcy5fZXZlbnRPdXRwdXQgPSBuZXcgRXZlbnRIYW5kbGVyKCk7XG4gICAgdGhpcy5fZXZlbnRPdXRwdXQuYmluZFRoaXModGhpcyk7XG4gICAgRXZlbnRIYW5kbGVyLnNldE91dHB1dEhhbmRsZXIodGhpcywgdGhpcy5fZXZlbnRPdXRwdXQpO1xufVxuUGFydGljbGUucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbiBlbWl0KHR5cGUsIGRhdGEpIHtcbiAgICBpZiAoIXRoaXMuX2V2ZW50T3V0cHV0KVxuICAgICAgICByZXR1cm47XG4gICAgdGhpcy5fZXZlbnRPdXRwdXQuZW1pdCh0eXBlLCBkYXRhKTtcbn07XG5QYXJ0aWNsZS5wcm90b3R5cGUub24gPSBmdW5jdGlvbiBvbigpIHtcbiAgICBfY3JlYXRlRXZlbnRPdXRwdXQuY2FsbCh0aGlzKTtcbiAgICByZXR1cm4gdGhpcy5vbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xufTtcblBhcnRpY2xlLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9IGZ1bmN0aW9uIHJlbW92ZUxpc3RlbmVyKCkge1xuICAgIF9jcmVhdGVFdmVudE91dHB1dC5jYWxsKHRoaXMpO1xuICAgIHJldHVybiB0aGlzLnJlbW92ZUxpc3RlbmVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG59O1xuUGFydGljbGUucHJvdG90eXBlLnBpcGUgPSBmdW5jdGlvbiBwaXBlKCkge1xuICAgIF9jcmVhdGVFdmVudE91dHB1dC5jYWxsKHRoaXMpO1xuICAgIHJldHVybiB0aGlzLnBpcGUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn07XG5QYXJ0aWNsZS5wcm90b3R5cGUudW5waXBlID0gZnVuY3Rpb24gdW5waXBlKCkge1xuICAgIF9jcmVhdGVFdmVudE91dHB1dC5jYWxsKHRoaXMpO1xuICAgIHJldHVybiB0aGlzLnVucGlwZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xufTtcbm1vZHVsZS5leHBvcnRzID0gUGFydGljbGU7IiwidmFyIENvbnN0cmFpbnQgPSByZXF1aXJlKCcuL0NvbnN0cmFpbnQnKTtcbnZhciBWZWN0b3IgPSByZXF1aXJlKCcuLi8uLi9tYXRoL1ZlY3RvcicpO1xuZnVuY3Rpb24gQ29sbGlzaW9uKG9wdGlvbnMpIHtcbiAgICB0aGlzLm9wdGlvbnMgPSBPYmplY3QuY3JlYXRlKENvbGxpc2lvbi5ERUZBVUxUX09QVElPTlMpO1xuICAgIGlmIChvcHRpb25zKVxuICAgICAgICB0aGlzLnNldE9wdGlvbnMob3B0aW9ucyk7XG4gICAgdGhpcy5ub3JtYWwgPSBuZXcgVmVjdG9yKCk7XG4gICAgdGhpcy5wRGlmZiA9IG5ldyBWZWN0b3IoKTtcbiAgICB0aGlzLnZEaWZmID0gbmV3IFZlY3RvcigpO1xuICAgIHRoaXMuaW1wdWxzZTEgPSBuZXcgVmVjdG9yKCk7XG4gICAgdGhpcy5pbXB1bHNlMiA9IG5ldyBWZWN0b3IoKTtcbiAgICBDb25zdHJhaW50LmNhbGwodGhpcyk7XG59XG5Db2xsaXNpb24ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShDb25zdHJhaW50LnByb3RvdHlwZSk7XG5Db2xsaXNpb24ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQ29sbGlzaW9uO1xuQ29sbGlzaW9uLkRFRkFVTFRfT1BUSU9OUyA9IHtcbiAgICByZXN0aXR1dGlvbjogMC41LFxuICAgIGRyaWZ0OiAwLjUsXG4gICAgc2xvcDogMFxufTtcbmZ1bmN0aW9uIF9ub3JtYWxWZWxvY2l0eShwYXJ0aWNsZTEsIHBhcnRpY2xlMikge1xuICAgIHJldHVybiBwYXJ0aWNsZTEudmVsb2NpdHkuZG90KHBhcnRpY2xlMi52ZWxvY2l0eSk7XG59XG5Db2xsaXNpb24ucHJvdG90eXBlLnNldE9wdGlvbnMgPSBmdW5jdGlvbiBzZXRPcHRpb25zKG9wdGlvbnMpIHtcbiAgICBmb3IgKHZhciBrZXkgaW4gb3B0aW9ucylcbiAgICAgICAgdGhpcy5vcHRpb25zW2tleV0gPSBvcHRpb25zW2tleV07XG59O1xuQ29sbGlzaW9uLnByb3RvdHlwZS5hcHBseUNvbnN0cmFpbnQgPSBmdW5jdGlvbiBhcHBseUNvbnN0cmFpbnQodGFyZ2V0cywgc291cmNlLCBkdCkge1xuICAgIGlmIChzb3VyY2UgPT09IHVuZGVmaW5lZClcbiAgICAgICAgcmV0dXJuO1xuICAgIHZhciB2MSA9IHNvdXJjZS52ZWxvY2l0eTtcbiAgICB2YXIgcDEgPSBzb3VyY2UucG9zaXRpb247XG4gICAgdmFyIHcxID0gc291cmNlLmludmVyc2VNYXNzO1xuICAgIHZhciByMSA9IHNvdXJjZS5yYWRpdXM7XG4gICAgdmFyIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnM7XG4gICAgdmFyIGRyaWZ0ID0gb3B0aW9ucy5kcmlmdDtcbiAgICB2YXIgc2xvcCA9IC1vcHRpb25zLnNsb3A7XG4gICAgdmFyIHJlc3RpdHV0aW9uID0gb3B0aW9ucy5yZXN0aXR1dGlvbjtcbiAgICB2YXIgbiA9IHRoaXMubm9ybWFsO1xuICAgIHZhciBwRGlmZiA9IHRoaXMucERpZmY7XG4gICAgdmFyIHZEaWZmID0gdGhpcy52RGlmZjtcbiAgICB2YXIgaW1wdWxzZTEgPSB0aGlzLmltcHVsc2UxO1xuICAgIHZhciBpbXB1bHNlMiA9IHRoaXMuaW1wdWxzZTI7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0YXJnZXRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciB0YXJnZXQgPSB0YXJnZXRzW2ldO1xuICAgICAgICBpZiAodGFyZ2V0ID09PSBzb3VyY2UpXG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgdmFyIHYyID0gdGFyZ2V0LnZlbG9jaXR5O1xuICAgICAgICB2YXIgcDIgPSB0YXJnZXQucG9zaXRpb247XG4gICAgICAgIHZhciB3MiA9IHRhcmdldC5pbnZlcnNlTWFzcztcbiAgICAgICAgdmFyIHIyID0gdGFyZ2V0LnJhZGl1cztcbiAgICAgICAgcERpZmYuc2V0KHAyLnN1YihwMSkpO1xuICAgICAgICB2RGlmZi5zZXQodjIuc3ViKHYxKSk7XG4gICAgICAgIHZhciBkaXN0ID0gcERpZmYubm9ybSgpO1xuICAgICAgICB2YXIgb3ZlcmxhcCA9IGRpc3QgLSAocjEgKyByMik7XG4gICAgICAgIHZhciBlZmZNYXNzID0gMSAvICh3MSArIHcyKTtcbiAgICAgICAgdmFyIGdhbW1hID0gMDtcbiAgICAgICAgaWYgKG92ZXJsYXAgPCAwKSB7XG4gICAgICAgICAgICBuLnNldChwRGlmZi5ub3JtYWxpemUoKSk7XG4gICAgICAgICAgICBpZiAodGhpcy5fZXZlbnRPdXRwdXQpIHtcbiAgICAgICAgICAgICAgICB2YXIgY29sbGlzaW9uRGF0YSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldDogdGFyZ2V0LFxuICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlOiBzb3VyY2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBvdmVybGFwOiBvdmVybGFwLFxuICAgICAgICAgICAgICAgICAgICAgICAgbm9ybWFsOiBuXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgdGhpcy5fZXZlbnRPdXRwdXQuZW1pdCgncHJlQ29sbGlzaW9uJywgY29sbGlzaW9uRGF0YSk7XG4gICAgICAgICAgICAgICAgdGhpcy5fZXZlbnRPdXRwdXQuZW1pdCgnY29sbGlzaW9uJywgY29sbGlzaW9uRGF0YSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgbGFtYmRhID0gb3ZlcmxhcCA8PSBzbG9wID8gKCgxICsgcmVzdGl0dXRpb24pICogbi5kb3QodkRpZmYpICsgZHJpZnQgLyBkdCAqIChvdmVybGFwIC0gc2xvcCkpIC8gKGdhbW1hICsgZHQgLyBlZmZNYXNzKSA6ICgxICsgcmVzdGl0dXRpb24pICogbi5kb3QodkRpZmYpIC8gKGdhbW1hICsgZHQgLyBlZmZNYXNzKTtcbiAgICAgICAgICAgIG4ubXVsdChkdCAqIGxhbWJkYSkucHV0KGltcHVsc2UxKTtcbiAgICAgICAgICAgIGltcHVsc2UxLm11bHQoLTEpLnB1dChpbXB1bHNlMik7XG4gICAgICAgICAgICBzb3VyY2UuYXBwbHlJbXB1bHNlKGltcHVsc2UxKTtcbiAgICAgICAgICAgIHRhcmdldC5hcHBseUltcHVsc2UoaW1wdWxzZTIpO1xuICAgICAgICAgICAgaWYgKHRoaXMuX2V2ZW50T3V0cHV0KVxuICAgICAgICAgICAgICAgIHRoaXMuX2V2ZW50T3V0cHV0LmVtaXQoJ3Bvc3RDb2xsaXNpb24nLCBjb2xsaXNpb25EYXRhKTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5tb2R1bGUuZXhwb3J0cyA9IENvbGxpc2lvbjsiLCJ2YXIgRXZlbnRIYW5kbGVyID0gcmVxdWlyZSgnLi4vLi4vY29yZS9FdmVudEhhbmRsZXInKTtcbmZ1bmN0aW9uIENvbnN0cmFpbnQoKSB7XG4gICAgdGhpcy5vcHRpb25zID0gdGhpcy5vcHRpb25zIHx8IHt9O1xuICAgIHRoaXMuX2V2ZW50T3V0cHV0ID0gbmV3IEV2ZW50SGFuZGxlcigpO1xuICAgIEV2ZW50SGFuZGxlci5zZXRPdXRwdXRIYW5kbGVyKHRoaXMsIHRoaXMuX2V2ZW50T3V0cHV0KTtcbn1cbkNvbnN0cmFpbnQucHJvdG90eXBlLnNldE9wdGlvbnMgPSBmdW5jdGlvbiBzZXRPcHRpb25zKG9wdGlvbnMpIHtcbiAgICB0aGlzLl9ldmVudE91dHB1dC5lbWl0KCdjaGFuZ2UnLCBvcHRpb25zKTtcbn07XG5Db25zdHJhaW50LnByb3RvdHlwZS5hcHBseUNvbnN0cmFpbnQgPSBmdW5jdGlvbiBhcHBseUNvbnN0cmFpbnQoKSB7XG59O1xuQ29uc3RyYWludC5wcm90b3R5cGUuZ2V0RW5lcmd5ID0gZnVuY3Rpb24gZ2V0RW5lcmd5KCkge1xuICAgIHJldHVybiAwO1xufTtcbm1vZHVsZS5leHBvcnRzID0gQ29uc3RyYWludDsiLCJ2YXIgQ29uc3RyYWludCA9IHJlcXVpcmUoJy4vQ29uc3RyYWludCcpO1xudmFyIFZlY3RvciA9IHJlcXVpcmUoJy4uLy4uL21hdGgvVmVjdG9yJyk7XG5mdW5jdGlvbiBXYWxsKG9wdGlvbnMpIHtcbiAgICB0aGlzLm9wdGlvbnMgPSBPYmplY3QuY3JlYXRlKFdhbGwuREVGQVVMVF9PUFRJT05TKTtcbiAgICBpZiAob3B0aW9ucylcbiAgICAgICAgdGhpcy5zZXRPcHRpb25zKG9wdGlvbnMpO1xuICAgIHRoaXMuZGlmZiA9IG5ldyBWZWN0b3IoKTtcbiAgICB0aGlzLmltcHVsc2UgPSBuZXcgVmVjdG9yKCk7XG4gICAgQ29uc3RyYWludC5jYWxsKHRoaXMpO1xufVxuV2FsbC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKENvbnN0cmFpbnQucHJvdG90eXBlKTtcbldhbGwucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gV2FsbDtcbldhbGwuT05fQ09OVEFDVCA9IHtcbiAgICBSRUZMRUNUOiAwLFxuICAgIFNJTEVOVDogMVxufTtcbldhbGwuREVGQVVMVF9PUFRJT05TID0ge1xuICAgIHJlc3RpdHV0aW9uOiAwLjUsXG4gICAgZHJpZnQ6IDAuNSxcbiAgICBzbG9wOiAwLFxuICAgIG5vcm1hbDogW1xuICAgICAgICAxLFxuICAgICAgICAwLFxuICAgICAgICAwXG4gICAgXSxcbiAgICBkaXN0YW5jZTogMCxcbiAgICBvbkNvbnRhY3Q6IFdhbGwuT05fQ09OVEFDVC5SRUZMRUNUXG59O1xuV2FsbC5wcm90b3R5cGUuc2V0T3B0aW9ucyA9IGZ1bmN0aW9uIHNldE9wdGlvbnMob3B0aW9ucykge1xuICAgIGlmIChvcHRpb25zLm5vcm1hbCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGlmIChvcHRpb25zLm5vcm1hbCBpbnN0YW5jZW9mIFZlY3RvcilcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5ub3JtYWwgPSBvcHRpb25zLm5vcm1hbC5jbG9uZSgpO1xuICAgICAgICBpZiAob3B0aW9ucy5ub3JtYWwgaW5zdGFuY2VvZiBBcnJheSlcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5ub3JtYWwgPSBuZXcgVmVjdG9yKG9wdGlvbnMubm9ybWFsKTtcbiAgICB9XG4gICAgaWYgKG9wdGlvbnMucmVzdGl0dXRpb24gIT09IHVuZGVmaW5lZClcbiAgICAgICAgdGhpcy5vcHRpb25zLnJlc3RpdHV0aW9uID0gb3B0aW9ucy5yZXN0aXR1dGlvbjtcbiAgICBpZiAob3B0aW9ucy5kcmlmdCAhPT0gdW5kZWZpbmVkKVxuICAgICAgICB0aGlzLm9wdGlvbnMuZHJpZnQgPSBvcHRpb25zLmRyaWZ0O1xuICAgIGlmIChvcHRpb25zLnNsb3AgIT09IHVuZGVmaW5lZClcbiAgICAgICAgdGhpcy5vcHRpb25zLnNsb3AgPSBvcHRpb25zLnNsb3A7XG4gICAgaWYgKG9wdGlvbnMuZGlzdGFuY2UgIT09IHVuZGVmaW5lZClcbiAgICAgICAgdGhpcy5vcHRpb25zLmRpc3RhbmNlID0gb3B0aW9ucy5kaXN0YW5jZTtcbiAgICBpZiAob3B0aW9ucy5vbkNvbnRhY3QgIT09IHVuZGVmaW5lZClcbiAgICAgICAgdGhpcy5vcHRpb25zLm9uQ29udGFjdCA9IG9wdGlvbnMub25Db250YWN0O1xufTtcbmZ1bmN0aW9uIF9nZXROb3JtYWxWZWxvY2l0eShuLCB2KSB7XG4gICAgcmV0dXJuIHYuZG90KG4pO1xufVxuZnVuY3Rpb24gX2dldERpc3RhbmNlRnJvbU9yaWdpbihwKSB7XG4gICAgdmFyIG4gPSB0aGlzLm9wdGlvbnMubm9ybWFsO1xuICAgIHZhciBkID0gdGhpcy5vcHRpb25zLmRpc3RhbmNlO1xuICAgIHJldHVybiBwLmRvdChuKSArIGQ7XG59XG5mdW5jdGlvbiBfb25FbnRlcihwYXJ0aWNsZSwgb3ZlcmxhcCwgZHQpIHtcbiAgICB2YXIgcCA9IHBhcnRpY2xlLnBvc2l0aW9uO1xuICAgIHZhciB2ID0gcGFydGljbGUudmVsb2NpdHk7XG4gICAgdmFyIG0gPSBwYXJ0aWNsZS5tYXNzO1xuICAgIHZhciBuID0gdGhpcy5vcHRpb25zLm5vcm1hbDtcbiAgICB2YXIgYWN0aW9uID0gdGhpcy5vcHRpb25zLm9uQ29udGFjdDtcbiAgICB2YXIgcmVzdGl0dXRpb24gPSB0aGlzLm9wdGlvbnMucmVzdGl0dXRpb247XG4gICAgdmFyIGltcHVsc2UgPSB0aGlzLmltcHVsc2U7XG4gICAgdmFyIGRyaWZ0ID0gdGhpcy5vcHRpb25zLmRyaWZ0O1xuICAgIHZhciBzbG9wID0gLXRoaXMub3B0aW9ucy5zbG9wO1xuICAgIHZhciBnYW1tYSA9IDA7XG4gICAgaWYgKHRoaXMuX2V2ZW50T3V0cHV0KSB7XG4gICAgICAgIHZhciBkYXRhID0ge1xuICAgICAgICAgICAgICAgIHBhcnRpY2xlOiBwYXJ0aWNsZSxcbiAgICAgICAgICAgICAgICB3YWxsOiB0aGlzLFxuICAgICAgICAgICAgICAgIG92ZXJsYXA6IG92ZXJsYXAsXG4gICAgICAgICAgICAgICAgbm9ybWFsOiBuXG4gICAgICAgICAgICB9O1xuICAgICAgICB0aGlzLl9ldmVudE91dHB1dC5lbWl0KCdwcmVDb2xsaXNpb24nLCBkYXRhKTtcbiAgICAgICAgdGhpcy5fZXZlbnRPdXRwdXQuZW1pdCgnY29sbGlzaW9uJywgZGF0YSk7XG4gICAgfVxuICAgIHN3aXRjaCAoYWN0aW9uKSB7XG4gICAgY2FzZSBXYWxsLk9OX0NPTlRBQ1QuUkVGTEVDVDpcbiAgICAgICAgdmFyIGxhbWJkYSA9IG92ZXJsYXAgPCBzbG9wID8gLSgoMSArIHJlc3RpdHV0aW9uKSAqIG4uZG90KHYpICsgZHJpZnQgLyBkdCAqIChvdmVybGFwIC0gc2xvcCkpIC8gKG0gKiBkdCArIGdhbW1hKSA6IC0oKDEgKyByZXN0aXR1dGlvbikgKiBuLmRvdCh2KSkgLyAobSAqIGR0ICsgZ2FtbWEpO1xuICAgICAgICBpbXB1bHNlLnNldChuLm11bHQoZHQgKiBsYW1iZGEpKTtcbiAgICAgICAgcGFydGljbGUuYXBwbHlJbXB1bHNlKGltcHVsc2UpO1xuICAgICAgICBwYXJ0aWNsZS5zZXRQb3NpdGlvbihwLmFkZChuLm11bHQoLW92ZXJsYXApKSk7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgICBpZiAodGhpcy5fZXZlbnRPdXRwdXQpXG4gICAgICAgIHRoaXMuX2V2ZW50T3V0cHV0LmVtaXQoJ3Bvc3RDb2xsaXNpb24nLCBkYXRhKTtcbn1cbmZ1bmN0aW9uIF9vbkV4aXQocGFydGljbGUsIG92ZXJsYXAsIGR0KSB7XG4gICAgdmFyIGFjdGlvbiA9IHRoaXMub3B0aW9ucy5vbkNvbnRhY3Q7XG4gICAgdmFyIHAgPSBwYXJ0aWNsZS5wb3NpdGlvbjtcbiAgICB2YXIgbiA9IHRoaXMub3B0aW9ucy5ub3JtYWw7XG4gICAgaWYgKGFjdGlvbiA9PT0gV2FsbC5PTl9DT05UQUNULlJFRkxFQ1QpIHtcbiAgICAgICAgcGFydGljbGUuc2V0UG9zaXRpb24ocC5hZGQobi5tdWx0KC1vdmVybGFwKSkpO1xuICAgIH1cbn1cbldhbGwucHJvdG90eXBlLmFwcGx5Q29uc3RyYWludCA9IGZ1bmN0aW9uIGFwcGx5Q29uc3RyYWludCh0YXJnZXRzLCBzb3VyY2UsIGR0KSB7XG4gICAgdmFyIG4gPSB0aGlzLm9wdGlvbnMubm9ybWFsO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGFyZ2V0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgcGFydGljbGUgPSB0YXJnZXRzW2ldO1xuICAgICAgICB2YXIgcCA9IHBhcnRpY2xlLnBvc2l0aW9uO1xuICAgICAgICB2YXIgdiA9IHBhcnRpY2xlLnZlbG9jaXR5O1xuICAgICAgICB2YXIgciA9IHBhcnRpY2xlLnJhZGl1cyB8fCAwO1xuICAgICAgICB2YXIgb3ZlcmxhcCA9IF9nZXREaXN0YW5jZUZyb21PcmlnaW4uY2FsbCh0aGlzLCBwLmFkZChuLm11bHQoLXIpKSk7XG4gICAgICAgIHZhciBudiA9IF9nZXROb3JtYWxWZWxvY2l0eS5jYWxsKHRoaXMsIG4sIHYpO1xuICAgICAgICBpZiAob3ZlcmxhcCA8PSAwKSB7XG4gICAgICAgICAgICBpZiAobnYgPCAwKVxuICAgICAgICAgICAgICAgIF9vbkVudGVyLmNhbGwodGhpcywgcGFydGljbGUsIG92ZXJsYXAsIGR0KTtcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBfb25FeGl0LmNhbGwodGhpcywgcGFydGljbGUsIG92ZXJsYXAsIGR0KTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5tb2R1bGUuZXhwb3J0cyA9IFdhbGw7IiwidmFyIENvbnN0cmFpbnQgPSByZXF1aXJlKCcuL0NvbnN0cmFpbnQnKTtcbnZhciBXYWxsID0gcmVxdWlyZSgnLi9XYWxsJyk7XG52YXIgVmVjdG9yID0gcmVxdWlyZSgnLi4vLi4vbWF0aC9WZWN0b3InKTtcbnZhciBVdGlsaXR5ID0gcmVxdWlyZSgnLi4vLi4vdXRpbGl0aWVzL1V0aWxpdHknKTtcbmZ1bmN0aW9uIFdhbGxzKG9wdGlvbnMpIHtcbiAgICB0aGlzLm9wdGlvbnMgPSBVdGlsaXR5LmNsb25lKHRoaXMuY29uc3RydWN0b3IuREVGQVVMVF9PUFRJT05TIHx8IFdhbGxzLkRFRkFVTFRfT1BUSU9OUyk7XG4gICAgaWYgKG9wdGlvbnMpXG4gICAgICAgIHRoaXMuc2V0T3B0aW9ucyhvcHRpb25zKTtcbiAgICBfY3JlYXRlQ29tcG9uZW50cy5jYWxsKHRoaXMsIHRoaXMub3B0aW9ucy5zaWRlcyk7XG4gICAgQ29uc3RyYWludC5jYWxsKHRoaXMpO1xufVxuV2FsbHMucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShDb25zdHJhaW50LnByb3RvdHlwZSk7XG5XYWxscy5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBXYWxscztcbldhbGxzLk9OX0NPTlRBQ1QgPSBXYWxsLk9OX0NPTlRBQ1Q7XG5XYWxscy5TSURFUyA9IHtcbiAgICBMRUZUOiAwLFxuICAgIFJJR0hUOiAxLFxuICAgIFRPUDogMixcbiAgICBCT1RUT006IDMsXG4gICAgRlJPTlQ6IDQsXG4gICAgQkFDSzogNSxcbiAgICBUV09fRElNRU5TSU9OQUw6IFtcbiAgICAgICAgMCxcbiAgICAgICAgMSxcbiAgICAgICAgMixcbiAgICAgICAgM1xuICAgIF0sXG4gICAgVEhSRUVfRElNRU5TSU9OQUw6IFtcbiAgICAgICAgMCxcbiAgICAgICAgMSxcbiAgICAgICAgMixcbiAgICAgICAgMyxcbiAgICAgICAgNCxcbiAgICAgICAgNVxuICAgIF1cbn07XG5XYWxscy5ERUZBVUxUX09QVElPTlMgPSB7XG4gICAgc2lkZXM6IFdhbGxzLlNJREVTLlRXT19ESU1FTlNJT05BTCxcbiAgICBzaXplOiBbXG4gICAgICAgIHdpbmRvdy5pbm5lcldpZHRoLFxuICAgICAgICB3aW5kb3cuaW5uZXJIZWlnaHQsXG4gICAgICAgIDBcbiAgICBdLFxuICAgIG9yaWdpbjogW1xuICAgICAgICAwLjUsXG4gICAgICAgIDAuNSxcbiAgICAgICAgMC41XG4gICAgXSxcbiAgICBkcmlmdDogMC41LFxuICAgIHNsb3A6IDAsXG4gICAgcmVzdGl0dXRpb246IDAuNSxcbiAgICBvbkNvbnRhY3Q6IFdhbGxzLk9OX0NPTlRBQ1QuUkVGTEVDVFxufTtcbnZhciBfU0lERV9OT1JNQUxTID0ge1xuICAgICAgICAwOiBuZXcgVmVjdG9yKDEsIDAsIDApLFxuICAgICAgICAxOiBuZXcgVmVjdG9yKC0xLCAwLCAwKSxcbiAgICAgICAgMjogbmV3IFZlY3RvcigwLCAxLCAwKSxcbiAgICAgICAgMzogbmV3IFZlY3RvcigwLCAtMSwgMCksXG4gICAgICAgIDQ6IG5ldyBWZWN0b3IoMCwgMCwgMSksXG4gICAgICAgIDU6IG5ldyBWZWN0b3IoMCwgMCwgLTEpXG4gICAgfTtcbmZ1bmN0aW9uIF9nZXREaXN0YW5jZShzaWRlLCBzaXplLCBvcmlnaW4pIHtcbiAgICB2YXIgZGlzdGFuY2U7XG4gICAgdmFyIFNJREVTID0gV2FsbHMuU0lERVM7XG4gICAgc3dpdGNoIChwYXJzZUludChzaWRlKSkge1xuICAgIGNhc2UgU0lERVMuTEVGVDpcbiAgICAgICAgZGlzdGFuY2UgPSBzaXplWzBdICogb3JpZ2luWzBdO1xuICAgICAgICBicmVhaztcbiAgICBjYXNlIFNJREVTLlRPUDpcbiAgICAgICAgZGlzdGFuY2UgPSBzaXplWzFdICogb3JpZ2luWzFdO1xuICAgICAgICBicmVhaztcbiAgICBjYXNlIFNJREVTLkZST05UOlxuICAgICAgICBkaXN0YW5jZSA9IHNpemVbMl0gKiBvcmlnaW5bMl07XG4gICAgICAgIGJyZWFrO1xuICAgIGNhc2UgU0lERVMuUklHSFQ6XG4gICAgICAgIGRpc3RhbmNlID0gc2l6ZVswXSAqICgxIC0gb3JpZ2luWzBdKTtcbiAgICAgICAgYnJlYWs7XG4gICAgY2FzZSBTSURFUy5CT1RUT006XG4gICAgICAgIGRpc3RhbmNlID0gc2l6ZVsxXSAqICgxIC0gb3JpZ2luWzFdKTtcbiAgICAgICAgYnJlYWs7XG4gICAgY2FzZSBTSURFUy5CQUNLOlxuICAgICAgICBkaXN0YW5jZSA9IHNpemVbMl0gKiAoMSAtIG9yaWdpblsyXSk7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgICByZXR1cm4gZGlzdGFuY2U7XG59XG5XYWxscy5wcm90b3R5cGUuc2V0T3B0aW9ucyA9IGZ1bmN0aW9uIHNldE9wdGlvbnMob3B0aW9ucykge1xuICAgIHZhciByZXNpemVGbGFnID0gZmFsc2U7XG4gICAgaWYgKG9wdGlvbnMucmVzdGl0dXRpb24gIT09IHVuZGVmaW5lZClcbiAgICAgICAgX3NldE9wdGlvbnNGb3JFYWNoLmNhbGwodGhpcywgeyByZXN0aXR1dGlvbjogb3B0aW9ucy5yZXN0aXR1dGlvbiB9KTtcbiAgICBpZiAob3B0aW9ucy5kcmlmdCAhPT0gdW5kZWZpbmVkKVxuICAgICAgICBfc2V0T3B0aW9uc0ZvckVhY2guY2FsbCh0aGlzLCB7IGRyaWZ0OiBvcHRpb25zLmRyaWZ0IH0pO1xuICAgIGlmIChvcHRpb25zLnNsb3AgIT09IHVuZGVmaW5lZClcbiAgICAgICAgX3NldE9wdGlvbnNGb3JFYWNoLmNhbGwodGhpcywgeyBzbG9wOiBvcHRpb25zLnNsb3AgfSk7XG4gICAgaWYgKG9wdGlvbnMub25Db250YWN0ICE9PSB1bmRlZmluZWQpXG4gICAgICAgIF9zZXRPcHRpb25zRm9yRWFjaC5jYWxsKHRoaXMsIHsgb25Db250YWN0OiBvcHRpb25zLm9uQ29udGFjdCB9KTtcbiAgICBpZiAob3B0aW9ucy5zaXplICE9PSB1bmRlZmluZWQpXG4gICAgICAgIHJlc2l6ZUZsYWcgPSB0cnVlO1xuICAgIGlmIChvcHRpb25zLnNpZGVzICE9PSB1bmRlZmluZWQpXG4gICAgICAgIHRoaXMub3B0aW9ucy5zaWRlcyA9IG9wdGlvbnMuc2lkZXM7XG4gICAgaWYgKG9wdGlvbnMub3JpZ2luICE9PSB1bmRlZmluZWQpXG4gICAgICAgIHJlc2l6ZUZsYWcgPSB0cnVlO1xuICAgIGlmIChyZXNpemVGbGFnKVxuICAgICAgICB0aGlzLnNldFNpemUob3B0aW9ucy5zaXplLCBvcHRpb25zLm9yaWdpbik7XG59O1xuZnVuY3Rpb24gX2NyZWF0ZUNvbXBvbmVudHMoc2lkZXMpIHtcbiAgICB0aGlzLmNvbXBvbmVudHMgPSB7fTtcbiAgICB2YXIgY29tcG9uZW50cyA9IHRoaXMuY29tcG9uZW50cztcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNpZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBzaWRlID0gc2lkZXNbaV07XG4gICAgICAgIGNvbXBvbmVudHNbaV0gPSBuZXcgV2FsbCh7XG4gICAgICAgICAgICBub3JtYWw6IF9TSURFX05PUk1BTFNbc2lkZV0uY2xvbmUoKSxcbiAgICAgICAgICAgIGRpc3RhbmNlOiBfZ2V0RGlzdGFuY2Uoc2lkZSwgdGhpcy5vcHRpb25zLnNpemUsIHRoaXMub3B0aW9ucy5vcmlnaW4pXG4gICAgICAgIH0pO1xuICAgIH1cbn1cbldhbGxzLnByb3RvdHlwZS5zZXRTaXplID0gZnVuY3Rpb24gc2V0U2l6ZShzaXplLCBvcmlnaW4pIHtcbiAgICBvcmlnaW4gPSBvcmlnaW4gfHwgdGhpcy5vcHRpb25zLm9yaWdpbjtcbiAgICBpZiAob3JpZ2luLmxlbmd0aCA8IDMpXG4gICAgICAgIG9yaWdpblsyXSA9IDAuNTtcbiAgICB0aGlzLmZvckVhY2goZnVuY3Rpb24gKHdhbGwsIHNpZGUpIHtcbiAgICAgICAgdmFyIGQgPSBfZ2V0RGlzdGFuY2Uoc2lkZSwgc2l6ZSwgb3JpZ2luKTtcbiAgICAgICAgd2FsbC5zZXRPcHRpb25zKHsgZGlzdGFuY2U6IGQgfSk7XG4gICAgfSk7XG4gICAgdGhpcy5vcHRpb25zLnNpemUgPSBzaXplO1xuICAgIHRoaXMub3B0aW9ucy5vcmlnaW4gPSBvcmlnaW47XG59O1xuZnVuY3Rpb24gX3NldE9wdGlvbnNGb3JFYWNoKG9wdGlvbnMpIHtcbiAgICB0aGlzLmZvckVhY2goZnVuY3Rpb24gKHdhbGwpIHtcbiAgICAgICAgd2FsbC5zZXRPcHRpb25zKG9wdGlvbnMpO1xuICAgIH0pO1xuICAgIGZvciAodmFyIGtleSBpbiBvcHRpb25zKVxuICAgICAgICB0aGlzLm9wdGlvbnNba2V5XSA9IG9wdGlvbnNba2V5XTtcbn1cbldhbGxzLnByb3RvdHlwZS5hcHBseUNvbnN0cmFpbnQgPSBmdW5jdGlvbiBhcHBseUNvbnN0cmFpbnQodGFyZ2V0cywgc291cmNlLCBkdCkge1xuICAgIHRoaXMuZm9yRWFjaChmdW5jdGlvbiAod2FsbCkge1xuICAgICAgICB3YWxsLmFwcGx5Q29uc3RyYWludCh0YXJnZXRzLCBzb3VyY2UsIGR0KTtcbiAgICB9KTtcbn07XG5XYWxscy5wcm90b3R5cGUuZm9yRWFjaCA9IGZ1bmN0aW9uIGZvckVhY2goZm4pIHtcbiAgICB2YXIgc2lkZXMgPSB0aGlzLm9wdGlvbnMuc2lkZXM7XG4gICAgZm9yICh2YXIga2V5IGluIHRoaXMuc2lkZXMpXG4gICAgICAgIGZuKHNpZGVzW2tleV0sIGtleSk7XG59O1xuV2FsbHMucHJvdG90eXBlLnJvdGF0ZVogPSBmdW5jdGlvbiByb3RhdGVaKGFuZ2xlKSB7XG4gICAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uICh3YWxsKSB7XG4gICAgICAgIHZhciBuID0gd2FsbC5vcHRpb25zLm5vcm1hbDtcbiAgICAgICAgbi5yb3RhdGVaKGFuZ2xlKS5wdXQobik7XG4gICAgfSk7XG59O1xuV2FsbHMucHJvdG90eXBlLnJvdGF0ZVggPSBmdW5jdGlvbiByb3RhdGVYKGFuZ2xlKSB7XG4gICAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uICh3YWxsKSB7XG4gICAgICAgIHZhciBuID0gd2FsbC5vcHRpb25zLm5vcm1hbDtcbiAgICAgICAgbi5yb3RhdGVYKGFuZ2xlKS5wdXQobik7XG4gICAgfSk7XG59O1xuV2FsbHMucHJvdG90eXBlLnJvdGF0ZVkgPSBmdW5jdGlvbiByb3RhdGVZKGFuZ2xlKSB7XG4gICAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uICh3YWxsKSB7XG4gICAgICAgIHZhciBuID0gd2FsbC5vcHRpb25zLm5vcm1hbDtcbiAgICAgICAgbi5yb3RhdGVZKGFuZ2xlKS5wdXQobik7XG4gICAgfSk7XG59O1xubW9kdWxlLmV4cG9ydHMgPSBXYWxsczsiLCJ2YXIgRm9yY2UgPSByZXF1aXJlKCcuL0ZvcmNlJyk7XG5mdW5jdGlvbiBEcmFnKG9wdGlvbnMpIHtcbiAgICB0aGlzLm9wdGlvbnMgPSBPYmplY3QuY3JlYXRlKHRoaXMuY29uc3RydWN0b3IuREVGQVVMVF9PUFRJT05TKTtcbiAgICBpZiAob3B0aW9ucylcbiAgICAgICAgdGhpcy5zZXRPcHRpb25zKG9wdGlvbnMpO1xuICAgIEZvcmNlLmNhbGwodGhpcyk7XG59XG5EcmFnLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoRm9yY2UucHJvdG90eXBlKTtcbkRyYWcucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gRHJhZztcbkRyYWcuRk9SQ0VfRlVOQ1RJT05TID0ge1xuICAgIExJTkVBUjogZnVuY3Rpb24gKHZlbG9jaXR5KSB7XG4gICAgICAgIHJldHVybiB2ZWxvY2l0eTtcbiAgICB9LFxuICAgIFFVQURSQVRJQzogZnVuY3Rpb24gKHZlbG9jaXR5KSB7XG4gICAgICAgIHJldHVybiB2ZWxvY2l0eS5tdWx0KHZlbG9jaXR5Lm5vcm0oKSk7XG4gICAgfVxufTtcbkRyYWcuREVGQVVMVF9PUFRJT05TID0ge1xuICAgIHN0cmVuZ3RoOiAwLjAxLFxuICAgIGZvcmNlRnVuY3Rpb246IERyYWcuRk9SQ0VfRlVOQ1RJT05TLkxJTkVBUlxufTtcbkRyYWcucHJvdG90eXBlLmFwcGx5Rm9yY2UgPSBmdW5jdGlvbiBhcHBseUZvcmNlKHRhcmdldHMpIHtcbiAgICB2YXIgc3RyZW5ndGggPSB0aGlzLm9wdGlvbnMuc3RyZW5ndGg7XG4gICAgdmFyIGZvcmNlRnVuY3Rpb24gPSB0aGlzLm9wdGlvbnMuZm9yY2VGdW5jdGlvbjtcbiAgICB2YXIgZm9yY2UgPSB0aGlzLmZvcmNlO1xuICAgIHZhciBpbmRleDtcbiAgICB2YXIgcGFydGljbGU7XG4gICAgZm9yIChpbmRleCA9IDA7IGluZGV4IDwgdGFyZ2V0cy5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgcGFydGljbGUgPSB0YXJnZXRzW2luZGV4XTtcbiAgICAgICAgZm9yY2VGdW5jdGlvbihwYXJ0aWNsZS52ZWxvY2l0eSkubXVsdCgtc3RyZW5ndGgpLnB1dChmb3JjZSk7XG4gICAgICAgIHBhcnRpY2xlLmFwcGx5Rm9yY2UoZm9yY2UpO1xuICAgIH1cbn07XG5EcmFnLnByb3RvdHlwZS5zZXRPcHRpb25zID0gZnVuY3Rpb24gc2V0T3B0aW9ucyhvcHRpb25zKSB7XG4gICAgZm9yICh2YXIga2V5IGluIG9wdGlvbnMpXG4gICAgICAgIHRoaXMub3B0aW9uc1trZXldID0gb3B0aW9uc1trZXldO1xufTtcbm1vZHVsZS5leHBvcnRzID0gRHJhZzsiLCJ2YXIgVmVjdG9yID0gcmVxdWlyZSgnLi4vLi4vbWF0aC9WZWN0b3InKTtcbnZhciBFdmVudEhhbmRsZXIgPSByZXF1aXJlKCcuLi8uLi9jb3JlL0V2ZW50SGFuZGxlcicpO1xuZnVuY3Rpb24gRm9yY2UoZm9yY2UpIHtcbiAgICB0aGlzLmZvcmNlID0gbmV3IFZlY3Rvcihmb3JjZSk7XG4gICAgdGhpcy5fZXZlbnRPdXRwdXQgPSBuZXcgRXZlbnRIYW5kbGVyKCk7XG4gICAgRXZlbnRIYW5kbGVyLnNldE91dHB1dEhhbmRsZXIodGhpcywgdGhpcy5fZXZlbnRPdXRwdXQpO1xufVxuRm9yY2UucHJvdG90eXBlLnNldE9wdGlvbnMgPSBmdW5jdGlvbiBzZXRPcHRpb25zKG9wdGlvbnMpIHtcbiAgICB0aGlzLl9ldmVudE91dHB1dC5lbWl0KCdjaGFuZ2UnLCBvcHRpb25zKTtcbn07XG5Gb3JjZS5wcm90b3R5cGUuYXBwbHlGb3JjZSA9IGZ1bmN0aW9uIGFwcGx5Rm9yY2UodGFyZ2V0cykge1xuICAgIHZhciBsZW5ndGggPSB0YXJnZXRzLmxlbmd0aDtcbiAgICB3aGlsZSAobGVuZ3RoLS0pIHtcbiAgICAgICAgdGFyZ2V0c1tsZW5ndGhdLmFwcGx5Rm9yY2UodGhpcy5mb3JjZSk7XG4gICAgfVxufTtcbkZvcmNlLnByb3RvdHlwZS5nZXRFbmVyZ3kgPSBmdW5jdGlvbiBnZXRFbmVyZ3koKSB7XG4gICAgcmV0dXJuIDA7XG59O1xubW9kdWxlLmV4cG9ydHMgPSBGb3JjZTsiLCJ2YXIgRm9yY2UgPSByZXF1aXJlKCcuL0ZvcmNlJyk7XG52YXIgVmVjdG9yID0gcmVxdWlyZSgnLi4vLi4vbWF0aC9WZWN0b3InKTtcbmZ1bmN0aW9uIFJlcHVsc2lvbihvcHRpb25zKSB7XG4gICAgdGhpcy5vcHRpb25zID0gT2JqZWN0LmNyZWF0ZShSZXB1bHNpb24uREVGQVVMVF9PUFRJT05TKTtcbiAgICBpZiAob3B0aW9ucylcbiAgICAgICAgdGhpcy5zZXRPcHRpb25zKG9wdGlvbnMpO1xuICAgIHRoaXMuZGlzcCA9IG5ldyBWZWN0b3IoKTtcbiAgICBGb3JjZS5jYWxsKHRoaXMpO1xufVxuUmVwdWxzaW9uLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoRm9yY2UucHJvdG90eXBlKTtcblJlcHVsc2lvbi5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBSZXB1bHNpb247XG5SZXB1bHNpb24uREVDQVlfRlVOQ1RJT05TID0ge1xuICAgIExJTkVBUjogZnVuY3Rpb24gKHIsIGN1dG9mZikge1xuICAgICAgICByZXR1cm4gTWF0aC5tYXgoMSAtIDEgLyBjdXRvZmYgKiByLCAwKTtcbiAgICB9LFxuICAgIE1PUlNFOiBmdW5jdGlvbiAociwgY3V0b2ZmKSB7XG4gICAgICAgIHZhciByMCA9IGN1dG9mZiA9PT0gMCA/IDEwMCA6IGN1dG9mZjtcbiAgICAgICAgdmFyIHJTaGlmdGVkID0gciArIHIwICogKDEgLSBNYXRoLmxvZygyKSk7XG4gICAgICAgIHJldHVybiBNYXRoLm1heCgxIC0gTWF0aC5wb3coMSAtIE1hdGguZXhwKHJTaGlmdGVkIC8gcjAgLSAxKSwgMiksIDApO1xuICAgIH0sXG4gICAgSU5WRVJTRTogZnVuY3Rpb24gKHIsIGN1dG9mZikge1xuICAgICAgICByZXR1cm4gMSAvICgxIC0gY3V0b2ZmICsgcik7XG4gICAgfSxcbiAgICBHUkFWSVRZOiBmdW5jdGlvbiAociwgY3V0b2ZmKSB7XG4gICAgICAgIHJldHVybiAxIC8gKDEgLSBjdXRvZmYgKyByICogcik7XG4gICAgfVxufTtcblJlcHVsc2lvbi5ERUZBVUxUX09QVElPTlMgPSB7XG4gICAgc3RyZW5ndGg6IDEsXG4gICAgYW5jaG9yOiB1bmRlZmluZWQsXG4gICAgcmFuZ2U6IFtcbiAgICAgICAgMCxcbiAgICAgICAgSW5maW5pdHlcbiAgICBdLFxuICAgIGN1dG9mZjogMCxcbiAgICBjYXA6IEluZmluaXR5LFxuICAgIGRlY2F5RnVuY3Rpb246IFJlcHVsc2lvbi5ERUNBWV9GVU5DVElPTlMuR1JBVklUWVxufTtcblJlcHVsc2lvbi5wcm90b3R5cGUuc2V0T3B0aW9ucyA9IGZ1bmN0aW9uIHNldE9wdGlvbnMob3B0aW9ucykge1xuICAgIGlmIChvcHRpb25zLmFuY2hvciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGlmIChvcHRpb25zLmFuY2hvci5wb3NpdGlvbiBpbnN0YW5jZW9mIFZlY3RvcilcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5hbmNob3IgPSBvcHRpb25zLmFuY2hvci5wb3NpdGlvbjtcbiAgICAgICAgaWYgKG9wdGlvbnMuYW5jaG9yIGluc3RhbmNlb2YgQXJyYXkpXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMuYW5jaG9yID0gbmV3IFZlY3RvcihvcHRpb25zLmFuY2hvcik7XG4gICAgICAgIGRlbGV0ZSBvcHRpb25zLmFuY2hvcjtcbiAgICB9XG4gICAgZm9yICh2YXIga2V5IGluIG9wdGlvbnMpXG4gICAgICAgIHRoaXMub3B0aW9uc1trZXldID0gb3B0aW9uc1trZXldO1xufTtcblJlcHVsc2lvbi5wcm90b3R5cGUuYXBwbHlGb3JjZSA9IGZ1bmN0aW9uIGFwcGx5Rm9yY2UodGFyZ2V0cywgc291cmNlKSB7XG4gICAgdmFyIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnM7XG4gICAgdmFyIGZvcmNlID0gdGhpcy5mb3JjZTtcbiAgICB2YXIgZGlzcCA9IHRoaXMuZGlzcDtcbiAgICB2YXIgc3RyZW5ndGggPSBvcHRpb25zLnN0cmVuZ3RoO1xuICAgIHZhciBhbmNob3IgPSBvcHRpb25zLmFuY2hvciB8fCBzb3VyY2UucG9zaXRpb247XG4gICAgdmFyIGNhcCA9IG9wdGlvbnMuY2FwO1xuICAgIHZhciBjdXRvZmYgPSBvcHRpb25zLmN1dG9mZjtcbiAgICB2YXIgck1pbiA9IG9wdGlvbnMucmFuZ2VbMF07XG4gICAgdmFyIHJNYXggPSBvcHRpb25zLnJhbmdlWzFdO1xuICAgIHZhciBkZWNheUZuID0gb3B0aW9ucy5kZWNheUZ1bmN0aW9uO1xuICAgIGlmIChzdHJlbmd0aCA9PT0gMClcbiAgICAgICAgcmV0dXJuO1xuICAgIHZhciBsZW5ndGggPSB0YXJnZXRzLmxlbmd0aDtcbiAgICB2YXIgcGFydGljbGU7XG4gICAgdmFyIG0xO1xuICAgIHZhciBwMTtcbiAgICB2YXIgcjtcbiAgICB3aGlsZSAobGVuZ3RoLS0pIHtcbiAgICAgICAgcGFydGljbGUgPSB0YXJnZXRzW2xlbmd0aF07XG4gICAgICAgIGlmIChwYXJ0aWNsZSA9PT0gc291cmNlKVxuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIG0xID0gcGFydGljbGUubWFzcztcbiAgICAgICAgcDEgPSBwYXJ0aWNsZS5wb3NpdGlvbjtcbiAgICAgICAgZGlzcC5zZXQocDEuc3ViKGFuY2hvcikpO1xuICAgICAgICByID0gZGlzcC5ub3JtKCk7XG4gICAgICAgIGlmIChyIDwgck1heCAmJiByID4gck1pbikge1xuICAgICAgICAgICAgZm9yY2Uuc2V0KGRpc3Aubm9ybWFsaXplKHN0cmVuZ3RoICogbTEgKiBkZWNheUZuKHIsIGN1dG9mZikpLmNhcChjYXApKTtcbiAgICAgICAgICAgIHBhcnRpY2xlLmFwcGx5Rm9yY2UoZm9yY2UpO1xuICAgICAgICB9XG4gICAgfVxufTtcbm1vZHVsZS5leHBvcnRzID0gUmVwdWxzaW9uOyIsInZhciBGb3JjZSA9IHJlcXVpcmUoJy4vRm9yY2UnKTtcbnZhciBWZWN0b3IgPSByZXF1aXJlKCcuLi8uLi9tYXRoL1ZlY3RvcicpO1xuZnVuY3Rpb24gVmVjdG9yRmllbGQob3B0aW9ucykge1xuICAgIEZvcmNlLmNhbGwodGhpcyk7XG4gICAgdGhpcy5vcHRpb25zID0gT2JqZWN0LmNyZWF0ZShWZWN0b3JGaWVsZC5ERUZBVUxUX09QVElPTlMpO1xuICAgIGlmIChvcHRpb25zKVxuICAgICAgICB0aGlzLnNldE9wdGlvbnMob3B0aW9ucyk7XG4gICAgdGhpcy5ldmFsdWF0aW9uID0gbmV3IFZlY3RvcigpO1xufVxuVmVjdG9yRmllbGQucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShGb3JjZS5wcm90b3R5cGUpO1xuVmVjdG9yRmllbGQucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gVmVjdG9yRmllbGQ7XG5WZWN0b3JGaWVsZC5GSUVMRFMgPSB7XG4gICAgQ09OU1RBTlQ6IGZ1bmN0aW9uICh2LCBvcHRpb25zKSB7XG4gICAgICAgIG9wdGlvbnMuZGlyZWN0aW9uLnB1dCh0aGlzLmV2YWx1YXRpb24pO1xuICAgIH0sXG4gICAgTElORUFSOiBmdW5jdGlvbiAodikge1xuICAgICAgICB2LnB1dCh0aGlzLmV2YWx1YXRpb24pO1xuICAgIH0sXG4gICAgUkFESUFMOiBmdW5jdGlvbiAodikge1xuICAgICAgICB2Lm11bHQoLTEpLnB1dCh0aGlzLmV2YWx1YXRpb24pO1xuICAgIH0sXG4gICAgUE9JTlRfQVRUUkFDVE9SOiBmdW5jdGlvbiAodiwgb3B0aW9ucykge1xuICAgICAgICBvcHRpb25zLnBvc2l0aW9uLnN1Yih2KS5wdXQodGhpcy5ldmFsdWF0aW9uKTtcbiAgICB9XG59O1xuVmVjdG9yRmllbGQuREVGQVVMVF9PUFRJT05TID0ge1xuICAgIHN0cmVuZ3RoOiAwLjAxLFxuICAgIGZpZWxkOiBWZWN0b3JGaWVsZC5GSUVMRFMuQ09OU1RBTlRcbn07XG5WZWN0b3JGaWVsZC5wcm90b3R5cGUuc2V0T3B0aW9ucyA9IGZ1bmN0aW9uIHNldE9wdGlvbnMob3B0aW9ucykge1xuICAgIGlmIChvcHRpb25zLnN0cmVuZ3RoICE9PSB1bmRlZmluZWQpXG4gICAgICAgIHRoaXMub3B0aW9ucy5zdHJlbmd0aCA9IG9wdGlvbnMuc3RyZW5ndGg7XG4gICAgaWYgKG9wdGlvbnMuZmllbGQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICB0aGlzLm9wdGlvbnMuZmllbGQgPSBvcHRpb25zLmZpZWxkO1xuICAgICAgICBfc2V0RmllbGRPcHRpb25zLmNhbGwodGhpcywgdGhpcy5vcHRpb25zLmZpZWxkKTtcbiAgICB9XG59O1xuZnVuY3Rpb24gX3NldEZpZWxkT3B0aW9ucyhmaWVsZCkge1xuICAgIHZhciBGSUVMRFMgPSBWZWN0b3JGaWVsZC5GSUVMRFM7XG4gICAgc3dpdGNoIChmaWVsZCkge1xuICAgIGNhc2UgRklFTERTLkNPTlNUQU5UOlxuICAgICAgICBpZiAoIXRoaXMub3B0aW9ucy5kaXJlY3Rpb24pXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMuZGlyZWN0aW9uID0gbmV3IFZlY3RvcigwLCAxLCAwKTtcbiAgICAgICAgZWxzZSBpZiAodGhpcy5vcHRpb25zLmRpcmVjdGlvbiBpbnN0YW5jZW9mIEFycmF5KVxuICAgICAgICAgICAgdGhpcy5vcHRpb25zLmRpcmVjdGlvbiA9IG5ldyBWZWN0b3IodGhpcy5vcHRpb25zLmRpcmVjdGlvbik7XG4gICAgICAgIGJyZWFrO1xuICAgIGNhc2UgRklFTERTLlBPSU5UX0FUVFJBQ1RPUjpcbiAgICAgICAgaWYgKCF0aGlzLm9wdGlvbnMucG9zaXRpb24pXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMucG9zaXRpb24gPSBuZXcgVmVjdG9yKDAsIDAsIDApO1xuICAgICAgICBlbHNlIGlmICh0aGlzLm9wdGlvbnMucG9zaXRpb24gaW5zdGFuY2VvZiBBcnJheSlcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5wb3NpdGlvbiA9IG5ldyBWZWN0b3IodGhpcy5vcHRpb25zLnBvc2l0aW9uKTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxufVxuVmVjdG9yRmllbGQucHJvdG90eXBlLmFwcGx5Rm9yY2UgPSBmdW5jdGlvbiBhcHBseUZvcmNlKHRhcmdldHMpIHtcbiAgICB2YXIgZm9yY2UgPSB0aGlzLmZvcmNlO1xuICAgIHZhciBzdHJlbmd0aCA9IHRoaXMub3B0aW9ucy5zdHJlbmd0aDtcbiAgICB2YXIgZmllbGQgPSB0aGlzLm9wdGlvbnMuZmllbGQ7XG4gICAgdmFyIGk7XG4gICAgdmFyIHRhcmdldDtcbiAgICBmb3IgKGkgPSAwOyBpIDwgdGFyZ2V0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICB0YXJnZXQgPSB0YXJnZXRzW2ldO1xuICAgICAgICBmaWVsZC5jYWxsKHRoaXMsIHRhcmdldC5wb3NpdGlvbiwgdGhpcy5vcHRpb25zKTtcbiAgICAgICAgdGhpcy5ldmFsdWF0aW9uLm11bHQodGFyZ2V0Lm1hc3MgKiBzdHJlbmd0aCkucHV0KGZvcmNlKTtcbiAgICAgICAgdGFyZ2V0LmFwcGx5Rm9yY2UoZm9yY2UpO1xuICAgIH1cbn07XG5WZWN0b3JGaWVsZC5wcm90b3R5cGUuZ2V0RW5lcmd5ID0gZnVuY3Rpb24gZ2V0RW5lcmd5KHRhcmdldHMpIHtcbiAgICB2YXIgZmllbGQgPSB0aGlzLm9wdGlvbnMuZmllbGQ7XG4gICAgdmFyIEZJRUxEUyA9IFZlY3RvckZpZWxkLkZJRUxEUztcbiAgICB2YXIgZW5lcmd5ID0gMDtcbiAgICB2YXIgaTtcbiAgICB2YXIgdGFyZ2V0O1xuICAgIHN3aXRjaCAoZmllbGQpIHtcbiAgICBjYXNlIEZJRUxEUy5DT05TVEFOVDpcbiAgICAgICAgZW5lcmd5ID0gdGFyZ2V0cy5sZW5ndGggKiB0aGlzLm9wdGlvbnMuZGlyZWN0aW9uLm5vcm0oKTtcbiAgICAgICAgYnJlYWs7XG4gICAgY2FzZSBGSUVMRFMuUkFESUFMOlxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgdGFyZ2V0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdGFyZ2V0ID0gdGFyZ2V0c1tpXTtcbiAgICAgICAgICAgIGVuZXJneSArPSB0YXJnZXQucG9zaXRpb24ubm9ybSgpO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgIGNhc2UgRklFTERTLlBPSU5UX0FUVFJBQ1RPUjpcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IHRhcmdldHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHRhcmdldCA9IHRhcmdldHNbaV07XG4gICAgICAgICAgICBlbmVyZ3kgKz0gdGFyZ2V0LnBvc2l0aW9uLnN1Yih0aGlzLm9wdGlvbnMucG9zaXRpb24pLm5vcm0oKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICB9XG4gICAgZW5lcmd5ICo9IHRoaXMub3B0aW9ucy5zdHJlbmd0aDtcbiAgICByZXR1cm4gZW5lcmd5O1xufTtcbm1vZHVsZS5leHBvcnRzID0gVmVjdG9yRmllbGQ7IiwidmFyIFN5bXBsZWN0aWNFdWxlciA9IHt9O1xuU3ltcGxlY3RpY0V1bGVyLmludGVncmF0ZVZlbG9jaXR5ID0gZnVuY3Rpb24gaW50ZWdyYXRlVmVsb2NpdHkoYm9keSwgZHQpIHtcbiAgICB2YXIgdiA9IGJvZHkudmVsb2NpdHk7XG4gICAgdmFyIHcgPSBib2R5LmludmVyc2VNYXNzO1xuICAgIHZhciBmID0gYm9keS5mb3JjZTtcbiAgICBpZiAoZi5pc1plcm8oKSlcbiAgICAgICAgcmV0dXJuO1xuICAgIHYuYWRkKGYubXVsdChkdCAqIHcpKS5wdXQodik7XG4gICAgZi5jbGVhcigpO1xufTtcblN5bXBsZWN0aWNFdWxlci5pbnRlZ3JhdGVQb3NpdGlvbiA9IGZ1bmN0aW9uIGludGVncmF0ZVBvc2l0aW9uKGJvZHksIGR0KSB7XG4gICAgdmFyIHAgPSBib2R5LnBvc2l0aW9uO1xuICAgIHZhciB2ID0gYm9keS52ZWxvY2l0eTtcbiAgICBwLmFkZCh2Lm11bHQoZHQpKS5wdXQocCk7XG59O1xuU3ltcGxlY3RpY0V1bGVyLmludGVncmF0ZUFuZ3VsYXJNb21lbnR1bSA9IGZ1bmN0aW9uIGludGVncmF0ZUFuZ3VsYXJNb21lbnR1bShib2R5LCBkdCkge1xuICAgIHZhciBMID0gYm9keS5hbmd1bGFyTW9tZW50dW07XG4gICAgdmFyIHQgPSBib2R5LnRvcnF1ZTtcbiAgICBpZiAodC5pc1plcm8oKSlcbiAgICAgICAgcmV0dXJuO1xuICAgIEwuYWRkKHQubXVsdChkdCkpLnB1dChMKTtcbiAgICB0LmNsZWFyKCk7XG59O1xuU3ltcGxlY3RpY0V1bGVyLmludGVncmF0ZU9yaWVudGF0aW9uID0gZnVuY3Rpb24gaW50ZWdyYXRlT3JpZW50YXRpb24oYm9keSwgZHQpIHtcbiAgICB2YXIgcSA9IGJvZHkub3JpZW50YXRpb247XG4gICAgdmFyIHcgPSBib2R5LmFuZ3VsYXJWZWxvY2l0eTtcbiAgICBpZiAody5pc1plcm8oKSlcbiAgICAgICAgcmV0dXJuO1xuICAgIHEuYWRkKHEubXVsdGlwbHkodykuc2NhbGFyTXVsdGlwbHkoMC41ICogZHQpKS5wdXQocSk7XG59O1xubW9kdWxlLmV4cG9ydHMgPSBTeW1wbGVjdGljRXVsZXI7IiwidmFyIEVhc2luZyA9IHtcbiAgICAgICAgaW5RdWFkOiBmdW5jdGlvbiAodCkge1xuICAgICAgICAgICAgcmV0dXJuIHQgKiB0O1xuICAgICAgICB9LFxuICAgICAgICBvdXRRdWFkOiBmdW5jdGlvbiAodCkge1xuICAgICAgICAgICAgcmV0dXJuIC0odCAtPSAxKSAqIHQgKyAxO1xuICAgICAgICB9LFxuICAgICAgICBpbk91dFF1YWQ6IGZ1bmN0aW9uICh0KSB7XG4gICAgICAgICAgICBpZiAoKHQgLz0gMC41KSA8IDEpXG4gICAgICAgICAgICAgICAgcmV0dXJuIDAuNSAqIHQgKiB0O1xuICAgICAgICAgICAgcmV0dXJuIC0wLjUgKiAoLS10ICogKHQgLSAyKSAtIDEpO1xuICAgICAgICB9LFxuICAgICAgICBpbkN1YmljOiBmdW5jdGlvbiAodCkge1xuICAgICAgICAgICAgcmV0dXJuIHQgKiB0ICogdDtcbiAgICAgICAgfSxcbiAgICAgICAgb3V0Q3ViaWM6IGZ1bmN0aW9uICh0KSB7XG4gICAgICAgICAgICByZXR1cm4gLS10ICogdCAqIHQgKyAxO1xuICAgICAgICB9LFxuICAgICAgICBpbk91dEN1YmljOiBmdW5jdGlvbiAodCkge1xuICAgICAgICAgICAgaWYgKCh0IC89IDAuNSkgPCAxKVxuICAgICAgICAgICAgICAgIHJldHVybiAwLjUgKiB0ICogdCAqIHQ7XG4gICAgICAgICAgICByZXR1cm4gMC41ICogKCh0IC09IDIpICogdCAqIHQgKyAyKTtcbiAgICAgICAgfSxcbiAgICAgICAgaW5RdWFydDogZnVuY3Rpb24gKHQpIHtcbiAgICAgICAgICAgIHJldHVybiB0ICogdCAqIHQgKiB0O1xuICAgICAgICB9LFxuICAgICAgICBvdXRRdWFydDogZnVuY3Rpb24gKHQpIHtcbiAgICAgICAgICAgIHJldHVybiAtKC0tdCAqIHQgKiB0ICogdCAtIDEpO1xuICAgICAgICB9LFxuICAgICAgICBpbk91dFF1YXJ0OiBmdW5jdGlvbiAodCkge1xuICAgICAgICAgICAgaWYgKCh0IC89IDAuNSkgPCAxKVxuICAgICAgICAgICAgICAgIHJldHVybiAwLjUgKiB0ICogdCAqIHQgKiB0O1xuICAgICAgICAgICAgcmV0dXJuIC0wLjUgKiAoKHQgLT0gMikgKiB0ICogdCAqIHQgLSAyKTtcbiAgICAgICAgfSxcbiAgICAgICAgaW5RdWludDogZnVuY3Rpb24gKHQpIHtcbiAgICAgICAgICAgIHJldHVybiB0ICogdCAqIHQgKiB0ICogdDtcbiAgICAgICAgfSxcbiAgICAgICAgb3V0UXVpbnQ6IGZ1bmN0aW9uICh0KSB7XG4gICAgICAgICAgICByZXR1cm4gLS10ICogdCAqIHQgKiB0ICogdCArIDE7XG4gICAgICAgIH0sXG4gICAgICAgIGluT3V0UXVpbnQ6IGZ1bmN0aW9uICh0KSB7XG4gICAgICAgICAgICBpZiAoKHQgLz0gMC41KSA8IDEpXG4gICAgICAgICAgICAgICAgcmV0dXJuIDAuNSAqIHQgKiB0ICogdCAqIHQgKiB0O1xuICAgICAgICAgICAgcmV0dXJuIDAuNSAqICgodCAtPSAyKSAqIHQgKiB0ICogdCAqIHQgKyAyKTtcbiAgICAgICAgfSxcbiAgICAgICAgaW5TaW5lOiBmdW5jdGlvbiAodCkge1xuICAgICAgICAgICAgcmV0dXJuIC0xICogTWF0aC5jb3ModCAqIChNYXRoLlBJIC8gMikpICsgMTtcbiAgICAgICAgfSxcbiAgICAgICAgb3V0U2luZTogZnVuY3Rpb24gKHQpIHtcbiAgICAgICAgICAgIHJldHVybiBNYXRoLnNpbih0ICogKE1hdGguUEkgLyAyKSk7XG4gICAgICAgIH0sXG4gICAgICAgIGluT3V0U2luZTogZnVuY3Rpb24gKHQpIHtcbiAgICAgICAgICAgIHJldHVybiAtMC41ICogKE1hdGguY29zKE1hdGguUEkgKiB0KSAtIDEpO1xuICAgICAgICB9LFxuICAgICAgICBpbkV4cG86IGZ1bmN0aW9uICh0KSB7XG4gICAgICAgICAgICByZXR1cm4gdCA9PT0gMCA/IDAgOiBNYXRoLnBvdygyLCAxMCAqICh0IC0gMSkpO1xuICAgICAgICB9LFxuICAgICAgICBvdXRFeHBvOiBmdW5jdGlvbiAodCkge1xuICAgICAgICAgICAgcmV0dXJuIHQgPT09IDEgPyAxIDogLU1hdGgucG93KDIsIC0xMCAqIHQpICsgMTtcbiAgICAgICAgfSxcbiAgICAgICAgaW5PdXRFeHBvOiBmdW5jdGlvbiAodCkge1xuICAgICAgICAgICAgaWYgKHQgPT09IDApXG4gICAgICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgICAgICBpZiAodCA9PT0gMSlcbiAgICAgICAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgICAgIGlmICgodCAvPSAwLjUpIDwgMSlcbiAgICAgICAgICAgICAgICByZXR1cm4gMC41ICogTWF0aC5wb3coMiwgMTAgKiAodCAtIDEpKTtcbiAgICAgICAgICAgIHJldHVybiAwLjUgKiAoLU1hdGgucG93KDIsIC0xMCAqIC0tdCkgKyAyKTtcbiAgICAgICAgfSxcbiAgICAgICAgaW5DaXJjOiBmdW5jdGlvbiAodCkge1xuICAgICAgICAgICAgcmV0dXJuIC0oTWF0aC5zcXJ0KDEgLSB0ICogdCkgLSAxKTtcbiAgICAgICAgfSxcbiAgICAgICAgb3V0Q2lyYzogZnVuY3Rpb24gKHQpIHtcbiAgICAgICAgICAgIHJldHVybiBNYXRoLnNxcnQoMSAtIC0tdCAqIHQpO1xuICAgICAgICB9LFxuICAgICAgICBpbk91dENpcmM6IGZ1bmN0aW9uICh0KSB7XG4gICAgICAgICAgICBpZiAoKHQgLz0gMC41KSA8IDEpXG4gICAgICAgICAgICAgICAgcmV0dXJuIC0wLjUgKiAoTWF0aC5zcXJ0KDEgLSB0ICogdCkgLSAxKTtcbiAgICAgICAgICAgIHJldHVybiAwLjUgKiAoTWF0aC5zcXJ0KDEgLSAodCAtPSAyKSAqIHQpICsgMSk7XG4gICAgICAgIH0sXG4gICAgICAgIGluRWxhc3RpYzogZnVuY3Rpb24gKHQpIHtcbiAgICAgICAgICAgIHZhciBzID0gMS43MDE1ODtcbiAgICAgICAgICAgIHZhciBwID0gMDtcbiAgICAgICAgICAgIHZhciBhID0gMTtcbiAgICAgICAgICAgIGlmICh0ID09PSAwKVxuICAgICAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICAgICAgaWYgKHQgPT09IDEpXG4gICAgICAgICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgICAgICBpZiAoIXApXG4gICAgICAgICAgICAgICAgcCA9IDAuMztcbiAgICAgICAgICAgIHMgPSBwIC8gKDIgKiBNYXRoLlBJKSAqIE1hdGguYXNpbigxIC8gYSk7XG4gICAgICAgICAgICByZXR1cm4gLShhICogTWF0aC5wb3coMiwgMTAgKiAodCAtPSAxKSkgKiBNYXRoLnNpbigodCAtIHMpICogKDIgKiBNYXRoLlBJKSAvIHApKTtcbiAgICAgICAgfSxcbiAgICAgICAgb3V0RWxhc3RpYzogZnVuY3Rpb24gKHQpIHtcbiAgICAgICAgICAgIHZhciBzID0gMS43MDE1ODtcbiAgICAgICAgICAgIHZhciBwID0gMDtcbiAgICAgICAgICAgIHZhciBhID0gMTtcbiAgICAgICAgICAgIGlmICh0ID09PSAwKVxuICAgICAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICAgICAgaWYgKHQgPT09IDEpXG4gICAgICAgICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgICAgICBpZiAoIXApXG4gICAgICAgICAgICAgICAgcCA9IDAuMztcbiAgICAgICAgICAgIHMgPSBwIC8gKDIgKiBNYXRoLlBJKSAqIE1hdGguYXNpbigxIC8gYSk7XG4gICAgICAgICAgICByZXR1cm4gYSAqIE1hdGgucG93KDIsIC0xMCAqIHQpICogTWF0aC5zaW4oKHQgLSBzKSAqICgyICogTWF0aC5QSSkgLyBwKSArIDE7XG4gICAgICAgIH0sXG4gICAgICAgIGluT3V0RWxhc3RpYzogZnVuY3Rpb24gKHQpIHtcbiAgICAgICAgICAgIHZhciBzID0gMS43MDE1ODtcbiAgICAgICAgICAgIHZhciBwID0gMDtcbiAgICAgICAgICAgIHZhciBhID0gMTtcbiAgICAgICAgICAgIGlmICh0ID09PSAwKVxuICAgICAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICAgICAgaWYgKCh0IC89IDAuNSkgPT09IDIpXG4gICAgICAgICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgICAgICBpZiAoIXApXG4gICAgICAgICAgICAgICAgcCA9IDAuMyAqIDEuNTtcbiAgICAgICAgICAgIHMgPSBwIC8gKDIgKiBNYXRoLlBJKSAqIE1hdGguYXNpbigxIC8gYSk7XG4gICAgICAgICAgICBpZiAodCA8IDEpXG4gICAgICAgICAgICAgICAgcmV0dXJuIC0wLjUgKiAoYSAqIE1hdGgucG93KDIsIDEwICogKHQgLT0gMSkpICogTWF0aC5zaW4oKHQgLSBzKSAqICgyICogTWF0aC5QSSkgLyBwKSk7XG4gICAgICAgICAgICByZXR1cm4gYSAqIE1hdGgucG93KDIsIC0xMCAqICh0IC09IDEpKSAqIE1hdGguc2luKCh0IC0gcykgKiAoMiAqIE1hdGguUEkpIC8gcCkgKiAwLjUgKyAxO1xuICAgICAgICB9LFxuICAgICAgICBpbkJhY2s6IGZ1bmN0aW9uICh0LCBzKSB7XG4gICAgICAgICAgICBpZiAocyA9PT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgICAgIHMgPSAxLjcwMTU4O1xuICAgICAgICAgICAgcmV0dXJuIHQgKiB0ICogKChzICsgMSkgKiB0IC0gcyk7XG4gICAgICAgIH0sXG4gICAgICAgIG91dEJhY2s6IGZ1bmN0aW9uICh0LCBzKSB7XG4gICAgICAgICAgICBpZiAocyA9PT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgICAgIHMgPSAxLjcwMTU4O1xuICAgICAgICAgICAgcmV0dXJuIC0tdCAqIHQgKiAoKHMgKyAxKSAqIHQgKyBzKSArIDE7XG4gICAgICAgIH0sXG4gICAgICAgIGluT3V0QmFjazogZnVuY3Rpb24gKHQsIHMpIHtcbiAgICAgICAgICAgIGlmIChzID09PSB1bmRlZmluZWQpXG4gICAgICAgICAgICAgICAgcyA9IDEuNzAxNTg7XG4gICAgICAgICAgICBpZiAoKHQgLz0gMC41KSA8IDEpXG4gICAgICAgICAgICAgICAgcmV0dXJuIDAuNSAqICh0ICogdCAqICgoKHMgKj0gMS41MjUpICsgMSkgKiB0IC0gcykpO1xuICAgICAgICAgICAgcmV0dXJuIDAuNSAqICgodCAtPSAyKSAqIHQgKiAoKChzICo9IDEuNTI1KSArIDEpICogdCArIHMpICsgMik7XG4gICAgICAgIH0sXG4gICAgICAgIGluQm91bmNlOiBmdW5jdGlvbiAodCkge1xuICAgICAgICAgICAgcmV0dXJuIDEgLSBFYXNpbmcub3V0Qm91bmNlKDEgLSB0KTtcbiAgICAgICAgfSxcbiAgICAgICAgb3V0Qm91bmNlOiBmdW5jdGlvbiAodCkge1xuICAgICAgICAgICAgaWYgKHQgPCAxIC8gMi43NSkge1xuICAgICAgICAgICAgICAgIHJldHVybiA3LjU2MjUgKiB0ICogdDtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodCA8IDIgLyAyLjc1KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDcuNTYyNSAqICh0IC09IDEuNSAvIDIuNzUpICogdCArIDAuNzU7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHQgPCAyLjUgLyAyLjc1KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDcuNTYyNSAqICh0IC09IDIuMjUgLyAyLjc1KSAqIHQgKyAwLjkzNzU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiA3LjU2MjUgKiAodCAtPSAyLjYyNSAvIDIuNzUpICogdCArIDAuOTg0Mzc1O1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBpbk91dEJvdW5jZTogZnVuY3Rpb24gKHQpIHtcbiAgICAgICAgICAgIGlmICh0IDwgMC41KVxuICAgICAgICAgICAgICAgIHJldHVybiBFYXNpbmcuaW5Cb3VuY2UodCAqIDIpICogMC41O1xuICAgICAgICAgICAgcmV0dXJuIEVhc2luZy5vdXRCb3VuY2UodCAqIDIgLSAxKSAqIDAuNSArIDAuNTtcbiAgICAgICAgfVxuICAgIH07XG5tb2R1bGUuZXhwb3J0cyA9IEVhc2luZzsiLCJ2YXIgVXRpbGl0eSA9IHJlcXVpcmUoJy4uL3V0aWxpdGllcy9VdGlsaXR5Jyk7XG5mdW5jdGlvbiBNdWx0aXBsZVRyYW5zaXRpb24obWV0aG9kKSB7XG4gICAgdGhpcy5tZXRob2QgPSBtZXRob2Q7XG4gICAgdGhpcy5faW5zdGFuY2VzID0gW107XG4gICAgdGhpcy5zdGF0ZSA9IFtdO1xufVxuTXVsdGlwbGVUcmFuc2l0aW9uLlNVUFBPUlRTX01VTFRJUExFID0gdHJ1ZTtcbk11bHRpcGxlVHJhbnNpdGlvbi5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24gZ2V0KCkge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5faW5zdGFuY2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHRoaXMuc3RhdGVbaV0gPSB0aGlzLl9pbnN0YW5jZXNbaV0uZ2V0KCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnN0YXRlO1xufTtcbk11bHRpcGxlVHJhbnNpdGlvbi5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24gc2V0KGVuZFN0YXRlLCB0cmFuc2l0aW9uLCBjYWxsYmFjaykge1xuICAgIHZhciBfYWxsQ2FsbGJhY2sgPSBVdGlsaXR5LmFmdGVyKGVuZFN0YXRlLmxlbmd0aCwgY2FsbGJhY2spO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZW5kU3RhdGUubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKCF0aGlzLl9pbnN0YW5jZXNbaV0pXG4gICAgICAgICAgICB0aGlzLl9pbnN0YW5jZXNbaV0gPSBuZXcgdGhpcy5tZXRob2QoKTtcbiAgICAgICAgdGhpcy5faW5zdGFuY2VzW2ldLnNldChlbmRTdGF0ZVtpXSwgdHJhbnNpdGlvbiwgX2FsbENhbGxiYWNrKTtcbiAgICB9XG59O1xuTXVsdGlwbGVUcmFuc2l0aW9uLnByb3RvdHlwZS5yZXNldCA9IGZ1bmN0aW9uIHJlc2V0KHN0YXJ0U3RhdGUpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHN0YXJ0U3RhdGUubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKCF0aGlzLl9pbnN0YW5jZXNbaV0pXG4gICAgICAgICAgICB0aGlzLl9pbnN0YW5jZXNbaV0gPSBuZXcgdGhpcy5tZXRob2QoKTtcbiAgICAgICAgdGhpcy5faW5zdGFuY2VzW2ldLnJlc2V0KHN0YXJ0U3RhdGVbaV0pO1xuICAgIH1cbn07XG5tb2R1bGUuZXhwb3J0cyA9IE11bHRpcGxlVHJhbnNpdGlvbjsiLCJ2YXIgTXVsdGlwbGVUcmFuc2l0aW9uID0gcmVxdWlyZSgnLi9NdWx0aXBsZVRyYW5zaXRpb24nKTtcbnZhciBUd2VlblRyYW5zaXRpb24gPSByZXF1aXJlKCcuL1R3ZWVuVHJhbnNpdGlvbicpO1xuZnVuY3Rpb24gVHJhbnNpdGlvbmFibGUoc3RhcnQpIHtcbiAgICB0aGlzLmN1cnJlbnRBY3Rpb24gPSBudWxsO1xuICAgIHRoaXMuYWN0aW9uUXVldWUgPSBbXTtcbiAgICB0aGlzLmNhbGxiYWNrUXVldWUgPSBbXTtcbiAgICB0aGlzLnN0YXRlID0gMDtcbiAgICB0aGlzLnZlbG9jaXR5ID0gdW5kZWZpbmVkO1xuICAgIHRoaXMuX2NhbGxiYWNrID0gdW5kZWZpbmVkO1xuICAgIHRoaXMuX2VuZ2luZUluc3RhbmNlID0gbnVsbDtcbiAgICB0aGlzLl9jdXJyZW50TWV0aG9kID0gbnVsbDtcbiAgICB0aGlzLnNldChzdGFydCk7XG59XG52YXIgdHJhbnNpdGlvbk1ldGhvZHMgPSB7fTtcblRyYW5zaXRpb25hYmxlLnJlZ2lzdGVyID0gZnVuY3Rpb24gcmVnaXN0ZXIobWV0aG9kcykge1xuICAgIHZhciBzdWNjZXNzID0gdHJ1ZTtcbiAgICBmb3IgKHZhciBtZXRob2QgaW4gbWV0aG9kcykge1xuICAgICAgICBpZiAoIVRyYW5zaXRpb25hYmxlLnJlZ2lzdGVyTWV0aG9kKG1ldGhvZCwgbWV0aG9kc1ttZXRob2RdKSlcbiAgICAgICAgICAgIHN1Y2Nlc3MgPSBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHN1Y2Nlc3M7XG59O1xuVHJhbnNpdGlvbmFibGUucmVnaXN0ZXJNZXRob2QgPSBmdW5jdGlvbiByZWdpc3Rlck1ldGhvZChuYW1lLCBlbmdpbmVDbGFzcykge1xuICAgIGlmICghKG5hbWUgaW4gdHJhbnNpdGlvbk1ldGhvZHMpKSB7XG4gICAgICAgIHRyYW5zaXRpb25NZXRob2RzW25hbWVdID0gZW5naW5lQ2xhc3M7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gZWxzZVxuICAgICAgICByZXR1cm4gZmFsc2U7XG59O1xuVHJhbnNpdGlvbmFibGUudW5yZWdpc3Rlck1ldGhvZCA9IGZ1bmN0aW9uIHVucmVnaXN0ZXJNZXRob2QobmFtZSkge1xuICAgIGlmIChuYW1lIGluIHRyYW5zaXRpb25NZXRob2RzKSB7XG4gICAgICAgIGRlbGV0ZSB0cmFuc2l0aW9uTWV0aG9kc1tuYW1lXTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBlbHNlXG4gICAgICAgIHJldHVybiBmYWxzZTtcbn07XG5mdW5jdGlvbiBfbG9hZE5leHQoKSB7XG4gICAgaWYgKHRoaXMuX2NhbGxiYWNrKSB7XG4gICAgICAgIHZhciBjYWxsYmFjayA9IHRoaXMuX2NhbGxiYWNrO1xuICAgICAgICB0aGlzLl9jYWxsYmFjayA9IHVuZGVmaW5lZDtcbiAgICAgICAgY2FsbGJhY2soKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuYWN0aW9uUXVldWUubGVuZ3RoIDw9IDApIHtcbiAgICAgICAgdGhpcy5zZXQodGhpcy5nZXQoKSk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5jdXJyZW50QWN0aW9uID0gdGhpcy5hY3Rpb25RdWV1ZS5zaGlmdCgpO1xuICAgIHRoaXMuX2NhbGxiYWNrID0gdGhpcy5jYWxsYmFja1F1ZXVlLnNoaWZ0KCk7XG4gICAgdmFyIG1ldGhvZCA9IG51bGw7XG4gICAgdmFyIGVuZFZhbHVlID0gdGhpcy5jdXJyZW50QWN0aW9uWzBdO1xuICAgIHZhciB0cmFuc2l0aW9uID0gdGhpcy5jdXJyZW50QWN0aW9uWzFdO1xuICAgIGlmICh0cmFuc2l0aW9uIGluc3RhbmNlb2YgT2JqZWN0ICYmIHRyYW5zaXRpb24ubWV0aG9kKSB7XG4gICAgICAgIG1ldGhvZCA9IHRyYW5zaXRpb24ubWV0aG9kO1xuICAgICAgICBpZiAodHlwZW9mIG1ldGhvZCA9PT0gJ3N0cmluZycpXG4gICAgICAgICAgICBtZXRob2QgPSB0cmFuc2l0aW9uTWV0aG9kc1ttZXRob2RdO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIG1ldGhvZCA9IFR3ZWVuVHJhbnNpdGlvbjtcbiAgICB9XG4gICAgaWYgKHRoaXMuX2N1cnJlbnRNZXRob2QgIT09IG1ldGhvZCkge1xuICAgICAgICBpZiAoIShlbmRWYWx1ZSBpbnN0YW5jZW9mIE9iamVjdCkgfHwgbWV0aG9kLlNVUFBPUlRTX01VTFRJUExFID09PSB0cnVlIHx8IGVuZFZhbHVlLmxlbmd0aCA8PSBtZXRob2QuU1VQUE9SVFNfTVVMVElQTEUpIHtcbiAgICAgICAgICAgIHRoaXMuX2VuZ2luZUluc3RhbmNlID0gbmV3IG1ldGhvZCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fZW5naW5lSW5zdGFuY2UgPSBuZXcgTXVsdGlwbGVUcmFuc2l0aW9uKG1ldGhvZCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fY3VycmVudE1ldGhvZCA9IG1ldGhvZDtcbiAgICB9XG4gICAgdGhpcy5fZW5naW5lSW5zdGFuY2UucmVzZXQodGhpcy5zdGF0ZSwgdGhpcy52ZWxvY2l0eSk7XG4gICAgaWYgKHRoaXMudmVsb2NpdHkgIT09IHVuZGVmaW5lZClcbiAgICAgICAgdHJhbnNpdGlvbi52ZWxvY2l0eSA9IHRoaXMudmVsb2NpdHk7XG4gICAgdGhpcy5fZW5naW5lSW5zdGFuY2Uuc2V0KGVuZFZhbHVlLCB0cmFuc2l0aW9uLCBfbG9hZE5leHQuYmluZCh0aGlzKSk7XG59XG5UcmFuc2l0aW9uYWJsZS5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24gc2V0KGVuZFN0YXRlLCB0cmFuc2l0aW9uLCBjYWxsYmFjaykge1xuICAgIGlmICghdHJhbnNpdGlvbikge1xuICAgICAgICB0aGlzLnJlc2V0KGVuZFN0YXRlKTtcbiAgICAgICAgaWYgKGNhbGxiYWNrKVxuICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIHZhciBhY3Rpb24gPSBbXG4gICAgICAgICAgICBlbmRTdGF0ZSxcbiAgICAgICAgICAgIHRyYW5zaXRpb25cbiAgICAgICAgXTtcbiAgICB0aGlzLmFjdGlvblF1ZXVlLnB1c2goYWN0aW9uKTtcbiAgICB0aGlzLmNhbGxiYWNrUXVldWUucHVzaChjYWxsYmFjayk7XG4gICAgaWYgKCF0aGlzLmN1cnJlbnRBY3Rpb24pXG4gICAgICAgIF9sb2FkTmV4dC5jYWxsKHRoaXMpO1xuICAgIHJldHVybiB0aGlzO1xufTtcblRyYW5zaXRpb25hYmxlLnByb3RvdHlwZS5yZXNldCA9IGZ1bmN0aW9uIHJlc2V0KHN0YXJ0U3RhdGUsIHN0YXJ0VmVsb2NpdHkpIHtcbiAgICB0aGlzLl9jdXJyZW50TWV0aG9kID0gbnVsbDtcbiAgICB0aGlzLl9lbmdpbmVJbnN0YW5jZSA9IG51bGw7XG4gICAgdGhpcy5fY2FsbGJhY2sgPSB1bmRlZmluZWQ7XG4gICAgdGhpcy5zdGF0ZSA9IHN0YXJ0U3RhdGU7XG4gICAgdGhpcy52ZWxvY2l0eSA9IHN0YXJ0VmVsb2NpdHk7XG4gICAgdGhpcy5jdXJyZW50QWN0aW9uID0gbnVsbDtcbiAgICB0aGlzLmFjdGlvblF1ZXVlID0gW107XG4gICAgdGhpcy5jYWxsYmFja1F1ZXVlID0gW107XG59O1xuVHJhbnNpdGlvbmFibGUucHJvdG90eXBlLmRlbGF5ID0gZnVuY3Rpb24gZGVsYXkoZHVyYXRpb24sIGNhbGxiYWNrKSB7XG4gICAgdGhpcy5zZXQodGhpcy5nZXQoKSwge1xuICAgICAgICBkdXJhdGlvbjogZHVyYXRpb24sXG4gICAgICAgIGN1cnZlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgfVxuICAgIH0sIGNhbGxiYWNrKTtcbn07XG5UcmFuc2l0aW9uYWJsZS5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24gZ2V0KHRpbWVzdGFtcCkge1xuICAgIGlmICh0aGlzLl9lbmdpbmVJbnN0YW5jZSkge1xuICAgICAgICBpZiAodGhpcy5fZW5naW5lSW5zdGFuY2UuZ2V0VmVsb2NpdHkpXG4gICAgICAgICAgICB0aGlzLnZlbG9jaXR5ID0gdGhpcy5fZW5naW5lSW5zdGFuY2UuZ2V0VmVsb2NpdHkoKTtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHRoaXMuX2VuZ2luZUluc3RhbmNlLmdldCh0aW1lc3RhbXApO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5zdGF0ZTtcbn07XG5UcmFuc2l0aW9uYWJsZS5wcm90b3R5cGUuaXNBY3RpdmUgPSBmdW5jdGlvbiBpc0FjdGl2ZSgpIHtcbiAgICByZXR1cm4gISF0aGlzLmN1cnJlbnRBY3Rpb247XG59O1xuVHJhbnNpdGlvbmFibGUucHJvdG90eXBlLmhhbHQgPSBmdW5jdGlvbiBoYWx0KCkge1xuICAgIHJldHVybiB0aGlzLnNldCh0aGlzLmdldCgpKTtcbn07XG5tb2R1bGUuZXhwb3J0cyA9IFRyYW5zaXRpb25hYmxlOyIsInZhciBUcmFuc2l0aW9uYWJsZSA9IHJlcXVpcmUoJy4vVHJhbnNpdGlvbmFibGUnKTtcbnZhciBUcmFuc2Zvcm0gPSByZXF1aXJlKCcuLi9jb3JlL1RyYW5zZm9ybScpO1xudmFyIFV0aWxpdHkgPSByZXF1aXJlKCcuLi91dGlsaXRpZXMvVXRpbGl0eScpO1xuZnVuY3Rpb24gVHJhbnNpdGlvbmFibGVUcmFuc2Zvcm0odHJhbnNmb3JtKSB7XG4gICAgdGhpcy5fZmluYWwgPSBUcmFuc2Zvcm0uaWRlbnRpdHkuc2xpY2UoKTtcbiAgICB0aGlzLl9maW5hbFRyYW5zbGF0ZSA9IFtcbiAgICAgICAgMCxcbiAgICAgICAgMCxcbiAgICAgICAgMFxuICAgIF07XG4gICAgdGhpcy5fZmluYWxSb3RhdGUgPSBbXG4gICAgICAgIDAsXG4gICAgICAgIDAsXG4gICAgICAgIDBcbiAgICBdO1xuICAgIHRoaXMuX2ZpbmFsU2tldyA9IFtcbiAgICAgICAgMCxcbiAgICAgICAgMCxcbiAgICAgICAgMFxuICAgIF07XG4gICAgdGhpcy5fZmluYWxTY2FsZSA9IFtcbiAgICAgICAgMSxcbiAgICAgICAgMSxcbiAgICAgICAgMVxuICAgIF07XG4gICAgdGhpcy50cmFuc2xhdGUgPSBuZXcgVHJhbnNpdGlvbmFibGUodGhpcy5fZmluYWxUcmFuc2xhdGUpO1xuICAgIHRoaXMucm90YXRlID0gbmV3IFRyYW5zaXRpb25hYmxlKHRoaXMuX2ZpbmFsUm90YXRlKTtcbiAgICB0aGlzLnNrZXcgPSBuZXcgVHJhbnNpdGlvbmFibGUodGhpcy5fZmluYWxTa2V3KTtcbiAgICB0aGlzLnNjYWxlID0gbmV3IFRyYW5zaXRpb25hYmxlKHRoaXMuX2ZpbmFsU2NhbGUpO1xuICAgIGlmICh0cmFuc2Zvcm0pXG4gICAgICAgIHRoaXMuc2V0KHRyYW5zZm9ybSk7XG59XG5mdW5jdGlvbiBfYnVpbGQoKSB7XG4gICAgcmV0dXJuIFRyYW5zZm9ybS5idWlsZCh7XG4gICAgICAgIHRyYW5zbGF0ZTogdGhpcy50cmFuc2xhdGUuZ2V0KCksXG4gICAgICAgIHJvdGF0ZTogdGhpcy5yb3RhdGUuZ2V0KCksXG4gICAgICAgIHNrZXc6IHRoaXMuc2tldy5nZXQoKSxcbiAgICAgICAgc2NhbGU6IHRoaXMuc2NhbGUuZ2V0KClcbiAgICB9KTtcbn1cbmZ1bmN0aW9uIF9idWlsZEZpbmFsKCkge1xuICAgIHJldHVybiBUcmFuc2Zvcm0uYnVpbGQoe1xuICAgICAgICB0cmFuc2xhdGU6IHRoaXMuX2ZpbmFsVHJhbnNsYXRlLFxuICAgICAgICByb3RhdGU6IHRoaXMuX2ZpbmFsUm90YXRlLFxuICAgICAgICBza2V3OiB0aGlzLl9maW5hbFNrZXcsXG4gICAgICAgIHNjYWxlOiB0aGlzLl9maW5hbFNjYWxlXG4gICAgfSk7XG59XG5UcmFuc2l0aW9uYWJsZVRyYW5zZm9ybS5wcm90b3R5cGUuc2V0VHJhbnNsYXRlID0gZnVuY3Rpb24gc2V0VHJhbnNsYXRlKHRyYW5zbGF0ZSwgdHJhbnNpdGlvbiwgY2FsbGJhY2spIHtcbiAgICB0aGlzLl9maW5hbFRyYW5zbGF0ZSA9IHRyYW5zbGF0ZTtcbiAgICB0aGlzLl9maW5hbCA9IF9idWlsZEZpbmFsLmNhbGwodGhpcyk7XG4gICAgdGhpcy50cmFuc2xhdGUuc2V0KHRyYW5zbGF0ZSwgdHJhbnNpdGlvbiwgY2FsbGJhY2spO1xuICAgIHJldHVybiB0aGlzO1xufTtcblRyYW5zaXRpb25hYmxlVHJhbnNmb3JtLnByb3RvdHlwZS5zZXRTY2FsZSA9IGZ1bmN0aW9uIHNldFNjYWxlKHNjYWxlLCB0cmFuc2l0aW9uLCBjYWxsYmFjaykge1xuICAgIHRoaXMuX2ZpbmFsU2NhbGUgPSBzY2FsZTtcbiAgICB0aGlzLl9maW5hbCA9IF9idWlsZEZpbmFsLmNhbGwodGhpcyk7XG4gICAgdGhpcy5zY2FsZS5zZXQoc2NhbGUsIHRyYW5zaXRpb24sIGNhbGxiYWNrKTtcbiAgICByZXR1cm4gdGhpcztcbn07XG5UcmFuc2l0aW9uYWJsZVRyYW5zZm9ybS5wcm90b3R5cGUuc2V0Um90YXRlID0gZnVuY3Rpb24gc2V0Um90YXRlKGV1bGVyQW5nbGVzLCB0cmFuc2l0aW9uLCBjYWxsYmFjaykge1xuICAgIHRoaXMuX2ZpbmFsUm90YXRlID0gZXVsZXJBbmdsZXM7XG4gICAgdGhpcy5fZmluYWwgPSBfYnVpbGRGaW5hbC5jYWxsKHRoaXMpO1xuICAgIHRoaXMucm90YXRlLnNldChldWxlckFuZ2xlcywgdHJhbnNpdGlvbiwgY2FsbGJhY2spO1xuICAgIHJldHVybiB0aGlzO1xufTtcblRyYW5zaXRpb25hYmxlVHJhbnNmb3JtLnByb3RvdHlwZS5zZXRTa2V3ID0gZnVuY3Rpb24gc2V0U2tldyhza2V3QW5nbGVzLCB0cmFuc2l0aW9uLCBjYWxsYmFjaykge1xuICAgIHRoaXMuX2ZpbmFsU2tldyA9IHNrZXdBbmdsZXM7XG4gICAgdGhpcy5fZmluYWwgPSBfYnVpbGRGaW5hbC5jYWxsKHRoaXMpO1xuICAgIHRoaXMuc2tldy5zZXQoc2tld0FuZ2xlcywgdHJhbnNpdGlvbiwgY2FsbGJhY2spO1xuICAgIHJldHVybiB0aGlzO1xufTtcblRyYW5zaXRpb25hYmxlVHJhbnNmb3JtLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbiBzZXQodHJhbnNmb3JtLCB0cmFuc2l0aW9uLCBjYWxsYmFjaykge1xuICAgIHZhciBjb21wb25lbnRzID0gVHJhbnNmb3JtLmludGVycHJldCh0cmFuc2Zvcm0pO1xuICAgIHRoaXMuX2ZpbmFsVHJhbnNsYXRlID0gY29tcG9uZW50cy50cmFuc2xhdGU7XG4gICAgdGhpcy5fZmluYWxSb3RhdGUgPSBjb21wb25lbnRzLnJvdGF0ZTtcbiAgICB0aGlzLl9maW5hbFNrZXcgPSBjb21wb25lbnRzLnNrZXc7XG4gICAgdGhpcy5fZmluYWxTY2FsZSA9IGNvbXBvbmVudHMuc2NhbGU7XG4gICAgdGhpcy5fZmluYWwgPSB0cmFuc2Zvcm07XG4gICAgdmFyIF9jYWxsYmFjayA9IGNhbGxiYWNrID8gVXRpbGl0eS5hZnRlcig0LCBjYWxsYmFjaykgOiBudWxsO1xuICAgIHRoaXMudHJhbnNsYXRlLnNldChjb21wb25lbnRzLnRyYW5zbGF0ZSwgdHJhbnNpdGlvbiwgX2NhbGxiYWNrKTtcbiAgICB0aGlzLnJvdGF0ZS5zZXQoY29tcG9uZW50cy5yb3RhdGUsIHRyYW5zaXRpb24sIF9jYWxsYmFjayk7XG4gICAgdGhpcy5za2V3LnNldChjb21wb25lbnRzLnNrZXcsIHRyYW5zaXRpb24sIF9jYWxsYmFjayk7XG4gICAgdGhpcy5zY2FsZS5zZXQoY29tcG9uZW50cy5zY2FsZSwgdHJhbnNpdGlvbiwgX2NhbGxiYWNrKTtcbiAgICByZXR1cm4gdGhpcztcbn07XG5UcmFuc2l0aW9uYWJsZVRyYW5zZm9ybS5wcm90b3R5cGUuc2V0RGVmYXVsdFRyYW5zaXRpb24gPSBmdW5jdGlvbiBzZXREZWZhdWx0VHJhbnNpdGlvbih0cmFuc2l0aW9uKSB7XG4gICAgdGhpcy50cmFuc2xhdGUuc2V0RGVmYXVsdCh0cmFuc2l0aW9uKTtcbiAgICB0aGlzLnJvdGF0ZS5zZXREZWZhdWx0KHRyYW5zaXRpb24pO1xuICAgIHRoaXMuc2tldy5zZXREZWZhdWx0KHRyYW5zaXRpb24pO1xuICAgIHRoaXMuc2NhbGUuc2V0RGVmYXVsdCh0cmFuc2l0aW9uKTtcbn07XG5UcmFuc2l0aW9uYWJsZVRyYW5zZm9ybS5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24gZ2V0KCkge1xuICAgIGlmICh0aGlzLmlzQWN0aXZlKCkpIHtcbiAgICAgICAgcmV0dXJuIF9idWlsZC5jYWxsKHRoaXMpO1xuICAgIH0gZWxzZVxuICAgICAgICByZXR1cm4gdGhpcy5fZmluYWw7XG59O1xuVHJhbnNpdGlvbmFibGVUcmFuc2Zvcm0ucHJvdG90eXBlLmdldEZpbmFsID0gZnVuY3Rpb24gZ2V0RmluYWwoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2ZpbmFsO1xufTtcblRyYW5zaXRpb25hYmxlVHJhbnNmb3JtLnByb3RvdHlwZS5pc0FjdGl2ZSA9IGZ1bmN0aW9uIGlzQWN0aXZlKCkge1xuICAgIHJldHVybiB0aGlzLnRyYW5zbGF0ZS5pc0FjdGl2ZSgpIHx8IHRoaXMucm90YXRlLmlzQWN0aXZlKCkgfHwgdGhpcy5zY2FsZS5pc0FjdGl2ZSgpIHx8IHRoaXMuc2tldy5pc0FjdGl2ZSgpO1xufTtcblRyYW5zaXRpb25hYmxlVHJhbnNmb3JtLnByb3RvdHlwZS5oYWx0ID0gZnVuY3Rpb24gaGFsdCgpIHtcbiAgICB0aGlzLnRyYW5zbGF0ZS5oYWx0KCk7XG4gICAgdGhpcy5yb3RhdGUuaGFsdCgpO1xuICAgIHRoaXMuc2tldy5oYWx0KCk7XG4gICAgdGhpcy5zY2FsZS5oYWx0KCk7XG4gICAgdGhpcy5fZmluYWwgPSB0aGlzLmdldCgpO1xuICAgIHRoaXMuX2ZpbmFsVHJhbnNsYXRlID0gdGhpcy50cmFuc2xhdGUuZ2V0KCk7XG4gICAgdGhpcy5fZmluYWxSb3RhdGUgPSB0aGlzLnJvdGF0ZS5nZXQoKTtcbiAgICB0aGlzLl9maW5hbFNrZXcgPSB0aGlzLnNrZXcuZ2V0KCk7XG4gICAgdGhpcy5fZmluYWxTY2FsZSA9IHRoaXMuc2NhbGUuZ2V0KCk7XG4gICAgcmV0dXJuIHRoaXM7XG59O1xubW9kdWxlLmV4cG9ydHMgPSBUcmFuc2l0aW9uYWJsZVRyYW5zZm9ybTsiLCJmdW5jdGlvbiBUd2VlblRyYW5zaXRpb24ob3B0aW9ucykge1xuICAgIHRoaXMub3B0aW9ucyA9IE9iamVjdC5jcmVhdGUoVHdlZW5UcmFuc2l0aW9uLkRFRkFVTFRfT1BUSU9OUyk7XG4gICAgaWYgKG9wdGlvbnMpXG4gICAgICAgIHRoaXMuc2V0T3B0aW9ucyhvcHRpb25zKTtcbiAgICB0aGlzLl9zdGFydFRpbWUgPSAwO1xuICAgIHRoaXMuX3N0YXJ0VmFsdWUgPSAwO1xuICAgIHRoaXMuX3VwZGF0ZVRpbWUgPSAwO1xuICAgIHRoaXMuX2VuZFZhbHVlID0gMDtcbiAgICB0aGlzLl9jdXJ2ZSA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLl9kdXJhdGlvbiA9IDA7XG4gICAgdGhpcy5fYWN0aXZlID0gZmFsc2U7XG4gICAgdGhpcy5fY2FsbGJhY2sgPSB1bmRlZmluZWQ7XG4gICAgdGhpcy5zdGF0ZSA9IDA7XG4gICAgdGhpcy52ZWxvY2l0eSA9IHVuZGVmaW5lZDtcbn1cblR3ZWVuVHJhbnNpdGlvbi5DdXJ2ZXMgPSB7XG4gICAgbGluZWFyOiBmdW5jdGlvbiAodCkge1xuICAgICAgICByZXR1cm4gdDtcbiAgICB9LFxuICAgIGVhc2VJbjogZnVuY3Rpb24gKHQpIHtcbiAgICAgICAgcmV0dXJuIHQgKiB0O1xuICAgIH0sXG4gICAgZWFzZU91dDogZnVuY3Rpb24gKHQpIHtcbiAgICAgICAgcmV0dXJuIHQgKiAoMiAtIHQpO1xuICAgIH0sXG4gICAgZWFzZUluT3V0OiBmdW5jdGlvbiAodCkge1xuICAgICAgICBpZiAodCA8PSAwLjUpXG4gICAgICAgICAgICByZXR1cm4gMiAqIHQgKiB0O1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXR1cm4gLTIgKiB0ICogdCArIDQgKiB0IC0gMTtcbiAgICB9LFxuICAgIGVhc2VPdXRCb3VuY2U6IGZ1bmN0aW9uICh0KSB7XG4gICAgICAgIHJldHVybiB0ICogKDMgLSAyICogdCk7XG4gICAgfSxcbiAgICBzcHJpbmc6IGZ1bmN0aW9uICh0KSB7XG4gICAgICAgIHJldHVybiAoMSAtIHQpICogTWF0aC5zaW4oNiAqIE1hdGguUEkgKiB0KSArIHQ7XG4gICAgfVxufTtcblR3ZWVuVHJhbnNpdGlvbi5TVVBQT1JUU19NVUxUSVBMRSA9IHRydWU7XG5Ud2VlblRyYW5zaXRpb24uREVGQVVMVF9PUFRJT05TID0ge1xuICAgIGN1cnZlOiBUd2VlblRyYW5zaXRpb24uQ3VydmVzLmxpbmVhcixcbiAgICBkdXJhdGlvbjogNTAwLFxuICAgIHNwZWVkOiAwXG59O1xudmFyIHJlZ2lzdGVyZWRDdXJ2ZXMgPSB7fTtcblR3ZWVuVHJhbnNpdGlvbi5yZWdpc3RlckN1cnZlID0gZnVuY3Rpb24gcmVnaXN0ZXJDdXJ2ZShjdXJ2ZU5hbWUsIGN1cnZlKSB7XG4gICAgaWYgKCFyZWdpc3RlcmVkQ3VydmVzW2N1cnZlTmFtZV0pIHtcbiAgICAgICAgcmVnaXN0ZXJlZEN1cnZlc1tjdXJ2ZU5hbWVdID0gY3VydmU7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG59O1xuVHdlZW5UcmFuc2l0aW9uLnVucmVnaXN0ZXJDdXJ2ZSA9IGZ1bmN0aW9uIHVucmVnaXN0ZXJDdXJ2ZShjdXJ2ZU5hbWUpIHtcbiAgICBpZiAocmVnaXN0ZXJlZEN1cnZlc1tjdXJ2ZU5hbWVdKSB7XG4gICAgICAgIGRlbGV0ZSByZWdpc3RlcmVkQ3VydmVzW2N1cnZlTmFtZV07XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG59O1xuVHdlZW5UcmFuc2l0aW9uLmdldEN1cnZlID0gZnVuY3Rpb24gZ2V0Q3VydmUoY3VydmVOYW1lKSB7XG4gICAgdmFyIGN1cnZlID0gcmVnaXN0ZXJlZEN1cnZlc1tjdXJ2ZU5hbWVdO1xuICAgIGlmIChjdXJ2ZSAhPT0gdW5kZWZpbmVkKVxuICAgICAgICByZXR1cm4gY3VydmU7XG4gICAgZWxzZVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2N1cnZlIG5vdCByZWdpc3RlcmVkJyk7XG59O1xuVHdlZW5UcmFuc2l0aW9uLmdldEN1cnZlcyA9IGZ1bmN0aW9uIGdldEN1cnZlcygpIHtcbiAgICByZXR1cm4gcmVnaXN0ZXJlZEN1cnZlcztcbn07XG5mdW5jdGlvbiBfaW50ZXJwb2xhdGUoYSwgYiwgdCkge1xuICAgIHJldHVybiAoMSAtIHQpICogYSArIHQgKiBiO1xufVxuZnVuY3Rpb24gX2Nsb25lKG9iaikge1xuICAgIGlmIChvYmogaW5zdGFuY2VvZiBPYmplY3QpIHtcbiAgICAgICAgaWYgKG9iaiBpbnN0YW5jZW9mIEFycmF5KVxuICAgICAgICAgICAgcmV0dXJuIG9iai5zbGljZSgwKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmV0dXJuIE9iamVjdC5jcmVhdGUob2JqKTtcbiAgICB9IGVsc2VcbiAgICAgICAgcmV0dXJuIG9iajtcbn1cbmZ1bmN0aW9uIF9ub3JtYWxpemUodHJhbnNpdGlvbiwgZGVmYXVsdFRyYW5zaXRpb24pIHtcbiAgICB2YXIgcmVzdWx0ID0geyBjdXJ2ZTogZGVmYXVsdFRyYW5zaXRpb24uY3VydmUgfTtcbiAgICBpZiAoZGVmYXVsdFRyYW5zaXRpb24uZHVyYXRpb24pXG4gICAgICAgIHJlc3VsdC5kdXJhdGlvbiA9IGRlZmF1bHRUcmFuc2l0aW9uLmR1cmF0aW9uO1xuICAgIGlmIChkZWZhdWx0VHJhbnNpdGlvbi5zcGVlZClcbiAgICAgICAgcmVzdWx0LnNwZWVkID0gZGVmYXVsdFRyYW5zaXRpb24uc3BlZWQ7XG4gICAgaWYgKHRyYW5zaXRpb24gaW5zdGFuY2VvZiBPYmplY3QpIHtcbiAgICAgICAgaWYgKHRyYW5zaXRpb24uZHVyYXRpb24gIT09IHVuZGVmaW5lZClcbiAgICAgICAgICAgIHJlc3VsdC5kdXJhdGlvbiA9IHRyYW5zaXRpb24uZHVyYXRpb247XG4gICAgICAgIGlmICh0cmFuc2l0aW9uLmN1cnZlKVxuICAgICAgICAgICAgcmVzdWx0LmN1cnZlID0gdHJhbnNpdGlvbi5jdXJ2ZTtcbiAgICAgICAgaWYgKHRyYW5zaXRpb24uc3BlZWQpXG4gICAgICAgICAgICByZXN1bHQuc3BlZWQgPSB0cmFuc2l0aW9uLnNwZWVkO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIHJlc3VsdC5jdXJ2ZSA9PT0gJ3N0cmluZycpXG4gICAgICAgIHJlc3VsdC5jdXJ2ZSA9IFR3ZWVuVHJhbnNpdGlvbi5nZXRDdXJ2ZShyZXN1bHQuY3VydmUpO1xuICAgIHJldHVybiByZXN1bHQ7XG59XG5Ud2VlblRyYW5zaXRpb24ucHJvdG90eXBlLnNldE9wdGlvbnMgPSBmdW5jdGlvbiBzZXRPcHRpb25zKG9wdGlvbnMpIHtcbiAgICBpZiAob3B0aW9ucy5jdXJ2ZSAhPT0gdW5kZWZpbmVkKVxuICAgICAgICB0aGlzLm9wdGlvbnMuY3VydmUgPSBvcHRpb25zLmN1cnZlO1xuICAgIGlmIChvcHRpb25zLmR1cmF0aW9uICE9PSB1bmRlZmluZWQpXG4gICAgICAgIHRoaXMub3B0aW9ucy5kdXJhdGlvbiA9IG9wdGlvbnMuZHVyYXRpb247XG4gICAgaWYgKG9wdGlvbnMuc3BlZWQgIT09IHVuZGVmaW5lZClcbiAgICAgICAgdGhpcy5vcHRpb25zLnNwZWVkID0gb3B0aW9ucy5zcGVlZDtcbn07XG5Ud2VlblRyYW5zaXRpb24ucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uIHNldChlbmRWYWx1ZSwgdHJhbnNpdGlvbiwgY2FsbGJhY2spIHtcbiAgICBpZiAoIXRyYW5zaXRpb24pIHtcbiAgICAgICAgdGhpcy5yZXNldChlbmRWYWx1ZSk7XG4gICAgICAgIGlmIChjYWxsYmFjaylcbiAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5fc3RhcnRWYWx1ZSA9IF9jbG9uZSh0aGlzLmdldCgpKTtcbiAgICB0cmFuc2l0aW9uID0gX25vcm1hbGl6ZSh0cmFuc2l0aW9uLCB0aGlzLm9wdGlvbnMpO1xuICAgIGlmICh0cmFuc2l0aW9uLnNwZWVkKSB7XG4gICAgICAgIHZhciBzdGFydFZhbHVlID0gdGhpcy5fc3RhcnRWYWx1ZTtcbiAgICAgICAgaWYgKHN0YXJ0VmFsdWUgaW5zdGFuY2VvZiBPYmplY3QpIHtcbiAgICAgICAgICAgIHZhciB2YXJpYW5jZSA9IDA7XG4gICAgICAgICAgICBmb3IgKHZhciBpIGluIHN0YXJ0VmFsdWUpXG4gICAgICAgICAgICAgICAgdmFyaWFuY2UgKz0gKGVuZFZhbHVlW2ldIC0gc3RhcnRWYWx1ZVtpXSkgKiAoZW5kVmFsdWVbaV0gLSBzdGFydFZhbHVlW2ldKTtcbiAgICAgICAgICAgIHRyYW5zaXRpb24uZHVyYXRpb24gPSBNYXRoLnNxcnQodmFyaWFuY2UpIC8gdHJhbnNpdGlvbi5zcGVlZDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRyYW5zaXRpb24uZHVyYXRpb24gPSBNYXRoLmFicyhlbmRWYWx1ZSAtIHN0YXJ0VmFsdWUpIC8gdHJhbnNpdGlvbi5zcGVlZDtcbiAgICAgICAgfVxuICAgIH1cbiAgICB0aGlzLl9zdGFydFRpbWUgPSBEYXRlLm5vdygpO1xuICAgIHRoaXMuX2VuZFZhbHVlID0gX2Nsb25lKGVuZFZhbHVlKTtcbiAgICB0aGlzLl9zdGFydFZlbG9jaXR5ID0gX2Nsb25lKHRyYW5zaXRpb24udmVsb2NpdHkpO1xuICAgIHRoaXMuX2R1cmF0aW9uID0gdHJhbnNpdGlvbi5kdXJhdGlvbjtcbiAgICB0aGlzLl9jdXJ2ZSA9IHRyYW5zaXRpb24uY3VydmU7XG4gICAgdGhpcy5fYWN0aXZlID0gdHJ1ZTtcbiAgICB0aGlzLl9jYWxsYmFjayA9IGNhbGxiYWNrO1xufTtcblR3ZWVuVHJhbnNpdGlvbi5wcm90b3R5cGUucmVzZXQgPSBmdW5jdGlvbiByZXNldChzdGFydFZhbHVlLCBzdGFydFZlbG9jaXR5KSB7XG4gICAgaWYgKHRoaXMuX2NhbGxiYWNrKSB7XG4gICAgICAgIHZhciBjYWxsYmFjayA9IHRoaXMuX2NhbGxiYWNrO1xuICAgICAgICB0aGlzLl9jYWxsYmFjayA9IHVuZGVmaW5lZDtcbiAgICAgICAgY2FsbGJhY2soKTtcbiAgICB9XG4gICAgdGhpcy5zdGF0ZSA9IF9jbG9uZShzdGFydFZhbHVlKTtcbiAgICB0aGlzLnZlbG9jaXR5ID0gX2Nsb25lKHN0YXJ0VmVsb2NpdHkpO1xuICAgIHRoaXMuX3N0YXJ0VGltZSA9IDA7XG4gICAgdGhpcy5fZHVyYXRpb24gPSAwO1xuICAgIHRoaXMuX3VwZGF0ZVRpbWUgPSAwO1xuICAgIHRoaXMuX3N0YXJ0VmFsdWUgPSB0aGlzLnN0YXRlO1xuICAgIHRoaXMuX3N0YXJ0VmVsb2NpdHkgPSB0aGlzLnZlbG9jaXR5O1xuICAgIHRoaXMuX2VuZFZhbHVlID0gdGhpcy5zdGF0ZTtcbiAgICB0aGlzLl9hY3RpdmUgPSBmYWxzZTtcbn07XG5Ud2VlblRyYW5zaXRpb24ucHJvdG90eXBlLmdldFZlbG9jaXR5ID0gZnVuY3Rpb24gZ2V0VmVsb2NpdHkoKSB7XG4gICAgcmV0dXJuIHRoaXMudmVsb2NpdHk7XG59O1xuVHdlZW5UcmFuc2l0aW9uLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbiBnZXQodGltZXN0YW1wKSB7XG4gICAgdGhpcy51cGRhdGUodGltZXN0YW1wKTtcbiAgICByZXR1cm4gdGhpcy5zdGF0ZTtcbn07XG5mdW5jdGlvbiBfY2FsY3VsYXRlVmVsb2NpdHkoY3VycmVudCwgc3RhcnQsIGN1cnZlLCBkdXJhdGlvbiwgdCkge1xuICAgIHZhciB2ZWxvY2l0eTtcbiAgICB2YXIgZXBzID0gMWUtNztcbiAgICB2YXIgc3BlZWQgPSAoY3VydmUodCkgLSBjdXJ2ZSh0IC0gZXBzKSkgLyBlcHM7XG4gICAgaWYgKGN1cnJlbnQgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgICB2ZWxvY2l0eSA9IFtdO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGN1cnJlbnQubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgY3VycmVudFtpXSA9PT0gJ251bWJlcicpXG4gICAgICAgICAgICAgICAgdmVsb2NpdHlbaV0gPSBzcGVlZCAqIChjdXJyZW50W2ldIC0gc3RhcnRbaV0pIC8gZHVyYXRpb247XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgdmVsb2NpdHlbaV0gPSAwO1xuICAgICAgICB9XG4gICAgfSBlbHNlXG4gICAgICAgIHZlbG9jaXR5ID0gc3BlZWQgKiAoY3VycmVudCAtIHN0YXJ0KSAvIGR1cmF0aW9uO1xuICAgIHJldHVybiB2ZWxvY2l0eTtcbn1cbmZ1bmN0aW9uIF9jYWxjdWxhdGVTdGF0ZShzdGFydCwgZW5kLCB0KSB7XG4gICAgdmFyIHN0YXRlO1xuICAgIGlmIChzdGFydCBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICAgIHN0YXRlID0gW107XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc3RhcnQubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2Ygc3RhcnRbaV0gPT09ICdudW1iZXInKVxuICAgICAgICAgICAgICAgIHN0YXRlW2ldID0gX2ludGVycG9sYXRlKHN0YXJ0W2ldLCBlbmRbaV0sIHQpO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHN0YXRlW2ldID0gc3RhcnRbaV07XG4gICAgICAgIH1cbiAgICB9IGVsc2VcbiAgICAgICAgc3RhdGUgPSBfaW50ZXJwb2xhdGUoc3RhcnQsIGVuZCwgdCk7XG4gICAgcmV0dXJuIHN0YXRlO1xufVxuVHdlZW5UcmFuc2l0aW9uLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbiB1cGRhdGUodGltZXN0YW1wKSB7XG4gICAgaWYgKCF0aGlzLl9hY3RpdmUpIHtcbiAgICAgICAgaWYgKHRoaXMuX2NhbGxiYWNrKSB7XG4gICAgICAgICAgICB2YXIgY2FsbGJhY2sgPSB0aGlzLl9jYWxsYmFjaztcbiAgICAgICAgICAgIHRoaXMuX2NhbGxiYWNrID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICghdGltZXN0YW1wKVxuICAgICAgICB0aW1lc3RhbXAgPSBEYXRlLm5vdygpO1xuICAgIGlmICh0aGlzLl91cGRhdGVUaW1lID49IHRpbWVzdGFtcClcbiAgICAgICAgcmV0dXJuO1xuICAgIHRoaXMuX3VwZGF0ZVRpbWUgPSB0aW1lc3RhbXA7XG4gICAgdmFyIHRpbWVTaW5jZVN0YXJ0ID0gdGltZXN0YW1wIC0gdGhpcy5fc3RhcnRUaW1lO1xuICAgIGlmICh0aW1lU2luY2VTdGFydCA+PSB0aGlzLl9kdXJhdGlvbikge1xuICAgICAgICB0aGlzLnN0YXRlID0gdGhpcy5fZW5kVmFsdWU7XG4gICAgICAgIHRoaXMudmVsb2NpdHkgPSBfY2FsY3VsYXRlVmVsb2NpdHkodGhpcy5zdGF0ZSwgdGhpcy5fc3RhcnRWYWx1ZSwgdGhpcy5fY3VydmUsIHRoaXMuX2R1cmF0aW9uLCAxKTtcbiAgICAgICAgdGhpcy5fYWN0aXZlID0gZmFsc2U7XG4gICAgfSBlbHNlIGlmICh0aW1lU2luY2VTdGFydCA8IDApIHtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHRoaXMuX3N0YXJ0VmFsdWU7XG4gICAgICAgIHRoaXMudmVsb2NpdHkgPSB0aGlzLl9zdGFydFZlbG9jaXR5O1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciB0ID0gdGltZVNpbmNlU3RhcnQgLyB0aGlzLl9kdXJhdGlvbjtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IF9jYWxjdWxhdGVTdGF0ZSh0aGlzLl9zdGFydFZhbHVlLCB0aGlzLl9lbmRWYWx1ZSwgdGhpcy5fY3VydmUodCkpO1xuICAgICAgICB0aGlzLnZlbG9jaXR5ID0gX2NhbGN1bGF0ZVZlbG9jaXR5KHRoaXMuc3RhdGUsIHRoaXMuX3N0YXJ0VmFsdWUsIHRoaXMuX2N1cnZlLCB0aGlzLl9kdXJhdGlvbiwgdCk7XG4gICAgfVxufTtcblR3ZWVuVHJhbnNpdGlvbi5wcm90b3R5cGUuaXNBY3RpdmUgPSBmdW5jdGlvbiBpc0FjdGl2ZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fYWN0aXZlO1xufTtcblR3ZWVuVHJhbnNpdGlvbi5wcm90b3R5cGUuaGFsdCA9IGZ1bmN0aW9uIGhhbHQoKSB7XG4gICAgdGhpcy5yZXNldCh0aGlzLmdldCgpKTtcbn07XG5Ud2VlblRyYW5zaXRpb24ucmVnaXN0ZXJDdXJ2ZSgnbGluZWFyJywgVHdlZW5UcmFuc2l0aW9uLkN1cnZlcy5saW5lYXIpO1xuVHdlZW5UcmFuc2l0aW9uLnJlZ2lzdGVyQ3VydmUoJ2Vhc2VJbicsIFR3ZWVuVHJhbnNpdGlvbi5DdXJ2ZXMuZWFzZUluKTtcblR3ZWVuVHJhbnNpdGlvbi5yZWdpc3RlckN1cnZlKCdlYXNlT3V0JywgVHdlZW5UcmFuc2l0aW9uLkN1cnZlcy5lYXNlT3V0KTtcblR3ZWVuVHJhbnNpdGlvbi5yZWdpc3RlckN1cnZlKCdlYXNlSW5PdXQnLCBUd2VlblRyYW5zaXRpb24uQ3VydmVzLmVhc2VJbk91dCk7XG5Ud2VlblRyYW5zaXRpb24ucmVnaXN0ZXJDdXJ2ZSgnZWFzZU91dEJvdW5jZScsIFR3ZWVuVHJhbnNpdGlvbi5DdXJ2ZXMuZWFzZU91dEJvdW5jZSk7XG5Ud2VlblRyYW5zaXRpb24ucmVnaXN0ZXJDdXJ2ZSgnc3ByaW5nJywgVHdlZW5UcmFuc2l0aW9uLkN1cnZlcy5zcHJpbmcpO1xuVHdlZW5UcmFuc2l0aW9uLmN1c3RvbUN1cnZlID0gZnVuY3Rpb24gY3VzdG9tQ3VydmUodjEsIHYyKSB7XG4gICAgdjEgPSB2MSB8fCAwO1xuICAgIHYyID0gdjIgfHwgMDtcbiAgICByZXR1cm4gZnVuY3Rpb24gKHQpIHtcbiAgICAgICAgcmV0dXJuIHYxICogdCArICgtMiAqIHYxIC0gdjIgKyAzKSAqIHQgKiB0ICsgKHYxICsgdjIgLSAyKSAqIHQgKiB0ICogdDtcbiAgICB9O1xufTtcbm1vZHVsZS5leHBvcnRzID0gVHdlZW5UcmFuc2l0aW9uOyIsInZhciBVdGlsaXR5ID0ge307XG5VdGlsaXR5LkRpcmVjdGlvbiA9IHtcbiAgICBYOiAwLFxuICAgIFk6IDEsXG4gICAgWjogMlxufTtcblV0aWxpdHkuYWZ0ZXIgPSBmdW5jdGlvbiBhZnRlcihjb3VudCwgY2FsbGJhY2spIHtcbiAgICB2YXIgY291bnRlciA9IGNvdW50O1xuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGNvdW50ZXItLTtcbiAgICAgICAgaWYgKGNvdW50ZXIgPT09IDApXG4gICAgICAgICAgICBjYWxsYmFjay5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH07XG59O1xuVXRpbGl0eS5sb2FkVVJMID0gZnVuY3Rpb24gbG9hZFVSTCh1cmwsIGNhbGxiYWNrKSB7XG4gICAgdmFyIHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgIHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiBvbnJlYWR5c3RhdGVjaGFuZ2UoKSB7XG4gICAgICAgIGlmICh0aGlzLnJlYWR5U3RhdGUgPT09IDQpIHtcbiAgICAgICAgICAgIGlmIChjYWxsYmFjaylcbiAgICAgICAgICAgICAgICBjYWxsYmFjayh0aGlzLnJlc3BvbnNlVGV4dCk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIHhoci5vcGVuKCdHRVQnLCB1cmwpO1xuICAgIHhoci5zZW5kKCk7XG59O1xuVXRpbGl0eS5jcmVhdGVEb2N1bWVudEZyYWdtZW50RnJvbUhUTUwgPSBmdW5jdGlvbiBjcmVhdGVEb2N1bWVudEZyYWdtZW50RnJvbUhUTUwoaHRtbCkge1xuICAgIHZhciBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgZWxlbWVudC5pbm5lckhUTUwgPSBodG1sO1xuICAgIHZhciByZXN1bHQgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XG4gICAgd2hpbGUgKGVsZW1lbnQuaGFzQ2hpbGROb2RlcygpKVxuICAgICAgICByZXN1bHQuYXBwZW5kQ2hpbGQoZWxlbWVudC5maXJzdENoaWxkKTtcbiAgICByZXR1cm4gcmVzdWx0O1xufTtcblV0aWxpdHkuY2xvbmUgPSBmdW5jdGlvbiBjbG9uZShiKSB7XG4gICAgdmFyIGE7XG4gICAgaWYgKHR5cGVvZiBiID09PSAnb2JqZWN0Jykge1xuICAgICAgICBhID0gYiBpbnN0YW5jZW9mIEFycmF5ID8gW10gOiB7fTtcbiAgICAgICAgZm9yICh2YXIga2V5IGluIGIpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgYltrZXldID09PSAnb2JqZWN0JyAmJiBiW2tleV0gIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBpZiAoYltrZXldIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgICAgICAgICAgICAgICAgYVtrZXldID0gbmV3IEFycmF5KGJba2V5XS5sZW5ndGgpO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGJba2V5XS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgYVtrZXldW2ldID0gVXRpbGl0eS5jbG9uZShiW2tleV1baV0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgYVtrZXldID0gVXRpbGl0eS5jbG9uZShiW2tleV0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgYVtrZXldID0gYltrZXldO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgYSA9IGI7XG4gICAgfVxuICAgIHJldHVybiBhO1xufTtcbm1vZHVsZS5leHBvcnRzID0gVXRpbGl0eTsiLCJ2YXIgTW9kaWZpZXIgICAgICAgPSByZXF1aXJlKCdmYW1vdXMvc3JjL2NvcmUvTW9kaWZpZXInKTtcbnZhciBGYW1vdXNFbmdpbmUgPSByZXF1aXJlKCdmYW1vdXMvc3JjL2NvcmUvRW5naW5lJyk7IFxudmFyIFV0aWxzID0gcmVxdWlyZSgnLi9VdGlscycpOyBcbnZhciBGTSA9IHJlcXVpcmUoJy4vT2xkTWF0cml4Jyk7ICAgIFxudmFyIFZlY3RvciA9IHJlcXVpcmUoJ2ZhbW91cy9zcmMvbWF0aC9WZWN0b3InKTtcbnZhciBRdWF0ID0gcmVxdWlyZSgnLi9PbGRRdWF0ZXJuaW9uJyk7XG5cbmZ1bmN0aW9uIEVhc3lDYW1lcmEoKVxue1xuICAgIHRoaXMucmVuZGVyTWF0cml4ID0gRk0uaWRlbnRpdHk7IFxuXG4gICAgdGhpcy5kb3VibGVDbGlja1RvUmVzZXQgPSB0cnVlOyBcbiAgICB0aGlzLnRvdWNoVGltZSA9IChuZXcgRGF0ZSgpKS5nZXRUaW1lKCk7XG4gICAgdGhpcy5jbGlja1RpbWUgPSAobmV3IERhdGUoKSkuZ2V0VGltZSgpO1xuICAgIHRoaXMuZGVsdGFUaW1lID0gMjAwOyAgICAgICAgIFxuXG4gICAgdGhpcy52aWV3V2lkdGggPSBVdGlscy5nZXRXaWR0aCgpOyBcbiAgICB0aGlzLnZpZXdIZWlnaHQgPSBVdGlscy5nZXRIZWlnaHQoKTsgXG4gICAgdGhpcy5yYWRpdXMgPSBNYXRoLm1heCh0aGlzLnZpZXdXaWR0aCwgdGhpcy52aWV3SGVpZ2h0KSowLjU7IFxuXG4gICAgdGhpcy5jZW50ZXIgPSBuZXcgVmVjdG9yKHRoaXMudmlld1dpZHRoKi41LCB0aGlzLnZpZXdIZWlnaHQqLjUsIDAuMCk7IFxuXG4gICAgdGhpcy5heGlzID0gbmV3IFZlY3RvcigwLjAsIDEuMCwgMC4wKTsgXG4gICAgdGhpcy50aGV0YSA9IDAuMDsgICAgICAgXG4gICAgXG4gICAgdGhpcy5mbGlwWCA9IDEuMDsgXG4gICAgdGhpcy5mbGlwWSA9IDEuMDsgXG4gICAgdGhpcy5mbGlwWiA9IDEuMDsgXG5cbiAgICB0aGlzLnQxID0gbmV3IFZlY3RvcigpOyBcbiAgICB0aGlzLnQyID0gbmV3IFZlY3RvcigpOyBcblxuICAgIHRoaXMucHQxID0gbmV3IFZlY3RvcigpOyBcbiAgICB0aGlzLnB0MiA9IG5ldyBWZWN0b3IoKTtcblxuICAgIHRoaXMuZGFtcGluZyA9IC45NTsgXG5cbiAgICB0aGlzLnpBY2MgPSAwLjA7IFxuICAgIHRoaXMuelZlbCA9IDAuMDsgXG4gICAgXG4gICAgdGhpcy5kdCA9IDAuMDtcbiAgICB0aGlzLnBkdCA9IDAuMDsgLy9QcmV2aW91cyBkaXN0YW5jZSBCZXR3ZWVuIFR3byBUb3VjaGVzIFxuXG4gICAgdGhpcy5kaXN0YW5jZSA9IC0xMDAuMDsgXG4gICAgdGhpcy5wb3NpdGlvbiA9IG5ldyBWZWN0b3IoMCwgMCwgdGhpcy5kaXN0YW5jZSk7IFxuICAgIHRoaXMucm90YXRpb24gPSBuZXcgVmVjdG9yKDAsIDAsIDApOyBcbiAgICB0aGlzLmVfbXR4ID0gRk0uaWRlbnRpdHk7ICBcbiAgICB0aGlzLnFfcm90ID0gbmV3IFF1YXQoKTtcbiAgICB0aGlzLnFfbXR4ID0gRk0uaWRlbnRpdHk7ICBcbiAgICB0aGlzLnF1YXQgPSBuZXcgUXVhdCgpOyBcbiAgICB0aGlzLmRfbXR4ID0gRk0uaWRlbnRpdHk7IFxuXG4gICAgdGhpcy5zZW5zaXRpdml0eVJvdGF0aW9uID0gMC41OyBcbiAgICB0aGlzLnNlbnNpdGl2aXR5Wm9vbSA9IDMuMDsgXG5cbiAgICB0aGlzLnRvdWNoRG93biA9IGZhbHNlOyBcbiAgICB0aGlzLm1vdXNlRG93biA9IGZhbHNlOyBcblxuICAgIEZhbW91c0VuZ2luZS5vbigncHJlcmVuZGVyJywgdGhpcy5fdXBkYXRlLmJpbmQodGhpcykpOyAgICAgICAgIFxuICAgIEZhbW91c0VuZ2luZS5vbigndG91Y2hzdGFydCcsIHRoaXMudG91Y2hzdGFydC5iaW5kKHRoaXMpKTsgICAgICAgICAgICAgICAgIFxuICAgIEZhbW91c0VuZ2luZS5vbigndG91Y2htb3ZlJywgdGhpcy50b3VjaG1vdmUuYmluZCh0aGlzKSk7ICAgICAgICAgICAgICAgICBcbiAgICBGYW1vdXNFbmdpbmUub24oJ3RvdWNoZW5kJywgdGhpcy50b3VjaGVuZC5iaW5kKHRoaXMpKTsgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgRmFtb3VzRW5naW5lLm9uKCdyZXNpemUnLCB0aGlzLnJlc2l6ZS5iaW5kKHRoaXMpKTsgICAgICAgICAgICAgICAgIFxuICAgIFxuICAgIEZhbW91c0VuZ2luZS5vbignbW91c2Vkb3duJywgdGhpcy5tb3VzZWRvd24uYmluZCh0aGlzKSk7ICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgIEZhbW91c0VuZ2luZS5vbignbW91c2Vtb3ZlJywgdGhpcy5tb3VzZW1vdmUuYmluZCh0aGlzKSk7ICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgIEZhbW91c0VuZ2luZS5vbignbW91c2V1cCcsIHRoaXMubW91c2V1cC5iaW5kKHRoaXMpKTsgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXdoZWVsJywgdGhpcy5tb3VzZXdoZWVsLmJpbmQodGhpcykpOyAgICAgXG4gICAgdGhpcy51cGRhdGVNYXRyaXgoKTsgXG5cbiAgICB0aGlzLm1vZCA9IG5ldyBNb2RpZmllcih7XG4gICAgICAgIG9yaWdpbjogWzAuNSwgMC41XSxcbiAgICAgICAgYWxpZ246IFswLjUsIDAuNV0sXG4gICAgICAgIHRyYW5zZm9ybSA6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucmVuZGVyTWF0cml4O1xuICAgICAgICB9LmJpbmQodGhpcylcbiAgICB9KTtcbn1cblxuRWFzeUNhbWVyYS5wcm90b3R5cGUuX3VwZGF0ZSA9IGZ1bmN0aW9uKGV2ZW50KVxue1xuICAgIHRoaXMudXBkYXRlKCk7IFxuICAgIGlmKCF0aGlzLm1vdXNlRG93biAmJiAhdGhpcy50b3VjaERvd24gJiYgdGhpcy50aGV0YSA+IDAuMDAwMSlcbiAgICB7ICAgICAgICAgICAgICAgIFxuICAgICAgICB0aGlzLnF1YXQubWFrZUZyb21BbmdsZUFuZEF4aXModGhpcy50aGV0YSAqIHRoaXMuc2Vuc2l0aXZpdHlSb3RhdGlvbiwgdGhpcy5heGlzKTsgICAgICAgICAgICAgXG4gICAgICAgIHRoaXMucV9yb3QgPSB0aGlzLnFfcm90Lm11bHRpcGx5KHRoaXMucXVhdCk7ICAgICAgIFxuICAgICAgICB0aGlzLnFfbXR4ID0gdGhpcy5xX3JvdC5nZXRNYXRyaXgoKTsgXG4gICAgICAgIHRoaXMudXBkYXRlTWF0cml4KCk7XG4gICAgICAgIHRoaXMudGhldGEqPXRoaXMuZGFtcGluZzsgXG4gICAgfSAgICAgICAgICAgIFxufTsgXG5cbkVhc3lDYW1lcmEucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKGV2ZW50KVxue1xuICAgIFxufTsgXG5cbkVhc3lDYW1lcmEucHJvdG90eXBlLnNldEZsaXBYID0gZnVuY3Rpb24odilcbntcbiAgICBpZih2KVxuICAgIHtcbiAgICAgICAgdGhpcy5mbGlwWCA9IC0xLjA7IFxuICAgIH1cbiAgICBlbHNlXG4gICAge1xuICAgICAgICB0aGlzLmZsaXBYID0gMS4wOyBcbiAgICB9XG59O1xuXG5FYXN5Q2FtZXJhLnByb3RvdHlwZS5zZXRGbGlwWSA9IGZ1bmN0aW9uKHYpXG57XG4gICAgaWYodilcbiAgICB7XG4gICAgICAgIHRoaXMuZmxpcFkgPSAtMS4wOyBcbiAgICB9XG4gICAgZWxzZVxuICAgIHtcbiAgICAgICAgdGhpcy5mbGlwWSA9IDEuMDsgXG4gICAgfVxufTtcblxuRWFzeUNhbWVyYS5wcm90b3R5cGUuc2V0RmxpcFogPSBmdW5jdGlvbih2KVxue1xuICAgIGlmKHYpXG4gICAge1xuICAgICAgICB0aGlzLmZsaXBaID0gLTEuMDsgXG4gICAgfVxuICAgIGVsc2VcbiAgICB7XG4gICAgICAgIHRoaXMuZmxpcFogPSAxLjA7IFxuICAgIH1cbn07XG5cbkVhc3lDYW1lcmEucHJvdG90eXBlLnNldFNlbnNpdGl2aXR5Wm9vbSA9IGZ1bmN0aW9uKHopXG57XG4gICAgdGhpcy5zZW5zaXRpdml0eVpvb20gPSB6OyBcbn07XG5cbkVhc3lDYW1lcmEucHJvdG90eXBlLnNldFNlbnNpdGl2aXR5Um90YXRpb24gPSBmdW5jdGlvbihyKVxue1xuICAgIHRoaXMuc2Vuc2l0aXZpdHlSb3RhdGlvbiA9IHI7IFxufTtcblxuRWFzeUNhbWVyYS5wcm90b3R5cGUuc2V0RGlzdGFuY2UgPSBmdW5jdGlvbihkKVxue1xuICAgIHRoaXMuZGlzdGFuY2UgPSBkOyBcbiAgICB0aGlzLnBvc2l0aW9uLnogPSB0aGlzLmRpc3RhbmNlOyAgICAgICAgIFxuICAgIHRoaXMuc2V0UG9zaXRpb24odGhpcy5wb3NpdGlvbik7ICAgIFxufTtcblxuRWFzeUNhbWVyYS5wcm90b3R5cGUuc2V0UG9zaXRpb24gPSBmdW5jdGlvbihwKVxue1xuICAgIHRoaXMucG9zaXRpb24uc2V0KHApOyBcbiAgICB0aGlzLnVwZGF0ZU1hdHJpeCgpOyAgICAgICAgIFxufTtcblxuRWFzeUNhbWVyYS5wcm90b3R5cGUuYXBwbHlRdWF0ZXJuaW9uUm90YXRpb24gPSBmdW5jdGlvbihxKVxue1xuICAgIHRoaXMucV9yb3QgPSB0aGlzLnFfcm90Lm11bHRpcGx5KHEpOyAgICAgICBcbiAgICB0aGlzLnFfbXR4ID0gdGhpcy5xX3JvdC5nZXRNYXRyaXgoKTsgXG4gICAgdGhpcy51cGRhdGVNYXRyaXgoKTsgICAgICAgIFxufTtcblxuRWFzeUNhbWVyYS5wcm90b3R5cGUuYXBwbHlFdWxlclJvdGF0aW9uID0gZnVuY3Rpb24ocGhpLCB0aGV0YSwgcHNpKVxue1xuICAgIHRoaXMucm90YXRpb24uc2V0WFlaKHBoaSwgdGhldGEsIHBzaSk7IFxuICAgIHRoaXMuZV9tdHggPSBGTS5yb3RhdGUocGhpLCB0aGV0YSwgcHNpKTtcbiAgICB0aGlzLnVwZGF0ZU1hdHJpeCgpOyBcbn07XG5cbkVhc3lDYW1lcmEucHJvdG90eXBlLnVwZGF0ZU1hdHJpeCA9IGZ1bmN0aW9uKClcbntcblxuICAgIHZhciBhcnIgPSBbdGhpcy5wb3NpdGlvbi54LCB0aGlzLnBvc2l0aW9uLnksIHRoaXMucG9zaXRpb24uel07XG4gICAgdmFyIGExID0gRk0ubXVsdGlwbHkodGhpcy5xX210eCwgdGhpcy5lX210eClcbiAgICB0aGlzLnJlbmRlck1hdHJpeCA9IEZNLm1vdmUoYTEsIGFycik7XG59O1xuXG5FYXN5Q2FtZXJhLnByb3RvdHlwZS5nZXRSb3RhdGlvbk1hdHJpeCA9IGZ1bmN0aW9uKClcbntcbiAgICByZXR1cm4gdGhpcy5xX210eDsgXG59OyBcblxuRWFzeUNhbWVyYS5wcm90b3R5cGUuZ2V0TWF0cml4ID0gZnVuY3Rpb24oKVxue1xuICAgIHJldHVybiB0aGlzLnJlbmRlck1hdHJpeDsgXG59OyBcblxuRWFzeUNhbWVyYS5wcm90b3R5cGUucmVzZXQgPSBmdW5jdGlvbigpXG57ICAgICAgICBcbiAgICB0aGlzLnRoZXRhID0gMC4wOyBcbiAgICB0aGlzLnFfcm90LmNsZWFyKCk7ICAgICAgICAgICAgXG4gICAgdGhpcy5xX210eCA9IHRoaXMuZF9tdHg7IFxuICAgIHRoaXMucG9zaXRpb24uY2xlYXIoKTtcbiAgICB0aGlzLnBvc2l0aW9uLnNldFhZWigwLjAsIDAuMCwgdGhpcy5kaXN0YW5jZSk7ICAgICAgICAgIFxuICAgIHRoaXMudXBkYXRlTWF0cml4KCk7XG59O1xuXG5FYXN5Q2FtZXJhLnByb3RvdHlwZS5zZXREZWZhdWx0TWF0cml4ID0gZnVuY3Rpb24obXR4KVxue1xuICAgIHRoaXMuZF9tdHggPSBtdHg7IFxufTsgXG5cbkVhc3lDYW1lcmEucHJvdG90eXBlLmNsaWNrQ2hlY2tGb3JDYW1lcmFSZXN0YXJ0ID0gZnVuY3Rpb24oKVxueyAgICBcbiAgICB2YXIgbmV3VGltZSA9IChuZXcgRGF0ZSgpKS5nZXRUaW1lKCk7ICAgICAgICAgICAgIFxuICAgIGlmKG5ld1RpbWUgLSB0aGlzLmNsaWNrVGltZSA8IHRoaXMuZGVsdGFUaW1lICYmIHRoaXMuZG91YmxlQ2xpY2tUb1Jlc2V0KVxuICAgIHsgICAgICAgICAgICAgICBcbiAgICAgICAgdGhpcy5yZXNldCgpOyBcbiAgICB9XG5cbiAgICB0aGlzLmNsaWNrVGltZSA9IG5ld1RpbWU7IFxufTtcblxuRWFzeUNhbWVyYS5wcm90b3R5cGUudG91Y2hDaGVja0ZvckNhbWVyYVJlc3RhcnQgPSBmdW5jdGlvbigpXG57XG4gICAgdmFyIG5ld1RpbWUgPSAobmV3IERhdGUoKSkuZ2V0VGltZSgpOyAgICAgICAgICAgICBcbiAgICBpZihuZXdUaW1lIC0gdGhpcy50b3VjaFRpbWUgPCB0aGlzLmRlbHRhVGltZSAmJiB0aGlzLmRvdWJsZUNsaWNrVG9SZXNldClcbiAgICB7ICAgICAgICAgICAgICAgXG4gICAgICAgIHRoaXMucmVzZXQoKTsgXG4gICAgfVxuXG4gICAgdGhpcy50b3VjaFRpbWUgPSBuZXdUaW1lOyBcbn07XG5cbkVhc3lDYW1lcmEucHJvdG90eXBlLnRvdWNoc3RhcnQgPSBmdW5jdGlvbihldmVudCkgXG57XG4gICAgaWYoZXZlbnQudG91Y2hlcy5sZW5ndGggPT0gMSlcbiAgICB7XG4gICAgICAgIHRoaXMudG91Y2hEb3duID0gdHJ1ZTsgXG4gICAgICAgIHRoaXMudG91Y2hDaGVja0ZvckNhbWVyYVJlc3RhcnQoKTsgICAgICAgICBcbiAgICAgICAgdGhpcy50aGV0YSA9IDAuMDsgXG4gICAgICAgIHRoaXMudDEuY2xlYXIoKTsgXG4gICAgICAgIHRoaXMucHQxLmNsZWFyKCk7IFxuICAgICAgICB0aGlzLnF1YXQuY2xlYXIoKTsgXG4gICAgICAgIHRoaXMuc2V0QXJjQmFsbFZlY3RvcihldmVudC50b3VjaGVzWzBdLmNsaWVudFgsIGV2ZW50LnRvdWNoZXNbMF0uY2xpZW50WSk7ICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgIH1cbiAgICBlbHNlIGlmKGV2ZW50LnRvdWNoZXMubGVuZ3RoID09IDIpICAgICAgICAgICAgXG4gICAge1xuICAgICAgICB0aGlzLnQxLnNldFhZWihldmVudC50b3VjaGVzWzBdLmNsaWVudFgsIGV2ZW50LnRvdWNoZXNbMF0uY2xpZW50WSwgMC4wKTtcbiAgICAgICAgdGhpcy50Mi5zZXRYWVooZXZlbnQudG91Y2hlc1sxXS5jbGllbnRYLCBldmVudC50b3VjaGVzWzFdLmNsaWVudFksIDAuMCk7IFxuICAgICAgICBcbiAgICAgICAgdGhpcy5wdDEuc2V0KHRoaXMudDEpOyBcbiAgICAgICAgdGhpcy5wdDIuc2V0KHRoaXMudDIpOyBcbiAgICAgICAgXG4gICAgICAgIHRoaXMuZHQgPSBVdGlscy5kaXN0YW5jZSh0aGlzLnQxLngsIHRoaXMudDEueSwgdGhpcy50Mi54LCB0aGlzLnQyLnkpOyBcbiAgICAgICAgdGhpcy5wZHQgPSB0aGlzLmR0OyBcbiAgICB9ICAgICAgICBcbn07XG5cbkVhc3lDYW1lcmEucHJvdG90eXBlLnRvdWNobW92ZSA9IGZ1bmN0aW9uKGV2ZW50KVxue1xuICAgIGlmKGV2ZW50LnRvdWNoZXMubGVuZ3RoID09IDEpXG4gICAge1xuICAgICAgICB0aGlzLnNldEFyY0JhbGxWZWN0b3IoZXZlbnQudG91Y2hlc1swXS5jbGllbnRYLCBldmVudC50b3VjaGVzWzBdLmNsaWVudFkpOyBcbiAgICAgICAgdGhpcy51cGRhdGVBcmNCYWxsUm90YXRpb24oKTsgXG4gICAgfVxuICAgIGVsc2UgaWYoZXZlbnQudG91Y2hlcy5sZW5ndGggPT0gMikgICAgICAgICAgICBcbiAgICB7XG4gICAgICAgIHRoaXMudDEuc2V0WFlaKGV2ZW50LnRvdWNoZXNbMF0uY2xpZW50WCwgZXZlbnQudG91Y2hlc1swXS5jbGllbnRZLCAwLjApOyBcbiAgICAgICAgdGhpcy50Mi5zZXRYWVooZXZlbnQudG91Y2hlc1sxXS5jbGllbnRYLCBldmVudC50b3VjaGVzWzFdLmNsaWVudFksIDAuMCk7IFxuXG4gICAgICAgIHRoaXMuZHQgPSBVdGlscy5kaXN0YW5jZSh0aGlzLnQxLngsIHRoaXMudDEueSwgdGhpcy50Mi54LCB0aGlzLnQyLnkpOyAgICAgICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIHRoaXMucG9zaXRpb24ueiArPSB0aGlzLmZsaXBaKih0aGlzLmR0LXRoaXMucGR0KS90aGlzLnNlbnNpdGl2aXR5Wm9vbTsgICAgICAgICBcbiAgICAgICAgdGhpcy51cGRhdGVNYXRyaXgoKTtcblxuICAgICAgICB0aGlzLnB0MS5zZXQodGhpcy50MSk7IFxuICAgICAgICB0aGlzLnB0Mi5zZXQodGhpcy50Mik7ICAgICAgICAgIFxuXG4gICAgICAgIHRoaXMucGR0ID0gdGhpcy5kdDsgXG4gICAgfVxufTtcblxuRWFzeUNhbWVyYS5wcm90b3R5cGUudG91Y2hlbmQgPSBmdW5jdGlvbihldmVudClcbntcbiAgICBpZihldmVudC50b3VjaGVzLmxlbmd0aCA9PSAxKVxuICAgIHsgICAgICAgICAgICBcbiAgICAgICAgdGhpcy50MS5jbGVhcigpOyBcbiAgICAgICAgdGhpcy5wdDEuY2xlYXIoKTsgXG4gICAgICAgIHRoaXMucXVhdC5jbGVhcigpOyBcbiAgICB9XG4gICAgZWxzZSBpZihldmVudC50b3VjaGVzLmxlbmd0aCA9PSAyKSAgICAgICAgICAgIFxuICAgIHtcbiAgICAgICAgdGhpcy50MS5jbGVhcigpOyBcbiAgICAgICAgdGhpcy5wdDEuY2xlYXIoKTsgXG4gICAgICAgIFxuICAgICAgICB0aGlzLnQyLmNsZWFyKCk7IFxuICAgICAgICB0aGlzLnB0Mi5jbGVhcigpOyBcbiAgICAgICAgXG4gICAgICAgIHRoaXMuZHQgPSAwLjA7IFxuICAgICAgICB0aGlzLnBkdCA9IDAuMDsgXG4gICAgfVxufTtcblxuRWFzeUNhbWVyYS5wcm90b3R5cGUuc2V0QXJjQmFsbFZlY3RvciA9IGZ1bmN0aW9uKHgsIHkpXG57ICAgICAgICAgICAgICAgIFxuICAgIHRoaXMucHQxLnNldCh0aGlzLnQxKTsgXG4gICAgdGhpcy50MS5jbGVhcigpOyBcbiAgICBcbiAgICB0aGlzLnQxLnggPSB0aGlzLmZsaXBYICogLTEuMCAqICh4IC0gdGhpcy5jZW50ZXIueCkgLyB0aGlzLnJhZGl1czsgXG4gICAgdGhpcy50MS55ID0gdGhpcy5mbGlwWSAqIC0xLjAgKiAoeSAtIHRoaXMuY2VudGVyLnkpIC8gdGhpcy5yYWRpdXM7ICAgICAgICAgICAgICAgICBcblxuICAgIHZhciByID0gdGhpcy50MS5ub3JtKCk7IFxuICAgIGlmKHIgPiAxLjApXG4gICAge1xuICAgICAgICB0aGlzLnQxLm5vcm1hbGl6ZSgxLjAsIHRoaXMudDEpOyAgICAgICAgICBcbiAgICB9XG4gICAgZWxzZVxuICAgIHtcbiAgICAgICAgdGhpcy50MS56ID0gTWF0aC5zcXJ0KDEuMCAtIHIpOyBcbiAgICB9ICAgICAgICAgICAgICAgIFxufTtcblxuRWFzeUNhbWVyYS5wcm90b3R5cGUudXBkYXRlQXJjQmFsbFJvdGF0aW9uID0gZnVuY3Rpb24oKVxueyAgICAgICAgXG4gICAgdGhpcy50aGV0YSA9IE1hdGguYWNvcyh0aGlzLnQxLmRvdCh0aGlzLnB0MSkpOyBcbiAgICB0aGlzLmF4aXMgPSB0aGlzLnB0MS5jcm9zcyh0aGlzLnQxLCB0aGlzLmF4aXMpOyAgIFxuICAgIHRoaXMucXVhdC5tYWtlRnJvbUFuZ2xlQW5kQXhpcyh0aGlzLnRoZXRhICogdGhpcy5zZW5zaXRpdml0eVJvdGF0aW9uLCB0aGlzLmF4aXMpOyAgICAgICAgICAgICBcbiAgICB0aGlzLnFfcm90ID0gdGhpcy5xX3JvdC5tdWx0aXBseSh0aGlzLnF1YXQpOyAgICAgICBcbiAgICB0aGlzLnFfbXR4ID0gdGhpcy5xX3JvdC5nZXRNYXRyaXgoKTsgXG4gICAgdGhpcy51cGRhdGVNYXRyaXgoKTtcbn1cblxuRWFzeUNhbWVyYS5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uKHR5cGUsIGV2ZW50KVxue1xuICAgIGlmKHR5cGUgPT0gJ3ByZXJlbmRlcicpICAgIHRoaXMudXBkYXRlKGV2ZW50KTsgICAgXG4gICAgZWxzZSBpZih0eXBlID09ICd0b3VjaHN0YXJ0JykgICAgICAgIHRoaXMudG91Y2hzdGFydChldmVudCk7XG4gICAgZWxzZSBpZih0eXBlID09ICd0b3VjaG1vdmUnKSAgICB0aGlzLnRvdWNobW92ZShldmVudCk7XG4gICAgZWxzZSBpZih0eXBlID09ICd0b3VjaGVuZCcpICAgICB0aGlzLnRvdWNoZW5kKGV2ZW50KTtcbiAgICBlbHNlIGlmKHR5cGUgPT0gJ3Jlc2l6ZScpICAgICAgIHRoaXMucmVzaXplKGV2ZW50KTsgICAgICAgICAgICBcbn07XG5cbkVhc3lDYW1lcmEucHJvdG90eXBlLm1vdXNlbW92ZSA9IGZ1bmN0aW9uKGV2ZW50KVxueyAgXG4gICAgaWYodGhpcy5tb3VzZURvd24pIFxuICAgIHtcbiAgICAgICAgdGhpcy5zZXRBcmNCYWxsVmVjdG9yKGV2ZW50LmNsaWVudFgsIGV2ZW50LmNsaWVudFkpOyAgICAgICAgICAgICBcbiAgICAgICAgdGhpcy51cGRhdGVBcmNCYWxsUm90YXRpb24oKTsgICAgICAgICAgICAgXG4gICAgfVxufTtcblxuRWFzeUNhbWVyYS5wcm90b3R5cGUubW91c2Vkb3duID0gZnVuY3Rpb24oZXZlbnQpXG57ICAgICAgICAgICAgXG4gICAgdGhpcy5tb3VzZURvd24gPSB0cnVlOyAgICAgICAgICAgICAgICAgXG4gICAgdGhpcy5jbGlja0NoZWNrRm9yQ2FtZXJhUmVzdGFydCgpOyAgICAgICAgIFxuICAgIHRoaXMudGhldGEgPSAwLjA7IFxuICAgIHRoaXMudDEuY2xlYXIoKTsgXG4gICAgdGhpcy5wdDEuY2xlYXIoKTsgXG4gICAgdGhpcy5xdWF0LmNsZWFyKCk7ICAgICAgICAgICAgXG4gICAgdGhpcy5zZXRBcmNCYWxsVmVjdG9yKGV2ZW50LmNsaWVudFgsIGV2ZW50LmNsaWVudFkpOyAgICAgICAgICAgICAgXG59XG5cbkVhc3lDYW1lcmEucHJvdG90eXBlLm1vdXNldXAgPSBmdW5jdGlvbihldmVudClcbnsgICAgICBcbiAgICB0aGlzLm1vdXNlRG93biA9IGZhbHNlOyBcbn07IFxuXG5FYXN5Q2FtZXJhLnByb3RvdHlwZS5tb3VzZXdoZWVsID0gZnVuY3Rpb24oZXZlbnQpXG57ICAgICAgICAgICAgICAgIFxuXG4gICAgdGhpcy5wb3NpdGlvbi56ICs9IHRoaXMuZmxpcFoqVXRpbHMubGltaXQoZXZlbnQud2hlZWxEZWx0YSwgLTUwMCwgNTAwKSouMDEqdGhpcy5zZW5zaXRpdml0eVpvb207ICAgICAgICAgXG4gICAgdGhpcy51cGRhdGVNYXRyaXgoKTsgXG4gICAgLy8gdGhpcy56QWNjID0gVXRpbHMubGltaXQoZXZlbnQud2hlZWxEZWx0YSwtMTAsMTApOyBcbiAgICAvLyB0aGlzLnpWZWwgKz0gdGhpcy56QWNjOyBcbiAgICAvLyB0aGlzLnpWZWwgPSBVdGlscy5saW1pdCh0aGlzLnpWZWwsIC0yLCAyKTsgICAgICAgICBcbn07XG5cbkVhc3lDYW1lcmEucHJvdG90eXBlLnJlc2l6ZSA9IGZ1bmN0aW9uKGV2ZW50KSBcbnsgICAgICAgIFxuICAgIHRoaXMudmlld1dpZHRoID0gVXRpbHMuZ2V0V2lkdGgoKTsgXG4gICAgdGhpcy52aWV3SGVpZ2h0ID0gVXRpbHMuZ2V0SGVpZ2h0KCk7IFxuICAgIHRoaXMuY2VudGVyID0gbmV3IFZlY3Rvcih0aGlzLnZpZXdXaWR0aCouNSwgdGhpcy52aWV3SGVpZ2h0Ki41LCAwLjApOyBcbiAgICB0aGlzLnJhZGl1cyA9IE1hdGgubWluKHRoaXMudmlld1dpZHRoLCB0aGlzLnZpZXdIZWlnaHQpKjAuNTsgICAgICAgICBcbn07XG5cbkVhc3lDYW1lcmEucHJvdG90eXBlLnNldERhbXBpbmcgPSBmdW5jdGlvbihkKSBcbnsgICAgICAgIFxuICAgIHRoaXMuZGFtcGluZyA9IGQ7XG59O1xuXG5FYXN5Q2FtZXJhLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbihpbnB1dCkgXG57XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdHJhbnNmb3JtOiB0aGlzLnJlbmRlck1hdHJpeCxcbiAgICAgICAgb3JpZ2luOiBbLjUsIC41XSxcbiAgICAgICAgdGFyZ2V0OiBpbnB1dFxuXG4gICAgfTsgXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEVhc3lDYW1lcmE7XG5cbiIsIlxuLyoqXG4gKiBAbmFtZXNwYWNlIEZhbW91c01hdHJpeFxuICogXG4gKiBAZGVzY3JpcHRpb24gXG4gKiAgKiBBIGhpZ2gtcGVyZm9ybWFuY2UgbWF0cml4IG1hdGggbGlicmFyeSB1c2VkIHRvIGNhbGN1bGF0ZSBcbiAqICAgYWZmaW5lIHRyYW5zZm9ybXMgb24gc3VyZmFjZXMgYW5kIG90aGVyIHJlbmRlcmFibGVzLlxuICogICBGYW1vdXMgdXNlcyA0eDQgbWF0cmljZXMgY29ycmVzcG9uZGluZyBkaXJlY3RseSB0b1xuICogICBXZWJLaXQgbWF0cmljZXMgKHJvdy1tYWpvciBvcmRlcilcbiAqICAgIFxuICogICAgVGhlIGludGVybmFsIFwidHlwZVwiIG9mIGEgRmFtb3VzTWF0cml4IGlzIGEgMTYtbG9uZyBmbG9hdCBhcnJheSBpbiBcbiAqICAgIHJvdy1tYWpvciBvcmRlciwgd2l0aDpcbiAqICAgICAgKiBlbGVtZW50cyBbMF0sWzFdLFsyXSxbNF0sWzVdLFs2XSxbOF0sWzldLFsxMF0gZm9ybWluZyB0aGUgM3gzXG4gKiAgICAgICAgICB0cmFuc2Zvcm1hdGlvbiBtYXRyaXhcbiAqICAgICAgKiBlbGVtZW50cyBbMTJdLCBbMTNdLCBbMTRdIGNvcnJlc3BvbmRpbmcgdG8gdGhlIHRfeCwgdF95LCB0X3ogXG4gKiAgICAgICAgICBhZmZpbmUgdHJhbnNsYXRpb24uXG4gKiAgICAgICogZWxlbWVudCBbMTVdIGFsd2F5cyBzZXQgdG8gMS5cbiAqIFxuICogU2NvcGU6IElkZWFsbHksIG5vbmUgb2YgdGhlc2UgZnVuY3Rpb25zIHNob3VsZCBiZSB2aXNpYmxlIGJlbG93IHRoZSBcbiAqIGNvbXBvbmVudCBkZXZlbG9wZXIgbGV2ZWwuXG4gKlxuICogQHN0YXRpY1xuICogXG4gKiBAbmFtZSBGYW1vdXNNYXRyaXhcbiAqL1xudmFyIEZhbW91c01hdHJpeCA9IHt9O1xuXG4vLyBXQVJOSU5HOiB0aGVzZSBtYXRyaWNlcyBjb3JyZXNwb25kIHRvIFdlYktpdCBtYXRyaWNlcywgd2hpY2ggYXJlXG4vLyAgICB0cmFuc3Bvc2VkIGZyb20gdGhlaXIgbWF0aCBjb3VudGVycGFydHNcbkZhbW91c01hdHJpeC5wcmVjaXNpb24gPSAxZS02O1xuRmFtb3VzTWF0cml4LmlkZW50aXR5ID0gWzEsIDAsIDAsIDAsIDAsIDEsIDAsIDAsIDAsIDAsIDEsIDAsIDAsIDAsIDAsIDFdO1xuXG4vKipcbiAqIE11bHRpcGx5IHR3byBvciBtb3JlIEZhbW91c01hdHJpeCB0eXBlcyB0byByZXR1cm4gYSBGYW1vdXNNYXRyaXguXG4gKlxuICogQG5hbWUgRmFtb3VzTWF0cml4I211bHRpcGx5NHg0XG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSB7RmFtb3VzTWF0cml4fSBhIGxlZnQgbWF0cml4XG4gKiBAcGFyYW0ge0ZhbW91c01hdHJpeH0gYiByaWdodCBtYXRyaXhcbiAqIEByZXR1cm5zIHtGYW1vdXNNYXRyaXh9IHRoZSByZXN1bHRpbmcgbWF0cml4XG4gKi9cbkZhbW91c01hdHJpeC5tdWx0aXBseTR4NCA9IGZ1bmN0aW9uIG11bHRpcGx5NHg0KGEsIGIpIHtcbiAgICB2YXIgcmVzdWx0ID0gWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdO1xuICAgIHJlc3VsdFswXSA9IGFbMF0gKiBiWzBdICsgYVsxXSAqIGJbNF0gKyBhWzJdICogYls4XSArIGFbM10gKiBiWzEyXTtcbiAgICByZXN1bHRbMV0gPSBhWzBdICogYlsxXSArIGFbMV0gKiBiWzVdICsgYVsyXSAqIGJbOV0gKyBhWzNdICogYlsxM107XG4gICAgcmVzdWx0WzJdID0gYVswXSAqIGJbMl0gKyBhWzFdICogYls2XSArIGFbMl0gKiBiWzEwXSArIGFbM10gKiBiWzE0XTtcbiAgICByZXN1bHRbM10gPSBhWzBdICogYlszXSArIGFbMV0gKiBiWzddICsgYVsyXSAqIGJbMTFdICsgYVszXSAqIGJbMTVdO1xuICAgIHJlc3VsdFs0XSA9IGFbNF0gKiBiWzBdICsgYVs1XSAqIGJbNF0gKyBhWzZdICogYls4XSArIGFbN10gKiBiWzEyXTtcbiAgICByZXN1bHRbNV0gPSBhWzRdICogYlsxXSArIGFbNV0gKiBiWzVdICsgYVs2XSAqIGJbOV0gKyBhWzddICogYlsxM107XG4gICAgcmVzdWx0WzZdID0gYVs0XSAqIGJbMl0gKyBhWzVdICogYls2XSArIGFbNl0gKiBiWzEwXSArIGFbN10gKiBiWzE0XTtcbiAgICByZXN1bHRbN10gPSBhWzRdICogYlszXSArIGFbNV0gKiBiWzddICsgYVs2XSAqIGJbMTFdICsgYVs3XSAqIGJbMTVdO1xuICAgIHJlc3VsdFs4XSA9IGFbOF0gKiBiWzBdICsgYVs5XSAqIGJbNF0gKyBhWzEwXSAqIGJbOF0gKyBhWzExXSAqIGJbMTJdO1xuICAgIHJlc3VsdFs5XSA9IGFbOF0gKiBiWzFdICsgYVs5XSAqIGJbNV0gKyBhWzEwXSAqIGJbOV0gKyBhWzExXSAqIGJbMTNdO1xuICAgIHJlc3VsdFsxMF0gPSBhWzhdICogYlsyXSArIGFbOV0gKiBiWzZdICsgYVsxMF0gKiBiWzEwXSArIGFbMTFdICogYlsxNF07XG4gICAgcmVzdWx0WzExXSA9IGFbOF0gKiBiWzNdICsgYVs5XSAqIGJbN10gKyBhWzEwXSAqIGJbMTFdICsgYVsxMV0gKiBiWzE1XTtcbiAgICByZXN1bHRbMTJdID0gYVsxMl0gKiBiWzBdICsgYVsxM10gKiBiWzRdICsgYVsxNF0gKiBiWzhdICsgYVsxNV0gKiBiWzEyXTtcbiAgICByZXN1bHRbMTNdID0gYVsxMl0gKiBiWzFdICsgYVsxM10gKiBiWzVdICsgYVsxNF0gKiBiWzldICsgYVsxNV0gKiBiWzEzXTtcbiAgICByZXN1bHRbMTRdID0gYVsxMl0gKiBiWzJdICsgYVsxM10gKiBiWzZdICsgYVsxNF0gKiBiWzEwXSArIGFbMTVdICogYlsxNF07XG4gICAgcmVzdWx0WzE1XSA9IGFbMTJdICogYlszXSArIGFbMTNdICogYls3XSArIGFbMTRdICogYlsxMV0gKyBhWzE1XSAqIGJbMTVdO1xuICAgIGlmKGFyZ3VtZW50cy5sZW5ndGggPD0gMikgIHJldHVybiByZXN1bHQ7XG4gICAgZWxzZSByZXR1cm4gbXVsdGlwbHk0eDQuYXBwbHkobnVsbCwgW3Jlc3VsdF0uY29uY2F0KEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMikpKTtcbn07XG5cbi8qKlxuICogRmFzdC1tdWx0aXBseSB0d28gb3IgbW9yZSBGYW1vdXNNYXRyaXggdHlwZXMgdG8gcmV0dXJuIGFcbiAqICAgIEZhbW91c01hdHJpeCwgYXNzdW1pbmcgcmlnaHQgY29sdW1uIG9uIGVhY2ggaXMgWzAgMCAwIDFdXlQuXG4gKiAgICBcbiAqIEBuYW1lIEZhbW91c01hdHJpeCNtdWx0aXBseVxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0ge0ZhbW91c01hdHJpeH0gYSBsZWZ0IG1hdHJpeFxuICogQHBhcmFtIHtGYW1vdXNNYXRyaXh9IGIgcmlnaHQgbWF0cml4XG4gKiBAcGFyYW0gey4uLkZhbW91c01hdHJpeH0gYyBhZGRpdGlvbmFsIG1hdHJpY2VzIHRvIGJlIG11bHRpcGxpZWQgaW4gXG4gKiAgICBvcmRlclxuICogQHJldHVybnMge0ZhbW91c01hdHJpeH0gdGhlIHJlc3VsdGluZyBtYXRyaXhcbiAqLyBcbkZhbW91c01hdHJpeC5tdWx0aXBseSA9IGZ1bmN0aW9uIG11bHRpcGx5KGEsIGIsIGMpIHtcbiAgICBpZighYSB8fCAhYikgcmV0dXJuIGEgfHwgYjtcbiAgICB2YXIgcmVzdWx0ID0gWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDFdO1xuICAgIHJlc3VsdFswXSA9IGFbMF0gKiBiWzBdICsgYVsxXSAqIGJbNF0gKyBhWzJdICogYls4XTtcbiAgICByZXN1bHRbMV0gPSBhWzBdICogYlsxXSArIGFbMV0gKiBiWzVdICsgYVsyXSAqIGJbOV07XG4gICAgcmVzdWx0WzJdID0gYVswXSAqIGJbMl0gKyBhWzFdICogYls2XSArIGFbMl0gKiBiWzEwXTtcbiAgICByZXN1bHRbNF0gPSBhWzRdICogYlswXSArIGFbNV0gKiBiWzRdICsgYVs2XSAqIGJbOF07XG4gICAgcmVzdWx0WzVdID0gYVs0XSAqIGJbMV0gKyBhWzVdICogYls1XSArIGFbNl0gKiBiWzldO1xuICAgIHJlc3VsdFs2XSA9IGFbNF0gKiBiWzJdICsgYVs1XSAqIGJbNl0gKyBhWzZdICogYlsxMF07XG4gICAgcmVzdWx0WzhdID0gYVs4XSAqIGJbMF0gKyBhWzldICogYls0XSArIGFbMTBdICogYls4XTtcbiAgICByZXN1bHRbOV0gPSBhWzhdICogYlsxXSArIGFbOV0gKiBiWzVdICsgYVsxMF0gKiBiWzldO1xuICAgIHJlc3VsdFsxMF0gPSBhWzhdICogYlsyXSArIGFbOV0gKiBiWzZdICsgYVsxMF0gKiBiWzEwXTtcbiAgICByZXN1bHRbMTJdID0gYVsxMl0gKiBiWzBdICsgYVsxM10gKiBiWzRdICsgYVsxNF0gKiBiWzhdICsgYlsxMl07XG4gICAgcmVzdWx0WzEzXSA9IGFbMTJdICogYlsxXSArIGFbMTNdICogYls1XSArIGFbMTRdICogYls5XSArIGJbMTNdO1xuICAgIHJlc3VsdFsxNF0gPSBhWzEyXSAqIGJbMl0gKyBhWzEzXSAqIGJbNl0gKyBhWzE0XSAqIGJbMTBdICsgYlsxNF07XG4gICAgaWYoYXJndW1lbnRzLmxlbmd0aCA8PSAyKSAgcmV0dXJuIHJlc3VsdDtcbiAgICBlbHNlIHJldHVybiBtdWx0aXBseS5hcHBseShudWxsLCBbcmVzdWx0XS5jb25jYXQoQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAyKSkpO1xufTtcblxuLyoqXG4gKiBSZXR1cm4gYSBGYW1vdXNNYXRyaXggdHJhbnNsYXRlZCBieSBhZGRpdGlvbmFsIGFtb3VudHMgaW4gZWFjaFxuICogICAgZGltZW5zaW9uLlxuICogICAgXG4gKiBAbmFtZSBGYW1vdXNNYXRyaXgjbW92ZVxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0ge0ZhbW91c01hdHJpeH0gbSBhIG1hdHJpeFxuICogQHBhcmFtIHtBcnJheS48bnVtYmVyPn0gdCBkZWx0YSB2ZWN0b3IgKGFycmF5IG9mIGZsb2F0cyAmJiBcbiAqICAgIGFycmF5Lmxlbmd0aCA9PSAyIHx8IDMpXG4gKiBAcmV0dXJucyB7RmFtb3VzTWF0cml4fSB0aGUgcmVzdWx0aW5nIHRyYW5zbGF0ZWQgbWF0cml4XG4gKi8gXG5GYW1vdXNNYXRyaXgubW92ZSA9IGZ1bmN0aW9uKG0sIHQpIHtcbiAgICBpZighdFsyXSkgdFsyXSA9IDA7XG4gICAgcmV0dXJuIFttWzBdLCBtWzFdLCBtWzJdLCAwLCBtWzRdLCBtWzVdLCBtWzZdLCAwLCBtWzhdLCBtWzldLCBtWzEwXSwgMCwgbVsxMl0gKyB0WzBdLCBtWzEzXSArIHRbMV0sIG1bMTRdICsgdFsyXSwgMV07XG59O1xuXG4vKipcbiAqIFJldHVybiBhIEZhbW91c01hdHJpeCB3aGljaCByZXByZXNlbnRzIHRoZSByZXN1bHQgb2YgYSB0cmFuc2Zvcm0gbWF0cml4XG4gKiBhcHBsaWVkIGFmdGVyIGEgbW92ZS4gVGhpcyBpcyBmYXN0ZXIgdGhhbiB0aGUgZXF1aXZhbGVudCBtdWx0aXBseS5cbiAqIFxuICogQG5hbWUgRmFtb3VzTWF0cml4I21vdmVUaGVuXG4gKiBAZnVuY3Rpb25cbiAqXG4gKiBAcGFyYW0ge0FycmF5Lm51bWJlcn0gdiB2ZWN0b3IgcmVwcmVzZW50aW5nIGluaXRpYWwgbW92ZW1lbnRcbiAqIEBwYXJhbSB7RmFtb3VzTWF0cml4fSBtIG1hdHJpeCB0byBhcHBseSBhZnRlcndhcmRzXG4gKiBAcmV0dXJucyB7RmFtb3VzTWF0cml4fSB0aGUgcmVzdWx0aW5nIG1hdHJpeFxuICovXG5GYW1vdXNNYXRyaXgubW92ZVRoZW4gPSBmdW5jdGlvbih2LCBtKSB7XG4gICAgaWYoIXZbMl0pIHZbMl0gPSAwO1xuICAgIHZhciB0MCA9IHZbMF0qbVswXSArIHZbMV0qbVs0XSArIHZbMl0qbVs4XTtcbiAgICB2YXIgdDEgPSB2WzBdKm1bMV0gKyB2WzFdKm1bNV0gKyB2WzJdKm1bOV07XG4gICAgdmFyIHQyID0gdlswXSptWzJdICsgdlsxXSptWzZdICsgdlsyXSptWzEwXTtcbiAgICByZXR1cm4gRmFtb3VzTWF0cml4Lm1vdmUobSwgW3QwLCB0MSwgdDJdKTtcbn07XG5cbi8qKlxuICogUmV0dXJuIGEgRmFtb3VzTWF0cml4IHdoaWNoIHJlcHJlc2VudHMgYSB0cmFuc2xhdGlvbiBieSBzcGVjaWZpZWRcbiAqICAgIGFtb3VudHMgaW4gZWFjaCBkaW1lbnNpb24uXG4gKiAgICBcbiAqIEBuYW1lIEZhbW91c01hdHJpeCN0cmFuc2xhdGVcbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIHtudW1iZXJ9IHggeCB0cmFuc2xhdGlvbiAoZGVsdGFfeClcbiAqIEBwYXJhbSB7bnVtYmVyfSB5IHkgdHJhbnNsYXRpb24gKGRlbHRhX3kpXG4gKiBAcGFyYW0ge251bWJlcn0geiB6IHRyYW5zbGF0aW9uIChkZWx0YV96KVxuICogQHJldHVybnMge0ZhbW91c01hdHJpeH0gdGhlIHJlc3VsdGluZyBtYXRyaXhcbiAqLyBcbkZhbW91c01hdHJpeC50cmFuc2xhdGUgPSBmdW5jdGlvbih4LCB5LCB6KSB7XG4gICAgaWYoeiA9PT0gdW5kZWZpbmVkKSB6ID0gMDtcbiAgICByZXR1cm4gWzEsIDAsIDAsIDAsIDAsIDEsIDAsIDAsIDAsIDAsIDEsIDAsIHgsIHksIHosIDFdO1xufTtcblxuLyoqXG4gKiBSZXR1cm4gYSBGYW1vdXNNYXRyaXggd2hpY2ggcmVwcmVzZW50cyBhIHNjYWxlIGJ5IHNwZWNpZmllZCBhbW91bnRzXG4gKiAgICBpbiBlYWNoIGRpbWVuc2lvbi5cbiAqICAgIFxuICogQG5hbWUgRmFtb3VzTWF0cml4I3NjYWxlXG4gKiBAZnVuY3Rpb24gIFxuICpcbiAqIEBwYXJhbSB7bnVtYmVyfSB4IHggc2NhbGUgZmFjdG9yXG4gKiBAcGFyYW0ge251bWJlcn0geSB5IHNjYWxlIGZhY3RvclxuICogQHBhcmFtIHtudW1iZXJ9IHogeiBzY2FsZSBmYWN0b3JcbiAqIEByZXR1cm5zIHtGYW1vdXNNYXRyaXh9IHRoZSByZXN1bHRpbmcgbWF0cml4XG4gKi8gXG5GYW1vdXNNYXRyaXguc2NhbGUgPSBmdW5jdGlvbih4LCB5LCB6KSB7XG4gICAgaWYoeiA9PT0gdW5kZWZpbmVkKSB6ID0gMTtcbiAgICByZXR1cm4gW3gsIDAsIDAsIDAsIDAsIHksIDAsIDAsIDAsIDAsIHosIDAsIDAsIDAsIDAsIDFdO1xufTtcblxuLyoqXG4gKiBSZXR1cm4gYSBGYW1vdXNNYXRyaXggd2hpY2ggcmVwcmVzZW50cyBhIHNwZWNpZmllZCBjbG9ja3dpc2VcbiAqICAgIHJvdGF0aW9uIGFyb3VuZCB0aGUgeCBheGlzLlxuICogICAgXG4gKiBAbmFtZSBGYW1vdXNNYXRyaXgjcm90YXRlWFxuICogQGZ1bmN0aW9uXG4gKlxuICogQHBhcmFtIHtudW1iZXJ9IHRoZXRhIHJhZGlhbnNcbiAqIEByZXR1cm5zIHtGYW1vdXNNYXRyaXh9IHRoZSByZXN1bHRpbmcgbWF0cml4XG4gKi8gXG5GYW1vdXNNYXRyaXgucm90YXRlWCA9IGZ1bmN0aW9uKHRoZXRhKSB7XG4gICAgdmFyIGNvc1RoZXRhID0gTWF0aC5jb3ModGhldGEpO1xuICAgIHZhciBzaW5UaGV0YSA9IE1hdGguc2luKHRoZXRhKTtcbiAgICByZXR1cm4gWzEsIDAsIDAsIDAsIDAsIGNvc1RoZXRhLCBzaW5UaGV0YSwgMCwgMCwgLXNpblRoZXRhLCBjb3NUaGV0YSwgMCwgMCwgMCwgMCwgMV07XG59O1xuXG4vKipcbiAqIFJldHVybiBhIEZhbW91c01hdHJpeCB3aGljaCByZXByZXNlbnRzIGEgc3BlY2lmaWVkIGNsb2Nrd2lzZVxuICogICAgcm90YXRpb24gYXJvdW5kIHRoZSB5IGF4aXMuXG4gKiAgICBcbiAqIEBuYW1lIEZhbW91c01hdHJpeCNyb3RhdGVZXG4gKiBAZnVuY3Rpb25cbiAqXG4gKiBAcmV0dXJucyB7RmFtb3VzTWF0cml4fSB0aGUgcmVzdWx0aW5nIG1hdHJpeFxuICovIFxuRmFtb3VzTWF0cml4LnJvdGF0ZVkgPSBmdW5jdGlvbih0aGV0YSkge1xuICAgIHZhciBjb3NUaGV0YSA9IE1hdGguY29zKHRoZXRhKTtcbiAgICB2YXIgc2luVGhldGEgPSBNYXRoLnNpbih0aGV0YSk7XG4gICAgcmV0dXJuIFtjb3NUaGV0YSwgMCwgLXNpblRoZXRhLCAwLCAwLCAxLCAwLCAwLCBzaW5UaGV0YSwgMCwgY29zVGhldGEsIDAsIDAsIDAsIDAsIDFdO1xufTtcblxuLyoqXG4gKiBSZXR1cm4gYSBGYW1vdXNNYXRyaXggd2hpY2ggcmVwcmVzZW50cyBhIHNwZWNpZmllZCBjbG9ja3dpc2VcbiAqICAgIHJvdGF0aW9uIGFyb3VuZCB0aGUgeiBheGlzLlxuICogICAgXG4gKiBAbmFtZSBGYW1vdXNNYXRyaXgjcm90YXRlWlxuICogQGZ1bmN0aW9uXG4gKlxuICogQHBhcmFtIHtudW1iZXJ9IHRoZXRhIHJhZGlhbnNcbiAqIEByZXR1cm5zIHtGYW1vdXNNYXRyaXh9IHRoZSByZXN1bHRpbmcgbWF0cml4XG4gKi8gXG5GYW1vdXNNYXRyaXgucm90YXRlWiA9IGZ1bmN0aW9uKHRoZXRhKSB7XG4gICAgdmFyIGNvc1RoZXRhID0gTWF0aC5jb3ModGhldGEpO1xuICAgIHZhciBzaW5UaGV0YSA9IE1hdGguc2luKHRoZXRhKTtcbiAgICByZXR1cm4gW2Nvc1RoZXRhLCBzaW5UaGV0YSwgMCwgMCwgLXNpblRoZXRhLCBjb3NUaGV0YSwgMCwgMCwgMCwgMCwgMSwgMCwgMCwgMCwgMCwgMV07XG59O1xuXG4vKipcbiAqIFJldHVybiBhIEZhbW91c01hdHJpeCB3aGljaCByZXByZXNlbnRzIGNvbXBvc2VkIGNsb2Nrd2lzZVxuICogICAgcm90YXRpb25zIGFsb25nIGVhY2ggb2YgdGhlIGF4ZXMuIEVxdWl2YWxlbnQgdG8gdGhlIHJlc3VsdCBvZlxuICogICAgbXVsdGlwbHkocm90YXRlWChwaGkpLCByb3RhdGVZKHRoZXRhKSwgcm90YXRlWihwc2kpKVxuICogICAgXG4gKiBAbmFtZSBGYW1vdXNNYXRyaXgjcm90YXRlXG4gKiBAZnVuY3Rpb25cbiAqXG4gKiBAcGFyYW0ge251bWJlcn0gcGhpIHJhZGlhbnMgdG8gcm90YXRlIGFib3V0IHRoZSBwb3NpdGl2ZSB4IGF4aXNcbiAqIEBwYXJhbSB7bnVtYmVyfSB0aGV0YSByYWRpYW5zIHRvIHJvdGF0ZSBhYm91dCB0aGUgcG9zaXRpdmUgeSBheGlzXG4gKiBAcGFyYW0ge251bWJlcn0gcHNpIHJhZGlhbnMgdG8gcm90YXRlIGFib3V0IHRoZSBwb3NpdGl2ZSB6IGF4aXNcbiAqIEByZXR1cm5zIHtGYW1vdXNNYXRyaXh9IHRoZSByZXN1bHRpbmcgbWF0cml4XG4gKi8gXG5GYW1vdXNNYXRyaXgucm90YXRlID0gZnVuY3Rpb24ocGhpLCB0aGV0YSwgcHNpKSB7XG4gICAgdmFyIGNvc1BoaSA9IE1hdGguY29zKHBoaSk7XG4gICAgdmFyIHNpblBoaSA9IE1hdGguc2luKHBoaSk7XG4gICAgdmFyIGNvc1RoZXRhID0gTWF0aC5jb3ModGhldGEpO1xuICAgIHZhciBzaW5UaGV0YSA9IE1hdGguc2luKHRoZXRhKTtcbiAgICB2YXIgY29zUHNpID0gTWF0aC5jb3MocHNpKTtcbiAgICB2YXIgc2luUHNpID0gTWF0aC5zaW4ocHNpKTtcbiAgICB2YXIgcmVzdWx0ID0gWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDFdO1xuICAgIHJlc3VsdFswXSA9IGNvc1RoZXRhICogY29zUHNpO1xuICAgIHJlc3VsdFsxXSA9IGNvc1BoaSAqIHNpblBzaSArIHNpblBoaSAqIHNpblRoZXRhICogY29zUHNpO1xuICAgIHJlc3VsdFsyXSA9IHNpblBoaSAqIHNpblBzaSAtIGNvc1BoaSAqIHNpblRoZXRhICogY29zUHNpO1xuICAgIHJlc3VsdFs0XSA9IC1jb3NUaGV0YSAqIHNpblBzaTtcbiAgICByZXN1bHRbNV0gPSBjb3NQaGkgKiBjb3NQc2kgLSBzaW5QaGkgKiBzaW5UaGV0YSAqIHNpblBzaTtcbiAgICByZXN1bHRbNl0gPSBzaW5QaGkgKiBjb3NQc2kgKyBjb3NQaGkgKiBzaW5UaGV0YSAqIHNpblBzaTtcbiAgICByZXN1bHRbOF0gPSBzaW5UaGV0YTtcbiAgICByZXN1bHRbOV0gPSAtc2luUGhpICogY29zVGhldGE7XG4gICAgcmVzdWx0WzEwXSA9IGNvc1BoaSAqIGNvc1RoZXRhO1xuICAgIHJldHVybiByZXN1bHQ7XG59O1xuXG4vKipcbiAqIFJldHVybiBhIEZhbW91c01hdHJpeCB3aGljaCByZXByZXNlbnRzIGFuIGF4aXMtYW5nbGUgcm90YXRpb25cbiAqXG4gKiBAbmFtZSBGYW1vdXNNYXRyaXgjcm90YXRlQXhpc1xuICogQGZ1bmN0aW9uXG4gKlxuICogQHBhcmFtIHtBcnJheS5udW1iZXJ9IHYgdW5pdCB2ZWN0b3IgcmVwcmVzZW50aW5nIHRoZSBheGlzIHRvIHJvdGF0ZSBhYm91dFxuICogQHBhcmFtIHtudW1iZXJ9IHRoZXRhIHJhZGlhbnMgdG8gcm90YXRlIGNsb2Nrd2lzZSBhYm91dCB0aGUgYXhpc1xuICogQHJldHVybnMge0ZhbW91c01hdHJpeH0gdGhlIHJlc3VsdGluZyBtYXRyaXhcbiAqLyBcbkZhbW91c01hdHJpeC5yb3RhdGVBeGlzID0gZnVuY3Rpb24odiwgdGhldGEpIHtcbiAgICB2YXIgc2luVGhldGEgPSBNYXRoLnNpbih0aGV0YSk7XG4gICAgdmFyIGNvc1RoZXRhID0gTWF0aC5jb3ModGhldGEpO1xuICAgIHZhciB2ZXJUaGV0YSA9IDEgLSBjb3NUaGV0YTsgLy8gdmVyc2luZSBvZiB0aGV0YVxuXG4gICAgdmFyIHh4ViA9IHZbMF0qdlswXSp2ZXJUaGV0YTtcbiAgICB2YXIgeHlWID0gdlswXSp2WzFdKnZlclRoZXRhO1xuICAgIHZhciB4elYgPSB2WzBdKnZbMl0qdmVyVGhldGE7XG4gICAgdmFyIHl5ViA9IHZbMV0qdlsxXSp2ZXJUaGV0YTtcbiAgICB2YXIgeXpWID0gdlsxXSp2WzJdKnZlclRoZXRhO1xuICAgIHZhciB6elYgPSB2WzJdKnZbMl0qdmVyVGhldGE7XG4gICAgdmFyIHhzID0gdlswXSpzaW5UaGV0YTtcbiAgICB2YXIgeXMgPSB2WzFdKnNpblRoZXRhO1xuICAgIHZhciB6cyA9IHZbMl0qc2luVGhldGE7XG5cbiAgICB2YXIgcmVzdWx0ID0gWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDFdO1xuICAgIHJlc3VsdFswXSA9IHh4ViArIGNvc1RoZXRhO1xuICAgIHJlc3VsdFsxXSA9IHh5ViArIHpzO1xuICAgIHJlc3VsdFsyXSA9IHh6ViAtIHlzO1xuICAgIHJlc3VsdFs0XSA9IHh5ViAtIHpzO1xuICAgIHJlc3VsdFs1XSA9IHl5ViArIGNvc1RoZXRhO1xuICAgIHJlc3VsdFs2XSA9IHl6ViArIHhzO1xuICAgIHJlc3VsdFs4XSA9IHh6ViArIHlzO1xuICAgIHJlc3VsdFs5XSA9IHl6ViAtIHhzO1xuICAgIHJlc3VsdFsxMF0gPSB6elYgKyBjb3NUaGV0YTtcbiAgICByZXR1cm4gcmVzdWx0O1xufTtcblxuLyoqXG4gKiBSZXR1cm4gYSBGYW1vdXNNYXRyaXggd2hpY2ggcmVwcmVzZW50cyBhIHRyYW5zZm9ybSBtYXRyaXggYXBwbGllZCBhYm91dFxuICogYSBzZXBhcmF0ZSBvcmlnaW4gcG9pbnQuXG4gKiBcbiAqIEBuYW1lIEZhbW91c01hdHJpeCNhYm91dE9yaWdpblxuICogQGZ1bmN0aW9uXG4gKlxuICogQHBhcmFtIHtBcnJheS5udW1iZXJ9IHYgb3JpZ2luIHBvaW50IHRvIGFwcGx5IG1hdHJpeFxuICogQHBhcmFtIHtGYW1vdXNNYXRyaXh9IG0gbWF0cml4IHRvIGFwcGx5XG4gKiBAcmV0dXJucyB7RmFtb3VzTWF0cml4fSB0aGUgcmVzdWx0aW5nIG1hdHJpeFxuICovXG5GYW1vdXNNYXRyaXguYWJvdXRPcmlnaW4gPSBmdW5jdGlvbih2LCBtKSB7XG4gICAgdmFyIHQwID0gdlswXSAtICh2WzBdKm1bMF0gKyB2WzFdKm1bNF0gKyB2WzJdKm1bOF0pO1xuICAgIHZhciB0MSA9IHZbMV0gLSAodlswXSptWzFdICsgdlsxXSptWzVdICsgdlsyXSptWzldKTtcbiAgICB2YXIgdDIgPSB2WzJdIC0gKHZbMF0qbVsyXSArIHZbMV0qbVs2XSArIHZbMl0qbVsxMF0pO1xuICAgIHJldHVybiBGYW1vdXNNYXRyaXgubW92ZShtLCBbdDAsIHQxLCB0Ml0pO1xufTtcblxuLyoqXG4gKiBSZXR1cm4gYSBGYW1vdXNNYXRyaXgncyB3ZWJraXQgY3NzIHJlcHJlc2VudGF0aW9uIHRvIGJlIHVzZWQgd2l0aCB0aGVcbiAqICAgIENTUzMgLXdlYmtpdC10cmFuc2Zvcm0gc3R5bGUuIFxuICogQGV4YW1wbGU6IC13ZWJraXQtdHJhbnNmb3JtOiBtYXRyaXgzZCgxLDAsMCwwLDAsMSwwLDAsMCwwLDEsMCw3MTYsMjQzLDAsMSlcbiAqXG4gKiBAbmFtZSBGYW1vdXNNYXRyaXgjZm9ybWF0Q1NTXG4gKiBAZnVuY3Rpb25cbiAqIFxuICogQHBhcmFtIHtGYW1vdXNNYXRyaXh9IG0gYSBGYW1vdXMgbWF0cml4XG4gKiBAcmV0dXJucyB7c3RyaW5nfSBtYXRyaXgzZCBDU1Mgc3R5bGUgcmVwcmVzZW50YXRpb24gb2YgdGhlIHRyYW5zZm9ybVxuICovIFxuRmFtb3VzTWF0cml4LmZvcm1hdENTUyA9IGZ1bmN0aW9uKG0pIHtcbiAgICB2YXIgbiA9IG0uc2xpY2UoMCk7XG4gICAgZm9yKHZhciBpID0gMDsgaSA8IG4ubGVuZ3RoOyBpKyspIGlmKG5baV0gPCAwLjAwMDAwMSAmJiBuW2ldID4gLTAuMDAwMDAxKSBuW2ldID0gMDtcbiAgICByZXR1cm4gJ21hdHJpeDNkKCcgKyBuLmpvaW4oKSArICcpJztcbn07XG5cbi8qKlxuICogUmV0dXJuIGEgRmFtb3VzTWF0cml4IHJlcHJlc2VudGF0aWtvbiBvZiBhIHNrZXcgdHJhbnNmb3JtYXRpb25cbiAqXG4gKiBAbmFtZSBGYW1vdXNNYXRyaXgjc2tld1xuICogQGZ1bmN0aW9uXG4gKiBcbiAqIEBwYXJhbSB7bnVtYmVyfSBwc2kgcmFkaWFucyBza2V3ZWQgYWJvdXQgdGhlIHl6IHBsYW5lXG4gKiBAcGFyYW0ge251bWJlcn0gdGhldGEgcmFkaWFucyBza2V3ZWQgYWJvdXQgdGhlIHh6IHBsYW5lXG4gKiBAcGFyYW0ge251bWJlcn0gcGhpIHJhZGlhbnMgc2tld2VkIGFib3V0IHRoZSB4eSBwbGFuZVxuICogQHJldHVybnMge0ZhbW91c01hdHJpeH0gdGhlIHJlc3VsdGluZyBtYXRyaXhcbiAqLyBcbkZhbW91c01hdHJpeC5za2V3ID0gZnVuY3Rpb24ocGhpLCB0aGV0YSwgcHNpKSB7XG4gICAgcmV0dXJuIFsxLCAwLCAwLCAwLCBNYXRoLnRhbihwc2kpLCAxLCAwLCAwLCBNYXRoLnRhbih0aGV0YSksIE1hdGgudGFuKHBoaSksIDEsIDAsIDAsIDAsIDAsIDFdO1xufTtcblxuLyoqXG4gKiBSZXR1cm4gdHJhbnNsYXRpb24gdmVjdG9yIGNvbXBvbmVudCBvZiBnaXZlbiBGYW1vdXNNYXRyaXhcbiAqIFxuICogQG5hbWUgRmFtb3VzTWF0cml4I2dldFRyYW5zbGF0ZVxuICogQGZ1bmN0aW9uXG4gKlxuICogQHBhcmFtIHtGYW1vdXNNYXRyaXh9IG0gbWF0cml4XG4gKiBAcmV0dXJucyB7QXJyYXkuPG51bWJlcj59IHRoZSB0cmFuc2xhdGlvbiB2ZWN0b3IgW3RfeCwgdF95LCB0X3pdXG4gKi8gXG5GYW1vdXNNYXRyaXguZ2V0VHJhbnNsYXRlID0gZnVuY3Rpb24obSkge1xuICAgIHJldHVybiBbbVsxMl0sIG1bMTNdLCBtWzE0XV07XG59O1xuXG4vKipcbiAqIFJldHVybiBpbnZlcnNlIGFmZmluZSBtYXRyaXggZm9yIGdpdmVuIEZhbW91c01hdHJpeC4gXG4gKiBOb3RlOiBUaGlzIGFzc3VtZXMgbVszXSA9IG1bN10gPSBtWzExXSA9IDAsIGFuZCBtWzE1XSA9IDEuIFxuICogICAgICAgSW5jb3JyZWN0IHJlc3VsdHMgaWYgbm90IGludmVydGFibGUgb3IgcHJlY29uZGl0aW9ucyBub3QgbWV0LlxuICpcbiAqIEBuYW1lIEZhbW91c01hdHJpeCNpbnZlcnNlXG4gKiBAZnVuY3Rpb25cbiAqIFxuICogQHBhcmFtIHtGYW1vdXNNYXRyaXh9IG0gbWF0cml4XG4gKiBAcmV0dXJucyB7RmFtb3VzTWF0cml4fSB0aGUgcmVzdWx0aW5nIGludmVydGVkIG1hdHJpeFxuICovIFxuRmFtb3VzTWF0cml4LmludmVyc2UgPSBmdW5jdGlvbihtKSB7XG4gICAgdmFyIHJlc3VsdCA9IFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAxXTtcbiAgICAvLyBvbmx5IG5lZWQgdG8gY29uc2lkZXIgM3gzIHNlY3Rpb24gZm9yIGFmZmluZVxuICAgIHZhciBjMCA9IG1bNV0qbVsxMF0gLSBtWzZdKm1bOV07XG4gICAgdmFyIGMxID0gbVs0XSptWzEwXSAtIG1bNl0qbVs4XTtcbiAgICB2YXIgYzIgPSBtWzRdKm1bOV0gLSBtWzVdKm1bOF07XG4gICAgdmFyIGM0ID0gbVsxXSptWzEwXSAtIG1bMl0qbVs5XTtcbiAgICB2YXIgYzUgPSBtWzBdKm1bMTBdIC0gbVsyXSptWzhdO1xuICAgIHZhciBjNiA9IG1bMF0qbVs5XSAtIG1bMV0qbVs4XTtcbiAgICB2YXIgYzggPSBtWzFdKm1bNl0gLSBtWzJdKm1bNV07XG4gICAgdmFyIGM5ID0gbVswXSptWzZdIC0gbVsyXSptWzRdO1xuICAgIHZhciBjMTAgPSBtWzBdKm1bNV0gLSBtWzFdKm1bNF07XG4gICAgdmFyIGRldE0gPSBtWzBdKmMwIC0gbVsxXSpjMSArIG1bMl0qYzI7XG4gICAgdmFyIGludkQgPSAxL2RldE07XG4gICAgcmVzdWx0WzBdID0gaW52RCAqIGMwO1xuICAgIHJlc3VsdFsxXSA9IC1pbnZEICogYzQ7XG4gICAgcmVzdWx0WzJdID0gaW52RCAqIGM4O1xuICAgIHJlc3VsdFs0XSA9IC1pbnZEICogYzE7XG4gICAgcmVzdWx0WzVdID0gaW52RCAqIGM1O1xuICAgIHJlc3VsdFs2XSA9IC1pbnZEICogYzk7XG4gICAgcmVzdWx0WzhdID0gaW52RCAqIGMyO1xuICAgIHJlc3VsdFs5XSA9IC1pbnZEICogYzY7XG4gICAgcmVzdWx0WzEwXSA9IGludkQgKiBjMTA7XG4gICAgcmVzdWx0WzEyXSA9IC1tWzEyXSpyZXN1bHRbMF0gLSBtWzEzXSpyZXN1bHRbNF0gLSBtWzE0XSpyZXN1bHRbOF07XG4gICAgcmVzdWx0WzEzXSA9IC1tWzEyXSpyZXN1bHRbMV0gLSBtWzEzXSpyZXN1bHRbNV0gLSBtWzE0XSpyZXN1bHRbOV07XG4gICAgcmVzdWx0WzE0XSA9IC1tWzEyXSpyZXN1bHRbMl0gLSBtWzEzXSpyZXN1bHRbNl0gLSBtWzE0XSpyZXN1bHRbMTBdO1xuICAgIHJldHVybiByZXN1bHQ7XG59O1xuXG4vKipcbiAqIERlY29tcG9zZSBGYW1vdXNNYXRyaXggaW50byBzZXBhcmF0ZSAudHJhbnNsYXRlLCAucm90YXRlLCAuc2NhbGUsXG4gKiAgICAuc2tldyBjb21wb25lbnRzLlxuICogICAgXG4gKiBAbmFtZSBGYW1vdXNNYXRyaXgjaW50ZXJwcmV0XG4gKiBAZnVuY3Rpb25cbiAqXG4gKiBAcGFyYW0ge0ZhbW91c01hdHJpeH0gTSBtYXRyaXhcbiAqIEByZXR1cm5zIHttYXRyaXhTcGVjfSBvYmplY3Qgd2l0aCBjb21wb25lbnQgbWF0cmljZXMgLnRyYW5zbGF0ZSxcbiAqICAgIC5yb3RhdGUsIC5zY2FsZSwgLnNrZXdcbiAqLyBcbkZhbW91c01hdHJpeC5pbnRlcnByZXQgPSBmdW5jdGlvbihNKSB7XG5cbiAgICAvLyBRUiBkZWNvbXBvc2l0aW9uIHZpYSBIb3VzZWhvbGRlciByZWZsZWN0aW9uc1xuXG4gICAgZnVuY3Rpb24gbm9ybVNxdWFyZWQodil7XG4gICAgICAgIGlmICh2Lmxlbmd0aCA9PSAyKVxuICAgICAgICAgICAgcmV0dXJuIHZbMF0qdlswXSArIHZbMV0qdlsxXTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmV0dXJuIHZbMF0qdlswXSArIHZbMV0qdlsxXSArIHZbMl0qdlsyXTtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gbm9ybSh2KXtcbiAgICAgICAgcmV0dXJuIE1hdGguc3FydChub3JtU3F1YXJlZCh2KSk7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIHNpZ24obil7XG4gICAgICAgIHJldHVybiAobiA8IDApID8gLTEgOiAxO1xuICAgIH07XG5cblxuICAgIC8vRklSU1QgSVRFUkFUSU9OXG5cbiAgICAvL2RlZmF1bHQgUTEgdG8gdGhlIGlkZW50aXR5IG1hdHJpeDtcbiAgICB2YXIgeCA9IFtNWzBdLCBNWzFdLCBNWzJdXTsgICAgICAgICAgICAgICAgIC8vIGZpcnN0IGNvbHVtbiB2ZWN0b3JcbiAgICB2YXIgc2duID0gc2lnbih4WzBdKTsgICAgICAgICAgICAgICAgICAgICAgIC8vIHNpZ24gb2YgZmlyc3QgY29tcG9uZW50IG9mIHggKGZvciBzdGFiaWxpdHkpXG4gICAgdmFyIHhOb3JtID0gbm9ybSh4KTsgICAgICAgICAgICAgICAgICAgICAgIC8vIG5vcm0gb2YgZmlyc3QgY29sdW1uIHZlY3RvclxuICAgIHZhciB2ID0gW3hbMF0gKyBzZ24gKiB4Tm9ybSwgeFsxXSwgeFsyXV07ICAvLyB2ID0geCArIHNpZ24oeFswXSl8eHxlMVxuICAgIHZhciBtdWx0ID0gMiAvIG5vcm1TcXVhcmVkKHYpOyAgICAgICAgICAgICAgLy8gbXVsdCA9IDIvdid2XG5cbiAgICAvL2V2YWx1YXRlIFExID0gSSAtIDJ2dicvdid2XG4gICAgdmFyIFExID0gWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDFdO1xuXG4gICAgLy9kaWFnb25hbHNcbiAgICBRMVswXSAgPSAxIC0gbXVsdCAqIHZbMF0gKiB2WzBdOyAgICAvLyAwLDAgZW50cnlcbiAgICBRMVs1XSAgPSAxIC0gbXVsdCAqIHZbMV0gKiB2WzFdOyAgICAvLyAxLDEgZW50cnlcbiAgICBRMVsxMF0gPSAxIC0gbXVsdCAqIHZbMl0gKiB2WzJdOyAgICAvLyAyLDIgZW50cnlcblxuICAgIC8vdXBwZXIgZGlhZ29uYWxcbiAgICBRMVsxXSA9IC1tdWx0ICogdlswXSAqIHZbMV07ICAgICAgICAvLyAwLDEgZW50cnlcbiAgICBRMVsyXSA9IC1tdWx0ICogdlswXSAqIHZbMl07ICAgICAgICAvLyAwLDIgZW50cnlcbiAgICBRMVs2XSA9IC1tdWx0ICogdlsxXSAqIHZbMl07ICAgICAgICAvLyAxLDIgZW50cnlcblxuICAgIC8vbG93ZXIgZGlhZ29uYWxcbiAgICBRMVs0XSA9IFExWzFdOyAgICAgICAgICAgICAgICAgICAgICAvLyAxLDAgZW50cnlcbiAgICBRMVs4XSA9IFExWzJdOyAgICAgICAgICAgICAgICAgICAgICAvLyAyLDAgZW50cnlcbiAgICBRMVs5XSA9IFExWzZdOyAgICAgICAgICAgICAgICAgICAgICAvLyAyLDEgZW50cnlcblxuICAgIC8vcmVkdWNlIGZpcnN0IGNvbHVtbiBvZiBNXG4gICAgdmFyIE1RMSA9IEZhbW91c01hdHJpeC5tdWx0aXBseShNLCBRMSk7XG5cblxuICAgIC8vU0VDT05EIElURVJBVElPTiBvbiAoMSwxKSBtaW5vclxuICAgIHZhciB4MiA9IFtNUTFbNV0sIE1RMVs2XV07XG4gICAgdmFyIHNnbjIgPSBzaWduKHgyWzBdKTsgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBzaWduIG9mIGZpcnN0IGNvbXBvbmVudCBvZiB4IChmb3Igc3RhYmlsaXR5KVxuICAgIHZhciB4Mk5vcm0gPSBub3JtKHgyKTsgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBub3JtIG9mIGZpcnN0IGNvbHVtbiB2ZWN0b3JcbiAgICB2YXIgdjIgPSBbeDJbMF0gKyBzZ24yICogeDJOb3JtLCB4MlsxXV07ICAgICAgICAgICAgLy8gdiA9IHggKyBzaWduKHhbMF0pfHh8ZTFcbiAgICB2YXIgbXVsdDIgPSAyIC8gbm9ybVNxdWFyZWQodjIpOyAgICAgICAgICAgICAgICAgICAgIC8vIG11bHQgPSAyL3YndlxuXG4gICAgLy9ldmFsdWF0ZSBRMiA9IEkgLSAydnYnL3YndlxuICAgIHZhciBRMiA9IFsxLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAxXTtcblxuICAgIC8vZGlhZ29uYWxcbiAgICBRMls1XSAgPSAxIC0gbXVsdDIgKiB2MlswXSAqIHYyWzBdOyAvLyAxLDEgZW50cnlcbiAgICBRMlsxMF0gPSAxIC0gbXVsdDIgKiB2MlsxXSAqIHYyWzFdOyAvLyAyLDIgZW50cnlcblxuICAgIC8vb2ZmIGRpYWdvbmFsc1xuICAgIFEyWzZdID0gLW11bHQyICogdjJbMF0gKiB2MlsxXTsgICAgIC8vIDIsMSBlbnRyeVxuICAgIFEyWzldID0gUTJbNl07ICAgICAgICAgICAgICAgICAgICAgIC8vIDEsMiBlbnRyeVxuXG5cbiAgICAvL2NhbGMgUVIgZGVjb21wb3NpdGlvbi4gUSA9IFExKlEyLCBSID0gUScqTVxuICAgIHZhciBRID0gRmFtb3VzTWF0cml4Lm11bHRpcGx5KFExLCBRMik7ICAgICAgICAgICAgICAvL25vdGU6IHJlYWxseSBRIHRyYW5zcG9zZVxuICAgIHZhciBSID0gRmFtb3VzTWF0cml4Lm11bHRpcGx5KE0sIFEpO1xuXG4gICAgLy9yZW1vdmUgbmVnYXRpdmUgc2NhbGluZ1xuICAgIHZhciByZW1vdmVyID0gRmFtb3VzTWF0cml4LnNjYWxlKFJbMF0gPCAwID8gLTEgOiAxLCBSWzVdIDwgMCA/IC0xIDogMSwgUlsxMF0gPCAwID8gLTEgOiAxKTtcbiAgICBSID0gRmFtb3VzTWF0cml4Lm11bHRpcGx5KHJlbW92ZXIsIFIpO1xuICAgIFEgPSBGYW1vdXNNYXRyaXgubXVsdGlwbHkoUSwgcmVtb3Zlcik7XG5cbiAgICAvL2RlY29tcG9zZSBpbnRvIHJvdGF0ZS9zY2FsZS9za2V3IG1hdHJpY2VzXG4gICAgdmFyIHJlc3VsdCA9IHt9O1xuICAgIHJlc3VsdC50cmFuc2xhdGUgPSBGYW1vdXNNYXRyaXguZ2V0VHJhbnNsYXRlKE0pO1xuICAgIHJlc3VsdC5yb3RhdGUgPSBbTWF0aC5hdGFuMigtUVs2XSwgUVsxMF0pLCBNYXRoLmFzaW4oUVsyXSksIE1hdGguYXRhbjIoLVFbMV0sIFFbMF0pXTtcbiAgICBpZighcmVzdWx0LnJvdGF0ZVswXSkge1xuICAgICAgICByZXN1bHQucm90YXRlWzBdID0gMDtcbiAgICAgICAgcmVzdWx0LnJvdGF0ZVsyXSA9IE1hdGguYXRhbjIoUVs0XSwgUVs1XSk7XG4gICAgfVxuICAgIHJlc3VsdC5zY2FsZSA9IFtSWzBdLCBSWzVdLCBSWzEwXV07XG4gICAgcmVzdWx0LnNrZXcgPSBbTWF0aC5hdGFuKFJbOV0vcmVzdWx0LnNjYWxlWzJdKSwgTWF0aC5hdGFuKFJbOF0vcmVzdWx0LnNjYWxlWzJdKSwgTWF0aC5hdGFuKFJbNF0vcmVzdWx0LnNjYWxlWzBdKV07XG5cbiAgICAvL2RvdWJsZSByb3RhdGlvbiB3b3JrYXJvdW5kXG4gICAgaWYoTWF0aC5hYnMocmVzdWx0LnJvdGF0ZVswXSkgKyBNYXRoLmFicyhyZXN1bHQucm90YXRlWzJdKSA+IDEuNSpNYXRoLlBJKSB7XG4gICAgICAgIHJlc3VsdC5yb3RhdGVbMV0gPSBNYXRoLlBJIC0gcmVzdWx0LnJvdGF0ZVsxXTtcbiAgICAgICAgaWYocmVzdWx0LnJvdGF0ZVsxXSA+IE1hdGguUEkpIHJlc3VsdC5yb3RhdGVbMV0gLT0gMipNYXRoLlBJO1xuICAgICAgICBpZihyZXN1bHQucm90YXRlWzFdIDwgLU1hdGguUEkpIHJlc3VsdC5yb3RhdGVbMV0gKz0gMipNYXRoLlBJO1xuICAgICAgICBpZihyZXN1bHQucm90YXRlWzBdIDwgMCkgcmVzdWx0LnJvdGF0ZVswXSArPSBNYXRoLlBJO1xuICAgICAgICBlbHNlIHJlc3VsdC5yb3RhdGVbMF0gLT0gTWF0aC5QSTtcbiAgICAgICAgaWYocmVzdWx0LnJvdGF0ZVsyXSA8IDApIHJlc3VsdC5yb3RhdGVbMl0gKz0gTWF0aC5QSTtcbiAgICAgICAgZWxzZSByZXN1bHQucm90YXRlWzJdIC09IE1hdGguUEk7XG4gICAgfSAgIFxuXG4gICAgcmV0dXJuIHJlc3VsdDtcblxufTtcblxuLyoqXG4gKiBDb21wb3NlIC50cmFuc2xhdGUsIC5yb3RhdGUsIC5zY2FsZSwgLnNrZXcgY29tcG9uZW50cyBpbnRvIGludG9cbiAqICAgIEZhbW91c01hdHJpeFxuICogICAgXG4gKiBAbmFtZSBGYW1vdXNNYXRyaXgjYnVpbGRcbiAqIEBmdW5jdGlvblxuICpcbiAqIEBwYXJhbSB7bWF0cml4U3BlY30gc3BlYyBvYmplY3Qgd2l0aCBjb21wb25lbnQgbWF0cmljZXMgLnRyYW5zbGF0ZSxcbiAqICAgIC5yb3RhdGUsIC5zY2FsZSwgLnNrZXdcbiAqIEByZXR1cm5zIHtGYW1vdXNNYXRyaXh9IGNvbXBvc2VkIG1hcnRpeFxuICovIFxuRmFtb3VzTWF0cml4LmJ1aWxkID0gZnVuY3Rpb24oc3BlYykge1xuICAgIHZhciBzY2FsZU1hdHJpeCA9IEZhbW91c01hdHJpeC5zY2FsZShzcGVjLnNjYWxlWzBdLCBzcGVjLnNjYWxlWzFdLCBzcGVjLnNjYWxlWzJdKTtcbiAgICB2YXIgc2tld01hdHJpeCA9IEZhbW91c01hdHJpeC5za2V3KHNwZWMuc2tld1swXSwgc3BlYy5za2V3WzFdLCBzcGVjLnNrZXdbMl0pO1xuICAgIHZhciByb3RhdGVNYXRyaXggPSBGYW1vdXNNYXRyaXgucm90YXRlKHNwZWMucm90YXRlWzBdLCBzcGVjLnJvdGF0ZVsxXSwgc3BlYy5yb3RhdGVbMl0pO1xuICAgIHJldHVybiBGYW1vdXNNYXRyaXgubW92ZShGYW1vdXNNYXRyaXgubXVsdGlwbHkoc2NhbGVNYXRyaXgsIHNrZXdNYXRyaXgsIHJvdGF0ZU1hdHJpeCksIHNwZWMudHJhbnNsYXRlKTtcbn07XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIHR3byBGYW1vdXNNYXRyaXhlcyBhcmUgY29tcG9uZW50LXdpc2UgZXF1YWxcbiAqIFxuICogQG5hbWUgRmFtb3VzTWF0cml4I2VxdWFsc1xuICogQGZ1bmN0aW9uXG4gKiBcbiAqIEBwYXJhbSB7RmFtb3VzTWF0cml4fSBhIG1hdHJpeFxuICogQHBhcmFtIHtGYW1vdXNNYXRyaXh9IGIgbWF0cml4XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gXG4gKi8gXG5GYW1vdXNNYXRyaXguZXF1YWxzID0gZnVuY3Rpb24oYSwgYikge1xuICAgIGlmKGEgPT09IGIpIHJldHVybiB0cnVlO1xuICAgIGlmKCFhIHx8ICFiKSByZXR1cm4gZmFsc2U7XG4gICAgZm9yKHZhciBpID0gMDsgaSA8IGEubGVuZ3RoOyBpKyspIGlmKGFbaV0gIT0gYltpXSkgcmV0dXJuIGZhbHNlO1xuICAgIHJldHVybiB0cnVlO1xufTtcblxuLyoqXG4gKiBDb25zdHJhaW4gYW5nbGUtdHJpbyBjb21wb25lbnRzIHRvIHJhbmdlIG9mIFstcGksIHBpKS5cbiAqXG4gKiBAbmFtZSBGYW1vdXNNYXRyaXgjbm9ybWFsaXplUm90YXRpb25cbiAqIEBmdW5jdGlvblxuICogXG4gKiBAcGFyYW0ge0FycmF5LjxudW1iZXI+fSByb3RhdGlvbiBwaGksIHRoZXRhLCBwc2kgKGFycmF5IG9mIGZsb2F0cyBcbiAqICAgICYmIGFycmF5Lmxlbmd0aCA9PSAzKVxuICogQHJldHVybnMge0FycmF5LjxudW1iZXI+fSBuZXcgcGhpLCB0aGV0YSwgcHNpIHRyaXBsZXRcbiAqICAgIChhcnJheSBvZiBmbG9hdHMgJiYgYXJyYXkubGVuZ3RoID09IDMpXG4gKi8gXG5GYW1vdXNNYXRyaXgubm9ybWFsaXplUm90YXRpb24gPSBmdW5jdGlvbihyb3RhdGlvbikge1xuICAgIHZhciByZXN1bHQgPSByb3RhdGlvbi5zbGljZSgwKTtcbiAgICBpZihyZXN1bHRbMF0gPT0gTWF0aC5QSS8yIHx8IHJlc3VsdFswXSA9PSAtTWF0aC5QSS8yKSB7XG4gICAgICAgIHJlc3VsdFswXSA9IC1yZXN1bHRbMF07XG4gICAgICAgIHJlc3VsdFsxXSA9IE1hdGguUEkgLSByZXN1bHRbMV07XG4gICAgICAgIHJlc3VsdFsyXSAtPSBNYXRoLlBJO1xuICAgIH1cbiAgICBpZihyZXN1bHRbMF0gPiBNYXRoLlBJLzIpIHtcbiAgICAgICAgcmVzdWx0WzBdID0gcmVzdWx0WzBdIC0gTWF0aC5QSTtcbiAgICAgICAgcmVzdWx0WzFdID0gTWF0aC5QSSAtIHJlc3VsdFsxXTtcbiAgICAgICAgcmVzdWx0WzJdIC09IE1hdGguUEk7XG4gICAgfVxuICAgIGlmKHJlc3VsdFswXSA8IC1NYXRoLlBJLzIpIHtcbiAgICAgICAgcmVzdWx0WzBdID0gcmVzdWx0WzBdICsgTWF0aC5QSTtcbiAgICAgICAgcmVzdWx0WzFdID0gLU1hdGguUEkgLSByZXN1bHRbMV07XG4gICAgICAgIHJlc3VsdFsyXSAtPSBNYXRoLlBJO1xuICAgIH1cbiAgICB3aGlsZShyZXN1bHRbMV0gPCAtTWF0aC5QSSkgcmVzdWx0WzFdICs9IDIqTWF0aC5QSTtcbiAgICB3aGlsZShyZXN1bHRbMV0gPj0gTWF0aC5QSSkgcmVzdWx0WzFdIC09IDIqTWF0aC5QSTtcbiAgICB3aGlsZShyZXN1bHRbMl0gPCAtTWF0aC5QSSkgcmVzdWx0WzJdICs9IDIqTWF0aC5QSTtcbiAgICB3aGlsZShyZXN1bHRbMl0gPj0gTWF0aC5QSSkgcmVzdWx0WzJdIC09IDIqTWF0aC5QSTtcbiAgICByZXR1cm4gcmVzdWx0O1xufTtcblxuLyoqXG4gKiBUcmFuc2Zvcm0gdmVjdG9yIGJ5IGEgbWF0cml4LCB0aHJvdWdoIHJpZ2h0LW11bHRpcGx5aW5nIGJ5IG1hdHJpeC5cbiAqIFxuICogQG5hbWUgRmFtb3VzTWF0cml4I3ZlY011bHRpcGx5XG4gKiBAZnVuY3Rpb25cbiAqXG4gKiBAcGFyYW0ge0FycmF5LjxudW1iZXI+fSB2ZWMgeCx5LHogdmVjdG9yIFxuICogICAgKGFycmF5IG9mIGZsb2F0cyAmJiBhcnJheS5sZW5ndGggPT0gMylcbiAqIEBwYXJhbSB7RmFtb3VzTWF0cml4fSBtIG1hdHJpeFxuICogQHJldHVybnMge0FycmF5LjxudW1iZXI+fSB0aGUgcmVzdWx0aW5nIHZlY3RvclxuICogICAgKGFycmF5IG9mIGZsb2F0cyAmJiBhcnJheS5sZW5ndGggPT0gMylcbiAqLyBcbkZhbW91c01hdHJpeC52ZWNNdWx0aXBseSA9IGZ1bmN0aW9uKHZlYywgbSkge1xuICAgIHJldHVybiBbXG4gICAgICAgIHZlY1swXSptWzBdICsgdmVjWzFdKm1bNF0gKyB2ZWNbMl0qbVs4XSArIG1bMTJdLFxuICAgICAgICB2ZWNbMF0qbVsxXSArIHZlY1sxXSptWzVdICsgdmVjWzJdKm1bOV0gKyBtWzEzXSxcbiAgICAgICAgdmVjWzBdKm1bMl0gKyB2ZWNbMV0qbVs2XSArIHZlY1syXSptWzEwXSArIG1bMTRdXG4gICAgXTtcbn07XG5cbi8qKiBcbiAqIEFwcGx5IHZpc3VhbCBwZXJzcGVjdGl2ZSBmYWN0b3IgcCB0byB2ZWN0b3IuXG4gKlxuICogQG5hbWUgRmFtb3VzTWF0cml4I2FwcGx5UGVyc3BlY3RpdmVcbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIHtBcnJheS48bnVtYmVyPn0gdmVjIHgseSx6IHZlY3RvciAoYXJyYXkgb2YgZmxvYXRzICYmIGFycmF5Lmxlbmd0aCA9PSAzKVxuICogQHBhcmFtIHtudW1iZXJ9IHAgcGVyc3BlY3RpdmUgZmFjdG9yXG4gKiBAcmV0dXJucyB7QXJyYXkuPG51bWJlcj59IHRoZSByZXN1bHRpbmcgeCx5IHZlY3RvciAoYXJyYXkgb2YgZmxvYXRzIFxuICogICAgJiYgYXJyYXkubGVuZ3RoID09IDIpXG4gKi9cbkZhbW91c01hdHJpeC5hcHBseVBlcnNwZWN0aXZlID0gZnVuY3Rpb24odmVjLCBwKSB7XG4gICAgdmFyIHNjYWxlID0gcC8ocCAtIHZlY1syXSk7XG4gICAgcmV0dXJuIFtzY2FsZSAqIHZlY1swXSwgc2NhbGUgKiB2ZWNbMV1dO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBGYW1vdXNNYXRyaXg7XG4iLCJcbnZhciBGTSA9IHJlcXVpcmUoJy4vT2xkTWF0cml4Jyk7XG5cbi8qKlxuICogQGNvbnN0cnVjdG9yXG4gKi9cbmZ1bmN0aW9uIFF1YXRlcm5pb24odyx4LHkseil7XG4gICAgdGhpcy53ID0gKHcgIT09IHVuZGVmaW5lZCkgPyB3IDogMS4wOyAgLy9BbmdsZVxuICAgIHRoaXMueCA9IHggfHwgMC4wOyAgLy9BeGlzLnhcbiAgICB0aGlzLnkgPSB5IHx8IDAuMDsgIC8vQXhpcy55XG4gICAgdGhpcy56ID0geiB8fCAwLjA7ICAvL0F4aXMueiAgICAgICAgXG4gICAgcmV0dXJuIHRoaXM7XG59O1xuXG5RdWF0ZXJuaW9uLnByb3RvdHlwZS5tYWtlRnJvbUFuZ2xlQW5kQXhpcyA9IGZ1bmN0aW9uKGFuZ2xlLCB2KVxueyAgICAgICAgXG4gICAgdi5ub3JtYWxpemUoKTsgXG4gICAgdmFyIGhhID0gYW5nbGUqMC41OyBcbiAgICB2YXIgcyA9IE1hdGguc2luKGhhKTsgICAgICAgICBcbiAgICB0aGlzLnggPSBzKnYueDsgXG4gICAgdGhpcy55ID0gcyp2Lnk7IFxuICAgIHRoaXMueiA9IHMqdi56OyBcbiAgICB0aGlzLncgPSBNYXRoLmNvcyhoYSk7ICAgICAgICAgXG4gICAgcmV0dXJuIHRoaXM7IFxufTsgICAgIFxuXG5RdWF0ZXJuaW9uLnByb3RvdHlwZS5jbG9uZSA9IGZ1bmN0aW9uKClcbntcbiAgICByZXR1cm4gbmV3IFF1YXRlcm5pb24odGhpcy53LCB0aGlzLngsIHRoaXMueSwgdGhpcy56KTsgXG59OyBcblxuUXVhdGVybmlvbi5wcm90b3R5cGUuc2V0V1hZWiA9IGZ1bmN0aW9uKHcsIHgsIHksIHopXG57XG4gICAgdGhpcy53ID0gdzsgXG4gICAgdGhpcy54ID0geDsgXG4gICAgdGhpcy55ID0geTsgXG4gICAgdGhpcy56ID0gejsgICAgICAgICBcbiAgICByZXR1cm4gdGhpczsgXG59O1xuXG5RdWF0ZXJuaW9uLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbihxKSBcbntcbiAgICB0aGlzLncgPSBxLnc7ICAgIFxuICAgIHRoaXMueCA9IHEueDsgXG4gICAgdGhpcy55ID0gcS55OyBcbiAgICB0aGlzLnogPSBxLno7ICAgICAgICAgXG4gICAgcmV0dXJuIHRoaXM7IFxufTtcblxuUXVhdGVybmlvbi5wcm90b3R5cGUuY2xlYXIgPSBmdW5jdGlvbigpIFxue1xuICAgIHRoaXMudyA9IDEuMDsgXG4gICAgdGhpcy54ID0gMC4wOyBcbiAgICB0aGlzLnkgPSAwLjA7IFxuICAgIHRoaXMueiA9IDAuMDsgXG4gICAgcmV0dXJuIHRoaXM7ICAgICAgICAgXG59O1xuXG5RdWF0ZXJuaW9uLnByb3RvdHlwZS5ub3JtYWxpemUgPSBmdW5jdGlvbigpXG57XG4gICAgdmFyIG5vcm1lID0gTWF0aC5zcXJ0KHRoaXMudyp0aGlzLncgKyB0aGlzLngqdGhpcy54ICsgdGhpcy55KnRoaXMueSArIHRoaXMueip0aGlzLnopOyBcbiAgICBpZiAobm9ybWUgPT0gMC4wKVxuICAgIHtcbiAgICAgICAgdGhpcy53ID0gMS4wOyBcbiAgICAgICAgdGhpcy54ID0gdGhpcy55ID0gdGhpcy56ID0gMC4wOyBcbiAgICB9XG4gICAgZWxzZVxuICAgIHtcbiAgICAgICAgdmFyIHJlY2lwID0gMS4wIC8gbm9ybWU7IFxuICAgICAgICB0aGlzLncgKj0gcmVjaXA7IFxuICAgICAgICB0aGlzLnggKj0gcmVjaXA7IFxuICAgICAgICB0aGlzLnkgKj0gcmVjaXA7IFxuICAgICAgICB0aGlzLnogKj0gcmVjaXA7ICAgICAgICAgICAgIFxuICAgIH1cbiAgICByZXR1cm4gdGhpczsgXG59OyBcblxuUXVhdGVybmlvbi5wcm90b3R5cGUuZ2V0TWF0cml4ID0gZnVuY3Rpb24oKVxue1xuICAgIHRoaXMubm9ybWFsaXplKCk7IFxuICAgIHJldHVybiBbIFxuICAgICAgICAxLjAgLSAyLjAqdGhpcy55KnRoaXMueSAtIDIuMCp0aGlzLnoqdGhpcy56LCBcbiAgICAgICAgMi4wKnRoaXMueCp0aGlzLnkgLSAyLjAqdGhpcy56KnRoaXMudywgXG4gICAgICAgIDIuMCp0aGlzLngqdGhpcy56ICsgMi4wKnRoaXMueSp0aGlzLncsIFxuICAgICAgICAwLjAsXG4gICAgICAgIDIuMCp0aGlzLngqdGhpcy55ICsgMi4wKnRoaXMueip0aGlzLncsIFxuICAgICAgICAxLjAgLSAyLjAqdGhpcy54KnRoaXMueCAtIDIuMCp0aGlzLnoqdGhpcy56LCBcbiAgICAgICAgMi4wKnRoaXMueSp0aGlzLnogLSAyLjAqdGhpcy54KnRoaXMudywgXG4gICAgICAgIDAuMCxcbiAgICAgICAgMi4wKnRoaXMueCp0aGlzLnogLSAyLjAqdGhpcy55KnRoaXMudywgXG4gICAgICAgIDIuMCp0aGlzLnkqdGhpcy56ICsgMi4wKnRoaXMueCp0aGlzLncsIFxuICAgICAgICAxLjAgLSAyLjAqdGhpcy54KnRoaXMueCAtIDIuMCp0aGlzLnkqdGhpcy55LCBcbiAgICAgICAgMC4wLFxuICAgICAgICAwLjAsIFxuICAgICAgICAwLjAsIFxuICAgICAgICAwLjAsIFxuICAgICAgICAxLjAgXTsgXG59OyAgXG5cblF1YXRlcm5pb24ucHJvdG90eXBlLm11bHRpcGx5ID0gZnVuY3Rpb24ocSwgb3V0KSBcbntcbiAgICBvdXQgPSBvdXQgfHwgdGhpcy5yZWdpc3RlcjtcbiAgICBvdXQudyA9IHRoaXMudypxLncgLSB0aGlzLngqcS54IC0gdGhpcy55KnEueSAtIHRoaXMueipxLno7IFxuICAgIG91dC54ID0gdGhpcy53KnEueCArIHRoaXMueCpxLncgKyB0aGlzLnkqcS56IC0gdGhpcy56KnEueTtcbiAgICBvdXQueSA9IHRoaXMudypxLnkgLSB0aGlzLngqcS56ICsgdGhpcy55KnEudyArIHRoaXMueipxLng7XG4gICAgb3V0LnogPSB0aGlzLncqcS56ICsgdGhpcy54KnEueSAtIHRoaXMueSpxLnggKyB0aGlzLnoqcS53IDtcbiAgICByZXR1cm4gb3V0OyBcbn07XG5cblF1YXRlcm5pb24ucHJvdG90eXBlLmlzRXF1YWwgPSBmdW5jdGlvbihxKSBcbntcbiAgICBpZihxLncgPT0gdGhpcy53ICYmIHEueCA9PSB0aGlzLnggJiYgcS55ID09IHRoaXMueSAmJiBxLnogPT0gdGhpcy56KVxuICAgIHtcbiAgICAgICAgcmV0dXJuIHRydWU7IFxuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7IFxufTsgXG5cblF1YXRlcm5pb24ucHJvdG90eXBlLmRvdCA9IGZ1bmN0aW9uKHEpXG57XG4gICAgcmV0dXJuICh0aGlzLncqcS53ICsgdGhpcy54KnEueCArIHRoaXMueSpxLnkgKyB0aGlzLnoqcS56KTsgXG59OyAgICBcblxuUXVhdGVybmlvbi5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24ocSwgb3V0KVxue1xuICAgIG91dCA9IG91dCB8fCB0aGlzLnJlZ2lzdGVyO1xuICAgIG91dC53ID0gdGhpcy53ICsgcS53OyBcbiAgICBvdXQueCA9IHRoaXMueCArIHEueDsgXG4gICAgb3V0LnkgPSB0aGlzLnkgKyBxLnk7IFxuICAgIG91dC56ID0gdGhpcy56ICsgcS56OyBcbiAgICByZXR1cm4gb3V0OyBcbn07IFxuXG5RdWF0ZXJuaW9uLnByb3RvdHlwZS5zdWIgPSBmdW5jdGlvbihxLCBvdXQpXG57XG4gICAgb3V0ID0gb3V0IHx8IHRoaXMucmVnaXN0ZXI7XG4gICAgb3V0LncgPSB0aGlzLncgLSBxLnc7IFxuICAgIG91dC54ID0gdGhpcy54IC0gcS54OyBcbiAgICBvdXQueSA9IHRoaXMueSAtIHEueTsgXG4gICAgb3V0LnogPSB0aGlzLnogLSBxLno7IFxuICAgIHJldHVybiBvdXQ7IFxufTsgXG5cblF1YXRlcm5pb24ucHJvdG90eXBlLm5vcm1TcXVhcmVkID0gZnVuY3Rpb24oKVxue1xuICAgIHJldHVybiB0aGlzLngqdGhpcy54ICsgdGhpcy55KnRoaXMueSArIHRoaXMueip0aGlzLnogKyB0aGlzLncqdGhpcy53OyBcbn07XG5cblF1YXRlcm5pb24ucHJvdG90eXBlLm5vcm0gPSBmdW5jdGlvbigpXG57XG4gICAgcmV0dXJuIE1hdGguc3FydCh0aGlzLm5vcm1TcXVhcmVkKCkpO1xufTtcblxuXG5RdWF0ZXJuaW9uLnByb3RvdHlwZS5jb25qID0gZnVuY3Rpb24ob3V0KVxue1xuICAgIG91dCA9IG91dCB8fCB0aGlzLnJlZ2lzdGVyO1xuICAgIG91dC53ID0gdGhpcy53OyBcbiAgICBvdXQueCA9IC10aGlzLng7IFxuICAgIG91dC55ID0gLXRoaXMueTsgXG4gICAgb3V0LnogPSAtdGhpcy56OyBcbiAgICByZXR1cm4gb3V0OyBcbn07IFxuXG5RdWF0ZXJuaW9uLnByb3RvdHlwZS5pbnZlcnNlID0gZnVuY3Rpb24ob3V0KVxue1xuICAgIG91dCA9IG91dCB8fCB0aGlzLnJlZ2lzdGVyO1xuICAgIHRoaXMuY29uaihvdXQpO1xuICAgIG91dC5zY2FsYXJEaXZpZGUodGhpcy5ub3JtU3F1YXJlZCgpLCBvdXQpO1xuICAgIHJldHVybiBvdXQ7ICBcbn07IFxuXG5RdWF0ZXJuaW9uLnByb3RvdHlwZS5zY2FsYXJEaXZpZGUgPSBmdW5jdGlvbihzLCBvdXQpXG57XG4gICAgb3V0ID0gb3V0IHx8IHRoaXMucmVnaXN0ZXI7ICAgICAgICBcbiAgICBzID0gMS4wIC8gcztcbiAgICBvdXQudyA9IHRoaXMudypzOyBcbiAgICBvdXQueCA9IHRoaXMueCpzOyBcbiAgICBvdXQueSA9IHRoaXMueSpzOyBcbiAgICBvdXQueiA9IHRoaXMueipzOyBcbiAgICByZXR1cm4gb3V0OyBcbn07XG5cblF1YXRlcm5pb24ucHJvdG90eXBlLnNjYWxhck11bHQgPSBmdW5jdGlvbihzLCBvdXQpXG57XG4gICAgb3V0ID0gb3V0IHx8IHRoaXMucmVnaXN0ZXI7ICAgICAgICAgICAgICAgIFxuICAgIG91dC53ID0gdGhpcy53KnM7IFxuICAgIG91dC54ID0gdGhpcy54KnM7IFxuICAgIG91dC55ID0gdGhpcy55KnM7IFxuICAgIG91dC56ID0gdGhpcy56KnM7IFxuICAgIHJldHVybiBvdXQ7ICAgXG59XG5cblF1YXRlcm5pb24ucHJvdG90eXBlLmlzWmVybyA9IGZ1bmN0aW9uKClcbntcbiAgICBpZih0aGlzLnggPT0gMCAmJiB0aGlzLnkgPT0gMCAmJiB0aGlzLnogPT0gMCAmJiB0aGlzLncgPT0gMS4wKVxuICAgIHtcbiAgICAgICAgcmV0dXJuIHRydWU7IFxuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7ICAgICAgICAgXG59OyBcblxuUXVhdGVybmlvbi5wcm90b3R5cGUubmVnYXRlID0gZnVuY3Rpb24oKVxue1xuICAgIHRoaXMudyA9IC10aGlzLnc7IFxuICAgIHRoaXMueCA9IC10aGlzLng7IFxuICAgIHRoaXMueSA9IC10aGlzLnk7IFxuICAgIHRoaXMueiA9IC10aGlzLno7IFxuICAgIHJldHVybiB0aGlzOyBcbn1cblxuUXVhdGVybmlvbi5wcm90b3R5cGUuemVyb1JvdGF0aW9uID0gZnVuY3Rpb24oKVxue1xuICAgIHRoaXMueCA9IDA7IHRoaXMueSA9IDA7IHRoaXMueiA9IDA7IHRoaXMudyA9IDEuMDsgXG4gICAgcmV0dXJuIHRoaXM7IFxufTsgXG5cblF1YXRlcm5pb24ucHJvdG90eXBlLnNsZXJwID0gZnVuY3Rpb24ocSwgdCwgb3V0KVxue1xuICAgIG91dCA9IG91dCB8fCB0aGlzLnJlZ2lzdGVyOyAgICAgICAgICAgICAgICBcbiAgICB2YXIgb21lZ2EsIGNvc29tZWdhLCBzaW5vbWVnYSwgc2NhbGVGcm9tLCBzY2FsZVRvOyBcblxuICAgIHRoaXMudG8uc2V0KHEpO1xuICAgIHRoaXMuZnJvbS5zZXQodGhpcyk7IFxuXG4gICAgY29zb21lZ2EgPSB0aGlzLmRvdChxKTsgXG5cbiAgICBpZihjb3NvbWVnYSA8IDAuMClcbiAgICB7XG4gICAgICAgIGNvc29tZWdhID0gLWNvc29tZWdhOyBcbiAgICAgICAgdGhpcy50by5uZWdhdGUoKTsgICAgICAgICAgICAgXG4gICAgfVxuXG4gICAgaWYoICgxLjAgLSBjb3NvbWVnYSkgPiB0aGlzLmVwc2lsb24gKVxuICAgIHtcbiAgICAgICAgb21lZ2EgPSBNYXRoLmFjb3MoY29zb21lZ2EpOyBcbiAgICAgICAgc2lub21lZ2EgPSBNYXRoLnNpbihvbWVnYSk7XG4gICAgICAgIHNjYWxlRnJvbSA9IE1hdGguc2luKCAoMS4wIC0gdCkgKiBvbWVnYSApIC8gc2lub21lZ2E7IFxuICAgICAgICBzY2FsZVRvID0gTWF0aC5zaW4oIHQgKiBvbWVnYSApIC8gc2lub21lZ2E7ICAgICAgICAgICAgIFxuICAgIH1cbiAgICBlbHNlXG4gICAge1xuICAgICAgICBzY2FsZUZyb20gPSAxLjAgLSB0OyBcbiAgICAgICAgc2NhbGVUbyA9IHQ7IFxuICAgIH1cblxuXG4gICAgdGhpcy5mcm9tLnNjYWxhck11bHQoc2NhbGVGcm9tLCB0aGlzLmZyb20pOyAgICAgICAgXG4gICAgdGhpcy50by5zY2FsYXJNdWx0KHNjYWxlVG8sIHRoaXMudG8pOyAgICAgICAgXG4gICAgdGhpcy5mcm9tLmFkZCh0aGlzLnRvLCBvdXQpOyAgICAgICAgIFxuICAgIHJldHVybiBvdXQ7IFxufVxuXG5RdWF0ZXJuaW9uLnByb3RvdHlwZS5lcHNpbG9uICAgID0gMC4wMDAwMTsgXG5RdWF0ZXJuaW9uLnByb3RvdHlwZS5mcm9tICAgICAgID0gbmV3IFF1YXRlcm5pb24oMCwwLDAsMCk7XG5RdWF0ZXJuaW9uLnByb3RvdHlwZS50byAgICAgICAgID0gbmV3IFF1YXRlcm5pb24oMCwwLDAsMCk7XG5RdWF0ZXJuaW9uLnByb3RvdHlwZS5yZWdpc3RlciAgID0gbmV3IFF1YXRlcm5pb24oMCwwLDAsMCk7XG5RdWF0ZXJuaW9uLnByb3RvdHlwZS56ZXJvICAgICAgID0gbmV3IFF1YXRlcm5pb24oMCwwLDAsMCk7XG5RdWF0ZXJuaW9uLnByb3RvdHlwZS5vbmUgICAgICAgID0gbmV3IFF1YXRlcm5pb24oMSwxLDEsMSk7XG5cbm1vZHVsZS5leHBvcnRzID0gUXVhdGVybmlvbjtcbiIsInZhciBGTSA9IHJlcXVpcmUoJy4vT2xkTWF0cml4Jyk7XG5cbnZhciBVdGlscyA9IHsgICAgICAgICAgICAgICAgXG4gICAgcmFkMmRlZzogZnVuY3Rpb24ocmFkKVxuICAgIHtcbiAgICAgICAgcmV0dXJuIHJhZCAqIDU3LjI5NTc3OTU7IFxuICAgIH0sXG5cbiAgICBkZWcycmFkOiBmdW5jdGlvbihkZWcpXG4gICAge1xuICAgICAgICByZXR1cm4gZGVnICogMC4wMTc0NTMyOTI1OyBcbiAgICB9LFxuXG4gICAgZGlzdGFuY2U6IGZ1bmN0aW9uKHgxLCB5MSwgeDIsIHkyKVxuICAgIHtcbiAgICAgICAgdmFyIGRlbHRhWCA9IHgyIC0geDE7IFxuICAgICAgICB2YXIgZGVsdGFZID0geTIgLSB5MTsgXG4gICAgICAgIHJldHVybiBNYXRoLnNxcnQoZGVsdGFYKmRlbHRhWCArIGRlbHRhWSpkZWx0YVkpOyBcbiAgICB9LFxuXG4gICAgZGlzdGFuY2UzRDogZnVuY3Rpb24oeDEsIHkxLCB6MSwgeDIsIHkyLCB6MilcbiAgICB7XG4gICAgICAgIHZhciBkZWx0YVggPSB4MiAtIHgxOyBcbiAgICAgICAgdmFyIGRlbHRhWSA9IHkyIC0geTE7IFxuICAgICAgICB2YXIgZGVsdGFaID0gejIgLSB6MTsgXG4gICAgICAgIHJldHVybiBNYXRoLnNxcnQoZGVsdGFYKmRlbHRhWCArIGRlbHRhWSpkZWx0YVkgKyBkZWx0YVoqZGVsdGFaKTsgXG4gICAgfSxcblxuICAgIG1hcDogZnVuY3Rpb24odmFsdWUsIGlucHV0TWluLCBpbnB1dE1heCwgb3V0cHV0TWluLCBvdXRwdXRNYXgsIGNsYW1wKVxuICAgIHsgICAgICAgICBcbiAgICAgIHZhciBvdXRWYWx1ZSA9ICgodmFsdWUgLSBpbnB1dE1pbikvKGlucHV0TWF4IC0gaW5wdXRNaW4pKSAqIChvdXRwdXRNYXggLSBvdXRwdXRNaW4pICsgb3V0cHV0TWluOyBcbiAgICAgIGlmKGNsYW1wKVxuICAgICAgeyAgICAgICBcbiAgICAgICAgaWYob3V0cHV0TWF4ID4gb3V0cHV0TWluKVxuICAgICAgICB7XG4gICAgICAgICAgaWYob3V0VmFsdWUgPiBvdXRwdXRNYXgpXG4gICAgICAgICAge1xuICAgICAgICAgICAgb3V0VmFsdWUgPSBvdXRwdXRNYXg7IFxuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlIGlmKG91dFZhbHVlIDwgb3V0cHV0TWluKVxuICAgICAgICAgIHtcbiAgICAgICAgICAgIG91dFZhbHVlID0gb3V0cHV0TWluOyBcbiAgICAgICAgICB9IFxuICAgICAgICB9XG4gICAgICAgIGVsc2VcbiAgICAgICAge1xuICAgICAgICAgIGlmKG91dFZhbHVlIDwgb3V0cHV0TWF4KVxuICAgICAgICAgIHtcbiAgICAgICAgICAgIG91dFZhbHVlID0gb3V0cHV0TWF4OyBcbiAgICAgICAgICB9XG4gICAgICAgICAgZWxzZSBpZihvdXRWYWx1ZSA+IG91dHB1dE1pbilcbiAgICAgICAgICB7XG4gICAgICAgICAgICBvdXRWYWx1ZSA9IG91dHB1dE1pbjsgXG4gICAgICAgICAgfSBcbiAgICAgICAgfSAgICAgICAgIFxuICAgICAgfVxuICAgICAgcmV0dXJuIG91dFZhbHVlOyAgICAgICAgIFxuICAgIH0sXG5cbiAgICBsaW1pdDogZnVuY3Rpb24odmFsdWUsIGxvdywgaGlnaClcbiAgICB7XG4gICAgICAgIHZhbHVlID0gTWF0aC5taW4odmFsdWUsIGhpZ2gpOyBcbiAgICAgICAgdmFsdWUgPSBNYXRoLm1heCh2YWx1ZSwgbG93KTsgXG4gICAgICAgIHJldHVybiB2YWx1ZTsgICAgICAgICAgICAgXG4gICAgfSxcblxuICAgIHBlcnNwZWN0aXZlOiBmdW5jdGlvbihmb3Z5LCBhc3BlY3QsIG5lYXIsIGZhcikgXG4gICAge1xuICAgICAgICB2YXIgb3V0ID0gWzEsIDAsIDAsIDAsIDAsIDEsIDAsIDAsIDAsIDAsIDEsIDAsIDAsIDAsIDAsIDFdO1xuICAgICAgICB2YXIgZiA9IDEuMCAvIE1hdGgudGFuKGZvdnkgLyAyKSxcbiAgICAgICAgbmYgPSAxLjAgLyAobmVhciAtIGZhcik7XG4gICAgICAgIG91dFswXSA9IGYgLyBhc3BlY3Q7XG4gICAgICAgIG91dFsxXSA9IDA7XG4gICAgICAgIG91dFsyXSA9IDA7XG4gICAgICAgIG91dFszXSA9IDA7XG5cbiAgICAgICAgb3V0WzRdID0gMDtcbiAgICAgICAgb3V0WzVdID0gZjtcbiAgICAgICAgb3V0WzZdID0gMDtcbiAgICAgICAgb3V0WzddID0gMDtcbiAgICAgICAgXG4gICAgICAgIG91dFs4XSA9IDA7XG4gICAgICAgIG91dFs5XSA9IDA7XG4gICAgICAgIG91dFsxMF0gPSAoZmFyICsgbmVhcikgKiBuZjtcbiAgICAgICAgb3V0WzExXSA9IC0xO1xuICAgICAgICBcbiAgICAgICAgb3V0WzEyXSA9IDA7XG4gICAgICAgIG91dFsxM10gPSAwO1xuICAgICAgICBvdXRbMTRdID0gKDIgKiBmYXIgKiBuZWFyKSAqIG5mO1xuICAgICAgICBvdXRbMTVdID0gMDtcbiAgICAgICAgcmV0dXJuIG91dDtcbiAgICB9LFxuXG4gICAgb3J0aG86IGZ1bmN0aW9uKGxlZnQsIHJpZ2h0LCBib3R0b20sIHRvcCwgbmVhciwgZmFyKVxuICAgIHtcbiAgICAgICAgdmFyIG91dCA9IFsxLCAwLCAwLCAwLCAwLCAxLCAwLCAwLCAwLCAwLCAxLCAwLCAwLCAwLCAwLCAxXTtcbiAgICAgICAgdmFyIHR4ID0gLShyaWdodCtsZWZ0KS8ocmlnaHQtbGVmdCk7XG4gICAgICAgIHZhciB0eSA9IC0odG9wK2JvdHRvbSkvKHRvcC1ib3R0b20pO1xuICAgICAgICB2YXIgdHogPSAtKGZhcituZWFyKS8oZmFyLW5lYXIpO1xuXG4gICAgICAgIG91dFswXSA9IDIuMC8ocmlnaHQtbGVmdCk7IFxuICAgICAgICBvdXRbMV0gPSAwO1xuICAgICAgICBvdXRbMl0gPSAwO1xuICAgICAgICBvdXRbM10gPSAwO1xuXG4gICAgICAgIG91dFs0XSA9IDA7XG4gICAgICAgIG91dFs1XSA9IDIuMC8odG9wLWJvdHRvbSk7XG4gICAgICAgIG91dFs2XSA9IDA7XG4gICAgICAgIG91dFs3XSA9IDA7XG4gICAgICAgIFxuICAgICAgICBvdXRbOF0gPSAwO1xuICAgICAgICBvdXRbOV0gPSAwO1xuICAgICAgICBvdXRbMTBdID0gLTIuMC8oZmFyLW5lYXIpO1xuICAgICAgICBvdXRbMTFdID0gLTE7XG4gICAgICAgIFxuICAgICAgICBvdXRbMTJdID0gdHg7IFxuICAgICAgICBvdXRbMTNdID0gdHk7XG4gICAgICAgIG91dFsxNF0gPSB0ejtcbiAgICAgICAgb3V0WzE1XSA9IDEuMDtcbiAgICAgICAgcmV0dXJuIG91dDtcbiAgICB9LFxuXG4gICAgbm9ybWFsRnJvbUZNOiBmdW5jdGlvbiAob3V0LCBhKSBcbiAgICB7XG4gICAgICAgIHZhciBhMDAgPSBhWzBdLCBhMDEgPSBhWzFdLCBhMDIgPSBhWzJdLCBhMDMgPSBhWzNdLFxuICAgICAgICBhMTAgPSBhWzRdLCBhMTEgPSBhWzVdLCBhMTIgPSBhWzZdLCBhMTMgPSBhWzddLFxuICAgICAgICBhMjAgPSBhWzhdLCBhMjEgPSBhWzldLCBhMjIgPSBhWzEwXSwgYTIzID0gYVsxMV0sXG4gICAgICAgIGEzMCA9IGFbMTJdLCBhMzEgPSBhWzEzXSwgYTMyID0gYVsxNF0sIGEzMyA9IGFbMTVdLFxuXG4gICAgICAgIGIwMCA9IGEwMCAqIGExMSAtIGEwMSAqIGExMCxcbiAgICAgICAgYjAxID0gYTAwICogYTEyIC0gYTAyICogYTEwLFxuICAgICAgICBiMDIgPSBhMDAgKiBhMTMgLSBhMDMgKiBhMTAsXG4gICAgICAgIGIwMyA9IGEwMSAqIGExMiAtIGEwMiAqIGExMSxcbiAgICAgICAgYjA0ID0gYTAxICogYTEzIC0gYTAzICogYTExLFxuICAgICAgICBiMDUgPSBhMDIgKiBhMTMgLSBhMDMgKiBhMTIsXG4gICAgICAgIGIwNiA9IGEyMCAqIGEzMSAtIGEyMSAqIGEzMCxcbiAgICAgICAgYjA3ID0gYTIwICogYTMyIC0gYTIyICogYTMwLFxuICAgICAgICBiMDggPSBhMjAgKiBhMzMgLSBhMjMgKiBhMzAsXG4gICAgICAgIGIwOSA9IGEyMSAqIGEzMiAtIGEyMiAqIGEzMSxcbiAgICAgICAgYjEwID0gYTIxICogYTMzIC0gYTIzICogYTMxLFxuICAgICAgICBiMTEgPSBhMjIgKiBhMzMgLSBhMjMgKiBhMzIsXG5cbiAgICAgICAgLy8gQ2FsY3VsYXRlIHRoZSBkZXRlcm1pbmFudFxuICAgICAgICBkZXQgPSBiMDAgKiBiMTEgLSBiMDEgKiBiMTAgKyBiMDIgKiBiMDkgKyBiMDMgKiBiMDggLSBiMDQgKiBiMDcgKyBiMDUgKiBiMDY7XG5cbiAgICAgICAgaWYgKCFkZXQpIHsgXG4gICAgICAgICAgICByZXR1cm4gbnVsbDsgXG4gICAgICAgIH1cbiAgICAgICAgZGV0ID0gMS4wIC8gZGV0O1xuXG4gICAgICAgIG91dFswXSA9IChhMTEgKiBiMTEgLSBhMTIgKiBiMTAgKyBhMTMgKiBiMDkpICogZGV0O1xuICAgICAgICBvdXRbMV0gPSAoYTEyICogYjA4IC0gYTEwICogYjExIC0gYTEzICogYjA3KSAqIGRldDtcbiAgICAgICAgb3V0WzJdID0gKGExMCAqIGIxMCAtIGExMSAqIGIwOCArIGExMyAqIGIwNikgKiBkZXQ7XG5cbiAgICAgICAgb3V0WzNdID0gKGEwMiAqIGIxMCAtIGEwMSAqIGIxMSAtIGEwMyAqIGIwOSkgKiBkZXQ7XG4gICAgICAgIG91dFs0XSA9IChhMDAgKiBiMTEgLSBhMDIgKiBiMDggKyBhMDMgKiBiMDcpICogZGV0O1xuICAgICAgICBvdXRbNV0gPSAoYTAxICogYjA4IC0gYTAwICogYjEwIC0gYTAzICogYjA2KSAqIGRldDtcblxuICAgICAgICBvdXRbNl0gPSAoYTMxICogYjA1IC0gYTMyICogYjA0ICsgYTMzICogYjAzKSAqIGRldDtcbiAgICAgICAgb3V0WzddID0gKGEzMiAqIGIwMiAtIGEzMCAqIGIwNSAtIGEzMyAqIGIwMSkgKiBkZXQ7XG4gICAgICAgIG91dFs4XSA9IChhMzAgKiBiMDQgLSBhMzEgKiBiMDIgKyBhMzMgKiBiMDApICogZGV0O1xuXG4gICAgICAgIHJldHVybiBvdXQ7XG4gICAgfSwgXG5cbiAgICBjbGFtcDogZnVuY3Rpb24odiwgbWluLCBtYXgpICAgICAgICBcbiAgICB7XG4gICAgICAgIGlmKHYgPCBtaW4pXG4gICAgICAgIHtcbiAgICAgICAgICAgIHJldHVybiBtaW47IFxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYodiA+IG1heClcbiAgICAgICAge1xuICAgICAgICAgICAgcmV0dXJuIG1heDsgXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHY7IFxuICAgIH0sXG5cbiAgICBjb2xvcjogZnVuY3Rpb24ocmVkLCBncmVlbiwgYmx1ZSwgYWxwaGEpXG4gICAge1xuICAgICAgcmV0dXJuICdyZ2JhKCcrTWF0aC5mbG9vcihyZWQpKycsJytNYXRoLmZsb29yKGdyZWVuKSsnLCcrTWF0aC5mbG9vcihibHVlKSsnLCcrYWxwaGErJyknOyBcbiAgICB9LFxuICAgIFxuICAgIGJhY2tncm91bmRUcmFuc3BhcmVudDogZnVuY3Rpb24oKVxuICAgIHtcbiAgICAgICAgcmV0dXJuIHsnYmFja2dyb3VuZENvbG9yJzogJ3RyYW5zcGFyZW50J307IFxuICAgIH0sXG5cbiAgICBiYWNrZ3JvdW5kQ29sb3I6IGZ1bmN0aW9uKHJlZCwgZ3JlZW4sIGJsdWUsIGFscGhhKVxuICAgIHtcbiAgICAgICAgcmV0dXJuIHsnYmFja2dyb3VuZENvbG9yJzogJ3JnYmEoJytNYXRoLmZsb29yKHJlZCkrJywnK01hdGguZmxvb3IoZ3JlZW4pKycsJytNYXRoLmZsb29yKGJsdWUpKycsJythbHBoYSsnKSd9OyBcbiAgICB9LFxuXG4gICAgYm9yZGVyUmFkaXVzOiBmdW5jdGlvbihyKVxuICAgIHtcbiAgICAgICAgcmV0dXJuIHsnYm9yZGVyUmFkaXVzJzogcisncHgnfTsgXG4gICAgfSxcblxuICAgIGJvcmRlclRvcFdpZHRoOiBmdW5jdGlvbihyKVxuICAgIHtcbiAgICAgICAgcmV0dXJuIHsnYm9yZGVyVG9wV2lkdGgnOiByKydweCd9OyBcbiAgICB9LFxuXG4gICAgYm9yZGVyQm90dG9tV2lkdGg6IGZ1bmN0aW9uKHIpXG4gICAge1xuICAgICAgICByZXR1cm4geydib3JkZXJCb3R0b21XaWR0aCc6IHIrJ3B4J307IFxuICAgIH0sXG5cbiAgICBib3JkZXJMZWZ0V2lkdGg6IGZ1bmN0aW9uKHIpXG4gICAge1xuICAgICAgICByZXR1cm4geydib3JkZXJMZWZ0V2lkdGgnOiByKydweCd9OyBcbiAgICB9LFxuXG4gICAgYm9yZGVyUmlnaHRXaWR0aDogZnVuY3Rpb24ocilcbiAgICB7XG4gICAgICAgIHJldHVybiB7J2JvcmRlclJpZ2h0V2lkdGgnOiByKydweCd9OyBcbiAgICB9LFxuXG4gICAgYm9yZGVyV2lkdGg6IGZ1bmN0aW9uKHNpemUpXG4gICAge1xuICAgICAgICByZXR1cm4geydib3JkZXJXaWR0aCc6IHNpemUrJ3B4J307XG4gICAgfSxcblxuICAgIGJvcmRlckNvbG9yOiBmdW5jdGlvbihyZWQsIGdyZWVuLCBibHVlLCBhbHBoYSlcbiAgICB7XG4gICAgICAgIGlmKGFscGhhID09IDAuMClcbiAgICAgICAge1xuICAgICAgICAgICAgcmV0dXJuIHsnYm9yZGVyQ29sb3InOiAndHJhbnNwYXJlbnQnfTsgXG4gICAgICAgIH1cbiAgICAgICAgZWxzZVxuICAgICAgICB7XG4gICAgICAgICAgICByZXR1cm4geydib3JkZXJDb2xvcic6ICdyZ2JhKCcrTWF0aC5mbG9vcihyZWQpKycsJytNYXRoLmZsb29yKGdyZWVuKSsnLCcrTWF0aC5mbG9vcihibHVlKSsnLCcrYWxwaGErJyknfTsgXG4gICAgICAgIH0gICAgICAgICAgICBcbiAgICB9LFxuXG4gICAgYm9yZGVyVG9wQ29sb3I6IGZ1bmN0aW9uKHJlZCwgZ3JlZW4sIGJsdWUsIGFscGhhKVxuICAgIHtcbiAgICAgICAgaWYoYWxwaGEgPT0gMC4wKVxuICAgICAgICB7XG4gICAgICAgICAgICByZXR1cm4geydib3JkZXJUb3BDb2xvcic6ICd0cmFuc3BhcmVudCd9OyBcbiAgICAgICAgfVxuICAgICAgICBlbHNlXG4gICAgICAgIHtcbiAgICAgICAgICAgIHJldHVybiB7J2JvcmRlclRvcENvbG9yJzogJ3JnYmEoJytNYXRoLmZsb29yKHJlZCkrJywnK01hdGguZmxvb3IoZ3JlZW4pKycsJytNYXRoLmZsb29yKGJsdWUpKycsJythbHBoYSsnKSd9OyBcbiAgICAgICAgfSAgICAgICAgICAgIFxuICAgIH0sXG5cbiAgICBib3JkZXJCb3R0b21Db2xvcjogZnVuY3Rpb24ocmVkLCBncmVlbiwgYmx1ZSwgYWxwaGEpXG4gICAge1xuICAgICAgICBpZihhbHBoYSA9PSAwLjApXG4gICAgICAgIHtcbiAgICAgICAgICAgIHJldHVybiB7J2JvcmRlckJvdHRvbUNvbG9yJzogJ3RyYW5zcGFyZW50J307IFxuICAgICAgICB9XG4gICAgICAgIGVsc2VcbiAgICAgICAge1xuICAgICAgICAgICAgcmV0dXJuIHsnYm9yZGVyQm90dG9tQ29sb3InOiAncmdiYSgnK01hdGguZmxvb3IocmVkKSsnLCcrTWF0aC5mbG9vcihncmVlbikrJywnK01hdGguZmxvb3IoYmx1ZSkrJywnK2FscGhhKycpJ307IFxuICAgICAgICB9ICAgICAgICAgICAgXG4gICAgfSxcblxuICAgIGJvcmRlclJpZ2h0Q29sb3I6IGZ1bmN0aW9uKHJlZCwgZ3JlZW4sIGJsdWUsIGFscGhhKVxuICAgIHtcbiAgICAgICAgaWYoYWxwaGEgPT0gMC4wKVxuICAgICAgICB7XG4gICAgICAgICAgICByZXR1cm4geydib3JkZXJSaWdodENvbG9yJzogJ3RyYW5zcGFyZW50J307IFxuICAgICAgICB9XG4gICAgICAgIGVsc2VcbiAgICAgICAge1xuICAgICAgICAgICAgcmV0dXJuIHsnYm9yZGVyUmlnaHRDb2xvcic6ICdyZ2JhKCcrTWF0aC5mbG9vcihyZWQpKycsJytNYXRoLmZsb29yKGdyZWVuKSsnLCcrTWF0aC5mbG9vcihibHVlKSsnLCcrYWxwaGErJyknfTsgXG4gICAgICAgIH0gICAgICAgICAgICBcbiAgICB9LFxuXG4gICAgYm9yZGVyTGVmdENvbG9yOiBmdW5jdGlvbihyZWQsIGdyZWVuLCBibHVlLCBhbHBoYSlcbiAgICB7XG4gICAgICAgIGlmKGFscGhhID09IDAuMClcbiAgICAgICAge1xuICAgICAgICAgICAgcmV0dXJuIHsnYm9yZGVyTGVmdENvbG9yJzogJ3RyYW5zcGFyZW50J307IFxuICAgICAgICB9XG4gICAgICAgIGVsc2VcbiAgICAgICAge1xuICAgICAgICAgICAgcmV0dXJuIHsnYm9yZGVyTGVmdENvbG9yJzogJ3JnYmEoJytNYXRoLmZsb29yKHJlZCkrJywnK01hdGguZmxvb3IoZ3JlZW4pKycsJytNYXRoLmZsb29yKGJsdWUpKycsJythbHBoYSsnKSd9OyBcbiAgICAgICAgfSAgICAgICAgICAgIFxuICAgIH0sXG5cbiAgICBib3JkZXJTdHlsZTogZnVuY3Rpb24oc3R5bGUpXG4gICAge1xuICAgICAgICByZXR1cm4geydib3JkZXJTdHlsZSc6IHN0eWxlfTtcbiAgICB9LFxuXG4gICAgYm9yZGVyVG9wU3R5bGU6IGZ1bmN0aW9uKHN0eWxlKVxuICAgIHtcbiAgICAgICAgcmV0dXJuIHsnYm9yZGVyVG9wU3R5bGUnOiBzdHlsZX07XG4gICAgfSxcblxuICAgIGJvcmRlckJvdHRvbVN0eWxlOiBmdW5jdGlvbihzdHlsZSlcbiAgICB7XG4gICAgICAgIHJldHVybiB7J2JvcmRlckJvdHRvbVN0eWxlJzogc3R5bGV9O1xuICAgIH0sXG5cbiAgICBib3JkZXJSaWdodFN0eWxlOiBmdW5jdGlvbihzdHlsZSlcbiAgICB7XG4gICAgICAgIHJldHVybiB7J2JvcmRlclJpZ2h0U3R5bGUnOiBzdHlsZX07XG4gICAgfSxcblxuICAgIGJvcmRlckxlZnRTdHlsZTogZnVuY3Rpb24oc3R5bGUpXG4gICAge1xuICAgICAgICByZXR1cm4geydib3JkZXJMZWZ0U3R5bGUnOiBzdHlsZX07XG4gICAgfSxcblxuICAgIGNvbG9ySFNMOiBmdW5jdGlvbihodWUsIHNhdHVyYXRpb24sIGxpZ2h0bmVzcywgYWxwaGEpXG4gICAge1xuICAgICAgICByZXR1cm4gJ2hzbGEoJytNYXRoLmZsb29yKGh1ZSkrJywnK01hdGguZmxvb3Ioc2F0dXJhdGlvbikrJyUsJytNYXRoLmZsb29yKGxpZ2h0bmVzcykrJyUsJythbHBoYSsnKSc7IFxuICAgIH0sXG5cbiAgICBiYWNrZ3JvdW5kVHJhbnNwYXJlbnQ6IGZ1bmN0aW9uKClcbiAgICB7XG4gICAgICAgIHJldHVybiB7J2JhY2tncm91bmRDb2xvcic6ICd0cmFuc3BhcmVudCd9OyAgICAgICAgICAgICBcbiAgICB9LCBcblxuICAgIGJhY2tncm91bmRDb2xvckhTTDogZnVuY3Rpb24oaHVlLCBzYXR1cmF0aW9uLCBsaWdodG5lc3MsIGFscGhhKVxuICAgIHtcbiAgICAgICAgcmV0dXJuIHsnYmFja2dyb3VuZENvbG9yJzogJ2hzbGEoJytNYXRoLmZsb29yKGh1ZSkrJywnK01hdGguZmxvb3Ioc2F0dXJhdGlvbikrJyUsJytNYXRoLmZsb29yKGxpZ2h0bmVzcykrJyUsJythbHBoYSsnKSd9OyBcbiAgICB9LFxuXG4gICAgYmFja2ZhY2VWaXNpYmxlOiBmdW5jdGlvbih2YWx1ZSlcbiAgICB7XG4gICAgICAgIGlmKHZhbHVlKVxuICAgICAgICB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgJ2JhY2tmYWNlLXZpc2liaWxpdHknOid2aXNpYmxlJyxcbiAgICAgICAgICAgICAgICAnLXdlYmtpdC1iYWNrZmFjZS12aXNpYmlsaXR5JzondmlzaWJsZScsXG4gICAgICAgICAgICAgICAgJy1tb3otYmFja2ZhY2UtdmlzaWJpbGl0eSc6J3Zpc2libGUnLFxuICAgICAgICAgICAgICAgICctbXMtYmFja2ZhY2UtdmlzaWJpbGl0eSc6ICd2aXNpYmxlJyxcbiAgICAgICAgICAgIH07IFxuICAgICAgICB9XG4gICAgICAgIGVsc2VcbiAgICAgICAge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICdiYWNrZmFjZS12aXNpYmlsaXR5JzonaGlkZGVuJyxcbiAgICAgICAgICAgICAgICAnLXdlYmtpdC1iYWNrZmFjZS12aXNpYmlsaXR5JzonaGlkZGVuJyxcbiAgICAgICAgICAgICAgICAnLW1vei1iYWNrZmFjZS12aXNpYmlsaXR5JzonaGlkZGVuJyxcbiAgICAgICAgICAgICAgICAnLW1zLWJhY2tmYWNlLXZpc2liaWxpdHknOiAnaGlkZGVuJyxcbiAgICAgICAgICAgIH07IFxuICAgICAgICB9XG4gICAgfSwgXG5cbiAgICBjbGlwQ2lyY2xlOiBmdW5jdGlvbih4LCB5LCByKVxuICAgIHtcbiAgICAgICAgcmV0dXJuIHsnLXdlYmtpdC1jbGlwLXBhdGgnOiAnY2lyY2xlKCcreCsncHgsJyt5KydweCwnK3IrJ3B4KSd9O1xuICAgIH0sICAgICAgICBcblxuICAgIGdldFdpZHRoOiBmdW5jdGlvbigpXG4gICAgeyAgICAgICAgICAgIFxuICAgICAgICByZXR1cm4gd2luZG93LmlubmVyV2lkdGg7IFxuICAgIH0sXG5cbiAgICBnZXRIZWlnaHQ6IGZ1bmN0aW9uKClcbiAgICB7XG4gICAgICAgIHJldHVybiB3aW5kb3cuaW5uZXJIZWlnaHQ7ICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgfSxcblxuICAgIGdldENlbnRlcjogZnVuY3Rpb24oKVxuICAgIHtcbiAgICAgICAgcmV0dXJuIFtVdGlscy5nZXRXaWR0aCgpKi41LCBVdGlscy5nZXRIZWlnaHQoKSouNV07IFxuICAgIH0sXG4gICAgXG4gICAgaXNNb2JpbGU6IGZ1bmN0aW9uKCkgeyBcbiAgICAgICAgaWYoIC9BbmRyb2lkfHdlYk9TfGlQaG9uZXxpUGFkfGlQb2R8QmxhY2tCZXJyeS9pLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCkgKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSBcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0sXG5cbiAgICBpc1N0cmluZzogZnVuY3Rpb24gKG1heWJlU3RyaW5nKSB7XG4gICAgICAgIHJldHVybiAodHlwZW9mIG1heWJlU3RyaW5nID09ICdzdHJpbmcnIHx8IG1heWJlU3RyaW5nIGluc3RhbmNlb2YgU3RyaW5nKSBcbiAgICB9LFxuXG4gICAgaXNBcnJheTogZnVuY3Rpb24gKG1heWJlQXJyYXkpIHtcbiAgICAgICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCggbWF5YmVBcnJheSApID09PSAnW29iamVjdCBBcnJheV0nO1xuICAgIH0sXG5cbiAgICBleHRlbmQ6IGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgICAgZm9yKHZhciBrZXkgaW4gYikgeyBcbiAgICAgICAgICAgIGFba2V5XSA9IGJba2V5XTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYTtcbiAgICB9LFxuXG4gICAgZ2V0RGV2aWNlUGl4ZWxSYXRpbzogZnVuY3Rpb24oKVxuICAgIHtcbiAgICAgICAgcmV0dXJuICh3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbyA/IHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvIDogMSk7IFxuICAgIH0sXG5cbiAgICBzdXBwb3J0c1dlYkdMOiBmdW5jdGlvbigpXG4gICAge1xuICAgICAgICBpZiggL0FuZHJvaWR8Q2hyb21lfE1vemlsbGEvaS50ZXN0KG5hdmlnYXRvci5hcHBDb2RlTmFtZSkgJiYgISF3aW5kb3cuV2ViR0xSZW5kZXJpbmdDb250ZXh0KSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSBcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0sIFxuXG4gICAgZ2V0U3VyZmFjZVBvc2l0aW9uOiBmdW5jdGlvbiBnZXRTdXJmYWNlUG9zaXRpb24oc3VyZmFjZSkge1xuXG4gICAgICAgIHZhciBjdXJyVGFyZ2V0ID0gc3VyZmFjZS5fY3VyclRhcmdldDtcbiAgICAgICAgdmFyIHRyYW5zZm9ybXMgPSBbXTtcbiAgICAgICAgdmFyIHRvdGFsRGlzdCA9IFswLCAwLCAwXTtcblxuICAgICAgICBmdW5jdGlvbiBnZXRBbGxUcmFuc2Zvcm1zICggZWxlbSApIHtcblxuICAgICAgICAgICAgdmFyIHRyYW5zZm9ybSA9IGdldFRyYW5zZm9ybShlbGVtKTtcblxuICAgICAgICAgICAgaWYodHJhbnNmb3JtICE9PSBcIlwiICYmIHRyYW5zZm9ybSAhPT0gdW5kZWZpbmVkICkge1xuICAgICAgICAgICAgICAgIHZhciBvZmZzZXQgPSBwYXJzZVRyYW5zZm9ybSh0cmFuc2Zvcm0pO1xuXG4gICAgICAgICAgICAgICAgdG90YWxEaXN0WzBdICs9IG9mZnNldFswXTtcbiAgICAgICAgICAgICAgICB0b3RhbERpc3RbMV0gKz0gb2Zmc2V0WzFdO1xuICAgICAgICAgICAgICAgIHRvdGFsRGlzdFsyXSArPSBvZmZzZXRbMl07XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmKCBlbGVtLnBhcmVudEVsZW1lbnQgIT09IGRvY3VtZW50LmJvZHkgKSB7XG4gICAgICAgICAgICAgICAgZ2V0QWxsVHJhbnNmb3JtcyhlbGVtLnBhcmVudE5vZGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGZ1bmN0aW9uIHBhcnNlVHJhbnNmb3JtKHRyYW5zZm9ybSkge1xuICAgICAgICAgICAgdmFyIHRyYW5zbGF0ZSA9IFtdOyBcblxuICAgICAgICAgICAgdHJhbnNmb3JtID0gcmVtb3ZlTWF0cml4M2QoIHRyYW5zZm9ybSApO1xuXG4gICAgICAgICAgICB0cmFuc2xhdGVbMF0gPSBwYXJzZUludCh0cmFuc2Zvcm1bMTJdLnJlcGxhY2UoJyAnLCAnJykpOyBcbiAgICAgICAgICAgIHRyYW5zbGF0ZVsxXSA9IHBhcnNlSW50KHRyYW5zZm9ybVsxM10ucmVwbGFjZSgnICcsICcnKSk7ICAgICAgICBcbiAgICAgICAgICAgIHRyYW5zbGF0ZVsyXSA9IHBhcnNlSW50KHRyYW5zZm9ybVsxNF0ucmVwbGFjZSgnICcsICcnKSk7ICAgICAgICBcblxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0cmFuc2xhdGUubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZih0eXBlb2YgdHJhbnNsYXRlW2ldID09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgICAgIHRyYW5zbGF0ZVtpXSA9IDA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmV0dXJuIHRyYW5zbGF0ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIHJlbW92ZU1hdHJpeDNkKCBtdHhTdHJpbmcgKSB7IFxuICAgICAgICAgICAgbXR4U3RyaW5nID0gbXR4U3RyaW5nLnJlcGxhY2UoJ21hdHJpeDNkKCcsJycpO1xuICAgICAgICAgICAgbXR4U3RyaW5nID0gbXR4U3RyaW5nLnJlcGxhY2UoJyknLCcnKTtcbiAgICAgICAgICAgIHJldHVybiBtdHhTdHJpbmcuc3BsaXQoJywnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGdldFRyYW5zZm9ybSggZWxlbSApIHsgXG4gICAgICAgICAgICB2YXIgdHJhbnNmb3JtID0gZWxlbVsnc3R5bGUnXVsnd2Via2l0VHJhbnNmb3JtJ10gfHwgZWxlbVsnc3R5bGUnXVsndHJhbnNmb3JtJ10gO1xuICAgICAgICAgICAgcmV0dXJuIHRyYW5zZm9ybTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKGN1cnJUYXJnZXQpIHtcblxuICAgICAgICAgICAgZ2V0QWxsVHJhbnNmb3JtcyhjdXJyVGFyZ2V0KTtcblxuICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRvdGFsRGlzdDsgXG4gICAgfSxcblxuICAgIC8vIGdldCBjZW50ZXIgZnJvbSBbMCwgMF0gb3JpZ2luXG4gICAgZ2V0Q2VudGVyTWF0cml4OiBmdW5jdGlvbiAoIHBvcywgc2l6ZSwgeikge1xuICAgICAgICBpZih6ID09IHVuZGVmaW5lZCkgeiA9IDA7XG4gICAgICAgIHJldHVybiBGTS50cmFuc2xhdGUoIHBvc1swXSAtIHNpemVbMF0gKiAwLjUsIHBvc1sxXSAtIHNpemVbMV0gKiAwLjUsIHogKTsgXG4gICAgfSxcblxuICAgIGhhc1VzZXJNZWRpYTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiAhIShuYXZpZ2F0b3IuZ2V0VXNlck1lZGlhIHx8IG5hdmlnYXRvci53ZWJraXRHZXRVc2VyTWVkaWEgfHxcbiAgICAgICAgbmF2aWdhdG9yLm1vekdldFVzZXJNZWRpYSB8fCBuYXZpZ2F0b3IubXNHZXRVc2VyTWVkaWEpO1xuICAgIH0sXG5cbiAgICBnZXRVc2VyTWVkaWE6IGZ1bmN0aW9uKClcbiAgICB7XG4gICAgICAgIHJldHVybiBuYXZpZ2F0b3IuZ2V0VXNlck1lZGlhIHx8IG5hdmlnYXRvci53ZWJraXRHZXRVc2VyTWVkaWEgfHxcbiAgICAgICAgbmF2aWdhdG9yLm1vekdldFVzZXJNZWRpYSB8fCBuYXZpZ2F0b3IubXNHZXRVc2VyTWVkaWE7IFxuICAgIH0sIFxuXG4gICAgaXNXZWJraXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICByZXR1cm4gISF3aW5kb3cud2Via2l0VVJMOyBcbiAgICB9XG5cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gVXRpbHM7XG4iLCJ2YXIgU3VyZmFjZSA9IHJlcXVpcmUoJ2ZhbW91cy9zcmMvY29yZS9TdXJmYWNlJyk7XG52YXIgRW5naW5lID0gcmVxdWlyZSgnZmFtb3VzL3NyYy9jb3JlL0VuZ2luZScpO1xudmFyIEFwcFZpZXcgPSByZXF1aXJlKCcuL3ZpZXdzL0FwcHZpZXcnKTtcbnZhciBFYXN5Q2FtZXJhID0gcmVxdWlyZSgnLi9Db21wb25lbnRzL0Vhc3lDYW1lcmEnKTtcbnJlcXVpcmUoJy4vc3R5bGVzJyk7XG5cbnZhciBtYWluQ29udGV4dCA9IEVuZ2luZS5jcmVhdGVDb250ZXh0KCk7XG5tYWluQ29udGV4dC5zZXRQZXJzcGVjdGl2ZSgxMDAwKTtcblxudmFyIGNhbWVyYSA9IG5ldyBFYXN5Q2FtZXJhKCk7XG5cbnZhciBhcHAgPSBuZXcgQXBwVmlldygpO1xubWFpbkNvbnRleHQuYWRkKGNhbWVyYS5tb2QpLmFkZChhcHApO1xuXG53aW5kb3cuYXBwID0gYXBwO1xud2luZG93LmNvbnRleHQgPSBtYWluQ29udGV4dDtcbiIsInZhciBjc3MgPSBcImh0bWwge1xcbiAgYmFja2dyb3VuZDogI2ZmZjtcXG59XFxuXFxuLmJhY2tmYWNlVmlzaWJpbGl0eSB7XFxuICAtd2Via2l0LWJhY2tmYWNlLXZpc2liaWxpdHk6IHZpc2libGU7XFxuICBiYWNrZmFjZS12aXNpYmlsaXR5OiB2aXNpYmxlO1xcbn1cXG5cXG4uc3BoZXJle1xcbiAgICBiYWNrZ3JvdW5kLWltYWdlOiAtd2Via2l0LXJhZGlhbC1ncmFkaWVudCg0MCUgNDAlLCBjaXJjbGUgY29udGFpbiwgcmdiYSg1MCw1MCw1MCwuNCkgMTAlLCByZ2JhKDEwMCwxMDAsMTAwLC40KSAxMDAlKTtcXG4gICAgYm9yZGVyLXJhZGl1cyA6IDUwJTtcXG59XFxuXFxuLnBhcnRpY2xle1xcbiAgICBiYWNrZ3JvdW5kOiByZ2JhKDUwLDIxMCwyNTUsLjkpO1xcbiAgICAtd2Via2l0LWJveC1zaGFkb3c6IGluc2V0IDNweCAzcHggNXB4IDJweCByZ2JhKDE4NywgMjExLCAyNTUsIDAuODApLCAwcHggMHB4IDVweCByZ2JhKDAsNTAsMjU1LC45KTtcXG4gICAgYm9yZGVyLXJhZGl1czogNTAlO1xcbiAgICBjb2xvciA6IGJsYWNrO1xcbiAgICBmb250LXNpemU6IDIwcHg7XFxuICAgIGJhY2tmYWNlLXZpc2liaWxpdHkgOiB2aXNpYmxlICFpbXBvcnRhbnQ7XFxuICAgIC13ZWJraXQtYmFja2ZhY2UtdmlzaWJpbGl0eTogdmlzaWJsZSAhaW1wb3J0YW50O1xcbn1cXG5cIjsgKHJlcXVpcmUoXCIvVXNlcnMvbWljaGFlbHhpYS9GYW1vdXMvVmFuaWxsYS9jdWJlLXdhbGxzLTNkL25vZGVfbW9kdWxlcy9jc3NpZnlcIikpKGNzcyk7IG1vZHVsZS5leHBvcnRzID0gY3NzOyIsIi8vIGxvYWQgY3NzXG5yZXF1aXJlKCdmYW1vdXMvc3JjL2NvcmUvZmFtb3VzLmNzcycpO1xucmVxdWlyZSgnLi9hcHAuY3NzJyk7XG4iLCJ2YXIgVmlldyA9IHJlcXVpcmUoJ2ZhbW91cy9zcmMvY29yZS9WaWV3Jyk7XG52YXIgTW9kaWZpZXIgICAgICAgPSByZXF1aXJlKCdmYW1vdXMvc3JjL2NvcmUvTW9kaWZpZXInKTtcbnZhciBTdXJmYWNlID0gcmVxdWlyZSgnZmFtb3VzL3NyYy9jb3JlL1N1cmZhY2UnKTtcbnZhciBSZXB1bHNpb25Gb3JjZSA9IHJlcXVpcmUoJ2ZhbW91cy9zcmMvcGh5c2ljcy9mb3JjZXMvUmVwdWxzaW9uJyk7XG52YXIgVHJhbnNmb3JtID0gcmVxdWlyZSgnZmFtb3VzL3NyYy9jb3JlL1RyYW5zZm9ybScpO1xudmFyIFN0YXRlTW9kaWZpZXIgPSByZXF1aXJlKCdmYW1vdXMvc3JjL21vZGlmaWVycy9TdGF0ZU1vZGlmaWVyJyk7XG52YXIgVHJhbnNpdGlvbmFibGUgPSByZXF1aXJlKCdmYW1vdXMvc3JjL3RyYW5zaXRpb25zL1RyYW5zaXRpb25hYmxlJyk7XG52YXIgV2FsbHMgPSByZXF1aXJlKCdmYW1vdXMvc3JjL3BoeXNpY3MvY29uc3RyYWludHMvV2FsbHMnKTtcbnZhciBDb2xsaXNpb24gPSByZXF1aXJlKCdmYW1vdXMvc3JjL3BoeXNpY3MvY29uc3RyYWludHMvQ29sbGlzaW9uJyk7XG52YXIgVmVjdG9yRmllbGQgPSByZXF1aXJlKCdmYW1vdXMvc3JjL3BoeXNpY3MvZm9yY2VzL1ZlY3RvckZpZWxkJyk7XG52YXIgVmVjdG9yID0gcmVxdWlyZSgnZmFtb3VzL3NyYy9tYXRoL1ZlY3RvcicpO1xuXG52YXIgRHJhZyA9IHJlcXVpcmUoJ2ZhbW91cy9zcmMvcGh5c2ljcy9mb3JjZXMvRHJhZycpO1xudmFyIFBhcnRpY2xlID0gcmVxdWlyZSgnZmFtb3VzL3NyYy9waHlzaWNzL2JvZGllcy9QYXJ0aWNsZScpO1xudmFyIENpcmNsZSA9IHJlcXVpcmUoJ2ZhbW91cy9zcmMvcGh5c2ljcy9ib2RpZXMvQ2lyY2xlJyk7XG52YXIgQ3ViaWNWaWV3ID0gcmVxdWlyZSgnLi9DdWJpY1ZpZXcnKTtcbnZhciBQaHlzaWNzRW5naW5lID0gcmVxdWlyZSgnZmFtb3VzL3NyYy9waHlzaWNzL1BoeXNpY3NFbmdpbmUnKTtcbi8vIHZhciBNb3VzZVN5bmMgICAgID0gcmVxdWlyZShcImZhbW91cy9pbnB1dHMvTW91c2VTeW5jXCIpO1xuLy8gdmFyIFRvdWNoU3luYyAgICAgPSByZXF1aXJlKFwiZmFtb3VzL2lucHV0cy9Ub3VjaFN5bmNcIik7XG4vLyB2YXIgU2Nyb2xsU3luYyAgICA9IHJlcXVpcmUoXCJmYW1vdXMvaW5wdXRzL1Njcm9sbFN5bmNcIik7XG4vLyB2YXIgR2VuZXJpY1N5bmMgICA9IHJlcXVpcmUoXCJmYW1vdXMvaW5wdXRzL0dlbmVyaWNTeW5jXCIpO1xuXG4vLyBHZW5lcmljU3luYy5yZWdpc3Rlcih7XG4vLyAgICAgXCJtb3VzZVwiICA6IE1vdXNlU3luYyxcbi8vICAgICBcInRvdWNoXCIgIDogVG91Y2hTeW5jLFxuLy8gICAgIFwic2Nyb2xsXCIgOiBTY3JvbGxTeW5jXG4vLyB9KTtcblxuZnVuY3Rpb24gQXBwVmlldygpIHtcbiAgICBWaWV3LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cbiAgICAvLyB0aGlzLnN5bmMgPSBuZXcgR2VuZXJpY1N5bmMoe1xuICAgIC8vICAgICBcIm1vdXNlXCIgIDoge30sXG4gICAgLy8gICAgIFwidG91Y2hcIiAgOiB7fSxcbiAgICAvLyAgICAgXCJzY3JvbGxcIiA6IHtzY2FsZSA6IC41fVxuICAgIC8vIH0pO1xuICAgIFxuICAgIHRoaXMuX3BoeXNpY3NFbmdpbmUgPSBuZXcgUGh5c2ljc0VuZ2luZSgpO1xuXG4gICAgdGhpcy5fcm90YXRpb25UcmFuc2l0aW9uYWJsZSA9IG5ldyBUcmFuc2l0aW9uYWJsZShbMCwgMCwgMF0pXG5cbiAgICB0aGlzLl9yb3RhdGlvbk1vZGlmaWVyID0gbmV3IE1vZGlmaWVyKHtcbiAgICAgICAgLy8gb3JpZ2luOiBbMC41LCAwLjVdLFxuICAgICAgICAvLyBhbGlnbjogWzAuNSwgMC41XSxcbiAgICAgICAgdHJhbnNmb3JtOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBUcmFuc2Zvcm0ucm90YXRlLmFwcGx5KHRoaXMsIHRoaXMuX3JvdGF0aW9uVHJhbnNpdGlvbmFibGUuZ2V0KCkpO1xuICAgICAgICB9LmJpbmQodGhpcylcbiAgICB9KTtcblxuICAgIHRoaXMuX3Jvb3ROb2RlID0gdGhpcy5hZGQodGhpcy5fcm90YXRpb25Nb2RpZmllcik7XG5cbiAgICB2YXIgYW5jaG9yID0gbmV3IFN1cmZhY2Uoe1xuICAgICAgc2l6ZTogWzUwLCA1MF0sXG4gICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgIGJhY2tncm91bmRDb2xvcjogJ3JlZCdcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHRoaXMuYWRkKGFuY2hvcik7XG5cbiAgICBfY3JlYXRlQmFja2dyb3VuZC5jYWxsKHRoaXMpO1xuICAgIF9jcmVhdGVDdWJlLmNhbGwodGhpcyk7XG4gICAgX2NyZWF0ZVNwaGVyZXMuY2FsbCh0aGlzKTtcbiAgICBfY3JlYXRlV2FsbHMuY2FsbCh0aGlzKTtcbiAgICBfYmluZEV2ZW50cy5jYWxsKHRoaXMpO1xufVxuXG5BcHBWaWV3LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoVmlldy5wcm90b3R5cGUpO1xuQXBwVmlldy5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBBcHBWaWV3O1xuXG5BcHBWaWV3LkRFRkFVTFRfT1BUSU9OUyA9IHt9O1xuXG5mdW5jdGlvbiBfY3JlYXRlQ3ViZSgpIHtcbiAgICAvLyB2YXIgZWRnZUxlbmd0aCA9IHdpbmRvdy5pbm5lcldpZHRoIDwgd2luZG93LmlubmVySGVpZ2h0ID8gd2luZG93LmlubmVyV2lkdGggKiAwLjUgOiB3aW5kb3cuaW5uZXJIZWlnaHQgKiAwLjU7XG4gICAgdmFyIGVkZ2VMZW5ndGggPSA1MDA7XG4gICAgdmFyIGN1YmUgPSBuZXcgQ3ViaWNWaWV3KHtcbiAgICAgICAgZWRnZUxlbmd0aDogZWRnZUxlbmd0aFxuICAgIH0pO1xuICAgIC8vIGN1YmUucGlwZSh0aGlzLnN5bmMpO1xuICAgIHRoaXMuX3Jvb3ROb2RlLmFkZChjdWJlKTtcbn1cblxuZnVuY3Rpb24gX2NyZWF0ZVdhbGxzKCkge1xuICAgIHRoaXMuX3dhbGxzID0gbmV3IFdhbGxzKHtcbiAgICAgICAgcmVzdGl0dXRpb24gOiAwLjUsXG4gICAgICAgIHNpemUgOiBbNTAwLCA1MDAsIDUwMF0sXG4gICAgICAgIG9yaWdpbiA6IFswLjUsIDAuNSwgMC41XSxcbiAgICAgICAgayA6IDAuNSxcbiAgICAgICAgZHJpZnQgOiAwLjUsXG4gICAgICAgIHNsb3AgOiAwLFxuICAgICAgICBzaWRlcyA6IFdhbGxzLlNJREVTLlRIUkVFX0RJTUVOU0lPTkFMLFxuICAgICAgICBvbkNvbnRhY3QgOiBXYWxscy5PTl9DT05UQUNULlJFRkxFQ1RcbiAgICB9KTtcbiAgICBcbiAgICB0aGlzLl93YWxscy5vcHRpb25zLnNpZGVzID0gdGhpcy5fd2FsbHMuY29tcG9uZW50czsgLy8gUGF0Y2ggZm9yIGJ1ZyBpbiBXYWxscyBtb2R1bGUuXG4gICAgdGhpcy5fd2FsbHMuc2lkZXMgPSB0aGlzLl93YWxscy5jb21wb25lbnRzOyAgICAgICAgIC8vIFBhdGNoIGZvciBidWcgaW4gV2FsbHMgbW9kdWxlLlxuICAgIFxuICAgIC8vIHRoaXMuX3BoeXNpY3NFbmdpbmUuYXR0YWNoKFt0aGlzLl93YWxscywgZHJhZ10pO1xuICAgIHRoaXMuX3BoeXNpY3NFbmdpbmUuYXR0YWNoKHRoaXMuX3dhbGxzLCB0aGlzLl9zcGhlcmVzKTtcbn1cblxuZnVuY3Rpb24gIF9jcmVhdGVTcGhlcmVzKCkge1xuICAgIFxuICAgIHRoaXMuc3BoZXJlcyA9IFtdO1xuICAgIGZvcih2YXIgaT0wOyBpPDU7IGkrKykge1xuICAgICAgICB2YXIgc3BoZXJlID0gX2NyZWF0ZVNwaGVyZSgpO1xuICAgICAgICB0aGlzLl9yb290Tm9kZS5hZGQoc3BoZXJlLm1vZGlmaWVyKS5hZGQoc3BoZXJlLnN1cmZhY2UpO1xuICAgICAgICB0aGlzLl9waHlzaWNzRW5naW5lLmFkZEJvZHkoc3BoZXJlLmNpcmNsZSk7XG4gICAgICAgIHRoaXMuc3BoZXJlcy5wdXNoKHNwaGVyZS5jaXJjbGUpO1xuICAgICAgICBcbiAgICAgICAgLy8gdmFyIHNwaGVyZVIgPSAyMDtcbiAgICAgICAgLy8gdmFyIHNwaGVyZVN1cmZhY2UgPSBuZXcgU3VyZmFjZSh7XG4gICAgICAgIC8vICAgICBzaXplOiBbMipzcGhlcmVSLCAyKnNwaGVyZVJdLFxuICAgICAgICAvLyAgICAgY2xhc3NlczogWydwYXJ0aWNsZSddLFxuICAgICAgICAvLyAgICAgcHJvcGVydGllczoge1xuICAgICAgICAvLyAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJ2JsdWUnXG4gICAgICAgIC8vICAgICB9XG4gICAgICAgIC8vIH0pO1xuXG4gICAgICAgIC8vIHZhciBzcGhlcmVQYXJ0aWNsZSA9IG5ldyBDaXJjbGUoe1xuICAgICAgICAvLyAgIHJhZGl1czogMjVcbiAgICAgICAgLy8gfSk7XG4gICAgICAgIFxuICAgICAgICAvLyB2YXIgc3BoZXJlTW9kaWZpZXIgPSBuZXcgTW9kaWZpZXIoe1xuICAgICAgICAvLyAgICAgc2l6ZTogWzIqc3BoZXJlUiwgMipzcGhlcmVSXSxcbiAgICAgICAgLy8gICAgIGFsaWduOiBbMC41LCAwLjVdLFxuICAgICAgICAvLyAgICAgb3JpZ2luOiBbMC41LCAwLjVdLFxuICAgICAgICAvLyAgICAgdHJhbnNmb3JtOiBmdW5jdGlvbigpIHtcbiAgICAgICAgLy8gICAgICAgICByZXR1cm4gc3BoZXJlUGFydGljbGUuZ2V0VHJhbnNmb3JtKCk7XG4gICAgICAgIC8vICAgICB9XG4gICAgICAgIC8vIH0pO1xuXG4gICAgICAgIC8vIHRoaXMuX3BoeXNpY3NFbmdpbmUuYWRkQm9keShzcGhlcmVQYXJ0aWNsZSk7XG4gICAgICAgIC8vIHRoaXMuc3BoZXJlcy5wdXNoKHNwaGVyZVBhcnRpY2xlKTtcbiAgICAgICAgLy8gc3BoZXJlUGFydGljbGUuc2V0VmVsb2NpdHkoMC4yLCAwLCAwKTtcbiAgICAgICAgLy8gdGhpcy5fcm9vdE5vZGUuYWRkKHNwaGVyZU1vZGlmaWVyKS5hZGQoc3BoZXJlU3VyZmFjZSk7XG5cbiAgICAgICAgLy8gdmFyIGdyYXZpdHkgPSBuZXcgUmVwdWxzaW9uRm9yY2Uoe1xuICAgICAgICAvLyAgICAgc3RyZW5ndGg6IC01XG4gICAgICAgIC8vIH0pO1xuXG4gICAgICAgIC8vIHZhciBncmF2aXR5ID0gbmV3IFZlY3RvckZpZWxkKHtcbiAgICAgICAgLy8gICAgIHN0cmVuZ3RoIDogMC4wMDVcbiAgICAgICAgLy8gfSk7XG4gICAgICAgIC8vIHRoaXMuX3BoeXNpY3NFbmdpbmUuYXR0YWNoKGdyYXZpdHksIHNwaGVyZVBhcnRpY2xlLCBhbmNob3JQYXJ0aWNsZSk7XG4gICAgfVxuXG59XG5cbmZ1bmN0aW9uIF9jcmVhdGVTcGhlcmUoKSB7XG4gICAgdmFyIGNpcmNsZSA9IG5ldyBDaXJjbGUoe1xuICAgICAgcmFkaXVzOiAyNVxuICAgIH0pO1xuXG4gICAgY2lyY2xlLmFwcGx5Rm9yY2UobmV3IFZlY3RvcihNYXRoLnJhbmRvbSgpICogMC4wMSwgTWF0aC5yYW5kb20oKSAqIDAuMDEsIDApKTtcblxuICAgIHZhciBzdXJmYWNlID0gbmV3IFN1cmZhY2Uoe1xuICAgICAgc2l6ZTogWzUwLCA1MF0sXG4gICAgICBjbGFzc2VzOiBbJ3BhcnRpY2xlJ10sXG4gICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgIGJhY2tncm91bmRDb2xvciA6ICdibHVlJ1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdmFyIG1vZGlmaWVyID0gbmV3IE1vZGlmaWVyKHtcbiAgICAgIGFsaWduOiBbMC41LCAwLjVdLFxuICAgICAgb3JpZ2luOiBbMC41LCAwLjVdLFxuICAgICAgc2l6ZTogWzUwLCA1MF0sXG4gICAgICB0cmFuc2Zvcm06IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gY2lyY2xlLmdldFRyYW5zZm9ybSgpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIGNpcmNsZTogY2lyY2xlLFxuICAgICAgbW9kaWZpZXI6IG1vZGlmaWVyLFxuICAgICAgc3VyZmFjZTogc3VyZmFjZVxuICAgIH07XG59XG5cbmZ1bmN0aW9uIF9jcmVhdGVCYWNrZ3JvdW5kKCkge1xuICAgIHRoaXMuX2JhY2tncm91bmRTdXJmYWNlID0gbmV3IFN1cmZhY2Uoe1xuICAgICAgICBzaXplOiBbdW5kZWZpbmVkLCB1bmRlZmluZWRdXG4gICAgfSlcbiAgICAvLyB0aGlzLl9iYWNrZ3JvdW5kU3VyZmFjZS5waXBlKHRoaXMuc3luYyk7XG4gICAgdGhpcy5hZGQodGhpcy5fYmFja2dyb3VuZFN1cmZhY2UpO1xufVxuXG5mdW5jdGlvbiBfYmluZEV2ZW50cygpIHtcbiAgICAvLyB0aGlzLnN5bmMub24oJ3N0YXJ0JywgZnVuY3Rpb24oZGF0YSl7XG4gICAgLy8gICAgIGNvbnNvbGUubG9nKCdzdGFydCcsIGRhdGEuZGVsdGEpO1xuICAgIC8vIH0pO1xuXG4gICAgLy8gdGhpcy5zeW5jLm9uKCd1cGRhdGUnLCBmdW5jdGlvbihkYXRhKXtcbiAgICAvLyAgICAgdmFyIGRYID0gZGF0YS5kZWx0YVswXTtcbiAgICAvLyAgICAgdmFyIGRZID0gZGF0YS5kZWx0YVsxXTtcblxuICAgIC8vICAgICB2YXIgb2xkX3JvdGF0aW9uID0gdGhpcy5fcm90YXRpb25UcmFuc2l0aW9uYWJsZS5nZXQoKTtcbiAgICAvLyAgICAgLy9jbGFtcCBmb3Igbm93LiAgXG4gICAgLy8gICAgIGlmKE1hdGguYWJzKG9sZF9yb3RhdGlvblswXSAtIGRZLzEwMCkgPD0gMSkgb2xkX3JvdGF0aW9uWzBdIC09IGRZLzEwMDtcbiAgICAvLyAgICAgb2xkX3JvdGF0aW9uWzFdICs9IGRYLzEwMDtcbiAgICAvLyB9LmJpbmQodGhpcykpO1xuXG4gICAgLy8gdGhpcy5zeW5jLm9uKCdlbmQnLCBmdW5jdGlvbihkYXRhKXtcbiAgICAvLyAgICAgY29uc29sZS5sb2coJ2VuZCcsIGRhdGEuZGVsdGEpO1xuICAgIC8vIH0pO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEFwcFZpZXc7XG4iLCJ2YXIgVmlldyAgICAgICAgICAgPSByZXF1aXJlKCdmYW1vdXMvc3JjL2NvcmUvVmlldycpO1xudmFyIFN1cmZhY2UgICAgICAgID0gcmVxdWlyZSgnZmFtb3VzL3NyYy9jb3JlL1N1cmZhY2UnKTtcbnZhciBUcmFuc2Zvcm0gICAgICA9IHJlcXVpcmUoJ2ZhbW91cy9zcmMvY29yZS9UcmFuc2Zvcm0nKTtcbnZhciBNb2RpZmllciAgICAgICA9IHJlcXVpcmUoJ2ZhbW91cy9zcmMvY29yZS9Nb2RpZmllcicpO1xudmFyIFRyYW5zaXRpb25hYmxlID0gcmVxdWlyZSgnZmFtb3VzL3NyYy90cmFuc2l0aW9ucy9UcmFuc2l0aW9uYWJsZScpO1xudmFyIFN0YXRlTW9kaWZpZXIgID0gcmVxdWlyZSgnZmFtb3VzL3NyYy9tb2RpZmllcnMvU3RhdGVNb2RpZmllcicpO1xudmFyIEVhc2luZyAgICAgICAgID0gcmVxdWlyZSgnZmFtb3VzL3NyYy90cmFuc2l0aW9ucy9FYXNpbmcnKTtcbnZhciBFdmVudEhhbmRsZXIgICA9IHJlcXVpcmUoJ2ZhbW91cy9zcmMvY29yZS9FdmVudEhhbmRsZXInKTtcblxudmFyIE5JTkVUWV9ERUdSRVNTID0gTWF0aC5QSS8yO1xuXG52YXIgRkFDRV9ST1RBVElPTlMgPSBbXG4gICAgWzAsIDAsIDBdLCAgICAgICAgICAgICAgICAgICAgLy9GUk9OVFxuICAgIFstTklORVRZX0RFR1JFU1MsIDAsIDBdLCAgICAgIC8vTEVGVFxuICAgIFtOSU5FVFlfREVHUkVTUywgMCwgMF0sICAgICAgIC8vUklHSFRcbiAgICBbMCwgLU5JTkVUWV9ERUdSRVNTLCAwXSwgICAgICAvL0JPVFRPTVxuICAgIFswLCBOSU5FVFlfREVHUkVTUywgMF0sICAgICAgIC8vVE9QIFxuICAgIFsyICogTklORVRZX0RFR1JFU1MsIDAsIDBdLCAgIC8vQkFDSyAgXG5dXG5cbmZ1bmN0aW9uIEN1YmljVmlldygpIHtcbiAgICBWaWV3LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cbiAgICB0aGlzLl9jdWJlUm90YXRpb25TdGF0ZSA9IG5ldyBUcmFuc2l0aW9uYWJsZShbMCwgMCwgMF0pO1xuICAgIHRoaXMuX2N1YmVUcmFuc2xhdGlvblN0YXRlID0gbmV3IFRyYW5zaXRpb25hYmxlKFswLCAwLCAwXSk7XG5cbiAgICB0aGlzLl9mYWNlcyA9IFtdO1xuXG4gICAgdGhpcy5fcm90YXRpb25Nb2RpZmllciA9IG5ldyBNb2RpZmllcih7XG4gICAgICAgIC8vIGFsaWduOiBbMC41LCAwLjVdLFxuICAgICAgICAvLyBvcmlnaW46IFswLjUsIDAuNV0sXG4gICAgICAgIHRyYW5zZm9ybTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgc3RhdGUgPSB0aGlzLl9jdWJlUm90YXRpb25TdGF0ZS5nZXQoKTtcbiAgICAgICAgICAgIC8vIHJldHVybiBUcmFuc2Zvcm0ucm90YXRlKHN0YXRlWzBdLCBzdGF0ZVsxXSwgc3RhdGVbMl0pO1xuICAgICAgICAgICAgcmV0dXJuIFRyYW5zZm9ybS5yb3RhdGUuYXBwbHkodGhpcywgc3RhdGUpO1xuICAgICAgICB9LmJpbmQodGhpcylcbiAgICB9KTtcblxuICAgIHRoaXMuX3RyYW5zbGF0aW9uTW9kaWZpZXIgPSBuZXcgTW9kaWZpZXIoe1xuICAgICAgICB0cmFuc2Zvcm0gOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgc3RhdGUgPSB0aGlzLl9jdWJlVHJhbnNsYXRpb25TdGF0ZS5nZXQoKTtcbiAgICAgICAgICAgIHJldHVybiBUcmFuc2Zvcm0udHJhbnNsYXRlLmFwcGx5KHRoaXMsIHN0YXRlKTtcbiAgICAgICAgfS5iaW5kKHRoaXMpXG4gICAgfSlcblxuICAgIHRoaXMuX3Jvb3ROb2RlID0gdGhpcy5hZGQodGhpcy5fdHJhbnNsYXRpb25Nb2RpZmllcikuYWRkKHRoaXMuX3JvdGF0aW9uTW9kaWZpZXIpO1xuICAgIFxuICAgIF9jcmVhdGVDdWJlLmNhbGwodGhpcyk7XG59XG5cbkN1YmljVmlldy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFZpZXcucHJvdG90eXBlKTtcbkN1YmljVmlldy5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBDdWJpY1ZpZXc7XG5cbkN1YmljVmlldy5ERUZBVUxUX09QVElPTlMgPSB7XG4gICAgZWRnZUxlbmd0aCA6IDUwLFxuICAgIHRyYW5zbGF0aW9uIDogMjVcbn07XG5cbmZ1bmN0aW9uIF9jcmVhdGVDdWJlKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBmb3IodmFyIGk9MDsgaTxGQUNFX1JPVEFUSU9OUy5sZW5ndGg7IGkrKyl7XG4gICAgICAgIFxuICAgICAgICB2YXIgZmFjZSA9IF9jcmVhdGVGYWNlLmNhbGwodGhpcywgaSk7XG4gICAgICAgIHZhciBmYWNlTW9kaWZpZXIgPSBuZXcgTW9kaWZpZXIoe1xuICAgICAgICAgICAgb3BhY2l0eTogMC41LFxuICAgICAgICAgICAgdHJhbnNmb3JtOiBUcmFuc2Zvcm0ubXVsdGlwbHkoXG4gICAgICAgICAgICAgICAgVHJhbnNmb3JtLnJvdGF0ZS5hcHBseShzZWxmLCBGQUNFX1JPVEFUSU9OU1tpXSksXG4gICAgICAgICAgICAgICAgVHJhbnNmb3JtLnRyYW5zbGF0ZSgwLCAwLCB0aGlzLm9wdGlvbnMuZWRnZUxlbmd0aCAqIDAuNSlcbiAgICAgICAgICAgIClcbiAgICAgICAgfSk7XG5cbiAgICAgICAgc2VsZi5fZmFjZXMucHVzaChmYWNlKTtcbiAgICAgICAgc2VsZi5fcm9vdE5vZGUuYWRkKGZhY2VNb2RpZmllcikuYWRkKGZhY2UpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gX2NyZWF0ZUZhY2UoaW5kZXgpIHtcbiAgICB2YXIgZmFjZSA9IG5ldyBTdXJmYWNlKHtcbiAgICAgIGNvbnRlbnQ6ICcnLFxuICAgICAgY2xhc3NlczogWydiYWNrZmFjZVZpc2liaWxpdHknXSxcbiAgICAgIHNpemU6IFt0aGlzLm9wdGlvbnMuZWRnZUxlbmd0aCwgdGhpcy5vcHRpb25zLmVkZ2VMZW5ndGhdLFxuICAgICAgcHJvcGVydGllczoge1xuICAgICAgICB0ZXh0QWxpZ246ICdjZW50ZXInLFxuICAgICAgICBsaW5lSGVpZ2h0OiAnNzBweCcsXG4gICAgICAgIGZvbnRTaXplOiAnMzVweCcsXG4gICAgICAgIGJvcmRlcjogJzJweCBzb2xpZCBibGFjaycsXG4gICAgICAgIGJhY2tncm91bmRDb2xvcjogJ2hzbCgnICsgKGluZGV4ICogMjAgKyAxMjApICsgJywgMTAwJSwgMzAlKSdcbiAgICAgIH1cbiAgICB9KTtcbiAgICBmYWNlLnBpcGUodGhpcy5fZXZlbnRPdXRwdXQpO1xuICAgIHJldHVybiBmYWNlO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEN1YmljVmlldztcbiJdfQ==
