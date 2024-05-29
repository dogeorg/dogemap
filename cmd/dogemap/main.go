package main

import (
	"net/http"
	"path/filepath"
	"log"
	"os"
	"github.com/dogeorg/dogemap/pkg/dogemap/v2"
)

func main() {
	staticFilesDir := "pkg/dogemap/v2"
	indexFilePath := filepath.Join(staticFilesDir, "index.html")

	// Create an http.FileSystem representing the root of the static files directory
	fileSystem := http.Dir(staticFilesDir)

	// File server to serve static files
	fs := http.FileServer(fileSystem)

	// Custom handler for routing to support Single Page Applications
	// Specifically, its purpose is to serve the index.html whenever
	// a 404 would be served.
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		// Try to open the file directly using the file system
		_, err := fileSystem.Open(r.URL.Path)
		if os.IsNotExist(err) {
			// File does not exist, serve index.html
			http.ServeFile(w, r, indexFilePath)
			return
		}

		// Serve the file directly using the standard file server
		fs.ServeHTTP(w, r)
	})

	// Start the server
	log.Println("Server running at http://localhost:9090")
	http.ListenAndServe(":9090", nil)

	// Run the handshake script periodically
	dogemap.RunHandshakePeriodically()
}