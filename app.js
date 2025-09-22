// класс MinHeap


class MinHeap {
  constructor() {
    this.data = [];
  }
  size() {
    return this.data.length;
  }
  push(item) {
    this.data.push(item);
    this.#siftUp(this.data.length - 1);
  }
  pop() {
    if (!this.data.length) return undefined;
    const top = this.data[0];
    const last = this.data.pop();
    if (this.data.length) {
      this.data[0] = last;
      this.#siftDown(0);
    }
    return top;
  }
  peek() {
    return this.data.length ? this.data[0] : undefined;
  }
  toArray() {
    return [...this.data];
  }
  #parent(i) { return ((i - 1) >> 1); }
  #left(i)   { return (i << 1) + 1; }
  #right(i)  { return (i << 1) + 2; }
  #siftUp(i) {
    while (i > 0) {
      const p = this.#parent(i);
      if (this.data[i].freq >= this.data[p].freq) break;
      [this.data[i], this.data[p]] = [this.data[p], this.data[i]];
      i = p;
    }
  }
  #siftDown(i) {
    const n = this.data.length;
    while (true) {
      const l = this.#left(i);
      const r = this.#right(i);
      let s = i;
      if (l < n && this.data[l].freq < this.data[s].freq) s = l;
      if (r < n && this.data[r].freq < this.data[s].freq) s = r;
      if (s === i) break;
      [this.data[i], this.data[s]] = [this.data[s], this.data[i]];
      i = s;
    }
  }
}


// класс TrieNode


class TrieNode {
  constructor() {
    this.children = new Map();
    this.isEnd = false;
    this.frequency = 0;
  }
}

class Trie {
  constructor() {
    this.root = new TrieNode();
  }
  insert(word, freq = 1) {
    let node = this.root;
    for (const ch of word) {
      if (!node.children.has(ch))
        node.children.set(ch, new TrieNode());
      node = node.children.get(ch);
    }
    node.isEnd = true;
    node.frequency = (node.frequency || 0) + (+freq || 0);
  }
  #getNode(prefix) {
    let node = this.root;
    for (const ch of prefix) {
      if (!node.children.has(ch)) return null;
      node = node.children.get(ch);
    }
    return node;
  }
  autocomplete(prefix, K = 5) {
    const node = this.#getNode(prefix);
    if (!node) return [];
    const heap = new MinHeap();
    const path = [];
    const dfs = (cur, depth) => {
      if (!cur) return;
      if (cur.isEnd) {
        const word = prefix + path.slice(0, depth).join('');
        const item = { word, freq: cur.frequency };
        if (heap.size() < K) {
          heap.push(item);
        } else if (heap.peek().freq < item.freq) {
          heap.pop();
          heap.push(item);
        }
      }
      for (const [ch, nxt] of cur.children) {
        path[depth] = ch;
        dfs(nxt, depth + 1);
      }
    };
    dfs(node, 0);
    return heap
      .toArray()
      .sort((a, b) => b.freq - a.freq)
      .map(x => x.word);
  }
}

// класс PriorityQueue {



class PriorityQueue {
  constructor() {
    this.data = [];
    this._seq = 0;
  }
  enqueue(request, priority = 0) {
    const item = {
      request,
      priority: Number(priority) || 0,
      seq: this._seq++
    };
    this.data.push(item);
    this.#siftUp(this.data.length - 1);
  }
  dequeue() {
    if (!this.data.length) return null;
    const top = this.data[0];
    const last = this.data.pop();
    if (this.data.length) {
      this.data[0] = last;
      this.#siftDown(0);
    }
    return top;
  }
  size() { return this.data.length; }
  isEmpty() { return this.size() === 0; }
  #parent(i) { return ((i - 1) >> 1); }
  #left(i)   { return (i << 1) + 1; }
  #right(i)  { return (i << 1) + 2; }
  #greater(a, b) {
    if (a.priority !== b.priority)
      return a.priority > b.priority;
    return a.seq < b.seq;
  }
  #siftUp(i) {
    while (i > 0) {
      const p = this.#parent(i);
      if (this.#greater(this.data[p], this.data[i])) break;
      [this.data[i], this.data[p]] = [this.data[p], this.data[i]];
      i = p;
    }
  }
  #siftDown(i) {
    const n = this.data.length;
    while (true) {
      const l = this.#left(i);
      const r = this.#right(i);
      let s = i;
      if (l < n && this.#greater(this.data[l], this.data[s])) s = l;
      if (r < n && this.#greater(this.data[r], this.data[s])) s = r;
      if (s === i) break;
      [this.data[i], this.data[s]] = [this.data[s], this.data[i]];
      i = s;
    }
  }
}


// Проверка

const seed = [
  ['apple', 10],
  ['application', 5],
  ['banana', 3],
  ['book', 8],
  ['binary', 1],
  ['bee', 7],
  ['bat', 4],
  ['ball', 2]
];

const trie = new Trie();
for (const [w, f] of seed) {
  trie.insert(w, f);
}

console.log('Проверка автодополнения:');
console.log('app →', trie.autocomplete('app', 5));
console.log('b   →', trie.autocomplete('b', 5));

const pq = new PriorityQueue();
const handle = (req) => trie.autocomplete(req.prefix, 5);

pq.enqueue({ type: 'autocomplete', prefix: 'b' },   0);
pq.enqueue({ type: 'autocomplete', prefix: 'app' }, 0);
pq.enqueue({ type: 'autocomplete', prefix: 'bi' }, 1);
pq.enqueue({ type: 'autocomplete', prefix: 'ba' },  0);

console.log('Обработка очереди по приоритету:');
while (!pq.isEmpty()) {
  const { request, priority } = pq.dequeue();
  const res = handle(request);
  console.log(`priority=${priority}, prefix="${request.prefix}" →`, res);
}
