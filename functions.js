const OPERATORS = ['∼','∧','⊻','∨','→','↔']
var expression = ""

// =================================================================================================

document.addEventListener('keydown', (event) => { // Escuta as teclas digitadas na página
	if (event.key.length === 1 && ord(event.key)>64 && ord(event.key)<91) { // Checa se está entre 'A' e 'Z'
		insert(event.key)
	}
	else if (event.key.length === 1 && ord(event.key)>96 && ord(event.key)<123) { // Checa se está entre 'a' e 'z'
		insert(chr(ord(event.key)-32))
	}
	else {
		switch (event.key) {
			case 'Enter':
				calculate()
				break
			case 'Backspace':
				backspace()
				break
			case '(':
				insert('(')
				break
			case ')':
				insert(')')
				break
			case 'ArrowRight':
				insert('→')
				break
			case 'ArrowLeft':
				insert('↔')
				break
			case 'ArrowUp':
				insert('∧')
				break
			case 'ArrowDown':
				insert('∨')
				break
			case '1':
				insert('[Verdadeiro]')
				break
			case '0':
				insert('[Falso]')
				break
			default:
				console.log(`Tecla [key=${event.key},code=${event.code}] não configurada`)
		}
	}
})

// ===== Funções Básicas ===========================================================================

function insert(str) { // Insere o valor digitado na expressão
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
	update_expression()
}

function update_expression() { // Atualiza a expressão
	document.querySelector("#expressao").innerHTML = expression
}

function clear_screen() { // Limpa a expressão	
	if (expression != "") {
		clear_expression()
	}
	else {
		clear_result_table()
	}
}

function clear_expression() {
	expression = ""
	update_expression()
}

function clear_result_table(){ // Limpa a tabela-verdade
	document.querySelector("#resultado").innerHTML = ""
}

function backspace() { // Apaga o último valor digitado
	expression = expression.substring(0, expression.length - 1)
	update_expression()
}

function calculate() { // Calcula o resultado
	if (expression != "") {
		structure_answer()
		clear_expression()
	}
}

// ===== Conversores ===============================================================================

function ord(char){ // Retorna o valor da tabela ASCII
	return char.charCodeAt(0)
}

function chr(code){ // Retorna a posição da tabela ASCII
	return String.fromCharCode(code)
}

// ===== Checagens =================================================================================

function is_repeated_var(str, array) { // Checa se a variável já existe no array
	for (let v of array) {
		if (str === v) return true
	}
	return false
}

function is_logical_operator(str) { // Checa se é um operador lógico
	for (let element of OPERATORS) {
		if (str == element) return true
	}
	return false
}

function is_variable(str) { // Checa se é uma variável
	if (ord(str)>64 && ord(str)<91) return true
	return false
}

// ===== Cálculos ==================================================================================

function correct_expression(texto) { // Corrige a expressão
	texto = `${texto}${(expression.replace(/[^\(]/g, '').length > expression.replace(/[^\)]/g, '').length) ? ')'.repeat(expression.replace(/[^\(]/g, '').length - expression.replace(/[^\)]/g, '').length) : ''}`
	
	while (texto.match(/([A-Z]|\[Verdadeiro\]|\[Falso\]|0|1|\))([A-Z]|\[Verdadeiro\]|\[Falso\]|0|1|∼|\()/)) {
		texto = texto.replaceAll(/([A-Z]|\[Verdadeiro\]|\[Falso\]|0|1|\))([A-Z]|\[Verdadeiro\]|\[Falso\]|0|1|∼|\()/g, "$1∧$2")
	}

	return texto
}

function sort_variables(texto) { // Organiza as variáveis
	let array = []
	for (let item of new Set(texto.replaceAll("[Verdadeiro]","1").replaceAll("[Falso]","0"))) array.push(item)

	return (
		array.filter(x => {
			return ord(x)>64 && ord(x)<91		
		}).sort()
	)
}

function structure_answer() { // Estrutura a resposta
	expression = correct_expression(expression)
	let variaveis = sort_variables(expression)
	let qtde_linhas_tabela = (2**variaveis.length)
	let bin = "0".repeat(variaveis.length) // Cria uma string de com o valor 0 em binário
	let array_tabela_resultado = {}

	for (let i = 0; i<qtde_linhas_tabela; i++) {
		let valores = {}		
		for (let j = 0; j<variaveis.length; j++) {
			valores[variaveis[j]] = (bin[j] === '0') ? "1" : "0"

			if (typeof array_tabela_resultado[variaveis[j]] === "undefined") {
				array_tabela_resultado[variaveis[j]] = []
			}
			array_tabela_resultado[variaveis[j]].push((bin[j] === '0') ? "V" : "F") // Converte os valores da string do número binário, 0→V e 1→F para inverter os valores iniciais da tabela.
		}

		resposta = calculate_expression(expression, valores)
		for (let expressao of resposta[1].split('|')) {
			let exp = expressao.split(':')
			if (exp[0] != "" && !is_repeated_var(exp[0], variaveis)) {
				if (typeof array_tabela_resultado[exp[0]] === "undefined") {
					array_tabela_resultado[exp[0]] = []
				}
				array_tabela_resultado[exp[0]].push((exp[1]=== '1') ? "V" : "F")
			}

		}
		bin = add_binary(bin,"1") // Adiciona 1 ao valor binário
	}

	build_answer_truth_table(array_tabela_resultado, qtde_linhas_tabela)
}

