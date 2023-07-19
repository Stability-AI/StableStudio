// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::collections::HashMap;
use std::fs::File;
use tauri::api::process::CommandEvent;
use tauri::api::process::{
    Command,
    CommandEvent::{Error, Stderr, Stdout, Terminated},
};
use tauri::async_runtime::Receiver;
use tauri::utils::config::{AppUrl, WindowConfig};
use tauri::{RunEvent, WindowBuilder, WindowUrl};
use tauri_plugin_upload;

mod server;

fn main() {
    let port = portpicker::pick_unused_port().expect("failed to find unused port");

    let mut context = tauri::generate_context!();
    let url = format!("http://localhost:{}", port).parse().unwrap();
    let window_url = WindowUrl::External(url);
    // rewrite the config so the IPC is enabled on this URL
    if !cfg!(dev) {
        context.config_mut().build.dist_dir = AppUrl::Url(window_url.clone());
    }

    tauri::Builder::default()
        .plugin(server::Builder::new(port).build())
        .setup(move |app| {
            WindowBuilder::from_config(
                app,
                WindowConfig {
                    url: {
                        if cfg!(dev) {
                            Default::default()
                        } else {
                            window_url
                        }
                    },
                    height: 950.0,
                    width: 1800.0,
                    resizable: true,
                    title: "StableStudio".to_string(),
                    fullscreen: false,
                    center: true,
                    ..Default::default()
                },
            )
            .build()?;
            Ok(())
        })
        .plugin(tauri_plugin_upload::init())
        .invoke_handler(tauri::generate_handler![extract_zip, launch_comfy])
        .build(context)
        .expect("error while building tauri application")
        .run(move |_app_handle, event| match event {
            RunEvent::ExitRequested { .. } => {
                println!("Killing comfy...");
                tauri::api::process::kill_children();
                println!("Backend gracefully shutdown.");
            }
            _ => {}
        });
}

// tauri command to extract a zip from an arbitrary file path
#[tauri::command]
fn extract_zip(path: String, target_dir: String) -> Result<String, String> {
    println!("extracting zip from {} to {}", path, target_dir);
    let file = File::open(path).unwrap();
    let mut archive = zip::ZipArchive::new(file).unwrap();

    // unarchive in a thread
    let handle = std::thread::spawn(move || {
        archive.extract(target_dir).unwrap();
    });

    handle.join().unwrap();

    println!("extracted zip");
    Ok("completed".to_string())
}

async fn watch_comfy(
    mut rx: Receiver<CommandEvent>,
) -> (Receiver<CommandEvent>, Result<String, String>) {
    while let Some(i) = rx.recv().await {
        // check if output starts with "To see the GUI go to:"
        match i {
            Stdout(line) if line.len() > 1 => {
                if line.starts_with("To see the GUI go to:") {
                    println!("Comfy launched successfully!");
                    return (rx, Ok("completed".to_string()));
                }
                println!("[ComfyUI] stdout: {}", line);
            }
            Stderr(line) => {
                println!("[ComfyUI] stderr: {}", line);
            }
            Error(line) => {
                println!("[ComfyUI] error: {}", line);
            }
            Terminated(_) => {
                println!("Comfy terminated!");
                return (rx, Err("failed".to_string()));
            }
            _ => {}
        }
    }

    return (rx, Err("failed".to_string()));
}

// tauri command to launch python process
#[tauri::command]
async fn launch_comfy(path: String) -> Result<String, String> {
    // set working directory
    std::env::set_current_dir(path.clone()).unwrap();

    // test to make sure its not already running (just test port 5000)
    println!("Checking for existing comfy process...");
    let client = reqwest::Client::builder()
        .connect_timeout(std::time::Duration::from_secs(1))
        .build()
        .unwrap();
    let resp = client.get("http://localhost:5000").send().await;
    if resp.is_ok() {
        println!("Comfy already running, skipping launch.");
        return Ok("completed".to_string());
    }

    println!("--> launching comfy...");

    #[allow(unused_mut)]
    let (mut rx, _child) = Command::new({
        if cfg!(unix) {
            "python_embeded/python"
        } else if cfg!(windows) {
            "python_embeded/python.exe"
        } else if cfg!(macos) {
            "python_embeded/python.app"
        } else {
            panic!("Unsupported platform")
        }
    })
    .args(["-s", "ComfyUI/main.py", "--port", "5000"])
    .envs(HashMap::from([("PYTHONUNBUFFERED".into(), "1".into())]))
    .spawn()
    .expect("Failed to spawn ComfyUI process");

    // print output from python process
    let (rx, result) = watch_comfy(rx).await;
    tauri::async_runtime::spawn(watch_comfy(rx));

    result
}
