import { postConfig } from '/api/config/config.js';

class PkgController {
  observers = [];
  actions = [];
  pupIndex = {};
  installed = [];
  available = [];

  // Register an observer
  addObserver(observer) {
    if (!this.observers.includes(observer)) {
      this.observers.push(observer);
    }
  }

  // Remove an observer
  removeObserver(observer) {
    const index = this.observers.indexOf(observer);
    if (index > -1) {
      this.observers.splice(index, 1);
    }
  }

  // Notify all registered observers of a state change
  notify(pupId) {
    for (const observer of this.observers) {
      if (!pupId) {
        observer.requestUpdate();
      }
      if (pupId === observer.pupId) {
        observer.requestUpdate();
      }
    }
  }

  setData(bootstrapResponse) {
    const { installed, available } = toAssembledPup(bootstrapResponse)
    this.installed = toArray(installed)
    this.available = toArray(available)
    this.pupIndex = { ...available, ...installed }
    this.notify();
  }

  getPup(id) {
    if (!id) return
    return this.pupIndex[id]
  }

  installPkg(pupId) {
    // Find the pup in the available list
    const index = this.available.findIndex(pup => pup.manifest.id === pupId);
    if (index !== -1) {
      // Move the pup from the available list to the installed list
      const [pup] = this.available.splice(index, 1);
      this.installed.push(pup);
      this.notify();
    }
  }

  removePkg(pupId) {
    // Find the pup in the installed list
    const index = this.installed.findIndex(pup => pup.id === pupId);
    if (index !== -1) {
      // Remove the pup from the installed list
      this.installed.splice(index, 1);
      this.notify();
    }
  }

  registerAction(txn, callbacks, actionType, pupId) {
    if (!txn || !callbacks || !actionType || !pupId) {
      console.warn(`
        pkgController: MALFORMED REGISTER ACTION REQUEST.
        Expecting: txn, callbacks, actionType & pupId`,
        { txn, callbacks, actionType, pupId }
      )
      return;
    }

    if (typeof callbacks.onSuccess !== 'function') {
      console.warn('pkgController: ACTION SUCCESS CALLBACK NOT A FUNCTION.', { txn, callbacks })
      return;
    }

    if (typeof callbacks.onError !== 'function') {
      console.warn('pkgController: ACTION ERROR CALLBACK NOT A FUNCTION.', { txn, callbacks })
      return;
    }

    this.actions.push({
      txn,
      callbacks,
      actionType,
      pupId
    })
  }

  resolveAction(txn, payload) {
    const foundAction = this.actions.find(action => action.txn === txn);
    if (!foundAction) {
      console.warn('pkgController: ACTION NOT FOUND.', { txn })
      return;
    }

    // Txn failed, invoke error callback.
    if (!payload || payload.error) {
      try {
        foundAction.callbacks.onError(payload);
      } catch (err) {
        console.warn('the provided onError callback function threw an error');
      }
      return;
    }

    // Txn succeeded, invoke success callback.
    try {
      foundAction.callbacks.onSuccess(payload);
    } catch (err) {
      console.warn('the provided onSuccess callback function threw an error');
    }

    switch (foundAction.actionType) {
      case 'UPDATE-PUP':
        this.updatePupModel(foundAction.pupId, payload.update);
        break;
    }
  }

  updatePupModel(pupId, newPupStateData) {
    // Update the pup in the installed list
    // const installedIndex = this.installed.findIndex(pup => pup.manifest.id === pupId);
    // if (installedIndex !== -1) {
    //   const installedPup = this.installed[installedIndex];
    //   // Update the installed pup with new data
    //   this.installed[installedIndex] = { ...installedPup, ...newData };
    // }

    // Update the pup in the pupIndex
    if (this.pupIndex[pupId]) {
      const indexedPup = this.pupIndex[pupId];
      // Update the indexed pup with new data
      this.pupIndex[pupId] = {
        ...indexedPup,
        state: {
          ...indexedPup.state,
          ...newPupStateData
        }
      };
    }

    // Request an update to re-render the host with new data
    this.notify(pupId);
  }

  async requestPupChanges(pupId, newData, callbacks) {

    if (!pupId || !newData || !callbacks) {
      console.warn('Error. requestPupChanges expected pupId, newData, callbacks', { pupId, newData, callbacks});
    }

    const actionType = 'UPDATE-PUP';

    // Make a network call
    const res = await postConfig(pupId, newData).catch((err) => {
      console.error(err);
    });

    if (!res || res.error) {
      callbacks.onError({ error: true, message: 'failure occured when calling postConfig' });
      return false;
    }

    // Submitting changes succeeded, carry on.
    const txn = res.id
    if (txn && callbacks) {
      // Register transaction in actions register.
      this.registerAction(txn, callbacks, actionType, pupId)
    }

    // Return truthy to caller
    return true;
  }
}

// Instance holder
let instance;

function getInstance() {
  if (!instance) {
    instance = new PkgController();
  }
  return instance;
}

export const pkgController = getInstance();

function toAssembledPup(bootstrapResponse) {
  const sources = Object.keys(bootstrapResponse.manifests)
  const states = bootstrapResponse.states
  const stateKeys = Object.keys(states);
  const out = {
    internal: {},
    installed: {},
    available: {},
  }

  // Populate available index.
  sources.forEach((source) => {
    // sources such as "local", "remote" etc..
    bootstrapResponse.manifests[source].available.forEach((m) => {
      out.available[m.id] = {
        manifest: m,
        state: {
          id: m.id,
          package: m.package,
          ...defaultPupState()
        },
      }
    })
  })

  // Popupate installed index.
  Object.values(states).forEach((s) => {
    out.installed[s.id] = {
      manifest: out.available[s.id].manifest,
      state: s
    }
  })

  // Remove installed pups from available index.
  stateKeys.forEach(k => {
    delete out.available[k];
  })
  return out;
}

function toArray(object) {
  return Object.values(object);
}

function defaultPupState() {
  return {
    status: undefined,
    stats: undefined,
    config: {}
  }
}