function calculate_inner_expression(exp) {
	while (exp.match(/∼(0|1)/g)) {	
		exp = exp.replaceAll(/∼(0|1)/g, (match, p) => { //Teste do 'NÃO p'
			return (p==='0') ? '1' : '0'
		})
	}
	
	while (exp.match(/(0|1)∧(0|1)/g)) {
		exp = exp.replaceAll(/(0|1)∧(0|1)/g, (match, p, q) => { //Teste do 'p E q'
			return (p==='1' && q==='1') ? '1' : '0'
		})	
	}

	while (exp.match(/(0|1)∨(0|1)/g)) {
		exp = exp.replaceAll(/(0|1)∨(0|1)/g, (match, p, q) => { //Teste do 'p OU q'
			return (p==='1' || q==='1') ? '1' : '0'
		})
	}

	while (exp.match(/(0|1)→(0|1)/g)) {
		exp = exp.replaceAll(/(0|1)→(0|1)/g, (match, p, q) => { //Teste do 'SE p ENTÃO q'
			return (p==='1' && q==='0') ? '0' : '1'
		})
	}

	while (exp.match(/(0|1)↔(0|1)/g)) {
		exp = exp.replaceAll(/(0|1)↔(0|1)/g, (match, p, q) => { //Teste do 'p SE SOMENTE SE q'
			return ((p==='1' && q==='1') || (p==='0' && q==='0')) ? '1' : '0'
		})
	}

	return exp
}

function calculate_expression(exp, obj, string_result="") { // Calcula a expressão	
	let cont = 0
	let exp_dicio = {}
	let result = `(${exp})`

	while (result.match(/\(([^\(\)]*)\)/g)) { // arquiva os valores dentro de parenteses em um dicionario
		cont++
		result = result.replace(/\(([^\(\)]*)\)/, (match, p) => { //Teste do Parenteses
			exp_dicio[`[P${cont}]`] = {}
			exp_dicio[`[P${cont}]`]['exp'] = p
			return `[P${cont}]`
		})
	}

	for (let inner_exp in exp_dicio) {
		let raw_inner_exp = exp_dicio[inner_exp]['exp']
		let modified_inner_exp = exp_dicio[inner_exp]['exp']

		while (raw_inner_exp.match(/(\[P\d+\])/)) {
			raw_inner_exp = raw_inner_exp.replaceAll(/(\[P\d+\])/g, (match, p) => {
				return `(${exp_dicio[p]['exp']})`
			})
		}	

		while (modified_inner_exp.match(/(\[P\d+\])/)) {
			modified_inner_exp = modified_inner_exp.replaceAll(/(\[P\d+\])/g, (match, p) => {
				return exp_dicio[p]['value']
			})
		}

		modified_inner_exp = modified_inner_exp.replaceAll("[Verdadeiro]","1").replaceAll("[Falso]","0")
		
		for (let variable in obj) { //Troca variaveis por seus valores
			modified_inner_exp = modified_inner_exp.replaceAll(variable, obj[variable])
		}
		
		exp_dicio[inner_exp]['value'] = calculate_inner_expression(modified_inner_exp)
		string_result = `${string_result}|${raw_inner_exp}:${exp_dicio[inner_exp]['value']}`
	}

	// console.log(exp_dicio)
	// console.log(string_result)
	return [result, string_result]
}

function build_answer_truth_table(obj, qtde_linhas) { // Constrói a tabela-verdade
	clear_result_table() //Limpa os resultados anteriores

	let table = document.createElement("table") // Cria uma nova tabela que exibirá os resultados
	table.classList.add('table')
	table.id = "tabela_resultado"
	table.style = "margin-top: 2em;"

	let thead = table.createTHead() // Cria o cabeçalho da tabela	

	{ //Título da tabela
		let row = thead.insertRow() // Cria a linha do cabeçalho do título
		let th = document.createElement("th")
		th.innerHTML = "Tabela-Verdade"
		th.colSpan = Object.keys(obj).length
		row.appendChild(th)
	}

	let row = thead.insertRow() // Cria a linha do cabeçalho com as variáveis

	for (let header in obj) { // Preenche o cabeçalho		
		let th = document.createElement("th")
		th.innerHTML = header
		row.appendChild(th)
	}

	table.appendChild(thead)

	let tbody = table.createTBody() // Cria o corpo da tabela-verdade

	for (let i=0; i<qtde_linhas; i++) {
		let row = tbody.insertRow()
		for (let header in obj) {
			let td = document.createElement("td")
			td.innerHTML = obj[header][i]
			row.appendChild(td)
		}
	}

	table.appendChild(tbody)

	document.querySelector("#resultado").appendChild(table)
}

function add_binary(a, b) {
	var i = a.length - 1
	var j = b.length - 1
	var carry = 0
	var result = ""
	while(i >= 0 || j >= 0) {
		var m = i < 0 ? 0 : a[i] | 0
		var n = j < 0 ? 0 : b[j] | 0
		carry += m + n // soma de dois dígitos
		result = carry % 2 + result // concatena a string
		carry = carry / 2 | 0 // remove os decimais,  1 / 2 = 0.5, pega apenas o 0
		i--
		j--
	}
	if(carry !== 0) {
		result = carry + result
	}
	return result
}

// clear_screen()