const regex = /^(data:.*\/.*?;base64,)(.*)$/
var img = new Image();
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var clip = new Clipboard('#ChatMsgNav .fa-clone');


chatBar ="";
prevEvent = null;
currentChat = null;

  w = new Worker("js/chat_worker.js");
  w.onmessage = function(event){
	    console.log(event.data);
	  retData = JSON.parse(event.data)
	  if(retData.tid != undefined){
		  $("#msg"+retData.tid).find(".fa-clock-o").removeClass("fa-clock-o").addClass("fa-paper-plane-o")
		  console.log("change")
	  }
   
};


img.onload = function () {
	var uuid_ = uuid();
	var date = (new Date()).getTime()
	if (this.naturalWidth > 800 && this.naturalWidth > this.naturalHeight){
		canvas.width = 800;
		canvas.height = canvas.width * (img.height / img.width);
		resizeImg(this)
	}else if(this.naturalHeight > 800){
		canvas.height= 800;
		canvas.width = canvas.height * (img.width / img.height);
		resizeImg(this)
	}
	else{
		canvas.width = this.naturalWidth;
		canvas.height = this.naturalHeight;
		octx = canvas.getContext('2d');
		octx.drawImage(this, 0, 0, canvas.width,canvas.height);
		
	}
	
	var urlImg = canvas.toDataURL("image/jpeg")	
	console.log(urlImg)
	var dom = $(`<div class="chat_message" id="msg`+uuid_+`"><div class="i_said" ></div></div>`)
	$("#chat_lst_box .nice-wrapper").append(dom)
	dom.find(".i_said").html('<div class="prevImage" ><img  src="'+urlImg+'"/></div>'+ `<div class="said_bottom">
					<div class="said_state">
						<i class="fa `+getIconStatus("N")+`" aria-hidden="true"></i>
				</div>
				<div class="said_date">`+(new Date(date).toLocaleString())+`</div>`)
				goBottom()
	sendMessage(uuid_,date,"image",urlImg)
}


function showInfoBtn(this_){
	console.log("intoshow")
	console.log(this_.find(".i_said").length)
		if((this_.find(".i_said").length == 0)  || ($(".chat_message.selected").length > 1)){
			$(".fa-info-circle").hide()
		}else{
	
			$(".fa-info-circle").show().attr("section-fx-parameters","'"+this_.attr("id").substr(3)+"'")
		}
	
}

msgInfo = {
	init : function(s,d){
		var tempObj = {
			chatMessageId:  d
		}
		$("#msgInfoPreview").html("");
		$(".selected").removeClass("selected")
		$("#ChatMsgNav").html(chatBar)
		
		var clone = $("#msg"+d).clone()
		
		clone.appendTo("#msgInfoPreview")
		_post("/chat/status/detail",tempObj,function(data){
			iterateStatusObject(data)
		})
	
	}
}

selectingMsg = function(e){
	if((e.type == "tapend" &&  $(".chat_message.selected").length==0)||prevEvent== "taphold" || !checkPress(e)){
	}else{
		var copyText = ""
		e.stopPropagation()
		$(this).toggleClass("selected")
		if($(".chat_message.selected").length>0){
			if($("#ChatMsgNav").find(".fa-chevron-left").length>0){
				chatBar = $("#ChatMsgNav").html()
				copyText =$(this).find(".said_body").clone().find(".said_date").remove().end().text().replace(/~+$/, '');
			
			}else{
				if($(".chat_message.selected").length ==1){
					copyText =$(this).find(".said_body").clone().find(".said_date").remove().end().text().replace(/~+$/, '');
					
				}else{
					$(".fa-info-circle").hide()
					console.log("hide por mas de 1")
					$(".chat_message.selected").each(function(){
						copyText += "["+$(this).find(".said_date").text()+"] "+$(this).find(".said_who").text()+": "+ $(this).find(".said_body").clone().find(".said_date").remove().end().text().replace(/~+$/, '');+"\n"
					})
				}
				
				console.log("copyText: " , copyText)
				
			}
			$("#ChatMsgNav").html('<i class="fa fa-times" aria-hidden="true"></i><span class="selQty">'+$(".chat_message.selected").length+'</span><div class="btn"><i class="fa fa-reply" aria-hidden="true"></i><i class="fa fa-info-circle" aria-hidden="true" section-target="msgInfo"></i><i class="fa fa-clone" data-clipboard-text="'+copyText+'" aria-hidden="true"></i><i class="fa fa-trash-o" aria-hidden="true"></i></div>')
			showInfoBtn($(this))
			if($(".chat_message.selected").length ==1){	
				$("#ChatMsgNav .fa-reply").show()
			}else{
				$("#ChatMsgNav .fa-reply").hide()
			}
		
		}else{
			$("#ChatMsgNav").html(chatBar)
		}
	}
	prevEvent  = e.type
}

