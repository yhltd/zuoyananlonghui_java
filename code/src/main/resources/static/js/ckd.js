// ==================== 日期相关函数 ====================
function getCurrentDate1() {
    var now = new Date();
    var year = now.getFullYear();
    var month = String(now.getMonth() + 1).padStart(2, '0');
    var day = String(now.getDate()).padStart(2, '0');
    return year + '-' + month + '-' + day;
}

function getCurrentDateTime1() {
    var now = new Date();
    var year = now.getFullYear();
    var month = String(now.getMonth() + 1).padStart(2, '0');
    var day = String(now.getDate()).padStart(2, '0');
    var hours = String(now.getHours()).padStart(2, '0');
    var minutes = String(now.getMinutes()).padStart(2, '0');
    var seconds = String(now.getSeconds()).padStart(2, '0');
    return year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds;
}

// ==================== 全局变量 ====================
var idd;

// ==================== 工具函数 ====================
// 安全处理ID的工具函数
function safeProcessId(idValue) {
    if (idValue === undefined || idValue === null) {
        return null;
    }

    // 转换为字符串
    var idStr = String(idValue);

    // 去除前后空格
    idStr = idStr.trim();

    // 如果是空字符串，返回null
    if (idStr === '') {
        return null;
    }

    return idStr;
}

// ==================== 初始化函数 ====================
function initTitleInputs() {
    console.log("initTitleInputs 函数被调用");
    // 具体的初始化逻辑...
}

// ==================== 出库单初始化函数 ====================
function initReturnOrder1() {
    loadOrderNumbers();
    // 设置当前日期
    $('#return-date1').val(getCurrentDate1());

    // 绑定事件
    bindReturnOrderEvents1();

    // 添加合计行
    addTotalRow();

    // 初始化计算
    calculateTotalAmount1();

    // 尝试从sessionStorage加载数据
    loadDataFromSessionStorage();
}

// 从sessionStorage加载数据 - 修改支持多条数据
function loadDataFromSessionStorage() {
    try {
        var returnDataStr = sessionStorage.getItem('currentReturnData');

        if (returnDataStr) {
            var returnData = JSON.parse(returnDataStr);
            console.log('从sessionStorage接收到出库数据:', returnData);

            if (returnData.selectedRows && returnData.selectedRows.length > 0) {
                // 直接使用传递过来的多条数据填充表格
                console.log('接收到多条数据，直接填充表格:', returnData.selectedRows.length, '条');

                // 直接使用传递的数据填充表格，无需再次请求后端
                fillReturnOrderTableFromData(returnData.selectedRows);

                // 设置出库单号
                $('#return-no1').val(generateReturnNo1());

                // 修改这里：将设置输入框值改为设置下拉框默认值
                if (returnData.selectedRows.length > 0) {
                    var customerName = returnData.selectedRows[0].c || '';
                    setTimeout(function() {
                        setContactUnitDefault(customerName);
                    }, 100);
                }

                // 设置日期为当前日期
                $('#return-date1').val(getCurrentDate1());

                // 清理sessionStorage
                sessionStorage.removeItem('currentReturnData');
            } else {
                console.log('没有找到有效的selectedRows数据');
                // 尝试使用ID加载
                loadDataFromURLParams();
            }
        } else {
            console.log('没有从sessionStorage找到数据，检查URL参数');
            // 检查URL参数
            loadDataFromURLParams();
        }
    } catch (e) {
        console.error('从sessionStorage加载数据错误:', e);
        loadDataFromURLParams();
    }
}

// 从传递的数据直接填充表格（支持多条数据）
function fillReturnOrderTableFromData(dataRows) {
    console.log('=== fillReturnOrderTableFromData 开始 ===');
    console.log('接收到的数据行:', dataRows);

    var tableBody = $('#return-detail-table1 tbody');
    tableBody.empty();

    if (!dataRows || dataRows.length === 0) {
        console.log('数据为空');
        tableBody.append(`
            <tr>
                <td colspan="14" class="text-center">暂无数据</td>
            </tr>
        `);
        return;
    }

    console.log('数据长度:', dataRows.length);

    // 遍历数据并生成表格行
    dataRows.forEach(function(rowData, index) {
        console.log(`第${index}行数据:`, rowData);

        // 计算单价和金额
        var unitPrice = calculateUnitPrice(rowData);
        var amount = calculateAmount(rowData, unitPrice);

        // 获取原始ID，确保是字符串
        var originalId = rowData.id || rowData.a || '';
        if (originalId !== undefined && originalId !== null) {
            originalId = String(originalId);
        } else {
            originalId = '';
        }

        var row = `
             <tr data-original-id="${originalId}">
                <td><input type="checkbox" class="row-select1"></td>
                <td>${index + 1}</td>
                <td><input type="text" class="form-control form-control-sm" name="contractNo" value="${rowData.d || ''}"></td>
                <td><input type="text" class="form-control form-control-sm" name="taskNo" value="${rowData.e || ''}"></td>
                <td><input type="text" class="form-control form-control-sm" name="gongxu" value="${rowData.g || ''}"></td>
                <td><input type="text" class="form-control form-control-sm" name="productName" value="${rowData.h || ''}"></td>
                <td><input type="text" class="form-control form-control-sm" name="drawingNo" value="${rowData.i || ''}"></td>
                <td><input type="text" class="form-control form-control-sm" name="unit" value="${rowData.j || ''}"></td>
                <td><input type="number" class="form-control form-control-sm quantity-input" name="quantity" value="${rowData.k || '1'}"></td>
                <td><input type="number" class="form-control form-control-sm" name="unitPrice" value="${rowData.m || '1'}"></td>
                <td><input type="number" class="form-control form-control-sm" name="amount" value="${amount}" readonly></td>
                <td><input type="text" class="form-control form-control-sm" name="material" value="${rowData.l || ''}"></td>
                <td><input type="text" class="form-control form-control-sm" name="weight" value="${rowData.aw || ''}"></td>
                <td><input type="text" class="form-control form-control-sm" name="remark" value="${rowData.ax || ''}"></td>
            </tr>
        `;
        tableBody.append(row);
    });

    // 设置往来单位（使用第一个数据的业务单位）
    if (dataRows.length > 0) {
        var customer = dataRows[0].c || '';
        $('#return-customer1').val(customer);
        console.log('设置往来单位:', customer);
    }

    // 计算总金额和总数量
    calculateTotalAmount1();

    console.log('表格填充完成，共填充', dataRows.length, '行数据');
    console.log('=== fillReturnOrderTableFromData 结束 ===');
}

// 从URL参数加载数据
function loadDataFromURLParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const idsParam = urlParams.get('ids');
    const idParam = urlParams.get('id');

    if (idsParam) {
        console.log('从URL参数获取IDs:', idsParam);
        loadDataByIds(idsParam);
    } else if (idParam) {
        console.log('从URL参数获取单个ID:', idParam);
        loadDataByIds(idParam);
    } else {
        console.log('没有找到要加载的数据');
        // 添加一个空行以便用户手动输入
        addNewRow();
    }
}

// ==================== 出库单事件绑定函数 ====================
function bindReturnOrderEvents1() {
    console.log('绑定出库单事件...');
    // ============ 新增：自动填充当前日期 ============

    // ==============================================
    // 全选/取消全选
    $('#select-all1').off('click').on('click', function() {
        $('.row-select1').prop('checked', this.checked);
    });

    // 添加行
    $('#add-row-btn1').off('click').on('click', function() {
        addReturnRow1();
    });

    // 删除选中行
    $('#remove-row-btn1').off('click').on('click', function() {
        removeSelectedRows1();
    });

    // 保存出库单 - 使用saveReturnOrder函数
    $("#save-return-btn1").off('click').on('click', function() {
        saveReturnOrder();
    });

    // 打印
    $('#print-outbound-btn').off('click').on('click', function() {
        var currentDate = getCurrentDate1();
        $('#return-date1').val(currentDate);
        console.log('已自动设置退货日期为:', currentDate);
        saveReturnOrder();
        printOutboundOrder();
    });

    // 新增：打印预览按钮点击事件
    $('#print-preview-btn').off('click').on('click', function() {
        showPrintPreview();
    });

    // 新增：列选择按钮点击事件
    $('#column-select-btn').off('click').on('click', function() {
        showColumnSelectModal();
    });

    // 实时计算金额和数量 - 合并成一个事件处理
    $(document).off('input', 'input[name="quantity"], input[name="unitPrice"]').on('input', 'input[name="quantity"], input[name="unitPrice"]', function() {
        calculateRowAmount1($(this).closest('tr'));
    });

    // 更新全选状态
    $(document).off('change', '.row-select1').on('change', '.row-select1', function() {
        updateSelectAllState1();
    });

    console.log('出库单事件绑定完成');
}

// ==================== 表格操作函数 ====================
function updateSelectAllState1() {
    var allChecked = $('.row-select1:checked').length === $('.row-select1').length;
    $('#select-all1').prop('checked', allChecked);
}

