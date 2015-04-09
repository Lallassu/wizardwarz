/////////////////////////////////////////////////////////////
// Autor: Nergal
// Date: 2013-11-27
/////////////////////////////////////////////////////////////
"use strict";
/////////////////////////////////////////////////////////////
// Objects base 'class'
/////////////////////////////////////////////////////////////
function Object3D() {
    // THREE.Mesh.apply(this, arguments); inherite from mesh
    this.mesh;
    this.time;

    Object3D.prototype.GetObject = function() {
	return this.mesh;
    };

    Object3D.prototype.Draw = function() {
	//draw object
    };
    
    Object3D.prototype.AddToScene = function(scene) {
	scene.add(this.mesh);
    };
}

/////////////////////////////////////////////////////////////
// Water
/////////////////////////////////////////////////////////////
function Water() {
    Object3D.call(this);
    
    Water.prototype.Create = function(scene) {
	var geometry = new THREE.PlaneGeometry( 15000, 15000, 128 - 1, 128 - 1 );
	geometry.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );
	geometry.dynamic = true;
	
	var i, j, il, jl;
	for ( i = 0, il = geometry.vertices.length; i < il; i ++ ) {
	    geometry.vertices[ i ].y = 35 * Math.sin( i/2 );
	}
	
	geometry.computeFaceNormals();
	geometry.computeVertexNormals();

	var texture2 = THREE.ImageUtils.loadTexture( "textures/water4.jpg" );
	texture2.wrapS = texture2.wrapT = THREE.RepeatWrapping;
	texture2.repeat.set( 32, 32 );
	
	// two types of water
	//var material = new THREE.MeshBasicMaterial( { color: 0x00CCFF, map: texture, transparent: true, opacity: 0.3} );
	var material2 = new THREE.MeshPhongMaterial( { color: 0x00CCFF, 
						       map: texture2,
						       transparent: true, 
						       opacity: 0.4, 
						       shininess: 50.0,
						       ambient: 0x555555,
						       emissive: 0x555555,
						       specular: 0x000000,
						       depthWrite: false,
						       depthTest: true,
						    } );

	var mesh = new THREE.Mesh(geometry, material2);
	mesh.position.set(0,60,0);

	this.mesh = mesh;
	scene.add(this.mesh);
    };

    Water.prototype.Draw = function(time, delta, index) {
	for ( var i = 0, l = this.mesh.geometry.vertices.length; i < l; i ++ ) {
	    this.mesh.geometry.vertices[ i ].y = 3.1 * Math.sin( i / 10 + ( time + i ) / 7 );    
	    this.mesh.geometry.vertices[ i ].y += 1.8 * Math.sin( i / 10 + ( time + i ) / 4 );
	}
	this.mesh.geometry.verticesNeedUpdate = true;
    };
}
Water.prototype = new Object3D();
Water.prototype.constructor = Water;

/////////////////////////////////////////////////////////////
// Tree
/////////////////////////////////////////////////////////////
function Tree() {
    Object3D.call(this);
    Tree.prototype.type = "tree";
    this.id;
    this.burn = undefined;

    Tree.prototype.Burn = function() {
	if(this.burn != undefined) {
	    if(this.burn.alive) {
		return;
	    }
	}
	soundLoader.PlaySound("fire", this.mesh.position, 1000);

	// TBD: handle so that a tree doesn't burn multiple times.
	//this.burns = 1;
	var vector = new THREE.Vector3(0, 0, 0);
	var particleGroup = new SPE.Group({
            texture: THREE.ImageUtils.loadTexture('textures/star.png'),
            maxAge: 1
        });
	
        var emitter = new SPE.Emitter({
	    position: new THREE.Vector3(vector.x, vector.y+(20-Math.random()*20), vector.z),
            positionSpread: new THREE.Vector3( 10, 60, 10 ),
	    
            acceleration: new THREE.Vector3(2, 5, 2),
            accelerationSpread: new THREE.Vector3( 5, 20, 5 ),
	    
            velocity: new THREE.Vector3(10, 35, 10),
            velocitySpread: new THREE.Vector3(10, 7.5, 10),
	    
            colorStart: new THREE.Color('orange'),
            colorEnd: new THREE.Color('red'),

	    duration: 4,
            sizeStart: 50,
            sizeEnd: 20,
            particleCount: 2500
        });

        particleGroup.addEmitter( emitter );
	this.mesh.add(particleGroup.mesh);
	objects.push(particleGroup);
	this.burn = particleGroup;
    };    

    Tree.prototype.Hit = function(dmg, index) {
	net.send_TreeHit(this.id);
	this.Burn();
    };

    Tree.prototype.Create = function(x, y, z, s, id) {
	var group = new THREE.Object3D();
	var combined = new THREE.Geometry();
	this.id = id;
	
	// Create leaves
	var texture = THREE.ImageUtils.loadTexture( "textures/leaves2.png" );
	texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
	texture.repeat.set( 1, 1 );
	var tree_material = new THREE.MeshLambertMaterial( { color: 0xFFFFFF, ambient: 0x00FFAA, map: texture } ); // 336633
	for(var i = 0; i < 5; i++) {
	    var object = new THREE.Mesh( new THREE.SphereGeometry( 15, 15, 5 ), tree_material );
	    object.position.set( Math.random()*13, Math.random()*15+15, Math.random()*13);
	    THREE.GeometryUtils.merge(combined, object);
	   // combined.geometry.merge(object);
	}
	var mesh = new THREE.Mesh(combined, tree_material);

//	mesh.castShadow = true;
//	mesh.receiveShadow = true;
	group.add(mesh);

	// Create tree-base
	var texture = THREE.ImageUtils.loadTexture( "textures/wood1.jpg" );
	texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
	texture.repeat.set( 2, 2 );
	var base_material = new THREE.MeshLambertMaterial( { color: 0x996600, map: texture} ); // 996600
	var object = new THREE.Mesh( new THREE.CylinderGeometry( 2, 7, 35, 20, 5, true ), base_material);
	object.position.set( 5, 0, 5 );
	//object.castShadow = true;
	//object.receiveShadow = true;
	group.add( object );
	group.scale.set(s, s, s);
	group.position.set(x, y ,z);
	this.mesh = group;
	CreateBoundingBox(this);
	scene.add(group);
    };

    Tree.prototype.Draw = function(time, delta , index) {
	
    };
}
Tree.prototype = new Object3D();
Tree.prototype.constructor = Tree;

