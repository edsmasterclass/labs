export default function showWidgetError(status, message, error) {
  status.hidden = false;
  status.textContent = message;
  status.setAttribute('role', 'alert');
  // eslint-disable-next-line no-console
  console.error(message, error);
}
