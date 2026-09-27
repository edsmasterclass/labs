// eslint-disable-next-line import/no-unresolved -- Loaded by the browser from DA.live.
import DA_SDK from 'https://da.live/nx/utils/sdk.js';

const { token, actions } = await DA_SDK;
const speakerList = document.querySelector('#speaker-list');

// Fetch speakers with auth
const response = await fetch('/speakers.json', {
  headers: { Authorization: `Bearer ${token}` },
});
const { data } = await response.json();

// Display in plugin UI, insert on click
data.forEach((speaker) => {
  const button = document.createElement('button');
  button.textContent = speaker.Name;
  button.onclick = async () => {
    await actions.sendText(`## ${speaker.Name}\n${speaker.Bio}`);
    await actions.closeLibrary();
  };
  speakerList.appendChild(button);
});
