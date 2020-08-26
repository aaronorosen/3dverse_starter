import * as THREE from 'https://threejs.org/build/three.module.js';

import { GUI } from 'https://threejs.org/examples/jsm/libs/dat.gui.module.js';

import { FirstPersonControls } from 'https://threejs.org/examples/jsm/controls/FirstPersonControls.js';


var n=0;
var tps =0;
function funcPbar(){
	n = 0;
	tps = setInterval(startTime, 100);
}

function startTime(){
	n++;
	document.getElementById("pBar").style.width=n+"%";

	if (n==100){
		clearInterval(tps);
		tps = null;
	}
}

$(document).ready(function(){
	document.getElementById("waitingBox").innerHTML = "Please wait -> Connection";
	// Show the Modal on load
	n = 0;
	$("#myModal").modal({backdrop: "static"});
	funcPbar();

    // Feather icon
    feather.replace();
});

var x ;

function playAudio() {
  x.play();
}

function pauseAudio() {
  x.pause();
}

//------------------------------------------------------------------------------
window.addEventListener('load', async () =>
{
    var canvas = document.getElementById('display_canvas');

    initSDK(canvas);
});

//------------------------------------------------------------------------------
function degreesToRadian(degrees)
{
	return degrees * (Math.PI / 180);
}

//------------------------------------------------------------------------------
var updateInterval	= null;
var updateFrequency			= 30;
var frameDuration			= 1000.0 / updateFrequency;

var URLsession;

var camera, camerat, controls, scene, renderer, light;

var material1, material2, material3, material4;

var analyser1, analyser2, analyser3, analyser4;

var clock = new THREE.Clock();

//------------------------------------------------------------------------------
var labelNames = ['Overview','Galaxia','Temple','Head','Moebius','Brad','Orlinski'];
var currentLabel = 0;
var labels = {
	Galaxia : {
		euid 		: '32371cdc-bb91-4829-a622-1b54e43d8674',
		entity 		: null,
		txt 		: label1,
		titre 		: "Galaxia",
		sousTitre 	: "Arthur Mamou-Mani",
		num			: 1
	},
	Temple : {
		euid 		: '4aa32f13-2e87-4998-b70a-03b71ab31d01',
		entity 		: null,
		txt 		: label2,
		titre 		: "Temple",
		sousTitre 	: "Sylvia Adrienne",
		num			: 2
	},
	Head : {
		euid 		: 'ac1b25ee-ffa6-4e75-84c6-fd1ccac2c0cb',
		entity 		: null,
		txt 		: label3,
		titre 		: "Head Maze",
		sousTitre 	: "Matthew Schultz and The Pier",
		num			: 3
	},
	Moebius : {
		euid 		: '130ff488-7f23-4f16-b3de-c1f58c9fdb71',
		entity 		: null,
		txt 		: label4,
		titre 		: "Moebius",
		sousTitre 	: "Jean Giraud",
		num			: 4
	},
	Brad : {
		euid 		: 'e60b8737-8c79-44a8-a544-f5cfa6e8a113',
		entity 		: null,
		txt 		: label5,
		titre 		: "Shell",
		sousTitre 	: "Brad Kligerman",
		num			: 5
	},
	Orlinski : {
		euid 		: '1ada703f-cc4c-4303-9f25-f9686d6bfe78',
		entity 		: null,
		txt 		: label6,
		titre 		: "Meshes",
		sousTitre 	: "Richard Orlinski",
		num			: 6
	},
	Overview : {
		euid 		: '120cfbc8-40b4-4448-8b34-9ed004faa514',
		entity 		: null,
		txt 		: label7,
		titre 		: "Overview",
		sousTitre 	: "",
		num			: 7
	}
};

//------------------------------------------------------------------------------
function copyToClipboard(element) {
	var $temp = $("<input>");
	$("body").append($temp);
	$temp.val($(element).text()).select();
	document.execCommand("copy");
	$temp.remove();
}
  
