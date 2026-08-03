use reqwest::Client;
use serde::{Deserialize, Serialize};

const GEMINI_API_BASE_URL: &str =
    "https://generativelanguage.googleapis.com/v1beta";

#[derive(Debug, Serialize)]
struct GeminiPart {
    text: String,
}

#[derive(Debug, Serialize)]
struct GeminiContent {
    parts: Vec<GeminiPart>,
}

#[derive(Debug, Serialize)]
struct GeminiGenerateRequest {
    contents: Vec<GeminiContent>,
}

#[derive(Debug, Deserialize)]
struct GeminiGenerateResponse {
    candidates: Vec<GeminiCandidate>,
}

#[derive(Debug, Deserialize)]
struct GeminiCandidate {
    content: GeminiResponseContent,
}

#[derive(Debug, Deserialize)]
struct GeminiResponseContent {
    parts: Vec<GeminiResponsePart>,
}

#[derive(Debug, Deserialize)]
struct GeminiResponsePart {
    text: Option<String>,
}

pub struct GeminiClient {
    client: Client,
    api_key: String,
    model: String,
}

impl GeminiClient {
    pub fn new(
        api_key: impl Into<String>,
        model: impl Into<String>,
    ) -> Self {
        Self {
            client: Client::new(),
            api_key: api_key.into(),
            model: model.into(),
        }
    }

    pub async fn generate(
        &self,
        prompt: &str,
    ) -> Result<String, String> {
        let prompt = prompt.trim();

        if prompt.is_empty() {
            return Err(
                "Gemini prompt cannot be empty.".to_string(),
            );
        }

        let url = format!(
            "{}/models/{}:generateContent",
            GEMINI_API_BASE_URL,
            self.model,
        );

        let request = GeminiGenerateRequest {
            contents: vec![GeminiContent {
                parts: vec![GeminiPart {
                    text: prompt.to_string(),
                }],
            }],
        };
        println!("Model: {}", self.model);
println!("URL: {}", url);

        

        let response = self
            .client
            .post(url)
            .header("x-goog-api-key", &self.api_key)
            .json(&request)
            .send()
            .await
            .map_err(|error| {
                format!(
                    "Failed to contact Gemini: {}",
                    error,
                )
            })?;

        let status = response.status();

        if !status.is_success() {
            let body = response
                .text()
                .await
                .unwrap_or_default();

            return Err(format!(
                "Gemini request failed with status {}: {}",
                status,
                body,
            ));
        }

        let response = response
            .json::<GeminiGenerateResponse>()
            .await
            .map_err(|error| {
                format!(
                    "Failed to decode Gemini response: {}",
                    error,
                )
            })?;

        let text = response
            .candidates
            .first()
            .and_then(|candidate| {
                candidate.content.parts.first()
            })
            .and_then(|part| part.text.as_deref())
            .map(str::trim)
            .filter(|text| !text.is_empty())
            .ok_or_else(|| {
                "Gemini returned no text response.".to_string()
            })?;

        Ok(text.to_string())
    }
}