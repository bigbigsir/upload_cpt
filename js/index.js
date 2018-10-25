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

var _id = Math.random(), config;

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
    iFrame.className = "ty-upload-iframe";
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
    var otherDataId = "otherData" + _id;
    var form = document.createElement("form");
    var otherData = document.createElement("div");
    var submitButton = document.createElement("input");
    var fileInput = createFileInput(config);
    otherData.id = otherDataId;
    submitButton.type = "submit";
    submitButton.id = submitButtonId;
    form.id = form.name = formId;
    form.action = config.url;
    form.method = "POST";
    form.target = "uploadIFrame" + _id;
    form.enctype = "multipart/form-data";
    form.className = "ty-upload-form";
    form.appendChild(fileInput);
    form.appendChild(otherData);
    form.appendChild(submitButton);
    document.body.appendChild(form);
    addEvent(form, "submit", function (e) {
        if (fileInput.value) {
            if (!limitImgMaxSize(fileInput)) {
                alert("上传图片的大小不能超过5M！");
                return !!(e.preventDefault && e.preventDefault());
            }
            if (config.uploadType === "avatar" && !isImg(fileInput)) {
                alert("请上传图片格式文件！");
                return !!(e.preventDefault && e.preventDefault());
            }
            if (config.beforeUpload && !config.beforeUpload(fileInput)) {
                return !!(e.preventDefault && e.preventDefault());
            }
        } else {
            return !!(e.preventDefault && e.preventDefault());
        }
    });
    return form;
}

// 创建fileInput元素
function createFileInput(config) {
    var inputId = "fileInput" + _id;
    var oldFileInput = document.getElementById(config.fileInputId);
    var newFileInput = oldFileInput.cloneNode();
    newFileInput.id = inputId;
    newFileInput.removeAttribute("multiple");
    if (config.uploadType === "avatar") {// 文件弹出窗默认只显示图片，IE10以下无效。
        newFileInput.accept = "image/gif,image/jpeg,image/jpg,image/png";
    }
    if (config.multiple && config.uploadType !== "avatar") {
        newFileInput.setAttribute("multiple", "multiple");
    }
    oldFileInput.style.display = "none";
    oldFileInput.removeAttribute("name");
    addEvent(newFileInput, "change", function () {
        config.onChange && config.onChange(newFileInput);
        if (!newFileInput.value) return false;
        if (config.autoUpload) {
            document.getElementById("submitButton" + _id).click();
        }
        if (config.uploadType === "avatar" && isImg(newFileInput)) {
            var uploadButton = document.getElementById("uploadButton" + _id);
            if (newFileInput.files) {
                var reader = new FileReader();
                reader.onload = function () {
                    uploadButton.innerHTML = '<img src="' + this.result + '">';
                };
                reader.readAsDataURL(newFileInput.files[0]);
            } else {
                uploadButton.innerHTML = '<img style="filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(sizingMethod=scale,src=\'' + newFileInput.value + '\'">';
            }
        }
    });
    return newFileInput;
}

// 创建上传按钮
function createUploadButton(config) {
    var button;
    var buttonId = "uploadButton" + _id;
    var oldFileInput = document.getElementById(config.fileInputId);
    if (config.uploadType === "avatar") {
        button = document.createElement("div");
        button.className = "ty-upload ty-upload-avatar";
        button.innerHTML = '<div><i class="el-icon-plus"></i><p>上传图片</p></div>';
    }
    else if (config.uploadType === "dragger") {
        button = document.createElement("div");
        button.className = "ty-upload ty-upload-dragger";
        button.innerHTML = '<i class="el-icon-upload"></i><p class="ty-upload-text">将文件拖到此处，或<span>点击上传</span></p>'
        addEvent(button, "dragenter", dragenter);
        addEvent(button, "dragover", dragover);
        addEvent(button, "dragleave", dragleave);
        addEvent(button, "drop", drop);
        stopOpenFile();
    }
    else {
        button = document.createElement("button");
        button.className = "ty-upload-button";
        button.innerHTML = '<span>' + config.buttonText + '</span>';
    }
    button.id = buttonId;
    insertAfter(button, oldFileInput);
    addEvent(button, "click", uploadButtonClickEvent);
    return button;
}

// 拖拽事件——拖进
function dragenter(e) {
    this.className += " is-dragenter";
    return !!(e.preventDefault && e.preventDefault());
}

// 拖拽事件——移动
function dragover(e) {
    if (!this.style.border) this.style.border = "2px dashed #409eff";
    return !!(e.preventDefault && e.preventDefault());
}

