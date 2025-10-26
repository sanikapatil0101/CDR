const mongoose = require("mongoose");

const testSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  startedAt: { type: Date, default: Date.now },
  finishedAt: { type: Date },
  answers: [
    {
      qId: String,
      rating: Number,
    }
  ],
  score: Number,
}, { timestamps: true });

module.exports = mongoose.model("Test", testSchema);
