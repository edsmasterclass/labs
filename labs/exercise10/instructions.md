# Exercise 10: Service-Booking Widget Development

**Duration**: 60-90 minutes.

---

<details>
<summary><strong>Quick navigation</strong></summary>

- [Prerequisites](#prerequisites)
- **Background** (please read - expand below)
  - [What you'll learn](#what-youll-learn)
  - [Why this matters](#why-this-matters)
  - [Blocks versus widgets](#blocks-versus-widgets)
- **Exercise steps**
  - [Step 1: Create Your Service-Booking Page](#step-1-create-your-service-booking-page)
  - [Step 2: Add the Service-Booking Link](#step-2-add-the-service-booking-link)
  - [Step 3: Verify the Hosted Booking API](#step-3-verify-the-hosted-booking-api)
  - [Step 4: Build the Service-Booking Widget](#step-4-build-the-service-booking-widget)
  - [Step 5: Preview and Test Locally](#step-5-preview-and-test-locally)
  - [Step 6: Test Error Handling and Multiple Instances](#step-6-test-error-handling-and-multiple-instances)
  - [Step 7: Validate and Commit Your Changes](#step-7-validate-and-commit-your-changes)
- [Troubleshooting](#troubleshooting)
- [Verification Checklist](#verification-checklist)
- [Key Takeaways](#key-takeaways)
- [References](#references)
- [Solution](#solution)

</details>

---

## Prerequisites

**Complete [SETUP.md](../SETUP.md) if not already done.** Exercises can be done in sequence or independently.

**Required:**
- **Feature branch** - Run `git branch` from the repository root. The line with `*` should be your personal branch: first initial + last name, lowercase (e.g. `jsmith`). If you still need to create yours, follow [SETUP Step 2](../SETUP.md#step-2-create-feature-branch).
- Verify the local dev server at [http://localhost:3000](http://localhost:3000). If it is not running, start `aem up` from the project root ([SETUP Step 6](../SETUP.md#step-6-start-development-server)).
- Code editor open with the repository.
- Experience Workspace access and a personal folder at `/drafts/<your-name>/`.
- Familiarity with form/DOM events and `fetch`.
- Use the pre-deployed API at `https://eds-labs-service-booking.aem-poc-lab.workers.dev`; Step 4 shows how to create your widget's `config.js`.

Learners do not need a Cloudflare account, API key, or a local booking server. The shared Worker and D1 database are already deployed; do not create, redeploy, or reset them for this exercise. Use **fictitious contact details only**. This hosted demo makes no real appointments and sends no email.

**Branch split:** `main` contains these instructions, the Worker source/schema/configuration, and reusable supporting helpers. The completed widget lives on [demo-exercise10](https://github.com/edsmasterclass/labs/tree/demo-exercise10/widgets/service-booking). Stay on your personal branch from `main`; Step 4 provides code samples and commands to copy the complete reference without switching branches.

**Optional:** to host the API in your own Cloudflare account, follow [Own Cloudflare account](worker/README.md#own-cloudflare-account-optional). Create your own D1 database, update the Worker account/database IDs and allowed origins, and set the widget's API URL to your deployment.

---

<details>
<summary><strong>Background</strong> (please read - concepts before the hands-on steps)</summary>

## What You'll Learn

- Decide when application behavior belongs in a widget rather than an authored block.
- Package service-booking markup, styling, and behavior under `/widgets/service-booking`.
- Insert the widget using one authored link.
- Call a hosted booking API configured by the developer, not the author.
- Render an accessible month calendar and available time controls.
- Fetch availability, validate contact details, and submit a demo booking.
- Handle loading, empty results, failures, retries, and independent widget instances.

## Why This Matters

A service-booking flow combines application-owned markup with live availability and form submission. Authors should be able to place it without copying JavaScript or maintaining its application markup in their documents.

**The pattern**:

```text
1. Developer supplies service-booking HTML, CSS, and JavaScript.
2. Author inserts a standalone link to the widget HTML.
3. The boilerplate's existing widget loader replaces that link with the widget.
4. The widget calls its developer-configured Cloudflare Worker backend.
5. The visitor chooses a service, date, and time, then submits a booking.
```

The author adds an ordinary link directly to the document, not a block table or embed script.

## Blocks versus widgets

Blocks decorate content that authors supply, usually in a table. Widgets bring their own HTML and application logic; authors reference them with a URL. Both use scoped CSS and a default JavaScript decoration function.

A static service description with authored text and a CTA should normally be a block. A service-booking form that fetches availability and submits appointments is an application-driven widget.

Read the [official widgets documentation](https://www.aem.live/docs/widgets) for the platform model. This repository's demo branch already has a widget loader, but the current `main` baseline does not. Step 4 shows how to wire the supplied loader if it is missing; do not install a second loader.

</details>

---

## Step 1: Create Your Service-Booking Page

Create test content **before changing code**, so you have a real authoring example to verify.

**In Experience Workspace:**

1. Open the [project drafts folder](https://da.live/#/edsmasterclass/labs/drafts).
2. Open your personal folder, `<your-name>` (e.g. `jsmith`). Create it if needed, as in Exercise 1.
3. Create a new **Page**, not a Sheet. Name it **`widgets-test`**.
4. Open the page and add an H1: **Service Booking**.
5. Add a short introduction: **Choose a service, date, and time to book a demo appointment. Use fictitious contact details only.**
6. Add an H2: **Book an Appointment**.
7. Leave an empty paragraph beneath the H2 for the widget link.

**Your page path**: `/drafts/<your-name>/widgets-test`.

If you already have this test page, use it with only the service-booking heading and link for this exercise.

---

## Step 2: Add the Service-Booking Link

**Do not insert a block table, script snippet, iframe, or raw HTML.** The widget is referenced by a link to its `.html` file.

Under **Book an Appointment**, add:

```text
/widgets/service-booking/service-booking.html
```

1. Paste the path on its own line.
2. Ensure it is an actual clickable **link**. If the editor leaves plain text, select it and use the link toolbar to set the same URL as its target.
3. Keep that paragraph's content to **one link only**. Put explanatory text in a separate paragraph, and do not wrap the link in bold or a list.
4. Add no additional text or second link in the same paragraph.

Use a **root-relative widget link target** beginning with `/widgets/`, not a `localhost` or preview hostname. There are no required query parameters. The developer configures the hosted endpoint once in `widgets/service-booking/config.js`; authors do not supply backend URLs.

**Expected in the editor:** one ordinary link beneath the heading. The interactive widget renders on the delivered page, not inside the document editor.

Save your work and use **Preview** from the **Send** menu. Before implementation or instructor deployment, the delivered link may remain a link or show a loading failure. That is expected.

Keep this page as your test content throughout the exercise. You do not need to publish it to Live.

---

## Step 3: Verify the Hosted Booking API

The shared [Cloudflare Worker](worker/README.md) and D1 database are already deployed. Set `BOOKING_API_URL` in your widget's `config.js` to that endpoint using Step 4. An unset URL produces a visible setup error; it does not fall back to a local server.

Learners keep only the AEM development server running. Verify the shared endpoint in a terminal:

```bash
curl 'https://eds-labs-service-booking.aem-poc-lab.workers.dev/services?timeZone=Asia%2FKolkata'
```

The API contract is:

| Request | Response / purpose |
| --- | --- |
| `GET /services?timeZone=Asia%2FKolkata` | `{ services: [{ id, label }], minDate, maxDate, timeZone }`; local date bounds |
| `GET /slots?service=consultation&date=YYYY-MM-DD&timeZone=Asia%2FKolkata` | The query date is local; returns `{ slots: [{ date, slot }, ...] }` with UTC dates and times |
| `POST /bookings` | Accepts `{ service, date, slot, timeZone, name, email, requestId }`; date/time are UTC; returns `{ reference }` |

Errors return a non-success HTTP status and `{ error }`. A slot that has already been booked returns `409`.

The API accepts the browser's IANA `timeZone`. Date bounds and the queried availability date are local to that zone; returned slot identities, booking date/time fields, and database values are **UTC**. The widget displays calendar dates, available times, and confirmations in local time, with simple labels such as "9:00 AM". Availability covers tomorrow through 30 days ahead locally, with hourly starts from 9:00 AM through 4:00 PM and closing time at 5:00 PM. Each service/time can be booked once per UTC date. Repeating a request with the same request ID and details returns the original reference rather than booking twice. Calls without `timeZone` retain the UTC/string-array API shapes.

Bookings are persisted in D1, including across Worker deployments. The backend stores a hash of booking details for retry matching, not raw names or emails. A daily cleanup removes bookings for past UTC dates.

**Shared demo:** learners share availability. If another learner books your selected slot, choose a different date or time. The instructor can reset the demo database between sessions using the deployment guide.

The same HTTPS endpoint can serve localhost, branch Preview, and Live when their origins are allowed by the Worker. CORS is not authentication. This is a hosted demo, not a production-ready booking service: production also needs appropriate authentication/authorization, abuse controls, privacy policies, monitoring, and operational ownership.

---

## Step 4: Build the Service-Booking Widget

Create these files on your personal branch. The [completed demo](https://github.com/edsmasterclass/labs/tree/demo-exercise10/widgets/service-booking) is a reference, not widget code pre-installed on `main`:

```text
widgets/service-booking/
  service-booking.html
  service-booking.css
  service-booking.js
  calendar.js
  booking-time.js
  config.js
```

### Copy-paste setup and complete reference

Run from the repository root. The two advanced helpers are already supplied on `main`; copy them unchanged so you can concentrate on DOM events and `fetch`:

```bash
mkdir -p widgets/service-booking
cp labs/exercise10/support/calendar.js widgets/service-booking/calendar.js
cp labs/exercise10/support/booking-time.js widgets/service-booking/booking-time.js
```

Create `widgets/service-booking/config.js` with:

```javascript
const BOOKING_API_URL = 'https://eds-labs-service-booking.aem-poc-lab.workers.dev';

export default BOOKING_API_URL;
```

Create `widgets/widget-utils.js` with the error helper below. If this file already exists, integrate the helper without deleting unrelated exports:

```javascript
export default function showWidgetError(status, message, error) {
  status.hidden = false;
  status.textContent = message;
  status.setAttribute('role', 'alert');
  // eslint-disable-next-line no-console
  console.error(message, error);
}
```

**For a complete runnable starting point**, the commands below copy the exact HTML, CSS, and JavaScript from the demo reference. They do not switch your personal branch or deploy anything. Run them only before editing these files: `>` replaces an existing file, so keep your own changes first.

```bash
git fetch origin demo-exercise10
git show origin/demo-exercise10:widgets/service-booking/service-booking.html > widgets/service-booking/service-booking.html
git show origin/demo-exercise10:widgets/service-booking/service-booking.css > widgets/service-booking/service-booking.css
git show origin/demo-exercise10:widgets/service-booking/service-booking.js > widgets/service-booking/service-booking.js
```

Do not copy the demo's helper wrappers over your two copied helpers: those wrappers simply re-export the shared support modules. Your local copies are self-contained.

You now have all six widget files plus the error helper. Use the samples below to understand and adapt the implementation on your own branch. Alternatively, write the three application files yourself following the requirements and consult the complete reference when needed. The short samples are **excerpts**, not replacements for the complete files; the reference also includes request-version guards, retry IDs, error recovery, and the confirmation queue.

### Wire the widget loader once

Search `scripts/scripts.js` for `buildWidgetAutoBlocks`. If it already exists and is called inside `buildAutoBlocks(main)`, skip this section.

For the current `main` baseline, add this import alongside the existing imports in `scripts/scripts.js`:

```javascript
import buildWidgetAutoBlocks from '../labs/exercise10/support/widget-loader.js';
```

Inside the existing `buildAutoBlocks(main)` function, immediately after `buildHeroBlock(main);`, add:

```javascript
buildWidgetAutoBlocks(main);
```

Do not replace the entire function: preserve its other auto-blocking logic. Do not modify `scripts/aem.js`. The [supplied loader](support/widget-loader.js) loads a standalone same-origin `/widgets/*.html` link, its matching CSS, and its default JavaScript decorator. Missing files or decorators produce a visible, logged error. This exercise does not use query parameters.

### Code samples: follow the main flow

#### 1. Native contact validation

Inside the form's contact region, use labeled native inputs. The dotted-domain pattern supplements browser email validation to match the Worker's domain requirement:

```html
<div class="service-booking-contact">
  <label><span>Name <span class="service-booking-required" aria-hidden="true">*</span></span>
    <input type="text" name="name" autocomplete="name" maxlength="100" required>
  </label>
  <label><span>Email <span class="service-booking-required" aria-hidden="true">*</span></span>
    <input type="email" name="email" autocomplete="email" maxlength="254"
      pattern="[^\s@]+@[^\s@]+\.[^\s@]+"
      title="Enter an email with a dotted domain, such as name@example.com." required>
  </label>
</div>
```

Native required fields do not reject a name made only of spaces; `updateSubmitState()` also checks trimmed values.

#### 2. Keep errors in normal layout

Use these scoped rules for a visible error that cannot cover the submit button. Normal progress uses `role="status"`; the reference visually hides that status while retaining live announcements.

```css
.service-booking .service-booking-required {
  color: #b32d00;
}

.service-booking .service-booking-status[role="alert"] {
  margin-top: 16px;
  border: 1px solid #e0a18b;
  border-radius: 12px;
  padding: 16px;
  background: #fff3ed;
  color: #b32d00;
}
```

Do not add `position: fixed` to errors. Only success confirmations use the fixed notification queue.

#### 3. Make requests and retain HTTP status

Inside the decorator, `api` is the validated configured URL. The reference uses this request helper and an error class declared above the decorator:

```javascript
class BookingRequestError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// Inside decorate(), after validating api:
const request = async (path, options = {}) => {
  const response = await fetch(new URL(path, api), {
    ...options,
    signal: AbortSignal.timeout(10000),
    credentials: 'omit',
  });
  const data = await response.json();
  if (!response.ok) {
    throw new BookingRequestError(response.status, data.error || `Booking API returned HTTP ${response.status}.`);
  }
  return data;
};
```

#### 4. Load services and query local availability

These statements belong in `initialize()` and `loadSlots()` respectively; keep the reference's response validation and stale-response guard around them:

```javascript
const clock = createBookingClock();
const servicesQuery = new URLSearchParams({ timeZone: clock.timeZone });
const servicesData = await request(`services?${servicesQuery}`);
service.replaceChildren(...servicesData.services.map((item) => new Option(item.label, item.id)));
date.min = servicesData.minDate;
date.max = servicesData.maxDate;
date.value = servicesData.minDate;

const slotsQuery = new URLSearchParams({
  service: service.value,
  date: date.value,
  timeZone: clock.timeZone,
});
const slotsData = await request(`slots?${slotsQuery}`);
```

The selected date is local, but each returned slot has a UTC `date` and `slot`. Store those identities on its radio rather than sending a formatted display label.

#### 5. React to input before submitting

Inside `decorate()`, after obtaining the form elements:

```javascript
const updateSubmitState = () => {
  const time = form.querySelector('[name="slot"]:checked')?.value;
  submit.disabled = fieldset.disabled || !time || !name.value.trim()
    || !email.value.trim() || !name.validity.valid || !email.validity.valid;
};

times.addEventListener('change', updateSubmitState);
name.addEventListener('input', updateSubmitState);
email.addEventListener('input', updateSubmitState);
```

#### 6. Build a UTC payload and confirm before refresh

The reference's submit handler begins with `event.preventDefault()` and native validity checks. Its main payload/success sequence is:

```javascript
const values = Object.fromEntries(new FormData(form));
const selectedTime = form.querySelector('[name="slot"]:checked');
values.date = selectedTime.dataset.utcDate;
values.slot = selectedTime.dataset.utcSlot;
values.timeZone = clock.timeZone;
values.name = values.name.trim();
values.email = values.email.trim();

const signature = JSON.stringify(values);
if (attempt?.signature !== signature) {
  attempt = { signature, requestId: crypto.randomUUID() };
}
fieldset.disabled = true;
const data = await request('bookings', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ ...values, requestId: attempt.requestId }),
});
if (typeof data.reference !== 'string' || !data.reference) {
  throw new Error('Invalid booking confirmation.');
}
attempt = undefined;
showConfirmation(`Thank you ${values.name}, your appointment for ${clock.formatAppointment(values.date, values.slot)} is confirmed.`);
await loadSlots();
```

Keep this inside the complete handler's `try`/`catch`/`finally`: `409` refreshes and clears selection; uncertain failures retain the attempt; `finally` re-enables the fieldset and updates submission state. Do not replace it with an unguarded POST. `showConfirmation()` queues a notice immediately; availability refresh must not delay the already-confirmed booking.

### Read the implementation in this order

Follow the main journey first; the advanced helpers support it but are not algorithms you need to derive during this 60-90-minute lab.

```text
authored link -> widget loader -> decorate() -> initialize() -> loadSlots()
             -> selection/contact events -> POST booking -> Worker validation
             -> D1 reservation -> confirmation
```

1. **Link and loader:** the author supplies one widget HTML link. The loader wired above replaces it with the widget, loads its HTML/CSS, and calls its default decorator. You do not need to derive the loader yourself.
2. **Set up the widget:** `decorate()` in your `service-booking.js` finds the form elements and attaches event handlers. `initialize()` validates the configured endpoint, fetches services/local date bounds, builds the calendar, and calls `loadSlots()`.
3. **Show availability:** `loadSlots()` clears the old selection, fetches the chosen service/local date's UTC slot identities, and creates labeled radio inputs. The hidden date input stores the calendar choice without showing another picker; clipped radios remain native keyboard/screen-reader controls, with their labels providing the visible buttons.
4. **React to input:** calendar activation or a service change loads fresh slots. Radio/contact events call `updateSubmitState()`; a slot, nonblank name, and valid email are all needed to enable booking. Arrow keys move calendar focus; Enter/Space selects the focused date.
5. **Submit:** the form handler prevents normal page navigation, reads `FormData`, uses the radio's UTC date/time, and posts the details plus `requestId`. It disables the form while waiting.
6. **Validate and reserve:** the Worker routes `POST /bookings` to `createBooking()`. `readBooking()` limits/parses the body; [booking-model.js](worker/booking-model.js) validates it again because requests can bypass the browser. D1 reserves a unique service/UTC date/time. A new booking returns `201`; an identical retry returns `200` with the same reference; conflicts return `409`.
7. **Finish:** success queues a personalized green confirmation immediately, then refreshes availability. A conflict clears the stale selection and refreshes slots; an uncertain failure retains the request ID for a safe unchanged retry.

**Advanced supporting logic - understand its purpose, then use the reference:**

| Topic | Purpose and where to read |
| --- | --- |
| Time-zone conversion | [booking-time.js](support/booking-time.js) corrects a UTC guess until its local clock matches the requested date/time, using that date's offset/DST rules. For example, `2026-10-09 09:00` in `Asia/Kolkata` returns UTC `{ date: "2026-10-09", slot: "03:30" }`. [calendar.js](support/calendar.js) separately uses UTC arithmetic for date-only tokens; that does not make displayed dates UTC appointments. |
| Concurrency and safe retries | The widget's `requestVersion` ignores older availability responses that finish late. A request ID identifies one booking attempt; [worker.js](worker/worker.js) compares the details hash, and [the SQL schema](worker/schema/0001_bookings.sql) enforces uniqueness for both request IDs and appointment slots. A D1 insert/lookup transaction makes this safe even when learners submit together. |
| Confirmation queuing | Form/request/timer state is per widget. Only the module-level FIFO is shared, so fixed notices cannot cover each other. A notice starts its eight-second timer when displayed, not while queued; close or expiry reveals the next, and hover/focus pauses dismissal. |

### Markup and styling

Provide:

- A labeled service select.
- An inline month calendar with previous/next buttons, accessible date buttons, and a hidden date input.
- An available-times region using labeled native radio controls.
- Labeled name and email inputs with red required asterisks, appropriate autocomplete, and native required-field validation. Hide the decorative asterisks from assistive technology.
- A **Book Appointment** submit button, disabled until a time and valid contact details are provided.
- A welcoming introduction, fixed green confirmation with automatic dismissal, live status messages, and retry controls.

Scope CSS beneath `.service-booking`. Start with a single-column mobile layout, then use a `min-width` breakpoint for side-by-side calendar and time controls. Keep focus indicators visible.

Name and Email inputs use matching 48px heights. Stack them at full width below 600px; use equal-width columns with aligned inputs at 600px and wider. Keep label contents top-aligned so additional autofill/helper elements cannot stretch one label's rows and offset its input.

### Calendar and availability

Export a default async `decorate(widgetRoot)` function from `service-booking.js`. Use `calendar.js` for date-only parsing, month rendering, and keyboard navigation. Its UTC arithmetic keeps date-only values stable; these values represent local calendar dates in the widget. Use `booking-time.js` to convert UTC appointment instants to the browser's time zone.

1. Import `BOOKING_API_URL` from `config.js` and validate it as an HTTPS URL without embedded credentials, query parameters, or a fragment. Do not read an author-supplied `api` parameter.
2. Fetch and validate services and the allowed date range before enabling the form.
3. Send the detected browser time zone to the API and use its local date bounds to disable out-of-range dates and month navigation.
4. Support arrow keys to move date focus; Enter or Space selects the focused date.
5. Fetch available times for the selected local date and time zone when the service or date changes.
6. Clear the old time selection while loading. Ignore stale responses from earlier selections.
7. Validate each returned UTC slot against the selected local date and hourly 9:00 AM–4:00 PM working hours, sort by instant, and render native radio controls with simple local-time labels. Preserve UTC slot identity across midnight and daylight-saving changes. Show a clear no-availability message when needed.
8. Enable submission only after a time, nonblank name, and valid email are provided.

### Booking and error handling

1. Validate required name/email fields and reject whitespace-only contact details. Add an email `pattern` requiring a dotted domain, matching the Worker's rule as well as native email validation.
2. Submit the selected service, UTC date/time, browser `timeZone`, fictitious name/email, and a generated UUID `requestId`.
3. Disable the form during submission to prevent overlapping bookings.
4. Preserve the request ID when retrying unchanged details after an uncertain network/server failure. For `409` conflicts, clear the stale time selection, refresh availability, and require a new selection rather than advising an unchanged retry. Keep refresh failures visible with their retry control.
5. Validate the returned confirmation reference, queue a personalized green confirmation with the local appointment date/time immediately, then refresh availability. Do not delay confirmation until that refresh completes. Queue confirmations across instances so only one fixed green notice is visible at a time, without layout shifts. Each notice dismisses after eight seconds or via its close button; hover/focus pauses dismissal.

Keep errors in the widget's normal layout rather than fixed over viewport controls. A failed post-booking refresh must show its availability error and retry control without hiding the successful confirmation or suggesting that the booking failed.
6. Show and log API/configuration failures explicitly, with retry controls for initialization and availability.
7. Keep each widget instance's form, selection, status, and request state independent.

Use DOM APIs and `textContent` for results and errors rather than interpolating visitor input into HTML. Reuse the `showWidgetError()` helper created above rather than importing the page entry point into the widget.

---

## Step 5: Preview and Test Locally

1. Return to your `widgets-test` page in Experience Workspace.
2. Save and select **Send > Preview** after any content/link changes.
3. Open **the authored page**, not the raw widget HTML:

   ```text
   http://localhost:3000/drafts/<your-name>/widgets-test
   ```

4. Verify services, the calendar, and available time controls load from the hosted API.
5. Select a highlighted date and an available time. Verify times use the browser's local time zone with clean labels and no redundant selection summary appears.
6. Enter a fictitious name and email, then select **Book Appointment**.
7. Verify a personalized green confirmation appears with the local date/time, disappears without moving the form, and the booked time is removed from that service/date's availability.
8. Change the date or service. Verify the selected time clears and fresh availability loads.
9. Test month navigation, keyboard date selection, keyboard time selection, visible focus, and mobile layout.

**Important environment distinction:** `localhost` runs your uncommitted widget code. A branch `.aem.page` URL uses pushed code. Both use the same configured HTTPS booking endpoint; no authored link changes are needed. The instructor must allow the page's origin in the Worker configuration.

---

## Step 6: Test Error Handling and Multiple Instances

On your authored page, add a second **Book an Appointment** heading with the same standalone link:

```text
/widgets/service-booking/service-booking.html
```

Save and preview again. Changing selections or contact fields in one instance must not change the other. Both instances intentionally share backend availability: if one books a slot, the other cannot book that same slot and should handle the API's conflict response.

Also check:

- An unset or malformed endpoint in `config.js` shows a visible configuration error.
- Blocking the hosted API request in browser developer tools shows a useful failure rather than an endless loading message.
- Unblocking the request and using the appropriate retry control restores operation.
- Blank required fields, invalid email (including `name@example` without a dotted domain), and whitespace-only contact details cannot submit a booking.
- Dates outside the allowed range cannot be selected.
- Rapid date/service changes do not display stale availability.
- A date/service with all slots booked shows no-availability guidance.
- An uncertain network/server failure preserves the request ID for a retry with unchanged details.
- A `409` conflict clears the stale time selection, refreshes availability, and disables booking until another available time is selected. A failed refresh remains visible and offers a retry.
- A successful booking queues confirmation before availability refresh finishes, clears the selected time, and refreshes availability. A delayed or failed refresh must not delay confirmation.
- Persistent errors remain readable in normal layout without overlapping the submit button, including on mobile.
- Successful bookings in multiple instances queue their confirmations: only one is visible, closing/dismissing it reveals the next, and each gets its own eight-second display with hover/focus pause.
- The browser console has no unexpected errors.

Intentional error cases should display useful errors and produce corresponding logs; distinguish those from unexpected failures. Do not disrupt the shared hosted API to test failures.

---

## Step 7: Validate and Commit Your Changes

From the repository root:

```bash
npm run lint
npx eslint widgets/widget-utils.js widgets/service-booking/*.js
npx stylelint widgets/service-booking/service-booking.css
```

The explicit Stylelint command is necessary because `npm run lint:css` does not currently include widgets.

Stage only files you intentionally changed after validation. For example, if you implemented the widget and its error helper:

```bash
git add widgets/widget-utils.js widgets/service-booking
git commit -m "feat(widgets): add service-booking widget"
```

If you wired the supplied loader, also stage `scripts/scripts.js`. Do not stage unrelated changes.

If you also changed the Worker, run `wrangler deploy --dry-run` in `labs/exercise10/worker` and stage those specific files too. The Worker folder contains only source, configuration, database setup SQL in `schema/`, and deployment instructions, following the Exercise 6 pattern; no separate package installation or test runner is required. Use the browser checks above and the [deployment guide](worker/README.md) to verify the hosted API. Continue working on your personal branch; do not push the shared instructor branch.

---

## Troubleshooting

| Symptom | What to check |
| --- | --- |
| The widget stays a link | Confirm it is a clickable link, is alone in a paragraph, and ends in `.html` before the query |
| Widget loading fails | Confirm the HTML/CSS/JS paths exist and check the Network panel and error log |
| Services or times do not load | Check the configured HTTPS endpoint, its `/services` response, the D1 schema setup, and the Worker's allowed origins |
| Booking reports a taken slot | Availability refreshes automatically and the stale selection clears; select another available time, or retry loading availability if the refresh failed |
| Works locally but not on remote Preview | Push your personal code branch and allow the preview origin in the Worker's CORS configuration |
| Page changes are missing | Save and Preview the authored document again |
| Dates or times look different from the API | The API uses UTC; the widget converts appointments to the browser's local time zone |
| Demo bookings disappear | Past-date bookings are cleaned up daily; an instructor reset also clears demo availability |
| Raw HTML has no behavior | Open the authored page; raw widget markup alone does not initialize the widget |

---

## Verification Checklist

- [ ] Explain the block/widget distinction.
- [ ] Create and preview a real authored service-booking test page.
- [ ] Insert the service-booking widget as a standalone link beneath its heading.
- [ ] Verify the configured hosted API's services response; no local booking server is needed.
- [ ] Render services, the local-time calendar, and available times inside the authored page while retaining UTC slot identity for the API.
- [ ] Verify date-range limits, month navigation, and keyboard interaction.
- [ ] Book with fictitious details and verify the personalized local-time confirmation.
- [ ] Verify the booked slot disappears and date/service changes clear the selected time.
- [ ] Validate errors, retries, multiple instances, accessibility, and responsive behavior.
- [ ] Verify API/calendar behavior in the browser, run repository lint, and run explicit widget lint.
- [ ] Understand shared availability, D1 persistence, and the hosted demo's production limitations.

---

## Key Takeaways

- Blocks enhance authored content; the service-booking widget brings its own application markup and behavior.
- Authors place the widget with a link, not a table or embed script.
- The developer configures one public HTTPS endpoint in code; authors insert only the widget link.
- Booking requires backend validation, explicit failures, and safe retries as well as frontend form validation.
- Test with your own previewed document and local code before deploying.
- This demo is not a production booking service.

---

## References

- [Official AEM widgets documentation](https://www.aem.live/docs/widgets)
- [Hosted Worker deployment and API contract](worker/README.md)
- [Setup](../SETUP.md)

---

## Solution

The complete solution is on the **demo branch**, not pre-installed on `main`:

- [Service-booking widget](https://github.com/edsmasterclass/labs/tree/demo-exercise10/widgets/service-booking)
- [Widget error helper](https://github.com/edsmasterclass/labs/blob/demo-exercise10/widgets/widget-utils.js)
- [Booking endpoint configuration](https://github.com/edsmasterclass/labs/blob/demo-exercise10/widgets/service-booking/config.js)
- [Reusable calendar/time helpers and loader](support/)
- [Cloudflare Worker, Wrangler configuration, and schema](worker/)

Use Step 4's copy-paste commands to bring the reference onto your own branch without checking out the instructor's branch. Keep your authored test content in your personal drafts folder.
