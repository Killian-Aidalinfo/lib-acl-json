import { checkerHabilitations } from "./checkerAcl";

// Création de l'instance unique
const verif = new checkerHabilitations();

// Fonction d'initialisation
async function setupVerifHabilitations() {
  try {
    await verif.init();
    console.log("Initialisation réussie des habilitations.");
  } catch (error) {
    console.error("Erreur lors de l'initialisation des habilitations :", error);
    throw error;
  }
}

await setupVerifHabilitations();

export default verif;
