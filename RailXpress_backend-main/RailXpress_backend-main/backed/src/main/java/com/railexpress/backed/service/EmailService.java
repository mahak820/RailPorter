package com.railexpress.backed.service;

import com.railexpress.backed.model.Booking;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    /**
     * Sends booking confirmation email.
     * If qrPngBytes is null, message is sent without attachment.
     */
    public void sendBookingConfirmation(String toEmail, Booking booking, byte[] qrPngBytes) throws Exception {

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper =
                new MimeMessageHelper(message, qrPngBytes != null, "utf-8");

        helper.setTo(toEmail);
        helper.setSubject("RailXpress Booking Confirmation - " + booking.getBookingRef());

        // Basic HTML body
        String html = """
                <h2>Your Booking is Confirmed!</h2>
                <p><strong>Booking Ref:</strong> %s</p>
                <p><strong>From:</strong> %s</p>
                <p><strong>To:</strong> %s</p>
                <p><strong>Date:</strong> %s</p>
                <p><strong>Amount:</strong> ₹%s</p>
                <p>Thank you for using RailXpress!</p>
                """
                .formatted(
                        booking.getBookingRef(),
                        booking.getDepartureStation(),
                        booking.getArrivalStation(),
                        booking.getDateOfTransport(),
                        booking.getFee()
                );

        helper.setText(html, true); // send HTML body

        // Attach QR if available
        if (qrPngBytes != null) {
            helper.addAttachment("booking-qr.png",
                    new org.springframework.core.io.ByteArrayResource(qrPngBytes));
        }

        mailSender.send(message);
        System.out.println("Booking confirmation email sent to " + toEmail);
    }
}
