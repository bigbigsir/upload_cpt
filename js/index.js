/**
 * Created by: MoJie
 * Date: 2018/10/11
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


function init() {
    console.log(this.options);
}

function Upload(config) {
    this.options = $.extend(defaultConfig, config);
    this.init = init;
}



$(function () {
    $("#btn").on("click", function () {
        var formData = new FormData();

        for (var i = $("#file")[0].files.length; i--;) {
            formData.append("file", $("#file")[0].files[i]);
        }

        console.log(formData);
        $.ajax({
            type: "POST",
            url: "http://localhost:3000/upload",
            data: formData,
            processData: false,  // 告诉jQuery不要去处理发送的数据
            contentType: false,   // 告诉jQuery不要去设置Content-Type请求头
            success: function (data) {
                console.log(data)
            }
        });
        // ajax({
        //     url: "http://localhost:3000/upload",
        //     data: formData,
        //     success: function (data) {
        //         console.log(data)
        //     }
        // });
        // $('#fileForm').submit();
    });
    $("#file").on("change", function () {
        console.log(this.files)
    });

});