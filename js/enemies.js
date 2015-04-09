/////////////////////////////////////////////////////////////
// Autor: Nergal
// Date: 2014-01-06
/////////////////////////////////////////////////////////////
"use strict";

/////////////////////////////////////////////////////////////
// Enemies base 'class'
/////////////////////////////////////////////////////////////
function Enemies() {
    this.mesh;
    this.health = 10;
    this.damage = 1;
    this.max_speed = 10;
    this.boundary_maxx;
    this.boundary_minx;
    this.boundary_maxz;
    this.boundary_minz;
    this.boundary_miny;
    this.boundary_maxy;

    this.remove = 0;

    this.scale = 1;
    this.pos_x = 0;
    this.pos_y = 0;
    this.pos_z = 0;
    this.offset_y = 0;

    this.canvas_px = -1;
    this.canvas_py = -1;
    this.canvas_fstyle = -1;

    Enemies.prototype.type = "enemy";

    Enemies.prototype.Create = function(args) {
        this.scale = args.scale;
        this.health = args.health;
        this.damage = args.damage;
        this.max_speed = args.max_speed;
        this.boundary_maxx = args.boundary_maxx;
        this.boundary_minx = args.boundary_minx;
        this.boundary_miny = args.boundary_miny;
        this.boundary_maxy = args.boundary_maxy;
        this.boundary_minz = args.boundary_minz;
        this.boundary_maxz = args.boundary_maxz;
        this.Spawn();
    };

    Enemies.prototype.UpdateCanvas = function(x, y) {
        var canvas  = document.getElementById('noise_2');
        var context = canvas.getContext('2d');
        if(this.canvas_fstyle != -1) {
            context.fillStyle = this.canvas_fstyle;
            context.fillRect(this.canvas_px, this.canvas_py, 2, 2);
        }

        this.canvas_px = x;
        this.canvas_py = y;

        var p = context.getImageData(x, y, 2, 2).data;
        if(!((p[1] == 255 || p[0] == 255) && p[1] == 0 && p[2] == 0)) {
            this.canvas_fstyle = "rgb("+p[0]+","+p[1]+","+p[2]+")";
        }	

        context.fillStyle = "rgb(255,0,0)";
        context.fillRect(x, y, 2, 2);
    };

    Enemies.prototype.Die = function() {
        scene.remove(this.mesh);
        this.remove =  1;
    };

    Enemies.prototype.Hit = function(dmg, index) {
        this.health -= dmg;

        var text = new Text();
        text.Create({ text: "-"+dmg,
                    object: this.mesh,
                    y: 50,
                    max_y: 200,
                    color: "#FF0000",
                    scale_x: 300,
                    scale_y: 200,
        });
        objects.push(text);

        if(this.health <= 0) {
            collision_objects.splice(index, 1);
            this.Die();
        }
    };

    Enemies.prototype.Spawn = function() {
        console.log("Base spawn...");
    };

    Enemies.prototype.GetObject = function() {
        return this.mesh;
    };

    Enemies.prototype.Draw = function() {
    };
}

/////////////////////////////////////////////////////////////
// Goomba
/////////////////////////////////////////////////////////////
function Goomba() {
    Enemies.call(this);
    this.name = "Goomba";

    Goomba.prototype.Spawn = function() {
        var object = modelLoader.GetModel('goomba');
        var world = net.terrain.GetNoise();
        while(this.pos_y < this.boundary_miny) {
            this.pos_x = this.boundary_minx+Math.random()*(this.boundary_maxx-this.boundary_minx);
            this.pos_z = this.boundary_minz+Math.random()*(this.boundary_maxz-this.boundary_minz);
            var w_x = Math.round(this.pos_x/10)+world.length/2;
            var w_z = Math.round(this.pos_z/10)+world.length/2;
            this.offset_y = 20;
            this.pos_y = world[w_x][w_z]*200+this.offset_y;
        }

        object.position.set(this.pos_x, this.pos_y, this.pos_z);

        this.mesh = object;
        CreateBoundingBox(this);

        scene.add(object);
    };

    Goomba.prototype.Draw = function(time, delta, index) {
        if(this.mesh == undefined) { return; }

        var angle = (Math.PI/0.3)*delta;
        var distance = this.max_speed * delta;
        if(Math.random()*10 < 0.2) {
            this.mesh.rotateOnAxis( new THREE.Vector3(0,1,0), -Math.PI/Math.random()*4);
        }

        if(this.pos_x < this.boundary_minx || this.pos_x > this.boundary_maxx) {
            this.mesh.rotateOnAxis( new THREE.Vector3(0,1,0), -Math.PI/4);
        } else if(this.pos_z < this.boundary_minz || this.pos_z > this.boundary_maxz) {
            this.mesh.rotateOnAxis( new THREE.Vector3(0,1,0), +Math.PI/4);
        } else if(this.pos_y < this.boundary_miny || this.pos_y > this.boundary_maxy) {
            this.mesh.rotateOnAxis( new THREE.Vector3(0,1,0), +Math.PI/4);
        }
        this.mesh.translateX(distance);
        this.pos_x = this.mesh.position.x;
        this.pos_z = this.mesh.position.z;
        this.pos_y = GetWorldY(this.mesh)+this.offset_y;
        this.mesh.position.set(this.pos_x, this.pos_y, this.pos_z);
    };

}
Goomba.prototype = new Enemies();
Goomba.prototype.constructor = Goomba;

