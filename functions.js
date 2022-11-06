expression = ""

// let textBox = document.getElementById('message');
document.addEventListener('keydown', (event) => {
	console.log(`key=${event.key},code=${event.code}`);

	if (event.key.length === 1 && ord(event.key)>64 && ord(event.key)<91) {
		inserir(event.key)
	}
	else if (event.key.length === 1 && ord(event.key)>96 && ord(event.key)<123) {
		inserir(chr(ord(event.key)-32))
	}
	else {
		switch (event.key) {
			case 'Enter':
				calcular()
				break
			case 'Backspace':
				backspace()
				break
			case '(':
				inserir('(')
				break
			case ')':
				inserir(')')
				break
			case '1':
				inserir('[Verdadeiro]')
				break
			case '0':
				inserir('[Falso]')
				break
			default:
				console.log(`Tecla [key=${event.key},code=${event.code}] não configurada`)
		}
	}
});

function ord(char){
	return char.charCodeAt(0)
}

function chr(code){
	return String.fromCharCode(code)
}

// function addColumn () {
// 	header = "header"

// 	document.querySelectorAll('#tabela_resultado tr').forEach((row, i) => {
//         const cell = document.createElement(i ? "td" : "th")
// 		cell.innerHTML = (i ? i : header)

//         // cell.appendChild(input)
//         row.appendChild(cell)
//     })
// }

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
	expression = expression + str
	atualizar_expressao()
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
	estruturar_tabela_resposta()
	limpar()
}

function contem_duplicados(array) {
	if (array.length !== new Set(array).size) {
		return true;
	}
	return false;
}

function corrigir_expressao(texto) {
	// while (texto.match(/([A-Z]|\[Verdadeiro\]|\[Falso\]|0|1|\))(\(|[A-Z]|\[Verdadeiro\]|\[Falso\]|0|1)/)) {
	// 	texto = texto.replace(/([A-Z]|\[Verdadeiro\]|\[Falso\]|0|1)([A-Z]|\[Verdadeiro\]|\[Falso\]|0|1)/, "$1∧$2")
	// }
	texto = texto.replaceAll(/([A-Z]|\[Verdadeiro\]|\[Falso\]|0|1|\))([A-Z]|\[Verdadeiro\]|\[Falso\]|0|1|\()/g, "$1∧$2")
	return texto
}

function ordenar_variaveis(texto) {
	let array = []
	for (let item of new Set(texto.replaceAll("[Verdadeiro]","1").replaceAll("[Falso]","0"))) array.push(item);

	return (
		array.filter(x => {
			return ord(x)>64 && ord(x)<91		
		}).sort()
	)
}

function estruturar_tabela_resposta() {
	expression = corrigir_expressao(expression)
	let variaveis = ordenar_variaveis(expression)
	

	let qtde_linhas = (2**variaveis.length)

	document.querySelector("#resultado").innerHTML = ""

	let table = document.createElement("table")

	//Estruturação do cabeçalho da tabela
	let thead = table.createTHead()
	let row = thead.insertRow()
	for (let coluna of variaveis) {
		let th = document.createElement("th");
		th.innerHTML = coluna
		row.appendChild(th)
	}

	let th = document.createElement("th");
	th.innerHTML = expression
	row.appendChild(th)

	thead.appendChild(row)
	let bin = "0".repeat(variaveis.length)

	//Estruturação do corpo da tabela
	let tbody = table.createTBody()
	for (linha = 0; linha<qtde_linhas; linha++) {
		let row = table.insertRow()
		let valores = {} //Valores atribuídos as variáveis que serão testadas em cada linha da tabela
		for (let i = 0; i<variaveis.length; i++) {
			let td = document.createElement("td");
			td.innerHTML = (bin[i] === '0') ? "V" : "F"
			valores[variaveis[i]] = (bin[i] === '0') ? "1" : "0"

			row.appendChild(td)
		}

		let td = document.createElement("td");
		td.innerHTML = calcular_expressao(expression, valores) === '1' ? "Verdadeiro" : "Falso"
		row.appendChild(td)

		tbody.appendChild(row)
		bin = addBinary(bin,"1")
	}

	table.appendChild(thead)
	table.appendChild(tbody)
	table.classList.add('table')
	table.id = "tabela_resultado"
	document.querySelector("#resultado").appendChild(table)
}

function atualizar_expressao() {
	document.querySelector("#expressao").innerHTML = expression
}

function calcular_expressao(str, obj) {
	result = str.replaceAll("[Verdadeiro]","1").replaceAll("[Falso]","0")
	console.log(result)

	for (let variable in obj) {
		result = result.replace(variable, obj[variable])
	}

	// while (result.match(/\(([^\(\)]*)\)/)) { //Teste do Parenteses
	// 	result = result.replace(/\(([^\(\)]*)\)/, (match, p) => {
	// 		return calcular_expressao(p)
	// 	})
	// }

	// while (result.match(/∼(0|1)/)) { //Teste do 'NÃO p'
	// 	result = result.replace(/∼(0|1)/, (match, p) => {
	// 		return (p==='0') ? '1' : '0'
	// 	})
	// }
	
	// while (result.match(/(0|1)∧(0|1)/)) { //Teste do 'p E q'
	// 	result = result.replace(/(0|1)∧(0|1)/, (match, p, q) => {
	// 		return (p==='1' && q==='1') ? '1' : '0'
	// 	})
	// }

	// while (result.match(/(0|1)∨(0|1)/)) { //Teste do 'p OU q'
	// 	result = result.replace(/(0|1)∨(0|1)/, (match, p, q) => {
	// 		return (p==='1' || q==='1') ? '1' : '0'
	// 	})
	// }

	// while (result.match(/(0|1)→(0|1)/)) { //Teste do 'SE p ENTÃO q'
	// 	result = result.replace(/(0|1)→(0|1)/, (match, p, q) => {
	// 		return (p==='1' && q==='0') ? '0' : '1'
	// 	})
	// }

	// while (result.match(/(0|1)↔(0|1)/)) { //Teste do 'p SE SOMENTE SE q'
	// 	result = result.replace(/(0|1)↔(0|1)/, (match, p, q) => {
	// 		return ((p==='1' && q==='1') || (p==='0' && q==='0')) ? '1' : '0'
	// 	})
	// }

	result = result.replaceAll(/\(([^\(\)]*)\)/g, (match, p) => { //Teste do Parenteses
		return calcular_expressao(p)
	})

	result = result.replaceAll(/∼(0|1)/g, (match, p) => { //Teste do 'NÃO p'
		return (p==='0') ? '1' : '0'
	})
	
	result = result.replaceAll(/(0|1)∧(0|1)/g, (match, p, q) => { //Teste do 'p E q'
		return (p==='1' && q==='1') ? '1' : '0'
	})

	result = result.replaceAll(/(0|1)∨(0|1)/g, (match, p, q) => { //Teste do 'p OU q'
		return (p==='1' || q==='1') ? '1' : '0'
	})

	result = result.replaceAll(/(0|1)→(0|1)/g, (match, p, q) => { //Teste do 'SE p ENTÃO q'
		return (p==='1' && q==='0') ? '0' : '1'
	})

	result = result.replaceAll(/(0|1)↔(0|1)/g, (match, p, q) => { //Teste do 'p SE SOMENTE SE q'
		return ((p==='1' && q==='1') || (p==='0' && q==='0')) ? '1' : '0'
	})

	return result
}

limpar()