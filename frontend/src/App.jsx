import { useState, useEffect } from "react";
import axios from "axios";
import { FiCheckCircle, FiXCircle, FiClock, FiCpu } from "react-icons/fi";
import { BsBoxSeam } from "react-icons/bs";
import { motion, AnimatePresence } from "motion/react";

const API = "http://localhost:5000";

export default function App() {
  const [voterId, setVoterId] = useState("");
  const [voterName, setVoterName] = useState("");
  const [candidateId, setCandidateId] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [results, setResults] = useState({});
  const [message, setMessage] = useState("");
  const [chain, setChain] = useState([]);
  const [isValid, setIsValid] = useState(true);
  const [isMining, setIsMining] = useState(false);
  const [loadingCandidates, setLoadingCandidates] = useState(true);

  // Fetch candidates
  const fetchCandidates = async () => {
    try {
      setLoadingCandidates(true);
      const res = await axios.get(`${API}/api/candidates`);
      setCandidates(res.data);
      setLoadingCandidates(false);
    } catch (err) {
      console.error("Error fetching candidates:", err);
      setMessage("Failed to load candidates. Try refreshing.");
      setLoadingCandidates(false);
    }
  };

  // Fetch blockchain & results
  const fetchChain = async () => {
    try {
      const res = await axios.get(`${API}/api/chain`);
      setChain(res.data.chain);
      setIsValid(res.data.valid);

      const voteCounts = {};
      res.data.chain.forEach((block) => {
        block.votes.forEach((vote) => {
          const candidate = candidates.find((c) => c.id === vote.candidateId);
          if (candidate) {
            voteCounts[candidate.name] = (voteCounts[candidate.name] || 0) + 1;
          }
        });
      });
      setResults(voteCounts);
    } catch (err) {
      console.error("Error fetching chain:", err);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  useEffect(() => {
    if (candidates.length > 0) fetchChain();
  }, [candidates]);

  const handleVote = async () => {
    if (!voterId || !voterName || !candidateId) {
      setMessage("Please fill in all fields.");
      return;
    }
    try {
      setIsMining(true);
      setMessage("Mining new block...");

      await axios.post(`${API}/api/vote`, {
        voterId,
        voterName,
        candidateId,
      });

      setTimeout(async () => {
        setMessage("Vote recorded successfully!");
        setIsMining(false);
        setVoterId("");
        setVoterName("");
        setCandidateId("");
        setSelectedCandidate(null);
        await fetchChain();
      }, 1500);
    } catch (err) {
      setMessage(err.response?.data?.error || "Error occurred");
      setIsMining(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <header className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-extrabold text-blue-700 tracking-tight">
          VoteChain
        </h1>
        <p className="text-gray-600 mt-2 text-lg">
          Blockchain-powered Secure Voting System
        </p>
      </header>

      {/* Main Section */}
      <main className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {/* Voting Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white shadow-lg rounded-xl p-6 border"
        >
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Cast Your Vote
          </h2>

          <input
            type="text"
            placeholder="Your Voter ID"
            value={voterId}
            onChange={(e) => setVoterId(e.target.value)}
            className="border p-3 w-full mb-4 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <input
            type="text"
            placeholder="Your Full Name"
            value={voterName}
            onChange={(e) => setVoterName(e.target.value)}
            className="border p-3 w-full mb-4 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />

          <select
            value={candidateId}
            onChange={(e) => {
              setCandidateId(e.target.value);
              const cand = candidates.find((c) => c.id === e.target.value);
              setSelectedCandidate(cand || null);
            }}
            className="border p-3 w-full mb-4 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            disabled={loadingCandidates}
          >
            <option value="">Select Candidate</option>
            {candidates.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Candidate Details */}
          {selectedCandidate && (
            <div className="bg-gray-50 border p-4 rounded-lg mb-4 flex flex-col md:flex-row items-center gap-4">
              <img
                src={selectedCandidate.avatar}
                alt={selectedCandidate.name}
                className="w-20 h-20 rounded-full"
              />
              <div className="text-center md:text-left">
                <h3 className="font-bold text-lg">{selectedCandidate.name}</h3>
                <p className="text-gray-600 text-sm">
                  {selectedCandidate.role}
                </p>
                <p className="text-gray-700 text-sm mt-1">
                  {selectedCandidate.bio}
                </p>
              </div>
            </div>
          )}

          <button
            onClick={handleVote}
            disabled={isMining || loadingCandidates}
            className={`${
              isMining
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            } text-white px-4 py-3 rounded-lg w-full font-semibold transition`}
          >
            {isMining ? "Mining..." : "Submit Vote"}
          </button>

          {message && (
            <div className="mt-4 flex items-center space-x-2 text-sm font-medium">
              {isMining ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    repeat: Infinity,
                    duration: 1,
                    ease: "linear",
                  }}
                >
                  <FiClock className="text-blue-600" />
                </motion.div>
              ) : (
                <FiCheckCircle className="text-green-600" />
              )}
              <span className="text-gray-700">{message}</span>
            </div>
          )}
        </motion.div>

        {/* Results */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white shadow-lg rounded-xl p-6 border"
        >
          <h2 className="text-2xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
            <FiCpu className="text-blue-600" /> Live Results
          </h2>
          {Object.keys(results).length === 0 ? (
            <p className="text-gray-500">No votes yet.</p>
          ) : (
            <ul className="divide-y">
              {Object.entries(results).map(([name, count], idx) => (
                <motion.li
                  key={name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex justify-between py-3 text-lg font-medium"
                >
                  <span>{name}</span>
                  <span className="text-blue-700">{count}</span>
                </motion.li>
              ))}
            </ul>
          )}
        </motion.div>
      </main>

      {/* Blockchain Explorer */}
      <section className="mt-14 max-w-6xl mx-auto">
        <div className="flex items-center gap-2 mb-4">
          <BsBoxSeam className="text-blue-600 text-2xl" />
          <h2 className="text-3xl font-bold text-gray-800">
            Blockchain Explorer
          </h2>
        </div>

        <p
          className={`mb-6 flex items-center gap-2 font-semibold ${
            isValid ? "text-green-600" : "text-red-600"
          }`}
        >
          {isValid ? (
            <>
              <FiCheckCircle /> Blockchain is Valid
            </>
          ) : (
            <>
              <FiXCircle /> Blockchain is Tampered
            </>
          )}
        </p>

        {chain.length === 0 ? (
          <p className="text-gray-500">No blocks yet.</p>
        ) : (
          <div className="flex flex-col items-center space-y-10">
            <AnimatePresence>
              {chain.map((block, idx) => (
                <motion.div
                  key={block.index}
                  initial={{ opacity: 0, y: 40, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.6, delay: idx * 0.2 }}
                  className="relative bg-white rounded-lg shadow-md p-5 border w-full max-w-md"
                >
                  <h3 className="text-lg font-bold mb-2 text-blue-700">
                    Block #{block.index}
                  </h3>
                  <p className="text-sm text-gray-500 mb-2 flex items-center gap-2">
                    <FiClock />{" "}
                    {new Date(parseInt(block.timestamp)).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-600 mb-1 break-all font-mono">
                    <strong>Hash:</strong> {block.hash}
                  </p>
                  <p className="text-xs text-gray-600 mb-3 break-all font-mono">
                    <strong>Prev:</strong> {block.previousHash}
                  </p>

                  <div className="bg-gray-50 p-2 rounded">
                    <h4 className="text-sm font-semibold mb-1">Votes:</h4>
                    {block.votes.length === 0 ? (
                      <p className="text-gray-400 text-sm">No votes in block</p>
                    ) : (
                      <ul className="space-y-1 text-sm">
                        {block.votes.map((v, i) => (
                          <li
                            key={i}
                            className="flex justify-between bg-white px-2 py-1 rounded shadow-sm"
                          >
                            <span className="font-medium">
                              {v.voterName} →{" "}
                              {candidates.find((c) => c.id === v.candidateId)
                                ?.name || v.candidateId}
                            </span>
                            <span className="text-gray-500 text-xs">
                              ID: {v.voterId}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {idx < chain.length - 1 && (
                    <div className="absolute left-1/2 -bottom-10 w-1 h-10 bg-blue-300"></div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>
    </div>
  );
}
