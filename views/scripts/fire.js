// Include Three.js
// import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.136.0/build/three.module.js';

let scene, camera, renderer;
var mesh;
var clock, controller, fires = [];
var isFireActive = false;

init();

function init() {

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.001, 1000);
    camera.position.z = 2;

    
    scene = new THREE.Scene();
    
    renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setClearColor( 0xffffff, 0);
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setPixelRatio(window.devicePixelRatio * 0.2); // Lower the pixel ratio
    document.body.appendChild( renderer.domElement );
    
    var loader = new THREE.TextureLoader();
    loader.crossOrigin = '';
    
    var fireTex = loader.load("https://s3-us-west-2.amazonaws.com/s.cdpn.io/212131/Fire.png");
    fireTex.blending = THREE.NoBlending;
    
    const numOfFlames = 4;
    const aspectRatio = window.innerWidth / window.innerHeight;
    const totalWidth = aspectRatio * 2; // Assuming the camera frustum width at z=0
    const flameSpacing = totalWidth / numOfFlames;
    const flameScale = 1.5;

    for (let i = 0; i < numOfFlames; i++) {
        const fire = new THREE.Fire(fireTex);

        // Set x position for each flame
        // The "- totalWidth / 2" centers the flames
        const xPosition = (i * flameSpacing) - (totalWidth / 2) + (flameSpacing / 2);

        fire.position.set(xPosition, i == 0 || i == 3 ? -0.5 : -0.25, 1); // Adjust y and z position as needed
        fire.scale.set(flameScale, flameScale, flameScale); // Scale the flame (adjust as needed)

        scene.add(fire);
        fires.push(fire);
    }

    clock = new THREE.Clock();

    window.addEventListener( 'resize', onWindowResize, false );

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

(function loop() {
     requestAnimationFrame(loop);

     var delta = clock.getDelta();

     //var t = clock.elapsedTime * controller.speed;
     var t = clock.elapsedTime;
     for (const fire of fires) {
      if (isFireActive) {
        fire.visible = true;
        fire.update(t);
      } else {
        fire.visible = false;
      }
     }
     
     renderer.render(scene, camera);
})();