////////////////////////////////////////////////////////////
// Autor: Nergal
// Date: 2014-01-19
/////////////////////////////////////////////////////////////
"use strict";

/////////////////////////////////////////////////////////////
// Loader base 'class'
/////////////////////////////////////////////////////////////
function Loader() {
    Loader.prototype.total = 0;
    Loader.prototype.loaded = 0;
    Loader.prototype.percentLoaded = 0;

    Loader.prototype.PercentLoaded = function() {
        return Math.round((Loader.prototype.loaded/Loader.prototype.total)*100);
    };

    Loader.prototype.Loaded = function() {
        Loader.prototype.loaded++;

        $('#info_load_percent').text(this.PercentLoaded()+'%');
        $('#info_load').width(this.PercentLoaded()+'%');
    };
}

/////////////////////////////////////////////////////////////
// Creation of objects
/////////////////////////////////////////////////////////////
// TBD

/////////////////////////////////////////////////////////////
// Sounds
/////////////////////////////////////////////////////////////
function SoundLoader() {
    Loader.call(this);
    this.sounds = new Array();
    this.context = undefined;

    SoundLoader.prototype.StopSound = function(name) {
        // TBD!
        var source = this.sounds[name].context;
        source.stop = source.noteOff;
        source.stop(0);
    };

    SoundLoader.prototype.PlaySound = function(name, position, radius) {
        var source = this.sounds[name].context.createBufferSource();
        source.buffer = this.sounds[name].buffer;
        var gainNode = this.sounds[name].context.createGain();
        source.connect(gainNode);
        gainNode.connect(this.sounds[name].context.destination);

        if(position != undefined) {
            var vector = camera.localToWorld(new THREE.Vector3(0,0,0));	    
            var distance = position.distanceTo( vector );
            if ( distance <= radius ) {
                var vol = 1 * ( 1 - distance / radius );
                gainNode.gain.value = vol;
                source.start(0);
            } else {
                gainNode.gain.value = 0;
            }
        } else {
            gainNode.gain.value = 1;
            source.start(0);	    
        }
    };

    SoundLoader.prototype.Add = function(args) {
        this.sounds[args.name] = new Object();
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        if(this.context == undefined) {
            this.context = new AudioContext();
        }
        var loader = new BufferLoader(this.context,
                                      [args.file],
        this.Load.bind(this, args.name));
        this.sounds[args.name].context = this.context;
        Loader.prototype.total++;
        loader.load();
    };

    SoundLoader.prototype.Load = function(name, buffer) {
        this.sounds[name].buffer = buffer[0];
        this.Loaded();
    };
}
SoundLoader.prototype = new Loader();
SoundLoader.prototype.constructor = SoundLoader;

