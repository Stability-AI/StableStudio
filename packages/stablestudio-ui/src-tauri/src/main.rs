// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::collections::HashMap;
use std::fs::File;
use tauri::api::process::Command;
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
    context.config_mut().build.dist_dir = AppUrl::Url(window_url.clone());

    tauri::Builder::default()
        .plugin(server::Builder::new(port).build())
        .setup(move |app| {
            WindowBuilder::from_config(
                app,
                WindowConfig {
                    url: window_url,
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

// tauri command to launch python process
#[tauri::command]
fn launch_comfy(path: String) -> Result<String, String> {
    // set working directory
    std::env::set_current_dir(path.clone()).unwrap();

    tauri::async_runtime::spawn(async move {
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
        while let Some(i) = rx.recv().await {
            println!("ComfyUI: {:?}", i);
        }
    });

    println!("--> launching comfy...");

    Ok("completed".to_string())
}
