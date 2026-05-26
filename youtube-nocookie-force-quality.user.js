// ==UserScript==
// @name         YouTube NoCookie Force 1440p / 1080p
// @namespace    yt-nocookie-quality
// @version      1.1
// @description  Prefer 1440p on yout-ube / youtube-nocookie embeds, fallback to 1080p
// @author       xolossus
// @match        *://www.yout-ube.com/*
// @match        *://www.youtube-nocookie.com/embed/*
// @match        *://www.youtube-nocookie.com/watch*
// @allFrames    true
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function () {
    "use strict";

    const PREFERRED_QUALITIES = ["hd1440", "hd1080"];
    const MAX_ATTEMPTS = 30;
    const CHECK_EVERY_MS = 500;

    let watcherStarted = false;
    let qualityLocked = false;

    function isActualPlayerPage() {
        const host = location.hostname;

        if (host.includes("yout-ube.com")) return true;

        if (
            host.includes("youtube-nocookie.com") &&
            (
                location.pathname.startsWith("/embed/") ||
                location.pathname.startsWith("/watch")
            )
        ) {
            return true;
        }

        return false;
    }

    if (!isActualPlayerPage()) {
        return;
    }

    function ensureQualityParam() {
        let url;

        try {
            url = new URL(location.href);
        } catch (e) {
            return;
        }

        let changed = false;

        if (url.searchParams.get("vq") !== "hd1440") {
            url.searchParams.set("vq", "hd1440");
            changed = true;
        }

        if (url.searchParams.get("enablejsapi") !== "1") {
            url.searchParams.set("enablejsapi", "1");
            changed = true;
        }

        if (changed) {
            location.replace(url.toString());
        }
    }

    ensureQualityParam();

    function getPlayer() {
        return (
            document.getElementById("movie_player") ||
            document.querySelector(".html5-video-player")
        );
    }

    function pickBestQuality(available) {
        for (const quality of PREFERRED_QUALITIES) {
            if (available.includes(quality)) {
                return quality;
            }
        }

        return null;
    }

    function forceBestQuality() {
        const player = getPlayer();

        if (!player) return false;

        if (typeof player.getAvailableQualityLevels !== "function") {
            return false;
        }

        if (
            typeof player.setPlaybackQuality !== "function" &&
            typeof player.setPlaybackQualityRange !== "function"
        ) {
            return false;
        }

        const available = player.getAvailableQualityLevels();

        if (!Array.isArray(available) || available.length === 0) {
            return false;
        }

        const chosen = pickBestQuality(available);

        if (!chosen) return false;

        try {
            if (typeof player.setPlaybackQualityRange === "function") {
                player.setPlaybackQualityRange(chosen, chosen);
            }

            if (typeof player.setPlaybackQuality === "function") {
                player.setPlaybackQuality(chosen);
            }

            qualityLocked = true;
            console.log(`[NoCookie Quality] Set quality to: ${chosen}`);
            return true;
        } catch (err) {
            console.warn("[NoCookie Quality] Failed to set quality:", err);
            return false;
        }
    }

    function startQualityWatcher() {
        if (watcherStarted) return;
        watcherStarted = true;

        let attempts = 0;

        const interval = setInterval(() => {
            attempts++;

            const success = forceBestQuality();

            if (success && qualityLocked) {
                clearInterval(interval);
                return;
            }

            if (attempts >= MAX_ATTEMPTS) {
                clearInterval(interval);
            }
        }, CHECK_EVERY_MS);

        document.addEventListener("playing", forceBestQuality, true);
        document.addEventListener("loadeddata", forceBestQuality, true);
        document.addEventListener("canplay", forceBestQuality, true);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", startQualityWatcher, { once: true });
    } else {
        startQualityWatcher();
    }
})();
