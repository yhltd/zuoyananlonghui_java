package com.example.demo.controller;

import com.example.demo.service.BgdService;
import com.example.demo.util.ResultInfo;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.OutputStream;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.google.zxing.client.j2se.MatrixToImageWriter;

@RestController
@RequestMapping("/qr")
public class QrCodeController {

    @Autowired
    private BgdService bgdService;

    /**
     * 生成合同二维码信息
     */
    @PostMapping("/generateContractQR")
    public ResultInfo generateContractQR(@RequestParam String contractId, HttpServletRequest request) {
        try {
            // 生成二维码内容
            String qrContent = generateQRContent(contractId, request);

            // 生成二维码图片（Base64格式返回）
            String qrCodeBase64 = generateQRCodeImage(qrContent, 300, 300);

            // 返回二维码数据 - 使用兼容的Map创建方式
            Map<String, Object> resultMap = new HashMap<>();
            resultMap.put("qrContent", qrContent);
            resultMap.put("qrCodeImage", qrCodeBase64);

            return ResultInfo.success("生成成功", resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            return ResultInfo.error("生成二维码失败");
        }
    }

    /**
     * 直接返回二维码图片
     */
    @GetMapping("/generateContractQRImage")
    public void generateContractQRImage(@RequestParam String contractId,
                                        HttpServletRequest request,
                                        HttpServletResponse response) {
        try {
            String qrContent = generateQRContent(contractId, request);

            response.setContentType("image/png");
            OutputStream outputStream = response.getOutputStream();

            generateQRCodeImageStream(qrContent, 300, 300, outputStream);
            outputStream.flush();
            outputStream.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    /**
     * 手机端访问的合同详情接口
     */
    @GetMapping("/contract/{contractId}")
    public ResultInfo getContractForMobile(@PathVariable String contractId) {
        try {
            // 获取合同详情
            List<Map<String, Object>> contractDetails = bgdService.getContractDetails(contractId);
            if (contractDetails != null && !contractDetails.isEmpty()) {
                return ResultInfo.success("获取成功", contractDetails);
            } else {
                return ResultInfo.error(404, "未找到合同信息");
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResultInfo.error("系统错误");
        }
    }

    /**
     * 生成二维码内容
     */
    private String generateQRContent(String contractId, HttpServletRequest request) {
        // 获取当前服务器的实际地址
        String serverUrl = getServerUrl(request);

        // 生成实际的 URL
        String qrUrl = serverUrl + "/qr/contract/" + contractId;
        System.out.println("生成的二维码URL: " + qrUrl);

        return qrUrl;
    }

    /**
     * 生成二维码图片并返回Base64字符串
     */
    private String generateQRCodeImage(String text, int width, int height) {
        try {
            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            BitMatrix bitMatrix = qrCodeWriter.encode(text, BarcodeFormat.QR_CODE, width, height);

            java.io.ByteArrayOutputStream pngOutputStream = new java.io.ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", pngOutputStream);
            byte[] pngData = pngOutputStream.toByteArray();

            return Base64.getEncoder().encodeToString(pngData);
        } catch (WriterException e) {
            e.printStackTrace();
            throw new RuntimeException("生成二维码失败", e);
        } catch (java.io.IOException e) {
            e.printStackTrace();
            throw new RuntimeException("输出二维码图片失败", e);
        }
    }

    /**
     * 生成二维码图片到输出流
     */
    private void generateQRCodeImageStream(String text, int width, int height, OutputStream outputStream)
            throws WriterException, java.io.IOException {
        QRCodeWriter qrCodeWriter = new QRCodeWriter();
        BitMatrix bitMatrix = qrCodeWriter.encode(text, BarcodeFormat.QR_CODE, width, height);
        MatrixToImageWriter.writeToStream(bitMatrix, "PNG", outputStream);
    }

    /**
     * 获取服务器URL
     */
    private String getServerUrl(HttpServletRequest request) {
        String scheme = request.getScheme(); // http 或 https
        String serverName = request.getServerName(); // 域名或IP
        int serverPort = request.getServerPort(); // 端口
        String contextPath = request.getContextPath(); // 应用上下文路径

        // 构建基础URL
        StringBuilder baseUrl = new StringBuilder();
        baseUrl.append(scheme).append("://").append(serverName);

        // 如果是默认端口，则不需要添加端口号
        if (!((scheme.equals("http") && serverPort == 80) ||
                (scheme.equals("https") && serverPort == 443))) {
            baseUrl.append(":").append(serverPort);
        }

        // 添加上下文路径
        if (contextPath != null && !contextPath.isEmpty()) {
            baseUrl.append(contextPath);
        }

        return baseUrl.toString();
    }
}