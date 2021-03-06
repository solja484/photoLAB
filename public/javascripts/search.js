//ajax request to server, return filtered information
function filter() {
    $("#filter_error").hide();
    let sel = $("#search_people");
    $("#filter_spinner").show().focus();

    let data = {
        "city": $("#filter_city").val(),
        "years": $("#filter_years").val(),
        "type": $("#filter_type").val(),
        "min_price": $("#slider-range").slider("values", 0),
        "max_price": $("#slider-range").slider("values", 1),
    };

    $.ajax({
        url: 'http://localhost:2606/filter',
        type: 'post',
        dataType: 'json',
        data: JSON.stringify(data),
        contentType: 'application/json',
        success: function (data2) {
            console.log(data2.success);
            if (data2.success == 'yes') {
                sel.empty();
                fillSearchPhotographers(data2.ph_info, data2.cookies, data2.photos, data2.favorites, data2.ratings);
                $("#filter_spinner").hide();
                $("#filter_error").hide();
            }

            else filterFailed();

        },
        error: filterFailed()

    });


}

//return to no filtered string
function nofilter(phinfo, cookies, photos, favorites) {
    $("#search_people").empty();
    $("#filter_spinner").hide();
    $("#filter_error").hide();
    fillSearchPhotographers(phinfo, cookies, photos, favorites);
}

//change type of search and swap colors of selected and unselected button
function changeSearchType(type) {
    if (type == 0) {
        $("#searchByPhoto").addClass("selected");
        localStorage.setItem("search", "photo");
        $("#searchByPerson").removeClass("selected");
        $("#search_input").attr("placeholder", "Моя ідеальна фотосесія");
    } else {
        $("#searchByPerson").addClass("selected");
        localStorage.setItem("search", "person");
        $("#searchByPhoto").removeClass("selected");
        $("#search_input").attr("placeholder", "Мій ідеальний фотограф");
    }
}

//function is called when click on search button
function search() {
    const sel = $("#search_input");
    if (!validEmpty("search_input")) return false;
    let request = sel.val();
    let words = request.split(/\s/);
    console.log(localStorage.getItem("search"));
    if (localStorage.getItem("search") == 'person')
        searchPh(words[0]);
    else $("#search_form").submit();

}

//ajax request to database return searched photographers
function searchPh(name) {
    let sel = $("#search_people");
    $("#filter_spinner").show().focus();
    $("#cancel_search").hide();
    $("#filter_error").hide();
    let data = {
        "name": name
    };
    $.ajax({
        url: 'http://localhost:2606/searchph',
        type: 'post',
        dataType: 'json',
        data: JSON.stringify(data),
        contentType: 'application/json',
        success: function (data2) {
            console.log(data2.success);
            if (data2.success == 'yes') {
                sel.empty();
                fillSearchPhotographers(data2.ph_info, data2.cookies, data2.photos, data2.favorites, data2.ratings);
                $("#filter_spinner").hide();
                $("#filter_error").hide();
                $("#cancel_search").show();
                clearForm("search_form");
                removeValid("search_form");
            }
            else searchFailed();
        },
        error: searchFailed()
    });
}


//display message when search response is empty
function searchFailed() {
    $("#filter_spinner").hide();
    $("#filter_error").show();
    $("#cancel_search").show();
    $("#search_people").empty();
    clearForm("search_form");
    removeValid("search_form");
}

//display message when filter response is empty
function filterFailed() {
    $("#filter_spinner").hide();
    $("#filter_error").show();
    $("#cancel_search").show();
    $("#search_people").empty();
}



