# API media URLs

How a record's image becomes a URL the browser can load, and why the obvious
concatenation is wrong.

## The one rule

`VITE_API_URL` points at the **API**, which is mounted under `/api`. Images are not.
Laravel keeps them on the `public` disk (`storage/app/public`, symlinked to
`public/storage`) and serves them from the **site root**, under `/storage`.

```txt
VITE_API_URL  http://localhost:8000/api                   ← API calls
image_path    records/oamQx0KpGMlHOdjYXs9XVXnEWIKCq2DGrKBBvQ7e.jpg
              ─────────────────────────────────────────
              http://localhost:8000/storage/records/oamQx0K….jpg   ← what the <img> needs
```

`image_path` is a path **on the disk, not a URL**: nothing in the JSON resolves on its
own.

| Composition | Result |
| --- | --- |
| `` `${VITE_API_URL}/${image_path}` `` | `/api/records/…` — 404, and silently |
| `` `${origin}/storage/${image_path}` `` | correct |

So the media base is the API's **origin**, not its base URL:

```js
new URL(import.meta.env.VITE_API_URL).origin   // http://localhost:8000
```

## The helper

`src/utils/api.js` owns this, because it already owns the env var. One function, one
job, for every component that shows a record image (today: `MeadowCard`).

```js
mediaUrl(imagePath)   // → absolute URL, or null
```

`null` is a contract, not a failure: it means *there is no image to show*, and the
caller falls back to a placeholder. A broken `<img>` is never a valid return.

| `image_path` | `mediaUrl()` | The card shows |
| --- | --- | --- |
| `records/oamQx0K….jpg` | absolute URL | the stored image |
| `null`, `""`, `"   "`, absent | `null` | a placeholder |
| anything, `VITE_API_URL` unset | `null` | a placeholder |

Input is trimmed and leading slashes dropped: this API is loose with whitespace on its
attributes, and a blank string means *absent*, not *the site root*.

## Two consequences

- **One source of truth.** The origin is *derived* from `VITE_API_URL` rather than
  declared in a second env var, so the media host cannot drift from the API host.
- **The module stays importable.** The derivation is guarded, so a missing
  `VITE_API_URL` surfaces as the request error it is, not as a module-load crash.

## Not handled yet

`image_path` being *present but broken* — the file 404s because `storage:link` was
never run — still shows a broken image. Swapping in a placeholder on `onError` is task
**F38** in [`project-planning.md`](./project-planning.md). The fallback there must be a
**stable** placeholder: `pickPlaceholder()` is random by design, so reusing it would make
the image change at random the moment it fails.
