// Gerado a partir de data/content_default.json do repo do jogo (venore ct). Conteúdo do protótipo.
export const DEFAULT_CONTENT: Record<"items" | "monsters" | "npcs", Record<string, Record<string, unknown>>> = {
  "items": {
    "backpack": {
      "capacity": 20,
      "name": "mochila",
      "slot": "back",
      "type": "container",
      "weight": 18
    },
    "bag": {
      "capacity": 8,
      "name": "bolsa",
      "slot": "back",
      "type": "container",
      "weight": 8
    },
    "barrel": {
      "capacity": 4,
      "desc": "Pesado. Largue no chão para colocá-lo de volta.",
      "name": "barril",
      "type": "container",
      "weight": 120
    },
    "boots_haste": {
      "arm": 1,
      "desc": "Leves como o vento. Velocidade +20.",
      "name": "botas de corrida",
      "slot": "feet",
      "speed": 20,
      "type": "boots",
      "weight": 7.5
    },
    "cheese": {
      "name": "queijo",
      "plural": "queijos",
      "regen": 60,
      "stack": true,
      "type": "food",
      "weight": 1.5
    },
    "club": {
      "atk": 7,
      "def": 7,
      "name": "clava",
      "slot": "right",
      "type": "weapon",
      "weight": 25,
      "wtype": "club"
    },
    "coat": {
      "arm": 1,
      "atype": "armor_light",
      "name": "casaco",
      "slot": "body",
      "type": "armor",
      "weight": 27
    },
    "dagger": {
      "atk": 8,
      "def": 6,
      "name": "adaga",
      "slot": "right",
      "type": "weapon",
      "weight": 9.5,
      "wtype": "sword"
    },
    "dead_cave_rat": {
      "capacity": 5,
      "decay": 300,
      "desc": "O curtidor Tom compra.",
      "name": "rato de caverna morto",
      "pickup": true,
      "type": "corpse",
      "weight": 80
    },
    "dead_human": {
      "capacity": 10,
      "decay": 900,
      "desc": "Aqui jaz um aventureiro.",
      "name": "corpo de humano",
      "pickup": false,
      "type": "corpse",
      "weight": 9999
    },
    "dead_rat": {
      "capacity": 5,
      "decay": 300,
      "desc": "O curtidor Tom compra ratos mortos.",
      "name": "rato morto",
      "pickup": true,
      "type": "corpse",
      "weight": 63
    },
    "gold_coin": {
      "name": "moeda de ouro",
      "plural": "moedas de ouro",
      "stack": true,
      "type": "currency",
      "weight": 0.1
    },
    "hand_axe": {
      "atk": 10,
      "def": 5,
      "name": "machadinha",
      "slot": "right",
      "type": "weapon",
      "weight": 18,
      "wtype": "axe"
    },
    "key_cellar": {
      "desc": "Uma chave enferrujada. Cheira a mofo.",
      "name": "chave do porão",
      "type": "key",
      "weight": 1
    },
    "key_storage": {
      "desc": "Uma chave de ferro com a etiqueta \"depósito\".",
      "name": "chave do depósito",
      "type": "key",
      "weight": 1
    },
    "leather_armor": {
      "arm": 4,
      "atype": "armor_light",
      "name": "armadura de couro",
      "slot": "body",
      "type": "armor",
      "weight": 60
    },
    "leather_boots": {
      "arm": 1,
      "name": "botas de couro",
      "slot": "feet",
      "type": "boots",
      "weight": 9
    },
    "leather_helmet": {
      "arm": 1,
      "name": "elmo de couro",
      "slot": "head",
      "type": "helmet",
      "weight": 22
    },
    "leather_legs": {
      "arm": 1,
      "name": "calças de couro",
      "slot": "legs",
      "type": "legs",
      "weight": 18
    },
    "legion_helmet": {
      "arm": 2,
      "name": "elmo de legionário",
      "slot": "head",
      "type": "helmet",
      "weight": 31
    },
    "meat": {
      "name": "carne",
      "plural": "carnes",
      "regen": 180,
      "stack": true,
      "type": "food",
      "weight": 13
    },
    "short_sword": {
      "atk": 11,
      "def": 11,
      "name": "espada curta",
      "slot": "right",
      "type": "weapon",
      "weight": 35,
      "wtype": "sword"
    },
    "wooden_shield": {
      "def": 14,
      "name": "escudo de madeira",
      "slot": "left",
      "stype": "shield_light",
      "type": "shield",
      "weight": 40
    }
  },
  "monsters": {
    "cave_rat": {
      "armor": 2,
      "attack": 10,
      "corpse": "dead_cave_rat",
      "defense": 4,
      "flee_hp": 6,
      "hp": 30,
      "loot": [
        [
          "gold_coin",
          0.6,
          1,
          3
        ],
        [
          "cheese",
          0.4,
          1,
          1
        ]
      ],
      "name": "rato de caverna",
      "sight": 6,
      "speed": 75,
      "xp": 10
    },
    "rat": {
      "armor": 1,
      "attack": 8,
      "corpse": "dead_rat",
      "defense": 3,
      "flee_hp": 5,
      "hp": 20,
      "loot": [
        [
          "gold_coin",
          0.9,
          1,
          4
        ],
        [
          "cheese",
          0.3,
          1,
          1
        ]
      ],
      "name": "rato",
      "sight": 7,
      "speed": 67,
      "xp": 5
    }
  },
  "npcs": {
    "al_dee": {
      "buys": {
        "club": 1,
        "dagger": 2,
        "hand_axe": 4,
        "leather_armor": 6,
        "leather_boots": 1,
        "leather_helmet": 3,
        "leather_legs": 2,
        "legion_helmet": 25,
        "short_sword": 8,
        "wooden_shield": 3
      },
      "greet": "Olá, olá, %s! Bem-vindo à loja do Al Dee. Equipamento de aventureiro!",
      "look": "merchant",
      "marker": "a",
      "name": "Al Dee",
      "pos": [
        32063,
        32180,
        7
      ],
      "sells": {
        "backpack": 10,
        "bag": 4,
        "dagger": 5,
        "hand_axe": 20,
        "leather_armor": 25,
        "leather_boots": 5,
        "leather_helmet": 12,
        "leather_legs": 10,
        "short_sword": 30,
        "wooden_shield": 15
      },
      "title": "o comerciante",
      "topics": [
        [
          "Quem é você?",
          "Al Dee, o melhor comerciante da vila. Bom, o único, se você não contar o Tom."
        ],
        [
          "Bolsa?",
          "Sem uma bolsa nas costas você só carrega o que cabe nas mãos. E se morrer, a bolsa fica no seu corpo, lembre-se disso!"
        ],
        [
          "Armas?",
          "Cada tipo de arma tem sua própria skill: clava, espada, machado. Quanto mais usa, melhor fica com ela."
        ],
        [
          "Baú?",
          "Baús trancados abrem com a chave certa. Ou com muita força bruta, se você não liga de fazer barulho."
        ]
      ]
    },
    "tom": {
      "buys": {
        "dead_cave_rat": 4,
        "dead_rat": 2
      },
      "greet": "Olá, %s. Sou Tom, o curtidor. Se tiver ratos mortos, eu compro.",
      "look": "tanner",
      "marker": "t",
      "name": "Tom",
      "pos": [
        32085,
        32199,
        7
      ],
      "sells": {},
      "title": "o curtidor",
      "topics": [
        [
          "Quem é você?",
          "Trabalho com couro e peles. Os ratos daqui não dão um couro bonito, mas servem pra treinar o ofício."
        ],
        [
          "Ratos?",
          "Tem um campo cheio deles do outro lado da ponte, a leste. Cada rato morto vale 2 moedas; rato de caverna vale 4."
        ],
        [
          "Depósito?",
          "O depósito ao sul está trancado desde que o velho guarda sumiu. Dizem que ele largava a chave em qualquer barril..."
        ],
        [
          "Porão?",
          "Embaixo do depósito tem um porão. Ouço ratos maiores roendo lá embaixo à noite."
        ]
      ]
    }
  }
};