//------------------------------------------------------------------------------
async function initSDK(canvas)
{
	x = document.getElementById("myAudio");

	document.getElementById("waitingBox").innerHTML = "Please wait -> Loading SDK";

    var user        = 'NooSens';
    var password    = 'BurningMan2020';
    var sceneUUID = '41af9da4-b294-4dbe-a529-c414d117e4e4'

    SDK3DVerse.webAPI.setURL('https://3dverse.com/api');
    var connectionInfo = await SDK3DVerse.webAPI.startSession(user, password, sceneUUID);

    SDK3DVerse.notifier.on('onLoadingStarter', 	() 			=> document.getElementById("message").innerHTML = "Connecting...");
    SDK3DVerse.notifier.on('onLoadingProgress', (status) 	=> document.getElementById("message").innerHTML = status.message);
    SDK3DVerse.notifier.on('onLoadingEnded', 	(status) 	=> document.getElementById("message").innerHTML = status.message);

	 SDK3DVerse.setupDisplay(canvas);

    SDK3DVerse.setViewports(
		[{
			id      : 0,
			left    : 0.0,
			top     : 0.0,
			width   : 1.0,
			height  : 1.0,

			defaultTransform        : {
				position    : [-40.95592498779297, 9.733142852783203, 84.22504425048828],
				orientation : [-0.046065255999565125, -0.25681939721107483, -0.012258878909051418, 0.9652806520462036],
				scale       : [1.0, 1.0, 1.0]
			}
		}]);

    SDK3DVerse.startStreamer(connectionInfo);
    SDK3DVerse.connectToEditor('wss://3dverse.com/editor-backend/');

	window.addEventListener("orientationchange", SetSize, false);
	window.addEventListener("resize", SetSize, false);

    SDK3DVerse.installExtension(SDK3DVerse_LabelDisplay_Ext);
    await SDK3DVerse.onConnected();

    await SDK3DVerse.installExtension(SDK3DVerse_ThreeJS_Ext);
    await SDK3DVerse.onEditorConnected();

    //const screens = await resolveScreens();
    //console.log("SCreens...")
    //console.log(screens)
    //const container = document.getElementById('container');
    //createContext(canvas, container, screens);

    SDK3DVerse.notifier.on('sceneGraphReady', initConfigurator);
	//Session URL/Link
	SDK3DVerse.webAPI.createLink = async function()
	{
		const data = await this.httpPost('session/guestLink',
		{
			token      : this.apiToken,
			sessionKey : SDK3DVerse.streamer.config.connectionInfo.sessionKey
		});

		const guestToken    = data.guestToken;
		const index         = window.location.href.lastIndexOf('/');
		//const url           = window.location.href.substring(0, index + 1) + guestToken;
		const url = guestToken;
		return url;
	};

	var boutonCopy = document.getElementById('notifs');
    boutonCopy.addEventListener('click', function(){
        copyToClipboard(this);
        alert("This link has been copied to your clip board:\n"+this.textContent);
    }); 
}

//------------------------------------------------------------------------------
function SetSize()
{
	// var width  = $('body').outerWidth();
	// var height = $('body').outerHeight();

	// if(width > height)
	// {
	// 	//height = width * 9 / 16;
	// }

    // width = Math.max(width, 800);
    // height = Math.max(height, 450);

	//$('#display_canvas').width(width);
	//$('#display_canvas').height(height);

	SDK3DVerse.setResolution(820, 450);
	//camera.aspect = window.innerWidth / window.innerHeight;
	//camera.updateProjectionMatrix();

	//renderer.setSize( window.innerWidth, window.innerHeight );

	//controls.handleResize();
}

            //------------------------------------------------------------------
