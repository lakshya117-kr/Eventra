// Manually authored IDL matching our Anchor program (ticket_booking)
// Generated from analysis of lib.rs, context.rs, state.rs
export type TicketBooking = {
  version: '0.1.0';
  name: 'ticket_booking';
  instructions: [
    {
      name: 'initialize';
      accounts: [
        { name: 'user'; isMut: true; isSigner: true },
        { name: 'xMint'; isMut: true; isSigner: false },
        { name: 'mintAuthority'; isMut: false; isSigner: false },
        { name: 'userTokenAccount'; isMut: true; isSigner: false },
        { name: 'userConfig'; isMut: true; isSigner: false },
        { name: 'solVault'; isMut: true; isSigner: false },
        { name: 'tokenProgram'; isMut: false; isSigner: false },
        { name: 'systemProgram'; isMut: false; isSigner: false },
        { name: 'associatedTokenProgram'; isMut: false; isSigner: false },
      ];
      args: [{ name: 'solPri'; type: 'u64' }];
    },
    {
      name: 'buyToken';
      accounts: [
        { name: 'buyer'; isMut: true; isSigner: true },
        { name: 'xMint'; isMut: true; isSigner: false },
        { name: 'userTokenAccount'; isMut: true; isSigner: false },
        { name: 'userConfig'; isMut: false; isSigner: false },
        { name: 'solVault'; isMut: true; isSigner: false },
        { name: 'mintAuthority'; isMut: false; isSigner: false },
        { name: 'tokenProgram'; isMut: false; isSigner: false },
        { name: 'systemProgram'; isMut: false; isSigner: false },
      ];
      args: [{ name: 'amount'; type: 'u64' }];
    },
    {
      name: 'createOrganization';
      accounts: [
        { name: 'organizer'; isMut: true; isSigner: true },
        { name: 'organizerAccount'; isMut: true; isSigner: false },
        { name: 'systemProgram'; isMut: false; isSigner: false },
      ];
      args: [];
    },
    {
      name: 'createEvent';
      accounts: [
        { name: 'organizer'; isMut: true; isSigner: true },
        { name: 'eventAccount'; isMut: true; isSigner: false },
        { name: 'organizerAccount'; isMut: true; isSigner: false },
        { name: 'systemProgram'; isMut: false; isSigner: false },
      ];
      args: [
        { name: 'ticketPrice'; type: 'u64' },
        { name: 'maxTicket'; type: 'u64' },
        { name: 'eventMetadata'; type: 'string' },
        { name: 'eventName'; type: 'string' },
      ];
    },
    {
      name: 'createProfile';
      accounts: [
        { name: 'user'; isMut: true; isSigner: true },
        { name: 'userAccount'; isMut: true; isSigner: false },
        { name: 'userTokenAccount'; isMut: true; isSigner: false },
        { name: 'xMint'; isMut: false; isSigner: false },
        { name: 'tokenProgram'; isMut: false; isSigner: false },
        { name: 'systemProgram'; isMut: false; isSigner: false },
        { name: 'associatedTokenProgram'; isMut: false; isSigner: false },
      ];
      args: [];
    },
    {
      name: 'bookTicket';
      accounts: [
        { name: 'buyer'; isMut: true; isSigner: true },
        { name: 'buyerTokenAccount'; isMut: true; isSigner: false },
        { name: 'organizerTokenAccount'; isMut: true; isSigner: false },
        { name: 'eventAccount'; isMut: true; isSigner: false },
        { name: 'ticketRecord'; isMut: true; isSigner: false },
        { name: 'tokenProgram'; isMut: false; isSigner: false },
        { name: 'systemProgram'; isMut: false; isSigner: false },
      ];
      args: [{ name: 'commitment'; type: { array: ['u8', 32] } }];
    },
    {
      name: 'verifyCheckIn';
      accounts: [
        { name: 'scanner'; isMut: true; isSigner: true },
        { name: 'eventAccount'; isMut: true; isSigner: false },
        { name: 'ticketRecord'; isMut: true; isSigner: false },
        { name: 'nullifierRegistry'; isMut: true; isSigner: false },
        { name: 'systemProgram'; isMut: false; isSigner: false },
      ];
      args: [
        { name: 'nullifierHash'; type: { array: ['u8', 32] } },
        { name: 'proofA'; type: { array: ['u8', 64] } },
        { name: 'proofB'; type: { array: ['u8', 128] } },
        { name: 'proofC'; type: { array: ['u8', 64] } },
      ];
    },
    {
      name: 'sellToken';
      accounts: [
        { name: 'buyer'; isMut: true; isSigner: true },
        { name: 'userTokenAccount'; isMut: true; isSigner: false },
        { name: 'xMint'; isMut: true; isSigner: false },
        { name: 'userConfig'; isMut: false; isSigner: false },
        { name: 'solVault'; isMut: true; isSigner: false },
        { name: 'tokenProgram'; isMut: false; isSigner: false },
        { name: 'systemProgram'; isMut: false; isSigner: false },
      ];
      args: [{ name: 'amount'; type: 'u64' }];
    },
  ];
  accounts: [
    {
      name: 'userConfig';
      type: {
        kind: 'struct';
        fields: [
          { name: 'user'; type: 'publicKey' },
          { name: 'xMint'; type: 'publicKey' },
          { name: 'userTokenAccount'; type: 'publicKey' },
          { name: 'solanaPrice'; type: 'u64' },
          { name: 'tokenPerPurchase'; type: 'u64' },
          { name: 'bump'; type: 'u8' },
        ];
      };
    },
    {
      name: 'organizer';
      type: {
        kind: 'struct';
        fields: [
          { name: 'authority'; type: 'publicKey' },
          { name: 'reputationScore'; type: 'u64' },
          { name: 'totalEventHosted'; type: 'u64' },
          { name: 'bump'; type: 'u8' },
        ];
      };
    },
    {
      name: 'event';
      type: {
        kind: 'struct';
        fields: [
          { name: 'name'; type: 'string' },
          { name: 'organizer'; type: 'publicKey' },
          { name: 'eventId'; type: 'u64' },
          { name: 'ticketPrice'; type: 'u64' },
          { name: 'maxTicket'; type: 'u64' },
          { name: 'ticketSold'; type: 'u64' },
          { name: 'eventMetadata'; type: 'string' },
          { name: 'bump'; type: 'u8' },
        ];
      };
    },
    {
      name: 'customerProfile';
      type: {
        kind: 'struct';
        fields: [
          { name: 'customer'; type: 'publicKey' },
          { name: 'userTokenAccount'; type: 'publicKey' },
          { name: 'loyalityPoints'; type: 'u64' },
          { name: 'bump'; type: 'u8' },
        ];
      };
    },
    {
      name: 'ticketRecord';
      type: {
        kind: 'struct';
        fields: [
          { name: 'event'; type: 'publicKey' },
          { name: 'commitment'; type: { array: ['u8', 32] } },
          { name: 'isUsed'; type: 'bool' },
          { name: 'bump'; type: 'u8' },
        ];
      };
    },
    {
      name: 'zkNullifierRegistry';
      type: {
        kind: 'struct';
        fields: [
          { name: 'nullifierHash'; type: { array: ['u8', 32] } },
          { name: 'claimedAt'; type: 'i64' },
          { name: 'bump'; type: 'u8' },
        ];
      };
    },
  ];
  errors: [
    { code: 6000; name: 'EventSoldOut'; msg: 'This event is completely sold out!' },
    { code: 6001; name: 'TicketAlreadyScanned'; msg: 'This ticket has already been scanned at the gate.' },
    { code: 6002; name: 'InvalidProofFormat'; msg: 'The proof format is invalid.' },
    { code: 6003; name: 'MathError'; msg: 'Internal math error during pairing check.' },
    { code: 6004; name: 'InvalidZKProof'; msg: 'The Zero-Knowledge Proof is mathematically invalid!' },
  ];
};

