package main

import (
	"fmt"

	dogemap "github.com/dogeorg/dogemap/pkg"
)

func main() {
	IPs := []string{
		"94.62.224.95", // Paulo's node
		"47.155.33.59", // Random node
		"127.0.0.1",    // Not a node
	}
	nodes := dogemap.NewNodeList(IPs)
	nodes.PrintStatus()

	fmt.Println("CHECKING NODES!")

	nodes.CheckNodes()

	nodes.PrintStatus()

	fmt.Println("CHECKING NODES AGAIN!")
	nodes.CheckNodes()
}
