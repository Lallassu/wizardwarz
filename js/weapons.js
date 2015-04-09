////////////////////////////////////////////////////////////
// Autor: Nergal
// Date: 2014-01-19
/////////////////////////////////////////////////////////////
"use strict";

/////////////////////////////////////////////////////////////
// Weapons base 'class'
/////////////////////////////////////////////////////////////
function Weapon() {
    this.shots = new Array();
    this.type = "weapon";
    this.max_power = 0;
    this.min_power = 0;
    this.power = 0;
    this.reload_time = 1;
    this.reload_current = 0;
    this.x = 0;
    this.player_id = 0;
    this.y = 0;
    this.z = 0;
    this.scale = 0;
    this.player_id = undefined;

    Weapon.prototype.Reloaded = function() {
        return this.reload_current < this.reload_time ? 1 : 0;
    };
    /*
       Weapon.prototype.Pickup = function(player) {

// TBD: attach as before? Spawn new?
ConsoleMsg("Picked up "+this.name, "FF00FF");
for(var i = 0; i < player.weapons.length; i++) {
if(player.weapons[i].name == this.name) {
return;
}
}
// pickup weapon on ground
if(player.weapon != undefined) {
player.weapon.Hide(player);
}
for(var i = 0; i < objects.length; i++) {
if(objects[i].mesh == this.mesh) {
objects.splice(i, 1);
break;
}
}
this.player_id = player.id;
this.mesh.rotation.set(0,0,0);
scene.remove(this.mesh);
this.mesh.position.set(this.x, this.y, this.z);
this.mesh.scale.set(this.scale, this.scale, this.scale);
player.weapons.push(this);
player.mesh.add(this.mesh);
player.weapon = this;
rotateAroundObjectAxis(this.mesh, new THREE.Vector3(0,1,0), -Math.PI/2);
};

Weapon.prototype.Drop = function(player) {
    // Drop weapon
    if(this.mesh != undefined) {
        player.mesh.remove(this.mesh);
    }
    for(var i=0; i < this.shots.length; i++) {
        this.shots[i].Destroy();
        this.shots.splice(i, 1);
    }

    // Add weapon to scene
    var vector = new THREE.Vector3();
    vector.setFromMatrixPosition(player.mesh.matrixWorld);
    this.mesh.parent = scene;
    this.mesh.rotation.set(0,0,0);
    this.mesh.scale.set(this.drop_scale,this.drop_scale,this.drop_scale);
    this.mesh.position.x = vector.x-50;
    this.mesh.position.y = vector.y+15;
    this.mesh.position.z = vector.z-50;
    scene.add(this.mesh);
    CreateBoundingBox(this);
    objects.push(this);
    this.player_id = undefined;
    player.weapon = undefined;
    for(var i = 0; i < player.weapons.length; i++) {
        if(player.weapons[i].name == this.name) {
            player.weapons.splice(i, 1);
            $('#itemimg'+(i+1)).attr('src', '');
            break;
        }
    }
};
*/

    Weapon.prototype.Hide = function(player) {
        if(this.mesh != undefined) {
            this.power = this.min_power;
            for(var i=0; i < this.shots.length; i++) {
                this.shots[i].Destroy();
                this.shots.splice(i, 1);
            }
            player.mesh.remove(this.mesh);
        }
    };

    Weapon.prototype.Show = function(player) {
        player.mesh.add(this.mesh);
        if(net.player != undefined) {
            if(this.player_id == net.player.id) {
                $('#weapon_load_power').width((this.min_power/this.max_power)*100+'%');
                $('#weapon_load_percent').text(Math.min(100, Math.round(((this.min_power/this.max_power)*100)))+'%');
            }
        }
    };

    Weapon.prototype.Create = function(args) {
        this.player_id = args.player_id,
            this.max_power = args.data.max_power;
        this.power = args.data.min_power;
        this.min_power = args.data.min_power;
        this.reload_time = args.data.reload_time;
        this.explode_area = args.data.explode_area;
        this.Spawn(args);
    };

    Weapon.prototype.Load = function(delta) {
        if(this.power < this.max_power) { 
            this.power += this.min_power*delta;
            if(net.player != undefined) {
                if(this.player_id == net.player.id) {
                    $('#weapon_load_power').width(((this.power/this.max_power)*100)+'%');
                    $('#weapon_load_percent').text(Math.min(100, Math.round(((this.power/this.max_power)*100)))+'%');
                }
            }
        }
    };

    Weapon.prototype.Shoot = function(player) {
        this.reload_current = 0;
        this.power = this.min_power;
        if(net.player != undefined) {
            if(this.player_id == net.player.id) {
                $('#weapon_load_power').width((this.min_power/this.max_power)*100+'%');
                $('#weapon_load_percent').text(Math.min(100, Math.round(((this.min_power/this.max_power)*100)))+'%');
            }
        }
    };

    Weapon.prototype.Draw = function(time, delta, index) {
        if(this.reload_current < this.reload_time) {
            //if(this.player_id == net.player_id) {
            $('#weapon_reload_power').width((this.reload_current/this.reload_time)*100+'%');
            this.reload_current += delta;
            //}
        }
        for(var i = 0; i < this.shots.length; i++) {
            if(this.shots[i].isAlive() == 0) {
                this.shots.splice(i, 1);
            } else {
                this.shots[i].Draw(time, delta);
            }
        }

        if(this.player_id == undefined) {
            // TBD: Animate weapon!
            //this.mesh.rotation.x = Math.sin(time/4);
        }
    };

    Weapon.prototype.Rotate = function(val) {
        this.mesh.rotation.z = val;
    };
}

