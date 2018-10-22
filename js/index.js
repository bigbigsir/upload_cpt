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

}

function Upload(config) {
    this.options = $.extend(defaultConfig, config);

}

function insertAfter(newElement, targetElement) { // newElement是要追加的元素 targetElement 是指定元素的位置
    var parent = targetElement.parentNode; // 找到指定元素的父节点
    if (parent.lastChild === targetElement) { // 判断指定元素的是否是节点中的最后一个位置 如果是的话就直接使用appendChild方法
        parent.appendChild(newElement);
    } else {
        parent.insertBefore(newElement, targetElement.nextSibling);
    }
    console.log(targetElement);
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
}

$(function () {
    var random = Math.random();
    createUploadIframe(random);
    createUploadForm(random, "test");
});