/////////////////////////////////////////////////////////////
// Goomba
/////////////////////////////////////////////////////////////
function Spider() {
    Enemies.call(this);
    this.name = "Spider";

    Spider.prototype.Spawn = function() {
        var object = modelLoader.GetModel('spider');
        var world = net.terrain.GetNoise();
        while(this.pos_y < this.boundary_miny ) {
            this.pos_x = this.boundary_minx+Math.random()*(this.boundary_maxx-this.boundary_minx);
            this.pos_z = this.boundary_minz+Math.random()*(this.boundary_maxz-this.boundary_minz);
            var w_x = Math.round(this.pos_x/20)+world.length/2;
            var w_z = Math.round(this.pos_z/20)+world.length/2;
            this.offset_y = 1;
            this.pos_y = world[w_x][w_z]*200+this.offset_y;
        }

        object.position.set(this.pos_x, this.pos_y, this.pos_z);
        //object.rotation.set(0, 0, 0);
        object.scale.set(this.scale,this.scale,this.scale);
        this.mesh = object;

        scene.add(object);
    };

    Spider.prototype.Draw = function(time, delta, index) {
        if(this.mesh == undefined) { return; }

        this.mesh.updateAnimation(1000*delta);
        this.mesh.phase = ( this.mesh.phase + ( Math.max( 0, this.mesh.rotation.z ) + 10.1 )  ) % 62.83;

        var angle = (Math.PI/0.3)*delta;
        var distance = this.max_speed * delta;
        if(Math.random()*10 < 0.2) {
            this.mesh.rotateOnAxis( new THREE.Vector3(0,1,0), -Math.PI/Math.random()*4);
        }

        if(this.pos_x < this.boundary_minx || this.pos_x > this.boundary_maxx) {
            this.mesh.rotateOnAxis( new THREE.Vector3(0,1,0), -Math.PI/4);
        } else if(this.pos_z < this.boundary_minz || this.pos_z > this.boundary_maxz) {
            this.mesh.rotateOnAxis( new THREE.Vector3(0,1,0), +Math.PI/4);
        } else if(this.pos_y < this.boundary_miny || this.pos_y > this.boundary_maxy) {
            this.mesh.rotateOnAxis( new THREE.Vector3(0,1,0), +Math.PI/4);
        }
        this.mesh.translateZ(distance);
        this.pos_x = this.mesh.position.x;
        this.pos_z = this.mesh.position.z;
        this.pos_y = GetWorldY(this.mesh)+this.offset_y;
        this.mesh.position.set(this.pos_x, this.pos_y, this.pos_z);
    };

}
Spider.prototype = new Enemies();
Spider.prototype.constructor = Spider;

