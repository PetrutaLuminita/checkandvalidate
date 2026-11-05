// Exposes the non-personal validators to AI agents through WebMCP, for browsers
// that support it. Everything still runs on this page, so nothing is sent to a
// server. The validator code is only downloaded when a tool is actually called,
// so visitors without WebMCP pay for this feature checking and nothing else.
//
// Credit card, SSN, CNP, DNI/NIE and driving licence checks are left out on
// purpose: a real one passed through an agent would land in a model transcript,
// which breaks the promise those pages make. The person types those themselves.

const FORMAT_ONLY = 'This checks the format only, not that the number is registered or active.';

const tools = [
  {
    name: 'validate_iban',
    description: 'Check an IBAN against the official length for its country and the ISO 7064 mod-97 checksum.',
    valueDescription: 'The IBAN, with or without spaces, for example GB82 WEST 1234 5698 7654 32.',
    limits: 'This checks length and checksum only, not that the account exists.',
    run: async (value) => (await import('./iban-core.js')).validateIban(value),
  },
  {
    name: 'validate_swift_bic',
    description: 'Check the structure of a SWIFT/BIC code and its country, and split it into bank, country, location and branch.',
    valueDescription: 'The 8 or 11 character SWIFT/BIC code.',
    limits: 'This checks structure and country only, not that the bank is registered with SWIFT.',
    run: async (value) => (await import('./swift-core.js')).validateSwift(value),
  },
  {
    name: 'validate_uk_vat',
    description: 'Check a UK VAT number with the HMRC modulus-97 check digit, including the 9755 variant. valid is null for government (GD) and health authority (HA) numbers, which have no check digit test here.',
    valueDescription: 'The UK VAT number, with or without the GB prefix.',
    limits: 'This checks the check digit only, not that the number is registered with HMRC.',
    run: async (value) => (await import('./vat-core.js')).validateVat(value),
  },
  {
    name: 'validate_eu_vat',
    description: 'Check the format of a VAT number for any of the 27 EU states or Northern Ireland (XI). Greece uses EL, not GR.',
    valueDescription: 'The VAT number including its two-letter country prefix, for example DE123456789.',
    limits: "This checks the format only. Use the European Commission's VIES service to confirm the number is active.",
    run: async (value) => (await import('./euvat-core.js')).validateEuVat(value),
  },
  {
    name: 'validate_us_ein',
    description: 'Check that a US Employer Identification Number has nine digits and a prefix the IRS uses.',
    valueDescription: 'The EIN, with or without the dash, for example 12-3456789.',
    limits: FORMAT_ONLY,
    run: async (value) => (await import('./ein-core.js')).validateEin(value),
  },
  {
    name: 'validate_us_routing_number',
    description: 'Check a nine-digit US bank routing number against the ABA checksum and Federal Reserve ranges.',
    valueDescription: 'The nine-digit routing number.',
    limits: 'This checks the checksum and range only, not that the number belongs to an active bank.',
    run: async (value) => (await import('./routing-core.js')).validateRouting(value),
  },
  {
    name: 'validate_isbn',
    description: 'Check an ISBN-10 or ISBN-13 check digit. A valid ISBN-10 also returns its ISBN-13.',
    valueDescription: 'The ISBN, with or without hyphens.',
    limits: 'This checks the check digit only, not that a book was published with this number.',
    run: async (value) => (await import('./isbn-core.js')).validateIsbn(value),
  },
];

// Older Chrome builds expose the API on navigator rather than document.
const modelContext = globalThis.document?.modelContext ?? globalThis.navigator?.modelContext;

if (modelContext) {
  for (const { name, description, valueDescription, limits, run } of tools) {
    Promise.resolve(
      modelContext.registerTool({
        name,
        description,
        annotations: { readOnlyHint: true },
        inputSchema: {
          type: 'object',
          properties: { value: { type: 'string', description: valueDescription } },
          required: ['value'],
        },
        execute: async ({ value }) => ({
          content: [{ type: 'text', text: JSON.stringify({ ...(await run(value)), limits }) }],
        }),
      })
    ).catch((err) => console.warn(`[webmcp] Could not register ${name}: ${err.message}`));
  }
}
