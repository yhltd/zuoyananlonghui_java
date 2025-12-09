var idd;
var currentPage = 1;
var pageSize = 20;
var totalCount = 0;
var totalPages = 0;

function getList(page) {
    // 如果有传入页码参数，更新当前页码
    if (page) {
        currentPage = page;
    }

    // 获取查询条件
    var name = $('#name').val() || '';
    var hetongZhuangtai = $('#hetongZhuangtai').val() || '';
    var hetongHao = $('#hetongHao').val() || '';
    var renwuHao = $('#renwuHao').val() || '';

    console.log('查询条件:', {
        pageNum: currentPage,
        pageSize: pageSize,
        name: name,
        hetongZhuangtai: hetongZhuangtai,
        hetongHao: hetongHao,
        renwuHao: renwuHao
    });

    // 构建查询参数
    var params = {
        pageNum: currentPage,
        pageSize: pageSize
    };

    // 添加查询条件
    if (name) params.name = name;
    if (hetongZhuangtai) params.hetongZhuangtai = hetongZhuangtai;
    if (hetongHao) params.hetongHao = hetongHao;
    if (renwuHao) params.renwuHao = renwuHao;

    $.ajax({
        type: 'post',
        url: '/ywc/getList',
        data: JSON.stringify(params),
        contentType: 'application/json',
        dataType: 'json',
        success: function (res) {
            console.log('=== 调试信息开始 ===');
            console.log('API响应状态:', res.code);
            console.log('API响应消息:', res.msg);
            console.log('完整响应数据:', res);
            if (res.code == 200) {
                // 处理分页数据
                var data = res.data.records || res.data.list || res.data;
                totalCount = res.data.total || 0;
                totalPages = res.data.totalPages || res.data.pages || 1;

                // 使用简单表格渲染，避免 bootstrap-table 的分页问题
                setTableSimple(data);
                updatePagination();

                // 添加列可调整功能
                if ($("#userTable").data('colResizable')) {
                    $("#userTable").colResizable({
                        liveDrag: true,
                        gripInnerHtml: "<div class='grip'></div>",
                        draggingClass: "dragging",
                        resizeMode: 'fit'
                    });
                }

                if (data && data.length > 0) {
                    let maxId = Math.max(...data.map(item => item.id));
                    idd = maxId;
                }

                // 如果有查询条件，显示查询结果提示
                if (name || hetongZhuangtai || hetongHao || renwuHao) {
                    console.log('查询完成，找到 ' + totalCount + ' 条记录');
                }
            }
        },
        error: function (xhr, status, error) {
            console.error('请求失败:', error);
        }
    });
}

function getSelectedRows() {
    var selectedRows = [];
    $('#userTable tbody tr.selected').each(function() {
        var rowId = $(this).data('id');
        var rowData = {
            id: rowId,
            data: {} // 如果需要其他数据，可以在这里添加
        };
        // 如果需要获取其他单元格数据，可以遍历 td
        $(this).find('td').each(function(index) {
            // 跳过第一个复选框列
            if (index > 0) {
                var $th = $('#userTable thead th').eq(index);
                var field = $th.data('field') || getFieldFromHeaderText($th.text());
                if (field) {
                    rowData.data[field] = $(this).text().trim();
                }
            }
        });
        selectedRows.push(rowData);
    });
    return selectedRows;
}

$(function () {
    getList();

    //条件查询
    $('#select-btn').click(function () {
        currentPage = 1; // 重置到第一页
        getList(currentPage);
    });

    // 清空按钮
    $('#clear-btn').click(function () {
        $('#name').val('');
        $('#hetongZhuangtai').val('');
        $('#hetongHao').val('');
        $('#renwuHao').val('');
        currentPage = 1;
        getList(currentPage);
    });

    //刷新
    $("#refresh-btn").click(function () {
        currentPage = 1;
        $('#name').val('');
        $('#hetongZhuangtai').val('');
        $('#hetongHao').val('');
        $('#renwuHao').val('');
        getList(currentPage);
        swal("刷新成功", "已显示所有数据", "success");
    });

    //点击删除按钮
    $('#delete-btn').click(function () {
        var msg = confirm("确认要删除吗？");
        if (msg) {
            let selectedRows = getSelectedRows(); // 使用新的选择函数
            if (selectedRows.length == 0) {
                swal('请选择要删除的数据！');
                return;
            }
            let idList = [];
            $.each(selectedRows, function (index, row) {
                idList.push(row.id)
            });
            $ajax({
                type: 'post',
                url: '/ywc/delete',
                data: JSON.stringify({
                    idList: idList
                }),
                dataType: 'json',
                contentType: 'application/json;charset=utf-8'
            }, false, '', function (res) {
                if (res.code == 200) {
                    swal("", res.msg, "success");
                    getList(currentPage);
                } else if(res.code == 403) {
                    swal("删除失败,权限不足,管理员权限可以删除");
                } else {
                    swal("", res.msg, "error");
                }
            })
        }
    })
});

