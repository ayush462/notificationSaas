const { Kafka } = require("kafkajs");
const config = require("../config");
const kafka = new Kafka({ clientId: `${config.kafkaClientId}-producer`, brokers: config.kafkaBrokers });
const producer = kafka.producer();
let connected = false;

async function sendToDlq(payload) {
  if (!connected) { await producer.connect(); connected = true; }
  await producer.send({ topic: config.topicDlq, messages: [{ key: payload.id, value: JSON.stringify(payload) }] });
}

async function retryNotification(payload) {
  if (!connected) { await producer.connect(); connected = true; }
  await producer.send({ topic: config.topicNotifications, messages: [{ key: payload.id, value: JSON.stringify(payload) }] });
}

module.exports = { sendToDlq, retryNotification };
