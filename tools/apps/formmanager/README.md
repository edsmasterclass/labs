# Form Manager

A standalone DA app for listing HTML pages in an organization's sites. After
selecting a site, the app automatically lists pages recursively from its
`forms/` folder. Use the **Folder** picker to browse a different folder.

## How to Use

1. Enter an **Organization**, then click **Load**.
2. Select a site from the searchable **Site** picker.
3. The app lists all HTML pages in the site's `forms/` folder, including
   nested folders. Select another folder with the **Folder** picker to view
   its pages. Use **Edit** to open the source document in DA or **Preview** to
   open its published `main` preview.

## Configuring

Register the app in a site's DA config sheet, **apps** tab (`title` /
`description` / `image` / `path` columns):

| title | description | image | path |
| --- | --- | --- | --- |
| `Form Manager` | List form pages for an organization and site | *(an icon URL)* | `/app/adobe-rnd/aem-apps/tools/apps/formmanager/formmanager?org={org}&site={site}` |

Omit `&site={site}` to open without a site selected.

| Parameter | Required | Description |
| --- | --- | --- |
| `org` | No | Organization to load automatically. Without it, enter an organization and click Load. |
| `site` | No | Initial site selection; only used when `org` is supplied. |

The app updates these parameters as you navigate, so the current view can be
bookmarked or shared. It uses the URL parameters rather than the SDK's
org/site context to choose the initial location.

## Files

| File | Purpose |
| --- | --- |
| `formmanager.html` | App shell, importmap, DA SDK, and nx2 styles |
| `formmanager.js` | `<formmanager-app>` Lit component: site, folder, and page listing |
| `formmanager.css` | App styles |
| `api.js` | Authenticated site, folder, and document listing |
| `icons.js` | SVG icons used by the app |

## Dependencies

- [DA App SDK](https://da.live/nx/utils/sdk.js) — session context and token
- [`daFetch`](https://da.live/nx/utils/daFetch.js) — authenticated fetch with token refresh
- [DA constants](https://da.live/nx/public/utils/constants.js) — DA Admin endpoint resolution
- [`da-lit`](/tools/deps/lit/dist/index.js) — Lit UI components
- [nx2](https://da.live/nx2/styles/styles.css) — styles, color scheme, and `sl-*` components
- No build step; plain ES modules
