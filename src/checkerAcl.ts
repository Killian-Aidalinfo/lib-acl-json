import { promises as fs } from "fs";
import path from "path";
// Into schema JSON
type Role = {
  parentOf: string | null;
  habilitations: string[];
};
// Schema JSON
type ACL = {
  [role: string]: Role;
};

/*

*/
export class checkerHabilitations {
  private acl: ACL = {};
  private fileName: string;

  constructor() {
    this.fileName = (typeof Bun !== "undefined" ? Bun.env.HABILITATION_FILENAME : process.env.HABILITATION_FILENAME) || "acl.json";
  }

  // Méthode d'initialisation asynchrone pour charger l'ACL
  public async init() {
    this.acl = await this.loadHabilitations();
  }

  private async loadHabilitations(): Promise<ACL> {
    const paths =
    process.env.NODE_ENV === "test"
    ? [`./${this.fileName}`]
    : [
        path.join(process.cwd(), "src", this.fileName),  
        path.join(process.cwd(), this.fileName)
      ];
    for (const filePath of paths) {
      if (typeof Bun !== "undefined") {
        // Si Bun est disponible
        const file = Bun.file(filePath);
        if (await file.exists()) {
          console.log(`Fichier d'habilitations trouvé : ${filePath}`);
          return await file.json();
        }
      } else {
        // Fallback pour Node.js 
        try {
          // Vérifie si le fichier existe dans le répertoire
          await fs.access(filePath);
          console.log(`Fichier d'habilitations trouvé : ${filePath}`);
          const fileContent = await fs.readFile(filePath, "utf-8");
          return JSON.parse(fileContent);
        } catch (error) {
          console.warn(`Erreur lors de la vérification de ${filePath}:`, error);
          continue;
        }
      }
    }

    throw new Error("Fichier d'habilitations introuvable.");
  }

  public checkPermission(role: string, habilitation: string): boolean {
    const roleData = this.acl[role];
    if (!roleData) return false;

    if (roleData.habilitations.includes(habilitation)) {
      return true;
    }

    const parentRole = roleData.parentOf;
    return parentRole ? this.checkPermission(parentRole, habilitation) : false;
  }
}
