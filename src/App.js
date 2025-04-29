import { useState } from 'react'
import { FiSearch } from 'react-icons/fi'
import './App.css'
import api from './services/api'

function App() {
  const [input, setInput] = useState("")
  const [resultados, setResultados] = useState([])

  // Verifica se o input é um CEP válido
  const isCep = (valor) => /^[0-9]{8}$/.test(valor.replace("-", ""))

  // Função para remover acentos (mantém espaços)
  const normalizarTexto = (texto) => {
    return texto
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, '') // remove acentos
  }

  async function handleSearch() {
    if (input.trim() === '') {
      alert("Preencha algum CEP ou endereço!")
      return
    }

    try {
      if (isCep(input)) {
        // Busca por CEP
        const response = await api.get(`${input.replace("-", "")}/json`)
        if (response.data.erro) {
          alert("CEP não encontrado.")
          setResultados([])
          return
        }
        setResultados([response.data])
      } else {
        // Busca por endereço no formato: UF,Cidade,Rua
        const partes = input.trim().split(",")
        if (partes.length < 3) {
          alert("Formato inválido. Use: UF,Cidade,Rua (Ex: SP,Itapevi,Rua Joaquina Gomes Barbosa número 20)")
          return
        }

        const uf = partes[0].toUpperCase().trim()
        const cidade = normalizarTexto(partes[1].trim())
        const rua = normalizarTexto(partes.slice(2).join(" ").trim())

        const response = await api.get(`${uf}/${cidade}/${rua}/json`)
        if (!Array.isArray(response.data) || response.data.length === 0) {
          alert("Endereço não encontrado.")
          setResultados([])
          return
        }

        setResultados(response.data)
      }

      setInput("")
    } catch (err) {
      alert("Erro ao buscar dados. Verifique o formato ou tente novamente.")
      setInput("")
      setResultados([])
    }
  }

  return (
    <div className="container">
      <h1 className="title">Buscador de CEP</h1>

      <div className="containerInput">
        <input
          type="text"
          placeholder="UF,Cidade,Rua e número"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button className="buttonSearch" onClick={handleSearch}>
          <FiSearch size={25} color="#fff" />
        </button>
      </div>

      {resultados.length > 0 && (
        <main className='main'>
          {resultados.map((cep, index) => (
            <div key={index} className="resultado">
              <h2>CEP: {cep.cep}</h2>
              <span>{cep.logradouro}</span>
              <span>Complemento: {cep.complemento || "N/A"}</span>
              <span>{cep.bairro}</span>
              <span>{cep.localidade} - {cep.uf}</span>
              <hr />
            </div>
          ))}
        </main>
      )}
    </div>
  )
}

export default App