/////////////////////////////////////////////////////////////
// Question box
/////////////////////////////////////////////////////////////
function SpellBook() {
    Object3D.call(this);
    this.remove = 0;
    this.id;
    this.speed = 0;
    SpellBook.prototype.type = "spellbook";

    SpellBook.prototype.Remove = function() {
	scene.remove(this.mesh);
	// delete collision_objects[this.id];
	this.remove = 1;
    };

    SpellBook.prototype.Hit = function(dmg, i, player) {
	if(this.remove) {
	    return;
	}
	scene.remove(this.mesh);
	this.remove =  1;
	collision_objects.splice(i, 1);
	net.send_SpellBookHit(this.id);
    };

    SpellBook.prototype.Create = function(x, y, z, id, s) {
	this.speed = 3;
	this.id = id;
	var type = Math.round(1+Math.random()*6);
	var texture = THREE.ImageUtils.loadTexture( "models/Crates/book/texture"+type+".jpg" );
	texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
	texture.repeat.set( 1, 1 );
	var object = modelLoader.GetModel('book');
	var material = new THREE.MeshPhongMaterial( { map: texture, 
						      emissive: 0x888888,
						      color: 0x888888,
						      specular: 0x888888,
						      ambient: 0x888888,
						      shininess: 2} );
	object.material = material;

	object.position.set( x, y, z );
	object.scale.set(s,s,s);
	object.rotation.set(0,  Math.random()*Math.PI, 0);
	//object.castShadow = true;
	//object.receiveShadow = true;
	this.mesh = object;
	soundLoader.PlaySound("swoosh", this.mesh.position, 1000);
	CreateBoundingBox(this);
	scene.add(object);
	
	// Creation effect
	var vector = new THREE.Vector3(0, 0, 0);
	var particleGroup = new SPE.Group({
            texture: THREE.ImageUtils.loadTexture('textures/star.png'),
            maxAge: 5
        });
	
        var emitter = new SPE.Emitter({
	    position: new THREE.Vector3(0, 0, 0),
            positionSpread: new THREE.Vector3( 0, 0, 0 ),

            acceleration: new THREE.Vector3(0, 10, 0),
            accelerationSpread: new THREE.Vector3( 10, 0, 10 ),

            velocity: new THREE.Vector3(0, 15, 0),
            velocitySpread: new THREE.Vector3(10, 7.5, 10),

            colorStart: new THREE.Color('black'),
            colorEnd: new THREE.Color('white'),

	    duration: 1.5,
            sizeStart: 4,
            sizeEnd: 1,
	    speed: 10,
            particleCount: 1000
        });

        particleGroup.addEmitter( emitter );
	this.mesh.add(particleGroup.mesh);
	objects.push(particleGroup);
    };

    SpellBook.prototype.Draw = function(time, delta, index) {
	this.mesh.rotation.y = (time/this.speed);
    };
}
SpellBook.prototype = new Object3D();
SpellBook.prototype.constructor = SpellBook;

