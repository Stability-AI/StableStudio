use std::{
    error::Error,
    fs::File,
    io::BufReader,
    path::{Path, PathBuf},
    sync::OnceLock,
};

use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct Settings {
    pub comfyui_location: Box<String>,
    pub comfyui_url: Box<String>,
}

#[derive(Clone)]
pub struct Store {
    pub path: PathBuf,
    pub data: Settings,
}

impl Store {
    pub fn save(&self) -> Result<(), Box<dyn Error>> {
        let file = File::create(&self.path)?;
        serde_json::to_writer(file, &self.data)?;
        Ok(())
    }
}

impl Clone for Settings {
    fn clone(&self) -> Self {
        Settings {
            comfyui_location: self.comfyui_location.clone(),
            comfyui_url: self.comfyui_url.clone(),
        }
    }
}

pub static SETTINGS: OnceLock<Store> = OnceLock::new();

pub fn create_settings(path: PathBuf, default: Settings) -> Result<&'static Store, Box<dyn Error>> {
    let file = match File::open(&path) {
        Ok(f) => f,
        Err(_) => {
            let file = File::create(&path.as_path())?;
            serde_json::to_writer(file, &default)?;
            return create_settings(path, default);
        }
    };
    let reader = BufReader::new(file);

    let u = match serde_json::from_reader::<_, Settings>(reader) {
        Ok(u) => u,
        Err(_) => {
            let file = File::create(&path.as_path())?;
            serde_json::to_writer(file, &default)?;
            default
        }
    };

    let s = Store { path, data: u };

    let _ = SETTINGS.set(s);

    Ok(SETTINGS.get().unwrap())
}

#[tauri::command]
pub fn get_setting(key: String) -> Result<String, String> {
    let s = SETTINGS.get().unwrap();
    match key.as_str() {
        "comfyui_location" => Ok(s.data.comfyui_location.to_string()),
        "comfyui_url" => Ok(s.data.comfyui_url.to_string()),
        _ => Err("Invalid key".to_string()),
    }
}

#[tauri::command]
pub fn set_setting(key: String, value: String) -> Result<(), String> {
    let mut s = SETTINGS.get().unwrap().clone();
    match key.as_str() {
        "comfyui_location" => {
            let path = Path::new(&value);
            if !path.exists() {
                return Err("Invalid path".to_string());
            }
            s.data.comfyui_location = Box::new(value);
        }
        "comfyui_url" => {
            s.data.comfyui_url = Box::new(value);
        }
        _ => return Err("Invalid key".to_string()),
    }

    let _ = s.save();
    let _ = SETTINGS.set(s);

    Ok(())
}
