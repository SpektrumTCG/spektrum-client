export type SpektrumGacha = {
  version: '0.1.0';
  name: 'spektrum_gacha';
  instructions: [
    {
      name: 'initializePack';
      accounts: [
        { name: 'boosterPack'; isMut: true; isSigner: false },
        { name: 'owner'; isMut: true; isSigner: true },
        { name: 'treasury'; isMut: true; isSigner: false },
        { name: 'systemProgram'; isMut: false; isSigner: false },
      ];
      args: [
        { name: 'packType'; type: 'u8' },
        { name: 'expansion'; type: { array: ['u8', 16] } },
        { name: 'packNonce'; type: 'u64' },
        { name: 'priceLamports'; type: 'u64' },
      ];
    },
    {
      name: 'initializeCardPool';
      accounts: [
        { name: 'cardPool'; isMut: true; isSigner: false },
        { name: 'authority'; isMut: true; isSigner: true },
        { name: 'systemProgram'; isMut: false; isSigner: false },
      ];
      args: [
        { name: 'expansion'; type: { array: ['u8', 16] } },
        { name: 'cards'; type: { vec: { defined: { name: 'CardEntry' } } } },
      ];
    },
    {
      name: 'updateCardPool';
      accounts: [
        { name: 'cardPool'; isMut: true; isSigner: false },
        { name: 'authority'; isMut: false; isSigner: true },
      ];
      args: [
        { name: 'cards'; type: { vec: { defined: { name: 'CardEntry' } } } },
      ];
    },
    {
      name: 'delegateAndOpen';
      accounts: [
        { name: 'boosterPack'; isMut: true; isSigner: false },
        { name: 'owner'; isMut: true; isSigner: true },
        { name: 'delegationProgram'; isMut: false; isSigner: false },
        { name: 'systemProgram'; isMut: false; isSigner: false },
      ];
      args: [{ name: 'vrfSeed'; type: { array: ['u8', 32] } }];
    },
    {
      name: 'revealCard';
      accounts: [
        { name: 'boosterPack'; isMut: true; isSigner: false },
        { name: 'cardPool'; isMut: false; isSigner: false },
        { name: 'owner'; isMut: false; isSigner: true },
      ];
      args: [{ name: 'slotIndex'; type: 'u8' }];
    },
    {
      name: 'finalizeSession';
      accounts: [
        { name: 'boosterPack'; isMut: true; isSigner: false },
        { name: 'owner'; isMut: true; isSigner: true },
        { name: 'delegationProgram'; isMut: false; isSigner: false },
        { name: 'systemProgram'; isMut: false; isSigner: false },
      ];
      args: [];
    },
  ];
  accounts: [
    {
      name: 'boosterPack';
      type: {
        kind: 'struct';
        fields: [
          { name: 'owner'; type: 'publicKey' },
          { name: 'packType'; type: 'u8' },
          { name: 'expansion'; type: { array: ['u8', 16] } },
          { name: 'slots'; type: { array: [{ defined: { name: 'CardSlot' } }, 5] } },
          { name: 'wildWeights'; type: { defined: { name: 'RarityWeights' } } },
          { name: 'isDelegated'; type: 'bool' },
          { name: 'revealedCount'; type: 'u8' },
          { name: 'isFinalized'; type: 'bool' },
          { name: 'vrfSeed'; type: { array: ['u8', 32] } },
          { name: 'bump'; type: 'u8' },
          { name: 'packNonce'; type: 'u64' },
        ];
      };
    },
    {
      name: 'cardPool';
      type: {
        kind: 'struct';
        fields: [
          { name: 'authority'; type: 'publicKey' },
          { name: 'expansion'; type: { array: ['u8', 16] } },
          { name: 'totalCards'; type: 'u16' },
          { name: 'commonCount'; type: 'u8' },
          { name: 'uncommonCount'; type: 'u8' },
          { name: 'rareCount'; type: 'u8' },
          { name: 'superRareCount'; type: 'u8' },
          { name: 'mythicCount'; type: 'u8' },
          { name: 'cards'; type: { array: [{ defined: { name: 'CardEntry' } }, 128] } },
          { name: 'bump'; type: 'u8' },
        ];
      };
    },
  ];
  types: [
    {
      name: 'CardSlot';
      type: {
        kind: 'struct';
        fields: [
          { name: 'minRarity'; type: 'u8' },
          { name: 'isWild'; type: 'bool' },
          { name: 'revealed'; type: 'bool' },
          { name: 'cardNumber'; type: 'u32' },
          { name: 'resolvedRarity'; type: 'u8' },
        ];
      };
    },
    {
      name: 'RarityWeights';
      type: {
        kind: 'struct';
        fields: [
          { name: 'common'; type: 'u16' },
          { name: 'uncommon'; type: 'u16' },
          { name: 'rare'; type: 'u16' },
          { name: 'superRare'; type: 'u16' },
          { name: 'mythic'; type: 'u16' },
        ];
      };
    },
    {
      name: 'CardEntry';
      type: {
        kind: 'struct';
        fields: [
          { name: 'cardNumber'; type: 'u32' },
          { name: 'rarity'; type: 'u8' },
        ];
      };
    },
  ];
  errors: [
    { code: 6000; name: 'InvalidPackType'; msg: 'Invalid pack type. Must be 0 (Beginner), 1 (Advanced), or 2 (Expert).' },
    { code: 6001; name: 'AlreadyDelegated'; msg: 'Booster pack is already delegated to an Ephemeral Rollup.' },
    { code: 6002; name: 'AlreadyFinalized'; msg: 'Booster pack session is already finalized.' },
    { code: 6003; name: 'InvalidVrfSeed'; msg: 'VRF seed must not be all zeros.' },
    { code: 6004; name: 'NotDelegated'; msg: 'Pack must be delegated to an Ephemeral Rollup before revealing cards.' },
    { code: 6005; name: 'InvalidSlotIndex'; msg: 'Invalid slot index. Must be 0-4.' },
    { code: 6006; name: 'SlotAlreadyRevealed'; msg: 'This slot has already been revealed.' },
    { code: 6007; name: 'NoCardsForRarity'; msg: 'No cards available in pool for the resolved rarity.' },
    { code: 6008; name: 'SlotsNotFullyRevealed'; msg: 'All 5 card slots must be revealed before finalizing.' },
    { code: 6009; name: 'TooManyCards'; msg: 'Too many cards. Maximum pool size is 128.' },
    { code: 6010; name: 'EmptyCardList'; msg: 'Card list must not be empty.' },
    { code: 6011; name: 'InvalidCardNumber'; msg: 'Card number must be greater than 0.' },
    { code: 6012; name: 'InvalidRarity'; msg: 'Invalid rarity value. Must be 0-4.' },
    { code: 6013; name: 'Unauthorized'; msg: 'Only the pool authority can update the card pool.' },
    { code: 6014; name: 'InsufficientFunds'; msg: 'Buyer does not have enough SOL for this purchase.' },
  ];
};

