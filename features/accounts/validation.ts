// Regras de nome de conta, senha e nome de personagem. Puro TS.

export type ValidationError = { code: string; message: string };

const ACCOUNT_PATTERN = /^[A-Za-z0-9_]{3,20}$/;
// Personagem: letras (com acento) e espaços simples, 3 a 20, como no Tibia.
const CHARACTER_PATTERN = /^[A-Za-zÀ-ÿ]+( [A-Za-zÀ-ÿ]+)*$/;

export function nameKeyOf(name: string): string {
  return name.trim().toLowerCase();
}

export function validateAccountName(name: string): ValidationError | null {
  return ACCOUNT_PATTERN.test(name.trim())
    ? null
    : { code: "rpg.invalid_account", message: "Conta: 3 a 20 letras, números ou _." };
}

export function validatePassword(password: string): ValidationError | null {
  if (password.length < 6) return { code: "rpg.weak_password", message: "Senha: mínimo de 6 caracteres." };
  if (password.length > 72) return { code: "rpg.weak_password", message: "Senha: máximo de 72 caracteres." };
  return null;
}

export function validateCharacterName(name: string): ValidationError | null {
  const n = name.trim();
  if (n.length < 3 || n.length > 20 || !CHARACTER_PATTERN.test(n)) {
    return { code: "rpg.invalid_character", message: "Nome do personagem: 3 a 20 letras e espaços." };
  }
  return null;
}

/** "adoniran bail" -> "Adoniran Bail" */
export function formatCharacterName(name: string): string {
  return name
    .trim()
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}
