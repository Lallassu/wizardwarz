//======================================================
// File: server.js
// Descr: Nodejs server for Wizard Warz.
// 
// Author: Magnus Persson
// Date: 2014-01-31
//======================================================

//======================================================
// Configuration
//======================================================
var version = "0.1";
var port = 8080;

//======================================================
// Initialization
//======================================================
var server = require("http");
var dblite = require('dblite');
var db = dblite('database.db');

// Create database
//db.query('CREATE TABLE players (id INTEGER PRIMARY KEY, name VARCHAR(255), password VARCHAR(255), email VARCHAR(255), level INT, health INT, power INT, experience INT, kills INT, deaths INT, playtime INT, created VARCHAR(25), last_login VARCHAR(25))');

server = server.createServer(Handler);
var io = require("socket.io").listen(server).set('log level',1);
io = io.sockets.on("connection", SocketHandler);
var fs = require("fs");
var path = require("path");
var logger = require('util');
var sys = require('sys');
server.listen(port);

console.log("===================================");
console.log("Server for Wizard Warz");
console.log("Author: nergal");
console.log("Version: "+version);
console.log("===================================");
logger.log("Started server on port "+port);

// TBD: Share file with client that contains constants
// and use some other IDs in case we get some high ID.
// constants
var WATER = 500000;
var SUICIDE = 500001;
var WATER_MIN_DAMAGE = 20;
var WATER_MAX_DAMAGE = 20;
var EXP_PER_KILL = 10;

var World = require('./world');
var Player = require('./player');
var Spells = require('./spells');

//var player = new Player.Player();

// Globals
var sockets = new Array();
var world = new World();
var players = [];
var unique_count = 1;

//======================================================
// Create some bots
//======================================================
function SpawnBots() {
    return;
    for(var i = 0; i < 5; i++) {
        var bot = new Player.Bot();
        bot.level = 1+Math.round(19*Math.random());
        var data = { id: Math.round(Math.random()*5000), name: "[BOT]"};
        bot.CreateNew(data, world, data.id);
        var x = Math.round((bot.px/10)+150);
        var z = Math.round((bot.pz/10)+150);
        bot.py = world.noise[x][z]*200;
        players[bot.id] = bot;
        logger.log("Created new bot");
    }
}

//======================================================
// Initialize
//======================================================
BuildWorld();

//world.GetFreeSpace({width: 5, min_height: 0.5, max_height: 0.7});

//======================================================
// Periodic stuff
//======================================================
UpdateTime();
SpawnSpellBooks();
SpawnHealthPotions();
SpawnPowerPotions();

//PlayerSync();
ServerStat();


//======================================================
//
// Server only stuff
//
//======================================================
// Socket handler
function SocketHandler(socket, data) {
    var ip = socket.handshake.address;
    logger.log("Incoming connection from "+ip.address+":"+ip.port);

    // world
    socket.on('GetTerrain', GetTerrain);
    socket.on('GetTrees', GetTrees);
    socket.on('GetFlowers', GetFlowers);
    socket.on('GetLamps', GetLamps);
    socket.on('GetTowers', GetTowers);
    socket.on('GetHouses', GetHouses);
    socket.on('GetSpellBooks', GetSpellBooks);
    socket.on('GetHealthPotions', GetHealthPotions);
    socket.on('GetPowerPotions', GetPowerPotions);

    // World events
    socket.on('SpellBookHit', SpellBookHit);
    socket.on('PowerPotionHit', PowerPotionHit);
    socket.on('HealthPotionHit', HealthPotionHit);
    socket.on('TreeHit', TreeHit);

    // Events
    socket.on('disconnect', Disconnect);
    socket.on('GetGlobalRanking', GetGlobalRanking);

    // Player
    socket.on('Register', Register);
    socket.on('Login', Login);
    socket.on('ChatMsg', ChatMsg);
    socket.on('ChangeSpell', ChangeSpell);
    socket.on('PlayerRespawn', PlayerRespawn);
    //socket.on('PlayerDied', PlayerDied);
    socket.on('UpdatePlayerPosition', UpdatePlayerPosition);
    socket.on('PlayerShoot', PlayerShoot);
    socket.on('PlayerHit', PlayerHit);
    socket.on('ScoreBoard', ScoreBoard);

    // Servers events
    //socket.on('UpdateTime', UpdateTime);

}