function resizeImg(img_){
 	var oc = document.createElement('canvas'),
    octx = oc.getContext('2d');

    oc.width = img_.width * 0.5;
    oc.height = img_.height * 0.5;
    octx.drawImage(img_, 0, 0, oc.width, oc.height);
    
    octx.drawImage(oc, 0, 0, oc.width * 0.5, oc.height * 0.5);

    ctx.drawImage(oc, 0, 0, oc.width * 0.5, oc.height * 0.5,
    0, 0, canvas.width, canvas.height);  
}


function goBottom(delay,wait){
	var delay = delay == undefined ? -1 : delay;
	var wait  = wait  == undefined ? 1000 : wait;
	setTimeout(function(){$("#chat_lst_box").getNiceScroll(0).doScrollTop($("#chat_lst_box").getNiceScroll(0).page.maxh, delay);},wait)

}

function getMessages(chatId,print,goDown){
	console.log(print)
	loginInfo(function(doc){
			var tempObj = {
				chatId: chatId,
				to : doc.estates[estateSelected].guestId,
				toType : userType,
				changeStatus: print
			}
			db.get4Guest("chatId"+chatId,doc.estates[estateSelected].guestId).then(function(oldMsg){
				try{
				
					
				console.log("oldMsg ",oldMsg)
				tempObj.version = oldMsg.version
				console.log("tempObj",tempObj);
				if(print){
					oldMsg.messages.sort(function(a,b){
							return a.writeDate - b.writeDate;
						})
					oldMsg.messages.forEach(function(chat){
							insertMsg(doc.estates[estateSelected].guestId,chat)
					})
					
					if(goDown){
							goBottom();
						}else{
							
						}
				}
					
			
				_post("/chat/read/app",tempObj,function(data){
					console.log("downloadData:",data)
					var incommingId = data.messages.map(function(o){return o.chatId})
					console.log("incommingId",incommingId)
					var other_olds = oldMsg.messages.filter(function(o){return (incommingId.indexOf(o.chatId)== -1)});
					console.log("other_olds",other_olds)
					
					data.deleted = data.deleted.map(function(temp){return temp.chatId})
					other_olds.filter(function(msg){
						if(data.deleted.indexOf(msg.chatId) > -1){
							$("msg"+msg.chatId).remove()
							return false
						}
						return true
					})
					data.messages = data.messages.concat(other_olds)
					console.log(data)
					db.upsert4Guest("chatId"+chatId,doc.estates[estateSelected].guestId, data)
					if(print){
						data.messages.sort(function(a,b){
							return a.writeDate - b.writeDate;
						})
						data.messages.forEach(function(chat){
						insertMsg(doc.estates[estateSelected].guestId,chat)
						})
					
						if(goDown){
							goBottom();
						}else{
							
						}
						
					}
					//window.plugins.toast.showLongCenter("Mensajes Sincronizados")
				},function(e){
					if(print){
						oldMsg.messages.sort(function(a,b){
							return a.writeDate - b.writeDate;
						})
						oldMsg.messages.forEach(function(chat){
							insertMsg(doc.estates[estateSelected].guestId,chat)
						})
						
						if(goDown){
							goBottom();
						}else{
							
						}
						//window.plugins.toast.showLongCenter("Imposible sincronizar mensajes con el sistema")
					}
				})
				}catch(e){
					console.log(e)
					
				}
				
				
				
				
			}).catch(function(e){
				_post("/chat/read/app",tempObj,function(data){
					console.log(data)
					console.log(e)
					db.upsert4Guest("chatId"+chatId,doc.estates[estateSelected].guestId,data)
						if(print){
							data.messages.sort(function(a,b){
								return a.writeDate - b.writeDate;
							})
							data.messages.forEach(function(chat){
								insertMsg(doc.estates[estateSelected].guestId,chat)
							})
							if(goDown){
								goBottom();
							}else{
								
							}
						}
				},function(e){})
			})
		})	
}


