/* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at http://mozilla.org/MPL/2.0/.
*
* Owner: david@famo.us
*/

var Transitionable = require('famous/transitions/Transitionable');
var Transform = require('famous/core/Transform');
var Utility = require('famous/utilities/Utility');

/**
 * @class Camera
 * @description
 * Can affect the skew, rotation, scale, and translation of linked renderables.
 * @constructor
 */
function Camera(transform) {
    this._renderTransform = Transform.identity;
    
    this._scaleState = new Transitionable([1, 1, 1]);
    this._skewState = new Transitionable([0, 0, 0]);
    this._rotateState = new Transitionable([0, 0, 0]);
    this._translateState = new Transitionable([0, 0, 0]);

    this._dirty = false;

    if(transform) this.lookAt(transform);
}

Camera.prototype.halt = function() {
    this._scaleState.halt();
    this._skewState.halt();
    this._rotateState.halt();
    this._translateState.halt();
};

Camera.prototype.getScale = function() {
    return this._scaleState.get();
};

Camera.prototype.setScale = function(scale, transition, callback) {
    this._dirty = true;
    return this._scaleState.set(scale, transition, callback);
};

Camera.prototype.getSkew = function() {
    return this._skewState.get();
};

Camera.prototype.setSkew = function(skew, transition, callback) {
    this._dirty = true;
    return this._skewState.set(skew, transition, callback);
};

Camera.prototype.getRotation = function() {
    return this._rotateState.get();
};

Camera.prototype.setRotation = function(rotation, transition, callback) {
    this._dirty = true;
    return this._rotateState.set(rotation, transition, callback);
};

Camera.prototype.getPos = function() {
    return this._translateState.get();
};

Camera.prototype.setPos = function(pos, transition, callback) {
    this._dirty = true;
    return this._translateState.set(pos, transition, callback);
};

Camera.prototype.lookAt = function(matrix, transition, callback) {
    var onceCb = undefined;
    if(callback) onceCb = Utility.after(4, callback);
    this.halt();
    var endInterp = Transform.interpret(matrix);
    this.setScale(endInterp.scale, transition, onceCb);
    this.setSkew(endInterp.skew, transition, onceCb);
    this.setRotation(endInterp.rotate, transition, onceCb);
    this.setPos(endInterp.translate, transition, onceCb);
};

function _calculateRenderTransform() {
    var scaleTransform = Transform.scale.apply(this, this._scaleState.get());
    var skewTransform = Transform.skew.apply(this, this._skewState.get());
    var rotateTransform = Transform.rotate.apply(this, this._rotateState.get());
    var resultTransform = Transform.thenMove(Transform.multiply(Transform.multiply(scaleTransform, skewTransform), rotateTransform), this._translateState.get());
    return Transform.inverse(resultTransform);
};

Camera.prototype.modify = function(input) {
    this._dirty |= this._scaleState.isActive() || this._skewState.isActive() || this._rotateState.isActive() || this._translateState.isActive();
    if(this._dirty) {
        this._renderTransform = _calculateRenderTransform.call(this);
        this._dirty = false;
    }
    return {
        transform: this._renderTransform,
        group: true,
        target: input
    };
};

module.exports = Camera;