// 单元格编辑功能 - 修改为简单表格版本
function enableCellEditing() {
    $('#userTable').on('click', 'td.editable', function() {
        var $cell = $(this);
        var $row = $cell.closest('tr');

        // 如果已经在编辑状态，则不再重复创建
        if ($cell.find('input, select').length > 0) {
            return;
        }

        var originalValue = $cell.text().trim();

        // 获取字段名 - 简单表格版本
        var colIndex = $cell.index();
        var $headerTh = $('#userTable thead th').eq(colIndex);

        // 从表头获取字段名（需要确保表头有data-field属性）
        var field = $headerTh.data('field') || getFieldFromHeaderText($headerTh.text());

        // 获取行ID
        var rowId = $row.data('id');

        console.log('编辑信息:', {
            field: field,
            rowId: rowId,
            originalValue: originalValue,
            colIndex: colIndex
        });

        // 如果没有获取到字段名或ID，提示错误
        if (!field || field === 'undefined') {
            swal("编辑失败", "无法获取字段名: " + field, "error");
            return;
        }
        if (!rowId) {
            swal("编辑失败", "无法获取行ID，请刷新页面重试", "error");
            return;
        }

        // 特殊处理对账状态字段 - 使用下拉框
        if (field === 'hetongzhuangtai') {
            createSelectEditor($cell, originalValue, field, rowId, $row);
        } else {
            createInputEditor($cell, originalValue, field, rowId, $row);
        }
    });
}

// 根据表头文本获取字段名
function getFieldFromHeaderText(headerText) {
    var fieldMap = {
        '业务单位': 'c',
        '合同号': 'd',
        '任务号': 'e',
        '对账状态': 'hetongzhuangtai',
        '工序': 'g',
        '名称': 'h',
        '图号': 'i',
        '单位': 'j',
        '数量': 'k',
        '材质': 'l',
        '出库单号': 'au',
        '序合计': 'av',
        '重量': 'aw',
        '工件尺寸': 'ax',
        '单价元': 'm',
        '合计金额': 'n',
        '铣工时': 'o',
        '铣单价': 'p',
        '车工时': 'q',
        '车单价': 'r',
        '钳工时': 's',
        '钳单价': 't',
        '整件外委工时': 'u',
        '整件外委单位': 'v',
        '外委工时': 'w',
        '外委单价': 'x',
        '镗工时': 'y',
        '镗单价': 'z',
        '割工时': 'aa',
        '割单价': 'ab',
        '磨工时': 'ac',
        '磨单价': 'ad',
        '数控铣工时': 'ae',
        '数控铣单价': 'af',
        '立车': 'ag',
        '立车单价': 'ah',
        '电火花': 'ai',
        '电火花单价': 'aj',
        '中走丝': 'ak',
        '中走丝单价': 'al',
        '下料': 'am',
        '深孔钻': 'an',
        '回厂日期': 'ao',
        '出厂日期': 'ap',
        '订单要求交货时间': 'ay',
        '铣': 'aq',
        '车': 'ar',
        '登记员': 'aas',
        '备注': 'at'
    };

    return fieldMap[headerText.trim()] || '';
}

