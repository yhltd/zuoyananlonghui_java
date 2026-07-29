var idd;

$(function () {

    console.log('页面初始化完成');
    // // 初始化员工下拉框
    loadEmployeeList();

    // 设置默认日期（保持 yyyy-MM-dd 格式）
    var date = new Date();
    date.setMonth(date.getMonth() - 3);
    var year = date.getFullYear();
    var month = ('0' + (date.getMonth() + 1)).slice(-2);
    var day = ('0' + date.getDate()).slice(-2);
    var ks = year + '-' + month + '-' + day;
    document.getElementById("ksrq").value = "";

    var jsDate = new Date();
    jsDate.setMonth(jsDate.getMonth() + 1);
    var jsyear = jsDate.getFullYear();
    var jsmonth = ('0' + (jsDate.getMonth() + 1)).slice(-2);
    var jsday = ('0' + jsDate.getDate()).slice(-2);
    var js = jsyear + '-' + jsmonth + '-' + jsday;
    document.getElementById("jsrq").value = "";


    $('#select-btn').click(function () {
        var ksrq = $('#ksrq').val();
        var jsrq = $('#jsrq').val();
        var m = $('#yg').val();


        swal({
            title: "加载中",
            text: "正在查询数据...",
            icon: "info",
            buttons: false,
            closeOnClickOutside: false
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
            swal.close();
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

    // ==================== 导出功能按钮事件绑定 ====================

    // 详细数据导出按钮事件
    $('#export-detail-btn').off('click').on('click', function() {
        console.log('导出详细数据按钮被点击');
        showExportModal('detail');
    });

    // 汇总数据导出按钮事件
    $('#export-summary-btn').off('click').on('click', function() {
        console.log('导出汇总数据按钮被点击');
        showExportModal('summary');
    });

    // 确认导出按钮事件
    $('#confirm-export-btn').off('click').on('click', function() {
        console.log('确认导出按钮被点击');
        var filename = $('#export-filename').val().trim();
        var dateFormat = $('#export-date-format').val();
        var exportType = $('#export-type').val();

        if (!filename) {
            swal('请输入文件名');
            return;
        }

        // 添加日期后缀
        if (dateFormat !== 'none') {
            var dateSuffix = formatDate(new Date(), dateFormat);
            filename += '_' + dateSuffix;
        }

        // 确保文件名以.xlsx结尾
        if (!filename.toLowerCase().endsWith('.xlsx')) {
            filename += '.xlsx';
        }

        $('#exportModal').modal('hide');

        // 根据类型调用不同的导出函数
        if (exportType === 'detail') {
            exportDetailToExcel(filename);
        } else if (exportType === 'summary') {
            exportSummaryToExcel(filename);
        }
    });
});

// ==================== 导出功能函数 ====================

// 显示导出设置模态框
function showExportModal(type) {
    var defaultFileName = '';
    var modalTitle = '';

    if (type === 'detail') {
        defaultFileName = '员工工时详细_' + getCurrentDate();
        modalTitle = '导出详细数据设置';
    } else if (type === 'summary') {
        defaultFileName = '员工工时汇总_' + getCurrentDate();
        modalTitle = '导出汇总数据设置';
    }

    $('#exportModalTitle').text(modalTitle);
    $('#export-filename').val(defaultFileName);
    $('#export-type').val(type);
    $('#exportModal').modal('show');
}

// 获取当前日期
function getCurrentDate() {
    var now = new Date();
    var year = now.getFullYear();
    var month = String(now.getMonth() + 1).padStart(2, '0');
    var day = String(now.getDate()).padStart(2, '0');
    return year + month + day;
}

// 日期格式化函数
function formatDate(date, format) {
    var d = new Date(date);
    var year = d.getFullYear();
    var month = String(d.getMonth() + 1).padStart(2, '0');
    var day = String(d.getDate()).padStart(2, '0');

    switch(format) {
        case 'YYYYMMDD':
            return year + month + day;
        case 'YYYY-MM-DD':
            return year + '-' + month + '-' + day;
        case 'YYYY年MM月DD日':
            return year + '年' + month + '月' + day + '日';
        default:
            return year + month + day;
    }
}

// 导出详细数据到Excel
function exportDetailToExcel(filename) {
    console.log('开始导出详细数据Excel:', filename);

    showExportLoading('detail');

    // 获取当前查询条件
    var ksrq = $('#ksrq').val() || '';
    var jsrq = $('#jsrq').val() || '';
    var m = $('#yg').val() || '';

    console.log('详细数据导出查询条件:', {
        ksrq: ksrq,
        jsrq: jsrq,
        m: m
    });

    // 获取所有详细数据
    $ajax({
        type: 'post',
        url: '/yggs/queryList',
        data: {
            ksrq: ksrq,
            jsrq: jsrq,
            m: m,
            pageSize: 9999999 // 获取所有数据
        }
    }, true, '正在导出详细数据...', function (res) {
        hideExportLoading('detail');

        console.log('详细数据响应:', res);
        if (res.code == 200 && res.data && res.data.length > 0) {
            console.log('获取到详细数据，开始导出:', res.data.length, '条记录');
            createDetailExcelFile(res.data, filename);
        } else {
            swal('没有详细数据可以导出');
        }
    });
}

// 导出汇总数据到Excel
function exportSummaryToExcel(filename) {
    console.log('开始导出汇总数据Excel:', filename);

    showExportLoading('summary');

    // 获取当前查询条件
    var ksrq1 = $('#ksrq1').val() || '';
    var jsrq1 = $('#jsrq1').val() || '';

    console.log('汇总数据导出查询条件:', {
        ksrq1: ksrq1,
        jsrq1: jsrq1
    });

    // 获取所有汇总数据
    $.ajax({
        type: 'POST',
        url: '/yggs/queryList1',
        data: {
            ksrq1: ksrq1,
            jsrq1: jsrq1
        },
        success: function(res) {
            hideExportLoading('summary');

            console.log('汇总数据响应:', res);
            if (res.code == 200 && res.data && res.data.length > 0) {
                console.log('获取到汇总数据，开始导出:', res.data.length, '条记录');
                createSummaryExcelFile(res.data, filename);
            } else {
                swal('没有汇总数据可以导出');
            }
        },
        error: function(xhr, status, error) {
            hideExportLoading('summary');
            console.error('汇总数据导出请求错误:', error);
            swal("导出失败", "错误: " + error, "error");
        }
    });
}

// 创建详细数据Excel文件
function createDetailExcelFile(data, filename) {
    try {
        // 检查 SheetJS 是否已加载
        if (typeof XLSX === 'undefined') {
            swal('导出功能初始化失败，请刷新页面重试');
            return;
        }

        // 准备Excel数据 - 根据详细表格列顺序
        var excelData = data.map(function(item) {
            return {
                '工序名称': item.j || '',
                '工序内容': item.k || '',
                '合计工时': item.l ? parseFloat(item.l).toFixed(2) : '0.00',
                '员工签名': item.m || '',
                '完工时间': item.n || '',
                '检验盖章': item.o || '',
                '备注': item.p || '',
                '查询日期范围': ($('#ksrq').val() || '全部') + ' 至 ' + ($('#jsrq').val() || '全部'),
                '查询员工': $('#yg').val() || '全部'
            };
        });

        // 创建包含统计信息的工作表
        var wb = XLSX.utils.book_new();

        // 创建工作表
        var ws = XLSX.utils.json_to_sheet(excelData);

        // 设置列宽
        var colWidths = [
            { wch: 15 }, // 工序名称
            { wch: 20 }, // 工序内容
            { wch: 12 }, // 合计工时
            { wch: 12 }, // 员工签名
            { wch: 15 }, // 完工时间
            { wch: 12 }, // 检验盖章
            { wch: 20 }, // 备注
            { wch: 25 }, // 查询日期范围
            { wch: 15 }  // 查询员工
        ];
        ws['!cols'] = colWidths;

        // 添加统计信息（添加在数据后面）
        var totalHours = calculateTotalHours(data);
        var hourlyWage = parseFloat($('#hourly-wage').val()) || 30;
        var totalSalary = totalHours * hourlyWage;

        var stats = [
            { '项目': '总计', '值': '' },
            { '项目': '总记录数', '值': data.length },
            { '项目': '总工时（小时）', '值': totalHours.toFixed(2) },
            { '项目': '小时工资（元/小时）', '值': hourlyWage.toFixed(2) },
            { '项目': '总工资（元）', '值': totalSalary.toFixed(2) }
        ];

        // 计算数据结束位置
        var dataEndRow = data.length + 2; // +2 因为标题行和空行

        // 添加空行
        XLSX.utils.sheet_add_json(ws, [{}], { origin: -1 });

        // 添加统计信息
        XLSX.utils.sheet_add_json(ws, stats, { origin: -1 });

        // 添加工作表
        XLSX.utils.book_append_sheet(wb, ws, '员工工时详细');

        // 导出文件
        XLSX.writeFile(wb, filename);

        console.log('详细数据Excel文件导出成功:', filename);

        // 显示成功消息
        setTimeout(function() {
            swal(`详细数据导出成功！\n文件名：${filename}\n总记录：${data.length}条\n总工资：¥${totalSalary.toFixed(2)}`);
        }, 500);

    } catch (error) {
        console.error('创建详细数据Excel文件错误:', error);
        swal('导出失败: ' + error.message);
    }
}

// 创建汇总数据Excel文件
function createSummaryExcelFile(data, filename) {
    try {
        // 检查 SheetJS 是否已加载
        if (typeof XLSX === 'undefined') {
            swal('导出功能初始化失败，请刷新页面重试');
            return;
        }

        // 准备Excel数据 - 根据汇总表格列顺序
        var excelData = data.map(function(item) {
            return {
                '员工姓名': item.m || '',
                '总工时': item.l ? parseFloat(item.l).toFixed(2) : '0.00',
                '查询日期范围': ($('#ksrq1').val() || '全部') + ' 至 ' + ($('#jsrq1').val() || '全部')
            };
        });

        // 计算总计
        var totalHours = data.reduce(function(sum, item) {
            return sum + (parseFloat(item.l) || 0);
        }, 0);

        var hourlyWage = parseFloat($('#hourly-wage').val()) || 30;
        var totalSalary = totalHours * hourlyWage;

        // 创建包含统计信息的工作表
        var wb = XLSX.utils.book_new();

        // 创建工作表
        var ws = XLSX.utils.json_to_sheet(excelData);

        // 设置列宽
        var colWidths = [
            { wch: 15 }, // 员工姓名
            { wch: 12 }, // 总工时
            { wch: 25 }  // 查询日期范围
        ];
        ws['!cols'] = colWidths;

        // 计算数据结束位置
        var dataEndRow = data.length + 2;

        // 添加空行
        XLSX.utils.sheet_add_json(ws, [{}], { origin: -1 });

        // 添加统计信息
        var stats = [
            { '项目': '总计', '值': '' },
            { '项目': '员工总数', '值': data.length },
            { '项目': '总工时（小时）', '值': totalHours.toFixed(2) },
            { '项目': '小时工资（元/小时）', '值': hourlyWage.toFixed(2) },
            { '项目': '总工资（元）', '值': totalSalary.toFixed(2) }
        ];
        XLSX.utils.sheet_add_json(ws, stats, { origin: -1 });

        // 添加工作表
        XLSX.utils.book_append_sheet(wb, ws, '员工工时汇总');

        // 导出文件
        XLSX.writeFile(wb, filename);

        console.log('汇总数据Excel文件导出成功:', filename);

        // 显示成功消息
        setTimeout(function() {
            swal(`汇总数据导出成功！\n文件名：${filename}\n员工数：${data.length}人\n总工资：¥${totalSalary.toFixed(2)}`);
        }, 500);

    } catch (error) {
        console.error('创建汇总数据Excel文件错误:', error);
        swal('导出失败: ' + error.message);
    }
}

// 计算总工时的辅助函数
function calculateTotalHours(data) {
    if (!data || data.length === 0) {
        return 0;
    }

    return data.reduce(function(sum, item) {
        return sum + (parseFloat(item.l) || 0);
    }, 0);
}

// 显示导出加载中
function showExportLoading(type) {
    var btnId = type === 'detail' ? '#export-detail-btn' : '#export-summary-btn';
    var btnText = type === 'detail' ? '导出详细数据' : '导出汇总数据';

    $(btnId).prop('disabled', true).html('<i class="bi bi-hourglass-split me-2"></i> 导出中...');

    // 添加加载提示
    if (!$('#export-loading').length) {
        $('body').append(`
            <div id="export-loading" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(0,0,0,0.8); color: white; padding: 20px; border-radius: 5px; z-index: 9999;">
                <div style="text-align: center;">
                    <i class="bi bi-hourglass-split" style="font-size: 24px;"></i>
                    <div style="margin-top: 10px;">正在准备导出${btnText}，请稍候...</div>
                </div>
            </div>
        `);
    }
}

// 隐藏导出加载中
function hideExportLoading(type) {
    var btnId = type === 'detail' ? '#export-detail-btn' : '#export-summary-btn';
    var btnText = type === 'detail' ? '详细数据' : '汇总数据';

    $(btnId).prop('disabled', false).html(`<i class="bi bi-file-earmark-excel me-2"></i> 导出${btnText}`);
    $('#export-loading').remove();
}

// ==================== 原有代码保持不变 ====================

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
    swal({
        title: "加载中",
        text: "正在查询数据...",
        icon: "info",
        buttons: false,
        closeOnClickOutside: false
    });

    $.ajax({
        type: 'POST',
        url: '/yggs/queryList1',
        data: {
            ksrq1: ksrq1,
            jsrq1: jsrq1
        },
        success: function(res) {
            swal.close();
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

function loadEmployeeList() {
    console.log('开始加载员工列表...');

    $ajax({
        type: 'post',
        url: '/yggs/getygname',
        contentType: 'application/json',
        dataType: 'json'
    }, false, '', function(res) {
        if (res.code === 200) {
            console.log('获取员工列表成功:', res.data);

            var $select = $('#yg');
            $select.empty(); // 清空现有选项
            $select.append('<option value="">请选择员工</option>');

            if (res.data && Array.isArray(res.data)) {
                // 遍历数据，从m字段获取员工姓名
                res.data.forEach(function(item) {
                    // 安全地获取m字段的值
                    var employeeName = item && item.m;

                    // 检查是否为有效的字符串
                    if (employeeName != null && employeeName !== '') {
                        // 转换为字符串并去除首尾空格
                        var nameStr = String(employeeName).trim();
                        if (nameStr !== '') {
                            $select.append(
                                '<option value="' + nameStr + '">' +
                                nameStr +
                                '</option>'
                            );
                        }
                    }
                });

                console.log('已加载 ' + res.data.length + ' 个员工选项');
            } else {
                console.warn('员工数据格式异常:', res.data);
                $select.append('<option value="">暂无员工数据</option>');
            }
        } else {
            console.error('获取员工列表失败:', res.msg);
            $('#yg').html('<option value="">加载失败</option>');
        }
    });
}