// 同样修改 addReturnRow1 函数
function addReturnRow1() {
    var table = $('#return-detail-table1 tbody');
    var rowCount = table.find('tr').length;
    var newRow = `
        <tr>
            <td><input type="checkbox" class="row-select1"></td>
            <td>${rowCount + 1}</td>
            <td><input type="text" class="form-control form-control-sm" name="contractNo"></td>
            <td><input type="text" class="form-control form-control-sm" name="taskNo"></td>
            <td><input type="text" class="form-control form-control-sm" name="process"></td>
            <td><input type="text" class="form-control form-control-sm" name="productName"></td>
            <td><input type="text" class="form-control form-control-sm" name="drawingNo"></td>
            <td><input type="text" class="form-control form-control-sm" name="unit"></td>
            <td><input type="number" class="form-control form-control-sm quantity-input" name="quantity" value="1"></td>
            <td><input type="number" class="form-control form-control-sm" name="unitPrice" value="0"></td>
            <td><input type="number" class="form-control form-control-sm" name="amount" value="0" readonly></td>
            <td><input type="text" class="form-control form-control-sm" name="material"></td>
            <td><input type="text" class="form-control form-control-sm" name="weight"></td>
            <td><input type="text" class="form-control form-control-sm" name="remark"></td>
        </tr>
    `;
    table.append(newRow);
    updateRowNumbers1();
    // 更新合计数量
    calculateTotalQuantity1();
}

function removeSelectedRows1() {
    var selectedRows = $('.row-select1:checked');
    if (selectedRows.length === 0) {
        alert('请选择要删除的行');
        return;
    }

    if (confirm('确定要删除选中的行吗？')) {
        selectedRows.each(function() {
            $(this).closest('tr').remove();
        });
        updateRowNumbers1();
        calculateTotalAmount1(); // 删除后重新计算合计
    }
}

function updateRowNumbers1() {
    $('#return-detail-table1 tbody tr').each(function(index) {
        $(this).find('td:eq(1)').text(index + 1);
    });
}

function calculateRowAmount1(row) {
    var quantity = parseFloat(row.find('input[name="quantity"]').val()) || 0;
    var unitPrice = parseFloat(row.find('input[name="unitPrice"]').val()) || 0;
    var amount = quantity * unitPrice;
    row.find('input[name="amount"]').val(amount.toFixed(2));

    // 更新合计
    calculateTotalAmount1();

    return amount;
}

function calculateTotalAmount1() {
    var totalAmount = 0;
    var totalQuantity = 0;

    $('#return-detail-table1 tbody tr').each(function() {
        var quantity = parseFloat($(this).find('input[name="quantity"]').val()) || 0;
        var unitPrice = parseFloat($(this).find('input[name="unitPrice"]').val()) || 0;
        var amount = quantity * unitPrice;

        totalQuantity += quantity;
        totalAmount += amount;

        $(this).find('input[name="amount"]').val(amount.toFixed(2));
    });

    // 更新合计行
    $('#total-quantity').val(totalQuantity);
    $('#total-amount-display').val(totalAmount.toFixed(2));

    // 更新原有的总金额显示
    $('#total-amount1').text(totalAmount.toFixed(2));
    $('#total-amount-chinese1').text(numberToChinese1(totalAmount));

    return {
        totalAmount: totalAmount,
        totalQuantity: totalQuantity
    };
}

function numberToChinese1(num) {
    if (num === 0) return '零元整';

    var chineseNum = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
    var chineseUnit = ['', '拾', '佰', '仟'];
    var bigUnit = ['', '万', '亿'];

    var numStr = Math.round(num * 100).toString();
    var integerPart = numStr.slice(0, -2) || '0';
    var decimalPart = numStr.slice(-2);

    var integerChinese = '';
    var integerArray = integerPart.split('').reverse();

    for (var i = 0; i < integerArray.length; i++) {
        var digit = parseInt(integerArray[i]);
        var unit = chineseUnit[i % 4];
        var bigUnitIndex = Math.floor(i / 4);
        var bigUnitChar = bigUnit[bigUnitIndex];

        if (digit === 0) {
            if (integerChinese.charAt(0) !== '零' && i % 4 !== 0) {
                integerChinese = '零' + integerChinese;
            }
        } else {
            integerChinese = chineseNum[digit] + unit + bigUnitChar + integerChinese;
        }
    }

    var decimalChinese = '';
    var jiao = parseInt(decimalPart.charAt(0)) || 0;
    var fen = parseInt(decimalPart.charAt(1)) || 0;

    if (jiao > 0) {
        decimalChinese += chineseNum[jiao] + '角';
    }
    if (fen > 0) {
        decimalChinese += chineseNum[fen] + '分';
    }

    var result = integerChinese + '元';
    if (decimalChinese) {
        result += decimalChinese;
    } else {
        result += '整';
    }

    return result;
}

// ==================== 数据加载函数 ====================
// 根据多个ID加载数据（备用方案）
function loadDataByIds(ids) {
    console.log('开始根据ID查询数据:', ids);
    console.log('ids类型:', typeof ids);

    // 参数验证和处理
    if (!ids && ids !== 0) {
        swal("参数错误", "没有提供ID参数", "error");
        return;
    }

    let idsArray;
    if (typeof ids === 'string') {
        idsArray = ids.split(',').filter(id => id.trim() !== '');
    } else if (Array.isArray(ids)) {
        idsArray = ids.filter(id => id !== null && id !== undefined && id.toString().trim() !== '');
    } else if (typeof ids === 'number') {
        idsArray = [ids.toString()];
    } else {
        idsArray = [ids.toString()].filter(id => id.trim() !== '');
    }

    if (idsArray.length === 0) {
        swal("参数错误", "没有有效的ID参数", "error");
        return;
    }

    console.log('处理后的IDs数组:', idsArray);

    $ajax({
        type: 'post',
        url: '/ckd/getByIds',
        data: {
            ids: idsArray.join(',')
        }
    }, false, '', function(res) {
        console.log('API响应:', res);

        if (res.code == 200 && res.data && res.data.length > 0) {
            fillReturnOrderTable(res.data);
            swal("数据加载成功", `已加载 ${res.data.length} 条数据`, "success");
        } else {
            swal("数据加载失败", res.msg || "未找到对应数据", "error");
        }
    }, function(xhr, status, error) {
        console.error('查询失败:', error);
        swal("查询失败", "网络错误: " + error, "error");
    });
}

// 填充表格数据（从后端API）
// 修改 fillReturnOrderTable 函数
// 填充表格数据（从后端API）
function fillReturnOrderTable(data) {
    console.log('=== fillReturnOrderTable 开始 ===');
    console.log('接收到的完整数据:', data);

    var tableBody = $('#return-detail-table1 tbody');
    tableBody.empty();

    if (!data || data.length === 0) {
        console.log('数据为空');
        tableBody.append(`
            <tr>
                <td colspan="14" class="text-center">暂无数据</td>
            </tr>
        `);
        return;
    }

    console.log('数据长度:', data.length);

    // 遍历数据并生成表格行
    data.forEach(function(item, index) {
        var rowData = item.data || item;
        console.log(`第${index}行数据:`, rowData);

        // 计算单价和金额
        var unitPrice = calculateUnitPrice(rowData);
        var amount = calculateAmount(rowData, unitPrice);

        // 获取原始ID，确保是字符串
        var originalId = rowData.id || rowData.a || '';
        if (originalId !== undefined && originalId !== null) {
            originalId = String(originalId);
        } else {
            originalId = '';
        }

        var row = `
             <tr data-original-id="${originalId}">
                <td><input type="checkbox" class="row-select1"></td>
                <td>${index + 1}</td>
                <td><input type="text" class="form-control form-control-sm" name="contractNo" value="${rowData.d || ''}"></td>
                <td><input type="text" class="form-control form-control-sm" name="taskNo" value="${rowData.e || ''}"></td>
                <td><input type="text" class="form-control form-control-sm" name="gongxu" value="${rowData.g || ''}"></td>
                <td><input type="text" class="form-control form-control-sm" name="productName" value="${rowData.h || ''}"></td>
                <td><input type="text" class="form-control form-control-sm" name="drawingNo" value="${rowData.i || ''}"></td>
                <td><input type="text" class="form-control form-control-sm" name="unit" value="${rowData.j || ''}"></td>
                <td><input type="number" class="form-control form-control-sm" name="quantity" value="${rowData.k || ''}"></td>
                <td><input type="number" class="form-control form-control-sm" name="unitPrice" value="${unitPrice}"></td>
                <td><input type="number" class="form-control form-control-sm" name="amount" value="${amount}" readonly></td>
                <td><input type="text" class="form-control form-control-sm" name="material" value="${rowData.l || ''}"></td>
                <td><input type="text" class="form-control form-control-sm" name="weight" value="${rowData.n || ''}"></td>
                <td><input type="text" class="form-control form-control-sm" name="remark" value="${rowData.ax || ''}"></td>
            </tr>
        `;
        tableBody.append(row);
    });

    // 修改这里：将设置输入框值改为设置下拉框默认值
    if (data.length > 0) {
        var firstRowData = data[0].data || data[0];
        var customerName = firstRowData.c || '';
        setTimeout(function() {
            setContactUnitDefault(customerName);
        }, 100);
        console.log('设置往来单位:', customerName);
    }

    // 计算总金额
    calculateTotalAmount1();

    console.log('表格填充完成，共填充', data.length, '行数据');
    console.log('=== fillReturnOrderTable 结束 ===');
}