/////////////////////////////////////////////////////////////
// Fish
/////////////////////////////////////////////////////////////
function Fish() {
    Enemies.call(this);
    this.name = "Fish";

    Fish.prototype.Spawn = function() {
        var id = 1+Math.round(Math.random()*3);
        var object = modelLoader.GetModel('fish'+id);
        var world = net.terrain.GetNoise();
        /*
           while(this.pos_y > this.boundary_maxy || this.pos_y < this.boundary_miny) {
           this.pos_x = this.boundary_minx+Math.random()*(this.boundary_maxx-this.boundary_minx);
           this.pos_z = this.boundary_minz+Math.random()*(this.boundary_maxz-this.boundary_minz);
           var w_x = Math.round(this.pos_x/10)+world.length/2;
           var w_z = Math.round(this.pos_z/10)+world.length/2;
           this.pos_y = world[w_x][w_z]*200;
           }*/

        this.pos_x = -2000+Math.random()*4000;
        this.pos_z = -2000+Math.random()*4000;
        this.pos_y = -100+Math.random()*120;
        object.position.set(this.pos_x, this.pos_y, this.pos_z);
        object.scale.set(this.scale,this.scale,this.scale);
        this.mesh = object;

        //	CreateBoundingBox(this);
        scene.add(this.mesh);
    };

    Fish.prototype.Draw = function(time, delta, index) {
        if(this.mesh == undefined) { return; }

        this.mesh.updateAnimation(1000*delta);
        this.mesh.phase = ( this.mesh.phase + ( Math.max( 0, this.mesh.rotation.z ) + 10.1 )  ) % 62.83;

        var angle = (Math.PI/0.3)*delta;
        var distance = this.max_speed * delta;
        if(Math.random()*10 < 0.1) {
            this.mesh.rotateOnAxis( new THREE.Vector3(0,1,0), -Math.PI/Math.random()*4);
        }

        if(Math.random()*10 < 0.8) {	
            if(this.pos_x < this.boundary_minx || this.pos_x > this.boundary_maxx) {
                this.mesh.rotateOnAxis( new THREE.Vector3(0,1,0), -Math.PI/4);
            } else if(this.pos_z < this.boundary_minz || this.pos_z > this.boundary_maxz) {
                this.mesh.rotateOnAxis( new THREE.Vector3(0,1,0), +Math.PI/4);
            } else if(this.pos_y < this.boundary_miny || this.pos_y > this.boundary_maxy) {
                this.mesh.rotateOnAxis( new THREE.Vector3(0,1,0), +Math.PI/4);
            }
        }
        this.mesh.translateZ(distance);
        this.pos_x = this.mesh.position.x;
        this.pos_z = this.mesh.position.z;
        //this.pos_y = GetWorldY(this.mesh);
        this.mesh.position.set(this.pos_x, this.pos_y, this.pos_z);
    };

}
Fish.prototype = new Enemies();
Fish.prototype.constructor = Fish;

/////////////////////////////////////////////////////////////
// Parrot
/////////////////////////////////////////////////////////////
function Parrot() {
    Enemies.call(this);
    this.name = "Parrot";

    Parrot.prototype.Spawn = function() {
        var id = 1+Math.round(Math.random()*3);
        var object = modelLoader.GetModel('parrot');
        var world = net.terrain.GetNoise();

        if ( object.geometry.morphColors && object.geometry.morphColors.length ) {
            var colorMap = object.geometry.morphColors[ 0 ];
            for ( var i = 0; i < colorMap.colors.length; i ++ ) {
                object.geometry.faces[ i ].color = colorMap.colors[ i ];	
            }
        }

        this.pos_x = -2000+Math.random()*4000;
        this.pos_z = -2000+Math.random()*4000;
        this.pos_y = 200+Math.random()*200;
        object.position.set(this.pos_x, this.pos_y, this.pos_z);
        object.scale.set(this.scale,this.scale,this.scale);
        this.mesh = object;

        //	CreateBoundingBox(this);
        scene.add(this.mesh);
    };

    Parrot.prototype.Draw = function(time, delta, index) {
        if(this.mesh == undefined) { return; }

        if(Math.random()*1000 < 2) {
            soundLoader.PlaySound("parot"+(1+Math.round(Math.random()*1)), this.mesh.position, 700);
        }

        this.mesh.updateAnimation(500*delta);
        this.mesh.phase = ( this.mesh.phase + ( Math.max( 0, this.mesh.rotation.z ) + 10.1 )  ) % 62.83;

        var angle = (Math.PI/0.3)*delta;
        var distance = this.max_speed * delta;

        if(Math.random()*10 < 0.2) {	
            if(this.pos_x < this.boundary_minx || this.pos_x > this.boundary_maxx) {
                this.mesh.rotateOnAxis( new THREE.Vector3(0,1,0), -Math.PI/4);
            } else if(this.pos_z < this.boundary_minz || this.pos_z > this.boundary_maxz) {
                this.mesh.rotateOnAxis( new THREE.Vector3(0,1,0), +Math.PI/4);
            } else if(this.pos_y < this.boundary_miny || this.pos_y > this.boundary_maxy) {
                this.mesh.rotateOnAxis( new THREE.Vector3(0,1,0), +Math.PI/4);
            }
        }
        this.mesh.translateZ(distance);
        this.pos_x = this.mesh.position.x;
        this.pos_z = this.mesh.position.z;
        this.pos_y = this.mesh.position.y;
        this.mesh.position.set(this.pos_x, this.pos_y, this.pos_z);
    };

}
Parrot.prototype = new Enemies();
Parrot.prototype.constructor = Parrot;

