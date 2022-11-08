var expression = ""
let OPERATORS = ['∼','∧','⊻','∨','→','↔']

document.addEventListener('keydown', (event) => {
	// console.log(`key=${event.key},code=${event.code}`);

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
				// console.log(`Tecla [key=${event.key},code=${event.code}] não configurada`)
		}
	}
});

function ord(char){
	return char.charCodeAt(0)
}

function chr(code){
	return String.fromCharCode(code)
}

function checa_se_repetido(str, array) {
	for (let v of array) {
		if (str === v) return true
	}
	return false
}

function estruturar_tabela_resposta(obj, qtde_linhas) {
	limpar_resultado() //Limpa os resultados anteriores

	let table = document.createElement("table") //Cria uma nova tabela que exibirá os resultados
	table.classList.add('table')
	table.id = "tabela_resultado"
	table.style = "margin-top: 2em;"

	let thead = table.createTHead() //Cria o cabeçalho da tabela	

	{ //Título da tabela
		let row = thead.insertRow() //Cria a linha do cabeçalho
		let th = document.createElement("th");
		th.innerHTML = "Tabela Verdade"
		th.colSpan = Object.keys(obj).length
		row.appendChild(th)
	}

	let row = thead.insertRow() //Cria a linha do cabeçalho

	for (let header in obj) { //Preenche o cabeçalho		
		let th = document.createElement("th");
		th.innerHTML = header
		row.appendChild(th)
	}

	table.appendChild(thead)

	let tbody = table.createTBody()

	for (let i=0; i<qtde_linhas; i++) {
		let row = tbody.insertRow()
		for (let header in obj) {
			let td = document.createElement("td");
			td.innerHTML = obj[header][i]
			row.appendChild(td)
		}
	}

	table.appendChild(tbody)

	document.querySelector("#resultado").appendChild(table)
}

function addBinary(a, b) {
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

function is_logical_operator(str) {
	for (let element of OPERATORS) {
		if (str == element) return true
	}
	return false
}

function is_variable(str) {
	if (ord(str)>64 && ord(str)<91) return true
	return false
}

function inserir(str) {
        if ( str === '∼' ) {
            if ( expression.slice(-1) === '∼' ) return
        } else {
	    if (is_logical_operator(str) && is_logical_operator(expression.slice(-1))) return
            if (is_logical_operator(str) && expression.slice(-1) === '') return
	}
        if (is_variable(str) && is_variable(expression.slice(-1))) return
	if (str === '(' && is_variable(expression.slice(-1))) return
	if (str === ')' && ( expression.replace(/[^\(]/g, '').length <= expression.replace(/[^\)]/g, '').length )) return
	if (str === ')' && expression.slice(-1) === "(") return

	
	expression = expression + str
	atualizar_expressao()
}

function limpar() {
	if (expression != "") {
		expression = ""
		atualizar_expressao()
	}
	else {
		limpar_resultado()
	}
}

function limpar_resultado(){
	document.querySelector("#resultado").innerHTML = ""
}

function backspace() {
	expression = expression.substring(0, expression.length - 1)
	atualizar_expressao()
}

function calcular() {
	estruturar_resposta()
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
	texto = `${texto}${(expression.replace(/[^\(]/g, '').length > expression.replace(/[^\)]/g, '').length) ? ')'.repeat(expression.replace(/[^\(]/g, '').length - expression.replace(/[^\)]/g, '').length) : ''}`
	texto = texto.replaceAll(/([A-Z]|\[Verdadeiro\]|\[Falso\]|0|1|\))([A-Z]|\[Verdadeiro\]|\[Falso\]|0|1|∼|\()/g, "$1∧$2")
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

function estruturar_resposta() {
	expression = corrigir_expressao(expression)
	let variaveis = ordenar_variaveis(expression)
	let qtde_linhas_tabela = (2**variaveis.length)
	let bin = "0".repeat(variaveis.length)
	let array_tabela_resultado = {}

	for (let i = 0; i<qtde_linhas_tabela; i++) {
		let valores = {}		
		for (let j = 0; j<variaveis.length; j++) {
			valores[variaveis[j]] = (bin[j] === '0') ? "1" : "0"

			if (typeof array_tabela_resultado[variaveis[j]] === "undefined") {
				array_tabela_resultado[variaveis[j]] = []
			}
			array_tabela_resultado[variaveis[j]].push((bin[j] === '0') ? "V" : "F")
		}

		resposta = calcular_expressao(expression, valores)
		for (let expressao of resposta[1].split('|')) {
			let exp = expressao.split(':')
			if (exp[0] != "" && !checa_se_repetido(exp[0], variaveis)) {
				if (typeof array_tabela_resultado[exp[0]] === "undefined") {
					array_tabela_resultado[exp[0]] = []
				}
				array_tabela_resultado[exp[0]].push((exp[1]=== '1') ? "V" : "F")
			}

		}
		// console.log(calcular_expressao(expression, valores)[1].split('|'))
		bin = addBinary(bin,"1")
	}

	estruturar_tabela_resposta(array_tabela_resultado, qtde_linhas_tabela)
}

function atualizar_expressao() {
	document.querySelector("#expressao").innerHTML = expression
}

function calcular_expressao(str, obj, string_result="") {
	result = str.replaceAll("[Verdadeiro]","1").replaceAll("[Falso]","0")	

	while (result.match(/\(([^\(\)]*)\)/g)) {
		result = result.replaceAll(/\(([^\(\)]*)\)/g, (match, p) => { //Teste do Parenteses
			response = calcular_expressao(p, obj, string_result)
			string_result = `${string_result}${response[1]}`
			return response[0]
		})
	}

	for (let variable in obj) { //Troca variaveis por seus valores
		result = result.replaceAll(variable, obj[variable])
	}

	while (result.match(/∼(0|1)/g)) {
		result = result.replaceAll(/∼(0|1)/g, (match, p) => { //Teste do 'NÃO p'
			return (p==='0') ? '1' : '0'
		})
	}
	
	while (result.match(/(0|1)∧(0|1)/g)) {
		result = result.replaceAll(/(0|1)∧(0|1)/g, (match, p, q) => { //Teste do 'p E q'
			return (p==='1' && q==='1') ? '1' : '0'
		})	
	}

	while (result.match(/(0|1)∨(0|1)/g)) {
		result = result.replaceAll(/(0|1)∨(0|1)/g, (match, p, q) => { //Teste do 'p OU q'
			return (p==='1' || q==='1') ? '1' : '0'
		})
	}

	while (result.match(/(0|1)→(0|1)/g)) {
		result = result.replaceAll(/(0|1)→(0|1)/g, (match, p, q) => { //Teste do 'SE p ENTÃO q'
			return (p==='1' && q==='0') ? '0' : '1'
		})
	}

	while (result.match(/(0|1)↔(0|1)/g)) {
		result = result.replaceAll(/(0|1)↔(0|1)/g, (match, p, q) => { //Teste do 'p SE SOMENTE SE q'
			return ((p==='1' && q==='1') || (p==='0' && q==='0')) ? '1' : '0'
		})
	}

	string_result = `${string_result}|${str}:${result}`	
	return [result, string_result]
}

limpar()
