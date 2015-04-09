////////////////////////////////////////////////////////////
// Autor: Nergal
// Date: 2014-05-06
/////////////////////////////////////////////////////////////
"use strict";

/////////////////////////////////////////////////////////////
// Spells base 'class'
/////////////////////////////////////////////////////////////
function Spell() {
    this.shots = new Array();
    this.type = "spell";
    this.max_power = 0;
    this.min_power = 0;
    this.power = 0;
    this.reload_time = 1;
    this.reload_current = 0;
    this.player_id = undefined;

    Spell.prototype.Reloaded = function() {
        if(net.player != undefined) {
            if(this.player_id == net.player.id) {
                return this.reload_current < this.reload_time ? 1 : 0;
            }
        }
    };

    Spell.prototype.Hide = function(args) {
        // Default opacity for icon
        if(net.player != undefined) {
            if(args.id == net.player.id) {
                var i = 1+args.spells.indexOf(this);
                $('#item'+i).css({'opacity':  0.5});
            }
        }
    };

    Spell.prototype.Show = function(args) {
        // decrease opacity for icon
        if(net.player != undefined) {
            if(this.player_id == net.player.id) {
                var i = 1+args.spells.indexOf(this);
                $('#item'+i).css({'opacity':  1});
                $('#weapon_load_power').width((this.min_power/this.max_power)*100+'%');
                $('#weapon_load_percent').text(Math.min(100, Math.round(((this.min_power/this.max_power)*100)))+'%');
            }
        }
    };

    Spell.prototype.Create = function(args) {
        this.player_id = args.player_id,
            this.max_power = args.item.max_power;
        this.power = args.item.min_power;
        this.min_power = args.item.min_power;
        this.reload_time = args.item.reload_time;
        this.explode_area = args.item.explode_area;
        if(net.player != undefined) {
            if(this.player_id == net.player.id) {
                $('#weapon_load_power').width((this.min_power/this.max_power)*100+'%');
                $('#weapon_load_percent').text(Math.min(100, Math.round(((this.min_power/this.max_power)*100)))+'%');
            }
        }
    };

    Spell.prototype.Load = function(delta) {
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

    Spell.prototype.Draw = function(time, delta, index) {
        if(this.reload_current < this.reload_time) {
            if(net.player != undefined) {
                if(this.player_id == net.player.id) {
                    $('#weapon_reload_power').width((this.reload_current/this.reload_time)*100+'%');
                    this.reload_current += delta;
                }
            }
        }
        for(var i = 0; i < this.shots.length; i++) {
            if(this.shots[i].isAlive() == 0) {
                this.shots.splice(i, 1);
            } else {
                this.shots[i].Draw(time, delta);
            }
        }
    };
}

/////////////////////////////////////////////////////////////
// Fireball
/////////////////////////////////////////////////////////////
function Fireball() {
    Spell.call(this);
    this.name = "Fireball";
    this.image = "icons/fireball.png";
    this.sound = "fireball";

    Fireball.prototype.Shoot = function(player) {
        this.reload_current = 0;
        if(net.player != undefined) {
            if(player.id == net.player.id) {
                $('#weapon_load_power').width((this.min_power/this.max_power)*100+'%');
                $('#weapon_load_percent').text(Math.min(100, Math.round(((this.min_power/this.max_power)*100)))+'%');
            }
        }
        soundLoader.PlaySound(this.sound);

        // Effect
        var particleGroup = new SPE.Group({
            texture: THREE.ImageUtils.loadTexture('textures/smokeparticle.png'),
            maxAge: 2,
            obj: player.mesh,
        });

        var emitter = new SPE.Emitter({
            type: "sphere",
            radius: 10,
            //position: new THREE.Vector3(0, 35, 25),
            positionSpread: new THREE.Vector3( 0, 0, 0 ),

            // acceleration: new THREE.Vector3(0, 5, 0),
            //accelerationSpread: new THREE.Vector3( 10, 0, 10 ),

            // velocity: new THREE.Vector3(10, 15, 10),
            // velocitySpread: new THREE.Vector3(10, 7.5, 10),

            colorStart: new THREE.Color('yellow'),
            colorEnd: new THREE.Color('red'),

            duration: 1,
            sizeStart: 1,
            sizeEnd: 5,
            particleCount: 1000
        });

        //particleGroup.addEmitter( emitter );
        //objects.push(particleGroup);
        //player.mesh.add( particleGroup.mesh );

        var missile = new FireballShot();
        missile.Create({
            explode_area: this.explode_area,
            mesh: player.mesh,
            power:this.power,
            scale: 0.2,
            player_id: player.id
        });
        this.shots.push(missile);

        this.power = this.min_power;
    };
}
Fireball.prototype = new Spell();
Fireball.prototype.constructor = Fireball;

/////////////////////////////////////////////////////////////
// Explosion
/////////////////////////////////////////////////////////////
function Explosion() {
    Spell.call(this);
    this.name = "Explosion";
    this.image = "icons/explosion.png";
    this.sound = "nuclear";

    Explosion.prototype.Shoot = function(player) {
        this.reload_current = 0;
        if(net.player != undefined) {
            if(player.id == net.player.id) {
                $('#weapon_load_power').width((this.min_power/this.max_power)*100+'%');
                $('#weapon_load_percent').text(Math.min(100, Math.round(((this.min_power/this.max_power)*100)))+'%');
            }
        }

        // Effect
        var vector = new THREE.Vector3(0, 0, 0);
        var particleGroup = new SPE.Group({
            texture: THREE.ImageUtils.loadTexture('textures/star.png'),
            maxAge: 1.5
        });

        var emitter = new SPE.Emitter({
            type: 'sphere',
            position: new THREE.Vector3(0, 30, 0),
            radius: this.power,
            speed: 20,

            opacityStart: 0,
            opacityMiddle: 1,
            opacityEnd: 0,

            angleAlignVelocity: 1,

            colorStart: new THREE.Color('white'),
            colorStartSpread: new THREE.Vector3(10, 0, 10),
            colorEnd: new THREE.Color('magenta'),

            duration: 2.0,
            sizeStart: 60,
            sizeEnd: 1,
            particleCount: this.power*20,
        });
        particleGroup.addEmitter( emitter );
        objects.push(particleGroup);
        //     player.mesh.add( particleGroup.mesh );
        particleGroup.mesh.applyMatrix(player.mesh.matrixWorld);
        scene.add( particleGroup.mesh );

        var missile = new ExplosionShot();
        missile.Create({
            explode_area: this.explode_area+this.power,
            mesh: player.mesh,
            power: 1,
            scale: 0.2,
            player_id: player.id
        });
        this.shots.push(missile);

        this.power = this.min_power;
    };
}
Explosion.prototype = new Spell();
Explosion.prototype.constructor = Explosion;

/////////////////////////////////////////////////////////////
// FireRing
/////////////////////////////////////////////////////////////
function FireRing() {
    Spell.call(this);
    this.name = "FireRing";
    this.image = "icons/firering.png";
    this.sound = "explosion3";

    FireRing.prototype.Shoot = function(player) {
        this.reload_current = 0;
        if(net.player != undefined) {
            if(player.id == net.player.id) {
                $('#weapon_load_power').width((this.min_power/this.max_power)*100+'%');
                $('#weapon_load_percent').text(Math.min(100, Math.round(((this.min_power/this.max_power)*100)))+'%');
            }
        }

        var a = 0;
        for(var i = 0; i < 20; i++) {
            a += (Math.PI*2)/20;
            var missile = new FireRingShot();
            missile.Create({
                explode_area: this.explode_area,
                mesh: player.mesh,
                angle: a,
                power: this.power,
                scale: 0.2,
                player_id: player.id
            });
            this.shots.push(missile);
        }
        this.power = this.min_power;
    };
}
FireRing.prototype = new Spell();
FireRing.prototype.constructor = FireRing;

/////////////////////////////////////////////////////////////
// Immolation
/////////////////////////////////////////////////////////////
function Immolation() {
    Spell.call(this);
    this.name = "Immolation";
    this.image = "icons/immolate.png";
    this.sound = "explosion3";

    Immolation.prototype.Shoot = function(player) {
        this.reload_current = 0;
        if(net.player != undefined) {
            if(player.id == net.player.id) {
                $('#weapon_load_power').width((this.min_power/this.max_power)*100+'%');
                $('#weapon_load_percent').text(Math.min(100, Math.round(((this.min_power/this.max_power)*100)))+'%');
            }
        }

        var vector = new THREE.Vector3(0, 0, 0);

        // Burn player
        var particleGroup = new SPE.Group({
            texture: THREE.ImageUtils.loadTexture('textures/smokeparticle.png'),
            maxAge: 3.5,
            obj: this.mesh,
        });

        var emitter = new SPE.Emitter({
            position: new THREE.Vector3(0, 0, 0),
            positionSpread: new THREE.Vector3( 10, 50, 10 ),

            acceleration: new THREE.Vector3(0, 5, 0),
            accelerationSpread: new THREE.Vector3( 10, 0, 10 ),

            velocity: new THREE.Vector3(10, 15, 10),
            velocitySpread: new THREE.Vector3(10, 7.5, 10),

            colorStart: new THREE.Color('orange'),
            colorEnd: new THREE.Color('red'),

            duration: 4,
            sizeStart: 20,
            sizeEnd: 2,
            particleCount: 300,
        });

        particleGroup.addEmitter( emitter );
        objects.push(particleGroup);
        player.mesh.add( particleGroup.mesh );

        // Burn around player
        var particleGroup = new SPE.Group({
            texture: THREE.ImageUtils.loadTexture('textures/smokeparticle.png'),
            maxAge: 3.5,
            obj: this.mesh,
        });

        var emitter = new SPE.Emitter({
            position: new THREE.Vector3(0, 0, 0),
            positionSpread: new THREE.Vector3( 10, 100, 10 ),

            acceleration: new THREE.Vector3(10, 5, 10),
            accelerationSpread: new THREE.Vector3( 10, 10, 10 ),

            velocity: new THREE.Vector3(10, 15, 10),
            velocitySpread: new THREE.Vector3(10, 7.5, 10),

            colorStart: new THREE.Color('orange'),
            colorEnd: new THREE.Color('red'),

            duration: 4,
            sizeStart: 20,
            sizeEnd: 2,
            particleCount: 500,
        });
        particleGroup.addEmitter( emitter );
        objects.push(particleGroup);
        player.mesh.add( particleGroup.mesh );

        var missile = new ExplosionShot();
        missile.Create({
            explode_area: this.explode_area,
            mesh: player.mesh,
            power: 1,
            scale: 0.2,
            player_id: player.id
        });
        this.shots.push(missile);

        this.power = this.min_power;
        // TBD: TEST!
        setTimeout(function() {
            //player.Hit(1000, SUICIDE); // kill player!
            net.send_PlayerHit(player.id, SUICIDE);
        }, 3000);
    };
}
Immolation.prototype = new Spell();
Immolation.prototype.constructor = Immolation;

/////////////////////////////////////////////////////////////
// Blizzard
/////////////////////////////////////////////////////////////
function Blizzard() {
    Spell.call(this);
    this.name = "Blizzard";
    this.image = "icons/blizzard.png";
    this.sound = "devastator";

    Blizzard.prototype.Shoot = function(player) {
        this.reload_current = 0;
        if(net.player != undefined) {
            if(player.id == net.player.id) {
                $('#weapon_load_power').width((this.min_power/this.max_power)*100+'%');
                $('#weapon_load_percent').text(Math.min(100, Math.round(((this.min_power/this.max_power)*100)))+'%');
            }
        }


        var missile = new BlizzardShot();
        missile.Create({
            explode_area: this.explode_area,
            mesh: player.mesh,
            gravity: -10.0,
            power: 5.2,
            player_id: player.id
        });
        this.shots.push(missile);

        this.power = this.min_power;
    };
}
Blizzard.prototype = new Spell();
Blizzard.prototype.constructor = Blizzard;