export const IDL: any = {
  version: '0.1.0',
  name: 'spektrum_gacha',
  address: 'HPmXtAs37ShpfrmE55gWVDQB53KwZDf7jii1ppABRxXN',
  instructions: [
    {
      name: 'initializePack',
      discriminator: [15,188,48,124,80,63,130,252],
      accounts: [
        { name: 'boosterPack', writable: true, signer: false },
        { name: 'owner', writable: true, signer: true },
        { name: 'treasury', writable: true, signer: false },
        { name: 'systemProgram', writable: false, signer: false },
      ],
      args: [
        { name: 'packType', type: 'u8' },
        { name: 'expansion', type: { array: ['u8', 16] } },
        { name: 'packNonce', type: 'u64' },
        { name: 'priceLamports', type: 'u64' },
      ],
    },
    {
      name: 'initializeCardPool',
      discriminator: [147,180,146,12,228,128,254,27],
      accounts: [
        { name: 'cardPool', writable: true, signer: false },
        { name: 'authority', writable: true, signer: true },
        { name: 'systemProgram', writable: false, signer: false },
      ],
      args: [
        { name: 'expansion', type: { array: ['u8', 16] } },
        { name: 'cards', type: { vec: { defined: { name: 'CardEntry' } } } },
      ],
    },
    {
      name: 'updateCardPool',
      discriminator: [230,123,14,222,75,188,191,242],
      accounts: [
        { name: 'cardPool', writable: true, signer: false },
        { name: 'authority', writable: true, signer: true },
        { name: 'systemProgram', writable: false, signer: false },
      ],
      args: [
        { name: 'cards', type: { vec: { defined: { name: 'CardEntry' } } } },
      ],
    },
    {
      name: 'delegateAndOpen',
      discriminator: [133,193,65,52,48,188,118,241],
      accounts: [
        { name: 'boosterPack', writable: true, signer: false },
        { name: 'owner', writable: true, signer: true },
        { name: 'delegationProgram', writable: false, signer: false },
        { name: 'systemProgram', writable: false, signer: false },
      ],
      args: [{ name: 'vrfSeed', type: { array: ['u8', 32] } }],
    },
    {
      name: 'revealCard',
      discriminator: [152,230,28,32,204,156,215,35],
      accounts: [
        { name: 'boosterPack', writable: true, signer: false },
        { name: 'cardPool', writable: false, signer: false },
        { name: 'owner', writable: false, signer: true },
      ],
      args: [{ name: 'slotIndex', type: 'u8' }],
    },
    {
      name: 'finalizeSession',
      discriminator: [34,148,144,47,37,130,206,161],
      accounts: [
        { name: 'boosterPack', writable: true, signer: false },
        { name: 'owner', writable: true, signer: true },
        { name: 'delegationProgram', writable: false, signer: false },
        { name: 'systemProgram', writable: false, signer: false },
      ],
      args: [],
    },
  ],
  accounts: [
    {
      name: 'boosterPack',
      type: {
        kind: 'struct',
        fields: [
          { name: 'owner', type: 'publicKey' },
          { name: 'packType', type: 'u8' },
          { name: 'expansion', type: { array: ['u8', 16] } },
          { name: 'slots', type: { array: [{ defined: { name: 'CardSlot' } }, 5] } },
          { name: 'wildWeights', type: { defined: { name: 'RarityWeights' } } },
          { name: 'isDelegated', type: 'bool' },
          { name: 'revealedCount', type: 'u8' },
          { name: 'isFinalized', type: 'bool' },
          { name: 'vrfSeed', type: { array: ['u8', 32] } },
          { name: 'bump', type: 'u8' },
          { name: 'packNonce', type: 'u64' },
        ],
      },
    },
    {
      name: 'cardPool',
      type: {
        kind: 'struct',
        fields: [
          { name: 'authority', type: 'publicKey' },
          { name: 'expansion', type: { array: ['u8', 16] } },
          { name: 'totalCards', type: 'u16' },
          { name: 'commonCount', type: 'u8' },
          { name: 'uncommonCount', type: 'u8' },
          { name: 'rareCount', type: 'u8' },
          { name: 'superRareCount', type: 'u8' },
          { name: 'mythicCount', type: 'u8' },
          { name: 'cards', type: { array: [{ defined: { name: 'CardEntry' } }, 128] } },
          { name: 'bump', type: 'u8' },
        ],
      },
    },
  ],
  types: [
    {
      name: 'CardSlot',
      type: {
        kind: 'struct',
        fields: [
          { name: 'minRarity', type: 'u8' },
          { name: 'isWild', type: 'bool' },
          { name: 'revealed', type: 'bool' },
          { name: 'cardNumber', type: 'u32' },
          { name: 'resolvedRarity', type: 'u8' },
        ],
      },
    },
    {
      name: 'RarityWeights',
      type: {
        kind: 'struct',
        fields: [
          { name: 'common', type: 'u16' },
          { name: 'uncommon', type: 'u16' },
          { name: 'rare', type: 'u16' },
          { name: 'superRare', type: 'u16' },
          { name: 'mythic', type: 'u16' },
        ],
      },
    },
    {
      name: 'CardEntry',
      type: {
        kind: 'struct',
        fields: [
          { name: 'cardNumber', type: 'u32' },
          { name: 'rarity', type: 'u8' },
        ],
      },
    },
  ],
  errors: [
    { code: 6000, name: 'InvalidPackType', msg: 'Invalid pack type. Must be 0 (Beginner), 1 (Advanced), or 2 (Expert).' },
    { code: 6001, name: 'AlreadyDelegated', msg: 'Booster pack is already delegated to an Ephemeral Rollup.' },
    { code: 6002, name: 'AlreadyFinalized', msg: 'Booster pack session is already finalized.' },
    { code: 6003, name: 'InvalidVrfSeed', msg: 'VRF seed must not be all zeros.' },
    { code: 6004, name: 'NotDelegated', msg: 'Pack must be delegated to an Ephemeral Rollup before revealing cards.' },
    { code: 6005, name: 'InvalidSlotIndex', msg: 'Invalid slot index. Must be 0-4.' },
    { code: 6006, name: 'SlotAlreadyRevealed', msg: 'This slot has already been revealed.' },
    { code: 6007, name: 'NoCardsForRarity', msg: 'No cards available in pool for the resolved rarity.' },
    { code: 6008, name: 'SlotsNotFullyRevealed', msg: 'All 5 card slots must be revealed before finalizing.' },
    { code: 6009, name: 'TooManyCards', msg: 'Too many cards. Maximum pool size is 128.' },
    { code: 6010, name: 'EmptyCardList', msg: 'Card list must not be empty.' },
    { code: 6011, name: 'InvalidCardNumber', msg: 'Card number must be greater than 0.' },
    { code: 6012, name: 'InvalidRarity', msg: 'Invalid rarity value. Must be 0-4.' },
    { code: 6013, name: 'Unauthorized', msg: 'Only the pool authority can update the card pool.' },
    { code: 6014, name: 'InsufficientFunds', msg: 'Buyer does not have enough SOL for this purchase.' },
  ],
} as const;