// Server stats output
function ServerStat() {
    var usage = world.CheckFreeSpace();
    logger.log("======================================================");
    logger.log("   Players: "+Length(players));
    logger.log("SpellBooks: "+world.spellBooks.length);
    logger.log(" M_Potions: "+world.powerPotions.length);
    logger.log(" H_Potions: "+world.healthPotions.length);
    logger.log("     Lamps: "+world.lamps.length);
    logger.log("    Towers: "+world.towers.length);
    //    logger.log("    Houses: "+world.houses.length);
    logger.log("     Trees: "+world.trees.length);
    logger.log("   Flowers: "+world.flowers.length);
    logger.log("Space Free: "+usage.free);
    logger.log("Space Used: "+usage.used);
    logger.log("======================================================");

    /*
       var line = "";
       for(var y = 0; y < world.space.length; y++) {
       for(var x = 0; x < world.space[y].length; x++) {
       line += ""+world.space[y][x] + "";
       }
       console.log(line);
       line = "";
       }
       */

    setTimeout(ServerStat, 60000);
}

//======================================================
//
// Generic world stuff
//
//======================================================
// Update world time
function UpdateTime() {
    var data = world.GetTimeLeft();
    io.emit("UpdateTime", data);
    if(data.time_left <= 0) {
        logger.log("Map ended - new map");
        BuildWorld();
        io.emit("new_map", {});
        world.time_left = world.time_total;
        for(var p in players) {
            // reset players stats
            players[p].Reset();
        }
    }
    setTimeout(UpdateTime, 1000);
}


//======================================================
//
// World events
//
//======================================================
//======================================================
// setup socket events
//======================================================
// Build a new world
function BuildWorld() {

    // Generate random lamps/towers/crates for each maps
    world.max_lamps = 0; //1+Math.round(Math.random()*2);
    world.max_spell_books = 10+Math.round(Math.random()*5);
    world.max_health_potions = 10+Math.round(Math.random()*10);
    world.max_power_potions = 10+Math.round(Math.random()*10);
    world.max_towers = 0; //Math.round(Math.random()*world.max_lamps);

    // Generate terrain
    logger.log("Generating world.");
    world.Generate();

    // Generate trees
    logger.log("Generating trees.");
    world.GenerateTrees();

    logger.log("Generating crates.");
    world.spellBooks = undefined;
    world.spellBooks = new Array();
    world.SpawnSpellBooks();
    world.healthPotions = undefined;
    world.healthPotions = new Array();
    world.SpawnHealthPotions();
    world.powerPotions = undefined;
    world.powerPotions = new Array();
    world.SpawnPowerPotions();

    // Flowers
    //    logger.log("Generating Houses.");
    //    world.GenerateHouses();

    logger.log("Generating flowers.");
    world.GenerateFlowers();

    logger.log("Generating lamps.");
    world.GenerateLamps();

    logger.log("Generating Towers.");
    world.GenerateTowers();

    // Spawn some bots
    // SpawnBots();

    // Goombas
    //logger.log("Generating goombas.");
}

// Update player stats
function PlayerSync() {
    for(var k in players) {
        io.emit("PlayerSync", { player: players[k] });
        logger.log("Sync players ("+players.length+")");
    }
    setTimeout(PlayerSync, 10000);
}

// Update power potions
function SpawnPowerPotions() {
    if(world.powerPotions.length < world.max_power_potions) {
        world.SpawnPowerPotions();
        io.emit("BuildPowerPotions", { powerPotions: world.powerPotions });
        logger.log("Spawn new power potions ("+world.powerPotions.length+")");
    }
    setTimeout(SpawnPowerPotions, Math.random()*20000);
}

// Update health potions
function SpawnHealthPotions() {
    if(world.healthPotions.length < world.max_health_potions) {
        world.SpawnHealthPotions();
        io.emit("BuildHealthPotions", { healthPotions: world.healthPotions });
        logger.log("Spawn new health potions ("+world.healthPotions.length+")");
    }
    setTimeout(SpawnHealthPotions, Math.random()*20000);    
}