/////////////////////////////////////////////////////////////
// Flamingo
/////////////////////////////////////////////////////////////
function Flamingo() {
    Enemies.call(this);
    this.name = "Flamingo";

    Flamingo.prototype.Spawn = function() {
        var object = modelLoader.GetModel('flamingo');

        if ( object.geometry.morphColors && object.geometry.morphColors.length ) {
            var colorMap = object.geometry.morphColors[ 0 ];
            for ( var i = 0; i < colorMap.colors.length; i ++ ) {
                object.geometry.faces[ i ].color = colorMap.colors[ i ];	
            }
        }
        object.position.set(Math.random()*4000-1500, 320+Math.random()*400, Math.random()*4000-1500);
        object.scale.set(this.scale,this.scale,this.scale);
        this.mesh = object;
        this.mesh.speed = Math.random()*2;
        this.mesh.duration = 1000;
        this.mesh.time = 1000;
        scene.add(this.mesh);
    };

    Flamingo.prototype.Draw = function(time, delta, index) {
        if(this.mesh == undefined) { return; }
        if(Math.random()*1000 < 2) {
            soundLoader.PlaySound("flamingo", this.mesh.position, 1000);
        }
        this.mesh.position.z += this.max_speed;
        if(this.mesh.position.z > 4000) {
            this.mesh.position.z = -4000;
            this.mesh.position.x = Math.random()*4000-1500;
            this.mesh.position.y = 320+Math.random()*400;
        }

        this.mesh.updateAnimation(200*delta);
        this.mesh.phase = ( this.mesh.phase + ( Math.max( 0, this.mesh.rotation.z ) + 10.1 )  ) % 62.83;
    };

}
Flamingo.prototype = new Enemies();
Flamingo.prototype.constructor = Flamingo;

/////////////////////////////////////////////////////////////
// Turtle
/////////////////////////////////////////////////////////////
function Turtle() {
    Enemies.call(this);
    this.name = "KoopaTroopa";

    Turtle.prototype.Spawn = function() {
        var object = modelLoader.GetModel('turtle');
        var world = net.terrain.GetNoise();
        while(this.pos_y < this.boundary_miny) {
            this.pos_x = this.boundary_minx+Math.random()*(this.boundary_maxx-this.boundary_minx);
            this.pos_z = this.boundary_minz+Math.random()*(this.boundary_maxz-this.boundary_minz);
            var w_x = Math.round(this.pos_x/10)+world.length/2;
            var w_z = Math.round(this.pos_z/10)+world.length/2;
            this.pos_y = world[w_x][w_z]*200;
        }

        object.position.set(this.pos_x, this.pos_y, this.pos_z);
        object.scale.set(this.scale,this.scale,this.scale);
        this.mesh = object;

        CreateBoundingBox(this);
        scene.add(this.mesh);
    };

    Turtle.prototype.Draw = function(time, delta, index) {
        if(this.mesh == undefined) { return; }

        var angle = (Math.PI/0.3)*delta;
        var distance = this.max_speed * delta;
        if(Math.random()*10 < 0.2) {
            this.mesh.rotateOnAxis( new THREE.Vector3(0,1,0), -Math.PI/Math.random()*4);
        }

        if(this.pos_x < this.boundary_minx || this.pos_x > this.boundary_maxx) {
            this.mesh.rotateOnAxis( new THREE.Vector3(0,1,0), -Math.PI/4);
        } else if(this.pos_z < this.boundary_minz || this.pos_z > this.boundary_maxz) {
            this.mesh.rotateOnAxis( new THREE.Vector3(0,1,0), +Math.PI/4);
        } else if(this.pos_y < this.boundary_miny || this.pos_y > this.boundary_maxy) {
            this.mesh.rotateOnAxis( new THREE.Vector3(0,1,0), +Math.PI/4);
        }
        this.mesh.translateZ(distance);
        this.pos_x = this.mesh.position.x;
        this.pos_z = this.mesh.position.z;
        this.pos_y = GetWorldY(this.mesh);
        this.mesh.position.set(this.pos_x, this.pos_y, this.pos_z);
        //this.UpdateCanvas(w_x, w_z);
    };

}
Turtle.prototype = new Enemies();
Turtle.prototype.constructor = Turtle;

