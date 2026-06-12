// Prometheus metrics helpers used by the app router.

use prometheus::{HistogramOpts, HistogramVec, Registry};

pub fn create_metrics(registry: &Registry) -> HistogramVec {
    let histogram = HistogramVec::new(
        HistogramOpts::new(
            "fusionos_http_request_duration_seconds",
            "HTTP request duration in seconds",
        )
        .buckets(vec![0.01, 0.05, 0.1, 0.25, 0.5, 1.0, 2.0, 5.0]),
        &["method", "route", "status_code"],
    )
    .expect("Failed to create histogram");

    registry
        .register(Box::new(histogram.clone()))
        .expect("Failed to register histogram");

    histogram
}