function makeChatSwipe(selector){
	return $(selector).swipe({
		swipeLeft:function(event, direction, distance, duration, fingerCount) {
			$(".chat_lst_element").not($(this)).animate({"margin-left" : 0+"px"}); 
			var thisMarginLeft = 0-parseInt($(this).css("margin-left").replace("px",""));
			if(thisMarginLeft > 30){
				$(this).animate({"margin-left" :-70+"px"});
			}else{
				$(this).animate({"margin-left" : 0+"px"});
			}
		},
		swipeRight:function(event, direction, distance, duration, fingerCount){
			$(this).animate({"margin-left" :0+"px"});
		},
		
		swipeStatus:function(event, phase, direction, distance, duration, fingers, fingerData, currentDirection){
			if(direction == "left"){
				if(distance > 0 & distance < 72){
					$(this).css({"margin-left" : "-" + distance + "px"})
				}
			}
		 },
		  allowPageScroll:"vertical",
			threshold:5
	})
}

function onCamaraSuccess(imageData) {
   img.src =  "data:image/jpeg;base64," + imageData;
}

function onCamaraFail(message) {
    alert('Failed because: ' + message);
}


function getIconStatus(status){
	switch(status){
		case "N":
			return "fa-clock-o"
		break;
			
		case "U":
			return "fa-paper-plane-o"
		break;
		
		case "D":
			return "fa-check"
		break;
		
		case "R":
			return "fa-eye"
		break;
		
		default:
			return "?"
		break;
	}
}

function bottomSaid(from,msg){
	if(msg.from == from & msg.fromType == userType){
		return `<div class="said_bottom">
					<div class="said_state">
						<i class="fa `+getIconStatus(msg.status)+`" aria-hidden="true"></i>
				</div>
				<div class="said_date">`+(new Date(msg.writeDate).toLocaleString())+`</div>`
	}else{
		return '<div class="said_date">'+(new Date(msg.writeDate).toLocaleString())+'</div>'
	}
}

function getSelectedIds(){
	var tempArr = []
	 $(".chat_message.selected").each(function(){
		 tempArr.push(
			{
				id :$(this).attr("id").substring(3),
				received : $(this).find("he_said").length > 0
			}
		)
		 
	 })
	 return tempArr
}

function scrollnewMsg(dom){
	var nice = $("#chat_lst_box").getNiceScroll(0);
	if(nice.getScrollTop()+15 >= nice.page.maxh){
		$("#chat_lst_box").getNiceScroll().resize()
		$("#chat_lst_box").getNiceScroll(0).doScrollTop($("#chat_lst_box").getNiceScroll(0).getScrollTop() + dom.height(),100)
	}		
}


function printStatusPerson(obj){
	console.log(obj.delivered)
	return $('<div class="chatPersonInfo"><div class="pictureUser fa fa-user-circle-o"></div><div class="containerPersonInfo"><div class="verticalAlign"><div class="containerPersonalInfo_name">'+obj.name+'</div>'+
			((obj.read == null) ? "" : '<div class="infoStatusTime"><div class="fa fa-eye"></div><div>'+normalDate(obj.read)+'</div></div>')+
			((obj.delivered == null) ? "" : '<div class="infoStatusTime"><div class="fa fa-check"></div><div>'+normalDate(obj.delivered)+'</div></div>')+
		 '</div></div> </div>')
}

function iterateStatusObject(obj){
	$(".chatPersonInfo").remove()
	for(var status in obj){
		obj[status].forEach(function(this_){
			$(status == "R" ? "#chatsRead " : (status == "D" ? "#chatsDelivered ": "#chatsUndelivered ")).append(printStatusPerson(this_))
		})
	}
}