/////////////////////////////////////////////////////////////
// Potions
/////////////////////////////////////////////////////////////
function Potion() {
    Object3D.call(this);
    this.remove = 0;
    this.id;
    this.speed = 0;
    this.particle = undefined;

    Potion.prototype.Remove = function() {
	scene.remove(this.mesh);
	// delete collision_objects[this.id];
	this.remove = 1;
    };

    Potion.prototype.Hit = function(dmg, i, player) {
	if(this.remove) {
	    return;
	}
	this.particle.destroy();
	scene.remove(this.mesh);
	this.remove =  1;
	collision_objects.splice(i, 1);
	if(this.type == "health") {
	    net.send_HealthPotionHit(this.id);
	} else if(this.type == "power") {
	    net.send_PowerPotionHit(this.id);	    
	}
    };

    Potion.prototype.Create = function(x, y, z, id, s, type) {
	this.type = type; // power, health
	this.speed = 3+Math.random()*3;
	this.id = id;

	var object;
	var color;
	var offset;
	if(type == "health") {
	    object = modelLoader.GetModel('health');
	    color = "red";
	    offset = 1;
	} else if(type == "power") {
	    object = modelLoader.GetModel('power');
	    color = "blue";
	    offset = 0;
	}

//	this.animation = new THREE.MorphAnimation( object );
//	this.animation.play();
	    
	object.position.set( x, y, z );
	object.scale.set(s,s,s);
	object.rotation.set(0,  0, Math.PI/6);
	//object.castShadow = true;
	//object.receiveShadow = true;
	this.mesh = object;
	soundLoader.PlaySound("swoosh", this.mesh.position, 1000);
	CreateBoundingBox(this);
	scene.add(object);

	// Effect
	var particleGroup = new SPE.Group({
            texture: THREE.ImageUtils.loadTexture('textures/smokeparticle.png'),
            maxAge: 1
        });

        var emitter = new SPE.Emitter({
	    position: new THREE.Vector3(0, offset, 0),
            positionSpread: new THREE.Vector3( 0, 0, 0 ),
	    
            acceleration: new THREE.Vector3(0, -3, 0),
            accelerationSpread: new THREE.Vector3( 3, 0, 3 ),
	    
            velocity: new THREE.Vector3(0, 1, 0),
            velocitySpread: new THREE.Vector3(2, 7.5, 5),
	    
            colorStart: new THREE.Color(color),
            colorEnd: new THREE.Color(color),
	    
            sizeStart: 1,
            sizeEnd: 5,
            particleCount: 150
        });
	
        particleGroup.addEmitter( emitter );
	objects.push(particleGroup);
	this.particle = particleGroup;
	this.mesh.add( particleGroup.mesh );

	/*
	// Creation effect
	var burn = new ParticleEngine();
	var vector = new THREE.Vector3(0,0,0);
	burn.setValues(
	    {
		positionStyle    : Type.SPHERE,
		positionBase   : new THREE.Vector3(vector.x,
						   vector.y+(2.5-Math.random()*5),
						   vector.z),
		positionRadius : 2,
		
		velocityStyle  : Type.CUBE,
		velocityBase   : new THREE.Vector3(0,10,0),
		velocitySpread : new THREE.Vector3(5,0,5),
		
		particleTexture : THREE.ImageUtils.loadTexture( 'textures/smokeparticle.png' ),
		
		sizeTween    : new Tween( [0, 0.3, 1.2], [0.1, 15, 1] ),
		opacityTween : new Tween( [0.9, 1.5], [1, 0] ),
		colorBase    : new THREE.Vector3(1.5, 0.2, 1.4),
		colorTween   : new Tween( [0.5, 1.0], [ new THREE.Vector3(0.42, 1.0, 1.5), new THREE.Vector3(0.25, 1.4, 1) ] ),
		blendStyle : THREE.AdditiveBlending,  
		
		speedBase     : 0.5,
		speedSpread   : 2,

		particlesPerSecond : 80,
		particleDeathAge   : 0.5,		
		emitterDeathAge    : 1.5

	    });
	burn.initialize(this.mesh);
	objects.push(burn);
*/
    };

    Potion.prototype.Draw = function(time, delta, index) {
	this.mesh.rotation.y = (time/this.speed);
//	if (this.animation) {
//	    this.animation.update(delta);
//	}

    };
}
Potion.prototype = new Object3D();
Potion.prototype.constructor = Potion;

