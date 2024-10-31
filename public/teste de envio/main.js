// Importar as funções Firebase do SDK
import { getStorage, ref, uploadBytes, getDownloadURL, listAll } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-storage.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";

// Configuração Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDuwnu2XcSTJ1YZkgD4570AtE6uKci_nDQ",
  authDomain: "boteco-6fcfa.firebaseapp.com",
  projectId: "boteco-6fcfa",
  storageBucket: "boteco-6fcfa.appspot.com",
  messagingSenderId: "531032694476",
  appId: "1:531032694476:web:6e03bdd824b90fd2b2ec69"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

// Função de upload de arquivo
async function uploadFile() {
  const fileInput = document.getElementById('fileInput');
  const nomeFilmeInput = document.getElementById('nomeFilme');
  const nomeFilme = nomeFilmeInput.value.trim();

  if (fileInput.files.length === 0) {
      alert('Por favor, selecione um arquivo!');
      return;
  }

  const file = fileInput.files[0];

  // Verifica se o arquivo é uma imagem
  if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione um arquivo de imagem válido!');
      return;
  }

  // Modificar o nome do arquivo
  const newFileName = `${nomeFilme}.png`;
  const listaFilmesRef = ref(storage, `listaFilmes/${newFileName}`);

  try {
      // Enviar o arquivo para o Firebase Storage
      const snapshot = await uploadBytes(listaFilmesRef, file);
      console.log('Arquivo enviado com sucesso:', snapshot);

      // Obter o URL do arquivo
      const downloadURL = await getDownloadURL(snapshot.ref);
      console.log('URL de download:', downloadURL);
      alert(`Arquivo enviado com sucesso! URL de download: ${downloadURL}`);

      // Adicionar o novo item à lista de filmes
      adicionarItemLista(downloadURL, nomeFilme);

      // Limpar o formulário
      fileInput.value = '';
      nomeFilmeInput.value = '';

  } catch (error) {
      console.error('Erro ao enviar o arquivo:', error);
      alert('Erro ao enviar o arquivo.');
  }
}


// Função para adicionar o item à lista de filmes
function adicionarItemLista(url, nome) {
  const listaFilmes = document.getElementById('listaFilmes');
  const item = document.createElement('li');
  item.innerHTML = `<img src="${url}" alt="${nome}" style="width: 100px; height: auto;"><br>${nome}`;
  listaFilmes.appendChild(item);
}

// Função para listar todos os filmes da pasta no Firebase Storage
async function listarFilmes() {
  const listaFilmesRef = ref(storage, 'listaFilmes/');
  
  try {
    const result = await listAll(listaFilmesRef);
    result.items.forEach(async (itemRef) => {
      const url = await getDownloadURL(itemRef);
      adicionarItemLista(url, itemRef.name);
    });
  } catch (error) {
    console.error('Erro ao listar filmes:', error);
  }
}

// Chamar a função para listar filmes ao carregar a página
window.onload = listarFilmes;

// Definindo a função no objeto window para torná-la global
window.uploadFile = uploadFile;
