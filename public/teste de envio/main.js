// Importar as funções Firebase do SDK
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-storage.js";
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
  if (fileInput.files.length === 0) {
    alert('Por favor, selecione um arquivo!');
    return;
  }
  
  const file = fileInput.files[0];
  const listaFilmesRef = ref(storage, `listaFilmes/${file.name}`);

  try {
    // Enviar o arquivo para o Firebase Storage
    const snapshot = await uploadBytes(listaFilmesRef, file);
    console.log('Arquivo enviado com sucesso:', snapshot);

    // Obter o URL do arquivo
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log('URL de download:', downloadURL);
    alert(`Arquivo enviado com sucesso! URL de download: ${downloadURL}`);
  } catch (error) {
    console.error('Erro ao enviar o arquivo:', error);
    alert('Erro ao enviar o arquivo.');
  }
}

// Definindo a função no objeto window para torná-la global
window.uploadFile = uploadFile;
