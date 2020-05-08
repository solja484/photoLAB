$(document).ready(function () {
    let date=getCurrentDate();
    localStorage.setItem("cur_month",date.month);
    localStorage.setItem("cur_day",date.day);
    localStorage.setItem("calendar_month",date.month);
    localStorage.setItem("search","photo");
});
function fillSearchPhotographers(phinfo, cookies, photos, favorites) {
    $("#cancel_search").hide();
    fillCities();
    for (let ph of phinfo) {
        if ((cookies.auth == 'true' && ph.username !== cookies.username) || (cookies.auth == 'false')) {
            let avatar_link = ph.avatar_link;
            if (ph.avatar_link == undefined || ph.avatar_link == null)
                avatar_link = "https://i.pinimg.com/564x/d9/7b/bb/d97bbb08017ac2309307f0822e63d082.jpg";
            let organization = ph.organization;
            if (ph.organization == undefined || ph.organization == null)
                organization = " ";
            $("#search_people").append("<div class='panel panel-primary' id='searchph" + ph.ph_id + "'><div class='row mg-0 pd-10'>" +
                "<div class='col-md-3'>" +
                "<div class='avatar-md mg-10'>" +
                "<div class='circle-avatar pd-10' style='background-image:url(" + avatar_link + ")'>" +
                "</div></div></div>" +
                "<div class='col-md-5'>" +
                "<a class='text-24 link1' href='/guest/" + ph.username + "'>@" + ph.username + "</a>" +
                "<div class='h5'>" +
                "<span class='text-muted pd-r-25'>$" + ph.price + "</span>" +
                "<i class='material-icons text-20 '> &#xe55f;</i>" +
                "<span class='text-20'>" + ph.city + "</span>" +
                "<br><br><h5>" + organization + "</h5>" +
                "</div>" +
                "</div>" +
                "<div class='col-md-4 pd-25 float-right' id='favorites_button" + ph.ph_id + "'>" +
                "</div>" +
                "</div></div>");
            if (cookies.auth == 'true') {
                let contains = false;
                for (let fav of favorites)
                    if (fav.user_id == cookies.user_id && fav.ph_id == ph.ph_id) {
                        contains = true;
                        $("#favorites_button" + ph.ph_id).append("" +
                            "<button class='btn pd-0 btn-light float-right hover-green border-none green bg-transparent'" +
                            " id='fav" + ph.ph_id + "' onclick='deleteFromFavorites(" + ph.ph_id + "," + cookies.user_id + ")'>" +
                            "<i class='text-40 material-icons'>  &#xe8e6;</i>" +
                            "</button>");
                        break;
                    }
                if (!contains)
                    $("#favorites_button" + ph.ph_id).append("" +
                        "<button class='btn pd-0 btn-light float-right hover-green border-none green bg-transparent'" +
                        " id='fav" + ph.ph_id + "' onclick='addToFavorites(" + ph.ph_id + "," + cookies.user_id + ")'>" +
                        "<i class=' text-40 material-icons '>&#xe8e7;</i>" +
                        "</button>");
            }
            let stars = "";
            let have_stars = false;

                if(ph.ave!=null) {
                    have_stars = true;
                    for (let st = 0; st < ph.ave; st++)
                        stars += "<i class='fa fa-star yellow text-20'></i>";
                    for (let i = ph.ave; i < 10; i++)
                        stars += "<i class='fa fa-star-o yellow text-20'></i>";

                    $("#favorites_button" + ph.ph_id).append("<br><br>" +
                        "<p class='text-14 float-right'>" + stars + ph.ave + "/10</p>");
                }

            if (!have_stars) {
                for (let i = 0; i < 10; i++)
                    stars += "<i class='fa fa-star-o yellow text-20'></i>";
                $("#favorites_button" + ph.ph_id).append("<br><br><p class='text-14 float-right'>" + stars + "</p>");
            }
            $("#searchph" + ph.ph_id).append("<div class='row mg-0 pd-10'>" +
                "<div class='col-md-12'>" +
                "<div id='blogCarousel" + ph.ph_id + "' class='carousel slide pd-25' data-ride='carousel'>" +
                "<div class='carousel-inner' id='carousel" + ph.ph_id + "'></div>" +
                "</div>" +
                "</div></div>");
            let counter = 0;
            let s = "";
            for (photo of photos) {
                if (photo.ph_id == ph.ph_id) {
                    if (counter == 0)
                        s += "<div class='carousel-item active'><div class='row'>";
                    if (counter == 4)
                        s += "<div class='carousel-item'><div class='row'>";
                    counter++;
                    s += "<div class='col-md-3 avatar-square'>" +
                        "<div class='circle-avatar' style='background-image:url(" + photo.link + ")'></div></div>";
                    if (counter == 4)
                        s += "</div></div>";
                    if (counter == 8) {
                        s += "</div></div>";
                        break;
                    }
                }
            }
            if (counter < 4)
                $("#carousel" + ph.ph_id).append(s);
            if (counter <= 8 && counter > 4) {
                $("#carousel" + ph.ph_id).append(s);
                $("#blogCarousel" + ph.ph_id).append("" +
                    "<a class='carousel-control-prev' href='#blogCarousel" + ph.ph_id + "' role='button' data-slide='prev'>" +
                    "<span class='carousel-control-prev-icon' aria-hidden='true'></span>" +
                    "<span class='sr-only'> Previous</span>" +
                    "</a>" +
                    "<a class='carousel-control-next' href='#blogCarousel" + ph.ph_id + "' role='button' data-slide='next'>" +
                    "<span class='carousel-control-next-icon' aria-hidden='true'></span>" +
                    "<span class='sr-only'> Next</span>" +
                    "</a>");
            }
        }
    }
}

