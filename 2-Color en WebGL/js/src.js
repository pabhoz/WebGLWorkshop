    /*
        Le Orden para entender mejor:
        1. webGLStart();
        2. initGL();
        3. initShaders();
        4. initBuffers();
        5. drawScene();
    */

    // Creamos la variable gl que será un canvas webgl / webgl experimental según
    // soporte el navegador.
    var gl = null;
    
    function initGL(canvas) {
        try {
            // Intentamos tomar el contexto webgl, si este no se logra tomar, cargamos
            // el contexto experimental
            gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
            //Open gl maneja un viewport rectangular que define el lugar en donde se renderizan los resultados
            //Despues de crear el contexto de webgl se debe inicializar el viewport 
            gl.viewportWidth = canvas.width; // el ancho del viewport del contexto webgl será igual al ancho del canvas
            gl.viewportHeight = canvas.height; // el alto del viewport del contexto webgl será igual al alto del canvas
        } catch (e) {
        	console.log(e); //Si no se logra ejecutar el bloque anterior devuelva el error en consola
        }
        if (!gl) {// si el contexto generado es falso entonces
            alert("No puede iniciarse webGL en este navegador");
        }
    }


    function getShader(gl, id) {
        var shaderScript = document.getElementById(id);
        if (!shaderScript) {
            return null;
        }
        
        var str = "";
        var k = shaderScript.firstChild;
        while (k) {
            if (k.nodeType == 3) {
                str += k.textContent;
            }
            k = k.nextSibling;
        }

        var shader;
        if (shaderScript.type == "x-shader/x-fragment") {
            shader = gl.createShader(gl.FRAGMENT_SHADER);
        } else if (shaderScript.type == "x-shader/x-vertex") {
            shader = gl.createShader(gl.VERTEX_SHADER);
        } else {
            return null;
        }

        gl.shaderSource(shader, str);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            alert(gl.getShaderInfoLog(shader));
            return null;
        }

        return shader;
    }

    var shaderProgram = null; //Creamos la variable que almacenará nuestro pograma.

    function initShaders() {
        
        //Obtenemos los shaders desde el index
        var fragmentShader = getShader(gl, "shader-fs");
        var vertexShader = getShader(gl, "shader-vs");
        
        
        shaderProgram = gl.createProgram(); // Creamos un objeto de programa vacio. A estos se pueden adjuntar los shaders. 
        gl.attachShader(shaderProgram, vertexShader); //Adjuntamos al programa nuestro vertexShader
        gl.attachShader(shaderProgram, fragmentShader); // Adjuntamos al programa nuestro fragmentShader
        gl.linkProgram(shaderProgram); //Se compila el programa y se vincula al contexto.

        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {//Si los shaders no compilaron correctamente
            alert("No pueden iniciarse los shaders");
        }

        gl.useProgram(shaderProgram);

        shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
        gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
        
        shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
        gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);
        

        shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
        shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
    }

    var mvMatrix = mat4.create();
    var mvMatrixStack = [];
    var pMatrix = mat4.create();

    function mvPushMatrix() {
        var copy = mat4.create();
        mat4.set(mvMatrix, copy);
        mvMatrixStack.push(copy);
    }

    function mvPopMatrix() {
        if (mvMatrixStack.length == 0) {
            throw "Invalid popMatrix!";
        }
        mvMatrix = mvMatrixStack.pop();
    }

    function setMatrixUniforms() { //Esta función guardará en la GPU las matrices de los elementos
        gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
        gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
    }

    function degToRad(degrees) {
        return degrees * Math.PI / 180;
    }

    //Creamos los Buffers para cada figura a utilizar
    var pyramidVertexPositionBuffer;
    var pyramidVertexColorBuffer;

    function initBuffers() {
        
            //Piramide
       pyramidVertexPositionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, pyramidVertexPositionBuffer);
        var vertices = [
            // Front face - CCW
             0.0,  1.0,  0.0, //p0
            -1.0, -1.0,  1.0, //p1
             1.0, -1.0,  1.0, //p2
            // Right face - CW
             0.0,  1.0,  0.0, //p0
             1.0, -1.0,  1.0, //p2
             1.0, -1.0, -1.0, //p3
            // Back face - CW
             0.0,  1.0,  0.0, //p0
             1.0, -1.0, -1.0, //p3
            -1.0, -1.0, -1.0, //p4
            // Left face- CW
             0.0,  1.0,  0.0, //p0
            -1.0, -1.0, -1.0, //p4
            -1.0, -1.0,  1.0  //p1
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        pyramidVertexPositionBuffer.itemSize = 3;
        pyramidVertexPositionBuffer.numItems = 12;
        
        pyramidVertexColorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, pyramidVertexColorBuffer);
        var colors = [
            // Front face
            1.0, 0.0, 1.0, 1.0,
            1.0, 0.0, 1.0, 1.0,
            1.0, 0.0, 1.0, 1.0,

            // Right face
            1.0, 0.0, 1.0, 1.0,
            1.0, 0.0, 1.0, 1.0,
            1.0, 0.0, 1.0, 1.0,

            // Back face
            1.0, 0.0, 1.0, 1.0,
            1.0, 1.0, 0.0, 1.0,
            1.0, 1.0, 0.0, 1.0,

            // Left face
            1.0, 1.0, 0.0, 1.0,
            1.0, 1.0, 0.0, 1.0,
            1.0, 1.0, 0.0, 1.0
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
        pyramidVertexColorBuffer.itemSize = 4;
        pyramidVertexColorBuffer.numItems = 12;
    }

    var rPyramid = 0;

    function drawScene() {

        gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight); // Ajustamos el Viewport desde (0,0) hasta (canvas.x,canvas.y)
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); //Limpiamos los buffers

        //perspective(FoVY,Aspect,Near Clip Pane, Far Clip Pane, Out Matrix)
        mat4.perspective(45, gl.viewportWidth/gl.viewportHeight, 0.1, 100.0, pMatrix);

        //definimos el centro de la escena con la model-view Matrix
        mat4.identity(mvMatrix);

        mat4.translate(mvMatrix, [0.0, 0.0, -7.0]);
        
        mvPushMatrix();
        mat4.rotate(mvMatrix, degToRad(rPyramid), [0, 1, 0]);
        mat4.scale(pyramidVertexPositionBuffer,pyramidVertexPositionBuffer , [4, 1, 0]);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, pyramidVertexPositionBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, pyramidVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, pyramidVertexColorBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, pyramidVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

        setMatrixUniforms();
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, pyramidVertexPositionBuffer.numItems);
        
        mvPopMatrix();
        
    }
    
    var lastTime = 0;

    function animate() {
        var timeNow = new Date().getTime();
        if (lastTime != 0) {
            var elapsed = timeNow - lastTime;

            rPyramid += (20 * elapsed) / 1000.0;
        }
        lastTime = timeNow;
    }


    function tick() {
        requestAnimFrame(tick);
        drawScene();
        animate();
    }

    function webGLStart() {
        //Crearemos un canvas al que llamaremos renderer sobre el cual trabajaremos
        var renderer = document.createElement( 'canvas' );

        //Seteamos el canvas según nuestras necesidades
        renderer.style.position = "absolute";
        renderer.style.top = 0; renderer.style.left= 0;
        renderer.width = 1000; renderer.height = 500; // Canvas = 1000 x 500 px
        
        //Adicionamos al DOM en el nodo "body" nuestro canvas AKA renderer
        document.body.appendChild( renderer );
        
        initGL(renderer); // Inicializamos nuestro contexto webgl con el canvas AKA renderer
        initShaders(); // Inicializamos los shaders
        initBuffers(); // Inicializamos los buffers

        //R,G,B,A
        gl.clearColor(0.0, 0.0, 0.0, 1.0);                      // Seleccionamos el color como negro a 100% de opacidad
        gl.enable(gl.DEPTH_TEST);                               // Activado el test de profundidad
        gl.depthFunc(gl.LEQUAL);                                // Diferenciamos los objetos cercanos de los lejanos con su opacidad
        gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);      // Limpiar el buffer de color y profundidad

        tick();
    }