import { getStorage, ref, uploadBytes, getDownloadURL, listAll, deleteObject } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-storage.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";

const firebaseConfig = {
    apiKey: "AIzaSyDuwnu2XcSTJ1YZkgD4570AtE6uKci_nDQ",
    authDomain: "boteco-6fcfa.firebaseapp.com",
    projectId: "boteco-6fcfa",
    storageBucket: "boteco-6fcfa.appspot.com",
    messagingSenderId: "531032694476",
    appId: "1:531032694476:web:6e03bdd824b90fd2b2ec69"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

async function uploadFile() {
    const fileInput = document.getElementById('fileInput');
    const nomeFilmeInput = document.getElementById('nomeFilme');
    const nomeFilme = nomeFilmeInput.value.trim();

    if (fileInput.files.length === 0) {
        exibirMensagem('Por favor, selecione um arquivo!', 'error');
        return;
    }

    const file = fileInput.files[0];
    if (!file.type.startsWith('image/')) {
        exibirMensagem('Por favor, selecione um arquivo de imagem válido!', 'error');
        return;
    }

    const newFileName = `${nomeFilme}.png`;
    const listaFilmesRef = ref(storage, `listaFilmes/${newFileName}`);

    try {
        const snapshot = await uploadBytes(listaFilmesRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        exibirMensagem(`Arquivo enviado com sucesso!`, 'success');

        // Armazenar o status no arquivo JSON
        const statusData = {
            nome: nomeFilme,
            status: 'negativo' // inicial
        };
        await salvarStatus(nomeFilme, statusData);

        adicionarItemLista(downloadURL, nomeFilme, 'negativo');
        fileInput.value = '';
        nomeFilmeInput.value = '';

    } catch (error) {
        exibirMensagem('Erro ao enviar o arquivo. Tente novamente.', 'error');
    }
}

async function salvarStatus(nomeFilme, statusData) {
    const statusFileName = `${nomeFilme}_status.json`;
    const statusRef = ref(storage, `listaFilmes/status/${statusFileName}`);
    const statusBlob = new Blob([JSON.stringify(statusData)], { type: 'application/json' });
    await uploadBytes(statusRef, statusBlob);
}

function exibirMensagem(mensagem, tipo) {
    const mensagemDiv = document.getElementById('mensagem');
    mensagemDiv.textContent = mensagem;
    mensagemDiv.className = tipo === 'success' ? 'success' : 'error';
    mensagemDiv.style.display = 'block';

    setTimeout(() => {
        mensagemDiv.style.display = 'none';
    }, 5000);
}

function adicionarItemLista(url, nome, status) {
    const listaFilmes = document.getElementById('listaFilmes');
    const item = document.createElement('tr');
    const iconeStatus = status === 'negativo' ? '❌' : '✅';
    
    item.innerHTML = `
        <td style="text-align: center;">
            <img src="${url}" alt="${nome}" style="max-height: 100px; width: auto;">
        </td>
        <td>${nome}</td>
        <td style="text-align: center;" class="status">
            <span class="status-icon" onclick="mudarStatus('${nome}', this)">${iconeStatus}</span>
        </td>
        <td style="text-align: center;">
            <span class="remove-icon" onclick="removerFilme('${nome}', this)">🗑️</span>
        </td>
    `;
    listaFilmes.appendChild(item);
}

async function mudarStatus(nomeFilme, elemento) {
    const novoStatus = elemento.textContent === '❌' ? 'positivo' : 'negativo';
    elemento.textContent = novoStatus === 'positivo' ? '✅' : '❌';

    // Atualizar o arquivo JSON de status
    await atualizarStatus(nomeFilme, novoStatus);

    exibirMensagem(`Status do arquivo atualizado para ${novoStatus} com sucesso!`, 'success');
}

async function atualizarStatus(nomeFilme, novoStatus) {
    const statusFileName = `${nomeFilme}_status.json`;
    const statusRef = ref(storage, `listaFilmes/status/${statusFileName}`);

    const statusData = {
        nome: nomeFilme,
        status: novoStatus
    };
    const statusBlob = new Blob([JSON.stringify(statusData)], { type: 'application/json' });
    await uploadBytes(statusRef, statusBlob);
}

async function removerFilme(nomeFilme, elemento) {
    const fileRef = ref(storage, `listaFilmes/${nomeFilme}.png`);
    try {
        await deleteObject(fileRef);
        elemento.closest('tr').remove();
        
        // Remover o arquivo JSON de status
        const statusFileName = `${nomeFilme}_status.json`;
        const statusRef = ref(storage, `listaFilmes/status/${statusFileName}`);
        await deleteObject(statusRef);

        exibirMensagem('Filme removido com sucesso!', 'success');
    } catch (error) {
        console.error('Erro ao remover o filme:', error);
        exibirMensagem('Erro ao remover o filme. Tente novamente.', 'error');
    }
}

async function listarFilmes() {
    const listaFilmesRef = ref(storage, 'listaFilmes/');
    const statusRef = ref(storage, 'listaFilmes/status/');
    
    try {
        const result = await listAll(listaFilmesRef);
        const statusResult = await listAll(statusRef);
        
        // Criar um mapeamento de status
        const statusMap = {};
        await Promise.all(statusResult.items.map(async (item) => {
            const url = await getDownloadURL(item);
            const statusData = await fetch(url).then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            });
            statusMap[statusData.nome] = statusData.status; // Mapeia o status pelo nome do filme
        }));

        // Adiciona cada filme à lista
        await Promise.all(result.items.map(async (item) => {
            const url = await getDownloadURL(item);
            const nomeArquivo = item.name.replace('.png', ''); // Remove a extensão
            const status = statusMap[nomeArquivo] || 'negativo'; // Usa o status mapeado ou 'negativo' como padrão
            
            adicionarItemLista(url, nomeArquivo, status);
        }));
    } catch (error) {
        console.error('Erro ao listar filmes:', error);
        exibirMensagem('Erro ao listar filmes. Tente novamente.', 'error');
    }
}


// Tornando as funções globais para o HTML
window.uploadFile = uploadFile;
window.exibirMensagem = exibirMensagem;
window.adicionarItemLista = adicionarItemLista;
window.mudarStatus = mudarStatus;
window.removerFilme = removerFilme;
window.listarFilmes = listarFilmes;

// Chamada inicial para listar filmes
listarFilmes();
