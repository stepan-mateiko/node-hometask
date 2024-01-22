// Task 1 Event Emitter

class EventEmitter {
  constructor() {
    this.listeners = {};
  }

  addListener(eventName, fn) {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = [];
    }
    this.listeners[eventName].push(fn);
  }

  on(eventName, fn) {
    this.addListener(eventName, fn);
  }

  removeListener(eventName, fn) {
    if (this.listeners[eventName]) {
      this.listeners[eventName] = this.listeners[eventName].filter(
        (listener) => listener !== fn
      );
    }
  }

  off(eventName, fn) {
    this.removeListener(eventName, fn);
  }

  once(eventName, fn) {
    const onceWrapper = (...args) => {
      fn(...args);
      this.removeListener(eventName, onceWrapper);
    };
    this.addListener(eventName, onceWrapper);
  }

  emit(eventName, ...args) {
    if (this.listeners[eventName]) {
      this.listeners[eventName].forEach((listener) => listener(...args));
    }
  }

  listenerCount(eventName) {
    return this.listeners[eventName] ? this.listeners[eventName].length : 0;
  }

  rawListeners(eventName) {
    return this.listeners[eventName] || [];
  }
}

const myEmitter = new EventEmitter();

function c1() {
  console.log("an event occurred!");
}

function c2() {
  console.log("yet another event occurred!");
}

myEmitter.on("eventOne", c1);
myEmitter.on("eventOne", c2);

myEmitter.once("eventOnce", () => console.log("eventOnce once fired"));
myEmitter.once("init", () => console.log("init once fired"));

myEmitter.on("status", (code, msg) => console.log(`Got ${code} and ${msg}`));

myEmitter.emit("eventOne");
myEmitter.emit("eventOnce");
myEmitter.emit("eventOne");
myEmitter.emit("init");
myEmitter.emit("init");
myEmitter.emit("eventOne");
myEmitter.emit("status", 200, "ok");

console.log(myEmitter.listenerCount("eventOne"));
console.log(myEmitter.rawListeners("eventOne"));

myEmitter.off("eventOne", c1);
console.log(myEmitter.listenerCount("eventOne"));
myEmitter.off("eventOne", c2);
console.log(myEmitter.listenerCount("eventOne"));

// Task 2 With Time

const axios = require("axios");

class WithTime extends EventEmitter {
  async execute(asyncFunc, ...args) {
    try {
      this.emit("begin");
      const startTime = Date.now();

      const data = await asyncFunc(...args);

      const endTime = Date.now();
      this.emit("end");

      this.emit("data", data);
      console.log(`Time taken: ${endTime - startTime}ms`);
    } catch (error) {
      console.error(`Error during execution: ${error.message}`);
    }
  }
}

const withTime = new WithTime();

withTime.on("begin", () => console.log("About to execute"));
withTime.on("end", () => console.log("Done with execute"));

withTime.on("data", (data) => console.log("Received data:", data));

const fetchData = async () => {
  const response = await axios.get(
    "https://jsonplaceholder.typicode.com/posts/1"
  );
  return response.data;
};

withTime.execute(fetchData);

const fs = require("fs");
const csvtojson = require("csvtojson");

const csvFilePath = "./csvdirectory/mycsv.csv";
const txtFilePath = "./csvdirectory/output.txt";

const readStream = fs.createReadStream(csvFilePath, "utf8");
const writeStream = fs.createWriteStream(txtFilePath);

readStream
  .pipe(csvtojson())
  .on("data", (jsonObject) => {
    writeStream.write(JSON.stringify(jsonObject) + "\n");
  })
  .on("error", (error) => {
    console.error(`Error reading/writing file: ${error.message}`);
  })
  .on("end", () => {
    console.log("CSV to JSON conversion completed.");

    writeStream.end();
  });

writeStream.on("error", (error) => {
  console.error(`Error writing to file: ${error.message}`);
});

writeStream.on("finish", () => {
  console.log("Write stream closed.");
});

readStream.on("error", (error) => {
  console.error(`Error reading file: ${error.message}`);
});
