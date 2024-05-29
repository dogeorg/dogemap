package dogemap

import (
	"time"
)

func RunHandshakePeriodically() {
	// Define the ticker interval
	ticker := time.NewTicker(1 * time.Minute)
	defer ticker.Stop()

	// Run the handshake process periodically
	for {
		select {
		case <-ticker.C:
			// Execute the handshake script
			InitializeDatabaseAndTestNodes()
		}
	}
}