/////////////////////////////////////////////////////////////
// Blaster
/////////////////////////////////////////////////////////////
function Blaster() {
    Weapon.call(this);
    this.name = "blaster";
    this.image = "models/weapons/Blaster/Blaster.png";
    this.reload_sound = "blaster_reload";
    this.scale = 0.5;
    this.drop_scale = 0.15;
    this.x = 0;
    this.y = 25;
    this.z = 10;

    Blaster.prototype.Rotate = function(val) {
        this.mesh.rotation.x = -val;
    };

    Blaster.prototype.Spawn = function(args) {
        this.reload_current = this.reload_time;
        var gun = new THREE.Object3D();

        var gun1 = modelLoader.GetModel('blaster');
        var gun2 = modelLoader.GetModel('blaster');

        gun1.scale.set(this.scale, this.scale, this.scale);
        gun2.scale.set(this.scale, this.scale, this.scale);

        gun1.position.set(60, 25, 10);
        gun2.position.set(-60, 25, 10);

        gun.add(gun1);
        gun.add(gun2);	
        if(args.parent != undefined) {
            args.parent.add(gun);
        } else {
            scene.add(gun);
        }
        this.mesh = gun;
    }

    Blaster.prototype.Shoot = function(player) {
        if(this.reload_current < this.reload_time) {
            return;
        } 
        soundLoader.PlaySound("blaster");

        //	this.shots.push(missile);

        // Gunsmoke!
        var smoke = new ParticleEngine();
        var smoke2 = new ParticleEngine();
        var vector = new THREE.Vector3(0,0,0);
        smoke.setValues(
            {
                positionStyle    : Type.CUBE,
                positionBase   : new THREE.Vector3(vector.x-75, vector.y+75, vector.z+140),
                positionSpread   : new THREE.Vector3( 5, 15, 5 ),

                velocityStyle    : Type.CUBE,
                velocityBase     : new THREE.Vector3( 0, 10, 0 ),
                velocitySpread   : new THREE.Vector3( 0, 10, 0 ), 
                accelerationBase : new THREE.Vector3( 0,-15,0 ),

                particleTexture : THREE.ImageUtils.loadTexture( 'textures/smokeparticle.png'),

                angleBase               : 0,
                angleSpread             : 120,
                angleVelocityBase       : 0,
                angleVelocitySpread     : 120,

                sizeTween    : new Tween( [0, 0.5], [32, 128] ),
                opacityTween : new Tween( [0.8, 2], [0.5, 0] ),
                colorTween   : new Tween( [0.9, 0.5], [ new THREE.Vector3(0.9,0.0,0.2), new THREE.Vector3(0.5, 0, 0.5) ] ),

                particlesPerSecond : 20,
                particleDeathAge   : 0.6,		
                emitterDeathAge    : 0.2

            });
            smoke2.setValues(
                {
                    positionStyle    : Type.CUBE,
                    positionBase   : new THREE.Vector3(vector.x+75, vector.y+75, vector.z+140),
                    positionSpread   : new THREE.Vector3( 5, 15, 5 ),

                    velocityStyle    : Type.CUBE,
                    velocityBase     : new THREE.Vector3( 0, 10, 0 ),
                    velocitySpread   : new THREE.Vector3( 0, 10, 0 ), 
                    accelerationBase : new THREE.Vector3( 0,-15,0 ),

                    particleTexture : THREE.ImageUtils.loadTexture( 'textures/smokeparticle.png'),

                    angleBase               : 0,
                    angleSpread             : 120,
                    angleVelocityBase       : 0,
                    angleVelocitySpread     : 120,

                    sizeTween    : new Tween( [0, 0.5], [32, 128] ),
                    opacityTween : new Tween( [0.8, 2], [0.5, 0] ),
                    colorTween   : new Tween( [0.9, 0.5], [ new THREE.Vector3(0.9,0.0,0.2), new THREE.Vector3(0.5, 0, 0.5) ] ),

                    particlesPerSecond : 20,
                    particleDeathAge   : 0.6,		
                    emitterDeathAge    : 0.2

                });

                smoke.initialize(this.mesh);
                smoke2.initialize(this.mesh);
                objects.push(smoke);
                objects.push(smoke2);
                Weapon.prototype.Shoot.call(this, player);
    };

}
Blaster.prototype = new Weapon();
Blaster.prototype.constructor = Blaster;

