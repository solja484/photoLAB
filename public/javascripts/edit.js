//function used when user want to check how the new avatar image would be looking
function tryNewPhoto(){
    let new_link=$("#edit_avatar").val();
    if(new_link=="")
        new_link="https://i.pinimg.com/564x/d9/7b/bb/d97bbb08017ac2309307f0822e63d082.jpg";
    $("#edit_avatar_holder").empty().append(" <div class='circle-avatar pd-10' " +
        "style='background-image:url("+new_link+")'></div>");

}

//return to old photo when new isn't look good
function setOldPhoto(old_link){
    console.log("im in function");

    $("#edit_avatar_holder").empty().append(" <div class='circle-avatar pd-10' " +
        "style='background-image:url("+old_link+")'></div>");
    $("#edit_avatar").val(old_link);
}

//delete any avatar photo and set default picture
function deleteAvatarPhoto(){
    let no_link="https://i.pinimg.com/564x/d9/7b/bb/d97bbb08017ac2309307f0822e63d082.jpg";
    $("#edit_avatar_holder").empty().append(" <div class='circle-avatar pd-10' " +
        "style='background-image:url("+no_link+")'></div>");
    $("#edit_avatar").val("");
}


//function which make ajax-request to server to update information in table "users" for either client and photographer roles 
function editClientInfo(info, users) {
    $("#invalid_edit_un").text("Це поле не може бути пустим");
    $("#invalid_edit_email").text("Некоректно введена електронна пошта");
    let a=validEmpty("edit_username");
    let b=validEmail("edit_email");
    let c=validPhone("edit_phone");
    let d=validNamesF("edit_city");
    if(!(a&&b&&c&&d)) return false;
    if(!validExistedUsername($("#edit_username").val(),users)){
        $("#invalid_edit_un").text("Користувач з таким іменем уже існує!");
        $("#edit_username").removeClass("is-valid").addClass("is-invalid");
    }
    if(!validExistedEmail($("#edit_email").val(),users)){
        $("#invalid_edit_email").text("Користувач з такою поштою уже існує!");
        $("#edit_email").removeClass("is-valid").addClass("is-invalid");
    }
    if(info.role=='photographer'){
        let t=validNames("edit_lastname");
        let s=validNames("edit_firstname");
        let u=  validNamesF("edit_fathername");
        if(!(t&&s&&u)) return false;
    }


    let data={
        "user_id":info.user_id,
        "username":$("#edit_username").val(),
        "email":$("#edit_email").val(),
        "phone":$("#edit_phone").val(),
        "city":$("#edit_city").val(),
        "about":$("#edit_about").val(),
        "avatar_link":$("#edit_avatar").val(),
        "role":info.role
    };
    if(info.role=='photographer'){
        data.lastname=$("#edit_lastname").val();
        data.firstname=$("#edit_firstname").val();
        data.fathername=$("#edit_fathername").val();
        data.experience=$("#edit_exp_select").val();
        data.organization=$("#edit_organization").val();
        data.price=$("#edit_price").val();
    }
    console.log(data);


    $.ajax({
        url: 'http://localhost:2606/editclient',
        type: 'post',
        dataType: 'json',
        data: JSON.stringify(data),
        contentType: 'application/json',
        success: function (data2) {

            if(data2.success=='yes') {
                $("#edituser").append("<div class=' panel panel-success' id='edit_success'>" +
                    "<div class='panel-heading'>Дані оновлено</div></div>");
                setTimeout(() => {
                    $("#edit_success").remove();
                    if(info.username!=data.username)
                        window.location.replace('/edit/'+data.username);
                }, 15000);
            }else{
                $("#edituser").append("<div class='panel panel-danger' id='edit_failed'>" +
                    "<div class='panel-heading'>Вибачте, виникла помилка при оновленні даних</div></div>");
                setTimeout(() => {  $("#edit_failed").remove(); }, 15000);
            }
        },
        error: function (data2) {
            $("#edituser").prepend("<div class='panel panel-danger' id='edit_failed'>" +
                "<div class='panel-heading'>Вибачте, виникла помилка при оновленні даних</div></div>");
            setTimeout(() => {  $("#edit_failed").remove(); }, 15000);
            console.log(data2.error);
        }
    });
}

//function which make ajax-request to server check if the old password is correct when user want to set new one
function changePassword(info){

    if(!validPassword("new_password")) return false;

    if($("#new_password2").val()!=$("#new_password").val()) {
        $("#new_password2").removeClass('is-valid').addClass('is-invalid');
        return false;
    }else{
        $("#new_password2").removeClass('is-invalid').addClass('is-valid');
    }
    if(!validEmpty("cur_password")) return false;
    let data={
        "pass":$("#cur_password").val()
    };

    alert($("#cur_password").val());
    $.ajax({
        url: 'http://localhost:2606/hashpass',
        type: 'post',
        dataType: 'json',
        data: JSON.stringify(data),
        contentType: 'application/json',
        success: function (data2) {

            if(data2.pass!=info.user_pass){
                $("#cur_password").removeClass('is-valid').addClass('is-invalid');
            }else{
                $("#cur_password").removeClass('is-invalid').addClass('is-valid');
                changePass(info.user_id, $("#new_password").val());
            }
        },
        error: function (data2) {
            $("#editpassword").prepend("<div class='panel panel-danger' id='edit_failed'>" +
                "<div class='panel-heading'>Вибачте, виникла помилка при оновленні даних </div></div>");
            setTimeout(() => {  $("#edit_failed").remove(); }, 15000);
            console.log(data2.error);
        }
    });

}


