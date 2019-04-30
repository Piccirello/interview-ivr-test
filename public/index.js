const States = {
  WAITING_CALL: 'WAITING_CALL',
  ON_CALL: 'ON_CALL',
  PROMPT_USER: 'PROMPT_USER',
  WAITING_DATA: 'WAITING_DATA',
  HAVE_DATA: 'HAVE_DATA',
};
Object.freeze(States);

const AppUrl = 'https://ivr-dashboard.herokuapp.com';
const VGSUrl = 'https://vgs-sip.herokuapp.com/v1/secure-calls/to-write/';
const PollDelay = 1000;

const data = {};
let state = States.WAITING_CALL;

async function run() {
  if (state === States.WAITING_CALL) {
    await loadPhoneNumber()
      .then((number) => {
        data.phoneNumber = number;
        receivedPhoneNumber(data.phoneNumber);
        state = States.ON_CALL;
      })
      .catch(async () => await sleep(PollDelay));
  }

  if (state === States.ON_CALL) {
    return;
  }

  if (state === States.PROMPT_USER) {
    await promptCaller()
      .then(() => {
        state = States.WAITING_DATA;
      })
      .catch(async () => await sleep(PollDelay));
  }

  if (state === States.WAITING_DATA) {
    await loadData()
      .then((digits) => {
        data.digits = digits;
        receivedData(data.digits);
        state = States.HAVE_DATA;
      })
      .catch(async () => await sleep(PollDelay));
  }

  if (state === States.HAVE_DATA) {
    return;
  }

  run();
}

function promptUser() {
  state = States.PROMPT_USER;
  run();
}

async function clearData() {
  const url = `${AppUrl}/clear`;
  await fetch(url, { method: 'POST' })
    .catch(console.error);
  window.location.reload();
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function receivedData(digits) {
  document.getElementById('digits').textContent = digits;
  document.getElementById('collectingData').style.display = 'none';
  document.getElementById('haveData').style.display = 'initial';
}

function receivedPhoneNumber(number) {
  document.getElementById('phoneNumber').textContent = number;
  document.getElementById('waitingForCall').style.display = 'none';
  document.getElementById('onCall').style.display = 'initial';
}

function requestData() {
  document.getElementById('collectData').style.display = 'none';
  document.getElementById('collectingData').style.display = 'initial';

  promptUser();
}

async function promptCaller() {
  const url = `${VGSUrl}${data.phoneNumber}`;
  return fetch(url);
}

async function loadData() {
  const url = `${AppUrl}/data`;
  return fetch(url)
    .then(resp => resp.json())
    .then(resp => resp.digits || Promise.reject());
}

async function loadPhoneNumber() {
  const url = `${AppUrl}/calls`;
  return fetch(url)
    .then(resp => resp.json())
    .then(resp => resp.number || Promise.reject());
}

run();