export const IDL: TicketBooking = {
  version: '0.1.0',
  name: 'ticket_booking',
  address: 'DteV95BQwTEJUS9dW5XYG2w3u3RpUNooBF3WtGaEd9pj',
  metadata: { name: 'ticket_booking', version: '0.1.0', spec: '0.1.0' },
  instructions: [
    {
      name: 'initialize',
      accounts: [
        { name: 'user', isMut: true, isSigner: true },
        { name: 'xMint', isMut: true, isSigner: false },
        { name: 'mintAuthority', isMut: false, isSigner: false },
        { name: 'userTokenAccount', isMut: true, isSigner: false },
        { name: 'userConfig', isMut: true, isSigner: false },
        { name: 'solVault', isMut: true, isSigner: false },
        { name: 'tokenProgram', isMut: false, isSigner: false },
        { name: 'systemProgram', isMut: false, isSigner: false },
        { name: 'associatedTokenProgram', isMut: false, isSigner: false },
      ],
      args: [{ name: 'solPri', type: 'u64' }],
    },
    {
      name: 'buyToken',
      accounts: [
        { name: 'buyer', isMut: true, isSigner: true },
        { name: 'xMint', isMut: true, isSigner: false },
        { name: 'userTokenAccount', isMut: true, isSigner: false },
        { name: 'userConfig', isMut: false, isSigner: false },
        { name: 'solVault', isMut: true, isSigner: false },
        { name: 'mintAuthority', isMut: false, isSigner: false },
        { name: 'tokenProgram', isMut: false, isSigner: false },
        { name: 'systemProgram', isMut: false, isSigner: false },
      ],
      args: [{ name: 'amount', type: 'u64' }],
    },
    {
      name: 'createOrganization',
      accounts: [
        { name: 'organizer', isMut: true, isSigner: true },
        { name: 'organizerAccount', isMut: true, isSigner: false },
        { name: 'systemProgram', isMut: false, isSigner: false },
      ],
      args: [],
    },
    {
      name: 'createEvent',
      accounts: [
        { name: 'organizer', isMut: true, isSigner: true },
        { name: 'eventAccount', isMut: true, isSigner: false },
        { name: 'organizerAccount', isMut: true, isSigner: false },
        { name: 'systemProgram', isMut: false, isSigner: false },
      ],
      args: [
        { name: 'ticketPrice', type: 'u64' },
        { name: 'maxTicket', type: 'u64' },
        { name: 'eventMetadata', type: 'string' },
        { name: 'eventName', type: 'string' },
      ],
    },
    {
      name: 'createProfile',
      accounts: [
        { name: 'user', isMut: true, isSigner: true },
        { name: 'userAccount', isMut: true, isSigner: false },
        { name: 'userTokenAccount', isMut: true, isSigner: false },
        { name: 'xMint', isMut: false, isSigner: false },
        { name: 'tokenProgram', isMut: false, isSigner: false },
        { name: 'systemProgram', isMut: false, isSigner: false },
        { name: 'associatedTokenProgram', isMut: false, isSigner: false },
      ],
      args: [],
    },
    {
      name: 'bookTicket',
      accounts: [
        { name: 'buyer', isMut: true, isSigner: true },
        { name: 'buyerTokenAccount', isMut: true, isSigner: false },
        { name: 'organizerTokenAccount', isMut: true, isSigner: false },
        { name: 'eventAccount', isMut: true, isSigner: false },
        { name: 'ticketRecord', isMut: true, isSigner: false },
        { name: 'tokenProgram', isMut: false, isSigner: false },
        { name: 'systemProgram', isMut: false, isSigner: false },
      ],
      args: [{ name: 'commitment', type: { array: ['u8', 32] } }],
    },
    {
      name: 'verifyCheckIn',
      accounts: [
        { name: 'scanner', isMut: true, isSigner: true },
        { name: 'eventAccount', isMut: true, isSigner: false },
        { name: 'ticketRecord', isMut: true, isSigner: false },
        { name: 'nullifierRegistry', isMut: true, isSigner: false },
        { name: 'systemProgram', isMut: false, isSigner: false },
      ],
      args: [
        { name: 'nullifierHash', type: { array: ['u8', 32] } },
        { name: 'proofA', type: { array: ['u8', 64] } },
        { name: 'proofB', type: { array: ['u8', 128] } },
        { name: 'proofC', type: { array: ['u8', 64] } },
      ],
    },
    {
      name: 'sellToken',
      accounts: [
        { name: 'buyer', isMut: true, isSigner: true },
        { name: 'userTokenAccount', isMut: true, isSigner: false },
        { name: 'xMint', isMut: true, isSigner: false },
        { name: 'userConfig', isMut: false, isSigner: false },
        { name: 'solVault', isMut: true, isSigner: false },
        { name: 'tokenProgram', isMut: false, isSigner: false },
        { name: 'systemProgram', isMut: false, isSigner: false },
      ],
      args: [{ name: 'amount', type: 'u64' }],
    },
  ],
  accounts: [
    {
      name: 'userConfig',
      type: {
        kind: 'struct',
        fields: [
          { name: 'user', type: 'publicKey' },
          { name: 'xMint', type: 'publicKey' },
          { name: 'userTokenAccount', type: 'publicKey' },
          { name: 'solanaPrice', type: 'u64' },
          { name: 'tokenPerPurchase', type: 'u64' },
          { name: 'bump', type: 'u8' },
        ],
      },
    },
    {
      name: 'organizer',
      type: {
        kind: 'struct',
        fields: [
          { name: 'authority', type: 'publicKey' },
          { name: 'reputationScore', type: 'u64' },
          { name: 'totalEventHosted', type: 'u64' },
          { name: 'bump', type: 'u8' },
        ],
      },
    },
    {
      name: 'event',
      type: {
        kind: 'struct',
        fields: [
          { name: 'name', type: 'string' },
          { name: 'organizer', type: 'publicKey' },
          { name: 'eventId', type: 'u64' },
          { name: 'ticketPrice', type: 'u64' },
          { name: 'maxTicket', type: 'u64' },
          { name: 'ticketSold', type: 'u64' },
          { name: 'eventMetadata', type: 'string' },
          { name: 'bump', type: 'u8' },
        ],
      },
    },
    {
      name: 'customerProfile',
      type: {
        kind: 'struct',
        fields: [
          { name: 'customer', type: 'publicKey' },
          { name: 'userTokenAccount', type: 'publicKey' },
          { name: 'loyalityPoints', type: 'u64' },
          { name: 'bump', type: 'u8' },
        ],
      },
    },
    {
      name: 'ticketRecord',
      type: {
        kind: 'struct',
        fields: [
          { name: 'event', type: 'publicKey' },
          { name: 'commitment', type: { array: ['u8', 32] } },
          { name: 'isUsed', type: 'bool' },
          { name: 'bump', type: 'u8' },
        ],
      },
    },
    {
      name: 'zkNullifierRegistry',
      type: {
        kind: 'struct',
        fields: [
          { name: 'nullifierHash', type: { array: ['u8', 32] } },
          { name: 'claimedAt', type: 'i64' },
          { name: 'bump', type: 'u8' },
        ],
      },
    },
  ],
  errors: [
    { code: 6000, name: 'EventSoldOut', msg: 'This event is completely sold out!' },
    { code: 6001, name: 'TicketAlreadyScanned', msg: 'This ticket has already been scanned at the gate.' },
    { code: 6002, name: 'InvalidProofFormat', msg: 'The proof format is invalid.' },
    { code: 6003, name: 'MathError', msg: 'Internal math error during pairing check.' },
    { code: 6004, name: 'InvalidZKProof', msg: 'The Zero-Knowledge Proof is mathematically invalid!' },
  ],
} as any;
