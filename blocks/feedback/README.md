# Feedback Block

Collects event feedback and submits it to a Worker endpoint.

## Expected submission payload

The block submits JSON to the configured endpoint:

```json
{
  "fullName": "Jane Doe",
  "email": "jane@example.com",
  "feedback": "Great session!"
}
```

## Authoring model

- Row 1: Edge Worker endpoint URL
- Row 2: Rich content containing location, address, heading, description

Example:

```html
<div class="feedback">
  <div>
    <div><a href="https://masterclass-feedback.aem-poc-lab.workers.dev">https://masterclass-feedback.aem-poc-lab.workers.dev</a></div>
  </div>
  <div>
    <div>
      <p><strong><u>New York City</u></strong></p>
      <p>1540 Broadway, 18th floor<br>New York, NY 10036</p>
      <h2>AEM Master Class - NYC | Feedback</h2>
      <p>Thank you for attending - we'd love your feedback.</p>
    </div>
  </div>
  <div><div></div></div>
  <div><div></div></div>
  <div><div></div></div>
</div>
```

## Notes

- Use a heading (`h1/h2/h3`) in row 2 for the form title.
- Use a paragraph after the heading for the form description.
- Use a paragraph with `<br>` for multi-line address.
