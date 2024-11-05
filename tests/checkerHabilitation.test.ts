import { describe, expect, test } from "bun:test";
import verif from "../src/index"; 

describe("Tests de la classe VerifHabilitations", () => {
  test("ADMIN devrait avoir l'habilitation 'login'", () => {
    const canLogin = verif.checkPermission("ADMIN", "login");
    expect(canLogin).toBe(true);
  });

  test("ADMIN devrait avoir l'habilitation 'forgotPassword'", () => {
    const canForgotPassword = verif.checkPermission("ADMIN", "forgotPassword");
    expect(canForgotPassword).toBe(true);
  });

  test("USER devrait avoir l'habilitation 'login'", () => {
    const canLogin = verif.checkPermission("USER", "login");
    expect(canLogin).toBe(true);
  });

  test("USER ne devrait pas avoir l'habilitation 'forgotPassword'", () => {
    const canForgotPassword = verif.checkPermission("USER", "forgotPassword");
    expect(canForgotPassword).toBe(false);
  });

  test("Un rôle inexistant ne devrait pas avoir d'habilitations", () => {
    const canDoSomething = verif.checkPermission("ADMINN", "login");
    expect(canDoSomething).toBe(false);
  });
});
