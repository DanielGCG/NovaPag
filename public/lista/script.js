// Importando os módulos do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Configuração do Firebase
const firebaseConfig = {
    apiKey: "SUA_API_KEY",
    authDomain: "SEU_AUTH_DOMAIN",
    projectId: "SEU_PROJECT_ID",
    storageBucket: "SEU_STORAGE_BUCKET",
    messagingSenderId: "SEU_MESSAGING_SENDER_ID",
    appId: "SEU_APP_ID"
};

// Inicializando Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// Função para adicionar o filme/série à tabela
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

// Formulário de upload
document.getElementById('uploadForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Impede o envio do formulário

    const nome = document.getElementById('nome').value;
    const imagem = document.getElementById('imagem').files[0];
    
    if (imagem) {
        // Cria uma referência de armazenamento única
        const storageRef = ref(storage, 'filmesSeries/' + imagem.name);

        // Faz o upload da imagem
        uploadBytes(storageRef, imagem).then(snapshot => {
            getDownloadURL(snapshot.ref).then(url => {
                // Adiciona o filme/série ao Firestore
                addDoc(collection(db, 'filmesSeries'), {
                    nome: nome,
                    imagemUrl: url
                }).then(() => {
                    alert('Filme/Série adicionado com sucesso!');
                    // Atualiza a tabela
                    adicionarFilmeTabela(nome, url);
                }).catch(error => {
                    console.error('Erro ao adicionar filme:', error);
                });
            });
        });
    }
});

// Carrega filmes/séries salvos no Firebase
window.onload = function() {
    getDocs(collection(db, 'filmesSeries')).then(querySnapshot => {
        querySnapshot.forEach(doc => {
            const data = doc.data();
            adicionarFilmeTabela(data.nome, data.imagemUrl);
        });
    });
};
