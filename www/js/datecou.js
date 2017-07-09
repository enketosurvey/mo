
var dw = ["D","L","K","M","J","V","S"];
var mt = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Setiembre","Octubre","Noviembre","Diciembre"];
function createDateCoursel(tbl,year,month){
	var dayNames 	= "";
	var dayNumbers 	= "";
	var pointerDate   = new Date(year,month,1,0,0,0,0).getDay();
	
	for (var i = 1; i <= Date.getDaysInMonth(year, month); i++){
		dayNumbers += "<td>"+i+"</td>";
		dayNames += "<td>"+dw[(pointerDate%7)]+"</td>";
		pointerDate++;
	}
	$(tbl).css({"width" : (i*36)+"px"}).html("<tr>"+dayNames+"</tr><tr>"+dayNumbers+"</tr>")
}


function calendarMonth(tbl,year,month,day){
	var pointerDate   = new Date(year,month,1,0,0,0,0).getDay();
	var dayNumbers = "<table><tr><td id='prev_month'><i class='fa fa-chevron-left' aria-hidden='true'></i></td><td style='width:110px'>"+mt[month]+"</td><td id='next_month'><i class='fa fa-chevron-right' aria-hidden='true'></i></td><td id='prev_year'><i class='fa fa-chevron-left' aria-hidden='true'></i></td><td>"+year+"</td><td id='next_year'><i class='fa fa-chevron-right' aria-hidden='true'></i></td></tr></table><table class='jasj_sch_day'><tr><th>D</th><th>L</th><th>K</th><th>M</th><th>J</th><th>V</th><th>S</th></tr><tr>"
	for(var e=0 ; e< pointerDate; e++){
		dayNumbers += "<td></td>"
	}
	for (var i = 1; i <= Date.getDaysInMonth(year, month); i++){
		dayNumbers += "<td "+(i==day? "class='selected_sch_day'":"")+">"+i+"</td>";
		if(pointerDate%7 == 6) dayNumbers += "</tr><tr>"
		pointerDate++;
	}
	$(tbl).html(dayNumbers +"</tr></table><table class='navCalendar'><tr><td class='sch_clean'>LIMPIAR</td><td d class='sch_cancel'>CANCELAR</td><td d class='sch_acept'>ACEPTAR</td></tr></table>")
}

function getSch(){
	if($(".selected_sch_day").length > 0){
		return  $(".selected_sch_day").text()+"/"+(jasjMonth+1)+"/"+jasjYear
	}else{
		return "";
	}
}

function getItem(b){
	var senpos= b.scrollTop()/44;
	var integer = parseInt(senpos)
	var decimal = Math.round(senpos-integer);
	
	return decimal+integer;
}

function getTmr(){
	var h = $(".jasj_td_scroll").eq(0);
	var m = $(".jasj_td_scroll").eq(1);
	var t = $(".jasj_td_scroll").eq(2);
	
	
	
	return h.find("p:eq("+getItem(h)+")").text()+":"+m.find("p:eq("+getItem(m)+")").text()+" "+t.find("p:eq("+getItem(t)+")").text();
}

createDateCoursel(".pick_cursel_day",2017,3)
calendarMonth(".jasj_calendar",2000,3)


$(document).on("tapend",".pick_cursel_day tr:nth-child(2) td",function(ev){
	if(checkPress(ev)){
		$(this).toggleClass("selected_cur_day");
	}
})

$(document).on("tapend",".tmr_up td",function(){
	var target = $(".jasj_td_scroll").eq($(this).index());
	target.scrollTop(target.scrollTop()-40);

});


$(document).on("tapend",".tmr_down td",function(){
	var target = $(".jasj_td_scroll").eq($(this).index());
	target.scrollTop(target.scrollTop()+40);

});





$(document).on("tapend","#prev_month",function(){
	jasjMonth --;
	if(jasjMonth < 0) { jasjYear --; jasjMonth= 11;}
	calendarMonth(".jasj_calendar",jasjYear,jasjMonth)
})

$(document).on("tapend","#next_month",function(){
	jasjMonth ++;
	if(jasjMonth > 11) { jasjYear ++; jasjMonth= 0;}
	calendarMonth(".jasj_calendar",jasjYear,jasjMonth)
})

$(document).on("tapend","#next_year",function(){
	jasjYear ++;
	calendarMonth(".jasj_calendar",jasjYear,jasjMonth)
})

$(document).on("tapend","#prev_year",function(){
	jasjYear --;
	calendarMonth(".jasj_calendar",jasjYear,jasjMonth)
})

$(document).on("tapend",".jasj_sch_day td",function(){
	if($(this).text()!=""){
		$(".selected_sch_day").removeClass("selected_sch_day");
		$(this).addClass("selected_sch_day");
	}
})

$(document).on("tapend",".sch_acept",function(){
	$("#"+$('.jasj_calendar').attr("sch-target")).text(getSch());
	$('.jasj_calendar').hide();
	
})

$(document).on("tapend",".sch_cancel",function(){
	$('.jasj_calendar').hide();
})

$(document).on("tapend",".sch_clean",function(){
	$('.jasj_calendar').hide();
	$(".selected_sch_day").removeClass(".selected_sch_day");
	$("#"+$('.jasj_calendar').attr("sch-target")).text("");
})

$(document).on("tapend",".tmr_acept",function(){
	$("#"+$('.jasj_time').attr("tmr-target")).text(getTmr());
	$('.jasj_time').hide();
})
$(document).on("tapend",".tmr_cancel",function(){
	$('.jasj_time').hide();
})
$(document).on("tapend",".tmr_clean",function(){
	$("#"+$('.jasj_time').attr("tmr-target")).text("");
	$('.jasj_time').hide();
})

$.fn.scrollEnd = function(callback, timeout) {          
  $(this).scroll(function(){
    var $this = $(this);
    if ($this.data('scrollTimeout')) {
      clearTimeout($this.data('scrollTimeout'));
    }
    $this.data('scrollTimeout', setTimeout(callback,timeout,$(this)));
  });
};


$(".jasj_td_scroll").scrollEnd(function(b){
	var senpos= b.scrollTop()/44;
	var integer = parseInt(senpos)
	var decimal = Math.round(senpos-integer);
	b.scrollTop((integer+decimal)*44);
	console.log(senpos,integer,decimal)
},300)


$('.datepicker').tapend(function(e){
	e.preventDefault(); 
	$('.jasj_calendar').show().attr("sch-target",$(this).attr("id"));
	var d;
	if($(this).text()!=""){
		 d = $(this).text().split("/");
		jasjYear 	= d[2];
		jasjMonth 	= d[1]-1;
		jasjDay 	= d[0];
	}else{
		 d= new Date();
		 jasjYear 	= d.getFullYear()
		 jasjMonth 	= d.getMonth()
		 jasjDay 	= d.getDate();
		 console.log(jasjMonth)
	}
	calendarMonth(".jasj_calendar",jasjYear,jasjMonth,jasjDay)
})




