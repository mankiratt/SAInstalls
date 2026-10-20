# Hardware brand logos

Drop the logo files for the hardware brands in here. Until a file exists,
the landing pages set that brand's name in type instead — which is why
the strip looks complete even with this folder empty.

## What to put here

| File | Brand |
|---|---|
| `blum.png` | Blum |
| `hafele.png` | Häfele |
| `harn.png` | Harn |
| `polytec.png` | Polytec |
| `cemux.png` | Cemux |

SVG is better than PNG if the brand offers it — it stays sharp at any
size and usually weighs less. Name it `blum.svg` and reference that
instead.

## What the files need to be

- **Transparent background.** The tiles are white; a logo with a baked-in
  white box will show as a visible rectangle.
- **Dark or full-colour artwork.** The tiles are white, so a white
  knockout logo will be invisible — this is exactly what happened with
  S&A's own logo, which is white on transparent and had to be put on a
  dark panel to be seen at all.
- **At least 320px wide.** They are displayed up to about 160px wide, and
  double that keeps them sharp on a phone screen.
- **Trimmed.** Crop the transparent padding off before saving. A logo
  floating in a large empty canvas renders tiny inside the tile.

## Switching a brand from text to a logo

In each of `/kitchens/index.html`, `/wardrobes/index.html` and
`/cabinet-maker/index.html`, find the brand's `<li>` and replace the
`<span>` with an `<img>`:

```html
<!-- before -->
<li class="lp-brand"><span class="lp-brand__name">Blum</span></li>

<!-- after -->
<li class="lp-brand">
  <img class="lp-brand__logo" src="/lp/img/brands/blum.png"
       alt="Blum" width="160" height="44" loading="lazy" decoding="async">
</li>
```

Set `width` and `height` to the file's real pixel dimensions — they stop
the row jumping about as the images load. `.lp-brand__logo` caps the
rendered height, so the numbers only need to be accurate, not small.

Mixing the two is fine: brands with a logo file can show the logo while
the rest stay as text.

## Before you publish these

Supplier logos are trademarks, and most brands publish guidelines about
how resellers and installers may display them — minimum clear space,
which colourway, and whether a plain "we use Blum hardware" wording is
preferred over the mark itself. Blum, Häfele and Polytec all run partner
or dealer portals that carry both the approved files and the rules. Worth
pulling the files from there rather than from a web search, so you get
the current mark and know where you stand.
