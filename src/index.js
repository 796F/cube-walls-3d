var Surface = require('famous/core/Surface');
var Engine = require('famous/core/Engine');
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
