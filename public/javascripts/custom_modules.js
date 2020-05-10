let invertedList = new Map();
module.exports = {
    getInvertedList: function () {
        return invertedList;
    },
    setInvertedList: function (photos) {
        //create array of all tags
        let temp = [];
        for (photo of photos)
            for (tag of photo.taglist)
                temp.push(tag);
        //sorted and with unique values
        let tags = insertionSort([...new Set(temp)]);
        invertedList = new Map();
        //put them as keys in map with value = [all ids of photos which have this tag]
        for (let tag of tags) {
            let values = [];
            for (photo of photos)
                for (t of photo.taglist)
                    if (t == tag)
                        values.push(photo.id);
            invertedList.set(tag, values);
        }
    },
    updateInvertedList: function (photo) {
        //if photo is updated, add new tags or photo id to existed tags
        for (tag of photo.taglist)
            if (invertedList.get(tag) != null)
                if (!(invertedList.get(tag)).includes(photo.id))
                    invertedList.set(tag, invertedList.get(tag).push(photo.id));
                else
                    invertedList.set(tag, photo.id);
        return invertedList;
    },
    deleteFromInvertedList: function (deleted) {
        //if photo is deleted its id is deleted from inverted list too
        for (photo of deleted)
            for (tag of invertedList)
                if (tag[1].includes(photo.id))
                    tag[1] = tag[1].splice(photo.id, 1);
        return invertedList;
    },
    search: function (request) {
        return search(request);
    },
    splitIntoTags: function (str) {
        return splitIntoTags(str);
    }
};


//search photo by tags
function search(request) {
    let temp = [];
    //find all photos which have these tags
    for (let word of request) {
        let photos = invertedList.get(word);
        if (photos != null && photos != undefined)
            for (let i of photos)
                temp.push(i);
    }


    temp = insertionSort(temp);
    let prev = [], values = [], frequency = [];
    for (let i of  temp) {
        if (i !== prev) {
            values.push([i]);
            frequency.push(1);
        } else
            frequency[frequency.length - 1]++;
        prev = i;
    }
    //sort them by frequency
    values = insertionSortTwoArrays(frequency, values);
    return values;
}

//simple insertion sort function
const insertionSort = (array) => {
    for (let i = 1; i < array.length; i++) {
        let j = i - 1;
        let temp = array[i];
        while (j >= 0 && (array[j] > temp)) {
            array[j + 1] = array[j];
            j--;
        }
        array[j + 1] = temp;
    }
    return array;
};

//insertion sort to sort values by their frequency
const insertionSortTwoArrays = (array, values) => {
    for (let i = 1; i < array.length; i++) {
        let j = i - 1;
        let temp = array[i];
        let temp2 = values[i];
        while (j >= 0 && (array[j] < temp)) {
            array[j + 1] = array[j];
            values[j + 1] = values[j];
            j--;
        }
        array[j + 1] = temp;
        values[j + 1] = temp2;
    }
    return values;
};

//split a string into tags array
function splitIntoTags(str) {
    if (str == null || str == "" || str == undefined)
        return [];
    let tagList = [];
    let tags = str.split(/\s,'".-?!/);
    for (let tag of tags)
        tagList.push(tag);
    return tagList;
}


