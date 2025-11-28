//package com.example.demo.controller;
//
//import com.example.demo.service.BgdService;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.web.bind.annotation.*;
//
//import javax.servlet.http.HttpServletResponse;
//import java.io.IOException;
//import java.io.PrintWriter;
//import java.text.SimpleDateFormat;
//import java.util.*;
//
//@RestController
//@RequestMapping("/mobile")
//public class MobileController {
//
//    @Autowired
//    private BgdService bgdService;
//
//    /**
//     * 移动端合同详情页面 - 不需要登录
//     */
//    @GetMapping("/contract/{contractId}")
//    public void mobileContractPage(@PathVariable String contractId, HttpServletResponse response) {
//        try {
//            // 设置响应类型为HTML
//            response.setContentType("text/html;charset=UTF-8");
//            response.setCharacterEncoding("UTF-8");
//
//            PrintWriter out = response.getWriter();
//            out.write(getMobileContractHtml(contractId));
//            out.flush();
//            out.close();
//
//            System.out.println("=== 移动端页面成功返回 ===");
//            System.out.println("合同ID: " + contractId);
//
//        } catch (IOException e) {
//            e.printStackTrace();
//            System.out.println("=== 移动端页面返回失败 ===");
//            System.out.println("错误: " + e.getMessage());
//        }
//    }
//
//    /**
//     * 获取合同详细数据的API接口
//     */
//    @GetMapping("/contractData/{contractId}")
//    public Map<String, Object> getContractData(@PathVariable String contractId) {
//        try {
//            System.out.println("=== 获取合同详细数据 ===");
//            System.out.println("合同ID: " + contractId);
//
//            // 根据合同ID获取合同详情
//            List<Map<String, Object>> contractDetails = bgdService.getContractDetails(contractId);
//
//            if (contractDetails == null || contractDetails.isEmpty()) {
//                System.out.println("未找到合同数据");
//                Map<String, Object> errorResult = new HashMap<>();
//                errorResult.put("success", false);
//                errorResult.put("message", "未找到合同ID: " + contractId + " 对应的数据");
//                return errorResult;
//            }
//
//            System.out.println("找到 " + contractDetails.size() + " 条工序记录");
//
//            // 构建返回数据
//            Map<String, Object> result = buildContractData(contractId, contractDetails);
//            result.put("success", true);
//
//            return result;
//
//        } catch (Exception e) {
//            e.printStackTrace();
//            System.out.println("获取合同数据异常: " + e.getMessage());
//            Map<String, Object> errorResult = new HashMap<>();
//            errorResult.put("success", false);
//            errorResult.put("message", "系统错误: " + e.getMessage());
//            return errorResult;
//        }
//    }
//
//    /**
//     * 构建合同数据
//     */
//    private Map<String, Object> buildContractData(String contractId, List<Map<String, Object>> contractDetails) {
//        // 基本信息（从第一条记录获取）
//        Map<String, Object> firstProcess = contractDetails.get(0);
//
//        Map<String, Object> basicInfo = new HashMap<>();
//        basicInfo.put("contractId", contractId);
//        basicInfo.put("businessUnit", firstProcess.get("D") != null ? firstProcess.get("D").toString() : "");
//        basicInfo.put("partName", firstProcess.get("G") != null ? firstProcess.get("G").toString() : "");
//        basicInfo.put("material", firstProcess.get("F") != null ? firstProcess.get("F").toString() : "");
//        basicInfo.put("quantity", firstProcess.get("E") != null ? firstProcess.get("E").toString() : "");
//        basicInfo.put("drawingNumber", firstProcess.get("I") != null ? firstProcess.get("I").toString() : "");
//        basicInfo.put("taskNumber", firstProcess.get("H") != null ? firstProcess.get("H").toString() : "");
//
//        // 工序列表
//        List<Map<String, Object>> processes = new ArrayList<>();
//        for (int i = 0; i < contractDetails.size(); i++) {
//            Map<String, Object> process = contractDetails.get(i);
//            Map<String, Object> processInfo = new HashMap<>();
//            processInfo.put("id", process.get("id")); // 添加 id 字段
//            processInfo.put("index", i + 1);
//            processInfo.put("processName", process.get("J") != null ? process.get("J").toString() : "");
//            processInfo.put("processContent", process.get("K") != null ? process.get("K").toString() : "");
//            processInfo.put("workHours", process.get("L") != null ? process.get("L").toString() : "");
//            processInfo.put("employeeSign", process.get("M") != null ? process.get("M").toString() : "");
//            processInfo.put("completionTime", process.get("N") != null ? process.get("N").toString() : "");
//            processes.add(processInfo);
//        }
//
//        Map<String, Object> result = new HashMap<>();
//        result.put("basicInfo", basicInfo);
//        result.put("processes", processes);
//        result.put("totalProcesses", processes.size());
//
//        // 统计已签名的工序数
//        long signedCount = processes.stream()
//                .filter(process -> {
//                    Object sign = process.get("employeeSign");
//                    return sign != null && !sign.toString().isEmpty() && !"null".equals(sign.toString());
//                })
//                .count();
//        result.put("signedCount", signedCount);
//        result.put("unsignedCount", processes.size() - signedCount);
//
//        return result;
//    }
//
////    @PostMapping("/updateProcessSign")
////    public Map<String, Object> updateProcessSign(@RequestParam String contractId,
////                                                 @RequestParam String processName,
////                                                 @RequestParam String employeeSign) {
////        try {
////            System.out.println("=== 移动端签名请求 ===");
////            System.out.println("合同ID: " + contractId);
////            System.out.println("工序名称: " + processName);
////            System.out.println("员工签名: " + employeeSign);
////
////            // 验证参数
////            if (contractId == null || contractId.trim().isEmpty()) {
////                return createErrorResult("合同ID不能为空");
////            }
////            if (processName == null || processName.trim().isEmpty()) {
////                return createErrorResult("工序名称不能为空");
////            }
////            if (employeeSign == null || employeeSign.trim().isEmpty()) {
////                return createErrorResult("员工签名不能为空");
////            }
////
////            // 获取当前时间
////            String completionTime = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date());
////
////            // 调用service更新签名信息
////            boolean success = bgdService.updateProcessSign(contractId, processName, employeeSign, completionTime);
////
////            if (success) {
////                System.out.println("签名更新成功");
////                return createSuccessResult("签名成功");
////            } else {
////                System.out.println("签名更新失败");
////                return createErrorResult("签名失败，请检查工序是否存在");
////            }
////
////        } catch (Exception e) {
////            e.printStackTrace();
////            System.out.println("签名异常: " + e.getMessage());
////            return createErrorResult("系统错误: " + e.getMessage());
////        }
////    }
//
//    @PostMapping("/updateProcessSign")
//    public Map<String, Object> updateProcessSign(@RequestParam String contractId,
//                                                 @RequestParam String processName,
//                                                 @RequestParam String employeeSign,
//                                                 @RequestParam Integer id) { // 添加 id 参数
//        try {
//            System.out.println("=== 移动端签名请求 ===");
//            System.out.println("合同ID: " + contractId);
//            System.out.println("工序名称: " + processName);
//            System.out.println("员工签名: " + employeeSign);
//            System.out.println("记录ID: " + id);
//
//            // 验证参数
//            if (contractId == null || contractId.trim().isEmpty()) {
//                return createErrorResult("合同ID不能为空");
//            }
//            if (processName == null || processName.trim().isEmpty()) {
//                return createErrorResult("工序名称不能为空");
//            }
//            if (employeeSign == null || employeeSign.trim().isEmpty()) {
//                return createErrorResult("员工签名不能为空");
//            }
//            if (id == null) {
//                return createErrorResult("记录ID不能为空");
//            }
//
//            // 获取当前时间
//            String completionTime = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date());
//
//            // 调用service更新签名信息，传入id
//            boolean success = bgdService.updateProcessSign(contractId, processName, employeeSign, completionTime, id);
//
//            if (success) {
//                System.out.println("签名更新成功");
//                return createSuccessResult("签名成功");
//            } else {
//                System.out.println("签名更新失败");
//                return createErrorResult("签名失败，请检查工序是否存在");
//            }
//
//        } catch (Exception e) {
//            e.printStackTrace();
//            System.out.println("签名异常: " + e.getMessage());
//            return createErrorResult("系统错误: " + e.getMessage());
//        }
//    }
//
//    /**
//     * 创建成功结果
//     */
//    private Map<String, Object> createSuccessResult(String message) {
//        Map<String, Object> result = new HashMap<>();
//        result.put("success", true);
//        result.put("code", 200);
//        result.put("message", message);
//        return result;
//    }
//
//    /**
//     * 创建错误结果
//     */
//    private Map<String, Object> createErrorResult(String message) {
//        Map<String, Object> result = new HashMap<>();
//        result.put("success", false);
//        result.put("code", 500);
//        result.put("message", message);
//        return result;
//    }
//
//
//    private String getMobileContractHtml(String contractId) {
//        return "<!DOCTYPE html>\n" +
//                "<html lang=\"zh-CN\">\n" +
//                "<head>\n" +
//                "    <meta charset=\"UTF-8\">\n" +
//                "    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n" +
//                "    <title>合同工艺规程</title>\n" +
//                "    <link href=\"https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css\" rel=\"stylesheet\">\n" +
//                "    <style>\n" +
//                "        body { background-color: #f8f9fa; }\n" +
//                "        .container { max-width: 800px; margin: 0 auto; padding: 15px; }\n" +
//                "        .card { margin-bottom: 15px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }\n" +
//                "        .process-item { border-left: 4px solid #007bff; padding-left: 15px; margin-bottom: 10px; background-color: white; padding: 10px; border-radius: 5px; }\n" +
//                "        .signed { border-left-color: #28a745; background-color: #f8fff9; }\n" +
//                "        .unsigned { border-left-color: #dc3545; background-color: #fff8f8; }\n" +
//                "        .stats { font-size: 0.9rem; }\n" +
//                "    </style>\n" +
//                "</head>\n" +
//                "<body>\n" +
//                "    <div class=\"container\">\n" +
//                "        <div class=\"text-center mb-4\">\n" +
//                "            <h4 class=\"text-primary\">合同工艺规程</h4>\n" +
//                "            <p class=\"text-muted\">合同ID: <span id=\"contractId\">" + contractId + "</span></p>\n" +
//                "        </div>\n" +
//                "\n" +
//                "        <!-- 基本信息 -->\n" +
//                "        <div class=\"card\">\n" +
//                "            <div class=\"card-header bg-primary text-white\">\n" +
//                "                <h6 class=\"mb-0\">基本信息</h6>\n" +
//                "            </div>\n" +
//                "            <div class=\"card-body\">\n" +
//                "                <div class=\"row\" id=\"basicInfo\">\n" +
//                "                    <div class=\"text-center\">\n" +
//                "                        <div class=\"spinner-border spinner-border-sm\" role=\"status\"></div>\n" +
//                "                        <span>加载中...</span>\n" +
//                "                    </div>\n" +
//                "                </div>\n" +
//                "            </div>\n" +
//                "        </div>\n" +
//                "\n" +
//                "        <!-- 统计信息 -->\n" +
//                "        <div class=\"card\">\n" +
//                "            <div class=\"card-header bg-info text-white\">\n" +
//                "                <h6 class=\"mb-0\">统计信息</h6>\n" +
//                "            </div>\n" +
//                "            <div class=\"card-body\">\n" +
//                "                <div class=\"row text-center stats\" id=\"statsInfo\">\n" +
//                "                    <div class=\"col-4\">\n" +
//                "                        <div class=\"spinner-border spinner-border-sm\" role=\"status\"></div>\n" +
//                "                        <span>加载中...</span>\n" +
//                "                    </div>\n" +
//                "                </div>\n" +
//                "            </div>\n" +
//                "        </div>\n" +
//                "\n" +
//                "        <!-- 工序列表 -->\n" +
//                "        <div class=\"card\">\n" +
//                "            <div class=\"card-header bg-secondary text-white\">\n" +
//                "                <h6 class=\"mb-0\">工序列表</h6>\n" +
//                "            </div>\n" +
//                "            <div class=\"card-body\">\n" +
//                "                <div id=\"processList\">\n" +
//                "                    <div class=\"text-center\">\n" +
//                "                        <div class=\"spinner-border spinner-border-sm\" role=\"status\"></div>\n" +
//                "                        <span>加载工序列表...</span>\n" +
//                "                    </div>\n" +
//                "                </div>\n" +
//                "            </div>\n" +
//                "        </div>\n" +
//                "\n" +
//                "        <!-- 签名区域 -->\n" +
//                "        <div class=\"card\">\n" +
//                "            <div class=\"card-header bg-warning text-dark\">\n" +
//                "                <h6 class=\"mb-0\">工序签名</h6>\n" +
//                "            </div>\n" +
//                "            <div class=\"card-body\">\n" +
//                "                <form id=\"signForm\">\n" +
//                "                    <div class=\"mb-3\">\n" +
//                "                        <label for=\"processSelect\" class=\"form-label\">选择工序</label>\n" +
//                "                        <select class=\"form-select\" id=\"processSelect\">\n" +
//                "                            <option value=\"\">请选择工序...</option>\n" +
//                "                        </select>\n" +
//                "                    </div>\n" +
//                "                    <div class=\"mb-3\">\n" +
//                "                        <label for=\"employeeSign\" class=\"form-label\">员工签名</label>\n" +
//                "                        <input type=\"text\" class=\"form-control\" id=\"employeeSign\" placeholder=\"请输入您的姓名\">\n" +
//                "                    </div>\n" +
//                "                    <button type=\"submit\" class=\"btn btn-success w-100\">确认签名</button>\n" +
//                "                </form>\n" +
//                "            </div>\n" +
//                "        </div>\n" +
//                "    </div>\n" +
//                "\n" +
//                "    <script>\n" +
//                "        const contractId = '" + contractId + "';\n" +
//                "        let processDataMap = new Map(); // 用于存储工序数据\n" +
//                "\n" +
//                "        // 加载合同数据\n" +
//                "        async function loadContractData() {\n" +
//                "            try {\n" +
//                "                console.log('开始加载合同数据，合同ID:', contractId);\n" +
//                "                const response = await fetch('/mobile/contractData/' + contractId);\n" +
//                "                const result = await response.json();\n" +
//                "                console.log('合同数据响应:', result);\n" +
//                "                \n" +
//                "                if (result.success) {\n" +
//                "                    displayContractData(result);\n" +
//                "                } else {\n" +
//                "                    showError(result.message);\n" +
//                "                }\n" +
//                "            } catch (error) {\n" +
//                "                console.error('加载合同数据失败:', error);\n" +
//                "                showError('加载失败: ' + error.message);\n" +
//                "            }\n" +
//                "        }\n" +
//                "\n" +
//                "        // 显示错误信息\n" +
//                "        function showError(message) {\n" +
//                "            document.getElementById('basicInfo').innerHTML = `\n" +
//                "                <div class=\"alert alert-danger\">\n" +
//                "                    <h6>加载失败</h6>\n" +
//                "                    <p class=\"mb-0\">${message}</p>\n" +
//                "                </div>\n" +
//                "            `;\n" +
//                "            document.getElementById('statsInfo').innerHTML = '';\n" +
//                "            document.getElementById('processList').innerHTML = '';\n" +
//                "        }\n" +
//                "\n" +
//                "        // 显示合同数据\n" +
//                "        function displayContractData(data) {\n" +
//                "            console.log('显示合同数据:', data);\n" +
//                "            \n" +
//                "            const basicInfo = data.basicInfo;\n" +
//                "            const processes = data.processes;\n" +
//                "            \n" +
//                "            // 显示基本信息\n" +
//                "            document.getElementById('basicInfo').innerHTML = `\n" +
//                "                <div class=\"col-6\">\n" +
//                "                    <strong>业务单位:</strong><br>\n" +
//                "                    <span>${basicInfo.businessUnit || '无'}</span>\n" +
//                "                </div>\n" +
//                "                <div class=\"col-6\">\n" +
//                "                    <strong>零件名称:</strong><br>\n" +
//                "                    <span>${basicInfo.partName || '无'}</span>\n" +
//                "                </div>\n" +
//                "                <div class=\"col-6 mt-2\">\n" +
//                "                    <strong>材质:</strong><br>\n" +
//                "                    <span>${basicInfo.material || '无'}</span>\n" +
//                "                </div>\n" +
//                "                <div class=\"col-6 mt-2\">\n" +
//                "                    <strong>数量:</strong><br>\n" +
//                "                    <span>${basicInfo.quantity || '无'}</span>\n" +
//                "                </div>\n" +
//                "                <div class=\"col-6 mt-2\">\n" +
//                "                    <strong>图号:</strong><br>\n" +
//                "                    <span>${basicInfo.drawingNumber || '无'}</span>\n" +
//                "                </div>\n" +
//                "                <div class=\"col-6 mt-2\">\n" +
//                "                    <strong>任务号:</strong><br>\n" +
//                "                    <span>${basicInfo.taskNumber || '无'}</span>\n" +
//                "                </div>\n" +
//                "            `;\n" +
//                "\n" +
//                "            // 显示统计信息\n" +
//                "            document.getElementById('statsInfo').innerHTML = `\n" +
//                "                <div class=\"col-4\">\n" +
//                "                    <div class=\"text-primary\">\n" +
//                "                        <h5>${data.totalProcesses || 0}</h5>\n" +
//                "                        <small>总工序数</small>\n" +
//                "                    </div>\n" +
//                "                </div>\n" +
//                "                <div class=\"col-4\">\n" +
//                "                    <div class=\"text-success\">\n" +
//                "                        <h5>${data.signedCount || 0}</h5>\n" +
//                "                        <small>已签名</small>\n" +
//                "                    </div>\n" +
//                "                </div>\n" +
//                "                <div class=\"col-4\">\n" +
//                "                    <div class=\"text-danger\">\n" +
//                "                        <h5>${data.unsignedCount || 0}</h5>\n" +
//                "                        <small>未签名</small>\n" +
//                "                    </div>\n" +
//                "                </div>\n" +
//                "            `;\n" +
//                "\n" +
//                "            // 显示工序列表\n" +
//                "            const processList = document.getElementById('processList');\n" +
//                "            const processSelect = document.getElementById('processSelect');\n" +
//                "            \n" +
//                "            // 清空工序数据映射\n" +
//                "            processDataMap.clear();\n" +
//                "            \n" +
//                "            if (processes && processes.length > 0) {\n" +
//                "                let processHtml = '';\n" +
//                "                processSelect.innerHTML = '<option value=\"\">请选择工序...</option>';\n" +
//                "                \n" +
//                "                processes.forEach(process => {\n" +
//                "                    const isSigned = process.employeeSign && process.employeeSign !== '' && process.employeeSign !== 'null';\n" +
//                "                    const signClass = isSigned ? 'signed' : 'unsigned';\n" +
//                "                    \n" +
//                "                    processHtml += `\n" +
//                "                        <div class=\"process-item ${signClass}\" data-process-id=\"${process.id}\">\n" +
//                "                            <div class=\"d-flex justify-content-between align-items-start\">\n" +
//                "                                <div class=\"flex-grow-1\">\n" +
//                "                                    <strong>${process.index}. ${process.processName || '未知工序'}</strong>\n" +
//                "                                    <p class=\"mb-1 text-muted\">${process.processContent || '无内容'}</p>\n" +
//                "                                    <div class=\"d-flex\">\n" +
//                "                                        <small class=\"text-muted me-3\">工时: ${process.workHours || '0'}小时</small>\n" +
//                "                                        ${process.completionTime ? `<small class=\"text-muted\">完成时间: ${process.completionTime}</small>` : ''}\n" +
//                "                                    </div>\n" +
//                "                                </div>\n" +
//                "                                <div class=\"text-end ms-2\">\n" +
//                "                                    <span class=\"badge ${isSigned ? 'bg-success' : 'bg-danger'}\">\n" +
//                "                                        ${isSigned ? '已签名' : '未签名'}\n" +
//                "                                    </span>\n" +
//                "                                    ${isSigned ? `<div><small class=\"text-success\">${process.employeeSign}</small></div>` : ''}\n" +
//                "                                </div>\n" +
//                "                            </div>\n" +
//                "                        </div>\n" +
//                "                    `;\n" +
//                "                    \n" +
//                "                    // 存储工序数据，包括id\n" +
//                "                    processDataMap.set(process.processName, {\n" +
//                "                        id: process.id,\n" +
//                "                        processName: process.processName\n" +
//                "                    });\n" +
//                "                    \n" +
//                "                    // 添加到下拉选择框（只添加未签名的工序）\n" +
//                "                    if (!isSigned) {\n" +
//                "                        processSelect.innerHTML += `<option value=\"${process.processName}\" data-process-id=\"${process.id}\">${process.index}. ${process.processName}</option>`;\n" +
//                "                    }\n" +
//                "                });\n" +
//                "                \n" +
//                "                processList.innerHTML = processHtml;\n" +
//                "            } else {\n" +
//                "                processList.innerHTML = '<p class=\"text-muted text-center\">暂无工序数据</p>';\n" +
//                "            }\n" +
//                "        }\n" +
//                "\n" +
//                "        // 处理签名表单提交\n" +
//                "        document.getElementById('signForm').addEventListener('submit', async function(e) {\n" +
//                "            e.preventDefault();\n" +
//                "            \n" +
//                "            const processName = document.getElementById('processSelect').value;\n" +
//                "            const employeeSign = document.getElementById('employeeSign').value;\n" +
//                "            \n" +
//                "            if (!processName || !employeeSign) {\n" +
//                "                alert('请选择工序并输入签名');\n" +
//                "                return;\n" +
//                "            }\n" +
//                "            \n" +
//                "            // 获取对应的id\n" +
//                "            const processData = processDataMap.get(processName);\n" +
//                "            if (!processData || !processData.id) {\n" +
//                "                alert('无法找到对应的工序记录');\n" +
//                "                return;\n" +
//                "            }\n" +
//                "            \n" +
//                "            const processId = processData.id;\n" +
//                "            \n" +
//                "            // 显示加载状态\n" +
//                "            const submitBtn = this.querySelector('button[type=\"submit\"]');\n" +
//                "            const originalText = submitBtn.textContent;\n" +
//                "            submitBtn.innerHTML = '<span class=\"spinner-border spinner-border-sm\" role=\"status\"></span> 提交中...';\n" +
//                "            submitBtn.disabled = true;\n" +
//                "            \n" +
//                "            try {\n" +
//                "                console.log('提交签名:', { processName, employeeSign, processId });\n" +
//                "                const response = await fetch('/mobile/updateProcessSign', {\n" +
//                "                    method: 'POST',\n" +
//                "                    headers: {\n" +
//                "                        'Content-Type': 'application/x-www-form-urlencoded',\n" +
//                "                    },\n" +
//                "                    body: `contractId=${contractId}&processName=${encodeURIComponent(processName)}&employeeSign=${encodeURIComponent(employeeSign)}&id=${processId}`\n" +
//                "                });\n" +
//                "                \n" +
//                "                const result = await response.json();\n" +
//                "                console.log('签名响应:', result);\n" +
//                "                \n" +
//                "                if (result.success) {\n" +
//                "                    alert('签名成功！');\n" +
//                "                    // 重新加载数据\n" +
//                "                    loadContractData();\n" +
//                "                    // 清空表单\n" +
//                "                    document.getElementById('signForm').reset();\n" +
//                "                } else {\n" +
//                "                    alert('签名失败: ' + result.message);\n" +
//                "                }\n" +
//                "            } catch (error) {\n" +
//                "                console.error('签名提交失败:', error);\n" +
//                "                alert('提交失败: ' + error.message);\n" +
//                "            } finally {\n" +
//                "                // 恢复按钮状态\n" +
//                "                submitBtn.textContent = originalText;\n" +
//                "                submitBtn.disabled = false;\n" +
//                "            }\n" +
//                "        });\n" +
//                "\n" +
//                "        // 页面加载时获取数据\n" +
//                "        document.addEventListener('DOMContentLoaded', function() {\n" +
//                "            console.log('页面加载完成，开始加载合同数据');\n" +
//                "            loadContractData();\n" +
//                "        });\n" +
//                "    </script>\n" +
//                "</body>\n" +
//                "</html>";
//    }
//}


