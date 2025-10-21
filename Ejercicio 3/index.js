const prompt = require('prompt-sync')({sigint: true});
const dayjs = require("dayjs");

// ============================================
// 1. CONSTRUCTOR: Tarea
// ============================================
function Tarea(title, description, status, difficulty, expiration, creation, lastEdition) {
    this.title = title;
    this.description = description;
    this.status = status;
    this.difficulty = difficulty;
    this.expiration = expiration;
    this.creation = creation;
    this.lastEdition = lastEdition;
}

// Métodos del prototipo Tarea
Tarea.prototype.getDifficultyStars = function() {
    switch(Number(this.difficulty)) {
        case 1: return "★☆☆";
        case 2: return "★★☆";
        case 3: return "★★★";
        default: return "ERROR";
    }
};

Tarea.prototype.getStatusText = function() {
    switch(this.status.toUpperCase()) {
        case 'P': return "Pendiente";
        case 'E': return "En curso";
        case 'T': return "Terminada";
        case 'C': return "Cancelada";
        default: return "ERROR";
    }
};

Tarea.prototype.mostrarDetalles = function() {
    console.log("Esta es la tarea que elegiste:\n");
    console.log(`  ${this.title}\n`);
    console.log(`  ${this.description}\n`);
    console.log(`  Estado: ${this.getStatusText()}`);
    console.log(`  Dificultad: ${this.getDifficultyStars()}`);
    console.log(`  Vencimiento: ${this.expiration}`);
    console.log(`  Creación: ${this.creation}\n`);
};

Tarea.prototype.editar = function(description, status, difficulty, expiration) {
    if (description && description.trim()) this.description = description;
    if (status && status.trim()) this.status = status;
    if (difficulty && difficulty.trim()) this.difficulty = difficulty;
    if (expiration && expiration.trim()) this.expiration = expiration;
    this.lastEdition = dayjs().format("DD/MM/YYYY");
};

// ============================================
// 2. CONSTRUCTOR: GestorTareas
// ============================================
function GestorTareas() {
    this.tareas = [];
    this.errorMessage = "";
    this.errorMessages = {
        1: "\nERROR: ¡Por favor, ingrese un número válido entre 1 y 4!.\n",
        2: "\nERROR: No hay tareas disponibles para mostrar.\n",
        3: "\nERROR: La tarea que intentas ver no existe.\n",
        4: "\nERROR: No existe ninguna tarea con ese estado.\n",
        5: "\nERROR: No se encontró ninguna tarea que contenga ese título.\n",
        6: "\nERROR: El formato de fecha es incorrecto, sólo se acepta DD/MM/YYYY.\n"
    };
}

// Métodos del prototipo GestorTareas
GestorTareas.prototype.agregarTarea = function(tarea) {
    this.tareas.push(tarea);
    this.ordenarPorTitulo();
};

GestorTareas.prototype.ordenarPorTitulo = function() {
    this.tareas.sort((a, b) => a.title.localeCompare(b.title));
};

GestorTareas.prototype.filtrarPorEstado = function(estado) {
    if (estado === 'Todas') return this.tareas;
    return this.tareas.filter(t => t.status.toUpperCase() === estado);
};

GestorTareas.prototype.buscarPorTitulo = function(titulo) {
    return this.tareas.filter(t => 
        t.title.toLowerCase().includes(titulo.toLowerCase())
    );
};

GestorTareas.prototype.obtenerTarea = function(indice) {
    return this.tareas[indice - 1];
};

GestorTareas.prototype.tieneTareas = function() {
    return this.tareas.length > 0;
};

// ============================================
// 3. CONSTRUCTOR: Validador
// ============================================
function Validador() {}

Validador.prototype.esNumero = function(value) {
    const num = Number(value);
    return Number.isInteger(num);
};

Validador.prototype.esFechaValida = function(dateStr) {
    return dayjs(dateStr, "DD/MM/YYYY", true).isValid();
};

// ============================================
// 4. CONSTRUCTOR: InterfazUsuario
// ============================================
function InterfazUsuario(gestor, validador) {
    this.gestor = gestor;
    this.validador = validador;
}

InterfazUsuario.prototype.limpiarPantalla = function() {
    console.clear();
};

