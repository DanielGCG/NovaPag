// Configuração do Firebase (certifique-se de substituir pelas suas credenciais do Firebase)
const firebaseConfig = {
    apiKey: "FB_apiKey",
    authDomain: "FB_authDomain",
    projectId: "FB_projectId",
    storageBucket: "FB_storageBucket",
    messagingSenderId: "FB_messagingSenderId",
    appId: "FB_appId"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();

// Função para exibir o loader de carregamento
function mostrarCarregando(mostrar) {
    const loader = document.getElementById('loader');
    loader.style.display = mostrar ? 'block' : 'none';
}

// Função para adicionar filme/série ao Firestore e Storage
async function adicionarFilmeSerie(event) {
    event.preventDefault();

    const nome = document.getElementById('nome').value;
    const imagem = document.getElementById('imagem').files[0];
    const statusMessage = document.getElementById('statusMessage');

    // Verifica se os dados necessários estão presentes
    if (!nome || !imagem) {
        alert("Por favor, preencha todos os campos.");
        return;
    }

    // Mostra o indicador de carregamento
    mostrarCarregando(true);
    statusMessage.textContent = "Carregando...";

    try {
        // Faz o upload da imagem para o Firebase Storage
        const storageRef = storage.ref(`lista/${imagem.name}`);
        const snapshot = await storageRef.put(imagem);
        const imagemUrl = await snapshot.ref.getDownloadURL();

        // Adiciona o nome e URL da imagem ao Firestore
        await db.collection('lista').add({
            nome: nome,
            imagemUrl: imagemUrl
        });

        alert("Filme/Série adicionado com sucesso!");
        statusMessage.textContent = "Filme/Série adicionado com sucesso!";

        // Atualiza a lista na página após adicionar o item
        listarFilmesSeries();
    } catch (error) {
        console.error("Erro ao adicionar filme:", error);
        statusMessage.textContent = "Erro ao adicionar filme. Tente novamente.";
    } finally {
        mostrarCarregando(false);
    }
}

// Função para listar filmes/séries armazenados no Firestore
async function listarFilmesSeries() {
    mostrarCarregando(true);
    const tabelaBody = document.getElementById("filmesSeries").getElementsByTagName("tbody")[0];
    tabelaBody.innerHTML = ""; // Limpa a tabela antes de listar

    try {
        // Busca os documentos da coleção 'lista' no Firestore
        const querySnapshot = await db.collection("lista").get();
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            adicionarFilmeTabela(data.nome, data.imagemUrl);
        });
    } catch (error) {
        console.error("Erro ao carregar filmes/séries:", error);
    } finally {
        mostrarCarregando(false);
    }
}

// Função auxiliar para adicionar uma linha à tabela
function adicionarFilmeTabela(nome, imagemUrl) {
    const tabelaBody = document.getElementById("filmesSeries").getElementsByTagName("tbody")[0];
    const newRow = tabelaBody.insertRow();

    const cell1 = newRow.insertCell(0);
    const cell2 = newRow.insertCell(1);
    const cell3 = newRow.insertCell(2);

    const img = document.createElement("img");
    img.src = imagemUrl;
    img.style.maxHeight = "100px";
    cell1.appendChild(img);

    cell2.textContent = nome;
    cell3.textContent = "❌"; // Ícone de status (pode adicionar uma função para remover futuramente)
}

// Adiciona o evento de submit ao formulário
document.getElementById("uploadForm").addEventListener("submit", adicionarFilmeSerie);

// Carrega a lista de filmes/séries ao abrir a página
window.onload = listarFilmesSeries;
