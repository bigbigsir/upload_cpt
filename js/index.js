/**
 * Created by: MoJie
 * Date: 2018/10/11
 */

var _id = Math.random(), config;

function ajax(config) {
    var xhr;
    if (window.XMLHttpRequest) {
        xhr = new XMLHttpRequest();
    } else {
        xhr = new ActiveXObject('Microsoft.XMLHTTP');
    }
    xhr.open("POST", config.url);
    xhr.send(config.data);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            config.success && config.success(JSON.parse(xhr.responseText));
        }
    };
}

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
    form.id = formId;
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
            if (config.uploadType === "avatar" && !isImg(fileInput.value)) {
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

        var uploadButton, uploadList;
        config.onChange && config.onChange(newFileInput);
        if (!newFileInput.value) return false;
        if (config.autoUpload) {
            document.getElementById("submitButton" + _id).click();
        }
        if (config.uploadType === "avatar") {
            if (!isImg(newFileInput.value)) return false;
            uploadButton = document.getElementById("uploadButton" + _id);
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
        else if (config.listType === "picture" || config.listType === "text") {
            uploadList = document.getElementById("uploadList" + _id);
            var li, img;
            var firstChild;
            if (newFileInput.files) {
                var reader1;
                for (var i = 0, len = newFileInput.files.length; i < len; i++) {
                    li = document.createElement("li");
                    li.className = "ty-upload-list-item _not-upload";
                    var a = document.createElement("a");
                    var label = document.createElement("label");
                    var i_1 = document.createElement("i");
                    var i_2 = document.createElement("i");
                    var i_3 = document.createElement("i");
                    i_3.className = "ty-icon-close";
                    a.className = "ty-upload-list-item-name";
                    label.className = "ty-upload-list-item-status-label";
                    if (config.listType === "picture") {
                        if (~newFileInput.files[i].type.indexOf("image/")) {
                            reader1 = new FileReader();
                            img = document.createElement("img");
                            img.className = "ty-upload-list-item-thumbnail";
                            li.appendChild(img);
                            (function (img) {
                                reader1.onload = function () {
                                    img.src = this.result;
                                };
                            })(img);
                            reader1.readAsDataURL(newFileInput.files[i]);
                        } else {
                            i_1.className = "ty-upload-list-item-thumbnail ty-icon-plus";
                            li.appendChild(i_1);
                        }
                        a.innerText = newFileInput.files[i].name;
                        i_2.className = "ty-icon-check";
                        label.appendChild(i_2);
                        li.appendChild(a);
                        li.appendChild(label);
                        li.appendChild(i_3);
                        li.style.transform = "translateX(-270px)";
                        // li.style.transform = "translateY(-110px)";
                    }
                    else {
                        i_1.className = "ty-icon-plus";
                        i_2.className = "ty-icon-circle-check";
                        a.appendChild(i_1);
                        var text = document.createTextNode(newFileInput.files[i].name);
                        a.appendChild(text);
                        label.appendChild(i_2);
                        li.appendChild(a);
                        li.appendChild(label);
                        li.appendChild(i_3);
                        li.style.transform = "translateX(-270px)";
                        // li.style.transform = "translateY(-30px)";
                    }
                    firstChild = uploadList.firstChild;
                    li.style.opacity = ".2";

                    uploadList.insertBefore(li, firstChild);
                    (function (li) {
                        setTimeout(function () {
                            li.style.opacity = "1";
                            li.style.transform = "none";
                        }, 200);
                    })(li);
                }
            }
            else {
                var files = newFileInput.value.split(",");
                for (var j = 0, len1 = files.length; j < len1; j++) {
                    li = document.createElement("li");
                    li.className = "ty-upload-list-item _not-upload";
                    var a = document.createElement("a");
                    var label = document.createElement("label");
                    var i_1 = document.createElement("i");
                    var i_2 = document.createElement("i");
                    var i_3 = document.createElement("i");
                    i_3.className = "ty-icon-close";
                    a.className = "ty-upload-list-item-name";
                    label.className = "ty-upload-list-item-status-label";
                    if (config.listType === "picture") {
                        if (isImg(files[j])) {
                            img = document.createElement("img");
                            img.className = "ty-upload-list-item-thumbnail";
                            img.style.filter = 'progid:DXImageTransform.Microsoft.AlphaImageLoader(sizingMethod=scale,src="' + files[j] + '"';
                            li.appendChild(img);
                        } else {
                            i_1.className = "ty-upload-list-item-thumbnail ty-icon-plus";
                            li.appendChild(i_1);
                        }
                        a.innerText = getFileName(files[j]);
                        i_2.className = "ty-icon-check";
                        label.appendChild(i_2);
                        li.appendChild(a);
                        li.appendChild(label);
                        li.appendChild(i_3);
                    }
                    else {
                        i_1.className = "ty-icon-plus";
                        i_2.className = "ty-icon-circle-check";
                        a.appendChild(i_1);
                        var text = document.createTextNode(newFileInput.files[i].name);
                        a.appendChild(text);
                        label.appendChild(i_2);
                        li.appendChild(a);
                        li.appendChild(label);
                        li.appendChild(i_3);
                    }
                    firstChild = uploadList.firstChild;
                    uploadList.insertBefore(li, firstChild);
                }
            }
        }
    });
    return newFileInput;
}

