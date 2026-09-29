/**
 * MC Register Block
 * A registration form that submits to an n8n webhook
 * Configuration is read from the block content:
 *   Row 1: Webhook URL
 *   Row 2: Location name
 *   Row 3: Event address/venue
 *   Row 4: (Optional) Form title
 *   Row 5: (Optional) Form description
 */

/**
 * Creates a field wrapper element
 * @param {string} type - The field type
 * @param {string} className - Additional CSS class
 * @returns {HTMLDivElement} Field wrapper element
 */
function createFieldWrapper(type, className = '') {
  const wrapper = document.createElement('div');
  wrapper.className = `field-wrapper ${type}-wrapper ${className}`.trim();
  return wrapper;
}

/**
 * Creates a label element
 * @param {string} text - Label text
 * @param {string} forId - ID of the associated field
 * @param {boolean} required - Whether the field is required
 * @returns {HTMLLabelElement} Label element
 */
function createLabel(text, forId, required = false) {
  const label = document.createElement('label');
  label.textContent = text;
  label.setAttribute('for', forId);
  if (required) {
    label.dataset.required = true;
  }
  return label;
}

/**
 * Creates an input field
 * @param {string} type - Input type
 * @param {string} name - Field name
 * @param {string} id - Field ID
 * @param {string} placeholder - Placeholder text
 * @param {boolean} required - Whether the field is required
 * @returns {HTMLInputElement} Input element
 */
function createInput(type, name, id, placeholder = '', required = false) {
  const input = document.createElement('input');
  input.type = type;
  input.name = name;
  input.id = id;
  input.placeholder = placeholder;
  input.required = required;
  return input;
}

function createErrorParagraph(message) {
  const paragraph = document.createElement('p');
  paragraph.textContent = message;
  return paragraph;
}

/**
 * Generates the form payload for submission
 * @param {HTMLFormElement} form - The form element
 * @param {string} location - The location value
 * @param {string} address - The event address
 * @returns {Object} Form data payload
 */
function generatePayload(form, location, address) {
  const payload = {};
  const formData = new FormData(form);

  Array.from(formData.entries()).forEach(([key, value]) => {
    payload[key] = value;
  });

  // Add location, address, and timestamp
  payload.location = location;
  payload.address = address;
  payload.timestamp = new Date().toISOString();

  return payload;
}

/**
 * Handles form submission
 * @param {HTMLFormElement} form - The form element
 * @param {string} submitUrl - The submission URL
 * @param {string} location - The location value
 * @param {string} address - The event address
 */
