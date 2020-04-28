function addToFavorites(ph_id,user_id){

    let data = {
        "ph_id": ph_id,
        "user_id": user_id
    };

    $.ajax({
        url: 'http://localhost:2606/addfavorite',
        type: 'post',
        dataType: 'json',
        data: JSON.stringify(data),
        contentType: 'application/json',
        success: function (data2) {

            $("#fav"+ph_id).empty().append(`<i class=' text-40 material-icons '>&#xe8e6;</i>`).attr("onclick","deleteFromFavorites("+ph_id+","+user_id+")");
        },
        error: function (data2) {
            console.log(data2.error);
        }

    });

}



function deleteFromFavorites(ph_id,user_id, profile=false){

    let data = {
        "ph_id": ph_id,
        "user_id": user_id
    };

    $.ajax({
        url: 'http://localhost:2606/delfavorite',
        type: 'post',
        dataType: 'json',
        data: JSON.stringify(data),
        contentType: 'application/json',
        success: function (data2) {

            if(profile){
                $("#favpanel"+ph_id).remove();
            }else{
            $("#fav"+ph_id).empty().append(`<i class=' text-40 material-icons '>&#xe8e7;</i>`).attr("onclick","addToFavorites("+ph_id+","+user_id+")");
            }
        },
        error: function (data2) {
            console.log(data2.error);
        }

    });

}


