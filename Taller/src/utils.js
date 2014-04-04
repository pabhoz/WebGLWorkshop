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
        console.log("resetObjects");
        var object = Object.keys(objects)[i];
        objects[object].rotation.set(0,0,0);
        objects[object].position.set(parseFloat(objects[object].initialPos.x),
                                    parseFloat(objects[object].initialPos.y),
                                    parseFloat(objects[object].initialPos.z));
    }
}


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
        case 78: // n
            TECLA.N=true;
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
            TECLA.S=false;
            break;
        case 82: // r   
            TECLA.R=false;
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
        case 78: // n
            TECLA.N=false;
            break;
        case 77: // M
            TECLA.M=false;
            break;
    }
}

function updateCanvasGuiObject()
{
    var value = parameters.material;
    var newMaterial;
    if (value == "Basic")
        newMaterial = new THREE.MeshBasicMaterial( { color: 0x000000 } );
    else if (value == "Lambert")
        newMaterial = new THREE.MeshLambertMaterial( { color: 0x000000 } );
    else if (value == "Phong")
        newMaterial = new THREE.MeshPhongMaterial( { color: 0x000000 } );
    else // (value == "Wireframe")
        newMaterial = new THREE.MeshBasicMaterial( { wireframe: true } );
    sphere.material = newMaterial;
    
    sphere.position.x = parameters.x;
    sphere.position.y = parameters.y;
    sphere.position.z = parameters.z;
    sphere.material.color.setHex( parameters.color.replace("#", "0x") );
    if (sphere.material.ambient)
        sphere.material.ambient.setHex( parameters.colorA.replace("#", "0x") );
    if (sphere.material.emissive)
        sphere.material.emissive.setHex( parameters.colorE.replace("#", "0x") ); 
    if (sphere.material.specular)
        sphere.material.specular.setHex( parameters.colorS.replace("#", "0x") ); 
    if (sphere.material.shininess)
        sphere.material.shininess = parameters.shininess;
    sphere.material.opacity = parameters.opacity;  
    sphere.material.transparent = true;

}