/////////////////////////////////////////////////////////////
// Models
/////////////////////////////////////////////////////////////
function ModelLoader() {
    Loader.call(this);
    this.models = new Array();

    ModelLoader.prototype.GetModel = function(name) {
        if(this.models[name].mesh.clone == undefined) {
            return this.models[name].mesh;
        } else {
            return this.models[name].mesh.clone();
        }
    };

    ModelLoader.prototype.SubDivision = function(name, mesh) {
        for(var i = 0; i < mesh.children.length; i++) {
            var modifier = new THREE.SubdivisionModifier(this.models[name].args.subDivides);
            modifier.modify( mesh.children[i].geometry );
            mesh.children[i].geometry.mergeVertices();
            mesh.children[i].geometry.computeVertexNormals();
        }
        return mesh;
    };

    ModelLoader.prototype.AddMD2 = function(args) {
        this.models[args.name] = new Object();
        this.models[args.name].args = args;
        Loader.prototype.total++;

        args.config = {
            baseUrl: "models/players/wizard/version1/",
            body: "char.js",
            skins: [ "char.png" ],
            weapons: [],
        };

        var loader = new THREE.MD2Character();
        loader.loadParts(args.config);
        loader.onLoadComplete = this.LoadMD2.bind(this, loader, args.name);
    };

    ModelLoader.prototype.LoadMD2 = function(loader, name) {
        // not actually the mesh but the object.
        this.models[name].mesh = loader;
        if(this.models[name].args.subDivides > 0 ) {
            this.models[name].mesh.meshBody = this.SubDivision(name, this.models[name].mesh.meshBody);
        }
        this.models[name].mesh.meshBody.castShadow = false;
        this.models[name].mesh.meshBody.receiveShadow = false;
        console.log("LOADED MD2");
        this.Loaded();
    }

    ModelLoader.prototype.AddMorph = function(args) {
        this.models[args.name] = new Object();
        this.models[args.name].args = args;
        Loader.prototype.total++;

        var loader = new THREE.JSONLoader();
        loader.load(args.obj, this.LoadMorph.bind(this, args.name));
    };

    ModelLoader.prototype.AddJSON = function(args) {
        this.models[args.name] = new Object();
        this.models[args.name].args = args;
        Loader.prototype.total++;

        var loader = new THREE.JSONLoader();
        loader.load(args.obj, this.LoadJSON.bind(this, args.name));
    };

    ModelLoader.prototype.Add = function(args) {
        this.models[args.name] = new Object();
        this.models[args.name].args = args;
        Loader.prototype.total++;

        var loader = new THREE.OBJMTLLoader();
        loader.load(args.obj, args.mtl, this.Load.bind(this, args.name));
    };

    ModelLoader.prototype.LoadMorph = function(name, geometry, materials) {
        var material = new THREE.MeshPhongMaterial( { color: 0xffaa55, morphTargets: true, vertexColors: THREE.FaceColors } );
        var meshAnim = new THREE.MorphAnimMesh( geometry, material );


        meshAnim.speed = 2;
        meshAnim.duration = 500-Math.random()*200;
        meshAnim.time = 600-Math.random()*200;

        //var material = new THREE.MeshFaceMaterial(materials);
        //var mesh = new THREE.Mesh(geometry, material);

        if(this.models[name].args.subDivides > 0 ) {
            meshAnim = this.SubDivision(name, meshAnim);
        }

        meshAnim.phase = Math.floor( Math.random() * 62.83 );

        this.models[name].mesh = meshAnim;
        this.Loaded();
    };

    ModelLoader.prototype.LoadJSON = function(name, geometry, materials_) {
        var faceMaterial = new THREE.MeshFaceMaterial(materials_);
        //	if(geometry.animations != undefined) {
        if(name == 'player') {
            var mesh = new THREE.SkinnedMesh(geometry, faceMaterial);
            for(var i= 0; i < mesh.geometry.animations.length; i++) {
                THREE.AnimationHandler.add(geometry.animations[i]);
                console.log("==> ADD: "+geometry.animations[i].name);
            }
            var materials = mesh.material.materials;
            for (var i = 0,length = materials.length; i < length; i++) {
                //var material = materials[i];
                mesh.material.materials[i].skinning = true;
            }
            mesh.castShadow = false;
            mesh.receiveShadow = false;
        } else {
            //var mesh;
            var mesh = new THREE.Mesh(geometry, faceMaterial);
            //	    if(name == "power") {
            //		for(var i= 0; i < mesh.material.materials.length; i++) {
            //		    mesh.material.materials[i].morphTargets = true;
            //		}
            //		console.log(mesh);
            //	    }
            //mesh.castShadow = true;
            //mesh.receiveShadow = true;
        }

        if(this.models[name].args.subDivides > 0 ) {
            mesh = this.SubDivision(name, mesh);
        }

        this.models[name].mesh = mesh;
        this.Loaded();
    };

    ModelLoader.prototype.Load = function(name, mesh) {
        //mesh.castShadow = true;
        //mesh.receiveShadow = true;

        if(this.models[name].args.subDivides > 0 ) {
            mesh = this.SubDivision(name, mesh);
        }

        this.models[name].mesh = mesh;
        this.Loaded();
    };
}
ModelLoader.prototype = new Loader();
ModelLoader.prototype.constructor = ModelLoader;