function insertMsg(from,msg_){
	var msg =  Object.assign({}, msg_); 
	var dom;
	var obj
	let m;
	console.log("msgFull", msg_)
	obj = msg.message
	
	if(msg.from == from & msg.fromType == userType){
		 dom = $(`<div class="chat_message" id="msg`+msg.chatId+`"><div class="i_said" ><div class="said_who">`+msg.name+`</div><div class="said_body" who="~Yo"></div></div></div>`)
	}else{		
		 dom = $(`<div class="chat_message"  id="msg`+msg.chatId+`"><div class="he_said" ><div class="said_who">`+msg.name+`</div><div class="said_body" who="`+msg.name+`"></div></div></div>`)
		
	}
	
	if($("#msg"+msg.chatId).length>0){
			$("#"+msg.chatId).replaceWith(dom)
	}else{
			$("#chat_lst_box .nice-wrapper").append(dom)
	}
	console.log(dom)
	
	dom.taphold(selectingMsg).tapend(selectingMsg)
	
	
		console.log(obj)
		
		switch(obj.type){
			case "text" :
				dom.find(".said_body").html(unescapeUnicode(obj.data)+bottomSaid(from,msg_))
				scrollnewMsg(dom)
			break;
			
			case "audio":
			docExist(obj.name,
					function(entry){
						dom.find(".said_body").html('<audio controls> <source src="'+entry.toURL()+'" ></audio>'+bottomSaid(from,msg_))
						scrollnewMsg(dom)
					},
					function(err){
						var mimetype_icon = "audio.png"
							dom.find(".said_body").html('<div class="thumbnail_aud" download-name="'+obj.name+'" mime="'+obj.mime+'" recived="'+ (!(msg.from == from & msg.fromType == userType))+'"><img src="img/'+mimetype_icon+'"/><div class="downloadIcon"> <i class="fa fa-arrow-down fa-fw" aria-hidden="true"></i></div></div>'+bottomSaid(from,msg_))
							scrollnewMsg(dom)
					}
				)
			break;
			
			case "image":
			console.log("es imagen")
				docExist(obj.name,
					function(entry){
						dom.find(".said_body").html('<div class="prevImage" download-name="'+obj.name+'"><img  src="'+entry.toURL()+'"/></div>'+bottomSaid(from,msg_))
						scrollnewMsg(dom)
					},
					function(err){
						dom.find(".said_body").html('<div class="thumbnail_img" download-name="'+obj.name+'" recived="'+ (!(msg.from == from & msg.fromType == userType))+'"><img  src="'+obj.thumbnail+'"/><div class="downloadIcon"> <i class="fa fa-arrow-down fa-fw" aria-hidden="true"></i></div></div>'+bottomSaid(from,msg_))
						scrollnewMsg(dom)
					}
				)
				 
			break;
			
			
			case "attachment":
				if("thumbnail" in obj){
					docExist(obj.name,
						function(entry){
							dom.find(".said_body").html('<div class="attachment" download-name="'+obj.name+'" mime="'+obj.mime+'"><img  src="'+obj.thumbnail+'"/><div class="fileInfo">'+obj.name+'</div></div>'+bottomSaid(from,msg_))
							scrollnewMsg(dom)
						},
						function(){
							dom.find(".said_body").html('<div class="thumbnail_atta" download-name="'+obj.name+'" mime="'+obj.mime+'" recived="'+ (!(msg.from == from & msg.fromType == userType))+'"><img  src="'+obj.thumbnail+'"/><div class="downloadIcon"> <i class="fa fa-arrow-down fa-fw" aria-hidden="true"></i></div><div class="fileInfo">'+obj.name+'</div></div>'+bottomSaid(from,msg_))
							scrollnewMsg(dom)
						}
					)
					
				}else{
					docExist(obj.name,
						function(entry){ //no tiene prevista y esta en el disco
							var mimetype_icon = "file.png"
							dom.find(".said_body").html('<div class="attachment" download-name="'+obj.name+'" mime="'+obj.mime+'"><img src="img/'+mimetype_icon+'"/><div class="fileInfo">'+obj.name+'</div></div>'+bottomSaid(from,msg_))
							scrollnewMsg(dom)
						},
						function(){
							var mimetype_icon = "file.png"
							dom.find(".said_body").html('<div class="thumbnail_atta" download-name="'+obj.name+'" mime="'+obj.mime+'" recived="'+ (!(msg.from == from & msg.fromType == userType))+'"><img src="img/'+mimetype_icon+'"/><div class="downloadIcon"> <i class="fa fa-arrow-down fa-fw" aria-hidden="true"></i></div><div class="fileInfo">'+obj.name+'</div></div>'+bottomSaid(from,msg_))
							scrollnewMsg(dom)
						}
					)
				}
			
			break;
			
			case "quote":
				var body = dom.find(".said_body")
				body.html(unescapeUnicode(obj.data)+bottomSaid(from,msg_))
				console.log(obj.ref)
				var clone = $("#" + obj.ref +" .said_body").clone()
				clone.find(".said_bottom *").remove()
				clone.find(".quote").remove()
				var dom =  $('<div class="quote">')
				dom.append($('<div class="quote_header">'+clone.attr("who")+'</div>'))
				dom.append(clone)
				body.prepend(dom) 
				
			break;
			
			default:
			break;
			
		}	
}

