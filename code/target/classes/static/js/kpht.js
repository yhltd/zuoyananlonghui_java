var idd;
var currentPage = 1;
var pageSize = 20;
var totalCount = 0;
var totalPages = 0;

function getList(page, size, searchParams) {
    $('#name').val("");
    $('#power').val("");
    currentPage = page || currentPage;
    pageSize = size || pageSize;
    searchParams = searchParams || {};
    $ajax({
            type: 'post',
            url: '/kpht/getList',
            contentType: 'application/json',
            data: JSON.stringify({
                pageNum: currentPage,
                pageSize: pageSize,
                C: searchParams.C || '',
                hetongzhuangtai: searchParams.hetongzhuangtai || '',// 订单号（后端需要但前端没有，传空）
            }),
            dataType: 'json'
        }, false, '', function (res) {
        if (res.code === 200) {
            setTable(res.data.records);
            totalCount = res.data.total;
            totalPages = res.data.pages;
            updatePagination();
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
        } else {
            console.error("查询失败:", res.message);
        }
    });
}

$(function () {
    getList(currentPage, pageSize, {});

    // 绑定搜索事件
    $('#select-btn').off('click').on('click', function() {
        searchDdmx();
    });

    //刷新
    $("#refresh-btn").click(function () {
        getList();
        swal("刷新成功", "已显示所有数据", "success");
    });

    // 导出按钮事件
    $('#export-btn').off('click').on('click', function() {
        console.log('导出Excel');
        showExportModal();
    });

    // 绑定确认导出事件
    $('#confirm-export-btn').off('click').on('click', function() {
        var filename = $('#export-filename').val().trim();
        var dateFormat = $('#export-date-format').val();

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
        exportToExcel(filename);
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

    // 延迟初始化表格拖动滚动
    setTimeout(function() {
        initTableDragScroll();
    }, 1000);

    // 监听表格刷新事件
    $(document).on('post-body.bs.table', function(e, data) {
        if ($(e.target).is('#userTable')) {
            console.log('表格已刷新，重新初始化拖动滚动');
            setTimeout(function() {
                initTableDragScroll();
            }, 300);
        }
    });
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
        // if (field === 'hetongzhuangtai') {
        //     createSelectEditor($cell, originalValue, field, rowId, tableData, rowIndex);
        // } else {
        //     createInputEditor($cell, originalValue, field, rowId, tableData, rowIndex);
        // }
        // 所有字段都使用输入框编辑器（将对账状态也改为手动输入）
        createInputEditor($cell, originalValue, field, rowId, tableData, rowIndex);
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
        pagination: false, // 关键修改：禁用分页
        clickToSelect: false, // 禁用默认的点击选择
        height: 400,                    // 必须设置高度
        fixedHeader: true,
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
            },
            {
                field: 'lingjianhao',
                title: '零件号',
                align: 'center',
                sortable: true,
                width: 120,
                class: 'editable'
            },{
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
                field: 'xianshiji',
                title: '铣实际工时',
                align: 'center',
                sortable: true,
                width: 100,
                class: 'editable'
            },{
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
                field: 'cheshiji',
                title: '车实际工时',
                align: 'center',
                sortable: true,
                width: 100,
                class: 'editable'
            },{
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
            },{
                field: 'qianshiji',
                title: '钳实际工时',
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
            },{
                field: 'tangshiji',
                title: '镗实际工时',
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
            },{
                field: 'geshiji',
                title: '割实际工时',
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
                field: 'moshiji',
                title: '磨实际工时',
                align: 'center',
                sortable: true,
                width: 100,
                class: 'editable'
            },{
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
            },{
                field: 'skxshiji',
                title: '数控铣实际工时',
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
                field: 'licheshiji',
                title: '立车实际工时',
                align: 'center',
                sortable: true,
                width: 100,
                class: 'editable'
            },{
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
                field: 'dianhuohuashiji',
                title: '电火花实际工时',
                align: 'center',
                sortable: true,
                width: 120,
                class: 'editable'
            },{
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
            },{
                field: 'zhongzuosishiji',
                title: '中走丝实际工时',
                align: 'center',
                sortable: true,
                width: 120,
                class: 'editable'
            },{
                field: 'jingmixianqiege',
                title: '精密线切割',
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
            },{
                field: 'hanjiegongshi', // 注意：这里用的是 hanjiegongshi 而不是 am
                title: '焊接工时',
                align: 'center',
                sortable: true,
                width: 100,
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
            // 延迟初始化表格拖动滚动
            setTimeout(function() {
                initTableDragScroll();
            }, 300);
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

// 更新分页控件
function updatePagination() {
    $('#paginationContainer').remove();

    var paginationHtml = `
        <div id="paginationContainer" class="pagination-container">
            <div class="pagination-info">
                共 <span class="total-count">${totalCount}</span> 条记录，
                第 <span class="current-page">${currentPage}</span> 页 / 共 <span class="total-pages">${totalPages}</span> 页
            </div>
            <div class="pagination-controls">
                <button class="pagination-btn first-page" ${currentPage === 1 ? 'disabled' : ''}>首页</button>
                <button class="pagination-btn prev-page" ${currentPage === 1 ? 'disabled' : ''}>上一页</button>
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
                <button class="pagination-btn next-page" ${currentPage === totalPages ? 'disabled' : ''}>下一页</button>
                <button class="pagination-btn last-page" ${currentPage === totalPages ? 'disabled' : ''}>末页</button>
                <div class="page-size-selector">
                    <select class="page-size-select">
                        <option value="10" ${pageSize === 10 ? 'selected' : ''}>10条/页</option>
                        <option value="20" ${pageSize === 20 ? 'selected' : ''}>20条/页</option>
                        <option value="50" ${pageSize === 50 ? 'selected' : ''}>50条/页</option>
                        <option value="100" ${pageSize === 100 ? 'selected' : ''}>100条/页</option>
                    </select>
                </div>
            </div>
        </div>`;

    $('#userTable11').after(paginationHtml);
    bindPaginationEvents();
}

// 绑定分页事件
function bindPaginationEvents() {
    $('.first-page').click(function() {
        if (!$(this).prop('disabled')) {
            currentPage = 1;
            getList(currentPage, pageSize, getSearchParams());
        }
    });

    $('.prev-page').click(function() {
        if (!$(this).prop('disabled')) {
            currentPage--;
            getList(currentPage, pageSize, getSearchParams());
        }
    });

    $('.next-page').click(function() {
        if (!$(this).prop('disabled')) {
            currentPage++;
            getList(currentPage, pageSize, getSearchParams());
        }
    });

    $('.last-page').click(function() {
        if (!$(this).prop('disabled')) {
            currentPage = totalPages;
            getList(currentPage, pageSize, getSearchParams());
        }
    });

    $('.page-number').click(function() {
        var page = parseInt($(this).text());
        if (page !== currentPage) {
            currentPage = page;
            getList(currentPage, pageSize, getSearchParams());
        }
    });

    $('.page-size-select').change(function() {
        pageSize = parseInt($(this).val());
        currentPage = 1;
        getList(currentPage, pageSize, getSearchParams());
    });

    $('.jump-btn').click(function() {
        var targetPage = parseInt($('.page-jump-input').val());
        if (targetPage && targetPage >= 1 && targetPage <= totalPages) {
            currentPage = targetPage;
            getList(currentPage, pageSize, getSearchParams());
        } else {
            swal('请输入有效的页码（1-' + totalPages + '）');
        }
    });

    $('.page-jump-input').keypress(function(e) {
        if (e.which === 13) {
            $('.jump-btn').click();
        }
    });
}

// 获取搜索参数
function getSearchParams() {
    return {
        C: $('#name').val() || '',    // 订单号
        hetongzhuangtai: $('#hetongZhuangtai').val() || '',    // 订单号
    };
}

function searchDdmx() {
    var searchParams = getSearchParams();
    currentPage = 1;
    getList(currentPage, pageSize, searchParams);
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


// ==================== 导出功能 ====================

// 显示导出设置模态框
function showExportModal() {
    var defaultFileName = '开票合同_' + getCurrentDate();
    $('#export-filename').val(defaultFileName);
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

// 导出到Excel功能
function exportToExcel(filename) {
    console.log('开始导出Excel:', filename);

    showExportLoading();

    // 获取所有数据（注意：这里需要根据实际接口调整）
    $ajax({
        type: 'post',
        url: '/kpht/getList', // 使用开票合同接口
        contentType: 'application/json',
        data: JSON.stringify({
            pageNum: 1,
            pageSize: 9999999,
            C: $('#name').val() || '' // 如果有搜索条件也带上
        }),
        dataType: 'json'
    }, false, '', function (res) {
        hideExportLoading();

        if (res.code === 200 && res.data && res.data.records && res.data.records.length > 0) {
            console.log('获取到数据，开始导出:', res.data.records.length, '条记录');
            createExcelFile(res.data.records, filename);
        } else {
            swal('没有数据可以导出');
        }
    });
}

// 创建Excel文件
function createExcelFile(data, filename) {
    try {
        // 检查 SheetJS 是否已加载
        if (typeof XLSX === 'undefined') {
            swal('导出功能初始化失败，请刷新页面重试');
            return;
        }

        // 准备Excel数据 - 根据表格列顺序
        var excelData = data.map(function(item) {
            return {
                '业务单位': item.c || '',
                '合同号': item.d || '',
                '任务号': item.e || '',
                '零件号': item.lingjianhao || '',
                '对账状态': item.hetongzhuangtai || '',
                '工序': item.g || '',
                '名称': item.h || '',
                '图号': item.i || '',
                '单位': item.j || '',
                '数量': item.k || '',
                '材质': item.l || '',
                '出库单号': item.au || '',
                '序合计': item.av || '',
                '重量': item.aw || '',
                '工件尺寸': item.ax || '',
                '单价元': item.m || '',
                '合计金额': item.n || '',
                '铣工时': item.o || '',
                '铣单价': item.p || '',
                '实际工时（铣）': item.xianshiji || '',
                '车工时': item.q || '',
                '车单价': item.r || '',
                '实际工时（车）': item.cheshiji || '',
                '钳工时': item.s || '',
                '钳单价': item.t || '',
                '实际工时（钳）': item.qianshiji || '',
                '整件外委工时': item.u || '',
                '整件外委单位': item.v || '',
                '外委工时': item.w || '',
                '外委单价': item.x || '',
                '镗工时': item.y || '',
                '镗单价': item.z || '',
                '实际工时（镗）': item.tangshiji || '',
                '割工时': item.aa || '',
                '割单价': item.ab || '',
                '实际工时（割）': item.geshiji || '',
                '磨工时': item.ac || '',
                '磨单价': item.ad || '',
                '实际工时（磨）': item.moshiji || '',
                '数控铣工时': item.ae || '',
                '数控铣单价': item.af || '',
                '实际工时（数控铣）': item.skxshiji || '',
                '立车': item.ag || '',
                '立车单价': item.ah || '',
                '实际工时（立车）': item.licheshiji || '',
                '电火花': item.ai || '',
                '电火花单价': item.aj || '',
                '实际工时（电火花）': item.dianhuohuashiji || '',
                '中走丝': item.ak || '',
                '中走丝单价': item.al || '',
                '实际工时（中走丝）': item.zhongzuosishiji || '',
                '精密线切割': item.jingmixianqiege || '',
                '下料': item.am || '',
                '深孔钻': item.an || '',
                '回厂日期': item.ao || '',
                '出厂日期': item.ap || '',
                '订单要求交货时间': item.ay || '',
                '铣': item.aq || '',
                '车': item.ar || '',
                '登记员': item.aas || '',
                '备注': item.at || ''
            };
        });

        // 创建工作簿
        var wb = XLSX.utils.book_new();

        // 创建工作表
        var ws = XLSX.utils.json_to_sheet(excelData);

        // 设置列宽
        var colWidths = [
            { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 },
            { wch: 10 }, { wch: 15 }, { wch: 15 }, { wch: 8 },
            { wch: 8 }, { wch: 10 }, { wch: 12 }, { wch: 12 },
            { wch: 10 }, { wch: 8 }, { wch: 12 }, { wch: 10 },
            { wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 10 },
            { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 12 },
            { wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 10 },
            { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 },
            { wch: 12 }, { wch: 12 }, { wch: 8 }, { wch: 10 },
            { wch: 10 }, { wch: 12 }, { wch: 10 }, { wch: 12 },
            { wch: 10 }, { wch: 10 }, { wch: 12 }, { wch: 12 },
            { wch: 16 }, { wch: 8 }, { wch: 8 }, { wch: 10 },
            { wch: 15 }
        ];
        ws['!cols'] = colWidths;

        // 添加工作表
        XLSX.utils.book_append_sheet(wb, ws, '开票合同记录');

        // 导出文件
        XLSX.writeFile(wb, filename);

        console.log('Excel文件导出成功:', filename);

        // 显示成功消息
        setTimeout(function() {
            swal(`导出成功！\n文件名：${filename}`);
        }, 500);

    } catch (error) {
        console.error('创建Excel文件错误:', error);
        swal('导出失败: ' + error.message);
    }
}

// 显示导出加载中
function showExportLoading() {
    $('#export-btn').prop('disabled', true).html('<i class="bi bi-hourglass-split icon"></i> 导出中...');

    // 添加加载提示
    if (!$('#export-loading').length) {
        $('body').append(`
            <div id="export-loading" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(0,0,0,0.8); color: white; padding: 20px; border-radius: 5px; z-index: 9999;">
                <div style="text-align: center;">
                    <i class="bi bi-hourglass-split" style="font-size: 24px;"></i>
                    <div style="margin-top: 10px;">正在准备导出数据，请稍候...</div>
                </div>
            </div>
        `);
    }
}

// 隐藏导出加载中
function hideExportLoading() {
    $('#export-btn').prop('disabled', false).html('<i class="bi bi-file-earmark-excel icon"></i> 导出Excel');
    $('#export-loading').remove();
}

function initTableDragScroll() {
    console.log('初始化表格拖动滚动...');

    // 查找表格容器
    const tableContainer = document.querySelector('.fixed-table-body') ||
        document.querySelector('.table-responsive') ||
        document.querySelector('.bootstrap-table .fixed-table-container');

    if (!tableContainer) {
        console.warn('找不到表格容器');
        return;
    }

    console.log('找到表格容器:', tableContainer);

    let isDragging = false;
    let startX;
    let startY;
    let scrollLeft;
    let scrollTop;

    // 鼠标按下事件 - 开始拖动
    tableContainer.addEventListener('mousedown', function(e) {
        // 只有在表格有水平滚动条时才启用拖动
        if (tableContainer.scrollWidth <= tableContainer.clientWidth) {
            return;
        }

        isDragging = true;
        startX = e.pageX;
        startY = e.pageY;
        scrollLeft = tableContainer.scrollLeft;
        scrollTop = tableContainer.scrollTop;

        // 添加拖动样式
        tableContainer.style.cursor = 'grabbing';
        tableContainer.style.userSelect = 'none';

        // 防止文本选择
        document.body.style.userSelect = 'none';
        document.body.style.cursor = 'grabbing';

        e.preventDefault();
        e.stopPropagation();
    });

    // 鼠标移动事件 - 拖动滚动
    tableContainer.addEventListener('mousemove', function(e) {
        if (!isDragging) return;

        e.preventDefault();

        const x = e.pageX;
        const y = e.pageY;
        const walkX = (x - startX) * 2; // 乘以2增加拖动速度
        const walkY = (y - startY) * 2;

        tableContainer.scrollLeft = scrollLeft - walkX;
        tableContainer.scrollTop = scrollTop - walkY;
    });

    // 鼠标释放事件 - 停止拖动
    tableContainer.addEventListener('mouseup', function() {
        if (isDragging) {
            isDragging = false;
            tableContainer.style.cursor = 'grab';
            tableContainer.style.userSelect = 'auto';
            document.body.style.userSelect = 'auto';
            document.body.style.cursor = 'default';
        }
    });

    // 鼠标离开容器时释放拖动
    tableContainer.addEventListener('mouseleave', function() {
        if (isDragging) {
            isDragging = false;
            tableContainer.style.cursor = 'grab';
            tableContainer.style.userSelect = 'auto';
            document.body.style.userSelect = 'auto';
            document.body.style.cursor = 'default';
        }
    });

    // 设置初始光标样式
    tableContainer.style.cursor = 'grab';

    // 阻止默认的拖拽行为
    tableContainer.addEventListener('dragstart', function(e) {
        e.preventDefault();
        return false;
    });

    console.log('表格拖动滚动初始化完成');
}