// 计算单价的函数
function calculateUnitPrice(rowData) {
    var sum = 0;
    var columns = ['s', 'u', 'w', 'y', 'aa', 'ac', 'ae', 'ag', 'ai', 'ak', 'am', 'ao'];

    columns.forEach(function(field) {
        var columnValue = rowData[field];
        if (columnValue !== null && columnValue !== undefined && columnValue !== '') {
            sum += parseFloat(columnValue) || 0;
        }
    });

    return sum.toFixed(2);
}

// 计算金额的函数
function calculateAmount(rowData, unitPrice) {
    var quantity = parseFloat(rowData.k) || 0;
    var price = parseFloat(unitPrice) || 0;

    if (quantity > 0 && price > 0) {
        return (quantity * price).toFixed(2);
    }
    return '0.00';
}


// 生成出库单号
function generateReturnNo1() {
    $ajax({
        type: 'post',
        url: '/ckd_c/getddh',
    }, false, '', function (res) {
        if (res.code == 200) {
            var now = new Date();
            var dateStr = now.getFullYear() +
                String(now.getMonth() + 1).padStart(2, '0') +
                String(now.getDate()).padStart(2, '0');
            maxNo = res.data;  // 注意：这里是小写 f，但数据库字段是大写 F
            var newReturnNo;

            if (!maxNo || maxNo === '') {
                newReturnNo = "LH-" + dateStr + "0001";
            } else {
                var numberPart = maxNo.split("-")[1];
                var nextNum = parseInt(numberPart) + 1;
                newReturnNo = "LH-" + nextNum;
            }

            // 直接填入输入框
            $('#return-no1').val(newReturnNo);
            console.log('退货单号已更新:', newReturnNo);

        } else {
            console.error('获取单号失败');
            // 失败时生成临时单号
            var tempNo = "LH-" + new Date().getTime();
            $('#return-no1').val(tempNo);
        }
    });  // 这里添加了缺少的右括号
}



// ==================== 出库单保存函数（修正字段映射） ====================
function saveReturnOrder() {
    console.log('开始保存出库单数据...');

    // 1. 收集表单数据 - 根据数据库实际字段名
    var formData = {
        // 头部信息 - 对应chuku表字段
        c: $('#return-customer1').val() || '',     // 往来单位 (c字段)
        e: $('#return-date1').val() || '',         // 出库日期 (e字段)
        f: $('#return-no1').val() || '',           // 出库单号 (f字段)

        // 底部信息
        r: $('#company-address1').val() || '',     // 地址/制单人 (r字段)
        s: $('#company-phone1').val() || '',       // 电话/审核人 (s字段)
        t: $('#songhuoren').val() || '',           // 送货人 (t字段)
        u: $('#shouhuoren').val() || '',           // 收货人 (u字段)

        // 明细信息 - 每条记录都要保存的字段
        details: []
    };

    console.log('表单头部数据:', formData);
    // ============ 新增：保存制单人到历史记录 ============
    var preparerName = formData.r || '';
    if (preparerName && preparerName.trim() !== '') {
        savePreparerToHistory(preparerName);
        // 更新下拉框的历史记录
        loadPreparerHistoryToSelect();
    }
    // ==================================================

    // 验证必填字段
    if (!formData.f || formData.f.trim() === '') {
        alert("出库单号不能为空");
        return;
    }

    if (!formData.c || formData.c.trim() === '') {
        alert("往来单位不能为空");
        return;
    }

    if (!formData.e || formData.e.trim() === '') {
        alert("出库日期不能为空");
        return;
    }

    // 收集所有原始ID（用于更新合同状态）
    var contractIds = [];

    // 收集表格数据
    var hasData = false;
    $('#return-detail-table1 tbody tr').each(function(index) {
        var $row = $(this);

        // 使用安全处理ID函数
        var originalId = $row.data('original-id');
        var processedId = safeProcessId(originalId);
        if (processedId !== null) {
            contractIds.push(processedId);
        }

        // 收集每行数据 - 根据查询返回的字段映射
        var rowData = {
            // 基础字段
            id: processedId || '',  // 原始ID（如果有）

            // 表格中的字段映射到数据库字段
            o: $row.find('input[name="contractNo"]').val() || '',        // 合同号 (o字段)
            p: $row.find('input[name="taskNo"]').val() || '',            // 任务号 (p字段)
            q: $row.find('input[name="gongxu"]').val() || '',            // 工序 (q字段)
            f: $row.find('input[name="productName"]').val() || '',       // 产品名称 (f字段)
            g: $row.find('input[name="drawingNo"]').val() || '',         // 图号 (g字段)
            h: $row.find('input[name="unit"]').val() || '',              // 单位 (h字段)
            i: $row.find('input[name="quantity"]').val() || '',          // 数量 (i字段)
            j: $row.find('input[name="unitPrice"]').val() || '0.00',     // 单价 (j字段)
            k: $row.find('input[name="amount"]').val() || '0.00',        // 金额 (k字段)
            l: $row.find('input[name="material"]').val() || '',          // 材质 (l字段)
            m: $row.find('input[name="weight"]').val() || '',            // 重量 (m字段)
            n: $row.find('input[name="remark"]').val() || ''             // 备注 (n字段)
        };

        console.log(`第${index + 1}行数据:`, rowData);

        // 只要有任意一个字段有值，就认为有数据
        if (rowData.o || rowData.p || rowData.f || rowData.i) {
            formData.details.push(rowData);
            hasData = true;
        }
    });

    if (!hasData) {
        alert("没有要保存的明细数据");
        return;
    }

    console.log('收集到的原始ID:', contractIds);
    console.log('要保存的完整数据:', formData);

    // 防止重复提交
    var $btn = $("#save-return-btn1");
    if ($btn.data('submitting')) {
        return;
    }
    $btn.data('submitting', true);
    $btn.prop('disabled', true);

    // 先检查出库单号是否已存在
    checkChukudanhaoExists(formData.f, function(exists, count, existingData) {
        if (exists) {
            // 先恢复按钮状态
            $btn.data('submitting', false);
            $btn.prop('disabled', false);

            // 使用confirm对话框提示用户
            var userChoice = confirm(`出库单号 ${formData.f} 在数据库中已有 ${count} 条记录\n\n是否要删除原有数据并保存新数据？\n\n点击"确定"删除原有数据并保存\n点击"取消"清空页面表格`);

            if (userChoice) {
                // 用户点击"确定" - 先删除已有数据，再保存新数据
                $btn.data('submitting', true);
                $btn.prop('disabled', true);

                deleteExistingChukudan(formData.f, function() {
                    // 删除成功后保存新数据
                    saveChukudanData(formData, contractIds, $btn);
                }, function(errorMsg) {
                    // 删除失败的处理
                    $btn.data('submitting', false);
                    $btn.prop('disabled', false);
                    alert("删除失败: " + errorMsg);
                });
            } else {
                // 用户点击"取消" - 清空页面表格
                clearChukuForm();
                alert("已清空页面表格，请重新填写数据");
            }
        } else {
            // 直接保存数据
            saveChukudanData(formData, contractIds, $btn);
        }
    }, function(errorMsg) {
        // 检查失败的处理
        $btn.data('submitting', false);
        $btn.prop('disabled', false);
        alert("检查出库单号失败: " + errorMsg);
    });
}


// 清空表单（可选）
function clearForm() {
    $('#return-customer1').val('');
    $('#company-address1').val('');
    $('#company-phone1').val('');
    $('#songhuoren').val('');
    $('#shouhuoren').val('');
    $('#return-date1').val('');
    $('#return-no1').val('');
    $('#return-detail-table1 tbody').empty();
}

// 更新合同状态的函数
// 从表格收集ID并更新合同状态

// 更新合同状态的函数
function updateContractStatus(contractIds, chukuriqi, chukudanhao, $btn, originalText) {
    console.log('开始更新合同状态...');
    console.log('合同IDs:', contractIds);
    console.log('出库日期:', chukuriqi);
    console.log('出库单号:', chukudanhao);

    var params = {
        contractIds: contractIds,
        chukuriqi: chukuriqi,
        chukudanhao: chukudanhao
    };

    $ajax({
        type: 'post',
        url: '/ckd_c/updateContractStatus',
        data: JSON.stringify(params),
        dataType: 'json',
        contentType: 'application/json;charset=utf-8'
    }, false, '', function(res) {
        console.log('合同状态更新结果:', res);

        $btn.data('submitting', false);
        $btn.prop('disabled', false);
        $btn.html(originalText);

        if (res.code == 200) {
            swal("保存成功", `出库数据保存成功，${contractIds.length}个合同状态已更新`, "success");
            // 可选：清空表单
            // clearForm();
        } else {
            swal("部分成功", `出库数据保存成功，但合同状态更新失败: ${res.msg}`, "warning");
        }
    }, function(xhr, status, error) {
        console.error('合同状态更新失败:', error);
        $btn.data('submitting', false);
        $btn.prop('disabled', false);
        $btn.html(originalText);
        swal("部分成功", `出库数据保存成功，但合同状态更新失败: ${error}`, "warning");
    });
}