async function resolveScreens()
{

    /*
    $.get("https://django-api.immexia.xyz/mysticverse/list_entities", function(resp) {
        var video_mappings = JSON.parse(resp);
        console.log(video_mappings)
        alert("HERE")
    });
    */

    const entities  = await SDK3DVerse.engineAPI.filterEntities({mandatoryComponents : ['scene_ref']});
    const screens   = entities.filter(entity =>
    {
        const name = entity.getComponent('debug_name').value;
        console.log("entity name: " + name)
        const match = name.match(/#\[(.*)\]/);
        if(!match)
        {
            return false;
        }

        //entity.screenID = match[1];
        entity.screenID = 'HIlG2NKnsVA'
        return true;
    });

    return screens;
}
//------------------------------------------------------------------
async function createContext(canvas, container, screens)
{
    const THREE = SDK3DVerse.threeJS.THREE;

    //--------------------------------------------------------------
    const globalMatrix          = new THREE.Matrix4();
    const viewMatrix            = new THREE.Matrix4();
    const positionInGeometry    = new THREE.Vector3();

    // Classes
    const { CSS3DObject, CSS3DSprite, CSS3DRenderer } = importCssRenderer(THREE);
    //--------------------------------------------------------------
    const VideoElement = function (id, globalTransform)
    {
        // The plane where the video is rendered is actually sized by
        // 2 units of width and height (2 squares in the debug lines) in its local space.
        const planeWidth            = 2;
        const planeHeight           = 2;

        // In the scene, the plane entity is scaled with [16.0, 9.0, 1] in its 
        // local_transform components to reproduce standard aspect ratio.
        const planeScale            = globalTransform.scale;

        // 1px in css3dRenderer is 1 unit in the 3dverse space (i.e. 1 square in the debug lines)
        // Since 1 pixel for 1 unit would make a giant plane in the scene, we will scale it.
        const pixelToUnitScale      = 400; // 100 pixel = 1 unit

        const iframeURL             = ['https://www.youtube.com/embed/', id, '?rel=0' , '&autoplay=1'].join('');;

        // We're going to apply the scale of the plane entity, on the dom's element width and height.
        const div                   = document.createElement('div');
        div.style.width             = (planeScale[0] * pixelToUnitScale) + 'px';
        div.style.height            = (planeScale[1] * pixelToUnitScale) + 'px';
        div.classList.add('video-element');
        
        const iframe                = document.createElement('iframe');
        iframe.style.width          = (planeScale[0] * pixelToUnitScale) + 'px';
        iframe.style.height         = (planeScale[1] * pixelToUnitScale) + 'px';
        iframe.style.border         = '0px';
        div.appendChild( iframe );

        const object = new CSS3DObject( div );
        object.position.fromArray(globalTransform.position);
        object.quaternion.fromArray(globalTransform.orientation);

        // The following statement will divide the scale by 50 to fit the plane, 
        // since our unit scale is 100 and the plane is 2 unit of width and height
        object.scale.fromArray(
        [
            1 / (pixelToUnitScale / planeWidth),    // X
            1 / (pixelToUnitScale / planeHeight),   // Y
            1                                       // Z
        ]);
        object.updateMatrixWorld();

        object.isVisible = () =>
        {
            return div.classList.contains('visible');
        };

        object.setVisibility = (isVisible) =>
        {
            if(isVisible)
            {
                div.classList.add('visible');
                iframe.src = iframeURL;
            }
            else
            {
                div.classList.remove('visible');
                iframe.src = '';
            }
        };

        return object;
    }

    //--------------------------------------------------------------
    function isInsideGeometry(globalPosition, geometry)
    {
        globalMatrix.fromArray(geometry.getGlobalMatrix());
        viewMatrix.getInverse(globalMatrix);

        positionInGeometry.fromArray(globalPosition);
        positionInGeometry.applyMatrix4(viewMatrix);

        const dimensions = geometry.getComponent('box_geometry').dimension;

        return Math.abs(positionInGeometry.x) < dimensions[0]
            && Math.abs(positionInGeometry.y) < dimensions[1]
            && Math.abs(positionInGeometry.z) < dimensions[2];
    }

    // Instanciate classes
    const scene     = new THREE.Scene();
    const renderer  = new CSS3DRenderer();
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);

    // Define stylesheet of the renderer's div
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = 0;
    renderer.domElement.style.pointerEvents = 'none';
    container.appendChild( renderer.domElement );

    const videoElements = [];
    for(const screenEntity of screens)
    {
        // Create a video element, with the plane entity global transform.
        const videoElement      = new VideoElement(screenEntity.screenID, screenEntity.getGlobalTransform());

        const children          = await SDK3DVerse.engineAPI.getEntityChildren(screenEntity);
        videoElement.geometries = children.filter(entity => entity.isAttached('box_geometry'));

        videoElements.push(videoElement);
        scene.add(videoElement);
    }
    
    // The main render function of css3d
    SDK3DVerse.notifier.on('onFramePostRender', () =>
    {
        const viewports = SDK3DVerse.engineAPI.cameraAPI.getActiveViewports();
        for(const viewport of viewports)
        {
            const camera = viewport.threeJScamera;
            if(camera)
            {
                renderer.render(scene, camera);
            }
        }
    });

    // Canvas resize event
    SDK3DVerse.notifier.on('onCanvasResized', (width, height) => renderer.setSize(width, height));

    // This callback is triggered when any camera is moved
    SDK3DVerse.notifier.on('OnCamerasUpdated', (cameras) =>
    {
        const currentViewportEnabled = SDK3DVerse.engineAPI.cameraAPI.currentViewportEnabled;
        if(!currentViewportEnabled)
        {
            // No current viewport means the canvas has not been clicked
            return;
        }
        
        const globalTransform   = currentViewportEnabled.getTransform();

        for(const videoElement of videoElements)
        {
            const isVisible = videoElement.isVisible();
            const isInside  = videoElement.geometries.some(g => isInsideGeometry(globalTransform.position, g));

            if(isInside && !isVisible)
            {
                videoElement.setVisibility(true);
            }
            else if (!isInside && isVisible)
            {
                videoElement.setVisibility(false);
            }
        }
    });
}


