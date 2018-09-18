/* eslint-disable */
var Timer;
var xhr = new XMLHttpRequest();

(function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {
        return;
    }
    js = d.createElement(s);
    js.id = id;
    js.src = "//connect.facebook.net/en_US/messenger.Extensions.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'Messenger'));

window.extAsyncInit = () => {
    MessengerExtensions.getSupportedFeatures(function success(result) {
        var features = result.supported_features;
        if (features.includes("context")) {
            MessengerExtensions.getContext('718776831795007', function success(thread_context) {
                // success
                console.log('ThreadContext: ' + JSON.stringify(thread_context));
                document.getElementById("psid").value = thread_context.psid;
            }, function error(err) {
                // error
                console.log(err);
            });
        }
    }, function error(err) {
        // error retrieving supported features
        console.log(err);
	});

	xhr.addEventListener("load", function(){
		MessengerExtensions.requestCloseBrowser(function success() {
			console.log("Webview closing");
		}, function error(err) {
			console.log("closing failure");
          	console.log(err);
		});
	});
};

function RadialTimer() {
	var self = this;

	this.seconds = 0;
	this.count = 0;
	this.degrees = 0;
	this.interval = null;
	this.timerHTML = "<div class='n'></div><div class='slice'><div class='q'></div><div class='pie r'></div><div class='pie l'></div></div>";
	this.timerContainer = null;
	this.number = null;
	this.slice = null;
	this.pie = null;
	this.pieRight = null;
	this.pieLeft = null;
	this.quarter = null;
	this.doGET = null;

	this.init = function(e, s, callback) {
		self.timerContainer = $("#" + e);
		self.timerContainer.html(self.timerHTML);

		self.number = self.timerContainer.find(".n");
		self.slice = self.timerContainer.find(".slice");
		self.pie = self.timerContainer.find(".pie");
		self.pieRight = self.timerContainer.find(".pie.r");
		self.pieLeft = self.timerContainer.find(".pie.l");
		self.quarter = self.timerContainer.find(".q");

		// start timer
		self.start(s, callback);
	}

	this.start = function(s, callback) {
		self.seconds = s;

		self.interval = window.setInterval(function() {
			self.number.html(self.seconds - self.count);

			self.count++;

			if ((self.count-1) === self.seconds) {
				clearInterval(self.interval);
				self.number.html(0);
				callback();
				return;
			}

			self.degrees = self.degrees + (360 / self.seconds);
			if (self.count >= (self.seconds / 2)) {
				self.slice.addClass("nc");
				if (!self.slice.hasClass("mth")) self.pieRight.css({
					"transform": "rotate(180deg)"
				});
				self.pieLeft.css({
					"transform": "rotate(" + self.degrees + "deg)"
				});
				self.slice.addClass("mth");
				if (self.count >= (self.seconds * 0.75)) self.quarter.remove();
			} else {
				self.pie.css({
					"transform": "rotate(" + self.degrees + "deg)"
				});
			}
		}, 1000);
	}
};

function parse_query_string(query) {
	var vars = query.split("&");
	var query_string = {};
	for (var i = 0; i < vars.length; i++) {
	  var pair = vars[i].split("=");
	  var key = decodeURIComponent(pair[0]);
	  var value = decodeURIComponent(pair[1]);
	  // If first entry with this name
	  if (typeof query_string[key] === "undefined") {
		query_string[key] = decodeURIComponent(value);
		// If second entry with this name
	  } else if (typeof query_string[key] === "string") {
		var arr = [query_string[key], decodeURIComponent(value)];
		query_string[key] = arr;
		// If third or later entry with this name
	  } else {
		query_string[key].push(decodeURIComponent(value));
	  }
	}
	return query_string;
  }  

$(document).ready(function() {
    Timer = new RadialTimer();
    Timer.init("timer", 3, function(){
		//var psid = $('#psid').val() || null;
		var query = window.location.search.substring(1);
		var parsed_qs = parse_query_string(query);
		console.log('PSID: '+parsed_qs.psid);
		// https://bot-int.a1.net/a1bot-fbadapter/rest/webview/postpack?psid=
		xhr.open("GET", "https://a1bot-fbadapter-d.eu-de.mybluemix.net/rest/webview/postback?psid="+parsed_qs.psid);
		xhr.send();
	});
});

