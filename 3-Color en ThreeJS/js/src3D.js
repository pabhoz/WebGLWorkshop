var escena, camara, render;
var piramide, cubo;
var ultimoTiempo;
var TECLA = { ARRIBA:false, ABAJO:false, IZQUIERDA:false, DERECHA:false, S:false, X:false,Y:false,Z:false,R:false };
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

    //Pirámide
    var piramideMaterial = new THREE.MeshBasicMaterial({
        vertexColors:THREE.VertexColors, //Usando color en los vertices
        side:THREE.DoubleSide //o oneSide
    });
        var piramideGeometria = new THREE.CylinderGeometry(0, 1.4, 2, 4, 1, true); // radioSuperior, radioInferior, h, caras, segmentos, abierto?
        
    var switchON = true;
    for (i = 0; i < piramideGeometria.faces.length; i++) {
        piramideGeometria.faces[i].vertexColors[2] = new THREE.Color(0xFF0000);//Vértice común
    
        if ((i % 2) == 1) {//Las caras impares son las que se ven
            if (switchON) {//De las caras que se ven se van intercalando los vértices
                piramideGeometria.faces[i].vertexColors[1] = new THREE.Color(0x0000FF);
                piramideGeometria.faces[i].vertexColors[0] = new THREE.Color(0x00FF00);
                switchON = false;
            }else {
                piramideGeometria.faces[i].vertexColors[1] = new THREE.Color(0x00FF00);
                piramideGeometria.faces[i].vertexColors[0] = new THREE.Color(0x0000FF);
                switchON = true;
            }
        
        } else {//Caras que no se ven
            piramideGeometria.faces[i].vertexColors[1] = new THREE.Color(0x0000FF);
            piramideGeometria.faces[i].vertexColors[0] = new THREE.Color(0x00FF00);
        }
    }

    piramide = new THREE.Mesh(piramideGeometria, piramideMaterial); console.log(piramide);
    //piramide.position.set(-1.5, 0.0, -7.0);
    piramide.position.set(0.0, 0.0, -7.0);
    escena.add(piramide);
    console.log(piramide);
    piramide.resetMatrix = piramide.matrix;
    console.log("Piramide: "+piramide);

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

    var cuboGeometria = new THREE.CubeGeometry(1.7, 1.7, 1.7);// Ancho x Alto x Profundo

    cubo = new THREE.Mesh(cuboGeometria, cuboMaterial);
    cubo.position.set(1.5, 0.0, -7.0);
    //escena.add(cubo);
}
function renderEscena(){
    render.render(escena, camara);
}
function animarEscena(){
    var delta=(Date.now()-ultimoTiempo)/1000;
    if (delta>0)
    {
        if (TECLA.IZQUIERDA) velocidad-=0.2*delta;
        if (TECLA.DERECHA) velocidad+=0.2*delta;
        if (TECLA.S) velocidad = 0; TECLA.S=false;
        if (TECLA.R) piramide.matrix = piramide.resetMatrix; TECLA.R=false;
        //piramide.rotation.y += degToRad(90)*delta;
        //rotateAroundWorldAxis(piramide, new THREE.Vector3(0,1,0), -degToRad(20)*delta);
        rotateAroundWorldAxis(piramide, new THREE.Vector3(TECLA.X,TECLA.Y,TECLA.Z), velocidad);
        rotateAroundWorldAxis(cubo, new THREE.Vector3(1,0,0), -degToRad(20)*delta);
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