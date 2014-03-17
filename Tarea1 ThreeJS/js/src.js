var escena, camara, render; //Elementos para render del mundo
var piramide; //Figuras
var ultimoTiempo;
var velocidad = 0;
var TECLA = {IZQUIERDA:false, DERECHA:false};

function webGLStart() {
    iniciarEscena();
    ultimoTiempo=Date.now(); //Calculamos el último tiempo
    document.onkeydown=teclaPulsada; //Evaluamos teclas pulsadas
    document.onkeyup=teclaSoltada;  //Evaluamos teclas soltadas
    animarEscena(); //Animamos
}

function iniciarEscena(){

    render = new THREE.WebGLRenderer(); //Creamos un objeto WebGLRenderer
    console.log(render);

    render.setClearColor(0x000000, 1); //Definimos el color de limpiado

    var canvasWidth = 1000; //Anchos del canvas
    var canvasHeight = 800; //Alto del canvas
    render.setSize(canvasWidth, canvasHeight); //Seteamos el ancho y el alto del canvas WebGL

    document.body.appendChild(render.domElement);//Agregamos el canvas al cuerpo del documento
                                                 //El canvas es un atributo del objeto render de tipo WebGLRenderer

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
        side:THREE.DoubleSide //Que pinte en ambos lados
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

    piramide = new THREE.Mesh(piramideGeometria, piramideMaterial); //La Malla se compone de La geometri y el material
    //piramide.position.set(-1.5, 0.0, -7.0);
    piramide.position.set(0.0, 0.0, -7.0);
    escena.add(piramide);

}

function renderEscena(){
    render.render(escena, camara);
}
function animarEscena(){
    var delta=(Date.now()-ultimoTiempo)/1000;
    if (delta>0)
    {
        //Condicionales de los estados de las teclas
        if (TECLA.IZQUIERDA) velocidad-=0.2*delta;
        if (TECLA.DERECHA) velocidad+=0.2*delta;
        //piramide.rotation.y += velocidad;
        rotateAroundWorldAxis(piramide, new THREE.Vector3(0,1,0), velocidad);
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
    }
}

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