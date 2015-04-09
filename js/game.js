// standard global variables
var container, scene, camera, renderer, controls, stats;
var keyboard = new THREEx.KeyboardState();
var clock = new THREE.Clock();
var objects = [];
var billboards = [];
var collision_objects = [];
var draw_objects = [];
var SCREEN_WIDTH;
var SCREEN_HEIGHT;
var VIEW_ANGLE;
var  ASPECT;
var NEAR;
var FAR;
var sun; 
var spectate = 0;

// To check memory heap when chrome is started with
// Heap memory debugging. (--enable-memory-info)
var lastUsedHeap = 0; 

var player_login = "";
var player_password = "";

var update_end = 0;
var anim_id = -1;

var INV_MAX_FPS = 1/60;
var frameDelta = 0;

// STATS
//var stats = new Stats();
//$('#stats').append(stats.domElement);

var modelLoader = new ModelLoader();
var soundLoader = new SoundLoader();
//var player;
var world;

var net = new Net();
//net.Initialize("http://192.168.1.124:8080");
//net.Initialize("http://192.168.1.137:8080");
//net.Initialize("http://nergal.ipeer.se:8080");
//net.Initialize("http://nergal.se:80");
//net.Initialize("http://192.168.1.137:80");
net.Initialize("http://localhost:8080");


//$('#song').prop("volume", 0.8);

ConsoleMsg("Welcome to Wizard Warz [BETA]!", "#00FFFF");

AddModels();
AddSounds();
init();


function AddSounds() {
    // Sound loader
    soundLoader.Add({file: "sounds/flamingo.mp3",
		     name: "flamingo"});
    soundLoader.Add({file: "sounds/parot.mp3",
		     name: "parot1"});
    soundLoader.Add({file: "sounds/bird.mp3",
		     name: "parot2"});
    soundLoader.Add({file: "sounds/fire.mp3",
		     name: "fire"});
    soundLoader.Add({file: "sounds/levelup.mp3",
		     name: "levelup"});
    soundLoader.Add({file: "sounds/nuclear.mp3",
		     name: "nuclear"});
    soundLoader.Add({file: "sounds/fireball.mp3",
		     name: "fireball"});
    soundLoader.Add({file: "sounds/swoosh.mp3",
		     name: "swoosh"});
    soundLoader.Add({file: "sounds/explosion2.mp3",
		     name: "missile_explosion"});
    soundLoader.Add({file: "sounds/explosion3.mp3",
		     name: "explosion3"});
    soundLoader.Add({file: "sounds/explosion4.mp3",
		     name: "explosion4"});
    soundLoader.Add({file: "sounds/magic.mp3",
		     name: "magic"});
    soundLoader.Add({file: "sounds/wizard_found.mp3",
		     name: "found"});
    soundLoader.Add({file: "sounds/wizard_die.mp3",
		     name: "died"});
    soundLoader.Add({file: "sounds/hurt.mp3",
		     name: "hurt"});
    soundLoader.Add({file: "sounds/potion1.mp3",
		     name: "found_potion1"});    
    soundLoader.Add({file: "sounds/potion2.mp3",
		     name: "found_potion2"});    
    soundLoader.Add({file: "sounds/wizard_start.mp3",
		     name: "start"});

}

function AddModels() {

    modelLoader.AddMorph({ subDivides: 2,
		      obj: 'models/terrain/fishes/fish_a.js',
		      name: "fish1" });
    modelLoader.AddMorph({ subDivides: 2,
		      obj: 'models/terrain/fishes/fish_b.js',
		      name: "fish2" });
    modelLoader.AddMorph({ subDivides: 2,
		      obj: 'models/terrain/fishes/fish_c.js',
		      name: "fish3" });
    modelLoader.AddMorph({ subDivides: 2,
		      obj: 'models/terrain/fishes/fish_d.js',
		      name: "fish4" });

    modelLoader.AddMorph({ subDivides: 1,
		      obj: 'models/terrain/flamingo/stork_flamingo.js',
		      name: "flamingo" });
    modelLoader.AddMorph({ subDivides: 2,
		      obj: 'models/terrain/parrot/parrot.js',
		      name: "parrot" });
    modelLoader.AddMorph({ subDivides: 2,
		      obj: 'models/terrain/spider/spider.js',
		      name: "spider" });


    modelLoader.AddJSON({ subDivides: 0,
		      obj: 'models/player/char.js',
		      name: "player" });

    modelLoader.AddJSON({ subDivides: 0,
		      obj: 'models/Crates/book/book.js',
		      name: "book" });

    modelLoader.AddJSON({ subDivides: 0,
		      obj: 'models/Crates/potion/health.js',
		      name: "health" });
    modelLoader.AddJSON({ subDivides: 0,
		      obj: 'models/Crates/potion/mana.js',
		      name: "power" });

    modelLoader.AddJSON({ subDivides: 0,
		      obj: 'models/terrain/clouds2/cloud.js',
		      name: "cloud" });


    modelLoader.Add({ subDivides: 0,
		      mtl: 'models/terrain/Flower/test/Flower.mtl',
		      obj: 'models/terrain/Flower/test/Flower.obj',
		      name: "flower1" });
    modelLoader.Add({ subDivides: 0,
		      mtl: 'models/terrain/Flower/test/Flower2.mtl',
		      obj: 'models/terrain/Flower/test/Flower.obj',
		      name: "flower2" });
    modelLoader.Add({ subDivides: 0,
		      mtl: 'models/terrain/Flower/test/Flower3.mtl',
		      obj: 'models/terrain/Flower/test/Flower.obj',
		      name: "flower3" });
    modelLoader.Add({ subDivides: 1,
		      mtl: 'models/skeleton/toad_shock.mtl',
		      obj: 'models/skeleton/toad_shock.obj',
		      name: "toad_skeleton" });
}

