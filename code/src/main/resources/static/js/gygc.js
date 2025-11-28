


// 在工艺规程页面的JavaScript中
$(document).ready(function() {
    // 从sessionStorage获取数据
    const processData = JSON.parse(sessionStorage.getItem('currentProcessData') || '{}');

    console.log('接收到的工艺规程数据:', processData);

    if (Object.keys(processData).length === 0) {
        swal("注意", "请从合同记录跳转数据，或者执行查询功能", "warning");
        // return;
    }

    // 填充数据到表头
    fillProcessHeader(processData);

    // 添加删除按钮到控制区域
    $('.controls').append('<button id="deleteRow">🗑️ 删除选中行</button>');

    // 表格行点击选中事件
    $(document).on('click', '#processTable tbody tr', function() {
        // 移除其他行的选中状态
        $('#processTable tbody tr').removeClass('selected-row');
        // 添加当前行的选中状态
        $(this).addClass('selected-row');
    });

    document.getElementById('addRow').addEventListener('click', function() {
        const tbody = document.querySelector('#processTable tbody');
        const rows = tbody.querySelectorAll('tr');

        // 获取最后一行的序号并递增
        const lastIndex = parseInt(rows[rows.length - 1].cells[0].textContent);
        const newIndex = lastIndex + 1;

        // 创建新行
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
                <td class="col-1">${newIndex}</td>
                <td class="col-2" contenteditable="true"></td>
                <td class="col-3" contenteditable="true" colspan="3"></td>
                <td class="col-4" contenteditable="true"></td>
                <td class="col-5" contenteditable="true"></td>
                <td class="col-6" contenteditable="true"></td>
                <td class="col-7" contenteditable="true"></td>
                <td class="col-8"  contenteditable="true"></td>
            `;

        // 在最后插入新行
        tbody.appendChild(newRow);
    });

    // 删除选中行
    document.getElementById('deleteRow').addEventListener('click', function() {
        const selectedRow = $('#processTable tbody tr.selected-row');

        if (selectedRow.length === 0) {
            swal("提示", "请先选择要删除的行", "warning");
            return;
        }

        const rowId = selectedRow.data('id');

        if (rowId) {
            // 有id，发送到后端删除
            deleteRowFromBackend(rowId, selectedRow);
        } else {
            // 没有id，直接在前端删除
            deleteRowFromFrontend(selectedRow);
        }
    });

    document.getElementById('printBtn').addEventListener('click', function() {
        window.print();
    });

    document.getElementById('baocun').addEventListener('click', function() {
        saveProcessData();
    });


    // 初始化表格自动添加行功能
    initTableAutoAddRow();

    // 查询按钮点击事件
    const queryBtn = document.getElementById('queryBtn');
    if (queryBtn) {
        queryBtn.addEventListener('click', getList);
    }

    // 搜索按钮点击事件
    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) {
        searchBtn.addEventListener('click', performSearch);
    }

    // 搜索输入框回车事件
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keyup', function(event) {
            if (event.key === 'Enter') {
                performSearch();
            }
        });
    }

    // 关闭弹窗事件
    const closeModal = document.getElementById('closeModal');
    if (closeModal) {
        closeModal.addEventListener('click', function() {
            document.getElementById('queryModal').style.display = 'none';
        });
    }

    // 点击弹窗外部关闭
    window.addEventListener('click', function(event) {
        if (event.target === document.getElementById('queryModal')) {
            document.getElementById('queryModal').style.display = 'none';
        }
    });
});
// 从后端删除行
// 从后端删除行
function deleteRowFromBackend(rowId, selectedRow) {
    swal({
        title: "确认删除",
        text: "确定要删除这行数据吗？",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "确定删除",
        cancelButtonText: "取消",
        closeOnConfirm: false,
        closeOnCancel: true
    }, function(willDelete) {
        if (willDelete) {
            // 显示加载中
            const $deleteBtn = $('#deleteRow');
            const originalText = $deleteBtn.html();
            $deleteBtn.prop('disabled', true).html('<i class="bi bi-arrow-clockwise icon"></i>删除中...');

            // 创建idList数组，即使只有一个id也要放在数组中
            let idList = [rowId];

            $ajax({
                type: 'post',
                url: '/gygc/delete',
                data: JSON.stringify({
                    idList: idList
                }),
                dataType: 'json',
                contentType: 'application/json;charset=utf-8'
            }, false, '', function (res) {
                $deleteBtn.prop('disabled', false).html(originalText);

                if (res.code == 200) {
                    // 后端删除成功，从前端移除该行
                    deleteRowFromFrontend(selectedRow);
                    swal("删除成功", "数据已成功删除", "success");
                } else {
                    swal("删除失败", res.msg || "删除数据失败", "error");
                }
            }, function(xhr, status, error) {
                $deleteBtn.prop('disabled', false).html(originalText);
                console.error('删除请求失败:', error);
                swal("删除失败", "请求失败: " + error, "error");
            });
        }
    });
}

// 从前端删除行
function deleteRowFromFrontend(selectedRow) {
    selectedRow.remove();
    // 重新排序序号
    renumberTableRows();
}

// 重新排序表格行号
function renumberTableRows() {
    const rows = $('#processTable tbody tr');
    rows.each(function(index) {
        $(this).find('td:first').text(index + 1);
    });
}
// 填充数据到工艺规程表格
function fillProcessHeader(data) {
    // 填充表头基本信息
    $('#business-unit').text(data.c || '');      // 业务单位
    $('#task-no').text(data.e || '');            // 任务号
    $('#process-status').text(data.f || '未创建'); // 工艺规程状态
    $('#product-name').text(data.h || '');       // 名称
    $('#drawing-no').text(data.i || '');         // 图号
    $('#quantity').text(data.k || '');           // 数量
    $('#material').text(data.l || '');           // 材质
    $('#contract-no').text(data.d || '');        // 合同号

    // 使用传递过来的id作为htid
    var htid = data.id;

    console.log('查询工艺规程数据，htid:', htid);

    $ajax({
        type: 'post',
        url: '/gygc/queryList',
        data: {
            htid: htid
        }
    }, false, '', function (res) {
        console.log('工艺规程查询响应:', res);
        if (res.code == 200) {
            if (res.data && res.data.length > 0) {
                const firstItem = res.data[0];
                // 设置三个日期字段
                $('#gyrq').val(formatDateForInput(firstItem.r) || '');  // 工艺员日期 - r字段
                $('#jdrq').val(formatDateForInput(firstItem.t) || '');  // 校对员日期 - t字段
                $('#pzrq').val(formatDateForInput(firstItem.v) || '');

                // 设置工艺员、校对员、批准人姓名
                $('#gyy').text(firstItem.q || '');  // 工艺员 - q字段
                $('#jdy').text(firstItem.s || '');  // 校对员 - s字段
                $('#pzr').text(firstItem.u || '');  // 批准 - u字段
                // 填充表格数据
                setTable(res.data);
                swal("加载成功", "已加载 " + res.data.length + " 条工艺规程数据", "success");
            } else {
                // 如果没有数据，清空表格或显示提示
                clearTable();
                swal("提示", "暂无工艺规程数据", "info");
            }
        } else {
            swal("查询失败", res.msg || "加载工艺规程数据失败", "error");
        }
    }, function(xhr, status, error) {
        console.error('工艺规程查询请求失败:', error);
        swal("请求失败", "加载工艺规程数据失败: " + error, "error");
    });
}


function formatDateForInput(dateString) {
    if (!dateString) return '';

    try {
        // 处理各种日期格式
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return '';
        }

        // 格式化为 YYYY-MM-DD
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    } catch (error) {
        console.error('日期格式化错误:', error);
        return '';
    }
}
// 清空表格数据（保留一行空行）
function clearTable() {
    const tbody = document.querySelector('#processTable tbody');
    tbody.innerHTML = `
        <tr>
            <td class="col-1">1</td>
            <td class="col-2" contenteditable="true"></td>
            <td class="col-3" contenteditable="true" colspan="3"></td>
            <td class="col-4" contenteditable="true"></td>
            <td class="col-5" contenteditable="true"></td>
            <td class="col-6" contenteditable="true"></td>
            <td class="col-7" contenteditable="true"></td>
            <td class="col-8" contenteditable="true"></td>
        </tr>
    `;
}


// 在设置表格数据时，需要为每行设置data-id属性

function setTable(data) {
    const tbody = document.querySelector('#processTable tbody');
    tbody.innerHTML = '';

    data.forEach((item, index) => {
        const row = document.createElement('tr');
        // 如果有id，设置data-id属性
        if (item.id) {
            row.dataset.id = item.id;
        }
        row.innerHTML = `
            <td class="col-1">${index + 1}</td>
            <td class="col-2" contenteditable="true">${item.j || ''}</td>
            <td class="col-3" contenteditable="true" colspan="3">${item.k || ''}</td>
            <td class="col-4" contenteditable="true">${item.l || ''}</td>
            <td class="col-5" contenteditable="true">${item.m || ''}</td>
            <td class="col-6" contenteditable="true">${item.n || ''}</td>
            <td class="col-7" contenteditable="true">${item.o || ''}</td>
            <td class="col-8" contenteditable="true">${item.p || ''}</td>
        `;
        tbody.appendChild(row);
    });

    // 在第一行下面添加空行
    if (data.length > 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `
            <td class="col-1">${data.length + 1}</td>
            <td class="col-2" contenteditable="true"></td>
            <td class="col-3" contenteditable="true" colspan="3"></td>
            <td class="col-4" contenteditable="true"></td>
            <td class="col-5" contenteditable="true"></td>
            <td class="col-6" contenteditable="true"></td>
            <td class="col-7" contenteditable="true"></td>
            <td class="col-8" contenteditable="true"></td>
        `;

        // 在第一行后面插入空行
        const firstRow = tbody.querySelector('tr:first-child');
        tbody.insertBefore(emptyRow, firstRow.nextSibling);
    } else {
        // 如果没有数据，添加一行空行
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `
            <td class="col-1">1</td>
            <td class="col-2" contenteditable="true"></td>
            <td class="col-3" contenteditable="true" colspan="3"></td>
            <td class="col-4" contenteditable="true"></td>
            <td class="col-5" contenteditable="true"></td>
            <td class="col-6" contenteditable="true"></td>
            <td class="col-7" contenteditable="true"></td>
            <td class="col-8" contenteditable="true"></td>
        `;
        tbody.appendChild(emptyRow);
    }

    // 重新计算所有行的序号
    renumberTableRows();
}

// 更新页面标题
// 添加CSS样式
const style = document.createElement('style');
style.textContent = `
    .selected-row {
        background-color: #e3f2fd !important;
        border: 2px solid #2196f3 !important;
    }
    .selected-row td {
        background-color: #e3f2fd !important;
    }
`;
document.head.appendChild(style);

// 保存工艺规程数据
// 保存工艺规程数据
function saveProcessData() {
    // 获取上一个页面传过来的id
    const originalData = JSON.parse(sessionStorage.getItem('currentProcessData') || '{}');
    const previousPageId = originalData.id; // 上一个页面的id

    // 收集表头基础数据 - 按照VBA字段映射
    const baseData = {
        c: previousPageId || '',
        d: $('#business-unit').text(),      // 业务单位
        e: $('#quantity').text(),            // 任务号
        f: $('#material').text(),           // 材质
        g: $('#product-name').text(),       // 零件名称
        h: $('#task-no').text(),         // 图号
        i: $('#drawing-no').text(),           // 数量
        // 签名和日期
        q: $('.signature-name:eq(0)').text(), // 工艺员
        r: $('#gyrq').val(),                // 工艺员日期
        s: $('.signature-name:eq(1)').text(), // 校对员
        t: $('#jdrq').val(),                // 校对员日期
        u: $('.signature-name:eq(2)').text(), // 批准人
        v: $('#pzrq').val()                 // 批准日期
    };

    // 分离新增和修改的数据
    const insertData = [];  // 没有id的数据 → 新增
    const updateData = [];  // 有id的数据 → 修改

    // 收集表格数据
    const rows = document.querySelectorAll('#processTable tbody tr');

    rows.forEach((row, index) => {
        const cells = row.cells;

        // 表格行字段 - 按照VBA字段映射
        const rowData = {
            j: cells[1].textContent || '', // D列 -> J (工序名称)
            k: cells[2].textContent || '', // E列 -> K (工序内容)
            l: cells[3].textContent || '', // I列 -> L (合计工时)
            m: cells[4].textContent || '', // J列 -> M (员工签名)
            n: cells[5].textContent || '', // K列 -> N (完工时间)
            o: cells[6].textContent || '', // L列 -> O (检验盖章)
            p: cells[7].textContent || ''  // M列 -> P (备注)
        };

        // 只保存有数据的行（工序名称或工序内容不为空）
        if (rowData.j.trim() !== '' || rowData.k.trim() !== '') {
            const completeRecord = {
                ...baseData,
                ...rowData
            };

            // 判断是否有id（对应VBA中的B列）
            if (row.dataset.id) {
                // 有id → 修改
                completeRecord.id = row.dataset.id;
                updateData.push(completeRecord);
            } else {
                // 没有id → 新增
                insertData.push(completeRecord);
            }
        }
    });

    console.log('新增数据:', insertData);
    console.log('修改数据:', updateData);

    // 显示加载中
    const $btn = $('#saveBtn');
    const originalText = $btn.html();
    $btn.prop('disabled', true).html('<i class="bi bi-arrow-clockwise icon"></i>保存中...');

    let completedRequests = 0;
    const totalRequests = (insertData.length > 0 ? 1 : 0) + (updateData.length > 0 ? 1 : 0);
    let hasError = false;

    // 处理请求完成的回调
    function handleRequestComplete() {
        completedRequests++;
        if (completedRequests === totalRequests) {
            $btn.prop('disabled', false).html(originalText);
            if (!hasError) {
                swal("保存成功", "工艺规程保存成功", "success");
                // 如果是新增，更新sessionStorage中的id
                if (insertData.length > 0 && !originalData.id) {
                    // 这里可以根据后端返回的数据更新id
                }
            }
        }
    }

    // 发送新增请求
    // 发送批量修改请求
// 发送批量修改请求
    if (updateData.length > 0) {
        $.ajax({
            type: 'POST',
            url: '/gygc/updateBatch',
            data: JSON.stringify(updateData),  // 直接发送数组，不包装
            dataType: 'json',
            contentType: 'application/json;charset=utf-8',
            success: function(res) {
                if (res.code == 200) {
                    console.log('批量修改成功:', updateData.length, '条');
                } else {
                    swal("修改失败", res.msg || "批量修改数据失败", "error");
                    hasError = true;
                }
                handleRequestComplete();
            },
            error: function(xhr, status, error) {
                swal("修改失败", "请求失败: " + error, "error");
                hasError = true;
                handleRequestComplete();
            }
        });
    }

// 发送批量新增请求
    if (insertData.length > 0) {
        $.ajax({
            type: 'POST',
            url: '/gygc/addBatch',
            data: JSON.stringify(insertData),  // 直接发送数组，不包装
            dataType: 'json',
            contentType: 'application/json;charset=utf-8',
            success: function(res) {
                if (res.code == 200) {
                    console.log('批量新增成功:', insertData.length, '条');
                } else {
                    swal("新增失败", res.msg || "批量新增数据失败", "error");
                    hasError = true;
                }
                handleRequestComplete();
            },
            error: function(xhr, status, error) {
                swal("新增失败", "请求失败: " + error, "error");
                hasError = true;
                handleRequestComplete();
            }
        });
    }

    // 如果没有数据需要保存
    if (totalRequests === 0) {
        $btn.prop('disabled', false).html(originalText);
        swal("保存失败", "没有有效的数据可以保存", "error");
    }
}




// 当前显示的数据
let currentData = [];

// 查询按钮点击事件


// 关闭弹窗
closeModal.addEventListener('click', function() {
    queryModal.style.display = 'none';
});

// 点击弹窗外部关闭
window.addEventListener('click', function(event) {
    if (event.target === queryModal) {
        queryModal.style.display = 'none';
    }
});

// 搜索按钮点击事件
searchBtn.addEventListener('click', function() {
    performSearch();
});

// 搜索输入框回车事件
searchInput.addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
        performSearch();
    }
});

// 填充表格数据
// 填充表格数据
// 填充表格数据
function populateTable(data) {
    const resultsBody = document.getElementById('resultsBody');
    const noResults = document.getElementById('noResults');

    // 清空现有数据
    resultsBody.innerHTML = '';

    if (!data || data.length === 0) {
        noResults.style.display = 'block';
        return;
    }

    noResults.style.display = 'none';

    // 填充数据到表格
    data.forEach(item => {
        const row = document.createElement('tr');

        // 根据实际返回的字段名调整
        const businessUnitCell = document.createElement('td');
        businessUnitCell.textContent = item.c || item.field1 || '';

        const taskNumberCell = document.createElement('td');
        taskNumberCell.textContent = item.e || item.field2 || '';

        const drawingNumberCell = document.createElement('td');
        drawingNumberCell.textContent = item.i || item.field3 || '';

        row.appendChild(businessUnitCell);
        row.appendChild(taskNumberCell);
        row.appendChild(drawingNumberCell);

        // 为行添加双击事件
        row.addEventListener('dblclick', function() {
            // 获取该行的id（根据实际数据结构调整）
            const itemId = item.id || item.ID;
            if (itemId) {
                queryListById(itemId);
            } else {
                swal("提示", "该行数据没有ID", "warning");
            }
        });

        resultsBody.appendChild(row);
    });
}
// 根据ID查询详细数据
// 根据ID查询详细数据
function queryListById(id) {
    console.log('查询详细数据，ID:', id);

    // 显示加载中
    const $queryModal = $('#queryModal');
    $queryModal.hide();
    swal({
        title: "加载中",
        text: "正在查询数据...",
        icon: "info",
        buttons: false,
        closeOnClickOutside: false
    });

    // 将id作为htid参数传递给后端
    $ajax({
        type: 'post',
        url: '/gygc/queryList',
        data: {
            htid: id  // 将双击行的id作为htid参数
        }
    }, false, '', function (res) {
        swal.close();
        console.log('详细数据查询响应:', res);

        if (res.code == 200) {
            if (res.data && res.data.length > 0) {
                // 将查询到的数据添加到表格中
                replaceTableData(res.data);
                swal("加载成功", "已成功加载 " + res.data.length + " 条工序数据", "success");
            } else {
                swal("提示", "未找到对应的工艺规程数据", "info");
            }
        } else {
            swal("查询失败", res.msg || "查询详细数据失败", "error");
        }
    }, function(xhr, status, error) {
        swal.close();
        console.error('详细数据查询请求失败:', error);
        swal("请求失败", "查询详细数据失败: " + error, "error");
    });
}

// 将查询到的数据替换表格现有数据
function replaceTableData(data) {
    if (data && data.length > 0) {
        // 使用第一条数据填充表头
        const headerData = data[0];

        $('#business-unit').text(headerData.d || '');      // 业务单位
        $('#task-no').text(headerData.h || '');            // 任务号
        $('#product-name').text(headerData.g || '');       // 名称
        $('#drawing-no').text(headerData.i || '');         // 图号
        $('#quantity').text(headerData.e || '');           // 数量
        $('#material').text(headerData.f || '');           // 材质

        // 设置签名和日期
        $('#gyy').text(headerData.q || '');  // 工艺员
        $('#jdy').text(headerData.s || '');  // 校对员
        $('#pzr').text(headerData.u || '');  // 批准人
        $('#gyrq').val(formatDateForInput(headerData.r) || '');  // 工艺员日期
        $('#jdrq').val(formatDateForInput(headerData.t) || '');  // 校对员日期
        $('#pzrq').val(formatDateForInput(headerData.v) || '');  // 批准日期
    }

    const tbody = document.querySelector('#processTable tbody');
    tbody.innerHTML = '';

    // 添加查询到的数据到表格
    data.forEach((item, index) => {
        const row = document.createElement('tr');

        // 如果有id，设置data-id属性
        if (item.id) {
            row.dataset.id = item.id;
        }

        row.innerHTML = `
            <td class="col-1">${index + 1}</td>
            <td class="col-2" contenteditable="true">${item.j || ''}</td>
            <td class="col-3" contenteditable="true" colspan="3">${item.k || ''}</td>
            <td class="col-4" contenteditable="true">${item.l || ''}</td>
            <td class="col-5" contenteditable="true">${item.m || ''}</td>
            <td class="col-6" contenteditable="true">${item.n || ''}</td>
            <td class="col-7" contenteditable="true">${item.o || ''}</td>
            <td class="col-8" contenteditable="true">${item.p || ''}</td>
        `;

        tbody.appendChild(row);
    });

    // 在第一行下面添加空行
    if (data.length > 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `
            <td class="col-1">${data.length + 1}</td>
            <td class="col-2" contenteditable="true"></td>
            <td class="col-3" contenteditable="true" colspan="3"></td>
            <td class="col-4" contenteditable="true"></td>
            <td class="col-5" contenteditable="true"></td>
            <td class="col-6" contenteditable="true"></td>
            <td class="col-7" contenteditable="true"></td>
            <td class="col-8" contenteditable="true"></td>
        `;

        // 在第一行后面插入空行
        const firstRow = tbody.querySelector('tr:first-child');
        tbody.insertBefore(emptyRow, firstRow.nextSibling);
    } else {
        // 如果没有数据，添加一行空行
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `
            <td class="col-1">1</td>
            <td class="col-2" contenteditable="true"></td>
            <td class="col-3" contenteditable="true" colspan="3"></td>
            <td class="col-4" contenteditable="true"></td>
            <td class="col-5" contenteditable="true"></td>
            <td class="col-6" contenteditable="true"></td>
            <td class="col-7" contenteditable="true"></td>
            <td class="col-8" contenteditable="true"></td>
        `;
        tbody.appendChild(emptyRow);
    }

    // 重新计算所有行的序号
    renumberTableRows();
    initTableAutoAddRow();
}
// 添加新行
function addNewRow() {
    const tbody = document.querySelector('#processTable tbody');
    const rows = tbody.querySelectorAll('tr');
    const lastRow = rows[rows.length - 1];

    // 检查最后一行是否已经有内容，避免重复添加
    const hasContent = Array.from(lastRow.querySelectorAll('td[contenteditable="true"]'))
        .some(cell => cell.textContent.trim() !== '');

    if (hasContent) {
        const newIndex = rows.length + 1;
        const newRow = document.createElement('tr');

        newRow.innerHTML = `
            <td class="col-1">${newIndex}</td>
            <td class="col-2" contenteditable="true"></td>
            <td class="col-3" contenteditable="true" colspan="3"></td>
            <td class="col-4" contenteditable="true"></td>
            <td class="col-5" contenteditable="true"></td>
            <td class="col-6" contenteditable="true"></td>
            <td class="col-7" contenteditable="true"></td>
            <td class="col-8" contenteditable="true"></td>
        `;

        tbody.appendChild(newRow);

        // // 滚动到新行
        // newRow.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}
// 执行搜索
function performSearch() {
    const businessUnitInput = document.getElementById('searchBusinessUnit');
    const taskNumberInput = document.getElementById('searchTaskNumber');
    const drawingNumberInput = document.getElementById('searchDrawingNumber');
    const resultsBody = document.getElementById('resultsBody');
    const noResults = document.getElementById('noResults');

    if (!businessUnitInput || !taskNumberInput || !drawingNumberInput || !resultsBody) {
        console.error('找不到必要的DOM元素');
        return;
    }

    const businessUnitTerm = businessUnitInput.value.trim().toLowerCase();
    const taskNumberTerm = taskNumberInput.value.trim().toLowerCase();
    const drawingNumberTerm = drawingNumberInput.value.trim().toLowerCase();

    const allRows = resultsBody.querySelectorAll('tr');
    let hasResults = false;

    // 如果所有搜索框都为空，显示所有行
    if (businessUnitTerm === '' && taskNumberTerm === '' && drawingNumberTerm === '') {
        allRows.forEach(row => {
            row.style.display = '';
        });
        if (noResults) noResults.style.display = 'none';
        return;
    }

    allRows.forEach(row => {
        const cells = row.querySelectorAll('td');

        // 获取每列的具体内容
        const businessUnit = cells[0].textContent.toLowerCase();
        const taskNumber = cells[1].textContent.toLowerCase();
        const drawingNumber = cells[2].textContent.toLowerCase();

        // 分别检查每列是否匹配对应的搜索条件
        const businessUnitMatch = businessUnitTerm === '' || businessUnit.includes(businessUnitTerm);
        const taskNumberMatch = taskNumberTerm === '' || taskNumber.includes(taskNumberTerm);
        const drawingNumberMatch = drawingNumberTerm === '' || drawingNumber.includes(drawingNumberTerm);

        // 只有当所有条件都满足时才显示该行
        if (businessUnitMatch && taskNumberMatch && drawingNumberMatch) {
            row.style.display = '';
            hasResults = true;
        } else {
            row.style.display = 'none';
        }
    });

    // 显示/隐藏无结果提示
    if (noResults) {
        noResults.style.display = hasResults ? 'none' : 'block';
    }
}
function getList() {
    $ajax({
        type: 'post',
        url: '/gygc/getList',
    }, false, '', function (res) {
        console.log('=== 调试信息开始 ===');
        console.log('API响应状态:', res.code);
        console.log('API响应消息:', res.msg);
        console.log('完整响应数据:', res);
        if (res.code == 200) {
            // 填充数据到弹窗
            populateTable(res.data);
            // 显示弹窗
            $('#queryModal').show();
        } else {
            alert('获取数据失败：' + res.msg);
        }
    })
}


// 监听表格内容变化
function initTableAutoAddRow() {
    const tbody = document.querySelector('#processTable tbody');

    // 使用事件委托监听内容变化
    tbody.addEventListener('input', function(event) {
        const target = event.target;
        // 检查是否是最后一行的内容被修改
        if (isLastRowContentModified(target)) {
            // 延迟添加新行，避免影响当前输入
            setTimeout(addNewRow, 100);
        }
    });
}

// 检查是否是最后一行的内容被修改
function isLastRowContentModified(target) {
    const tbody = document.querySelector('#processTable tbody');
    const rows = tbody.querySelectorAll('tr');
    const lastRow = rows[rows.length - 1];

    // 检查目标元素是否在最后一行
    if (!lastRow.contains(target)) {
        return false;
    }

    // 检查是否在可编辑的单元格中（排除序号列）
    const cell = target.closest('td[contenteditable="true"]');
    if (!cell) {
        return false;
    }

    // 检查内容是否非空
    return target.textContent.trim() !== '';
}