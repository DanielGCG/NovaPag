import { getStorage, ref, uploadBytes, getDownloadURL, listAll, deleteObject } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-storage.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";

// Configuração do Firebase
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
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

    const imageName = `${nomeFilme}.png`;
    const imagePath = `listaFilmes/${imageName}`;
    const imageRef = ref(storage, imagePath);

    try {
        const snapshot = await uploadBytes(imageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        exibirMensagem(`Arquivo enviado com sucesso!`, 'success');
        adicionarItemLista(downloadURL, nomeFilme);
        fileInput.value = '';
        nomeFilmeInput.value = '';

    } catch (error) {
        console.error('Erro ao enviar o arquivo:', error);
        exibirMensagem('Erro ao enviar o arquivo. Verifique a conexão e tente novamente.', 'error');
    }
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

function adicionarItemLista(url, nome) {
    const listaFilmes = document.getElementById('listaFilmes');
    const item = document.createElement('tr');
    
    item.innerHTML = `
        <td style="text-align: center;">
            <img src="${url}" alt="${nome}" style="max-height: 100px; width: auto;">
        </td>
        <td>${nome}</td>
        <td style="text-align: center;">
            <span class="remove-icon" onclick="removerFilme('${nome}', this)">🗑️</span>
        </td>
    `;
    listaFilmes.appendChild(item);
}

async function removerFilme(nomeFilme, elemento) {
    const imagePath = `listaFilmes/${nomeFilme}.png`;
    
    try {
        await deleteObject(ref(storage, imagePath));
        elemento.closest('tr').remove();
        exibirMensagem('Filme removido com sucesso!', 'success');
    } catch (error) {
        console.error('Erro ao remover o filme:', error);
        exibirMensagem('Erro ao remover o filme. Tente novamente.', 'error');
    }
}

async function listarFilmes() {
    const listaFilmesRef = ref(storage, 'listaFilmes/');
    const listaFilmes = document.getElementById('listaFilmes');

    try {
        const result = await listAll(listaFilmesRef);
        if (result.items.length === 0) {
            exibirMensagem('Nenhum filme encontrado. Adicione novos filmes para começar!', 'info');
            return;
        }

        await Promise.all(result.items.map(async (itemRef) => {
            const nomeFilme = itemRef.name.replace('.png', '');

            try {
                const imageURL = await getDownloadURL(itemRef);
                adicionarItemLista(imageURL, nomeFilme);
            } catch (error) {
                console.error(`Erro ao obter dados do filme ${nomeFilme}:`, error);
            }
        }));

    } catch (error) {
        console.error('Erro ao listar filmes:', error);
        exibirMensagem('Erro ao listar filmes. Tente novamente.', 'error');
    }
}

// Expondo as funções para serem usadas no HTML
window.uploadFile = uploadFile;
window.exibirMensagem = exibirMensagem;
window.adicionarItemLista = adicionarItemLista;
window.removerFilme = removerFilme;
window.listarFilmes = listarFilmes;

listarFilmes();