/////////////////////////////////////////////////////////////
// Clouds
/////////////////////////////////////////////////////////////
function Cloud() {
    Object3D.call(this);

    Cloud.prototype.Create = function(x ,y ,z, s, scene) {
/*
	var group = new THREE.Object3D();
	var combined = new THREE.Geometry();
	var texture = THREE.ImageUtils.loadTexture( "textures/cloud.png" );
	texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
	texture.repeat.set(1, 1);
	var cloud_material = new THREE.MeshLambertMaterial( { color: 0xFFFFFF, ambient: 0x000000 } );
	for(var i = 0; i < 4; i++) {
	    for(var n = 0; n < 3; n++) {
		var size1 = Math.random()*15+5;
		var size2 = Math.random()*15+7;
		var object = new THREE.Mesh( new THREE.SphereGeometry( size1, size1, 5));
		object.position.set(Math.random()*15*i, Math.random()*7, Math.random()*20*n);
		object.castShadow = true;
		//group.add(object);
		var object = new THREE.Mesh( new THREE.SphereGeometry( size2, size2, 5 ));
		object.position.set(Math.random()*15*i, Math.random()*7, Math.random()*20*n);
		object.castShadow = true;
		//group.add(object);
		THREE.GeometryUtils.merge(combined, object);
	    }
	}
	var mesh = new THREE.Mesh(combined, cloud_material);

	//group.scale.set(s, s, s);
	//group.position.set(x, y ,z);
	mesh.scale.set(s, s, s);
	mesh.position.set(x, y, z);
*/
	
	// Create Snow cloud
/*
	if(Math.random()*10 < 7) {
	    var engine = new ParticleEngine();

	    engine.setValues(
		{positionStyle    : Type.CUBE,
		 positionBase     : new THREE.Vector3(mesh.position.x, mesh.position.y, mesh.position.z), //new THREE.Vector3( 0, 0, 0 ),
		 positionSpread   : new THREE.Vector3( 200, 0, 200 ),
		 positionRadius : 0.1,
		 
		 velocityStyle    : Type.CUBE,
		 velocityBase     : new THREE.Vector3( 0, -300, 0 ),
		 velocitySpread   : new THREE.Vector3( 150, 20, 150 ), 
		 accelerationBase : new THREE.Vector3( 0, -5,0 ),

		 sizeTween    : new Tween( [0, 0.25], [1, 10] ),
		 colorBase   : new THREE.Vector3(0.66, 1.0, 0.9), // H,S,L
		 opacityTween : new Tween( [2, 3], [0.8, 0] ),
		 blendStyle   : THREE.AdditiveBlending,

		 angleBase               : 0,
		 angleSpread             : 720,
		 angleVelocityBase       :  0,
		 angleVelocitySpread     : 60,
		 
		 particleTexture : THREE.ImageUtils.loadTexture( 'textures/snowflake.png' ),
		 
		 particlesPerSecond : Math.random()*50+100,
		 particleDeathAge   : 10.5,
		 // emitterDeathAge    : 60
		});

	    //this.engine.positionBase.set(x, y, z);
	    engine.initialize();
	    this.engine = engine;
	}
*/
	//mesh.castShadow = true;
	//this.mesh = group;

//	var type = Math.round((1+Math.random()*1));
//	console.log("LOAD: cloud"+type);
	var mesh = modelLoader.GetModel('cloud');
	mesh.scale.set(25+Math.random()*40, 25+Math.random()*20, 25+Math.random()*100);
	mesh.rotation.set(0, Math.PI/2, 0);
	mesh.position.set(x, y, z);

	this.mesh = mesh;
	scene.add(mesh);

	this.speed = Math.random()*2+0.5;
	//this.speed = Math.random()*4+0.5;
    };

    Cloud.prototype.Draw = function(time, delta, index) {
	this.mesh.position.z += this.speed;
	if(this.mesh.position.z > 4000) {
	    this.mesh.position.z = -4000;
	    this.mesh.position.x = Math.random()*4000-1500;
	    this.mesh.position.y = 465+Math.random()*400;
	}
/*
	if(this.engine != undefined) {
	    this.engine.positionBase.z = this.mesh.position.z;
	    this.engine.positionBase.x = this.mesh.position.x;
	    this.engine.positionBase.y = this.mesh.position.y;
	    this.engine.update(delta * 0.5);
	    if(this.mesh.position.z > 1000 || this.mesh.position.z < -1000) {
		this.engine.emitterAlive =false;
	    } else {
		this.engine.emitterAlive = true;
	    }
	}
*/
    };
}
Cloud.prototype = new Object3D();
Cloud.prototype.constructor = Cloud;


