function filter() {
    $("#filter_error").hide();
    let sel = $("#search_people");
    // sel.empty();
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

            else {
                $("#filter_spinner").hide();
                $("#filter_error").show();
                sel.empty();
            }

        },
        error: function (data2) {
            $("#filter_spinner").hide();
           $("#filter_error").show();
            sel.empty();

        }

    });


}

function nofilter(phinfo, cookies, photos, favorites){
    $("#filter_spinner").hide();
    $("#filter_error").hide();
    fillSearchPhotographers(phinfo, cookies, photos, favorites);
}