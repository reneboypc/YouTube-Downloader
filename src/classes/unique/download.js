// Functions that are used to download the video and audio
// files

function Download() {
	// Construct
}

Download.prototype = {
	// Download the file
	getVid: function($span, title) {
		var item = qualities.getFromItag($span.attr("itag"));
		var type = item.type;
		var dash = item.dash;

		title = title || this.getTitle(item.label);
		var name = title;
		var url = item.url.setSetting("title", encodeURIComponent(title));

		// MP3 change
		if (type === "mp3") {
			name = "MP3 - "+name;
			type = "m4a";
		}

		// Save to disk
		this.saveToDisk(url, name+"."+type);

		// If it requires audio, download it
		if (dash) {
			this.handleAudio(name);
		}

		// Re-enable the button after 0.5 seconds
		setTimeout(function() {
			display.updateDownloadButton("Download");
		}, 500);
	},
	getTitle: function(label) {
		label = (label) ? label : "";
		var str = $("title").html().split(" - YouTube")[0];

		// Add the label if required
		if (settings.get("label") && label.toString() !== "Audio") {
			str += " " + label.toString();
		}

		str = str.replace(/!|\+|\.|\:|\?|\||\\|\//g, "").replace(/\"/g, "'");
		return str;
	},
	// Download audio if required
	handleAudio: function(name) {
		// Download the audio file
		this.getVid($("#options").find("li[itag=140]:eq(0)"), "AUDIO - " + name);

		// Download the script

		/*
		var os = GetOs();
		var text = MakeScript(settings.title, type, "m4a", "mp4", os);
		settings.type = os.scriptType;
		if (os.os === 'win'){
			SaveToDisk(URL.createObjectURL(text), settings);
		} else {
			SaveToDisk("https://github.com/domsleee/YouTube-Downloader/raw/master/muxer/Muxer.zip", settings);
		}*/
	},
	getOs: function() {
		var os = (navigator.appVersion.indexOf("Win") !== -1) ? "win" : "mac";
		var scriptType = (os === "win") ? "bat" : "command";
		return {os:os, scriptType:scriptType};
	},
	saveToDisk: function(url, name) {
		console.log("Trying to download:", url);
		if (typeof(GM_download) === "undefined") {
			this.fallbackSave(url);
			alert("Please enable GM_Download if you have videoplayback issues");
		} else {
			GM_download(url, name);
		}
	},

	// Saves using the old method
	// NOTE: Does not work for audio or DASH formats
	//       will download as "videoplayback"
	fallbackSave: function(url) {
		var save = document.createElement('a');
		save.target = "_blank";
		save.download = true;
		console.log(decodeURIComponent(url));
		save.href = url;
		(document.body || document.documentElement).appendChild(save);
		save.onclick = function() {
			(document.body || document.documentElement).removeChild(save);
		};
		save.click();
	}
};