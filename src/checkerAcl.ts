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
    this.fileName = Bun.env.HABILITATION_FILENAME || "acl.json";
  }

  public async init() {
    this.acl = await this.loadHabilitations();
  }

  private async loadHabilitations(): Promise<ACL> {
    const paths =
      Bun.env.NODE_ENV === "test"
        ? [`./${this.fileName}`]
        : [`../../../../src/${this.fileName}`, `../../../../${this.fileName}`];

    for (const filePath of paths) {
      const file = Bun.file(filePath);
      if (await file.exists()) {
        console.log(`Fichier d'habilitations trouvé : ${filePath}`);
        return await file.json();
      }
    }

    throw new Error("Fichier d'habilitations introuvable.");
  }

  public checkPermission(role: string, habilitation: string): boolean {
    const isRole = this.acl[role];
    if (!isRole) return false;

    if (isRole.habilitations.includes(habilitation)) {
      return true;
    }

    const parentRole = isRole.parentOf;
    return parentRole ? this.checkPermission(parentRole, habilitation) : false;
  }
}