function insertChat(chat){
	var dom = $(`<div id="`+ chat.id+`"  class="chat_lst_element" section-target="msgChat" section-title="Chat" section-fx-parameters="'`+ chat.chatId+`'">
								<div class="chat_lst_element_picture">
									<i class="fa fa-user`+(chat.isGroup==1? "s" : "")+`"></i>
								</div>

								<div class="chat_lst_element_info">
									<div class="chat_lst_element_who">
										`+chat.name+`
									</div> 

									<div class="chat_lst_element_lastMsg">
										`+unescapeUnicode(chat.message)+`
									</div> 

									<div class="chat_lst_element_lastMsgDate">
										`+(new Date(chat.writeDate)).toLocaleString()+`
									</div> 
								</div>

								<div class="chat_lst_element_right">
									<div class="chat_lst_element_msgQty">
										`+chat.messages+`
									</div> 

									<div class="removeChat">
									    <i class="fa fa-trash-o" aria-hidden="true"></i>
									</div>
								</div>
							</div>`)

		if($("#"+chat.id).length>0){
			$("#"+chat.id).replaceWith(dom)
		}else{
			$('#chat_list .nice-wrapper').append(dom)	
		}
		
	 	makeChatSwipe(dom)	
	 	return dom;	
}

function insertChatContact(contact,type){
	var dom = $(`<div id="`+contact.id+`" class="chat_contact" type="`+type+`" section-target="msgChat" section-fx-parameters="'`+contact.chat+`'" section-title="Chat" >
					<i class="fa fa-`+type+`"></i> <span class="chat_lst_element_who">`+ contact.name+`</span> 
				</div>`)
	$('[tab-name='+(type=="user"? "Employee" : "Department")+'] .nice-wrapper').append(dom)
}

$(document).on("tapend","#ChatMsgNav .fa-times",function(){
	$("#ChatMsgNav").html(chatBar)
	$(".chat_message.selected").removeClass("selected")
})




$(document).on("tapend","#ChatMsgNav .fa-reply",function(){
	var tid = uuid()
	var date_ = new Date().getTime()
	var data = escapeUnicode($("#chat_sender_txt").html())
	var ref = "msg"+getSelectedIds().map(function(temp){return temp.id})[0]
	console.log(ref)
	$("#ChatMsgNav").html(chatBar)
	$(".selected").removeClass("selected")
	$("#chat_sender_txt").html("")
	sendMessage(tid,data,"quote",{data :data, ref : ref})
	insertMsg("I",{chatId: tid,from : "I", fromType: userType ,name: "I",writeDate: date_, message: {type : "quote" , ref : ref, data : unescapeUnicode(data)}})
})


$(document).on("tapend","#ChatMsgNav .fa-trash-o",function(){
	showAlert("Eliminar Mensajes","Desea eliminar "+$(".chat_message.selected").length+" mensajes",function(){
	
		loginInfo(function(doc){
			var tempObj = {
				to : doc.estates[estateSelected].guestId,
				toType : userType,
				messages: getSelectedIds()
			}
			console.log(tempObj)
			_post("/chat/delete/message/app" ,tempObj ,function(){
			
					$("#ChatMsgNav").html(chatBar)
					loginInfo(function(doc){
					db.get4Guest("chatId"+currentChat.chatId,doc.estates[estateSelected].guestId).then(function(oldMsg){
						var selected = getSelectedIds().map(function(temp){return temp.id})
						$(".chat_message.selected").remove()
						oldMsg.messages = oldMsg.messages.filter(function(msg){
								return selected.indexOf(msg.chatId) < 0
						})	
						db.upsert4Guest("chatId"+currentChat.chatId,doc.estates[estateSelected].guestId,oldMsg)
					})
					
				
})
			},function(){
				window.plugins.toast.showLongCenter("Imposible borrar archivos en este momento")
			})
		
		})
	},
	function(){
			
	})
})

$(document).on("tapend","#chat_sender_ath",function(ev){
	if(checkPress(ev)){
		$("#invisibleTap").show()
		$("#select_attachment_type").css({display: "flex"})
	}
})

