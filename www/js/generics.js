
/*
	Generics
	
	
*/

emailRegEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
filenameExtract = /(([^\/]*)\.([a-zA-Z0-9~]*?))$/;
data64RegEx = /^(data:.*\/.*?;base64,)(.*)$/
function FormatInteger(num, length) {
			return (num / Math.pow(10, length)).toFixed(length).substr(2);
}

function concurentWait(testFx,cb,parameters){
	if(testFx()){
		cb(parameters)
	}else{
		setTimeout(function(){concurentWait(testFx,cb,parameters)},10)
	}
}

function getBase64Image(img) {
    // Create an empty canvas element
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;

    // Copy the image contents to the canvas
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);

    // Get the data-URL formatted image
    // Firefox supports PNG and JPEG. You could check img.src to
    // guess the original format, but be aware the using "image/jpg"
    // will re-encode the image.
    var dataURL = canvas.toDataURL("image/png");

    return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
}
		


function showInfoD(title,text,okFx){
	
	$('#modal1Btn h2').html(title);
	$('#modal1Btn p').html(text);
	
	
	$('#modal1Btn').show();
	$( document ).on('click','.okBtn',function(){
		$('#modal1Btn').hide();
		okFx();
	});

}

function showAlert(title,text,yesFn,noFn){
	$('#modal2Btn h2').html(title);
	$('#modal2Btn p').html(text);
	
	$('#modal2Btn').show();
	$( document ).on('click','.yesBtn',function(){
		$('#modal2Btn').hide();
		yesFn();
	});
	$( document ).on('click','.noBtn',function(){
		$('#modal2Btn').hide();
		noFn();
	});
}



function checkPress(ev){
	var endX = ev.pageX || ev.originalEvent.changedTouches[0].pageX;
	var endY = ev.pageY || ev.originalEvent.changedTouches[0].pageY;
	return Math.abs(endX - startTap.X)  < 10 && Math.abs(endY - startTap.Y) < 10	
}

function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}

function giveJson(string){
	if (typeof string == "object"){
		return string
	}
	try{
	  return JSON.parse(string);
	 
	}
	catch(e){
	  return false
	}
}

function generateAESPairs(){
	var key = []
	var iv  = []
	for(var k=0; k<16;k++){
		key.push(Math.floor(Math.random() * 255 ))
	}
	for(var k=0; k<16;k++){
		iv.push(Math.floor(Math.random() * 255 ))
	}
	
	return {k: key , s: iv}
}



function RSAencript(text) {
		var before = new Date();
		var rsa = new RSAKey();
		rsa.setPublic("00d4b948bff14a76c7f9ce6660c626ff52472d7a415326bb3c2fe8028a552513ccfe6bf168455cb08e2ee78fa50f10e268930236f14a39dff966a8cd8c79b2227c2f99af3ff709b78975d549155f0d0cdfde4ee3cb9b9639452de4151b293432ff4458dd0afe843011cee1032d6254968181b2dbfd7f3acc72e4e3019572adc5a087aa7f5274cecb9a97b84b0d728dee1464af2dbc5bba5a226590bf7f455b0ee476b16a4f0fcebf975e7cd5b00b67a7d612299a035a74ba6e3577f949191d102f82cdc66092bc7c9f37274b7e6e62728953c6da411db19679e0513748c11f0ee2a3c0b95101cae72e451850ab92a44ebb47ea9d0a22e286afe68528adf466e07f", "10001");
		  var res = rsa.encrypt(text);
		  var after = new Date();
		  if(res) {
			return hex2b64(res)
		  }
	}
	

	
function _post(url,obj,cb,fail){
	var pair = generateAESPairs()
	var textBytes = aesjs.utils.utf8.toBytes(JSON.stringify(obj));
	var aesOfb = new aesjs.ModeOfOperation.ofb(pair.k, pair.s);
	var encryptedBytes = aesOfb.encrypt(textBytes);
	if(cordovaHTTP != undefined){
		return cordovaHTTP.post(ServerIP+url,{
			k : RSAencript(JSON.stringify(pair)),
			c : aesjs.utils.hex.fromBytes(encryptedBytes)
		},{},function(rs){cb(JSON.parse(rs.data))},fail)
	}else{
		return $.post(ServerIP+url,{
			k : RSAencript(JSON.stringify(pair)),
			c : aesjs.utils.hex.fromBytes(encryptedBytes)
		},cb).fail(fail)
	}
	
}	

loginInfo = function(callback){
	return db.get("loginInfo").then(callback)
}

function getNameFromUrl(url){
	var m
	if ((m = filenameExtract.exec(url)) !== null) {
		return {
			fullName : m[1],
			name	 : m[2],
			ext		 : m[3]
		}
	}
	return {
			fullName : "some",
			name	 : "some.txt",
			ext		 : "txt"
	}
}

function simDevice(){
	
	window.device  =  {platform :"chrome",uuid: uuid()}
	window.cordova = {platformId : "chrome"}
	PN = "BROWSER"+uuid()
	window.cordovaHTTP = null
	dirc = {
		getDirectory : function(a,b,c,f){
			f()
		}
	}
	
	window.plugins = {
		toast : {
			showLongCenter : function(m){console.log("showLongCenter",m)}
		}
	}
	window.requestFileSystem = function(a,b,c,f){
		c(dir)
	}
	onDeviceReady_db()
	$("#login").hide()
	
	
}

var observeDOM = (function(){
    var MutationObserver = window.MutationObserver || window.WebKitMutationObserver,
        eventListenerSupported = window.addEventListener;

    return function(obj, callback){
        if( MutationObserver ){
            // define a new observer
            var obs = new MutationObserver(function(mutations, observer){
                if( mutations[0].addedNodes.length || mutations[0].removedNodes.length )
                    callback();
            });
            // have the observer observe foo for changes in children
            obs.observe( obj, { childList:true, subtree:true });
        }
        else if( eventListenerSupported ){
            obj.addEventListener('DOMNodeInserted', callback, false);
            obj.addEventListener('DOMNodeRemoved', callback, false);
        }
    };
})();


function escapeUnicode(str) {
    return str.replace(/[^\0-~]/g, function(ch) {
        return "\\u" + ("000" + ch.charCodeAt().toString(16)).slice(-4);
    });
}

function unescapeUnicode(str) {
 var r = /\\u([\d\w]{4})/gi;
 str = str.replace(r, function (match, grp) {
  return String.fromCharCode(parseInt(grp, 16)); } );
 return unescape(str);
}

function zeroPad(num, places) {
  var zero = places - num.toString().length + 1;
  return Array(+(zero > 0 && zero)).join("0") + num;
}

function normalDate(date){
	var date_ = new Date(date)
	return date_.getFullYear()+"-"+zeroPad(date_.getMonth())+"-"+zeroPad(date_.getDate())+" "+zeroPad(date_.getHours())+":"+zeroPad(date_.getMinutes())+":"+zeroPad(date_.getSeconds())
}


if($ != undefined){
	$.fn.hasAttr = function(name) {  
		return this.attr(name) !== undefined;
	};

	$.fn.hasScrollBar = function() {
			return this.get(0).scrollHeight > this.height();
	}


	//Star in Tap
	startTap = { X : 0 , Y : 0}
	$("*").tapstart(function(ev){
		startTap.X = ev.pageX || ev.originalEvent.touches[0].pageX;
		startTap.Y = ev.pageY || ev.originalEvent.touches[0].pageY;
	});
}