function login() {
    $("#login_failed").remove();

    let data = {
        "login": $("#login_login").val(),
        "password": $("#login_pass").val()
    };
    $.ajax({
        url: 'http://localhost:2606/login',
        type: 'post',
        dataType: 'json',
        data: JSON.stringify(data),
        contentType: 'application/json',
        success: function (data2) {
            if (data2.success == 'yes')
                window.location.replace(data2.href);

            else
                $("#entry_form").append("<div class='panel' id='login_failed'>" +
                    "<p class='red'>Неправильний логін або пароль</p></div>");
        },
        error: function (data2) {
            console.log(data2.error);
            $("#entry_form").append("<div class='panel' id='login_failed'>" +
                "<p class='red'>Неправильний логін або пароль</p></div>");

        }

    });
}

function regClient(users) {
    $("#invalid_reg_un").text("Це поле не може бути пустим");
    $("#invalid_reg_email").text("Некоректно введена електронна пошта");
    $("#reg_failed").remove();
    let a = validEmail("reg_email");
    let b = validEmpty("reg_username");
    let c = validNamesF("reg_city");

    if (!(a && b && c ))
        return false;

    if(!validExistedUsername($("#reg_username").val(),users)){
        $("#invalid_reg_un").text("Користувач з таким іменем уже існує!");
        $("#reg_username").removeClass("is-valid").addClass("is-invalid");
        return false;
    }
    if(!validExistedEmail($("#reg_email").val(),users)){
        $("#invalid_reg_email").text("Користувач з такою поштою уже існує!");
        $("#reg_email").removeClass("is-valid").addClass("is-invalid");
        return false;
    }

    if(!validPassword("reg_password"))
        return false;
    let pass = $("#reg_password").val();
    let pass2 = $("#reg_password2").val();
    validPassword("reg_password2");
    if (pass != pass2)
        return false;

    let data={
        "password":pass,
        "username":$("#reg_username").val(),
        "email":$("#reg_email").val(),
        "city":$("#reg_city").val()
    };

    $.ajax({
        url: 'http://localhost:2606/register',
        type: 'post',
        dataType: 'json',
        data: JSON.stringify(data),
        contentType: 'application/json',
        success: function (data2) {
            removeValid('registry_form');
            clearForm('registry_form');
            if (data2.success == "yes")
                window.location.replace(data2.href);
            else
                $("#registry_form").append("<div class='panel' id='login_failed'>" +
                    "<p class='red'>Вибачте,виникли проблеми при реєстрації</p></div>");
        },
        error: function (data2) {
            console.log(data2.error);
            $("#registry_form").append("<div class='panel' id='reg_failed'>" +
                "<p class='red'>Вибачте,виникли проблеми при реєстрації</p></div>");

        }

    });

}