// Update spell books
function SpawnSpellBooks() {
    if(world.spellBooks.length < world.max_spell_books) {
        world.SpawnSpellBooks();
        io.emit("BuildSpellBooks", { spellBooks: world.spellBooks });
        logger.log("Spawn new spellBooks ("+world.spellBooks.length+")");
    }
    setTimeout(SpawnSpellBooks, Math.random()*20000);    
}

// Tree hit
function TreeHit(data) {
    this.broadcast.emit("TreeHit", data);
}

//  Power Potion hit
function PowerPotionHit(data) {
    var item = world.RemovePowerPotion(data);
    if(players[data.player_id].AddItem(item)) {
        this.emit("Item", { item: item, player_id: data.player_id });
        this.broadcast.emit("Item", { item: item, player_id: data.player_id});
    }
    this.broadcast.emit("RemovePowerPotion", { id: data.id });
}

// Health Potion hit
function HealthPotionHit(data) {
    var item = world.RemoveHealthPotion(data);
    if(players[data.player_id].AddItem(item)) {
        this.emit("Item", { item: item, player_id: data.player_id });
        this.broadcast.emit("Item", { item: item, player_id: data.player_id});
    }
    this.broadcast.emit("RemoveHealthPotion", { id: data.id });
}

// Spell Book hit
function SpellBookHit(data) {
    world.RemoveSpellBook(data);
    var spell = new Spells.Spell();
    var item = spell.NewSpell(players[data.player_id].level);
    var exists = 0;
    for(var i = 0; i < players[data.player_id].spells.length; i++) {
        if(players[data.player_id].spells[i].type == item.type) {
            exists = 1;
        }
    }
    if(!exists) {
        if(players[data.player_id].AddItem(item)) {
            this.emit("Item", { item: item, player_id: data.player_id });
            this.broadcast.emit("Item", { item: item, player_id: data.player_id});
        }
    }
    this.broadcast.emit("RemoveSpellBook", { id: data.id });
}

// Get flowers
function GetFlowers(data) {
    logger.log("Got flowers request...");
    this.emit("BuildFlowers", { flowers: world.flowers });
}

// Get towers
function GetTowers(data) {
    logger.log("Got towers request...");
    this.emit("BuildTowers", { towers: world.towers });
}

// Get Road House
function GetHouses(data) {
    logger.log("Got house request...");
    this.emit("BuildHouses", { houses: world.houses });
}

// Get lamps
function GetLamps(data) {
    logger.log("Got lamps request...");
    this.emit("BuildLamps", { lamps: world.lamps });
}

// Get trees
function GetTrees(data) {
    logger.log("Got tree request...");
    this.emit("BuildTrees", { trees: world.trees });
}

// Get power potions
function GetPowerPotions(data) {
    logger.log("Got m_potions request...");
    this.emit("BuildPowerPotions", { powerPotions: world.powerPotions });
}

// Get health potions
function GetHealthPotions(data) {
    logger.log("Got h_potions request...");
    this.emit("BuildHealthPotions", { healthPotions: world.healthPotions });
}

// Get spell books
function GetSpellBooks(data) {
    logger.log("Got spellbook request...");
    this.emit("BuildSpellBooks", { spellBooks: world.spellBooks });
}

// Get terrain
function GetTerrain(data) {
    logger.log("Got terrain request...");
    this.emit("BuildTerrain", { noise: world.noise });
}

// Scoreboard for map
function ScoreBoard(data) {
    // this.emit("ScoreBoard", world.players);
    var data = [];
    for(var p in players) {
        data.push({name: players[p].name,
                  level: players[p].level,
                  health: players[p].health,
                  power: players[p].power,
                  exp: players[p].experience,
                  kills: players[p].kills,
                  deaths: players[p].deaths,
        });
    }

    this.emit("ScoreBoard", { ranking: data });
}

// Get global ranking
function GetGlobalRanking() {
    var s = this;
    db.query(
        'SELECT name,level,health,power,experience,kills,deaths FROM players WHERE id > ? order by level desc',
        [0],
        function (rows) {
            var data = [];
            for(var i = 0 ; i < rows.length; i++) {
                data.push({name: rows[i][0],
                          level: rows[i][1],
                          health: rows[i][2],
                          power: rows[i][3],
                          exp: rows[i][4],
                          kills: rows[i][5],
                          deaths: rows[i][6],
                });
            }
            s.emit("GlobalRanking", { ranking: data });
        }
    );
}