// 创建下拉框编辑器（简单表格版本）
function createSelectEditor($cell, originalValue, field, rowId, $row) {
    var $select = $('<select class="form-control cell-edit-select">')
        .css({
            width: '100%',
            height: '100%',
            border: '1px solid #007bff',
            borderRadius: '3px',
            padding: '2px 5px'
        });

    // 添加选项
    $select.append('<option value="">请选择</option>');
    $select.append('<option value="已对账">已对账</option>');
    $select.append('<option value="未对账">未对账</option>');
    $select.append('<option value="已开票">已开票</option>');
    $select.append('<option value="未开票">未开票</option>');

    // 设置当前值
    $select.val(originalValue);

    // 清空单元格内容并添加下拉框
    $cell.empty().append($select);
    $select.focus();

    // 保存编辑
    function saveEdit() {
        var newValue = $select.val();

        // 如果值没有变化，则不保存
        if (newValue === originalValue) {
            $cell.text(originalValue);
            return;
        }

        console.log('发送更新:', { id: rowId, field: field, newValue: newValue });

        // 发送更新请求
        $.ajax({
            type: 'post',
            url: '/ywc/updateField',
            data: JSON.stringify({
                id: rowId,
                [field]: newValue
            }),
            dataType: 'json',
            contentType: 'application/json;charset=utf-8',
            success: function(res) {
                if (res.code == 200) {
                    $cell.text(newValue);
                    // 更新本地数据
                    $row.data(field, newValue);
                    // 重新加载当前页数据
                    getList(currentPage);
                } else {
                    $cell.text(originalValue);
                    swal("更新失败", res.msg, "error");
                }
            },
            error: function(xhr, status, error) {
                $cell.text(originalValue);
                console.error('更新请求失败:', error);
                swal("更新失败", "网络错误，请重试", "error");
            }
        });
    }

    // 绑定事件
    $select.on('blur', saveEdit);
    $select.on('change', saveEdit); // 选择即保存
    $select.on('keydown', function(e) {
        if (e.keyCode === 27) { // ESC键
            $cell.text(originalValue);
        }
    });
}

// 创建输入框编辑器（简单表格版本）
function createInputEditor($cell, originalValue, field, rowId, $row) {
    var $input = $('<input type="text" class="form-control cell-edit-input">')
        .val(originalValue)
        .css({
            width: '100%',
            height: '100%',
            border: '1px solid #007bff',
            borderRadius: '3px',
            padding: '2px 5px'
        });

    // 清空单元格内容并添加输入框
    $cell.empty().append($input);
    $input.focus().select();

    // 保存编辑
    function saveEdit() {
        var newValue = $input.val().trim();

        // 如果值没有变化，则不保存
        if (newValue === originalValue) {
            $cell.text(originalValue);
            return;
        }

        console.log('发送更新:', { id: rowId, field: field, newValue: newValue });

        // 发送更新请求
        $.ajax({
            type: 'post',
            url: '/ywc/updateField',
            data: JSON.stringify({
                id: rowId,
                [field]: newValue
            }),
            dataType: 'json',
            contentType: 'application/json;charset=utf-8',
            success: function(res) {
                if (res.code == 200) {
                    $cell.text(newValue);
                    // 更新本地数据
                    $row.data(field, newValue);
                    // 重新加载当前页数据
                    getList(currentPage);
                } else {
                    $cell.text(originalValue);
                    swal("更新失败", res.msg, "error");
                }
            },
            error: function(xhr, status, error) {
                $cell.text(originalValue);
                console.error('更新请求失败:', error);
                swal("更新失败", "网络错误，请重试", "error");
            }
        });
    }

    // 绑定事件
    $input.on('blur', saveEdit);
    $input.on('keydown', function(e) {
        if (e.keyCode === 13) { // Enter键
            saveEdit();
        } else if (e.keyCode === 27) { // ESC键
            $cell.text(originalValue);
        }
    });
}

