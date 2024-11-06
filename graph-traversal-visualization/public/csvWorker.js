importScripts('/path/to/papaparse.js');

self.onmessage = function (e) {
  const file = e.data;
  const reader = new FileReader();

  reader.onload = function (event) {
    const text = event.target.result;
    const results = Papa.parse(text, { header: true });
    self.postMessage(results.data);
  };

  reader.readAsText(file);
};