//------------------------------------------------------------------------------
async function initConfigurator()
{	

	document.getElementById("waitingBox").innerHTML = "Please wait -> Initialization Application";

	URLsession      = await SDK3DVerse.webAPI.createLink();
	
	document.getElementById("waitingBox").innerHTML = "Please wait -> Loading Labels";

	for (var i in labels)
	{
		var candidates = await SDK3DVerse.engineAPI.editorAPI.resolveEntitiesByEUID(labels[i].euid);
		if (candidates.length > 0)
		{
			labels[i].entity = candidates[0];
		}
	}

	document.getElementById("message").innerHTML = "";
	
	// Hack div labels
	$('.label-container').remove();
	SetSize();
	
    document.getElementById('qrcode').style.visibility = "hidden";
    var qrcode = new QRCode(document.getElementById("qrcode"), {
        text: "https://3dverse.com/m.viewer/" + URLsession,
        width: 256,
        height: 256,
        colorDark : "#000000",
        colorLight : "#ffffff",
        correctLevel : QRCode.CorrectLevel.H
	});
	
	var boutonCopy = document.getElementById('notifs');
    boutonCopy.addEventListener('click', function(){
        copyToClipboard(this);
        alert("This link has been copied to your clip board:\n"+this.textContent);
	}); 
	
	document.getElementById('display_canvas').style.visibility = "visible";
	document.getElementById('DownMenu').style.visibility = "visible";
	
	document.getElementById("pBar").style.width=100+"%";
	document.getElementById('Bar').style.visibility 	= "hidden";
	document.getElementById("Start").style.visibility   = "visible";

	$("#Start").on("click",LaunchApp);
	$("#prevBt").on("click",goToPreviousView);
	$("#nextBt").on("click",goToNextView);
	$("#share").on("click",SessionURL);
	$("#CloseDescriptif").on("click",closeLabel);

}

//------------------------------------------------------------------------------
function LaunchApp()
{	
	$("#myModal").modal("hide");

    // Create virtual joysticks
	var virtualJoystick     = new VirtualJoystick(SDK3DVerse);
	var leftJoystick        = virtualJoystick.create('#left-joystick');
	var rightJoystick       = virtualJoystick.create('#right-joystick');
	var heightJoystick      = virtualJoystick.create('#height-joystick', {lockY : true});

	virtualJoystick.bind(leftJoystick, 'straffXZ');
	virtualJoystick.bind(rightJoystick, 'look');
	virtualJoystick.bind(heightJoystick, 'straffY');

	// Create speed Swiper
	var speedSwiper = new SpeedSwiper(SDK3DVerse);
	var swiper      = speedSwiper.create($('#speed-container'));

	speedSwiper.bind(swiper, document.getElementById('display_canvas'), 2);

	//Spatial Sound System
	init();
	//playAudio();
}

//------------------------------------------------------------------------------
function SessionURL()
{
    if(document.getElementById('share').value == "Close Share"){
        document.getElementById('share').value                  = "Share";
        document.getElementById("ShareDiv").style.visibility    = "hidden";
        document.getElementById("qrcode").style.visibility      = "hidden";
        document.getElementById("notifs").style.visibility      = "hidden";
    }else{
        document.getElementById('share').value                  = "Close Share";
        document.getElementById("ShareDiv").style.visibility    = "visible";
        document.getElementById("qrcode").style.visibility      = "visible";
        document.getElementById("notifs").style.visibility      = "visible";
        document.getElementById("notifs").innerHTML             = "https://3dverse.com/m.viewer/" + URLsession;
    }
}

