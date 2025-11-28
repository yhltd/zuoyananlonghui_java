var idd;
let count = 1;

function getList() {
    // $('#ksrq').val("");
    // $('#jsrq').val("");

    var date = new Date();
    date.setMonth(date.getMonth()-3);
    var year = date.getFullYear();
    var month = ('0'+(date.getMonth()+1)).slice(-2);
    var day = ('0'+date.getDate()).slice(-2);
    var ks = year+'-'+month+'-'+day
    var jsyear = date.getFullYear();
    var jsmonth = ('0'+(date.getMonth()+4)).slice(-2);
    var jsday = ('0'+date.getDate()).slice(-2);
    var js = jsyear+'-'+jsmonth+'-'+jsday

    $ajax({
        type: 'post',
        url: '/pzb/getList',
    }, false, '', function (res) {
        if (res.code == 200) {
            setTable(res.data);
            $("#ysyfTable").colResizable({
                liveDrag: true,
                gripInnerHtml: "<div class='grip'></div>",
                draggingClass: "dragging",
                resizeMode: 'fit'
            });
            // var table = document.getElementById("ysyfTable");
            // var rows = table.rows;
            // var cells = table.cells;
            // var colums = table.rows[0].cells.length;
            // for(var x=1;x<colums;x++){
            //     var zje = 0;
            //     for(var j = 1;j<rows.length-1;j++){
            //         var a = parseInt(rows[j].cells[10].innerHTML);
            //         zje = zje+a
            //     }
            //     document.getElementById('zje').value = zje
            // }
            // for (i=0;i<=res.data.id;i++){
            //     idd=i;
            // }
        }
    })
}

