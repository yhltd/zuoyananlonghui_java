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

// ==================== 初始化函数 ====================
function initTitleInputs() {
    console.log("initTitleInputs 函数被调用");
    // 具体的初始化逻辑...
}

// ==================== 出库单初始化函数 ====================
function initReturnOrder1() {
    // 设置当前日期
    $('#return-date1').val(getCurrentDate1());

    // 绑定事件
    bindReturnOrderEvents1();

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
                if (returnData.returnNo) {
                    $('#return-no1').val(returnData.returnNo);
                } else {
                    // 生成出库单号
                    generateReturnNo1(function(returnNo) {
                        $('#return-no1').val(returnNo);
                    });
                }

                // 设置往来单位（使用第一个数据的业务单位）
                if (returnData.selectedRows.length > 0) {
                    $('#return-customer1').val(returnData.selectedRows[0].c || '');
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

        var row = `
             <tr>
                <td><input type="checkbox" class="row-select1"></td>
                <td>${index + 1}</td>
                <td><input type="text" class="form-control form-control-sm" name="contractNo" value="${rowData.d || ''}"></td>
                <td><input type="text" class="form-control form-control-sm" name="taskNo" value="${rowData.e || ''}"></td>
                <td><input type="text" class="form-control form-control-sm" name="gongxu" value="${rowData.g || ''}"></td>
                <td><input type="text" class="form-control form-control-sm" name="productName" value="${rowData.h || ''}"></td>
                <td><input type="text" class="form-control form-control-sm" name="drawingNo" value="${rowData.i || ''}"></td>
                <td><input type="text" class="form-control form-control-sm" name="unit" value="${rowData.j || ''}"></td>
                <td><input type="number" class="form-control form-control-sm" name="quantity" value="${rowData.k || '1'}"></td>
                <td><input type="number" class="form-control form-control-sm" name="unitPrice" value="${unitPrice}"></td>
                <td><input type="number" class="form-control form-control-sm" name="amount" value="${amount}" readonly></td>
                <td><input type="text" class="form-control form-control-sm" name="material" value="${rowData.l || ''}"></td>
                <td><input type="text" class="form-control form-control-sm" name="weight" value="${rowData.n || ''}"></td>
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

    // 计算总金额
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
    $('#print-btn1').off('click').on('click', function() {
        printReturnOrder1();
    });

    // 实时计算金额
    $(document).off('input', 'input[name="quantity"], input[name="unitPrice"]').on('input', 'input[name="quantity"], input[name="unitPrice"]', function() {
        calculateRowAmount1($(this).closest('tr'));
        calculateTotalAmount1();
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
            <td><input type="number" class="form-control form-control-sm" name="quantity" value="1"></td>
            <td><input type="number" class="form-control form-control-sm" name="unitPrice" value="0"></td>
            <td><input type="number" class="form-control form-control-sm" name="amount" value="0" readonly></td>
            <td><input type="text" class="form-control form-control-sm" name="material"></td>
            <td><input type="text" class="form-control form-control-sm" name="weight"></td>
            <td><input type="text" class="form-control form-control-sm" name="remark"></td>
        </tr>
    `;
    table.append(newRow);
    updateRowNumbers1();
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
        calculateTotalAmount1();
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
    return amount;
}

function calculateTotalAmount1() {
    var total = 0;
    $('#return-detail-table1 tbody tr').each(function() {
        total += calculateRowAmount1($(this));
    });

    $('#total-amount1').text(total.toFixed(2));
    $('#total-amount-chinese1').text(numberToChinese1(total));
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

        var row = `
             <tr>
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

    // 设置往来单位
    if (data.length > 0) {
        var firstRowData = data[0].data || data[0];
        var customer = firstRowData.c || '';
        $('#return-customer1').val(customer);
        console.log('设置往来单位:', customer);
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

// ==================== 出库单保存函数 ====================
function saveReturnOrder1() {
    // 检测必填字段
    var returnCustomer1 = $('#return-customer1').val();
    var returnDate1 = $('#return-date1').val();
    var returnNo1 = $('#return-no1').val();

    if (!returnCustomer1) {
        swal("保存失败", "请填写往来单位", "error");
        return;
    }
    if (!returnDate1) {
        swal("保存失败", "请选择出库日期", "error");
        return;
    }
    if (!returnNo1) {
        swal("保存失败", "请生成出库单号", "error");
        return;
    }

    var $btn = $("#save-return-btn1");
    if ($btn.data('submitting')) {
        return;
    }
    $btn.data('submitting', true);
    $btn.prop('disabled', true);

    var originalText = $btn.html();
    $btn.html('<i class="bi bi-arrow-clockwise icon"></i>提交中...');

    // 收集所有明细行的数据
    var details = [];
    $('#return-detail-table1 tbody tr').each(function(index) {
        var $row = $(this);
        var detail = {
            // 头部信息
            f: $('#return-no1').val(),                    // 出库单号
            c: $('#return-customer1').val(),              // 往来单位
            e: $('#return-date1').val(),                  // 出库日期
            r: $('#company-address1').val(),              // 地址
            t: $('#company-phone1').val(),                // 电话
            s: $('#customer-signature1').val(),           // 客户签字

            // 表格明细信息
            d: $row.find('input[name="contractNo"]').val(),      // 合同号
            g: $row.find('input[name="taskNo"]').val(),          // 任务号
            h: $row.find('input[name="gongxu"]').val(),          // 加工工序
            i: $row.find('input[name="productName"]').val(),     // 产品名称
            j: $row.find('input[name="drawingNo"]').val(),       // 图号
            k: $row.find('input[name="unit"]').val(),            // 单位
            l: $row.find('input[name="quantity"]').val(),        // 数量
            m: $row.find('input[name="unitPrice"]').val(),       // 单价
            n: $row.find('input[name="amount"]').val(),          // 金额
            o: $row.find('input[name="material"]').val(),        // 材质
            p: $row.find('input[name="weight"]').val(),          // 重量
            ax: $row.find('input[name="remark"]').val(),         // 备注

            v: $row.data('original-id') || ''              // 原表ID
        };
        details.push(detail);
    });

    console.log('要保存的出库单数据:', details);

    // 发送数据到后端
    var successCount = 0;
    var totalCount = details.length;

    if (totalCount === 0) {
        swal("保存失败", "没有出库明细数据", "error");
        $btn.data('submitting', false);
        $btn.prop('disabled', false);
        $btn.html(originalText);
        return;
    }

    details.forEach(function(detail, index) {
        $ajax({
            type: 'post',
            url: '/htjl/save1',
            data: JSON.stringify(detail),
            dataType: 'json',
            contentType: 'application/json;charset=utf-8'
        }, false, '', function (res) {
            successCount++;

            if (successCount === totalCount) {
                $btn.data('submitting', false);
                $btn.prop('disabled', false);
                $btn.html(originalText);

                if (res.code == 200) {
                    swal("", "保存成功，共插入 " + successCount + " 条数据", "success");
                    // 清空表单
                    $('#return-customer1').val('');
                    $('#return-phone1').val('');
                    $('#return-detail-table1 tbody').empty();
                    addReturnRow1();
                    calculateTotalAmount1();
                } else {
                    swal("", res.msg, "error");
                }
            }
        }, function(xhr, status, error) {
            $btn.data('submitting', false);
            $btn.prop('disabled', false);
            $btn.html(originalText);
            swal("", "请求失败: " + error, "error");
        });
    });
}

// ==================== 生成出库单号 ====================
function generateReturnNo1(callback) {
    console.log('生成出库单号...');

    // 简单的单号生成逻辑
    var now = new Date();
    var dateStr = now.getFullYear() +
        String(now.getMonth() + 1).padStart(2, '0') +
        String(now.getDate()).padStart(2, '0');
    var timestamp = Date.now().toString().slice(-4);
    var newReturnNo = "LH-" + dateStr + timestamp;

    if (callback && typeof callback === 'function') {
        callback(newReturnNo);
    }
}

// ==================== 其他功能函数 ====================
function printReturnOrder1() {
    alert('打印功能开发中...');
}

// 保存出库单数据（使用新的保存逻辑）
function saveReturnOrder() {
    console.log('开始保存出库单数据...');

    // 1. 收集表单数据
    var formData = {
        customer: $('#return-customer1').val(),  // 往来单位 (c字段)
        zhidanren: $('#company-address1').val(), // 制单人 (r字段)
        shenheren: $('#company-phone1').val(),   // 审核人 (s字段)
        songhuoren: $('#songhuoren').val(),      // 送货人 (t字段)
        shouhuoren: $('#shouhuoren').val(),      // 收货人 (u字段)
        chukuriqi: $('#return-date1').val(),     // 出库日期 (p字段)
        chukudanhao: $('#return-no1').val(),     // 出库单号 (e字段)
        details: []
    };

    console.log('表单数据:', formData);

    // 验证必填字段
    if (!formData.chukudanhao || formData.chukudanhao.trim() === '') {
        swal("保存失败", "出库单号不能为空", "error");
        return;
    }

    if (!formData.customer || formData.customer.trim() === '') {
        swal("保存失败", "往来单位不能为空", "error");
        return;
    }

    if (!formData.chukuriqi || formData.chukuriqi.trim() === '') {
        swal("保存失败", "出库日期不能为空", "error");
        return;
    }

    // 收集表格数据
    var hasData = false;
    $('#return-detail-table1 tbody tr').each(function(index) {
        var contractNo = $(this).find('input[name="contractNo"]').val();
        if (contractNo && contractNo.trim() !== '') {
            var rowData = {
                xuhao: (index + 1).toString(),
                contractNo: contractNo,
                taskNo: $(this).find('input[name="taskNo"]').val() || '',
                gongxu: $(this).find('input[name="gongxu"]').val() || '',
                productName: $(this).find('input[name="productName"]').val() || '',
                drawingNo: $(this).find('input[name="drawingNo"]').val() || '',
                unit: $(this).find('input[name="unit"]').val() || '',
                quantity: $(this).find('input[name="quantity"]').val() || '',
                unitPrice: $(this).find('input[name="unitPrice"]').val() || '',
                amount: $(this).find('input[name="amount"]').val() || '',
                material: $(this).find('input[name="material"]').val() || '',
                weight: $(this).find('input[name="weight"]').val() || '',
                remark: $(this).find('input[name="remark"]').val() || ''
            };
            formData.details.push(rowData);
            hasData = true;
        }
    });

    if (!hasData) {
        swal("保存失败", "没有要保存的数据", "error");
        return;
    }

    console.log('要保存的完整数据:', formData);

    // 发送到后端
    $ajax({
        type: 'post',
        url: '/ckd_c/saveReturnOrder',
        data: JSON.stringify(formData),
        contentType: 'application/json',
    }, false, '', function(res) {
        console.log('保存响应:', res);

        if (res.code == 200) {
            swal("保存成功", "出库单已保存到数据库", "success");
            // 可选：保存成功后清空表单
            // clearForm();
        } else {
            swal("保存失败", res.msg, "error");
        }
    }, function(xhr, status, error) {
        console.error('保存失败:', error);
        swal("保存失败", "网络错误: " + error, "error");
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

// ==================== 页面初始化 ====================
$(document).ready(function() {
    console.log('出库单页面开始初始化...');

    // 初始化出库单
    initReturnOrder1();

    // 绑定额外的事件
    $('#add-row-btn').off('click').on('click', function() {
        addNewRow();
    });

    $('#remove-row-btn1').off('click').on('click', function() {
        removeSelectedRows();
    });
});

// 添加新行函数
function addNewRow() {
    var tableBody = $('#return-detail-table1 tbody');
    var currentRows = tableBody.find('tr').length;

    var newRow = `
        <tr>
            <td><input type="checkbox" class="row-select1"></td>
            <td>${currentRows + 1}</td>
            <td><input type="text" class="form-control form-control-sm" name="contractNo"></td>
            <td><input type="text" class="form-control form-control-sm" name="taskNo"></td>
            <td><input type="text" class="form-control form-control-sm" name="gongxu"></td>
            <td><input type="text" class="form-control form-control-sm" name="productName"></td>
            <td><input type="text" class="form-control form-control-sm" name="drawingNo"></td>
            <td><input type="text" class="form-control form-control-sm" name="unit"></td>
            <td><input type="number" class="form-control form-control-sm" name="quantity" value="1"></td>
            <td><input type="number" class="form-control form-control-sm" name="unitPrice" value="0"></td>
            <td><input type="number" class="form-control form-control-sm" name="amount" value="0" readonly></td>
            <td><input type="text" class="form-control form-control-sm" name="material"></td>
            <td><input type="text" class="form-control form-control-sm" name="weight"></td>
            <td><input type="text" class="form-control form-control-sm" name="remark"></td>
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