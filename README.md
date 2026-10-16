# @venore/plugin-rpg

Plugin do [Venore Docks](https://github.com/venore-docks/venore-docks) que funciona como **servidor de conteúdo e contas** do MMORPG Venore (app Godot no repositório [curytiba](https://github.com/adoniranbayerl/curytiba)).

- **Conteúdo editável no admin** (`/admin/rpg`): itens, monstros (com tabela de loot) e NPCs (falas, compra e venda). Fica em rascunho até alguém **publicar uma versão**. O pacote publicado é imutável e o app baixa sempre o mais recente.
- **Servidor e app**: nome, mensagem do dia, **versão mínima do app** (abaixo dela o app é obrigado a atualizar antes de logar), link de download, endereço do servidor de jogo e regras (perda na morte, respawn, multiplicadores de XP e skill).
- **Contas e personagens** criados pelo app; o admin lista as contas e pode bloqueá-las (bloquear derruba as sessões abertas).

## API do app

Servida em `/api/rpg/...`. O contrato completo está em `docs/server-api.md` no repositório do jogo.

| Método | Rota | Uso |
| --- | --- | --- |
| GET | `/api/rpg/status` | primeira chamada do app: versão mínima, versão do conteúdo, servidor de jogo |
| GET | `/api/rpg/content` | pacote de conteúdo publicado (`ETag` = versão; `304` se não mudou) |
| POST | `/api/rpg/auth/register` | cria conta (`account`, `password`, `client_version`) |
| POST | `/api/rpg/auth/login` | devolve token de sessão (30 dias) e personagens |
| POST | `/api/rpg/characters` | cria personagem (`Authorization: Bearer <token>`) |

Senhas com scrypt + sal; do token de sessão só o hash SHA-256 é gravado.

## Instalação numa instância

1. `instances/<instância>.json` lista `"rpg"` em `plugins`, e o `package.json` do core tem `@venore/plugin-rpg` com a tag desejada.
2. Em `/admin/plugins`, **Instalar** com "Popular com dados de exemplo" marcado: cria as tabelas (schema `rpg`) e roda o seed **Conteúdo inicial do jogo**, que cadastra o conteúdo do protótipo e publica a versão 1.

## Desenvolvimento

Siga o `CLAUDE.md` deste repositório (verificação contra o core, versão = tag).

Organização: as pastas de `features/` são por domínio (conteúdo, configuração, status, contas), cada uma com `handler → service → store`.
