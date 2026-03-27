const { Kafka } = require("kafkajs");
const config = require("../config");

(async () => {
  const kafka = new Kafka({ clientId: `${config.kafkaClientId}-admin`, brokers: config.kafkaBrokers });
  const admin = kafka.admin();
  await admin.connect();
  await admin.createTopics({
    waitForLeaders: true,
    topics: [
      { topic: config.topicNotifications, numPartitions: 6, replicationFactor: 1 },
      { topic: config.topicDlq, numPartitions: 3, replicationFactor: 1 }
    ]
  });
  await admin.disconnect();
  console.log("Kafka topics are ready");
})();