package com.example.demo.controller;

import com.example.demo.service.BgdService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.text.SimpleDateFormat;
import java.util.*;

@RestController
@RequestMapping("/mobile")
public class MobileController {

    @Autowired
    private BgdService bgdService;

    /**
     * 移动端合同详情页面 - 不需要登录
     */
    @GetMapping("/contract/{contractId}")
    public void mobileContractPage(@PathVariable String contractId, HttpServletResponse response) {
        try {
            // 设置响应类型为HTML
            response.setContentType("text/html;charset=UTF-8");
            response.setCharacterEncoding("UTF-8");

            PrintWriter out = response.getWriter();
            out.write(getMobileContractHtml(contractId));
            out.flush();
            out.close();

            System.out.println("=== 移动端页面成功返回 ===");
            System.out.println("合同ID: " + contractId);

        } catch (IOException e) {
            e.printStackTrace();
            System.out.println("=== 移动端页面返回失败 ===");
            System.out.println("错误: " + e.getMessage());
        }
    }

    /**
     * 获取合同详细数据的API接口
     */
    @GetMapping("/contractData/{contractId}")
    public Map<String, Object> getContractData(@PathVariable String contractId) {
        try {
            System.out.println("=== 获取合同详细数据 ===");
            System.out.println("合同ID: " + contractId);

            // 根据合同ID获取合同详情
            List<Map<String, Object>> contractDetails = bgdService.getContractDetails(contractId);

            if (contractDetails == null || contractDetails.isEmpty()) {
                System.out.println("未找到合同数据");
                Map<String, Object> errorResult = new HashMap<>();
                errorResult.put("success", false);
                errorResult.put("message", "未找到合同ID: " + contractId + " 对应的数据");
                return errorResult;
            }

            System.out.println("找到 " + contractDetails.size() + " 条工序记录");

            // 构建返回数据
            Map<String, Object> result = buildContractData(contractId, contractDetails);
            result.put("success", true);

            return result;

        } catch (Exception e) {
            e.printStackTrace();
            System.out.println("获取合同数据异常: " + e.getMessage());
            Map<String, Object> errorResult = new HashMap<>();
            errorResult.put("success", false);
            errorResult.put("message", "系统错误: " + e.getMessage());
            return errorResult;
        }
    }

