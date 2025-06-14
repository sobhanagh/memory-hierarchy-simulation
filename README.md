# 🧠 Memory Hierarchy Simulation  

This project is a **JavaScript implementation** of a memory hierarchy simulation. It models a multi-level cache system with different cache levels (L1, L2, L3), main memory (RAM), and disk storage. The simulation allows users to configure the cache levels, sizes, block size, and replacement policies, and then simulate memory accesses to observe the performance in terms of hits, misses, and total access time.  

---

## 📋 Table of Contents  
- [Features](#features)  
- [Technologies Used](#technologies-used)  
- [Setup](#setup)  
- [Usage](#usage)  
- [Configuration](#configuration)  
- [Simulation Details](#simulation-details)  
- [Classes and Methods](#classes-and-methods)  


---

## ✨ Features  
- Configurable cache levels (L1, L2, L3)  
- Configurable cache sizes and block size  
- Support for different cache replacement policies (FIFO, LRU, MRU, Random, LFRU)  
- Simulation of memory accesses with detailed results on hits, misses, and access times  
- Visualization of results using a **bar chart**  

---

## 🛠️ Technologies Used  
- JavaScript  
- HTML/CSS  
- Chart.js for data visualization  

---

## ⚙️ Setup  
1. Clone the repository:  
   ```bash
   git clone https://github.com/sobhanagh/memory-hierarchy-simulation.git

2. Navigate to the project directory:

   ```bash
   cd memory-hierarchy-simulation
   ```
3. Open `index.html` in your web browser to run the simulation.

---
<a id="usage"></a>
## 🚀 Usage

1. Open the `index.html` file in your web browser.
2. Configure the cache levels, sizes, block size, and replacement policy using the input fields.
3. Click the **"Simulate"** button to start the simulation.
4. View the results, including hits, misses, and total access time, displayed on the page.
5. The results are also visualized in a **bar chart**.

---

## 🛠️ Configuration

* **Cache Levels:** Number of cache levels (1, 2, or 3).
* **Cache Size L1:** Size of the L1 cache in bytes.
* **Cache Size L2:** Size of the L2 cache in bytes (if applicable).
* **Cache Size L3:** Size of the L3 cache in bytes (if applicable).
* **Block Size:** Size of each cache block in bytes.
* **Replacement Policy:** Cache replacement policy (FIFO, LRU, MRU, Random, LFRU).

---

## 📊 Simulation Details

The simulation performs a series of memory accesses and tracks the performance metrics:

* **Hits:** Number of times the requested data is found in the cache.
* **Misses:** Number of times the requested data is not found in the cache.
* **Total Time:** Total time taken for all memory accesses, considering the delays for each cache level, RAM, and disk.

---

## 📚 Classes and Methods

### MemoryHierarchy

| **Method**                | **Description**                                                    |
| ------------------------- | ------------------------------------------------------------------ |
| **Constructor**           | Initializes the memory hierarchy with the specified configuration. |
| **initialRam()**          | Initializes the main memory with random addresses.                 |
| **simulateAccesses()**    | Simulates a series of memory accesses.                             |
| **accessMemory(address)** | Accesses the memory hierarchy for a given address.                 |
| **displayResults()**      | Displays the simulation results on the page.                       |
| **renderChart()**         | Renders a bar chart of the simulation results.                     |


### Cache

| **Method**          | **Description**                                                      |
| ------------------- | -------------------------------------------------------------------- |
| **Constructor**     | Initializes the cache with size, block size, and replacement policy. |
| **access(address)** | Checks if the address is in the cache.                               |
| **insert(address)** | Inserts an address into the cache.                                   |
| **evict()**         | Evicts an address based on the replacement policy.                   |
| **findLFRU()**      | Finds least frequently used address for eviction (LFRU policy).      |
| **findLFU()**       | Finds least frequently used address for eviction (LFU policy).       |
| **findSC()**        | Finds an address to evict using the second-chance (SC) policy.       |
| **remove(address)** | Removes an address from the cache.                                   |


### Ram

| **Method**          | **Description**                                           |
| ------------------- | --------------------------------------------------------- |
| **Constructor**     | Initializes the main memory.                              |
| **access(address)** | Checks if the address is in the main memory.              |
| **insert(address)** | Inserts an address into the main memory.                  |
| **remove(address)** | Removes an address from the main memory.                  |
| **evict()**         | Evicts a random block from the main memory to make space. |


