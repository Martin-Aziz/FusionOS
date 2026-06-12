// Request ID middleware is handled by tower-http's SetRequestId layer.
// This module re-exports the configuration helpers.

use tower_http::request_id::{MakeRequestId, RequestId};
use uuid::Uuid;
use axum::http::HeaderValue;

#[derive(Clone)]
pub struct MakeUuidRequestId;

impl MakeRequestId for MakeUuidRequestId {
    fn make_request_id<B>(&mut self, _: &axum::http::Request<B>) -> Option<RequestId> {
        let id = Uuid::new_v4().to_string();
        HeaderValue::from_str(&id).ok().map(RequestId::new)
    }
}
