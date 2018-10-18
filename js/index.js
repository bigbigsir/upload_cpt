/**
 * Created by: MoJie
 * Date: 2018/10/11
 */


var defaultConfig = {
    type: "POST",
    preview: false,
    multiple: false,
    autoUpload: true
};

function init() {
    console.log(this.options);
}

function Upload(config) {
    this.options = $.extend(defaultConfig, config);
    this.init = init;
}


$(function () {
    var upload = new Upload({
        el: "file",
        url: "/platform/auth/menu/file/upload",
        success: function (data) {
            console.log(data);
        }
    })
});