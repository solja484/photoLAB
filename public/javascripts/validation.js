function validateRegistry() {


    if (//validEmail("reg_email") &&
        validEmpty("reg_username") && validNamesF("reg_city") && validPassword("reg_password")) {
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

function phValidateRegistry() {
    if (validEmail("ph_reg_email") &&
        validEmpty("ph_reg_username") &&
        validNames("ph_reg_surname") &&
        validNames("ph_reg_name") &&
        validNamesF("ph_reg_fathername") &&
        validNamesF("ph_reg_city") &&
        validEmpty("ph_reg_job") && validPassword("ph_reg_password")) {
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