use std::path::Path;
use std::process::Command;

/// Get video duration in seconds using ffprobe.
pub fn get_video_duration(video_path: &Path) -> Result<f64, Box<dyn std::error::Error>> {
    let ffprobe_path = which::which("ffprobe")
        .map_err(|_| "ffprobe not found in PATH")?;

    let output = Command::new(&ffprobe_path)
        .args([
            "-v", "quiet",
            "-print_format", "json",
            "-show_format",
            video_path.to_str().ok_or("Invalid path")?,
        ])
        .output()?;

    let stdout = String::from_utf8(output.stdout)?;
    let parsed: serde_json::Value = serde_json::from_str(&stdout)?;

    let duration = parsed["format"]["duration"]
        .as_str()
        .and_then(|s| s.parse::<f64>().ok())
        .unwrap_or(0.0);

    Ok(duration)
}
