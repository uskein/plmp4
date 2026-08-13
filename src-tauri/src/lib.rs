mod commands;
mod db;
mod utils;

use db::schema::initialize_database;
use db::DbState;
use std::path::PathBuf;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    env_logger::init();

    let app_data_dir = dirs::data_local_dir()
        .unwrap_or_else(|| PathBuf::from("."))
        .join("plmp4");

    std::fs::create_dir_all(&app_data_dir).expect("Failed to create app data directory");

    let db_path = app_data_dir.join("plmp4.db");
    let conn = initialize_database(&db_path).expect("Failed to initialize database");

    let db_state = DbState::new(conn);

    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .manage(db_state)
        .invoke_handler(tauri::generate_handler![
            commands::videos::import_video,
            commands::videos::list_videos,
            commands::videos::update_video_progress,
            commands::videos::delete_video,
            commands::annotations::add_annotation,
            commands::annotations::list_annotations,
            commands::annotations::update_annotation,
            commands::annotations::delete_annotation,
            commands::notebooks::create_collection,
            commands::notebooks::list_collections,
            commands::notebooks::update_collection,
            commands::notebooks::delete_collection,
            commands::notebooks::create_notebook,
            commands::notebooks::list_notebooks,
            commands::notebooks::create_note,
            commands::notebooks::update_note,
            commands::notebooks::list_notes,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
