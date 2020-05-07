


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

//кирилиця+латиниця+тире+апостроф не менше двох символів
function validNames(str) {
    const selector = $("#" + str);
    let name = selector.val();

    if (name.length < 2 || name.length > 45) {
        selector.removeClass('is-valid');
        selector.addClass('is-invalid');
        return false;
    }
    let letters = /^[a-zA-Zа-яА-ЯіІїЇыЫэЭёЁъЪ\-']+$/;
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


//кирилиця + латиниця + цифри + тире  + нижнє підкреслення, не менше 6 символів
function validPassword(str) {
    const selector = $("#" + str);
    let pass = selector.val();
    if (pass.length < 6) {
        selector.removeClass('is-valid');
        selector.addClass('is-invalid');
        return false;
    }
    let pattern = /^[a-zA-Z0-9а-яА-ЯіІїЇ\-_]+$/;
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
    if (phone == "") {
        selector.removeClass('is-valid');
        selector.removeClass('is-invalid');
        return true
    }
    let pattern = /^\d+$/;
    let pattern2 = /^(\()?\d{3}(\))?(-|\s)?\d{3}(-|\s)\d{4}$/;
    if (phone.match(pattern) && phone.length == 10 || phone.match(pattern2)) {
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
    let val = selector.val();
    let pattern = /^\s+$/;
    if (val == ""||val.match(pattern)) {
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

function validExistedUsername(str,users) {
    for(let u of users)
        if(str==u.username)
            return false;

    return true;
}

function validExistedEmail(str,users) {
    for(let u of users)
        if(str==u.email)
            return false;
    return true;
}

//ці два методи забирають валідацію і стирають заповнені поля форми відповідно
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