// 简单表格渲染函数（类似 setTableSimple）
function setTableSimple(data) {
    console.log('使用简单表格更新，数据长度:', data ? data.length : 0);

    var $table = $('#userTable');
    if (!$table.length) return;

    // 清空表格
    $table.empty();

    // 构建表头（为每个表头添加 data-field 属性）
    var thead = '<thead>' +
        '<tr>' +
        // 添加全选复选框列
        '<th style="width: 50px;"><input type="checkbox" id="selectAll"></th>' +
        '<th width="120" style=" padding: 8px; text-align: center;" data-field="c">业务单位</th>' +
        '<th width="120" style=" padding: 8px; text-align: center;" data-field="d">合同号</th>' +
        '<th width="120" style=" padding: 8px; text-align: center;" data-field="e">任务号</th>' +
        '<th width="120" style=" padding: 8px; text-align: center;" data-field="hetongzhuangtai">对账状态</th>' +
        '<th width="100" style=" padding: 8px; text-align: center;" data-field="g">工序</th>' +
        '<th width="120" style=" padding: 8px; text-align: center;" data-field="h">名称</th>' +
        '<th width="120" style=" padding: 8px; text-align: center;" data-field="i">图号</th>' +
        '<th width="80" style=" padding: 8px; text-align: center;" data-field="j">单位</th>' +
        '<th width="80" style=" padding: 8px; text-align: center;" data-field="k">数量</th>' +
        '<th width="100" style=" padding: 8px; text-align: center;" data-field="l">材质</th>' +
        '<th width="120" style=" padding: 8px; text-align: center;" data-field="au">出库单号</th>' +
        '<th width="100" style=" padding: 8px; text-align: center;" data-field="av">序合计</th>' +
        '<th width="80" style=" padding: 8px; text-align: center;" data-field="aw">重量</th>' +
        '<th width="120" style=" padding: 8px; text-align: center;" data-field="ax">工件尺寸</th>' +
        '<th width="100" style=" padding: 8px; text-align: center;" data-field="m">单价元</th>' +
        '<th width="120" style=" padding: 8px; text-align: center;" data-field="n">合计金额</th>' +
        '<th width="100" style=" padding: 8px; text-align: center;" data-field="o">铣工时</th>' +
        '<th width="100" style=" padding: 8px; text-align: center;" data-field="p">铣单价</th>' +
        '<th width="100" style=" padding: 8px; text-align: center;" data-field="q">车工时</th>' +
        '<th width="100" style=" padding: 8px; text-align: center;" data-field="r">车单价</th>' +
        '<th width="100" style=" padding: 8px; text-align: center;" data-field="s">钳工时</th>' +
        '<th width="100" style=" padding: 8px; text-align: center;" data-field="t">钳单价</th>' +
        '<th width="140" style=" padding: 8px; text-align: center;" data-field="u">整件外委工时</th>' +
        '<th width="140" style=" padding: 8px; text-align: center;" data-field="v">整件外委单位</th>' +
        '<th width="100" style=" padding: 8px; text-align: center;" data-field="w">外委工时</th>' +
        '<th width="100" style=" padding: 8px; text-align: center;" data-field="x">外委单价</th>' +
        '<th width="100" style=" padding: 8px; text-align: center;" data-field="y">镗工时</th>' +
        '<th width="100" style=" padding: 8px; text-align: center;" data-field="z">镗单价</th>' +
        '<th width="100" style=" padding: 8px; text-align: center;" data-field="aa">割工时</th>' +
        '<th width="100" style=" padding: 8px; text-align: center;" data-field="ab">割单价</th>' +
        '<th width="100" style=" padding: 8px; text-align: center;" data-field="ac">磨工时</th>' +
        '<th width="100" style=" padding: 8px; text-align: center;" data-field="ad">磨单价</th>' +
        '<th width="120" style=" padding: 8px; text-align: center;" data-field="ae">数控铣工时</th>' +
        '<th width="120" style=" padding: 8px; text-align: center;" data-field="af">数控铣单价</th>' +
        '<th width="80" style=" padding: 8px; text-align: center;" data-field="ag">立车</th>' +
        '<th width="100" style=" padding: 8px; text-align: center;" data-field="ah">立车单价</th>' +
        '<th width="100" style=" padding: 8px; text-align: center;" data-field="ai">电火花</th>' +
        '<th width="120" style=" padding: 8px; text-align: center;" data-field="aj">电火花单价</th>' +
        '<th width="100" style=" padding: 8px; text-align: center;" data-field="ak">中走丝</th>' +
        '<th width="120" style=" padding: 8px; text-align: center;" data-field="al">中走丝单价</th>' +
        '<th width="80" style=" padding: 8px; text-align: center;" data-field="am">下料</th>' +
        '<th width="100" style=" padding: 8px; text-align: center;" data-field="an">深孔钻</th>' +
        '<th width="120" style=" padding: 8px; text-align: center;" data-field="ao">回厂日期</th>' +
        '<th width="120" style=" padding: 8px; text-align: center;" data-field="ap">出厂日期</th>' +
        '<th width="160" style=" padding: 8px; text-align: center;" data-field="ay">订单要求交货时间</th>' +
        '<th width="80" style=" padding: 8px; text-align: center;" data-field="aq">铣</th>' +
        '<th width="80" style=" padding: 8px; text-align: center;" data-field="ar">车</th>' +
        '<th width="100" style=" padding: 8px; text-align: center;" data-field="aas">登记员</th>' +
        '<th width="150" style=" padding: 8px; text-align: center;" data-field="at">备注</th>' +
        '</tr>' +
        '</thead>';

    // 构建表格内容
    var tbody = '<tbody>';

    if (!data || data.length === 0) {
        tbody += '<tr><td colspan="49" style="text-align: center; padding: 20px;">暂无数据</td></tr>';
    } else {
        for (var i = 0; i < data.length; i++) {
            var item = data[i];
            // 为每一行添加完整的数据对象
            tbody += '<tr data-id="' + (item.id || '') + '" data-row-index="' + i + '">' +
                // 添加一个复选框列
                '<td style="width: 40px;"><input type="checkbox" class="row-checkbox" data-id="' + (item.id || '') + '"></td>' +
                // 修复：为每个可编辑的单元格添加 editable 类
                '<td class="editable" style="border: 1px solid #ddd; padding: 8px; text-align: center;">' + (item.c || '') + '</td>' +
                '<td class="editable" style="border: 1px solid #ddd; padding: 8px; text-align: center;">' + (item.d || '') + '</td>' +
                '<td class="editable" style="border: 1px solid #ddd; padding: 8px; text-align: center;">' + (item.e || '') + '</td>' +
                '<td class="editable" style="border: 1px solid #ddd; padding: 8px; text-align: center;">' + (item.hetongzhuangtai || '') + '</td>' +
                '<td class="editable" style="border: 1px solid #ddd; padding: 8px; text-align: center;">' + (item.g || '') + '</td>' +
                '<td class="editable" style="border: 1px solid #ddd; padding: 8px; text-align: center;">' + (item.h || '') + '</td>' +
                '<td class="editable" style="border: 1px solid #ddd; padding: 8px; text-align: center;">' + (item.i || '') + '</td>' +
                '<td class="editable" style="border: 1px solid #ddd; padding: 8px; text-align: center;">' + (item.j || '') + '</td>' +
                '<td class="editable" style="border: 1px solid #ddd; padding: 8px; text-align: center;">' + (item.k || '') + '</td>' +
                '<td class="editable" style="border: 1px solid #ddd; padding: 8px; text-align: center;">' + (item.l || '') + '</td>' +
                '<td class="editable" style="border: 1px solid #ddd; padding: 8px; text-align: center;">' + (item.au || '') + '</td>' +
                '<td class="editable" style="border: 1px solid #ddd; padding: 8px; text-align: center;">' + (item.av || '') + '</td>' +
                '<td class="editable" style="border: 1px solid #ddd; padding: 8px; text-align: center;">' + (item.aw || '') + '</td>' +
                '<td class="editable" style="border: 1px solid #ddd; padding: 8px; text-align: center;">' + (item.ax || '') + '</td>' +
                '<td class="editable" style="border: 1px solid #ddd; padding: 8px; text-align: center;">' + (item.m || '') + '</td>' +
                '<td class="editable" style="border: 1px solid #ddd; padding: 8px; text-align: center;">' + (item.n || '') + '</td>' +
                '<td class="editable" style="border: 1px solid #ddd; padding: 8px; text-align: center;">' + (item.o || '') + '</td>' +
                '<td class="editable" style="border: 1px solid #ddd; padding: 8px; text-align: center;">' + (item.p || '') + '</td>' +
                '<td class="editable" style="border: 1px solid #ddd; padding: 8px; text-align: center;">' + (item.q || '') + '</td>' +
                '<td class="editable" style="border: 1px solid #ddd; padding: 8px; text-align: center;">' + (item.r || '') + '</td>' +
                '<td class="editable" style="border: 1px solid #ddd; padding: 8px; text-align: center;">' + (item.s || '') + '</td>' +
                '<td class="editable" style="border: 1px solid #ddd; padding: 8px; text-align: center;">' + (item.t || '') + '</td>' +
                '<td class="editable" style="border: 1px solid #ddd; padding: 8px; text-align: center;">' + (item.u || '') + '</td>' +
                '<td class="editable" style="border: 1px solid #ddd; padding: 8px; text-align: center;">' + (item.v || '') + '</td>' +
                '<td class="editable" style="border: 1px solid #ddd; padding: 8px; text-align: center;">' + (item.w || '') + '</td>' +
                '<td class="editable" style="border: 1px solid #ddd; padding: 8px; text-align: center;">' + (item.x || '') + '</td>' +
                '<td class="editable" style="border: 1px solid #ddd; padding: 8px; text-align: center;">' + (item.y || '') + '</td>' +
                '<td class="editable" style="border: 1px solid #ddd; padding: 8px; text-align: center;">' + (item.z || '') + '</td>' +
                '<td class="editable" style="border: 1px solid #ddd; padding: 8px; text-align: center;">' + (item.aa || '') + '</td>' +
                '<td class="editable" style="border: 1px solid #ddd; padding: 8px; text-align: center;">' + (item.ab || '') + '</td>' +
                '<td class="editable" style="border: 1px solid #ddd; padding: 8px; text-align: center;">' + (item.ac || '') + '</td>' +
                '<td class="editable" style="border: 1px solid #ddd; padding: 8px; text-align: center;">' + (item.ad || '') + '</td>' +
                '<td class="editable" style="border: 1px solid #ddd; padding: 8px; text-align: center;">' + (item.ae || '') + '</td>' +
                '<td class="editable" style="border: 1px solid #ddd; padding: 8px; text-align: center;">' + (item.af || '') + '</td>' +
                '<td class="editable" style="border: 1px solid #ddd; padding: 8px; text-align: center;">' + (item.ag || '') + '</td>' +
                '<td class="editable" style="border: 1px solid #ddd; padding: 8px; text-align: center;">' + (item.ah || '') + '</td>' +
                '<td class="editable" style="border: 1px solid #ddd; padding: 8px; text-align: center;">' + (item.ai || '') + '</td>' +
                '<td class="editable" style="border: 1px solid #ddd; padding: 8px; text-align: center;">' + (item.aj || '') + '</td>' +
                '<td class="editable" style="border: 1px solid #ddd; padding: 8px; text-align: center;">' + (item.ak || '') + '</td>' +
                '<td class="editable" style="border: 1px solid #ddd; padding: 8px; text-align: center;">' + (item.al || '') + '</td>' +
                '<td class="editable" style="border: 1px solid #ddd; padding: 8px; text-align: center;">' + (item.am || '') + '</td>' +
                '<td class="editable" style="border: 1px solid #ddd; padding: 8px; text-align: center;">' + (item.an || '') + '</td>' +
                '<td class="editable" style="border: 1px solid #ddd; padding: 8px; text-align: center;">' + (item.ao || '') + '</td>' +
                '<td class="editable" style="border: 1px solid #ddd; padding: 8px; text-align: center;">' + (item.ap || '') + '</td>' +
                '<td class="editable" style="border: 1px solid #ddd; padding: 8px; text-align: center;">' + (item.ay || '') + '</td>' +
                '<td class="editable" style="border: 1px solid #ddd; padding: 8px; text-align: center;">' + (item.aq || '') + '</td>' +
                '<td class="editable" style="border: 1px solid #ddd; padding: 8px; text-align: center;">' + (item.ar || '') + '</td>' +
                '<td class="editable" style="border: 1px solid #ddd; padding: 8px; text-align: center;">' + (item.aas || '') + '</td>' +
                '<td class="editable" style="border: 1px solid #ddd; padding: 8px; text-align: center;">' + (item.at || '') + '</td>' +
                '</tr>';
        }
    }

    tbody += '</tbody>';

    $table.html(thead + tbody);

    // 重新绑定点击事件（行选择）
    $table.find('tbody tr').click(function(e) {
        // 如果点击的是复选框，不触发行选择
        if ($(e.target).is('input[type="checkbox"]') || $(e.target).is('input')) {
            return;
        }
        $(this).toggleClass('selected');
        // 同时同步复选框状态
        var $checkbox = $(this).find('.row-checkbox');
        $checkbox.prop('checked', $(this).hasClass('selected'));
    });

    $table.html(thead + tbody);

    // 绑定全选复选框
    $('#selectAll').click(function() {
        var isChecked = $(this).prop('checked');
        $table.find('.row-checkbox').prop('checked', isChecked);
        if (isChecked) {
            $table.find('tbody tr').addClass('selected');
        } else {
            $table.find('tbody tr').removeClass('selected');
        }
    });

    // 绑定复选框点击事件
    $table.find('.row-checkbox').click(function(e) {
        e.stopPropagation(); // 阻止事件冒泡
        var $row = $(this).closest('tr');
        var isChecked = $(this).prop('checked');
        if (isChecked) {
            $row.addClass('selected');
        } else {
            $row.removeClass('selected');
        }
    });

    // 启用单元格编辑功能
    setTimeout(function() {
        enableCellEditing();
    }, 100);

    console.log('简单表格更新完成');
}