//======================================================
//
// Player events
//
//======================================================

function ChatMsg(data) {
    logger.log("ChatMsg <"+data.player_id+">: "+data.msg);
    this.broadcast.emit("ChatMsg", data);
    this.emit("ChatMsg", data);
}

function PlayerHit(data) {
    // TBD: Handle hit by other than player?
    var damage = 0;
    if(players[data.by_id] != undefined) {
        console.log("BY_ID: "+data.by_id);
        console.log(players[data.by_id].spells);
        damage = players[data.by_id].spell.GetDamage(players[data.by_id].level);
        data.dmg = damage;
        data.by_name = players[data.by_id].name;
        this.emit("ServerMsg", { msg_color: "#FFFF00", msg: "You did "+damage + " dmg to "+players[data.player_id].name+"."});
    } else {
        switch(data.by_id) {
            case WATER:
                data.dmg = Math.round(WATER_MIN_DAMAGE+Math.random()*WATER_MAX_DAMAGE);
            damage = data.dmg;
            data.by_name = "...erhm, you drowned";
            //this.emit("ServerMsg", { msg_color: "#FF0000", msg: "You can't breath! -"+damage +"hp"});
            data.by_id = "breathing issues";
            break;
            case SUICIDE:
                data.dmg = 5000;
            damage = data.dmg;
            data.by_name = "...erhm..you killed yourself";
            //this.emit("ServerMsg", { msg_color: "#FF0000", msg: "You can't breath! -"+damage +"hp"});
            data.by_id = "suicide";
            console.log(data);
            players[data.player_id].Died(data, db);
            this.emit("PlayerDied", data);
            break;
        }
    }

    this.broadcast.emit("PlayerHit", data);
    this.emit("PlayerHit", data);

    //    if(this.player.id != data.player_id) {
    //  }
    players[data.player_id].DecrHealth(damage);
    if(players[data.player_id].health == 0 && players[data.player_id].dead == 0) {
        this.broadcast.emit("PlayerDied", data);
        this.emit("PlayerDied", data);
        players[data.player_id].Died(data, db);
        if(players[data.by_id] != undefined) {
            data.exp = EXP_PER_KILL;
            data.other_level = players[data.player_id].level;
            data.socket = this;
            this.emit("ServerMsg", {msg_color: "#00FF00", msg: "You gained "+players[data.by_id].KillPlayer(data, db) + " EXP."});
            this.broadcast.emit("ServerMsg", { msg_color: "#FF00FF", msg: players[data.by_id].name + " killed "+players[data.player_id].name + " with a "+players[data.by_id].spell.type+"."});
            this.emit("ServerMsg", { msg_color: "#FF00FF", msg: players[data.by_id].name + " killed "+players[data.player_id].name + " with a "+players[data.by_id].spell.type+"."});
        }

    }
}

/*
   function PlayerDied(data) {
   this.broadcast.emit("PlayerDied", data);
   players[data.player_id].Died(data);

   if(players[data.by_id] != undefined) {
   players[data.by_id].KillPlayer(data);
   this.broadcast.emit("ServerMsg", { msg_color: "#FF00FF", msg: players[data.by_id].name + " killed "+players[data.player_id].name + " with a "+players[data.by_id].weapon+"."});
   }
   }
   */

function PlayerRespawn(data) {
    players[data.id].GenerateSpawnPoint(world);
    // players[data.id].Reset();
    this.emit("PlayerRespawn", players[data.id]);
    this.broadcast.emit("PlayerRespawn", players[data.id]);
}

function PlayerShoot(data) {
    this.broadcast.emit("PlayerShoot", data);
}

// Handle disconnect by user
function Disconnect() {
    var i = sockets.indexOf(this);
    if(this.player != undefined) {
        logger.log("disconnected user: "+this.player.name);
        this.broadcast.emit("RemovePlayer", {player: this.player});
        delete players[this.player.id];
    }
    sockets.splice(i, 1);
}

// Update player position
function UpdatePlayerPosition(data) {
    if(players[data.player_id] != undefined) {
        players[data.player_id].UpdatePosition(data);
        this.broadcast.emit("UpdatePlayerPosition", data);
    }
}

