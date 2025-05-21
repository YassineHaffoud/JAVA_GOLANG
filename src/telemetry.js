// src/telemetry.js

const { NodeSDK }                = require('@opentelemetry/sdk-node');
const { PrometheusExporter }     = require('@opentelemetry/exporter-prometheus');
const { OTLPTraceExporter }      = require('@opentelemetry/exporter-trace-otlp-http');
const { registerInstrumentations } = require('@opentelemetry/instrumentation');
const { HttpInstrumentation }      = require('@opentelemetry/instrumentation-http');
const { ExpressInstrumentation }   = require('@opentelemetry/instrumentation-express');
const { logger }                   = require('./logger');

function initTelemetry() {
  // 1) Exporter Prometheus
  const promExporter = new PrometheusExporter(
      { startServer: true, port: Number(process.env.PROMETHEUS_PORT) || 9464 },
      () => logger.info(`✅ Prometheus metrics exposed on port ${process.env.PROMETHEUS_PORT || 9464}`)
  );

  // 2) Exporter OTLP pour les traces
  const traceExporter = new OTLPTraceExporter({
    url: process.env.OTLP_TRACE_ENDPOINT || 'http://localhost:4318/v1/traces',
  });

  // 3) Initialisation du SDK
  const sdk = new NodeSDK({
    traceExporter,
    metricReader: promExporter,
    instrumentations: [
      new HttpInstrumentation(),
      new ExpressInstrumentation(),
    ],
  });

  // 4) Démarrage DU SDK (synchrone), on logge après
  try {
    sdk.start();
    logger.info('✅ OpenTelemetry SDK started');
  } catch (err) {
    logger.error('❌ OpenTelemetry failed to start', err);
  }
}

module.exports = { initTelemetry };
