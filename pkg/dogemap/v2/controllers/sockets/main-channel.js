import WebSocketClient from "/api/sockets.js";
import { store } from "/state/store.js";
import { pkgController } from "/controllers/package/index.js";
import { asyncTimeout } from "/utils/timeout.js";

class SocketChannel {
  observers = [];
  reconnectInterval = 500;
  maxReconnectInterval = 10000;

  constructor() {
    this.wsClient = null;
    this.isConnected = false;
    this.setupSocketConnection();

    if (!this.isConnected) {
      this.wsClient.connect();
    }
  }

  setupSocketConnection() {
    if (this.isConnected) {
      return;
    }

    this.wsClient = new WebSocketClient(
      "ws://localhost:3000/ws/state/",
      store.networkContext,
    );

    // Update component state based on WebSocket events
    this.wsClient.onOpen = () => {
      this.isConnected = true;
      this.reconnectInterval = 1000; // reset.
      console.log("CONNECTED!!@");
      this.notify();
    };

    this.wsClient.onMessage = async (event) => {
      console.log("MSSSGSG!~", event);

      let err, data;
      try {
        data = JSON.parse(event.data);
      } catch (err) {
        console.warn("failed to JSON.parse incoming event", event);
        err = true;
      }

      if (err || !data) return;

      // Switch on message type
      if (!data.type) {
        console.warn("received an event that lacks an event type", event);
        return;
      }

      switch (data.type) {
        case "PupStatus":
          // TODO: determine why.
          // Receiving completed txns before the txn has been registered in the client.
          await asyncTimeout(500);

          pkgController.resolveAction(data.id, data);
          break;
      }
      this.notify();
    };

    this.wsClient.onError = (event) => {
      console.log("ERERERRS", event);
      this.notify();
    };

    this.wsClient.onClose = (event) => {
      console.log("CLSOSSING");
      this.isConnected = false;
      this.notify();
      this.attemptReconnect();
    };
  }

  attemptReconnect() {
    if (!this.isConnected) {
      setTimeout(() => {
        console.log(`Attempting to reconnect...`);
        this.setupSocketConnection();
        if (!this.isConnected) {
          this.wsClient.connect();
        }
      }, this.reconnectInterval);

      // Increase the reconnect interval until the maximum (eg 10 seconds) is reached
      this.reconnectInterval = Math.min(
        this.reconnectInterval * 1.15,
        this.maxReconnectInterval,
      );
    }
  }

  // Register an observer
  addObserver(observer) {
    if (!this.observers.includes(observer)) {
      this.observers.push(observer);
      console.log("OBSERVER ADDED", observer);
    }
  }

  // Remove an observer
  removeObserver(observer) {
    const index = this.observers.indexOf(observer);
    if (index > -1) {
      this.observers.splice(index, 1);
    }
  }

  // Notify one or all registered observers of a change
  notify(id) {
    for (const observer of this.observers) {
      if (!id) {
        observer.requestUpdate();
      }
      if (id === observer.id) {
        observer.requestUpdate();
      }
    }
  }

  doThing() {
    this.notify();
  }
}

// Instance holder
let instance;

function getInstance() {
  if (!instance) {
    instance = new SocketChannel();
  }
  return instance;
}

export const mainChannel = getInstance();