// 工序配置功能
$(function() {
    // 工序配置按钮点击事件
    $('#gongxu-config-btn').click(function() {
        loadGongxuConfig();
    });

    // 关闭按钮事件
    $('#gongxu-close-btn').click(function() {
        $('#gongxu-modal').modal('hide');
    });
});

// 加载工序配置
function loadGongxuConfig() {
    $.ajax({
        type: 'get',
        url: '/gx/getAll',
        success: function(res) {
            console.log('工序配置响应:', res);
            if (res.code == 200) {
                renderGongxuTable(res.data);
                $('#gongxu-modal').modal('show');
            } else {
                swal("加载失败", res.msg, "error");
            }
        },
        error: function(xhr, status, error) {
            console.error('加载工序配置失败:', error);
            swal("加载失败", "网络错误，请重试", "error");
        }
    });
}

// 渲染工序配置表格
function renderGongxuTable(data) {
    var tbody = $('#gongxuTableBody');
    tbody.empty();

    if (data && data.length > 0) {
        $.each(data, function(index, item) {
            var row = $('<tr>');
            row.append('<td>' + item.id + '</td>');
            row.append('<td>' + (item.name || '') + '</td>');
            row.append('<td><input type="text" class="form-control gongxu-num-input" data-id="' + item.id + '" value="' + (item.num || '') + '"></td>');
            row.append('<td><button class="btn btn-sm btn-primary save-gongxu-btn" data-id="' + item.id + '" data-name="' + (item.name || '') + '">保存</button></td>');
            tbody.append(row);
        });

        // 绑定保存按钮事件
        $('.save-gongxu-btn').click(function() {
            var id = $(this).data('id');
            var name = $(this).data('name');
            var num = $(this).closest('tr').find('.gongxu-num-input').val();
            saveGongxuConfig(id, name, num, $(this));
        });

        // 绑定输入框回车事件
        $('.gongxu-num-input').keydown(function(e) {
            if (e.keyCode === 13) { // Enter键
                var id = $(this).data('id');
                var name = $(this).closest('tr').find('td').eq(1).text();
                var num = $(this).val();
                var $btn = $(this).closest('tr').find('.save-gongxu-btn');
                saveGongxuConfig(id, name, num, $btn);
            }
        });
    } else {
        tbody.append('<tr><td colspan="4" class="text-center">暂无数据</td></tr>');
    }
}