//function which make ajax-request to server to set new password in table "users" 
function changePass(user_id,new_password){
    let data={
        "user_id":user_id,
        "user_pass":new_password
    };
    $.ajax({
        url: 'http://localhost:2606/changepassword',
        type: 'post',
        dataType: 'json',
        data: JSON.stringify(data),
        contentType: 'application/json',
        success: function (data2) {
            if(data2.success=='yes'){

                $("#editpassword").prepend("<div class=' panel panel-success' id='edit_success'>" +
                    "<div class='panel-heading'>Дані оновлено</div></div>");
                setTimeout(() => {
                    $("#edit_success").remove();
                }, 15000);
                clearForm("change_password_form");
            }else{
                $("#editpassword").prepend("<div class='panel panel-danger' id='edit_failed'>" +
                    "<div class='panel-heading'>Вибачте, виникла помилка при оновленні даних</div></div>");
                setTimeout(() => {  $("#edit_failed").remove(); }, 15000);
                console.log(data2.error);
            }

        },
        error: function (data2) {
            $("#editpassword").prepend("<div class='panel panel-danger' id='edit_failed'>" +
                "<div class='panel-heading'>Вибачте, виникла помилка при оновленні даних</div></div>");
            setTimeout(() => {  $("#edit_failed").remove(); }, 15000);
            console.log(data2.error);
        }
    });


}


//function which make ajax-request to server to update table "shoots" and set new types of shoots photographer do 
function editPhTypes(info, types){

    let values=[];
    for(t of types)
        if($('#edit_type' + t.type_id).is(":checked"))
            values.push([t.type_id, info.ph_id]);

    let data={
        "values":values,
        "ph_id":info.ph_id
    };
    $.ajax({
        url: 'http://localhost:2606/edittypes',
        type: 'post',
        dataType: 'json',
        data: JSON.stringify(data),
        contentType: 'application/json',
        success: function (data2) {
            if(data2.success=='yes'){

                $("#editph_types").append("<div class=' panel panel-success' id='edit_success'>" +
                    "<div class='panel-heading'>Дані оновлено</div></div>");
                setTimeout(() => {
                    $("#edit_success").remove();
                }, 15000);

            }else{
                $("#editph_types").append("<div class='panel panel-danger' id='edit_failed'>" +
                    "<div class='panel-heading'>Вибачте, виникла помилка при оновленні даних</div></div>");
                setTimeout(() => {  $("#edit_failed").remove(); }, 15000);
                console.log(data2.error);
            }

        },
        error: function (data2) {
            $("#editph_types").append("<div class='panel panel-danger' id='edit_failed'>" +
                "<div class='panel-heading'>Вибачте, виникла помилка при оновленні даних</div></div>");
            setTimeout(() => {  $("#edit_failed").remove(); }, 15000);
            console.log(data2.error);
        }
    });

}



//function which make ajax-request to server to update table "accounts"
function editPhAccounts(info, social) {

    let values=[];
    for(s of social)
        if($("#edit_acc"+s.social_id).val()!="")
            values.push([s.social_id, $("#edit_acc"+s.social_id).val(),info.ph_id]);

    let data={
        "values":values,
        "ph_id":info.ph_id
    };
    $.ajax({
        url: 'http://localhost:2606/editaccounts',
        type: 'post',
        dataType: 'json',
        data: JSON.stringify(data),
        contentType: 'application/json',
        success: function (data2) {
            if(data2.success=='yes'){

                $("#editph_contacts").append("<div class=' panel panel-success' id='edit_success'>" +
                    "<div class='panel-heading'>Дані оновлено</div></div>");
                setTimeout(() => {
                    $("#edit_success").remove();
                }, 15000);

            }else{
                $("#editph_contacts").append("<div class='panel panel-danger' id='edit_failed'>" +
                    "<div class='panel-heading'>Вибачте, виникла помилка при оновленні даних</div></div>");
                setTimeout(() => {  $("#edit_failed").remove(); }, 15000);
                console.log(data2.error);
            }

        },
        error: function (data2) {
            $("#editph_contacts").append("<div class='panel panel-danger' id='edit_failed'>" +
                "<div class='panel-heading'>Вибачте, виникла помилка при оновленні даних</div></div>");
            setTimeout(() => {  $("#edit_failed").remove(); }, 15000);
            console.log(data2.error);
        }
    });

}