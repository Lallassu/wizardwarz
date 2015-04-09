/////////////////////////////////////////////////////////////
// Autor: Nergal
// Date: 2014-01-31
/////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////
// Player class
/////////////////////////////////////////////////////////////
function Player() {
    this.name = undefined;
    this.px = 0;
    this.py = 0;
    this.pz = 0;
    this.rx = 0;
    this.ry = 0;
    this.rz = 0;
    this.id = undefined;
    this.experience = 0;
    this.max_health = 100;
    this.max_power = 100;
    this.health = 100;
    this.level = 1;
    this.power = 0;
    this.deaths = 0;
    this.kills = 0;
    this.playtime = 0;
    this.spell = undefined;
    this.spells = new Array();
    this.type = "player";
    this.scale = 1.5;
    this.dead = 0;
    this.next_lvl_exp = 0;


    Player.prototype.CheckLevelUp = function(data, dbh, check) {
        var levelup = 0;
        var left = 0;
        if(this.level == 1 && this.experience > 10) {
            levelup = 1;
            left = 50;
        } else if(this.level == 2 && this.experience > 50) {
            levelup = 1;
            left = 100;
        } else if(this.level == 3 && this.experience > 100) {
            levelup = 1;
            left = 150;
        } else if(this.level == 4 && this.experience > 150) {
            levelup = 1;
            left = 250;
        } else if(this.level == 5 && this.experience > 250) {
            levelup = 1;
            left = 350;
        } else if(this.level == 6 && this.experience > 350) {
            levelup = 1;
            left = 450;
        } else if(this.level == 7 && this.experience > 450) {
            levelup = 1;
            left = 550;
        } else if(this.level == 8 && this.experience > 550) {
            levelup = 1;
            left = 1000;
        }
        if(check) {
            this.next_lvl_exp = left;
            return;
        }

        if(levelup) {
            this.level++;
            dbh.query(
                'update players set level = level+1, health = health+10 where id = ?',
                [this.id]);

                data.socket.emit("ServerMsg", {msg_color: "#33FF33", msg: "** Level up ("+this.level+")! **"});
                //	    data.socket.broadcast.emit("LevelUp", {player_id: this.id});
                data.socket.emit("LevelUp", {player_id: this.id, exp: this.exp, level: this.level, nextlvlexp: left});
                //	}
        }
    };

    Player.prototype.Reset = function() {
        this.health = this.max_health;
        this.spells.length = 0;
        this.spell = undefined;
        this.kills = 0;
        this.deaths = 0;
        this.power = 0;
        this.dead = 0;
    };

    Player.prototype.SaveToDB = function() {
        // TBD: Save all data to DB.
    };

    Player.prototype.KillPlayer = function(data, dbh) {
        var lvl_diff = data.other_level - this.level;
        var gained_exp = data.exp;
        if(lvl_diff > 0) {
            gained_exp = (data.exp*lvl_diff);
        }
        var exp = parseInt(this.experience)*parseInt(gainex_exp);
        this.experience = exp;
        console.log("* Player "+this.name+" gained "+ gained_exp + " NOW: "+this.experience);
        this.kills++;

        this.CheckLevelUp(data, dbh);

        dbh.query(
            'update players set kills = kills + 1, experience = experience + ? where id = ?',
            [gained_exp, this.id]);

            return gained_exp;
    };

    Player.prototype.Died = function(data, dbh) {
        this.deaths++;
        this.dead = 1;
        this.spell = undefined;
        this.spells.length = 0;

        dbh.query(
            'update players set deaths = deaths + 1 where id = ?',
            [this.id]);
    };

    Player.prototype.AddItem = function(item) {
        if(item == undefined) {
            return 0;
        }
        if(item.type == "health") {
            this.IncrHealth(item.amount);
            return 1;
        } else if(item.type == "power") {
            this.IncrPower(item.amount);
            return 1;
        } else {
            var exists = 0;
            for(var i=0; i < this.spells.length; i++) {
                if(this.spells[i] == item.type) {
                    exists = 1;
                    break;
                }
            }
            if(exists) {
                return 0;
            }
            this.spells.push(item);
            this.spell = item;
            return 1;
        }
    };

    Player.prototype.IncrPower = function(amount) {
        this.power += amount;
        if(this.power > this.max_power) {
            this.power = this.max_power;
        }
    }

    Player.prototype.DecrPower = function(amount) {
        this.power -= amount;
        if(this.power < 0) {
            this.power = 0;
        }
    }

    Player.prototype.IncrHealth = function(amount) {
        this.health += amount;
        if(this.health > this.max_health) {
            this.health = this.max_health;
        }
    }

    Player.prototype.DecrHealth = function(amount) {
        this.health -= amount;
        if(this.health < 0) {
            this.health = 0;
        }
    }

    Player.prototype.GetUniqueID = function() {
        return ++this.unique_count;
    };

    Player.prototype.CreateNew = function(args, world, id) {
        this.name = args.name;
        this.id = id; 
        console.log("Create new player: "+args.name + " with id: "+this.id);
        this.GenerateSpawnPoint(world);
    };

    Player.prototype.GenerateSpawnPoint = function(world) {
        this.health = this.max_health;
        this.spells.length = 0;
        this.spell = undefined;
        this.dead = 0;
        this.power = 0;
        this.px = Math.round(1-Math.random()*3000)+world.world_size/2;
        this.pz = Math.round(1-Math.random()*3000)+world.world_size/2;
        this.py = 1000; // spawn up in the air
        console.log("Generate spawn point("+this.name+"): "+this.px+ ","+this.py+","+this.pz);
    };   

    Player.prototype.CreateOld = function(args) {
        // Get from database => data.user, data.password
        this.GenerateSpawnPoint();
    };

    Player.prototype.UpdatePosition = function(data) {
        // Update position
        this.px = data.px;
        this.py = data.py;
        this.pz = data.pz;
        this.rx = data.rx;
        this.ry = data.ry;
        this.rz = data.rz;
    };
}

function Bot() {
    Player.call(this);

    Bot.prototype.Spawn = function() {
        this.name = "[BOT] "+args.name;
        this.id = id; 
        console.log("Create new bot: "+args.name + " with id: "+this.id);
        this.GenerateSpawnPoint(world);
    };

    Bot.prototype.Run = function() {

    };
}
Bot.prototype = new Player();
Bot.prototype.constructor = Bot;
module.exports = { Player: Player, Bot: Bot };
