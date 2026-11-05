// Runs after `astro build`. Writes the files that describe the built site to
// AI agents, which can only be produced once the HTML and public/ exist in dist/:
//
//   1. A Markdown copy of every page, next to its HTML (/en/iban-validator.md).
//      vercel.json redirects `Accept: text/markdown` requests to these, and
//      serves them with noindex so they never compete with the real pages.
//   2. The agent skills index, which has to carry the SHA-256 of the SKILL.md
//      it lists, so it is generated here rather than kept by hand in public/.

import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import TurndownService from 'turndown';
import { tables } from 'turndown-plugin-gfm';

const SITE = 'https://checkandvalidate.com';
const dist = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');

const turndown = new TurndownService({
  headingStyle: 'atx',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
});
turndown.use(tables);
// The form and its empty result box only work in a browser; the breadcrumb and
// icons are chrome. Each page's front matter links to the interactive version.
turndown.remove(['script', 'style', 'form', 'svg', 'nav']);
turndown.remove((node) => node.hasAttribute?.('hidden'));
// Homepage cards wrap a heading in a link, which is not valid Markdown. Keep the
// heading and put the link on its own line.
turndown.addRule('cardLink', {
  filter: (node) => node.nodeName === 'A' && node.querySelector('h1, h2, h3, h4, h5, h6'),
  replacement: (content, node) => `\n\n${content.trim()}\n\n${node.getAttribute('href')}\n\n`,
});

function htmlPages(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return htmlPages(path);
    return entry.name === 'index.html' ? [path] : [];
  });
}

const decode = (text) =>
  text
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');

function must(html, regex, page, what) {
  const match = html.match(regex);
  if (!match) throw new Error(`[agent-files] No ${what} in ${page}`);
  return match[1];
}

function toMarkdown(html, page) {
  const title = decode(must(html, /<title>([^<]*)<\/title>/, page, 'title'));
  const description = decode(must(html, /<meta name="description" content="([^"]*)"/, page, 'description'));
  const url = must(html, /<link rel="canonical" href="([^"]*)"/, page, 'canonical');
  const language = must(html, /<html lang="([^"]*)"/, page, 'language');
  const main = must(html, /<main[^>]*>([\s\S]*)<\/main>/, page, '<main>');

  // Links have to work once the text is read outside the site.
  const body = turndown.turndown(main.replace(/href="\//g, `href="${SITE}/`));

  const frontMatter = [
    '---',
    `title: ${JSON.stringify(title)}`,
    `description: ${JSON.stringify(description)}`,
    `url: ${url}`,
    `language: ${language}`,
    '---',
  ].join('\n');
  return `${frontMatter}\n\n${body}\n`;
}

const pages = htmlPages(dist);
for (const page of pages) {
  // dist/en/iban-validator/index.html -> dist/en/iban-validator.md
  const route = relative(dist, dirname(page));
  if (!route) throw new Error(`[agent-files] Unexpected root page: ${page}`);
  writeFileSync(join(dist, `${route}.md`), toMarkdown(readFileSync(page, 'utf8'), page));
}

const skillPath = '.well-known/agent-skills/check-and-validate/SKILL.md';
const skillDescription = must(
  readFileSync(join(dist, skillPath), 'utf8'),
  /^description: (.*)$/m,
  skillPath,
  'description'
);
const digest = createHash('sha256').update(readFileSync(join(dist, skillPath))).digest('hex');

mkdirSync(join(dist, '.well-known/agent-skills'), { recursive: true });
writeFileSync(
  join(dist, '.well-known/agent-skills/index.json'),
  `${JSON.stringify(
    {
      $schema: 'https://schemas.agentskills.io/discovery/0.2.0/schema.json',
      skills: [
        {
          name: 'check-and-validate',
          type: 'skill-md',
          description: skillDescription,
          url: `/${skillPath.split(sep).join('/')}`,
          digest: `sha256:${digest}`,
        },
      ],
    },
    null,
    2
  )}\n`
);

console.log(`[agent-files] Wrote ${pages.length} Markdown pages and the agent skills index.`);
