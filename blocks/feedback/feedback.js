/**
 * Feedback block
 * Configuration from block rows:
 * Row 1: Worker endpoint URL
 * Row 2: Structured details content:
 *        - location (preferably in <p><strong>...</strong></p>)
 *        - address (supports <br>)
 *        - title (h1/h2/h3)
 *        - description (paragraph after heading)
 */

function createFieldWrapper(type, className = '') {
  const wrapper = document.createElement('div');
  wrapper.className = `field-wrapper ${type}-wrapper ${className}`.trim();
  return wrapper;
}

function createLabel(text, forId, required = false) {
  const label = document.createElement('label');
  label.textContent = text;
  label.setAttribute('for', forId);
  if (required) {
    label.dataset.required = true;
  }
  return label;
}

function createInput(type, name, id, placeholder = '', required = false) {
  const input = document.createElement('input');
  input.type = type;
  input.name = name;
  input.id = id;
  input.placeholder = placeholder;
  input.required = required;
  return input;
}

function getRowText(row) {
  return row ? row.textContent.trim() : '';
}

function extractFromRichDetails(row) {
  if (!row) return {};

  const content = row.querySelector(':scope > div') || row;
  const heading = content.querySelector('h1, h2, h3');
  const paragraphs = [...content.querySelectorAll('p')];

  const locationStrong = content.querySelector('p strong, p b');
  const location = (locationStrong?.textContent || paragraphs[0]?.textContent || '').trim();

  const addressParagraph = paragraphs.find((p) => p.innerHTML.includes('<br'))
    || paragraphs.find((p) => p !== heading?.closest('p') && p.textContent.trim() !== location);
  const address = (addressParagraph?.innerHTML || '').trim();

  let description = '';
  if (heading) {
    let cursor = heading.nextElementSibling;
    while (cursor && !description) {
      if (cursor.tagName === 'P' && cursor.textContent.trim()) {
        description = cursor.textContent.trim();
      }
      cursor = cursor.nextElementSibling;
    }
  }

  return {
    location,
    address,
    title: heading?.textContent.trim() || '',
    description,
  };
}

function extractConfig(block) {
  const rows = [...block.querySelectorAll(':scope > div')];
  const endpointLink = rows[0]?.querySelector('a[href]');
  const richDetails = extractFromRichDetails(rows[1]);

  return {
    submitUrl: endpointLink?.href || getRowText(rows[0]),
    location: richDetails.location,
    address: richDetails.address,
    title: richDetails.title || 'Share Your Feedback',
    description: richDetails.description,
  };
}

function createFeedbackForm(config) {
  const {
    submitUrl,
    location,
    address,
    title,
    description,
  } = config;

  const form = document.createElement('form');
  form.className = 'feedback-form';
  form.dataset.action = submitUrl;
  form.dataset.location = location;

  const header = document.createElement('div');
  header.className = 'form-header';

  const formTitle = document.createElement('h2');
  formTitle.textContent = title;
  formTitle.className = 'form-title';
  header.appendChild(formTitle);

  if (description) {
    const formDescription = document.createElement('p');
    formDescription.textContent = description;
    formDescription.className = 'form-description';
    header.appendChild(formDescription);
  }

  const locationInfo = document.createElement('div');
  locationInfo.className = 'location-info';
  if (location) {
    const locationBadge = document.createElement('div');
    locationBadge.className = 'location-badge';
    locationBadge.innerHTML = `<span class="location-icon">📍</span><span class="location-text">${location}</span>`;
    locationInfo.appendChild(locationBadge);
  }

  if (address) {
    const addressElement = document.createElement('p');
    addressElement.className = 'event-address';
    addressElement.innerHTML = address;
    locationInfo.appendChild(addressElement);
  }

  if (location || address) {
    header.appendChild(locationInfo);
  }

  form.appendChild(header);

  const fieldsContainer = document.createElement('div');
  fieldsContainer.className = 'form-fields';

  const fullNameWrapper = createFieldWrapper('text', 'fullname-wrapper');
  const fullNameLabel = createLabel('Full Name', 'feedback-fullname', true);
  const fullNameInput = createInput('text', 'fullName', 'feedback-fullname', 'Full name', true);
  fullNameWrapper.append(fullNameLabel, fullNameInput);
  fieldsContainer.appendChild(fullNameWrapper);

  const emailWrapper = createFieldWrapper('email');
  const emailLabel = createLabel('Email Address', 'feedback-email', true);
  const emailInput = createInput('email', 'email', 'feedback-email', 'your.email@company.com', true);
  emailWrapper.append(emailLabel, emailInput);
  fieldsContainer.appendChild(emailWrapper);

  const messageWrapper = createFieldWrapper('textarea', 'message-wrapper');
  const messageLabel = createLabel('Your Feedback', 'feedback-message', true);
  const message = document.createElement('textarea');
  message.id = 'feedback-message';
  message.name = 'feedback';
  message.required = true;
  message.rows = 5;
  message.placeholder = 'Share your thoughts about the event...';
  messageWrapper.append(messageLabel, message);
  fieldsContainer.appendChild(messageWrapper);

  form.appendChild(fieldsContainer);

  const submitWrapper = createFieldWrapper('submit');
  const submitButton = document.createElement('button');
  submitButton.type = 'submit';
  submitButton.textContent = 'Submit Feedback';
  submitButton.className = 'button primary';
  submitWrapper.appendChild(submitButton);
  form.appendChild(submitWrapper);

  return form;
}

async function handleSubmit(form, submitUrl) {
  if (form.getAttribute('data-submitting') === 'true') return;

  const submitButton = form.querySelector('button[type="submit"]');
  let isSuccess = false;

  try {
    form.setAttribute('data-submitting', 'true');
    submitButton.disabled = true;
    submitButton.textContent = 'Sending...';

    const formData = new FormData(form);
    const payload = {
      fullName: (formData.get('fullName') || '').toString().trim(),
      email: (formData.get('email') || '').toString().trim(),
      feedback: (formData.get('feedback') || '').toString().trim(),
    };

    const response = await fetch(submitUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      isSuccess = true;
      form.innerHTML = `
        <div class="success-message">
          <h3>Thank You!</h3>
          <p>Your feedback has been submitted successfully.</p>
        </div>
      `;
    } else {
      throw new Error(`Submission failed with status: ${response.status}`);
    }
  } catch (error) {
    const existingError = form.querySelector('.error-message');
    if (existingError) {
      existingError.remove();
    }

    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `
      <p>Sorry, there was an error processing your feedback. Please try again later.</p>
    `;
    form.insertBefore(errorDiv, form.firstChild);
  } finally {
    if (!isSuccess && submitButton && submitButton.parentNode) {
      form.setAttribute('data-submitting', 'false');
      submitButton.disabled = false;
      submitButton.textContent = 'Submit Feedback';
    } else if (!isSuccess) {
      form.setAttribute('data-submitting', 'false');
    }
  }
}

export default function decorate(block) {
  const config = extractConfig(block);

  if (!config.submitUrl) {
    block.innerHTML = '<p class="error-message">Error: Feedback endpoint URL is required.</p>';
    return;
  }

  const form = createFeedbackForm(config);
  block.replaceChildren(form);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (form.checkValidity()) {
      handleSubmit(form, config.submitUrl);
      return;
    }

    const firstInvalidField = form.querySelector(':invalid:not(fieldset)');
    if (firstInvalidField) {
      firstInvalidField.focus();
      firstInvalidField.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });
}
