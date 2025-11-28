
var idd;

// 添加 queryList 函数定义
function queryList() {
    // // 初始查询逻辑，可以留空或者执行一些初始化操作
    // console.log('页面初始化完成，执行 queryList');
}
function queryList1() {
    // // 初始查询逻辑，可以留空或者执行一些初始化操作
    // console.log('页面初始化完成，执行 queryList');
}


$(function () {
    queryList();

    // 初始查询或其它初始化逻辑
    console.log('页面初始化完成');

    // // 初始化员工下拉框
    // initEmployeeSelect();

    // 设置默认日期（保持 yyyy-MM-dd 格式）
    var date = new Date();
    date.setMonth(date.getMonth() - 3);
    var year = date.getFullYear();
    var month = ('0' + (date.getMonth() + 1)).slice(-2);
    var day = ('0' + date.getDate()).slice(-2);
    var ks = year + '-' + month + '-' + day;
    document.getElementById("ksrq").value = ks;

    var jsDate = new Date();
    jsDate.setMonth(jsDate.getMonth() + 1);
    var jsyear = jsDate.getFullYear();
    var jsmonth = ('0' + (jsDate.getMonth() + 1)).slice(-2);
    var jsday = ('0' + jsDate.getDate()).slice(-2);
    var js = jsyear + '-' + jsmonth + '-' + jsday;
    document.getElementById("jsrq").value = js;


    $('#select-btn').click(function () {
        var ksrq = $('#ksrq').val();
        var jsrq = $('#jsrq').val();
        var m = $('#yg').val();


        // 添加调试信息
        console.log('查询条件:', {
            ksrq: ksrq,
            jsrq: jsrq,
            m: m,

        });

        // 如果日期为空，传递空字符串而不是null
        ksrq = ksrq || '';
        jsrq = jsrq || '';

        $ajax({
            type: 'post',
            url: '/yggs/queryList',
            data: {
                ksrq: ksrq,
                jsrq: jsrq,
                m: m || ''
            }
        }, true, '查询中...', function (res) {
            console.log('查询响应:', res);
            if (res.code == 200) {
                console.log('查询到的数据:', res.data);
                setTable(res.data);

                // 添加这一行：计算并显示工时统计
                calculateSalary(res.data);

                // 添加查询成功提示
                swal("查询成功", "找到 " + res.data.length + " 条记录", "success");
            } else {
                // 添加查询失败提示
                swal("查询失败", res.msg, "error");
            }
        })
    });
});

// 计算总工时和工资的函数
function calculateSalary(data) {
    if (!data || data.length === 0) {
        $('#salary-stats').hide();
        return;
    }

    // 计算总工时（假设工时数据在 l 字段）
    let totalHours = 0;
    data.forEach(item => {
        if (item.l && !isNaN(parseFloat(item.l))) {
            totalHours += parseFloat(item.l);
        }
    });

    // 获取小时工资（从输入框获取）
    const hourlyWage = parseFloat($('#hourly-wage').val()) || 0;

    // 计算总工资
    const totalSalary = totalHours * hourlyWage;

    // 更新显示
    $('#total-hours').text(totalHours.toFixed(2) + ' 小时');
    $('#total-salary').text('¥' + totalSalary.toFixed(2));

    // 显示工资统计区域
    $('#salary-stats').show();

    console.log('工资统计:', {
        总工时: totalHours,
        小时工资: hourlyWage,
        总工资: totalSalary
    });
}

// 小时工资输入框变化时重新计算
$('#hourly-wage').on('input', function() {
    const data = $('#userTable').bootstrapTable('getData');
    if (data && data.length > 0) {
        calculateSalary(data);
    }
});

// 刷新按钮事件
$('#refresh-btn').click(function() {
    $('#select-btn').click(); // 重新查询
});


// function initEmployeeSelect() {
//     $ajax({
//         type: 'post',
//         url: '/Yggs/getEmployees', // 需要创建这个接口
//     }, false, '', function (res) {
//         if (res.code == 200) {
//             var select = $('#yg');
//             select.empty();
//             select.append('<option value="">请选择员工</option>');
//             res.data.forEach(function(emp) {
//                 select.append('<option value="' + emp + '">' + emp + '</option>');
//             });
//         }
//     });
// }



