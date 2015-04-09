/////////////////////////////////////////////////////////////
// Autor: Nergal
// Date: 2014-01-08
/////////////////////////////////////////////////////////////
"use strict";

// constants
var WATER = 500000;
var SUICIDE = 500001;

/////////////////////////////////////////////////////////////
// Player base 'class'
/////////////////////////////////////////////////////////////
function Player() {
    this.mesh;
    this.y_offset = 2;

    // player stats
    this.health = 0;
    this.max_health = 100;
    this.bonus_dmg = 0;
    this.id;
    this.exp;
    this.level = 1;
    this.next_lvl_exp = 0;

    this.type;
    this.scale = 1;
    this.dead = 0;
    this.died = 0;
    this.respawn = 1;
    this.jump = 0;
    this.t_delta = 0;
    this.jump_power = 20;
    this.attached_camera = 0;
    this.camera_obj;
    this.spells = new Array();
    this.spell = undefined;
    this.mouseDown = 0;
    this.water_time = 0;
    this.collision_time = 0;

    // Potions
    this.powerPotions = new Array();
    this.healthPotions = new Array();

    this.itemFactory = new Factory();

    this.move = 0;
    this.anim_type = "stand";
    this.animation = [];

    Player.prototype.SetAnimation = function(type) {
        if(type != this.anim_type) {
            this.animation[this.anim_type].pause();
            this.anim_type = type;
            this.animation[type].play();
        }
    };


    Player.prototype.LevelUp = function(data) {
        this.level = data.level;
        this.exp = data.exp;
        this.next_lvl_exp = data.nextlvlexp;
        var vector = new THREE.Vector3(0, 0, 0);
        var particleGroup = new SPE.Group({
            texture: THREE.ImageUtils.loadTexture('textures/star.png'),
            maxAge: 5
        });

        var emitter = new SPE.Emitter({
            position: new THREE.Vector3(0, 60, 0),
            positionSpread: new THREE.Vector3( 0, 0, 0 ),

            acceleration: new THREE.Vector3(0, -10, 0),
            accelerationSpread: new THREE.Vector3( 10, 0, 10 ),

            velocity: new THREE.Vector3(0, 15, 0),
            velocitySpread: new THREE.Vector3(10, 7.5, 10),

            colorStart: new THREE.Color('magenta'),
            colorEnd: new THREE.Color('white'),

            duration: 1.5,
            sizeStart: 4,
            sizeEnd: 1,
            particleCount: 1000
        });

        particleGroup.addEmitter( emitter );
        this.mesh.add(particleGroup.mesh);
        objects.push(particleGroup);
        soundLoader.PlaySound("levelup", this.mesh.position, 300);
    };

    // Sync with server
    Player.prototype.Sync = function(data) {
        console.log(data);
    };

    // Combine with Dead function
    Player.prototype.Die = function() {
        this.dead = 1;
        this.health = 0;

        // remove mesh
        //this.shadePlane.material.visible = true;
        scene.remove(this.mesh);

        // add skelton
        var object = modelLoader.GetModel('toad_skeleton');
        var y = GetWorldY(this.mesh);
        object.position.set(this.mesh.position.x, y, this.mesh.position.z);
        object.scale.set(0.5, 0.5, 0.5);
        object.rotation.z = Math.random()*Math.PI;
        object.rotation.x = -Math.PI/2;
        scene.add(object);

        //this.SetAnimation("die");
        this.spell = undefined;
    };

    Player.prototype.Respawn = function(data) {
        if(this.dead == 1) {
            this.dead = 0;
            this.respawn = 1;
            this.health = this.max_health;
            this.px = data.px;
            this.py = data.py;
            this.pz = data.pz;
            this.mesh.position.set(this.px, this.py, this.pz);
            scene.add(this.mesh);
        }
    };

    Player.prototype.Remove = function(data) {
        scene.remove(this.mesh);
    };


    Player.prototype.AddText = function(txt, color_) {
        var text = new Text();
        text.Create({ text: txt,
                    object: this.mesh,
                    y: 250,
                    color: color_,
                    scale_x: 300,
                    scale_y: 200,
        });
    };

    Player.prototype.CheckCollision = function() {
        // nothing
    };

    Player.prototype.AddHealth = function(amount) {
        if(this.health == this.max_health) {
            return;
        }
        this.health += amount;
        if(this.health > this.max_health) {
            this.health = this.max_health;
        }
    };

    Player.prototype.AddPower = function(amount) {
        if(this.spell == undefined) {
            return;
        }
        if(this.spell.power == this.spell.max_power) {
            return;
        }

        this.spell.power += amount;
        if(this.spell.power > this.spell.max_power) {
            this.spell.power = this.spell.max_power;
        }
    };

    Player.prototype.Damage = function(dmg, by_id) {
        if(this.dead) {
            return;
        }
        this.health -= dmg;
        var text = new Text();
        text.Create({ text: "-"+dmg,
                    object: this.mesh,
                    y: 250,
                    color: "#FF0000",
                    scale_x: 500,
                    scale_y: 200,
        });
        objects.push(text);
    };

    Player.prototype.Hit = function(i, by_id) {
        if(this.dead) {
            return;
        }
        net.send_PlayerHit(this.id, by_id);
    };

    Player.prototype.Spawn = function(args) {
        this.id = args.id;
        this.level = args.level;
        this.next_lvl_exp = args.next_lvl_exp;
        this.exp = args.experience;
        this.name = args.name;	
        this.scale = args.scale;
        this.health = args.health;
        this.max_health = args.max_health;
        this.damage = args.bonus_dmg;
        this.px = args.px;
        this.py = args.py;
        this.pz = args.pz;

        this.mesh = modelLoader.GetModel('player');

        if(args.level > 6) {
            args.level = 6; // Remove or increase when more skins are made.
        }
        var mat = this.mesh.material.clone();
        mat.materials[0].map = THREE.ImageUtils.loadTexture("models/player/level"+args.level+".png");
        mat.materials[0].needsUpdate = true;
        this.mesh.material = mat;

        this.scale=1;
        this.animation['stand'] = new THREE.Animation( this.mesh, "stand");
        this.animation['jump'] = new THREE.Animation( this.mesh, "jump"); //THREE.AnimationHandler.CATMULLROM );
        this.animation['walk'] = new THREE.Animation( this.mesh, "walk"); 
        //this.animation['die'] = new THREE.Animation( this.mesh, "die"); 
        this.animation['shoot'] = new THREE.Animation( this.mesh, "shoot"); 
        //	this.animation['fall'] = new THREE.Animation( this.mesh, "fall"); 

        this.mesh.position.set(this.px, this.py, this.pz);
        this.mesh.scale.set(this.scale, this.scale, this.scale);
        this.type = "player";

        // add animation data to the animation handler

        CreateBoundingBox(this);
        this.jump = 1;
        scene.add(this.mesh);

        // args.name
        this.SetName(args.name, args.level, 0x0000FF);
        this.PostSpawn();
    };


    Player.prototype.PostSpawn = function() {

    };    

    Player.prototype.UpdatePos = function(data) {
        this.mesh.position.x = data.px;
        this.mesh.position.y = data.py;
        this.mesh.position.z = data.pz;

        this.mesh.rotation.x = data.rx;
        this.mesh.rotation.y = data.ry;
        this.mesh.rotation.z = data.rz;
    };

    Player.prototype.Draw = function(time, delta) {
        if(this.spell != undefined) {
            this.spell.Draw(time, delta);
        }
    };

}
/////////////////////////////////////////////////////////////
// LocalPlayer sub 'class'
/////////////////////////////////////////////////////////////
function LocalPlayer() {
    Player.call(this);
    this.type = "localplayer";
    this.update_time = 0;
    this.view = 1;
    this.shadePlane = undefined;

    LocalPlayer.prototype.ChangeSpell = function(data) {
        if(this.spell != undefined) {
            if(this.spell.Reloaded()) {
                return;
            }
        }
        if(this.spells[data.id] != undefined) {
            if(this.spell == this.spells[data.id]) {
                return;
            }
            this.spell.Hide(this);
            this.spell = this.spells[data.id];
            this.spell.Show(this);
            $('#weapon_load_power').width((this.spell.default_power/this.spell.max_power)*100+'%');
            $('#weapon_load_percent').text(Math.round(((this.spell.default_power/this.spell.max_power)*100))+'%');
            net.send_ChangeSpell({player_id: this.id, spell_type: data.spell_type});
        }
    };

    LocalPlayer.prototype.SetName = function(name, level, color) {
        var text = new Text();
        text.Create({ text: "["+level+"] "+ name,
                    object: this.mesh,
                    y: 40,
                    color: "#00FFFF"
        });
        return;
    };

    LocalPlayer.prototype.Die = function(by_name) {
        this.RemoveBindings();
        $('#msgboard').fadeIn(1000);
        $('#msgboard_msg').html("You were killed by <font color='#FF0000'>"+by_name+"</font>!<br>Press 'L' to respawn");
        soundLoader.PlaySound("died");
        for(var i= 0; i <= this.spells.length; i++) {
            $('#itemimg'+(i+1)).attr('src', '');
        }
        if(this.spell != undefined) {
            this.spell.Hide(this);
            this.spell = undefined;
        }
        Player.prototype.Die.call(this);
        //this.camera.position.set(0, -1000, -3000);
        this.spells.splice(0, this.spells.length);
    };

    LocalPlayer.prototype.SetCamera = function() {
        this.mesh.add(this.camera_obj);
        this.camera_obj.add(camera);
        if(this.view == 1) {
            camera.position.set(0, 30, 5); // 1st person view
        } else {
            // TBD: base this on model scale instead.
            camera.position.set(0, 60, -100); // 3rd person view
        }

        camera.rotation.set(0, 0, -Math.PI);
        camera.rotation.x = Math.min( Math.PI+1, Math.max( Math.PI, camera.rotation.x ) );

        //camera.rotation.set(-15,0, Math.PI/2);
        //camera.position.set(1200, 650, -1000);

        this.attached_camera = 1;
        this.cam_orig_y = camera.position.y;
    };

    LocalPlayer.prototype.View3rd = function() {
        this.shadePlane.material.opacity = 0.0;
        this.shadePlane.material.visible = false;
        camera.position.set(0, 60, -100);
    };

    LocalPlayer.prototype.ViewFps = function() {
        this.shadePlane.material.visible = true;
        this.shadePlane.material.opacity = 0.0;
        camera.position.set(0, 30, 5);	
    };

    LocalPlayer.prototype.Respawn = function(data) {
        $('#msgboard').fadeOut(1000);
        this.jump = 1;
        this.SetCamera();
        this.AddBindings();
        Player.prototype.Respawn.call(this, data);
        this.UpdateCanvasHealth();
    };

    LocalPlayer.prototype.UpdateCanvasAvatar = function() {
        $('#avatar_name').text(this.name);
        $('#avatar_level').text('Level '+this.level);
        var next = this.next_lvl_exp;
        if(this.next_lvl_exp == 0) {
            next = "?";
        }
        $('#avatar_experience').text('Exp: '+this.exp+"/"+next);
    };

    LocalPlayer.prototype.UpdateCanvasHealth = function() {
        $('#health_load_power').width((this.health/this.max_health)*100+'%');
        $('#health_load_percent').text(Math.round(((this.health/this.max_health)*100))+'%');
    };

    LocalPlayer.prototype.UpdateCanvasPower = function() {
        $('#weapon_load_power').width((this.spell.power/this.spell.max_power)*100+'%');
        $('#weapon_load_percent').text(Math.round(((this.spell.power/this.spell.max_power)*100))+'%');
    };

    LocalPlayer.prototype.CheckCollision = function() {
        // TBD: Get world position of this.mesh and collision_objects[i]
        var thisvector = new THREE.Vector3();
        thisvector.setFromMatrixPosition(this.mesh.matrixWorld);

        var x_max = thisvector.x + this.bsize_x;
        var x_min = thisvector.x - this.bsize_x;
        var y_max = thisvector.y + this.bsize_y;
        var y_min = thisvector.y - this.bsize_y;
        var z_max = thisvector.z + this.bsize_z;
        var z_min = thisvector.z - this.bsize_z;
        var x = thisvector.x;
        var y = thisvector.y;
        var z = thisvector.z;
        for(var i = 0; i < collision_objects.length; i++) {
            if(this.mesh == collision_objects[i]) {
                continue;
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
                        if(collision_objects[i].type == 'enemy') {
                            this.Hit(collision_objects[i].damage, i,collision_objects[i].name);
                        } else if(collision_objects[i].type == 'spellbook' ||
                                  collision_objects[i].type == 'health' ||
                                      collision_objects[i].type == 'power') {
                            collision_objects[i].Hit(this.dmg, i, this);
                        } else if(collision_objects[i].type == 'spell') {
                            collision_objects[i].Pickup(this);
                            collision_objects.splice(i, 1);
                        }
                    }
                }
            }
        }
    };

    LocalPlayer.prototype.OnMouseUp = function(event) {
        var mouseButton = event.keyCode || event.which;
        if(mouseButton === 1){
            this.mouseDown = 0;
            if(this.spell != undefined ) {
                if(this.spell.reload_current < this.spell.reload_time) {
                    return;
                } 
                net.send_PlayerShoot({player_id: this.id, power: this.spell.power});
                this.SetAnimation("shoot");
                this.spell.Shoot(this);
            }
        }
    };

    LocalPlayer.prototype.OnMouseDown = function(event) {
        var mouseButton = event.keyCode || event.which;
        if(mouseButton === 1){ 
            this.mouseDown = 1;
        }
    };

    LocalPlayer.prototype.OnMouseMove = function(jevent) {
        var event = jevent.originalEvent; // jquery convert
        if(this.attached_camera == 1) {
            var movementX = event.movementX || event.mozMovementX || event.webkitMovementX ||0;
            var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
            var	x = movementX*0.001;
            var	y = movementY*0.001;

            var rotateAngle = (Math.PI / 1.5) * x;
            this.mesh.rotateOnAxis( new THREE.Vector3(0,1,0), -rotateAngle);
            camera.rotation.x += y;
            camera.rotation.x = Math.min( Math.PI+1, Math.max( Math.PI, camera.rotation.x ) );
            this.UpdatePos(0.01, 1);
        }
    };

    LocalPlayer.prototype.Damage = function(dmg, by_id) {
        this.health -= dmg;
        var rand_sound = Math.round(1+Math.random()*1);
        soundLoader.PlaySound("hurt");

        this.UpdateCanvasHealth();

        if(net.players[by_id] != undefined) {
            ConsoleMsg("-"+dmg + " health ("+ net.players[by_id].name +")", "FF0000");
        } else {
            ConsoleMsg("-"+dmg + " health ("+ by_id +")", "FF0000");
        }
    };

    LocalPlayer.prototype.PostSpawn = function(args) {
        this.UpdateCanvasHealth();
        this.UpdateCanvasAvatar();
        LockPointer();
        this.AddBindings();
        soundLoader.PlaySound("start");

        var mat = new THREE.MeshPhongMaterial( { color: 0x00CCFF, 
                                              transparent: true,
        opacity: 0.0, 
        shininess: 50.0,
        ambient: 0x555555,
        emissive: 0x555555,
        specular: 0x000000,
        } );
        var geo = new THREE.PlaneGeometry( 100, 100 );
        this.shadePlane = new THREE.Mesh(geo, mat );
        this.shadePlane.rotation.set(0, -Math.PI, 0);
        this.shadePlane.position.set(0, 15, 6);
        this.shadePlane.material.visible = false;
        this.view = 0;
        this.mesh.add(this.shadePlane);

        this.camera_obj = new THREE.Object3D();	
        this.SetCamera();

    };

    LocalPlayer.prototype.AddHealth = function(amount) {
        if(this.health == this.max_health) {
            return;
        }
        ConsoleMsg("+"+amount + "hp", "00FF00");

        var text = new Text();
        text.Create({ text: "+"+amount,
                    object: this.mesh,
                    y: 40,
                    color: "#00FF00",
        });
        objects.push(text);

        soundLoader.PlaySound("found_potion1", this.mesh.position, 200);
        Player.prototype.AddHealth.call(this,amount);
        this.UpdateCanvasHealth();
    };

    LocalPlayer.prototype.AddPower = function(amount) {
        if(this.spell == undefined) { 
            return; 
        }
        if(this.spell.power == this.spell.max_power) {
            return;
        }
        soundLoader.PlaySound("found_potion2", this.mesh.position, 200);
        ConsoleMsg("+"+amount + " Power", "00FFFF");

        var text = new Text();
        text.Create({ text: "+"+amount,
                    object: this.mesh,
                    y: 40,
                    scale: 1.5,
                    color: "#0000FF",
        });
        objects.push(text);

        Player.prototype.AddPower.call(this,amount);
        this.UpdateCanvasPower();
    };

    LocalPlayer.prototype.RemoveBindings = function() {
        $(document).unbind('mousemove');
        $(document).unbind('mouseup');
        $(document).unbind('mousedown');
        this.attached_camera = 0;
    };

    LocalPlayer.prototype.AddBindings = function() {
        $(document).mouseup(this.OnMouseUp.bind(this));
        $(document).mousedown(this.OnMouseDown.bind(this));
        $(document).mousemove(this.OnMouseMove.bind(this));
    };

    LocalPlayer.prototype.Draw = function(time, delta) {
        var anim = "stand";
        if(this.dead == 1) {
            //this.Dead(time, delta);
            if ( keyboard.pressed("L") ) {
                if(this.respawn) {
                    net.send_PlayerRespawn(this.id);
                    this.respawn = 0;
                }
            }
            return;
        }

        if(this.spell != undefined) {
            this.spell.Draw(time, delta);
        }

        // collision items/mob check
        this.collision_time += delta;
        if(this.collision_time >= 0.2) {
            // water fog in 1st person view
            if(this.mesh.position.y - this.y_offset <= 20 && this.view == 1) {
                this.shadePlane.material.visible = true;
                this.shadePlane.material.opacity = 0.7;
            } else {
                this.shadePlane.material.opacity = 0.0;
                this.shadePlane.material.visible = false;
            }
            this.CheckCollision();
            this.collision_time = 0;
        }

        // Health drop under water
        this.water_time += delta;
        if(this.water_time >= 1) {
            // under water check
            if(this.mesh.position.y - this.y_offset <= 0) {
                this.Hit(10+Math.round(Math.random()*20), WATER);
            }
            this.water_time = 0;
        } 

        if(this.health < 0) {
            this.dead = 1;
            this.health = 0;
            this.UpdateCanvasHealth();
        }	

        if(this.mouseDown) {
            if(this.spell != undefined) {
                this.spell.Load(delta);
            }

        }

        var rotateAngle = (Math.PI / 1.5) * delta ;
        var moveDistance = 200 * delta;

        // type text
        if ( keyboard.pressed("T") ){
            $('#console_msg').focus();
            keys_enabled = 0;
        }

        if ( keyboard.pressed("H") ){
            if(!$('#helpboard').is(":visible")) {
                $('#helpboard').show();
            }
            // TBD: possible performance hit!
        } else {
            if($('#helpboard').is(":visible")) {
                $('#helpboard').hide();
            }
        }

        if ( keyboard.pressed("G") ){
            if(!$('#scoreboard').is(":visible")) {
                net.send_ScoreBoard();
                $('#join').hide();
                $('#scoreboard').show();
            }
            // TBD: possible performance hit!
        } else {
            if($('#scoreboard').is(":visible")) {
                $('#scoreboard').hide();
            }
        }

        // move forwards/backwards/left/right
        if ( keyboard.pressed("W") ){
            this.UpdatePos(delta);
            this.mesh.translateZ( moveDistance );
            anim = "walk";
        }
        if ( keyboard.pressed("S") ) {
            this.UpdatePos(delta);
            this.mesh.translateZ(- moveDistance );
            anim = "walk";
        }
        if ( keyboard.pressed("K") ) {
            this.Hit(5000, 0, "suicide");
        }

        if ( keyboard.pressed("esc") ){
            if(!$('#info').is(":visible")) {
                $('#spectate').hide();
                $('#info').show();
                //ReleasePointer();
                //this.RemoveBindings();
            }
            // TBD: possible performance hit!
        } else {
            if($('#info').is(":visible")) {
                $('#info').hide();
                //LockPointer();
                //this.AddBindings();
            }
        }


        var rotation_matrix = new THREE.Matrix4().identity();
        if ( keyboard.pressed("A") ) {
            this.UpdatePos(delta);
            this.mesh.translateX(moveDistance);
        }
        if ( keyboard.pressed("D") ) {
            this.UpdatePos(delta);
            this.mesh.translateX(-moveDistance);
        }
        if ( keyboard.pressed("space") ) {
            anim = "jump";
            this.jump = 1;
        }

        if ( keyboard.pressed("v") ) {
            this.View3rd();
            this.view = 3;
        }
        if ( keyboard.pressed("b") ) {
            this.ViewFps();
            this.view = 1;
        }

        if ( keyboard.pressed("q") ) {
            if(this.spell != undefined) {
                //this.spell.Drop(this);
            }
        }

        if ( keyboard.pressed("1") ) {
            if(this.spells[0] == undefined) {
                return;
            }
            this.ChangeSpell({id: 0, spell_type: this.spells[0].name});
        }

        if ( keyboard.pressed("2") ) {
            if(this.spells[1] == undefined) {
                return;
            }
            this.ChangeSpell({id: 1, spell_type: this.spells[1].name});
        }
        if ( keyboard.pressed("3") ) {
            if(this.spells[2] == undefined) {
                return;
            }
            this.ChangeSpell({id: 2, spell_type: this.spells[2].name});
        }
        if ( keyboard.pressed("4") ) {
            if(this.spells[3] == undefined) {
                return;
            }
            this.ChangeSpell({id: 3, spell_type: this.spells[3].name});
        }
        if ( keyboard.pressed("5") ) {
            if(this.spells[4] == undefined) {
                return;
            }
            this.ChangeSpell({id: 4, spell_type: this.spells[4].name});
        }

        if ( keyboard.pressed("tab") ) {
            // TBD: Do not send multiple times
            net.send_ScoreBoard();
        }

        if(this.jump) {
            var y = GetWorldY(this.mesh)+this.y_offset;
            if(this.mesh.position.y <= y && this.t_delta != 0) {
                this.jump = 0;
                this.t_delta = 0;
                this.mesh.position.y = y;
            } else {
                this.t_delta += delta;
                var tmp = (this.jump_power*this.t_delta)+(0.5)*-32.2*(2*this.t_delta*this.t_delta);
                var y_ = this.mesh.position.y+tmp;
                this.mesh.position.y = y_;
            }
            this.UpdatePos(delta);
        }
        this.SetAnimation(anim);
    };

    LocalPlayer.prototype.UpdatePos = function(delta, mouse) {
        if(!mouse) {
            if(!this.jump) {
                var tmp = (GetWorldY(this.mesh)+this.y_offset) - this.mesh.position.y
                this.mesh.translateY(tmp);
            }
        }
        this.update_time += delta;
        if(this.update_time > 0.05) {
            var world = net.terrain.GetNoise();
            var x = Math.round(this.mesh.position.x/10)+world.length/2;
            var z = Math.round(this.mesh.position.z/10)+world.length/2; // 150 = canvas_size/2
            if(x < world.length-1) {
                if(world[x] != undefined && z < world[x].length-1) {
                    var vol = 1 - world[x][z] - 0.2;
                    if(world[x][z] < 0) { 
                        vol = 1;
                    }
                    if(vol < 0) {
                        vol = 0;
                    }
                    $('#waves').prop("volume", vol);
                }
            }

            net.send_UpdatePlayerPosition({player_id: this.id,
                                          px: this.mesh.position.x,
                                          py: this.mesh.position.y,
                                          pz: this.mesh.position.z,
                                          rx: this.mesh.rotation.x,
                                          ry: this.mesh.rotation.y,
                                          rz: this.mesh.rotation.z,
                                          anim_type: this.anim_type});
                                          this.update_time = 0;
        }
    };
}
LocalPlayer.prototype = new Player();
LocalPlayer.prototype.constructor = LocalPlayer;

/////////////////////////////////////////////////////////////
// NetPlayer sub 'class'
/////////////////////////////////////////////////////////////
function NetPlayer() {
    Player.call(this);
    this.type = "netplayer";

    NetPlayer.prototype.ChangeSpell = function(data) {
        for(var w in this.spells) {
            if(this.spells[w].name == data.spell_type) {
                if(this.spell.name == data.spell_type) {
                    return;
                } else {
                    this.spell.Hide(this);
                    this.spell = this.spells[w];
                    this.spell.Show(this);
                    console.log("Netplayer changed spell to "+data.spell_type);
                    return;
                }
            }
        }
    };

    NetPlayer.prototype.SetName = function(name, level, color) {
        var text = new Text();
        text.Create({ text: "["+level+"] "+name,
                    object: this.mesh,
                    y: 40,
                    color: "#FF0000",
        });
        return;
    };


}
NetPlayer.prototype = new Player();
NetPlayer.prototype.constructor = NetPlayer;
