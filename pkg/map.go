package dogemap

import (
	"fmt"
	"net"
	"time"
)

// Creates a NodeList and starts it off with some
// first IPs to search
func NewNodeList(initialIPs []string) NodeList {
	nodes := []*Node{}
	for _, ip := range initialIPs {
		n := Node{
			IP:      ip,
			Status:  "unknown",
			Checked: time.Unix(0, 0),
		}
		nodes = append(nodes, &n)
	}
	return NodeList{Nodes: nodes}
}

// Contains all nodes that we know about
type NodeList struct {
	Nodes []*Node
}

// Iterates through nodes and checks they are running
func (t NodeList) CheckNodes() error {
	now := time.Now()
	tenMinutesAgo := now.Add(-10 * time.Minute)

	for _, n := range t.Nodes {
		if n.Checked.Before(tenMinutesAgo) {
			n.Checked = now
			fmt.Println("Checking Node:", n.IP)

			// Start by seeing if Node is listening
			if isPortOpen(n.IP, "22556") {
				n.Status = "Listening"
			}

			// TODO Get that nodes node list
			// Use go-libdogecoin to connect to node
			// Append any new discovered nodes to NodeList

		} else {
			fmt.Printf("Not checking %s, checked recently\n", n.IP)
		}
	}
	return nil
}

var NODETemplate string = `
  NODE: %s 
  Status: %s 
  Last Checked: %s 
`

func (t NodeList) PrintStatus() error {
	for _, n := range t.Nodes {
		fmt.Printf(NODETemplate, n.IP, n.Status, n.Checked)
	}
	return nil
}

// Check if Dogecoind port is open
func isPortOpen(ip string, port string) bool {
	address := net.JoinHostPort(ip, port)
	conn, err := net.DialTimeout("tcp", address, 5*time.Second)
	if err != nil {
		return false
	}
	defer conn.Close()
	return true
}

type Node struct {
	IP      string
	Status  string
	LAT     string
	LON     string
	JSON    string
	Checked time.Time
}