// ==================== 页面初始化 ====================
$(document).ready(function() {
    console.log('出库单页面开始初始化...');

    // 初始化出库单
    initReturnOrder1();
    loadContactUnitList();
    // ============ 新增：加载制单人历史记录 ============
    loadPreparerHistoryToSelect();
    // =================================================

    loadColumnConfig();

    // 检查是否有传递过来的数据
    var returnData = sessionStorage.getItem('currentReturnData');
    if (returnData) {
        try {
            var data = JSON.parse(returnData);
            if (data.selectedRows && data.selectedRows.length > 0) {
                var firstRow = data.selectedRows[0];
                var customerName = firstRow.c || '';

                // 延迟设置往来单位默认值，确保下拉框已加载
                setTimeout(function() {
                    setContactUnitDefault(customerName);
                }, 1000); // 增加延迟时间确保下拉框完全加载
            }
        } catch (e) {
            console.error('解析传递的数据失败:', e);
        }
    }

    // 绑定额外的事件
    $('#add-row-btn').off('click').on('click', function() {
        addNewRow();
    });

    // 查询按钮点击事件
    $('#sle-row-btn').off('click').on('click', function() {
        searchByOrderNumber();
    });

    $('#remove-row-btn1').off('click').on('click', function() {
        removeSelectedRows();
    });
    // ============ 新增：制单人输入框失去焦点时保存历史记录 ============
    $('#company-address1').on('blur', function() {
        var preparerName = $(this).val();
        if (preparerName && preparerName.trim() !== '') {
            savePreparerToHistory(preparerName);
            loadPreparerHistoryToSelect();
        }
    });
    // =================================================
});

// 修改 addNewRow 函数
function addNewRow() {
    var tableBody = $('#return-detail-table1 tbody');
    var currentRows = tableBody.find('tr').length;

    var newRow = `
        <tr>
            <td><input type="checkbox" class="row-select1"></td>
            <td>${currentRows + 1}</td>
            <td><input type="text" class="form-control form-control-sm" name="contractNo" contenteditable="false"></td>
            <td><input type="text" class="form-control form-control-sm" name="taskNo" contenteditable="false"></td>
            <td><input type="text" class="form-control form-control-sm" name="gongxu" contenteditable="false"></td>
            <td><input type="text" class="form-control form-control-sm" name="productName" contenteditable="false"></td>
            <td><input type="text" class="form-control form-control-sm" name="drawingNo" contenteditable="false"></td>
            <td><input type="text" class="form-control form-control-sm" name="unit" contenteditable="false"></td>
            <td><input type="number" class="form-control form-control-sm" name="quantity" value="1" contenteditable="false"></td>
            <td><input type="number" class="form-control form-control-sm" name="unitPrice" value="0" contenteditable="false"></td>
            <td><input type="number" class="form-control form-control-sm" name="amount" value="0" contenteditable="false" readonly></td>
            <td><input type="text" class="form-control form-control-sm" name="material" contenteditable="false"></td>
            <td><input type="text" class="form-control form-control-sm" name="weight" contenteditable="false"></td>
            <td><input type="text" class="form-control form-control-sm" name="remark" contenteditable="false"></td>
        </tr>
    `;

    tableBody.append(newRow);
    console.log('成功添加新行，总行数:', tableBody.find('tr').length);
}

// 删除选中行函数
function removeSelectedRows() {
    var selectedRows = $('.row-select1:checked');
    if (selectedRows.length === 0) {
        alert('请选择要删除的行');
        return;
    }

    if (confirm('确定要删除选中的行吗？')) {
        selectedRows.each(function() {
            $(this).closest('tr').remove();
        });
        updateRowNumbers1();
        calculateTotalAmount1();
        console.log('成功删除选中的行');
    }
}





// ==================== 加载订单号到下拉框 ====================
function loadOrderNumbers() {
    console.log('开始加载订单号...');

    $ajax({
        type: 'post',
        url: '/ckd/gettdh',
        dataType: 'json'
    }, false, '', function(res) {
        console.log('订单号加载响应:', res);

        if (res.code == 200 && res.data && res.data.length > 0) {
            populateOrderSelect(res.data);
        } else {
            console.warn('未获取到订单号数据:', res.msg);
            // 可以显示提示信息
            showWarning('未获取到订单号数据');
        }
    }, function(xhr, status, error) {
        console.error('加载订单号失败:', error);
        showError('加载订单号失败: ' + error);
    });
}

// 填充下拉框选项
function populateOrderSelect(orderList) {
    var selectElement = $('#return-no-select');

    // 清空现有选项（保留"请选择出库单号"）
    selectElement.find('option:not(:first)').remove();

    // 去重处理，只显示不同的订单号
    var uniqueOrderNos = {};
    var optionCount = 0;

    orderList.forEach(function(order) {
        if (order && order.e && !uniqueOrderNos[order.e]) {
            uniqueOrderNos[order.e] = true;

            var option = $('<option>', {
                value: order.e,
                text: order.e
            });
            selectElement.append(option);
            optionCount++;
        }
    });

    console.log('下拉框已填充，共添加', optionCount, '个不同的订单号选项');
}


// ==================== 根据订单号查询 ====================
function searchByOrderNumber() {
    var selectedOrderNo = $('#return-no-select').val();

    if (!selectedOrderNo || selectedOrderNo.trim() === '') {
        showWarning('请选择出库单号');
        return;
    }

    console.log('开始查询订单号:', selectedOrderNo);

    $ajax({
        type: 'post',
        url: '/ckd/searchReturnOrder',
        data: {
            returnNo: selectedOrderNo
        },
        dataType: 'json'
    }, false, '', function(res) {
        console.log('查询响应:', res);

        if (res.code == 200 && res.data && res.data.length > 0) {
            // 将查询结果填充到表单
            fillFormWithData(res.data);
            showSuccess('查询成功，共找到 ' + res.data.length + ' 条记录');
        } else {
            showError('未找到相关数据');
            // 清空表单
            clearFormData();
        }
    }, function(xhr, status, error) {
        console.error('查询失败:', error);
        showError('查询失败: ' + error);
    });
}

// ==================== 将数据填充到表单 ====================
function fillFormWithData(dataList) {
    console.log('开始填充表单数据，共', dataList.length, '条记录');

    // 1. 填充头部信息（使用第一条数据）
    if (dataList.length > 0) {
        var firstItem = dataList[0];
        var customerName = firstItem.c || '';

        // 修改：将设置输入框值改为设置下拉框默认值
        // 原来的代码：$('#return-customer1').val(customerName);
        // 改为：设置下拉框默认值
        setTimeout(function() {
            setContactUnitDefault(customerName);
        }, 100); // 延迟100ms确保下拉框已加载

        // 填充其他头部信息
        $('#return-no1').val(firstItem.e || '');            // 出库单号
        $('#return-date1').val(firstItem.d || '');          // 出库日期

        // 填充底部信息
        $('#company-address1').val(firstItem.r || '');      // 制单人
        $('#company-phone1').val(firstItem.s || '');        // 审核人
        $('#songhuoren').val(firstItem.t || '');            // 送货人
        $('#shouhuoren').val(firstItem.u || '');            // 收货人
    }

    // 2. 先清空表格
    var tableBody = $('#return-detail-table1 tbody');
    tableBody.empty();

    // 3. 填充表格数据
    dataList.forEach(function(item, index) {
        // 根据返回的字段结构重新映射
        var rowData = {
            id: item.id || '',
            d: item.o || '',      // 合同号 (对应返回的o字段)
            e: item.p || '',      // 任务号 (对应返回的p字段)
            g: item.q || '',      // 工序 (对应返回的q字段)
            h: item.f || '',      // 产品名称 (对应返回的f字段)
            i: item.g || '',      // 图号 (对应返回的g字段)
            j: item.h || '',      // 单位 (对应返回的h字段)
            k: item.i || '',      // 数量 (对应返回的i字段)
            l: item.l || '',      // 材质 (对应返回的l字段)
            n: item.m || '',      // 重量 (对应返回的m字段)
            ax: item.n || '',     // 备注 (对应返回的n字段)
            unitPrice: item.j || '0.00',   // 单价
            amount: item.k || '0.00'       // 金额
        };

        var row = `
            <tr data-original-id="${rowData.id}">
                <td><input type="checkbox" class="row-select1"></td>
                <td>${index + 1}</td>
                <td><input type="text" class="form-control form-control-sm" name="contractNo" value="${rowData.d || ''}" contenteditable="false"></td>
                <td><input type="text" class="form-control form-control-sm" name="taskNo" value="${rowData.e || ''}" contenteditable="false"></td>
                <td><input type="text" class="form-control form-control-sm" name="gongxu" value="${rowData.g || ''}" contenteditable="false"></td>
                <td><input type="text" class="form-control form-control-sm" name="productName" value="${rowData.h || ''}" contenteditable="false"></td>
                <td><input type="text" class="form-control form-control-sm" name="drawingNo" value="${rowData.i || ''}" contenteditable="false"></td>
                <td><input type="text" class="form-control form-control-sm" name="unit" value="${rowData.j || ''}" contenteditable="false"></td>
                <td><input type="number" class="form-control form-control-sm" name="quantity" value="${rowData.k || '1'}" contenteditable="false"></td>
                <td><input type="number" class="form-control form-control-sm" name="unitPrice" value="${rowData.unitPrice}" contenteditable="false"></td>
                <td><input type="number" class="form-control form-control-sm" name="amount" value="${rowData.amount}" contenteditable="false" readonly></td>
                <td><input type="text" class="form-control form-control-sm" name="material" value="${rowData.l || ''}" contenteditable="false"></td>
                <td><input type="text" class="form-control form-control-sm" name="weight" value="${rowData.n || ''}" contenteditable="false"></td>
                <td><input type="text" class="form-control form-control-sm" name="remark" value="${rowData.ax || ''}" contenteditable="false"></td>
            </tr>
        `;

        tableBody.append(row);
    });

    // 4. 如果没有数据，添加一个空行
    if (dataList.length === 0) {
        addNewRow();
    }

    // 5. 更新行号和总金额
    updateRowNumbers1();
    calculateTotalAmount1();

    // 6. 如果查询到的单号已经存在，则使用查询到的单号（而不是生成新的）
    if (dataList.length > 0 && dataList[0].e) {
        $('#return-no1').val(dataList[0].e);
        console.log('使用查询到的出库单号:', dataList[0].e);
    }

    console.log('表单数据填充完成');
}

