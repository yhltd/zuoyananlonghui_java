// 在工艺规程页面的JavaScript中
$(document).ready(function() {

    // 初始化工序名称记忆功能
    initProcessNameMemory();

    // 新增：初始化工序内容历史记录
    initProcessContentMemory();

    // 新增：初始化工序内容下拉功能
    initProcessContentMemorySync();

    setTimeout(() => {
        initNameDropdownMemory();
    }, 1500); // 延迟1.5秒，确保所有下拉框都已加载


    // 从sessionStorage获取数据
    const processData = JSON.parse(sessionStorage.getItem('currentProcessData') || '{}');
    window.currentHtid = processData.id || '';
    console.log('接收到的工艺规程数据:', processData);

    if (Object.keys(processData).length === 0) {
        swal("注意", "请从合同记录跳转数据，或者执行查询功能", "warning");
        // return;
    }

    // 修改执行顺序：先加载下拉数据，再填充表头
    loadDropdownData();

    // 延迟填充表头，确保下拉框已创建
    setTimeout(() => {
        fillProcessHeader(processData);
    }, 500);

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

        // 创建新行 - 修改工序名称单元格
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td class="col-1">${newIndex}</td>
            <td class="col-2" contenteditable="true" 
                data-list="process-name-history"
                onfocus="showProcessNameSuggestions(this)"
                oninput="saveProcessNameInput(this)"></td>
            <td class="col-3" contenteditable="true" colspan="3"
                list="process-content-history"
                onfocus="showProcessContentSuggestions(this)"
                oninput="saveProcessContentInput(this)"></td>
            <td class="col-4" contenteditable="true"></td>
            <td class="col-5" contenteditable="true"></td>
            <td class="col-6" contenteditable="true"></td>
            <td class="col-7" contenteditable="true"></td>
            <td class="col-8" contenteditable="true"></td>
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
        const selectedSize = document.getElementById('printSize').value;
        printWithQRCode(selectedSize);
       saveProcessData();
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

// 修改为类似工序名称的初始化方式：
function initProcessContentMemorySync() {
    console.log('=== 同步初始化工序内容记忆功能 ===');

    // 加载历史记录
    const history = getProcessContentHistory();
    console.log('同步加载工序内容历史记录:', history);

    // 创建自定义下拉（与工序名称相同的方式）
    createProcessContentCustomDropdown();

    // 更新datalist
    updateProcessContentDatalist(history);
}

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
                }else if(res.code == 403){
                    swal("删除失败,权限不足,管理员权限可以删除");
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
    $('#product-name').text(data.h || '');       // 零件名称
    $('#drawing-no').text(data.i || '');         // 图号
    $('#quantity').text(data.k || '');           // 数量
    $('#material').text(data.l || '');           // 材质
    $('#contract-no').text(data.d || '');        // 合同号

    // 使用传递过来的id作为htid
    var htid = data.id;

    console.log('查询工艺规程数据，htid:', htid);
    swal({
        title: "加载中",
        text: "正在查询数据...",
        icon: "info",
        buttons: false,
        closeOnClickOutside: false
    });

    $ajax({
        type: 'post',
        url: '/gygc/queryList',
        data: {
            htid: htid
        }
    }, false, '', function (res) {
        swal.close();
        console.log('工艺规程查询响应:', res);
        if (res.code == 200) {
            if (res.data && res.data.length > 0) {
                const firstItem = res.data[0];

                // 设置日期字段 - 如果数据库中有值就用数据库的值，否则用当前日期
                const today = new Date().toISOString().split('T')[0]; // 当前日期YYYY-MM-DD

                // 工艺员日期
                $('#gyrq').val(formatDateForInput(firstItem.r) || today);

                // 校对员日期 - 如果是新记录，设置为当前日期
                $('#jdrq').val(formatDateForInput(firstItem.t) || today);

                // 批准日期 - 如果是新记录，设置为当前日期
                $('#pzrq').val(formatDateForInput(firstItem.v) || today);

                // 设置人名下拉框的值，并记录上一次选择
                if (firstItem.q) {
                    setDropdownValue('gyy', firstItem.q);
                    saveLastSelectedName('gyy', firstItem.q);
                } else {
                    // 如果没有值，使用上一次选择的值
                    const lastGyy = getLastSelectedName('gyy');
                    if (lastGyy) {
                        setDropdownValue('gyy', lastGyy);
                    }
                }

                if (firstItem.s) {
                    setDropdownValue('jdy', firstItem.s);
                    saveLastSelectedName('jdy', firstItem.s);
                } else {
                    const lastJdy = getLastSelectedName('jdy');
                    if (lastJdy) {
                        setDropdownValue('jdy', lastJdy);
                    }
                }

                if (firstItem.u) {
                    setDropdownValue('pzr', firstItem.u);
                    saveLastSelectedName('pzr', firstItem.u);
                } else {
                    const lastPzr = getLastSelectedName('pzr');
                    if (lastPzr) {
                        setDropdownValue('pzr', lastPzr);
                    }
                }

                // 填充表格数据
                setTable(res.data);
                swal("加载成功", "已加载 " + res.data.length + " 条工艺规程数据", "success");
            } else {
                // 如果没有数据，清空表格并设置默认值
                clearTable();

                // 设置日期字段为当前日期
                const today = new Date().toISOString().split('T')[0];
                $('#gyrq').val(today);
                $('#jdrq').val(today);
                $('#pzrq').val(today);

                // 设置人名下拉框为上一次选择的值
                const lastGyy = getLastSelectedName('gyy');
                if (lastGyy) {
                    setDropdownValue('gyy', lastGyy);
                }

                const lastJdy = getLastSelectedName('jdy');
                if (lastJdy) {
                    setDropdownValue('jdy', lastJdy);
                }

                const lastPzr = getLastSelectedName('pzr');
                if (lastPzr) {
                    setDropdownValue('pzr', lastPzr);
                }

                swal("提示", "暂无工艺规程数据，已初始化新表格", "info");
            }
        } else {
            // 查询失败时也初始化默认值
            clearTable();

            // 设置日期字段为当前日期
            const today = new Date().toISOString().split('T')[0];
            $('#gyrq').val(today);
            $('#jdrq').val(today);
            $('#pzrq').val(today);

            // 设置人名下拉框为上一次选择的值
            const lastGyy = getLastSelectedName('gyy');
            if (lastGyy) {
                setDropdownValue('gyy', lastGyy);
            }

            const lastJdy = getLastSelectedName('jdy');
            if (lastJdy) {
                setDropdownValue('jdy', lastJdy);
            }

            const lastPzr = getLastSelectedName('pzr');
            if (lastPzr) {
                setDropdownValue('pzr', lastPzr);
            }

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
            <td class="col-2" contenteditable="true"
                list="process-name-history"
                onfocus="showProcessNameSuggestions(this)"
                oninput="saveProcessNameInput(this)"></td>
            <td class="col-3" contenteditable="true" colspan="3"
                list="process-content-history"
                onfocus="showProcessContentSuggestions(this)"
                oninput="saveProcessContentInput(this)"></td>
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
            <td class="col-2" contenteditable="true"
                list="process-name-history"
                onfocus="showProcessNameSuggestions(this)"
                oninput="saveProcessNameInput(this)">${item.j || ''}</td>
            <td class="col-3" contenteditable="true" colspan="3"
                list="process-content-history"
                onfocus="showProcessContentSuggestions(this)"
                oninput="saveProcessContentInput(this)">${item.k || ''}</td>
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
            <td class="col-2" contenteditable="true"
                list="process-name-history"
                onfocus="showProcessNameSuggestions(this)"
                oninput="saveProcessNameInput(this)"></td>
            <td class="col-3" contenteditable="true" colspan="3"
                list="process-content-history"
                onfocus="showProcessContentSuggestions(this)"
                oninput="saveProcessContentInput(this)"></td>
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
            <td class="col-2" contenteditable="true"
                list="process-name-history"
                onfocus="showProcessNameSuggestions(this)"
                oninput="saveProcessNameInput(this)"></td>
            <td class="col-3" contenteditable="true" colspan="3"
                list="process-content-history"
                onfocus="showProcessContentSuggestions(this)"
                oninput="saveProcessContentInput(this)"></td>
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
function saveProcessData() {
    // 获取上一个页面传过来的id
    const originalData = JSON.parse(sessionStorage.getItem('currentProcessData') || '{}');
    const previousPageId = originalData.id; // 合同ID

    // 先删除该合同下的所有旧数据
    deleteOldData(previousPageId, function() {
        // 删除成功后继续保存新数据
        saveNewData();
    });

    function saveNewData() {
        // 收集表头基础数据 - 按照VBA字段映射
        const baseData = {
            c: previousPageId || '',                      // 合同ID
            d: $('#business-unit').text().trim(),         // 业务单位 - 从可编辑单元格获取
            e: $('#task-no').text().trim(),               // 任务号 - 从可编辑单元格获取
            f: $('#material').text().trim(),              // 材质 - 从可编辑单元格获取
            g: $('#product-name').text().trim(),          // 零件名称 - 从可编辑单元格获取
            h: $('#quantity').text().trim(),              // 数量 - 从可编辑单元格获取
            i: $('#drawing-no').text().trim(),            // 图号 - 从可编辑单元格获取
            // 签名和日期 - 从下拉框或文本获取
            q: getFieldValue('gyy'),                      // 工艺员
            r: $('#gyrq').val(),                          // 工艺员日期
            s: getFieldValue('jdy'),                      // 校对员
            t: $('#jdrq').val(),                          // 校对员日期
            u: getFieldValue('pzr'),                      // 批准人
            v: $('#pzrq').val()                           // 批准日期
        };

        // 收集表格数据 - 所有数据都作为新增处理
        const insertData = [];  // 所有数据都新增

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

            if (rowData.j.trim() !== '') {
                const completeRecord = {
                    ...baseData,
                    ...rowData
                };

                // 所有数据都作为新增
                insertData.push(completeRecord);
            }

            // if (rowData.j.trim() !== '' || rowData.k.trim() !== '') {
            //     const completeRecord = {
            //         ...baseData,
            //         ...rowData
            //     };
            //
            //     // 所有数据都作为新增
            //     insertData.push(completeRecord);
            // }
        });

        console.log('新增数据:', insertData);

        if (insertData.length === 0) {
            swal("保存完成", "没有需要保存的数据", "info");
            $('#saveBtn').prop('disabled', false).html('保存');
            return;
        }

        // 显示加载中
        const $btn = $('#saveBtn');
        const originalText = $btn.html();
        $btn.prop('disabled', true).html('<i class="bi bi-arrow-clockwise icon"></i>保存中...');

        // 发送批量新增请求
        $.ajax({
            type: 'POST',
            url: '/gygc/addBatch',
            data: JSON.stringify(insertData),
            dataType: 'json',
            contentType: 'application/json;charset=utf-8',
            success: function(res) {
                $btn.prop('disabled', false).html(originalText);
                if (res.code == 200) {
                    console.log('批量新增成功:', insertData.length, '条');
                    swal("保存成功", "工艺规程保存成功", "success");

                    // 保存历史记录到本地存储
                    saveAllProcessNamesToHistory();
                    saveAllProcessContentsToHistory();

                    // 更新sessionStorage中的id
                    if (!originalData.id && res.data && res.data.length > 0) {
                        console.log('保存后的数据:', res.data);
                    }

                } else {
                    swal("新增失败", res.msg || "批量新增数据失败", "error");
                }
            },
            error: function(xhr, status, error) {
                $btn.prop('disabled', false).html(originalText);
                swal("新增失败", "请求失败: " + error, "error");
            }
        });
    }
}

// 删除旧数据函数
function deleteOldData(contractId, callback) {
    if (!contractId) {
        console.log('没有合同ID，跳过删除');
        callback();
        return;
    }

    console.log('开始删除合同ID为', contractId, '的旧数据');

    $.ajax({
        type: 'POST',
        url: '/gygc/deletec',
        data: { C: contractId },
        dataType: 'json',
        success: function(res) {
            if (res.code == 200) {
                console.log('删除旧数据成功');
                callback();
            } else {
                callback();
            }
        },
        error: function(xhr, status, error) {
            console.error('删除请求失败:', error);
            swal("删除失败", "请求失败: " + error, "error");
            $('#saveBtn').prop('disabled', false).html('保存');
        }
    });
}

// 新增函数：获取字段值（兼容下拉框和文本）
function getFieldValue(fieldId) {
    const element = $('#' + fieldId);
    const selectElement = element.find('select');

    if (selectElement.length > 0) {
        // 如果是下拉框，获取选中的值
        return selectElement.val() || '';
    } else {
        // 如果是文本，获取文本内容
        return element.text().trim() || '';
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

        // 使用jQuery添加移动端双击支持
        $(row).on('touchstart', function(e) {
            e.preventDefault();

            // 使用jQuery的data存储点击次数
            let tapCount = $(this).data('tapCount') || 0;
            tapCount++;
            $(this).data('tapCount', tapCount);

            if (tapCount === 1) {
                // 第一次触摸，设置计时器
                setTimeout(() => {
                    $(this).data('tapCount', 0);
                }, 300);
            } else if (tapCount === 2) {
                // 第二次触摸（双击）
                $(this).data('tapCount', 0);

                // 触发双击事件
                const itemId = item.id || item.ID;
                if (itemId) {
                    queryListById(itemId);
                } else {
                    swal("提示", "该行数据没有ID", "warning");
                }
            }
        });

        resultsBody.appendChild(row);
    });
}

// 修改查询函数，更新htid
function queryListById(id) {
    console.log('查询详细数据，ID:', id);

    // 更新当前htid
    window.currentHtid = id;

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

    $ajax({
        type: 'post',
        url: '/gygc/queryList',
        data: { htid: id }
    }, false, '', function (res) {
        swal.close();

        if (res.code == 200) {
            if (res.data && res.data.length > 0) {
                replaceTableData(res.data);
                swal("加载成功", "已成功加载 " + res.data.length + " 条工序数据", "success");
            } else {
                swal("提示", "未找到对应的工艺规程数据", "info");
            }
        } else {
            swal("查询失败", res.msg || "查询详细数据失败", "error");
        }
    });
}

// 将查询到的数据替换表格现有数据
// 将查询到的数据替换表格现有数据
function replaceTableData(data) {
    if (data && data.length > 0) {
        // 使用第一条数据填充表头
        const headerData = data[0];

        $('#business-unit').text(headerData.d || '');      // 业务单位
        $('#task-no').text(headerData.e || '');            // 任务号
        $('#product-name').text(headerData.g || '');       // 零件名称
        $('#drawing-no').text(headerData.i || '');         // 图号
        $('#quantity').text(headerData.h || '');           // 数量
        $('#material').text(headerData.f || '');           // 材质

        // 修改这里：设置下拉框的值
        if (headerData.q) {
            setDropdownValue('gyy', headerData.q);
        }
        if (headerData.s) {
            setDropdownValue('jdy', headerData.s);
        }
        if (headerData.u) {
            setDropdownValue('pzr', headerData.u);
        }

        // 设置日期字段
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
            <td class="col-2" contenteditable="true"
                list="process-name-history"
                onfocus="showProcessNameSuggestions(this)"
                oninput="saveProcessNameInput(this)">${item.j || ''}</td>
            <td class="col-3" contenteditable="true" colspan="3"
                list="process-content-history"
                onfocus="showProcessContentSuggestions(this)"
                oninput="saveProcessContentInput(this)">${item.k || ''}</td>
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
            <td class="col-2" contenteditable="true"
                list="process-name-history"
                onfocus="showProcessNameSuggestions(this)"
                oninput="saveProcessNameInput(this)"></td>
            <td class="col-3" contenteditable="true" colspan="3"
                list="process-content-history"
                onfocus="showProcessContentSuggestions(this)"
                oninput="saveProcessContentInput(this)"></td>
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
            <td class="col-2" contenteditable="true"
                list="process-name-history"
                onfocus="showProcessNameSuggestions(this)"
                oninput="saveProcessNameInput(this)"></td>
            <td class="col-3" contenteditable="true" colspan="3"
                list="process-content-history"
                onfocus="showProcessContentSuggestions(this)"
                oninput="saveProcessContentInput(this)"></td>
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
            <td class="col-2" contenteditable="true"
                list="process-name-history"
                onfocus="showProcessNameSuggestions(this)"
                oninput="saveProcessNameInput(this)"></td>
            <td class="col-3" contenteditable="true" colspan="3"
                list="process-content-history"
                onfocus="showProcessContentSuggestions(this)"
                oninput="saveProcessContentInput(this)"></td>
            <td class="col-4" contenteditable="true"></td>
            <td class="col-5" contenteditable="true"></td>
            <td class="col-6" contenteditable="true"></td>
            <td class="col-7" contenteditable="true"></td>
            <td class="col-8" contenteditable="true"></td>
        `;

        tbody.appendChild(newRow);
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
    swal({
        title: "加载中",
        text: "正在查询数据...",
        icon: "info",
        buttons: false,
        closeOnClickOutside: false
    });
    $ajax({
        type: 'post',
        url: '/gygc/getList',
    }, false, '', function (res) {
        console.log('=== 调试信息开始 ===');
        console.log('API响应状态:', res.code);
        console.log('API响应消息:', res.msg);
        console.log('完整响应数据:', res);
        swal.close();
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

// 新增函数：创建下拉框
function createDropdown(fieldId, options, defaultValue) {
    const element = $('#' + fieldId);
    if (element.length === 0) return;

    // 如果已经是下拉框，不重复创建
    if (element.find('select').length > 0) {
        updateDropdownOptions(fieldId, options, defaultValue);
        return;
    }

    // 获取上一次保存的值作为默认值
    const lastSelectedValue = getLastSelectedName(fieldId);
    const finalDefaultValue = defaultValue || lastSelectedValue;

    // 创建下拉框
    let selectHtml = '<select class="signature-dropdown" style="width: 100%; border: none; background: transparent; font-size: 14px;">';
    selectHtml += '<option value="">请选择</option>';

    // 去重并排序选项
    const uniqueOptions = [...new Set(options)].sort();

    uniqueOptions.forEach(option => {
        const selected = (option === finalDefaultValue) ? 'selected' : '';
        selectHtml += `<option value="${option}" ${selected}>${option}</option>`;
    });

    selectHtml += '</select>';

    // 替换内容
    element.html(selectHtml);

    // 监听变化，更新签名区域
    element.find('select').on('change', function() {
        const value = $(this).val();
        updateSignatureField(fieldId, value);

        // 保存选择
        if (value) {
            saveLastSelectedName(fieldId, value);
        }
    });

    console.log(`创建下拉框 ${fieldId}:`, {
        options: uniqueOptions,
        defaultValue: finalDefaultValue,
        lastSelectedValue: lastSelectedValue
    });
}
// 新增函数：更新下拉框选项
function updateDropdownOptions(fieldId, options, defaultValue) {
    const selectElement = $('#' + fieldId + ' select');
    if (selectElement.length === 0) return;

    const currentValue = selectElement.val();
    const uniqueOptions = [...new Set(options)].sort();

    let optionsHtml = '<option value="">请选择</option>';
    uniqueOptions.forEach(option => {
        // 保留当前选中项，或者使用新的默认值
        const selected = (option === currentValue) || (option === defaultValue) ? 'selected' : '';
        optionsHtml += `<option value="${option}" ${selected}>${option}</option>`;
    });

    selectElement.html(optionsHtml);
}

// 新增函数：设置下拉框的值
function setDropdownValue(fieldId, value) {
    const element = $('#' + fieldId);
    if (element.length === 0) return;

    // 如果是下拉框，设置值
    const selectElement = element.find('select');
    if (selectElement.length > 0) {
        selectElement.val(value);
        // 如果值不在选项中，添加它
        if (value && !selectElement.find('option[value="' + value + '"]').length) {
            selectElement.append(`<option value="${value}" selected>${value}</option>`);
        }
        updateSignatureField(fieldId, value);
    } else {
        // 如果是文本，显示文本值
        element.text(value || '');
    }
}

// 新增函数：更新签名区域
function updateSignatureField(fieldId, value) {
    // 这里可以根据需要同步更新其他相关字段
    console.log(fieldId + ' 设置为: ' + value);
}

// 新增函数：加载下拉数据
function loadDropdownData() {
    swal({
        title: "加载中",
        text: "正在加载审批人员数据...",
        icon: "info",
        buttons: false,
        closeOnClickOutside: false
    });

    $ajax({
        type: 'post',
        url: '/pzb/getList',
    }, false, '', function (res) {
        swal.close();
        if (res.code == 200) {
            // 提取c、e、d字段的值
            const optionsC = []; // 工艺员选项
            const optionsE = []; // 校对员选项
            const optionsD = []; // 批准选项

            if (res.data && Array.isArray(res.data)) {
                res.data.forEach(item => {
                    if (item.c && item.c.trim() !== '') optionsC.push(item.c.trim());
                    if (item.e && item.e.trim() !== '') optionsE.push(item.e.trim());
                    if (item.d && item.d.trim() !== '') optionsD.push(item.d.trim());
                });

                // 创建下拉框（暂时不设置默认值）
                createDropdown('gyy', optionsC, '');
                createDropdown('jdy', optionsE, '');
                createDropdown('pzr', optionsD, '');

                // 存储选项供后续使用
                window.dropdownOptions = {
                    gyy: [...new Set(optionsC)].sort(),
                    jdy: [...new Set(optionsE)].sort(),
                    pzr: [...new Set(optionsD)].sort()
                };

                console.log('下拉框数据加载完成');
            }
        } else {
            console.warn('加载审批人员数据失败:', res.msg);
        }
    }, function(error) {
        swal.close();
        console.error('获取审批人员数据失败:', error);
    });
}


// 打印函数
function printWithQRCode(selectedSize = 'A4') {
    // 直接从全局变量获取htid
    const htid = window.currentHtid;

    if (!htid) {
        swal("提示", "请先选择或查询数据", "warning");
        return;
    }

    swal({
        title: "准备打印",
        text: `正在生成 ${selectedSize} 打印页面...`,
        icon: "info",
        buttons: false,
        closeOnClickOutside: false
    });

    // 先获取二维码
    $ajax({
        type: 'post',
        url: '/bgd/generateContractQR',
        data: { contractId: htid }
    }, false, '', function(res) {
        if (res.code == 200 && res.data?.qrCodeImage) {
            // 构建打印页面的HTML内容
            const printContent = generatePrintContent(res.data.qrCodeImage, htid, selectedSize);

            // 打开新的打印窗口并写入内容
            const printWindow = window.open('', '_blank', 'width=900,height=600');
            printWindow.document.write(printContent);
            printWindow.document.close();

            // 等页面加载完毕后打印
            printWindow.onload = function() {
                swal.close();
                // 给用户一点时间看预览
                setTimeout(() => {
                    printWindow.print();
                    // 打印后可以关闭窗口，也可以保留供用户操作
                    // printWindow.close();
                }, 300);
            };
        } else {
            swal.close();
            // 如果没有二维码，也生成普通打印页面
            const printContent = generatePrintContent(null, htid, selectedSize);
            const printWindow = window.open('', '_blank', 'width=900,height=600');
            printWindow.document.write(printContent);
            printWindow.document.close();
            printWindow.onload = function() {
                setTimeout(() => {
                    printWindow.print();
                }, 300);
            };
        }
    }, function(error) {
        swal.close();
        swal("错误", "生成打印页面失败: " + error, "error");
    });
}


// 生成打印页面内容的函数
// function generatePrintContent(qrCodeImageBase64, htid) {
//     // 1. 收集所有当前页面显示的表格数据（包括表头和工序行）
//     const headerData = {
//         businessUnit: $('#business-unit').text().trim(),
//         productName: $('#product-name').text().trim(),
//         quantity: $('#quantity').text().trim(),
//         material: $('#material').text().trim(),
//         taskNo: $('#task-no').text().trim(),
//         drawingNo: $('#drawing-no').text().trim(),
//     };
//
//     // 2. 收集签名区域的值（直接取文本，不取下拉框）
//     const signatureData = {
//         gyy: getSignatureText('gyy'), // 工艺员
//         gyrq: $('#gyrq').val() || '',
//         jdy: getSignatureText('jdy'), // 校对员
//         jdrq: $('#jdrq').val() || '',
//         pzr: getSignatureText('pzr'), // 批准
//         pzrq: $('#pzrq').val() || ''
//     };
//
//     // 3. 收集表格主体内容
//     const tableRows = [];
//     $('#processTable tbody tr').each(function() {
//         const cells = $(this).find('td');
//
//         // 只收集有内容的行
//         if (cells.length >= 8 && (cells.eq(1).text().trim() || cells.eq(2).text().trim())) {
//             // 添加数据行
//             tableRows.push({
//                 index: cells.eq(0).text().trim(),
//                 processName: cells.eq(1).text().trim(),
//                 processContent: cells.eq(2).text().trim(),
//                 totalHours: cells.eq(3).text().trim(),
//                 workerSign: cells.eq(4).text().trim(),
//                 finishTime: cells.eq(5).text().trim(),
//                 inspectionSeal: cells.eq(6).text().trim(),
//                 remark: cells.eq(7).text().trim()
//             });
//
//             // 为这条数据添加一个空白行
//             tableRows.push({
//                 index: '', // 空白行不标序号
//                 processName: '',
//                 processContent: '',
//                 totalHours: '',
//                 workerSign: '',
//                 finishTime: '',
//                 inspectionSeal: '',
//                 remark: ''
//             });
//         }
//     });
//
//     // 4. 构建完整的打印页面HTML
//     return `
// <!DOCTYPE html>
// <html lang="zh-CN">
// <head>
//     <meta charset="UTF-8">
//     <title>成都龙辉机械设备制造有限公司工艺规程 - 打印版</title>
//     <style>
//         * {
//             margin: 0;
//             padding: 0;
//             box-sizing: border-box;
//             font-family: "SimSun", "宋体", serif;
//         }
//         body {
//             background-color: white !important;
//             color: black !important;
//             width: 210mm; /* A4宽度 */
//             min-height: 297mm; /* A4高度 */
//             padding: 10mm;
//             margin: 0 auto;
//         }
//
//         /* 打印专用样式 [citation:2][citation:7] */
//         @media print {
//             @page {
//                 size: auto;
//                 margin: 15mm;
//             }
//             body {
//                 -webkit-print-color-adjust: exact;
//                 print-color-adjust: exact;
//                 background: white !important;
//                 width: auto !important; /* 移除固定宽度，适应纸张 */
//                 height: auto !important;
//                 min-height: auto !important;
//                 padding: 0 !important;
//                 margin: 0 !important;
//             }
//
//              .main-title {
//                 width: 100% !important;
//                 text-align: center !important;
//                 margin: 10mm auto 30mm auto !important;
//                 position: static !important;  /* 移除绝对定位 */
//                 left: auto !important;
//                 transform: none !important;
//             }
//
//              /* 确保表格适应页面宽度 */
//             .info-header, .process-table {
//                 width: 100% !important;
//                 max-width: 100% !important;
//                 table-layout: fixed !important;
//             }
//         }
//
//         /* 二维码容器 - 右上角 */
//         .qrcode-container {
//             position: absolute;
//             top: 10mm;
//             right: 10mm;
//             width: 30mm;
//             height: 30mm;
//             text-align: center;
//             padding: 2mm;
//         }
//         .qrcode-container img {
//             width: 100%;
//             height: auto;
//         }
//         .qrcode-container p {
//             font-size: 10pt;
//             margin-top: 2mm;
//             padding-top: 1mm;
//         }
//
//         /* 主标题 */
//         .main-title {
//
//             font-size: 18pt;
//             font-weight: bold;
//             margin-bottom: 30mm;
//             padding: 20mm 0 2mm 30mm;
//
//             position: relative;
//             left: 50%;
//             transform: translateX(-50%); /* 水平居中 */
//         }
//
//         /* 信息表头 */
//         .info-header {
//             width: 100%;
//             border-collapse: collapse;
//             border: 1.5px solid #000; /* 整体外边框 */
//         }
//         .info-header th, .info-header td {
//             border: 1px solid #000; /* 所有单元格黑边框 */
//             padding: 3mm 2mm;
//             text-align: center;
//             font-size: 11pt;
//             height: 8mm;
//             background-color: white !important; /* 确保白色背景 [citation:4] */
//         }
//         .info-header th {
//             font-weight: bold;
//             width: 15%;
//             font-size: 20px;
//         }
//         .info-header .value-cell {
//             width: 35%;
//             font-weight: normal;
//             font-size: 20px;
//         }
//
//         /* 工序表格 */
//         .process-table {
//             width: 100%;
//             border-collapse: collapse;
//             border: 1.5px solid #000;
//         }
//         .process-table th, .process-table td {
//             border: 1px solid #000;
//             padding: 2mm 1mm;
//             text-align: center;
//             font-size: 10pt;
//             height: 7mm;
//             background-color: white !important;
//             page-break-inside: avoid; /* 避免跨页截断 [citation:2] */
//             font-size: 20px;
//         }
//         .process-table th {
//             font-weight: bold;
//             -webkit-print-color-adjust: exact;
//             print-color-adjust: exact;
//         }
//         .col-1 { width: 8%; }
//         .col-2 { width: 12%; }
//         .col-3 { width: 30%; }
//         .col-4 { width: 10%; }
//         .col-5 { width: 10%; }
//         .col-6 { width: 10%; }
//         .col-7 { width: 10%; }
//         .col-8 { width: 10%; }
//
//         /* 签名行 - 单行显示 */
//         .signature-row {
//             width: 100%;
//             font-size: 11pt;
//             display: flex;
//             justify-content: space-between;
//             border-left: 1.5px solid #000;
//             border-right: 1.5px solid #000;
//             border-bottom: 1.5px solid #000;
//         }
//         .signature-item {
//             text-align: center;
//             display: flex;
//         }
//         .signature-label {
//             font-weight: bold;
//             margin-bottom: 1mm;
//             padding: 3mm;
//         }
//         .signature-value {
//             min-height: 6mm;
//             margin: 0 5mm 1mm 5mm;
//             padding-bottom: 1mm;
//             padding-top: 3mm;
//         }
//         .signature-date {
//             padding-right: 3mm;
//             padding-top: 3mm;
//             font-size: 10pt;
//             color: #333;
//         }
//
//         /* 打印控制 - 屏幕显示时可见 */
//         @media screen {
//             .print-controls {
//                 position: fixed;
//                 bottom: 20px;
//                 right: 20px;
//                 z-index: 1000;
//             }
//              body {
//                 width: 210mm; /* A4预览 */
//                 min-height: 297mm;
//                 padding: 10mm;
//                 margin: 0 auto;
//             }
//             .print-btn {
//                 padding: 10px 20px;
//                 background: #2c5e9c;
//                 color: white;
//                 border: none;
//                 border-radius: 4px;
//                 cursor: pointer;
//             }
//         }
//         @media print {
//             .print-controls {
//                 display: none !important;
//             }
//         }
//     </style>
// </head>
// <body>
//     ${qrCodeImageBase64 ? `
//     <div class="qrcode-container">
//         <img src="data:image/png;base64,${qrCodeImageBase64}" alt="合同二维码">
//         <p>合同ID: ${htid}</p>
//     </div>
//     ` : ''}
//
//     <h1 class="main-title">成都龙辉机械设备制造有限公司工艺规程</h1>
//
//     <!-- 表头信息 -->
//     <table class="info-header">
//         <tr>
//             <th>业务单位</th>
//             <td class="value-cell">${headerData.businessUnit || ''}</td>
//             <th>数量</th>
//             <td class="value-cell">${headerData.quantity || ''}</td>
//             <th>材质</th>
//             <td class="value-cell">${headerData.material || ''}</td>
//         </tr>
//         <tr>
//             <th>零件名称</th>
//             <td class="value-cell">${headerData.productName || ''}</td>
//             <th>任务号</th>
//             <td class="value-cell">${headerData.taskNo || ''}</td>
//             <th>图号</th>
//             <td class="value-cell">${headerData.drawingNo || ''}</td>
//         </tr>
//     </table>
//
//     <!-- 工序表格 -->
//     <table class="process-table">
//         <thead>
//             <tr>
//                 <th class="col-1">序号</th>
//                 <th class="col-2">工序名称</th>
//                 <th class="col-3">工序内容</th>
//                 <th class="col-4">合计工时</th>
//                 <th class="col-5">员工签名</th>
//                 <th class="col-6">完工时间</th>
//                 <th class="col-7">检验盖章</th>
//                 <th class="col-8">备注</th>
//             </tr>
//         </thead>
//         <tbody>
//             ${tableRows.map((row, rowIndex) => `
//             <tr class="${row.index === '' ? 'blank-row' : 'data-row'}">
//                 <td>${row.index || ''}</td>
//                 <td>${row.processName || ''}</td>
//                 <td>${row.processContent || ''}</td>
//                 <td>${row.totalHours || ''}</td>
//                 <td>${row.workerSign || ''}</td>
//                 <td>${row.finishTime || ''}</td>
//                 <td>${row.inspectionSeal || ''}</td>
//                 <td>${row.remark || ''}</td>
//             </tr>
//             `).join('')}
//         </tbody>
//     </table>
//
//     <!-- 签名行 - 单行显示 -->
//     <div class="signature-row">
//         <div class="signature-item">
//             <div class="signature-label">工艺员</div>
//             <div class="signature-value">${signatureData.gyy || ''}</div>
//             <div class="signature-date">${signatureData.gyrq || '日期'}</div>
//         </div>
//         <div class="signature-item">
//             <div class="signature-label">校对员</div>
//             <div class="signature-value">${signatureData.jdy || ''}</div>
//             <div class="signature-date">${signatureData.jdrq || '日期'}</div>
//         </div>
//         <div class="signature-item">
//             <div class="signature-label">批准</div>
//             <div class="signature-value">${signatureData.pzr || ''}</div>
//             <div class="signature-date">${signatureData.pzrq || '日期'}</div>
//         </div>
//     </div>
//
//     <div class="print-controls">
//         <button class="print-btn" onclick="window.print();">立即打印</button>
//         <button class="print-btn" onclick="window.close();" style="margin-left:10px;">关闭窗口</button>
//     </div>
//
//     <script>
//         // 页面加载完成后自动聚焦，方便用户操作
//         window.onload = function() {
//             console.log('打印页面加载完成');
//         };
//     </script>
// </body>
// </html>`;
// }

// 生成打印页面内容的函数（分页版）
function generatePrintContent(qrCodeImageBase64, htid, selectedSize) {
    // 1. 收集所有当前页面显示的表格数据（包括表头和工序行）
    const headerData = {
        businessUnit: $('#business-unit').text().trim(),
        productName: $('#product-name').text().trim(),
        quantity: $('#quantity').text().trim(),
        material: $('#material').text().trim(),
        taskNo: $('#task-no').text().trim(),
        drawingNo: $('#drawing-no').text().trim(),
    };

    // 2. 收集签名区域的值（直接取文本，不取下拉框）
    const signatureData = {
        gyy: getSignatureText('gyy'), // 工艺员
        gyrq: $('#gyrq').val() || '',
        jdy: getSignatureText('jdy'), // 校对员
        jdrq: $('#jdrq').val() || '',
        pzr: getSignatureText('pzr'), // 批准
        pzrq: $('#pzrq').val() || ''
    };

    // 3. 收集表格主体内容，每条数据后加一个空白行
    const tableRows = [];
    $('#processTable tbody tr').each(function() {
        const cells = $(this).find('td');

        // 只收集有内容的行
        if (cells.length >= 8 && (cells.eq(1).text().trim() || cells.eq(2).text().trim())) {
            // 添加数据行
            tableRows.push({
                index: cells.eq(0).text().trim(),
                processName: cells.eq(1).text().trim(),
                processContent: cells.eq(2).text().trim(),
                totalHours: cells.eq(3).text().trim(),
                workerSign: cells.eq(4).text().trim(),
                finishTime: cells.eq(5).text().trim(),
                inspectionSeal: cells.eq(6).text().trim(),
                remark: cells.eq(7).text().trim(),
                isDataRow: true
            });

            // 每条数据后面添加一个空白行（没有序号）
            tableRows.push({
                index: '', // 空白行没有序号
                processName: '',
                processContent: '',
                totalHours: '',
                workerSign: '',
                finishTime: '',
                inspectionSeal: '',
                remark: '',
                isDataRow: false
            });
        }
    });

    // 4. 分页处理：根据纸张尺寸动态决定每页行数
    let rowsPerPage = 12; // 默认
    if (selectedSize === 'A4') {
        rowsPerPage = 22; // A4竖版增加行数至 22 以铺满页面 (原16 + 追加6)
    } else if (selectedSize === 'A5') {
        rowsPerPage = 6;  // A5横版：每页保留 3 组数据+空白行 (共6行)
    }

    const totalPages = Math.ceil(tableRows.length / rowsPerPage);
    const printPages = [];

    // 计算每个页面的起始序号
    let globalDataRowCount = 0;
    let pageStartIndexes = [];

    // 先计算每页的起始数据行序号
    for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
        const startIndex = pageIndex * rowsPerPage;
        const endIndex = Math.min(startIndex + rowsPerPage, tableRows.length);
        const pageRows = tableRows.slice(startIndex, endIndex);

        // 统计当前页的数据行数
        let pageDataRowCount = 0;
        pageRows.forEach(row => {
            if (row.isDataRow) pageDataRowCount++;
        });

        pageStartIndexes.push({
            pageNumber: pageIndex + 1,
            startDataRow: globalDataRowCount + 1,
            pageDataRowCount: pageDataRowCount
        });

        globalDataRowCount += pageDataRowCount;
    }

    // 重新遍历生成页面
    for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
        const startIndex = pageIndex * rowsPerPage;
        const endIndex = Math.min(startIndex + rowsPerPage, tableRows.length);
        const pageRows = tableRows.slice(startIndex, endIndex);

        // 如果最后一页不足rowsPerPage行，补充空白行
        if (pageIndex === totalPages - 1 && pageRows.length < rowsPerPage) {
            const remainingRows = rowsPerPage - pageRows.length;
            for (let i = 0; i < remainingRows; i++) {
                pageRows.push({
                    index: '',
                    processName: '',
                    processContent: '',
                    totalHours: '',
                    workerSign: '',
                    finishTime: '',
                    inspectionSeal: '',
                    remark: '',
                    isDataRow: false
                });
            }
        }

        // 添加页码信息
        const pageInfo = {
            pageNumber: pageIndex + 1,
            totalPages: totalPages,
            rows: pageRows,
            startDataRow: pageStartIndexes[pageIndex].startDataRow  // 添加起始序号
        };

        printPages.push(pageInfo);
    }

    // 5. 生成分页的HTML内容 - 传入 selectedSize
    const printContent = generatePagedPrintHTML(
        qrCodeImageBase64,
        htid,
        headerData,
        signatureData,
        printPages,
        selectedSize
    );

    return printContent;
}

// 生成分页的打印HTML
function generatePagedPrintHTML(qrCodeImageBase64, htid, headerData, signatureData, printPages, selectedSize) {
    // 生成每个页面的HTML
    const pageHTMLs = printPages.map(pageInfo => {
        return generateSinglePageHTML(
            qrCodeImageBase64,
            htid,
            headerData,
            signatureData,
            pageInfo
        );
    });

    // 将所有页面合并为一个HTML文档
    return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>成都龙辉机械设备制造有限公司工艺规程 - 打印版</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: "SimSun", "宋体", serif;
        }

        body {
            background-color: white !important;
            color: black !important;
        }

        /* 打印分页控制 */
        .print-page {
            width: ${selectedSize === 'A4' ? '210mm' : '210mm'}; /* A5横版宽度也是210mm左右 */
            min-height: ${selectedSize === 'A4' ? '297mm' : '148mm'};
            max-height: ${selectedSize === 'A4' ? '297mm' : '148mm'};
            padding: ${selectedSize === 'A5' ? '15mm 7mm' : '10mm'}; /* 还原 A5 顶部边距为 15mm，保证标题不动 */
            margin: 0 auto;
            position: relative;
            background: white;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            justify-content: flex-start; /* 改为顶部对齐，由padding控制边距，确保打印位置稳定 */
        }

        .print-page:not(:last-child) {
            page-break-after: always;
        }

        /* 打印专用样式 */
        @media print {
            @page {
                size: ${selectedSize === 'A4' ? 'A4 portrait' : 'A5 landscape'};
                margin: 15mm;
            }

            body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
                background: white !important;
                width: auto !important;
                height: auto !important;
                min-height: auto !important;
                padding: 0 !important;
                margin: 0 !important;
            }

            .print-page {
                width: auto !important;
                min-height: auto !important;
                max-height: none !important;
                padding: 0 !important;
                margin: 0 !important;
                position: relative;
                page-break-inside: avoid;
                break-inside: avoid;
            }

            /* 确保表格不跨页断裂 */
            .process-table {
                page-break-inside: auto;
            }

            .process-table tr {
                min-height: 11mm; /* 表格行最小高度 */
                height: auto;
            }

            .process-table td {
                page-break-inside: avoid;
                page-break-before: auto;
            }
        }

        /* 二维码容器 */
        .qrcode-container {
            position: absolute;
            top: -5mm;
            right: 10mm;
            width: 30mm;
            height: 30mm;
            text-align: center;
            padding: 2mm;
            z-index: 10;
        }
        .qrcode-container img {
            width: 100%;
            height: auto;
        }
        .qrcode-container p {
            font-size: 10pt;
            margin-top: ${selectedSize === 'A5' ? '0mm' : '2mm'};
            padding-top: ${selectedSize === 'A5' ? '1mm' : '1mm'};
        }

        /* 主标题 */
        .main-title {
            font-size: 18pt;
            font-weight: bold;
            text-align: center;
            margin: ${selectedSize === 'A4' ? '10mm auto 5mm auto' : '5mm auto 2mm auto'};
            width: 100%;
        }

        /* 页码信息 */
        .page-number {
            position: absolute;
            bottom: 20mm;
            right: 15mm;
            font-size: 10pt;
            color: #666;
        }

        /* 信息表头 */
        .info-header {
            width: 100%;
            border-collapse: collapse;
            border: 1.5px solid #000;
            margin-top: ${selectedSize === 'A4' ? '10mm' : (selectedSize === 'A5' ? '17mm' : '5mm')};
        }
        .info-header th, .info-header td {
            border: 1px solid #000;
            padding: 2mm 1mm;
            text-align: center;
            font-size: 11pt;
            height: 6mm;
            background-color: white !important;
        }
        .info-header th {
            font-weight: bold;
            width: 7%;
            font-size: 11px;
        }
        .info-header .value-cell {
            width: 10%;
            font-weight: normal;
            font-size: 11px;
        }

        /* 工序表格 */
        .process-table {
            width: 100%;
            border-collapse: collapse;
            border: 1.5px solid #000;
        }
        .process-table th, .process-table td {
            border: 1px solid #000;
            padding: 1mm 0.5mm;
            text-align: center;
            font-size: 10pt;
            height: ${selectedSize === 'A4' ? '9mm' : '8mm'}; /* A5行高调整为 8mm */
            background-color: white !important;
            page-break-inside: avoid;
            font-size: 11px;
        }
        .process-table th {
            font-weight: bold;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
        .col-1 { width: 3%; }
        .col-2 { width: 8.8%; }
        .col-3 { width: 37%; }
        .col-4 { width: 6%; }
        .col-5 { width: 6%; }
        .col-6 { width: 7%; }
        .col-7 { width: 8.3%; }
        .col-8 { width: 10%; }

        /* 签名行 */
        .signature-row {
            width: 100%;
            font-size: 11pt;
            display: flex;
            justify-content: space-between;
            border: 1.5px solid #000;
            bottom: 10mm;
            left: 10mm;
            right: 10mm;
        }
        .signature-item {
            text-align: center;
            display: flex;
            align-items: center;
            flex: 1;
        }
        .signature-label {
            font-weight: bold;
            padding: 2mm;
            flex-shrink: 0;
        }
        .signature-value {
            padding: 2mm;
        }
        .signature-date {
            padding: 2mm;
            font-size: 10pt;
            color: #333;
            flex-shrink: 0;
        }

        /* 内容区域，留出签名行的空间 */
        .content-area {
            overflow: hidden;
        }

        /* 空白行样式 */
        .blank-row {
            height: 5mm;
        }

        /* 打印控制 - 屏幕显示时可见 */
        @media screen {
            .print-controls {
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 1000;
            }
            body {
                width: 210mm;
                min-height: 297mm;
                padding: 10mm;
                margin: 0 auto;
            }
            .print-btn {
                padding: 10px 20px;
                background: #2c5e9c;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
            }
        }
        @media print {
            .print-controls {
                display: none !important;
            }
        }
    </style>
</head>
<body>
    ${pageHTMLs.join('')}

    <div class="print-controls">
        <button class="print-btn" onclick="window.print();">立即打印</button>
        <button class="print-btn" onclick="window.close();" style="margin-left:10px;">关闭窗口</button>
    </div>

    <script>
        window.onload = function() {
            console.log('打印页面加载完成，共 ${printPages.length} 页');
        };
    </script>
</body>
</html>`;
}

// 生成单个页面的HTML
function generateSinglePageHTML(qrCodeImageBase64, htid, headerData, signatureData, pageInfo) {
    const { pageNumber, totalPages, rows, startDataRow } = pageInfo;

    // 计算序号（使用全局起始序号）
    let currentDataRowCount = 0;
    const processedRows = rows.map((row) => {
        // 如果是数据行，计算序号（使用全局连续序号）
        if (row.isDataRow) {
            currentDataRowCount++;
            return {
                ...row,
                displayIndex: startDataRow + currentDataRowCount - 1
            };
        }
        // 空白行或非数据行不显示序号
        return {
            ...row,
            displayIndex: ''
        };
    });

    return `
    <div class="print-page">
        <!-- 二维码 -->
        ${qrCodeImageBase64 ? `
        <div class="qrcode-container">
            <img src="data:image/png;base64,${qrCodeImageBase64}" alt="合同二维码">
            <p>合同ID: ${htid}</p>
        </div>
        ` : ''}
        
        <!-- 主标题 -->
        <h1 class="main-title">成都龙辉机械设备制造有限公司工艺规程</h1>
        
        <!-- 表头信息 -->
        <table class="info-header">
            <tr>
                <th>业务单位</th>
                <td class="value-cell">${headerData.businessUnit || ''}</td>
                <th>数量</th>
                <td class="value-cell">${headerData.quantity || ''}</td>
                <th>材质</th>
                <td class="value-cell">${headerData.material || ''}</td>
            </tr>
            <tr>
                <th>零件名称</th>
                <td class="value-cell">${headerData.productName || ''}</td>
                <th>任务号</th>
                <td class="value-cell">${headerData.taskNo || ''}</td>
                <th>图号</th>
                <td class="value-cell">${headerData.drawingNo || ''}</td>
            </tr>
        </table>
        
        <!-- 内容区域 -->
        <div class="content-area">
            <!-- 工序表格 -->
            <table class="process-table">
                <thead>
                    <tr>
                        <th class="col-1">序号</th>
                        <th class="col-2">工序名称</th>
                        <th class="col-3">工序内容</th>
                        <th class="col-4">合计工时</th>
                        <th class="col-5">员工签名</th>
                        <th class="col-6">完工时间</th>
                        <th class="col-7">检验盖章</th>
                        <th class="col-8">备注</th>
                    </tr>
                </thead>
                <tbody>
                    ${processedRows.map((row) => `
                    <tr class="${row.isDataRow ? 'data-row' : 'blank-row'}">
                        <td>${row.displayIndex}</td>
                        <td>${row.processName || ''}</td>
                        <td>${row.processContent || ''}</td>
                        <td>${row.totalHours || ''}</td>
                        <td>${row.workerSign || ''}</td>
                        <td>${row.finishTime || ''}</td>
                        <td>${row.inspectionSeal || ''}</td>
                        <td>${row.remark || ''}</td>
                    </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        
        <!-- 签名行 -->
        <div class="signature-row">
            <div class="signature-item">
                <div class="signature-label">工艺员</div>
                <div class="signature-value">${signatureData.gyy || ''}</div>
                <div class="signature-value">${signatureData.gyrq || ''}</div>
            </div>
            <div class="signature-item">
                <div class="signature-label">校对员</div>
                <div class="signature-value">${signatureData.jdy || ''}</div>
                <div class="signature-value">${signatureData.jdrq || ''}</div>
            </div>
            <div class="signature-item">
                <div class="signature-label">批准</div>
                <div class="signature-value">${signatureData.pzr || ''}</div>
                <div class="signature-value">${signatureData.pzrq || ''}</div>
            </div>
        </div>
        
    </div>`;
}

// 辅助函数：获取签名文本（兼容下拉框和普通文本）
function getSignatureText(fieldId) {
    const element = document.getElementById(fieldId);
    if (!element) return '';

    // 先尝试获取下拉框选中的值
    const select = element.querySelector('select');
    if (select && select.value) {
        return select.value;
    }

    // 否则获取元素的文本内容
    return element.textContent.trim();
}


//-----------------------获取输入内容记录-----------------------
function initProcessNameMemory() {
    console.log('=== 初始化工序名称记忆功能 ===');

    const history = getProcessNameHistory();
    console.log('加载到的历史记录:', history);

    // 创建自定义下拉
    createCustomDropdown();

    // 监听输入事件 - 工序名称（第2列）
    $(document).on('blur', '#processTable tbody td.col-2', function() {
        // 禁用 blur 时自动保存
    });

    // 新增：监听工序内容（第3列）的blur事件
    $(document).on('blur', '#processTable tbody td.col-3', function() {
        // 禁用 blur 时自动保存
    });

    console.log('工序名称记忆功能初始化完成');
}

// 自定义下拉实现
function createCustomDropdown() {
    // 1. 创建自定义下拉容器
    const dropdownContainer = document.createElement('div');
    dropdownContainer.id = 'process-name-dropdown';
    dropdownContainer.style.cssText = `
        position: absolute;
        background: white;
        border: 1px solid #ccc;
        max-height: 200px;
        overflow-y: auto;
        display: none;
        z-index: 1000;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    `;
    document.body.appendChild(dropdownContainer);

    // 2. 监听工序名称单元格的点击/输入
    $(document).on('focus click input', '#processTable tbody td.col-2', function(e) {
        const cell = this;
        const rect = cell.getBoundingClientRect();
        const history = getProcessNameHistory();

        if (history.length === 0) return;

        // 显示下拉
        dropdownContainer.innerHTML = '';
        dropdownContainer.style.display = 'block';
        dropdownContainer.style.left = rect.left + 'px';
        dropdownContainer.style.top = (rect.bottom + 5) + 'px';
        dropdownContainer.style.width = rect.width + 'px';

        // 添加选项
        history.forEach(item => {
            const option = document.createElement('div');
            option.textContent = item;
            option.style.cssText = `
                padding: 5px 10px;
                cursor: pointer;
                border-bottom: 1px solid #eee;
            `;
            option.onmouseover = () => option.style.background = '#f0f0f0';
            option.onmouseout = () => option.style.background = 'white';
            option.onclick = () => {
                cell.textContent = item;
                dropdownContainer.style.display = 'none';
                // 触发输入事件
                const event = new Event('input', { bubbles: true });
                cell.dispatchEvent(event);
            };
            dropdownContainer.appendChild(option);
        });
    });

    // 3. 点击其他地方隐藏下拉
    document.addEventListener('click', function(e) {
        if (!e.target.closest('#process-name-dropdown') &&
            !e.target.closest('#processTable tbody td.col-2')) {
            dropdownContainer.style.display = 'none';
        }
    });
}

// 获取工序名称历史记录
function getProcessNameHistory() {
    try {
        const historyStr = localStorage.getItem('process_name_history');

        if (!historyStr) {
            console.log('localStorage中没有历史记录');
            return [];
        }

        const history = JSON.parse(historyStr);

        // 验证数据格式
        if (!Array.isArray(history)) {
            console.warn('历史记录不是数组格式，重置为空数组');
            return [];
        }

        // 确保所有项都是字符串
        return history.map(item => String(item));

    } catch (error) {
        console.error('读取工序名称历史记录失败:', error);
        return [];
    }
}

// 保存工序名称到历史记录
function saveProcessNameToHistory(processName) {
    if (!processName || processName.trim() === '') {
        return;
    }

    const name = processName.trim();
    console.log('保存工序名称:', name);

    try {
        // 1. 获取当前历史记录
        let history = getProcessNameHistory();
        console.log('当前历史记录:', history);

        // 2. 去重（不区分大小写）
        history = history.filter(item =>
            item.toString().toLowerCase() !== name.toLowerCase()
        );

        // 3. 新记录放前面
        history.unshift(name);

        // 4. 只保留最近的20条记录
        if (history.length > 20) {
            history = history.slice(0, 20);
        }

        // 5. 保存到localStorage
        const historyStr = JSON.stringify(history);
        localStorage.setItem('process_name_history', historyStr);
        console.log('保存到localStorage:', historyStr);

        // 6. 立即更新datalist
        updateProcessNameDatalist(history);

    } catch (error) {
        console.error('保存工序名称历史记录失败:', error);
    }
}


// 更新工序名称datalist
function updateProcessNameDatalist(history) {
    console.log('更新datalist，历史记录:', history);

    // 确保datalist元素存在
    let datalist = document.getElementById('process-name-history');
    if (!datalist) {
        datalist = document.createElement('datalist');
        datalist.id = 'process-name-history';
        document.body.appendChild(datalist);
        console.log('创建新的datalist元素');
    }

    // 清空现有选项
    datalist.innerHTML = '';

    // 添加新选项 - 确保每个值都是字符串
    history.forEach(item => {
        const option = document.createElement('option');
        option.value = String(item); // 确保转换为字符串
        option.textContent = String(item);
        datalist.appendChild(option);
    });

    console.log('datalist已更新，选项数:', datalist.childElementCount);

    // 更新所有输入框的绑定
    updateAllInputBindings();
}

// 新增函数：更新所有输入框的list属性绑定
function updateAllInputBindings() {
    const inputs = document.querySelectorAll('.process-name-input, td.col-2[contenteditable]');

    inputs.forEach((input, index) => {
        // 确保输入框有list属性
        if (!input.hasAttribute('list')) {
            input.setAttribute('list', 'process-name-history');
        }

        console.log(`输入框${index}绑定:`, {
            element: input,
            listId: input.getAttribute('list'),
            hasDatalist: !!document.getElementById('process-name-history')
        });
    });
}

// 显示工序名称建议（当单元格获得焦点时）
function showProcessNameSuggestions(cell) {
    const rect = cell.getBoundingClientRect();
    const history = getProcessNameHistory();

    if (history.length > 0) {
        // 可以在这里显示自定义的下拉菜单
        // 或者依赖浏览器的datalist自动完成功能
    }
}

// 保存工序名称输入（实时保存）
function saveProcessNameInput(cell) {
    const processName = cell.textContent.trim();
    if (processName) {
        // 延迟保存，避免频繁操作
        clearTimeout(window.processNameSaveTimer);
        window.processNameSaveTimer = setTimeout(() => {
            // saveProcessNameToHistory(processName);
        }, 500);
    }
}

// 初始化工序内容记忆功能
function initProcessContentMemory() {
    console.log('=== 初始化工序内容记忆功能 ===');

    // 加载工序内容历史记录
    const contentHistory = getProcessContentHistory();
    console.log('工序内容历史记录:', contentHistory.length, '条');

    // 监听所有工序内容单元格的blur事件
    // 已经在initProcessNameMemory中添加了，这里可以添加其他初始化逻辑

    // 如果需要为工序内容也创建datalist，可以在这里添加
    createProcessContentDatalist(contentHistory);
}

// 创建工序内容datalist（如果需要）
function createProcessContentDatalist(history) {
    if (!history || history.length === 0) {
        console.log('没有工序内容历史记录，不创建datalist');
        return;
    }

    console.log('创建工序内容datalist，历史记录:', history);

    // 确保datalist元素存在
    let datalist = document.getElementById('process-content-history');
    if (!datalist) {
        datalist = document.createElement('datalist');
        datalist.id = 'process-content-history';
        document.body.appendChild(datalist);
        console.log('创建新的工序内容datalist元素');
    }

    // 清空现有选项
    datalist.innerHTML = '';

    // 添加新选项
    history.forEach(item => {
        if (item && item.trim() !== '') {
            const option = document.createElement('option');
            option.value = String(item);
            option.textContent = String(item);
            datalist.appendChild(option);
        }
    });

    console.log(`工序内容datalist创建完成，添加了 ${history.length} 个选项`);

    // 为所有工序内容单元格绑定datalist
    updateProcessContentBindings();
}
// 更新工序内容单元格的datalist绑定
// 更新工序内容单元格的datalist绑定
function updateProcessContentBindings() {
    const contentCells = document.querySelectorAll('#processTable tbody td.col-3');
    const datalist = document.getElementById('process-content-history');

    console.log(`找到 ${contentCells.length} 个工序内容单元格`);

    contentCells.forEach((cell, index) => {
        // 确保datalist存在
        if (!datalist) {
            console.error('没有找到工序内容datalist');
            return;
        }

        // 设置list属性指向datalist
        if (!cell.hasAttribute('list')) {
            cell.setAttribute('list', 'process-content-history');
            console.log(`单元格 ${index} 绑定datalist`);
        }

        // 检查绑定是否有效
        if (cell.getAttribute('list') !== 'process-content-history') {
            console.warn(`单元格 ${index} 的list属性不匹配:`, cell.getAttribute('list'));
        }
    });

    console.log('工序内容单元格绑定完成');
}

// 获取工序内容历史记录
function getProcessContentHistory() {
    try {
        const historyStr = localStorage.getItem('process_content_history');
        return historyStr ? JSON.parse(historyStr) : [];
    } catch (error) {
        console.error('读取工序内容历史记录失败:', error);
        return [];
    }
}

// 保存工序内容到历史记录
function saveProcessContentToHistory(content) {
    try {
        if (!content || content.trim() === '') {
            return;
        }

        content = content.trim();
        let history = getProcessContentHistory();

        // 去重
        history = history.filter(item => item !== content);

        // 新记录放前面
        history.unshift(content);

        // 只保留最近的15条记录
        if (history.length > 15) {
            history = history.slice(0, 15);
        }

        // 保存到本地存储
        localStorage.setItem('process_content_history', JSON.stringify(history));

        console.log('工序内容保存成功:', content);

        // 更新datalist
        createProcessContentDatalist(history);

    } catch (error) {
        console.error('保存工序内容历史记录失败:', error);
    }
}

// 保存所有工序名称到历史记录
function saveAllProcessNamesToHistory() {
    const processNames = new Set();

    $('#processTable tbody tr').each(function() {
        const processName = $(this).find('td.col-2').text().trim();
        if (processName) {
            processNames.add(processName);
        }
    });

    // 保存每个工序名称
    processNames.forEach(name => {
        saveProcessNameToHistory(name);
    });
}

// 新增：初始化工序内容历史记录和下拉功能
function initProcessContentWithDropdown() {
    console.log('=== 初始化工序内容下拉功能 ===');

    // 创建工序内容datalist
    let datalist = document.getElementById('process-content-history');
    if (!datalist) {
        datalist = document.createElement('datalist');
        datalist.id = 'process-content-history';
        document.body.appendChild(datalist);
        console.log('创建工序内容datalist元素');
    }

    // 加载历史记录到datalist
    updateProcessContentDatalist();

    // 监听工序内容单元格焦点事件，显示历史记录
    $(document).on('focus', '#processTable tbody td.col-3', function() {
        showProcessContentSuggestions(this);
    });

    // 监听工序内容输入事件，禁用实时保存
    $(document).on('input', '#processTable tbody td.col-3', function() {
        // 禁用实时保存功能
    });

    // 初始化绑定所有现有的工序内容单元格
    setTimeout(() => {
        updateProcessContentBindings();
    }, 1000);
}

// 显示工序内容建议
function showProcessContentSuggestions(cell) {
    const history = getProcessContentHistory();
    if (history.length === 0) {
        console.log('没有工序内容历史记录');
        return;
    }

    // 确保有datalist
    let datalist = document.getElementById('process-content-history');
    if (!datalist) {
        console.log('创建新的工序内容datalist');
        datalist = document.createElement('datalist');
        datalist.id = 'process-content-history';
        document.body.appendChild(datalist);
    }

    // 检查datalist选项数量
    const optionCount = datalist.querySelectorAll('option').length;
    console.log(`工序内容datalist有 ${optionCount} 个选项，历史记录有 ${history.length} 条`);

    if (optionCount === 0) {
        // 如果datalist为空，重新加载
        updateProcessContentDatalist();
    }

    // 记录用户输入，用于调试
    console.log('用户点击工序内容单元格，当前内容:', cell.textContent);
}

// 更新工序内容datalist
function updateProcessContentDatalist() {
    const history = getProcessContentHistory();
    const datalist = document.getElementById('process-content-history');

    if (!datalist) {
        console.error('找不到工序内容datalist元素');
        return;
    }

    console.log('更新工序内容datalist，历史记录:', history);

    // 清空现有选项
    datalist.innerHTML = '';

    if (history.length === 0) {
        console.log('没有工序内容历史记录');
        return;
    }

    // 添加新选项
    history.forEach(item => {
        if (item && item.trim() !== '') {
            const option = document.createElement('option');
            option.value = String(item);
            datalist.appendChild(option);
        }
    });

    console.log(`工序内容datalist已更新，添加了 ${history.length} 个选项`);

    // 立即更新所有绑定
    updateProcessContentBindings();
}

// 保存工序内容输入（禁用实时保存）
function saveProcessContentInput(cell) {
    // 禁用实时保存功能已禁用，改为在保存按钮触发时统一处理
    return;
}

// 保存上一次选择的人名
function saveLastSelectedName(fieldId, name) {
    if (name && name.trim()) {
        localStorage.setItem(`last_name_${fieldId}`, name.trim());
    }
}

// 获取上一次选择的人名
function getLastSelectedName(fieldId) {
    return localStorage.getItem(`last_name_${fieldId}`) || '';
}

// 监听下拉框变化，保存选择
function initNameDropdownMemory() {
    // 监听工艺员下拉框变化
    $('#gyy').on('change', 'select', function() {
        const value = $(this).val();
        if (value) {
            saveLastSelectedName('gyy', value);
            console.log('保存工艺员选择:', value);
        }
    });

    // 监听校对员下拉框变化
    $('#jdy').on('change', 'select', function() {
        const value = $(this).val();
        if (value) {
            saveLastSelectedName('jdy', value);
            console.log('保存校对员选择:', value);
        }
    });

    // 监听批准人下拉框变化
    $('#pzr').on('change', 'select', function() {
        const value = $(this).val();
        if (value) {
            saveLastSelectedName('pzr', value);
            console.log('保存批准人选择:', value);
        }
    });

    // 页面加载时，如果没有下拉框值，使用上一次保存的值
    setTimeout(() => {
        // 检查工艺员下拉框是否有值，没有则使用上次保存的
        if (!$('#gyy select').val()) {
            const lastGyy = getLastSelectedName('gyy');
            if (lastGyy) {
                setDropdownValue('gyy', lastGyy);
                console.log('页面加载时设置工艺员默认值:', lastGyy);
            }
        }

        // 检查校对员下拉框是否有值，没有则使用上次保存的
        if (!$('#jdy select').val()) {
            const lastJdy = getLastSelectedName('jdy');
            if (lastJdy) {
                setDropdownValue('jdy', lastJdy);
                console.log('页面加载时设置校对员默认值:', lastJdy);
            }
        }

        // 检查批准人下拉框是否有值，没有则使用上次保存的
        if (!$('#pzr select').val()) {
            const lastPzr = getLastSelectedName('pzr');
            if (lastPzr) {
                setDropdownValue('pzr', lastPzr);
                console.log('页面加载时设置批准人默认值:', lastPzr);
            }
        }
    }, 1000); // 延迟1秒确保下拉框已创建
}

// 创建工序内容自定义下拉（与工序名称保持同步）
function createProcessContentCustomDropdown() {
    // 1. 创建自定义下拉容器（如果不存在）
    let dropdownContainer = document.getElementById('process-content-dropdown');
    if (!dropdownContainer) {
        dropdownContainer = document.createElement('div');
        dropdownContainer.id = 'process-content-dropdown';
        dropdownContainer.style.cssText = `
            position: absolute;
            background: white;
            border: 1px solid #ccc;
            max-height: 200px;
            overflow-y: auto;
            display: none;
            z-index: 1000;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        `;
        document.body.appendChild(dropdownContainer);
        console.log('创建工序内容自定义下拉容器');
    }

    // 2. 监听工序内容单元格的焦点/点击/输入事件
    $(document).on('focus click input', '#processTable tbody td.col-3', function(e) {
        const cell = this;
        const rect = cell.getBoundingClientRect();
        const history = getProcessContentHistory();

        if (history.length === 0) {
            console.log('没有工序内容历史记录');
            return;
        }

        // 显示下拉
        dropdownContainer.innerHTML = '';
        dropdownContainer.style.display = 'block';
        dropdownContainer.style.left = rect.left + 'px';
        dropdownContainer.style.top = (rect.bottom + 5) + 'px';
        dropdownContainer.style.width = rect.width + 'px';

        // 添加选项
        history.forEach(item => {
            if (item && item.trim() !== '') {
                const option = document.createElement('div');
                option.textContent = item;
                option.style.cssText = `
                    padding: 5px 10px;
                    cursor: pointer;
                    border-bottom: 1px solid #eee;
                `;
                option.onmouseover = () => option.style.background = '#f0f0f0';
                option.onmouseout = () => option.style.background = 'white';
                option.onclick = () => {
                    cell.textContent = item;
                    dropdownContainer.style.display = 'none';
                    // 触发输入事件
                    const event = new Event('input', { bubbles: true });
                    cell.dispatchEvent(event);
                };
                dropdownContainer.appendChild(option);
            }
        });
    });

    // 3. 点击其他地方隐藏下拉
    document.addEventListener('click', function(e) {
        if (!e.target.closest('#process-content-dropdown') &&
            !e.target.closest('#processTable tbody td.col-3')) {
            dropdownContainer.style.display = 'none';
        }
    });
}

// 在saveProcessData函数中，添加保存所有工序内容到历史记录的功能
function saveAllProcessContentsToHistory() {
    const processContents = new Set();

    $('#processTable tbody tr').each(function() {
        const processContent = $(this).find('td.col-3').text().trim();
        if (processContent) {
            processContents.add(processContent);
        }
    });

    // 保存每个工序内容
    processContents.forEach(content => {
        saveProcessContentToHistory(content);
    });
}

// 增强工序内容历史记录保存函数，与工序名称保持一致
function saveProcessContentToHistoryEnhanced(content) {
    if (!content || content.trim() === '') {
        return;
    }

    const name = content.trim();
    console.log('保存工序内容:', name);

    try {
        // 1. 获取当前历史记录
        let history = getProcessContentHistory();
        console.log('当前工序内容历史记录:', history);

        // 2. 去重（不区分大小写）
        history = history.filter(item =>
            item.toString().toLowerCase() !== name.toLowerCase()
        );

        // 3. 新记录放前面
        history.unshift(name);

        // 4. 只保留最近的20条记录（与工序名称一致）
        if (history.length > 20) {
            history = history.slice(0, 20);
        }

        // 5. 保存到localStorage
        const historyStr = JSON.stringify(history);
        localStorage.setItem('process_content_history', historyStr);
        console.log('工序内容保存到localStorage:', historyStr);

        // 6. 立即更新datalist
        updateProcessContentDatalist(history);

    } catch (error) {
        console.error('保存工序内容历史记录失败:', error);
    }
}