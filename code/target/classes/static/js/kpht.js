var idd;
function getList() {
    $('#name').val("");
    $('#power').val("");
    $.ajax({
        type: 'post',
        url: '/kpht/getList',
        success: function (res) {
            console.log('=== 调试信息开始 ===');
            console.log('API响应状态:', res.code);
            console.log('API响应消息:', res.msg);
            console.log('完整响应数据:', res);
            if (res.code == 200) {
                setTable(res.data);
                $("#userTable").colResizable({
                    liveDrag: true,
                    gripInnerHtml: "<div class='grip'></div>",
                    draggingClass: "dragging",
                    resizeMode: 'fit'
                });
                if (res.data && res.data.length > 0) {
                    let maxId = Math.max(...res.data.map(item => item.id));
                    idd = maxId;
                }
            }
        },
        error: function (xhr, status, error) {
            console.error('请求失败:', error);
        }
    });
}

$(function () {
    getList();

    //条件查询
    $('#select-btn').click(function () {
        var name = $('#name').val();
        console.log('查询条件 - 姓名:', name);

        $ajax({
            type: 'post',
            url: '/kpht/queryList',
            data: {
                name: name  // 只传递姓名参数
            }
        }, true, '', function (res) {
            console.log('查询响应:', res);
            if (res.code == 200) {
                console.log('查询到的数据:', res.data);
                setTable(res.data);
                swal("查询成功", "找到 " + res.data.length + " 条记录", "success");
            } else {
                swal("查询失败", res.msg, "error");
            }
        })
    });

    //刷新
    $("#refresh-btn").click(function () {
        getList();
        swal("刷新成功", "已显示所有数据", "success");
    });

    //点击删除按钮
    $('#delete-btn').click(function () {
        var msg = confirm("确认要删除吗？");
        if (msg) {
            let rows = getTableSelection("#userTable");
            if (rows.length == 0) {
                swal('请选择要删除的数据！');
                return;
            }
            let idList = [];
            $.each(rows, function (index, row) {
                idList.push(row.data.id)
            });
            $ajax({
                type: 'post',
                url: '/kpht/delete',
                data: JSON.stringify({
                    idList: idList
                }),
                dataType: 'json',
                contentType: 'application/json;charset=utf-8'
            }, false, '', function (res) {
                if (res.code == 200) {
                    swal("", res.msg, "success");
                    getList();
                }else if(res.code == 403){
                    swal("删除失败,权限不足,管理员权限可以删除");
                } else {
                    swal("", res.msg, "error");
                }
            })
        }
    })
});