// Change Weapon
function ChangeSpell(data) {
    logger.log("Player: "+ data.player_id + " changed spell to: "+data.spell_type);

    var exists = 0;
    for(var i = 0; i < players[data.player_id].spells.length; i++) {
        if(players[data.player_id].spells[i].type == data.spell_type) {
            players[data.player_id].spell = players[data.player_id].spells[i];
            this.broadcast.emit("ChangeSpell", data);
            break;
        }
    }
}

// Login with player
function Login(data) {
    logger.log("Player login: "+data.name);
    var s = this;
    db.query(
        'SELECT name,id, health, level,experience FROM players where name = ? and password = ?',
        [data.name, data.password],
        function (rows) {
            if(rows.length > 0) {
                var player = new Player.Player();
                player.CreateNew(data, world, rows[0][1]);
                console.log(rows);
                player.max_health = rows[0][2];
                player.level = rows[0][3];
                player.experience = rows[0][4];
                player.CheckLevelUp(0,0,1); // only update next level exp
                s.player = player;
                sockets.push(s);
                players[player.id] = player;
                s.emit("SpawnPlayer", { player: player });
                for(var k in players) {
                    if(s.player.id != players[k].id) {
                        console.log("Add => "+players[k].name);
                        s.emit("AddPlayer", { player: players[k] });
                        //Add spells to this player
                        for(var i = 0; i < players[k].spells.length; i++) {
                            var item = { type: players[k].spells[i] };
                            s.emit("Item", { item: item, player_id: players[k].id });
                            logger.log(" => Player "+players[k].name+" ADD spell: "+players[k].spell);
                        }
                        //Change to active spell for this player
                        if(players[k].spell != undefined) {
                            logger.log(" => Player "+players[k].name+" has spell: "+players[k].spell);
                            s.emit("ChangeSpell", {spell_type: players[k].spell, player_id: players[k].id});
                        }
                    }
                }
                s.broadcast.emit("AddPlayer", { player: player});
            } else {
                s.emit("login_error", {error: "Player or password incorrect."});
            }
        }
    );
}

// Register new player
function Register(data) {
    logger.log("Create new player: "+data.name);

    if(data.name == '' || data.password == '' || data.email == '') {
        return;
    } 
    var s = this;
    db.query(
        'SELECT name,id FROM players where name = ? or email = ?',
        [data.name, data.email],
        function (rows) {
            if(rows.length > 0 ) {
                s.emit("register_error", {error: "Player or email already taken."});
            } else {
                db.query('BEGIN');
                db.query(
                    'INSERT INTO players (name, password, email, level, health, power, experience, kills, deaths, created, last_login) VALUES (?, ?, ?, ?, ?, ?, ? ,? ,?, current_timestamp, current_timestamp)',
                    [data.name, data.password, data.email, 1, 100, 1, 0, 0, 0 ]
                );
                db.query('COMMIT');
                db.lastRowID("players", function(id) {
                    var player = new Player.Player();
                    player.CreateNew(data, world, id);
                    player.CheckLevelUp(0,0,1);
                    s.player = player;

                    sockets.push(s);
                    players[player.id] = player;
                    s.emit("SpawnPlayer", { player: player });
                    s.broadcast.emit("AddPlayer", { player: player});
                });
            }
        }
    );
}

//======================================================
//
// Utility functions
//
//======================================================
function Length(obj) {
    return Object.keys(obj).length;
}

//======================================================
//
// Handler for web requests (webserver)
//
//======================================================
function Handler(req, res)
{                     
    var file = ".." + req.url;
    if(file === "../") {
        file = "../index.html";
    }
    var name = path.extname(file);
    var contentType;
    switch(name) {
        case '.html':
            case '.htm':
            contentType = 'text/html';
        break;
        case '.js':
            contentType = 'text/javascript';
        break;
        case '.css':
            contentType = 'text/css';
        break;
        case '.png':
            contentType = 'image/png';
        break;
        case '.jpg':
            contentType = 'image/jpg';
        break;
    }
    fs.exists(file, function(exists) {
        if(exists) {
            fs.readFile(file,function(err,data) {
                res.writeHead(200, {'Content-Type': contentType});
                res.end(data);
            });
        } else {
            res.writeHead(404, {'Content-Type': contentType});
            res.end("Wizard killed the requested file with a Fireball! R.I.P "+file);
        }
    });
}