// 保存工序配置
function saveGongxuConfig(id, name, num, $btn) {
    if (!num || num.trim() === '') {
        swal("保存失败", "单价不能为空", "error");
        return;
    }

    // 验证数字格式
    if (isNaN(num)) {
        swal("保存失败", "单价必须是数字", "error");
        return;
    }

    var gongxuData = {
        id: id,
        name: name,
        num: num
    };

    console.log('保存工序配置:', gongxuData);

    // 禁用按钮防止重复点击
    $btn.prop('disabled', true).text('保存中...');

    $.ajax({
        type: 'post',
        url: '/gx/update',
        data: JSON.stringify(gongxuData),
        dataType: 'json',
        contentType: 'application/json;charset=utf-8',
        success: function(res) {
            if (res.code == 200) {
                swal("保存成功", "工序单价已更新", "success");
                // 重新加载数据确保显示最新值
                loadGongxuConfig();
            } else {
                swal("保存失败", res.msg, "error");
                $btn.prop('disabled', false).text('保存');
            }
        },
        error: function(xhr, status, error) {
            console.error('保存工序配置失败:', error);
            swal("保存失败", "网络错误，请重试", "error");
            $btn.prop('disabled', false).text('保存');
        }
    });
}


// 更新分页控件
function updatePagination() {
    // 移除现有的分页控件
    $('#customPaginationContainer').remove();

    var paginationHtml = `
        <div id="customPaginationContainer" class="pagination-container">
            <div class="pagination-info">
                共 <span class="total-count">${totalCount}</span> 条记录，
                第 <span class="current-page">${currentPage}</span> 页 / 共 <span class="total-pages">${totalPages}</span> 页
            </div>
            <div class="pagination-controls">
                <button class="pagination-btn first-page" ${currentPage === 1 ? 'disabled' : ''}>
                    <i class="bi bi-chevron-double-left"></i> 首页
                </button>
                <button class="pagination-btn prev-page" ${currentPage === 1 ? 'disabled' : ''}>
                    <i class="bi bi-chevron-left"></i> 上一页
                </button>
                <div class="page-numbers">`;

    var startPage = Math.max(1, currentPage - 2);
    var endPage = Math.min(totalPages, currentPage + 2);

    for (var i = startPage; i <= endPage; i++) {
        if (i === currentPage) {
            paginationHtml += `<button class="page-number active">${i}</button>`;
        } else {
            paginationHtml += `<button class="page-number">${i}</button>`;
        }
    }

    paginationHtml += `
                </div>
                <button class="pagination-btn next-page" ${currentPage === totalPages ? 'disabled' : ''}>
                    下一页 <i class="bi bi-chevron-right"></i>
                </button>
                <button class="pagination-btn last-page" ${currentPage === totalPages ? 'disabled' : ''}>
                    末页 <i class="bi bi-chevron-double-right"></i>
                </button>
                <div class="page-size-selector">
                    <select class="page-size-select form-control form-control-sm" style="width: auto; display: inline-block;">
                        <option value="10" ${pageSize === 10 ? 'selected' : ''}>10条/页</option>
                        <option value="15" ${pageSize === 15 ? 'selected' : ''}>15条/页</option>
                        <option value="20" ${pageSize === 20 ? 'selected' : ''}>20条/页</option>
                        <option value="50" ${pageSize === 50 ? 'selected' : ''}>50条/页</option>
                        <option value="100" ${pageSize === 100 ? 'selected' : ''}>100条/页</option>
                    </select>
                </div>
            </div>
        </div>`;

    // 将分页控件添加到表格后面
    $('#userTable').after(paginationHtml);

    // 绑定分页事件
    bindPaginationEvents();
}

