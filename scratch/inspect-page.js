const { spawn } = require('child_process');

async function main() {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9225',
    '--user-data-dir=C:\\Users\\ADMIN\\AppData\\Local\\Temp\\chrome-debug-profile',
    'https://pdclub-two.vercel.app/#assessment'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  try {
    const res = await fetch('http://127.0.0.1:9225/json');
    const targets = await res.json();
    const pageTarget = targets.find(t => t.type === 'page' && t.url.includes('pdclub-two'));
    console.log('Target found:', pageTarget ? pageTarget.url : 'NONE');
    if (!pageTarget) return;

    const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
    ws.onopen = () => {
      let id = 1;
      const send = (method, params) => ws.send(JSON.stringify({ id: id++, method, params }));

      setTimeout(() => {
        send('Runtime.evaluate', {
          expression: `(() => {
            const sel = document.getElementById('entryBranchSelect');
            const options = Array.from(sel.options).map(o => o.value);
            sel.value = options[1];
            sel.dispatchEvent(new Event('change'));
            document.getElementById('branchNextBtn').click();
            return { options, selected: sel.value };
          })()`,
          returnByValue: true
        });
      }, 1000);

      const interval = setInterval(() => {
        send('Runtime.evaluate', {
          expression: `JSON.stringify({
            scrollY: window.scrollY,
            brandDisplay: document.getElementById('brandHeader')?.style.display,
            branchIntroDisplay: document.getElementById('branchIntroCard')?.style.display,
            formCardDisplay: document.getElementById('formCard')?.style.display,
            stepperDisplay: document.getElementById('stepperContainer')?.style.display,
            hash: window.location.hash
          })`
        });
      }, 200);

      setTimeout(() => {
        clearInterval(interval);
        ws.close();
        chrome.kill();
      }, 7000);
    };

    ws.onmessage = (raw) => {
      const data = JSON.parse(raw.data);
      if (data.result && data.result.result && data.result.result.value) {
        console.log('State:', data.result.result.value);
      }
    };
  } catch (err) {
    console.error('Error:', err);
    chrome.kill();
  }
}

main();
