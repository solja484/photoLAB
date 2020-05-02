function tryNewPhoto(){
    let new_link=$("#edit_cl_avatar").val();
    if(new_link=="")
        new_link="https://i.pinimg.com/564x/d9/7b/bb/d97bbb08017ac2309307f0822e63d082.jpg";
    $("#edit_cl_avatar_holder").empty().append(" <div class='circle-avatar pd-10' " +
        "style='background-image:url("+new_link+")'></div>");

}

function setOldPhoto(old_link){
    console.log("im in function");

    $("#edit_cl_avatar_holder").empty().append(" <div class='circle-avatar pd-10' " +
        "style='background-image:url("+old_link+")'></div>");
    $("#edit_cl_avatar").val(old_link);
}

function deleteAvatarPhoto(){
    let no_link="https://i.pinimg.com/564x/d9/7b/bb/d97bbb08017ac2309307f0822e63d082.jpg";
    $("#edit_cl_avatar_holder").empty().append(" <div class='circle-avatar pd-10' " +
        "style='background-image:url("+no_link+")'></div>");
    $("#edit_cl_avatar").val("");
}

function editClientInfo(info, users) {
    $("#invalid_cl_edit_un").text("Це поле не може бути пустим");
    $("#invalid_cl_edit_email").text("Некоректно введена електронна пошта");
    let a=validEmpty("edit_cl_username");
    let b=validEmail("edit_cl_email");
    let c=validPhone("edit_cl_phone");
    let d=validNamesF("edit_cl_city");
    if(!(a&&b&&c&&d)) return false;
    if(!validExistedUsername($("#edit_cl_username").val(),users)){
        $("#invalid_cl_edit_un").text("Користувач з таким іменем уже існує!");
        $("#edit_cl_username").removeClass("is-valid").addClass("is-invalid");
    }
    if(!validExistedEmail($("#edit_cl_email").val(),users)){
        $("#invalid_cl_edit_email").text("Користувач з таким іменем уже існує!");
        $("#edit_cl_email").removeClass("is-valid").addClass("is-invalid");
    }

    let data={
        "user_id":info.user_id,
        "username":$("#edit_cl_username").val(),
        "email":$("#edit_cl_email").val(),
        "phone":$("#edit_cl_phone").val(),
        "city":$("#edit_cl_city").val(),
        "about":$("#edit_cl_about").val(),
        "avatar_link":$("#edit_cl_avatar").val(),
    };
    $.ajax({
        url: 'http://localhost:2606/editclient',
        type: 'post',
        dataType: 'json',
        data: JSON.stringify(data),
        contentType: 'application/json',
        success: function (data2) {

            if(data2.success=='yes') {
                $("#editclient").prepend("<div class=' panel panel-success' id='edit_success'>" +
                    "<div class='panel-heading'>Дані оновлено</div></div>");
                setTimeout(() => {
                    $("#edit_success").remove();
                }, 15000);
            }else{
                $("#editclient").prepend("<div class='panel panel-danger' id='edit_failed'>" +
                    "<div class='panel-heading'>Вибачте, виникла помилка при оновленні даних</div></div>");
                setTimeout(() => {  $("#edit_failed").remove(); }, 15000);
            }
        },
        error: function (data2) {
            $("#editclient").prepend("<div class='panel panel-danger' id='edit_failed'>" +
                "<div class='panel-heading'>Вибачте, виникла помилка при оновленні даних</div></div>");
            setTimeout(() => {  $("#edit_failed").remove(); }, 15000);
            console.log(data2.error);
        }
    });
}

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