// const AND_TEMPLATE = /(?:true|false)\sv\s(?:true|false)/
function ord(char){
	return char.charCodeAt(0)
}

var addBinary = function(a, b) {
    var i = a.length - 1;
    var j = b.length - 1;
    var carry = 0;
    var result = "";
    while(i >= 0 || j >= 0) {
        var m = i < 0 ? 0 : a[i] | 0;
        var n = j < 0 ? 0 : b[j] | 0;
        carry += m + n; // sum of two digits
        result = carry % 2 + result; // string concat
        carry = carry / 2 | 0; // remove decimals,  1 / 2 = 0.5, only get 0
        i--;
        j--;
    }
    if(carry !== 0) {
        result = carry + result;
    }
    return result;
};

function inserir(str) {
	// if (str === "1") value = "1"
	// if (str === "0") value = "0"
	// if (str === "∨") value = "∨"
	// if (str === "∧") value = "∧"
	// if (str === "→") value = "→"
	// if (str === "↔") value = "↔"
	// if (str === "∼") value = "∼"
	expression = expression + str
	atualizar_expressao()
	// console.log(expression)
}

function limpar() {
	expression = ""
	atualizar_expressao()
}

function backspace() {
	expression = expression.substring(0, expression.length - 1)
	atualizar_expressao()
}

function calcular() {
	// console.log("R: " + calcular_expressao(expression))
	document.querySelector("#resultado").innerHTML = `${expression} = ${calcular_expressao(expression)}`

	// contar_variaveis()
	limpar()
}

function contem_duplicados(array) {
	if (array.length !== new Set(array).size) {
		return true;
	}
	return false;
}

function contar_variaveis() {
	// teste = 
	// aux = Object.keys(teste).map((key) => [obj[key]]);
	teste = []

	for (let item of new Set(expression)) teste.push(item);

	teste = teste.filter(x => {
		return ord(x)>64 && ord(x)<91		
	}).sort()

	console.log(teste)
	let qtde_linhas = (2**teste.length)

	document.querySelector("#resultado").innerHTML = ""

	let table = document.createElement("table")
	let thead = table.createTHead();
	let row = thead.insertRow();
	for (let colunas of teste) {
		let th = document.createElement("th");
		th.innerHTML = colunas
		row.appendChild(th);
	}
	thead.appendChild(row);
	let bin = "0".repeat(teste.length)
	let tbody = table.createTBody();
	for (linha = 0; linha<qtde_linhas; linha++) {
		let row = table.insertRow();	
		for (let coluna in bin) {
			let td = document.createElement("td");

			td.innerHTML = (bin[coluna] === '0') ? "V" : "F"

			row.appendChild(td);
		}
		tbody.appendChild(row);
		bin = addBinary(bin,"1")
	}

	table.appendChild(thead);
	table.appendChild(tbody);
	document.querySelector("#resultado").appendChild(table);

		// console.log(teste)
	// console.log(teste.filter(n => n))

	// teste = new Set(expression.filter( (x) => { x==='A' }))
	// // for (var i = 0; i < expression.length; i++) {
	// // 	console.log()
	// // 	console.log(expression[i]);
	// // }

	// console.log(teste.size)
	// console.log(teste)
}

function atualizar_expressao() {
	document.querySelector("#expressao").innerHTML = expression
}

function calcular_expressao(result) {
	while (result.match(/\(([^\(\)]*)\)/)) { //Teste do Parenteses
		result = result.replace(/\(([^\(\)]*)\)/, (match, p) => {
			return calcular_expressao(p)
		})
	}

	while (result.match(/∼(0|1)/)) { //Teste do 'NÃO p'
		result = result.replace(/∼(0|1)/, (match, p) => {
			return (p==='0') ? '1' : '0'
		})
	}
	
	while (result.match(/(0|1)∧(0|1)/)) { //Teste do 'p E q'
		result = result.replace(/(0|1)∧(0|1)/, (match, p, q) => {
			return (p==='1' && q==='1') ? '1' : '0'
		})
	}

	while (result.match(/(0|1)∨(0|1)/)) { //Teste do 'p OU q'
		result = result.replace(/(0|1)∨(0|1)/, (match, p, q) => {
			return (p==='1' || q==='1') ? '1' : '0'
		})
	}

	while (result.match(/(0|1)→(0|1)/)) { //Teste do 'SE p ENTÃO q'
		result = result.replace(/(0|1)→(0|1)/, (match, p, q) => {
			return (p==='1' && q==='0') ? '0' : '1'
		})
	}

	while (result.match(/(0|1)↔(0|1)/)) { //Teste do 'p SE SOMENTE SE q'
		result = result.replace(/(0|1)↔(0|1)/, (match, p, q) => {
			return ((p==='1' && q==='1') || (p==='0' && q==='0')) ? '1' : '0'
		})
	}

	return result
}

limpar()