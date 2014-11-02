var Modifier       = require('famous/core/Modifier');
var FamousEngine = require('famous/core/Engine'); 
var Utils = require('./Utils'); 
var FM = require('./OldMatrix');    
var Vector = require('famous/math/Vector');
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