InterfazUsuario.prototype.mostrarError = function() {
    if (this.gestor.errorMessage !== "") {
        console.log("--------------------------------------------------" + 
                    this.gestor.errorMessage + 
                    "--------------------------------------------------");
    }
};

InterfazUsuario.prototype.mostrarMenuPrincipal = function() {
    this.limpiarPantalla();
    this.mostrarError();

    console.log("¡Hola Estudiante!\n");
    console.log("¿Qué deseas hacer?\n");
    console.log(" [1] Ver mis tareas.");
    console.log(" [2] Buscar una tarea.");
    console.log(" [3] Agregar una tarea.");
    console.log(" [4] Salir.\n");
    
    const menu = prompt("> ");

    if (!this.validador.esNumero(menu)) {
        this.gestor.errorMessage = this.gestor.errorMessages[1];
        this.mostrarMenuPrincipal();
        return;
    }
    const menuParsed = Number(menu);
    this.manejarOpcionPrincipal(menuParsed);
};

InterfazUsuario.prototype.manejarOpcionPrincipal = function(opcion) {
    this.gestor.errorMessage = "";
    
    switch(opcion) {
        case 1:
            this.mostrarMenuTareas();
            break;
        case 2:
            this.buscarTarea();
            break;
        case 3:
            this.crearNuevaTarea();
            break;
        case 4:
            console.log("\n¡Hasta luego!\n");
            process.exit(0);
            break;
        default:
            this.gestor.errorMessage = this.gestor.errorMessages[1];
            this.mostrarMenuPrincipal();
    }
};

InterfazUsuario.prototype.mostrarMenuTareas = function() {
    if (!this.gestor.tieneTareas()) {
        this.gestor.errorMessage = this.gestor.errorMessages[2];
        this.mostrarMenuPrincipal();
        return;
    }

    this.limpiarPantalla();
    console.log("¿Qué tarea deseas ver?\n");
    console.log("[1] Todas");
    console.log("[2] Pendientes");
    console.log("[3] En curso");
    console.log("[4] Terminadas");
    console.log("[5] Canceladas");
    console.log("[0] Volver\n");
    
    const menu = prompt("> ");

    if (!this.validador.esNumero(menu)) {
        this.gestor.errorMessage = this.gestor.errorMessages[1];
        this.mostrarMenuPrincipal();
        return;
    }

    const menuParsed = Number(menu);
    
    if (menuParsed === 0) {
        this.gestor.errorMessage = "";
        this.mostrarMenuPrincipal();
        return;
    }

    this.mostrarTareasFiltradas(menuParsed);
};

InterfazUsuario.prototype.mostrarTareasFiltradas = function(tipoFiltro) {
    let filtered = [];
    let nombreFiltro = "";

    switch(tipoFiltro) {
        case 1: 
            filtered = this.gestor.filtrarPorEstado('Todas');
            nombreFiltro = "";
            break;
        case 2: 
            filtered = this.gestor.filtrarPorEstado('P');
            nombreFiltro = "pendientes";
            break;
        case 3: 
            filtered = this.gestor.filtrarPorEstado('E');
            nombreFiltro = "en curso";
            break;
        case 4: 
            filtered = this.gestor.filtrarPorEstado('T');
            nombreFiltro = "terminadas";
            break;
        case 5: 
            filtered = this.gestor.filtrarPorEstado('C');
            nombreFiltro = "canceladas";
            break;
    }

    if (filtered.length === 0) {
        this.gestor.errorMessage = this.gestor.errorMessages[4];
        this.mostrarMenuPrincipal();
        return;
    }

    this.limpiarPantalla();
    console.log(`Estas son todas tus tareas ${nombreFiltro}:\n`);
    
    filtered.forEach((task, i) => {
        console.log(` [${i + 1}] ${task.title}`);
    });

    this.seleccionarTareaDetalles(filtered);
};

InterfazUsuario.prototype.seleccionarTareaDetalles = function(tareas) {
    console.log("\n¿Deseas ver los detalles de alguna?");
    console.log("Introduce el número para verla o 0 (cero) para volver.");
    const task = prompt("> ");

    if (!this.validador.esNumero(task)) {
        this.gestor.errorMessage = this.gestor.errorMessages[3];
        this.mostrarMenuPrincipal();
        return;
    }

    const taskParsed = Number(task);

    if (taskParsed === 0) {
        this.gestor.errorMessage = "";
        this.mostrarMenuPrincipal();
        return;
    }

    if (taskParsed < 1 || taskParsed > tareas.length) {
        this.gestor.errorMessage = this.gestor.errorMessages[3];
        this.mostrarMenuPrincipal();
        return;
    }

    this.limpiarPantalla();
    this.mostrarDetalleTarea(tareas[taskParsed - 1]);
};

