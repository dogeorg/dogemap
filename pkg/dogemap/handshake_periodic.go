package dogemap

import (
	"fmt"
	"os"
	"os/exec"
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
			cmd := exec.Command("go", "run", "handshake.go")
			cmd.Stdout = os.Stdout
			cmd.Stderr = os.Stderr
			if err := cmd.Run(); err != nil {
				fmt.Println("Error running handshake script:", err)
			}
		}
	}
}
