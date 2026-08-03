mod ai;

use std::process::Command;

use ai::gemini::GeminiClient;

const GEMINI_MODEL: &str = "gemini-3.5-flash";

#[tauri::command]
fn open_application(
    target: String,
) -> Result<(), String> {
    let normalized =
        target.trim().to_lowercase();

    let command =
        match normalized.as_str() {
            "spotify" => "spotify",
            "calculator" | "calc" => "calc",
            "notepad" => "notepad",
            "paint" => "mspaint",
            "command prompt" | "cmd" => "cmd",
            "powershell" => "powershell",

            _ => {
                return Err(format!(
                    "Application \"{}\" is not an approved application target.",
                    target
                ));
            }
        };

    Command::new("cmd")
        .args([
            "/C",
            "start",
            "",
            command,
        ])
        .spawn()
        .map_err(|error| {
            format!(
                "Failed to launch \"{}\": {}",
                target,
                error
            )
        })?;

    Ok(())
}

#[tauri::command]
async fn gemini_generate(
    prompt: String,
) -> Result<String, String> {
    let api_key = std::env::var("GEMINI_API_KEY")
        .map_err(|_| {
            "GEMINI_API_KEY is not configured."
                .to_string()
        })?;

    if api_key.trim().is_empty() {
        return Err(
            "GEMINI_API_KEY is empty."
                .to_string(),
        );
    }

    let client =
        GeminiClient::new(
            api_key,
            GEMINI_MODEL,
        );

    client.generate(&prompt).await
}

#[cfg_attr(
    mobile,
    tauri::mobile_entry_point
)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(
            tauri::generate_handler![
                open_application,
                gemini_generate,
            ],
        )
        .run(
            tauri::generate_context!(),
        )
        .expect(
            "error while running tauri application",
        );
}