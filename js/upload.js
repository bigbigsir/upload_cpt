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



function upload(config) {

    function insertAfter(newElement, targetElement) {
        var parent = targetElement.parentNode;
        if (parent.lastChild === targetElement) {
            parent.appendChild(newElement);
        } else {
            parent.insertBefore(newElement, targetElement.nextSibling);
        }
    }

    function createUploadIframe(id) {
        var frameId = "uploadFrame" + id;
        var frame = document.createElement("iframe");
        frame.id = frameId;
        frame.name = frameId;
        frame.className = "upload-frame";
        document.body.appendChild(frame);
        return frame;
    }

    function createUploadForm(id, fileInputId) {
        var formId = "uploadFrame" + id;
        var inputId = "uploadFile" + id;
        var form = document.createElement("form");
        var oldInput = document.getElementById(fileInputId);
        var newInput = oldInput.cloneNode();
        oldInput.removeAttribute("name");
        oldInput.style.display = "none";
        newInput.id = inputId;
        form.id = formId;
        form.name = formId;
        form.className = "upload-form";
        form.appendChild(newInput);
        insertAfter(form, oldInput);
        return form;
    }


    function init(config) {
        var random = Math.random();
        var iframe = createUploadIframe(random);
        var form = createUploadForm(random, config.fileInputId);
    }

    config = $.extend(defaultConfig, config);
    init(config);
}

var defaultConfig = {
    btnText: "上传",
    preview: false,
    multiple: false,
    autoUpload: true
};