/////////////////////////////////////////////////////////////
// Ghost
/////////////////////////////////////////////////////////////
function Ghost() {
    Enemies.call(this);
    this.name = "Boo";

    Ghost.prototype.Spawn = function() {
        var object = modelLoader.GetModel('ghost');
        var world = net.terrain.GetNoise();
        while(this.pos_y < this.boundary_miny) {
            this.pos_x = this.boundary_minx+Math.random()*(this.boundary_maxx-this.boundary_minx);
            this.pos_z = this.boundary_minz+Math.random()*(this.boundary_maxz-this.boundary_minz);
            var w_x = Math.round(this.pos_x/10)+world.length/2;
            var w_z = Math.round(this.pos_z/10)+world.length/2;
            this.offset_y = 100;
            this.pos_y = world[w_x][w_z]*200+this.offset_y;
        }

        object.position.set(this.pos_x, this.pos_y, this.pos_z);
        object.scale.set(this.scale,this.scale,this.scale);

        this.mesh = object;
        CreateBoundingBox(this);
        scene.add(object);
    };

    Ghost.prototype.Draw = function(time, delta, index) {
        if(this.mesh == undefined) { return; }

        var angle = (Math.PI/0.3)*delta;
        var distance = this.max_speed * delta;
        if(Math.random()*10 < 0.2) {
            this.mesh.rotateOnAxis( new THREE.Vector3(0,1,0), -Math.PI/Math.random()*4);
        }

        if(this.pos_x < this.boundary_minx || this.pos_x > this.boundary_maxx) {
            this.mesh.rotateOnAxis( new THREE.Vector3(0,1,0), -Math.PI/4);
        } else if(this.pos_z < this.boundary_minz || this.pos_z > this.boundary_maxz) {
            this.mesh.rotateOnAxis( new THREE.Vector3(0,1,0), +Math.PI/4);
        } else if(this.pos_y < this.boundary_miny || this.pos_y > this.boundary_maxy) {
            this.mesh.rotateOnAxis( new THREE.Vector3(0,1,0), +Math.PI/4);
        }
        this.mesh.translateZ(distance);
        this.pos_x = this.mesh.position.x;
        this.pos_z = this.mesh.position.z;
        this.pos_y = GetWorldY(this.mesh)+this.offset_y;
        this.mesh.position.set(this.pos_x, this.pos_y, this.pos_z);
        //this.UpdateCanvas(w_x, w_z);
    };

}
Ghost.prototype = new Enemies();
Ghost.prototype.constructor = Ghost;

