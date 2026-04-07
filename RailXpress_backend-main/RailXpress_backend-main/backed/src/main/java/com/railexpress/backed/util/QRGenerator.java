package com.railexpress.backed.util;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.client.j2se.MatrixToImageWriter;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.file.FileSystems;
import java.nio.file.Path;
import java.util.Map;
import com.fasterxml.jackson.databind.ObjectMapper;

public class QRGenerator {

    /**
     * Generate PNG bytes for a QR that encodes the given text.
     */
    public static byte[] generateQRCodePngBytes(String text, int width, int height) throws WriterException, IOException {
        QRCodeWriter qrCodeWriter = new QRCodeWriter();
        BitMatrix bitMatrix = qrCodeWriter.encode(text, BarcodeFormat.QR_CODE, width, height);
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        MatrixToImageWriter.writeToStream(bitMatrix, "PNG", baos);
        return baos.toByteArray();
    }

    /**
     * Convenience: convert a Map to JSON string then to QR PNG bytes
     */
    public static byte[] generateQRCodePngBytesFromMap(Map<String, Object> map, int width, int height) throws Exception {
        ObjectMapper om = new ObjectMapper();
        String json = om.writeValueAsString(map);
        return generateQRCodePngBytes(json, width, height);
    }
}
