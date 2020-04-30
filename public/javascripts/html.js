function fillSearchPhotographers(phinfo,cookies,user_info,favorites){

    for(let ph of phinfo){
        console.log(ph);
        if((cookies.auth&&ph.username!==cookies.username)||(!cookies.auth)){

            let avatar_link=ph.avatar_link;
            if(ph.avatar_link==undefined||ph.avatar_link==null)
                avatar_link="https://i.pinimg.com/564x/d9/7b/bb/d97bbb08017ac2309307f0822e63d082.jpg";
            let organization=ph.organization;
            if(ph.organization==undefined||ph.organization==null)
                organization=" ";
            console.log(organization);
            $("#search_people").append("<div class='panel panel-primary' id='searchph"+ph.ph_id+"'><div class='row mg-0 pd-10'>" +
                "<div class='col-md-3'>" +
                "<div class='avatar mg-10'>" +
                "<div class='circle-avatar pd-10' style='background-image:url("+avatar_link+")'>" +
                "</div></div></div>" +
                "<div class='col-md-6'>" +
                "<a class='text-24 link1' href='/guest/"+ph.username+"'>@"+ph.username+"</a>" +
                "<div class='h5'>" +
                "<span class='text-muted pd-r-25'>$"+ph.price+"</span>" +
                "<i class='material-icons text-20 '> &#xe55f;</i>" +
                "<span class='text-20'>"+ph.city+"</span>" +
                "<br><h5>"+organization+"</h5>"+
                "</div>" +
                "</div>" +
                "<div class='col-md-3 pd-25' id='favorites_button"+ph.ph_id+"'>" +
                "</div>" +
                "</div></div>");
            if(cookies.auth){
                let contains=false;
                for(let fav of favorites) {
                    console.log("fav "+fav.ph_id);
                    console.log("ph "+ph.ph_id);

                    if (fav.user_id == cookies.user_id&&fav.ph_id==ph.ph_id) {
                        contains = true;
                        $("#favorites_button" + ph.ph_id).append("" +
                            "<button class='btn pd-0 btn-light float-right hover-green border-none green bg-transparent'" +
                            " id='fav" + ph.ph_id + "' onclick='deleteFromFavorites(" + ph.ph_id + "," + cookies.user_id + ")'>" +
                            "<i class='text-40 material-icons'>  &#xe8e6;</i>" +
                            "</button>");
                        break;
                    }
                }
                    console.log("contains"+contains);
                    if(!contains){
                        $("#favorites_button"+ph.ph_id).append("" +
                            "<button class='btn pd-0 btn-light float-right hover-green border-none green bg-transparent'" +
                            " id='fav"+ph.ph_id+"' onclick='addToFavorites("+ph.ph_id+","+cookies.user_id+")'>" +
                            "<i class=' text-40 material-icons '>&#xe8e7;</i>" +
                            "</button>");

                    }
                }
            }

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