/////////////////////////////////////////////////////////////
// Shotgun
/////////////////////////////////////////////////////////////
function Shotgun() {
    Weapon.call(this);
    this.name = "shotgun";
    this.image = "models/weapons/Shotgun/shotgun.png";
    this.reload_sound = "shotgun_reload";
    this.scale = 1;

    Shotgun.prototype.Spawn = function(args) {
        this.reload_current = this.reload_time;
        ///args.parent.model.setWeapon(4);

        var gun = new THREE.Object3D();
        var gun1 = modelLoader.GetModel('shotgun');
        var gun2 = modelLoader.GetModel('shotgun');

        gun1.position.set(150, 25, 10);
        gun1.scale.set(this.scale, this.scale, this.scale);
        //rotateAroundObjectAxis(gun1, new THREE.Vector3(0,1,0), -Math.PI/2);
        gun2.position.set(-180, 55, 20);
        gun2.scale.set(this.scale, this.scale, this.scale);
        //rotateAroundObjectAxis(gun2, new THREE.Vector3(0,1,0), -Math.PI/4);
        rotateAroundWorldAxis(gun2, new THREE.Vector3(0,0,1), -Math.PI/2);

        gun.add(gun1);
        gun.add(gun2);

        if(args.parent != undefined) {
            args.parent.add(gun);
        } else {
            scene.add(gun);
        }
        this.mesh = gun;

    }

    Shotgun.prototype.Shoot = function(player) {
        if(this.reload_current < this.reload_time) {
            return;
        } 
        soundLoader.PlaySound("shotgun", this.mesh.position, 300);
        soundLoader.PlaySound("shotgun_reload", this.mesh.position, 300);
        //	this.shots.push(missile);
        //	Weapon.prototype.Shoot.call(this);
        Weapon.prototype.Shoot.call(this, player);
    };

}
Shotgun.prototype = new Weapon();
Shotgun.prototype.constructor = Shotgun;

