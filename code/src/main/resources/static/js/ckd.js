// function initReturnOrder1() {
//     $('#return-date1').val(getCurrentDate1());
//     bindReturnOrderEvents1();
//     calculateTotalAmount1();
// }
//
// function bindReturnOrderEvents1() {
//     $('#select1-all').click(function() {
//         $('.row-select1').prop('checked', this.checked);
//     });
//
//     // 保存出库单按钮点击事件
//     $("#save-return-btn1").click(function () {
//         // 检测必填字段
//         var returnCustomer1 = $('#return1-customer').val();
//         var returnDate1 = $('#return1-date').val();
//         var returnNo1 = $('#return1-no').val();
//         var returnPhone1 = $('#return1-phone').val();
//
//         // 检测逻辑
//         if (!returnCustomer1) {
//             swal("保存失败", "请填写往来单位", "error");
//             return;
//         }
//         if (!returnDate1) {
//             swal("保存失败", "请选择出库日期", "error");
//             return;
//         }
//         if (!returnNo1) {
//             swal("保存失败", "请生成出库单号", "error");
//             return;
//         }
//
//         var $btn = $(this);
//         if ($btn.data('submitting')) {
//             return;
//         }
//         $btn.data('submitting', true);
//         $btn.prop('disabled', true);
//
//         var originalText = $btn.html();
//         $btn.html('<i class="bi bi-arrow-clockwise icon"></i>提交中...');
//
//         // 直接收集所有明细行的数据
//         var details = [];
//         $('#return-detail-table1 tbody tr').each(function(index) {
//             var $row = $(this);
//             var detail = {
//                 // 共用信息
//                 f: $('#return-no1').val(),
//                 c: $('#return-customer1').val(),
//                 d: $('#return-phone1').val(),
//                 r: $('#company-address1').val(),
//                 t: $('#company-phone1').val(),
//                 e: $('#return-date1').val(),
//                 s: $('#customer-signature1').val(),
//                 // 明细特有信息
//                 q: $row.find('input[name="returnReason"]').val(),
//                 g: $row.find('input[name="contractNo"]').val(),
//                 h: $row.find('input[name="taskNo"]').val(),
//                 i: $row.find('input[name="productName"]').val(),
//                 j: $row.find('input[name="drawingNo"]').val(),
//                 k: $row.find('input[name="unit"]').val(),
//                 l: $row.find('input[name="quantity"]').val(),
//                 m: $row.find('input[name="unitPrice"]').val(),
//                 n: $row.find('input[name="amount"]').val(),
//                 o: $row.find('input[name="material"]').val(),
//                 p: $row.find('input[name="weight"]').val(),
//                 w: $row.find('input[name="returnDate"]').val(),
//                 u: $row.find('input[name="remark"]').val(),
//                 v: $row.data('original-id') || ''  // 从data属性获取原表id
//             };
//
//             details.push(detail);
//         });
//
//         console.log('要保存的出库单数据:', details);
//
//         // 遍历发送每个明细
//         var successCount = 0;
//         var totalCount = details.length;
//
//         details.forEach(function(detail, index) {
//             $ajax({
//                 type: 'post',
//                 url: '/htjl/save1',
//                 data: JSON.stringify(detail),
//                 dataType: 'json',
//                 contentType: 'application/json;charset=utf-8'
//             }, false, '', function (res) {
//                 successCount++;
//
//                 if (successCount === totalCount) {
//                     $btn.data('submitting', false);
//                     $btn.prop('disabled', false);
//                     $btn.html(originalText);
//
//                     if (res.code == 200) {
//                         swal("", "保存成功，共插入 " + successCount + " 条数据", "success");
//                         // 清空表单
//                         $('#return-customer1').val('');
//                         $('#return-phone1').val('');
//                         $('#return-reason1').val('');
//                         $('#customer-signature1').val('');
//                         $('#return-detail-table1 tbody').empty();
//                         addReturnRow1();
//                         calculateTotalAmount1();
//                     } else {
//                         swal("", res.msg, "error");
//                     }
//                 }
//             }, function(xhr, status, error) {
//                 $btn.data('submitting', false);
//                 $btn.prop('disabled', false);
//                 $btn.html(originalText);
//                 swal("", "请求失败: " + error, "error");
//             });
//         });
//     });
//
//     $('#add-row-btn1').click(function() {
//         addReturnRow1();
//     });
//
//     $('#remove-row-btn1').click(function() {
//         removeSelectedRows1();
//     });
//
//     $('#generate-btn1').click(function() {
//         generateReturnOrder1();
//     });
//     $('#baocun-btn1').click(function() {
//         tuihuojilu1();
//     });
//
//     $('#print-btn1').click(function() {
//         printReturnOrder1();
//     });
//
//     $(document).on('input', 'input[name="quantity"], input[name="unitPrice"]', function() {
//         calculateRowAmount1($(this).closest('tr'));
//         calculateTotalAmount1();
//     });
//
//     $(document).on('change', '.row-select1', function() {
//         updateSelectAllState1();
//     });
// }
//
// function addReturnRow1() {
//     var table = $('#return-detail-table1 tbody');
//     var rowCount = table.find('tr').length;
//     var newRow = `
//         <tr>
//             <td><input type="checkbox" class="row-select1"></td>
//             <td>${rowCount + 1}</td>
//             <td><input type="text" class="form-control form-control-sm" name="contractNo"></td>
//             <td><input type="text" class="form-control form-control-sm" name="taskNo"></td>
//             <td><input type="text" class="form-control form-control-sm" name="productName"></td>
//             <td><input type="text" class="form-control form-control-sm" name="drawingNo"></td>
//             <td><input type="text" class="form-control form-control-sm" name="unit"></td>
//             <td><input type="number" class="form-control form-control-sm" name="quantity" value="1"></td>
//             <td><input type="number" class="form-control form-control-sm" name="unitPrice" value="0"></td>
//             <td><input type="number" class="form-control form-control-sm" name="amount" value="0" readonly></td>
//             <td><input type="text" class="form-control form-control-sm" name="material"></td>
//             <td><input type="text" class="form-control form-control-sm" name="weight"></td>
//             <td><input type="date" class="form-control form-control-sm" name="returnDate"></td>
//             <td><input type="text" class="form-control form-control-sm" name="returnReason"></td>
//             <td><input type="text" class="form-control form-control-sm" name="remark"></td>
//         </tr>
//     `;
//     table.append(newRow);
//     updateRowNumbers1();
// }
//
// function removeSelectedRows1() {
//     var selectedRows = $('.row-select1:checked');
//     if (selectedRows.length === 0) {
//         alert('请选择要删除的行');
//         return;
//     }
//
//     if (confirm('确定要删除选中的行吗？')) {
//         selectedRows.each(function() {
//             $(this).closest('tr').remove();
//         });
//         updateRowNumbers1();
//         calculateTotalAmount1();
//     }
// }
//
// function updateRowNumbers1() {
//     $('#return-detail-table1 tbody tr').each(function(index) {
//         $(this).find('td:eq(1)').text(index + 1);
//     });
// }
//
// function calculateRowAmount1(row) {
//     var quantity = parseFloat(row.find('input[name="quantity"]').val()) || 0;
//     var unitPrice = parseFloat(row.find('input[name="unitPrice"]').val()) || 0;
//     var amount = quantity * unitPrice;
//     row.find('input[name="amount"]').val(amount.toFixed(2));
//     return amount;
// }
//
// function calculateTotalAmount1() {
//     var total = 0;
//     $('#return-detail-table1 tbody tr').each(function() {
//         total += calculateRowAmount1($(this));
//     });
//
//     $('#total-amount1').text(total.toFixed(2));
//     $('#total-amount-chinese1').text(numberToChinese1(total));
// }
//
// function numberToChinese1(num) {
//     if (num === 0) return '零元整';
//
//     var chineseNum = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
//     var chineseUnit = ['', '拾', '佰', '仟'];
//     var bigUnit = ['', '万', '亿'];
//
//     var numStr = Math.round(num * 100).toString();
//     var integerPart = numStr.slice(0, -2) || '0';
//     var decimalPart = numStr.slice(-2);
//
//     var integerChinese = '';
//     var integerArray = integerPart.split('').reverse();
//
//     for (var i = 0; i < integerArray.length; i++) {
//         var digit = parseInt(integerArray[i]);
//         var unit = chineseUnit[i % 4];
//         var bigUnitIndex = Math.floor(i / 4);
//         var bigUnitChar = bigUnit[bigUnitIndex];
//
//         if (digit === 0) {
//             if (integerChinese.charAt(0) !== '零' && i % 4 !== 0) {
//                 integerChinese = '零' + integerChinese;
//             }
//         } else {
//             integerChinese = chineseNum[digit] + unit + bigUnitChar + integerChinese;
//         }
//     }
//
//     var decimalChinese = '';
//     var jiao = parseInt(decimalPart.charAt(0)) || 0;
//     var fen = parseInt(decimalPart.charAt(1)) || 0;
//
//     if (jiao > 0) {
//         decimalChinese += chineseNum[jiao] + '角';
//     }
//     if (fen > 0) {
//         decimalChinese += chineseNum[fen] + '分';
//     }
//
//     var result = integerChinese + '元';
//     if (decimalChinese) {
//         result += decimalChinese;
//     } else {
//         result += '整';
//     }
//
//     return result;
// }
//
// function updateSelectAllState1() {
//     var allChecked = $('.row-select1:checked').length === $('.row-select1').length;
//     $('#select-all1').prop('checked', allChecked);
// }
//
// function generateReturnOrder1() {
//     let rows = getTableSelection('#userTable');
//     if (rows.length == 0) {
//         swal('请选择要生成出库单的数据!');
//         return;
//     }
//
//     console.log('选中的行数据:', rows);
//
//     // 清空现有出库单数据（保留第一行）
//     $('#return-detail-table1 tbody tr:gt(0)').remove();
//
//     // 筛选符合条件的数据（f字段为"已完成"）
//     let validRows = rows.filter(function(selectedRow) {
//         let rowData = selectedRow.data;
//         let processStatus = rowData.f || ''; // f字段：工艺规程状态
//         let isValid = processStatus === '已完成';
//
//         console.log('行数据工艺状态:', processStatus, '是否有效:', isValid);
//         return isValid;
//     });
//
//     if (validRows.length === 0) {
//         swal('生成失败', '选中的行中没有工艺规程状态为"已完成"的数据!', 'error');
//         return;
//     }
//
//     // 填充出库单数据
//     validRows.forEach(function(selectedRow, index) {
//         let rowData = selectedRow.data;
//         console.log('第' + (index + 1) + '行数据:', rowData);
//
//         if (index === 0) {
//             // 第一行使用现有行
//             fillReturnRowData1($('#return-detail-table1 tbody tr:first'), rowData);
//         } else {
//             // 添加新行并填充数据
//             addReturnRow1();
//             var newRow = $('#return-detail-table1 tbody tr:last');
//             fillReturnRowData1(newRow, rowData);
//         }
//     });
//
//     // 更新出库单头部信息（使用第一个选中行的信息）
//     if (validRows.length > 0) {
//         let firstRow = validRows[0].data;
//         $('#return-customer1').val(firstRow.c || '');
//         $('#return-phone1').val(firstRow.phone || '');
//
//         // 生成出库单号
//         $('#return-no1').val(generateReturnNo1());
//
//         // 设置当前日期为出库日期
//         $('#return-date1').val(getCurrentDate1());
//     }
//
//     // 计算总金额
//     calculateTotalAmount1();
//
//     $('#return-modal1').modal('show');
//     swal("生成成功", "已生成 " + validRows.length + " 条出库单数据", "success");
// }
//
// // 填充出库单行数据
// function fillReturnRowData1($row, rowData) {
//     $row.find('input[name="contractNo"]').val(rowData.d || '');
//     $row.find('input[name="taskNo"]').val(rowData.e || '');
//     $row.find('input[name="productName"]').val(rowData.h || '');
//     $row.find('input[name="drawingNo"]').val(rowData.i || '');
//     $row.find('input[name="unit"]').val(rowData.j || '');
//     $row.find('input[name="quantity"]').val(rowData.k || '1');
//     $row.find('input[name="unitPrice"]').val(rowData.p || '0');
//     $row.find('input[name="material"]').val(rowData.l || '');
//     $row.find('input[name="weight"]').val(rowData.n || '');
//     $row.find('input[name="remark"]').val(rowData.ax || '');
//     // 设置隐藏的原表id
//     $row.data('original-id', rowData.id);
//     // 计算金额
//     calculateRowAmount1($row);
// }
//
// // 生成出库单号
// function generateReturnNo1() {
//     $ajax({
//         type: 'post',
//         url: '/htjl/getddh1',
//     }, false, '', function (res) {
//         if (res.code == 200) {
//             var now = new Date();
//             var dateStr = now.getFullYear() +
//                 String(now.getMonth() + 1).padStart(2, '0') +
//                 String(now.getDate()).padStart(2, '0');
//             maxNo = res.data;
//             var newReturnNo;
//
//             if (!maxNo || maxNo === '') {
//                 newReturnNo = "No:" + dateStr + "0001";
//             } else {
//                 var numberPart = maxNo.split(":")[1];
//                 var nextNum = parseInt(numberPart) + 1;
//                 newReturnNo = "No:" + nextNum;
//             }
//
//             // 直接填入输入框
//             $('#return-no1').val(newReturnNo);
//             console.log('出库单号已更新:', newReturnNo);
//
//         } else {
//             console.error('获取单号失败');
//             // 失败时生成临时单号
//             var tempNo = "No:" + new Date().getTime();
//             $('#return-no1').val(tempNo);
//         }
//     });
// }
//
// function getCurrentDate1() {
//     var now = new Date();
//     var year = now.getFullYear();
//     var month = String(now.getMonth() + 1).padStart(2, '0');
//     var day = String(now.getDate()).padStart(2, '0');
//     return year + '-' + month + '-' + day;
// }
//
// function printReturnOrder1() {
//     alert('打印功能开发中...');
// }





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
var columnTitles = {
    'r': '铣工时/40',
    't': '车工时/40',
    'v': '钳公式/40'
};
var columnMultipliers = {
    'r': 40,
    't': 40,
    'v': 40
};
var idd;