//------------------------------------------------------------------------------
function setView(view)
{
	document.getElementById('PanelDescriptif').classList.remove("show");
	if (labels[view])
	{
		// document.getElementById('PanelDescriptif').style.visibility = "hidden";
		SDK3DVerse.extensions.LabelDisplay.onLabelClicked(labels[view].entity);

		window.setTimeout(function(){ 
			if (labels[view].txt!=""){
				document.getElementById('PanelDescriptif').classList.add("show");
				document.getElementById('comment').innerHTML 				= "<p>"+labels[view].txt+"</p>";
				document.getElementById('titre').innerHTML 					= labels[view].titre;
				document.getElementById('sousTitre').innerHTML 				= labels[view].sousTitre;
				document.getElementById('badgeId').innerHTML 				= labels[view].num;
			}
			//pauseAudio();
		}, 4000);
	}
}

//------------------------------------------------------------------------------
function closeLabel()
{
	document.getElementById('PanelDescriptif').classList.remove("show");
	document.getElementById('comment').innerHTML 				= "";
	document.getElementById('titre').innerHTML 					= "";
	document.getElementById('sousTitre').innerHTML 				= "";
	document.getElementById('badgeId').innerHTML 				= "";
	//playAudio();
}

//------------------------------------------------------------------------------
function goToPreviousView()
{
	currentLabel = (currentLabel == 0)
		? (labelNames.length - 1)
		: (currentLabel - 1) % labelNames.length;
		
	setView(labelNames[currentLabel]);
}

//------------------------------------------------------------------------------
function goToNextView()
{
	currentLabel = (currentLabel + 1) % labelNames.length;
	setView(labelNames[currentLabel]);
}


//------------------------------------------------------------------------------

//Spatial sound system
function init() {

var overlay = document.getElementById( 'overlay' );
overlay.remove();

camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 10000 );
camera.position.set( 1000, 0, 0 );

var listener = new THREE.AudioListener();
camera.add( listener );

scene = new THREE.Scene();
scene.fog = new THREE.FogExp2( 0x000000, 0.0025 );

light = new THREE.DirectionalLight( 0xffffff );
light.position.set( 0, 0.5, 1 ).normalize();
scene.add( light );

var sphere = new THREE.SphereBufferGeometry( 5, 8, 4 );

material1 = new THREE.MeshPhongMaterial( { color: 0xffaa00, flatShading: true, shininess: 0 } );
material2 = new THREE.MeshPhongMaterial( { color: 0xff2200, flatShading: true, shininess: 0 } );
material3 = new THREE.MeshPhongMaterial( { color: 0x6622aa, flatShading: true, shininess: 0 } );
material4 = new THREE.MeshPhongMaterial( { color: 0x6622aa, flatShading: true, shininess: 0 } );

// sound spheres

var audioLoader = new THREE.AudioLoader();

var mesh1 = new THREE.Mesh( sphere, material1 );
mesh1.position.set( -47, 0, 10 );
scene.add( mesh1 );

var sound1 = new THREE.PositionalAudio( listener );
audioLoader.load( 'audio/track4.mpeg', function ( buffer ) {

	sound1.setBuffer( buffer );
	sound1.setRefDistance( 0.22 );
	sound1.play();

} );
mesh1.add( sound1 );

//

var mesh2 = new THREE.Mesh( sphere, material2 );
mesh2.position.set( 37, 0, 20 );
scene.add( mesh2 );

var sound2 = new THREE.PositionalAudio( listener );
audioLoader.load( 'audio/track2.mpeg', function ( buffer ) {

	sound2.setBuffer( buffer );
	sound2.setRefDistance( 0.22 );
	sound2.play();

} );
mesh2.add( sound2 );

//


var mesh3 = new THREE.Mesh( sphere, material3 );
mesh3.position.set( 28, 0, -7 );
scene.add( mesh3 );

var sound3 = new THREE.PositionalAudio( listener );
audioLoader.load( 'audio/track3.mpeg', function ( buffer ) {

	sound3.setBuffer( buffer );
	sound3.setRefDistance( 0.15 );
	sound3.play();

} );
mesh3.add( sound3 );


