// "sigint" en true permite interrumpir la entrada apretando Ctrl+C
const prompt = require('prompt-sync')({sigint: true});

// Clase para validar datos
class Validator {
    static isNumber(value) {
        const num = Number(value);
        return Number.isInteger(num);
    }
}

// Clase para las operaciones matemáticas
class Calculator {
    constructor() {
        this.result = 0;
        this.madeFirstOperation = false;
    }

    add(num1, num2 = null) {
        if (!this.madeFirstOperation && num2 !== null) {
            this.result = num1 + num2;
            this.madeFirstOperation = true;
        } else {
            this.result += num1;
        }
    }

    subtract(num1, num2 = null) {
        if (!this.madeFirstOperation && num2 !== null) {
            this.result = num1 - num2;
            this.madeFirstOperation = true;
        } else {
            this.result -= num1;
        }
    }

    multiply(num1, num2 = null) {
        if (!this.madeFirstOperation && num2 !== null) {
            this.result = num1 * num2;
            this.madeFirstOperation = true;
        } else {
            this.result *= num1;
        }
    }

    divide(num1, num2 = null) {
        if (!this.madeFirstOperation && num2 !== null) {
            if (num2 === 0) {
                throw new Error("No se puede dividir entre cero");
            }
            this.result = num1 / num2;
            this.madeFirstOperation = true;
        } else {
            if (num1 === 0) {
                throw new Error("No se puede dividir entre cero");
            }
            this.result /= num1;
        }
    }

    getResult() {
        return this.result;
    }

    hasOperations() {
        return this.madeFirstOperation;
    }

    reset() {
        this.result = 0;
        this.madeFirstOperation = false;
    }
}

// Clase para manejar la interfaz de usuario
class UI {
    constructor(calculator) {
        this.calculator = calculator;
        this.errorMessage = "";
    }

    showError(message) {
        if (message !== "") {
            console.log("--------------------------------------------------" + message + "--------------------------------------------------");
        }
    }

    clearScreen() {
        console.clear();
    }

    getNumberInput(message) {
        const input = prompt(message);
        if (!Validator.isNumber(input)) {
            throw new Error("Por favor, ingrese números válidos");
        }
        return Number(input);
    }

    showOperationMenu(operationName, operation) {
        this.clearScreen();
        console.log(`[${operationName} números]\n\n`);

        try {
            const num1 = this.getNumberInput(
                this.calculator.hasOperations() 
                    ? ">> Ingrese un número: " 
                    : ">> Ingrese el primer número: "
            );

            const num2 = this.calculator.hasOperations() 
                ? null 
                : this.getNumberInput(">> Ingrese el segundo número: ");

            operation(num1, num2);
            this.errorMessage = "";
        } catch (error) {
            this.errorMessage = `\nERROR: ¡${error.message}!\n`;
        }

        this.showMainMenu();
    }

    showMainMenu() {
        this.clearScreen();
        this.showError(this.errorMessage);

        console.log(`¿Qué desea realizar? (Número actual: ${this.calculator.getResult()})\n`);
        console.log("1. Sumar");
        console.log("2. Restar");
        console.log("3. Multiplicar");
        console.log("4. Dividir");
        console.log("5. Ver resultado final");
        console.log("6. Salir\n");

        const menu = prompt(">> Ingrese un número: ");

        if (!Validator.isNumber(menu)) {
            this.clearScreen();
            this.errorMessage = "\nERROR: ¡Por favor, ingrese un número válido entre 1 y 6!.\n";
            this.showError(this.errorMessage);
            this.showMainMenu();
            return;
        }

        this.handleMenuOption(Number(menu));
    }

    handleMenuOption(option) {
        switch(option) {
            case 1:
                this.showOperationMenu("Sumar", (n1, n2) => this.calculator.add(n1, n2));
                break;
            case 2:
                this.showOperationMenu("Restar", (n1, n2) => this.calculator.subtract(n1, n2));
                break;
            case 3:
                this.showOperationMenu("Multiplicar", (n1, n2) => this.calculator.multiply(n1, n2));
                break;
            case 4:
                this.showOperationMenu("Dividir", (n1, n2) => this.calculator.divide(n1, n2));
                break;
            case 5:
                this.showResult();
                break;
            case 6:
                this.exit();
                break;
            default:
                this.errorMessage = "\nERROR: ¡Opción inválida!\n";
                this.showMainMenu();
        }
    }

    showResult() {
        if (this.calculator.hasOperations()) {
            console.log(`\n- El resultado final es: ${this.calculator.getResult()}\n`);
        } else {
            console.log("\nERROR: No se ha realizado ninguna operación.\n");
        }
        prompt("Presione Enter para continuar...");
        this.showMainMenu();
    }

    exit() {
        console.log("\n- Saliendo del programa...\n");
        process.exit(0);
    }
}

// Clase principal de la aplicación
class CalculatorApp {
    constructor() {
        this.calculator = new Calculator();
        this.ui = new UI(this.calculator);
    }

    start() {
        this.ui.showMainMenu();
    }
}

// Iniciar la aplicación
const app = new CalculatorApp();
app.start();