// ==================== 初始化函数 ====================
function initTitleInputs() {
    console.log("initTitleInputs 函数被调用");
    // 具体的初始化逻辑...
}

// ... 你原有的其他代码保持不变 ...



// ==================== 出库单事件绑定函数 ====================
function bindReturnOrderEvents1() {
    // 全选/取消全选
    $('#select-all1').click(function() {
        $('.row-select1').prop('checked', this.checked);
    });

    // 添加行
    $('#add-row-btn1').click(function() {
        addReturnRow1();
    });

    // 删除选中行
    $('#remove-row-btn1').click(function() {
        removeSelectedRows1();
    });

    // 保存出库单
    $("#save-return-btn1").click(function () {
        saveReturnOrder1();
    });

    // 打印
    $('#print-btn1').click(function() {
        printReturnOrder1();
    });

    // 实时计算金额
    $(document).on('input', 'input[name="quantity"], input[name="unitPrice"]', function() {
        calculateRowAmount1($(this).closest('tr'));
        calculateTotalAmount1();
    });

    // 更新全选状态
    $(document).on('change', '.row-select1', function() {
        updateSelectAllState1();
    });
}

// ==================== 其他相关函数 ====================
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

    // 收集所有明细行的数据 - 按照HTML字段名
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

            // 表格明细信息 - 按照HTML字段名
            d: $row.find('input[name="contractNo"]').val(),      // 合同号
            g: $row.find('input[name="taskNo"]').val(),          // 任务号
            h: $row.find('input[name="process"]').val(),         // 加工工序
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

