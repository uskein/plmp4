use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Collection {
    pub id: String,
    pub name: String,
    pub parent_id: Option<String>,
    pub cover_image: Option<String>,
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Video {
    pub id: String,
    pub title: String,
    pub file_path: String,
    pub collection_id: Option<String>,
    pub duration_seconds: f64,
    pub playback_position: f64,
    pub thumbnail_path: Option<String>,
    pub last_watched_at: Option<String>,
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct VideoAnnotation {
    pub id: String,
    pub video_id: String,
    pub timestamp_seconds: f64,
    pub note_text: String,
    pub highlight_color: String,
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct VirtualNotebook {
    pub id: String,
    pub title: String,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Note {
    pub id: String,
    pub notebook_id: String,
    pub content: String,
    pub position_order: i32,
    pub created_at: String,
}
