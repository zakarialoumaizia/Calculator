
    //-------------------- Calculator state variables --------------//
    let currentExpression = ""; 
    let history = ""; 
    let isPowerOn = true; 

    //--------------- Convert degrees to radians --------------------//
    function toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }

    //--------------- Update calculator display --------------------//
    function updateDisplay() {
        const display = document.getElementById('display');
        const historyElement = document.querySelector('.history');
        const screen = document.querySelector('.screen');
        if (isPowerOn) {
            screen.classList.remove('off');
            if (display) display.textContent = currentExpression || "0";
            if (historyElement) historyElement.textContent = history;
        } else {
            screen.classList.add('off');
            if (display) display.textContent = "";
            if (historyElement) historyElement.textContent = "";
        }
    }

    //--------------- Append character to expression --------------//
    function appendChar(char) {
        if (!isPowerOn) return; 
        currentExpression += char;
        updateDisplay();
    }

    //--------------- Number input functions ----------------------//
    function test0() { appendChar('0'); }
    function test1() { appendChar('1'); }
    function test2() { appendChar('2'); }
    function test3() { appendChar('3'); }
    function test4() { appendChar('4'); }
    function test5() { appendChar('5'); }
    function test6() { appendChar('6'); }
    function test7() { appendChar('7'); }
    function test8() { appendChar('8'); }
    function test9() { appendChar('9'); }

    //--------------- Decimal point input -------------------------//
    function testpoint() {
        if (!isPowerOn) return;
       
        if (!currentExpression || /[+\-*/^√(]/.test(currentExpression.slice(-1))) {
            currentExpression += "0.";
        } else if (!/\.\d*$/.test(currentExpression.split(/[+*/^()-]/).pop())) {
            currentExpression += ".";
        }
        updateDisplay();
    }

    //--------------- Operator and function inputs ----------------//
    function plus() { appendChar('+'); }
    function moin() { appendChar('-'); }
    function mult() { appendChar('*'); }
    function div() { appendChar('/'); }
    function setOp(op) {
        if (!isPowerOn) return;
        currentExpression += op + "(";
        updateDisplay();
    }

    //--------------- Delete last character -----------------------//
    function deleteLastChar() {
        if (!isPowerOn) return;
        currentExpression = currentExpression.slice(0, -1);
        updateDisplay();
    }

    //--------------- Clear calculator ----------------------------//
    function clearInput() {
        if (!isPowerOn) return;
        currentExpression = "";
        history = "";
        updateDisplay();
    }

    //--------------- Power ON ------------------------------------//
    function powerOn() {
        isPowerOn = true;
        currentExpression = "";
        history = "";
        updateDisplay();
    }

    //--------------- Power OFF -----------------------------------//
    function powerOff() {
        isPowerOn = false;
        currentExpression = "";
        history = "";
        updateDisplay();
    }

    //--------------- Validate expression -------------------------//
    function isValidExpression(expr) {
       
        let parenCount = 0;
        for (let char of expr) {
            if (char === '(') parenCount++;
            if (char === ')') parenCount--;
            if (parenCount < 0) return false;
        }
        if (parenCount !== 0) return false;


        if (/[+\-*/^]{2,}/.test(expr)) return false;

      
        if (/(sin|cos|tan|atan|log|ln|√)\(\)/.test(expr)) return false;

        
        if (/\d*\.\d*\./.test(expr)) return false;

       
        if (/^[+\-*/^]/.test(expr) || /[+\-*/^]$/.test(expr)) return false;

        return true;
    }

    //--------------- Tokenize expression -------------------------//
    function tokenize(expression) {
        const tokens = [];
        let i = 0;
        while (i < expression.length) {
            const char = expression[i];
            if (/\s/.test(char)) {
                i++;
                continue;
            }
         
            if (/[0-9.]/.test(char)) {
                let num = "";
                let dotCount = 0;
                while (i < expression.length && /[0-9.]/.test(expression[i])) {
                    if (expression[i] === '.') dotCount++;
                    if (dotCount > 1) throw new Error("Invalid number format");
                    num += expression[i++];
                }
                tokens.push(num);
                continue;
            }
   
            if (/[+\-*/^()]/.test(char)) {
                tokens.push(char);
                i++;
                continue;
            }
       
            if (char === 's' && expression.slice(i, i + 3) === "sin") {
                tokens.push("sin");
                i += 3;
                continue;
            }
            if (char === 'c' && expression.slice(i, i + 3) === "cos") {
                tokens.push("cos");
                i += 3;
                continue;
            }
            if (char === 't' && expression.slice(i, i + 3) === "tan") {
                tokens.push("tan");
                i += 3;
                continue;
            }
            if (char === 'a' && expression.slice(i, i + 4) === "atan") {
                tokens.push("atan");
                i += 4;
                continue;
            }
            if (char === 'l' && expression.slice(i, i + 3) === "log") {
                tokens.push("log");
                i += 3;
                continue;
            }
            if (char === 'l' && expression.slice(i, i + 2) === "ln") {
                tokens.push("ln");
                i += 2;
                continue;
            }
            if (char === '√') {
                tokens.push("√");
                i++;
                continue;
            }

            throw new Error(`Invalid character: ${char}`);
        }
        return tokens;
    }

    //--------------- Shunting Yard Algorithm ---------------------//
    function toPostfix(tokens) {
        const precedence = {
            '+': 1,
            '-': 1,
            '*': 2,
            '/': 2,
            '^': 3,
            'sin': 4,
            'cos': 4,
            'tan': 4,
            'atan': 4,
            'log': 4,
            'ln': 4,
            '√': 4
        };
        const output = [];
        const operators = [];
        for (let token of tokens) {
          
            if (!isNaN(parseFloat(token))) {
                output.push(token);
            } 
     
            else if (["sin", "cos", "tan", "atan", "log", "ln", "√"].includes(token)) {
                operators.push(token);
            } 
       
            else if (token === '(') {
                operators.push(token);
            } 
        
            else if (token === ')') {
                while (operators.length && operators[operators.length - 1] !== '(') {
                    output.push(operators.pop());
                }
                if (operators[operators.length - 1] === '(') operators.pop();
                if (["sin", "cos", "tan", "atan", "log", "ln", "√"].includes(operators[operators.length - 1])) {
                    output.push(operators.pop());
                }
            } 
            else {
                while (
                    operators.length &&
                    operators[operators.length - 1] !== '(' &&
                    precedence[operators[operators.length - 1]] >= precedence[token]
                ) {
                    output.push(operators.pop());
                }
                operators.push(token);
            }
        }
     
        while (operators.length) {
            if (operators[operators.length - 1] !== '(') {
                output.push(operators.pop());
            } else {
                operators.pop();
            }
        }
        return output;
    }

    //--------------- Evaluate Postfix Expression -----------------//
    function evaluatePostfix(postfix) {
        const stack = [];
        for (let token of postfix) {
          
            if (!isNaN(parseFloat(token))) {
                stack.push(parseFloat(token));
            } 
         
            else if (["sin", "cos", "tan", "atan", "log", "ln", "√"].includes(token)) {
                if (!stack.length) throw new Error("Invalid expression: Missing operand");
                const operand = stack.pop();
                if (isNaN(operand)) throw new Error("Invalid operand for function");
                let result;
                switch (token) {
                    case 'sin':
                        result = Math.sin(toRadians(operand));
                        break;
                    case 'cos':
                        result = Math.cos(toRadians(operand));
                        break;
                    case 'tan':
                        result = Math.tan(toRadians(operand));
                        if (isNaN(result) || !isFinite(result)) throw new Error("Invalid tan value");
                        break;
                    case 'atan':
                        result = Math.atan(operand) * (180 / Math.PI);
                        break;
                    case 'log':
                        if (operand <= 0) throw new Error("Log of non-positive number");
                        result = Math.log10(operand);
                        break;
                    case 'ln':
                        if (operand <= 0) throw new Error("Ln of non-positive number");
                        result = Math.log(operand);
                        break;
                    case '√':
                        if (operand < 0) throw new Error("Square root of negative number");
                        result = Math.sqrt(operand);
                        break;
                }
                stack.push(result);
            } 
            else {
                if (stack.length < 2) throw new Error("Invalid expression: Missing operands");
                const b = stack.pop();
                const a = stack.pop();
                if (isNaN(a) || isNaN(b)) throw new Error("Invalid operands for operation");
                let result;
                switch (token) {
                    case '+': result = a + b; break;
                    case '-': result = a - b; break;
                    case '*': result = a * b; break;
                    case '/':
                        if (b === 0) throw new Error("Division by zero");
                        result = a / b;
                        break;
                    case '^':
                        result = Math.pow(a, b);
                        break;
                }
                stack.push(result);
            }
        }
        if (stack.length !== 1) throw new Error("Invalid expression: Incomplete evaluation");
        const result = stack[0];
        if (isNaN(result) || !isFinite(result)) throw new Error("Result is undefined");
        return result;
    }

    //--------------- Perform calculation -------------------------//
    function egale() {
        if (!isPowerOn || !currentExpression) return;
        try {
          
            if (!isValidExpression(currentExpression)) {
                throw new Error("Invalid expression");
            }
        
            history = currentExpression + " =";
            
            const tokens = tokenize(currentExpression);
           
            const postfix = toPostfix(tokens);
           
            let result = evaluatePostfix(postfix);
            
            if (typeof result === 'number' && !isNaN(result)) {

                result = Math.round(result * 10000000000) / 10000000000;
              
                currentExpression = result % 1 === 0 ? result.toString() : result.toString().replace(/\.?0+$/, '');
            } else {
                currentExpression = result.toString();
            }
            updateDisplay();
        } catch (e) {
            currentExpression = "Error: " + e.message;
            history = "";
            updateDisplay();
        }
    }
    //--------------- Base conversion input validation -----------------//
function isValidBaseChar(char, base) {
const validChars = {
    'bin': ['0', '1'],
    'oct': ['0', '1', '2', '3', '4', '5', '6', '7'],
    'dec': ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
    'hex': ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F']
};
return validChars[base].includes(char.toUpperCase());
}

//--------------- Append character for base conversion --------------//
function appendBaseChar(char) {
if (!isPowerOn) return;
const inputBase = document.getElementById('inputBase').value;
if (!isValidBaseChar(char, inputBase)) {
    currentExpression = "Error: Invalid char for " + inputBase.toUpperCase();
    updateDisplay();
    return;
}
currentExpression += char;
updateDisplay();
}

//--------------- Convert between number systems -------------------//
function convertBase() {
if (!isPowerOn || !currentExpression) return;
try {
    const inputBase = document.getElementById('inputBase').value;
    const outputBase = document.getElementById('outputBase').value;
    let decimalValue;

    // Convert input to decimal
    switch (inputBase) {
        case 'bin':
            if (!/^[01]+$/.test(currentExpression)) throw new Error("Invalid binary number");
            decimalValue = parseInt(currentExpression, 2);
            break;
        case 'oct':
            if (!/^[0-7]+$/.test(currentExpression)) throw new Error("Invalid octal number");
            decimalValue = parseInt(currentExpression, 8);
            break;
        case 'dec':
            if (!/^[0-9]+$/.test(currentExpression)) throw new Error("Invalid decimal number");
            decimalValue = parseInt(currentExpression, 10);
            break;
        case 'hex':
            if (!/^[0-9A-Fa-f]+$/.test(currentExpression)) throw new Error("Invalid hexadecimal number");
            decimalValue = parseInt(currentExpression, 16);
            break;
        default:
            throw new Error("Invalid input base");
    }

    // Convert decimal to output base
    let result;
    switch (outputBase) {
        case 'bin':
            result = decimalValue.toString(2);
            break;
        case 'oct':
            result = decimalValue.toString(8);
            break;
        case 'dec':
            result = decimalValue.toString(10);
            break;
        case 'hex':
            result = decimalValue.toString(16).toUpperCase();
            break;
        default:
            throw new Error("Invalid output base");
    }

    // Update history and display
    history = `${currentExpression} (${inputBase.toUpperCase()}) = ${result} (${outputBase.toUpperCase()})`;
    currentExpression = result;
    updateDisplay();
} catch (e) {
    currentExpression = "Error: " + e.message;
    history = "";
    updateDisplay();
}
}
//--------------- Logic operations input validation -----------------//
function isValidLogicChar(char) {
return ['0', '1'].includes(char);
}

//--------------- Append character for logic operations --------------//
function appendLogicChar(char) {
if (!isPowerOn) return;
if (!isValidLogicChar(char)) {
    currentExpression = "Error: Only 0 or 1 allowed";
    updateDisplay();
    return;
}
currentExpression += char;
updateDisplay();
}

//--------------- Set logic operation -------------------------------//
function setLogicOp(op) {
if (!isPowerOn) return;
// For NOT, it can be applied directly to the current expression
if (op === 'NOT') {
    if (currentExpression && /^[01]+$/.test(currentExpression)) {
        try {
            let result = '';
            for (let bit of currentExpression) {
                result += bit === '0' ? '1' : '0';
            }
            history = `NOT(${currentExpression}) =`;
            currentExpression = result;
            updateDisplay();
        } catch (e) {
            currentExpression = "Error: " + e.message;
            history = "";
            updateDisplay();
        }
    } else {
        currentExpression = "Error: Invalid binary input";
        updateDisplay();
    }
    return;
}
// For AND, OR, XOR, append the operator
if (currentExpression && /^[01]+$/.test(currentExpression)) {
    currentExpression += ` ${op} `;
    updateDisplay();
} else {
    currentExpression = "Error: Enter binary number first";
    updateDisplay();
}
}

//--------------- Evaluate logic operation --------------------------//
function evaluateLogic() {
if (!isPowerOn || !currentExpression) return;
try {
    // Split the expression into operands and operator
    const parts = currentExpression.split(' ');
    if (parts.length !== 3 || !['AND', 'OR', 'XOR'].includes(parts[1])) {
        if (!currentExpression.includes('NOT')) {
            throw new Error("Invalid logic expression");
        }
        return; // NOT is handled in setLogicOp
    }
    const [num1, op, num2] = parts;

    // Validate binary inputs
    if (!/^[01]+$/.test(num1) || !/^[01]+$/.test(num2)) {
        throw new Error("Invalid binary input");
    }

    // Ensure both numbers have the same length by padding with zeros
    const maxLength = Math.max(num1.length, num2.length);
    const paddedNum1 = num1.padStart(maxLength, '0');
    const paddedNum2 = num2.padStart(maxLength, '0');

    // Perform the logic operation
    let result = '';
    for (let i = 0; i < maxLength; i++) {
        const bit1 = paddedNum1[i];
        const bit2 = paddedNum2[i];
        switch (op) {
            case 'AND':
                result += (bit1 === '1' && bit2 === '1') ? '1' : '0';
                break;
            case 'OR':
                result += (bit1 === '1' || bit2 === '1') ? '1' : '0';
                break;
            case 'XOR':
                result += (bit1 !== bit2) ? '1' : '0';
                break;
            default:
                throw new Error("Invalid operator");
        }
    }

    // Remove leading zeros unless the result is '0'
    result = result.replace(/^0+/, '') || '0';

    // Update history and display
    history = `${num1} ${op} ${num2} =`;
    currentExpression = result;
    updateDisplay();
} catch (e) {
    currentExpression = "Error: " + e.message;
    history = "";
    updateDisplay();
}
}
//--------------- Graphing functionality -----------------------//

// Default graph settings
let graphRange = {
x: [-10, 10], // Default x-axis range
y: [-10, 10]  // Default y-axis range
};

// Plot the function entered in the graph input
function plotFunction() {
if (!isPowerOn) return;
const input = document.getElementById('graphInput').value.trim();
if (!input) {
    currentExpression = "Error: Enter a function";
    updateDisplay();
    return;
}

try {
    // Parse the function with math.js
    const node = math.parse(input);
    const code = node.compile();

    // Generate x values
    const xValues = [];
    const step = (graphRange.x[1] - graphRange.x[0]) / 1000; // 1000 points for smooth graph
    for (let x = graphRange.x[0]; x <= graphRange.x[1]; x += step) {
        xValues.push(x);
    }

    // Evaluate y values
    const yValues = xValues.map(x => {
        try {
            return code.evaluate({ x: x });
        } catch (e) {
            return NaN; // Handle undefined points (e.g., log(0))
        }
    });

    // Plotly.js configuration
    const trace = {
        x: xValues,
        y: yValues,
        type: 'scatter',
        mode: 'lines',
        name: input,
        line: { color: '#3498db' }
    };

    const layout = {
        xaxis: {
            title: 'x',
            range: graphRange.x,
            zeroline: true,
            showgrid: true
        },
        yaxis: {
            title: 'y',
            range: graphRange.y,
            zeroline: true,
            showgrid: true
        },
        margin: { t: 20, b: 40, l: 40, r: 20 },
        showlegend: true
    };

    // Render the plot
    Plotly.newPlot('graphCanvas', [trace], layout);

    // Update main screen and history
    currentExpression = `f(x) = ${input}`;
    history = `Plotted: ${input}`;
    updateDisplay();
} catch (e) {
    currentExpression = "Error: Invalid function";
    history = "";
    updateDisplay();
}
}

// Clear the graph and input
function clearGraph() {
if (!isPowerOn) return;
// Clear Plotly graph
Plotly.purge('graphCanvas');
// Clear input field
document.getElementById('graphInput').value = '';
// Update main screen
currentExpression = "0";
history = "Graph cleared";
updateDisplay();
}

// Zoom in or out
function zoomGraph(direction) {
if (!isPowerOn) return;
const factor = direction === 'in' ? 0.5 : 2; // Zoom in: halve range; Zoom out: double range
const xRange = graphRange.x[1] - graphRange.x[0];
const yRange = graphRange.y[1] - graphRange.y[0];
const newXRange = xRange * factor;
const newYRange = yRange * factor;
const xCenter = (graphRange.x[0] + graphRange.x[1]) / 2;
const yCenter = (graphRange.y[0] + graphRange.y[1]) / 2;

// Update graph range
graphRange.x = [xCenter - newXRange / 2, xCenter + newXRange / 2];
graphRange.y = [yCenter - newYRange / 2, yCenter + newYRange / 2];

// Update Plotly layout
Plotly.relayout('graphCanvas', {
    'xaxis.range': graphRange.x,
    'yaxis.range': graphRange.y
});

// Update history
history = `Zoom ${direction}`;
updateDisplay();
}

// Reset the graph to default range
function resetGraph() {
if (!isPowerOn) return;
graphRange = { x: [-10, 10], y: [-10, 10] }; // Reset to default
// Update Plotly layout
Plotly.relayout('graphCanvas', {
    'xaxis.range': graphRange.x,
    'yaxis.range': graphRange.y
});
// Update history
history = "Graph reset";
updateDisplay();
}
    //--------------- Tab switching functionality -----------------//
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            if (!isPowerOn) return; 
            document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
            this.classList.add('active');
            const tabId = this.getAttribute('data-tab');
            const tab = document.getElementById(tabId);
            if (tab) tab.classList.add('active');
        });
    });

    //--------------- Initialize calculator -----------------------//
    updateDisplay();
