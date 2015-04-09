////////////////////////////////////////////////////////////
// Autor: Nergal
// Date: 2014-01-19
/////////////////////////////////////////////////////////////
"use strict";

/////////////////////////////////////////////////////////////
// Ammo base 'class'
/////////////////////////////////////////////////////////////
function Ammo() {
    this.power = 0;
    this.alive = 1;
    this.g = -32.2; // Gravity in feet
    this.time_start = -1;
    this.compvely = 5;
    this.degree = 60;
    this.parent_mesh = 0;
    this.scale = 1;
    this.player_id;
    this.update_time = 0;
    this.explode_area = 0;
    this.no_gravity = 0;

    Ammo.prototype.type = "ammo";

    Ammo.prototype.Draw = function(time, delta) {
        this.update_time += delta;
        if(this.update_time > 0.03) {
            this.CheckCollision();
            this.update_time = 0;
        }

        if(this.time_start == -1) {
            this.time_start = time;
        } 
        time = time - this.time_start;

        var y_ = GetWorldY(this.mesh);
        var my = this.mesh.position.y;
        if(my > 0 && my > y_) {
            var t = time/5;
            if(!this.no_gravity) { 
                this.mesh.translateY((this.compvely * t) + (0.4)*this.g*(t*t));
                this.mesh.translateZ(1*this.power);
            }
            //   this.mesh.translateX(0.5-Math.random()*2+Math.sin(Math.PI*delta));
        } else {
            this.Destroy();
            this.CheckCollision();
        }
    };

    Ammo.prototype.Hit = function(dmg, i) {
        // TBD: Change power so the ammo drops down.
    };

    Ammo.prototype.isAlive = function() {
        return this.alive;
    };

    Ammo.prototype.Create = function(args) {
        this.player_id = args.player_id;
        this.power = args.power;
        this.explode_area = args.explode_area;
        this.parent_mesh = args.mesh;
        this.scale = args.scale;
        this.Spawn(args);
    };

    Ammo.prototype.Destroy = function() {
        scene.remove(this.mesh);
        collision_objects.splice(collision_objects.indexOf(this), 1);
        this.alive = 0;
    };

    Ammo.prototype.CheckCollision = function() {
        // TBD: Get world position of this.mesh and collision_objects[i]
        var thisvector = new THREE.Vector3();
        thisvector.setFromMatrixPosition(this.mesh.matrixWorld);

        var x = thisvector.x;
        var y = thisvector.y;
        var z = thisvector.z;
        var hits = [];
        for(var i = 0; i < collision_objects.length; i++) {
            // these may change on collission
            var x_max = thisvector.x + this.bsize_x;
            var x_min = thisvector.x - this.bsize_x;
            var y_max = thisvector.y + this.bsize_y;
            var y_min = thisvector.y - this.bsize_y;
            var z_max = thisvector.z + this.bsize_z;
            var z_min = thisvector.z - this.bsize_z;
            if(collision_objects[i].mesh == this.mesh ||
               (collision_objects[i].mesh.player_id != undefined && collision_objects[i].mesh.player_id == this.player_id)) 
                {
                    return;
                }
                var objvector = new THREE.Vector3();
                objvector.setFromMatrixPosition(collision_objects[i].mesh.matrixWorld);
                // Check X
                var obj_xmin = objvector.x - collision_objects[i].bsize_x;
                var obj_xmax = objvector.x + collision_objects[i].bsize_x;
                if(x_max > obj_xmin && x_min < obj_xmax) {
                    // Check Z
                    var obj_zmin = objvector.z - collision_objects[i].bsize_z;
                    var obj_zmax = objvector.z + collision_objects[i].bsize_z;
                    if(z_max > obj_zmin && z_min < obj_zmax) {
                        // And last check Y
                        var obj_ymin = objvector.y - collision_objects[i].bsize_y;
                        var obj_ymax = objvector.y + collision_objects[i].bsize_y;
                        if(y_max > obj_ymin && y_min < obj_ymax) {
                            // Only hit stuff if player shoots
                            // otherwise we just draw...
                            if(net.player != undefined && collision_objects[i] != undefined) {
                                if(this.player_id == net.player.id ) { 
                                    if(collision_objects[i].id != this.player_id) {
                                        if(hits[collision_objects[i].id] != 1) {
                                            hits[collision_objects[i].id] = 1;
                                            collision_objects[i].Hit(i, this.player_id);
                                        }
                                    }
                                }
                            }
                            if(this.Destroy()) {
                                i = 0;
                            }
                        }
                    }
                }
        }
    };
}

