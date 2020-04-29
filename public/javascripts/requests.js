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


function addFolder(){

    if(!validEmpty("addfoldertitle"))
        return;

    let name=$("#addfoldertitle").val();

    let data={
        'name':name
    };


    $.ajax({
        url: 'http://localhost:2606/addfolder',
        type: 'post',
        dataType: 'json',
        data: JSON.stringify(data),
        contentType: 'application/json',
        success: function (data2) {
            removeValid("add_folder_form");
            clearForm("add_folder_form");


            $("#folders_container").append("<a class='link1  folder-link' id='folder"+data2.folder_id+"-tab' " +
                "data-toggle='pill'  href='#folder" +data2.folder_id+"' role='tab' aria-controls='#folder" +data2.folder_id+"' " +
                "aria-selected='false' onclick='setCurrentFolder("+data2.folder_id+")'>"+name+"</a>");
            $("#photos_container").append("<div class='tab-pane fade' id='folder"+data2.folder_id+"' role='tabpanel' " +
                "aria-labelledby='folder"+data2.folder_id+"-tab'></div>"+
                "<br>");
            $("#add_folder_modal").modal('hide');
        },
        error: function (data2) {
            console.log(data2.error);
        }

    });


}

function editFolder() {
    $("#edit_folder_modal").modal('hide');
}

function setCurrentFolder(folder_id){
    localStorage.setItem("folder",folder_id);
}
function getCurrentFolder(){
    return localStorage.getItem("folder");
}

function setFolderName(name) {
    $("#edit_folder_caption").val(name);

}

function editFolder(){
    let folder_id=getCurrentFolder();
    if(!validEmpty("edit_folder_caption"))
        return;

    let name=$("#edit_folder_caption").val();

    let data={
        'folder_id':folder_id,
        'name':name
    };


    $.ajax({
        url: 'http://localhost:2606/editfolder',
        type: 'post',
        dataType: 'json',
        data: JSON.stringify(data),
        contentType: 'application/json',
        success: function (data2) {
            removeValid("edit_folder_form");
            clearForm("edit_folder_form");

            $("#folder"+folder_id+"-tab").text(name);
            $("#edit_folder_modal").modal('hide');
        },
        error: function (data2) {
            console.log(data2.error);
        }

    });

}