function regPh(users,types) {

    $("#invalid_regph_un").text("Це поле не може бути пустим");
    $("#invalid_regph_email").text("Некоректно введена електронна пошта");
    $("#reg_failed").remove();
    let a = validEmail("ph_reg_email");
    let b = validEmpty("ph_reg_username");
    let c = validNames("ph_reg_lastname");
    let d = validNames("ph_reg_firstname");
    let e = validNamesF("ph_reg_fathername");
    let f = validNamesF("ph_reg_city");

    if (!(a && b && c && d && e && f))
        return false;

    const emailSel=$("#ph_reg_email");
    const userSel=$("#ph_reg_username");
    if(!validExistedUsername(userSel.val(),users)){
        $("#invalid_regph_un").text("Користувач з таким іменем уже існує!");
        userSel.removeClass("is-valid").addClass("is-invalid");
        return false;
    }
    if(!validExistedEmail(emailSel.val(),users)){
        $("#invalid_regph_email").text("Користувач з такою поштою уже існує!");
        emailSel.removeClass("is-valid").addClass("is-invalid");
        return false;
    }


    if(!validPassword("ph_reg_password"))
        return false;
    let pass = $("#ph_reg_password").val();
    let pass2 = $("#ph_reg_password2").val();
    validPassword("ph_reg_password2");
    if (pass != pass2)
        return false;

    let values=[];
    for(t of types)
        if($('#set_type' + t.type_id).is(":checked"))
            values.push([t.type_id]);

    let data={
        "password":pass,
        "username":userSel.val(),
        "email":emailSel.val(),
        "city":$("#ph_reg_city").val(),
        "lastname":$("#ph_reg_lastname").val(),
        "firstname":$("#ph_reg_firstname").val(),
        "fathername":$("#ph_reg_fathername").val(),
        "price":$("#ph_reg_price").val(),
        "experience":$("#ph_reg_experience").val(),
        "organization":$("#ph_reg_org").val(),
        "types":values
    };

    $.ajax({
        url: 'http://localhost:2606/registerph',
        type: 'post',
        dataType: 'json',
        data: JSON.stringify(data),
        contentType: 'application/json',
        success: function (data2) {
            removeValid('registry_ph_form');

            if (data2.success == "yes")
                window.location.replace(data2.href);


            else
                $("#registry_ph_form").append("<div class='panel' id='login_failed'>" +
                    "<p class='red'>Вибачте,виникли проблеми при реєстрації</p></div>");
        },
        error: function (data2) {
            console.log(data2.error);
            $("#registry_ph_form").append("<div class='panel' id='reg_failed'>" +
                "<p class='red'>Вибачте,виникли проблеми при реєстрації</p></div>");

        }

    });

}


function addToFavorites(ph_id, user_id) {

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

            $("#fav" + ph_id).empty().append(`<i class=' text-40 material-icons '>&#xe8e6;</i>`).attr("onclick", "deleteFromFavorites(" + ph_id + "," + user_id + ")");
        },
        error: function (data2) {
            console.log(data2.error);
        }

    });

}

function deleteFromFavorites(ph_id, user_id, profile = false) {

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

            if (profile) {
                $("#favpanel" + ph_id).remove();
            } else {
                $("#fav" + ph_id).empty().append(`<i class=' text-40 material-icons '>&#xe8e7;</i>`).attr("onclick", "addToFavorites(" + ph_id + "," + user_id + ")");
            }
        },
        error: function (data2) {
            console.log(data2.error);
        }

    });

}

function setCurrentFolder(folder_id) {
    localStorage.setItem("folder", folder_id);
}

function getCurrentFolder() {
    return localStorage.getItem("folder");
}

function addFolder() {

    if (!validEmpty("addfoldertitle"))
        return;

    let name = $("#addfoldertitle").val();

    let data = {
        'name': name
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


            $("#folders_container").append("<a class='link1 text-center folder-link' id='folder" + data2.folder_id + "-tab' " +
                "data-toggle='pill'  href='#folder" + data2.folder_id + "' role='tab' aria-controls='#folder" + data2.folder_id + "' " +
                "aria-selected='false' onclick='setCurrentFolder(" + data2.folder_id + ")'>" + name + "</a>");
            $("#photos_container").append("<div class='tab-pane fade' id='folder" + data2.folder_id + "' role='tabpanel' " +
                "aria-labelledby='folder" + data2.folder_id + "-tab'></div>" +
                "<br>");
            $("#edit_folder_select").append("<option value=" + data2.folder_id + " id='editfolderoption" + data2.folder_id + "'>" + name + "</option>");
            $("#delete_folder_select").append("<option value=" + data2.folder_id + " id='delfolderoption" + data2.folder_id + "'>" + name + "</option>");


            $("#add_folder_modal .close").click();
        },
        error: function (data2) {
            console.log(data2.error);
        }

    });


}