/////////////////////////////////////////////////////////////
// Fireball
/////////////////////////////////////////////////////////////
function FireballShot() {
    Ammo.call(this);

    FireballShot.prototype.Spawn = function() {
        var material = new THREE.MeshLambertMaterial( { color: 0xFFFFFF, visible: false } );
        var object = new THREE.Mesh( new THREE.SphereGeometry(10, 10, 0), material );

        object.applyMatrix(this.parent_mesh.matrixWorld);
        object.scale.set(this.scale,this.scale, this.scale);

        this.mesh = object;
        var vector = this.parent_mesh.localToWorld(new THREE.Vector3(0, camera.rotation.x*10, 0));
        this.mesh.position = vector;

        //	console.log("POS_Y: "+camera.rotation.x*30);
        //	console.log("POS: ");
        //	console.log(this.mesh.position);


        this.tipx = this.mesh.position.x;
        this.tipy = this.mesh.position.y;
        this.tipz = this.mesh.position.z;
        CreateBoundingBox(this);

        // Effect
        var particleGroup = new SPE.Group({
            texture: THREE.ImageUtils.loadTexture('textures/smokeparticle.png'),
            maxAge: 0.5,
            obj: this.mesh,
        });

        var emitter = new SPE.Emitter({
            position: new THREE.Vector3(0, 0, 0),
            positionSpread: new THREE.Vector3( 50, 50, 50 ),

            acceleration: new THREE.Vector3(0, 5, 0),
            accelerationSpread: new THREE.Vector3( 10, 0, 10 ),

            velocity: new THREE.Vector3(10, 15, 10),
            velocitySpread: new THREE.Vector3(10, 7.5, 10),

            colorStart: new THREE.Color('orange'),
            colorEnd: new THREE.Color('red'),

            duration: 1,
            sizeStart: 2,
            sizeEnd: 10,
            particleCount: 400
        });

        particleGroup.addEmitter( emitter );
        objects.push(particleGroup);
        this.mesh.add( particleGroup.mesh );

        scene.add(this.mesh);
    };

    FireballShot.prototype.Destroy = function() {
        if(!this.alive) {
            return 0;
        }
        soundLoader.PlaySound("explosion4", this.mesh.position, 2000);

        // Increase bounding box upon hit for missile.
        // TBD: Add this.explode_area instead (set by server on weapon creation)
        this.bsize_x += this.explode_area;
        this.bsize_y += this.explode_area;
        this.bsize_z += this.explode_area;
        /*
           var bcube = new THREE.Mesh( new THREE.BoxGeometry( this.bsize_x*2, this.bsize_y*2, this.bsize_z*2 ), 
           new THREE.MeshNormalMaterial({ visible: true, wireframe: false, color: 0xAA3333}) );
           bcube.position.set(this.mesh.position.x, this.mesh.position.y, this.mesh.position.z);
           scene.add(bcube);
           */

        Ammo.prototype.Destroy.call(this);

        // Create some effect.
        var vector = new THREE.Vector3();
        vector.setFromMatrixPosition(this.mesh.matrixWorld);

        var particleGroup = new SPE.Group({
            texture: THREE.ImageUtils.loadTexture('textures/star.png'),
            maxAge: 0.5
        });

        var emitter = new SPE.Emitter({
            position: new THREE.Vector3(vector.x, vector.y, vector.z),
            positionSpread: new THREE.Vector3( 0, 30, 0 ),

            acceleration: new THREE.Vector3(2, 5, 2),
            accelerationSpread: new THREE.Vector3( 10, 20, 10 ),

            velocity: new THREE.Vector3(10, 35, 10),
            velocitySpread: new THREE.Vector3(100, 7.5, 100),

            colorStart: new THREE.Color('orange'),
            colorEnd: new THREE.Color('red'),

            duration: 1.2,
            sizeStart: 20,
            sizeEnd: 60,
            particleCount: 1000
        });

        particleGroup.addEmitter( emitter );
        scene.add(particleGroup.mesh);
        objects.push(particleGroup);

        return 1;
    };
}
FireballShot.prototype = new Ammo();
FireballShot.prototype.constructor = FireballShot;