// 拖拽事件——拖离
function dragleave() {
    var self = this;
    clearTimeout(this._timer);
    this._timer = setTimeout(function () {
        self.style.border = "";
        clearTimeout(self._timer);
    }, 200);
    this.className = this.className.replace(/is-dragenter/g, "");
}

// 拖拽事件——放置
function drop(e) {
    var timer, newInput;
    var files = e.dataTransfer.files;
    var fileInput = document.getElementById("fileInput" + _id);
    var uploadForm = document.getElementById("uploadForm" + _id);
    this.style.border = "";
    this.className = this.className.replace(/is-dragenter/g, "");
    console.log(files);
    if (files) {
        if (files.length === 1 && !files[0].type && !files[0].size) {
            return alert("不支持上传文件夹！");
        } else if (files.length > 1 && !config.multiple) {
            return alert("请上传单个文件！");
        }
        var formData = new FormData();
        newInput = fileInput.cloneNode();
        uploadForm.replaceChild(newInput, fileInput);
        newInput.files = files;
        console.log(newInput.files);
        // console.log(fileInput);
    }
    else {
        timer = setTimeout(function () {
            alert("您的浏览器版本过低不支持拖拽上传，请点击上传文件！");
            clearTimeout(timer);
        });
    }
}

// 拖拽上传时阻止浏览器默认打开文件
function stopOpenFile() {
    addEvent(document.body, "dragover", function (e) {
        e.stopPropagation && e.stopPropagation();
        return !!(e.preventDefault && e.preventDefault());
    });
    addEvent(document.body, "drop", function (e) {
        e.stopPropagation && e.stopPropagation();
        return !!(e.preventDefault && e.preventDefault());
    });
}

// 上传按钮点击事件（因为要取消点击事件，所以不能使用匿名函数）
function uploadButtonClickEvent() {
    var fileInput = document.getElementById("fileInput" + _id);
    fileInput.click();
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
        var img = document.createElement("img");
        for (i = 0, len = paths.length; i < len; i++) {
            suffixIndex = paths[i].lastIndexOf(".") + 1;
            suffix = paths[i].substring(suffixIndex).toUpperCase();
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
function addOtherDataToForm(data) {
    var input;
    var otherData = document.getElementById("otherData" + _id);
    otherData.innerHTML = "";
    for (var key in data) {
        input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = typeof data[key] === "object" ? JSON.stringify(data[key]) : data[key];
        otherData.appendChild(input);
    }
    return otherData;
}

// 提交表单
function submit() {
    document.getElementById("submitButton" + _id).click();
}

// 禁用上传
function disabled(config) {
    return function () {
        var button = document.getElementById("uploadButton" + _id);
        button.className += " is-disabled";
        removeEvent(button, "click", uploadButtonClickEvent);
        if (config.dragger) {
            removeEvent(button, "dragenter", dragenter);
            removeEvent(button, "dragover", dragover);
            removeEvent(button, "dragleave", dragleave);
            removeEvent(button, "drop", drop);
        }
    }
}

// 启用上传
function enabled(config) {
    return function () {
        var button = document.getElementById("uploadButton" + _id);
        button.className = button.className.replace(/is-disabled/g, "");
        removeEvent(button, "click", uploadButtonClickEvent);
        addEvent(button, "click", uploadButtonClickEvent);
        if (config.dragger) {
            removeEvent(button, "dragenter", dragenter);
            removeEvent(button, "dragover", dragover);
            removeEvent(button, "dragleave", dragleave);
            removeEvent(button, "drop", drop);
            addEvent(button, "dragenter", dragenter);
            addEvent(button, "dragover", dragover);
            addEvent(button, "dragleave", dragleave);
            addEvent(button, "drop", drop);
        }
    }
}

function init(config1) {
    config = config1 || {};
    config.autoUpload = config.autoUpload !== false;
    config.buttonText = config.buttonText || "上传附件";
    if (!config.url || !config.fileInputId) throw "url or fileInputId is not defined";
    var iframe = createUploadIFrame(config);
    var form = createUploadForm(config);
    var button = createUploadButton(config);
    if (config.data) addOtherDataToForm(config.data);
    var exports = {
        appendData: addOtherDataToForm,
        disabled: disabled(config),
        enabled: enabled(config)
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
        // buttonText: "上传文件",
        // preview: false,
        // dragger: true,
        uploadType: "dragger",//dragger avatar button
        // multiple: true,
        // autoUpload: false,
        data: {
            name: "李四",
            code: 519628
        },
        onChange: function (file) {
            console.log(file.files);
            console.log(file.value);
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
    });
    $("#changeData").on("click", function () {
        upload.appendData({
            name: "张三",
            code: 228712
        });
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
