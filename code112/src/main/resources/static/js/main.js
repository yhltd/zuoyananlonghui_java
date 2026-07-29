
function $ajax(options, isLoading, loadingEl, success) {
    $.ajax({
        timeout: 1000000,
        ...options,
        beforeSend: function () {
            if (isLoading) {

            }
        },
        success: res => {
            if (res.code == 401) {
                alert(res.msg);
                return;
            }
            success(res);
        },
        error: err => {
            console.log(err)
            if(err.responseText == 'loseToken'){
                alert('身份验证已过期，请重新登录');
                window.location.href = '/';
                return;
            }

            if (err.status == 'timeout') {
                alert('网络超时，请稍后再试。')
            } else {
                alert('网络错误，请稍后再试。')
            }
        },
        complete: res => {
            if (isLoading) {

            }
        }
    })
}

function loadingShow(el) {

}

function loadingHide(el) {

}

function formToJson(el) {
    let formData = $(el).serialize();
    let deCode = decodeURIComponent(formData);
    deCode = deCode.replace(/&/g, "\",\"").replace(/=/g, "\":\"").replace(/\+/g, " ").replace(/[\r\n]/g, "<br>");
    deCode = "{\"" + deCode + "\"}";
    return JSON.parse(deCode);
}

function setForm(params, el) {
    for (let param in params) {
        $(el + ' input').each(function (index, input) {
            if ($(input).attr('name') == param) {
                $(input).val(params[param]);
                return false;
            }
        })
    }
}

function setTextArea(params, el) {
    for (let param in params) {
        $(el + ' textarea').each(function (index, textarea) {
            if ($(textarea).attr('name') == param) {
                let str = params[param]
                console.log(str)
                var reg = new RegExp("<br><br>","g")
                var newstr = str.replace(reg,"\n")
                console.log(newstr)
                $(textarea).val(newstr);
                return false;
            }
        })
    }
}

function checkForm(el) {
    let result = true
    $(el + ' input').each(function(index,input){
        let isRequired = $(input).data('required');
        if(isRequired == "1"){
            return true;
        }
        if($(input).val() == '' || $(input).val() <= 0){
            $(input).next().css('display','block');
            result = false
        }else{
            $(input).next().css('display','none');
        }
    });
    $(el + ' select').each(function(index,select){
        let isRequired = $(select).data('required');
        if(isRequired == "1"){
            return true;
        }
        if($(select).val() == '' || $(select).val() == undefined){
            $(select).next().css('display','block');
            result = false
        }else{
            $(select).next().css('display','none');
        }
    });
    return result;
}

function formatDate(date, format) {
    if (!date) return;
    if (!format)
        format = "yyyy-MM-dd";
    switch (typeof date) {
        case "string":
            date = new Date(date.replace(/-/, "/"));
            break;
        case "number":
            date = new Date(date);
            break;
    }
    if (!date instanceof Date) return;
    var dict = {
        "yyyy": date.getFullYear(),
        "M": date.getMonth() + 1,
        "d": date.getDate(),
        "H": date.getHours(),
        "m": date.getMinutes(),
        "s": date.getSeconds(),
        "MM": ("" + (date.getMonth() + 101)).substr(1),
        "dd": ("" + (date.getDate() + 100)).substr(1),
        "HH": ("" + (date.getHours() + 100)).substr(1),
        "mm": ("" + (date.getMinutes() + 100)).substr(1),
        "ss": ("" + (date.getSeconds() + 100)).substr(1)
    };
    return format.replace(/(yyyy|MM?|dd?|HH?|ss?|mm?)/g, function () {
        return dict[arguments[0]];
    });
}

//获取表格选择行
function getTableSelection(tableEl) {
    let result = [];
    let tableData = $(tableEl).bootstrapTable('getData');
    $(tableEl + ' tr').each(function (i, tr) {
        let index = $(tr).data('index');
        if (index != undefined) {
            if ($(tr).hasClass('selected')) {
                result.push({
                    index: index,
                    data: tableData[index]
                })
            }
        }
    })
    return result;
}

//选择表格行
function setTableSelection(tableEl, rowIndex, isSelect) {
    $(tableEl + ' tr').each(function (i, tr) {
        let index = $(tr).data('index');
        if (index == rowIndex) {
            if (isSelect) {
                $(tr).addClass('selected')
            } else {
                $(tr).removeClass('selected')
            }
        }
    })
}


$(function () {
    $('#out-a').click(function(){
        window.location.href = '/';
    })

    $('#refresh_btn').click(function(){
        location.reload();
    })
})


function changeIframeSrc(url) {
    $('#iframe').attr('src', url);
}
$(document).ready(function() {
    console.log('父页面加载完成');

    // 获取 iframe 元素
    var iframe = document.querySelector('iframe');

    if (iframe) {
        console.log('找到 iframe 元素');

        // 监听 iframe 加载完成事件
        iframe.onload = function() {
            console.log('iframe 加载完成，开始设置焦点');

            // 给 iframe 一点时间初始化（非常重要！）
            setTimeout(function() {
                try {
                    // 方法1：设置 iframe 窗口焦点
                    iframe.contentWindow.focus();
                    console.log('iframe 窗口焦点已设置');

                    // 方法2：设置 iframe 文档焦点
                    iframe.contentDocument.body.focus();
                    console.log('iframe 文档焦点已设置');

                    // 方法3：尝试聚焦到 iframe 内的表格
                    var iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                    var iframeTable = iframeDoc.getElementById('userTable');
                    if (iframeTable) {
                        iframeTable.focus();
                        console.log('iframe 内表格焦点已设置');
                    }

                } catch (e) {
                    console.log('设置 iframe 焦点时出错，可能是跨域限制:', e);

                    // 如果遇到跨域限制，尝试替代方案
                    setIframeFocusFallback(iframe);
                }
            }, 800); // 延迟 800ms 确保 iframe 完全加载
        };

        // 如果 iframe 已经加载完成（比如从缓存加载）
        if (iframe.contentDocument && iframe.contentDocument.readyState === 'complete') {
            iframe.onload(); // 手动触发
        }

        // 额外：监听鼠标移动到 iframe 上时也设置焦点
        iframe.addEventListener('mouseenter', function() {
            setTimeout(function() {
                try {
                    iframe.contentWindow.focus();
                } catch (e) {
                    console.log('鼠标进入时设置焦点出错:', e);
                }
            }, 50);
        });
    }
});

// 备用方案：如果直接设置焦点失败（比如跨域限制）
function setIframeFocusFallback(iframe) {
    console.log('使用备用方案设置焦点');

    // 方案1：设置 iframe 的 tabindex
    iframe.setAttribute('tabindex', '-1');

    // 方案2：创建隐藏输入框，通过它转移焦点
    var hiddenInput = document.createElement('input');
    hiddenInput.type = 'text';
    hiddenInput.style.position = 'absolute';
    hiddenInput.style.left = '-9999px';
    hiddenInput.style.opacity = '0';
    hiddenInput.style.height = '0';
    hiddenInput.style.width = '0';

    document.body.appendChild(hiddenInput);

    // 先聚焦到隐藏输入框，再点击 iframe
    setTimeout(function() {
        hiddenInput.focus();
        console.log('隐藏输入框已聚焦');

        // 模拟点击 iframe
        setTimeout(function() {
            iframe.click();
            console.log('已模拟点击 iframe');

            // 清理隐藏输入框
            setTimeout(function() {
                document.body.removeChild(hiddenInput);
            }, 100);
        }, 50);
    }, 100);
}