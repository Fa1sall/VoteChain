import crypto from "crypto";

class Block {
  constructor(index, timestamp, votes, previousHash = "") {
    this.index = index;
    this.timestamp = timestamp;
    this.votes = votes; // array of votes
    this.previousHash = previousHash;
    this.hash = this.calculateHash();
  }

  calculateHash() {
    return crypto
      .createHash("sha256")
      .update(
        this.index +
          this.previousHash +
          this.timestamp +
          JSON.stringify(this.votes)
      )
      .digest("hex");
  }
}

class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.voters = new Set(); // to prevent double-voting
  }

  createGenesisBlock() {
    return new Block(0, Date.now(), [], "0");
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  addBlock(vote) {
    // Prevent double voting
    if (this.voters.has(vote.voterId)) {
      throw new Error("Voter has already cast a vote!");
    }

    this.voters.add(vote.voterId);

    const newBlock = new Block(
      this.chain.length,
      Date.now(),
      [vote],
      this.getLatestBlock().hash
    );

    this.chain.push(newBlock);
    return newBlock;
  }

  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const prevBlock = this.chain[i - 1];

      if (currentBlock.hash !== currentBlock.calculateHash()) return false;
      if (currentBlock.previousHash !== prevBlock.hash) return false;
    }
    return true;
  }
}

export default Blockchain;