/////////////////////////////////////////////////////////////
// Devestator
/////////////////////////////////////////////////////////////
function Devastator() {
    Weapon.call(this);
    this.name = "devastator";
    this.image = "models/weapons/Devastator/devastator.png";
    this.scale = 0.5;
    this.drop_scale = 1;
    this.div_scale = 1.5;
    this.x = -40;
    this.y = 10;
    this.z = -50;

    Devastator.prototype.Spawn = function(args) {
        this.reload_current = this.reload_time;
        var object = modelLoader.GetModel('devastator');
        object.position.set(this.x, this.y, this.z);
        object.position.set(-40, 10, -50);	
        if(camera.position.z == 0) {
            object.scale.set(this.scale/this.div_scale, this.scale/this.div_scale, this.scale/this.div_scale);
        } else {
            object.scale.set(this.scale, this.scale, this.scale);
        }
        rotateAroundObjectAxis(object, new THREE.Vector3(0,1,0), -Math.PI/2);

        if(args.parent != undefined) {
            args.parent.add(object);
        } else {
            scene.add(object);
        }
        this.mesh = object;
    }

    Devastator.prototype.Shoot = function(player) {
        var missile = new DevastatorShot();
        missile.Create({
            explode_area: this.explode_area,
            mesh: this.mesh,
            degree: this.mesh.rotation.z,
            power:this.power,
            scale: 5,
            player_id: player.id
        });
        this.shots.push(missile);

        soundLoader.PlaySound("rocketlauncher", this.mesh.position, 300);

        // Gunsmoke!
        var smoke = new ParticleEngine();
        var vector = new THREE.Vector3(0,0,0);
        smoke.setValues(
            {
                positionStyle    : Type.CUBE,
                positionBase   : new THREE.Vector3(vector.x-10, vector.y+10, vector.z),
                positionSpread   : new THREE.Vector3( 2, 15, 2 ),

                velocityStyle    : Type.CUBE,
                velocityBase     : new THREE.Vector3( 0, 10, 0 ),
                velocitySpread   : new THREE.Vector3( 0, 10, 0 ), 
                accelerationBase : new THREE.Vector3( 0,-15,0 ),

                particleTexture : THREE.ImageUtils.loadTexture( 'textures/smokeparticle.png'),

                angleBase               : 0,
                angleSpread             : 120,
                angleVelocityBase       : 0,
                angleVelocitySpread     : 120,

                sizeTween    : new Tween( [0, 1], [32, 128] ),
                opacityTween : new Tween( [0.8, 2], [0.5, 0] ),
                colorTween   : new Tween( [0.4, 1], [ new THREE.Vector3(0,0,0.2), new THREE.Vector3(0, 0, 0.5) ] ),

                particlesPerSecond : 50,
                particleDeathAge   : 1.0,		
                emitterDeathAge    : 0.5

            });
            smoke.initialize(this.mesh);
            objects.push(smoke);
            Weapon.prototype.Shoot.call(this, player);
    };
}
Devastator.prototype = new Weapon();
Devastator.prototype.constructor = Devastator;


/////////////////////////////////////////////////////////////
// Nuclear
/////////////////////////////////////////////////////////////
function Nuclear() {
    Weapon.call(this);
    this.name = "nuclear";
    this.image = "models/weapons/SuckCannon/SuckCannon.png";
    this.scale = 0.5;
    this.drop_scale = 1;
    this.div_scale = 1.5;
    this.x = -60;
    this.y = 80;
    this.z = -40;

    Nuclear.prototype.Spawn = function(args) {
        this.reload_current = this.reload_time;
        var object = modelLoader.GetModel('suckcannon');
        //object.position.set(-60, 80, -40);
        if(camera.position.z == 0) {
            object.scale.set(this.scale/this.div_scale, this.scale/this.div_scale, this.scale/this.div_scale);
        } else {
            object.scale.set(this.scale, this.scale, this.scale);
        }
        rotateAroundObjectAxis(object, new THREE.Vector3(0,1,0), -Math.PI/2);

        if(args.parent != undefined) {
            args.parent.add(object);
        } else {
            scene.add(object);
        }
        this.mesh = object;
    }

    Nuclear.prototype.Shoot = function(player) {
        if(this.reload_current < this.reload_time) {
            return;
        } 

        var missile = new NuclearShot();
        missile.Create({
            explode_area: this.explode_area,
            mesh: this.mesh,
            degree: this.mesh.rotation.z,
            power:this.power,
            scale: 10,
            player_id: player.id
        });
        this.shots.push(missile);

        soundLoader.PlaySound("rocketlauncher", this.mesh.position, 300);

        // Gunsmoke!
        var smoke = new ParticleEngine();
        var vector = new THREE.Vector3(0,0,0);
        smoke.setValues(
            {
                positionStyle    : Type.CUBE,
                positionBase   : new THREE.Vector3(vector.x+40, vector.y+10, vector.z),
                positionSpread   : new THREE.Vector3( 5, 15, 5 ),

                velocityStyle    : Type.CUBE,
                velocityBase     : new THREE.Vector3( 0, 10, 0 ),
                velocitySpread   : new THREE.Vector3( 0, 10, 0 ), 
                accelerationBase : new THREE.Vector3( 0,-15,0 ),

                particleTexture : THREE.ImageUtils.loadTexture( 'textures/smokeparticle.png'),

                angleBase               : 0,
                angleSpread             : 120,
                angleVelocityBase       : 0,
                angleVelocitySpread     : 120,

                sizeTween    : new Tween( [0, 1], [32, 128] ),
                opacityTween : new Tween( [0.8, 2], [0.5, 0] ),
                colorTween   : new Tween( [0.4, 1], [ new THREE.Vector3(0,0,0.2), new THREE.Vector3(0, 0, 0.5) ] ),

                particlesPerSecond : 50,
                particleDeathAge   : 1.0,		
                emitterDeathAge    : 0.5

            });
            smoke.initialize(this.mesh);
            objects.push(smoke);
            Weapon.prototype.Shoot.call(this, player);
    };
}
Nuclear.prototype = new Weapon();
Nuclear.prototype.constructor = Nuclear;

