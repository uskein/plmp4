pub mod models;
pub mod schema;

use std::sync::Mutex;
use rusqlite::Connection;

pub struct DbState {
    pub conn: Mutex<Connection>,
}

impl DbState {
    pub fn new(conn: Connection) -> Self {
        Self {
            conn: Mutex::new(conn),
        }
    }
}