var mesh4 = new THREE.Mesh( sphere, material4 );
mesh4.position.set( -17, 0, 38 );
scene.add( mesh4 );

var sound4 = new THREE.PositionalAudio( listener );
audioLoader.load( 'audio/track1.mpeg', function ( buffer ) {

	sound4.setBuffer( buffer );
	sound4.setRefDistance( 0.15 );
	sound4.play();

} );
mesh4.add( sound4 );

// analysers

analyser1 = new THREE.AudioAnalyser( sound1, 32 );
analyser2 = new THREE.AudioAnalyser( sound2, 32 );
analyser3 = new THREE.AudioAnalyser( sound3, 32 );
analyser4 = new THREE.AudioAnalyser( sound3, 32 );

// global ambient audio
/*
var sound4 = new THREE.Audio( listener );
audioLoader.load( 'audio/track1.mpeg', function ( buffer ) {

	sound4.setBuffer( buffer );
	sound4.setLoop( true );
	sound4.setVolume( 0.25 );
	sound4.play();

} );
*/
// ground

var helper = new THREE.GridHelper( 1000, 10, 0x444444, 0x444444 );
helper.position.y = 0.1;
scene.add( helper );

//

var SoundControls = function () {

	this.master = listener.getMasterVolume();
	this.firstSphere = sound1.getVolume();
	this.secondSphere = sound2.getVolume();
	this.thirdSphere = sound3.getVolume();
	this.forthSphere = sound4.getVolume();
	//this.Ambient = sound4.getVolume();

};

            
var gui = new GUI();
var soundControls = new SoundControls();
//var generatorControls = new GeneratorControls();

var volumeFolder = gui.addFolder( 'sound volume' );
//var generatorFolder = gui.addFolder( 'sound generator' );

volumeFolder.add( soundControls, 'master' ).min( 0.0 ).max( 1.0 ).step( 0.01 ).onChange( function () {

	listener.setMasterVolume( soundControls.master );

} );
volumeFolder.add( soundControls, 'firstSphere' ).min( 0.0 ).max( 1.0 ).step( 0.01 ).onChange( function () {

	sound1.setVolume( soundControls.firstSphere );

} );
volumeFolder.add( soundControls, 'secondSphere' ).min( 0.0 ).max( 1.0 ).step( 0.01 ).onChange( function () {

	sound2.setVolume( soundControls.secondSphere );

} );

volumeFolder.add( soundControls, 'thirdSphere' ).min( 0.0 ).max( 1.0 ).step( 0.01 ).onChange( function () {

	sound3.setVolume( soundControls.thirdSphere );

} );
volumeFolder.add( soundControls, 'forthSphere' ).min( 0.0 ).max( 1.0 ).step( 0.01 ).onChange( function () {

	sound4.setVolume( soundControls.forthSphere );

} );
volumeFolder.open();

//generatorFolder.open();

//

renderer = new THREE.WebGLRenderer( );
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( 1, 1 );
document.body.appendChild( renderer.domElement );

//

controls = new FirstPersonControls( camera, renderer.domElement );

controls.movementSpeed = 70;
controls.lookSpeed = 0.05;
controls.noFly = true;
controls.lookVertical = false;

//

//window.addEventListener( 'resize', onWindowResize, false );
camerat = SDK3DVerse.engineAPI.cameraAPI.getViewportByID(0);

animate();

}

function onWindowResize() {

camera.aspect = window.innerWidth / window.innerHeight;
camera.updateProjectionMatrix();

//renderer.setSize( window.innerWidth, window.innerHeight );

controls.handleResize();

}

function animate() {

requestAnimationFrame( animate );
render();

}


function render() {
		
	var x = camerat.getTransform().position[0];
	var y = camerat.getTransform().position[1];
	var z = camerat.getTransform().position[2];


	camera.position.set( x, y, z );
	var delta = clock.getDelta();

	//controls.update( delta );

	material1.emissive.b = analyser1.getAverageFrequency() / 256;
	material2.emissive.b = analyser2.getAverageFrequency() / 256;
	material3.emissive.b = analyser3.getAverageFrequency() / 256;

	renderer.render( scene, camera );

}
