export class StoreSubscriber {
  host;
  store;

  constructor(host, store) {
    (this.host = host).addController(this);
    this.store = store;

    // Subscribe to store updates
    this.store.subscribe(this);
  }

  stateChanged() {
    this.host.requestUpdate();
  }
}
