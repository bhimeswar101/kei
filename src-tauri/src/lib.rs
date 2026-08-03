use std::process::Command;

#[tauri::command]
fn open_application(target: String) -> Result<(), String> {
    let normalized = target.trim().to_lowercase();

    let command = match normalized.as_str() {
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
        .args(["/C", "start", "", command])
        .spawn()
        .map_err(|error| {
            format!(
                "Failed to launch \"{}\": {}",
                target, error
            )
        })?;

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(
            tauri::generate_handler![
                open_application
            ],
        )
        .run(tauri::generate_context!())
        .expect(
            "error while running tauri application",
        );
}