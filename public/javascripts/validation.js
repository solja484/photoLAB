function validateRegistry(){

    validEmail("req_email");
    // valid username cyrillic+latin+digits+'-'
    // valid city name cyrillic+latin+'-'
    // valid password more than 6 symbols, letters+digits
    // check password = repeated password

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

//додати кирилицю! + додати цифри
function validName(str) {
    const selector = $("#" + str);
    let name = selector.val();
    if (name.length < 1 || name.length > 45) {
        selector.removeClass('is-valid');
        selector.addClass('is-invalid');
        return false;
    }
    let letters = /^[A-Za-zА-Яа-яіІ]+$/;
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

//at least 6 characters eng letter number and symbol
function validPass(str) {
    const selector = $("#" + str);
    let pass = selector.val();
    let pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[ -/:-@\[-`{-~]).{6,64}$/;
    if (!pattern.test(pass)) {
        selector.removeClass('is-valid');
        selector.addClass('is-invalid');
        return false;
    }
    selector.removeClass('is-invalid');
    selector.addClass('is-valid');
    return true;
}

function validPhone(str) {
    const selector = $("#" + str);
    let phone = selector.val();
    let pattern = /^\d+$/;
    let pattern2 = /^(\()?\d{3}(\))?(-|\s)?\d{3}(-|\s)\d{4}$/;
    if ( phone.match(pattern) && phone.length === 10 || phone.match(pattern2)) {
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
    return true;
}