function deleteFolder() {
    let folder_id = $("#delete_folder_select").val();
    let data = {
        'folder_id': folder_id
    };

    $.ajax({
        url: 'http://localhost:2606/deletefolder',
        type: 'post',
        dataType: 'json',
        data: JSON.stringify(data),
        contentType: 'application/json',
        success: function (data2) {


            $("#folder" + folder_id + "-tab").remove();
            $("#folder" + folder_id).remove();
            $("#delfolderoption" + folder_id).remove();
            $("#editfolderoption" + folder_id).remove();
            $("#delete_folder_modal .close").click();
        },
        error: function (data2) {
            console.log(data2.error);
        }

    });


}

function editFolder() {
    let folder_id = $("#edit_folder_select").val();

    if (!validEmpty("edit_folder_caption"))
        return;

    let name = $("#edit_folder_caption").val();

    let data = {
        'folder_id': folder_id,
        'name': name
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

            $("#folder" + folder_id + "-tab").text(name);
            $("#editfolderoption" + folder_id).text(name);
            $("#delfolderoption" + folder_id).text(name);


            $("#edit_folder_modal .close").click();
        },
        error: function (data2) {
            console.log(data2.error);
        }

    });

}

function deletePhoto(photo_id) {


    let data = {
        'photo_id': photo_id
    };

    $.ajax({
        url: 'http://localhost:2606/deletephoto',
        type: 'post',
        dataType: 'json',
        data: JSON.stringify(data),
        contentType: 'application/json',
        success: function (data2) {

            $("#photo" + photo_id).empty().remove();

            $("#delete_photo_modal .close").click();

        },
        error: function (data2) {
            console.log(data2.error);
        }

    });
}

function fillEditPhotoModal(photo) {


    $("#edit_photo_button").attr("onclick", "editPhoto(" + photo.photo_id + ")");
    if (photo.descr != null)
        $("#edit_photo_descr").val(photo.descr);
    if (photo.title != null)
        $("#edit_photo_title").val(photo.title);
    if (photo.tags != null)
        $("#edit_photo_tags").val(photo.tags);


}

function fillDeletePhotoOnclick(photo_id) {
    $('#delete_photo_button').attr('onclick', 'deletePhoto(' + photo_id + ')')
}

function editPhoto(photo_id) {

    if (!validTags("edit_photo_tags"))
        return;


    let data = {
        "photo_id": photo_id,
        "title": $("#edit_photo_title").val(),
        "descr": $("#edit_photo_descr").val(),
        "tags": $("#edit_photo_tags").val().toLowerCase()
    };


    $.ajax({
        url: 'http://localhost:2606/editphoto',
        type: 'post',
        dataType: 'json',
        data: JSON.stringify(data),
        contentType: 'application/json',
        success: function (data2) {

            removeValid("edit_photo_form");


            $("#photo_title" + photo_id).text(data.title);
            $("#photo_descr" + photo_id).text(data.descr);
            $("#photo_tags" + photo_id).empty();
            for (tag of data2)
                $("#photo_tags" + photo_id).append("<a class='link1' href='search?value=" + tag + "'> #" + tag + "</a>");


            data.taglist = data2;
            $("#editphotobutton" + photo_id).attr('onclick', 'fillEditPhotoModal(' + data + ')');

            $("#edit_photo_modal .close").click();


        },
        error: function (data2) {
            console.log(data2.error);
        }

    });

}

