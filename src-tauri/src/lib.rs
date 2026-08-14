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

#[tauri::command]
fn get_gemini_api_key() -> Result<String, String> {
    std::env::var("GEMINI_API_KEY")
        .map_err(|_| "GEMINI_API_KEY is not configured.".to_string())
}

#[tauri::command]
fn close_application(target: String) -> Result<(), String> {
    let normalized = target.trim().to_lowercase();
    let exec_name = match normalized.as_str() {
        "spotify" => "Spotify.exe",
        "calculator" | "calc" => "CalculatorApp.exe",
        "notepad" => "notepad.exe",
        "paint" => "mspaint.exe",
        "command prompt" | "cmd" => "cmd.exe",
        "powershell" => "powershell.exe",
        _ => return Err("Not an approved application target.".to_string()),
    };

    Command::new("taskkill")
        .args(["/IM", exec_name, "/F"])
        .spawn()
        .map_err(|error| format!("Failed to close application: {}", error))?;

    Ok(())
}

#[tauri::command]
fn open_browser_url(url: String) -> Result<(), String> {
    let normalized = url.trim().to_lowercase();
    if !normalized.starts_with("http://") && !normalized.starts_with("https://") {
        return Err("Only HTTP and HTTPS URL schemes are allowed.".to_string());
    }

    if url.contains('"') || url.contains('&') || url.contains('|') || url.contains(';') || url.contains('\n') || url.contains('\r') {
        return Err("URL contains invalid characters.".to_string());
    }

    Command::new("cmd")
        .args(["/C", "start", "", &url])
        .spawn()
        .map_err(|error| format!("Failed to open browser: {}", error))?;

    Ok(())
}

#[tauri::command]
fn search_browser(query: String) -> Result<(), String> {
    let mut encoded = String::new();
    for c in query.chars() {
        if c.is_alphanumeric() {
            encoded.push(c);
        } else if c == ' ' {
            encoded.push('+');
        } else {
            encoded.push_str(&format!("%{:02X}", c as u32));
        }
    }

    let url = format!("https://www.google.com/search?q={}", encoded);
    open_browser_url(url)
}

#[tauri::command]
fn control_media(action: String) -> Result<(), String> {
    let normalized = action.trim().to_lowercase();
    if normalized != "play" && normalized != "pause" {
        return Err("Invalid media action.".to_string());
    }

    println!("[NativeMedia] Triggered action: {}", normalized);
    Ok(())
}

#[tauri::command]
fn search_files(query: String) -> Result<Vec<String>, String> {
    if query.contains("..") || query.contains('/') || query.contains('\\') {
        return Err("Path traversal characters are not allowed.".to_string());
    }

    let base_dir = std::env::current_dir().map_err(|e| e.to_string())?;
    let mut files = Vec::new();

    if let Ok(entries) = std::fs::read_dir(base_dir) {
        for entry in entries {
            if let Ok(entry) = entry {
                let file_name = entry.file_name().to_string_lossy().to_string();
                if file_name.to_lowercase().contains(&query.to_lowercase()) {
                    files.push(file_name);
                }
            }
        }
    }

    Ok(files)
}

#[tauri::command]
fn read_file(path: String) -> Result<String, String> {
    if path.contains("..") {
        return Err("Path traversal characters are not allowed.".to_string());
    }

    let base_dir = std::env::current_dir().map_err(|e| e.to_string())?;
    let target_path = base_dir.join(&path);

    if !target_path.starts_with(&base_dir) {
        return Err("Access denied: path traversal attempt detected.".to_string());
    }

    let content = std::fs::read_to_string(target_path)
        .map_err(|error| format!("Failed to read file: {}", error))?;
    Ok(content)
}

#[tauri::command]
fn create_automation(trigger: String, action: String) -> Result<(), String> {
    println!("[NativeAutomation] Trigger: {}, Action: {}", trigger, action);
    Ok(())
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
                close_application,
                open_browser_url,
                search_browser,
                control_media,
                search_files,
                read_file,
                create_automation,
                gemini_generate,
                get_gemini_api_key,
            ],
        )
        .run(
            tauri::generate_context!(),
        )
        .expect(
            "error while running tauri application",
        );
}