/////////////////////////////////////////////////////////////
// Sun
/////////////////////////////////////////////////////////////
function Sun() {
    Object3D.call(this);
    this.renderer = 0;
    this.skycolor = 0;

    Sun.prototype.Create = function(x, y, z, scene, renderer) {
	this.renderer = renderer;
	var lightTarget = new THREE.Object3D();
	lightTarget.position.set(0, 0, 0);
	scene.add(lightTarget);
	var spotlight = new THREE.SpotLight(0xffffff);
	spotlight.position.set(0, 6500, 0);
	spotlight.shadowCameraVisible = false; //true;
	spotlight.shadowDarkness = 0.65; // 0.35
	spotlight.shadowCameraNear = 3000;
	spotlight.shadowCameraFar = 10000;
	spotlight.intensity = 1.7; // 0.5; day = 1.9
	//spotlight.castShadow = true;
	spotlight.shadowMapHeight =  1024;
	spotlight.shadowMapWidth = 1024;
	spotlight.target = lightTarget;
	this.light = spotlight;
	scene.add(spotlight);
	
	var hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.6 );
	hemiLight.color.setHSL( 0.2, 1, 0.2 );
	hemiLight.groundColor.setHSL( 1, 1, 1 );
	hemiLight.position.set( 0, 1000, 0 );
	hemiLight.intensity = 0.7; // 0.06 day = 1.0
	
	// Without draw
	this.skycolor = 255; // day = 255
	this.renderer.setClearColor(rgbToHex(this.skycolor-200, this.skycolor-100, this.skycolor), 1);
	scene.fog = new THREE.FogExp2(rgbToHex(this.skycolor-200, this.skycolor-100, this.skycolor), 0.00015 );
	
	scene.add( hemiLight );
	this.hemiLight = hemiLight;

	var customMaterial = new THREE.ShaderMaterial( 
	    {
		uniforms: {  },
		vertexShader:   document.getElementById( 'sunVertexShader'   ).textContent,
		fragmentShader: document.getElementById( 'sunFragmentShader' ).textContent,
		side: THREE.BackSide,
		blending: THREE.AdditiveBlending,
		transparent: true
	    }   );

/*	
	var sunEngine = new ParticleEngine();

	sunEngine.setValues(
	    {
		positionStyle  : Type.SPHERE,
		positionBase   : new THREE.Vector3(0, 200, 0),
		positionRadius : 20, // 20

		sizeTween    : new Tween( [0, 0.4], [1, 450] ), // 250
		opacityTween : new Tween( [0.7, 1], [1, 0] ),
		colorBase    : new THREE.Vector3(0.02, 1, 0.4),
		blendStyle   : THREE.AdditiveBlending,  

		velocityStyle : Type.SPHERE,
		speedBase     : 40,
		speedSpread   : 8,
	  
		particleTexture : THREE.ImageUtils.loadTexture( 'textures/smokeparticle.png' ),
		
		particlesPerSecond : 260,
		particleDeathAge: 10.7,
	    });
	sunEngine.initialize();
	this.sunEngine = sunEngine;
*/
    };


    Sun.prototype.Draw = function(time, delta) {
/*
	if(this.light.position.y < -500) {
	    this.sunEngine.emitterAlive = 0;
	} else {
	    this.sunEngine.emitterAlive = 1;
	}
*/
	var e_angle = 0.01 * time * 0.1;
//	this.sunEngine.positionBase.set(6500* Math.cos(e_angle), 6500d* Math.sin(e_angle)-1000, 0);
	this.light.position.set(6500* Math.cos(e_angle), 6500* Math.sin(e_angle)-1000, 0); // 6500
//	this.sunEngine.update(delta * 0.5 );

	if(this.light.position.y > -500 && this.light.position.x > 0) {
	    if(this.skycolor < 254) {
		this.renderer.setClearColor(rgbToHex(this.skycolor-200, this.skycolor-100, this.skycolor), 1);
		scene.fog = new THREE.FogExp2(rgbToHex(this.skycolor-200, this.skycolor-100, this.skycolor), 0.00015 );
		this.skycolor += 1;
	    }

	    if(this.hemiLight.intensity < 0.6) {
		this.hemiLight.intensity += 0.001;
	    }
	    if(this.light.intensity < 1.5) {
		this.light.intensity += 0.001;
	    }
	}
	if(this.light.position.y < 300 && this.light.position.x < 0) {	
	    if(this.skycolor > 1) {
		this.renderer.setClearColor(rgbToHex(this.skycolor-200, this.skycolor-100, this.skycolor), 1);
		scene.fog = new THREE.FogExp2(rgbToHex(this.skycolor-200, this.skycolor-100, this.skycolor), 0.00025 );
		this.skycolor -= 1;
	    }
	    if(this.hemiLight.intensity > 0.05) {
		this.hemiLight.intensity -= 0.001;
	    }
	    if(this.light.intensity > 0.005) {
		this.light.intensity -= 0.001;
	    }
	}
	if(this.light.position.z > 5000) {
	    this.light.position.z = -5000;
	    this.mesh.position.z = -5000;
	}
    };
}
Sun.prototype = new Object3D();
Sun.prototype.constructor = Sun;