/////////////////////////////////////////////////////////////
// Ghost
/////////////////////////////////////////////////////////////
function Bowser() {
    Enemies.call(this);
    this.name = "Bowser";

    Bowser.prototype.Spawn = function() {
        var object = modelLoader.GetModel('bowser');
        var world = net.terrain.GetNoise();
        while(this.pos_y < this.boundary_miny) {
            this.pos_x = this.boundary_minx+Math.random()*(this.boundary_maxx-this.boundary_minx);
            this.pos_z = this.boundary_minz+Math.random()*(this.boundary_maxz-this.boundary_minz);
            var w_x = Math.round(this.pos_x/10)+world.length/2;
            var w_z = Math.round(this.pos_z/10)+world.length/2;
            this.offset_y = 0;
            this.pos_y = world[w_x][w_z]*200+this.offset_y;
        }

        object.position.set(this.pos_x, this.pos_y, this.pos_z);
        object.scale.set(this.scale,this.scale,this.scale);

        this.mesh = object;
        CreateBoundingBox(this);
        scene.add(object);
    };

    Bowser.prototype.Draw = function(time, delta, index) {
        if(this.mesh == undefined) { return; }

        var angle = (Math.PI/0.3)*delta;
        var distance = this.max_speed * delta;
        if(Math.random()*10 < 0.2) {
            this.mesh.rotateOnAxis( new THREE.Vector3(0,1,0), -Math.PI/Math.random()*4);
        }

        if(this.pos_x < this.boundary_minx || this.pos_x > this.boundary_maxx) {
            this.mesh.rotateOnAxis( new THREE.Vector3(0,1,0), -Math.PI/4);
        } else if(this.pos_z < this.boundary_minz || this.pos_z > this.boundary_maxz) {
            this.mesh.rotateOnAxis( new THREE.Vector3(0,1,0), +Math.PI/4);
        } else if(this.pos_y < this.boundary_miny || this.pos_y > this.boundary_maxy) {
            this.mesh.rotateOnAxis( new THREE.Vector3(0,1,0), +Math.PI/4);
        }
        this.mesh.translateZ(distance);
        this.pos_x = this.mesh.position.x;
        this.pos_z = this.mesh.position.z;
        this.pos_y = GetWorldY(this.mesh)+this.offset_y;
        this.mesh.position.set(this.pos_x, this.pos_y, this.pos_z);
        //this.UpdateCanvas(w_x, w_z);
    };

}
Bowser.prototype = new Enemies();
Bowser.prototype.constructor = Bowser;

/////////////////////////////////////////////////////////////
// Shyguy
/////////////////////////////////////////////////////////////
function Shyguy() {
    Enemies.call(this);
    this.name = "Shyguy";

    Shyguy.prototype.Spawn = function() {
        var object = modelLoader.GetModel('shyguy');
        var world = net.terrain.GetNoise();
        while(this.pos_y < this.boundary_miny) {
            this.pos_x = this.boundary_minx+Math.random()*(this.boundary_maxx-this.boundary_minx);
            this.pos_z = this.boundary_minz+Math.random()*(this.boundary_maxz-this.boundary_minz);
            var w_x = Math.round(this.pos_x/10)+world.length/2;
            var w_z = Math.round(this.pos_z/10)+world.length/2;
            this.offset_y = 0;
            this.pos_y = world[w_x][w_z]*200+this.offset_y;
        }

        object.position.set(this.pos_x, this.pos_y, this.pos_z);
        object.scale.set(this.scale,this.scale,this.scale);

        this.mesh = object;
        CreateBoundingBox(this);
        scene.add(object);
    };

    Shyguy.prototype.Draw = function(time, delta, index) {
        if(this.mesh == undefined) { return; }

        var angle = (Math.PI/0.3)*delta;
        var distance = this.max_speed * delta;
        if(Math.random()*10 < 0.2) {
            this.mesh.rotateOnAxis( new THREE.Vector3(0,1,0), -Math.PI/Math.random()*4);
        }

        if(this.pos_x < this.boundary_minx || this.pos_x > this.boundary_maxx) {
            this.mesh.rotateOnAxis( new THREE.Vector3(0,1,0), -Math.PI/4);
        } else if(this.pos_z < this.boundary_minz || this.pos_z > this.boundary_maxz) {
            this.mesh.rotateOnAxis( new THREE.Vector3(0,1,0), +Math.PI/4);
        } else if(this.pos_y < this.boundary_miny || this.pos_y > this.boundary_maxy) {
            this.mesh.rotateOnAxis( new THREE.Vector3(0,1,0), +Math.PI/4);
        }
        this.mesh.translateZ(distance);
        this.pos_x = this.mesh.position.x;
        this.pos_z = this.mesh.position.z;
        this.pos_y = GetWorldY(this.mesh)+this.offset_y;
        this.mesh.position.set(this.pos_x, this.pos_y, this.pos_z);
        //this.UpdateCanvas(w_x, w_z);
    };

}
Shyguy.prototype = new Enemies();
Shyguy.prototype.constructor = Shyguy;
