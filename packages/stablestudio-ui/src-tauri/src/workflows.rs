use std::{
    fs,
    io::{BufReader, BufWriter},
};

use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct Workflow {
    pub name: String,
    pub description: Option<String>,
    pub icon: Option<String>,
    pub serialized_workflow: String,
    pub created_at: String,
}

#[tauri::command]
pub fn fetch_workflows(handle: tauri::AppHandle) -> Result<Vec<Workflow>, String> {
    let mut workflows: Vec<Workflow> = Vec::new();
    let mut path = handle.path_resolver().app_data_dir().unwrap();
    path.push("workflows");

    // create directory if it doesn't exist
    std::fs::create_dir_all(&path).unwrap();

    for entry in fs::read_dir(path).unwrap() {
        let entry = entry.unwrap();
        let path = entry.path();
        let metadata = fs::metadata(&path).unwrap();
        if metadata.is_file() {
            let workflow_file = fs::File::open(path).unwrap();
            let reader = BufReader::new(workflow_file);
            if let Ok(workflow_data) = serde_json::from_reader(reader) {
                workflows.push(workflow_data);
            }
        }
    }
    Ok(workflows)
}

#[tauri::command]
pub fn save_workflow(
    handle: tauri::AppHandle,
    serialized_workflow: String,
    name: String,
    description: Option<String>,
    icon: Option<String>,
) -> Result<(), String> {
    let mut workflow_path = handle.path_resolver().app_data_dir().unwrap();
    workflow_path.push("workflows");

    // create directory if it doesn't exist
    std::fs::create_dir_all(&workflow_path).unwrap();

    let file_name = name.replace(" ", "_").to_lowercase();
    workflow_path.push(format!("{file_name}.json"));

    let workflow_file = fs::File::create(workflow_path).unwrap();
    let writer = BufWriter::new(workflow_file);

    match serde_json::to_writer(
        writer,
        &Workflow {
            name,
            description,
            icon,
            serialized_workflow,
            created_at: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_secs()
                .to_string(),
        },
    ) {
        Ok(_) => Ok(()),
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command]
pub fn delete_workflow(handle: tauri::AppHandle, name: String) -> Result<(), String> {
    let mut workflow_path = handle.path_resolver().app_data_dir().unwrap();
    workflow_path.push("workflows");

    // create directory if it doesn't exist
    std::fs::create_dir_all(&workflow_path).unwrap();

    workflow_path.push(format!("{name}.json"));

    match fs::remove_file(workflow_path) {
        Ok(_) => Ok(()),
        Err(e) => Err(e.to_string()),
    }
}
