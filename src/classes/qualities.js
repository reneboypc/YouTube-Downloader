// This class handles the qualities that can be downloaded
// This class also manages the the display of qualities (both
// the top quality and the list of qualities)
function Qualities() {
	this.items = [];
	this.sizes = new GetSizes();

	this.itags = {
		5: {
			type:"flv"
		},
		17: {
			resolution:144,
			type:"3gpp"
		},
		18: {
			resolution:360,
			type:"mp4"
		},
		22: {
			resolution:720,
			type:"mp4"
		},
		36: {
			resolution:180,
			type:"3gpp"
		},
		43: {
			resolution:360,
			type:"webm"
		},
		133: {
			resolution:240,
			type:"mp4",
			muted:true
		},
		134: {
			resolution:360,
			type:"mp4",
			muted:true
		},
		135: {
			resolution:480,
			type:"mp4",
			muted:true
		},
		136: {
			resolution:720,
			type:"mp4",
			muted:true
		},
		137: {
			resolution:1080,
			type:"mp4",
			muted:true
		},
		140: {
			audio:true,
			type:"mp4"
		},
		160: {
			resolution:144,
			type:"mp4",
			muted:true
		},
		171: {
			audio:true,
			type:"webm",
		},
		242: {
			resolution:240,
			type:"webm",
			muted:true
		},
		243: {
			resolution:360,
			type:"webm",
			muted:true
		},
		244: {
			resolution:480,
			type:"webm",
			dash:true
		},
		247: {
			resolution:720,
			type:"webm",
			muted:true
		},
		248: {
			resolution:1080,
			type:"webm",
			muted:true
		},
		249: {
			audio:true,
			type:"webm",
		},
		250: {
			audio:true,
			type:"webm",
		},
		251: {
			audio:true,
			type:"webm",
		},
		278: {
			resolution:140,
			type:"webm",
			muted:true
		},
		298: {
			resolution:720,
			fps:60,
			type:"mp4",
			dash:true
		},
		299: {
			resolution:1080,
			fps:60,
			type:"mp4",
			dash:true
		},
		302: {
			resolution:720,
			fps:60,
			type:"webm",
			muted:true
		},
		303: {
			resolution:1080,
			fps:60,
			type:"webm",
			muted:true
		}
	}
}

Qualities.prototype = {
	reset: function() {
		this.items = [];
	},
	initialise: function() {
		this.reset();
		var potential = ytplayer.config.args.adaptive_fmts + ytplayer.config.args.url_encoded_fmt_stream_map
		var i = 1;

		var url = decodeURIComponent(potential.getSetting("url", i));
		while (url !== "false") {
			var type = decodeURIComponent(url.getSetting("mime"));
			var clen = decodeURIComponent(url.getSetting("clen"));
			var itag = parseInt(url.getSetting("itag"), 10);
			var size = false;

			// Get data from the ITAG identifier
			var tag = this.itags[itag] || {};

			var newType = type.split("/")[1].split(",")[0];
			if (newType !== tag.type) {
				console.log("Error with "+itag+", "+newType+"!="+tag.type);
				console.log(decodeURIComponent(url));
			}

			// Get the label from the tag
			var label = this.getLabel(tag);

			// If we have content-length, we can find size IMMEDIATELY
			if (clen !== "false") {
				size = this.sizes.formatSize(clen);
			}

			// If it is the audio url - find the size and update
			if (newType === "mp4" && tag.audio) {
                tag.type = "m4a";
                var $li = $("<li>", {
                    url:url
                });
                this.sizes.getSize(this, $li, function($li, size) {
                    global_properties.audio_size = size;
                });
            }

            // Append to qualities (if it shouldn't be ignored)
            var item = {
				itag:itag,
				url:url,
				size:size,
				type:tag.type,
				dash:tag.dash || false,
				muted:tag.muted || false,
				label:label,
				text:label,
				audio:tag.url || false
			};
			if (this.checkValid(item)) {
				this.items.push(item);
			}

			// Move on to the next item
			i++;
			url = decodeURIComponent(potential.getSetting("url", i));
		}
		potential.getSetting("url", i);
	},
	getLabel: function(tag) {
		var label = false;
		tag = tag || {};
		if (tag.resolution) {
			label = tag.resolution.toString()+"p";
			if (tag.fps) {
				label += tag.fps.toString();
			}
		} else if (tag.audio) {
			label = "Audio";
		}

		return label;
	},

	sortItems: function() {
		var _this = this;
		this.items.sort(_this.sortDescending);
	},
	sortDescending: function(a, b) {
	    if (isNaN(a.val)) a.val = 0;
	    if (isNaN(b.val)) b.val = 0;
	    return Number(b.val) - Number(a.val);
	},

	// Check if the item should be ignored or not
	checkValid: function(item) {
		var valid = true;

		// If it is muted and we are ignoring muted
		if (global_settings.ignoreMuted && item.muted) {
			valid = false;
		}

		// If it matches a blacklisted type
		if (global_settings.ignoreTypes.indexOf(item.type) !== -1) {
			valid =false;
		}

		return valid;
	}
};