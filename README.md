<div align="center" style="display: flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: 1em; margin: 4em 0;">

<img src="./misc/Banner.png" />

**🗺 Contents – [🚀 Quick Start](#quick-start) · [ℹ️ About](#about) · [🙋 FAQ](#faq) · [🧑‍💻 Contributing](#contributing)**

**📚 Documentation – [🎨 UI](./packages/stablestudio-ui/README.md) · <a href="https://platform.stability.ai" target="_blank">⚡️ platform.stability.ai</a>**

**🔗 Links – <a href="https://discord.com/channels/1002292111942635562/1108055793674227782" target="_blank">🎮 Discord</a> · <a href="https://dreamstudio.ai" target="_blank">🌈 DreamStudio</a> · <a href="https://github.com/Stability-AI/StableStudio/issues">🛟 Bugs & Support</a> · <a href="https://github.com/Stability-AI/StableStudio/discussions">💬 Discussion</a>**

<br />

</div>

# 🚀 Installation

You'll need to head over to the [Releases](https://github.com/Stability-AI/StableStudio/releases) page to download StableStudio for your operating system. StableStudio will download and install its own managed copy of [ComfyUI](https://github.com/comfyanonymous/ComfyUI) and the Stable Diffusion weights.

_**That's it! 🎉**_

# About

<div style="display: flex; justify-content: center; align-items: center; gap: 1em; margin: 0 0 2em 0;">
  <img src="./misc/aboutReadmeImage.png" style="flex-grow: 1; flex-shrink: 1;" />
</div>

StableStudio is [Stability AI](https://stability.ai)'s official open-source variant of [DreamStudio](https://www.dreamstudio.ai), our user interface for generative AI. It is a desktop application for local inference of Stable Diffusion that allows users to create and edit generated images. We're excited to see what the community does with it!

# FAQ

### What's the difference between StableStudio and [DreamStudio](https://dreamstudio.ai)?

_Not much!_ There are a few tweaks we made to make the project more community-friendly:

- We removed [DreamStudio](https://dreamstudio.ai)-specific branding.

- StableStudio is now packaged as a tauri application

- All "over-the-wire" API calls have been replaced by a [ComfyUI](https://github.com/comfyanonymous/ComfyUI) backend.

- We removed Stability-specific account features such as billing, API key management, etc.

  - These features are still available at [DreamStudio's account page](https://dreamstudio.ai/account).

### Will [DreamStudio](https://dreamstudio.ai) still be supported?

_Yes!_ Stability's hosted deployment of StableStudio will remain [DreamStudio](https://dreamstudio.ai).

# Building From Source

> Make sure you have the rust toolchain, nodejs, and yarn installed

1. Clone the repo

```
git clone https://github.com/Stability-AI/StableStudio
```

2. Install yarn dependencies

```
yarn install
```

3. Build

```
cargo tauri build
```
> Or for development

```
cargo tauri dev
```

Installers/executables should be located in `packages/stablestudio-ui/src-tauri/target/release/bundle`

# Contributing

<div style="display: flex; justify-content: center; align-items: center; gap: 1em; margin: 0 0 2em 0;">
  <img src="./misc/contributingReadmeImage.png" style="flex-grow: 1; flex-shrink: 1;" />
</div>

_**Community contributions are encouraged!**_

**The UI package's [README](./packages/stablestudio-ui/README.md) is a great place to start.** Bug fixes, documentation, general clean-up, new features, etc. are all welcome.

Here are some useful links...

- [Discussion](https://github.com/Stability-AI/StableStudio/discussions)
- [Open Issues](https://github.com/Stability-AI/StableStudio/issues)
- [Open Pull Requests](https://github.com/Stability-AI/StableStudio/pulls)
- [Code of Conduct](./CODE_OF_CONDUCT.md)