function setTable(data) {
    // 确保表格容器存在
    if ($('#userTable').length === 0) {
        console.error('表格元素 #userTable 不存在');
        return;
    }

    // 销毁现有表格
    if ($('#userTable').hasClass('bootstrap-table')) {
        $('#userTable').bootstrapTable('destroy');
    }

    // 初始化表格
    $('#userTable').bootstrapTable({
        data: data,
        sortStable: true,
        classes: 'table table-hover table-bordered',
        idField: 'id',
        pagination: true,
        pageSize: 15,
        clickToSelect: true,
        locale: 'zh-CN',
        columns: [
            {
                field: 'j',  // 小写 c - 对应姓名
                title: '工序名称',
                align: 'center',
                sortable: true,
                width: 100,
            }, {
                field: 'k',  // 小写 d - 对应用户名
                title: '工序内容',
                align: 'center',
                sortable: true,
                width: 100,
            }, {
                field: 'l',  // 小写 e - 对应密码
                title: '合计工时',
                align: 'center',
                sortable: true,
                width: 100,
            }, {
                field: 'm',  // 小写 f - 对应权限
                title: '员工签名',
                align: 'center',
                sortable: true,
                width: 100,
            },{
                field: 'n',  // 小写 e - 对应密码
                title: '完工时间',
                align: 'center',
                sortable: true,
                width: 100,
            },{
                field: 'o',  // 小写 e - 对应密码
                title: '检验盖章',
                align: 'center',
                sortable: true,
                width: 100,
            },{
                field: 'p',  // 小写 e - 对应密码
                title: '备注',
                align: 'center',
                sortable: true,
                width: 100,
            }
        ],
        onClickRow: function (row, el) {
            let isSelect = $(el).hasClass('selected')
            if (isSelect) {
                $(el).removeClass('selected')
            } else {
                $(el).addClass('selected')
            }
        }
    });

    // 强制刷新表格视图
    $('#userTable').bootstrapTable('load', data);
    $('#userTable').bootstrapTable('resetView');
}

$('#select-btn1').click(function () {
    var ksrq1 = $('#ksrq1').val();
    var jsrq1 = $('#jsrq1').val();

    console.log('汇总查询条件:', {
        ksrq1: ksrq1,
        jsrq1: jsrq1
    });

    ksrq1 = ksrq1 || '';
    jsrq1 = jsrq1 || '';

    console.log('准备发送AJAX请求到: /yggs/queryList1');

    $.ajax({
        type: 'POST',
        url: '/yggs/queryList1',
        data: {
            ksrq1: ksrq1,
            jsrq1: jsrq1
        },
        success: function(res) {
            console.log('AJAX 请求成功:', res);
            if (res.code == 200) {
                setSummaryTable(res.data);
                swal("汇总查询成功", "找到 " + res.data.length + " 个员工的工时记录", "success");
            } else {
                swal("汇总查询失败", res.msg, "error");
            }
        },
        error: function(xhr, status, error) {
            console.error('AJAX 请求错误:', error);
            console.log('状态码:', xhr.status);
            swal("请求失败", "错误: " + error, "error");
        }
    })
})

// 设置汇总表格函数
function setSummaryTable(data) {
    // 确保表格容器存在
    if ($('#summaryTable').length === 0) {
        console.error('汇总表格元素 #summaryTable 不存在');
        return;
    }

    // 处理空数据
    if (!data || data.length === 0) {
        if ($('#summaryTable').hasClass('bootstrap-table')) {
            $('#summaryTable').bootstrapTable('destroy');
        }
        $('#summaryTable').html('<div class="text-center p-3">暂无汇总数据</div>');
        return;
    }

    // 销毁现有表格
    if ($('#summaryTable').hasClass('bootstrap-table')) {
        $('#summaryTable').bootstrapTable('destroy');
    }

    // 初始化汇总表格
    $('#summaryTable').bootstrapTable({
        data: data,
        sortStable: true,
        classes: 'table table-hover table-bordered',
        pagination: true,
        pageSize: 15,
        clickToSelect: true,
        locale: 'zh-CN',
        columns: [
            {
                field: 'm',
                title: '员工姓名',
                align: 'center',
                sortable: true,
                width: 100,
            }, {
                field: 'l',
                title: '总工时',
                align: 'center',
                sortable: true,
                width: 100,
                formatter: function(value) {
                    if (value !== null && value !== undefined) {
                        return parseFloat(value).toFixed(2);
                    }
                    return '0.00';
                }
            }
        ],
        onClickRow: function (row, el) {
            let isSelect = $(el).hasClass('selected')
            if (isSelect) {
                $(el).removeClass('selected')
            } else {
                $(el).addClass('selected')
            }
        }
    });

    // 强制刷新表格视图
    $('#summaryTable').bootstrapTable('load', data);
    $('#summaryTable').bootstrapTable('resetView');
}
