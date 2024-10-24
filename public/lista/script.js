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
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
db.settings({
    experimentalForceLongPolling: true, // Ativar se houver problemas de rede com Firestore
    useFetchStreams: false // Verifique se isso está correto no seu ambiente
});

const storage = firebase.storage();

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

// Manipula o upload do formulário
document.getElementById('uploadForm').addEventListener('submit', async function(event) {
    event.preventDefault(); 

    const nome = document.getElementById('nome').value;
    const imagem = document.getElementById('imagem').files[0];
    const statusMessage = document.getElementById('statusMessage');

    if (imagem) {
        try {
            // Cria referência de armazenamento
            const storageRef = storage.ref('filmesSeries/' + imagem.name);

            // Faz upload da imagem
            const snapshot = await storageRef.put(imagem);
            const url = await snapshot.ref.getDownloadURL();

            // Adiciona filme/série à coleção "lista" no Firestore
            await db.collection('lista').add({
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
        }
    }
});

// Carrega filmes/séries salvos
window.onload = async function() {
    try {
        const querySnapshot = await db.collection('lista').get();
        querySnapshot.forEach(doc => {
            const data = doc.data();
            adicionarFilmeTabela(data.nome, data.imagemUrl);
        });
    } catch (error) {
        console.error('Erro ao carregar filmes/séries:', error);
    }
};