async function handleSubmit(form, submitUrl, location, address) {
  if (form.getAttribute('data-submitting') === 'true') return;

  const submitButton = form.querySelector('button[type="submit"]');
  let isSuccess = false;

  try {
    form.setAttribute('data-submitting', 'true');
    submitButton.disabled = true;
    submitButton.textContent = 'Registering...';

    const payload = generatePayload(form, location, address);

    // Create form-encoded data to avoid CORS preflight request
    const formData = new URLSearchParams();

    // Add all form fields as individual parameters
    Object.entries(payload).forEach(([key, value]) => {
      formData.append(key, value || '');
    });

    const response = await fetch(submitUrl, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    if (response.ok) {
      isSuccess = true;
      // Show success message
      const successContainer = document.createElement('div');
      successContainer.className = 'success-message';

      const successHeading = document.createElement('h3');
      successHeading.textContent = 'Registration Successful!';
      const successCopy = document.createElement('p');
      successCopy.textContent = 'Thank you for registering. We\'ve received your information and will be in touch soon with further details.';

      successContainer.append(successHeading, successCopy);
      form.replaceChildren(successContainer);
    } else {
      throw new Error(`Registration failed with status: ${response.status}`);
    }
  } catch (error) {
    // Show error message
    const existingError = form.querySelector('.error-message');
    if (existingError) {
      existingError.remove();
    }

    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.append(createErrorParagraph('Sorry, there was an error processing your registration. Please try again later.'));
    form.insertBefore(errorDiv, form.firstChild);
  } finally {
    // Only restore button state if submission failed
    if (!isSuccess && submitButton && submitButton.parentNode) {
      form.setAttribute('data-submitting', 'false');
      submitButton.disabled = false;
      submitButton.textContent = 'Register';
    } else if (!isSuccess) {
      form.setAttribute('data-submitting', 'false');
    }
  }
}

/**
 * Creates the registration form
 * @param {Object} config - Configuration object
 * @param {string} config.submitUrl - The URL to submit the form to
 * @param {string} config.location - The location name
 * @param {string} config.address - The event address/venue
 * @param {string} config.title - Form title
 * @param {string} config.description - Form description
 * @returns {HTMLFormElement} The complete form element
 */
function createRegistrationForm(config) {
  const {
    submitUrl,
    location,
    address = '',
    title = 'Register',
    description = '',
  } = config;

  const form = document.createElement('form');
  form.className = 'mc-register-form';
  form.dataset.action = submitUrl;
  form.dataset.location = location;

  // Form header
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

  // Location info container
  const locationInfo = document.createElement('div');
  locationInfo.className = 'location-info';

  // Location badge
  const locationBadge = document.createElement('div');
  locationBadge.className = 'location-badge';
  const locationIcon = document.createElement('span');
  locationIcon.className = 'location-icon';
  locationIcon.textContent = '📍';
  const locationText = document.createElement('span');
  locationText.className = 'location-text';
  locationText.textContent = location;
  locationBadge.append(locationIcon, locationText);
  locationInfo.appendChild(locationBadge);

  // Event address
  if (address) {
    const addressElement = document.createElement('p');
    addressElement.className = 'event-address';
    addressElement.textContent = address;
    locationInfo.appendChild(addressElement);
  }

  header.appendChild(locationInfo);

  form.appendChild(header);

  // Form fields container
  const fieldsContainer = document.createElement('div');
  fieldsContainer.className = 'form-fields';

  // First Name field
  const firstNameWrapper = createFieldWrapper('text');
  const firstNameInput = createInput('text', 'firstName', 'mc-register-firstname', 'First name', true);
  const firstNameLabel = createLabel('First Name', 'mc-register-firstname', true);
  firstNameWrapper.appendChild(firstNameLabel);
  firstNameWrapper.appendChild(firstNameInput);
  fieldsContainer.appendChild(firstNameWrapper);

  // Last Name field
  const lastNameWrapper = createFieldWrapper('text');
  const lastNameInput = createInput('text', 'lastName', 'mc-register-lastname', 'Last name', true);
  const lastNameLabel = createLabel('Last Name', 'mc-register-lastname', true);
  lastNameWrapper.appendChild(lastNameLabel);
  lastNameWrapper.appendChild(lastNameInput);
  fieldsContainer.appendChild(lastNameWrapper);

  // Email field
  const emailWrapper = createFieldWrapper('email');
  const emailInput = createInput('email', 'email', 'mc-register-email', 'your.email@company.com', true);
  const emailLabel = createLabel('Email Address', 'mc-register-email', true);
  emailWrapper.appendChild(emailLabel);
  emailWrapper.appendChild(emailInput);
  fieldsContainer.appendChild(emailWrapper);

  // Company field
  const companyWrapper = createFieldWrapper('text');
  const companyInput = createInput('text', 'company', 'mc-register-company', 'Your company name');
  const companyLabel = createLabel('Company/Organization', 'mc-register-company');
  companyWrapper.appendChild(companyLabel);
  companyWrapper.appendChild(companyInput);
  fieldsContainer.appendChild(companyWrapper);

  // Job Title field
  const jobTitleWrapper = createFieldWrapper('text');
  const jobTitleInput = createInput('text', 'jobTitle', 'mc-register-jobtitle', 'Your job title');
  const jobTitleLabel = createLabel('Job Title', 'mc-register-jobtitle');
  jobTitleWrapper.appendChild(jobTitleLabel);
  jobTitleWrapper.appendChild(jobTitleInput);
  fieldsContainer.appendChild(jobTitleWrapper);

  form.appendChild(fieldsContainer);

  // Submit button
  const submitWrapper = createFieldWrapper('submit');
  const submitButton = document.createElement('button');
  submitButton.type = 'submit';
  submitButton.textContent = 'Register';
  submitButton.className = 'button primary';
  submitWrapper.appendChild(submitButton);
  form.appendChild(submitWrapper);

  return form;
}

/**
 * Extracts configuration from block content
 * @param {Element} block - The block element
 * @returns {Object} Configuration object
 */
function extractConfig(block) {
  const rows = block.querySelectorAll(':scope > div');
  const config = {
    submitUrl: '',
    location: '',
    address: '',
    title: 'Register',
    description: '',
  };

  rows.forEach((row, index) => {
    const content = row.textContent.trim();
    switch (index) {
      case 0:
        config.submitUrl = content;
        break;
      case 1:
        config.location = content;
        break;
      case 2:
        config.address = content;
        break;
      case 3:
        if (content) config.title = content;
        break;
      case 4:
        if (content) config.description = content;
        break;
      default:
        break;
    }
  });

  return config;
}

/**
 * Decorates the mc-register block
 * @param {Element} block - The block element
 */
export default async function decorate(block) {
  // Extract configuration from block content
  const config = extractConfig(block);

  // Validate required configuration
  if (!config.submitUrl) {
    const error = document.createElement('p');
    error.className = 'error-message';
    error.textContent = 'Error: Webhook URL is required. Please configure the block with a valid n8n webhook URL.';
    block.replaceChildren(error);
    return;
  }

  if (!config.location) {
    const error = document.createElement('p');
    error.className = 'error-message';
    error.textContent = 'Error: Location is required. Please configure the block with a location name.';
    block.replaceChildren(error);
    return;
  }

  // Create the form
  const form = createRegistrationForm(config);

  // Replace block content with the form
  block.replaceChildren(form);

  // Add form submission handler
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const valid = form.checkValidity();

    if (valid) {
      handleSubmit(form, config.submitUrl, config.location, config.address);
    } else {
      // Focus on first invalid field
      const firstInvalidField = form.querySelector(':invalid:not(fieldset)');
      if (firstInvalidField) {
        firstInvalidField.focus();
        firstInvalidField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  });
}
