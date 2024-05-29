import { store } from "/state/store.js";

// Example middleware
export function logPathMiddleware(context, commands) {
  console.log("Navigating to path:", context.pathname);
  return undefined; // Proceed with the navigation
}

export async function showProfile(context, commands) {
  console.log('Running showProfile middleware ..', context.params.id);
  
  // Set the "inspectedNode" as the first param after "node" in the URL
  // Eg. localhost:9090/node/foo, will set "foo" as the inspected node Id

  store.updateState({ 
    nodeContext: { 
      inspectedNodeId: context.params.id[0]
    }
  });

  // Return undefined so that routing is not interrupted.
  // The navigation should hapilly continue to its detination.

  // We expect the map-view to load
  // and to reveal the profile of the inspectedNodeId.
  return undefined;
}
