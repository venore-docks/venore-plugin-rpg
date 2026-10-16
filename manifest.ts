import type { PluginManifest } from "@venore/plugin-sdk";

// Faixa de core escrita à mão (não importada do CORE_VERSION) — importar tornaria a checagem
// sempre trivialmente satisfeita.
export const rpgManifest: PluginManifest = {
  manifestVersion: "1.0.0",
  key: "rpg",
  name: "RPG",
  version: "0.1.0",
  description:
    "Servidor do MMORPG Venore: itens, monstros, NPCs e regras editados no admin e publicados em versões (o app baixa a versão publicada ao abrir), controle de versão mínima do app, contas e personagens com login pela API.",
  compatibility: { coreVersion: ">=2.0.0 <3.0.0" },
  migrationsPath: "./migrations",

  permissions: [
    { key: "rpg.manage", label: "Editar e publicar o conteúdo do jogo (itens, monstros, NPCs, regras e servidor)" },
    { key: "rpg.accounts", label: "Ver e bloquear contas de jogadores" },
  ],

  navigation: [
    {
      key: "rpg.admin",
      label: "RPG",
      href: "/admin/rpg",
      icon: "swords",
      groupKey: "plugins",
      groupLabel: "Plugins",
      groupOrder: 30,
      order: 50,
      requiredPermission: ["rpg.manage", "rpg.accounts"],
    },
  ],

  seeds: [
    {
      key: "initial-content",
      label: "Conteúdo inicial do jogo",
      description:
        "Cadastra os itens, monstros e NPCs do protótipo (ratos, Tom, Al Dee…), a configuração do servidor e publica a versão 1. Não sobrescreve o que já existir.",
    },
  ],
};
