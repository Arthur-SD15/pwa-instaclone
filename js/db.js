import { openDB } from "idb";

let db;

async function createDB() {
  try {
    db = await openDB("banco", 1, {
      upgrade(db, oldVersion, newVersion, transaction) {
        switch (oldVersion) {
          case 0:
          case 1:
            const store = db.createObjectStore("photos", {
              keyPath: "id",
            });
            // Criando um índice id na store, deve estar contido no objeto do banco.
            store.createIndex("id", "id");
            showResult("Banco de dados criado!");
        }
      },
    });
    showResult("Banco de dados aberto.");
  } catch (e) {
    showResult("Erro ao criar o banco de dados: " + e.message);
  }
}

function showResult(message) {
  console.log(message);
  // Aqui você pode adicionar código para exibir a mensagem no console ou em algum lugar na interface do usuário.
}

window.addEventListener("DOMContentLoaded", async (event) => {
  await createDB();
});