$(document).on("tapend","#select_attachment_type .fa-file-o",function(ev){
	console.log("yes")
	fileChooser.open(function(uri){ 
	console.log(uri)
		window.FilePath.resolveNativePath(uri,function(filePath){
			console.log(filePath)
			pathToFileEntry(filePath,function(entry){
				console.log(entry)
				var fn = getNameFromUrl(filePath)
				 dirc.getDirectory(directory, { create: true }, function (dirEntry) {
					dirEntry.getDirectory(fn.ext, { create: true }, function (subDirEntry) {
						entry.copyTo(subDirEntry,fn.fullName)
						entry.file(function(file){
							readDataUrl(file,function(data){
								var uuid_ = uuid()
								var date_ = (new Date()).getTime();
								
								
								insertMsg("I",{
										chatId: uuid_,
										from: "I",
										fromType: userType,
										writeDate: date_ ,
										message:{
											type: "attachment",
											name:  fn.fullName,
											mime: "none"
										}
									}
								)
								sendMessage(uuid_,date_,"attachment",data,fn.fullName)
							})
						}
						,function(e){console.log("err",e)})
						
					}, function(e){console.log("err",e)});
				}, function(e){console.log("err",e)});
				
			})
		},function(e){console.log(error)})

	}, function(e){
		console.log("error: ",e)
	});
})


$(document).on("tapend","#select_attachment_type .fa-camera",function(ev){
	navigator.camera.getPicture(onCamaraSuccess, onCamaraFail, { quality: 50, destinationType: Camera.DestinationType.DATA_URL});
})

$(document).on("tapend","#select_attachment_type .fa-picture-o",function(ev){
	navigator.camera.getPicture(onCamaraSuccess, onCamaraFail, { quality: 50, destinationType: Camera.DestinationType.DATA_URL, sourceType: Camera.PictureSourceType.SAVEDPHOTOALBUM});
})



$(document).on("tapend","#invisibleTap",function(ev){
	$("#invisibleTap").hide()
	$("#select_attachment_type").hide()
})

downloadMsg = function(this_, recived, callback){
	loginInfo(function(doc){
			var tempObj = {
				to : doc.estates[estateSelected].guestId,
				toType : userType,
				chatMessageId: this_.parents(".chat_message").attr("id").substring(3),
				received : recived == "true"
			}
			console.log("DownloadMsg_temporalObj",tempObj)
		_post("/chat/read/message/validate",tempObj,function(data){
			console.log(data)
			try{
				saveDoc("http://54.212.218.84:2591/downloader/1.0/read/message/"+data.uid+"/"+this_.attr("download-name"),
					function(entity){
						console.log("aka003",callback)
						callback(entity);
					},
					function(e){
						window.plugins.toast.showLongCenter("Error downloading file")
						failFS(e)
					}
				)
			}catch(e){
				console.log(e)
			}
		
			//window.open("http://54.212.218.84:2591/downloader/1.0/read/message/"+data.uid+"/"+this_.next().next().html());
		},function(e){
			console.log(e); 
		showInfoD("Error","Imposible obtener ruta segura")})
		
	})
}

$(document).on("tapend",".prevImage",function(ev){
	if(checkPress(ev)){
		$("#imgPreview").css({"background-image" :"url("+ $(this).find("img").attr("src")+")"}).fadeIn()
	$("#imgPreview_actionBar").slideDown()
	}
})

$(document).on("tapend","#imgPreview",function(ev){
	$("#imgPreview_actionBar").slideToggle()
})

$(document).on("tapend","#imgPreview_actionBar .fa-times",function(ev){
	ev.stopPropagation();
	$("#imgPreview").fadeOut();
})

$(document).on("tapend",".thumbnail_atta",function(ev){
	if(checkPress(ev)){
		var this_ = $(this);
		this_.find(".downloadIcon").addClass("downloading")
		downloadMsg(this_,
			this_.attr("recived"),
			function(){
			console.log("aka004")
			this_.find(".downloadIcon").remove()
			this_.removeClass("thumbnail_atta").addClass("attachment")
		})
	}
})


$(document).on("tapend",".thumbnail_img",function(ev){
	if(checkPress(ev)){
		var this_ = $(this);
		this_.find(".downloadIcon").addClass("downloading")
		downloadMsg(this_,
			this_.attr("recived"),
			function(entity){
			console.log("aka004")
			this_.find(".downloadIcon").remove()
			this_.removeClass("thumbnail_img").addClass("prevImage")
			this_.find("img").displayImageByFileURL(entity)
		})
	}
})

$(document).on("tapend",".thumbnail_aud",function(ev){
	if(checkPress(ev)){
		var this_ = $(this);
		this_.find(".downloadIcon").addClass("downloading")
		downloadMsg(this_,
			this_.attr("recived"),
			function(entity){
			console.log("aka004")
			this_.find(".downloadIcon").remove()
			this_.removeClass("thumbnail_aud")
			this_.find("img").replaceWith('<audio controls><source src="'+entity.toURL()+'"></audio>')
		})
	}
})


