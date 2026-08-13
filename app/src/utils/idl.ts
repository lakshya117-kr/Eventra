// Anchor 0.30 IDL for ticket_booking program.
// Each instruction/account MUST have a `discriminator` field (first 8 bytes
// of SHA-256 hash). Without these, Anchor 0.30's BorshInstructionCoder
// calls bs58.encode(undefined) which crashes with "Expected Buffer".
//
// Instruction discriminator = SHA-256("global:<snake_case_name>")[0..8]
// Account discriminator     = SHA-256("account:<PascalCaseName>")[0..8]
// 
// Account types are defined in `types` array in Anchor 0.30.

export const IDL = {
  address: '82Tzgv6JU15FD6jQH1hLwuvBDj8VjQ2Dz1SdnonU3ciA',
  metadata: { name: 'ticket_booking', version: '0.1.0', spec: '0.1.0' },
  instructions: [
    {
      name: 'initialize',
      discriminator: [175, 175, 109, 31, 13, 152, 155, 237],
      accounts: [
        { name: 'user', writable: true, signer: true },
        { name: 'xMint', writable: true, signer: false },
        { name: 'mintAuthority', writable: false, signer: false },
        { name: 'userTokenAccount', writable: true, signer: false },
        { name: 'userConfig', writable: true, signer: false },
        { name: 'solVault', writable: true, signer: false },
        { name: 'tokenProgram', writable: false, signer: false },
        { name: 'systemProgram', writable: false, signer: false },
        { name: 'associatedTokenProgram', writable: false, signer: false },
      ],
      args: [{ name: 'solPri', type: 'u64' }],
    },
    {
      name: 'buyToken',
      discriminator: [138, 127, 14, 91, 38, 87, 115, 105],
      accounts: [
        { name: 'buyer', writable: true, signer: true },
        { name: 'xMint', writable: true, signer: false },
        { name: 'userTokenAccount', writable: true, signer: false },
        { name: 'userConfig', writable: false, signer: false },
        { name: 'solVault', writable: true, signer: false },
        { name: 'mintAuthority', writable: false, signer: false },
        { name: 'tokenProgram', writable: false, signer: false },
        { name: 'systemProgram', writable: false, signer: false },
      ],
      args: [{ name: 'amount', type: 'u64' }],
    },
    {
      name: 'createOrganization',
      discriminator: [60, 173, 177, 39, 122, 23, 68, 185],
      accounts: [
        { name: 'organizer', writable: true, signer: true },
        { name: 'organizerAccount', writable: true, signer: false },
        { name: 'systemProgram', writable: false, signer: false },
      ],
      args: [],
    },
    {
      name: 'createEvent',
      discriminator: [49, 219, 29, 203, 22, 98, 100, 87],
      accounts: [
        { name: 'organizer', writable: true, signer: true },
        { name: 'eventAccount', writable: true, signer: false },
        { name: 'organizerAccount', writable: true, signer: false },
        { name: 'systemProgram', writable: false, signer: false },
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
      discriminator: [225, 205, 234, 143, 17, 186, 50, 220],
      accounts: [
        { name: 'user', writable: true, signer: true },
        { name: 'userAccount', writable: true, signer: false },
        { name: 'userTokenAccount', writable: true, signer: false },
        { name: 'xMint', writable: false, signer: false },
        { name: 'tokenProgram', writable: false, signer: false },
        { name: 'systemProgram', writable: false, signer: false },
        { name: 'associatedTokenProgram', writable: false, signer: false },
      ],
      args: [],
    },
    {
      name: 'bookTicket',
      discriminator: [191, 17, 87, 4, 177, 83, 123, 211],
      accounts: [
        { name: 'buyer', writable: true, signer: true },
        { name: 'buyerTokenAccount', writable: true, signer: false },
        { name: 'organizerTokenAccount', writable: true, signer: false },
        { name: 'eventAccount', writable: true, signer: false },
        { name: 'ticketRecord', writable: true, signer: false },
        { name: 'tokenProgram', writable: false, signer: false },
        { name: 'systemProgram', writable: false, signer: false },
      ],
      args: [{ name: 'commitment', type: { array: ['u8', 32] } }],
    },
    {
      name: 'verifyCheckIn',
      discriminator: [40, 125, 197, 139, 210, 41, 38, 203],
      accounts: [
        { name: 'scanner', writable: true, signer: true },
        { name: 'eventAccount', writable: true, signer: false },
        { name: 'ticketRecord', writable: true, signer: false },
        { name: 'nullifierRegistry', writable: true, signer: false },
        { name: 'systemProgram', writable: false, signer: false },
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
      discriminator: [109, 61, 40, 187, 230, 176, 135, 174],
      accounts: [
        { name: 'buyer', writable: true, signer: true },
        { name: 'userTokenAccount', writable: true, signer: false },
        { name: 'xMint', writable: true, signer: false },
        { name: 'userConfig', writable: false, signer: false },
        { name: 'solVault', writable: true, signer: false },
        { name: 'tokenProgram', writable: false, signer: false },
        { name: 'systemProgram', writable: false, signer: false },
      ],
      args: [{ name: 'amount', type: 'u64' }],
    },
  ],
  accounts: [
    { name: 'userConfig', discriminator: [58, 201, 49, 59, 232, 236, 180, 75] },
    { name: 'organizer', discriminator: [73, 247, 138, 243, 15, 237, 84, 136] },
    { name: 'event', discriminator: [125, 192, 125, 158, 9, 115, 152, 233] },
    { name: 'customerProfile', discriminator: [230, 176, 48, 101, 4, 236, 84, 108] },
    { name: 'ticketRecord', discriminator: [37, 215, 102, 48, 114, 66, 21, 87] },
    { name: 'zkNullifierRegistry', discriminator: [158, 188, 145, 101, 210, 206, 54, 193] },
  ],
  types: [
    {
      name: 'userConfig',
      type: {
        kind: 'struct',
        fields: [
          { name: 'user', type: 'pubkey' },
          { name: 'xMint', type: 'pubkey' },
          { name: 'userTokenAccount', type: 'pubkey' },
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
          { name: 'authority', type: 'pubkey' },
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
          { name: 'organizer', type: 'pubkey' },
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
          { name: 'customer', type: 'pubkey' },
          { name: 'userTokenAccount', type: 'pubkey' },
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
          { name: 'event', type: 'pubkey' },
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
