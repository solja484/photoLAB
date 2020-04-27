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

            $("#fav"+ph_id).text("Видалити з закладок").removeClass('btn-outline-info').removeClass('bg-hover-green')
                .addClass('btn-outline-danger');
            $("#fav"+ph_id).attr("onclick","deleteFromFavorites("+ph_id+","+user_id+")");
        },
        error: function (data2) {
            console.log(data2.error);
        }

    });

}



function deleteFromFavorites(ph_id,user_id){

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

            $("#fav"+ph_id).text("Додати до закладок").removeClass('btn-outline-danger').addClass('btn-outline-info').addClass('bg-hover-green')

            $("#fav"+ph_id).attr("onclick","addToFavorites("+ph_id+","+user_id+")");
        },
        error: function (data2) {
            console.log(data2.error);
        }

    });

}