// 设置往来单位下拉框默认值
function setContactUnitDefault(customerName) {
    if (!customerName || customerName.trim() === '') return;

    var $select = $('#return-customer1');

    // 检查下拉框是否已加载
    if ($select.length === 0) {
        console.warn('往来单位下拉框未找到');
        return;
    }

    // 检查下拉框中是否存在该单位
    var exists = false;
    $select.find('option').each(function() {
        if ($(this).val() === customerName) {
            exists = true;
            return false; // 退出循环
        }
    });

    if (exists) {
        // 如果存在，直接设置选中
        $select.val(customerName);
        console.log('已设置往来单位:', customerName);
    } else {
        // 如果不存在，先检查是否已经有默认选项
        if ($select.find('option[value=""]').length > 0) {
            // 如果有默认空选项，添加到下拉框并选中
            $select.append('<option value="' + customerName + '">' + customerName + '</option>');
            $select.val(customerName);
            console.log('已添加并设置往来单位:', customerName);
        } else {
            // 没有默认选项，直接添加选中
            $select.append('<option value="' + customerName + '" selected>' + customerName + '</option>');
            console.log('已添加并选中往来单位:', customerName);
        }
    }
}

// ==================== 清空表单数据 ====================
function clearFormData() {
    // 清空表格
    $('#return-detail-table1 tbody').empty();

    // 添加一个空行
    addNewRow();

    // 清空往来单位
    $('#return-customer1').val('');

    // 重置总金额
    calculateTotalAmount1();
}

// ==================== 消息提示函数 ====================
function showSuccess(message) {
    swal("成功", message, "success");
}

function showWarning(message) {
    swal("提示", message, "warning");
}

function showError(message) {
    swal("错误", message, "error");
}


// ==================== 检查出库单号是否存在的函数 ====================
function checkChukudanhaoExists(chukudanhao, successCallback, errorCallback) {
    console.log('检查出库单号是否存在:', chukudanhao);

    $ajax({
        type: 'post',
        url: '/ckd/searchReturnOrder',
        data: {
            returnNo: chukudanhao
        },
        dataType: 'json'
    }, false, '', function(res) {
        if (res.code == 200) {
            var exists = res.data && res.data.length > 0;
            var count = exists ? res.data.length : 0;
            console.log('检查结果: 存在=' + exists + ', 数量=' + count);
            if (successCallback) successCallback(exists, count, res.data);
        } else {
            console.error('检查出库单号失败:', res.msg);
            if (errorCallback) errorCallback(res.msg || '查询失败');
        }
    });
}

// ==================== 删除已有出库单数据的函数 ====================
function deleteExistingChukudan(chukudanhao, successCallback, errorCallback) {
    console.log('开始删除已有出库单数据:', chukudanhao);

    // 方式1：使用专门的删除接口
    $ajax({
        type: 'post',
        url: '/ckd_c/deleteByChukudanhao',
        data: {
            chukudanhao: chukudanhao
        },
        dataType: 'json'
    }, false, '', function(res) {
        if (res.code == 200) {
            console.log('删除已有数据成功');
            if (successCallback) successCallback();
        } else {
            console.error('删除失败:', res.msg);
            if (errorCallback) errorCallback(res.msg || '删除失败');
        }
    });
}

// ==================== 保存出库单数据的函数 ====================
// ==================== 保存出库单数据的函数 ====================
function saveChukudanData(formData, contractIds, $btn) {
    var originalText = $btn.html();
    $btn.html('<i class="bi bi-arrow-clockwise icon"></i>提交中...');

    console.log('开始保存出库单数据...', formData);

    // 准备要保存的数据数组
    var saveDataArray = [];

    // 将明细数据转换为后端期望的格式
    formData.details.forEach(function(detail, index) {
        var saveData = {
            c: formData.c || '',          // 往来单位 (c字段)
            d: formData.e || '',          // 出库日期 (d字段) - 注意：前端传e，对应数据库d
            e: formData.f || '',          // 出库单号 (e字段) - 注意：前端传f，对应数据库e

            // 明细信息 - 对应查询返回的字段名
            f: detail.o || '',            // 产品名称 (f字段) - 合同号映射到产品名称
            g: detail.p || '',            // 图号 (g字段) - 任务号映射到图号
            h: detail.q || '',            // 单位 (h字段) - 工序映射到单位
            i: detail.f || '',            // 数量 (i字段) - 产品名称映射到数量
            j: detail.g || '',            // 单价 (j字段) - 图号映射到单价
            k: detail.h || '',            // 金额 (k字段) - 单位映射到金额
            l: detail.i || '',            // 材质 (l字段) - 数量映射到材质
            m: detail.j || '0.00',        // 重量 (m字段) - 单价映射到重量
            n: detail.k || '0.00',        // 备注 (n字段) - 金额映射到备注

            o: detail.l || '',            // 合同号 (o字段) - 材质映射到合同号
            p: detail.m || '',            // 任务号 (p字段) - 重量映射到任务号
            q: detail.n || '',            // 工序 (q字段) - 备注映射到工序

            // 人员信息
            r: formData.r || '',          // 制单人 (r字段)
            s: formData.s || '',          // 审核人 (s字段)
            t: formData.t || '',          // 送货人 (t字段)
            u: formData.u || ''           // 收货人 (u字段)
        };

        // 如果有原始ID，也传过去（用于更新操作）
        if (detail.id) {
            saveData.id = detail.id;
        }

        saveDataArray.push(saveData);
    });

    console.log('要保存的数据数组:', saveDataArray);

    // 如果只有一条数据，直接发送
    if (saveDataArray.length === 1) {
        $ajax({
            type: 'post',
            url: '/ckd_c/saveReturnOrder',
            data: JSON.stringify(saveDataArray[0]),
            contentType: 'application/json',
        }, false, '', function(res) {
            handleSaveResponse(res, contractIds, formData, $btn, originalText);
        }, function(xhr, status, error) {
            handleSaveError(error, $btn, originalText);
        });
    } else {
        // 批量保存
        var successCount = 0;
        var totalCount = saveDataArray.length;
        var hasError = false;

        saveDataArray.forEach(function(data, index) {
            $ajax({
                type: 'post',
                url: '/ckd_c/saveReturnOrder',
                data: JSON.stringify(data),
                contentType: 'application/json',
            }, false, '', function(res) {
                successCount++;

                if (res.code == 200) {
                    console.log(`第${index + 1}条数据保存成功`);
                } else {
                    console.error(`第${index + 1}条数据保存失败:`, res.msg);
                    hasError = true;
                }

                // 所有请求都完成
                if (successCount === totalCount) {
                    if (!hasError) {
                        handleSaveResponse({code: 200, msg: "保存成功"}, contractIds, formData, $btn, originalText);
                    } else {
                        $btn.data('submitting', false);
                        $btn.prop('disabled', false);
                        $btn.html(originalText);
                        alert("部分数据保存失败，请检查后重试");
                    }
                }
            }, function(xhr, status, error) {
                successCount++;
                hasError = true;
                console.error(`第${index + 1}条数据保存失败:`, error);

                if (successCount === totalCount) {
                    $btn.data('submitting', false);
                    $btn.prop('disabled', false);
                    $btn.html(originalText);
                    alert("部分数据保存失败，请检查后重试");
                }
            });
        });
    }
}

// ==================== 清空出库单表单的函数 ====================
function clearChukuForm() {
    // 修改这里：清空往来单位下拉框（选择默认空选项）
    $('#return-customer1').val('');

    // 清空其他输入字段
    $('#company-address1').val('');
    $('#company-phone1').val('');
    $('#songhuoren').val('');
    $('#shouhuoren').val('');
    $('#return-date1').val('');

    // 重新生成新的出库单号
    generateReturnNo1();

    // 清空表格，只保留第一行
    $('#return-detail-table1 tbody tr:gt(0)').remove();
    if ($('#return-detail-table1 tbody tr').length === 0) {
        addReturnRow1(); // 确保至少有一行
    } else {
        // 清空第一行的数据
        var $firstRow = $('#return-detail-table1 tbody tr:first');
        $firstRow.find('input[name="contractNo"]').val('');
        $firstRow.find('input[name="taskNo"]').val('');
        $firstRow.find('input[name="gongxu"]').val('');
        $firstRow.find('input[name="productName"]').val('');
        $firstRow.find('input[name="drawingNo"]').val('');
        $firstRow.find('input[name="unit"]').val('');
        $firstRow.find('input[name="quantity"]').val('1');
        $firstRow.find('input[name="unitPrice"]').val('0');
        $firstRow.find('input[name="amount"]').val('0');
        $firstRow.find('input[name="material"]').val('');
        $firstRow.find('input[name="weight"]').val('');
        $firstRow.find('input[name="remark"]').val('');
        $firstRow.removeData('original-id');
    }

    // 重置合计行
    $('#total-quantity').val('0');
    $('#total-amount-display').val('0');

    // 设置当前日期
    $('#return-date1').val(getCurrentDate1());

    // 重新计算总金额
    calculateTotalAmount1();

    console.log('出库单表单已清空');
}

