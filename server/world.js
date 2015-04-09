/////////////////////////////////////////////////////////////
// Autor: Nergal
// Date: 2014-01-31
/////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////
// World class
/////////////////////////////////////////////////////////////
function World() {
    this.time_total = 560;
    this.time_left = 560;
    this.noise;
    this.space;
    this.trees;
    this.flowers;
    this.towers;
    this.houses;
    this.lamps;
    this.world_size = 3000;

    this.max_lamps = 4;
    this.max_towers = 2;
    this.max_spell_books = 40;
    this.max_health_potions = 20;
    this.max_power_potions = 20;
    this.spellBooks = new Array();
    this.healthPotions = new Array();
    this.powerPotions = new Array();
    this.unique_count = 0;

    World.prototype.CheckFreeSpace = function(args) {
        var f = 0;
        var u = 0;
        for(var i = 0; i < 300 ; i++) {
            for(var n = 0; n < 300 ; n++) {
                if(this.space[i][n] == 0) {
                    f++; 
                } else {
                    u++;
                }
            }
        }
        return {used: u, free: f};
    };

    World.prototype.GetFreeSpace = function(args) {
        // Try a few times
        for(var c = 0; c < 4; c++) {
            var seed = Math.round(Math.random()*50);
            //var seed = 0;
            for(var y = args.width + seed; y < this.noise.length - args.width; y++) {
                for(var x = args.width + seed; x < this.noise[y].length - args.width; x++) {
                    var free = 0;
                    for(var p = y-args.width; p < y+args.width; p++) {
                        for(var q = x-args.width; q < x+args.width; q++) {
                            if(this.noise[p][q] <= args.max_height && this.noise[p][q] >= args.min_height && this.space[p][q] == 0) {
                                free++;
                            }
                        }
                    }

                    if(free == args.width*args.width) {
                        // Mark space as used
                        for(var p = y-args.width; p < y+args.width; p++) {
                            for(var q = x-args.width; q < x+args.width; q++) {
                                this.space[p][q] = 1;
                                //var c = this.noise[p][q];
                                this.noise[p][q] = this.noise[p][q];
                                //console.log(this.noise[p][q] +" NOW: "+c);
                            }
                        }
                        // TBD: SMOOOTH EDGES!!
                        var x_ = x;
                        var y_ = y;

                        // TBD
                        /*
                           for(var p = y_-args.width-10; p < y_+args.width+10; p++) {
                           for(var q = x_-args.width-10; q < x_+args.width+10; q++) {
                           var mu_x = Math.random()*q/p;
                           var mu_2 = (1 - Math.cos(mu_x * Math.PI)) / 2;
                           var int_x1 = this.noise[x][y] * (1 - mu_2) + this.noise[x+1][y] * mu_2;
                           var int_x2 = this.noise[x][y+1] * (1 - mu_2) + this.noise[x+1][y+1] * mu_2;
                           var mu_y = Math.random()*p/q
                           var mu_2 = (1 - Math.cos(mu_y * Math.PI)) / 2;
                           var int_y = int_x1 * (1 - mu_2) + int_x2 * mu_2;
                           this.noise[p][q] = int_y;
                           this.space[p][q] = "1";
                           }
                           }
                           */

                        for(var p = y_-args.width-10; p < y_+args.width+10; p++) {
                            var line = "";
                            for(var q = x_-args.width-10; q < x_+args.width+10; q++) {
                                line += ""+this.space[p][q]+ "";
                            }
                            console.log(line);
                            line = "";
                        }

                        /*
                           for(var p = y-args.width-b; p < y+args.width+b; p++) {
                           for(var q = x-args.width-b; q < x-args.width; q++) {
                           var mu_x = ((q%30) / 30);
                           var mu_2 = (1 - Math.sin(mu_x * Math.PI)) / 2;
                           var int_x1     = this.noise[q][p] * (1 - mu_2) + this.noise[q+1][p] * mu_2;
                           var int_x2     = this.noise[q][p+1] * (1 - mu_2) + this.noise[q+1][p+1] * mu_2;
                           var mu_y = ((p%30) / 30);
                           var mu_2 = (1 - Math.cos(mu_y * Math.PI)) / 2;
                           var int_y = int_x1 * (1 - mu_2) + int_x2 * mu_2;
                           this.noise[p][q] = int_y;
                           this.space[p][q] = "x";
                           }
                           }
                           */
                        return {found: 1, pos_x: y_, pos_y: this.noise[y_][x_], pos_z: x_};
                    }
                }
            }
        }
        return {found: 0};
    };

    World.prototype.GetUniqueID = function() {
        return ++this.unique_count;
    };

    World.prototype.RemovePowerPotion = function(args) {
        for(var i = 0; i < this.powerPotions.length; i++) {
            if(this.powerPotions[i].id == args.id) {
                // TBD: Mark used space as free
                var crate = this.powerPotions.splice(i, 1);
                this.space[crate[0].org_x][crate[0].org_y] = 0; // Free space
                return this.GeneratePowerPotion();
            }
        }
    };

    World.prototype.RemoveHealthPotion = function(args) {
        for(var i = 0; i < this.healthPotions.length; i++) {
            if(this.healthPotions[i].id == args.id) {
                // TBD: Mark used space as free
                var crate = this.healthPotions.splice(i, 1);
                this.space[crate[0].org_x][crate[0].org_y] = 0; // Free space
                return this.GenerateHealthPotion();
            }
        }
    };

    World.prototype.RemoveSpellBook = function(args) {
        for(var i = 0; i < this.spellBooks.length; i++) {
            if(this.spellBooks[i].id == args.id) {
                // TBD: Mark used space as free
                var crate = this.spellBooks.splice(i, 1);
                this.space[crate[0].org_x][crate[0].org_y] = 0; // Free space
                return;
            }
        }
    };

    World.prototype.GeneratePowerPotion = function() {
        var item = new Object();
        item = { type: "power", amount: 10+Math.round(Math.random()*100) };
        return item;
    };

    World.prototype.GenerateHealthPotion = function() {
        var item = new Object();
        item = { type: "health", amount: 10+Math.round(Math.random()*100) };
        return item;
    };


    World.prototype.SpawnPowerPotions = function() {
        // Spawn some random amount within max_crates
        var n = this.max_power_potions - this.powerPotions.length;
        if(n == 0) {
            return;
        }
        var amount = Math.round(Math.random()*n);
        while(amount > 0) {
            var x,y;
            do {
                x = Math.round(Math.random()*299);
                y = Math.round(Math.random()*299);
            }while(this.space[x][y] == 1);

            if(this.noise[x][y] > 0.65) {
                this.space[x][y] = 1; // allocate space
                var obj = new Object();
                obj.org_x = x;
                obj.org_y = y;
                obj.x = (x*10)-this.world_size/2;
                obj.y = this.noise[x][y]*200+20;
                obj.z = (y*10)-this.world_size/2;
                obj.id = this.GetUniqueID();
                this.powerPotions.push(obj);
                amount--;
            }
        }
    };

    World.prototype.SpawnHealthPotions = function() {
        // Spawn some random amount within max_crates
        var n = this.max_health_potions - this.healthPotions.length;
        if(n == 0) {
            return;
        }
        var amount = Math.round(Math.random()*n);
        while(amount > 0) {
            var x,y;
            do {
                x = Math.round(Math.random()*299);
                y = Math.round(Math.random()*299);
            }while(this.space[x][y] == 1);

            if(this.noise[x][y] > 0.65) {
                this.space[x][y] = 1; // allocate space
                var obj = new Object();
                obj.org_x = x;
                obj.org_y = y;
                obj.x = (x*10)-this.world_size/2;
                obj.y = this.noise[x][y]*200+20;
                obj.z = (y*10)-this.world_size/2;
                obj.id = this.GetUniqueID();
                this.healthPotions.push(obj);
                amount--;
            }
        }
    };

    World.prototype.SpawnSpellBooks = function() {
        // Spawn some random amount within max_crates
        var n = this.max_spell_books - this.spellBooks.length;
        if(n == 0) {
            return;
        }
        var amount = Math.round(Math.random()*n);
        while(amount > 0) {
            var x,y;
            do {
                x = Math.round(Math.random()*299);
                y = Math.round(Math.random()*299);
            }while(this.space[x][y] == 1);

            if(this.noise[x][y] > 0.65) {
                this.space[x][y] = 1; // allocate space
                var obj = new Object();
                obj.org_x = x;
                obj.org_y = y;
                obj.x = (x*10)-this.world_size/2;
                obj.y = this.noise[x][y]*200+20;
                obj.z = (y*10)-this.world_size/2;
                obj.id = this.GetUniqueID();
                this.spellBooks.push(obj);
                amount--;
            }
        }
    };

    World.prototype.GetTimeLeft = function() {
        this.time_left -= 1;
        return {time_left: this.time_left, time_total: this.time_total};
    };

    World.prototype.GenerateLamps = function() {
        this.lamps = new Array();
        var amount = 0;
        while(amount < this.max_lamps) {
            var x = Math.round(Math.random()*299);
            var y = Math.round(Math.random()*299);
            if(this.noise[x][y] > 0.65) {
                var obj = new Object();
                obj.org_x = x;
                obj.org_y = y;
                obj.x = (x*10)-this.world_size/2;
                obj.y = this.noise[x][y]*200;
                obj.z = (y*10)-this.world_size/2;
                obj.id = this.GetUniqueID();
                obj.size = 400;
                this.lamps.push(obj);
                amount++;
            }
        }
    };

    World.prototype.GenerateHouses = function() {
        this.houses = new Array();
        var count = 0;

        // dock house
        /*
           var obj = new Object();
           var pos = this.GetFreeSpace({width: 15, max_height: 0.3, min_height: 0.1});
           if(pos.found) {
           console.log("GEN DOCK HOUSE:");
           console.log(pos);
           obj.x = (pos.pos_x*10)-this.world_size/2;
           obj.y = pos.pos_y*200;
           obj.z = (pos.pos_z*10)-this.world_size/2;
           obj.id = this.GetUniqueID();
           obj.size = 250;
           obj.type = "dockhouse";
           this.houses.push(obj);
           }
           */

        // road house
        /*
           var obj = new Object();
           var pos = this.GetFreeSpace({width: 10, max_height: 0.55, min_height: 0.5});
           if(pos.found) {
           console.log("GEN ROAD HOUSE:");
           console.log(pos);
           obj.x = (pos.pos_x*10)-this.world_size/2;
           obj.y = pos.pos_y*200;
           obj.z = (pos.pos_z*10)-this.world_size/2;
           obj.id = this.GetUniqueID();
           obj.size = 250;
           obj.type = "roadhouse";
           this.houses.push(obj);
           console.log(obj);
           }
           */

        // market house
        var obj = new Object();
        var pos = this.GetFreeSpace({width: 20, max_height: 0.8, min_height: 0.7});
        if(pos.found) {
            console.log("GEN MARKET HOUSE:");
            console.log(pos);
            obj.x = (pos.pos_x*10)-this.world_size/2;
            obj.y = pos.pos_y*200+30;
            obj.z = (pos.pos_z*10)-this.world_size/2;
            obj.id = this.GetUniqueID();
            obj.size = 250;
            obj.type = "markethouse";
            this.houses.push(obj);
        }
    };

    World.prototype.GenerateTowers = function() {
        this.towers = new Array();
        var count = 0;

        for(var t = 0; t < this.max_towers; t++) {
            var obj = new Object();
            var pos = this.GetFreeSpace({width: 10, max_height: 1.0, min_height: 0.9});
            console.log(pos);
            if(pos.found) {
                obj.x = (pos.pos_x*10)-this.world_size/2;
                obj.y = pos.pos_y*200;
                obj.z = (pos.pos_z*10)-this.world_size/2;
                obj.id = this.GetUniqueID();
                obj.size = 300;
                console.log(obj);
                this.towers.push(obj);
            }
        }

        // Generate towers based on world heights
        /*
           var max_x = 0;
           var max_y = 0;
           var max_z = 0;
           for(var x = 0; x < 299; x++) {
           for(var y = 0; y < 299; y++) {
           if(max_z < this.noise[x][y]) {
           max_z = this.noise[x][y];
           max_x = x;
           max_y = y;
           }
           }
           }
           var obj = new Object();
           obj.x = (max_x*10)-this.world_size/2+100;
           obj.y = max_z*200;
           obj.z = (max_y*10)-this.world_size/2-100;
           obj.id = this.GetUniqueID();
           obj.size = 300;
           this.towers.push(obj);
           */	
        /* Generate towers based on lamps
           for(var l in this.lamps) {
           if(count++ >= this.max_towers) {
           return;
           }
           var x =  this.lamps[l].x;
           var z =  this.lamps[l].z;
           x += 10+Math.round(Math.random()*50);
           z += 10+Math.round(Math.random()*50);
           var y = this.noise[this.lamps[l].org_x][this.lamps[l].org_y]*200;
           var obj = new Object();
           obj.x = x;
           obj.y = y;
           obj.z = z;
           obj.size = 300;
           this.towers.push(obj);
           }
           */
    };

    World.prototype.GenerateFlowers = function() {
        this.flowers = new Array();
        for(var x = 0; x < 300; x++) {
            for(var y= 0; y < 300; y++) {	
                if(this.noise[x][y] > 0.45 && this.noise[x][y] < 0.6) {
                    if(Math.random()*100 > 99.3) {
                        var size = Math.random()*1.0+3.5;
                        var type = Math.round(1+Math.random()*2);
                        this.flowers.push({x: (x*10)-this.world_size/2,
                                          y: this.noise[x][y]*200,
                                          z: (y*10)-this.world_size/2,
                                          size: size,
                                          type: type});
                    }
                }
            }
        }
    };


    World.prototype.GenerateTrees = function() {
        this.trees = new Array();
        for(var x = 0; x < 300; x++) {
            for(var y= 0; y < 300; y++) {	
                if(this.noise[x][y] > 0.55 && this.noise[x][y] < 0.6) {
                    if(Math.random()*100 > 99.4) { 
                        if(this.space[x][y] != 1) {
                            this.space[x][y] = 1;
                            var size = Math.random()*1.5+3.5;
                            this.trees.push({x: (x*10)-this.world_size/2,
                                            y: this.noise[x][y]*200+30,
                                            z: (y*10)-this.world_size/2,
                                            size: size,
                                            id: this.GetUniqueID()
                            });
                        }
                    }
                }
            }
        }
    };

    World.prototype.Generate = function() {
        // Initiate world space to unused.
        this.space = new Array(299);
        for(var i = 0; i < 300; i++) {
            this.space[i] = new Array(299);
            for(var n = 0; n < 300; n++) {
                this.space[i][n] = 0;
            }
        }

        var noiseArr = new Array();
        for(var i = 0; i <= 15; i++) {
            noiseArr[i] = new Array();
            for(var j = 0; j <= 15; j++) {
                var height = Math.random();
                if(i == 0 || j == 0 || i == 5 || j == 5 || j == 10 || i == 10) {
                    height = -0.15;
                }
                noiseArr[i][j] = height;
            }
        }

        this.noise = this.Interpolate(noiseArr);
    };

    World.prototype.Interpolate = function (points) {
        var noiseArr = new Array()
        var x = 0;
        var y = 0;
        var p;

        // make slightly different worlds.
        if(Math.random()*1 > 0.5) {
            p = 30;
        } else {
            p = 60;
        }

        for(var i = 0; i < 300; i++) {
            if(i != 0 && i % p == 0) {
                x++;
            }

            noiseArr[i] = new Array();
            for(var j = 0; j < 300; j++) {
                if(j != 0 && j % p == 0) {
                    y++;
                }
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
}
module.exports = World;
