function validateRegistry() {
    //  let a=validEmail("reg_email");
    let b = validEmpty("reg_username");
    let c = validNamesF("reg_city");
    let d = validPassword("reg_password");

    if (b && c && d) {
        pass = $("#reg_password").val();
        pass2 = $("#reg_password2").val();
        if (pass == pass2) {
            validPassword("reg_password2");
            return true;
        }
        validPassword("reg_password2");
        return false;
    }
    return false;
}

function validateSearch(){
    return validEmpty("search_input");
}

function phValidateRegistry() {

    let a = validEmail("ph_reg_email");
    let b = validEmpty("ph_reg_username");
    let c = validNames("ph_reg_surname");
    let d = validNames("ph_reg_name");
    let e = validNamesF("ph_reg_fathername");
    let f = validNamesF("ph_reg_city");
    let g = validEmpty("ph_reg_job");
    let h = validPassword("ph_reg_password");
    if (a && b && c && d && e && f && g && h) {
        if ($("#ph_reg_password").val() == $("#ph_reg_password2").val()) {
            validPassword("ph_reg_password2");
            return true;
        }
        validPassword("ph_reg_password2");
        return false;
    }


    return false;
}

function validEmail(str) {
    const selector = $("#" + str);
    let name = selector.val();
    if (name.length < 1 || name.length > 100) {
        selector.removeClass('is-valid');
        selector.addClass('is-invalid');
        return false;
    }
    let pattern = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@(([[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (name.match(pattern)) {
        selector.removeClass('is-invalid');
        selector.addClass('is-valid');
        return true;
    } else {
        selector.removeClass('is-valid');
        selector.addClass('is-invalid');

        return false;
    }
}

//кирилиця+латиниця+тире+апостроф
function validNames(str) {
    const selector = $("#" + str);
    let name = selector.val();

    if (name.length < 2 || name.length > 45) {
        selector.removeClass('is-valid');
        selector.addClass('is-invalid');
        return false;
    }
    let letters = /^[a-zA-Zа-яА-ЯіІїЇ\-']+$/;
    if (name.match(letters)) {
        selector.removeClass('is-invalid');
        selector.addClass('is-valid');
        return true;
    } else {
        selector.removeClass('is-valid');
        selector.addClass('is-invalid');
        return false;
    }
}

function validNamesF(str) {
    const selector = $("#" + str);
    let name = selector.val();
    if (name == "") {
        selector.removeClass('is-valid');
        selector.removeClass('is-invalid');
        return true
    } else return validNames(str);
}


//кирилиця + латиниця + цифри + тире + апостроф + _
function validPassword(str) {
    const selector = $("#" + str);
    let pass = selector.val();
    if (pass.length < 6) {
        selector.removeClass('is-valid');
        selector.addClass('is-invalid');
        return false;
    }
    let pattern = /^[a-zA-Z0-9а-яА-ЯіІїЇ\-'_]+$/;
    if (pass.match(pattern)) {
        selector.removeClass('is-invalid');
        selector.addClass('is-valid');
        return true;
    }
    selector.removeClass('is-valid');
    selector.addClass('is-invalid');
    return false;
}

function validPhone(str) {
    const selector = $("#" + str);
    let phone = selector.val();
    let pattern = /^\d+$/;
    let pattern2 = /^(\()?\d{3}(\))?(-|\s)?\d{3}(-|\s)\d{4}$/;
    if (phone.match(pattern) && phone.length === 10 || phone.match(pattern2)) {
        selector.removeClass('is-invalid');
        selector.addClass('is-valid');
        return true
    }
    selector.removeClass('is-valid');
    selector.addClass('is-invalid');
    return false;
}

function validEmpty(str) {
    const selector = $("#" + str);
    let edu = selector.val();
    if (edu === "") {
        selector.removeClass('is-valid');
        selector.addClass('is-invalid');
        return false;
    }
    selector.removeClass('is-invalid');
    selector.addClass('is-valid');
    return true;
}


function validTags(str) {
    const selector = $("#" + str);
    let name = selector.text();

    if (name==="") {
        selector.removeClass('is-invalid');
        selector.removeClass('is-valid');
        return true;
    }
    let letters = /^[a-zA-Z0-9а-яА-ЯіІїЇ\s]+$/;
    if (name.match(letters)) {
        selector.removeClass('is-invalid');
        selector.addClass('is-valid');
        return true;
    } else {
        selector.removeClass('is-valid');
        selector.addClass('is-invalid');
        return false;
    }
}




//ці два методи забирають валідацію і інфу відповідно
function removeValid(str) {
    $("form#" + str + " :input").each(function () {
        $(this).removeClass('is-valid');
    });
}

function clearForm(str) {
    $("form#" + str + " :input").each(function () {
        $(this).val('');
    });
}