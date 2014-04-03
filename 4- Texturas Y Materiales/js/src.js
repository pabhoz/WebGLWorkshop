var escena, camara, render;
var ultimoTiempo;
var objetos = {}; var cubeS = 1.2;
var TECLA = { ARRIBA:false, ABAJO:false, IZQUIERDA:false, DERECHA:false, S:false, X:false,Y:false,Z:false,R:false,M:false };
var velocidad = 0;

function degToRad(degrees) {
    return degrees * Math.PI / 180;
}

function rotateAroundWorldAxis( object, axis, radians ) {
    var rotationMatrix = new THREE.Matrix4(); //Matriz identidad 4x4
    rotationMatrix.makeRotationAxis( axis.normalize(), radians );
    rotationMatrix.multiply( object.matrix );
    object.matrix = rotationMatrix;
    object.rotation.setFromRotationMatrix( object.matrix );
}

function rotateObjectsAroundWorldAxis( objects, axis, radians ) {
    for(var i=0; i<Object.keys(objects).length; i++)
    {
        var object = Object.keys(objects)[i];
        var rotationMatrix = new THREE.Matrix4(); //Matriz identidad 4x4
        rotationMatrix.makeRotationAxis( axis.normalize(), radians );
        rotationMatrix.multiply( objects[object].matrix );
        objects[object].matrix = rotationMatrix;
        objects[object].rotation.setFromRotationMatrix( objects[object].matrix );
    }
}

function moveObjetc(object , axis , distance){
    object.translateOnAxis(axis,distance);
}

function moveObjetcs(objects , axis , distance){
    for(var i=0; i<Object.keys(objects).length; i++)
    {
        var object = Object.keys(objects)[i];
        objects[object].translateOnAxis(axis,distance);
    }
}

function resetObjects(objects){
    
    for(var i=0; i<Object.keys(objects).length; i++)
    {
        var object = Object.keys(objects)[i];
        objects[object].rotation.set(0,0,0);
        objects[object].position.set(parseFloat(objects[object].initialPos.x),
                                    parseFloat(objects[object].initialPos.y),
                                    parseFloat(objects[object].initialPos.z));
    }
}