/////////////////////////////////////////////////////////////
// FireRing Shot
/////////////////////////////////////////////////////////////
function FireRingShot() {
    Ammo.call(this);

    FireRingShot.prototype.Spawn = function(args) {
        var material = new THREE.MeshLambertMaterial( { color: 0xFFFFFF, visible: false } );
        var object = new THREE.Mesh( new THREE.SphereGeometry(10, 10, 0), material );

        object.applyMatrix(this.parent_mesh.matrixWorld);
        object.scale.set(this.scale,this.scale, this.scale);
        this.mesh = object;

        var vector = this.parent_mesh.localToWorld(new THREE.Vector3(0, camera.rotation.x*10, 0));
        this.mesh.rotation.set(0, args.angle, 0);
        this.mesh.position = vector;

        this.tipx = this.mesh.position.x+Math.random()*30;
        this.tipy = this.mesh.position.y;
        this.tipz = this.mesh.position.z+Math.random()*30;

        // Effect
        var particleGroup = new SPE.Group({
            texture: THREE.ImageUtils.loadTexture('textures/smokeparticle.png'),
            maxAge: 1,
            obj: this.mesh,
        });

        var emitter = new SPE.Emitter({
            position: new THREE.Vector3(0, 0, 0),
            positionSpread: new THREE.Vector3( 50, 50, 50 ),

            acceleration: new THREE.Vector3(0, 5, 0),
            accelerationSpread: new THREE.Vector3( 10, 0, 10 ),

            velocity: new THREE.Vector3(10, 15, 10),
            velocitySpread: new THREE.Vector3(10, 7.5, 10),

            colorStart: new THREE.Color(0x9900cc),
            colorEnd: new THREE.Color(0x990000),

            duration: 1.5,
            sizeStart: 5,
            sizeEnd: 30,
            particleCount: 70
        });

        particleGroup.addEmitter( emitter );
        objects.push(particleGroup);
        this.mesh.add( particleGroup.mesh );

        scene.add(this.mesh);
    };

    FireRingShot.prototype.Destroy = function() {
        if(!this.alive) {
            return 0;
        }

        soundLoader.PlaySound("explosion3", this.mesh.position, 1000);
        CreateBoundingBox(this);

        //	soundLoader.PlaySound("devastator", this.mesh.position, 2000);

        // Increase bounding box upon hit for missile.
        // TBD: Add this.explode_area instead (set by server on weapon creation)
        this.bsize_x += this.explode_area;
        this.bsize_y += this.explode_area;
        this.bsize_z += this.explode_area;

        /*
           var bcube = new THREE.Mesh( new THREE.BoxGeometry( this.bsize_x*2, this.bsize_y*2, this.bsize_z*2 ), 
           new THREE.MeshNormalMaterial({ visible: true, wireframe: false, color: 0xAA3333}) );
           bcube.position.set(this.mesh.position.x, this.mesh.position.y, this.mesh.position.z);
           scene.add(bcube);
           */

        Ammo.prototype.Destroy.call(this);

        // Create some effect.
        var vector = new THREE.Vector3();
        vector.setFromMatrixPosition(this.mesh.matrixWorld);

        var particleGroup = new SPE.Group({
            texture: THREE.ImageUtils.loadTexture('textures/star.png'),
            maxAge: 0.5
        });

        var emitter = new SPE.Emitter({
            position: new THREE.Vector3(vector.x, vector.y, vector.z),
            positionSpread: new THREE.Vector3( 0, 30, 0 ),

            acceleration: new THREE.Vector3(2, 5, 2),
            accelerationSpread: new THREE.Vector3( 5, 10, 5 ),

            velocity: new THREE.Vector3(10, 35, 10),
            velocitySpread: new THREE.Vector3(25, 5.5, 50),

            colorStart: new THREE.Color('orange'),
            colorEnd: new THREE.Color('red'),

            duration: 1,
            sizeStart: 10,
            sizeEnd: 30,
            particleCount: 50
        });

        particleGroup.addEmitter( emitter );
        scene.add(particleGroup.mesh);
        objects.push(particleGroup);

        return 1;
    };
}
FireRingShot.prototype = new Ammo();
FireRingShot.prototype.constructor = FireRingShot;

/////////////////////////////////////////////////////////////
// Explosion 
/////////////////////////////////////////////////////////////
function ExplosionShot() {
    Ammo.call(this);

    ExplosionShot.prototype.Spawn = function() {
        var material = new THREE.MeshLambertMaterial( { color: 0xFFFFFF, visible: false } );
        var object = new THREE.Mesh( new THREE.SphereGeometry(10, 10, 0), material );

        object.applyMatrix(this.parent_mesh.matrixWorld);
        object.scale.set(this.scale,this.scale, this.scale);

        this.mesh = object;
        var vector = this.parent_mesh.localToWorld(new THREE.Vector3(0, camera.rotation.x*10, 0));
        this.mesh.position = vector;


        this.tipx = this.mesh.position.x;
        this.tipy = this.mesh.position.y;
        this.tipz = this.mesh.position.z;
        CreateBoundingBox(this);

        scene.add(this.mesh);
    };

    ExplosionShot.prototype.Destroy = function() {
        if(!this.alive) {
            return 0;
        }
        soundLoader.PlaySound("nuclear", this.mesh.position, 1000);

        // Increase bounding box upon hit for missile.
        // TBD: Add this.explode_area instead (set by server on weapon creation)
        this.bsize_x += this.explode_area;
        this.bsize_y += this.explode_area;
        this.bsize_z += this.explode_area;

        /*
           var bcube = new THREE.Mesh( new THREE.BoxGeometry( this.bsize_x*2, this.bsize_y*2, this.bsize_z*2 ), 
           new THREE.MeshNormalMaterial({ visible: true, wireframe: false, color: 0xAA3333}) );
           bcube.position.set(this.mesh.position.x, this.mesh.position.y, this.mesh.position.z);
           scene.add(bcube);
           */

        Ammo.prototype.Destroy.call(this);

        return 1;
    };
}
ExplosionShot.prototype = new Ammo();
ExplosionShot.prototype.constructor = ExplosionShot;