/////////////////////////////////////////////////////////////
// Tower
/////////////////////////////////////////////////////////////
function Tower() {
    Object3D.call(this);
    
    Tower.prototype.Create = function(x, y, z, scale) {
	var object = modelLoader.GetModel("watchtower");
	object.position.set(x,y,z);
	object.rotation.set(0, Math.random()*Math.PI, 0);
	object.scale.set(scale, scale, scale);
	scene.add(object);
    };

}
Tower.prototype = new Object3D();
Tower.prototype.constructor = Tower;

/////////////////////////////////////////////////////////////
// Market house
/////////////////////////////////////////////////////////////
function MarketHouse() {
    Object3D.call(this);
    
    MarketHouse.prototype.Create = function(x, y, z, scale) {
	var object = modelLoader.GetModel("markethouse");
	object.position.set(x,y,z);
	object.rotation.set(0, Math.random()*Math.PI, 0);
	object.scale.set(scale, scale, scale);
	scene.add(object);
    };

}
MarketHouse.prototype = new Object3D();
MarketHouse.prototype.constructor = MarketHouse;

/////////////////////////////////////////////////////////////
// Market house
/////////////////////////////////////////////////////////////
function DockHouse() {
    Object3D.call(this);
    
    DockHouse.prototype.Create = function(x, y, z, scale) {
	var object = modelLoader.GetModel("dockhouse");
	object.position.set(x,y,z);
	object.rotation.set(0, Math.random()*Math.PI, 0);
	object.scale.set(scale, scale, scale);
	scene.add(object);
    };

}
DockHouse.prototype = new Object3D();
DockHouse.prototype.constructor = DockHouse;

/////////////////////////////////////////////////////////////
// RoadHouse
/////////////////////////////////////////////////////////////
function RoadHouse() {
    Object3D.call(this);
    
    RoadHouse.prototype.Create = function(x, y, z, scale) {
	var object = modelLoader.GetModel("roadhouse");
	this.mesh = object;
	CreateBoundingBox(this);
	console.log("WIDTH: "+200*this.bsize_x);
	object.position.set(x-(this.bsize_x*scale),y,z+(this.bsize_z*scale));
	object.rotation.set(0, Math.random()*Math.PI, 0);
	object.scale.set(scale, scale, scale);
	scene.add(object);
    };

}
RoadHouse.prototype = new Object3D();
RoadHouse.prototype.constructor = RoadHouse;


/////////////////////////////////////////////////////////////
// Lamp
/////////////////////////////////////////////////////////////
function Lamp() {
    Object3D.call(this);
    
    Lamp.prototype.Create = function(x, y, z, scale) {
	var object = modelLoader.GetModel("lamp");
	object.position.set(x,y,z);
	object.rotation.set(0, Math.random()*Math.PI, 0);
	object.scale.set(scale, scale, scale);
	scene.add(object);
    };

}
Lamp.prototype = new Object3D();
Lamp.prototype.constructor = Lamp;

/////////////////////////////////////////////////////////////
// Flower
/////////////////////////////////////////////////////////////
function Flower() {
    Object3D.call(this);
    
    Flower.prototype.Create = function(x, y, z, scale, type) {
	var object = modelLoader.GetModel('flower'+type);
	object.position.set(x,y,z);
	object.rotation.set(0, Math.random()*Math.PI, 0);
	object.scale.set(scale, scale, scale);
	scene.add(object);
    };

}
Flower.prototype = new Object3D();
Flower.prototype.constructor = Flower;

/////////////////////////////////////////////////////////////
// BigBox
/////////////////////////////////////////////////////////////
function BigBox() {
    Object3D.call(this);
    
    BigBox.prototype.Create = function(w,h, d, x, y, z, s, scene) {
	var texture = THREE.ImageUtils.loadTexture( "textures/bigbox1.png" );
	texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
	texture.repeat.set( 1, 1 );
	var base_material = new THREE.MeshLambertMaterial( { color: 0x996600, map: texture} ); // 996600
	var object = new THREE.Mesh( new THREE.BoxGeometry(w, h, d ), base_material);
	//object.castShadow = true;
//	object.receiveShadow = true;
	object.scale.set(s, s, s);
	object.position.set(x, y + (h*s)/2 ,z);
	this.mesh = object;
	scene.add(object);
    };

    BigBox.prototype.Draw = function(time) {

    };
}
BigBox.prototype = new Object3D();
BigBox.prototype.constructor = BigBox;

