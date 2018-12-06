##上传组件（tyUpload）

>上传组件具有上传、预览、删除文件功能，浏览器版本支持IE9及以上。  
>四种上传按钮类型（uploadType）：按钮（button）、拖拽（dragger）、图片上传（picture）、头像上传（avatar）。  
>三种上传列表预览类型（listType）：略缩图（thumbnail）、文本（text）、照片墙（picture-card）。  
>两种上传列表排列方式（align）：纵列(row)，横列(column)。  

[上传组件演示地址](http://60kg.top/upload/index.html)

#####参数

|参数名|描述|类型|是否必填|默认值| 可选值|
|:-|:-|:-|:-|:-|:-|
| url | 请求路径 | string | 是 | / | / |
| fileInputId | 初始化输入框的id | string | 是 | / | / |
| data | 上传时，提交额外的参数 | object | 否 | / | / |
| fileList | 初始化组件时，需要显示的上传文件列表。<br>在showFileList属性值为false的情况下无效。<br>uploadType属性值为avatar时，fileList属性值为单个对象 | array &#124; object | 否 | / | / |
| disabled | 是否禁用组件 | bool | 否 | false | true &#124; false |
| multiple | 是否可以多选文件 | bool | 否 | false | true &#124; false |
| autoUpload | 是否选中文件后自动上传 | bool | 否 | true | true &#124; false |
| showFileList | 是否预览文件列表 | bool | 否 | false | true &#124; false |
| uploadType | 上传按钮类型 | string | 否 | button | button &#124; dragger &#124; picture &#124; avatar |
| listType | 上传列表预览类型，在showFileList属性值为false的情况下无效 | string | 否 | text | thumbnail &#124; text &#124; picture-card |
| align | 上传列表排列方式，在showFileList属性值为false的情况下无效 | string | 否 | row | row &#124; column |
| buttonText | 按钮显示文字，在uploadType属性值为dragger的情况下无效 | string | 否 | 上传附件 | / |
| tips | 上传按钮下方的提示文字 | string | 否 | / | / |
| iconClass | 上传组件所需要用到的字体图标名字，已配置好。在其他项目中需要另行修改 | object | 否 | ···| / |

#####事件

|事件名|参数|描述|
|:-|:-|:-|
| onChange | files  | 当前选择文件发生变化时触发。此事件中的this绑定在当前上传输入框上。 |
| onRemove | file  | 当删除文件项时触发。参数为当前删除文件的数据。 只有删除成功状态的文件才会触发此事件|
| onDrop | files  | 当拖拽上传时放置文件时触发。 |
| beforeUpload | files  | 在上传文件之前触发。返回false则取消上传。 |
| success | data,toSuccess,toError  | 在上传成功后触发。<br>data:后台返回数据<br>在showFileList属性值为false的情况下toSuccess,toError方法无效。<br>toSuccess：确认上传成功后，执行该方法改变上传文件为成功状态，该方法接收一个数组将该数组的值依次绑定到上传文件上，以便删除事件中使用。<br>toError：确认上传失败，执行改方法。删除文件预览 |

#####方法

|方法名|参数|描述|
|:-|:-|:-|
| enabled | /  | 启用上传组件。 |
| disabled | /  | 禁用上传组件。 |
| loadFiles | fileList  | 此方法在showFileList属性值为false的情况下无效。清空当前文件预览列表，加载fileList数据生成预览列表。 <br> `upload2.loadFiles([{id: 3, name: "favicon.png", url: "img/favicon.png"}]);` |
| addOtherData | param  | 添加上传文件时需额外提交的数据，此方法将清除data属性中的值。<br>`upload2.appendData({name: "newUpload2"});` |

#####使用示例

    var upload2 = upload({
        fileList: fileList,
        tips: "upload2上传类型为拖拽上传，预览列表为纵列对齐，预览列表为文本预览，多选模式。",
        url: "/upload",
        fileInputId: "file2",
        showFileList: true,
        listType: "text",      // thumbnail text picture-card
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
        onChange: function (files) {
            console.log(this);
            console.log("onChange:", files);
        },
        onDrop: function (files) {
            console.log("onDrop:", files);
        },
        beforeUpload: function (files) {
            console.log("beforeUpload:", files);
            return true;
        },
        success: function (data, toSuccess, toError) {
            console.log(data);
            if (data.success) {
                toSuccess(data.content[0].files);
            } else {
                toError();
            }
        },
        error: function (xhr) {
            console.log(xhr);
        }
    });