/////////////////////////////////////////////////////////////
// Blizzard shot
/////////////////////////////////////////////////////////////
function BlizzardShot() {
    Ammo.call(this);
    this.no_gravity = 1;

    BlizzardShot.prototype.Spawn = function(args) {
        var object = modelLoader.GetModel('cloud');

        this.g = args.gravity;
        args.angle = 0;

        object.applyMatrix(this.parent_mesh.matrixWorld);
        object.scale.set(4,4,4);
        //object.scale.set(this.scale,this.scale, this.scale);
        this.mesh = object;
        this.mesh.position.y = 250;

        var vector = this.parent_mesh.localToWorld(new THREE.Vector3(0, camera.rotation.x*10, 0));
        this.mesh.rotation.set(0, args.angle, 0);
        this.mesh.position = vector;

        this.tipx = this.mesh.position.x;
        this.tipy = this.mesh.position.y+50;
        this.tipz = this.mesh.position.z;

        // Effect
        var particleGroup = new SPE.Group({
            texture: THREE.ImageUtils.loadTexture('textures/smokeparticle.png'),
            maxAge: 3,
            obj: this.mesh,
        });

        var emitter = new SPE.Emitter({      	
            position: new THREE.Vector3(0, 0, 0),
            positionSpread: new THREE.Vector3( 10, 0, 10 ),

            acceleration: new THREE.Vector3(0, -5, 0),
            accelerationSpread: new THREE.Vector3( 10, 0, 10 ),

            velocity: new THREE.Vector3(0, -5, 0),
            velocitySpread: new THREE.Vector3(10, 7.5, 10),

            colorStart: new THREE.Color('blue'),
            colorEnd: new THREE.Color('white'),

            sizeStart: 5,
            sizeEnd: 1,
            duration: 4,
            particleCount: 1000
        });

        particleGroup.addEmitter( emitter );
        objects.push(particleGroup);
        this.mesh.add( particleGroup.mesh );

        var that = this;
        setTimeout(function() {
            that.no_gravity = 0;
        }, 5000);

        scene.add(this.mesh);
    };

    BlizzardShot.prototype.Destroy = function() {
        if(!this.alive) {
            return 0;
        }

        soundLoader.PlaySound("explosion3", this.mesh.position, 1000);

        CreateBoundingBox(this);

        //	soundLoader.PlaySound("devastator", this.mesh.position, 2000);

        // Increase bounding box upon hit for missile.
        // TBD: Add this.explode_area instead (set by server on weapon creation)
        this.bsize_x += this.explode_area;
        this.bsize_y += this.explode_area;
        this.bsize_z += this.explode_area;

        /*
           var bcube = new THREE.Mesh( new THREE.BoxGeometry( this.bsize_x*2, this.bsize_y*2, this.bsize_z*2 ), 
           new THREE.MeshNormalMaterial({ visible: true, wireframe: false, color: 0xAA3333}) );
           bcube.position.set(this.mesh.position.x, this.mesh.position.y, this.mesh.position.z);
           scene.add(bcube);
           */

        Ammo.prototype.Destroy.call(this);

        // Create some effect.
        var vector = new THREE.Vector3();
        vector.setFromMatrixPosition(this.mesh.matrixWorld);

        var particleGroup = new SPE.Group({
            texture: THREE.ImageUtils.loadTexture('textures/star.png'),
            maxAge: 0.5
        });

        var emitter = new SPE.Emitter({
            position: new THREE.Vector3(vector.x, vector.y, vector.z),
            positionSpread: new THREE.Vector3( 100, 10, 100 ),

            acceleration: new THREE.Vector3(20, 10, 20),
            accelerationSpread: new THREE.Vector3( 50, 10, 50 ),

            velocity: new THREE.Vector3(0, -5, 0),
            velocitySpread: new THREE.Vector3(100, 7.5, 100),

            colorStart: new THREE.Color('blue'),
            colorEnd: new THREE.Color('white'),

            sizeStart: 40,
            sizeEnd: 10,
            duration: 2,
            particleCount: 1000
        });

        particleGroup.addEmitter( emitter );
        scene.add(particleGroup.mesh);
        objects.push(particleGroup);


        return 1;
    };
}
BlizzardShot.prototype = new Ammo();
BlizzardShot.prototype.constructor = BlizzardShot;
