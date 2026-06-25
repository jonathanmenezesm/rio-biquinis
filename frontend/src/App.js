import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = 'http://localhost:5000/biquinis';

const biquiniInicial = {
	nome: '',
	cor: '',
	tamanhos: 'P, M, G',
	preco: '',
	descricao: '',
	estoque: '',
	foto_url: '',
	categoria: 'feminino',
};

function App() {
	const [biquinis, setBiquinis] = useState([]);
	const [formulario, setFormulario] = useState(biquiniInicial);
	const [biquiniEditando, setBiquiniEditando] = useState(null);
	const [detalheAberto, setDetalheAberto] = useState(null);
	const [filtro, setFiltro] = useState('');
	const [ordenacao, setOrdenacao] = useState('nome');
	const [mensagem, setMensagem] = useState('');

	useEffect(() => {
		buscarBiquinis();
	}, []);

	const buscarBiquinis = async () => {
		try {
			const resposta = await axios.get(API_URL);
			setBiquinis(resposta.data);
		} catch (erro) {
			setMensagem('Erro ao carregar biquínis.');
		}
	};

	const lidarComMudanca = (evento) => {
		const { name, value } = evento.target;
		setFormulario((anterior) => ({ ...anterior, [name]: value }));
	};

	const limparFormulario = () => {
		setFormulario(biquiniInicial);
		setBiquiniEditando(null);
	};

	const cadastrarBiquini = async (evento) => {
		evento.preventDefault();

		const payload = {
			nome: formulario.nome.trim(),
			cor: formulario.cor.trim(),
			tamanhos: formulario.tamanhos.split(',').map((tamanho) => tamanho.trim()).filter(Boolean),
			preco: Number(formulario.preco),
			descricao: formulario.descricao.trim(),
			estoque: Number(formulario.estoque),
			foto: formulario.foto_url.trim(),
			categoria: formulario.categoria,
		};

		try {
			if (biquiniEditando) {
				await axios.put(`${API_URL}/${biquiniEditando}`, payload);
				setMensagem('Biquíni atualizado com sucesso.');
			} else {
				await axios.post(API_URL, payload);
				setMensagem('Biquíni cadastrado com sucesso.');
			}

			limparFormulario();
			await buscarBiquinis();
		} catch (erro) {
			setMensagem('Não foi possível salvar o biquíni.');
		}
	};

	const editarBiquini = (biquini) => {
		setBiquiniEditando(biquini._id);
		setFormulario({
			nome: biquini.nome || '',
			cor: biquini.cor || '',
			tamanhos: Array.isArray(biquini.tamanhos) ? biquini.tamanhos.join(', ') : '',
			preco: biquini.preco ?? '',
			descricao: biquini.descricao || '',
			estoque: biquini.estoque ?? '',
			foto_url: biquini.foto || '',
			categoria: biquini.categoria || 'feminino',
		});
	};

	const deletarBiquini = async (biquiniId) => {
		try {
			await axios.delete(`${API_URL}/${biquiniId}`);
			setMensagem('Biquíni removido com sucesso.');
			await buscarBiquinis();
			if (detalheAberto === biquiniId) {
				setDetalheAberto(null);
			}
		} catch (erro) {
			setMensagem('Não foi possível remover o biquíni.');
		}
	};

	const biquiniSelecionado = biquinis.find((biquini) => biquini._id === detalheAberto) || null;

	const biquinisFiltrados = useMemo(() => {
		const termo = filtro.toLowerCase();
		const filtrados = biquinis.filter((biquini) => {
			const texto = `${biquini.nome || ''} ${biquini.cor || ''} ${biquini.descricao || ''}`.toLowerCase();
			return texto.includes(termo);
		});

		return [...filtrados].sort((a, b) => {
			if (ordenacao === 'preco') {
				return Number(a.preco || 0) - Number(b.preco || 0);
			}

			if (ordenacao === 'estoque') {
				return Number(b.estoque || 0) - Number(a.estoque || 0);
			}

			return String(a.nome || '').localeCompare(String(b.nome || ''));
		});
	}, [biquinis, filtro, ordenacao]);

	return (
		<div className="app">
			

			<header className="hero">
				<h1>Catálogo de Biquínis da Loja</h1>
				<p>Cadastro, atualização, exclusão, detalhes e filtro dinâmico para a coleção da loja.</p>
			</header>

			{mensagem ? <p className="mensagem">{mensagem}</p> : null}

			<div className="layout">
				<section className="card">
					<h2>Lista de Biquínis</h2>

					<div className="linha-filtros">
						<input
							type="text"
							value={filtro}
							onChange={(evento) => setFiltro(evento.target.value)}
							placeholder="Filtrar por nome, cor ou descrição"
						/>

						<select value={ordenacao} onChange={(evento) => setOrdenacao(evento.target.value)}>
							<option value="nome">Ordenar por nome</option>
							<option value="preco">Ordenar por preço</option>
							<option value="estoque">Ordenar por estoque</option>
						</select>
					</div>

					<div className="lista">
						{biquinisFiltrados.length === 0 ? (
							<p>Nenhum biquíni encontrado.</p>
						) : (
							biquinisFiltrados.map((biquini) => (
								<article className="item" key={biquini._id}>
									<div className="item-topo">
										<div>
											<h3>{biquini.nome}</h3>
											<p>{biquini.descricao}</p>
											<span className="tag">{biquini.cor}</span>
											<span className="tag">R$ {Number(biquini.preco || 0).toFixed(2)}</span>
											<span className="tag">Estoque: {biquini.estoque ?? 0}</span>
										</div>
									</div>

									<div className="acoes">
										<button className="secundario" type="button" onClick={() => setDetalheAberto(biquini._id)}>
											Ver detalhes
										</button>
										<button className="secundario" type="button" onClick={() => editarBiquini(biquini)}>
											Editar
										</button>
										<button className="perigo" type="button" onClick={() => deletarBiquini(biquini._id)}>
											Excluir
										</button>
									</div>
								</article>
							))
						)}
					</div>
				</section>

				<section className="card">
					<h2>{biquiniEditando ? 'Atualizar Biquíni' : 'Cadastrar Biquíni'}</h2>

					<form onSubmit={cadastrarBiquini} className="linha-formulario">
						<input name="nome" value={formulario.nome} onChange={lidarComMudanca} placeholder="Nome da peça" required />
						<input name="cor" value={formulario.cor} onChange={lidarComMudanca} placeholder="Cor" required />
						<input name="tamanhos" value={formulario.tamanhos} onChange={lidarComMudanca} placeholder="Tamanhos (P, M, G)" required />
						<input name="preco" value={formulario.preco} onChange={lidarComMudanca} type="number" step="0.01" placeholder="Preço" required />
						<input name="estoque" value={formulario.estoque} onChange={lidarComMudanca} type="number" placeholder="Estoque" required />
						<input name="foto_url" value={formulario.foto_url} onChange={lidarComMudanca} placeholder="URL da foto" />
						<select name="categoria" value={formulario.categoria} onChange={lidarComMudanca}>
							<option value="feminino">Feminino</option>
							<option value="infantil">Infantil</option>
							<option value="plus size">Plus size</option>
						</select>
						<textarea name="descricao" value={formulario.descricao} onChange={lidarComMudanca} placeholder="Descrição" required />

						<div className="linha-botoes" style={{ gridColumn: '1 / -1' }}>
							<button type="submit">{biquiniEditando ? 'Salvar alterações' : 'Cadastrar biquíni'}</button>
							{biquiniEditando ? (
								<button type="button" className="secundario" onClick={limparFormulario}>
									Cancelar edição
								</button>
							) : null}
						</div>
					</form>

					<div style={{ marginTop: '20px' }}>
						<h2>Detalhes</h2>
						{biquiniSelecionado ? (
							<div className="item">
								<h3>{biquiniSelecionado.nome}</h3>
								<p><strong>Cor:</strong> {biquiniSelecionado.cor}</p>
								<p><strong>Tamanhos:</strong> {(biquiniSelecionado.tamanhos || []).join(', ')}</p>
								<p><strong>Preço:</strong> R$ {Number(biquiniSelecionado.preco || 0).toFixed(2)}</p>
								<p><strong>Estoque:</strong> {biquiniSelecionado.estoque ?? 0}</p>
								<p><strong>Categoria:</strong> {biquiniSelecionado.categoria || '-'}</p>
								<p><strong>Descrição:</strong> {biquiniSelecionado.descricao || '-'}</p>
							</div>
						) : (
							<p>Selecione um biquíni para ver os detalhes completos.</p>
						)}
					</div>
				</section>
			</div>
		</div>
	);
}

export default App;