// delay cache-L1 = 10ns
// delay cache-L2 = 20ns
// delay cache-L3 = 30ns
// delay memory = 50ns
// delay disk = 70ns

// arr for compare replacement policy 
// var arrCompare = [7, 11, 19, 2, 5, 7, 10, 6, 12, 10, 9, 14, 2, 1, 10, 19, 2, 17, 14, 11, 3, 9, 15, 12, 8, 8, 18, 14, 16, 10, 11, 18, 17, 15, 4, 11, 2, 15, 8, 17, 5, 5, 16, 4, 4, 15, 7, 0, 0, 6]

document.getElementById('simulate').addEventListener('click', simulate);

document.getElementById('cacheLevels').addEventListener('input', function () {
    const container = document.querySelector('.settings');
    let inputs = Array.from(container.children).filter((item) => item.nodeName === "INPUT")
    let labels = Array.from(container.children).filter((item) => item.nodeName === "LABEL")

    for (let i = 0; i < 3; i++) {
        inputs[i + 1].classList.add("hidden");
        labels[i + 1].classList.add("hidden");
    }

    for (let i = 0; i < parseInt(this.value); i++) {
        inputs[i + 1].classList.remove("hidden");
        labels[i + 1].classList.remove("hidden");
    }
});

var tmpCache;
var tmpRam;
var boolRam;
var myChart;

function simulate() {
    const cacheLevels = parseInt(document.getElementById('cacheLevels').value);
    const cacheSizeL1 = parseInt(document.getElementById('cacheSizeL1').value);
    const cacheSizeL2 = parseInt(document.getElementById('cacheSizeL2').value);
    const cacheSizeL3 = parseInt(document.getElementById('cacheSizeL3').value);
    const blockSize = parseInt(document.getElementById('blockSize').value);
    const replacementPolicy = document.getElementById('replacementPolicy').value;

    const memoryHierarchy = new MemoryHierarchy(cacheLevels, cacheSizeL1, cacheSizeL2, cacheSizeL3, blockSize, replacementPolicy);

    memoryHierarchy.simulateAccesses();
    memoryHierarchy.displayResults();
}

class MemoryHierarchy {
    constructor(cacheLevels, cacheSizeL1, cacheSizeL2, cacheSizeL3, blockSize, replacementPolicy) {
        this.cacheLevels = cacheLevels;
        this.cacheSizeL1 = cacheSizeL1;
        this.cacheSizeL2 = cacheSizeL2;
        this.cacheSizeL3 = cacheSizeL3;
        this.blockSize = blockSize;
        this.replacementPolicy = replacementPolicy;
        this.totalTime = 0;

        this.l1Cache = new Cache(cacheSizeL1, blockSize, replacementPolicy);
        this.l2Cache = new Cache(cacheSizeL2, blockSize, replacementPolicy);
        this.l3Cache = new Cache(cacheSizeL3, blockSize, replacementPolicy);

        const maxCacheSize = Math.max(cacheSizeL1, cacheSizeL2, cacheSizeL3);
        const ramSize = 5 * maxCacheSize;
        this.mainMemory = new Ram(ramSize);
        tmpRam = this.mainMemory;

        this.initialRam();

        this.hits = 0;
        this.misses = 0;
        this.hitLocations = { L1: 0, L2: 0, L3: 0, RAM: 0, disk: 0 };
    }

    initialRam() {
        const numAccesses = 10;
        const maxAddress = 20;

        for (let i = 0; i < numAccesses; i++) {
            const address = Math.floor(Math.random() * maxAddress);
            console.log("addresses in memory : ", address);
            this.mainMemory.insert(address);
            //this.mainMemory.insert(arrCompare[i]);
        }
    }

    simulateAccesses() {
        const numAccesses = 50;
        const maxAddress = 20;

        for (let i = 0; i < numAccesses; i++) {
            const address = Math.floor(Math.random() * maxAddress);
            this.accessMemory(address);
            //this.accessMemory(arrCompare[i]);
        }
    }