    /**
     * 构建合同数据
     */
    private Map<String, Object> buildContractData(String contractId, List<Map<String, Object>> contractDetails) {
        // 基本信息（从第一条记录获取）
        Map<String, Object> firstProcess = contractDetails.get(0);

        Map<String, Object> basicInfo = new HashMap<>();
        basicInfo.put("contractId", contractId);
        basicInfo.put("businessUnit", firstProcess.get("D") != null ? firstProcess.get("D").toString() : "");
        basicInfo.put("partName", firstProcess.get("G") != null ? firstProcess.get("G").toString() : "");
        basicInfo.put("material", firstProcess.get("F") != null ? firstProcess.get("F").toString() : "");
        basicInfo.put("quantity", firstProcess.get("E") != null ? firstProcess.get("E").toString() : "");
        basicInfo.put("drawingNumber", firstProcess.get("I") != null ? firstProcess.get("I").toString() : "");
        basicInfo.put("taskNumber", firstProcess.get("H") != null ? firstProcess.get("H").toString() : "");

        // 工序列表
        List<Map<String, Object>> processes = new ArrayList<>();
        for (int i = 0; i < contractDetails.size(); i++) {
            Map<String, Object> process = contractDetails.get(i);
            Map<String, Object> processInfo = new HashMap<>();
            processInfo.put("id", process.get("id")); // 添加 id 字段
            processInfo.put("index", i + 1);
            processInfo.put("processName", process.get("J") != null ? process.get("J").toString() : "");
            processInfo.put("processContent", process.get("K") != null ? process.get("K").toString() : "");
            processInfo.put("workHours", process.get("L") != null ? process.get("L").toString() : "");
            processInfo.put("employeeSign", process.get("M") != null ? process.get("M").toString() : "");
            processInfo.put("completionTime", process.get("N") != null ? process.get("N").toString() : "");
            processes.add(processInfo);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("basicInfo", basicInfo);
        result.put("processes", processes);
        result.put("totalProcesses", processes.size());

        // 统计已签名的工序数
        long signedCount = processes.stream()
                .filter(process -> {
                    Object sign = process.get("employeeSign");
                    return sign != null && !sign.toString().isEmpty() && !"null".equals(sign.toString());
                })
                .count();
        result.put("signedCount", signedCount);
        result.put("unsignedCount", processes.size() - signedCount);

        return result;
    }

    @PostMapping("/updateProcessSign")
    public Map<String, Object> updateProcessSign(@RequestParam String contractId,
                                                 @RequestParam String processName,
                                                 @RequestParam String employeeSign,
                                                 @RequestParam Integer id) { // 添加 id 参数
        try {
            System.out.println("=== 移动端签名请求 ===");
            System.out.println("合同ID: " + contractId);
            System.out.println("工序名称: " + processName);
            System.out.println("员工签名: " + employeeSign);
            System.out.println("记录ID: " + id);

            // 验证参数
            if (contractId == null || contractId.trim().isEmpty()) {
                return createErrorResult("合同ID不能为空");
            }
            if (processName == null || processName.trim().isEmpty()) {
                return createErrorResult("工序名称不能为空");
            }
            if (employeeSign == null || employeeSign.trim().isEmpty()) {
                return createErrorResult("员工签名不能为空");
            }
            if (id == null) {
                return createErrorResult("记录ID不能为空");
            }

            // 获取当前时间
            String completionTime = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date());

            // 调用service更新签名信息，传入id
            boolean success = bgdService.updateProcessSign(contractId, processName, employeeSign, completionTime, id);

            if (success) {
                System.out.println("签名更新成功");
                return createSuccessResult("签名成功");
            } else {
                System.out.println("签名更新失败");
                return createErrorResult("签名失败，请检查工序是否存在");
            }

        } catch (Exception e) {
            e.printStackTrace();
            System.out.println("签名异常: " + e.getMessage());
            return createErrorResult("系统错误: " + e.getMessage());
        }
    }

