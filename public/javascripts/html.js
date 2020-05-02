function fillSearchPhotographers(phinfo,cookies,photos,favorites,ratings){
    fillCities();
    for(let ph of phinfo){
        if((cookies.auth=='true'&&ph.username!==cookies.username)||(cookies.auth=='false')){
            let avatar_link=ph.avatar_link;
            if(ph.avatar_link==undefined||ph.avatar_link==null)
                avatar_link="https://i.pinimg.com/564x/d9/7b/bb/d97bbb08017ac2309307f0822e63d082.jpg";
            let organization=ph.organization;
            if(ph.organization==undefined||ph.organization==null)
                organization=" ";
            $("#search_people").append("<div class='panel panel-primary' id='searchph"+ph.ph_id+"'><div class='row mg-0 pd-10'>" +
                "<div class='col-md-3'>" +
                "<div class='avatar-md mg-10'>" +
                "<div class='circle-avatar pd-10' style='background-image:url("+avatar_link+")'>" +
                "</div></div></div>" +
                "<div class='col-md-5'>" +
                "<a class='text-24 link1' href='/guest/"+ph.username+"'>@"+ph.username+"</a>" +
                "<div class='h5'>" +
                "<span class='text-muted pd-r-25'>$"+ph.price+"</span>" +
                "<i class='material-icons text-20 '> &#xe55f;</i>" +
                "<span class='text-20'>"+ph.city+"</span>" +
                "<br><br><h5>"+organization+"</h5>"+
                "</div>" +
                "</div>" +
                "<div class='col-md-4 pd-25 float-right' id='favorites_button"+ph.ph_id+"'>" +
                "</div>" +
                "</div></div>");
            if(cookies.auth=='true'){
                let contains=false;
                for(let fav of favorites)
                    if (fav.user_id == cookies.user_id&&fav.ph_id==ph.ph_id) {
                        contains = true;
                        $("#favorites_button" + ph.ph_id).append("" +
                            "<button class='btn pd-0 btn-light float-right hover-green border-none green bg-transparent'" +
                            " id='fav" + ph.ph_id + "' onclick='deleteFromFavorites(" + ph.ph_id + "," + cookies.user_id + ")'>" +
                            "<i class='text-40 material-icons'>  &#xe8e6;</i>" +
                            "</button>");
                        break;
                    }


                    if(!contains)
                        $("#favorites_button"+ph.ph_id).append("" +
                            "<button class='btn pd-0 btn-light float-right hover-green border-none green bg-transparent'" +
                            " id='fav"+ph.ph_id+"' onclick='addToFavorites("+ph.ph_id+","+cookies.user_id+")'>" +
                            "<i class=' text-40 material-icons '>&#xe8e7;</i>" +
                            "</button>");
            }
                let stars="";
                let have_stars=false;
                for(let r of ratings)
                    if(r.ph_id==ph.ph_id){
                        have_stars=true;
                        for(let st=0;st<r.ave;st++)
                            stars+="<i class='fa fa-star yellow text-20'></i>";
                        for(let i=r.ave; i<10;i++)
                            stars+="<i class='fa fa-star-o yellow text-20'></i>";

                        $("#favorites_button" + ph.ph_id).append("<br><br>" +
                            "<p class='text-14 float-right'>"+stars+r.ave+"/10</p>");
                    }

                    if(!have_stars){
                        for(let i=0; i<10;i++)
                            stars+="<i class='fa fa-star-o yellow text-20'></i>";
                        $("#favorites_button" + ph.ph_id).append("<br><br><p class='text-14 float-right'>"+stars+"</p>");
                    }


            $("#searchph"+ph.ph_id).append("<div class='row mg-0 pd-10'>" +
                "<div class='col-md-12'>" +
                "<div id='blogCarousel"+ph.ph_id+"' class='carousel slide pd-25' data-ride='carousel'>" +
                "<div class='carousel-inner' id='carousel"+ph.ph_id+"'></div>" +
                "</div>" +
                "</div></div>");

            let counter=0;
            let s="";
            for(photo of photos){

                if(photo.ph_id==ph.ph_id){
                    if(counter==0)
                        s+="<div class='carousel-item active'><div class='row'>";

                    if(counter==4)
                        s+="<div class='carousel-item'><div class='row'>";


                        counter++;

                  s+="<div class='col-md-3 avatar-square'>" +
                      "<div class='circle-avatar' style='background-image:url("+photo.link+")'></div></div>";

                    if(counter==4)
                        s+="</div></div>";

                    if(counter==8){
                        s+="</div></div>";
                        break;
                    }


            }

            }   if(counter<4)
                $("#carousel"+ph.ph_id).append(s);
            if(counter<=8&&counter>4){
                $("#carousel"+ph.ph_id).append(s);
                $("#blogCarousel"+ph.ph_id).append("" +
                    "<a class='carousel-control-prev' href='#blogCarousel"+ph.ph_id+"' role='button' data-slide='prev'>" +
                    "<span class='carousel-control-prev-icon' aria-hidden='true'></span>" +
                    "<span class='sr-only'> Previous</span>" +
                    "</a>" +
                    "<a class='carousel-control-next' href='#blogCarousel"+ph.ph_id+"' role='button' data-slide='next'>" +
                    "<span class='carousel-control-next-icon' aria-hidden='true'></span>" +
                    "<span class='sr-only'> Next</span>" +
                    "</a>");
            }

            }

        }

}

function setRatings(guest,info,cookies){
    const sel=  $("#rating_container");
  sel.empty();

    if((cookies.auth=='false')||(!guest)){
        let stars="<p class='text-14'>";
        for(let st=0;st<info.ave;st++)
            stars+="<i class='fa fa-star yellow text-24' ></i>";
        for(let i=info.ave; i<10;i++)
            stars+="<i class='fa fa-star-o yellow text-24'></i>";
        stars+=info.ave+"/10</p>";
        sel.append(stars);
    }else if(cookies.auth){
        if(info.mark!=0){

            let stars="<p class='text-14'>";
            for(let st=0;st<info.ave;st++)
                stars+="<i class='fa fa-star yellow text-24'></i>";
            for(let i=info.ave; i<10;i++)
                stars+="<i class='fa fa-star-o yellow text-24'></i>";
            stars+=info.ave+"/10</p>";
            stars+="<p class='text-muted text-14'>Ви проголосували: "+info.mark+"</p>";
            stars+="<button class='btn link1 background-transparent text-14' onclick='unvote("+cookies.user_id+","+info.ph_id+")'>Видалити голос</button>";
            sel.append(stars);

        }else if(info.mark==0){
            let stars="<p class='text-14'>";
            for(let st=0;st<10;st++)
                stars+="<i class='fa fa-star-o yellow text-24' id='rating_star"+st+"'></i>";
            stars+="</p>";
            sel.append(stars);
            changingStars(cookies.user_id,info.ph_id);
        }


    }

}


function changingStars(user_id,ph_id){
    for(let i=0;i<10;i++){
        $("#rating_star"+i).attr("onclick","vote("+(i+1)+","+user_id+","+ph_id+")")
            .hover(function(){
                for(let j=0;j<=i;j++){
                    $("#rating_star"+j).removeClass("fa-star-o").addClass("fa-star");
                }
            },function(){
                for(let j=0;j<=i;j++){
                    $("#rating_star"+j).removeClass("fa-star").addClass("fa-star-o");
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