function setRatings(guest, info, cookies) {
    const sel = $("#rating_container");
    sel.empty();


    if ((cookies.auth == 'false') || (!guest)) {

        let stars = "<p class='text-14'>";
        for (let st = 0; st < info.ave; st++)
            stars += "<i class='fa fa-star yellow text-24' ></i>";
        for (let i = info.ave; i < 10; i++)
            stars += "<i class='fa fa-star-o yellow text-24'></i>";
        stars += info.ave + "/10</p>";
        sel.append(stars);
    } else if (cookies.auth&&guest) {
        if (info.mark != 0) {
            let stars = "<p class='text-14'>";
            for (let st = 0; st < info.ave; st++)
                stars += "<i class='fa fa-star yellow text-24'></i>";
            for (let i = info.ave; i < 10; i++)
                stars += "<i class='fa fa-star-o yellow text-24'></i>";
            stars += info.ave + "/10</p>";
            stars += "<p class='text-muted text-14'>Ви проголосували: " + info.mark +" ";
            stars += "<button class=' link1 border-none background-transparent text-14' onclick='unvote(" + cookies.user_id + "," + info.ph_id + ")'>Видалити голос</button></p>";
            sel.append(stars);

        } else if (info.mark == 0) {
            let stars = "<p class='text-14'>";
            for (let st = 0; st < 10; st++)
                stars += "<i class='fa fa-star-o yellow text-24' id='rating_star" + st + "'></i>";
            stars += "</p>";
            sel.append(stars);
            changingStars(cookies.user_id, info.ph_id);
        }


    }

}

function changingStars(user_id, ph_id) {
    for (let i = 0; i < 10; i++) {
        $("#rating_star" + i).attr("onclick", "vote(" + (i + 1) + "," + user_id + "," + ph_id + ")")
            .hover(function () {
                for (let j = 0; j <= i; j++) {
                    $("#rating_star" + j).removeClass("fa-star-o").addClass("fa-star");
                }
            }, function () {
                for (let j = 0; j <= i; j++) {
                    $("#rating_star" + j).removeClass("fa-star").addClass("fa-star-o");
                }
            });

    }
}

function getListOfFolders(array) {

    let attributes = [];
    array.map(({folder_id}) => {
        if (folder_id) attributes.push(folder_id)
    });

    console.log(attributes);
    return attributes;
}

function setSlider() {
    $(function () {
        $("#slider-range").slider({
            range: true,
            min: 0,
            max: 5000,
            values: [200, 500],
            slide: function (event, ui) {
                $("#filter_price").val(" $" + ui.values[0] + " - $" + ui.values[1]);
            }
        });
        $("#filter_price").val(" $" + $("#slider-range").slider("values", 0) +
            " - $" + $("#slider-range").slider("values", 1));
    });
}


const months={
    "1":{
        "name":"Січень",
        "days":31,
        "genitive":"січня"
    },
    "2":{
        "name":"Лютий",
        "days":28,
        "genitive":"лютого"
    },
    "3":{
        "name":"Березень",
        "days":31,
        "genitive":"березня"
    },
    "4":{
        "name":"Квітень",
        "days":30,
        "genitive":"квітня"
    },
    "5":{
        "name":"Травень",
        "days":31,
        "genitive":"травня"
    },
    "6":{
        "name":"Червень",
        "days":30,
        "genitive":"червня"
    },
    "7":{
        "name":"Липень",
        "days":31,
        "genitive":"липня"
    },
    "8":{
        "name":"Серпень",
        "days":31,
        "genitive":"серпня"
    },
    "9":{
        "name":"Вересень",
        "days":30,
        "genitive":"вересня"
    },
    "10":{
        "name":"Жовтень",
        "days":31,
        "genitive":"жовтня"
    },
    "11":{
        "name":"Листопад",
        "days":30,
        "genitive":"листопада"
    },
    "12":{
        "name":"Грудень",
        "days":31,
        "genitive":"грудня"
    },
};

