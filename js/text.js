/////////////////////////////////////////////////////////////
// Autor: Nergal
// Date: 2014-01-31
/////////////////////////////////////////////////////////////
"use strict";

/////////////////////////////////////////////////////////////
// Text with srpites base 'class'
/////////////////////////////////////////////////////////////
function Text() {
    this.mesh = undefined;
    this.max_height;
    this.parent = undefined;

    Text.prototype.Create = function(arg) {
	if(arg.max_y == undefined) {
	    this.max_height = 80;
	} else {
	    this.max_height = arg.max_y;
	}
	this.parent = arg.object;
	var sprite = this.makeTextSprite(arg);
	if(arg.scale == undefined) {
	    sprite.scale.set(1, 1, 1);
	} else {
	    sprite.scale.set(arg.scale, arg.scale, arg.scale);
	}
	arg.object.add(sprite);
	this.mesh = sprite;
	billboards.push(this.mesh);
    };
    

    Text.prototype.Draw = function(time, delta, index) {
	this.mesh.position.y += 30*delta;

	if(this.mesh.position.y > this.max_height) {
	    this.parent.remove(this.mesh);
	    objects.splice(index, 1);
	}
    };  

    Text.prototype.makeTextSprite = function(arg) {
	var message = " " + arg.text + " ";
	var fontface = "verdana";
	var fontsize = 40;
	var canvas = document.createElement('canvas');
	var context = canvas.getContext('2d');
	context.font = "Bold " + fontsize + "px " + fontface;
	
	// get size data (height depends only on font size)
	var metrics = context.measureText( message );
	var textWidth = metrics.width;

	context.fillStyle = arg.color;
	//context.fillText( message, textWidth/2, 50, textWidth)
	context.fillText( message, 0, 40, textWidth/1.5);

	// canvas contents will be used for a texture
	var texture = new THREE.Texture(canvas) 
	texture.needsUpdate = true;

	var spriteMaterial = new THREE.MeshPhongMaterial({
	    map: texture,
	    specular: 0xFFFFFF,
	    color: 0xFFFFFF,
	    depthWrite: false,
	    ambient: 0x00FFAA,
	    side: THREE.DoubleSide,
	    transparent: true,
	});
	
	//var sprite = new THREE.Sprite(spriteMaterial);

	var plane = new THREE.Mesh(new THREE.PlaneGeometry(message.length*2, 15), spriteMaterial);
	//plane.applyMatrix( new THREE.Matrix4().makeRotationFromEuler( new THREE.Euler( Math.PI / 2, Math.PI, 0 ) ) );
	plane.position.set(-message.length/4, arg.y, 0);
	plane.rotation.set(0, Math.PI, 0);
//	plane.position.set(0, arg.y, 0);
	return plane;
    };
    
    Text.prototype.roundRect = function(ctx, x, y, w, h, r) {
	ctx.beginPath();
	ctx.moveTo(x+r, y);
	ctx.lineTo(x+w-r, y);
	ctx.quadraticCurveTo(x+w, y, x+w, y+r);
	ctx.lineTo(x+w, y+h-r);
	ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
	ctx.lineTo(x+r, y+h);
	ctx.quadraticCurveTo(x, y+h, x, y+h-r);
	ctx.lineTo(x, y+r);
	ctx.quadraticCurveTo(x, y, x+r, y);
	ctx.closePath();
	ctx.fill();
	ctx.stroke();   
    };
};
