/////////////////////////////////////////////////////////////
// Autor: Nergal
// Date: 2014-01-31
/////////////////////////////////////////////////////////////
"use strict";

/////////////////////////////////////////////////////////////
// Network base 'class'
/////////////////////////////////////////////////////////////
function Net() {
    this.socket = undefined;
    this.terrain = undefined;
    this.joined = 0;
    this.trees = [];
    this.lamps = [];
    this.towers = [];
    this.houses = [];
    this.flowers = new Array();
    this.spellBooks = [];
    this.healthPotions = [];
    this.powerPotions = [];
    this.players = [];
    this.player = undefined;

    /////////////////////////////////////////////////////////////
    // Senders 
    /////////////////////////////////////////////////////////////
    Net.prototype.send_Login = function(user, password) {
        this.socket.on("login_error", function(data) {
            $('#main_window').html("<font color='#FF0000'>"+data.error+"</font>"); 
            player_login = "";
            player_password = "";
        });
        this.socket.emit("Login", { name: user, password: password });
    };

    Net.prototype.send_TreeHit = function(id) {
        this.socket.on("error", this.Error);
        this.socket.emit("TreeHit", { id: id });
    };

    Net.prototype.send_PlayerRespawn = function(id) {
        this.socket.on("error", this.Error);
        this.socket.emit("PlayerRespawn", { id: id });
    };

    Net.prototype.send_SpellBookHit = function(id) {
        this.socket.on("error", this.Error);
        this.socket.emit("SpellBookHit", { id: id, player_id: this.player.id });
    };

    Net.prototype.send_HealthPotionHit = function(id) {
        this.socket.on("error", this.Error);
        this.socket.emit("HealthPotionHit", { id: id, player_id: this.player.id });
    };

    Net.prototype.send_PowerPotionHit = function(id) {
        this.socket.on("error", this.Error);
        this.socket.emit("PowerPotionHit", { id: id, player_id: this.player.id });
    };

    Net.prototype.send_GetTerrain = function() {
        this.socket.on("error", this.Error);
        this.socket.emit("GetTerrain");
    };

    Net.prototype.send_GetTrees = function() {
        this.socket.on("error", this.Error);
        this.socket.emit("GetTrees");
    };

    Net.prototype.send_ScoreBoard = function() {
        this.socket.on("error", this.Error);
        this.socket.emit("ScoreBoard");
    };

    Net.prototype.send_GetFlowers = function() {
        this.socket.on("error", this.Error);
        this.socket.emit("GetFlowers");
    };

    Net.prototype.send_GetLamps = function() {
        this.socket.on("error", this.Error);
        this.socket.emit("GetLamps");
    };

    Net.prototype.send_GetGlobalRanking = function() {
        this.socket.on("error", this.Error);
        this.socket.emit("GetGlobalRanking");
    };

    Net.prototype.send_GetTowers = function() {
        this.socket.on("error", this.Error);
        this.socket.emit("GetTowers");
    };

    Net.prototype.send_GetHouses = function() {
        this.socket.on("error", this.Error);
        this.socket.emit("GetHouses");
    };

    Net.prototype.send_ChangeSpell = function(data) {
        this.socket.on("error", this.Error);
        this.socket.emit("ChangeSpell", data);
    };

    Net.prototype.send_GetSpellBooks = function() {
        this.socket.on("error", this.Error);
        this.socket.emit("GetSpellBooks");
    };

    Net.prototype.send_GetHealthPotions = function() {
        this.socket.on("error", this.Error);
        this.socket.emit("GetHealthPotions");
    };

    Net.prototype.send_GetPowerPotions = function() {
        this.socket.on("error", this.Error);
        this.socket.emit("GetPowerPotions");
    };

    Net.prototype.send_Join = function(user) {
        this.socket.on("error", this.Error);
        this.socket.emit("Login", { user: user });
    };

    Net.prototype.send_PlayerHit = function(id, by_id) {
        this.socket.on("error", this.Error);
        this.socket.emit("PlayerHit", { player_id: id, by_id: by_id });
    };

    Net.prototype.send_Register = function(name, password, email) {
        this.socket.on("register_error", function(data) {
            $('#main_window').html("<font color='#FF0000'>"+data.error+"</font>");
        });
        this.socket.emit("Register", { name: name, password: password, email: email });
    };

    Net.prototype.send_UpdatePlayerPosition = function(data) {
        this.socket.emit("UpdatePlayerPosition", data);
    };

    Net.prototype.send_PlayerShoot = function(data) {
        this.socket.emit("PlayerShoot", data);
    };

    Net.prototype.send_ChatMsg = function(data) {
        if(this.player != undefined) {
            this.socket.emit("ChatMsg", { player_id: this.player.id, msg: data });
        } else {
            ConsoleMsg("You must login to chat.", "#FFF");
            $('#console_msg').val("");
        }
    };

    /////////////////////////////////////////////////////////////
    // Socket event bindings
    /////////////////////////////////////////////////////////////
    Net.prototype.Initialize = function(host) {
        this.socket = io.connect(host);
        this.socket.on("SpawnPlayer", this.recv_SpawnPlayer.bind(this));
        this.socket.on("AddPlayer", this.recv_AddPlayer.bind(this));
        this.socket.on("PlayerSync", this.recv_PlayerSync.bind(this));
        this.socket.on("RemovePlayer", this.recv_RemovePlayer.bind(this));
        this.socket.on("BuildTerrain", this.recv_BuildTerrain.bind(this));
        this.socket.on("BuildTrees", this.recv_BuildTrees.bind(this));
        this.socket.on("BuildFlowers", this.recv_BuildFlowers.bind(this));
        this.socket.on("BuildLamps", this.recv_BuildLamps.bind(this));
        this.socket.on("BuildTowers", this.recv_BuildTowers.bind(this));
        this.socket.on("BuildHouses", this.recv_BuildHouses.bind(this));
        this.socket.on("BuildSpellBooks", this.recv_BuildSpellBooks.bind(this));
        this.socket.on("BuildHealthPotions", this.recv_BuildHealthPotions.bind(this));
        this.socket.on("BuildPowerPotions", this.recv_BuildPowerPotions.bind(this));
        this.socket.on("UpdateTime", this.recv_UpdateTime.bind(this));
        this.socket.on("ChangeSpell", this.recv_ChangeSpell.bind(this));
        this.socket.on("RemoveSpellBook", this.recv_RemoveSpellBook.bind(this));
        this.socket.on("RemoveHealthPotion", this.recv_RemoveHealthPotion.bind(this));
        this.socket.on("RemovePowerPotion", this.recv_RemovePowerPotion.bind(this));
        this.socket.on("TreeHit", this.recv_TreeHit.bind(this));
        this.socket.on("PlayerHit", this.recv_PlayerHit.bind(this));
        this.socket.on("ChatMsg", this.recv_ChatMsg.bind(this));
        this.socket.on("PlayerDied", this.recv_PlayerDied.bind(this));
        this.socket.on("PlayerRespawn", this.recv_PlayerRespawn.bind(this));
        this.socket.on("Item", this.recv_Item.bind(this));
        this.socket.on("ServerMsg", this.recv_ServerMsg.bind(this));
        this.socket.on("LevelUp", this.recv_LevelUp.bind(this));
        this.socket.on("new_map", this.recv_NewMap.bind(this));
        this.socket.on("GlobalRanking", this.recv_GlobalRanking.bind(this));
        this.socket.on("ScoreBoard", this.recv_ScoreBoard.bind(this));
        this.socket.on("PlayerShoot", this.recv_PlayerShoot.bind(this));
        this.socket.on("UpdatePlayerPosition", this.recv_UpdatePlayerPosition.bind(this));
        var s = this.socket;
        setInterval(function() {
            if(!s.socket.connected) {
                ConsoleMsg("[ERROR] Connection to server lost. Please reload the page.", "#FF0000");
            }	
        }, 5000);
    };

    /////////////////////////////////////////////////////////////
    // Receivers
    /////////////////////////////////////////////////////////////
    Net.prototype.recv_GlobalRanking = function(data) {
        $("#map_ranking").find('tr').slice(1,$("#global_ranking tr").length).remove()
        for(var i=0; i < data.ranking.length; i++) {
            var pos = i+1;
            $('#global_ranking tr:last').after("<tr>"+
                                               "<td>"+pos+"</td>"+
                                               "<td>"+data.ranking[i].name+"</td>"+
                                               "<td><font color='cyan'>"+data.ranking[i].level+"</font></td>"+
                                               "<td><font color='#00FF00'>"+data.ranking[i].kills+"</font></td>"+
                                               "<td><font color='#FF0000'>"+data.ranking[i].deaths+"</font></td>"+
                                               "<td>"+data.ranking[i].exp+"</td>"+
                                               "<td>"+data.ranking[i].health+"</td>"+
                                               +"</tr>");
        }
    };

    Net.prototype.recv_ScoreBoard = function(data) {
        if(data == undefined || data == null) { return; } // TBD: strange!
        $("#map_ranking").find('tr').slice(1,$("#map_ranking tr").length).remove()
        console.log(data);
        for(var i=0; i < data.ranking.length; i++) {
            var pos = i+1;
            $('#map_ranking tr:last').after("<tr>"+
                                            "<td>"+pos+"</td>"+
                                            "<td>"+data.ranking[i].name+"</td>"+
                                            "<td><font color='cyan'>"+data.ranking[i].level+"</font></td>"+
                                            "<td><font color='#00FF00'>"+data.ranking[i].kills+"</font></td>"+
                                            "<td><font color='#FF0000'>"+data.ranking[i].deaths+"</font></td>"+
                                            "<td>"+data.ranking[i].exp+"</td>"+
                                            "<td>"+data.ranking[i].health+"</td>"+
                                            +"</tr>");
        }
    };

    Net.prototype.recv_NewMap = function(data) {
        net.send_ScoreBoard();
        $('#time_left_text').text("Loading new map...");
        if(net.player != undefined) {
            $('#scoreboard').show();
            $('#join').show();
            ReleasePointer();
        }
        update_end = 1;
    };

    Net.prototype.recv_PlayerRespawn = function(data) {
        if(this.player != undefined) {
            if(data.id == this.player.id) {
                this.player.Respawn(data);
                return;
            }
        }
        this.players[data.id].Respawn(data);
    };

    Net.prototype.recv_PlayerDied = function(data) {
        if(this.player != undefined) {
            if(data.player_id == this.player.id) {
                this.player.Die(data.by_name);
                return;
            }
        }
        this.players[data.player_id].Die(data.by_name);
    };

    Net.prototype.recv_ChangeSpell = function(data) {
        if(this.player != undefined) {
            if(data.player_id == this.player.id) {
                return;
            }
        }
        //console.log("Player: "+this.players[data.player_id].name +" changed spell "+data.spell_type);
        this.players[data.player_id].ChangeSpell(data);
    };

    Net.prototype.recv_PlayerShoot = function(data) {
        if(this.player != undefined) {
            if(this.player.id == data.player_id) {
                return;
            }
        }
        this.players[data.player_id].spell.power = data.power;
        this.players[data.player_id].spell.Shoot(this.players[data.player_id]);
    };

    Net.prototype.recv_UpdateTime = function(data) {
        $('#time_left_text').html('Time left on map: '+data.time_left+" sec");
        $('#time_left_load').width(Math.round(data.time_left/data.time_total*100)+'%');
    };

    Net.prototype.recv_ChatMsg = function(data) {
        if(this.player != undefined) {
            if(data.player_id == this.player.id) {
                ConsoleMsg(this.player.name+": "+data.msg, "#FFF");
                return;
            }
        }
        ConsoleMsg(this.players[data.player_id].name+": "+data.msg, "#FFF");
    };

    Net.prototype.recv_LevelUp = function(data) {
        if(this.player != undefined) {
            if(data.player_id == this.player.id) {
                this.player.LevelUp();
                return;
            }
        };
        this.players[data.player_id].LevelUp();
    };

    Net.prototype.recv_ServerMsg = function(data) {
        ConsoleMsg(data.msg, data.msg_color);
    };

    Net.prototype.recv_Item = function(data) {
        if(this.player != undefined) {
            if(data.player_id == this.player.id) {
                this.player.itemFactory.NewItem(this.player, data);
                return;
            }
        }
        this.players[data.player_id].itemFactory.NewItem(this.players[data.player_id], data);
    };

    Net.prototype.recv_PlayerHit = function(data) {
        if(this.player != undefined) {
            if(data.player_id == this.player.id) {
                this.player.Damage(data.dmg, data.by_id);
                return;
            }
        }
        this.players[data.player_id].Damage(data.dmg, data.by_id);
    };

    Net.prototype.recv_TreeHit = function(data) {
        this.trees[data.id].Burn();
    };

    Net.prototype.recv_RemovePowerPotion = function(data) {
        this.powerPotions[data.id].Remove();
        this.powerPotions[data.id] = null;
    };

    Net.prototype.recv_RemoveHealthPotion = function(data) {
        this.healthPotions[data.id].Remove();
        this.healthPotions[data.id] = null;
    };

    Net.prototype.recv_RemoveSpellBook = function(data) {
        this.spellBooks[data.id].Remove();
        this.spellBooks[data.id] = null;
    };

    Net.prototype.recv_RemovePlayer = function(data) {
        if(this.player != undefined) {
            if(data.player.id == this.player.id) {
                return;
            }
        }
        ConsoleMsg(this.players[data.player.id].name+ " left.", "#FFFF00");
        this.players[data.player.id].Remove();
        //delete this.players[data.player.id];
        delete this.players[data.player.id];
    };

    Net.prototype.recv_PlayerSync = function(data) {
        console.log(data);
        if(this.player != undefined) {
            if(data.id == this.player.id) {
                this.player.Sync(data.player);
                return;
            }
        }
        if(this.players[data.id] != undefined) {
            this.players[data.id].Sync(data.player);
        }
    };

    Net.prototype.recv_AddPlayer = function(data) {
        //data.player.this_player = 0;
        if(this.player != undefined) {
            if(data.player.id == this.player.id) {
                return;
            }
        }

        // Make sure not to spawn multiple times.
        for(var key in this.players) {
            if(this.players[key].id == data.player.id) {
                return;
            }
        }
        var player = new NetPlayer();
        player.Spawn(data.player);
        ConsoleMsg(player.name+ " joined (lvl "+data.player.level+")", "#FFFF00");
        this.players[data.player.id] = player;
        objects.push(player);
    };

    Net.prototype.recv_SpawnPlayer = function(data) {
        this.player = new LocalPlayer();
        //data.player.this_player = 1;
        //this.player.Create(data.player);
        objects.push(this.player);
        this.joined = 1; // keep track if player joined once

        this.player.Spawn(data.player);
        $('#song')[0].pause();

        //$('#login').html("<button onclick='Login();'>Join Game</button>");
        $('#info').hide();
        $('#scoreboard').hide();

        ShowHud();

        ConsoleMsg(data.player.name+" joined (lvl "+data.player.level+")", "#FFFF00");
    };

    Net.prototype.recv_BuildPowerPotions = function(data) {
        for(var i = 0; i < data.powerPotions.length; i++) {
            if(this.powerPotions[data.powerPotions[i].id] != undefined) {
                continue;
            }
            var crate = new Potion();
            crate.Create(data.powerPotions[i].x, 
                         data.powerPotions[i].y,
                         data.powerPotions[i].z,
                         data.powerPotions[i].id,
                         6,
                         "power");
                         this.powerPotions[data.powerPotions[i].id] = crate;
                         objects.push(crate);
        }
    };

    Net.prototype.recv_BuildHealthPotions = function(data) {
        for(var i = 0; i < data.healthPotions.length; i++) {
            if(this.healthPotions[data.healthPotions[i].id] != undefined) {
                continue;
            }
            var crate = new Potion();
            crate.Create(data.healthPotions[i].x, 
                         data.healthPotions[i].y,
                         data.healthPotions[i].z,
                         data.healthPotions[i].id,
                         6,
                         "health");
                         this.healthPotions[data.healthPotions[i].id] = crate;
                         objects.push(crate);
        }
    };

    Net.prototype.recv_BuildSpellBooks = function(data) {
        for(var i = 0; i < data.spellBooks.length; i++) {
            if(this.spellBooks[data.spellBooks[i].id] != undefined) {
                continue;
            }
            var crate = new SpellBook();
            crate.Create(data.spellBooks[i].x, 
                         data.spellBooks[i].y,
                         data.spellBooks[i].z,
                         data.spellBooks[i].id,
                         4);
                         this.spellBooks[data.spellBooks[i].id] = crate;
                         objects.push(crate);
        }
    };

    Net.prototype.recv_BuildHouses = function(data) {
        for(var i = 0; i < data.houses.length; i++) {
            if(this.houses[data.houses[i].id] != undefined) {
                continue;
            }
            var obj;
            switch(data.houses[i].type) {
                case "dockhouse":
                    obj = new DockHouse();
                break;
                case "markethouse":
                    obj = new MarketHouse();
                break;
                case "roadhouse":
                    obj = new RoadHouse();
                break;
            }

            obj.Create(data.houses[i].x, 
                       data.houses[i].y,
                       data.houses[i].z,
                       data.houses[i].size);
                       this.houses[data.houses[i].id] = obj;
        }
    };

    Net.prototype.recv_BuildTowers = function(data) {
        for(var i = 0; i < data.towers.length; i++) {
            if(this.lamps[data.towers[i].id] != undefined) {
                continue;
            }
            var obj = new Tower();
            obj.Create(data.towers[i].x, 
                       data.towers[i].y,
                       data.towers[i].z,
                       data.towers[i].size);
                       this.towers[data.towers[i].id] = obj;
        }
    };


    Net.prototype.recv_BuildLamps = function(data) {
        for(var i = 0; i < data.lamps.length; i++) {
            if(this.lamps[data.lamps[i].id] != undefined) {
                continue;
            }
            var lamp = new Lamp();
            lamp.Create(data.lamps[i].x, 
                        data.lamps[i].y,
                        data.lamps[i].z,
                        data.lamps[i].size);
                        this.lamps[data.lamps[i].id] = lamp;
        }
    };

    Net.prototype.recv_BuildFlowers = function(data) {
        for(var i = 0; i < data.flowers.length; i++) {
            var flower = new Flower();
            flower.Create(data.flowers[i].x, 
                          data.flowers[i].y,
                          data.flowers[i].z,
                          data.flowers[i].size,
                          data.flowers[i].type);
                          this.flowers.push(flower);
        }
    };

    Net.prototype.recv_BuildTrees = function(data) {
        for(var i = 0; i < data.trees.length; i++) {
            // TBD: send in whole data.
            var tree = new Tree();
            tree.Create(data.trees[i].x, 
                        data.trees[i].y,
                        data.trees[i].z,
                        data.trees[i].size,
                        data.trees[i].id
                       );
                       this.trees[data.trees[i].id] = tree;
        }
    };

    Net.prototype.recv_BuildTerrain = function(data) {
        console.log("Got terrain: "+data.noise.length);
        this.terrain = new Terrain();
        this.terrain.CreateNet(data.noise);
    };

    Net.prototype.recv_UpdatePlayerPosition = function(data) {
        if(this.player != undefined) {
            if(data.player_id == this.player.id) {
                return;
            }
        }
        if(this.players[data.player_id] != undefined) {
            this.players[data.player_id].mesh.position.x = data.px;
            this.players[data.player_id].mesh.position.y = data.py;
            this.players[data.player_id].mesh.position.z = data.pz;
            this.players[data.player_id].mesh.rotation.x = data.rx;
            this.players[data.player_id].mesh.rotation.y = data.ry;
            this.players[data.player_id].mesh.rotation.z = data.rz;
            this.players[data.player_id].SetAnimation(data.anim_type);
        }
    };

    Net.prototype.Error = function(data) {
        console.log("[NET] FAILED: ");
        ConsoleMsg("Connection to server failed! (please reload page)", "#FF0000");
        console.log(data);
    };
}
