// Configuração do Firebase
const firebaseConfig = {
    apiKey: "FB_apiKey",
    authDomain: "FB_authDomain",
    projectId: "FB_projectId",
    storageBucket: "FB_storageBucket",
    messagingSenderId: "FB_messagingSenderId",
    appId: "FB_appId"
};

// Inicializando Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();

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
        const storageRef = storage.ref('filmesSeries/' + imagem.name);

        // Faz o upload da imagem
        storageRef.put(imagem).then(snapshot => {
            snapshot.ref.getDownloadURL().then(url => {
                // Adiciona o filme/série ao Firestore
                db.collection('filmesSeries').add({
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
    db.collection('filmesSeries').get().then(querySnapshot => {
        querySnapshot.forEach(doc => {
            const data = doc.data();
            adicionarFilmeTabela(data.nome, data.imagemUrl);
        });
    });
};