// 单元格编辑功能
function enableCellEditing() {
    $('#userTable').on('click', 'td.editable', function() {
        var $cell = $(this);
        var $row = $cell.closest('tr');

        // 如果已经在编辑状态，则不再重复创建
        if ($cell.find('input, select').length > 0) {
            return;
        }

        var originalValue = $cell.text().trim();

        // 修复：正确获取字段名
        var colIndex = $cell.index();
        var $headerTh = $('#userTable thead th').eq(colIndex);

        // 方法1：从data-field属性获取
        var field = $headerTh.attr('data-field') || $headerTh.data('field');

        // 方法2：如果还获取不到，从表格配置中获取
        if (!field) {
            var tableOptions = $('#userTable').bootstrapTable('getOptions');
            if (tableOptions && tableOptions.columns && tableOptions.columns[colIndex]) {
                field = tableOptions.columns[colIndex].field;
            }
        }

        // 方法3：如果还获取不到，从列的field属性获取
        if (!field) {
            field = $headerTh.find('[data-field]').attr('data-field');
        }

        console.log('字段信息:', {
            colIndex: colIndex,
            field: field,
            headerHtml: $headerTh.html(),
            headerTh: $headerTh
        });

        // 修改：使用Bootstrap Table的API获取行数据和ID
        var rowIndex = $row.data('index');
        var tableData = $('#userTable').bootstrapTable('getData');
        var rowData = tableData[rowIndex];
        var rowId = rowData ? rowData.id : null;

        console.log('编辑信息:', {
            field: field,
            rowId: rowId,
            originalValue: originalValue,
            rowIndex: rowIndex
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
            createSelectEditor($cell, originalValue, field, rowId, tableData, rowIndex);
        } else {
            createInputEditor($cell, originalValue, field, rowId, tableData, rowIndex);
        }
    });
}


// 创建下拉框编辑器（针对对账状态字段）
function createSelectEditor($cell, originalValue, field, rowId, tableData, rowIndex) {
    var $select = $('<select class="form-control cell-edit-select">')
        .css({
            width: '100%',
            height: '100%',
            border: '1px solid #007bff',
            borderRadius: '3px',
            padding: '2px 5px'
        });

    // 添加选项 - 保持只有"已开票"状态
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
            url: '/kpht/updateField',
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
                    tableData[rowIndex][field] = newValue;
                    // 注释掉这行，避免重新加载表格中断编辑状态
                    getList();
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

// 创建输入框编辑器
function createInputEditor($cell, originalValue, field, rowId, tableData, rowIndex) {
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
            url: '/kpht/updateField',
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
                    tableData[rowIndex][field] = newValue;
                    getList();
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


//页面渲染数据
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
        rowAttributes: function(row, index) {
            return {
                'data-index': index,
                'data-id': row.id
            };
        },
        columns: [
            {
                field: 'c',
                title: '业务单位',
                align: 'center',
                sortable: true,
                width: 120,  // 根据内容调整宽度
                class: 'editable'
            }, {
                field: 'd',
                title: '合同号',
                align: 'center',
                sortable: true,
                width: 120,
                class: 'editable'
            }, {
                field: 'e',
                title: '任务号',
                align: 'center',
                sortable: true,
                width: 120,
                class: 'editable'
            }, {
                field: 'hetongzhuangtai',
                title: '对账状态',
                align: 'center',
                sortable: true,
                width: 120,
                class: 'editable',
                formatter: function(value, row, index) {
                    // 显示当前值
                    return value || '';
                },
                cell: {
                    // 添加下拉框编辑
                    type: 'select',
                    options: [
                        {value: '已对账', text: '已对账'},
                        {value: '未开票', text: '未开票'}
                    ]
                }
            }, {
                field: 'g',
                title: '工序',
                align: 'center',
                sortable: true,
                width: 100,
                class: 'editable'
            }, {
                field: 'h',
                title: '名称',
                align: 'center',
                sortable: true,
                width: 120,
                class: 'editable'
            }, {
                field: 'i',
                title: '图号',
                align: 'center',
                sortable: true,
                width: 120,
                class: 'editable'
            }, {
                field: 'j',
                title: '单位',
                align: 'center',
                sortable: true,
                width: 80,
                class: 'editable'
            }, {
                field: 'k',
                title: '数量',
                align: 'center',
                sortable: true,
                width: 80,
                class: 'editable'
            }, {
                field: 'l',
                title: '材质',
                align: 'center',
                sortable: true,
                width: 100,
                class: 'editable'
            },{
                field: 'au',
                title: '出库单号',
                align: 'center',
                sortable: true,
                width: 120,
                class: 'editable'
            },  {
                field: 'av',
                title: '序合计',
                align: 'center',
                sortable: true,
                width: 100,
                class: 'editable'
            }, {
                field: 'aw',
                title: '重量',
                align: 'center',
                sortable: true,
                width: 80,
                class: 'editable'
            }, {
                field: 'ax',
                title: '工件尺寸',
                align: 'center',
                sortable: true,
                width: 120,
                class: 'editable'
            }, {
                field: 'm',
                title: '单价元',
                align: 'center',
                sortable: true,
                width: 100,
                class: 'editable'
            }, {
                field: 'n',
                title: '合计金额',
                align: 'center',
                sortable: true,
                width: 120,
                class: 'editable'
            }, {
                field: 'o',
                title: '铣工时',
                align: 'center',
                sortable: true,
                width: 100,
                class: 'editable'
            }, {
                field: 'p',
                title: '铣单价',
                align: 'center',
                sortable: true,
                width: 100,
                class: 'editable'
            }, {
                field: 'q',
                title: '车工时',
                align: 'center',
                sortable: true,
                width: 100,
                class: 'editable'
            }, {
                field: 'r',
                title: '车单价',
                align: 'center',
                sortable: true,
                width: 100,
                class: 'editable'
            }, {
                field: 's',
                title: '钳工时',
                align: 'center',
                sortable: true,
                width: 100,
                class: 'editable'
            }, {
                field: 't',
                title: '钳单价',
                align: 'center',
                sortable: true,
                width: 100,
                class: 'editable'
            }, {
                field: 'u',
                title: '整件外委工时',
                align: 'center',
                sortable: true,
                width: 140,
                class: 'editable'
            }, {
                field: 'v',
                title: '整件外委单位',
                align: 'center',
                sortable: true,
                width: 140,
                class: 'editable'
            }, {
                field: 'w',
                title: '外委工时',
                align: 'center',
                sortable: true,
                width: 100,
                class: 'editable'
            }, {
                field: 'x',
                title: '外委单价',
                align: 'center',
                sortable: true,
                width: 100,
                class: 'editable'
            }, {
                field: 'y',
                title: '镗工时',
                align: 'center',
                sortable: true,
                width: 100,
                class: 'editable'
            }, {
                field: 'z',
                title: '镗单价',
                align: 'center',
                sortable: true,
                width: 100,
                class: 'editable'
            }, {
                field: 'aa',
                title: '割工时',
                align: 'center',
                sortable: true,
                width: 100,
                class: 'editable'
            }, {
                field: 'ab',
                title: '割单价',
                align: 'center',
                sortable: true,
                width: 100,
                class: 'editable'
            }, {
                field: 'ac',
                title: '磨工时',
                align: 'center',
                sortable: true,
                width: 100,
                class: 'editable'
            }, {
                field: 'ad',
                title: '磨单价',
                align: 'center',
                sortable: true,
                width: 100,
                class: 'editable'
            }, {
                field: 'ae',
                title: '数控铣工时',
                align: 'center',
                sortable: true,
                width: 120,
                class: 'editable'
            }, {
                field: 'af',
                title: '数控铣单价',
                align: 'center',
                sortable: true,
                width: 120,
                class: 'editable'
            }, {
                field: 'ag',
                title: '立车',
                align: 'center',
                sortable: true,
                width: 80,
                class: 'editable'
            }, {
                field: 'ah',
                title: '立车单价',
                align: 'center',
                sortable: true,
                width: 100,
                class: 'editable'
            }, {
                field: 'ai',
                title: '电火花',
                align: 'center',
                sortable: true,
                width: 100,
                class: 'editable'
            }, {
                field: 'aj',
                title: '电火花单价',
                align: 'center',
                sortable: true,
                width: 120,
                class: 'editable'
            }, {
                field: 'ak',
                title: '中走丝',
                align: 'center',
                sortable: true,
                width: 100,
                class: 'editable'
            }, {
                field: 'al',
                title: '中走丝单价',
                align: 'center',
                sortable: true,
                width: 120,
                class: 'editable'
            }, {
                field: 'am',
                title: '下料',
                align: 'center',
                sortable: true,
                width: 80,
                class: 'editable'
            }, {
                field: 'an',
                title: '深孔钻',
                align: 'center',
                sortable: true,
                width: 100,
                class: 'editable'
            }, {
                field: 'ao',
                title: '回厂日期',
                align: 'center',
                sortable: true,
                width: 120,
                class: 'editable'
            }, {
                field: 'ap',
                title: '出厂日期',
                align: 'center',
                sortable: true,
                width: 120,
                class: 'editable'
            }, {
                field: 'ay',
                title: '订单要求交货时间',
                align: 'center',
                sortable: true,
                width: 160,
                class: 'editable'
            }, {
                field: 'aq',
                title: '铣',
                align: 'center',
                sortable: true,
                width: 80,
                class: 'editable'
            }, {
                field: 'ar',
                title: '车',
                align: 'center',
                sortable: true,
                width: 80,
                class: 'editable'
            }, {
                field: 'aas',
                title: '登记员',
                align: 'center',
                sortable: true,
                width: 100,
                class: 'editable'
            }, {
                field: 'at',
                title: '备注',
                align: 'center',
                sortable: true,
                width: 150,
                class: 'editable'
            }
        ],
        onClickRow: function (row, $element) {
            let isSelect = $element.hasClass('selected')
            if (isSelect) {
                $element.removeClass('selected')
            } else {
                $element.addClass('selected')
            }
        },
        onPostBody: function() {
            // 表格渲染完成后启用单元格编辑
            enableCellEditing();
        }
    });

    // 强制刷新表格视图
    $('#userTable').bootstrapTable('load', data);
    $('#userTable').bootstrapTable('resetView');
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

// 创建输入框编辑器
function createInputEditor($cell, originalValue, field, rowId, tableData, rowIndex) {
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
            url: '/kpht/updateField',
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
                    tableData[rowIndex][field] = newValue;
                    getList();
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