# DA Permissions

A standalone DA app for managing organization, site, and folder permissions.
Displays the organization's permissions sheet as Read/Write member lists,
with email addresses or Adobe IMS group IDs identifying members.

See the [DA permissions guide](https://docs.da.live/administrators/guides/permissions)
for permission evaluation and Adobe IMS setup.

## How to Use

1. Enter an **Organization**, then **Load**. Your DA session must have access
   to that organization's configuration; modifying permissions requires write
   access to it and an existing permissions sheet.
2. With no site selected, manage **DA Configurations** and **All Sites**
   permissions at the organization level.
3. Select a site using the searchable site picker to manage **Site
   Configurations**, **All Site Content**, and existing folder rules. Clear
   the site selection or click the organization breadcrumb to return to the
   organization view.
4. Click **+ Add** under **Read** or **Write**, enter an email address or IMS
   group ID, then press **Enter**. **Escape** cancels.
5. To remove a member, click its close button and confirm **Remove?**.
6. To add a folder scope, select a site, click **+ Add folder permission**,
   browse to a folder, then **Add this folder**. Add its first member to
   persist the new scope.

**Changes save immediately** to the organization's DA configuration. There
is no separate Save or Publish step. Click **Load** again to refresh the
configuration without losing the current site selection.

## Configuring

Register the app in a site's DA config sheet, **apps** tab (`title` /
`description` / `image` / `path` columns):

| title | description | image | path |
| --- | --- | --- | --- |
| `DA Permissions` | Manage organization, site, and folder permissions | *(an icon URL)* | `/app/adobe-rnd/aem-apps/tools/apps/da-permissions/da-permissions?org={org}&site={site}` |

Omit `&site={site}` to open at the organization level.

| Parameter | Required | Description |
| --- | --- | --- |
| `org` | No | Organization to load automatically. Without it, enter an organization and click Load. |
| `site` | No | Initial site selection; only used when `org` is supplied. |

The app updates these parameters as you navigate, so the current view can be
bookmarked or shared. It uses the URL parameters rather than the SDK's
org/site context to choose the initial location.

## Permission Scopes

All rules are stored in the **organization** configuration's
`permissions.data`, including site and folder rules.

| View | Label | Rule path |
| --- | --- | --- |
| Organization | DA Configurations | `CONFIG` |
| Organization | All Sites | `/ + **` |
| Site | Site Configurations | `/{site}/CONFIG` |
| Site | All Site Content | `/{site}/ + **` |
| Site | Folder | `/{site}/{folder}/ + **` |

- **Read** — view content or read DA configurations. Config Read is
  recommended for content authors using the block library or plugins.
- **Write** — create, edit, and delete content (includes Read), or modify DA
  configurations.
- **None** — explicit denial, stored with an empty `actions` value. The
  None row is only shown for scopes that already have an explicit deny rule;
  the app does not expose a new None row on other scopes.

Each rule has `path`, `groups` (comma-separated emails or IMS group IDs), and
`actions` (`read`, `write`, or an empty string).

In site views, organization-level members appear as inherited pills on the
corresponding configuration/content scope. These pills cannot be removed
from the site view; edit the organization-level rule instead. The app displays
rules, not a calculation of each user's effective access.

## Saving and Access

Before each member change, the app fetches the latest organization
configuration, updates the matching permission rule, and posts the full
configuration back, preserving its other sections. Removing the last member
from a rule deletes that rule.

If the organization configuration cannot be loaded, the app displays
**You don't have admin access to this org.** If a save returns HTTP 401 or
403, it displays a read-only warning. DA enforces access server-side.

## Files

| File | Purpose |
| --- | --- |
| `da-permissions.html` | App shell, importmap, DA SDK, and nx2 styles |
| `da-permissions.js` | `<da-permissions-app>` Lit component: navigation, member editing, and folder browser |
| `da-permissions.css` | App styles |
| `api.js` | Authenticated configuration reads/writes and site/folder listing |

## Dependencies

- [DA App SDK](https://da.live/nx/utils/sdk.js) — session context and token
- [`daFetch`](https://da.live/nx/utils/daFetch.js) — authenticated fetch with token refresh
- [DA constants](https://da.live/nx/public/utils/constants.js) — DA Admin endpoint resolution
- [`da-lit`](/tools/deps/lit/dist/index.js) — Lit UI components
- [nx2](https://da.live/nx2/styles/styles.css) — styles, color scheme, and `sl-*` components
- No build step; plain ES modules