function iniciarEscena(){
    //Render
    render = new THREE.WebGLRenderer();

    render.setClearColor(0x000000, 1);

    var canvasWidth = 1000;
    var canvasHeight = 800;
    render.setSize(canvasWidth, canvasHeight);

    document.body.appendChild(render.domElement);

    //Escena
    escena = new THREE.Scene();

    //Camara
    camara = new THREE.PerspectiveCamera(45, canvasWidth / canvasHeight, 0.1, 100);
    camara.position.set(0, 0, 0);
    camara.lookAt(escena.position);
    escena.add(camara);

    //Cubo
    var cuboMateriales = [
        new THREE.MeshBasicMaterial({color:0xFF0000}),//Izquierda
        new THREE.MeshBasicMaterial({color:0x00FF00}),//Derecha
        new THREE.MeshBasicMaterial({color:0x0000FF}),//Superior
        new THREE.MeshBasicMaterial({color:0x00FFFF}),//Inferior
        new THREE.MeshBasicMaterial({color:0xFFFF00}),//Frontal
        new THREE.MeshBasicMaterial({color:0xFF00FF})//Trasera
    ];
    var cuboMaterial = new THREE.MeshFaceMaterial(cuboMateriales)
    var cuboGeometria = new THREE.CubeGeometry(cubeS , cubeS , cubeS );// Ancho x Alto x Profundo

    objetos.cubo = new THREE.Mesh(cuboGeometria, cuboMaterial);
    posV = new THREE.Vector3(-2.2, -1.0, -7.0);
    objetos.cubo.position.set(parseFloat(posV.x),parseFloat(posV.y),parseFloat(posV.z));
    objetos.cubo.initialPos = posV;
    escena.add(objetos.cubo);
    
    // Crate
	var cubeGeometry = new THREE.CubeGeometry( cubeS , cubeS , cubeS );
	
	var crateTexture = new THREE.ImageUtils.loadTexture( 'images/crate.gif' );
	var crateMaterial = new THREE.MeshBasicMaterial( { map: crateTexture } );
    /*crateTexture.wrapS = crateTexture.wrapT = THREE.RepeatWrapping;
	crateTexture.repeat.set( 5, 5 );*/
    objetos.crate = new THREE.Mesh( cubeGeometry.clone(), crateMaterial );
	posV = new THREE.Vector3(0.0, -1.0, -7.0);
    objetos.crate.position.set(parseFloat(posV.x),parseFloat(posV.y),parseFloat(posV.z));
    objetos.crate.initialPos = posV;
	escena.add( objetos.crate );
    
    //Dice

	var materialArray = [];
	materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'images/Dice-Blue-1.png' ) }));
	materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'images/Dice-Blue-6.png' ) }));
	materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'images/Dice-Blue-2.png' ) }));
	materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'images/Dice-Blue-5.png' ) }));
	materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'images/Dice-Blue-3.png' ) }));
	materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'images/Dice-Blue-4.png' ) }));
	var DiceBlueMaterial = new THREE.MeshFaceMaterial(materialArray);
	
	var DiceBlueGeom = new THREE.CubeGeometry(  cubeS ,  cubeS ,  cubeS ,1, 1, 1 );
	objetos.dice = new THREE.Mesh( DiceBlueGeom, DiceBlueMaterial );
	posV = new THREE.Vector3(2.2, -1.0, -7.0);
    objetos.dice.position.set(parseFloat(posV.x),parseFloat(posV.y),parseFloat(posV.z));
    objetos.dice.initialPos = posV;
	escena.add( objetos.dice );
    
    // miniCube
	var cubeGeometry = new THREE.CubeGeometry( cubeS/2 , cubeS/2 , cubeS/2 );
	
	var crateTexture = new THREE.ImageUtils.loadTexture( 'images/crate.gif' );
	var crateMaterial = new THREE.MeshBasicMaterial( { map: crateTexture } );
    objetos.crate2 = new THREE.Mesh( cubeGeometry.clone(), crateMaterial );
	posV = new THREE.Vector3(0.0, 1.5, -7.0);
    objetos.crate2.position.set(parseFloat(posV.x),parseFloat(posV.y),parseFloat(posV.z));
    objetos.crate2.initialPos = posV;
	escena.add( objetos.crate2 );
    
    
    //moon
    var sphereGeom =  new THREE.SphereGeometry( 1, 16, 16 );
    var moonTexture = THREE.ImageUtils.loadTexture( 'images/moon.jpg' );
	//var moonMaterial = new THREE.MeshBasicMaterial( { map: moonTexture } );
    var moonMaterial = new THREE.MeshBasicMaterial( { map: moonTexture, ambient: 0xffff00, transparent: true, blending: THREE.AdditiveBlending, opacity: 0.6} );
	objetos.moon = new THREE.Mesh( sphereGeom.clone(), moonMaterial );
	posV = new THREE.Vector3(0.0, 1.5, -7.0);
    objetos.moon.position.set(parseFloat(posV.x),parseFloat(posV.y),parseFloat(posV.z));
    objetos.moon.initialPos = posV;
	escena.add( objetos.moon );
    
    //moon
    var sphereGeom =  new THREE.SphereGeometry( 0.5, 16, 16 );
    var moonTexture = THREE.ImageUtils.loadTexture( 'images/moon.jpg' );
	var moonMaterial = new THREE.MeshBasicMaterial( { map: moonTexture } );
	objetos.lunita = new THREE.Mesh( sphereGeom.clone(), moonMaterial );
	posV = new THREE.Vector3(2.0, 1.5, -7.0);
    objetos.lunita.position.set(parseFloat(posV.x),parseFloat(posV.y),parseFloat(posV.z));
    objetos.lunita.initialPos = posV;
	escena.add( objetos.lunita );
    
}
function renderEscena(){
    render.render(escena, camara);
}
function animarEscena(){
    var delta=(Date.now()-ultimoTiempo)/1000;
    if (delta>0)
    {
       
        if (TECLA.IZQUIERDA){ 
            if(TECLA.M){
                moveObjetcs(objetos , new THREE.Vector3(1,0,0) , -0.1);
            }else{
                velocidad-=0.02*delta;
            } 
        }
        
        if (TECLA.DERECHA){ 
            if(TECLA.M){
                moveObjetcs(objetos , new THREE.Vector3(1,0,0) , 0.1);
            }else{
                velocidad+=0.02*delta;
            } 
        }
        
        if (TECLA.ARRIBA){ 
            if(TECLA.M){
                moveObjetcs(objetos , new THREE.Vector3(0,1,0) , 0.1);
            }
        }
        
        if (TECLA.ABAJO){ 
            if(TECLA.M){
                moveObjetcs(objetos , new THREE.Vector3(0,1,0) , -0.1);
            }
        }
        
        if (TECLA.S) velocidad = 0; TECLA.S=false;
        if (TECLA.R){resetObjects(objetos); TECLA.R=false;}
        if(TECLA.X ||  TECLA.Y || TECLA.Z){
            rotateObjectsAroundWorldAxis(objetos, new THREE.Vector3(TECLA.X,TECLA.Y,TECLA.Z), velocidad);
        }
        renderEscena();
    }
    ultimoTiempo=Date.now();
    requestAnimationFrame(animarEscena);
}
//EJERCICIO!!!! Hacer que el usuario pueda decidir la componente en la que rotará la piramida presionando la letra x,y o z
function teclaPulsada(e)
{
    switch (e.keyCode)
    {
        case 37: // Izquierda
            TECLA.IZQUIERDA=true;
            break;
        case 39: // Derecha
            TECLA.DERECHA=true;
            break;
        case 38: // Arriba
            TECLA.ARRIBA=true;
            break;
        case 40: // Abajo
            TECLA.ABAJO=true;
            break;
        case 88: // x
            TECLA.X=true;
            break;
        case 89: // y
            TECLA.Y=true;
            break;
        case 90: // z
            TECLA.Z=true;
            break;
        case 77: // M
            TECLA.M=true;
            break;
    }

}
function teclaSoltada(e)
{
    switch (e.keyCode)
    {
        case 37: // Izquierda
            TECLA.IZQUIERDA=false;
            break;
        case 39: // Derecha
            TECLA.DERECHA=false;
            break;
        case 38: // Arriba
            TECLA.ARRIBA=false;
            break;
        case 40: // Abajo
            TECLA.ABAJO=false;
            break;
        case 83: // s
            TECLA.S=true;
            break;
        case 82: // r   
            TECLA.R=true;
            break;
        case 88: // x
            TECLA.X=false;
            break;
        case 89: // y
            TECLA.Y=false;
            break;
        case 90: // z
            TECLA.Z=false;
            break;
        case 77: // M
            TECLA.M=false;
            break;
    }
}
function webGLStart() {
    iniciarEscena();
    ultimoTiempo=Date.now();
    //Evaluando Inputs
    document.onkeydown=teclaPulsada;
    document.onkeyup=teclaSoltada;
    animarEscena();
}