use rusqlite::{Connection, Result};
use std::path::Path;

const MIGRATIONS: &[&str] = &[
    include_str!("../../migrations/001_initial.sql"),
    include_str!("../../migrations/002_collection_cover.sql"),
];

pub fn initialize_database(db_path: &Path) -> Result<Connection> {
    let conn = Connection::open(db_path)?;

    conn.execute_batch("PRAGMA journal_mode = WAL;")?;
    conn.execute_batch("PRAGMA foreign_keys = ON;")?;

    // Run base migration (CREATE TABLE IF NOT EXISTS — safe to re-run)
    conn.execute_batch(MIGRATIONS[0])?;

    // Run incremental migrations with error suppression for "duplicate column"
    for migration in &MIGRATIONS[1..] {
        let _ = conn.execute_batch(migration);
    }

    log::info!("Database initialized at {:?}", db_path);
    Ok(conn)
}
