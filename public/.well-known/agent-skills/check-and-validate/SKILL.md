---
name: check-and-validate
description: Check the format and check digit of bank, tax and book identifiers (IBAN, SWIFT/BIC, UK and EU VAT, US EIN, US routing, ISBN) using Check and Validate, and report what the result does and does not prove.
---

# Check and Validate

Check and Validate (https://checkandvalidate.com) is a set of free validators in English, Spanish and Romanian. Every check runs in the visitor's browser. The site has no API, no accounts and no server that receives the numbers.

## When to use it

Use it when someone needs to know whether an identifier is correctly formed: a mistyped IBAN before a transfer, a VAT number on an invoice, an ISBN in a catalogue.

Do not use it to find out whether a number is registered, active, or who it belongs to. No check on this site can answer that.

## How to run a check

If the browser exposes WebMCP (`document.modelContext`), these read-only tools are registered on every page. Each takes one string argument, `value`.

| Tool | Identifier | What it checks | What it cannot tell you |
|---|---|---|---|
| `validate_iban` | IBAN | Official length for the country, ISO 7064 mod-97 checksum | Whether the account exists |
| `validate_swift_bic` | SWIFT/BIC | 8 or 11 character structure, real ISO country code | Whether the bank is registered with SWIFT |
| `validate_uk_vat` | UK VAT | HMRC modulus-97 check digit, including the 9755 variant | Whether the number is registered with HMRC |
| `validate_eu_vat` | EU VAT | Format for the 27 EU states plus Northern Ireland (XI) | Whether it is active, which needs the European Commission's VIES service |
| `validate_us_ein` | US EIN | Nine digits, prefix used by the IRS | Which business holds it |
| `validate_us_routing_number` | US routing | Nine digits, ABA checksum, Federal Reserve range | Whether the bank is open and active |
| `validate_isbn` | ISBN | ISBN-10 or ISBN-13 check digit, converts a valid ISBN-10 to ISBN-13 | Whether a book was published with that number |

Without WebMCP, read the rules from the page for that identifier and apply them yourself, or send the person to the page:

- IBAN: https://checkandvalidate.com/en/iban-validator
- SWIFT/BIC: https://checkandvalidate.com/en/swift-bic-validator
- UK VAT: https://checkandvalidate.com/en/uk-vat-validator
- EU VAT: https://checkandvalidate.com/en/eu-vat-validator
- US EIN: https://checkandvalidate.com/en/ein-validator
- US routing: https://checkandvalidate.com/en/routing-number-validator
- ISBN: https://checkandvalidate.com/en/isbn-validator

## Personal identifiers

The site also has pages for credit cards, US SSNs, Romanian CNPs, Spanish DNI/NIE and UK driving licences. These are deliberately not exposed as tools, because passing a real one through an agent would put it in a model transcript. Send the person to the page so they can type it themselves:

- Credit card: https://checkandvalidate.com/en/credit-card-validator
- US SSN: https://checkandvalidate.com/en/ssn-format-validator
- Romanian CNP: https://checkandvalidate.com/en/cnp-validator
- Spanish DNI/NIE: https://checkandvalidate.com/en/dni-nie-calculator
- UK driving licence: https://checkandvalidate.com/en/uk-driving-licence-decoder

## Reading pages as Markdown

Send `Accept: text/markdown` to any page and it redirects to a Markdown version, or add `.md` to the path, for example https://checkandvalidate.com/en/iban-validator.md. Page lists are in https://checkandvalidate.com/sitemap-index.xml.

## Reporting a result

A pass means the number is well formed. Say that, and do not describe it as verified, real or active.