$(function () {
    getList();

    var date = new Date();
    date.setMonth(date.getMonth()-3);
    var year = date.getFullYear();
    var month = ('0'+(date.getMonth()+1)).slice(-2);
    var day = ('0'+date.getDate()).slice(-2);
    var ks = year+'-'+month+'-'+day
    var jsyear = date.getFullYear();
    var jsmonth = ('0'+(date.getMonth()+4)).slice(-2);
    var jsday = ('0'+date.getDate()).slice(-2);
    var js = jsyear+'-'+jsmonth+'-'+jsday


















//点击新增按钮
    $('#add-btn').click(function () {
        addNewRow();
    });
    //点击关闭按钮
    $('#add-t-close-btn').click(function () {
        $('#qhd-modal').modal('hide');
    });


// 添加新行
    function addNewRow() {
        var newRow = {
            // 没有id字段，表示新增
            c: '',  // 工艺员
            d: '',  // 校对员
            e: '',  // 批准
            // 注意：不包含id字段
        };

        // 添加到表格
        $('#ysyfTable').bootstrapTable('append', newRow);
        console.log('新增一行');
    }















    //刷新
    $("#refresh-btn").click(function () {
        getList();
    });

    //点击删除按钮
    $('#delete-btn').click(function () {
        var msg = confirm("确认要删除吗？");
        if (msg) {
            let rows = getTableSelection("#ysyfTable");
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
                url: '/pzb/delete',
                data: JSON.stringify({
                    idList: idList
                }),
                dataType: 'json',
                contentType: 'application/json;charset=utf-8'
            }, false, '', function (res) {
                if (res.code == 200) {
                    swal("", res.msg, "success");
                    getList();
                } else {
                    swal("", res.msg, "error");
                }
            })
        }
    })
});
function setTable(data) {
    if ($('#ysyfTable').html != '') {
        $('#ysyfTable').bootstrapTable('load', data);
    }

$('#ysyfTable').bootstrapTable({
    data: data,
    sortStable: true,
    classes: 'table table-hover text-nowrap table table-bordered',
    idField: 'id',
    pagination: true,
    pageSize: 15,
    clickToSelect: true,
    locale: 'zh-CN',
    toolbar: '#table-toolbar',
    toolbarAlign: 'left',
    theadClasses: "thead-light",
    style:'table-layout:fixed',
    columns: [
        {
            field: '',
            title: '序号',
            align: 'center',
            width: 50,
            formatter: function (value, row, index) {
                return index + 1;
            }
        },
        {
            field: 'c',
            title: '工艺员',
            align: 'center',
            sortable: true,
            width: 80,
            formatter: function(value, row, index) {
                // 修正：data-field 应该是 'c'
                return '<div contenteditable="true" class="editable-cell" data-field="c" data-index="' + index + '">' + (value || '') + '</div>';
            }
        }, {
            field: 'd',
            title: '校对员',
            align: 'center',
            sortable: true,
            width: 80,
            formatter: function(value, row, index) {
                // 这个是对的：data-field = 'd'
                return '<div contenteditable="true" class="editable-cell" data-field="d" data-index="' + index + '">' + (value || '') + '</div>';
            }
        }, {
            field: 'e',
            title: '批准',
            align: 'center',
            sortable: true,
            width: 130,
            formatter: function(value, row, index) {
                // 修正：data-field 应该是 'e'
                return '<div contenteditable="true" class="editable-cell" data-field="e" data-index="' + index + '">' + (value || '') + '</div>';
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
    },

    // 添加这个回调，在表格加载完成后绑定事件
    onPostBody: function() {
        bindCellEditEvents();
    }
})
}


// 新增数据到后端（新增的函数）
function sendCellAddToServer(addData) {
    console.log('发送新增数据:', addData);

    // 将数据转换为 JSON 字符串
    var jsonData = JSON.stringify({
        c: addData.rowData.c || '',
        d: addData.rowData.d || '',
        e: addData.rowData.e || ''
    });

    console.log('新增JSON字符串:', jsonData);

    $ajax({
        type: 'post',
        url: '/pzb/add',  // 你的新增接口
        data: jsonData,  // 直接发送 JSON 字符串
        contentType: 'application/json; charset=utf-8',  // 重要：设置内容类型
        dataType: 'json',
        traditional: true
    }, false, '', function (res) {
        if (res.code == 200) {
            console.log('新增成功');
            // 成功后，更新行的id
            if (res.data && res.data.id) {
                updateRowId(addData.rowIndex, res.data.id);
            }
        } else {
            console.error('新增失败:', res.message);
            restoreCellValue(addData);
        }
    }).fail(function(xhr, status, error) {
        console.error('新增请求失败:', error);
        restoreCellValue(addData);
    });
}

// 更新行的id（新增成功后）
function updateRowId(rowIndex, newId) {
    var allData = $('#ysyfTable').bootstrapTable('getData');
    if (allData[rowIndex]) {
        allData[rowIndex].id = newId;
        $('#ysyfTable').bootstrapTable('updateRow', {
            index: rowIndex,
            row: allData[rowIndex]
        });
        console.log('行ID更新为:', newId);
    }
}
// 发送单元格更新到后端
// 发送单元格更新到后端
function sendCellUpdateToServer(updateData) {
    console.log('发送单元格更新:', updateData);

    // 将数据转换为 JSON 字符串
    var jsonData = JSON.stringify({
        id: updateData.id,
        field: updateData.field,
        value: updateData.value
    });

    console.log('JSON字符串:', jsonData);

    $ajax({
        type: 'post',
        url: '/pzb/update',  // 你的后端接口
        data: jsonData,  // 直接发送 JSON 字符串
        contentType: 'application/json; charset=utf-8',  // 重要：设置内容类型
        dataType: 'json',
        traditional: true
    }, false, '', function (res) {
        if (res.code == 200) {
            console.log('单元格更新成功');
        } else {
            console.error('单元格更新失败:', res.message);
            restoreCellValue(updateData);
        }
    }).fail(function(xhr, status, error) {
        console.error('请求失败:', error);
        restoreCellValue(updateData);
    });
}

// 恢复单元格原值（更新失败时使用）
function restoreCellValue(updateData) {
    var $cell = $('.editable-cell[data-index="' + updateData.rowIndex + '"][data-field="' + updateData.field + '"]');
    var originalValue = updateData.originalValue || '';
    $cell.text(originalValue);

    // 同时更新本地数据
    var allData = $('#ysyfTable').bootstrapTable('getData');
    var rowData = allData[updateData.rowIndex];
    if (rowData) {
        rowData[updateData.field] = originalValue;
    }
}

// 绑定单元格编辑事件 - 发送数据到后端
function bindCellEditEvents() {
    $(document).on('blur', '.editable-cell', function() {
        var $cell = $(this);
        var newValue = $cell.text().trim();
        var field = $cell.data('field');    // 'c', 'd', 'e'
        var rowIndex = $cell.data('index'); // 行索引

        // 获取整行数据
        var allData = $('#ysyfTable').bootstrapTable('getData');
        var rowData = allData[rowIndex];

        if (rowData) {
            // 保存原值（用于失败时恢复）
            var originalValue = rowData[field] || '';

            // 先更新本地数据
            rowData[field] = newValue;

            // 判断是修改还是新增
            if (rowData.id) {
                // 有id，调用修改接口（保持原逻辑不变）
                sendCellUpdateToServer({
                    id: rowData.id,        // 行的ID
                    field: field,          // 字段名：'c', 'd', 'e'
                    value: newValue,       // 新值
                    rowIndex: rowIndex,    // 行索引
                    originalValue: originalValue  // 原值（用于恢复）
                });
            } else {
                // 没有id，调用新增接口
                sendCellAddToServer({
                    rowData: rowData,      // 整行数据
                    field: field,          // 当前修改的字段
                    value: newValue,       // 新值
                    rowIndex: rowIndex,    // 行索引
                    originalValue: originalValue  // 原值（用于恢复）
                });
            }
        } else {
            console.error('无法获取行数据');
        }
    });

    // 保持原来的回车键处理
    $(document).on('keydown', '.editable-cell', function(e) {
        if (e.keyCode === 13) { // 回车键
            e.preventDefault();
            $(this).blur();
        }
    });
}




function setTable1(data) {
    if ($('#show-qhd-table').html != '') {
        $('#show-qhd-table').bootstrapTable('load', data);
    }

    $('#show-qhd-table').bootstrapTable({
        data: data,
        sortStable: true,
        classes: 'table table-hover',
        idField: 'id',
        pagination: true,
        search: true,
        searchAlign: 'left',
        clickToSelect: false,
        locale: 'zh-CN',
        singleSelect: true,
        columns: [
            {
                checkbox: true
            }, {
                field: '',
                title: '序号',
                align: 'center',
                width: 50,
                formatter: function (value, row, index) {
                    return index + 1;
                }
            }, {
                field: 'gyy',
                title: '工艺员',
                align: 'center',
                sortable: true,
                width: 80,
            }, {
                field: 'jdy',
                title: '校对员',
                align: 'center',
                sortable: true,
                width: 80,
            }, {
                field: 'pz',
                title: '批准',
                align: 'center',
                sortable: true,
                width: 130,
            }
            // , {
            //     field: 'bh',
            //     title: '编号',
            //     align: 'center',
            //     sortable: true,
            //     width: 0,
            // }
            // }, {
            //     field: 'bh',
            //     title: '编号',
            //     align: 'center',
            //     sortable: true,
            //     width: 0,
            // }
        ],
        // onClickRow: function (row, el) {
        //     let isSelect = $(el).hasClass('selected')
        //     if (isSelect) {
        //         $(el).removeClass('selected')
        //     } else {
        //         $(el).addClass('selected')
        //     }
        // }
    })
}