function printReturnOrder1() {
    alert('打印功能开发中...');
}








// 接收页面数据加载函数
// 页面加载完成后执行
$(document).ready(function() {
    // 从URL参数获取IDs
    const urlParams = new URLSearchParams(window.location.search);
    const idsParam = urlParams.get('ids');

    console.log('=== 页面加载调试信息 ===');
    console.log('完整的URL参数:', Object.fromEntries(urlParams.entries()));
    console.log('ids参数值:', idsParam);
    console.log('ids参数类型:', typeof idsParam);

    if (idsParam) {
        // 直接传递字符串，loadDataByIds会处理
        loadDataByIds(idsParam);
    } else {
        // 检查是否有单个id参数
        const idParam = urlParams.get('id');
        if (idParam) {
            console.log('找到单个id参数:', idParam);
            console.log('单个id参数类型:', typeof idParam);
            loadDataByIds(idParam);
        } else {
            console.log('没有IDs或ID参数');
            swal("提示", "没有找到要加载的数据", "info");
        }
    }
});

// // 填充出库单表格
// function fillReturnOrderTable(data) {
//     // 清空现有数据（保留第一行）
//     $('#return-detail-table1 tbody tr:gt(0)').remove();
//
//     // 填充数据到表格
//     data.forEach(function(item, index) {
//         let rowData = item.data;
//
//         if (index === 0) {
//             // 第一行使用现有行
//             fillReturnRowData1($('#return-detail-table1 tbody tr:first'), rowData);
//         } else {
//             // 添加新行并填充数据
//             addReturnRow1();
//             var newRow = $('#return-detail-table1 tbody tr:last');
//             fillReturnRowData1(newRow, rowData);
//         }
//     });
//
//     // 更新头部信息（使用第一个数据行的信息）
//     if (data.length > 0) {
//         let firstRow = data[0].data;
//         $('#return-customer1').val(firstRow.c || '');
//         $('#return-phone1').val(firstRow.phone || '');
//
//         // 生成出库单号
//         generateReturnNo1();
//
//         // 设置当前日期
//         $('#return-date1').val(getCurrentDate1());
//     }
//
//     // 计算总金额
//     calculateTotalAmount1();
// }

