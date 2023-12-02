let db;

//registrando a service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js', { type: "module" });
      console.log('Service worker registrada! 😎', reg);
    } catch (err) {
      console.log('😥 Service worker registro falhou: ', err);
    }
  });
}

//configurando aos constraintes do video stream
let camMode = "user";
let constraints = { video: { facingMode: camMode }, audio: false };
//capturando elementos em tela
const cameraView = document.querySelector("#camera--view"),
  cameraOutput = document.querySelector("#camera--output"),
  cameraSensor = document.querySelector("#camera--sensor"),
  cameraTrigger = document.querySelector("#camera--trigger"),
  cameraSwitch = document.querySelector("#camera--switch");

//estabelecendo o acesso a camera e inicializando a visualização
async function cameraStart() {
  //inicia o bd
  await initDB();
  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    cameraView.srcObject = stream;
  } catch (error) {
    console.error("Ocorreu um Erro.", error);
  }
}

//função para tirar foto
cameraTrigger.addEventListener('click', () => {
  cameraSensor.width = cameraView.videoWidth;
  cameraSensor.height = cameraView.videoHeight;
  cameraSensor.getContext("2d").drawImage(cameraView, 0, 0);
  //url
  const imageUrl = cameraSensor.toDataURL("image/webp");
  cameraOutput.src = imageUrl;
  cameraOutput.classList.add("taken");
  saveImageToDB(imageUrl);
});

//carrega imagem de camera quando a janela carregar
window.addEventListener("load", cameraStart, false);

function initDB() {
  //assincrona
  return new Promise((resolve, reject) => {
    //abrir ou criar o banco de dados chamado instaClone
    const request = indexedDB.open('instaClone', 1);

    request.onerror = (event) => {
      console.error("Erro ao abrir o banco de dados:", event.target.error);
      //erro ao abrir o banco de dados, a promessa é rejeitada, indicando que houve um problema na inicialização do IndexedDB
      reject(event.target.error);
    };

    request.onsuccess = (event) => {
      db = event.target.result;
      console.log("Banco de dados aberto com sucesso!");
      //promessa é resolvida, indicando que o IndexedDB foi inicializado com sucesso
      resolve();
    };

    request.onupgradeneeded = (event) => {
      db = event.target.result;
      //cria um novo objeto de armazenamento de objetos no banco de dados
      db.createObjectStore('images', { keyPath: 'id', autoIncrement: true });
      console.log("Armazenamento de objetos criado com sucesso.");
    };
  });
}

cameraSwitch.addEventListener('click', () => {
  stopMediaTracks(cameraView.srcObject);
  //alterna entre os modos de câmera 'user' (frontal) e 'environment' (traseira)
  camMode = (camMode === "user") ? "environment" : "user";
  //atualiza as restrições de mídia para refletir o novo modo de câmera
  constraints = { video: { facingMode: camMode }, audio: false };
  //inicia a câmera com as novas restrições
  cameraStart();
});

document.addEventListener('DOMContentLoaded', () => {
  navigator.mediaDevices.getUserMedia({ video: true })
    .then((stream) => {
      cameraView.srcObject = stream;
    })
    .catch((error) => {
      console.error('Erro ao acessar a câmera:', error);
    });
});


//salvar img no IndexedDB
async function saveImageToDB(imageUrl) {
  //transação no objeto de armazenamento 'images'
  const transaction = db.transaction('images', 'readwrite');
  const objectStore = transaction.objectStore('images');
  const imageObject = { url: imageUrl, timestamp: new Date().getTime() };
  try {
    //adiciona o objeto de imagem ao objeto de armazenamento 'images'
    await objectStore.add(imageObject);
    console.log("Imagem adicionada ao IndexedDB com sucesso!" + imageUrl);
  } catch (error) {
    console.error("Erro ao adicionar a imagem ao IndexedDB:", error);
  }
}