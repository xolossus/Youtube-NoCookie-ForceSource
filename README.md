# 🎞️ YouTube NoCookie - Force 1440p / 1080p Quality

A userscript for Tampermonkey that automatically requests and applies higher playback quality on **yout-ube.com** and **youtube-nocookie.com** players.

It prefers **1440p** whenever available, automatically falls back to **1080p**, and is designed to complement the [**YouTube → yout-ube Custom Player Overlay**](https://github.com/xolossus/Youtube-Player-Override) scripts.

---

## ⚙️ Overview

Embedded YouTube or youtube-nocookie players may automatically begin playback at a lower quality than desired, even when higher resolutions are available.

This userscript attempts to improve the viewing experience by:

- Requesting `1440p` as early as possible through player URL parameters
- Waiting for the player to become available
- Detecting supported quality levels
- Selecting `1440p` when available
- Falling back to `1080p` when `1440p` is unavailable
- Stopping repeated checks after approximately 15 seconds

It is intended for use with:

```text
yout-ube.com
youtube-nocookie.com/embed/
youtube-nocookie.com/watch
```

---

## 🧰 Installation

(Currently only properly tested in Firefox)

1. Download and install [Tampermonkey](https://www.tampermonkey.net/).
2. Click **Create a new script**.
3. Paste the contents of [`youtube-nocookie-force-quality.user.js`](https://github.com/xolossus/Youtube-NoCookie-ForceSource/blob/main/youtube-nocookie-force-quality.user.js) into the editor.
4. Save and enable the script.
5. Open a supported yout-ube or youtube-nocookie player page.

When used with the custom player overlay project, simply open a regular YouTube video page and the quality script will run inside the player created by the overlay.

---

## ✨ Features

- 🖼️ **Prefers 1440p Playback**  
  Requests and selects `hd1440` whenever that quality level is available.

- 📺 **Automatic 1080p Fallback**  
  Selects `hd1080` when a video does not support 1440p.

- ⚡ **Early Quality Request**  
  Adds the following player parameters as early as possible:

  ```text
  vq=hd1440
  enablejsapi=1
  ```

- 🔄 **Player Readiness Detection**  
  Re-checks quality while the player is loading and responds to playback events such as:

  ```text
  playing
  loadeddata
  canplay
  ```

- ⏱️ **Limited Retry Window**  
  Checks every `500ms` for a maximum of `30` attempts, meaning it stops retrying after approximately `15` seconds.

- 🧩 **Optional Custom Player Companion**  
  Works alongside the YouTube → yout-ube parent/child scripts to improve playback quality inside the custom player iframe.

- 🪶 **Player-Domain Only Matching**  
  It does not run directly on normal `youtube.com` pages. It targets only the custom player and nocookie player domains.

---

## 🧠 How It Works

The script uses two methods to prefer higher playback quality.

### 1. Early URL Parameter Request

When the custom player page first loads, the script makes sure these URL parameters are present:

```text
vq=hd1440
enablejsapi=1
```

This asks the embedded player to prefer 1440p from the beginning and enables JavaScript player control where supported.

### 2. Runtime Player Quality Selection

After the player loads, the script looks for:

```js
getAvailableQualityLevels()
setPlaybackQuality()
setPlaybackQualityRange()
```

It then checks the quality levels provided by the player.

Preference order:

```js
const PREFERRED_QUALITIES = ["hd1440", "hd1080"];
```

The result is:

```text
1440p available → choose 1440p
1440p unavailable but 1080p available → choose 1080p
Neither available → leave the player quality unchanged
```

---

## 📦 Script

### `youtube-nocookie-force-quality.user.js`

Runs on:

```text
https://www.yout-ube.com/*
https://www.youtube-nocookie.com/embed/*
https://www.youtube-nocookie.com/watch*
```

Responsible for:

- Requesting preferred quality through URL parameters
- Waiting for player APIs to become available
- Detecting available resolutions
- Applying the highest preferred supported quality
- Retrying briefly during initial player startup

---

## 🔧 Configuration

### Change Preferred Quality Order

The default configuration is:

```js
const PREFERRED_QUALITIES = ["hd1440", "hd1080"];
```

This means:

```text
First choice: 1440p
Fallback:     1080p
```

### Prefer 1080p Only

Use:

```js
const PREFERRED_QUALITIES = ["hd1080"];
```

### Prefer 4K, Then 1440p, Then 1080p

Use:

```js
const PREFERRED_QUALITIES = ["highres", "hd2160", "hd1440", "hd1080"];
```

Availability depends on the video and whether the player exposes those quality options.

### Change Retry Duration

The default settings are:

```js
const MAX_ATTEMPTS = 30;
const CHECK_EVERY_MS = 500;
```

That gives the script approximately:

```text
30 × 500ms = 15 seconds
```

For a shorter retry window:

```js
const MAX_ATTEMPTS = 20;
const CHECK_EVERY_MS = 500;
```

This retries for approximately 10 seconds.

---

## 🔗 Recommended Companion Scripts

This script is designed to work well with:

# 🎬 YouTube → yout-ube Custom Player Overlay

A two-script Tampermonkey project that replaces YouTube’s normal `/watch?v=` player with a customizable yout-ube / youtube-nocookie overlay.

Together, the scripts provide:

- Custom player overlay on normal YouTube watch pages
- Theater mode and fullscreen controls
- Keyboard playback and volume controls
- Synced volume slider UI
- Automatic preference for 1440p or 1080p quality

Recommended setup:

```text
1. YouTube → yout-ube Parent
2. yout-ube / nocookie Child Controls
3. YouTube NoCookie Force 1440p / 1080p
```

---

## 🗂️ Supported Pages

| Page Type | Quality Script Active |
|---|---:|
| `yout-ube.com/*` | ✅ |
| `youtube-nocookie.com/embed/*` | ✅ |
| `youtube-nocookie.com/watch*` | ✅ |
| Normal `youtube.com/watch?v=...` page directly | ❌ |
| YouTube Shorts directly | ❌ |
| YouTube homepage/search/feed directly | ❌ |

When used with the custom player overlay, the quality script activates inside the iframe created on normal YouTube watch pages.

---

## 🐛 Troubleshooting

### The video does not switch to 1440p

The video may not provide a 1440p stream, or the embedded player may not expose its quality-selection API. When 1440p is unavailable, the script attempts to use 1080p instead.

### Quality starts low before becoming higher

The embedded player can begin playback before higher quality levels are fully available. The script retries during the initial startup period to apply the preferred quality once it becomes selectable.

### Tampermonkey shows more running script instances than expected

The script uses:

```js
// @allFrames    true
```

because player content may exist inside iframe contexts. It is restricted to yout-ube and youtube-nocookie domains, but iframe player usage can still produce more than one running script instance.

### The script does not affect the regular YouTube player

That is intentional. This script is designed for the yout-ube / youtube-nocookie custom player, not YouTube’s native watch-page player.

---

## 📄 License

MIT License

---

## 👤 Author

**xolossus**

Designed to improve custom YouTube player viewing quality with automatic 1440p / 1080p selection.
