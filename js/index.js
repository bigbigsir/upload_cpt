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

var _id = Math.random();

// 在目标元素后插入元素
function insertAfter(newElement, targetElement) {
    var parent = targetElement.parentNode;
    if (parent.lastChild === targetElement) {
        parent.appendChild(newElement);
    } else {
        parent.insertBefore(newElement, targetElement.nextSibling);
    }
}

// 创建iFrame元素
function createUploadIFrame(config) {
    var frameId = "uploadIFrame" + _id;
    var iFrame = document.createElement("iFrame");
    iFrame.id = iFrame.name = frameId;
    iFrame.className = "upload-frame";
    document.body.appendChild(iFrame);
    bindEvent(iFrame, "load", function () {
        var responseText;
        var document = iFrame.contentWindow || iFrame.contentDocument;
        responseText = document.document.body ? document.document.body.innerText : null;
        if (responseText && config.success) {
            config.success(JSON.parse(responseText));
        }
    });
    return iFrame;
}

// 创建form元素
function createUploadForm(config) {
    var formId = "uploadForm" + _id;
    var form = document.createElement("form");
    var uploadFile = createUploadFile(config);
    form.id = form.name = formId;
    form.action = config.url;
    form.method = "POST";
    form.target = "uploadIFrame" + _id;
    form.enctype = "multipart/form-data";
    form.className = "upload-form";
    form.appendChild(uploadFile);
    document.body.appendChild(form);
    return form;
}

// 创建fileInput元素
function createUploadFile(config) {
    var inputId = "uploadFile" + _id;
    var oldInput = document.getElementById(config.fileInputId);
    var newInput = oldInput.cloneNode();
    newInput.id = inputId;
    oldInput.style.display = "none";
    oldInput.removeAttribute("name");
    bindEvent(newInput, "change", function () {
        if (!newInput.value || !limitImgMaxSize(newInput)) return false;
        if (config.autoUpload) {
            var uploadForm = document.getElementById("uploadForm" + _id);
            if (!config.uploadBefore) {
                uploadForm.submit();
            } else if (config.uploadBefore(newInput)) {
                uploadForm.submit();
            }
        }
    });
    return newInput;
}

// 创建上传按钮
function createButton(config) {
    var oldInput = document.getElementById(config.fileInputId);
    if (config.onlyUploadImg) {
        var uploadCard = document.createElement("div");
        var div = document.createElement("div");
        var i = document.createElement("i");
        var p = document.createElement("p");
        uploadCard.className = "el-upload el-upload--picture-card";
        i.className = "el-icon-plus";
        p.innerText = "上传图片";
        div.appendChild(i);
        div.appendChild(p);
        uploadCard.appendChild(div);
        insertAfter(uploadCard, oldInput);
        bindEvent(uploadCard, "click", function () {
            var uploadFile = document.getElementById("uploadFile" + _id);
            uploadFile.click();
        });
    } else {
        var button = document.createElement("button");
        var span = document.createElement("span");
        span.innerText = config.buttonText;
        button.id = "uploadButton" + _id;
        button.setAttribute("type", "button");
        button.className = "el-button el-button-small";
        button.appendChild(span);
        insertAfter(button, oldInput);
        bindEvent(button, "click", function () {
            var uploadFile = document.getElementById("uploadFile" + _id);
            uploadFile.click();
        });
        return button;
    }
}

// 验证图片大小是否超过5M
function limitImgMaxSize(file) {
    var i, len;
    var maxSize = 5 * 1024 * 1024;
    if (file.files) {
        for (i = 0, len = file.files.length; i < len; i++) {
            if (~file.files[i].type.indexOf("image/") && file.files[i].size > maxSize) {
                return alert("图片大小需小于5M！");
            }
        }
    }
    else {
        var suffixIndex, suffix;
        var paths = file.value.split(",");
        var img = document.createElement("image");
        for (i = 0, len = paths.length; i < len; i++) {
            img.src = paths[i];
            suffixIndex = paths[i].lastIndexOf(".");
            suffix = paths[i].substring(suffixIndex + 1).toUpperCase();
            if (/^(BMP|JPEG|GIF|JPG|PNG)$/.test(suffix) && img.fileSize > maxSize) {
                return alert("图片大小需小于5M！");
            }
        }
    }
    return true;
}

// 添加其他表单参数
function addOtherRequestsToForm(data) {
    var cloneElement;
    var originalElement = document.createElement("input");
    var uploadForm = document.getElementById("uploadForm" + _id);
    originalElement.type = "hidden";
    for (var key in data) {
        cloneElement = originalElement.cloneNode();
        cloneElement.name = key;
        cloneElement.value = data[key];
        uploadForm.appendChild(cloneElement);
    }
    return uploadForm;
}

// 事件绑定方法
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

// 提交表单
function submit() {
    var uploadForm = document.getElementById("uploadForm" + _id);
    var uploadFile = document.getElementById("uploadFile" + _id);
    if (!uploadFile.value || !limitImgMaxSize(uploadFile)) return false;
    uploadForm.submit();
}

// 启用上传
function disabled() {
    var button = document.getElementById("uploadButton" + _id);
    button.setAttribute("disabled", "disabled");
}

// 禁用上传
function enabled() {
    var button = document.getElementById("uploadButton" + _id);
    button.removeAttribute("disabled");
}

function init(config) {
    config = config || {};
    config.autoUpload = config.autoUpload || true;
    config.buttonText = config.buttonText || "上传附件";
    if (!config.url || !config.fileInputId) throw "url or fileInputId is not defined";
    var iframe = createUploadIFrame(config);
    var form = createUploadForm(config);
    var button = createButton(config);
    if (config.data) addOtherRequestsToForm(config.data);
    return {
        submit: submit,
        disabled: disabled,
        enabled: enabled
    }
}


$(function () {
    var upload = init({
        fileInputId: "file",
        url: "http://localhost:30010/upload",
        onlyUploadImg: true,
        // buttonText: "上传文件",
        // preview: false,
        // autoUpload: true,
        data: {
            code: 123,
            name: "主升浪"
        },
        uploadBefore: function (file) {
            console.log(file);
            return true;
        },
        success: function (data) {
            console.log(data);
        }
    });
    $("#manual").on("click", function () {
        upload.submit();
    });
    $("#disabled").on("click", function () {
        upload.disabled();
    });
    $("#enabled").on("click", function () {
        upload.enabled();
    })
});

function getBrowserInfo() {
    var agent = navigator.userAgent.toLowerCase();
    var regStr_ie = /msie [\d.]+;/gi;
    var regStr_ff = /firefox\/[\d.]+/gi;
    var regStr_chrome = /chrome\/[\d.]+/gi;
    var regStr_saf = /safari\/[\d.]+/gi;
    // IE
    if (agent.indexOf("msie") > 0) {
        return agent.match(regStr_ie);
    }

    // FireFox
    if (agent.indexOf("firefox") > 0) {
        return agent.match(regStr_ff);
    }

    // Chrome
    if (agent.indexOf("chrome") > 0) {
        return agent.match(regStr_chrome);
    }

    // Safari
    if (agent.indexOf("safari") > 0 && agent.indexOf("chrome") < 0) {
        return agent.match(regStr_saf);
    }
}

// var browser = getBrowserInfo() ;
// console.log(browser);
// var verinfo = (browser+"").replace(/[^0-9.]/ig,"");
// console.log(verinfo);