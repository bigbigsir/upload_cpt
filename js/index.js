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

/**
 * @description  事件绑定，兼容各浏览器
 * @param target 事件触发对象
 * @param type   事件
 * @param func   事件处理函数
 */
function addEvent(target, type, func) {
    if (target.addEventListener)     // 非IE和IE9
        target.addEventListener(type, func, false);
    else if (target.attachEvent)     // IE6到IE8
        target.attachEvent("on" + type, func);
    else target["on" + type] = func; // IE5
}

/**
 * @description  事件移除，兼容各浏览器
 * @param target 事件触发对象
 * @param type   事件
 * @param func   事件处理函数
 */
function removeEvent(target, type, func) {
    if (target.removeEventListener)     // 非IE和IE9
        target.removeEventListener(type, func, false);
    else if (target.detachEvent)        // IE6到IE8
        target.detachEvent("on" + type, func);
    else target["on" + type] = null;    // IE5
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

// 创建iFrame元素
function createUploadIFrame(config) {
    var frameId = "uploadIFrame" + _id;
    var iFrame = document.createElement("iFrame");
    iFrame.id = iFrame.name = frameId;
    iFrame.className = "upload-frame";
    document.body.appendChild(iFrame);
    addEvent(iFrame, "load", function () {
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
    var submitButtonId = "submitButton" + _id;
    var form = document.createElement("form");
    var submitButton = document.createElement("input");
    var uploadFile = createUploadFile(config);
    submitButton.type = "submit";
    submitButton.id = submitButtonId;
    form.id = form.name = formId;
    form.action = config.url;
    form.method = "POST";
    form.target = "uploadIFrame" + _id;
    form.enctype = "multipart/form-data";
    form.className = "upload-form";
    form.appendChild(uploadFile);
    form.appendChild(submitButton);
    document.body.appendChild(form);
    addEvent(form, "submit", function (e) {
        if (uploadFile.value) {
            if (!limitImgMaxSize(uploadFile)) {
                alert("上传图片的大小不能超过5M！");
                return !!(e.preventDefault && e.preventDefault());
            }
            if (config.onlyUploadImg && !isImg(uploadFile)) {
                alert("请上传图片格式文件！");
                return !!(e.preventDefault && e.preventDefault());
            }
            if (config.beforeUpload && !config.beforeUpload(uploadFile)) {
                return !!(e.preventDefault && e.preventDefault());
            }
        } else {
            return !!(e.preventDefault && e.preventDefault());
        }
    });
    return form;
}

// 创建fileInput元素
function createUploadFile(config) {
    var inputId = "uploadFile" + _id;
    var oldFileInput = document.getElementById(config.fileInputId);
    var newFileInput = oldFileInput.cloneNode();
    newFileInput.id = inputId;
    newFileInput.removeAttribute("multiple");
    if (config.onlyUploadImg) {// 文件弹出窗默认只显示图片，IE10以下无效。
        newFileInput.accept = "image/gif,image/jpeg,image/jpg,image/png";
    }
    if (config.multiple && !config.onlyUploadImg) {
        newFileInput.setAttribute("multiple", "multiple");
    }
    oldFileInput.style.display = "none";
    oldFileInput.removeAttribute("name");
    addEvent(newFileInput, "change", function () {
        config.onChange && config.onChange(newFileInput);
        if (config.autoUpload) {
            document.getElementById("submitButton" + _id).click();
        }
    });
    return newFileInput;
}

// 创建上传按钮
function createButton(config) {
    var oldFileInput = document.getElementById(config.fileInputId);
    var button = document.createElement("button");
    if (config.onlyUploadImg) {
        button = document.createElement("div");
        var div = document.createElement("div");
        var i = document.createElement("i");
        var p = document.createElement("p");
        button.className = "el-upload el-upload--picture-card";
        i.className = "el-icon-plus";
        p.innerText = "上传图片";
        div.appendChild(i);
        div.appendChild(p);
        button.appendChild(div);
    } else {
        button = document.createElement("button");
        var span = document.createElement("span");
        span.innerText = config.buttonText;
        button.setAttribute("type", "button");
        button.className = "el-button el-button-small";
        button.appendChild(span);
    }
    button.id = "uploadButton" + _id;
    insertAfter(button, oldFileInput);
    addEvent(button, "click", function () {
        var uploadFile = document.getElementById("uploadFile" + _id);
        uploadFile.click();
    });
    return button;
}

// 验证图片大小是否超过5M
function limitImgMaxSize(file, maxSize) {
    var i, len;
    maxSize = maxSize || 5;
    maxSize = maxSize * 1024 * 1024;
    if (file.files) {
        for (i = 0, len = file.files.length; i < len; i++) {
            if (~file.files[i].type.indexOf("image/") && file.files[i].size > maxSize) {
                return false;
            }
        }
    }
    else {
        var suffixIndex, suffix;
        var paths = file.value.split(",");
        var img = document.createElement("image");
        for (i = 0, len = paths.length; i < len; i++) {
            suffixIndex = paths[i].lastIndexOf(".");
            suffix = paths[i].substring(suffixIndex + 1).toUpperCase();
            if (/^(JPEG|GIF|JPG|PNG)$/.test(suffix)) {
                img.src = paths[i];
                if (img.fileSize > maxSize) return false;
            }
        }
    }
    return true;
}

// 验证文件是否是图片
function isImg(file) {
    var i, len;
    var suffixIndex, suffix;
    var paths = file.value.split(",");
    for (i = 0, len = paths.length; i < len; i++) {
        suffixIndex = paths[i].lastIndexOf(".") + 1;
        suffix = paths[i].substring(suffixIndex).toUpperCase();
        if (!/^(JPEG|GIF|JPG|PNG)$/.test(suffix)) {
            return false;
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
    document.getElementById("submitButton" + _id).click();
}

// 禁用上传
function disabled() {
    console.log("disabled");
    var button = document.getElementById("uploadButton" + _id);
    console.log(button);
    // button.setAttribute("disabled", "disabled");
    removeEvent(button, "click", function () {
        console.log(123);
        console.log(this);
    });
}

// 启用上传
function enabled() {
    console.log("enabled");
    var button = document.getElementById("uploadButton" + _id);
    // button.removeAttribute("disabled");
    addEvent(button, "click", function () {
        console.log(123);
        console.log(this);
    });
}

function init(config) {
    config = config || {};
    config.autoUpload = config.autoUpload !== false;
    config.buttonText = config.buttonText || "上传附件";
    if (!config.url || !config.fileInputId) throw "url or fileInputId is not defined";
    var iframe = createUploadIFrame(config);
    var form = createUploadForm(config);
    var button = createButton(config);
    if (config.data) addOtherRequestsToForm(config.data);
    var exports = {
        disabled: disabled,
        enabled: enabled
    };
    if (!config.autoUpload) {
        exports.submit = submit;
    }
    return exports;
}


$(function () {
    var upload = init({
        fileInputId: "file",
        url: "http://localhost:3000/upload",
        onlyUploadImg: true,
        // buttonText: "上传文件",
        // preview: false,
        // autoUpload: true,
        data: {
            code: 123,
            name: "主升浪"
        },
        onChange: function (file) {
            // console.log(file);
        },
        beforeUpload: function (file) {
            // console.log(file);
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