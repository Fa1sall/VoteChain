import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import Blockchain from "./blockchain.js";

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

const voteChain = new Blockchain();

// Candidates list
const candidates = [
  {
    id: "c1",
    name: "Devaraj",
    role: "Student",
    bio: "A dependable and hardworking class representative, always ready to help peers and contribute innovative ideas.",
    avatar: "https://i.pravatar.cc/150?img=12",
  },
  {
    id: "c2",
    name: "Aatheka",
    role: "Student",
    bio: "Creative, enthusiastic, and an excellent team player who inspires others to achieve their best.",
    avatar: "https://i.pravatar.cc/150?img=47",
  },
  {
    id: "c3",
    name: "Arjun",
    role: "Student",
    bio: "Focused, motivated, and always brings positivity and dedication to every project or discussion.",
    avatar: "https://i.pravatar.cc/150?img=54",
  },
  {
    id: "c4",
    name: "Christopher",
    role: "Student",
    bio: "Energetic, approachable, and known for helping classmates solve problems efficiently.",
    avatar: "https://i.pravatar.cc/150?img=68",
  },
  {
    id: "c5",
    name: "Aasikha",
    role: "Student",
    bio: "Curious, intelligent, and committed to bringing fresh perspectives to class activities.",
    avatar: "https://i.pravatar.cc/150?img=32",
  },
];

// Fetch candidates
app.get("/api/candidates", (req, res) => {
  res.json(candidates);
});

// Cast a vote
app.post("/api/vote", (req, res) => {
  const { voterId, voterName, candidateId } = req.body;

  if (!voterId || !voterName || !candidateId) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  try {
    const vote = { voterId, voterName, candidateId };
    const block = voteChain.addBlock(vote);
    res.json({ message: "Vote recorded!", block });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Fetch blockchain
app.get("/api/chain", (req, res) => {
  res.json({
    chain: voteChain.chain,
    valid: voteChain.isChainValid(),
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