$(document).on("tapend",".attachment",function(ev){
	if(checkPress(ev)){
		var this_ = $(this);
		openDoc(this_.attr("download-name"),this_.attr("mime"))
	}
})

$(document).on("tapend","#goBottom",function(ev){
	if(checkPress(ev)){
		goBottom(100,1)
	}
})

$(document).on("tapend",".removeChat",function(ev){
	ev.stopPropagation()
	if(checkPress(ev)){
		var this_ = $(this)
		var chatId = eval($(this).parents(".chat_lst_element").attr("section-fx-parameters"))
		
		showAlert("Confirmación","Seguro que desea borrar este Chat",function(){
			loginInfo(function(doc){
				var tempObj = {
					to : doc.estates[estateSelected].guestId,
					toType : userType,
					chatId : chatId
				}
				console.log(tempObj)
				_post("/chat/delete/app",tempObj,function(data){
					db.get4Guest("chat",doc.estates[estateSelected].guestId).then(function(doc1){
						doc1.chats = doc1.chats.filter(function(chat){
							return chat.chatId != chatId
						})
						db.upsert4Guest("chat",doc.estates[estateSelected].guestId,doc1)
					
					}) 
					
					db.get4Guest("chatId"+chatId,doc.estates[estateSelected].guestId).then(function(oldMsg){
						return db.remove(oldMsg)
					})
					this_.parents(".chat_lst_element").remove()
				}).fail(function(err){
					
				})
			})
		},function(){})
	}
})

$("#chat_lst_box").scroll(function() {
	var nice = $("#chat_lst_box").getNiceScroll(0);
	if(nice.getScrollTop()+15 >= nice.page.maxh) {
		$(".qtyNewMsg").attr("qty",0).html(0)
		$("#goBottom").fadeOut()
	}else{
		$("#goBottom").fadeIn()
	}
  });


document.getElementById("chat_sender_txt").addEventListener("input", function() {
    if($("#chat_sender_txt").text() != ""){
		$("#chat_sender_btn .fa-microphone").removeClass("fa-microphone").addClass("fa-paper-plane");
		$("#phone_rec").hide();
	}else{
		$("#chat_sender_btn .fa-paper-plane").removeClass("fa-paper-plane").addClass("fa-microphone");
		$("#phone_rec").show();
	}
}, false);


$("#phone_rec").swipe( {
    //Generic swipe handler for all directions
    swipe:function(event, direction, distance, duration, fingerCount, fingerData) {
        $(this).addClass("hide_rec")
          $("#canceling").css({width : 0+"px" , height: 0+"px", margin:  (72-0/2)+"px"})  
        if(distance>145){
               console.log("cancelar")
			   audioinput.stop();
        }else{
               console.log("enviar")
			   var uuid_ = uuid()
			   var date = new Date()
			   
			   var dom = $('<div class="chat_message" id="msg'+uuid_+'"><div class="i_said">'+ `<div class="said_bottom">
					<div class="said_state">
						<i class="fa `+getIconStatus("N")+`" aria-hidden="true"></i>
				</div>
				<div class="said_date">`+(new Date(date).toLocaleString())+`</div>`+'</div></div>')
			   $("#chat_lst_box .nice-wrapper").append(dom);
			   stopRecoarding(uuid_,date,dom.find(".i_said"))
        }
    },
   	swipeStatus:function(event, phase, direction, distance, duration, fingers, fingerData, currentDirection){
         $("#canceling").css({width : distance+"px" , height: distance+"px", margin:  (72-distance/2)+"px"})  
		  if($(this).hasClass("hide_rec")){
				startRecoarding()
		  }
		  $(this).removeClass("hide_rec")
    },
	threshold: 0
  });

  
  function sendMessage(tid,date,type,data,fileName){
	  loginInfo(function(doc){
		  console.log("doc",doc)
		  var tempObj  = {
				from : doc.estates[estateSelected].guestId,
				fromType : userType,
				writeDate : date,
				tid: tid, // id temporal mientras q be devuelve el real
				message: {
					type: type,
					data: data
				}
			}
			if(currentChat.chatType == "contact"){
				tempObj.to 		=  currentChat.to
				tempObj.toType 	=  currentChat.toType
			}else{
				tempObj.chatId = currentChat.chatId
			}
			
			if(fileName != undefined){
				tempObj.fileName = fileName
			}
			console.log(tempObj)
			w.postMessage(JSON.stringify(tempObj))
	  })   
  }