// 绑定分页事件
function bindPaginationEvents() {
    $(document).off('click', '.first-page').on('click', '.first-page', function(e) {
        e.preventDefault();
        if (!$(this).prop('disabled')) {
            getList(1);
        }
    });

    $(document).off('click', '.prev-page').on('click', '.prev-page', function(e) {
        e.preventDefault();
        if (!$(this).prop('disabled')) {
            getList(currentPage - 1);
        }
    });

    $(document).off('click', '.next-page').on('click', '.next-page', function(e) {
        e.preventDefault();
        if (!$(this).prop('disabled')) {
            getList(currentPage + 1);
        }
    });

    $(document).off('click', '.last-page').on('click', '.last-page', function(e) {
        e.preventDefault();
        if (!$(this).prop('disabled')) {
            getList(totalPages);
        }
    });

    $(document).off('click', '.page-number').on('click', '.page-number', function(e) {
        e.preventDefault();
        var page = parseInt($(this).text());
        if (page !== currentPage) {
            getList(page);
        }
    });

    $(document).off('change', '.page-size-select').on('change', '.page-size-select', function(e) {
        e.preventDefault();
        var newPageSize = parseInt($(this).val());
        if (newPageSize !== pageSize) {
            pageSize = newPageSize;
            currentPage = 1;
            getList(currentPage);
        }
    });
}