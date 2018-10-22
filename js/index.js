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

// 在目标元素后插入元素
function insertAfter(newElement, targetElement) {
    var parent = targetElement.parentNode;
    if (parent.lastChild === targetElement) {
        parent.appendChild(newElement);
    } else {
        parent.insertBefore(newElement, targetElement.nextSibling);
    }
}

// 创建iframe元素
function createUploadIframe(id, config) {
    var frameId = "uploadIframe" + id;
    var iframe = document.createElement("iframe");
    iframe.id = iframe.name = frameId;
    iframe.className = "upload-frame";
    document.body.appendChild(iframe);
    bindEvent(iframe, "load", function () {
        var iframe = this;
        var responseText;
        var document = iframe.contentWindow || iframe.contentDocument;
        responseText = document.document.body ? document.document.body.innerText : null;
        if (responseText && config.success) {
            config.success(JSON.parse(responseText));
        }
    });
    return iframe;
}

// 创建form元素
function createUploadForm(id, fileInput, config) {
    var formId = "uploadForm" + id;
    var form = document.createElement("form");
    form.id = form.name = formId;
    form.target = "uploadIframe" + id;
    form.method = "POST";
    form.action = config.url;
    form.enctype = "multipart/form-data";
    form.className = "upload-form";
    form.appendChild(fileInput);
    document.body.appendChild(form);
    return form;
}

function createFileInput(id, config) {
    var inputId = "uploadFile" + id;
    var oldInput = document.getElementById(config.fileInputId);
    var newInput = oldInput.cloneNode();
    var span = document.createElement("span");
    var button = document.createElement("button");
    span.innerText = config.btnText;
    button.setAttribute("type", "button");
    button.className = "el-button";
    button.appendChild(span);
    oldInput.removeAttribute("name");
    oldInput.style.display = "none";
    newInput.id = inputId;
    bindEvent(button, "click", function () {
        newInput.click();
    });
    bindEvent(newInput, "change", function () {
        var form;
        if (config.autoUpload) {
            form = document.getElementById("uploadForm" + id);
            form.submit();
        }
    });
    insertAfter(button, oldInput);
    return newInput;
}

// 添加其他表单参数
function addOtherRequestsToForm(form, data) {
    var cloneElement;
    var originalElement = document.createElement("input");
    originalElement.type = "hidden";
    for (var key in data) {
        cloneElement = originalElement.cloneNode();
        cloneElement.name = key;
        cloneElement.value = data[key];
        form.appendChild(cloneElement);
    }
    return form;
}

// 绑定时间方法
function bindEvent(target, event, cb) {
    if (target.addEventListener) {
        target.addEventListener(event, cb, false)
    }
    else if (target.attachEvent) {
        target.attachEvent('on' + event, cb);
    }
    else {
        target["on" + event] = cb;
    }
}

function init(config) {
    var random = Math.random();
    var iframe = createUploadIframe(random, config);
    var fileInput = createFileInput(random, config);
    var form = createUploadForm(random, fileInput, config);
    if (config.data) addOtherRequestsToForm(form, config.data);
}


$(function () {
    init({
        url: "http://localhost:3000/upload",
        btnText: "上传",
        preview: false,
        multiple: false,
        autoUpload: true,
        fileInputId: "test",
        data: {
            code: 123,
            name: "主升浪"
        },
        success: function (data) {
            console.log(data);
        }
    })
});