var escena, camara, render;
var ultimoTiempo;
var objetos = {}; var cubeS = 1.2;
var TECLA = { ARRIBA:false, ABAJO:false, IZQUIERDA:false, DERECHA:false, 
              S:false, X:false,Y:false,Z:false,R:false,N:false,M:false };
var velocidad = 0;

function webGLStart() {
    iniciarEscena();
    ultimoTiempo=Date.now();
    document.onkeydown=teclaPulsada;
    document.onkeyup=teclaSoltada;
    animarEscena();
}

function iniciarEscena(){
    //Render
    render = new THREE.WebGLRenderer({antialias:true});

    render.setClearColor(0x000000, 1);

    var canvasWidth = window.innerWidth * 0.8;
    var canvasHeight = window.innerHeight;
    render.setSize(canvasWidth, canvasHeight);

    document.body.appendChild(render.domElement);

    //Escena
    escena = new THREE.Scene();

    //Camara
    var SCREEN_WIDTH = window.innerWidth * 0.8, SCREEN_HEIGHT = window.innerHeight;
    var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 20000;
    camara = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);
    escena.add(camara);
    camara.position.set(0,150,400);
    camara.lookAt(escena.position);  

    // controles de camara
    controlCamara = new THREE.OrbitControls( camara, render.domElement );

    // estadisticas
    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '10px';
    stats.domElement.style.zIndex = 100;
    document.body.appendChild( stats.domElement );

    //sombras
    render.shadowMapEnabled = true;

    // luces
    var light = new THREE.PointLight(0xffffff);
    light.position.set(-100,150,100);
    light.castShadow = true; //Generación de sombras
    
    // Adicionamos luz ambiente para ver las componentes
    // ambiente de los objetos.
    var light2 = new THREE.AmbientLight(0x333333); 
    light2.position.set( light.position );
    escena.add(light2);
    
    var bombillaGeo = new THREE.SphereGeometry( 10, 16, 8 );
    var bombillaMat = new THREE.MeshBasicMaterial( { color: 0xffffff, transparent: true,  opacity: 0.8, blending: THREE.AdditiveBlending } );
    var wireMaterial = new THREE.MeshBasicMaterial( { color: 0x000000, wireframe: true } );
    var materialArray = [bombillaMat, wireMaterial];
    var bombilla = THREE.SceneUtils.createMultiMaterialObject( bombillaGeo, materialArray );
    bombilla.position = light.position;
    escena.add(bombilla);
    escena.add(light);

    // spotlight #1 -- yellow, dark shadow
    var spotlight = new THREE.SpotLight(0xffff00);
    spotlight.position.set(-60,250,-30);
    spotlight.shadowCameraVisible = false;
    spotlight.shadowDarkness = 0.8;
    spotlight.intensity = 4;
    // must enable shadow casting ability for the light
    spotlight.castShadow = true;
    escena.add(spotlight);

    var bombillaSLGeo = new THREE.SphereGeometry( 10, 16, 8 );
    var bombillaSLMat = new THREE.MeshBasicMaterial( { color: 0xffffff, transparent: true,  opacity: 0.8, blending: THREE.AdditiveBlending } );
    var wireMaterial = new THREE.MeshBasicMaterial( { color: 0xffff00, wireframe: true } );
    var materialArray = [bombillaSLMat, wireMaterial];
    var bombillaSL = THREE.SceneUtils.createMultiMaterialObject( bombillaSLGeo, materialArray );
    bombillaSL.position = spotlight.position;
    escena.add(bombillaSL);

    // piso
    var floorTexture = new THREE.ImageUtils.loadTexture( 'assets/texturas/crate.gif' );
    floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping; 
    floorTexture.repeat.set( 10, 10 );
    //var floorMaterial = new THREE.MeshBasicMaterial( { map: floorTexture, side: THREE.DoubleSide } );
    // Note the change to Lambert material.
    var floorMaterial = new THREE.MeshLambertMaterial( { map: floorTexture, side: THREE.DoubleSide } );
    var floorGeometry = new THREE.PlaneGeometry(1000, 1000, 100, 100);
    var floorGeometry = new THREE.PlaneGeometry(1000, 1000, 10, 10);
    var floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.position.y = -100;
    floor.rotation.x = Math.PI / 2;
    floor.receiveShadow = true;
    escena.add(floor);

    // ejes
    var axes = new THREE.AxisHelper(100);
    escena.add(axes);

    //CANVAS GUI
    gui = new dat.GUI({ autoPlace: false });
    document.getElementById("DATGUI").appendChild(gui.domElement);
    
    parameters = 
    {
        x: 0, y: 30, z: 0,
        color:  "#ff0000", // color (change "#" to "0x")
        colorA: "#000000", // color (change "#" to "0x")
        colorE: "#000033", // color (change "#" to "0x")
        colorS: "#ffff00", // color (change "#" to "0x")
        shininess: 30,
        opacity: 1, 
        visible: true,
        material: "Phong",
        reset: function() { resetSphere() }
    };
    
    var folder1 = gui.addFolder('Position');
    var sphereX = folder1.add( parameters, 'x' ).min(-200).max(200).step(1).listen();
    var sphereY = folder1.add( parameters, 'y' ).min(0).max(100).step(1).listen();
    var sphereZ = folder1.add( parameters, 'z' ).min(-200).max(200).step(1).listen();
    folder1.open();
    
    sphereX.onChange(function(value) 
    {   sphere.position.x = value;   });
    sphereY.onChange(function(value) 
    {   sphere.position.y = value;   });
    sphereZ.onChange(function(value) 
    {   sphere.position.z = value;   });
    
    var sphereColor = gui.addColor( parameters, 'color' ).name('Color (Diffuse)').listen();
    sphereColor.onChange(function(value) // onFinishChange
    {   sphere.material.color.setHex( value.replace("#", "0x") );   });
    var sphereColorA = gui.addColor( parameters, 'colorA' ).name('Color (Ambient)').listen();
    sphereColorA.onChange(function(value) // onFinishChange
    {   sphere.material.ambient.setHex( value.replace("#", "0x") );   });
    var sphereColorE = gui.addColor( parameters, 'colorE' ).name('Color (Emissive)').listen();
    sphereColorE.onChange(function(value) // onFinishChange
    {   sphere.material.emissive.setHex( value.replace("#", "0x") );   });
    var sphereColorS = gui.addColor( parameters, 'colorS' ).name('Color (Specular)').listen();
    sphereColorS.onChange(function(value) // onFinishChange
    {   sphere.material.specular.setHex( value.replace("#", "0x") );   });
    var sphereShininess = gui.add( parameters, 'shininess' ).min(0).max(60).step(1).name('Shininess').listen();
    sphereShininess.onChange(function(value)
    {   sphere.material.shininess = value;   });
    var sphereOpacity = gui.add( parameters, 'opacity' ).min(0).max(1).step(0.01).name('Opacity').listen();
    sphereOpacity.onChange(function(value)
    {   sphere.material.opacity = value;   });
    

    gui.open();

    /********* OBJETOS *************/
    var sphereGeometry = new THREE.SphereGeometry( 50  , 25, 25 );
    var sphereMaterial = new THREE.MeshPhongMaterial( { color:0xff0000, transparent:true, opacity:1 } );
    objetos.sphere = new THREE.Mesh( sphereGeometry, sphereMaterial );
    var posV = new THREE.Vector3(0.0,30.0,0);
    objetos.sphere.position.set(posV.x,posV.y,posV.z);
    objetos.sphere.initialPos = posV;
    objetos.sphere.castShadow = true;
    escena.add(objetos.sphere);

    // miniCube
	var cubeGeometry = new THREE.CubeGeometry( cubeS/2 , cubeS/2 , cubeS/2 );
	
	var crateTexture = new THREE.ImageUtils.loadTexture( 'assets/texturas/crate.gif' );
	var crateMaterial = new THREE.MeshBasicMaterial( { map: crateTexture } );
    objetos.crate2 = new THREE.Mesh( cubeGeometry.clone(), crateMaterial );
	posV = new THREE.Vector3(0.0, 1.5, -7.0);
    objetos.crate2.position.set(parseFloat(posV.x),parseFloat(posV.y),parseFloat(posV.z));
    objetos.crate2.initialPos = posV;
	escena.add( objetos.crate2 );
    
}

