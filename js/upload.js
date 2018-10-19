/**
 * Created by: MoJie
 * Date: 2018/10/19
 */
function ajax(config) {
    var url = config.url;
    var data = config.data;
    var success = config.success;
    var xhr;
    if (window.XMLHttpRequest) {
        xhr = new XMLHttpRequest();
    } else {
        xhr = new ActiveXObject('Microsoft.XMLHTTP');
    }
    xhr.open("POST", url);
    xhr.send(data);
    xhr.onreadystatechange = function () {
        if (ajax.readyState === 4 && ajax.status === 200) {
            success(ajax.responseText);
        }
    }
}

var defaultConfig = {
    btnText: "上传",
    preview: false,
    multiple: false,
    autoUpload: true
};

function init() {

}

function upload(config) {

    config = $.extend(defaultConfig, config);
    init(config);
}