    accessMemory(address) {
        if (this.l1Cache.access(address)) {
            this.hits++;
            this.hitLocations.L1++;
            this.totalTime += 10;
        } else if (this.cacheLevels > 1 && this.l2Cache.access(address)) {
            this.hits++;
            this.hitLocations.L2++;
            this.misses += 1;
            tmpCache = this.l2Cache;
            this.totalTime += 30; // delay cache-L1 and L2
            this.l2Cache.remove(address);
            this.l1Cache.insert(address);
            this.totalTime += 10 // delay write from cache-L2 to L1
        } else if (this.cacheLevels > 2 && this.l3Cache.access(address)) {
            this.hits++;
            this.hitLocations.L3++;
            this.misses += 2;
            tmpCache = this.l3Cache;
            this.totalTime += 60; // delay cache-L1 and L2 and L-3
            this.l3Cache.remove(address);
            this.l2Cache.insert(address);
            this.totalTime += 20 // delay write from cache-L3 to L2
        }
        else if (this.mainMemory.access(address)) {
            boolRam = true;
            this.hits++;
            this.misses += 3;
            this.hitLocations.RAM++;
            this.totalTime += 110; // delay cache-L1 and L2 and L-3 and Ram
            this.mainMemory.remove(address);
            if (this.cacheLevels > 2) {
                this.l3Cache.insert(address);
            }
            else if (this.cacheLevels > 1) {
                this.l2Cache.insert(address);
            }
            else {
                this.l1Cache.insert(address);
                this.hits++;
                this.hitLocations.L1++;
            }
            this.totalTime += 30; // delay write from Ram to bottom layer
        }
        else {
            this.misses += 4;
            this.hitLocations.disk++;
            this.totalTime += 180; // delay cache-L1 and L2 and L-3 and Ram and Disk
            this.mainMemory.insert(address);
            this.totalTime += 50; // delay write from Disk to Ram
        }

        while (!this.l1Cache.access(address)) {
            if (this.mainMemory.access(address)) {
                this.mainMemory.remove(address);
                if (this.cacheLevels > 2) {
                    this.l3Cache.insert(address);
                }
                else if (this.cacheLevels > 1) {
                    this.l2Cache.insert(address);
                }
                else {
                    this.l1Cache.insert(address);
                }
                this.totalTime += 30; // delay write from Ram to bottom layer
            }
            else {
                if (this.l3Cache.access(address)) {
                    tmpCache = this.l3Cache;
                    this.l3Cache.remove(address);
                    this.l2Cache.insert(address);
                    this.totalTime += 20 // delay write from cache-L3 to L2
                }
                else if (this.l2Cache.access(address)) {
                    tmpCache = this.l2Cache;
                    this.l2Cache.remove(address);
                    this.l1Cache.insert(address);
                    this.totalTime += 10 // delay write from cache-L2 to L1
                }
            }
            boolRam = false;
        }
        boolRam = false;

        // Print each access result
        console.log(`Accessing address ${address}: Hits = ${this.hits}, Misses = ${this.misses}`);
    }

    displayResults() {
        document.getElementById('hits').innerText = `Hits: ${this.hits}`;
        document.getElementById('misses').innerText = `Misses: ${this.misses}`;
        document.getElementById('time').innerText = `Time: ${this.totalTime} ns`;
        document.getElementById('hitLocations').innerText = `L1 Hits: ${this.hitLocations.L1}, L2 Hits: ${this.hitLocations.L2}, L3 Hits: ${this.hitLocations.L3}, RAM Hits: ${this.hitLocations.RAM}`;
        this.renderChart();
    }