/////////////////////////////////////////////////////////////
// Terrain
/////////////////////////////////////////////////////////////
function Terrain() {
    Object3D.call(this);
    this.noise = 0;

    Terrain.prototype.GetNoise = function()  {
	return this.noise;
    };
    Terrain.prototype.GetTerrain = function()  {
	return this.mesh.geometry.vertices;
    };

    Terrain.prototype.CreateNet = function(noise) {
        var canvas  = document.getElementById('noise_1');
	canvas.innerHTML = '';
        var context = canvas.getContext('2d');
    //    var canvas2  = document.getElementById('noise_2');
//        var context2 = canvas2.getContext('2d');
	
        for(var x = 0; x < noise.length; x++)
        {
            for(var y = 0; y < noise[x].length; y++)
            {
                var color = Math.round((255 * noise[x][y]));
		if(color < 0) color = 0;
                context.fillStyle = "rgb("+color+", "+color+", "+color+")";
                context.fillRect(x, y, 1, 1);
            }
        }
//	context2.drawImage(canvas, 0, 0);
	this.noise = noise;

	var bumpTexture = new THREE.ImageUtils.loadTexture(canvas.toDataURL());
	bumpTexture.wrapS = bumpTexture.wrapT = THREE.RepeatWrapping; 
	var bumpScale   = 200.0;
	

	//var oceanTexture = new THREE.ImageUtils.loadTexture( 'images/dirt-512.jpg' );
	var oceanTexture = new THREE.ImageUtils.loadTexture( 'images/sand-512.jpg' );
	oceanTexture.wrapS = oceanTexture.wrapT = THREE.RepeatWrapping; 
	
	//var sandyTexture = new THREE.ImageUtils.loadTexture( 'images/sand-512.jpg' );
	var sandyTexture = new THREE.ImageUtils.loadTexture( 'textures/mario/sand2.png' );
	sandyTexture.wrapS = sandyTexture.wrapT = THREE.RepeatWrapping; 
	
	//var grassTexture = new THREE.ImageUtils.loadTexture( 'images/grass-512.jpg' );
	//var grassTexture = new THREE.ImageUtils.loadTexture( 'textures/grass_6.png' );
	var grassTexture = new THREE.ImageUtils.loadTexture( 'textures/mario/grass.png' );
	grassTexture.wrapS = grassTexture.wrapT = THREE.RepeatWrapping; 
	
	//var rockyTexture = new THREE.ImageUtils.loadTexture( 'images/rock-512.jpg' );
	var rockyTexture = new THREE.ImageUtils.loadTexture( 'textures/rock_n1.jpg' );
	rockyTexture.wrapS = rockyTexture.wrapT = THREE.RepeatWrapping; 
	
	var snowyTexture = new THREE.ImageUtils.loadTexture( 'images/snow-512.jpg' );
	snowyTexture.wrapS = snowyTexture.wrapT = THREE.RepeatWrapping; 

	
	var customUniforms = {
		bumpTexture:	{ type: "t", value: bumpTexture },
		bumpScale:	    { type: "f", value: bumpScale },
		oceanTexture:	{ type: "t", value: oceanTexture },
		sandyTexture:	{ type: "t", value: sandyTexture },
		grassTexture:	{ type: "t", value: grassTexture },
		rockyTexture:	{ type: "t", value: rockyTexture },
		snowyTexture:	{ type: "t", value: snowyTexture },
	};
	
	var customMaterial = new THREE.ShaderMaterial( 
	{
	    uniforms: customUniforms,
	    vertexShader:   document.getElementById( 'terrainVertexShader'   ).textContent,
	    fragmentShader: document.getElementById( 'terrainFragmentShader' ).textContent,
	    transparent: true,
	    depthWrite: true,
	    depthTest: true,
	}   );
		
	var planeGeo = new THREE.PlaneGeometry( 3000, 3000, 100, 100 );
	var plane = new THREE.Mesh(	planeGeo, customMaterial );
	plane.rotation.x = -Math.PI / 2;
	this.mesh = plane;
	scene.add( plane );
    };

    Terrain.prototype.Create = function(scene) {
	var noise     = this.GenerateNoise();
	
        var canvas  = document.getElementById('noise_1');
        var context = canvas.getContext('2d');
    //    var canvas2  = document.getElementById('noise_2');
    //    var context2 = canvas2.getContext('2d');
	
        for(var x = 0; x < noise.length; x++)
        {
            for(var y = 0; y < noise[x].length; y++)
            {
                var color = Math.round((255 * noise[x][y]));
		if(color < 0) color = 0;
                context.fillStyle = "rgb("+color+", "+color+", "+color+")";
                context.fillRect(x, y, 1, 1);
            }
        }
//	context2.drawImage(canvas, 0, 0);
	this.noise = noise;

	var bumpTexture = new THREE.ImageUtils.loadTexture(canvas.toDataURL());
	bumpTexture.wrapS = bumpTexture.wrapT = THREE.RepeatWrapping; 
	var bumpScale   = 200.0;
	

	//var oceanTexture = new THREE.ImageUtils.loadTexture( 'images/dirt-512.jpg' );
	var oceanTexture = new THREE.ImageUtils.loadTexture( 'images/sand-512.jpg' );
	oceanTexture.wrapS = oceanTexture.wrapT = THREE.RepeatWrapping; 
	
	//var sandyTexture = new THREE.ImageUtils.loadTexture( 'images/sand-512.jpg' );
	var sandyTexture = new THREE.ImageUtils.loadTexture( 'textures/mario/sand1.png' );
	sandyTexture.wrapS = sandyTexture.wrapT = THREE.RepeatWrapping; 
	
	//var grassTexture = new THREE.ImageUtils.loadTexture( 'images/grass-512.jpg' );
	//var grassTexture = new THREE.ImageUtils.loadTexture( 'textures/grass_6.png' );
	var grassTexture = new THREE.ImageUtils.loadTexture( 'textures/mario/grass.png' );
	grassTexture.wrapS = grassTexture.wrapT = THREE.RepeatWrapping; 
	
	//var rockyTexture = new THREE.ImageUtils.loadTexture( 'images/rock-512.jpg' );
	var rockyTexture = new THREE.ImageUtils.loadTexture( 'textures/rock_n1.jpg' );
	rockyTexture.wrapS = rockyTexture.wrapT = THREE.RepeatWrapping; 
	
	var snowyTexture = new THREE.ImageUtils.loadTexture( 'images/snow-512.jpg' );
	snowyTexture.wrapS = snowyTexture.wrapT = THREE.RepeatWrapping; 

	
	var customUniforms = {
		bumpTexture:	{ type: "t", value: bumpTexture },
		bumpScale:	    { type: "f", value: bumpScale },
		oceanTexture:	{ type: "t", value: oceanTexture },
		sandyTexture:	{ type: "t", value: sandyTexture },
		grassTexture:	{ type: "t", value: grassTexture },
		rockyTexture:	{ type: "t", value: rockyTexture },
		snowyTexture:	{ type: "t", value: snowyTexture },
	};
	
	var customMaterial = new THREE.ShaderMaterial( 
	{
	    uniforms: customUniforms,
	    vertexShader:   document.getElementById( 'terrainVertexShader'   ).textContent,
	    fragmentShader: document.getElementById( 'terrainFragmentShader' ).textContent,
	    transparent: true
	}   );
		
	var planeGeo = new THREE.PlaneGeometry( 3000, 3000, 100, 100 );
	var plane = new THREE.Mesh(	planeGeo, customMaterial );
	plane.rotation.x = -Math.PI / 2;
	this.mesh = plane;
	scene.add( plane );
    };

    Terrain.prototype.GenerateNoise = function () {
	var noiseArr = new Array();

        for(var i = 0; i <= 15; i++)
        {
            noiseArr[i] = new Array();

            for(var j = 0; j <= 15; j++)
            {
                var height = Math.random();

                if(i == 0 || j == 0 || i == 5 || j == 5 || j == 10 || i == 10)
                    height = -0.15;

                noiseArr[i][j] = height;
            }
        }

       // return(this.Flatten(this.Interpolate(noiseArr)));
        return(this.Interpolate(noiseArr));
    };

    Terrain.prototype.Interpolate = function (points) {
	var noiseArr = new Array()
        var x = 0;
        var y = 0;
	var p = 30;

        for(var i = 0; i < 300; i++) // 450
        {
            if(i != 0 && i % p == 0)
                x++;

            noiseArr[i] = new Array();
            for(var j = 0; j < 300; j++)
            {
                
                if(j != 0 && j % p == 0)
                    y++;

                var mu_x = (i%p) / p;
                var mu_2 = (1 - Math.cos(mu_x * Math.PI)) / 2;

                var int_x1     = points[x][y] * (1 - mu_2) + points[x+1][y] * mu_2;
                var int_x2     = points[x][y+1] * (1 - mu_2) + points[x+1][y+1] * mu_2;

                var mu_y = (j%p) / p;
                var mu_2 = (1 - Math.cos(mu_y * Math.PI)) / 2;
                var int_y = int_x1 * (1 - mu_2) + int_x2 * mu_2;

                noiseArr[i][j] = int_y;
            }
            y = 0;
        }        
        return(noiseArr);
    };

    Terrain.prototype.Flatten = function(points) {
        var noiseArr = new Array();
        for(var i = 0; i < points.length; i++)
        {
            noiseArr[i] = new Array()
            for(var j = 0; j < points[i].length; j++)
            {
                if(points[i][j] < 0.2)
                    noiseArr[i][j] = 0;

                else if(points[i][j] < 0.4)
                    noiseArr[i][j] = 0.2;

                else if(points[i][j] < 0.6)
                    noiseArr[i][j] = 0.4;

                else if(points[i][j] < 0.8)
                    noiseArr[i][j] = 0.6;

                else
                    noiseArr[i][j] = 1;
            }
        }

        return(noiseArr);
    };

    Terrain.prototype.Draw = function(time) {

    };
}
Terrain.prototype = new Object3D();
Terrain.prototype.constructor = Terrain;

