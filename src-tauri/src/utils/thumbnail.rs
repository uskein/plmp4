use std::path::Path;

/// Generate a thumbnail from a video file using ffmpeg.
/// Extracts a frame at 1 second (or at 0 if duration < 1s) and saves as JPEG.
pub fn generate_thumbnail(video_path: &Path, output_path: &Path) -> Result<(), Box<dyn std::error::Error>> {
    let ffmpeg_path = which::which("ffmpeg")
        .map_err(|_| "ffmpeg not found in PATH. Install ffmpeg and ensure it is available.")?;

    let output_str = output_path.to_str().ok_or("Invalid output path")?;
    let input_str = video_path.to_str().ok_or("Invalid video path")?;

    // Try extracting frame at 1 second first
    let status = std::process::Command::new(&ffmpeg_path)
        .args([
            "-y",
            "-i", input_str,
            "-ss", "00:00:01",
            "-vframes", "1",
            "-vf", "scale=320:-1",
            "-q:v", "5",
            output_str,
        ])
        .stdout(std::process::Stdio::null())
        .stderr(std::process::Stdio::null())
        .status();

    match status {
        Ok(s) if s.success() => return Ok(()),
        _ => {
            // Fallback: try frame at 0 seconds
            let status2 = std::process::Command::new(&ffmpeg_path)
                .args([
                    "-y",
                    "-i", input_str,
                    "-ss", "00:00:00",
                    "-vframes", "1",
                    "-vf", "scale=320:-1",
                    "-q:v", "5",
                    output_str,
                ])
                .stdout(std::process::Stdio::null())
                .stderr(std::process::Stdio::null())
                .status()?;

            if !status2.success() {
                return Err("Failed to generate thumbnail with ffmpeg".into());
            }
        }
    }

    Ok(())
}