// function fillReturnRowData1($row, rowData) {
//     $row.find('input[name="contractNo"]').val(rowData.d || '');        // 合同号
//     $row.find('input[name="taskNo"]').val(rowData.e || '');           // 任务号
//     $row.find('input[name="process"]').val(rowData.g || '');          // 加工工序
//     $row.find('input[name="productName"]').val(rowData.h || '');      // 产品名称
//     $row.find('input[name="drawingNo"]').val(rowData.i || '');        // 图号
//     $row.find('input[name="unit"]').val(rowData.j || '');             // 单位
//     $row.find('input[name="quantity"]').val(rowData.k || '1');        // 数量
//     $row.find('input[name="unitPrice"]').val(rowData.p || '0');       // 单价
//     $row.find('input[name="material"]').val(rowData.l || '');         // 材质
//     $row.find('input[name="weight"]').val(rowData.n || '');           // 重量
//     $row.find('input[name="remark"]').val(rowData.ax || '');          // 备注
//
//     // 设置可编辑
//     $row.find('input').prop('contenteditable', 'true');
//
//     // 保存原表ID
//     $row.data('original-id', rowData.id);
//
//     // 计算金额
//     calculateRowAmount1($row);
// }

// // 修改接收页面的初始化函数
// function initReturnOrderPage() {
//     $('#return-date1').val(getCurrentDate1());
//
//     const urlParams = getUrlParams();
//     bindReturnOrderEvents1();
//
//     // 修改这部分代码
//     if (urlParams.id) {
//         console.log('接收到ID:', urlParams.id);
//         // 使用GET请求
//         fetch(`/htjl/getById?id=${urlParams.id}`)
//             .then(response => response.json())
//             .then(data => {
//                 alert(data);
//                 console.log('接收到数据:', data);
//             });
//     } else if (urlParams.ids) {
//         console.log('接收到多个ID:', urlParams.ids);
//         // 使用GET请求，用逗号分隔
//         fetch(`/htjl/getByIds?ids=${urlParams.ids}`)
//             .then(response => response.json())
//             .then(data => {
//                 // 处理数据
//                 alert(data);
//                 console.log('接收到数据:', data);
//             });
//     }
//
//     calculateTotalAmount1();
// }

