package main

import (
	"fmt"
	"net/http"

	"github.com/dogeorg/dogemap/pkg/dogemap"
)

func main() {
	// Start the HTTP server
	go func() {
		// Serve index.html using an HTTP server
		http.Handle("/", http.FileServer(http.Dir("pkg/dogemap")))
		fmt.Println("Server running at http://localhost:8080")
		http.ListenAndServe(":8080", nil)
	}()

	// Run the handshake script periodically
	dogemap.RunHandshakePeriodically()
}