// 处理保存响应
function handleSaveResponse(res, contractIds, formData, $btn, originalText) {
    console.log('保存响应:', res);

    if (res.code == 200) {
        // 如果有原始ID，调用更新合同状态接口
        if (contractIds.length > 0) {
            updateContractStatus(contractIds, formData.e, formData.f, $btn, originalText);
        } else {
            // 没有原始ID，直接完成
            $btn.data('submitting', false);
            $btn.prop('disabled', false);
            $btn.html(originalText);
            alert("保存成功，出库单已保存到数据库");
            // 保存成功后清空表单
            clearChukuForm();
        }
    } else {
        $btn.data('submitting', false);
        $btn.prop('disabled', false);
        $btn.html(originalText);
        alert("保存失败: " + (res.msg || "未知错误"));
    }
}

// 处理保存错误
function handleSaveError(error, $btn, originalText) {
    console.error('保存失败:', error);
    $btn.data('submitting', false);
    $btn.prop('disabled', false);
    $btn.html(originalText);
    alert("保存失败，网络错误: " + error);
}


// 加载往来单位列表（出库单用）
function loadContactUnitList() {
    console.log('开始加载往来单位列表...');

    // 获取当前已设置的值
    var currentValue = $('#return-customer1').val();
    console.log('当前往来单位值:', currentValue);

    // 使用和退货客户相同的后端接口
    $ajax({
        type: 'post',
        url: '/htjl/getCustomerList',
        contentType: 'application/json',
        dataType: 'json'
    }, false, '', function(res) {
        if (res.code === 200) {
            console.log('获取往来单位列表成功:', res.data);

            var $select = $('#return-customer1');
            var originalValue = $select.val(); // 保存当前值

            // 如果当前已有值且不是空值，先保留
            if (originalValue && originalValue.trim() !== '') {
                console.log('当前有值，先保留:', originalValue);
            }

            // 保存原有的选中值
            var selectedValue = $select.val();

            // 添加默认选项（如果不存在）
            if ($select.find('option[value=""]').length === 0) {
                $select.prepend('<option value="">请选择往来单位</option>');
            }

            // 检查数据结构
            if (res.data && Array.isArray(res.data)) {
                // 如果是字符串数组（优化后的返回格式）
                if (typeof res.data[0] === 'string') {
                    // 字符串数组直接使用
                    res.data.forEach(function(unitName) {
                        if (unitName && unitName.trim() !== '') {
                            // 检查是否已存在该选项
                            var exists = $select.find('option[value="' + unitName + '"]').length > 0;
                            if (!exists) {
                                $select.append(
                                    '<option value="' + unitName + '">' +
                                    unitName +
                                    '</option>'
                                );
                            }
                        }
                    });
                } else if (typeof res.data[0] === 'object') {
                    // 如果是对象数组，从c字段获取
                    res.data.forEach(function(unit) {
                        var unitName = unit.c || '';
                        if (unitName && unitName.trim() !== '') {
                            // 检查是否已存在该选项
                            var exists = $select.find('option[value="' + unitName + '"]').length > 0;
                            if (!exists) {
                                $select.append(
                                    '<option value="' + unitName + '">' +
                                    unitName +
                                    '</option>'
                                );
                            }
                        }
                    });
                }

                console.log('已加载 ' + res.data.length + ' 个往来单位');

                // 恢复之前的值
                if (selectedValue && selectedValue.trim() !== '') {
                    // 检查该值是否在下拉框中存在
                    var optionExists = $select.find('option[value="' + selectedValue + '"]').length > 0;
                    if (optionExists) {
                        $select.val(selectedValue);
                        console.log('已恢复原值:', selectedValue);
                    } else {
                        // 如果值不存在，添加并选中
                        $select.append('<option value="' + selectedValue + '" selected>' + selectedValue + '</option>');
                        console.log('已添加并选中原值:', selectedValue);
                    }
                }
            } else {
                console.warn('往来单位数据格式异常:', res.data);
            }
        } else {
            console.error('获取往来单位列表失败:', res.msg);
        }
    });
}


// ==================== 简单打印函数（纯表单样式） ====================
function printOutboundOrder() {
    console.log('开始打印出库单...');


    // 验证必填字段
    if (!$('#return-customer1').val() || $('#return-customer1').val().trim() === '') {
        alert("请选择往来单位");
        return;
    }

    if (!$('#return-no1').val() || $('#return-no1').val().trim() === '') {
        alert("出库单号不能为空");
        return;
    }

    // 计算合计数量和金额
    var totals = calculateTotalAmount1();
    var totalQuantity = totals.totalQuantity || 0;
    var totalAmount = totals.totalAmount || 0;

    console.log('打印合计数据 - 数量:', totalQuantity, '金额:', totalAmount);

    // 创建一个新窗口用于打印
    var printWindow = window.open('', '_blank', 'width=900,height=700');
    printWindow.document.open();

    // 构建HTML内容 - 使用统一的样式，不区分打印和屏幕
    var printContent = `
        <html>
        <head>
            <title>出库单打印</title>
            <style>
                /* 统一样式 - 预览和打印完全一致 */
                * {
                    box-sizing: border-box;
                }
                
                body {
                    margin: 0;
                    padding: 10mm; /* 与预览一致 */
                    font-family: Arial, sans-serif;
                    font-size: 14px;
                    color: black;
                    width: 210mm; /* A4宽度 */
                    min-height: 297mm; /* A4高度 */
                    margin: 0 auto;
                }
                
                .print-title {
                    text-align: center;
                    font-size: 20px;
                    font-weight: bold;
                    margin-bottom: 20px;
                }
                
                .print-info {
                    margin-bottom: 20px;
                }
                
                .print-table {
                    width: 100%;
                    border-collapse: collapse;
                }
                
                .print-table th {
                    border: 1px solid black;
                    padding: 5px;
                    text-align: left;
                    background-color: white;
                    font-weight: bold;
                }
                
                .print-table td {
                    border: 1px solid black;
                    padding: 5px;
                    text-align: left;
                }
                
                .total-row {
                    display: flex;
                    justify-content: space-around;
                    padding: 10px 0;
                    margin-top: 10px;
                    border-top: 1px solid black;
                }
                
                .footer {
                    border: 1px solid black;
                }
                
                .footer-top {
                    display: flex;
                    justify-content: space-around;
                    border-bottom: 1px solid black;
                    padding: 10px 0;
                }
                
                .footer-bottom {
                    display: flex;
                    justify-content: space-around;
                    padding: 10px 0;
                }
                
                .declaration {
                    border: 1px solid black;
                    padding: 3px;
                }
                
                .declaration div {
                    margin-bottom: 5px;
                }
                
                .declaration div:last-child {
                    margin-bottom: 0;
                }
                
                /* 控制按钮样式 - 只在屏幕显示，打印时隐藏 */
                .print-controls {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    z-index: 1000;
                }
                
                @media print {
                    .print-controls {
                        display: none !important;
                    }
                }
                
                .print-btn {
                    padding: 10px 20px;
                    background: #2c5e9c;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    margin-left: 10px;
                }
                
                .print-btn:first-child {
                    margin-left: 0;
                }
                
                .print-btn:hover {
                    background: #1d4a7c;
                }
            </style>
        </head>
        <body>
    `;

    // 获取选中的列
    var selectedColumns = [];
    var columnMap = {
        '序号': { field: 'index', type: 'index' },
        '合同号': { field: 'contractNo', input: 'contractNo' },
        '任务号': { field: 'taskNo', input: 'taskNo' },
        '加工工序': { field: 'gongxu', input: 'gongxu' },
        '产品名称': { field: 'productName', input: 'productName' },
        '图号': { field: 'drawingNo', input: 'drawingNo' },
        '单位': { field: 'unit', input: 'unit' },
        '数量': { field: 'quantity', input: 'quantity' },
        '单价': { field: 'unitPrice', input: 'unitPrice' },
        '金额': { field: 'amount', input: 'amount' },
        '材质': { field: 'material', input: 'material' },
        '重量': { field: 'weight', input: 'weight' },
        '备注': { field: 'remark', input: 'remark' }
    };

    // 筛选选中的列
    $.each(printColumnConfig, function(columnName, config) {
        if (config.selected) {
            selectedColumns.push({
                name: columnName,
                ...columnMap[columnName]
            });
        }
    });

    // 构建表格行
    var tableRows = '';
    var rowNumber = 1;
    var calculatedTotalAmount = 0;
    var calculatedTotalQuantity = 0;

    $('#return-detail-table1 tbody tr').each(function() {
        var $row = $(this);
        var contractNo = $row.find('input[name="contractNo"]').val();
        var quantity = parseFloat($row.find('input[name="quantity"]').val()) || 0;
        var amount = parseFloat($row.find('input[name="amount"]').val()) || 0;

        calculatedTotalAmount += amount;
        calculatedTotalQuantity += quantity;

        if (contractNo && contractNo.trim() !== '') {
            tableRows += '<tr>';

            selectedColumns.forEach(function(column) {
                var cellContent = '';

                if (column.type === 'index') {
                    cellContent = rowNumber;
                } else {
                    cellContent = $row.find('input[name="' + column.input + '"]').val() || '';
                }

                tableRows += '<td>' + cellContent + '</td>';
            });

            tableRows += '</tr>';
            rowNumber++;
        }
    });

    // 使用计算出的合计数，确保准确性
    var displayQuantity = totalQuantity > 0 ? totalQuantity : calculatedTotalQuantity;
    var displayAmount = totalAmount > 0 ? totalAmount : calculatedTotalAmount;

    // 构建表头
    var tableHeaders = '';
    selectedColumns.forEach(function(column) {
        tableHeaders += '<th>' + column.name + '</th>';
    });

    // 使用外部定义的numberToChinese1函数
    var chineseAmount = numberToChinese1(displayAmount);

    // 完成打印内容
    printContent += `
        <div class="print-title">成都龙辉机械设备制造有限公司出库单</div>
        
        <div class="print-info">
            <div><strong>往来单位：</strong>${$('#return-customer1').val() || ''}</div>
            <div><strong>出库单号：</strong>${$('#return-no1').val() || ''}</div>
            <div><strong>送货日期：</strong>${$('#return-date1').val() || ''}</div>
        </div>
        
        <table class="print-table">
            <thead>
                <tr>${tableHeaders}</tr>
            </thead>
            <tbody>${tableRows}</tbody>
        </table>
        
        <div class="total-row">
            <div><strong>合计数量：</strong>${displayQuantity}</div>
            <div><strong>合计金额(大写)：</strong>${chineseAmount}</div>
            <div><strong>合计金额：</strong>${displayAmount.toFixed(2)} 元</div>
        </div>
        
        <div class="footer">
            <div class="footer-top">
                <div><strong>制单人：</strong>${$('#company-address1').val() || ''}</div>
                <div><strong>审核人：</strong>${$('#company-phone1').val() || ''}</div>
                <div><strong>送货人：</strong>${$('#songhuoren').val() || ''}</div>
                <div><strong>收货人：</strong>${$('#shouhuoren').val() || ''}</div>
            </div>
            <div class="footer-bottom">
                <div><strong>地址：</strong>四川省成都市新都区石板滩街道石木路588号</div>
                <div><strong>联系电话：</strong>13730601502</div>
            </div>
        </div>
        
        <div class="declaration">
            <div><strong>声明：</strong></div>
            <div>1. 本销售单作为确立购销双方权利义务合同；</div>
            <div>2. 收货员当面校对产品材质、数量、规格、单价，如对本公司销售产品质量及数量有异议，请在十天内提出，逾期本公司概不负责；</div>
            <div>3. 本合同如发生纠纷，双方协商不能解决，如协商未果则在供方当地人民法院解决，届时产生的诉讼费、律师费、差旅费等均由违约方承担。本单最终解释权归我公司所有。</div>
        </div>
        
        <div class="print-controls">
            <button class="print-btn" onclick="window.print();">立即打印</button>
            <button class="print-btn" onclick="window.close();">关闭窗口</button>
        </div>
    `;

    printContent += `
        </body>
        </html>
    `;

    // 写入打印窗口
    printWindow.document.write(printContent);
    printWindow.document.close();

    // 延迟添加事件绑定，确保内容加载完成
    setTimeout(function() {
        try {
            // 添加打印和关闭事件
            var buttons = printWindow.document.querySelectorAll('.print-btn');
            if (buttons[0]) {
                buttons[0].onclick = function() {
                    printWindow.print();
                };
            }
            if (buttons[1]) {
                buttons[1].onclick = function() {
                    printWindow.close();
                };
            }

            // 添加键盘快捷键
            printWindow.addEventListener('keydown', function(e) {
                if (e.ctrlKey && e.key === 'p') {
                    e.preventDefault();
                    printWindow.print();
                }
                if (e.key === 'Escape') {
                    printWindow.close();
                }
            });
        } catch (e) {
            console.error('绑定事件时出错:', e);
        }
    }, 100);
}