function init()  {
    SCREEN_WIDTH = window.innerWidth;
    SCREEN_HEIGHT = window.innerHeight;
    VIEW_ANGLE = 75;
    ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT;
    NEAR = 0.1;
    FAR = 13500;

    collision_objects = [];
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);

    scene.add(camera);
    // camera.position.set(0,1000,600);
    camera.lookAt(scene.position);

    renderer = new THREE.WebGLRenderer( {antialias: true} );
    //renderer.setSize($('#container').width(), $('#container').height());
    renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
    container = document.getElementById('container');
    container.innerHTML = '';
    container.appendChild( renderer.domElement );

    // EVENTS
    THREEx.WindowResize(renderer, camera);
    //    THREEx.FullScreen.bindKey({ charCode : 'm'.charCodeAt(0) });

    // AXIS HELPER
    /*
       var axis = new THREE.AxisHelper(600);
       axis.position.set(0, 100, 0);
       scene.add(axis);
       */


    scene.fog = new THREE.FogExp2( 0x000000, 0.00025 );
    renderer.setClearColor(0x000000, 1);

    renderer.shadowMapEnabled = true;
    //    renderer.shadowMapSoft = true;


    // Sun
    sun = new Sun();
    sun.Create(0,200,0, scene, renderer);
    //objects.push(sun);

    // Water
    var water = new Water();
    water.Create(scene);
    objects.push(water);

    camera.up = new THREE.Vector3(0,1,0);
    camera.position.set(300,600, 1500);
    camera.lookAt(scene.position);


    net.send_GetTerrain();
    InitiateNet();
}

function InitiateNet() {
    console.log("Waiting for terrain...");
    console.log("TERRAIN: "+net.terrain);
    if(net.terrain == undefined) {
        setTimeout(function() { InitiateNet()}, 500);
        return;
    }

    // Then we can initiate models...
    InitiateModels();
    net.send_GetTrees();
    net.send_GetFlowers();
    net.send_GetLamps();
    net.send_GetTowers();
    //    net.send_GetHouses();
    net.send_GetSpellBooks();
    net.send_GetHealthPotions();
    net.send_GetPowerPotions();
    $('#info_loadbar').hide();
    $('#loaded').show();
}

function InitiateModels() {
    var x = modelLoader.PercentLoaded();
    console.log("Loaded: "+x+"%");
    if(x < 100) {
        setTimeout(function() { InitiateModels()}, 500);
        return;
    }

    for(var i = 0; i < 30; i++) {
        var fish = new Fish();
        fish.Create({
            scale: 0.1+Math.random()*0.3, health: 50, damage: 2, max_speed: 5+Math.random()*60,
            boundary_minx: -2000, boundary_maxx: 2000,
            boundary_miny: -100, boundary_maxy: -10,
            boundary_minz: -2000, boundary_maxz: 2000
        });
        objects.push(fish);
    }

    for(var i = 0; i < 10; i++) {
        var spider = new Spider();
        spider.Create({
            scale: 0.05+Math.random()*0.03, health: 50, damage: 2, max_speed: 2+Math.random()*10,
            boundary_minx: -1500, boundary_maxx: 1500,
            boundary_miny: 100, boundary_maxy: 1000,
            boundary_minz: -1500, boundary_maxz: 1500
        });
        objects.push(spider);
    }

    for(var i = 0; i < 10; i++) {
        var parrot = new Parrot();
        parrot.Create({
            scale: 0.1+Math.random()*0.3, health: 50, damage: 2, max_speed: 15+Math.random()*60,
            boundary_minx: -2000, boundary_maxx: 2000,
            boundary_miny: -100, boundary_maxy: -10,
            boundary_minz: -2000, boundary_maxz: 2000
        });
        objects.push(parrot);
    }


    for(var i = 0; i < 10; i++) {
        var flamingo = new Flamingo();
        flamingo.Create({
            scale: 0.1+Math.random()*0.3, health: 50, damage: 2, max_speed: 1+Math.random()*3,
            boundary_minx: -2000, boundary_maxx: 2000,
            boundary_miny: -100, boundary_maxy: -10,
            boundary_minz: -2000, boundary_maxz: 2000
        });
        objects.push(flamingo);
    }


    // Clouds
    for(var i= 0; i < 5; i++) {
        var cloud = new Cloud();
        cloud.Create(Math.random()*4000-1500, 450+Math.random()*400, Math.random()*4000-1500, 4, scene);
        objects.push(cloud);
    } 

    $('#start').show();
    animate();
}


