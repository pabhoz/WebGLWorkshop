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

        shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
        shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
    }

    var mvMatrix = mat4.create(); // Creamos nuestra matriz modelo vista
    var pMatrix = mat4.create(); // Creamos nuestra matriz de proyección

    function setMatrixUniforms() { //Esta función guardará en la GPU las matrices de los elementos
        gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
        gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
    }

    //Creamos los Buffers para cada figura a utilizar
    var triangleVertexPositionBuffer;
    var squareVertexPositionBuffer;
    var squareVertexPositionBuffer2;

    function initBuffers() {
        
        // Le Triangulo!
        triangleVertexPositionBuffer = gl.createBuffer(); // Creamos un buffer!
        gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer); // (target,buffer)
        var vertices = [ //CCW
             0.0,  1.0,  0.0,
            -1.0, -1.0,  0.0,
             1.0, -1.0,  0.0
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW); // Ajusta el tamaño limite del buffer
        triangleVertexPositionBuffer.itemSize = 3; //Dimensiones
        triangleVertexPositionBuffer.numItems = 3; //Vertices
        // Fin de Le Triangulo
        
        //Square
        squareVertexPositionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
        vertices = [
             1.0,  1.0,  0.0, // ----* Sup Derecho
            -1.0,  1.0,  0.0, // *---- Sup Izquierdo
             1.0, -1.0,  0.0, // ----* Inf Derecho
            -1.0, -1.0,  0.0  // *---- Inf Izquierdo
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        squareVertexPositionBuffer.itemSize = 3;
        squareVertexPositionBuffer.numItems = 4;

        //Square 2
        squareVertexPositionBuffer2 = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer2);
        vertices = [
             0.0,  2.0,  0.0,
             -1.0, 1.0,  0.0,
             1.0,  1.0,  0.0,
            -1.0,  1.0,  0.0,
             1.0, -0.5,  0.0,
            -1.0, -0.5,  0.0
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        squareVertexPositionBuffer2.itemSize = 3;
        squareVertexPositionBuffer2.numItems = 6;
    }


    function drawScene() {

        gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight); // Ajustamos el Viewport desde (0,0) hasta (canvas.x,canvas.y)
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); //Limpiamos los buffers

        //perspective(FoVY,Aspect,Near Clip Pane, Far Clip Pane, Out Matrix)
        mat4.perspective(45, gl.viewportWidth/gl.viewportHeight, 0.1, 100.0, pMatrix);

        //definimos el centro de la escena con la model-view Matrix
        mat4.identity(mvMatrix);

        //Trasladamos el centro en -3.5x,0y,-7.0z
        mat4.translate(mvMatrix, [-3.5, 0.0, -7.0]);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
        //(http://msdn.microsoft.com/en-us/library/ie/dn302460(v=vs.85).aspx
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, triangleVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
        
        setMatrixUniforms(); // Copiamos de posiciones de cada vertice en nuestra GPU
        //Dibujamos triangulos desde el vertice 0 al n (Metodo de dibujo, V0, Vn)
        gl.drawArrays(gl.TRIANGLES, 0, triangleVertexPositionBuffer.numItems);

        //movemos nuestro centro de dibujo 3 unidades a la derecha, recordemos que antes estabamos -1.5 unidades a la izqueirda
        //lo cual nos deja en 1.5 unidades en el eje x con respecto al centro (0,0,0)
        mat4.translate(mvMatrix, [3.0, 0.0, 0.0]);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, squareVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
        
        setMatrixUniforms();
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, squareVertexPositionBuffer.numItems);

        mat4.translate(mvMatrix, [3.0, 0.0, -7.0]); //Modificamos la profundidad
        gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer2);
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, squareVertexPositionBuffer2.itemSize, gl.FLOAT, false, 0, 0);
        setMatrixUniforms();
        //TRIANGLE_STRIP permite dibujar las figuras en base a triangulos teniendo en cuenta el siguiente patron:
        //para una figura de 4 vertices A,B,C,D se requieren 2 triangulos para su dibujado, por ende dibujamos
        //el triangulo A,B,C,A y luego el triangulo B,C,D,B
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, squareVertexPositionBuffer2.numItems);
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

        drawScene();    // Dibujar escena
    }