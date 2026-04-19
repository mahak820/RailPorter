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

    /**
     * Sends a status-update email whenever a booking's status changes
     * (e.g., PICKED_UP, IN_TRANSIT, DELIVERED).
     */
    public void sendStatusUpdate(String toEmail, Booking booking, String status,
                                 String location, String notes) throws Exception {

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, false, "utf-8");

        helper.setTo(toEmail);
        helper.setSubject("RailPorter Update - " + friendlyStatus(status) + " - " + booking.getBookingRef());

        String html = """
                <div style="font-family: Arial, sans-serif; max-width: 560px; margin: auto;">
                  <h2 style="color: #0f172a;">%s</h2>
                  <p style="color: #475569;">%s</p>

                  <div style="background: #f1f5f9; padding: 16px; border-radius: 8px; margin-top: 16px;">
                    <p style="margin: 4px 0;"><strong>Booking Ref:</strong> %s</p>
                    <p style="margin: 4px 0;"><strong>From:</strong> %s</p>
                    <p style="margin: 4px 0;"><strong>To:</strong> %s</p>
                    <p style="margin: 4px 0;"><strong>Current Status:</strong>
                       <span style="background: #10b981; color: #fff; padding: 2px 10px; border-radius: 12px; font-size: 13px;">%s</span>
                    </p>
                    %s
                    %s
                  </div>

                  <p style="color: #64748b; font-size: 12px; margin-top: 20px;">
                    Track your luggage anytime with this booking reference.
                  </p>
                </div>
                """
                .formatted(
                        friendlyStatus(status),
                        statusDescription(status),
                        booking.getBookingRef(),
                        booking.getDepartureStation(),
                        booking.getArrivalStation(),
                        status,
                        (location != null && !location.isBlank())
                                ? "<p style=\"margin: 4px 0;\"><strong>Location:</strong> " + location + "</p>"
                                : "",
                        (notes != null && !notes.isBlank())
                                ? "<p style=\"margin: 4px 0;\"><strong>Notes:</strong> " + notes + "</p>"
                                : ""
                );

        helper.setText(html, true);
        mailSender.send(message);
        System.out.println("Status-update email sent to " + toEmail + " (" + status + ")");
    }

    private static String friendlyStatus(String status) {
        if (status == null) return "Booking Update";
        switch (status.toUpperCase()) {
            case "CREATED":    return "Booking Confirmed";
            case "PICKED_UP":  return "Luggage Picked Up";
            case "IN_TRANSIT": return "Luggage In Transit";
            case "DELIVERED":  return "Luggage Delivered";
            case "DELAYED":    return "Shipment Delayed";
            case "CANCELLED":  return "Booking Cancelled";
            default:           return "Booking Update - " + status;
        }
    }

    private static String statusDescription(String status) {
        if (status == null) return "Your booking status has been updated.";
        switch (status.toUpperCase()) {
            case "PICKED_UP":  return "Great news — our team has collected your luggage from the departure station.";
            case "IN_TRANSIT": return "Your luggage is on its way. It has been loaded onto the train.";
            case "DELIVERED":  return "Your luggage has arrived and is ready for pickup at the destination.";
            case "DELAYED":    return "We wanted to let you know your shipment is facing a short delay. We'll update you soon.";
            case "CANCELLED":  return "This booking has been cancelled. Please contact support if this wasn't expected.";
            default:           return "Your booking status has been updated.";
        }
    }
}