function addPhotoLink() {
    let folder_id = getCurrentFolder();
    if (!validEmpty("add_photolink_link") || !validTags("add_photolink_tags"))
        return;


    let data = {
        "folder_id": folder_id,
        "title": $("#add_photolink_title").val(),
        "descr": $("#add_photolink_descr").val(),
        "tags": $("#add_photolink_tags").val().toLowerCase(),
        "link": $("#add_photolink_link").val()
    };


    $.ajax({
        url: 'http://localhost:2606/addphoto',
        type: 'post',
        dataType: 'json',
        data: JSON.stringify(data),
        contentType: 'application/json',
        success: function (data2) {
            removeValid("add_photolink_form");
            clearForm("add_photolink_form");
            data.photo_id = data2.photo_id;
            let taglist = splitIntoTags(data.tags);
            data.taglist = taglist;
            $("#folder" + folder_id).prepend("<div class='card' id='photo" + data2.photo_id + "'>" +
                "<div class='img-container'><div class='circle-avatar' style='background-image:url(" + data.link + ")'></div></div>" +
                "<div class='card-body'>" +
                "<button class='link-hover-red2 bg-transparent float-right text-20 border-none' data-toggle='modal' " +
                "data-target='#delete_photo_modal' onclick='fillDeletePhotoOnclick(" + photo_id + ")'>" +
                "<i class='fa text-20 fa-trash-o '></i></button>" +
                "<button class='link1 bg-transparent float-right text-20 border-none' data-toggle='modal'  data-target='#edit_photo_modal'" +
                " onclick='fillEditPhotoModal(" + JSON.stringify(data) + ")' id='editphotobutton" + data2.photo_id + "'>" +
                "<i class='fa text-20 fa-edit'></i></button>" +
                "<h5 class='card-title' id='photo_title" + data2.photo_id + "'>" + data.title + "</h5>" +
                "<p class='text-14 text-break' id='photo_descr" + data2.photo_id + "'>" + data.descr + "</p>" +
                " <p class='text-14 text-muted text-break' id='photo_tags" + data2.photo_id + "'></p>" +
                "</div></div><br>");

            for (tag of taglist) {
                $("#photo_tags" + data2.photo_id).append("<a class='link1' href='/search?value=" + tag + "'>#" + tag + "' '</a>");
            }

            $("#add_photo_modal .close").click();
        },
        error: function (data2) {
            console.log(data2.error);
        }

    });


}

function splitIntoTags(str) {
    let tags = [];
    let stringArray = str.split(/\s/);
    for (let s of stringArray)
        tags.push(s);
    return tags;
}

function fillCities() {
    $.ajax({
        url: 'http://localhost:2606/getcities',
        method: 'get',
        success: function (data) {
            for (let i of data)
                if(i.city!=null&&i.city!="")
                    $("#filter_city").append("<option value='"+ i.city + "'>" + i.city + "</option>");

        }
    });

}

function vote(mark, user_id, ph_id) {
    for (let j = 0; j < mark; j++) {
        $("#rating_star" + j).removeClass("fa-star-o").addClass("fa-star").hover(function () {
            for (let j = 0; j < mark; j++) {
                $("#rating_star" + j).removeClass("fa-star-o").addClass("fa-star");
            }
        }, function () {
            for (let j = 0; j < mark; j++) {
                $("#rating_star" + j).removeClass("fa-star-o").addClass("fa-star");
            }
        });
    }
    console.log(user_id + " vote " + ph_id);

    let data = {
        "user_id": user_id,
        "ph_id": ph_id,
        "mark": mark
    };

    $.ajax({
        url: 'http://localhost:2606/vote',
        type: 'post',
        dataType: 'json',
        data: JSON.stringify(data),
        contentType: 'application/json',
        success: function (data2) {
            let info = {
                "ave": data2.ave,
                "mark": mark,
                "ph_id": ph_id
            };
            setRatings(true, info, data2.cookies);
        },
        error: function (data2) {
            console.log(data2.error);
        }

    });

}

function unvote(user_id, ph_id) {
    console.log(user_id + " unvote " + ph_id);

    let data = {
        "user_id": user_id,
        "ph_id": ph_id
    };

    $.ajax({
        url: 'http://localhost:2606/unvote',
        type: 'post',
        dataType: 'json',
        data: JSON.stringify(data),
        contentType: 'application/json',
        success: function (data2) {
            let info = {
                "ave": data2.ave,
                "mark": 0,
                "ph_id": ph_id
            };
            setRatings(true, info, data2.cookies);
        },
        error: function (data2) {
            console.log(data2.error);
        }
    });
}

