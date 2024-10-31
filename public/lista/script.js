// Importar as funções Firebase do SDK
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-storage.js";
import { getFirestore, collection, addDoc, getDocs, enableIndexedDbPersistence } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";

// Configuração do Firebase
const firebaseConfig = {
    apiKey: "FB_apiKey",
    authDomain: "FB_authDomain",
    projectId: "FB_projectId",
    storageBucket: "FB_storageBucket",
    messagingSenderId: "FB_messagingSenderId",
    appId: "FB_appId"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// Ativa a persistência offline para Firestore
enableIndexedDbPersistence(db).catch((error) => {
    if (error.code === 'failed-precondition') {
        console.error('Persistência falhou: várias guias abertas');
    } else if (error.code === 'unimplemented') {
        console.error('Persistência não suportada no navegador');
    }
});

// Função para adicionar filme à tabela
function adicionarFilmeTabela(nome, imagemUrl) {
    const table = document.getElementById('filmesSeries').getElementsByTagName('tbody')[0];
    const newRow = table.insertRow();

    const cell1 = newRow.insertCell(0);
    const cell2 = newRow.insertCell(1);
    const cell3 = newRow.insertCell(2);

    const img = document.createElement('img');
    img.src = imagemUrl;
    img.style.maxHeight = '100px';
    cell1.appendChild(img);

    cell2.textContent = nome;
    cell3.textContent = '❌';
}

// Função para mostrar e esconder feedback visual de carregamento
function mostrarCarregando(mostrar) {
    const loader = document.getElementById('loader');
    if (loader) {
        loader.style.display = mostrar ? 'block' : 'none';
    }
}

// Manipula o upload do formulário com verificações de tipo de arquivo
document.getElementById('uploadForm').addEventListener('submit', async function(event) {
    event.preventDefault(); 

    const nome = document.getElementById('nome').value;
    const imagem = document.getElementById('imagem').files[0];
    const statusMessage = document.getElementById('statusMessage');

    // Verifica se o arquivo é do tipo suportado
    const tiposSuportados = ['image/jpeg', 'image/png', 'image/gif'];
    if (!imagem || !tiposSuportados.includes(imagem.type)) {
        alert('Por favor, selecione uma imagem válida (JPEG, PNG, GIF).');
        return;
    }

    if (imagem) {
        try {
            mostrarCarregando(true);

            // Cria referência de armazenamento na pasta "lista"
            const imgRef = storageRef(storage, `lista/${imagem.name}`);

            // Faz upload da imagem
            const snapshot = await uploadBytes(imgRef, imagem);
            const url = await getDownloadURL(snapshot.ref);

            // Adiciona filme/série à coleção "lista" no Firestore
            await addDoc(collection(db, "lista"), {
                nome: nome,
                imagemUrl: url
            });

            alert('Filme/Série adicionado com sucesso!');
            // Atualiza a tabela
            adicionarFilmeTabela(nome, url);
            statusMessage.textContent = ''; // Limpa a mensagem de status
        } catch (error) {
            console.error('Erro ao adicionar filme:', error);
            statusMessage.textContent = 'Erro ao adicionar filme. Tente novamente.'; // Mensagem de erro
        } finally {
            mostrarCarregando(false);
        }
    }
});

// Carrega filmes/séries salvos ao carregar a página
window.onload = async function() {
    mostrarCarregando(true);
    try {
        const querySnapshot = await getDocs(collection(db, "lista"));
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            adicionarFilmeTabela(data.nome, data.imagemUrl);
        });
    } catch (error) {
        console.error('Erro ao carregar filmes/séries:', error);
    } finally {
        mostrarCarregando(false);
    }
}