$("#chat_sender_btn").tapend(function(){
	if($("#chat_sender_btn .fa-microphone").length >0 ){
	}else{
		var tid = uuid()
		var date = (new Date()).getTime()
		var data = escapeUnicode($("#chat_sender_txt").html())
		$("#chat_sender_txt").html("")
		sendMessage(tid,date,"text",data)
		
		insertMsg("I",{
			from : "I",
			chatId: tid,
			fromType : userType,
			message: {
				type: "text",
				data:data
			},
			writeDate : date,
			status: "N"
			
		})
	}
});


chat = {
	init: function(){ 	
		
		$('[tab-name=Employee] .nice-wrapper').html("")
		$('[tab-name=Department] .nice-wrapper').html("")
		this.getChats()
		this.getContactLists()
	},

	getChats : function(){
		loginInfo(function(doc){
			var tempObj = {
				to : doc.estates[estateSelected].guestId,
				toType : userType
			}
			db.get4Guest("chat",doc.estates[estateSelected].guestId).then(function(doc1){
				doc1.chats.forEach(function(chat){
					insertChat(chat)
				})
				tempObj.version = doc1.version
				_post("/chat/read/app",tempObj,function(data){
					console.log(data)
					if($.isEmptyObject(data)){
						console.log(data)
						data= doc1;
					}else{
						data.chats = data.chats.concat(doc1.chats)
					}
					db.upsert4Guest("chat",doc.estates[estateSelected].guestId,data)
					data.chats.forEach(function(chat){
						insertChat(chat)
					})
				},function(e){
					doc1.chats.forEach(function(chat){
						insertChat(chat)
					})
				})
			}).catch(function(e){
					_post("/chat/read/app",tempObj,function(data){
					console.log(data)
					db.upsert4Guest("chat",doc.estates[estateSelected].guestId,data)
					data.chats.forEach(function(chat){
						insertChat(chat)
					})
				},function(e){})
			})
			
		})
	},

	getContactLists : function (){
		loginInfo(function(doc){
			var tempObj = {
				to : doc.estates[estateSelected].guestId,
				toType : userType
			}
			db.get("contacts").then(function(doc){
				tempObj.userVersion = doc.userVersion 
				tempObj.groupVersion = doc.groupVersion 
				doc.users.forEach(function(user){
					insertChatContact(user,"user")
				})
				doc.groups.forEach(function(group){
					insertChatContact(group,"users")
				})
				
				_post("/chat/read/users/groups",tempObj,function(data){
					
					data.users.forEach(function(user){
						insertChatContact(user,"user")
					})
					data.groups.forEach(function(group){
						insertChatContact(group,"users")
					})
					
					data.users.concat(doc.users)
					data.groups.concat(doc.groups)
					db.upsert("contacts",data)
				},function(e){
					//showInfoD("Error","No se pudo descargar las listas de contactos")
				})
			}).catch(function(e){
				_post("/chat/read/users/groups",tempObj,function(data){
					data.users.forEach(function(user){
						insertChatContact(user,"user")
					})
					data.groups.forEach(function(group){
						insertChatContact(group,"users")
					})
					db.upsert("contacts",data)
				},function(e){
					showInfoD("Error","No se pudo descargar las listas de contactos")
				})
			})
				
		})
	}
}


msgChat = {
	init :	function(this_,chatId){
		console.log(chatId)
		if(currentChat != null && currentChat.chatId != chatId){
			$("#chat_lst_box .nice-wrapper").html("")
		}
			
						window.plugins.toast.showLongCenter("Sincronizando mensajes")
		if(chatId != "null"){
			currentChat = {chatId : chatId,chatType : "chat"}
		}else{
			console.log("Normal")
			currentChat = {to : $(this_).attr("id"), toType : $(this_).attr("type") == "user" ? "U" : "G", chatType : "contact"}
		}
		console.log(chatId)
		console.log($(this_))
		
		$("#ChatMsgInfoNav div").html($(this_).find(".chat_lst_element_who").html())
		$("#ChatMsgNav div").html($(this_).find(".chat_lst_element_who").html())
		$("#ChatMsgInfoNav .fa-chevron-left").attr("section-fx-parameters","'"+chatId+"'")
		getMessages(chatId,true,true)
	}
}