function animate() {
    anim_id = requestAnimationFrame( animate );
    render();		
    update();
}

function update() {
    var delta = clock.getDelta(),
        time = clock.getElapsedTime() * 10;

    if(update_end) {
        cancelAnimationFrame(anim_id);
        ResetScene();
        update_end = 0;
        return;
    }

    frameDelta += delta;

    while(frameDelta >= INV_MAX_FPS) {

        THREE.AnimationHandler.update(INV_MAX_FPS);

        for(var i = 0; i < objects.length; i++) {
            if(objects[i] != undefined) {
                if(objects[i].remove == 1) { 
                    objects.splice(i, 1);
                } else {
                    objects[i].Draw(time, INV_MAX_FPS, i);
                }
            }
        }
        frameDelta -= INV_MAX_FPS;

        if(spectate) {
            camera.position.x = Math.floor(Math.cos(time/100) * 2000);
            //camera.position.y = Math.max(300, Math.floor(Math.cos(time/50) * 1500));
            camera.position.z = Math.floor(Math.sin(time/100) * 2000);
            camera.lookAt(new THREE.Vector3(0,0,0));
        }
    }

    //stats.update();
}

function render() {
    renderer.render( scene, camera );
}

function ResetScene() {
    $('#song')[0].play();
    if(net.player != undefined) {
        // TBD: Unlock pointer!
        //LockPointer(); 
        net.player.RemoveBindings();
    }
    ResetHideHud();
    objects = [];
    collision_objects = [];
    draw_objects = [];
    world = undefined;
    player = undefined;
    net.terrain = undefined;
    net.trees = [];
    net.flowers = new Array();
    net.spellBooks = [];
    net.healthPotions = [];
    net.powerPotions = [];
    net.players = [];
    net.lamps = [];
    net.towers = [];
    net.player = undefined;

    // TBD: Need to load models again...otherwise wrong context?
    modelLoader = new ModelLoader();
    AddModels();
    init();
    if(spectate) {
        $('#info').hide();
        $('#console').show();
    }
}

function Spectate() {
    if(net.player == undefined) {
        if(!spectate) {
            $('#info').hide();
            $('#console').show();
            $('#console').prepend("<a id='spectate_exit' href='javascript:Spectate();'>Exit Spectate mode</a>");
            spectate = 1;
        } else {
            spectate = 0;
            $('#info').show();
            $('#console').hide();
            $('#spectate_exit').remove();
        }
    }
}

function CreatePlayer() {
    if(net.player != undefined) {
        return;
    }
    net.send_Register($('#name').val(), $('#password').val(), $('#email').val());
}

function Login_test2() {
    net.send_Login("dude", "1");
}

function Login_test() {
    $('#login_name').val("nergal");
    $('#login_password').val("test");
    net.send_Login("nergal", "test");
}

function Login() {
    if(net.player != undefined) {
        return;
    }
    if(player_password == '') {
        console.log("Login: "+$('#login_name').val());
        net.send_Login($('#login_name').val(), $('#login_password').val());
        player_password = $('#login_password').val();
        player_login = $('#login_name').val();
    } else {
        net.send_Login(player_login, player_password);
    }
}

function ResetHideHud() {
    for(var i = 1; i <= 5; i++) {
        $('#itemimg'+i).attr('src', '');
    }
    $('#item1').hide();
    $('#item2').hide();
    $('#item3').hide();
    $('#item4').hide();
    $('#item5').hide();
    $('#console').hide();
    $('#weapon_load').hide();
    $('#weapon_reload').hide();
    $('#avatar').hide();
    $('#health_load').hide();    
}

function ShowHud() {
    $('#item1').show();
    $('#item2').show();
    $('#item3').show();
    $('#item4').show();
    $('#item5').show();
    $('#console').show();
    $('#weapon_load').show();
    $('#weapon_reload').show();
    $('#health_load').show();
    $('#avatar').show();
}
