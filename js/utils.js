////////////////////////////////////////////////////////////
// Autor: Nergal
// Date: 2014-01-19
// Utilility functions that are used by all classes.
/////////////////////////////////////////////////////////////
"use strict";

function Length(obj) {
    return Object.keys(obj).length;
}

// handle chat
$("#console_msg").keyup(function(event){
    if(event.keyCode == 13){
        if($('#console_msg').val() == "") {

        } else {
            net.send_ChatMsg($('#console_msg').val());
            $('#console_msg').val("");
            $('#console_msg').blur();
            keys_enabled = 1;
        }
    }
});

function ConsoleMsg(msg, color) {
    $('#console_log').append("<font color="+color+">"+msg+"</font><br/>");
    //$('#console_log').scrollTop($('#console_log')[0].scrollHeight+1);
    $('#console_log').scrollTop($('#console_log').scrollTop()+100+msg.length);
}

function rotateAroundWorldAxis(object, axis, radians) {
    var rotWorldMatrix = new THREE.Matrix4();
    rotWorldMatrix.makeRotationAxis(axis.normalize(), radians);
    rotWorldMatrix.multiply(object.matrix);
    object.matrix = rotWorldMatrix;
    object.rotation.setFromRotationMatrix(object.matrix, object.order);
} 

function rotateAroundObjectAxis(object, axis, radians) {
    var rotationMatrix = new THREE.Matrix4();
    rotationMatrix.makeRotationAxis( axis.normalize(), radians );
    object.matrix.multiply( rotationMatrix );
    object.rotation.setFromRotationMatrix(object.matrix, object.order);
}

function CreateBoundingBox(obj) {
    var object3D = obj.mesh;
    var box = null;
    object3D.traverse(function (obj3D) {
        var geometry = obj3D.geometry;
        if (geometry === undefined)  {
            return;
        }
        geometry.computeBoundingBox();
        if (box === null) {
            box = geometry.boundingBox;
        } else {
            box.union(geometry.boundingBox);
        }
    });

    var x = box.max.x - box.min.x; 
    var y = box.max.y - box.min.y; 
    var z = box.max.z - box.min.z;

    obj.bsize_x = (x/2)*obj.mesh.scale.x;
    obj.bsize_y = (y/2)*obj.mesh.scale.y;
    obj.bsize_z = (z/2)*obj.mesh.scale.z;

    obj.bbox = box;
    /*
       var bcube = new THREE.Mesh( new THREE.BoxGeometry( x, y, z ), 
       new THREE.MeshNormalMaterial({ visible: true, wireframe: true, color: 0xAA3333}) );
       var bboxCenter = box.center();
       bcube.translateX(bboxCenter.x);
       bcube.translateY(bboxCenter.y);
       bcube.translateZ(bboxCenter.z);
       obj.bcube = bcube;
       object3D.add(bcube);
       */

    collision_objects.push(obj);
    //    return bcube;
}

function GetWorldY(mesh) {
    var world = net.terrain.GetNoise();
    var x = Math.round(mesh.position.x/10)+world.length/2;
    var z = Math.round(mesh.position.z/10)+world.length/2;
    var y = 0;
    if(x < world.length-1) {
        if(world[x] != undefined && z < world[x].length-1) {
            y = world[x][z]*200;
        }
    } else {
        y = 0;
    }
    return y;
}

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    if(r < 0) r = 0;
    if(g < 0) g = 0;
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function ReleasePointer() {
    var instructions = document.getElementsByTagName("body")[0];
    instructions.removeEventListener( 'click', instrClick);
    keys_enabled = 0;
    document.exitPointerLock = document.exitPointerLock ||
        document.mozExitPointerLock ||
        document.webkitExitPointerLock;
    document.exitPointerLock();

}

// http://www.html5rocks.com/en/tutorials/pointerlock/intro/
function LockPointer() {
    var instructions = document.getElementsByTagName("body")[0];
    /*
       var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;
       if ( havePointerLock ) {
       var element = document.body;
       var pointerlockchange = function ( event ) {
       if ( document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element ) {
       $('#info').hide();
       $('#scoreboard').hide();
       keys_enabled = 1;
       return;
       } else {

       if(!$('#helpboard').is(":visible")) {
       $('#info').show();
       }
       keys_enabled = 0;
       }
       }
       */
    /*
       document.addEventListener( 'pointerlockchange', pointerlockchange, false );
       document.addEventListener( 'mozpointerlockchange', pointerlockchange, false );
       document.addEventListener( 'webkitpointerlockchange', pointerlockchange, false );
       */
    instructions.addEventListener( 'click', instrClick, false);
    //  }
}

function instrClick( event ) {
    var element = document.body;
    keys_enabled = 1;
    element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;

    if ( /Firefox/i.test( navigator.userAgent ) ) {
        var fullscreenchange = function ( event ) {
            if ( document.fullscreenElement === element || document.mozFullscreenElement === element || document.mozFullScreenElement === element ) {

                document.removeEventListener( 'fullscreenchange', fullscreenchange );
                document.removeEventListener( 'mozfullscreenchange', fullscreenchange );
                element.requestPointerLock();
            }
        }

        document.addEventListener( 'fullscreenchange', fullscreenchange, false );
        document.addEventListener( 'mozfullscreenchange', fullscreenchange, false );

        element.requestFullscreen = element.requestFullscreen || element.mozRequestFullscreen || element.mozRequestFullScreen || element.webkitRequestFullscreen;
        element.requestFullscreen();
    } else {
        element.requestPointerLock();
    }
}

function BufferLoader(context, urlList, callback) {
    this.context = context;
    this.urlList = urlList;
    this.onload = callback;
    this.bufferList = new Array();
    this.loadCount = 0;
}

BufferLoader.prototype.loadBuffer = function(url, index) {
    // Load buffer asynchronously
    var request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.responseType = "arraybuffer";

    var loader = this;

    request.onload = function() {
        // Asynchronously decode the audio file data in request.response
        loader.context.decodeAudioData(
            request.response,
            function(buffer) {
                if (!buffer) {
                    alert('error decoding file data: ' + url);
                    return;
                }
                loader.bufferList[index] = buffer;
                if (++loader.loadCount == loader.urlList.length)
                    loader.onload(loader.bufferList);
            },
            function(error) {
                console.error('decodeAudioData error', error);
            }
        );
    }

    request.onerror = function() {
        alert('BufferLoader: XHR error');
    }

    request.send();
}

BufferLoader.prototype.load = function() {
    for (var i = 0; i < this.urlList.length; ++i)
    this.loadBuffer(this.urlList[i], i);
}
