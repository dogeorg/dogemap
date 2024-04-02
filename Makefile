default: build/dogemap

.PHONY: clean, test
clean:
	rm -rf ./build

build/dogemap: clean
	mkdir -p build/
	go build -o build/dogemap ./cmd/dogemap/. 


dev:
	go run ./cmd/dogemap 


test:
	go test -v ./test
