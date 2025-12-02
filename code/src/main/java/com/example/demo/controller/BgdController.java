package com.example.demo.controller;

import com.example.demo.entity.UserInfo;
import com.example.demo.service.BgdService;
import com.example.demo.util.GsonUtil;
import com.example.demo.util.ResultInfo;
import com.example.demo.util.SessionUtil;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.*;

@Slf4j
@RestController
@RequestMapping("/bgd")
public class BgdController {

    @Autowired
    private BgdService bgdService;

    /**
     * 查询工艺规程数据 - 根据未完成合同动态查询
     */
    @RequestMapping("/getList")
    public ResultInfo getList(HttpSession session) {
//        UserInfo userInfo = GsonUtil.toEntity(SessionUtil.getToken(session), UserInfo.class);
        try {
            List<Map<String, Object>> getList = bgdService.getList();
            return ResultInfo.success("获取成功", getList);
        } catch (Exception e) {
            e.printStackTrace();
            log.error("获取失败：{}", e.getMessage());
            return ResultInfo.error("错误!");
        }
    }

    /**
     * 生成合同二维码信息 - 包含完整数据的URL链接
     */
    @PostMapping("/generateContractQR")
    public ResultInfo generateContractQR(@RequestParam String contractId, HttpServletRequest request) {
        try {
            // 生成包含完整数据的URL - 使用独立的移动端页面
            String qrContent = generateQRContentWithUrl(contractId, request);

            System.out.println("=== 二维码调试信息 ===");
            System.out.println("二维码URL: " + qrContent);
            System.out.println("内容长度: " + qrContent.length() + " 字符");
            System.out.println("=== 结束调试信息 ===");

            // 生成二维码图片
            String qrCodeBase64 = generateQRCodeImage(qrContent, 300, 300);

            // 返回结果
            Map<String, Object> resultMap = new HashMap<>();
            resultMap.put("qrContent", qrContent);
            resultMap.put("qrCodeImage", qrCodeBase64);

            return ResultInfo.success("生成成功", resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            return ResultInfo.error("生成二维码失败: " + e.getMessage());
        }
    }

    /**
     * 生成包含完整数据URL的二维码内容
     */
    private String generateQRContentWithUrl(String contractId, HttpServletRequest request) {
        // 获取服务器地址（使用局域网IP，确保手机可以访问）
        String serverUrl = getServerUrl(request);

        // 生成访问完整数据的URL - 使用独立的移动端页面
        String dataUrl = serverUrl + "/mobile/contract/" + contractId;

        return dataUrl;
    }

    /**
     * 获取服务器URL - 使用局域网IP
     */
    private String getServerUrl(HttpServletRequest request) {
        try {
            // 获取局域网IP
            String localIp = getLocalIP();
            int serverPort = request.getServerPort();

            StringBuilder baseUrl = new StringBuilder();
            baseUrl.append("http://").append(localIp);

            if (serverPort != 80) {
                baseUrl.append(":").append(serverPort);
            }

            String contextPath = request.getContextPath();
            if (contextPath != null && !contextPath.isEmpty()) {
                baseUrl.append(contextPath);
            }

            return baseUrl.toString();
        } catch (Exception e) {
            // 备用方案：使用请求中的信息
            return request.getRequestURL().toString().replace(request.getRequestURI(), request.getContextPath());
        }
    }

    /**
     * 获取本机局域网IP
     */
    private String getLocalIP() {
        try {
            java.util.Enumeration<java.net.NetworkInterface> interfaces = java.net.NetworkInterface.getNetworkInterfaces();
            while (interfaces.hasMoreElements()) {
                java.net.NetworkInterface networkInterface = interfaces.nextElement();
                if (networkInterface.isLoopback() || !networkInterface.isUp()) {
                    continue;
                }

                java.util.Enumeration<java.net.InetAddress> addresses = networkInterface.getInetAddresses();
                while (addresses.hasMoreElements()) {
                    java.net.InetAddress address = addresses.nextElement();
                    if (address instanceof java.net.Inet4Address && !address.isLoopbackAddress()) {
                        String ip = address.getHostAddress();
                        // 优先选择常见的局域网网段
                        if (ip.startsWith("192.168.") || ip.startsWith("10.") || ip.startsWith("172.")) {
                            System.out.println("使用局域网IP: " + ip);
                            return ip;
                        }
                    }
                }
            }
        } catch (java.net.SocketException e) {
            e.printStackTrace();
        }
        return "localhost";
    }

    /**
     * 返回移动端合同详情页面数据（JSON格式）
     */
    @GetMapping(value = "/mobileContractData/{contractId}")
    public ResultInfo getMobileContractData(@PathVariable String contractId) {
        try {
            System.out.println("移动端请求合同数据，合同ID: " + contractId);

            // 根据合同ID获取合同详情
            List<Map<String, Object>> contractDetails = bgdService.getContractDetails(contractId);

            if (contractDetails == null || contractDetails.isEmpty()) {
                return ResultInfo.error("未找到合同ID: " + contractId + " 对应的数据");
            }

            // 构建返回数据
            Map<String, Object> result = new HashMap<>();
            result.put("contractId", contractId);

            // 基本信息
            if (contractDetails.size() > 0) {
                Map<String, Object> firstProcess = contractDetails.get(0);
                result.put("businessUnit", firstProcess.get("D"));
                result.put("partName", firstProcess.get("G"));
                result.put("material", firstProcess.get("F"));
                result.put("quantity", firstProcess.get("E"));
                result.put("drawingNumber", firstProcess.get("I"));
                result.put("taskNumber", firstProcess.get("H"));
            }

            // 工序列表
            List<Map<String, Object>> processes = new ArrayList<>();
            for (int i = 0; i < contractDetails.size(); i++) {
                Map<String, Object> process = contractDetails.get(i);
                Map<String, Object> processInfo = new HashMap<>();
                processInfo.put("index", i + 1);
                processInfo.put("processName", process.get("J"));
                processInfo.put("processContent", process.get("K"));
                processInfo.put("workHours", process.get("L"));
                processInfo.put("employeeSign", process.get("M"));
                processInfo.put("completionTime", process.get("N"));
                processes.add(processInfo);
            }
            result.put("processes", processes);

            return ResultInfo.success("获取成功", result);
        } catch (Exception e) {
            e.printStackTrace();
            return ResultInfo.error("系统错误: " + e.getMessage());
        }
    }

    /**
     * 生成二维码图片并返回Base64字符串
     */
    private String generateQRCodeImage(String text, int width, int height) {
        try {
            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            BitMatrix bitMatrix = qrCodeWriter.encode(text, BarcodeFormat.QR_CODE, width, height);

            ByteArrayOutputStream pngOutputStream = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", pngOutputStream);
            byte[] pngData = pngOutputStream.toByteArray();

            return Base64.getEncoder().encodeToString(pngData);
        } catch (WriterException | IOException e) {
            e.printStackTrace();
            throw new RuntimeException("生成二维码失败", e);
        }
    }

    @PostMapping("/deductWorkHours")
    public ResultInfo deductWorkHours(@RequestParam Integer id,
                                      @RequestParam Double newHours,
                                      @RequestParam Double deductHours,
                                      @RequestParam String deductReason) {
        try {
            System.out.println("扣工时请求: ID=" + id + ", 新工时=" + newHours + ", 扣除=" + deductHours + ", 原因=" + deductReason);

            // 调用service更新工时
            boolean success = bgdService.deductWorkHours(id, newHours, deductHours, deductReason);

            if (success) {
                return ResultInfo.success("扣工时成功");
            } else {
                return ResultInfo.error("扣工时失败");
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResultInfo.error("系统错误: " + e.getMessage());
        }
    }

    @PostMapping("/resetProcess")
    public ResultInfo resetProcess(@RequestParam Integer id,
                                   @RequestParam String resetReason) {
        try {
            System.out.println("工序复工请求: ID=" + id + ", 原因=" + resetReason);

            // 调用service清空签名和完工时间
            boolean success = bgdService.resetProcess(id, resetReason);

            if (success) {
                return ResultInfo.success("工序复工成功");
            } else {
                return ResultInfo.error("工序复工失败");
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResultInfo.error("系统错误: " + e.getMessage());
        }
    }
}