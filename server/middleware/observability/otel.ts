// server/middleware/otel.js
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';

const traceExporter = new OTLPTraceExporter({
  // Collector inside docker network:
  url:
    process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT ||
    'http://otel-collector:4318/v1/traces',
});

const sdk = new NodeSDK({
  traceExporter,
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();

process.on('SIGTERM', async () => {
  try {
    await sdk.shutdown();
  } finally {
    process.exit(0);
  }
});
