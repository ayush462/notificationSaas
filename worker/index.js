const { runConsumer } = require("./kafka/consumer");

runConsumer().catch((e) => {
  console.error("Worker failed", e);
  process.exit(1);
});
