function pushDriver(ev){
	var payload = ev.payload
	switch (payload.type){
		case "chat":
			
			console.log("aqui estoy")
			console.log(ev.payload.chatId)
			getMessages(ev.payload.chatId,(ev.foreground && (currentChat.chatId == payload.chatId)),false)	
			chat.getChats()
			if(ev.foreground && (currentChat.chatId == payload.chatId)){
				$(".qtyNewMsg").attr("qty",(parseInt($(".qtyNewMsg").attr("qty"))+1)).html($(".qtyNewMsg").attr("qty"))
			}
		break;
		
		default:
			console.log("this version do not recognize the type: "+ payload.type)
			chat.getChats()
		break;
	}
}