    /**
     * 创建成功结果
     */
    private Map<String, Object> createSuccessResult(String message) {
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("code", 200);
        result.put("message", message);
        return result;
    }

    /**
     * 创建错误结果
     */
    private Map<String, Object> createErrorResult(String message) {
        Map<String, Object> result = new HashMap<>();
        result.put("success", false);
        result.put("code", 500);
        result.put("message", message);
        return result;
    }


    private String getMobileContractHtml(String contractId) {
        return "<!DOCTYPE html>\n" +
                "<html lang=\"zh-CN\">\n" +
                "<head>\n" +
                "    <meta charset=\"UTF-8\">\n" +
                "    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n" +
                "    <title>合同工艺规程</title>\n" +
                "    <link href=\"https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css\" rel=\"stylesheet\">\n" +
                "    <style>\n" +
                "        body { background-color: #f8f9fa; }\n" +
                "        .container { max-width: 800px; margin: 0 auto; padding: 15px; }\n" +
                "        .card { margin-bottom: 15px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }\n" +
                "        .process-item { border-left: 4px solid #007bff; padding-left: 15px; margin-bottom: 10px; background-color: white; padding: 10px; border-radius: 5px; }\n" +
                "        .signed { border-left-color: #28a745; background-color: #f8fff9; }\n" +
                "        .unsigned { border-left-color: #dc3545; background-color: #fff8f8; }\n" +
                "        .stats { font-size: 0.9rem; }\n" +
                "    </style>\n" +
                "</head>\n" +
                "<body>\n" +
                "    <div class=\"container\">\n" +
                "        <div class=\"text-center mb-4\">\n" +
                "            <h4 class=\"text-primary\">合同工艺规程</h4>\n" +
                "            <p class=\"text-muted\">合同ID: <span id=\"contractId\">" + contractId + "</span></p>\n" +
                "        </div>\n" +
                "\n" +
                "        <!-- 基本信息 -->\n" +
                "        <div class=\"card\">\n" +
                "            <div class=\"card-header bg-primary text-white\">\n" +
                "                <h6 class=\"mb-0\">基本信息</h6>\n" +
                "            </div>\n" +
                "            <div class=\"card-body\">\n" +
                "                <div class=\"row\" id=\"basicInfo\">\n" +
                "                    <div class=\"text-center\">\n" +
                "                        <div class=\"spinner-border spinner-border-sm\" role=\"status\"></div>\n" +
                "                        <span>加载中...</span>\n" +
                "                    </div>\n" +
                "                </div>\n" +
                "            </div>\n" +
                "        </div>\n" +
                "\n" +
                "        <!-- 统计信息 -->\n" +
                "        <div class=\"card\">\n" +
                "            <div class=\"card-header bg-info text-white\">\n" +
                "                <h6 class=\"mb-0\">统计信息</h6>\n" +
                "            </div>\n" +
                "            <div class=\"card-body\">\n" +
                "                <div class=\"row text-center stats\" id=\"statsInfo\">\n" +
                "                    <div class=\"col-4\">\n" +
                "                        <div class=\"spinner-border spinner-border-sm\" role=\"status\"></div>\n" +
                "                        <span>加载中...</span>\n" +
                "                    </div>\n" +
                "                </div>\n" +
                "            </div>\n" +
                "        </div>\n" +
                "\n" +
                "        <!-- 工序列表 -->\n" +
                "        <div class=\"card\">\n" +
                "            <div class=\"card-header bg-secondary text-white\">\n" +
                "                <h6 class=\"mb-0\">工序列表</h6>\n" +
                "            </div>\n" +
                "            <div class=\"card-body\">\n" +
                "                <div id=\"processList\">\n" +
                "                    <div class=\"text-center\">\n" +
                "                        <div class=\"spinner-border spinner-border-sm\" role=\"status\"></div>\n" +
                "                        <span>加载工序列表...</span>\n" +
                "                    </div>\n" +
                "                </div>\n" +
                "            </div>\n" +
                "        </div>\n" +
                "\n" +
                "        <!-- 签名区域 -->\n" +
                "        <div class=\"card\">\n" +
                "            <div class=\"card-header bg-warning text-dark\">\n" +
                "                <h6 class=\"mb-0\">工序签名</h6>\n" +
                "            </div>\n" +
                "            <div class=\"card-body\">\n" +
                "                <form id=\"signForm\">\n" +
                "                    <div class=\"mb-3\">\n" +
                "                        <label for=\"processSelect\" class=\"form-label\">选择工序</label>\n" +
                "                        <select class=\"form-select\" id=\"processSelect\">\n" +
                "                            <option value=\"\">请选择工序...</option>\n" +
                "                        </select>\n" +
                "                    </div>\n" +
                "                    <div class=\"mb-3\">\n" +
                "                        <label for=\"employeeSign\" class=\"form-label\">员工签名</label>\n" +
                "                        <input type=\"text\" class=\"form-control\" id=\"employeeSign\" placeholder=\"请输入您的姓名\">\n" +
                "                    </div>\n" +
                "                    <button type=\"submit\" class=\"btn btn-success w-100\">确认签名</button>\n" +
                "                </form>\n" +
                "            </div>\n" +
                "        </div>\n" +
                "    </div>\n" +
                "\n" +
                "    <script>\n" +
                "        const contractId = '" + contractId + "';\n" +
                "        let processDataMap = new Map(); // 用于存储工序数据\n" +
                "\n" +
                "        // 加载合同数据\n" +
                "        async function loadContractData() {\n" +
                "            try {\n" +
                "                console.log('开始加载合同数据，合同ID:', contractId);\n" +
                "                const response = await fetch('/mobile/contractData/' + contractId);\n" +
                "                const result = await response.json();\n" +
                "                console.log('合同数据响应:', result);\n" +
                "                \n" +
                "                if (result.success) {\n" +
                "                    displayContractData(result);\n" +
                "                } else {\n" +
                "                    showError(result.message);\n" +
                "                }\n" +
                "            } catch (error) {\n" +
                "                console.error('加载合同数据失败:', error);\n" +
                "                showError('加载失败: ' + error.message);\n" +
                "            }\n" +
                "        }\n" +
                "\n" +
                "        // 显示错误信息\n" +
                "        function showError(message) {\n" +
                "            document.getElementById('basicInfo').innerHTML = `\n" +
                "                <div class=\"alert alert-danger\">\n" +
                "                    <h6>加载失败</h6>\n" +
                "                    <p class=\"mb-0\">${message}</p>\n" +
                "                </div>\n" +
                "            `;\n" +
                "            document.getElementById('statsInfo').innerHTML = '';\n" +
                "            document.getElementById('processList').innerHTML = '';\n" +
                "        }\n" +
                "\n" +
                "        // 显示合同数据\n" +
                "        function displayContractData(data) {\n" +
                "            console.log('显示合同数据:', data);\n" +
                "            \n" +
                "            const basicInfo = data.basicInfo;\n" +
                "            const processes = data.processes;\n" +
                "            \n" +
                "            // 显示基本信息\n" +
                "            document.getElementById('basicInfo').innerHTML = `\n" +
                "                <div class=\"col-6\">\n" +
                "                    <strong>业务单位:</strong><br>\n" +
                "                    <span>${basicInfo.businessUnit || '无'}</span>\n" +
                "                </div>\n" +
                "                <div class=\"col-6\">\n" +
                "                    <strong>零件名称:</strong><br>\n" +
                "                    <span>${basicInfo.partName || '无'}</span>\n" +
                "                </div>\n" +
                "                <div class=\"col-6 mt-2\">\n" +
                "                    <strong>材质:</strong><br>\n" +
                "                    <span>${basicInfo.material || '无'}</span>\n" +
                "                </div>\n" +
                "                <div class=\"col-6 mt-2\">\n" +
                "                    <strong>数量:</strong><br>\n" +
                "                    <span>${basicInfo.quantity || '无'}</span>\n" +
                "                </div>\n" +
                "                <div class=\"col-6 mt-2\">\n" +
                "                    <strong>图号:</strong><br>\n" +
                "                    <span>${basicInfo.drawingNumber || '无'}</span>\n" +
                "                </div>\n" +
                "                <div class=\"col-6 mt-2\">\n" +
                "                    <strong>任务号:</strong><br>\n" +
                "                    <span>${basicInfo.taskNumber || '无'}</span>\n" +
                "                </div>\n" +
                "            `;\n" +
                "\n" +
                "            // 显示统计信息\n" +
                "            document.getElementById('statsInfo').innerHTML = `\n" +
                "                <div class=\"col-4\">\n" +
                "                    <div class=\"text-primary\">\n" +
                "                        <h5>${data.totalProcesses || 0}</h5>\n" +
                "                        <small>总工序数</small>\n" +
                "                    </div>\n" +
                "                </div>\n" +
                "                <div class=\"col-4\">\n" +
                "                    <div class=\"text-success\">\n" +
                "                        <h5>${data.signedCount || 0}</h5>\n" +
                "                        <small>已签名</small>\n" +
                "                    </div>\n" +
                "                </div>\n" +
                "                <div class=\"col-4\">\n" +
                "                    <div class=\"text-danger\">\n" +
                "                        <h5>${data.unsignedCount || 0}</h5>\n" +
                "                        <small>未签名</small>\n" +
                "                    </div>\n" +
                "                </div>\n" +
                "            `;\n" +
                "\n" +
                "            // 显示工序列表\n" +
                "            const processList = document.getElementById('processList');\n" +
                "            const processSelect = document.getElementById('processSelect');\n" +
                "            \n" +
                "            // 清空工序数据映射\n" +
                "            processDataMap.clear();\n" +
                "            \n" +
                "            if (processes && processes.length > 0) {\n" +
                "                let processHtml = '';\n" +
                "                processSelect.innerHTML = '<option value=\"\">请选择工序...</option>';\n" +
                "                \n" +
                "                processes.forEach(process => {\n" +
                "                    const isSigned = process.employeeSign && process.employeeSign !== '' && process.employeeSign !== 'null';\n" +
                "                    const signClass = isSigned ? 'signed' : 'unsigned';\n" +
                "                    \n" +
                "                    processHtml += `\n" +
                "                        <div class=\"process-item ${signClass}\" data-process-id=\"${process.id}\">\n" +
                "                            <div class=\"d-flex justify-content-between align-items-start\">\n" +
                "                                <div class=\"flex-grow-1\">\n" +
                "                                    <strong>${process.index}. ${process.processName || '未知工序'}</strong>\n" +
                "                                    <p class=\"mb-1 text-muted\">${process.processContent || '无内容'}</p>\n" +
                "                                    <div class=\"d-flex\">\n" +
                "                                        <small class=\"text-muted me-3\">工时: ${process.workHours || '0'}小时</small>\n" +
                "                                        ${process.completionTime ? `<small class=\"text-muted\">完成时间: ${process.completionTime}</small>` : ''}\n" +
                "                                    </div>\n" +
                "                                </div>\n" +
                "                                <div class=\"text-end ms-2\">\n" +
                "                                    <span class=\"badge ${isSigned ? 'bg-success' : 'bg-danger'}\">\n" +
                "                                        ${isSigned ? '已签名' : '未签名'}\n" +
                "                                    </span>\n" +
                "                                    ${isSigned ? `<div><small class=\"text-success\">${process.employeeSign}</small></div>` : ''}\n" +
                "                                </div>\n" +
                "                            </div>\n" +
                "                        </div>\n" +
                "                    `;\n" +
                "                    \n" +
                "                    // 创建唯一的键，结合工序名称和ID\n" +
                "                    const processKey = `${process.processName}_${process.id}`;\n" +
                "                    \n" +
                "                    // 存储工序数据，使用唯一键\n" +
                "                    processDataMap.set(processKey, {\n" +
                "                        id: process.id,\n" +
                "                        processName: process.processName,\n" +
                "                        processContent: process.processContent,\n" +
                "                        index: process.index\n" +
                "                    });\n" +
                "                    \n" +
                "                    // 添加到下拉选择框（只添加未签名的工序）\n" +
                "                    if (!isSigned) {\n" +
                "                        // 在下拉选项中显示更多信息以区分相同工序名称\n" +
                "                        const displayText = processes.filter(p => p.processName === process.processName).length > 1 \n" +
                "                            ? `${process.index}. ${process.processName} (${process.processContent.substring(0, 20)}...)`\n" +
                "                            : `${process.index}. ${process.processName}`;\n" +
                "                        \n" +
                "                        processSelect.innerHTML += `<option value=\"${processKey}\" data-process-id=\"${process.id}\">${displayText}</option>`;\n" +
                "                    }\n" +
                "                });\n" +
                "                \n" +
                "                processList.innerHTML = processHtml;\n" +
                "            } else {\n" +
                "                processList.innerHTML = '<p class=\"text-muted text-center\">暂无工序数据</p>';\n" +
                "            }\n" +
                "        }\n" +
                "\n" +
                "        // 处理签名表单提交\n" +
                "        document.getElementById('signForm').addEventListener('submit', async function(e) {\n" +
                "            e.preventDefault();\n" +
                "            \n" +
                "            const processKey = document.getElementById('processSelect').value;\n" +
                "            const employeeSign = document.getElementById('employeeSign').value;\n" +
                "            \n" +
                "            if (!processKey || !employeeSign) {\n" +
                "                alert('请选择工序并输入签名');\n" +
                "                return;\n" +
                "            }\n" +
                "            \n" +
                "            // 从映射中获取工序数据\n" +
                "            const processData = processDataMap.get(processKey);\n" +
                "            if (!processData || !processData.id) {\n" +
                "                alert('无法找到对应的工序记录');\n" +
                "                return;\n" +
                "            }\n" +
                "            \n" +
                "            const processId = processData.id;\n" +
                "            const processName = processData.processName;\n" +
                "            \n" +
                "            // 显示加载状态\n" +
                "            const submitBtn = this.querySelector('button[type=\"submit\"]');\n" +
                "            const originalText = submitBtn.textContent;\n" +
                "            submitBtn.innerHTML = '<span class=\"spinner-border spinner-border-sm\" role=\"status\"></span> 提交中...';\n" +
                "            submitBtn.disabled = true;\n" +
                "            \n" +
                "            try {\n" +
                "                console.log('提交签名:', { processName, employeeSign, processId });\n" +
                "                const response = await fetch('/mobile/updateProcessSign', {\n" +
                "                    method: 'POST',\n" +
                "                    headers: {\n" +
                "                        'Content-Type': 'application/x-www-form-urlencoded',\n" +
                "                    },\n" +
                "                    body: `contractId=${contractId}&processName=${encodeURIComponent(processName)}&employeeSign=${encodeURIComponent(employeeSign)}&id=${processId}`\n" +
                "                });\n" +
                "                \n" +
                "                const result = await response.json();\n" +
                "                console.log('签名响应:', result);\n" +
                "                \n" +
                "                if (result.success) {\n" +
                "                    alert('签名成功！');\n" +
                "                    // 重新加载数据\n" +
                "                    loadContractData();\n" +
                "                    // 清空表单\n" +
                "                    document.getElementById('signForm').reset();\n" +
                "                } else {\n" +
                "                    alert('签名失败: ' + result.message);\n" +
                "                }\n" +
                "            } catch (error) {\n" +
                "                console.error('签名提交失败:', error);\n" +
                "                alert('提交失败: ' + error.message);\n" +
                "            } finally {\n" +
                "                // 恢复按钮状态\n" +
                "                submitBtn.textContent = originalText;\n" +
                "                submitBtn.disabled = false;\n" +
                "            }\n" +
                "        });\n" +
                "\n" +
                "        // 页面加载时获取数据\n" +
                "        document.addEventListener('DOMContentLoaded', function() {\n" +
                "            console.log('页面加载完成，开始加载合同数据');\n" +
                "            loadContractData();\n" +
                "        });\n" +
                "    </script>\n" +
                "</body>\n" +
                "</html>";
    }
}