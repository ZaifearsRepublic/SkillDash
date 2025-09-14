import { NextRequest, NextResponse } from 'next/server';
import { randomInt } from 'crypto';

// This is a simple in-memory store for OTPs for demonstration.
// In a real production application, you should use a more persistent store
// like Redis, or a database (e.g., Firestore) to store OTPs with an expiration time.
const otpStore: Record<string, { otp: string; timestamp: number }> = {};

export async function POST(req: NextRequest) {
  try {
    const { action, email, password, otp } = await req.json();

    switch (action) {
      case 'generate-otp': {
        if (!email) {
          return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
        }
        
        const generatedOtp = randomInt(100000, 999999).toString();
        
        // Store the OTP with a timestamp (expires in 5 minutes)
        otpStore[email] = { otp: generatedOtp, timestamp: Date.now() };

        console.log(`Generated OTP for ${email}: ${generatedOtp}`);

        // ** SIMULATION **
        // In a real app, you would use a service like SendGrid, Resend, or Nodemailer
        // to send the `generatedOtp` to the user's email address.
        // For this free example, we return the OTP in the response for the user to see.
        return NextResponse.json({ 
          message: 'OTP generated successfully. In a real app, this would be sent to your email.',
          otp: generatedOtp // Return OTP for simulation purposes
        });
      }

      case 'verify-otp': {
        if (!email || !otp) {
          return NextResponse.json({ error: 'Email and OTP are required.' }, { status: 400 });
        }

        const storedOtpData = otpStore[email];
        const OTP_EXPIRATION_MS = 5 * 60 * 1000; // 5 minutes

        if (!storedOtpData) {
          return NextResponse.json({ error: 'No OTP found for this email. Please request a new one.' }, { status: 400 });
        }

        // Check for expiration
        if (Date.now() - storedOtpData.timestamp > OTP_EXPIRATION_MS) {
          delete otpStore[email]; // Clean up expired OTP
          return NextResponse.json({ error: 'OTP has expired. Please request a new one.' }, { status: 400 });
        }

        // Check if OTP matches
        if (storedOtpData.otp !== otp) {
          return NextResponse.json({ error: 'Invalid OTP.' }, { status: 400 });
        }

        // OTP is correct, clean it up
        delete otpStore[email];

        return NextResponse.json({ message: 'OTP verified successfully.' });
      }

      default:
        return NextResponse.json({ error: 'Invalid action.' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Auth API Error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
