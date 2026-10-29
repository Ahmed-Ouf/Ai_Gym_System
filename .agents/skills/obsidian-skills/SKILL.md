---
name: obsidian-skills
description: >-
  Create and manage Obsidian Flavored Markdown, Bases (.base), JSON Canvas (.canvas),
  and Obsidian CLI workflows (from kepano/obsidian-skills). Use this skill when working
  with structured Markdown knowledge bases, wikilinks, callouts, frontmatter properties,
  JSON Canvas diagrams, or Obsidian vault files.
---

# Obsidian Skills (Markdown, Bases, JSON Canvas & CLI)

Source: [`kepano/obsidian-skills`](https://github.com/kepano/obsidian-skills)

Follow these specifications when creating or editing Obsidian Flavored Markdown notes, `.base` database views, `.canvas` visual workspaces, or interacting with Obsidian vaults.

## 1. Obsidian Flavored Markdown (`obsidian-markdown`)

- **YAML Frontmatter Properties**:
  - Place YAML frontmatter at the very top of the file enclosed in `---`.
  - Use standardized property types: text, list (`tags`, `aliases`), number, checkbox (`boolean`), date (`YYYY-MM-DD`), and datetime (`YYYY-MM-DDTHH:mm:ss`).
- **Internal Links (Wikilinks)**:
  - Link notes with `[[Note Name]]` or `[[Note Name|Display Text]]`.
  - Link to headings with `[[Note Name#Heading]]` and to blocks with `[[Note Name#^block-id]]`.
- **Embeds**:
  - Embed notes, images, PDFs, or audio using `![[File Name]]` or `![[Image.png|400]]` for width sizing.
- **Callouts**:
  - Use Obsidian callout syntax for structured admonitions:
    ```markdown
    > [!note]+ Optional Title
    > Callout content goes here.
    ```
  - Supported types: `note`, `abstract`/`summary`, `info`, `todo`, `tip`, `success`, `question`, `warning`, `failure`, `danger`, `bug`, `example`, `quote`. Append `+` (expanded by default) or `-` (collapsed by default) for foldable callouts.

## 2. Obsidian Bases (`obsidian-bases`)

- `.base` files are YAML-formatted files that define dynamic database views (table, cards, list) over vault notes using frontmatter properties.
- Structure `.base` files with `filters`, `formulas`, `properties`, and `views`:
  ```yaml
  filters:
    and:
      - file.hasTag("project")
  formulas:
    days_left: '(date(due) - today()).days'
  views:
    - type: table
      name: "Active Projects"
      order:
        - file.name
        - status
        - due
        - formula.days_left
  ```

## 3. JSON Canvas (`json-canvas`)

- `.canvas` files adhere to the open [JSON Canvas 1.0 specification](https://jsoncanvas.org/) with top-level `nodes` and `edges` arrays:
  - **Nodes**: Each node requires `id`, `type` (`text`, `file`, `link`, or `group`), `x`, `y`, `width`, `height`, and type-specific fields (`text` for markdown text, `file` for vault path, `url` for external links, `label` for groups).
  - **Edges**: Each edge requires `id`, `fromNode`, `toNode`, and optional `fromSide`/`toSide` (`top`, `right`, `bottom`, `left`), `fromEnd`/`toEnd` (`none`, `arrow`), `color`, and `label`.

## 4. Clean Markdown Extraction & Templates (`defuddle` / `knap`)

- When converting web pages or raw documentation into vault notes, strip navigation chrome, ads, and boilerplate so only clean semantic Markdown and source metadata remain in frontmatter.