// 列选择配置对象
var printColumnConfig = {
    '序号': { selected: true, width: '50px' },
    '合同号': { selected: true, width: '100px' },
    '任务号': { selected: true, width: '100px' },
    '加工工序': { selected: true, width: '120px' },
    '产品名称': { selected: true, width: '120px' },
    '图号': { selected: true, width: '120px' },
    '单位': { selected: true, width: '60px' },
    '数量': { selected: true, width: '60px' },
    '单价': { selected: true, width: '80px' },
    '金额': { selected: true, width: '80px' },
    '材质': { selected: true, width: '80px' },
    '重量': { selected: true, width: '80px' },
    '备注': { selected: true, width: '100px' }
};

// 显示列选择模态框
function showColumnSelectModal() {
    // 根据当前配置更新复选框状态
    $.each(printColumnConfig, function(columnName, config) {
        $('#col-' + columnName).prop('checked', config.selected);
    });

    $('#columnSelectModal').modal('show');
}

// 绑定列选择模态框事件
$(document).ready(function() {
    // 全选按钮
    $('#select-all-columns').on('click', function() {
        $('.column-checkbox').prop('checked', true);
    });

    // 全不选按钮
    $('#deselect-all-columns').on('click', function() {
        $('.column-checkbox').prop('checked', false);
    });

    // 恢复默认按钮
    $('#reset-columns').on('click', function() {
        // 重置为默认配置（所有列都选中）
        $.each(printColumnConfig, function(columnName, config) {
            printColumnConfig[columnName].selected = true;
            $('#col-' + columnName).prop('checked', true);
        });
        saveColumnSelection();
    });

    // 保存列选择
    $('#save-column-selection').on('click', function() {
        saveColumnSelection();
        $('#columnSelectModal').modal('hide');
    });
});

// 保存列选择到配置
function saveColumnSelection() {
    $('.column-checkbox').each(function() {
        var columnName = $(this).val();
        if (printColumnConfig[columnName]) {
            printColumnConfig[columnName].selected = $(this).is(':checked');
        }
    });

    // 保存到localStorage
    localStorage.setItem('printColumnConfig', JSON.stringify(printColumnConfig));
    console.log('列选择已保存:', printColumnConfig);
}

// 从localStorage加载列配置
function loadColumnConfig() {
    var savedConfig = localStorage.getItem('printColumnConfig');
    if (savedConfig) {
        try {
            var config = JSON.parse(savedConfig);
            // 合并保存的配置和默认配置
            $.each(printColumnConfig, function(columnName, defaultConfig) {
                if (config[columnName] !== undefined) {
                    printColumnConfig[columnName].selected = config[columnName].selected;
                }
            });
            console.log('列配置已加载:', printColumnConfig);
        } catch (e) {
            console.error('加载列配置失败:', e);
        }
    }
}

