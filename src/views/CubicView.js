var View           = require('famous/core/View');
var Surface        = require('famous/core/Surface');
var Transform      = require('famous/core/Transform');
var Modifier       = require('famous/core/Modifier');
var Transitionable = require('famous/transitions/Transitionable');
var StateModifier  = require('famous/modifiers/StateModifier');
var Easing         = require('famous/transitions/Easing');
var EventHandler   = require('famous/core/EventHandler');

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
