/**
 * @description 上传组件
 * @author      mojie
 * @createDate  2018-11-02
 */
(function () {
    "use strict";

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

    /**
     * @description         在目标元素后插入元素
     * @param newElement    插入元素
     * @param targetElement 目标元素
     */
    function insertAfter(newElement, targetElement) {
        var parent = targetElement.parentNode;
        if (parent.lastChild === targetElement) {
            parent.appendChild(newElement);
        } else {
            parent.insertBefore(newElement, targetElement.nextSibling);
        }
    }

    /**
     * @description         在目标元素前插入元素
     * @param newElement    插入元素
     * @param targetElement 目标元素
     */
    function insertBefore(newElement, targetElement) {
        var parent = targetElement.parentNode;
        parent.insertBefore(newElement, targetElement);
    }

    /**
     * @description     验证图片大小是否通过
     * @param  file     文件框DOM对象
     * @param  maxSize  图片最大MB（默认5MB）
     * @return boolean  true/false
     */
    function limitImgMaxSize(file, maxSize) {
        var i, len;
        var suffixIndex, suffix;
        var paths, img;
        maxSize = maxSize || 5;
        maxSize = maxSize * 1024 * 1024;
        if (file.files) {
            for (i = 0, len = file.files.length; i < len; i++) {
                if (~file.files[i].type.indexOf("image/") && file.files[i].size > maxSize) {
                    return false;
                }
            }
        }
        else { // IE9或不支持files属性的浏览器
            paths = file.value.split(",");
            img = document.createElement("img");
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

    /**
     * @description    验证文件是否是图片
     * @param  file    文件框DOM对象/单个file对象/单个文件本地路径
     * @return boolean true/false
     */
    function isImg(file) {
        var files;
        var suffixIndex, suffix;
        if (file.nodeType) {
            files = file.files || file.value.split(",");
        }
        else {
            files = [file];
        }
        if (!files.length) return false;
        for (var i = files.length; i--;) {
            if (typeof files[i] === "object") {
                return (files[i].type && ~files[i].type.indexOf("image/"));
            }
            else if (typeof files[i] === "string") {
                suffixIndex = files[i].lastIndexOf(".") + 1;
                suffix = files[i].substring(suffixIndex).toUpperCase();
                if (!/^(JPEG|GIF|JPG|PNG)$/.test(suffix)) {
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * @description    创建Img元素
     * @param  file    单个file对象/单个文件本地路径
     * @return img     ImgElement/null
     */
    function createImg(file) {
        var fileReader;
        var img = document.createElement("img");
        if (typeof file === "object") {
            fileReader = new FileReader();
            fileReader.onload = function () {
                img.src = this.result;
            };
            fileReader.readAsDataURL(file);
        }
        else if (typeof file === "string") {
            img.style.filter = 'progid:DXImageTransform.Microsoft.AlphaImageLoader(sizingMethod=scale,src="' + file + '")';
        }
        return img;
    }

    /**
     * @description     获取文件路径中的文件名称
     * @param  path     单个文件路径/文件路径数组
     * @return fileName 单个文件名/文件名数组
     */
    function getFileName(path) {
        var fileName;
        if (typeof path === "string") {
            fileName = path.replace(/.*\\([^\\]+)$/, "$1")
        }
        else {
            fileName = [];
            for (var i = 0, len = path.length; i < len; i++) {
                fileName.push(path.replace(/.*\\([^\\]+)$/, "$1"));
            }
        }
        return fileName;
    }

    /**
     * @description    对象合并方法
     * @param  target  合并对象
     * @param  obj     被合并对象
     * @return target  合并对象
     */
    function extend(target, obj) {
        for (var key in obj) {
            if (obj.hasOwnProperty(key))
                target[key] = obj[key];
        }
        return target;
    }

    // 拖拽文件时阻止浏览器打开文件默认行为
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

    // 获取浏览器信息
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

    /**
     * ============ 组件初始化函数  =============
     */
    window.init = function (options) {
        var xhr;
        var _id, config;
        var defaultConfig = {
            disabled: false,
            multiple: false,
            showFileList: false,
            autoUpload: true,
            align: "row",           // row column
            uploadType: "button",   // button dragger picture avatar
            listType: "text",       // thumbnail text
            buttonText: "上传附件",
            iconClass: {
                "buttonIconUpload": "ty-icon-upload2",
                "iconUpload": "ty-icon-upload",
                "iconPlus": "ty-icon-plus",
                "iconCheck": "ty-icon-check",
                "iconClose": "ty-icon-close",
                "iconCircleCheck": "ty-icon-circle-check",
                "iconPicture": "ty-icon-picture-outline",
                "iconDocument": "ty-icon-document",
                "iconZoomIn": "ty-icon-zoom-in",
                "iconDelete": "ty-icon-delete",
                "iconLoading": "ty-icon-loading"
            }
        };

        // 创建iFrame元素，获取服务器返回值（主要目的兼容IE9）
        function createUploadIFrame() {
            var frameId = "uploadIFrame" + _id;
            var iFrame = document.createElement("iFrame");
            iFrame.id = iFrame.name = frameId;
            iFrame.className = "ty-upload-iframe";
            document.body.appendChild(iFrame);
            addEvent(iFrame, "load", iFrameLoadEvent);
            iFrame = null;

            // iFrame加载事件
            function iFrameLoadEvent() {
                var responseText, json;
                var document = this.contentWindow || this.contentDocument;
                responseText = document.document.body ? document.document.body.innerText : null;
                json = responseText && JSON.parse(responseText);
                if (json) {
                    if (config.success && typeof config.success === "function") {
                        config.success(json, elToSuccess, elToClose)
                    } else {
                        elToSuccess();
                    }
                    innerSuccessCb();
                }
            }
        }

        // 创建form元素
        function createUploadForm() {
            var formId = "uploadForm" + _id;
            var otherDataId = "otherData" + _id;
            var form = document.createElement("form");
            var fileInput = createFileInput();
            var otherData = document.createElement("div");
            otherData.id = otherDataId;
            form.id = formId;
            form.action = config.url;
            form.method = "POST";
            form.target = "uploadIFrame" + _id;
            form.enctype = "multipart/form-data";
            form.className = "ty-upload-form";
            form.appendChild(fileInput);
            form.appendChild(otherData);
            document.body.appendChild(form);
            return form;
        }

        // 创建fileInput元素
        function createFileInput() {
            var inputId = "fileInput" + _id;
            var newFileInput = document.createElement("input");
            var name = document.getElementById(config.fileInputId).name;
            newFileInput.type = "file";
            newFileInput.name = name || "file";
            newFileInput.id = inputId;
            newFileInput.removeAttribute("multiple");
            if (config.uploadType === "picture" || config.uploadType === "avatar") {
                newFileInput.accept = "image/gif,image/jpeg,image/jpg,image/png";
            }
            if (config.multiple && config.uploadType !== "avatar") {
                newFileInput.setAttribute("multiple", "multiple");
            }
            addEvent(newFileInput, "change", fileChangeEvent);
            return newFileInput;
        }

        // 创建UploadButton上传按钮
        function createUploadButton() {
            var upload;
            var oldFileInput = document.getElementById(config.fileInputId);
            if (config.uploadType === "avatar" || config.uploadType === "picture") {
                upload = createPicture();
            }
            else if (config.uploadType === "dragger") {
                upload = createDragger();
            }
            else {
                upload = createButton();
            }

            insertAfter(upload, oldFileInput);
            addEvent(upload, "click", uploadButtonClickEvent);
            oldFileInput.parentNode.removeChild(oldFileInput);
            if (config.disabled) disabled();
            if (config.showFileList && config.uploadType !== "avatar") {
                createUploadList();
                if (config.fileList && config.fileList.length) {
                    renderFileList(config.fileList, true);// 回显文件列表
                }
            }
            if (config.uploadType === "avatar" && config.fileList && config.fileList.length) {
                renderAvatar(config.fileList[0], upload);// 回显头像
            }
            if (config.tips) {
                insertAfter(createTips(), upload);
            }

            // 创建拖拽上传
            function createDragger() {
                var upload = document.createElement("div");
                upload.id = "uploadButton" + _id;
                upload.className = "ty-upload ty-upload-dragger";
                upload.innerHTML = '<i class="ty-upload-icon-upload ' + config.iconClass.iconUpload + '"></i>' +
                    '<p class="ty-upload-text">将文件拖到此处，或<em>点击上传</em></p>';
                addEvent(upload, "dragenter", dragenter);// 拖入
                addEvent(upload, "dragleave", dragleave);// 拖离
                addEvent(upload, "drop", drop);// 放置后
                stopOpenFile();
                return upload;
            }

            // 创建图片上传
            function createPicture() {
                var upload = document.createElement("div");
                upload.id = "uploadButton" + _id;
                upload.className = "ty-upload ty-upload-picture-card";
                upload.innerHTML = '<div class="ty-upload-icon-add-wrap">' +
                    '    <i class="ty-upload-icon-add ' + config.iconClass.iconPlus + '"></i>' +
                    '    <p class="ty-upload-text">上传图片</p>' +
                    '</div>';
                return upload;
            }

            // 创建按钮上传
            function createButton() {
                var upload = document.createElement("button");
                upload.id = "uploadButton" + _id;
                upload.className = "ty-upload ty-upload-button";
                upload.innerHTML = '<i class="ty-upload-icon-upload ' + config.iconClass.buttonIconUpload + '"></i>' +
                    '<span>' + config.buttonText + '</span>';
                return upload;
            }

            // 创建提示文字
            function createTips() {
                var tips = document.createElement("div");
                tips.className = "ty-upload-tips";
                tips.innerText = config.tips;
                return tips;
            }

            // 创建上传列表容器
            function createUploadList() {
                var uploadList = document.createElement("ul");
                uploadList.id = "uploadList" + _id;
                uploadList.className = "ty-upload-list";
                uploadList.className += config.align === "column" ?
                    " ty-upload-list-column" :
                    " ty-upload-list-row";
                if (config.uploadType === "picture") {
                    uploadList.className += " ty-upload-list-picture-card";
                    insertBefore(uploadList, upload);
                }
                else if (config.listType === "thumbnail") {
                    uploadList.className += " ty-upload-list-picture";
                    insertAfter(uploadList, upload);
                }
                else {
                    uploadList.className += " ty-upload-list-text";
                    insertAfter(uploadList, upload);
                }
            }
        }

        // 上传按钮点击事件
        function uploadButtonClickEvent() {
            var fileInput = document.getElementById("fileInput" + _id);
            fileInput.click();
        }

        // file输入框change事件
        function fileChangeEvent() {
            config.onChange && config.onChange(this);
            if (this.files) {
                this._files = [];
                for (var i = this.files.length; i--;) {
                    this._files.push(this.files[i]);
                }
            }
            if (config.uploadType === "avatar") {
                renderAvatar(this);
            }
            else if (config.showFileList) {
                renderFileList(this);
            }
            if (config.autoUpload) submit();
        }

        // 拖拽事件——拖入
        function dragenter(e) {
            this.className += " is-dragenter";
            return !!(e.preventDefault && e.preventDefault());
        }

        // 拖拽事件——拖离
        function dragleave(e) {
            this.className = this.className.replace(/ is-dragenter/g, "");
            return !!(e.preventDefault && e.preventDefault());
        }

        // 拖拽事件——放置
        function drop(e) {
            var fileInput;
            var files = e.dataTransfer.files;
            this.className = this.className.replace(/ is-dragenter/g, "");
            if (files) {
                if (files.length === 1 && !files[0].type && !files[0].size) {
                    return alert("不支持上传文件夹！");
                }
                else if (files.length > 1 && !config.multiple) {
                    return alert("请上传单个文件！");
                }
                else {
                    fileInput = document.getElementById("fileInput" + _id);
                    fileInput._files = [];
                    for (var i = 0, len = files.length; i < len; i++) {
                        fileInput._files.push(files[i]);
                    }
                    config.onChange && config.onChange(e.dataTransfer);
                    if (config.showFileList) renderFileList(e.dataTransfer);
                    if (config.autoUpload) submit();
                }
            }
            else {
                var timer = setTimeout(function () {
                    alert("您的浏览器版本过低不支持拖拽上传，请点击上传文件！");
                    clearTimeout(timer);
                });
            }
        }

        // 渲染上传头像
        function renderAvatar(file, upload) {
            var listItem, thumbnail, statusLabel, iconSuccess, iconPicture;
            var uploadButton = document.getElementById("uploadButton" + _id);
            if (upload || file.value && isImg(file)) {
                if (upload) {
                    if (!isImg(file.url)) return;
                    thumbnail = createImg();
                    thumbnail.src = file.url;
                    uploadButton = upload;
                }
                else if (file.files) {
                    thumbnail = createImg(file.files[0]);
                }
                else {
                    thumbnail = createImg(file.value.split(",")[0]);
                }
                listItem = document.createElement("div");
                statusLabel = document.createElement("label");
                iconSuccess = document.createElement("i");
                iconPicture = document.createElement("i");
                listItem.className = "ty-upload-list-item is-ready";
                thumbnail.className = "ty-upload-list-item-thumbnail";
                statusLabel.className = "ty-upload-list-item-status-label";
                iconSuccess.className = "ty-upload-list-item-success " + config.iconClass.iconCheck;
                iconPicture.className = "ty-upload-list-item-picture " + config.iconClass.iconPicture;
                statusLabel.appendChild(iconSuccess);
                listItem.appendChild(thumbnail);
                listItem.appendChild(statusLabel);
                listItem.appendChild(iconPicture);
                uploadButton.innerHTML = "";
                uploadButton.appendChild(listItem);
            } else {
                uploadButton.innerHTML = '<div class="ty-upload-icon-add-wrap">' +
                    '    <i class="ty-upload-icon-add ' + config.iconClass.iconPlus + '"></i>' +
                    '    <p class="ty-upload-text">上传图片</p>' +
                    '</div>';
            }
        }

        // 渲染上传文件列表
        function renderFileList(file, isFileList) {
            var previewItem;
            var i, len, j;
            var isHtml5 = isFileList || !!file.files;
            var files = (isFileList && file) || (file.files || file.value.split(","));
            var uploadList = document.getElementById("uploadList" + _id);
            var readyList = uploadList.getElementsByClassName("is-ready");
            var transform = config.align === "column" ? " ty-list-column-to" : " ty-list-row-to";
            for (j = readyList.length; j--;) {
                // 每次改变上传的文件，清空当前未上传的文件预览项
                readyList[j].parentNode.removeChild(readyList[j]);
            }
            if (!isFileList && config.uploadType === "picture" && !isImg(file)) {
                return false;// 上传时非图片不生成预览
            }
            for (i = 0, len = files.length; i < len; i++) { // 文件预览渲染
                previewItem = createPreviewItem(files[i]);
                previewItem._file = files[i];
                uploadList.appendChild(previewItem);
                addEvent(previewItem, "click", removeFileItem);
                (function (li) {// 延时删除样式，防止不产生transform效果
                    var timer = setTimeout(function () {
                        li.className = li.className.replace(transform, "");
                        clearTimeout(timer);
                    }, 100);
                })(previewItem);
            }

            // 创建预览文件项
            function createPreviewItem(file) {
                var listItem, itemThumbnai, itemName, statusLabel,
                    iconFile, iconSuccess, iconClose, textNode;
                listItem = document.createElement("li");        // 预览项-容器
                itemName = document.createElement("a");         // 预览项-名称
                statusLabel = document.createElement("label");  // 预览项-成功状态标识
                iconSuccess = document.createElement("i");      // 预览项-成功图标
                iconClose = document.createElement("i");        // 预览项-关闭图标
                iconFile = document.createElement("i");         // 预览项-文件图标
                listItem.className = "ty-upload-list-item " + (isFileList ? "is-success" : "is-ready") + transform;
                itemName.className = "ty-upload-list-item-name";
                statusLabel.className = "ty-upload-list-item-status-label";
                iconFile.className = "ty-upload-list-item-document " + config.iconClass.iconDocument;
                iconSuccess.className = "ty-upload-list-item-success";
                iconClose.className = "ty-upload-list-item-close " + config.iconClass.iconClose;
                textNode = isHtml5 ? file.name : getFileName(file);
                textNode = document.createTextNode(textNode);
                if (config.uploadType === "picture" || config.listType === "thumbnail") {// 照片墙/略缩图预览
                    if (isFileList) { // 是否回显
                        if (isImg(file.url)) {
                            itemThumbnai = createImg();
                            itemThumbnai.src = file.url;
                            itemThumbnai.className = "ty-upload-list-item-thumbnail";
                            listItem.appendChild(itemThumbnai);
                        }
                    }
                    else if (isImg(file)) {
                        itemThumbnai = createImg(file);
                        itemThumbnai.className = "ty-upload-list-item-thumbnail";
                        listItem.appendChild(itemThumbnai);
                    }
                    iconSuccess.className += " " + config.iconClass.iconCheck;
                }
                else {// 文本预览
                    iconSuccess.className += " " + config.iconClass.iconCircleCheck;
                }
                itemName.appendChild(iconFile);
                itemName.appendChild(textNode);
                statusLabel.appendChild(iconSuccess);
                listItem.appendChild(itemName);
                listItem.appendChild(statusLabel);
                if (config.uploadType === "picture") {
                    listItem.appendChild(createPictureActions());
                }
                else {
                    listItem.appendChild(iconClose);
                }
                return listItem;

                // 创建照片墙预览/删除按钮
                function createPictureActions() {
                    iconClose = null;
                    itemName.removeChild(textNode);
                    iconFile.className = "ty-upload-list-item-picture " + config.iconClass.iconPicture;
                    var itemActions = document.createElement("span");
                    var iconPreview = document.createElement("i");
                    var iconDelete = document.createElement("i");
                    itemActions.className = "ty-upload-list-item-actions";
                    iconPreview.className = "ty-upload-list-item-preview " + config.iconClass.iconZoomIn;
                    iconDelete.className = "ty-upload-list-item-delete " + config.iconClass.iconDelete;
                    itemActions.appendChild(iconPreview);
                    itemActions.appendChild(iconDelete);
                    return itemActions;
                }
            }
        }

        // 文件项点击事件，关闭/删除/预览图标按钮冒泡触发事件
        function removeFileItem(e) {
            var item, fileInput;
            var isPreview = ~e.target.className.indexOf("ty-upload-list-item-preview");
            var isClear = ~e.target.className.indexOf("ty-upload-list-item-close") ||
                ~e.target.className.indexOf("ty-upload-list-item-delete");// 判断事件源是不是删除按钮
            if (isClear) {
                item = this;
                item.className += config.align === "column" ? " ty-list-column-to" : " ty-list-row-to";
                fileInput = document.getElementById("fileInput" + _id);
                var i = setTimeout(function () { // 删除文件项
                    item.parentNode.removeChild(item);
                    clearTimeout(i);
                }, 500);
                if (~item.className.indexOf("is-ready")) { // 如果未上传，需要删除该文件对象
                    if (window.FormData) {
                        for (var j = fileInput._files && fileInput._files.length; j--;) {
                            if (item._file === fileInput._files[j]) {
                                return fileInput._files.splice(j, 1);
                            }
                        }
                    }
                    else {
                        clearFileInput();
                    }
                }
                else {
                    config.onRemove && config.onRemove(item._file);
                    // todo 已经上传成功的文件,删除时如何处理
                }
            }
            else if (isPreview) {
                var img = this.getElementsByClassName("ty-upload-list-item-thumbnail")[0];
                config.onPreview && config.onPreview(img && img.cloneNode());
            }
        }

        // 重置文件输入框（清空值）
        function clearFileInput() {
            var fileInput = document.getElementById("fileInput" + _id);
            if (!fileInput.value) {
                fileInput._files = null;
            } else {
                var cloneNode = fileInput.cloneNode();
                cloneNode.value = null;
                cloneNode._files = null;
                fileInput.parentNode.replaceChild(cloneNode, fileInput);
                removeEvent(cloneNode, "change", fileChangeEvent);
                addEvent(cloneNode, "change", fileChangeEvent);
            }
        }

        // 禁用上传
        function disabled() {
            var button = document.getElementById("uploadButton" + _id);
            button.className += " is-disabled";
            removeEvent(button, "click", uploadButtonClickEvent);
            if (config.uploadType === "dragger") {
                removeEvent(button, "dragenter", dragenter);
                removeEvent(button, "dragleave", dragleave);
                removeEvent(button, "drop", drop);
            }
        }

        // 启用上传
        function enabled() {
            var button = document.getElementById("uploadButton" + _id);
            button.className = button.className.replace(/ is-disabled/g, "");
            removeEvent(button, "click", uploadButtonClickEvent);
            addEvent(button, "click", uploadButtonClickEvent);
            if (config.uploadType === "dragger") {
                removeEvent(button, "dragenter", dragenter);
                removeEvent(button, "dragleave", dragleave);
                removeEvent(button, "drop", drop);
                addEvent(button, "dragenter", dragenter);
                addEvent(button, "dragleave", dragleave);
                addEvent(button, "drop", drop);
            }
        }

        // 添加其他表单参数
        function addOtherDataToForm(data) {
            var input;
            var otherData = document.getElementById("otherData" + _id);
            otherData.innerHTML = "";
            for (var key in data) {
                if (data.hasOwnProperty(key)) {
                    input = document.createElement("input");
                    input.type = "hidden";
                    input.name = key;
                    input.value = typeof data[key] === "object" ? JSON.stringify(data[key]) : data[key];
                    otherData.appendChild(input);
                }
            }
        }

        // 请求方法
        function ajax(ajaxConfig) {
            if (window.XMLHttpRequest) {
                xhr = new XMLHttpRequest();
            } else {
                xhr = new ActiveXObject('Microsoft.XMLHTTP');
            }
            xhr.onreadystatechange = onReadyStateChange; // 状态变化
            xhr.upload.onloadstart = onLoadStart;        // 开始
            xhr.upload.onprogress = onProgress;          // 请求中···
            xhr.onerror = onError;                       // 异常
            xhr.open("POST", ajaxConfig.url);
            xhr.send(ajaxConfig.data);

            // xhr状态变化事件
            function onReadyStateChange(e) {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    var json = JSON.parse(xhr.responseText);
                    if (ajaxConfig.success && typeof ajaxConfig.success === "function") {
                        ajaxConfig.success(json, affirmSuccess, affirmError)
                    } else {
                        affirmSuccess();
                    }
                    innerSuccessCb();
                }

                // 确认上传成功调用函数
                function affirmSuccess() {
                    var xhrId = e.target.upload._id;
                    clearInterval(e.target.upload._timer);
                    if (!e.target.upload._isFast) {// 防止请求过快，进度条一闪而过
                        var timer = setTimeout(function () {
                            elToSuccess(xhrId);
                            clearTimeout(timer)
                        }, 400);
                    } else {
                        elToSuccess(xhrId);
                    }
                    delete e.target.upload._id;
                    delete e.target.upload._timer;
                    delete e.target.upload._isFast;
                }

                // 确认上传失败调用函数
                function affirmError() {
                    var xhrId = e.target.upload._id;
                    elToClose(xhrId);
                    delete e.target.upload._id;
                    delete e.target.upload._timer;
                    delete e.target.upload._isFast;
                }
            }
        }

        // xhr请求开始事件函数
        function onLoadStart(e) {
            var xhrId = "xhr" + Math.random();
            e.target._id = xhrId;
            e.target._timer = setTimeout(function () {
                e.target._isFast = true; // 记录上传完成时间是否小于200ms
            }, 300);
            elToUploading(xhrId);// 不同上传批次的预览项，添加不同的标识
        }

        // xhr请求进度事件函数，大概0.1秒执行一次
        function onProgress(e) { // 该事件大概0.1秒执行一次
            var progressView;
            var xhrId = e.target._id;
            var total = e.total;    // 附件总大小
            var loaded = e.loaded;  // 已经上传大小情况
            var per = Math.floor(100 * loaded / total);// 已经上传的百分比
            var isPicture = config.uploadType === "picture" || config.uploadType === "avatar";
            var text = document.getElementsByClassName("ty-progress-text " + xhrId);
            if (isPicture) {
                progressView = document.getElementsByClassName("ty-progress-circle-path " + xhrId);
            } else {
                progressView = document.getElementsByClassName("ty-progress-bar-inner " + xhrId);
            }
            per = isNaN(per) ? 0 : per;
            for (var i = text.length; i--;) {
                text[i].innerText = per + "%";
            }
            for (var j = progressView.length; j--;) {
                if (isPicture) {
                    progressView[j].style.strokeDashoffset = 299.08 - (299.08 / 100 * per) + "px";
                } else {
                    progressView[j].style.width = per + "%";
                }
            }
        }

        // xhr请求失败事件函数
        function onError(e) {
            var xhrId = e.target.upload._id;
            elToClose(xhrId);
            config.error && config.error(e.target);
        }

        // 中断上传方法，闭包留住当次上传的xhr对象
        function cancelUpload(xhr) {
            return function () {
                if (xhr) {
                    xhr.abort();
                    elToClose(xhr.upload._id)
                } else {
                    alert("您所使用的浏览器不支持取消上传！");
                }
            };
        }

        // 请求成功后的回调函数
        function innerSuccessCb() {
            clearFileInput();
        }

        // 预览元素变为上传中状态
        function elToUploading(xhrId) {
            xhrId = xhrId ? " " + xhrId : "";
            var i, html, closeBtn;
            var uploadList = document.getElementById("uploadList" + _id);
            if (config.uploadType === "avatar") {
                uploadList = document.getElementById("uploadButton" + _id);
            }
            var isPicture = config.uploadType === "picture" || config.uploadType === "avatar";
            var readyList = uploadList.getElementsByClassName("is-ready");
            if (window.FormData) {
                if (isPicture) {// 添加圆形进度条元素
                    html = '<div class="ty-progress">' +
                        '            <div class="ty-progress-circle">' +
                        '                <svg viewBox="0 0 100 100">' +
                        '                    <path d="M 50 50 m 0 -47 a 47 47 0 1 1 0 94 a 47 47 0 1 1 0 -94"' +
                        '                          stroke="#e5e9f2" stroke-width="4.8" fill="none" class="ty-progress-circle-track"></path>' +
                        '                    <path d="M 50 50 m 0 -47 a 47 47 0 1 1 0 94 a 47 47 0 1 1 0 -94"' +
                        '                          stroke-linecap="round" stroke="#20a0ff" stroke-width="4.8" fill="none" class="ty-progress-circle-path' + xhrId + '"' +
                        '                          style="stroke-dasharray: 299.08px, 299.08px; stroke-dashoffset: 299.08px; transition: stroke-dashoffset 0.3s ease 0s, stroke 0.3s ease 0s;"></path>' +
                        '                </svg>' +
                        '            </div>' +
                        '            <div class="ty-progress-text' + xhrId + '" ></div>' +
                        '        </div>'
                }
                else {// 添加条形进度条元素
                    html = '<div class="ty-progress ty-progress-line">' +
                        '            <div class="ty-progress-bar">' +
                        '                <div class="ty-progress-bar-outer">' +
                        '                    <div class="ty-progress-bar-inner' + xhrId + '"></div>' +
                        '                </div>' +
                        '            </div>' +
                        '            <div class="ty-progress-text' + xhrId + '"></div>' +
                        '        </div>';
                }
            }
            else { // IE9用动态图标代替进度条
                html = '<i class="ty-upload-list-item-uploading ' + config.iconClass.iconLoading + '"></i>';
            }
            for (i = readyList.length; i--;) {
                readyList[i].innerHTML += html;
                if (isPicture) { //
                    closeBtn = readyList[i].getElementsByClassName("ty-upload-list-item-delete")[0];
                } else {
                    closeBtn = readyList[i].getElementsByClassName("ty-upload-list-item-close")[0];
                }
                removeEvent(readyList[i], "click", removeFileItem);
                closeBtn && addEvent(closeBtn, "click", cancelUpload(xhr));
                readyList[i].className = readyList[i].className.replace(" is-ready", "") + " is-uploading" + xhrId;
            }
        }

        // 预览元素变为上传成功状态
        function elToSuccess(xhrId) {
            xhrId = xhrId ? " " + xhrId : "";
            var i, progress, closeBtn;
            var uploadList = document.getElementById("uploadList" + _id);
            if (config.uploadType === "avatar") {
                uploadList = document.getElementById("uploadButton" + _id);
            }
            var isPicture = config.uploadType === "picture" || config.uploadType === "avatar";
            var uploadingList = uploadList.getElementsByClassName("is-uploading" + xhrId);
            for (i = uploadingList.length; i--;) {
                if (window.FormData) {
                    progress = uploadingList[i].getElementsByClassName("ty-progress")[0];
                }
                else {
                    progress = uploadingList[i].getElementsByClassName("ty-upload-list-item-uploading")[0];
                }
                progress && uploadingList[i].removeChild(progress);
                if (isPicture) {
                    closeBtn = uploadingList[i].getElementsByClassName("ty-upload-list-item-delete")[0];
                } else {
                    closeBtn = uploadingList[i].getElementsByClassName("ty-upload-list-item-close")[0];
                }
                closeBtn && closeBtn.parentNode.replaceChild(closeBtn.cloneNode(), closeBtn);
                addEvent(uploadingList[i], "click", removeFileItem);
                uploadingList[i].className = uploadingList[i].className.replace(" is-uploading" + xhrId, "") + " is-success"
            }
        }

        // 预览元素上传错误删除元素
        function elToClose(xhrId) {
            xhrId = xhrId ? " " + xhrId : "";
            var uploadList = document.getElementById("uploadList" + _id);
            var uploadingList = uploadList.getElementsByClassName("is-uploading" + xhrId);
            for (var i = uploadingList.length; i--;) {
                uploadingList[i].className += config.align === "column" ? " ty-list-column-to" : " ty-list-row-to";
                (function (li) {
                    var timer = setTimeout(function () { // 删除文件项
                        li.parentNode.removeChild(li);
                        clearTimeout(timer);
                    }, 500);
                })(uploadingList[i]);
            }
            clearFileInput();
        }

        // 提交前验证是否符合规则
        function validateFile(fileInput) {
            if (!limitImgMaxSize(fileInput)) {
                alert("上传图片的大小不能超过5M！");
                return false;
            }
            if ((config.uploadType === "avatar" || config.uploadType === "picture") && !isImg(fileInput)) {
                alert("请上传图片格式文件！");
                return false;
            }
            return !config.beforeUpload || config.beforeUpload(fileInput);
        }

        // 提交
        function submit() {
            var fileInput = document.getElementById("fileInput" + _id);
            var uploadForm = document.getElementById("uploadForm" + _id);
            if (!validateFile(fileInput)) return;
            if (config.autoUpload && config.showFileList) {
                // 如果生成预览项且自动提交，延时等待元素生成完毕后提交
                var timer = setTimeout(function () {
                    _submit();
                    clearTimeout(timer);
                }, 500);
            }
            else {
                _submit()
            }

            function _submit() {
                if (window.FormData) {
                    formDataSubmit();
                } else {
                    formSubmit();
                }
            }

            function formDataSubmit() {
                var i, formData;
                if (!fileInput._files || !fileInput._files.length) return;
                fileInput.disabled = "disabled";
                formData = new FormData(uploadForm);
                fileInput.removeAttribute("disabled");
                for (i = fileInput._files.length; i--;) {
                    formData.append(fileInput.name, fileInput._files[i]);
                }
                ajax({
                    url: config.url,
                    data: formData,
                    success: config.success,
                    error: config.error
                });
            }

            function formSubmit() {
                if (!fileInput.value) return;
                elToUploading();
                uploadForm.submit();
            }
        }

        /**
         ============  初始化组件并对外返回组件方法  ===========
         */
        _id = Math.random();
        config = extend(defaultConfig, options);
        if (!config.url || !config.fileInputId) throw "url or fileInputId is not defined";
        createUploadIFrame();
        createUploadForm();
        createUploadButton();
        if (config.data) addOtherDataToForm(config.data);
        return {
            uploadId: _id,
            enabled: enabled, // 启用上传
            disabled: disabled, // 禁用上传
            appendData: addOtherDataToForm, // 追加数据
            submit: config.autoUpload ? null : submit // 手动提交
        };
    };
})();

window.onload = function () {
    var fileList = [{
        id: 1,
        name: "img.jpg",
        url: "img/img.jpg"
    }, {
        id: 2,
        name: "text.txt",
        url: "img/text.txt"
    }];
    var iconClass = {
        "buttonIconUpload": "ty-icon-upload2",
        "iconUpload": "ty-icon-upload",
        "iconPlus": "ty-icon-plus",
        "iconCheck": "ty-icon-check",
        "iconClose": "ty-icon-close",
        "iconCircleCheck": "ty-icon-circle-check",
        "iconPicture": "ty-icon-picture-outline",
        "iconDocument": "ty-icon-document",
        "iconZoomIn": "ty-icon-zoom-in",
        "iconDelete": "ty-icon-delete",
        "iconLoading": "ty-icon-loading"
    };
    var upload1 = init({
        iconClass: iconClass,
        fileList: fileList,
        tips: "upload1上传类型为按钮上传，预览列表为横列对齐，预览列表为略缩图预览。单选模式",
        url: "/upload",
        fileInputId: "file1",
        showFileList: true,
        listType: "thumbnail",  // thumbnail text
        align: "row",           // row column
        uploadType: "button",   // button dragger picture avatar
        buttonText: "上传文件",
        multiple: false,
        autoUpload: false,
        disabled: true,
        data: {
            name: "upload1"
        },
        onRemove: function (data) {
            console.log(data);
        },
        onChange: function (file) {
            // console.log("onChange:", file);
        },
        beforeUpload: function (imgElement) { // 上传文件之前的钩子，参数为当前文件input
            // console.log("beforeUpload:", file);
            return true; // return false 可以停止上传
        },
        success: function (data, toSuccess, toError) {
            console.log(data);
            var timer = setTimeout(function () {
                alert("这里假装上传失败，然后清除预览项");
                toError();
                clearTimeout(timer);
            }, 2000);
        }
    });
    var upload2 = init({
        // fileList: fileList,
        tips: "upload2上传类型为拖拽上传，预览列表为纵列对齐，预览列表为文本预览。多选模式",
        url: "/upload",
        fileInputId: "file2",
        showFileList: true,
        listType: "text",      // thumbnail text
        align: "column",       // row column
        uploadType: "dragger", // button dragger picture avatar
        multiple: true,
        autoUpload: true,
        disabled: false,
        data: {
            name: "upload2"
        },
        onRemove: function (data) {
            console.log(data);
        },
        onChange: function (file) {
            // console.log("onChange:", file.files);
        },
        beforeUpload: function (file) {
            // console.log("beforeUpload:", file);
            return true;
        },
        success: function (data, toSuccess, toError) {
            console.log(data);
            toSuccess();
        }
    });
    var upload3 = init({
        fileList: fileList,
        tips: "upload3上传类型为照片墙上传，预览列表为纵列对齐，只支持单个或多个图片上传",
        url: "/upload",
        fileInputId: "file3",
        showFileList: true,
        listType: "text",      // thumbnail text 照片墙上传无预览类型
        align: "column",       // row column
        uploadType: "picture", // button dragger picture avatar
        multiple: true,
        autoUpload: true,
        disabled: false,
        data: {
            name: "upload3"
        },
        onRemove: function (data) {
            console.log(data);
        },
        onPreview: function (src) {
            console.log(src);
        },
        onChange: function (file) {
            // console.log("onChange:", file);
        },
        beforeUpload: function (file) {
            // console.log("beforeUpload:", file);
            return true;
        },
        success: function (data, toSuccess, toError) {
            console.log(data);
            toSuccess();
        }
    });
    var upload4 = init({
        // fileList: fileList,
        tips: "upload4上传类型为头像上传，只支持单张图片上传",
        url: "/upload",
        fileInputId: "file4",
        showFileList: true,    // 头像上传无预览模式
        listType: "text",      // thumbnail text 头像上传无预览类型
        align: "column",       // row column     头像上传无排列方式
        uploadType: "avatar",  // button dragger picture avatar
        multiple: false,
        autoUpload: true,
        disabled: false,
        data: {
            name: "upload4"
        },
        onChange: function (file) {
            // console.log("onChange:", file);
        },
        beforeUpload: function (file) {
            // console.log("beforeUpload:", file);
            return true;
        },
        success: function (data, toSuccess, toError) {
            console.log(data);
            toSuccess();
        }
    });
    var disabled = document.getElementById("disabled");
    var enabled = document.getElementById("enabled");
    var manualUpload = document.getElementById("manualUpload");
    var appendData = document.getElementById("appendData");
    disabled.onclick = function () {
        upload1.disabled();
        upload2.disabled();
        upload3.disabled();
        upload4.disabled();
    };
    enabled.onclick = function () {
        upload1.enabled();
        upload2.enabled();
        upload3.enabled();
        upload4.enabled();
    };
    manualUpload.onclick = function () {
        upload1.submit();// 自动上传模式，无此钩子
    };
    appendData.onclick = function () {
        upload1.enabled({name: "newUpload1"});
        upload2.enabled({name: "newUpload2"});
        upload3.enabled({name: "newUpload3"});
        upload4.enabled({name: "newUpload4"});
    };
    var icon;
    var iconBox = document.getElementsByClassName("icon-font-box")[0];
    for (var key in iconClass) {
        icon = document.createElement("i");
        icon.className = iconClass[key];
        iconBox.appendChild(icon);
    }
};