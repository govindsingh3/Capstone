const computeDrillScore = ({ participationRate, responseTime, coordinationScore }) => {
  const participation = Math.min(Math.max(participationRate, 0), 100);
  const coordination = Math.min(Math.max(coordinationScore, 0), 100);
  const response = Math.min(Math.max(responseTime, 1), 300);

  const participationScore = participation * 0.4;
  const coordinationScoreWeighted = coordination * 0.4;
  const responseScore = (1 - response / 300) * 100 * 0.2;

  return Math.round(participationScore + coordinationScoreWeighted + responseScore);
};

module.exports = { computeDrillScore };