    renderChart() {
        const ctx = document.getElementById('resultsChart').getContext('2d');

        if (myChart) {
            myChart.destroy();
        }

        myChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['L1 Hits', 'L2 Hits', 'L3 Hits', 'RAM Hits', 'Disk', 'Misses'],
                datasets: [{
                    label: 'Memory Access Results',
                    data: [this.hitLocations.L1, this.hitLocations.L2, this.hitLocations.L3, this.hitLocations.RAM, this.hitLocations.disk, this.misses],
                    backgroundColor: ['#007bff', '#28a745', '#ffc107', '#17a2b8', '#663399', '#dc3545']
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
}

class Cache {
    constructor(size, blockSize, replacementPolicy) {
        this.size = size;
        this.blockSize = blockSize;
        this.replacementPolicy = replacementPolicy;
        this.blocks = new Map();
        this.accessQueue = [];
        this.accessCount = new Map();
        this.secondChanceBits = new Map();
    }

    access(address) {
        if (this.blocks.has(address)) {
            if (this.replacementPolicy === 'LRU' || this.replacementPolicy === 'MRU') {
                this.accessQueue = this.accessQueue.filter(item => item !== address);
                this.accessQueue.push(address);
            }
            if (this.replacementPolicy === 'LFRU' || this.replacementPolicy === 'LFU') {
                this.accessCount.set(address, this.accessCount.get(address) + 1);
            }
            if (this.replacementPolicy === 'SC') {
                this.secondChanceBits.set(address, true);
            }
            return true;
        }
        return false;
    }

    insert(address) {
        if (this.blocks.size >= this.size / this.blockSize) {
            this.evict();
        }
        this.blocks.set(address, true);
        this.accessQueue.push(address);
        if (this.replacementPolicy === 'LFRU' || this.replacementPolicy === 'LFU') {
            this.accessCount.set(address, 1);
        }
        if (this.replacementPolicy === 'SC') {
            this.secondChanceBits.set(address, true);
        }
    }

    evict() {
        let evictAddress;
        if (this.replacementPolicy === 'FIFO' || this.replacementPolicy === 'LRU') {
            evictAddress = this.accessQueue.shift();
        } else if (this.replacementPolicy === 'Random') {
            const randomIndex = Math.floor(Math.random() * this.accessQueue.length);
            evictAddress = this.accessQueue.splice(randomIndex, 1)[0];
        } else if (this.replacementPolicy === 'MRU') {
            evictAddress = this.accessQueue.pop();
        } else if (this.replacementPolicy === 'LFRU') {
            evictAddress = this.findLFRU();
        } else if (this.replacementPolicy === 'LFU') {
            evictAddress = this.findLFU();
        } else if (this.replacementPolicy === 'SC') {
            evictAddress = this.findSC();
        }
        this.blocks.delete(evictAddress);
        if (boolRam) {
            tmpRam.insert(evictAddress);
        } else {
            tmpCache.insert(evictAddress);
        }
    }

    findLFRU() {
        let leastFreq = Infinity;
        let leastFreqAddress;
        for (let [address, freq] of this.accessCount.entries()) {
            if (freq < leastFreq) {
                leastFreq = freq;
                leastFreqAddress = address;
            }
        }
        this.accessCount.delete(leastFreqAddress);
        this.accessQueue = this.accessQueue.filter(item => item !== leastFreqAddress);
        return leastFreqAddress;
    }

    findLFU() {
        let leastFreq = Infinity;
        let leastFreqAddress;
        for (let [address, freq] of this.accessCount.entries()) {
            if (freq < leastFreq) {
                leastFreq = freq;
                leastFreqAddress = address;
            }
        }
        this.accessCount.delete(leastFreqAddress);
        this.accessQueue = this.accessQueue.filter(item => item !== leastFreqAddress);
        return leastFreqAddress;
    }

    findSC() {
        while (true) {
            const address = this.accessQueue.shift();
            if (this.secondChanceBits.get(address)) {
                this.secondChanceBits.set(address, false);
                this.accessQueue.push(address);
            } else {
                this.secondChanceBits.delete(address);
                return address;
            }
        }
    }

    remove(address) {
        this.blocks.delete(address);
        if (this.replacementPolicy === 'LFRU' || this.replacementPolicy === 'LFU') {
            this.accessCount.delete(address);
        }
        if (this.replacementPolicy === 'SC') {
            this.secondChanceBits.delete(address);
        }
    }
}

class Ram {
    constructor(size) {
        this.size = size;
        this.blocks = new Map();
    }

    access(address) {
        if (this.blocks.has(address)) {
            return true;
        }
        return false;
    }

    insert(address) {
        if (this.blocks.size >= this.size) {
            this.evict();
        }
        this.blocks.set(address, true);
    }

    remove(address) {
        this.blocks.delete(address);
    }

    evict() {
        const keys = Array.from(this.blocks.keys());
        const randomKey = keys[Math.floor(Math.random() * keys.length)];
        this.blocks.delete(randomKey);
    }
}