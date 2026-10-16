import { describe, expect, it } from "vitest";
import { formatCharacterName, validateAccountName, validateCharacterName, validatePassword } from "./validation";

describe("validação de contas", () => {
  it("conta: 3 a 20 letras, números ou _", () => {
    expect(validateAccountName("adoniran_1")).toBeNull();
    expect(validateAccountName("ab")).not.toBeNull();
    expect(validateAccountName("com espaço")).not.toBeNull();
  });
  it("senha: 6 a 72 caracteres", () => {
    expect(validatePassword("123456")).toBeNull();
    expect(validatePassword("12345")).not.toBeNull();
  });
  it("personagem: letras e espaços simples, nome capitalizado", () => {
    expect(validateCharacterName("Adoniran Bail")).toBeNull();
    expect(validateCharacterName("Zé")).not.toBeNull();
    expect(validateCharacterName("Two  Spaces")).not.toBeNull();
    expect(validateCharacterName("R2D2")).not.toBeNull();
    expect(formatCharacterName("  adoniran BAIL ")).toBe("Adoniran Bail");
  });
});
