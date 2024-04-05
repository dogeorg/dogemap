# DogeBox: Dogemap Service

Dogemap is a [DogeBox](https://github.com/dogeorg/dogeboxd) service that crawls the Dogecoin network and maintains a map of Dogecoin nodes.

![Dogebox Logo](/docs/dogemap1.png)
![Dogebox Logo](/docs/dogemap2.png)
![Dogebox Logo](/docs/dogemap3.png)

---

## How it works?

After installing and running the service, it will start collecting all Dogecoin nodes worldwide and store them in a local database. Then, the map will load that database and populate with all nodes, retrieving the coordinates for each node's IP address from a public IP Internet Service Provider database. The DogeMap service will check every 10 minutes if the existing nodes are still active and will remove those that are inactive from the map. It will also track all nodes' software versions running and can be filtered accordingly.

---

## How to Install DogeMap on Windows or Linux as a Standalone:

1. Install Git and the latest version of Go.
2. Clone the repository:

   ```
   git clone https://github.com/dogeorg/dogemap.git
   ```

3. After cloning, navigate to the directory:

   ```
   cd dogemap
   ```

4. Compile the code:

   ```
   go build ./cmd/dogemap
   ```

5. Run the executable file:

 For Windows:

   ```
    .\dogemap.exe
   ```

For Linux:

   ```
    ./dogemap
   ```

6. Open the provided browser URL:

   ```
    http://localhost:8080
   ```

You will see the map running :)

---

## Instructions to Install and Run on [DogeBox](https://github.com/dogeorg/dogeboxd) (coming soon)