/////////////////////////////////////////////////////////////
// Destroyer
/////////////////////////////////////////////////////////////
function Destroyer() {
    Weapon.call(this);
    this.name = "destroyer";
    this.image = "models/weapons/RYNO/ryno.png";
    this.scale = 0.5;
    this.drop_scale = 1;
    this.div_scale = 1.5;
    this.x = -20;
    this.y = 80;
    this.z = -60;

    Destroyer.prototype.Spawn = function(args) {
        this.reload_current = this.reload_time;
        var object = modelLoader.GetModel('destroyer');
        object.position.set(-20, 80, -60);
        if(camera.position.z == 0) {
            object.scale.set(this.scale/this.div_scale, this.scale/this.div_scale, this.scale/this.div_scale);
        } else {
            object.scale.set(this.scale, this.scale, this.scale);
        }
        rotateAroundObjectAxis(object, new THREE.Vector3(0,1,0), -Math.PI/2);

        if(args.parent != undefined) {
            args.parent.add(object);
        } else {
            scene.add(object);
        }
        this.mesh = object;
    }

    Destroyer.prototype.Shoot = function(player) {
        if(this.reload_current < this.reload_time) {
            return;
        } 

        for(var i = 0; i <= 9; i++) {
            var missile = new DestroyerShot();
            missile.Create({
                explode_area: this.explode_area,
                mesh: this.mesh,
                degree: this.mesh.rotation.z+Math.random()*10,
                power:this.power-Math.random()*5,
                scale: 2.5,
                player_id: player.id
            });
            this.shots.push(missile);
            soundLoader.PlaySound("rocketlauncher", this.mesh.position, 300);
        }


        var smoke = new ParticleEngine();
        var vector = new THREE.Vector3(0,0,0);
        smoke.setValues(
            {
                positionStyle    : Type.CUBE,
                positionBase   : new THREE.Vector3(vector.x-10, vector.y+10, vector.z+4),
                positionSpread   : new THREE.Vector3( 2, 15, 2 ),

                velocityStyle    : Type.CUBE,
                velocityBase     : new THREE.Vector3( 0, 10, 0 ),
                velocitySpread   : new THREE.Vector3( 0, 10, 0 ), 
                accelerationBase : new THREE.Vector3( 0,-15,0 ),

                particleTexture : THREE.ImageUtils.loadTexture( 'textures/smokeparticle.png'),

                angleBase               : 0,
                angleSpread             : 120,
                angleVelocityBase       : 0,
                angleVelocitySpread     : 120,

                sizeTween    : new Tween( [0, 1], [32, 128] ),
                opacityTween : new Tween( [0.8, 2], [0.5, 0] ),
                colorTween   : new Tween( [0.4, 1], [ new THREE.Vector3(0,0,0.2), new THREE.Vector3(0, 0, 0.5) ] ),

                particlesPerSecond : 100,
                particleDeathAge   : 0.6,		
                emitterDeathAge    : 0.8

            });
            smoke.initialize(this.mesh);
            objects.push(smoke);
            Weapon.prototype.Shoot.call(this, player);
    };
}
Destroyer.prototype = new Weapon();
Destroyer.prototype.constructor = Destroyer;
