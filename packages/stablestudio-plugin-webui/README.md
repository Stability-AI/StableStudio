This is a basic implement for stable-diffusion-webui plugin.

# How to use
1. On stable-diffusion-webui side, edit webui-user.bat and  
`set COMMANDLINE_ARGS=--nowebui --cors-allow-origins=http://localhost:3000`  
Then start your webui.
2. Once you see **INFO:     Uvicorn running on http://127.0.0.1:7861**, means you started webui on api mode successfully.
you can open http://127.0.0.1:7861/docs to double check.
3. On StableStudio side, run `yarn dev:use-webui-plugin`
4. once the server started, click settings to check this plugin loaded successfully or not. ![webui-plugin](docs/images/webui-plugin.png)
![overall](docs/images/overall.png)
5. click **Dream**, your webui server should start to process your request from StableStudio.
6. if you need to load existing from webui, you also need to install the extension [sd-webui-StableStudio](https://github.com/jtydhr88/sd-webui-StableStudio))

Still, currently this plugin is a basic implement for webui, and only support a few of features:
- [x] txt2img
- [x] basic features (prompt, negative prompt, steps, batch_size, image size)
- [x] features provided by StableStudio
- [x] model select
- [x] sampler select
- [x] img2img
- [x] mask/inpaint/outpaint
- [x] store settings
- [x] webui status could replace images generated status
- [x] load existing images (need an extension on webui: [sd-webui-StableStudio](https://github.com/jtydhr88/sd-webui-StableStudio))
- [x] Need to think about how to deal with extensions ecosystem in webui (made a start with [sd-webui-StableStudio](https://github.com/jtydhr88/sd-webui-StableStudio))
- [x] upscale 
- [ ] test and bugs fix (working)
- [ ] Lora support
- [ ] plugin could use path in settings along with a field for extra cli flags to launch webui on startup
- [ ] MacOS and Linux support (since I don’t have environment with MacOS/Linux, may need someone help with this)
- [ ] many other features from webui...