const mongoose = require("mongoose");

const simulationLogSchema = new mongoose.Schema(
  {
    institutionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution",
      required: true,
    },
    drillId: { type: mongoose.Schema.Types.ObjectId, ref: "Drill" },
    notes: { type: String, trim: true },
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SimulationLog", simulationLogSchema);
