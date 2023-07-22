use std::{collections::HashMap, fs::{File, self}, sync::Arc};

use http::{Uri, HeaderValue, HeaderName};
use tauri::{
    plugin::{Builder as PluginBuilder, TauriPlugin},
    Runtime,
};
use tiny_http::{Header, Response as HttpResponse, Server};

use crate::settings;

pub struct Response {
    headers: HashMap<String, String>,
}

impl Response {
    pub fn add_header<H: Into<String>, V: Into<String>>(&mut self, header: H, value: V) {
        self.headers.insert(header.into(), value.into());
    }
}

pub struct Builder {
    port: u16
}

impl Builder {
    pub fn new(port: u16) -> Self {
        Self {
            port
        }
    }

    pub fn build<R: Runtime>(self) -> TauriPlugin<R> {
        let port = self.port;

        PluginBuilder::new("localhost")
            .setup(move |app| {
                let server = Server::http(&format!("localhost:{port}")).expect("Unable to spawn server");
                let server = Arc::new(server);
                let mut guards = Vec::with_capacity(4);

                for _ in 0..5 {
                    let server = server.clone();
                    let asset_resolver = app.asset_resolver();
                    let guard = std::thread::spawn(move || {
                        // aquire a copy of appdata_path
                        for mut req in server.incoming_requests() {
                            let path = req
                                .url()
                                .parse::<Uri>()
                                .map(|uri| uri.path().to_string())
                                .unwrap_or_else(|_| req.url().into());
    
                            let split_path = path.split("/").collect::<Vec<&str>>();
                            let sliced_path = &split_path[1..split_path.len()];
    
                            let (file_name, mimetype, external_url): (
                                Option<String>,
                                Option<String>,
                                Option<String>,
                            ) = match sliced_path {
                                ["lib" | "scripts", ..] => (
                                    Some(sliced_path.clone().join("/")),
                                    Some(if sliced_path.last().unwrap().ends_with(".js") {
                                        "text/javascript".to_string()
                                    } else {
                                        "text/css".to_string()
                                    }),
                                    None,
                                ),
                                ["style.css"] => (
                                    Some("style.css".to_owned()),
                                    Some("text/css".to_string()),
                                    None,
                                ),
                                ["comfyui"] => (
                                    Some("index.html".to_owned()),
                                    Some("text/html".to_string()),
                                    None,
                                ),
                                ["api" | "prompt" | "object_info" | "view" | "history" | "queue" | "interrupt" | "extensions", ..] => (
                                    None,
                                    None,
                                    Some(
                                        settings::SETTINGS.get().unwrap().data.comfyui_url.to_string() + "/" + &sliced_path.join("/") + "?" + &req.url().split("?").collect::<Vec<&str>>()[1..].join("?"),
                                    ),
                                ),
                                [] | [_, _, ..] | [&_] => (None, None, None),
                            };
                            
                            if let Some(file_name) = file_name {
                                let path_name = format!(
                                    "{}/ComfyUI/ComfyUI/web/{}",
                                    settings::SETTINGS.get().unwrap().data.comfyui_location.to_string(),
                                    file_name
                                );
                            
                                let file = File::open(&path_name);
                            
                                if file.is_err() {
                                    println!("file not found: {}", path_name);
                                    return;
                                }
                            
                                // replace "/ws" with "/api/ws" in the file
                                let mut file_contents = fs::read_to_string(&path_name).unwrap();
                                file_contents = file_contents.replace(
                                    "`ws${window.location.protocol === \"https:\" ? \"s\" : \"\"}://${this.api_host}${this.api_base}/ws${existingSession}`",
                                    "`ws://localhost:5000/ws${existingSession}`"
                                );

                                // add some stuff to app.js
                                if path_name.ends_with("app.js") && !file_contents.ends_with("app.api = api;") {
                                    file_contents = file_contents + "\napp.api = api;";
                                }
                            
                                let response = HttpResponse::from_data(file_contents.as_bytes()).with_status_code(200).with_header(
                                    Header::from_bytes("Content-Type", mimetype.unwrap().as_str()).unwrap(),
                                );
                            
                                req.respond(response).expect("unable to setup response");
                                println!("served file: {}", path_name);
                            } else if let Some(external_url) = external_url {
                                println!("forwarding request to {}", external_url);
    
                                let mut content = String::new();
                                req.as_reader().read_to_string(&mut content).unwrap();
                            
                                // forward the request (using same headers and method and body)
                                let mut res: reqwest::blocking::Request = reqwest::blocking::Client::new()
                                    .request(
                                    reqwest::Method::from_bytes(req.method().as_str().as_bytes())
                                        .unwrap(),
                                        external_url,
                                    )
                                    .body(content)
                                    .build().unwrap();
    
                                for header in req.headers() {
                                    res.headers_mut().insert(
                                        HeaderName::from_bytes(header.field.as_str().as_bytes()).unwrap(),
                                        HeaderValue::from_str(header.value.as_str()).unwrap(),
                                    );
                                }
    
                                let res = match reqwest::blocking::Client::new().execute(res) {
                                    Ok(r) => r,
                                    Err(e) => {
                                        println!("error forwarding request: {:?}", e);
                                        return;
                                    }
                                };
    
                                let status = res.status();
                                let headers = res.headers().clone();
                            
                                // copy the response into the body
                                let mut response = HttpResponse::from_data(res.bytes().unwrap().to_vec()).with_status_code(status.as_u16() as u16);
                            
                                // set the response headers
                                for header in headers.into_iter() {
                                    response.add_header(Header::from_bytes(header.0.unwrap().as_str(), header.1.to_str().unwrap()).unwrap());
                                }
    
                                req.respond(response).expect("unable to setup response");
    
                            
                            } else {
                                #[allow(unused_mut)]
                                if let Some(mut asset) = asset_resolver.get(path.to_string()) {
                        
                                    let mut response = Response {
                                        headers: Default::default(),
                                    };
    
                                    response.add_header("Content-Type", asset.mime_type);
                                    if let Some(csp) = asset.csp_header {
                                        response
                                            .headers
                                            .insert("Content-Security-Policy".into(), csp);
                                    }
    
                                    #[cfg(target_os = "linux")]
                                    if let Some(response_csp) =
                                        response.headers.get("Content-Security-Policy")
                                    {
                                        let html = String::from_utf8_lossy(&asset.bytes);
                                        let body =
                                            html.replacen(tauri::utils::html::CSP_TOKEN, response_csp, 1);
                                        asset.bytes = body.as_bytes().to_vec();
                                    }
    
                                    let mut resp = HttpResponse::from_data(asset.bytes);
                                    for (header, value) in response.headers {
                                        if let Ok(h) = Header::from_bytes(header.as_bytes(), value) {
                                            resp.add_header(h);
                                        }
                                    }
                                    req.respond(resp).expect("unable to setup response");
                                } else {
                                    req.respond(
                                        HttpResponse::from_string("404 - Not Found")
                                            .with_status_code(404),
                                    )
                                    .expect("unable to setup response");
                                }
                            }
                        }
                    });
                    guards.push(guard);
                }
                Ok(())
            })
            .build()
    }
}