function animarEscena(){
    requestAnimationFrame(animarEscena);
    renderEscena();
    actualizarEscena();
}

function actualizarEscena(){
    var delta=(Date.now()-ultimoTiempo)/1000;
    var movSpeed = 1;
    if (TECLA.IZQUIERDA){ 
            if(TECLA.M || TECLA.N){
                moveObjetcs(objetos , new THREE.Vector3(1,0,0) , -movSpeed);
            }else{
                velocidad-=0.02*delta;
            } 
        }
        
        if (TECLA.DERECHA){ 
            if(TECLA.M || TECLA.N){
                moveObjetcs(objetos , new THREE.Vector3(1,0,0) , movSpeed);
            }else{
                velocidad+=0.02*delta;
            } 
        }
        
        if (TECLA.ARRIBA){ 
            if(TECLA.M){
                moveObjetcs(objetos , new THREE.Vector3(0,1,0) , movSpeed);
            }else{
                if(TECLA.N) moveObjetcs(objetos , new THREE.Vector3(0,0,1) , -movSpeed);
            }
        }
        
        if (TECLA.ABAJO){ 
            if(TECLA.M){
                moveObjetcs(objetos , new THREE.Vector3(0,1,0) , -movSpeed);
            }else{
                if(TECLA.N) moveObjetcs(objetos , new THREE.Vector3(0,0,1) , movSpeed);
            }
        }
        
        if (TECLA.S) velocidad = 0; TECLA.S=false;
        if (TECLA.R){resetObjects(objetos); TECLA.R=false;}
        if(TECLA.X ||  TECLA.Y || TECLA.Z){
            rotateObjectsAroundWorldAxis(objetos, new THREE.Vector3(TECLA.X,TECLA.Y,TECLA.Z), velocidad);
    }
    ultimoTiempo=Date.now();
    controlCamara.update();
    stats.update();
}

function renderEscena(){
    render.render(escena, camara);
}