// 根据文件路径获取文件名称
function getFileName(path) {
    var arr;
    if (typeof path === "string") {
        return path.replace(/.*\\([^\\]+)$/, "$1")
    } else {
        arr = [];
        for (var i = 0, len = path.length; i < len; i++) {
            arr.push(path.replace(/.*\\([^\\]+)$/, "$1"));
        }
        return arr;
    }
}

// 创建上传按钮
function createUploadButton(config) {
    var button, ul;// 上传按钮，预览容器
    var buttonId = "uploadButton" + _id;
    var oldFileInput = document.getElementById(config.fileInputId);
    if (config.uploadType === "avatar") {
        button = document.createElement("div");
        button.className = "ty-upload ty-upload-avatar";
        button.innerHTML = '<div><i class="ty-icon-plus"></i><p>上传图片</p></div>';
    }
    else if (config.uploadType === "dragger") {
        button = document.createElement("div");
        button.className = "ty-upload ty-upload-dragger";
        button.innerHTML = '<i class="ty-icon-upload"></i><p class="ty-upload-text">将文件拖到此处，或<span>点击上传</span></p>'
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
    if (config.uploadType !== "avatar" && (config.listType === "picture" || config.listType === "text")) {
        ul = document.createElement("ul");
        ul.id = "uploadList" + _id;
        ul.className = "ty-upload-list" +
            (config.listType === "picture" ? " ty-upload-list-picture" : "") +
            (config.isVertical ? " ty-upload-list-column" : "");
    }
    button.id = buttonId;
    insertAfter(button, oldFileInput);
    insertAfter(ul, button);
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
    if (!~this.className.indexOf("is-dragenter")) {
        this.className += " is-dragenter";
    }
    return !!(e.preventDefault && e.preventDefault());
}

// 拖拽事件——拖离
function dragleave() {
    var self = this;
    clearTimeout(this._timer); // 移动过程中，子元素会触发拖离事件，延迟清除边框，防止元素快速抖动
    this._timer = setTimeout(function () {
        self.className = self.className.replace(/is-dragenter/g, "");
        clearTimeout(self._timer);
        self._timer = null;
    }, 200);
}

// 拖拽事件——放置
function drop(e) {
    var files = e.dataTransfer.files;
    var fileInput = document.getElementById("fileInput" + _id);
    this.className = this.className.replace(/is-dragenter/g, "");
    // console.log(files);
    if (files) {
        if (files.length === 1 && !files[0].type && !files[0].size) {
            return alert("不支持上传文件夹！");
        } else if (files.length > 1 && !config.multiple) {
            return alert("请上传单个文件！");
        }
        if (!config.autoUpload) {
            this._files = this._files || [];
            for (var i = 0, len = files.length; i < len; i++) {
                this._files.push(files[i])
            }
        } else {
            formDataSubmit(files);
        }
    }
    else {
        var timer = setTimeout(function () {
            alert("您的浏览器版本过低不支持拖拽上传，请点击上传文件！");
            clearTimeout(timer);
        });
    }
}

// FormData方式上传
function formDataSubmit(files) {
    var formData = new FormData();
    var fileInput = document.getElementById("fileInput" + _id);
    for (var i = 0, len = files.length; i < len; i++) {
        formData.append(fileInput.name, files[i]);
    }
    for (var key in config.data) {
        formData.append(key, config.data[key]);
    }
    ajax({
        url: config.url,
        data: formData,
        success: config.success
    });
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
function isImg(fileValue) {
    var i, len;
    var suffixIndex, suffix;
    var paths = fileValue.split(",");
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
    var submitButton = document.getElementById("submitButton" + _id);
    var uploadButton = document.getElementById("uploadButton" + _id);
    if (config.uploadType === "dragger" && !config.autoUpload) {
        formDataSubmit(uploadButton._files);
        uploadButton._files = null;
    }
    submitButton.click();
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
        listType: "picture",//picture text
        isVertical: true,
        multiple: true,
        autoUpload: false,
        uploadType: "dragger",//dragger avatar button
        // data: {
        //     name: "李四",
        //     code: 519628
        // },
        onChange: function (file) {
            console.log(file.files);
            console.log(file.value);
            upload.appendData({
                name: "张三",
                code: 228712
            });
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
    $("#appendData").on("click", function () {
        // upload.appendData({
        //     name: "张三",
        //     code: 228712
        // });
        $(".ty-upload-list-picture .ty-upload-list-item").css({
            transform: "translateY(-92px)",
            opacity: 0
        });
        setTimeout(function () {
            $(".ty-upload-list-picture .ty-upload-list-item").css({
                transform: "none",
                opacity: 1
            });
        }, 1000)
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
