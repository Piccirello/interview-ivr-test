const States = {
  INITIAL: 'INITIAL',
  WAITING_CALL: 'WAITING_CALL',
  ON_CALL: 'ON_CALL',
  PROMPT_CALLER: 'PROMPT_CALLER',
  WAITING_DATA: 'WAITING_DATA',
  HAVE_DATA: 'HAVE_DATA',
};
Object.freeze(States);

const AppUrl = 'https://ivr-dashboard.herokuapp.com';
const VGSUrl = 'https://vgs-sip.herokuapp.com/v1/secure-calls/to-write/';
const PollDelay = 1000;

const data = {};
let state = States.INITIAL;

async function run() {
  if (state === States.INITIAL) {
    await clearData(false);
    state = States.WAITING_CALL;
  }

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

  if (state === States.PROMPT_CALLER) {
    await requestData()
      .catch(async () => await sleep(PollDelay));
    state = States.WAITING_DATA;
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

function promptCaller() {
  state = States.PROMPT_CALLER;
  run();
}

async function requestData() {
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

async function clearData(reload = true) {
  const url = `${AppUrl}/clear`;
  await fetch(url, { method: 'POST' })
    .catch(console.error);

  if (reload) {
    window.location.reload();
  }
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function receivedData(digits) {
  document.getElementById('digits').textContent = digits;
  document.getElementById('collectingData').classList.add('hidden');
}

function receivedPhoneNumber(number) {
  updateTimer();
  document.getElementById('phoneNumber').textContent = number;
  document.getElementById('waitingForCall').classList.add('hidden');
  document.getElementById('onCall').classList.remove('hidden');
}

function collectData() {
  document.getElementById('collectData').classList.add('hidden');
  document.getElementById('collectingData').classList.remove('hidden');

  promptCaller();
}

function updateTimer() {
  const callStartTime = new Date().getTime();
  setInterval(() => {
    const now = new Date().getTime();
    const elapsedTime = now - callStartTime;
    const minutes = Math.floor((elapsedTime % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((elapsedTime % (1000 * 60)) / 1000);

    const minutesString = (minutes < 10) ? ('0' + minutes) : minutes;
    const secondsString = (seconds < 10) ? ('0' + seconds) : seconds;
    document.getElementById('callTimer').textContent = `${minutesString}:${secondsString}`;
  }, 1000);
}

run();