InterfazUsuario.prototype.mostrarDetalleTarea = function(tarea) {
    tarea.mostrarDetalles();

    console.log("Si deseas editarla, presiona E, o presiona 0 (cero) para volver.");
    const menu = prompt("> ");

    if (menu.toUpperCase() === 'E') {
        this.editarTarea(tarea);
    } else if (menu === '0') {
        this.gestor.errorMessage = "";
        this.mostrarMenuPrincipal();
    } else {
        this.gestor.errorMessage = this.gestor.errorMessages[1];
        this.mostrarMenuPrincipal();
    }
};

InterfazUsuario.prototype.editarTarea = function(tarea) {
    this.limpiarPantalla();
    console.log(`Estás editando la tarea ${tarea.title}.\n`);
    console.log("- Si deseas mantener los valores de un atributo, simplemente déjalo en blanco.");
    console.log("- Si deseas dejar en blanco un atributo, escribe un espacio.\n\n");

    const description = prompt("1. Ingresa la descripción: ");
    const status = prompt("2. Estado ([P]endiente / [E]n curso / [T]erminada / [C]ancelada): ");
    const difficulty = prompt("3. Dificultad ([1] / [2] / [3]): ");
    const expiration = prompt("4. Vencimiento: ");

    if (expiration && expiration.trim() && !this.validador.esFechaValida(expiration)) {
        this.gestor.errorMessage = this.gestor.errorMessages[6];
        this.mostrarMenuPrincipal();
        return;
    }

    tarea.editar(description, status, difficulty, expiration);

    console.log("\n¡Datos guardados!\n");
    prompt("Presiona ENTER para continuar...");

    this.gestor.errorMessage = "";
    this.mostrarMenuPrincipal();
};

InterfazUsuario.prototype.buscarTarea = function() {
    if (!this.gestor.tieneTareas()) {
        this.gestor.errorMessage = this.gestor.errorMessages[2];
        this.mostrarMenuPrincipal();
        return;
    }

    this.limpiarPantalla();
    console.log("Introduce el título de una Tarea para buscarla:");
    const title = prompt("> ");
    
    const matches = this.gestor.buscarPorTitulo(title);

    if (matches.length === 0) {
        this.gestor.errorMessage = this.gestor.errorMessages[5];
        this.mostrarMenuPrincipal();
        return;
    }

    console.log("\nEstas son las tareas relacionadas:\n");
    matches.forEach((t, i) => {
        console.log(` [${i + 1}] ${t.title}`);
    });

    this.seleccionarTareaDetalles(matches);
};

InterfazUsuario.prototype.crearNuevaTarea = function() {
    this.limpiarPantalla();
    console.log("Estás creando una nueva tarea.\n");
    
    const title = prompt("1. Ingresa el título: ");
    const description = prompt("2. Ingresa la descripción: ");
    const status = prompt("3. Estado ([P]endiente / [E]n curso / [T]erminada / [C]ancelada): ");
    const difficulty = prompt("4. Dificultad ([1] / [2] / [3]): ");
    const expiration = prompt("5. Vencimiento: ");

    if (!this.validador.esFechaValida(expiration)) {
        this.gestor.errorMessage = this.gestor.errorMessages[6];
        this.mostrarMenuPrincipal();
        return;
    }

    const fechaActual = dayjs().format("DD/MM/YYYY");
    const nuevaTarea = new Tarea(title, description, status, difficulty, expiration, fechaActual, fechaActual);
    
    this.gestor.agregarTarea(nuevaTarea);

    console.log("\n¡Datos guardados!\n");
    prompt("Presiona ENTER para continuar...");

    this.mostrarMenuPrincipal();
};

// ============================================
// 5. INICIALIZACIÓN DE LA APLICACIÓN
// ============================================
const gestor = new GestorTareas();
const validador = new Validador();
const interfaz = new InterfazUsuario(gestor, validador);

interfaz.mostrarMenuPrincipal();