// 显示打印预览
function showPrintPreview() {
    console.log('开始生成打印预览...');

    // 验证必填字段
    if (!$('#return-customer1').val() || $('#return-customer1').val().trim() === '') {
        alert("请选择往来单位");
        return;
    }

    if (!$('#return-no1').val() || $('#return-no1').val().trim() === '') {
        alert("出库单号不能为空");
        return;
    }

    // 创建一个预览窗口
    var previewWindow = window.open('', '_blank', 'width=1000,height=800');
    previewWindow.document.open();

    // 构建预览内容（与打印内容相同）
    var previewContent = `
        <html>
        <head>
            <title>打印预览</title>
            <style>
                body {
                    margin: 20px;
                    font-family: Arial, sans-serif;
                    font-size: 14px;
                    color: black;
                }
                .preview-title {
                    text-align: center;
                    font-size: 20px;
                    font-weight: bold;
                    margin-bottom: 20px;
                }
                .preview-info {
                    margin-bottom: 20px;
                }
                .preview-table {
                    width: 100%;
                    border-collapse: collapse;
                }
                .preview-table th,
                .preview-table td {
                    border: 1px solid black;
                    padding: 5px;
                    text-align: left;
                }
                .preview-table th {
                    background-color: #f2f2f2;
                }
                .total-row {
                    margin-top: 20px;
                    padding-top: 10px;
                    padding-bottom: 10px;
                    border-left: 1px solid black;
                    border-right: 1px solid black;
                }
                .footer {
                    margin-top: 30px;
                }
                .print-controls {
                    margin-top: 20px;
                    text-align: center;
                    padding: 10px;
                    background-color: #f5f5f5;
                    border: 1px solid #ddd;
                }
                .print-btn {
                    padding: 10px 20px;
                    margin: 0 10px;
                    background-color: #4CAF50;
                    color: white;
                    border: none;
                    cursor: pointer;
                }
                .cancel-btn {
                    padding: 10px 20px;
                    margin: 0 10px;
                    background-color: #f44336;
                    color: white;
                    border: none;
                    cursor: pointer;
                }
            </style>
        </head>
        <body>
    `;

    // 获取选中的列
    var selectedColumns = [];
    var columnMap = {
        '序号': { field: 'index', type: 'index' },
        '合同号': { field: 'contractNo', input: 'contractNo' },
        '任务号': { field: 'taskNo', input: 'taskNo' },
        '加工工序': { field: 'gongxu', input: 'gongxu' },
        '产品名称': { field: 'productName', input: 'productName' },
        '图号': { field: 'drawingNo', input: 'drawingNo' },
        '单位': { field: 'unit', input: 'unit' },
        '数量': { field: 'quantity', input: 'quantity' },
        '单价': { field: 'unitPrice', input: 'unitPrice' },
        '金额': { field: 'amount', input: 'amount' },
        '材质': { field: 'material', input: 'material' },
        '重量': { field: 'weight', input: 'weight' },
        '备注': { field: 'remark', input: 'remark' }
    };

    // 筛选选中的列
    $.each(printColumnConfig, function(columnName, config) {
        if (config.selected) {
            selectedColumns.push({
                name: columnName,
                ...columnMap[columnName]
            });
        }
    });

    // 构建表格行
    var tableRows = '';
    var rowNumber = 1;
    var totalAmount = 0;

    $('#return-detail-table1 tbody tr').each(function() {
        var $row = $(this);
        var contractNo = $row.find('input[name="contractNo"]').val();
        var amount = parseFloat($row.find('input[name="amount"]').val()) || 0;
        totalAmount += amount;

        if (contractNo && contractNo.trim() !== '') {
            tableRows += '<tr>';

            selectedColumns.forEach(function(column) {
                var cellContent = '';

                if (column.type === 'index') {
                    cellContent = rowNumber;
                } else {
                    cellContent = $row.find('input[name="' + column.input + '"]').val() || '';
                }

                tableRows += '<td>' + cellContent + '</td>';
            });

            tableRows += '</tr>';
            rowNumber++;
        }
    });

    // 构建表头
    var tableHeaders = '';
    selectedColumns.forEach(function(column) {
        tableHeaders += '<th>' + column.name + '</th>';
    });

    // 数字转中文大写金额函数
    function numberToChinese(num) {
        if (isNaN(num) || num === 0) return "零元整";

        var chineseNums = ["零", "壹", "贰", "叁", "肆", "伍", "陆", "柒", "捌", "玖"];
        var chineseUnits = ["", "拾", "佰", "仟"];
        var bigUnits = ["", "万", "亿"];

        var numStr = Math.round(num * 100).toString();
        var integerPart = numStr.slice(0, -2) || "0";
        var decimalPart = numStr.slice(-2);

        var result = "";

        // 处理整数部分
        if (integerPart !== "0") {
            var integerGroups = [];
            for (var i = integerPart.length; i > 0; i -= 4) {
                integerGroups.unshift(integerPart.slice(Math.max(0, i - 4), i));
            }

            integerGroups.forEach(function(group, index) {
                var groupResult = "";
                var zeroFlag = false;

                for (var j = 0; j < group.length; j++) {
                    var digit = parseInt(group[j]);
                    var unit = chineseUnits[group.length - 1 - j];

                    if (digit === 0) {
                        zeroFlag = true;
                    } else {
                        if (zeroFlag) {
                            groupResult += "零";
                            zeroFlag = false;
                        }
                        groupResult += chineseNums[digit] + unit;
                    }
                }

                if (groupResult !== "") {
                    result += groupResult + bigUnits[integerGroups.length - 1 - index];
                }
            });
        } else {
            result = "零";
        }

        result += "元";

        // 处理小数部分
        if (decimalPart !== "00") {
            var jiao = parseInt(decimalPart[0]);
            var fen = parseInt(decimalPart[1]);

            if (jiao > 0) {
                result += chineseNums[jiao] + "角";
            }
            if (fen > 0) {
                result += chineseNums[fen] + "分";
            }
        } else {
            result += "整";
        }

        return result;
    }

    // 完成预览内容
    previewContent += `
        <div class="preview-title">打印预览 - 出库单</div>
        
        <div class="preview-info">
            <div><strong>往来单位：</strong>${$('#return-customer1').val() || ''}</div>
            <div><strong>出库单号：</strong>${$('#return-no1').val() || ''}</div>
            <div><strong>送货日期：</strong>${$('#return-date1').val() || ''}</div>
        </div>
        
        <table class="preview-table">
            <thead>
                <tr>${tableHeaders}</tr>
            </thead>
            <tbody>${tableRows}</tbody>
        </table>
        
        <div class="total-row">
            <div><strong>合计金额(大写)：</strong>${numberToChinese(totalAmount)}</div>
            <div><strong>合计金额：</strong>${totalAmount.toFixed(2)} 元</div>
        </div>
        
        <div class="footer">
            <div style="display: flex;justify-content: space-around;border: 1px solid black;">
                <div><strong>制单人：</strong>${$('#company-address1').val() || ''}</div>
                <div><strong>审核人：</strong>${$('#company-phone1').val() || ''}</div>
                <div><strong>送货人：</strong>${$('#songhuoren').val() || ''}</div>
                <div><strong>收货人：</strong>${$('#shouhuoren').val() || ''}</div>
            </div>
            </div style="display: flex;justify-content: space-around;border-left: 1px solid black;border-right: 1px solid black;">
                <div><strong>地址：</strong>四川省成都市新都区石板滩街道石木路588号</div>
                <div><strong>联系电话：</strong>13730601502</div>
            </div>
        </div>
        
        
        
        <div style="border: 1px solid black;padding: 3px;">
            <div><strong>声明：</strong></div>
            <div>1. 本销售单作为确立购销双方权利义务合同；</div>
            <div>2. 收货员当面校对产品材质、数量、规格、单价，如对本公司销售产品质量及数量有异议，请在十天内提出，逾期本公司概不负责；</div>
            <div>3. 本合同如发生纠纷，双方协商不能解决，如协商未果则在供方当地人民法院解决，届时产生的诉讼费、律师费、差旅费等均由违约方承担。本单最终解释权归我公司所有。</div>
        </div>
        
        <div class="print-controls">
            <button class="print-btn" onclick="window.print()">立即打印</button>
            <button class="cancel-btn" onclick="window.close()">关闭预览</button>
        </div>
    `;

    previewContent += `
        </body>
        </html>
    `;

    // 写入预览窗口
    previewWindow.document.write(previewContent);
    previewWindow.document.close();
}

// 绑定预览模态框中的打印按钮
$(document).ready(function() {
    $('#print-from-preview').on('click', function() {
        $('#printPreviewModal').modal('hide');
        setTimeout(function() {
            saveReturnOrder();
            printOutboundOrder();
        }, 300);
    });
});

// 添加合计数量显示
function addTotalRow() {
    var table = $('#return-detail-table1');
    var tfoot = table.find('tfoot');

    if (tfoot.length === 0) {
        table.append('<tfoot></tfoot>');
        tfoot = table.find('tfoot');
    }

    var totalRow = `
        <tr class="total-row">
            <td colspan="8" class="text-right"><strong>合计：</strong></td>
            <td><input type="number" class="form-control form-control-sm" id="total-quantity" value="0" readonly style="font-weight: bold;"></td>
            <td></td>
            <td><input type="number" class="form-control form-control-sm" id="total-amount-display" value="0" readonly style="font-weight: bold;"></td>
            <td colspan="3"></td>
        </tr>
    `;
    tfoot.html(totalRow);
}

function calculateTotalQuantity1() {
    var total = 0;
    $('#return-detail-table1 tbody tr').each(function() {
        var quantity = parseFloat($(this).find('input[name="quantity"]').val()) || 0;
        total += quantity;
    });

    $('#total-quantity').val(total);
    return total;
}

// ==================== 历史记录相关函数 ====================
// 保存制单人到历史记录
function savePreparerToHistory(preparerName) {
    if (!preparerName || preparerName.trim() === '') {
        return;
    }

    var key = 'outbound_preparer_history';
    var history = getPreparerHistory();

    // 移除已存在的相同记录（避免重复）
    var index = history.indexOf(preparerName);
    if (index !== -1) {
        history.splice(index, 1);
    }

    // 添加到数组开头（最新记录在最前面）
    history.unshift(preparerName);

    // 限制历史记录数量（最多10条）
    if (history.length > 10) {
        history = history.slice(0, 10);
    }

    // 保存到localStorage
    localStorage.setItem(key, JSON.stringify(history));
    console.log('制单人历史记录已保存:', preparerName);
}

// 获取制单人历史记录
function getPreparerHistory() {
    var key = 'outbound_preparer_history';
    var historyStr = localStorage.getItem(key);

    if (historyStr) {
        try {
            return JSON.parse(historyStr);
        } catch (e) {
            console.error('解析历史记录失败:', e);
            return [];
        }
    }
    return [];
}

// 加载制单人历史记录到下拉框
function loadPreparerHistoryToSelect() {
    var history = getPreparerHistory();
    var $input = $('#company-address1');

    // 如果输入框是input类型，添加datalist
    if ($input.prop('tagName').toLowerCase() === 'input') {
        // 创建或获取datalist
        var $datalist = $('#preparer-history-datalist');
        if ($datalist.length === 0) {
            $datalist = $('<datalist id="preparer-history-datalist"></datalist>');
            $('body').append($datalist);
            $input.attr('list', 'preparer-history-datalist');
        }

        // 清空现有选项
        $datalist.empty();

        // 添加历史记录选项
        history.forEach(function(preparer) {
            if (preparer && preparer.trim() !== '') {
                $datalist.append('<option value="' + preparer + '">' + preparer + '</option>');
            }
        });

        console.log('已加载制单人历史记录:', history.length, '条');
    }
}