function setCalendar(dates,cookies,info,guest){
    let today=getCurrentDate();
    $("#month_name").text(months[today.month].name);
    $("#year_number").text(today.year);

    let str=fillTableCells(dates,today.month,today.year,cookies,info.ph_id,guest);

    $("#dates").append(str);
    setNext5Months(dates,cookies,info.ph_id,guest)
}


function setNext5Months(dates,cookies,ph_id,guest){
    let today=getCurrentDate();
    let current_month=today.month;
    for(let i=current_month+1;i<current_month+6;i++){
        let cur_year=today.year;
        if(i==13) cur_year++;
        if(i>12)
            i=i%12;

        let str="";
        str+="<div class='carousel-item row '><div class='col-md-1'></div>"+
            "<div class='mg-0 pd-0 col-md-10 expand'> <div class='month expand'>" +
            "<ul class='no-marks pd-0 mg-0'><li><span class='text-20'>"+months[i].name+"</span><br><span>"+cur_year+
            "</span></li></ul></div>";
        str+="<table class='mg-0 pd-0 expand table-bordered'>" +
            "<thead><tr class='weekdays'><td>Пн</td><td>Вт</td><td>Ср</td><td>Чт</td><td>Пт</td><td>Сб</td><td>Нд</td></tr>" +
            "</thead><tbody id='dates"+i+"'>";


        str+=fillTableCells(dates,i,cur_year,cookies,ph_id,guest);

        str+="<tbody></tbody></table></div><div class='col-md-1'></div></div>";
        $("#calendar-holder").append(str);
    }
}




function fillTableCells(dates,month,cur_year,cookies,ph_id,guest){

    let str="";
    let first = new Date();
    first.setMonth(month-1,1);
    let when_first = first.getDay();
    if(when_first==0)
        when_first=7;
    let cells=[];

    for(let i=1;i<=months[month].days;i++)
        cells.push([i,0]);

    //d=[ Y, M, D, h, m, s ]
    for(let date of dates){
        let d= date.date.split(/[-T:]/);
        if(Number.parseInt(d[1],10)==month)
            cells[Number.parseInt(d[2])][1]=1;
    }

    let before=[];
    for(let i=1;i<when_first;i++)
        before.push([0,0]);

    cells=before.concat(cells);

    while((cells.length%7)!=0)
        cells.push([0,0]);

    for(let i=0;i<cells.length;i++){
        if(i==0)
            str+="<tr>";
        else if(i%7==0)
            str+="</tr><tr>";
        if(cells[i][1]==0&&cells[i][0]==0)
            str+='<td class="day busy"></td>';
        else if(cells[i][1]==0){
            if (cookies.auth=='true'&&cookies.role=='photographer'&&!guest)
                str+='<td class="day busy pointer" onclick="setFree('+ph_id+','+month+','+cells[i][0]+','+cur_year+')">'+cells[i][0]+'</td>';
            else
            str+='<td class="day busy">'+cells[i][0]+'</td>';
        }

        else{
            if(cookies.auth=='true'&&cookies.role=='client')
                str+="<td class='day free' data-toggle='modal' data-target='#make_order_modal' id='day"+cells[i][0]+"-"+month+"' " +
                    "onclick='setMakeOrderOnclick("+ph_id+","+user_id+","+month+","+cells[i][0]+","+cur_year+")' " +
                    ">"+cells[i][0]+"</td>";
            else if (cookies.auth=='true'&&cookies.role=='photographer'&&!guest)
                str+="<td class='day active-date pointer' id='day"+cells[i][0]+"-"+month+"' " +
                    "onclick='setBusy("+ph_id+","+month+","+cells[i][0]+","+cur_year+")' " +
                    ">"+cells[i][0]+"</td>";
                else
                str+="<td class='day free'>"+cells[i][0]+"</td>";
        }


    }
    return str;
}
function setBusy(ph_id,month,day,year){
   $("#day"+day).removeClass("active-date").addClass("busy");
}

function setFree(ph_id,month,day,year){
    $("#day"+day).removeClass("busy").addClass("active-date");
}



function setMakeOrderOnclick(ph_id,user_id,month,day,year){
    $("#make_order_button").attr("onclick","makeOrder("+ph_id+","+user_id+","+month+","+day+","+year+")");
    console.log("set onclick on "+month+" "+day);
    $("#make_order_date").text(" "+day+" "+months[month].genitive+" "+year);
}



function getCurrentDate(){
    let today=new Date();
    let day=today.getDay();
    if(day==0)
        day=7;
    return {
        "day":today.getDate(),
        "month":(today.getMonth() + 1),
        "year":today.getFullYear(),
        "weekday":day
    };
}

function setOrdersDate(orders){

    for(let order of orders) {
        let d = order.date.split(/[-T:]/);
        $("#date_order"+order.order_id).text(d[2]+' '+months[parseInt(d[1],10)].genitive+" "+d[0]+" ");
    }
}