// // 根据单个ID加载数据
// function loadDataById(id) {
//     console.log('开始根据ID查询数据:', id);
//
//     $ajax({
//         type: 'post',
//         url: '/htjl/getById',
//         data: { id: id }
//     }, false, '', function(res) {
//         console.log('单个ID查询响应:', res);
//
//         if (res.code == 200 && res.data) {
//             // 将查询到的数据填充到表格
//             const dataToFill = [{ data: res.data }];
//             fillReturnOrderTable(dataToFill);
//             swal("数据加载成功", "已加载选中的数据", "success");
//         } else {
//             swal("数据加载失败", res.msg || "未找到对应数据", "error");
//         }
//     }, function(xhr, status, error) {
//         console.error('单个ID查询失败:', error);
//         swal("查询失败", "网络错误: " + error, "error");
//     });
// }
//
// 根据多个ID加载数据
function loadDataByIds(ids) {
    console.log('开始根据多个ID查询数据:', ids);
    console.log('ids类型:', typeof ids);

    // 参数验证和处理
    if (!ids && ids !== 0) {  // 允许id为0的情况
        swal("参数错误", "没有提供ID参数", "error");
        return;
    }

    let idsArray;
    if (typeof ids === 'string') {
        // 如果是逗号分隔的字符串
        idsArray = ids.split(',').filter(id => id.trim() !== '');
    } else if (Array.isArray(ids)) {
        // 如果已经是数组
        idsArray = ids.filter(id => id !== null && id !== undefined && id.toString().trim() !== '');
    } else if (typeof ids === 'number') {
        // 如果是单个数字ID
        idsArray = [ids.toString()];
    } else {
        // 其他类型都转为字符串数组
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
}// // 填充表格数据
// function fillReturnOrderTable(data) {
//     console.log('开始填充表格数据:', data);
//
//     // 清空现有数据（保留第一行）
//     $('#return-detail-table1 tbody tr:gt(0)').remove();
//
//     // 填充数据到表格
//     data.forEach(function(item, index) {
//         let rowData = item.data;
//
//         if (index === 0) {
//             // 第一行使用现有行
//             fillReturnRowData1($('#return-detail-table1 tbody tr:first'), rowData);
//         } else {
//             // 添加新行并填充数据
//             addReturnRow1();
//             var newRow = $('#return-detail-table1 tbody tr:last');
//             fillReturnRowData1(newRow, rowData);
//         }
//     });
//
//     // 更新头部信息（使用第一个数据行的信息）
//     if (data.length > 0) {
//         let firstRow = data[0].data;
//         $('#return-customer1').val(firstRow.c || '');
//         $('#return-phone1').val(firstRow.phone || '');
//
//         // 生成出库单号
//         generateReturnNo1();
//
//         // 设置当前日期
//         $('#return-date1').val(getCurrentDate1());
//     }
//
//     // 计算总金额
//     calculateTotalAmount1();
//
//     console.log('表格数据填充完成');
// }
//
// // 页面加载完成后执行
// $(document).ready(function() {
//     initReturnOrderPage();
// });
//
// function getUrlParams() {
//     const urlParams = new URLSearchParams(window.location.search);
//     const params = {};
//
//     for (const [key, value] of urlParams) {
//         params[key] = value;
//     }
//     console.log("URL参数:", params);
//     return params;
// }







function fillReturnOrderTable(data) {
    console.log('=== fillReturnOrderTable 开始 ===');
    console.log('接收到的完整数据:', data);

    var tableBody = $('#return-detail-table1 tbody');
    tableBody.empty(); // 清空现有数据

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
    console.log('第一条数据的结构:', data[0]);
    console.log('第一条数据的所有字段:', Object.keys(data[0]));

    // 遍历数据并生成表格行
    data.forEach(function(item, index) {
        // 提取实际的数据对象
        var rowData = item.data || item;

        console.log(`第${index}行数据:`, rowData);

        // 计算单价（s + u + w + y + aa + ac + ae + ag + ai + ak + am + ao 的总和）
        var unitPrice = calculateUnitPrice(rowData);
        // 计算金额（数量 × 单价）
        var amount = calculateAmount(rowData, unitPrice);

        console.log(`第${index}行数据字段:`, Object.keys(rowData));

        var row = `
             <tr>
                <td><input type="checkbox" class="row-select"></td>
                <td><input type="text" class="form-control form-control-sm" name="xuhao" value="${index + 1}" contenteditable="false"></td>
                <td><input type="text" class="form-control form-control-sm" name="contractNo" value="${rowData.d || ''}" contenteditable="false"></td>
                <td><input type="text" class="form-control form-control-sm" name="taskNo" value="${rowData.e || ''}" contenteditable="false"></td>
                <td><input type="text" class="form-control form-control-sm" name="gongxu" value="${rowData.g || ''}" contenteditable="false"></td>
                <td><input type="text" class="form-control form-control-sm" name="productName" value="${rowData.h || ''}" contenteditable="false"></td>
                <td><input type="text" class="form-control form-control-sm" name="drawingNo" value="${rowData.i || ''}" contenteditable="false"></td>
                <td><input type="text" class="form-control form-control-sm" name="unit" value="${rowData.j || ''}" contenteditable="false"></td>
                <td><input type="number" class="form-control form-control-sm" name="quantity" value="${rowData.k || ''}" contenteditable="false"></td>
  <td><input type="number" class="form-control form-control-sm" name="unitPrice" value="${unitPrice}" contenteditable="false"></td>
   <td><input type="number" class="form-control form-control-sm" name="amount" value="${amount}" contenteditable="false"></td>
                <td><input type="text" class="form-control form-control-sm" name="material" value="${rowData.l || ''}" contenteditable="false"></td>
                <td><input type="text" class="form-control form-control-sm" name="weight" value="${rowData.n || ''}" contenteditable="false"></td>
                <td><input type="text" class="form-control form-control-sm" name="remark" value="${rowData.r || ''}" contenteditable="false"></td>
            </tr>
        `;
        tableBody.append(row);
    });


    // 设置往来单位（使用第一条数据的c列）
    if (data.length > 0) {
        var firstRowData = data[0].data || data[0];
        var customer = firstRowData.c || '';
        $('#return-customer1').val(customer);
        console.log('设置往来单位:', customer);
    }






    console.log('表格填充完成，共填充', data.length, '行数据');
    console.log('=== fillReturnOrderTable 结束 ===');





    // 计算单价的函数
    function calculateUnitPrice(rowData) {
        var sum = 0;

        // 需要计算的字段列表
        var columns = ['s', 'u', 'w', 'y', 'aa', 'ac', 'ae', 'ag', 'ai', 'ak', 'am', 'ao'];

        columns.forEach(function(field) {
            var columnValue = rowData[field];
            if (columnValue !== null && columnValue !== undefined && columnValue !== '') {
                sum += parseFloat(columnValue) || 0;
            }
        });

        // 返回计算结果，保留2位小数
        return sum.toFixed(2);
    }


    // 计算金额的函数
    function calculateAmount(rowData, unitPrice) {
        // 注意：这里使用 rowData.k 作为数量，而不是 rowData.m
        var quantity = parseFloat(rowData.k) || 0; // 数量
        var price = parseFloat(unitPrice) || 0;    // 单价

        if (quantity > 0 && price > 0) {
            return (quantity * price).toFixed(2);
        }
        return '';
    }






    // 检查表格是否真的被更新了
    setTimeout(function() {
        var rowCount = $('#return-detail-table1 tbody tr').length;
        console.log('实际表格行数:', rowCount);
    }, 100);
}

// 全选功能
$('#select-all1').change(function() {
    var isChecked = $(this).prop('checked');
    $('#return-detail-table1 .row-select').prop('checked', isChecked);
});

// // 使用示例
// function loadData() {
//     $ajax({
//         type: 'post',
//         url: '/your-api-url', // 替换为你的API地址
//         data: {
//             // 你的查询参数
//         }
//     }, true, '', function (res) {
//         console.log('查询响应:', res);
//         if (res.code == 200) {
//             console.log('查询到的数据:', res.data);
//
//             // 如果字段名不匹配，先进行映射
//             var mappedData = mapDataFields(res.data);
//
//             // 填充表格
//             setTable(mappedData);
//
//             swal("查询成功", "找到 " + res.data.length + " 条记录", "success");
//         } else {
//             swal("查询失败", res.msg, "error");
//         }
//     });
// }

// 页面加载完成后初始化
$(document).ready(function() {
    // 绑定全选事件
    $('#select-all1').change(function() {
        var isChecked = $(this).prop('checked');
        $('#return-detail-table1 .row-select').prop('checked', isChecked);
    });
    id = 1739
    loadDataByIds(id);
});












// 保存出库单数据
function saveReturnOrder() {
    console.log('开始保存出库单数据...');

    // 1. 收集表单数据
    var formData = {
        customer: $('#return-customer1').val(),  // 往来单位 (c字段)
        details: []
    };

    console.log('表单数据:', formData);

    // 2. 收集表格数据
    var hasData = false;
    $('#return-detail-table1 tbody tr').each(function(index) {
        var contractNo = $(this).find('input[name="contractNo"]').val();
        if (contractNo && contractNo.trim() !== '') {
            var rowData = {
                xuhao: $(this).find('input[name="xuhao"]').val() || (index + 1).toString(),
                contractNo: contractNo,                                       // d字段
                taskNo: $(this).find('input[name="taskNo"]').val() || '',     // e字段
                gongxu: $(this).find('input[name="gongxu"]').val() || '',     // g字段
                productName: $(this).find('input[name="productName"]').val() || '', // h字段
                drawingNo: $(this).find('input[name="drawingNo"]').val() || '',     // i字段
                unit: $(this).find('input[name="unit"]').val() || '',               // j字段
                quantity: $(this).find('input[name="quantity"]').val() || '',       // k字段
                unitPrice: $(this).find('input[name="unitPrice"]').val() || '',     // s字段
                amount: $(this).find('input[name="amount"]').val() || '',           // t字段
                material: $(this).find('input[name="material"]').val() || '',       // l字段
                weight: $(this).find('input[name="weight"]').val() || '',           // n字段
                remark: $(this).find('input[name="remark"]').val() || ''            // r字段
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

    // 3. 发送到后端
    $ajax({
        type: 'post',
        url: '/ckd_c/saveReturnOrder',  // 注意URL路径
        data: JSON.stringify(formData),
        contentType: 'application/json',
    }, false, '', function(res) {
        console.log('保存响应:', res);

        if (res.code == 200) {
            swal("保存成功", "出库单已保存到数据库", "success");
        } else {
            swal("保存失败", res.msg, "error");
        }
    }, function(xhr, status, error) {
        console.error('保存失败:', error);
        swal("保存失败", "网络错误: " + error, "error");
    });
}